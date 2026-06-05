/**
 * Tests du service enrichissement (orchestration multi-connecteurs).
 *
 * Couvre :
 * - L'appel parallèle (Promise.allSettled)
 * - La gestion de l'échec d'un connecteur sans bloquer les autres
 * - La gestion du timeout
 * - Le dédoublonnage par identifiant externe
 * - Le rapport statutParConnecteur
 * - L'intersection avec les connecteurs actifs du registry
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// ---------------------------------------------------------------------------
// Mocks : registry
// ---------------------------------------------------------------------------

const mockListerConnecteurs = jest.fn()
const mockChargerConnecteurs = jest.fn()

await jest.unstable_mockModule('../../src/connecteurs/registry.js', () => ({
  chargerConnecteurs: mockChargerConnecteurs,
  listerConnecteurs: mockListerConnecteurs,
  obtenirConnecteur: jest.fn(),
  reinitialiserRegistry: jest.fn(),
}))

const { rechercherMultiConnecteurs, reinitialiserRegistrySingleton } =
  await import('../../src/services/enrichissement.js')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Crée un connecteur mock minimal. */
function creerConnecteurMock(nom, resultats = []) {
  return {
    nom,
    rechercher: jest.fn().mockResolvedValue({ resultats }),
  }
}

/** Crée une entité normalisée minimale. */
function creerEntite(type, champs = {}, liensSuggeres = []) {
  return { type, champs, liensSuggeres }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('service rechercherMultiConnecteurs', () => {
  beforeEach(() => {
    reinitialiserRegistrySingleton()
    mockChargerConnecteurs.mockReset()
  })

  it('appelle tous les connecteurs actifs en parallèle et consolide les résultats', async () => {
    const connecteurA = creerConnecteurMock('wikidata', [
      creerEntite('Personne', {
        nom: { valeur: 'Macron', source: 'Wikidata', url: null, date: '2026-01-01' },
        wikidataId: { valeur: 'Q11008', source: 'Wikidata', url: null, date: '2026-01-01' },
      }),
    ])
    const connecteurB = creerConnecteurMock('rdap', [
      creerEntite('SiteWeb', {
        domaine: { valeur: 'elysee.fr', source: 'RDAP', url: null, date: '2026-01-01' },
      }),
    ])

    mockChargerConnecteurs.mockResolvedValue(
      new Map([
        ['wikidata', connecteurA],
        ['rdap', connecteurB],
      ]),
    )

    const { resultats, statutParConnecteur } = await rechercherMultiConnecteurs({
      query: 'Macron',
      types: ['personne'],
    })

    expect(resultats).toHaveLength(2)
    expect(statutParConnecteur.wikidata).toBe('ok')
    expect(statutParConnecteur.rdap).toBe('ok')
    expect(connecteurA.rechercher).toHaveBeenCalledTimes(1)
    expect(connecteurB.rechercher).toHaveBeenCalledTimes(1)
  })

  it('ne bloque pas si un connecteur échoue (pas de fail-fast)', async () => {
    const connecteurOk = creerConnecteurMock('wikidata', [
      creerEntite('Personne', {
        nom: { valeur: 'Macron', source: 'Wikidata', url: null, date: '2026-01-01' },
        wikidataId: { valeur: 'Q11008', source: 'Wikidata', url: null, date: '2026-01-01' },
      }),
    ])
    const connecteurKo = {
      nom: 'pappers',
      rechercher: jest.fn().mockRejectedValue(new Error('Connexion refusée')),
    }

    mockChargerConnecteurs.mockResolvedValue(
      new Map([
        ['wikidata', connecteurOk],
        ['pappers', connecteurKo],
      ]),
    )

    const { resultats, statutParConnecteur } = await rechercherMultiConnecteurs({
      query: 'TotalEnergies',
      types: ['organisation'],
    })

    // Wikidata a rendu ses résultats
    expect(resultats).toHaveLength(1)
    expect(statutParConnecteur.wikidata).toBe('ok')
    // Pappers est marqué en erreur mais n'a pas bloqué
    expect(statutParConnecteur.pappers).toBe('erreur')
  })

  it('marque un connecteur en timeout si son erreur est de type AbortError', async () => {
    const erreurTimeout = new Error('The operation was aborted')
    erreurTimeout.name = 'AbortError'

    const connecteurTimeout = {
      nom: 'rdap',
      rechercher: jest.fn().mockRejectedValue(erreurTimeout),
    }

    mockChargerConnecteurs.mockResolvedValue(new Map([['rdap', connecteurTimeout]]))

    const { statutParConnecteur } = await rechercherMultiConnecteurs({
      query: 'posthack.com',
      types: ['site'],
    })

    expect(statutParConnecteur.rdap).toBe('timeout')
  })

  it('dédoublonne par wikidataId quand deux connecteurs renvoient la même entité', async () => {
    const connecteurA = creerConnecteurMock('wikidata', [
      creerEntite('Personne', {
        nom: { valeur: 'Macron', source: 'Wikidata', url: null, date: '2026-01-01' },
        wikidataId: { valeur: 'Q11008', source: 'Wikidata', url: null, date: '2026-01-01' },
      }),
    ])
    // Deuxième connecteur retourne la même personne (même wikidataId)
    const connecteurB = creerConnecteurMock('pappers', [
      creerEntite('Personne', {
        nom: {
          valeur: 'Emmanuel Macron',
          source: 'Pappers',
          url: 'https://pappers.fr/…',
          date: '2026-01-01',
        },
        wikidataId: { valeur: 'Q11008', source: 'Pappers', url: null, date: '2026-01-01' },
      }),
    ])

    mockChargerConnecteurs.mockResolvedValue(
      new Map([
        ['wikidata', connecteurA],
        ['pappers', connecteurB],
      ]),
    )

    const { resultats } = await rechercherMultiConnecteurs({
      query: 'Macron',
      types: ['personne'],
    })

    // Un seul résultat, mais avec deux candidats pour le champ "nom"
    expect(resultats).toHaveLength(1)
    expect(resultats[0].candidatsParChamp.nom).toHaveLength(2)
    expect(resultats[0].candidatsParChamp.nom[0].source).toBe('Wikidata')
    expect(resultats[0].candidatsParChamp.nom[1].source).toBe('Pappers')
  })

  it("respecte l'intersection avec les connecteurs actifs quand une liste est fournie", async () => {
    const connecteurA = creerConnecteurMock('wikidata', [])
    const connecteurB = creerConnecteurMock('rdap', [])

    mockChargerConnecteurs.mockResolvedValue(
      new Map([
        ['wikidata', connecteurA],
        ['rdap', connecteurB],
      ]),
    )

    await rechercherMultiConnecteurs({
      query: 'test',
      types: ['personne'],
      connecteurs: ['wikidata'], // Seulement Wikidata explicitement
    })

    expect(connecteurA.rechercher).toHaveBeenCalledTimes(1)
    // rdap ne doit pas avoir été appelé
    expect(connecteurB.rechercher).not.toHaveBeenCalled()
  })

  it('retourne un tableau vide et un statutParConnecteur vide si aucun connecteur actif', async () => {
    mockChargerConnecteurs.mockResolvedValue(new Map())

    const { resultats, statutParConnecteur } = await rechercherMultiConnecteurs({
      query: 'test',
      types: ['personne'],
    })

    expect(resultats).toHaveLength(0)
    expect(Object.keys(statutParConnecteur)).toHaveLength(0)
  })
})
