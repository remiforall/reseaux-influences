/**
 * Seed Mayotte — réseau d'influence de la collectivité unique (corpus OSINT 2026-07-02).
 *
 * Périmètre : figures publiques à wikidataId VÉRIFIÉ (wbsearchentities + Special:EntityData).
 * Les entités sans Q-id confirmé sont EXCLUES (couverture Wikidata limitée sur Mayotte — normal).
 *
 * Personnes (6) : Ben Issa Ousseni, Soibahadine Ibrahim Ramadani,
 *                 Ambdilwahedou Soumaila, Estelle Youssouffa,
 *                 Mansour Kamardine, Anchya Bamana.
 * Organisations (5) : Conseil départemental de Mayotte, Commune de Mamoudzou,
 *                     Assemblée nationale, Les Républicains, Rassemblement National.
 * Liens (12) : mandats électifs, anciens mandats, affiliations partisanes, lien de succession.
 *
 * Sources : Wikidata (tous Q-id vérifiés via Special:EntityData),
 *           Wikipédia FR/EN, mayotte.fr, assemblee-nationale.fr, la1ere/franceinfo,
 *           outremers360.
 *
 * Nota bene (statut juridique) :
 *   - La loi programme 2026 pour la refondation de Mayotte transforme le statut du territoire
 *     en "Département-Région" et renomme le Conseil départemental "Assemblée de Mayotte".
 *     Le Q-id Q23782076 reste valide (entité continue ; label Wikidata en cours de MAJ).
 *   - Aucune affaire judiciaire avec statut procédural documenté >= 2 sources indépendantes
 *     identifiée : champ non renseigné (règle déontologique §8).
 *   - Préfet de Mayotte (Frédéric Poisot depuis mai 2026) : pas de Q-id Wikidata vérifié
 *     au 2026-07-02 — à intégrer dès disponible.
 *
 * Entités EXCLUES faute de Q-id Wikidata vérifié :
 *   - Maires de Koungou, Dembeni, Sada (hors Bamana qui était maire de Sada avant sa suppléance)
 *   - Le Journal de Mayotte / Mayotte Hebdo
 *   - Préfet de Mayotte (Frédéric Poisot, mai 2026)
 *
 * Garde-fous projet (ADR-006 / ADR-010) :
 *   - Statut EN_ATTENTE systématique — jamais VALIDE auto.
 *   - qualiteInfluence obligatoire sur chaque personne.
 *   - Idempotent : upsert par wikidataId.
 *
 * Usage :
 *   cd backend && node bin/seed-region-mayotte.js
 *   cd backend && node bin/seed-region-mayotte.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — recoupées ≥ 2 sources publiques (Wikidata + Wikipedia + source officielle).
// Double quotes sur les chaînes contenant des apostrophes françaises (Prettier singleQuote).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q63765801 + Wikipédia FR + mayotte.fr (fiche officielle présidence)
    // Q63765801 vérifié via Special:EntityData : "French politician", président CD depuis 01/07/2021,
    // né 11/07/1973, membre de LR (P102), conseiller du canton de Tsingoni (P39).
    nom: 'Ousseni',
    prenom: 'Ben Issa',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1973-07-11'),
    lieuNaissance: 'Mamoudzou (Mayotte)',
    rolePrincipal: 'Président du Conseil départemental de Mayotte',
    rolesSecondaires: [
      'conseiller départemental du canton de Tsingoni (depuis 2015)',
      "ancien conseiller général du canton de M'tsangamouji (2011-2015)",
      'membre de Les Républicains',
    ],
    bio:
      "Issu du secteur privé, Ben Issa Ousseni est conseiller départemental du canton de Tsingoni depuis 2015 " +
      "et préside le Conseil départemental de Mayotte depuis le 1er juillet 2021, après avoir battu " +
      "Maynounati Ahamadi Moussa par 14 voix contre 12. Membre des Républicains, il pilote la collectivité " +
      "dans un contexte de pression migratoire et de reconstruction post-cyclone Chido (décembre 2024).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Ben_Issa_Ousseni',
    wikidataId: 'Q63765801',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3488937 + Wikipédia EN + mayotte.fr (biographie officielle)
    // Q3488937 vérifié : président CD 2015-2021, sénateur 2004-2011, né 05/03/1949, LR.
    nom: 'Ibrahim Ramadani',
    prenom: 'Soibahadine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1949-03-05'),
    rolePrincipal: 'Ancien président du Conseil départemental de Mayotte',
    rolesSecondaires: [
      'ancien sénateur de Mayotte (2004-2011)',
      'membre de Les Républicains (ex-UMP)',
      "docteur en sciences de l'éducation (Université de Bordeaux, 1980)",
    ],
    bio:
      "Philosophe de formation (Université de Bordeaux, thèse 1980), Soibahadine Ibrahim Ramadani " +
      "a été sénateur de Mayotte de 2004 à 2011. Il a présidé le Conseil départemental de Mayotte " +
      "du 2 avril 2015 au 1er juillet 2021, succédant à Daniel Zaïdani. " +
      "Membre de l'UMP puis des Républicains.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Soibahadine_Ibrahim_Ramadani',
    wikidataId: 'Q3488937',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q123497981 + mamoudzou.yt + la1ere/franceinfo (réélection mars 2026)
    // Q123497981 vérifié : maire Mamoudzou depuis 05/07/2020 (réélu 15/03/2026), né 25/02/1982.
    // P102 = Q20012759 (LR) confirmé dans l'EntityData Wikidata.
    nom: 'Soumaila',
    prenom: 'Ambdilwahedou',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1982-02-25'),
    lieuNaissance: 'Mayotte',
    rolePrincipal: 'Maire de Mamoudzou',
    rolesSecondaires: [
      "président de l'Association des maires de Mayotte (depuis juin 2026)",
      "président de CADEMA (Communauté d'agglomération Dembéni-Mamoudzou)",
      'membre de Les Républicains',
    ],
    bio:
      "Ambdilwahedou Soumaila est maire de Mamoudzou depuis le 5 juillet 2020 et a été réélu " +
      "le 15 mars 2026 avec une majorité élargie (42 sièges sur 49 au conseil municipal). " +
      "Élu le 6 juin 2026 président de l'Association des maires de Mayotte, il préside aussi " +
      "CADEMA. Il incarne la reconstruction de la capitale après le cyclone Chido (décembre 2024).",
    wikipediaUrl: 'https://www.mamoudzou.yt',
    wikidataId: 'Q123497981',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q107449933 + Wikipédia FR + assemblee-nationale.fr (fiche PA796078)
    // Q107449933 vérifié : née 31/07/1978 à Châtenay-Malabry, 2 mandats (22/06/2022 et 01/07/2024).
    nom: 'Youssouffa',
    prenom: 'Estelle',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1978-07-31'),
    lieuNaissance: 'Châtenay-Malabry (Hauts-de-Seine)',
    rolePrincipal: 'Députée de Mayotte (1ère circonscription)',
    rolesSecondaires: [
      "vice-présidente de la délégation aux Outre-mer de l'Assemblée nationale",
      'ancienne journaliste (LCI, Al Jazeera English, BFM TV)',
      'ancienne enseignante-chercheuse (Paris-Dauphine)',
      "membre de l'UDI, groupe LIOT à l'Assemblée nationale",
    ],
    bio:
      "Journaliste de formation (IUT Tours, Université du Québec à Montréal), Estelle Youssouffa " +
      "a travaillé pour LCI, Al Jazeera English et BFM TV avant de s'engager en politique. " +
      "Élue députée de la 1ère circonscription de Mayotte le 22 juin 2022 (66,6 % au 2e tour), " +
      "sans étiquette puis UDI/LIOT, elle est réélue au 1er tour en juillet 2024 avec 79,5 % — " +
      "meilleur score de France. Vice-présidente de la délégation aux Outre-mer.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Estelle_Youssouffa',
    wikidataId: 'Q107449933',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3286565 + Wikipédia EN + assemblee-nationale.fr (fiche PA267901, mandat clos)
    // Q3286565 vérifié : né 23/03/1959 à Sada, député LR 2ème circ. Mayotte 2002-2007 et 2017-2024.
    nom: 'Kamardine',
    prenom: 'Mansour',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1959-03-23'),
    lieuNaissance: 'Sada (Mayotte)',
    rolePrincipal: 'Ancien député de Mayotte (2ème circonscription)',
    rolesSecondaires: [
      'avocat',
      'membre de Les Républicains',
      'ancien député Mayotte 2002-2007 et 2017-2024',
    ],
    bio:
      "Avocat de profession, Mansour Kamardine a été l'un des parlementaires mahorais les plus " +
      "expérimentés : député de 2002 à 2007, puis de 2017 à 2024 pour la 2ème circonscription de Mayotte. " +
      "Membre des Républicains, il perd son siège lors des législatives de juillet 2024 face à Anchya Bamana (RN). " +
      "Longtemps figure de la droite classique à Mayotte.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Mansour_Kamardine',
    wikidataId: 'Q3286565',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q65564667 + Wikipédia EN + la1ere/franceinfo (élection juillet 2024)
    // Q65564667 vérifié : née 12/03/1971 à Sada, ancienne maire de Sada (2014-2020),
    // deputée RN 2ème circ. Mayotte depuis 08/07/2024 (53,8 % au 2nd tour, 12 974 voix).
    nom: 'Bamana',
    prenom: 'Anchya',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1971-03-12'),
    lieuNaissance: 'Sada (Mayotte)',
    rolePrincipal: 'Députée de Mayotte (2ème circonscription)',
    rolesSecondaires: [
      'ancienne maire de Sada (2014-2020)',
      'membre du Rassemblement National',
      "première deputée RN élue en Outre-mer (2024)",
    ],
    bio:
      "Anchya Bamana, ancienne maire de Sada (2014-2020), est élue le 8 juillet 2024 deputée " +
      "de la 2ème circonscription de Mayotte sous l'étiquette Rassemblement National, " +
      "avec 53,8 % des voix (12 974 voix). Elle devient la première élue RN dans une circonscription " +
      "d'Outre-mer. Elle remplace Mansour Kamardine (LR) et porte les questions de sécurité " +
      "et de maîtrise de l'immigration irrégulière.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Anchya_Bamana',
    wikidataId: 'Q65564667',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — uniquement entités à wikidataId VÉRIFIÉ.
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q23782076 + Wikipédia FR + mayotte.fr
    // Q23782076 vérifié : conseil départemental de Mayotte (assemblée délibérante, code cg976)
    // Note : renommé "Assemblée de Mayotte" par la loi programme 2026 (Département-Région).
    nom: 'Conseil départemental de Mayotte',
    sigle: 'CD976',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.mayotte.fr',
    description:
      "Assemblée délibérante de Mayotte (département n°976), héritière du Conseil général. " +
      "Ben Issa Ousseni en est le président depuis le 1er juillet 2021. " +
      "La loi programme 2026 pour la refondation de Mayotte l'a rebaptisée « Assemblée de Mayotte » " +
      "dans le cadre du nouveau statut de Département-Région.",
    dateCreation: new Date('2011-03-31'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Conseil_d%C3%A9partemental_de_Mayotte',
    wikidataId: 'Q23782076',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q132676 + mamoudzou.yt + Wikipédia FR (Mamoudzou)
    // Q132676 vérifié : commune de Mamoudzou, chef-lieu de Mayotte.
    nom: 'Commune de Mamoudzou',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.mamoudzou.yt',
    description:
      "Commune chef-lieu de Mayotte et ville la plus peuplée du département (environ 90 000 hab.). " +
      "Ambdilwahedou Soumaila en est le maire depuis 2020, réélu en 2026. " +
      "Siège de la préfecture de Mayotte.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Mamoudzou',
    wikidataId: 'Q132676',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q193582 + assemblee-nationale.fr
    // Q193582 vérifié : Assemblée nationale, chambre basse du Parlement français (Ve République).
    nom: 'Assemblée nationale',
    sigle: 'AN',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.assemblee-nationale.fr',
    description:
      "Chambre basse du Parlement français sous la Ve République, instituée le 9 décembre 1958. " +
      "Mayotte dispose de deux circonscriptions législatives, représentées par Estelle Youssouffa " +
      "(1ère circ.) et Anchya Bamana (2ème circ.) depuis les élections de 2022 et 2024.",
    dateCreation: new Date('1958-12-09'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Assembl%C3%A9e_nationale_(France)',
    wikidataId: 'Q193582',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q20012759 + Wikipédia FR
    // Q20012759 vérifié : "The Republicans" (France), parti politique fondé le 30 mai 2015 (ex-UMP).
    // Confirmé comme P102 d'Ambdilwahedou Soumaila dans son EntityData Wikidata.
    nom: 'Les Républicains',
    sigle: 'LR',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://republicains.fr',
    description:
      "Parti politique de droite française fondé le 30 mai 2015 (refondation de l'UMP). " +
      "Prépondérant à Mayotte depuis la départementalisation : Ben Issa Ousseni, " +
      "Soibahadine Ibrahim Ramadani, Mansour Kamardine et Ambdilwahedou Soumaila en sont membres.",
    dateCreation: new Date('2015-05-30'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_R%C3%A9publicains',
    wikidataId: 'Q20012759',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q205150 + Wikipédia FR + la1ere (élection Anchya Bamana 2024)
    // Q205150 vérifié : Rassemblement national, anciennement Front national (renommé 2018).
    nom: 'Rassemblement National',
    sigle: 'RN',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.rassemblementnational.fr',
    description:
      "Parti politique français fondé en 1972 sous le nom Front national, " +
      "renommé Rassemblement national en 2018. Anchya Bamana, élue deputée de Mayotte en juillet 2024, " +
      "est la première élue RN dans une circonscription d'Outre-mer.",
    dateCreation: new Date('1972-10-05'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Rassemblement_national_(France)',
    wikidataId: 'Q205150',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_ben_issa: {
    url: 'https://fr.wikipedia.org/wiki/Ben_Issa_Ousseni',
    titre: 'Ben Issa Ousseni — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2024-01-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Politicien français (LR), conseiller du canton de Tsingoni, président du CD Mayotte depuis le 1er juillet 2021.',
    verifiee: true,
  },
  mayotte_fr_president: {
    url: 'https://www.mayotte.fr/le-conseil-departemental/assemblee-departementale/le-president',
    titre: 'Ben Issa Ousseni — Président du Conseil départemental (mayotte.fr)',
    media: 'Département de Mayotte (mayotte.fr)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2021-07-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Conseil départemental de Mayotte',
    description: 'Fiche officielle du président du Conseil départemental de Mayotte : Ben Issa Ousseni.',
    verifiee: true,
  },
  wp_soibahadine: {
    url: 'https://en.wikipedia.org/wiki/Soibahadine_Ibrahim_Ramadani',
    titre: 'Soibahadine Ibrahim Ramadani — Wikipedia (EN)',
    media: 'Wikipedia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2024-01-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Franco-Mahorais politician, president of the Departmental Council of Mayotte (2015-2021), senator (2004-2011), LR.',
    verifiee: true,
  },
  mayotte_fr_bio_soibahadine: {
    url: 'https://www.mayotte.fr/le-conseil-departemental/institution/les-presidents-depuis-1977/ramadani',
    titre: 'Biographie de Soibahadine Ibrahim Ramadani — mayotte.fr',
    media: 'Département de Mayotte (mayotte.fr)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2021-07-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Conseil départemental de Mayotte',
    description: 'Biographie officielle de Soibahadine Ibrahim Ramadani, ancien président du CD Mayotte.',
    verifiee: true,
  },
  la1ere_soumaila_reelu: {
    url: 'https://la1ere.franceinfo.fr/mayotte/le-conseil-municipal-de-mamoudzou-est-installe-avec-une-majorite-plus-large-pour-le-maire-reelu-ambdilwahedou-soumaila-1683777.html',
    titre: 'Ambdilwahedou Soumaila officiellement réélu comme maire de Mamoudzou — La 1ère',
    media: 'La 1ère (France Info)',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-03-15'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction La 1ère Mayotte',
    description:
      "Ambdilwahedou Soumaila réélu maire de Mamoudzou avec 42 sièges sur 49, élu à la tête de l'AMM.",
    verifiee: true,
  },
  mamoudzou_yt_soumaila: {
    url: 'https://www.mamoudzou.yt/actualite/ambdilwahedou-soumaila-elu-maire-de-mamoudzou/',
    titre: 'Ambdilwahedou Soumaila élu maire de Mamoudzou — mamoudzou.yt',
    media: 'Ville de Mamoudzou (mamoudzou.yt)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2020-07-05'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Ville de Mamoudzou',
    description: "Communiqué officiel de l'élection d'Ambdilwahedou Soumaila comme maire (05/07/2020).",
    verifiee: true,
  },
  wp_youssouffa: {
    url: 'https://fr.wikipedia.org/wiki/Estelle_Youssouffa',
    titre: 'Estelle Youssouffa — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2024-07-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Journaliste et politicienne, deputée Mayotte 1ère circ. depuis 2022, réélue 2024 à 79,5 % — meilleur score FR.',
    verifiee: true,
  },
  an_youssouffa: {
    url: 'https://www.assemblee-nationale.fr/dyn/deputes/PA796078',
    titre: 'Estelle Youssouffa — fiche deputée (Assemblée nationale)',
    media: 'Assemblée nationale',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2022-06-22'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Assemblée nationale',
    description: 'Fiche officielle deputée Estelle Youssouffa, 1ère circ. Mayotte, groupe LIOT/UDI.',
    verifiee: true,
  },
  wp_kamardine_en: {
    url: 'https://en.wikipedia.org/wiki/Mansour_Kamardine',
    titre: 'Mansour Kamardine — Wikipedia (EN)',
    media: 'Wikipedia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2024-07-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description: 'Lawyer and LR politician, deputy of Mayotte (2nd circ.) 2002-2007 and 2017-2024.',
    verifiee: true,
  },
  an_kamardine: {
    url: 'https://www.assemblee-nationale.fr/dyn/deputes/PA267901',
    titre: 'Mansour Kamardine — fiche deputée (Assemblée nationale, mandat clos)',
    media: 'Assemblée nationale',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-06-09'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Assemblée nationale',
    description: 'Fiche officielle Mansour Kamardine (mandat clos 09/06/2024), LR, 2ème circ. Mayotte.',
    verifiee: true,
  },
  wp_bamana_en: {
    url: 'https://en.wikipedia.org/wiki/Anchya_Bamana',
    titre: 'Anchya Bamana — Wikipedia (EN)',
    media: 'Wikipedia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2024-07-15'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'RN politician, former mayor of Sada, first RN deputy elected in an overseas constituency (Mayotte 2nd, July 2024).',
    verifiee: true,
  },
  la1ere_bamana_elue: {
    url: 'https://la1ere.franceinfo.fr/mayotte/resultats-legislatives-2024-anchya-bamana-est-elue-deputee-de-la-deuxieme-circonscription-pour-le-rassemblement-national-1504022.html',
    titre: 'Anchya Bamana élue deputée de la 2ème circ. pour le RN — La 1ère',
    media: 'La 1ère (France Info)',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-07-08'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction La 1ère Mayotte',
    description:
      'Anchya Bamana élue deputée RN de la 2ème circ. de Mayotte avec 53,8 % des voix (12 974 votes).',
    verifiee: true,
  },
  wp_cd_mayotte: {
    url: 'https://fr.wikipedia.org/wiki/Conseil_d%C3%A9partemental_de_Mayotte',
    titre: 'Conseil départemental de Mayotte — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2024-01-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Histoire et composition du Conseil départemental de Mayotte, assemblée délibérante de la collectivité.',
    verifiee: true,
  },
  la1ere_ousseni_elu: {
    url: 'https://la1ere.franceinfo.fr/mayotte/mayotte-ben-issa-ousseni-elu-president-du-conseil-departemental-1041337.html',
    titre: 'Ben Issa Ousseni élu président du Conseil départemental — La 1ère',
    media: 'La 1ère (France Info)',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2021-07-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction La 1ère Mayotte',
    description:
      'Ben Issa Ousseni élu 7ème président du Conseil départemental de Mayotte le 1er juillet 2021.',
    verifiee: true,
  },
  wp_lr: {
    url: 'https://fr.wikipedia.org/wiki/Les_R%C3%A9publicains',
    titre: 'Les Républicains — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2024-01-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Parti politique de droite française (ex-UMP), fondé le 30 mai 2015, prépondérant à Mayotte.',
    verifiee: true,
  },
  wp_rn: {
    url: 'https://fr.wikipedia.org/wiki/Rassemblement_national_(France)',
    titre: 'Rassemblement national — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2024-01-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description: 'Parti politique français, renommé de Front national en Rassemblement national en 2018.',
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002).
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Mandats électifs en cours ---
  {
    // P-O : Ben Issa Ousseni, président du Conseil départemental
    aType: 'personne',
    aRef: 'Q63765801',
    bType: 'organisation',
    bRef: 'Q23782076',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Ben Issa Ousseni est président du Conseil départemental de Mayotte depuis le 1er juillet 2021, " +
      "élu par l'assemblée avec 14 voix contre 12.",
    dateDebut: new Date('2021-07-01'),
    dateFin: null,
    sourceRef: 'la1ere_ousseni_elu',
  },
  {
    // P-O : Ambdilwahedou Soumaila, maire de Mamoudzou
    aType: 'personne',
    aRef: 'Q123497981',
    bType: 'organisation',
    bRef: 'Q132676',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Ambdilwahedou Soumaila est maire de Mamoudzou depuis le 5 juillet 2020, réélu le 15 mars 2026 " +
      "avec 42 sièges sur 49 au conseil municipal.",
    dateDebut: new Date('2020-07-05'),
    dateFin: null,
    sourceRef: 'mamoudzou_yt_soumaila',
  },
  {
    // P-O : Estelle Youssouffa, deputée 1ère circ. Mayotte
    aType: 'personne',
    aRef: 'Q107449933',
    bType: 'organisation',
    bRef: 'Q193582',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Estelle Youssouffa est deputée de la 1ère circonscription de Mayotte depuis le 22 juin 2022, " +
      "réélue au 1er tour le 1er juillet 2024 avec 79,5 % des voix (meilleur score national).",
    dateDebut: new Date('2022-06-22'),
    dateFin: null,
    sourceRef: 'an_youssouffa',
  },
  {
    // P-O : Anchya Bamana, deputée 2ème circ. Mayotte (RN, depuis juillet 2024)
    aType: 'personne',
    aRef: 'Q65564667',
    bType: 'organisation',
    bRef: 'Q193582',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Anchya Bamana est deputée de la 2ème circonscription de Mayotte depuis le 8 juillet 2024, " +
      "sous l'étiquette Rassemblement National (53,8 % au 2nd tour — première élue RN en Outre-mer).",
    dateDebut: new Date('2024-07-08'),
    dateFin: null,
    sourceRef: 'la1ere_bamana_elue',
  },

  // --- Anciens mandats ---
  {
    // P-O : Soibahadine Ibrahim Ramadani, ancien président du CD Mayotte
    aType: 'personne',
    aRef: 'Q3488937',
    bType: 'organisation',
    bRef: 'Q23782076',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Soibahadine Ibrahim Ramadani a présidé le Conseil départemental de Mayotte du 2 avril 2015 " +
      "au 1er juillet 2021 (non réélu, battu par Ben Issa Ousseni par 14 voix contre 12).",
    dateDebut: new Date('2015-04-02'),
    dateFin: new Date('2021-07-01'),
    sourceRef: 'mayotte_fr_bio_soibahadine',
  },
  {
    // P-O : Mansour Kamardine, ancien deputée 2ème circ. Mayotte
    aType: 'personne',
    aRef: 'Q3286565',
    bType: 'organisation',
    bRef: 'Q193582',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Mansour Kamardine a été député de la 2ème circonscription de Mayotte de 2017 à 2024 " +
      "(et de 2002 à 2007), perdant son siège le 9 juin 2024 face à Anchya Bamana (RN).",
    dateDebut: new Date('2017-06-18'),
    dateFin: new Date('2024-06-09'),
    sourceRef: 'an_kamardine',
  },

  // --- Affiliations partisanes ---
  {
    // P-O : Ben Issa Ousseni → Les Républicains
    aType: 'personne',
    aRef: 'Q63765801',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Ben Issa Ousseni est membre des Républicains (ex-UMP) depuis 2015, élu conseiller " +
      "départemental puis président du CD sous cette étiquette.",
    dateDebut: new Date('2015-05-30'),
    dateFin: null,
    sourceRef: 'wp_lr',
  },
  {
    // P-O : Soibahadine Ibrahim Ramadani → Les Républicains
    aType: 'personne',
    aRef: 'Q3488937',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Soibahadine Ibrahim Ramadani est membre de l'UMP puis des Républicains depuis le début de sa carrière, " +
      "sénateur UMP (2004-2011) et président LR du Conseil départemental (2015-2021).",
    dateDebut: new Date('2002-01-01'),
    dateFin: null,
    sourceRef: 'wp_soibahadine',
  },
  {
    // P-O : Ambdilwahedou Soumaila → Les Républicains
    aType: 'personne',
    aRef: 'Q123497981',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Ambdilwahedou Soumaila est élu maire de Mamoudzou sous l'étiquette Les Républicains " +
      "et réélu en 2026 avec la même appartenance partisane.",
    dateDebut: new Date('2020-01-01'),
    dateFin: null,
    sourceRef: 'la1ere_soumaila_reelu',
  },
  {
    // P-O : Mansour Kamardine → Les Républicains
    aType: 'personne',
    aRef: 'Q3286565',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Mansour Kamardine est membre de l'UMP puis des Républicains, député de Mayotte à deux reprises " +
      "(2002-2007, 2017-2024) sous cette étiquette.",
    dateDebut: new Date('2002-01-01'),
    dateFin: null,
    sourceRef: 'wp_kamardine_en',
  },
  {
    // P-O : Anchya Bamana → Rassemblement National
    aType: 'personne',
    aRef: 'Q65564667',
    bType: 'organisation',
    bRef: 'Q205150',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Anchya Bamana est membre du Rassemblement National, élue deputée de Mayotte sous cette étiquette " +
      "lors des législatives de juillet 2024.",
    dateDebut: new Date('2024-01-01'),
    dateFin: null,
    sourceRef: 'la1ere_bamana_elue',
  },

  // --- Lien de succession à la tête du Conseil départemental ---
  {
    // P-P : Ben Issa Ousseni succède à Soibahadine Ibrahim Ramadani
    aType: 'personne',
    aRef: 'Q63765801',
    bType: 'personne',
    bRef: 'Q3488937',
    typeLienCode: 'politique',
    description:
      "Ben Issa Ousseni a remplacé Soibahadine Ibrahim Ramadani à la présidence du Conseil " +
      "départemental de Mayotte le 1er juillet 2021 (14 voix contre 12).",
    dateDebut: new Date('2021-07-01'),
    dateFin: null,
    sourceRef: 'la1ere_ousseni_elu',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-mayotte] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

async function upsertPersonne(data, userId) {
  const existing = await prisma.personne.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.personne.update({ where: { id: existing.id }, data: { ...data, statut: 'EN_ATTENTE' } })
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
  if (type === 'personne') return prisma.personne.findFirst({ where: { wikidataId } })
  if (type === 'organisation') return prisma.organisation.findFirst({ where: { wikidataId } })
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
      `[seed-mayotte] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
    )
  }
  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`[seed-mayotte] TypeLien introuvable : ${lien.typeLienCode}`)
  }
  const fkA = fkPourEntite(lien.aType, entiteA, 'A')
  const fkB = fkPourEntite(lien.bType, entiteB, 'B')
  const existing = await prisma.lien.findFirst({ where: { ...fkA, ...fkB, typeLienId: typeLien.id } })
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
  console.log('Suppression données Mayotte précédentes...')
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
  console.log('Données précédentes supprimées.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n--- seed-mayotte — Réseau d'influence de Mayotte (corpus 2026-07-02) ---\n")
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('-- Sources publiques --')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok  ${data.titre}`)
  }

  console.log('\n-- Personnes (Wikidata vérifié) --')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ok  ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n-- Organisations (Wikidata vérifié) --')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ok  ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n-- Liens --')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok  ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n--- Bilan ---')
  console.log(`  Personnes     : ${PERSONNES.length}`)
  console.log(`  Organisations : ${ORGANISATIONS.length}`)
  console.log(`  Sources       : ${Object.keys(SOURCES).length}`)
  console.log(`  Liens         : ${LIENS.length}`)
  console.log('\n  Entités exclues faute de Q-id Wikidata vérifié :')
  console.log('    - Préfet de Mayotte (Frédéric Poisot, nommé mai 2026)')
  console.log('    - Maires de Koungou, Dembeni (hors Bamana déjà dedans)')
  console.log('    - Le Journal de Mayotte / Mayotte Hebdo')
  console.log('    - Affaires judiciaires : aucune avec statut procédural >= 2 sources\n')
}

main()
  .catch((err) => {
    console.error('[seed-mayotte] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
