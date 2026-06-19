/**
 * Tests d'intégration des routes d'export.
 *
 * Couvre :
 * - 401 sur les 5 routes d'export si pas de token (durcissement sec, ADR-010/026)
 * - 200 sur les 5 routes avec un token valide (non-régression du contenu)
 * - Absence de la fausse mention "licence MIT" dans les métadonnées (renvoi CGU)
 *
 * Architecture de test : le plugin Fastify est monté via Fastify.register()
 * sans lancer le serveur complet, interrogé via fastify.inject(). Le middleware
 * auth et prisma sont mockés.
 */

import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals'
import Fastify from 'fastify'

// ---------------------------------------------------------------------------
// Mocks (AVANT l'import des modules applicatifs)
// ---------------------------------------------------------------------------

await jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
  authenticate: jest.fn(async (request, reply) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer valide')) {
      return reply.code(401).send({ error: 'Token manquant' })
    }
    request.utilisateur = { id: 'user-test-id', role: 'CONTRIBUTEUR' }
  }),
}))

const mockFindMany = jest.fn()
const mockCount = jest.fn()
await jest.unstable_mockModule('../../src/utils/prisma.js', () => ({
  prisma: { lien: { findMany: mockFindMany, count: mockCount } },
}))

// Import du plugin APRÈS les mocks
const { default: exportRoutes } = await import('../../src/routes/export.js')

// ---------------------------------------------------------------------------
// Données de test
// ---------------------------------------------------------------------------

const FAUX_LIEN = {
  id: 'lien-1',
  typeLien: { code: 'PARTI_POLITIQUE', libelle: "Membre d'un parti politique" },
  description: 'Lien de test',
  scoreConfiance: 80,
  intensite: 3,
  estBidirectionnel: false,
  dateDebut: null,
  dateFin: null,
  nbValidationsVrai: 5,
  nbValidationsFaux: 0,
  nbValidationsIndecis: 0,
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  personneA: {
    id: 'p1',
    nom: 'Dupont',
    prenom: 'Jean',
    rolePrincipal: 'Élu',
    pays: 'FR',
    wikidataId: 'Q1',
  },
  organisationA: null,
  personneB: {
    id: 'p2',
    nom: 'Martin',
    prenom: 'Marie',
    rolePrincipal: 'Dirigeant',
    pays: 'FR',
    wikidataId: null,
  },
  organisationB: null,
  source: {
    url: 'https://exemple.fr/article',
    titre: 'Article de test',
    media: 'Le Monde',
    datePublication: '2025-01-01',
  },
}

// ---------------------------------------------------------------------------
// Setup Fastify de test
// ---------------------------------------------------------------------------

let fastify

beforeAll(async () => {
  fastify = Fastify({ logger: false })
  await fastify.register(exportRoutes, { prefix: '/api/export' })
  await fastify.ready()
})

afterAll(async () => {
  await fastify.close()
})

beforeEach(() => {
  mockFindMany.mockResolvedValue([FAUX_LIEN])
  mockCount.mockResolvedValue(1)
})

const HEADERS_VALIDES = { authorization: 'Bearer valide-token' }

const ROUTES = ['/json', '/csv', '/jsonld', '/graphml', '/api-publique']

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Authentification des routes d'export", () => {
  it.each(ROUTES)('retourne 401 sans token sur %s', async (route) => {
    const rep = await fastify.inject({ method: 'GET', url: `/api/export${route}` })
    expect(rep.statusCode).toBe(401)
  })

  it.each(ROUTES)('ne touche pas la base sans token sur %s', async (route) => {
    await fastify.inject({ method: 'GET', url: `/api/export${route}` })
    expect(mockFindMany).not.toHaveBeenCalled()
  })

  it.each(ROUTES)('retourne 200 avec un token valide sur %s', async (route) => {
    const rep = await fastify.inject({
      method: 'GET',
      url: `/api/export${route}`,
      headers: HEADERS_VALIDES,
    })
    expect(rep.statusCode).toBe(200)
  })
})

describe('Contenu et licence', () => {
  it('expose les données nominatives en JSON avec un token valide', async () => {
    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/export/json',
      headers: HEADERS_VALIDES,
    })
    const body = rep.json()
    expect(body.data).toHaveLength(1)
    expect(body.meta.total).toBe(1)
  })

  it("n'annonce plus de licence MIT sur l'export JSON", async () => {
    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/export/json',
      headers: HEADERS_VALIDES,
    })
    const body = rep.json()
    expect(body.meta.licence).not.toMatch(/MIT/)
    expect(body.meta.licence).toMatch(/CGU/)
  })

  it("n'annonce plus de licence MIT sur l'API publique", async () => {
    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/export/api-publique',
      headers: HEADERS_VALIDES,
    })
    const body = rep.json()
    expect(body.meta.licence).not.toMatch(/MIT/)
    expect(body.meta.licence).toMatch(/CGU/)
  })

  it("n'annonce plus opensource.org/licenses/MIT dans le JSON-LD", async () => {
    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/export/jsonld',
      headers: HEADERS_VALIDES,
    })
    const body = rep.json()
    expect(body.license).not.toMatch(/opensource\.org\/licenses\/MIT/)
  })

  it('produit un CSV avec en-tête et une ligne de données', async () => {
    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/export/csv',
      headers: HEADERS_VALIDES,
    })
    expect(rep.headers['content-type']).toMatch(/text\/csv/)
    expect(rep.body).toMatch(/Entité A/)
    expect(rep.body).toMatch(/Dupont/)
  })

  it('produit un GraphML XML valide', async () => {
    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/export/graphml',
      headers: HEADERS_VALIDES,
    })
    expect(rep.headers['content-type']).toMatch(/application\/xml/)
    expect(rep.body).toMatch(/<graphml/)
    expect(rep.body).toMatch(/<\/graphml>/)
  })
})
