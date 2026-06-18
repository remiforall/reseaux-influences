/**
 * Tests d'intégration de la route droits.js (procédure RGPD art. 15 à 21).
 *
 * Couvre :
 *   - POST /api/droits           : 201 demande valide (publique, sans auth), 400 invalide,
 *     IP tronquée transmise, accusé de réception sans fuite d'entité
 *   - GET /api/droits            : 403 sans rôle, 200 liste filtrée par statut (admin/modérateur)
 *   - PATCH /api/droits/:id       : 404 inconnue, 200 traitement (traiteParId + traiteLe sur clôture)
 */

import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals'
import Fastify from 'fastify'

// ---------------------------------------------------------------------------
// Mock Prisma
// ---------------------------------------------------------------------------

const mockCreate = jest.fn()
const mockFindMany = jest.fn()
const mockFindUnique = jest.fn()
const mockUpdate = jest.fn()

await jest.unstable_mockModule('../../src/utils/prisma.js', () => ({
  prisma: {
    demandeDroitPersonne: {
      create: mockCreate,
      findMany: mockFindMany,
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
  },
}))

// ---------------------------------------------------------------------------
// Mock auth — requireRole renvoie un préHandler qui lit un header de test
// ---------------------------------------------------------------------------

await jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
  authenticate: jest.fn(),
  optionalAuth: jest.fn(),
  requireRole: jest.fn(async (roles) => async (request, reply) => {
    const role = request.headers['x-test-role']
    if (!role) return reply.code(401).send({ error: 'Token manquant' })
    if (!roles.includes(role)) return reply.code(403).send({ error: 'Accès refusé' })
    request.utilisateur = { id: 'mod-test-id', role }
  }),
}))

// ---------------------------------------------------------------------------
// Mock audit (tronquerIp)
// ---------------------------------------------------------------------------

await jest.unstable_mockModule('../../src/connecteurs/audit.js', () => ({
  tronquerIp: jest.fn((ip) => (ip ? ip.replace(/\.\d+$/, '.0') : null)),
}))

const { default: droitsRoutes } = await import('../../src/routes/droits.js')

let fastify

beforeAll(async () => {
  fastify = Fastify({ logger: false })
  await fastify.register(droitsRoutes, { prefix: '/api/droits' })
  await fastify.ready()
})

afterAll(async () => {
  await fastify.close()
})

beforeEach(() => {
  jest.clearAllMocks()
})

const DEMANDE_VALIDE = {
  typeDroit: 'OPPOSITION',
  nomRevendique: 'Jean Dupont',
  emailContact: 'jean.dupont@example.com',
  motif: "Je m'oppose au traitement de mes données pour les motifs suivants détaillés.",
}

describe('POST /api/droits (soumission publique)', () => {
  it('crée une demande valide sans authentification (201)', async () => {
    mockCreate.mockResolvedValue({
      id: 'demande-1',
      typeDroit: 'OPPOSITION',
      statut: 'RECUE',
      createdAt: new Date('2026-06-13'),
    })

    const res = await fastify.inject({
      method: 'POST',
      url: '/api/droits',
      payload: DEMANDE_VALIDE,
    })

    expect(res.statusCode).toBe(201)
    const body = res.json()
    expect(body.demande.id).toBe('demande-1')
    expect(body.message).toMatch(/1 mois/)
    // Aucune donnée d'entité visée ne fuite dans l'accusé de réception
    expect(body.demande.entiteId).toBeUndefined()
  })

  it("transmet l'IP tronquée à la création", async () => {
    mockCreate.mockResolvedValue({
      id: 'd',
      typeDroit: 'ACCES',
      statut: 'RECUE',
      createdAt: new Date(),
    })

    await fastify.inject({
      method: 'POST',
      url: '/api/droits',
      payload: { ...DEMANDE_VALIDE, typeDroit: 'ACCES' },
    })

    expect(mockCreate).toHaveBeenCalledTimes(1)
    const data = mockCreate.mock.calls[0][0].data
    expect(data.ipAddressTronquee).toMatch(/\.0$/)
    expect(data.entiteType).toBeNull()
  })

  it('rejette un motif trop court (400)', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/droits',
      payload: { ...DEMANDE_VALIDE, motif: 'court' },
    })
    expect(res.statusCode).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejette un email invalide (400)', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/droits',
      payload: { ...DEMANDE_VALIDE, emailContact: 'pas-un-email' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('rejette un type de droit inconnu (400)', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/api/droits',
      payload: { ...DEMANDE_VALIDE, typeDroit: 'PORTABILITE' },
    })
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/droits (modérateur/admin)', () => {
  it('refuse sans rôle (401)', async () => {
    const res = await fastify.inject({ method: 'GET', url: '/api/droits' })
    expect(res.statusCode).toBe(401)
  })

  it('refuse un contributeur (403)', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/droits',
      headers: { 'x-test-role': 'CONTRIBUTEUR' },
    })
    expect(res.statusCode).toBe(403)
  })

  it('liste pour un modérateur, filtre par statut (200)', async () => {
    mockFindMany.mockResolvedValue([{ id: 'd1', statut: 'RECUE' }])
    const res = await fastify.inject({
      method: 'GET',
      url: '/api/droits?statut=RECUE',
      headers: { 'x-test-role': 'MODERATEUR' },
    })
    expect(res.statusCode).toBe(200)
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { statut: 'RECUE' } }),
    )
  })

  it('ignore un statut invalide dans le filtre', async () => {
    mockFindMany.mockResolvedValue([])
    await fastify.inject({
      method: 'GET',
      url: '/api/droits?statut=BIDON',
      headers: { 'x-test-role': 'ADMIN' },
    })
    expect(mockFindMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }))
  })
})

describe('PATCH /api/droits/:id (traitement)', () => {
  it('renvoie 404 si la demande est inconnue', async () => {
    mockFindUnique.mockResolvedValue(null)
    const res = await fastify.inject({
      method: 'PATCH',
      url: '/api/droits/inconnue',
      headers: { 'x-test-role': 'ADMIN' },
      payload: { statut: 'EN_COURS' },
    })
    expect(res.statusCode).toBe(404)
  })

  it('horodate et trace le modérateur sur une clôture (200)', async () => {
    mockFindUnique.mockResolvedValue({ id: 'd1', statut: 'RECUE', reponse: null, traiteLe: null })
    mockUpdate.mockImplementation(({ data }) => Promise.resolve({ id: 'd1', ...data }))

    const res = await fastify.inject({
      method: 'PATCH',
      url: '/api/droits/d1',
      headers: { 'x-test-role': 'MODERATEUR' },
      payload: { statut: 'ACCEPTEE', reponse: 'Données supprimées.' },
    })

    expect(res.statusCode).toBe(200)
    const data = mockUpdate.mock.calls[0][0].data
    expect(data.statut).toBe('ACCEPTEE')
    expect(data.traiteParId).toBe('mod-test-id')
    expect(data.traiteLe).toBeInstanceOf(Date)
  })

  it("n'horodate pas sur une mise en cours (statut non terminal)", async () => {
    mockFindUnique.mockResolvedValue({ id: 'd1', statut: 'RECUE', reponse: null, traiteLe: null })
    mockUpdate.mockImplementation(({ data }) => Promise.resolve({ id: 'd1', ...data }))

    await fastify.inject({
      method: 'PATCH',
      url: '/api/droits/d1',
      headers: { 'x-test-role': 'ADMIN' },
      payload: { statut: 'EN_COURS' },
    })

    const data = mockUpdate.mock.calls[0][0].data
    expect(data.traiteLe).toBeNull()
  })
})
