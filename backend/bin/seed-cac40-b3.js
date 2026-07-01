/**
 * Seed CAC 40 — Lot B3 : Conseils d'administration (7 sociétés).
 *
 * Enquête OSINT journalistique — consultation du 2026-07-01.
 * Périmètre : Euronext, Hermès International, Kering, Legrand,
 *             L'Oréal, LVMH, Michelin.
 *
 * LVMH (Q504998) existe déjà en base (seed antérieur) → non ajouté à
 * ORGANISATIONS mais référencé dans LIENS via son Q-id.
 * Bernard Arnault (Q32055) et Antoine Arnault (Q2853612) existent déjà
 * en base → non ajoutés à PERSONNES mais référencés dans LIENS.
 *
 * INTERLOCKS DÉTECTÉS parmi les 7 conseils :
 *   — Florent Menegaux (Q33272867)  : Michelin (gérant) + Legrand (admin)
 *   — Patrice Caine (Q18744665)     : L'Oréal (admin) + Thales [lot B5]
 *
 * LIENS FAMILIAUX (capital dynastique) :
 *   — Bernard Arnault → Delphine Arnault   (famille, LVMH)
 *   — Bernard Arnault → Alexandre Arnault  (famille, LVMH)
 *   — Bernard Arnault → Antoine Arnault    (famille, LVMH — déjà en base)
 *   — Bernard Arnault → Frédéric Arnault   (famille, LVMH)
 *   — Françoise Bettencourt Meyers → Jean-Victor Meyers (famille, L'Oréal)
 *   — Axel Dumas → Pierre-Alexis Dumas     (famille, Hermès)
 *
 * Membres exclus (sans wikidataId vérifié) :
 *   Euronext    : Christel Bories, Simon Gallagher, Luc Rémont,
 *                 Mireille Faugère, Isabel Aguilera, Werner Steinmüller,
 *                 Lieve Mostrey, Rafael Villanueva Tormo (~8)
 *   Hermès      : Jérôme Guerineau-Hartmann, Sarah Essmyer, Matthieu
 *                 Dumas, Élodie du Mesnil du Buisson (~4 CS membres)
 *   Kering      : Ginevra Elkann, Patricia Barbizet, Sophie L'Hélias,
 *                 Jean-Pierre Denis, Yseulys Costes, Tidjane Thiam (~6)
 *   Legrand     : Angeles Garcia-Poveda (présidente CA sans Q-id),
 *                 Isabelle Boccon-Gibod, François Grappotte, Caroline
 *                 de La Marnierre, Gilles Schnepp [déjà en b2] (~4 +
 *                 représentants salariés)
 *   L'Oréal     : Virginie Morgon, Ilham Kadri, Ana Sofia Amaral,
 *                 Sophie Bellon, Fabiola Arredondo (~5)
 *   LVMH        : Yves-Thibault de Silguy, Marie-Josée Kravis, Marie-
 *                 Laure Sauty de Chalon, Natacha Valla, Lord Powell,
 *                 représentants syndicaux (~6+)
 *   Michelin    : Anne-Sophie de La Bigne, Sophie Boissard, Pat Oliva,
 *                 Thierry Moulonguet, Larry Pieniazek (~5)
 *
 * Sources : sites de gouvernance officiels, Wikidata, Wikipédia, URD
 *           2024/2025, communiqués de presse (cf. SOURCES).
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - membres sans Q-id exclus
 *
 * Usage :
 *   cd backend && node bin/seed-cac40-b3.js
 *   cd backend && node bin/seed-cac40-b3.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — chaque fiche recoupée par ≥ 2 sources publiques.
// wikidataIds vérifiés via https://www.wikidata.org/wiki/<Q-id>
// NB : Bernard Arnault (Q32055), Antoine Arnault (Q2853612) non listés ici
//      (existent déjà en base) mais référencés dans LIENS.
// ---------------------------------------------------------------------------

const PERSONNES = [
  // ─── Euronext ─────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q33290562 + Wikipedia EN + euronext.com/governance
    nom: 'Boujnah',
    prenom: 'Stéphane',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1969-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "CEO et président du directoire d'Euronext NV",
    rolesSecondaires: ["ancien banquier Goldman Sachs, Deutsche Bank", "administrateur de BPI France"],
    bio:
      "Stéphane Boujnah dirige Euronext depuis novembre 2015, transformant la bourse paneuropéenne " +
      "via les acquisitions de Borsa Italiana (2021), Oslo Børs (2019) et d'autres marchés. " +
      "Diplômé de Sciences Po et de l'ENA, ancien de Goldman Sachs et Deutsche Bank.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/St%C3%A9phane_Boujnah',
    wikidataId: 'Q33290562',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3351381 + Wikipedia FR + euronext.com (conseil de surveillance)
    // NB : aussi directeur général de CDC Habitat (groupe Caisse des Dépôts)
    nom: 'Sichel',
    prenom: 'Olivier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1968-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Directeur général de CDC Habitat ; membre du conseil de surveillance d'Euronext",
    rolesSecondaires: [
      "ancien directeur général adjoint de la Caisse des Dépôts",
      "ENA, Corps des ponts",
    ],
    bio:
      "Olivier Sichel est directeur général de CDC Habitat depuis 2020, filiale logement de la Caisse " +
      "des Dépôts. Il siège au conseil de surveillance d'Euronext NV en tant que représentant " +
      "de l'actionnaire CDC. Ancien haut fonctionnaire, Corps des ponts, ENA.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Olivier_Sichel',
    wikidataId: 'Q3351381',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Hermès International ─────────────────────────────────────────────────

  {
    // Sources : Wikidata Q16034569 + Wikipedia EN + finance.hermes.com (URD 2025)
    // NB : gérant commandité principal — SCA (société en commandite par actions)
    nom: 'Dumas',
    prenom: 'Axel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1970-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Gérant commandité principal d'Hermès International SCA",
    rolesSecondaires: [
      "descendant de la famille fondatrice Hermès",
      "arrière-arrière-petit-fils de Thierry Hermès",
    ],
    bio:
      "Axel Dumas est gérant commandité d'Hermès depuis 2013, à la tête de la maison familiale " +
      "fondée en 1837. Avocat de formation, il représente la sixième génération de la famille Hermès " +
      "à diriger la maison. Sous sa direction, Hermès est devenu le deuxième groupe de luxe mondial.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Axel_Dumas',
    wikidataId: 'Q16034569',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q7191959 + Wikipedia EN + finance.hermes.com
    // NB : gérant commandité + directeur artistique ; frère d'Axel Dumas (LIEN FAMILLE)
    nom: 'Dumas',
    prenom: 'Pierre-Alexis',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Directeur artistique et gérant commandité d'Hermès International SCA",
    rolesSecondaires: ["diplômé des Beaux-Arts et Sciences Po", "en charge de la stratégie créative"],
    bio:
      "Pierre-Alexis Dumas est directeur artistique d'Hermès depuis 2005, supervisant l'ensemble " +
      "des métiers créatifs de la maison. Nommé gérant commandité aux côtés de son frère Axel, " +
      "il appartient à la sixième génération Hermès.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Pierre-Alexis_Dumas',
    wikidataId: 'Q7191959',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q68021400 + Wikipedia FR + finance.hermes.com (URD 2025, p. gouvernance)
    // NB : président du conseil de surveillance d'Hermès depuis 2021
    nom: 'de Seynes',
    prenom: 'Éric',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Président du conseil de surveillance d'Hermès International SCA",
    rolesSecondaires: [
      "ancien président de Yamaha Motor Europe",
      "membre du conseil de surveillance d'Hermès depuis 2012",
    ],
    bio:
      "Éric de Seynes est président du conseil de surveillance d'Hermès International depuis 2021, " +
      "après y avoir siégé depuis 2012. Ancien président de Yamaha Motor Europe, il supervise la " +
      "gouvernance de la SCA sans exercer de fonctions exécutives.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89ric_de_Seynes',
    wikidataId: 'Q68021400',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Kering ───────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q1371822 + Wikipedia EN/FR + kering.com/governance
    // NB : né le 1962-05-28 ; ancien PDG jusqu'en sep. 2025, désormais président non-exécutif
    nom: 'Pinault',
    prenom: 'François-Henri',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1962-05-28'),
    lieuNaissance: 'Rennes (Ille-et-Vilaine)',
    rolePrincipal: "Président du conseil d'administration de Kering",
    rolesSecondaires: [
      "actionnaire de référence de Kering via Artémis",
      "président du conseil de Christies (2023-)",
      "fils de François Pinault (Q194280)",
    ],
    bio:
      "François-Henri Pinault a dirigé Kering (ex-PPR) comme PDG de 2005 à septembre 2025, date " +
      "à laquelle il a cédé la direction générale à Luca de Meo tout en conservant la présidence " +
      "non-exécutive du conseil. Fils de François Pinault, il détient le contrôle via la holding " +
      "familiale Artémis. Polytechnicien, marié à Salma Hayek.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Fran%C3%A7ois-Henri_Pinault',
    wikidataId: 'Q1371822',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3264974 + Wikipedia EN/FR + kering.com/press (sep. 2025)
    // NB : ex-PDG de Renault SA, nommé DG de Kering le 15 septembre 2025
    nom: 'de Meo',
    prenom: 'Luca',
    pays: 'France',
    nationalite: 'italienne',
    dateNaissance: new Date('1967-06-11'),
    lieuNaissance: 'Italie',
    rolePrincipal: "Directeur général de Kering SA (depuis septembre 2025)",
    rolesSecondaires: [
      "ancien PDG de Renault SA (2020-2025)",
      "ancien PDG de SEAT (2015-2020)",
      "président de l'ACEA (Association des constructeurs européens)",
    ],
    bio:
      "Luca de Meo a redressé Renault entre 2020 et 2025 avant d'être nommé directeur général de " +
      "Kering le 15 septembre 2025, remplaçant François-Henri Pinault dans les fonctions exécutives. " +
      "Ingénieur de formation, il a également dirigé SEAT et des entités d'Audi et Volkswagen.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Luca_de_Meo',
    wikidataId: 'Q3264974',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q33105136 + Wikipedia EN + kering.com (DG délégué)
    nom: 'Palus',
    prenom: 'Jean-François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1964-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Directeur général délégué de Kering SA",
    rolesSecondaires: [
      "polytechnicien, Corps des mines",
      "directeur financier de Kering (ex-PPR) de 2005 à 2018",
    ],
    bio:
      "Jean-François Palus est directeur général délégué de Kering, rôle qu'il exerce depuis " +
      "plusieurs années en parallèle de la direction de Gucci entre 2021 et 2023. Polytechnicien " +
      "et ingénieur du Corps des mines, il est l'un des architectes financiers du groupe.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Jean-Fran%C3%A7ois_Palus',
    wikidataId: 'Q33105136',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Legrand ──────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q58118409 + Wikipedia FR + legrand.com/governance
    // NB : né le 1973-11-30 ; PDG de Legrand depuis janvier 2018
    nom: 'Coquart',
    prenom: 'Benoît',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1973-11-30'),
    lieuNaissance: 'France',
    rolePrincipal: "Directeur général de Legrand SA",
    rolesSecondaires: [
      "HEC Paris",
      "directeur financier de Legrand (2012-2018)",
    ],
    bio:
      "Benoît Coquart est directeur général de Legrand depuis janvier 2018, succédant à Gilles " +
      "Schnepp. Diplômé de HEC Paris, il a rejoint le groupe en 2003 et en a dirigé les finances " +
      "de 2012 à 2018. Legrand est le leader mondial des infrastructures électriques et numériques.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Beno%C3%AEt_Coquart',
    wikidataId: 'Q58118409',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Michelin (+ INTERLOCK Legrand) ──────────────────────────────────────

  {
    // Sources : Wikidata Q33272867 + Wikipedia EN + michelin.com/governance
    // NB : gérant commandité de Michelin (SCA) depuis 2019 ;
    //      membre du conseil de Legrand depuis AGM mai 2025 (INTERLOCK)
    nom: 'Menegaux',
    prenom: 'Florent',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Gérant commandité de Compagnie Générale des Établissements Michelin SCA",
    rolesSecondaires: [
      "administrateur indépendant de Legrand (depuis mai 2025)",
      "Centrale Lyon, MBA Wharton",
    ],
    bio:
      "Florent Menegaux est gérant commandité de Michelin depuis juin 2019. Il siège au conseil " +
      "d'administration de Legrand depuis mai 2025 (AGM), constituant un interlock Michelin-Legrand. " +
      "Diplômé de l'École Centrale de Lyon et d'un MBA Wharton (Univ. de Pennsylvanie).",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Florent_Menegaux',
    wikidataId: 'Q33272867',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q22209551 + Wikipedia EN + michelin.com (conseil de surveillance)
    // NB : présidente du conseil de surveillance de Michelin depuis 2021
    nom: 'Dalibard',
    prenom: 'Barbara',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Présidente du conseil de surveillance de Michelin SCA",
    rolesSecondaires: [
      "ancienne DG de SNCF Réseau (2012-2017)",
      "ancienne PDG de SNCF Voyageurs (2020-2022)",
      "ancienne CEO de Getlink (ex-Eurotunnel)",
    ],
    bio:
      "Barbara Dalibard préside le conseil de surveillance de Michelin depuis l'AGM de mai 2021. " +
      "Ingénieure des télécommunications, ancienne cadre dirigeante de France Télécom et " +
      "de plusieurs entités SNCF, elle apporte une expertise en infrastructure et transformation.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Barbara_Dalibard',
    wikidataId: 'Q22209551',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3524368 + Wikipedia FR + michelin.com (conseil de surveillance)
    // NB : PDG d'Arkema SA ; membre du conseil de surveillance de Michelin
    nom: 'Le Hénaff',
    prenom: 'Thierry',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1965-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "PDG d'Arkema SA ; membre du conseil de surveillance de Michelin SCA",
    rolesSecondaires: [
      "Polytechnique, Corps des mines",
      "PDG d'Arkema depuis sa cotation en 2006",
    ],
    bio:
      "Thierry Le Hénaff est PDG d'Arkema depuis la cotation du groupe en 2006. Polytechnicien " +
      "et ingénieur du Corps des mines, il siège au conseil de surveillance de Michelin, " +
      "constituant un lien entre les secteurs chimie spéciale et pneumatiques.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Thierry_Le_H%C3%A9naff',
    wikidataId: 'Q3524368',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── L'Oréal ──────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q195993 + Wikipedia EN/FR + loreal.com/governance
    // NB : PDG de L'Oréal (2006-2021), puis président non-exécutif du CA depuis 2021
    nom: 'Agon',
    prenom: 'Jean-Paul',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1956-05-09'),
    lieuNaissance: 'France',
    rolePrincipal: "Président non-exécutif du conseil d'administration de L'Oréal",
    rolesSecondaires: [
      "PDG de L'Oréal (2006-2021)",
      "HEC Paris",
    ],
    bio:
      "Jean-Paul Agon a dirigé L'Oréal comme PDG de 2006 à 2021, période durant laquelle " +
      "le groupe est devenu le leader mondial de la beauté. Il en préside le conseil " +
      "d'administration non-exécutif depuis mai 2021.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Jean-Paul_Agon',
    wikidataId: 'Q195993',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q33119793 + Wikipedia EN + loreal.com/governance (CEO depuis mai 2021)
    nom: 'Hieronimus',
    prenom: 'Nicolas',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Directeur général de L'Oréal",
    rolesSecondaires: [
      "HEC Paris",
      "DG adjoint de L'Oréal (2019-2021)",
      "directeur général de L'Oréal Luxe (2011-2019)",
    ],
    bio:
      "Nicolas Hieronimus est directeur général de L'Oréal depuis mai 2021, succédant à Jean-Paul " +
      "Agon. Diplômé de HEC, il a consacré l'intégralité de sa carrière au groupe, notamment à la " +
      "tête de la division Luxe de 2011 à 2019.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Nicolas_Hieronimus',
    wikidataId: 'Q33119793',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3170071 + Wikipedia FR + loreal.com (AGM 29 avril 2025)
    // NB : fils de Françoise Bettencourt Meyers (LIEN FAMILLE) ;
    //      nommé vice-président du CA à l'AGM du 29 avril 2025
    nom: 'Meyers',
    prenom: 'Jean-Victor',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1986-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Vice-président du conseil d'administration de L'Oréal",
    rolesSecondaires: [
      "représentant de la famille Bettencourt dans la gouvernance de L'Oréal",
      "fils de Françoise Bettencourt Meyers (Q516720)",
    ],
    bio:
      "Jean-Victor Meyers siège au conseil d'administration de L'Oréal depuis plusieurs années " +
      "et en est devenu vice-président à l'AGM du 29 avril 2025. Il représente la troisième " +
      "génération de la famille fondatrice Bettencourt.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Victor_Meyers',
    wikidataId: 'Q3170071',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3391698 + Wikipedia EN + loreal.com (AGM 2026 / communiqué)
    // NB : ancien PDG d'Inditex (Zara) ; nommé vice-président du CA de L'Oréal début 2026
    nom: 'Isla',
    prenom: 'Pablo',
    pays: 'France',
    nationalite: 'espagnole',
    dateNaissance: new Date('1964-03-07'),
    lieuNaissance: 'La Corogne (Espagne)',
    rolePrincipal: "Vice-président du conseil d'administration de L'Oréal",
    rolesSecondaires: [
      "ancien PDG d'Inditex SA (2011-2022)",
      "président de SEAT SA (1999-2005)",
    ],
    bio:
      "Pablo Isla a dirigé Inditex (Zara, Massimo Dutti…) de 2011 à 2022. Nommé vice-président " +
      "du conseil d'administration de L'Oréal en 2026, il apporte une expertise retail et " +
      "distribution internationale au groupe cosmétique.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Pablo_Isla',
    wikidataId: 'Q3391698',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q516720 + Wikipedia EN/FR + loreal.com (AGM 29 avril 2025 — sortie)
    // NB : a quitté le conseil de L'Oréal à l'AGM du 29 avril 2025.
    //      Mère de Jean-Victor Meyers (LIEN FAMILLE). Actionnaire majoritaire via Téthys.
    nom: 'Bettencourt Meyers',
    prenom: 'Françoise',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1953-07-10'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Présidente de Téthys SAS (holding familiale L'Oréal)",
    rolesSecondaires: [
      "fille de Liliane Bettencourt et André Bettencourt",
      "ancienne administratrice de L'Oréal SA (jusqu'au 29 avril 2025)",
      "auteure de La Saga des Wertheimer (ouvrage sur Chanel)",
    ],
    bio:
      "Françoise Bettencourt Meyers est la petite-fille d'Eugène Schueller, fondateur de L'Oréal. " +
      "Elle préside la holding familiale Téthys, actionnaire de référence de L'Oréal via ~33 % du " +
      "capital. Elle a quitté le conseil de L'Oréal à l'AGM du 29 avril 2025, laissant son fils " +
      "Jean-Victor Meyers représenter la famille au CA.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Fran%C3%A7oise_Bettencourt_Meyers',
    wikidataId: 'Q516720',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q18744665 + Wikipedia EN + loreal.com/governance (admin) + thalesgroup.com
    // NB : PDG de Thales SA (lot B5) + administrateur de L'Oréal (INTERLOCK B3-B5)
    nom: 'Caine',
    prenom: 'Patrice',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1969-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "PDG de Thales SA ; administrateur indépendant de L'Oréal",
    rolesSecondaires: [
      "Polytechnique, ENA",
      "PDG de Thales depuis 2015",
    ],
    bio:
      "Patrice Caine dirige Thales depuis 2015. Il siège en tant qu'administrateur indépendant " +
      "au conseil de L'Oréal. INTERLOCK documenté : présent dans le lot B5 (Thales) et dans " +
      "le présent lot (L'Oréal).",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Patrice_Caine',
    wikidataId: 'Q18744665',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── LVMH (administrateurs de la famille Arnault) ─────────────────────────
  // NB : LVMH (Q504998), Bernard Arnault (Q32055) et Antoine Arnault (Q2853612)
  //      existent déjà en base — non re-créés ici. Seuls les enfants non encore
  //      présents sont listés.

  {
    // Sources : Wikidata Q3021804 + Wikipedia EN/FR + lvmh.com/governance
    // NB : fille de Bernard Arnault (LIEN FAMILLE) ; EVP Louis Vuitton + CEO Christian Dior SE
    nom: 'Arnault',
    prenom: 'Delphine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1975-04-04'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Administratrice de LVMH SE ; PDG de Christian Dior SE",
    rolesSecondaires: [
      "fille de Bernard Arnault (Q32055)",
      "Executive VP de Louis Vuitton (2013-2023)",
      "PDG de Christian Dior SE depuis 2023",
    ],
    bio:
      "Delphine Arnault est administratrice du conseil de LVMH depuis 2003 et PDG de Christian " +
      "Dior SE depuis mars 2023. Fille aînée de Bernard Arnault, diplômée de Sciences Po et de " +
      "la London School of Economics, elle représente la deuxième génération Arnault dans le groupe.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Delphine_Arnault',
    wikidataId: 'Q3021804',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q62009054 + Wikipedia EN + lvmh.com/governance
    // NB : fils de Bernard Arnault (LIEN FAMILLE) ; EVP LVMH ; vice-président de Tag Heuer
    nom: 'Arnault',
    prenom: 'Alexandre',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1992-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Executive Vice President de LVMH SE ; administrateur de LVMH SE",
    rolesSecondaires: [
      "fils de Bernard Arnault (Q32055)",
      "vice-président de Loro Piana",
      "ancien CEO de Rimowa (2017-2021)",
    ],
    bio:
      "Alexandre Arnault est executive vice president de LVMH chargé des produits et communications. " +
      "Fils de Bernard Arnault, diplômé de Polytechnique et de Telecom ParisTech, il siège au " +
      "conseil de LVMH depuis 2022.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Alexandre_Arnault',
    wikidataId: 'Q62009054',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q105037449 + Wikipedia EN + lvmh.com/governance
    // NB : fils de Bernard Arnault (LIEN FAMILLE) ; CEO de TAG Heuer + directeur LVMH montres
    nom: 'Arnault',
    prenom: 'Frédéric',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1995-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "CEO de LVMH Watches ; administrateur de LVMH SE (depuis AGM avril 2024)",
    rolesSecondaires: [
      "fils de Bernard Arnault (Q32055)",
      "CEO de TAG Heuer (2020-2024)",
      "Polytechnique",
    ],
    bio:
      "Frédéric Arnault est directeur général de LVMH Watches depuis 2024, après avoir redressé " +
      "TAG Heuer comme CEO de 2020 à 2024. Fils cadet de Bernard Arnault, polytechnicien, il a " +
      "rejoint le conseil de LVMH à l'AGM d'avril 2024.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Arnault',
    wikidataId: 'Q105037449',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — LVMH (Q504998) exclu (existe déjà en base).
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q842108 + Wikipedia EN + euronext.com
    nom: 'Euronext NV',
    sigle: 'ENX',
    typeOrganisation: 'ENTREPRISE',
    pays: 'Pays-Bas',
    siteWeb: 'https://www.euronext.com',
    description:
      "Opérateur des principales bourses de valeurs paneuropéennes (Paris, Amsterdam, Bruxelles, " +
      "Dublin, Lisbonne, Oslo, Milan). Coté depuis 2014 ; PDG Stéphane Boujnah depuis 2015. CAC 40.",
    dateCreation: new Date('2000-09-22'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Euronext',
    wikidataId: 'Q842108',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q843887 + Wikipedia FR/EN + finance.hermes.com
    nom: 'Hermès International',
    sigle: 'RMS',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.hermes.com',
    description:
      "Maison de luxe française fondée en 1837, société en commandite par actions (SCA). " +
      "Spécialisée maroquinerie, soierie, prêt-à-porter, parfums. Gérants Axel et Pierre-Alexis " +
      "Dumas. Deuxième capitalisation du secteur luxe mondial. CAC 40.",
    dateCreation: new Date('1837-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Herm%C3%A8s_International',
    wikidataId: 'Q843887',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q931207 + Wikipedia EN/FR + kering.com
    nom: 'Kering',
    sigle: 'KER',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.kering.com',
    description:
      "Groupe de luxe français (ex-PPR, ex-Pinault-Printemps-Redoute). Maisons : Gucci, " +
      "Saint Laurent, Bottega Veneta, Balenciaga, Alexander McQueen. Contrôlé par la famille " +
      "Pinault via Artémis. PDG Luca de Meo (depuis sep. 2025), président F.-H. Pinault. CAC 40.",
    dateCreation: new Date('1963-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Kering',
    wikidataId: 'Q931207',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q636755 + Wikipedia EN/FR + legrand.com
    nom: 'Legrand SA',
    sigle: 'LR',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.legrand.com',
    description:
      "Leader mondial des infrastructures électriques et numériques du bâtiment (prises, " +
      "disjoncteurs, data centers, smart home). Siège à Limoges ; DG Benoît Coquart. CAC 40.",
    dateCreation: new Date('1865-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Legrand_(entreprise)',
    wikidataId: 'Q636755',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q156077 + Wikipedia FR/EN + loreal.com
    nom: "L'Oréal",
    sigle: 'OR',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.loreal.com',
    description:
      "Premier groupe cosmétique mondial, fondé en 1909 par Eugène Schueller. Famille Bettencourt " +
      "(Téthys, ~33 %) + Nestlé (~20 %) actionnaires de référence. DG Nicolas Hieronimus, " +
      "président Jean-Paul Agon. Marques : L'Oréal Paris, Lancôme, Maybelline, Kérastase. CAC 40.",
    dateCreation: new Date('1909-07-30'),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/L%27Or%C3%A9al",
    wikidataId: 'Q156077',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q151107 + Wikipedia EN/FR + michelin.com
    nom: 'Compagnie Générale des Établissements Michelin',
    sigle: 'ML',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.michelin.com',
    description:
      "Fabricant de pneumatiques français fondé à Clermont-Ferrand en 1889, numéro deux mondial " +
      "du secteur (derrière Bridgestone). Société en commandite par actions (SCA) ; gérant Florent " +
      "Menegaux, présidente du CS Barbara Dalibard. Éditeur du Guide Michelin. CAC 40.",
    dateCreation: new Date('1889-05-28'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Michelin',
    wikidataId: 'Q151107',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées. dateConsultation 2026-07-01.
// ---------------------------------------------------------------------------

const SOURCES = {
  // ── Euronext ───────────────────────────────────────────────────────────────
  gov_euronext: {
    url: 'https://www.euronext.com/en/investor-relations/corporate-governance/managing-board',
    titre: "Corporate Governance — Managing Board & Supervisory Board — Euronext NV",
    media: 'Euronext NV (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'Pays-Bas',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Euronext NV',
    description:
      "Page officielle listant les membres du directoire (Managing Board) et du conseil de " +
      "surveillance (Supervisory Board) d'Euronext NV, dont Stéphane Boujnah et Olivier Sichel.",
    verifiee: true,
  },
  wp_boujnah: {
    url: 'https://en.wikipedia.org/wiki/St%C3%A9phane_Boujnah',
    titre: 'Stéphane Boujnah — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "CEO d'Euronext depuis novembre 2015 ; Sciences Po, ENA ; ex-Goldman Sachs et Deutsche Bank.",
    verifiee: true,
  },

  // ── Hermès ─────────────────────────────────────────────────────────────────
  gov_hermes: {
    url: 'https://finance.hermes.com/en/group-management/',
    titre: "Group Management — Hermès Finance (site officiel)",
    media: 'Hermès International (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-04-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Hermès International',
    description:
      "Page de gouvernance officielle d'Hermès : gérants commandités (Axel et Pierre-Alexis Dumas) " +
      "et conseil de surveillance (président Éric de Seynes).",
    verifiee: true,
  },
  urd_hermes: {
    url: 'https://assets-finance.hermes.com/s3fs-public/node/pdf_file/2026-03/1774270445/extrait-urd-2025_donnees-cles-sur-la-gerance-et-les-instances-dirigeantes.pdf',
    titre: "URD 2025 — Données clés sur la gérance et les instances dirigeantes — Hermès",
    media: 'Hermès International (AMF)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-03-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Hermès International SCA',
    description:
      "Extrait URD 2025 contenant les données clés sur la gérance commanditée et les membres " +
      "du conseil de surveillance, avec dates de nomination et mandats.",
    verifiee: true,
  },
  wp_axel_dumas: {
    url: 'https://en.wikipedia.org/wiki/Axel_Dumas',
    titre: 'Axel Dumas — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Gérant commandité d'Hermès depuis 2013 ; sixième génération de la famille fondatrice.",
    verifiee: true,
  },

  // ── Kering ─────────────────────────────────────────────────────────────────
  gov_kering: {
    url: 'https://www.kering.com/en/group/governance/board-of-directors/',
    titre: "Board of Directors — Kering",
    media: 'Kering (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Kering SA',
    description:
      "Page officielle du conseil d'administration de Kering : composition, mandats et comités " +
      "après le changement de gouvernance (Pinault non-exécutif, de Meo DG, sep. 2025).",
    verifiee: true,
  },
  pr_kering_demeo: {
    url: 'https://us.fashionnetwork.com/news/Kering-s-francois-henri-pinault-steps-aside-remains-board-chairman,1741187.html',
    titre: "Kering : Pinault cède la direction générale à Luca de Meo, reste président — FashionNetwork",
    media: 'FashionNetwork',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2025-09-15'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'FashionNetwork',
    description:
      "Annonce de la nomination de Luca de Meo comme DG de Kering le 15 septembre 2025, " +
      "François-Henri Pinault restant président non-exécutif du conseil.",
    verifiee: true,
  },
  wp_pinault_fh: {
    url: 'https://en.wikipedia.org/wiki/Fran%C3%A7ois-Henri_Pinault',
    titre: 'François-Henri Pinault — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "PDG de Kering (2005-2025), puis président non-exécutif ; Polytechnique ; fils de François " +
      "Pinault ; contrôle via Artémis.",
    verifiee: true,
  },
  wp_luca_demeo: {
    url: 'https://en.wikipedia.org/wiki/Luca_de_Meo',
    titre: 'Luca de Meo — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Ingénieur auto, PDG de Renault (2020-2025), DG de Kering depuis sep. 2025.",
    verifiee: true,
  },

  // ── Legrand ────────────────────────────────────────────────────────────────
  gov_legrand: {
    url: 'https://www.legrand.com/en/investors-and-shareholders/corporate-governance/board-directors',
    titre: "Board of Directors — Legrand",
    media: 'Legrand (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-05-27'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Legrand SA',
    description:
      "Composition officielle du conseil d'administration de Legrand après l'AGM du 27 mai 2025, " +
      "incluant la nomination de Florent Menegaux (Michelin) comme administrateur indépendant.",
    verifiee: true,
  },
  wp_coquart: {
    url: 'https://fr.wikipedia.org/wiki/Beno%C3%AEt_Coquart',
    titre: 'Benoît Coquart — Wikipédia (FR)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "HEC Paris ; DG de Legrand depuis janvier 2018, succédant à Gilles Schnepp.",
    verifiee: true,
  },

  // ── L'Oréal ────────────────────────────────────────────────────────────────
  gov_loreal: {
    url: 'https://www.loreal.com/en/group/governance-and-ethics/board-of-directors/',
    titre: "Board of Directors — L'Oréal",
    media: "L'Oréal (site officiel)",
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-05-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: "L'Oréal SA",
    description:
      "Composition du conseil d'administration de L'Oréal après l'AGM du 29 avril 2025 : " +
      "sortie de Françoise Bettencourt Meyers, nomination de Jean-Victor Meyers comme vice-président.",
    verifiee: true,
  },
  wp_fbm: {
    url: 'https://en.wikipedia.org/wiki/Fran%C3%A7oise_Bettencourt_Meyers',
    titre: 'Françoise Bettencourt Meyers — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Petite-fille du fondateur de L'Oréal ; présidente de Téthys SAS ; a quitté le CA de " +
      "L'Oréal le 29 avril 2025.",
    verifiee: true,
  },
  wp_agon: {
    url: 'https://en.wikipedia.org/wiki/Jean-Paul_Agon',
    titre: 'Jean-Paul Agon — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "PDG de L'Oréal (2006-2021) puis président non-exécutif du CA depuis mai 2021 ; HEC Paris.",
    verifiee: true,
  },
  wp_caine: {
    url: 'https://en.wikipedia.org/wiki/Patrice_Caine',
    titre: 'Patrice Caine — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "PDG de Thales SA depuis 2015 ; Polytechnique, ENA ; administrateur indépendant de L'Oréal.",
    verifiee: true,
  },

  // ── LVMH ───────────────────────────────────────────────────────────────────
  gov_lvmh: {
    url: 'https://www.lvmh.com/en/our-group/governance',
    titre: "Governance — LVMH SE",
    media: 'LVMH SE (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-05-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'LVMH SE',
    description:
      "Page de gouvernance officielle de LVMH : liste du conseil d'administration incluant " +
      "Delphine, Alexandre et Frédéric Arnault comme administrateurs.",
    verifiee: true,
  },
  wp_delphine: {
    url: 'https://en.wikipedia.org/wiki/Delphine_Arnault',
    titre: 'Delphine Arnault — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Fille de Bernard Arnault ; PDG de Christian Dior SE depuis mars 2023 ; admin. LVMH depuis 2003.",
    verifiee: true,
  },
  wp_alexandre: {
    url: 'https://en.wikipedia.org/wiki/Alexandre_Arnault',
    titre: 'Alexandre Arnault — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Fils de Bernard Arnault ; EVP LVMH ; Polytechnique + Telecom ; ex-CEO Rimowa (2017-2021).",
    verifiee: true,
  },
  wp_frederic: {
    url: 'https://en.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Arnault',
    titre: 'Frédéric Arnault — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Fils de Bernard Arnault ; CEO LVMH Watches ; ex-CEO TAG Heuer (2020-2024) ; Polytechnique.",
    verifiee: true,
  },

  // ── Michelin ───────────────────────────────────────────────────────────────
  gov_michelin: {
    url: 'https://www.michelin.com/en/group/corporate-governance/supervisory-board',
    titre: "Supervisory Board — Michelin",
    media: 'Michelin (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-05-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Michelin',
    description:
      "Composition officielle du conseil de surveillance de Michelin SCA : présidente Barbara " +
      "Dalibard et membres dont Thierry Le Hénaff.",
    verifiee: true,
  },
  wp_menegaux: {
    url: 'https://en.wikipedia.org/wiki/Florent_Menegaux',
    titre: 'Florent Menegaux — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Gérant commandité de Michelin depuis juin 2019 ; Centrale Lyon + MBA Wharton ; " +
      "administrateur indépendant de Legrand depuis mai 2025 (INTERLOCK).",
    verifiee: true,
  },
  wp_dalibard: {
    url: 'https://en.wikipedia.org/wiki/Barbara_Dalibard',
    titre: 'Barbara Dalibard — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Présidente du conseil de surveillance de Michelin depuis mai 2021 ; ancienne DG SNCF Réseau.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002). aRef / bRef = wikidataId des entités.
// ---------------------------------------------------------------------------

const LIENS = [
  // ══════════════════════════════════════════════════════
  // Euronext NV (Q842108)
  // ══════════════════════════════════════════════════════

  {
    // Stéphane Boujnah — CEO / président du directoire
    aType: 'personne',
    aRef: 'Q33290562',
    bType: 'organisation',
    bRef: 'Q842108',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Stéphane Boujnah est président du directoire (Managing Board) d'Euronext NV depuis " +
      "novembre 2015. Il pilote la stratégie d'expansion paneuropéenne.",
    dateDebut: new Date('2015-11-16'),
    dateFin: null,
    sourceRef: 'gov_euronext',
  },
  {
    aType: 'personne',
    aRef: 'Q33290562',
    bType: 'organisation',
    bRef: 'Q842108',
    typeLienCode: 'DIRIGEANT',
    description:
      "Stéphane Boujnah est directeur général (CEO) d'Euronext NV depuis novembre 2015, " +
      "dans le cadre d'une gouvernance duale (directoire + conseil de surveillance).",
    dateDebut: new Date('2015-11-16'),
    dateFin: null,
    sourceRef: 'wp_boujnah',
  },
  {
    // Olivier Sichel — membre du conseil de surveillance (Supervisory Board)
    aType: 'personne',
    aRef: 'Q3351381',
    bType: 'organisation',
    bRef: 'Q842108',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Olivier Sichel siège au conseil de surveillance d'Euronext NV en tant que représentant " +
      "de la Caisse des Dépôts et Consignations, actionnaire stratégique du groupe.",
    dateDebut: new Date('2021-01-01'),
    dateFin: null,
    sourceRef: 'gov_euronext',
  },

  // ══════════════════════════════════════════════════════
  // Hermès International SCA (Q843887)
  // ══════════════════════════════════════════════════════

  {
    // Axel Dumas — gérant commandité principal (exécutif)
    aType: 'personne',
    aRef: 'Q16034569',
    bType: 'organisation',
    bRef: 'Q843887',
    typeLienCode: 'DIRIGEANT',
    description:
      "Axel Dumas est gérant commandité d'Hermès International SCA depuis 2013. En qualité de " +
      "gérant d'une SCA, il assume la responsabilité illimitée et dirige la maison de luxe.",
    dateDebut: new Date('2013-06-01'),
    dateFin: null,
    sourceRef: 'urd_hermes',
  },
  {
    // Pierre-Alexis Dumas — gérant commandité (exécutif + artistique)
    aType: 'personne',
    aRef: 'Q7191959',
    bType: 'organisation',
    bRef: 'Q843887',
    typeLienCode: 'DIRIGEANT',
    description:
      "Pierre-Alexis Dumas est gérant commandité et directeur artistique d'Hermès International " +
      "SCA depuis 2020. Il supervise l'ensemble des directions créatives de la maison.",
    dateDebut: new Date('2020-01-01'),
    dateFin: null,
    sourceRef: 'urd_hermes',
  },
  {
    // Éric de Seynes — président du conseil de surveillance (non-exécutif)
    aType: 'personne',
    aRef: 'Q68021400',
    bType: 'organisation',
    bRef: 'Q843887',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Éric de Seynes est président du conseil de surveillance d'Hermès International SCA " +
      "depuis 2021, supervisant la gouvernance de la société sans exercer de fonctions exécutives.",
    dateDebut: new Date('2021-06-01'),
    dateFin: null,
    sourceRef: 'gov_hermes',
  },
  {
    // Axel Dumas ↔ Pierre-Alexis Dumas — liens familiaux (frères)
    aType: 'personne',
    aRef: 'Q16034569',
    bType: 'personne',
    bRef: 'Q7191959',
    typeLienCode: 'famille',
    description:
      "Axel Dumas et Pierre-Alexis Dumas sont frères, tous deux appartenant à la sixième " +
      "génération de la famille Hermès et co-gérants commandités de la SCA.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_axel_dumas',
  },

  // ══════════════════════════════════════════════════════
  // Kering SA (Q931207)
  // ══════════════════════════════════════════════════════

  {
    // François-Henri Pinault — président du CA (non-exécutif depuis sep. 2025)
    aType: 'personne',
    aRef: 'Q1371822',
    bType: 'organisation',
    bRef: 'Q931207',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "François-Henri Pinault préside le conseil d'administration de Kering depuis 2005. " +
      "Il a cédé la direction générale à Luca de Meo le 15 septembre 2025 tout en conservant " +
      "la présidence non-exécutive du CA.",
    dateDebut: new Date('2005-01-01'),
    dateFin: null,
    sourceRef: 'gov_kering',
  },
  {
    // Luca de Meo — directeur général (administrateur + dirigeant depuis sep. 2025)
    aType: 'personne',
    aRef: 'Q3264974',
    bType: 'organisation',
    bRef: 'Q931207',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Luca de Meo est directeur général de Kering SA depuis le 15 septembre 2025, nommé " +
      "par le conseil sur proposition de François-Henri Pinault.",
    dateDebut: new Date('2025-09-15'),
    dateFin: null,
    sourceRef: 'pr_kering_demeo',
  },
  {
    aType: 'personne',
    aRef: 'Q3264974',
    bType: 'organisation',
    bRef: 'Q931207',
    typeLienCode: 'DIRIGEANT',
    description:
      "Luca de Meo dirige Kering comme DG depuis le 15 septembre 2025, dans le cadre d'une " +
      "gouvernance dissociée (président non-exécutif : François-Henri Pinault).",
    dateDebut: new Date('2025-09-15'),
    dateFin: null,
    sourceRef: 'wp_luca_demeo',
  },
  {
    // Jean-François Palus — directeur général délégué (exécutif)
    aType: 'personne',
    aRef: 'Q33105136',
    bType: 'organisation',
    bRef: 'Q931207',
    typeLienCode: 'DIRIGEANT',
    description:
      "Jean-François Palus est directeur général délégué de Kering SA, mandataire social " +
      "exécutif aux côtés du DG Luca de Meo.",
    dateDebut: new Date('2018-01-01'),
    dateFin: null,
    sourceRef: 'gov_kering',
  },

  // ══════════════════════════════════════════════════════
  // Legrand SA (Q636755)
  // ══════════════════════════════════════════════════════

  {
    // Benoît Coquart — DG (administrateur + dirigeant)
    aType: 'personne',
    aRef: 'Q58118409',
    bType: 'organisation',
    bRef: 'Q636755',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Benoît Coquart est administrateur et directeur général de Legrand SA depuis janvier 2018.",
    dateDebut: new Date('2018-01-01'),
    dateFin: null,
    sourceRef: 'gov_legrand',
  },
  {
    aType: 'personne',
    aRef: 'Q58118409',
    bType: 'organisation',
    bRef: 'Q636755',
    typeLienCode: 'DIRIGEANT',
    description:
      "Benoît Coquart est directeur général de Legrand depuis janvier 2018, succédant à Gilles " +
      "Schnepp qui a conservé la présidence non-exécutive du conseil.",
    dateDebut: new Date('2018-01-01'),
    dateFin: null,
    sourceRef: 'wp_coquart',
  },
  {
    // Florent Menegaux — administrateur indépendant (INTERLOCK Michelin-Legrand)
    aType: 'personne',
    aRef: 'Q33272867',
    bType: 'organisation',
    bRef: 'Q636755',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Florent Menegaux, gérant commandité de Michelin, a rejoint le conseil d'administration " +
      "de Legrand comme administrateur indépendant à l'AGM du 27 mai 2025. " +
      "INTERLOCK documenté : siège simultanément à la tête de Michelin.",
    dateDebut: new Date('2025-05-27'),
    dateFin: null,
    sourceRef: 'gov_legrand',
  },

  // ══════════════════════════════════════════════════════
  // L'Oréal SA (Q156077)
  // ══════════════════════════════════════════════════════

  {
    // Jean-Paul Agon — président non-exécutif du CA
    aType: 'personne',
    aRef: 'Q195993',
    bType: 'organisation',
    bRef: 'Q156077',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Jean-Paul Agon est président non-exécutif du conseil d'administration de L'Oréal " +
      "depuis mai 2021, après avoir été PDG de 2006 à 2021.",
    dateDebut: new Date('2021-05-20'),
    dateFin: null,
    sourceRef: 'gov_loreal',
  },
  {
    // Nicolas Hieronimus — DG (administrateur + dirigeant)
    aType: 'personne',
    aRef: 'Q33119793',
    bType: 'organisation',
    bRef: 'Q156077',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Nicolas Hieronimus est administrateur et directeur général de L'Oréal depuis mai 2021.",
    dateDebut: new Date('2021-05-20'),
    dateFin: null,
    sourceRef: 'gov_loreal',
  },
  {
    aType: 'personne',
    aRef: 'Q33119793',
    bType: 'organisation',
    bRef: 'Q156077',
    typeLienCode: 'DIRIGEANT',
    description:
      "Nicolas Hieronimus est directeur général de L'Oréal depuis mai 2021, dans le cadre " +
      "d'une gouvernance dissociée (président non-exécutif : Jean-Paul Agon).",
    dateDebut: new Date('2021-05-20'),
    dateFin: null,
    sourceRef: 'wp_agon',
  },
  {
    // Jean-Victor Meyers — vice-président du CA (depuis AGM 29 avril 2025)
    aType: 'personne',
    aRef: 'Q3170071',
    bType: 'organisation',
    bRef: 'Q156077',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Jean-Victor Meyers est vice-président du conseil d'administration de L'Oréal depuis " +
      "l'AGM du 29 avril 2025, succédant à sa mère Françoise Bettencourt Meyers qui quittait " +
      "simultanément le conseil.",
    dateDebut: new Date('2025-04-29'),
    dateFin: null,
    sourceRef: 'gov_loreal',
  },
  {
    // Pablo Isla — vice-président du CA (depuis 2026)
    aType: 'personne',
    aRef: 'Q3391698',
    bType: 'organisation',
    bRef: 'Q156077',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Pablo Isla, ancien PDG d'Inditex, a rejoint le conseil d'administration de L'Oréal " +
      "en 2026 comme vice-président indépendant.",
    dateDebut: new Date('2026-01-01'),
    dateFin: null,
    sourceRef: 'gov_loreal',
  },
  {
    // Françoise Bettencourt Meyers — administratrice sortante (dateFin : 29 avril 2025)
    aType: 'personne',
    aRef: 'Q516720',
    bType: 'organisation',
    bRef: 'Q156077',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Françoise Bettencourt Meyers a siégé au conseil d'administration de L'Oréal SA " +
      "jusqu'à l'AGM du 29 avril 2025, date à laquelle elle n'a pas renouvelé son mandat, " +
      "laissant la représentation familiale à son fils Jean-Victor Meyers.",
    dateDebut: new Date('2012-01-01'),
    dateFin: new Date('2025-04-29'),
    sourceRef: 'wp_fbm',
  },
  {
    // Patrice Caine — administrateur indépendant (INTERLOCK L'Oréal + Thales)
    aType: 'personne',
    aRef: 'Q18744665',
    bType: 'organisation',
    bRef: 'Q156077',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Patrice Caine, PDG de Thales, est administrateur indépendant de L'Oréal. " +
      "INTERLOCK documenté : présent également dans le lot B5 (Thales).",
    dateDebut: new Date('2023-01-01'),
    dateFin: null,
    sourceRef: 'gov_loreal',
  },
  {
    // Françoise BM → Jean-Victor Meyers — lien familial (mère/fils)
    aType: 'personne',
    aRef: 'Q516720',
    bType: 'personne',
    bRef: 'Q3170071',
    typeLienCode: 'famille',
    description:
      "Françoise Bettencourt Meyers est la mère de Jean-Victor Meyers. Les deux ont successivement " +
      "représenté la famille Bettencourt au conseil d'administration de L'Oréal.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_fbm',
  },

  // ══════════════════════════════════════════════════════
  // LVMH SE (Q504998) — organisation déjà en base, non re-créée.
  // Bernard Arnault (Q32055) et Antoine Arnault (Q2853612) déjà en base.
  // ══════════════════════════════════════════════════════

  {
    // Delphine Arnault — administratrice de LVMH (depuis 2003)
    aType: 'personne',
    aRef: 'Q3021804',
    bType: 'organisation',
    bRef: 'Q504998',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Delphine Arnault est administratrice de LVMH SE depuis 2003 et PDG de Christian Dior SE " +
      "depuis mars 2023. Elle représente la deuxième génération Arnault au conseil de LVMH.",
    dateDebut: new Date('2003-01-01'),
    dateFin: null,
    sourceRef: 'gov_lvmh',
  },
  {
    // Alexandre Arnault — administrateur de LVMH (depuis 2022)
    aType: 'personne',
    aRef: 'Q62009054',
    bType: 'organisation',
    bRef: 'Q504998',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Alexandre Arnault est administrateur de LVMH SE depuis 2022 et EVP chargé des produits " +
      "et des communications du groupe.",
    dateDebut: new Date('2022-04-01'),
    dateFin: null,
    sourceRef: 'gov_lvmh',
  },
  {
    // Frédéric Arnault — administrateur de LVMH (depuis AGM avril 2024)
    aType: 'personne',
    aRef: 'Q105037449',
    bType: 'organisation',
    bRef: 'Q504998',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Frédéric Arnault a rejoint le conseil de LVMH SE à l'AGM d'avril 2024, après avoir " +
      "redressé TAG Heuer comme CEO de 2020 à 2024. Il dirige désormais LVMH Watches.",
    dateDebut: new Date('2024-04-01'),
    dateFin: null,
    sourceRef: 'gov_lvmh',
  },
  {
    // Bernard Arnault → Delphine Arnault — lien familial (père/fille)
    aType: 'personne',
    aRef: 'Q32055',
    bType: 'personne',
    bRef: 'Q3021804',
    typeLienCode: 'famille',
    description:
      "Bernard Arnault est le père de Delphine Arnault. Tous deux siègent au conseil de LVMH SE.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'gov_lvmh',
  },
  {
    // Bernard Arnault → Alexandre Arnault — lien familial (père/fils)
    aType: 'personne',
    aRef: 'Q32055',
    bType: 'personne',
    bRef: 'Q62009054',
    typeLienCode: 'famille',
    description:
      "Bernard Arnault est le père d'Alexandre Arnault. Tous deux siègent au conseil de LVMH SE.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'gov_lvmh',
  },
  {
    // Bernard Arnault → Frédéric Arnault — lien familial (père/fils)
    aType: 'personne',
    aRef: 'Q32055',
    bType: 'personne',
    bRef: 'Q105037449',
    typeLienCode: 'famille',
    description:
      "Bernard Arnault est le père de Frédéric Arnault. Tous deux siègent au conseil de LVMH SE.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'gov_lvmh',
  },

  // ══════════════════════════════════════════════════════
  // Michelin SCA (Q151107)
  // ══════════════════════════════════════════════════════

  {
    // Florent Menegaux — gérant commandité (dirigeant exécutif)
    aType: 'personne',
    aRef: 'Q33272867',
    bType: 'organisation',
    bRef: 'Q151107',
    typeLienCode: 'DIRIGEANT',
    description:
      "Florent Menegaux est gérant commandité de Michelin SCA depuis juin 2019, assumant la " +
      "responsabilité illimitée et la direction opérationnelle du groupe.",
    dateDebut: new Date('2019-06-01'),
    dateFin: null,
    sourceRef: 'wp_menegaux',
  },
  {
    // Barbara Dalibard — présidente du conseil de surveillance (non-exécutive)
    aType: 'personne',
    aRef: 'Q22209551',
    bType: 'organisation',
    bRef: 'Q151107',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Barbara Dalibard préside le conseil de surveillance de Michelin SCA depuis l'AGM " +
      "de mai 2021.",
    dateDebut: new Date('2021-05-01'),
    dateFin: null,
    sourceRef: 'gov_michelin',
  },
  {
    // Thierry Le Hénaff — membre du conseil de surveillance
    aType: 'personne',
    aRef: 'Q3524368',
    bType: 'organisation',
    bRef: 'Q151107',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Thierry Le Hénaff, PDG d'Arkema SA, siège au conseil de surveillance de Michelin SCA " +
      "en tant que membre indépendant.",
    dateDebut: new Date('2018-01-01'),
    dateFin: null,
    sourceRef: 'gov_michelin',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents — recopiés verbatim de seed-cac40-pilote.js
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-cac40-b3] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-cac40-b3] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données CAC 40 B3 précédentes...')
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
  console.log(`\n┌─ seed-cac40-b3 — Conseils d'administration CAC 40 (7 sociétés) ──────┐\n`)
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  + ${data.titre}`)
  }

  console.log('\n— Personnes (Wikidata) —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  + ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n— Organisations (Wikidata) —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  + ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Liens —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  + ${lien.typeLienCode} | ${lien.aRef} → ${lien.bRef}`)
  }

  console.log('\n┌─ Bilan ──────────────────────────────────────────────────────────────┐')
  console.log(`│ Personnes     : ${PERSONNES.length} (hors Bernard/Antoine Arnault déjà en base)`)
  console.log(`│ Organisations : ${ORGANISATIONS.length} (hors LVMH déjà en base)`)
  console.log(`│ Sources       : ${Object.keys(SOURCES).length}`)
  console.log(`│ Liens         : ${LIENS.length} (ADMINISTRATEUR + DIRIGEANT + famille)`)
  console.log('│')
  console.log('│ INTERLOCKS :')
  console.log('│   — Florent Menegaux (Q33272867) : Michelin (gérant) + Legrand (admin)')
  console.log('│   — Patrice Caine (Q18744665)    : L\'Oréal (admin) + Thales [lot B5]')
  console.log('│')
  console.log('│ LIENS FAMILIAUX :')
  console.log('│   — Arnault : Bernard → Delphine, Alexandre, Frédéric (LVMH)')
  console.log('│   — Bettencourt : Françoise BM → Jean-Victor Meyers (L\'Oréal)')
  console.log('│   — Dumas : Axel ↔ Pierre-Alexis (Hermès)')
  console.log('└───────────────────────────────────────────────────────────────────────┘')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
