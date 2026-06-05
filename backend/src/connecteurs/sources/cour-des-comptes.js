/**
 * @module connecteurs/sources/cour-des-comptes
 * Connecteur Cour des comptes — veille RSS rapports officiels.
 *
 * Source : Cour des comptes française, https://www.ccomptes.fr
 * Endpoint : https://www.ccomptes.fr/fr/rss/general (RSS XML)
 * Licence : données publiques officielles — usage libre.
 *
 * Comportement identique à anticor.js, avec un scope éditorial différent :
 *   - Chaque item est un rapport ou avis officiel de la Cour des comptes
 *   - Ces sources sont citables comme documents officiels
 *   - typeMedia : 'DOCUMENT_OFFICIEL' (pas 'PRESSE_ECRITE')
 *   - Retourne des Sources (liens vers rapports) sans créer d'entités
 *   - Compatible avec l'interface BaseConnecteur (resultats: [] vide)
 *
 * Parseur RSS identique à anticor.js — regex sans dépendance npm.
 */

import { BaseConnecteur } from '../base.js'

const ENDPOINT_RSS = 'https://www.ccomptes.fr/fr/rss/general'
/** TTL cache 6 heures (les rapports sont publiés sporadiquement) */
const TTL_6H_MS = 6 * 60 * 60 * 1000

export default class CourDesComptesConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'cour-des-comptes',
      version: '1.0.0',
      baseUrl: ENDPOINT_RSS,
      rateLimit: {
        debit: Number(process.env.COUR_COMPTES_RATE_LIMIT_DEBIT) || 1,
        capacite: Number(process.env.COUR_COMPTES_RATE_LIMIT_CAPACITE) || 2,
      },
      ttlCache: TTL_6H_MS,
      timeoutMs: 15_000,
    })
  }

  /**
   * Recherche dans le flux RSS de la Cour des comptes.
   *
   * Retourne des Sources (rapports officiels) filtrées par mot-clé.
   * Le tableau `resultats` est toujours vide (pas de nouvelle entité proposée).
   *
   * @param {string} query - Terme de recherche filtré sur titre + description
   * @param {object} [_options]
   * @returns {Promise<{
   *   resultats: [],
   *   sources: Array<{ url: string, titre: string, datePublication: string, auteur: string, media: string, typeMedia: string, paysMedia: string, mentions: string[] }>,
   *   source: string,
   *   dateRecuperation: string,
   *   version: string
   * }>}
   */
  async rechercher(query, _options = {}) {
    const terme = String(query ?? '').trim()
    if (!terme) return this._enveloppeVide([])

    const rssTexte = await this._telechargerRss()
    const items = this._parserRss(rssTexte)
    const termeNormalise = terme.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

    const sources = items
      .filter((item) => {
        const titre = (item.titre ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        const description = (item.description ?? '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
        return titre.includes(termeNormalise) || description.includes(termeNormalise)
      })
      .map((item) => ({
        url: item.url,
        titre: item.titre,
        datePublication: item.datePublication,
        auteur: 'Cour des comptes',
        media: 'Cour des comptes',
        typeMedia: 'DOCUMENT_OFFICIEL',
        paysMedia: 'France',
        mentions: [terme],
      }))

    return this._enveloppeVide(sources)
  }

  /**
   * Non implémenté pour ce connecteur (orienté sources, pas entités).
   *
   * @param {string} _id
   * @returns {Promise<{ entite: null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(_id) {
    return {
      entite: null,
      source: 'Cour des comptes',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  /**
   * Non implémenté pour ce connecteur.
   *
   * @param {string} _id
   * @returns {Promise<{ liens: [], source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(_id) {
    return {
      liens: [],
      source: 'Cour des comptes',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  // --- Méthodes internes ---

  /**
   * Télécharge le flux RSS avec cache 6 heures.
   * Utilise fetch natif Node.js + cache disque.
   *
   * @returns {Promise<string>}
   */
  async _telechargerRss() {
    const { consommer } = await import('../rate-limit.js')
    const { lireCache, ecrireCache, hashCle } = await import('../cache.js')
    await consommer(this.nom)

    const cle = hashCle(this.nom, 'rss', 'feed')
    const cached = await lireCache(cle, this.ttlCache)
    if (cached !== null) return cached

    const userAgent =
      process.env.ENRICHISSEMENT_USER_AGENT ??
      'reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)'

    const controleur = new AbortController()
    const minuterie = setTimeout(() => controleur.abort(), this.timeoutMs)

    try {
      const reponse = await fetch(ENDPOINT_RSS, {
        signal: controleur.signal,
        headers: {
          'User-Agent': userAgent,
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
      })

      if (!reponse.ok) {
        throw new Error(`[cour-des-comptes] HTTP ${reponse.status} sur ${ENDPOINT_RSS}`)
      }

      const texte = await reponse.text()
      await ecrireCache(cle, texte)
      return texte
    } finally {
      clearTimeout(minuterie)
    }
  }

  /**
   * Parse le flux RSS XML en extrayant les items.
   * Utilise des regex robustes — pas de dépendance npm (xml-js interdit).
   *
   * @param {string} xml - Contenu XML du flux RSS
   * @returns {Array<{ titre: string, url: string, datePublication: string, description: string }>}
   */
  _parserRss(xml) {
    if (!xml || typeof xml !== 'string') return []

    const items = []
    const regexItem = /<item[^>]*>([\s\S]*?)<\/item>/gi
    let match

    while ((match = regexItem.exec(xml)) !== null) {
      const bloc = match[1]
      items.push({
        titre: this._extraireBalise(bloc, 'title'),
        url: this._extraireBalise(bloc, 'link') || this._extraireBalise(bloc, 'guid'),
        datePublication: this._normaliserDate(this._extraireBalise(bloc, 'pubDate')),
        description: this._nettoyerHtml(this._extraireBalise(bloc, 'description')),
      })
    }

    return items
  }

  /**
   * Extrait le contenu d'une balise XML simple, avec support CDATA.
   *
   * @param {string} xml - Fragment XML
   * @param {string} balise - Nom de la balise (sans <>)
   * @returns {string}
   */
  _extraireBalise(xml, balise) {
    const regexCdata = new RegExp(
      `<${balise}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${balise}>`,
      'i',
    )
    const matchCdata = regexCdata.exec(xml)
    if (matchCdata) return matchCdata[1].trim()

    const regex = new RegExp(`<${balise}[^>]*>([\\s\\S]*?)<\\/${balise}>`, 'i')
    const matchStd = regex.exec(xml)
    if (matchStd) return matchStd[1].trim()

    return ''
  }

  /**
   * Supprime les balises HTML et décode les entités HTML courantes.
   *
   * @param {string} texte
   * @returns {string}
   */
  _nettoyerHtml(texte) {
    if (!texte) return ''
    return texte
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Normalise une date pubDate RSS en ISO 8601.
   *
   * @param {string} dateRss
   * @returns {string}
   */
  _normaliserDate(dateRss) {
    if (!dateRss) return new Date().toISOString()
    try {
      return new Date(dateRss).toISOString()
    } catch {
      return new Date().toISOString()
    }
  }

  /**
   * Enveloppe avec `resultats: []` vide (pas de nouvelle entité proposée).
   *
   * @param {Array} sources
   * @returns {object}
   */
  _enveloppeVide(sources) {
    return {
      resultats: [],
      sources,
      source: 'Cour des comptes',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }
}
