/**
 * Seed partenaires sociaux — dirigeants des syndicats, du patronat et grands maîtres des obédiences maçonniques.
 *
 * Sources : Wikidata (Q-ids tous vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR, sites officiels des organisations, communiqués de presse publics.
 *
 * Périmètre :
 *   1. Syndicats de salariés représentatifs : CGT, CFDT, FO, CFE-CGC, CFTC, UNSA, Solidaires.
 *      (FSU exclue : Caroline Chevé, SG depuis fév. 2025, sans Q-id Wikidata vérifié)
 *   2. Patronat : MEDEF, CPME.
 *      (U2P exclue : Michel Picon, président depuis jan. 2024, sans Q-id Wikidata vérifié)
 *   3. Grands maîtres des obédiences maçonniques (FONCTION publique uniquement, jamais appartenance) :
 *      GODF (Pierre Bertinotti, élu août 2025), GLDF (Jean-Raphaël Notton, élu juin 2025).
 *      (GLNF/Yves Pennes, GLFF/Liliane Mirville, Droit Humain/Maurice Leduc exclus : sans Q-id)
 *
 * Art. 9 RGPD — garde-fous :
 *   - JAMAIS de membre ordinaire : uniquement les dirigeants ayant une fonction publiquement annoncée.
 *   - La fonction de grand maître est publique (communiqués officiels des obédiences).
 *   - Toutes les entités importées en statut EN_ATTENTE (ADR-006/010).
 *   - qualiteInfluence obligatoire sur chaque personne.
 *   - Idempotent (upsert par wikidataId). dateConsultation 2026-07-01.
 *
 * Usage :
 *   cd backend && node bin/seed-partenaires-sociaux.js
 *   cd backend && node bin/seed-partenaires-sociaux.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — Q-ids vérifiés via wbsearchentities + Special:EntityData.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q111529069 (confirmé Special:EntityData) + Wikipédia FR
    nom: 'Binet',
    prenom: 'Sophie',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1977-03-16'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Secrétaire générale de la CGT',
    rolesSecondaires: [
      "ancienne secrétaire générale de l'UGICT-CGT (syndicat des cadres)",
      'juriste de formation',
    ],
    bio:
      "Juriste et syndicaliste, Sophie Binet est la première femme à diriger la CGT depuis la fondation " +
      "du syndicat en 1895. Élue secrétaire générale le 31 mars 2023 en succédant à Philippe Martinez, " +
      "elle était auparavant secrétaire générale de l'UGICT-CGT.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Sophie_Binet',
    wikidataId: 'Q111529069',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q55258276 (confirmé via wbsearchentities) + Wikipédia FR + cfdt.fr
    nom: 'Léon',
    prenom: 'Marylise',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1976-11-23'),
    lieuNaissance: 'Le Mans (Sarthe)',
    rolePrincipal: 'Secrétaire générale de la CFDT',
    rolesSecondaires: [
      'ancienne secrétaire générale adjointe de la CFDT',
      'ancienne représentante syndicale chez Hewlett-Packard',
    ],
    bio:
      "Syndicaliste formée dans le secteur de l'informatique, Marylise Léon est secrétaire générale de la CFDT " +
      "depuis le 21 juin 2023, succédant à Laurent Berger. " +
      "Elle est la quatrième femme à diriger la confédération.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Marylise_L%C3%A9on',
    wikidataId: 'Q55258276',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q114673617 (confirmé Special:EntityData, P39 → Q1125623 depuis juin 2022)
    //           + Wikipédia FR + France Info (réélection avril 2025)
    nom: 'Souillot',
    prenom: 'Frédéric',
    pays: 'France',
    nationalite: 'française',
    lieuNaissance: 'Dijon (Côte-d\'Or)',
    rolePrincipal: 'Secrétaire général de la CGT-FO',
    rolesSecondaires: [
      'ancien secrétaire général de FO Métaux',
      'technicien de maintenance pétrolière (Schlumberger, 1994-2022)',
    ],
    bio:
      "Issu de l'industrie pétrolière, Frédéric Souillot est secrétaire général de la CGT-FO depuis juin 2022. " +
      "Il a été réélu pour un deuxième mandat lors du congrès de Dijon en avril 2025, jusqu'en 2030.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Souillot',
    wikidataId: 'Q114673617',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q140191967 (confirmé Special:EntityData, P39 → CFE-CGC depuis juin 2026)
    //           + cfecgc.org (communiqué officiel 10 juin 2026)
    nom: 'Thieffinne',
    prenom: 'Christelle',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: 'Présidente de la CFE-CGC',
    rolesSecondaires: [
      'ancienne responsable de la Fédération de la métallurgie CFE-CGC',
      'ingénieure (Thales AVS, Vendôme)',
    ],
    bio:
      "Ingénieure issue de la Fédération de la métallurgie CFE-CGC, où elle a passé l'essentiel de sa carrière " +
      "chez Thales AVS à Vendôme, Christelle Thieffinne est élue présidente de la CFE-CGC le 10 juin 2026 " +
      "lors du 39e congrès à Strasbourg, succédant à François Hommeril.",
    wikipediaUrl: null,
    wikidataId: 'Q140191967',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q94505285 (confirmé Special:EntityData, P39 → Q1125610 depuis 2019)
    //           + Wikipédia FR + cftc.fr
    nom: 'Chabanier',
    prenom: 'Cyril',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1973-03-28'),
    lieuNaissance: 'Arles (Bouches-du-Rhône)',
    rolePrincipal: 'Président de la CFTC',
    rolesSecondaires: [
      "agent général d'assurances",
      "administrateur de l'Unédic",
    ],
    bio:
      "Agent général d'assurances à Arles, Cyril Chabanier est président de la CFTC depuis 2019 (réélu). " +
      "Il incarne une ligne confessionnelle réformiste et participe activement au dialogue social français, " +
      "notamment à l'Unédic.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Cyril_Chabanier',
    wikidataId: 'Q94505285',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3219206 (confirmé Special:EntityData + Wikipédia FR) + unsa.org
    nom: 'Escure',
    prenom: 'Laurent',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1970-11-17'),
    lieuNaissance: 'Tulle (Corrèze)',
    rolePrincipal: "Secrétaire général de l'UNSA",
    rolesSecondaires: [
      "ancien secrétaire général de l'UNSA Éducation (2012-2019)",
      'enseignant des écoles',
    ],
    bio:
      "Enseignant de formation, Laurent Escure est secrétaire général de l'UNSA depuis avril 2019, " +
      "succédant à Luc Bérille. Il défend un syndicalisme pragmatique ancré dans les institutions paritaires " +
      "et préside la délégation UNSA à l'Unédic et à l'AGIRC-ARRCO.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Laurent_Escure',
    wikidataId: 'Q3219206',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q127261275 (confirmé Special:EntityData, P463 → Q3550610, frwiki sitelink)
    //           + Wikipédia FR + solidaires.org
    // Note : les Solidaires ont deux co-délégués généraux. Julie Ferrua (co-déléguée depuis avr. 2024)
    //        est exclue faute de Q-id Wikidata vérifié.
    nom: 'Guilbert',
    prenom: 'Murielle',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Co-déléguée générale de l'Union syndicale Solidaires",
    rolesSecondaires: [
      'agente de la Direction générale des Finances publiques (DGFiP)',
      'ancienne co-déléguée générale avec Simon Duteil (2020-2024)',
    ],
    bio:
      "Agente de la DGFiP et syndicaliste, Murielle Guilbert est co-déléguée générale de l'Union syndicale " +
      "Solidaires depuis le 15 octobre 2020 (congrès extraordinaire). Réélue en avril 2024 avec Julie Ferrua " +
      "comme nouvelle co-déléguée, elle incarne un syndicalisme interprofessionnel combatif.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Murielle_Guilbert',
    wikidataId: 'Q127261275',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q116871810 (confirmé via WebSearch + medef.com)
    //           + Wikipédia FR (Patrick_Martin_(chef_d'entreprise))
    nom: 'Martin',
    prenom: 'Patrick',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: 'Président du MEDEF',
    rolesSecondaires: [
      'président du Groupe Martin-Belaysoud Expansion (matériaux de construction)',
      "ancien vice-président du MEDEF chargé de l'économie",
    ],
    bio:
      "Dirigeant industriel lyonnais à la tête du Groupe Martin-Belaysoud Expansion, Patrick Martin est président " +
      "du Mouvement des entreprises de France (MEDEF) depuis le 6 juillet 2023, succédant à Geoffroy Roux de Bézieux. " +
      "Il a porté le positionnement patronal sur la réforme des retraites et la compétitivité.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Patrick_Martin_(chef_d%27entreprise)",
    wikidataId: 'Q116871810',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q130365762 (confirmé Special:EntityData : P39 → Q2992731 depuis 2025-01-21,
    //           successeur de Q23926442/Asselin ; frwiki sitelink) + lepicentre-magazine.fr
    nom: 'Reza-Tofighi',
    prenom: 'Amir',
    pays: 'France',
    nationalite: 'française',
    lieuNaissance: 'Grigny (Essonne)',
    rolePrincipal: 'Président de la CPME',
    rolesSecondaires: [
      "cofondateur d'une entreprise d'aide à domicile (à 21 ans)",
      'membre du comité exécutif de la CPME depuis 2019',
    ],
    bio:
      "Diplômé de CentraleSupélec et d'HEC, fils de réfugiés politiques iraniens ayant grandi à Grigny, " +
      "Amir Reza-Tofighi cofonde une entreprise d'aide à domicile à 21 ans. " +
      "Élu président de la CPME le 21 janvier 2025 avec 65,4 % des voix, il succède à François Asselin.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Amir_Reza-Tofighi',
    wikidataId: 'Q130365762',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q135922868 (confirmé wbsearchentities : "French official, college teacher and
    //           Grand Master of the Grand Orient de France") + godf.org communiqué officiel 21 août 2025.
    // Art. 9 : on référence la FONCTION de grand maître (publique), jamais une appartenance de membre.
    nom: 'Bertinotti',
    prenom: 'Pierre',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: 'Grand Maître du Grand Orient de France',
    rolesSecondaires: ['enseignant (professeur de collège)'],
    bio:
      "Enseignant, Pierre Bertinotti est élu Grand Maître du Grand Orient de France lors du 160e Convent " +
      "de Bordeaux le 21 août 2025, succédant à Nicolas Penin. Le GODF est la première obédience maçonnique " +
      "française, laïque et adogmatique, avec environ 55 000 membres répartis dans 1 200 loges.",
    wikipediaUrl: null,
    wikidataId: 'Q135922868',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q136083522 (confirmé wbsearchentities) + 450.fm (22 juin 2025) + jlturbet.net (juin 2026).
    // Art. 9 : on référence la FONCTION de grand maître (publique), jamais une appartenance de membre.
    nom: 'Notton',
    prenom: 'Jean-Raphaël',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: 'Grand Maître de la Grande Loge de France',
    rolesSecondaires: [
      'médecin',
      'officier de réserve',
      'ancien Grand Orateur de la GLDF (2017)',
      'ancien Second Grand Maître Adjoint (2021)',
    ],
    bio:
      "Médecin et officier de réserve, initié en 1986 à la loge « Jean Jaurès » de Paris, Jean-Raphaël Notton " +
      "est élu Grand Maître de la Grande Loge de France le 21 juin 2025, puis réélu en juin 2026. " +
      "La GLDF est la troisième obédience maçonnique française en nombre de membres.",
    wikipediaUrl: null,
    wikidataId: 'Q136083522',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — Q-ids vérifiés via wbsearchentities ou Special:EntityData.
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q1125638 (confirmé Special:EntityData) + Wikipédia FR
    nom: 'Confédération générale du travail',
    sigle: 'CGT',
    typeOrganisation: 'SYNDICAT',
    pays: 'France',
    siteWeb: 'https://www.cgt.fr',
    description:
      "Premier syndicat de salariés français en nombre de suffrages aux élections professionnelles, " +
      "la CGT est fondée en 1895 à Limoges. Elle regroupe des unions fédérales par branche et des unions " +
      "locales par territoire. Sophie Binet en est secrétaire générale depuis mars 2023.",
    dateCreation: new Date('1895-09-23'),
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/Conf%C3%A9d%C3%A9ration_g%C3%A9n%C3%A9rale_du_travail',
    wikidataId: 'Q1125638',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1125605 (confirmé via WebSearch "French Democratic Confederation of Labour")
    //           + Wikipédia FR
    nom: 'Confédération française démocratique du travail',
    sigle: 'CFDT',
    typeOrganisation: 'SYNDICAT',
    pays: 'France',
    siteWeb: 'https://www.cfdt.fr',
    description:
      "Deuxième syndicat de salariés français, la CFDT naît en 1964 de la majorité de la CFTC " +
      "qui choisit la déconfessionnalisation. Elle défend un syndicalisme réformiste et de négociation. " +
      "Marylise Léon en est secrétaire générale depuis juin 2023.",
    dateCreation: new Date('1964-11-07'),
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/Conf%C3%A9d%C3%A9ration_fran%C3%A7aise_d%C3%A9mocratique_du_travail',
    wikidataId: 'Q1125605',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1125623 (confirmé via WebSearch + Special:EntityData Souillot P2389)
    //           + Wikipédia FR
    nom: 'Confédération générale du travail - Force ouvrière',
    sigle: 'FO',
    typeOrganisation: 'SYNDICAT',
    pays: 'France',
    siteWeb: 'https://www.force-ouvriere.fr',
    description:
      "Fondée en 1948 par une scission de la CGT, la CGT-FO défend l'indépendance syndicale " +
      "vis-à-vis des partis politiques et de l'État. Fortement implantée dans la fonction publique. " +
      "Frédéric Souillot en est secrétaire général depuis juin 2022.",
    dateCreation: new Date('1948-04-12'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Force_ouvri%C3%A8re',
    wikidataId: 'Q1125623',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2992730 (confirmé via WebSearch "French Confederation of Management")
    //           + Wikipédia FR
    nom: "Confédération française de l'encadrement - Confédération générale des cadres",
    sigle: 'CFE-CGC',
    typeOrganisation: 'SYNDICAT',
    pays: 'France',
    siteWeb: 'https://www.cfecgc.org',
    description:
      "Syndicat de l'encadrement, des ingénieurs et des cadres, fondé en 1944 sous le nom de CGC. " +
      "Il défend les intérêts des salariés relevant du statut cadre, techniciens et agents de maîtrise. " +
      "Christelle Thieffinne en est présidente depuis juin 2026.",
    dateCreation: new Date('1944-10-15'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/CFE-CGC',
    wikidataId: 'Q2992730',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1125610 (confirmé via WebSearch "French Confederation of Christian Workers")
    //           + Wikipédia FR + cftc.fr
    nom: 'Confédération française des travailleurs chrétiens',
    sigle: 'CFTC',
    typeOrganisation: 'SYNDICAT',
    pays: 'France',
    siteWeb: 'https://www.cftc.fr',
    description:
      "Fondée en 1919, la CFTC est le syndicat français d'inspiration chrétienne (humanisme chrétien). " +
      "Elle représente les salariés dans de nombreux secteurs, avec une présence historique dans le tertiaire. " +
      "Cyril Chabanier en est président depuis 2019.",
    dateCreation: new Date('1919-11-02'),
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/Conf%C3%A9d%C3%A9ration_fran%C3%A7aise_des_travailleurs_chr%C3%A9tiens',
    wikidataId: 'Q1125610',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3550369 (confirmé via WebSearch "National Union of Autonomous Unions")
    //           + Wikipédia FR + unsa.org
    nom: 'Union nationale des syndicats autonomes',
    sigle: 'UNSA',
    typeOrganisation: 'SYNDICAT',
    pays: 'France',
    siteWeb: 'https://www.unsa.org',
    description:
      "Fondée en 1993, l'UNSA regroupe des syndicats autonomes issus principalement de la FEN scindée, " +
      "notamment dans l'éducation (UNSA Éducation) et la fonction publique. " +
      "Laurent Escure en est secrétaire général depuis avril 2019.",
    dateCreation: new Date('1993-02-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Union_nationale_des_syndicats_autonomes',
    wikidataId: 'Q3550369',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3550610 (confirmé via Special:EntityData Guilbert P463 + WebSearch)
    //           + Wikipédia FR + solidaires.org
    nom: 'Union syndicale Solidaires',
    sigle: 'Solidaires',
    typeOrganisation: 'SYNDICAT',
    pays: 'France',
    siteWeb: 'https://solidaires.org',
    description:
      "Issue du Groupe des Dix (1981), l'Union syndicale Solidaires adopte son nom actuel en 1998. " +
      "Elle regroupe des syndicats interprofessionnels de lutte (SUD Rail, SUD Éducation…). " +
      "Murielle Guilbert et Julie Ferrua en sont co-déléguées générales depuis le congrès de Toulouse (avr. 2024).",
    dateCreation: new Date('1998-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Union_syndicale_Solidaires',
    wikidataId: 'Q3550610',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3082595 (confirmé via WebSearch Patrick Martin MEDEF)
    //           + Wikipédia FR + medef.com
    nom: 'Mouvement des entreprises de France',
    sigle: 'MEDEF',
    typeOrganisation: 'LOBBY',
    pays: 'France',
    siteWeb: 'https://www.medef.com',
    description:
      "Principal syndicat patronal français, le MEDEF succède au CNPF en 1998. Il représente les entreprises " +
      "dans le dialogue social (Unédic, retraites complémentaires, accords de branche) et auprès des " +
      "pouvoirs publics. Patrick Martin en est président depuis juillet 2023.",
    dateCreation: new Date('1998-10-27'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Mouvement_des_entreprises_de_France',
    wikidataId: 'Q3082595',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2992731 (confirmé via WebSearch "Confédération des petites et moyennes entreprises")
    //           + Wikipédia FR + cpme.fr
    nom: 'Confédération des petites et moyennes entreprises',
    sigle: 'CPME',
    typeOrganisation: 'LOBBY',
    pays: 'France',
    siteWeb: 'https://www.cpme.fr',
    description:
      "Organisation patronale française représentant les TPE et PME, la CPME (ex-CGPME) est fondée en 1944. " +
      "Elle siège dans les instances paritaires et participe aux négociations nationales. " +
      "Amir Reza-Tofighi en est président depuis janvier 2025.",
    dateCreation: new Date('1944-01-01'),
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/Conf%C3%A9d%C3%A9ration_des_petites_et_moyennes_entreprises',
    wikidataId: 'Q2992731',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1542667 (confirmé via wbsearchentities "Grand Orient de France")
    //           + Wikipédia FR + godf.org
    // Art. 9 : obédience publique, statuts déposés en préfecture, convent annuel public.
    nom: 'Grand Orient de France',
    sigle: 'GODF',
    typeOrganisation: 'ASSOCIATION',
    pays: 'France',
    siteWeb: 'https://godf.org',
    description:
      "Fondé en 1728, le Grand Orient de France est la première obédience maçonnique française, " +
      "laïque et adogmatique, avec environ 55 000 membres dans 1 200 loges. " +
      "Pierre Bertinotti en est Grand Maître depuis août 2025.",
    dateCreation: new Date('1728-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Grand_Orient_de_France',
    wikidataId: 'Q1542667',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q959344 (confirmé via wbsearchentities "Grande Loge de France")
    //           + Wikipédia FR + gldf.org
    // Art. 9 : obédience publique, convent annuel public.
    nom: 'Grande Loge de France',
    sigle: 'GLDF',
    typeOrganisation: 'ASSOCIATION',
    pays: 'France',
    siteWeb: 'https://www.gldf.org',
    description:
      "Fondée en 1894, la Grande Loge de France est la troisième obédience maçonnique française " +
      "en nombre de membres. Elle pratique le Rite Écossais Ancien et Accepté (REAA). " +
      "Jean-Raphaël Notton en est Grand Maître depuis juin 2025.",
    dateCreation: new Date('1894-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Grande_Loge_de_France',
    wikidataId: 'Q959344',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-01).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_binet: {
    url: 'https://fr.wikipedia.org/wiki/Sophie_Binet',
    titre: 'Sophie Binet — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Première femme SG de la CGT, élue le 31 mars 2023 ; juriste, ancienne SG de l'UGICT-CGT.",
    verifiee: true,
  },
  wp_leon: {
    url: 'https://fr.wikipedia.org/wiki/Marylise_L%C3%A9on',
    titre: 'Marylise Léon — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      'SG de la CFDT depuis le 21 juin 2023, succédant à Laurent Berger ; née le 23 nov. 1976 au Mans.',
    verifiee: true,
  },
  cfdt_leon: {
    url: 'https://www.cfdt.fr/qui-est-la-cfdt/notre-fonctionnement/la-commission-executive',
    titre: 'Commission exécutive de la CFDT — membres et missions',
    media: 'CFDT',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2023-06-21'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'CFDT',
    description: 'Composition de la commission exécutive confirmant Marylise Léon au poste de SG.',
    verifiee: true,
  },
  wp_souillot: {
    url: 'https://fr.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Souillot',
    titre: 'Frédéric Souillot — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "SG de la CGT-FO depuis juin 2022 ; né en 1967 à Dijon ; issu du secteur pétrolier (Schlumberger).",
    verifiee: true,
  },
  fi_souillot_reelection: {
    url: 'https://www.franceinfo.fr/economie/syndicats/frederic-souillot-a-ete-reelu-pour-un-deuxieme-mandat-a-la-tete-du-syndicat-fo_7964000.html',
    titre: 'Frédéric Souillot réélu pour un deuxième mandat à la tête de Force ouvrière',
    media: 'France Info',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-04-25'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Rédaction France Info',
    description:
      "Réélection de Frédéric Souillot comme SG de FO lors du congrès de Dijon en avril 2025, jusqu'en 2030.",
    verifiee: true,
  },
  cfecgc_thieffinne: {
    url: 'https://www.cfecgc.org/actualites/christelle-thieffinne-elue-nouvelle-presidente-de-la-cfe-cgc',
    titre: 'Christelle Thieffinne élue nouvelle présidente de la CFE-CGC',
    media: 'CFE-CGC',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-06-10'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'CFE-CGC',
    description:
      "Communiqué officiel CFE-CGC : élection de Christelle Thieffinne au 39e congrès de Strasbourg.",
    verifiee: true,
  },
  wp_chabanier: {
    url: 'https://fr.wikipedia.org/wiki/Cyril_Chabanier',
    titre: 'Cyril Chabanier — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Président de la CFTC depuis 2019 (réélu) ; agent général d'assurances, né le 28 mars 1973 à Arles.",
    verifiee: true,
  },
  cftc_chabanier: {
    url: 'https://www.cftc.fr/actualites/cyril-chabanier-reelu-president-de-la-cftc',
    titre: 'Cyril Chabanier réélu président de la CFTC',
    media: 'CFTC',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2023-01-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'CFTC',
    description:
      'Communiqué officiel de la CFTC : réélection de Cyril Chabanier à la présidence de la confédération.',
    verifiee: true,
  },
  wp_escure: {
    url: 'https://fr.wikipedia.org/wiki/Laurent_Escure',
    titre: 'Laurent Escure — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "SG de l'UNSA depuis avr. 2019 ; enseignant, né le 17 nov. 1970 à Tulle ; ancien SG UNSA Éducation.",
    verifiee: true,
  },
  wp_guilbert: {
    url: 'https://fr.wikipedia.org/wiki/Murielle_Guilbert',
    titre: 'Murielle Guilbert — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      'Co-déléguée générale de Solidaires depuis le 15 oct. 2020 ; agente DGFiP, syndicaliste interprofessionnelle.',
    verifiee: true,
  },
  wp_patrick_martin: {
    url: "https://fr.wikipedia.org/wiki/Patrick_Martin_(chef_d%27entreprise)",
    titre: "Patrick Martin (chef d'entreprise) — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      'Président du MEDEF depuis le 6 juil. 2023 ; dirigeant du Groupe Martin-Belaysoud Expansion (Lyon).',
    verifiee: true,
  },
  medef_martin: {
    url: 'https://www.medef.com/actualites/patrick-martin-president-du-medef',
    titre: 'Patrick Martin, président du Medef — medef.com',
    media: 'MEDEF',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2023-07-06'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'MEDEF',
    description:
      "Page officielle du président du MEDEF confirmant l'élection de Patrick Martin le 6 juillet 2023.",
    verifiee: true,
  },
  wp_reza_tofighi: {
    url: 'https://fr.wikipedia.org/wiki/Amir_Reza-Tofighi',
    titre: 'Amir Reza-Tofighi — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Président de la CPME depuis le 21 janv. 2025 (65,4 % des voix) ; cofondateur d'une entreprise d'aide à domicile.",
    verifiee: true,
  },
  lepicentre_reza: {
    url: 'https://lepicentre-magazine.fr/un-nouveau-president-pour-la-cpme-nationale/',
    titre: 'Un nouveau président pour la CPME nationale',
    media: "L'Épicentre",
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-01-21'),
    dateConsultation: new Date('2026-07-01'),
    auteur: "Rédaction L'Épicentre",
    description:
      "Amir Reza-Tofighi élu président de la CPME le 21 janvier 2025 avec 65,4 % des voix, succédant à François Asselin.",
    verifiee: true,
  },
  godf_bertinotti: {
    url: 'https://godf.org/actualites/communiques-de-presse/communique-du-21-aout-2025-election-du-grand-maitre-du-grand-orient-de-france/',
    titre: 'Communiqué du 21 août 2025 — Élection du Grand Maître du Grand Orient de France',
    media: 'Grand Orient de France',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-08-21'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Grand Orient de France',
    description:
      'Communiqué officiel du GODF : élection de Pierre Bertinotti lors du 160e Convent de Bordeaux.',
    verifiee: true,
  },
  gldf_notton_2025: {
    url: 'https://450.fm/2025/06/22/jean-raphael-notton-nouveau-grand-maitre-de-la-grande-loge-de-france/',
    titre: 'Jean-Raphaël Notton, nouveau Grand Maître de la Grande Loge de France',
    media: '450.fm',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-06-22'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Rédaction 450.fm',
    description:
      'Élection de Jean-Raphaël Notton comme Grand Maître de la GLDF lors du convent annuel du 21 juin 2025.',
    verifiee: true,
  },
  gldf_notton_2026: {
    url: 'https://www.jlturbet.net/2026/06/jean-raphael-notton-reelu-grand-maitre-de-la-grande-loge-de-france.html',
    titre: 'Jean-Raphaël Notton réélu Grand Maître de la Grande Loge de France',
    media: 'Blog des Spiritualités (Jean-Laurent Turbet)',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Jean-Laurent Turbet',
    description:
      'Réélection de Jean-Raphaël Notton comme Grand Maître de la Grande Loge de France en juin 2026.',
    verifiee: true,
  },
  wp_cgt: {
    url: 'https://fr.wikipedia.org/wiki/Conf%C3%A9d%C3%A9ration_g%C3%A9n%C3%A9rale_du_travail',
    titre: 'Confédération générale du travail — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description: 'CGT : histoire, structure, représentativité, dirigeants successifs.',
    verifiee: true,
  },
  wp_cfdt: {
    url: 'https://fr.wikipedia.org/wiki/Conf%C3%A9d%C3%A9ration_fran%C3%A7aise_d%C3%A9mocratique_du_travail',
    titre: 'Confédération française démocratique du travail — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description: 'CFDT : fondée en 1964, deuxième syndicat français, courant réformiste.',
    verifiee: true,
  },
  wp_fo: {
    url: 'https://fr.wikipedia.org/wiki/Force_ouvri%C3%A8re',
    titre: 'Force ouvrière — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description: "CGT-FO : fondée en 1948, indépendance syndicale, présence forte dans la fonction publique.",
    verifiee: true,
  },
  wp_cfecgc: {
    url: 'https://fr.wikipedia.org/wiki/CFE-CGC',
    titre: 'CFE-CGC — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description: "CFE-CGC : syndicat de l'encadrement et des cadres, fondé en 1944.",
    verifiee: true,
  },
  wp_cftc: {
    url: 'https://fr.wikipedia.org/wiki/Conf%C3%A9d%C3%A9ration_fran%C3%A7aise_des_travailleurs_chr%C3%A9tiens',
    titre: 'Confédération française des travailleurs chrétiens — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description: "CFTC : fondée en 1919, syndicat d'inspiration chrétienne, restée confessionnelle après 1964.",
    verifiee: true,
  },
  wp_unsa: {
    url: 'https://fr.wikipedia.org/wiki/Union_nationale_des_syndicats_autonomes',
    titre: 'Union nationale des syndicats autonomes — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description: "UNSA : fondée en 1993, syndicats autonomes, forte présence dans l'éducation et la FP.",
    verifiee: true,
  },
  wp_solidaires: {
    url: 'https://fr.wikipedia.org/wiki/Union_syndicale_Solidaires',
    titre: 'Union syndicale Solidaires — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description: 'Solidaires : Issue du Groupe des Dix (1981), syndicats de lutte interprofessionnels (SUD).',
    verifiee: true,
  },
  wp_medef: {
    url: 'https://fr.wikipedia.org/wiki/Mouvement_des_entreprises_de_France',
    titre: 'Mouvement des entreprises de France — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description: 'MEDEF : successeur du CNPF (1998), première organisation patronale française.',
    verifiee: true,
  },
  wp_cpme: {
    url: 'https://fr.wikipedia.org/wiki/Conf%C3%A9d%C3%A9ration_des_petites_et_moyennes_entreprises',
    titre: 'Confédération des petites et moyennes entreprises — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description: 'CPME : ex-CGPME (1944), représente les TPE et PME dans le dialogue social.',
    verifiee: true,
  },
  wp_godf: {
    url: 'https://fr.wikipedia.org/wiki/Grand_Orient_de_France',
    titre: 'Grand Orient de France — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description: 'GODF : fondé en 1728, 1re obédience maçonnique FR, laïque et adogmatique, ~55 000 membres.',
    verifiee: true,
  },
  wp_gldf: {
    url: 'https://fr.wikipedia.org/wiki/Grande_Loge_de_France',
    titre: 'Grande Loge de France — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description: 'GLDF : fondée en 1894, 3e obédience maçonnique FR, pratique le REAA.',
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — typeLienCode DIRIGEANT (code vérifié dans backend/prisma/seed.js).
// Lien polymorphe à 3 types (ADR-002) : exactement 1 entité non-nulle de chaque côté.
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Syndicats de salariés ---
  {
    aType: 'personne',
    aRef: 'Q111529069', // Sophie Binet
    bType: 'organisation',
    bRef: 'Q1125638', // CGT
    typeLienCode: 'DIRIGEANT',
    description:
      "Sophie Binet est secrétaire générale de la CGT depuis le 31 mars 2023, " +
      "première femme à diriger la confédération depuis sa fondation en 1895.",
    dateDebut: new Date('2023-03-31'),
    dateFin: null,
    sourceRef: 'wp_binet',
  },
  {
    aType: 'personne',
    aRef: 'Q55258276', // Marylise Léon
    bType: 'organisation',
    bRef: 'Q1125605', // CFDT
    typeLienCode: 'DIRIGEANT',
    description:
      "Marylise Léon est secrétaire générale de la CFDT depuis le 21 juin 2023, succédant à Laurent Berger.",
    dateDebut: new Date('2023-06-21'),
    dateFin: null,
    sourceRef: 'cfdt_leon',
  },
  {
    aType: 'personne',
    aRef: 'Q114673617', // Frédéric Souillot
    bType: 'organisation',
    bRef: 'Q1125623', // FO
    typeLienCode: 'DIRIGEANT',
    description:
      "Frédéric Souillot est secrétaire général de la CGT-FO depuis juin 2022, " +
      "réélu pour un deuxième mandat lors du congrès de Dijon en avril 2025.",
    dateDebut: new Date('2022-06-01'),
    dateFin: null,
    sourceRef: 'fi_souillot_reelection',
  },
  {
    aType: 'personne',
    aRef: 'Q140191967', // Christelle Thieffinne
    bType: 'organisation',
    bRef: 'Q2992730', // CFE-CGC
    typeLienCode: 'DIRIGEANT',
    description:
      "Christelle Thieffinne est présidente de la CFE-CGC depuis le 10 juin 2026, " +
      "élue lors du 39e congrès de Strasbourg en succédant à François Hommeril.",
    dateDebut: new Date('2026-06-10'),
    dateFin: null,
    sourceRef: 'cfecgc_thieffinne',
  },
  {
    aType: 'personne',
    aRef: 'Q94505285', // Cyril Chabanier
    bType: 'organisation',
    bRef: 'Q1125610', // CFTC
    typeLienCode: 'DIRIGEANT',
    description:
      "Cyril Chabanier est président de la CFTC depuis 2019 (réélu). " +
      "Agent général d'assurances, il incarne la ligne confessionnelle réformiste de la confédération.",
    dateDebut: new Date('2019-03-01'),
    dateFin: null,
    sourceRef: 'cftc_chabanier',
  },
  {
    aType: 'personne',
    aRef: 'Q3219206', // Laurent Escure
    bType: 'organisation',
    bRef: 'Q3550369', // UNSA
    typeLienCode: 'DIRIGEANT',
    description:
      "Laurent Escure est secrétaire général de l'UNSA depuis avril 2019, succédant à Luc Bérille.",
    dateDebut: new Date('2019-04-01'),
    dateFin: null,
    sourceRef: 'wp_escure',
  },
  {
    aType: 'personne',
    aRef: 'Q127261275', // Murielle Guilbert
    bType: 'organisation',
    bRef: 'Q3550610', // Solidaires
    typeLienCode: 'DIRIGEANT',
    description:
      "Murielle Guilbert est co-déléguée générale de l'Union syndicale Solidaires depuis le 15 octobre 2020 " +
      "(congrès extraordinaire), réélue en avril 2024 lors du congrès de Toulouse.",
    dateDebut: new Date('2020-10-15'),
    dateFin: null,
    sourceRef: 'wp_guilbert',
  },
  // --- Patronat ---
  {
    aType: 'personne',
    aRef: 'Q116871810', // Patrick Martin
    bType: 'organisation',
    bRef: 'Q3082595', // MEDEF
    typeLienCode: 'DIRIGEANT',
    description:
      "Patrick Martin est président du MEDEF depuis le 6 juillet 2023, succédant à Geoffroy Roux de Bézieux.",
    dateDebut: new Date('2023-07-06'),
    dateFin: null,
    sourceRef: 'medef_martin',
  },
  {
    aType: 'personne',
    aRef: 'Q130365762', // Amir Reza-Tofighi
    bType: 'organisation',
    bRef: 'Q2992731', // CPME
    typeLienCode: 'DIRIGEANT',
    description:
      "Amir Reza-Tofighi est président de la CPME depuis le 21 janvier 2025, " +
      "élu avec 65,4 % des voix, succédant à François Asselin.",
    dateDebut: new Date('2025-01-21'),
    dateFin: null,
    sourceRef: 'lepicentre_reza',
  },
  // --- Grands maîtres des obédiences maçonniques ---
  // Art. 9 RGPD : on référence la FONCTION publiquement annoncée, jamais une appartenance de membre.
  {
    aType: 'personne',
    aRef: 'Q135922868', // Pierre Bertinotti
    bType: 'organisation',
    bRef: 'Q1542667', // GODF
    typeLienCode: 'DIRIGEANT',
    description:
      "Pierre Bertinotti est Grand Maître du Grand Orient de France depuis le 21 août 2025, " +
      "élu lors du 160e Convent de Bordeaux en succédant à Nicolas Penin. " +
      "Fonction publiquement annoncée par le GODF (communiqué officiel).",
    dateDebut: new Date('2025-08-21'),
    dateFin: null,
    sourceRef: 'godf_bertinotti',
  },
  {
    aType: 'personne',
    aRef: 'Q136083522', // Jean-Raphaël Notton
    bType: 'organisation',
    bRef: 'Q959344', // GLDF
    typeLienCode: 'DIRIGEANT',
    description:
      "Jean-Raphaël Notton est Grand Maître de la Grande Loge de France depuis le 21 juin 2025, " +
      "réélu en juin 2026. Médecin et officier de réserve, initié en 1986. " +
      "Fonction publiquement annoncée par la GLDF (convent annuel public).",
    dateDebut: new Date('2025-06-21'),
    dateFin: null,
    sourceRef: 'gldf_notton_2025',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (identiques au gabarit seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-partenaires-sociaux] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-partenaires-sociaux] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données partenaires sociaux précédentes...')
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
    '\n--- seed-partenaires-sociaux — syndicats, patronat, obédiences (Q-ids vérifiés) ---\n',
  )
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

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

  console.log('\n--- Liens DIRIGEANT ---')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  OK DIRIGEANT — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n--- Bilan ---')
  console.log(`  Personnes     : ${PERSONNES.length}`)
  console.log(`  Organisations : ${ORGANISATIONS.length}`)
  console.log(`  Sources       : ${Object.keys(SOURCES).length}`)
  console.log(`  Liens         : ${LIENS.length} (tous DIRIGEANT)`)
  console.log('\n  Exclus faute de Q-id Wikidata vérifié :')
  console.log('    Caroline Chevé (FSU, SG depuis fév. 2025)')
  console.log('    Michel Picon (U2P, président depuis jan. 2024)')
  console.log('    Julie Ferrua (Solidaires, co-déléguée depuis avr. 2024)')
  console.log('    Yves Pennes (GLNF, Grand Maître depuis déc. 2024)')
  console.log('    Liliane Mirville (GLFF, Grande Maîtresse depuis juin 2024)')
  console.log('    Maurice Leduc (Droit Humain, Grand Maître depuis sept. 2025)')
}

main()
  .catch((err) => {
    console.error('[seed-partenaires-sociaux] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
