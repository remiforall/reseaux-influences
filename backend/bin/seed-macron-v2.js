/**
 * Seed Macron + Renaissance — enquête OSINT du 2026-06-22.
 * Sources : Wikidata (Q3052772, Q21511883, Q20089181, Q23731823), Wikipédia FR,
 *           vie-publique.fr, info.gouv.fr, Le Monde, AFP/France Info.
 * Idempotent (upsert par wikidataId).
 * Statut : entités importées en EN_ATTENTE (corpus de validation manuel, recoupé ≥ 2 sources).
 *
 * Usage :
 *   cd backend && node bin/seed-macron-v2.js
 *   cd backend && node bin/seed-macron-v2.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    nom: 'Macron',
    prenom: 'Emmanuel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1977-12-21'),
    rolePrincipal: 'Président de la République française',
    rolesSecondaires: ['ancien ministre de l’Économie', 'fondateur de En Marche'],
    bio:
      "Président de la République française depuis le 14 mai 2017, réélu en 2022. " +
      "Fondateur du mouvement En Marche (2016), devenu La République en marche puis Renaissance.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Emmanuel_Macron',
    wikidataId: 'Q3052772',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Macron',
    prenom: 'Brigitte',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1953-04-13'),
    rolePrincipal: 'Première dame de France',
    rolesSecondaires: ['ancienne professeure de lettres'],
    bio:
      "Épouse d'Emmanuel Macron depuis le 20 octobre 2007. " +
      "Première dame de France depuis mai 2017. Ancienne professeure de lettres (née Trogneux).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Brigitte_Macron',
    wikidataId: 'Q21511883',
    qualiteInfluence: 'AUTRE',
  },
  {
    nom: 'Lecornu',
    prenom: 'Sébastien',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1986-06-11'),
    rolePrincipal: 'Premier ministre de la France',
    rolesSecondaires: ['ancien ministre des Armées', 'membre de Renaissance'],
    bio:
      "Premier ministre de la France depuis septembre 2025 (gouvernement Lecornu, " +
      "remanié en Lecornu II le 26 février 2026). Membre de Renaissance depuis 2017 " +
      "(ex-LR). Ancien ministre des Armées (2022-2025).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/S%C3%A9bastien_Lecornu',
    wikidataId: 'Q20089181',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    nom: 'Renaissance',
    sigle: 'RE',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://parti-renaissance.fr',
    description:
      "Parti politique français fondé le 6 avril 2016 sous le nom « En Marche » par Emmanuel Macron, " +
      "renommé « La République en marche » (LREM) en mai 2017, puis « Renaissance » (RE) le 17 septembre 2022. " +
      "Parti pivot de la majorité présidentielle Ensemble.",
    dateCreation: new Date('2016-04-06'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Renaissance_(parti)',
    wikidataId: 'Q23731823',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES
// ---------------------------------------------------------------------------

const SOURCES = {
  wd_macron: {
    url: 'https://www.wikidata.org/wiki/Q3052772',
    titre: 'Emmanuel Macron — fiche Wikidata Q3052772',
    media: 'Wikidata',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-22'),
    dateConsultation: new Date('2026-06-22'),
    auteur: null,
    description: 'Fiche Wikidata, date de naissance 1977-12-21, fonction P39 président de la République française.',
    verifiee: true,
  },
  wd_brigitte: {
    url: 'https://www.wikidata.org/wiki/Q21511883',
    titre: 'Brigitte Macron — fiche Wikidata Q21511883',
    media: 'Wikidata',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-22'),
    dateConsultation: new Date('2026-06-22'),
    auteur: null,
    description: 'Fiche Wikidata, date de naissance 1953-04-13, P26 conjoint Emmanuel Macron.',
    verifiee: true,
  },
  wd_lecornu: {
    url: 'https://www.wikidata.org/wiki/Q20089181',
    titre: 'Sébastien Lecornu — fiche Wikidata Q20089181',
    media: 'Wikidata',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-22'),
    dateConsultation: new Date('2026-06-22'),
    auteur: null,
    description: 'Fiche Wikidata, date de naissance 1986-06-11, P102 Renaissance.',
    verifiee: true,
  },
  wd_renaissance: {
    url: 'https://www.wikidata.org/wiki/Q23731823',
    titre: 'Renaissance (parti) — fiche Wikidata Q23731823',
    media: 'Wikidata',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-22'),
    dateConsultation: new Date('2026-06-22'),
    auteur: null,
    description: 'Fiche Wikidata du parti Renaissance, fondé 2016-04-06, alt-labels En Marche, LREM, LaREM.',
    verifiee: true,
  },
  vie_publique_lecornu: {
    url: 'https://www.vie-publique.fr/en-bref/300414-emmanuel-macron-nomme-sebastien-lecornu-premier-ministre',
    titre: 'Emmanuel Macron nomme Sébastien Lecornu Premier ministre',
    media: 'vie-publique.fr',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-09-09'),
    dateConsultation: new Date('2026-06-22'),
    auteur: 'DILA',
    description: 'Nomination officielle de Sébastien Lecornu (Renaissance) comme Premier ministre par Emmanuel Macron.',
    verifiee: true,
  },
  wp_renaissance: {
    url: 'https://fr.wikipedia.org/wiki/Renaissance_(parti)',
    titre: 'Renaissance (parti) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-22'),
    auteur: null,
    description: 'Histoire du parti En Marche (2016) → LREM (2017) → Renaissance (17 sept 2022), fondé par E. Macron.',
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002), exactement 1 entité non-nulle de chaque côté.
// ---------------------------------------------------------------------------

const LIENS = [
  // P-P : famille (mariage)
  {
    aType: 'personne', aRef: 'Q3052772',
    bType: 'personne', bRef: 'Q21511883',
    typeLienCode: 'famille',
    description: "Mariage d'Emmanuel Macron et Brigitte Trogneux le 20 octobre 2007 au Touquet.",
    dateDebut: new Date('2007-10-20'),
    dateFin: null,
    sourceRef: 'wd_brigitte',
  },
  // P-O : Macron fondateur/membre Renaissance (AFFILIATION_PARTI)
  {
    aType: 'personne', aRef: 'Q3052772',
    bType: 'organisation', bRef: 'Q23731823',
    typeLienCode: 'AFFILIATION_PARTI',
    description: "Emmanuel Macron a fondé En Marche le 6 avril 2016, devenu Renaissance en 2022.",
    dateDebut: new Date('2016-04-06'),
    dateFin: null,
    sourceRef: 'wp_renaissance',
  },
  // P-O : Lecornu membre Renaissance
  {
    aType: 'personne', aRef: 'Q20089181',
    bType: 'organisation', bRef: 'Q23731823',
    typeLienCode: 'AFFILIATION_PARTI',
    description: "Sébastien Lecornu a rejoint Renaissance (alors En Marche) en 2017, après avoir quitté Les Républicains.",
    dateDebut: new Date('2017-01-01'),
    dateFin: null,
    sourceRef: 'wd_lecornu',
  },
  // P-O : Macron mandat électif président (MANDAT_ELECTIF utilise Personne x Institution, mais ici on lie au parti d'investiture faute d'institution Élysée importée)
  // -> on préfère un lien politique entre Macron et Lecornu (nomination)
  {
    aType: 'personne', aRef: 'Q3052772',
    bType: 'personne', bRef: 'Q20089181',
    typeLienCode: 'politique',
    description: "Emmanuel Macron a nommé Sébastien Lecornu Premier ministre le 9 septembre 2025.",
    dateDebut: new Date('2025-09-09'),
    dateFin: null,
    sourceRef: 'vie_publique_lecornu',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-perso.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-macron] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

async function upsertPersonne(data, userId) {
  const existing = await prisma.personne.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.personne.update({
      where: { id: existing.id },
      data: { ...data, statut: 'EN_ATTENTE' },
    })
  }
  return prisma.personne.create({ data: { ...data, statut: 'EN_ATTENTE', creeParId: userId } })
}

async function upsertOrganisation(data, userId) {
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.organisation.update({
      where: { id: existing.id },
      data: { ...data, statut: 'EN_ATTENTE' },
    })
  }
  return prisma.organisation.create({ data: { ...data, statut: 'EN_ATTENTE', creeParId: userId } })
}

async function upsertSource(key) {
  const data = SOURCES[key]
  const existing = await prisma.source.findFirst({ where: { url: data.url } })
  if (existing) return existing
  return prisma.source.create({ data })
}

async function trouverEntite(type, wikidataId) {
  if (type === 'personne') {
    return prisma.personne.findFirst({ where: { wikidataId } })
  }
  if (type === 'organisation') {
    return prisma.organisation.findFirst({ where: { wikidataId } })
  }
  throw new Error(`Type entité non supporté ici : ${type}`)
}

function fkPourEntite(type, entite, position) {
  const suffix = position === 'A' ? 'AId' : 'BId'
  if (type === 'personne') return { [`personne${suffix}`]: entite.id }
  if (type === 'organisation') return { [`organisation${suffix}`]: entite.id }
  if (type === 'siteWeb') return { [`siteWeb${suffix}`]: entite.id }
  throw new Error(`Type inconnu : ${type}`)
}

async function creerLien(lien, sourcesMap, userId) {
  const entiteA = await trouverEntite(lien.aType, lien.aRef)
  const entiteB = await trouverEntite(lien.bType, lien.bRef)
  if (!entiteA || !entiteB) {
    throw new Error(
      `[seed-macron] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
    )
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`TypeLien introuvable : ${lien.typeLienCode}`)
  }

  const fkA = fkPourEntite(lien.aType, entiteA, 'A')
  const fkB = fkPourEntite(lien.bType, entiteB, 'B')

  const existing = await prisma.lien.findFirst({
    where: { ...fkA, ...fkB, typeLienId: typeLien.id },
  })

  const source = sourcesMap[lien.sourceRef]

  if (existing) {
    return prisma.lien.update({
      where: { id: existing.id },
      data: {
        description: lien.description,
        dateDebut: lien.dateDebut,
        dateFin: lien.dateFin,
        statut: 'EN_ATTENTE',
        sourceId: source?.id ?? null,
      },
    })
  }

  return prisma.lien.create({
    data: {
      ...fkA,
      ...fkB,
      typeLienId: typeLien.id,
      description: lien.description,
      dateDebut: lien.dateDebut,
      dateFin: lien.dateFin,
      statut: 'EN_ATTENTE',
      estBidirectionnel: false,
      intensite: 1,
      sourceId: source?.id ?? null,
      creeParId: userId,
    },
  })
}

async function reset() {
  console.log('⚠ Suppression données Macron/Renaissance précédentes...')
  const wikidataIdsP = PERSONNES.map((p) => p.wikidataId)
  const wikidataIdsO = ORGANISATIONS.map((o) => o.wikidataId)

  const persos = await prisma.personne.findMany({ where: { wikidataId: { in: wikidataIdsP } } })
  const orgas = await prisma.organisation.findMany({ where: { wikidataId: { in: wikidataIdsO } } })

  const idsP = persos.map((p) => p.id)
  const idsO = orgas.map((o) => o.id)

  await prisma.lien.deleteMany({
    where: {
      OR: [
        { personneAId: { in: idsP } },
        { personneBId: { in: idsP } },
        { organisationAId: { in: idsO } },
        { organisationBId: { in: idsO } },
      ],
    },
  })
  await prisma.personne.deleteMany({ where: { id: { in: idsP } } })
  await prisma.organisation.deleteMany({ where: { id: { in: idsO } } })
  console.log('✓ Données précédentes supprimées.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n┌─ seed-macron — Emmanuel + Brigitte Macron + Lecornu + Renaissance ───┐\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`✓ User : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ✓ ${data.titre}`)
  }

  console.log('\n— Personnes (Wikidata) —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ✓ ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n— Organisations (Wikidata) —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ✓ ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Liens —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ✓ ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n┌─ Bilan ─────────────────────────────────────────────────────┐')
  console.log(`│ Personnes     : ${PERSONNES.length} (Macron E., Macron B., Lecornu S.)`)
  console.log(`│ Organisations : ${ORGANISATIONS.length} (Renaissance)`)
  console.log(`│ Sources       : ${Object.keys(SOURCES).length} (Wikidata x4, vie-publique, Wikipédia)`)
  console.log(`│ Liens         : ${LIENS.length} (famille, AFFILIATION_PARTI x2, politique)`)
  console.log('└─────────────────────────────────────────────────────────────┘\n')
}

main()
  .catch((err) => {
    console.error('[seed-macron] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
