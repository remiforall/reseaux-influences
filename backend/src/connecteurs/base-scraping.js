/**
 * @module base-scraping
 * Classe abstraite `BaseConnecteurScraping` — sous-type de connecteur pour
 * l'extraction de pages web éditoriales/institutionnelles (ADR-019).
 *
 * ⚠️ GELÉ PAR ADR-010/019 : aucun domaine n'est activé par défaut
 * (`domainesAutorises: []`). L'activation sur des sources réelles est
 * suspendue à la validation de la Q3 du brief d'audit juridique. Tant que
 * l'allowlist est vide, ce connecteur ne peut scraper aucune URL.
 *
 * Garde-fous spécifiques au scraping (en plus de ceux de BaseConnecteur) :
 * - respect strict de `robots.txt` (fail-closed : en cas de doute, on s'abstient) ;
 * - allowlist explicite de domaines éditoriaux vérifiables (pas de web ouvert) ;
 * - réseaux sociaux exclus, aucun contournement (CAPTCHA, paywall, auth) ;
 * - anti-SSRF (IP privées rejetées) réutilisé de base.js.
 */

import { obtenirOuCalculer, hashCle } from './cache.js'
import { consommer, creerBucket } from './rate-limit.js'
import { estIpPrivee } from './base.js'

/**
 * Parse minimal d'un robots.txt et test d'autorisation d'un chemin.
 *
 * On rassemble les directives `Disallow` des groupes `User-agent: *` et du
 * User-Agent fourni, puis on refuse si le chemin cible commence par un préfixe
 * `Disallow` non vide. Implémentation volontairement conservatrice.
 *
 * @param {string} contenu - contenu brut du robots.txt
 * @param {string} chemin - pathname de l'URL cible (ex: '/article/123')
 * @param {string} userAgent - notre User-Agent (token simple, ex: 'reseauxinfluences.fr')
 * @returns {boolean} true si l'accès est autorisé
 */
export function cheminAutoriseParRobots(contenu, chemin, userAgent) {
  const lignes = contenu.split(/\r?\n/).map((l) => l.replace(/#.*$/, '').trim())
  const uaToken = userAgent.toLowerCase()

  const groupes = [] // { agents: string[], disallow: string[] }
  let courant = null
  let dernierEtaitAgent = false

  for (const ligne of lignes) {
    if (!ligne) continue
    const sep = ligne.indexOf(':')
    if (sep === -1) continue
    const champ = ligne.slice(0, sep).trim().toLowerCase()
    const valeur = ligne.slice(sep + 1).trim()

    if (champ === 'user-agent') {
      if (!dernierEtaitAgent || !courant) {
        courant = { agents: [], disallow: [] }
        groupes.push(courant)
      }
      courant.agents.push(valeur.toLowerCase())
      dernierEtaitAgent = true
    } else if (champ === 'disallow' && courant) {
      courant.disallow.push(valeur)
      dernierEtaitAgent = false
    } else {
      dernierEtaitAgent = false
    }
  }

  // Groupes applicables : '*' ou un agent dont notre token contient le nom
  const applicables = groupes.filter((g) => g.agents.some((a) => a === '*' || uaToken.includes(a)))
  if (applicables.length === 0) return true

  for (const g of applicables) {
    for (const regle of g.disallow) {
      if (regle === '') continue // "Disallow:" vide = tout autorisé pour ce groupe
      if (chemin.startsWith(regle)) return false
    }
  }
  return true
}

export class BaseConnecteurScraping {
  /**
   * @param {{
   *   nom: string,
   *   version: string,
   *   rateLimit: { debit: number, capacite: number },
   *   domainesAutorises?: string[],
   *   ttlCache?: number,
   *   timeoutMs?: number
   * }} config
   */
  constructor({ nom, version, rateLimit, domainesAutorises = [], ttlCache, timeoutMs }) {
    this.nom = nom
    this.version = version
    // Allowlist VIDE par défaut (ADR-019) : rien n'est scrapable tant qu'on n'a
    // pas explicitement ajouté des domaines, après validation juridique Q3.
    this.domainesAutorises = domainesAutorises
    this.ttlCache = ttlCache ?? (Number(process.env.CACHE_TTL_MS) || 86_400_000)
    this.timeoutMs = timeoutMs ?? 25_000
    this._robotsCache = new Map() // host → { autorise: (chemin)=>bool }

    creerBucket(nom, rateLimit)
  }

  /** Token User-Agent court utilisé pour le matching robots.txt. */
  get userAgentToken() {
    return 'reseauxinfluences.fr'
  }

  /**
   * Vérifie que l'hôte est dans l'allowlist et n'est pas une IP privée.
   * @param {URL} url
   * @throws {Error}
   */
  _validerDomaine(url) {
    if (estIpPrivee(url.hostname)) {
      throw new Error(`[${this.nom}] SSRF bloqué — IP privée : ${url.hostname}`)
    }
    const autorise = this.domainesAutorises.some(
      (d) => url.hostname === d || url.hostname.endsWith(`.${d}`),
    )
    if (!autorise) {
      throw new Error(
        `[${this.nom}] Domaine hors allowlist : ${url.hostname}. ` +
          `Le scraping est restreint aux domaines validés (ADR-019).`,
      )
    }
  }

  /**
   * Récupère et met en cache la politique robots.txt d'un hôte.
   * Fail-closed : réseau injoignable ou 5xx → tout refusé. 4xx → tout autorisé.
   *
   * @param {URL} url
   * @returns {Promise<(chemin: string) => boolean>}
   */
  async _politiqueRobots(url) {
    const host = url.origin
    if (this._robotsCache.has(host)) return this._robotsCache.get(host)

    const robotsUrl = `${url.origin}/robots.txt`
    let predicat
    try {
      const reponse = await fetch(robotsUrl, {
        headers: { 'User-Agent': this.userAgentToken },
        signal: AbortSignal.timeout(this.timeoutMs),
      })
      if (reponse.status >= 500) {
        predicat = () => false // serveur en erreur → on s'abstient
      } else if (reponse.status >= 400) {
        predicat = () => true // pas de robots.txt → tout autorisé
      } else {
        const contenu = await reponse.text()
        predicat = (chemin) => cheminAutoriseParRobots(contenu, chemin, this.userAgentToken)
      }
    } catch {
      predicat = () => false // injoignable → fail-closed
    }

    this._robotsCache.set(host, predicat)
    return predicat
  }

  /**
   * Récupère le HTML d'une URL en respectant allowlist, robots.txt, rate-limit
   * et cache. Renvoie le texte brut (le connecteur concret en extrait les champs).
   *
   * @param {string} urlStr
   * @returns {Promise<string>} HTML brut
   * @throws {Error} domaine interdit, robots.txt refusant, ou erreur HTTP
   */
  async _appelHtml(urlStr) {
    let url
    try {
      url = new URL(urlStr)
    } catch {
      throw new Error(`[${this.nom}] URL malformée : ${urlStr}`)
    }

    this._validerDomaine(url)

    const robotsOk = await this._politiqueRobots(url)
    if (!robotsOk(url.pathname)) {
      throw new Error(`[${this.nom}] robots.txt interdit l'accès à ${url.pathname}`)
    }

    const cle = hashCle(this.nom, 'GET_HTML', { url: urlStr })
    return obtenirOuCalculer(cle, this.ttlCache, async () => {
      await consommer(this.nom)
      const reponse = await fetch(urlStr, {
        headers: {
          'User-Agent':
            process.env.ENRICHISSEMENT_USER_AGENT ??
            'reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)',
          Accept: 'text/html,application/xhtml+xml',
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      })
      if (!reponse.ok) {
        const erreur = new Error(`[${this.nom}] HTTP ${reponse.status} sur ${urlStr}`)
        erreur.status = reponse.status
        throw erreur
      }
      return reponse.text()
    })
  }

  /** @returns {Promise<*>} */
  async rechercher(_query, _options) {
    throw new Error(`[${this.nom}] rechercher() non implémenté`)
  }
}
