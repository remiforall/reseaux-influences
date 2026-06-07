/**
 * Tests du connecteur IGN DVF.
 * Couvre : format codeInsee/section, format codeInsee seul (fallback),
 * query invalide, mapping champs normalisés.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURES_DIR = path.join(__dirname, '../fixtures')

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: () => 'hash-test-dvf',
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

const { default: IgnDvfConnecteur } = await import('../../../src/connecteurs/sources/ign-dvf.js')

async function chargerFixture() {
  const contenu = await readFile(path.join(FIXTURES_DIR, 'ign-dvf.json'), 'utf8')
  return JSON.parse(contenu)
}

describe('IgnDvfConnecteur — rechercher()', () => {
  let connecteur

  beforeEach(() => {
    connecteur = new IgnDvfConnecteur()
  })

  it('retourne tableau vide pour query invalide', async () => {
    connecteur._appelHttp = jest.fn()
    const resultat = await connecteur.rechercher('pas-un-code-insee')
    expect(resultat.resultats).toHaveLength(0)
    expect(connecteur._appelHttp).not.toHaveBeenCalled()
  })

  it("appelle l'endpoint Etalab avec le format codeInsee/section", async () => {
    const fixture = await chargerFixture()
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture)

    const resultat = await connecteur.rechercher('75114/A')

    expect(connecteur._appelHttp).toHaveBeenCalledTimes(1)
    const urlAppelée = connecteur._appelHttp.mock.calls[0][0]
    expect(urlAppelée).toContain('dvf.etalab.gouv.fr')
    expect(urlAppelée).toContain('75114')
    expect(resultat.source).toBe('DVF')
  })

  it('mappe correctement les transactions depuis la fixture', async () => {
    const fixture = await chargerFixture()
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture)

    const resultat = await connecteur.rechercher('75114/A')

    expect(resultat.resultats).toHaveLength(2)
    const premiere = resultat.resultats[0]

    expect(premiere.type).toBe('TransactionFonciere')
    expect(premiere.champs.dateMutation.valeur).toBe('2023-06-15')
    expect(premiere.champs.valeurFonciere.valeur).toBe(450000)
    expect(premiere.champs.surface.valeur).toBe(78)
    expect(premiere.champs.typeLocal.valeur).toBe('Appartement')
    expect(premiere.champs.dateMutation.source).toBe('DVF')
  })

  it('appelle le fallback cquest.org avec un code INSEE seul', async () => {
    const fixture = await chargerFixture()
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture)

    await connecteur.rechercher('75114')

    const urlAppelée = connecteur._appelHttp.mock.calls[0][0]
    expect(urlAppelée).toContain('cquest.org')
    expect(urlAppelée).toContain('75114')
  })
})
