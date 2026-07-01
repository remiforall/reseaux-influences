/**
 * Seed gouvernements Macron 2017-2025 — enquête OSINT du 2026-06-30.
 *
 * Périmètre : Premiers ministres NON encore seedés (Philippe, Castex, Borne, Barnier),
 *             12 ministres structurants de ces gouvernements, et 2 partis de coalition
 *             (MoDem, Horizons). Le lien de nomination PM pour Gabriel Attal est également
 *             créé ici (son nœud existe déjà dans seed-macron-v2.js).
 *
 * DÉPENDANCES OBLIGATOIRES :
 *   - seed-macron-v2.js doit avoir tourné avant ce seed (Macron Q3052772, Attal Q30339350,
 *     Renaissance Q23731823, Barrot Q30339198 référencés dans les LIENS).
 *   - seed-hollande.js n'est PAS requis ; Le Drian (Q559040) est noté en methode mais
 *     exclu des LIENS pour garder ce seed autonome.
 *
 * Sources : Wikidata (Q-ids tous vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR (pages personnelles + pages gouvernements), Légifrance/JORF
 *           (références à compléter manuellement — voir methode.md).
 *
 * Q-ids vérifiés (Special:EntityData confirmé) :
 *   Q3579995 Édouard Philippe · Q3171170 Jean Castex · Q20020731 Élisabeth Borne
 *   Q438465 Michel Barnier · Q993472 Bruno Le Maire · Q3332699 Olivier Véran
 *   Q3167954 Jean-Michel Blanquer · Q1726930 Christophe Castaner
 *   Q20807844 Marlène Schiappa · Q3591105 Éric Dupond-Moretti
 *   Q30379410 Amélie de Montchalin · Q3362697 Pap Ndiaye
 *   Q587370 Mouvement démocrate (MoDem) · Q108846587 Horizons
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-macron-gouvernements.js
 *   cd backend && node bin/seed-macron-gouvernements.js --reset
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
    // Sources : Wikidata Q3579995 + Wikipédia FR (Édouard Philippe) + Gouvernement Philippe I (Wikipédia FR)
    // DoB confirmé Wikidata : 1970-11-28. lieuNaissance : Rouen, très documenté (élu normand).
    nom: 'Philippe',
    prenom: 'Édouard',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1970-11-28'),
    lieuNaissance: 'Rouen (Seine-Maritime)',
    rolePrincipal: 'Premier ministre (2017-2020) ; président d\'Horizons',
    rolesSecondaires: [
      'maire du Havre (2010-2020)',
      'député de Seine-Maritime (2012-2017)',
      'fondateur d\'Horizons (2021)',
      'adhérent LR avant 2017',
    ],
    bio:
      "Énarque (promotion Averroès 1995) et avocat de formation, Édouard Philippe est maire du Havre quand " +
      "Emmanuel Macron le nomme Premier ministre le 15 mai 2017. Il forme deux gouvernements (Philippe I et II) " +
      "et conduit les premières réformes structurelles du quinquennat (SNCF, retraites) jusqu'au 3 juillet 2020. " +
      "Il fonde Horizons le 9 octobre 2021 et reprend la mairie du Havre.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89douard_Philippe',
    wikidataId: 'Q3579995',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3171170 + Wikipédia FR (Jean Castex) + Gouvernement Castex (Wikipédia FR)
    // DoB : 1965-06-25 (Vic-Fezensac, Gers), largement documenté à sa nomination (juil. 2020).
    nom: 'Castex',
    prenom: 'Jean',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1965-06-25'),
    lieuNaissance: 'Vic-Fezensac (Gers)',
    rolePrincipal: 'Premier ministre (2020-2022)',
    rolesSecondaires: [
      'délégué interministériel aux JO 2024 (2017-2020)',
      'maire de Prades (depuis 2008)',
      'haut fonctionnaire (ENA promotion Victor Hugo 1992)',
    ],
    bio:
      "Énarque et haut fonctionnaire, maire de Prades (Pyrénées-Orientales), Jean Castex est nommé " +
      "délégué interministériel aux Jeux Olympiques 2024 en 2017. Emmanuel Macron le nomme Premier ministre " +
      "le 3 juillet 2020 pour gérer la sortie de crise COVID et la relance économique. Son gouvernement dure " +
      "jusqu'au 16 mai 2022. Il devient ensuite PDG de la RATP (2022-2024).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean_Castex',
    wikidataId: 'Q3171170',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q20020731 + Wikipédia FR (Élisabeth Borne) + Gouvernement Borne (Wikipédia FR)
    // DoB confirmé Wikidata : 1961-04-18. Polytechnique, ENA (promotion Léonard de Vinci 1987).
    nom: 'Borne',
    prenom: 'Élisabeth',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-04-18'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Première ministre (2022-2024)',
    rolesSecondaires: [
      "ministre du Travail (2020-2022)",
      "ministre de la Transition écologique (2019-2020)",
      "ministre des Transports (2017-2019)",
      "présidente-directrice générale de la RATP (2015-2017)",
      "préfète de la région Poitou-Charentes (2013-2015)",
    ],
    bio:
      "Polytechnicienne et énarque, Élisabeth Borne est la deuxième femme nommée Première ministre en France " +
      "(16 mai 2022), après Édith Cresson. Ancienne préfète et dirigeante de la RATP, elle a été ministre " +
      "des Transports puis de la Transition écologique et du Travail avant de former son gouvernement. " +
      "Elle quitte Matignon le 8 janvier 2024, remplacée par Gabriel Attal.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89lisabeth_Borne',
    wikidataId: 'Q20020731',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q438465 + Wikipédia FR (Michel Barnier) + Gouvernement Barnier (Wikipédia FR)
    // DoB confirmé Wikidata : 1951-01-09 (La Tronche, Isère).
    nom: 'Barnier',
    prenom: 'Michel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1951-01-09'),
    lieuNaissance: 'La Tronche (Isère)',
    rolePrincipal: 'Premier ministre (sept.-déc. 2024)',
    rolesSecondaires: [
      "négociateur en chef de l'UE pour le Brexit (2016-2019)",
      "commissaire européen au Marché intérieur (2010-2014)",
      "ministre des Affaires étrangères (2004-2005)",
      "candidat à la présidence de la Commission européenne (2014)",
      "sénateur et député de Savoie",
    ],
    bio:
      "Figure de la droite gaulliste (LR), Michel Barnier est nommé Premier ministre le 5 septembre 2024 " +
      "dans le contexte d'une Assemblée nationale sans majorité absolue. Connu internationalement pour avoir " +
      "piloté les négociations du Brexit au nom de l'UE, son gouvernement est renversé par une motion de censure " +
      "le 4 décembre 2024 et il présente sa démission le 5 décembre 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Michel_Barnier',
    wikidataId: 'Q438465',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q993472 + Wikipédia FR (Bruno Le Maire) + Gouvernement Philippe I (Wikipédia FR)
    // DoB confirmé Wikidata : 1969-04-15. Normalien (ENS), ENA (promotion Averroès 1995).
    nom: 'Le Maire',
    prenom: 'Bruno',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1969-04-15'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Ministre de l'Économie et des Finances (2017-2024)",
    rolesSecondaires: [
      "ministre de l'Agriculture (2009-2012, sous Fillon II et III)",
      "secrétaire d'État aux Affaires européennes (2008-2009)",
      "député de l'Eure (1re circonscription, 2007-2017)",
      "candidat à la primaire LR 2016",
      "écrivain (romans, essais)",
    ],
    bio:
      "Normalien et énarque, Bruno Le Maire est l'un des ministres les plus durables du quinquennat Macron : " +
      "ministre de l'Économie, des Finances et de la Souveraineté industrielle de mai 2017 à septembre 2024 " +
      "(7 ans, record pour ce portefeuille sous la Ve République). Venu de la droite (LR), " +
      "il conduit la politique économique sous les gouvernements Philippe, Castex, Borne et Attal. " +
      "Il quitte le gouvernement lors de la formation du gouvernement Barnier en septembre 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bruno_Le_Maire',
    wikidataId: 'Q993472',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3332699 + Wikipédia FR (Olivier Véran) + Gouvernement Castex (Wikipédia FR)
    // DoB confirmé Wikidata : 1980-04-22. Neurologue (CHU Grenoble), député de l'Isère.
    nom: 'Véran',
    prenom: 'Olivier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1980-04-22'),
    rolePrincipal: 'Ministre des Solidarités et de la Santé (2020-2022)',
    rolesSecondaires: [
      "porte-parole du gouvernement et ministre délégué (2022-2024)",
      "neurologue au CHU de Grenoble",
      "député de l'Isère (2012-2024)",
    ],
    bio:
      "Neurologue au CHU de Grenoble et député de l'Isère, Olivier Véran est nommé ministre de la Santé " +
      "le 16 février 2020 (sous Philippe II) pour remplacer Agnès Buzyn candidate à Paris. Il gère la " +
      "crise sanitaire COVID-19 et reste à ce poste sous Castex jusqu'en mai 2022. Sous Borne, il devient " +
      "porte-parole du gouvernement et ministre délégué aux Relations avec le Parlement (2022-2024).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Olivier_V%C3%A9ran',
    wikidataId: 'Q3332699',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3167954 + Wikipédia FR (Jean-Michel Blanquer) + Gouvernement Philippe I (Wikipédia FR)
    // DoB confirmé Wikidata : 1964-12-04. Juriste, administrateur civil, recteur.
    nom: 'Blanquer',
    prenom: 'Jean-Michel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1964-12-04'),
    rolePrincipal: "Ministre de l'Éducation nationale (2017-2022)",
    rolesSecondaires: [
      "directeur général de l'enseignement scolaire (DGESCO, 2009-2012)",
      "recteur de l'académie de Guyane (2012)",
      "recteur de l'académie de Créteil (2012-2013)",
      "recteur de l'académie de Lille (2013-2017)",
      "directeur général de l'ESSEC (2013-2017)",
    ],
    bio:
      "Haut fonctionnaire du corps de l'éducation nationale, Jean-Michel Blanquer est directeur de l'ESSEC " +
      "au moment de sa nomination comme ministre de l'Éducation nationale le 17 mai 2017. Il occupe ce poste " +
      "sous les gouvernements Philippe I et II puis sous Castex pendant cinq ans, portant notamment la réforme " +
      "du baccalauréat (2019) et les protocoles sanitaires en milieu scolaire (COVID). Remplacé par Pap Ndiaye " +
      "sous Borne en mai 2022.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Michel_Blanquer',
    wikidataId: 'Q3167954',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q1726930 + Wikipédia FR (Christophe Castaner) + Gouvernement Philippe II (Wikipédia FR)
    // DoB confirmé Wikidata : 1966-01-03. Avocat, ex-maire de Castellane (04).
    nom: 'Castaner',
    prenom: 'Christophe',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-01-03'),
    rolePrincipal: "Ministre de l'Intérieur (2018-2020)",
    rolesSecondaires: [
      "porte-parole du gouvernement Philippe I (2017-2018)",
      "délégué général de La République en marche (2017-2018)",
      "député des Alpes-de-Haute-Provence (2012-2017)",
      "maire de Castellane (2003-2014)",
      "président du groupe LREM à l'Assemblée nationale (2020-2022)",
    ],
    bio:
      "Avocat et élu local des Alpes-de-Haute-Provence, Christophe Castaner est l'un des premiers parlementaires " +
      "à rejoindre Emmanuel Macron. Nommé porte-parole du gouvernement Philippe I (mai 2017), il devient " +
      "délégué général de LREM (2017-2018), puis ministre de l'Intérieur (octobre 2018 - juillet 2020). " +
      "Il préside ensuite le groupe LREM/EPR à l'Assemblée nationale de 2020 à 2022.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Christophe_Castaner',
    wikidataId: 'Q1726930',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q20807844 + Wikipédia FR (Marlène Schiappa) + Gouvernement Philippe I (Wikipédia FR)
    // DoB confirmé Wikidata : 1982-11-18 (Paris). Auteure, blogueuse féministe avant 2017.
    nom: 'Schiappa',
    prenom: 'Marlène',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1982-11-18'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Secrétaire d'État à l'Égalité entre les femmes et les hommes (2017-2020)",
    rolesSecondaires: [
      "ministre déléguée à la Citoyenneté (2020-2022)",
      "secrétaire d'État à l'Économie sociale et solidaire et à la Vie associative (2022-2023)",
      "personnalité de la société civile, auteure et blogueuse féministe",
    ],
    bio:
      "Auteure et militante féministe, connue pour son blog et ses essais sur le partage du temps parental, " +
      "Marlène Schiappa est recrutée par Emmanuel Macron comme secrétaire d'État chargée de l'Égalité " +
      "entre les femmes et les hommes (17 mai 2017 - 6 juillet 2020). Elle porte notamment la loi contre " +
      "les violences sexistes et sexuelles (loi Schiappa, 2018) et occupe plusieurs postes gouvernementaux " +
      "jusqu'en 2023.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Marl%C3%A8ne_Schiappa',
    wikidataId: 'Q20807844',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3591105 + Wikipédia FR (Éric Dupond-Moretti) + Gouvernement Castex (Wikipédia FR)
    // DoB confirmé Wikidata : 1961-04-20 (Maubeuge, Nord). Avocat pénaliste, surnommé "Acquittator".
    nom: 'Dupond-Moretti',
    prenom: 'Éric',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-04-20'),
    lieuNaissance: 'Maubeuge (Nord)',
    rolePrincipal: 'Garde des Sceaux, ministre de la Justice (2020-2024)',
    rolesSecondaires: [
      "avocat pénaliste au barreau de Lille (depuis 1984)",
      "surnommé « Acquittator » pour son taux d'acquittements élevé aux assises",
      'acquitté par la Cour de justice de la République en novembre 2023 (affaire des écoutes)',
    ],
    bio:
      "Fils d'un immigré italien du Nord minier, Éric Dupond-Moretti est l'un des avocats pénalistes " +
      "les plus célèbres de France (Roland Agret, Jérôme Kerviel, Jawad Bendaoud…). Nommé Garde des Sceaux " +
      "le 6 juillet 2020 par Jean Castex comme « personnalité de la société civile », il occupe le poste " +
      "sous Castex, Borne et Attal jusqu'en septembre 2024. Il est acquitté par la Cour de justice de la " +
      "République le 29 novembre 2023 dans l'affaire des écoutes de magistrats.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89ric_Dupond-Moretti',
    wikidataId: 'Q3591105',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30379410 + Wikipédia FR (Amélie de Montchalin) + Gouvernement Castex (Wikipédia FR)
    // DoB confirmé Wikidata : 1985-06-19. HEC, économiste, macroniste de la première heure.
    nom: 'de Montchalin',
    prenom: 'Amélie',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1985-06-19'),
    rolePrincipal: 'Ministre de la Transformation et de la Fonction publiques (2020-2022)',
    rolesSecondaires: [
      "secrétaire d'État aux Affaires européennes (2019-2020, sous Philippe II)",
      "ministre de la Transition écologique (mai-juillet 2022, sous Borne ; démission après défaite législative)",
      "première présidente de la Cour des comptes (depuis février 2026)",
      "députée de l'Essonne (1re circonscription, 2017-2022)",
    ],
    bio:
      "HEC (2008) et Harvard Kennedy School, Amélie de Montchalin rejoint Emmanuel Macron dès 2016. " +
      "Élue députée de l'Essonne en 2017, elle devient secrétaire d'État aux Affaires européennes sous " +
      "Philippe II (avril 2019) puis ministre de la Transformation et de la Fonction publiques sous Castex " +
      "(2020-2022). Elle démissionne après avoir perdu son siège aux législatives de juin 2022 (Borne). " +
      "Nommée première présidente de la Cour des comptes en février 2026.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Am%C3%A9lie_de_Montchalin',
    wikidataId: 'Q30379410',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3362697 + Wikipédia FR (Pap Ndiaye) + Gouvernement Borne (Wikipédia FR)
    // DoB confirmé Wikidata : 1965-10-25. Historien, directeur de la Cité de l'histoire de l'immigration.
    nom: 'Ndiaye',
    prenom: 'Pap',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1965-10-25'),
    rolePrincipal: "Ministre de l'Éducation nationale et de la Jeunesse (2022-2023)",
    rolesSecondaires: [
      "directeur du musée national de l'histoire de l'immigration (2019-2022)",
      "professeur à Sciences Po Paris (histoire)",
      "représentant permanent de la France auprès du Conseil de l'Europe (depuis 2023)",
    ],
    bio:
      "Historien spécialiste de l'histoire des minorités aux États-Unis et des discriminations en France, " +
      "Pap Ndiaye dirige la Cité nationale de l'histoire de l'immigration depuis 2019. Nommé ministre de " +
      "l'Éducation nationale le 20 mai 2022 par Élisabeth Borne (personnalité de la société civile), " +
      "il est remplacé par Gabriel Attal le 17 juillet 2023. Il devient ensuite représentant permanent " +
      "de la France auprès du Conseil de l'Europe.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Pap_Ndiaye',
    wikidataId: 'Q3362697',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q587370 + Wikipédia FR (Mouvement démocrate)
    // Fondateur : François Bayrou (Q12963). Fondé le 10 mai 2007 (post-UDF).
    nom: 'Mouvement démocrate',
    sigle: 'MoDem',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.mouvementdemocrate.fr',
    description:
      "Parti politique centriste français fondé le 10 mai 2007 par François Bayrou, " +
      "succédant à l'UDF. Membre de la coalition Ensemble pour la République, le MoDem " +
      "fournit plusieurs ministres aux gouvernements Macron (dont Jean-Noël Barrot). " +
      "Bayrou est nommé Premier ministre en décembre 2024.",
    dateCreation: new Date('2007-05-10'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Mouvement_d%C3%A9mocrate_(parti_politique)',
    wikidataId: 'Q587370',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q108846587 (vérifié — fondateur Q3579995 Philippe, fondé 2021-10-09)
    //           + Wikipédia FR (Horizons)
    // Wikidata référence un article Le Monde oct. 2021 documentant la création par Philippe au Havre.
    nom: 'Horizons',
    sigle: null,
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.parti-horizons.fr',
    description:
      "Parti politique centriste fondé le 9 octobre 2021 au Havre par Édouard Philippe " +
      "pour réunir la droite modérée favorable à la coalition présidentielle. " +
      "Membre de la coalition Ensemble pour la République, Horizons compte plusieurs " +
      "parlementaires et maires issus de la droite gaulliste.",
    dateCreation: new Date('2021-10-09'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Horizons_(parti_politique)',
    wikidataId: 'Q108846587',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-06-30).
// ---------------------------------------------------------------------------

const SOURCES = {
  // --- Pages personnelles Wikipédia ---
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
      "Biographie : énarque, maire du Havre, PM 2017-2020, fondateur d'Horizons (2021). Né à Rouen (1970).",
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
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Haut fonctionnaire, maire de Prades, délégué JO 2024, Premier ministre juillet 2020-mai 2022.',
    verifiee: true,
  },
  wp_borne: {
    url: 'https://fr.wikipedia.org/wiki/%C3%89lisabeth_Borne',
    titre: 'Élisabeth Borne — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Polytechnicienne, ex-PDG RATP, 2e femme PM de France (mai 2022-janv. 2024). Née à Paris (1961).",
    verifiee: true,
  },
  wp_barnier: {
    url: 'https://fr.wikipedia.org/wiki/Michel_Barnier',
    titre: 'Michel Barnier — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "LR, négociateur Brexit pour l'UE, PM sept.-déc. 2024, renversé par motion de censure le 4 déc. 2024.",
    verifiee: true,
  },
  wp_le_maire: {
    url: 'https://fr.wikipedia.org/wiki/Bruno_Le_Maire',
    titre: 'Bruno Le Maire — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Normalien, énarque, ministre de l'Économie et des Finances 2017-2024, record de longévité au portefeuille.",
    verifiee: true,
  },
  wp_veran: {
    url: 'https://fr.wikipedia.org/wiki/Olivier_V%C3%A9ran',
    titre: 'Olivier Véran — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Neurologue CHU Grenoble, député Isère, ministre Santé fév. 2020-mai 2022, porte-parole 2022-2024.",
    verifiee: true,
  },
  wp_blanquer: {
    url: 'https://fr.wikipedia.org/wiki/Jean-Michel_Blanquer',
    titre: 'Jean-Michel Blanquer — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Administrateur civil, directeur ESSEC, ministre Éducation nationale 2017-2022. Réforme bac 2019.",
    verifiee: true,
  },
  wp_castaner: {
    url: 'https://fr.wikipedia.org/wiki/Christophe_Castaner',
    titre: 'Christophe Castaner — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Avocat, ex-maire Castellane, porte-parole Philippe I (2017), ministre Intérieur (2018-2020), président groupe LREM AN.",
    verifiee: true,
  },
  wp_schiappa: {
    url: 'https://fr.wikipedia.org/wiki/Marl%C3%A8ne_Schiappa',
    titre: 'Marlène Schiappa — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Auteure féministe, secrétaire d'État Égalité femmes-hommes 2017-2020, loi Schiappa (2018).",
    verifiee: true,
  },
  wp_dupond_moretti: {
    url: 'https://fr.wikipedia.org/wiki/%C3%89ric_Dupond-Moretti',
    titre: 'Éric Dupond-Moretti — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Avocat pénaliste (Maubeuge), Garde des Sceaux 2020-2024, acquitté CJR nov. 2023 (affaire écoutes).",
    verifiee: true,
  },
  wp_montchalin: {
    url: 'https://fr.wikipedia.org/wiki/Am%C3%A9lie_de_Montchalin',
    titre: 'Amélie de Montchalin — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "HEC, secrétaire État Europe 2019-2020, ministre Transformation publique 2020-2022, présidente Cour des comptes 2026.",
    verifiee: true,
  },
  wp_ndiaye: {
    url: 'https://fr.wikipedia.org/wiki/Pap_Ndiaye',
    titre: 'Pap Ndiaye — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Historien, directeur Cité histoire immigration, ministre Éducation nationale mai 2022-juil. 2023.",
    verifiee: true,
  },
  wp_modem: {
    url: 'https://fr.wikipedia.org/wiki/Mouvement_d%C3%A9mocrate_(parti_politique)',
    titre: 'Mouvement démocrate (parti politique) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Parti centriste français fondé par François Bayrou le 10 mai 2007, membre de la coalition présidentielle.",
    verifiee: true,
  },
  wp_horizons: {
    url: 'https://fr.wikipedia.org/wiki/Horizons_(parti_politique)',
    titre: 'Horizons (parti politique) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2021-10-09'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Parti fondé par Édouard Philippe le 9 octobre 2021 au Havre, droite modérée pro-coalition présidentielle.",
    verifiee: true,
  },
  // --- Pages gouvernements Wikipédia (sources pour les LIENS d'appartenance) ---
  wp_gouv_philippe_i: {
    url: 'https://fr.wikipedia.org/wiki/Gouvernement_Philippe_I',
    titre: 'Gouvernement Philippe I — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2017-05-17'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Composition du gouvernement Philippe I (17 mai 2017) : liste complète des ministres et secrétaires d'État.",
    verifiee: true,
  },
  wp_gouv_philippe_ii: {
    url: 'https://fr.wikipedia.org/wiki/Gouvernement_Philippe_II',
    titre: 'Gouvernement Philippe II — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2017-06-21'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Composition du gouvernement Philippe II (21 juin 2017) après les élections législatives. Remaniements inclus.",
    verifiee: true,
  },
  wp_gouv_castex: {
    url: 'https://fr.wikipedia.org/wiki/Gouvernement_Castex',
    titre: 'Gouvernement Castex — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2020-07-06'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Composition du gouvernement Castex (6 juillet 2020) : liste des ministres, entrées Dupond-Moretti, Véran (cont.).",
    verifiee: true,
  },
  wp_gouv_borne: {
    url: 'https://fr.wikipedia.org/wiki/Gouvernement_Borne',
    titre: 'Gouvernement Borne — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2022-05-20'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Composition du gouvernement Borne (20 mai 2022) : Pap Ndiaye à l'Éducation, Véran porte-parole.",
    verifiee: true,
  },
  wp_gouv_barnier: {
    url: 'https://fr.wikipedia.org/wiki/Gouvernement_Barnier',
    titre: 'Gouvernement Barnier — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2024-09-21'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Composition du gouvernement Barnier (21 sept. 2024) ; renversé par motion de censure du 4 déc. 2024.",
    verifiee: true,
  },
  wp_gouv_attal: {
    url: 'https://fr.wikipedia.org/wiki/Gouvernement_Attal',
    titre: 'Gouvernement Attal — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2024-01-11'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Gouvernement d'Attal (janv.-sept. 2024) : plus jeune PM Ve République, nommé le 9 janvier 2024.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002), exactement 1 entité non-nulle par côté.
//
// Entités référencées hors de ce seed (cross-seed) :
//   Q3052772 (Macron)     → seed-macron-v2.js  — REQUIS
//   Q30339350 (Attal)     → seed-macron-v2.js  — REQUIS
//   Q30339198 (Barrot)    → seed-macron-v2.js  — REQUIS pour lien Barrot→MoDem
//   Q23731823 (Renaissance) → seed-macron-v2.js — REQUIS pour affiliations
// ---------------------------------------------------------------------------

const LIENS = [
  // -------------------------------------------------------------------------
  // 1. NOMINATIONS PM PAR MACRON
  //    NOTE : Q3052772 (Macron) doit exister dans la DB (seed-macron-v2.js).
  // -------------------------------------------------------------------------
  {
    // Macron → Philippe : nomination PM 15 mai 2017
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'personne',
    bRef: 'Q3579995',
    typeLienCode: 'politique',
    description:
      "Emmanuel Macron nomme Édouard Philippe Premier ministre par décret du 15 mai 2017. " +
      "Philippe forme deux gouvernements successifs jusqu'au 3 juillet 2020.",
    dateDebut: new Date('2017-05-15'),
    dateFin: new Date('2020-07-03'),
    sourceRef: 'wp_philippe',
  },
  {
    // Macron → Castex : nomination PM 3 juillet 2020
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'personne',
    bRef: 'Q3171170',
    typeLienCode: 'politique',
    description:
      "Emmanuel Macron nomme Jean Castex Premier ministre le 3 juillet 2020 " +
      "pour conduire la relance post-COVID. Castex reste à Matignon jusqu'au 16 mai 2022.",
    dateDebut: new Date('2020-07-03'),
    dateFin: new Date('2022-05-16'),
    sourceRef: 'wp_castex',
  },
  {
    // Macron → Borne : nomination Première ministre 16 mai 2022
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'personne',
    bRef: 'Q20020731',
    typeLienCode: 'politique',
    description:
      "Emmanuel Macron nomme Élisabeth Borne Première ministre le 16 mai 2022, " +
      "deuxième femme à occuper ce poste sous la Ve République. Elle démissionne le 8 janvier 2024.",
    dateDebut: new Date('2022-05-16'),
    dateFin: new Date('2024-01-08'),
    sourceRef: 'wp_borne',
  },
  {
    // Macron → Attal : nomination PM 9 janvier 2024
    // NOTE : Q30339350 (Attal) existe dans seed-macron-v2.js — lien manquant créé ici.
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'personne',
    bRef: 'Q30339350',
    typeLienCode: 'politique',
    description:
      "Emmanuel Macron nomme Gabriel Attal Premier ministre le 9 janvier 2024, " +
      "plus jeune chef de gouvernement de la Ve République. Attal démissionne le 5 septembre 2024.",
    dateDebut: new Date('2024-01-09'),
    dateFin: new Date('2024-09-05'),
    sourceRef: 'wp_gouv_attal',
  },
  {
    // Macron → Barnier : nomination PM 5 septembre 2024
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'personne',
    bRef: 'Q438465',
    typeLienCode: 'politique',
    description:
      "Emmanuel Macron nomme Michel Barnier (LR) Premier ministre le 5 septembre 2024 " +
      "pour tenter une coalition avec la droite. Le gouvernement Barnier est renversé par une motion " +
      "de censure le 4 décembre 2024 ; Barnier présente sa démission le 5 décembre 2024.",
    dateDebut: new Date('2024-09-05'),
    dateFin: new Date('2024-12-05'),
    sourceRef: 'wp_barnier',
  },

  // -------------------------------------------------------------------------
  // 2. GOUVERNEMENT PHILIPPE I+II — appartenance des ministres
  // -------------------------------------------------------------------------
  {
    // Bruno Le Maire → Philippe : ministre Économie, nommé Philippe I, tenure continue 2017-2024
    aType: 'personne',
    aRef: 'Q993472',
    bType: 'personne',
    bRef: 'Q3579995',
    typeLienCode: 'politique',
    description:
      "Bruno Le Maire est nommé ministre de l'Économie et des Finances par Édouard Philippe " +
      "le 17 mai 2017 et conserve ce portefeuille de manière continue sous Philippe, Castex, " +
      "Borne et Attal jusqu'au 21 septembre 2024 (7 ans, record Ve République).",
    dateDebut: new Date('2017-05-17'),
    dateFin: new Date('2024-09-21'),
    sourceRef: 'wp_gouv_philippe_i',
  },
  {
    // Jean-Michel Blanquer → Philippe : ministre Éducation 2017-2022
    aType: 'personne',
    aRef: 'Q3167954',
    bType: 'personne',
    bRef: 'Q3579995',
    typeLienCode: 'politique',
    description:
      "Jean-Michel Blanquer est nommé ministre de l'Éducation nationale le 17 mai 2017 par " +
      "Édouard Philippe et reste à ce poste sous Philippe I+II et Castex jusqu'au 20 mai 2022. " +
      "Il porte la réforme du baccalauréat (2019) et les protocoles sanitaires COVID.",
    dateDebut: new Date('2017-05-17'),
    dateFin: new Date('2022-05-20'),
    sourceRef: 'wp_gouv_philippe_i',
  },
  {
    // Christophe Castaner → Philippe : porte-parole puis ministre Intérieur 2017-2020
    aType: 'personne',
    aRef: 'Q1726930',
    bType: 'personne',
    bRef: 'Q3579995',
    typeLienCode: 'politique',
    description:
      "Christophe Castaner est porte-parole du gouvernement Philippe I (mai 2017-octobre 2018), " +
      "puis ministre de l'Intérieur (Philippe II, octobre 2018-juillet 2020). " +
      "Il est aussi délégué général de LREM de 2017 à 2018.",
    dateDebut: new Date('2017-05-17'),
    dateFin: new Date('2020-07-06'),
    sourceRef: 'wp_gouv_philippe_ii',
  },
  {
    // Marlène Schiappa → Philippe : secrétaire d'État Égalité 2017-2020
    aType: 'personne',
    aRef: 'Q20807844',
    bType: 'personne',
    bRef: 'Q3579995',
    typeLienCode: 'politique',
    description:
      "Marlène Schiappa est secrétaire d'État chargée de l'Égalité entre les femmes et les hommes " +
      "dans le gouvernement Philippe I (17 mai 2017-6 juillet 2020). " +
      "Elle porte la loi contre les violences sexistes et sexuelles (loi Schiappa, 3 août 2018).",
    dateDebut: new Date('2017-05-17'),
    dateFin: new Date('2020-07-06'),
    sourceRef: 'wp_gouv_philippe_i',
  },

  // -------------------------------------------------------------------------
  // 3. GOUVERNEMENT CASTEX — appartenance des ministres
  // -------------------------------------------------------------------------
  {
    // Olivier Véran → Castex : ministre Santé (en continu depuis Philippe II)
    aType: 'personne',
    aRef: 'Q3332699',
    bType: 'personne',
    bRef: 'Q3171170',
    typeLienCode: 'politique',
    description:
      "Olivier Véran est maintenu ministre des Solidarités et de la Santé dans le gouvernement " +
      "Castex (6 juillet 2020-16 mai 2022). Il gère la stratégie vaccinale COVID-19 et les " +
      "vagues successives de la pandémie. Initialement nommé sous Philippe II le 16 février 2020.",
    dateDebut: new Date('2020-07-06'),
    dateFin: new Date('2022-05-16'),
    sourceRef: 'wp_gouv_castex',
  },
  {
    // Éric Dupond-Moretti → Castex : Garde des Sceaux 2020-2024 (nomination sous Castex)
    aType: 'personne',
    aRef: 'Q3591105',
    bType: 'personne',
    bRef: 'Q3171170',
    typeLienCode: 'politique',
    description:
      "Éric Dupond-Moretti est nommé Garde des Sceaux par Jean Castex le 6 juillet 2020 " +
      "comme personnalité de la société civile (avocat pénaliste). Il conserve ce portefeuille " +
      "sous Borne et Attal jusqu'au 21 septembre 2024 (4 ans), malgré un procès devant la CJR " +
      "dont il sort acquitté le 29 novembre 2023.",
    dateDebut: new Date('2020-07-06'),
    dateFin: new Date('2024-09-21'),
    sourceRef: 'wp_gouv_castex',
  },
  {
    // Amélie de Montchalin → Castex : ministre Transformation publique 2020-2022
    aType: 'personne',
    aRef: 'Q30379410',
    bType: 'personne',
    bRef: 'Q3171170',
    typeLienCode: 'politique',
    description:
      "Amélie de Montchalin est ministre de la Transformation et de la Fonction publiques " +
      "dans le gouvernement Castex (6 juillet 2020-20 mai 2022). Elle était auparavant " +
      "secrétaire d'État aux Affaires européennes sous Philippe II (avril 2019-juillet 2020).",
    dateDebut: new Date('2020-07-06'),
    dateFin: new Date('2022-05-20'),
    sourceRef: 'wp_gouv_castex',
  },

  // -------------------------------------------------------------------------
  // 4. GOUVERNEMENT BORNE — appartenance des ministres
  // -------------------------------------------------------------------------
  {
    // Pap Ndiaye → Borne : ministre Éducation mai 2022-juillet 2023
    aType: 'personne',
    aRef: 'Q3362697',
    bType: 'personne',
    bRef: 'Q20020731',
    typeLienCode: 'politique',
    description:
      "Pap Ndiaye est nommé ministre de l'Éducation nationale et de la Jeunesse " +
      "le 20 mai 2022 par Élisabeth Borne, en tant que personnalité de la société civile " +
      "(historien). Il est remplacé par Gabriel Attal le 17 juillet 2023.",
    dateDebut: new Date('2022-05-20'),
    dateFin: new Date('2023-07-17'),
    sourceRef: 'wp_gouv_borne',
  },

  // -------------------------------------------------------------------------
  // 5. PARTI HORIZONS — fondation et direction par Édouard Philippe
  // -------------------------------------------------------------------------
  {
    // Philippe → Horizons : FONDATEUR
    aType: 'personne',
    aRef: 'Q3579995',
    bType: 'organisation',
    bRef: 'Q108846587',
    typeLienCode: 'FONDATEUR',
    description:
      "Édouard Philippe fonde le parti Horizons le 9 octobre 2021 au Havre, " +
      "pour rassembler la droite modérée favorable à la coalition présidentielle. " +
      "Confirmé par l'entrée Wikidata Q108846587 (P112 → Q3579995, source Le Monde oct. 2021).",
    dateDebut: new Date('2021-10-09'),
    dateFin: null,
    sourceRef: 'wp_horizons',
  },
  {
    // Philippe → Horizons : DIRIGEANT (président du parti)
    aType: 'personne',
    aRef: 'Q3579995',
    bType: 'organisation',
    bRef: 'Q108846587',
    typeLienCode: 'DIRIGEANT',
    description:
      "Édouard Philippe préside Horizons depuis la fondation du parti le 9 octobre 2021.",
    dateDebut: new Date('2021-10-09'),
    dateFin: null,
    sourceRef: 'wp_horizons',
  },

  // -------------------------------------------------------------------------
  // 6. AFFILIATION MoDem — Jean-Noël Barrot (nœud existant dans seed-macron-v2.js)
  //    NOTE : Q30339198 (Barrot) doit exister (seed-macron-v2.js requis).
  // -------------------------------------------------------------------------
  {
    // Barrot → MoDem : AFFILIATION_PARTI
    aType: 'personne',
    aRef: 'Q30339198',
    bType: 'organisation',
    bRef: 'Q587370',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Jean-Noël Barrot est membre du Mouvement démocrate (MoDem), dont il a été secrétaire général " +
      "avant d'être nommé ministre délégué à l'Europe (2024) puis ministre des Affaires étrangères (2024-2026).",
    dateDebut: new Date('2007-01-01'),
    dateFin: null,
    sourceRef: 'wp_modem',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents — recopiés verbatim depuis seed-macron-v2.js (gabarit canonique).
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-macron-gouvernements] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-macron-gouvernements] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données gouvernements Macron précédentes...')
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
  console.log('\n+-- seed-macron-gouvernements -- gouvernements Philippe/Castex/Borne/Barnier --+\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`OK User : ${user.email}\n`)

  console.log('-- Sources publiques --')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  OK ${data.titre}`)
  }

  console.log('\n-- Personnes (Wikidata) --')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  OK ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n-- Organisations (Wikidata) --')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  OK ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n-- Liens --')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  OK ${lien.typeLienCode} -- ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n+-- Bilan ----------------------------------------------------------------+')
  console.log(`| Personnes     : ${PERSONNES.length} (Philippe, Castex, Borne, Barnier + 8 ministres)`)
  console.log(`| Organisations : ${ORGANISATIONS.length} (MoDem, Horizons)`)
  console.log(`| Sources       : ${Object.keys(SOURCES).length} (Wikipédia FR — pages perso + gouvernements)`)
  console.log(`| Liens         : ${LIENS.length} (nominations PM, appartenances cabinet, fondation Horizons, MoDem)`)
  console.log('+-------------------------------------------------------------------------+\n')
}

main()
  .catch((err) => {
    console.error('[seed-macron-gouvernements] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
