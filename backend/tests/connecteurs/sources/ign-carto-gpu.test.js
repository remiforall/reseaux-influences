/**
 * Tests du connecteur IGN Carto GPU.
 * Couvre : format "lon,lat", format GeoJSON brut, query invalide,
 * mapping zone urbanisme.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURES_DIR = path.join(__dirname, '../fixtures')

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: () => 'hash-test-gpu',
  lireCache: jest.fn().mockResolvedValue(null),
  ecrireCache: jest.fn().mockResolvedValue(undefined),
  obtenirOuCalculer: (cle, ttlMs, fabrique) => fabrique(),
  reinitialiserEtatCache: jest.fn(),
}))

await jest.unstable_mockModule('../../../src/connecteurs/rate-limit.js', () => ({
  creerBucket: jest.fn(),
  consommer: jest.fn().mockResolvedValue(undefined),
  reinitialiserBuckets: jest.fn(),
  obtenirEtatBucket: jest.fn(),
}))

const { default: IgnCartoGpu } = await import('../../../src/connecteurs/sources/ign-carto-gpu.js')

async function chargerFixture() {
  const contenu = await readFile(path.join(FIXTURES_DIR, 'ign-carto-gpu.json'), 'utf8')
  return JSON.parse(contenu)
}

describe('IgnCartoGpu — rechercher()', () => {
  let connecteur

  beforeEach(() => {
    connecteur = new IgnCartoGpu()
  })

  it('retourne tableau vide pour une query invalide', async () => {
    connecteur._appelHttp = jest.fn()
    const resultat = await connecteur.rechercher('pas des coordonnées')
    expect(resultat.resultats).toHaveLength(0)
    expect(connecteur._appelHttp).not.toHaveBeenCalled()
  })

  it('parse le raccourci "lon,lat" et construit un Point GeoJSON', async () => {
    const fixture = await chargerFixture()
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture)

    await connecteur.rechercher('2.3488,48.8534')

    const urlAppelée = connecteur._appelHttp.mock.calls[0][0]
    expect(urlAppelée).toContain('apicarto.ign.fr')
    expect(urlAppelée).toContain('geom=')
    expect(urlAppelée).toContain('Point')
  })

  it('accepte un GeoJSON brut sérialisé', async () => {
    const fixture = await chargerFixture()
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture)

    const geojson = JSON.stringify({ type: 'Point', coordinates: [2.3488, 48.8534] })
    await connecteur.rechercher(geojson)

    expect(connecteur._appelHttp).toHaveBeenCalledTimes(1)
  })

  it('mappe correctement une zone urbanisme depuis la fixture', async () => {
    const fixture = await chargerFixture()
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture)

    const resultat = await connecteur.rechercher('2.3488,48.8534')

    expect(resultat.resultats).toHaveLength(1)
    const zone = resultat.resultats[0]

    expect(zone.type).toBe('ZoneUrbanisme')
    expect(zone.champs.libelle.valeur).toContain('Zone urbaine')
    expect(zone.champs.typezone.valeur).toBe('U')
    expect(zone.champs.destinations.valeur).toBe('Habitat')
    expect(zone.champs.libelle.source).toBe('IGN GPU')
  })

  it('retourne tableau vide pour une query vide', async () => {
    connecteur._appelHttp = jest.fn()
    const resultat = await connecteur.rechercher('')
    expect(resultat.resultats).toHaveLength(0)
    expect(connecteur._appelHttp).not.toHaveBeenCalled()
  })
})
