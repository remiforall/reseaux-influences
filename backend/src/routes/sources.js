import { z } from 'zod'
import { prisma } from '../utils/prisma.js'
import { authenticate } from '../middleware/auth.js'

const sourceSchema = z.object({
  url: z.string().url(),
  titre: z.string().min(1),
  media: z.string().optional(),
  typeMedia: z.enum(['PRESSE_ECRITE', 'TELEVISION', 'RADIO', 'WEB', 'DOCUMENT_OFFICIEL']).optional(),
  langue: z.string().default('fr'),
  paysMedia: z.string().optional(),
  datePublication: z.string().optional(),
  auteur: z.string().optional(),
  description: z.string().optional(),
})

export default async function sourcesRoutes(fastify) {
  // Liste des sources (public)
  fastify.get('/', async (request) => {
    const { page = 1, limit = 20, media, type } = request.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {}
    if (media) where.media = { contains: media }
    if (type) where.typeMedia = type

    const [sources, total] = await Promise.all([
      prisma.source.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.source.count({ where }),
    ])

    return {
      data: sources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }
  })

  // Détail d'une source
  fastify.get('/:id', async (request, reply) => {
    const source = await prisma.source.findUnique({
      where: { id: request.params.id },
      include: {
        liens: {
          include: {
            personneA: { select: { id: true, nom: true, prenom: true } },
            personneB: { select: { id: true, nom: true, prenom: true } },
            typeLien: true,
          },
        },
      },
    })

    if (!source) {
      return reply.code(404).send({ error: 'Source non trouvée' })
    }

    return source
  })

  // Créer une source (auth requise)
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const result = sourceSchema.safeParse(request.body)
    if (!result.success) {
      return reply.code(400).send({ error: 'Données invalides', details: result.error.flatten() })
    }

    const data = {
      ...result.data,
      datePublication: result.data.datePublication ? new Date(result.data.datePublication) : null,
      creeParId: request.utilisateur.id,
    }

    const source = await prisma.source.create({ data })
    return reply.code(201).send(source)
  })
}
