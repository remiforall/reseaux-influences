import { prisma } from '../utils/prisma.js'

export default async function grapheRoutes(fastify) {
  // Données du graphe pour D3.js (public)
  fastify.get('/', async (request) => {
    const { type, pays, minScore = 0 } = request.query

    const where = { statut: 'VALIDE' }
    if (type) where.typeLien = { code: type }
    if (minScore) where.scoreConfiance = { gte: parseFloat(minScore) }

    const liens = await prisma.lien.findMany({
      where,
      include: {
        personneA: {
          select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true, photoUrl: true },
        },
        personneB: {
          select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true, photoUrl: true },
        },
        typeLien: { select: { code: true, libelle: true, couleur: true } },
        source: { select: { titre: true, media: true, url: true } },
      },
    })

    // Construire les noeuds et arêtes pour D3.js
    const noeudsMap = new Map()

    for (const lien of liens) {
      for (const personne of [lien.personneA, lien.personneB]) {
        if (personne && !noeudsMap.has(personne.id)) {
          // Filtrer par pays si spécifié
          if (pays && personne.pays !== pays) continue
          noeudsMap.set(personne.id, {
            id: personne.id,
            nom: personne.prenom ? `${personne.prenom} ${personne.nom}` : personne.nom,
            role: personne.rolePrincipal,
            pays: personne.pays,
            photoUrl: personne.photoUrl,
            nbLiens: 0,
          })
        }
      }
    }

    const aretes = []
    for (const lien of liens) {
      const noeudA = noeudsMap.get(lien.personneA?.id)
      const noeudB = noeudsMap.get(lien.personneB?.id)
      if (!noeudA || !noeudB) continue

      noeudA.nbLiens++
      noeudB.nbLiens++

      aretes.push({
        source: lien.personneAId,
        target: lien.personneBId,
        type: lien.typeLien.code,
        libelle: lien.typeLien.libelle,
        couleur: lien.typeLien.couleur,
        intensite: lien.intensite,
        scoreConfiance: lien.scoreConfiance,
        description: lien.description,
        sourceMedia: lien.source ? {
          titre: lien.source.titre,
          media: lien.source.media,
          url: lien.source.url,
        } : null,
      })
    }

    return {
      noeuds: Array.from(noeudsMap.values()),
      aretes,
      stats: {
        nbNoeuds: noeudsMap.size,
        nbAretes: aretes.length,
      },
    }
  })

  // Sous-graphe centré sur une personne
  fastify.get('/personne/:id', async (request, reply) => {
    const { profondeur = 1 } = request.query
    const personneId = request.params.id

    const personne = await prisma.personne.findUnique({ where: { id: personneId } })
    if (!personne) {
      return reply.code(404).send({ error: 'Personne non trouvée' })
    }

    // Récupérer les liens directs
    const liens = await prisma.lien.findMany({
      where: {
        statut: 'VALIDE',
        OR: [
          { personneAId: personneId },
          { personneBId: personneId },
        ],
      },
      include: {
        personneA: {
          select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true, photoUrl: true },
        },
        personneB: {
          select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true, photoUrl: true },
        },
        typeLien: { select: { code: true, libelle: true, couleur: true } },
        source: { select: { titre: true, media: true, url: true } },
      },
    })

    const noeudsMap = new Map()
    const aretes = []

    for (const lien of liens) {
      for (const p of [lien.personneA, lien.personneB]) {
        if (p && !noeudsMap.has(p.id)) {
          noeudsMap.set(p.id, {
            id: p.id,
            nom: p.prenom ? `${p.prenom} ${p.nom}` : p.nom,
            role: p.rolePrincipal,
            pays: p.pays,
            photoUrl: p.photoUrl,
            estCentre: p.id === personneId,
            nbLiens: 0,
          })
        }
      }

      noeudsMap.get(lien.personneA?.id) && noeudsMap.get(lien.personneA.id).nbLiens++
      noeudsMap.get(lien.personneB?.id) && noeudsMap.get(lien.personneB.id).nbLiens++

      aretes.push({
        source: lien.personneAId,
        target: lien.personneBId,
        type: lien.typeLien.code,
        libelle: lien.typeLien.libelle,
        couleur: lien.typeLien.couleur,
        intensite: lien.intensite,
        scoreConfiance: lien.scoreConfiance,
        sourceMedia: lien.source ? {
          titre: lien.source.titre,
          media: lien.source.media,
          url: lien.source.url,
        } : null,
      })
    }

    return {
      noeuds: Array.from(noeudsMap.values()),
      aretes,
      centre: personneId,
    }
  })
}
