import { z } from 'zod'
import { prisma } from '../utils/prisma.js'
import { authenticate } from '../middleware/auth.js'

const organisationSchema = z.object({
  nom: z.string().min(1).max(255),
  sigle: z.string().max(50).optional(),
  typeOrganisation: z.enum([
    'ENTREPRISE',
    'INSTITUTION_PUBLIQUE',
    'PARTI_POLITIQUE',
    'ONG',
    'MEDIA',
    'SYNDICAT',
    'FONDATION',
    'THINK_TANK',
    'LOBBY',
    'ASSOCIATION',
    'ORGANISATION_INTERNATIONALE',
    'AUTRE',
  ]),
  pays: z.string().max(100).optional(),
  siteWeb: z.string().url().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  dateCreation: z.string().optional(),
  dateFin: z.string().optional(),
  wikipediaUrl: z.string().url().optional(),
  wikidataId: z.string().max(50).optional(),
})

export default async function organisationsRoutes(fastify) {
  // Liste des organisations validées (public)
  fastify.get('/', async (request) => {
    const { page = 1, limit = 20, search, pays, type } = request.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { statut: 'VALIDE' }
    if (search) where.nom = { contains: search }
    if (pays) where.pays = pays
    if (type) where.typeOrganisation = type

    const [organisations, total] = await Promise.all([
      prisma.organisation.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { nom: 'asc' },
      }),
      prisma.organisation.count({ where }),
    ])

    return {
      data: organisations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }
  })

  // Détail d'une organisation
  fastify.get('/:id', async (request, reply) => {
    const organisation = await prisma.organisation.findUnique({
      where: { id: request.params.id },
      include: {
        liensCommeA: {
          where: { statut: 'VALIDE' },
          include: {
            personneB: { select: { id: true, nom: true, prenom: true, rolePrincipal: true } },
            organisationB: { select: { id: true, nom: true, sigle: true, typeOrganisation: true } },
            typeLien: true,
          },
        },
        liensCommeB: {
          where: { statut: 'VALIDE' },
          include: {
            personneA: { select: { id: true, nom: true, prenom: true, rolePrincipal: true } },
            organisationA: { select: { id: true, nom: true, sigle: true, typeOrganisation: true } },
            typeLien: true,
          },
        },
      },
    })

    if (!organisation) {
      return reply.code(404).send({ error: 'Organisation non trouvée' })
    }

    return organisation
  })

  // Créer une organisation (auth requise)
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const result = organisationSchema.safeParse(request.body)
    if (!result.success) {
      return reply.code(400).send({ error: 'Données invalides', details: result.error.flatten() })
    }

    const data = {
      ...result.data,
      dateCreation: result.data.dateCreation ? new Date(result.data.dateCreation) : null,
      dateFin: result.data.dateFin ? new Date(result.data.dateFin) : null,
      creeParId: request.utilisateur.id,
    }

    const organisation = await prisma.organisation.create({ data })

    await prisma.historique.create({
      data: {
        entiteType: 'organisation',
        entiteId: organisation.id,
        action: 'creation',
        donneesApres: data,
        utilisateurId: request.utilisateur.id,
      },
    })

    return reply.code(201).send(organisation)
  })

  // Autocomplete (public)
  fastify.get('/search/autocomplete', async (request) => {
    const { q } = request.query
    if (!q || q.length < 2) return []

    return prisma.organisation.findMany({
      where: {
        OR: [{ nom: { contains: q } }, { sigle: { contains: q } }],
      },
      select: {
        id: true,
        nom: true,
        sigle: true,
        typeOrganisation: true,
        pays: true,
        logoUrl: true,
      },
      take: 10,
    })
  })

  // Types d'organisations (référentiel)
  fastify.get('/types/all', async () => {
    return [
      { code: 'ENTREPRISE', libelle: 'Entreprise' },
      { code: 'INSTITUTION_PUBLIQUE', libelle: 'Institution publique' },
      { code: 'PARTI_POLITIQUE', libelle: 'Parti politique' },
      { code: 'ONG', libelle: 'ONG' },
      { code: 'MEDIA', libelle: 'Média' },
      { code: 'SYNDICAT', libelle: 'Syndicat' },
      { code: 'FONDATION', libelle: 'Fondation' },
      { code: 'THINK_TANK', libelle: 'Think tank' },
      { code: 'LOBBY', libelle: 'Lobby' },
      { code: 'ASSOCIATION', libelle: 'Association' },
      { code: 'ORGANISATION_INTERNATIONALE', libelle: 'Organisation internationale' },
      { code: 'AUTRE', libelle: 'Autre' },
    ]
  })
}
