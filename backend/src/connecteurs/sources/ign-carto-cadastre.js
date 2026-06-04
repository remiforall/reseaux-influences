/**
 * @module connecteurs/sources/ign-carto-cadastre
 * Connecteur API Carto IGN — module Cadastre.
 *
 * Endpoint : https://apicarto.ign.fr/api/cadastre/parcelle
 *   ?code_insee=<insee>&section=<section>&numero=<num>
 * Open data — aucune clé API requise.
 *
 * Couverture :
 *   - Référence cadastrale d'une parcelle (IDU, commune, section, numéro)
 *   - Surface en centiares (contenance)
 *   - Géométrie GeoJSON (Polygon) optionnelle
 *
 * Fraîcheur : cadastre mis à jour annuellement par la DGFiP.
 * Cache 24 h très adapté.
 *
 * Limites :
 *   - Pas de persistance Prisma dans ce lot (L3 uniquement).
 *     Le connecteur retourne des données normalisées en mémoire.
 *   - La `query` attend le format "codeInsee/section/numero"
 *     (ex: "75114/A/0012") ou "codeInsee/section" pour toutes les parcelles
 *     d'une section.
 *   - Propriété foncière nominative hors scope (fichiers MAJIC DGFiP,
 *     demande administrative requise — ADR-003).
 */

import { BaseConnecteur } from '../base.js';
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js';

const ENDPOINT_CADASTRE = 'https://apicarto.ign.fr/api/cadastre/parcelle';

/** Regex de validation du format de query cadastrale. */
const REGEX_QUERY_CADASTRE = /^(\d{5})\/([A-Z0-9]+)(?:\/(\d+))?$/i;

export default class IgnCartoCadastre extends BaseConnecteur {
  constructor() {
    super({
      nom: 'ign-carto-cadastre',
      version: '1.0.0',
      baseUrl: ENDPOINT_CADASTRE,
      rateLimit: {
        debit: Number(process.env.IGN_CARTO_RATE_LIMIT_DEBIT) || 5,
        capacite: Number(process.env.IGN_CARTO_RATE_LIMIT_CAPACITE) || 10,
      },
      ttlCache: Number(process.env.CACHE_TTL_MS) || 86_400_000,
      timeoutMs: 15_000,
    });
  }

  /**
   * Recherche des parcelles cadastrales par référence.
   *
   * @param {string} query
   *   Format : "codeInsee/section" ou "codeInsee/section/numero"
   *   Ex : "75114/A" ou "75114/A/0012"
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query) {
    const correspondance = query?.trim().match(REGEX_QUERY_CADASTRE);
    if (!correspondance) {
      return this._enveloppe([]);
    }

    const [, codeInsee, section, numero] = correspondance;
    const params = new URLSearchParams({
      code_insee: codeInsee,
      section: section.toUpperCase(),
    });
    if (numero) params.set('numero', numero.padStart(4, '0'));

    const url = `${ENDPOINT_CADASTRE}?${params}`;
    let donnees;
    try {
      donnees = await this._appelHttp(url, {
        cacheMethode: 'rechercher',
        cacheArgs: { codeInsee, section, numero: numero ?? null },
      });
    } catch (err) {
      if (err.status === 404) return this._enveloppe([]);
      throw err;
    }

    const features = donnees.features ?? [];
    return this._enveloppe(features.map((f) => this._mappageFeature(f)));
  }

  /**
   * Retourne le détail d'une parcelle par son IDU (Identifiant Unique).
   *
   * @param {string} idu - Format : "75114000A0012"
   * @returns {Promise<{ entite: object|null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(idu) {
    if (!idu || idu.length < 10) {
      return {
        entite: null,
        source: 'IGN Cadastre',
        dateRecuperation: new Date().toISOString(),
        version: this.version,
      };
    }

    // Décompose l'IDU : 5 chiffres INSEE + 3 préfixe + 1 lettre section + 4 numéro
    const codeInsee = idu.substring(0, 5);
    const section = idu.substring(8, 9);
    const numero = idu.substring(9, 13);

    const resultats = await this.rechercher(`${codeInsee}/${section}/${numero}`);
    const entite = resultats.resultats[0] ?? null;
    return {
      entite,
      source: 'IGN Cadastre',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  /**
   * Pas de liens suggérés pour les parcelles (propriété nominative hors scope).
   *
   * @param {string} _idu
   */
  async listerLiens(_idu) {
    return {
      liens: [],
      source: 'IGN Cadastre',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  // ─── Méthodes internes ──────────────────────────────────────────────────────

  /**
   * Mappe une Feature GeoJSON cadastre vers une EntiteNormalisee de type Parcelle.
   *
   * @param {{ geometry: object, properties: object }} feature
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageFeature(feature) {
    const props = feature.properties ?? {};
    const sourceInfo = { source: 'IGN Cadastre', url: ENDPOINT_CADASTRE };

    return creerEntiteNormalisee(
      'Parcelle',
      {
        idu: marquerProvenance(props.idu ?? props.id ?? null, sourceInfo),
        codeInsee: marquerProvenance(props.commune ?? null, sourceInfo),
        section: marquerProvenance(props.section ?? null, sourceInfo),
        numero: marquerProvenance(props.numero ?? null, sourceInfo),
        contenance: marquerProvenance(props.contenance ?? null, sourceInfo),
        geometrie: marquerProvenance(feature.geometry ?? null, sourceInfo),
      },
      [],
    );
  }

  /** Enveloppe un tableau de résultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'IGN Cadastre',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }
}
