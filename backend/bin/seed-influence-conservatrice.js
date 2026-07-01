/**
 * Seed Influence Conservatrice — écosystème d'influence conservateur/réactionnaire français.
 * Enquête OSINT journalistique du 2026-06-30.
 *
 * Périmètre :
 *   — Pierre-Édouard Stérin : Smartbox, Otium Capital, Fonds du Bien Commun, projet Périclès.
 *   — Alexandre Pesey : Institut de Formation Politique (IFP), conseiller du projet Périclès.
 *   — Philippe de Villiers : Puy du Fou, vecteur d'influence culturelle catholique-identitaire.
 *
 * « Stella Domini » — EXCLUE (entité identifiée, lien non documenté).
 *   Stella Domini (SIREN 843697327, Lyon) est un fonds de dotation créé en novembre 2018
 *   par Loïc Labouche (groupe DOMINO RH), sans lien documenté avec Pierre-Édouard Stérin.
 *   Aucune source journalistique publique fiable ne relie Stella Domini au projet Périclès
 *   ou au Fonds du Bien Commun. Site : stelladomini.org (consulté 2026-06-30).
 *
 * Garde-fous déontologiques (art. 9 RGPD — données sensibles, opinions politiques) :
 *   — Toutes les entités en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto.
 *   — Toute caractérisation idéologique ou politique attribuée explicitement à la source.
 *   — Présomption d'innocence respectée : aucune affaire judiciaire confondue avec condamnation.
 *   — wikidataId tous vérifiés via wbsearchentities + Special:EntityData (2026-06-30).
 *   — Idempotent (upsert par wikidataId).
 *
 * Sources : Wikidata (Q-ids vérifiés), Wikipédia FR, Observatoire des multinationales,
 *           Médiacités, StreetPress, Public Sénat.
 *
 * Usage :
 *   cd backend && node bin/seed-influence-conservatrice.js
 *   cd backend && node bin/seed-influence-conservatrice.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — chaque fiche recoupée par ≥ 2 sources publiques.
// Données sensibles (art. 9 RGPD) : statut EN_ATTENTE strict, qualiteInfluence obligatoire.
// Toute caractérisation idéologique est attribuée à la source qui la produit.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q56305953 (vérifié wbsearchentities, 2026-06-30) + Wikipédia FR
    // Rôle public attesté : PDG de Smartbox (2003-), fondateur Otium Capital (2009),
    //                       Fonds du Bien Commun (2021), projet Périclès (2023).
    // NB : les activités du projet Périclès sont décrites par la presse d'enquête
    //      (La Lettre avr. 2024, L'Humanité juil. 2024) — formulations attribuées aux sources.
    nom: 'Stérin',
    prenom: 'Pierre-Édouard',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1974-01-03'),
    lieuNaissance: 'Évreux (Eure)',
    rolePrincipal: "Entrepreneur, fondateur et PDG de Smartbox",
    rolesSecondaires: [
      "fondateur et PDG d'Otium Capital (holding familial, depuis 2009)",
      "fondateur du Fonds du Bien Commun (fonds de dotation, 2021)",
      "fondateur du projet Périclès (2023), décrit par L'Humanité (juil. 2024) comme un plan d'influence idéologique doté de 150 M€ sur dix ans",
    ],
    bio:
      "Né le 3 janvier 1974 à Évreux, Pierre-Édouard Stérin a cofondé en 2003 la société " +
      "Smartbox (coffrets-cadeaux), source d'une fortune estimée à 1,4 milliard d'euros (Wikipédia, 2026). " +
      "Via Otium Capital (créé le 30 avril 2009), il gère un portefeuille d'investissement. " +
      "En 2021, il crée le Fonds du Bien Commun ; en 2023, le projet Périclès, décrit par " +
      "La Lettre (11 avr. 2024) et L'Humanité (19 juil. 2024) comme un plan d'influence idéologique.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Pierre-%C3%89douard_St%C3%A9rin',
    wikidataId: 'Q56305953',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q41097556 (vérifié wbsearchentities, 2026-06-30) + Wikipédia FR
    // Rôle public attesté : directeur exécutif de l'IFP depuis 2004.
    // NB : son rôle dans le projet Périclès est documenté par La Lettre (avr. 2024) et
    //      Wikipédia FR (Projet Périclès) — formulations attribuées à ces sources.
    // Date de naissance : non disponible dans les sources publiques consultées.
    nom: 'Pesey',
    prenom: 'Alexandre',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: "Fondateur et directeur exécutif de l'Institut de Formation Politique (IFP)",
    rolesSecondaires: [
      "fondateur de la Bourse Tocqueville (2003)",
      "fondateur de l'Institut libre de journalisme (2018)",
      "directeur du développement à l'ESJ Paris (depuis décembre 2024)",
      "présenté comme 'conseiller opérationnel' du projet Périclès dans le document révélé par L'Humanité (juillet 2024)",
    ],
    bio:
      "Juriste (Paris II-Assas) et manager (EM Lyon), Alexandre Pesey a cofondé en 2004 " +
      "l'Institut de Formation Politique (IFP), organisme décrit par Wikidata comme " +
      "'libéral-conservateur'. Selon l'article Wikipédia du Projet Périclès, il a présenté " +
      "la Heritage Foundation à Pierre-Édouard Stérin, lui inspirant la création du projet Périclès. " +
      "Selon La Lettre (11 avr. 2024), il est présenté comme 'conseiller opérationnel' de ce projet.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Alexandre_Pesey',
    wikidataId: 'Q41097556',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q704846 (vérifié wbsearchentities, 2026-06-30) + Wikipédia FR
    // Rôle public attesté : fondateur du Puy du Fou (1977), fondateur du MPF (1994),
    //                       candidat présidentiel (1995, 2007), essayiste, chroniqueur.
    // NB : la portée idéologique du Puy du Fou est documentée par StreetPress (2022)
    //      et des historiens académiques — formulations attribuées à ces sources.
    nom: 'de Villiers',
    prenom: 'Philippe',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1949-03-25'),
    lieuNaissance: 'Boulogne (Vendée)',
    rolePrincipal: "Entrepreneur culturel, fondateur du Puy du Fou",
    rolesSecondaires: [
      "fondateur du Mouvement pour la France (MPF, 1994)",
      "candidat à l'élection présidentielle (1995 : 4,74 % ; 2007 : 2,23 %)",
      "ancien secrétaire d'État chargé des Loisirs, du Tourisme et de la Mer (1987-1988)",
      "essayiste (nombreux ouvrages sur l'histoire de France et la civilisation chrétienne)",
      "chroniqueur hebdomadaire sur CNews (« Face à Philippe de Villiers » depuis sept. 2023)",
    ],
    bio:
      "Né le 25 mars 1949 à Boulogne (Vendée), diplômé de Sciences Po Paris et de l'ENA, " +
      "Philippe de Villiers a fondé le Puy du Fou en 1977 (association loi 1901). Selon StreetPress " +
      "(2022) et les historiens Michel Vovelle et Valérie Sottocasa (cités par StreetPress), " +
      "le parc véhicule, selon ses critiques, un discours 'anti-moderne, anti-Lumières et " +
      "contre-révolutionnaire'. Fondateur du MPF (1994) et essayiste catholique-souverainiste.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Philippe_de_Villiers',
    wikidataId: 'Q704846',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q126723339 (vérifié Special:EntityData, 2026-06-30) + Wikipédia FR (Stérin)
    // P571 = 30 avril 2009 ; P112 = Q56305953 (Stérin)
    nom: 'Otium Capital',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: null,
    description:
      "Holding familiale d'investissement de Pierre-Édouard Stérin, créée le 30 avril 2009 " +
      "(initialement sous le nom Smart Co Ventures). Gère un portefeuille d'environ 1,6 milliard " +
      "d'euros d'actifs (2024, Wikipédia FR). Véhicule principal des investissements entrepreneuriaux " +
      "de Stérin, distinct de ses activités philanthropiques (Fonds du Bien Commun).",
    dateCreation: new Date('2009-04-30'),
    wikipediaUrl: null,
    wikidataId: 'Q126723339',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q122816418 (vérifié wbsearchentities, 2026-06-30) + Wikipédia FR (Stérin)
    // P571 = 19 janvier 2021 ; P112 = Q56305953 (Stérin)
    // Wikidata description FR : « organisme philanthropique, proche des milieux ultra-conservateurs français »
    nom: 'Fonds du Bien Commun',
    sigle: null,
    typeOrganisation: 'FONDATION',
    pays: 'France',
    siteWeb: null,
    description:
      "Fonds de dotation philanthropique fondé par Pierre-Édouard Stérin le 19 janvier 2021 " +
      "(Wikidata Q122816418). Décrit par Wikidata comme 'proche des milieux ultra-conservateurs français'. " +
      "A servi de structure d'accueil initiale au projet Périclès avant son autonomisation en 2024 " +
      "(Wikipédia FR, Projet Périclès). Distribue des fonds à des associations partenaires.",
    dateCreation: new Date('2021-01-19'),
    wikipediaUrl: null,
    wikidataId: 'Q122816418',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q131386757 (vérifié wbsearchentities, 2026-06-30) + Wikipédia FR
    // Wikidata description FR : « laboratoire d'idées politiques d'extrême droite créé par Pierre Édouard Stérin »
    // NB : la qualification d'extrême droite est celle de Wikidata et de la presse d'enquête —
    //      elle est reproduite ici avec attribution explicite.
    nom: 'Périclès',
    sigle: null,
    typeOrganisation: 'THINK_TANK',
    pays: 'France',
    siteWeb: 'https://periclesfrance.org',
    description:
      "Association déclarée le 18 juillet 2023, fondée par Pierre-Édouard Stérin. " +
      "Décrite par Wikidata comme 'laboratoire d'idées politiques d'extrême droite'. " +
      "Selon L'Humanité (19 juil. 2024), vise à déployer 150 M€ sur dix ans pour promouvoir " +
      "une alliance entre droite et extrême droite. Le Fonds du Bien Commun en était la structure " +
      "d'accueil initiale avant l'autonomisation du projet en 2024.",
    dateCreation: new Date('2023-07-18'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Projet_P%C3%A9ricl%C3%A8s',
    wikidataId: 'Q131386757',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q16643700 (vérifié wbsearchentities, 2026-06-30) + Wikipédia FR (IFP)
    // Wikidata description FR : « organisme de formation libéral-conservateur »
    // P571 = 2004 ; P112 inclut Q41097556 (Pesey), Q133872431 (Millon), Q104029682
    nom: "Institut de Formation Politique",
    sigle: 'IFP',
    typeOrganisation: 'ASSOCIATION',
    pays: 'France',
    siteWeb: 'https://ifpfrance.org',
    description:
      "Organisme de formation décrit par Wikidata comme 'libéral-conservateur', cofondé en " +
      "février 2004 par Alexandre Pesey, Thomas Millon et Jean Martinez (Wikipédia FR). " +
      "Selon La Lettre (avr. 2024), il aurait reçu un soutien financier de Pierre-Édouard Stérin " +
      "via le projet Périclès, confirmé lors d'une audition sénatoriale en mai 2026 " +
      "(Wikipédia FR, Projet Périclès). Siège : 49 rue de Boulainvilliers, Paris 16e.",
    dateCreation: new Date('2004-02-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Institut_de_formation_politique',
    wikidataId: 'Q16643700',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3411109 (vérifié wbsearchentities, 2026-06-30) + Wikipédia FR
    // P112 = Q704846 (Philippe de Villiers) ; P571 = 1989 (Grand Parc)
    // NB : la portée idéologique du Puy du Fou est documentée par des historiens académiques
    //      cités dans la presse d'enquête — formulations attribuées à ces sources.
    nom: 'Puy du Fou',
    sigle: null,
    typeOrganisation: 'ASSOCIATION',
    pays: 'France',
    siteWeb: 'https://www.puydufou.com',
    description:
      "Parc à thème et spectacle historique fondé par Philippe de Villiers en 1977 " +
      "(association loi 1901) en Vendée, Grand Parc ouvert en 1989. 2,8 millions de visiteurs en 2024 " +
      "(Wikidata). Selon StreetPress (2022) et des historiens (Michel Vovelle, Valérie Sottocasa), " +
      "décrit par ses critiques comme véhiculant un discours 'contre-révolutionnaire' et une " +
      "vision catholique-identitaire de l'histoire de France. Présidé par Nicolas de Villiers.",
    dateCreation: new Date('1977-09-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Puy_du_Fou',
    wikidataId: 'Q3411109',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, datées, recoupées (dateConsultation 2026-06-30).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_sterin: {
    url: 'https://fr.wikipedia.org/wiki/Pierre-%C3%89douard_St%C3%A9rin',
    titre: 'Pierre-Édouard Stérin — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 3 jan. 1974 à Évreux. Cofondateur Smartbox (2003), fondateur Otium Capital (2009), " +
      "Fonds du Bien Commun (2021), projet Périclès (2023). Fortune ~1,4 Md€ (2026).",
    verifiee: true,
  },
  wp_pericles: {
    url: 'https://fr.wikipedia.org/wiki/Projet_P%C3%A9ricl%C3%A8s',
    titre: 'Projet Périclès — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Révélé par La Lettre (11 avr. 2024) et L'Humanité (19 juil. 2024). Budget 150 M€ sur 10 ans. " +
      "Pesey présenté comme 'conseiller opérationnel'. IFP partenaire de Politicæ.",
    verifiee: true,
  },
  wp_ifp: {
    url: 'https://fr.wikipedia.org/wiki/Institut_de_formation_politique',
    titre: 'Institut de formation politique — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Fondé en février 2004 par Pesey, Millon et Martinez. Formation libéral-conservatrice. " +
      "Financement Stérin via Périclès confirmé lors d'une audition sénatoriale en mai 2026.",
    verifiee: true,
  },
  wp_pesey: {
    url: 'https://fr.wikipedia.org/wiki/Alexandre_Pesey',
    titre: 'Alexandre Pesey — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Entrepreneur, directeur de l'IFP depuis 2004, fondateur Bourse Tocqueville (2003) et " +
      "Institut libre de journalisme (2018). Lié au projet Périclès selon la presse d'enquête 2024.",
    verifiee: true,
  },
  wp_villiers: {
    url: 'https://fr.wikipedia.org/wiki/Philippe_de_Villiers',
    titre: 'Philippe de Villiers — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 25 mars 1949 à Boulogne (Vendée). ENA, fondateur Puy du Fou (1977), MPF (1994). " +
      "Candidat présidentiel 1995 (4,74 %) et 2007 (2,23 %). Chroniqueur CNews depuis 2023.",
    verifiee: true,
  },
  wp_puy_du_fou: {
    url: 'https://fr.wikipedia.org/wiki/Puy_du_Fou',
    titre: 'Puy du Fou — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Parc fondé par Philippe de Villiers (association 1977, Grand Parc 1989). 2,8 M visiteurs en 2024. " +
      "Présidé par Nicolas de Villiers. Structure : association loi 1901 + holding Puy du Fou Stratégie.",
    verifiee: true,
  },
  observatoire_ifp: {
    url: 'https://multinationales.org/fr/enquetes/le-reseau-atlas-la-france-et-l-extreme-droitisation-des-esprits/l-institut-de-formation-politique-vivier-des-droites-radicales-et-de-leur-union',
    titre: "L'Institut de formation politique, vivier des droites radicales et de leur union",
    media: 'Observatoire des multinationales',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: null,
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Enquête sur l'IFP comme vivier des droites radicales. Pesey lié aux réseaux Atlas et à " +
      "Contribuables Associés. Financement Stérin via Périclès documenté.",
    verifiee: true,
  },
  mediacites_sterin: {
    url: 'https://www.mediacites.fr/complement-denquete/national/2025/12/09/nouveaux-apotres-de-lextreme-droite-la-carte-des-associations-soutenues-par-le-milliardaire-pierre-edouard-sterin/',
    titre: "Nouveaux apôtres de l'extrême droite : la carte des associations soutenues par Pierre-Édouard Stérin",
    media: 'Médiacités',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-12-09'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Collectif Hors Cadre / WeDoData',
    description:
      "Cartographie des associations soutenues par l'écosystème Stérin (Fonds du Bien Commun, " +
      "projet Périclès). Réalisée par le collectif Hors Cadre avec WeDoData.",
    verifiee: true,
  },
  streetpress_puy: {
    url: 'https://www.streetpress.com/1647880820-puy-fou-discours-anti-moderne-anti-lumieres-contre-revolutionnaire-villiers-zemmour/',
    titre: "« Le Puy du Fou a un discours anti-moderne, anti-Lumières et contre-révolutionnaire »",
    media: 'StreetPress',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2022-03-22'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Analyse du discours du Puy du Fou avec historiens. Vovelle : 'révision spectaculaire de la " +
      "Révolution française'. Sottocasa : 'vision contre-révolutionnaire'. Vecteur d'influence culturelle.",
    verifiee: true,
  },
  pubsenat_pericles: {
    url: 'https://www.publicsenat.fr/actualites/politique/nous-navons-pas-le-moindre-objectif-en-ce-qui-concerne-les-elections-assure-le-directeur-de-pericles-lorgane-dinfluence-de-pierre-edouard-sterin',
    titre: "Le directeur de Périclès, « l'organe d'influence de Pierre-Édouard Stérin », devant le Sénat",
    media: 'Public Sénat',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: null,
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Audition du directeur général de Périclès devant le Sénat. Le titre même de l'article " +
      "qualifie Périclès d'« organe d'influence de Pierre-Édouard Stérin ».",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002), exactement 1 entité non-nulle de chaque côté.
// Chaque entité référencée possède un wikidataId (résolution via trouverEntite).
// Toutes les descriptions attribuent explicitement les claims à leur source.
// ---------------------------------------------------------------------------

const LIENS = [
  // =========================================================================
  // PIERRE-ÉDOUARD STÉRIN — structure de l'écosystème
  // =========================================================================
  {
    // P-O : Stérin fondateur d'Otium Capital (30 avril 2009)
    // Confirmé par Wikidata Q126723339 P112=Q56305953 + Wikipédia FR
    aType: 'personne',
    aRef: 'Q56305953',
    bType: 'organisation',
    bRef: 'Q126723339',
    typeLienCode: 'FONDATEUR',
    description:
      "Pierre-Édouard Stérin a fondé Otium Capital le 30 avril 2009 comme holding familiale " +
      "d'investissement. Confirmé par Wikidata (Q126723339, P112=Q56305953) et Wikipédia FR.",
    dateDebut: new Date('2009-04-30'),
    dateFin: null,
    sourceRef: 'wp_sterin',
  },
  {
    // P-O : Stérin fondateur du Fonds du Bien Commun (19 janvier 2021)
    // Confirmé par Wikidata Q122816418 P112=Q56305953 + Wikipédia FR
    aType: 'personne',
    aRef: 'Q56305953',
    bType: 'organisation',
    bRef: 'Q122816418',
    typeLienCode: 'FONDATEUR',
    description:
      "Pierre-Édouard Stérin a créé le Fonds du Bien Commun le 19 janvier 2021, " +
      "fonds de dotation philanthropique. Confirmé par Wikidata (Q122816418, P112=Q56305953) et Wikipédia FR.",
    dateDebut: new Date('2021-01-19'),
    dateFin: null,
    sourceRef: 'wp_sterin',
  },
  {
    // P-O : Stérin fondateur du projet Périclès (18 juillet 2023)
    // Confirmé par Wikidata Q131386757 P112=Q56305953 + Wikipédia FR
    aType: 'personne',
    aRef: 'Q56305953',
    bType: 'organisation',
    bRef: 'Q131386757',
    typeLienCode: 'FONDATEUR',
    description:
      "Pierre-Édouard Stérin a fondé le projet Périclès (association déclarée le 18 juillet 2023). " +
      "Selon L'Humanité (19 juil. 2024), le projet vise à déployer 150 M€ sur dix ans pour promouvoir " +
      "une alliance entre droite et extrême droite. Confirmé par Wikidata (Q131386757, P112=Q56305953).",
    dateDebut: new Date('2023-07-18'),
    dateFin: null,
    sourceRef: 'wp_pericles',
  },
  {
    // O-O : Fonds du Bien Commun → Périclès (structure d'accueil initiale)
    // Source : Wikipédia FR (Projet Périclès) : « Fonds du bien commun (structure d'accueil initiale) »
    aType: 'organisation',
    aRef: 'Q122816418',
    bType: 'organisation',
    bRef: 'Q131386757',
    typeLienCode: 'institutionnel',
    description:
      "Selon Wikipédia FR (Projet Périclès), le Fonds du Bien Commun de Pierre-Édouard Stérin " +
      "a été la structure d'accueil initiale du projet Périclès avant son autonomisation en 2024 " +
      "(création d'une association-mère, d'un fonds de dotation et d'une association opérationnelle distincts).",
    dateDebut: new Date('2023-07-18'),
    dateFin: new Date('2024-06-01'),
    sourceRef: 'wp_pericles',
  },
  {
    // P-O : Stérin finance l'IFP via le projet Périclès
    // Source : La Lettre (11 avr. 2024) cité par Wikipédia FR (IFP + Projet Périclès) ;
    //          confirmé lors d'une audition sénatoriale en mai 2026 par le directeur général de Périclès.
    aType: 'personne',
    aRef: 'Q56305953',
    bType: 'organisation',
    bRef: 'Q16643700',
    typeLienCode: 'financement',
    description:
      "Selon La Lettre (11 avr. 2024), repris par Wikipédia FR (Projet Périclès et IFP), " +
      "Pierre-Édouard Stérin apporte un soutien financier à l'Institut de Formation Politique " +
      "dans le cadre du projet Périclès. Cette information a été confirmée lors d'une audition " +
      "sénatoriale en mai 2026 par le directeur général de Périclès (Wikipédia FR).",
    dateDebut: new Date('2024-01-01'),
    dateFin: null,
    sourceRef: 'wp_ifp',
  },

  // =========================================================================
  // ALEXANDRE PESEY — IFP et liens avec le réseau Stérin
  // =========================================================================
  {
    // P-O : Pesey cofondateur et directeur de l'IFP (depuis février 2004)
    // Confirmé par Wikidata Q16643700 P112 inclut Q41097556 + Wikipédia FR (IFP et Pesey)
    aType: 'personne',
    aRef: 'Q41097556',
    bType: 'organisation',
    bRef: 'Q16643700',
    typeLienCode: 'FONDATEUR',
    description:
      "Alexandre Pesey a cofondé l'Institut de Formation Politique en février 2004 avec " +
      "Thomas Millon et Jean Martinez. Il en est le directeur exécutif depuis sa création. " +
      "Confirmé par Wikidata (Q16643700, P112 inclut Q41097556) et Wikipédia FR.",
    dateDebut: new Date('2004-02-01'),
    dateFin: null,
    sourceRef: 'wp_ifp',
  },
  {
    // P-P : Pesey a inspiré la création du projet Périclès (lien avec Stérin)
    // Source unique : Wikipédia FR (Projet Périclès) : « Alexandre Pesey présente la Heritage
    // Foundation à Pierre-Édouard Stérin et il s'en inspire pour la création du projet Périclès. »
    // Confidence : medium (1 source — Wikipédia résumant la presse d'enquête 2024).
    aType: 'personne',
    aRef: 'Q41097556',
    bType: 'personne',
    bRef: 'Q56305953',
    typeLienCode: 'institutionnel',
    description:
      "Selon Wikipédia FR (Projet Périclès, citant la presse d'enquête 2024), Alexandre Pesey " +
      "a présenté la Heritage Foundation américaine à Pierre-Édouard Stérin, lui inspirant " +
      "la création du projet Périclès. La Lettre (11 avr. 2024) présente Pesey comme " +
      "'conseiller opérationnel' du projet.",
    dateDebut: new Date('2022-01-01'),
    dateFin: null,
    sourceRef: 'wp_pericles',
  },
  {
    // O-O : IFP partenaire de Politicæ (école de formation des maires rattachée à Périclès)
    // Source : Wikipédia FR (Projet Périclès) : « L'IFP devient partenaire de l'école Politicæ »
    aType: 'organisation',
    aRef: 'Q16643700',
    bType: 'organisation',
    bRef: 'Q131386757',
    typeLienCode: 'institutionnel',
    description:
      "Selon Wikipédia FR (Projet Périclès), l'Institut de Formation Politique est devenu " +
      "partenaire de Politicæ, l'école de formation des maires créée dans le cadre du projet " +
      "Périclès de Pierre-Édouard Stérin.",
    dateDebut: new Date('2023-07-18'),
    dateFin: null,
    sourceRef: 'wp_pericles',
  },

  // =========================================================================
  // PHILIPPE DE VILLIERS — Puy du Fou, vecteur d'influence culturelle
  // =========================================================================
  {
    // P-O : Philippe de Villiers fondateur du Puy du Fou (1977)
    // Confirmé par Wikidata Q3411109 P112=Q704846 + Wikipédia FR
    aType: 'personne',
    aRef: 'Q704846',
    bType: 'organisation',
    bRef: 'Q3411109',
    typeLienCode: 'FONDATEUR',
    description:
      "Philippe de Villiers a fondé le Puy du Fou en septembre 1977 (association loi 1901) " +
      "et développé le Grand Parc à partir de 1989. Confirmé par Wikidata (Q3411109, P112=Q704846) " +
      "et Wikipédia FR. Le parc est décrit par StreetPress (2022) et des historiens comme vecteur " +
      "d'une lecture catholique-identitaire de l'histoire de France.",
    dateDebut: new Date('1977-09-01'),
    dateFin: null,
    sourceRef: 'wp_puy_du_fou',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (verbatim depuis seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-influence-conservatrice] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-influence-conservatrice] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données Influence Conservatrice précédentes...')
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
  console.log('\n-- seed-influence-conservatrice — Stérin/Périclès + IFP/Pesey + Villiers/Puy du Fou --\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok ${data.titre}`)
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
  console.log(`Personnes     : ${PERSONNES.length} (Stérin, Pesey, de Villiers)`)
  console.log(`Organisations : ${ORGANISATIONS.length} (Otium Capital, Fonds du Bien Commun, Périclès, IFP, Puy du Fou)`)
  console.log(`Sources       : ${Object.keys(SOURCES).length} (Wikipédia FR, Observatoire multinationales, Médiacités, StreetPress, Public Sénat)`)
  console.log(`Liens         : ${LIENS.length} (FONDATEUR x4, financement x1, institutionnel x3)`)
  console.log('')
  console.log('NB : « Stella Domini » exclue — fonds de dotation de Loïc Labouche (DOMINO RH, Lyon),')
  console.log('     sans lien documenté avec le réseau Stérin (sources consultées le 2026-06-30).')
  console.log('')
}

main()
  .catch((err) => {
    console.error('[seed-influence-conservatrice] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
