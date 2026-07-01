/**
 * Seed clubs-proprietaires — propriétaires des clubs de football français (Ligue 1 + grands clubs).
 * Enquête OSINT journalistique du 2026-07-01 — détention capitalistique et direction.
 *
 * Périmètre : Paris Saint-Germain FC (QSI / Al-Khelaïfi + interlock beIN),
 *             Olympique de Marseille (Frank McCourt),
 *             OGC Nice (INEOS / Jim Ratcliffe),
 *             AS Monaco FC (Dmitri Rybolovlev),
 *             Stade Rennais FC (Groupe Artémis / famille Pinault — INTERLOCK luxe),
 *             RC Lens (Amber Capital / Joseph Oughourlian),
 *             Olympique Lyonnais (Eagle Football Holdings / John Textor — MULTI-CLUB),
 *             Toulouse FC (RedBird Capital Partners — MULTI-CLUB),
 *             RC Strasbourg Alsace (Todd Boehly — MULTI-CLUB).
 *
 * LOSC Lille exclu : propriétaire actuel (Merlyn Partners SCSp, Luxembourg) sans Q-id Wikidata
 * vérifiable — à créer dans un seed dédié quand la fiche sera disponible.
 *
 * Entités déjà potentiellement en base (via seed-luxe-familles.js) — upserts idempotents :
 *   Q1451167 (François Pinault), Q1371822 (François-Henri Pinault), Q2866000 (Groupe Artémis).
 *
 * Sources : Wikidata (Q-ids tous vérifiés via API wbsearchentities + Special:EntityData),
 *           Wikipédia FR/EN, L'Équipe, Le Monde, sites officiels des clubs.
 *
 * Volet judiciaire (Rybolovlev) : mise en examen Monaco nov. 2019 pour corruption présumée
 * (affaire Bouvier). Statut procédural exact indiqué. Présomption d'innocence appliquée.
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-clubs-proprietaires.js
 *   cd backend && node bin/seed-clubs-proprietaires.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — chaque fiche recoupée par ≥ 2 sources publiques (cf. commentaires).
// Personnages publics uniquement (propriétaires de clubs = figues économiques
// dont la fonction implique une exposition publique). Art. 9 CEDH / jurisprudence CEDH.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q776008 (description = "Qatari businessman... president of Paris Saint-Germain")
    //           + Wikipédia FR (Nasser Al-Khelaïfi) + site officiel PSG + beIN officiel
    // Rôle public attesté : Président PSG depuis 2011, PDG QSI depuis 2011, Président beIN depuis 2012
    nom: 'Al-Khelaïfi',
    prenom: 'Nasser',
    pays: 'Qatar',
    nationalite: 'qatarienne',
    dateNaissance: new Date('1973-09-12'),
    lieuNaissance: 'Doha (Qatar)',
    rolePrincipal: 'Président du Paris Saint-Germain FC et PDG de Qatar Sports Investments',
    rolesSecondaires: [
      "Président de beIN Media Group (depuis 2012)",
      "Président de l'European Club Association (ECA, depuis 2021)",
      "Ancien tennisman professionnel (équipe nationale du Qatar, JO Barcelone 1992)",
    ],
    bio:
      "Homme d'affaires qatarien né le 12 sept. 1973 à Doha, Nasser Al-Khelaïfi est PDG de Qatar " +
      "Sports Investments (QSI) et président du PSG depuis 2011. Il préside également beIN Media " +
      "Group, groupe audiovisuel qatarien diffusant dans 43 pays, créant un interlock sport-média " +
      "rarement égalé en Europe.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nasser_Al-Khela%C3%AFf%C3%AF',
    wikidataId: 'Q776008',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q5488263 ("American businessman", né 14 août 1953 à New York)
    //           + Wikipédia EN (Frank McCourt businessman) + Wikipédia FR (OM)
    // Rôle public attesté : propriétaire OM depuis oct. 2016 ; ex-propriétaire LA Dodgers (MLB)
    nom: 'McCourt',
    prenom: 'Frank',
    pays: 'États-Unis',
    nationalite: 'américaine',
    dateNaissance: new Date('1953-08-14'),
    lieuNaissance: 'New York (États-Unis)',
    rolePrincipal: "Propriétaire et président exécutif de l'Olympique de Marseille",
    rolesSecondaires: [
      "Ancien propriétaire des Los Angeles Dodgers (MLB, 2004-2012)",
      "Promoteur immobilier (McCourt Global)",
      "Fondateur de Project Liberty (gouvernance internet)",
    ],
    bio:
      "Homme d'affaires américain, Frank McCourt a acquis l'Olympique de Marseille en octobre 2016 " +
      "pour 45 M€, rachètant le club à la famille Diouf-Margarita Louis-Dreyfus. " +
      "Ex-propriétaire des LA Dodgers, il préside le club phocéen au travers de McCourt Sports.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Frank_McCourt_(businessman)',
    wikidataId: 'Q5488263',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q1440023 ("British chemical engineer turned financier and industrialist")
    //           + Wikipédia FR (Jim Ratcliffe) + Wikipédia FR (INEOS)
    // Rôle public attesté : fondateur et CEO d'INEOS depuis 1998 ; propriétaire OGC Nice depuis 2019
    nom: 'Ratcliffe',
    prenom: 'Jim',
    pays: 'Royaume-Uni',
    nationalite: 'britannique',
    dateNaissance: new Date('1952-10-18'),
    lieuNaissance: 'Failsworth (Greater Manchester, Royaume-Uni)',
    rolePrincipal: "Fondateur et PDG d'INEOS Group ; propriétaire d'OGC Nice",
    rolesSecondaires: [
      "Actionnaire à 27,7 % de Manchester United (depuis février 2024) via INEOS Sport",
      "Sponsor du Team INEOS Grenadiers (cyclisme) et du Mercedes AMG F1 (INEOS partenaire)",
      "Première fortune britannique (estimation Forbes 2023)",
    ],
    bio:
      "Ingénieur chimiste de formation, Jim Ratcliffe fonde INEOS en 1998, devenu le troisième " +
      "groupe chimique mondial (env. 65 Mds$ de CA). Il acquiert OGC Nice en août 2019 via INEOS, " +
      "puis rachète 27,7 % de Manchester United en fév. 2024. Interlock multi-club documenté.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jim_Ratcliffe',
    wikidataId: 'Q1440023',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q983847 ("Russian fertilizer magnate and art collector")
    //           + Wikipédia FR (Dmitri Rybolovlev) + Wikipédia FR (AS Monaco FC)
    // Rôle public attesté : actionnaire majoritaire AS Monaco depuis déc. 2011
    // Volet judiciaire : mis en examen à Monaco (novembre 2019) pour corruption active présumée
    //   et recel dans le cadre de l'affaire Bouvier (dispute sur des œuvres d'art avec Yves Bouvier).
    //   Mise en examen ≠ condamnation — présomption d'innocence (art. 9-1 C. civ. fr.).
    nom: 'Rybolovlev',
    prenom: 'Dmitri',
    pays: 'Monaco',
    nationalite: 'russe/monégasque',
    dateNaissance: new Date('1966-11-22'),
    lieuNaissance: 'Perm (Russie)',
    rolePrincipal: "Actionnaire majoritaire de l'AS Monaco FC",
    rolesSecondaires: [
      "Ancien PDG de Uralkali (potasse, Russie) — vendu en 2010",
      "Collectionneur d'art (œuvres Picasso, Gauguin, Rodin…)",
      "Résident monégasque depuis 2011",
    ],
    bio:
      "Milliardaire russo-monégasque, Dmitri Rybolovlev a bâti sa fortune dans la potasse via " +
      "Uralkali, revendu en 2010 pour env. 5 Mds$. Il acquiert ~66 % de l'AS Monaco en déc. 2011. " +
      "STATUT PROCÉDURAL : mis en examen à Monaco en novembre 2019 pour corruption active présumée " +
      "et recel (affaire Bouvier). Mise en examen ≠ condamnation — présomption d'innocence.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Dmitri_Rybolovlev',
    wikidataId: 'Q983847',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q1451167 ("French billionaire businessman and art collector")
    //           + Wikipédia FR (François Pinault) + Wikipédia FR (Artémis)
    // NB : déjà potentiellement en base via seed-luxe-familles.js (upsert idempotent).
    // Décédé le 23 avril 2025 à Paris.
    nom: 'Pinault',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1936-08-21'),
    lieuNaissance: "Champs-Géraux (Côtes-d'Armor)",
    rolePrincipal: "Fondateur du Groupe Artémis et de Kering (PPR) (†23 avril 2025)",
    rolesSecondaires: [
      "Fondateur d'Artémis SAS (1992), holding familiale de contrôle",
      "Fondateur et ancien PDG de Pinault-Printemps-Redoute (PPR, devenu Kering)",
      "Collectionneur d'art (Bourse de Commerce, Palazzo Grassi, Punta della Dogana)",
    ],
    bio:
      "Né en Bretagne en 1936, François Pinault a bâti un conglomérat commercial avant de pivoter " +
      "vers le luxe (Gucci, 1999). Il fonde Artémis SAS en 1992, holding qui contrôle Kering, " +
      "Christie's, le Stade Rennais FC et Le Point. Décédé le 23 avril 2025 à Paris. " +
      "Son fils François-Henri Pinault assure la direction d'Artémis depuis 2005.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Pinault',
    wikidataId: 'Q1451167',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q1371822 ("French businessman, born 1962")
    //           + Wikipédia FR (François-Henri Pinault) + Wikipédia FR (Kering)
    // NB : déjà potentiellement en base via seed-cac40-b3.js / seed-luxe-familles.js (upsert OK).
    nom: 'Pinault',
    prenom: 'François-Henri',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1962-05-28'),
    lieuNaissance: 'Rennes (Ille-et-Vilaine)',
    rolePrincipal: "Président-Directeur général de Kering et Président du Groupe Artémis",
    rolesSecondaires: [
      "Président du Conseil de surveillance du Stade Rennais FC (via Artémis)",
      "Administrateur de Christie's (filiale Artémis)",
      "Co-président du Palazzo Grassi (Venise) via Artémis",
    ],
    bio:
      "Fils de François Pinault, François-Henri Pinault dirige le groupe Kering depuis 2005 " +
      "(Gucci, Saint Laurent, Bottega Veneta…). Président d'Artémis SAS, il est le bénéficiaire " +
      "effectif de la holding familiale qui contrôle notamment le Stade Rennais FC depuis 1998.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois-Henri_Pinault',
    wikidataId: 'Q1371822',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q47491482 ("French businessman")
    //           + Wikipédia FR (RC Lens) + L'Équipe/Le Monde (acquisition RC Lens 2011)
    // Rôle public attesté : fondateur d'Amber Capital (2005) ; propriétaire RC Lens depuis 2011
    nom: 'Oughourlian',
    prenom: 'Joseph',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: "Fondateur et directeur général d'Amber Capital ; président de RC Lens",
    rolesSecondaires: [
      "Président du Conseil de surveillance du Racing Club de Lens (depuis 2011)",
      "Ancien professeur de finance à HEC",
      "Auteur (L'homme Dieu, 2014 ; Le désir fou d'être aimé, 2016)",
    ],
    bio:
      "Financier franco-libanais, Joseph Oughourlian fonde Amber Capital en 2005, fonds " +
      "d'investissement activiste gérant plusieurs milliards d'euros. Il rachète le RC Lens en " +
      "juillet 2011 et préside le club artésien, promu en Ligue 1 en 2020 puis vice-champion de " +
      "France en 2023.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Joseph_Oughourlian',
    wikidataId: 'Q47491482',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q108094403 ("American businessman")
    //           + Wikipédia EN (John Textor) + Wikipédia FR (OL Groupe)
    // Rôle public attesté : Executive Chairman d'Eagle Football Holdings et d'OL Groupe depuis 2022
    nom: 'Textor',
    prenom: 'John',
    pays: 'États-Unis',
    nationalite: 'américaine',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: "Executive Chairman d'Eagle Football Holdings et d'OL Groupe",
    rolesSecondaires: [
      "Co-propriétaire de Crystal Palace FC (EPL, Royaume-Uni) via Eagle Football",
      "Co-propriétaire de Botafogo (Brésil) via Eagle Football",
      "Co-propriétaire de RWD Molenbeek (Belgique) via Eagle Football",
    ],
    bio:
      "Entrepreneur américain, John Textor est le fondateur d'Eagle Football Holdings, consortium " +
      "multi-club détenant des participations en France (OL Groupe), en Angleterre (Crystal Palace), " +
      "au Brésil (Botafogo) et en Belgique (RWD Molenbeek). Il prend le contrôle d'OL Groupe en " +
      "décembre 2022 après une OPA sur la société cotée sur Euronext.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/John_Textor',
    wikidataId: 'Q108094403',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q56513174 ("American businessman and investor")
    //           + Wikipédia EN (Todd Boehly) + Wikipédia FR (RC Strasbourg Alsace)
    // Rôle public attesté : co-propriétaire de Chelsea FC via BlueCo (2022) ;
    //   acquisition RC Strasbourg Alsace via BlueCo (juillet 2022)
    nom: 'Boehly',
    prenom: 'Todd',
    pays: 'États-Unis',
    nationalite: 'américaine',
    dateNaissance: new Date('1973-10-30'),
    lieuNaissance: 'Langley (Virginie, États-Unis)',
    rolePrincipal: "Propriétaire co-fondateur de BlueCo (Chelsea FC, RC Strasbourg Alsace)",
    rolesSecondaires: [
      "Co-propriétaire de Chelsea FC (EPL, Royaume-Uni) via BlueCo (depuis mai 2022)",
      "Co-fondateur de Eldridge Industries (conglomérat média-sport-finance)",
      "Ex-président de Guggenheim Baseball Management (LA Dodgers)",
    ],
    bio:
      "Homme d'affaires américain, Todd Boehly co-dirige Eldridge Industries et pilote le " +
      "consortium BlueCo qui acquiert Chelsea FC en mai 2022 (4,25 Mds€). Deux mois plus tard, " +
      "BlueCo rachète le RC Strasbourg Alsace (Ligue 1), créant un interlock multi-club " +
      "franco-anglais.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Todd_Boehly',
    wikidataId: 'Q56513174',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  // --- CLUBS ---
  {
    // Sources : Wikidata Q483020 (vérifié wbsearchentities) + Wikipédia FR (PSG)
    nom: 'Paris Saint-Germain FC',
    sigle: 'PSG',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.psg.fr',
    description:
      "Club de football professionnel parisien fondé en 1970. Propriété à 100 % de Qatar Sports " +
      "Investments (QSI) depuis juin 2011. Champion de France en titre (11 titres de L1). " +
      "Stade : Parc des Princes (47 929 places).",
    dateCreation: new Date('1970-08-12'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Paris_Saint-Germain_Football_Club',
    wikidataId: 'Q483020',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q132885 (vérifié wbsearchentities) + Wikipédia FR (OM)
    nom: 'Olympique de Marseille',
    sigle: 'OM',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.om.fr',
    description:
      "Club de football professionnel fondé en 1899. Propriété de McCourt Sports (Frank McCourt) " +
      "depuis octobre 2016. Seul club français vainqueur de la Ligue des Champions (1993). " +
      "Stade : Orange Vélodrome (67 394 places).",
    dateCreation: new Date('1899-10-31'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Olympique_de_Marseille',
    wikidataId: 'Q132885',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q185163 (vérifié wbsearchentities) + Wikipédia FR (OGC Nice)
    nom: 'OGC Nice',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.ogcnice.com',
    description:
      "Club de football professionnel fondé en 1904 à Nice. Propriété à 100 % d'INEOS Group " +
      "(Jim Ratcliffe) depuis août 2019. Stade : Allianz Riviera (35 624 places).",
    dateCreation: new Date('1904-06-04'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/OGC_Nice',
    wikidataId: 'Q185163',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q180305 (vérifié wbsearchentities) + Wikipédia FR (AS Monaco)
    nom: 'AS Monaco FC',
    sigle: 'ASM',
    typeOrganisation: 'ENTREPRISE',
    pays: 'Monaco',
    siteWeb: 'https://www.asmonaco.com',
    description:
      "Club de football professionnel de la Principauté de Monaco fondé en 1919. " +
      "Actionnaire majoritaire : Dmitri Rybolovlev (~66 %) depuis décembre 2011. " +
      "Les 34 % restants appartiennent à la Société des Bains de Mer (État monégasque). " +
      "Stade : Stade Louis-II (18 523 places).",
    dateCreation: new Date('1919-08-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Association_sportive_de_Monaco_Football_Club',
    wikidataId: 'Q180305',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q19509 (vérifié wbsearchentities) + Wikipédia FR (Stade Rennais)
    nom: 'Stade Rennais FC',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.staderennais.com',
    description:
      "Club de football professionnel fondé en 1901 à Rennes. Propriété à 100 % du Groupe " +
      "Artémis (famille Pinault) depuis 1998. Stade : Roazhon Park (29 778 places). " +
      "Vainqueur de la Coupe de France 1965 et 1971.",
    dateCreation: new Date('1901-03-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Stade_rennais_FC',
    wikidataId: 'Q19509',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q191843 (vérifié wbsearchentities) + Wikipédia FR (RC Lens)
    nom: 'Racing Club de Lens',
    sigle: 'RCL',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.rclens.fr',
    description:
      "Club de football professionnel du Pas-de-Calais fondé en 1906. " +
      "Propriété d'Amber Capital (Joseph Oughourlian) depuis juillet 2011. " +
      "Vice-champion de France 2022-2023. Stade : Bollaert-Delelis (38 223 places).",
    dateCreation: new Date('1906-08-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Racing_Club_de_Lens',
    wikidataId: 'Q191843',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q704 (vérifié wbsearchentities) + Wikipédia FR (Olympique Lyonnais)
    nom: 'Olympique Lyonnais',
    sigle: 'OL',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.ol.fr',
    description:
      "Club de football professionnel fondé en 1950 à Lyon, 7 fois champion de France consécutifs " +
      "(2002-2008). Contrôlé par OL Groupe (coté Euronext), lui-même majoritairement détenu par " +
      "Eagle Football Holdings (John Textor) depuis décembre 2022. Stade : Groupama Stadium (59 186 places).",
    dateCreation: new Date('1950-06-03'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Olympique_lyonnais',
    wikidataId: 'Q704',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q19518 (vérifié wbsearchentities) + Wikipédia FR (Toulouse FC)
    nom: 'Toulouse FC',
    sigle: 'TFC',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.toulousefc.com',
    description:
      "Club de football professionnel fondé en 1937 à Toulouse. Propriété de RedBird Capital " +
      "Partners (Gerry Cardinale) depuis juin 2020. Promu en Ligue 1 en 2022 ; vainqueur de la " +
      "Coupe de France 2023 (contre Nantes). Stade : Stadium de Toulouse (33 150 places).",
    dateCreation: new Date('1937-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Toulouse_Football_Club',
    wikidataId: 'Q19518',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q126334 (vérifié wbsearchentities) + Wikipédia FR (RC Strasbourg)
    nom: 'RC Strasbourg Alsace',
    sigle: 'RCSA',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.rcstrasbourg.eu',
    description:
      "Club de football professionnel fondé en 1906 à Strasbourg. Contrôlé par BlueCo " +
      "(consortium Todd Boehly) depuis juillet 2022. BlueCo possède également Chelsea FC (EPL). " +
      "Stade : Stade de la Meinau (26 165 places).",
    dateCreation: new Date('1906-06-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Racing_Club_de_Strasbourg_Alsace',
    wikidataId: 'Q126334',
    qualiteInfluence: 'AUTRE',
  },

  // --- HOLDINGS / FONDS ---
  {
    // Sources : Wikidata Q28221762 (vérifié wbsearchentities) + Wikipédia FR (Qatar Sports Investments)
    // QSI est une filiale de la Qatar Investment Authority (QIA, fonds souverain du Qatar)
    nom: 'Qatar Sports Investments',
    sigle: 'QSI',
    typeOrganisation: 'ENTREPRISE',
    pays: 'Qatar',
    siteWeb: 'https://www.qsi.com.qa',
    description:
      "Fonds d'investissement sportif qatarien, filiale de la Qatar Investment Authority (QIA, " +
      "fonds souverain du Qatar). QSI détient 100 % du PSG depuis juin 2011 et est à l'origine de " +
      "la création de beIN Media Group (2012). Présidé et dirigé par Nasser Al-Khelaïfi.",
    dateCreation: new Date('2005-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Qatar_Sports_Investments',
    wikidataId: 'Q28221762',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q19650330 (vérifié wbsearchentities, "independent global sport and entertainment network")
    //           + Wikipédia FR (beIN Sports) + sites officiels beIN
    // Interlock : beIN fondé par QSI (Nasser Al-Khelaïfi chairman des deux entités)
    nom: 'beIN Media Group',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'Qatar',
    siteWeb: 'https://www.bein.com',
    description:
      "Groupe audiovisuel qatarien fondé par Qatar Sports Investments (QSI) en 2012. " +
      "Diffuse dans 43 pays via beIN Sports (droits sportifs : Ligue 1, Liga, Bundesliga…) " +
      "et beIN Entertainment. Nasser Al-Khelaïfi en est le chairman et CEO. " +
      "Interlock direct avec le PSG (même actionnaire Qatari, même dirigeant).",
    dateCreation: new Date('2012-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/BeIN_Sports',
    wikidataId: 'Q19650330',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    // Sources : Wikidata Q673231 (vérifié wbsearchentities, "privately owned multinational chemicals company")
    //           + Wikipédia FR (Ineos)
    // Fondé en 1998 par Jim Ratcliffe. INEOS Sport contrôle OGC Nice (100 %) et un bloc Manchester United
    nom: 'INEOS Group',
    sigle: 'INEOS',
    typeOrganisation: 'ENTREPRISE',
    pays: 'Royaume-Uni',
    siteWeb: 'https://www.ineos.com',
    description:
      "Troisième groupe chimique mondial (env. 65 Mds$ de CA), fondé en 1998 par Jim Ratcliffe. " +
      "Via sa division INEOS Sport, détient 100 % d'OGC Nice (Ligue 1, depuis août 2019) et " +
      "27,7 % de Manchester United (depuis février 2024). Siège : Rolle (Suisse).",
    dateCreation: new Date('1998-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Ineos',
    wikidataId: 'Q673231',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2866000 (vérifié wbsearchentities, "French holding company")
    //           + Wikipédia FR (Artémis) + seed-luxe-familles.js (déjà documenté)
    // NB : potentiellement déjà en base via seed-luxe-familles.js — upsert idempotent.
    nom: 'Groupe Artémis',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.kering.com',
    description:
      "Holding patrimoniale SAS de la famille Pinault (Paris 8e, fondée en 1992). " +
      "Contrôle Kering (~42 % du capital, luxe), Christie's (100 %, maison de ventes aux enchères), " +
      "Stade Rennais FC (100 %, Ligue 1), Le Point (presse), Château Latour et Ponant. " +
      "Présidée par François-Henri Pinault.",
    dateCreation: new Date('1992-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Art%C3%A9mis_(groupe)',
    wikidataId: 'Q2866000',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q89345695 (vérifié wbsearchentities, "Investment Fund")
    //           + Wikipédia FR (RC Lens) — Amber Capital (fonds d'investissement activiste)
    nom: 'Amber Capital',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: null,
    description:
      "Fonds d'investissement activiste fondé en 2005 par Joseph Oughourlian. " +
      "Siège à Paris. Gère plusieurs milliards d'euros. Actionnaire de référence de RC Lens " +
      "depuis juillet 2011. Amber Capital a notamment été actionnaire activiste de Vivendi, " +
      "Lagardère et d'autres groupes cotés.",
    dateCreation: new Date('2005-01-01'),
    wikipediaUrl: null,
    wikidataId: 'Q89345695',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3347591 (vérifié wbsearchentities,
    //           "holding company for Olympique Lyonnais business activities")
    //           + Wikipédia FR (OL Groupe)
    nom: 'OL Groupe',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.ol.fr',
    description:
      "Société anonyme cotée sur Euronext Paris (compartiment B). Holding du groupe " +
      "Olympique Lyonnais : détient l'Olympique Lyonnais (football masculin et féminin), " +
      "le Groupama Stadium et divers actifs. Eagle Football Holdings (John Textor) en est " +
      "l'actionnaire majoritaire depuis décembre 2022 (>75 % du capital).",
    dateCreation: new Date('1999-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/OL_Groupe',
    wikidataId: 'Q3347591',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q135655556 (vérifié wbsearchentities, "English holding company")
    //           + Wikipédia EN (Eagle Football Holdings) + Wikipédia FR (OL Groupe)
    // Consortium multi-club : OL (France), Crystal Palace (Angleterre), Botafogo (Brésil), RWD Molenbeek (Belgique)
    nom: 'Eagle Football Holdings',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'Royaume-Uni',
    siteWeb: null,
    description:
      "Holding multi-club fondée par John Textor (anciennement Flying Eagle Acquisition Corp). " +
      "Détient des participations dans l'OL Groupe (France, >75 %), Crystal Palace FC " +
      "(Angleterre, ~40 %), Botafogo (Brésil) et RWD Molenbeek (Belgique). " +
      "Stratégie de partage de données, de scouts et de joueurs entre les clubs.",
    dateCreation: new Date('2021-01-01'),
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Eagle_Football_Holdings',
    wikidataId: 'Q135655556',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q116116844 (vérifié wbsearchentities, "private investment firm")
    //           + Wikipédia EN (RedBird Capital Partners) + Wikipédia FR (Toulouse FC)
    // Multi-club : Toulouse FC (France, 100 %) ; minoritaire AC Milan (Italie, ~11 %)
    nom: 'RedBird Capital Partners',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'États-Unis',
    siteWeb: 'https://www.redbirdcap.com',
    description:
      "Fonds de private equity sportif américain fondé en 2014 par Gerry Cardinale. " +
      "Détient 100 % de Toulouse FC (Ligue 1, depuis juin 2020) et une participation minoritaire " +
      "dans AC Milan (Italie, ~11 %). RedBird investit à l'intersection du sport, des médias et " +
      "du divertissement.",
    dateCreation: new Date('2014-01-01'),
    wikipediaUrl: 'https://en.wikipedia.org/wiki/RedBird_Capital_Partners',
    wikidataId: 'Q116116844',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-01).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_psg: {
    url: 'https://fr.wikipedia.org/wiki/Paris_Saint-Germain_Football_Club',
    titre: 'Paris Saint-Germain Football Club — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Historique du club, acquisition par QSI en juin 2011, Nasser Al-Khelaïfi président depuis 2011.",
    verifiee: true,
  },
  wp_qsi: {
    url: 'https://fr.wikipedia.org/wiki/Qatar_Sports_Investments',
    titre: 'Qatar Sports Investments — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "QSI filiale de la Qatar Investment Authority ; acquisition PSG juin 2011 ; fondateur de beIN Sports.",
    verifiee: true,
  },
  wp_al_khelaifi: {
    url: 'https://fr.wikipedia.org/wiki/Nasser_Al-Khela%C3%AFf%C3%AF',
    titre: 'Nasser Al-Khelaïfi — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "PDG de QSI, président PSG, chairman beIN Media Group. Né le 12 sept. 1973 à Doha.",
    verifiee: true,
  },
  wp_bein: {
    url: 'https://fr.wikipedia.org/wiki/BeIN_Sports',
    titre: 'beIN Sports — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "beIN Media Group fondé par QSI en 2012. Diffusion dans 43 pays. Nasser Al-Khelaïfi chairman.",
    verifiee: true,
  },
  wp_om: {
    url: 'https://fr.wikipedia.org/wiki/Olympique_de_Marseille',
    titre: 'Olympique de Marseille — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Historique OM. Acquisition par Frank McCourt en octobre 2016 pour env. 45 M€.",
    verifiee: true,
  },
  wp_mccourt: {
    url: 'https://en.wikipedia.org/wiki/Frank_McCourt_(businessman)',
    titre: 'Frank McCourt (businessman) — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Frank McCourt, American businessman, né 14 août 1953 à New York. Propriétaire OM depuis 2016.",
    verifiee: true,
  },
  wp_ogcnice: {
    url: 'https://fr.wikipedia.org/wiki/OGC_Nice',
    titre: 'OGC Nice — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Historique OGC Nice. Acquisition à 100 % par INEOS (Jim Ratcliffe) en août 2019.",
    verifiee: true,
  },
  wp_ineos: {
    url: 'https://fr.wikipedia.org/wiki/Ineos',
    titre: 'INEOS Group — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "INEOS Group fondé en 1998 par Jim Ratcliffe. Env. 65 Mds$ CA. Division INEOS Sport : OGC Nice + Manchester United 27,7 %.",
    verifiee: true,
  },
  wp_ratcliffe: {
    url: 'https://fr.wikipedia.org/wiki/Jim_Ratcliffe',
    titre: 'Jim Ratcliffe — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Né le 18 oct. 1952 à Failsworth. Fondateur INEOS 1998. Première fortune britannique Forbes 2023.",
    verifiee: true,
  },
  wp_asmonaco: {
    url: 'https://fr.wikipedia.org/wiki/Association_sportive_de_Monaco_Football_Club',
    titre: 'AS Monaco FC — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "AS Monaco fondé en 1919. Rybolovlev actionnaire majoritaire (~66 %) depuis déc. 2011. 34 % État monégasque.",
    verifiee: true,
  },
  wp_rybolovlev: {
    url: 'https://fr.wikipedia.org/wiki/Dmitri_Rybolovlev',
    titre: 'Dmitri Rybolovlev — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Né le 22 nov. 1966 à Perm. Fortune Uralkali. Actionnaire AS Monaco depuis 2011. " +
      "Mis en examen à Monaco en nov. 2019 (corruption présumée, affaire Bouvier). Présomption d'innocence.",
    verifiee: true,
  },
  wp_staderennais: {
    url: 'https://fr.wikipedia.org/wiki/Stade_rennais_FC',
    titre: 'Stade Rennais FC — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Stade Rennais fondé en 1901. Artémis (famille Pinault) propriétaire à 100 % depuis 1998.",
    verifiee: true,
  },
  wp_artemis: {
    url: 'https://fr.wikipedia.org/wiki/Art%C3%A9mis_(groupe)',
    titre: 'Artémis (groupe) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Holding patrimoniale Pinault (SAS, 1992). Actifs : Kering ~42 %, Christie's 100 %, " +
      "Stade Rennais 100 %, Le Point, Château Latour. Présidée par François-Henri Pinault.",
    verifiee: true,
  },
  wp_fpinault: {
    url: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Pinault',
    titre: 'François Pinault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2025-04-23'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Né le 21 août 1936 à Champs-Géraux. Fondateur Artémis (1992) et PPR/Kering. " +
      "Décédé le 23 avril 2025 à Paris.",
    verifiee: true,
  },
  wp_fhpinault: {
    url: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois-Henri_Pinault',
    titre: 'François-Henri Pinault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Né le 28 mai 1962 à Rennes. PDG Kering depuis 2005. Président Artémis depuis 2005.",
    verifiee: true,
  },
  wp_rclens: {
    url: 'https://fr.wikipedia.org/wiki/Racing_Club_de_Lens',
    titre: 'Racing Club de Lens — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "RC Lens fondé en 1906. Amber Capital (Oughourlian) actionnaire majoritaire depuis juil. 2011.",
    verifiee: true,
  },
  wp_oughourlian: {
    url: 'https://fr.wikipedia.org/wiki/Joseph_Oughourlian',
    titre: 'Joseph Oughourlian — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Financier franco-libanais, fondateur Amber Capital (2005). Président RC Lens depuis 2011.",
    verifiee: true,
  },
  wp_ol: {
    url: 'https://fr.wikipedia.org/wiki/Olympique_lyonnais',
    titre: 'Olympique Lyonnais — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "OL fondé en 1950. 7 titres L1 consécutifs (2002-2008). OL Groupe coté, contrôlé par Eagle Football (Textor) depuis 2022.",
    verifiee: true,
  },
  wp_olgroupe: {
    url: 'https://fr.wikipedia.org/wiki/OL_Groupe',
    titre: 'OL Groupe — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "OL Groupe, société cotée Euronext. Eagle Football Holdings (Textor) actionnaire majoritaire (>75 %) depuis déc. 2022.",
    verifiee: true,
  },
  wp_eagle: {
    url: 'https://en.wikipedia.org/wiki/Eagle_Football_Holdings',
    titre: 'Eagle Football Holdings — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Eagle Football Holdings, multi-club holding (John Textor). OL Groupe (France), Crystal Palace (Angleterre), Botafogo (Brésil), RWD Molenbeek (Belgique).",
    verifiee: true,
  },
  wp_textor: {
    url: 'https://en.wikipedia.org/wiki/John_Textor',
    titre: 'John Textor — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "American businessman, Executive Chairman Eagle Football Holdings et OL Groupe depuis 2022.",
    verifiee: true,
  },
  wp_toulouse: {
    url: 'https://fr.wikipedia.org/wiki/Toulouse_Football_Club',
    titre: 'Toulouse Football Club — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Toulouse FC fondé en 1937. RedBird Capital Partners propriétaire depuis juin 2020. Vainqueur CDF 2023.",
    verifiee: true,
  },
  wp_redbird: {
    url: 'https://en.wikipedia.org/wiki/RedBird_Capital_Partners',
    titre: 'RedBird Capital Partners — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "RedBird, fonds PE sportif (Gerry Cardinale, 2014). Toulouse FC 100 %, AC Milan minoritaire.",
    verifiee: true,
  },
  wp_strasbourg: {
    url: 'https://fr.wikipedia.org/wiki/Racing_Club_de_Strasbourg_Alsace',
    titre: 'RC Strasbourg Alsace — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "RC Strasbourg fondé en 1906. BlueCo (Todd Boehly) actionnaire depuis juillet 2022.",
    verifiee: true,
  },
  wp_boehly: {
    url: 'https://en.wikipedia.org/wiki/Todd_Boehly',
    titre: 'Todd Boehly — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Né le 30 oct. 1973 en Virginie. Co-fondateur BlueCo (Chelsea + RC Strasbourg). Eldridge Industries.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002), exactement 1 entité non-nulle de chaque côté.
// typeLienCodes utilisés : ACTIONNAIRE_MAJORITAIRE, FILIALE, DIRIGEANT, FONDATEUR,
//   BENEFICIAIRE_EFFECTIF (pour les propriétaires via holding).
// ---------------------------------------------------------------------------

const LIENS = [
  // =========================================================================
  // PSG — Qatar Sports Investments / Nasser Al-Khelaïfi / beIN (interlock sport-média)
  // =========================================================================
  {
    // O-O : QSI → PSG (acquisition juin 2011, 100 % du capital)
    aType: 'organisation',
    aRef: 'Q28221762',
    bType: 'organisation',
    bRef: 'Q483020',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "Qatar Sports Investments (QSI) acquiert 100 % du Paris Saint-Germain FC en juin 2011 " +
      "pour env. 50 M€, mettant fin à l'actionnariat Colony Capital.",
    dateDebut: new Date('2011-06-30'),
    dateFin: null,
    sourceRef: 'wp_qsi',
  },
  {
    // P-O : Al-Khelaïfi → PSG : Président (depuis juin 2011)
    aType: 'personne',
    aRef: 'Q776008',
    bType: 'organisation',
    bRef: 'Q483020',
    typeLienCode: 'DIRIGEANT',
    description:
      "Nasser Al-Khelaïfi est président du Paris Saint-Germain FC depuis juin 2011, " +
      "date de l'acquisition du club par QSI.",
    dateDebut: new Date('2011-06-30'),
    dateFin: null,
    sourceRef: 'wp_psg',
  },
  {
    // P-O : Al-Khelaïfi → QSI : PDG (depuis 2011)
    aType: 'personne',
    aRef: 'Q776008',
    bType: 'organisation',
    bRef: 'Q28221762',
    typeLienCode: 'DIRIGEANT',
    description:
      "Nasser Al-Khelaïfi est PDG (Chairman & CEO) de Qatar Sports Investments (QSI) depuis 2011.",
    dateDebut: new Date('2011-01-01'),
    dateFin: null,
    sourceRef: 'wp_al_khelaifi',
  },
  {
    // O-O : QSI → beIN Media Group : interlock (QSI fondateur de beIN en 2012)
    aType: 'organisation',
    aRef: 'Q28221762',
    bType: 'organisation',
    bRef: 'Q19650330',
    typeLienCode: 'FILIALE',
    description:
      "Qatar Sports Investments (QSI) est à l'origine de la création de beIN Media Group en 2012. " +
      "Interlock capitalistique : même actionnaire qatarien (QIA), même dirigeant (Nasser Al-Khelaïfi) pour PSG et beIN.",
    dateDebut: new Date('2012-01-01'),
    dateFin: null,
    sourceRef: 'wp_bein',
  },
  {
    // P-O : Al-Khelaïfi → beIN Media Group : Chairman & CEO (depuis 2012)
    aType: 'personne',
    aRef: 'Q776008',
    bType: 'organisation',
    bRef: 'Q19650330',
    typeLienCode: 'DIRIGEANT',
    description:
      "Nasser Al-Khelaïfi est chairman et CEO de beIN Media Group depuis sa fondation en 2012, " +
      "créant un interlock avec sa direction du PSG et de QSI.",
    dateDebut: new Date('2012-01-01'),
    dateFin: null,
    sourceRef: 'wp_bein',
  },

  // =========================================================================
  // OLYMPIQUE DE MARSEILLE — Frank McCourt
  // =========================================================================
  {
    // P-O : Frank McCourt → OM : actionnaire majoritaire (depuis oct. 2016)
    aType: 'personne',
    aRef: 'Q5488263',
    bType: 'organisation',
    bRef: 'Q132885',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "Frank McCourt acquiert l'Olympique de Marseille en octobre 2016 pour env. 45 M€ " +
      "(via McCourt Sports), reprenant le club à la famille Louis-Dreyfus.",
    dateDebut: new Date('2016-10-17'),
    dateFin: null,
    sourceRef: 'wp_om',
  },

  // =========================================================================
  // OGC NICE — INEOS Group / Jim Ratcliffe
  // =========================================================================
  {
    // O-O : INEOS → OGC Nice : actionnaire majoritaire (100 %, depuis août 2019)
    aType: 'organisation',
    aRef: 'Q673231',
    bType: 'organisation',
    bRef: 'Q185163',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "INEOS Group (Jim Ratcliffe) acquiert 100 % d'OGC Nice en août 2019 pour env. 100 M€, " +
      "via sa division INEOS Sport (également propriétaire de Manchester United à 27,7 %).",
    dateDebut: new Date('2019-08-08'),
    dateFin: null,
    sourceRef: 'wp_ogcnice',
  },
  {
    // P-O : Jim Ratcliffe → INEOS : bénéficiaire effectif (fondateur, ~80 % du capital)
    aType: 'personne',
    aRef: 'Q1440023',
    bType: 'organisation',
    bRef: 'Q673231',
    typeLienCode: 'BENEFICIAIRE_EFFECTIF',
    description:
      "Jim Ratcliffe est le fondateur et bénéficiaire effectif principal d'INEOS Group, " +
      "qu'il possède à environ 80 % du capital. Il en est aussi le PDG depuis la fondation en 1998.",
    dateDebut: new Date('1998-01-01'),
    dateFin: null,
    sourceRef: 'wp_ineos',
  },

  // =========================================================================
  // AS MONACO FC — Dmitri Rybolovlev
  // =========================================================================
  {
    // P-O : Rybolovlev → AS Monaco : actionnaire majoritaire (~66 %, depuis déc. 2011)
    // Note procédurale : mis en examen Monaco nov. 2019 (affaire Bouvier). Présomption d'innocence.
    aType: 'personne',
    aRef: 'Q983847',
    bType: 'organisation',
    bRef: 'Q180305',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "Dmitri Rybolovlev acquiert environ 66 % de l'AS Monaco FC en décembre 2011 pour " +
      "env. 50 M€ (les 34 % restants appartiennent à la Société des Bains de Mer / État monégasque). " +
      "STATUT PROCÉDURAL : mis en examen à Monaco (nov. 2019) pour corruption présumée (affaire " +
      "Bouvier) — mise en examen ≠ condamnation, présomption d'innocence.",
    dateDebut: new Date('2011-12-16'),
    dateFin: null,
    sourceRef: 'wp_rybolovlev',
  },

  // =========================================================================
  // STADE RENNAIS FC — Groupe Artémis / famille Pinault (INTERLOCK luxe)
  // =========================================================================
  {
    // O-O : Artémis → Stade Rennais : actionnaire majoritaire (100 %, depuis 1998)
    aType: 'organisation',
    aRef: 'Q2866000',
    bType: 'organisation',
    bRef: 'Q19509',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "Groupe Artémis (holding familiale Pinault) détient 100 % du Stade Rennais FC depuis 1998, " +
      "faisant du club breton un actif parmi ceux de la famille (Kering, Christie's, Le Point…).",
    dateDebut: new Date('1998-01-01'),
    dateFin: null,
    sourceRef: 'wp_artemis',
  },
  {
    // P-O : François Pinault → Artémis : fondateur (1992 — décédé le 23 avril 2025)
    aType: 'personne',
    aRef: 'Q1451167',
    bType: 'organisation',
    bRef: 'Q2866000',
    typeLienCode: 'FONDATEUR',
    description:
      "François Pinault fonde Artémis SAS en 1992 pour centraliser le contrôle familial sur " +
      "ses actifs (Kering, Christie's, Stade Rennais, Le Point…). Décédé le 23 avril 2025.",
    dateDebut: new Date('1992-01-01'),
    dateFin: new Date('2025-04-23'),
    sourceRef: 'wp_fpinault',
  },
  {
    // P-O : François-Henri Pinault → Artémis : Président (depuis 2005)
    aType: 'personne',
    aRef: 'Q1371822',
    bType: 'organisation',
    bRef: 'Q2866000',
    typeLienCode: 'DIRIGEANT',
    description:
      "François-Henri Pinault préside Artémis SAS depuis 2005, succédant à son père. " +
      "Il exerce le contrôle effectif sur Kering (PDG), Christie's, Stade Rennais FC et Le Point.",
    dateDebut: new Date('2005-01-01'),
    dateFin: null,
    sourceRef: 'wp_fhpinault',
  },

  // =========================================================================
  // RC LENS — Amber Capital / Joseph Oughourlian
  // =========================================================================
  {
    // O-O : Amber Capital → RC Lens : actionnaire majoritaire (depuis juil. 2011)
    aType: 'organisation',
    aRef: 'Q89345695',
    bType: 'organisation',
    bRef: 'Q191843',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "Amber Capital (Joseph Oughourlian) acquiert le Racing Club de Lens en juillet 2011, " +
      "sauvant le club artésien de la liquidation. Montée en Ligue 1 en 2020, vice-championnat 2023.",
    dateDebut: new Date('2011-07-01'),
    dateFin: null,
    sourceRef: 'wp_rclens',
  },
  {
    // P-O : Joseph Oughourlian → Amber Capital : dirigeant (fondateur & DG)
    aType: 'personne',
    aRef: 'Q47491482',
    bType: 'organisation',
    bRef: 'Q89345695',
    typeLienCode: 'DIRIGEANT',
    description:
      "Joseph Oughourlian est le fondateur et directeur général d'Amber Capital, " +
      "fonds d'investissement activiste fondé en 2005.",
    dateDebut: new Date('2005-01-01'),
    dateFin: null,
    sourceRef: 'wp_oughourlian',
  },
  {
    // P-O : Joseph Oughourlian → RC Lens : Président du Conseil de surveillance (depuis 2011)
    aType: 'personne',
    aRef: 'Q47491482',
    bType: 'organisation',
    bRef: 'Q191843',
    typeLienCode: 'DIRIGEANT',
    description:
      "Joseph Oughourlian préside le Conseil de surveillance du Racing Club de Lens depuis l'acquisition " +
      "en 2011 par Amber Capital.",
    dateDebut: new Date('2011-07-01'),
    dateFin: null,
    sourceRef: 'wp_oughourlian',
  },

  // =========================================================================
  // OLYMPIQUE LYONNAIS — Eagle Football Holdings / John Textor (multi-club)
  // =========================================================================
  {
    // O-O : Eagle Football Holdings → OL Groupe : actionnaire majoritaire (>75 %, depuis déc. 2022)
    aType: 'organisation',
    aRef: 'Q135655556',
    bType: 'organisation',
    bRef: 'Q3347591',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "Eagle Football Holdings (John Textor) franchit le seuil de 75 % du capital d'OL Groupe " +
      "en décembre 2022 au terme d'une OPA sur la société cotée sur Euronext Paris.",
    dateDebut: new Date('2022-12-19'),
    dateFin: null,
    sourceRef: 'wp_olgroupe',
  },
  {
    // O-O : OL Groupe → Olympique Lyonnais : filiale (100 %)
    aType: 'organisation',
    aRef: 'Q3347591',
    bType: 'organisation',
    bRef: 'Q704',
    typeLienCode: 'FILIALE',
    description:
      "OL Groupe détient à 100 % le club Olympique Lyonnais, entité sportive professionnelle " +
      "et ses actifs (Groupama Stadium, Centre de formation…).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_ol',
  },
  {
    // P-O : John Textor → Eagle Football Holdings : bénéficiaire effectif (contrôle de la holding)
    aType: 'personne',
    aRef: 'Q108094403',
    bType: 'organisation',
    bRef: 'Q135655556',
    typeLienCode: 'BENEFICIAIRE_EFFECTIF',
    description:
      "John Textor est le fondateur et bénéficiaire effectif principal d'Eagle Football Holdings, " +
      "consortium multi-club (OL, Crystal Palace, Botafogo, RWD Molenbeek).",
    dateDebut: new Date('2021-01-01'),
    dateFin: null,
    sourceRef: 'wp_eagle',
  },
  {
    // P-O : John Textor → OL Groupe : Executive Chairman (depuis déc. 2022)
    aType: 'personne',
    aRef: 'Q108094403',
    bType: 'organisation',
    bRef: 'Q3347591',
    typeLienCode: 'DIRIGEANT',
    description:
      "John Textor est Executive Chairman d'OL Groupe depuis l'aboutissement de l'OPA Eagle Football " +
      "en décembre 2022.",
    dateDebut: new Date('2022-12-19'),
    dateFin: null,
    sourceRef: 'wp_textor',
  },

  // =========================================================================
  // TOULOUSE FC — RedBird Capital Partners (multi-club)
  // =========================================================================
  {
    // O-O : RedBird → Toulouse FC : actionnaire majoritaire (100 %, depuis juin 2020)
    aType: 'organisation',
    aRef: 'Q116116844',
    bType: 'organisation',
    bRef: 'Q19518',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "RedBird Capital Partners (Gerry Cardinale) acquiert 100 % du Toulouse FC en juin 2020 " +
      "pour env. 12 M€. Le club est promu en Ligue 1 en 2022 et remporte la Coupe de France 2023. " +
      "RedBird détient aussi une participation dans AC Milan (multi-club interlock).",
    dateDebut: new Date('2020-06-22'),
    dateFin: null,
    sourceRef: 'wp_toulouse',
  },

  // =========================================================================
  // RC STRASBOURG ALSACE — Todd Boehly / BlueCo (multi-club)
  // =========================================================================
  {
    // P-O : Todd Boehly → RC Strasbourg Alsace : actionnaire via BlueCo (depuis juil. 2022)
    aType: 'personne',
    aRef: 'Q56513174',
    bType: 'organisation',
    bRef: 'Q126334',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "Todd Boehly, via son consortium BlueCo (sans Q-id Wikidata disponible), acquiert le " +
      "RC Strasbourg Alsace en juillet 2022 — deux mois après l'acquisition de Chelsea FC (EPL) " +
      "par le même consortium. Interlock franco-anglais multi-club documenté.",
    dateDebut: new Date('2022-07-01'),
    dateFin: null,
    sourceRef: 'wp_strasbourg',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js et seed-fortunes-1.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-clubs-proprietaires] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-clubs-proprietaires] Entité introuvable pour lien ${lien.typeLienCode} ` +
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
  console.log('Suppression données clubs-proprietaires précédentes...')
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
  console.log('\n-- seed-clubs-proprietaires — propriétaires clubs FR (Ligue 1 + grands clubs) --\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok ${data.titre}`)
  }

  console.log('\n— Personnes (Wikidata) —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ok ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n— Organisations (Wikidata) —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ok ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Liens —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n-- Bilan --')
  console.log(
    `Personnes     : ${PERSONNES.length} (Al-Khelaïfi, McCourt, Ratcliffe, Rybolovlev, ` +
      `F. Pinault†, F.-H. Pinault, Oughourlian, Textor, Boehly)`,
  )
  console.log(
    `Organisations : ${ORGANISATIONS.length} (9 clubs + QSI, beIN, INEOS, Artémis, Amber Capital, ` +
      `OL Groupe, Eagle Football, RedBird)`,
  )
  console.log(`Sources       : ${Object.keys(SOURCES).length} (Wikipédia FR/EN)`)
  console.log(
    `Liens         : ${LIENS.length} (ACTIONNAIRE_MAJORITAIRE, FILIALE, DIRIGEANT, FONDATEUR, BENEFICIAIRE_EFFECTIF)`,
  )
  console.log('')
  console.log('Interlocks documentés :')
  console.log('  • QSI/Al-Khelaïfi : PSG (sport) ↔ beIN Media Group (media)')
  console.log('  • Pinault/Artémis  : Stade Rennais ↔ Kering/luxe (seed-luxe-familles)')
  console.log('  • INEOS/Ratcliffe  : OGC Nice ↔ Manchester United (27,7 %)')
  console.log('  • Eagle Football   : OL ↔ Crystal Palace ↔ Botafogo ↔ RWD Molenbeek')
  console.log('  • Boehly/BlueCo    : RC Strasbourg ↔ Chelsea FC')
  console.log('  • RedBird          : Toulouse FC ↔ AC Milan (minoritaire)')
  console.log('')
  console.log('LOSC Lille exclu : propriétaire sans Q-id Wikidata vérifiable.')
  console.log('')
}

main()
  .catch((err) => {
    console.error('[seed-clubs-proprietaires] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
