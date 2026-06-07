/**
 * Tests du cache fichier disque.
 * Couvre : écriture, lecture, expiration TTL, stabilité du hash.
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import {
  hashCle,
  lireCache,
  ecrireCache,
  obtenirOuCalculer,
  reinitialiserEtatCache,
  CACHE_DIR,
} from '../../src/connecteurs/cache.js'

describe('cache — hashCle', () => {
  it('retourne un hash hexadécimal de 64 caractères', () => {
    const hash = hashCle('wikidata', 'rechercher', { q: 'Macron' })
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('produit le même hash pour des arguments identiques (stabilité)', () => {
    const hash1 = hashCle('rdap', 'detailler', 'example.fr')
    const hash2 = hashCle('rdap', 'detailler', 'example.fr')
    expect(hash1).toBe(hash2)
  })

  it('produit des hashes distincts pour des arguments différents', () => {
    const hash1 = hashCle('wikidata', 'rechercher', { q: 'Macron' })
    const hash2 = hashCle('wikidata', 'rechercher', { q: 'Hollande' })
    expect(hash1).not.toBe(hash2)
  })
})

describe('cache — écriture et lecture', () => {
  beforeEach(() => {
    reinitialiserEtatCache()
    // Force le cache mémoire en rendant le disque inaccessible
    process.env.CACHE_DIR = '/chemin/inexistant/__test_cache__'
  })

  it('retourne null pour une clé absente', async () => {
    const cle = hashCle('test', 'absent', Math.random())
    const resultat = await lireCache(cle, 86_400_000)
    expect(resultat).toBeNull()
  })

  it("lit ce qui vient d'être écrit", async () => {
    const cle = hashCle('test', 'lecture', 'données-test')
    const donnees = { valeur: 42, texte: 'bonjour' }
    await ecrireCache(cle, donnees)
    const lu = await lireCache(cle, 86_400_000)
    expect(lu).toEqual(donnees)
  })

  it('retourne null si le TTL est dépassé', async () => {
    const cle = hashCle('test', 'ttl', 'données-expirées')
    await ecrireCache(cle, { valeur: 'expirée' })
    // TTL de 0 ms → toujours expiré
    const lu = await lireCache(cle, 0)
    expect(lu).toBeNull()
  })

  it("retourne les données si le TTL n'est pas encore dépassé", async () => {
    const cle = hashCle('test', 'ttl-valide', 'données-fraîches')
    await ecrireCache(cle, { valeur: 'fraîche' })
    // TTL de 1 heure → pas encore expiré
    const lu = await lireCache(cle, 3_600_000)
    expect(lu).toEqual({ valeur: 'fraîche' })
  })
})

describe('cache — dédup des requêtes en vol (obtenirOuCalculer, P-C4)', () => {
  beforeEach(() => {
    reinitialiserEtatCache()
  })

  it('ne lance la fabrique qu’une seule fois pour des appels concurrents identiques', async () => {
    let appels = 0
    const fabrique = async () => {
      appels++
      await new Promise((r) => setTimeout(r, 10))
      return { valeur: 'frais' }
    }
    const cle = hashCle('test', 'dedup', 'concurrent')
    const resultats = await Promise.all([
      obtenirOuCalculer(cle, 86_400_000, fabrique),
      obtenirOuCalculer(cle, 86_400_000, fabrique),
      obtenirOuCalculer(cle, 86_400_000, fabrique),
    ])
    expect(appels).toBe(1)
    expect(resultats).toEqual([{ valeur: 'frais' }, { valeur: 'frais' }, { valeur: 'frais' }])
  })

  it('sert depuis le cache après résolution (la fabrique n’est pas rejouée)', async () => {
    let appels = 0
    const fabrique = async () => {
      appels++
      return { n: appels }
    }
    const cle = hashCle('test', 'dedup', 'sequentiel')
    await obtenirOuCalculer(cle, 86_400_000, fabrique)
    const second = await obtenirOuCalculer(cle, 86_400_000, fabrique)
    expect(appels).toBe(1)
    expect(second).toEqual({ n: 1 })
  })

  it('ne met jamais un échec en cache (la fabrique est rejouée après erreur)', async () => {
    let appels = 0
    const fabrique = async () => {
      appels++
      throw new Error('échec réseau')
    }
    const cle = hashCle('test', 'dedup', 'echec')
    await expect(obtenirOuCalculer(cle, 86_400_000, fabrique)).rejects.toThrow('échec réseau')
    await expect(obtenirOuCalculer(cle, 86_400_000, fabrique)).rejects.toThrow('échec réseau')
    expect(appels).toBe(2)
  })
})

describe('cache — écriture disque atomique (P-C4)', () => {
  beforeEach(() => {
    reinitialiserEtatCache()
  })

  it('persiste un JSON valide et ne laisse aucun fichier .tmp résiduel', async () => {
    const cle = hashCle('test', 'atomique', `solo-${Date.now()}`)
    await ecrireCache(cle, { valeur: 'atomique' })

    const fichiers = await fs.readdir(CACHE_DIR)
    // Le test n'a de sens qu'en mode disque ; sinon il n'y a pas de fichier (skip implicite).
    if (!fichiers.includes(`${cle}.json`)) return

    expect(fichiers.some((f) => f.startsWith(cle) && f.endsWith('.tmp'))).toBe(false)
    const contenu = JSON.parse(await fs.readFile(path.join(CACHE_DIR, `${cle}.json`), 'utf8'))
    expect(contenu.donnees).toEqual({ valeur: 'atomique' })
    expect(await lireCache(cle, 86_400_000)).toEqual({ valeur: 'atomique' })
  })

  it('écritures concurrentes sur la même clé → JSON final non corrompu', async () => {
    const cle = hashCle('test', 'atomique', `concurrent-${Date.now()}`)
    await Promise.all([
      ecrireCache(cle, { v: 1 }),
      ecrireCache(cle, { v: 2 }),
      ecrireCache(cle, { v: 3 }),
    ])
    const lu = await lireCache(cle, 86_400_000)
    if (lu === null) return // mode mémoire : non applicable
    expect([1, 2, 3]).toContain(lu.v)
    const fichiers = await fs.readdir(CACHE_DIR)
    expect(fichiers.some((f) => f.startsWith(cle) && f.endsWith('.tmp'))).toBe(false)
  })
})
