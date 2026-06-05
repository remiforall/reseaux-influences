/**
 * @module connecteurs/sources/icij-offshore-leaks
 * Connecteur ICIJ Offshore Leaks — Panama Papers, Paradise Papers, Pandora Papers,
 * Bahamas Leaks, Offshore Leaks originaux.
 *
 * Source : International Consortium of Investigative Journalists (ICIJ).
 * Données publiées sous Creative Commons Attribution-ShareAlike 3.0.
 * URL : https://offshoreleaks.icij.org/
 *
 * Leaks couverts :
 *   - Panama Papers    (2016) — 11,5 Mo de documents, 214 000 entités offshore
 *   - Paradise Papers  (2017) — Appleby, Arrowgrass, données gouvernements ÎM
 *   - Pandora Papers   (2021) — 2,94 To, 330 000 entités dans 91 juridictions
 *   - Bahamas Leaks    (2016) — sociétés anonymes des Bahamas
 *   - Offshore Leaks   (2013) — jeux d'îles Vierges Britanniques, Îles Caïman...
 *
 * Statut juridique (France) :
 *   Ces données ont été publiées par le consortium ICIJ, qui les a jugées
 *   d'intérêt public. La jurisprudence française (TGI Paris, TGI Bordeaux)
 *   et la CJUE (Schrems II) n'empêchent pas leur exploitation journalistique.
 *   Toutefois : UNE MENTION DANS CES BASES N'IMPLIQUE AUCUNE ILLÉGALITÉ.
 *   Toute utilisation requiert vérification journalistique avant publication.
 *   Usage soumis à la base légale RGPD art. 85 (journalisme/recherche).
 *
 * Architecture :
 *   - Téléchargement unique du ZIP (~73 Mo) → cache disque 30 jours
 *   - Décompression via `unzip` système (binaire /usr/bin/unzip)
 *   - Filtrage en streaming sur pays FR / DOM-TOM / Monaco / Andorre
 *   - Index en mémoire : Map<nomNormalise, node> + Map<id, node>
 *   - Latence au premier appel : 30-60 s (téléchargement + décompression + indexation)
 *     → réponse depuis l'index pour les appels suivants (quelques ms)
 *
 * ⚠️ GARDE-FOUS ÉTHIQUES (ADR-010, ADR-013) :
 *   1. Toutes les entités importées portent statut EN_ATTENTE (jamais VALIDE automatique)
 *   2. Badge BadgeProvenance affiché explicitement (source + avertissement homonymie)
 *   3. Matching strict par identifiant ICIJ ou nom+pays — pas de fuzzy par nom seul
 *   4. Cache 30 jours — pas de re-téléchargement quotidien du leak
 */

import { BaseConnecteur } from '../base.js'
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js'
import { createReadStream, existsSync, statSync, mkdirSync } from 'fs'
import { createInterface } from 'readline'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const execFileAsync = promisify(execFile)
const __dirname = dirname(fileURLToPath(import.meta.url))

const URL_ZIP = 'https://offshoreleaks-data.icij.org/offshoreleaks/csv/full-oldb.LATEST.zip'

/** Dossier de cache ICIJ (hors .cache/connecteurs standard pour isoler les gros datasets) */
const CACHE_ICIJ_DIR = join(__dirname, '../../../../backend/.cache/connecteurs/icij')
const CHEMIN_ZIP = join(CACHE_ICIJ_DIR, 'full-oldb.zip')
const CHEMIN_CSV_DIR = join(CACHE_ICIJ_DIR, 'csv')

/** TTL cache disque 30 jours (en ms) */
const TTL_30_JOURS_MS = 30 * 24 * 60 * 60 * 1000

/** Juridictions / codes pays associés à la France, DOM-TOM, Monaco, Andorre */
const PAYS_FRANCE = new Set([
  'FRA',
  'France',
  'FR',
  'MCO',
  'Monaco',
  'MC',
  'AND',
  'Andorra',
  'Andorre',
  'AD',
  'GUF',
  'Guyane',
  'MTQ',
  'Martinique',
  'GLP',
  'Guadeloupe',
  'REU',
  'Réunion',
  'Reunion',
  'MYT',
  'Mayotte',
  'NCL',
  'Nouvelle-Calédonie',
  'PYF',
  'Polynésie',
  'SPM',
  'WLF',
])

/**
 * Vérifie si un champ pays/countries contient une référence française.
 *
 * @param {string} paysChamp
 * @returns {boolean}
 */
function estLieFrance(paysChamp) {
  if (!paysChamp) return false
  for (const code of PAYS_FRANCE) {
    if (paysChamp.includes(code)) return true
  }
  return false
}

/** Mapping types de relations ICIJ → codes TypeLien internes */
const MAPPING_RELATION = new Map([
  ['officer_of', 'DIRIGEANT'],
  ['director_of', 'DIRIGEANT'],
  ['shareholder_of', 'BENEFICIAIRE_EFFECTIF'],
  ['beneficiary_of', 'BENEFICIAIRE_EFFECTIF'],
  ['chairman_of', 'DIRIGEANT'],
  ['treasurer_of', 'DIRIGEANT'],
  ['secretary_of', 'DIRIGEANT'],
  ['authorized_person', 'DIRIGEANT'],
  ['nominee_shareholder_of', 'BENEFICIAIRE_EFFECTIF'],
  ['intermediary_of', 'FONDATEUR'],
  ['registered_address', 'SIEGE_SOCIAL'],
])

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

export default class IcijOffshoreLeaksConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'icij-offshore-leaks',
      version: '1.0.0',
      baseUrl: URL_ZIP,
      rateLimit: {
        debit: Number(process.env.ICIJ_RATE_LIMIT_DEBIT) || 1,
        capacite: Number(process.env.ICIJ_RATE_LIMIT_CAPACITE) || 2,
      },
      // TTL géré manuellement (cache disque 30 jours sur le ZIP)
      ttlCache: TTL_30_JOURS_MS,
      timeoutMs: 120_000, // 2 min pour le téléchargement du ZIP
    })

    /** @type {Map<string, object>|null} Index nodes par nom normalisé */
    this._indexNom = null
    /** @type {Map<string, object>|null} Index nodes par ID ICIJ */
    this._indexId = null
    /** @type {Map<string, Array>|null} Relations par ID node source */
    this._relations = null
    /** @type {Promise<void>|null} */
    this._promesseChargement = null
  }

  /**
   * Recherche dans la base ICIJ Offshore Leaks par nom.
   *
   * La première recherche déclenche le téléchargement du ZIP (30-60 s),
   * les appels suivants interrogent l'index en mémoire (< 10 ms).
   *
   * ⚠️ Une correspondance n'implique aucune illégalité. Vérifier avant publication.
   *
   * @param {string} query - Nom de personne ou d'organisation (min 2 caractères)
   * @param {object} [options]
   * @param {number} [options.limite=10] - Nombre maximum de résultats
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string, avertissement: string }>}
   */
  async rechercher(query, options = {}) {
    const terme = String(query ?? '').trim()
    if (terme.length < 2) return this._enveloppe([])

    await this._assureIndex()

    const termeNormalise = normaliserRecherche(terme)
    const limite = Math.min(Number(options.limite) || 10, 50)
    const resultats = []

    for (const [cle, node] of this._indexNom ?? new Map()) {
      if (cle.includes(termeNormalise)) {
        resultats.push(this._mappageNode(node))
        if (resultats.length >= limite) break
      }
    }

    return this._enveloppe(resultats)
  }

  /**
   * Récupère le détail d'un node par son identifiant ICIJ.
   *
   * @param {string} id - Identifiant ICIJ du node
   * @returns {Promise<{ entite: object|null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(id) {
    await this._assureIndex()

    const node = this._indexId?.get(String(id)) ?? null
    const entite = node ? this._mappageNode(node) : null

    return {
      entite,
      source: 'ICIJ Offshore Leaks',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  /**
   * Liste les liens suggérés depuis un node ICIJ (relations vers autres entités).
   *
   * @param {string} id - Identifiant ICIJ
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(id) {
    await this._assureIndex()

    const relations = this._relations?.get(String(id)) ?? []
    const maintenant = new Date().toISOString()

    const liens = relations.map((rel) => ({
      vers: {
        type: this._inferTypeNode(rel.node_2_type ?? ''),
        identifiantExterne: rel.node_2 ?? rel.node_2_name ?? String(rel.node_2_id ?? ''),
        details: { nom: rel.node_2_name ?? null },
      },
      typeLienCode: MAPPING_RELATION.get(rel.rel_type) ?? 'DIRIGEANT',
      source: 'ICIJ Offshore Leaks',
      url: 'https://offshoreleaks.icij.org',
      date: maintenant,
      statut: 'EN_ATTENTE',
    }))

    return {
      liens,
      source: 'ICIJ Offshore Leaks',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  // --- Méthodes internes ---

  /**
   * Assure que l'index est construit (téléchargement + décompression + filtrage si nécessaire).
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
   * Télécharge, décompresse et indexe le dataset ICIJ.
   * Cache disque 30 jours sur le ZIP — pas de re-téléchargement si récent.
   *
   * @returns {Promise<void>}
   */
  async _chargerDataset() {
    // Créer les dossiers de cache si nécessaires
    mkdirSync(CACHE_ICIJ_DIR, { recursive: true })
    mkdirSync(CHEMIN_CSV_DIR, { recursive: true })

    const doitTelecharger = this._zipDoitEtreTelecharg()

    if (doitTelecharger) {
      console.info('[icij-offshore-leaks] Téléchargement du dataset ZIP (~73 Mo)...')
      await this._telechargerZip()
      console.info('[icij-offshore-leaks] Téléchargement terminé. Décompression...')
      await this._decompresserZip()
      console.info('[icij-offshore-leaks] Décompression terminée. Indexation...')
    } else {
      console.info('[icij-offshore-leaks] Cache ZIP valide (< 30 jours). Indexation...')
      // Vérifier que les CSV sont bien présents
      if (!this._csvSontPresents()) {
        await this._decompresserZip()
      }
    }

    await this._construireIndex()
    console.info(
      `[icij-offshore-leaks] Index construit : ${this._indexNom?.size ?? 0} entités liées à la France.`,
    )
  }

  /**
   * Vérifie si le ZIP doit être re-téléchargé (absent ou > 30 jours).
   *
   * @returns {boolean}
   */
  _zipDoitEtreTelecharg() {
    if (!existsSync(CHEMIN_ZIP)) return true
    const stats = statSync(CHEMIN_ZIP)
    const age = Date.now() - stats.mtimeMs
    return age > TTL_30_JOURS_MS
  }

  /**
   * Vérifie si les fichiers CSV décompressés sont présents.
   *
   * @returns {boolean}
   */
  _csvSontPresents() {
    const nomsFichiersAttendus = ['nodes-entities.csv', 'nodes-officers.csv', 'relationships.csv']
    return nomsFichiersAttendus.some((f) => existsSync(join(CHEMIN_CSV_DIR, f)))
  }

  /**
   * Télécharge le ZIP via fetch natif Node.js avec User-Agent identifié.
   * Utilise le rate-limit de la classe parente.
   *
   * @returns {Promise<void>}
   */
  async _telechargerZip() {
    const { consommer } = await import('../rate-limit.js')
    await consommer(this.nom)

    const userAgent =
      process.env.ENRICHISSEMENT_USER_AGENT ??
      'reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)'

    const controleur = new AbortController()
    const minuterie = setTimeout(() => controleur.abort(), this.timeoutMs)

    try {
      const reponse = await fetch(URL_ZIP, {
        signal: controleur.signal,
        headers: { 'User-Agent': userAgent },
      })

      if (!reponse.ok) {
        throw new Error(`[icij-offshore-leaks] HTTP ${reponse.status} sur le téléchargement ZIP`)
      }

      // Écriture en streaming vers le disque
      const { createWriteStream } = await import('fs')
      const { Writable } = await import('stream')
      const { pipeline } = await import('stream/promises')

      const fluxSortie = createWriteStream(CHEMIN_ZIP)
      await pipeline(Writable.fromWeb ? reponse.body : reponse.body, fluxSortie)
    } finally {
      clearTimeout(minuterie)
    }
  }

  /**
   * Décompresse le ZIP dans CHEMIN_CSV_DIR via `execFile` (sécurisé — pas d'injection shell).
   * Les arguments sont passés comme tableau, jamais interpolés dans une commande shell.
   *
   * @returns {Promise<void>}
   */
  async _decompresserZip() {
    try {
      // execFile avec arguments en tableau → pas d'injection shell possible (M-03)
      await execFileAsync('/usr/bin/unzip', ['-o', CHEMIN_ZIP, '-d', CHEMIN_CSV_DIR], {
        maxBuffer: 10 * 1024 * 1024,
      })
    } catch (err) {
      // unzip retourne code 1 si avertissements non-fatals — ne pas propager
      if (err.code !== 1) {
        throw new Error(`[icij-offshore-leaks] Décompression échouée : ${err.message}`)
      }
    }
  }

  /**
   * Construit les index en mémoire en lisant les CSV ligne par ligne.
   * Filtre sur les entités liées à la France / DOM-TOM / Monaco / Andorre.
   *
   * @returns {Promise<void>}
   */
  async _construireIndex() {
    this._indexNom = new Map()
    this._indexId = new Map()
    this._relations = new Map()

    // Noms possibles des fichiers CSV selon la version du ZIP
    const fichiersNodes = [
      'nodes-entities.csv',
      'nodes-officers.csv',
      'nodes-intermediaries.csv',
      'nodes-addresses.csv',
    ]

    for (const nomFichier of fichiersNodes) {
      // Chercher dans le dossier racine ou dans des sous-dossiers
      const chemins = [
        join(CHEMIN_CSV_DIR, nomFichier),
        join(CHEMIN_CSV_DIR, 'full-oldb', nomFichier),
        join(CHEMIN_CSV_DIR, 'oldb', nomFichier),
      ]

      let cheminExistant = null
      for (const c of chemins) {
        if (existsSync(c)) {
          cheminExistant = c
          break
        }
      }

      if (!cheminExistant) continue

      await this._lireCsvFiltreParLigne(cheminExistant, (node) => {
        const pays = node.countries ?? node.country_codes ?? node.jurisdiction ?? ''
        if (!estLieFrance(pays)) return

        const id = String(node.node_id ?? node.id ?? '')
        const nom = node.name ?? node.name_used ?? ''
        if (!id || !nom) return

        this._indexId.set(id, node)
        const cle = normaliserRecherche(nom)
        if (cle && !this._indexNom.has(cle)) {
          this._indexNom.set(cle, node)
        }
      })
    }

    // Charger les relations pour les nodes filtrés
    const cheminsRelations = [
      join(CHEMIN_CSV_DIR, 'relationships.csv'),
      join(CHEMIN_CSV_DIR, 'full-oldb', 'relationships.csv'),
      join(CHEMIN_CSV_DIR, 'oldb', 'relationships.csv'),
    ]

    let cheminRelations = null
    for (const c of cheminsRelations) {
      if (existsSync(c)) {
        cheminRelations = c
        break
      }
    }

    if (cheminRelations) {
      await this._lireCsvFiltreParLigne(cheminRelations, (rel) => {
        const id1 = String(rel.node_1 ?? rel.node_1_id ?? '')
        const id2 = String(rel.node_2 ?? rel.node_2_id ?? '')
        if (!this._indexId.has(id1) && !this._indexId.has(id2)) return

        const sourceId = this._indexId.has(id1) ? id1 : id2
        if (!this._relations.has(sourceId)) {
          this._relations.set(sourceId, [])
        }
        this._relations.get(sourceId).push(rel)
      })
    }
  }

  /**
   * Lit un fichier CSV ligne par ligne en appliquant un callback de filtrage.
   * Première ligne = en-têtes. Traitement en streaming pour économiser la RAM.
   *
   * @param {string} chemin - Chemin absolu du CSV
   * @param {function(object): void} callback - Appelé pour chaque ligne parsée
   * @returns {Promise<void>}
   */
  async _lireCsvFiltreParLigne(chemin, callback) {
    return new Promise((resolve, reject) => {
      const flux = createReadStream(chemin, { encoding: 'utf8' })
      const rl = createInterface({ input: flux, crlfDelay: Infinity })

      let enTetes = null

      rl.on('line', (ligne) => {
        if (!ligne.trim()) return

        if (enTetes === null) {
          enTetes = this._parserLigneCSV(ligne)
          return
        }

        const valeurs = this._parserLigneCSV(ligne)
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
   * Parse une ligne CSV simple (ne gère pas les guillemets imbriqués complexes,
   * mais suffisant pour le format ICIJ qui échappe les virgules avec des guillemets).
   *
   * @param {string} ligne
   * @returns {string[]}
   */
  _parserLigneCSV(ligne) {
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
      } else if (c === ',' && !dansGuillemets) {
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
   * Mappe un node ICIJ vers une EntiteNormalisee.
   * Statut par défaut : EN_ATTENTE (garde-fou ADR-013).
   *
   * @param {object} node - Node ICIJ brut
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageNode(node) {
    const id = String(node.node_id ?? node.id ?? '')
    const urlSource = `https://offshoreleaks.icij.org/nodes/${id}`
    const sourceInfo = { source: 'ICIJ Offshore Leaks', url: urlSource }

    const nom = node.name ?? node.name_used ?? ''
    const type = this._inferTypeNode(node._type ?? node.labels ?? '')

    /**
     * Badge provenance obligatoire (ADR-013) :
     * Affiché dans l'UI avec avertissement explicite.
     */
    const badgeProvenance = {
      source: 'ICIJ Offshore Leaks',
      leaks: node.sourceID ?? 'Panama Papers / Pandora Papers / Paradise Papers',
      avertissement:
        "Source : ICIJ Offshore Leaks — vérifier avant publication. Une mention n'implique pas d'illégalité.",
      statut: 'EN_ATTENTE',
    }

    const champs = {
      nom: marquerProvenance(nom, sourceInfo),
      pays: marquerProvenance(
        node.countries ?? node.country_codes ?? node.jurisdiction ?? null,
        sourceInfo,
      ),
      jurisdiction: marquerProvenance(node.jurisdiction ?? null, sourceInfo),
      incorporation: marquerProvenance(node.incorporation_date ?? null, sourceInfo),
      inactivite: marquerProvenance(node.inactivation_date ?? null, sourceInfo),
      struck_off: marquerProvenance(node.struck_off_date ?? null, sourceInfo),
      sourceID: marquerProvenance(node.sourceID ?? null, sourceInfo),
      statut: marquerProvenance('EN_ATTENTE', sourceInfo),
      badgeProvenance: marquerProvenance(badgeProvenance, sourceInfo),
    }

    if (type === 'Organisation') {
      champs.sigle = marquerProvenance(node.former_name ?? null, sourceInfo)
    } else {
      champs.prenoms = marquerProvenance(null, sourceInfo)
    }

    const liensSuggeres = []
    const relations = this._relations?.get(id) ?? []
    const maintenant = new Date().toISOString()

    for (const rel of relations.slice(0, 20)) {
      const codeType = MAPPING_RELATION.get(rel.rel_type) ?? 'DIRIGEANT'
      const idCible = String(rel.node_2 ?? rel.node_2_id ?? '')
      const nomCible = rel.node_2_name ?? idCible

      if (!idCible) continue

      liensSuggeres.push({
        vers: {
          type: this._inferTypeNode(rel.node_2_type ?? ''),
          identifiantExterne: idCible,
          details: { nom: nomCible },
        },
        typeLienCode: codeType,
        source: 'ICIJ Offshore Leaks',
        url: urlSource,
        date: maintenant,
        statut: 'EN_ATTENTE',
      })
    }

    return creerEntiteNormalisee(type, champs, liensSuggeres)
  }

  /**
   * Infère le type d'entité normalisé depuis le type ICIJ.
   *
   * @param {string} typeIcij
   * @returns {'Personne'|'Organisation'}
   */
  _inferTypeNode(typeIcij) {
    const t = typeIcij.toLowerCase()
    if (t.includes('officer') || t.includes('individual') || t.includes('person')) {
      return 'Personne'
    }
    return 'Organisation'
  }

  /** Enveloppe un tableau de résultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'ICIJ Offshore Leaks',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
      avertissement:
        "Source : ICIJ Offshore Leaks — vérifier avant publication. Une mention n'implique pas d'illégalité.",
    }
  }
}
