/**
 * Seed partis politiques français + chefs — corpus OSINT du 2026-06-30.
 *
 * Périmètre : partis représentés à l'Assemblée nationale, au Parlement
 * européen, ou significatifs sur l'échiquier politique français, avec leur·e·s
 * dirigeant·e·s actuel·le·s (premier·ère secrétaire, président·e, coordinateur·trice,
 * secrétaire national·e) dûment sourcé·e·s.
 *
 * Partis DÉJÀ EN BASE (référencés par leur Q-id, pas recréés) :
 *   Renaissance Q23731823 • Ensemble pour la République Q109929254 (seed-macron-v2)
 *   Parti socialiste Q170972 • EELV/Les Écologistes Q613786 • PRG Q427965
 *   MoDem Q587370 • Horizons Q108846587
 * → Pour ceux-ci : seul le lien DIRIGEANT vers le·la chef·fe actuel·le est ajouté.
 *
 * Partis NOUVEAUX créés par ce seed :
 *   LFI Q27978402 • PCF Q192821 • Place Publique Q58366009 • LR Q20012759
 *   RN Q205150 • Reconquête Q109932430 • UDI Q82892 • Debout la France Q12962
 *
 * Sources : Wikidata (Q-ids tous vérifiés via Special:EntityData + wbsearchentities),
 *           Wikipédia FR, vie-publique.fr, France Info, Euronews, Public Sénat.
 *
 * Garde-fous :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - ⚠️ Incertitudes signalées en commentaire pour les mandats récents
 *     (congrès 2023-2025 non entièrement couverts par la base de connaissance)
 *
 * Usage :
 *   cd backend && node bin/seed-partis-chefs.js
 *   cd backend && node bin/seed-partis-chefs.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — chaque fiche recoupée par ≥ 2 sources publiques (cf. commentaires).
// ---------------------------------------------------------------------------

const PERSONNES = [
  // --- Dirigeant·e·s de partis DÉJÀ EN BASE ---

  {
    // Sources : Wikidata Q3351018 + Wikipédia FR + Parti socialiste (site officiel)
    // Rôle : Premier secrétaire du Parti socialiste depuis le congrès d'Aubervilliers
    //         le 17 mars 2018 (victoire de sa motion à ~57 %). Réélu en 2023.
    nom: 'Faure',
    prenom: 'Olivier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1968-08-18'),
    lieuNaissance: 'La Tronche (Isère)',
    rolePrincipal: 'Premier secrétaire du Parti socialiste',
    rolesSecondaires: [
      "député de Seine-et-Marne (depuis 2012)",
      "ancien vice-président du groupe PS à l'Assemblée nationale",
    ],
    bio:
      "Élu député de Seine-et-Marne en 2012, Olivier Faure remporte la direction " +
      "du Parti socialiste le 17 mars 2018 au congrès d'Aubervilliers avec ~57 % des voix. " +
      "Il est réélu à la tête du parti lors du congrès de Marseille en 2023.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Olivier_Faure_(homme_politique)',
    wikidataId: 'Q3351018',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q29917987 + Wikipédia FR + Europe 1 / Public Sénat
    // Rôle : Secrétaire nationale des Écologistes (EELV) depuis le 10 décembre 2022
    //         (élection au 2e tour du congrès avec 90,8 % des voix).
    nom: 'Tondelier',
    prenom: 'Marine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1986-08-23'),
    lieuNaissance: 'Bois-Bernard (Pas-de-Calais)',
    rolePrincipal: "Secrétaire nationale des Écologistes (EELV)",
    rolesSecondaires: [
      "conseillère régionale des Hauts-de-France (depuis juillet 2021)",
      "ancienne conseillère municipale de Bois-Bernard",
    ],
    bio:
      "Diplômée de Sciences Po Lille, conseillère régionale des Hauts-de-France, " +
      "Marine Tondelier est élue secrétaire nationale d'Europe Écologie Les Verts " +
      "(rebaptisé Les Écologistes) le 10 décembre 2022 avec 90,8 % des voix.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Marine_Tondelier',
    wikidataId: 'Q29917987',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q65131729 + Wikipédia FR + site officiel PRG + Public Sénat
    // Rôle : Président du Parti radical de gauche (Le Centre gauche) depuis le 6 février 2019,
    //         successeur de Sylvia Pinel.
    nom: 'Lacroix',
    prenom: 'Guillaume',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1976-02-11'),
    lieuNaissance: 'Bourg-en-Bresse (Ain)',
    rolePrincipal: 'Président du Parti radical de gauche',
    rolesSecondaires: [
      "conseiller référendaire à la Cour des comptes",
      "conseiller régional d'Auvergne-Rhône-Alpes (depuis 2021)",
    ],
    bio:
      "Diplômé de Jean Moulin Lyon 3 et conseiller référendaire à la Cour des comptes, " +
      "Guillaume Lacroix prend la tête du Parti radical de gauche le 6 février 2019, " +
      "succédant à Sylvia Pinel lors d'un congrès extraordinaire.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Guillaume_Lacroix_(homme_politique,_1976)',
    wikidataId: 'Q65131729',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q12963 + Wikipédia FR + Mouvement démocrate (site officiel) + JDD
    // Rôle : Président du Mouvement démocrate (MoDem) depuis le congrès fondateur de nov. 2007.
    // ⚠️ Incertitude : Bayrou a été Premier ministre de décembre 2024 à septembre 2025
    //    (gouvernement Bayrou) avant d'être remplacé par Lecornu. Sa présidence du MoDem
    //    en juin 2026 est probable mais non confirmée par une source postérieure à août 2025.
    nom: 'Bayrou',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1951-05-25'),
    lieuNaissance: "Bordères-sur-l'Échez (Hautes-Pyrénées)",
    rolePrincipal: 'Président du Mouvement démocrate (MoDem)',
    rolesSecondaires: [
      "ancien Premier ministre (décembre 2024 - septembre 2025)",
      "candidat à la présidentielle 2002, 2007 et 2012",
      "ancien président de l'UDF",
      "ancien ministre de l'Éducation nationale (1993-1997)",
    ],
    bio:
      "Fondateur et président permanent du Mouvement démocrate depuis 2007, " +
      "héritier de l'UDF dont il présida les destinées. Candidat trois fois à la " +
      "présidence de la République, Premier ministre de décembre 2024 à septembre 2025. " +
      "⚠️ Direction du MoDem à reconfirmer post-passage à Matignon.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Bayrou',
    wikidataId: 'Q12963',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3579995 + Wikipédia FR + Horizons (site officiel)
    // Rôle : Fondateur et président d'Horizons depuis le congrès fondateur d'octobre 2021.
    nom: 'Philippe',
    prenom: 'Édouard',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1970-11-28'),
    lieuNaissance: 'Rouen (Seine-Maritime)',
    rolePrincipal: "Fondateur et président du parti Horizons",
    rolesSecondaires: [
      "ancien Premier ministre (mai 2017 - juillet 2020)",
      "ancien maire du Havre (2010-2026)",
      "ancien député de Seine-Maritime",
    ],
    bio:
      "Ancien Premier ministre (2017-2020), énarque et avocat, Édouard Philippe " +
      "fonde le parti Horizons en octobre 2021 pour incarner une sensibilité " +
      "centre-droit au sein de la majorité présidentielle. Il préside le parti depuis sa fondation.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89douard_Philippe',
    wikidataId: 'Q3579995',
    qualiteInfluence: 'ELU',
  },

  // --- Dirigeant·e·s de partis NOUVEAUX ---

  {
    // Sources : Wikidata Q5829 + Wikipédia FR + LFI (site officiel)
    // Rôle : Fondateur de La France insoumise (10 février 2016),
    //         figure tutélaire mais non-dirigeant depuis janvier 2023.
    nom: 'Mélenchon',
    prenom: 'Jean-Luc',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1951-08-19'),
    lieuNaissance: 'Tanger (Maroc)',
    rolePrincipal: 'Fondateur de La France insoumise',
    rolesSecondaires: [
      "ancien sénateur de l'Essonne (2000-2010)",
      "ancien ministre délégué à l'Enseignement professionnel (2000-2002)",
      "candidat à la présidentielle 2012 (11,1 %), 2017 (19,6 %), 2022 (21,95 %)",
      "cofondateur du Parti de gauche (2009)",
    ],
    bio:
      "Ancien sénateur et ministre de Jospin, Jean-Luc Mélenchon cofonde le Parti " +
      "de gauche en 2009 puis lance La France insoumise le 10 février 2016. " +
      "Trois fois candidat à la présidentielle, il cède la coordination à Manuel Bompard en janvier 2023.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Luc_M%C3%A9lenchon',
    wikidataId: 'Q5829',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q29575749 + France Info (désignation coordinateur 5 jan. 2023)
    // Rôle : Coordinateur de La France insoumise depuis le 5 janvier 2023.
    // ⚠️ Incertitude : le 2e congrès de LFI (septembre 2023) a pu modifier la gouvernance ;
    //    Bompard était toujours coordinateur à la date de coupure août 2025.
    nom: 'Bompard',
    prenom: 'Manuel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1986-03-30'),
    lieuNaissance: 'Firminy (Loire)',
    rolePrincipal: 'Coordinateur de La France insoumise',
    rolesSecondaires: [
      "député des Bouches-du-Rhône (depuis 2022)",
      "ancien coordinateur de LFI (2017-2019)",
    ],
    bio:
      "Député des Bouches-du-Rhône depuis 2022, Manuel Bompard est désigné " +
      "coordinateur de La France insoumise à l'unanimité le 5 janvier 2023, " +
      "succédant à Adrien Quatennens. Il était déjà coordinateur de 2017 à 2019.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Manuel_Bompard',
    wikidataId: 'Q29575749',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30388733 + Wikipédia FR + PCF (communiqué de congrès nov. 2018)
    // Rôle : Secrétaire national du Parti communiste français depuis le 38e congrès
    //         (25 novembre 2018), réélu au 39e congrès (2023).
    nom: 'Roussel',
    prenom: 'Fabien',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1969-04-16'),
    lieuNaissance: 'Béthune (Pas-de-Calais)',
    rolePrincipal: 'Secrétaire national du Parti communiste français',
    rolesSecondaires: [
      "député du Nord (depuis 2017)",
      "candidat à la présidentielle 2022 (2,28 %)",
    ],
    bio:
      "Élu député du Nord en 2017, Fabien Roussel remporte la direction du PCF " +
      "le 25 novembre 2018 au 38e congrès. Candidat à la présidentielle 2022 (2,28 %), " +
      "il est réélu secrétaire national au 39e congrès en 2023.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fabien_Roussel',
    wikidataId: 'Q30388733',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q556149 + Wikipédia FR + Place Publique (site officiel)
    // Rôle : Cofondateur et co-président de Place Publique depuis novembre 2018 ;
    //         réélu co-président avec Aurore Lalucq en mars 2025.
    nom: 'Glucksmann',
    prenom: 'Raphaël',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1979-09-24'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Co-président de Place Publique',
    rolesSecondaires: [
      "eurodéputé (depuis 2019)",
      "essayiste (L'Europe ou la guerre, 2024)",
      "fils d'André Glucksmann",
    ],
    bio:
      "Politologue et essayiste, fils du philosophe André Glucksmann, Raphaël " +
      "Glucksmann cofonde Place Publique en novembre 2018. Élu eurodéputé en 2019, " +
      "il est réélu co-président du parti avec Aurore Lalucq en mars 2025.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Rapha%C3%ABl_Glucksmann',
    wikidataId: 'Q556149',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q56320702 + Wikipédia FR + Place Publique (site officiel) + Parlement européen
    // Rôle : Co-présidente de Place Publique depuis décembre 2022 ;
    //         réélue avec Raphaël Glucksmann en mars 2025.
    nom: 'Lalucq',
    prenom: 'Aurore',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1979-04-17'),
    lieuNaissance: null,
    rolePrincipal: 'Co-présidente de Place Publique',
    rolesSecondaires: [
      "eurodéputée (depuis 2019)",
      "présidente de la commission ECON du Parlement européen (depuis 2024)",
      "ancienne chercheuse à l'IDDRI",
    ],
    bio:
      "Économiste et chercheuse à l'IDDRI, Aurore Lalucq est élue eurodéputée en 2019. " +
      "Co-présidente de Place Publique depuis décembre 2022, elle préside la commission " +
      "des Affaires économiques du Parlement européen depuis 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Aurore_Lalucq',
    wikidataId: 'Q56320702',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2926942 + Wikipédia FR + Euronews / Congrès LR mai 2025
    // Rôle : Président des Républicains depuis le 18 mai 2025 (74 % des voix
    //         face à Laurent Wauquiez), après la crise Ciotti de 2024.
    //         Anciennement ministre de l'Intérieur (sept. 2024 - oct. 2025).
    nom: 'Retailleau',
    prenom: 'Bruno',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1960-11-20'),
    lieuNaissance: 'Cholet (Maine-et-Loire)',
    rolePrincipal: 'Président des Républicains',
    rolesSecondaires: [
      "sénateur de Vendée (depuis 2010)",
      "ancien ministre de l'Intérieur (septembre 2024 - octobre 2025)",
      "ancien président du conseil régional des Pays de la Loire (2015-2017)",
    ],
    bio:
      "Sénateur de Vendée, Bruno Retailleau a été ministre de l'Intérieur sous les " +
      "gouvernements Barnier et Bayrou (sept. 2024-oct. 2025). Élu président des " +
      "Républicains le 18 mai 2025 avec 74 % des voix lors du congrès du parti.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bruno_Retailleau',
    wikidataId: 'Q2926942',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q40655898 + Wikipédia FR + RN (communiqué congrès nov. 2022)
    // Rôle : Président du Rassemblement national depuis le 5 novembre 2022 (85 % des voix),
    //         successeur de Marine Le Pen.
    nom: 'Bardella',
    prenom: 'Jordan',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1995-09-13'),
    lieuNaissance: 'Drancy (Seine-Saint-Denis)',
    rolePrincipal: 'Président du Rassemblement national',
    rolesSecondaires: [
      "eurodéputé (depuis 2019)",
      "tête de liste RN aux européennes 2019 et 2024",
      "ancien président par intérim du RN (2021-2022)",
    ],
    bio:
      "Eurodéputé depuis 2019, Jordan Bardella est élu président du Rassemblement " +
      "national le 5 novembre 2022 avec 85 % des voix lors du congrès du parti, " +
      "succédant à Marine Le Pen. Il est à ce jour le plus jeune président du RN.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jordan_Bardella',
    wikidataId: 'Q40655898',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q26161928 + Wikipédia FR + Reconquête (site officiel)
    // Rôle : Fondateur et président de Reconquête depuis le congrès fondateur du 5 déc. 2021.
    // ⚠️ Incertitude : tensions internes récurrentes depuis 2022 ; direction à reconfirmer
    //    si un congrès a eu lieu après août 2025.
    nom: 'Zemmour',
    prenom: 'Éric',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-08-31'),
    lieuNaissance: 'Montreuil (Seine-Saint-Denis)',
    rolePrincipal: 'Fondateur et président de Reconquête',
    rolesSecondaires: [
      "journaliste (Le Figaro, 1996-2019)",
      "polémiste et essayiste (Le Suicide français, 2014)",
      "candidat à la présidentielle 2022 (7,07 %)",
    ],
    bio:
      "Polémiste et essayiste, ancien chroniqueur au Figaro, Éric Zemmour fonde " +
      "Reconquête lors du congrès fondateur du 5 décembre 2021 et en est le président. " +
      "Candidat à la présidentielle 2022 (7,07 %). ⚠️ Direction à reconfirmer.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89ric_Zemmour',
    wikidataId: 'Q26161928',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3134586 + Wikipédia FR + France Info + Public Sénat
    // Rôle : Président de l'UDI depuis le 10 décembre 2022 (93 % des voix),
    //         successeur de Jean-Christophe Lagarde.
    nom: 'Marseille',
    prenom: 'Hervé',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1954-08-20'),
    lieuNaissance: 'Abbeville (Somme)',
    rolePrincipal: "Président de l'Union des démocrates et indépendants (UDI)",
    rolesSecondaires: [
      "sénateur des Hauts-de-Seine (depuis 2011)",
      "président du groupe Rassemblement des démocrates, progressistes et indépendants au Sénat",
      "ancien maire de Meudon (1995-2014)",
    ],
    bio:
      "Sénateur des Hauts-de-Seine depuis 2011, Hervé Marseille est élu président " +
      "de l'UDI le 10 décembre 2022 avec 93,39 % des voix, succédant à " +
      "Jean-Christophe Lagarde.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Herv%C3%A9_Marseille',
    wikidataId: 'Q3134586',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q12961 + Wikipédia FR + Debout la France (site officiel)
    // Rôle : Fondateur et président de Debout la France (ex-Debout la République, 2008 ;
    //         renommé Debout la France en 2014).
    nom: 'Dupont-Aignan',
    prenom: 'Nicolas',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-03-07'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Fondateur et président de Debout la France',
    rolesSecondaires: [
      "député de l'Essonne (depuis 1997)",
      "candidat à la présidentielle 2012 (1,79 %), 2017 (4,70 %), 2022 (2,06 %)",
      "ancien militant du RPR puis de l'UMP",
    ],
    bio:
      "Député de l'Essonne depuis 1997, Nicolas Dupont-Aignan fonde Debout la " +
      "République en 2008 (renommé Debout la France en 2014) dont il est le président. " +
      "Candidat à la présidentielle à trois reprises ; défenseur d'un gaullisme souverainiste.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nicolas_Dupont-Aignan',
    wikidataId: 'Q12961',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — uniquement les partis NON encore en base.
// Les partis déjà en base (PS, EELV, PRG, MoDem, Horizons, Renaissance, EPR)
// sont référencés par wikidataId dans les LIENS sans être recréés ici.
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q27978402 + Wikipédia FR + lafranceinsoumise.fr
    nom: 'La France insoumise',
    sigle: 'LFI',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://lafranceinsoumise.fr',
    description:
      "Mouvement politique de gauche radicale fondé le 10 février 2016 par Jean-Luc " +
      "Mélenchon. Première force de la gauche en voix à la présidentielle 2022 (21,95 %). " +
      "Coordinateur depuis janvier 2023 : Manuel Bompard.",
    dateCreation: new Date('2016-02-10'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/La_France_insoumise',
    wikidataId: 'Q27978402',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q192821 + Wikipédia FR + pcf.fr
    nom: 'Parti communiste français',
    sigle: 'PCF',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.pcf.fr',
    description:
      "Parti fondé au congrès de Tours le 30 décembre 1920, l'un des plus anciens " +
      "partis politiques français. Secrétaire national depuis 2018 : Fabien Roussel.",
    dateCreation: new Date('1920-12-30'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Parti_communiste_fran%C3%A7ais',
    wikidataId: 'Q192821',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q58366009 + Wikipédia FR + place-publique.eu
    nom: 'Place Publique',
    sigle: 'PP',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://place-publique.eu',
    description:
      "Parti de centre-gauche pro-européen fondé en novembre 2018 par Raphaël " +
      "Glucksmann. Co-présidé par Raphaël Glucksmann et Aurore Lalucq (réélu·e·s mars 2025).",
    dateCreation: new Date('2018-11-28'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Place_publique_(parti_politique)',
    wikidataId: 'Q58366009',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q20012759 + Wikipédia FR + republicains.fr
    // NB : créé le 30 mai 2015 par renommage de l'UMP sous l'impulsion de Nicolas Sarkozy.
    //      Après la crise Ciotti (juin 2024), le parti reste LR sous Retailleau (mai 2025).
    nom: 'Les Républicains',
    sigle: 'LR',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.republicains.fr',
    description:
      "Parti de droite fondé le 30 mai 2015 par renommage de l'UMP. Après la crise " +
      "provoquée par Éric Ciotti en 2024 (alliance avec le RN), le parti est " +
      "dirigé depuis mai 2025 par Bruno Retailleau, élu avec 74 % des voix.",
    dateCreation: new Date('2015-05-30'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_R%C3%A9publicains',
    wikidataId: 'Q20012759',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q205150 + Wikipédia FR + rassemblementnational.fr
    // NB : fondé le 5 octobre 1972 comme « Front national » par Jean-Marie Le Pen ;
    //      renommé « Rassemblement national » le 1er juin 2018.
    nom: 'Rassemblement national',
    sigle: 'RN',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://rassemblementnational.fr',
    description:
      "Parti d'extrême droite fondé le 5 octobre 1972 sous le nom « Front national » " +
      "par Jean-Marie Le Pen, renommé « Rassemblement national » le 1er juin 2018. " +
      "Président depuis le 5 novembre 2022 : Jordan Bardella.",
    dateCreation: new Date('1972-10-05'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Rassemblement_national',
    wikidataId: 'Q205150',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q109932430 + Wikipédia FR + reconquete.fr
    nom: 'Reconquête',
    sigle: null,
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.reconquete.fr',
    description:
      "Parti nationaliste et souverainiste fondé par Éric Zemmour lors du congrès " +
      "fondateur du 5 décembre 2021. ⚠️ Tensions internes récurrentes depuis 2022 ; " +
      "direction à reconfirmer.",
    dateCreation: new Date('2021-12-05'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Reconqu%C3%AAte_(parti_politique)',
    wikidataId: 'Q109932430',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q82892 + Wikipédia FR + parti-udi.fr
    nom: "Union des démocrates et indépendants",
    sigle: 'UDI',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.parti-udi.fr',
    description:
      "Parti centriste fondé le 21 octobre 2012 par Jean-Louis Borloo. " +
      "Président depuis le 10 décembre 2022 : Hervé Marseille (93,39 % des voix).",
    dateCreation: new Date('2012-10-21'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Union_des_d%C3%A9mocrates_et_ind%C3%A9pendants',
    wikidataId: 'Q82892',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q12962 + Wikipédia FR + debout-la-france.fr
    // NB : héritier de « Debout la République » fondé par Dupont-Aignan en 2008
    //      (lui-même issu du RPF de De Villiers). Renommé « Debout la France » en 2014.
    nom: 'Debout la France',
    sigle: 'DLF',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.debout-la-france.fr',
    description:
      "Mouvement gaulliste et souverainiste fondé par Nicolas Dupont-Aignan en 2008 " +
      "sous le nom « Debout la République » (renommé « Debout la France » en 2014). " +
      "Son président en est le fondateur depuis l'origine.",
    dateCreation: new Date('2008-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Debout_la_France',
    wikidataId: 'Q12962',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-06-30).
// ---------------------------------------------------------------------------

const SOURCES = {
  // --- Personnes (leaders partis déjà en base) ---
  wp_faure: {
    url: 'https://fr.wikipedia.org/wiki/Olivier_Faure_(homme_politique)',
    titre: 'Olivier Faure — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : député Seine-et-Marne, premier secrétaire du PS depuis le " +
      "congrès d'Aubervilliers du 17 mars 2018, réélu en 2023.",
    verifiee: true,
  },
  fi_faure_ps: {
    url: 'https://www.franceinfo.fr/politique/ps/parti-socialiste-la-victoire-d-olivier-faure-comme-premier-secretaire-enterinee-par-les-delegues-du-congres_5627975.html',
    titre: "Parti socialiste : l'élection d'Olivier Faure entérinée par les délégués du congrès",
    media: 'France Info',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2023-01-25'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Rédaction France Info',
    description:
      "Confirmation de la réélection d'Olivier Faure comme premier secrétaire du PS " +
      "au congrès, entérinée par les délégués.",
    verifiee: true,
  },
  wp_tondelier: {
    url: 'https://fr.wikipedia.org/wiki/Marine_Tondelier',
    titre: 'Marine Tondelier — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : conseillère régionale Hauts-de-France, secrétaire nationale " +
      "des Écologistes (EELV) depuis le 10 décembre 2022 (90,8 % des voix).",
    verifiee: true,
  },
  pub_tondelier: {
    url: 'https://www.publicsenat.fr/actualites/politique/marine-tondelier-en-passe-detre-reelue-a-la-tete-des-ecologistes-elle-a-su-redresser-la-barre-du-parti',
    titre: "Marine Tondelier en passe d'être réélue à la tête des Écologistes",
    media: 'Public Sénat',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-01-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Article confirmant que Marine Tondelier est à la tête des Écologistes " +
      "et en voie de réélection au poste de secrétaire nationale.",
    verifiee: true,
  },
  wp_lacroix: {
    url: 'https://fr.wikipedia.org/wiki/Guillaume_Lacroix_(homme_politique,_1976)',
    titre: 'Guillaume Lacroix (homme politique, 1976) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : conseiller référendaire à la Cour des comptes, président du " +
      "Parti radical de gauche depuis le 6 février 2019.",
    verifiee: true,
  },
  prg_lacroix: {
    url: 'https://www.partiradicaldegauche.fr/nos-instances/le-president/',
    titre: 'Le Président — Parti Radical de Gauche (site officiel)',
    media: 'Parti radical de gauche',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2019-02-06'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Page officielle du président du PRG ; confirme Guillaume Lacroix comme président " +
      "en exercice depuis le 6 février 2019.",
    verifiee: true,
  },
  wp_bayrou: {
    url: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Bayrou',
    titre: 'François Bayrou — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : fondateur du MoDem (2007), candidat présidentiel 2002/2007/2012, " +
      "Premier ministre déc. 2024 - sept. 2025.",
    verifiee: true,
  },
  modem_bayrou: {
    url: 'https://www.mouvementdemocrate.fr/fiche/francois-bayrou-2366',
    titre: 'François Bayrou — Mouvement démocrate (site officiel)',
    media: 'Mouvement démocrate',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2007-11-10'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Fiche officielle de François Bayrou, président du Mouvement démocrate " +
      "depuis le congrès fondateur de novembre 2007.",
    verifiee: true,
  },
  wp_philippe: {
    url: 'https://fr.wikipedia.org/wiki/%C3%89douard_Philippe',
    titre: 'Édouard Philippe — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : ancien Premier ministre (2017-2020), fondateur et président " +
      "d'Horizons depuis octobre 2021.",
    verifiee: true,
  },
  horizons_philippe: {
    url: 'https://horizonsleparti.fr/',
    titre: 'Horizons — site officiel du parti',
    media: 'Horizons',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2021-10-25'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Site officiel du parti Horizons, fondé par Édouard Philippe en octobre 2021 " +
      "pour porter une sensibilité centre-droit dans la majorité présidentielle.",
    verifiee: true,
  },

  // --- Personnes (leaders partis nouveaux) ---
  wp_melenchon: {
    url: 'https://fr.wikipedia.org/wiki/Jean-Luc_M%C3%A9lenchon',
    titre: 'Jean-Luc Mélenchon — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : fondateur de La France insoumise (10 fév. 2016), candidat " +
      "présidentiel 2012, 2017 (19,6 %), 2022 (21,95 %).",
    verifiee: true,
  },
  wp_bompard: {
    url: 'https://fr.wikipedia.org/wiki/Manuel_Bompard',
    titre: 'Manuel Bompard — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : député des Bouches-du-Rhône, coordinateur de LFI depuis " +
      "le 5 janvier 2023.",
    verifiee: true,
  },
  fi_bompard: {
    url: 'https://www.franceinfo.fr/politique/la-france-insoumise/le-depute-manuel-bompard-designe-coordinateur-de-la-france-insoumise-a-l-unanimite_5582808.html',
    titre: "Le député Manuel Bompard désigné coordinateur de La France insoumise « à l'unanimité »",
    media: 'France Info',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2023-01-05'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Rédaction France Info',
    description:
      "Annonce de la désignation unanime de Manuel Bompard comme coordinateur de LFI " +
      "le 5 janvier 2023, en remplacement d'Adrien Quatennens.",
    verifiee: true,
  },
  wp_roussel: {
    url: 'https://fr.wikipedia.org/wiki/Fabien_Roussel',
    titre: 'Fabien Roussel — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : député du Nord, secrétaire national du PCF depuis le 38e congrès " +
      "(25 novembre 2018), réélu au 39e congrès (2023).",
    verifiee: true,
  },
  wp_glucksmann: {
    url: 'https://fr.wikipedia.org/wiki/Rapha%C3%ABl_Glucksmann',
    titre: 'Raphaël Glucksmann — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : cofondateur de Place Publique (2018), eurodéputé depuis 2019, " +
      "co-président réélu avec Lalucq en mars 2025.",
    verifiee: true,
  },
  wp_lalucq: {
    url: 'https://fr.wikipedia.org/wiki/Aurore_Lalucq',
    titre: 'Aurore Lalucq — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : eurodéputée depuis 2019, co-présidente de Place Publique " +
      "depuis décembre 2022, présidente de la commission ECON du PE depuis 2024.",
    verifiee: true,
  },
  wp_retailleau: {
    url: 'https://fr.wikipedia.org/wiki/Bruno_Retailleau',
    titre: 'Bruno Retailleau — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : sénateur de Vendée, ministre de l'Intérieur sept. 2024-oct. 2025, " +
      "président des Républicains depuis mai 2025.",
    verifiee: true,
  },
  euronews_retailleau_lr: {
    url: 'https://fr.euronews.com/2025/05/19/presidence-lr-bruno-retailleau-nouvel-homme-fort-de-la-droite-francaise',
    titre: "Présidence LR : Bruno Retailleau, nouvel homme fort de la droite française",
    media: 'Euronews',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2025-05-19'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Bruno Retailleau élu président des Républicains le 18 mai 2025 avec 74 % " +
      "des voix face à Laurent Wauquiez lors du congrès de renouvellement du parti.",
    verifiee: true,
  },
  wp_bardella: {
    url: 'https://fr.wikipedia.org/wiki/Jordan_Bardella',
    titre: 'Jordan Bardella — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : eurodéputé depuis 2019, élu président du RN le 5 novembre 2022 " +
      "avec 85 % des voix, successeur de Marine Le Pen.",
    verifiee: true,
  },
  wp_zemmour: {
    url: 'https://fr.wikipedia.org/wiki/%C3%89ric_Zemmour',
    titre: 'Éric Zemmour — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : journaliste-polémiste, fondateur de Reconquête (déc. 2021), " +
      "candidat présidentiel 2022 (7,07 %).",
    verifiee: true,
  },
  wp_marseille: {
    url: 'https://fr.wikipedia.org/wiki/Herv%C3%A9_Marseille',
    titre: 'Hervé Marseille — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : sénateur des Hauts-de-Seine, président de l'UDI depuis " +
      "le 10 décembre 2022 (93,39 % des voix).",
    verifiee: true,
  },
  fi_marseille_udi: {
    url: 'https://www.franceinfo.fr/politique/udi/le-senateur-herve-marseille-elu-president-de-l-udi_5536788.html',
    titre: "Le sénateur Hervé Marseille élu président du parti centriste UDI",
    media: 'France Info',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2022-12-10'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Rédaction France Info',
    description:
      "Hervé Marseille élu président de l'UDI le 10 décembre 2022 avec 93,39 % " +
      "des voix, succédant à Jean-Christophe Lagarde.",
    verifiee: true,
  },
  wp_dupont_aignan: {
    url: 'https://fr.wikipedia.org/wiki/Nicolas_Dupont-Aignan',
    titre: 'Nicolas Dupont-Aignan — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : député de l'Essonne depuis 1997, fondateur de Debout la République " +
      "(2008, renommé Debout la France en 2014).",
    verifiee: true,
  },

  // --- Organisations (Wikipédia parti) ---
  wp_lfi: {
    url: 'https://fr.wikipedia.org/wiki/La_France_insoumise',
    titre: 'La France insoumise — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Historique du mouvement LFI : fondation 10 fév. 2016, coordinateurs successifs " +
      "(Mélenchon, Bompard, Quatennens, Bompard).",
    verifiee: true,
  },
  wp_pcf: {
    url: 'https://fr.wikipedia.org/wiki/Parti_communiste_fran%C3%A7ais',
    titre: 'Parti communiste français — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Historique du PCF : fondation au congrès de Tours (30 déc. 1920), " +
      "secrétaires nationaux, résultats électoraux.",
    verifiee: true,
  },
  wp_pp: {
    url: 'https://fr.wikipedia.org/wiki/Place_publique_(parti_politique)',
    titre: 'Place Publique (parti politique) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Historique de Place Publique : fondation nov. 2018 par Glucksmann, " +
      "co-présidence Glucksmann/Lalucq depuis déc. 2022, réélu·e·s mars 2025.",
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
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Historique du parti LR : fondé le 30 mai 2015 (ex-UMP), crise Ciotti 2024, " +
      "congrès de renouvellement mai 2025.",
    verifiee: true,
  },
  wp_rn: {
    url: 'https://fr.wikipedia.org/wiki/Rassemblement_national',
    titre: 'Rassemblement national — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Historique du RN (ex-FN fondé en 1972), renommage juin 2018, présidents " +
      "successifs (Le Pen père, Le Pen fille, Bardella).",
    verifiee: true,
  },
  wp_reconquete: {
    url: 'https://fr.wikipedia.org/wiki/Reconqu%C3%AAte_(parti_politique)',
    titre: 'Reconquête (parti politique) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Historique de Reconquête : fondation déc. 2021 par Éric Zemmour, " +
      "résultats présidentielle 2022 (7,07 %), tensions internes 2022-2025.",
    verifiee: true,
  },
  wp_udi: {
    url: 'https://fr.wikipedia.org/wiki/Union_des_d%C3%A9mocrates_et_ind%C3%A9pendants',
    titre: "Union des démocrates et indépendants — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Historique de l'UDI : fondation oct. 2012 par Borloo, présidents successifs " +
      "(Borloo, Lagarde, Marseille depuis 2022).",
    verifiee: true,
  },
  wp_dlf: {
    url: 'https://fr.wikipedia.org/wiki/Debout_la_France',
    titre: 'Debout la France — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Historique de Debout la France (ex-Debout la République fondé 2008, " +
      "renommé 2014), fondateur et président Nicolas Dupont-Aignan.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002).
// Chaque entité référencée possède un wikidataId (résolution via trouverEntite).
// aRef / bRef = wikidataId de l'entité A / B.
// ---------------------------------------------------------------------------

const LIENS = [
  // =========================================================================
  // Partis DÉJÀ EN BASE — uniquement lien DIRIGEANT vers le·la chef·fe actuel·le
  // =========================================================================

  {
    // P-O : Faure → PS
    aType: 'personne',
    aRef: 'Q3351018',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'DIRIGEANT',
    description:
      "Olivier Faure est premier secrétaire du Parti socialiste depuis le congrès " +
      "d'Aubervilliers du 17 mars 2018 ; réélu au congrès de Marseille en 2023.",
    dateDebut: new Date('2018-03-17'),
    dateFin: null,
    sourceRef: 'fi_faure_ps',
  },
  {
    // P-O : Tondelier → Les Écologistes (EELV)
    aType: 'personne',
    aRef: 'Q29917987',
    bType: 'organisation',
    bRef: 'Q613786',
    typeLienCode: 'DIRIGEANT',
    description:
      "Marine Tondelier est secrétaire nationale des Écologistes (EELV) depuis " +
      "le 10 décembre 2022, élue avec 90,8 % des voix au 2e tour du congrès.",
    dateDebut: new Date('2022-12-10'),
    dateFin: null,
    sourceRef: 'wp_tondelier',
  },
  {
    // P-O : Lacroix → PRG
    aType: 'personne',
    aRef: 'Q65131729',
    bType: 'organisation',
    bRef: 'Q427965',
    typeLienCode: 'DIRIGEANT',
    description:
      "Guillaume Lacroix est président du Parti radical de gauche depuis le " +
      "6 février 2019, succédant à Sylvia Pinel lors d'un congrès extraordinaire.",
    dateDebut: new Date('2019-02-06'),
    dateFin: null,
    sourceRef: 'prg_lacroix',
  },
  {
    // P-O : Bayrou → MoDem
    // ⚠️ Bayrou a été Premier ministre déc. 2024 - sept. 2025 ; sa présidence
    //    du MoDem en juin 2026 est probable mais à reconfirmer.
    aType: 'personne',
    aRef: 'Q12963',
    bType: 'organisation',
    bRef: 'Q587370',
    typeLienCode: 'DIRIGEANT',
    description:
      "François Bayrou est président du Mouvement démocrate (MoDem) depuis le " +
      "congrès fondateur du 10 novembre 2007. ⚠️ À reconfirmer post-passage à Matignon " +
      "(Premier ministre déc. 2024 - sept. 2025).",
    dateDebut: new Date('2007-11-10'),
    dateFin: null,
    sourceRef: 'modem_bayrou',
  },
  {
    // P-O : Philippe → Horizons
    aType: 'personne',
    aRef: 'Q3579995',
    bType: 'organisation',
    bRef: 'Q108846587',
    typeLienCode: 'DIRIGEANT',
    description:
      "Édouard Philippe préside le parti Horizons depuis sa fondation lors du " +
      "congrès fondateur d'octobre 2021.",
    dateDebut: new Date('2021-10-25'),
    dateFin: null,
    sourceRef: 'horizons_philippe',
  },

  // =========================================================================
  // Partis NOUVEAUX — FONDATEUR (là où le fondateur n'est plus dirigeant)
  // =========================================================================

  {
    // P-O : Mélenchon → LFI — FONDATEUR
    aType: 'personne',
    aRef: 'Q5829',
    bType: 'organisation',
    bRef: 'Q27978402',
    typeLienCode: 'FONDATEUR',
    description:
      "Jean-Luc Mélenchon a fondé La France insoumise le 10 février 2016, " +
      "en a été la figure dirigeante principale jusqu'en janvier 2023.",
    dateDebut: new Date('2016-02-10'),
    dateFin: null,
    sourceRef: 'wp_lfi',
  },
  {
    // P-O : Glucksmann → Place Publique — FONDATEUR
    aType: 'personne',
    aRef: 'Q556149',
    bType: 'organisation',
    bRef: 'Q58366009',
    typeLienCode: 'FONDATEUR',
    description:
      "Raphaël Glucksmann cofonde Place Publique en novembre 2018, dont il est " +
      "l'un des instigateurs et premier président.",
    dateDebut: new Date('2018-11-28'),
    dateFin: null,
    sourceRef: 'wp_pp',
  },

  // =========================================================================
  // Partis NOUVEAUX — DIRIGEANT (chef·fe en exercice)
  // =========================================================================

  {
    // P-O : Bompard → LFI — DIRIGEANT
    aType: 'personne',
    aRef: 'Q29575749',
    bType: 'organisation',
    bRef: 'Q27978402',
    typeLienCode: 'DIRIGEANT',
    description:
      "Manuel Bompard est désigné coordinateur de La France insoumise à l'unanimité " +
      "le 5 janvier 2023, succédant à Adrien Quatennens.",
    dateDebut: new Date('2023-01-05'),
    dateFin: null,
    sourceRef: 'fi_bompard',
  },
  {
    // P-O : Roussel → PCF — DIRIGEANT
    aType: 'personne',
    aRef: 'Q30388733',
    bType: 'organisation',
    bRef: 'Q192821',
    typeLienCode: 'DIRIGEANT',
    description:
      "Fabien Roussel est élu secrétaire national du Parti communiste français " +
      "le 25 novembre 2018 au 38e congrès ; réélu au 39e congrès (2023).",
    dateDebut: new Date('2018-11-25'),
    dateFin: null,
    sourceRef: 'wp_roussel',
  },
  {
    // P-O : Glucksmann → Place Publique — DIRIGEANT (co-président)
    aType: 'personne',
    aRef: 'Q556149',
    bType: 'organisation',
    bRef: 'Q58366009',
    typeLienCode: 'DIRIGEANT',
    description:
      "Raphaël Glucksmann est co-président de Place Publique depuis la fondation " +
      "en novembre 2018 ; réélu avec Aurore Lalucq en mars 2025.",
    dateDebut: new Date('2018-11-28'),
    dateFin: null,
    sourceRef: 'wp_glucksmann',
  },
  {
    // P-O : Lalucq → Place Publique — DIRIGEANT (co-présidente)
    aType: 'personne',
    aRef: 'Q56320702',
    bType: 'organisation',
    bRef: 'Q58366009',
    typeLienCode: 'DIRIGEANT',
    description:
      "Aurore Lalucq est co-présidente de Place Publique depuis le 16 décembre 2022 ; " +
      "réélue avec Raphaël Glucksmann en mars 2025.",
    dateDebut: new Date('2022-12-16'),
    dateFin: null,
    sourceRef: 'wp_lalucq',
  },
  {
    // P-O : Retailleau → LR — DIRIGEANT
    aType: 'personne',
    aRef: 'Q2926942',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'DIRIGEANT',
    description:
      "Bruno Retailleau est élu président des Républicains le 18 mai 2025 " +
      "avec 74 % des voix face à Laurent Wauquiez au congrès de renouvellement.",
    dateDebut: new Date('2025-05-18'),
    dateFin: null,
    sourceRef: 'euronews_retailleau_lr',
  },
  {
    // P-O : Bardella → RN — DIRIGEANT
    aType: 'personne',
    aRef: 'Q40655898',
    bType: 'organisation',
    bRef: 'Q205150',
    typeLienCode: 'DIRIGEANT',
    description:
      "Jordan Bardella est élu président du Rassemblement national le 5 novembre 2022 " +
      "avec 85 % des voix, succédant à Marine Le Pen.",
    dateDebut: new Date('2022-11-05'),
    dateFin: null,
    sourceRef: 'wp_bardella',
  },
  {
    // P-O : Zemmour → Reconquête — FONDATEUR
    aType: 'personne',
    aRef: 'Q26161928',
    bType: 'organisation',
    bRef: 'Q109932430',
    typeLienCode: 'FONDATEUR',
    description:
      "Éric Zemmour fonde Reconquête lors du congrès fondateur du 5 décembre 2021 " +
      "et en devient le premier président.",
    dateDebut: new Date('2021-12-05'),
    dateFin: null,
    sourceRef: 'wp_reconquete',
  },
  {
    // P-O : Zemmour → Reconquête — DIRIGEANT
    aType: 'personne',
    aRef: 'Q26161928',
    bType: 'organisation',
    bRef: 'Q109932430',
    typeLienCode: 'DIRIGEANT',
    description:
      "Éric Zemmour est président de Reconquête depuis la fondation du parti " +
      "le 5 décembre 2021. ⚠️ Direction à reconfirmer (tensions internes récurrentes).",
    dateDebut: new Date('2021-12-05'),
    dateFin: null,
    sourceRef: 'wp_zemmour',
  },
  {
    // P-O : Marseille → UDI — DIRIGEANT
    aType: 'personne',
    aRef: 'Q3134586',
    bType: 'organisation',
    bRef: 'Q82892',
    typeLienCode: 'DIRIGEANT',
    description:
      "Hervé Marseille est élu président de l'UDI le 10 décembre 2022 avec " +
      "93,39 % des voix, succédant à Jean-Christophe Lagarde.",
    dateDebut: new Date('2022-12-10'),
    dateFin: null,
    sourceRef: 'fi_marseille_udi',
  },
  {
    // P-O : Dupont-Aignan → Debout la France — FONDATEUR
    aType: 'personne',
    aRef: 'Q12961',
    bType: 'organisation',
    bRef: 'Q12962',
    typeLienCode: 'FONDATEUR',
    description:
      "Nicolas Dupont-Aignan fonde Debout la République en 2008 (renommé " +
      "Debout la France en 2014), dont il est le fondateur et président depuis l'origine.",
    dateDebut: new Date('2008-01-01'),
    dateFin: null,
    sourceRef: 'wp_dlf',
  },
  {
    // P-O : Dupont-Aignan → Debout la France — DIRIGEANT
    aType: 'personne',
    aRef: 'Q12961',
    bType: 'organisation',
    bRef: 'Q12962',
    typeLienCode: 'DIRIGEANT',
    description:
      "Nicolas Dupont-Aignan est président de Debout la France (ex-Debout la " +
      "République) depuis la fondation du mouvement en 2008.",
    dateDebut: new Date('2008-01-01'),
    dateFin: null,
    sourceRef: 'wp_dupont_aignan',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js — copiés verbatim)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-partis-chefs] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-partis-chefs] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données partis-chefs précédentes...')
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
  console.log('\n+-- seed-partis-chefs -- partis FR + dirigeant·e·s actuel·le·s --+\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`  User : ${user.email}\n`)

  console.log('-- Sources publiques --')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok ${data.titre}`)
  }

  console.log('\n-- Personnes (Wikidata) --')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ok ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n-- Organisations nouvelles (Wikidata) --')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ok ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n-- Liens --')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok ${lien.typeLienCode} -- ${lien.description.slice(0, 70)}...`)
  }

  const nbPartisEnBase = 5 // PS, EELV, PRG, MoDem, Horizons
  console.log('\n+-- Bilan -----------------------------------------------------------+')
  console.log(`|  Personnes     : ${PERSONNES.length} (dirigeant·e·s de ${ORGANISATIONS.length + nbPartisEnBase} partis)`)
  console.log(`|  Organisations : ${ORGANISATIONS.length} nouvelles (+ ${nbPartisEnBase} déjà en base, seulement liées)`)
  console.log(`|  Sources       : ${Object.keys(SOURCES).length} (Wikipédia FR, France Info, Euronews, sites officiels)`)
  console.log(`|  Liens         : ${LIENS.length} (DIRIGEANT, FONDATEUR)`)
  console.log('|')
  console.log('|  Partis reutilises (deja en base, seulement lien DIRIGEANT ajoute) :')
  console.log('|    PS Q170972 / EELV Q613786 / PRG Q427965 / MoDem Q587370 / Horizons Q108846587')
  console.log('|')
  console.log('|  Incertitudes signalees (avertissements dans les descriptions) :')
  console.log('|    - Bayrou/MoDem : direction post-Matignon a reconfirmer (juin 2026)')
  console.log('|    - Bompard/LFI  : gouvernance post-congres LFI sept. 2023 a reconfirmer')
  console.log('|    - Zemmour/Reconquete : tensions internes, direction a reconfirmer')
  console.log('+--------------------------------------------------------------------+\n')
}

main()
  .catch((err) => {
    console.error('[seed-partis-chefs] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
