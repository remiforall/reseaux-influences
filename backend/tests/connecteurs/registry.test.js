/**
 * Tests du registry de connecteurs.
 * Couvre : chargement depuis .env, skip Pappers sans clé, connecteur manquant,
 * ordre déterministe.
 *
 * Approche : on teste le comportement observable du registry (présence des
 * connecteurs dans la Map, skip Pappers, gestion d'un nom inexistant) en
 * utilisant les vrais modules sources lorsqu'ils existent — et en contrôlant
 * l'env pour isoler chaque scénario.
 *
 * Note sur jest.unstable_mockModule et imports dynamiques ESM :
 *   `jest.unstable_mockModule` intercepte les imports via le specifier résolu
 *   en chemin absolu. Pour les imports dynamiques dans registry.js
 *   (`import('./sources/<nom>.js')`), le specifier est résolu depuis le
 *   dossier de registry.js. Les mocks sont déclarés avec des chemins relatifs
 *   depuis ce fichier de test, Jest les résout en absolu — la correspondance
 *   est assurée par le loader.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Les mocks doivent être déclarés AVANT tout import du module à tester.
// On mock cache et rate-limit pour que les constructeurs de connecteurs
// ne créent pas de vrais buckets ni n'accèdent au disque.
await jest.unstable_mockModule('../../src/connecteurs/cache.js', () => ({
  hashCle: jest.fn().mockReturnValue('hash-mock'),
  lireCache: jest.fn().mockResolvedValue(null),
  ecrireCache: jest.fn().mockResolvedValue(undefined),
  reinitialiserEtatCache: jest.fn(),
  CACHE_DIR: '/tmp/test-cache',
}))

await jest.unstable_mockModule('../../src/connecteurs/rate-limit.js', () => ({
  creerBucket: jest.fn(),
  consommer: jest.fn().mockResolvedValue(undefined),
  reinitialiserBuckets: jest.fn(),
  obtenirEtatBucket: jest.fn().mockReturnValue({ tokens: 5, capacite: 5, debit: 2 }),
}))

// Import du registry APRÈS les mocks (impératif avec ESM)
const { chargerConnecteurs, reinitialiserRegistry, listerConnecteurs } =
  await import('../../src/connecteurs/registry.js')

describe('registry — chargement de connecteurs existants', () => {
  beforeEach(() => {
    reinitialiserRegistry()
    delete process.env.ENRICHISSEMENT_CONNECTEURS_ACTIFS
    delete process.env.PAPPERS_API_KEY
  })

  it('charge wikidata et rdap qui existent réellement', async () => {
    process.env.ENRICHISSEMENT_CONNECTEURS_ACTIFS = 'wikidata,rdap'
    const registry = await chargerConnecteurs()
    expect(registry.has('wikidata')).toBe(true)
    expect(registry.has('rdap')).toBe(true)
    expect(registry.size).toBe(2)
  })

  it("ignore silencieusement un connecteur dont le module n'existe pas", async () => {
    process.env.ENRICHISSEMENT_CONNECTEURS_ACTIFS = 'wikidata,source-inexistante-xyz'
    const registry = await chargerConnecteurs()
    // wikidata existe → chargé ; source-inexistante-xyz → warn + skip
    expect(registry.has('wikidata')).toBe(true)
    expect(registry.has('source-inexistante-xyz')).toBe(false)
  })
})

describe('registry — skip Pappers sans clé API', () => {
  beforeEach(() => {
    reinitialiserRegistry()
    delete process.env.PAPPERS_API_KEY
  })

  it('ignore pappers si PAPPERS_API_KEY est absente', async () => {
    process.env.ENRICHISSEMENT_CONNECTEURS_ACTIFS = 'wikidata,pappers'
    const registry = await chargerConnecteurs()
    expect(registry.has('pappers')).toBe(false)
    expect(registry.has('wikidata')).toBe(true)
  })

  it('tente de charger pappers si PAPPERS_API_KEY est définie (échec gracieux si fichier absent)', async () => {
    process.env.PAPPERS_API_KEY = 'cle-test-fictive'
    process.env.ENRICHISSEMENT_CONNECTEURS_ACTIFS = 'wikidata,pappers'
    // pappers.js n'existe pas → warn + skip, pas de crash
    const registry = await chargerConnecteurs()
    expect(registry.has('wikidata')).toBe(true)
    // pappers absent car fichier source non créé dans ce lot (attendu)
    expect(registry.has('pappers')).toBe(false)
  })
})

describe('registry — ordre déterministe', () => {
  beforeEach(() => {
    reinitialiserRegistry()
    delete process.env.PAPPERS_API_KEY
  })

  it("listerConnecteurs respecte l'ordre de ENRICHISSEMENT_CONNECTEURS_ACTIFS", async () => {
    process.env.ENRICHISSEMENT_CONNECTEURS_ACTIFS = 'rdap,wikidata'
    const noms = await listerConnecteurs()
    expect(noms[0]).toBe('rdap')
    expect(noms[1]).toBe('wikidata')
  })

  it('chargerConnecteurs est idempotent — second appel retourne le même registry', async () => {
    process.env.ENRICHISSEMENT_CONNECTEURS_ACTIFS = 'wikidata'
    const registry1 = await chargerConnecteurs()
    const registry2 = await chargerConnecteurs()
    expect(registry1).toBe(registry2)
  })
})
