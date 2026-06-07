/**
 * Tests du connecteur Parlementaires (NosDéputés.fr + NosSénateurs.fr).
 * Couvre : indexation depuis synthese JSON, recherche par nom, mapping Personne,
 * liens suggeres (chambre, parti), cas vide, resilience sur erreur reseau.
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

const { default: ParlementairesConnecteur } =
  await import('../../../src/connecteurs/sources/parlementaires.js')

/** Fixture synthese NosDéputés.fr */
const FIXTURE_SYNTHESE_DEPUTES = {
  deputes: [
    {
      depute: {
        id: 'PA1',
        slug: 'jean-dupont',
        nom: 'Jean Dupont',
        nom_de_famille: 'Dupont',
        prenom: 'Jean',
        date_naissance: '1965-03-15',
        lieu_naissance: 'Caen',
        groupe_sigle: 'LREM',
        parti_ratt_financier: 'La République en Marche',
        mandat_debut: '2022-06-19',
        mandat_fin: null,
        num_deptmt: '14',
        circonscription: '3',
        sites_web: [{ site_web: 'https://jean-dupont.fr' }],
      },
    },
  ],
}

/** Fixture synthese NosSénateurs.fr */
const FIXTURE_SYNTHESE_SENATEURS = {
  senateurs: [
    {
      senateur: {
        id: 'SE1',
        slug: 'marie-martin',
        nom: 'Marie Martin',
        nom_de_famille: 'Martin',
        prenom: 'Marie',
        date_naissance: '1972-07-22',
        groupe_sigle: 'LR',
        parti_ratt_financier: 'Les Républicains',
        mandat_debut: '2020-09-27',
        num_deptmt: '59',
      },
    },
  ],
}

describe('ParlementairesConnecteur — rechercher()', () => {
  it('retourne un tableau vide pour une query trop courte', async () => {
    const connecteur = new ParlementairesConnecteur()
    const resultat = await connecteur.rechercher('a')
    expect(resultat.resultats).toHaveLength(0)
    expect(resultat.source).toBe('NosDéputes/NosSénateurs')
  })

  it('retourne un tableau vide pour une query vide', async () => {
    const connecteur = new ParlementairesConnecteur()
    const resultat = await connecteur.rechercher('')
    expect(resultat.resultats).toHaveLength(0)
  })

  it('trouve un depute par son nom depuis la fixture', async () => {
    const connecteur = new ParlementairesConnecteur()
    // Injecter directement les index pour eviter les appels reseau
    connecteur._indexDeputes = connecteur._construireIndex(
      FIXTURE_SYNTHESE_DEPUTES,
      'deputes',
      'depute',
    )
    connecteur._indexSenateurs = new Map()

    const resultat = await connecteur.rechercher('Dupont')
    expect(resultat.resultats).toHaveLength(1)
    const entite = resultat.resultats[0]
    expect(entite.type).toBe('Personne')
    expect(entite.champs.nom.valeur).toBe('Dupont')
    expect(entite.champs.prenom.valeur).toBe('Jean')
    expect(entite.champs.pays.valeur).toBe('France')
    expect(entite.champs.qualiteInfluence.valeur).toBe('ELU')
    expect(entite.champs.nom.source).toBe('NosDéputés.fr')
  })

  it('trouve un senateur par son nom depuis la fixture', async () => {
    const connecteur = new ParlementairesConnecteur()
    connecteur._indexDeputes = new Map()
    connecteur._indexSenateurs = connecteur._construireIndex(
      FIXTURE_SYNTHESE_SENATEURS,
      'senateurs',
      'senateur',
    )

    const resultat = await connecteur.rechercher('Martin', { chambre: 'SENAT' })
    expect(resultat.resultats).toHaveLength(1)
    expect(resultat.resultats[0].champs.nom.source).toBe('NosSénateurs.fr')
  })

  it('genere des liens vers la chambre et le parti', async () => {
    const connecteur = new ParlementairesConnecteur()
    connecteur._indexDeputes = connecteur._construireIndex(
      FIXTURE_SYNTHESE_DEPUTES,
      'deputes',
      'depute',
    )
    connecteur._indexSenateurs = new Map()

    const resultat = await connecteur.rechercher('Dupont')
    const liens = resultat.resultats[0].liensSuggeres

    const typesLiens = liens.map((l) => l.typeLienCode)
    expect(typesLiens).toContain('MANDAT_ELECTIF')
    expect(typesLiens).toContain('AFFILIATION_PARTI')

    const lienChambre = liens.find((l) => l.typeLienCode === 'MANDAT_ELECTIF')
    expect(lienChambre.vers.identifiantExterne).toBe('Assemblee nationale')
  })

  it('retourne un tableau vide quand les deux endpoints sont en erreur', async () => {
    const connecteur = new ParlementairesConnecteur()
    connecteur._appelHttp = jest.fn().mockRejectedValue(new Error('Network error'))

    const resultat = await connecteur.rechercher('Dupont')
    expect(resultat.resultats).toHaveLength(0)
  })
})
