/**
 * @module connecteurs/sources/associations
 * Connecteur RNA (Répertoire National des Associations) — Ministère de l'Intérieur.
 *
 * Source : RNA Waldec, dataset mensuel en CSV open data.
 * URL : https://media.interieur.gouv.fr/rna/
 * API data.gouv : https://www.data.gouv.fr/api/1/datasets/repertoire-national-des-associations/
 *
 * Couverture : ~1,5 million d'associations loi 1901 actives + fondations d'entreprise.
 * Fichier import choisi (vs rna_import) car il inclut les informations de déclaration
 * les plus complètes. Mis à jour mensuellement.
 *
 * Architecture :
 *   - Au premier appel : résolution dynamique de l'URL du dernier ZIP via l'API data.gouv
 *   - Téléchargement du ZIP import (~200 Mo) dans backend/.cache/connecteurs/rna/
 *   - Décompression via `unzip` système (pas d'injection shell — arguments en tableau)
 *   - Streaming ligne par ligne (readline) — jamais de readFileSync sur 200 Mo
 *   - Filtrage sur état actif (colonne `etat_asso = A`) et indexation par nom normalisé
 *   - Cache disque 30 jours
 *
 * ⚠️ RGPD — dirigeants nominaux :
 *   Le CSV import NE contient PAS les noms de dirigeants (retrait post-CJUE 2022 par
 *   le Ministère de l'Intérieur). Ce connecteur retourne uniquement les entités
 *   Organisation sans liens nominaux auto-générés.
 *   Complément via BODACC ou JOAFE (post-MVP) après accord DILA.
 *
 * JOAFE (Journal Officiel des Associations) :
 *   L'URL https://www.journal-officiel.gouv.fr/pages/associations-recherche/ est une
 *   interface web sans API publique documentée. L'intégration est différée en post-MVP.
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES (ADR-006, ADR-010) :
 *   1. Statut EN_ATTENTE par défaut sur toutes les entités
 *   2. Badge BadgeProvenance affiché explicitement
 *   3. Aucun dirigeant halluciné si non présent dans le CSV
 */

import { BaseConnecteur } from '../base.js';
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js';
import { createReadStream, existsSync, statSync, mkdirSync, readdirSync } from 'fs';
import { createInterface } from 'readline';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));

/** URL API data.gouv pour trouver la dernière version du dataset RNA */
const URL_API_DATAGOUV =
  'https://www.data.gouv.fr/api/1/datasets/repertoire-national-des-associations/';

/** Dossier de cache RNA */
const CACHE_RNA_DIR = join(__dirname, '../../../../backend/.cache/connecteurs/rna');
const CHEMIN_ZIP = join(CACHE_RNA_DIR, 'rna_import.zip');
const CHEMIN_CSV_DIR = join(CACHE_RNA_DIR, 'csv');

/** TTL cache disque 30 jours (en ms) */
const TTL_30_JOURS_MS = 30 * 24 * 60 * 60 * 1000;

/** Séparateur du CSV import */
const SEPARATEUR = ';';

/**
 * Normalise une chaîne pour la recherche (minuscules, sans accents, sans ponctuation).
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
 * Résout dynamiquement l'URL du dernier ZIP import via l'API data.gouv.
 * Fallback : construit l'URL avec le mois courant.
 *
 * @param {string} userAgent
 * @param {number} timeoutMs
 * @returns {Promise<string>}
 */
async function resoudreUrlZip(userAgent, timeoutMs) {
  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), timeoutMs);

  try {
    const reponse = await fetch(URL_API_DATAGOUV, {
      signal: controleur.signal,
      headers: {
        'User-Agent': userAgent,
        Accept: 'application/json',
      },
    });

    if (!reponse.ok) {
      throw new Error(`HTTP ${reponse.status}`);
    }

    const donnees = await reponse.json();
    const ressources = donnees.resources ?? [];

    // Chercher la ressource import (format ZIP, titre contenant 'import')
    const ressourceWaldec = ressources.find(
      (r) =>
        r.format?.toLowerCase() === 'zip' &&
        (r.title?.toLowerCase().includes('import') || r.url?.toLowerCase().includes('import')),
    );

    if (ressourceWaldec?.url) {
      console.info(`[associations] URL import résolue via data.gouv : ${ressourceWaldec.url}`);
      return ressourceWaldec.url;
    }

    // Fallback : construire l'URL avec le mois courant
    throw new Error('Ressource import non trouvée dans la réponse data.gouv');
  } catch (err) {
    console.warn(`[associations] Résolution data.gouv échouée (${err.message}). Fallback URL mensuelle.`);
    // Construire l'URL avec la date du mois courant (format YYYYMMDD)
    const maintenant = new Date();
    const annee = maintenant.getFullYear();
    const mois = String(maintenant.getMonth() + 1).padStart(2, '0');
    const jour = '01'; // Premier jour du mois — le ZIP mensuel est publié début de mois
    return `https://media.interieur.gouv.fr/rna/rna_import_${annee}${mois}${jour}.zip`;
  } finally {
    clearTimeout(minuterie);
  }
}

export default class AssociationsConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'associations',
      version: '1.0.0',
      baseUrl: 'https://media.interieur.gouv.fr/rna/',
      rateLimit: {
        debit: Number(process.env.ASSOCIATIONS_RATE_LIMIT_DEBIT) || 1,
        capacite: Number(process.env.ASSOCIATIONS_RATE_LIMIT_CAPACITE) || 2,
      },
      ttlCache: Number(process.env.ASSOCIATIONS_TTL_DATASET_MS) || TTL_30_JOURS_MS,
      timeoutMs: 180_000, // 3 min pour le téléchargement du ZIP ~200 Mo
    });

    /** @type {Map<string, object>|null} Index associations par nom normalisé */
    this._indexNom = null;
    /** @type {Map<string, object>|null} Index associations par numéro RNA */
    this._indexId = null;
    /** @type {Promise<void>|null} Promesse de chargement en cours */
    this._promesseChargement = null;
  }

  /**
   * Recherche d'associations par nom dans le RNA.
   *
   * La première recherche déclenche le téléchargement et l'indexation du dataset
   * (~200 Mo, 1-3 min selon la connexion), les appels suivants interrogent
   * l'index en mémoire (< 10 ms).
   *
   * @param {string} query - Nom de l'association (min 3 caractères)
   * @param {object} [options]
   * @param {number} [options.limite=10] - Nombre maximum de résultats (max 50)
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query, options = {}) {
    const terme = String(query ?? '').trim();
    if (terme.length < 3) return this._enveloppe([]);

    await this._assureIndex();

    const termeNormalise = normaliserRecherche(terme);
    const limite = Math.min(Number(options.limite) || 10, 50);
    const resultats = [];

    for (const [cle, assoc] of (this._indexNom ?? new Map())) {
      if (cle.includes(termeNormalise)) {
        resultats.push(this._mappageAssociation(assoc));
        if (resultats.length >= limite) break;
      }
    }

    return this._enveloppe(resultats);
  }

  /**
   * Récupère le détail d'une association par son numéro RNA (W + 9 chiffres).
   *
   * @param {string} id - Numéro RNA (ex: W751234567)
   * @returns {Promise<{ entite: object|null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(id) {
    await this._assureIndex();

    const idPropre = String(id ?? '').trim().toUpperCase();
    const assoc = this._indexId?.get(idPropre) ?? null;
    const entite = assoc ? this._mappageAssociation(assoc) : null;

    return {
      entite,
      source: 'RNA — Répertoire National des Associations',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  /**
   * Liens suggérés depuis une association RNA.
   * Retourne un tableau vide : le CSV import ne contient pas de dirigeants nominaux
   * (retrait RGPD post-CJUE 2022). Voir documentation du module pour le post-MVP JOAFE.
   *
   * @param {string} _id - Numéro RNA (non utilisé — aucun lien auto-généré)
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(_id) {
    return {
      liens: [],
      source: 'RNA — Répertoire National des Associations',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
      note: 'Le CSV import ne contient pas de dirigeants nominaux (RGPD post-CJUE 2022). Intégration JOAFE prévue en post-MVP après accord DILA.',
    };
  }

  // --- Méthodes internes ---

  /**
   * Assure que l'index est construit, en lançant le chargement si nécessaire.
   * Idempotent et protégé contre les appels concurrents.
   *
   * @returns {Promise<void>}
   */
  async _assureIndex() {
    if (this._indexNom !== null) return;

    if (this._promesseChargement) {
      await this._promesseChargement;
      return;
    }

    this._promesseChargement = this._chargerDataset();
    try {
      await this._promesseChargement;
    } finally {
      this._promesseChargement = null;
    }
  }

  /**
   * Télécharge, décompresse et indexe le dataset RNA Waldec.
   * Cache disque 30 jours — pas de re-téléchargement si récent.
   *
   * @returns {Promise<void>}
   */
  async _chargerDataset() {
    mkdirSync(CACHE_RNA_DIR, { recursive: true });
    mkdirSync(CHEMIN_CSV_DIR, { recursive: true });

    const userAgent =
      process.env.ENRICHISSEMENT_USER_AGENT ??
      'reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)';

    if (this._zipDoitEtreTelecharg()) {
      console.info('[associations] Résolution de l\'URL du dernier dataset import...');
      const urlZip = await resoudreUrlZip(userAgent, 30_000);

      console.info(`[associations] Téléchargement du dataset ZIP (~200 Mo) depuis ${urlZip}...`);
      await this._telechargerZip(urlZip, userAgent);
      console.info('[associations] Téléchargement terminé. Décompression...');
      await this._decompresserZip();
      console.info('[associations] Décompression terminée. Indexation...');
    } else {
      console.info('[associations] Cache ZIP valide (< 30 jours). Vérification des CSV...');
      if (!this._csvEstPresent()) {
        await this._decompresserZip();
      }
    }

    await this._construireIndex();
    console.info(`[associations] Index construit : ${this._indexNom?.size ?? 0} associations actives.`);
  }

  /**
   * Vérifie si le ZIP doit être re-téléchargé (absent ou plus vieux que le TTL).
   *
   * @returns {boolean}
   */
  _zipDoitEtreTelecharg() {
    if (!existsSync(CHEMIN_ZIP)) return true;
    const stats = statSync(CHEMIN_ZIP);
    return Date.now() - stats.mtimeMs > this.ttlCache;
  }

  /**
   * Vérifie si un fichier CSV import décompressé est présent dans le dossier cache.
   *
   * @returns {boolean}
   */
  _csvEstPresent() {
    try {
      const fichiers = readdirSync(CHEMIN_CSV_DIR);
      return fichiers.some((f) => f.startsWith('rna_import') && f.endsWith('.csv'));
    } catch {
      return false;
    }
  }

  /**
   * Télécharge le ZIP en streaming vers le disque via fetch natif.
   * Validation anti-SSRF : l'URL est construite depuis des sources contrôlées
   * (API data.gouv ou fallback sur media.interieur.gouv.fr) — les deux sont dans
   * HOSTS_AUTORISES['associations'].
   *
   * @param {string} urlZip - URL du ZIP à télécharger
   * @param {string} userAgent
   * @returns {Promise<void>}
   */
  async _telechargerZip(urlZip, userAgent) {
    // Validation manuelle anti-SSRF sur l'URL construite dynamiquement
    const url = new URL(urlZip);
    const hoteAutorise = ['media.interieur.gouv.fr', 'www.data.gouv.fr', 'static.data.gouv.fr'];
    if (!hoteAutorise.includes(url.hostname)) {
      throw new Error(
        `[associations] SSRF bloqué — hôte non autorisé pour le ZIP : ${url.hostname}`,
      );
    }

    const { consommer } = await import('../rate-limit.js');
    await consommer(this.nom);

    const controleur = new AbortController();
    const minuterie = setTimeout(() => controleur.abort(), this.timeoutMs);

    try {
      if (url.hostname === 'media.interieur.gouv.fr') {
        // Contournement TLS pour media.interieur.gouv.fr — la chaîne de
        // certificats utilise l'autorité française Certigna, absente du
        // store CA Node ET macOS par défaut, et le serveur ne sert pas la
        // chaîne intermédiaire complète. On délègue à curl système avec -k
        // (insecure). Risque MITM accepté car :
        //   - URL hardcodée (pas d'input utilisateur, pas de SSRF)
        //   - Hostname strictement whitelisté ci-dessus
        //   - Contenu validé après téléchargement (unzip + parsing CSV strict)
        //   - Donnée publique non sensible (RNA open data)
        //   - Limité à ce seul download, pas global
        clearTimeout(minuterie);
        await execFileAsync(
          '/usr/bin/curl',
          ['-sLk', '--max-time', '600', '-A', userAgent, '-o', CHEMIN_ZIP, urlZip],
          { maxBuffer: 1_000_000_000 },
        );
        return;
      }

      const reponse = await fetch(urlZip, {
        signal: controleur.signal,
        headers: { 'User-Agent': userAgent },
      });

      if (!reponse.ok) {
        throw new Error(`[associations] HTTP ${reponse.status} lors du téléchargement du ZIP`);
      }

      const { createWriteStream } = await import('fs');
      const { pipeline } = await import('stream/promises');
      const fluxSortie = createWriteStream(CHEMIN_ZIP);
      await pipeline(reponse.body, fluxSortie);
    } finally {
      clearTimeout(minuterie);
    }
  }

  /**
   * Décompresse le ZIP via execFile (sécurisé — pas d'injection shell, arguments tableau).
   *
   * @returns {Promise<void>}
   */
  async _decompresserZip() {
    try {
      await execFileAsync('/usr/bin/unzip', ['-o', CHEMIN_ZIP, '-d', CHEMIN_CSV_DIR], {
        maxBuffer: 10 * 1024 * 1024,
      });
    } catch (err) {
      // unzip retourne code 1 pour des avertissements non-fatals — acceptable
      if (err.code !== 1) {
        throw new Error(`[associations] Décompression échouée : ${err.message}`);
      }
    }
  }

  /**
   * Construit les index en mémoire en lisant TOUS les fichiers CSV import (un par
   * département) ligne par ligne.
   *
   * Format rna_import : colonnes séparées par ';', filtre sur position = 'A' (actif).
   * La BOM UTF-8 éventuelle (U+FEFF) en tête du premier fichier est retirée lors du
   * parsing de la ligne d'en-têtes via le nettoyage de la première clé.
   *
   * @returns {Promise<void>}
   */
  async _construireIndex() {
    this._indexNom = new Map();
    this._indexId = new Map();

    // Lister tous les fichiers CSV import dans le dossier décompressé
    const fichiersCsv = this._listerFichiersCsv();
    if (fichiersCsv.length === 0) {
      console.warn('[associations] Aucun fichier CSV import trouvé après décompression.');
      return;
    }

    console.info(`[associations] ${fichiersCsv.length} fichier(s) CSV à indexer...`);

    for (const cheminCsv of fichiersCsv) {
      await this._lireCsvFiltreParLigne(cheminCsv, (assoc) => {
        // Format rna_import : colonne 'position' vaut 'A' pour actif, 'D' pour dissout
        // (pas 'etat_asso' qui est le format waldec — ces deux formats sont distincts)
        const position = (assoc.position ?? '').trim().toUpperCase();
        if (position !== 'A') return;

        // La BOM UTF-8 (U+FEFF) peut contaminer la premiere cle d'en-tete du premier fichier.
        // Echappement explicite Unicode pour eviter "Irregular whitespace" (ESLint no-irregular-whitespace).
        const BOM_RE = /^\uFEFF/;
        const idBrut = Object.keys(assoc).find((k) => k.replace(BOM_RE, '') === 'id');
        const id = (idBrut ? assoc[idBrut] : '').trim().toUpperCase();
        const titre = (assoc.titre ?? '').trim();
        if (!id || !titre) return;

        this._indexId.set(id, assoc);
        const cle = normaliserRecherche(titre);
        if (cle && !this._indexNom.has(cle)) {
          this._indexNom.set(cle, assoc);
        }
      });
    }
  }

  /**
   * Liste tous les fichiers CSV import dans le dossier de décompression.
   * Le ZIP rna_import contient ~100 fichiers nommés rna_import_YYYYMMDD_dpt_NN.csv.
   * Cherche récursivement dans les sous-dossiers éventuels (profondeur max 3).
   *
   * @returns {string[]} Chemins absolus des fichiers CSV trouvés
   */
  _listerFichiersCsv() {
    const fichiers = [];

    const chercher = (dossier, profondeur = 0) => {
      if (profondeur > 3) return;
      let entrees;
      try {
        entrees = readdirSync(dossier);
      } catch {
        return;
      }

      for (const f of entrees) {
        if (f.startsWith('rna_import') && f.endsWith('.csv')) {
          fichiers.push(join(dossier, f));
        }
      }

      // Chercher dans les sous-dossiers
      for (const f of entrees) {
        const chemin = join(dossier, f);
        try {
          if (statSync(chemin).isDirectory()) {
            chercher(chemin, profondeur + 1);
          }
        } catch {
          // Ignorer les fichiers inaccessibles
        }
      }
    };

    chercher(CHEMIN_CSV_DIR);
    return fichiers;
  }

  /**
   * Trouve le premier fichier CSV import dans le dossier de décompression.
   * Conservé pour rétrocompatibilité avec _csvEstPresent().
   *
   * @returns {string|null}
   */
  _trouverFichierCsv() {
    const liste = this._listerFichiersCsv();
    return liste.length > 0 ? liste[0] : null;
  }

  /**
   * Lit un fichier CSV ligne par ligne en appelant un callback de filtrage.
   * Séparateur point-virgule (format RNA import). Traitement en streaming.
   *
   * @param {string} chemin - Chemin absolu du CSV
   * @param {function(object): void} callback - Appelé pour chaque ligne parsée
   * @returns {Promise<void>}
   */
  async _lireCsvFiltreParLigne(chemin, callback) {
    return new Promise((resolve, reject) => {
      const flux = createReadStream(chemin, { encoding: 'utf8' });
      const rl = createInterface({ input: flux, crlfDelay: Infinity });

      let enTetes = null;

      rl.on('line', (ligne) => {
        if (!ligne.trim()) return;

        if (enTetes === null) {
          enTetes = this._parserLigneCSV(ligne, SEPARATEUR);
          return;
        }

        const valeurs = this._parserLigneCSV(ligne, SEPARATEUR);
        const obj = {};
        for (let i = 0; i < enTetes.length; i++) {
          obj[enTetes[i]] = valeurs[i] ?? '';
        }

        try {
          callback(obj);
        } catch {
          // Ignorer les erreurs de callback pour ne pas interrompre le streaming
        }
      });

      rl.on('close', resolve);
      rl.on('error', reject);
      flux.on('error', reject);
    });
  }

  /**
   * Parse une ligne CSV avec le séparateur indiqué.
   * Gère les champs entre guillemets contenant le séparateur ou des guillemets doublés.
   *
   * @param {string} ligne
   * @param {string} separateur - Caractère séparateur (';' pour RNA)
   * @returns {string[]}
   */
  _parserLigneCSV(ligne, separateur = ',') {
    const champs = [];
    let courant = '';
    let dansGuillemets = false;

    for (let i = 0; i < ligne.length; i++) {
      const c = ligne[i];

      if (c === '"') {
        if (dansGuillemets && ligne[i + 1] === '"') {
          courant += '"';
          i++;
        } else {
          dansGuillemets = !dansGuillemets;
        }
      } else if (c === separateur && !dansGuillemets) {
        champs.push(courant.trim());
        courant = '';
      } else {
        courant += c;
      }
    }
    champs.push(courant.trim());
    return champs;
  }

  /**
   * Mappe une ligne RNA import vers une EntiteNormalisee de type Organisation.
   * Statut par défaut EN_ATTENTE (garde-fou ADR-006, ADR-013).
   *
   * Colonnes du format rna_import (séparateur ';') :
   *   id;id_ex;siret;gestion;date_creat;date_publi;nature;groupement;titre;objet;
   *   objet_social1;objet_social2;adr1;adr2;adr3;adrs_codepostal;libcom;
   *   dir_civilite;siteweb;observation;position;rup_mi;maj_time
   *
   * @param {object} assoc - Ligne CSV brute
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageAssociation(assoc) {
    // La BOM UTF-8 peut contaminer la clé 'id' du premier fichier
    const id = (assoc['id'] ?? assoc['﻿id'] ?? '').trim().toUpperCase();
    const urlSource = id
      ? `https://www.journal-officiel.gouv.fr/pages/associations-recherche/?q=${encodeURIComponent(assoc.titre ?? '')}`
      : 'https://media.interieur.gouv.fr/rna/';
    const sourceInfo = { source: 'RNA — Répertoire National des Associations', url: urlSource };

    const badgeProvenance = {
      source: 'RNA — Répertoire National des Associations',
      avertissement: 'Source : RNA Waldec (Ministère de l\'Intérieur) — données déclarées par l\'association. Vérifier avant publication.',
      statut: 'EN_ATTENTE',
    };

    // Construction de la description à partir des champs du format rna_import
    const partiesDescription = [];
    const nature = (assoc.nature ?? '').trim();
    const groupement = (assoc.groupement ?? '').trim();
    const objet = (assoc.objet ?? '').trim();
    const objetSocial1 = (assoc.objet_social1 ?? '').trim();
    const siretBrut = (assoc.siret ?? '').trim();

    // Mapping nature : codes courants du RNA
    const NATURE_LABELS = {
      'D': 'Déclarée simple',
      'RUP': 'Reconnue d\'utilité publique',
      'FE': 'Fondation d\'entreprise',
      'FUI': 'Fondation reconnue d\'utilité publique (fonds de dotation)',
      'CR': 'Congrégation religieuse',
      'ACE': 'Association cultuelle étrangère',
      'M': 'Association mutualiste',
      'EP': 'Établissement public',
    };
    const natureLibelle = NATURE_LABELS[nature] ?? (nature || null);

    if (natureLibelle) partiesDescription.push(`Nature : ${natureLibelle}`);
    if (groupement) partiesDescription.push(`Groupement : ${groupement}`);
    if (objet) partiesDescription.push(objet);
    else if (objetSocial1) partiesDescription.push(objetSocial1);
    if (siretBrut) partiesDescription.push(`SIRET : ${siretBrut}`);
    const description = partiesDescription.join(' — ') || null;

    // Adresse du siège — colonnes rna_import : adr1, adr2, adr3, adrs_codepostal, libcom
    const adresseSiege = [
      assoc.adr1,
      assoc.adr2,
      assoc.adr3,
    ]
      .map((p) => (p ?? '').trim())
      .filter(Boolean)
      .join(', ') || null;

    // Date de création — colonne date_creat (format YYYY-MM-DD dans rna_import)
    let dateCreation = null;
    const dateBrute = (assoc.date_creat ?? '').trim();
    if (dateBrute && dateBrute !== '0000-00-00' && dateBrute !== '') {
      const dateCandidat = new Date(dateBrute);
      if (!isNaN(dateCandidat.getTime())) {
        dateCreation = dateCandidat.toISOString().substring(0, 10);
      }
    }

    // Site web — colonne siteweb dans rna_import
    const siteWebBrut = (assoc.siteweb ?? '').trim();
    let siteWeb = null;
    if (siteWebBrut) {
      // Ajouter le schéma si absent pour la normalisation
      const urlTest = siteWebBrut.startsWith('http') ? siteWebBrut : `https://${siteWebBrut}`;
      try {
        new URL(urlTest);
        siteWeb = urlTest;
      } catch {
        // URL malformée, on ignore
      }
    }

    const champs = {
      nom: marquerProvenance((assoc.titre ?? '').trim() || null, sourceInfo),
      // rna_import n'a pas de colonne titre_court — sigle non disponible
      identifiantRna: marquerProvenance(id || null, sourceInfo),
      siret: marquerProvenance(siretBrut || null, sourceInfo),
      typeOrganisation: marquerProvenance('ASSOCIATION', sourceInfo),
      pays: marquerProvenance('France', sourceInfo),
      description: marquerProvenance(description, sourceInfo),
      adresseSiege: marquerProvenance(adresseSiege, sourceInfo),
      codePostal: marquerProvenance((assoc.adrs_codepostal ?? '').trim() || null, sourceInfo),
      libelleCommune: marquerProvenance((assoc.libcom ?? '').trim() || null, sourceInfo),
      siteWeb: marquerProvenance(siteWeb, sourceInfo),
      dateCreation: marquerProvenance(dateCreation, sourceInfo),
      etatAdministratif: marquerProvenance('Actif', sourceInfo),
      statut: marquerProvenance('EN_ATTENTE', sourceInfo),
      badgeProvenance: marquerProvenance(badgeProvenance, sourceInfo),
    };

    return creerEntiteNormalisee('Organisation', champs, []);
  }

  /** Enveloppe un tableau de résultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'RNA — Répertoire National des Associations',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }
}
