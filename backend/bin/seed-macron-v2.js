/**
 * Seed Macron / Renaissance — enquête OSINT INDÉPENDANTE du 2026-06-26 (corpus v2-bis).
 *
 * Seconde opinion produite à partir des sources publiques, recoupée ≥ 2 sources par entité,
 * destinée à être confrontée au corpus v1 (n'en garder que le meilleur).
 *
 * Périmètre : Emmanuel + Brigitte Macron, Sébastien Lecornu (Premier ministre), Renaissance,
 *             la coalition Ensemble pour la République, et 9 ministres clés du gouvernement
 *             Lecornu II (formé le 12 oct. 2025, remanié le 26 fév. 2026).
 *
 * Sources : Wikidata (Q-id tous vérifiés via l'API wbsearchentities + Special:EntityData),
 *           Wikipédia FR, vie-publique.fr, info.gouv.fr, JORF/Légifrance, France Info, France Diplomatie.
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-macron-v2.js
 *   cd backend && node bin/seed-macron-v2.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — chaque fiche recoupée par ≥ 2 sources publiques (cf. commentaires).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q3052772 + Wikipédia FR + Élysée (fiche officielle)
    nom: 'Macron',
    prenom: 'Emmanuel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1977-12-21'),
    lieuNaissance: 'Amiens (Somme)',
    rolePrincipal: 'Président de la République française',
    rolesSecondaires: [
      "fondateur d'En Marche (2016)",
      "ancien ministre de l'Économie (2014-2016)",
      'ancien associé-gérant de la banque Rothschild & Cie',
    ],
    bio:
      "Ancien élève de l'ENA et de Sciences Po, inspecteur des finances puis banquier d'affaires, " +
      "Emmanuel Macron a été ministre de l'Économie (2014-2016) avant de fonder En Marche en avril 2016. " +
      "Élu président de la République le 7 mai 2017, plus jeune chef d'État de la Ve République, il est réélu le 24 avril 2022.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Emmanuel_Macron',
    wikidataId: 'Q3052772',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q21511883 + Wikipédia FR
    nom: 'Macron',
    prenom: 'Brigitte',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1953-04-13'),
    lieuNaissance: 'Amiens (Somme)',
    rolePrincipal: 'Première dame de France',
    rolesSecondaires: ['ancienne professeure de lettres et de latin'],
    bio:
      'Née Trogneux dans une famille de chocolatiers amiénois, Brigitte Macron a été professeure de français ' +
      'et de latin. Mariée à Emmanuel Macron le 20 octobre 2007 au Touquet, elle est Première dame depuis le 14 mai 2017.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Brigitte_Macron',
    wikidataId: 'Q21511883',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q20089181 + Wikipédia FR + JORF (décret 9 sept. 2025) + vie-publique.fr
    nom: 'Lecornu',
    prenom: 'Sébastien',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1986-06-11'),
    lieuNaissance: 'Éaubonne (Val-d’Oise)',
    rolePrincipal: 'Premier ministre de la France',
    rolesSecondaires: [
      'ancien ministre des Armées (2022-2025)',
      'ancien ministre des Outre-mer (2020-2022)',
      "ancien président du conseil départemental de l'Eure",
      'membre de Renaissance',
    ],
    bio:
      "Issu de la droite gaulliste, président du département de l'Eure à 28 ans, Sébastien Lecornu rallie " +
      'Emmanuel Macron en 2017 et occupe plusieurs portefeuilles (Collectivités, Outre-mer, Armées). ' +
      'Nommé Premier ministre le 9 septembre 2025, il forme le gouvernement Lecornu II le 12 octobre 2025, remanié le 26 février 2026.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/S%C3%A9bastien_Lecornu',
    wikidataId: 'Q20089181',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30339350 + Wikipédia FR + France Info / Europe 1 (élection SG Renaissance)
    nom: 'Attal',
    prenom: 'Gabriel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1989-03-16'),
    lieuNaissance: 'Clamart (Hauts-de-Seine)',
    rolePrincipal: 'Secrétaire général de Renaissance',
    rolesSecondaires: [
      "président du groupe Ensemble pour la République à l'Assemblée nationale",
      'ancien Premier ministre (janvier-septembre 2024)',
      "ancien ministre de l'Éducation nationale (2023-2024)",
      'ancien porte-parole du gouvernement (2020-2022)',
    ],
    bio:
      'Plus jeune Premier ministre de la Ve République (janvier-septembre 2024), Gabriel Attal préside le groupe ' +
      "Ensemble pour la République à l'Assemblée nationale depuis juillet 2024. Il est élu secrétaire général de " +
      'Renaissance le 8 décembre 2024 avec 94,9 % des voix, devenant le chef opérationnel du camp présidentiel.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Gabriel_Attal',
    wikidataId: 'Q30339350',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30339198 + Wikipédia FR + France Diplomatie (fiche officielle)
    nom: 'Barrot',
    prenom: 'Jean-Noël',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1983-05-13'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Ministre de l'Europe et des Affaires étrangères",
    rolesSecondaires: [
      'ancien ministre délégué à la Transition numérique (2022-2024)',
      'ancien secrétaire général du MoDem',
      'professeur associé au MIT Sloan',
    ],
    bio:
      'Économiste formé à HEC et Sciences Po, docteur en économie, Jean-Noël Barrot a enseigné à la Sloan School ' +
      "of Management du MIT. Élu député des Yvelines en 2017 sous étiquette MoDem, il est ministre de l'Europe et " +
      'des Affaires étrangères depuis le 21 septembre 2024, portefeuille conservé dans le gouvernement Lecornu II.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-No%C3%ABl_Barrot',
    wikidataId: 'Q30339198',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30130489 + Wikipédia FR + composition gouvernement Lecornu II
    nom: 'Lescure',
    prenom: 'Roland',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-11-26'),
    lieuNaissance: 'Paris',
    rolePrincipal:
      "Ministre de l'Économie, des Finances et de la Souveraineté industrielle, énergétique et numérique",
    rolesSecondaires: [
      'ancien premier vice-président de la Caisse de dépôt et placement du Québec',
      "ancien président de la Commission des affaires économiques de l'Assemblée nationale",
      'ancien député des Français établis hors de France (Canada/USA)',
    ],
    bio:
      'Roland Lescure a dirigé la gestion des actifs de la Caisse de dépôt du Québec avant de rallier Emmanuel Macron ' +
      "en 2017. Élu député des Français de l'étranger, il préside la Commission des affaires économiques puis devient " +
      "ministre de l'Économie et des Finances le 12 octobre 2025 dans le gouvernement Lecornu II.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Roland_Lescure',
    wikidataId: 'Q30130489',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3123610 + Wikipédia FR + composition gouvernement Lecornu II
    nom: 'Darmanin',
    prenom: 'Gérald',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1982-10-11'),
    lieuNaissance: 'Valenciennes (Nord)',
    rolePrincipal: 'Garde des Sceaux, ministre de la Justice',
    rolesSecondaires: [
      "ancien ministre de l'Intérieur (2020-2024)",
      'ancien ministre des Comptes publics (2017-2020)',
      'ancien maire de Tourcoing',
    ],
    bio:
      "Longtemps figure de l'aile droite du macronisme, Gérald Darmanin a été ministre de l'Intérieur pendant quatre ans. " +
      'Nommé Garde des Sceaux le 23 décembre 2024, il conserve la Justice dans le gouvernement Lecornu II.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/G%C3%A9rald_Darmanin',
    wikidataId: 'Q3123610',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30729111 + Wikipédia FR + composition gouvernement Lecornu II
    nom: 'Nuñez',
    prenom: 'Laurent',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1964-02-19'),
    lieuNaissance: 'Bourges (Cher)',
    rolePrincipal: "Ministre de l'Intérieur",
    rolesSecondaires: [
      'ancien préfet de police de Paris (2022-2025)',
      'ancien coordonnateur national du renseignement (2020-2022)',
      'ancien directeur général de la sécurité intérieure (DGSI, 2017-2018)',
    ],
    bio:
      'Haut fonctionnaire du corps préfectoral, Laurent Nuñez a dirigé la DGSI puis la préfecture de police de Paris. ' +
      "Technicien du renseignement et de la sécurité, il est nommé ministre de l'Intérieur le 12 octobre 2025.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Laurent_Nu%C3%B1ez',
    wikidataId: 'Q30729111',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q29570183 + Wikipédia FR + composition gouvernement Lecornu II
    nom: 'Bergé',
    prenom: 'Aurore',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1986-11-13'),
    lieuNaissance: 'Paris',
    rolePrincipal:
      "Ministre déléguée chargée de l'Égalité entre les femmes et les hommes et de la Lutte contre les discriminations",
    rolesSecondaires: [
      "ancienne présidente du groupe Renaissance à l'Assemblée nationale (2022-2023)",
      'ancienne ministre des Solidarités et des Familles (2023)',
    ],
    bio:
      'Issue des Républicains avant de rejoindre Emmanuel Macron en 2017, Aurore Bergé préside le groupe Renaissance ' +
      "à l'Assemblée nationale de 2022 à 2023. Elle est chargée de l'Égalité femmes-hommes dans le gouvernement Lecornu II.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Aurore_Berg%C3%A9',
    wikidataId: 'Q29570183',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30339281 + Wikipédia FR + composition gouvernement Lecornu II
    nom: 'Rist',
    prenom: 'Stéphanie',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1973-08-06'),
    lieuNaissance: 'Athis-Mons (Essonne)',
    rolePrincipal:
      'Ministre de la Santé, des Familles, de l’Autonomie et des Personnes handicapées',
    rolesSecondaires: [
      'ancienne rapporteure générale du budget de la Sécurité sociale',
      "rhumatologue hospitalière (CHU d'Orléans)",
    ],
    bio:
      "Médecin rhumatologue de formation, élue députée du Loiret en 2017, Stéphanie Rist s'est spécialisée dans les " +
      'textes de santé comme rapporteure du PLFSS. Elle est nommée ministre de la Santé le 12 octobre 2025.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/St%C3%A9phanie_Rist',
    wikidataId: 'Q30339281',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q112572505 (homme politique français, 2 fonctions P39) + Wikipédia FR + composition Lecornu II
    // NB : NE PAS confondre avec Q87096932 (« chercheur irakien », homonyme distinct).
    nom: 'Haddad',
    prenom: 'Benjamin',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1985-10-23'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Ministre délégué chargé de l'Europe",
    rolesSecondaires: [
      "ancien chercheur à l'Atlantic Council (Washington)",
      'ancien député de Paris (2022-2024)',
    ],
    bio:
      "Spécialiste des relations transatlantiques, Benjamin Haddad a été chercheur au centre Europe de l'Atlantic " +
      "Council à Washington avant son élection comme député de Paris en 2022. Il est ministre délégué à l'Europe " +
      "depuis 2024, sous l'autorité du ministre Jean-Noël Barrot au Quai d'Orsay.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Benjamin_Haddad',
    wikidataId: 'Q112572505',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q47502155 + Wikipédia FR + France Info (portrait à la nomination, 22 fév. 2026) + JORF
    nom: 'Amiel',
    prenom: 'David',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1992-11-28'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Ministre de l'Action et des Comptes publics",
    rolesSecondaires: [
      "ancien conseiller à l'Élysée (2017-2019)",
      'ancien député de Paris (2022-2025)',
      'essayiste (Le progrès ne tombe pas du ciel, 2019)',
    ],
    bio:
      'Normalien (ENS Ulm) et diplômé de Princeton, David Amiel est un macroniste de la première heure, conseiller ' +
      'présidentiel dès 2017. Élu député de Paris en 2022, il entre au gouvernement Lecornu II puis devient ministre ' +
      "de l'Action et des Comptes publics lors du remaniement du 22 février 2026.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/David_Amiel',
    wikidataId: 'Q47502155',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q104032664 + Wikipédia FR + JORF (décret remaniement 26 fév. 2026)
    nom: 'Bregeon',
    prenom: 'Maud',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1991-02-11'),
    lieuNaissance: 'Poitiers (Vienne)',
    rolePrincipal: "Porte-parole du gouvernement, ministre déléguée chargée de l'Énergie",
    rolesSecondaires: [
      'ancienne ingénieure EDF (division nucléaire)',
      'ancienne députée des Hauts-de-Seine (2022-2025)',
    ],
    bio:
      "Ingénieure de formation, Maud Bregeon a travaillé huit ans à EDF sur la gestion du parc nucléaire avant d'être " +
      'élue députée des Hauts-de-Seine en 2022. Porte-parole du gouvernement depuis octobre 2025, elle se voit confier ' +
      "en plus le portefeuille de l'Énergie lors du remaniement du 26 février 2026.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Maud_Bregeon',
    wikidataId: 'Q104032664',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q23731823 + Wikipédia FR (historique du parti)
    nom: 'Renaissance',
    sigle: 'RE',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://parti-renaissance.fr',
    description:
      'Parti politique français fondé le 6 avril 2016 sous le nom « En Marche » par Emmanuel Macron, ' +
      'renommé « La République en marche » (LREM) en mai 2017, puis « Renaissance » (RE) le 17 septembre 2022. ' +
      'Force pivot de la majorité présidentielle ; Gabriel Attal en est le secrétaire général depuis décembre 2024.',
    dateCreation: new Date('2016-04-06'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Renaissance_(parti)',
    wikidataId: 'Q23731823',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q109929254 (coalition politique française) + Wikipédia FR
    nom: 'Ensemble pour la République',
    sigle: 'EPR',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.assemblee-nationale.fr/dyn/org/PO845407',
    description:
      'Coalition de la majorité présidentielle, fondée en 2021 sous le nom « Ensemble citoyens ! » pour les ' +
      'législatives de 2022, rebaptisée « Ensemble pour la République » pour celles de 2024. Regroupe Renaissance, ' +
      "le MoDem, Horizons et d'autres formations centristes. Son groupe à l'Assemblée nationale est présidé par Gabriel Attal.",
    dateCreation: new Date('2021-11-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Ensemble_pour_la_R%C3%A9publique_(France)',
    wikidataId: 'Q109929254',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-06-26).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_macron: {
    url: 'https://fr.wikipedia.org/wiki/Emmanuel_Macron',
    titre: 'Emmanuel Macron — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      "Biographie : ENA, Rothschild, ministre de l'Économie 2014-2016, fondateur d'En Marche, président depuis 2017.",
    verifiee: true,
  },
  wp_brigitte: {
    url: 'https://fr.wikipedia.org/wiki/Brigitte_Macron',
    titre: 'Brigitte Macron — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      'Née Trogneux, professeure de lettres, mariage avec Emmanuel Macron le 20 octobre 2007 au Touquet.',
    verifiee: true,
  },
  wp_lecornu: {
    url: 'https://fr.wikipedia.org/wiki/S%C3%A9bastien_Lecornu',
    titre: 'Sébastien Lecornu — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      'Parcours : Eure, ministre des Armées 2022-2025, rallié à Macron en 2017, Premier ministre depuis sept. 2025.',
    verifiee: true,
  },
  jorf_lecornu: {
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052221932',
    titre: 'Décret du 9 septembre 2025 portant nomination du Premier ministre',
    media: 'Légifrance (JORF)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-09-09'),
    dateConsultation: new Date('2026-06-26'),
    auteur: 'Présidence de la République',
    description: 'Décret officiel de nomination de Sébastien Lecornu comme Premier ministre.',
    verifiee: true,
  },
  vie_publique_lecornu: {
    url: 'https://www.vie-publique.fr/en-bref/300089-sebastien-lecornu-nomme-premier-ministre',
    titre: 'Sébastien Lecornu nommé Premier ministre',
    media: 'vie-publique.fr',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-09-09'),
    dateConsultation: new Date('2026-06-26'),
    auteur: 'DILA',
    description:
      'Note officielle sur la nomination de Sébastien Lecornu (Renaissance) comme Premier ministre.',
    verifiee: true,
  },
  wp_renaissance: {
    url: 'https://fr.wikipedia.org/wiki/Renaissance_(parti)',
    titre: 'Renaissance (parti) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      'Histoire du parti En Marche (2016) → LREM (2017) → Renaissance (17 sept. 2022), fondé par E. Macron.',
    verifiee: true,
  },
  wp_epr: {
    url: 'https://fr.wikipedia.org/wiki/Ensemble_pour_la_R%C3%A9publique_(France)',
    titre: 'Ensemble pour la République — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      'Coalition de la majorité présidentielle, partis membres, groupe parlementaire présidé par Gabriel Attal.',
    verifiee: true,
  },
  wp_attal: {
    url: 'https://fr.wikipedia.org/wiki/Gabriel_Attal',
    titre: 'Gabriel Attal — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      'Ancien Premier ministre, président du groupe EPR depuis juillet 2024, secrétaire général de Renaissance.',
    verifiee: true,
  },
  fi_attal_sg: {
    url: 'https://www.franceinfo.fr/politique/la-republique-en-marche/gabriel-attal-a-ete-officiellement-elu-secretaire-general-de-renaissance_6943445.html',
    titre: 'Gabriel Attal officiellement élu secrétaire général de Renaissance',
    media: 'France Info',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-12-08'),
    dateConsultation: new Date('2026-06-26'),
    auteur: 'Rédaction France Info',
    description:
      'Élection de Gabriel Attal comme secrétaire général de Renaissance avec 94,9 % des voix au Conseil national.',
    verifiee: true,
  },
  wp_barrot: {
    url: 'https://fr.wikipedia.org/wiki/Jean-No%C3%ABl_Barrot',
    titre: 'Jean-Noël Barrot — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      "Économiste (MIT, HEC), MoDem, ministre de l'Europe et des Affaires étrangères depuis le 21 sept. 2024.",
    verifiee: true,
  },
  diplo_barrot: {
    url: 'https://www.diplomatie.gouv.fr/fr/le-ministere-et-son-reseau/ministres-et-secretaire-d-etat/',
    titre: "Jean-Noël Barrot — ministre de l'Europe et des Affaires étrangères (France Diplomatie)",
    media: 'France Diplomatie (MEAE)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-09-21'),
    dateConsultation: new Date('2026-06-26'),
    auteur: 'Ministère de l’Europe et des Affaires étrangères',
    description: 'Fiche officielle du ministre de l’Europe et des Affaires étrangères.',
    verifiee: true,
  },
  wp_lescure: {
    url: 'https://fr.wikipedia.org/wiki/Roland_Lescure',
    titre: 'Roland Lescure — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      "Caisse de dépôt du Québec, député des Français de l'étranger, ministre de l'Économie depuis oct. 2025.",
    verifiee: true,
  },
  wp_darmanin: {
    url: 'https://fr.wikipedia.org/wiki/G%C3%A9rald_Darmanin',
    titre: 'Gérald Darmanin — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      "Ancien ministre de l'Intérieur (2020-2024), Garde des Sceaux depuis le 23 décembre 2024.",
    verifiee: true,
  },
  wp_nunez: {
    url: 'https://fr.wikipedia.org/wiki/Laurent_Nu%C3%B1ez',
    titre: 'Laurent Nuñez — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      "Préfet de police de Paris (2022-2025), DGSI, ministre de l'Intérieur depuis le 12 octobre 2025.",
    verifiee: true,
  },
  wp_berge: {
    url: 'https://fr.wikipedia.org/wiki/Aurore_Berg%C3%A9',
    titre: 'Aurore Bergé — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      "Ex-présidente du groupe Renaissance à l'AN (2022-2023), ministre chargée de l'Égalité femmes-hommes.",
    verifiee: true,
  },
  wp_rist: {
    url: 'https://fr.wikipedia.org/wiki/St%C3%A9phanie_Rist',
    titre: 'Stéphanie Rist — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description: 'Rhumatologue, députée du Loiret, ministre de la Santé depuis le 12 octobre 2025.',
    verifiee: true,
  },
  wp_haddad: {
    url: 'https://fr.wikipedia.org/wiki/Benjamin_Haddad',
    titre: 'Benjamin Haddad — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      "Ex-chercheur à l'Atlantic Council, député de Paris (2022-2024), ministre délégué à l'Europe.",
    verifiee: true,
  },
  wp_amiel: {
    url: 'https://fr.wikipedia.org/wiki/David_Amiel',
    titre: 'David Amiel — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      "Normalien, ex-conseiller à l'Élysée (2017-2019), ministre de l'Action et des Comptes publics (fév. 2026).",
    verifiee: true,
  },
  fi_amiel: {
    url: 'https://www.franceinfo.fr/politique/gouvernement-de-sebastien-lecornu/normalien-macroniste-historique-depute-a-29-ans-qui-est-david-amiel-le-nouveau-ministre-des-comptes-publics_7822934.html',
    titre:
      'Normalien, macroniste historique… Qui est David Amiel, le nouveau ministre des Comptes publics ?',
    media: 'France Info',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-02-22'),
    dateConsultation: new Date('2026-06-26'),
    auteur: 'Rédaction France Info',
    description:
      "Portrait de David Amiel, ex-conseiller à l'Élysée, nommé ministre des Comptes publics le 22 février 2026.",
    verifiee: true,
  },
  wp_bregeon: {
    url: 'https://fr.wikipedia.org/wiki/Maud_Bregeon',
    titre: 'Maud Bregeon — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      "Ingénieure EDF, députée des Hauts-de-Seine, porte-parole du gouvernement et ministre déléguée à l'Énergie.",
    verifiee: true,
  },
  wp_lecornu_ii: {
    url: 'https://fr.wikipedia.org/wiki/Gouvernement_Lecornu_II',
    titre: 'Gouvernement Lecornu II — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-02-26'),
    dateConsultation: new Date('2026-06-26'),
    auteur: null,
    description:
      'Composition du gouvernement Lecornu II (formé le 12 octobre 2025), avec le remaniement du 26 février 2026.',
    verifiee: true,
  },
  jorf_remaniement: {
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053586369',
    titre: 'Décret du 26 février 2026 relatif à la composition du Gouvernement',
    media: 'Légifrance (JORF)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-02-26'),
    dateConsultation: new Date('2026-06-26'),
    auteur: 'Premier ministre',
    description:
      'Décret officiel du remaniement du gouvernement Lecornu II (entrées, sorties, nouvelles attributions).',
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002), exactement 1 entité non-nulle de chaque côté.
// Chaque entité référencée possède un wikidataId (résolution via trouverEntite).
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Noyau familial / fondateur ---
  {
    // P-P : mariage
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'personne',
    bRef: 'Q21511883',
    typeLienCode: 'CONJOINT',
    description:
      'Emmanuel Macron a épousé Brigitte Trogneux le 20 octobre 2007 au Touquet-Paris-Plage.',
    dateDebut: new Date('2007-10-20'),
    dateFin: null,
    sourceRef: 'wp_brigitte',
  },
  {
    // P-O : Macron fondateur de Renaissance (ex-En Marche)
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'organisation',
    bRef: 'Q23731823',
    typeLienCode: 'FONDATEUR',
    description:
      'Emmanuel Macron a fondé En Marche le 6 avril 2016, mouvement devenu LREM puis Renaissance en 2022.',
    dateDebut: new Date('2016-04-06'),
    dateFin: null,
    sourceRef: 'wp_renaissance',
  },

  // --- Tête de l'exécutif ---
  {
    // P-P : Macron nomme Lecornu Premier ministre
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'personne',
    bRef: 'Q20089181',
    typeLienCode: 'politique',
    description:
      'Emmanuel Macron a nommé Sébastien Lecornu Premier ministre par décret du 9 septembre 2025.',
    dateDebut: new Date('2025-09-09'),
    dateFin: null,
    sourceRef: 'jorf_lecornu',
  },
  {
    // P-O : Lecornu affilié à Renaissance
    aType: 'personne',
    aRef: 'Q20089181',
    bType: 'organisation',
    bRef: 'Q23731823',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Sébastien Lecornu a rejoint le mouvement de Macron en 2017 (après Les Républicains) et est affilié à Renaissance.',
    dateDebut: new Date('2017-01-01'),
    dateFin: null,
    sourceRef: 'wp_lecornu',
  },

  // --- Direction du camp présidentiel : Gabriel Attal ---
  {
    // P-O : Attal secrétaire général de Renaissance
    aType: 'personne',
    aRef: 'Q30339350',
    bType: 'organisation',
    bRef: 'Q23731823',
    typeLienCode: 'DIRIGEANT',
    description:
      'Gabriel Attal est élu secrétaire général de Renaissance le 8 décembre 2024 (94,9 % des voix).',
    dateDebut: new Date('2024-12-08'),
    dateFin: null,
    sourceRef: 'fi_attal_sg',
  },
  {
    // P-O : Attal président du groupe EPR à l'Assemblée
    aType: 'personne',
    aRef: 'Q30339350',
    bType: 'organisation',
    bRef: 'Q109929254',
    typeLienCode: 'DIRIGEANT',
    description:
      "Gabriel Attal préside le groupe Ensemble pour la République à l'Assemblée nationale depuis le 13 juillet 2024.",
    dateDebut: new Date('2024-07-13'),
    dateFin: null,
    sourceRef: 'wp_attal',
  },
  {
    // O-O : Renaissance, parti pivot de la coalition EPR
    aType: 'organisation',
    aRef: 'Q23731823',
    bType: 'organisation',
    bRef: 'Q109929254',
    typeLienCode: 'politique',
    description:
      'Renaissance est la force pivot de la coalition Ensemble pour la République depuis les législatives de 2022.',
    dateDebut: new Date('2021-11-01'),
    dateFin: null,
    sourceRef: 'wp_epr',
  },

  // --- Membres du gouvernement Lecornu II (lien à la tête du gouvernement, le Premier ministre) ---
  {
    aType: 'personne',
    aRef: 'Q30339198',
    bType: 'personne',
    bRef: 'Q20089181',
    typeLienCode: 'politique',
    description:
      "Jean-Noël Barrot est ministre de l'Europe et des Affaires étrangères du gouvernement Lecornu II (depuis sept. 2024).",
    dateDebut: new Date('2025-10-12'),
    dateFin: null,
    sourceRef: 'wp_lecornu_ii',
  },
  {
    aType: 'personne',
    aRef: 'Q30130489',
    bType: 'personne',
    bRef: 'Q20089181',
    typeLienCode: 'politique',
    description:
      "Roland Lescure est ministre de l'Économie et des Finances du gouvernement Lecornu II depuis le 12 octobre 2025.",
    dateDebut: new Date('2025-10-12'),
    dateFin: null,
    sourceRef: 'wp_lecornu_ii',
  },
  {
    aType: 'personne',
    aRef: 'Q3123610',
    bType: 'personne',
    bRef: 'Q20089181',
    typeLienCode: 'politique',
    description:
      'Gérald Darmanin est Garde des Sceaux du gouvernement Lecornu II (Justice depuis le 23 décembre 2024).',
    dateDebut: new Date('2025-10-12'),
    dateFin: null,
    sourceRef: 'wp_lecornu_ii',
  },
  {
    aType: 'personne',
    aRef: 'Q30729111',
    bType: 'personne',
    bRef: 'Q20089181',
    typeLienCode: 'politique',
    description:
      "Laurent Nuñez est ministre de l'Intérieur du gouvernement Lecornu II depuis le 12 octobre 2025.",
    dateDebut: new Date('2025-10-12'),
    dateFin: null,
    sourceRef: 'wp_lecornu_ii',
  },
  {
    aType: 'personne',
    aRef: 'Q29570183',
    bType: 'personne',
    bRef: 'Q20089181',
    typeLienCode: 'politique',
    description:
      "Aurore Bergé est ministre déléguée chargée de l'Égalité femmes-hommes du gouvernement Lecornu II.",
    dateDebut: new Date('2025-10-12'),
    dateFin: null,
    sourceRef: 'wp_lecornu_ii',
  },
  {
    aType: 'personne',
    aRef: 'Q30339281',
    bType: 'personne',
    bRef: 'Q20089181',
    typeLienCode: 'politique',
    description:
      'Stéphanie Rist est ministre de la Santé et des Familles du gouvernement Lecornu II depuis le 12 octobre 2025.',
    dateDebut: new Date('2025-10-12'),
    dateFin: null,
    sourceRef: 'wp_lecornu_ii',
  },
  {
    aType: 'personne',
    aRef: 'Q112572505',
    bType: 'personne',
    bRef: 'Q20089181',
    typeLienCode: 'politique',
    description:
      "Benjamin Haddad est ministre délégué chargé de l'Europe du gouvernement Lecornu II.",
    dateDebut: new Date('2025-10-12'),
    dateFin: null,
    sourceRef: 'wp_lecornu_ii',
  },
  {
    aType: 'personne',
    aRef: 'Q47502155',
    bType: 'personne',
    bRef: 'Q20089181',
    typeLienCode: 'politique',
    description:
      "David Amiel est ministre de l'Action et des Comptes publics du gouvernement Lecornu II (remaniement du 22 février 2026).",
    dateDebut: new Date('2026-02-22'),
    dateFin: null,
    sourceRef: 'jorf_remaniement',
  },
  {
    aType: 'personne',
    aRef: 'Q104032664',
    bType: 'personne',
    bRef: 'Q20089181',
    typeLienCode: 'politique',
    description:
      "Maud Bregeon est porte-parole du gouvernement Lecornu II et ministre déléguée à l'Énergie depuis le 26 février 2026.",
    dateDebut: new Date('2025-10-12'),
    dateFin: null,
    sourceRef: 'jorf_remaniement',
  },

  // --- Affiliations partisanes Renaissance (ministres membres du parti) ---
  {
    aType: 'personne',
    aRef: 'Q30130489',
    bType: 'organisation',
    bRef: 'Q23731823',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Roland Lescure est membre de Renaissance, élu député sous l'étiquette présidentielle depuis 2017.",
    dateDebut: new Date('2017-06-18'),
    dateFin: null,
    sourceRef: 'wp_lescure',
  },
  {
    aType: 'personne',
    aRef: 'Q29570183',
    bType: 'organisation',
    bRef: 'Q23731823',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Aurore Bergé est membre de Renaissance, dont elle a présidé le groupe à l'Assemblée nationale.",
    dateDebut: new Date('2017-06-18'),
    dateFin: null,
    sourceRef: 'wp_berge',
  },
  {
    aType: 'personne',
    aRef: 'Q30339281',
    bType: 'organisation',
    bRef: 'Q23731823',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Stéphanie Rist est membre de Renaissance, élue députée du Loiret sous l'étiquette présidentielle.",
    dateDebut: new Date('2017-06-18'),
    dateFin: null,
    sourceRef: 'wp_rist',
  },
  {
    aType: 'personne',
    aRef: 'Q47502155',
    bType: 'organisation',
    bRef: 'Q23731823',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "David Amiel est membre de Renaissance, macroniste de la première heure et ex-conseiller à l'Élysée.",
    dateDebut: new Date('2022-06-19'),
    dateFin: null,
    sourceRef: 'wp_amiel',
  },
  {
    aType: 'personne',
    aRef: 'Q104032664',
    bType: 'organisation',
    bRef: 'Q23731823',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Maud Bregeon est membre de Renaissance, élue députée des Hauts-de-Seine sous l'étiquette présidentielle.",
    dateDebut: new Date('2022-06-19'),
    dateFin: null,
    sourceRef: 'wp_bregeon',
  },

  // --- Liens biographiques marquants ---
  {
    // P-O : Bergé a présidé le groupe Renaissance/EPR à l'Assemblée (mandat passé)
    aType: 'personne',
    aRef: 'Q29570183',
    bType: 'organisation',
    bRef: 'Q109929254',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Aurore Bergé a présidé le groupe Renaissance (devenu EPR) à l'Assemblée nationale de juin 2022 à juillet 2023.",
    dateDebut: new Date('2022-06-01'),
    dateFin: new Date('2023-07-20'),
    sourceRef: 'wp_berge',
  },
  {
    // P-P : Amiel, conseiller d'Emmanuel Macron à l'Élysée
    aType: 'personne',
    aRef: 'Q47502155',
    bType: 'personne',
    bRef: 'Q3052772',
    typeLienCode: 'EMPLOI',
    description:
      "David Amiel a été conseiller d'Emmanuel Macron à l'Élysée de 2017 à 2019, participant à la doctrine macroniste.",
    dateDebut: new Date('2017-05-15'),
    dateFin: new Date('2019-03-01'),
    sourceRef: 'fi_amiel',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-perso.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-macron] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-macron] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('⚠ Suppression données Macron/Renaissance précédentes...')
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
  console.log('✓ Données précédentes supprimées.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n┌─ seed-macron v2-bis — Macron + Renaissance + gouvernement Lecornu II ─┐\n')
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

  console.log('\n— Organisations (Wikidata) —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ✓ ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Liens —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ✓ ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n┌─ Bilan ─────────────────────────────────────────────────────┐')
  console.log(`│ Personnes     : ${PERSONNES.length} (Macron E./B., Lecornu + Attal + 9 ministres)`)
  console.log(
    `│ Organisations : ${ORGANISATIONS.length} (Renaissance, Ensemble pour la République)`,
  )
  console.log(
    `│ Sources       : ${Object.keys(SOURCES).length} (Wikipédia, JORF/Légifrance, vie-publique, France Info, MEAE)`,
  )
  console.log(
    `│ Liens         : ${LIENS.length} (CONJOINT, FONDATEUR, politique, AFFILIATION_PARTI, DIRIGEANT, ANCIEN_MANDAT, EMPLOI)`,
  )
  console.log('└─────────────────────────────────────────────────────────────┘\n')
}

main()
  .catch((err) => {
    console.error('[seed-macron] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
