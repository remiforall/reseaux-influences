import { prisma } from '../utils/prisma.js'

export default async function utilisateursRoutes(fastify) {
  // Profil public d'un utilisateur
  fastify.get('/:id', async (request, reply) => {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: request.params.id },
      select: {
        id: true,
        nom: true,
        pseudo: true,
        bio: true,
        avatarUrl: true,
        role: true,
        points: true,
        niveau: true,
        validationsEffectuees: true,
        soumissionsEffectuees: true,
        soumissionsAcceptees: true,
        tauxPrecision: true,
        dateInscription: true,
        badges: {
          include: { badge: true },
          orderBy: { attribueLe: 'desc' },
        },
      },
    })

    if (!utilisateur) {
      return reply.code(404).send({ error: 'Utilisateur non trouvé' })
    }

    return {
      ...utilisateur,
      badgesObtenus: utilisateur.badges.map((ub) => ({
        ...ub.badge,
        attribueLe: ub.attribueLe,
      })),
      badges: undefined,
    }
  })

  // Badges d'un utilisateur
  fastify.get('/:id/badges', async (request, reply) => {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: request.params.id },
      select: { id: true },
    })

    if (!utilisateur) {
      return reply.code(404).send({ error: 'Utilisateur non trouvé' })
    }

    const badges = await prisma.utilisateurBadge.findMany({
      where: { utilisateurId: request.params.id },
      include: { badge: true },
      orderBy: { attribueLe: 'desc' },
    })

    return badges.map((ub) => ({
      ...ub.badge,
      attribueLe: ub.attribueLe,
    }))
  })

  // Classement des meilleurs contributeurs
  fastify.get('/classement/top', async (request) => {
    const { limit = 20 } = request.query

    const utilisateurs = await prisma.utilisateur.findMany({
      where: { estActif: true },
      select: {
        id: true,
        pseudo: true,
        avatarUrl: true,
        points: true,
        niveau: true,
        validationsEffectuees: true,
        soumissionsAcceptees: true,
        badges: { include: { badge: true } },
      },
      orderBy: { points: 'desc' },
      take: parseInt(limit),
    })

    return utilisateurs.map((u) => ({
      ...u,
      nbBadges: u.badges.length,
      badges: undefined,
    }))
  })
}
