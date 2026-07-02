/**
 * seed-jack-lang.js — Jack Lang (Q379229), avec ses rôles publics sourcés.
 *
 * Personnage public : ex-ministre de la Culture puis de l'Éducation nationale,
 * député, maire de Blois, président de l'Institut du monde arabe depuis 2013, PS.
 * Statut EN_ATTENTE, idempotent (upsert par wikidataId). Aucune donnée privée / sensible.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const USER_EMAIL = 'remi@reseauxinfluences.fr'

const SOURCES = {
  wp_lang: {
    url: 'https://fr.wikipedia.org/wiki/Jack_Lang',
    titre: 'Jack Lang — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    description:
      "Parcours : ministre de la Culture (1981-1986, 1988-1993), ministre de l'Éducation nationale (2000-2002), député, maire de Blois, président de l'Institut du monde arabe depuis 2013.",
    verifiee: true,
  },
  ima_officiel: {
    url: 'https://www.imarabe.org/fr/l-institut/gouvernance',
    titre: "Gouvernance — Institut du monde arabe",
    media: 'Institut du monde arabe',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    description: "Jack Lang, président de l'Institut du monde arabe depuis 2013.",
    verifiee: true,
  },
}

const IMA = {
  nom: 'Institut du monde arabe',
  sigle: 'IMA',
  typeOrganisation: 'INSTITUTION_PUBLIQUE',
  pays: 'France',
  siteWeb: 'https://www.imarabe.org',
  description:
    "Fondation reconnue d'utilité publique (Paris), dédiée à la connaissance du monde arabe. Présidée par Jack Lang depuis 2013.",
  wikidataId: 'Q860166',
  qualiteInfluence: 'AUTRE',
}

const LANG = {
  nom: 'Lang',
  prenom: 'Jack',
  pays: 'France',
  nationalite: 'française',
  dateNaissance: new Date('1939-09-02'),
  lieuNaissance: 'Mirecourt (Vosges)',
  rolePrincipal: "Président de l'Institut du monde arabe",
  rolesSecondaires: [
    'ancien ministre de la Culture (1981-1986, 1988-1993)',
    "ancien ministre de l'Éducation nationale (2000-2002)",
    'ancien maire de Blois (1989-2000)',
    'ancien député (Loir-et-Cher puis Paris)',
  ],
  bio:
    "Juriste et homme politique socialiste, Jack Lang a été ministre de la Culture sous François Mitterrand " +
    "(1981-1986 puis 1988-1993), à l'origine de la Fête de la musique, puis ministre de l'Éducation nationale " +
    "(2000-2002). Maire de Blois, député, il préside l'Institut du monde arabe depuis 2013.",
  wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jack_Lang',
  wikidataId: 'Q379229',
  qualiteInfluence: 'ELU',
}

const LIENS = [
  {
    aRef: 'Q379229',
    bRef: 'Q860166',
    typeLienCode: 'DIRIGEANT',
    description: "Jack Lang préside l'Institut du monde arabe depuis 2013.",
    dateDebut: new Date('2013-01-01'),
    sourceRef: 'ima_officiel',
  },
  {
    aRef: 'Q379229',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description: 'Jack Lang est une figure historique du Parti socialiste.',
    dateDebut: null,
    sourceRef: 'wp_lang',
  },
]

async function main() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) throw new Error('Utilisateur admin introuvable — lancer npm run db:seed')

  const upOrg = async (d) =>
    (await prisma.organisation.findFirst({ where: { wikidataId: d.wikidataId } })) ||
    prisma.organisation.create({ data: { ...d, statut: 'EN_ATTENTE', creeParId: user.id } })
  const upPers = async (d) =>
    (await prisma.personne.findFirst({ where: { wikidataId: d.wikidataId } })) ||
    prisma.personne.create({ data: { ...d, statut: 'EN_ATTENTE', creeParId: user.id } })
  const upSrc = async (d) =>
    (await prisma.source.findFirst({ where: { url: d.url } })) ||
    prisma.source.create({ data: { ...d, creeParId: user.id } })
  const findEnt = (wd) =>
    prisma.personne.findFirst({ where: { wikidataId: wd } }).then((p) => p || prisma.organisation.findFirst({ where: { wikidataId: wd } }))
  const isPers = (e, wd) => (wd === 'Q379229')

  const ima = await upOrg(IMA)
  const lang = await upPers(LANG)
  const srcMap = {}
  for (const [k, v] of Object.entries(SOURCES)) srcMap[k] = await upSrc(v)

  let liens = 0
  for (const l of LIENS) {
    const a = await findEnt(l.aRef)
    const b = await findEnt(l.bRef)
    if (!a || !b) {
      console.log(`  [skip] entité manquante ${l.aRef}→${l.bRef}`)
      continue
    }
    const typeLien = await prisma.typeLien.findUnique({ where: { code: l.typeLienCode } })
    const aFk = isPers(a, l.aRef) ? { personneAId: a.id } : { organisationAId: a.id }
    const bFk = { organisationBId: b.id }
    const existing = await prisma.lien.findFirst({ where: { ...aFk, ...bFk, typeLienId: typeLien.id } })
    if (existing) continue
    await prisma.lien.create({
      data: {
        ...aFk,
        ...bFk,
        typeLienId: typeLien.id,
        description: l.description,
        dateDebut: l.dateDebut,
        sourceId: srcMap[l.sourceRef].id,
        statut: 'EN_ATTENTE',
        creeParId: user.id,
      },
    })
    liens++
  }

  console.log(`-- Jack Lang : ${lang.id ? 'ok' : ''} | IMA ok | ${liens} lien(s) créé(s) --`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('ERREUR seed-jack-lang:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
