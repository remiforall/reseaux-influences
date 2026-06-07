/**
 * Tests du bornage LRU du cache mémoire (m-09 — anti-OOM).
 *
 * Le cache mémoire n'est utilisé que lorsque le disque est inaccessible. On force
 * ce mode en pointant CACHE_DIR vers un chemin non créable AVANT l'import du module
 * (la constante CACHE_DIR est figée à l'évaluation du module).
 */

import { describe, it, expect, beforeEach } from '@jest/globals'

// Chemin non créable (sous /dev/null) → initialiserCacheDisque échoue → mode mémoire.
process.env.CACHE_DIR = '/dev/null/cache-inaccessible-lru'

const { hashCle, lireCache, ecrireCache, reinitialiserEtatCache } =
  await import('../../src/connecteurs/cache.js')

/** Doit correspondre au défaut MAX_ENTREES_MEMOIRE de cache.js. */
const MAX = 500

describe('cache mémoire — bornage LRU', () => {
  beforeEach(() => {
    reinitialiserEtatCache()
  })

  it('évince les entrées les plus anciennes au-delà de la capacité', async () => {
    for (let i = 0; i < MAX; i++) {
      await ecrireCache(`cle-${i}`, { i })
    }
    // Une entrée de plus que la capacité → la plus ancienne (cle-0) est évincée.
    await ecrireCache(`cle-${MAX}`, { i: MAX })

    expect(await lireCache('cle-0', 86_400_000)).toBeNull()
    expect(await lireCache(`cle-${MAX}`, 86_400_000)).toEqual({ i: MAX })
    expect(await lireCache(`cle-${MAX - 1}`, 86_400_000)).toEqual({ i: MAX - 1 })
  })

  it('une lecture rafraîchit la récence : une entrée lue survit à l’éviction suivante', async () => {
    for (let i = 0; i < MAX; i++) {
      await ecrireCache(`k-${i}`, { i })
    }
    // Lire k-0 le replace en « récemment utilisé » → ce n'est plus lui le plus ancien.
    await lireCache('k-0', 86_400_000)
    // Nouvelle écriture → évince désormais k-1 (devenu le plus ancien), pas k-0.
    await ecrireCache(`k-${MAX}`, { i: MAX })

    expect(await lireCache('k-0', 86_400_000)).toEqual({ i: 0 })
    expect(await lireCache('k-1', 86_400_000)).toBeNull()
  })
})
