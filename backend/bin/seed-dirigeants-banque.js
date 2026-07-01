/**
 * Seed Dirigeants / Banque — lot « Banque de France + dirigeants sectoriels + Publicis ».
 * Enquête OSINT journalistique du 2026-06-30.
 *
 * Périmètre :
 *   - Banque de France (institution) + gouverneur + sous-gouverneurs en poste
 *   - Philippe Brassac (ex-DG Crédit Agricole SA, départ mai 2025)
 *   - Michel-Édouard Leclerc (Mouvement E.Leclerc)
 *   - Jean-Paul Agon (ex-DG et Président CA L'Oréal)
 *   - Rémy Weber (ex-président directoire La Banque Postale, 2013-2020)
 *     NB : demandé sous « Rémi Weber » dans le brief — orthographe correcte : Rémy.
 *   - Pierre Nanterme (ex-PDG Accenture, décédé le 31 jan. 2019)
 *   - Frédéric Oudéa (ex-DG Société Générale, Président CA Sanofi depuis 2023)
 *     Sanofi est également traité par le pilote CAC40 en parallèle — upsert fusionnera.
 *   - Stéphane Richard (ex-PDG Orange 2011-2022)
 *     VOLET JUDICIAIRE (affaire arbitrage Tapie) : selon France24 (30 juin 2025), la cour
 *     d'appel de Paris (juridiction de renvoi après cassation partielle) a condamné Stéphane
 *     Richard à 6 mois de prison avec sursis et 15 000 € d'amende pour négligence, après
 *     requalification de l'infraction initiale (complicité de détournement). Un pourvoi
 *     ultérieur n'était pas exclu à la date de la source. Statut inclus avec attribution
 *     explicite et précaution PRÉSOMPTION D'INNOCENCE sur toute qualification définitive.
 *   - Georges Plassat (ex-PDG Carrefour 2012-2017)
 *   - Arthur Sadoun (Président du Directoire Publicis Groupe)
 *   - Maurice Lévy (Président du Conseil de Surveillance Publicis Groupe)
 *
 * Entités exclues faute de Q-id Wikidata vérifiable :
 *   - Michel Abaléa : aucun personnage public clairement identifiable et sourçable sur
 *     sources ouvertes avec Q-id Wikidata ; exclu conformément aux règles OSINT (§ loader).
 *   - Damien Deleplanque (Adeo/Leroy Merlin) : ex-DG Adeo (parti en juin 2017),
 *     aucune page Wikidata trouvée (wbsearchentities vide) ; exclu. Adeo Q2941497 est déjà
 *     en base — aucun lien à créer sans Q-id côté personne.
 *
 * Sources : Wikidata (Q-ids vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR, Banque de France officiel, Légifrance JORF, Sanofi officiel,
 *           France24 (statut judiciaire Stéphane Richard).
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-dirigeants-banque.js
 *   cd backend && node bin/seed-dirigeants-banque.js --reset
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
    // Sources : Wikidata Q3086015 (vérifié Special:EntityData) + Wikipédia FR
    //           + JORF (décret 27 mai 2026) — gouverneur Banque de France depuis nov. 2015,
    //           remplacé par Emmanuel Moulin le 2 juin 2026 (décret 27 mai 2026, Légifrance).
    nom: 'Villeroy de Galhau',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1959-02-24'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Gouverneur honoraire de la Banque de France (ex-gouverneur 2015-2026)',
    rolesSecondaires: [
      'ancien membre du Conseil des gouverneurs de la BCE (2015-2026)',
      'ancien directeur général des Finances publiques (DGFiP, 2012-2015)',
      'ancien directeur de cabinet du Premier ministre (2002-2003)',
    ],
    bio:
      "Diplômé de l'ENA et d'HEC, François Villeroy de Galhau a exercé de hautes " +
      "fonctions au Trésor et à la DGFiP avant d'être nommé gouverneur de la Banque de France " +
      "le 1er novembre 2015, poste qu'il a occupé jusqu'au 2 juin 2026. Il siégeait au Conseil " +
      "des gouverneurs de la BCE. Remplacé par Emmanuel Moulin (décret du 27 mai 2026).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Villeroy_de_Galhau',
    wikidataId: 'Q3086015',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q55596606 (vérifié Wikipédia FR) + Banque de France officiel
    //           (https://www.banque-france.fr/fr/sous-gouverneur)
    //           Nommé 2e sous-gouverneur le 1er août 2017, puis 1er sous-gouverneur depuis le 17 jan. 2018.
    nom: 'Beau',
    prenom: 'Denis',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1962-11-21'),
    lieuNaissance: null,
    rolePrincipal: 'Premier sous-gouverneur de la Banque de France',
    rolesSecondaires: [
      "président de l'ACPR par délégation du gouverneur",
      'membre du Conseil de surveillance de la BCE (MSU)',
      "membre du collège de l'AMF",
    ],
    bio:
      "Entré à la Banque de France en 1986, Denis Beau a dirigé la surveillance bancaire " +
      "et la stabilité financière. Nommé 2e sous-gouverneur le 1er août 2017, il devient " +
      "1er sous-gouverneur le 17 janvier 2018, renouvelé en janvier 2024. Il représente le " +
      "gouverneur à l'ACPR et siège au Conseil de surveillance de la BCE.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Denis_Beau',
    wikidataId: 'Q55596606',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q2826972 (vérifié wbsearchentities + Special:EntityData)
    //           + Banque de France officiel + Wikipédia FR
    //           Ancienne chef économiste du Trésor (2020-fév. 2023), nommée 2e sous-gouverneure
    //           de la Banque de France à compter d'avril 2023 (en disponibilité de Paris 1/PSE).
    nom: "Bénassy-Quéré",
    prenom: "Agnès",
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-03-15'),
    lieuNaissance: null,
    rolePrincipal: 'Deuxième sous-gouverneure de la Banque de France',
    rolesSecondaires: [
      "ancienne chef économiste du Trésor (Direction générale du Trésor, 2020-2023)",
      'professeure associée à Paris 1 Panthéon-Sorbonne / Paris School of Economics (en disponibilité)',
      'ancienne directrice du CEPII (2012-2018)',
    ],
    bio:
      "Économiste spécialisée en macroéconomie internationale, Agnès Bénassy-Quéré a " +
      "dirigé le CEPII (2012-2018) avant d'exercer comme chef économiste de la Direction " +
      "générale du Trésor (2020-2023). Nommée 2e sous-gouverneure de la Banque de France " +
      "en 2023, elle siège au Conseil des gouverneurs de la BCE.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Agn%C3%A8s_B%C3%A9nassy-Qu%C3%A9r%C3%A9',
    wikidataId: 'Q2826972',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q20089495 (vérifié Special:EntityData, P39 CEO Crédit Agricole SA
    //           2015-05 → 2025-05) + Wikipédia FR + presse : Valérie Baudson lui succède (2025).
    nom: 'Brassac',
    prenom: 'Philippe',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: 'Ancien directeur général de Crédit Agricole SA (2015-2025)',
    rolesSecondaires: [
      'ex-directeur général du Crédit Agricole Pyrénées Gascogne',
      'ex-président de la Fédération bancaire française (FBF)',
    ],
    bio:
      "Philippe Brassac a dirigé Crédit Agricole SA de mai 2015 à mai 2025, conduisant " +
      "la transformation numérique et le développement international du groupe. " +
      "Lors de son mandat, il a également présidé la Fédération bancaire française. " +
      "Valérie Baudson lui a succédé à la direction générale en 2025.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Philippe_Brassac',
    wikidataId: 'Q20089495',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3308806 (vérifié wbsearchentities) + Wikipédia FR (Michel-Édouard Leclerc)
    //           Président du Mouvement E.Leclerc (association ACDLec, Q1273376).
    nom: 'Leclerc',
    prenom: 'Michel-Édouard',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: 'Président du Mouvement E.Leclerc (ACDLec)',
    rolesSecondaires: [
      'fils fondateur-héritier du réseau E.Leclerc fondé par Édouard Leclerc',
      'personnalité médiatique de la grande distribution française',
    ],
    bio:
      "Fils du fondateur Édouard Leclerc, Michel-Édouard Leclerc préside le Mouvement " +
      "E.Leclerc (association des centres distributeurs E.Leclerc, ACDLec), réseau " +
      "coopératif de grande distribution implanté en France et à l'étranger. " +
      "Personnalité publique régulièrement auditionné au Parlement sur les prix et l'inflation.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Michel-%C3%89douard_Leclerc',
    wikidataId: 'Q3308806',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q195993 (vérifié Special:EntityData — P108 L'Oréal, P39 CEO 2011-2021
    //           puis Chairman depuis 2022-04-07) + Wikipédia FR + L'Oréal officiel (URD).
    nom: 'Agon',
    prenom: 'Jean-Paul',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1956-07-06'),
    lieuNaissance: null,
    rolePrincipal: "Président du conseil d'administration de L'Oréal (depuis 2022)",
    rolesSecondaires: [
      "ex-directeur général de L'Oréal (2011-2021)",
      "ex-PDG de L'Oréal (Président du CA + DG, 2006-2011)",
    ],
    bio:
      "Jean-Paul Agon a rejoint L'Oréal en 1978. Après avoir dirigé les filiales Asie " +
      "et Amérique du Nord, il devient DG en mars 2011 puis Président du conseil " +
      "d'administration le 7 avril 2022, succédant à Nicolas Hieronimus à la direction " +
      "générale. Sous sa direction (2006-2021), le chiffre d'affaires a doublé.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Paul_Agon',
    wikidataId: 'Q195993',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q16269527 (vérifié Wikipédia FR : https://fr.wikipedia.org/wiki/Rémy_Weber)
    //           + communiqué La Banque Postale (22 juil. 2020 : départ) + Magazine Décideurs.
    //           NB : demandé sous « Rémi Weber » dans le brief — orthographe correcte : Rémy Weber.
    //           Président du Directoire de La Banque Postale du 15 oct. 2013 au 3 août 2020.
    nom: 'Weber',
    prenom: 'Rémy',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1957-11-18'),
    lieuNaissance: 'Strasbourg (Bas-Rhin)',
    rolePrincipal: 'Ancien président du Directoire de La Banque Postale (2013-2020)',
    rolesSecondaires: [
      'ex-directeur général de Lyonnaise de Banque puis de CIC-Lyonnaise de Banque (1999-2010)',
      "chevalier de la Légion d'honneur",
    ],
    bio:
      "Diplômé d'IEP Aix-en-Provence (1979) et d'HEC (1982), Rémy Weber a exercé au " +
      "Trésor puis dirigé Lyonnaise de Banque. Il préside le Directoire de La Banque " +
      "Postale du 15 octobre 2013 au 3 août 2020, date à laquelle il part en raison " +
      "d'une divergence de vues sur la gouvernance de CNP Assurances.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/R%C3%A9my_Weber',
    wikidataId: 'Q16269527',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q15067369 (vérifié wbsearchentities : "chairman and CEO of Accenture")
    //           + Wikipédia FR + Accenture officiel (nécrologie, jan. 2019).
    //           PDG d'Accenture du 1er oct. 2010 au 31 jan. 2019 (décès).
    nom: 'Nanterme',
    prenom: 'Pierre',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: "Ancien président-directeur général d'Accenture (décédé le 31 janvier 2019)",
    rolesSecondaires: [
      "ex-responsable du pôle Ressources d'Accenture",
      'ex-président du conseil consultatif du Forum économique mondial (Davos)',
    ],
    bio:
      "Pierre Nanterme a passé l'intégralité de sa carrière chez Accenture, dont il " +
      "devient PDG (Chairman & CEO) le 1er octobre 2010. Il conduit la transformation " +
      "numérique du cabinet de conseil et engage Accenture dans les services cloud et " +
      "l'IA. Il décède le 31 janvier 2019 des suites d'un cancer.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Pierre_Nanterme',
    wikidataId: 'Q15067369',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q984266 (vérifié Special:EntityData — P108 Société Générale DG
    //           2008-05-13 → 2023-05-23) + Sanofi officiel (Président CA depuis 25 mai 2023)
    //           + Wikipédia FR.
    //           Sanofi est également traité par le pilote CAC40 — l'upsert de Sanofi fusionnera.
    nom: "Oudéa",
    prenom: "Frédéric",
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-07-03'),
    lieuNaissance: null,
    rolePrincipal: "Président du conseil d'administration de Sanofi (depuis 2023)",
    rolesSecondaires: [
      'ex-directeur général de Société Générale (2008-2023)',
      'ex-PDG de Société Générale (Président et DG, 2009-2015)',
      "diplômé de l'École polytechnique et de l'ENA",
    ],
    bio:
      "Polytechnicien et énarque, Frédéric Oudéa entre à Société Générale en 1995 " +
      "et en devient DG le 13 mai 2008, puis PDG (2009-2015) et DG seul jusqu'au " +
      "23 mai 2023. Il préside depuis le 25 mai 2023 le conseil d'administration de " +
      "Sanofi, succédant à Serge Weinberg.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Oud%C3%A9a',
    wikidataId: 'Q984266',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q2360382 (vérifié Special:EntityData — P108 Orange, PDG fév. 2011 → avr. 2022)
    //           + France24 (30 juin 2025 — statut judiciaire) + Wikipédia FR.
    //
    // VOLET JUDICIAIRE (présomption d'innocence — statut procédural à la date de la source) :
    // Selon France24 (30 juin 2025), la cour d'appel de Paris, saisie en juridiction de renvoi
    // après cassation partielle, a condamné Stéphane Richard à 6 mois d'emprisonnement avec
    // sursis et 15 000 € d'amende pour NÉGLIGENCE dans l'affaire de l'arbitrage Tapie (2008).
    // L'infraction initiale de complicité de détournement de fonds publics a été requalifiée ;
    // cette décision ne vaut pas condamnation pour complicité. Un pourvoi en cassation
    // restait possible à la date de la source. Statut : condamné pour négligence (non définitif
    // avec certitude à la date de consultation).
    nom: 'Richard',
    prenom: "Stéphane",
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: "Ancien président-directeur général d'Orange (2011-2022)",
    rolesSecondaires: [
      "ancien directeur de cabinet de Christine Lagarde au ministère de l'Économie (2007-2011)",
      "ancien directeur général de la SEMEA (filiale Alcatel)",
    ],
    bio:
      "Ancien directeur de cabinet de Christine Lagarde (2007-2011), Stéphane Richard " +
      "a présidé Orange de février 2011 à avril 2022. Selon France24 (30 juin 2025), " +
      "la cour d'appel de Paris (juridiction de renvoi) l'a condamné à 6 mois de prison " +
      "avec sursis et 15 000 € d'amende pour négligence dans l'affaire de l'arbitrage Tapie " +
      "(2008) ; l'infraction de complicité de détournement avait été requalifiée.",
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/St%C3%A9phane_Richard_(homme_d%27affaires)',
    wikidataId: 'Q2360382',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q1509045 (vérifié Special:EntityData — P39 DG Carrefour depuis
    //           2012-06-18, organisation Q217599) + Wikipédia FR.
    //           PDG de Carrefour de juin 2012 à juillet 2017 (successeur : Alexandre Bompard).
    nom: 'Plassat',
    prenom: 'Georges',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1949-03-25'),
    lieuNaissance: null,
    rolePrincipal: 'Ancien président-directeur général de Carrefour (2012-2017)',
    rolesSecondaires: [
      'ex-PDG de Vivarte (groupe chaussures/textile)',
      'ex-PDG de Dia (enseigne discount espagnole)',
    ],
    bio:
      "Georges Plassat a dirigé plusieurs grands groupes de distribution avant de prendre " +
      "la présidence de Carrefour le 18 juin 2012. Sous son mandat, il a engagé le " +
      "recentrage sur la grande distribution alimentaire et la cession d'actifs non " +
      "stratégiques. Alexandre Bompard lui succède en juillet 2017.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Georges_Plassat',
    wikidataId: 'Q1509045',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q2865328 (vérifié wbsearchentities : "French businessman")
    //           + Publicis officiel (publicis.com — fiche dirigeant) + Wikipédia FR.
    //           Président du Directoire de Publicis Groupe depuis juin 2017, succédant à Maurice Lévy.
    nom: 'Sadoun',
    prenom: 'Arthur',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: 'Président du Directoire de Publicis Groupe (depuis 2017)',
    rolesSecondaires: [
      "ex-PDG de Publicis Worldwide (réseau d'agences opérationnel)",
      'ex-directeur général de Publicis Conseil',
    ],
    bio:
      "Arthur Sadoun a gravi tous les échelons de Publicis depuis les années 1990, " +
      "dirigeant Publicis Conseil puis Publicis Worldwide. Il est nommé Président du " +
      "Directoire de Publicis Groupe en juin 2017, succédant à Maurice Lévy. " +
      "Il pilote la stratégie d'acquisitions numériques du groupe (Epsilon, Sapient).",
    wikipediaUrl: null,
    wikidataId: 'Q2865328',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q1347130 (vérifié wbsearchentities : "French businessman (born 1942)")
    //           + Publicis officiel + Wikipédia FR.
    //           PDG de Publicis de 1987 à juin 2017 ; Président du Conseil de Surveillance depuis juin 2017.
    nom: "Lévy",
    prenom: 'Maurice',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: 'Président du Conseil de Surveillance de Publicis Groupe (depuis 2017)',
    rolesSecondaires: [
      'ex-PDG de Publicis Groupe (1987-2017 — 30 ans à la tête du groupe)',
      "président de la Commission nationale du numérique (France, 2011)",
    ],
    bio:
      "Maurice Lévy a dirigé Publicis Groupe pendant trente ans (1987-2017), le " +
      "transformant en quatrième groupe mondial de communication par une politique " +
      "d'acquisitions (Saatchi & Saatchi, Leo Burnett, Digitas). Il préside depuis " +
      "juin 2017 le Conseil de Surveillance de Publicis Groupe.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Maurice_L%C3%A9vy',
    wikidataId: 'Q1347130',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q806950 (vérifié wbsearchentities : "central bank of France")
    //           + banque-france.fr (site officiel)
    nom: 'Banque de France',
    sigle: 'BdF',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.banque-france.fr',
    description:
      "Banque centrale nationale française, membre de l'Eurosystème et du Système " +
      "européen de banques centrales (SEBC). Fondée en 1800, indépendante depuis 1994. " +
      "Gouverneur : Emmanuel Moulin depuis le 2 juin 2026 (décret du 27 mai 2026) ; " +
      "ex-gouverneur honoraire : François Villeroy de Galhau (2015-2026).",
    dateCreation: new Date('1800-01-18'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Banque_de_France',
    wikidataId: 'Q806950',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q590952 (vérifié wbsearchentities : "international cooperative financial group")
    //           + Wikipédia FR (Crédit Agricole) + URD Crédit Agricole SA.
    //           Philippe Brassac DG de la SA cotée (entité fille du groupe mutualiste) mai 2015 - mai 2025.
    nom: 'Crédit Agricole SA',
    sigle: 'CASA',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.credit-agricole.com',
    description:
      "Société anonyme cotée (CAC 40) représentant la tête de réseau du groupe " +
      "Crédit Agricole, premier groupe bancaire coopératif mondial. DG : Philippe " +
      "Brassac (mai 2015 - mai 2025), remplacé par Valérie Baudson en 2025.",
    dateCreation: new Date('2001-12-20'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Cr%C3%A9dit_Agricole',
    wikidataId: 'Q590952',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q156077 (vérifié wbsearchentities)
    //           + Wikipédia FR (L'Oréal) + L'Oréal URD (Document de référence annuel).
    nom: "L'Oréal",
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.loreal.com',
    description:
      "Premier groupe mondial de cosmétiques, fondé en 1909 par Eugène Schueller. " +
      "Coté au CAC 40. Famille Bettencourt Meyers actionnaire principal (~33 %). " +
      "Jean-Paul Agon : DG (2011-2021), Président du CA (depuis avr. 2022).",
    dateCreation: new Date('1909-07-30'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/L%27Or%C3%A9al',
    wikidataId: 'Q156077',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1273376 (vérifié Wikipédia FR : https://fr.wikipedia.org/wiki/E.Leclerc)
    //           + site officiel Mouvement E.Leclerc.
    nom: 'Mouvement E.Leclerc',
    sigle: 'ACDLec',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.mouvement-leclerc.com',
    description:
      "Réseau coopératif de grande distribution fondé par Édouard Leclerc en 1949. " +
      "Regroupe les centres distributeurs E.Leclerc (CDs) au sein de l'association " +
      "ACDLec (Association des centres distributeurs E.Leclerc). " +
      "Président : Michel-Édouard Leclerc.",
    dateCreation: new Date('1949-12-25'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/E.Leclerc',
    wikidataId: 'Q1273376',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3206431 (vérifié wbsearchentities : "French postal bank")
    //           + labanquepostale.com + communiqué départ Rémy Weber (22 juil. 2020).
    nom: 'La Banque Postale',
    sigle: 'LBP',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.labanquepostale.com',
    description:
      "Banque de détail française créée en 2006, filiale du Groupe La Poste. " +
      "Rémy Weber en a présidé le Directoire du 15 octobre 2013 au 3 août 2020. " +
      "En 2020, La Banque Postale a acquis le contrôle de CNP Assurances.",
    dateCreation: new Date('2006-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/La_Banque_Postale',
    wikidataId: 'Q3206431',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1431486 (vérifié Wikipédia FR : orange.com, Q1431486)
    //           + orange.com (site officiel) + Stéphane Richard : PDG fév. 2011 → avr. 2022.
    nom: 'Orange SA',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.orange.com',
    description:
      "Opérateur de télécommunications français (anciennement France Télécom). " +
      "Coté au CAC 40 (ticker : ORA). PDG Stéphane Richard (fév. 2011 - avr. 2022), " +
      "Christel Heydemann PDG depuis avril 2022. CA 2024 : 40,3 Mds€.",
    dateCreation: new Date('1988-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Orange_(entreprise)',
    wikidataId: 'Q1431486',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q217599 (vérifié wbsearchentities) + Wikipédia FR (Carrefour)
    //           + Georges Plassat PDG juin 2012 - juil. 2017.
    nom: 'Carrefour SA',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.carrefour.com',
    description:
      "Deuxième groupe mondial de distribution alimentaire, fondé en 1958 à Annecy. " +
      "Coté au CAC 40. PDG : Georges Plassat (2012-2017), puis Alexandre Bompard (2017-). " +
      "Présent dans plus de 30 pays.",
    dateCreation: new Date('1958-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Carrefour_(entreprise)',
    wikidataId: 'Q217599',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1537378 (vérifié wbsearchentities : "French multinational advertising")
    //           + publicis.com (site officiel) + Wikipédia FR (Publicis Groupe).
    nom: 'Publicis Groupe',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.publicisgroupe.com',
    description:
      "Quatrième groupe mondial de communication et de services marketing, fondé en 1926. " +
      "Coté à Euronext Paris (CAC 40). Structure : Directoire (Président : Arthur Sadoun) " +
      "et Conseil de Surveillance (Président : Maurice Lévy). " +
      "Acquisitions clés : Sapient (2014), Epsilon (2019).",
    dateCreation: new Date('1926-08-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Publicis_Groupe',
    wikidataId: 'Q1537378',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q158205 (vérifié wbsearchentities : "French pharmaceutical company")
    //           + sanofi.com + Wikipédia FR (Sanofi).
    //           NB : Sanofi est traité par le pilote CAC40 en parallèle — upsert fusionnera.
    //           Frédéric Oudéa : Président du CA depuis le 25 mai 2023.
    nom: 'Sanofi',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.sanofi.com',
    description:
      "Multinationale pharmaceutique française, l'une des premières mondiales " +
      "(vaccins, maladies rares, oncologie). Cotée au CAC 40 et au NYSE. " +
      "Président du CA : Frédéric Oudéa (depuis mai 2023). " +
      "NB : entité également référencée par le seed CAC40 parallèle — upsert fusionnera.",
    dateCreation: new Date('2004-08-20'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Sanofi',
    wikidataId: 'Q158205',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q338825 (vérifié Wikipédia FR : accenture.com)
    //           + Accenture officiel + Pierre Nanterme PDG oct. 2010 - jan. 2019.
    nom: 'Accenture',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'Irlande',
    siteWeb: 'https://www.accenture.com',
    description:
      "Cabinet mondial de conseil en management, technologies et externalisation " +
      "(siège légal en Irlande, fondé en 1989 sous le nom Andersen Consulting). " +
      "PDG : Pierre Nanterme (oct. 2010 - jan. 2019), Julie Sweet depuis 2019. " +
      "CA 2023 : 64,1 Mds$.",
    dateCreation: new Date('1989-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Accenture',
    wikidataId: 'Q338825',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q270363 (vérifié wbsearchentities : "French multinational banking")
    //           + Wikipédia FR (Société Générale) + URD SocGen.
    //           Frédéric Oudéa : DG mai 2008 - mai 2023 (puis Slawomir Krupa succède).
    nom: "Société Générale",
    sigle: 'SocGen',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.societegenerale.com',
    description:
      "Banque universelle française fondée en 1864, cotée au CAC 40 (ticker : GLE). " +
      "DG : Frédéric Oudéa (2008-2023), Slawomir Krupa depuis mai 2023. " +
      "Présente dans 62 pays ; CA 2023 : ~25 Mds€ (PNB).",
    dateCreation: new Date('1864-05-04'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Soci%C3%A9t%C3%A9_G%C3%A9n%C3%A9rale',
    wikidataId: 'Q270363',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-06-30).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_villeroy: {
    url: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Villeroy_de_Galhau',
    titre: 'François Villeroy de Galhau — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 24 fév. 1959 ; gouverneur de la Banque de France du 1er nov. 2015 au 2 juin 2026. " +
      "ENA, HEC ; ex-DGFiP (2012-2015).",
    verifiee: true,
  },
  jorf_moulin_2026: {
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054144652',
    titre: "Décret du 27 mai 2026 portant nomination du Gouverneur de la Banque de France — M. MOULIN (Emmanuel)",
    media: "Légifrance (JORF)",
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-05-27'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Premier ministre',
    description:
      "Décret officiel nommant Emmanuel Moulin gouverneur de la Banque de France, " +
      "prenant effet le 2 juin 2026 et mettant fin au mandat de Villeroy de Galhau.",
    verifiee: true,
  },
  bdf_denis_beau: {
    url: 'https://www.banque-france.fr/fr/sous-gouverneur',
    titre: "Sous-gouverneurs de la Banque de France — Banque de France (officiel)",
    media: 'Banque de France',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: null,
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Banque de France',
    description:
      "Page officielle listant les sous-gouverneurs en poste : Denis Beau (1er sous-gouverneur, " +
      "depuis août 2017) et Agnès Bénassy-Quéré (2e sous-gouverneure).",
    verifiee: true,
  },
  wp_denis_beau: {
    url: 'https://fr.wikipedia.org/wiki/Denis_Beau',
    titre: 'Denis Beau — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 21 nov. 1962. 2e sous-gouverneur BdF depuis août 2017, 1er depuis jan. 2018. " +
      "Représente le gouverneur à l'ACPR ; membre du Conseil de surveillance BCE.",
    verifiee: true,
  },
  wp_benassy_quere: {
    url: 'https://fr.wikipedia.org/wiki/Agn%C3%A8s_B%C3%A9nassy-Qu%C3%A9r%C3%A9',
    titre: "Agnès Bénassy-Quéré — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Née le 15 mars 1966. Économiste, ex-directrice CEPII (2012-2018), ex-chef économiste " +
      "du Trésor (2020-2023), 2e sous-gouverneure BdF depuis 2023.",
    verifiee: true,
  },
  wp_brassac: {
    url: 'https://fr.wikipedia.org/wiki/Philippe_Brassac',
    titre: 'Philippe Brassac — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "DG Crédit Agricole SA de mai 2015 à mai 2025. Successeur : Valérie Baudson. " +
      "Ex-président de la Fédération bancaire française.",
    verifiee: true,
  },
  wp_mel: {
    url: 'https://fr.wikipedia.org/wiki/Michel-%C3%89douard_Leclerc',
    titre: 'Michel-Édouard Leclerc — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Fils d'Édouard Leclerc, président du Mouvement E.Leclerc (ACDLec). " +
      "Figure de la grande distribution française, régulièrement auditionné au Parlement.",
    verifiee: true,
  },
  wp_agon: {
    url: 'https://fr.wikipedia.org/wiki/Jean-Paul_Agon',
    titre: "Jean-Paul Agon — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 6 juil. 1956. DG L'Oréal mars 2011 - mai 2021, Président CA depuis avr. 2022. " +
      "Sous son mandat le CA du groupe a doublé.",
    verifiee: true,
  },
  wp_remy_weber: {
    url: 'https://fr.wikipedia.org/wiki/R%C3%A9my_Weber',
    titre: 'Rémy Weber — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 18 nov. 1957 à Strasbourg. IEP Aix + HEC. Président du Directoire La Banque " +
      "Postale du 15 oct. 2013 au 3 août 2020 ; départ pour divergence de vues sur CNP Assurances.",
    verifiee: true,
  },
  cp_weber_depart: {
    url: 'https://www.labanquepostale.com/content/dam/lbp/documents/investisseurs/info-reglementee/cp/2020/CP-La-Banque_Postale-Remy-Weber.pdf',
    titre: "Rémy Weber quitte la présidence du Directoire de La Banque Postale — Communiqué officiel",
    media: 'La Banque Postale',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2020-07-22'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'La Banque Postale',
    description:
      "Communiqué officiel de La Banque Postale confirmant le départ de Rémy Weber le " +
      "3 août 2020, en raison d'une divergence de vues sur la gouvernance de CNP Assurances.",
    verifiee: true,
  },
  wp_nanterme: {
    url: 'https://fr.wikipedia.org/wiki/Pierre_Nanterme',
    titre: 'Pierre Nanterme — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "PDG d'Accenture du 1er oct. 2010 au 31 jan. 2019 (décès). " +
      "A transformé Accenture en leader des services numériques.",
    verifiee: true,
  },
  wp_oudea: {
    url: 'https://fr.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Oud%C3%A9a',
    titre: "Frédéric Oudéa — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 3 juil. 1963. DG Société Générale mai 2008 - mai 2023. " +
      "Polytechnicien et énarque.",
    verifiee: true,
  },
  sanofi_oudea: {
    url: 'https://www.sanofi.com/en/media-room/press-releases/2023/2023-05-25-16-10-27-2676497',
    titre: "Frédéric Oudéa nouveau Président du Conseil d'administration de Sanofi — Sanofi (officiel)",
    media: 'Sanofi',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2023-05-25'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Sanofi',
    description:
      "Communiqué officiel : Frédéric Oudéa nommé Président du Conseil d'administration " +
      "de Sanofi le 25 mai 2023, succédant à Serge Weinberg.",
    verifiee: true,
  },
  france24_richard: {
    url: 'https://www.france24.com/fr/info-en-continu/20250630-arbitrage-tapie-l-ex-patron-d-orange-st%C3%A9phane-richard-condamn%C3%A9-%C3%A0-six-mois-de-prison-avec-sursis',
    titre: "Arbitrage Tapie : l'ex-patron d'Orange Stéphane Richard condamné à six mois de prison avec sursis — France24",
    media: 'France24',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-06-30'),
    dateConsultation: new Date('2026-06-30'),
    auteur: "Rédaction France24",
    description:
      "Cour d'appel de Paris (renvoi après cassation partielle) : Stéphane Richard condamné " +
      "à 6 mois de prison avec sursis et 15 000 € d'amende pour négligence dans l'affaire " +
      "Tapie. Infraction requalifiée ; pas de condamnation pour complicité de détournement.",
    verifiee: true,
  },
  wp_richard: {
    url: 'https://fr.wikipedia.org/wiki/St%C3%A9phane_Richard_(homme_d%27affaires)',
    titre: "Stéphane Richard (homme d'affaires) — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Ex-directeur de cabinet de Christine Lagarde (2007-2011). PDG d'Orange " +
      "de fév. 2011 à avr. 2022. Affaire de l'arbitrage Tapie documentée.",
    verifiee: true,
  },
  wp_plassat: {
    url: 'https://fr.wikipedia.org/wiki/Georges_Plassat',
    titre: 'Georges Plassat — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 25 mars 1949. PDG de Carrefour de juin 2012 à juillet 2017. " +
      "Ex-PDG de Vivarte et de Dia.",
    verifiee: true,
  },
  publicis_sadoun: {
    url: 'https://www.publicisgroupe.com/en/the-group/governance/management-board',
    titre: "Arthur Sadoun, Président du Directoire — Publicis Groupe (officiel)",
    media: 'Publicis Groupe',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: null,
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Publicis Groupe',
    description:
      "Fiche officielle d'Arthur Sadoun, Président du Directoire de Publicis Groupe " +
      "depuis juin 2017, ex-PDG de Publicis Worldwide.",
    verifiee: true,
  },
  wp_maurice_levy: {
    url: 'https://fr.wikipedia.org/wiki/Maurice_L%C3%A9vy',
    titre: "Maurice Lévy — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né en 1942. PDG de Publicis Groupe de 1987 à 2017 (30 ans). " +
      "Président du Conseil de Surveillance depuis juin 2017.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002), exactement 1 entité non-nulle de chaque côté.
// Chaque entité référencée possède un wikidataId (résolution via trouverEntite).
// ---------------------------------------------------------------------------

const LIENS = [
  // =========================================================================
  // BANQUE DE FRANCE — gouverneur + sous-gouverneurs
  // =========================================================================
  {
    // P-O : Villeroy de Galhau → Banque de France (gouverneur 2015-2026, mandat terminé)
    aType: 'personne',
    aRef: 'Q3086015',
    bType: 'organisation',
    bRef: 'Q806950',
    typeLienCode: 'DIRIGEANT',
    description:
      "François Villeroy de Galhau a été gouverneur de la Banque de France du 1er novembre 2015 " +
      "au 2 juin 2026, date d'entrée en fonctions d'Emmanuel Moulin (décret du 27 mai 2026).",
    dateDebut: new Date('2015-11-01'),
    dateFin: new Date('2026-06-02'),
    sourceRef: 'jorf_moulin_2026',
  },
  {
    // P-O : Denis Beau → Banque de France (1er sous-gouverneur depuis août 2017)
    aType: 'personne',
    aRef: 'Q55596606',
    bType: 'organisation',
    bRef: 'Q806950',
    typeLienCode: 'DIRIGEANT',
    description:
      "Denis Beau est 1er sous-gouverneur de la Banque de France depuis janvier 2018 " +
      "(nommé 2e sous-gouverneur le 1er août 2017, renouvelé en janvier 2024). " +
      "Il représente le gouverneur à l'ACPR et siège au Conseil de surveillance de la BCE.",
    dateDebut: new Date('2017-08-01'),
    dateFin: null,
    sourceRef: 'bdf_denis_beau',
  },
  {
    // P-O : Bénassy-Quéré → Banque de France (2e sous-gouverneure depuis 2023)
    aType: 'personne',
    aRef: 'Q2826972',
    bType: 'organisation',
    bRef: 'Q806950',
    typeLienCode: 'DIRIGEANT',
    description:
      "Agnès Bénassy-Quéré est 2e sous-gouverneure de la Banque de France depuis 2023 " +
      "(après son départ de la Direction générale du Trésor en février 2023). " +
      "Elle siège au Conseil des gouverneurs de la BCE.",
    dateDebut: new Date('2023-04-01'),
    dateFin: null,
    sourceRef: 'bdf_denis_beau',
  },

  // =========================================================================
  // CRÉDIT AGRICOLE
  // =========================================================================
  {
    // P-O : Philippe Brassac → Crédit Agricole SA (DG mai 2015 - mai 2025)
    aType: 'personne',
    aRef: 'Q20089495',
    bType: 'organisation',
    bRef: 'Q590952',
    typeLienCode: 'DIRIGEANT',
    description:
      "Philippe Brassac a été directeur général de Crédit Agricole SA de mai 2015 à mai 2025. " +
      "Il a conduit la transformation numérique et internationale du groupe. " +
      "Valérie Baudson lui succède en 2025.",
    dateDebut: new Date('2015-05-01'),
    dateFin: new Date('2025-05-01'),
    sourceRef: 'wp_brassac',
  },

  // =========================================================================
  // E.LECLERC
  // =========================================================================
  {
    // P-O : Michel-Édouard Leclerc → Mouvement E.Leclerc (président)
    aType: 'personne',
    aRef: 'Q3308806',
    bType: 'organisation',
    bRef: 'Q1273376',
    typeLienCode: 'DIRIGEANT',
    description:
      "Michel-Édouard Leclerc préside le Mouvement E.Leclerc (association ACDLec), " +
      "réseau coopératif de grande distribution fondé par son père Édouard Leclerc en 1949.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_mel',
  },

  // =========================================================================
  // L'ORÉAL
  // =========================================================================
  {
    // P-O : Jean-Paul Agon → L'Oréal (ex-DG 2011-2021)
    aType: 'personne',
    aRef: 'Q195993',
    bType: 'organisation',
    bRef: 'Q156077',
    typeLienCode: 'DIRIGEANT',
    description:
      "Jean-Paul Agon a été directeur général de L'Oréal du 17 mars 2011 au 1er mai 2021, " +
      "date à laquelle Nicolas Hieronimus lui a succédé. Sous son mandat, le CA du groupe a doublé.",
    dateDebut: new Date('2011-03-17'),
    dateFin: new Date('2021-05-01'),
    sourceRef: 'wp_agon',
  },
  {
    // P-O : Jean-Paul Agon → L'Oréal (Président du CA depuis avr. 2022)
    aType: 'personne',
    aRef: 'Q195993',
    bType: 'organisation',
    bRef: 'Q156077',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Jean-Paul Agon est Président du conseil d'administration de L'Oréal depuis le 7 avril 2022, " +
      "mandat non exécutif distinct de la direction générale exercée par Nicolas Hieronimus.",
    dateDebut: new Date('2022-04-07'),
    dateFin: null,
    sourceRef: 'wp_agon',
  },

  // =========================================================================
  // LA BANQUE POSTALE
  // =========================================================================
  {
    // P-O : Rémy Weber → La Banque Postale (Président du Directoire 2013-2020)
    aType: 'personne',
    aRef: 'Q16269527',
    bType: 'organisation',
    bRef: 'Q3206431',
    typeLienCode: 'DIRIGEANT',
    description:
      "Rémy Weber a présidé le Directoire de La Banque Postale du 15 octobre 2013 " +
      "au 3 août 2020. Son départ fait suite à une divergence de vues sur la gouvernance " +
      "de CNP Assurances, acquise par La Banque Postale en mars 2020.",
    dateDebut: new Date('2013-10-15'),
    dateFin: new Date('2020-08-03'),
    sourceRef: 'cp_weber_depart',
  },

  // =========================================================================
  // ACCENTURE
  // =========================================================================
  {
    // P-O : Pierre Nanterme → Accenture (PDG oct. 2010 - jan. 2019)
    aType: 'personne',
    aRef: 'Q15067369',
    bType: 'organisation',
    bRef: 'Q338825',
    typeLienCode: 'DIRIGEANT',
    description:
      "Pierre Nanterme a été Chairman & CEO d'Accenture du 1er octobre 2010 jusqu'à " +
      "son décès le 31 janvier 2019. Il a conduit la transformation numérique du cabinet " +
      "et engagé Accenture dans les services cloud et l'intelligence artificielle.",
    dateDebut: new Date('2010-10-01'),
    dateFin: new Date('2019-01-31'),
    sourceRef: 'wp_nanterme',
  },

  // =========================================================================
  // SOCIÉTÉ GÉNÉRALE + SANOFI (Frédéric Oudéa)
  // =========================================================================
  {
    // P-O : Frédéric Oudéa → Société Générale (DG 2008-2023)
    aType: 'personne',
    aRef: 'Q984266',
    bType: 'organisation',
    bRef: 'Q270363',
    typeLienCode: 'DIRIGEANT',
    description:
      "Frédéric Oudéa a été directeur général de Société Générale du 13 mai 2008 " +
      "au 23 mai 2023 (PDG de 2009 à 2015, puis DG seul). " +
      "Slawomir Krupa lui succède à la DG en mai 2023.",
    dateDebut: new Date('2008-05-13'),
    dateFin: new Date('2023-05-23'),
    sourceRef: 'wp_oudea',
  },
  {
    // P-O : Frédéric Oudéa → Sanofi (Président du CA depuis mai 2023)
    aType: 'personne',
    aRef: 'Q984266',
    bType: 'organisation',
    bRef: 'Q158205',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Frédéric Oudéa est Président du conseil d'administration de Sanofi depuis le 25 mai 2023, " +
      "succédant à Serge Weinberg dont le mandat expirait à l'issue de l'Assemblée générale.",
    dateDebut: new Date('2023-05-25'),
    dateFin: null,
    sourceRef: 'sanofi_oudea',
  },

  // =========================================================================
  // ORANGE (Stéphane Richard)
  // =========================================================================
  {
    // P-O : Stéphane Richard → Orange (PDG fév. 2011 - avr. 2022)
    // Volet judiciaire noté dans le commentaire de la personne et dans la bio.
    // Statut procédural à la date de la source (France24, 30 juin 2025) :
    // condamné pour négligence (6 mois sursis + 15 000 €) — pas de condamnation pour complicité.
    aType: 'personne',
    aRef: 'Q2360382',
    bType: 'organisation',
    bRef: 'Q1431486',
    typeLienCode: 'DIRIGEANT',
    description:
      "Stéphane Richard a présidé Orange du 24 février 2011 au 4 avril 2022. " +
      "Christel Heydemann lui succède. Par ailleurs, selon France24 (30 juin 2025), la cour " +
      "d'appel de Paris (juridiction de renvoi) l'a condamné à 6 mois de prison avec sursis " +
      "et 15 000 € d'amende pour négligence dans l'affaire de l'arbitrage Tapie (2008).",
    dateDebut: new Date('2011-02-24'),
    dateFin: new Date('2022-04-04'),
    sourceRef: 'france24_richard',
  },

  // =========================================================================
  // CARREFOUR
  // =========================================================================
  {
    // P-O : Georges Plassat → Carrefour (PDG juin 2012 - juil. 2017)
    aType: 'personne',
    aRef: 'Q1509045',
    bType: 'organisation',
    bRef: 'Q217599',
    typeLienCode: 'DIRIGEANT',
    description:
      "Georges Plassat a présidé Carrefour du 18 juin 2012 à juillet 2017, " +
      "engageant le recentrage sur la grande distribution alimentaire et la cession " +
      "d'actifs non stratégiques. Alexandre Bompard lui succède en juillet 2017.",
    dateDebut: new Date('2012-06-18'),
    dateFin: new Date('2017-07-01'),
    sourceRef: 'wp_plassat',
  },

  // =========================================================================
  // PUBLICIS GROUPE
  // =========================================================================
  {
    // P-O : Arthur Sadoun → Publicis Groupe (Président du Directoire depuis juin 2017)
    aType: 'personne',
    aRef: 'Q2865328',
    bType: 'organisation',
    bRef: 'Q1537378',
    typeLienCode: 'DIRIGEANT',
    description:
      "Arthur Sadoun est Président du Directoire de Publicis Groupe depuis juin 2017, " +
      "succédant à Maurice Lévy. Il pilote la stratégie d'acquisitions numériques " +
      "(Epsilon 2019, Sapient 2014) et la transformation en « Power of One ».",
    dateDebut: new Date('2017-06-01'),
    dateFin: null,
    sourceRef: 'publicis_sadoun',
  },
  {
    // P-O : Maurice Lévy → Publicis Groupe (ex-PDG 1987-2017)
    aType: 'personne',
    aRef: 'Q1347130',
    bType: 'organisation',
    bRef: 'Q1537378',
    typeLienCode: 'DIRIGEANT',
    description:
      "Maurice Lévy a dirigé Publicis Groupe pendant trente ans (1987-2017), " +
      "le transformant en quatrième groupe mondial de communication par des acquisitions " +
      "majeures (Saatchi & Saatchi, Leo Burnett, Digitas, Razorfish).",
    dateDebut: new Date('1987-01-01'),
    dateFin: new Date('2017-06-01'),
    sourceRef: 'wp_maurice_levy',
  },
  {
    // P-O : Maurice Lévy → Publicis Groupe (Président du Conseil de Surveillance depuis juin 2017)
    aType: 'personne',
    aRef: 'Q1347130',
    bType: 'organisation',
    bRef: 'Q1537378',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Maurice Lévy est Président du Conseil de Surveillance de Publicis Groupe depuis juin 2017 " +
      "(date du passage de flambeau à Arthur Sadoun à la tête du Directoire).",
    dateDebut: new Date('2017-06-01'),
    dateFin: null,
    sourceRef: 'publicis_sadoun',
  },
  {
    // P-P : interlock Sadoun → Lévy (Lévy mentor institutionnel de Sadoun à la tête de Publicis)
    // Lien professionnel établi dans le contexte de la succession à la tête de Publicis.
    aType: 'personne',
    aRef: 'Q1347130',
    bType: 'personne',
    bRef: 'Q2865328',
    typeLienCode: 'EMPLOI',
    description:
      "Maurice Lévy a supervisé Arthur Sadoun lors de sa montée en responsabilités au sein " +
      "de Publicis Groupe, avant de lui confier la direction du Directoire en juin 2017.",
    dateDebut: null,
    dateFin: new Date('2017-06-01'),
    sourceRef: 'publicis_sadoun',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-dirigeants-banque] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-dirigeants-banque] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données Dirigeants-Banque précédentes...')
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
  console.log(
    '\n-- seed-dirigeants-banque — Banque de France + Dirigeants FR + Publicis (2026-06-30) --\n',
  )
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok ${data.titre.slice(0, 80)}`)
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
    `Personnes     : ${PERSONNES.length} (Villeroy, D. Beau, Bénassy-Quéré, Brassac, ` +
      `M-É Leclerc, Agon, R. Weber, Nanterme, Oudéa, Richard, Plassat, Sadoun, M. Lévy)`,
  )
  console.log(
    `Organisations : ${ORGANISATIONS.length} (BdF, CA SA, L'Oréal, E.Leclerc, LBP, Orange, ` +
      `Carrefour, Publicis, Sanofi, Accenture, SocGen)`,
  )
  console.log(
    `Sources       : ${Object.keys(SOURCES).length} ` +
      '(Wikipédia FR, Légifrance JORF, BdF officiel, Sanofi officiel, France24, Publicis officiel, LBP communiqué)',
  )
  console.log(
    `Liens         : ${LIENS.length} (DIRIGEANT, ADMINISTRATEUR, EMPLOI)`,
  )
  console.log('')
  console.log('Entités exclues (sans Q-id Wikidata vérifiable) :')
  console.log('  - Michel Abaléa : aucun personnage public identifiable sur sources ouvertes')
  console.log('  - Damien Deleplanque (Adeo) : wbsearchentities vide — Adeo Q2941497 déjà en base')
  console.log('')
}

main()
  .catch((err) => {
    console.error('[seed-dirigeants-banque] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
