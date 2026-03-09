import { prisma } from '../utils/prisma.js'

// Helper : extraire le nom affiché d'une entité (personne ou organisation)
function getNomEntite(lien, cote) {
  const personne = cote === 'A' ? lien.personneA : lien.personneB
  const organisation = cote === 'A' ? lien.organisationA : lien.organisationB

  if (personne) {
    return {
      id: personne.id,
      nom: personne.prenom ? `${personne.prenom} ${personne.nom}` : personne.nom,
      type: 'personne',
      role: personne.rolePrincipal,
      pays: personne.pays,
      photoUrl: personne.photoUrl,
    }
  }
  if (organisation) {
    return {
      id: organisation.id,
      nom: organisation.sigle ? `${organisation.nom} (${organisation.sigle})` : organisation.nom,
      type: 'organisation',
      typeOrganisation: organisation.typeOrganisation,
      role: organisation.typeOrganisation,
      pays: organisation.pays,
      photoUrl: organisation.logoUrl,
    }
  }
  return null
}

const lienIncludes = {
  personneA: {
    select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true, photoUrl: true },
  },
  personneB: {
    select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true, photoUrl: true },
  },
  organisationA: {
    select: { id: true, nom: true, sigle: true, typeOrganisation: true, pays: true, logoUrl: true },
  },
  organisationB: {
    select: { id: true, nom: true, sigle: true, typeOrganisation: true, pays: true, logoUrl: true },
  },
  typeLien: { select: { code: true, libelle: true, couleur: true } },
  source: { select: { titre: true, media: true, url: true } },
}

export default async function grapheRoutes(fastify) {
  // Données du graphe pour D3.js (public)
  fastify.get('/', async (request) => {
    const { type, pays, minScore = 0 } = request.query

    const where = { statut: 'VALIDE' }
    if (type) where.typeLien = { code: type }
    if (minScore) where.scoreConfiance = { gte: parseFloat(minScore) }

    const liens = await prisma.lien.findMany({
      where,
      include: lienIncludes,
    })

    // Construire les noeuds et arêtes pour D3.js
    const noeudsMap = new Map()

    for (const lien of liens) {
      for (const cote of ['A', 'B']) {
        const entite = getNomEntite(lien, cote)
        if (!entite || noeudsMap.has(entite.id)) continue
        if (pays && entite.pays !== pays) continue
        noeudsMap.set(entite.id, { ...entite, nbLiens: 0 })
      }
    }

    const aretes = []
    for (const lien of liens) {
      const entiteA = getNomEntite(lien, 'A')
      const entiteB = getNomEntite(lien, 'B')
      if (!entiteA || !entiteB) continue

      const noeudA = noeudsMap.get(entiteA.id)
      const noeudB = noeudsMap.get(entiteB.id)
      if (!noeudA || !noeudB) continue

      noeudA.nbLiens++
      noeudB.nbLiens++

      aretes.push({
        source: entiteA.id,
        target: entiteB.id,
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

  // Sous-graphe centré sur une entité (personne ou organisation)
  fastify.get('/entite/:id', async (request, reply) => {
    const entiteId = request.params.id

    // Chercher en personne ou organisation
    const personne = await prisma.personne.findUnique({ where: { id: entiteId } })
    const organisation = !personne
      ? await prisma.organisation.findUnique({ where: { id: entiteId } })
      : null

    if (!personne && !organisation) {
      return reply.code(404).send({ error: 'Entité non trouvée' })
    }

    // Récupérer les liens directs (côté A ou B, personne ou organisation)
    const liens = await prisma.lien.findMany({
      where: {
        statut: 'VALIDE',
        OR: [
          { personneAId: entiteId },
          { personneBId: entiteId },
          { organisationAId: entiteId },
          { organisationBId: entiteId },
        ],
      },
      include: lienIncludes,
    })

    const noeudsMap = new Map()
    const aretes = []

    for (const lien of liens) {
      for (const cote of ['A', 'B']) {
        const entite = getNomEntite(lien, cote)
        if (!entite || noeudsMap.has(entite.id)) continue
        noeudsMap.set(entite.id, {
          ...entite,
          estCentre: entite.id === entiteId,
          nbLiens: 0,
        })
      }

      const entiteA = getNomEntite(lien, 'A')
      const entiteB = getNomEntite(lien, 'B')
      if (!entiteA || !entiteB) continue

      const noeudA = noeudsMap.get(entiteA.id)
      const noeudB = noeudsMap.get(entiteB.id)
      if (noeudA) noeudA.nbLiens++
      if (noeudB) noeudB.nbLiens++

      aretes.push({
        source: entiteA.id,
        target: entiteB.id,
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
      centre: entiteId,
    }
  })

  // Rétrocompatibilité : /personne/:id redirige vers /entite/:id
  fastify.get('/personne/:id', async (request, reply) => {
    const { id } = request.params
    const { profondeur } = request.query
    return reply.redirect(`/api/graphe/entite/${id}${profondeur ? `?profondeur=${profondeur}` : ''}`)
  })
}
