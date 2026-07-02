/**
 * import-medias-mdiplo.js — Importeur du graphe de détention des médias français.
 *
 * Source : dépôt open data du Monde diplomatique — https://github.com/mdiplo/Medias_francais
 *   Licence ODC-By v1.0 (attribution obligatoire). 7 fichiers TSV : personnes, organisations,
 *   medias + 4 fichiers de relations (id, origine, qualificatif, valeur, cible).
 *
 * Les entités sont liées par NOM (pas d'identifiant). L'importeur :
 *   1. réconcilie chaque entité mdiplo avec un nœud existant par nom normalisé (sinon crée),
 *   2. crée UNE source mdiplo (ODC-By) attachée à tous les liens,
 *   3. crée les liens capitalistiques polymorphes (codes ADR-027 selon qualificatif + valeur).
 *
 * Statut EN_ATTENTE, idempotent (ré-exécutable sans doublon).
 *
 * Usage : node bin/import-medias-mdiplo.js
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const USER_EMAIL = 'remi@reseauxinfluences.fr'
const BASE = 'https://raw.githubusercontent.com/mdiplo/Medias_francais/master'

const SOURCE_MDIPLO = {
  url: 'https://github.com/mdiplo/Medias_francais',
  titre: 'Médias français : qui possède quoi — Le Monde diplomatique (données ODC-By)',
  media: 'Le Monde diplomatique',
  typeMedia: 'WEB',
  langue: 'fr',
  paysMedia: 'France',
  description:
    'Base de données des liens capitalistiques entre actionnaires et médias français. © Le Monde diplomatique, licence Open Data Commons Attribution (ODC-By) v1.0.',
  verifiee: true,
}

const norm = (s) => (s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ')

async function getUserAdmin() {
  const u = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!u) throw new Error('Utilisateur admin introuvable — lancer npm run db:seed')
  return u
}

async function fetchTsv(nom) {
  const resp = await fetch(`${BASE}/${nom}.tsv`)
  if (!resp.ok) throw new Error(`${nom}.tsv HTTP ${resp.status}`)
  const txt = await resp.text()
  const lignes = txt.split(/\r?\n/).filter((l) => l.length)
  const header = lignes[0].split('\t')
  return lignes.slice(1).map((l) => {
    const cells = l.split('\t')
    const o = {}
    header.forEach((h, i) => (o[h] = cells[i]))
    return o
  })
}

/** Code ADR-027 selon qualificatif mdiplo + pourcentage. */
function codeDetention(qualificatif, valeurPct) {
  const q = (qualificatif || '').toLowerCase()
  if (q.includes('contrôle') || q.includes('controle')) return 'ACTIONNAIRE_MAJORITAIRE'
  if (valeurPct >= 100) return 'FILIALE'
  if (valeurPct >= 50) return 'ACTIONNAIRE_MAJORITAIRE'
  return 'DETENTION_CAPITAL'
}

function fk(kind, id, side) {
  return kind === 'personne' ? { [`personne${side}Id`]: id } : { [`organisation${side}Id`]: id }
}

async function main() {
  const user = await getUserAdmin()
  console.log('→ Fetch mdiplo (7 TSV)…')
  const [personnes, organisations, medias, pMedia, pOrga, oOrga, oMedia] = await Promise.all([
    fetchTsv('personnes'),
    fetchTsv('organisations'),
    fetchTsv('medias'),
    fetchTsv('personne-media'),
    fetchTsv('personne-organisation'),
    fetchTsv('organisation-organisation'),
    fetchTsv('organisation-media'),
  ])

  // Index des nœuds existants
  const persDB = await prisma.personne.findMany({ select: { id: true, nom: true, prenom: true } })
  const orgDB = await prisma.organisation.findMany({ select: { id: true, nom: true, sigle: true } })
  const idxPers = new Map()
  for (const p of persDB) idxPers.set(norm(`${p.prenom || ''} ${p.nom}`), p.id)
  const idxOrg = new Map()
  for (const o of orgDB) {
    idxOrg.set(norm(o.nom), o.id)
    if (o.sigle) idxOrg.set(norm(o.sigle), o.id)
  }

  const src = await (async () => {
    const e = await prisma.source.findFirst({ where: { url: SOURCE_MDIPLO.url } })
    return e || prisma.source.create({ data: { ...SOURCE_MDIPLO, creeParId: user.id } })
  })()

  // Carte globale nom → { id, kind }
  const carte = new Map()
  const stat = { persReuse: 0, persNew: 0, orgReuse: 0, orgNew: 0, medReuse: 0, medNew: 0 }

  // Personnes
  for (const p of personnes) {
    const nomComplet = (p.Nom || '').trim()
    if (!nomComplet) continue
    const cle = norm(nomComplet)
    let id = idxPers.get(cle)
    if (id) stat.persReuse++
    else {
      const parts = nomComplet.split(/\s+/)
      const prenom = parts.length > 1 ? parts[0] : null
      const nom = parts.length > 1 ? parts.slice(1).join(' ') : nomComplet
      const rang = p.milliardaireForbes2024 || p.rangChallenges2024
      const created = await prisma.personne.create({
        data: {
          nom,
          prenom,
          pays: 'France',
          qualiteInfluence: 'DIRIGEANT',
          bio: `Actionnaire de médias (source Le Monde diplomatique)${rang ? `. Classement fortune : ${rang}.` : ''}`,
          statut: 'EN_ATTENTE',
          creeParId: user.id,
        },
      })
      id = created.id
      stat.persNew++
    }
    carte.set(cle, { id, kind: 'personne' })
  }

  // Organisations + médias (tous des Organisation, MEDIA pour les médias)
  const upsertOrg = async (nom, typeOrganisation, commentaire) => {
    const cle = norm(nom)
    let id = idxOrg.get(cle)
    let reuse = true
    if (!id) {
      const created = await prisma.organisation.create({
        data: {
          nom: nom.trim(),
          typeOrganisation,
          pays: 'France',
          description: commentaire || `Entité du graphe médias (Le Monde diplomatique).`,
          qualiteInfluence: 'AUTRE',
          statut: 'EN_ATTENTE',
          creeParId: user.id,
        },
      })
      id = created.id
      idxOrg.set(cle, id)
      reuse = false
    }
    carte.set(cle, { id, kind: 'organisation' })
    return reuse
  }
  for (const o of organisations) {
    if (!o.nom) continue
    ;(await upsertOrg(o.nom, 'ENTREPRISE', o.commentaire)) ? stat.orgReuse++ : stat.orgNew++
  }
  for (const m of medias) {
    if (!m.Nom) continue
    ;(await upsertOrg(m.Nom, 'MEDIA')) ? stat.medReuse++ : stat.medNew++
  }

  // Liens
  const typeCache = {}
  const getType = async (code) => {
    if (!typeCache[code]) typeCache[code] = await prisma.typeLien.findUnique({ where: { code } })
    if (!typeCache[code]) throw new Error(`typeLienCode inconnu : ${code}`)
    return typeCache[code]
  }
  let liens = 0,
    nonResolus = 0
  const relations = [...pMedia, ...pOrga, ...oOrga, ...oMedia]
  for (const r of relations) {
    const a = carte.get(norm(r.origine))
    const b = carte.get(norm(r.cible))
    if (!a || !b) {
      nonResolus++
      continue
    }
    const val = parseFloat((r.valeur || '').replace('%', '').replace(',', '.')) || 0
    const code = codeDetention(r.qualificatif, val)
    const typeLien = await getType(code)
    const where = { ...fk(a.kind, a.id, 'A'), ...fk(b.kind, b.id, 'B'), typeLienId: typeLien.id }
    const existing = await prisma.lien.findFirst({ where })
    if (existing) continue
    await prisma.lien.create({
      data: {
        ...where,
        description: `${r.origine} ${r.qualificatif || 'détient'} ${r.valeur || ''} de ${r.cible} (source Le Monde diplomatique, ODC-By).`.replace(/\s+/g, ' ').trim(),
        sourceId: src.id,
        statut: 'EN_ATTENTE',
        creeParId: user.id,
      },
    })
    liens++
  }

  console.log('\n-- Bilan import médias mdiplo --')
  console.log(`   Personnes : ${stat.persReuse} réutilisées, ${stat.persNew} créées`)
  console.log(`   Organisations : ${stat.orgReuse} réutilisées, ${stat.orgNew} créées`)
  console.log(`   Médias : ${stat.medReuse} réutilisés, ${stat.medNew} créés`)
  console.log(`   Liens de détention créés : ${liens} (${nonResolus} relations non résolues)`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('ERREUR import-medias-mdiplo:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
