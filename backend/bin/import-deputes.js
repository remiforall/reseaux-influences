/**
 * import-deputes.js — Importeur structuré des députés (17e législature, en cours).
 *
 * Source : data.assemblee-nationale.fr — open data officiel « Acteurs, Mandats, Organes »
 *   (AMO10_deputes_actifs_mandats_actifs_organes). NosDéputés a été abandonné : il est gelé
 *   sur la 16e législature (dissoute le 2024-06-09).
 *
 * Le script télécharge + dézippe l'archive (curl + unzip), lit les fichiers organe (groupes
 * politiques) puis acteur (députés), et upsert chaque député.
 *
 * Dédup : clé = nom + prénom + dateNaissance → rapproche les élus déjà en base par Q-id
 * (ministres, chefs de partis) sans doublon ni écrasement. Statut EN_ATTENTE, idempotent.
 *
 * Usage : node bin/import-deputes.js [--limit N]
 */
import { PrismaClient } from '@prisma/client'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const prisma = new PrismaClient()
const USER_EMAIL = 'remi@reseauxinfluences.fr'
const ZIP_URL =
  'https://data.assemblee-nationale.fr/static/openData/repository/17/amo/deputes_actifs_mandats_actifs_organes/AMO10_deputes_actifs_mandats_actifs_organes.json.zip'

const idxLimit = process.argv.indexOf('--limit')
const LIMIT = idxLimit !== -1 ? Number(process.argv[idxLimit + 1]) : Infinity

const ASSEMBLEE = {
  nom: 'Assemblée nationale',
  sigle: 'AN',
  typeOrganisation: 'INSTITUTION_PUBLIQUE',
  pays: 'France',
  siteWeb: 'https://www.assemblee-nationale.fr',
  description: 'Chambre basse du Parlement français (577 députés).',
  wikidataId: 'Q193582',
}

// Groupe parlementaire (libellé abrégé) → parti déjà en base (wikidataId)
const GROUPE_PARTI = {
  EPR: { nom: 'Renaissance', sigle: 'RE', wikidataId: 'Q23731823' },
  DEM: { nom: 'Mouvement démocrate', sigle: 'MoDem', wikidataId: 'Q587370' },
  HOR: { nom: 'Horizons', sigle: 'HOR', wikidataId: 'Q108846587' },
  SOC: { nom: 'Parti socialiste', sigle: 'PS', wikidataId: 'Q170972' },
  EcoS: { nom: 'Les Écologistes', sigle: 'LE', wikidataId: 'Q613786' },
  'LFI-NFP': { nom: 'La France insoumise', sigle: 'LFI', wikidataId: 'Q27978402' },
  GDR: { nom: 'Parti communiste français', sigle: 'PCF', wikidataId: 'Q192821' },
  DR: { nom: 'Les Républicains', sigle: 'LR', wikidataId: 'Q20012759' },
  RN: { nom: 'Rassemblement national', sigle: 'RN', wikidataId: 'Q205150' },
  UDR: { nom: 'Union des droites pour la République', sigle: 'UDR', wikidataId: 'Q131426113' },
}

const norm = (s) => (s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const jourISO = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null)
const asArray = (x) => (Array.isArray(x) ? x : x ? [x] : [])

function telechargerEtExtraire() {
  const base = join(tmpdir(), 'ri-an-deputes')
  if (!existsSync(base)) mkdirSync(base, { recursive: true })
  const zip = join(base, 'amo.zip')
  const dir = join(base, 'extract')
  console.log('→ Téléchargement + extraction AN open data…')
  execFileSync('curl', ['-s', '-o', zip, ZIP_URL], { stdio: 'ignore' })
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  execFileSync('unzip', ['-oq', zip, '-d', dir], { stdio: 'ignore' })
  return dir
}

/** Construit la table organeRef (PO…) → { libelle, abrege } pour les groupes politiques (GP). */
function chargerGroupes(dir) {
  const organeDir = join(dir, 'json', 'organe')
  const map = {}
  for (const f of readdirSync(organeDir)) {
    if (!f.startsWith('PO')) continue
    try {
      const o = JSON.parse(readFileSync(join(organeDir, f), 'utf8')).organe
      if (o?.codeType === 'GP') map[o.uid] = { libelle: o.libelle, abrege: o.libelleAbrege }
    } catch {
      /* ignore fichiers non parsables */
    }
  }
  return map
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

/** Upsert personne par (nom + prénom + dateNaissance) — sans écraser un nœud existant plus riche. */
async function upsertPersonneParNom(p, userId) {
  const brut = p.dateNaissance ? new Date(p.dateNaissance) : null
  const dateN = brut && !isNaN(brut.getTime()) ? brut : null
  const candidats = await prisma.personne.findMany({ where: { nom: p.nom } })
  const existing = candidats.find(
    (c) =>
      norm(c.prenom) === norm(p.prenom) &&
      (!dateN || !c.dateNaissance || jourISO(c.dateNaissance) === jourISO(dateN))
  )
  if (existing) {
    if (existing.qualiteInfluence !== 'ELU') {
      await prisma.personne.update({ where: { id: existing.id }, data: { qualiteInfluence: 'ELU' } })
    }
    return { entite: existing, cree: false }
  }
  const { dateNaissance: _ignore, ...rest } = p
  const entite = await prisma.personne.create({
    data: { ...rest, dateNaissance: dateN, qualiteInfluence: 'ELU', statut: 'EN_ATTENTE', creeParId: userId },
  })
  return { entite, cree: true }
}

async function creerLienPO(personneId, organisationId, code, description, dateDebut, sourceId, userId) {
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
      dateDebut: dateDebut ? new Date(dateDebut) : null,
      sourceId,
      statut: 'EN_ATTENTE',
      creeParId: userId,
    },
  })
}

async function main() {
  const user = await getUserAdmin()
  const dir = telechargerEtExtraire()
  const groupes = chargerGroupes(dir)
  const acteurDir = join(dir, 'json', 'acteur')
  const fichiers = readdirSync(acteurDir).filter((f) => f.startsWith('PA') && f.endsWith('.json'))
  console.log(`→ ${fichiers.length} députés (17e législature)`)

  const an = await upsertOrganisation(ASSEMBLEE, user.id)
  const partisCache = {}
  let crees = 0,
    rapproches = 0,
    liensParti = 0,
    n = 0

  for (const f of fichiers) {
    if (n >= LIMIT) break
    n++
    const a = JSON.parse(readFileSync(join(acteurDir, f), 'utf8')).acteur
    const ident = a.etatCivil.ident
    const naiss = a.etatCivil.infoNaissance || {}
    const mandats = asArray(a.mandats?.mandat)
    const mAssemblee = mandats.find((m) => m.typeOrgane === 'ASSEMBLEE')
    const mGroupe = mandats.find((m) => m.typeOrgane === 'GP')
    const grp = mGroupe ? groupes[asArray(mGroupe.organes?.organeRef)[0]] : null
    const lieu = mAssemblee?.election?.lieu
    const circo = lieu ? `${lieu.departement} (${lieu.numDepartement}), circonscription ${lieu.numCirco}` : ''

    const { entite, cree } = await upsertPersonneParNom(
      {
        nom: ident.nom,
        prenom: ident.prenom,
        pays: 'France',
        nationalite: 'française',
        dateNaissance: naiss.dateNais || null,
        lieuNaissance: naiss.villeNais || null,
        rolePrincipal: `Député·e — ${circo || 'Assemblée nationale'}`,
        bio: `Député·e de la 17e législature${grp ? `, groupe ${grp.libelle}` : ''}${circo ? `, ${circo}` : ''}. Mandat depuis le ${mAssemblee?.dateDebut || '2024-07'}.`,
      },
      user.id
    )
    cree ? crees++ : rapproches++

    const src = await upsertSource(
      {
        url: `https://www.assemblee-nationale.fr/dyn/deputes/${a.uid['#text'] || a.uid}`,
        titre: `${ident.prenom} ${ident.nom} — Assemblée nationale`,
        media: 'Assemblée nationale (open data)',
        typeMedia: 'DOCUMENT_OFFICIEL',
        langue: 'fr',
        paysMedia: 'France',
        description: `Fiche officielle du·de la député·e ${ident.prenom} ${ident.nom}${grp ? `, groupe ${grp.libelle}` : ''}.`,
        verifiee: true,
      },
      user.id
    )

    await creerLienPO(
      entite.id,
      an.id,
      'MANDAT_ELECTIF',
      `Députée·e${circo ? ` de ${circo}` : ''}${grp ? ` (groupe ${grp.libelle})` : ''}, mandat depuis le ${mAssemblee?.dateDebut || '2024-07'}.`,
      mAssemblee?.dateDebut,
      src.id,
      user.id
    )

    const pd = grp ? GROUPE_PARTI[grp.abrege] : null
    if (pd) {
      if (!partisCache[pd.wikidataId]) {
        partisCache[pd.wikidataId] = await upsertOrganisation(
          { ...pd, typeOrganisation: 'PARTI_POLITIQUE', pays: 'France' },
          user.id
        )
      }
      await creerLienPO(
        entite.id,
        partisCache[pd.wikidataId].id,
        'AFFILIATION_PARTI',
        `Rattaché·e au groupe ${grp.libelle} à l'Assemblée nationale.`,
        mAssemblee?.dateDebut,
        src.id,
        user.id
      )
      liensParti++
    }
  }

  console.log('\n-- Bilan import députés --')
  console.log(`   Traités    : ${n}`)
  console.log(`   Créés      : ${crees}`)
  console.log(`   Rapprochés : ${rapproches} (déjà en base, non dupliqués)`)
  console.log(`   Liens AFFILIATION_PARTI : ${liensParti}`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('ERREUR import-deputes:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
