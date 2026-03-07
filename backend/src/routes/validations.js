import { z } from 'zod'
import { prisma } from '../utils/prisma.js'
import { authenticate } from '../middleware/auth.js'
import { traiterValidation } from '../services/gamification.js'

const validationSchema = z.object({
  lienId: z.string().uuid(),
  verdict: z.enum(['VRAI', 'FAUX', 'INDECIS']),
  commentaire: z.string().optional(),
  sourceSupplementaire: z.string().url().optional(),
})

export default async function validationsRoutes(fastify) {
  // Soumettre une validation (auth requise)
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const result = validationSchema.safeParse(request.body)
    if (!result.success) {
      return reply.code(400).send({ error: 'Données invalides', details: result.error.flatten() })
    }

    const { lienId, verdict, commentaire, sourceSupplementaire } = result.data
    const utilisateurId = request.utilisateur.id

    // Vérifier que le lien existe et est en attente
    const lien = await prisma.lien.findUnique({ where: { id: lienId } })
    if (!lien) {
      return reply.code(404).send({ error: 'Lien non trouvé' })
    }
    if (lien.statut !== 'EN_ATTENTE') {
      return reply.code(400).send({ error: 'Ce lien a déjà été validé ou rejeté' })
    }

    // Empêcher de valider son propre lien
    if (lien.creeParId === utilisateurId) {
      return reply.code(403).send({ error: 'Vous ne pouvez pas valider votre propre soumission' })
    }

    // Vérifier que l'utilisateur n'a pas déjà validé ce lien
    const existante = await prisma.validation.findUnique({
      where: { utilisateurId_lienId: { utilisateurId, lienId } },
    })
    if (existante) {
      return reply.code(409).send({ error: 'Vous avez déjà validé ce lien' })
    }

    // Créer la validation
    const validation = await prisma.validation.create({
      data: { utilisateurId, lienId, verdict, commentaire, sourceSupplementaire },
    })

    // Traiter la gamification (compteurs, consensus, badges)
    await traiterValidation(utilisateurId, lienId, verdict)

    // Historique
    await prisma.historique.create({
      data: {
        entiteType: 'validation',
        entiteId: validation.id,
        action: 'validation',
        donneesApres: { verdict, commentaire },
        utilisateurId,
      },
    })

    // Récupérer l'état mis à jour de l'utilisateur
    const utilisateurMaj = await prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: {
        validationsEffectuees: true,
        points: true,
        niveau: true,
      },
    })

    return reply.code(201).send({
      validation,
      utilisateur: utilisateurMaj,
    })
  })

  // Statut de soumission (combien de validations restantes)
  fastify.get('/statut-soumission', { preHandler: [authenticate] }, async (request) => {
    const config = await prisma.configGamification.findUnique({
      where: { cle: 'seuil_validations_pour_soumettre' },
    })
    const seuil = parseInt(config?.valeur || '5', 10)
    const effectuees = request.utilisateur.validationsEffectuees

    return {
      autorise: effectuees >= seuil,
      validationsEffectuees: effectuees,
      seuilRequis: seuil,
      restantes: Math.max(0, seuil - effectuees),
    }
  })
}
