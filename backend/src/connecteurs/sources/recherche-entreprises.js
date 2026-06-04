/**
 * @module connecteurs/sources/recherche-entreprises
 * Connecteur API recherche-entreprises (data.gouv.fr / annuaire-entreprises).
 *
 * Endpoint : https://recherche-entreprises.api.gouv.fr/search
 * Open data, aucune clé API requise. Données issues du RNE (Registre National
 * des Entreprises) et de Sirene/INSEE.
 *
 * Couverture :
 *   - Toute entreprise française active ou cessée (RNE/Sirene)
 *   - Champs : nom, sigle, SIREN/SIRET, adresse, NAF, catégorie, dates
 *   - Dirigeants : personnes physiques (nom, prénoms, qualité, naissance)
 *     et personnes morales (filiations capitalistiques)
 *
 * Fraîcheur : J+1 à J+7 (synchronisation Sirene quotidienne, RNE plus lent).
 * Cache 24 h adapté.
 *
 * Limites :
 *   - France métropolitaine + DOM-TOM uniquement (entités françaises)
 *   - Pas de bénéficiaires effectifs détaillés (réservés à l'API INPI/Pappers)
 *   - Pas de comptes annuels (BNDB / INPI)
 */

import { BaseConnecteur } from '../base.js';
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js';

const ENDPOINT_BASE = 'https://recherche-entreprises.api.gouv.fr/search';

/** Mapping qualité dirigeant (du RNE) → code TypeLien. */
const MAPPING_QUALITE = new Map([
  ['Gérant', 'DIRIGEANT'],
  ['Président', 'DIRIGEANT'],
  ['Président du conseil d\'administration', 'DIRIGEANT'],
  ['Directeur général', 'DIRIGEANT'],
  ['Directeur général délégué', 'DIRIGEANT'],
  ['Membre du conseil de surveillance', 'DIRIGEANT'],
  ['Président du conseil de surveillance', 'DIRIGEANT'],
  ['Administrateur', 'DIRIGEANT'],
  ['Associé', 'BENEFICIAIRE_EFFECTIF'],
  ['Co-gérant', 'DIRIGEANT'],
  ['Fondateur', 'FONDATEUR'],
]);

export default class RechercheEntreprisesConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'recherche-entreprises',
      version: '1.0.0',
      baseUrl: ENDPOINT_BASE,
      rateLimit: {
        debit: Number(process.env.RECHERCHE_ENTREPRISES_RATE_LIMIT_DEBIT) || 7,
        capacite: Number(process.env.RECHERCHE_ENTREPRISES_RATE_LIMIT_CAPACITE) || 15,
      },
      ttlCache: Number(process.env.CACHE_TTL_MS) || 86_400_000,
      timeoutMs: 15_000,
    });
  }

  /**
   * Recherche d'entreprises par texte libre (raison sociale, sigle, SIREN…).
   *
   * @param {string} query - Terme de recherche (min 2 caractères)
   * @param {object} [options]
   * @param {number} [options.perPage=10] - Nombre de résultats (max 25)
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query, options = {}) {
    const terme = String(query ?? '').trim();
    if (terme.length < 2) return this._enveloppe([]);

    const perPage = Math.min(Number(options.perPage) || 10, 25);
    const url = `${ENDPOINT_BASE}?q=${encodeURIComponent(terme)}&page=1&per_page=${perPage}`;

    const donnees = await this._appelHttp(url, {
      cacheMethode: 'rechercher',
      cacheArgs: { terme, perPage },
    });

    const resultats = (donnees.results ?? []).map((item) => this._mappageEntreprise(item));
    return this._enveloppe(resultats);
  }

  /**
   * Détail d'une entreprise par SIREN (9 chiffres).
   *
   * @param {string} siren
   * @returns {Promise<{ entite: object|null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(siren) {
    const sirenPropre = String(siren ?? '').replace(/\s/g, '');
    if (!/^\d{9}$/.test(sirenPropre)) {
      return {
        entite: null,
        source: 'recherche-entreprises',
        dateRecuperation: new Date().toISOString(),
        version: this.version,
      };
    }

    const url = `${ENDPOINT_BASE}?q=${sirenPropre}&page=1&per_page=1`;
    const donnees = await this._appelHttp(url, {
      cacheMethode: 'detailler',
      cacheArgs: sirenPropre,
    });

    const item = donnees.results?.[0];
    const entite = item ? this._mappageEntreprise(item) : null;
    return {
      entite,
      source: 'recherche-entreprises',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  /**
   * Liens suggérés depuis une entreprise (dirigeants personnes physiques
   * et personnes morales). Reconstruit depuis `detailler`.
   *
   * @param {string} siren
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(siren) {
    const detail = await this.detailler(siren);
    const liens = detail.entite?.liensSuggeres ?? [];
    return {
      liens,
      source: 'recherche-entreprises',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  // ─── Méthodes internes ──────────────────────────────────────────────────────

  /**
   * Mappe un résultat d'API vers une EntiteNormalisee de type Organisation.
   *
   * @param {object} item - Un élément du tableau `results` renvoyé par l'API
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageEntreprise(item) {
    const urlSource = `https://annuaire-entreprises.data.gouv.fr/entreprise/${item.siren}`;
    const sourceInfo = { source: 'recherche-entreprises.api.gouv.fr', url: urlSource };

    const siege = item.siege ?? {};
    const adresseSiege = siege.adresse ?? null;
    const naf = item.activite_principale ?? null;
    const naturePresentable = this._presenterNature(item.nature_juridique);

    const description =
      `SIREN ${item.siren} · SIRET siège ${siege.siret ?? '?'} · ` +
      `NAF ${naf ?? '?'}${naturePresentable ? ` · ${naturePresentable}` : ''}` +
      `${item.categorie_entreprise ? ` · Catégorie ${item.categorie_entreprise}` : ''}` +
      `${adresseSiege ? ` · Siège ${adresseSiege}` : ''}`;

    const champs = {
      nom: marquerProvenance(item.nom_complet ?? item.nom_raison_sociale, sourceInfo),
      sigle: marquerProvenance(item.sigle, sourceInfo),
      siren: marquerProvenance(item.siren, sourceInfo),
      siret: marquerProvenance(siege.siret, sourceInfo),
      typeOrganisation: marquerProvenance('ENTREPRISE', sourceInfo),
      pays: marquerProvenance('France', sourceInfo),
      formeJuridique: marquerProvenance(naturePresentable, sourceInfo),
      categorieEntreprise: marquerProvenance(item.categorie_entreprise, sourceInfo),
      activitePrincipale: marquerProvenance(naf, sourceInfo),
      adresseSiege: marquerProvenance(adresseSiege, sourceInfo),
      codeInsee: marquerProvenance(siege.commune, sourceInfo),
      codePostal: marquerProvenance(siege.code_postal, sourceInfo),
      libelleCommune: marquerProvenance(siege.libelle_commune, sourceInfo),
      latitude: marquerProvenance(siege.latitude ? Number(siege.latitude) : null, sourceInfo),
      longitude: marquerProvenance(siege.longitude ? Number(siege.longitude) : null, sourceInfo),
      dateCreation: marquerProvenance(item.date_creation, sourceInfo),
      dateFermeture: marquerProvenance(item.date_fermeture, sourceInfo),
      etatAdministratif: marquerProvenance(item.etat_administratif, sourceInfo),
      description: marquerProvenance(description, sourceInfo),
    };

    const liensSuggeres = this._mapperDirigeants(item, sourceInfo);
    return creerEntiteNormalisee('Organisation', champs, liensSuggeres);
  }

  /**
   * Construit les liens suggérés pour chaque dirigeant.
   *
   * @param {object} item
   * @param {{ source: string, url: string }} sourceInfo
   * @returns {Array}
   */
  _mapperDirigeants(item, sourceInfo) {
    const dirigeants = item.dirigeants ?? [];
    const liens = [];
    const maintenant = new Date().toISOString();

    for (const dir of dirigeants) {
      const code = MAPPING_QUALITE.get(dir.qualite) ?? 'DIRIGEANT';

      if (dir.type_dirigeant === 'personne physique') {
        const prenoms = (dir.prenoms ?? '').trim();
        const nom = (dir.nom ?? '').trim();
        if (!nom) continue;
        const libelle = `${prenoms} ${nom}`.trim();
        liens.push({
          vers: {
            type: 'Personne',
            identifiantExterne: libelle,
            details: {
              nom,
              prenoms,
              anneeNaissance: dir.annee_de_naissance ?? null,
              dateNaissance: dir.date_de_naissance ?? null,
              nationalite: dir.nationalite ?? null,
            },
          },
          typeLienCode: code,
          qualiteDirigeant: dir.qualite,
          source: sourceInfo.source,
          url: sourceInfo.url,
          date: maintenant,
        });
      } else if (dir.type_dirigeant === 'personne morale') {
        const denomination = (dir.denomination ?? '').trim();
        if (!denomination) continue;
        liens.push({
          vers: {
            type: 'Organisation',
            identifiantExterne: dir.siren ?? denomination,
            details: { siren: dir.siren ?? null, denomination },
          },
          typeLienCode: code,
          qualiteDirigeant: dir.qualite,
          source: sourceInfo.source,
          url: sourceInfo.url,
          date: maintenant,
        });
      }
    }

    return liens;
  }

  /**
   * Mappe le code INSEE de nature juridique (4 chiffres) vers un libellé court.
   * Sous-ensemble des codes les plus fréquents. Retourne null si inconnu.
   *
   * @param {string|null} code
   * @returns {string|null}
   */
  _presenterNature(code) {
    if (!code) return null;
    const mapping = {
      1000: 'Entrepreneur individuel',
      5202: 'SCS',
      5306: 'SCA',
      5410: 'SARL',
      5485: 'SARL unipersonnelle',
      5499: 'SARL (autre)',
      5505: 'SA à conseil d\'administration',
      5510: 'SA à directoire',
      5520: 'SA d\'économie mixte',
      5599: 'SA (autre)',
      5710: 'SAS',
      5720: 'SAS unipersonnelle (SASU)',
      6540: 'SCI',
      9220: 'Association déclarée',
    };
    return mapping[code] ?? `Société (code INSEE ${code})`;
  }

  /** Enveloppe un tableau de résultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'recherche-entreprises',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }
}
