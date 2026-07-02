/**
 * Seed Région Île-de-France — réseau d'influence institutionnel, politique et économique.
 * Enquête OSINT du 2026-07-02.
 *
 * Périmètre :
 *   PERSONNALITÉS NOUVELLES (non encore en base) :
 *     • Valérie Pécresse (Q455023) — Présidente du conseil régional IDF (depuis déc. 2015),
 *       ex-candidate LR à la présidentielle 2022, fondatrice de Libres! (2023).
 *     • Anne Hidalgo (Q2851133) — Maire de Paris (depuis avr. 2014), présidente de la
 *       Métropole du Grand Paris (depuis jan. 2016), ex-candidate PS à la présidentielle 2022.
 *     • Rachida Dati (Q27182) — ancienne ministre de la Culture (jan.-sep. 2024 gouvernement
 *       Attal, puis gouvernement Bayrou à partir de déc. 2024), ancienne maire du 7e
 *       arrondissement de Paris (2008-2024), eurodéputée LR (2009-2019).
 *
 *   PERSONNALITÉS DÉJÀ EN BASE (référencées dans les liens par wikidataId uniquement) :
 *     Jean Castex (Q3171170) [seed-macron-gouvernements.js] — ex-Premier ministre (2020-2022),
 *       PDG RATP Group (nov. 2022 - nov. 2025), PDG SNCF (depuis nov. 2025).
 *     Parti socialiste (Q170972) [seed-hollande.js].
 *     Les Républicains (Q20012759) [seed-partis-chefs.js].
 *
 *   ORGANISATIONS NOUVELLES :
 *     • Région Île-de-France (Q124156216) — collectivité territoriale (8 dép., 12 M hab.).
 *     • Ville de Paris (Q90) — commune et collectivité sui generis (loi 28 fév. 2017).
 *     • Métropole du Grand Paris (Q16665915) — EPCI, 131 communes, créé 1er jan. 2016.
 *     • RATP Group (Q643290) — EPIC transport en commun IDF, fondé 1948.
 *     • Île-de-France Mobilités (Q1747944) — autorité organisatrice des mobilités IDF (ex-STIF).
 *     • SNCF (Q13646) — groupe ferroviaire public national, siège à Saint-Denis (IDF).
 *
 *   AFFAIRE NOTABLE (présomption d'innocence — obligatoire) :
 *     Enquête préliminaire ouverte fin septembre 2022 (BRDE / PNF) pour « détournement de
 *     fonds publics » et « financement illicite de campagne électorale » concernant l'usage
 *     supposé de ressources de la région IDF pour la campagne présidentielle 2022 de Valérie
 *     Pécresse (plainte de Julien Bayou, EELV, avril 2022).
 *     Classée sans suite par le parquet en novembre 2024. Aucune mise en examen documentée.
 *     Présomption d'innocence intacte.
 *     NB : une seconde enquête pour « recel d'abus de confiance » (conditions de location
 *     d'un local de campagne, signalement de la CNCCFP) a également été ouverte —
 *     statut inconnu à la date de consultation (2026-07-02 — aucune source publique récente
 *     confirmant une issue).
 *     Sources : France Info (14 nov. 2024) + France Bleu (27 sep. 2022).
 *
 *   PANTOUFLAGE NOTABLE :
 *     Jean Castex (ex-PM) → PDG RATP Group (2022-2025) → PDG SNCF (2025-).
 *     Source : Europe 1 (23 oct. 2025).
 *
 *   HORS PÉRIMÈTRE (déjà en base dans d'autres seeds, ou Q-id non vérifié) :
 *     Bernard Arnault / LVMH (seed-fortunes-1) · Xavier Niel / Iliad (seed-fortunes-3)
 *     Vincent Bolloré (seed-fortunes-2) · Serge Dassault (seed-fortunes-1)
 *     Le Parisien Q142348, Groupe Les Échos-Le Parisien Q3117475 (seed-raffermir-medias)
 *     Patrick Balkany Q945181 · Nicolas Sarkozy Q329 (seed-scandales-hauts-de-seine)
 *     Préfet Georges-François Leclerc Q47546497 (seed-hauts-fonctionnaires)
 *     ADP Q252869, Safran, Thales, Veolia, Capgemini → CAC40, exclus par le brief
 *     JCDecaux — Q-id Wikidata non vérifié à la date de consultation → exclu, à compléter
 *
 * DÉPENDANCES (seeds à lancer avant ce seed, dans l'ordre) :
 *   node bin/seed-demo.js                    (crée compte admin remi@reseauxinfluences.fr)
 *   node bin/seed-hollande.js                (crée Parti socialiste Q170972)
 *   node bin/seed-partis-chefs.js            (crée Les Républicains Q20012759)
 *   node bin/seed-macron-gouvernements.js    (crée Jean Castex Q3171170)
 *
 * Q-ids tous vérifiés via wbsearchentities + Special:EntityData le 2026-07-02 :
 *   Q455023  Valérie Pécresse · Q2851133  Anne Hidalgo · Q27182  Rachida Dati
 *   Q124156216  Région Île-de-France (administration régionale)
 *   Q90  Paris (commune/ville) · Q16665915  Métropole du Grand Paris
 *   Q643290  RATP · Q1747944  Île-de-France Mobilités · Q13646  SNCF
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - présomption d'innocence respectée sur toutes les affaires judiciaires
 *   - dateConsultation : 2026-07-02
 *
 * Usage :
 *   cd backend && node bin/seed-region-idf.js
 *   cd backend && node bin/seed-region-idf.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — chacune recoupée par >= 2 sources publiques (cf. commentaires).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q455023 (vérifié wbsearchentities 2026-07-02 : label FR "Valérie Pécresse",
    //           description "French politician (born 1967)") + Wikipédia FR (Valérie Pécresse)
    // Rôle public attesté : présidente du conseil régional d'Île-de-France (déc. 2015),
    //   réélue le 3 juillet 2021 avec 45,9 % des voix (UE 2e tour).
    //   Candidate LR à la présidentielle 2022 : 4,78 % au 1er tour (3 277 017 voix).
    //   Fondatrice de Libres! (mouvement dans le giron LR dès 2019, rupture formelle mai 2023
    //   après l'élection d'Éric Ciotti à la présidence de LR).
    nom: 'Pécresse',
    prenom: 'Valérie',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-07-14'),
    lieuNaissance: 'Neuilly-sur-Seine (Hauts-de-Seine)',
    rolePrincipal: "Présidente du conseil régional d'Île-de-France",
    rolesSecondaires: [
      "présidente d'Île-de-France Mobilités (2016-)",
      "ancienne ministre du Budget (2011-2012)",
      "ancienne ministre de l'Enseignement supérieur et de la Recherche (2007-2011)",
      "ancienne sénatrice de l'Essonne (2016-2020)",
      "candidate LR à la présidentielle 2022",
      "fondatrice de Libres! (2023)",
    ],
    bio:
      "Ancienne élève de l'ENA (promotion Michel de Montaigne 1994) et de Sciences Po Paris, " +
      "Valérie Pécresse a été ministre de l'Enseignement supérieur (2007-2011) puis du Budget " +
      "(2011-2012) sous Nicolas Sarkozy. Elle remporte les élections régionales en Île-de-France " +
      "le 18 décembre 2015, première femme à présider la région. Réélue le 3 juillet 2021, " +
      "elle est candidate LR à la présidentielle 2022 (4,78 % au 1er tour). " +
      "Elle quitte LR en mai 2023 après la victoire d'Éric Ciotti à la tête du parti.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Val%C3%A9rie_P%C3%A9cresse",
    wikidataId: 'Q455023',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2851133 (vérifié wbsearchentities 2026-07-02 : label FR "Anne Hidalgo",
    //           description "Spanish–French politician") + Wikipédia FR (Anne Hidalgo)
    // Rôle public attesté : première femme élue maire de Paris (5 avr. 2014), réélue le
    //   4 juillet 2020. Présidente de la Métropole du Grand Paris depuis le 22 janvier 2016.
    //   Candidate PS à la présidentielle 2022 : 1,75 % au 1er tour.
    nom: 'Hidalgo',
    prenom: 'Anne',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1959-06-19'),
    lieuNaissance: 'San Fernando (Espagne)',
    rolePrincipal: 'Maire de Paris, présidente de la Métropole du Grand Paris',
    rolesSecondaires: [
      "première adjointe au maire de Paris Bertrand Delanoë (2001-2014)",
      "présidente de la Métropole du Grand Paris (2016-)",
      "candidate PS à la présidentielle 2022",
      "ancienne inspectrice du travail",
    ],
    bio:
      "Née en Espagne, naturalisée française, Anne Hidalgo est ancienne inspectrice du travail. " +
      "Première adjointe de Bertrand Delanoë à la mairie de Paris (2001-2014), elle devient " +
      "la première femme élue maire de Paris le 5 avril 2014 et est réélue le 4 juillet 2020. " +
      "Elle préside la Métropole du Grand Paris depuis sa création en janvier 2016 et a été " +
      "candidate PS à la présidentielle 2022 (1,75 % au 1er tour).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Anne_Hidalgo',
    wikidataId: 'Q2851133',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q27182 (vérifié wbsearchentities 2026-07-02 : label FR "Rachida Dati",
    //           description "French politician and magistrate") + Wikipédia FR (Rachida Dati)
    // Rôle public attesté : ministre de la Justice (mai 2007 - juin 2009) ;
    //   eurodéputée LR (2009-2019) ; maire du 7e arrondissement de Paris (29 mars 2008 -
    //   11 janvier 2024) ; ministre de la Culture (jan. 2024 sous Attal, puis déc. 2024
    //   sous Bayrou — statut sous Lecornu à vérifier, non confirmé dans seed-macron-v2).
    nom: 'Dati',
    prenom: 'Rachida',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1965-11-27'),
    lieuNaissance: 'Chalon-sur-Saône (Saône-et-Loire)',
    rolePrincipal:
      'Ancienne ministre de la Culture (2024), ancienne maire du 7e arrondissement de Paris (2008-2024)',
    rolesSecondaires: [
      "ancienne Garde des Sceaux, ministre de la Justice (2007-2009)",
      "ancienne eurodéputée LR (2009-2019)",
      "ancienne maire du 7e arrondissement de Paris (2008-2024)",
      "candidate LR aux élections municipales de Paris 2020",
    ],
    bio:
      "Magistrate de formation, Rachida Dati est nommée Garde des Sceaux par Nicolas Sarkozy " +
      "en mai 2007, poste qu'elle quitte en juin 2009. Élue maire du 7e arrondissement de " +
      "Paris le 29 mars 2008, elle est aussi eurodéputée LR de 2009 à 2019. Elle se présente " +
      "comme candidate LR à la mairie de Paris en 2020 (battue par Anne Hidalgo). " +
      "Elle est nommée ministre de la Culture le 11 janvier 2024 dans le gouvernement Attal " +
      "et reconduite sous François Bayrou à partir de décembre 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Rachida_Dati',
    wikidataId: 'Q27182',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — toutes vérifiées via wbsearchentities (2026-07-02).
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q124156216 (vérifié : label FR "Région Île-de-France",
    //           description "regional administration in France") + Wikipédia FR
    // Entité distincte de Q13917 (territoire géographique) : Q124156216 est la collectivité
    // territoriale / administration régionale proprement dite.
    // Conseil régional élu depuis les lois Defferre (1982) ; fonctions exécutives
    // auparavant exercées par le préfet de région.
    nom: "Région Île-de-France",
    sigle: 'IDF',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.iledefrance.fr',
    description:
      "Collectivité territoriale regroupant 8 départements (Paris, Seine-et-Marne, Yvelines, " +
      "Essonne, Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne, Val-d'Oise). " +
      "12 millions d'habitants, 31 % du PIB national. Présidée par Valérie Pécresse depuis " +
      "décembre 2015.",
    dateCreation: new Date('1976-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/R%C3%A9gion_%C3%8Ele-de-France',
    wikidataId: 'Q124156216',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q90 (label FR "Paris", description "commune of France") + Wikipédia FR
    // Utilisé comme entité institutionnelle : la commune de Paris est à la fois commune
    // et département depuis la loi du 28 février 2017. Gouvernée par le Conseil de Paris
    // (163 membres élus). Maire actuelle : Anne Hidalgo (depuis avr. 2014).
    nom: 'Ville de Paris',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.paris.fr',
    description:
      "Commune et collectivité à statut particulier (commune + département depuis la loi " +
      "du 28 fév. 2017). Capitale de la France, ~2,1 millions d'habitants. " +
      "Gouvernée par le Conseil de Paris (163 membres). Maire : Anne Hidalgo (depuis 2014).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Paris',
    wikidataId: 'Q90',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q16665915 (label "Grand Paris",
    //           description "administrative structure for cooperation covering the City of Paris
    //           and its nearest surrounding suburbs") + Wikipédia FR (Métropole du Grand Paris)
    // Créée par la loi MAPTAM du 27 jan. 2014, entrée en vigueur le 1er jan. 2016.
    // Regroupe Paris + 130 communes de la petite couronne (92, 93, 94).
    nom: 'Métropole du Grand Paris',
    sigle: 'MGP',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.metropolegrandparis.fr',
    description:
      "Établissement public de coopération intercommunale (EPCI) créé le 1er janvier 2016 " +
      "(loi MAPTAM 2014). Regroupe la Ville de Paris et 130 communes de la petite couronne. " +
      "12 millions d'habitants, compétences : logement, développement économique, " +
      "environnement. Présidée par Anne Hidalgo depuis le 22 janvier 2016.",
    dateCreation: new Date('2016-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/M%C3%A9tropole_du_Grand_Paris',
    wikidataId: 'Q16665915',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q643290 (label "RATP",
    //           description "company operating public transport networks in Île-de-France")
    //           + Wikipédia FR (Régie autonome des transports parisiens)
    // EPIC fondé par décret-loi du 21 mars 1948. Opère le métro (16 lignes), le RER (partiel,
    // lignes A et B), les bus (~300 lignes), et tramways IDF.
    // Environ 45 000 agents. Pantouflage notable : Jean Castex PDG nov. 2022 - nov. 2025.
    nom: 'RATP Group',
    sigle: 'RATP',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.ratp.fr',
    description:
      "Régie Autonome des Transports Parisiens — EPIC créé en 1948. Opère métro, RER (A et B), " +
      "bus et tramways d'Île-de-France. ~45 000 agents, premier employeur public d'IDF " +
      "après la SNCF. Statut ouvert à la concurrence (bus, tram) depuis les années 2020.",
    dateCreation: new Date('1948-03-21'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/R%C3%A9gie_autonome_des_transports_parisiens',
    wikidataId: 'Q643290',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1747944 (label "Île-de-France Mobilités") + Wikipédia FR
    // Syndicat mixte ouvert (ex-STIF, Syndicat des transports d'Île-de-France, fondé 1959).
    // Renommé "Île-de-France Mobilités" (IDFM) en juin 2017. Autorité organisatrice des
    // transports (AO) de la région IDF. Budget annuel ~11 Mds€.
    // Présidé ex officio par la présidente du conseil régional d'IDF (Valérie Pécresse).
    nom: "Île-de-France Mobilités",
    sigle: 'IDFM',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.iledefrance-mobilites.fr',
    description:
      "Autorité organisatrice des transports de la région Île-de-France (ex-STIF, fondé 1959, " +
      "renommé IDFM en juin 2017). Définit et finance l'offre de transport collectif IDF " +
      "(RATP, Transilien SNCF, Optile, cars interurbains). Budget ~11 Mds€/an. " +
      "Présidé ex officio par la présidente du conseil régional IDF.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%8Ele-de-France_Mobilit%C3%A9s',
    wikidataId: 'Q1747944',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q13646 (label "Société nationale des chemins de fer français",
    //           description "national state-owned railway company of France")
    //           + Wikipédia FR (SNCF) + Europe 1 (nomination Castex PDG, oct. 2025)
    // Siège social : 2, place aux Étoiles, Saint-Denis (Seine-Saint-Denis, IDF).
    // Groupe public créé en 1938 (EPIC), transformé en groupe SA en 2020 (loi SNCF 2018).
    // Non cotée au CAC40 (EPIC puis groupe public à capitaux d'État).
    nom: 'SNCF',
    sigle: 'SNCF',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.groupe-sncf.com',
    description:
      "Groupe ferroviaire public national (créé 1938). Siège à Saint-Denis (IDF). " +
      "Comprend SNCF Réseau (gestionnaire), SNCF Voyageurs (TGV, Intercités, Transilien), " +
      "Keolis (filiale). ~150 000 agents. PDG : Jean-Pierre Farandou (2019-2025), " +
      "puis Jean Castex (depuis 3 nov. 2025).",
    dateCreation: new Date('1938-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/SNCF',
    wikidataId: 'Q13646',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_pecresse: {
    url: "https://fr.wikipedia.org/wiki/Val%C3%A9rie_P%C3%A9cresse",
    titre: "Valérie Pécresse — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "ENA 1994, ministre sous Sarkozy (Enseignement supérieur 2007-2011, Budget 2011-2012), " +
      "présidente du conseil régional IDF depuis déc. 2015, candidate présidentielle LR 2022.",
    verifiee: true,
  },
  wp_hidalgo: {
    url: 'https://fr.wikipedia.org/wiki/Anne_Hidalgo',
    titre: 'Anne Hidalgo — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Première femme maire de Paris (5 avr. 2014, réélue 2020). " +
      "Présidente Métropole du Grand Paris depuis jan. 2016. Candidate PS présidentielle 2022.",
    verifiee: true,
  },
  wp_dati: {
    url: 'https://fr.wikipedia.org/wiki/Rachida_Dati',
    titre: 'Rachida Dati — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Garde des Sceaux 2007-2009, eurodéputée 2009-2019, maire du 7e arr. Paris 2008-2024, " +
      "ministre de la Culture jan. 2024 (gouvernements Attal puis Bayrou).",
    verifiee: true,
  },
  wp_region_idf: {
    url: 'https://fr.wikipedia.org/wiki/R%C3%A9gion_%C3%8Ele-de-France',
    titre: "Région Île-de-France — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Région administrative : 8 départements, 12 M habitants, 31 % du PIB national. " +
      "Conseil régional élu depuis 1982 (lois Defferre).",
    verifiee: true,
  },
  wp_mgp: {
    url: 'https://fr.wikipedia.org/wiki/M%C3%A9tropole_du_Grand_Paris',
    titre: 'Métropole du Grand Paris — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "EPCI créé le 1er janvier 2016 (loi MAPTAM 2014). Paris + 130 communes, 12 M habitants. " +
      "Présidée par Anne Hidalgo depuis le 22 janvier 2016.",
    verifiee: true,
  },
  wp_ratp: {
    url: 'https://fr.wikipedia.org/wiki/R%C3%A9gie_autonome_des_transports_parisiens',
    titre: 'RATP — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "EPIC fondé en 1948. Opère métro, RER A et B, bus, tramways IDF. ~45 000 agents. " +
      "Jean Castex PDG nov. 2022 - nov. 2025.",
    verifiee: true,
  },
  wp_idfm: {
    url: 'https://fr.wikipedia.org/wiki/%C3%8Ele-de-France_Mobilit%C3%A9s',
    titre: "Île-de-France Mobilités — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Autorité organisatrice des transports IDF (ex-STIF 1959). Renommée IDFM en 2017. " +
      "Présidée ex officio par la présidente de la région IDF. Budget ~11 Mds€/an.",
    verifiee: true,
  },
  wp_castex: {
    url: 'https://fr.wikipedia.org/wiki/Jean_Castex',
    titre: 'Jean Castex — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Premier ministre (juil. 2020 - mai 2022). PDG RATP Group par décret du 23 nov. 2022. " +
      "Nommé PDG SNCF le 23 oct. 2025, prise de fonctions le 3 nov. 2025.",
    verifiee: true,
  },
  europe1_castex_sncf: {
    url: 'https://www.europe1.fr/societe/sncf-jean-castex-nomme-pdg-du-groupe-ferroviaire-public-pour-un-mandat-de-4-ans-869266',
    titre: 'SNCF : Jean Castex nommé PDG du groupe ferroviaire public pour un mandat de 4 ans',
    media: 'Europe 1',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-10-23'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Nomination de Jean Castex PDG du groupe SNCF pour un mandat de 4 ans (23 oct. 2025). " +
      "Prise de fonctions le 3 novembre 2025 après son départ de RATP Group.",
    verifiee: true,
  },
  fi_pecresse_enquete: {
    url: 'https://www.franceinfo.fr/politique/valerie-pecresse/info-franceinfo-campagne-de-valerie-pecresse-l-enquete-sur-des-soupcons-de-detournement-de-fonds-publics-classee-sans-suite_6337201.html',
    titre:
      "INFO FRANCEINFO. Campagne de Valérie Pécresse : l'enquête sur des soupçons de détournement de fonds publics classée sans suite",
    media: 'France Info',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-11-14'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Enquête préliminaire pour détournement de fonds publics de la région IDF classée sans " +
      "suite par le parquet en novembre 2024. Aucune mise en examen de Valérie Pécresse.",
    verifiee: true,
  },
  fb_pecresse_enquete: {
    url: 'https://www.francebleu.fr/infos/politique/campagne-presidentielle-de-valerie-pecresse-enquete-ouverte-pour-detournement-de-fonds-publics-1664283594',
    titre:
      "Campagne présidentielle de Valérie Pécresse : une enquête ouverte pour « détournement de fonds publics »",
    media: 'France Bleu',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2022-09-27'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Enquête préliminaire ouverte en septembre 2022 (BRDE) pour soupçons de détournement " +
      "de fonds publics de la région IDF au profit de la campagne 2022 (plainte Julien Bayou).",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe ADR-002. Exactement 1 entité non-nulle de chaque côté.
// Entités déjà en base référencées uniquement par wikidataId :
//   Castex (personne Q3171170), PS (organisation Q170972), LR (organisation Q20012759).
// ---------------------------------------------------------------------------

const LIENS = [
  // ─── Valérie Pécresse ─────────────────────────────────────────────────────

  {
    // P-O : Pécresse présidente du conseil régional d'Île-de-France (mandat actif)
    aType: 'personne',
    aRef: 'Q455023',
    bType: 'organisation',
    bRef: 'Q124156216',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Valérie Pécresse est présidente du conseil régional d'Île-de-France depuis le " +
      "18 décembre 2015 (élue au 2e tour des régionales, 43,8 % des voix). " +
      "Réélue le 3 juillet 2021 avec 45,9 %.",
    dateDebut: new Date('2015-12-18'),
    dateFin: null,
    sourceRef: 'wp_pecresse',
  },
  {
    // P-O : Pécresse affiliée à LR / UMP (1993 - rupture mai 2023)
    // dateFin : mai 2023 (élection d'Éric Ciotti à la présidence de LR,
    // Pécresse quitte le parti pour diriger Libres! de façon autonome).
    aType: 'personne',
    aRef: 'Q455023',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Valérie Pécresse est membre de l'UMP (devenu LR en 2015) depuis 1993. " +
      "Elle quitte formellement LR en mai 2023 après l'élection d'Éric Ciotti à la " +
      "présidence du parti, pour mener Libres! de manière indépendante.",
    dateDebut: new Date('1993-01-01'),
    dateFin: new Date('2023-05-31'),
    sourceRef: 'wp_pecresse',
  },
  {
    // P-O : Pécresse présidente d'IDFM (fonction ex officio liée à la présidence de la région)
    aType: 'personne',
    aRef: 'Q455023',
    bType: 'organisation',
    bRef: 'Q1747944',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Valérie Pécresse préside Île-de-France Mobilités depuis le 1er janvier 2016, " +
      "fonction exercée ex officio par la présidente du conseil régional d'Île-de-France.",
    dateDebut: new Date('2016-01-01'),
    dateFin: null,
    sourceRef: 'wp_idfm',
  },
  {
    // P-O : lien juridique — ENQUÊTE CLASSÉE SANS SUITE (présomption d'innocence)
    // Statut exact : enquête préliminaire ouverte sept. 2022, classée sans suite nov. 2024.
    // Aucune mise en examen. Aucune condamnation. Présomption d'innocence totale.
    // Description volontairement précise sur le statut procédural pour ne pas induire en erreur.
    aType: 'personne',
    aRef: 'Q455023',
    bType: 'organisation',
    bRef: 'Q124156216',
    typeLienCode: 'juridique',
    description:
      "ENQUÊTE CLASSÉE SANS SUITE — nov. 2024. Enquête préliminaire (BRDE / PNF) ouverte " +
      "en septembre 2022 pour soupçons de détournement de fonds publics de la région IDF " +
      "et financement illicite de campagne électorale (plainte Julien Bayou, EELV, avr. 2022). " +
      "Classée sans suite par le parquet en novembre 2024. Aucune mise en examen. " +
      "Présomption d'innocence de Valérie Pécresse intacte. " +
      "NB : une seconde enquête pour recel d'abus de confiance (CNCCFP) a également été " +
      "ouverte — statut inconnu au 2026-07-02.",
    dateDebut: new Date('2022-09-27'),
    dateFin: new Date('2024-11-14'),
    sourceRef: 'fi_pecresse_enquete',
  },

  // ─── Anne Hidalgo ─────────────────────────────────────────────────────────

  {
    // P-O : Hidalgo maire de Paris (mandat actif)
    aType: 'personne',
    aRef: 'Q2851133',
    bType: 'organisation',
    bRef: 'Q90',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Anne Hidalgo est maire de Paris depuis le 5 avril 2014, première femme à occuper " +
      "ce poste dans l'histoire de la capitale. Réélue le 4 juillet 2020 " +
      "(48,97 % au Conseil de Paris).",
    dateDebut: new Date('2014-04-05'),
    dateFin: null,
    sourceRef: 'wp_hidalgo',
  },
  {
    // P-O : Hidalgo présidente de la Métropole du Grand Paris (mandat actif)
    aType: 'personne',
    aRef: 'Q2851133',
    bType: 'organisation',
    bRef: 'Q16665915',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Anne Hidalgo est présidente de la Métropole du Grand Paris depuis le 22 janvier 2016, " +
      "date d'installation de l'EPCI. Réélue après les élections municipales de 2020.",
    dateDebut: new Date('2016-01-22'),
    dateFin: null,
    sourceRef: 'wp_mgp',
  },
  {
    // P-O : Hidalgo affiliée au Parti socialiste
    aType: 'personne',
    aRef: 'Q2851133',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Anne Hidalgo est membre du Parti socialiste depuis les années 1994. " +
      "Première secrétaire fédérale de Paris, première secrétaire nationale adjointe, " +
      "candidate PS à la présidentielle 2022 (1,75 % au 1er tour).",
    dateDebut: new Date('1994-01-01'),
    dateFin: null,
    sourceRef: 'wp_hidalgo',
  },

  // ─── Rachida Dati ─────────────────────────────────────────────────────────

  {
    // P-O : Dati affiliée à LR / UMP
    // Elle rejoint l'UMP en 2002 (investiture Sarkozy). Accepte un poste de ministre
    // sous Macron (2024) sans quitter formellement LR.
    aType: 'personne',
    aRef: 'Q27182',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Rachida Dati est membre de l'UMP (devenu LR en 2015) depuis 2002. " +
      "Elle accepte une nomination comme ministre de la Culture sous Emmanuel Macron " +
      "en janvier 2024 sans quitter formellement LR.",
    dateDebut: new Date('2002-11-17'),
    dateFin: null,
    sourceRef: 'wp_dati',
  },
  {
    // P-O : Dati ancienne maire du 7e arrondissement de Paris
    // Fonction terminée le 11 janvier 2024 (démission pour prendre le portefeuille Culture).
    aType: 'personne',
    aRef: 'Q27182',
    bType: 'organisation',
    bRef: 'Q90',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Rachida Dati est élue maire du 7e arrondissement de Paris le 29 mars 2008. " +
      "Elle démissionne le 11 janvier 2024 pour prendre ses fonctions de ministre de la " +
      "Culture dans le gouvernement Gabriel Attal.",
    dateDebut: new Date('2008-03-29'),
    dateFin: new Date('2024-01-11'),
    sourceRef: 'wp_dati',
  },

  // ─── Jean Castex (déjà en base via seed-macron-gouvernements.js — Q3171170) ──

  {
    // P-O : Castex PDG de RATP Group (pantouflage PM → transport public IDF)
    // Décret présidentiel du 23 novembre 2022. Quitte le poste le 3 novembre 2025 pour SNCF.
    aType: 'personne',
    aRef: 'Q3171170',
    bType: 'organisation',
    bRef: 'Q643290',
    typeLienCode: 'DIRIGEANT',
    description:
      "Jean Castex, ancien Premier ministre (2020-2022), est nommé PDG de RATP Group " +
      "par décret présidentiel du 23 novembre 2022. Il quitte ses fonctions le 3 novembre " +
      "2025 pour prendre la direction du groupe SNCF. Cas emblématique de pantouflage " +
      "entre la sphère gouvernementale et les entreprises publiques de transport IDF.",
    dateDebut: new Date('2022-11-23'),
    dateFin: new Date('2025-11-03'),
    sourceRef: 'wp_castex',
  },
  {
    // P-O : Castex PDG de SNCF (depuis nov. 2025) — siège à Saint-Denis (IDF)
    aType: 'personne',
    aRef: 'Q3171170',
    bType: 'organisation',
    bRef: 'Q13646',
    typeLienCode: 'DIRIGEANT',
    description:
      "Jean Castex est nommé PDG du groupe SNCF le 23 octobre 2025 pour un mandat de " +
      "4 ans, prenant ses fonctions le 3 novembre 2025. Il se déporte pendant 3 ans " +
      "des appels d'offres où la RATP est opérateur sortant (mesure anti-conflit d'intérêts).",
    dateDebut: new Date('2025-11-03'),
    dateFin: null,
    sourceRef: 'europe1_castex_sncf',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-region-idf] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
  throw new Error(`[seed-region-idf] Type entité non supporté : ${type}`)
}

function fkPourEntite(type, entite, position) {
  const suffix = position === 'A' ? 'AId' : 'BId'
  if (type === 'personne') return { [`personne${suffix}`]: entite.id }
  if (type === 'organisation') return { [`organisation${suffix}`]: entite.id }
  if (type === 'siteWeb') return { [`siteWeb${suffix}`]: entite.id }
  throw new Error(`[seed-region-idf] Type inconnu : ${type}`)
}

async function creerLien(lien, sourcesMap, userId) {
  const entiteA = await trouverEntite(lien.aType, lien.aRef)
  const entiteB = await trouverEntite(lien.bType, lien.bRef)
  if (!entiteA || !entiteB) {
    throw new Error(
      `[seed-region-idf] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef} → ${entiteA ? 'OK' : 'MANQUANT'}, ` +
        `bRef=${lien.bRef} → ${entiteB ? 'OK' : 'MANQUANT'})`,
    )
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`[seed-region-idf] TypeLien introuvable : ${lien.typeLienCode}`)
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
  console.log('Suppression des données IDF précédentes...')
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
  console.log('Données précédentes supprimées.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(
    '\n--- seed-region-idf --- Réseau Île-de-France (institutions + politique + pantouflages) ---\n',
  )
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Compte : ${user.email}\n`)

  console.log('--- Sources publiques ---')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  OK ${data.titre}`)
  }

  console.log('\n--- Personnes (Wikidata) ---')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  OK ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n--- Organisations (Wikidata) ---')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  OK ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n--- Liens ---')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  OK ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n--- Bilan -------------------------------------------')
  console.log(`  Personnes nouvelles    : ${PERSONNES.length} (Pécresse, Hidalgo, Dati)`)
  console.log(
    `  Organisations nouvelles : ${ORGANISATIONS.length} (Région IDF, Ville de Paris, MGP, RATP, IDFM, SNCF)`,
  )
  console.log(`  Sources                : ${Object.keys(SOURCES).length}`)
  console.log(`  Liens                  : ${LIENS.length}`)
  console.log('  Personnes deja en base : Castex Q3171170')
  console.log('  Orgas deja en base     : PS Q170972, LR Q20012759')
  console.log('  Affaire couverte       : enquete Pecresse (classee sans suite nov. 2024)')
  console.log('  Pantouflage couvert    : Castex -> RATP -> SNCF')
  console.log('------------------------------------------------------\n')
}

main()
  .catch((err) => {
    console.error('[seed-region-idf] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
