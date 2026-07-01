/**
 * Seed CAC 40 — Conseils d'administration PILOTE (5 sociétés).
 *
 * Enquête OSINT journalistique — consultation du 2026-06-30.
 * Périmètre : TotalEnergies, BNP Paribas, Sanofi, AXA, Air Liquide.
 * Pour chaque société : conseil complet limité aux membres disposant d'un
 * wikidataId vérifié (wbsearchentities / Special:EntityData). Les membres
 * sans Q-id sont exclus et listés en commentaire pour suivi.
 *
 * INTERLOCKS DÉTECTÉS parmi les 5 conseils :
 *   — Jacques Aschenbroich (Q3158153) : TotalEnergies + BNP Paribas
 *   — Clotilde Delbos (Q48441071)     : AXA + Sanofi
 *
 * Sources : sites de gouvernance officiels des sociétés, Wikidata,
 *           Wikipédia, URD 2024, communiqués de presse (cf. SOURCES).
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - membres sans Q-id exclus du pilote ; traitement au scale-out
 *
 * Usage :
 *   cd backend && node bin/seed-cac40-pilote.js
 *   cd backend && node bin/seed-cac40-pilote.js --reset
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
  // ─── TotalEnergies ────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q18342983 + Wikipedia EN + totalenergies.com/governance
    nom: 'Pouyanné',
    prenom: 'Patrick',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-06-24'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Président-directeur général de TotalEnergies',
    rolesSecondaires: ["ingénieur des mines", "ancien directeur de cabinet du PM Juppé (1995)"],
    bio:
      "Ingénieur des Mines de Paris, Patrick Pouyanné rejoint Total en 1997. Il dirige plusieurs divisions " +
      "avant d'être nommé PDG en octobre 2014, succédant à Christophe de Margerie. Sous sa direction, " +
      "Total SE devient TotalEnergies en 2021 pour afficher une stratégie de transition énergétique.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Patrick_Pouyann%C3%A9',
    wikidataId: 'Q18342983',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3158153 + Wikipedia EN + totalenergies.com/governance + group.bnpparibas
    // NB : administrateur référent de TotalEnergies (depuis mai 2021) ET administrateur de BNP Paribas
    // (depuis 2023). INTERLOCK documenté entre les deux conseils.
    nom: 'Aschenbroich',
    prenom: 'Jacques',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1954-06-03'),
    lieuNaissance: 'France',
    rolePrincipal: "Président du conseil d'administration d'Orange ; administrateur référent de TotalEnergies",
    rolesSecondaires: [
      "ancien PDG de Valeo (2009-2022)",
      "ingénieur du Corps des mines",
      "administrateur de BNP Paribas",
    ],
    bio:
      "Ingénieur du Corps des mines, Jacques Aschenbroich a dirigé le groupe automobile Valeo pendant " +
      "treize ans (2009-2022). Président du conseil d'Orange depuis 2022, il est aussi administrateur " +
      "référent de TotalEnergies depuis mai 2021 et administrateur de BNP Paribas depuis 2023 — " +
      "interlock documenté entre ces deux conseils.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Jacques_Aschenbroich',
    wikidataId: 'Q3158153',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q29642685 + Wikipedia EN + totalenergies.com/governance
    nom: 'Coisne-Roquette',
    prenom: 'Marie-Christine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1956-11-04'),
    lieuNaissance: 'France',
    rolePrincipal: 'Présidente-directrice générale de Sonepar ; administratrice de TotalEnergies',
    rolesSecondaires: ["représentante familiale de Sonepar (distribution électrique)"],
    bio:
      "Présidente-directrice générale de Sonepar, groupe familial de distribution de matériel électrique " +
      "(numéro un mondial du secteur), Marie-Christine Coisne-Roquette siège au conseil de TotalEnergies " +
      "depuis mai 2011, ce qui en fait la doyenne du conseil.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Marie-Christine_Coisne-Roquette',
    wikidataId: 'Q29642685',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q116865148 + Wikipedia EN + totalenergies.com (AGM mai 2026)
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
    ],
    bio:
      "Slawomir Krupa dirige la Société Générale depuis mai 2023. Nommé administrateur indépendant de " +
      "TotalEnergies à l'assemblée générale du 29 mai 2026, il représente un pont entre les secteurs " +
      "financier et énergétique. Diplômé de Sciences Po Paris.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Slawomir_Krupa',
    wikidataId: 'Q116865148',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── BNP Paribas ──────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q729859 + Wikipedia EN + group.bnpparibas (board page)
    nom: 'Lemierre',
    prenom: 'Jean',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1950-06-06'),
    lieuNaissance: 'France',
    rolePrincipal: "Président du conseil d'administration de BNP Paribas",
    rolesSecondaires: [
      "ancien directeur général du Trésor (1995-2000)",
      "ancien président de la BERD (Banque européenne pour la reconstruction et le développement, 2000-2008)",
      "inspecteur des finances",
    ],
    bio:
      "Haut fonctionnaire issu de l'ENA et de Sciences Po, Jean Lemierre a dirigé la BERD de 2000 à 2008 " +
      "et le Trésor français de 1995 à 2000. Il est président du conseil d'administration de BNP Paribas " +
      "depuis le 1er décembre 2014.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Jean_Lemierre',
    wikidataId: 'Q729859',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q239216 + Wikipedia EN + group.bnpparibas/governance
    nom: 'Bonnafé',
    prenom: 'Jean-Laurent',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-07-14'),
    lieuNaissance: 'France',
    rolePrincipal: 'Directeur général de BNP Paribas',
    rolesSecondaires: [
      "X-Mines (Polytechnique et Corps des mines)",
      "membre du conseil d'administration de BNP Paribas depuis 2008",
    ],
    bio:
      "Polytechnicien et ingénieur du Corps des mines, Jean-Laurent Bonnafé est directeur général de " +
      "BNP Paribas depuis le 1er décembre 2011. Il a auparavant dirigé BNP Paribas Retail Banking en France " +
      "et BancWest aux États-Unis.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Jean-Laurent_Bonnaf%C3%A9',
    wikidataId: 'Q239216',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q1518898 + Wikipedia EN + invest.bnpparibas (candidats AG 2024)
    nom: 'de Chalendar',
    prenom: 'Pierre-André',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-04-12'),
    lieuNaissance: 'Vichy (Allier)',
    rolePrincipal: "Président du conseil d'administration de Compagnie de Saint-Gobain ; administrateur de BNP Paribas",
    rolesSecondaires: [
      "ancien PDG de Saint-Gobain (2010-2021)",
      "ENA (promotion 1983)",
      "administrateur de Veolia",
    ],
    bio:
      "Issu de l'ESSEC et de l'ENA, Pierre-André de Chalendar a dirigé Saint-Gobain comme PDG de 2010 " +
      "à 2021. Président du conseil depuis 2021, il siège au conseil de BNP Paribas depuis 2021 et à " +
      "celui de Veolia.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Pierre-Andr%C3%A9_de_Chalendar',
    wikidataId: 'Q1518898',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Sanofi ───────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q984266 + Wikipedia EN + sanofi.com/governance (board page)
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
      "25 mai 2023, il succède à Serge Weinberg.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Oud%C3%A9a',
    wikidataId: 'Q984266',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q27882872 + Wikipedia EN + sanofi.com PR du 2026-02-12 + AGM 2026-04-29
    nom: 'Garijo',
    prenom: 'Belén',
    pays: 'Espagne',
    nationalite: 'espagnole',
    dateNaissance: new Date('1960-09-07'),
    lieuNaissance: 'Valence (Espagne)',
    rolePrincipal: "Directrice générale de Sanofi (depuis mai 2026) ; ancienne PDG de Merck KGaA",
    rolesSecondaires: [
      "première femme à diriger un groupe du DAX allemand (Merck KGaA, 2021-2026)",
      "médecin pharmacologue de formation",
      "ancienne vice-présidente exécutive de Sanofi-Aventis",
    ],
    bio:
      "Médecin spécialisée en pharmacologie clinique, Belén Garijo a dirigé Merck KGaA de 2021 à 2026, " +
      "devenant la première femme à la tête d'un groupe du DAX. Nommée directrice générale de Sanofi " +
      "lors de l'AGM du 29 avril 2026, elle prend la suite de Paul Hudson.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Bel%C3%A9n_Garijo',
    wikidataId: 'Q27882872',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q48441071 + Wikipedia EN + sanofi.com/board + axa.com/board
    // INTERLOCK : siège simultanément au conseil de Sanofi (depuis 2024) et d'AXA (depuis 2021)
    nom: 'Delbos',
    prenom: 'Clotilde',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Directrice générale déléguée et directrice financière du groupe Renault",
    rolesSecondaires: [
      "administratrice indépendante de Sanofi (depuis 2024)",
      "administratrice indépendante d'AXA (depuis 2021)",
      "diplômée d'emlyon business school",
    ],
    bio:
      "Directrice financière du groupe Renault depuis 2013 et DGD depuis juillet 2020, Clotilde Delbos " +
      "siège au conseil d'AXA depuis 2021 et à celui de Sanofi depuis avril 2024. Son double mandat " +
      "constitue un interlock documenté entre les deux conseils.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Clotilde_Delbos',
    wikidataId: 'Q48441071',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── AXA ──────────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q2854012 + Wikipédia FR + axa.com (communiqué 2022-04-28)
    nom: 'Gosset-Grainville',
    prenom: 'Antoine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-03-17'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Président du conseil d'administration d'AXA",
    rolesSecondaires: [
      "co-fondateur et associé de BDGS Associés (cabinet d'avocats, 2013)",
      "ancien directeur général délégué de la Caisse des Dépôts (2010-2013)",
      "ENA + Sciences Po + Paris Dauphine (banque-finance)",
      "inspecteur des finances",
    ],
    bio:
      "Inspecteur des finances, Antoine Gosset-Grainville a dirigé le pôle financier de la Caisse " +
      "des Dépôts avant de cofonder le cabinet BDGS Associés en 2013. Nommé président du conseil " +
      "d'administration d'AXA le 28 avril 2022, il est réélu à l'AG 2025.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Antoine_Gosset-Grainville',
    wikidataId: 'Q2854012',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q23560320 + Wikipedia EN + axa.com/governance
    nom: 'Buberl',
    prenom: 'Thomas',
    pays: 'Allemagne',
    nationalite: 'allemande',
    dateNaissance: new Date('1973-02-22'),
    lieuNaissance: 'Cologne (Allemagne)',
    rolePrincipal: "Directeur général d'AXA",
    rolesSecondaires: [
      "ex-CEO d'AXA Konzern AG (Allemagne, 2012-2016)",
      "ancien consultant BCG",
      "ancien dirigeant de Zurich Insurance Group",
    ],
    bio:
      "Diplômé en gestion des affaires, Thomas Buberl dirige AXA depuis le 1er septembre 2016, " +
      "succédant à Henri de Castries. Sous sa direction, AXA a cédé ses activités américaines (AXA " +
      "Equitable, 2018) et renforcé sa présence en assurance dommages et prévoyance.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Thomas_Buberl',
    wikidataId: 'Q23560320',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q33158035 + Wikipedia EN + axa.com/governance (membre depuis avril 2021)
    nom: 'Faury',
    prenom: 'Guillaume',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1968-02-22'),
    lieuNaissance: 'Cherbourg (Manche)',
    rolePrincipal: "Président exécutif et directeur général d'Airbus",
    rolesSecondaires: [
      "administrateur indépendant d'AXA (depuis avril 2021)",
      "X-Supaero",
      "ancien PDG d'Airbus Helicopters (2013-2018)",
    ],
    bio:
      "Polytechnicien et ingénieur de l'ISAE-Supaero, Guillaume Faury dirige Airbus depuis avril 2019. " +
      "Il siège au conseil d'administration d'AXA depuis avril 2021 en tant qu'administrateur indépendant, " +
      "au titre de son expérience dans les grandes industries mondiales.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Guillaume_Faury',
    wikidataId: 'Q33158035',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3418520 + Wikipédia FR + axa.com (membre depuis 2021)
    nom: 'Fernandez',
    prenom: 'Ramon',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-06-25'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Administrateur indépendant d'AXA ; directeur exécutif finances et participations de CMA CGM",
    rolesSecondaires: [
      "ancien directeur général du Trésor (2009-2014)",
      "ancien directeur général exécutif d'Orange (2014-2019)",
      "ENA",
      "inspecteur des finances",
    ],
    bio:
      "Haut fonctionnaire, inspecteur des finances, Ramon Fernandez a dirigé la direction générale " +
      "du Trésor de 2009 à 2014. Il a ensuite rejoint Orange comme DGE (2014-2019) puis CMA CGM. " +
      "Il siège au conseil d'AXA depuis 2021.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Ramon_Fernandez_(haut_fonctionnaire)',
    wikidataId: 'Q3418520',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },

  // ─── Air Liquide ──────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q3622 + Wikipedia EN + airliquide.com (board page)
    nom: 'Potier',
    prenom: 'Benoît',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1957-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Président du conseil d'administration d'Air Liquide",
    rolesSecondaires: [
      "Centrale Paris (promo 1979)",
      "ancien PDG d'Air Liquide (2006-2022)",
      "administrateur chez Air Liquide depuis 1997",
    ],
    bio:
      "Ingénieur centralien, Benoît Potier rejoint Air Liquide en 1981. PDG de 2006 à 2022, il a " +
      "transformé le groupe en acteur mondial des gaz industriels et médicaux. Depuis le 1er juin 2022, " +
      "il est président non exécutif du conseil d'administration.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Beno%C3%AEt_Potier',
    wikidataId: 'Q3622',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q33110014 + airliquide.com (executive committee + board page)
    nom: 'Jackow',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1969-06-12'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Directeur général d'Air Liquide",
    rolesSecondaires: ["ENS Ulm et Harvard (MBA)", "administrateur et DG depuis le 1er juin 2022"],
    bio:
      "Normalien (ENS Ulm) et MBA Harvard, François Jackow fait toute sa carrière au sein d'Air " +
      "Liquide depuis 1995, occupant des fonctions opérationnelles en France, aux États-Unis et en " +
      "Asie. Nommé directeur général le 1er juin 2022, il succède à Benoît Potier.",
    wikipediaUrl: null,
    wikidataId: 'Q33110014',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q731462 + Wikipedia EN + airliquide.com (board page, lead director)
    nom: 'Huillard',
    prenom: 'Xavier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1954-06-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Président du conseil d'administration de Vinci ; administrateur référent d'Air Liquide",
    rolesSecondaires: [
      "PDG de Vinci depuis 2010",
      "X-Ponts",
      "président du comité des nominations et de la gouvernance d'Air Liquide",
    ],
    bio:
      "Polytechnicien et ingénieur des Ponts, Xavier Huillard dirige Vinci depuis 2010. Il est " +
      "administrateur référent (lead director) d'Air Liquide et préside le comité des nominations " +
      "et de la gouvernance.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Xavier_Huillard',
    wikidataId: 'Q731462',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q33236908 + Capgemini.com biography + airliquide.com board
    nom: 'Ezzat',
    prenom: 'Aiman',
    pays: 'France',
    nationalite: 'franco-égyptienne',
    dateNaissance: new Date('1961-05-22'),
    lieuNaissance: 'France',
    rolePrincipal: "Directeur général de Capgemini ; administrateur indépendant d'Air Liquide",
    rolesSecondaires: [
      "ESCPE Lyon (chimie-physique) + UCLA Anderson (MBA)",
      "directeur général de Capgemini depuis mai 2020",
      "administrateur d'Air Liquide depuis le 4 mai 2021",
    ],
    bio:
      "Diplômé en génie chimique et MBA UCLA, Aiman Ezzat dirige Capgemini SE depuis mai 2020. " +
      "Il siège au conseil d'Air Liquide depuis le 4 mai 2021, apportant son expertise en " +
      "transformation numérique et intelligence artificielle.",
    wikipediaUrl: null,
    wikidataId: 'Q33236908',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q33249018 + Wikipedia EN + airliquide.com board (membre depuis mai 2023)
    nom: 'Guillouard',
    prenom: 'Catherine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1965-01-23'),
    lieuNaissance: 'Cannes (Alpes-Maritimes)',
    rolePrincipal: "Administratrice indépendante d'Air Liquide ; présidente du comité d'audit",
    rolesSecondaires: [
      "ancienne PDG du groupe RATP (août 2017 - septembre 2022)",
      "ancienne DFO d'Air France-KLM",
      "administratrice d'Airbus",
    ],
    bio:
      "Ingénieure et financière de formation, Catherine Guillouard a dirigé la RATP de 2017 à 2022 " +
      "après un parcours au sein d'Air France-KLM. Elle siège au conseil d'Air Liquide depuis mai " +
      "2023 et en préside le comité d'audit et des comptes.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Catherine_Guillouard',
    wikidataId: 'Q33249018',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — 5 sociétés CAC 40
// wikidataIds vérifiés via Special:EntityData
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q154037 + Wikipedia FR/EN + totalenergies.com
    nom: 'TotalEnergies',
    sigle: 'TTE',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://totalenergies.com',
    description:
      "Groupe énergétique français intégré (pétrole, gaz, électricité, énergies renouvelables), " +
      "issu de la Compagnie française des pétroles fondée en 1924. Rebaptisé TotalEnergies SE en " +
      "mai 2021 pour matérialiser sa stratégie de transition. PDG : Patrick Pouyanné. CAC 40.",
    dateCreation: new Date('1924-03-28'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/TotalEnergies',
    wikidataId: 'Q154037',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q499707 + Wikipedia FR/EN + group.bnpparibas
    nom: 'BNP Paribas',
    sigle: 'BNPP',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://group.bnpparibas',
    description:
      "Première banque de la zone euro par le total de bilan, née en 1999 de la fusion de BNP " +
      "et de Paribas. Présente dans 65 pays, employant environ 183 000 personnes. Présidée par " +
      "Jean Lemierre, dirigée par Jean-Laurent Bonnafé. CAC 40.",
    dateCreation: new Date('1999-05-23'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/BNP_Paribas',
    wikidataId: 'Q499707',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q158205 + Wikipedia FR/EN + sanofi.com
    nom: 'Sanofi',
    sigle: 'SAN',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.sanofi.com',
    description:
      "Groupe pharmaceutique français, né de la fusion Sanofi-Synthélabo / Aventis en 2004. " +
      "Leader mondial en vaccins (Sanofi Pasteur) et immunologie. Présidé par Frédéric Oudéa, " +
      "dirigé par Belén Garijo depuis mai 2026. CAC 40.",
    dateCreation: new Date('2004-08-20'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Sanofi',
    wikidataId: 'Q158205',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q160054 + Wikipedia FR/EN + axa.com
    nom: 'AXA',
    sigle: 'AXA',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.axa.com',
    description:
      "Premier assureur mondial par chiffre d'affaires (né en 1985 de la mutuelle Ancienne Mutuelle " +
      "du Calvados). Présent dans plus de 50 pays. Présidé par Antoine Gosset-Grainville, dirigé " +
      "par Thomas Buberl. CAC 40.",
    dateCreation: new Date('1985-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/AXA',
    wikidataId: 'Q160054',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q407448 + Wikipedia FR/EN + airliquide.com
    nom: 'Air Liquide',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.airliquide.com',
    description:
      "Groupe industriel français spécialisé dans les gaz industriels et de santé, fondé en 1902. " +
      "Numéro deux mondial du secteur (derrière Linde). Présidé par Benoît Potier, dirigé par " +
      "François Jackow depuis juin 2022. CAC 40.",
    dateCreation: new Date('1902-11-08'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Air_liquide',
    wikidataId: 'Q407448',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées. dateConsultation 2026-06-30.
// ---------------------------------------------------------------------------

const SOURCES = {
  // ── TotalEnergies ──────────────────────────────────────────────────────────
  gov_total: {
    url: 'https://totalenergies.com/company/identity/governance/board-of-directors',
    titre: "Conseil d'administration de TotalEnergies — totalenergies.com",
    media: 'TotalEnergies (site officiel)',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-05-29'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'TotalEnergies',
    description:
      "Liste officielle et biographies des 14 administrateurs de TotalEnergies au 29 mai 2026 " +
      "(après AGM). Inclut dates de mandat et comités.",
    verifiee: true,
  },
  urd_total: {
    url: 'https://totalenergies.com/system/files/documents/totalenergies_document-enregistrement-universel-2024_2025_fr.pdf',
    titre: "Document d'enregistrement universel 2024 — TotalEnergies SE",
    media: 'TotalEnergies (AMF)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-03-31'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'TotalEnergies SE',
    description:
      "URD 2024 déposé auprès de l'AMF. Contient la section gouvernance et le tableau des " +
      "rémunérations des administrateurs pour l'exercice 2024.",
    verifiee: true,
  },
  wp_pouyanne: {
    url: 'https://en.wikipedia.org/wiki/Patrick_Pouyann%C3%A9',
    titre: 'Patrick Pouyanné — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : ingénieur des Mines, Total depuis 1997, PDG depuis octobre 2014, transition " +
      "vers TotalEnergies 2021.",
    verifiee: true,
  },
  wp_aschenbroich: {
    url: 'https://en.wikipedia.org/wiki/Jacques_Aschenbroich',
    titre: 'Jacques Aschenbroich — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Corps des mines, PDG Valeo (2009-2022), président d'Orange (2022-), administrateur " +
      "TotalEnergies (2021-) et BNP Paribas (2023-).",
    verifiee: true,
  },
  wp_coisne: {
    url: 'https://en.wikipedia.org/wiki/Marie-Christine_Coisne-Roquette',
    titre: 'Marie-Christine Coisne-Roquette — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "PDG de Sonepar, groupe familial de distribution électrique ; administratrice de TotalEnergies " +
      "depuis 2011, doyenne du conseil.",
    verifiee: true,
  },
  wp_krupa: {
    url: 'https://en.wikipedia.org/wiki/Slawomir_Krupa',
    titre: 'Slawomir Krupa — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-05-29'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "DG de la Société Générale depuis mai 2023 ; administrateur indépendant de TotalEnergies " +
      "depuis l'AGM du 29 mai 2026.",
    verifiee: true,
  },

  // ── BNP Paribas ────────────────────────────────────────────────────────────
  gov_bnp: {
    url: 'https://group.bnpparibas/en/group/our-governance/board-of-directors',
    titre: "Members of the Board of Directors — BNP Paribas Group",
    media: 'BNP Paribas (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-05-13'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'BNP Paribas',
    description:
      "Liste officielle des membres du conseil d'administration de BNP Paribas (15 membres " +
      "au 13 mai 2026, après l'AGM).",
    verifiee: true,
  },
  rem_bnp: {
    url: 'https://invest.bnpparibas/document/remuneration-des-dirigeants-mandataires-sociaux-au-titre-de-2024-decisions-du-conseil-dadministration-du-3-fevrier-2025',
    titre: "Rémunération des dirigeants mandataires sociaux au titre de 2024 — BNP Paribas",
    media: 'BNP Paribas Investor Relations',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-02-03'),
    dateConsultation: new Date('2026-06-30'),
    auteur: "Conseil d'administration de BNP Paribas",
    description:
      "Document officiel sur les rémunérations 2024. Jetons de présence : part fixe ~17 000 € " +
      "/an par admin, part variable jusqu'à 45 000 € ; total simple admin ~62 000 €, " +
      "présidents de comités jusqu'à 110 000 € (exercice 2024).",
    verifiee: true,
  },
  wp_lemierre: {
    url: 'https://en.wikipedia.org/wiki/Jean_Lemierre',
    titre: 'Jean Lemierre — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Directeur général du Trésor (1995-2000), président de la BERD (2000-2008), président " +
      "du CA de BNP Paribas depuis le 1er décembre 2014.",
    verifiee: true,
  },
  wp_bonnafe: {
    url: 'https://en.wikipedia.org/wiki/Jean-Laurent_Bonnaf%C3%A9',
    titre: 'Jean-Laurent Bonnafé — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Polytechnicien et Corps des mines ; DG de BNP Paribas depuis le 1er décembre 2011.",
    verifiee: true,
  },
  wp_chalendar: {
    url: 'https://en.wikipedia.org/wiki/Pierre-Andr%C3%A9_de_Chalendar',
    titre: 'Pierre-André de Chalendar — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "ESSEC + ENA ; PDG de Saint-Gobain (2010-2021), président du CA depuis 2021 ; " +
      "administrateur de BNP Paribas depuis 2021.",
    verifiee: true,
  },

  // ── Sanofi ─────────────────────────────────────────────────────────────────
  gov_sanofi: {
    url: 'https://www.sanofi.com/en/our-company/governance/board-of-directors',
    titre: "Board of Directors — Sanofi",
    media: 'Sanofi (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-04-29'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Sanofi',
    description:
      "Liste officielle des 16 administrateurs de Sanofi au 29 avril 2026 (après AGM). " +
      "Inclut dates de mandat, comités et statut d'indépendance.",
    verifiee: true,
  },
  wp_oudea: {
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
      "PDG de la Société Générale (2009-2023), président du CA de Sanofi depuis mai 2023.",
    verifiee: true,
  },
  wp_garijo: {
    url: 'https://en.wikipedia.org/wiki/Bel%C3%A9n_Garijo',
    titre: 'Belén Garijo — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-05-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Médecin pharmacologue, PDG de Merck KGaA (2021-2026), DG de Sanofi depuis mai 2026.",
    verifiee: true,
  },
  pr_garijo: {
    url: 'https://www.sanofi.com/en/media-room/press-releases/2026/2026-04-29-16-00-25-3284073',
    titre: "Annual General Meeting of April 29, 2026 — Belén Garijo appointed Director and CEO of Sanofi",
    media: 'Sanofi',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-04-29'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Sanofi',
    description:
      "Communiqué officiel de l'AGM 2026 : Belén Garijo nommée directrice et DG de Sanofi " +
      "en remplacement de Paul Hudson dont le mandat n'a pas été renouvelé.",
    verifiee: true,
  },
  wp_delbos: {
    url: 'https://en.wikipedia.org/wiki/Clotilde_Delbos',
    titre: 'Clotilde Delbos — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "DGD et DFO de Renault ; administratrice indépendante d'AXA (depuis 2021) et de Sanofi " +
      "(depuis avril 2024). Interlock documenté AXA-Sanofi.",
    verifiee: true,
  },

  // ── AXA ────────────────────────────────────────────────────────────────────
  gov_axa: {
    url: 'https://www.axa.com/fr/a-propos-d-axa/membres-conseil-administration',
    titre: "Membres du conseil d'administration — AXA",
    media: 'AXA (site officiel)',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-04-30'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'AXA',
    description:
      "Liste officielle des 14 administrateurs d'AXA au 30 avril 2026, incluant le statut " +
      "d'indépendance (9 sur 14 indépendants au sens Afep-Medef).",
    verifiee: true,
  },
  wp_gosset: {
    url: 'https://fr.wikipedia.org/wiki/Antoine_Gosset-Grainville',
    titre: 'Antoine Gosset-Grainville — Wikipédia (FR)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "ENA, inspecteur des finances, Caisse des Dépôts, BDGS Associés (2013) ; " +
      "président du CA d'AXA depuis le 28 avril 2022.",
    verifiee: true,
  },
  wp_buberl: {
    url: 'https://en.wikipedia.org/wiki/Thomas_Buberl',
    titre: 'Thomas Buberl — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "DG d'AXA depuis le 1er septembre 2016 ; BCG, Zurich Insurance, AXA Allemagne (2012-2016).",
    verifiee: true,
  },
  wp_faury: {
    url: 'https://en.wikipedia.org/wiki/Guillaume_Faury',
    titre: 'Guillaume Faury — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "PDG d'Airbus depuis avril 2019 ; administrateur indépendant d'AXA depuis avril 2021.",
    verifiee: true,
  },
  wp_fernandez: {
    url: 'https://fr.wikipedia.org/wiki/Ramon_Fernandez_(haut_fonctionnaire)',
    titre: 'Ramon Fernandez — Wikipédia (FR)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "DG du Trésor (2009-2014), DGE d'Orange (2014-2019), directeur exécutif CMA CGM ; " +
      "administrateur indépendant d'AXA depuis 2021.",
    verifiee: true,
  },

  // ── Air Liquide ────────────────────────────────────────────────────────────
  gov_airliquide: {
    url: 'https://www.airliquide.com/group/board-directors',
    titre: "Board of Directors — Air Liquide",
    media: 'Air Liquide (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Air Liquide',
    description:
      "Liste officielle des 14 administrateurs d'Air Liquide (12 nommés par l'AG + 2 " +
      "représentants des salariés) ; 83 % d'indépendants, 42 % de femmes.",
    verifiee: true,
  },
  guide_airliquide: {
    url: 'https://airliquide.publispeak.com/guide-pratique-de-lactionnaire-2024/article/13/',
    titre: "Le Conseil d'Administration — Guide Pratique de l'Actionnaire 2024 (Air Liquide)",
    media: 'Air Liquide',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-04-30'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Air Liquide',
    description:
      "Composition du conseil d'administration au 31 décembre 2023 : 14 membres dont " +
      "Benoît Potier (président), François Jackow (DG), Xavier Huillard (lead director).",
    verifiee: true,
  },
  wp_potier: {
    url: 'https://en.wikipedia.org/wiki/Beno%C3%AEt_Potier',
    titre: 'Benoît Potier — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Centrale Paris, Air Liquide depuis 1981, PDG (2006-2022), président non-exécutif " +
      "du CA depuis le 1er juin 2022.",
    verifiee: true,
  },
  wp_huillard: {
    url: 'https://en.wikipedia.org/wiki/Xavier_Huillard',
    titre: 'Xavier Huillard — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "PDG de Vinci depuis 2010, X-Ponts ; lead director et président du comité des " +
      "nominations et de la gouvernance d'Air Liquide.",
    verifiee: true,
  },
  wp_guillouard: {
    url: 'https://en.wikipedia.org/wiki/Catherine_Guillouard',
    titre: 'Catherine Guillouard — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "PDG de la RATP (2017-2022), administratrice Airbus ; présidente du comité d'audit " +
      "d'Air Liquide depuis mai 2023.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002). aRef / bRef = wikidataId des entités.
// typeLienCode ADMINISTRATEUR (id 34) ou DIRIGEANT selon le rôle.
// ---------------------------------------------------------------------------

const LIENS = [
  // ══════════════════════════════════════════════════════
  // TotalEnergies
  // ══════════════════════════════════════════════════════

  {
    // Patrick Pouyanné — PDG (administrateur + dirigeant exécutif)
    aType: 'personne',
    aRef: 'Q18342983',
    bType: 'organisation',
    bRef: 'Q154037',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Patrick Pouyanné est administrateur et PDG de TotalEnergies depuis le 29 mai 2015 " +
      "(mandat renouvelé jusqu'en 2027). Montants URD 2024 disponibles sur totalenergies.com.",
    dateDebut: new Date('2015-05-29'),
    dateFin: null,
    sourceRef: 'gov_total',
  },
  {
    aType: 'personne',
    aRef: 'Q18342983',
    bType: 'organisation',
    bRef: 'Q154037',
    typeLienCode: 'DIRIGEANT',
    description:
      "Patrick Pouyanné est PDG (président-directeur général) de TotalEnergies depuis " +
      "octobre 2014, succédant à Christophe de Margerie décédé en fonction.",
    dateDebut: new Date('2014-10-22'),
    dateFin: null,
    sourceRef: 'wp_pouyanne',
  },
  {
    // Jacques Aschenbroich — administrateur référent de TotalEnergies
    aType: 'personne',
    aRef: 'Q3158153',
    bType: 'organisation',
    bRef: 'Q154037',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Jacques Aschenbroich est administrateur référent (lead independent director) de " +
      "TotalEnergies depuis le 28 mai 2021, mandat renouvelé jusqu'en 2027. " +
      "Préside le comité de gouvernance et d'éthique.",
    dateDebut: new Date('2021-05-28'),
    dateFin: null,
    sourceRef: 'gov_total',
  },
  {
    // Marie-Christine Coisne-Roquette — administratrice la plus ancienne
    aType: 'personne',
    aRef: 'Q29642685',
    bType: 'organisation',
    bRef: 'Q154037',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Marie-Christine Coisne-Roquette est administratrice de TotalEnergies depuis le " +
      "13 mai 2011, mandat renouvelé jusqu'en 2029. Doyenne du conseil.",
    dateDebut: new Date('2011-05-13'),
    dateFin: null,
    sourceRef: 'gov_total',
  },
  {
    // Slawomir Krupa — administrateur indépendant depuis mai 2026
    aType: 'personne',
    aRef: 'Q116865148',
    bType: 'organisation',
    bRef: 'Q154037',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Slawomir Krupa, DG de la Société Générale, est nommé administrateur indépendant de " +
      "TotalEnergies lors de l'AGM du 29 mai 2026 (mandat jusqu'en 2029).",
    dateDebut: new Date('2026-05-29'),
    dateFin: null,
    sourceRef: 'gov_total',
  },

  // ══════════════════════════════════════════════════════
  // BNP Paribas
  // ══════════════════════════════════════════════════════

  {
    // Jean Lemierre — président du CA
    aType: 'personne',
    aRef: 'Q729859',
    bType: 'organisation',
    bRef: 'Q499707',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Jean Lemierre est président du conseil d'administration de BNP Paribas depuis le " +
      "1er décembre 2014 (administrateur depuis 2012). Jetons de présence : part fixe " +
      "annuelle ~17 000 € + part variable selon présence, selon URD BNP Paribas 2024.",
    dateDebut: new Date('2014-12-01'),
    dateFin: null,
    sourceRef: 'rem_bnp',
  },
  {
    // Jean-Laurent Bonnafé — DG (administrateur + dirigeant exécutif)
    aType: 'personne',
    aRef: 'Q239216',
    bType: 'organisation',
    bRef: 'Q499707',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Jean-Laurent Bonnafé est administrateur et directeur général de BNP Paribas depuis " +
      "le 1er décembre 2011. Jetons de présence 2024 compris dans sa rémunération totale " +
      "de mandataire social (voir document rémunération BNP 2024).",
    dateDebut: new Date('2011-12-01'),
    dateFin: null,
    sourceRef: 'rem_bnp',
  },
  {
    aType: 'personne',
    aRef: 'Q239216',
    bType: 'organisation',
    bRef: 'Q499707',
    typeLienCode: 'DIRIGEANT',
    description:
      "Jean-Laurent Bonnafé est directeur général de BNP Paribas depuis le 1er décembre " +
      "2011, au sein d'une gouvernance dissociée (président du CA : Jean Lemierre).",
    dateDebut: new Date('2011-12-01'),
    dateFin: null,
    sourceRef: 'wp_bonnafe',
  },
  {
    // Jacques Aschenbroich — administrateur BNP Paribas (INTERLOCK avec TotalEnergies)
    aType: 'personne',
    aRef: 'Q3158153',
    bType: 'organisation',
    bRef: 'Q499707',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Jacques Aschenbroich est administrateur indépendant de BNP Paribas depuis 2023 et " +
      "préside le comité de gouvernance, d'éthique et des nominations. INTERLOCK : siège " +
      "simultanément au conseil de TotalEnergies (depuis 2021).",
    dateDebut: new Date('2023-01-01'),
    dateFin: null,
    sourceRef: 'gov_bnp',
  },
  {
    // Pierre-André de Chalendar — administrateur indépendant
    aType: 'personne',
    aRef: 'Q1518898',
    bType: 'organisation',
    bRef: 'Q499707',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Pierre-André de Chalendar est administrateur indépendant de BNP Paribas depuis 2021. " +
      "Jetons de présence 2024 : fourchette 17 000 à 130 000 € selon présence et comités, " +
      "selon politique de rémunération BNP Paribas 2024.",
    dateDebut: new Date('2021-05-18'),
    dateFin: null,
    sourceRef: 'rem_bnp',
  },

  // ══════════════════════════════════════════════════════
  // Sanofi
  // ══════════════════════════════════════════════════════

  {
    // Frédéric Oudéa — président du CA
    aType: 'personne',
    aRef: 'Q984266',
    bType: 'organisation',
    bRef: 'Q158205',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Frédéric Oudéa est président du conseil d'administration de Sanofi depuis le " +
      "25 mai 2023 (mandat jusqu'en 2027), succédant à Serge Weinberg.",
    dateDebut: new Date('2023-05-25'),
    dateFin: null,
    sourceRef: 'gov_sanofi',
  },
  {
    // Belén Garijo — DG (administratrice + dirigeante exécutive depuis AGM 2026)
    aType: 'personne',
    aRef: 'Q27882872',
    bType: 'organisation',
    bRef: 'Q158205',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Belén Garijo est administratrice et directrice générale de Sanofi depuis l'AGM du " +
      "29 avril 2026 (mandat jusqu'en 2030), remplaçant Paul Hudson écarté par le conseil.",
    dateDebut: new Date('2026-04-29'),
    dateFin: null,
    sourceRef: 'pr_garijo',
  },
  {
    aType: 'personne',
    aRef: 'Q27882872',
    bType: 'organisation',
    bRef: 'Q158205',
    typeLienCode: 'DIRIGEANT',
    description:
      "Belén Garijo est directrice générale de Sanofi depuis mai 2026 au sein d'une " +
      "gouvernance dissociée (présidente du CA non-exécutif : Frédéric Oudéa).",
    dateDebut: new Date('2026-05-01'),
    dateFin: null,
    sourceRef: 'pr_garijo',
  },
  {
    // Clotilde Delbos — administratrice indépendante (INTERLOCK avec AXA)
    aType: 'personne',
    aRef: 'Q48441071',
    bType: 'organisation',
    bRef: 'Q158205',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Clotilde Delbos est administratrice indépendante de Sanofi depuis l'AGM du " +
      "30 avril 2024 (mandat jusqu'en 2027). INTERLOCK : siège simultanément au conseil " +
      "d'AXA depuis 2021.",
    dateDebut: new Date('2024-04-30'),
    dateFin: null,
    sourceRef: 'wp_delbos',
  },

  // ══════════════════════════════════════════════════════
  // AXA
  // ══════════════════════════════════════════════════════

  {
    // Antoine Gosset-Grainville — président du CA
    aType: 'personne',
    aRef: 'Q2854012',
    bType: 'organisation',
    bRef: 'Q160054',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Antoine Gosset-Grainville est président du conseil d'administration d'AXA depuis le " +
      "28 avril 2022, renouvelé à l'AG 2025. Gouvernance dissociée (DG : Thomas Buberl).",
    dateDebut: new Date('2022-04-28'),
    dateFin: null,
    sourceRef: 'gov_axa',
  },
  {
    // Thomas Buberl — DG (administrateur + dirigeant exécutif)
    aType: 'personne',
    aRef: 'Q23560320',
    bType: 'organisation',
    bRef: 'Q160054',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Thomas Buberl est administrateur et directeur général d'AXA depuis le 1er " +
      "septembre 2016, reconduit dans ses fonctions à l'AGM d'avril 2025.",
    dateDebut: new Date('2016-09-01'),
    dateFin: null,
    sourceRef: 'gov_axa',
  },
  {
    aType: 'personne',
    aRef: 'Q23560320',
    bType: 'organisation',
    bRef: 'Q160054',
    typeLienCode: 'DIRIGEANT',
    description:
      "Thomas Buberl est directeur général d'AXA depuis le 1er septembre 2016, succédant " +
      "à Henri de Castries. La gouvernance est dissociée depuis cette date.",
    dateDebut: new Date('2016-09-01'),
    dateFin: null,
    sourceRef: 'wp_buberl',
  },
  {
    // Guillaume Faury — administrateur indépendant
    aType: 'personne',
    aRef: 'Q33158035',
    bType: 'organisation',
    bRef: 'Q160054',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Guillaume Faury, PDG d'Airbus, est administrateur indépendant d'AXA depuis " +
      "avril 2021. Il préside le comité de rémunération, de gouvernance et du développement " +
      "durable.",
    dateDebut: new Date('2021-04-22'),
    dateFin: null,
    sourceRef: 'gov_axa',
  },
  {
    // Ramon Fernandez — administrateur indépendant
    aType: 'personne',
    aRef: 'Q3418520',
    bType: 'organisation',
    bRef: 'Q160054',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Ramon Fernandez, ancien directeur général du Trésor et DGE d'Orange, est " +
      "administrateur indépendant d'AXA depuis 2021.",
    dateDebut: new Date('2021-04-22'),
    dateFin: null,
    sourceRef: 'gov_axa',
  },
  {
    // Clotilde Delbos — administratrice indépendante (INTERLOCK avec Sanofi)
    aType: 'personne',
    aRef: 'Q48441071',
    bType: 'organisation',
    bRef: 'Q160054',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Clotilde Delbos est administratrice indépendante d'AXA depuis 2021. INTERLOCK : " +
      "siège simultanément au conseil de Sanofi depuis avril 2024.",
    dateDebut: new Date('2021-04-22'),
    dateFin: null,
    sourceRef: 'wp_delbos',
  },

  // ══════════════════════════════════════════════════════
  // Air Liquide
  // ══════════════════════════════════════════════════════

  {
    // Benoît Potier — président du CA (non-exécutif depuis juin 2022)
    aType: 'personne',
    aRef: 'Q3622',
    bType: 'organisation',
    bRef: 'Q407448',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Benoît Potier est président non-exécutif du conseil d'administration d'Air Liquide " +
      "depuis le 1er juin 2022. Administrateur depuis 1997 et PDG de 2006 à 2022.",
    dateDebut: new Date('2022-06-01'),
    dateFin: null,
    sourceRef: 'wp_potier',
  },
  {
    // François Jackow — DG (administrateur + dirigeant exécutif)
    aType: 'personne',
    aRef: 'Q33110014',
    bType: 'organisation',
    bRef: 'Q407448',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "François Jackow est administrateur et directeur général d'Air Liquide depuis le " +
      "1er juin 2022, succédant à Benoît Potier dans les fonctions exécutives.",
    dateDebut: new Date('2022-06-01'),
    dateFin: null,
    sourceRef: 'gov_airliquide',
  },
  {
    aType: 'personne',
    aRef: 'Q33110014',
    bType: 'organisation',
    bRef: 'Q407448',
    typeLienCode: 'DIRIGEANT',
    description:
      "François Jackow est directeur général d'Air Liquide depuis le 1er juin 2022. " +
      "La gouvernance est dissociée : Benoît Potier préside le CA de façon non-exécutive.",
    dateDebut: new Date('2022-06-01'),
    dateFin: null,
    sourceRef: 'gov_airliquide',
  },
  {
    // Xavier Huillard — administrateur référent (lead director)
    aType: 'personne',
    aRef: 'Q731462',
    bType: 'organisation',
    bRef: 'Q407448',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Xavier Huillard, PDG de Vinci, est administrateur référent (lead independent " +
      "director) d'Air Liquide et préside le comité des nominations et de la gouvernance.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'guide_airliquide',
  },
  {
    // Aiman Ezzat — administrateur indépendant depuis mai 2021
    aType: 'personne',
    aRef: 'Q33236908',
    bType: 'organisation',
    bRef: 'Q407448',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Aiman Ezzat, DG de Capgemini, est administrateur indépendant d'Air Liquide depuis " +
      "le 4 mai 2021.",
    dateDebut: new Date('2021-05-04'),
    dateFin: null,
    sourceRef: 'gov_airliquide',
  },
  {
    // Catherine Guillouard — administratrice indépendante, présidente comité audit
    aType: 'personne',
    aRef: 'Q33249018',
    bType: 'organisation',
    bRef: 'Q407448',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Catherine Guillouard, ancienne PDG de la RATP, est administratrice indépendante " +
      "d'Air Liquide depuis mai 2023 et préside le comité d'audit et des comptes.",
    dateDebut: new Date('2023-05-02'),
    dateFin: null,
    sourceRef: 'wp_guillouard',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents — recopiés verbatim de seed-macron-v2.js
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-cac40] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-cac40] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données CAC 40 pilote précédentes...')
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
  console.log(`\n┌─ seed-cac40-pilote — Conseils d'administration CAC 40 (5 sociétés) ─┐\n`)
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
  console.log(`│ Personnes     : ${PERSONNES.length}`)
  console.log(`│   dont INTERLOCK Aschenbroich (Q3158153) : TotalEnergies + BNP Paribas`)
  console.log(`│   dont INTERLOCK Delbos (Q48441071)      : AXA + Sanofi`)
  console.log(`│ Organisations : ${ORGANISATIONS.length} (TotalEnergies, BNP Paribas, Sanofi, AXA, Air Liquide)`)
  console.log(`│ Sources       : ${Object.keys(SOURCES).length}`)
  console.log(`│ Liens         : ${LIENS.length} (ADMINISTRATEUR + DIRIGEANT)`)
  console.log('└───────────────────────────────────────────────────────────────────────┘')
  console.log('\nAdministrateurs exclus (sans wikidataId vérifié) — à traiter au scale-out :')
  console.log('  TotalEnergies : Lise Croteau, Marie-Ange Debon, Valérie Della Puppa-Tibi,')
  console.log('    Romain Garcia-Ivaldi, Glenn Hubbard, Anelise Lara, Helen Lee Bouygues,')
  console.log('    Laurent Mignon, Dierk Paskert, Angel Pobo (10)')
  console.log('  BNP Paribas   : Juliette Brisac, Monique Cohen, Hugues Epaillard,')
  console.log('    Marion Guillou, Vanessa Lepoultier, Lieve Logghe, Marie-Christine Lombard')
  console.log('    et autres représentants salariés (~7+)')
  console.log('  Sanofi        : Christophe Babule, Humberto De Sousa, Rachel Duan,')
  console.log('    Carole Ferrand, Christel Heydemann, Lise Kingo, Jean-Paul Kress,')
  console.log('    Wolfgang Laux, Barbara Lavernos, Anne-Françoise Nesmes, John Sundy,')
  console.log('    Emile Voest, Antoine Yver (13)')
  console.log('  AXA           : Martine Bièvre, Helen Browne, Philomena Colatrella,')
  console.log('    Bettina Cramm, Gérald Harlin, Angelien Kemna, Rachel Picard,')
  console.log('    Ewout Steenbergen, Marie-France Tschudin (9)')
  console.log('  Air Liquide   : Philippe Dubrulle, Bertrand Dumazy, Christina Law,')
  console.log('    Kim Ann Mink, Alexis Perakis-Valat, Michael H. Thaman, Fatima Tighlaline,')
  console.log('    Monica de Virgiliis, Annette Winkler (9)')
  console.log('\n')
}

main()
  .catch((err) => {
    console.error('[seed-cac40] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
