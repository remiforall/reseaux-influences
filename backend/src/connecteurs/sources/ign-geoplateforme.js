/**
 * @module connecteurs/sources/ign-geoplateforme
 * Connecteur Géoplateforme IGN — fonds de plan cartographiques (stub).
 *
 * Ce connecteur est un stub : il ne fait aucun appel HTTP.
 * Son rôle est de fournir au frontend Leaflet/MapLibre les URLs de tuiles
 * WMS-R de la Géoplateforme IGN, sans passer par le backend.
 *
 * Endpoint WMS-R : https://data.geopf.fr/wms-r
 *
 * Couches disponibles (non exhaustif) :
 *   - GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2   → Plan IGN v2 (recommandé)
 *   - ORTHOIMAGERY.ORTHOPHOTOS            → Orthophotos
 *   - ADMINISTRATIVEUNITS.BOUNDARIES      → Limites administratives
 *   - CADASTRALPARCELS.PARCELLAIRE_EXPRESS → Parcellaire express
 *   - ELEVATION.SLOPES                    → Pentes
 *
 * Fraîcheur : les tuiles sont servies directement par la Géoplateforme IGN.
 * Pas de cache applicatif (les URLs sont statiques, le navigateur gère
 * son propre cache de tuiles).
 *
 * Limites :
 *   - Usage intensif (> 1 M tuiles/mois) nécessite une clé API Géoplateforme.
 *     Pour le MVP, l'usage anonyme avec User-Agent poli est toléré.
 *   - Ce stub ne gère pas les tuiles XYZ (TMS) — uniquement WMS-R.
 */

import { BaseConnecteur } from '../base.js';

const ENDPOINT_WMS_R = 'https://data.geopf.fr/wms-r';

/** Couches WMS-R disponibles sur la Géoplateforme IGN. */
export const COUCHES_DISPONIBLES = {
  PLAN_IGN: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
  ORTHOPHOTOS: 'ORTHOIMAGERY.ORTHOPHOTOS',
  LIMITES_ADMIN: 'ADMINISTRATIVEUNITS.BOUNDARIES',
  PARCELLAIRE: 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS',
  PENTES: 'ELEVATION.SLOPES',
};

export default class IgnGeoplateformeConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'ign-geoplateforme',
      version: '1.0.0',
      baseUrl: ENDPOINT_WMS_R,
      // Rate-limit fictif — ce connecteur ne fait pas d'appels HTTP
      rateLimit: { debit: 999, capacite: 999 },
      ttlCache: 0,
    });
  }

  /**
   * Non applicable — la Géoplateforme ne propose pas de recherche textuelle.
   *
   * @param {string} _query
   */
  async rechercher(_query) {
    return {
      resultats: [],
      source: 'IGN Géoplateforme',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  /**
   * Non applicable — pas d'entités requêtables individuellement.
   *
   * @param {string} _id
   */
  async detailler(_id) {
    throw new Error(
      '[ign-geoplateforme] detailler() non supporté — utiliser obtenirUrlFondCarte()',
    );
  }

  /**
   * Non applicable.
   *
   * @param {string} _id
   */
  async listerLiens(_id) {
    return {
      liens: [],
      source: 'IGN Géoplateforme',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  /**
   * Retourne l'URL WMS-R d'une tuile de fond de plan.
   *
   * Aucun appel HTTP — l'URL est construite statiquement et utilisée
   * directement par le frontend Leaflet/MapLibre via `WMSTileLayer`.
   *
   * @param {string} [layer] - Code couche IGN (défaut : PLAN_IGN)
   * @param {{
   *   minx: number, miny: number, maxx: number, maxy: number
   * }} [bbox] - Bounding box optionnelle (pour prévisualisation URL)
   * @param {{ width?: number, height?: number, srs?: string }} [options]
   * @returns {string} URL WMS-R complète
   *
   * @example
   * const url = connecteur.obtenirUrlFondCarte('ORTHOIMAGERY.ORTHOPHOTOS', {
   *   minx: 2.3, miny: 48.8, maxx: 2.4, maxy: 48.9
   * });
   * // https://data.geopf.fr/wms-r?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap
   * //   &LAYERS=ORTHOIMAGERY.ORTHOPHOTOS&STYLES=&CRS=EPSG:4326&...
   */
  obtenirUrlFondCarte(
    layer = COUCHES_DISPONIBLES.PLAN_IGN,
    bbox = null,
    { width = 256, height = 256, srs = 'EPSG:4326' } = {},
  ) {
    const params = new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.3.0',
      REQUEST: 'GetMap',
      LAYERS: layer,
      STYLES: '',
      CRS: srs,
      WIDTH: String(width),
      HEIGHT: String(height),
      FORMAT: 'image/png',
    });

    if (bbox) {
      params.set('BBOX', `${bbox.minx},${bbox.miny},${bbox.maxx},${bbox.maxy}`);
    }

    return `${ENDPOINT_WMS_R}?${params.toString()}`;
  }

  /**
   * Retourne l'URL de base WMS-R pour configuration Leaflet.
   *
   * À utiliser comme `url` dans `L.tileLayer.wms(url, { layers: '...' })`.
   *
   * @returns {string}
   */
  obtenirUrlBaseWms() {
    return ENDPOINT_WMS_R;
  }
}
