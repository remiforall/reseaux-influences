import { z } from 'zod'
import { prisma } from '../utils/prisma.js'
import { authenticate, optionalAuth } from '../middleware/auth.js'

const personneSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().optional(),
  pays: z.string().optional(),
  nationalite: z.string().optional(),
  dateNaissance: z.string().optional(),
  rolePrincipal: z.string().optional(),
  rolesSecondaires: z.array(z.string()).optional(),
  bio: z.string().optional(),
  photoUrl: z.string().url().optional(),
  wikipediaUrl: z.string().url().optional(),
  wikidataId: z.string().optional(),
})

export default async function personnesRoutes(fastify) {
  // Liste des personnes (public)
  fastify.get('/', async (request) => {
    const { page = 1, limit = 20, search, pays, role } = request.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { statut: 'VALIDE' }
    if (search) {
      where.OR = [
        { nom: { contains: search } },
        { prenom: { contains: search } },
      ]
    }
    if (pays) where.pays = pays
    if (role) where.rolePrincipal = { contains: role }

    const [personnes, total] = await Promise.all([
      prisma.personne.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { nom: 'asc' },
        include: {
          _count: { select: { liensCommeA: true, liensCommeB: true } },
        },
      }),
      prisma.personne.count({ where }),
    ])

    return {
      data: personnes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }
  })

  // Détail d'une personne (public)
  fastify.get('/:id', async (request, reply) => {
    const personne = await prisma.personne.findUnique({
      where: { id: request.params.id },
      include: {
        liensCommeA: {
          where: { statut: 'VALIDE' },
          include: { personneB: true, typeLien: true, source: true },
        },
        liensCommeB: {
          where: { statut: 'VALIDE' },
          include: { personneA: true, typeLien: true, source: true },
        },
        creePar: { select: { id: true, pseudo: true } },
      },
    })

    if (!personne) {
      return reply.code(404).send({ error: 'Personne non trouvée' })
    }

    return personne
  })

  // Créer une personne (auth requise)
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const result = personneSchema.safeParse(request.body)
    if (!result.success) {
      return reply.code(400).send({ error: 'Données invalides', details: result.error.flatten() })
    }

    const data = { ...result.data, creeParId: request.utilisateur.id }
    if (data.dateNaissance) {
      data.dateNaissance = new Date(data.dateNaissance)
    }

    const personne = await prisma.personne.create({ data })

    // Historique
    await prisma.historique.create({
      data: {
        entiteType: 'personne',
        entiteId: personne.id,
        action: 'creation',
        donneesApres: data,
        utilisateurId: request.utilisateur.id,
      },
    })

    return reply.code(201).send(personne)
  })

  // Recherche auto-complétion (public)
  fastify.get('/search/autocomplete', async (request) => {
    const { q } = request.query
    if (!q || q.length < 2) return []

    const personnes = await prisma.personne.findMany({
      where: {
        OR: [
          { nom: { contains: q } },
          { prenom: { contains: q } },
        ],
      },
      select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true },
      take: 10,
    })

    return personnes
  })
}
