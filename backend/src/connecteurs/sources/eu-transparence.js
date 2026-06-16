/**
 * @module connecteurs/sources/eu-transparence
 * Connecteur Registre de Transparence de l'UE (ADR-022).
 *
 * Source : registre commun Parlement européen + Commission + Conseil des
 * représentants d'intérêts (lobbyistes). Export XML complet quotidien.
 *
 * URL : https://ec.europa.eu/transparencyregister/public/files/ODP/download/XML/latest
 * (le domaine public transparency-register.europa.eu y redirige). Open data,
 * aucune clé API. ~17 000 organisations, format XML `ListOfIRPublicDetail`.
 *
 * C'est la brique « européenne » de la cartographie d'influence : qui cherche à
 * peser sur la décision publique de l'UE, dans quelle catégorie, à quel niveau,
 * avec combien de personnes accréditées au Parlement européen.
 *
 * Garde-fous (ADR-003/006) : source publique officielle, pas de scraping.
 * Toute organisation importée porte `qualiteInfluence = LOBBYISTE` (les inscrits
 * sont par définition des représentants d'intérêts déclarés).
 *
 * Parsing : regex zéro-dépendance (politique du projet — xml-js interdit),
 * sur le pattern de `anticor.js` (RSS) et `open-sanctions.js` (bulk + index).
 * Fichier volumineux → cache 30 jours.
 */

import { BaseConnecteur } from '../base.js'
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js'

const URL_EXPORT = 'https://ec.europa.eu/transparencyregister/public/files/ODP/download/XML/latest'

/** Mapping catégorie d'inscription → TypeOrganisation (enum Prisma). */
const MAPPING_CATEGORIE = [
  [/consultanc|law firm|self-employed/i, 'LOBBY'],
  [/in-house|trade.*business|business.*association/i, 'ENTREPRISE'],
  [/trade union|professional association/i, 'SYNDICAT'],
  [/non-governmental|ngo/i, 'ONG'],
  [/think tank|research|academic/i, 'THINK_TANK'],
  [/church|religious/i, 'ASSOCIATION'],
  [/local|regional|municipal|public authorit/i, 'INSTITUTION_PUBLIQUE'],
]

/**
 * Normalise une chaîne pour la recherche (minuscules, sans accents/ponctuation).
 * @param {string} chaine
 * @returns {string}
 */
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

/** Décode les entités XML les plus fréquentes. */
function decoderXml(texte) {
  if (!texte) return texte
  return texte
    .replace(/&#xd;/gi, '\n')
    .replace(/&#x?[0-9a-f]+;/gi, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim()
}

/**
 * Extrait le contenu texte de la première occurrence d'une balise dans un bloc.
 * @param {string} bloc
 * @param {string} balise
 * @returns {string|null}
 */
function extraireBalise(bloc, balise) {
  const m = bloc.match(new RegExp(`<${balise}>([\\s\\S]*?)<\\/${balise}>`, 'i'))
  return m ? decoderXml(m[1].trim()) : null
}

export default class EuTransparenceConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'eu-transparence',
      version: '1.0.0',
      baseUrl: URL_EXPORT,
      rateLimit: {
        debit: Number(process.env.EU_TRANSPARENCE_RATE_LIMIT_DEBIT) || 1,
        capacite: Number(process.env.EU_TRANSPARENCE_RATE_LIMIT_CAPACITE) || 3,
      },
      // Export quotidien volumineux → cache 30 jours (comme les datasets bulk).
      ttlCache: Number(process.env.EU_TRANSPARENCE_CACHE_TTL_MS) || 30 * 24 * 60 * 60 * 1000,
      timeoutMs: 60_000,
    })
    /** @type {Map<string, object>|null} Map identificationCode → entrée */
    this._index = null
  }

  /**
   * Recherche d'organisations inscrites par nom ou acronyme.
   *
   * @param {string} query - terme (min 2 caractères)
   * @param {object} [options]
   * @param {number} [options.perPage=10] - max 25
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query, options = {}) {
    const terme = String(query ?? '').trim()
    if (terme.length < 2) return this._enveloppe([])

    await this._assurerIndex()
    const perPage = Math.min(Number(options.perPage) || 10, 25)
    const termeNorm = normaliserRecherche(terme)

    const resultats = []
    for (const entree of this._index.values()) {
      const nomNorm = normaliserRecherche(entree.nom)
      const acrNorm = normaliserRecherche(entree.acronym)
      if (nomNorm.includes(termeNorm) || (acrNorm && acrNorm.includes(termeNorm))) {
        resultats.push(this._mappageEntite(entree))
        if (resultats.length >= perPage) break
      }
    }
    return this._enveloppe(resultats)
  }

  /**
   * Détail d'une organisation par son code d'identification (ex: "880143435725-46").
   *
   * @param {string} code
   * @returns {Promise<{ entite: object|null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(code) {
    const codePropre = String(code ?? '').trim()
    if (!codePropre) return this._envEntite(null)

    await this._assurerIndex()
    const entree = this._index.get(codePropre)
    return this._envEntite(entree ? this._mappageEntite(entree) : null)
  }

  /**
   * Pas de liens fiables exploitables depuis l'export public (les personnes
   * accréditées ne sont qu'un compte agrégé). Retourne une liste vide.
   *
   * @param {string} _code
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(_code) {
    return {
      liens: [],
      source: 'eu-transparence',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  // ─── Méthodes internes ──────────────────────────────────────────────────────

  /** Télécharge l'export XML (cache 30 j) et construit l'index si nécessaire. */
  async _assurerIndex() {
    if (this._index !== null) return
    const xml = await this._telechargerTexte(URL_EXPORT)
    this._index = new Map()
    this._indexerXml(xml)
  }

  /**
   * Parse l'export XML et indexe chaque `interestRepresentative` par son code.
   *
   * @param {string} xml
   * @returns {void}
   */
  _indexerXml(xml) {
    const regexBloc = /<interestRepresentative>([\s\S]*?)<\/interestRepresentative>/gi
    let m
    while ((m = regexBloc.exec(xml)) !== null) {
      const bloc = m[1]
      const code = extraireBalise(bloc, 'identificationCode')
      if (!code) continue

      // <name><originalName>...</originalName></name>
      const nom = extraireBalise(bloc, 'originalName')
      if (!nom) continue

      // Pays/ville du siège : scoper au bloc headOffice (et pas EUOffice)
      const headOffice = bloc.match(/<headOffice>([\s\S]*?)<\/headOffice>/i)?.[1] ?? ''

      this._index.set(code, {
        code,
        nom,
        acronym: extraireBalise(bloc, 'acronym'),
        entityForm: extraireBalise(bloc, 'entityForm'),
        site: extraireBalise(bloc, 'webSiteURL'),
        categorie: extraireBalise(bloc, 'registrationCategory'),
        pays: extraireBalise(headOffice, 'country'),
        ville: extraireBalise(headOffice, 'city'),
        epAccredites: Number(extraireBalise(bloc, 'EPAccreditedNumber')) || 0,
        dateInscription: extraireBalise(bloc, 'registrationDate'),
      })
    }
  }

  /**
   * Mappe une entrée indexée vers une EntiteNormalisee de type Organisation.
   *
   * @param {object} e
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageEntite(e) {
    const urlSource = `https://ec.europa.eu/transparencyregister/public/consultation/displaylobbyist.do?id=${encodeURIComponent(e.code)}`
    const sourceInfo = { source: 'Registre de transparence UE', url: urlSource }

    const adresse = [e.ville, e.pays].filter(Boolean).join(', ') || null
    const description =
      `Représentant d'intérêts inscrit au registre de transparence UE` +
      `${e.categorie ? ` · ${e.categorie}` : ''}` +
      `${e.epAccredites ? ` · ${e.epAccredites} accrédité(s) au Parlement européen` : ''}` +
      `${adresse ? ` · ${adresse}` : ''}` +
      ` · Code ${e.code}`

    const champs = {
      nom: marquerProvenance(e.nom, sourceInfo),
      sigle: marquerProvenance(e.acronym, sourceInfo),
      typeOrganisation: marquerProvenance(this._categorieVersType(e.categorie), sourceInfo),
      qualiteInfluence: marquerProvenance('LOBBYISTE', sourceInfo),
      pays: marquerProvenance(e.pays, sourceInfo),
      formeJuridique: marquerProvenance(e.entityForm, sourceInfo),
      adresseSiege: marquerProvenance(adresse, sourceInfo),
      libelleCommune: marquerProvenance(e.ville, sourceInfo),
      siteWeb: marquerProvenance(e.site, sourceInfo),
      identifiantRegistreUe: marquerProvenance(e.code, sourceInfo),
      dateCreation: marquerProvenance(e.dateInscription, sourceInfo),
      description: marquerProvenance(description, sourceInfo),
    }

    return creerEntiteNormalisee('Organisation', champs, [])
  }

  /** Mappe la catégorie d'inscription vers un TypeOrganisation. */
  _categorieVersType(categorie) {
    if (!categorie) return 'LOBBY'
    for (const [regex, type] of MAPPING_CATEGORIE) {
      if (regex.test(categorie)) return type
    }
    return 'LOBBY'
  }

  /**
   * Télécharge un fichier texte (bypass du parse JSON de `_appelHttp`), avec
   * rate-limit + cache. Même approche que `open-sanctions._telechargerTexte`.
   *
   * @param {string} url
   * @returns {Promise<string>}
   */
  async _telechargerTexte(url) {
    const { consommer } = await import('../rate-limit.js')
    const { lireCache, ecrireCache, hashCle } = await import('../cache.js')
    await consommer(this.nom)

    const cle = hashCle(this.nom, 'export-xml', { url })
    const cached = await lireCache(cle, this.ttlCache)
    if (cached !== null) return cached

    const userAgent =
      process.env.ENRICHISSEMENT_USER_AGENT ??
      'reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)'

    const controleur = new AbortController()
    const minuterie = setTimeout(() => controleur.abort(), this.timeoutMs)
    try {
      const reponse = await fetch(url, {
        signal: controleur.signal,
        headers: { 'User-Agent': userAgent, Accept: 'application/xml, text/xml, text/plain' },
      })
      if (!reponse.ok) {
        throw new Error(`[eu-transparence] HTTP ${reponse.status} sur ${url}`)
      }
      const texte = await reponse.text()
      await ecrireCache(cle, texte)
      return texte
    } finally {
      clearTimeout(minuterie)
    }
  }

  /** Réinitialise l'index (tests). */
  reinitialiser() {
    this._index = null
  }

  _enveloppe(resultats) {
    return {
      resultats,
      source: 'eu-transparence',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  _envEntite(entite) {
    return {
      entite,
      source: 'eu-transparence',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }
}
