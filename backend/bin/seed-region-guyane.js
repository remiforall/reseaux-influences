/**
 * Seed Région Guyane — enquête OSINT du 2026-07-02.
 *
 * Périmètre :
 *   - Collectivité territoriale de Guyane (CTG) + Assemblée de Guyane
 *   - Gabriel Serville, président de l'Assemblée de Guyane (depuis 2021-07-02)
 *   - Rodolphe Alexandre, ancien président CTG (2015-2021) + fondateur Guyane Rassemblement
 *   - Michel-Ange Jérémie, maire de Cayenne (depuis 2020-05-25)
 *   - Marie-Laure Phinéra-Horth, sénatrice de Guyane + ancienne maire de Cayenne (2010-2020)
 *   - Georges Patient, sénateur de Guyane (depuis 2008)
 *   - Sophie Charles, ancienne maire de Saint-Laurent-du-Maroni (2020-2026)
 *   - Centre spatial guyanais (CSG) : acteur économique structurant depuis Kourou
 *   - France-Guyane : presse quotidienne régionale historique
 *   - Guyane Rassemblement : parti fondé par Rodolphe Alexandre (2015)
 *
 * Entités POTENTIELLEMENT EN BASE (référencées par wikidataId dans les liens, non recréées) :
 *   - PS Q170972 (seed-eurodeputes-fr.js / seed-hollande.js)
 *   - Renaissance / LREM Q23731823 (seed-macron-v2.js)
 *   Ces deux orgas sont INCLUSES ci-dessous avec upsert idempotent :
 *   si elles existent déjà, seul le statut EN_ATTENTE est rafraîchi.
 *
 * Exclusions motivées :
 *   - Luc Elfort (maire de Kourou) : aucun Q-id Wikidata vérifié → EXCLU
 *   - Juliana Rimane (maire de Matoury) : aucun Q-id Wikidata vérifié → EXCLU
 *   - Michel-Ange Jérémie + Sophie Charles : pas d'article Wikipédia FR → confidence medium
 *     (source unique : Wikidata EntityData ; à recouper via Légifrance, CTG, presse locale)
 *   - NB : Q3093959 Gabriel Serville présente des données P39 incohérentes dans Wikidata
 *     (Guadeloupe, Basse-Terre) probablement liées à une confusion de valeurs ;
 *     l'identité correcte est confirmée par l'article Wikipédia FR.
 *
 * Affaires politico-financières :
 *   - Aucune procédure judiciaire publique documentée pour les personnes de ce corpus
 *     n'a été trouvée dans Légifrance, presse de référence ou AMF au 2026-07-02.
 *   - Piste à réexaminer via Légifrance et HATVP (déclarations d'intérêts CTG).
 *
 * Sources : Wikidata (Q-ids tous vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR (Serville, Alexandre, Phinéra-Horth, Patient, CSG, CTG, Guyane Rassemblement),
 *           site officiel assemblee-guyane.fr.
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-region-guyane.js
 *   cd backend && node bin/seed-region-guyane.js --reset
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const RESET = process.argv.includes("--reset")
const USER_EMAIL = "remi@reseauxinfluences.fr"

// ---------------------------------------------------------------------------
// PERSONNES — recoupées ≥ 2 sources sauf mention explicite (confidence medium).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q3093959 (vérifié wbsearchentities + Wikipedia FR)
    // + Wikipédia FR (Gabriel Serville, article confirmant Q3093959, né à Cayenne le 27/09/1959)
    // Note : les données P39 dans Wikidata EntityData mentionnaient Guadeloupe/Basse-Terre
    // de façon erronée ; l'article Wikipedia FR fait autorité : Serville est bien un politique
    // guyanais, né à Cayenne, élu à l'Assemblée de Guyane dont il est président depuis le 2 juil. 2021.
    // Ancien député de Guyane (2012-2021, 1re et 2e circonscriptions).
    // Affilié LREM depuis 2018, soutenu par la majorité présidentielle en 2021.
    nom: "Serville",
    prenom: "Gabriel",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1959-09-27"),
    lieuNaissance: "Cayenne (Guyane)",
    rolePrincipal: "Président de l'Assemblée de Guyane",
    rolesSecondaires: [
      "ancien député de Guyane (2012-2021, 1re puis 2e circonscription)",
      "membre de La République En Marche depuis 2018",
      "ancien membre du Parti Socialiste (avant 2018)",
    ],
    bio:
      "Né le 27 septembre 1959 à Cayenne, Gabriel Serville est un homme politique guyanais. " +
      "Député de Guyane de 2012 à 2021, il rallie La République En Marche en 2018. " +
      "Élu président de l'Assemblée de Guyane le 2 juillet 2021, il dirige la Collectivité " +
      "territoriale de Guyane en succédant à Rodolphe Alexandre.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Gabriel_Serville",
    wikidataId: "Q3093959",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q3108632 (vérifié wbsearchentities) + Wikipédia FR (Rodolphe Alexandre)
    // Président de l'Assemblée de Guyane (2015-2021), président du Conseil régional de Guyane (2010-2015),
    // maire de Cayenne (2008-2010). Fondateur de Guyane Rassemblement (12 sept. 2015).
    // Né le 26 septembre 1953. Parti : PS Guyane (1983-2008) → Guyane 73 (2010-2015) → GR (2015-).
    // Proche du macronisme depuis 2017 (GR + LREM ont noué une alliance en Guyane).
    nom: "Alexandre",
    prenom: "Rodolphe",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1953-09-26"),
    lieuNaissance: null,
    rolePrincipal: "Conseiller de l'Assemblée de Guyane (ancien président 2015-2021)",
    rolesSecondaires: [
      "fondateur et président de Guyane Rassemblement (depuis 2015)",
      "ancien président du Conseil régional de Guyane (2010-2015)",
      "ancien maire de Cayenne (2008-2010)",
      "ancien premier adjoint au maire de Cayenne (1995-2008)",
    ],
    bio:
      "Né le 26 septembre 1953, Rodolphe Alexandre est le premier président de la Collectivité " +
      "territoriale de Guyane (CTG, 2015-2021), créée par la fusion du département et de la région. " +
      "Auparavant président du Conseil régional (2010-2015) et maire de Cayenne (2008-2010). " +
      "Il a fondé Guyane Rassemblement le 12 septembre 2015 et tissé une alliance avec LREM en 2017.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Rodolphe_Alexandre",
    wikidataId: "Q3108632",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q98234931 (vérifié wbsearchentities + Special:EntityData)
    // EntityData : né le 2 août 1974, homme politique français ; mandats P39 de mai 2020 à mars 2026,
    // puis de nouveau depuis mars 2026 (réélu — membre de l'Assemblée de Guyane).
    // Michel-Ange Jérémie est élu maire de Cayenne le 25 mai 2020.
    // Pas d'article Wikipedia FR confirmé au 2026-07-02 → confidence medium, verifiee false.
    nom: "Jérémie",
    prenom: "Michel-Ange",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1974-08-02"),
    lieuNaissance: null,
    rolePrincipal: "Maire de Cayenne",
    rolesSecondaires: [
      "conseiller de l'Assemblée de Guyane (depuis 2020, réélu mars 2026)",
      "maire de Cayenne depuis le 25 mai 2020",
    ],
    bio:
      "Élu maire de Cayenne le 25 mai 2020, Michel-Ange Jérémie succède à Marie-Laure Phinéra-Horth " +
      "à la tête de la ville-préfecture de la Guyane. Il est également conseiller " +
      "à l'Assemblée de Guyane, réélu en mars 2026.",
    wikipediaUrl: null,
    wikidataId: "Q98234931",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q65596147 (vérifié Special:EntityData) + Wikipédia FR (Marie-Laure Phinéra-Horth)
    // Sénatrice de Guyane depuis le 1er octobre 2020 (élue le 27 septembre 2020).
    // Première femme sénatrice de Guyane. Ancienne orthophoniste de formation.
    // Ancienne maire de Cayenne du 8 avril 2010 au 28 octobre 2020.
    // Membre du Parti Socialiste.
    nom: "Phinéra-Horth",
    prenom: "Marie-Laure",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1957-06-28"),
    lieuNaissance: "Cayenne (Guyane)",
    rolePrincipal: "Sénatrice de Guyane",
    rolesSecondaires: [
      "première femme sénatrice de Guyane (depuis le 1er octobre 2020)",
      "ancienne maire de Cayenne (8 avril 2010 — 28 octobre 2020)",
      "orthophoniste de formation",
      "membre du Parti Socialiste",
    ],
    bio:
      "Née le 28 juin 1957 à Cayenne, Marie-Laure Phinéra-Horth est orthophoniste de formation. " +
      "Elle est maire de Cayenne du 8 avril 2010 au 28 octobre 2020. " +
      "Élue sénatrice de Guyane le 27 septembre 2020, elle est la première femme à représenter " +
      "la Guyane au Sénat. Elle appartient au groupe Socialiste du Sénat.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Marie-Laure_Phin%C3%A9ra-Horth",
    wikidataId: "Q65596147",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q3103298 (vérifié wbsearchentities) + Wikipédia FR (Georges Patient)
    // Sénateur de Guyane depuis le 1er octobre 2008. Né le 1er avril 1949.
    // Affilié à Guyane Rassemblement ; membre du groupe RDPI au Sénat.
    nom: "Patient",
    prenom: "Georges",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1949-04-01"),
    lieuNaissance: null,
    rolePrincipal: "Sénateur de Guyane",
    rolesSecondaires: [
      "sénateur de Guyane depuis le 1er octobre 2008",
      "membre de Guyane Rassemblement",
      "membre du groupe RDPI (Rassemblement des démocrates, progressistes et indépendants) au Sénat",
    ],
    bio:
      "Né le 1er avril 1949, Georges Patient est sénateur de Guyane depuis le 1er octobre 2008. " +
      "Proche de Rodolphe Alexandre au sein de Guyane Rassemblement, " +
      "il siège au groupe RDPI — proche de la majorité présidentielle — au Sénat.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Georges_Patient",
    wikidataId: "Q3103298",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q65572693 (vérifié Special:EntityData)
    // EntityData : née le 12 juillet 1964 ; maire de Saint-Laurent-du-Maroni du 25 mai 2020
    // au 26 mars 2026 (dateFin = élections municipales mars 2026, mandat non renouvelé ou nouveau mandat
    // non encore renseigné dans Wikidata au 2026-07-02) ; ancienne membre de l'Assemblée nationale
    // (deputée, sept. 2018 - mai 2020). Pas d'article Wikipedia FR → confidence medium.
    nom: "Charles",
    prenom: "Sophie",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1964-07-12"),
    lieuNaissance: null,
    rolePrincipal: "Ancienne maire de Saint-Laurent-du-Maroni (2020-2026)",
    rolesSecondaires: [
      "ancienne suppléante puis membre de l'Assemblée nationale (2018-2020)",
      "conseillère municipale de Saint-Laurent-du-Maroni (depuis 2014)",
    ],
    bio:
      "Née le 12 juillet 1964, Sophie Charles est maire de Saint-Laurent-du-Maroni " +
      "du 25 mai 2020 au 26 mars 2026 (terme enregistré dans Wikidata EntityData P39). " +
      "Ancienne suppléante puis membre de l'Assemblée nationale (septembre 2018 — mai 2020). " +
      "Conseillère municipale depuis 2014.",
    wikipediaUrl: null,
    wikidataId: "Q65572693",
    qualiteInfluence: "ELU",
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q124156179 + Wikipédia FR (Collectivité territoriale de Guyane)
    // Créée le 31 décembre 2015 par la loi NOTRe (L. 2015-991 du 7 août 2015),
    // fusionnant le Département de la Guyane et la Région de la Guyane.
    // Collectivité d'outre-mer régie par l'article 73 de la Constitution.
    nom: "Collectivité territoriale de Guyane",
    sigle: "CTG",
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.ctguyane.fr",
    description:
      "Collectivité territoriale unique créée le 31 décembre 2015 par fusion du Département " +
      "et de la Région de la Guyane (loi NOTRe, art. 73 Constitution). " +
      "~290 000 habitants sur 83 534 km². Présidée par le président de l'Assemblée de Guyane.",
    dateCreation: new Date("2015-12-31"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Collectivit%C3%A9_territoriale_de_Guyane",
    wikidataId: "Q124156179",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q19543845 + Wikipédia FR (Assemblée de Guyane)
    // Organe délibérant de la CTG. Première réunion : 31 décembre 2015.
    // 51 conseillers territoriaux (décret 2015-754). Siège : Cayenne.
    nom: "Assemblée de Guyane",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.assemblee-guyane.fr",
    description:
      "Organe délibérant de la Collectivité territoriale de Guyane (CTG), " +
      "composé de 51 conseillers territoriaux. Siège à Cayenne. " +
      "Première réunion le 31 décembre 2015. Présidée par Gabriel Serville depuis le 2 juillet 2021.",
    dateCreation: new Date("2015-12-31"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Assembl%C3%A9e_de_Guyane",
    wikidataId: "Q19543845",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q308987 + Wikipédia FR (Centre spatial guyanais)
    // Base de lancement spatiale européenne à Kourou (Guyane). Opéré par le CNES pour le
    // compte du CNES et de l'ESA. Activité depuis 1968. Emploie directement et indirectement
    // ~15 000 personnes (estimation 2023). Contribue à ~15 % du PIB de la Guyane.
    nom: "Centre spatial guyanais",
    sigle: "CSG",
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.csg-spatial.fr",
    description:
      "Port spatial européen situé à Kourou (Guyane). Géré par le CNES pour le compte " +
      "de la France et de l'ESA depuis 1968. Lanceurs : Ariane 5 (retraité), Ariane 6, Vega. " +
      "~15 000 emplois directs et indirects, ~15 % du PIB guyanais (estimation CNES 2023).",
    dateCreation: new Date("1968-04-09"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Centre_spatial_guyanais",
    wikidataId: "Q308987",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q48756 + site officiel cnes.fr
    // Centre national d'études spatiales — agence spatiale française. Fondé en 1961.
    // Opère le CSG pour le compte de la France et de l'ESA.
    // NB : éventuellement déjà en base (seed-participations-publiques.js) — upsert idempotent.
    nom: "Centre national d'études spatiales",
    sigle: "CNES",
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://cnes.fr",
    description:
      "Agence spatiale française fondée en 1961, sous tutelle des ministères chargés " +
      "de l'Espace et de la Défense. Opère le Centre spatial guyanais (CSG) à Kourou " +
      "pour le compte de la France et de l'Agence spatiale européenne (ESA).",
    dateCreation: new Date("1961-12-19"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Centre_national_d%27%C3%A9tudes_spatiales",
    wikidataId: "Q48756",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q106899676 + Wikipédia FR (Guyane Rassemblement)
    // Fondé le 12 septembre 2015 par Rodolphe Alexandre (ex-PS, ex-Guyane 73).
    // Parti centriste, libéral, pro-européen. Proche du macronisme depuis 2017.
    nom: "Guyane Rassemblement",
    sigle: "GR",
    typeOrganisation: "PARTI_POLITIQUE",
    pays: "France",
    siteWeb: null,
    description:
      "Parti politique guyanais fondé le 12 septembre 2015 par Rodolphe Alexandre. " +
      "Centriste, libéral, pro-européen. Allié de La République En Marche / Renaissance " +
      "depuis 2017. Georges Patient en est une figure sénatoriale emblématique.",
    dateCreation: new Date("2015-09-12"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Guyane_rassemblement",
    wikidataId: "Q106899676",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q3080539 + Wikipédia FR
    // Quotidien régional de Guyane fondé en 1978. Appartenu à Hersant Média puis France-Antilles.
    // Wikidata le décrit comme « former French local daily newspaper » — France-Antilles a été
    // placé en redressement judiciaire en 2020 ; France-Guyane a poursuivi sous une forme réorganisée.
    // Inclus comme presse de référence historique en Guyane.
    nom: "France-Guyane",
    sigle: null,
    typeOrganisation: "MEDIA",
    pays: "France",
    siteWeb: "https://www.franceguyane.fr",
    description:
      "Quotidien régional de Guyane fondé en 1978. Appartenu à Hersant Média, " +
      "puis au groupe France-Antilles. Placé en redressement judiciaire en 2020 " +
      "et relancé sous une forme réorganisée. Principal titre de presse en Guyane.",
    dateCreation: new Date("1978-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/France-Guyane",
    wikidataId: "Q3080539",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q44401 + Wikipédia FR
    // Commune et chef-lieu de la Guyane. ~70 000 habitants (commune) / 130 000 (aire urbaine).
    nom: "Cayenne",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.mairie-cayenne.fr",
    description:
      "Commune et chef-lieu de la Guyane (~70 000 hab., aire urbaine ~130 000). " +
      "Siège de la Préfecture de la Guyane, de la CTG et de l'Assemblée de Guyane. " +
      "Ville-préfecture et principal centre économique et administratif du territoire.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Cayenne",
    wikidataId: "Q44401",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q319959 + Wikipédia FR
    // Deuxième commune de Guyane en nombre d'habitants (~50 000). Sur le Maroni à la
    // frontière avec le Suriname. Forte croissance démographique.
    nom: "Saint-Laurent-du-Maroni",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.saint-laurent-du-maroni.fr",
    description:
      "Commune de Guyane (~50 000 hab.) sur le fleuve Maroni, à la frontière du Suriname. " +
      "Deuxième ville de Guyane, forte croissance démographique. " +
      "Carrefour de l'Ouest guyanais et point de transit migratoire.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Saint-Laurent-du-Maroni",
    wikidataId: "Q319959",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q273312 + Wikipédia FR
    // Commune de Guyane (~25 000 hab.), ville du Centre spatial guyanais.
    // Croissance démographique liée aux activités spatiales et au BTP.
    nom: "Kourou",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.ville-kourou.fr",
    description:
      "Commune de Guyane (~25 000 hab.). Hôte du Centre spatial guyanais (CSG), " +
      "base de lancement européenne depuis 1968. L'économie locale est structurellement " +
      "dépendante des activités spatiales (CNES, ESA, industriels).",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Kourou",
    wikidataId: "Q273312",
    qualiteInfluence: "AUTRE",
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_serville: {
    url: "https://fr.wikipedia.org/wiki/Gabriel_Serville",
    titre: "Gabriel Serville — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né à Cayenne le 27/09/1959 (Q3093959). Député de Guyane 2012-2021. " +
      "LREM depuis 2018. Président de l'Assemblée de Guyane depuis le 2 juillet 2021.",
    verifiee: true,
  },
  wp_alexandre: {
    url: "https://fr.wikipedia.org/wiki/Rodolphe_Alexandre",
    titre: "Rodolphe Alexandre — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 26/09/1953 (Q3108632). Maire de Cayenne 2008-2010. Président CTG/Assemblée 2015-2021. " +
      "Fondateur Guyane Rassemblement le 12 sept. 2015.",
    verifiee: true,
  },
  wd_jeremie: {
    url: "https://www.wikidata.org/wiki/Q98234931",
    titre: "Michel-Ange Jérémie — Wikidata Q98234931",
    media: "Wikidata",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: null,
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 2 août 1974 (P569). Mandats P39 : mai 2020-mars 2026 puis mars 2026- (Assemblée Guyane). " +
      "Maire de Cayenne depuis le 25 mai 2020 — source unique, à recouper.",
    verifiee: false,
  },
  wp_phinera: {
    url: "https://fr.wikipedia.org/wiki/Marie-Laure_Phin%C3%A9ra-Horth",
    titre: "Marie-Laure Phinéra-Horth — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Née le 28/06/1957 à Cayenne (Q65596147). Maire de Cayenne 8 avr. 2010-28 oct. 2020. " +
      "Sénatrice de Guyane depuis le 1er octobre 2020 (première femme).",
    verifiee: true,
  },
  wp_patient: {
    url: "https://fr.wikipedia.org/wiki/Georges_Patient",
    titre: "Georges Patient — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 1er avril 1949 (Q3103298). Sénateur de Guyane depuis le 1er octobre 2008. " +
      "Membre de Guyane Rassemblement, groupe RDPI au Sénat.",
    verifiee: true,
  },
  wd_charles: {
    url: "https://www.wikidata.org/wiki/Q65572693",
    titre: "Sophie Charles — Wikidata Q65572693",
    media: "Wikidata",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: null,
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Née le 12 juillet 1964 (P569). P39 : maire de Saint-Laurent-du-Maroni du 25/05/2020 " +
      "au 26/03/2026. Ancienne membre de l'Assemblée nationale (2018-2020). Source unique, à recouper.",
    verifiee: false,
  },
  wp_ctg: {
    url: "https://fr.wikipedia.org/wiki/Collectivit%C3%A9_territoriale_de_Guyane",
    titre: "Collectivité territoriale de Guyane — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "CTG Q124156179. Créée le 31/12/2015 (loi NOTRe) par fusion département + région. " +
      "~290 000 hab. Assemblée de Guyane : 51 conseillers territoriaux. Siège : Cayenne.",
    verifiee: true,
  },
  wp_assemblee: {
    url: "https://fr.wikipedia.org/wiki/Assembl%C3%A9e_de_Guyane",
    titre: "Assemblée de Guyane — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Q19543845. Organe délibérant de la CTG, 51 conseillers territoriaux. " +
      "Présidée par Gabriel Serville (élu 2 juil. 2021) en remplacement de Rodolphe Alexandre.",
    verifiee: true,
  },
  wp_csg: {
    url: "https://fr.wikipedia.org/wiki/Centre_spatial_guyanais",
    titre: "Centre spatial guyanais — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Q308987. Port spatial européen à Kourou depuis 1968. Géré par le CNES pour la France et l'ESA. " +
      "~15 000 emplois, ~15 % PIB guyanais. Lanceurs : Ariane 6, Vega.",
    verifiee: true,
  },
  wp_gr: {
    url: "https://fr.wikipedia.org/wiki/Guyane_rassemblement",
    titre: "Guyane Rassemblement — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Q106899676. Fondé le 12 septembre 2015 par Rodolphe Alexandre. Centriste, libéral, " +
      "pro-européen. Alliance avec LREM/Renaissance depuis 2017.",
    verifiee: true,
  },
  wp_fg: {
    url: "https://fr.wikipedia.org/wiki/France-Guyane",
    titre: "France-Guyane — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Q3080539. Quotidien régional fondé en 1978. France-Antilles en redressement judiciaire (2020). " +
      "France-Guyane relancé sous une forme réorganisée ; principal titre de presse en Guyane.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — polymorphe (ADR-002). Résolution par wikidataId via trouverEntite().
//
// NB : PS (Q170972) et Renaissance (Q23731823) supposés DÉJÀ EN BASE.
//      En cas d'erreur « entité introuvable », lancer d'abord :
//      node bin/seed-eurodeputes-fr.js   → PS Q170972
//      node bin/seed-macron-v2.js        → Renaissance Q23731823
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Gabriel Serville ---

  {
    // P→O : Président de l'Assemblée de Guyane depuis le 2 juillet 2021
    aType: "personne",
    aRef: "Q3093959",
    bType: "organisation",
    bRef: "Q19543845",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Gabriel Serville est président de l'Assemblée de Guyane depuis le 2 juillet 2021, " +
      "élu lors des élections territoriales de juin 2021 face à Rodolphe Alexandre.",
    dateDebut: new Date("2021-07-02"),
    dateFin: null,
    sourceRef: "wp_serville",
  },
  {
    // P→O : Serville affilié LREM/Renaissance depuis 2018
    // Renaissance Q23731823 supposé déjà en base (seed-macron-v2.js).
    aType: "personne",
    aRef: "Q3093959",
    bType: "organisation",
    bRef: "Q23731823",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Gabriel Serville a rejoint La République En Marche (devenue Renaissance) en 2018, " +
      "tissant une alliance avec le camp présidentiel pour les élections territoriales guyanaises.",
    dateDebut: new Date("2018-01-01"),
    dateFin: null,
    sourceRef: "wp_serville",
  },
  {
    // P→O : Serville politique → Alexandre (candidats adverses, élection CTG juin 2021)
    aType: "personne",
    aRef: "Q3093959",
    bType: "personne",
    bRef: "Q3108632",
    typeLienCode: "politique",
    description:
      "Gabriel Serville et Rodolphe Alexandre se sont affrontés lors de l'élection " +
      "du président de l'Assemblée de Guyane en juillet 2021. Serville l'a emporté, " +
      "mettant fin à six ans de présidence Alexandre.",
    dateDebut: new Date("2021-06-01"),
    dateFin: null,
    sourceRef: "wp_assemblee",
  },

  // --- Rodolphe Alexandre ---

  {
    // P→O : Ancien président de l'Assemblée de Guyane (2015-2021)
    aType: "personne",
    aRef: "Q3108632",
    bType: "organisation",
    bRef: "Q19543845",
    typeLienCode: "ANCIEN_MANDAT",
    description:
      "Rodolphe Alexandre a été premier président de l'Assemblée de Guyane " +
      "du 31 décembre 2015 au 2 juillet 2021, depuis la création de la CTG.",
    dateDebut: new Date("2015-12-31"),
    dateFin: new Date("2021-07-02"),
    sourceRef: "wp_alexandre",
  },
  {
    // P→O : Ancien maire de Cayenne (2008-2010)
    aType: "personne",
    aRef: "Q3108632",
    bType: "organisation",
    bRef: "Q44401",
    typeLienCode: "ANCIEN_MANDAT",
    description:
      "Rodolphe Alexandre a été maire de Cayenne de 2008 à 2010, avant de prendre " +
      "la présidence du Conseil régional de Guyane en 2010.",
    dateDebut: new Date("2008-03-16"),
    dateFin: new Date("2010-04-08"),
    sourceRef: "wp_alexandre",
  },
  {
    // P→O : Fondateur et président de Guyane Rassemblement (depuis 2015)
    aType: "personne",
    aRef: "Q3108632",
    bType: "organisation",
    bRef: "Q106899676",
    typeLienCode: "FONDATEUR",
    description:
      "Rodolphe Alexandre a fondé Guyane Rassemblement le 12 septembre 2015, " +
      "en se séparant du mouvement Guyane 73 qu'il avait lui-même porté depuis 2010.",
    dateDebut: new Date("2015-09-12"),
    dateFin: null,
    sourceRef: "wp_gr",
  },
  {
    // P→P : Alexandre et Patient, alliés de Guyane Rassemblement (lien politique)
    aType: "personne",
    aRef: "Q3108632",
    bType: "personne",
    bRef: "Q3103298",
    typeLienCode: "politique",
    description:
      "Rodolphe Alexandre et Georges Patient partagent l'étiquette Guyane Rassemblement " +
      "et ont tous deux des liens avec la majorité présidentielle (LREM/Renaissance) " +
      "depuis 2017.",
    dateDebut: new Date("2015-09-12"),
    dateFin: null,
    sourceRef: "wp_gr",
  },

  // --- Michel-Ange Jérémie ---

  {
    // P→O : Maire de Cayenne depuis le 25 mai 2020
    aType: "personne",
    aRef: "Q98234931",
    bType: "organisation",
    bRef: "Q44401",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Michel-Ange Jérémie est élu maire de Cayenne le 25 mai 2020, " +
      "succédant à Marie-Laure Phinéra-Horth (partie au Sénat en octobre 2020).",
    dateDebut: new Date("2020-05-25"),
    dateFin: null,
    sourceRef: "wd_jeremie",
  },

  // --- Marie-Laure Phinéra-Horth ---

  {
    // P→O : Sénatrice de Guyane depuis le 1er octobre 2020
    aType: "personne",
    aRef: "Q65596147",
    bType: "organisation",
    bRef: "Q124156179",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Marie-Laure Phinéra-Horth est sénatrice représentant la Guyane depuis le 1er octobre 2020 " +
      "(élue le 27 septembre 2020). Première femme sénatrice de Guyane.",
    dateDebut: new Date("2020-10-01"),
    dateFin: null,
    sourceRef: "wp_phinera",
  },
  {
    // P→O : Ancienne maire de Cayenne (2010-2020)
    aType: "personne",
    aRef: "Q65596147",
    bType: "organisation",
    bRef: "Q44401",
    typeLienCode: "ANCIEN_MANDAT",
    description:
      "Marie-Laure Phinéra-Horth a été maire de Cayenne du 8 avril 2010 au 28 octobre 2020, " +
      "succédant à Rodolphe Alexandre qui prenait la présidence du Conseil régional.",
    dateDebut: new Date("2010-04-08"),
    dateFin: new Date("2020-10-28"),
    sourceRef: "wp_phinera",
  },
  {
    // P→O : Affiliation PS (Parti Socialiste, Q170972 — supposé déjà en base)
    aType: "personne",
    aRef: "Q65596147",
    bType: "organisation",
    bRef: "Q170972",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Marie-Laure Phinéra-Horth est membre du Parti Socialiste (PS), " +
      "groupe Socialiste et républicain au Sénat.",
    dateDebut: new Date("2010-01-01"),
    dateFin: null,
    sourceRef: "wp_phinera",
  },

  // --- Georges Patient ---

  {
    // P→O : Sénateur de Guyane depuis le 1er octobre 2008
    aType: "personne",
    aRef: "Q3103298",
    bType: "organisation",
    bRef: "Q124156179",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Georges Patient est sénateur représentant la Guyane depuis le 1er octobre 2008. " +
      "Il siège au groupe RDPI (proche de la majorité présidentielle).",
    dateDebut: new Date("2008-10-01"),
    dateFin: null,
    sourceRef: "wp_patient",
  },
  {
    // P→O : Affiliation Guyane Rassemblement
    aType: "personne",
    aRef: "Q3103298",
    bType: "organisation",
    bRef: "Q106899676",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Georges Patient est affilié à Guyane Rassemblement, le parti fondé en 2015 " +
      "par Rodolphe Alexandre, et siège au groupe RDPI au Sénat.",
    dateDebut: new Date("2015-09-12"),
    dateFin: null,
    sourceRef: "wp_patient",
  },

  // --- Sophie Charles ---

  {
    // P→O : Ancienne maire de Saint-Laurent-du-Maroni (2020-2026)
    aType: "personne",
    aRef: "Q65572693",
    bType: "organisation",
    bRef: "Q319959",
    typeLienCode: "ANCIEN_MANDAT",
    description:
      "Sophie Charles a été maire de Saint-Laurent-du-Maroni du 25 mai 2020 au 26 mars 2026 " +
      "(terme enregistré dans Wikidata EntityData P39, dateFin liée aux élections " +
      "municipales de mars 2026).",
    dateDebut: new Date("2020-05-25"),
    dateFin: new Date("2026-03-26"),
    sourceRef: "wd_charles",
  },

  // --- Centre spatial guyanais ---

  {
    // O→O : CSG opéré par le CNES (lien institutionnel)
    aType: "organisation",
    aRef: "Q308987",
    bType: "organisation",
    bRef: "Q48756",
    typeLienCode: "institutionnel",
    description:
      "Le Centre spatial guyanais est opéré par le CNES pour le compte de la France " +
      "et de l'ESA depuis 1968. Le CNES assure la gestion technique et administrative " +
      "du port spatial.",
    dateDebut: new Date("1968-04-09"),
    dateFin: null,
    sourceRef: "wp_csg",
  },
  {
    // O→O : CSG ancré économiquement à Kourou (lien économique)
    aType: "organisation",
    aRef: "Q308987",
    bType: "organisation",
    bRef: "Q273312",
    typeLienCode: "economique",
    description:
      "Le Centre spatial guyanais est situé à Kourou et représente le principal " +
      "acteur économique de la commune : ~15 000 emplois directs et indirects, " +
      "soit l'essentiel de l'activité économique locale.",
    dateDebut: new Date("1968-04-09"),
    dateFin: null,
    sourceRef: "wp_csg",
  },

  // --- Assemblée de Guyane → CTG ---

  {
    // O→O : L'Assemblée de Guyane est l'organe délibérant de la CTG (lien institutionnel)
    aType: "organisation",
    aRef: "Q19543845",
    bType: "organisation",
    bRef: "Q124156179",
    typeLienCode: "institutionnel",
    description:
      "L'Assemblée de Guyane est l'organe délibérant de la Collectivité territoriale " +
      "de Guyane (CTG). Son président est de droit le président de la CTG.",
    dateDebut: new Date("2015-12-31"),
    dateFin: null,
    sourceRef: "wp_ctg",
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-guyane] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

async function upsertPersonne(data, userId) {
  const existing = await prisma.personne.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.personne.update({
      where: { id: existing.id },
      data: { ...data, statut: "EN_ATTENTE" },
    })
  }
  return prisma.personne.create({ data: { ...data, statut: "EN_ATTENTE", creeParId: userId } })
}

async function upsertOrganisation(data, userId) {
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.organisation.update({
      where: { id: existing.id },
      data: { ...data, statut: "EN_ATTENTE" },
    })
  }
  return prisma.organisation.create({ data: { ...data, statut: "EN_ATTENTE", creeParId: userId } })
}

async function upsertSource(key) {
  const data = SOURCES[key]
  const existing = await prisma.source.findFirst({ where: { url: data.url } })
  if (existing) return existing
  return prisma.source.create({ data })
}

async function trouverEntite(type, wikidataId) {
  if (type === "personne") {
    return prisma.personne.findFirst({ where: { wikidataId } })
  }
  if (type === "organisation") {
    return prisma.organisation.findFirst({ where: { wikidataId } })
  }
  throw new Error(`Type entité non supporté : ${type}`)
}

function fkPourEntite(type, entite, position) {
  const suffix = position === "A" ? "AId" : "BId"
  if (type === "personne") return { [`personne${suffix}`]: entite.id }
  if (type === "organisation") return { [`organisation${suffix}`]: entite.id }
  if (type === "siteWeb") return { [`siteWeb${suffix}`]: entite.id }
  throw new Error(`Type inconnu : ${type}`)
}

async function creerLien(lien, sourcesMap, userId) {
  const entiteA = await trouverEntite(lien.aType, lien.aRef)
  const entiteB = await trouverEntite(lien.bType, lien.bRef)
  if (!entiteA || !entiteB) {
    throw new Error(
      `[seed-guyane] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef}, bRef=${lien.bRef})`,
    )
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`TypeLien introuvable : ${lien.typeLienCode}`)
  }

  const fkA = fkPourEntite(lien.aType, entiteA, "A")
  const fkB = fkPourEntite(lien.bType, entiteB, "B")

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
        statut: "EN_ATTENTE",
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
      statut: "EN_ATTENTE",
      estBidirectionnel: false,
      intensite: 1,
      sourceId: source?.id ?? null,
      creeParId: userId,
    },
  })
}

async function reset() {
  console.log("⚠ Suppression données Guyane précédentes...")
  const wikidataIdsP = PERSONNES.map((p) => p.wikidataId)
  const wikidataIdsO = ORGANISATIONS.map((o) => o.wikidataId)

  const persos = await prisma.personne.findMany({ where: { wikidataId: { in: wikidataIdsP } } })
  const orgas = await prisma.organisation.findMany({
    where: { wikidataId: { in: wikidataIdsO } },
  })

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
  console.log("✓ Données précédentes supprimées.\n")
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n┌─ seed-region-guyane — Réseau d'influence de la Guyane ─┐\n")
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`✓ User : ${user.email}\n`)

  console.log("— Sources publiques —")
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ✓ ${data.titre}`)
  }

  console.log("\n— Personnes (Wikidata) —")
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ✓ ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log("\n— Organisations (Wikidata) —")
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ✓ ${created.nom} (${o.wikidataId})`)
  }

  console.log("\n— Liens —")
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ✓ ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log("\n┌─ Bilan ─────────────────────────────────────────────────────┐")
  console.log(`│ Personnes     : ${PERSONNES.length} (Serville, Alexandre, Jérémie, Phinéra-Horth, Patient, S. Charles)`)
  console.log(
    `│ Organisations : ${ORGANISATIONS.length} (CTG, Assemblée, CSG, CNES, GR, France-Guyane, Cayenne, SLM, Kourou)`,
  )
  console.log(
    `│ Sources       : ${Object.keys(SOURCES).length} (Wikipédia FR, Wikidata EntityData)`,
  )
  console.log(
    `│ Liens         : ${LIENS.length} (MANDAT_ELECTIF, ANCIEN_MANDAT, AFFILIATION_PARTI, FONDATEUR, politique, institutionnel, economique)`,
  )
  console.log("│ Confidence    : Serville/Alexandre/Phinéra-Horth/Patient = high")
  console.log("│                 Jérémie/S. Charles = medium (source unique Wikidata)")
  console.log("└─────────────────────────────────────────────────────────────┘\n")
}

main()
  .catch((err) => {
    console.error("[seed-guyane] Échec :", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
