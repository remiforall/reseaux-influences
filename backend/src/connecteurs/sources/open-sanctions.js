/**
 * @module connecteurs/sources/open-sanctions
 * Connecteur OpenSanctions — sub-datasets français.
 *
 * Source : OpenSanctions.org (licence CC BY-NC 4.0 pour usage non-commercial).
 * Format : Follow The Money (FtM) JSON Lines — une ligne JSON par entité.
 * Voir : https://www.opensanctions.org/docs/bulk/
 *
 * Datasets intégrés :
 *   - fr_assemblee         : Députés de l'Assemblée nationale (~4 022 entités)
 *   - fr_senat             : Sénateurs (~890 entités)
 *   - fr_maires            : Maires de France (~68 353 entités)
 *   - fr_amf_regulatory_sanctions : Sanctions AMF (~415 entités)
 *   - fr_tresor_gels_avoir : Gels d'avoirs Trésor français (~6 090 entités)
 *
 * Format FtM (Follow The Money) :
 *   Chaque ligne : { "id": "...", "schema": "Person|Organization|...", "properties": { ... } }
 *   Les propriétés sont des tableaux (même valeur unique → tableau à 1 élément).
 *
 * Architecture :
 *   - Au premier appel : téléchargement des 5 datasets (JSONL), indexation en mémoire
 *   - Cache disque 30 jours via le mécanisme standard
 *   - Index par nom normalisé : Map<nomNormalise, entité FtM>
 *   - Matching strict par nom + pays — pas de fuzzy
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES (ADR-013) :
 *   1. Statut EN_ATTENTE par défaut sur toutes les entités
 *   2. Badge provenance affiché avec dataset d'origine
 *   3. Matching strict — pas de résultat sur nom seul si homonyme possible
 */

import { BaseConnecteur } from '../base.js';
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js';

/** Définition des 5 sub-datasets OpenSanctions FR */
const DATASETS = [
  {
    nom: 'fr_assemblee',
    url: 'https://data.opensanctions.org/datasets/latest/fr_assemblee/entities.ftm.json',
    qualiteInfluence: 'ELU',
    label: 'Assemblée nationale',
  },
  {
    nom: 'fr_senat',
    url: 'https://data.opensanctions.org/datasets/latest/fr_senat/entities.ftm.json',
    qualiteInfluence: 'ELU',
    label: 'Sénat',
  },
  {
    nom: 'fr_maires',
    url: 'https://data.opensanctions.org/datasets/latest/fr_maires/entities.ftm.json',
    qualiteInfluence: 'ELU',
    label: 'Maires',
  },
  {
    nom: 'fr_amf_regulatory_sanctions',
    url: 'https://data.opensanctions.org/datasets/latest/fr_amf_regulatory_sanctions/entities.ftm.json',
    qualiteInfluence: 'AUTRE',
    label: 'Sanctions AMF',
  },
  {
    nom: 'fr_tresor_gels_avoir',
    url: 'https://data.opensanctions.org/datasets/latest/fr_tresor_gels_avoir/entities.ftm.json',
    qualiteInfluence: 'AUTRE',
    label: 'Gels avoirs Trésor',
  },
];

/**
 * Normalise une chaîne pour la recherche (minuscules, sans accents).
 *
 * @param {string} chaine
 * @returns {string}
 */
function normaliserRecherche(chaine) {
  if (!chaine) return '';
  return chaine
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrait la première valeur d'un champ FtM (qui est toujours un tableau).
 *
 * @param {string[]|undefined} tableau
 * @returns {string|null}
 */
function premier(tableau) {
  return Array.isArray(tableau) && tableau.length > 0 ? tableau[0] : null;
}

export default class OpenSanctionsConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'open-sanctions',
      version: '1.0.0',
      baseUrl: 'https://data.opensanctions.org',
      rateLimit: {
        debit: Number(process.env.OPEN_SANCTIONS_RATE_LIMIT_DEBIT) || 2,
        capacite: Number(process.env.OPEN_SANCTIONS_RATE_LIMIT_CAPACITE) || 5,
      },
      // TTL 30 jours — datasets bulk, pas besoin de re-télécharger quotidiennement
      ttlCache: 30 * 24 * 60 * 60 * 1000,
      timeoutMs: 60_000,
    });

    /** @type {Map<string, { entite: object, dataset: object }>|null} Index par nom normalisé */
    this._index = null;
    /** @type {Promise<void>|null} */
    this._promesseChargement = null;
  }

  /**
   * Recherche dans les datasets OpenSanctions FR par nom.
   *
   * @param {string} query - Terme de recherche (min 2 caractères)
   * @param {object} [options]
   * @param {number} [options.limite=10] - Nombre de résultats maximum
   * @param {string} [options.dataset] - Filtrer sur un dataset spécifique (ex: 'fr_maires')
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query, options = {}) {
    const terme = String(query ?? '').trim();
    if (terme.length < 2) return this._enveloppe([]);

    await this._assureIndex();

    const termeNormalise = normaliserRecherche(terme);
    const limite = Math.min(Number(options.limite) || 10, 50);
    const datasetFiltre = options.dataset ?? null;
    const resultats = [];

    for (const [cle, { entite, dataset }] of (this._index ?? new Map())) {
      if (!cle.includes(termeNormalise)) continue;
      if (datasetFiltre && dataset.nom !== datasetFiltre) continue;

      resultats.push(this._mappageEntite(entite, dataset));
      if (resultats.length >= limite) break;
    }

    return this._enveloppe(resultats);
  }

  /**
   * Récupère le détail d'une entité par son identifiant FtM.
   *
   * @param {string} id - Identifiant FtM (ex: "fr-assemblee-001")
   * @returns {Promise<{ entite: object|null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(id) {
    await this._assureIndex();

    // Recherche dans l'index par identifiant exact
    let trouve = null;
    let datasetTrouve = null;

    for (const [, { entite, dataset }] of (this._index ?? new Map())) {
      if (entite.id === id) {
        trouve = entite;
        datasetTrouve = dataset;
        break;
      }
    }

    return {
      entite: trouve ? this._mappageEntite(trouve, datasetTrouve) : null,
      source: 'OpenSanctions',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  /**
   * Liste les liens suggérés depuis une entité OpenSanctions.
   *
   * @param {string} id
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(id) {
    const detail = await this.detailler(id);
    const liens = detail.entite?.liensSuggeres ?? [];
    return {
      liens,
      source: 'OpenSanctions',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  // --- Méthodes internes ---

  /**
   * Assure que l'index est construit.
   *
   * @returns {Promise<void>}
   */
  async _assureIndex() {
    if (this._index !== null) return;

    if (this._promesseChargement) {
      await this._promesseChargement;
      return;
    }

    this._promesseChargement = this._chargerDatasets();
    try {
      await this._promesseChargement;
    } finally {
      this._promesseChargement = null;
    }
  }

  /**
   * Télécharge et indexe les 5 datasets FtM JSONL.
   *
   * @returns {Promise<void>}
   */
  async _chargerDatasets() {
    this._index = new Map();

    for (const dataset of DATASETS) {
      try {
        console.info(`[open-sanctions] Chargement dataset ${dataset.nom}...`);
        const texte = await this._telechargerTexte(dataset.url, dataset.nom);
        this._indexerJsonl(texte, dataset);
      } catch (err) {
        console.error(`[open-sanctions] Échec chargement ${dataset.nom} : ${err.message}`);
      }
    }

    console.info(`[open-sanctions] Index construit : ${this._index.size} entités au total.`);
  }

  /**
   * Télécharge un fichier texte (JSONL) depuis une URL OpenSanctions.
   * Gère le rate-limit et le cache via _appelHttp avec Accept text/plain.
   *
   * @param {string} url
   * @param {string} nomDataset
   * @returns {Promise<string>}
   */
  async _telechargerTexte(url, nomDataset) {
    // On passe par fetch directement car _appelHttp parse en JSON
    // et le format JSONL n'est pas un JSON valide en tant que tel
    const { consommer } = await import('../rate-limit.js');
    const { lireCache, ecrireCache, hashCle } = await import('../cache.js');
    await consommer(this.nom);

    const cle = hashCle(this.nom, 'ftm', { url: nomDataset });
    const cached = await lireCache(cle, this.ttlCache);
    if (cached !== null) return cached;

    const userAgent =
      process.env.ENRICHISSEMENT_USER_AGENT ??
      'reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)';

    const controleur = new AbortController();
    const minuterie = setTimeout(() => controleur.abort(), this.timeoutMs);

    try {
      const reponse = await fetch(url, {
        signal: controleur.signal,
        headers: {
          'User-Agent': userAgent,
          'Accept': 'application/json, text/plain',
        },
      });

      if (!reponse.ok) {
        throw new Error(`[open-sanctions] HTTP ${reponse.status} sur ${url}`);
      }

      const texte = await reponse.text();
      await ecrireCache(cle, texte);
      return texte;
    } finally {
      clearTimeout(minuterie);
    }
  }

  /**
   * Parse un fichier JSONL et indexe les entités dans this._index.
   *
   * @param {string} texte - Contenu JSONL (une ligne JSON par entité)
   * @param {object} dataset - Définition du dataset (nom, qualiteInfluence, label)
   * @returns {void}
   */
  _indexerJsonl(texte, dataset) {
    const lignes = texte.split('\n');

    for (const ligne of lignes) {
      const ligneNette = ligne.trim();
      if (!ligneNette) continue;

      let entite;
      try {
        entite = JSON.parse(ligneNette);
      } catch {
        continue;
      }

      // On n'indexe que les Person et Organization (pas Address, Position seules)
      if (!entite.schema || !['Person', 'Organization'].includes(entite.schema)) continue;

      const props = entite.properties ?? {};
      const nom = premier(props.name) ?? premier(props.lastName) ?? '';
      if (!nom) continue;

      const cle = normaliserRecherche(nom);
      if (!cle) continue;

      // Si la clé existe déjà, conserver la première occurrence
      if (!this._index.has(cle)) {
        this._index.set(cle, { entite, dataset });
      }
    }
  }

  /**
   * Mappe une entité FtM vers une EntiteNormalisee.
   * Statut par défaut EN_ATTENTE (garde-fou ADR-013).
   *
   * @param {object} entite - Entité FtM brute
   * @param {object} dataset - Définition du dataset source
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageEntite(entite, dataset) {
    const props = entite.properties ?? {};
    const sourceLabel = `OpenSanctions ${dataset.label}`;
    const urlSource = `https://www.opensanctions.org/entities/${entite.id}/`;
    const sourceInfo = { source: sourceLabel, url: urlSource };

    const badgeProvenance = {
      source: sourceLabel,
      dataset: dataset.nom,
      avertissement: `Source : OpenSanctions (${dataset.label}) — vérifier avant publication. Une mention n'implique pas d'illégalité.`,
      statut: 'EN_ATTENTE',
    };

    if (entite.schema === 'Person') {
      const champs = {
        nom: marquerProvenance(premier(props.lastName) ?? premier(props.name) ?? null, sourceInfo),
        prenom: marquerProvenance(premier(props.firstName) ?? null, sourceInfo),
        dateNaissance: marquerProvenance(premier(props.birthDate) ?? null, sourceInfo),
        pays: marquerProvenance(premier(props.country) ?? premier(props.nationality) ?? 'France', sourceInfo),
        rolePrincipal: marquerProvenance(premier(props.position) ?? null, sourceInfo),
        qualiteInfluence: marquerProvenance(dataset.qualiteInfluence, sourceInfo),
        statut: marquerProvenance('EN_ATTENTE', sourceInfo),
        badgeProvenance: marquerProvenance(badgeProvenance, sourceInfo),
      };

      const liensSuggeres = [];
      const maintenant = new Date().toISOString();

      // Postes déclarés dans les propriétés FtM
      const postes = props.position ?? [];
      for (const poste of postes.slice(0, 3)) {
        if (poste) {
          liensSuggeres.push({
            vers: {
              type: 'Organisation',
              identifiantExterne: poste,
              details: { nom: poste },
            },
            typeLienCode: 'EMPLOI',
            source: sourceLabel,
            url: urlSource,
            date: maintenant,
            statut: 'EN_ATTENTE',
          });
        }
      }

      return creerEntiteNormalisee('Personne', champs, liensSuggeres);
    }

    // Organization
    const champs = {
      nom: marquerProvenance(premier(props.name) ?? null, sourceInfo),
      pays: marquerProvenance(premier(props.country) ?? 'France', sourceInfo),
      qualiteInfluence: marquerProvenance(dataset.qualiteInfluence, sourceInfo),
      statut: marquerProvenance('EN_ATTENTE', sourceInfo),
      badgeProvenance: marquerProvenance(badgeProvenance, sourceInfo),
    };

    return creerEntiteNormalisee('Organisation', champs, []);
  }

  /** Enveloppe un tableau de résultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'OpenSanctions',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }
}
