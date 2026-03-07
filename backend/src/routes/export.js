import { prisma } from '../utils/prisma.js'

export default async function exportRoutes(fastify) {
  // Export JSON des liens validés
  fastify.get('/json', async (request) => {
    const { type, pays } = request.query

    const where = { statut: 'VALIDE' }
    if (type) where.typeLien = { code: type }

    const liens = await prisma.lien.findMany({
      where,
      include: {
        personneA: { select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true } },
        personneB: { select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true } },
        typeLien: { select: { code: true, libelle: true } },
        source: { select: { url: true, titre: true, media: true, datePublication: true } },
      },
    })

    return {
      meta: {
        exportDate: new Date().toISOString(),
        source: 'reseauxinfluences.fr',
        licence: 'MIT',
        total: liens.length,
      },
      data: liens,
    }
  })

  // Export CSV des liens validés
  fastify.get('/csv', async (request, reply) => {
    const { type } = request.query

    const where = { statut: 'VALIDE' }
    if (type) where.typeLien = { code: type }

    const liens = await prisma.lien.findMany({
      where,
      include: {
        personneA: { select: { nom: true, prenom: true, pays: true } },
        personneB: { select: { nom: true, prenom: true, pays: true } },
        typeLien: { select: { libelle: true } },
        source: { select: { url: true, titre: true, media: true } },
      },
    })

    const header = 'Personne A,Pays A,Personne B,Pays B,Type de lien,Description,Source,Média,URL Source,Score de confiance\n'
    const rows = liens.map((l) => {
      const nomA = l.personneA.prenom ? `${l.personneA.prenom} ${l.personneA.nom}` : l.personneA.nom
      const nomB = l.personneB.prenom ? `${l.personneB.prenom} ${l.personneB.nom}` : l.personneB.nom
      return [
        `"${nomA}"`,
        `"${l.personneA.pays || ''}"`,
        `"${nomB}"`,
        `"${l.personneB.pays || ''}"`,
        `"${l.typeLien.libelle}"`,
        `"${(l.description || '').replace(/"/g, '""')}"`,
        `"${l.source?.titre || ''}"`,
        `"${l.source?.media || ''}"`,
        `"${l.source?.url || ''}"`,
        l.scoreConfiance,
      ].join(',')
    })

    const csv = header + rows.join('\n')

    reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="reseaux-influences-export.csv"')
      .send(csv)
  })
}
