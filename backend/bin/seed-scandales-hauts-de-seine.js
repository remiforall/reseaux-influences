/**
 * Seed Scandales Hauts-de-Seine — cluster politico-financier du fief RPR/UMP des Hauts-de-Seine.
 *
 * Enquête OSINT journalistique — 2026-07-02.
 *
 * Périmètre :
 *   Personnalités NOUVELLES (non encore en base) :
 *     • Charles Pasqua (Q725609)  — sénateur HdS, ministre, président CG92 (1973-76 et 1988-2004)
 *     • Didier Schuller (Q3027199) — directeur HLM 92, affaire des HLM des Hauts-de-Seine
 *     • Patrick Devedjian (Q1383590) — président CG92 (2007-2020), décédé COVID-19
 *
 *   Personnalités DÉJÀ EN BASE (référencées dans les liens uniquement) :
 *     Nicolas Sarkozy (Q329), Patrick Balkany (Q945181), Isabelle Balkany (Q3154865),
 *     Jacques Chirac (Q2105), Alain Juppé (Q215569).
 *
 *   Organisations NOUVELLES :
 *     • RPR — Rassemblement pour la République (Q1052584), fondé 1976, dissous 2002
 *     • Conseil départemental des Hauts-de-Seine (Q23782144), depuis 1968
 *
 *   Figure "Ackerman / Ackermann" : aucune personnalité publique portant ce nom n'a pu être
 *   identifiée dans les sources publiques liées aux affaires des Hauts-de-Seine. Aucun Q-id
 *   Wikidata trouvé. → EXCLUE de ce seed (cf. méthode.md).
 *
 * Statuts judiciaires (art. 10 RGPD — présomption d'innocence) :
 *   — Pasqua : condamné DÉFINITIVEMENT par la Cour de cassation le 8 avr. 2010 (Casino d'Annemasse,
 *     18 mois sursis). Condamné en 2010 pour Sofremi (1 an sursis) — statut cassation non établi
 *     avant son décès le 29 juin 2015 (action publique éteinte pour les procédures encore pendantes).
 *   — Schuller : condamné DÉFINITIVEMENT — cour d'appel Paris 25 jan. 2007 + cassation rejetée.
 *   — Devedjian : aucune condamnation judiciaire pour faits politico-financiers documentée.
 *     Décédé le 28 mars 2020.
 *
 * Sources : Wikidata (Q-ids vérifiés via Special:EntityData + Wikipédia FR),
 *           France Info, Europe 1, Le Moniteur.
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - dateConsultation : 2026-07-02
 *
 * Usage :
 *   cd backend && node bin/seed-scandales-hauts-de-seine.js
 *   cd backend && node bin/seed-scandales-hauts-de-seine.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — 3 nouvelles, chacune recoupée par ≥ 2 sources publiques.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q725609 + Wikipédia FR (Charles Pasqua)
    //           + France Info (condamné définitivement Casino d'Annemasse, 8 avr. 2010)
    //           + France 24 (condamné pour Sofremi, avr. 2010)
    //
    // Condamnation définitive — Casino d'Annemasse :
    //   7,5 millions de francs issus de la vente du casino d'Annemasse (1995) utilisés
    //   pour financer la campagne des européennes de 1999 via son parti.
    //   Trib. correctionnel Paris, 26 nov. 2007 : 18 mois sursis.
    //   Cour d'appel Paris, mars 2008 : confirmé.
    //   Cour de cassation, 8 avr. 2010 : pourvoi rejeté → condamnation définitive.
    //   Peine : 18 mois de prison avec sursis pour faux, financement illégal de campagne
    //   électorale et abus de confiance.
    //
    // Affaire Sofremi (vente d'armes — statut à préciser) :
    //   Condamné en appel le 30 avr. 2010 à 1 an sursis pour complicité d'abus de biens
    //   sociaux et recel. Statut cassation non établi avant le décès (29 juin 2015) :
    //   si un pourvoi était encore pendant, l'action publique s'est éteinte par le décès.
    //
    // Présomption d'innocence maintenue pour les affaires dans lesquelles il a été relaxé
    // (Angolagate, Oil-for-Food, fondation Hamon — relaxé en appel après son décès, etc.).
    nom: 'Pasqua',
    prenom: 'Charles',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1927-04-18'),
    lieuNaissance: 'Grasse (Alpes-Maritimes)',
    rolePrincipal: "Ancien ministre de l'Intérieur, sénateur des Hauts-de-Seine",
    rolesSecondaires: [
      'ancien président du Conseil général des Hauts-de-Seine (1973-1976 et 1988-2004)',
      "ancien ministre de l'Intérieur (1986-1988 et 1993-1995)",
      'cofondateur et figure historique du RPR',
      'décédé le 29 juin 2015',
    ],
    bio:
      "Ancien ministre de l'Intérieur (1986-1988 et 1993-1995), sénateur des Hauts-de-Seine, " +
      "président du Conseil général des Hauts-de-Seine (1973-1976 et 1988-2004). " +
      "Décédé le 29 juin 2015. Selon France Info : condamné définitivement le 8 avr. 2010 par " +
      "la Cour de cassation pour faux, financement illégal de campagne et abus de confiance " +
      "(affaire du casino d'Annemasse — 18 mois sursis). Condamné également en appel en 2010 " +
      "pour complicité d'abus de biens sociaux (affaire Sofremi, 1 an sursis) ; statut cassation " +
      "incertain au moment du décès (action publique éteinte pour les procédures pendantes).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Charles_Pasqua',
    wikidataId: 'Q725609',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3027199 + Wikipédia FR (Didier Schuller)
    //           + Europe 1 ("HLM de Paris : Didier Schuller condamné définitivement")
    //           + Le Moniteur ("Deux ans ferme pour Didier Schuller", jan. 2007)
    //
    // Condamnation définitive — affaire des HLM des Hauts-de-Seine :
    //   Trafic d'influence : financement occulte de sa campagne RPR à Clichy-la-Garenne
    //   (1988-1995) via des commissions versées par des entreprises de BTP en échange
    //   de marchés publics de l'Office HLM des Hauts-de-Seine (dont il était directeur général).
    //   Fuite en République dominicaine dès fév. 1995 — retour en France fév. 2002.
    //   Trib. correctionnel de Créteil (2005) : 5 ans dont 2 ans ferme.
    //   Cour d'appel de Paris, 25 jan. 2007 : 3 ans dont 1 an ferme + 150 000 euros d'amende
    //   + 5 ans de privation des droits civiques.
    //   Cour de cassation : pourvoi rejeté → condamnation définitive.
    nom: 'Schuller',
    prenom: 'Didier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1947-06-08'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Ancien directeur général de l'Office HLM des Hauts-de-Seine",
    rolesSecondaires: [
      'ancien responsable politique RPR à Clichy-la-Garenne',
      'réfugié en République dominicaine de 1995 à 2002 pour fuir la justice française',
    ],
    bio:
      "Directeur général de l'Office HLM des Hauts-de-Seine (1988-1995). " +
      "A fui la justice française dès février 1995 (Bahamas, puis République dominicaine). " +
      "Rentré en France en février 2002. Selon Europe 1 et Le Moniteur : condamné " +
      "définitivement pour trafic d'influence (affaire des HLM des Hauts-de-Seine) à " +
      "3 ans dont 1 an ferme, 150 000 euros d'amende et 5 ans de privation des droits " +
      "civiques (cour d'appel de Paris, 25 jan. 2007, cassation rejetée).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Didier_Schuller',
    wikidataId: 'Q3027199',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q1383590 + Wikipédia FR (Patrick Devedjian)
    //           + Wikipédia FR (Conseil départemental des Hauts-de-Seine, liste des présidents)
    //
    // Statut judiciaire : aucune condamnation judiciaire pour des faits politico-financiers
    // n'est documentée dans les sources publiques consultées. Décédé le 28 mars 2020.
    nom: 'Devedjian',
    prenom: 'Patrick',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1944-08-26'),
    lieuNaissance: 'Courbevoie (Hauts-de-Seine)',
    rolePrincipal: 'Ancien président du Conseil général des Hauts-de-Seine (2007-2020)',
    rolesSecondaires: [
      'ancien secrétaire général du RPR (1999-2002)',
      'ancien député des Hauts-de-Seine (1986-2002, 2005-2009, 2010-2017)',
      "ancien ministre délégué aux Libertés locales (2002-2004)",
      "ancien ministre délégué à l'Industrie (2004-2005)",
      "ancien ministre chargé du plan de relance (2008-2010)",
      'décédé le 28 mars 2020 (COVID-19)',
    ],
    bio:
      "Avocat, ancien secrétaire général du RPR (1999-2002), député des Hauts-de-Seine " +
      "et président du Conseil général des Hauts-de-Seine à partir de 2007 jusqu'à son " +
      "décès le 28 mars 2020 — premier responsable politique français emporté par le COVID-19. " +
      "A exercé plusieurs fonctions ministérielles sous Chirac (2002-2005) et Sarkozy (2008-2010). " +
      "Aucune condamnation judiciaire pour des faits politico-financiers n'est documentée.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Patrick_Devedjian',
    wikidataId: 'Q1383590',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — 2 nouvelles
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q1052584 + Wikipédia FR (Rassemblement pour la République)
    nom: 'Rassemblement pour la République',
    sigle: 'RPR',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Parti politique gaulliste fondé le 5 décembre 1976 par Jacques Chirac sur les décombres " +
      "de l'UDR. Fief des Hauts-de-Seine : Pasqua, Juppé, Sarkozy, Balkany et Devedjian y ont " +
      "tous occupé des fonctions dirigeantes. Dissous le 17 novembre 2002 pour fusionner dans " +
      "l'Union pour un mouvement populaire (UMP).",
    dateCreation: new Date('1976-12-05'),
    dateFin: new Date('2002-11-17'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Rassemblement_pour_la_R%C3%A9publique',
    wikidataId: 'Q1052584',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q23782144 + Wikipédia FR (Conseil départemental des Hauts-de-Seine)
    nom: 'Conseil départemental des Hauts-de-Seine',
    sigle: 'CG92',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.hauts-de-seine.fr',
    description:
      "Assemblée délibérante du département des Hauts-de-Seine (92), créée le 1er janvier 1968. " +
      "Dénommée Conseil général jusqu'en 2015, puis Conseil départemental. " +
      "Fief historique du RPR puis de l'UMP : présidé successivement par Charles Pasqua " +
      "(1973-1976 et 1988-2004), Nicolas Sarkozy (2004-2007) et Patrick Devedjian (2007-2020).",
    dateCreation: new Date('1968-01-01'),
    dateFin: null,
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/Conseil_d%C3%A9partemental_des_Hauts-de-Seine',
    wikidataId: 'Q23782144',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_pasqua: {
    url: 'https://fr.wikipedia.org/wiki/Charles_Pasqua',
    titre: 'Charles Pasqua — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Biographie : ministre de l'Intérieur (1986-88, 1993-95), sénateur HdS, président " +
      "du CG92 (1973-76 et 1988-2004). Volet judiciaire : casino d'Annemasse, Sofremi.",
    verifiee: true,
  },
  fi_pasqua_casino: {
    url: 'https://www.franceinfo.fr/france/l-ancien-ministre-de-l-interieur-charles-pasqua-est-definitivement-condamne-dans-l-affaire-du-casino-d-annemasse_235005.html',
    titre: "Charles Pasqua définitivement condamné dans l'affaire du casino d'Annemasse",
    media: 'France Info',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2010-04-08'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction France Info',
    description:
      "Cour de cassation, 8 avr. 2010 : pourvoi rejeté dans l'affaire du casino d'Annemasse. " +
      "Condamnation définitive à 18 mois de prison avec sursis pour faux, financement illégal " +
      "de campagne et abus de confiance.",
    verifiee: true,
  },
  f24_pasqua_sofremi: {
    url: 'https://www.france24.com/fr/20100430-charles-pasqua-condamne-an-prison-sursis-cjr-sofremi-interieur-republique',
    titre: "Charles Pasqua condamné à un an de prison avec sursis",
    media: 'France 24',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2010-04-30'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction France 24',
    description:
      "Condamné le 30 avr. 2010 à 1 an de prison avec sursis pour complicité d'abus de biens " +
      "sociaux et recel dans l'affaire Sofremi (commissions sur contrats d'armement). " +
      "Statut cassation non établi avant son décès en 2015.",
    verifiee: true,
  },
  wp_schuller: {
    url: 'https://fr.wikipedia.org/wiki/Didier_Schuller',
    titre: 'Didier Schuller — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Biographie : directeur HLM 92 (1988-1995), fuite 1995, retour 2002, condamné " +
      "pour trafic d'influence. Condamnation définitive confirmée (cassation).",
    verifiee: true,
  },
  europe1_schuller: {
    url: 'https://www.europe1.fr/politique/HLM-de-Paris-Didier-Schuller-condamne-definitivement-236534',
    titre: 'HLM de Paris : Didier Schuller condamné définitivement',
    media: 'Europe 1',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2007-01-25'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction Europe 1',
    description:
      "Cour d'appel de Paris, 25 jan. 2007 : Schuller condamné à 3 ans dont 1 an ferme, " +
      "150 000 euros d'amende et 5 ans de privation des droits civiques. Cassation rejetée.",
    verifiee: true,
  },
  wp_devedjian: {
    url: 'https://fr.wikipedia.org/wiki/Patrick_Devedjian',
    titre: 'Patrick Devedjian — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Biographie : avocat, secrétaire général RPR (1999-2002), député HdS, " +
      "président CG92 (2007-2020), décédé COVID-19 le 28 mars 2020.",
    verifiee: true,
  },
  wp_rpr: {
    url: 'https://fr.wikipedia.org/wiki/Rassemblement_pour_la_R%C3%A9publique',
    titre: 'Rassemblement pour la République — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "RPR fondé le 5 déc. 1976 par Chirac, dissous le 17 nov. 2002 dans l'UMP. " +
      "Pasqua, Juppé, Sarkozy, Balkany, Devedjian : figures du réseau HdS.",
    verifiee: true,
  },
  wp_cd92: {
    url: 'https://fr.wikipedia.org/wiki/Conseil_d%C3%A9partemental_des_Hauts-de-Seine',
    titre: 'Conseil départemental des Hauts-de-Seine — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Présidents successifs : Pasqua (1973-76 et 1988-2004), Sarkozy (2004-2007), " +
      "Devedjian (2007-2020). Fief historique du RPR puis de l'UMP.",
    verifiee: true,
  },
  wp_hlm92: {
    url: 'https://fr.wikipedia.org/wiki/Affaire_des_HLM_des_Hauts-de-Seine',
    titre: "Affaire des HLM des Hauts-de-Seine — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Financement occulte du RPR via l'Office HLM des HdS (1988-1995) : Schuller directeur " +
      "général, commissions sur marchés publics de construction, réseau RPR des Hauts-de-Seine.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe ADR-002. Un seul entite non-nulle de chaque côté.
// Les personnes DÉJÀ EN BASE (Chirac Q2105, Juppé Q215569, Sarkozy Q329, Balkany Q945181)
// sont référencées par wikidataId — trouverEntite() les résout sans les recréer.
// ---------------------------------------------------------------------------

const LIENS = [
  // ── RPR : noyau fondateur et dirigeants ─────────────────────────────────

  {
    // Chirac (déjà en base) → RPR
    aType: 'personne',
    aRef: 'Q2105',
    bType: 'organisation',
    bRef: 'Q1052584',
    typeLienCode: 'FONDATEUR',
    description:
      "Jacques Chirac fonde le RPR le 5 décembre 1976 au Palais des Sports de Paris, " +
      "sur les décombres de l'UDR, et en reste le leader incontesté jusqu'à son " +
      "accession à la présidence de la République en 1995.",
    dateDebut: new Date('1976-12-05'),
    dateFin: null,
    sourceRef: 'wp_rpr',
  },
  {
    // Pasqua (nouveau) → RPR
    aType: 'personne',
    aRef: 'Q725609',
    bType: 'organisation',
    bRef: 'Q1052584',
    typeLienCode: 'DIRIGEANT',
    description:
      "Charles Pasqua est une figure cofondatrice du RPR et président de sa fédération " +
      "des Hauts-de-Seine. Sénateur RPR des Hauts-de-Seine de 1968 à 2011 (avec interruption).",
    dateDebut: new Date('1976-12-05'),
    dateFin: new Date('2002-11-17'),
    sourceRef: 'wp_rpr',
  },
  {
    // Juppé (déjà en base) → RPR
    aType: 'personne',
    aRef: 'Q215569',
    bType: 'organisation',
    bRef: 'Q1052584',
    typeLienCode: 'DIRIGEANT',
    description:
      "Alain Juppé est secrétaire général du RPR de 1988 à 1995, période durant laquelle " +
      "il organise le système des emplois fictifs du RPR et de la Ville de Paris.",
    dateDebut: new Date('1988-01-01'),
    dateFin: new Date('1995-05-17'),
    sourceRef: 'wp_rpr',
  },
  {
    // Devedjian (nouveau) → RPR
    aType: 'personne',
    aRef: 'Q1383590',
    bType: 'organisation',
    bRef: 'Q1052584',
    typeLienCode: 'DIRIGEANT',
    description:
      "Patrick Devedjian est secrétaire général du RPR de 1999 à sa dissolution " +
      "en novembre 2002 et fusion dans l'UMP.",
    dateDebut: new Date('1999-01-01'),
    dateFin: new Date('2002-11-17'),
    sourceRef: 'wp_rpr',
  },
  {
    // Sarkozy (déjà en base) → RPR
    aType: 'personne',
    aRef: 'Q329',
    bType: 'organisation',
    bRef: 'Q1052584',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Nicolas Sarkozy est un cadre majeur du RPR à partir des années 1980 : " +
      "trésorier général national (1988-1990), porte-parole (1992-1993). " +
      "Il préside l'UMP (successeur du RPR) à partir de 2004.",
    dateDebut: new Date('1976-12-05'),
    dateFin: new Date('2002-11-17'),
    sourceRef: 'wp_rpr',
  },
  {
    // Balkany (déjà en base) → RPR
    aType: 'personne',
    aRef: 'Q945181',
    bType: 'organisation',
    bRef: 'Q1052584',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Patrick Balkany est député-maire RPR de Levallois-Perret, " +
      "l'un des élus les plus emblématiques du réseau RPR des Hauts-de-Seine.",
    dateDebut: new Date('1976-12-05'),
    dateFin: new Date('2002-11-17'),
    sourceRef: 'wp_rpr',
  },
  {
    // Schuller (nouveau) → RPR
    aType: 'personne',
    aRef: 'Q3027199',
    bType: 'organisation',
    bRef: 'Q1052584',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Didier Schuller est un responsable politique RPR à Clichy-la-Garenne, " +
      "dont il finance les activités via des commissions occultes perçues sur " +
      "les marchés HLM des Hauts-de-Seine (1988-1995).",
    dateDebut: new Date('1988-01-01'),
    dateFin: new Date('1995-02-09'),
    sourceRef: 'wp_hlm92',
  },

  // ── Conseil général/départemental 92 : présidences successives ───────────

  {
    // Pasqua (nouveau) → CD92 — 2e terme le plus significatif (1988-2004)
    aType: 'personne',
    aRef: 'Q725609',
    bType: 'organisation',
    bRef: 'Q23782144',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Charles Pasqua préside le Conseil général des Hauts-de-Seine à deux reprises : " +
      "1973-1976 (premier terme) et 1988-2004 (seize ans de présidence continue).",
    dateDebut: new Date('1988-01-01'),
    dateFin: new Date('2004-03-31'),
    sourceRef: 'wp_cd92',
  },
  {
    // Sarkozy (déjà en base) → CD92
    aType: 'personne',
    aRef: 'Q329',
    bType: 'organisation',
    bRef: 'Q23782144',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Nicolas Sarkozy préside le Conseil général des Hauts-de-Seine d'avril 2004 à " +
      "mai 2007, date à laquelle il démissionne après son élection à la présidence de la République.",
    dateDebut: new Date('2004-04-01'),
    dateFin: new Date('2007-05-16'),
    sourceRef: 'wp_cd92',
  },
  {
    // Devedjian (nouveau) → CD92
    aType: 'personne',
    aRef: 'Q1383590',
    bType: 'organisation',
    bRef: 'Q23782144',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Patrick Devedjian préside le Conseil général puis Conseil départemental des " +
      "Hauts-de-Seine de 2007 jusqu'à son décès le 28 mars 2020.",
    dateDebut: new Date('2007-06-01'),
    dateFin: new Date('2020-03-28'),
    sourceRef: 'wp_devedjian',
  },

  // ── Affaire des HLM des Hauts-de-Seine ───────────────────────────────────

  {
    // Schuller (nouveau) → CD92 : emploi comme directeur de l'Office HLM
    aType: 'personne',
    aRef: 'Q3027199',
    bType: 'organisation',
    bRef: 'Q23782144',
    typeLienCode: 'EMPLOI',
    description:
      "Didier Schuller est directeur général de l'Office HLM des Hauts-de-Seine de 1988 " +
      "à 1995 (structure relevant du Conseil général). Il organise depuis ce poste le " +
      "financement occulte du réseau RPR via des commissions sur les marchés de construction.",
    dateDebut: new Date('1988-01-01'),
    dateFin: new Date('1995-02-09'),
    sourceRef: 'wp_schuller',
  },
  {
    // Schuller ↔ Balkany : même réseau politico-financier RPR des Hauts-de-Seine
    // (lien politique, pas juridique : procédures distinctes, pas de co-condamnation commune)
    aType: 'personne',
    aRef: 'Q3027199',
    bType: 'personne',
    bRef: 'Q945181',
    typeLienCode: 'politique',
    description:
      "Didier Schuller et Patrick Balkany appartiennent au même réseau RPR des " +
      "Hauts-de-Seine et sont liés par le même système de financement occulte de la droite " +
      "du département : commissions sur marchés HLM pour Schuller, blanchiment de fraude " +
      "fiscale pour Balkany (deux affaires distinctes, procédures séparées, condamnations " +
      "définitives indépendantes).",
    dateDebut: new Date('1988-01-01'),
    dateFin: new Date('1995-01-01'),
    sourceRef: 'wp_hlm92',
  },

  // ── Liens politiques entre personnalités historiques ─────────────────────

  {
    // Pasqua ↔ Chirac : cofondateurs du RPR, trente ans de collaboration
    aType: 'personne',
    aRef: 'Q725609',
    bType: 'personne',
    bRef: 'Q2105',
    typeLienCode: 'politique',
    description:
      "Charles Pasqua et Jacques Chirac sont cofondateurs du RPR (1976) et collaborateurs " +
      "de plus de trente ans. Pasqua a soutenu toutes les candidatures de Chirac à l'Elysée " +
      "et a exercé deux fois le ministère de l'Intérieur sous ses gouvernements de cohabitation.",
    dateDebut: new Date('1976-12-05'),
    dateFin: null,
    sourceRef: 'wp_pasqua',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js et seed-condamnations-colblanc.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-hds] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
  throw new Error(`Type entité non supporté : ${type}`)
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
      `[seed-hds] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef}, bRef=${lien.bRef}). ` +
        "Vérifier que les seeds précédents (db:seed:demo, seed-condamnations-colblanc) ont été exécutés.",
    )
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`TypeLien introuvable en base : ${lien.typeLienCode}`)
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
  console.log('Suppression données Hauts-de-Seine précédentes (NOUVELLES entités uniquement)...')
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
  console.log('\n--- seed-scandales-hauts-de-seine — cluster RPR/UMP des Hauts-de-Seine ---\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`  User : ${user.email}\n`)

  console.log('-- Sources publiques --')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  OK ${data.titre}`)
  }

  console.log('\n-- Personnes (nouvelles) --')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  OK ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n-- Organisations (nouvelles) --')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  OK ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n-- Liens --')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  OK ${lien.typeLienCode} -- ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n--- Bilan ---')
  console.log(`  Personnes nouvelles   : ${PERSONNES.length}`)
  console.log('    - Charles Pasqua (Q725609)  : condamné définitivement Casino d\'Annemasse (2010)')
  console.log('    - Didier Schuller (Q3027199) : condamné définitivement HLM 92 (2007)')
  console.log('    - Patrick Devedjian (Q1383590) : président CG92, décédé 2020, aucune condamnation pol.')
  console.log(`  Organisations nouvelles : ${ORGANISATIONS.length}`)
  console.log('    - RPR (Q1052584)                          : parti 1976-2002')
  console.log('    - Conseil dép. Hauts-de-Seine (Q23782144) : institution depuis 1968')
  console.log(`  Sources               : ${Object.keys(SOURCES).length}`)
  console.log(`  Liens                 : ${LIENS.length}`)
  console.log('  Déjà en base (référencés) : Sarkozy Q329, Balkany Q945181, Chirac Q2105, Juppé Q215569')
  console.log('  Exclu : "Ackerman/Ackermann" — aucune figure publique identifiable dans les sources HdS')
  console.log('  Affaires couvertes : HLM 92 (Schuller), Casino Annemasse (Pasqua),')
  console.log('                       Sofremi (Pasqua, statut partiel), emplois fictifs RPR (Chirac/Juppé)')
  console.log()
}

main()
  .catch((err) => {
    console.error('[seed-hds] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
