/**
 * @module connecteurs/sources/ign-dvf
 * Connecteur DVF (Demandes de Valeurs Foncières).
 *
 * Endpoint principal : https://app.dvf.etalab.gouv.fr/api/mutations3/<codeInsee>/<section>
 * Endpoint de fallback : https://api.cquest.org/dvf?code_commune=<insee>
 * Open data — aucune clé API requise.
 *
 * Couverture :
 *   - Transactions immobilières publiques depuis 2014
 *   - Prix, surface, type de local, adresse, références cadastrales
 *
 * Fraîcheur : DVF mis à jour annuellement par la DGFiP (délai ~6 mois).
 * Cache 24 h très adapté — les données ne changent pas au quotidien.
 *
 * Limites :
 *   - DÉCISION RGPD EXPLICITE : aucun nom de propriétaire n'est exposé.
 *     Le DVF public ne contient pas de noms depuis la loi ELAN (2018).
 *   - Requiert un code INSEE de commune (5 chiffres) + section cadastrale.
 *     La méthode `rechercher()` attend le format "codeInsee/section"
 *     (ex: "75114/A") ou un code INSEE seul (fallback API cquest.org).
 *   - Données absentes pour certaines communes (collectivités d'outre-mer).
 */

import { BaseConnecteur } from '../base.js';
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js';

const ENDPOINT_DVF_ETALAB = 'https://app.dvf.etalab.gouv.fr/api/mutations3';
const ENDPOINT_DVF_FALLBACK = 'https://api.cquest.org/dvf';

/** Regex de validation d'un code INSEE commune (5 chiffres). */
const REGEX_INSEE = /^\d{5}$/;

/** Regex de validation du format "codeInsee/section". */
const REGEX_INSEE_SECTION = /^(\d{5})\/([A-Z0-9]+)$/i;

export default class IgnDvfConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'ign-dvf',
      version: '1.0.0',
      baseUrl: ENDPOINT_DVF_ETALAB,
      rateLimit: {
        debit: Number(process.env.IGN_DVF_RATE_LIMIT_DEBIT) || 5,
        capacite: Number(process.env.IGN_DVF_RATE_LIMIT_CAPACITE) || 10,
      },
      ttlCache: Number(process.env.CACHE_TTL_MS) || 86_400_000,
      timeoutMs: 15_000,
    });
  }

  /**
   * Recherche des transactions foncières par code INSEE et section cadastrale.
   *
   * @param {string} query
   *   Format accepté :
   *   - "75114/A"   → API Etalab (codeInsee + section)
   *   - "75114"     → API cquest.org (fallback, code INSEE seul)
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query) {
    if (!query?.trim()) {
      return this._enveloppe([]);
    }

    const correspondance = query.trim().match(REGEX_INSEE_SECTION);

    if (correspondance) {
      const [, codeInsee, section] = correspondance;
      return this._rechercherEtalab(codeInsee, section.toUpperCase());
    }

    if (REGEX_INSEE.test(query.trim())) {
      return this._rechercherFallback(query.trim());
    }

    return this._enveloppe([]);
  }

  /**
   * Non supporté directement — les mutations DVF n'ont pas d'identifiant stable
   * accessible par API publique.
   *
   * @param {string} _id
   */
  async detailler(_id) {
    throw new Error(
      '[ign-dvf] detailler() non supporté — utiliser rechercher("codeInsee/section")',
    );
  }

  /**
   * Non supporté par DVF (pas de liens entre mutations).
   *
   * @param {string} _id
   */
  async listerLiens(_id) {
    return {
      liens: [],
      source: 'DVF',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  // ─── Méthodes internes ──────────────────────────────────────────────────────

  async _rechercherEtalab(codeInsee, section) {
    const url = `${ENDPOINT_DVF_ETALAB}/${encodeURIComponent(codeInsee)}/${encodeURIComponent(section)}`;
    let donnees;
    try {
      donnees = await this._appelHttp(url, {
        cacheMethode: 'rechercher-etalab',
        cacheArgs: { codeInsee, section },
      });
    } catch (err) {
      if (err.status === 404) return this._enveloppe([]);
      throw err;
    }

    const features = donnees.features ?? [];
    return this._enveloppe(features.map((f) => this._mappageFeature(f)));
  }

  async _rechercherFallback(codeInsee) {
    const params = new URLSearchParams({ code_commune: codeInsee });
    const url = `${ENDPOINT_DVF_FALLBACK}?${params}`;
    let donnees;
    try {
      donnees = await this._appelHttp(url, {
        cacheMethode: 'rechercher-fallback',
        cacheArgs: { codeInsee },
      });
    } catch (err) {
      if (err.status === 404) return this._enveloppe([]);
      throw err;
    }

    const features = donnees.features ?? [];
    return this._enveloppe(features.map((f) => this._mappageFeature(f)));
  }

  /**
   * Mappe une Feature GeoJSON DVF vers une EntiteNormalisee TransactionFonciere.
   *
   * @param {{ geometry: object, properties: object }} feature
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageFeature(feature) {
    const props = feature.properties ?? {};
    const sourceInfo = { source: 'DVF', url: ENDPOINT_DVF_ETALAB };

    const adresse = [
      props.adresse_numero,
      props.adresse_nom_voie,
      props.code_postal,
      props.nom_commune,
    ]
      .filter(Boolean)
      .join(' ');

    const parcelles = props.id_parcelle ? [props.id_parcelle] : [];

    return creerEntiteNormalisee(
      'TransactionFonciere',
      {
        dateMutation: marquerProvenance(props.date_mutation ?? null, sourceInfo),
        valeurFonciere: marquerProvenance(props.valeur_fonciere ?? null, sourceInfo),
        surface: marquerProvenance(props.surface_reelle_bati ?? null, sourceInfo),
        typeLocal: marquerProvenance(props.type_local ?? null, sourceInfo),
        adresse: marquerProvenance(adresse || null, sourceInfo),
        parcelles: marquerProvenance(parcelles, sourceInfo),
      },
      [],
    );
  }

  /** Enveloppe un tableau de résultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'DVF',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }
}
