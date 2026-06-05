/**
 * Tests d'intégration des routes entites.js (Passe 5 — L4).
 *
 * Couvre :
 *   - GET /api/entites/:type/:id/foncier  : 404 si entité introuvable, 200 avec transactions,
 *     200 avec raison si non géolocalisée, 403 EN_ATTENTE sans auth
 *   - GET /api/entites/:type/:id/cadastre : 404, 200 avec parcelle, 200 sans coords
 *   - GET /api/entites/:type/:id/urbanisme : 404, 200 avec zone, 200 sans coords
 *   - 400 si type invalide
 */

import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals'
import Fastify from 'fastify'

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------

const mockOrganisationFindUnique = jest.fn()
const mockPersonneFindUnique = jest.fn()

await jest.unstable_mockModule('../../src/utils/prisma.js', () => ({
  prisma: {
    organisation: { findUnique: mockOrganisationFindUnique },
    personne: { findUnique: mockPersonneFindUnique },
  },
}))

// ---------------------------------------------------------------------------
// Mock auth middleware
// ---------------------------------------------------------------------------

await jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
  authenticate: jest.fn(async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Token manquant' })
    }
    request.utilisateur = { id: 'user-test-id', role: 'CONTRIBUTEUR' }
  }),
  optionalAuth: jest.fn(async (request) => {
    const auth = request.headers.authorization
    if (auth?.startsWith('Bearer valid-token')) {
      request.utilisateur = { id: 'user-test-id', role: 'CONTRIBUTEUR' }
    }
  }),
  requireRole: jest.fn(),
}))

// ---------------------------------------------------------------------------
// Mock connecteurs IGN
// ---------------------------------------------------------------------------

const mockDvfRechercher = jest.fn()
const mockCadastreRechercher = jest.fn()
const mockGpuRechercher = jest.fn()

await jest.unstable_mockModule('../../src/connecteurs/sources/ign-dvf.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    rechercher: mockDvfRechercher,
  })),
}))

await jest.unstable_mockModule('../../src/connecteurs/sources/ign-carto-cadastre.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    rechercher: mockCadastreRechercher,
  })),
}))

await jest.unstable_mockModule('../../src/connecteurs/sources/ign-carto-gpu.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    rechercher: mockGpuRechercher,
  })),
}))

const { default: entitesRoutes } = await import('../../src/routes/entites.js')

// ---------------------------------------------------------------------------
// Setup Fastify de test
// ---------------------------------------------------------------------------

let fastify

beforeAll(async () => {
  fastify = Fastify({ logger: false })
  await fastify.register(entitesRoutes, { prefix: '/api/entites' })
  await fastify.ready()
})

afterAll(async () => {
  await fastify.close()
})

beforeEach(() => {
  jest.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Données de test
// ---------------------------------------------------------------------------

const ORGA_GEOLOCALISEE = {
  id: 'orga-geo-id',
  statut: 'VALIDE',
  siegeLat: 48.8566,
  siegeLon: 2.3522,
  siegeCodeInsee: '75056',
  adresseSiege: '1 rue de la Paix 75001 Paris',
}

const ORGA_SANS_GEO = {
  id: 'orga-nogeo-id',
  statut: 'VALIDE',
  siegeLat: null,
  siegeLon: null,
  siegeCodeInsee: null,
  adresseSiege: null,
}

const ORGA_EN_ATTENTE = {
  id: 'orga-attente-id',
  statut: 'EN_ATTENTE',
  siegeLat: 48.8566,
  siegeLon: 2.3522,
  siegeCodeInsee: '75056',
  adresseSiege: '10 rue Test 75001 Paris',
}

const TRANSACTION_DVF = {
  champs: {
    dateMutation: { valeur: '2024-06-15', source: 'DVF' },
    valeurFonciere: { valeur: 350000, source: 'DVF' },
    surface: { valeur: 65, source: 'DVF' },
    typeLocal: { valeur: 'Appartement', source: 'DVF' },
    adresse: { valeur: '12 rue Test 75001 Paris', source: 'DVF' },
    parcelles: { valeur: ['75056000A0123'], source: 'DVF' },
  },
}

const PARCELLE = {
  champs: {
    idu: { valeur: '75056000A0123', source: 'IGN Cadastre' },
    codeInsee: { valeur: '75056', source: 'IGN Cadastre' },
    section: { valeur: 'A', source: 'IGN Cadastre' },
    numero: { valeur: '0123', source: 'IGN Cadastre' },
    contenance: { valeur: 450, source: 'IGN Cadastre' },
    geometrie: { valeur: null, source: 'IGN Cadastre' },
  },
}

const ZONE_PLU = {
  champs: {
    libelle: { valeur: 'Zone urbaine centrale', source: 'IGN GPU' },
    typezone: { valeur: 'U', source: 'IGN GPU' },
    destinations: { valeur: 'Habitation, Commerce', source: 'IGN GPU' },
  },
}

// ---------------------------------------------------------------------------
// Tests — type invalide
// ---------------------------------------------------------------------------

describe('GET /api/entites/:type/:id/foncier — validation du type', () => {
  it('retourne 400 si le type est invalide', async () => {
    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/parcelle/test-id/foncier',
    })
    expect(reponse.statusCode).toBe(400)
    const corps = JSON.parse(reponse.payload)
    expect(corps.error).toMatch(/type/i)
  })
})

// ---------------------------------------------------------------------------
// Tests — GET /foncier
// ---------------------------------------------------------------------------

describe('GET /api/entites/:type/:id/foncier', () => {
  it("retourne 404 si l'organisation est introuvable", async () => {
    mockOrganisationFindUnique.mockResolvedValue(null)
    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/id-inexistant/foncier',
    })
    expect(reponse.statusCode).toBe(404)
  })

  it('retourne les transactions DVF pour une organisation géolocalisée', async () => {
    mockOrganisationFindUnique.mockResolvedValue(ORGA_GEOLOCALISEE)
    mockDvfRechercher.mockResolvedValue({
      resultats: [TRANSACTION_DVF],
      source: 'DVF',
      dateRecuperation: new Date().toISOString(),
    })

    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/orga-geo-id/foncier',
    })

    expect(reponse.statusCode).toBe(200)
    const corps = JSON.parse(reponse.payload)
    expect(corps.codeInsee).toBe('75056')
    expect(corps.statsZone).toBeDefined()
    expect(corps.statsZone.nbTransactions).toBeGreaterThanOrEqual(1)
  })

  it("retourne un tableau vide avec raison si l'organisation n'est pas géolocalisée", async () => {
    mockOrganisationFindUnique.mockResolvedValue(ORGA_SANS_GEO)

    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/orga-nogeo-id/foncier',
    })

    expect(reponse.statusCode).toBe(200)
    const corps = JSON.parse(reponse.payload)
    expect(corps.transactions).toEqual([])
    expect(corps.statsZone).toBeNull()
    expect(corps.raison).toBeDefined()
  })

  it('retourne 403 pour une entité EN_ATTENTE sans authentification', async () => {
    mockOrganisationFindUnique.mockResolvedValue(ORGA_EN_ATTENTE)

    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/orga-attente-id/foncier',
    })

    expect(reponse.statusCode).toBe(403)
  })

  it('accepte les entités EN_ATTENTE pour un utilisateur authentifié', async () => {
    mockOrganisationFindUnique.mockResolvedValue(ORGA_EN_ATTENTE)
    mockDvfRechercher.mockResolvedValue({ resultats: [], source: 'DVF', dateRecuperation: '' })

    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/orga-attente-id/foncier',
      headers: { Authorization: 'Bearer valid-token' },
    })

    expect(reponse.statusCode).toBe(200)
  })

  it('retourne 200 avec transactions vides si le connecteur DVF échoue', async () => {
    mockOrganisationFindUnique.mockResolvedValue(ORGA_GEOLOCALISEE)
    mockDvfRechercher.mockRejectedValue(new Error('API DVF indisponible'))

    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/orga-geo-id/foncier',
    })

    expect(reponse.statusCode).toBe(200)
    const corps = JSON.parse(reponse.payload)
    expect(corps.transactions).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Tests — GET /cadastre
// ---------------------------------------------------------------------------

describe('GET /api/entites/:type/:id/cadastre', () => {
  it("retourne 404 si l'organisation est introuvable", async () => {
    mockOrganisationFindUnique.mockResolvedValue(null)
    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/id-inexistant/cadastre',
    })
    expect(reponse.statusCode).toBe(404)
  })

  it('retourne la parcelle cadastrale pour une organisation géolocalisée', async () => {
    mockOrganisationFindUnique.mockResolvedValue(ORGA_GEOLOCALISEE)
    mockCadastreRechercher.mockResolvedValue({
      resultats: [PARCELLE],
      source: 'IGN Cadastre',
      dateRecuperation: new Date().toISOString(),
    })

    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/orga-geo-id/cadastre',
    })

    expect(reponse.statusCode).toBe(200)
    const corps = JSON.parse(reponse.payload)
    expect(corps.parcelle).toBeDefined()
    expect(corps.parcelle).not.toBeNull()
    expect(corps.codeInsee).toBe('75056')
  })

  it("retourne parcelle null si l'organisation n'a pas de code INSEE", async () => {
    mockOrganisationFindUnique.mockResolvedValue(ORGA_SANS_GEO)

    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/orga-nogeo-id/cadastre',
    })

    expect(reponse.statusCode).toBe(200)
    const corps = JSON.parse(reponse.payload)
    expect(corps.parcelle).toBeNull()
    expect(corps.raison).toBeDefined()
  })

  it('retourne 200 avec parcelle null si le connecteur cadastre échoue', async () => {
    mockOrganisationFindUnique.mockResolvedValue(ORGA_GEOLOCALISEE)
    mockCadastreRechercher.mockRejectedValue(new Error('API Cadastre indisponible'))

    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/orga-geo-id/cadastre',
    })

    expect(reponse.statusCode).toBe(200)
    const corps = JSON.parse(reponse.payload)
    expect(corps.parcelle).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Tests — GET /urbanisme
// ---------------------------------------------------------------------------

describe('GET /api/entites/:type/:id/urbanisme', () => {
  it("retourne 404 si l'organisation est introuvable", async () => {
    mockOrganisationFindUnique.mockResolvedValue(null)
    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/id-inexistant/urbanisme',
    })
    expect(reponse.statusCode).toBe(404)
  })

  it('retourne la zone PLU pour une organisation géolocalisée', async () => {
    mockOrganisationFindUnique.mockResolvedValue(ORGA_GEOLOCALISEE)
    mockGpuRechercher.mockResolvedValue({
      resultats: [ZONE_PLU],
      source: 'IGN GPU',
      dateRecuperation: new Date().toISOString(),
    })

    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/orga-geo-id/urbanisme',
    })

    expect(reponse.statusCode).toBe(200)
    const corps = JSON.parse(reponse.payload)
    expect(corps.zone).toBeDefined()
    expect(corps.zone).not.toBeNull()
    expect(corps.coordonnees.lat).toBe(48.8566)
    expect(corps.coordonnees.lon).toBe(2.3522)
  })

  it("retourne zone null si l'organisation n'a pas de coordonnées", async () => {
    mockOrganisationFindUnique.mockResolvedValue(ORGA_SANS_GEO)

    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/orga-nogeo-id/urbanisme',
    })

    expect(reponse.statusCode).toBe(200)
    const corps = JSON.parse(reponse.payload)
    expect(corps.zone).toBeNull()
    expect(corps.raison).toBeDefined()
  })

  it('retourne 200 avec zone null si le connecteur GPU échoue', async () => {
    mockOrganisationFindUnique.mockResolvedValue(ORGA_GEOLOCALISEE)
    mockGpuRechercher.mockRejectedValue(new Error('API GPU indisponible'))

    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/organisation/orga-geo-id/urbanisme',
    })

    expect(reponse.statusCode).toBe(200)
    const corps = JSON.parse(reponse.payload)
    expect(corps.zone).toBeNull()
  })

  it('supporte le type personne avec lieuNaissanceLat/Lon', async () => {
    mockPersonneFindUnique.mockResolvedValue({
      id: 'personne-geo-id',
      statut: 'VALIDE',
      lieuNaissanceLat: 43.2965,
      lieuNaissanceLon: 5.3698,
      lieuNaissanceCodeInsee: '13055',
      lieuNaissance: 'Marseille',
    })
    mockGpuRechercher.mockResolvedValue({
      resultats: [ZONE_PLU],
      source: 'IGN GPU',
      dateRecuperation: new Date().toISOString(),
    })

    const reponse = await fastify.inject({
      method: 'GET',
      url: '/api/entites/personne/personne-geo-id/urbanisme',
    })

    expect(reponse.statusCode).toBe(200)
    const corps = JSON.parse(reponse.payload)
    expect(corps.zone).not.toBeNull()
    expect(corps.coordonnees.lat).toBe(43.2965)
  })
})
