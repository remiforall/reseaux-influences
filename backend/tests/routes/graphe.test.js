/**
 * Tests d'intégration des routes graphe.
 *
 * Couvre :
 * - 404 si l'entité racine n'existe pas
 * - Ego-network 2 sauts (niveauSaut 0 / 1)
 * - Hydratation des 3 types d'entités (Personne, Organisation, SiteWeb)
 * - Double format de sortie (noeuds/aretes ET nodes/links)
 * - P-C3 : les arêtes contiennent sourceId/cibleId et non source/target
 * - M-02 : anonyme ne peut pas obtenir des entités EN_ATTENTE via /ego
 * - M-02 : utilisateur authentifié peut obtenir des entités EN_ATTENTE
 */

import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals'
import Fastify from 'fastify'

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------

const mockPersonneFindUnique = jest.fn()
const mockOrganisationFindUnique = jest.fn()
const mockSiteWebFindUnique = jest.fn()
const mockLienFindMany = jest.fn()

await jest.unstable_mockModule('../../src/utils/prisma.js', () => ({
  prisma: {
    personne: { findUnique: mockPersonneFindUnique },
    organisation: { findUnique: mockOrganisationFindUnique },
    siteWeb: { findUnique: mockSiteWebFindUnique },
    lien: { findMany: mockLienFindMany },
    utilisateur: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'user-auth-id',
        role: 'CONTRIBUTEUR',
        validationsEffectuees: 10,
        estActif: true,
      }),
    },
  },
}))

// Mock du middleware auth pour contrôler optionalAuth dans les tests
// optionalAuth : sans token → request.utilisateur absent
// optionalAuth : avec header Authorization 'Bearer valid-token' → hydrate request.utilisateur
await jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
  authenticate: jest.fn(async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Token manquant' })
    }
    request.utilisateur = { id: 'user-auth-id', role: 'CONTRIBUTEUR' }
  }),
  optionalAuth: jest.fn(async (request) => {
    const auth = request.headers.authorization
    if (auth?.startsWith('Bearer valid-token')) {
      request.utilisateur = { id: 'user-auth-id', role: 'CONTRIBUTEUR' }
    }
    // Sans token valide : request.utilisateur reste undefined (anonyme)
  }),
  requireRole: jest.fn(),
}))

const { default: grapheRoutes } = await import('../../src/routes/graphe.js')

// ---------------------------------------------------------------------------
// Setup Fastify de test
// ---------------------------------------------------------------------------

let fastify

beforeAll(async () => {
  fastify = Fastify({ logger: false })
  await fastify.register(grapheRoutes, { prefix: '/api/graphe' })
  await fastify.ready()
})

afterAll(async () => {
  await fastify.close()
})

// ---------------------------------------------------------------------------
// Données de test
// ---------------------------------------------------------------------------

const PERSONNE_RACINE = {
  id: 'personne-racine-id',
  nom: 'Dupont',
  prenom: 'Jean',
  rolePrincipal: 'Député',
  pays: 'France',
  photoUrl: null,
}
const ORGANISATION_VOISINE = {
  id: 'org-voisine-id',
  nom: 'Assemblée nationale',
  sigle: 'AN',
  typeOrganisation: 'INSTITUTION_PUBLIQUE',
  pays: 'France',
  logoUrl: null,
}

function creerLienMock(id, entiteA, entiteB, typeLienCode = 'MANDAT_ELECTIF', statut = 'VALIDE') {
  return {
    id,
    personneAId: entiteA.type === 'personne' ? entiteA.id : null,
    organisationAId: entiteA.type === 'organisation' ? entiteA.id : null,
    siteWebAId: entiteA.type === 'site_web' ? entiteA.id : null,
    personneBId: entiteB.type === 'personne' ? entiteB.id : null,
    organisationBId: entiteB.type === 'organisation' ? entiteB.id : null,
    siteWebBId: entiteB.type === 'site_web' ? entiteB.id : null,
    personneA:
      entiteA.type === 'personne'
        ? {
            id: entiteA.id,
            nom: entiteA.nom,
            prenom: entiteA.prenom ?? null,
            rolePrincipal: null,
            pays: null,
            photoUrl: null,
          }
        : null,
    organisationA:
      entiteA.type === 'organisation'
        ? {
            id: entiteA.id,
            nom: entiteA.nom,
            sigle: null,
            typeOrganisation: 'AUTRE',
            pays: null,
            logoUrl: null,
          }
        : null,
    siteWebA:
      entiteA.type === 'site_web'
        ? { id: entiteA.id, domaine: entiteA.domaine, hebergeurProbable: null }
        : null,
    personneB:
      entiteB.type === 'personne'
        ? {
            id: entiteB.id,
            nom: entiteB.nom,
            prenom: entiteB.prenom ?? null,
            rolePrincipal: null,
            pays: null,
            photoUrl: null,
          }
        : null,
    organisationB:
      entiteB.type === 'organisation'
        ? {
            id: entiteB.id,
            nom: entiteB.nom,
            sigle: null,
            typeOrganisation: 'AUTRE',
            pays: null,
            logoUrl: null,
          }
        : null,
    siteWebB:
      entiteB.type === 'site_web'
        ? { id: entiteB.id, domaine: entiteB.domaine, hebergeurProbable: null }
        : null,
    typeLien: { code: typeLienCode, libelle: typeLienCode, couleur: '#2563eb' },
    statut,
    intensite: 1,
    scoreConfiance: 80,
    source: null,
  }
}

// ---------------------------------------------------------------------------
// Tests — 404
// ---------------------------------------------------------------------------

describe('GET /api/graphe/ego/:entiteId — 404 si entité inconnue', () => {
  it("retourne 404 si l'entité racine n'existe pas", async () => {
    mockPersonneFindUnique.mockResolvedValue(null)
    mockOrganisationFindUnique.mockResolvedValue(null)
    mockSiteWebFindUnique.mockResolvedValue(null)

    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/graphe/ego/entite-inexistante',
    })

    expect(rep.statusCode).toBe(404)
    expect(rep.json().error).toBe('Entité racine non trouvée')
  })
})

// ---------------------------------------------------------------------------
// Tests — Ego-network 2 sauts
// ---------------------------------------------------------------------------

describe('GET /api/graphe/ego/:entiteId — ego-network 2 sauts (Personne)', () => {
  beforeAll(() => {
    mockPersonneFindUnique.mockImplementation(({ where }) => {
      if (where.id === 'personne-racine-id') return Promise.resolve({ id: 'personne-racine-id' })
      return Promise.resolve(null)
    })
    mockOrganisationFindUnique.mockResolvedValue(null)
    mockSiteWebFindUnique.mockResolvedValue(null)

    const lienP_O = creerLienMock(
      'lien-1',
      { type: 'personne', id: 'personne-racine-id', nom: 'Dupont', prenom: 'Jean' },
      { type: 'organisation', id: 'org-voisine-id', nom: 'Assemblée nationale' },
    )

    mockLienFindMany.mockImplementation(({ where }) => {
      const or = where?.OR ?? []
      if (
        or.some(
          (c) => c.personneAId === 'personne-racine-id' || c.personneBId === 'personne-racine-id',
        )
      ) {
        return Promise.resolve([lienP_O])
      }
      return Promise.resolve([])
    })
  })

  it('construit un ego-network avec les niveaux de saut', async () => {
    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/graphe/ego/personne-racine-id?profondeur=2',
    })

    expect(rep.statusCode).toBe(200)
    const body = rep.json()

    // Double format
    expect(Array.isArray(body.noeuds)).toBe(true)
    expect(Array.isArray(body.nodes)).toBe(true)
    expect(Array.isArray(body.aretes)).toBe(true)
    expect(Array.isArray(body.links)).toBe(true)

    // noeuds et nodes sont identiques
    expect(body.noeuds).toHaveLength(body.nodes.length)

    // Le centre doit avoir niveauSaut = 0
    const centre = body.noeuds.find((n) => n.id === 'personne-racine-id')
    expect(centre).toBeDefined()
    expect(centre.niveauSaut).toBe(0)
    expect(centre.estCentre).toBe(true)

    // L'organisation voisine doit avoir niveauSaut = 1
    const voisin = body.noeuds.find((n) => n.id === 'org-voisine-id')
    expect(voisin).toBeDefined()
    expect(voisin.niveauSaut).toBe(1)
  })

  it('inclut les champs centre et stats', async () => {
    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/graphe/ego/personne-racine-id',
    })

    const body = rep.json()
    expect(body.centre).toBe('personne-racine-id')
    expect(typeof body.stats.nbNoeuds).toBe('number')
    expect(typeof body.stats.nbAretes).toBe('number')
  })
})

// ---------------------------------------------------------------------------
// Tests — Hydratation SiteWeb
// ---------------------------------------------------------------------------

describe('GET /api/graphe/ego/:entiteId — hydratation SiteWeb', () => {
  it('inclut un noeud de type site_web dans le résultat', async () => {
    mockPersonneFindUnique.mockImplementation(({ where }) => {
      if (where.id === 'personne-racine-id') return Promise.resolve({ id: 'personne-racine-id' })
      return Promise.resolve(null)
    })
    mockOrganisationFindUnique.mockResolvedValue(null)
    mockSiteWebFindUnique.mockResolvedValue(null)

    const lienP_SW = creerLienMock(
      'lien-site',
      { type: 'personne', id: 'personne-racine-id', nom: 'Dupont', prenom: 'Jean' },
      { type: 'site_web', id: 'siteweb-id', domaine: 'assemblee-nationale.fr' },
      'EDITEUR_DU_SITE',
    )

    mockLienFindMany.mockImplementation(({ where }) => {
      const or = where?.OR ?? []
      if (
        or.some(
          (c) => c.personneAId === 'personne-racine-id' || c.personneBId === 'personne-racine-id',
        )
      ) {
        return Promise.resolve([lienP_SW])
      }
      return Promise.resolve([])
    })

    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/graphe/ego/personne-racine-id',
    })

    expect(rep.statusCode).toBe(200)
    const body = rep.json()

    const siteWebNoeud = body.noeuds.find((n) => n.type === 'site_web')
    expect(siteWebNoeud).toBeDefined()
    expect(siteWebNoeud.domaine).toBe('assemblee-nationale.fr')
  })
})

// ---------------------------------------------------------------------------
// Tests — Profondeur max 3
// ---------------------------------------------------------------------------

describe('GET /api/graphe/ego/:entiteId — profondeur max 3', () => {
  it('limite la profondeur à 3 même si une valeur supérieure est passée', async () => {
    mockPersonneFindUnique.mockResolvedValue({ id: 'personne-racine-id' })
    mockOrganisationFindUnique.mockResolvedValue(null)
    mockSiteWebFindUnique.mockResolvedValue(null)
    mockLienFindMany.mockResolvedValue([])

    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/graphe/ego/personne-racine-id?profondeur=10',
    })

    expect(rep.statusCode).toBe(200)
    const body = rep.json()
    expect(body.profondeur).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// Tests — P-C3 : contrat API arêtes (sourceId/cibleId et non source/target)
// ---------------------------------------------------------------------------

describe('GET /api/graphe/ego/:entiteId — P-C3 : contrat API arêtes sourceId/cibleId', () => {
  it('les arêtes contiennent sourceId et cibleId (pas source/target)', async () => {
    mockPersonneFindUnique.mockImplementation(({ where }) => {
      if (where.id === 'personne-racine-id') return Promise.resolve({ id: 'personne-racine-id' })
      return Promise.resolve(null)
    })
    mockOrganisationFindUnique.mockResolvedValue(null)
    mockSiteWebFindUnique.mockResolvedValue(null)

    const lienP_O = creerLienMock(
      'lien-contrat',
      { type: 'personne', id: 'personne-racine-id', nom: 'Dupont', prenom: 'Jean' },
      { type: 'organisation', id: 'org-voisine-id', nom: 'Assemblée nationale' },
    )

    mockLienFindMany.mockImplementation(({ where }) => {
      const or = where?.OR ?? []
      if (
        or.some(
          (c) => c.personneAId === 'personne-racine-id' || c.personneBId === 'personne-racine-id',
        )
      ) {
        return Promise.resolve([lienP_O])
      }
      return Promise.resolve([])
    })

    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/graphe/ego/personne-racine-id',
    })

    expect(rep.statusCode).toBe(200)
    const body = rep.json()
    expect(body.aretes.length).toBeGreaterThan(0)

    const arete = body.aretes[0]
    // P-C3 : les arêtes doivent avoir sourceId/cibleId
    expect(arete).toHaveProperty('sourceId')
    expect(arete).toHaveProperty('cibleId')
    // et NE PAS avoir source/target
    expect(arete).not.toHaveProperty('source')
    expect(arete).not.toHaveProperty('target')

    expect(arete.sourceId).toBe('personne-racine-id')
    expect(arete.cibleId).toBe('org-voisine-id')
  })
})

// ---------------------------------------------------------------------------
// Tests — M-02 : filtrage statut pour anonymes
// ---------------------------------------------------------------------------

describe('GET /api/graphe/ego/:entiteId — M-02 : filtrage statut anonyme vs authentifié', () => {
  beforeEach(() => {
    mockPersonneFindUnique.mockImplementation(({ where }) => {
      if (where.id === 'personne-racine-id') return Promise.resolve({ id: 'personne-racine-id' })
      return Promise.resolve(null)
    })
    mockOrganisationFindUnique.mockResolvedValue(null)
    mockSiteWebFindUnique.mockResolvedValue(null)
  })

  it('un anonyme ne peut pas forcer statut=EN_ATTENTE — le filtre est restreint à VALIDE', async () => {
    let whereCapture
    mockLienFindMany.mockImplementation(({ where }) => {
      whereCapture = where
      return Promise.resolve([])
    })

    const rep = await fastify.inject({
      method: 'GET',
      // Tenter de forcer EN_ATTENTE sans authentification
      url: '/api/graphe/ego/personne-racine-id?statut=EN_ATTENTE',
    })

    expect(rep.statusCode).toBe(200)

    // Le filtre effectif en base doit contenir uniquement 'VALIDE'
    expect(whereCapture.statut.in).not.toContain('EN_ATTENTE')
    expect(whereCapture.statut.in).toContain('VALIDE')
  })

  it('un anonyme sans paramètre statut obtient uniquement les entités VALIDE', async () => {
    let whereCapture
    mockLienFindMany.mockImplementation(({ where }) => {
      whereCapture = where
      return Promise.resolve([])
    })

    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/graphe/ego/personne-racine-id',
      // Pas de header Authorization → anonyme
    })

    expect(rep.statusCode).toBe(200)
    expect(whereCapture.statut.in).toEqual(['VALIDE'])
  })

  it('un utilisateur authentifié peut accéder aux entités EN_ATTENTE', async () => {
    let whereCapture
    mockLienFindMany.mockImplementation(({ where }) => {
      whereCapture = where
      return Promise.resolve([])
    })

    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/graphe/ego/personne-racine-id?statut=VALIDE,EN_ATTENTE',
      headers: {
        Authorization: 'Bearer valid-token',
      },
    })

    expect(rep.statusCode).toBe(200)
    // L'utilisateur authentifié peut voir EN_ATTENTE
    expect(whereCapture.statut.in).toContain('EN_ATTENTE')
    expect(whereCapture.statut.in).toContain('VALIDE')
  })
})
