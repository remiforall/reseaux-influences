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

/** Cache mémoire de secours si le disque est inaccessible. */
const cacheMemoire = new Map()

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
  await fs.writeFile(chemin, JSON.stringify(entree), 'utf8')
}

function lireCacheMemoire(cle, ttlMs) {
  const entree = cacheMemoire.get(cle)
  if (!entree) return null
  const age = Date.now() - new Date(entree.ecritLe).getTime()
  if (age > ttlMs) return null
  return entree.donnees
}

function ecrireCacheMemoire(cle, entree) {
  cacheMemoire.set(cle, entree)
}

export { CACHE_DIR }
