/**
 * @module connecteurs/sources/bodacc
 * Connecteur BODACC — Bulletin Officiel des Annonces Civiles et Commerciales.
 *
 * Endpoint : https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/
 *            catalog/datasets/annonces-commerciales/records
 *
 * Open data, aucune cle API requise. Les annonces couvrent :
 *   - Immatriculations, modifications et radiations (type A / B)
 *   - Procédures collectives (sauvegarde, redressement, liquidation)
 *   - Ventes et cessions de fonds de commerce
 *   - Dépôt de comptes annuels
 *
 * Recherche : clause WHERE OpenDataSoft sur denomination, registre, ville.
 * Fraicheur : J+1 (publication officielle quotidienne).
 * Cache 24 h adapte pour un usage OSINT.
 *
 * Limites :
 *   - L'API renvoie max 100 resultats par requete (limite OpenDataSoft).
 *   - La denomination indexee peut differer du nom commercial (accents, sigles).
 *   - Les codes SIREN ne sont pas systematiquement presents dans toutes les annonces.
 */

import { BaseConnecteur } from '../base.js';
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js';

const ENDPOINT_BASE =
  'https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records';

/** Nombre maximal de resultats par requete (limite API). */
const LIMITE_PAR_PAGE = 10;

export default class BodaccConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'bodacc',
      version: '1.0.0',
      baseUrl: ENDPOINT_BASE,
      rateLimit: {
        debit: Number(process.env.BODACC_RATE_LIMIT_DEBIT) || 5,
        capacite: Number(process.env.BODACC_RATE_LIMIT_CAPACITE) || 10,
      },
      ttlCache: Number(process.env.CACHE_TTL_MS) || 86_400_000,
      timeoutMs: 20_000,
    });
  }

  /**
   * Recherche d'annonces BODACC par denomination, SIREN ou ville.
   *
   * @param {string} query - Terme de recherche (denomination, SIREN, ville)
   * @param {object} [options]
   * @param {number} [options.limit=10] - Nombre de resultats (max 100)
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query, options = {}) {
    const terme = String(query ?? '').trim();
    if (terme.length < 2) return this._enveloppe([]);

    const limite = Math.min(Number(options.limit) || LIMITE_PAR_PAGE, 100);

    // Recherche full-text OpenDataSoft v2.1 : ?q=...
    // (la clause `where ... like ...` est limitée aux types numériques/dates côté
    //  OpenDataSoft v2.1 ; pour le texte libre, utiliser le paramètre `q`.)
    const url =
      `${ENDPOINT_BASE}?q=${encodeURIComponent(terme)}` +
      `&limit=${limite}` +
      `&order_by=dateparution%20desc`;

    const donnees = await this._appelHttp(url, {
      cacheMethode: 'rechercher',
      cacheArgs: { terme, limite },
      headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip' },
    });

    const annonces = donnees.results ?? [];

    // Regrouper les annonces par denomination pour creer une entite Organisation par societe
    const parSociete = this._regrouperParSociete(annonces);
    const resultats = [...parSociete.values()].map((groupe) =>
      this._mappageOrganisation(groupe),
    );

    return this._enveloppe(resultats);
  }

  /**
   * Detail des annonces BODACC pour un SIREN (9 chiffres).
   *
   * @param {string} siren
   * @returns {Promise<{ entite: object|null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(siren) {
    const sirenPropre = String(siren ?? '').replace(/\s/g, '');
    if (!/^\d{9}$/.test(sirenPropre)) {
      return {
        entite: null,
        source: 'BODACC',
        dateRecuperation: new Date().toISOString(),
        version: this.version,
      };
    }

    // Le SIREN apparaît dans plusieurs champs BODACC (numeroImmatriculation,
    // numeroRegistre…). On utilise la recherche full-text qui matche tous les champs.
    const url =
      `${ENDPOINT_BASE}?q=${encodeURIComponent(sirenPropre)}` +
      '&limit=20&order_by=dateparution%20desc';

    const donnees = await this._appelHttp(url, {
      cacheMethode: 'detailler',
      cacheArgs: sirenPropre,
      headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip' },
    });

    const annonces = donnees.results ?? [];
    if (annonces.length === 0) {
      return {
        entite: null,
        source: 'BODACC',
        dateRecuperation: new Date().toISOString(),
        version: this.version,
      };
    }

    const parSociete = this._regrouperParSociete(annonces);
    const groupe = [...parSociete.values()][0];
    const entite = this._mappageOrganisation(groupe);

    return {
      entite,
      source: 'BODACC',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  /**
   * Liens suggeres depuis les annonces BODACC d'une entite.
   * Reconstruit depuis detailler (dirigeants mentionnes dans les actes).
   *
   * @param {string} siren
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(siren) {
    const detail = await this.detailler(siren);
    const liens = detail.entite?.liensSuggeres ?? [];
    return {
      liens,
      source: 'BODACC',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  // --- Methodes internes ---

  /**
   * Regroupe les annonces par denomination (cle de regroupement).
   *
   * @param {object[]} annonces
   * @returns {Map<string, object[]>}
   */
  _regrouperParSociete(annonces) {
    const groupes = new Map();

    for (const annonce of annonces) {
      const cle =
        annonce.numeroImmatriculation ??
        annonce.denomination ??
        annonce.registre ??
        'inconnu';

      if (!groupes.has(cle)) {
        groupes.set(cle, []);
      }
      groupes.get(cle).push(annonce);
    }

    return groupes;
  }

  /**
   * Mappe un groupe d'annonces BODACC vers une EntiteNormalisee Organisation.
   *
   * @param {object[]} annonces - Tableau d'annonces pour une meme societe
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageOrganisation(annonces) {
    const premiere = annonces[0];
    const siren = premiere.numeroImmatriculation ?? null;
    const denomination = premiere.denomination ?? premiere.registre ?? 'Inconnue';

    const urlSource = siren
      ? `https://bodacc-datadila.opendatasoft.com/?q=${siren}`
      : `https://bodacc-datadila.opendatasoft.com/?q=${encodeURIComponent(denomination)}`;
    const sourceInfo = { source: 'BODACC', url: urlSource };

    // Construire le resume des evenements recents
    const evenementsRecents = annonces.slice(0, 5).map((a) => ({
      date: a.dateparution ?? null,
      type: a.typeavis ?? a.familleavis ?? 'Annonce',
      texte: a.acte ?? a.jugement ?? a.commercant ?? null,
    }));

    const descriptionEvenements = evenementsRecents
      .map((e) => `[${e.date ?? '?'}] ${e.type} — ${e.texte ?? ''}`)
      .join(' | ');

    const ville =
      premiere.ville ??
      premiere.cp_ville ??
      null;

    const champs = {
      nom: marquerProvenance(denomination, sourceInfo),
      siren: marquerProvenance(siren, sourceInfo),
      typeOrganisation: marquerProvenance('ENTREPRISE', sourceInfo),
      pays: marquerProvenance('France', sourceInfo),
      libelleCommune: marquerProvenance(ville, sourceInfo),
      description: marquerProvenance(
        `SIREN ${siren ?? '?'} · ${annonces.length} annonce(s) BODACC`,
        sourceInfo,
      ),
      evenementsRecents: marquerProvenance(evenementsRecents, sourceInfo),
      historiqueResume: marquerProvenance(descriptionEvenements || null, sourceInfo),
    };

    // Liens suggesres : dirigeants mentionnes dans les actes
    const liensSuggeres = this._extraireLiensDirigeants(annonces, sourceInfo);

    return creerEntiteNormalisee('Organisation', champs, liensSuggeres);
  }

  /**
   * Extrait les dirigeants mentionnes dans les actes BODACC.
   *
   * @param {object[]} annonces
   * @param {{ source: string, url: string }} sourceInfo
   * @returns {Array}
   */
  _extraireLiensDirigeants(annonces, sourceInfo) {
    const liens = [];
    const maintenant = new Date().toISOString();
    const vus = new Set();

    for (const annonce of annonces) {
      // Champs potentiels selon le type d'annonce
      const personnesTexte =
        annonce.representant ??
        annonce.commercant ??
        annonce.acte ??
        '';

      if (!personnesTexte || typeof personnesTexte !== 'string') continue;

      // Heuristique simple : rechercher des patterns "M./Mme NOM Prenom"
      const matchsNoms = personnesTexte.match(
        /\b(?:M\.|Mme\.?|Monsieur|Madame)\s+([A-Z][A-Z\-']{1,30})\s+([A-Z][a-z][A-Za-z\-']{1,30})/g,
      );

      if (!matchsNoms) continue;

      for (const nomComplet of matchsNoms) {
        const propre = nomComplet.replace(/^(?:M\.|Mme\.?|Monsieur|Madame)\s+/, '').trim();
        if (vus.has(propre)) continue;
        vus.add(propre);

        liens.push({
          vers: { type: 'Personne', identifiantExterne: propre },
          typeLienCode: 'DIRIGEANT',
          source: sourceInfo.source,
          url: sourceInfo.url,
          date: maintenant,
        });
      }
    }

    return liens;
  }

  /** Enveloppe un tableau de resultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'BODACC',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }
}
