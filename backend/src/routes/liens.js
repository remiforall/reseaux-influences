import { z } from 'zod'
import { prisma } from '../utils/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { peutSoumettre } from '../services/gamification.js'

const lienSchema = z.object({
  // Entité A : personne OU organisation
  personneAId: z.string().uuid().optional(),
  organisationAId: z.string().uuid().optional(),
  // Entité B : personne OU organisation
  personneBId: z.string().uuid().optional(),
  organisationBId: z.string().uuid().optional(),
  typeLienId: z.number().int().positive(),
  description: z.string().optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  estBidirectionnel: z.boolean().optional(),
  intensite: z.number().int().min(1).max(5).optional(),
  sourceId: z.string().uuid().optional(),
  // Création de source inline
  nouvelleSource: z.object({
    url: z.string().url(),
    titre: z.string().min(1),
    media: z.string().optional(),
    typeMedia: z.enum(['PRESSE_ECRITE', 'TELEVISION', 'RADIO', 'WEB', 'DOCUMENT_OFFICIEL']).optional(),
    datePublication: z.string().optional(),
    auteur: z.string().optional(),
  }).optional(),
}).refine(
  (data) => (data.personneAId || data.organisationAId) && !(data.personneAId && data.organisationAId),
  { message: 'Entité A : fournir personneAId OU organisationAId (pas les deux)' },
).refine(
  (data) => (data.personneBId || data.organisationBId) && !(data.personneBId && data.organisationBId),
  { message: 'Entité B : fournir personneBId OU organisationBId (pas les deux)' },
)

export default async function liensRoutes(fastify) {
  // Liste des liens (public)
  fastify.get('/', async (request) => {
    const { page = 1, limit = 20, statut = 'VALIDE', type, pays } = request.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { statut }
    if (type) where.typeLien = { code: type }

    const [liens, total] = await Promise.all([
      prisma.lien.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          personneA: { select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true } },
          personneB: { select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true } },
          organisationA: { select: { id: true, nom: true, sigle: true, typeOrganisation: true, pays: true } },
          organisationB: { select: { id: true, nom: true, sigle: true, typeOrganisation: true, pays: true } },
          typeLien: true,
          source: { select: { id: true, url: true, titre: true, media: true } },
          creePar: { select: { id: true, pseudo: true } },
        },
      }),
      prisma.lien.count({ where }),
    ])

    return {
      data: liens,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }
  })

  // Liens en attente de validation (public, pour la modération communautaire)
  fastify.get('/a-valider', async (request) => {
    const { page = 1, limit = 10 } = request.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Exclure les liens déjà validés par l'utilisateur connecté
    const utilisateurId = request.utilisateur?.id

    const where = { statut: 'EN_ATTENTE' }

    const [liens, total] = await Promise.all([
      prisma.lien.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'asc' },
        include: {
          personneA: { select: { id: true, nom: true, prenom: true, rolePrincipal: true } },
          personneB: { select: { id: true, nom: true, prenom: true, rolePrincipal: true } },
          organisationA: { select: { id: true, nom: true, sigle: true, typeOrganisation: true } },
          organisationB: { select: { id: true, nom: true, sigle: true, typeOrganisation: true } },
          typeLien: true,
          source: { select: { id: true, url: true, titre: true, media: true } },
          validations: utilisateurId
            ? { where: { utilisateurId }, select: { verdict: true } }
            : false,
        },
      }),
      prisma.lien.count({ where }),
    ])

    return {
      data: liens,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    }
  })

  // Détail d'un lien
  fastify.get('/:id', async (request, reply) => {
    const lien = await prisma.lien.findUnique({
      where: { id: request.params.id },
      include: {
        personneA: true,
        personneB: true,
        organisationA: true,
        organisationB: true,
        typeLien: true,
        source: true,
        creePar: { select: { id: true, pseudo: true } },
        validations: {
          include: { utilisateur: { select: { id: true, pseudo: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!lien) {
      return reply.code(404).send({ error: 'Lien non trouvé' })
    }

    return lien
  })

  // Créer un lien (auth requise + seuil de validations)
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    // Vérifier le seuil de validations
    const eligibilite = await peutSoumettre(request.utilisateur.id)
    if (!eligibilite.autorise) {
      return reply.code(403).send({
        error: `Vous devez valider au moins ${eligibilite.seuilRequis} liens avant de pouvoir soumettre.`,
        validationsEffectuees: eligibilite.validationsEffectuees,
        restantes: eligibilite.restantes,
      })
    }

    const result = lienSchema.safeParse(request.body)
    if (!result.success) {
      return reply.code(400).send({ error: 'Données invalides', details: result.error.flatten() })
    }

    const { nouvelleSource, ...lienData } = result.data

    // Vérifier que les entités A et B existent
    const entiteA = lienData.personneAId
      ? await prisma.personne.findUnique({ where: { id: lienData.personneAId } })
      : await prisma.organisation.findUnique({ where: { id: lienData.organisationAId } })
    const entiteB = lienData.personneBId
      ? await prisma.personne.findUnique({ where: { id: lienData.personneBId } })
      : await prisma.organisation.findUnique({ where: { id: lienData.organisationBId } })

    if (!entiteA || !entiteB) {
      return reply.code(404).send({ error: 'Une ou les deux entités sont introuvables' })
    }

    // Empêcher un lien vers soi-même
    const idA = lienData.personneAId || lienData.organisationAId
    const idB = lienData.personneBId || lienData.organisationBId
    if (idA === idB) {
      return reply.code(400).send({ error: 'Un lien ne peut pas relier une entité à elle-même' })
    }

    // Créer la source si nécessaire
    if (nouvelleSource && !lienData.sourceId) {
      const source = await prisma.source.create({
        data: {
          ...nouvelleSource,
          datePublication: nouvelleSource.datePublication ? new Date(nouvelleSource.datePublication) : null,
          creeParId: request.utilisateur.id,
        },
      })
      lienData.sourceId = source.id
    }

    // Créer le lien
    const data = {
      ...lienData,
      dateDebut: lienData.dateDebut ? new Date(lienData.dateDebut) : null,
      dateFin: lienData.dateFin ? new Date(lienData.dateFin) : null,
      creeParId: request.utilisateur.id,
    }

    const lien = await prisma.lien.create({
      data,
      include: {
        personneA: { select: { id: true, nom: true, prenom: true } },
        personneB: { select: { id: true, nom: true, prenom: true } },
        typeLien: true,
        source: true,
      },
    })

    // Mettre à jour le compteur de soumissions
    await prisma.utilisateur.update({
      where: { id: request.utilisateur.id },
      data: { soumissionsEffectuees: { increment: 1 } },
    })

    // Historique
    await prisma.historique.create({
      data: {
        entiteType: 'lien',
        entiteId: lien.id,
        action: 'creation',
        donneesApres: data,
        utilisateurId: request.utilisateur.id,
      },
    })

    return reply.code(201).send(lien)
  })

  // Types de liens (public, référentiel)
  fastify.get('/types/all', async () => {
    return prisma.typeLien.findMany({ orderBy: { libelle: 'asc' } })
  })
}
