import { z } from 'zod'
import { prisma } from '../utils/prisma.js'
import { requireRole } from '../middleware/auth.js'
import { tronquerIp } from '../connecteurs/audit.js'

/**
 * Procédure « droits des personnes concernées » (RGPD art. 15 à 21).
 *
 * Prérequis de levée de l'alpha fermée (ADR-010 → ADR-011) : toute personne
 * physique désignée par une entité doit pouvoir demander accès, rectification,
 * effacement, limitation ou opposition — SANS détenir de compte contributeur.
 *
 * La soumission est donc publique (pas d'`authenticate`), mais rate-limitée
 * plus strictement que le reste de l'API pour limiter l'abus. La consultation
 * et le traitement sont réservés aux modérateurs/admins.
 *
 * Minimisation (art. 5.1.c) : on ne stocke jamais la pièce d'identité (vérifiée
 * hors-bande, par échange email), seulement un nom revendiqué + un email de
 * contact. L'IP est tronquée (dernier octet retiré) avant stockage.
 */

const TYPES_DROIT = ['ACCES', 'RECTIFICATION', 'EFFACEMENT', 'LIMITATION', 'OPPOSITION']
const STATUTS = ['RECUE', 'EN_COURS', 'ACCEPTEE', 'REFUSEE', 'CLOTUREE']

const demandeSchema = z.object({
  typeDroit: z.enum(TYPES_DROIT),
  entiteType: z.enum(['Personne', 'Organisation', 'SiteWeb']).optional(),
  entiteId: z.string().uuid().optional(),
  nomRevendique: z.string().trim().min(2).max(255),
  emailContact: z.string().email().max(255),
  motif: z.string().trim().min(10).max(5000),
})

const traitementSchema = z.object({
  statut: z.enum(STATUTS),
  reponse: z.string().trim().max(10000).optional(),
})

export default async function droitsRoutes(fastify) {
  const adminOuModerateur = await requireRole(['ADMIN', 'MODERATEUR'])

  // --- Soumission publique d'une demande (art. 15 à 21) -------------------
  fastify.post(
    '/',
    {
      config: {
        // Garde-fou anti-abus : 5 demandes / 10 min par IP (le rate-limit
        // global est à 100/min, trop permissif pour un endpoint public non authentifié).
        rateLimit: { max: 5, timeWindow: '10 minutes' },
      },
    },
    async (request, reply) => {
      const result = demandeSchema.safeParse(request.body)
      if (!result.success) {
        return reply.code(400).send({ error: 'Données invalides', details: result.error.flatten() })
      }

      const { typeDroit, entiteType, entiteId, nomRevendique, emailContact, motif } = result.data

      const demande = await prisma.demandeDroitPersonne.create({
        data: {
          typeDroit,
          entiteType: entiteType ?? null,
          entiteId: entiteId ?? null,
          nomRevendique,
          emailContact,
          motif,
          ipAddressTronquee: tronquerIp(request.ip),
        },
        select: { id: true, typeDroit: true, statut: true, createdAt: true },
      })

      // On renvoie un accusé de réception minimal — pas de fuite d'info sur l'entité.
      return reply.code(201).send({
        message:
          'Votre demande a bien été enregistrée. Une vérification de votre identité ' +
          'pourra vous être demandée par email avant traitement. Délai légal : 1 mois (art. 12.3).',
        demande,
      })
    },
  )

  // --- Liste des demandes (modérateur/admin) ------------------------------
  fastify.get('/', { preHandler: [adminOuModerateur] }, async (request) => {
    const { statut } = request.query ?? {}
    const where = statut && STATUTS.includes(statut) ? { statut } : {}

    return prisma.demandeDroitPersonne.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  })

  // --- Traitement d'une demande (modérateur/admin) ------------------------
  fastify.patch('/:id', { preHandler: [adminOuModerateur] }, async (request, reply) => {
    const result = traitementSchema.safeParse(request.body)
    if (!result.success) {
      return reply.code(400).send({ error: 'Données invalides', details: result.error.flatten() })
    }

    const existante = await prisma.demandeDroitPersonne.findUnique({
      where: { id: request.params.id },
    })
    if (!existante) {
      return reply.code(404).send({ error: 'Demande non trouvée' })
    }

    const { statut, reponse } = result.data
    const estClos = ['ACCEPTEE', 'REFUSEE', 'CLOTUREE'].includes(statut)

    return prisma.demandeDroitPersonne.update({
      where: { id: request.params.id },
      data: {
        statut,
        reponse: reponse ?? existante.reponse,
        traiteParId: request.utilisateur.id,
        traiteLe: estClos ? new Date() : existante.traiteLe,
      },
    })
  })
}
