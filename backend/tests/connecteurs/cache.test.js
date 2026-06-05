/**
 * Tests du cache fichier disque.
 * Couvre : écriture, lecture, expiration TTL, stabilité du hash.
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  hashCle,
  lireCache,
  ecrireCache,
  reinitialiserEtatCache,
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
