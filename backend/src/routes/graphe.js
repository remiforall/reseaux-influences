import { prisma } from '../utils/prisma.js'
import { optionalAuth } from '../middleware/auth.js'

/**
 * Extrait le nœud affiché depuis un lien pour un côté donné (A ou B).
 * Gère les trois types d'entités : Personne, Organisation, SiteWeb.
 *
 * @param {object} lien - Lien Prisma hydraté
 * @param {'A'|'B'} cote
 * @returns {{ id: string, nom: string, type: string, [key: string]: unknown }|null}
 */
function getNomEntite(lien, cote) {
  const personne = cote === 'A' ? lien.personneA : lien.personneB
  const organisation = cote === 'A' ? lien.organisationA : lien.organisationB
  const siteWeb = cote === 'A' ? lien.siteWebA : lien.siteWebB

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
  if (siteWeb) {
    return {
      id: siteWeb.id,
      nom: siteWeb.domaine,
      type: 'site_web',
      domaine: siteWeb.domaine,
      hebergeurProbable: siteWeb.hebergeurProbable,
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
  siteWebA: {
    select: { id: true, domaine: true, hebergeurProbable: true },
  },
  siteWebB: {
    select: { id: true, domaine: true, hebergeurProbable: true },
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
        sourceId: entiteA.id,
        cibleId: entiteB.id,
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
        sourceId: entiteA.id,
        cibleId: entiteB.id,
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

  /**
   * Frise chronologique d'activité d'une entité.
   *
   * GET /api/graphe/timeline/:entiteId
   *   ?granularite=year|month  (défaut : year)
   *   ?dateDebut=YYYY-MM-DD
   *   ?dateFin=YYYY-MM-DD
   *
   * Retourne :
   *   - periodes : agrégats volume / intensité / confiance par tranche temporelle
   *   - evenements : événements historiques liés à l'entité
   */
  fastify.get('/timeline/:entiteId', { preHandler: [optionalAuth] }, async (request, reply) => {
    const { entiteId } = request.params
    const {
      granularite = 'year',
      dateDebut: dateDbutStr,
      dateFin: dateFinStr,
    } = request.query

    // Validation de la granularité
    const granulariteValide = granularite === 'month' ? 'month' : 'year'

    // Construction du filtre de dates
    const filtreDate = {}
    if (dateDbutStr) {
      const d = new Date(dateDbutStr)
      if (!isNaN(d.getTime())) filtreDate.gte = d
    }
    if (dateFinStr) {
      const d = new Date(dateFinStr)
      if (!isNaN(d.getTime())) filtreDate.lte = d
    }

    // Récupérer tous les liens de l'entité avec leur date
    const whereClause = {
      OR: [
        { personneAId: entiteId },
        { personneBId: entiteId },
        { organisationAId: entiteId },
        { organisationBId: entiteId },
        { siteWebAId: entiteId },
        { siteWebBId: entiteId },
      ],
    }

    if (Object.keys(filtreDate).length > 0) {
      whereClause.dateDebut = filtreDate
    }

    const liens = await prisma.lien.findMany({
      where: whereClause,
      select: {
        dateDebut: true,
        dateFin: true,
        intensite: true,
        scoreConfiance: true,
      },
    })

    // Agréger par période
    const agrege = new Map()

    for (const lien of liens) {
      if (!lien.dateDebut) continue

      const date = new Date(lien.dateDebut)
      let cle
      if (granulariteValide === 'month') {
        cle = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
      } else {
        cle = `${date.getFullYear()}-01-01`
      }

      const entree = agrege.get(cle) ?? {
        date: cle,
        volumeLiens: 0,
        sommeIntensites: 0,
        sommeConfiances: 0,
      }
      entree.volumeLiens++
      entree.sommeIntensites += lien.intensite ?? 1
      entree.sommeConfiances += lien.scoreConfiance ?? 0
      agrege.set(cle, entree)
    }

    const periodes = Array.from(agrege.values())
      .map(({ date, volumeLiens, sommeIntensites, sommeConfiances }) => ({
        date,
        volumeLiens,
        intensiteMoyenne: volumeLiens > 0 ? Math.round((sommeIntensites / volumeLiens) * 100) / 100 : 0,
        scoreConfianceMoyen: volumeLiens > 0 ? Math.round((sommeConfiances / volumeLiens) * 1000) / 1000 : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Récupérer les événements historiques liés à l'entité
    let evenements = []
    try {
      const participations = await prisma.participationEvenement.findMany({
        where: {
          OR: [
            { personneId: entiteId },
            { organisationId: entiteId },
            { siteWebId: entiteId },
          ],
        },
        include: {
          evenement: {
            select: {
              date: true,
              titre: true,
              typeEvenement: true,
              source: { select: { titre: true, url: true } },
            },
          },
        },
      })

      evenements = participations.map((p) => ({
        date: p.evenement.date?.toISOString().substring(0, 10) ?? null,
        titre: p.evenement.titre,
        typeEvenement: p.evenement.typeEvenement,
        source: p.evenement.source ? {
          titre: p.evenement.source.titre,
          url: p.evenement.source.url,
        } : null,
      }))
    } catch {
      // ParticipationEvenement peut ne pas exister en base si la migration n'a pas été appliquée
      evenements = []
    }

    return { periodes, evenements }
  })

  /**
   * Carte de chaleur géographique des liens d'une entité.
   *
   * GET /api/graphe/heatmap/:entiteId
   *   ?dateDebut=YYYY-MM-DD
   *   ?dateFin=YYYY-MM-DD
   *   ?typeEntite=personne|organisation|site
   *
   * Retourne les points géolocalisés des entités liées avec poids = intensite × scoreConfiance.
   * Seules les entités avec des coordonnées géographiques sont incluses.
   */
  fastify.get('/heatmap/:entiteId', { preHandler: [optionalAuth] }, async (request, reply) => {
    const { entiteId } = request.params
    const {
      dateDebut: dateDbutStr,
      dateFin: dateFinStr,
      typeEntite,
    } = request.query

    const filtreDate = {}
    if (dateDbutStr) {
      const d = new Date(dateDbutStr)
      if (!isNaN(d.getTime())) filtreDate.gte = d
    }
    if (dateFinStr) {
      const d = new Date(dateFinStr)
      if (!isNaN(d.getTime())) filtreDate.lte = d
    }

    const whereClause = {
      OR: [
        { personneAId: entiteId },
        { personneBId: entiteId },
        { organisationAId: entiteId },
        { organisationBId: entiteId },
        { siteWebAId: entiteId },
        { siteWebBId: entiteId },
      ],
    }

    if (Object.keys(filtreDate).length > 0) {
      whereClause.dateDebut = filtreDate
    }

    const liens = await prisma.lien.findMany({
      where: whereClause,
      include: {
        personneA: { select: { id: true, nom: true, prenom: true, lieuNaissanceLat: true, lieuNaissanceLon: true } },
        personneB: { select: { id: true, nom: true, prenom: true, lieuNaissanceLat: true, lieuNaissanceLon: true } },
        organisationA: { select: { id: true, nom: true, siegeLat: true, siegeLon: true } },
        organisationB: { select: { id: true, nom: true, siegeLat: true, siegeLon: true } },
      },
    })

    const pointsMap = new Map()

    for (const lien of liens) {
      const poids = (lien.intensite ?? 1) * (lien.scoreConfiance > 0 ? lien.scoreConfiance : 0.1)

      const entitesLiees = [
        lien.personneA, lien.personneB, lien.organisationA, lien.organisationB,
      ].filter(Boolean)

      for (const entite of entitesLiees) {
        if (entite.id === entiteId) continue

        const lat = entite.lieuNaissanceLat ?? entite.siegeLat ?? null
        const lon = entite.lieuNaissanceLon ?? entite.siegeLon ?? null
        if (lat === null || lon === null) continue

        // Filtre optionnel typeEntite
        if (typeEntite) {
          const estPersonne = 'prenom' in entite
          if (typeEntite === 'personne' && !estPersonne) continue
          if (typeEntite === 'organisation' && estPersonne) continue
        }

        const cle = `${entite.id}`
        const existant = pointsMap.get(cle)
        if (existant) {
          existant.poids += poids
        } else {
          const libelle = entite.prenom
            ? `${entite.prenom} ${entite.nom}`
            : entite.nom
          pointsMap.set(cle, { lat, lon, poids, libelle, entiteId: entite.id })
        }
      }
    }

    return { points: Array.from(pointsMap.values()) }
  })

  /**
   * Ego-network BFS : sous-graphe centré sur une entité jusqu'à N sauts.
   *
   * GET /ego/:entiteId?profondeur=2&typesLien=DIRIGEANT,EMPLOI&statut=VALIDE,EN_ATTENTE&typeEntite=personne
   *
   * Chaque nœud porte un champ `niveauSaut` (0 = centre, 1 = voisin direct, 2 = second saut).
   *
   * La réponse inclut les deux formats pour rétrocompatibilité :
   *   - `noeuds` / `aretes` (format historique backend)
   *   - `nodes` / `links` (format attendu par le frontend React/D3)
   */
  fastify.get('/ego/:entiteId', { preHandler: [optionalAuth] }, async (request, reply) => {
    const { entiteId } = request.params
    // Si l'utilisateur n'est pas authentifié, on force le filtre sur VALIDE uniquement
    // pour ne pas exposer les entités EN_ATTENTE non encore modérées (SEC-I-03 / M-02)
    const statutDefaut = request.utilisateur ? 'VALIDE,EN_ATTENTE' : 'VALIDE'
    const {
      profondeur: profondeurStr = '2',
      typesLien: typesLienCsv,
      statut: statutCsv = statutDefaut,
      typeEntite: typeEntiteFiltreRaw,
    } = request.query

    // Un anonyme ne peut jamais forcer EN_ATTENTE dans la query string
    const statutCsvFiltre = !request.utilisateur
      ? statutCsv
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s === 'VALIDE')
          .join(',') || 'VALIDE'
      : statutCsv

    const profondeur = Math.min(Math.max(parseInt(profondeurStr, 10) || 2, 1), 3)
    const statutsFiltres = statutCsvFiltre.split(',').map((s) => s.trim()).filter(Boolean)
    const typesLienFiltres = typesLienCsv
      ? typesLienCsv.split(',').map((t) => t.trim()).filter(Boolean)
      : null

    // Vérifier que l'entité racine existe (personne, organisation ou site web)
    const personneRacine = await prisma.personne.findUnique({ where: { id: entiteId }, select: { id: true } })
    const organisationRacine = !personneRacine
      ? await prisma.organisation.findUnique({ where: { id: entiteId }, select: { id: true } })
      : null
    const siteWebRacine = !personneRacine && !organisationRacine
      ? await prisma.siteWeb.findUnique({ where: { id: entiteId }, select: { id: true } })
      : null

    if (!personneRacine && !organisationRacine && !siteWebRacine) {
      return reply.code(404).send({ error: 'Entité racine non trouvée' })
    }

    /** @type {Map<string, { niveauSaut: number, [key: string]: unknown }>} */
    const noeudsMap = new Map()
    const aretes = []
    const liensDejaTraites = new Set()

    // BFS : file d'entités à explorer avec leur niveau de saut
    /** @type {Array<{ id: string, niveau: number }>} */
    const file = [{ id: entiteId, niveau: 0 }]
    const visites = new Set([entiteId])

    while (file.length > 0) {
      const { id: idCourant, niveau } = file.shift()
      if (niveau >= profondeur) continue

      // Construire le filtre OR selon les positions A/B
      const filtreOR = [
        { personneAId: idCourant },
        { personneBId: idCourant },
        { organisationAId: idCourant },
        { organisationBId: idCourant },
        { siteWebAId: idCourant },
        { siteWebBId: idCourant },
      ]

      const whereClause = {
        statut: { in: statutsFiltres },
        OR: filtreOR,
      }

      if (typesLienFiltres) {
        whereClause.typeLien = { code: { in: typesLienFiltres } }
      }

      const liensVoisins = await prisma.lien.findMany({
        where: whereClause,
        include: lienIncludes,
      })

      for (const lien of liensVoisins) {
        if (liensDejaTraites.has(lien.id)) continue
        liensDejaTraites.add(lien.id)

        for (const cote of ['A', 'B']) {
          const entite = getNomEntite(lien, cote)
          if (!entite) continue

          // Filtre typeEntite optionnel
          if (typeEntiteFiltreRaw && entite.type !== typeEntiteFiltreRaw.toLowerCase()) continue

          if (!noeudsMap.has(entite.id)) {
            const niveauNoeud = entite.id === entiteId ? 0 : niveau + 1
            noeudsMap.set(entite.id, {
              ...entite,
              estCentre: entite.id === entiteId,
              niveauSaut: niveauNoeud,
              nbLiens: 0,
            })

            if (!visites.has(entite.id)) {
              visites.add(entite.id)
              if (niveau + 1 < profondeur) {
                file.push({ id: entite.id, niveau: niveau + 1 })
              }
            }
          }
        }

        const entiteA = getNomEntite(lien, 'A')
        const entiteB = getNomEntite(lien, 'B')
        if (!entiteA || !entiteB) continue

        const noeudA = noeudsMap.get(entiteA.id)
        const noeudB = noeudsMap.get(entiteB.id)
        if (noeudA) noeudA.nbLiens++
        if (noeudB) noeudB.nbLiens++

        aretes.push({
          id: lien.id,
          sourceId: entiteA.id,
          cibleId: entiteB.id,
          type: lien.typeLien.code,
          libelle: lien.typeLien.libelle,
          couleur: lien.typeLien.couleur,
          statut: lien.statut,
          intensite: lien.intensite,
          scoreConfiance: lien.scoreConfiance,
          sourceMedia: lien.source
            ? { titre: lien.source.titre, media: lien.source.media, url: lien.source.url }
            : null,
        })
      }
    }

    const noeudsArray = Array.from(noeudsMap.values())

    // Double format pour rétrocompatibilité (noeuds/aretes = historique, nodes/links = frontend)
    return {
      noeuds: noeudsArray,
      aretes,
      nodes: noeudsArray,
      links: aretes,
      centre: entiteId,
      profondeur,
      stats: {
        nbNoeuds: noeudsArray.length,
        nbAretes: aretes.length,
      },
    }
  })
}
