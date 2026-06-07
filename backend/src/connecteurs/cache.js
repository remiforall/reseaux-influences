/**
 * @module cache
 * Cache fichier disque pour les connecteurs OSINT.
 *
 * Stockage : `backend/.cache/connecteurs/<sha256>.json`
 * TTL configurable via `CACHE_TTL_MS` (défaut 24 h).
 *
 * Dégradation gracieuse : si le dossier n'est pas accessible en écriture
 * (quota Infomaniak, permissions), bascule sur un cache mémoire `Map`
 * avec un log warn au démarrage. Aucun crash applicatif.
 */

import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const CACHE_DIR = process.env.CACHE_DIR ?? path.resolve(__dirname, '../../.cache/connecteurs')

const TTL_PAR_DEFAUT = Number(process.env.CACHE_TTL_MS) || 86_400_000

/** Nombre maximal d'entrées du cache mémoire de secours (bornage LRU anti-OOM, m-09). */
const MAX_ENTREES_MEMOIRE = Number(process.env.CACHE_MAX_MEMOIRE) || 500

/** Cache mémoire de secours si le disque est inaccessible (Map = ordre d'insertion → LRU). */
const cacheMemoire = new Map()

/**
 * Requêtes identiques en cours de résolution, indexées par clé de cache.
 * Permet de dédupliquer les appels concurrents (P-C4) : N appels simultanés sur
 * la même clé ne déclenchent qu'UN seul fetch externe (évite le ban User-Agent).
 * @type {Map<string, Promise<*>>}
 */
const requetesEnVol = new Map()

/** Compteur monotone pour générer des noms de fichiers temporaires uniques (écriture atomique). */
let compteurTmp = 0

/** Indique si le cache disque est opérationnel. */
let cacheDisqueActif = null

/**
 * Initialise le dossier de cache disque.
 * Appelé paresseusement au premier accès.
 * @returns {Promise<boolean>} true si le disque est utilisable
 */
async function initialiserCacheDisque() {
  if (cacheDisqueActif !== null) return cacheDisqueActif
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    // Vérification des permissions en écriture
    const fichierTest = path.join(CACHE_DIR, '.write-test')
    await fs.writeFile(fichierTest, '')
    await fs.unlink(fichierTest)
    cacheDisqueActif = true
  } catch {
    console.warn(
      '[cache] Dossier .cache inaccessible — bascule sur cache mémoire (données non persistées entre redémarrages)',
    )
    cacheDisqueActif = false
  }
  return cacheDisqueActif
}

/**
 * Calcule la clé de cache SHA-256 à partir des paramètres de la requête.
 *
 * @param {string} connecteur - Nom du connecteur (ex: 'wikidata')
 * @param {string} methode - Nom de la méthode (ex: 'rechercher')
 * @param {*} args - Arguments sérialisables de la méthode
 * @returns {string} Hash hexadécimal de 64 caractères
 */
export function hashCle(connecteur, methode, args) {
  const payload = JSON.stringify({ connecteur, methode, args })
  return createHash('sha256').update(payload).digest('hex')
}

/**
 * Lit une entrée du cache.
 *
 * @param {string} cle - Hash SHA-256 retourné par `hashCle`
 * @param {number} [ttlMs] - TTL en millisecondes (défaut : `CACHE_TTL_MS`)
 * @returns {Promise<*|null>} Données mises en cache ou `null` si absent/expiré
 */
export async function lireCache(cle, ttlMs = TTL_PAR_DEFAUT) {
  const disqueActif = await initialiserCacheDisque()

  if (disqueActif) {
    return lireCacheDisque(cle, ttlMs)
  }
  return lireCacheMemoire(cle, ttlMs)
}

/**
 * Écrit une entrée dans le cache.
 *
 * @param {string} cle - Hash SHA-256 retourné par `hashCle`
 * @param {*} donnees - Données à mettre en cache (doit être sérialisable en JSON)
 * @returns {Promise<void>}
 */
export async function ecrireCache(cle, donnees) {
  const disqueActif = await initialiserCacheDisque()
  const entree = { ecritLe: new Date().toISOString(), donnees }

  if (disqueActif) {
    await ecrireCacheDisque(cle, entree)
  } else {
    ecrireCacheMemoire(cle, entree)
  }
}

/**
 * Lit le cache, sinon exécute `fabrique` pour produire la donnée, l'écrit en cache
 * et la renvoie. Déduplique les appels concurrents (P-C4) : si une requête identique
 * est déjà en vol, les appelants suivants attendent son résultat au lieu de relancer
 * un fetch (protège contre le ban User-Agent côté sources comme Wikidata).
 *
 * Les échecs ne sont jamais mis en cache : seul un résultat résolu est persisté.
 *
 * @param {string} cle - Hash SHA-256 retourné par `hashCle`
 * @param {number} ttlMs - TTL en millisecondes
 * @param {() => Promise<*>} fabrique - Calcule la donnée en cas de miss (ex: fetch externe)
 * @returns {Promise<*>} Donnée en cache ou fraîchement calculée
 */
export async function obtenirOuCalculer(cle, ttlMs, fabrique) {
  const cacheHit = await lireCache(cle, ttlMs)
  if (cacheHit !== null) return cacheHit

  // Dédup : une requête identique est déjà en vol → on attend son résultat.
  const enVol = requetesEnVol.get(cle)
  if (enVol) return enVol

  const promesse = (async () => {
    const donnees = await fabrique()
    await ecrireCache(cle, donnees)
    return donnees
  })()
  requetesEnVol.set(cle, promesse)
  try {
    return await promesse
  } finally {
    requetesEnVol.delete(cle)
  }
}

/**
 * Vide le cache mémoire (utile dans les tests).
 * N'affecte pas le cache disque.
 */
export function viderCacheMemoire() {
  cacheMemoire.clear()
}

/**
 * Réinitialise l'état d'initialisation du cache disque (utile dans les tests).
 */
export function reinitialiserEtatCache() {
  cacheDisqueActif = null
  cacheMemoire.clear()
  requetesEnVol.clear()
}

// ─── Implémentations internes ────────────────────────────────────────────────

async function lireCacheDisque(cle, ttlMs) {
  const chemin = path.join(CACHE_DIR, `${cle}.json`)
  try {
    const contenu = await fs.readFile(chemin, 'utf8')
    const entree = JSON.parse(contenu)
    const age = Date.now() - new Date(entree.ecritLe).getTime()
    if (age >= ttlMs) return null
    return entree.donnees
  } catch {
    return null
  }
}

async function ecrireCacheDisque(cle, entree) {
  const chemin = path.join(CACHE_DIR, `${cle}.json`)
  // Écriture atomique (P-C4) : on écrit dans un fichier temporaire unique puis on
  // renomme. `rename` est atomique sur un même système de fichiers → jamais de JSON
  // tronqué/corrompu, même en cas d'écritures concurrentes sur la même clé ou de crash.
  const cheminTmp = `${chemin}.${process.pid}.${++compteurTmp}.tmp`
  try {
    await fs.writeFile(cheminTmp, JSON.stringify(entree), 'utf8')
    await fs.rename(cheminTmp, chemin)
  } catch (err) {
    await fs.unlink(cheminTmp).catch(() => {})
    throw err
  }
}

function lireCacheMemoire(cle, ttlMs) {
  const entree = cacheMemoire.get(cle)
  if (!entree) return null
  const age = Date.now() - new Date(entree.ecritLe).getTime()
  if (age > ttlMs) {
    cacheMemoire.delete(cle)
    return null
  }
  // LRU : un accès marque l'entrée comme récemment utilisée (replacée en fin de Map).
  cacheMemoire.delete(cle)
  cacheMemoire.set(cle, entree)
  return entree.donnees
}

function ecrireCacheMemoire(cle, entree) {
  // Replace en fin (entrée la plus récente), même si la clé existait déjà.
  cacheMemoire.delete(cle)
  cacheMemoire.set(cle, entree)
  // Éviction LRU : tant qu'on dépasse la capacité, on retire la plus ancienne (1re clé).
  while (cacheMemoire.size > MAX_ENTREES_MEMOIRE) {
    const plusAncienne = cacheMemoire.keys().next().value
    cacheMemoire.delete(plusAncienne)
  }
}

export { CACHE_DIR }
