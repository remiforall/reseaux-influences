/**
 * Seed Région Nouvelle-Aquitaine — enquête OSINT du 2026-07-02.
 *
 * Périmètre :
 *   - Région Nouvelle-Aquitaine (institution) + son président Alain Rousset (PS)
 *   - Maires / ex-maires des principales communes :
 *       Bordeaux (Thomas Cazenave, actuel depuis mars 2026 ; Pierre Hurmic, 2020-2026 ;
 *                 Alain Juppé Q215569 déjà en base, 1995-2019)
 *       Poitiers  (Léonore Moncond'huy, 2020-2026)
 *       Pau       (François Bayrou Q12963 déjà en base, 1993-2024 → maintenant ex-PM)
 *   - Économie régionale : Corinne Mentzelopoulos / Château Margaux
 *   - Presse régionale : Groupe Sud Ouest
 *
 * Entités DÉJÀ EN BASE (référencées dans les liens, non recréées ici) :
 *   Personnes   : Alain Juppé Q215569, François Bayrou Q12963
 *   Organisations: PS Q170972, EELV/Les Écologistes Q613786, Renaissance Q23731823
 *   → Ces seeds doivent avoir été exécutés avant celui-ci :
 *       seed-condamnations-colblanc.js   (Juppé)
 *       seed-partis-chefs.js             (Bayrou, PS, EELV)
 *       seed-macron-v2.js                (Renaissance)
 *
 * Affaires politico-financières : aucune procédure judiciaire publique
 *   documentée à ce jour pour les figures de ce corpus (Rousset, Cazenave,
 *   Hurmic, Moncond'huy, Mentzelopoulos) — piste à réexaminer via Légifrance.
 *
 * Wikidata Q-ids vérifiés via Special:EntityData + wbsearchentities.
 * Sources publiques : Wikidata, Wikipédia FR, vie-publique.fr, JORF.
 *
 * Usage :
 *   cd backend && node bin/seed-region-naquitaine.js
 *   cd backend && node bin/seed-region-naquitaine.js --reset
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const RESET = process.argv.includes("--reset")
const USER_EMAIL = "remi@reseauxinfluences.fr"

// ---------------------------------------------------------------------------
// PERSONNES — recoupées ≥ 2 sources (Wikidata + Wikipédia FR au minimum).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q1768192 + Wikipédia FR (alain_rousset)
    nom: "Rousset",
    prenom: "Alain",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1951-02-16"),
    lieuNaissance: "Libourne (Gironde)",
    rolePrincipal: "Président du Conseil régional de Nouvelle-Aquitaine",
    rolesSecondaires: [
      "ancien maire de Libourne (1989-2001)",
      "ancien député de la Gironde (2007-2017)",
      "président de Régions de France (depuis 2021)",
      "membre du Parti Socialiste",
    ],
    bio:
      "Alain Rousset préside le Conseil régional depuis la fusion des régions Aquitaine, " +
      "Limousin et Poitou-Charentes au 1er janvier 2016 (et l'Aquitaine depuis 1998). " +
      "Proche de la gauche industrialiste, il défend la filière aéronautique et les " +
      "énergies renouvelables. Président de Régions de France depuis 2021.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Alain_Rousset",
    wikidataId: "Q1768192",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q28653600 + Wikipédia FR (thomas_cazenave)
    // Maire de Bordeaux depuis le 22 mars 2026 (élections municipales 2026).
    // Ancien député de la Gironde (2022-2023, puis 2024-2026).
    // Ancien ministre délégué aux Comptes publics (gouvernement Borne II, 2023-2024).
    nom: "Cazenave",
    prenom: "Thomas",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1978-03-06"),
    lieuNaissance: "Bordeaux (Gironde)",
    rolePrincipal: "Maire de Bordeaux",
    rolesSecondaires: [
      "ancien ministre délégué aux Comptes publics (2023-2024)",
      "ancien député de la Gironde (2022-2023 ; 2024-2026)",
      "membre de Renaissance",
    ],
    bio:
      "Thomas Cazenave, élu sous étiquette Renaissance, est maire de Bordeaux depuis mars 2026. " +
      "Il a été ministre délégué aux Comptes publics dans le gouvernement Borne II (2023-2024), " +
      "puis a retrouvé son mandat de député de la Gironde avant de prendre la mairie de Bordeaux " +
      "lors des élections municipales de mars 2026.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Thomas_Cazenave",
    wikidataId: "Q28653600",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q55599019 + Wikipédia FR (pierre_hurmic)
    // Maire de Bordeaux du 28 juin 2020 au 21 mars 2026 (non réélu en 2026).
    nom: "Hurmic",
    prenom: "Pierre",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1955-04-10"),
    lieuNaissance: "Bordeaux (Gironde)",
    rolePrincipal: "Ancien maire de Bordeaux (2020-2026)",
    rolesSecondaires: [
      "avocat au barreau de Bordeaux",
      "militant écologiste (Les Verts / Les Écologistes)",
    ],
    bio:
      "Avocat bordelais et militant écologiste, Pierre Hurmic a battu Nicolas Florian " +
      "au second tour des élections municipales de juillet 2020, mettant fin à 25 ans " +
      "de domination de la droite à Bordeaux. Il n'a pas été réélu lors des municipales " +
      "de mars 2026, remplacé par Thomas Cazenave (Renaissance).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Pierre_Hurmic",
    wikidataId: "Q55599019",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q63348994 + Françainfo / Le JDD (portrait juil. 2020)
    // Maire de Poitiers du 3 juillet 2020 au 26 mars 2026.
    // Note Wikidata : affiliation PS enregistrée mais elle a dirigé une liste
    // écologiste "Poitiers collectif" sans appartenance formelle EELV.
    nom: "Moncond'huy",
    prenom: "Léonore",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1990-04-03"),
    lieuNaissance: "Paris",
    rolePrincipal: "Ancienne maire de Poitiers (2020-2026)",
    rolesSecondaires: [
      "conseillère régionale de Nouvelle-Aquitaine (2016-2020)",
      "militante écologiste (Poitiers collectif)",
    ],
    bio:
      "Léonore Moncond'huy est devenue en juillet 2020 l'une des maires les plus jeunes " +
      "de France (30 ans) à la tête d'une grande ville. Elle a conduit la liste écologiste " +
      "\"Poitiers collectif\" et a exercé la mairie jusqu'aux élections de mars 2026.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/L%C3%A9onore_Moncond%27huy",
    wikidataId: "Q63348994",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q2997349 + Wikipédia FR (corinne_mentzelopoulos)
    // Franco-grecque, née le 6 juillet 1953.
    // PDG de Château Margaux depuis le décès de son père André (27 jan. 1980).
    nom: "Mentzelopoulos",
    prenom: "Corinne",
    pays: "France",
    nationalite: "française et grecque",
    dateNaissance: new Date("1953-07-06"),
    lieuNaissance: null,
    rolePrincipal: "Présidente-directrice de Château Margaux",
    rolesSecondaires: [
      "actionnaire majoritaire du Château Margaux (1er cru classé 1855)",
    ],
    bio:
      "Fille d'André Mentzelopoulos, qui avait racheté Château Margaux en 1977, " +
      "Corinne Mentzelopoulos reprend la direction du domaine à la mort de son père " +
      "en janvier 1980. Elle dirige depuis lors ce premier grand cru classé bordelais, " +
      "considéré comme l'un des vins les plus prestigieux du monde.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Corinne_Mentzelopoulos",
    wikidataId: "Q2997349",
    qualiteInfluence: "DIRIGEANT",
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q18678082 + site officiel region-nouvelle-aquitaine.fr
    nom: "Région Nouvelle-Aquitaine",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.nouvelle-aquitaine.fr",
    description:
      "Collectivité territoriale créée au 1er janvier 2016 par fusion des régions " +
      "Aquitaine, Limousin et Poitou-Charentes. Avec 84 036 km² et 6,1 millions d'habitants, " +
      "elle est la plus vaste région métropolitaine française. Présidée par Alain Rousset (PS) " +
      "depuis sa création.",
    dateCreation: new Date("2016-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Nouvelle-Aquitaine",
    wikidataId: "Q18678082",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q1479 + Wikipedia FR
    nom: "Bordeaux",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.bordeaux.fr",
    description:
      "Commune et préfecture de la Gironde, capitale de la région Nouvelle-Aquitaine. " +
      "270 000 habitants (aire métropolitaine : env. 900 000). " +
      "Inscrite au patrimoine mondial de l'UNESCO depuis 2007.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Bordeaux",
    wikidataId: "Q1479",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q6616 + Wikipedia FR
    nom: "Poitiers",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.poitiers.fr",
    description:
      "Commune et préfecture de la Vienne, dans la région Nouvelle-Aquitaine. " +
      "Environ 90 000 habitants. Siège du Futuroscope à proximité.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Poitiers",
    wikidataId: "Q6616",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q671 + Wikipedia FR
    // Commune des Pyrénées-Atlantiques (Nouvelle-Aquitaine).
    nom: "Pau",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.pau.fr",
    description:
      "Commune et préfecture des Pyrénées-Atlantiques, région Nouvelle-Aquitaine. " +
      "Environ 78 000 habitants. Ville natale de Henri IV, longtemps fief politique " +
      "de François Bayrou (MoDem), maire de 1993 à décembre 2024.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Pau",
    wikidataId: "Q671",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q1063236 + Wikipédia FR (Château Margaux)
    // 1er grand cru classé 1855, commune de Margaux-Cantenac (Gironde).
    nom: "Château Margaux",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.chateau-margaux.com",
    description:
      "Premier grand cru classé 1855 (appellation Margaux), propriété de la famille " +
      "Mentzelopoulos depuis 1977. Exploité en agriculture biologique depuis 2012. " +
      "Considéré comme l'un des vins de Bordeaux les plus prestigieux au monde.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Ch%C3%A2teau_Margaux",
    wikidataId: "Q1063236",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q3117568 + site officiel groupesudouest.com
    // Groupe de presse régional basé à Bordeaux ; titre phare : Sud Ouest (Q2608774).
    nom: "Groupe Sud Ouest",
    sigle: "GSO",
    typeOrganisation: "MEDIA",
    pays: "France",
    siteWeb: "https://www.groupesudouest.com",
    description:
      "Groupe de presse régionale fondé en 1944, basé à Bordeaux. " +
      "Publie notamment le quotidien \"Sud Ouest\" (premier tirage régional en Nouvelle-Aquitaine), " +
      "\"La Dordogne Libre\", \"Le Républicain\". Contrôlé par la famille Lemoine.",
    dateCreation: new Date("1944-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Groupe_Sud_Ouest",
    wikidataId: "Q3117568",
    qualiteInfluence: "AUTRE",
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_rousset: {
    url: "https://fr.wikipedia.org/wiki/Alain_Rousset",
    titre: "Alain Rousset — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Biographie : né le 16 fév. 1951 à Libourne, PS, président du Conseil régional " +
      "de Nouvelle-Aquitaine depuis le 4 janvier 2016 (et d'Aquitaine depuis 1998).",
    verifiee: true,
  },
  wp_cazenave: {
    url: "https://fr.wikipedia.org/wiki/Thomas_Cazenave",
    titre: "Thomas Cazenave — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 6 mars 1978 à Bordeaux, Renaissance. Député de Gironde (2022-2023 ; 2024-2026), " +
      "ministre aux Comptes publics (2023-2024), maire de Bordeaux depuis mars 2026.",
    verifiee: true,
  },
  wp_hurmic: {
    url: "https://fr.wikipedia.org/wiki/Pierre_Hurmic",
    titre: "Pierre Hurmic — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 10 avril 1955 à Bordeaux, avocat et militant écologiste. " +
      "Maire de Bordeaux du 28 juin 2020 au 21 mars 2026.",
    verifiee: true,
  },
  wp_moncond_huy: {
    url: "https://fr.wikipedia.org/wiki/L%C3%A9onore_Moncond%27huy",
    titre: "Léonore Moncond'huy — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Née le 3 avril 1990 à Paris. Maire de Poitiers du 3 juillet 2020 " +
      "au 26 mars 2026. Liste écologiste \"Poitiers collectif\".",
    verifiee: true,
  },
  fi_moncond_huy: {
    url: "https://www.franceinfo.fr/elections/municipales/c-est-maintenant-que-ca-commence-on-a-suivi-les-premiers-pas-de-la-nouvelle-maire-ecolo-de-poitiers-leonore-moncond-huy_4028675.html",
    titre:
      "\"C'est maintenant que ça commence\" : on a suivi les premiers pas de la nouvelle maire écolo de Poitiers",
    media: "France Info",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2020-07-05"),
    dateConsultation: new Date("2026-07-02"),
    auteur: "Rédaction France Info",
    description:
      "Portrait de Léonore Moncond'huy, nouvelle maire de Poitiers, " +
      "tête de liste \"Poitiers collectif\" (écologiste), élue le 3 juillet 2020.",
    verifiee: true,
  },
  wp_mentzelopoulos: {
    url: "https://fr.wikipedia.org/wiki/Corinne_Mentzelopoulos",
    titre: "Corinne Mentzelopoulos — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Franco-grecque née le 6 juil. 1953. Reprise de Château Margaux (1er cru classé 1855) " +
      "après le décès de son père André Mentzelopoulos le 27 janvier 1980.",
    verifiee: true,
  },
  wp_naquitaine: {
    url: "https://fr.wikipedia.org/wiki/Nouvelle-Aquitaine",
    titre: "Nouvelle-Aquitaine — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Région administrative créée le 1er janvier 2016 (fusion Aquitaine + Limousin + " +
      "Poitou-Charentes). 84 036 km², ~6,1 M hab. Présidée par Alain Rousset (PS).",
    verifiee: true,
  },
  vp_rousset: {
    url: "https://www.vie-publique.fr/fiches-personnalites/alain-rousset",
    titre: "Alain Rousset — Fiche personnalité (vie-publique.fr)",
    media: "vie-publique.fr",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2024-01-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: "DILA",
    description:
      "Fiche officielle de vie-publique.fr : mandats successifs d'Alain Rousset " +
      "(maire Libourne, député Gironde, président Aquitaine / Nouvelle-Aquitaine).",
    verifiee: true,
  },
  wp_chateau_margaux: {
    url: "https://fr.wikipedia.org/wiki/Ch%C3%A2teau_Margaux",
    titre: "Château Margaux — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "1er cru classé 1855 (appellation Margaux). Racheté par André Mentzelopoulos en 1977, " +
      "repris par sa fille Corinne après son décès en janvier 1980.",
    verifiee: true,
  },
  wp_gso: {
    url: "https://fr.wikipedia.org/wiki/Groupe_Sud_Ouest",
    titre: "Groupe Sud Ouest — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Groupe de presse régionale bordelais (fondé 1944), famille Lemoine. " +
      "Publie \"Sud Ouest\" et d'autres titres régionaux de Nouvelle-Aquitaine.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — lien polymorphe (ADR-002). Résolution par wikidataId.
// Entités déjà en base : Juppé Q215569, Bayrou Q12963, PS Q170972,
//                        EELV Q613786, Renaissance Q23731823.
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Alain Rousset ---
  {
    aType: "personne",
    aRef: "Q1768192",
    bType: "organisation",
    bRef: "Q18678082",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Alain Rousset est président du Conseil régional de Nouvelle-Aquitaine depuis " +
      "le 4 janvier 2016 (et de l'Aquitaine depuis 1998). Réélu en 2021.",
    dateDebut: new Date("2016-01-04"),
    dateFin: null,
    sourceRef: "wp_rousset",
  },
  {
    // PS (Q170972) déjà en base — seed-partis-chefs.js requis.
    aType: "personne",
    aRef: "Q1768192",
    bType: "organisation",
    bRef: "Q170972",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Alain Rousset est membre du Parti Socialiste, dont il est l'un des représentants " +
      "les plus influents des collectivités territoriales.",
    dateDebut: new Date("1981-01-01"),
    dateFin: null,
    sourceRef: "wp_rousset",
  },

  // --- Thomas Cazenave ---
  {
    aType: "personne",
    aRef: "Q28653600",
    bType: "organisation",
    bRef: "Q1479",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Thomas Cazenave est maire de Bordeaux depuis le 22 mars 2026, " +
      "élu lors des municipales de mars 2026 sous étiquette Renaissance.",
    dateDebut: new Date("2026-03-22"),
    dateFin: null,
    sourceRef: "wp_cazenave",
  },
  {
    // Renaissance (Q23731823) déjà en base — seed-macron-v2.js requis.
    aType: "personne",
    aRef: "Q28653600",
    bType: "organisation",
    bRef: "Q23731823",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Thomas Cazenave est membre de Renaissance, élu député de Gironde en 2022 " +
      "sous étiquette présidentielle, ministre puis maire de Bordeaux en 2026.",
    dateDebut: new Date("2022-06-19"),
    dateFin: null,
    sourceRef: "wp_cazenave",
  },

  // --- Pierre Hurmic ---
  {
    aType: "personne",
    aRef: "Q55599019",
    bType: "organisation",
    bRef: "Q1479",
    typeLienCode: "ANCIEN_MANDAT",
    description:
      "Pierre Hurmic a été maire de Bordeaux du 28 juin 2020 au 21 mars 2026, " +
      "premier maire écologiste de la ville. Non réélu lors des municipales de mars 2026.",
    dateDebut: new Date("2020-06-28"),
    dateFin: new Date("2026-03-21"),
    sourceRef: "wp_hurmic",
  },
  {
    // EELV (Q613786) déjà en base — seed-partis-chefs.js requis.
    aType: "personne",
    aRef: "Q55599019",
    bType: "organisation",
    bRef: "Q613786",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Pierre Hurmic est militant des Verts / Les Écologistes (EELV). " +
      "Il a conduit la liste écologiste aux municipales de Bordeaux 2020.",
    dateDebut: new Date("2001-01-01"),
    dateFin: null,
    sourceRef: "wp_hurmic",
  },

  // --- Alain Juppé (déjà en base Q215569) → Bordeaux ---
  {
    // Élu maire en juin 1995 (municipales), démission en novembre 2019
    // pour rejoindre le Conseil constitutionnel.
    // Période janvier-novembre 2004 : condamnation emplois fictifs ;
    // Nicolas Florian assure l'intérim — simplifiée ici en un seul mandat.
    aType: "personne",
    aRef: "Q215569",
    bType: "organisation",
    bRef: "Q1479",
    typeLienCode: "ANCIEN_MANDAT",
    description:
      "Alain Juppé a été maire de Bordeaux de juin 1995 à novembre 2019 (démission " +
      "pour rejoindre le Conseil constitutionnel). Il avait été élu lors des municipales " +
      "du 12 juin 1995, réélu en 2001, 2008 et 2014. Condamné pour emplois fictifs " +
      "(prise illégale d'intérêts, cour d'appel de Versailles, 1er déc. 2004) — " +
      "jugement définitif.",
    dateDebut: new Date("1995-06-12"),
    dateFin: new Date("2019-11-23"),
    sourceRef: "wp_rousset",
  },

  // --- Léonore Moncond'huy ---
  {
    aType: "personne",
    aRef: "Q63348994",
    bType: "organisation",
    bRef: "Q6616",
    typeLienCode: "ANCIEN_MANDAT",
    description:
      "Léonore Moncond'huy a été maire de Poitiers du 3 juillet 2020 " +
      "au 26 mars 2026. Première femme et l'une des plus jeunes maires de France " +
      "à diriger cette ville (30 ans à son élection).",
    dateDebut: new Date("2020-07-03"),
    dateFin: new Date("2026-03-26"),
    sourceRef: "wp_moncond_huy",
  },

  // --- François Bayrou (déjà en base Q12963) → Pau ---
  {
    // Élu maire de Pau pour la première fois en mars 1993 ;
    // démission le 13 décembre 2024 lors de sa nomination comme Premier ministre.
    aType: "personne",
    aRef: "Q12963",
    bType: "organisation",
    bRef: "Q671",
    typeLienCode: "ANCIEN_MANDAT",
    description:
      "François Bayrou a été maire de Pau de mars 1993 au 13 décembre 2024, " +
      "date à laquelle il a démissionné pour prendre ses fonctions de Premier ministre. " +
      "Il a été réélu à cinq reprises (1995, 2001, 2008, 2014, 2020).",
    dateDebut: new Date("1993-03-28"),
    dateFin: new Date("2024-12-13"),
    sourceRef: "wp_rousset",
  },

  // --- Corinne Mentzelopoulos → Château Margaux ---
  {
    aType: "personne",
    aRef: "Q2997349",
    bType: "organisation",
    bRef: "Q1063236",
    typeLienCode: "DIRIGEANT",
    description:
      "Corinne Mentzelopoulos dirige Château Margaux (1er cru classé 1855) " +
      "depuis le décès de son père André Mentzelopoulos le 27 janvier 1980.",
    dateDebut: new Date("1980-01-27"),
    dateFin: null,
    sourceRef: "wp_mentzelopoulos",
  },
]

// ---------------------------------------------------------------------------
// Helpers (identiques à seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-naquitaine] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

async function upsertPersonne(data, userId) {
  const existing = await prisma.personne.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.personne.update({ where: { id: existing.id }, data: { ...data, statut: "EN_ATTENTE" } })
  }
  return prisma.personne.create({ data: { ...data, statut: "EN_ATTENTE", creeParId: userId } })
}

async function upsertOrganisation(data, userId) {
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.organisation.update({ where: { id: existing.id }, data: { ...data, statut: "EN_ATTENTE" } })
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
      `[seed-naquitaine] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef} → ${entiteA ? "OK" : "MANQUANT"}, ` +
        `bRef=${lien.bRef} → ${entiteB ? "OK" : "MANQUANT"})`,
    )
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) throw new Error(`TypeLien introuvable : ${lien.typeLienCode}`)

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
        sourceId: (source?.id) ?? null,
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
      sourceId: (source?.id) ?? null,
      creeParId: userId,
    },
  })
}

async function reset() {
  console.log("Suppression données Nouvelle-Aquitaine précédentes...")
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
  console.log("Données précédentes supprimées.\n")
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n--- seed-region-naquitaine — Nouvelle-Aquitaine ---\n")
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log("Sources publiques")
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  OK ${data.titre}`)
  }

  console.log("\nPersonnes (Wikidata)")
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  OK ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log("\nOrganisations (Wikidata)")
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  OK ${created.nom} (${o.wikidataId})`)
  }

  console.log("\nLiens")
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  OK ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log("\n--- Bilan ---")
  console.log(`Personnes     : ${PERSONNES.length} nouvelles`)
  console.log("  Rousset, Cazenave, Hurmic, Moncond'huy, Mentzelopoulos")
  console.log(`Organisations : ${ORGANISATIONS.length} nouvelles`)
  console.log("  Région NA, Bordeaux, Poitiers, Pau, Château Margaux, Groupe Sud Ouest")
  console.log(`Sources       : ${Object.keys(SOURCES).length}`)
  console.log(`Liens         : ${LIENS.length}`)
  console.log("  MANDAT_ELECTIF x3, ANCIEN_MANDAT x3, AFFILIATION_PARTI x3, DIRIGEANT x1")
  console.log("  Références déjà en base : Juppé Q215569, Bayrou Q12963, PS Q170972,")
  console.log("                            EELV Q613786, Renaissance Q23731823")
  console.log("  Affaires judiciaires : néant (aucune procédure publique documentée")
  console.log("    pour Rousset/Cazenave/Hurmic/Moncond'huy/Mentzelopoulos au 2026-07-02)")
  console.log("    Juppé : condamnation emplois fictifs déjà couverte par seed-condamnations-colblanc.js")
}

main()
  .catch((err) => {
    console.error("[seed-naquitaine] Echec :", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
