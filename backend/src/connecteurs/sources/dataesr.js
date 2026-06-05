/**
 * @module connecteurs/sources/dataesr
 * Connecteur DataESR — Enseignement superieur, recherche, subventions.
 *
 * Endpoint : https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/
 *            catalog/datasets/fr-esr-structures-recherche-publiques-actives/records
 *
 * ETAT IMPLEMENTATION : FONCTIONNEL sur le dataset "structures de recherche publiques".
 *
 * Datasets disponibles explores (2026-05-12) :
 *   - fr-esr-structures-recherche-publiques-actives : laboratoires, EPST, UMR (choisi)
 *   - fr-esr-doctorat-par-grand-domaine : statistiques theses (pas de recherche par nom)
 *   - Les datasets de subventions specifiques sont fragmentes par annee et necessitent
 *     une investigation supplementaire (post-MVP, cf. ADR-012).
 *
 * Couverture actuelle :
 *   - Laboratoires et structures de recherche publiques actives
 *   - Champs : denomination, sigle, tutelle, ville, code UAI, SIRET, effectifs
 *
 * Limites :
 *   - Les subventions individuelles par chercheur ne sont pas dans ce dataset.
 *   - Les publications scientifiques par auteur necessitent l'API HAL (post-MVP).
 *   - Le dataset theses (STEP/theses.fr) n'expose pas d'endpoint de recherche par nom.
 */

import { BaseConnecteur } from '../base.js'
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js'

const ENDPOINT_STRUCTURES =
  'https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/' +
  'fr-esr-structures-recherche-publiques-actives/records'

const LIMITE_PAR_PAGE = 10

export default class DataEsrConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'dataesr',
      version: '1.0.0',
      baseUrl: ENDPOINT_STRUCTURES,
      rateLimit: {
        debit: Number(process.env.DATAESR_RATE_LIMIT_DEBIT) || 5,
        capacite: Number(process.env.DATAESR_RATE_LIMIT_CAPACITE) || 10,
      },
      ttlCache: Number(process.env.CACHE_TTL_MS) || 86_400_000,
      timeoutMs: 20_000,
    })
  }

  /**
   * Recherche de structures de recherche par denomination ou sigle.
   *
   * @param {string} query - Terme de recherche (nom, sigle, ville)
   * @param {object} [options]
   * @param {number} [options.limit=10] - Nombre de resultats (max 100)
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query, options = {}) {
    const terme = String(query ?? '').trim()
    if (terme.length < 2) return this._enveloppe([])

    const limite = Math.min(Number(options.limit) || LIMITE_PAR_PAGE, 100)

    // Recherche full-text OpenDataSoft v2.1 : ?q=... (la clause `where ... like`
    // est restreinte aux types numériques sur cette version).
    const url = `${ENDPOINT_STRUCTURES}?q=${encodeURIComponent(terme)}` + `&limit=${limite}`

    const donnees = await this._appelHttp(url, {
      cacheMethode: 'rechercher',
      cacheArgs: { terme, limite },
      headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip' },
    })

    const resultats = (donnees.results ?? []).map((item) => this._mappageStructure(item))

    return this._enveloppe(resultats)
  }

  /**
   * Detail d'une structure par son code UAI ou identifiant.
   *
   * @param {string} id - Code UAI (ex: "0751717J") ou identifiant interne
   * @returns {Promise<{ entite: object|null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(id) {
    const idPropre = String(id ?? '').trim()
    if (!idPropre) {
      return {
        entite: null,
        source: 'DataESR',
        dateRecuperation: new Date().toISOString(),
        version: this.version,
      }
    }

    // Détail par identifiant exact : on passe par la recherche full-text aussi.
    const url = `${ENDPOINT_STRUCTURES}?q=${encodeURIComponent(idPropre)}&limit=1`

    const donnees = await this._appelHttp(url, {
      cacheMethode: 'detailler',
      cacheArgs: idPropre,
      headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip' },
    })

    const item = donnees.results?.[0] ?? null
    const entite = item ? this._mappageStructure(item) : null

    return {
      entite,
      source: 'DataESR',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  /**
   * Liens suggeres depuis une structure (tutelles, etablissements partenaires).
   *
   * @param {string} id
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(id) {
    const detail = await this.detailler(id)
    const liens = detail.entite?.liensSuggeres ?? []
    return {
      liens,
      source: 'DataESR',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  // --- Methodes internes ---

  /**
   * Mappe un enregistrement DataESR vers une EntiteNormalisee Organisation.
   *
   * @param {object} item - Enregistrement brut de l'API
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageStructure(item) {
    const uai = item.uai ?? item.numero_national_de_structure ?? null
    const urlSource = uai
      ? `https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-structures-recherche-publiques-actives/information/?q=${uai}`
      : `https://data.enseignementsup-recherche.gouv.fr`
    const sourceInfo = { source: 'DataESR', url: urlSource }

    const denomination = item.libelle ?? item.uo_lib ?? 'Structure inconnue'
    const sigle = item.sigle ?? null
    const ville = item.ville_principale ?? item.commune_principale ?? null
    const tutelle = item.tutelle_principale ?? item.etablissement_principal ?? null
    const siret = item.siret ?? null
    const effectifs = item.effectifs ?? null

    const descriptionParties = [
      `UAI : ${uai ?? '?'}`,
      sigle ? `Sigle : ${sigle}` : null,
      tutelle ? `Tutelle : ${tutelle}` : null,
      ville ? `Ville : ${ville}` : null,
      effectifs ? `Effectifs : ${effectifs}` : null,
    ]
      .filter(Boolean)
      .join(' · ')

    const champs = {
      nom: marquerProvenance(denomination, sourceInfo),
      sigle: marquerProvenance(sigle, sourceInfo),
      siret: marquerProvenance(siret, sourceInfo),
      typeOrganisation: marquerProvenance('LABORATOIRE_RECHERCHE', sourceInfo),
      pays: marquerProvenance('France', sourceInfo),
      libelleCommune: marquerProvenance(ville, sourceInfo),
      description: marquerProvenance(descriptionParties, sourceInfo),
      codeUai: marquerProvenance(uai, sourceInfo),
      tutellePrincipale: marquerProvenance(tutelle, sourceInfo),
    }

    const liensSuggeres = []
    const maintenant = new Date().toISOString()

    // Lien vers la tutelle principale (ex: CNRS, INSERM, universite)
    if (tutelle) {
      liensSuggeres.push({
        vers: { type: 'Organisation', identifiantExterne: tutelle },
        typeLienCode: 'institutionnel',
        source: 'DataESR',
        url: urlSource,
        date: maintenant,
      })
    }

    // Tutelles secondaires
    const tutellesSecondaires = [
      item.tutelle_secondaire_1,
      item.tutelle_secondaire_2,
      item.etablissement_secondaire_1,
    ].filter(Boolean)

    for (const tutelleSecondaire of tutellesSecondaires) {
      liensSuggeres.push({
        vers: { type: 'Organisation', identifiantExterne: tutelleSecondaire },
        typeLienCode: 'institutionnel',
        source: 'DataESR',
        url: urlSource,
        date: maintenant,
      })
    }

    return creerEntiteNormalisee('Organisation', champs, liensSuggeres)
  }

  /** Enveloppe un tableau de resultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'DataESR',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }
}
