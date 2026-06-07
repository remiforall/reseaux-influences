/**
 * Tests du connecteur BODACC.
 * Couvre : recherche standard, cas vide, erreur HTTP 4xx, mapping Organisation,
 * extraction des dirigeants depuis les actes.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: () => 'hash-test',
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

const { default: BodaccConnecteur } = await import('../../../src/connecteurs/sources/bodacc.js')

/** Fixture simulant une reponse BODACC avec 2 annonces pour la meme societe. */
const FIXTURE_REPONSE_BODACC = {
  total_count: 2,
  results: [
    {
      denomination: 'POSTHACK SAS',
      numeroImmatriculation: '123456789',
      dateparution: '2024-03-15',
      typeavis: 'Immatriculation',
      familleavis: 'Immatriculation',
      ville: 'Caen',
      acte: 'Creation. Gerant : M. Vincent Remi. Capital 1000 EUR.',
      registre: 'RCS CAEN',
    },
    {
      denomination: 'POSTHACK SAS',
      numeroImmatriculation: '123456789',
      dateparution: '2025-01-10',
      typeavis: 'Modification',
      familleavis: 'Modification generale',
      ville: 'Caen',
      acte: 'Augmentation de capital. Nouveau gerant : Mme. Durand Sophie.',
      registre: 'RCS CAEN',
    },
  ],
}

describe('BodaccConnecteur — rechercher()', () => {
  it('retourne un tableau vide pour une query trop courte', async () => {
    const connecteur = new BodaccConnecteur()
    const resultat = await connecteur.rechercher('a')
    expect(resultat.resultats).toHaveLength(0)
    expect(resultat.source).toBe('BODACC')
  })

  it('retourne un tableau vide pour une query vide', async () => {
    const connecteur = new BodaccConnecteur()
    const resultat = await connecteur.rechercher('')
    expect(resultat.resultats).toHaveLength(0)
  })

  it('mappe correctement une reponse BODACC avec 2 annonces pour 1 societe', async () => {
    const connecteur = new BodaccConnecteur()
    connecteur._appelHttp = jest.fn().mockResolvedValue(FIXTURE_REPONSE_BODACC)

    const resultat = await connecteur.rechercher('POSTHACK')

    expect(resultat.resultats).toHaveLength(1) // 1 societe, 2 annonces regroupees
    const entite = resultat.resultats[0]
    expect(entite.type).toBe('Organisation')
    expect(entite.champs.nom.valeur).toBe('POSTHACK SAS')
    expect(entite.champs.siren.valeur).toBe('123456789')
    expect(entite.champs.pays.valeur).toBe('France')
    expect(entite.champs.nom.source).toBe('BODACC')
  })

  it('inclut les evenements recents dans les champs', async () => {
    const connecteur = new BodaccConnecteur()
    connecteur._appelHttp = jest.fn().mockResolvedValue(FIXTURE_REPONSE_BODACC)

    const resultat = await connecteur.rechercher('POSTHACK')
    const evenements = resultat.resultats[0].champs.evenementsRecents.valeur

    expect(Array.isArray(evenements)).toBe(true)
    expect(evenements.length).toBe(2)
    expect(evenements[0].type).toBe('Immatriculation')
  })

  it("leve une erreur si l'API retourne une erreur 4xx", async () => {
    const connecteur = new BodaccConnecteur()
    const erreur = new Error('[bodacc] HTTP 400 sur ...')
    erreur.status = 400
    connecteur._appelHttp = jest.fn().mockRejectedValue(erreur)

    await expect(connecteur.rechercher('POSTHACK')).rejects.toThrow('HTTP 400')
  })
})

describe('BodaccConnecteur — detailler()', () => {
  it('retourne null pour un SIREN invalide', async () => {
    const connecteur = new BodaccConnecteur()
    const resultat = await connecteur.detailler('123')
    expect(resultat.entite).toBeNull()
  })

  it('mappe correctement un resultat par SIREN', async () => {
    const connecteur = new BodaccConnecteur()
    connecteur._appelHttp = jest.fn().mockResolvedValue(FIXTURE_REPONSE_BODACC)

    const resultat = await connecteur.detailler('123456789')
    expect(resultat.entite).not.toBeNull()
    expect(resultat.entite.champs.siren.valeur).toBe('123456789')
  })
})
