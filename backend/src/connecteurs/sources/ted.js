/**
 * @module connecteurs/sources/ted
 * Connecteur TED — Tenders Electronic Daily (marchés publics de l'UE, ADR-025).
 *
 * API : POST https://api.ted.europa.eu/v3/notices/search (recherche experte
 * JSON, publique, sans clé). Documentation : https://docs.ted.europa.eu/api/.
 *
 * Brique « commande publique européenne » de la cartographie d'influence :
 * quels acheteurs publics passent des marchés, sur quels sujets. La recherche
 * plein-texte (`FT~"…"`) matche le terme partout dans l'avis (acheteur,
 * attributaire, objet) ; l'entité renvoyée est l'**acheteur public**
 * (`buyer-name`, toujours présent — l'attributaire n'est pas exposé par l'API
 * de recherche, seulement dans le XML détaillé).
 *
 * Garde-fous (ADR-003) : API officielle, pas de scraping. Les acheteurs sont
 * des organismes publics → `TypeOrganisation = INSTITUTION_PUBLIQUE`.
 */

import { BaseConnecteur } from '../base.js'
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js'

const ENDPOINT = 'https://api.ted.europa.eu/v3/notices/search'
const CHAMPS = [
  'publication-number',
  'notice-title',
  'buyer-name',
  'buyer-country',
  'publication-date',
  'links',
]

function normaliserRecherche(chaine) {
  if (!chaine) return ''
  return chaine
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default class TedConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'ted',
      version: '1.0.0',
      baseUrl: ENDPOINT,
      rateLimit: {
        debit: Number(process.env.TED_RATE_LIMIT_DEBIT) || 3,
        capacite: Number(process.env.TED_RATE_LIMIT_CAPACITE) || 6,
      },
      ttlCache: Number(process.env.CACHE_TTL_MS) || 86_400_000,
      timeoutMs: 20_000,
    })
  }

  /**
   * Recherche d'acheteurs publics dont les avis TED matchent le terme.
   *
   * @param {string} query - terme (min 2 caractères)
   * @param {object} [options]
   * @param {number} [options.perPage=10] - max 25
   */
  async rechercher(query, options = {}) {
    const terme = String(query ?? '').trim()
    if (terme.length < 2) return this._enveloppe([])

    const perPage = Math.min(Number(options.perPage) || 10, 25)
    // Échapper les guillemets pour ne pas casser la requête experte.
    const termeSafe = terme.replace(/"/g, '')
    const corps = {
      query: `FT~"${termeSafe}"`,
      fields: CHAMPS,
      limit: 50,
      scope: 'ALL',
      paginationMode: 'PAGE_NUMBER',
    }

    const donnees = await this._appelHttp(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
      cacheMethode: 'rechercher',
      cacheArgs: { terme: termeSafe },
    })

    const agg = this._agregerParAcheteur(donnees.notices ?? [])
    const resultats = [...agg.values()].slice(0, perPage).map((e) => this._mappageEntite(e, terme))
    return this._enveloppe(resultats)
  }

  /** TED est orienté recherche : pas de détail ni de liens par identifiant. */
  async detailler() {
    return {
      entite: null,
      source: 'ted',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  async listerLiens() {
    return {
      liens: [],
      source: 'ted',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  // ─── Méthodes internes ──────────────────────────────────────────────────────

  /**
   * Agrège les avis par acheteur public (nom normalisé).
   * @param {Array<object>} notices
   * @returns {Map<string, object>}
   */
  _agregerParAcheteur(notices) {
    const agg = new Map()
    for (const n of notices) {
      const acheteur = this._texteMultilingue(n['buyer-name'])
      if (!acheteur) continue
      const cle = normaliserRecherche(acheteur)
      if (!cle) continue

      let e = agg.get(cle)
      if (!e) {
        e = {
          nom: acheteur,
          pays: Array.isArray(n['buyer-country'])
            ? n['buyer-country'][0]
            : n['buyer-country'] || null,
          nb: 0,
          exemples: [],
          derniereDate: null,
        }
        agg.set(cle, e)
      }
      e.nb++
      const date = (n['publication-date'] ?? '').slice(0, 10) || null
      if (date && (!e.derniereDate || date > e.derniereDate)) e.derniereDate = date
      if (e.exemples.length < 3) {
        e.exemples.push({
          titre: this._texteMultilingue(n['notice-title']),
          url: this._lienNotice(n),
        })
      }
    }
    return agg
  }

  _mappageEntite(e, terme) {
    const urlSource =
      e.exemples[0]?.url ??
      `https://ted.europa.eu/en/search/result?text=${encodeURIComponent(terme)}`
    const sourceInfo = { source: 'TED — marchés publics UE', url: urlSource }

    const titres = e.exemples
      .map((x) => x.titre)
      .filter(Boolean)
      .map((t) => t.slice(0, 80))
      .join(' ; ')
    const description =
      `Acheteur public (marchés publics UE / TED)` +
      `${e.nb ? ` · ${e.nb} avis correspondant à « ${terme} »` : ''}` +
      `${e.derniereDate ? ` · dernier ${e.derniereDate}` : ''}` +
      `${e.pays ? ` · ${e.pays}` : ''}` +
      `${titres ? ` · ex : ${titres}` : ''}`

    const champs = {
      nom: marquerProvenance(e.nom, sourceInfo),
      typeOrganisation: marquerProvenance('INSTITUTION_PUBLIQUE', sourceInfo),
      qualiteInfluence: marquerProvenance('AUTRE', sourceInfo),
      pays: marquerProvenance(e.pays, sourceInfo),
      nombreAvisTed: marquerProvenance(e.nb || null, sourceInfo),
      derniereActiviteTed: marquerProvenance(e.derniereDate, sourceInfo),
      description: marquerProvenance(description, sourceInfo),
    }
    return creerEntiteNormalisee('Organisation', champs, [])
  }

  /**
   * Extrait une valeur lisible d'un champ multilingue TED ({lang: valeur|[valeur]}).
   * Préfère le français puis l'anglais, sinon la première langue.
   *
   * @param {object|null} champ
   * @returns {string|null}
   */
  _texteMultilingue(champ) {
    if (!champ || typeof champ !== 'object') return champ ?? null
    const langues = Object.keys(champ)
    if (langues.length === 0) return null
    const prefere = ['fra', 'eng'].find((l) => champ[l]) ?? langues[0]
    const valeur = champ[prefere]
    return Array.isArray(valeur) ? (valeur[0] ?? null) : (valeur ?? null)
  }

  /** Construit le lien public vers un avis TED (FR puis EN, sinon détail générique). */
  _lienNotice(n) {
    const html = n.links?.html
    if (html) return html.FRA ?? html.ENG ?? Object.values(html)[0]
    const pub = n['publication-number']
    return pub ? `https://ted.europa.eu/en/notice/-/detail/${pub}` : 'https://ted.europa.eu/'
  }

  _enveloppe(resultats) {
    return {
      resultats,
      source: 'ted',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }
}
