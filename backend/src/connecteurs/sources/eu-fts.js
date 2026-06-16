/**
 * @module connecteurs/sources/eu-fts
 * Connecteur EU Financial Transparency System (FTS) — bénéficiaires du budget
 * de l'Union (ADR-024).
 *
 * Source : Commission européenne, export annuel des bénéficiaires de fonds UE
 * en gestion directe (subventions, marchés). Format **XLSX** uniquement.
 * URL : https://ec.europa.eu/budget/financial-transparency-system/download/<ANNEE>_FTS_dataset_en.xlsx
 *
 * C'est la brique « qui reçoit l'argent de l'UE » de la cartographie d'influence :
 * dépendance/financement public européen d'une organisation, par programme.
 *
 * Garde-fous (ADR-003/006) : source publique officielle, pas de scraping. Les
 * bénéficiaires **personnes physiques sont masqués `*****`** à la source (RGPD) ;
 * on les écarte d'office — seules les organisations nommées sont indexées.
 * `qualiteInfluence` suggérée : AUTRE (bénéficiaire de fonds, pas un mandat).
 *
 * XLSX lu via le lecteur zéro-dépendance `xlsx-mini` (zlib natif). Données
 * agrégées par bénéficiaire (un bénéficiaire = N lignes d'engagement).
 */

import { BaseConnecteur } from '../base.js'
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js'
import { lireXlsx } from '../xlsx-mini.js'

const BASE_DL = 'https://ec.europa.eu/budget/financial-transparency-system/download'
const URL_PORTAIL = 'https://ec.europa.eu/budget/financial-transparency-system/index.html'

// Indices de colonnes (export FTS *_en.xlsx, en-tête en ligne 1)
const COL = { NOM: 4, PAYS: 12, OBJET: 25, LIGNE_BUDGET: 28, PROGRAMME: 29, TYPE_BENEF: 32 }
const COLS_MONTANT = [16, 17, 18, 19, 20, 21, 22]

/** Catégorie FTS « Beneficiary type » → TypeOrganisation. */
const MAPPING_TYPE = [
  [/private compan|for.profit/i, 'ENTREPRISE'],
  [/non.governmental|ngo/i, 'ONG'],
  [/public body|public sector|authorit|state/i, 'INSTITUTION_PUBLIQUE'],
  [/international organis/i, 'ORGANISATION_INTERNATIONALE'],
  [/research|universit|education|academ/i, 'THINK_TANK'],
  [/non.profit|foundation|association/i, 'ASSOCIATION'],
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

export default class EuFtsConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'eu-fts',
      version: '1.0.0',
      baseUrl: BASE_DL,
      rateLimit: {
        debit: Number(process.env.EU_FTS_RATE_LIMIT_DEBIT) || 1,
        capacite: Number(process.env.EU_FTS_RATE_LIMIT_CAPACITE) || 2,
      },
      ttlCache: Number(process.env.EU_FTS_CACHE_TTL_MS) || 30 * 24 * 60 * 60 * 1000,
      timeoutMs: 90_000,
    })
    /** @type {Array<object>|null} entrées agrégées par bénéficiaire */
    this._index = null
    /** @type {string|null} URL résolue (année disponible) */
    this._url = null
  }

  /**
   * Recherche d'organisations bénéficiaires de fonds UE par nom.
   *
   * @param {string} query - terme (min 2 caractères)
   * @param {object} [options]
   * @param {number} [options.perPage=10] - max 25
   */
  async rechercher(query, options = {}) {
    const terme = String(query ?? '').trim()
    if (terme.length < 2) return this._enveloppe([])

    await this._assurerIndex()
    const perPage = Math.min(Number(options.perPage) || 10, 25)
    const termeNorm = normaliserRecherche(terme)

    const resultats = []
    for (const e of this._index) {
      if (normaliserRecherche(e.nom).includes(termeNorm)) {
        resultats.push(this._mappageEntite(e))
        if (resultats.length >= perPage) break
      }
    }
    return this._enveloppe(resultats)
  }

  /**
   * Détail d'un bénéficiaire par nom exact (le FTS n'a pas d'identifiant
   * d'entité stable). Retourne le premier dont le nom normalisé correspond.
   */
  async detailler(nom) {
    const cible = normaliserRecherche(nom)
    if (!cible) return this._envEntite(null)
    await this._assurerIndex()
    const e = this._index.find((x) => normaliserRecherche(x.nom) === cible)
    return this._envEntite(e ? this._mappageEntite(e) : null)
  }

  async listerLiens(_nom) {
    return {
      liens: [],
      source: 'eu-fts',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  // ─── Méthodes internes ──────────────────────────────────────────────────────

  /** Télécharge + parse + agrège (résultat compact mis en cache 30 j). */
  async _assurerIndex() {
    if (this._index !== null) return
    const { obtenirOuCalculer, hashCle } = await import('../cache.js')
    const url = await this._resoudreUrl()
    const cle = hashCle(this.nom, 'fts-aggrege', { url })
    this._index = await obtenirOuCalculer(cle, this.ttlCache, async () => {
      const buf = await this._telechargerBinaire(url)
      return this._parser(buf)
    })
  }

  /**
   * Résout l'année disponible la plus récente (l'export annuel paraît en juin).
   * Sonde les premiers octets : un vrai .xlsx commence par la signature ZIP "PK".
   *
   * @returns {Promise<string>}
   */
  async _resoudreUrl() {
    if (this._url) return this._url
    const anneeCourante = new Date().getFullYear()
    for (let annee = anneeCourante; annee >= anneeCourante - 3; annee--) {
      const url = `${BASE_DL}/${annee}_FTS_dataset_en.xlsx`
      try {
        const reponse = await fetch(url, {
          headers: { Range: 'bytes=0-1' },
          signal: AbortSignal.timeout(15_000),
        })
        if (!reponse.ok) continue
        const buf = Buffer.from(await reponse.arrayBuffer())
        if (buf[0] === 0x50 && buf[1] === 0x4b) {
          this._url = url
          return url
        }
      } catch {
        // année suivante
      }
    }
    throw new Error('[eu-fts] aucun export annuel XLSX disponible (3 dernières années)')
  }

  /**
   * Parse + agrège le XLSX par bénéficiaire. Écarte les lignes masquées `*****`
   * (personnes physiques, RGPD). Renvoie un tableau compact (cacheable en JSON).
   *
   * @param {Buffer} buf
   * @returns {Array<object>}
   */
  _parser(buf) {
    const lignes = lireXlsx(buf)
    const agg = new Map()

    for (let i = 1; i < lignes.length; i++) {
      const l = lignes[i]
      const nom = (l[COL.NOM] ?? '').trim()
      if (!nom || nom === '*****') continue // masqué = personne physique → écarté
      const cle = normaliserRecherche(nom)
      if (!cle) continue

      let e = agg.get(cle)
      if (!e) {
        e = {
          nom,
          pays: l[COL.PAYS] || null,
          typeBrut: l[COL.TYPE_BENEF] || null,
          objet: l[COL.OBJET] || null,
          programmes: new Set(),
          nb: 0,
          montantMax: 0,
        }
        agg.set(cle, e)
      }
      e.nb++
      if (l[COL.PROGRAMME]) e.programmes.add(l[COL.PROGRAMME])
      const montant = Math.max(
        0,
        ...COLS_MONTANT.map((c) => Number(String(l[c] ?? '').replace(/[^\d.-]/g, '')) || 0),
      )
      if (montant > e.montantMax) e.montantMax = montant
    }

    return [...agg.values()].map((e) => ({
      ...e,
      programmes: [...e.programmes].slice(0, 8),
    }))
  }

  _mappageEntite(e) {
    const sourceInfo = { source: 'EU Financial Transparency System', url: URL_PORTAIL }
    const montant = e.montantMax ? `${Number(e.montantMax).toLocaleString('fr-FR')} €` : null
    const description =
      `Bénéficiaire de fonds de l'Union européenne` +
      `${e.typeBrut ? ` · ${e.typeBrut}` : ''}` +
      `${e.nb ? ` · ${e.nb} engagement(s)` : ''}` +
      `${montant ? ` · engagement max ${montant}` : ''}` +
      `${e.programmes?.length ? ` · programmes : ${e.programmes.join(' ; ')}` : ''}` +
      `${e.pays ? ` · ${e.pays}` : ''}`

    const champs = {
      nom: marquerProvenance(e.nom, sourceInfo),
      typeOrganisation: marquerProvenance(this._typeVersEnum(e.typeBrut), sourceInfo),
      qualiteInfluence: marquerProvenance('AUTRE', sourceInfo),
      pays: marquerProvenance(e.pays, sourceInfo),
      financementUeMaxEur: marquerProvenance(montant, sourceInfo),
      nombreFinancementsUe: marquerProvenance(e.nb || null, sourceInfo),
      programmesUe: marquerProvenance(
        e.programmes?.length ? e.programmes.join(' ; ') : null,
        sourceInfo,
      ),
      description: marquerProvenance(description, sourceInfo),
    }
    return creerEntiteNormalisee('Organisation', champs, [])
  }

  _typeVersEnum(typeBrut) {
    if (!typeBrut) return 'AUTRE'
    for (const [regex, type] of MAPPING_TYPE) if (regex.test(typeBrut)) return type
    return 'AUTRE'
  }

  /** Télécharge le binaire .xlsx (bypass du parse JSON de `_appelHttp`). */
  async _telechargerBinaire(url) {
    const { consommer } = await import('../rate-limit.js')
    await consommer(this.nom)
    const userAgent =
      process.env.ENRICHISSEMENT_USER_AGENT ??
      'reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)'
    const reponse = await fetch(url, {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(this.timeoutMs),
    })
    if (!reponse.ok) throw new Error(`[eu-fts] HTTP ${reponse.status} sur ${url}`)
    return Buffer.from(await reponse.arrayBuffer())
  }

  reinitialiser() {
    this._index = null
    this._url = null
  }

  _enveloppe(resultats) {
    return {
      resultats,
      source: 'eu-fts',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  _envEntite(entite) {
    return {
      entite,
      source: 'eu-fts',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }
}
