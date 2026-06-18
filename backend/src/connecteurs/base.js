/**
 * @module base
 * Classe abstraite `BaseConnecteur`.
 *
 * Chaque connecteur OSINT étend cette classe et override les méthodes
 * `rechercher`, `detailler`, `listerLiens`.
 *
 * La méthode `_appelHttp` gère automatiquement :
 * - la lecture du cache disque (hit → court-circuit)
 * - le rate-limit token-bucket (miss → attend si bucket vide)
 * - l'appel fetch natif Node 20 avec User-Agent et AbortController
 * - la validation anti-SSRF sur l'URL de destination (M-03)
 * - l'écriture en cache après succès
 */

import { obtenirOuCalculer, hashCle } from './cache.js'
import { consommer, creerBucket } from './rate-limit.js'

// ---------------------------------------------------------------------------
// M-03 — Whitelist des hôtes autorisés par connecteur
// Toute requête vers un hôte non listé ou vers une IP privée RFC1918 est rejetée.
// ---------------------------------------------------------------------------

/** @type {Record<string, Array<string|RegExp>>} */
const HOSTS_AUTORISES = {
  // query.wikidata.org : endpoint SPARQL ; www.wikidata.org : API REST wbsearchentities
  wikidata: ['query.wikidata.org', 'www.wikidata.org'],
  rdap: [/^rdap\..+/i, 'rdap.iana.org', 'data.iana.org'],
  'recherche-entreprises': ['recherche-entreprises.api.gouv.fr'],
  'ign-ban': ['api-adresse.data.gouv.fr'],
  'ign-dvf': ['app.dvf.etalab.gouv.fr', 'api.cquest.org'],
  'ign-carto-cadastre': ['apicarto.ign.fr'],
  'ign-carto-gpu': ['apicarto.ign.fr'],
  'ign-geoplateforme': ['data.geopf.fr'],
  // --- Nouveaux connecteurs OSINT (ADR-012) ---
  hatvp: ['www.hatvp.fr', 'hatvp.fr'],
  'transparence-sante': ['transparence.sante.gouv.fr', 'www.data.gouv.fr', 'static.data.gouv.fr'],
  bodacc: ['bodacc-datadila.opendatasoft.com'],
  parlementaires: ['www.nosdeputes.fr', 'www.nossenateurs.fr'],
  dataesr: ['data.enseignementsup-recherche.gouv.fr'],
  // --- Connecteurs leaks + sanctions + presse (ADR-013) ---
  'icij-offshore-leaks': ['offshoreleaks-data.icij.org'],
  'open-sanctions': ['data.opensanctions.org'],
  anticor: ['www.anticor.org', 'anticor.org'],
  'cour-des-comptes': ['www.ccomptes.fr'],
  // wikileaks et ddosecrets : stubs sans appel réseau — pas d'entrée HOSTS_AUTORISES
  // --- Connecteurs sphère associative + professionnels de santé (ADR-014) ---
  associations: ['media.interieur.gouv.fr', 'www.data.gouv.fr'],
  'annuaire-sante': ['www.data.gouv.fr', 'static.data.gouv.fr'],
  // --- Connecteur mondial : identifiants d'entités juridiques (ADR-021) ---
  gleif: ['api.gleif.org'],
  // --- Connecteur européen : registre de transparence UE / lobbying (ADR-022) ---
  'eu-transparence': ['ec.europa.eu', 'transparency-register.europa.eu'],
  // --- Connecteur européen : bénéficiaires du budget UE / FTS (ADR-024) ---
  'eu-fts': ['ec.europa.eu'],
  // --- Connecteur européen : marchés publics UE / TED (ADR-025) ---
  ted: ['api.ted.europa.eu'],
}

/**
 * Vérifie qu'un hostname est dans la whitelist du connecteur.
 *
 * @param {string} connecteurNom
 * @param {string} hostname
 * @returns {boolean}
 */
function estHostAutorise(connecteurNom, hostname) {
  const liste = HOSTS_AUTORISES[connecteurNom] ?? []
  return liste.some((h) => (h instanceof RegExp ? h.test(hostname) : h === hostname))
}

/**
 * Vérifie qu'un hostname ne correspond pas à une IP privée RFC1918 / loopback / link-local.
 * Protège contre les redirections SSRF vers l'infrastructure interne.
 *
 * Plages couvertes :
 * - 10.0.0.0/8
 * - 172.16.0.0/12
 * - 192.168.0.0/16
 * - 169.254.0.0/16 (link-local)
 * - 127.0.0.0/8 (loopback)
 * - ::1 (IPv6 loopback)
 * - fc00::/7 (IPv6 ULA)
 * - fe80::/10 (IPv6 link-local)
 *
 * @param {string} hostname
 * @returns {boolean}
 */
function estIpPrivee(hostname) {
  // Couvre : 10/8, 172.16-31/12, 192.168/16, 169.254/16, 127/8, ::1, fc::/7 (ULA), fe80::/10
  return /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|127\.|::1$|fc[0-9a-f]{2}:|fd[0-9a-f]{2}:|fe80:)/i.test(
    hostname,
  )
}

/**
 * Valide l'URL de destination avant tout appel HTTP.
 * Lève une Error si l'URL cible un hôte non autorisé ou une IP privée.
 *
 * @param {string} connecteurNom - Nom du connecteur pour la whitelist
 * @param {string} urlStr - URL à valider
 * @throws {Error} Si la destination est interdite
 */
function validerUrlDestination(connecteurNom, urlStr) {
  let url
  try {
    url = new URL(urlStr)
  } catch {
    throw new Error(`[${connecteurNom}] URL malformée : ${urlStr}`)
  }

  const { hostname } = url

  if (estIpPrivee(hostname)) {
    throw new Error(`[${connecteurNom}] SSRF bloqué — destination IP privée : ${hostname}`)
  }

  if (!estHostAutorise(connecteurNom, hostname)) {
    throw new Error(
      `[${connecteurNom}] SSRF bloqué — hôte non autorisé : ${hostname}. ` +
        `Ajouter à HOSTS_AUTORISES['${connecteurNom}'] si légitime.`,
    )
  }
}

export class BaseConnecteur {
  /**
   * @param {{
   *   nom: string,
   *   version: string,
   *   baseUrl: string,
   *   rateLimit: { debit: number, capacite: number },
   *   ttlCache?: number,
   *   timeoutMs?: number
   * }} config
   */
  constructor({ nom, version, baseUrl, rateLimit, ttlCache, timeoutMs }) {
    this.nom = nom
    this.version = version
    this.baseUrl = baseUrl
    this.ttlCache = ttlCache ?? (Number(process.env.CACHE_TTL_MS) || 86_400_000)
    this.timeoutMs = timeoutMs ?? 25_000

    creerBucket(nom, rateLimit)
  }

  /**
   * Recherche des entités correspondant à une requête textuelle.
   *
   * @param {string} _query - Terme de recherche
   * @param {object} [_options] - Options spécifiques au connecteur
   * @returns {Promise<{ resultats: import('./normaliseur.js').EntiteNormalisee[], source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(_query, _options) {
    throw new Error(`[${this.nom}] rechercher() non implémenté`)
  }

  /**
   * Retourne le détail d'une entité par son identifiant.
   *
   * @param {string} _id - Identifiant propre à la source (QID, SIREN, domaine…)
   * @returns {Promise<{ entite: import('./normaliseur.js').EntiteNormalisee, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(_id) {
    throw new Error(`[${this.nom}] detailler() non implémenté`)
  }

  /**
   * Liste les liens suggérés depuis une entité.
   *
   * @param {string} _id - Identifiant propre à la source
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(_id) {
    throw new Error(`[${this.nom}] listerLiens() non implémenté`)
  }

  /**
   * Appel HTTP avec cache, rate-limit, User-Agent et validation anti-SSRF automatiques.
   *
   * L'URL est validée contre la whitelist des hôtes autorisés (M-03) avant toute
   * requête. Si la réponse est une redirection suivie, l'URL finale est également
   * validée pour prévenir les redirections SSRF.
   *
   * @param {string} url - URL complète à appeler
   * @param {RequestInit & { cacheMethode?: string, cacheArgs?: * }} [options]
   *   - cacheMethode : préfixe de méthode pour la clé de cache (défaut 'GET')
   *   - cacheArgs    : arguments additionnels pour la clé de cache
   * @returns {Promise<*>} Corps de la réponse parsé en JSON
   * @throws {Error} En cas d'erreur HTTP non récupérable, timeout, ou destination SSRF
   */
  async _appelHttp(url, options = {}) {
    const { cacheMethode = 'GET', cacheArgs = null, ...fetchOptions } = options

    // M-03 — Valider l'URL avant même de chercher en cache
    validerUrlDestination(this.nom, url)

    const cle = hashCle(this.nom, cacheMethode, { url, args: cacheArgs })

    // Cache + dédup des requêtes concurrentes identiques (P-C4) : sur un miss, un seul
    // fetch est lancé pour une clé donnée, les appels simultanés partagent son résultat.
    return obtenirOuCalculer(cle, this.ttlCache, async () => {
      await consommer(this.nom)

      const controleur = new AbortController()
      const minuterie = setTimeout(() => controleur.abort(), this.timeoutMs)

      // SEC-I-02 — User-Agent sans email perso ; utiliser ENRICHISSEMENT_USER_AGENT si fourni,
      // sinon tomber sur l'adresse fonctionnelle générique (ADR-001).
      const userAgent =
        process.env.ENRICHISSEMENT_USER_AGENT ??
        'reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)'

      try {
        const reponse = await fetch(url, {
          ...fetchOptions,
          signal: controleur.signal,
          headers: {
            'User-Agent': userAgent,
            Accept: 'application/json',
            ...(fetchOptions.headers ?? {}),
          },
        })

        // M-03 — Vérifier l'URL finale après redirection (si redirect:'follow' par défaut)
        if (reponse.url && reponse.url !== url) {
          try {
            validerUrlDestination(this.nom, reponse.url)
          } catch {
            throw new Error(
              `[${this.nom}] SSRF bloqué — redirection vers URL non autorisée : ${reponse.url}`,
            )
          }
        }

        if (!reponse.ok) {
          const erreur = new Error(`[${this.nom}] HTTP ${reponse.status} sur ${url}`)
          erreur.status = reponse.status
          throw erreur
        }

        return await reponse.json()
      } finally {
        clearTimeout(minuterie)
      }
    })
  }
}

// Exports internes pour les tests
export { estHostAutorise, estIpPrivee, validerUrlDestination }
