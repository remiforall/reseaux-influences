import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../utils/prisma.js'
import { authenticate } from '../middleware/auth.js'

const inscriptionSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(8),
  nom: z.string().min(1),
  pseudo: z.string().min(3).optional(),
})

const connexionSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string(),
})

function genererToken(utilisateur) {
  return jwt.sign({ id: utilisateur.id, role: utilisateur.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

export default async function authRoutes(fastify) {
  // Inscription
  fastify.post('/inscription', async (request, reply) => {
    const result = inscriptionSchema.safeParse(request.body)
    if (!result.success) {
      return reply.code(400).send({ error: 'Données invalides', details: result.error.flatten() })
    }

    const { email, motDePasse, nom, pseudo } = result.data

    const existant = await prisma.utilisateur.findUnique({ where: { email } })
    if (existant) {
      return reply.code(409).send({ error: 'Cet email est déjà utilisé' })
    }

    if (pseudo) {
      const pseudoExistant = await prisma.utilisateur.findUnique({ where: { pseudo } })
      if (pseudoExistant) {
        return reply.code(409).send({ error: 'Ce pseudo est déjà utilisé' })
      }
    }

    const motDePasseHash = await bcrypt.hash(motDePasse, 12)

    const utilisateur = await prisma.utilisateur.create({
      data: { email, motDePasseHash, nom, pseudo },
      select: { id: true, email: true, nom: true, pseudo: true, role: true, niveau: true },
    })

    const token = genererToken(utilisateur)

    return reply.code(201).send({ utilisateur, token })
  })

  // Connexion
  fastify.post('/connexion', async (request, reply) => {
    const result = connexionSchema.safeParse(request.body)
    if (!result.success) {
      return reply.code(400).send({ error: 'Données invalides' })
    }

    const { email, motDePasse } = result.data

    const utilisateur = await prisma.utilisateur.findUnique({ where: { email } })
    if (!utilisateur || !utilisateur.estActif) {
      return reply.code(401).send({ error: 'Identifiants incorrects' })
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash)
    if (!motDePasseValide) {
      return reply.code(401).send({ error: 'Identifiants incorrects' })
    }

    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { derniereConnexion: new Date() },
    })

    const token = genererToken(utilisateur)

    return {
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        pseudo: utilisateur.pseudo,
        role: utilisateur.role,
        niveau: utilisateur.niveau,
        points: utilisateur.points,
        validationsEffectuees: utilisateur.validationsEffectuees,
      },
      token,
    }
  })

  // Profil connecté
  fastify.get('/moi', { preHandler: [authenticate] }, async (request) => {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: request.utilisateur.id },
      select: {
        id: true,
        email: true,
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
        badges: { include: { badge: true } },
      },
    })
    return utilisateur
  })
}
