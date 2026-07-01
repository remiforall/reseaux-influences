/**
 * Seed CAC 40 — Conseils d'administration BATCH 1 (7 sociétés).
 *
 * Enquête OSINT journalistique — consultation du 2026-07-01.
 * Périmètre : Accor, Airbus, ArcelorMittal, Bouygues, Bureau Veritas, Capgemini, Carrefour.
 *
 * Pour chaque société : conseil limité aux membres disposant d'un wikidataId vérifié
 * (wbsearchentities / Special:EntityData). Les membres sans Q-id sont exclus et listés
 * en commentaire ci-dessous pour suivi.
 *
 * INTERLOCKS DÉTECTÉS — entre ce batch et le pilote :
 *   — Guillaume Faury     (Q33158035) : Airbus (CEO) + AXA (admin, pilote)
 *   — Aiman Ezzat         (Q33236908) : Capgemini (CEO) + Air Liquide (admin, pilote)
 *   — Catherine Guillouard(Q33249018) : Airbus (admin) + Air Liquide (admin, pilote)
 *
 * Sources : sites de gouvernance officiels, Wikipedia, Wikidata Special:EntityData,
 *           rapports annuels et URD 2023/2024 des sociétés concernées.
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - membres sans Q-id exclus ; traitement au scale-out
 *
 * Usage :
 *   cd backend && node bin/seed-cac40-b1.js
 *   cd backend && node bin/seed-cac40-b1.js --reset
 *
 * ---------------------------------------------------------------------------
 * MEMBRES EXCLUS (sans wikidataId vérifié au 2026-07-01)
 * ---------------------------------------------------------------------------
 * Accor         : Ilane Granotier, Aziz Mbarek, Sophie Stabile, Nathalie Delapalme,
 *                 Sarah El Haïry, Lynn Elsenhans (Q514865 trouvé mais non confirmé
 *                 admin Accor via Wikidata), Hélène Desmarais (Q3144746 idem),
 *                 Mercedes Erra, Patrick Sayer, Sarmad Zok (~10 membres exclus)
 * Airbus        : Mark Dunkerley (chairman — pas de Q-id Wikidata trouvé),
 *                 Stephan Gemkow, Ralph Crosby, Hermann-Josef Lamberti,
 *                 Jean-Pierre Clamadieu (Q2363842 trouvé — affiliation Airbus non
 *                 confirmée via Wikidata claims), Catherine MacGregor (Q107352040 —
 *                 affiliation Airbus à recouper via source officielle),
 *                 Ana Botín (Q299646 — vérifier mandat actuel),
 *                 Denis Ranque (Q3022894 — chairman 2013-2020, ex-membre, mandat échu)
 * ArcelorMittal : Jeannot Krecké (Q453405 — membre probable mais non confirmé
 *                 via Wikidata claims), Bruno Lafont (Q2926852 — Lafarge/LafargeHolcim,
 *                 pas ArcelorMittal confirmé), Tye Burt, Domingo Ureña-Raso,
 *                 Karel De Gucht, Suzanne Nimocks, Karyn Ovelmen (~7 exclus)
 * Bouygues      : Martine Bouygues (sans Q-id), Thierry Funck-Brentano,
 *                 François Bertière, Clara Gaymard, Nonce Paolini, Marie Lemarié,
 *                 Patricia Barbizet (Q4048174 — à confirmer mandat actuel), (~9 exclus)
 * Bureau Veritas: Didier Michaud-Daniel (Q30751042 — ex-PDG, mandat échu 2023),
 *                 Nicolas Dufourcq (Q3340278 — à confirmer admin BV),
 *                 membres Wendel SE (non vérifiés) : Frédéric Lemoine, Priscilla de Moustier,
 *                 Stéphane Noel, Ulrike Steinhorst (Q100699859), Jérôme Miquel (~8 exclus)
 * Capgemini     : Siân Herbert-Jones, Xiaoqun Clever, Laurence Dors, Belen Garijo
 *                 (Q27882872 — sur Sanofi/Capgemini ? à confirmer), Roberto Mancone,
 *                 Lucia Sinapi-Thomas, Frédéric Pelouze, Salima Benhamou (~8 exclus)
 * Carrefour     : Stéphane Boujnah (Q33290562 — Euronext — mandat Carrefour à confirmer),
 *                 Anne-Claire Taittinger, Diane de Saint Victor, Marie-Laure Sauty de Chalon,
 *                 Patricia Lacoste, Abilio Diniz (décédé 2024 — à vérifier successeur),
 *                 Flavia Buarque de Almeida, Florence Parly (Q1430018 — à vérifier) (~9 exclus)
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const RESET = process.argv.includes("--reset")
const USER_EMAIL = "remi@reseauxinfluences.fr"

// ---------------------------------------------------------------------------
// PERSONNES — wikidataIds vérifiés via wbsearchentities / Special:EntityData.
// Les 3 premières fiches (Faury, Ezzat, Guillouard) sont déjà dans le pilote ;
// l'upsert les met à jour et ajoute les nouveaux liens inter-batch.
// ---------------------------------------------------------------------------

const PERSONNES = [
  // ─── Réutilisés depuis pilote — nouveaux liens Airbus / Capgemini ─────────

  {
    // Sources : Wikidata Q33158035 + Wikipedia EN + airbus.com/governance
    // INTERLOCK : administrateur indépendant d'AXA (pilote, depuis 2021)
    // ET PDG-CEO d'Airbus (ce batch)
    nom: "Faury",
    prenom: "Guillaume",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1968-02-22"),
    lieuNaissance: "Cherbourg (Manche)",
    rolePrincipal: "Président exécutif et directeur général d'Airbus",
    rolesSecondaires: [
      "administrateur indépendant d'AXA (depuis avril 2021)",
      "X-Supaero",
      "ancien PDG d'Airbus Helicopters (2013-2018)",
    ],
    bio:
      "Polytechnicien et ingénieur de l'ISAE-Supaero, Guillaume Faury dirige Airbus depuis avril 2019. " +
      "Il siège au conseil d'administration d'AXA depuis avril 2021. Son double mandat constitue " +
      "un interlock documenté Airbus-AXA.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Guillaume_Faury",
    wikidataId: "Q33158035",
    qualiteInfluence: "DIRIGEANT",
  },
  {
    // Sources : Wikidata Q33236908 + Capgemini.com biography + airliquide.com board
    // INTERLOCK : administrateur indépendant d'Air Liquide (pilote, depuis mai 2021)
    // ET DG de Capgemini (ce batch)
    nom: "Ezzat",
    prenom: "Aiman",
    pays: "France",
    nationalite: "franco-égyptienne",
    dateNaissance: new Date("1961-05-22"),
    lieuNaissance: "France",
    rolePrincipal: "Directeur général de Capgemini ; administrateur indépendant d'Air Liquide",
    rolesSecondaires: [
      "ESCPE Lyon (chimie-physique) + UCLA Anderson (MBA)",
      "directeur général de Capgemini depuis mai 2020",
      "administrateur d'Air Liquide depuis le 4 mai 2021",
    ],
    bio:
      "Diplômé en génie chimique et MBA UCLA, Aiman Ezzat dirige Capgemini SE depuis mai 2020. " +
      "Il siège au conseil d'Air Liquide depuis le 4 mai 2021. Son double mandat constitue " +
      "un interlock documenté Capgemini-Air Liquide.",
    wikipediaUrl: null,
    wikidataId: "Q33236908",
    qualiteInfluence: "DIRIGEANT",
  },
  {
    // Sources : Wikidata Q33249018 + Wikipedia EN + airliquide.com board + airbus.com governance
    // INTERLOCK : admin Air Liquide (pilote, depuis mai 2023) ET admin Airbus (ce batch)
    nom: "Guillouard",
    prenom: "Catherine",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1965-01-23"),
    lieuNaissance: "Cannes (Alpes-Maritimes)",
    rolePrincipal: "Administratrice indépendante d'Air Liquide ; administratrice d'Airbus",
    rolesSecondaires: [
      "ancienne PDG du groupe RATP (août 2017 - septembre 2022)",
      "ancienne DFO d'Air France-KLM",
      "présidente du comité d'audit d'Air Liquide",
    ],
    bio:
      "Ingénieure et financière de formation, Catherine Guillouard a dirigé la RATP de 2017 à 2022. " +
      "Elle siège au conseil d'Air Liquide depuis mai 2023 et au conseil d'Airbus. " +
      "Son double mandat constitue un interlock documenté Air Liquide-Airbus.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Catherine_Guillouard",
    wikidataId: "Q33249018",
    qualiteInfluence: "DIRIGEANT",
  },

  // ─── Accor ────────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q3509946 (dob +1961-11-09) + Wikipedia FR + accor.com/governance
    nom: "Bazin",
    prenom: "Sébastien",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1961-11-09"),
    lieuNaissance: "France",
    rolePrincipal: "Président-directeur général d'Accor",
    rolesSecondaires: [
      "co-fondateur et associé de Colony Capital (fonds d'investissement immobilier)",
      "administrateur de Vivendi (2012-2014)",
      "diplômé HEC Paris et Columbia Business School",
    ],
    bio:
      "Diplômé HEC et MBA Columbia, Sébastien Bazin a co-fondé Colony Capital avant de prendre " +
      "la présidence d'Accor en août 2013 lorsque Colony est entré au capital du groupe. " +
      "Sous sa direction, Accor a cédé ses murs hôteliers et se concentre sur la gestion de marques.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/S%C3%A9bastien_Bazin_(homme_d%27affaires)",
    wikidataId: "Q3509946",
    qualiteInfluence: "DIRIGEANT",
  },

  // ─── ArcelorMittal ────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q191311 (dob +1950-06-15, P108: Q27893) + Wikipedia EN + corporate.arcelormittal.com
    nom: "Mittal",
    prenom: "Lakshmi",
    pays: "Inde",
    nationalite: "britannique",
    dateNaissance: new Date("1950-06-15"),
    lieuNaissance: "Sadulpur (Rajasthan, Inde)",
    rolePrincipal: "Executive Chairman d'ArcelorMittal",
    rolesSecondaires: [
      "fondateur du groupe Mittal Steel",
      "l'une des grandes fortunes mondiales (Forbes)",
      "membre du South African Council on Higher Education",
    ],
    bio:
      "Fondateur de Mittal Steel, Lakshmi Mittal a orchestré la fusion avec Arcelor en 2006 pour " +
      "créer ArcelorMittal, premier sidérurgiste mondial. Il est devenu Executive Chairman en " +
      "janvier 2021 lorsque son fils Aditya a pris les fonctions de CEO.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Lakshmi_Mittal",
    wikidataId: "Q191311",
    qualiteInfluence: "DIRIGEANT",
  },
  {
    // Sources : Wikidata Q357616 (dob +1976-01-22) + Wikipedia EN + corporate.arcelormittal.com/governance
    nom: "Mittal",
    prenom: "Aditya",
    pays: "Inde",
    nationalite: "américaine",
    dateNaissance: new Date("1976-01-22"),
    lieuNaissance: "Calcutta (Inde)",
    rolePrincipal: "President et Chief Executive Officer d'ArcelorMittal",
    rolesSecondaires: [
      "fils de Lakshmi Mittal",
      "directeur financier du groupe de 2004 à 2021",
      "Wharton School (Université de Pennsylvanie)",
    ],
    bio:
      "Diplômé de Wharton, Aditya Mittal a rejoint ArcelorMittal en 1997 et en a été le CFO " +
      "de 2004 à 2021. Nommé CEO en janvier 2021, il dirige le groupe avec son père Lakshmi " +
      "Mittal, Executive Chairman, dans une gouvernance familiale.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Aditya_Mittal",
    wikidataId: "Q357616",
    qualiteInfluence: "DIRIGEANT",
  },
  {
    // Sources : Wikidata Q7914953 (dob +1980-08-23) + Wikipedia EN + corporate.arcelormittal.com
    nom: "Mittal Bhatia",
    prenom: "Vanisha",
    pays: "Royaume-Uni",
    nationalite: "britannique",
    dateNaissance: new Date("1980-08-23"),
    lieuNaissance: "Royaume-Uni",
    rolePrincipal: "Administratrice d'ArcelorMittal",
    rolesSecondaires: [
      "fille de Lakshmi Mittal",
      "administratrice de la fondation ArcelorMittal",
      "membre du comité RSE du conseil",
    ],
    bio:
      "Fille de Lakshmi Mittal, Vanisha Mittal Bhatia siège au conseil d'administration " +
      "d'ArcelorMittal depuis 2004. Elle contribue à la stratégie RSE et aux relations " +
      "avec les parties prenantes du groupe sidérurgique.",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Vanisha_Mittal",
    wikidataId: "Q7914953",
    qualiteInfluence: "DIRIGEANT",
  },

  // ─── Bouygues ─────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q29108770 (dob +1964-10-13, desc "CEO of Bouygues") + Bouygues.com PR
    nom: "Roussat",
    prenom: "Olivier",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1964-10-13"),
    lieuNaissance: "France",
    rolePrincipal: "Directeur général de Bouygues",
    rolesSecondaires: [
      "ancien PDG de Bouygues Telecom (2018-2021)",
      "Centrale Paris",
      "directeur général de Bouygues SA depuis mars 2021",
    ],
    bio:
      "Ingénieur centralien, Olivier Roussat a présidé Bouygues Telecom de 2018 à 2021. " +
      "Nommé directeur général de Bouygues SA en mars 2021 pour succéder à Martin Bouygues " +
      "dans les fonctions exécutives, il reste membre du conseil d'administration.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Olivier_Roussat",
    wikidataId: "Q29108770",
    qualiteInfluence: "DIRIGEANT",
  },
  {
    // Sources : Wikidata Q680669 (dob +1952-05-03, "homme d'affaires français") + Wikipedia FR
    nom: "Bouygues",
    prenom: "Martin",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1952-05-03"),
    lieuNaissance: "Paris",
    rolePrincipal: "Administrateur de Bouygues SA ; ancien PDG",
    rolesSecondaires: [
      "fils du fondateur Francis Bouygues (1922-1993)",
      "PDG de Bouygues SA de 1989 à mars 2021",
      "actionnaire de référence via la holding familiale SCDM",
    ],
    bio:
      "Fils du fondateur Francis Bouygues, Martin Bouygues a dirigé le groupe Bouygues comme PDG " +
      "pendant plus de trente ans (1989-2021). Il reste administrateur du groupe et principal " +
      "actionnaire via la holding familiale SCDM (~19 % du capital).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Martin_Bouygues",
    wikidataId: "Q680669",
    qualiteInfluence: "DIRIGEANT",
  },
  {
    // Sources : Wikidata Q133545256 (dob +1984-04-14, "homme d'affaires français") + bouygues.com
    nom: "Bouygues",
    prenom: "Edward",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1984-04-14"),
    lieuNaissance: "France",
    rolePrincipal: "Administrateur de Bouygues SA",
    rolesSecondaires: [
      "fils de Martin Bouygues",
      "ancien directeur de la marque Bouygues",
      "représentant de la troisième génération de la famille fondatrice",
    ],
    bio:
      "Fils de Martin Bouygues, Edward Bouygues représente la troisième génération de la " +
      "famille fondatrice au sein du conseil d'administration du groupe. Il est administrateur " +
      "de Bouygues SA et contribue à la gouvernance familiale du groupe.",
    wikipediaUrl: null,
    wikidataId: "Q133545256",
    qualiteInfluence: "DIRIGEANT",
  },

  // ─── Bureau Veritas ───────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q134347813 (label FR seulement) + Les Échos 13 juin 2023
    //           + group.bureauveritas.com/leadership
    nom: "Gharbi",
    prenom: "Hinda",
    pays: "France",
    nationalite: "française",
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: "Directrice générale de Bureau Veritas",
    rolesSecondaires: [
      "ancienne dirigeante de Schlumberger puis de SLB (groupe pétrolier de services)",
      "première femme à la tête de Bureau Veritas",
      "CEO de Bureau Veritas depuis juin 2023",
    ],
    bio:
      "Ingénieure de formation, Hinda Gharbi a fait l'essentiel de sa carrière au sein de " +
      "Schlumberger/SLB. Nommée directrice générale de Bureau Veritas le 19 juin 2023, elle " +
      "succède à Didier Michaud-Daniel et devient la première femme à diriger le groupe.",
    wikipediaUrl: null,
    wikidataId: "Q134347813",
    qualiteInfluence: "DIRIGEANT",
  },

  // ─── Capgemini ────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q556660 (dob +1952-04-30, "French businessman") + Wikipedia FR
    //           + capgemini.com/gouvernance/conseil-administration
    nom: "Hermelin",
    prenom: "Paul",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1952-04-30"),
    lieuNaissance: "France",
    rolePrincipal: "Président du conseil d'administration de Capgemini",
    rolesSecondaires: [
      "directeur général de Capgemini de 1996 à 2020",
      "ENA (inspecteur des finances)",
      "administrateur de Capgemini depuis 1990",
    ],
    bio:
      "Inspecteur des finances, Paul Hermelin a dirigé Capgemini comme PDG pendant vingt-quatre " +
      "ans (1996-2020). Depuis mai 2020, il est président non-exécutif du conseil d'administration " +
      "dans une gouvernance dissociée (DG : Aiman Ezzat).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Paul_Hermelin",
    wikidataId: "Q556660",
    qualiteInfluence: "DIRIGEANT",
  },

  // ─── Carrefour ────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q2833474 (dob +1972-10-04, "Chairman and CEO of Carrefour Group")
    //           + Wikipedia FR + carrefour.com/groupe/gouvernance
    nom: "Bompard",
    prenom: "Alexandre",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1972-10-04"),
    lieuNaissance: "Paris",
    rolePrincipal: "Président-directeur général de Carrefour",
    rolesSecondaires: [
      "ancien PDG de Fnac-Darty (2011-2017)",
      "ancien PDG de Virgin Megastore (2006-2011)",
      "ESSEC + Sciences Po",
    ],
    bio:
      "Diplômé de l'ESSEC et de Sciences Po, Alexandre Bompard a redressé Fnac-Darty avant " +
      "d'être nommé PDG de Carrefour en juillet 2017. Il a engagé une transformation digitale " +
      "et géographique du groupe (recentrage France/Brésil, partenariat Alibaba).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Alexandre_Bompard",
    wikidataId: "Q2833474",
    qualiteInfluence: "DIRIGEANT",
  },
  {
    // Sources : Wikidata Q195993 (dob +1956-07-06, "homme d'affaires français")
    //           + Wikipedia FR + carrefour.com/gouvernance (administrateur indépendant)
    nom: "Agon",
    prenom: "Jean-Paul",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1956-07-06"),
    lieuNaissance: "France",
    rolePrincipal: "Président du conseil d'administration de L'Oréal ; administrateur de Carrefour",
    rolesSecondaires: [
      "directeur général de L'Oréal de 2006 à 2021",
      "président du conseil d'administration de L'Oréal depuis 2021",
      "HEC Paris",
    ],
    bio:
      "Diplômé d'HEC, Jean-Paul Agon a dirigé L'Oréal comme PDG de 2006 à 2021 avant de prendre " +
      "la présidence non-exécutive du conseil. Il siège au conseil de Carrefour comme " +
      "administrateur indépendant, apportant son expertise du commerce et de la distribution mondiale.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Jean-Paul_Agon",
    wikidataId: "Q195993",
    qualiteInfluence: "DIRIGEANT",
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — 7 sociétés CAC 40
// wikidataIds vérifiés via Special:EntityData
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q212599 + Wikipedia FR + accor.com
    // Fondé en 1967 (Novotel, première chaîne du groupe)
    nom: "Accor",
    sigle: "AC",
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://group.accor.com",
    description:
      "Groupe hôtelier français, né en 1967 avec la chaîne Novotel. Troisième groupe hôtelier " +
      "mondial avec plus de 5 600 hôtels dans 110 pays et 45 marques. PDG : Sébastien Bazin. " +
      "Siège : Issy-les-Moulineaux. CAC 40.",
    dateCreation: new Date("1967-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Accor",
    wikidataId: "Q212599",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q2311 + Wikipedia FR + airbus.com
    // Société européenne fondée comme EADS le 1998-12-29, renommée Airbus en 2017
    nom: "Airbus",
    sigle: "AIR",
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.airbus.com",
    description:
      "Groupe aérospatial européen (avions civils, défense, hélicoptères, espace). Né de la fusion " +
      "EADS en 2000, rebaptisé Airbus SE en 2017. PDG : Guillaume Faury. Siège statutaire : Pays-Bas " +
      "(opérationnel à Toulouse). CAC 40.",
    dateCreation: new Date("1998-12-29"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Airbus_(soci%C3%A9t%C3%A9)",
    wikidataId: "Q2311",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q27893 + Wikipedia FR + corporate.arcelormittal.com
    // Fondé en 2006 (fusion Arcelor + Mittal Steel)
    nom: "ArcelorMittal",
    sigle: "MT",
    typeOrganisation: "ENTREPRISE",
    pays: "Luxembourg",
    siteWeb: "https://corporate.arcelormittal.com",
    description:
      "Premier sidérurgiste mondial, né en 2006 de la fusion hostile de Mittal Steel sur Arcelor. " +
      "Siège à Luxembourg. Executive Chairman : Lakshmi Mittal. CEO : Aditya Mittal. Présent dans " +
      "plus de 60 pays. CAC 40.",
    dateCreation: new Date("2006-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/ArcelorMittal",
    wikidataId: "Q27893",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q895325 + Wikipedia FR + bouygues.com
    // Fondé en 1952 par Francis Bouygues
    // NOTE : l'instruction initiale mentionnait Q1002607 mais ce Q-id correspond à
    // "Shevchenkove" (ville ukrainienne) — le Q-id correct de Bouygues est Q895325.
    nom: "Bouygues",
    sigle: "EN",
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.bouygues.com",
    description:
      "Groupe industriel français fondé en 1952 par Francis Bouygues. Quatre branches : BTP " +
      "(Bouygues Construction, Colas), immobilier (Bouygues Immobilier), télécoms (Bouygues " +
      "Telecom) et médias (TF1). DG : Olivier Roussat. CAC 40.",
    dateCreation: new Date("1952-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Bouygues",
    wikidataId: "Q895325",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q1974503 + Wikipedia FR + group.bureauveritas.com
    // Fondé en 1828 à Anvers
    nom: "Bureau Veritas",
    sigle: "BVI",
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://group.bureauveritas.com",
    description:
      "Groupe mondial de tests, inspections et certifications (TIC), fondé en 1828 à Anvers. " +
      "Présent dans 140 pays. Principal actionnaire : Wendel SE (~40 %). DG : Hinda Gharbi " +
      "(depuis juin 2023). Siège : Neuilly-sur-Seine. CAC 40.",
    dateCreation: new Date("1828-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Bureau_Veritas",
    wikidataId: "Q1974503",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q1034621 + Wikipedia FR + capgemini.com
    // Fondé le 1967-10-01 à Grenoble
    nom: "Capgemini",
    sigle: "CAP",
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.capgemini.com",
    description:
      "Groupe mondial de conseil, services technologiques et transformation numérique, fondé en " +
      "1967 à Grenoble par Serge Kampf. Présent dans 50 pays. Président du CA : Paul Hermelin. " +
      "DG : Aiman Ezzat. CAC 40.",
    dateCreation: new Date("1967-10-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Capgemini",
    wikidataId: "Q1034621",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q217599 + Wikipedia FR + carrefour.com
    // Fondé le 1959-11-30 à Annecy
    nom: "Carrefour",
    sigle: "CA",
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.carrefour.com",
    description:
      "Groupe de distribution français, fondé en 1959 à Annecy. Deuxième distributeur mondial " +
      "par le chiffre d'affaires. Présent dans plus de 40 pays. PDG : Alexandre Bompard " +
      "(depuis 2017). Siège : Massy (Essonne). CAC 40.",
    dateCreation: new Date("1959-11-30"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Carrefour_(enseigne)",
    wikidataId: "Q217599",
    qualiteInfluence: "AUTRE",
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées. dateConsultation 2026-07-01.
// Les clés réutilisées du pilote (wp_faury, wp_guillouard) sont idempotentes
// (upsertSource vérifie par URL).
// ---------------------------------------------------------------------------

const SOURCES = {
  // ── Accor ──────────────────────────────────────────────────────────────────
  gov_accor: {
    url: "https://group.accor.com/fr/groupe/gouvernance/conseil-administration",
    titre: "Conseil d'administration — Accor Group",
    media: "Accor (site officiel)",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2026-05-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Accor",
    description:
      "Liste officielle des membres du conseil d'administration d'Accor au 1er mai 2026, " +
      "avec biographies et dates de mandat.",
    verifiee: true,
  },
  wp_bazin: {
    url: "https://fr.wikipedia.org/wiki/S%C3%A9bastien_Bazin_(homme_d%27affaires)",
    titre: "Sébastien Bazin — Wikipédia (FR)",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "HEC Paris + Columbia Business School ; co-fondateur Colony Capital ; PDG d'Accor depuis août 2013.",
    verifiee: true,
  },
  wd_bazin: {
    url: "https://www.wikidata.org/wiki/Q3509946",
    titre: "Sébastien Bazin — Wikidata Q3509946",
    media: "Wikidata",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description: "Entrée Wikidata Q3509946 — identité vérifiée : Sébastien Bazin, né le 1961-11-09.",
    verifiee: true,
  },

  // ── Airbus ─────────────────────────────────────────────────────────────────
  gov_airbus: {
    url: "https://www.airbus.com/en/our-governance/board-of-directors",
    titre: "Board of Directors — Airbus SE",
    media: "Airbus (site officiel)",
    typeMedia: "WEB",
    langue: "en",
    paysMedia: "France",
    datePublication: new Date("2026-05-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Airbus",
    description:
      "Liste officielle et biographies des membres du conseil d'administration d'Airbus SE " +
      "au 1er mai 2026.",
    verifiee: true,
  },
  wp_faury: {
    url: "https://en.wikipedia.org/wiki/Guillaume_Faury",
    titre: "Guillaume Faury — Wikipedia (EN)",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "en",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "PDG d'Airbus depuis avril 2019 ; administrateur indépendant d'AXA depuis avril 2021. " +
      "Interlock Airbus-AXA documenté.",
    verifiee: true,
  },
  wp_guillouard: {
    url: "https://en.wikipedia.org/wiki/Catherine_Guillouard",
    titre: "Catherine Guillouard — Wikipedia (EN)",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "en",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "PDG de la RATP (2017-2022), administratrice Airbus et Air Liquide. " +
      "Interlock Airbus-Air Liquide documenté.",
    verifiee: true,
  },

  // ── ArcelorMittal ──────────────────────────────────────────────────────────
  gov_arcelormittal: {
    url: "https://corporate.arcelormittal.com/investors/governance/board-of-directors",
    titre: "Board of Directors — ArcelorMittal",
    media: "ArcelorMittal (site officiel)",
    typeMedia: "WEB",
    langue: "en",
    paysMedia: "Luxembourg",
    datePublication: new Date("2026-05-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "ArcelorMittal",
    description:
      "Liste officielle des membres du conseil d'administration d'ArcelorMittal au 1er mai 2026, " +
      "avec biographies, comités et dates de mandat.",
    verifiee: true,
  },
  wp_lakshmi: {
    url: "https://en.wikipedia.org/wiki/Lakshmi_Mittal",
    titre: "Lakshmi Mittal — Wikipedia (EN)",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "en",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Fondateur de Mittal Steel, Executive Chairman d'ArcelorMittal depuis janvier 2021 " +
      "(remplacé comme CEO par son fils Aditya).",
    verifiee: true,
  },
  wp_aditya: {
    url: "https://en.wikipedia.org/wiki/Aditya_Mittal",
    titre: "Aditya Mittal — Wikipedia (EN)",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "en",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Fils de Lakshmi Mittal ; Wharton School ; CFO d'ArcelorMittal (2004-2021), CEO depuis janvier 2021.",
    verifiee: true,
  },
  wp_vanisha: {
    url: "https://en.wikipedia.org/wiki/Vanisha_Mittal",
    titre: "Vanisha Mittal — Wikipedia (EN)",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "en",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Fille de Lakshmi Mittal ; administratrice d'ArcelorMittal depuis 2004 ; " +
      "née le 23 août 1980.",
    verifiee: true,
  },

  // ── Bouygues ───────────────────────────────────────────────────────────────
  gov_bouygues: {
    url: "https://www.bouygues.com/gouvernance/conseil-dadministration/",
    titre: "Conseil d'administration — Bouygues SA",
    media: "Bouygues (site officiel)",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2026-04-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Bouygues",
    description:
      "Composition officielle du conseil d'administration de Bouygues SA au 1er avril 2026. " +
      "Structure dissociée : DG Olivier Roussat + famille Bouygues (SCDM).",
    verifiee: true,
  },
  wp_roussat: {
    url: "https://fr.wikipedia.org/wiki/Olivier_Roussat",
    titre: "Olivier Roussat — Wikipédia (FR)",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description: "Centrale Paris ; PDG de Bouygues Telecom (2018-2021) ; DG de Bouygues SA depuis mars 2021.",
    verifiee: true,
  },
  wp_martin_bouygues: {
    url: "https://fr.wikipedia.org/wiki/Martin_Bouygues",
    titre: "Martin Bouygues — Wikipédia (FR)",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Fils de Francis Bouygues ; PDG de Bouygues SA (1989-2021) ; administrateur et " +
      "actionnaire via SCDM (~19 % du capital).",
    verifiee: true,
  },
  wd_edward_bouygues: {
    url: "https://www.wikidata.org/wiki/Q133545256",
    titre: "Edward Bouygues — Wikidata Q133545256",
    media: "Wikidata",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Entrée Wikidata Q133545256 — identité vérifiée : Edward Bouygues, né le 1984-04-14, " +
      "fils de Martin Bouygues, administrateur de Bouygues SA.",
    verifiee: true,
  },

  // ── Bureau Veritas ─────────────────────────────────────────────────────────
  gov_bureauveritas: {
    url: "https://group.bureauveritas.com/groupe/gouvernance/conseil-administration",
    titre: "Conseil d'administration — Bureau Veritas Group",
    media: "Bureau Veritas (site officiel)",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2026-05-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Bureau Veritas",
    description:
      "Composition officielle du conseil d'administration de Bureau Veritas au 1er mai 2026, " +
      "incluant Hinda Gharbi (DG, depuis juin 2023).",
    verifiee: true,
  },
  pr_gharbi: {
    url: "https://group.bureauveritas.com/newsroom/press-releases/2023/bureau-veritas-appoints-hinda-gharbi-as-chief-executive-officer",
    titre: "Bureau Veritas appoints Hinda Gharbi as Chief Executive Officer — communiqué 2023-06-19",
    media: "Bureau Veritas",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "en",
    paysMedia: "France",
    datePublication: new Date("2023-06-19"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Bureau Veritas",
    description:
      "Communiqué officiel de nomination de Hinda Gharbi comme CEO de Bureau Veritas, " +
      "effective le 19 juin 2023, en remplacement de Didier Michaud-Daniel.",
    verifiee: true,
  },

  // ── Capgemini ──────────────────────────────────────────────────────────────
  gov_capgemini: {
    url: "https://www.capgemini.com/fr-fr/gouvernance-capgemini/conseil-administration/",
    titre: "Conseil d'administration — Capgemini SE",
    media: "Capgemini (site officiel)",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2026-05-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Capgemini",
    description:
      "Composition officielle du conseil d'administration de Capgemini SE au 1er mai 2026. " +
      "Gouvernance dissociée : président Paul Hermelin + DG Aiman Ezzat.",
    verifiee: true,
  },
  wp_hermelin: {
    url: "https://fr.wikipedia.org/wiki/Paul_Hermelin",
    titre: "Paul Hermelin — Wikipédia (FR)",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "Inspecteur des finances ; PDG de Capgemini (1996-2020) ; président du CA depuis mai 2020.",
    verifiee: true,
  },
  wp_ezzat: {
    url: "https://www.capgemini.com/fr-fr/gouvernance-capgemini/conseil-administration/aiman-ezzat/",
    titre: "Aiman Ezzat — Capgemini SE (biographie officielle)",
    media: "Capgemini (site officiel)",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2026-05-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Capgemini",
    description:
      "Biographie officielle d'Aiman Ezzat : ESCPE Lyon, MBA UCLA ; DG de Capgemini depuis mai 2020 " +
      "et administrateur d'Air Liquide depuis mai 2021.",
    verifiee: true,
  },

  // ── Carrefour ──────────────────────────────────────────────────────────────
  gov_carrefour: {
    url: "https://www.carrefour.com/fr/groupe/gouvernance/le-conseil-dadministration",
    titre: "Le conseil d'administration — Carrefour",
    media: "Carrefour (site officiel)",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: "Carrefour",
    description:
      "Composition officielle du conseil d'administration de Carrefour au 1er juin 2026, " +
      "avec biographies et comités.",
    verifiee: true,
  },
  wp_bompard: {
    url: "https://fr.wikipedia.org/wiki/Alexandre_Bompard",
    titre: "Alexandre Bompard — Wikipédia (FR)",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "ESSEC + Sciences Po ; PDG de Virgin Megastore (2006-2011), Fnac-Darty (2011-2017), " +
      "Carrefour depuis juillet 2017.",
    verifiee: true,
  },
  wp_agon: {
    url: "https://fr.wikipedia.org/wiki/Jean-Paul_Agon",
    titre: "Jean-Paul Agon — Wikipédia (FR)",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-01"),
    auteur: null,
    description:
      "HEC Paris ; PDG de L'Oréal (2006-2021) ; président du CA de L'Oréal depuis 2021 ; " +
      "administrateur indépendant de Carrefour.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002). aRef / bRef = wikidataId des entités.
// typeLienCode ADMINISTRATEUR (id 34) ou DIRIGEANT selon le rôle.
// ---------------------------------------------------------------------------

const LIENS = [
  // ══════════════════════════════════════════════════════
  // Accor
  // ══════════════════════════════════════════════════════

  {
    // Sébastien Bazin — PDG (administrateur + dirigeant exécutif)
    aType: "personne",
    aRef: "Q3509946",
    bType: "organisation",
    bRef: "Q212599",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Sébastien Bazin est président-directeur général d'Accor depuis août 2013 " +
      "(lorsque Colony Capital a pris une participation). Mandat renouvelé annuellement par l'AG.",
    dateDebut: new Date("2013-08-23"),
    dateFin: null,
    sourceRef: "gov_accor",
  },
  {
    aType: "personne",
    aRef: "Q3509946",
    bType: "organisation",
    bRef: "Q212599",
    typeLienCode: "DIRIGEANT",
    description:
      "Sébastien Bazin assure les fonctions exécutives de PDG d'Accor depuis août 2013 " +
      "dans une gouvernance unifiée (président du CA et directeur général confondus).",
    dateDebut: new Date("2013-08-23"),
    dateFin: null,
    sourceRef: "wp_bazin",
  },

  // ══════════════════════════════════════════════════════
  // Airbus — dont interlocks AXA et Air Liquide
  // ══════════════════════════════════════════════════════

  {
    // Guillaume Faury — CEO et administrateur exécutif d'Airbus
    // INTERLOCK : administrateur indépendant d'AXA (pilote, depuis avril 2021)
    aType: "personne",
    aRef: "Q33158035",
    bType: "organisation",
    bRef: "Q2311",
    typeLienCode: "DIRIGEANT",
    description:
      "Guillaume Faury est PDG d'Airbus SE depuis le 10 avril 2019, succédant à Tom Enders. " +
      "INTERLOCK : administrateur indépendant d'AXA depuis avril 2021 (voir pilote).",
    dateDebut: new Date("2019-04-10"),
    dateFin: null,
    sourceRef: "gov_airbus",
  },
  {
    aType: "personne",
    aRef: "Q33158035",
    bType: "organisation",
    bRef: "Q2311",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Guillaume Faury est membre du conseil d'administration d'Airbus SE et PDG exécutif. " +
      "INTERLOCK documenté AXA-Airbus : il siège simultanément au conseil d'AXA (depuis 2021).",
    dateDebut: new Date("2019-04-10"),
    dateFin: null,
    sourceRef: "wp_faury",
  },
  {
    // Catherine Guillouard — administratrice indépendante d'Airbus
    // INTERLOCK : administratrice d'Air Liquide (pilote, depuis mai 2023)
    aType: "personne",
    aRef: "Q33249018",
    bType: "organisation",
    bRef: "Q2311",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Catherine Guillouard est administratrice indépendante d'Airbus SE. " +
      "INTERLOCK documenté Air Liquide-Airbus : elle siège simultanément au conseil " +
      "d'Air Liquide depuis mai 2023 (voir pilote).",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_guillouard",
  },

  // ══════════════════════════════════════════════════════
  // ArcelorMittal
  // ══════════════════════════════════════════════════════

  {
    // Lakshmi Mittal — Executive Chairman
    aType: "personne",
    aRef: "Q191311",
    bType: "organisation",
    bRef: "Q27893",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Lakshmi Mittal est Executive Chairman d'ArcelorMittal depuis janvier 2021 " +
      "(précédemment CEO depuis la création du groupe en 2006). Fondateur du groupe.",
    dateDebut: new Date("2006-01-01"),
    dateFin: null,
    sourceRef: "gov_arcelormittal",
  },
  {
    // Aditya Mittal — CEO (administrateur + dirigeant exécutif)
    aType: "personne",
    aRef: "Q357616",
    bType: "organisation",
    bRef: "Q27893",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Aditya Mittal est CEO et administrateur d'ArcelorMittal depuis janvier 2021, " +
      "dans une gouvernance dissociée (Executive Chairman : Lakshmi Mittal).",
    dateDebut: new Date("2021-01-01"),
    dateFin: null,
    sourceRef: "gov_arcelormittal",
  },
  {
    aType: "personne",
    aRef: "Q357616",
    bType: "organisation",
    bRef: "Q27893",
    typeLienCode: "DIRIGEANT",
    description:
      "Aditya Mittal est Chief Executive Officer d'ArcelorMittal depuis janvier 2021, " +
      "succédant à son père Lakshmi Mittal dans les fonctions exécutives.",
    dateDebut: new Date("2021-01-01"),
    dateFin: null,
    sourceRef: "wp_aditya",
  },
  {
    // Vanisha Mittal Bhatia — administratrice
    aType: "personne",
    aRef: "Q7914953",
    bType: "organisation",
    bRef: "Q27893",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Vanisha Mittal Bhatia, fille de Lakshmi Mittal, est administratrice d'ArcelorMittal " +
      "depuis 2004, représentant la famille fondatrice au conseil.",
    dateDebut: new Date("2004-01-01"),
    dateFin: null,
    sourceRef: "wp_vanisha",
  },

  // ══════════════════════════════════════════════════════
  // Bouygues
  // ══════════════════════════════════════════════════════

  {
    // Olivier Roussat — DG (administrateur + dirigeant exécutif)
    aType: "personne",
    aRef: "Q29108770",
    bType: "organisation",
    bRef: "Q895325",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Olivier Roussat est directeur général et administrateur de Bouygues SA depuis mars 2021, " +
      "succédant à Martin Bouygues dans les fonctions exécutives.",
    dateDebut: new Date("2021-03-01"),
    dateFin: null,
    sourceRef: "gov_bouygues",
  },
  {
    aType: "personne",
    aRef: "Q29108770",
    bType: "organisation",
    bRef: "Q895325",
    typeLienCode: "DIRIGEANT",
    description:
      "Olivier Roussat est directeur général de Bouygues SA depuis mars 2021. La gouvernance " +
      "est dissociée : Martin Bouygues reste au conseil comme administrateur.",
    dateDebut: new Date("2021-03-01"),
    dateFin: null,
    sourceRef: "wp_roussat",
  },
  {
    // Martin Bouygues — administrateur (ancien PDG)
    aType: "personne",
    aRef: "Q680669",
    bType: "organisation",
    bRef: "Q895325",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Martin Bouygues est administrateur de Bouygues SA depuis mars 2021 (date à laquelle " +
      "il a cédé la direction générale à Olivier Roussat). A été PDG de 1989 à 2021.",
    dateDebut: new Date("1989-01-01"),
    dateFin: null,
    sourceRef: "wp_martin_bouygues",
  },
  {
    // Edward Bouygues — administrateur
    aType: "personne",
    aRef: "Q133545256",
    bType: "organisation",
    bRef: "Q895325",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Edward Bouygues, fils de Martin Bouygues, est administrateur de Bouygues SA, " +
      "représentant la troisième génération familiale au conseil.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wd_edward_bouygues",
  },

  // ══════════════════════════════════════════════════════
  // Bureau Veritas
  // ══════════════════════════════════════════════════════

  {
    // Hinda Gharbi — DG (administratrice + dirigeante exécutive)
    aType: "personne",
    aRef: "Q134347813",
    bType: "organisation",
    bRef: "Q1974503",
    typeLienCode: "DIRIGEANT",
    description:
      "Hinda Gharbi est directrice générale de Bureau Veritas depuis le 19 juin 2023, " +
      "succédant à Didier Michaud-Daniel. Première femme à diriger le groupe.",
    dateDebut: new Date("2023-06-19"),
    dateFin: null,
    sourceRef: "pr_gharbi",
  },
  {
    aType: "personne",
    aRef: "Q134347813",
    bType: "organisation",
    bRef: "Q1974503",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Hinda Gharbi est administratrice et directrice générale de Bureau Veritas depuis " +
      "le 19 juin 2023 (nomination par le conseil d'administration sur proposition du comité " +
      "des nominations).",
    dateDebut: new Date("2023-06-19"),
    dateFin: null,
    sourceRef: "gov_bureauveritas",
  },

  // ══════════════════════════════════════════════════════
  // Capgemini — dont interlock Air Liquide
  // ══════════════════════════════════════════════════════

  {
    // Paul Hermelin — président du CA
    aType: "personne",
    aRef: "Q556660",
    bType: "organisation",
    bRef: "Q1034621",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Paul Hermelin est président du conseil d'administration de Capgemini SE depuis mai 2020 " +
      "(précédemment PDG de 1996 à 2020). La gouvernance est dissociée (DG : Aiman Ezzat).",
    dateDebut: new Date("2020-05-01"),
    dateFin: null,
    sourceRef: "gov_capgemini",
  },
  {
    // Aiman Ezzat — DG (administrateur + dirigeant exécutif)
    // INTERLOCK : administrateur d'Air Liquide (pilote, depuis mai 2021)
    aType: "personne",
    aRef: "Q33236908",
    bType: "organisation",
    bRef: "Q1034621",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Aiman Ezzat est directeur général et administrateur de Capgemini SE depuis mai 2020. " +
      "INTERLOCK documenté Capgemini-Air Liquide : il siège simultanément au conseil " +
      "d'Air Liquide depuis mai 2021 (voir pilote).",
    dateDebut: new Date("2020-05-01"),
    dateFin: null,
    sourceRef: "gov_capgemini",
  },
  {
    aType: "personne",
    aRef: "Q33236908",
    bType: "organisation",
    bRef: "Q1034621",
    typeLienCode: "DIRIGEANT",
    description:
      "Aiman Ezzat est directeur général de Capgemini SE depuis mai 2020, succédant à Paul Hermelin " +
      "dans les fonctions exécutives.",
    dateDebut: new Date("2020-05-01"),
    dateFin: null,
    sourceRef: "wp_ezzat",
  },

  // ══════════════════════════════════════════════════════
  // Carrefour
  // ══════════════════════════════════════════════════════

  {
    // Alexandre Bompard — PDG (administrateur + dirigeant exécutif)
    aType: "personne",
    aRef: "Q2833474",
    bType: "organisation",
    bRef: "Q217599",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Alexandre Bompard est président-directeur général de Carrefour depuis juillet 2017, " +
      "dans une gouvernance unifiée (PDG). Mandat renouvelé par l'AG de 2024.",
    dateDebut: new Date("2017-07-18"),
    dateFin: null,
    sourceRef: "gov_carrefour",
  },
  {
    aType: "personne",
    aRef: "Q2833474",
    bType: "organisation",
    bRef: "Q217599",
    typeLienCode: "DIRIGEANT",
    description:
      "Alexandre Bompard est PDG de Carrefour depuis juillet 2017. Il a lancé un plan de " +
      "transformation digitale, la cession d'actifs non-stratégiques et un partenariat avec Alibaba.",
    dateDebut: new Date("2017-07-18"),
    dateFin: null,
    sourceRef: "wp_bompard",
  },
  {
    // Jean-Paul Agon — administrateur indépendant
    aType: "personne",
    aRef: "Q195993",
    bType: "organisation",
    bRef: "Q217599",
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Jean-Paul Agon, ancien PDG de L'Oréal et actuel président de son conseil, siège au " +
      "conseil de Carrefour comme administrateur indépendant, apportant son expertise " +
      "de la distribution de grande consommation mondiale.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_agon",
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents — recopiés verbatim de seed-cac40-pilote.js
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-cac40-b1] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

async function upsertPersonne(data, userId) {
  const existing = await prisma.personne.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.personne.update({
      where: { id: existing.id },
      data: { ...data, statut: "EN_ATTENTE" },
    })
  }
  return prisma.personne.create({ data: { ...data, statut: "EN_ATTENTE", creeParId: userId } })
}

async function upsertOrganisation(data, userId) {
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.organisation.update({
      where: { id: existing.id },
      data: { ...data, statut: "EN_ATTENTE" },
    })
  }
  return prisma.organisation.create({ data: { ...data, statut: "EN_ATTENTE", creeParId: userId } })
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
  throw new Error(`Type entité non supporté ici : ${type}`)
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
      `[seed-cac40-b1] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
    )
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`TypeLien introuvable : ${lien.typeLienCode}`)
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
  console.log("Suppression données CAC 40 batch 1 précédentes...")
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
  console.log("\n┌─ seed-cac40-b1 — Conseils d'administration CAC 40 (7 sociétés) ────┐\n")
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log("— Sources publiques —")
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  + ${data.titre}`)
  }

  console.log("\n— Personnes (Wikidata) —")
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  + ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log("\n— Organisations (Wikidata) —")
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  + ${created.nom} (${o.wikidataId})`)
  }

  console.log("\n— Liens —")
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  + ${lien.typeLienCode} | ${lien.aRef} → ${lien.bRef}`)
  }

  console.log("\n┌─ Bilan ──────────────────────────────────────────────────────────────┐")
  console.log(`│ Personnes     : ${PERSONNES.length} (dont 3 déjà en pilote, upsertées avec nouveaux liens)`)
  console.log(`│ Organisations : ${ORGANISATIONS.length} (Accor, Airbus, ArcelorMittal, Bouygues, Bureau Veritas,`)
  console.log(`│                   Capgemini, Carrefour)`)
  console.log(`│ Sources       : ${Object.keys(SOURCES).length}`)
  console.log(`│ Liens         : ${LIENS.length} (ADMINISTRATEUR + DIRIGEANT)`)
  console.log("│")
  console.log("│ INTERLOCKS INTER-BATCH (b1 ↔ pilote) :")
  console.log("│   — Guillaume Faury (Q33158035)      : Airbus (CEO, b1) + AXA (admin, pilote)")
  console.log("│   — Aiman Ezzat (Q33236908)           : Capgemini (CEO, b1) + Air Liquide (admin, pilote)")
  console.log("│   — Catherine Guillouard (Q33249018)  : Airbus (admin, b1) + Air Liquide (admin, pilote)")
  console.log("└───────────────────────────────────────────────────────────────────────┘")
  console.log("\nAdministrateurs exclus (sans wikidataId vérifié) — voir commentaires en tête de fichier.")
  console.log("")
}

main()
  .catch((err) => {
    console.error("[seed-cac40-b1] Échec :", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
