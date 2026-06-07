/**
 * Tests du connecteur ICIJ Offshore Leaks.
 * Couvre : parser CSV, mapping nodes, filtrage FR, garde-fous éthiques, stubs index.
 */

import { describe, it, expect, jest } from '@jest/globals'

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: jest.fn(() => 'hash-icij-test'),
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

const { default: IcijOffshoreLeaksConnecteur } =
  await import('../../../src/connecteurs/sources/icij-offshore-leaks.js')

/** Nodes simulés après filtrage (structures ICIJ) */
const NODE_PERSONNE_FR = {
  node_id: '1234',
  name: 'Dupont Vincent',
  countries: 'FRA',
  _type: 'Officer',
  sourceID: 'panama-papers',
}

const NODE_ORG_OFFSHORE = {
  node_id: '5678',
  name: 'Cayman Holdings Ltd',
  countries: 'CYM',
  jurisdiction: 'CYM',
  _type: 'Entity',
  sourceID: 'pandora-papers',
}

const NODE_ORG_MONACO = {
  node_id: '9999',
  name: 'Monaco Partners SA',
  countries: 'MCO',
  jurisdiction: 'MCO',
  _type: 'Entity',
  sourceID: 'paradise-papers',
}

/**
 * Construit un connecteur avec un index pré-rempli (évite le téléchargement réel).
 */
function creerConnecteurAvecIndex(nodes) {
  const connecteur = new IcijOffshoreLeaksConnecteur()
  connecteur._indexNom = new Map()
  connecteur._indexId = new Map()
  connecteur._relations = new Map()

  for (const node of nodes) {
    const id = String(node.node_id ?? '')
    const nom = node.name ?? ''
    const cle = nom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    connecteur._indexId.set(id, node)
    if (cle && !connecteur._indexNom.has(cle)) {
      connecteur._indexNom.set(cle, node)
    }
  }

  return connecteur
}

describe('IcijOffshoreLeaksConnecteur — rechercher()', () => {
  it('retourne un tableau vide pour une query trop courte', async () => {
    const connecteur = creerConnecteurAvecIndex([NODE_PERSONNE_FR])
    const resultat = await connecteur.rechercher('x')
    expect(resultat.resultats).toHaveLength(0)
    expect(resultat.source).toBe('ICIJ Offshore Leaks')
  })

  it('trouve un node par nom normalisé', async () => {
    const connecteur = creerConnecteurAvecIndex([NODE_PERSONNE_FR, NODE_ORG_OFFSHORE])
    const resultat = await connecteur.rechercher('Dupont')
    expect(resultat.resultats).toHaveLength(1)
    expect(resultat.resultats[0].champs.nom.valeur).toBe('Dupont Vincent')
  })

  it('mappe correctement un Officer en type Personne', async () => {
    const connecteur = creerConnecteurAvecIndex([NODE_PERSONNE_FR])
    const resultat = await connecteur.rechercher('Dupont')
    expect(resultat.resultats[0].type).toBe('Personne')
  })

  it('mappe correctement une Entity en type Organisation', async () => {
    const connecteur = creerConnecteurAvecIndex([NODE_ORG_OFFSHORE])
    const resultat = await connecteur.rechercher('Cayman')
    expect(resultat.resultats[0].type).toBe('Organisation')
  })

  it('inclut le badge provenance avec avertissement éthique (ADR-013)', async () => {
    const connecteur = creerConnecteurAvecIndex([NODE_PERSONNE_FR])
    const resultat = await connecteur.rechercher('Dupont')
    const badge = resultat.resultats[0].champs.badgeProvenance.valeur
    expect(badge.source).toBe('ICIJ Offshore Leaks')
    expect(badge.avertissement).toContain("n'implique pas d'illégalité")
    expect(badge.statut).toBe('EN_ATTENTE')
  })

  it('applique le statut EN_ATTENTE par défaut sur toutes les entités (ADR-013)', async () => {
    const connecteur = creerConnecteurAvecIndex([NODE_PERSONNE_FR])
    const resultat = await connecteur.rechercher('Dupont')
    expect(resultat.resultats[0].champs.statut.valeur).toBe('EN_ATTENTE')
  })

  it('inclut un avertissement global dans la réponse', async () => {
    const connecteur = creerConnecteurAvecIndex([NODE_PERSONNE_FR])
    const resultat = await connecteur.rechercher('Dupont')
    expect(resultat.avertissement).toBeDefined()
    expect(resultat.avertissement).toContain("n'implique pas d'illégalité")
  })

  it('accepte Monaco (MCO) comme entité liée à la France (DOM/proches)', async () => {
    const connecteur = creerConnecteurAvecIndex([NODE_ORG_MONACO])
    const resultat = await connecteur.rechercher('Monaco')
    expect(resultat.resultats).toHaveLength(1)
  })

  it('retourne [] si aucune correspondance', async () => {
    const connecteur = creerConnecteurAvecIndex([NODE_PERSONNE_FR])
    const resultat = await connecteur.rechercher('introuvable_xyz')
    expect(resultat.resultats).toHaveLength(0)
  })
})

describe('IcijOffshoreLeaksConnecteur — detailler()', () => {
  it('retourne le node correct par ID', async () => {
    const connecteur = creerConnecteurAvecIndex([NODE_PERSONNE_FR])
    const resultat = await connecteur.detailler('1234')
    expect(resultat.entite).not.toBeNull()
    expect(resultat.entite.champs.nom.valeur).toBe('Dupont Vincent')
  })

  it('retourne entite null pour un ID inconnu', async () => {
    const connecteur = creerConnecteurAvecIndex([NODE_PERSONNE_FR])
    const resultat = await connecteur.detailler('id-inexistant')
    expect(resultat.entite).toBeNull()
  })
})

describe('IcijOffshoreLeaksConnecteur — _parserLigneCSV()', () => {
  it('parse une ligne CSV simple correctement', () => {
    const connecteur = new IcijOffshoreLeaksConnecteur()
    connecteur._indexNom = new Map()
    connecteur._indexId = new Map()
    connecteur._relations = new Map()
    const champs = connecteur._parserLigneCSV('1234,Dupont Vincent,FRA,Officer')
    expect(champs).toEqual(['1234', 'Dupont Vincent', 'FRA', 'Officer'])
  })

  it('gère les champs avec guillemets et virgules internes', () => {
    const connecteur = new IcijOffshoreLeaksConnecteur()
    connecteur._indexNom = new Map()
    connecteur._indexId = new Map()
    connecteur._relations = new Map()
    const champs = connecteur._parserLigneCSV('"Dupont, Vincent",FRA')
    expect(champs[0]).toBe('Dupont, Vincent')
    expect(champs[1]).toBe('FRA')
  })
})
