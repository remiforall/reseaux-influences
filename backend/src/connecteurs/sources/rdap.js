/**
 * @module connecteurs/sources/rdap
 * Connecteur RDAP + DNS pour les entités de type SiteWeb.
 *
 * Couverture :
 *   - Titulaire de domaine (souvent REDACTED post-RGPD — comportement attendu)
 *   - Registrar, dates d'enregistrement/expiration, statuts
 *   - Nameservers + déduction de l'hébergeur probable par suffixe NS
 *   - Résolution NS via `dns.promises.resolveNs`
 *
 * Fraîcheur : données RDAP mises à jour en temps réel par les registrars.
 * Cache 24 h acceptable pour un usage OSINT (les changements de titulaire
 * sont rares et apparaissent dans les délégations NS).
 *
 * Limites :
 *   - RDAP ne supporte pas la recherche textuelle : `rechercher()` n'accepte
 *     que des noms de domaine valides (regex stricte).
 *   - Le titulaire est fréquemment `REDACTED FOR PRIVACY` (post-RGPD 2018).
 *     Dans ce cas, le champ est omis des `liensSuggeres`.
 *   - L'hébergeur déduit des NS est une heuristique, pas une certitude.
 */

import { promises as dns } from 'node:dns';
import { BaseConnecteur } from '../base.js';
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js';

const ENDPOINT_RDAP_BOOTSTRAP = 'https://data.iana.org/rdap/dns.json';
const ENDPOINT_RDAP_FALLBACK = 'https://rdap.iana.org/domain/';

/** Regex de validation d'un nom de domaine (sans protocole ni slash). */
const REGEX_DOMAINE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

/**
 * Mapping suffixe de nameserver → libellé hébergeur.
 * Comparaison sur le suffixe DNS (derniers N composants).
 */
const MAPPING_HEBERGEURS_NS = new Map([
  ['ovh.net', 'OVH'],
  ['ovh.ca', 'OVH'],
  ['dns.ovh.net', 'OVH'],
  ['gandi.net', 'Gandi'],
  ['dns.gandi.net', 'Gandi'],
  ['cloudflare.com', 'Cloudflare'],
  ['ns.cloudflare.com', 'Cloudflare'],
  ['awsdns', 'Amazon AWS'],
  ['amazonaws.com', 'Amazon AWS'],
  ['infomaniak.com', 'Infomaniak'],
  ['infomaniak.ch', 'Infomaniak'],
  ['google.com', 'Google'],
  ['googledomains.com', 'Google'],
  ['hetzner.com', 'Hetzner'],
  ['hetzner.de', 'Hetzner'],
  ['ionos.com', 'IONOS'],
  ['1and1.com', 'IONOS'],
  ['o2switch.net', 'O2switch'],
  ['planethoster.net', 'PlanetHoster'],
  ['online.net', 'Scaleway'],
  ['scaleway.com', 'Scaleway'],
]);

/** Valeurs indiquant un titulaire anonymisé par le registrar. */
const VALEURS_REDACTEES = new Set([
  'REDACTED FOR PRIVACY',
  'Data Protected',
  'Not Disclosed',
  'Private Registration',
  'Redacted',
  'REDACTED',
]);

export default class RdapConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'rdap',
      version: '1.1.0',
      baseUrl: ENDPOINT_RDAP_FALLBACK,
      rateLimit: {
        debit: Number(process.env.RDAP_RATE_LIMIT_DEBIT) || 2,
        capacite: Number(process.env.RDAP_RATE_LIMIT_CAPACITE) || 3,
      },
      ttlCache: Number(process.env.CACHE_TTL_MS) || 86_400_000,
      timeoutMs: 15_000,
    });
    // Cache mémoire du bootstrap IANA (TLD → URL RDAP).
    // Re-chargé au plus toutes les 24 h (TTL du cache disque via _appelHttp).
    this._bootstrapCache = null;
  }

  /**
   * Résout l'URL du serveur RDAP autoritatif pour un TLD donné via le
   * bootstrap IANA (https://data.iana.org/rdap/dns.json). Met en cache la
   * table complète en mémoire après le premier appel.
   *
   * Si le TLD n'est pas mappé dans le bootstrap (cas rare des nouveaux gTLDs),
   * retourne le fallback rdap.iana.org/domain (qui renverra 404 mais ne casse
   * pas le flux).
   *
   * @param {string} domaine - Nom de domaine complet (ex: 'posthack.com')
   * @returns {Promise<string>} URL RDAP complète pour ce domaine
   */
  async _resoudreEndpointRdap(domaine) {
    if (!this._bootstrapCache) {
      try {
        const bootstrap = await this._appelHttp(ENDPOINT_RDAP_BOOTSTRAP, {
          cacheMethode: 'bootstrap',
          cacheArgs: 'dns',
        });
        this._bootstrapCache = this._indexerBootstrap(bootstrap);
      } catch {
        // Bootstrap inaccessible : utiliser uniquement le fallback IANA
        this._bootstrapCache = new Map();
      }
    }

    const tld = domaine.split('.').pop().toLowerCase();
    const urlBase = this._bootstrapCache.get(tld);
    if (urlBase) {
      const racine = urlBase.endsWith('/') ? urlBase : `${urlBase}/`;
      return `${racine}domain/${domaine}`;
    }
    return `${ENDPOINT_RDAP_FALLBACK}${domaine}`;
  }

  /**
   * Indexe la réponse JSON du bootstrap IANA en `Map<tld, urlRdap>`.
   * Format attendu :
   *   { services: [ [ ["com","net"], ["https://rdap.verisign.com/com/v1/"] ], ... ] }
   *
   * @param {object} bootstrap
   * @returns {Map<string, string>}
   */
  _indexerBootstrap(bootstrap) {
    const index = new Map();
    const services = bootstrap.services ?? [];
    for (const service of services) {
      const tlds = service[0] ?? [];
      const urls = service[1] ?? [];
      const url = urls.find((u) => u.startsWith('https://')) ?? urls[0];
      if (!url) continue;
      for (const tld of tlds) {
        index.set(tld.toLowerCase(), url);
      }
    }
    return index;
  }

  /**
   * Recherche RDAP par nom de domaine.
   *
   * RDAP ne supporte pas la recherche textuelle : seul un nom de domaine
   * valide produit un résultat. Toute autre chaîne retourne un tableau vide
   * sans appel réseau.
   *
   * @param {string} query - Nom de domaine (ex: 'example.fr')
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query) {
    const domaine = query?.trim().toLowerCase();
    if (!domaine || !REGEX_DOMAINE.test(domaine)) {
      return this._enveloppe([]);
    }

    const detail = await this.detailler(domaine);
    const resultats = detail.entite ? [detail.entite] : [];
    return this._enveloppe(resultats);
  }

  /**
   * Retourne le détail RDAP d'un nom de domaine.
   *
   * @param {string} domaine - Nom de domaine sans protocole (ex: 'example.fr')
   * @returns {Promise<{ entite: object|null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(domaine) {
    const domainePropre = domaine?.trim().toLowerCase();
    if (!domainePropre || !REGEX_DOMAINE.test(domainePropre)) {
      return {
        entite: null,
        source: 'RDAP',
        dateRecuperation: new Date().toISOString(),
        version: this.version,
      };
    }

    const url = await this._resoudreEndpointRdap(domainePropre);
    let donnees;
    try {
      donnees = await this._appelHttp(url, {
        cacheMethode: 'detailler',
        cacheArgs: domainePropre,
        redirect: 'follow',
      });
    } catch (err) {
      if (err.status === 404) {
        return {
          entite: null,
          source: 'RDAP',
          dateRecuperation: new Date().toISOString(),
          version: this.version,
        };
      }
      throw err;
    }

    const entite = this._mappageRdap(domainePropre, donnees);
    return {
      entite,
      source: 'RDAP',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  /**
   * Liste les liens suggérés depuis un nom de domaine.
   *
   * @param {string} domaine
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(domaine) {
    const detail = await this.detailler(domaine);
    const liens = detail.entite?.liensSuggeres ?? [];
    return {
      liens,
      source: 'RDAP',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  // ─── Méthodes internes ──────────────────────────────────────────────────────

  /**
   * Mappe une réponse RDAP vers une EntiteNormalisee de type SiteWeb.
   *
   * @param {string} domaine
   * @param {object} rdap - Corps JSON de la réponse RDAP
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageRdap(domaine, rdap) {
    // L'URL canonique de citation reste IANA (point d'entrée standardisé)
    // même si la requête réelle est passée par Verisign/AFNIC/Gandi.
    const urlRdap = `https://rdap.iana.org/domain/${domaine}`;
    const sourceInfo = { source: 'RDAP', url: urlRdap };

    // Extraction des événements
    const evenements = rdap.events ?? [];
    const dateEnregistrement = this._trouverEvenement(evenements, 'registration');
    const dateExpiration = this._trouverEvenement(evenements, 'expiration');

    // Nameservers
    const nameservers = (rdap.nameservers ?? [])
      .map((ns) => ns.ldhName?.toLowerCase())
      .filter(Boolean);

    // Hébergeur déduit du premier NS
    const hebergeurProbable =
      nameservers.length > 0 ? this._deduireHebergeur(nameservers[0]) : null;

    // Registrar
    const registrar = this._trouverEntiteParRole(rdap.entities ?? [], 'registrar');

    const champs = {
      domaine: marquerProvenance(domaine, sourceInfo),
      dateEnregistrement: marquerProvenance(dateEnregistrement, sourceInfo),
      dateExpiration: marquerProvenance(dateExpiration, sourceInfo),
      registrar: marquerProvenance(registrar, sourceInfo),
      statut: marquerProvenance(rdap.status ?? [], sourceInfo),
      nameservers: marquerProvenance(nameservers, sourceInfo),
      hebergeurProbable: marquerProvenance(hebergeurProbable, sourceInfo),
    };

    // Liens suggérés
    const liensSuggeres = [];

    // Hébergeur déduit
    if (hebergeurProbable) {
      liensSuggeres.push({
        vers: { type: 'Organisation', identifiantExterne: hebergeurProbable },
        typeLienCode: 'HEBERGE_PAR',
        source: 'RDAP',
        url: urlRdap,
        date: new Date().toISOString(),
      });
    }

    // Titulaire — omis si REDACTED
    const nomTitulaire = this._trouverEntiteParRole(rdap.entities ?? [], 'registrant');
    if (nomTitulaire && !VALEURS_REDACTEES.has(nomTitulaire)) {
      liensSuggeres.push({
        vers: { type: 'Personne', identifiantExterne: nomTitulaire },
        typeLienCode: 'TITULAIRE_DOMAINE',
        source: 'RDAP',
        url: urlRdap,
        date: new Date().toISOString(),
      });
    }

    return creerEntiteNormalisee('SiteWeb', champs, liensSuggeres);
  }

  /**
   * Extrait la date d'un événement RDAP par son type.
   *
   * @param {Array<{ eventAction: string, eventDate: string }>} evenements
   * @param {string} action
   * @returns {string|null}
   */
  _trouverEvenement(evenements, action) {
    const evt = evenements.find((e) => e.eventAction === action);
    return evt?.eventDate ?? null;
  }

  /**
   * Extrait le nom FN d'une entité RDAP par son rôle.
   *
   * @param {Array} entites
   * @param {string} role
   * @returns {string|null}
   */
  _trouverEntiteParRole(entites, role) {
    const entite = entites.find((e) => e.roles?.includes(role));
    if (!entite) return null;

    const vcard = entite.vcardArray?.[1] ?? [];
    const fn = vcard.find((champ) => champ[0] === 'fn');
    return fn?.[3] ?? null;
  }

  /**
   * Déduit l'hébergeur probable depuis un nameserver.
   * Parcourt le mapping en cherchant si le NS contient la clé.
   *
   * @param {string} ns - Nom du nameserver en minuscules
   * @returns {string|null}
   */
  _deduireHebergeur(ns) {
    for (const [suffixe, libelle] of MAPPING_HEBERGEURS_NS) {
      if (ns.includes(suffixe)) return libelle;
    }
    return null;
  }

  /**
   * Résout les nameservers d'un domaine via DNS (optionnel, non mis en cache).
   * Utile pour compléter les données RDAP quand les NS ne sont pas fournis.
   *
   * @param {string} domaine
   * @returns {Promise<string[]>}
   */
  async _resolveNs(domaine) {
    try {
      const serveurs = await dns.resolveNs(domaine);
      return serveurs.map((ns) => ns.toLowerCase());
    } catch {
      return [];
    }
  }

  /** Enveloppe un tableau de résultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'RDAP',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }
}
