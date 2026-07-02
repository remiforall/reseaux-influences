/**
 * seed-epstein-cluster.js — Noyau documenté de l'affaire Epstein (volet français établi).
 *
 * N'encode QUE des faits établis sur des personnes DÉCÉDÉES (pas de diffamation sur vivant) :
 *   - Jeffrey Epstein (Q2904131, 1953-2019), financier, délinquant sexuel condamné.
 *   - Jean-Luc Brunel (Q74631975, 1946-2022), agent de mannequins, associé d'Epstein ;
 *     mis en examen en France (2020), mort en détention (2022) AVANT jugement → présumé innocent.
 *
 * Volet Jack Lang (Q379229, déjà créé par seed-jack-lang.js — lancer ce seed AVANT) :
 *   statut procédural ENCODÉ car établi par sources de référence convergentes (Le Monde 9/02,
 *   Mediapart 7/02 & 16/02 2026) : ouverture d'une enquête judiciaire sur des flux financiers
 *   liés à Epstein et à la famille Lang + démission de la présidence de l'IMA le 7/02/2026.
 *   Formulation strictement ATTRIBUÉE, présomption d'innocence, AUCUNE culpabilité affirmée.
 *
 * Statut EN_ATTENTE, idempotent (upsert par wikidataId).
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const USER_EMAIL = 'remi@reseauxinfluences.fr'

const SOURCES = {
  mp_brunel: {
    url: 'https://www.mediapart.fr/journal/international/150226/entre-jeffrey-epstein-et-le-francais-jean-luc-brunel-c-etait-la-famille',
    titre: "Entre Jeffrey Epstein et le Français Jean-Luc Brunel, « c'était la famille »",
    media: 'Mediapart',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-02-15'),
    description:
      "Enquête sur la relation entre Jeffrey Epstein et l'agent de mannequins français Jean-Luc Brunel.",
    verifiee: true,
  },
  wp_epstein: {
    url: 'https://fr.wikipedia.org/wiki/Affaire_Jeffrey_Epstein',
    titre: 'Affaire Jeffrey Epstein — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    description: "Synthèse de l'affaire Epstein et de ses ramifications.",
    verifiee: true,
  },
  wp_brunel: {
    url: 'https://fr.wikipedia.org/wiki/Jean-Luc_Brunel',
    titre: 'Jean-Luc Brunel — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    description:
      "Agent de mannequins, fondateur de l'agence MC2 ; mis en examen en 2020, mort en détention en 2022 avant jugement.",
    verifiee: true,
  },
  mp_lang_enquete: {
    url: 'https://www.mediapart.fr/journal/france/070226/l-argent-d-esptein-et-la-famille-lang-la-justice-ouvre-une-enquete-le-rappel-des-faits',
    titre: "L'argent d'Epstein et la famille Lang : la justice ouvre une enquête",
    media: 'Mediapart',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-02-07'),
    description: "Ouverture d'une enquête judiciaire sur des flux financiers liés à Epstein et à la famille Lang.",
    verifiee: true,
  },
  mp_lang_demission: {
    url: 'https://www.mediapart.fr/journal/france/070226/jack-lang-demissionne-de-la-presidence-de-l-institut-du-monde-arabe',
    titre: "Jack Lang démissionne de la présidence de l'Institut du monde arabe",
    media: 'Mediapart',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-02-07'),
    description: "Démission de Jack Lang de la présidence de l'IMA le 7 février 2026.",
    verifiee: true,
  },
}

const EPSTEIN = {
  nom: 'Epstein',
  prenom: 'Jeffrey',
  pays: 'États-Unis',
  nationalite: 'américaine',
  dateNaissance: new Date('1953-01-20'),
  rolePrincipal: 'Financier',
  bio:
    "Financier américain (1953-2019). Condamné en 2008 en Floride pour incitation à la prostitution de mineure, " +
    "de nouveau inculpé en 2019 pour trafic sexuel de mineures, il est mort en détention le 10 août 2019. " +
    "Son réseau international a donné lieu à de multiples enquêtes.",
  wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jeffrey_Epstein',
  wikidataId: 'Q2904131',
  qualiteInfluence: 'AUTRE',
}

const BRUNEL = {
  nom: 'Brunel',
  prenom: 'Jean-Luc',
  pays: 'France',
  nationalite: 'française',
  dateNaissance: new Date('1946-11-06'),
  rolePrincipal: 'Agent de mannequins',
  bio:
    "Agent de mannequins français (1946-2022), fondateur de l'agence MC2. Associé de longue date de Jeffrey Epstein, " +
    "qui a contribué à financer son agence. Mis en examen en France en décembre 2020 pour viols et traite d'êtres " +
    "humains, il est mort en détention à la prison de la Santé le 19 février 2022, avant tout jugement (présumé innocent).",
  wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Luc_Brunel',
  wikidataId: 'Q74631975',
  qualiteInfluence: 'DIRIGEANT',
}

const LIENS = [
  {
    aRef: 'Q74631975',
    bRef: 'Q2904131',
    typeLienCode: 'economique',
    description:
      "Jean-Luc Brunel, agent de mannequins, était un associé de longue date de Jeffrey Epstein, " +
      "qui a contribué à financer son agence MC2 (selon Mediapart, 15 février 2026, et sources publiques).",
    dateDebut: null,
    sourceRef: 'mp_brunel',
  },
]

async function main() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) throw new Error('Utilisateur admin introuvable — lancer npm run db:seed')

  const upPers = async (d) =>
    (await prisma.personne.findFirst({ where: { wikidataId: d.wikidataId } })) ||
    prisma.personne.create({ data: { ...d, statut: 'EN_ATTENTE', creeParId: user.id } })
  const upSrc = async (d) =>
    (await prisma.source.findFirst({ where: { url: d.url } })) ||
    prisma.source.create({ data: { ...d, creeParId: user.id } })

  const eps = await upPers(EPSTEIN)
  const bru = await upPers(BRUNEL)
  const srcMap = {}
  for (const [k, v] of Object.entries(SOURCES)) srcMap[k] = await upSrc(v)

  // --- Volet Jack Lang (nœud créé par seed-jack-lang.js) : statut procédural attribué ---
  const lang = await prisma.personne.findFirst({ where: { wikidataId: 'Q379229' } })
  if (lang) {
    // 1. Démission IMA : dater la fin du mandat DIRIGEANT existant
    const ima = await prisma.organisation.findFirst({ where: { wikidataId: 'Q860166' } })
    const tDir = await prisma.typeLien.findUnique({ where: { code: 'DIRIGEANT' } })
    if (ima && tDir) {
      const lienIma = await prisma.lien.findFirst({
        where: { personneAId: lang.id, organisationBId: ima.id, typeLienId: tDir.id },
      })
      if (lienIma && !lienIma.dateFin) {
        await prisma.lien.update({
          where: { id: lienIma.id },
          data: {
            dateFin: new Date('2026-02-07'),
            description:
              "Jack Lang a présidé l'Institut du monde arabe de 2013 à sa démission, annoncée le 7 février 2026 (Mediapart).",
            sourceId: srcMap.mp_lang_demission.id,
          },
        })
      }
    }
    // 2. Lien Lang ↔ Epstein : enquête ouverte, strictement attribué, présomption d'innocence
    const tJur = await prisma.typeLien.findUnique({ where: { code: 'juridique' } })
    const dejaLE = await prisma.lien.findFirst({
      where: { personneAId: lang.id, personneBId: eps.id, typeLienId: tJur.id },
    })
    if (!dejaLE) {
      await prisma.lien.create({
        data: {
          personneAId: lang.id,
          personneBId: eps.id,
          typeLienId: tJur.id,
          dateDebut: new Date('2026-02-01'),
          description:
            "Selon Mediapart et Le Monde (février 2026), la justice a ouvert une enquête portant sur des flux financiers liés à Jeffrey Epstein et à la famille Lang. Jack Lang bénéficie de la présomption d'innocence ; aucune condamnation. Il a démissionné de la présidence de l'IMA le 7 février 2026.",
          sourceId: srcMap.mp_lang_enquete.id,
          statut: 'EN_ATTENTE',
          creeParId: user.id,
        },
      })
    }
  }

  let liens = 0
  for (const l of LIENS) {
    const a = await prisma.personne.findFirst({ where: { wikidataId: l.aRef } })
    const b = await prisma.personne.findFirst({ where: { wikidataId: l.bRef } })
    const typeLien = await prisma.typeLien.findUnique({ where: { code: l.typeLienCode } })
    const existing = await prisma.lien.findFirst({
      where: { personneAId: a.id, personneBId: b.id, typeLienId: typeLien.id },
    })
    if (existing) continue
    await prisma.lien.create({
      data: {
        personneAId: a.id,
        personneBId: b.id,
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
  console.log(`-- Epstein cluster : Epstein ${eps.id ? 'ok' : ''}, Brunel ok, ${liens} lien(s) --`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('ERREUR seed-epstein-cluster:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
