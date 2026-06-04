/**
 * @module connecteurs/sources/ign-carto-gpu
 * Connecteur API Carto IGN — module GPU (Géoportail de l'Urbanisme).
 *
 * Endpoint : https://apicarto.ign.fr/api/gpu/zone-urba?geom=<geojson>
 * Open data — aucune clé API requise.
 *
 * Couverture :
 *   - Zones d'urbanisme (PLU/POS/CC/PSMV) intersectant une géométrie GeoJSON
 *   - Libellé de zone, type (U, AU, A, N…), destinations principales
 *   - Référence au document d'urbanisme (URL Géoportail Urbanisme)
 *
 * Fraîcheur : GPU mis à jour au fil des approbations PLU (délai variable
 * selon les communes). Cache 24 h adapté pour un usage OSINT.
 *
 * Limites :
 *   - La `query` attend un GeoJSON Point ou Polygon sérialisé en JSON string,
 *     ou des coordonnées "lon,lat" (raccourci qui construit un Point).
 *   - Résultats peuvent couvrir plusieurs documents d'urbanisme superposés.
 *   - Données indisponibles pour certaines communes non numérisées.
 */

import { BaseConnecteur } from '../base.js';
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js';

const ENDPOINT_GPU = 'https://apicarto.ign.fr/api/gpu/zone-urba';

/** Regex pour détecter "lon,lat" (raccourci coordonnées). */
const REGEX_COORDONNEES = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/;

export default class IgnCartoGpu extends BaseConnecteur {
  constructor() {
    super({
      nom: 'ign-carto-gpu',
      version: '1.0.0',
      baseUrl: ENDPOINT_GPU,
      rateLimit: {
        debit: Number(process.env.IGN_CARTO_RATE_LIMIT_DEBIT) || 5,
        capacite: Number(process.env.IGN_CARTO_RATE_LIMIT_CAPACITE) || 10,
      },
      ttlCache: Number(process.env.CACHE_TTL_MS) || 86_400_000,
      timeoutMs: 15_000,
    });
  }

  /**
   * Recherche les zones d'urbanisme intersectant une géométrie.
   *
   * @param {string} query
   *   Formats acceptés :
   *   - "2.3488,48.8534"  → Point GeoJSON construit automatiquement
   *   - '{"type":"Point","coordinates":[2.3488,48.8534]}'  → GeoJSON brut
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query) {
    if (!query?.trim()) {
      return this._enveloppe([]);
    }

    const geom = this._parseGeom(query.trim());
    if (!geom) {
      return this._enveloppe([]);
    }

    const params = new URLSearchParams({ geom: JSON.stringify(geom) });
    const url = `${ENDPOINT_GPU}?${params}`;

    let donnees;
    try {
      donnees = await this._appelHttp(url, {
        cacheMethode: 'rechercher',
        cacheArgs: { geom },
      });
    } catch (err) {
      if (err.status === 404) return this._enveloppe([]);
      throw err;
    }

    const features = donnees.features ?? [];
    return this._enveloppe(features.map((f) => this._mappageFeature(f)));
  }

  /**
   * Non supporté directement — les zones GPU n'ont pas d'identifiant stable
   * accessible individuellement par l'API.
   *
   * @param {string} _id
   */
  async detailler(_id) {
    throw new Error('[ign-carto-gpu] detailler() non supporté — utiliser rechercher("lon,lat")');
  }

  /**
   * Pas de liens suggérés pour les zones d'urbanisme.
   *
   * @param {string} _id
   */
  async listerLiens(_id) {
    return {
      liens: [],
      source: 'IGN GPU',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  // ─── Méthodes internes ──────────────────────────────────────────────────────

  /**
   * Parse la query en objet GeoJSON.
   *
   * @param {string} query
   * @returns {object|null}
   */
  _parseGeom(query) {
    // Raccourci "lon,lat"
    const match = query.match(REGEX_COORDONNEES);
    if (match) {
      return {
        type: 'Point',
        coordinates: [parseFloat(match[1]), parseFloat(match[2])],
      };
    }

    // Tentative de parse JSON direct
    try {
      const geojson = JSON.parse(query);
      if (geojson?.type && geojson?.coordinates) return geojson;
    } catch {
      // Pas du JSON valide
    }

    return null;
  }

  /**
   * Mappe une Feature GeoJSON GPU vers une EntiteNormalisee de type ZoneUrbanisme.
   *
   * @param {{ geometry: object, properties: object }} feature
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageFeature(feature) {
    const props = feature.properties ?? {};
    const sourceInfo = { source: 'IGN GPU', url: props.urlfic ?? ENDPOINT_GPU };

    return creerEntiteNormalisee(
      'ZoneUrbanisme',
      {
        libelle: marquerProvenance(props.libelong ?? props.libelle ?? null, sourceInfo),
        typezone: marquerProvenance(props.typezone ?? null, sourceInfo),
        destinations: marquerProvenance(props.destdomi ?? null, sourceInfo),
      },
      [],
    );
  }

  /** Enveloppe un tableau de résultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'IGN GPU',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }
}
