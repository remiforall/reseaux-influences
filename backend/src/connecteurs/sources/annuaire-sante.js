/**
 * @module connecteurs/sources/annuaire-sante
 * Connecteur Annuaire Santé RPPS — données open data RPPS en libre accès.
 *
 * Source : dataset Annuaire Santé sur data.gouv.fr (RPPS — Répertoire Partagé des
 * Professionnels de Santé, géré par l'Agence du Numérique en Santé).
 * Couverture : ~1,4 million de professionnels de santé inscrits.
 * URL dataset : https://www.data.gouv.fr/api/1/datasets/annuaire-sante-extractions-des-donnees-en-libre-acces-des-professions/
 *
 * Architecture :
 *   - Résolution dynamique de l'URL du dernier fichier via l'API data.gouv
 *   - Téléchargement du dataset (~50-100 Mo) dans backend/.cache/connecteurs/annuaire-sante/
 *   - Le fichier peut être zippé ou non selon la version — gestion des deux cas
 *   - Streaming ligne par ligne (readline) — jamais de readFileSync sur 100 Mo
 *   - Index en mémoire : Map<nomNormalise, professionnel>
 *   - Cache disque 30 jours
 *
 * ⚠️ GARDE-FOUS RGPD SPÉCIAUX (ADR-014) :
 *   Ce connecteur expose des données nominatives de professionnels privés
 *   (médecins, pharmaciens, sages-femmes, etc.) inscrits au RPPS.
 *   Un médecin libéral n'est pas automatiquement une personne d'influence publique.
 *   Mesures obligatoires :
 *   1. Statut EN_ATTENTE par défaut (jamais VALIDE automatique)
 *   2. Badge BadgeProvenance explicite avec avertissement art. 85 RGPD
 *   3. Recherche minimum 3 caractères — pas de dump du registre
 *   4. Limite 25 résultats max par recherche — pas d'extraction massive
 *   5. Pas de mode detailler() par numéro RPPS — évite le profilage à grande échelle
 *
 * Format attendu (CSV avec séparateur `;` ou `|`) :
 *   Colonnes principales : Nom d'exercice, Prénom d'exercice, Profession, Spécialité,
 *   Mode d'exercice, Genre d'activité, Numéro RPPS, Identifiant PP national,
 *   Civilité d'exercice, adresse, code postal, commune.
 */

import { BaseConnecteur } from '../base.js'
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js'
import { createReadStream, existsSync, statSync, mkdirSync, readdirSync } from 'fs'
import { createInterface } from 'readline'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'

const execFileAsync = promisify(execFile)
const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * URL API data.gouv pour le dataset Annuaire Santé — résolution par recherche textuelle.
 * On utilise l'API de recherche plutôt que le slug direct car le slug change
 * selon les versions publiées par l'ANS.
 */
const URL_API_DATAGOUV_RECHERCHE =
  'https://www.data.gouv.fr/api/1/datasets/?q=annuaire+sante+RPPS+libre+acces&page_size=5'

/**
 * Slug connu pour le dataset Annuaire Santé — fallback si la recherche échoue.
 * Ce slug est stable depuis 2022 dans data.gouv.fr.
 */
const URL_API_DATAGOUV_SLUG =
  'https://www.data.gouv.fr/api/1/datasets/annuaire-sante-extractions-des-donnees-en-libre-acces-des-professions/'

/** Dossier de cache annuaire-santé */
const CACHE_SANTE_DIR = join(__dirname, '../../../../backend/.cache/connecteurs/annuaire-sante')
const CHEMIN_DATASET = join(CACHE_SANTE_DIR, 'annuaire_sante.data')
const CHEMIN_CSV_DIR = join(CACHE_SANTE_DIR, 'csv')

/** TTL cache disque 30 jours (en ms) */
const TTL_30_JOURS_MS = 30 * 24 * 60 * 60 * 1000

/** Nombre maximum de résultats par recherche (garde-fou RGPD ADR-014) */
const LIMITE_MAX_RESULTATS = 25

/**
 * Normalise une chaîne pour la recherche (minuscules, sans accents, sans ponctuation).
 *
 * @param {string} chaine
 * @returns {string}
 */
function normaliserRecherche(chaine) {
  if (!chaine) return ''
  return chaine
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Tente de récupérer les ressources d'un dataset data.gouv via une URL d'API.
 *
 * @param {string} urlApi
 * @param {string} userAgent
 * @param {AbortSignal} signal
 * @returns {Promise<Array>} Tableau de ressources ou tableau vide si erreur
 */
async function _fetchRessourcesDatagouv(urlApi, userAgent, signal) {
  const reponse = await fetch(urlApi, {
    signal,
    headers: { 'User-Agent': userAgent, Accept: 'application/json' },
  })
  if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`)
  const donnees = await reponse.json()
  // L'API recherche renvoie { data: [{ resources: [...] }] }, le slug renvoie { resources: [...] }
  if (Array.isArray(donnees.data)) {
    // Résultat de recherche — prendre les ressources du premier dataset
    const premier = donnees.data[0]
    return premier?.resources ?? premier?.data ?? []
  }
  return donnees.resources ?? []
}

/**
 * Sélectionne la meilleure ressource parmi une liste data.gouv.
 * Priorité : ZIP > TXT > CSV.
 * Filtre sur les hôtes autorisés (www.data.gouv.fr ou static.data.gouv.fr).
 *
 * @param {Array} ressources
 * @returns {{ url: string, estZip: boolean }|null}
 */
function _selectionnerRessource(ressources) {
  const hotesOk = ['www.data.gouv.fr', 'static.data.gouv.fr']

  const filtrer = (pred) =>
    ressources.find((r) => {
      if (!r.url) return false
      try {
        const { hostname } = new URL(r.url)
        return hotesOk.includes(hostname) && pred(r)
      } catch {
        return false
      }
    })

  const ressourceZip = filtrer((r) => r.format?.toLowerCase() === 'zip')
  const ressourceTxt = filtrer(
    (r) => r.format?.toLowerCase() === 'txt' || r.format?.toLowerCase() === 'csv',
  )

  if (ressourceZip?.url) return { url: ressourceZip.url, estZip: true }
  if (ressourceTxt?.url) return { url: ressourceTxt.url, estZip: false }
  return null
}

/**
 * Résout dynamiquement l'URL du dernier dataset Annuaire Santé via l'API data.gouv.
 *
 * Stratégie de résolution (ordre de priorité) :
 *   1. Recherche textuelle via l'API data.gouv (q=annuaire+sante+RPPS)
 *   2. Slug direct du dataset connu
 *   3. Retourne null → rechercher() retournera [] avec un log warning
 *
 * @param {string} userAgent
 * @param {number} timeoutMs
 * @returns {Promise<{ url: string, estZip: boolean }|null>}
 */
async function resoudreUrlDataset(userAgent, timeoutMs) {
  const controleur = new AbortController()
  const minuterie = setTimeout(() => controleur.abort(), timeoutMs)

  try {
    // Stratégie 1 : recherche textuelle
    let ressources = []
    try {
      ressources = await _fetchRessourcesDatagouv(
        URL_API_DATAGOUV_RECHERCHE,
        userAgent,
        controleur.signal,
      )
    } catch (errRecherche) {
      console.warn(
        `[annuaire-sante] Recherche textuelle data.gouv échouée (${errRecherche.message}), tentative par slug...`,
      )
    }

    let selection = _selectionnerRessource(ressources)
    if (selection) {
      console.info(`[annuaire-sante] URL résolue via recherche data.gouv : ${selection.url}`)
      return selection
    }

    // Stratégie 2 : slug direct
    try {
      ressources = await _fetchRessourcesDatagouv(
        URL_API_DATAGOUV_SLUG,
        userAgent,
        controleur.signal,
      )
      selection = _selectionnerRessource(ressources)
      if (selection) {
        console.info(`[annuaire-sante] URL résolue via slug data.gouv : ${selection.url}`)
        return selection
      }
    } catch (errSlug) {
      console.warn(`[annuaire-sante] Résolution par slug échouée (${errSlug.message}).`)
    }

    // Aucune ressource exploitable trouvée
    console.warn(
      '[annuaire-sante] Aucune ressource TXT/CSV/ZIP exploitable trouvée sur data.gouv. Le connecteur retournera [] sans planter.',
    )
    return null
  } finally {
    clearTimeout(minuterie)
  }
}

export default class AnnuaireSanteConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'annuaire-sante',
      version: '1.0.0',
      baseUrl: 'https://www.data.gouv.fr',
      rateLimit: {
        debit: Number(process.env.ANNUAIRE_SANTE_RATE_LIMIT_DEBIT) || 1,
        capacite: Number(process.env.ANNUAIRE_SANTE_RATE_LIMIT_CAPACITE) || 2,
      },
      ttlCache: Number(process.env.ANNUAIRE_SANTE_TTL_DATASET_MS) || TTL_30_JOURS_MS,
      timeoutMs: 180_000, // 3 min pour le téléchargement du dataset
    })

    /** @type {Map<string, object>|null} Index professionnels par nom normalisé */
    this._indexNom = null
    /** @type {Promise<void>|null} Promesse de chargement en cours */
    this._promesseChargement = null
    /** @type {string|null} Séparateur détecté dans le CSV ';' ou '|' */
    this._separateur = null
  }

  /**
   * Recherche de professionnels de santé par nom dans l'annuaire RPPS.
   *
   * ⚠️ RGPD (ADR-014) : Garde-fous stricts appliqués :
   * - Minimum 3 caractères requis (évite le dump du registre)
   * - Maximum 25 résultats retournés (pas d'extraction massive)
   * - Statut EN_ATTENTE — vérifier que la personne exerce bien une influence
   *   publique avant d'importer (article 85 RGPD).
   *
   * @param {string} query - Nom de famille (min 3 caractères)
   * @param {object} [options]
   * @param {number} [options.limite=10] - Nombre de résultats (max 25 — garde-fou RGPD)
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string, avertissement: string }>}
   */
  async rechercher(query, options = {}) {
    const terme = String(query ?? '').trim()
    // Minimum 3 caractères — garde-fou RGPD (ADR-014)
    if (terme.length < 3) return this._enveloppe([])

    await this._assureIndex()

    const termeNormalise = normaliserRecherche(terme)
    // Limite stricte à 25 résultats max — garde-fou RGPD (ADR-014)
    const limite = Math.min(Number(options.limite) || 10, LIMITE_MAX_RESULTATS)
    const resultats = []

    for (const [cle, professionnel] of this._indexNom ?? new Map()) {
      if (cle.includes(termeNormalise)) {
        resultats.push(this._mappage(professionnel))
        if (resultats.length >= limite) break
      }
    }

    return this._enveloppe(resultats)
  }

  /**
   * Méthode detailler() désactivée pour ce connecteur.
   *
   * ⚠️ RGPD (ADR-014) : Un numéro RPPS ne doit pas être un identifiant pivot
   * dans le projet — risque de profilage à grande échelle de tous les médecins
   * par numéro. Seule la recherche par nom est exposée.
   *
   * @param {string} _id - Non utilisé
   * @returns {Promise<{ entite: null, source: string, dateRecuperation: string, version: string, note: string }>}
   */
  async detailler(_id) {
    return {
      entite: null,
      source: 'Annuaire Santé RPPS',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
      note: 'Méthode detailler() désactivée pour ce connecteur (ADR-014 — garde-fou RGPD). Utiliser rechercher() par nom.',
    }
  }

  /**
   * Liens suggérés depuis un professionnel de santé.
   * Retourne un tableau vide par défaut. Le croisement avec Transparence Santé
   * (conventions laboratoires) est prévu en post-MVP.
   *
   * @param {string} _id - Non utilisé
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(_id) {
    return {
      liens: [],
      source: 'Annuaire Santé RPPS',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
      note: 'Croisement avec Transparence Santé (conventions laboratoires) prévu en post-MVP.',
    }
  }

  // --- Méthodes internes ---

  /**
   * Assure que l'index est construit, en lançant le chargement si nécessaire.
   * Idempotent et protégé contre les appels concurrents.
   *
   * @returns {Promise<void>}
   */
  async _assureIndex() {
    if (this._indexNom !== null) return

    if (this._promesseChargement) {
      await this._promesseChargement
      return
    }

    this._promesseChargement = this._chargerDataset()
    try {
      await this._promesseChargement
    } finally {
      this._promesseChargement = null
    }
  }

  /**
   * Télécharge (si nécessaire), décompresse et indexe le dataset Annuaire Santé.
   * Cache disque 30 jours.
   *
   * @returns {Promise<void>}
   */
  async _chargerDataset() {
    mkdirSync(CACHE_SANTE_DIR, { recursive: true })
    mkdirSync(CHEMIN_CSV_DIR, { recursive: true })

    const userAgent =
      process.env.ENRICHISSEMENT_USER_AGENT ??
      'reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)'

    if (this._datasetDoitEtreTelecharg()) {
      console.info("[annuaire-sante] Résolution de l'URL du dataset Annuaire Santé...")
      const resolution = await resoudreUrlDataset(userAgent, 30_000)

      if (!resolution) {
        // Aucune URL résolvable — initialiser un index vide pour ne pas planter
        this._indexNom = new Map()
        console.warn(
          '[annuaire-sante] Dataset indisponible — le connecteur retourne [] sans planter.',
        )
        return
      }

      const { url, estZip } = resolution

      console.info(`[annuaire-sante] Téléchargement du dataset (~50-100 Mo) depuis ${url}...`)
      await this._telechargerDataset(url, userAgent, estZip)

      if (estZip) {
        console.info('[annuaire-sante] Décompression...')
        await this._decompresserZip()
      }
      console.info('[annuaire-sante] Téléchargement terminé. Indexation...')
    } else {
      console.info('[annuaire-sante] Cache valide (< 30 jours). Vérification des fichiers...')
      if (!this._csvEstPresent()) {
        // Présent mais non décompressé — tenter la décompression
        if (existsSync(CHEMIN_DATASET)) {
          await this._decompresserZip()
        }
      }
    }

    await this._construireIndex()
    console.info(
      `[annuaire-sante] Index construit : ${this._indexNom?.size ?? 0} professionnels indexés.`,
    )
  }

  /**
   * Vérifie si le dataset doit être re-téléchargé (absent ou plus vieux que le TTL).
   *
   * @returns {boolean}
   */
  _datasetDoitEtreTelecharg() {
    const cheminRef = this._trouverFichierDonnees()
    if (!cheminRef) return true
    const stats = statSync(cheminRef)
    return Date.now() - stats.mtimeMs > this.ttlCache
  }

  /**
   * Vérifie si un fichier de données (CSV/TXT) est présent dans le cache.
   *
   * @returns {boolean}
   */
  _csvEstPresent() {
    return this._trouverFichierDonnees() !== null
  }

  /**
   * Trouve le premier fichier de données (CSV, TXT) utilisable dans le cache.
   * Cherche dans CHEMIN_CSV_DIR et CHEMIN_DATASET direct.
   *
   * @returns {string|null}
   */
  _trouverFichierDonnees() {
    // Fichier direct (non zippé)
    const extensionsAcceptees = ['.csv', '.txt', '.psv']

    // Chercher dans le dossier CSV décompressé
    const chercher = (dossier, profondeur = 0) => {
      if (profondeur > 3) return null
      let fichiers
      try {
        fichiers = readdirSync(dossier)
      } catch {
        return null
      }

      for (const f of fichiers) {
        const ext = extname(f).toLowerCase()
        if (extensionsAcceptees.includes(ext) && f.toLowerCase().includes('annuaire')) {
          return join(dossier, f)
        }
      }

      // Sous-dossiers
      for (const f of fichiers) {
        const chemin = join(dossier, f)
        try {
          if (statSync(chemin).isDirectory()) {
            const trouve = chercher(chemin, profondeur + 1)
            if (trouve) return trouve
          }
        } catch {
          // Ignorer
        }
      }

      return null
    }

    const dansCsvDir = chercher(CHEMIN_CSV_DIR)
    if (dansCsvDir) return dansCsvDir

    // Fichier brut téléchargé directement (non ZIP)
    if (existsSync(CHEMIN_DATASET)) {
      try {
        statSync(CHEMIN_DATASET)
        return CHEMIN_DATASET
      } catch {
        return null
      }
    }

    return null
  }

  /**
   * Télécharge le dataset en streaming vers le disque.
   * Validation anti-SSRF : hôtes autorisés uniquement.
   *
   * @param {string} urlDataset
   * @param {string} userAgent
   * @param {boolean} estZip - Si true, sauvegarde sous .zip pour décompression ultérieure
   * @returns {Promise<void>}
   */
  async _telechargerDataset(urlDataset, userAgent, estZip) {
    // Validation anti-SSRF sur l'URL construite dynamiquement
    const url = new URL(urlDataset)
    const hotesAutorises = ['www.data.gouv.fr', 'static.data.gouv.fr']
    if (!hotesAutorises.includes(url.hostname)) {
      throw new Error(`[annuaire-sante] SSRF bloqué — hôte non autorisé : ${url.hostname}`)
    }

    const { consommer } = await import('../rate-limit.js')
    await consommer(this.nom)

    const controleur = new AbortController()
    const minuterie = setTimeout(() => controleur.abort(), this.timeoutMs)

    const cheminDestination = estZip ? join(CACHE_SANTE_DIR, 'annuaire_sante.zip') : CHEMIN_DATASET

    try {
      const reponse = await fetch(urlDataset, {
        signal: controleur.signal,
        headers: { 'User-Agent': userAgent },
      })

      if (!reponse.ok) {
        throw new Error(`[annuaire-sante] HTTP ${reponse.status} lors du téléchargement`)
      }

      const { createWriteStream } = await import('fs')
      const { pipeline } = await import('stream/promises')
      const fluxSortie = createWriteStream(cheminDestination)
      await pipeline(reponse.body, fluxSortie)

      // Mémoriser le chemin pour la décompression éventuelle
      this._cheminZipTelecharge = cheminDestination
    } finally {
      clearTimeout(minuterie)
    }
  }

  /**
   * Décompresse le ZIP via execFile (sécurisé — arguments en tableau, pas d'injection shell).
   *
   * @returns {Promise<void>}
   */
  async _decompresserZip() {
    const cheminZip = this._cheminZipTelecharge ?? join(CACHE_SANTE_DIR, 'annuaire_sante.zip')

    if (!existsSync(cheminZip)) {
      throw new Error(
        `[annuaire-sante] Fichier ZIP introuvable pour la décompression : ${cheminZip}`,
      )
    }

    try {
      await execFileAsync('/usr/bin/unzip', ['-o', cheminZip, '-d', CHEMIN_CSV_DIR], {
        maxBuffer: 10 * 1024 * 1024,
      })
    } catch (err) {
      if (err.code !== 1) {
        throw new Error(`[annuaire-sante] Décompression échouée : ${err.message}`)
      }
    }
  }

  /**
   * Construit l'index en mémoire en lisant le fichier de données ligne par ligne.
   * Détecte automatiquement le séparateur (';' ou '|').
   *
   * @returns {Promise<void>}
   */
  async _construireIndex() {
    this._indexNom = new Map()

    const cheminFichier = this._trouverFichierDonnees()
    if (!cheminFichier) {
      console.warn('[annuaire-sante] Aucun fichier de données trouvé après téléchargement.')
      return
    }

    // Détecter le séparateur sur la première ligne
    this._separateur = await this._detecterSeparateur(cheminFichier)
    console.info(`[annuaire-sante] Séparateur détecté : '${this._separateur}'`)

    await this._lireFichierFiltreParLigne(cheminFichier, (professionnel) => {
      const nomExercice = (
        professionnel["Nom d'exercice"] ??
        professionnel['nom_exercice'] ??
        professionnel['Nom'] ??
        professionnel['NOM'] ??
        ''
      ).trim()

      if (!nomExercice) return

      const cle = normaliserRecherche(nomExercice)
      if (!cle) return

      // Stocker la première occurrence par nom normalisé
      if (!this._indexNom.has(cle)) {
        this._indexNom.set(cle, professionnel)
      }
    })
  }

  /**
   * Détecte le séparateur de colonnes en lisant la première ligne du fichier.
   *
   * @param {string} chemin
   * @returns {Promise<string>} ';' ou '|'
   */
  async _detecterSeparateur(chemin) {
    return new Promise((resolve) => {
      const flux = createReadStream(chemin, { encoding: 'utf8', end: 1024 })
      const rl = createInterface({ input: flux, crlfDelay: Infinity })

      rl.once('line', (ligne) => {
        rl.close()
        flux.destroy()
        // Compter les occurrences des deux séparateurs candidats
        const nbPv = (ligne.match(/;/g) ?? []).length
        const nbPipe = (ligne.match(/\|/g) ?? []).length
        resolve(nbPipe > nbPv ? '|' : ';')
      })

      rl.on('error', () => resolve(';'))
      flux.on('error', () => resolve(';'))
    })
  }

  /**
   * Lit un fichier ligne par ligne en appliquant un callback de filtrage.
   * Première ligne = en-têtes. Traitement en streaming pour économiser la RAM.
   *
   * @param {string} chemin
   * @param {function(object): void} callback
   * @returns {Promise<void>}
   */
  async _lireFichierFiltreParLigne(chemin, callback) {
    const sep = this._separateur ?? ';'

    return new Promise((resolve, reject) => {
      const flux = createReadStream(chemin, { encoding: 'utf8' })
      const rl = createInterface({ input: flux, crlfDelay: Infinity })

      let enTetes = null

      rl.on('line', (ligne) => {
        if (!ligne.trim()) return

        if (enTetes === null) {
          enTetes = this._parserLigne(ligne, sep)
          return
        }

        const valeurs = this._parserLigne(ligne, sep)
        const obj = {}
        for (let i = 0; i < enTetes.length; i++) {
          obj[enTetes[i]] = valeurs[i] ?? ''
        }

        try {
          callback(obj)
        } catch {
          // Ignorer les erreurs de callback pour ne pas interrompre le streaming
        }
      })

      rl.on('close', resolve)
      rl.on('error', reject)
      flux.on('error', reject)
    })
  }

  /**
   * Parse une ligne avec le séparateur indiqué.
   * Gère les champs entre guillemets contenant le séparateur.
   *
   * @param {string} ligne
   * @param {string} separateur
   * @returns {string[]}
   */
  _parserLigne(ligne, separateur) {
    const champs = []
    let courant = ''
    let dansGuillemets = false

    for (let i = 0; i < ligne.length; i++) {
      const c = ligne[i]

      if (c === '"') {
        if (dansGuillemets && ligne[i + 1] === '"') {
          courant += '"'
          i++
        } else {
          dansGuillemets = !dansGuillemets
        }
      } else if (c === separateur && !dansGuillemets) {
        champs.push(courant.trim())
        courant = ''
      } else {
        courant += c
      }
    }
    champs.push(courant.trim())
    return champs
  }

  /**
   * Mappe une ligne du dataset RPPS vers une EntiteNormalisee de type Personne.
   *
   * ⚠️ RGPD (ADR-014) : qualiteInfluence = 'AUTRE' par défaut. L'utilisateur
   * doit vérifier que la personne exerce bien une influence publique avant d'importer
   * (art. 85 RGPD). Le badge provenance affiche cet avertissement explicitement.
   *
   * @param {object} professionnel - Ligne CSV brute
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappage(professionnel) {
    const urlSource = 'https://annuaire.sante.fr/'
    const sourceInfo = { source: 'Annuaire Santé RPPS', url: urlSource }

    const badgeProvenance = {
      source: 'Annuaire Santé RPPS',
      avertissement:
        "Source : Annuaire Santé RPPS — Vérifier que la personne exerce bien une influence publique avant d'importer (article 85 RGPD).",
      statut: 'EN_ATTENTE',
    }

    // Extraction des champs — noms de colonnes variables selon la version du dataset
    const nom = (
      professionnel["Nom d'exercice"] ??
      professionnel['nom_exercice'] ??
      professionnel['Nom'] ??
      professionnel['NOM'] ??
      ''
    ).trim()

    const prenom = (
      professionnel["Prénom d'exercice"] ??
      professionnel['prenom_exercice'] ??
      professionnel['Prénom'] ??
      professionnel['PRENOM'] ??
      ''
    ).trim()

    const profession = (
      professionnel['Profession'] ??
      professionnel['profession'] ??
      professionnel['Libellé Profession'] ??
      ''
    ).trim()

    const specialite = (
      professionnel['Spécialité ordinale'] ??
      professionnel['Libellé Spécialité ordinale'] ??
      professionnel['specialite'] ??
      ''
    ).trim()

    const modeExercice = (
      professionnel["Mode d'exercice"] ??
      professionnel['mode_exercice'] ??
      professionnel['Libellé Mode exercice'] ??
      ''
    ).trim()

    const rpps = (
      professionnel['Identifiant PP'] ??
      professionnel['N° RPPS'] ??
      professionnel['idpp'] ??
      professionnel['rpps'] ??
      ''
    ).trim()

    // Rôle principal : profession + spécialité + mode d'exercice
    const partiesRole = [profession, specialite, modeExercice].filter(Boolean)
    const rolePrincipal = partiesRole.join(' — ') || null

    // Bio : numéro RPPS + mode d'exercice (pas de données identifiantes inutiles)
    const bio = rpps
      ? `RPPS : ${rpps}${modeExercice ? ` — Mode d'exercice : ${modeExercice}` : ''}`
      : null

    const champs = {
      nom: marquerProvenance(nom || null, sourceInfo),
      prenom: marquerProvenance(prenom || null, sourceInfo),
      pays: marquerProvenance('France', sourceInfo),
      rolePrincipal: marquerProvenance(rolePrincipal, sourceInfo),
      bio: marquerProvenance(bio, sourceInfo),
      qualiteInfluence: marquerProvenance('AUTRE', sourceInfo),
      statut: marquerProvenance('EN_ATTENTE', sourceInfo),
      badgeProvenance: marquerProvenance(badgeProvenance, sourceInfo),
    }

    return creerEntiteNormalisee('Personne', champs, [])
  }

  /** Enveloppe un tableau de résultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'Annuaire Santé RPPS',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
      avertissement:
        "Source : Annuaire Santé RPPS — Vérifier que la personne exerce bien une influence publique avant d'importer (article 85 RGPD).",
    }
  }
}
