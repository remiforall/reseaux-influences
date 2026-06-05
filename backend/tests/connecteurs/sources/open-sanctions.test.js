/**
 * Tests du connecteur OpenSanctions.
 * Couvre : parsing JSONL FtM, indexation, recherche par nom, mapping Person/Organization.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: jest.fn(() => 'hash-open-sanctions-test'),
  lireCache: jest.fn().mockResolvedValue(null),
  ecrireCache: jest.fn().mockResolvedValue(undefined),
  reinitialiserEtatCache: jest.fn(),
}))

await jest.unstable_mockModule('../../../src/connecteurs/rate-limit.js', () => ({
  creerBucket: jest.fn(),
  consommer: jest.fn().mockResolvedValue(undefined),
  reinitialiserBuckets: jest.fn(),
  obtenirEtatBucket: jest.fn(),
}))

const { default: OpenSanctionsConnecteur } =
  await import('../../../src/connecteurs/sources/open-sanctions.js')

/** Fixture JSONL FtM — 3 entités (2 Person, 1 Organization) */
const FIXTURE_JSONL_FR_ASSEMBLEE = [
  JSON.stringify({
    id: 'fr-assemblee-001',
    schema: 'Person',
    properties: {
      name: ['Dupont Jean'],
      firstName: ['Jean'],
      lastName: ['Dupont'],
      birthDate: ['1965-03-15'],
      country: ['fr'],
      position: ['Député de la Seine-et-Marne'],
    },
  }),
  JSON.stringify({
    id: 'fr-assemblee-002',
    schema: 'Person',
    properties: {
      name: ['Martin Sophie'],
      firstName: ['Sophie'],
      lastName: ['Martin'],
      birthDate: ['1978-07-22'],
      country: ['fr'],
    },
  }),
  JSON.stringify({
    id: 'fr-assemblee-org-001',
    schema: 'Organization',
    properties: {
      name: ['Assemblée nationale'],
      country: ['fr'],
    },
  }),
  // Ligne vide (doit être ignorée)
  '',
  // Ligne invalide (doit être ignorée)
  'not-valid-json',
].join('\n')

describe('OpenSanctionsConnecteur — indexation JSONL', () => {
  it('parse et indexe correctement le JSONL FtM', () => {
    const connecteur = new OpenSanctionsConnecteur()
    connecteur._index = new Map()
    const dataset = { nom: 'fr_assemblee', qualiteInfluence: 'ELU', label: 'Assemblée nationale' }

    connecteur._indexerJsonl(FIXTURE_JSONL_FR_ASSEMBLEE, dataset)

    // 3 entités valides : 2 Person + 1 Organization
    expect(connecteur._index.size).toBe(3)
  })

  it('ignore les lignes vides et JSON invalides', () => {
    const connecteur = new OpenSanctionsConnecteur()
    connecteur._index = new Map()
    const dataset = { nom: 'fr_assemblee', qualiteInfluence: 'ELU', label: 'Assemblée nationale' }

    // Ne doit pas lever d'exception
    expect(() => connecteur._indexerJsonl(FIXTURE_JSONL_FR_ASSEMBLEE, dataset)).not.toThrow()
  })
})

describe('OpenSanctionsConnecteur — rechercher()', () => {
  /** Connecteur avec index pré-rempli pour éviter les appels réseau */
  let connecteur

  beforeEach(() => {
    connecteur = new OpenSanctionsConnecteur()
    connecteur._index = new Map()
    const dataset = { nom: 'fr_assemblee', qualiteInfluence: 'ELU', label: 'Assemblée nationale' }
    connecteur._indexerJsonl(FIXTURE_JSONL_FR_ASSEMBLEE, dataset)
  })

  it('retourne un tableau vide pour une query trop courte', async () => {
    const resultat = await connecteur.rechercher('x')
    expect(resultat.resultats).toHaveLength(0)
    expect(resultat.source).toBe('OpenSanctions')
  })

  it('trouve une Person par nom normalisé', async () => {
    const resultat = await connecteur.rechercher('Dupont')
    expect(resultat.resultats).toHaveLength(1)
    expect(resultat.resultats[0].type).toBe('Personne')
    expect(resultat.resultats[0].champs.nom.valeur).toBe('Dupont')
  })

  it('mappe correctement le type Personne avec qualiteInfluence ELU', async () => {
    const resultat = await connecteur.rechercher('Martin')
    const entite = resultat.resultats[0]
    expect(entite.type).toBe('Personne')
    expect(entite.champs.qualiteInfluence.valeur).toBe('ELU')
    expect(entite.champs.statut.valeur).toBe('EN_ATTENTE')
  })

  it('mappe correctement le type Organisation', async () => {
    const resultat = await connecteur.rechercher('Assemblee')
    expect(resultat.resultats).toHaveLength(1)
    expect(resultat.resultats[0].type).toBe('Organisation')
  })

  it('inclut le badge de provenance avec avertissement', async () => {
    const resultat = await connecteur.rechercher('Dupont')
    const badge = resultat.resultats[0].champs.badgeProvenance.valeur
    expect(badge.avertissement).toContain("n'implique pas d'illégalité")
    expect(badge.statut).toBe('EN_ATTENTE')
  })

  it('retourne [] si aucune correspondance', async () => {
    const resultat = await connecteur.rechercher('Introuvable_999')
    expect(resultat.resultats).toHaveLength(0)
  })
})

describe('OpenSanctionsConnecteur — detailler()', () => {
  it('retourne entite null si ID inconnu', async () => {
    const connecteur = new OpenSanctionsConnecteur()
    connecteur._index = new Map()
    const resultat = await connecteur.detailler('id-inconnu')
    expect(resultat.entite).toBeNull()
  })
})
