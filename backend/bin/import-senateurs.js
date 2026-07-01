/**
 * import-senateurs.js — Importeur structuré des sénateurs en exercice.
 *
 * Source : data.senat.fr — open data officiel ODSEN_GENERAL.csv (latin1, séparateur virgule,
 *   en-tête précédé de lignes de commentaire « % »). NosSénateurs a été abandonné (mort 2024).
 *
 * Filtre : État == 'ACTIF'. Dédup : clé nom + prénom + dateNaissance (rapproche les élus déjà
 * en base par Q-id sans doublon). Statut EN_ATTENTE, idempotent.
 *
 * Usage : node bin/import-senateurs.js [--limit N]
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const USER_EMAIL = 'remi@reseauxinfluences.fr'
const CSV_URL = 'https://data.senat.fr/data/senateurs/ODSEN_GENERAL.csv'

const idxLimit = process.argv.indexOf('--limit')
const LIMIT = idxLimit !== -1 ? Number(process.argv[idxLimit + 1]) : Infinity

const SENAT = {
  nom: 'Sénat',
  sigle: 'Sénat',
  typeOrganisation: 'INSTITUTION_PUBLIQUE',
  pays: 'France',
  siteWeb: 'https://www.senat.fr',
  description: 'Chambre haute du Parlement français (348 sénateurs, élus au suffrage indirect).',
  wikidataId: 'Q215987',
}

// Mapping (sous-chaîne du) groupe politique sénatorial → parti en base
const GROUPE_PARTI = [
  { motif: 'Les Républicains', nom: 'Les Républicains', sigle: 'LR', wikidataId: 'Q20012759' },
  { motif: 'Socialiste', nom: 'Parti socialiste', sigle: 'PS', wikidataId: 'Q170972' },
  { motif: 'Communiste', nom: 'Parti communiste français', sigle: 'PCF', wikidataId: 'Q192821' },
  { motif: 'cologiste', nom: 'Les Écologistes', sigle: 'LE', wikidataId: 'Q613786' },
  { motif: 'RDPI', nom: 'Renaissance', sigle: 'RE', wikidataId: 'Q23731823' },
  { motif: 'Union Centriste', nom: 'Union des démocrates et indépendants', sigle: 'UDI', wikidataId: 'Q82892' },
  { motif: 'RDSE', nom: 'Parti radical de gauche', sigle: 'PRG', wikidataId: 'Q427965' },
]

const norm = (s) => (s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const jourISO = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null)

/** Parse une ligne CSV (guillemets, virgules échappées). */
function parseLigne(l) {
  const out = []
  let cur = '',
    q = false
  for (let i = 0; i < l.length; i++) {
    const ch = l[i]
    if (ch === '"') {
      if (q && l[i + 1] === '"') {
        cur += '"'
        i++
      } else q = !q
    } else if (ch === ',' && !q) {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out
}

/** "JJ/MM/AAAA" → Date, sinon null. */
function dateFr(s) {
  const m = (s || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const d = new Date(`${m[3]}-${m[2]}-${m[1]}`)
  return isNaN(d.getTime()) ? null : d
}

async function getUserAdmin() {
  const u = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!u) throw new Error('Utilisateur admin introuvable — lancer npm run db:seed')
  return u
}

async function upsertOrganisation(data, userId) {
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) return existing
  return prisma.organisation.create({ data: { ...data, statut: 'EN_ATTENTE', creeParId: userId } })
}

async function upsertSource(data, userId) {
  const existing = await prisma.source.findFirst({ where: { url: data.url } })
  if (existing) return existing
  return prisma.source.create({ data: { ...data, creeParId: userId } })
}

async function upsertPersonneParNom(p, userId) {
  const candidats = await prisma.personne.findMany({ where: { nom: p.nom } })
  const existing = candidats.find(
    (c) =>
      norm(c.prenom) === norm(p.prenom) &&
      (!p.dateNaissance || !c.dateNaissance || jourISO(c.dateNaissance) === jourISO(p.dateNaissance))
  )
  if (existing) {
    if (existing.qualiteInfluence !== 'ELU') {
      await prisma.personne.update({ where: { id: existing.id }, data: { qualiteInfluence: 'ELU' } })
    }
    return { entite: existing, cree: false }
  }
  const entite = await prisma.personne.create({
    data: { ...p, qualiteInfluence: 'ELU', statut: 'EN_ATTENTE', creeParId: userId },
  })
  return { entite, cree: true }
}

async function creerLienPO(personneId, organisationId, code, description, sourceId, userId) {
  const typeLien = await prisma.typeLien.findUnique({ where: { code } })
  if (!typeLien) throw new Error(`typeLienCode inconnu : ${code}`)
  const existing = await prisma.lien.findFirst({
    where: { personneAId: personneId, organisationBId: organisationId, typeLienId: typeLien.id },
  })
  if (existing) return existing
  return prisma.lien.create({
    data: {
      personneAId: personneId,
      organisationBId: organisationId,
      typeLienId: typeLien.id,
      description,
      sourceId,
      statut: 'EN_ATTENTE',
      creeParId: userId,
    },
  })
}

async function main() {
  const user = await getUserAdmin()
  console.log('→ Fetch data.senat.fr…')
  const resp = await fetch(CSV_URL)
  if (!resp.ok) throw new Error(`Sénat HTTP ${resp.status}`)
  const txt = Buffer.from(await resp.arrayBuffer()).toString('latin1')
  const lignes = txt.split(/\r?\n/).filter((l) => l && !l.startsWith('%'))
  const header = parseLigne(lignes[0])
  const col = (nom) => header.indexOf(nom)
  const iNom = col('Nom usuel'),
    iPre = col('Prénom usuel'),
    iEtat = col('État'),
    iNais = col('Date naissance'),
    iGrp = col('Groupe politique'),
    iCirco = col('Circonscription')

  const senat = await upsertOrganisation(SENAT, user.id)
  const partisCache = {}
  let crees = 0,
    rapproches = 0,
    liensParti = 0,
    n = 0

  for (const l of lignes.slice(1)) {
    if (n >= LIMIT) break
    const r = parseLigne(l)
    if (r[iEtat] !== 'ACTIF') continue
    n++
    const grpNom = r[iGrp] || ''
    const circo = r[iCirco] || ''
    const { entite, cree } = await upsertPersonneParNom(
      {
        nom: r[iNom],
        prenom: r[iPre],
        pays: 'France',
        nationalite: 'française',
        dateNaissance: dateFr(r[iNais]),
        rolePrincipal: `Sénateur·rice — ${circo}`,
        bio: `Sénateur·rice (${circo})${grpNom ? `, groupe ${grpNom}` : ''}.`,
      },
      user.id
    )
    cree ? crees++ : rapproches++

    const src = await upsertSource(
      {
        url: 'https://www.senat.fr/senateurs/senatl.html',
        titre: 'Liste des sénateurs — Sénat (open data ODSEN)',
        media: 'Sénat (open data)',
        typeMedia: 'DOCUMENT_OFFICIEL',
        langue: 'fr',
        paysMedia: 'France',
        description: 'Base ODSEN_GENERAL des sénateurs en exercice (data.senat.fr).',
        verifiee: true,
      },
      user.id
    )

    await creerLienPO(
      entite.id,
      senat.id,
      'MANDAT_ELECTIF',
      `Sénateur·rice de ${circo}${grpNom ? ` (groupe ${grpNom})` : ''}.`,
      src.id,
      user.id
    )

    const pd = GROUPE_PARTI.find((g) => grpNom.includes(g.motif))
    if (pd) {
      if (!partisCache[pd.wikidataId]) {
        partisCache[pd.wikidataId] = await upsertOrganisation(
          { nom: pd.nom, sigle: pd.sigle, wikidataId: pd.wikidataId, typeOrganisation: 'PARTI_POLITIQUE', pays: 'France' },
          user.id
        )
      }
      await creerLienPO(
        entite.id,
        partisCache[pd.wikidataId].id,
        'AFFILIATION_PARTI',
        `Rattaché·e au groupe ${grpNom} au Sénat.`,
        src.id,
        user.id
      )
      liensParti++
    }
  }

  console.log('\n-- Bilan import sénateurs --')
  console.log(`   Sénateurs actifs : ${n}`)
  console.log(`   Créés            : ${crees}`)
  console.log(`   Rapprochés       : ${rapproches} (déjà en base, non dupliqués)`)
  console.log(`   Liens AFFILIATION_PARTI : ${liensParti}`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('ERREUR import-senateurs:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
