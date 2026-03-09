import { prisma } from '../utils/prisma.js'

// Helper : nom complet d'une entité
function nomEntite(lien, cote) {
  const p = cote === 'A' ? lien.personneA : lien.personneB
  const o = cote === 'A' ? lien.organisationA : lien.organisationB
  if (p) return { nom: p.prenom ? `${p.prenom} ${p.nom}` : p.nom, type: 'Person', pays: p.pays, id: p.id, role: p.rolePrincipal }
  if (o) return { nom: o.sigle ? `${o.nom} (${o.sigle})` : o.nom, type: 'Organization', pays: o.pays, id: o.id, role: o.typeOrganisation }
  return null
}

// Includes communs pour les exports
const exportIncludes = {
  personneA: { select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true, wikidataId: true } },
  personneB: { select: { id: true, nom: true, prenom: true, rolePrincipal: true, pays: true, wikidataId: true } },
  organisationA: { select: { id: true, nom: true, sigle: true, typeOrganisation: true, pays: true, wikidataId: true } },
  organisationB: { select: { id: true, nom: true, sigle: true, typeOrganisation: true, pays: true, wikidataId: true } },
  typeLien: { select: { code: true, libelle: true } },
  source: { select: { url: true, titre: true, media: true, datePublication: true } },
}

async function fetchValidatedLiens(query) {
  const where = { statut: 'VALIDE' }
  if (query.type) where.typeLien = { code: query.type }
  if (query.minScore) where.scoreConfiance = { gte: parseFloat(query.minScore) }
  return prisma.lien.findMany({ where, include: exportIncludes })
}

export default async function exportRoutes(fastify) {
  // =========================================================================
  // Export JSON (existant, enrichi avec organisations)
  // =========================================================================
  fastify.get('/json', async (request) => {
    const liens = await fetchValidatedLiens(request.query)

    return {
      meta: {
        exportDate: new Date().toISOString(),
        source: 'reseauxinfluences.fr',
        licence: 'MIT',
        total: liens.length,
        format: 'json',
      },
      data: liens,
    }
  })

  // =========================================================================
  // Export CSV (enrichi avec organisations)
  // =========================================================================
  fastify.get('/csv', async (request, reply) => {
    const liens = await fetchValidatedLiens(request.query)

    const header = 'Entité A,Type A,Pays A,Entité B,Type B,Pays B,Type de lien,Description,Source,Média,URL Source,Score de confiance\n'
    const rows = liens.map((l) => {
      const a = nomEntite(l, 'A')
      const b = nomEntite(l, 'B')
      return [
        `"${a?.nom || ''}"`,
        `"${a?.type || ''}"`,
        `"${a?.pays || ''}"`,
        `"${b?.nom || ''}"`,
        `"${b?.type || ''}"`,
        `"${b?.pays || ''}"`,
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

  // =========================================================================
  // Export JSON-LD (web sémantique — compatible detective.io, Wikidata)
  // =========================================================================
  fastify.get('/jsonld', async (request) => {
    const liens = await fetchValidatedLiens(request.query)

    // Collecter les entités uniques
    const entities = new Map()
    for (const lien of liens) {
      for (const cote of ['A', 'B']) {
        const p = cote === 'A' ? lien.personneA : lien.personneB
        const o = cote === 'A' ? lien.organisationA : lien.organisationB
        if (p && !entities.has(p.id)) {
          entities.set(p.id, {
            '@type': 'Person',
            '@id': `urn:reseaux-influences:personne:${p.id}`,
            name: p.prenom ? `${p.prenom} ${p.nom}` : p.nom,
            jobTitle: p.rolePrincipal || undefined,
            nationality: p.pays || undefined,
            sameAs: p.wikidataId ? `https://www.wikidata.org/entity/${p.wikidataId}` : undefined,
          })
        }
        if (o && !entities.has(o.id)) {
          entities.set(o.id, {
            '@type': 'Organization',
            '@id': `urn:reseaux-influences:organisation:${o.id}`,
            name: o.nom,
            alternateName: o.sigle || undefined,
            additionalType: o.typeOrganisation,
            location: o.pays ? { '@type': 'Country', name: o.pays } : undefined,
            sameAs: o.wikidataId ? `https://www.wikidata.org/entity/${o.wikidataId}` : undefined,
          })
        }
      }
    }

    // Construire les relations
    const relationships = liens.map((l) => {
      const idA = l.personneA?.id || l.organisationA?.id
      const idB = l.personneB?.id || l.organisationB?.id
      const typeA = l.personneA ? 'personne' : 'organisation'
      const typeB = l.personneB ? 'personne' : 'organisation'

      return {
        '@type': 'Role',
        '@id': `urn:reseaux-influences:lien:${l.id}`,
        roleName: l.typeLien.libelle,
        additionalType: l.typeLien.code,
        description: l.description || undefined,
        startDate: l.dateDebut || undefined,
        endDate: l.dateFin || undefined,
        participant: [
          { '@id': `urn:reseaux-influences:${typeA}:${idA}` },
          { '@id': `urn:reseaux-influences:${typeB}:${idB}` },
        ],
        isBasedOn: l.source ? {
          '@type': 'CreativeWork',
          name: l.source.titre,
          url: l.source.url,
          publisher: l.source.media || undefined,
          datePublished: l.source.datePublication || undefined,
        } : undefined,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: l.scoreConfiance,
          bestRating: 100,
          worstRating: 0,
        },
      }
    })

    return {
      '@context': {
        '@vocab': 'https://schema.org/',
        ri: 'https://reseauxinfluences.fr/ontology/',
      },
      '@type': 'Dataset',
      name: 'Réseaux d\'Influence — Export',
      description: 'Données collaboratives et vérifiées sur les réseaux d\'influence',
      license: 'https://opensource.org/licenses/MIT',
      dateModified: new Date().toISOString(),
      creator: {
        '@type': 'Organization',
        name: 'Réseaux d\'Influence',
        url: 'https://reseauxinfluences.fr',
      },
      hasPart: [
        ...Array.from(entities.values()),
        ...relationships,
      ],
    }
  })

  // =========================================================================
  // Export GraphML (pour Gephi, yEd, NetworkX, igraph...)
  // =========================================================================
  fastify.get('/graphml', async (request, reply) => {
    const liens = await fetchValidatedLiens(request.query)

    // Collecter les noeuds uniques
    const nodes = new Map()
    for (const lien of liens) {
      for (const cote of ['A', 'B']) {
        const entite = nomEntite(lien, cote)
        if (entite && !nodes.has(entite.id)) {
          nodes.set(entite.id, entite)
        }
      }
    }

    // Échapper les caractères XML
    const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphstruct.org/graphml"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://graphml.graphstruct.org/graphml http://graphml.graphstruct.org/xmlns/1.0/graphml.xsd">
  <key id="d0" for="node" attr.name="label" attr.type="string"/>
  <key id="d1" for="node" attr.name="type" attr.type="string"/>
  <key id="d2" for="node" attr.name="role" attr.type="string"/>
  <key id="d3" for="node" attr.name="pays" attr.type="string"/>
  <key id="d4" for="edge" attr.name="relation" attr.type="string"/>
  <key id="d5" for="edge" attr.name="description" attr.type="string"/>
  <key id="d6" for="edge" attr.name="scoreConfiance" attr.type="double"/>
  <key id="d7" for="edge" attr.name="intensite" attr.type="int"/>
  <key id="d8" for="edge" attr.name="source" attr.type="string"/>
  <graph id="G" edgedefault="undirected">
`

    for (const [id, node] of nodes) {
      xml += `    <node id="${esc(id)}">
      <data key="d0">${esc(node.nom)}</data>
      <data key="d1">${esc(node.type)}</data>
      <data key="d2">${esc(node.role)}</data>
      <data key="d3">${esc(node.pays)}</data>
    </node>
`
    }

    for (const lien of liens) {
      const a = nomEntite(lien, 'A')
      const b = nomEntite(lien, 'B')
      if (!a || !b) continue

      xml += `    <edge id="${esc(lien.id)}" source="${esc(a.id)}" target="${esc(b.id)}"${lien.estBidirectionnel ? '' : ' directed="true"'}>
      <data key="d4">${esc(lien.typeLien.libelle)}</data>
      <data key="d5">${esc(lien.description)}</data>
      <data key="d6">${lien.scoreConfiance}</data>
      <data key="d7">${lien.intensite}</data>
      <data key="d8">${esc(lien.source?.url)}</data>
    </edge>
`
    }

    xml += `  </graph>
</graphml>`

    reply
      .header('Content-Type', 'application/xml; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="reseaux-influences.graphml"')
      .send(xml)
  })

  // =========================================================================
  // API publique — données validées paginées pour intégration externe
  // =========================================================================
  fastify.get('/api-publique', async (request) => {
    const { page = 1, limit = 100, type, minScore = 70, depuis } = request.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = Math.min(parseInt(limit), 500)

    const where = { statut: 'VALIDE', scoreConfiance: { gte: parseFloat(minScore) } }
    if (type) where.typeLien = { code: type }
    if (depuis) where.updatedAt = { gte: new Date(depuis) }

    const [liens, total] = await Promise.all([
      prisma.lien.findMany({
        where,
        skip,
        take,
        orderBy: { scoreConfiance: 'desc' },
        include: exportIncludes,
      }),
      prisma.lien.count({ where }),
    ])

    return {
      meta: {
        source: 'reseauxinfluences.fr',
        licence: 'MIT',
        total,
        page: parseInt(page),
        limit: take,
        pages: Math.ceil(total / take),
        exportDate: new Date().toISOString(),
        description: 'Données collaboratives vérifiées — score de confiance minimum : ' + minScore + '%',
        formats_disponibles: ['/export/json', '/export/csv', '/export/jsonld', '/export/graphml'],
      },
      data: liens.map((l) => {
        const a = nomEntite(l, 'A')
        const b = nomEntite(l, 'B')
        return {
          id: l.id,
          entiteA: a,
          entiteB: b,
          relation: {
            type: l.typeLien.code,
            libelle: l.typeLien.libelle,
            description: l.description,
            dateDebut: l.dateDebut,
            dateFin: l.dateFin,
            bidirectionnel: l.estBidirectionnel,
            intensite: l.intensite,
          },
          confiance: {
            score: l.scoreConfiance,
            validationsVrai: l.nbValidationsVrai,
            validationsFaux: l.nbValidationsFaux,
            validationsIndecis: l.nbValidationsIndecis,
          },
          source: l.source ? {
            titre: l.source.titre,
            url: l.source.url,
            media: l.source.media,
            datePublication: l.source.datePublication,
          } : null,
          updatedAt: l.updatedAt,
        }
      }),
    }
  })
}
