/**
 * Seed Condamnations Col Blanc — personnalités françaises condamnées définitivement
 * pour délinquance en col blanc (corruption, prise illégale d'intérêts, fraude fiscale,
 * détournement de fonds publics, blanchiment, financement illicite de campagne).
 *
 * Enquête OSINT journalistique — 2026-07-01.
 *
 * Statut procédural : seules les CONDAMNATIONS DÉFINITIVES (voies de recours épuisées) sont
 * présentées comme telles. Tout statut incertain est explicitement signalé dans la bio.
 * Présomption d'innocence respectée pour toute procédure en cours.
 *
 * Périmètre :
 *   • Nicolas Sarkozy (Q329) — 2 condamnations définitives (Bismuth 2024, Bygmalion 2025)
 *   • Jacques Chirac (Q2105) — emplois fictifs ville de Paris, définitif 2011 (décédé 2019)
 *   • Alain Juppé (Q215569) — emplois fictifs RPR/mairie de Paris, définitif 2004-2005
 *   • Jérôme Cahuzac (Q57751) — fraude fiscale, définitif appel 2018
 *   • Patrick Balkany (Q945181) — blanchiment de fraude fiscale, culpabilité Cour de cassation 2021
 *   • Isabelle Balkany (Q3154865) — co-condamnée même affaire, culpabilité Cour de cassation 2021
 *   • Stéphane Richard (Q2360382) — affaire Tapie, 3e procès 2025 (statut à confirmer)
 *
 * Exclusions explicites (non définitifs ou action publique éteinte — signalées ici) :
 *   ⚠ Vincent Bolloré (Q721491) : procès pénal fixé 7-17 déc. 2026 — PRÉSUMÉ INNOCENT.
 *   ⚠ Serge Dassault (Q316029) : décédé le 28 mai 2018 avant épuisement des voies de recours
 *     → action publique éteinte par décès, aucune condamnation définitive.
 *
 * Sources : Wikidata (Q-ids vérifiés via wbsearchentities + Wikipédia FR),
 *           Public Sénat, Le Club des Juristes, France Bleu, France 24, Europe 1,
 *           La Gazette France, lescasseroles.fr.
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - dateConsultation : 2026-07-01
 *
 * Usage :
 *   cd backend && node bin/seed-condamnations-colblanc.js
 *   cd backend && node bin/seed-condamnations-colblanc.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — chaque fiche recoupée par ≥ 2 sources publiques (cf. commentaires).
// Les condamnations sont formulées « selon [source], condamné·e le … à … pour … »
// conformément aux exigences art. 10 RGPD et présomption d'innocence.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q329 (vérifié wbsearchentities, "23rd president of France")
    //           + Wikipédia FR (Nicolas Sarkozy)
    //           + Public Sénat (cassation Bismuth 18 déc. 2024)
    //           + Le Club des Juristes (cassation Bygmalion 26 nov. 2025)
    // Condamnations définitives (voies de recours épuisées) :
    //   1. Affaire Bismuth (écoutes) : corruption d'un magistrat + trafic d'influence.
    //      Trib. correctionnel Paris, 1er mars 2021 → Cour d'appel Paris, 17 mai 2023
    //      → Cour de cassation, chambre criminelle, 18 déc. 2024 : pourvoi rejeté.
    //      Peine définitive : 3 ans dont 1 an ferme (bracelet électronique).
    //   2. Affaire Bygmalion : financement illicite de campagne présidentielle 2012.
    //      Trib. correctionnel Paris, 30 sept. 2021 → Cour d'appel Paris, 14 fév. 2024
    //      → Cour de cassation, 26 nov. 2025 : pourvoi rejeté.
    //      Peine définitive : 12 mois dont 6 mois avec sursis.
    nom: 'Sarkozy',
    prenom: 'Nicolas',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1955-01-28'),
    lieuNaissance: 'Paris (17e arrondissement)',
    rolePrincipal: 'Ancien président de la République française (2007-2012)',
    rolesSecondaires: [
      "ancien ministre de l'Intérieur (2002-2004 et 2005-2007)",
      'ancien président du Conseil général des Hauts-de-Seine',
      'avocat, membre du barreau de Paris',
    ],
    bio:
      "Vingt-troisième président de la République (2007-2012). Selon Public Sénat et " +
      "Le Club des Juristes : condamné définitivement le 18 déc. 2024 par la Cour de cassation " +
      "pour corruption et trafic d'influence (affaire Bismuth — écoutes) à 3 ans dont 1 ferme. " +
      "Condamné définitivement le 26 nov. 2025 pour financement illicite de campagne " +
      "(affaire Bygmalion) à 12 mois dont 6 sursis. Deux condamnations définitives.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nicolas_Sarkozy',
    wikidataId: 'Q329',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2105 (vérifié, "President of France from 1995 to 2007")
    //           + Wikipédia FR (Jacques Chirac)
    //           + Wikipédia FR (Affaire des emplois fictifs de la mairie de Paris)
    // Condamnation définitive :
    //   Tribunal correctionnel de Paris, 15 déc. 2011 : 2 ans de prison avec sursis
    //   pour détournement de fonds publics, abus de confiance, prise illégale d'intérêts
    //   (affaire des emplois fictifs de la Ville de Paris).
    //   La défense a renoncé à l'appel → condamnation définitive dès le 15 déc. 2011.
    //   Décédé le 26 septembre 2019.
    nom: 'Chirac',
    prenom: 'Jacques',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1932-11-29'),
    lieuNaissance: "Paris (5e arrondissement)",
    rolePrincipal: 'Ancien président de la République française (1995-2007)',
    rolesSecondaires: [
      'ancien Premier ministre (1974-1976 et 1986-1988)',
      'ancien maire de Paris (1977-1995)',
      'fondateur du RPR (1976)',
      'décédé le 26 septembre 2019',
    ],
    bio:
      "Vingt-deuxième président de la République (1995-2007), maire de Paris (1977-1995), " +
      "décédé le 26 septembre 2019. Selon Wikipédia : condamné le 15 décembre 2011 par le " +
      "tribunal correctionnel de Paris à 2 ans de prison avec sursis pour détournement de " +
      "fonds publics, abus de confiance et prise illégale d'intérêts (emplois fictifs " +
      "Ville de Paris). La défense renonce à l'appel : condamnation définitive.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jacques_Chirac',
    wikidataId: 'Q2105',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q215569 (vérifié via Wikipedia FR, "Alain Juppé, Q215569")
    //           + Wikipédia FR (Alain Juppé)
    //           + lescasseroles.fr (condamnation emplois fictifs)
    //           + Wikipédia FR (Affaire des emplois fictifs de la mairie de Paris)
    // Condamnation définitive :
    //   Prise illégale d'intérêts (emplois fictifs du RPR et Ville de Paris).
    //   Trib. correctionnel de Paris, 30 jan. 2004 : 18 mois sursis + 10 ans inéligibilité.
    //   Cour d'appel de Versailles, 1er déc. 2004 : 14 mois sursis + 1 an inéligibilité
    //   (recel abandonné, prise illégale d'intérêts maintenue, peine réduite).
    //   Pourvois en cassation rejetés → condamnation définitive.
    //   A purgé son inéligibilité et est revenu en politique (maire Bordeaux, PM 2004-2017).
    nom: 'Juppé',
    prenom: 'Alain',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1945-08-15'),
    lieuNaissance: 'Mont-de-Marsan (Landes)',
    rolePrincipal: 'Ancien Premier ministre (1995-1997)',
    rolesSecondaires: [
      'ancien ministre des Affaires étrangères (1993-1995 et 2011-2012)',
      'ancien maire de Bordeaux (1995-2004 et 2006-2019)',
      'ancien secrétaire général du RPR',
      'membre du Conseil constitutionnel depuis 2019',
    ],
    bio:
      "Ancien Premier ministre (1995-1997) et maire de Bordeaux, membre du Conseil " +
      "constitutionnel depuis 2019. Selon lescasseroles.fr et Wikipédia : condamné " +
      "définitivement pour prise illégale d'intérêts (affaire des emplois fictifs du RPR " +
      "et de la Ville de Paris) à 14 mois de prison avec sursis et 1 an d'inéligibilité " +
      "(Cour d'appel de Versailles, 1er déc. 2004, après rejet des pourvois).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Alain_Jupp%C3%A9',
    wikidataId: 'Q215569',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q57751 (vérifié wbsearchentities, "French politician")
    //           + Wikipédia FR (Jérôme Cahuzac)
    //           + Public Sénat (condamnation appel 2018)
    //           + Europe 1 (couverture de l'affaire)
    // Condamnation (appel définitif) :
    //   Fraude fiscale et blanchiment de fraude fiscale.
    //   Trib. correctionnel de Paris, 8 déc. 2016 : 3 ans ferme + 5 ans inéligibilité.
    //   Cour d'appel de Paris (2018) : 4 ans dont 2 ferme + 5 ans inéligibilité + 300 000 €.
    //   Le parquet général n'a pas formé de pourvoi en cassation selon Europe 1.
    //   Condamnation devenue définitive selon les sources consultées.
    nom: 'Cahuzac',
    prenom: 'Jérôme',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: 'Talence (Gironde)',
    rolePrincipal: 'Ancien ministre délégué au Budget (2012-2013)',
    rolesSecondaires: [
      'ancien député du Lot-et-Garonne (2002-2013)',
      'chirurgien-dermatologue (greffe de cheveux)',
      'démissionné le 19 mars 2013 après aveu de compte bancaire non déclaré en Suisse',
    ],
    bio:
      "Ancien ministre délégué au Budget (2012-2013), contraint à la démission le 19 mars 2013 " +
      "après avoir avoué détenir un compte bancaire non déclaré en Suisse puis au Singapour. " +
      "Selon Public Sénat (2018) : condamné en appel pour fraude fiscale et blanchiment à " +
      "4 ans dont 2 ferme, 5 ans d'inéligibilité et 300 000 euros d'amende. " +
      "Condamnation définitive selon les sources consultées (le parquet n'a pas formé de pourvoi).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/J%C3%A9r%C3%B4me_Cahuzac',
    wikidataId: 'Q57751',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q945181 (vérifié wbsearchentities, "French politician")
    //           + Wikipédia FR (Patrick Balkany)
    //           + France Bleu (cassation 30 juin 2021 + peine cour d'appel jan. 2023)
    // Condamnation définitive :
    //   Blanchiment de fraude fiscale aggravé (affaire Balkany — Levallois-Perret).
    //   Culpabilité DÉFINITIVEMENT confirmée par la Cour de cassation le 30 juin 2021
    //   (Crim., n° 20-82.733). Nouveau procès sur le quantum des peines :
    //   Cour d'appel de Paris, 9 jan. 2023 : 4 ans et demi ferme + 100 000 € amende
    //   + 10 ans d'inéligibilité.
    //   Note : la culpabilité est définitive ; un pourvoi sur la peine reste théoriquement possible.
    nom: 'Balkany',
    prenom: 'Patrick',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1948-08-14'),
    lieuNaissance: 'Boulogne-Billancourt (Hauts-de-Seine)',
    rolePrincipal: 'Ancien député-maire de Levallois-Perret',
    rolesSecondaires: [
      'ancien député des Hauts-de-Seine (1988-2019)',
      'époux de la co-condamnée Isabelle Balkany',
      'conseiller politique de Nicolas Sarkozy',
    ],
    bio:
      "Ancien député-maire de Levallois-Perret pendant trois décennies, proche de Nicolas Sarkozy. " +
      "Selon France Bleu : culpabilité pour blanchiment de fraude fiscale aggravé définitivement " +
      "confirmée par la Cour de cassation le 30 juin 2021 (n° 20-82.733). Peine fixée par la " +
      "cour d'appel de Paris le 9 janv. 2023 à 4 ans et demi ferme, 100 000 euros et " +
      "10 ans d'inéligibilité.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Patrick_Balkany',
    wikidataId: 'Q945181',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3154865 (vérifié wbsearchentities, "French politician and journalist")
    //           + France Bleu (même arrêt cassation 30 juin 2021 + peine jan. 2023)
    // Co-condamnée avec Patrick Balkany dans la même procédure (blanchiment fraude fiscale).
    // Culpabilité DÉFINITIVEMENT confirmée par la Cour de cassation le 30 juin 2021.
    // Cour d'appel de Paris, 9 jan. 2023 : 3 ans et demi ferme + 100 000 € + 10 ans inéligibilité.
    nom: 'Balkany',
    prenom: 'Isabelle',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: 'Ancienne élue municipale de Levallois-Perret',
    rolesSecondaires: [
      'ancienne conseillère générale des Hauts-de-Seine',
      'ancienne directrice de publication du journal Le Villageois',
      'épouse de Patrick Balkany, co-condamnée dans la même affaire',
    ],
    bio:
      "Ancienne élue de Levallois-Perret, épouse et co-condamnée de Patrick Balkany. " +
      "Selon France Bleu : culpabilité pour blanchiment de fraude fiscale aggravé " +
      "définitivement confirmée par la Cour de cassation le 30 juin 2021 (n° 20-82.733). " +
      "Peine fixée par la cour d'appel de Paris le 9 janv. 2023 à 3 ans et demi de prison " +
      "ferme, 100 000 euros d'amende et 10 ans d'inéligibilité.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Isabelle_Balkany',
    wikidataId: 'Q3154865',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2360382 (vérifié via Wikipédia FR)
    //           + France 24 (condamnation en appel nov. 2021)
    //           + La Gazette France (verdict 3e procès 2025)
    //           + CFE-CGC Orange (cassation 2023)
    // NB : Stéphane Richard est DÉJÀ EN BASE (upsert idempotent par wikidataId Q2360382).
    //      Ce seed complète son volet judiciaire (affaire Tapie).
    // Condamnation (statut à confirmer) :
    //   Affaire de l'arbitrage Tapie-Crédit Lyonnais.
    //   1er appel (nov. 2021) : 1 an sursis + 50 000 € pour complicité de détournement de fonds.
    //   Cour de cassation (2023) : casse et renvoie → 3e procès.
    //   3e procès (cour d'appel de Paris, 2025) : 6 mois sursis + 15 000 €,
    //   infraction requalifiée en négligence.
    //   ⚠ Statut procédural au 2026-07-01 : un nouveau pourvoi en cassation sur ce 3e procès
    //   est possible ; la condamnation définitive n'est pas garantie à la date de consultation.
    nom: 'Richard',
    prenom: 'Stéphane',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: "Ancien PDG d'Orange / France Telecom (2011-2022)",
    rolesSecondaires: [
      "ancien directeur de cabinet de Christine Lagarde, ministre de l'Économie (2007-2011)",
      "dirigeant d'entreprise dans les télécommunications",
    ],
    bio:
      "Ancien PDG d'Orange (2011-2022), ex-directeur de cabinet de Christine Lagarde. " +
      "Selon France 24 et La Gazette France : condamné dans l'affaire de l'arbitrage " +
      "Tapie-Crédit Lyonnais ; en 3e procès (après renvoi de cassation, 2025), la cour " +
      "d'appel de Paris l'a condamné à 6 mois de prison avec sursis et 15 000 euros " +
      "d'amende, l'infraction requalifiée en négligence. Statut définitif à confirmer.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/St%C3%A9phane_Richard',
    wikidataId: 'Q2360382',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-01).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_sarkozy: {
    url: 'https://fr.wikipedia.org/wiki/Nicolas_Sarkozy',
    titre: 'Nicolas Sarkozy — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Biographie : président de la République 2007-2012, ministre de l'Intérieur. " +
      "Volet judiciaire : affaires Bismuth (écoutes) et Bygmalion (financement campagne).",
    verifiee: true,
  },
  ps_sarkozy_bismuth: {
    url: 'https://www.publicsenat.fr/actualites/societe/affaire-des-ecoutes-nicolas-sarkozy-condamne-definitivement-a-un-an-sous-bracelet-electronique-une-premiere-pour-un-ex-president',
    titre:
      "Affaire des écoutes : Nicolas Sarkozy définitivement condamné à un an sous bracelet électronique",
    media: 'Public Sénat',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-12-18'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Rédaction Public Sénat',
    description:
      "Cour de cassation, 18 déc. 2024 : pourvoi de Sarkozy rejeté dans l'affaire Bismuth. " +
      "Condamnation définitive à 3 ans dont 1 an ferme (bracelet électronique) — première " +
      "pour un ex-président de la Ve République.",
    verifiee: true,
  },
  cj_sarkozy_bygmalion: {
    url: 'https://www.leclubdesjuristes.com/justice/affaire-bygmalion-une-nouvelle-condamnation-definitive-pour-nicolas-sarkozy-13139/',
    titre: "Affaire Bygmalion : une nouvelle condamnation définitive pour Nicolas Sarkozy",
    media: 'Le Club des Juristes',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-11-26'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Rédaction Le Club des Juristes',
    description:
      "Cour de cassation, 26 nov. 2025 : pourvoi de Sarkozy rejeté dans l'affaire Bygmalion. " +
      "Condamnation définitive à 12 mois dont 6 mois avec sursis pour financement illicite de " +
      "campagne électorale 2012.",
    verifiee: true,
  },
  wp_chirac: {
    url: 'https://fr.wikipedia.org/wiki/Jacques_Chirac',
    titre: 'Jacques Chirac — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Biographie : maire de Paris (1977-1995), Premier ministre, président (1995-2007). " +
      "Condamné le 15 déc. 2011 pour emplois fictifs Ville de Paris, décédé 2019.",
    verifiee: true,
  },
  wp_emplois_fictifs: {
    url: 'https://fr.wikipedia.org/wiki/Affaire_des_emplois_fictifs_de_la_mairie_de_Paris',
    titre: "Affaire des emplois fictifs de la mairie de Paris — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Affaire des emplois fictifs de la Ville de Paris et du RPR : condamnation de Juppé " +
      "(2004) pour prise illégale d'intérêts et de Chirac (2011) pour détournement de fonds " +
      "publics, abus de confiance, prise illégale d'intérêts.",
    verifiee: true,
  },
  wp_juppe: {
    url: 'https://fr.wikipedia.org/wiki/Alain_Jupp%C3%A9',
    titre: 'Alain Juppé — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Biographie : Premier ministre 1995-1997, condamné en 2004 pour prise illégale " +
      "d'intérêts, a purgé son inéligibilité, membre du Conseil constitutionnel depuis 2019.",
    verifiee: true,
  },
  lescasseroles_juppe: {
    url: 'https://www.lescasseroles.fr/les-politiques/alain-juppe/condamne-dans-laffaire-des-emplois-fictifs-de-la-mairie-de-paris',
    titre: "Alain Juppé condamné dans l'affaire des emplois fictifs de la mairie de Paris",
    media: 'lescasseroles.fr',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-01-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Récapitulatif de la condamnation de Juppé : trib. correctionnel (30 jan. 2004, 18 mois " +
      "sursis + 10 ans inéligibilité), cour d'appel de Versailles (1er déc. 2004, 14 mois " +
      "sursis + 1 an inéligibilité), condamnation définitive.",
    verifiee: true,
  },
  wp_cahuzac: {
    url: 'https://fr.wikipedia.org/wiki/J%C3%A9r%C3%B4me_Cahuzac',
    titre: 'Jérôme Cahuzac — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Biographie : ministre du Budget 2012-2013, démission après aveu compte Suisse. " +
      "Condamné en appel pour fraude fiscale et blanchiment à 4 ans dont 2 ferme.",
    verifiee: true,
  },
  ps_cahuzac_appel: {
    url: 'https://www.publicsenat.fr/actualites/non-classe/cahuzac-condamne-a-2-ans-ferme-devrait-echapper-a-la-prison-85951',
    titre: "Cahuzac condamné à 2 ans ferme, devrait échapper à la prison",
    media: 'Public Sénat',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2018-05-15'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Rédaction Public Sénat',
    description:
      "Cour d'appel de Paris (2018) : Cahuzac condamné à 4 ans dont 2 ferme, 5 ans " +
      "d'inéligibilité et 300 000 euros d'amende pour fraude fiscale et blanchiment. " +
      "Le parquet n'a pas formé de pourvoi en cassation.",
    verifiee: true,
  },
  fb_balkany: {
    url: 'https://www.francebleu.fr/infos/faits-divers-justice/les-peines-des-balkany-pour-blanchiment-de-fraude-fiscale-allegees-par-la-cour-d-appel-de-paris-6772612',
    titre:
      "Les peines des Balkany pour blanchiment de fraude fiscale allégées par la cour d'appel de Paris",
    media: 'France Bleu',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2023-01-09'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Rédaction France Bleu',
    description:
      "Cour d'appel de Paris, 9 jan. 2023 : Patrick Balkany condamné à 4 ans et demi ferme " +
      "+ 100 000 €; Isabelle Balkany à 3 ans et demi ferme + 100 000 €; 10 ans " +
      "d'inéligibilité chacun. Culpabilité définitive (Cour de cassation, 30 juin 2021).",
    verifiee: true,
  },
  wp_balkany: {
    url: 'https://fr.wikipedia.org/wiki/Affaire_Balkany',
    titre: 'Affaire Balkany — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Récapitulatif des affaires Balkany : fraude fiscale (Levallois), corruption, " +
      "blanchiment. Culpabilité définitive confirmée par Cour de cassation le 30 juin 2021.",
    verifiee: true,
  },
  f24_richard: {
    url: 'https://www.france24.com/fr/france/20211124-arbitrage-tapie-cr%C3%A9dit-lyonnais-le-patron-d-orange-st%C3%A9phane-richard-condamn%C3%A9-en-appel',
    titre:
      "Arbitrage Tapie-Crédit Lyonnais : le patron d'Orange Stéphane Richard condamné en appel",
    media: 'France 24',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2021-11-24'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Rédaction France 24',
    description:
      "1er appel (nov. 2021) : Stéphane Richard condamné à 1 an de prison avec sursis et " +
      "50 000 euros d'amende pour complicité de détournement de fonds publics (affaire Tapie). " +
      "Cassation ordonné un nouveau procès en 2023.",
    verifiee: true,
  },
  gazfrance_richard: {
    url: 'https://www.lagazettefrance.fr/article/arbitrage-tapie-l-ex-patron-d-orange-stephane-richard-condamne-a-six-mois-de-prison-avec-sursis',
    titre:
      "Arbitrage Tapie : l'ex-patron d'Orange Stéphane Richard condamné à six mois de prison avec sursis",
    media: 'La Gazette France',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-04-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Rédaction La Gazette France',
    description:
      "3e procès (appel après renvoi de cassation, 2025) : Stéphane Richard condamné à " +
      "6 mois sursis + 15 000 euros d'amende, infraction requalifiée en négligence. " +
      "Statut définitif non garanti à la date de consultation.",
    verifiee: false,
  },
}

// ---------------------------------------------------------------------------
// LIENS JURIDIQUES — co-condamnés d'une même affaire (P-P, typeLienCode: 'juridique').
// ---------------------------------------------------------------------------

const LIENS = [
  {
    // P-P : Patrick et Isabelle Balkany, co-condamnés dans la même procédure.
    // Blanchiment de fraude fiscale aggravé (affaire Balkany — Levallois-Perret).
    // Culpabilité définitivement confirmée par la Cour de cassation le 30 juin 2021.
    aType: 'personne',
    aRef: 'Q945181',
    bType: 'personne',
    bRef: 'Q3154865',
    typeLienCode: 'juridique',
    description:
      "Patrick et Isabelle Balkany co-condamnés pour blanchiment de fraude fiscale aggravé " +
      "(affaire des biens mal acquis à Levallois-Perret). Culpabilité définitive confirmée " +
      "par la Cour de cassation le 30 juin 2021 (n° 20-82.733). Peines : 4 ans 6 mois et " +
      "3 ans 6 mois ferme respectivement + 10 ans inéligibilité (cour d'appel Paris, 9 jan. 2023).",
    dateDebut: new Date('2019-09-13'),
    dateFin: null,
    sourceRef: 'fb_balkany',
  },
  {
    // P-P : Jacques Chirac et Alain Juppé, co-impliqués dans le même système d'emplois fictifs
    // de la Ville de Paris et du RPR. Procédures judiciaires distinctes portant sur le même
    // dispositif criminel : Juppé a organisé le système depuis le secrétariat général du RPR,
    // Chirac en a bénéficié comme maire de Paris. Tous deux condamnés définitivement.
    aType: 'personne',
    aRef: 'Q2105',
    bType: 'personne',
    bRef: 'Q215569',
    typeLienCode: 'juridique',
    description:
      "Jacques Chirac et Alain Juppé condamnés définitivement dans l'affaire des emplois " +
      "fictifs de la Ville de Paris et du RPR (même dispositif, procédures distinctes). " +
      "Juppé : prise illégale d'intérêts (cour d'appel Versailles, 1er déc. 2004). " +
      "Chirac : détournement + abus de confiance + prise illégale d'intérêts (trib. Paris, 15 déc. 2011).",
    dateDebut: new Date('2004-01-30'),
    dateFin: null,
    sourceRef: 'wp_emplois_fictifs',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-colblanc] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-colblanc] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('⚠ Suppression données col blanc précédentes...')
  const wikidataIds = PERSONNES.map((p) => p.wikidataId)
  const persos = await prisma.personne.findMany({ where: { wikidataId: { in: wikidataIds } } })
  const idsP = persos.map((p) => p.id)

  await prisma.lien.deleteMany({
    where: {
      OR: [{ personneAId: { in: idsP } }, { personneBId: { in: idsP } }],
    },
  })
  await prisma.personne.deleteMany({ where: { id: { in: idsP } } })
  console.log('✓ Données précédentes supprimées.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n┌─ seed-condamnations-colblanc — délinquance en col blanc FR ─┐\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`✓ User : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ✓ ${data.titre}`)
  }

  console.log('\n— Personnes (Wikidata) —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ✓ ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n— Liens juridiques (co-condamnés ou même affaire) —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ✓ ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n┌─ Bilan ─────────────────────────────────────────────────────┐')
  console.log(`│ Personnes      : ${PERSONNES.length}`)
  console.log(`│   Nouvelles    : Sarkozy, Chirac, Juppé, Cahuzac, P.Balkany, I.Balkany`)
  console.log(`│   Mise à jour  : Stéphane Richard (volet judiciaire Tapie)`)
  console.log(`│ Liens jurid.   : ${LIENS.length} (Balkany couple, Chirac-Juppé)`)
  console.log(`│ Sources        : ${Object.keys(SOURCES).length}`)
  console.log('│ Exclus (motif) : Bolloré (procès déc. 2026, présumé innocent),')
  console.log('│                  Serge Dassault (action publique éteinte par décès)')
  console.log('└─────────────────────────────────────────────────────────────┘\n')
}

main()
  .catch((err) => {
    console.error('[seed-colblanc] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
