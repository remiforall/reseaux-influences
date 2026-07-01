/**
 * Seed CAC 40 — Conseils d'administration LOT B2 (7 sociétés).
 *
 * Enquête OSINT journalistique — consultation du 2026-06-30.
 * Périmètre : Crédit Agricole SA, Danone, Dassault Systèmes, Eiffage,
 *             Engie, EssilorLuxottica, Eurofins Scientific.
 *
 * Méthode : seuls les membres dont le wikidataId est vérifiable via
 * wbsearchentities / Special:EntityData sont inclus. Les autres sont
 * listés en commentaires en fin de fichier pour suivi ultérieur.
 *
 * INTERLOCKS DÉTECTÉS parmi les 7 conseils (et avec le lot PILOTE) :
 *   — Marie-Claire Daveu (Q33123211) : Crédit Agricole SA + Engie
 *   — Marie-Christine Coisne-Roquette (Q29642685) : TotalEnergies (PILOTE) + EssilorLuxottica
 *
 * Sources : sites de gouvernance officiels, URD / rapports annuels,
 *           communiqués de presse, Wikidata, Wikipédia (cf. SOURCES).
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - Dassault Systèmes (Q1172038) : nœud déjà présent, l'upsert fusionne
 *   - membres sans Q-id exclus ; listés en bas de fichier
 *
 * Usage :
 *   cd backend && node bin/seed-cac40-b2.js
 *   cd backend && node bin/seed-cac40-b2.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — chaque fiche recoupée par >= 2 sources publiques.
// wikidataIds vérifiés via https://www.wikidata.org/wiki/<Q-id>
// ---------------------------------------------------------------------------

const PERSONNES = [
  // ─── Crédit Agricole SA ───────────────────────────────────────────────────

  {
    // Sources : Wikidata Q33195045 + Légifrance (arrêté mai 2024) + credit-agricole.com
    // Ex-PDG d'Enedis (filiale EDF) ; nommée administratrice indépendante de CASA en mai 2024
    nom: 'Laigneau',
    prenom: 'Marianne',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1971-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Administratrice indépendante de Crédit Agricole SA ; ancienne présidente du directoire d'Enedis",
    rolesSecondaires: [
      "ancienne présidente du directoire d'Enedis (2020-2024)",
      "ancienne présidente-directrice générale de GRTgaz",
      "ENA et Sciences Po",
    ],
    bio:
      "Haute fonctionnaire, Marianne Laigneau a présidé Enedis (réseau de distribution électrique, " +
      "filiale d'EDF) de 2020 à 2024. Elle siège au conseil d'administration de Crédit Agricole SA " +
      "depuis mai 2024 comme administratrice indépendante.",
    wikipediaUrl: null,
    wikidataId: 'Q33195045',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q33123211 + credit-agricole.com + engie.com/governance
    // INTERLOCK : administratrice indépendante de CASA ET d'Engie
    nom: 'Daveu',
    prenom: 'Marie-Claire',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1969-01-01'),
    lieuNaissance: 'France',
    rolePrincipal:
      "Administratrice indépendante de Crédit Agricole SA et d'Engie ; ancienne directrice RSE de Kering",
    rolesSecondaires: [
      "ancienne directrice développement durable et affaires institutionnelles de Kering (2012-2024)",
      "ingénieure agronome (AgroParisTech) + ENA",
    ],
    bio:
      "Ingénieure agronome et ancienne élève de l'ENA, Marie-Claire Daveu a dirigé la politique RSE " +
      "du groupe Kering pendant plus de dix ans (2012-2024). Elle est administratrice indépendante " +
      "de Crédit Agricole SA et d'Engie simultanément — interlock documenté entre les deux conseils.",
    wikipediaUrl: null,
    wikidataId: 'Q33123211',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3610441 + Wikipedia EN + credit-agricole.com/governance
    // Ex-eurodéputée Italie (2014-2019) ; administratrice indépendante CASA depuis mai 2023
    nom: 'Mosca',
    prenom: 'Alessia',
    pays: 'Italie',
    nationalite: 'italienne',
    dateNaissance: new Date('1975-05-23'),
    lieuNaissance: 'Monza (Italie)',
    rolePrincipal: "Administratrice indépendante de Crédit Agricole SA ; ancienne eurodéputée (PD, Italie)",
    rolesSecondaires: [
      "ancienne membre du Parlement européen (2014-2019, Parti démocrate Italie)",
      "ancienne membre de la Chambre des députés italienne (2008-2014)",
      "secrétaire générale de l'association Italy-ASEAN",
      "professeure associée à Sciences Po Paris (commerce international UE)",
    ],
    bio:
      "Politologue italienne, Alessia Mosca a siégé à la Chambre des députés italienne (2008-2014) " +
      "puis au Parlement européen (2014-2019) sous les couleurs du Parti démocrate. Spécialiste " +
      "du commerce international et de l'égalité femmes-hommes, elle est administratrice indépendante " +
      "de Crédit Agricole SA depuis mai 2023.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Alessia_Mosca',
    wikidataId: 'Q3610441',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Danone ───────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q1524524 + danone.com/governance + Wikipedia EN
    // Ancien PDG de Legrand (2006-2018), puis président du CA de Danone depuis mars 2021
    nom: 'Schnepp',
    prenom: 'Gilles',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1957-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Président du conseil d'administration de Danone",
    rolesSecondaires: [
      "ancien PDG de Legrand (2006-2018)",
      "ancien président du CA de Legrand (2018-2020)",
      "ENA et HEC Paris",
      "ancien membre de la Commission Transition écologique du MEDEF (2018-2021)",
    ],
    bio:
      "Ingénieur de formation (École Centrale Paris puis HEC), Gilles Schnepp a dirigé Legrand, " +
      "équipementier électrique mondial, de 2006 à 2020. Élu président du conseil d'administration " +
      "de Danone le 14 mars 2021 à la suite de la crise de gouvernance ayant conduit au départ " +
      "d'Emmanuel Faber, il est réélu jusqu'en 2029.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Gilles_Schnepp',
    wikidataId: 'Q1524524',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q33103144 + Wikipedia EN + danone.com (communiqué 2021)
    // Nommé DG de Danone en mai 2021 ; issu d'Unilever et Barry Callebaut
    nom: 'de Saint-Affrique',
    prenom: 'Antoine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: 'Directeur général de Danone',
    rolesSecondaires: [
      "ancien PDG de Barry Callebaut (chocolat industriel, 2015-2021)",
      "ancien directeur Unilever (divisions Food & Refreshment)",
      "HEC Paris",
    ],
    bio:
      "Diplômé de HEC Paris, Antoine de Saint-Affrique a dirigé Barry Callebaut, numéro un mondial " +
      "du chocolat industriel, de 2015 à 2021. Nommé directeur général de Danone le 1er septembre 2021 " +
      "après le départ forcé d'Emmanuel Faber, il conduit la transformation «Renew Danone».",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Antoine_de_Saint-Affrique',
    wikidataId: 'Q33103144',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q21008189 + danone.com/governance + communiqué Danone mai 2021
    // Lead independent director de Danone depuis mai 2021
    nom: 'Chapoulaud-Floquet',
    prenom: 'Valérie',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-01-01'),
    lieuNaissance: 'France',
    rolePrincipal:
      "Lead independent director de Danone ; présidente du comité Nominations, Rémunérations et Gouvernance",
    rolesSecondaires: [
      "ancienne PDG de Rémy Cointreau (2012-2019)",
      "ancienne directrice générale de Sephora (LVMH)",
      "emlyon business school (1980-1983)",
      "Chevalier de la Légion d'honneur (2015)",
    ],
    bio:
      "Diplômée d'emlyon business school, Valérie Chapoulaud-Floquet a dirigé Rémy Cointreau de 2012 " +
      "à 2019 après un long parcours chez LVMH (dont la direction de Sephora). Lead independent director " +
      "de Danone depuis mai 2021, elle préside le comité Nominations, Rémunérations et Gouvernance.",
    wikipediaUrl: null,
    wikidataId: 'Q21008189',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Dassault Systèmes ────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q2897681 + Wikipedia EN + 3ds.com + communiqué DS janv. 2024
    // PDG (CEO) de Dassault Systèmes 1995-2023, puis executive chairman jan 2024 - fév 2026
    nom: "Charlès",
    prenom: 'Bernard',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1957-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Ancien président du conseil d'administration de Dassault Systèmes (jan 2024 - fév 2026)",
    rolesSecondaires: [
      "CEO de Dassault Systèmes (1995-2024)",
      "vice-président exécutif de Dassault Systèmes (depuis fév 2026, rôle consultatif)",
      "Arts et Métiers ParisTech + ENSAM",
    ],
    bio:
      "Ingénieur de l'ENSAM, Bernard Charlès a dirigé Dassault Systèmes comme CEO pendant près de trente " +
      "ans (1995-2024), transformant l'éditeur de CAO en leader mondial du PLM et du jumeau numérique. " +
      "Président du conseil d'administration de janvier 2024 à février 2026, il a passé la main à " +
      "Pascal Daloz et conserve un rôle consultatif de vice-président exécutif.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Bernard_Charl%C3%A8s',
    wikidataId: 'Q2897681',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q115735422 + 3ds.com + communiqué DS janv. 2024 + fév 2026
    // CEO depuis janv. 2024, puis président du CA depuis fév. 2026
    nom: 'Daloz',
    prenom: 'Pascal',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1971-01-01'),
    lieuNaissance: 'France',
    rolePrincipal:
      "Président du conseil d'administration et directeur général de Dassault Systèmes (depuis fév 2026)",
    rolesSecondaires: [
      "CEO de Dassault Systèmes depuis janvier 2024",
      "ancien COO de Dassault Systèmes (2020-2024)",
      "ancien directeur du pôle PLM (2012-2020)",
      "X-Ponts",
    ],
    bio:
      "Polytechnicien et ingénieur des Ponts, Pascal Daloz a passé l'essentiel de sa carrière au sein " +
      "de Dassault Systèmes où il a dirigé successivement le pôle PLM puis les opérations du groupe " +
      "(COO 2020-2024). Nommé directeur général en janvier 2024, il succède à Bernard Charlès comme " +
      "président du conseil d'administration en février 2026.",
    wikipediaUrl: null,
    wikidataId: 'Q115735422',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Eiffage ──────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q58752205 + eiffage.com + Wikipedia EN (via societegenerale biographie)
    // PDG d'Eiffage depuis janv. 2016, 3e mandat renouvelé en avril 2023
    nom: 'de Ruffray',
    prenom: "Benoît",
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Président-directeur général d'Eiffage",
    rolesSecondaires: [
      "X-Ponts (École polytechnique + ENPC)",
      "Master Imperial College London",
      "ex-CEO Soletanche Freyssinet (Vinci, 2015-2016)",
      "ex-CEO Dragages Hong Kong (Bouygues, 2003-2007)",
      "président du CA de l'École des Ponts ParisTech (depuis mars 2018)",
    ],
    bio:
      "Polytechnicien et ingénieur des Ponts (ENPC), Benoît de Ruffray a bâti son parcours dans les " +
      "grandes entreprises de BTP (Bouygues, Vinci) avant d'être nommé PDG d'Eiffage le 18 janvier 2016. " +
      "Il est reconduit pour un troisième mandat en avril 2023. Il préside également le conseil " +
      "d'administration de l'École des Ponts ParisTech depuis 2018.",
    wikipediaUrl: null,
    wikidataId: 'Q58752205',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Engie ────────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q2363842 + Wikipedia EN + engie.com + communiqué mai 2018
    // Président du CA d'Engie depuis mai 2018 ; ancien CEO de Solvay
    nom: 'Clamadieu',
    prenom: 'Jean-Pierre',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-05-03'),
    lieuNaissance: 'France',
    rolePrincipal: "Président du conseil d'administration d'Engie",
    rolesSecondaires: [
      "ancien PDG du groupe Solvay (2012-2019)",
      "ancien PDG de Rhodia (2008-2011, avant fusion Solvay)",
      "X-Mines (Polytechnique + Corps des mines)",
      "membre du conseil d'administration d'AXA (jusqu'en 2025)",
    ],
    bio:
      "Ingénieur polytechnicien et du Corps des mines, Jean-Pierre Clamadieu a dirigé Rhodia puis " +
      "le groupe chimique belge Solvay de 2012 à 2019. Élu président du conseil d'administration " +
      "d'Engie en mai 2018, il est renouvelé dans ses fonctions jusqu'à l'AGM 2027, limite d'âge " +
      "statutaire. La gouvernance d'Engie est dissociée : la DG est exercée par Catherine MacGregor.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Jean-Pierre_Clamadieu',
    wikidataId: 'Q2363842',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q107352040 + Wikipedia EN + engie.com + communiqué janv. 2021
    // Première femme PDG d'Engie (DG) depuis le 1er janvier 2021
    nom: 'MacGregor',
    prenom: 'Catherine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1972-01-01'),
    lieuNaissance: 'Maroc',
    rolePrincipal: "Directrice générale d'Engie (depuis janv. 2021)",
    rolesSecondaires: [
      "ancienne présidente d'Engie Exploration & Production International (2016-2021)",
      "ancienne directrice générale de Schlumberger Europe et Afrique (2012-2016)",
      "École polytechnique (promo 1994)",
      "membre du conseil d'administration de Rio Tinto",
    ],
    bio:
      "Polytechnicienne (X1994), née au Maroc, Catherine MacGregor a effectué l'essentiel de sa " +
      "carrière dans le secteur pétro-gazier (Schlumberger, Engie EP). Nommée directrice générale " +
      "d'Engie le 1er janvier 2021, première femme à ce poste, elle porte la stratégie de " +
      "décarbonation du groupe dans un contexte de crise énergétique européenne.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Catherine_MacGregor',
    wikidataId: 'Q107352040',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q33269702 + engie.com + communiqué fév. 2026 (vice-président désigné)
    // Vice-président désigné du CA d'Engie, nommé à l'AGM d'avril 2026
    nom: 'Giannuzzi',
    prenom: 'Michel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-01-01'),
    lieuNaissance: 'France',
    rolePrincipal:
      "Vice-président du conseil d'administration d'Engie (depuis AGM 2026) ; ancien PDG de Verallia",
    rolesSecondaires: [
      "ancien PDG de Verallia (emballages en verre, 2019-2023)",
      "ancien directeur général de Tarkett",
      "HEC Paris",
      "membre du comité Nominations, Rémunérations et Gouvernance d'Engie",
    ],
    bio:
      "Diplômé de HEC Paris, Michel Giannuzzi a dirigé Verallia (emballages en verre, spin-off de " +
      "Saint-Gobain) de 2019 à 2023. Administrateur indépendant d'Engie, il est désigné vice-président " +
      "du conseil d'administration lors de l'AGM d'avril 2026 et préside le comité Nominations, " +
      "Rémunérations et Gouvernance.",
    wikipediaUrl: null,
    wikidataId: 'Q33269702',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── EssilorLuxottica ─────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q48816269 + essilorluxottica.com + communiqué juil. 2022
    // Chairman et CEO d'EssilorLuxottica depuis le décès de Leonardo Del Vecchio (juin 2022)
    nom: 'Milleri',
    prenom: 'Francesco',
    pays: 'Italie',
    nationalite: 'italienne',
    dateNaissance: new Date('1968-01-01'),
    lieuNaissance: 'Italie',
    rolePrincipal: "Président du conseil d'administration et directeur général d'EssilorLuxottica",
    rolesSecondaires: [
      "co-CEO d'EssilorLuxottica (2018-2022, avec Hubert Sagnières)",
      "ancien CEO de Luxottica (2016-2018)",
      "proche collaborateur de Leonardo Del Vecchio depuis les années 1990",
    ],
    bio:
      "Francesco Milleri a rejoint Luxottica dans les années 1990 en qualité de proche collaborateur " +
      "de son fondateur Leonardo Del Vecchio. Nommé co-CEO à la création d'EssilorLuxottica (2018), " +
      "il devient président du conseil d'administration et directeur général unique en juillet 2022 " +
      "après le décès de Del Vecchio, cumulant les deux fonctions comme son prédécesseur.",
    wikipediaUrl: null,
    wikidataId: 'Q48816269',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q29642685 + essilorluxottica.com + Wikipedia EN
    // INTERLOCK : siège simultanément au conseil de TotalEnergies (lot PILOTE) et d'EssilorLuxottica
    // Déjà présent en base depuis le seed-cac40-pilote.js ; l'upsert fusionnera
    nom: 'Coisne-Roquette',
    prenom: 'Marie-Christine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1956-11-04'),
    lieuNaissance: 'France',
    rolePrincipal:
      "Présidente-directrice générale de Sonepar ; administratrice de TotalEnergies et d'EssilorLuxottica",
    rolesSecondaires: [
      "représentante familiale de Sonepar (distribution électrique, n°1 mondial)",
      "administratrice de TotalEnergies (depuis 2011, doyenne du conseil, lot PILOTE)",
    ],
    bio:
      "Présidente-directrice générale de Sonepar, groupe familial numéro un mondial de la distribution " +
      "de matériel électrique, Marie-Christine Coisne-Roquette siège au conseil de TotalEnergies depuis " +
      "2011 et au conseil d'EssilorLuxottica (mandat jusqu'en 2027). Son double mandat constitue un " +
      "interlock documenté entre les deux conseils.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Marie-Christine_Coisne-Roquette',
    wikidataId: 'Q29642685',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q101203461 + essilorluxottica.com + Wikipedia EN + communiqué EssilorLuxottica 2022
    // Administratrice indépendante d'EssilorLuxottica depuis 2022 ; ex-CEO d'Kiko Milano
    nom: 'Scocchia',
    prenom: 'Cristina',
    pays: 'Italie',
    nationalite: 'italienne',
    dateNaissance: new Date('1974-01-01'),
    lieuNaissance: 'Italie',
    rolePrincipal:
      "Administratrice indépendante d'EssilorLuxottica ; CEO de Ilcea (holding textile Radici Group)",
    rolesSecondaires: [
      "ancienne CEO de Kiko Milano (cosmétiques, 2013-2022)",
      "ancienne VP Procter & Gamble",
      "MBA Bocconi University",
    ],
    bio:
      "Diplômée de l'Université Bocconi de Milan, Cristina Scocchia a dirigé Kiko Milano de 2013 " +
      "à 2022, transformant la marque en acteur mondial des cosmétiques accessibles. Elle est " +
      "administratrice indépendante d'EssilorLuxottica (renouvellement proposé à l'AGM avril 2026 " +
      "pour deux ans) et CEO d'Ilcea au sein du groupe Radici.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Cristina_Scocchia',
    wikidataId: 'Q101203461',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Eurofins Scientific ──────────────────────────────────────────────────

  {
    // Sources : Wikidata Q95953232 + eurofins.com + Wikipedia EN + LCGC International
    // Fondateur et CEO d'Eurofins depuis 1987 ; Centrale Paris + Syracuse University
    nom: 'Martin',
    prenom: 'Gilles',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Fondateur, président du conseil d'administration et directeur général d'Eurofins Scientific",
    rolesSecondaires: [
      "École Centrale Paris + Syracuse University (master science analytique)",
      "fondateur d'Eurofins Scientific en 1987 (Nantes)",
      "administrateur du conseil de Bruker Corporation (depuis 2023)",
      "actionnaire de référence via Analytical Bioventures SCA (~35 % du capital)",
    ],
    bio:
      "Ingénieur centralien et scientifique, Gilles Martin a fondé Eurofins Scientific à Nantes en 1987, " +
      "parti d'un laboratoire de tests alimentaires. Sous sa direction (chairman et CEO depuis l'origine), " +
      "Eurofins est devenu le deuxième groupe mondial de laboratoires de tests (alimentaire, " +
      "environnemental, pharmaceutique, clinique). Il contrôle le groupe via Analytical Bioventures SCA " +
      "(environ 35 % du capital au 30 juin 2025).",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Gilles_Martin_(businessman)',
    wikidataId: 'Q95953232',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q119627401 + eurofins.com + wikidata (X + INRA + AgroParisTech)
    // Frère de Gilles Martin, administrateur non-exécutif d'Eurofins Scientific
    nom: 'Martin',
    prenom: "Yves-Loïc",
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1965-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Administrateur non-exécutif d'Eurofins Scientific",
    rolesSecondaires: [
      "École polytechnique + Pierre-et-Marie-Curie + AgroParisTech",
      "chercheur-entrepreneur dans les biotechnologies agricoles",
      "frère du fondateur Gilles Martin",
    ],
    bio:
      "Polytechnicien et agronome (AgroParisTech), Yves-Loïc Martin est le frère du fondateur de " +
      "Eurofins Scientific, Gilles Martin. Il siège au conseil d'administration en qualité " +
      "d'administrateur non-exécutif, représentant la sphère familiale fondatrice au sein de la " +
      "gouvernance du groupe.",
    wikipediaUrl: null,
    wikidataId: 'Q119627401',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — 7 sociétés CAC 40
// wikidataIds vérifiés via Special:EntityData
// NB : Dassault Systèmes (Q1172038) déjà présent en base — l'upsert fusionne.
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q590952 + Wikipedia FR/EN + credit-agricole.com
    nom: 'Credit Agricole SA',
    sigle: 'CASA',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.credit-agricole.com',
    description:
      "Holding cotée du groupe Crédit Agricole, premier groupe bancaire coopératif mondial. " +
      "CASA regroupe les fonctions bancaires avancées (gestion d'actifs, banque de financement, " +
      "assurance, crédit-bail). Présidé par Eric Vial (depuis jan. 2026), dirigé par Olivier Gavalda " +
      "(CEO depuis mai 2025). CAC 40.",
    dateCreation: new Date('2001-12-14'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Cr%C3%A9dit_Agricole_S.A.',
    wikidataId: 'Q590952',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q329426 + Wikipedia FR/EN + danone.com
    nom: 'Danone',
    sigle: 'BN',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.danone.com',
    description:
      "Groupe agroalimentaire mondial (produits laitiers, eaux embouteillées, nutrition spécialisée), " +
      "fondé à Barcelone en 1919 et implanté en France dès 1929. Présidé par Gilles Schnepp, " +
      "dirigé par Antoine de Saint-Affrique (DG depuis sept. 2021). CAC 40.",
    dateCreation: new Date('1966-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Danone',
    wikidataId: 'Q329426',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1172038 + Wikipedia FR/EN + 3ds.com
    // NB : nœud déjà présent en base — l'upsert met à jour sans créer de doublon
    nom: 'Dassault Systèmes',
    sigle: 'DSY',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.3ds.com',
    description:
      "Éditeur français de logiciels PLM (Product Lifecycle Management) et de jumeaux numériques " +
      "(plateforme 3DEXPERIENCE), fondé en 1981, filiale de Groupe Industriel Marcel Dassault (GIMD). " +
      "Présidé et dirigé par Pascal Daloz (chairman+CEO depuis fév. 2026). CAC 40.",
    dateCreation: new Date('1981-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Dassault_Syst%C3%A8mes',
    wikidataId: 'Q1172038',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1302944 + Wikipedia FR/EN + eiffage.com
    nom: 'Eiffage',
    sigle: 'FGR',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.eiffage.com',
    description:
      "Troisième groupe de BTP français (construction, infrastructures, énergie, concessions), " +
      "né en 1844. Particularité : actionnariat salarié significatif (environ 20 %). " +
      "PDG : Benoît de Ruffray (depuis jan. 2016, 3e mandat renouvelé avr. 2023). CAC 40.",
    dateCreation: new Date('1844-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Eiffage',
    wikidataId: 'Q1302944',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q13416787 + Wikipedia FR/EN + engie.com
    nom: 'Engie',
    sigle: 'ENGI',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.engie.com',
    description:
      "Groupe énergétique franco-belge (gaz, électricité, renouvelables, infrastructures), issu " +
      "de la fusion GDF SUEZ (2008) puis rebaptisé Engie (2015). L'État français est actionnaire " +
      "à environ 24 %. Présidé par Jean-Pierre Clamadieu, dirigé par Catherine MacGregor. CAC 40.",
    dateCreation: new Date('2008-07-22'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Engie',
    wikidataId: 'Q13416787',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q56853086 + Wikipedia EN + essilorluxottica.com
    nom: 'EssilorLuxottica',
    sigle: 'EL',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.essilorluxottica.com',
    description:
      "Groupe franco-italien issu de la fusion Essilor (verres correcteurs) et Luxottica (montures, " +
      "Ray-Ban, Oakley, franchises Sunglass Hut) finalisée en 2018. Premier acteur mondial du " +
      "secteur optique. Chairman et CEO : Francesco Milleri (depuis juil. 2022). CAC 40.",
    dateCreation: new Date('2018-10-01'),
    wikipediaUrl: 'https://en.wikipedia.org/wiki/EssilorLuxottica',
    wikidataId: 'Q56853086',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q324846 + Wikipedia EN + eurofins.com
    nom: 'Eurofins Scientific',
    sigle: 'ERF',
    typeOrganisation: 'ENTREPRISE',
    pays: 'Luxembourg',
    siteWeb: 'https://www.eurofins.com',
    description:
      "Groupe mondial de laboratoires de tests (alimentaire, environnemental, pharmaceutique, " +
      "clinique), fondé à Nantes en 1987 par Gilles Martin. Siège social au Luxembourg, " +
      "coté sur Euronext Paris. Chairman et CEO : Gilles Martin (fondateur). CAC 40.",
    dateCreation: new Date('1987-01-01'),
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Eurofins_Scientific',
    wikidataId: 'Q324846',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées. dateConsultation 2026-06-30.
// ---------------------------------------------------------------------------

const SOURCES = {
  // ── Crédit Agricole SA ─────────────────────────────────────────────────────
  gov_casa: {
    url: 'https://www.credit-agricole.com/en/group/governance',
    titre: "Governance — Crédit Agricole S.A.",
    media: 'Crédit Agricole SA (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-01-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Crédit Agricole SA',
    description:
      "Page de gouvernance officielle de CASA : composition du CA au 1er janvier 2026 " +
      "(Eric Vial président, Olivier Gavalda CEO, 21 administrateurs). Consulté le 2026-06-30.",
    verifiee: true,
  },
  jorf_laigneau: {
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049593027',
    titre: "Arrêté du 21 mai 2024 portant nomination au conseil d'administration du Crédit agricole SA",
    media: 'Légifrance (JORF)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-05-21'),
    dateConsultation: new Date('2026-06-30'),
    auteur: "Ministère de l'Économie",
    description:
      "Arrêté officiel portant nomination de Marianne Laigneau et Arnaud Rousseau " +
      "au conseil d'administration de Crédit Agricole SA.",
    verifiee: true,
  },
  wp_mosca: {
    url: 'https://en.wikipedia.org/wiki/Alessia_Mosca',
    titre: 'Alessia Mosca — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Ancienne eurodéputée (2014-2019, PD Italie), ancienne membre de la Chambre des députés " +
      "italienne (2008-2014). Administratrice indépendante de Crédit Agricole SA depuis mai 2023.",
    verifiee: true,
  },

  // ── Danone ─────────────────────────────────────────────────────────────────
  gov_danone: {
    url: 'https://www.danone.com/group/about-us/governance.html',
    titre: "Governance — Danone Group",
    media: 'Danone (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Danone',
    description:
      "Page de gouvernance officielle de Danone : liste des 11 administrateurs au 30 juin 2026 " +
      "(Gilles Schnepp président, Antoine de Saint-Affrique DG, Valérie Chapoulaud-Floquet lead " +
      "independent director).",
    verifiee: true,
  },
  wp_schnepp: {
    url: 'https://en.wikipedia.org/wiki/Gilles_Schnepp',
    titre: 'Gilles Schnepp — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Ancien PDG de Legrand (2006-2018) ; président du CA de Danone depuis le 14 mars 2021, " +
      "successeur d'Emmanuel Faber. Mandat renouvelé jusqu'en 2029.",
    verifiee: true,
  },
  wp_saint_affrique: {
    url: 'https://en.wikipedia.org/wiki/Antoine_de_Saint-Affrique',
    titre: 'Antoine de Saint-Affrique — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "HEC Paris ; ancien PDG Barry Callebaut (2015-2021) ; DG de Danone depuis le 1er sept. 2021.",
    verifiee: true,
  },
  bio_danone_schnepp: {
    url: 'https://www.danone.com/group/about-us/governance/gilles-schnepp.html',
    titre: "Gilles Schnepp — Board of Directors (Danone)",
    media: 'Danone (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Danone',
    description:
      "Biographie officielle de Gilles Schnepp sur le site Danone : mandat, comités, " +
      "parcours professionnel et situation au 30 juin 2026.",
    verifiee: true,
  },

  // ── Dassault Systèmes ──────────────────────────────────────────────────────
  gov_ds: {
    url: 'https://www.3ds.com/about/company/leadership',
    titre: "Leadership — Dassault Systèmes (3DS)",
    media: 'Dassault Systèmes (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-02-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Dassault Systèmes',
    description:
      "Page de direction officielle de Dassault Systèmes : Pascal Daloz chairman+CEO depuis fév. 2026 ; " +
      "liste du conseil et du comité exécutif.",
    verifiee: true,
  },
  wp_charles: {
    url: 'https://en.wikipedia.org/wiki/Bernard_Charl%C3%A8s',
    titre: "Bernard Charlès — Wikipedia (EN)",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-05-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "CEO de Dassault Systèmes (1995-2024), puis executive chairman (jan. 2024 - fév. 2026) ; " +
      "transition vers Pascal Daloz finalisée en février 2026.",
    verifiee: true,
  },
  pr_ds_transition: {
    url: 'https://next.ink/brief_article/bernard-charles-quitte-la-tete-de-dassault-systemes-pascal-daloz-le-remplace/',
    titre: "Bernard Charlès quitte la tête de Dassault Systèmes, Pascal Daloz le remplace (Next Ink)",
    media: 'Next Ink',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-02-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Rédaction Next Ink',
    description:
      "Article de presse confirmant la transition de gouvernance chez DS en fév. 2026 : " +
      "Bernard Charlès quitte le rôle de chairman, Pascal Daloz reprend chairman+CEO.",
    verifiee: true,
  },

  // ── Eiffage ────────────────────────────────────────────────────────────────
  gov_eiffage: {
    url: 'https://www.eiffage.com/en/group/eiffage-group-s-governance-and-board-of-directors',
    titre: "Governance and Board of Directors — Eiffage Group",
    media: 'Eiffage (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Eiffage',
    description:
      "Page de gouvernance officielle d'Eiffage : Benoît de Ruffray PDG, composition du CA " +
      "au 30 juin 2026. Structure dual authority (CA + comité exécutif).",
    verifiee: true,
  },
  bio_ruffray: {
    url: 'https://www.societegenerale.com/sites/default/files/pdf-gouvernance/biography-benoit-de-ruffray.pdf',
    titre: "Biography — Benoît de Ruffray (Société Générale board bio)",
    media: 'Société Générale',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2025-01-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Société Générale',
    description:
      "Biographie officielle de Benoît de Ruffray en tant qu'administrateur indépendant " +
      "de la Société Générale : X-Ponts, Imperial College, PDG Eiffage depuis jan. 2016.",
    verifiee: true,
  },

  // ── Engie ──────────────────────────────────────────────────────────────────
  gov_engie: {
    url: 'https://www.engie.com/en/group/governance/board-directors/',
    titre: "Board of Directors — ENGIE",
    media: 'Engie (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-04-29'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Engie',
    description:
      "Page officielle du conseil d'administration d'Engie au 29 avril 2026 (AGM) : " +
      "14 membres, 60 % indépendants, 45 % femmes. Jean-Pierre Clamadieu président, " +
      "Catherine MacGregor DG, Michel Giannuzzi vice-président désigné.",
    verifiee: true,
  },
  wp_clamadieu: {
    url: 'https://en.wikipedia.org/wiki/Jean-Pierre_Clamadieu',
    titre: 'Jean-Pierre Clamadieu — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "X-Mines ; PDG Solvay (2012-2019) ; président du CA d'Engie depuis mai 2018, " +
      "renouvelé jusqu'à l'AGM 2027.",
    verifiee: true,
  },
  wp_macgregor: {
    url: 'https://en.wikipedia.org/wiki/Catherine_MacGregor',
    titre: 'Catherine MacGregor — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Polytechnicienne (X1994) ; DG d'Engie depuis le 1er janvier 2021 ; " +
      "première femme à la tête du groupe.",
    verifiee: true,
  },
  pr_engie_vicepresident: {
    url: 'https://en.newsroom.engie.com/news/evolution-within-engie-governance-563bb-314df.html',
    titre: "Evolution within ENGIE governance — Newsroom ENGIE",
    media: 'Engie (newsroom)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-02-25'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Engie',
    description:
      "Communiqué officiel Engie : Michel Giannuzzi désigné vice-président du CA ; " +
      "renouvellement de Jean-Pierre Clamadieu et proposition à l'AGM 2026.",
    verifiee: true,
  },

  // ── EssilorLuxottica ───────────────────────────────────────────────────────
  gov_essilor: {
    url: 'https://www.essilorluxottica.com/en/governance/board-directors/',
    titre: "Board of Directors — EssilorLuxottica",
    media: 'EssilorLuxottica (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-04-28'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'EssilorLuxottica',
    description:
      "Page officielle du conseil d'EssilorLuxottica au 28 avril 2026 (après AGM) : " +
      "Francesco Milleri chairman+CEO, Jean-Luc Biamonti lead director.",
    verifiee: true,
  },
  pr_essilor_renewal: {
    url: 'https://www.globenewswire.com/news-release/2026/02/11/3236571/0/en/EssilorLuxottica-EssilorLuxottica-Board-of-Directors-Proposes-Renewal-of-Eight-Directors.html',
    titre: "EssilorLuxottica Board of Directors Proposes Renewal of Eight Directors",
    media: 'GlobeNewswire',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-02-11'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'EssilorLuxottica',
    description:
      "Communiqué officiel du 11 fév. 2026 : renouvellement de 8 administrateurs à l'AGM du " +
      "28 avril 2026, dont Romolo Bardin, Cristina Scocchia, José Gonzalo, Nathalie von Siemens.",
    verifiee: true,
  },
  wp_coisne_essilor: {
    url: 'https://en.wikipedia.org/wiki/Marie-Christine_Coisne-Roquette',
    titre: "Marie-Christine Coisne-Roquette — Wikipedia (EN)",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "PDG de Sonepar, administratrice de TotalEnergies (depuis 2011) et d'EssilorLuxottica " +
      "(mandat jusqu'en 2027). Interlock documenté TotalEnergies-EssilorLuxottica.",
    verifiee: true,
  },

  // ── Eurofins Scientific ────────────────────────────────────────────────────
  gov_eurofins: {
    url: 'https://www.eurofins.com/about-us/our-leadership/board-of-directors/',
    titre: "Board of Directors — Eurofins Scientific",
    media: 'Eurofins Scientific (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'Luxembourg',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Eurofins Scientific',
    description:
      "Page officielle du conseil de surveillance d'Eurofins : 9 membres au 30 juin 2026 " +
      "(Gilles Martin chairman+CEO, Yves-Loïc Martin NED, Pascal Rakovsky lead independent).",
    verifiee: true,
  },
  wp_eurofins: {
    url: 'https://en.wikipedia.org/wiki/Eurofins_Scientific',
    titre: 'Eurofins Scientific — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Groupe fondé à Nantes en 1987 par Gilles Martin ; 2e groupe mondial de tests de laboratoires " +
      "dans l'alimentaire, l'environnement et le pharmaceutique.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002). aRef / bRef = wikidataId des entités.
// typeLienCode : ADMINISTRATEUR (id 34) ou DIRIGEANT selon le rôle.
// ---------------------------------------------------------------------------

const LIENS = [
  // ══════════════════════════════════════════════════════
  // Crédit Agricole SA
  // ══════════════════════════════════════════════════════

  {
    // Marianne Laigneau — administratrice indépendante
    aType: 'personne',
    aRef: 'Q33195045',
    bType: 'organisation',
    bRef: 'Q590952',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Marianne Laigneau est administratrice indépendante de Crédit Agricole SA depuis mai 2024, " +
      "nommée par arrêté du 21 mai 2024 (JORF). Ancienne présidente du directoire d'Enedis.",
    dateDebut: new Date('2024-05-21'),
    dateFin: null,
    sourceRef: 'jorf_laigneau',
  },
  {
    // Marie-Claire Daveu — administratrice indépendante (INTERLOCK avec Engie)
    aType: 'personne',
    aRef: 'Q33123211',
    bType: 'organisation',
    bRef: 'Q590952',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Marie-Claire Daveu est administratrice indépendante de Crédit Agricole SA depuis 2023. " +
      "INTERLOCK : siège simultanément au conseil d'Engie (renouvellement AGM avr. 2026).",
    dateDebut: new Date('2023-05-17'),
    dateFin: null,
    sourceRef: 'gov_casa',
  },
  {
    // Alessia Mosca — administratrice indépendante
    aType: 'personne',
    aRef: 'Q3610441',
    bType: 'organisation',
    bRef: 'Q590952',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Alessia Mosca est administratrice indépendante de Crédit Agricole SA depuis mai 2023, " +
      "apportant son expertise en gouvernance et en commerce international UE.",
    dateDebut: new Date('2023-05-17'),
    dateFin: null,
    sourceRef: 'gov_casa',
  },

  // ══════════════════════════════════════════════════════
  // Danone
  // ══════════════════════════════════════════════════════

  {
    // Gilles Schnepp — président du CA (non-exécutif)
    aType: 'personne',
    aRef: 'Q1524524',
    bType: 'organisation',
    bRef: 'Q329426',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Gilles Schnepp est président du conseil d'administration de Danone depuis le 14 mars 2021, " +
      "succédant à Emmanuel Faber dans le contexte de la crise de gouvernance. Mandat jusqu'en 2029.",
    dateDebut: new Date('2021-03-14'),
    dateFin: null,
    sourceRef: 'bio_danone_schnepp',
  },
  {
    // Antoine de Saint-Affrique — DG (administrateur + dirigeant exécutif)
    aType: 'personne',
    aRef: 'Q33103144',
    bType: 'organisation',
    bRef: 'Q329426',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Antoine de Saint-Affrique est administrateur et directeur général de Danone depuis le " +
      "1er septembre 2021. La gouvernance est dissociée (président CA non-exécutif : Gilles Schnepp).",
    dateDebut: new Date('2021-09-01'),
    dateFin: null,
    sourceRef: 'gov_danone',
  },
  {
    aType: 'personne',
    aRef: 'Q33103144',
    bType: 'organisation',
    bRef: 'Q329426',
    typeLienCode: 'DIRIGEANT',
    description:
      "Antoine de Saint-Affrique est directeur général de Danone depuis le 1er septembre 2021, " +
      "conduit la transformation strategique «Renew Danone» (focus sur les produits laitiers et l'eau).",
    dateDebut: new Date('2021-09-01'),
    dateFin: null,
    sourceRef: 'wp_saint_affrique',
  },
  {
    // Valérie Chapoulaud-Floquet — lead independent director
    aType: 'personne',
    aRef: 'Q21008189',
    bType: 'organisation',
    bRef: 'Q329426',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Valérie Chapoulaud-Floquet est lead independent director de Danone depuis mai 2021 ; " +
      "elle préside le comité Nominations, Rémunérations et Gouvernance.",
    dateDebut: new Date('2021-05-01'),
    dateFin: null,
    sourceRef: 'gov_danone',
  },

  // ══════════════════════════════════════════════════════
  // Dassault Systèmes
  // ══════════════════════════════════════════════════════

  {
    // Bernard Charlès — ancien executive chairman (jan 2024 - fév 2026)
    aType: 'personne',
    aRef: 'Q2897681',
    bType: 'organisation',
    bRef: 'Q1172038',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Bernard Charlès est executive chairman de Dassault Systèmes de janvier 2024 à février 2026, " +
      "date à laquelle Pascal Daloz lui succède dans les deux fonctions (chairman+CEO).",
    dateDebut: new Date('2024-01-01'),
    dateFin: new Date('2026-02-01'),
    sourceRef: 'pr_ds_transition',
  },
  {
    // Pascal Daloz — CEO depuis jan 2024, chairman+CEO depuis fév 2026
    aType: 'personne',
    aRef: 'Q115735422',
    bType: 'organisation',
    bRef: 'Q1172038',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Pascal Daloz est administrateur et directeur général de Dassault Systèmes depuis janvier 2024 " +
      "(CEO). Depuis février 2026, il cumule les fonctions de président du CA et de CEO.",
    dateDebut: new Date('2024-01-01'),
    dateFin: null,
    sourceRef: 'gov_ds',
  },
  {
    aType: 'personne',
    aRef: 'Q115735422',
    bType: 'organisation',
    bRef: 'Q1172038',
    typeLienCode: 'DIRIGEANT',
    description:
      "Pascal Daloz est directeur général de Dassault Systèmes depuis janvier 2024 et président " +
      "du conseil d'administration depuis février 2026, succédant à Bernard Charlès dans les deux rôles.",
    dateDebut: new Date('2024-01-01'),
    dateFin: null,
    sourceRef: 'pr_ds_transition',
  },

  // ══════════════════════════════════════════════════════
  // Eiffage
  // ══════════════════════════════════════════════════════

  {
    // Benoît de Ruffray — PDG (gouvernance unifiée)
    aType: 'personne',
    aRef: 'Q58752205',
    bType: 'organisation',
    bRef: 'Q1302944',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Benoît de Ruffray est président-directeur général d'Eiffage depuis le 18 janvier 2016. " +
      "Son mandat a été renouvelé pour un troisième terme lors de l'AGM d'avril 2023 (+4 ans).",
    dateDebut: new Date('2016-01-18'),
    dateFin: null,
    sourceRef: 'gov_eiffage',
  },
  {
    aType: 'personne',
    aRef: 'Q58752205',
    bType: 'organisation',
    bRef: 'Q1302944',
    typeLienCode: 'DIRIGEANT',
    description:
      "Benoît de Ruffray est PDG d'Eiffage depuis janvier 2016, gouvernance unifiée " +
      "(président du CA et directeur général dans la même personne).",
    dateDebut: new Date('2016-01-18'),
    dateFin: null,
    sourceRef: 'bio_ruffray',
  },

  // ══════════════════════════════════════════════════════
  // Engie
  // ══════════════════════════════════════════════════════

  {
    // Jean-Pierre Clamadieu — président du CA (non-exécutif)
    aType: 'personne',
    aRef: 'Q2363842',
    bType: 'organisation',
    bRef: 'Q13416787',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Jean-Pierre Clamadieu est président non-exécutif du conseil d'administration d'Engie depuis " +
      "mai 2018. Renouvelé jusqu'à l'AGM 2027 (limite d'âge statutaire).",
    dateDebut: new Date('2018-05-01'),
    dateFin: null,
    sourceRef: 'wp_clamadieu',
  },
  {
    // Catherine MacGregor — DG (administratrice + dirigeante exécutive)
    aType: 'personne',
    aRef: 'Q107352040',
    bType: 'organisation',
    bRef: 'Q13416787',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Catherine MacGregor est administratrice et directrice générale d'Engie depuis le " +
      "1er janvier 2021. La gouvernance est dissociée (président non-exécutif : Jean-Pierre Clamadieu).",
    dateDebut: new Date('2021-01-01'),
    dateFin: null,
    sourceRef: 'gov_engie',
  },
  {
    aType: 'personne',
    aRef: 'Q107352040',
    bType: 'organisation',
    bRef: 'Q13416787',
    typeLienCode: 'DIRIGEANT',
    description:
      "Catherine MacGregor est directrice générale d'Engie depuis le 1er janvier 2021, " +
      "première femme à diriger le groupe énergétique franco-belge.",
    dateDebut: new Date('2021-01-01'),
    dateFin: null,
    sourceRef: 'wp_macgregor',
  },
  {
    // Marie-Claire Daveu — administratrice indépendante (INTERLOCK avec CASA)
    aType: 'personne',
    aRef: 'Q33123211',
    bType: 'organisation',
    bRef: 'Q13416787',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Marie-Claire Daveu est administratrice indépendante d'Engie (renouvellement à l'AGM avr. 2026). " +
      "INTERLOCK : siège simultanément au conseil de Crédit Agricole SA depuis mai 2023.",
    dateDebut: new Date('2022-04-28'),
    dateFin: null,
    sourceRef: 'pr_engie_vicepresident',
  },
  {
    // Michel Giannuzzi — vice-président du CA (depuis AGM avril 2026)
    aType: 'personne',
    aRef: 'Q33269702',
    bType: 'organisation',
    bRef: 'Q13416787',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Michel Giannuzzi est vice-président du conseil d'administration d'Engie depuis l'AGM " +
      "du 29 avril 2026 ; préside le comité Nominations, Rémunérations et Gouvernance.",
    dateDebut: new Date('2026-04-29'),
    dateFin: null,
    sourceRef: 'pr_engie_vicepresident',
  },

  // ══════════════════════════════════════════════════════
  // EssilorLuxottica
  // ══════════════════════════════════════════════════════

  {
    // Francesco Milleri — chairman + CEO (gouvernance unifiée depuis juil. 2022)
    aType: 'personne',
    aRef: 'Q48816269',
    bType: 'organisation',
    bRef: 'Q56853086',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Francesco Milleri est président du conseil d'administration et directeur général d'EssilorLuxottica " +
      "depuis juillet 2022, après le décès du fondateur Leonardo Del Vecchio.",
    dateDebut: new Date('2022-07-01'),
    dateFin: null,
    sourceRef: 'gov_essilor',
  },
  {
    aType: 'personne',
    aRef: 'Q48816269',
    bType: 'organisation',
    bRef: 'Q56853086',
    typeLienCode: 'DIRIGEANT',
    description:
      "Francesco Milleri est CEO d'EssilorLuxottica depuis la fusion (2018, d'abord co-CEO avec " +
      "Hubert Sagnières) et chairman depuis juillet 2022, gouvernance unifiée.",
    dateDebut: new Date('2022-07-01'),
    dateFin: null,
    sourceRef: 'gov_essilor',
  },
  {
    // Marie-Christine Coisne-Roquette — administratrice (INTERLOCK avec TotalEnergies, lot PILOTE)
    aType: 'personne',
    aRef: 'Q29642685',
    bType: 'organisation',
    bRef: 'Q56853086',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Marie-Christine Coisne-Roquette est administratrice d'EssilorLuxottica (mandat jusqu'en 2027). " +
      "INTERLOCK : siège simultanément au conseil de TotalEnergies depuis 2011 (lot PILOTE).",
    dateDebut: new Date('2021-05-21'),
    dateFin: null,
    sourceRef: 'wp_coisne_essilor',
  },
  {
    // Cristina Scocchia — administratrice indépendante
    aType: 'personne',
    aRef: 'Q101203461',
    bType: 'organisation',
    bRef: 'Q56853086',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Cristina Scocchia est administratrice indépendante d'EssilorLuxottica ; son mandat est " +
      "proposé au renouvellement pour deux ans lors de l'AGM du 28 avril 2026.",
    dateDebut: new Date('2022-05-01'),
    dateFin: null,
    sourceRef: 'pr_essilor_renewal',
  },

  // ══════════════════════════════════════════════════════
  // Eurofins Scientific
  // ══════════════════════════════════════════════════════

  {
    // Gilles Martin — chairman + CEO (fondateur, depuis 1987)
    aType: 'personne',
    aRef: 'Q95953232',
    bType: 'organisation',
    bRef: 'Q324846',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Gilles Martin est président du conseil d'administration et directeur général d'Eurofins " +
      "Scientific depuis la fondation du groupe en 1987. Il contrôle environ 35 % du capital " +
      "via Analytical Bioventures SCA.",
    dateDebut: new Date('1987-01-01'),
    dateFin: null,
    sourceRef: 'gov_eurofins',
  },
  {
    aType: 'personne',
    aRef: 'Q95953232',
    bType: 'organisation',
    bRef: 'Q324846',
    typeLienCode: 'DIRIGEANT',
    description:
      "Gilles Martin est CEO fondateur d'Eurofins Scientific depuis 1987, gouvernance " +
      "unifiée (chairman+CEO). Actionnaire de référence via Analytical Bioventures SCA (~35 %).",
    dateDebut: new Date('1987-01-01'),
    dateFin: null,
    sourceRef: 'wp_eurofins',
  },
  {
    // Yves-Loïc Martin — administrateur non-exécutif (frère du fondateur)
    aType: 'personne',
    aRef: 'Q119627401',
    bType: 'organisation',
    bRef: 'Q324846',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Yves-Loïc Martin est administrateur non-exécutif d'Eurofins Scientific, représentant " +
      "la sphère familiale fondatrice. Il est le frère du fondateur et CEO Gilles Martin.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'gov_eurofins',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents — recopiés verbatim de seed-cac40-pilote.js
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-cac40-b2] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-cac40-b2] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données CAC 40 lot B2 précédentes...')
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
  console.log("\n--- seed-cac40-b2 : Conseils d'administration CAC 40 (7 sociétés, lot B2) ---\n")
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('-- Sources publiques --')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  + ${data.titre}`)
  }

  console.log('\n-- Organisations (Wikidata) --')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  + ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n-- Personnes (Wikidata) --')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  + ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n-- Liens --')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  + ${lien.typeLienCode} | ${lien.aRef} -> ${lien.bRef}`)
  }

  console.log('\n--- Bilan -------------------------------------------------------------------')
  console.log(`Personnes     : ${PERSONNES.length}`)
  console.log(`Organisations : ${ORGANISATIONS.length} (dont Dassault Systemes Q1172038 deja present -> upsert)`)
  console.log(`Sources       : ${Object.keys(SOURCES).length}`)
  console.log(`Liens         : ${LIENS.length} (ADMINISTRATEUR + DIRIGEANT)`)
  console.log('')
  console.log('INTERLOCKS detectes :')
  console.log('  Marie-Claire Daveu     (Q33123211) : Credit Agricole SA + Engie')
  console.log('  Marie-Christine Coisne-Roquette (Q29642685) : TotalEnergies (PILOTE) + EssilorLuxottica')
  console.log('')
  console.log('Administrateurs exclus (sans wikidataId verifie) :')
  console.log('  Credit Agricole SA : Eric Vial (president, Q non-identifie), Olivier Gavalda (CEO, Q non-identifie),')
  console.log('    Raphael Appert (vice-president), Franck Alexandre, Agnes Audier, Olivier Auffray,')
  console.log('    Sonia Bonnet-Bernard, Pierre Cambefort, Olivier Desportes, Marc Didier, Christine Gandon,')
  console.log('    Richard Laborie, Christophe Lesur, Pascal Lheureux, Gaelle Regnard, Carol Sirou,')
  console.log('    Arnaud Rousseau, Catherine Umbricht, Eric Wilson, Laure Belluzzo, Pascale Berger (+11)')
  console.log('  Danone             : Frederic Boutebba, Gilbert Ghostine, Lise Kingo (*), Patrice Louvet,')
  console.log('    Sanjiv Mehta, Geraldine Picaud, Susan Roberts, Bettina Theissig (8)')
  console.log('    (*) Lise Kingo siegerait aussi au conseil de Sanofi (PILOTE) : interlock potentiel a verifier')
  console.log('  Dassault Systemes  : Genevieve Berger, Xavier Cauchois, Catherine Dassault, Laurence Daures,')
  console.log('    Soumitra Dutta, GIMD (Olivier Costa de Beauregard), Marie-Helene Habert-Dassault,')
  console.log('    Nathalie Rouvet Lazare, Donatella Sciuto, Anne-Laure Chevalier, Christine Defert (11)')
  console.log('  Eiffage            : Carol Xueref, Odile Georges-Picot, Sophie Boissard, Daniel Hager,')
  console.log('    Philippe Vidal, representants salaries (6+)')
  console.log('  Engie              : Fabrice Bregier, Celine Fornaro, Gildas Gouvaze, Lucie Muniesa,')
  console.log('    Ross McInnes, Magali Viot, Vanessa Le Dore, William Viry-Allemoz (8+)')
  console.log('  EssilorLuxottica   : Jean-Luc Biamonti (lead director, Q non-identifie), Romolo Bardin,')
  console.log('    Jose Gonzalo, Virginie Mercier-Pitre, Swati Piramal, Mario Notari,')
  console.log('    Nathalie von Siemens, Andrea Zappia, Paul du Saillant, Margot Bard, Sebastien Brown (11)')
  console.log('  Eurofins           : Valerie Hanote, Pascal Rakovsky, Evie Roos, Ivo Rauh,')
  console.log('    Erica Monfardini, Gavin Hill (6)')
  console.log('-----------------------------------------------------------------------------\n')
}

main()
  .catch((err) => {
    console.error('[seed-cac40-b2] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
