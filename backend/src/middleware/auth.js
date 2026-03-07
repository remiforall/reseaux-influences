import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma.js'

export async function authenticate(request, reply) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Token manquant' })
  }

  try {
    const token = authHeader.substring(7)
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        nom: true,
        pseudo: true,
        role: true,
        validationsEffectuees: true,
        points: true,
        niveau: true,
        estActif: true,
      },
    })

    if (!utilisateur || !utilisateur.estActif) {
      return reply.code(401).send({ error: 'Utilisateur invalide ou désactivé' })
    }

    request.utilisateur = utilisateur
  } catch {
    return reply.code(401).send({ error: 'Token invalide' })
  }
}

export async function optionalAuth(request) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return

  try {
    const token = authHeader.substring(7)
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, validationsEffectuees: true },
    })
    if (utilisateur?.estActif !== false) {
      request.utilisateur = utilisateur
    }
  } catch {
    // Token invalide, on continue sans auth
  }
}

export async function requireRole(roles) {
  return async function (request, reply) {
    await authenticate(request, reply)
    if (reply.sent) return
    if (!roles.includes(request.utilisateur.role)) {
      return reply.code(403).send({ error: 'Accès refusé' })
    }
  }
}
