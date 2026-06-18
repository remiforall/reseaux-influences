/**
 * Tests du connecteur GLEIF (identifiants d'entités juridiques mondiaux).
 * Couvre : recherche plein-texte / par LEI, mapping Organisation, détail,
 * relations de propriété (mère directe/ultime + filiales), gestion des 404.
 *
 * Aucun appel réseau : `_appelHttp` de l'instance est stubbé par URL.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: jest.fn(() => 'hash-gleif-test'),
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

const { default: GleifConnecteur } = await import('../../../src/connecteurs/sources/gleif.js')

const LEI_BOLLORE = '969500DRCO64JT9P7L75' // forme valide (18 alphanum + 2 chiffres)
const LEI_PARENT = '529900T8BM49AURSDO55'
const LEI_ENFANT = '5493001KJTIIGC8Y1R12'

function leiRecord(lei, nom, pays = 'FR') {
  return {
    type: 'lei-records',
    id: lei,
    attributes: {
      lei,
      entity: {
        legalName: { name: nom },
        legalJurisdiction: pays,
        legalForm: { id: '6540' },
        status: 'ACTIVE',
        category: 'GENERAL',
        legalAddress: {
          addressLines: ['31 quai de Dion Bouton'],
          postalCode: '92800',
          city: 'Puteaux',
          country: 'FR',
        },
      },
      registration: { initialRegistrationDate: '2017-05-09T00:00:00Z', status: 'ISSUED' },
    },
  }
}

let connecteur

beforeEach(() => {
  connecteur = new GleifConnecteur()
})

describe('GleifConnecteur — rechercher()', () => {
  it('retourne un tableau vide pour une query trop courte', async () => {
    const res = await connecteur.rechercher('x')
    expect(res.resultats).toHaveLength(0)
    expect(res.source).toBe('gleif')
  })

  it('utilise le filtre plein-texte pour un terme libre', async () => {
    const spy = jest
      .spyOn(connecteur, '_appelHttp')
      .mockResolvedValue({ data: [leiRecord(LEI_BOLLORE, 'BOLLORE SE')] })

    const res = await connecteur.rechercher('Bollore')

    expect(spy.mock.calls[0][0]).toContain('filter[fulltext]=Bollore')
    expect(res.resultats).toHaveLength(1)
    const ent = res.resultats[0]
    expect(ent.type).toBe('Organisation')
    expect(ent.champs.nom.valeur).toBe('BOLLORE SE')
    expect(ent.champs.identifiantLei.valeur).toBe(LEI_BOLLORE)
    expect(ent.champs.pays.valeur).toBe('FR')
    expect(ent.champs.adresseSiege.valeur).toContain('Puteaux')
  })

  it('utilise le filtre LEI si le terme est un LEI valide', async () => {
    const spy = jest
      .spyOn(connecteur, '_appelHttp')
      .mockResolvedValue({ data: [leiRecord(LEI_BOLLORE, 'BOLLORE SE')] })

    await connecteur.rechercher(LEI_BOLLORE)
    expect(spy.mock.calls[0][0]).toContain(`filter[lei]=${LEI_BOLLORE}`)
  })

  it('gère une réponse sans data', async () => {
    jest.spyOn(connecteur, '_appelHttp').mockResolvedValue({})
    const res = await connecteur.rechercher('Inconnu')
    expect(res.resultats).toHaveLength(0)
  })
})

describe('GleifConnecteur — detailler()', () => {
  it('retourne null pour un LEI malformé sans appel réseau', async () => {
    const spy = jest.spyOn(connecteur, '_appelHttp')
    const res = await connecteur.detailler('pas-un-lei')
    expect(res.entite).toBeNull()
    expect(spy).not.toHaveBeenCalled()
  })

  it('mappe le détail pour un LEI valide', async () => {
    jest
      .spyOn(connecteur, '_appelHttp')
      .mockResolvedValue({ data: leiRecord(LEI_BOLLORE, 'BOLLORE SE') })
    const res = await connecteur.detailler(LEI_BOLLORE)
    expect(res.entite.champs.nom.valeur).toBe('BOLLORE SE')
  })

  it('traite un 404 comme entité absente', async () => {
    const err = new Error('HTTP 404')
    err.status = 404
    jest.spyOn(connecteur, '_appelHttp').mockRejectedValue(err)
    const res = await connecteur.detailler(LEI_BOLLORE)
    expect(res.entite).toBeNull()
  })
})

describe('GleifConnecteur — listerLiens() (relations de propriété)', () => {
  it('mappe mère directe, mère ultime et filiales en liens BENEFICIAIRE_EFFECTIF', async () => {
    jest.spyOn(connecteur, '_appelHttp').mockImplementation(async (url) => {
      if (url.endsWith('/direct-parent')) return { data: leiRecord(LEI_PARENT, 'GROUPE BOLLORE') }
      if (url.endsWith('/ultimate-parent')) return { data: leiRecord(LEI_PARENT, 'GROUPE BOLLORE') }
      if (url.includes('/direct-children'))
        return { data: [leiRecord(LEI_ENFANT, 'BOLLORE LOGISTICS')] }
      return { data: null }
    })

    const res = await connecteur.listerLiens(LEI_BOLLORE)

    // 2 mères + 1 filiale = 3 liens
    expect(res.liens).toHaveLength(3)
    expect(res.liens.every((l) => l.typeLienCode === 'BENEFICIAIRE_EFFECTIF')).toBe(true)
    expect(res.liens.every((l) => l.vers.type === 'Organisation')).toBe(true)
    const roles = res.liens.map((l) => l.roleRelation)
    expect(roles).toContain('Société mère directe')
    expect(roles).toContain('Société mère ultime')
    expect(roles).toContain('Filiale directe')
    expect(res.liens[0].vers.identifiantExterne).toBe(LEI_PARENT)
  })

  it('retourne aucun lien si toutes les relations renvoient 404', async () => {
    const err = new Error('HTTP 404')
    err.status = 404
    jest.spyOn(connecteur, '_appelHttp').mockRejectedValue(err)
    const res = await connecteur.listerLiens(LEI_BOLLORE)
    expect(res.liens).toHaveLength(0)
  })

  it('retourne aucun lien pour un LEI malformé', async () => {
    const spy = jest.spyOn(connecteur, '_appelHttp')
    const res = await connecteur.listerLiens('xxx')
    expect(res.liens).toHaveLength(0)
    expect(spy).not.toHaveBeenCalled()
  })
})
