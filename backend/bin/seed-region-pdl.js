/**
 * Seed Région Pays de la Loire — enquête OSINT du 2026-07-02.
 *
 * Périmètre :
 *   - Région Pays de la Loire (Q16994) + Conseil régional (Q2994260) ;
 *     présidente Christelle Morançais (Q42072121, Horizons depuis févr. 2024).
 *   - Maires des principales villes :
 *       Nantes          Johanna Rolland  Q16037012  PS  (depuis avr. 2014)
 *       Le Mans         Stéphane Le Foll Q960150    PS  (depuis juin 2018)
 *       Saint-Nazaire   David Samzun     Q65601727  DVG (depuis avr. 2014)
 *       La Roche-sur-Yon Luc Bouard      Q33106306  Horizons (depuis avr. 2014)
 *       Angers          Christophe Béchu Q544725    Horizons (2014-2022 ; 2024-)
 *   - Économie régionale :
 *       Chantiers de l'Atlantique Q765925 (Saint-Nazaire, 84,34 % État/APE).
 *   - Presse régionale :
 *       Le Courrier de l'Ouest Q3221872 (Angers, filiale SIPA Ouest-France).
 *
 * Entités DÉJÀ EN BASE (référencées dans les liens, non recréées ici) :
 *   Personnes    : Philippe de Villiers Q704846   (seed-influence-conservatrice.js)
 *   Organisations: PS             Q170972  (seed-partis-chefs.js)
 *                  APE            Q2826627 (seed-participations-publiques.js)
 *                  SIPA Ouest-France Q3117551 (seed-raffermir-medias.js)
 *                  Puy du Fou     Q3411109 (seed-influence-conservatrice.js)
 *   → Seeds requis avant : seed-partis-chefs.js, seed-participations-publiques.js,
 *                          seed-raffermir-medias.js, seed-influence-conservatrice.js.
 *
 * Affaires judiciaires notables : aucune procédure publique documentée concernant
 *   les figures de ce corpus à la date de consultation (2026-07-02) ; à réexaminer
 *   via Légifrance et HATVP. Philippe de Villiers (Q704846) fait l'objet d'affaires
 *   déjà documentées dans seed-influence-conservatrice.js — présomption d'innocence.
 *
 * Wikidata Q-ids vérifiés via Special:EntityData + wbsearchentities (2026-07-02).
 * Sources : Wikidata, Wikipédia FR, France Bleu, vie-publique.fr, region officielle,
 *           breizh-info.com (Samzun DVG), chantiers-atlantique.com.
 *
 * Usage :
 *   cd backend && node bin/seed-region-pdl.js
 *   cd backend && node bin/seed-region-pdl.js --reset
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
    // Sources : Wikidata Q42072121 (vérifié Special:EntityData 2026-07-02)
    //           + Wikipédia FR "Christelle Morançais"
    //           + France Bleu (rejoindre Horizons, 11 fév. 2024)
    //           + site officiel paysdelaloire.fr (fiche élue)
    // Née le 28 janv. 1975 au Mans (Sarthe). LR (UMP → LR 2015 → Horizons fév. 2024).
    // Présidente du Conseil régional des Pays de la Loire depuis le 19 oct. 2017.
    // Première femme à exercer cette fonction en PDL. Réélue le 2 juil. 2021.
    nom: "Morançais",
    prenom: "Christelle",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1975-01-28"),
    lieuNaissance: "Le Mans (Sarthe)",
    rolePrincipal: "Présidente du Conseil régional des Pays de la Loire",
    rolesSecondaires: [
      "membre du parti Horizons (depuis février 2024, ex-LR)",
      "vice-présidente du Conseil régional PDL (2015-2017)",
      "conseillère régionale des Pays de la Loire (depuis 2014)",
    ],
    bio:
      "Née au Mans, Christelle Morançais est élue conseillère régionale des Pays de la Loire " +
      "en 2014 (UMP/LR). Vice-présidente du Conseil régional de 2015 à 2017, elle est nommée " +
      "présidente le 19 octobre 2017 en remplacement de Bruno Retailleau, devenu sénateur. " +
      "Réélue le 2 juillet 2021, elle est la première femme à présider cette région. " +
      "Elle rejoint le parti Horizons (Édouard Philippe) le 11 février 2024.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Christelle_Moran%C3%A7ais",
    wikidataId: "Q42072121",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q16037012 (vérifié Special:EntityData 2026-07-02)
    //           + Wikipédia FR "Johanna Rolland"
    //           + nantes.fr (fiche officielle)
    // Née le 11 mai 1979. PS. Maire de Nantes depuis le 4 avr. 2014 (3 mandats).
    // Présidente de Nantes Métropole depuis 2014 ; présidente de France Urbaine depuis 2020.
    nom: "Rolland",
    prenom: "Johanna",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1979-05-11"),
    lieuNaissance: null,
    rolePrincipal: "Maire de Nantes",
    rolesSecondaires: [
      "présidente de Nantes Métropole (depuis 2014)",
      "présidente de France Urbaine (depuis 2020)",
      "membre du Parti socialiste",
      "première femme maire de Nantes",
    ],
    bio:
      "Johanna Rolland est élue maire de Nantes le 4 avril 2014, première femme à diriger " +
      "cette commune. Membre du Parti socialiste, elle est réélue en 2020 et en 2026. " +
      "Parallèlement, elle préside Nantes Métropole depuis 2014 et France Urbaine " +
      "(association des grandes villes) depuis 2020.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Johanna_Rolland",
    wikidataId: "Q16037012",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q960150 (vérifié Special:EntityData 2026-07-02)
    //           + Wikipédia FR "Stéphane Le Foll"
    // Né le 3 fév. 1960 au Mans (Sarthe). PS. Maire du Mans depuis le 14 juin 2018.
    // Ancien eurodéputé (2004-2012), ancien ministre de l'Agriculture (2012-2017).
    nom: "Le Foll",
    prenom: "Stéphane",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1960-02-03"),
    lieuNaissance: "Le Mans (Sarthe)",
    rolePrincipal: "Maire du Mans",
    rolesSecondaires: [
      "ancien ministre de l'Agriculture, de l'Agroalimentaire et de la Forêt (2012-2017)",
      "ancien porte-parole du gouvernement Hollande (2014-2017)",
      "ancien député européen (2004-2012)",
      "membre du Parti socialiste",
    ],
    bio:
      "Né au Mans, Stéphane Le Foll est un dirigeant socialiste proche de François Hollande. " +
      "Eurodéputé (2004-2012), il devient ministre de l'Agriculture du gouvernement Ayrault " +
      "et Valls (2012-2017), cumulant avec le rôle de porte-parole du gouvernement. " +
      "Il est élu maire du Mans le 14 juin 2018 (suite au décès de Jean-Claude Boulard) " +
      "et réélu en 2020 et 2026.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/St%C3%A9phane_Le_Foll",
    wikidataId: "Q960150",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q65601727 (vérifié Special:EntityData 2026-07-02)
    //           + breizh-info.com (nov. 2025 : Samzun "divers gauche", pas PS national)
    //           + France 3 Pays de la Loire (municipales 2014-2020)
    // Né le 20 janv. 1970. DVG (PS local) ; non investi par le PS national en 2020.
    // Maire de Saint-Nazaire depuis le 4 avr. 2014 (3 mandats).
    nom: "Samzun",
    prenom: "David",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1970-01-20"),
    lieuNaissance: null,
    rolePrincipal: "Maire de Saint-Nazaire",
    rolesSecondaires: [
      "conseiller régional des Pays de la Loire (depuis 2014)",
      "proche du Parti socialiste (divers gauche depuis 2020)",
    ],
    bio:
      "David Samzun est maire de Saint-Nazaire depuis le 4 avril 2014 (3 mandats). " +
      "Militant PS de la section locale, il n'est pas investi par le PS national pour les " +
      "élections municipales de 2020 et conduit une liste « Divers gauche » associant PS, " +
      "PRG et Place publique. Conseiller régional des Pays de la Loire depuis 2014.",
    wikipediaUrl: null,
    wikidataId: "Q65601727",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q33106306 (vérifié Special:EntityData 2026-07-02)
    //           + France Bleu Loire (portrait, réélu 2020 : 52,28 %)
    //           + site officiel larochesuryon.fr
    // Né le 25 mars 1961. Horizons (ex-LR, parti LR quitté en juin 2019 ; Horizons depuis 2021).
    // Maire de La Roche-sur-Yon depuis le 4 avr. 2014 (3 mandats).
    nom: "Bouard",
    prenom: "Luc",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1961-03-25"),
    lieuNaissance: null,
    rolePrincipal: "Maire de La Roche-sur-Yon",
    rolesSecondaires: [
      "membre du parti Horizons (depuis 2021, ex-LR)",
      "conseiller régional des Pays de la Loire (depuis 2014)",
    ],
    bio:
      "Luc Bouard est maire de La Roche-sur-Yon depuis le 4 avril 2014 (3 mandats). " +
      "Ancien membre des Républicains, il quitte le parti en juin 2019 et soutient Macron. " +
      "Il rejoint le parti Horizons (Édouard Philippe) à sa création en 2021 dont il devient " +
      "le représentant régional PDL. Réélu en 2020 avec 52,28 % et en 2026.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Luc_Bouard",
    wikidataId: "Q33106306",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q544725 (vérifié Special:EntityData 2026-07-02)
    //           + Wikipédia FR "Christophe Béchu"
    //           + angers.fr (communiqués officiels rétablissement mairie sept. 2024 + mars 2026)
    // Né le 11 juin 1974. Horizons (SG depuis oct. 2021). UMP → LR → Horizons 2017.
    // Maire d'Angers : 2014-juil. 2022 ; reprend le fauteuil le 23 sept. 2024 ;
    // réélu le 27 mars 2026 (49 voix sur 59).
    // Ancien ministre de la Transition écologique (juil. 2022 – sept. 2024).
    nom: "Béchu",
    prenom: "Christophe",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1974-06-11"),
    lieuNaissance: null,
    rolePrincipal: "Maire d'Angers",
    rolesSecondaires: [
      "secrétaire général du parti Horizons (depuis octobre 2021)",
      "ancien ministre de la Transition écologique et de la Cohésion des territoires (2022-2024)",
      "ancien sénateur du Maine-et-Loire (2014-2022)",
    ],
    bio:
      "Christophe Béchu est maire d'Angers depuis 2014 (avec une parenthèse ministérielle " +
      "de juillet 2022 à septembre 2024). Secrétaire général du parti Horizons depuis " +
      "octobre 2021, il a occupé le portefeuille de la Transition écologique dans les " +
      "gouvernements Borne et Attal. Il reprend la mairie d'Angers le 23 septembre 2024 " +
      "et est réélu le 27 mars 2026.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Christophe_B%C3%A9chu",
    wikidataId: "Q544725",
    qualiteInfluence: "ELU",
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q16994 + Wikipédia FR "Pays de la Loire"
    // Région administrative de France, créée en 1972. 3,8 M hab., 5 dépts.
    nom: "Pays de la Loire",
    sigle: "PDL",
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.paysdelaloire.fr",
    description:
      "Région administrative française créée en 1972, regroupant cinq départements " +
      "(Loire-Atlantique, Maine-et-Loire, Mayenne, Sarthe, Vendée). " +
      "3,8 millions d'habitants, chef-lieu Nantes. " +
      "Présidée par Christelle Morançais (Horizons) depuis octobre 2017.",
    dateCreation: new Date("1972-04-05"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Pays_de_la_Loire",
    wikidataId: "Q16994",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q2994260 (vérifié Special:EntityData 2026-07-02)
    //           + site officiel paysdelaloire.fr (CR, 93 membres, siège Nantes)
    nom: "Conseil régional des Pays de la Loire",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.paysdelaloire.fr/mon-conseil-regional",
    description:
      "Assemblée délibérante de la région Pays de la Loire (93 conseillers). " +
      "Siège : Hôtel de région, 1 rue de la Loire, 44000 Nantes. " +
      "Présidé par Christelle Morançais (Horizons) depuis le 19 octobre 2017.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Conseil_r%C3%A9gional_des_Pays_de_la_Loire",
    wikidataId: "Q2994260",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q765925 (vérifié Special:EntityData 2026-07-02)
    //           + Wikipédia FR "Chantiers de l'Atlantique"
    //           + chantiers-atlantique.com (rapport annuel 2023 : 3 639 salariés)
    // Issu de la fusion Penhoët/Ateliers et chantiers de la Loire (1955).
    // Nationalisé en juil. 2018 : État 84,34 % (APE), Naval Group 11,67 %, employés 2,35 %.
    // DG : Laurent Castaing depuis fév. 2012. CA 2025 : 2,82 Mds €.
    nom: "Chantiers de l'Atlantique",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://chantiers-atlantique.com",
    description:
      "Dernier grand chantier naval français, situé à Saint-Nazaire. " +
      "Fondé en 1955 par fusion Penhoët/Ateliers de la Loire, nationalisé en juillet 2018 " +
      "(État/APE : 84,34 %). Spécialisé dans les paquebots de croisière (MSC, Royal Caribbean). " +
      "3 639 salariés (2023). Chiffre d'affaires : 2,82 Mds € (2025).",
    dateCreation: new Date("1955-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Chantiers_de_l%27Atlantique",
    wikidataId: "Q765925",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q3221872 (vérifié : label = "Petit Courrier", alias = "Le Courrier de l'Ouest")
    //           + Wikipédia FR "Le Courrier de l'Ouest"
    // Fondé le 21 août 1944 à Angers. Filiale SIPA—Ouest-France depuis déc. 2005.
    // Dessert Maine-et-Loire et Deux-Sèvres (5 éditions).
    nom: "Le Courrier de l'Ouest",
    sigle: null,
    typeOrganisation: "MEDIA",
    pays: "France",
    siteWeb: "https://www.courrierdelouest.fr",
    description:
      "Quotidien régional fondé le 21 août 1944 à Angers (Maine-et-Loire). " +
      "Acquis en décembre 2005 par le groupe SIPA — Ouest-France (Q3117551). " +
      "Couvre Maine-et-Loire et Deux-Sèvres en cinq éditions. " +
      "Descendant du Courrier d'Angers (1875) via Le Petit Courrier.",
    dateCreation: new Date("1944-08-21"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Le_Courrier_de_l%27Ouest",
    wikidataId: "Q3221872",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q108846587 (vérifié wbsearchentities 2026-07-02)
    //           + Wikipédia FR "Horizons (parti politique)" + site horizons.fr
    // Fondé le 9 oct. 2021 par Édouard Philippe. Centre-droit macroniste.
    // Déjà en base via seed-partis-chefs.js et seed-region-corse.js (upsert idempotent).
    nom: "Horizons",
    sigle: "H",
    typeOrganisation: "PARTI_POLITIQUE",
    pays: "France",
    siteWeb: "https://www.horizons.fr",
    description:
      "Parti politique français de centre-droit fondé le 9 octobre 2021 " +
      "par Édouard Philippe, ancien Premier ministre et maire du Havre. " +
      "Membre de la coalition Ensemble pour la République. " +
      "Christophe Béchu en est le secrétaire général depuis octobre 2021.",
    dateCreation: new Date("2021-10-09"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Horizons_(parti_politique)",
    wikidataId: "Q108846587",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q12191 + Wikipédia FR "Nantes"
    nom: "Nantes",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.nantes.fr",
    description:
      "Commune préfecture de la Loire-Atlantique et chef-lieu de la région Pays de la Loire. " +
      "320 000 habitants (aire métropolitaine : env. 1 million). " +
      "Première ville de la région, sixième de France.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Nantes",
    wikidataId: "Q12191",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q1476 + Wikipédia FR "Le Mans"
    nom: "Le Mans",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.lemans.fr",
    description:
      "Commune préfecture de la Sarthe, région Pays de la Loire. " +
      "Environ 150 000 habitants. Connue pour les 24 Heures du Mans (circuit de la Sarthe).",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Le_Mans",
    wikidataId: "Q1476",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q152027 + Wikipédia FR "Saint-Nazaire"
    nom: "Saint-Nazaire",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.saint-nazaire.fr",
    description:
      "Commune de Loire-Atlantique (Pays de la Loire). " +
      "Environ 72 000 habitants. Pôle industriel et maritime de la région, " +
      "siège des Chantiers de l'Atlantique.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Saint-Nazaire",
    wikidataId: "Q152027",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q190118 + Wikipédia FR "La Roche-sur-Yon"
    nom: "La Roche-sur-Yon",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.larochesuryon.fr",
    description:
      "Commune préfecture de la Vendée, région Pays de la Loire. " +
      "Environ 60 000 habitants. Ville fondée ex nihilo par Napoléon en 1804 " +
      "sous le nom de Napoléon-Vendée.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/La_Roche-sur-Yon",
    wikidataId: "Q190118",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q38380 + Wikipédia FR "Angers"
    nom: "Angers",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.angers.fr",
    description:
      "Commune préfecture du Maine-et-Loire, région Pays de la Loire. " +
      "Environ 160 000 habitants. Ancienne capitale des comtes d'Anjou, " +
      "connue pour la Tapisserie de l'Apocalypse (XIVe siècle).",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Angers",
    wikidataId: "Q38380",
    qualiteInfluence: "AUTRE",
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_morancais: {
    url: "https://fr.wikipedia.org/wiki/Christelle_Moran%C3%A7ais",
    titre: "Christelle Morançais — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Née le 28 janv. 1975 au Mans, LR → Horizons ; présidente CR PDL depuis le 19 oct. 2017.",
    verifiee: true,
  },
  fb_morancais_horizons: {
    url: "https://www.francebleu.fr/infos/politique/la-presidente-des-pays-de-la-loire-christelle-morancais-rejoint-horizons-6603052",
    titre: "La présidente des Pays de la Loire Christelle Morançais rejoint Horizons",
    media: "France Bleu",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2024-02-11"),
    dateConsultation: new Date("2026-07-02"),
    auteur: "Rédaction France Bleu Loire",
    description:
      "Christelle Morançais quitte LR et rejoint le parti Horizons (Édouard Philippe) le 11 fév. 2024.",
    verifiee: true,
  },
  site_pdl_morancais: {
    url: "https://www.paysdelaloire.fr/mon-conseil-regional/linstitution/les-elus/christelle-morancais-0",
    titre: "Christelle Morançais — Région Pays de la Loire",
    media: "Région Pays de la Loire",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "fr",
    paysMedia: "France",
    datePublication: null,
    dateConsultation: new Date("2026-07-02"),
    auteur: "Région Pays de la Loire",
    description:
      "Fiche officielle de la présidente du Conseil régional des Pays de la Loire.",
    verifiee: true,
  },
  wp_rolland: {
    url: "https://fr.wikipedia.org/wiki/Johanna_Rolland",
    titre: "Johanna Rolland — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Née le 11 mai 1979, PS, maire de Nantes depuis le 4 avr. 2014 (3 mandats). " +
      "Première femme maire de Nantes.",
    verifiee: true,
  },
  nantes_fr: {
    url: "https://www.nantes.fr/johanna-rolland",
    titre: "Johanna Rolland, Maire de Nantes — nantes.fr",
    media: "Ville de Nantes",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "fr",
    paysMedia: "France",
    datePublication: null,
    dateConsultation: new Date("2026-07-02"),
    auteur: "Ville de Nantes",
    description:
      "Page officielle de la maire de Nantes Johanna Rolland sur le site de la mairie.",
    verifiee: true,
  },
  wp_lefoll: {
    url: "https://fr.wikipedia.org/wiki/St%C3%A9phane_Le_Foll",
    titre: "Stéphane Le Foll — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 3 fév. 1960 au Mans, PS, maire du Mans depuis le 14 juin 2018 " +
      "(élu suite au décès de Jean-Claude Boulard).",
    verifiee: true,
  },
  fi_samzun_dvg: {
    url: "https://www.breizh-info.com/2025/11/28/254101/saint-nazaire-david-samzun-nest-pas-ps-mais-divers-gauche/",
    titre: "Saint-Nazaire : David Samzun n'est pas PS mais « divers gauche »",
    media: "Breizh Info",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2025-11-28"),
    dateConsultation: new Date("2026-07-02"),
    auteur: "Rédaction Breizh Info",
    description:
      "David Samzun, maire de Saint-Nazaire, se dit « divers gauche » et non PS depuis " +
      "le refus d'investiture du parti national pour les municipales 2020.",
    verifiee: true,
  },
  wd_samzun: {
    url: "https://www.wikidata.org/wiki/Q65601727",
    titre: "David Samzun — Wikidata Q65601727",
    media: "Wikidata",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: null,
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Q65601727 : David Samzun, maire de Saint-Nazaire. Né le 20 janv. 1970. " +
      "Mandats confirmés : maire Saint-Nazaire depuis avr. 2014 (3 mandats).",
    verifiee: true,
  },
  fb_bouard: {
    url: "https://www.francebleu.fr/infos/elections/luc-bouard-reelu-maire-de-la-roche-sur-yon-en-vendee-son-portrait-1593334598",
    titre: "Luc Bouard réélu maire de La Roche-sur-Yon — France Bleu Loire",
    media: "France Bleu Loire",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2020-06-28"),
    dateConsultation: new Date("2026-07-02"),
    auteur: "Rédaction France Bleu Loire",
    description:
      "Luc Bouard réélu maire de La Roche-sur-Yon avec 52,28 % en 2020. " +
      "Portrait : ex-LR, a quitté le parti en juin 2019, rejoint Horizons en 2021.",
    verifiee: true,
  },
  wp_bechu: {
    url: "https://fr.wikipedia.org/wiki/Christophe_B%C3%A9chu",
    titre: "Christophe Béchu — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 11 juin 1974. Horizons (SG depuis oct. 2021). Maire d'Angers : " +
      "2014-2022, puis à nouveau depuis sept. 2024 (réélu mars 2026).",
    verifiee: true,
  },
  angers_fr_bechu: {
    url: "https://www.angers.fr/actualites-sorties/65764-christophe-bechu-redevient-maire-d-angers/index.html",
    titre: "Christophe Béchu redevient maire d'Angers — angers.fr",
    media: "Ville d'Angers",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2024-09-23"),
    dateConsultation: new Date("2026-07-02"),
    auteur: "Ville d'Angers",
    description:
      "Communiqué officiel : Christophe Béchu élu maire d'Angers lors du conseil " +
      "municipal extraordinaire du 23 septembre 2024 (49 voix sur 59).",
    verifiee: true,
  },
  wp_chantiers: {
    url: "https://fr.wikipedia.org/wiki/Chantiers_de_l%27Atlantique",
    titre: "Chantiers de l'Atlantique — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Chantiers de l'Atlantique (Saint-Nazaire) : dernier grand chantier naval français. " +
      "Nationalisé juil. 2018 : État/APE 84,34 %, Naval Group 11,67 %. CA 2025 : 2,82 Mds €.",
    verifiee: true,
  },
  wp_courrier_ouest: {
    url: "https://fr.wikipedia.org/wiki/Le_Courrier_de_l%27Ouest",
    titre: "Le Courrier de l'Ouest — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Fondé le 21 août 1944 à Angers. Filiale SIPA—Ouest-France depuis déc. 2005. " +
      "5 éditions couvrant Maine-et-Loire et Deux-Sèvres.",
    verifiee: true,
  },
  wp_pdl: {
    url: "https://fr.wikipedia.org/wiki/Pays_de_la_Loire",
    titre: "Pays de la Loire — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Région administrative créée en 1972, 5 départements, 3,8 M hab., chef-lieu Nantes.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002). Résolution par wikidataId.
//
// Entités déjà en base référencées dans les bRef :
//   PS         Q170972  (seed-partis-chefs.js)
//   APE        Q2826627 (seed-participations-publiques.js)
//   SIPA       Q3117551 (seed-raffermir-medias.js)
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Présidente du Conseil régional ---
  {
    // P-O : Morançais — mandat électif de présidente du CR PDL
    aType: "personne",
    aRef: "Q42072121",
    bType: "organisation",
    bRef: "Q2994260",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Christelle Morançais est présidente du Conseil régional des Pays de la Loire " +
      "depuis le 19 octobre 2017 (nommée en remplacement de Bruno Retailleau). Réélue le 2 juillet 2021.",
    dateDebut: new Date("2017-10-19"),
    dateFin: null,
    sourceRef: "wp_morancais",
  },
  {
    // P-O : Morançais — affiliation Horizons (depuis fév. 2024)
    aType: "personne",
    aRef: "Q42072121",
    bType: "organisation",
    bRef: "Q108846587",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Christelle Morançais rejoint officiellement le parti Horizons le 11 février 2024, " +
      "quittant Les Républicains (LR).",
    dateDebut: new Date("2024-02-11"),
    dateFin: null,
    sourceRef: "fb_morancais_horizons",
  },

  // --- Maires et leurs communes ---
  {
    // P-O : Rolland — mandat électif de maire de Nantes
    aType: "personne",
    aRef: "Q16037012",
    bType: "organisation",
    bRef: "Q12191",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Johanna Rolland est maire de Nantes depuis le 4 avril 2014 (3 mandats : 2014, 2020, 2026). " +
      "Première femme à diriger cette commune.",
    dateDebut: new Date("2014-04-04"),
    dateFin: null,
    sourceRef: "wp_rolland",
  },
  {
    // P-O : Rolland — affiliation PS (Q170972 déjà en base)
    aType: "personne",
    aRef: "Q16037012",
    bType: "organisation",
    bRef: "Q170972",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Johanna Rolland est membre du Parti socialiste, sous l'étiquette duquel elle a " +
      "été élue maire de Nantes (2014, 2020, 2026).",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_rolland",
  },
  {
    // P-O : Le Foll — mandat électif de maire du Mans
    aType: "personne",
    aRef: "Q960150",
    bType: "organisation",
    bRef: "Q1476",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Stéphane Le Foll est maire du Mans depuis le 14 juin 2018 " +
      "(élu lors d'un conseil municipal suite au décès de Jean-Claude Boulard). Réélu en 2020 et 2026.",
    dateDebut: new Date("2018-06-14"),
    dateFin: null,
    sourceRef: "wp_lefoll",
  },
  {
    // P-O : Le Foll — affiliation PS (Q170972 déjà en base)
    aType: "personne",
    aRef: "Q960150",
    bType: "organisation",
    bRef: "Q170972",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Stéphane Le Foll est membre du Parti socialiste ; ancien ministre de l'Agriculture " +
      "du gouvernement Ayrault/Valls (2012-2017), proche de François Hollande.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_lefoll",
  },
  {
    // P-O : Samzun — mandat électif de maire de Saint-Nazaire
    aType: "personne",
    aRef: "Q65601727",
    bType: "organisation",
    bRef: "Q152027",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "David Samzun est maire de Saint-Nazaire depuis le 4 avril 2014 (3 mandats). " +
      "Il conduit en 2020 et 2026 une liste « Divers gauche » (non investi par le PS national).",
    dateDebut: new Date("2014-04-04"),
    dateFin: null,
    sourceRef: "wd_samzun",
  },
  {
    // P-O : Samzun — proximité PS (lien politique, pas affiliation formelle nationale)
    aType: "personne",
    aRef: "Q65601727",
    bType: "organisation",
    bRef: "Q170972",
    typeLienCode: "politique",
    description:
      "David Samzun est militant de la section PS locale de Saint-Nazaire, " +
      "sans investiture du PS national depuis 2020 (liste « Divers gauche »).",
    dateDebut: null,
    dateFin: null,
    sourceRef: "fi_samzun_dvg",
  },
  {
    // P-O : Bouard — mandat électif de maire de La Roche-sur-Yon
    aType: "personne",
    aRef: "Q33106306",
    bType: "organisation",
    bRef: "Q190118",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Luc Bouard est maire de La Roche-sur-Yon depuis le 4 avril 2014 (3 mandats). " +
      "Réélu en 2020 avec 52,28 % et en 2026.",
    dateDebut: new Date("2014-04-04"),
    dateFin: null,
    sourceRef: "fb_bouard",
  },
  {
    // P-O : Bouard — affiliation Horizons (depuis 2021)
    aType: "personne",
    aRef: "Q33106306",
    bType: "organisation",
    bRef: "Q108846587",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Luc Bouard rejoint le parti Horizons à sa création en 2021 (après avoir quitté LR " +
      "en juin 2019), devenant représentant régional d'Horizons pour les Pays de la Loire.",
    dateDebut: new Date("2021-10-09"),
    dateFin: null,
    sourceRef: "fb_bouard",
  },
  {
    // P-O : Béchu — mandat électif de maire d'Angers
    aType: "personne",
    aRef: "Q544725",
    bType: "organisation",
    bRef: "Q38380",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Christophe Béchu est maire d'Angers depuis 2014 (mandat interrompu juil. 2022 – " +
      "sept. 2024 pour raison ministérielle). Reprend le fauteuil le 23 sept. 2024, " +
      "réélu le 27 mars 2026 (49 voix sur 59).",
    dateDebut: new Date("2014-04-04"),
    dateFin: null,
    sourceRef: "angers_fr_bechu",
  },
  {
    // P-O : Béchu — affiliation Horizons (SG depuis oct. 2021)
    aType: "personne",
    aRef: "Q544725",
    bType: "organisation",
    bRef: "Q108846587",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Christophe Béchu est secrétaire général du parti Horizons depuis sa fondation " +
      "en octobre 2021 par Édouard Philippe.",
    dateDebut: new Date("2021-10-09"),
    dateFin: null,
    sourceRef: "wp_bechu",
  },

  // --- Économie régionale ---
  {
    // O-O : APE (Q2826627, déjà en base) → ACTIONNAIRE_MAJORITAIRE → Chantiers de l'Atlantique
    // Nationalisé juil. 2018 : État/APE 84,34 % (ADR-027).
    aType: "organisation",
    aRef: "Q2826627",
    bType: "organisation",
    bRef: "Q765925",
    typeLienCode: "ACTIONNAIRE_MAJORITAIRE",
    description:
      "L'Agence des participations de l'État (APE) détient 84,34 % du capital des " +
      "Chantiers de l'Atlantique depuis la nationalisation de juillet 2018. " +
      "Autres actionnaires : Naval Group (11,67 %) et salariés (2,35 %).",
    dateDebut: new Date("2018-07-01"),
    dateFin: null,
    sourceRef: "wp_chantiers",
  },

  // --- Presse régionale ---
  {
    // O-O : SIPA Ouest-France (Q3117551, déjà en base) → FILIALE → Le Courrier de l'Ouest
    // Acquisition déc. 2005 (ADR-027 : lien capitalistique).
    aType: "organisation",
    aRef: "Q3117551",
    bType: "organisation",
    bRef: "Q3221872",
    typeLienCode: "FILIALE",
    description:
      "SIPA — Ouest-France (groupe de presse) a acquis Le Courrier de l'Ouest en " +
      "décembre 2005 ; le quotidien angevin en est une filiale éditoriale.",
    dateDebut: new Date("2005-12-01"),
    dateFin: null,
    sourceRef: "wp_courrier_ouest",
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (pattern seed-region-naquitaine.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-region-pdl] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
  if (type === "personne") return prisma.personne.findFirst({ where: { wikidataId } })
  if (type === "organisation") return prisma.organisation.findFirst({ where: { wikidataId } })
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
    console.warn(
      `  [SKIP] Lien ${lien.typeLienCode} ignoré — entité manquante ` +
        `(aRef=${lien.aRef} → ${entiteA ? "OK" : "MANQUANT"}, ` +
        `bRef=${lien.bRef} → ${entiteB ? "OK" : "MANQUANT"})`,
    )
    return null
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) throw new Error(`TypeLien introuvable : ${lien.typeLienCode}`)

  const fkA = fkPourEntite(lien.aType, entiteA, "A")
  const fkB = fkPourEntite(lien.bType, entiteB, "B")

  const existing = await prisma.lien.findFirst({ where: { ...fkA, ...fkB, typeLienId: typeLien.id } })
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
  console.log("  Suppression données PDL précédentes...")
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
  console.log("  Données précédentes supprimées.\n")
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n-- seed-region-pdl — Réseau d'influence Pays de la Loire --\n")
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`  User : ${user.email}\n`)

  console.log("Sources publiques :")
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  OK ${data.titre}`)
  }

  console.log("\nPersonnes :")
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  OK ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log("\nOrganisations :")
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  OK ${created.nom} (${o.wikidataId})`)
  }

  console.log("\nLiens :")
  let liensCreés = 0
  for (const lien of LIENS) {
    const result = await creerLien(lien, sourcesMap, user.id)
    if (result) {
      liensCreés++
      console.log(`  OK ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
    }
  }

  console.log("\n-- Bilan seed-region-pdl --------------------------------")
  console.log(`   Personnes     : ${PERSONNES.length} (Morançais, Rolland, Le Foll, Samzun, Bouard, Béchu)`)
  console.log(`   Organisations : ${ORGANISATIONS.length} (région, CR, communes, Chantiers, presse, Horizons)`)
  console.log(`   Sources       : ${Object.keys(SOURCES).length} (Wikipédia, France Bleu, sites officiels)`)
  console.log(`   Liens créés   : ${liensCreés} / ${LIENS.length}`)
  console.log("   Références déjà en base : PS Q170972, APE Q2826627, SIPA Q3117551,")
  console.log("                             de Villiers Q704846, Puy du Fou Q3411109,")
  console.log("                             Ouest-France Q660769")
  console.log("---------------------------------------------------------\n")
}

main()
  .catch((err) => {
    console.error("[seed-region-pdl] Échec :", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
