/**
 * Seed Martinique — réseau d'influence territorial.
 *
 * Périmètre : Collectivité Territoriale de Martinique (CTM), Conseil exécutif,
 *             maires des deux premières communes, Groupe Bernard Hayot (GBH),
 *             presse (France-Antilles), parti PPM.
 *
 * Sources : Wikidata (Q-ids tous vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR, France24, La1ère / France Info.
 *
 * Garde-fous projet :
 *   - toutes les entités en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne et organisation
 *   - idempotent (upsert par wikidataId)
 *   - présomption d'innocence préservée sur l'affaire Letchimy (condamné 1re instance,
 *     appel en cours, jugement non définitif au 2026-07-02)
 *   - Lucien Cantame (président Assemblée) exclu : aucun Q-id Wikidata trouvé
 *   - Stéphane Hayot (CEO actuel GBH) exclu : aucun Q-id Wikidata trouvé
 *   - Chlordécone : non-lieu confirmé en appel (2024), pourvoi Cour de cassation en cours ;
 *     aucun défendeur nominatif avec Q-id → documenté en source uniquement, pas en lien
 *
 * Usage :
 *   cd backend && node bin/seed-region-martinique.js
 *   cd backend && node bin/seed-region-martinique.js --reset
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
    // Sources : Wikidata Q608242 + Wikipédia FR + France24 (condamnation 2026-02-19)
    nom: 'Letchimy',
    prenom: 'Serge',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1953-01-13'),
    lieuNaissance: 'Gros-Morne (Martinique)',
    rolePrincipal: 'Président du Conseil exécutif de la Collectivité Territoriale de Martinique',
    rolesSecondaires: [
      'ancien maire de Fort-de-France (2001-2010)',
      'ancien député de Martinique (3e circ., 2007-2022)',
      'ancien président du Conseil régional de Martinique (2010-2015)',
      'membre du Parti Progressiste Martiniquais (PPM)',
    ],
    bio:
      "Urbaniste de formation, élu de la 3e circonscription de Martinique (2007-2022), " +
      "Serge Letchimy préside le Conseil exécutif de la CTM depuis le 2 juillet 2021. " +
      "Il a été condamné le 19 février 2026 par le tribunal correctionnel de Paris pour " +
      "concussion (18 mois de prison avec sursis, 5 ans d'inéligibilité, 150 000 € d'amende) " +
      "dans le cadre d'une réintégration contestée à la ville de Fort-de-France en 2016. " +
      "Il a fait appel ; la décision n'est pas définitive — présomption d'innocence maintenue.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Serge_Letchimy',
    wikidataId: 'Q608242',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q16628764 + Wikipédia FR
    nom: 'Laguerre',
    prenom: 'Didier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-01-10'),
    lieuNaissance: 'Fort-de-France (Martinique)',
    rolePrincipal: 'Maire de Fort-de-France',
    rolesSecondaires: [
      'conseiller territorial de Martinique',
      'maire depuis le 23 mars 2014',
    ],
    bio:
      "Didier Laguerre est maire de Fort-de-France depuis les élections municipales de mars 2014, " +
      "réélu en mai 2020 et mars 2026. Fort-de-France est la préfecture et la commune " +
      "la plus peuplée de Martinique (~77 000 habitants).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Didier_Laguerre',
    wikidataId: 'Q16628764',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q65606828 + Wikipédia FR
    nom: 'Zobda',
    prenom: 'David',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1959-05-01'),
    lieuNaissance: null,
    rolePrincipal: 'Maire de Le Lamentin',
    rolesSecondaires: [
      'conseiller régional de Martinique',
      'conseiller territorial de Martinique',
      'maire depuis le 20 novembre 2018',
    ],
    bio:
      "David Zobda est maire de Le Lamentin, deuxième commune de Martinique par la population " +
      "(~39 000 habitants), depuis le 20 novembre 2018, réélu en mai 2020 et mars 2026. " +
      "Il est également conseiller territorial à la CTM.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/David_Zobda',
    wikidataId: 'Q65606828',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2898044 + Wikipédia FR (article GBH + article Bernard Hayot)
    // Note : né le 18 octobre 1934 (source Wikipédia) — son fils Stéphane Hayot est
    //        directeur général en exercice (aucun Q-id Wikidata → exclu du seed per règle).
    nom: 'Hayot',
    prenom: 'Bernard',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1934-10-18'),
    lieuNaissance: 'Martinique',
    rolePrincipal: 'Fondateur et président honoraire du Groupe Bernard Hayot (GBH)',
    rolesSecondaires: [
      'béké, héritier de familles de planteurs martiniquais',
      'fondateur du GBH en 1960 (aviculture, distribution, rhum)',
    ],
    bio:
      "Bernard Hayot a fondé le Groupe Bernard Hayot (GBH) en 1960, à partir de l'aviculture, " +
      "puis la distribution (Carrefour aux Antilles), l'automobile et les spiritueux. " +
      "Le groupe réalise 5,27 Md€ de CA en 2025 et emploie plus de 13 000 personnes " +
      "dans les DOM-COM et l'international. Son fils Stéphane Hayot assure la direction " +
      "générale opérationnelle (DG sans Q-id Wikidata).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bernard_Hayot',
    wikidataId: 'Q2898044',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q19543847 + Wikipédia FR
    nom: 'Collectivité Territoriale de Martinique',
    sigle: 'CTM',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.collectivitedemartinique.mq',
    description:
      "Institution unique créée par la loi du 27 juillet 2011 (entrée en vigueur le 18 décembre 2015) " +
      "fusionnant le Conseil général et le Conseil régional de Martinique. " +
      "Organisée en deux organes : l'Assemblée de Martinique (législatif, 51 conseillers) " +
      "et le Conseil exécutif (exécutif, 9 membres, présidé par Serge Letchimy depuis 2021). " +
      "A porté le dossier chlordécone au niveau national (contamination des sols 1973-1993 ; " +
      "non-lieu confirmé en appel en 2024, pourvoi en cassation des 500+ parties civiles en cours).",
    dateCreation: new Date('2015-12-18'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Collectivit%C3%A9_territoriale_de_Martinique',
    wikidataId: 'Q19543847',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3117340 + Wikipédia FR (article GBH) + gbh.fr
    nom: 'Groupe Bernard Hayot',
    sigle: 'GBH',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.gbh.fr',
    description:
      "Conglomérat privé fondé en 1960 par Bernard Hayot, tête du groupe de distribution " +
      "le plus puissant des Antilles-Guyane. Actif dans la grande distribution (Carrefour), " +
      "l'automobile (concessionnaires), les spiritueux (rhum Depaz) et la logistique. " +
      "CA 2025 : 5,27 Md€. Plus de 13 000 collaborateurs en outre-mer et à l'international. " +
      "Contrôlé par la famille Hayot (béké martiniquais).",
    dateCreation: new Date('1960-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Groupe_Bernard_Hayot',
    wikidataId: 'Q3117340',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q944000 + Wikipédia FR
    nom: 'Parti Progressiste Martiniquais',
    sigle: 'PPM',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Parti politique martiniquais fondé le 22 mars 1958 par Aimé Césaire. " +
      "Héritier du mouvement de décolonisation culturelle, il défend l'autonomie de la Martinique " +
      "dans la République française. Figure actuelle dominante : Serge Letchimy.",
    dateCreation: new Date('1958-03-22'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Parti_progressiste_martiniquais',
    wikidataId: 'Q944000',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q81621 + Wikipédia FR
    nom: 'Fort-de-France',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.fortdefrance.fr',
    description:
      "Commune chef-lieu et préfecture de la Martinique, la plus peuplée de l'île " +
      "(~77 000 habitants). Siège de la CTM, du tribunal de Pointe-à-Pitre, " +
      "de la préfecture. Anciennement dirigée par Serge Letchimy (2001-2010).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fort-de-France',
    wikidataId: 'Q81621',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q947069 + Wikipédia FR
    nom: 'Le Lamentin',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Deuxième commune de Martinique par la population (~39 000 habitants), " +
      "accueillant l'aéroport international Aimé-Césaire. Zone industrielle et " +
      "commerciale majeure de l'île.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Le_Lamentin_(Martinique)',
    wikidataId: 'Q947069',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3080535 + Wikipédia FR + franceantilles.fr
    nom: 'France-Antilles',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.franceantilles.fr',
    description:
      "Quotidien régional de référence en Martinique (et Guadeloupe sous édition locale). " +
      "Principale presse écrite d'information générale de l'île, couvrant l'actualité " +
      "politique, économique et sociale martiniquaise, dont la CTM et les affaires judiciaires.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/France-Antilles',
    wikidataId: 'Q3080535',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_letchimy: {
    url: 'https://fr.wikipedia.org/wiki/Serge_Letchimy',
    titre: 'Serge Letchimy — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-25'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Biographie de Serge Letchimy : urbaniste, député 2007-2022, président CTM depuis 2021-07-02. ' +
      'Condamné le 2026-02-19 pour concussion, appel en cours.',
    verifiee: true,
  },
  france24_letchimy: {
    url: 'https://www.france24.com/fr/info-en-continu/20260219-le-chef-de-l-ex%C3%A9cutif-martiniquais-serge-letchimy-condamn%C3%A9-%C3%A0-18-mois-de-prison-avec-sursis-pour-concussion',
    titre:
      "Le chef de l'exécutif martiniquais Serge Letchimy condamné à 18 mois de prison avec sursis pour concussion",
    media: 'France 24',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-02-19'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction France 24',
    description:
      'Condamnation en première instance du président du Conseil exécutif de Martinique pour concussion ' +
      '(18 mois sursis, 5 ans inéligibilité, 150 000 € amende). Appel en cours — non définitif.',
    verifiee: true,
  },
  la1ere_letchimy_appel: {
    url: 'https://la1ere.franceinfo.fr/condamne-pour-concussion-par-le-tribunal-correctionnel-de-paris-serge-letchimy-fait-appel-et-reste-en-fonction-1673331.html',
    titre:
      "Condamné pour concussion, Serge Letchimy fait appel et reste en fonction",
    media: 'La 1ère / France Info',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-02-20'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction La 1ère',
    description:
      "L'appel ayant effet suspensif, Letchimy maintenu en fonction. Il dénonce un 'harcèlement judiciaire'.",
    verifiee: true,
  },
  wp_laguerre: {
    url: 'https://fr.wikipedia.org/wiki/Didier_Laguerre',
    titre: 'Didier Laguerre — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-03-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description: 'Biographie de Didier Laguerre, maire de Fort-de-France depuis 2014.',
    verifiee: true,
  },
  wp_zobda: {
    url: 'https://fr.wikipedia.org/wiki/David_Zobda',
    titre: 'David Zobda — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-03-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description: 'Biographie de David Zobda, maire de Le Lamentin depuis 2018.',
    verifiee: true,
  },
  wp_gbh: {
    url: 'https://fr.wikipedia.org/wiki/Groupe_Bernard_Hayot',
    titre: 'Groupe Bernard Hayot — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-05-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'GBH : fondé 1960 par Bernard Hayot, CA 5,27 Md€ en 2025, 13 000+ salariés, ' +
      'distribution (Carrefour), auto, rhum Depaz, logistique.',
    verifiee: true,
  },
  wp_hayot: {
    url: 'https://fr.wikipedia.org/wiki/Bernard_Hayot',
    titre: 'Bernard Hayot — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-05-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Bernard Hayot, né 1934, fondateur du GBH. Béké martiniquais, famille de planteurs. ' +
      'Son fils Stéphane Hayot est DG opérationnel.',
    verifiee: true,
  },
  wp_ppm: {
    url: 'https://fr.wikipedia.org/wiki/Parti_progressiste_martiniquais',
    titre: 'Parti progressiste martiniquais — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-04-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description: 'PPM fondé par Aimé Césaire en 1958. Autonomisme martiniquais, Letchimy figure actuelle.',
    verifiee: true,
  },
  wp_ctm: {
    url: 'https://fr.wikipedia.org/wiki/Collectivit%C3%A9_territoriale_de_Martinique',
    titre: 'Collectivité territoriale de Martinique — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'CTM : institution unique (loi 2011, en vigueur 2015), fusion Conseil général + Conseil régional.',
    verifiee: true,
  },
  la1ere_chlordecone: {
    url: 'https://la1ere.franceinfo.fr/guadeloupe/affaire-du-chlordecone-en-guadeloupe-et-en-martinique-plus-de-500-parties-civiles-contestent-le-non-lieu-devant-la-cour-de-cassation-1715698.html',
    titre:
      "Affaire du chlordécone : plus de 500 parties civiles contestent le non-lieu devant la Cour de cassation",
    media: 'La 1ère / France Info',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-01-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction La 1ère',
    description:
      'Non-lieu prononcé en janvier 2023, confirmé en appel (Paris, 2024). ' +
      '500+ parties civiles se pourvoient en cassation. Aucun condamné à ce jour.',
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — polymorphe (ADR-002). Exactement 1 entité non-nulle de chaque côté.
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Letchimy : mandat exécutif CTM ---
  {
    aType: 'personne',
    aRef: 'Q608242',
    bType: 'organisation',
    bRef: 'Q19543847',
    typeLienCode: 'DIRIGEANT',
    description:
      "Serge Letchimy préside le Conseil exécutif de la CTM depuis le 2 juillet 2021, " +
      "après la victoire du PPM aux élections territoriales de juin 2021.",
    dateDebut: new Date('2021-07-02'),
    dateFin: null,
    sourceRef: 'wp_letchimy',
  },

  // --- Letchimy : affiliation PPM ---
  {
    aType: 'personne',
    aRef: 'Q608242',
    bType: 'organisation',
    bRef: 'Q944000',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Serge Letchimy est membre et figure de proue du Parti Progressiste Martiniquais (PPM), " +
      "fondé par Aimé Césaire en 1958.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_letchimy',
  },

  // --- Letchimy : lien judiciaire — concussion Fort-de-France
  // ⚠️ Condamné en PREMIÈRE INSTANCE le 2026-02-19 pour concussion.
  // Appel en cours au 2026-07-02 → jugement NON DÉFINITIF.
  // Présomption d'innocence maintenue. Intensite réduite à 1.
  {
    aType: 'personne',
    aRef: 'Q608242',
    bType: 'organisation',
    bRef: 'Q81621',
    typeLienCode: 'juridique',
    description:
      "⚠️ STATUT JUDICIAIRE PROVISOIRE — Serge Letchimy a été condamné en première instance " +
      "le 19 février 2026 par le tribunal correctionnel de Paris pour concussion liée " +
      "à sa réintégration comme ingénieur territorial à la mairie de Fort-de-France (2016). " +
      "Peine : 18 mois de prison avec sursis, 5 ans d'inéligibilité, 150 000 € d'amende. " +
      "Il a fait appel ; la décision n'est pas définitive — PRÉSOMPTION D'INNOCENCE MAINTENUE.",
    dateDebut: new Date('2026-02-19'),
    dateFin: null,
    sourceRef: 'france24_letchimy',
  },

  // --- Laguerre : mandat électif Fort-de-France ---
  {
    aType: 'personne',
    aRef: 'Q16628764',
    bType: 'organisation',
    bRef: 'Q81621',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Didier Laguerre est maire de Fort-de-France depuis le 23 mars 2014, " +
      "réélu en mai 2020 et mars 2026.",
    dateDebut: new Date('2014-03-23'),
    dateFin: null,
    sourceRef: 'wp_laguerre',
  },

  // --- Zobda : mandat électif Le Lamentin ---
  {
    aType: 'personne',
    aRef: 'Q65606828',
    bType: 'organisation',
    bRef: 'Q947069',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "David Zobda est maire de Le Lamentin depuis le 20 novembre 2018 " +
      "(nommé lors d'une démission de son prédécesseur), réélu en mai 2020 et mars 2026.",
    dateDebut: new Date('2018-11-20'),
    dateFin: null,
    sourceRef: 'wp_zobda',
  },

  // --- Bernard Hayot : fondateur GBH ---
  {
    aType: 'personne',
    aRef: 'Q2898044',
    bType: 'organisation',
    bRef: 'Q3117340',
    typeLienCode: 'FONDATEUR',
    description:
      "Bernard Hayot a fondé le Groupe Bernard Hayot en 1960, initialement axé sur " +
      "l'aviculture, diversifié ensuite dans la distribution, l'automobile, les spiritueux " +
      "et la logistique. Son fils Stéphane Hayot assure aujourd'hui la direction générale.",
    dateDebut: new Date('1960-01-01'),
    dateFin: null,
    sourceRef: 'wp_gbh',
  },

  // --- GBH : présence économique dominante en Martinique (lien avec CTM) ---
  {
    aType: 'organisation',
    aRef: 'Q3117340',
    bType: 'organisation',
    bRef: 'Q19543847',
    typeLienCode: 'economique',
    description:
      "Le Groupe Bernard Hayot (GBH) est le premier employeur privé de Martinique " +
      "(grande distribution, automobile, rhum Depaz). Sa présence structurante " +
      "(Carrefour Martinique, concessions auto, logistique) en fait un acteur incontournable " +
      "dans les relations entre secteur privé béké et collectivité territoriale.",
    dateDebut: new Date('1960-01-01'),
    dateFin: null,
    sourceRef: 'wp_gbh',
  },

  // --- France-Antilles : média de couverture de la CTM ---
  {
    aType: 'organisation',
    aRef: 'Q3080535',
    bType: 'organisation',
    bRef: 'Q19543847',
    typeLienCode: 'mediatique',
    description:
      "France-Antilles est le principal quotidien régional couvrant l'actualité de la CTM, " +
      "des élections territoriales et des affaires politiques martiniquaises, " +
      "dont les procédures judiciaires (chlordécone, concussion Letchimy).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_ctm',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-martinique] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-martinique] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression des données Martinique précédentes...')
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
  console.log('Donnees precedentes supprimees.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n--- seed-region-martinique — Reseau d\'influence territorial ---\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`OK User : ${user.email}\n`)

  console.log('-- Sources publiques --')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  OK ${data.titre}`)
  }

  console.log('\n-- Personnes (Wikidata verifie) --')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  OK ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n-- Organisations (Wikidata verifie) --')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  OK ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n-- Liens --')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  OK ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n--- Bilan ---')
  console.log(`  Personnes     : ${PERSONNES.length} (Letchimy, Laguerre, Zobda, B. Hayot)`)
  console.log(
    `  Organisations : ${ORGANISATIONS.length} (CTM, GBH, PPM, Fort-de-France, Le Lamentin, France-Antilles)`,
  )
  console.log(`  Sources       : ${Object.keys(SOURCES).length} (Wikipedia, France24, La 1ere)`)
  console.log(`  Liens         : ${LIENS.length} (DIRIGEANT, AFFILIATION_PARTI, juridique, MANDAT_ELECTIF, FONDATEUR, economique, mediatique)`)
  console.log('  Exclus (pas de Q-id Wikidata) : Lucien Cantame, Stephane Hayot')
  console.log('  Chlordecone : non-lieu confirme appel 2024 ; pourvoi cassation en cours — aucun condamne\n')
}

main()
  .catch((err) => {
    console.error('[seed-martinique] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
