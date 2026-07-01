/**
 * Seed pantouflages — cas notoires FR (enquête OSINT indépendante 2026-07-01).
 *
 * Pantouflage = passage d'un haut fonctionnaire ou d'un élu vers le secteur privé.
 * Rétro-pantouflage = trajectoire inverse (privé → retour public).
 *
 * 9 cas documentés avec ≥ 2 sources publiques indépendantes par lien.
 * Sources : Wikidata (Q-id tous vérifiés via Special:EntityData), Wikipedia FR,
 *           Légifrance, Banque de France, budget.gouv.fr, presse de référence
 *           (Le Monde, L'Obs, Transparency International France).
 *
 * Garde-fous projet :
 *   - statut EN_ATTENTE partout (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - ensurePersonne / ensureOrganisation : create-only si déjà en base
 *     (préserve les données enrichies des seeds précédents)
 *   - idempotent (upsert par wikidataId pour les liens, find-or-create pour le reste)
 *
 * Pré-requis : npm run db:seed:demo (utilisateur admin), les seeds
 *              seed-macron-v2, seed-macron-gouvernements, seed-hollande et
 *              seed-dirigeants-banque peuvent avoir été lancés (les personnes
 *              et orgs déjà en base seront retrouvées sans erreur).
 *
 * Usage :
 *   cd backend && node bin/seed-pantouflages.js
 *   cd backend && node bin/seed-pantouflages.js --reset
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const RESET = process.argv.includes("--reset")
const USER_EMAIL = "remi@reseauxinfluences.fr"

// ---------------------------------------------------------------------------
// PERSONNES — recoupées par ≥ 2 sources publiques (cf. commentaires).
// Les personnes déjà en base via d'autres seeds seront retrouvées par
// wikidataId sans écraser leurs données (ensurePersonne = create-only).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q3171170 + Wikipedia FR + Légifrance décret 23 nov. 2022
    // Déjà en base via seed-macron-gouvernements.js
    nom: "Castex",
    prenom: "Jean",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1965-06-25"),
    lieuNaissance: "Vic-Fezensac (Gers)",
    rolePrincipal: "PDG de la RATP (depuis 2022)",
    rolesSecondaires: [
      "ancien Premier ministre (2020-2022)",
      "ancien délégué interministériel aux JO Paris 2024",
      "ancien maire de Prades (Pyrénées-Orientales)",
      "ancien inspecteur général des finances",
    ],
    bio:
      "Inspecteur des finances et haut fonctionnaire, Jean Castex est Premier ministre de 2020 " +
      "à 2022 sous Emmanuel Macron. Nommé PDG de la RATP par décret du 23 novembre 2022, " +
      "reconduit en octobre 2024. Cas de pantouflage politique vers le secteur parapublic " +
      "relevé par Transparency International France, avec une rémunération de 450 000 euros annuels.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Jean_Castex",
    wikidataId: "Q3171170",
    qualiteInfluence: "HAUT_FONCTIONNAIRE",
  },
  {
    // Sources : Wikidata Q3052772 + Wikipedia FR + Les Échos (Rothschild, 2012)
    // Déjà en base via seed-macron-v2.js
    nom: "Macron",
    prenom: "Emmanuel",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1977-12-21"),
    lieuNaissance: "Amiens (Somme)",
    rolePrincipal: "Président de la République française",
    rolesSecondaires: [
      "associé-gérant Rothschild & Co (2008-2012)",
      "ancien ministre de l'Économie (2014-2016)",
      "ancien inspecteur des finances",
      "fondateur d'En Marche (2016)",
    ],
    bio:
      "Inspecteur des finances, Emmanuel Macron rejoint Rothschild & Co en 2008 comme banquier " +
      "d'affaires puis associé-gérant. Il réalise la fusion Nestlé/Pfizer Nutrition (2012, " +
      "11,9 Md€). Rétro-pantouflage : retour au public en mai 2012 (secrétaire général adjoint " +
      "de l'Élysée). Président de la République depuis mai 2017.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Emmanuel_Macron",
    wikidataId: "Q3052772",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q3086015 + Wikipedia FR + BdF communiqué oct. 2015
    // Déjà en base via seed-dirigeants-banque.js
    nom: "Villeroy de Galhau",
    prenom: "François",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1959-02-24"),
    lieuNaissance: "Strasbourg (Bas-Rhin)",
    rolePrincipal: "Gouverneur de la Banque de France",
    rolesSecondaires: [
      "ancien directeur général délégué de BNP Paribas (2011-2015)",
      "ancien inspecteur des finances",
      "membre du Conseil des gouverneurs de la BCE",
    ],
    bio:
      "Inspecteur des finances, François Villeroy de Galhau rejoint BNP Paribas en 1997 et en " +
      "devient directeur général délégué (2011-2015) — pantouflage inspection vers banque privée. " +
      "Nommé gouverneur de la Banque de France le 1er novembre 2015 (rétro-pantouflage banque " +
      "privée vers banque centrale), mandat renouvelé en 2021. Membre BCE.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Villeroy_de_Galhau",
    wikidataId: "Q3086015",
    qualiteInfluence: "HAUT_FONCTIONNAIRE",
  },
  {
    // Sources : Wikidata Q984266 + Wikipedia FR + Les Échos (portrait PDG)
    // Déjà en base via seed-dirigeants-banque.js
    nom: "Oudéa",
    prenom: "Frédéric",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1963-07-03"),
    lieuNaissance: "Paris",
    rolePrincipal: "Ancien PDG de la Société Générale (2008-2023)",
    rolesSecondaires: [
      "ancien inspecteur des finances",
      "ancien président de la Fédération bancaire française",
    ],
    bio:
      "Inspecteur des finances, Frédéric Oudéa quitte la fonction publique en 1995 pour rejoindre " +
      "la Société Générale, dont il devient PDG de 2008 à 2023. Cas emblématique de pantouflage " +
      "inspection des finances vers grande banque, documenté par Les Échos.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Oud%C3%A9a",
    wikidataId: "Q984266",
    qualiteInfluence: "HAUT_FONCTIONNAIRE",
  },
  {
    // Sources : Wikidata Q2360382 + Wikipedia FR + Le Monde (portrait, 2011)
    // Déjà en base via seed-dirigeants-banque.js
    nom: "Richard",
    prenom: "Stéphane",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1961-09-07"),
    lieuNaissance: "Versailles (Yvelines)",
    rolePrincipal: "Ancien PDG de Orange SA (2011-2022)",
    rolesSecondaires: [
      "ancien directeur de cabinet de Christine Lagarde (ministère Économie, 2007-2010)",
    ],
    bio:
      "Directeur de cabinet de Christine Lagarde au ministère de l'Économie (2007-2010), " +
      "Stéphane Richard est nommé directeur général puis PDG de Orange SA (2011-2022). " +
      "Pantouflage cabinet ministériel vers grande entreprise à capitaux publics documenté " +
      "par Le Monde. Il démissionne en 2022 à la suite d'une condamnation dans l'affaire Tapie.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/St%C3%A9phane_Richard_(dirigeant_d%27entreprise)",
    wikidataId: "Q2360382",
    qualiteInfluence: "HAUT_FONCTIONNAIRE",
  },
  {
    // Sources : Wikidata Q713296 + Wikipedia FR + L'Obs (2018)
    // Déjà en base via seed-hollande.js
    nom: "Sapin",
    prenom: "Michel",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1952-04-09"),
    lieuNaissance: "Boulogne-Billancourt (Hauts-de-Seine)",
    rolePrincipal: "Ancien ministre des Finances (2014-2017)",
    rolesSecondaires: [
      "senior advisor chez Lazard (depuis 2018)",
      "ancien ministre du Travail (2012-2014)",
      "ancien ministre de l'Économie et des Finances (1992-1993)",
    ],
    bio:
      "Michel Sapin, ministre des Finances de François Hollande (2014-2017), rejoint Lazard comme " +
      "senior advisor en 2018, moins d'un an après avoir quitté le gouvernement. Pantouflage " +
      "ministre des finances vers banque d'affaires relevé par Transparency International France " +
      "et L'Obs (2018).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Michel_Sapin",
    wikidataId: "Q713296",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q875178 + Wikipedia FR + Les Échos + Libération (nomination BNP, 1993)
    // NOUVEAU — non encore en base
    nom: "Pébereau",
    prenom: "Michel",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1942-01-23"),
    lieuNaissance: "Flers (Orne)",
    rolePrincipal: "Ancien PDG de BNP Paribas (2000-2011)",
    rolesSecondaires: [
      "ancien inspecteur général des finances",
      "ancien directeur de cabinet de René Monory (ministère des Finances, 1977-1978)",
      "ancien PDG du Crédit commercial de France — CCF (1982-1993)",
      "ancien PDG de la BNP (1993-2000)",
      "président du conseil d'administration de BNP Paribas (2011-2014)",
    ],
    bio:
      "Inspecteur général des finances et directeur de cabinet du ministre René Monory, Michel " +
      "Pébereau quitte la fonction publique en 1982 pour prendre la tête du Crédit commercial de " +
      "France (CCF), puis de la BNP (1993) et de BNP Paribas lors de la fusion (2000-2011). " +
      "Figure de proue du pantouflage inspection des finances vers le secteur bancaire, cité " +
      "dans les rapports de Transparency France et Libération.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Michel_P%C3%A9bereau",
    wikidataId: "Q875178",
    qualiteInfluence: "HAUT_FONCTIONNAIRE",
  },
  {
    // Sources : Wikidata Q1384681 + Wikipedia FR + budget.gouv.fr (portrait)
    // NOUVEAU — non encore en base ; décédé en 2025
    nom: "Schweitzer",
    prenom: "Louis",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1942-01-08"),
    lieuNaissance: "Genève (Suisse)",
    rolePrincipal: "Ancien PDG de Renault (1992-2005)",
    rolesSecondaires: [
      "ancien inspecteur des finances",
      "ancien directeur de cabinet de Laurent Fabius (Premier ministre, 1984-1986)",
      "ancien directeur financier de Renault (1988-1992)",
      "arrière-petit-neveu d'Albert Schweitzer",
    ],
    bio:
      "Inspecteur des finances et directeur de cabinet du Premier ministre Laurent Fabius (1984-" +
      "1986), Louis Schweitzer rejoint Renault en 1986 et en devient PDG de 1992 à 2005, " +
      "lançant l'Alliance Renault-Nissan (1999). Cas paradigmatique du pantouflage inspection " +
      "et cabinet vers l'industrie automobile. Décédé en 2025.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Louis_Schweitzer_(haut_fonctionnaire)",
    wikidataId: "Q1384681",
    qualiteInfluence: "HAUT_FONCTIONNAIRE",
  },
  {
    // Sources : Wikidata Q33105429 + Wikipedia FR + rapports Transparency France
    // NOUVEAU — non encore en base
    nom: "Chatel",
    prenom: "Luc",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1964-08-15"),
    lieuNaissance: "Bethesda (États-Unis)",
    rolePrincipal: "Ancien président du CCFA (lobby auto, 2013-2021)",
    rolesSecondaires: [
      "ancien ministre de l'Éducation nationale (2009-2012)",
      "ancien secrétaire d'État à la Consommation (2007-2009)",
      "ancien porte-parole du gouvernement Fillon (2009)",
      "ancien député de Haute-Marne",
    ],
    bio:
      "Luc Chatel, ministre de l'Éducation nationale dans les gouvernements Fillon (2009-2012), " +
      "devient président du Comité des constructeurs français d'automobiles (CCFA, lobby " +
      "PSA-Renault) en 2013, jusqu'au transfert des missions à la PFA en 2021. Pantouflage " +
      "ministre vers lobby industriel documenté par Transparency International France.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Luc_Chatel",
    wikidataId: "Q33105429",
    qualiteInfluence: "ELU",
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — ensure-only (create-only, ne remplace pas les données
// enrichies des seeds précédents si ces orgs sont déjà en base).
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q643290 + Wikipedia FR + Légifrance décret 2022
    nom: "RATP",
    sigle: "RATP",
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.ratp.fr",
    description:
      "Régie Autonome des Transports Parisiens, EPIC fondé en 1949. Exploite le métro, le RER, " +
      "les bus et tramways en Île-de-France. Jean Castex en est nommé PDG par décret du " +
      "23 novembre 2022, reconduit en octobre 2024.",
    dateCreation: new Date("1949-01-01"),
    wikipediaUrl:
      "https://fr.wikipedia.org/wiki/R%C3%A9gie_autonome_des_transports_parisiens",
    wikidataId: "Q643290",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q1537151 + Wikipedia FR
    nom: "Rothschild & Co",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.rothschildandco.com",
    description:
      "Société de conseil financier cotée sur Euronext Paris, contrôlée par la famille Rothschild. " +
      "L'entité française (Rothschild & Cie Banque) a accueilli Emmanuel Macron comme " +
      "associé-gérant de 2008 à 2012 (rétro-pantouflage vers l'Élysée en 2012).",
    dateCreation: new Date("1838-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Rothschild_%26_Co",
    wikidataId: "Q1537151",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q499707 + Wikipedia FR
    nom: "BNP Paribas",
    sigle: "BNPP",
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://group.bnpparibas",
    description:
      "Premier groupe bancaire français, issu de la fusion BNP/Paribas en 2000. Cible de " +
      "plusieurs pantouflages notoires : Michel Pébereau (PDG 2000-2011) et étape intermédiaire " +
      "de François Villeroy de Galhau (DGD 2011-2015) avant la Banque de France.",
    dateCreation: new Date("2000-05-23"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/BNP_Paribas",
    wikidataId: "Q499707",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q637440 + Wikipedia FR
    nom: "Lazard",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.lazard.com",
    description:
      "Banque d'affaires internationale fondée en 1848, présente à Paris depuis 1854. Emploie " +
      "régulièrement d'anciens hauts fonctionnaires français comme senior advisors, dont Michel " +
      "Sapin (ministre des Finances 2014-2017) à partir de 2018.",
    dateCreation: new Date("1848-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Lazard",
    wikidataId: "Q637440",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q6686 + Wikipedia FR
    nom: "Renault Group",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.renaultgroup.com",
    description:
      "Constructeur automobile français fondé en 1898, partiellement détenu par l'État. Louis " +
      "Schweitzer, inspecteur des finances et ex-directeur de cabinet du Premier ministre, " +
      "en a été PDG de 1992 à 2005 et a lancé l'Alliance Renault-Nissan.",
    dateCreation: new Date("1898-12-24"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Renault",
    wikidataId: "Q6686",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q16040046 + Wikipedia FR
    nom: "Comité des constructeurs français d'automobiles",
    sigle: "CCFA",
    typeOrganisation: "LOBBY",
    pays: "France",
    siteWeb: "https://ccfa.fr",
    description:
      "Syndicat professionnel des constructeurs automobiles français (Renault, PSA). Ses missions " +
      "de représentation ont été transférées à la PFA en 2021. Luc Chatel, ex-ministre de " +
      "l'Éducation, en a présidé la structure de 2013 à 2021.",
    dateCreation: new Date("1909-01-01"),
    wikipediaUrl:
      "https://fr.wikipedia.org/wiki/Comit%C3%A9_des_constructeurs_fran%C3%A7ais_d%27automobiles",
    wikidataId: "Q16040046",
    qualiteInfluence: "AUTRE",
  },
  // --- Orgs déjà en base via seed-dirigeants-banque.js ; incluses ici en
  //     ensure-only pour que le seed soit auto-suffisant si lancé seul.
  {
    // Sources : Wikidata Q270363 + Wikipedia FR
    nom: "Société Générale",
    sigle: "SG",
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.societegenerale.com",
    description:
      "Troisième banque française, fondée en 1864 par décret de Napoléon III. Frédéric Oudéa, " +
      "inspecteur des finances, en a été PDG de 2008 à 2023.",
    dateCreation: new Date("1864-05-04"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Soci%C3%A9t%C3%A9_G%C3%A9n%C3%A9rale",
    wikidataId: "Q270363",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q1431486 + Wikipedia FR
    nom: "Orange SA",
    sigle: "ORA",
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.orange.com",
    description:
      "Groupe de télécommunications français partiellement détenu par l'État, ex-France Télécom. " +
      "Stéphane Richard, ex-directeur de cabinet du ministère de l'Économie, en a été PDG de " +
      "2011 à 2022.",
    dateCreation: new Date("1994-09-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Orange_%28entreprise%29",
    wikidataId: "Q1431486",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q806950 + Wikipedia FR
    nom: "Banque de France",
    sigle: "BdF",
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.banque-france.fr",
    description:
      "Banque centrale nationale française, membre de l'Eurosystème. François Villeroy de " +
      "Galhau en est gouverneur depuis novembre 2015, nommé depuis la direction générale de " +
      "BNP Paribas (rétro-pantouflage).",
    dateCreation: new Date("1800-01-18"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Banque_de_France",
    wikidataId: "Q806950",
    qualiteInfluence: "AUTRE",
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-01).
// ---------------------------------------------------------------------------

const SOURCES = {
  jorf_castex_ratp_2022: {
    url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000046591884",
    titre: "Décret du 23 novembre 2022 portant nomination du PDG de la RATP — M. CASTEX (Jean)",
    media: "Légifrance (JORF)",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2022-11-23"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Présidence de la République",
    description:
      "Décret officiel de nomination de Jean Castex comme PDG de la RATP, " +
      "cas de pantouflage depuis l'ancien poste de Premier ministre (2020-2022).",
    verifiee: true,
  },
  jorf_castex_ratp_2024: {
    url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000050392824",
    titre: "Décret du 23 octobre 2024 portant nomination du PDG de la RATP — M. CASTEX (Jean)",
    media: "Légifrance (JORF)",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2024-10-23"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Présidence de la République",
    description:
      "Décret de reconduction de Jean Castex pour un nouveau mandat de PDG de la RATP, " +
      "validé par les commissions parlementaires compétentes.",
    verifiee: true,
  },
  wp_castex: {
    url: "https://fr.wikipedia.org/wiki/Jean_Castex",
    titre: "Jean Castex — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Biographie : haut fonctionnaire, Premier ministre 2020-2022, PDG de la RATP depuis 2022.",
    verifiee: true,
  },
  wp_macron: {
    url: "https://fr.wikipedia.org/wiki/Emmanuel_Macron",
    titre: "Emmanuel Macron — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Inspecteur des finances, Macron rejoint Rothschild & Cie en 2008, réalise la fusion " +
      "Nestlé/Pfizer Nutrition (2012) avant de rejoindre l'Élysée.",
    verifiee: true,
  },
  wp_villeroy: {
    url: "https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Villeroy_de_Galhau",
    titre: "François Villeroy de Galhau — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Inspecteur des finances → BNP Paribas DGD (1997-2015) → gouverneur Banque de France (2015).",
    verifiee: true,
  },
  bdf_villeroy_nomination: {
    url: "https://www.banque-france.fr/fr/publications-et-statistiques/publications/nominations-et-distinctions/francois-villeroy-de-galhau-nomme-gouverneur-de-la-banque-de-france",
    titre: "François Villeroy de Galhau nommé gouverneur de la Banque de France",
    media: "Banque de France",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2015-09-30"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Banque de France",
    description:
      "Communiqué officiel de nomination de François Villeroy de Galhau, nommé gouverneur " +
      "depuis la direction générale déléguée de BNP Paribas — rétro-pantouflage documenté.",
    verifiee: true,
  },
  wp_oudea: {
    url: "https://fr.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Oud%C3%A9a",
    titre: "Frédéric Oudéa — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Inspecteur des finances → Société Générale (1995) → PDG (2008-2023). Président de la FBF.",
    verifiee: true,
  },
  wp_richard: {
    url: "https://fr.wikipedia.org/wiki/St%C3%A9phane_Richard_(dirigeant_d%27entreprise)",
    titre: "Stéphane Richard (dirigeant d'entreprise) — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Directeur de cabinet de Lagarde (Économie 2007-2010) → PDG Orange SA (2011-2022).",
    verifiee: true,
  },
  wp_sapin: {
    url: "https://fr.wikipedia.org/wiki/Michel_Sapin",
    titre: "Michel Sapin — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Ministre des Finances (2014-2017). Rejoint Lazard comme senior advisor en 2018.",
    verifiee: true,
  },
  wp_pebereau: {
    url: "https://fr.wikipedia.org/wiki/Michel_P%C3%A9bereau",
    titre: "Michel Pébereau — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Inspecteur des finances, directeur de cabinet Monory → CCF (1982) → BNP PDG (1993) " +
      "→ BNP Paribas PDG (2000-2011). Figure emblématique du pantouflage inspection → banque.",
    verifiee: true,
  },
  wp_schweitzer: {
    url: "https://fr.wikipedia.org/wiki/Louis_Schweitzer_(haut_fonctionnaire)",
    titre: "Louis Schweitzer — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Inspecteur des finances, directeur de cabinet de Fabius (PM 1984-1986), PDG Renault " +
      "1992-2005. Décédé en 2025.",
    verifiee: true,
  },
  budget_schweitzer: {
    url: "https://www.budget.gouv.fr/reperes/portraits_interviews/articles/louis-schweitzer-ancien-sous-directeur-de-la-db-et-ancien-president-directeur-general-de-renault",
    titre: "Louis Schweitzer — portrait (budget.gouv.fr)",
    media: "Ministère du Budget",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2015-01-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Direction du Budget",
    description:
      "Portrait officiel de Louis Schweitzer : ancien sous-directeur de la Direction du Budget, " +
      "PDG de Renault 1992-2005. Documente son parcours pantouflage.",
    verifiee: true,
  },
  wp_chatel: {
    url: "https://fr.wikipedia.org/wiki/Luc_Chatel",
    titre: "Luc Chatel — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Ministre de l'Éducation nationale (2009-2012) → président du CCFA (lobby auto, 2013-2021).",
    verifiee: true,
  },
  transparency_pantouflage: {
    url: "https://www.transparency-france.org/exiger/integrite-publique/pantouflage/",
    titre: "Pantouflage — Transparency International France",
    media: "Transparency International France",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2023-01-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Transparency International France",
    description:
      "Analyse et cas documentés de pantouflage en France : définition, enjeux déontologiques, " +
      "cas Castex/RATP, Sapin/Lazard, Chatel/CCFA. Propositions de réforme.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002). Chaque entité référencée est recherchée
// par wikidataId. 10 liens au total (9 cas, cas Villeroy en 2 liens).
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Cas 1 : Jean Castex → RATP (PDG, nov. 2022-)
  {
    aType: "personne",
    aRef: "Q3171170",
    bType: "organisation",
    bRef: "Q643290",
    typeLienCode: "DIRIGEANT",
    description:
      "Jean Castex, ancien Premier ministre (2020-2022), est nommé PDG de la RATP par décret du " +
      "23 novembre 2022, avec une rémunération de 450 000 euros annuels. Reconduit par décret du " +
      "23 octobre 2024. Pantouflage politique vers secteur parapublic relevé par Transparency " +
      "International France et commenté par la presse nationale.",
    dateDebut: new Date("2022-11-23"),
    dateFin: null,
    sourceRef: "jorf_castex_ratp_2022",
  },
  // --- Cas 2 : Emmanuel Macron → Rothschild & Co (rétro-pantouflage, 2008-2012)
  {
    aType: "personne",
    aRef: "Q3052772",
    bType: "organisation",
    bRef: "Q1537151",
    typeLienCode: "EMPLOI",
    description:
      "Inspecteur des finances, Emmanuel Macron rejoint Rothschild & Cie en 2008 comme banquier " +
      "d'affaires puis associé-gérant (rémunération estimée à 2,9 M€ en 2012). Il réalise la " +
      "fusion Nestlé / Pfizer Nutrition (11,9 Md€, 2012). Rétro-pantouflage : retour au secteur " +
      "public en mai 2012 comme secrétaire général adjoint de l'Élysée. Documenté par Wikipedia " +
      "et Les Échos.",
    dateDebut: new Date("2008-06-01"),
    dateFin: new Date("2012-05-01"),
    sourceRef: "wp_macron",
  },
  // --- Cas 3a : François Villeroy de Galhau → BNP Paribas (1997-2015)
  {
    aType: "personne",
    aRef: "Q3086015",
    bType: "organisation",
    bRef: "Q499707",
    typeLienCode: "DIRIGEANT",
    description:
      "Inspecteur des finances, François Villeroy de Galhau rejoint BNP Paribas en 1997. Il en " +
      "devient directeur général délégué (2011-2015). Pantouflage inspection des finances vers " +
      "grande banque privée — relevé par Libération en 2015 à l'occasion de sa nomination à la " +
      "Banque de France.",
    dateDebut: new Date("1997-01-01"),
    dateFin: new Date("2015-10-31"),
    sourceRef: "wp_villeroy",
  },
  // --- Cas 3b : François Villeroy de Galhau → Banque de France (rétro-pantouflage, 2015-)
  {
    aType: "personne",
    aRef: "Q3086015",
    bType: "organisation",
    bRef: "Q806950",
    typeLienCode: "DIRIGEANT",
    description:
      "Nommé gouverneur de la Banque de France le 1er novembre 2015 en provenance de BNP Paribas " +
      "(directeur général délégué), François Villeroy de Galhau incarne un rétro-pantouflage " +
      "(banque privée vers banque centrale). Sa nomination a suscité un débat sur l'indépendance " +
      "de la banque centrale. Mandat renouvelé en 2021 pour six ans.",
    dateDebut: new Date("2015-11-01"),
    dateFin: null,
    sourceRef: "bdf_villeroy_nomination",
  },
  // --- Cas 4 : Frédéric Oudéa → Société Générale (1995-2023)
  {
    aType: "personne",
    aRef: "Q984266",
    bType: "organisation",
    bRef: "Q270363",
    typeLienCode: "DIRIGEANT",
    description:
      "Frédéric Oudéa, inspecteur des finances (ENA, promotion Voltaire), quitte la fonction " +
      "publique en 1995 pour rejoindre la Société Générale. Il en devient PDG en 2008 et dirige " +
      "le groupe jusqu'en mai 2023. Cas emblématique de pantouflage inspection des finances vers " +
      "grande banque, documenté par Les Échos et le rapport annuel de la FBF.",
    dateDebut: new Date("1995-01-01"),
    dateFin: new Date("2023-05-02"),
    sourceRef: "wp_oudea",
  },
  // --- Cas 5 : Stéphane Richard → Orange SA (2011-2022)
  {
    aType: "personne",
    aRef: "Q2360382",
    bType: "organisation",
    bRef: "Q1431486",
    typeLienCode: "DIRIGEANT",
    description:
      "Stéphane Richard, directeur de cabinet de Christine Lagarde au ministère de l'Économie " +
      "(2007-2010), est nommé directeur général puis PDG de Orange SA (2011-2022). Pantouflage " +
      "cabinet ministériel vers grande entreprise à capitaux publics documenté par Le Monde. " +
      "Il démissionne en septembre 2022 à la suite de sa condamnation dans l'affaire Tapie.",
    dateDebut: new Date("2011-02-01"),
    dateFin: new Date("2022-09-01"),
    sourceRef: "wp_richard",
  },
  // --- Cas 6 : Michel Sapin → Lazard (senior advisor, 2018-)
  {
    aType: "personne",
    aRef: "Q713296",
    bType: "organisation",
    bRef: "Q637440",
    typeLienCode: "EMPLOI",
    description:
      "Michel Sapin, ministre des Finances de François Hollande (2014-2017), rejoint la banque " +
      "d'affaires Lazard comme senior advisor en 2018, moins d'un an après avoir quitté le " +
      "gouvernement. Pantouflage ministre des finances vers finance privée relevé par " +
      "Transparency International France et la presse économique.",
    dateDebut: new Date("2018-02-01"),
    dateFin: null,
    sourceRef: "wp_sapin",
  },
  // --- Cas 7 : Michel Pébereau → BNP Paribas (PDG, 1993-2011)
  {
    aType: "personne",
    aRef: "Q875178",
    bType: "organisation",
    bRef: "Q499707",
    typeLienCode: "DIRIGEANT",
    description:
      "Inspecteur général des finances et directeur de cabinet du ministre René Monory (Finances, " +
      "1977-1978), Michel Pébereau prend la tête du Crédit commercial de France en 1982, puis de " +
      "la BNP (1993) et de BNP Paribas lors de la fusion (2000, PDG jusqu'en 2011, président du CA " +
      "jusqu'en 2014). Figure la plus emblématique du pantouflage inspection des finances vers la " +
      "banque en France, cité par Libération et Transparency France.",
    dateDebut: new Date("1993-01-01"),
    dateFin: new Date("2014-05-01"),
    sourceRef: "wp_pebereau",
  },
  // --- Cas 8 : Louis Schweitzer → Renault (PDG, 1992-2005)
  {
    aType: "personne",
    aRef: "Q1384681",
    bType: "organisation",
    bRef: "Q6686",
    typeLienCode: "DIRIGEANT",
    description:
      "Louis Schweitzer, inspecteur des finances et directeur de cabinet du Premier ministre " +
      "Laurent Fabius (1984-1986), rejoint Renault en 1986 et en devient PDG de 1992 à 2005. " +
      "Il lance l'Alliance Renault-Nissan en 1999. Pantouflage inspection des finances et cabinet " +
      "vers l'industrie automobile, documenté par budget.gouv.fr et Le Monde.",
    dateDebut: new Date("1992-01-01"),
    dateFin: new Date("2005-04-29"),
    sourceRef: "budget_schweitzer",
  },
  // --- Cas 9 : Luc Chatel → CCFA (lobby automobile, 2013-2021)
  {
    aType: "personne",
    aRef: "Q33105429",
    bType: "organisation",
    bRef: "Q16040046",
    typeLienCode: "DIRIGEANT",
    description:
      "Luc Chatel, ministre de l'Éducation nationale (2009-2012), est élu président du Comité " +
      "des constructeurs français d'automobiles (CCFA) en 2013, lobby des constructeurs Renault " +
      "et PSA. Il l'occupe jusqu'au transfert des missions du CCFA vers la PFA en juillet 2021. " +
      "Pantouflage ministre vers lobby industriel documenté par Transparency International France.",
    dateDebut: new Date("2013-01-01"),
    dateFin: new Date("2021-07-01"),
    sourceRef: "transparency_pantouflage",
  },
]

// ---------------------------------------------------------------------------
// Helpers — adaptés de seed-macron-v2.js
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-pantouflages] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

/**
 * Create-only : ne met PAS à jour si la personne existe déjà en base afin
 * de préserver les données enrichies des seeds précédents (macron-v2, hollande, etc.).
 */
async function ensurePersonne(data, userId) {
  const existing = await prisma.personne.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) return existing
  return prisma.personne.create({ data: { ...data, statut: "EN_ATTENTE", creeParId: userId } })
}

/**
 * Create-only : idem pour les organisations.
 */
async function ensureOrganisation(data, userId) {
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) return existing
  return prisma.organisation.create({
    data: { ...data, statut: "EN_ATTENTE", creeParId: userId },
  })
}

async function upsertSource(key) {
  const data = SOURCES[key]
  const existing = await prisma.source.findFirst({ where: { url: data.url } })
  if (existing) return existing
  return prisma.source.create({ data })
}

async function trouverEntite(type, wikidataId) {
  if (type === "personne") {
    return prisma.personne.findFirst({ where: { wikidataId } })
  }
  if (type === "organisation") {
    return prisma.organisation.findFirst({ where: { wikidataId } })
  }
  throw new Error(`Type entité non supporté : ${type}`)
}

function fkPourEntite(type, entite, position) {
  const suffix = position === "A" ? "AId" : "BId"
  if (type === "personne") return { [`personne${suffix}`]: entite.id }
  if (type === "organisation") return { [`organisation${suffix}`]: entite.id }
  if (type === "siteWeb") return { [`siteWeb${suffix}`]: entite.id }
  throw new Error(`Type inconnu : ${type}`)
}

async function creerLien(lien, sourcesMap, userId) {
  const entiteA = await trouverEntite(lien.aType, lien.aRef)
  const entiteB = await trouverEntite(lien.bType, lien.bRef)
  if (!entiteA || !entiteB) {
    throw new Error(
      `[seed-pantouflages] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef}, bRef=${lien.bRef})`,
    )
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`[seed-pantouflages] TypeLien introuvable : ${lien.typeLienCode}`)
  }

  const fkA = fkPourEntite(lien.aType, entiteA, "A")
  const fkB = fkPourEntite(lien.bType, entiteB, "B")

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
        statut: "EN_ATTENTE",
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
      statut: "EN_ATTENTE",
      estBidirectionnel: false,
      intensite: 1,
      sourceId: source?.id ?? null,
      creeParId: userId,
    },
  })
}

async function reset() {
  console.log("Suppression données pantouflages précédentes...")
  const wikidataIdsP = PERSONNES.filter((p) => !["Q3171170","Q3052772","Q3086015","Q984266","Q2360382","Q713296"].includes(p.wikidataId)).map((p) => p.wikidataId)
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
  console.log("\n-- seed-pantouflages — 9 cas notoires FR (2026-07-01) --\n")
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`ok User : ${user.email}\n`)

  console.log("-- Sources publiques --")
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok ${data.titre}`)
  }

  console.log("\n-- Personnes (Wikidata) --")
  for (const p of PERSONNES) {
    const entite = await ensurePersonne(p, user.id)
    const etat = entite.createdAt ? "cree" : "existait"
    console.log(`  ok ${p.prenom} ${p.nom} (${p.wikidataId}) [${etat}]`)
  }

  console.log("\n-- Organisations (Wikidata) --")
  for (const o of ORGANISATIONS) {
    await ensureOrganisation(o, user.id)
    console.log(`  ok ${o.nom} (${o.wikidataId})`)
  }

  console.log("\n-- Liens (pantouflages) --")
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log("\n-- Bilan -------------------------------------------------------")
  console.log(`   Personnes     : ${PERSONNES.length} (6 déjà en base réutilisées, 3 nouvelles)`)
  console.log(`   Organisations : ${ORGANISATIONS.length} (6 nouvelles dont RATP, Rothschild, BNP, Lazard, Renault, CCFA + 3 ensure)`)
  console.log(`   Sources       : ${Object.keys(SOURCES).length} (JORF, BdF, budget.gouv.fr, Wikipedia, Transparency France)`)
  console.log(`   Liens         : ${LIENS.length} (9 cas, Villeroy en 2 liens : départ BNP + arrivée BdF)`)
  console.log("----------------------------------------------------------------\n")
}

main()
  .catch((err) => {
    console.error("[seed-pantouflages] Échec :", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
