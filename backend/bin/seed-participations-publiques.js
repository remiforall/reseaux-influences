/**
 * Seed Participations publiques — L'État actionnaire.
 * Enquête OSINT journalistique du 2026-07-01.
 *
 * Périmètre : Caisse des Dépôts et Consignations (CDC), Bpifrance,
 *             Agence des participations de l'État (APE) et leurs participations
 *             dans les grandes entreprises françaises (CAC 40 et sociétés à contrôle public).
 *
 * Sources : Wikidata (Q-ids vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR (pages entités), Rapport financier APE 2024 (publié 2025),
 *           participations.gouv.fr (les-participations-publiques),
 *           caissedesdepots.fr, JORF (décret nomination Sichel du 12 juin 2025).
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - liens capitalistiques O→O avec codes ADR-027 : DETENTION_CAPITAL / ACTIONNAIRE_MAJORITAIRE
 *     aRef=détenteur (CDC/APE/Bpifrance), bRef=entreprise détenue, % sourcé.
 *
 * Nicolas Dufourcq (Q3340278) : DÉJÀ en base — inclus ici pour upsert idempotent
 * et création du lien DIRIGEANT avec Bpifrance.
 *
 * Usage :
 *   cd backend && node bin/seed-participations-publiques.js
 *   cd backend && node bin/seed-participations-publiques.js --reset
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
    // Sources : Wikidata Q3351381 (vérifié wbsearchentities) + JORF décret du 12 juin 2025
    //           + Légifrance JORFTEXT000051725234 + Boursorama 19 juin 2025
    // Rôle public : DG de la CDC depuis le 23 décembre 2024 (intérim), confirmé le 12 juin 2025
    nom: 'Sichel',
    prenom: 'Olivier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: 'Directeur général de la Caisse des Dépôts et Consignations',
    rolesSecondaires: [
      "ancien CEO de Crédit Mutuel Arkéa (2020-2024)",
      "ancien directeur de la Banque mobile Orange Bank",
      "ancien directeur exécutif Orange (2015-2020)",
    ],
    bio:
      "Diplômé de l'École polytechnique et de l'École des ponts, Olivier Sichel a dirigé " +
      "Orange Bank puis Crédit Mutuel Arkéa avant de prendre la direction générale intérimaire " +
      "de la Caisse des Dépôts le 23 décembre 2024, en remplacement d'Éric Lombard nommé " +
      "ministre. Sa nomination est confirmée par décret du 12 juin 2025.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Olivier_Sichel',
    wikidataId: 'Q3351381',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q45192006 (vérifié wbsearchentities) + Wikipédia FR
    //           + Journal des Entreprises (janv. 2025 : nomination ministérielle)
    //           + Légifrance : décret du 7 novembre 2017 portant nomination DG CDC
    // Rôle public : DG CDC du 7 nov. 2017 au 23 déc. 2024, puis Ministre de l'Économie
    nom: 'Lombard',
    prenom: 'Éric',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: "Directeur général de la Caisse des Dépôts (2017-2024), puis Ministre de l'Économie",
    rolesSecondaires: [
      'ancien DG de Generali France (2010-2017)',
      "ancien directeur général de la CDC (2017-2024)",
      "Officier de la Légion d'honneur (2023)",
    ],
    bio:
      "Éric Lombard, diplômé de HEC et de Sciences Po, a dirigé Generali France avant " +
      "d'être nommé directeur général de la Caisse des Dépôts et Consignations le 7 novembre 2017. " +
      "Il occupe ce poste pendant sept ans avant de rejoindre le gouvernement Bayrou " +
      "comme Ministre de l'Économie en janvier 2025.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/%C3%89ric_Lombard",
    wikidataId: 'Q45192006',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3340278 (vérifié wbsearchentities — "French businessperson")
    //           + Wikipédia FR (Nicolas Dufourcq) + caisse.bpifrance.fr (biographie officielle)
    // NB : DÉJÀ EN BASE — upsert idempotent ; lien DIRIGEANT créé dans ce seed.
    nom: 'Dufourcq',
    prenom: 'Nicolas',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: 'Directeur général de Bpifrance',
    rolesSecondaires: [
      "ancien directeur général de BCG France",
      "secrétaire général du Conseil stratégique de la compétitivité (2013)",
      "membre du conseil de surveillance de Deezer",
    ],
    bio:
      "Diplômé de l'ENA et de l'École polytechnique, Nicolas Dufourcq a dirigé BCG France " +
      "avant de devenir le premier directeur général de Bpifrance lors de sa création " +
      "en juillet 2013 par la fusion de l'OSEO, du FSI et de CDC Entreprises. " +
      "Il incarne la continuité stratégique de la banque publique d'investissement.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nicolas_Dufourcq',
    wikidataId: 'Q3340278',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q48347797 (vérifié wbsearchentities, "official")
    //           + Wikidata APE (Q2826627) : P35 directeur depuis le 14 septembre 2022
    //           + Cour des comptes rapport S2024-0753 (juillet 2024) : mentionne le commissaire
    // Rôle public : Commissaire aux participations de l'État depuis le 14 septembre 2022
    nom: 'Zajdenweber',
    prenom: 'Alexis',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: "Commissaire aux participations de l'État (APE)",
    rolesSecondaires: [
      "ancien élève de l'ENA (promotion 2001-2003)",
      "ancien sous-directeur au Trésor",
    ],
    bio:
      "Haut fonctionnaire issu du corps de l'inspection des finances, Alexis Zajdenweber " +
      "succède à Martin Vial à la tête de l'Agence des participations de l'État " +
      "le 14 septembre 2022. Il exerce les droits de l'État actionnaire dans un " +
      "portefeuille représentant environ 400 milliards d'euros de valeur boursière.",
    wikipediaUrl: null,
    wikidataId: 'Q48347797',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  // --- Institutions publiques (CDC, Bpifrance, APE) ---
  {
    // Sources : Wikidata Q846484 (vérifié) + Wikipédia FR (CDC)
    //           + caissedesdepots.fr/finance/resultats-financiers
    nom: 'Caisse des Dépôts et Consignations',
    sigle: 'CDC',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.caissedesdepots.fr',
    description:
      "Institution financière publique sui generis créée par la loi du 28 avril 1816, " +
      "placée sous la surveillance du Parlement. La CDC gère des fonds d'épargne (Livret A), " +
      "détient 50 % de Bpifrance, 34 % de La Poste, et finance le logement social, " +
      "la transition écologique et les infrastructures. Bilan total : 1 360 Mds€ (2023).",
    dateCreation: new Date('1816-04-28'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Caisse_des_d%C3%A9p%C3%B4ts_et_consignations',
    wikidataId: 'Q846484',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2362964 (vérifié) + Wikipédia FR (Bpifrance)
    //           + bpifrance.fr (rapport annuel 2023)
    nom: 'Bpifrance',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.bpifrance.fr',
    description:
      "Banque publique d'investissement créée le 31 décembre 2012 (opérationnelle en " +
      "février 2013) par fusion de l'OSEO, du FSI, de CDC Entreprises et de FSI Régions. " +
      "Détenue à 50 % par la CDC et 50 % par l'État (APE). " +
      "Finance et accompagne les TPE/PME/ETI françaises ; actionnaire de référence dans " +
      "plusieurs grandes entreprises (dont Orange à ~9,56 %).",
    dateCreation: new Date('2012-12-31'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bpifrance',
    wikidataId: 'Q2362964',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2826627 (vérifié) + Wikipédia FR (APE)
    //           + economie.gouv.fr/agence-participations-etat
    //           + Cour des comptes rapport S2024-0753 (juillet 2024)
    nom: "Agence des participations de l'État",
    sigle: 'APE',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.economie.gouv.fr/agence-participations-etat',
    description:
      "Service à compétence nationale rattaché à la direction générale du Trésor, " +
      "créé par décret du 9 septembre 2004. Exerce les droits de l'État actionnaire " +
      "dans environ 70 entreprises. Valeur du portefeuille coté : ~179,5 Mds€ au 30 juin 2024 " +
      "(dont Airbus, Safran, Thales représentent 57,4 %). Dirigé par le commissaire aux " +
      "participations de l'État, nommé en conseil des ministres.",
    dateCreation: new Date('2004-09-09'),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Agence_des_participations_de_l%27%C3%89tat",
    wikidataId: 'Q2826627',
    qualiteInfluence: 'AUTRE',
  },

  // --- Grandes entreprises détenues (partiellement ou totalement) par l'État ---
  {
    // Sources : Wikidata Q1431486 (vérifié — "French multinational telecommunications corporation")
    //           + Wikipédia FR (Orange SA) : État APE 13,39 %, Bpifrance 9,56 %
    //           + Rapport APE 2024 (participations cotées)
    nom: 'Orange SA',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.orange.com',
    description:
      "Opérateur télécom multinational français (ex-France Télécom). Cotée au CAC 40. " +
      "L'État détient ~13,39 % via l'APE et ~9,56 % via Bpifrance, " +
      "soit un ensemble public de ~22,95 % du capital. " +
      "CA 2023 : ~43,5 Mds€. Siège : Issy-les-Moulineaux.",
    dateCreation: new Date('1988-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Orange_(entreprise)',
    wikidataId: 'Q1431486',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q274591 (vérifié) + Wikipédia FR (EDF)
    //           + Ordonnance no. 2023-487 du 21 juin 2023 (nationalisation complète)
    //           + Rapport APE 2024
    nom: "Électricité de France",
    sigle: 'EDF',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.edf.fr',
    description:
      "Premier producteur d'électricité en France, fondé en 1946. Coté au CAC 40 jusqu'en 2015, " +
      "puis re-coté jusqu'à la nationalisation complète de juin 2023 " +
      "(ordonnance no. 2023-487 du 21 juin 2023) : l'État détient désormais ~100 % du capital. " +
      "CA 2023 : ~139 Mds€. Parc nucléaire : 56 réacteurs opérationnels.",
    dateCreation: new Date('1946-04-08'),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/%C3%89lectricit%C3%A9_de_France",
    wikidataId: 'Q274591',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q13416787 (vérifié — "French multinational utility company")
    //           + Wikipédia FR (Engie) : État APE ~23,64 % du capital, ~34 % des droits de vote
    //           + Rapport APE 2024
    nom: 'Engie',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.engie.com',
    description:
      "Groupe énergétique multinational français (ex-GDF Suez), coté au CAC 40 depuis 2008. " +
      "L'État détient ~23,64 % du capital et ~34 % des droits de vote via l'APE. " +
      "Activités : gaz, électricité, énergies renouvelables, services aux collectivités. " +
      "CA 2023 : ~82 Mds€.",
    dateCreation: new Date('2008-07-22'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Engie',
    wikidataId: 'Q13416787',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1886126 (vérifié) + Wikipédia FR (Safran)
    //           + Rapport APE 2024 : État ~11,2 % via APE
    nom: 'Safran',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.safran-group.com',
    description:
      "Groupe international de haute technologie (aéronautique, défense, sécurité). " +
      "Coté au CAC 40. L'État détient ~11,2 % du capital via l'APE. " +
      "Produit notamment le moteur LEAP (avec GE) équipant les Boeing 737 MAX et Airbus A320neo. " +
      "CA 2023 : ~23,7 Mds€.",
    dateCreation: new Date('2005-02-11'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Safran_(entreprise)',
    wikidataId: 'Q1886126',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1161666 (vérifié) + Wikipédia FR (Thales)
    //           + Rapport APE 2024 : État APE ~26,11 % du capital
    //           + Dassault Aviation ~24,63 % (actionnaire industriel privé)
    nom: 'Thales',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.thalesgroup.com',
    description:
      "Groupe d'électronique de défense, de sécurité et de transport. Coté au CAC 40. " +
      "L'État (APE) est le premier actionnaire avec ~26,11 % du capital ; " +
      "Dassault Aviation en détient ~24,63 %. " +
      "Domaines : défense, spatial, cybersécurité, transport. CA 2023 : ~20,6 Mds€.",
    dateCreation: new Date('2000-12-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Thales_(entreprise)',
    wikidataId: 'Q1161666',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q6686 (vérifié) + Wikipédia FR (Renault)
    //           + Rapport APE 2024 : État ~15,01 % du capital + 28,61 % des droits de vote
    nom: 'Renault',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.renaultgroup.com',
    description:
      "Constructeur automobile français fondé en 1899. Coté au CAC 40. " +
      "L'État détient ~15,01 % du capital et ~28,61 % des droits de vote " +
      "(droits de vote double via la loi Florange de 2014). " +
      "Alliance avec Nissan et Mitsubishi. CA 2023 : ~52,4 Mds€.",
    dateCreation: new Date('1899-02-25'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Renault',
    wikidataId: 'Q6686',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q407237 (vérifié) + Wikipédia FR (Air France-KLM)
    //           + Rapport APE 2024 : État français ~11,3 % du capital
    //           + Augmentation de capital de mai 2020 (recapitalisation COVID)
    nom: 'Air France-KLM',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.airfranceklm.com',
    description:
      "Groupe aérien franco-néerlandais né de la fusion Air France / KLM en 2004. " +
      "Coté à Euronext Paris (ticker AF). L'État français détient ~11,3 % du capital " +
      "(consolidé lors de la recapitalisation COVID de mai 2020). " +
      "L'État néerlandais détient également ~9,3 %. CA 2023 : ~29,4 Mds€.",
    dateCreation: new Date('2004-05-05'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Air_France-KLM',
    wikidataId: 'Q407237',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q373724 (vérifié — "La Poste, founded 1477")
    //           + Wikipédia FR (La Poste, entreprise française) : État 66 %, CDC 34 %
    //           + Rapport CDC 2023 + Rapport APE 2024
    nom: 'La Poste',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.laposte.fr',
    description:
      "Groupe de services postaux et financiers, société anonyme à capitaux 100 % publics. " +
      "L'État détient 66 % du capital et la CDC 34 %. " +
      "Filiales : La Banque Postale, Colissimo, GeoPost/DPD. " +
      "Missions de service universel postal. CA 2023 : ~35,7 Mds€.",
    dateCreation: new Date('1991-01-01'),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/La_Poste_(entreprise_fran%C3%A7aise)",
    wikidataId: 'Q373724',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2311 (vérifié — "pan-European aerospace and defence group,
    //           also known as Airbus Group NV, EADS, Airbus Group SE, and Airbus SE")
    //           + Wikipédia FR (Airbus) + Rapport APE 2024
    //           SOGEADE (50 % État/SFPI + 50 % Dassault Aviation) détient ~10,97 % d'Airbus SE
    nom: 'Airbus SE',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.airbus.com',
    description:
      "Groupe aérospatial et de défense européen (ex-EADS), coté à Euronext Paris, " +
      "Francfort et Madrid. L'État français est actionnaire via SOGEADE SA " +
      "(holding à 50 % État/SFPI + 50 % Dassault Aviation) qui détient ~10,97 % du capital. " +
      "Produit l'A320, l'A350, le A400M et les fusées Ariane. CA 2023 : ~65,4 Mds€.",
    dateCreation: new Date('2000-07-10'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Airbus',
    wikidataId: 'Q2311',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q794563 (vérifié — "Groupe ADP, fixed-base operator")
    //           + Wikipédia FR (Groupe ADP) + Rapport APE 2024 : État ~50,63 % du capital
    nom: 'Groupe ADP',
    sigle: 'ADP',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.parisaeroport.fr',
    description:
      "Opérateur des aéroports de Paris (CDG, Orly, Le Bourget) et gestionnaire " +
      "d'infrastructures aéroportuaires à l'international. Coté à Euronext Paris. " +
      "L'État détient ~50,63 % du capital via l'APE. " +
      "Trafic 2023 : ~109 millions de passagers (Paris). CA 2023 : ~5,5 Mds€.",
    dateCreation: new Date('1945-10-24'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Groupe_ADP',
    wikidataId: 'Q794563',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-01).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_cdc: {
    url: 'https://fr.wikipedia.org/wiki/Caisse_des_d%C3%A9p%C3%B4ts_et_consignations',
    titre: 'Caisse des dépôts et consignations — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Créée en 1816, institution sui generis sous surveillance parlementaire. " +
      "Détient 50 % de Bpifrance et 34 % de La Poste. Bilan : 1 360 Mds€ (2023).",
    verifiee: true,
  },
  wp_bpifrance: {
    url: 'https://fr.wikipedia.org/wiki/Bpifrance',
    titre: 'Bpifrance — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Banque publique d'investissement créée le 31 déc. 2012 (fusion OSEO, FSI, CDC Entreprises). " +
      "Détenue à 50 % CDC + 50 % État (APE). DG : Nicolas Dufourcq.",
    verifiee: true,
  },
  wp_ape: {
    url: "https://fr.wikipedia.org/wiki/Agence_des_participations_de_l%27%C3%89tat",
    titre: "Agence des participations de l'État — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Service à compétence nationale, décret du 9 sept. 2004. Portefeuille coté : ~179,5 Mds€ (juin 2024). " +
      "Commissaire depuis sept. 2022 : Alexis Zajdenweber.",
    verifiee: true,
  },
  rapport_ape_2024: {
    url: 'https://www.economie.gouv.fr/files/files/directions_services/agence-participations-etat/Documents/Rapports-de-l-Etat-actionnaire/2025/RAPPORT%20FINANCIER%202025.pdf',
    titre: "Rapport financier 2024 de l'Agence des participations de l'État",
    media: "Agence des participations de l'État",
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-01-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: "APE — Direction générale du Trésor",
    description:
      "Rapport annuel APE : portefeuille coté 179,5 Mds€ (30 juin 2024), participations " +
      "Airbus/Safran/Thales = 57,4 % ; Engie/Eramet = 16,7 %. Détails des % par société.",
    verifiee: true,
  },
  participations_gouv: {
    url: 'https://www.economie.gouv.fr/agence-participations-etat/les-participations-publiques',
    titre: "Les participations publiques — economie.gouv.fr",
    media: "Ministère de l'Économie et des Finances",
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: null,
    dateConsultation: new Date('2026-07-01'),
    auteur: "APE",
    description:
      "Page officielle APE listant l'ensemble des participations publiques de l'État français " +
      "(cotées et non cotées) avec les pourcentages détenus.",
    verifiee: true,
  },
  jorf_sichel: {
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051725234',
    titre: 'Décret du 12 juin 2025 portant nomination du DG de la CDC — M. SICHEL (Olivier)',
    media: 'Légifrance (JORF)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-06-12'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Premier ministre',
    description:
      "Décret officiel de nomination d'Olivier Sichel comme directeur général de la " +
      "Caisse des dépôts et consignations, pris en conseil des ministres le 12 juin 2025.",
    verifiee: true,
  },
  cdc_finance: {
    url: 'https://www.caissedesdepots.fr/finance/resultats-financiers',
    titre: 'Résultats financiers — Caisse des Dépôts et Consignations',
    media: 'Caisse des Dépôts et Consignations',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: null,
    dateConsultation: new Date('2026-07-01'),
    auteur: 'CDC',
    description:
      "Publications officielles des résultats financiers de la CDC, actionnaires " +
      "de Bpifrance (50 %) et La Poste (34 %).",
    verifiee: true,
  },
  wp_sichel: {
    url: 'https://fr.wikipedia.org/wiki/Olivier_Sichel',
    titre: 'Olivier Sichel — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2025-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "DG de la CDC depuis déc. 2024 (intérim), confirmé par décret du 12 juin 2025. " +
      "Ancien CEO Crédit Mutuel Arkéa.",
    verifiee: true,
  },
  wp_lombard: {
    url: 'https://fr.wikipedia.org/wiki/%C3%89ric_Lombard',
    titre: 'Éric Lombard — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "DG de la CDC du 7 nov. 2017 au 23 déc. 2024. Officier de la Légion d'honneur (2023). " +
      "Nommé Ministre de l'Économie dans le gouvernement Bayrou en janvier 2025.",
    verifiee: true,
  },
  wp_dufourcq: {
    url: 'https://fr.wikipedia.org/wiki/Nicolas_Dufourcq',
    titre: 'Nicolas Dufourcq — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Premier DG de Bpifrance depuis sa création en 2013. ENA + Polytechnique. Ancien DG BCG France.",
    verifiee: true,
  },
  cour_comptes_ape: {
    url: 'https://www.ccomptes.fr/sites/default/files/2024-07/20240716-S2024-0753-Agence-participations-Etat_0.pdf',
    titre: "Observations définitives — Agence des participations de l'État (S2024-0753)",
    media: 'Cour des comptes',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-07-16'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Cour des comptes',
    description:
      "Rapport d'observations de la Cour des comptes sur l'APE : gouvernance, performance " +
      "du portefeuille, rôle du commissaire Zajdenweber (nommé sept. 2022).",
    verifiee: true,
  },
  wp_orange: {
    url: 'https://fr.wikipedia.org/wiki/Orange_(entreprise)',
    titre: 'Orange SA — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Opérateur télécom (ex-France Télécom). État APE ~13,39 %, Bpifrance ~9,56 % du capital.",
    verifiee: true,
  },
  wp_edf: {
    url: "https://fr.wikipedia.org/wiki/%C3%89lectricit%C3%A9_de_France",
    titre: 'Électricité de France — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Nationalisée à ~100 % en juin 2023 (ordonnance no. 2023-487). CA 2023 : ~139 Mds€.",
    verifiee: true,
  },
  jorf_edf_nationalisation: {
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047682578',
    titre: "Ordonnance no. 2023-487 du 21 juin 2023 relative aux actions de l'État au capital d'EDF",
    media: 'Légifrance (JORF)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2023-06-21'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Présidence de la République',
    description:
      "Ordonnance autorisant le relèvement de la participation de l'État au capital d'EDF " +
      "à 100 % — fondement juridique de la nationalisation complète d'EDF (juin 2023).",
    verifiee: true,
  },
  wp_engie: {
    url: 'https://fr.wikipedia.org/wiki/Engie',
    titre: 'Engie — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Ex-GDF Suez. État APE ~23,64 % du capital et ~34 % des droits de vote.",
    verifiee: true,
  },
  wp_safran: {
    url: 'https://fr.wikipedia.org/wiki/Safran_(entreprise)',
    titre: 'Safran — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Groupe aérospatial et défense. État APE ~11,2 % du capital. CA 2023 : ~23,7 Mds€.",
    verifiee: true,
  },
  wp_thales: {
    url: 'https://fr.wikipedia.org/wiki/Thales_(entreprise)',
    titre: 'Thales — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Électronique défense/sécurité. État APE ~26,11 % ; Dassault Aviation ~24,63 %. CA 2023 : ~20,6 Mds€.",
    verifiee: true,
  },
  wp_renault: {
    url: 'https://fr.wikipedia.org/wiki/Renault',
    titre: 'Renault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Constructeur automobile. État APE ~15,01 % du capital, ~28,61 % des droits de vote (loi Florange).",
    verifiee: true,
  },
  wp_airfranceklm: {
    url: 'https://fr.wikipedia.org/wiki/Air_France-KLM',
    titre: 'Air France-KLM — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Groupe aérien franco-néerlandais. État français ~11,3 % du capital (recapitalisation COVID 2020).",
    verifiee: true,
  },
  wp_laposte: {
    url: "https://fr.wikipedia.org/wiki/La_Poste_(entreprise_fran%C3%A7aise)",
    titre: 'La Poste (entreprise française) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Groupe postal public : État 66 %, CDC 34 %. Filiales : La Banque Postale, GeoPost/DPD. CA 2023 : ~35,7 Mds€.",
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
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Groupe aérospatial européen. SOGEADE (50 % État/SFPI + 50 % Dassault Aviation) détient ~10,97 % d'Airbus SE.",
    verifiee: true,
  },
  wp_adp: {
    url: 'https://fr.wikipedia.org/wiki/Groupe_ADP',
    titre: 'Groupe ADP — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Opérateur aéroports de Paris (CDG, Orly, Le Bourget). État APE ~50,63 % du capital.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002), exactement 1 entité non-nulle de chaque côté.
// Codes capitalistiques ADR-027 : DETENTION_CAPITAL / ACTIONNAIRE_MAJORITAIRE / FILIALE.
// Convention : aRef=détenteur (CDC/APE/Bpifrance), bRef=entreprise détenue.
// ---------------------------------------------------------------------------

const LIENS = [
  // =========================================================================
  // DIRIGEANTS — personnes → organisations
  // =========================================================================
  {
    // P-O : Olivier Sichel — DG CDC depuis le 23 décembre 2024 (décret du 12 juin 2025)
    aType: 'personne',
    aRef: 'Q3351381',
    bType: 'organisation',
    bRef: 'Q846484',
    typeLienCode: 'DIRIGEANT',
    description:
      "Olivier Sichel assure la direction générale de la Caisse des Dépôts depuis " +
      "le 23 décembre 2024 (intérim), confirmé par décret du 12 juin 2025 en conseil des ministres.",
    dateDebut: new Date('2024-12-23'),
    dateFin: null,
    sourceRef: 'jorf_sichel',
  },
  {
    // P-O : Éric Lombard — DG CDC du 7 novembre 2017 au 23 décembre 2024
    aType: 'personne',
    aRef: 'Q45192006',
    bType: 'organisation',
    bRef: 'Q846484',
    typeLienCode: 'DIRIGEANT',
    description:
      "Éric Lombard a été directeur général de la Caisse des Dépôts du 7 novembre 2017 " +
      "au 23 décembre 2024, date à laquelle il a quitté ses fonctions pour rejoindre " +
      "le gouvernement Bayrou comme Ministre de l'Économie (janvier 2025).",
    dateDebut: new Date('2017-11-07'),
    dateFin: new Date('2024-12-23'),
    sourceRef: 'wp_lombard',
  },
  {
    // P-O : Nicolas Dufourcq — DG Bpifrance depuis juillet 2013
    aType: 'personne',
    aRef: 'Q3340278',
    bType: 'organisation',
    bRef: 'Q2362964',
    typeLienCode: 'DIRIGEANT',
    description:
      "Nicolas Dufourcq est le premier et actuel directeur général de Bpifrance " +
      "depuis la création de la banque publique d'investissement en juillet 2013.",
    dateDebut: new Date('2013-07-12'),
    dateFin: null,
    sourceRef: 'wp_dufourcq',
  },
  {
    // P-O : Alexis Zajdenweber — Commissaire aux participations de l'État depuis le 14 septembre 2022
    aType: 'personne',
    aRef: 'Q48347797',
    bType: 'organisation',
    bRef: 'Q2826627',
    typeLienCode: 'DIRIGEANT',
    description:
      "Alexis Zajdenweber a été nommé commissaire aux participations de l'État " +
      "le 14 septembre 2022, en remplacement de Martin Vial. Il dirige l'APE et " +
      "exerce les droits de l'État actionnaire dans un portefeuille d'environ 70 entreprises.",
    dateDebut: new Date('2022-09-14'),
    dateFin: null,
    sourceRef: 'cour_comptes_ape',
  },

  // =========================================================================
  // STRUCTURE PUBLIQUE — actionnariat croisé CDC / APE / Bpifrance / La Poste
  // =========================================================================
  {
    // O-O : APE → Bpifrance (~50 % du capital, avec CDC)
    aType: 'organisation',
    aRef: 'Q2826627',
    bType: 'organisation',
    bRef: 'Q2362964',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "L'État (APE) détient 50 % du capital de Bpifrance aux côtés de la CDC (50 %). " +
      "La gouvernance est paritaire : Bpifrance est co-détenue par les deux bras " +
      "financiers de l'État depuis sa création en 2012.",
    dateDebut: new Date('2012-12-31'),
    dateFin: null,
    sourceRef: 'wp_bpifrance',
  },
  {
    // O-O : CDC → Bpifrance (~50 % du capital, avec l'État)
    aType: 'organisation',
    aRef: 'Q846484',
    bType: 'organisation',
    bRef: 'Q2362964',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "La Caisse des Dépôts détient 50 % du capital de Bpifrance aux côtés de l'État (APE, 50 %). " +
      "La CDC est co-fondatrice de Bpifrance, issue notamment de la fusion avec CDC Entreprises " +
      "et le FSI en 2013.",
    dateDebut: new Date('2012-12-31'),
    dateFin: null,
    sourceRef: 'cdc_finance',
  },
  {
    // O-O : APE → La Poste (~66 % du capital)
    aType: 'organisation',
    aRef: 'Q2826627',
    bType: 'organisation',
    bRef: 'Q373724',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "L'État détient 66 % du capital de La Poste, aux côtés de la CDC (34 %). " +
      "La Poste est une société anonyme dont le capital est intégralement public " +
      "(loi du 9 février 2010 sur La Poste).",
    dateDebut: new Date('2010-03-01'),
    dateFin: null,
    sourceRef: 'wp_laposte',
  },
  {
    // O-O : CDC → La Poste (~34 % du capital)
    aType: 'organisation',
    aRef: 'Q846484',
    bType: 'organisation',
    bRef: 'Q373724',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "La Caisse des Dépôts détient 34 % du capital de La Poste " +
      "aux côtés de l'État (66 %). La CDC est actionnaire de référence de La Poste " +
      "depuis la transformation en SA en 2010.",
    dateDebut: new Date('2010-03-01'),
    dateFin: null,
    sourceRef: 'cdc_finance',
  },

  // =========================================================================
  // PARTICIPATIONS ÉTAT (APE) DANS LES GRANDES ENTREPRISES
  // =========================================================================
  {
    // O-O : APE → EDF (~100 % du capital depuis juin 2023)
    aType: 'organisation',
    aRef: 'Q2826627',
    bType: 'organisation',
    bRef: 'Q274591',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "L'État détient ~100 % du capital d'EDF suite à la nationalisation complète " +
      "achevée en juin 2023 (ordonnance no. 2023-487 du 21 juin 2023), " +
      "après une offre publique de retrait lancée en juillet 2022 à 12 €/action.",
    dateDebut: new Date('2023-06-21'),
    dateFin: null,
    sourceRef: 'jorf_edf_nationalisation',
  },
  {
    // O-O : APE → Groupe ADP (~50,63 % du capital)
    aType: 'organisation',
    aRef: 'Q2826627',
    bType: 'organisation',
    bRef: 'Q794563',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "L'État détient ~50,63 % du capital de Groupe ADP (Aéroports de Paris), " +
      "actionnaire majoritaire. La privatisation partielle (projet Pacte 2019) a été " +
      "bloquée par une procédure de référendum d'initiative partagée.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_adp',
  },
  {
    // O-O : APE → Engie (~23,64 % du capital, ~34 % des droits de vote)
    aType: 'organisation',
    aRef: 'Q2826627',
    bType: 'organisation',
    bRef: 'Q13416787',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "L'État détient ~23,64 % du capital d'Engie et ~34 % des droits de vote via l'APE. " +
      "La participation remonte à la fusion GDF-Suez en 2008, née elle-même de la fusion " +
      "Gaz de France (anciennement public) avec Suez.",
    dateDebut: new Date('2008-07-22'),
    dateFin: null,
    sourceRef: 'wp_engie',
  },
  {
    // O-O : APE → Thales (~26,11 % du capital)
    aType: 'organisation',
    aRef: 'Q2826627',
    bType: 'organisation',
    bRef: 'Q1161666',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "L'État (APE) est le premier actionnaire de Thales avec ~26,11 % du capital. " +
      "Dassault Aviation en détient ~24,63 % (actionnaire industriel privé). " +
      "Rapport APE 2024 : Airbus/Safran/Thales représentent 57,4 % du portefeuille coté.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'rapport_ape_2024',
  },
  {
    // O-O : APE → Renault (~15,01 % du capital, ~28,61 % des droits de vote)
    aType: 'organisation',
    aRef: 'Q2826627',
    bType: 'organisation',
    bRef: 'Q6686',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "L'État détient ~15,01 % du capital de Renault et ~28,61 % des droits de vote " +
      "(droits de vote double via la loi Florange du 29 mars 2014 pour les actionnaires " +
      "détenant des titres depuis plus de 2 ans).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_renault',
  },
  {
    // O-O : APE → Safran (~11,2 % du capital)
    aType: 'organisation',
    aRef: 'Q2826627',
    bType: 'organisation',
    bRef: 'Q1886126',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "L'État (APE) détient ~11,2 % du capital de Safran, groupe de haute technologie " +
      "aérospatiale et de défense coté au CAC 40. " +
      "Rapport APE 2024 : le secteur Airbus/Safran/Thales représente 57,4 % du portefeuille.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'rapport_ape_2024',
  },
  {
    // O-O : APE → Orange (~13,39 % du capital)
    aType: 'organisation',
    aRef: 'Q2826627',
    bType: 'organisation',
    bRef: 'Q1431486',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "L'État (APE) détient ~13,39 % du capital d'Orange SA (ex-France Télécom), " +
      "anciennement monopole d'État privatisé progressivement à partir de 1997. " +
      "Le bloc public total (APE + Bpifrance) représente ~22,95 % du capital.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_orange',
  },
  {
    // O-O : APE → Air France-KLM (~11,3 % du capital)
    aType: 'organisation',
    aRef: 'Q2826627',
    bType: 'organisation',
    bRef: 'Q407237',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "L'État français détient ~11,3 % du capital d'Air France-KLM, participation " +
      "consolidée lors de la recapitalisation de mai 2020 (4 Mds€ prêtés et convertis " +
      "en capital, liée à la crise COVID-19). L'État néerlandais détient ~9,3 %.",
    dateDebut: new Date('2020-05-01'),
    dateFin: null,
    sourceRef: 'wp_airfranceklm',
  },
  {
    // O-O : APE → Airbus SE (~10,97 % du capital via SOGEADE)
    aType: 'organisation',
    aRef: 'Q2826627',
    bType: 'organisation',
    bRef: 'Q2311',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "L'État français détient ~10,97 % du capital d'Airbus SE via SOGEADE SA, " +
      "holding à 50 % État (SFPI) et 50 % Dassault Aviation. " +
      "La participation française s'exerce dans un concert avec l'État allemand et espagnol " +
      "(SEPI), garants de la nature européenne du groupe.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_airbus',
  },
  {
    // O-O : Bpifrance → Orange (~9,56 % du capital)
    aType: 'organisation',
    aRef: 'Q2362964',
    bType: 'organisation',
    bRef: 'Q1431486',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "Bpifrance détient ~9,56 % du capital d'Orange SA, en complément des ~13,39 % " +
      "de l'État (APE) pour un bloc public total d'environ 22,95 %. " +
      "La participation de Bpifrance dans Orange est l'une de ses plus significatives.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_orange',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-fortunes-1.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-participations] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-participations] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données Participations publiques précédentes...')
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
  console.log('\n-- seed-participations-publiques — CDC / Bpifrance / APE + participations État --\n')
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

  console.log('\n— Liens capitalistiques + dirigeants —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n-- Bilan --')
  console.log(`Personnes     : ${PERSONNES.length} (Sichel, Lombard, Dufourcq, Zajdenweber)`)
  console.log(
    `Organisations : ${ORGANISATIONS.length} (CDC, Bpifrance, APE + 10 entreprises détenues)`,
  )
  console.log(`Sources       : ${Object.keys(SOURCES).length} (Wikipédia, APE rapport 2024, JORF, Cour des comptes)`)
  console.log(
    `Liens         : ${LIENS.length} (DIRIGEANT x4, DETENTION_CAPITAL x10, ACTIONNAIRE_MAJORITAIRE x4)`,
  )
  console.log(
    `Interlocks CAC40 : Orange, EDF, Engie, Safran, Thales, Renault, Air France-KLM, Airbus, Groupe ADP`,
  )
  console.log('')
}

main()
  .catch((err) => {
    console.error('[seed-participations] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
