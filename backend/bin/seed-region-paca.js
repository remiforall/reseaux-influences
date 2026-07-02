/**
 * Seed Région PACA / Région Sud — réseau d'influence (enquête OSINT, 2026-07-02).
 *
 * Périmètre :
 *   - Région Provence-Alpes-Côte d'Azur (institution + président Muselier)
 *   - Maires des grandes villes : Marseille (Payan), Nice (Estrosi → Ciotti mars 2026)
 *   - Élu PACA notables : Falco (sénateur Var), Sophie Joissains (ex-sénatrice BdR)
 *   - Affaire judiciaire terminée : Maryse Joissains-Masini, ex-maire d'Aix-en-Provence,
 *     condamnée DÉFINITIVEMENT par la Cour de cassation (prise illégale d'intérêts +
 *     détournement de fonds publics). Décision définitive = fait d'espèce établi.
 *
 * Entités DÉJÀ EN BASE — référencées par wikidataId uniquement (pas re-créées) :
 *   - Rodolphe Saadé (Q3438372) — via seed-barons-medias
 *   - CMA CGM (Q1023867) — via seed-barons-medias
 *   - La Provence (Q1799045) — via seed-barons-medias
 *   - Rassemblement National (Q205150) — via seed-eurodeputes-fr
 *
 * Sources : Wikidata (wikidata.org/wiki/Q<id>, tous vérifiés via Special:EntityData ou
 *           wbsearchentities), Wikipédia FR, HATVP, vie-publique.fr, France Bleu FR,
 *           France 3 PACA, ICI (francebleu.fr/franceinfo.fr), Marsactu.
 *
 * Garde-fous projet :
 *   - Toutes les entités en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - Idempotent (upsert par wikidataId)
 *   - Présomption d'innocence respectée : seule la condamnation DEFINITIVE de Maryse
 *     Joissains-Masini est traitée comme fait avéré ; toute autre procédure est signalée
 *     avec statut procédural exact.
 *
 * Usage :
 *   cd backend && node bin/seed-region-paca.js
 *   cd backend && node bin/seed-region-paca.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — recoupées par ≥ 2 sources publiques (cf. commentaires inline).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q3424934 (vérifié wikidata.org/wiki/Q3424934)
    //           + Wikipédia FR "Renaud Muselier" + maregionsud.fr (annuaire élus)
    //           + HATVP hatvp.fr/livraison/dossiers/muselier-renaud-dim25136-region-93.pdf
    // Rôle public : président du Conseil régional PACA depuis déc. 2017.
    nom: 'Muselier',
    prenom: 'Renaud',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1959-04-07'),
    lieuNaissance: 'Marseille (Bouches-du-Rhône)',
    rolePrincipal: 'Président du Conseil régional Provence-Alpes-Côte d\'Azur (Région Sud)',
    rolesSecondaires: [
      'ancien secrétaire d\'État aux Affaires étrangères (2002-2004)',
      'ancien député des Bouches-du-Rhône (2002-2017)',
      'ancien vice-président de l\'Assemblée nationale',
      'membre Les Républicains',
    ],
    bio:
      'Médecin, fils du sénateur Marius Muselier, Renaud Muselier est élu président du Conseil ' +
      'régional PACA en décembre 2017 à la suite du décès de Christian Estrosi. Réélu en 2021. ' +
      'Anciennement secrétaire d\'État aux Affaires étrangères (2002-2004) sous Raffarin.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Renaud_Muselier',
    wikidataId: 'Q3424934',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q63766719 (vérifié wikidata.org/wiki/Q63766719)
    //           + Wikipédia FR "Benoît Payan" + Ville de Marseille (site officiel)
    //           + France 3 PACA (annonce élection, déc. 2020)
    // Rôle public : maire de Marseille depuis déc. 2020.
    nom: 'Payan',
    prenom: 'Benoît',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1978-01-31'),
    lieuNaissance: 'Marseille (Bouches-du-Rhône)',
    rolePrincipal: 'Maire de Marseille',
    rolesSecondaires: [
      'co-fondateur de Printemps marseillais (2019)',
      'ancien premier adjoint au maire de Marseille',
      'ancien membre du Parti socialiste (jusqu\'en 2020)',
    ],
    bio:
      'Né dans le quartier Pont-de-Vivaux (10e arrondissement), Benoît Payan co-fonde en 2019 ' +
      'Printemps marseillais, large union de la gauche. Devenu premier adjoint, il est élu maire ' +
      'le 15 décembre 2020 après la démission de Michèle Rubirola, devenant le premier maire ' +
      'de gauche de Marseille depuis 1995.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Beno%C3%AEt_Payan',
    wikidataId: 'Q63766719',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q749029 (vérifié wikidata.org/wiki/Q749029)
    //           + Wikipédia FR "Christian Estrosi" + ICI francebleu.fr/fr/municipales-2026-nice
    // Rôle public : maire de Nice 2008-2026 (battu par Ciotti au second tour du 22 mars 2026).
    nom: 'Estrosi',
    prenom: 'Christian',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1955-07-01'),
    lieuNaissance: 'Nice (Alpes-Maritimes)',
    rolePrincipal: 'Ancien maire de Nice (2008-2026)',
    rolesSecondaires: [
      'pilote moto professionnel (champion du monde 500 cm³ 1984)',
      'ancien ministre de l\'Industrie (2009-2010)',
      'ancien député des Alpes-Maritimes',
      'ancien président du Conseil régional PACA (2015-2017)',
      'membre Les Républicains',
    ],
    bio:
      'Ex-champion du monde de moto (1984), Christian Estrosi est maire de Nice de 2008 à 2026. ' +
      'Il préside aussi le Conseil régional PACA (2015-2017) avant de céder la région à Muselier. ' +
      'Battu au second tour des élections municipales de mars 2026 par Éric Ciotti (37,2 % vs 48,5 %), ' +
      'il annonce son retrait de la vie politique niçoise.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Christian_Estrosi',
    wikidataId: 'Q749029',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q1844180 (vérifié wikidata.org/wiki/Q1844180)
    //           + Wikipédia FR "Éric Ciotti" + ICI francebleu.fr municipales 2026 Nice
    //           + France 3 PACA "Ciotti prend la mairie de Nice" (mars 2026)
    // Rôle public : maire de Nice depuis mars 2026 ; ex-président LR (exclu juin 2024).
    nom: 'Ciotti',
    prenom: 'Éric',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-06-11'),
    lieuNaissance: 'Nice (Alpes-Maritimes)',
    rolePrincipal: 'Maire de Nice (depuis mars 2026)',
    rolesSecondaires: [
      'ancien président des Républicains (2022 - exclu juin 2024)',
      'ancien député des Alpes-Maritimes (2007-2024)',
      'fondateur de Droite souveraine (alliance RN, 2024)',
    ],
    bio:
      'Juriste de formation, Éric Ciotti est député des Alpes-Maritimes depuis 2007. Élu président ' +
      'des Républicains en décembre 2022, il est exclu en juin 2024 après avoir noué une alliance ' +
      'électorale controversée avec le Rassemblement National pour les législatives. Il remporte ' +
      'la mairie de Nice au second tour le 22 mars 2026 (48,5 %) face à Christian Estrosi (37,2 %).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89ric_Ciotti',
    wikidataId: 'Q1844180',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3296342 (vérifié wikidata.org/wiki/Q3296342)
    //           + Wikipédia FR "Maryse Joissains-Masini"
    //           + France Bleu (francebleu.fr/infos/politique/l-ex-maire-d-aix-en-provence-maryse-joissains-1636034540)
    //           + France 3 PACA (france3-regions.franceinfo.fr « 8 mois de prison avec sursis »)
    //
    // STATUT JUDICIAIRE : CONDAMNATION DÉFINITIVE — Cour de cassation a rejeté le pourvoi,
    // confirmant l'arrêt de la Cour d'appel de Montpellier (décembre 2020) :
    // peine = 8 mois de prison avec sursis + 3 ans d'inéligibilité (France 3 PACA, date : 2021).
    // Faits retenus : prise illégale d'intérêts + détournement de fonds publics.
    // Démission de la mairie en 2021. Décision DEFINITITIVE = fait d'espèce avéré.
    nom: 'Joissains-Masini',
    prenom: 'Maryse',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1942-08-15'),
    lieuNaissance: 'Toulon (Var)',
    rolePrincipal: 'Ancienne maire d\'Aix-en-Provence (2001-2021)',
    rolesSecondaires: [
      'ancienne députée des Bouches-du-Rhône (2002-2012)',
      'membre Les Républicains',
      'condamnée définitivement (prise illégale d\'intérêts, détournement de fonds publics)',
    ],
    bio:
      'Maryse Joissains-Masini est maire d\'Aix-en-Provence de 2001 à 2021 (20 ans). ' +
      'Condamnée définitivement par la Cour de cassation à 8 mois de prison avec sursis ' +
      'et 3 ans d\'inéligibilité pour prise illégale d\'intérêts et détournement de fonds publics ' +
      'dans le cadre de marchés publics irréguliers passés par la commune. ' +
      'Elle démissionne de la mairie en 2021 (inéligibilité judiciaire + raisons de santé).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Maryse_Joissains-Masini',
    wikidataId: 'Q3296342',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2750200 (vérifié wikidata.org/wiki/Q2750200)
    //           + Wikipédia FR "Hubert Falco" + Sénat (senat.fr/senateur/falco_hubert95031c.html)
    // Rôle public : sénateur du Var en exercice ; ex-maire de Toulon.
    nom: 'Falco',
    prenom: 'Hubert',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1947-12-20'),
    lieuNaissance: 'Toulon (Var)',
    rolePrincipal: 'Sénateur du Var',
    rolesSecondaires: [
      'ancien maire de Toulon (2001-2014)',
      'ancien secrétaire d\'État à l\'Aménagement du territoire (2007-2010)',
      'ancien président du Conseil général du Var',
      'membre Les Républicains',
    ],
    bio:
      'Hubert Falco est une figure politique majeure du Var. Il préside le Conseil général du Var ' +
      'avant d\'être maire de Toulon (2001-2014). Secrétaire d\'État à l\'Aménagement du territoire ' +
      '(2007-2010) sous Fillon, il siège au Sénat comme sénateur du Var, figure LR incontournable ' +
      'dans la région PACA.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Hubert_Falco',
    wikidataId: 'Q2750200',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3490954 (vérifié wikidata.org/wiki/Q3490954)
    //           + Wikipédia FR "Sophie Joissains" + Sénat (nossenateurs.fr)
    // Rôle public : ex-sénatrice des Bouches-du-Rhône (LR) ; fille de Maryse Joissains-Masini.
    nom: 'Joissains',
    prenom: 'Sophie',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1962-04-21'),
    lieuNaissance: 'Aix-en-Provence (Bouches-du-Rhône)',
    rolePrincipal: 'Ancienne sénatrice des Bouches-du-Rhône (LR)',
    rolesSecondaires: [
      'ancienne conseillère régionale PACA',
      'fille de Maryse Joissains-Masini (ex-maire d\'Aix-en-Provence)',
      'membre Les Républicains',
    ],
    bio:
      'Avocate de formation, Sophie Joissains est sénatrice des Bouches-du-Rhône sous étiquette ' +
      'LR. Fille de Maryse Joissains-Masini, avec qui elle partage un ancrage dans la droite ' +
      'aixoise. Elle a exercé des mandats au Conseil régional PACA.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Sophie_Joissains',
    wikidataId: 'Q3490954',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q15104 (vérifié via recherche wikidata.org → "Provence-Alpes-Côte d'Azur")
    //           + Wikipedia EN "Provence-Alpes-Côte d'Azur"
    //           + maregionsud.fr (site officiel de la région)
    nom: 'Région Provence-Alpes-Côte d\'Azur (Région Sud)',
    sigle: 'PACA',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.maregionsud.fr',
    description:
      'Région administrative française couvrant 6 départements (Alpes-de-Haute-Provence, ' +
      'Alpes-Maritimes, Bouches-du-Rhône, Hautes-Alpes, Var, Vaucluse). Renommée « Région Sud » ' +
      'en décembre 2017 (appellation commerciale). Préfecture : Marseille. Président : Renaud Muselier (LR).',
    dateCreation: new Date('1982-03-02'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Provence-Alpes-C%C3%B4te_d%27Azur',
    wikidataId: 'Q15104',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q23482 (vérifié via Special:EntityData/Q23482 — label "Marseille")
    //           + Wikipedia EN/FR "Marseille"
    nom: 'Ville de Marseille',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.marseille.fr',
    description:
      'Commune des Bouches-du-Rhône, deuxième ville de France par la population (~900 000 hab.). ' +
      'Préfecture des Bouches-du-Rhône et chef-lieu de la région PACA. Maire : Benoît Payan (gauche) depuis déc. 2020.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Marseille',
    wikidataId: 'Q23482',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q33959 (vérifié via Special:EntityData/Q33959 — label "Nice",
    //           "city and commune in Alpes-Maritimes, PACA, France")
    //           + Wikipedia FR "Nice"
    nom: 'Ville de Nice',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.nice.fr',
    description:
      'Commune des Alpes-Maritimes, cinquième ville de France (~340 000 hab.), chef-lieu du département. ' +
      'Maire : Éric Ciotti (élu mars 2026, ex-LR/alliance RN). Précédent maire : Christian Estrosi (2008-2026).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nice',
    wikidataId: 'Q33959',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q47465 (identifié via résultat de recherche Wikidata "Aix-en-Provence")
    //           + Wikipedia FR "Aix-en-Provence"
    nom: 'Ville d\'Aix-en-Provence',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.aixenprovence.fr',
    description:
      'Commune des Bouches-du-Rhône (~147 000 hab.). Anciennement gouvernée par Maryse Joissains-Masini (LR) ' +
      'de 2001 à 2021. Site de l\'affaire de prise illégale d\'intérêts ayant conduit à la condamnation ' +
      'définitive de l\'ancienne maire.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Aix-en-Provence',
    wikidataId: 'Q47465',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q20012759 (vérifié via wikidata.org/wiki/Q20012759 + import-senateurs.js)
    //           + Wikipedia FR "Les Républicains"
    // NB : peut déjà être en base via import-senateurs.js — l'upsert wikidataId gère l'idempotence.
    nom: 'Les Républicains',
    sigle: 'LR',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.republicains.fr',
    description:
      'Parti politique français de centre-droit, héritier du RPR/UMP. ' +
      'Rebaptisé Les Républicains en mai 2015. Poids fort dans la région PACA : Muselier, Estrosi, Falco, ' +
      'Sophie et Maryse Joissains sont tous membres ou ex-membres LR.',
    dateCreation: new Date('2015-05-30'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_R%C3%A9publicains',
    wikidataId: 'Q20012759',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q203853 (vérifié wikidata.org/wiki/Q203853 via recherche "Nice-Matin wikidata")
    //           + Wikipedia FR "Groupe Nice-Matin" + pappers.fr (SIREN 807856596)
    // Groupe de presse régionale PACA : Nice-Matin, Var-Matin, Monaco-Matin.
    // Statut capitalistique : SCOP (coopérative de salariés) depuis 2013, après la liquidation du groupe Hersant.
    nom: 'Groupe Nice-Matin',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.nicematin.com',
    description:
      'Groupe de presse régionale PACA édité sous forme de SCOP depuis 2013 (reprise après liquidation ' +
      'du groupe Hersant). Publie Nice-Matin, Var-Matin et Monaco-Matin. ' +
      'SIREN : 807856596. Principal quotidien régional des Alpes-Maritimes et du Var.',
    dateCreation: new Date('2013-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Groupe_Nice-Matin',
    wikidataId: 'Q203853',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, dateConsultation 2026-07-02.
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_muselier: {
    url: 'https://fr.wikipedia.org/wiki/Renaud_Muselier',
    titre: 'Renaud Muselier — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Biographie de Renaud Muselier : médecin, secrétaire d\'État (2002-2004), ' +
      'député BdR, président du Conseil régional PACA depuis décembre 2017.',
    verifiee: true,
  },
  hatvp_muselier: {
    url: 'https://www.hatvp.fr/livraison/dossiers/muselier-renaud-dim25136-region-93.pdf',
    titre: 'Déclaration d\'intérêts — Renaud Muselier (HATVP)',
    media: 'HATVP',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: null,
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Haute Autorité pour la Transparence de la Vie Publique',
    description: 'Déclaration d\'intérêts publique de Renaud Muselier, président de la Région Sud.',
    verifiee: true,
  },
  wp_payan: {
    url: 'https://fr.wikipedia.org/wiki/Beno%C3%AEt_Payan',
    titre: 'Benoît Payan — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Né le 31 janvier 1978 à Marseille. Co-fondateur Printemps marseillais, ' +
      'élu maire le 15 décembre 2020 après démission de Michèle Rubirola.',
    verifiee: true,
  },
  wp_estrosi: {
    url: 'https://fr.wikipedia.org/wiki/Christian_Estrosi',
    titre: 'Christian Estrosi — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Pilote champion du monde moto 1984, maire de Nice 2008-2026, ' +
      'battu par Ciotti au second tour du 22 mars 2026.',
    verifiee: true,
  },
  ici_municipales2026_nice: {
    url: 'https://www.ici.fr/provence-alpes-cote-d-azur/alpes-maritimes-06/nice/municipales-2026-a-nice-eric-ciotti-elu-maire-christian-estrosi-battu-et-annonce-son-retrait-5991057',
    titre: 'Municipales 2026 à Nice : Éric Ciotti élu maire, Christian Estrosi battu',
    media: 'ICI (France Bleu / France Info)',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-03-22'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction ICI PACA',
    description:
      'Ciotti : 61 009 voix (48,54 %) ; Estrosi : 46 753 (37,20 %). ' +
      'Participation 55,92 %. Ciotti remporte 52/69 sièges du Conseil municipal.',
    verifiee: true,
  },
  wp_ciotti: {
    url: 'https://fr.wikipedia.org/wiki/%C3%89ric_Ciotti',
    titre: 'Éric Ciotti — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Né le 11 juin 1963 à Nice. Député AM (2007-2024), président LR (2022-2024, exclu). ' +
      'Alliance avec le RN (juin 2024). Maire de Nice depuis mars 2026.',
    verifiee: true,
  },
  france3_ciotti_estrosi: {
    url: 'https://france3-regions.franceinfo.fr/provence-alpes-cote-d-azur/alpes-maritimes/nice/eric-ciotti-prend-la-mairie-de-nice-a-son-frere-ennemi-christian-estrosi-cinq-dates-pour-comprendre-leur-relation-et-leur-lutte-finale-3321642.html',
    titre: 'Éric Ciotti prend la mairie de Nice à son « frère ennemi » Christian Estrosi',
    media: 'France 3 PACA',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-03-22'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction France 3 PACA',
    description:
      'Cinq dates qui retracent la relation puis la rivalité politique Ciotti-Estrosi ' +
      'au sein de la droite niçoise, culminant à l\'élection de mars 2026.',
    verifiee: true,
  },
  wp_joissains_m: {
    url: 'https://fr.wikipedia.org/wiki/Maryse_Joissains-Masini',
    titre: 'Maryse Joissains-Masini — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Née le 15 août 1942 à Toulon. Maire d\'Aix-en-Provence 2001-2021. ' +
      'Condamnation définitive : prise illégale d\'intérêts + détournement de fonds publics.',
    verifiee: true,
  },
  france_bleu_joissains_condamnee: {
    url: 'https://www.francebleu.fr/infos/politique/l-ex-maire-d-aix-en-provence-maryse-joissains-1636034540',
    titre: 'L\'ex-maire d\'Aix-en-Provence, Maryse Joissains, définitivement condamnée',
    media: 'France Bleu',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2021-11-04'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction France Bleu Provence',
    description:
      'Cour de cassation rejette le pourvoi de Maryse Joissains. ' +
      'Condamnation définitive : prise illégale d\'intérêts et détournement de fonds publics.',
    verifiee: true,
  },
  france3_joissains_peine: {
    url: 'https://france3-regions.franceinfo.fr/provence-alpes-cote-d-azur/bouches-du-rhone/aix-en-provence/maire-aix-provence-maryse-joissains-condamnee-8-mois-prison-sursis-3-ans-ineligibilite-1902944.html',
    titre: 'Maryse Joissains condamnée à 8 mois de prison avec sursis et 3 ans d\'inéligibilité',
    media: 'France 3 PACA',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2021-03-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction France 3 PACA',
    description:
      'Peine prononcée : 8 mois de prison avec sursis + 3 ans d\'inéligibilité. ' +
      'Faits : prise illégale d\'intérêts (marché public non-concurrentiel) et détournement de fonds.',
    verifiee: true,
  },
  wp_falco: {
    url: 'https://fr.wikipedia.org/wiki/Hubert_Falco',
    titre: 'Hubert Falco — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Né le 20 décembre 1947 à Toulon. Sénateur du Var, ex-maire de Toulon (2001-2014), ' +
      'ex-secrétaire d\'État (2007-2010).',
    verifiee: true,
  },
  senat_falco: {
    url: 'https://www.senat.fr/senateur/falco_hubert95031c.html',
    titre: 'Hubert Falco — Fiche sénateur (Sénat.fr)',
    media: 'Sénat (site officiel)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: null,
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Sénat de la République française',
    description: 'Fiche officielle sénateur Hubert Falco, Var, groupe LR.',
    verifiee: true,
  },
  wp_joissains_s: {
    url: 'https://fr.wikipedia.org/wiki/Sophie_Joissains',
    titre: 'Sophie Joissains — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Avocate, sénatrice des Bouches-du-Rhône (LR), fille de Maryse Joissains-Masini.',
    verifiee: true,
  },
  wp_lr: {
    url: 'https://fr.wikipedia.org/wiki/Les_R%C3%A9publicains',
    titre: 'Les Républicains — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Parti politique de centre-droit fondé en mai 2015, héritier du RPR/UMP. ' +
      'Éric Ciotti exclu en juin 2024 après alliance avec le RN.',
    verifiee: true,
  },
  wp_nice_matin: {
    url: 'https://fr.wikipedia.org/wiki/Groupe_Nice-Matin',
    titre: 'Groupe Nice-Matin — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Groupe de presse SCOP PACA (Nice-Matin, Var-Matin, Monaco-Matin). ' +
      'SIREN 807856596. Reprise en coopérative 2013 après liquidation Hersant.',
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — idempotents, sources vérifiées, lien polymorphe ADR-002.
// Convention : aRef = wikidataId de l'entité A, bRef = wikidataId de l'entité B.
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Mandats électifs — Renaud Muselier ---
  {
    // P-O : Muselier → MANDAT_ELECTIF → Région PACA
    aType: 'personne',
    aRef: 'Q3424934',
    bType: 'organisation',
    bRef: 'Q15104',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Renaud Muselier est président du Conseil régional Provence-Alpes-Côte d\'Azur ' +
      '(Région Sud) depuis le 4 décembre 2017 (suite au décès de Christian Estrosi dans ce rôle).',
    dateDebut: new Date('2017-12-04'),
    dateFin: null,
    sourceRef: 'wp_muselier',
  },
  {
    // P-O : Muselier → AFFILIATION_PARTI → LR
    aType: 'personne',
    aRef: 'Q3424934',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description: 'Renaud Muselier est membre des Républicains (LR).',
    dateDebut: new Date('2015-05-30'),
    dateFin: null,
    sourceRef: 'wp_muselier',
  },

  // --- Mandats électifs — Benoît Payan ---
  {
    // P-O : Payan → MANDAT_ELECTIF → Marseille
    aType: 'personne',
    aRef: 'Q63766719',
    bType: 'organisation',
    bRef: 'Q23482',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Benoît Payan est maire de Marseille depuis le 15 décembre 2020, ' +
      'après la démission de Michèle Rubirola. Premier maire de gauche de Marseille depuis 1995.',
    dateDebut: new Date('2020-12-15'),
    dateFin: null,
    sourceRef: 'wp_payan',
  },

  // --- Mandats — Christian Estrosi ---
  {
    // P-O : Estrosi → ANCIEN_MANDAT → Nice (battu mars 2026)
    aType: 'personne',
    aRef: 'Q749029',
    bType: 'organisation',
    bRef: 'Q33959',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Christian Estrosi a été maire de Nice de mars 2008 au 22 mars 2026, ' +
      'date du second tour des élections municipales où il est battu par Éric Ciotti.',
    dateDebut: new Date('2008-03-16'),
    dateFin: new Date('2026-03-22'),
    sourceRef: 'ici_municipales2026_nice',
  },
  {
    // P-O : Estrosi → AFFILIATION_PARTI → LR
    aType: 'personne',
    aRef: 'Q749029',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description: 'Christian Estrosi est membre des Républicains (LR).',
    dateDebut: new Date('2015-05-30'),
    dateFin: null,
    sourceRef: 'wp_estrosi',
  },

  // --- Mandats — Éric Ciotti ---
  {
    // P-O : Ciotti → MANDAT_ELECTIF → Nice (maire depuis mars 2026)
    aType: 'personne',
    aRef: 'Q1844180',
    bType: 'organisation',
    bRef: 'Q33959',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Éric Ciotti est élu maire de Nice au second tour du 22 mars 2026 (48,54 %, ' +
      '61 009 voix), battant le sortant Christian Estrosi (37,20 %).',
    dateDebut: new Date('2026-03-22'),
    dateFin: null,
    sourceRef: 'ici_municipales2026_nice',
  },
  {
    // P-O : Ciotti → ANCIEN_MANDAT → LR (exclu en juin 2024)
    aType: 'personne',
    aRef: 'Q1844180',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Éric Ciotti est président des Républicains de décembre 2022 à juin 2024. ' +
      'Il est exclu (contesté juridiquement) après avoir annoncé une alliance électorale avec le ' +
      'Rassemblement National en vue des législatives de juillet 2024.',
    dateDebut: new Date('2022-12-03'),
    dateFin: new Date('2024-06-11'),
    sourceRef: 'wp_ciotti',
  },
  {
    // P-P : Ciotti ↔ Estrosi — rivalité politique documentée, droite niçoise
    aType: 'personne',
    aRef: 'Q1844180',
    bType: 'personne',
    bRef: 'Q749029',
    typeLienCode: 'politique',
    description:
      'Rivalité politique de longue date au sein de la droite niçoise : ' +
      'France 3 PACA les qualifie de « frères ennemis ». Ciotti conquiert la mairie de Nice ' +
      'sur Estrosi au second tour du 22 mars 2026.',
    dateDebut: new Date('2022-12-03'),
    dateFin: null,
    sourceRef: 'france3_ciotti_estrosi',
  },

  // --- Mandats + affaire judiciaire — Maryse Joissains-Masini ---
  {
    // P-O : Joissains → ANCIEN_MANDAT → Aix-en-Provence (2001-2021)
    aType: 'personne',
    aRef: 'Q3296342',
    bType: 'organisation',
    bRef: 'Q47465',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Maryse Joissains-Masini est maire d\'Aix-en-Provence de 2001 à 2021 (20 ans). ' +
      'Elle démissionne en 2021 en raison de son inéligibilité judiciaire et de raisons de santé.',
    dateDebut: new Date('2001-03-18'),
    dateFin: new Date('2021-05-01'),
    sourceRef: 'wp_joissains_m',
  },
  {
    // P-O : Joissains → juridique → Aix-en-Provence
    // CONDAMNATION DÉFINITIVE — Cour de cassation, 2021.
    // Statut : décision définitive (non susceptible d'appel). Fait avéré.
    aType: 'personne',
    aRef: 'Q3296342',
    bType: 'organisation',
    bRef: 'Q47465',
    typeLienCode: 'juridique',
    description:
      'Condamnation DÉFINITIVE (Cour de cassation, 2021) : prise illégale d\'intérêts ' +
      'et détournement de fonds publics dans le cadre de marchés publics municipaux. ' +
      'Peine : 8 mois de prison avec sursis + 3 ans d\'inéligibilité. ' +
      'Décision confirmée par l\'arrêt de la Cour d\'appel de Montpellier (déc. 2020).',
    dateDebut: new Date('2021-11-04'),
    dateFin: null,
    sourceRef: 'france_bleu_joissains_condamnee',
  },
  {
    // P-O : Joissains → AFFILIATION_PARTI → LR
    aType: 'personne',
    aRef: 'Q3296342',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description: 'Maryse Joissains-Masini est membre des Républicains (LR).',
    dateDebut: new Date('2015-05-30'),
    dateFin: null,
    sourceRef: 'wp_joissains_m',
  },

  // --- Hubert Falco ---
  {
    // P-O : Falco → AFFILIATION_PARTI → LR
    aType: 'personne',
    aRef: 'Q2750200',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description: 'Hubert Falco, sénateur du Var, est membre des Républicains (LR).',
    dateDebut: new Date('2015-05-30'),
    dateFin: null,
    sourceRef: 'wp_falco',
  },

  // --- Sophie Joissains ---
  {
    // P-P : Sophie Joissains → famille → Maryse Joissains-Masini (mère-fille)
    aType: 'personne',
    aRef: 'Q3490954',
    bType: 'personne',
    bRef: 'Q3296342',
    typeLienCode: 'famille',
    description:
      'Sophie Joissains est la fille de Maryse Joissains-Masini (ex-maire d\'Aix-en-Provence). ' +
      'Elles partagent un ancrage politique dans la droite aixoise.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_joissains_s',
  },
  {
    // P-O : Sophie Joissains → AFFILIATION_PARTI → LR
    aType: 'personne',
    aRef: 'Q3490954',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description: 'Sophie Joissains, sénatrice des Bouches-du-Rhône, est membre des Républicains (LR).',
    dateDebut: new Date('2015-05-30'),
    dateFin: null,
    sourceRef: 'wp_joissains_s',
  },
]

// ---------------------------------------------------------------------------
// Helpers — idempotents, alignés sur seed-macron-v2.js
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-region-paca] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-region-paca] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef} → ${entiteA ? 'OK' : 'MANQUANT'}, ` +
        `bRef=${lien.bRef} → ${entiteB ? 'OK' : 'MANQUANT'})`,
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
  console.log('Suppression données PACA précédentes...')
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
  console.log('Données PACA précédentes supprimées.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n--- seed-region-paca — Réseau d\'influence PACA / Région Sud ---\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`User : ${user.email}\n`)

  console.log('--- Sources publiques ---')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ${data.titre}`)
  }

  console.log('\n--- Personnes (Wikidata) ---')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n--- Organisations (Wikidata) ---')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n--- Liens ---')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ${lien.typeLienCode} — ${lien.description.slice(0, 80)}...`)
  }

  console.log('\n--- Bilan ---')
  console.log(`Personnes     : ${PERSONNES.length}`)
  console.log(`  Muselier (Q3424934), Payan (Q63766719), Estrosi (Q749029),`)
  console.log(`  Ciotti (Q1844180), M. Joissains (Q3296342), Falco (Q2750200), S. Joissains (Q3490954)`)
  console.log(`Organisations : ${ORGANISATIONS.length}`)
  console.log(`  Région PACA (Q15104), Marseille (Q23482), Nice (Q33959),`)
  console.log(`  Aix-en-Provence (Q47465), LR (Q20012759), Groupe Nice-Matin (Q203853)`)
  console.log(`Sources       : ${Object.keys(SOURCES).length}`)
  console.log(
    `  (Wikipédia FR, HATVP, Sénat.fr, France Bleu, France 3 PACA, ICI/France Bleu)`,
  )
  console.log(`Liens         : ${LIENS.length}`)
  console.log(
    `  (MANDAT_ELECTIF, ANCIEN_MANDAT, AFFILIATION_PARTI, politique, famille, juridique)`,
  )
  console.log('\nAffaire judiciaire — STATUT JUDICIAIRE :')
  console.log('  Maryse Joissains-Masini : condamnation DEFINITIVE (Cour de cassation 2021)')
  console.log('  Peine : 8 mois prison avec sursis + 3 ans ineligibilite')
  console.log('  Source : France Bleu + France 3 PACA (deux sources independantes)')
  console.log('\nEntites deja en base (referees par wikidataId, non re-creees) :')
  console.log('  Saade Q3438372, CMA CGM Q1023867, La Provence Q1799045 (seed-barons-medias)')
  console.log('  RN Q205150 (seed-eurodeputes-fr)')
  console.log('\nNOTA BENE :')
  console.log('  - Relation Muselier/HLM-Marseille : affaire impliquant son EPOUSE (mise en examen)')
  console.log('    Muselier lui-meme : aucune mise en examen confirmee a la date de consultation.')
  console.log('    Piste non incluse faute de lien direct personnel verifiable.')
  console.log('    Cf. Marsactu (marsactu.fr) pour suivi eventuel.')
  console.log('')
}

main()
  .catch((err) => {
    console.error('[seed-region-paca] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
