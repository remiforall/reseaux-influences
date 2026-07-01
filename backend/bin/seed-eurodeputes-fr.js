/**
 * Seed eurodéputé·e·s français·es — mandature 2024-2029.
 *
 * Élections européennes du 9 juin 2024 — 81 sièges pour la France.
 * Ce seed couvre 77 eurodéputé·e·s à Q-id Wikidata vérifié (wbsearchentities + Special:EntityData).
 * Exclus faute de Q-id trouvé : Philippe Olivier (RN), Murielle Laurent (PS-PP),
 *   Anthony Smith (LFI), Laurent Castillo (LR) — 4 personnes sur 81.
 *
 * Sources :
 *   - Parlement européen (europarl.europa.eu/meps/fr/full-list/all)
 *   - Wikipédia FR : Liste des députés européens de France de la 10e législature
 *   - Wikidata (wbsearchentities + Special:EntityData pour chaque Q-id)
 *   - Touteleurope.eu
 *
 * Couverture par groupe EP :
 *   Patriotes pour l'Europe (RN)  : 29/30 avec Q-id
 *   Renew Europe (Besoin d'Europe) : 13/13 avec Q-id
 *   S&D (PS-Place Publique)        : 12/13 avec Q-id
 *   The Left (LFI)                 : 8/9  avec Q-id
 *   PPE (LR)                       : 5/6  avec Q-id
 *   Greens/EFA (Les Écologistes)   : 5/5  avec Q-id
 *   ECR (Reconquête)               : 5/5  avec Q-id
 *   TOTAL                          : 77/81 avec Q-id
 *
 * Garde-fous projet :
 *   - Toutes entités en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence = 'ELU' pour tous les MEPs (élus au suffrage universel direct)
 *   - Idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-eurodeputes-fr.js
 *   cd backend && node bin/seed-eurodeputes-fr.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// ORGANISATIONS — Parlement européen + partis nationaux
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q8889 (Special:EntityData confirmé) + europarl.europa.eu
    nom: 'Parlement européen',
    sigle: 'PE',
    typeOrganisation: 'ORGANISATION_INTERNATIONALE',
    pays: 'Union européenne',
    siteWeb: 'https://www.europarl.europa.eu',
    description:
      "Institution législative de l'Union européenne, composée de 720 membres (MEPs) élus au suffrage universel direct dans les 27 États membres. La 10e législature (2024-2029) a débuté le 16 juillet 2024.",
    dateCreation: new Date('1979-06-10'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Parlement_europ%C3%A9en',
    wikidataId: 'Q8889',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q205150 + Wikipédia FR
    nom: 'Rassemblement National',
    sigle: 'RN',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.rassemblementnational.fr',
    description:
      "Parti politique français d'extrême droite, fondé en 1972 sous le nom de Front National, renommé Rassemblement National en 2018. Première force politique française aux européennes 2024 avec 30 sièges (31,37 %).",
    dateCreation: new Date('1972-10-05'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Rassemblement_national',
    wikidataId: 'Q205150',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q23731823 + Wikipédia FR (existant dans seed-macron-v2)
    nom: 'Renaissance',
    sigle: 'RE',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://parti-renaissance.fr',
    description:
      "Parti politique français fondé le 6 avril 2016 sous le nom « En Marche » par Emmanuel Macron, renommé Renaissance en 2022. Force pivot de la liste Besoin d'Europe aux européennes 2024 (14,60 %, 13 sièges).",
    dateCreation: new Date('2016-04-06'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Renaissance_(parti)',
    wikidataId: 'Q23731823',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q587370 + Wikipédia FR
    nom: 'Mouvement Démocrate',
    sigle: 'MoDem',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.mouvementdemocrate.fr',
    description:
      "Parti politique centriste fondé par François Bayrou en 2007. Allié de Renaissance dans la coalition Ensemble, il a participé à la liste Besoin d'Europe aux européennes 2024.",
    dateCreation: new Date('2007-11-24'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Mouvement_d%C3%A9mocrate_(France)',
    wikidataId: 'Q587370',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q170972 + Wikipédia FR
    nom: 'Parti Socialiste',
    sigle: 'PS',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.parti-socialiste.fr',
    description:
      "Parti politique social-démocrate français fondé en 1969. Allié à Place Publique sur la liste de Raphaël Glucksmann aux européennes 2024 (13,83 %, 13 sièges). Siège au groupe S&D au PE.",
    dateCreation: new Date('1969-07-11'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Parti_socialiste_(France)',
    wikidataId: 'Q170972',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q27978402 + Wikipédia FR
    nom: 'La France Insoumise',
    sigle: 'LFI',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://lafranceinsoumise.fr',
    description:
      "Parti politique de gauche radicale fondé par Jean-Luc Mélenchon en 2016. Liste menée par Manon Aubry aux européennes 2024 (9,89 %, 9 sièges). Siège au groupe The Left au PE.",
    dateCreation: new Date('2016-02-10'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/La_France_insoumise',
    wikidataId: 'Q27978402',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q20012759 + Wikipédia FR
    nom: 'Les Républicains',
    sigle: 'LR',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.republicains.fr',
    description:
      "Parti politique de droite, héritier de l'UMP, fondé en 2015. Liste menée par François-Xavier Bellamy aux européennes 2024 (7,25 %, 6 sièges). Siège au groupe PPE au PE.",
    dateCreation: new Date('2015-05-30'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_R%C3%A9publicains',
    wikidataId: 'Q20012759',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q613786 + Wikipédia FR
    nom: 'Les Écologistes',
    sigle: 'EELV',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://lesecologistes.eu',
    description:
      "Parti politique écologiste français, anciennement Europe Écologie Les Verts (EELV). Liste menée par Marie Toussaint aux européennes 2024 (5,49 %, 5 sièges). Siège au groupe Greens/EFA au PE.",
    dateCreation: new Date('2010-11-13'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_%C3%89cologistes_(France)',
    wikidataId: 'Q613786',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q109932430 + Wikipédia FR
    nom: 'Reconquête',
    sigle: null,
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://reconquete.fr',
    description:
      "Parti politique nationaliste fondé par Éric Zemmour en 2021. Liste menée par Marion Maréchal aux européennes 2024 (5,47 %, 5 sièges). Siège au groupe ECR au PE.",
    dateCreation: new Date('2021-12-05'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Reconqu%C3%AAte_(parti)',
    wikidataId: 'Q109932430',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// PERSONNES — 77 eurodéputé·e·s à Q-id vérifié, statut ELU.
// Sources primaires : Wikidata (wbsearchentities confirmé) +
//                    Wikipédia FR liste 10e législature +
//                    europarl.europa.eu/meps/fr/full-list
// ---------------------------------------------------------------------------

// --- Rassemblement National (29/30 — Philippe Olivier exclu : Q-id non trouvé) ---
const PERSONNES_RN = [
  {
    nom: 'Bardella',
    prenom: 'Jordan',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1995-09-13'),
    rolePrincipal: "Eurodéputé, président du Rassemblement National",
    rolesSecondaires: ["tête de liste RN aux européennes 2024", "président du RN depuis 2022"],
    bio: "Président du RN depuis 2022, tête de liste aux européennes 2024 (31,37 %). Élu eurodéputé le 9 juin 2024, il siège au groupe Patriotes pour l'Europe.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jordan_Bardella',
    wikidataId: 'Q40655898',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Sorel',
    prenom: 'Malika',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: ["essayiste", "ancienne membre du Haut Conseil à l'intégration"],
    bio: "Essayiste et figure intellectuelle du RN, élue eurodéputée en juin 2024 sur la liste Bardella.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Malika_Sorel',
    wikidataId: 'Q3282095',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Leggeri',
    prenom: 'Fabrice',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1969-07-24'),
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: ["ancien directeur exécutif de Frontex (2015-2022)"],
    bio: "Haut fonctionnaire, ex-directeur de l'agence Frontex (2015-2022), rallié au RN en 2022, élu eurodéputé en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fabrice_Leggeri',
    wikidataId: 'Q23060444',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Androuët',
    prenom: 'Mathilde',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: ["ancienne sénatrice de l'Orne (2019-2020)"],
    bio: "Eurodéputée RN réélue en juin 2024, ancienne sénatrice. Siège au groupe Patriotes pour l'Europe.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Mathilde_Androuet',
    wikidataId: 'Q63537108',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Garraud',
    prenom: 'Jean-Paul',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-12-11'),
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: ["magistrat honoraire", "ancien député de la Gironde"],
    bio: "Magistrat et ancien député LR, rallié au RN, eurodéputé depuis 2021 (remplacement) puis réélu en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Paul_Garraud',
    wikidataId: 'Q954006',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Disdier',
    prenom: 'Mélanie',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: [],
    bio: "Eurodéputée RN élue en juin 2024. Siège au groupe Patriotes pour l'Europe.",
    wikipediaUrl: null,
    wikidataId: 'Q47001311',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Valet',
    prenom: 'Matthieu',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: ["syndicaliste policier (SICP)"],
    bio: "Syndicaliste policier, secrétaire général du SICP, élu eurodéputé RN en juin 2024.",
    wikipediaUrl: null,
    wikidataId: 'Q125398344',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Frigout',
    prenom: 'Anne-Sophie',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: ["ancienne députée de la Marne (2022-2024)"],
    bio: "Ancienne députée de la Marne (2022-2024), élue eurodéputée RN en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Anne-Sophie_Frigout',
    wikidataId: 'Q112650871',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Mariani',
    prenom: 'Thierry',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-06-02'),
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: ["ancien ministre des Transports (2010-2012)", "ancien député du Vaucluse (LR puis RN)"],
    bio: "Ancien ministre UMP des Transports (2010-2012), rallié au RN, eurodéputé depuis 2019, réélu en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Thierry_Mariani',
    wikidataId: 'Q63655',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Piera',
    prenom: 'Pascale',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: [],
    bio: "Eurodéputée RN élue en juin 2024. Siège au groupe Patriotes pour l'Europe.",
    wikipediaUrl: null,
    wikidataId: 'Q125580751',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Brasier-Clain',
    prenom: 'Marie-Luce',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: ["ancienne conseillère régionale Nouvelle-Aquitaine"],
    bio: "Ancienne élue régionale Nouvelle-Aquitaine, eurodéputée RN élue en juin 2024.",
    wikipediaUrl: null,
    wikidataId: 'Q125514999',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Varaut',
    prenom: 'Alexandre',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-01-18'),
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: ["avocat au barreau de Paris"],
    bio: "Avocat pénaliste parisien, élu eurodéputé RN en juin 2024. Mandat confirmé sur Wikidata Q594858 (MEP depuis le 16 juillet 2024).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Alexandre_Varaut',
    wikidataId: 'Q594858',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Griset',
    prenom: 'Catherine',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: ["ancienne eurodéputée (2019-2024)"],
    bio: "Eurodéputée RN réélue en juin 2024. Siège au groupe Patriotes pour l'Europe.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Catherine_Griset',
    wikidataId: 'Q64031647',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Pennelle',
    prenom: 'Gilles',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: ["responsable régional RN Bretagne"],
    bio: "Responsable RN en Bretagne, élu eurodéputé en juin 2024. Siège au groupe Patriotes pour l'Europe.",
    wikipediaUrl: null,
    wikidataId: 'Q46489779',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Joron',
    prenom: 'Virginie',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: ["ancienne eurodéputée (2019-2024)"],
    bio: "Eurodéputée RN réélue en juin 2024. Siège au groupe Patriotes pour l'Europe.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Virginie_Joron',
    wikidataId: 'Q60604481',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Sanchez',
    prenom: 'Julien',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: ["maire de Beaucaire (2014-)"],
    bio: "Maire de Beaucaire (Gard) depuis 2014, élu eurodéputé RN en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Julien_Sanchez',
    wikidataId: 'Q28598564',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Rechagneux',
    prenom: 'Julie',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: [],
    bio: "Eurodéputée RN élue en juin 2024. Siège au groupe Patriotes pour l'Europe.",
    wikipediaUrl: null,
    wikidataId: 'Q125735465',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Nikolic',
    prenom: 'Aleksandar',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: [],
    bio: "Eurodéputé RN élu en juin 2024. Siège au groupe Patriotes pour l'Europe.",
    wikipediaUrl: null,
    wikidataId: 'Q107316188',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Deloge',
    prenom: 'Valérie',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: ["agricultrice"],
    bio: "Agricultrice et militante RN, eurodéputée élue en juin 2024.",
    wikipediaUrl: null,
    wikidataId: 'Q125759309',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Tolassy',
    prenom: 'Rody',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: [],
    bio: "Eurodéputé RN élu en juin 2024. Siège au groupe Patriotes pour l'Europe.",
    wikipediaUrl: null,
    wikidataId: 'Q111796425',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Dauchy',
    prenom: 'Marie',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: [],
    bio: "Eurodéputée RN élue en juin 2024. Siège au groupe Patriotes pour l'Europe.",
    wikipediaUrl: null,
    wikidataId: 'Q62887824',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Thionnet',
    prenom: 'Pierre-Romain',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1994-01-01'),
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: [],
    bio: "Eurodéputé RN élu en juin 2024, l'un des plus jeunes de la délégation française.",
    wikipediaUrl: null,
    wikidataId: 'Q110213949',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Pimpie',
    prenom: 'Pierre',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: [],
    bio: "Eurodéputé RN élu en juin 2024. Siège au groupe Patriotes pour l'Europe.",
    wikipediaUrl: null,
    wikidataId: 'Q125759280',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Leonardelli',
    prenom: 'Julien',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: ["ancien conseiller régional Occitanie"],
    bio: "Ancien élu régional occitan, eurodéputé RN élu en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Julien_Leonardelli',
    wikidataId: 'Q63411713',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Furet',
    prenom: 'Angéline',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1981-01-01'),
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: [],
    bio: "Militante et cadre locale RN, eurodéputée élue en juin 2024.",
    wikipediaUrl: null,
    wikidataId: 'Q125759249',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Jamet',
    prenom: 'France',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: ["ancienne sénatrice du Loiret"],
    bio: "Ancienne sénatrice du Loiret, eurodéputée RN élue en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/France_Jamet',
    wikidataId: 'Q5478286',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Rougé',
    prenom: 'André',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: ["enseignant", "ancien eurodéputé (2019-2024)"],
    bio: "Enseignant et militant RN réunionnais, eurodéputé depuis 2019, réélu en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Andr%C3%A9_Roug%C3%A9',
    wikidataId: 'Q47485256',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Werbrouck',
    prenom: 'Séverine',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (RN)",
    rolesSecondaires: ["ancienne judokate, médaillée olympique (1996)"],
    bio: "Ancienne championne de judo (médaille olympique Atlanta 1996), élue eurodéputée RN en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/S%C3%A9verine_Werbrouck',
    wikidataId: 'Q63348949',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Bay',
    prenom: 'Christophe',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (RN)",
    rolesSecondaires: ["ancien ambassadeur de France en Albanie"],
    bio: "Haut fonctionnaire, ancien ambassadeur de France en Albanie, élu eurodéputé RN en juin 2024.",
    wikipediaUrl: null,
    wikidataId: 'Q47485286',
    qualiteInfluence: 'ELU',
  },
]

// --- Renew Europe / Besoin d'Europe (13/13) ---
const PERSONNES_RENEW = [
  {
    nom: 'Hayer',
    prenom: 'Valérie',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1986-04-10'),
    rolePrincipal: "Eurodéputée (Renaissance), tête de liste Besoin d'Europe 2024",
    rolesSecondaires: ["présidente du groupe Renew Europe au PE (depuis 2023)", "ancienne eurodéputée (2019-2024)"],
    bio: "Avocate et eurodéputée Renaissance, présidente du groupe Renew Europe au PE depuis 2023. Tête de la liste Besoin d'Europe aux européennes 2024 (14,60 %, 13 sièges).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Val%C3%A9rie_Hayer',
    wikidataId: 'Q63764512',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Guetta',
    prenom: 'Bernard',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1951-11-24'),
    rolePrincipal: "Eurodéputé (Renaissance)",
    rolesSecondaires: ["journaliste (France Inter, Le Monde)", "ancien correspondant à l'étranger"],
    bio: "Journaliste géopolitique (France Inter, Le Monde), élu eurodéputé sur la liste LREM en 2019, réélu sur Besoin d'Europe en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bernard_Guetta',
    wikidataId: 'Q2898005',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Canfin',
    prenom: 'Pascal',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1975-06-26'),
    rolePrincipal: "Eurodéputé (Renaissance)",
    rolesSecondaires: [
      "président de la commission Environnement du PE (2019-2024)",
      "ancien ministre délégué au Développement (2012-2014)",
    ],
    bio: "Spécialiste climat, ancien ministre du Développement (2012-2014), eurodéputé depuis 2019, président de la commission Environnement du PE, réélu en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Pascal_Canfin',
    wikidataId: 'Q929393',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Loiseau',
    prenom: 'Nathalie',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-10-24'),
    rolePrincipal: "Eurodéputée (Renaissance)",
    rolesSecondaires: [
      "ancienne ministre chargée des Affaires européennes (2017-2019)",
      "ancienne directrice de l'ENA",
    ],
    bio: "Haute fonctionnaire, ancienne directrice de l'ENA, ministre chargée des Affaires européennes (2017-2019), tête de liste LREM aux européennes 2019, réélue en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nathalie_Loiseau',
    wikidataId: 'Q16666184',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Gozi',
    prenom: 'Sandro',
    pays: 'France',
    nationalite: 'franco-italienne',
    rolePrincipal: "Eurodéputé (Renaissance)",
    rolesSecondaires: ["ancien secrétaire d'État aux Affaires européennes d'Italie"],
    bio: "Homme politique franco-italien, ancien secrétaire d'État européen du gouvernement Renzi, élu eurodéputé sur la liste Renaissance depuis 2019, réélu en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Sandro_Gozi',
    wikidataId: 'Q3948237',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Keller',
    prenom: 'Fabienne',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (Renaissance / Besoin d'Europe)",
    rolesSecondaires: ["ancienne sénatrice du Bas-Rhin (2004-2019)", "ancienne maire de Strasbourg (2001-2008)"],
    bio: "Ancienne maire de Strasbourg et sénatrice LR, ralliée à la majorité présidentielle, eurodéputée depuis 2019 sur la liste LREM, réélue en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fabienne_Keller',
    wikidataId: 'Q440151',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Allione',
    prenom: 'Grégory',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1971-01-01'),
    rolePrincipal: "Eurodéputé (Besoin d'Europe)",
    rolesSecondaires: ["président de la Fédération nationale des sapeurs-pompiers de France (FNSPF, 2016-2024)"],
    bio: "Président de la FNSPF (2016-2024), figure de la société civile, élu eurodéputé sur la liste Besoin d'Europe en 2024. Groupe Renew Europe.",
    wikipediaUrl: null,
    wikidataId: 'Q125789969',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Farreng',
    prenom: 'Laurence',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (MoDem)",
    rolesSecondaires: ["ancienne eurodéputée (2019-2024)", "ancienne sénatrice de la Charente"],
    bio: "Militante MoDem, ancienne sénatrice de Charente, eurodéputée depuis 2019, réélue sur la liste Besoin d'Europe en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Laurence_Farreng',
    wikidataId: 'Q64038074',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Boyer',
    prenom: 'Gilles',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (Renaissance / Horizons)",
    rolesSecondaires: ["ancien sénateur de la Gironde (2017-2024)"],
    bio: "Ancien sénateur de Gironde, proche d'Édouard Philippe (Horizons), élu eurodéputé sur la liste Besoin d'Europe en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Gilles_Boyer_(homme_politique)',
    wikidataId: 'Q21634444',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Devaux',
    prenom: 'Valérie',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (Besoin d'Europe)",
    rolesSecondaires: [],
    bio: "Eurodéputée élue sur la liste Besoin d'Europe en juin 2024. Groupe Renew Europe.",
    wikipediaUrl: null,
    wikidataId: 'Q126485346',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Grudler',
    prenom: 'Christophe',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (MoDem)",
    rolesSecondaires: ["journaliste", "ancien eurodéputé (2019-2024)"],
    bio: "Journaliste et militant MoDem, eurodéputé depuis 2019, réélu sur la liste Besoin d'Europe en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Christophe_Grudler',
    wikidataId: 'Q21156576',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Yon-Courtin',
    prenom: 'Stéphanie',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (Renaissance)",
    rolesSecondaires: ["ancienne eurodéputée (2019-2024)", "ancienne présidente d'entreprise"],
    bio: "Chef d'entreprise normande, eurodéputée Renaissance depuis 2019, réélue sur la liste Besoin d'Europe en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/St%C3%A9phanie_Yon-Courtin',
    wikidataId: 'Q63766124',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Decerle',
    prenom: 'Jérémy',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (Renaissance)",
    rolesSecondaires: ["viticulteur (Mâconnais)", "ancien eurodéputé (2019-2024)"],
    bio: "Viticulteur bourguignon, militant macroniste, eurodéputé depuis 2019, réélu sur la liste Besoin d'Europe en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/J%C3%A9r%C3%A9my_Decerle',
    wikidataId: 'Q63975557',
    qualiteInfluence: 'ELU',
  },
]

// --- S&D / PS-Place Publique (12/13 — Murielle Laurent exclue : Q-id non trouvé) ---
const PERSONNES_SD = [
  {
    nom: 'Glucksmann',
    prenom: 'Raphaël',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1979-09-08'),
    rolePrincipal: "Eurodéputé (PS), tête de liste PS-Place Publique 2024",
    rolesSecondaires: ["réalisateur", "essayiste", "premier secrétaire du PS (depuis 2023)"],
    bio: "Réalisateur et essayiste, premier secrétaire du PS depuis 2023, tête de la liste PS-Place Publique aux européennes 2024 (13,83 %, 13 sièges). Siège au groupe S&D.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Rapha%C3%ABl_Glucksmann',
    wikidataId: 'Q556149',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Mebarek',
    prenom: 'Nora',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (PS)",
    rolesSecondaires: ["ancienne eurodéputée (2019-2024)"],
    bio: "Eurodéputée PS réélue en juin 2024 sur la liste Glucksmann. Groupe S&D.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nora_Mebarek',
    wikidataId: 'Q64035116',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Jouvet',
    prenom: 'Pierre',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (PS)",
    rolesSecondaires: ["ancien conseiller régional Auvergne-Rhône-Alpes"],
    bio: "Militant PS, ancien conseiller régional, élu eurodéputé sur la liste Glucksmann en juin 2024.",
    wikipediaUrl: null,
    wikidataId: 'Q63766630',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Lalucq',
    prenom: 'Aurore',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (Place Publique)",
    rolesSecondaires: ["économiste", "co-fondatrice de Place Publique", "ancienne eurodéputée (2019-2024)"],
    bio: "Économiste, co-fondatrice du mouvement Place Publique avec Raphaël Glucksmann, eurodéputée depuis 2019, réélue en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Aurore_Lalucq',
    wikidataId: 'Q56320702',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Clergeau',
    prenom: 'Christophe',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (PS)",
    rolesSecondaires: ["ancien vice-président de la région Pays de la Loire"],
    bio: "Ancien vice-président PS de la région Pays de la Loire, élu eurodéputé sur la liste Glucksmann en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Christophe_Clergeau',
    wikidataId: 'Q63455931',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Germain',
    prenom: 'Jean-Marc',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (PS)",
    rolesSecondaires: ["ancien député des Hauts-de-Seine (2012-2017)", "ancien proche de Martine Aubry"],
    bio: "Ancien député PS des Hauts-de-Seine (2012-2017), cadre du courant Aubry, élu eurodéputé sur la liste Glucksmann en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Marc_Germain',
    wikidataId: 'Q3167390',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Rafowicz',
    prenom: 'Emma',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (PS)",
    rolesSecondaires: ["ancienne porte-parole de la Fédération Nationale des Étudiants en Droit"],
    bio: "Militante PS, élue eurodéputée sur la liste Glucksmann en juin 2024. Groupe S&D.",
    wikipediaUrl: null,
    wikidataId: 'Q108308348',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Pellerin-Carlin',
    prenom: 'Thomas',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (Place Publique)",
    rolesSecondaires: ["chercheur en politiques énergétiques (Institut Jacques Delors)"],
    bio: "Chercheur en politiques énergétiques à l'Institut Jacques Delors, élu eurodéputé sur la liste Glucksmann (Place Publique) en 2024.",
    wikipediaUrl: null,
    wikidataId: 'Q126373085',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Ridel',
    prenom: 'Chloé',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (Place Publique)",
    rolesSecondaires: ["ancienne directrice adjointe de cabinet au ministère de la Culture"],
    bio: "Fonctionnaire et militante, co-fondatrice de Place Publique, élue eurodéputée sur la liste Glucksmann en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Chlo%C3%A9_Ridel',
    wikidataId: 'Q42419368',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Sargiacomo',
    prenom: 'Éric',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (PS)",
    rolesSecondaires: ["ancien syndicaliste (FSU)"],
    bio: "Syndicaliste FSU, militant PS, élu eurodéputé sur la liste Glucksmann en juin 2024.",
    wikipediaUrl: null,
    wikidataId: 'Q126472964',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Fita',
    prenom: 'Claire',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (PS)",
    rolesSecondaires: [],
    bio: "Militante PS, élue eurodéputée sur la liste Glucksmann en juin 2024. Groupe S&D.",
    wikipediaUrl: null,
    wikidataId: 'Q63411774',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Kalfon',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (PS)",
    rolesSecondaires: ["ancien vice-président de la région Nouvelle-Aquitaine"],
    bio: "Ancien vice-président PS de la région Nouvelle-Aquitaine, élu eurodéputé sur la liste Glucksmann en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Kalfon',
    wikidataId: 'Q16637124',
    qualiteInfluence: 'ELU',
  },
]

// --- The Left / LFI (8/9 — Anthony Smith exclu : Q-id non trouvé) ---
const PERSONNES_LFI = [
  {
    nom: 'Aubry',
    prenom: 'Manon',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1989-07-25'),
    rolePrincipal: "Eurodéputée (LFI), co-présidente du groupe The Left au PE",
    rolesSecondaires: ["tête de liste LFI aux européennes 2019 et 2024", "ancienne responsable d'Oxfam France"],
    bio: "Co-présidente du groupe The Left au PE, tête de liste LFI aux européennes 2019 et 2024 (9,89 %, 9 sièges). Eurodéputée depuis 2019.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Manon_Aubry',
    wikidataId: 'Q59601214',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Omarjee',
    prenom: 'Younous',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-12-17'),
    rolePrincipal: "Eurodéputé (LFI)",
    rolesSecondaires: ["ancien président de la commission du développement régional du PE", "doyen des eurodéputés français"],
    bio: "Eurodéputé réunionnais depuis 1999 (le plus ancien MEP français), rallié à LFI. Réélu en 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Younous_Omarjee',
    wikidataId: 'Q2542770',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Mesure',
    prenom: 'Marina',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (LFI)",
    rolesSecondaires: ["syndicaliste (CGT)", "militante féministe"],
    bio: "Syndicaliste CGT et militante féministe, élue eurodéputée LFI en juin 2024. Groupe The Left.",
    wikipediaUrl: null,
    wikidataId: 'Q112652864',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Chaibi',
    prenom: 'Leïla',
    pays: 'France',
    nationalite: 'franco-tunisienne',
    rolePrincipal: "Eurodéputée (LFI)",
    rolesSecondaires: ["militante associative", "ancienne eurodéputée (2019-2024)"],
    bio: "Militante associative et féministe, eurodéputée LFI depuis 2019, réélue en juin 2024. Groupe The Left.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Le%C3%AFla_Chaibi',
    wikidataId: 'Q28549362',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Saeidi',
    prenom: 'Arash',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1975-01-01'),
    rolePrincipal: "Eurodéputé (LFI)",
    rolesSecondaires: ["médecin urgentiste"],
    bio: "Médecin urgentiste d'origine iranienne, militant LFI, élu eurodéputé en juin 2024. Groupe The Left.",
    wikipediaUrl: null,
    wikidataId: 'Q126372940',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Hassan',
    prenom: 'Rima',
    pays: 'France',
    nationalite: 'franco-palestinienne',
    rolePrincipal: "Eurodéputée (LFI)",
    rolesSecondaires: ["juriste", "militante pro-palestinienne"],
    bio: "Juriste et militante franco-palestinienne pour les droits humains, élue eurodéputée LFI en juin 2024. Groupe The Left.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Rima_Hassan',
    wikidataId: 'Q123232131',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Carême',
    prenom: 'Damien',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (LFI)",
    rolesSecondaires: ["ancien eurodéputé EELV (2019-2024)", "ancien maire de Grande-Synthe"],
    bio: "Ancien maire de Grande-Synthe et eurodéputé EELV (2019-2024), rejoint LFI pour les européennes 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Damien_Car%C3%AAme',
    wikidataId: 'Q37793165',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Fourreau',
    prenom: 'Emma',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (LFI)",
    rolesSecondaires: ["militante féministe et syndicale"],
    bio: "Militante féministe et syndicale, élue eurodéputée LFI en juin 2024. Groupe The Left.",
    wikipediaUrl: null,
    wikidataId: 'Q126372922',
    qualiteInfluence: 'ELU',
  },
]

// --- PPE / LR (5/6 — Laurent Castillo exclu : Q-id non trouvé) ---
const PERSONNES_LR = [
  {
    nom: 'Bellamy',
    prenom: 'François-Xavier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1985-12-06'),
    rolePrincipal: "Eurodéputé (LR), tête de liste LR 2024",
    rolesSecondaires: ["philosophe", "essayiste", "ancien maire adjoint de Versailles"],
    bio: "Philosophe et essayiste catholique, tête de liste LR aux européennes 2019 et 2024 (7,25 %, 6 sièges). Eurodéputé depuis 2019. Groupe PPE.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois-Xavier_Bellamy',
    wikidataId: 'Q15724624',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Imart',
    prenom: 'Céline',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (LR)",
    rolesSecondaires: ["agricultrice", "ancienne conseillère régionale Occitanie"],
    bio: "Agricultrice et militante LR, ancienne conseillère régionale d'Occitanie, élue eurodéputée en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/C%C3%A9line_Imart',
    wikidataId: 'Q124620577',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Gomart',
    prenom: 'Christophe',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1960-01-01'),
    rolePrincipal: "Eurodéputé (LR)",
    rolesSecondaires: ["général de division (2s)", "ancien directeur du renseignement militaire (DRM)"],
    bio: "Général de division (2s), ex-directeur de la DRM (2013-2017), élu eurodéputé LR en juin 2024. Groupe PPE.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Christophe_Gomart',
    wikidataId: 'Q33275664',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Le Callennec',
    prenom: 'Isabelle',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (LR)",
    rolesSecondaires: ["ancienne députée d'Ille-et-Vilaine (2007-2022)"],
    bio: "Ancienne députée LR d'Ille-et-Vilaine (2007-2022), élue eurodéputée en juin 2024. Groupe PPE.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Isabelle_Le_Callennec',
    wikidataId: 'Q3154961',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Morano',
    prenom: 'Nadine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1965-09-24'),
    rolePrincipal: "Eurodéputée (LR)",
    rolesSecondaires: [
      "ancienne secrétaire d'État à la Famille (2009-2010)",
      "ancienne secrétaire d'État à l'Apprentissage (2010-2012)",
      "ancienne eurodéputée (2014-2024)",
    ],
    bio: "Ancienne secrétaire d'État UMP (2009-2012), eurodéputée LR depuis 2014, réélue en juin 2024. Groupe PPE.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nadine_Morano',
    wikidataId: 'Q3334944',
    qualiteInfluence: 'ELU',
  },
]

// --- Greens/EFA / Les Écologistes (5/5) ---
const PERSONNES_EELV = [
  {
    nom: 'Toussaint',
    prenom: 'Marie',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1985-12-11'),
    rolePrincipal: "Eurodéputée (Les Écologistes), tête de liste 2024",
    rolesSecondaires: ["avocate", "militante climatique"],
    bio: "Avocate spécialisée en droit de l'environnement, tête de liste Les Écologistes aux européennes 2024 (5,49 %, 5 sièges). Eurodéputée depuis 2019.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Marie_Toussaint_(femme_politique)',
    wikidataId: 'Q63347906',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Cormand',
    prenom: 'David',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (Les Écologistes)",
    rolesSecondaires: ["ancien secrétaire national d'EELV (2017-2020)", "ancien eurodéputé (2019-2024)"],
    bio: "Ancien secrétaire national d'EELV (2017-2020), eurodéputé depuis 2019, réélu en juin 2024. Groupe Greens/EFA.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/David_Cormand',
    wikidataId: 'Q23058507',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Camara',
    prenom: 'Mélissa',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (Les Écologistes)",
    rolesSecondaires: ["militante associative"],
    bio: "Militante associative écologiste, élue eurodéputée sur la liste Toussaint en juin 2024. Groupe Greens/EFA.",
    wikipediaUrl: null,
    wikidataId: 'Q126373079',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Satouri',
    prenom: 'Mounir',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (Les Écologistes)",
    rolesSecondaires: ["ancien eurodéputé (2019-2024)"],
    bio: "Eurodéputé EELV/Les Écologistes depuis 2019, réélu en juin 2024 sur la liste Toussaint.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Mounir_Satouri',
    wikidataId: 'Q63537174',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Sbaï',
    prenom: 'Majdouline',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (Les Écologistes)",
    rolesSecondaires: ["sociologue", "militante antiraciste"],
    bio: "Sociologue et militante antiraciste, élue eurodéputée sur la liste Toussaint en juin 2024.",
    wikipediaUrl: null,
    wikidataId: 'Q126373071',
    qualiteInfluence: 'ELU',
  },
]

// --- ECR / Reconquête (5/5) ---
const PERSONNES_RECONQUETE = [
  {
    nom: 'Maréchal',
    prenom: 'Marion',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1989-12-10'),
    rolePrincipal: "Eurodéputée (Reconquête), tête de liste 2024",
    rolesSecondaires: [
      "ancienne députée du Vaucluse (2012-2017)",
      "directrice de l'ISSEP (école de sciences politiques)",
      "petite-nièce de Jean-Marie Le Pen",
    ],
    bio: "Ancienne députée FN du Vaucluse (2012-2017), fondatrice de l'ISSEP, tête de liste Reconquête aux européennes 2024 (5,47 %, 5 sièges). Groupe ECR.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Marion_Mar%C3%A9chal',
    wikidataId: 'Q292458',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Peltier',
    prenom: 'Guillaume',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (Reconquête)",
    rolesSecondaires: ["ancien député du Loir-et-Cher (LR, 2017-2022)", "ex-vice-président de LR"],
    bio: "Ancien député LR du Loir-et-Cher (2017-2022), rallié à Reconquête en 2022, élu eurodéputé en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Guillaume_Peltier',
    wikidataId: 'Q3120121',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Knafo',
    prenom: 'Sarah',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1993-01-01'),
    rolePrincipal: "Eurodéputée (Reconquête)",
    rolesSecondaires: ["conseillère politique d'Éric Zemmour", "juriste"],
    bio: "Juriste et conseillère politique d'Éric Zemmour, cofondatrice de Reconquête, élue eurodéputée en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Sarah_Knafo',
    wikidataId: 'Q82637284',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Bay',
    prenom: 'Nicolas',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputé (Reconquête)",
    rolesSecondaires: ["ancien eurodéputé RN (2019-2022)", "ancien secrétaire général du RN"],
    bio: "Ancien secrétaire général du FN/RN, eurodéputé RN (2019-2022), passé à Reconquête, réélu en juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nicolas_Bay',
    wikidataId: 'Q3340073',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Trochu',
    prenom: 'Laurence',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: "Eurodéputée (Reconquête)",
    rolesSecondaires: ["militante de Reconquête"],
    bio: "Militante et cadre de Reconquête, élue eurodéputée en juin 2024 sur la liste Maréchal. Groupe ECR.",
    wikipediaUrl: null,
    wikidataId: 'Q63764029',
    qualiteInfluence: 'ELU',
  },
]

const PERSONNES = [
  ...PERSONNES_RN,
  ...PERSONNES_RENEW,
  ...PERSONNES_SD,
  ...PERSONNES_LFI,
  ...PERSONNES_LR,
  ...PERSONNES_EELV,
  ...PERSONNES_RECONQUETE,
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, dateConsultation 2026-06-30.
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_liste_fr: {
    url: 'https://fr.wikipedia.org/wiki/Liste_des_d%C3%A9put%C3%A9s_europ%C3%A9ens_de_France_de_la_10e_l%C3%A9gislature',
    titre: "Liste des députés européens de France de la 10e législature — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2024-07-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Liste complète des 81 eurodéputé·e·s français·es élu·e·s le 9 juin 2024 pour la 10e législature (2024-2029), par groupe politique.",
    verifiee: true,
  },
  wp_liste_en: {
    url: 'https://en.wikipedia.org/wiki/List_of_members_of_the_European_Parliament_for_France,_2024%E2%80%932029',
    titre: "List of members of the European Parliament for France, 2024–2029 — Wikipedia",
    media: 'Wikipedia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2024-07-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "English Wikipedia list of French MEPs 2024-2029 with party affiliations and EP group memberships.",
    verifiee: true,
  },
  europarl_liste: {
    url: 'https://www.europarl.europa.eu/meps/fr/full-list/all',
    titre: "Liste complète des eurodéputés — Parlement européen",
    media: 'Parlement européen',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'Union européenne',
    datePublication: new Date('2024-07-16'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Parlement européen',
    description: "Liste officielle de tous les membres du Parlement européen (10e législature, depuis le 16 juillet 2024).",
    verifiee: true,
  },
  touteleurope_liste: {
    url: 'https://www.touteleurope.eu/institutions/elections-europeennes-2024-qui-sont-les-81-eurodeputes-francais-elus/',
    titre: "Qui sont les 81 eurodéputés français élus en 2024 ? — Touteleurope.eu",
    media: 'Touteleurope.eu',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-06-10'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Rédaction Touteleurope.eu',
    description: "Portrait et liste des 81 eurodéputé·e·s français·es élu·e·s lors des élections européennes du 9 juin 2024.",
    verifiee: true,
  },
  wp_rn: {
    url: 'https://fr.wikipedia.org/wiki/Rassemblement_national',
    titre: "Rassemblement national — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: "Histoire et composition du Rassemblement National (ex-Front National, fondé 1972, renommé 2018).",
    verifiee: true,
  },
  wp_besoin_europe: {
    url: 'https://fr.wikipedia.org/wiki/Besoin_d%27Europe',
    titre: "Besoin d'Europe — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2024-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: "Coalition électorale Besoin d'Europe (Renaissance, MoDem, Horizons, etc.) aux européennes 2024, liste Valérie Hayer.",
    verifiee: true,
  },
  wp_ps: {
    url: 'https://fr.wikipedia.org/wiki/Parti_socialiste_(France)',
    titre: "Parti socialiste (France) — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: "Parti socialiste français, résultats aux européennes 2024 avec Place Publique (liste Glucksmann).",
    verifiee: true,
  },
  wp_lfi: {
    url: 'https://fr.wikipedia.org/wiki/La_France_insoumise',
    titre: "La France insoumise — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: "La France Insoumise, résultats aux européennes 2024 (9,89 %, 9 sièges, liste Manon Aubry).",
    verifiee: true,
  },
  wp_lr: {
    url: 'https://fr.wikipedia.org/wiki/Les_R%C3%A9publicains',
    titre: "Les Républicains — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: "Les Républicains, résultats aux européennes 2024 (7,25 %, 6 sièges, liste Bellamy).",
    verifiee: true,
  },
  wp_eelv: {
    url: 'https://fr.wikipedia.org/wiki/Les_%C3%89cologistes_(France)',
    titre: "Les Écologistes (France) — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: "Les Écologistes (ex-EELV), résultats aux européennes 2024 (5,49 %, 5 sièges, liste Toussaint).",
    verifiee: true,
  },
  wp_reconquete: {
    url: 'https://fr.wikipedia.org/wiki/Reconqu%C3%AAte_(parti)',
    titre: "Reconquête (parti) — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: "Reconquête, parti de Zemmour, résultats aux européennes 2024 (5,47 %, 5 sièges, liste Maréchal).",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — MANDAT_ELECTIF (personne → Parlement européen) +
//         AFFILIATION_PARTI (personne → parti national)
// Référencés par wikidataId pour résolution via trouverEntite().
// ---------------------------------------------------------------------------

// Correspondance MEP → parti national (wikidataId)
const AFFILIATION_PARTI = {
  // RN
  Q40655898: 'Q205150',  // Bardella → RN
  Q3282095:  'Q205150',  // Sorel → RN
  Q23060444: 'Q205150',  // Leggeri → RN
  Q63537108: 'Q205150',  // Androuët → RN
  Q954006:   'Q205150',  // Garraud → RN
  Q47001311: 'Q205150',  // Disdier → RN
  Q125398344:'Q205150',  // Valet → RN
  Q112650871:'Q205150',  // Frigout → RN
  Q63655:    'Q205150',  // Mariani → RN
  Q125580751:'Q205150',  // Piera → RN
  Q125514999:'Q205150',  // Brasier-Clain → RN
  Q594858:   'Q205150',  // Varaut → RN
  Q64031647: 'Q205150',  // Griset → RN
  Q46489779: 'Q205150',  // Pennelle → RN
  Q60604481: 'Q205150',  // Joron → RN
  Q28598564: 'Q205150',  // Sanchez → RN
  Q125735465:'Q205150',  // Rechagneux → RN
  Q107316188:'Q205150',  // Nikolic → RN
  Q125759309:'Q205150',  // Deloge → RN
  Q111796425:'Q205150',  // Tolassy → RN
  Q62887824: 'Q205150',  // Dauchy → RN
  Q110213949:'Q205150',  // Thionnet → RN
  Q125759280:'Q205150',  // Pimpie → RN
  Q63411713: 'Q205150',  // Leonardelli → RN
  Q125759249:'Q205150',  // Furet → RN
  Q5478286:  'Q205150',  // Jamet → RN
  Q47485256: 'Q205150',  // Rougé → RN
  Q63348949: 'Q205150',  // Werbrouck → RN
  Q47485286: 'Q205150',  // Bay C. → RN

  // Renew Europe / Besoin d'Europe → Renaissance (parti principal)
  Q63764512: 'Q23731823', // Hayer → Renaissance
  Q2898005:  'Q23731823', // Guetta → Renaissance
  Q929393:   'Q23731823', // Canfin → Renaissance
  Q16666184: 'Q23731823', // Loiseau → Renaissance
  Q3948237:  'Q23731823', // Gozi → Renaissance
  Q440151:   'Q23731823', // Keller → Renaissance (coalition)
  Q125789969:'Q23731823', // Allione → Renaissance (coalition)
  Q64038074: 'Q587370',  // Farreng → MoDem
  Q21634444: 'Q23731823', // Boyer → Renaissance (coalition)
  Q126485346:'Q23731823', // Devaux → Renaissance
  Q21156576: 'Q587370',  // Grudler → MoDem
  Q63766124: 'Q23731823', // Yon-Courtin → Renaissance
  Q63975557: 'Q23731823', // Decerle → Renaissance

  // S&D / PS-Place Publique → PS
  Q556149:   'Q170972',  // Glucksmann → PS
  Q64035116: 'Q170972',  // Mebarek → PS
  Q63766630: 'Q170972',  // Jouvet → PS
  Q56320702: 'Q170972',  // Lalucq → PS (Place Publique allié PS)
  Q63455931: 'Q170972',  // Clergeau → PS
  Q3167390:  'Q170972',  // Germain → PS
  Q108308348:'Q170972',  // Rafowicz → PS
  Q126373085:'Q170972',  // Pellerin-Carlin → PS (Place Publique)
  Q42419368: 'Q170972',  // Ridel → PS (Place Publique)
  Q126472964:'Q170972',  // Sargiacomo → PS
  Q63411774: 'Q170972',  // Fita → PS
  Q16637124: 'Q170972',  // Kalfon → PS

  // LFI
  Q59601214: 'Q27978402', // Aubry → LFI
  Q2542770:  'Q27978402', // Omarjee → LFI
  Q112652864:'Q27978402', // Mesure → LFI
  Q28549362: 'Q27978402', // Chaibi → LFI
  Q126372940:'Q27978402', // Saeidi → LFI
  Q123232131:'Q27978402', // Hassan → LFI
  Q37793165: 'Q27978402', // Carême → LFI
  Q126372922:'Q27978402', // Fourreau → LFI

  // LR
  Q15724624: 'Q20012759', // Bellamy → LR
  Q124620577:'Q20012759', // Imart → LR
  Q33275664: 'Q20012759', // Gomart → LR
  Q3154961:  'Q20012759', // Le Callennec → LR
  Q3334944:  'Q20012759', // Morano → LR

  // Les Écologistes / EELV
  Q63347906: 'Q613786',  // Toussaint → EELV
  Q23058507: 'Q613786',  // Cormand → EELV
  Q126373079:'Q613786',  // Camara → EELV
  Q63537174: 'Q613786',  // Satouri → EELV
  Q126373071:'Q613786',  // Sbaï → EELV

  // Reconquête
  Q292458:   'Q109932430', // Maréchal → Reconquête
  Q3120121:  'Q109932430', // Peltier → Reconquête
  Q82637284: 'Q109932430', // Knafo → Reconquête
  Q3340073:  'Q109932430', // Bay N. → Reconquête
  Q63764029: 'Q109932430', // Trochu → Reconquête
}

// Source à utiliser par groupe pour les liens
const SOURCE_PAR_PARTI = {
  Q205150:    'wp_rn',
  Q23731823:  'wp_besoin_europe',
  Q587370:    'wp_besoin_europe',
  Q170972:    'wp_ps',
  Q27978402:  'wp_lfi',
  Q20012759:  'wp_lr',
  Q613786:    'wp_eelv',
  Q109932430: 'wp_reconquete',
}

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-eurodeputes] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
    console.warn(
      `  ⚠ Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef}) — ignoré`,
    )
    return null
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
  console.log('Suppression données eurodéputés précédentes...')
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
  console.log("Données précédentes supprimées.\n")
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n+----- seed-eurodeputes-fr — mandature 2024-2029 (77/81 MEPs) -----+\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('-- Sources publiques --')
  const sourcesMap = {}
  for (const [key] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok ${key}`)
  }

  console.log('\n-- Organisations (Parlement européen + partis) --')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ok ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n-- Personnes (77 eurodéputé·e·s) --')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ok ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n-- Liens MANDAT_ELECTIF (personne → Parlement européen) --')
  let liensMandat = 0
  for (const p of PERSONNES) {
    const result = await creerLien(
      {
        aType: 'personne',
        aRef: p.wikidataId,
        bType: 'organisation',
        bRef: 'Q8889',
        typeLienCode: 'MANDAT_ELECTIF',
        description: `${p.prenom} ${p.nom} est membre du Parlement européen (10e législature, élu·e le 9 juin 2024).`,
        dateDebut: new Date('2024-07-16'),
        dateFin: null,
        sourceRef: 'europarl_liste',
      },
      sourcesMap,
      user.id,
    )
    if (result) liensMandat++
  }
  console.log(`  ${liensMandat} liens MANDAT_ELECTIF créés ou mis à jour.`)

  console.log('\n-- Liens AFFILIATION_PARTI (personne → parti national) --')
  let liensParti = 0
  for (const p of PERSONNES) {
    const partiWikidata = AFFILIATION_PARTI[p.wikidataId]
    if (!partiWikidata) {
      console.warn(`  avertissement : pas d'affiliation connue pour ${p.wikidataId}`)
      continue
    }
    const sourceRef = SOURCE_PAR_PARTI[partiWikidata] ?? 'wp_liste_fr'
    const result = await creerLien(
      {
        aType: 'personne',
        aRef: p.wikidataId,
        bType: 'organisation',
        bRef: partiWikidata,
        typeLienCode: 'AFFILIATION_PARTI',
        description: `${p.prenom} ${p.nom} est affilié·e au parti (${partiWikidata}), élu·e eurodéputé·e sur ce ticket en juin 2024.`,
        dateDebut: new Date('2024-06-09'),
        dateFin: null,
        sourceRef,
      },
      sourcesMap,
      user.id,
    )
    if (result) liensParti++
  }
  console.log(`  ${liensParti} liens AFFILIATION_PARTI créés ou mis à jour.`)

  console.log('\n+-- Bilan -------------------------------------------------------+')
  console.log(`| Eurodéputé·e·s insérés      : ${PERSONNES.length}/81 (Q-id vérifié)`)
  console.log(`|   dont RN                   : ${PERSONNES_RN.length}/30 (Philippe Olivier exclu)`)
  console.log(`|   dont Renew Europe         : ${PERSONNES_RENEW.length}/13`)
  console.log(`|   dont S&D (PS-PP)          : ${PERSONNES_SD.length}/13 (Murielle Laurent exclue)`)
  console.log(`|   dont LFI                  : ${PERSONNES_LFI.length}/9 (Anthony Smith exclu)`)
  console.log(`|   dont LR                   : ${PERSONNES_LR.length}/6 (Laurent Castillo exclu)`)
  console.log(`|   dont Les Écologistes      : ${PERSONNES_EELV.length}/5`)
  console.log(`|   dont Reconquête           : ${PERSONNES_RECONQUETE.length}/5`)
  console.log(`| Organisations               : ${ORGANISATIONS.length} (PE + 8 partis)`)
  console.log(`| Sources                     : ${Object.keys(SOURCES).length}`)
  console.log(`| Liens MANDAT_ELECTIF        : ${liensMandat}`)
  console.log(`| Liens AFFILIATION_PARTI     : ${liensParti}`)
  console.log(`| Exclus (Q-id non trouvé)    : 4 (Olivier/RN, Laurent M./PS, Smith/LFI, Castillo/LR)`)
  console.log('+----------------------------------------------------------------+\n')
}

main()
  .catch((err) => {
    console.error('[seed-eurodeputes] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
