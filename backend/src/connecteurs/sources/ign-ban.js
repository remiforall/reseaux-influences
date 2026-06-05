/**
 * @module connecteurs/sources/ign-ban
 * Connecteur API Adresse BAN (Base Adresse Nationale).
 *
 * Endpoint : https://api-adresse.data.gouv.fr/search/?q=<query>&limit=10
 * Open data — aucune clé API requise.
 *
 * Couverture :
 *   - Géocodage d'adresses françaises → lat/lon, code INSEE, code postal
 *   - Score de confiance du géocodage (0–1)
 *
 * Fraîcheur : BAN mise à jour hebdomadairement par les communes.
 * Cache 24 h adapté — les adresses changent rarement.
 *
 * Limites :
 *   - France métropolitaine + DOM uniquement
 *   - Pas de géocodage inverse dans ce connecteur (MVP)
 *   - Résultats limités à 10 par requête
 */

import { BaseConnecteur } from '../base.js'
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js'

const ENDPOINT_BAN = 'https://api-adresse.data.gouv.fr/search/'

export default class IgnBanConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'ign-ban',
      version: '1.0.0',
      baseUrl: ENDPOINT_BAN,
      rateLimit: {
        debit: Number(process.env.IGN_BAN_RATE_LIMIT_DEBIT) || 10,
        capacite: Number(process.env.IGN_BAN_RATE_LIMIT_CAPACITE) || 20,
      },
      ttlCache: Number(process.env.CACHE_TTL_MS) || 86_400_000,
      timeoutMs: 10_000,
    })
  }

  /**
   * Géocode une adresse textuelle.
   *
   * @param {string} query - Adresse à géocoder (ex: '5 avenue du Général Leclerc Paris')
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query) {
    if (!query || query.trim().length < 3) {
      return this._enveloppe([])
    }

    const params = new URLSearchParams({ q: query.trim(), limit: '10' })
    const url = `${ENDPOINT_BAN}?${params}`

    const donnees = await this._appelHttp(url, {
      cacheMethode: 'rechercher',
      cacheArgs: { query: query.trim() },
    })

    const features = donnees.features ?? []
    return this._enveloppe(features.map((f) => this._mappageFeature(f)))
  }

  /**
   * Non supporté par la BAN (pas d'identifiant stable par adresse).
   * Utiliser `rechercher()` à la place.
   *
   * @param {string} _id
   */
  async detailler(_id) {
    throw new Error('[ign-ban] detailler() non supporté — utiliser rechercher()')
  }

  /**
   * Non supporté par la BAN.
   *
   * @param {string} _id
   */
  async listerLiens(_id) {
    return {
      liens: [],
      source: 'BAN',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  // ─── Méthodes internes ──────────────────────────────────────────────────────

  /**
   * Mappe une Feature GeoJSON BAN vers une EntiteNormalisee de type Adresse.
   *
   * @param {{ geometry: object, properties: object }} feature
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageFeature(feature) {
    const props = feature.properties ?? {}
    const [lon, lat] = feature.geometry?.coordinates ?? [null, null]
    const sourceInfo = { source: 'BAN', url: ENDPOINT_BAN }

    return creerEntiteNormalisee(
      'Adresse',
      {
        adresseComplete: marquerProvenance(props.label ?? null, sourceInfo),
        lat: marquerProvenance(lat, sourceInfo),
        lon: marquerProvenance(lon, sourceInfo),
        codeInsee: marquerProvenance(props.citycode ?? null, sourceInfo),
        ville: marquerProvenance(props.city ?? null, sourceInfo),
        codePostal: marquerProvenance(props.postcode ?? null, sourceInfo),
        score: marquerProvenance(props.score ?? null, sourceInfo),
      },
      [],
    )
  }

  /** Enveloppe un tableau de résultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'BAN',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }
}
