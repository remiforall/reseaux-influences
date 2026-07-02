/**
 * Seed Occitanie — réseau d'influence régional.
 *
 * Périmètre :
 *   - Conseil régional d'Occitanie (institution + Carole Delga présidente, PS).
 *   - Maires des 3 principales villes : Toulouse (Moudenc, LR→La France audacieuse),
 *     Montpellier (Delafosse, PS), Perpignan (Aliot, RN).
 *   - Employeurs régionaux hors CAC40 : Laboratoires Pierre Fabre (Castres) + Fondation.
 *     Airbus déjà en base → référencé par Q67 (siège Toulouse-Blagnac).
 *   - Presse régionale : La Dépêche du Midi (Q742587), Midi Libre (Q1465340).
 *
 * Sources : Wikidata (Q-ids vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR, vie-publique.fr.
 *
 * Garde-fous :
 *   - EN_ATTENTE (ADR-006 / ADR-010) — jamais VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - Partis déjà en base : PS Q170972, RN Q205150, LR Q20012759 → référencés sans re-création
 *
 * Usage :
 *   cd backend && node bin/seed-region-occitanie.js
 *   cd backend && node bin/seed-region-occitanie.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — recoupées ≥ 2 sources publiques par entité.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q2939880 + Wikipédia FR + vie-publique.fr
    // Présidente du Conseil régional d'Occitanie depuis le 4 janvier 2016 (réélue le 2 juillet 2021).
    // Secrétaire d'État chargée du Commerce sous les gouvernements Valls II et III (2014-2016).
    // Affaire Beaucaire : condamnée pour discrimination (refus convention commune RN 2019,
    // confirmé Cour de cassation) → exonérée par la CEDH le 4 juillet 2024.
    // Soutien au projet A69 (autoroute Toulouse-Castres) malgré l'opposition environnementale.
    nom: 'Delga',
    prenom: 'Carole',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1971-08-19'),
    lieuNaissance: 'Muret (Haute-Garonne)',
    rolePrincipal: "Présidente du Conseil régional d'Occitanie",
    rolesSecondaires: [
      "ancienne secrétaire d'État chargée du Commerce, de l'Artisanat et de l'Économie sociale (2014-2016)",
      'ancienne députée de la Haute-Garonne (2012-2014)',
      'membre du Parti socialiste (depuis 2004)',
    ],
    bio:
      "Enseignante de formation, Carole Delga est élue députée PS de la Haute-Garonne en 2012, " +
      "puis secrétaire d'État sous Valls (2014-2016). Élue présidente du Conseil régional " +
      "d'Occitanie le 4 janvier 2016 et réélue le 2 juillet 2021. Favorable au projet autoroutier A69 " +
      "(Toulouse-Castres) malgré l'opposition environnementale. Condamnée en 2019 pour discrimination " +
      "envers la commune de Beaucaire (maire RN), exonérée par la CEDH le 4 juillet 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Carole_Delga',
    wikidataId: 'Q2939880',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3082845 + Wikipédia FR
    // Maire de Toulouse : 1er mandat 2004-2008 ; 2e 2014-2020 ; 3e 2020-2026 ; 4e depuis mars 2026.
    // Quitte LR en 2022 pour fonder La France audacieuse (mouvement local toulousain).
    nom: 'Moudenc',
    prenom: 'Jean-Luc',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1960-07-19'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Maire de Toulouse',
    rolesSecondaires: [
      'Président de Toulouse Métropole (depuis 2014)',
      "fondateur de La France audacieuse (depuis 2020)",
      "ancien membre de Les Républicains (2015-2022)",
    ],
    bio:
      "Diplômé de Sciences Po Paris, Jean-Luc Moudenc est maire de Toulouse depuis 2004 (interrompu " +
      "2008-2014). Réélu pour un 3e mandat le 3 juillet 2020, puis un 4e en mars 2026. " +
      "Président de Toulouse Métropole, il a quitté Les Républicains en 2022 pour fonder " +
      "La France audacieuse, mouvement local à droite.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Luc_Moudenc',
    wikidataId: 'Q3082845',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q48456980 + Wikipédia FR
    // Maire de Montpellier depuis le 4 juillet 2020 (succède à Philippe Saurel).
    // Réélu au 2e tour des municipales du 22 mars 2026 avec 50,13 % et 53/69 sièges.
    // Président de Montpellier Méditerranée Métropole depuis juillet 2020.
    nom: 'Delafosse',
    prenom: 'Michaël',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1977-04-13'),
    lieuNaissance: 'Montpellier (Hérault)',
    rolePrincipal: 'Maire de Montpellier',
    rolesSecondaires: [
      'Président de Montpellier Méditerranée Métropole (depuis juillet 2020)',
      'membre du Parti socialiste (depuis 1993)',
      "ancien adjoint à la culture (2008-2011) et à l'urbanisme (2011-2014) de Montpellier",
    ],
    bio:
      "Professeur agrégé d'histoire, Michaël Delafosse est élu maire de Montpellier le 4 juillet 2020 " +
      "sous étiquette socialiste, succédant à Philippe Saurel. Il préside également Montpellier " +
      "Méditerranée Métropole. Réélu au second tour des municipales du 22 mars 2026 avec 50,13 % " +
      "des voix et 53 sièges sur 69 au conseil municipal.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Micha%C3%ABl_Delafosse',
    wikidataId: 'Q48456980',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3261014 + Wikipédia FR
    // Maire de Perpignan depuis le 3 juillet 2020 (2e grande ville française à élire un maire RN).
    // Réélu dès le 1er tour des municipales de mars 2026 avec 50,6 %.
    // Président de Perpignan Méditerranée Métropole depuis le 18 avril 2026.
    // Ex-compagnon de Marine Le Pen (séparation annoncée en août 2019).
    nom: 'Aliot',
    prenom: 'Louis',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1969-09-04'),
    lieuNaissance: 'Toulouse (Haute-Garonne)',
    rolePrincipal: 'Maire de Perpignan',
    rolesSecondaires: [
      'Président de Perpignan Méditerranée Métropole (depuis avril 2026)',
      'membre du Rassemblement National (ex-Front National, depuis 1990)',
      'avocat au barreau de Perpignan',
      "ancien vice-président du RN/FN",
    ],
    bio:
      "Avocat de formation, Louis Aliot est membre du Front National depuis 1990 (renommé Rassemblement " +
      "National en 2018). Élu maire de Perpignan le 3 juillet 2020, devenant le deuxième maire RN d'une " +
      "ville de plus de 100 000 habitants après Jean-Marie Le Chevallier (Toulon, 1995-2001). " +
      "Réélu dès le premier tour en mars 2026 (50,6 %). Élu président de Perpignan Méditerranée " +
      "Métropole le 18 avril 2026.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Louis_Aliot',
    wikidataId: 'Q3261014',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q18678265 + Wikipédia FR
    // Région administrative créée le 1er janvier 2016 par fusion Languedoc-Roussillon + Midi-Pyrénées.
    // Renommée « Occitanie » le 30 septembre 2016 (initialement LR-Midi-Pyrénées).
    nom: 'Région Occitanie',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.laregion.fr',
    description:
      "Région administrative française issue de la fusion des régions Languedoc-Roussillon et " +
      "Midi-Pyrénées au 1er janvier 2016, renommée « Occitanie » le 30 septembre 2016. " +
      "13 départements, 5,9 millions d'habitants (2021). Capitale régionale : Toulouse ; " +
      "préfecture administrative : Montpellier. Présidée par Carole Delga (PS) depuis 2016.",
    dateCreation: new Date('2016-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Occitanie_(r%C3%A9gion_administrative)',
    wikidataId: 'Q18678265',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q7880 + Wikipédia FR
    nom: 'Commune de Toulouse',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.toulouse.fr',
    description:
      "Chef-lieu de la Haute-Garonne et capitale régionale de l'Occitanie. Quatrième ville de France " +
      "par la population (~800 000 hab. dans la ville, >1,4 M dans l'aire urbaine). " +
      "Hub aérospatial européen (Airbus, CNES, Thales Alenia Space). " +
      "Maire : Jean-Luc Moudenc (La France audacieuse, depuis 2014).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Toulouse',
    wikidataId: 'Q7880',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q6441 + Wikipédia FR
    nom: 'Commune de Montpellier',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.montpellier.fr',
    description:
      "Préfecture de l'Hérault et siège administratif de la région Occitanie. " +
      "Septième ville de France par la population (~300 000 hab.). " +
      "Pôle universitaire et médical majeur, métropole en forte croissance démographique. " +
      "Maire : Michaël Delafosse (PS, depuis 2020).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Montpellier',
    wikidataId: 'Q6441',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q6730 + Wikipédia FR
    nom: 'Commune de Perpignan',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.perpignan.fr',
    description:
      "Préfecture des Pyrénées-Orientales, à la frontière catalane espagnole. " +
      "Environ 123 000 habitants. Connue pour son histoire catalane et le Palais des rois de Majorque. " +
      "Deuxième grande ville française à avoir élu un maire RN (Louis Aliot, depuis 2020).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Perpignan',
    wikidataId: 'Q6730',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q626597 + Wikipédia FR
    // Deuxième laboratoire pharmaceutique privé français. Siège : Castres (Tarn), Occitanie.
    // CA 3 Mrd€ (2025), ~9 650 salariés. DG : Éric Ducournau (depuis le 2 juillet 2018).
    // 86 % du capital détenu par la Fondation Pierre Fabre (Q55596932).
    nom: 'Laboratoires Pierre Fabre',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.pierre-fabre.com',
    description:
      "Groupe pharmaceutique et de dermocosmétique fondé le 23 mai 1962 par Pierre Fabre à Castres " +
      "(Tarn). Deuxième laboratoire privé français en dermatologie. CA ~3 Mrd€ (2025), " +
      "~9 650 salariés, présence dans 116 pays (71 % CA international). " +
      "DG : Éric Ducournau (depuis juillet 2018). 86 % du capital détenu par la Fondation Pierre Fabre.",
    dateCreation: new Date('1962-05-23'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Laboratoires_Pierre_Fabre',
    wikidataId: 'Q626597',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q55596932 + Wikipédia FR (article Laboratoires Pierre Fabre)
    // Fondation reconnue d'utilité publique. Pierre Fabre lui a fait don de 86 % des actions en 2008.
    nom: 'Fondation Pierre Fabre',
    sigle: null,
    typeOrganisation: 'FONDATION',
    pays: 'France',
    siteWeb: 'https://www.fondation-pierrefabre.com',
    description:
      "Fondation reconnue d'utilité publique, principale actionnaire des Laboratoires Pierre Fabre " +
      "(86 % du capital depuis la donation de 2008). Missions : accès aux soins dans les pays " +
      "en développement, lutte contre les maladies tropicales négligées.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Laboratoires_Pierre_Fabre',
    wikidataId: 'Q55596932',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q742587 + Wikipédia FR
    // Quotidien régional fondé en 1870, basé à Toulouse. Premier quotidien zone Atlantique-Pyrénées.
    nom: 'La Dépêche du Midi',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.ladepeche.fr',
    description:
      "Quotidien régional fondé en 1870, basé à Toulouse. Premier titre de presse régionale de la " +
      "zone Atlantique-Pyrénées. Couvre principalement l'Occitanie (Haute-Garonne, Ariège, Aveyron, " +
      "Lot, Lot-et-Garonne, Tarn, Tarn-et-Garonne). PDG historique : famille Baylet (Jean-Michel Baylet).",
    dateCreation: new Date('1870-09-02'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/La_D%C3%A9p%C3%AAche_du_Midi',
    wikidataId: 'Q742587',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1465340 + Wikipédia FR
    // Fondé en 1944, basé à Montpellier. Intégré au Groupe La Dépêche en 2012.
    nom: 'Midi Libre',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.midilibre.fr',
    description:
      "Quotidien régional fondé en 1944, basé à Montpellier. Couvre le Gard, l'Hérault, la Lozère, " +
      "l'Aude et les Pyrénées-Orientales (moitié orientale de l'Occitanie). " +
      "Appartient au Groupe La Dépêche du Midi depuis son acquisition en 2012.",
    dateCreation: new Date('1944-09-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Midi_libre',
    wikidataId: 'Q1465340',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_delga: {
    url: 'https://fr.wikipedia.org/wiki/Carole_Delga',
    titre: 'Carole Delga — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Biographie : PS, secrétaire d'État 2014-2016, présidente Occitanie depuis le 4 janv. 2016. " +
      "Affaire Beaucaire : condamnée 2019, exonérée CEDH le 4 juillet 2024.",
    verifiee: true,
  },
  vp_delga: {
    url: 'https://www.vie-publique.fr/fiche-personnalite/carole-delga',
    titre: 'Carole Delga — Fiche personnalité (vie-publique.fr)',
    media: 'vie-publique.fr',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2021-07-02'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'DILA',
    description:
      "Fiche officielle DILA : présidente du Conseil régional d'Occitanie depuis le 4 janvier 2016, réélue le 2 juillet 2021.",
    verifiee: true,
  },
  wp_moudenc: {
    url: 'https://fr.wikipedia.org/wiki/Jean-Luc_Moudenc',
    titre: 'Jean-Luc Moudenc — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "4 mandats maire de Toulouse (2004-2008, 2014-présent). Quitte LR en 2022 pour La France audacieuse.",
    verifiee: true,
  },
  wp_delafosse: {
    url: 'https://fr.wikipedia.org/wiki/Micha%C3%ABl_Delafosse',
    titre: 'Michaël Delafosse — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Maire de Montpellier (PS) depuis le 4 juillet 2020, réélu le 22 mars 2026 (50,13 % au 2e tour).",
    verifiee: true,
  },
  wp_aliot: {
    url: 'https://fr.wikipedia.org/wiki/Louis_Aliot',
    titre: 'Louis Aliot — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Maire de Perpignan (RN) depuis le 3 juillet 2020, réélu au 1er tour mars 2026 (50,6 %).",
    verifiee: true,
  },
  wp_occitanie: {
    url: 'https://fr.wikipedia.org/wiki/Occitanie_(r%C3%A9gion_administrative)',
    titre: 'Occitanie (région administrative) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Fusion LR + Midi-Pyrénées le 1er janv. 2016, renommée Occitanie le 30 sept. 2016 ; 13 dép., 5,9 M hab.",
    verifiee: true,
  },
  wp_toulouse: {
    url: 'https://fr.wikipedia.org/wiki/Toulouse',
    titre: 'Toulouse — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Chef-lieu Haute-Garonne, 4e ville FR, hub aérospatial (Airbus, CNES, Thales Alenia Space).",
    verifiee: true,
  },
  wp_montpellier: {
    url: 'https://fr.wikipedia.org/wiki/Montpellier',
    titre: 'Montpellier — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Préfecture Hérault, siège administratif de la région Occitanie, 7e ville de France.",
    verifiee: true,
  },
  wp_perpignan: {
    url: 'https://fr.wikipedia.org/wiki/Perpignan',
    titre: 'Perpignan — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Préfecture des Pyrénées-Orientales, ~123 000 hab., 2e grande ville française à élire un maire RN.",
    verifiee: true,
  },
  wp_pierre_fabre: {
    url: 'https://fr.wikipedia.org/wiki/Laboratoires_Pierre_Fabre',
    titre: 'Laboratoires Pierre Fabre — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Groupe pharma/dermocosmétique Castres, CA 3 Mrd€ (2025), 86 % Fondation Pierre Fabre, DG Éric Ducournau.",
    verifiee: true,
  },
  wp_depeche: {
    url: 'https://fr.wikipedia.org/wiki/La_D%C3%A9p%C3%AAche_du_Midi',
    titre: 'La Dépêche du Midi — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Quotidien régional fondé en 1870 à Toulouse, 1er titre zone Atlantique-Pyrénées, famille Baylet.",
    verifiee: true,
  },
  wp_midi_libre: {
    url: 'https://fr.wikipedia.org/wiki/Midi_libre',
    titre: 'Midi Libre — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Quotidien régional Montpellier fondé en 1944, couvre l'est de l'Occitanie, Groupe Dépêche depuis 2012.",
    verifiee: true,
  },
  wp_airbus: {
    url: 'https://fr.wikipedia.org/wiki/Airbus',
    titre: 'Airbus — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Siège social et principal site industriel d'Airbus à Toulouse (Blagnac) — 1er employeur du bassin toulousain.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002), exactement 1 entité non-nulle de chaque côté.
// Partis en base : PS Q170972, RN Q205150, LR Q20012759 (seeded avant ce fichier).
// Airbus en base : Q67 (seeded via CAC40/autres seeds).
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Conseil régional d'Occitanie ---
  {
    // P-O : Delga présidente de la Région Occitanie
    aType: 'personne',
    aRef: 'Q2939880',
    bType: 'organisation',
    bRef: 'Q18678265',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Carole Delga est présidente du Conseil régional d'Occitanie depuis le 4 janvier 2016 " +
      "(réélue le 2 juillet 2021 avec 57,44 % des voix au second tour).",
    dateDebut: new Date('2016-01-04'),
    dateFin: null,
    sourceRef: 'vp_delga',
  },
  {
    // P-O : Delga affiliée au PS
    aType: 'personne',
    aRef: 'Q2939880',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description: 'Carole Delga est membre du Parti socialiste depuis 2004.',
    dateDebut: new Date('2004-01-01'),
    dateFin: null,
    sourceRef: 'wp_delga',
  },

  // --- Mairie de Toulouse ---
  {
    // P-O : Moudenc maire de Toulouse (3e et 4e mandats)
    aType: 'personne',
    aRef: 'Q3082845',
    bType: 'organisation',
    bRef: 'Q7880',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Jean-Luc Moudenc est maire de Toulouse depuis le 3 juillet 2020 (3e mandat), " +
      "réélu en mars 2026 (4e mandat). Président de Toulouse Métropole depuis 2014.",
    dateDebut: new Date('2020-07-03'),
    dateFin: null,
    sourceRef: 'wp_moudenc',
  },
  {
    // P-O : Moudenc ex-LR (lien daté, parti quitté en 2022)
    aType: 'personne',
    aRef: 'Q3082845',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Jean-Luc Moudenc était membre de Les Républicains de 2015 à 2022, avant de fonder La France audacieuse.",
    dateDebut: new Date('2015-01-01'),
    dateFin: new Date('2022-12-31'),
    sourceRef: 'wp_moudenc',
  },

  // --- Mairie de Montpellier ---
  {
    // P-O : Delafosse maire de Montpellier
    aType: 'personne',
    aRef: 'Q48456980',
    bType: 'organisation',
    bRef: 'Q6441',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Michaël Delafosse est maire de Montpellier depuis le 4 juillet 2020 " +
      "(réélu le 22 mars 2026 avec 50,13 % au second tour).",
    dateDebut: new Date('2020-07-04'),
    dateFin: null,
    sourceRef: 'wp_delafosse',
  },
  {
    // P-O : Delafosse affilié au PS
    aType: 'personne',
    aRef: 'Q48456980',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description: 'Michaël Delafosse est membre du Parti socialiste depuis 1993.',
    dateDebut: new Date('1993-01-01'),
    dateFin: null,
    sourceRef: 'wp_delafosse',
  },

  // --- Mairie de Perpignan ---
  {
    // P-O : Aliot maire de Perpignan
    aType: 'personne',
    aRef: 'Q3261014',
    bType: 'organisation',
    bRef: 'Q6730',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Louis Aliot est maire de Perpignan depuis le 3 juillet 2020. " +
      "Réélu dès le 1er tour des municipales de mars 2026 avec 50,6 % des suffrages.",
    dateDebut: new Date('2020-07-03'),
    dateFin: null,
    sourceRef: 'wp_aliot',
  },
  {
    // P-O : Aliot affilié au RN
    aType: 'personne',
    aRef: 'Q3261014',
    bType: 'organisation',
    bRef: 'Q205150',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Louis Aliot est membre du Rassemblement National (ex-Front National) depuis 1990, " +
      "dont il a été vice-président.",
    dateDebut: new Date('1990-01-01'),
    dateFin: null,
    sourceRef: 'wp_aliot',
  },

  // --- Ancrage territorial Airbus → Toulouse (Airbus Q67 déjà en base) ---
  {
    // O-O : Airbus HQ et principal site industriel à Toulouse-Blagnac
    // (Airbus SE Q2311 déjà en base ; Q67 = Airbus Commercial Aircraft, distinct)
    aType: 'organisation',
    aRef: 'Q2311',
    bType: 'organisation',
    bRef: 'Q7880',
    typeLienCode: 'economique',
    description:
      "Airbus a son siège social et son principal site industriel à Toulouse (Blagnac, Haute-Garonne). " +
      "Premier employeur du bassin toulousain avec ~40 000 salariés directs en Occitanie.",
    dateDebut: new Date('1970-12-18'),
    dateFin: null,
    sourceRef: 'wp_airbus',
  },

  // --- Groupe Pierre Fabre en Occitanie ---
  {
    // O-O : Fondation → détention du capital de Laboratoires PF
    aType: 'organisation',
    aRef: 'Q55596932',
    bType: 'organisation',
    bRef: 'Q626597',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "La Fondation Pierre Fabre détient 86 % du capital des Laboratoires Pierre Fabre " +
      "depuis la donation réalisée par le fondateur Pierre Fabre en 2008.",
    dateDebut: new Date('2008-01-01'),
    dateFin: null,
    sourceRef: 'wp_pierre_fabre',
  },
  {
    // O-O : Laboratoires PF → ancrage économique en Occitanie
    aType: 'organisation',
    aRef: 'Q626597',
    bType: 'organisation',
    bRef: 'Q18678265',
    typeLienCode: 'economique',
    description:
      "Les Laboratoires Pierre Fabre ont leur siège à Castres (Tarn, Occitanie) et constituent " +
      "le premier employeur privé du Tarn, avec le Campus Chartreuse inauguré en 2025.",
    dateDebut: new Date('1962-05-23'),
    dateFin: null,
    sourceRef: 'wp_pierre_fabre',
  },

  // --- Médias régionaux ---
  {
    // O-O : La Dépêche du Midi couvre l'Occitanie
    aType: 'organisation',
    aRef: 'Q742587',
    bType: 'organisation',
    bRef: 'Q18678265',
    typeLienCode: 'mediatique',
    description:
      "La Dépêche du Midi, fondée en 1870 à Toulouse, est le quotidien régional de référence " +
      "pour l'ensemble de la zone Atlantique-Pyrénées d'Occitanie.",
    dateDebut: new Date('1870-09-02'),
    dateFin: null,
    sourceRef: 'wp_depeche',
  },
  {
    // O-O : Midi Libre couvre l'est de l'Occitanie
    aType: 'organisation',
    aRef: 'Q1465340',
    bType: 'organisation',
    bRef: 'Q18678265',
    typeLienCode: 'mediatique',
    description:
      "Midi Libre est le quotidien de référence de l'est de l'Occitanie (Hérault, Gard, Lozère, Aude, " +
      "Pyrénées-Orientales), basé à Montpellier depuis 1944.",
    dateDebut: new Date('1944-09-01'),
    dateFin: null,
    sourceRef: 'wp_midi_libre',
  },
  {
    // O-O : La Dépêche a acquis Midi Libre (groupe de presse)
    aType: 'organisation',
    aRef: 'Q742587',
    bType: 'organisation',
    bRef: 'Q1465340',
    typeLienCode: 'economique',
    description:
      "Midi Libre a été intégré au Groupe La Dépêche du Midi en 2012, formant le principal pôle " +
      "de presse régionale en Occitanie.",
    dateDebut: new Date('2012-01-01'),
    dateFin: null,
    sourceRef: 'wp_midi_libre',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-occitanie] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-occitanie] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('  Suppression donnees Occitanie precedentes...')
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
  console.log('  Donnees precedentes supprimees.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n+- seed-region-occitanie -- reseau d\'influence Occitanie -+\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`  User : ${user.email}\n`)

  console.log('-- Sources publiques --')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  + ${data.titre}`)
  }

  console.log('\n-- Personnes (Wikidata verifie) --')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  + ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n-- Organisations (Wikidata verifie) --')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  + ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n-- Liens --')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  + ${lien.typeLienCode} -- ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n+- Bilan ---------------------------------------------------+')
  console.log(`|  Personnes     : ${PERSONNES.length} (Delga, Moudenc, Delafosse, Aliot)`)
  console.log(`|  Organisations : ${ORGANISATIONS.length} (Region, 3 communes, PF x2, 2 medias)`)
  console.log(`|  Sources       : ${Object.keys(SOURCES).length} (Wikipedia FR, vie-publique.fr)`)
  console.log(`|  Liens         : ${LIENS.length} (MANDAT_ELECTIF, AFFILIATION_PARTI, economique,`)
  console.log('|                          mediatique, DETENTION_CAPITAL)')
  console.log('+-----------------------------------------------------------+\n')
}

main()
  .catch((err) => {
    console.error('[seed-occitanie] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
