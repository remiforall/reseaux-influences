/**
 * @module connecteurs/sources/gleif
 * Connecteur GLEIF — Global Legal Entity Identifier Foundation (ADR-021).
 *
 * Endpoint : https://api.gleif.org/api/v1/lei-records
 * Open data, aucune clé API requise. Format JSON:API.
 *
 * GLEIF est l'autorité mondiale du système LEI (ISO 17442), supervisée par le
 * Regulatory Oversight Committee (régulateurs financiers du G20). Chaque LEI
 * identifie de façon unique une entité juridique dans le monde, avec ses
 * relations de propriété/contrôle (société mère directe, mère ultime, filiales).
 *
 * Couverture : ~2,7 M d'entités juridiques dans plus de 200 juridictions —
 * c'est la brique « mondiale » de la cartographie d'influence économique,
 * complémentaire des registres nationaux (recherche-entreprises pour la FR).
 *
 * Garde-fous (ADR-003/017) : source publique officielle, pas de scraping,
 * relations capitalistiques uniquement entre personnes morales (jamais de
 * personne physique → hors champ art. 9/10).
 *
 * Fraîcheur : déclarations LEI mises à jour annuellement par les entités ;
 * cache 24 h suffisant.
 */

import { BaseConnecteur } from '../base.js'
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js'

const ENDPOINT_BASE = 'https://api.gleif.org/api/v1/lei-records'

/** LEI = 20 caractères alphanumériques majuscules (ISO 17442). */
const REGEX_LEI = /^[0-9A-Z]{18}[0-9]{2}$/

export default class GleifConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'gleif',
      version: '1.0.0',
      baseUrl: ENDPOINT_BASE,
      rateLimit: {
        debit: Number(process.env.GLEIF_RATE_LIMIT_DEBIT) || 5,
        capacite: Number(process.env.GLEIF_RATE_LIMIT_CAPACITE) || 10,
      },
      ttlCache: Number(process.env.CACHE_TTL_MS) || 86_400_000,
      timeoutMs: 15_000,
    })
  }

  /**
   * Recherche d'entités juridiques par texte libre (raison sociale, LEI).
   *
   * @param {string} query - Terme de recherche (min 2 caractères)
   * @param {object} [options]
   * @param {number} [options.perPage=10] - Nombre de résultats (max 25)
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query, options = {}) {
    const terme = String(query ?? '').trim()
    if (terme.length < 2) return this._enveloppe([])

    const perPage = Math.min(Number(options.perPage) || 10, 25)
    // Recherche directe par LEI si le terme en est un, sinon plein-texte.
    const filtre = REGEX_LEI.test(terme)
      ? `filter[lei]=${encodeURIComponent(terme)}`
      : `filter[fulltext]=${encodeURIComponent(terme)}`
    const url = `${ENDPOINT_BASE}?${filtre}&page[size]=${perPage}&page[number]=1`

    const donnees = await this._appelHttp(url, {
      cacheMethode: 'rechercher',
      cacheArgs: { terme, perPage },
    })

    const resultats = (donnees.data ?? []).map((item) => this._mappageEntite(item))
    return this._enveloppe(resultats)
  }

  /**
   * Détail d'une entité par son LEI.
   *
   * @param {string} lei
   * @returns {Promise<{ entite: object|null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(lei) {
    const leiPropre = String(lei ?? '').trim().toUpperCase()
    if (!REGEX_LEI.test(leiPropre)) {
      return this._envEntite(null)
    }

    const url = `${ENDPOINT_BASE}/${leiPropre}`
    let donnees
    try {
      donnees = await this._appelHttp(url, { cacheMethode: 'detailler', cacheArgs: leiPropre })
    } catch (err) {
      if (err.status === 404) return this._envEntite(null)
      throw err
    }

    const entite = donnees.data ? this._mappageEntite(donnees.data) : null
    return this._envEntite(entite)
  }

  /**
   * Liens de propriété/contrôle suggérés depuis un LEI : société mère directe,
   * mère ultime, et filiales directes. Chaque lien pointe vers une Organisation.
   *
   * @param {string} lei
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(lei) {
    const leiPropre = String(lei ?? '').trim().toUpperCase()
    if (!REGEX_LEI.test(leiPropre)) return this._envLiens([])

    const liens = []
    const urlBase = `https://search.gleif.org/#/record/${leiPropre}`
    const sourceInfo = { source: 'api.gleif.org', url: urlBase }

    // Mères : un seul enregistrement chacun (ou 404 si absent)
    for (const [rel, role] of [
      ['direct-parent', 'Société mère directe'],
      ['ultimate-parent', 'Société mère ultime'],
    ]) {
      const parent = await this._relationUnique(leiPropre, rel)
      if (parent) liens.push(this._lienVersOrganisation(parent, role, sourceInfo))
    }

    // Filiales directes : liste paginée — on prend la 1re page (max 15)
    const enfants = await this._relationListe(leiPropre, 'direct-children', 15)
    for (const enfant of enfants) {
      liens.push(this._lienVersOrganisation(enfant, 'Filiale directe', sourceInfo))
    }

    return this._envLiens(liens)
  }

  // ─── Méthodes internes ──────────────────────────────────────────────────────

  /**
   * Mappe un lei-record JSON:API vers une EntiteNormalisee de type Organisation.
   *
   * @param {object} item - élément `data` de l'API GLEIF
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageEntite(item) {
    const attrs = item.attributes ?? {}
    const ent = attrs.entity ?? {}
    const reg = attrs.registration ?? {}
    const lei = attrs.lei ?? item.id
    const urlSource = `https://search.gleif.org/#/record/${lei}`
    const sourceInfo = { source: 'api.gleif.org', url: urlSource }

    const nom = ent.legalName?.name ?? null
    const juridiction = ent.legalJurisdiction ?? null // ISO 3166 (ex: 'FR', 'US')
    const adresse = this._formaterAdresse(ent.legalAddress ?? ent.headquartersAddress)
    const formeJuridique = ent.legalForm?.id ?? null
    const statut = ent.status ?? null

    const description =
      `LEI ${lei}` +
      `${juridiction ? ` · Juridiction ${juridiction}` : ''}` +
      `${ent.category ? ` · ${ent.category}` : ''}` +
      `${statut ? ` · ${statut}` : ''}` +
      `${adresse ? ` · ${adresse}` : ''}`

    const champs = {
      nom: marquerProvenance(nom, sourceInfo),
      typeOrganisation: marquerProvenance('ENTREPRISE', sourceInfo),
      pays: marquerProvenance(juridiction, sourceInfo),
      formeJuridique: marquerProvenance(formeJuridique, sourceInfo),
      adresseSiege: marquerProvenance(adresse, sourceInfo),
      identifiantLei: marquerProvenance(lei, sourceInfo),
      etatAdministratif: marquerProvenance(statut, sourceInfo),
      dateCreation: marquerProvenance(reg.initialRegistrationDate ?? null, sourceInfo),
      description: marquerProvenance(description, sourceInfo),
    }

    return creerEntiteNormalisee('Organisation', champs, [])
  }

  /**
   * Construit un lien suggéré vers une Organisation à partir d'un lei-record.
   * Relations capitalistiques → code BENEFICIAIRE_EFFECTIF (propriété/contrôle).
   *
   * @param {object} item - lei-record cible
   * @param {string} role - libellé lisible ('Société mère ultime', 'Filiale directe'…)
   * @param {{ source: string, url: string }} sourceInfo
   * @returns {object}
   */
  _lienVersOrganisation(item, role, sourceInfo) {
    const attrs = item.attributes ?? {}
    const lei = attrs.lei ?? item.id
    const nom = attrs.entity?.legalName?.name ?? lei
    return {
      vers: {
        type: 'Organisation',
        identifiantExterne: lei,
        details: { identifiantLei: lei, nom, pays: attrs.entity?.legalJurisdiction ?? null },
      },
      typeLienCode: 'BENEFICIAIRE_EFFECTIF',
      roleRelation: role,
      source: sourceInfo.source,
      url: `https://search.gleif.org/#/record/${lei}`,
      date: new Date().toISOString(),
    }
  }

  /**
   * Récupère une relation 1:1 (direct-parent / ultimate-parent). 404 → null.
   *
   * @param {string} lei
   * @param {string} relation
   * @returns {Promise<object|null>}
   */
  async _relationUnique(lei, relation) {
    const url = `${ENDPOINT_BASE}/${lei}/${relation}`
    try {
      const donnees = await this._appelHttp(url, {
        cacheMethode: relation,
        cacheArgs: lei,
      })
      return donnees.data ?? null
    } catch (err) {
      if (err.status === 404) return null
      throw err
    }
  }

  /**
   * Récupère une relation 1:N (direct-children). 404 → [].
   *
   * @param {string} lei
   * @param {string} relation
   * @param {number} taille
   * @returns {Promise<Array>}
   */
  async _relationListe(lei, relation, taille) {
    const url = `${ENDPOINT_BASE}/${lei}/${relation}?page[size]=${taille}&page[number]=1`
    try {
      const donnees = await this._appelHttp(url, {
        cacheMethode: relation,
        cacheArgs: { lei, taille },
      })
      return donnees.data ?? []
    } catch (err) {
      if (err.status === 404) return []
      throw err
    }
  }

  /**
   * Formate une adresse GLEIF (JSON:API) en chaîne lisible.
   *
   * @param {object} [adr]
   * @returns {string|null}
   */
  _formaterAdresse(adr) {
    if (!adr) return null
    const lignes = Array.isArray(adr.addressLines) ? adr.addressLines : []
    const morceaux = [...lignes, adr.postalCode, adr.city, adr.country].filter(Boolean)
    return morceaux.length ? morceaux.join(' ') : null
  }

  _enveloppe(resultats) {
    return {
      resultats,
      source: 'gleif',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  _envEntite(entite) {
    return { entite, source: 'gleif', dateRecuperation: new Date().toISOString(), version: this.version }
  }

  _envLiens(liens) {
    return { liens, source: 'gleif', dateRecuperation: new Date().toISOString(), version: this.version }
  }
}
