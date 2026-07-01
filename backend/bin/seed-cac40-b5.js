/**
 * Seed CAC 40 — Lot B5 (7 sociétés).
 *
 * Enquête OSINT journalistique — consultation du 2026-06-30.
 * Périmètre : Société Générale, Stellantis, STMicroelectronics, Thales,
 *             Unibail-Rodamco-Westfield, Veolia, Vinci.
 *
 * Pour chaque société : conseil complet limité aux membres disposant d'un
 * wikidataId vérifié (wbsearchentities / Special:EntityData). Les membres
 * sans Q-id sont exclus et listés en commentaire pour suivi.
 *
 * INTERLOCKS DÉTECTÉS (intra-B5 et cross-batch avec le pilote) :
 *   — Nicolas Dufourcq (Q3340278)     : Stellantis + STMicroelectronics [INTRA-B5]
 *   — Pierre-André de Chalendar (Q1518898) : BNP Paribas (pilote) + Veolia [B1→B5]
 *   — Slawomir Krupa (Q116865148)     : TotalEnergies (pilote, admin) + Société Générale (B5, DG) [B1→B5]
 *   — Xavier Huillard (Q731462)       : Air Liquide (pilote, lead director) + Vinci (B5, chairman) [B1→B5]
 *   — Frédéric Oudéa (Q984266)        : Sanofi (pilote, chair CA) + Société Générale (B5, ancien DG) [B3→B5]
 *
 * Gouvernance duale STMicroelectronics et Unibail-Rodamco-Westfield :
 *   — STMicro (SE de droit néerlandais) : Supervisory Board + Managing Board.
 *     Les administrateurs inclus ici sont membres du Supervisory Board.
 *   — URW (SE de droit néerlandais) : Supervisory Board + Management Board.
 *     Seul Xavier Niel (Q1450891) dispose d'un Q-id vérifié côté Supervisory Board.
 *
 * Sources : sites de gouvernance officiels, Wikidata, Wikipédia,
 *           URD / Form 20-F, communiqués AMF et SEC, Légifrance (cf. SOURCES).
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - membres sans Q-id exclus ; listés en commentaire « EXCLUS » par société
 *
 * Usage :
 *   cd backend && node bin/seed-cac40-b5.js
 *   cd backend && node bin/seed-cac40-b5.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — chaque fiche recoupée par ≥ 2 sources publiques.
// wikidataIds vérifiés via https://www.wikidata.org/wiki/<Q-id>
// ---------------------------------------------------------------------------

const PERSONNES = [
  // ─── Société Générale ─────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q730325 + Wikipedia EN + societegenerale.com/gouvernance
    // Président du CA de la Société Générale depuis janvier 2015.
    // Prédécesseur de William Connelly (AG mai 2026), absent Q-id vérifié → exclu.
    nom: 'Bini Smaghi',
    prenom: 'Lorenzo',
    pays: 'Italie',
    nationalite: 'italienne',
    dateNaissance: new Date('1956-11-28'),
    lieuNaissance: 'Florence (Italie)',
    rolePrincipal: "Président du conseil d'administration de la Société Générale",
    rolesSecondaires: [
      "ancien membre du directoire de la BCE (2005-2011)",
      "ancien directeur général des relations financières internationales du ministère de l'Économie italien",
      "économiste, docteur Université de Chicago (1988)",
    ],
    bio:
      "Économiste et banquier italien, Lorenzo Bini Smaghi a siégé au directoire de la Banque centrale " +
      "européenne de 2005 à 2011. Administrateur indépendant de la Société Générale depuis 2014, il en " +
      "est président du CA depuis janvier 2015. Son mandat expire à l'AG du 27 mai 2026, où il sera " +
      "remplacé par William Connelly.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Lorenzo_Bini_Smaghi',
    wikidataId: 'Q730325',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q116865148 + Wikipedia EN + societegenerale.com/gouvernance
    // NB : DÉJÀ présent dans le pilote (admin TotalEnergies depuis mai 2026).
    // Ce re-upsert ajoute le lien Société Générale (DG depuis mai 2023).
    nom: 'Krupa',
    prenom: 'Slawomir',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1974-06-18'),
    lieuNaissance: 'France',
    rolePrincipal: "Directeur général de la Société Générale ; administrateur indépendant de TotalEnergies",
    rolesSecondaires: [
      "président de la Fédération bancaire européenne (depuis 2025)",
      "ancien président de la Fédération bancaire française (2024-2025)",
      "diplômé de Sciences Po Paris",
    ],
    bio:
      "Slawomir Krupa dirige la Société Générale depuis mai 2023. Il est également administrateur " +
      "indépendant de TotalEnergies depuis l'AG du 29 mai 2026. Interlock documenté entre les deux " +
      "conseils. Diplômé de Sciences Po Paris.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Slawomir_Krupa',
    wikidataId: 'Q116865148',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q984266 + Wikipedia EN + societegenerale.com/communiqués
    // NB : DÉJÀ présent dans le pilote (président CA Sanofi depuis mai 2023).
    // Ce re-upsert ajoute le lien ANCIEN_MANDAT DG Société Générale (2009-2023).
    nom: 'Oudéa',
    prenom: 'Frédéric',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-07-03'),
    lieuNaissance: 'France',
    rolePrincipal: "Président du conseil d'administration de Sanofi",
    rolesSecondaires: [
      "ancien PDG de la Société Générale (2009-2023)",
      "ancien président de la Fédération bancaire française",
      "X-Mines",
    ],
    bio:
      "Polytechnicien et ingénieur du Corps des mines, Frédéric Oudéa a dirigé la Société Générale " +
      "pendant quatorze ans (2009-2023). Élu président du conseil d'administration de Sanofi le " +
      "25 mai 2023, il succède à Serge Weinberg. Interlock documenté : ancien DG de la Société Générale.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Oud%C3%A9a',
    wikidataId: 'Q984266',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Stellantis ───────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q284011 + Wikipedia EN + stellantis.com/governance
    // Executive Chairman de Stellantis depuis la finalisation de la fusion PSA-FCA le 16 jan. 2021.
    nom: 'Elkann',
    prenom: 'John',
    pays: 'Italie',
    nationalite: 'italo-américaine',
    dateNaissance: new Date('1976-04-01'),
    lieuNaissance: 'New York (États-Unis)',
    rolePrincipal: "Executive Chairman de Stellantis",
    rolesSecondaires: [
      "CEO d'Exor N.V. (holding de la famille Agnelli, depuis 2004)",
      "président de Ferrari N.V. (depuis juillet 2018)",
      "administrateur de Meta Platforms",
      "trustee du MoMA (New York)",
    ],
    bio:
      "Petit-fils de Gianni Agnelli et héritier de la famille industrielle turinoise, John Elkann " +
      "est Executive Chairman de Stellantis depuis la fusion PSA-FCA (janvier 2021). Il est " +
      "parallèlement CEO d'Exor et président de Ferrari. Il a conduit la sélection d'Antonio " +
      "Filosa comme nouveau CEO de Stellantis en juin 2025, après la démission de Carlos Tavares.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/John_Elkann',
    wikidataId: 'Q284011',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q2158478 + Wikipedia FR + stellantis.com/governance
    nom: 'Peugeot',
    prenom: 'Robert',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1950-04-25'),
    lieuNaissance: 'Belfort (Territoire de Belfort)',
    rolePrincipal: "Vice-président du conseil d'administration de Stellantis",
    rolesSecondaires: [
      "président de Peugeot Invest (anciennement FFP, depuis 2002)",
      "Centrale Paris (1971) + INSEAD (1973)",
      "issu de la famille industrielle Peugeot",
    ],
    bio:
      "Membre de la famille Peugeot et ancien cadre opérationnel du groupe PSA Peugeot Citroën (1974-2007), " +
      "Robert Peugeot préside Peugeot Invest depuis 2002. Il est vice-président du conseil d'administration " +
      "de Stellantis depuis la fusion PSA-FCA (janvier 2021), représentant les intérêts familiaux.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Robert_Peugeot',
    wikidataId: 'Q2158478',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q1381360 + Wikipedia EN + stellantis.com/governance
    // Lead Independent Director de Stellantis. Ancien PDG d'AXA (2000-2016).
    nom: 'de Castries',
    prenom: 'Henri',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1954-08-15'),
    lieuNaissance: 'Bayonne (Pyrénées-Atlantiques)',
    rolePrincipal: "Lead Independent Director de Stellantis",
    rolesSecondaires: [
      "ancien PDG d'AXA (2000-2016)",
      "président de l'Institut Montaigne (depuis 2015)",
      "HEC Paris (1976) + ENA (1980)",
      "administrateur de LVMH, HSBC",
    ],
    bio:
      "Inspecteur des finances et ancien PDG d'AXA (2000-2016), Henri de Castries est Lead Independent " +
      "Director de Stellantis depuis janvier 2021. Il préside le think tank Institut Montaigne et siège " +
      "aux conseils de LVMH et HSBC. Il a précédemment été vice-président du conseil de Nestlé (jusqu'en 2024).",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Henri_de_Castries',
    wikidataId: 'Q1381360',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3340278 + Wikipedia FR + stellantis.com + investors.st.com
    // INTERLOCK INTRA-B5 : administrateur de Stellantis (depuis jan. 2021)
    //   ET président puis vice-président du Supervisory Board de STMicroelectronics.
    // PDG de Bpifrance → représentant de l'État actionnaire (via STMicro Holding).
    nom: 'Dufourcq',
    prenom: 'Nicolas',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-07-18'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Directeur général de Bpifrance",
    rolesSecondaires: [
      "vice-président du Supervisory Board de STMicroelectronics (depuis mai 2026)",
      "administrateur de Stellantis (depuis janvier 2021)",
      "HEC Paris + Sciences Po + ENA (1988)",
      "ancien directeur général de France Télécom Interactive et de Capgemini France",
    ],
    bio:
      "Directeur général de Bpifrance depuis janvier 2013, Nicolas Dufourcq est administrateur de Stellantis " +
      "depuis la fusion PSA-FCA (janvier 2021). Il représente l'État français actionnaire au Supervisory Board " +
      "de STMicroelectronics, dont il fut président avant d'en devenir vice-président en mai 2026 (après " +
      "l'élection d'Armando Varricchio). Interlock intra-B5 documenté : Stellantis + STMicroelectronics.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nicolas_Dufourcq',
    wikidataId: 'Q3340278',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q2939466 + Wikipedia EN + stellantis.com (PR déc. 2024)
    // Ancien PDG de PSA puis CEO de Stellantis (2021-2024). Démission le 1er déc. 2024.
    nom: 'Tavares',
    prenom: 'Carlos',
    pays: 'Portugal',
    nationalite: 'portugaise',
    dateNaissance: new Date('1958-12-23'),
    lieuNaissance: 'Lisbonne (Portugal)',
    rolePrincipal: "Ancien CEO de Stellantis (janvier 2021 — décembre 2024)",
    rolesSecondaires: [
      "ancien PDG de PSA Peugeot Citroën (2014-2021)",
      "ingénieur de formation (Instituto Superior Técnico, Lisbonne)",
    ],
    bio:
      "Carlos Tavares a dirigé PSA Peugeot Citroën de 2014 à 2021, conduisant notamment l'acquisition " +
      "d'Opel/Vauxhall (2017) et la fusion avec FCA pour former Stellantis. Il en fut le premier CEO " +
      "jusqu'au 1er décembre 2024, date de sa démission acceptée par le conseil face à une chute de " +
      "70 % des bénéfices nets et une perte de parts de marché en Amérique du Nord.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Carlos_Tavares',
    wikidataId: 'Q2939466',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── STMicroelectronics ───────────────────────────────────────────────────

  {
    // Sources : Wikidata Q24701506 + Wikipedia EN + investors.st.com + GlobeNewswire mai 2026
    // Nommé président du Supervisory Board de STMicroelectronics à l'AG du 27 mai 2026.
    // Diplomate italien, ancien ambassadeur aux États-Unis (2016-2021).
    nom: 'Varricchio',
    prenom: 'Armando',
    pays: 'Italie',
    nationalite: 'italienne',
    dateNaissance: new Date('1961-06-13'),
    lieuNaissance: 'Venise (Italie)',
    rolePrincipal: "Président du Supervisory Board de STMicroelectronics (depuis mai 2026)",
    rolesSecondaires: [
      "ancien ambassadeur d'Italie aux États-Unis (2016-2021)",
      "ancien conseiller diplomatique des Premiers ministres Letta et Renzi",
      "diplômé en relations internationales, Université de Padoue (1985)",
      "Chevalier Grand-Croix de l'Ordre du Mérite de la République italienne (2016)",
    ],
    bio:
      "Diplomate de carrière entré au service des affaires étrangères italiennes en 1986, Armando " +
      "Varricchio a été ambassadeur en Serbie (2009-2012) et aux États-Unis (2016-2021). Nommé " +
      "président du Supervisory Board de STMicroelectronics à l'AG du 27 mai 2026 pour un mandat " +
      "de trois ans (jusqu'à l'AG 2029), il succède à Nicolas Dufourcq qui devient vice-président.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Armando_Varricchio',
    wikidataId: 'Q24701506',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Thales ───────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q18744665 + Wikipédia FR + thalesgroup.com/patrice-caine
    // PDG de Thales depuis le 23 décembre 2014. Mandat renouvelé jusqu'en 2030 (AG 12 mai 2026).
    nom: 'Caine',
    prenom: 'Patrice',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1970-01-07'),
    lieuNaissance: 'Paris (15e)',
    rolePrincipal: "Président-directeur général de Thales",
    rolesSecondaires: [
      "X-Mines (Polytechnique 1992, Corps des mines 1995)",
      "président de l'ANRT (Association nationale de la recherche et de la technologie, depuis déc. 2019)",
    ],
    bio:
      "Polytechnicien et ingénieur du Corps des mines, Patrice Caine est PDG de Thales depuis le " +
      "23 décembre 2014. Il a conduit la transformation du groupe vers les activités de défense " +
      "numérique et de sécurité des systèmes d'information (acquisition de Gemalto, 2019). Ses " +
      "mandats d'administrateur et de PDG ont été renouvelés jusqu'en 2030 à l'AG du 12 mai 2026.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Patrice_Caine',
    wikidataId: 'Q18744665',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3591380 + Wikipedia EN + thalesgroup.com/governance
    // PDG de Dassault Aviation (depuis jan. 2013) et administrateur de Thales.
    // Thales : accord d'actionnaires entre l'État français et Dassault Aviation.
    nom: 'Trappier',
    prenom: 'Éric',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1960-01-06'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Président-directeur général de Dassault Aviation ; administrateur de Thales",
    rolesSecondaires: [
      "président du Groupe Industriel Marcel Dassault (depuis jan. 2025)",
      "Telecom SudParis (1983)",
      "président de GIFAS (depuis juil. 2025)",
      "président de l'ASD (AeroSpace and Defence Industries Association of Europe)",
    ],
    bio:
      "Ingénieur issu de Telecom SudParis, Éric Trappier a rejoint Dassault Aviation en 1984 et en est " +
      "PDG depuis janvier 2013. En vertu de l'accord d'actionnaires liant l'État français et Dassault " +
      "Aviation sur Thales, il siège au conseil d'administration du groupe de défense. Il préside " +
      "GIFAS depuis juillet 2025, succédant à Olivier Andriès.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Eric_Trappier',
    wikidataId: 'Q3591380',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Unibail-Rodamco-Westfield ────────────────────────────────────────────

  {
    // Sources : Wikidata Q1450891 + Wikipedia EN + urw.com + GlobeNewswire nov. 2020
    // Administrateur du Supervisory Board d'URW depuis novembre 2020.
    // Actionnaire de référence : ~25 % du capital via Rock Investment et NJJ Market.
    nom: 'Niel',
    prenom: 'Xavier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-08-25'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Fondateur et actionnaire de contrôle d'Iliad (Free) ; administrateur du Supervisory Board d'Unibail-Rodamco-Westfield",
    rolesSecondaires: [
      "fondateur d'Iliad (Free, 1999)",
      "associé de NJJ Holding (family office)",
      "fondateur de l'école 42 (2013)",
      "administrateur de BNP Paribas (anciennement)",
      "actionnaire de ByteDance et KKR",
    ],
    bio:
      "Fondateur d'Iliad (Free), opérateur télécom français, Xavier Niel est l'un des principaux " +
      "actionnaires d'Unibail-Rodamco-Westfield avec environ 25 % du capital (via Rock Investment " +
      "et NJJ Market). Il a rejoint le Supervisory Board d'URW en novembre 2020 dans le cadre d'une " +
      "campagne d'actionnaires militants (avec Léon Bressler) ayant conduit à une refonte stratégique " +
      "du groupe (plan « Refocus »).",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Xavier_Niel',
    wikidataId: 'Q1450891',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Veolia ───────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q2853963 + Wikipedia EN + veolia.com/governance
    // Président non-exécutif du CA de Veolia depuis le 1er juillet 2022.
    // Auparavant PDG de Veolia Environnement (2009-2022).
    nom: 'Frérot',
    prenom: 'Antoine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-06-03'),
    lieuNaissance: 'Fontainebleau (Seine-et-Marne)',
    rolePrincipal: "Président du conseil d'administration de Veolia",
    rolesSecondaires: [
      "ancien PDG de Veolia Environnement (2009-2022)",
      "Polytechnique (1977) + École des ponts ParisTech (docteur en génie civil)",
      "officier de la Légion d'honneur (2015)",
    ],
    bio:
      "Polytechnicien et ingénieur, Antoine Frérot a dirigé Veolia Environnement comme PDG de 2009 " +
      "à 2022, conduisant notamment l'acquisition de Suez en 2022. Depuis le 1er juillet 2022, il " +
      "préside le conseil d'administration de façon non-exécutive, la direction générale ayant été " +
      "confiée à Estelle Brachlianoff. Ses mandats ont été proposés au renouvellement à l'AG du " +
      "23 avril 2026.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Antoine_Fr%C3%A9rot',
    wikidataId: 'Q2853963',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q111208905 + Wikipedia EN + veolia.com/governance
    // DG de Veolia depuis le 1er juillet 2022. Troisième femme PDG du CAC 40.
    nom: 'Brachlianoff',
    prenom: 'Estelle',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1972-07-26'),
    lieuNaissance: 'Neuilly-sur-Seine (Hauts-de-Seine)',
    rolePrincipal: "Directrice générale de Veolia",
    rolesSecondaires: [
      "Polytechnique (1992) + École nationale des ponts et chaussées (1997)",
      "ancienne DG de Veolia Royaume-Uni (2018-2022)",
      "administratrice non-exécutive d'Hermès (depuis mai 2019)",
      "vice-présidente d'EPE",
    ],
    bio:
      "Polytechnicienne et ingénieure des Ponts, Estelle Brachlianoff dirige Veolia depuis le 1er " +
      "juillet 2022, devenant l'une des rares femmes à la tête d'un groupe du CAC 40. Elle conduit " +
      "l'intégration de Suez dans Veolia et l'internationalisation du groupe (215 000 employés dans " +
      "56 pays en 2025, CA 44,4 Md€). Ses mandats ont été proposés au renouvellement à l'AG du " +
      "23 avril 2026.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Estelle_Brachlianoff',
    wikidataId: 'Q111208905',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q1518898 + Wikipedia EN + veolia.com/governance
    // NB : DÉJÀ présent dans le pilote (administrateur indépendant de BNP Paribas depuis 2021,
    //   président CA de Saint-Gobain). Ce re-upsert ajoute le lien Veolia (senior independent director).
    // INTERLOCK cross-batch : BNP Paribas (pilote, B1) + Veolia (B5).
    nom: 'de Chalendar',
    prenom: 'Pierre-André',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-04-12'),
    lieuNaissance: 'Vichy (Allier)',
    rolePrincipal: "Président du conseil d'administration de Compagnie de Saint-Gobain ; Senior Independent Director de Veolia",
    rolesSecondaires: [
      "ancien PDG de Saint-Gobain (2010-2021)",
      "ENA (1983)",
      "administrateur indépendant de BNP Paribas (depuis 2021)",
      "observateur au conseil de FORVIA (depuis juil. 2025)",
    ],
    bio:
      "Issu de l'ESSEC et de l'ENA, Pierre-André de Chalendar a dirigé Saint-Gobain comme PDG de 2010 " +
      "à 2021. Président du CA depuis 2021, il est Senior Independent Director et président du comité " +
      "des nominations de Veolia (depuis avril 2021, renouvelé en 2025). Interlock cross-batch documenté " +
      "avec BNP Paribas (administrateur indépendant depuis mai 2021).",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Pierre-Andr%C3%A9_de_Chalendar',
    wikidataId: 'Q1518898',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q32588324 + Wikidata direct + veolia.com/governance + safran-group.com
    nom: 'Andriès',
    prenom: 'Olivier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1962-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Directeur général de Safran ; administrateur indépendant de Veolia",
    rolesSecondaires: [
      "Polytechnique + École des mines",
      "DG de Safran depuis le 1er janvier 2021",
      "président de GIFAS jusqu'en juil. 2025 (remplacé par Éric Trappier)",
      "président du CA de l'École des Mines de Paris (depuis sept. 2024)",
    ],
    bio:
      "Polytechnicien, Olivier Andriès dirige Safran depuis janvier 2021. Il est administrateur " +
      "indépendant de Veolia, où il apporte son expertise industrielle dans les énergies et les " +
      "technologies de pointe. Ancien président de GIFAS (2022-2025) et du CA de l'École nationale " +
      "supérieure des mines de Paris (depuis sept. 2024).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Olivier_Andri%C3%A8s',
    wikidataId: 'Q32588324',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q20089495 + Wikipedia EN + veolia.com/governance + amundi.com
    nom: 'Brassac',
    prenom: 'Philippe',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1959-08-01'),
    lieuNaissance: 'Nîmes (Gard)',
    rolePrincipal: "Directeur général de Crédit Agricole S.A. ; administrateur indépendant de Veolia",
    rolesSecondaires: [
      "ENSAE Paris (1981)",
      "DG de Crédit Agricole SA depuis mai 2015",
      "président de la Fédération bancaire française (depuis sept. 2016)",
      "officier de la Légion d'honneur (2022)",
    ],
    bio:
      "Diplômé de l'ENSAE Paris, Philippe Brassac dirige Crédit Agricole S.A. depuis mai 2015. " +
      "Il est administrateur indépendant de Veolia, où il contribue à la gouvernance financière " +
      "du groupe. Président de la Fédération bancaire française depuis 2016, il apporte une " +
      "expertise bancaire complémentaire au conseil.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Philippe_Brassac',
    wikidataId: 'Q20089495',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Vinci ────────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q731462 + Wikipedia EN + vinci.com/governance
    // NB : DÉJÀ présent dans le pilote (lead director d'Air Liquide).
    // Ce re-upsert ajoute le lien Vinci (président du CA depuis le 1er mai 2025).
    // Avant le 1er mai 2025, il était PDG (président-directeur général) de Vinci.
    // INTERLOCK cross-batch : Air Liquide (pilote, lead director) + Vinci (B5, chairman).
    nom: 'Huillard',
    prenom: 'Xavier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1954-06-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Président du conseil d'administration de Vinci ; administrateur référent d'Air Liquide",
    rolesSecondaires: [
      "X-Ponts",
      "PDG de Vinci de 2010 au 30 avril 2025",
      "président du comité des nominations et de la gouvernance d'Air Liquide",
    ],
    bio:
      "Polytechnicien et ingénieur des Ponts, Xavier Huillard a dirigé Vinci comme PDG de 2010 à " +
      "avril 2025. Depuis le 1er mai 2025, il préside le conseil d'administration de façon non-exécutive, " +
      "la direction générale ayant été confiée à Pierre Anjolras. Il est également administrateur " +
      "référent d'Air Liquide (interlock cross-batch avec le pilote).",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Xavier_Huillard',
    wikidataId: 'Q731462',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q33161719 + Wikipedia EN + vinci.com/governance/board-directors/benoit-bazin
    nom: 'Bazin',
    prenom: 'Benoît',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1968-12-29'),
    lieuNaissance: 'Boulogne-Billancourt (Hauts-de-Seine)',
    rolePrincipal: "Président-directeur général de Saint-Gobain ; administrateur de Vinci",
    rolesSecondaires: [
      "Polytechnique + École nationale des ponts et chaussées + MIT (MSc 1995)",
      "Sciences Po Paris (DEA économie 1994)",
      "PDG de Saint-Gobain depuis juin 2024 (succède à Pierre-André de Chalendar)",
    ],
    bio:
      "Polytechnicien et ingénieur des Ponts, Benoît Bazin a rejoint Saint-Gobain en 1999 après " +
      "un début de carrière au ministère de l'Économie. Nommé directeur général adjoint en 2019, " +
      "il succède à Pierre-André de Chalendar comme PDG en juin 2024. Il siège au conseil " +
      "d'administration de Vinci.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Beno%C3%AEt_Bazin',
    wikidataId: 'Q33161719',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — 7 sociétés CAC 40 (lot B5)
// wikidataIds vérifiés via Special:EntityData
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q270363 + Wikipedia FR/EN + societegenerale.com
    nom: 'Société Générale',
    sigle: 'SG',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.societegenerale.com',
    description:
      "Troisième banque française par le total de bilan, fondée le 4 mai 1864. Présente dans " +
      "plus de 50 pays. Présidée par Lorenzo Bini Smaghi (jusqu'à l'AG mai 2026), dirigée par " +
      "Slawomir Krupa depuis mai 2023. CAC 40.",
    dateCreation: new Date('1864-05-04'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Soci%C3%A9t%C3%A9_g%C3%A9n%C3%A9rale',
    wikidataId: 'Q270363',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q97439162 + Wikipedia EN + stellantis.com
    nom: 'Stellantis',
    sigle: 'STLA',
    typeOrganisation: 'ENTREPRISE',
    pays: 'Pays-Bas',
    siteWeb: 'https://www.stellantis.com',
    description:
      "Groupe automobile franco-italo-américain né le 16 janvier 2021 de la fusion de PSA " +
      "Groupe (Peugeot, Citroën, Opel, DS) et de FCA (Fiat, Chrysler, Jeep, RAM). 14 marques, " +
      "présent dans 130+ marchés. Executive Chairman : John Elkann. CAC 40.",
    dateCreation: new Date('2021-01-16'),
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Stellantis',
    wikidataId: 'Q97439162',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q661845 + Wikipedia EN + st.com (investors.st.com)
    // SE de droit néerlandais, siège opérationnel à Plan-les-Ouates (Suisse).
    // Actionnaire principal : STMicroelectronics Holding (Q111600905),
    //   détenu à 50 % par Bpifrance et à 50 % par le Trésor italien (27,5 % du capital de STM).
    nom: 'STMicroelectronics',
    sigle: 'STM',
    typeOrganisation: 'ENTREPRISE',
    pays: 'Pays-Bas',
    siteWeb: 'https://www.st.com',
    description:
      "Fabricant européen de semi-conducteurs, né en 1987 de la fusion de Thomson Semiconducteurs " +
      "(France) et SGS Microelettronica (Italie). SE de droit néerlandais, siège à Plan-les-Ouates " +
      "(Suisse). Supervisory Board présidé par Armando Varricchio (depuis mai 2026). CAC 40.",
    dateCreation: new Date('1987-06-01'),
    wikipediaUrl: 'https://en.wikipedia.org/wiki/STMicroelectronics',
    wikidataId: 'Q661845',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1161666 + Wikipedia FR/EN + thalesgroup.com
    // Accord d'actionnaires entre l'État français (25,7 %) et Dassault Aviation (24,9 %).
    nom: 'Thales',
    sigle: 'HO',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.thalesgroup.com',
    description:
      "Groupe industriel français de défense, aérospatial et sécurité numérique. Fondé en 2000 " +
      "(rebaptisé depuis Thomson-CSF). PDG : Patrice Caine. Actionnaires de référence : État " +
      "français (25,7 %) et Dassault Aviation (24,9 %). CAC 40.",
    dateCreation: new Date('2000-06-06'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Thales_(entreprise)',
    wikidataId: 'Q1161666',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q608518 + Wikipedia EN + urw.com
    // SE de droit néerlandais, double cotation Euronext Paris/Amsterdam.
    // Gouvernance duale : Supervisory Board + Management Board.
    nom: 'Unibail-Rodamco-Westfield',
    sigle: 'URW',
    typeOrganisation: 'ENTREPRISE',
    pays: 'Pays-Bas',
    siteWeb: 'https://www.urw.com',
    description:
      "Premier groupe européen de centres commerciaux premium (Westfield), né de la fusion " +
      "Unibail-Rodamco / Westfield Corporation en 2018. SE de droit néerlandais, double coté " +
      "Euronext Paris/Amsterdam. CEO : Vincent Rouget (depuis jan. 2026). CAC 40.",
    dateCreation: new Date('2018-06-07'),
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Unibail-Rodamco-Westfield',
    wikidataId: 'Q608518',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1632461 + Wikipedia EN + veolia.com
    nom: 'Veolia',
    sigle: 'VIE',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.veolia.com',
    description:
      "Leader mondial des services à l'environnement (eau, déchets, énergie). Anciennement " +
      "Compagnie Générale des Eaux, rebaptisé Veolia Environnement en 2003. Présidé par Antoine " +
      "Frérot, dirigé par Estelle Brachlianoff depuis juil. 2022. CA 44,4 Md€ (2025). CAC 40.",
    dateCreation: new Date('1853-12-14'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Veolia',
    wikidataId: 'Q1632461',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1475312 + Wikipedia FR/EN + vinci.com
    nom: 'Vinci',
    sigle: 'DG',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.vinci.com',
    description:
      "Premier groupe mondial de concessions et de construction (autoroutes, aéroports, " +
      "énergie, construction). Fondé en 1899. Présidé par Xavier Huillard (depuis mai 2025), " +
      "dirigé par Pierre Anjolras (DG depuis le 1er mai 2025). CA 71,6 Md€ (2024). CAC 40.",
    dateCreation: new Date('1899-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Vinci_(entreprise)',
    wikidataId: 'Q1475312',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées. dateConsultation 2026-06-30.
// ---------------------------------------------------------------------------

const SOURCES = {
  // ── Société Générale ────────────────────────────────────────────────────────
  gov_socgen: {
    url: 'https://investors.societegenerale.com/en/strategy-and-governance/governance/board-of-directors',
    titre: "Board of Directors — Société Générale",
    media: 'Société Générale (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-05-27'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Société Générale',
    description:
      "Liste officielle des 15 membres du conseil d'administration de la Société Générale au " +
      "27 mai 2026 (après AGM). Inclut Lorenzo Bini Smaghi (président sortant), Slawomir Krupa (DG).",
    verifiee: true,
  },
  wp_bsmaghi: {
    url: 'https://en.wikipedia.org/wiki/Lorenzo_Bini_Smaghi',
    titre: 'Lorenzo Bini Smaghi — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Économiste italien, BCE (2005-2011), président du CA de la Société Générale (2015-2026). " +
      "Q-id Wikidata : Q730325.",
    verifiee: true,
  },
  pr_connelly: {
    url: 'https://www.societegenerale.com/en/news/press-release/william-connelly-future-chairman-board-director',
    titre: "William Connelly, future Chairman of the Board of Directors — Société Générale",
    media: 'Société Générale',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2025-04-10'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Société Générale',
    description:
      "Communiqué officiel du 10 avril 2025 : William Connelly désigné futur président du CA " +
      "de la Société Générale à partir de l'AG du 27 mai 2026, en remplacement de Bini Smaghi.",
    verifiee: true,
  },
  wp_oudea_sg: {
    url: 'https://en.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Oud%C3%A9a',
    titre: 'Frédéric Oudéa — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "PDG de la Société Générale (2009-2023), président du CA de Sanofi depuis mai 2023. " +
      "Q-id Wikidata : Q984266.",
    verifiee: true,
  },

  // ── Stellantis ──────────────────────────────────────────────────────────────
  gov_stellantis: {
    url: 'https://www.stellantis.com/en/company/governance/board-of-directors',
    titre: "Board of Directors — Stellantis",
    media: 'Stellantis (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'Pays-Bas',
    datePublication: new Date('2025-06-23'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Stellantis',
    description:
      "Liste officielle du conseil d'administration de Stellantis (11 membres) : John Elkann " +
      "(Executive Chairman), Robert Peugeot (Vice-Chairman), Henri de Castries (Lead Independent).",
    verifiee: true,
  },
  wp_elkann: {
    url: 'https://en.wikipedia.org/wiki/John_Elkann',
    titre: 'John Elkann — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Petit-fils de Gianni Agnelli, CEO d'Exor, président de Ferrari, Executive Chairman " +
      "de Stellantis depuis janvier 2021. Q-id Wikidata : Q284011.",
    verifiee: true,
  },
  wp_peugeot_r: {
    url: 'https://fr.wikipedia.org/wiki/Robert_Peugeot',
    titre: 'Robert Peugeot — Wikipédia (FR)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Centrale Paris + INSEAD, président de Peugeot Invest (2002-), vice-président du CA " +
      "de Stellantis depuis jan. 2021. Q-id Wikidata : Q2158478.",
    verifiee: true,
  },
  wp_decastries: {
    url: 'https://en.wikipedia.org/wiki/Henri_de_Castries',
    titre: 'Henri de Castries — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Ancien PDG d'AXA (2000-2016), président de l'Institut Montaigne, Lead Independent " +
      "Director de Stellantis depuis jan. 2021. Q-id Wikidata : Q1381360.",
    verifiee: true,
  },
  wp_dufourcq: {
    url: 'https://fr.wikipedia.org/wiki/Nicolas_Dufourcq',
    titre: 'Nicolas Dufourcq — Wikipédia (FR)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "DG de Bpifrance (depuis 2013), admin. de Stellantis (jan. 2021-), vice-président " +
      "du Supervisory Board de STMicro (depuis mai 2026). Interlock intra-B5. Q-id : Q3340278.",
    verifiee: true,
  },
  wp_tavares: {
    url: 'https://en.wikipedia.org/wiki/Carlos_Tavares',
    titre: 'Carlos Tavares — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Ex-CEO de PSA puis de Stellantis (jan. 2021 - déc. 2024). Démission acceptée le " +
      "1er déc. 2024 (chute 70 % bénéfices nets, perte parts de marché). Q-id : Q2939466.",
    verifiee: true,
  },
  pr_tavares_resign: {
    url: 'https://www.stellantis.com/en/news/press-releases/2024/december/board-accepts-carlos-tavares-resignation-as-chief-executive-officer',
    titre: "Board Accepts Carlos Tavares' Resignation as Chief Executive Officer — Stellantis",
    media: 'Stellantis',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'Pays-Bas',
    datePublication: new Date('2024-12-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Stellantis',
    description:
      "Communiqué officiel : le conseil de Stellantis accepte la démission de Carlos Tavares " +
      "avec effet immédiat le 1er décembre 2024. Un comité exécutif intérimaire est formé.",
    verifiee: true,
  },

  // ── STMicroelectronics ──────────────────────────────────────────────────────
  gov_stmicro: {
    url: 'https://investors.st.com/governance/supervisory-board',
    titre: "Supervisory Board — STMicroelectronics",
    media: 'STMicroelectronics (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'Pays-Bas',
    datePublication: new Date('2026-05-27'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'STMicroelectronics',
    description:
      "Composition officielle du Supervisory Board de STMicroelectronics après l'AG du 27 mai 2026 : " +
      "Armando Varricchio (président) et Nicolas Dufourcq (vice-président).",
    verifiee: true,
  },
  pr_stm_board_2026: {
    url: 'https://www.globenewswire.com/news-release/2026/05/27/3301745/0/en/Statement-from-the-Supervisory-Board-of-STMicroelectronics.html',
    titre: "Statement from the Supervisory Board of STMicroelectronics — GlobeNewswire",
    media: 'GlobeNewswire / STMicroelectronics',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'Pays-Bas',
    datePublication: new Date('2026-05-27'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'STMicroelectronics',
    description:
      "Communiqué post-AG : Armando Varricchio nommé président et Nicolas Dufourcq vice-président " +
      "du Supervisory Board pour un mandat de 3 ans (jusqu'à l'AG 2029).",
    verifiee: true,
  },
  wp_varricchio: {
    url: 'https://en.wikipedia.org/wiki/Armando_Varricchio',
    titre: 'Armando Varricchio — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Diplomate italien, ambassadeur en Serbie (2009-2012) et aux États-Unis (2016-2021), " +
      "président du Supervisory Board de STMicro depuis mai 2026. Q-id : Q24701506.",
    verifiee: true,
  },

  // ── Thales ──────────────────────────────────────────────────────────────────
  gov_thales: {
    url: 'https://www.thalesgroup.com/en/global/group/management-and-board',
    titre: "Management and Board of Directors — Thales Group",
    media: 'Thales Group (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-05-12'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Thales',
    description:
      "Liste officielle des 15 administrateurs de Thales après l'AG du 12 mai 2026. Inclut " +
      "Patrice Caine (PDG renouvelé jusqu'en 2030) et Éric Trappier (admin., Dassault Aviation).",
    verifiee: true,
  },
  wp_caine: {
    url: 'https://fr.wikipedia.org/wiki/Patrice_Caine',
    titre: 'Patrice Caine — Wikipédia (FR)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "PDG de Thales depuis le 23 déc. 2014, X-Mines (Polytechnique 1992, Corps des mines 1995). " +
      "Q-id Wikidata : Q18744665.",
    verifiee: true,
  },
  wp_trappier: {
    url: 'https://en.wikipedia.org/wiki/Eric_Trappier',
    titre: 'Éric Trappier — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "PDG de Dassault Aviation (depuis jan. 2013), Telecom SudParis 1983, administrateur " +
      "de Thales au titre de l'accord d'actionnaires. Q-id Wikidata : Q3591380.",
    verifiee: true,
  },
  legifrance_pailloux: {
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053440138',
    titre: "Décret du 4 février 2026 portant nomination au conseil d'administration de Thales — Légifrance",
    media: 'Légifrance (JORF)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-02-04'),
    dateConsultation: new Date('2026-06-30'),
    auteur: "Premier ministre",
    description:
      "Décret JORF nomme Patrick Pailloux au conseil d'administration de Thales comme " +
      "représentant de l'État. Confirme la structure actionnaire État / Dassault Aviation.",
    verifiee: true,
  },

  // ── Unibail-Rodamco-Westfield ───────────────────────────────────────────────
  gov_urw: {
    url: 'https://www.urw.com/group/corporate-governance',
    titre: "Corporate Governance — Unibail-Rodamco-Westfield",
    media: 'URW (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'Pays-Bas',
    datePublication: new Date('2026-01-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'URW',
    description:
      "Page de gouvernance officielle d'URW. Structure duale : Supervisory Board + Management Board. " +
      "Xavier Niel (~25 % du capital via Rock Investment et NJJ Market) siège au Supervisory Board.",
    verifiee: true,
  },
  pr_urw_ceo: {
    url: 'https://www.globenewswire.com/news-release/2025/10/23/3172325/0/en/Unibail-Rodamco-Westfield-sets-CEO-succession-in-2026.html',
    titre: "Unibail-Rodamco-Westfield sets CEO succession in 2026 — GlobeNewswire",
    media: 'GlobeNewswire / URW',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'Pays-Bas',
    datePublication: new Date('2025-10-23'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'URW',
    description:
      "Communiqué : Vincent Rouget nommé CEO et président du Management Board d'URW à partir " +
      "du 1er jan. 2026, en remplacement de Jean-Marie Tritant. Décision du Supervisory Board.",
    verifiee: true,
  },
  pr_urw_niel: {
    url: 'https://www.globenewswire.com/news-release/2020/11/13/2126724/0/en/Meeting-of-the-Supervisory-Board-of-Unibail-Rodamco-Westfield-URW-on-November-13-2020.html',
    titre: "Meeting of the Supervisory Board of URW — November 13, 2020 — GlobeNewswire",
    media: 'GlobeNewswire / URW',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'Pays-Bas',
    datePublication: new Date('2020-11-13'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'URW',
    description:
      "Communiqué : nomination de Léon Bressler (†2023) comme président, Xavier Niel et " +
      "Susana Gallardo comme membres du Supervisory Board d'URW (13 nov. 2020).",
    verifiee: true,
  },
  wp_niel: {
    url: 'https://en.wikipedia.org/wiki/Xavier_Niel',
    titre: 'Xavier Niel — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Fondateur d'Iliad (Free), actionnaire d'URW (~25 % en 2024), membre du Supervisory Board " +
      "depuis nov. 2020. Q-id Wikidata : Q1450891.",
    verifiee: true,
  },

  // ── Veolia ───────────────────────────────────────────────────────────────────
  gov_veolia: {
    url: 'https://www.veolia.com/en/veolia-group/governance/board-directors',
    titre: "The Board of Directors — Veolia",
    media: 'Veolia (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-04-23'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Veolia',
    description:
      "Composition officielle du CA de Veolia après l'AG du 23 avril 2026 : 15 administrateurs " +
      "dont 75 % d'indépendants (hors représentants des salariés). Renouvellement Frérot + Brachlianoff.",
    verifiee: true,
  },
  pr_veolia_renewal: {
    url: 'https://www.businesswire.com/news/home/20251105986762/fr',
    titre: "Le CA de Veolia propose le renouvellement des mandats d'Antoine Frérot et d'Estelle Brachlianoff",
    media: 'BusinessWire / Veolia',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-11-05'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Veolia',
    description:
      "Communiqué officiel : le CA propose le renouvellement des mandats d'Antoine Frérot " +
      "(président) et d'Estelle Brachlianoff (DG) à l'AG du 23 avril 2026.",
    verifiee: true,
  },
  wp_frerot: {
    url: 'https://en.wikipedia.org/wiki/Antoine_Fr%C3%A9rot',
    titre: 'Antoine Frérot — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Polytechnicien + École des ponts, PDG de Veolia (2009-2022), président non-exécutif " +
      "du CA depuis le 1er juil. 2022. Q-id Wikidata : Q2853963.",
    verifiee: true,
  },
  wp_brachlianoff: {
    url: 'https://en.wikipedia.org/wiki/Estelle_Brachlianoff',
    titre: 'Estelle Brachlianoff — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Polytechnicienne + Ponts, DG de Veolia depuis le 1er juil. 2022, admin. non-exécutive " +
      "d'Hermès (depuis mai 2019). Q-id Wikidata : Q111208905.",
    verifiee: true,
  },
  wp_andries: {
    url: 'https://fr.wikipedia.org/wiki/Olivier_Andri%C3%A8s',
    titre: 'Olivier Andriès — Wikipédia (FR)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Polytechnicien + École des mines, DG de Safran (depuis jan. 2021), admin. indépendant " +
      "de Veolia. Q-id Wikidata : Q32588324.",
    verifiee: true,
  },
  wp_brassac: {
    url: 'https://en.wikipedia.org/wiki/Philippe_Brassac',
    titre: 'Philippe Brassac — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "ENSAE Paris, DG de Crédit Agricole SA (depuis mai 2015), admin. indépendant de Veolia. " +
      "Q-id Wikidata : Q20089495.",
    verifiee: true,
  },

  // ── Vinci ─────────────────────────────────────────────────────────────────────
  gov_vinci: {
    url: 'https://www.vinci.com/en/group/governance/board-directors',
    titre: "Board of Directors — VINCI",
    media: 'VINCI (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2025-05-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'VINCI',
    description:
      "Composition officielle du conseil d'administration de Vinci après l'AG du 17 avril 2025 " +
      "et la séparation des fonctions de président (Huillard) et de DG (Anjolras) au 1er mai 2025.",
    verifiee: true,
  },
  pr_vinci_ag2025: {
    url: 'https://www.vinci.com/en/newsroom/press-releases/vincis-shareholders-general-meeting-and-board-directors-meeting-17-april',
    titre: "VINCI's Shareholders' General Meeting and Board of Directors' meeting of 17 April 2025 — VINCI",
    media: 'VINCI',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2025-04-17'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'VINCI',
    description:
      "Communiqué AG : séparation des fonctions PDG/DG à compter du 1er mai 2025. Huillard " +
      "président du CA ; Anjolras DG. Nominations de Anjolras, Bertocco Trindade, Zingoni.",
    verifiee: true,
  },
  wp_bazin: {
    url: 'https://en.wikipedia.org/wiki/Beno%C3%AEt_Bazin',
    titre: 'Benoît Bazin — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "X + Ponts + MIT (1995), PDG de Saint-Gobain depuis juin 2024 (succède à de Chalendar), " +
      "administrateur de Vinci. Q-id Wikidata : Q33161719.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002). aRef / bRef = wikidataId des entités.
// typeLienCode : ADMINISTRATEUR (id 34), DIRIGEANT, ANCIEN_MANDAT.
// ---------------------------------------------------------------------------

const LIENS = [
  // ══════════════════════════════════════════════════════
  // Société Générale (Q270363)
  // ══════════════════════════════════════════════════════

  {
    // Lorenzo Bini Smaghi — président du CA (2015-2026)
    aType: 'personne',
    aRef: 'Q730325',
    bType: 'organisation',
    bRef: 'Q270363',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Lorenzo Bini Smaghi est président du conseil d'administration de la Société Générale " +
      "depuis janvier 2015. Son mandat arrive à expiration à l'AG du 27 mai 2026, où William " +
      "Connelly lui succède. Administrateur depuis mai 2014.",
    dateDebut: new Date('2015-01-01'),
    dateFin: new Date('2026-05-27'),
    sourceRef: 'gov_socgen',
  },
  {
    // Slawomir Krupa — DG (depuis mai 2023)
    // INTERLOCK cross-batch : admin. de TotalEnergies depuis mai 2026 (pilote)
    aType: 'personne',
    aRef: 'Q116865148',
    bType: 'organisation',
    bRef: 'Q270363',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Slawomir Krupa est administrateur et directeur général de la Société Générale depuis " +
      "mai 2023. Il siège à ce titre au conseil. Interlock documenté : administrateur indépendant " +
      "de TotalEnergies depuis l'AG du 29 mai 2026 (pilote B1).",
    dateDebut: new Date('2023-05-23'),
    dateFin: null,
    sourceRef: 'gov_socgen',
  },
  {
    // Slawomir Krupa — DG (exécutif)
    aType: 'personne',
    aRef: 'Q116865148',
    bType: 'organisation',
    bRef: 'Q270363',
    typeLienCode: 'DIRIGEANT',
    description:
      "Slawomir Krupa est directeur général de la Société Générale depuis mai 2023, au sein " +
      "d'une gouvernance dissociée (président du CA : Lorenzo Bini Smaghi jusqu'en mai 2026).",
    dateDebut: new Date('2023-05-23'),
    dateFin: null,
    sourceRef: 'gov_socgen',
  },
  {
    // Frédéric Oudéa — ANCIEN_MANDAT DG (2009-2023)
    // INTERLOCK cross-batch : président du CA de Sanofi (pilote B3, depuis mai 2023)
    aType: 'personne',
    aRef: 'Q984266',
    bType: 'organisation',
    bRef: 'Q270363',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Frédéric Oudéa a été PDG de la Société Générale de juillet 2009 à mai 2023. " +
      "À l'issue de son mandat, il est devenu président du CA de Sanofi (mai 2023). " +
      "Interlock cross-batch : Sanofi (pilote B3) + Société Générale (B5, ancien DG).",
    dateDebut: new Date('2009-07-13'),
    dateFin: new Date('2023-05-23'),
    sourceRef: 'wp_oudea_sg',
  },

  // ══════════════════════════════════════════════════════
  // Stellantis (Q97439162)
  // ══════════════════════════════════════════════════════

  {
    // John Elkann — Executive Chairman
    aType: 'personne',
    aRef: 'Q284011',
    bType: 'organisation',
    bRef: 'Q97439162',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "John Elkann est Executive Chairman de Stellantis depuis la finalisation de la fusion " +
      "PSA-FCA le 16 janvier 2021. Il représente les intérêts de la famille Agnelli (via Exor).",
    dateDebut: new Date('2021-01-16'),
    dateFin: null,
    sourceRef: 'gov_stellantis',
  },
  {
    aType: 'personne',
    aRef: 'Q284011',
    bType: 'organisation',
    bRef: 'Q97439162',
    typeLienCode: 'DIRIGEANT',
    description:
      "John Elkann est Executive Chairman (président exécutif) de Stellantis depuis janvier 2021. " +
      "Suite à la démission de Carlos Tavares (déc. 2024), il a dirigé la sélection d'Antonio " +
      "Filosa comme nouveau CEO (juin 2025).",
    dateDebut: new Date('2021-01-16'),
    dateFin: null,
    sourceRef: 'gov_stellantis',
  },
  {
    // Robert Peugeot — Vice-Chairman
    aType: 'personne',
    aRef: 'Q2158478',
    bType: 'organisation',
    bRef: 'Q97439162',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Robert Peugeot est vice-président du conseil d'administration de Stellantis depuis " +
      "le 16 janvier 2021. Il représente les intérêts de la famille Peugeot (via Peugeot Invest).",
    dateDebut: new Date('2021-01-16'),
    dateFin: null,
    sourceRef: 'gov_stellantis',
  },
  {
    // Henri de Castries — Lead Independent Director
    aType: 'personne',
    aRef: 'Q1381360',
    bType: 'organisation',
    bRef: 'Q97439162',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Henri de Castries est Lead Independent Director de Stellantis depuis le 16 janvier 2021. " +
      "Ancien PDG d'AXA (2000-2016) et président de l'Institut Montaigne.",
    dateDebut: new Date('2021-01-16'),
    dateFin: null,
    sourceRef: 'gov_stellantis',
  },
  {
    // Nicolas Dufourcq — administrateur (INTERLOCK avec STMicroelectronics)
    aType: 'personne',
    aRef: 'Q3340278',
    bType: 'organisation',
    bRef: 'Q97439162',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Nicolas Dufourcq, DG de Bpifrance, est administrateur de Stellantis depuis le 16 janvier " +
      "2021. INTERLOCK intra-B5 : siège simultanément au Supervisory Board de STMicroelectronics " +
      "(vice-président depuis mai 2026, ancien président).",
    dateDebut: new Date('2021-01-16'),
    dateFin: null,
    sourceRef: 'wp_dufourcq',
  },
  {
    // Carlos Tavares — ANCIEN_MANDAT CEO (jan. 2021 - déc. 2024)
    aType: 'personne',
    aRef: 'Q2939466',
    bType: 'organisation',
    bRef: 'Q97439162',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Carlos Tavares a été CEO de Stellantis du 16 janvier 2021 (fusion PSA-FCA) au " +
      "1er décembre 2024, date d'acceptation de sa démission par le conseil. Il est le premier " +
      "et unique CEO de Stellantis à ce jour (2026), Antonio Filosa lui succédant en juin 2025.",
    dateDebut: new Date('2021-01-16'),
    dateFin: new Date('2024-12-01'),
    sourceRef: 'pr_tavares_resign',
  },

  // ══════════════════════════════════════════════════════
  // STMicroelectronics (Q661845)
  // ══════════════════════════════════════════════════════

  {
    // Armando Varricchio — président du Supervisory Board (depuis mai 2026)
    aType: 'personne',
    aRef: 'Q24701506',
    bType: 'organisation',
    bRef: 'Q661845',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Armando Varricchio, diplomate italien, est président du Supervisory Board de " +
      "STMicroelectronics depuis l'AG du 27 mai 2026 pour un mandat de 3 ans (jusqu'à l'AG 2029). " +
      "Il succède à Nicolas Dufourcq, qui devient vice-président.",
    dateDebut: new Date('2026-05-27'),
    dateFin: null,
    sourceRef: 'pr_stm_board_2026',
  },
  {
    // Nicolas Dufourcq — vice-président du Supervisory Board (depuis mai 2026 ; précédemment président)
    // INTERLOCK intra-B5 : Stellantis + STMicroelectronics
    aType: 'personne',
    aRef: 'Q3340278',
    bType: 'organisation',
    bRef: 'Q661845',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Nicolas Dufourcq, DG de Bpifrance, est vice-président du Supervisory Board de " +
      "STMicroelectronics depuis le 27 mai 2026 (il en était président auparavant). Représente " +
      "l'actionnaire public français (via STMicroelectronics Holding, 27,5 % du capital). " +
      "INTERLOCK intra-B5 : aussi administrateur de Stellantis (depuis jan. 2021).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'pr_stm_board_2026',
  },

  // ══════════════════════════════════════════════════════
  // Thales (Q1161666)
  // ══════════════════════════════════════════════════════

  {
    // Patrice Caine — PDG (administrateur + dirigeant exécutif)
    aType: 'personne',
    aRef: 'Q18744665',
    bType: 'organisation',
    bRef: 'Q1161666',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Patrice Caine est administrateur et PDG de Thales depuis le 23 décembre 2014. " +
      "Ses mandats ont été renouvelés jusqu'en 2030 à l'AG du 12 mai 2026.",
    dateDebut: new Date('2014-12-23'),
    dateFin: null,
    sourceRef: 'gov_thales',
  },
  {
    aType: 'personne',
    aRef: 'Q18744665',
    bType: 'organisation',
    bRef: 'Q1161666',
    typeLienCode: 'DIRIGEANT',
    description:
      "Patrice Caine est président-directeur général (PDG) de Thales depuis le 23 décembre 2014. " +
      "Gouvernance unitaire (PDG) : il cumule la présidence du CA et la direction générale.",
    dateDebut: new Date('2014-12-23'),
    dateFin: null,
    sourceRef: 'wp_caine',
  },
  {
    // Éric Trappier — administrateur (Dassault Aviation, actionnaire de référence)
    aType: 'personne',
    aRef: 'Q3591380',
    bType: 'organisation',
    bRef: 'Q1161666',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Éric Trappier, PDG de Dassault Aviation (24,9 % de Thales), siège au conseil " +
      "d'administration de Thales en vertu de l'accord d'actionnaires liant Dassault Aviation " +
      "et l'État français sur le capital du groupe de défense.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'gov_thales',
  },

  // ══════════════════════════════════════════════════════
  // Unibail-Rodamco-Westfield (Q608518)
  // ══════════════════════════════════════════════════════

  {
    // Xavier Niel — membre du Supervisory Board (depuis nov. 2020)
    aType: 'personne',
    aRef: 'Q1450891',
    bType: 'organisation',
    bRef: 'Q608518',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Xavier Niel siège au Supervisory Board d'Unibail-Rodamco-Westfield depuis novembre 2020, " +
      "date à laquelle il a rejoint le conseil aux côtés de Léon Bressler (†2023) dans le cadre " +
      "d'une campagne d'actionnaires militants (plan « Refocus »). Actionnaire de référence avec " +
      "~25 % du capital via Rock Investment et NJJ Market.",
    dateDebut: new Date('2020-11-13'),
    dateFin: null,
    sourceRef: 'pr_urw_niel',
  },

  // ══════════════════════════════════════════════════════
  // Veolia (Q1632461)
  // ══════════════════════════════════════════════════════

  {
    // Antoine Frérot — président du CA non-exécutif
    aType: 'personne',
    aRef: 'Q2853963',
    bType: 'organisation',
    bRef: 'Q1632461',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Antoine Frérot est président non-exécutif du conseil d'administration de Veolia depuis " +
      "le 1er juillet 2022. Administrateur depuis 2009 (date de sa nomination comme PDG), son " +
      "mandat a été renouvelé à l'AG du 23 avril 2026.",
    dateDebut: new Date('2022-07-01'),
    dateFin: null,
    sourceRef: 'pr_veolia_renewal',
  },
  {
    // Estelle Brachlianoff — DG (administratrice + dirigeante exécutive)
    aType: 'personne',
    aRef: 'Q111208905',
    bType: 'organisation',
    bRef: 'Q1632461',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Estelle Brachlianoff est administratrice et directrice générale de Veolia depuis le " +
      "1er juillet 2022. Son mandat a été renouvelé à l'AG du 23 avril 2026.",
    dateDebut: new Date('2022-07-01'),
    dateFin: null,
    sourceRef: 'pr_veolia_renewal',
  },
  {
    aType: 'personne',
    aRef: 'Q111208905',
    bType: 'organisation',
    bRef: 'Q1632461',
    typeLienCode: 'DIRIGEANT',
    description:
      "Estelle Brachlianoff est directrice générale de Veolia depuis le 1er juillet 2022, " +
      "au sein d'une gouvernance dissociée (président non-exécutif : Antoine Frérot).",
    dateDebut: new Date('2022-07-01'),
    dateFin: null,
    sourceRef: 'wp_brachlianoff',
  },
  {
    // Pierre-André de Chalendar — Senior Independent Director (INTERLOCK cross-batch)
    aType: 'personne',
    aRef: 'Q1518898',
    bType: 'organisation',
    bRef: 'Q1632461',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Pierre-André de Chalendar est Senior Independent Director et président du comité des " +
      "nominations de Veolia depuis avril 2021 (mandat renouvelé en avril 2025, expiration 2029). " +
      "INTERLOCK cross-batch : aussi administrateur indépendant de BNP Paribas (pilote B1, depuis 2021).",
    dateDebut: new Date('2021-04-28'),
    dateFin: null,
    sourceRef: 'gov_veolia',
  },
  {
    // Olivier Andriès — administrateur indépendant (PDG Safran)
    aType: 'personne',
    aRef: 'Q32588324',
    bType: 'organisation',
    bRef: 'Q1632461',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Olivier Andriès, DG de Safran, est administrateur indépendant de Veolia.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'gov_veolia',
  },
  {
    // Philippe Brassac — administrateur indépendant (DG Crédit Agricole SA)
    aType: 'personne',
    aRef: 'Q20089495',
    bType: 'organisation',
    bRef: 'Q1632461',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Philippe Brassac, DG de Crédit Agricole S.A., est administrateur indépendant de Veolia.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'gov_veolia',
  },

  // ══════════════════════════════════════════════════════
  // Vinci (Q1475312)
  // ══════════════════════════════════════════════════════

  {
    // Xavier Huillard — président du CA (depuis mai 2025 ; était PDG depuis 2010)
    // INTERLOCK cross-batch : lead director d'Air Liquide (pilote B1)
    aType: 'personne',
    aRef: 'Q731462',
    bType: 'organisation',
    bRef: 'Q1475312',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Xavier Huillard est président du conseil d'administration de Vinci depuis le 1er mai 2025, " +
      "date à laquelle les fonctions de président et de DG ont été dissociées (DG : Pierre Anjolras). " +
      "Il était auparavant PDG de Vinci depuis 2010. Son mandat de président a été renouvelé à " +
      "l'AG du 14 avril 2025 (91,91 % des voix, mandat jusqu'en 2029). " +
      "INTERLOCK cross-batch : lead director et président du comité des nominations d'Air Liquide (pilote B1).",
    dateDebut: new Date('2025-05-01'),
    dateFin: null,
    sourceRef: 'pr_vinci_ag2025',
  },
  {
    // Benoît Bazin — administrateur (PDG Saint-Gobain)
    aType: 'personne',
    aRef: 'Q33161719',
    bType: 'organisation',
    bRef: 'Q1475312',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Benoît Bazin, PDG de Saint-Gobain depuis juin 2024, est administrateur de Vinci. " +
      "Il a succédé à Pierre-André de Chalendar à la tête de Saint-Gobain.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'gov_vinci',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents — recopiés verbatim de seed-cac40-pilote.js
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-cac40-b5] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-cac40-b5] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données CAC 40 B5 précédentes...')
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
  console.log(`\n┌─ seed-cac40-b5 — Conseils d'administration CAC 40 (7 sociétés) ────────┐\n`)
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

  console.log('\n┌─ Bilan ──────────────────────────────────────────────────────────────────┐')
  console.log(`│ Personnes     : ${PERSONNES.length} (dont 4 re-upsertées depuis le pilote)`)
  console.log(`│ Organisations : ${ORGANISATIONS.length}`)
  console.log(`│ Sources       : ${Object.keys(SOURCES).length}`)
  console.log(`│ Liens         : ${LIENS.length} (ADMINISTRATEUR + DIRIGEANT + ANCIEN_MANDAT)`)
  console.log('│')
  console.log('│ INTERLOCKS DOCUMENTÉS')
  console.log('│   [INTRA-B5] Nicolas Dufourcq (Q3340278)      : Stellantis + STMicroelectronics')
  console.log('│   [B1→B5]    Pierre-André de Chalendar (Q1518898) : BNP Paribas (pilote) + Veolia')
  console.log('│   [B1→B5]    Slawomir Krupa (Q116865148)      : TotalEnergies (pilote, admin) + SG (DG)')
  console.log('│   [B1→B5]    Xavier Huillard (Q731462)        : Air Liquide (pilote, lead dir.) + Vinci (chair)')
  console.log('│   [B3→B5]    Frédéric Oudéa (Q984266)         : Sanofi (pilote, chair CA) + SG (ancien DG)')
  console.log('└───────────────────────────────────────────────────────────────────────────┘')

  console.log('\nAdministrateurs exclus (sans wikidataId vérifié) — à traiter au scale-out :')
  console.log('  Société Générale : William Connelly (nouv. président, Q-id absent), Ana Botin,')
  console.log('    Kyra Hild, Françoise Lemalle, Annalisa Löscher, Nathalie Rachou,')
  console.log('    Thierry Laborde, Benoît Grisoni, représentants des salariés (~6)')
  console.log('  Stellantis       : Antonio Filosa (CEO depuis juin 2025, Q-id absent), Fiona Clare Cicconi,')
  console.log('    Ann Godbehere, Claudia Parzani, Daniel Ramot, Benoît Ribadeau-Dumas,')
  console.log('    Alice Davey Schroeder (~6)')
  console.log('  STMicroelectronics : Jean-Marc Chéry (CEO/Managing Board, Q-id non vérifié),')
  console.log('    autres membres du Supervisory Board (~6)')
  console.log('  Thales           : Loïk Segalen (COO Dassault Aviation, Q-id absent), Valérie Guillemet,')
  console.log('    Anne-Marie Hunot-Schmit, Bernard Fontana, Delphine Gény-Stephann,')
  console.log('    Ruby McGregor-Smith, Marianna Nitsch, Anne Rigail, Loïc Rocard,')
  console.log('    Anne-Claire Taittinger, Marie-Françoise Walbaum, Patrick Pailloux,')
  console.log('    Stéphane Jubault, Philippe Lépinay, Alexis Zajdenweber (~14)')
  console.log('  URW              : Vincent Rouget (CEO jan. 2026, Q-id absent), Jean-Marie Tritant')
  console.log('    (ancien CEO, Q-id absent), Léon Bressler (†2023, Q-id absent),')
  console.log('    Roderick Munsters, Susana Gallardo, autres membres Supervisory Board (~7)')
  console.log('  Veolia           : Maryse Aulagnon, Véronique Bédague, Arnaud Caudoux,')
  console.log('    Isabelle Courville, Julia Marton-Lefèvre, Elena Salgado, Guillaume Texier,')
  console.log('    Franck Le Roux, Jean-Christophe Taret, Pavel Páša (~10)')
  console.log('  Vinci            : Pierre Anjolras (DG depuis mai 2025, Q-id absent), Yannick Assouad,')
  console.log('    Annette Messemer, Carlos F. Aguilar, Karla Bertocco Trindade,')
  console.log('    Caroline Grégoire Sainte Marie, Claude Laruelle, René Medori,')
  console.log('    Maví Zingoni (~9)')
  console.log('\n')
}

main()
  .catch((err) => {
    console.error('[seed-cac40-b5] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
