/**
 * Seed Grandes Écoles — noblesse d'État française.
 *
 * 9 établissements + 18 alumni emblématiques illustrant le réseau de pouvoir.
 * Périmètre : présidents de la République, Premiers ministres, PDG CAC 40.
 *
 * Q-ids écoles vérifiés via Wikidata wbsearchentities (2026-07-01) :
 *   Polytechnique Q273604 · Sciences Po Q859363 · HEC Q273535 · ENS Ulm Q83259
 *   ENA Q273579 · INSP Q109039648 · Ponts Q273523 · Mines Paris Q1189954 · ESSEC Q273642
 *
 * Q-ids personnes vérifiés via Special:EntityData (2026-07-01) :
 *   Hollande Q157 · Chirac Q2105 · VGE Q2124 · Jospin Q187099 · Rocard Q30737920
 *   Villepin Q131660 · Royal Q81923 · Arnault Q32055 · Pompidou Q2185
 *   Ghosn Q356719 · Breton Q2142823
 *   (Macron Q3052772, Attal Q30339350, Barrot Q30339198, Amiel Q47502155,
 *    Lecornu Q20089181, Lescure Q30130489, Haddad Q112572505 — déjà en base)
 *
 * Garde-fous (ADR-006 / ADR-010) :
 *   - statut EN_ATTENTE sur toutes les entités — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - upsertPersonne : create-only (ne pas écraser seed-macron-v2)
 *   - upsertOrganisation : upsert normal (écoles nouvelles)
 *   - idempotent (résolution par wikidataId)
 *
 * Nécessite : npm run db:seed:demo (user admin remi@reseauxinfluences.fr).
 * Compatible avec seed-macron-v2.js (personnes déjà en base référencées par wikidataId).
 *
 * Usage :
 *   cd backend && node bin/seed-grandes-ecoles.js
 *   cd backend && node bin/seed-grandes-ecoles.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// WikidataIds des alumni NOUVEAUX dans ce seed (pas issus de seed-macron-v2).
// Utilisé par la fonction reset pour ne supprimer que ce que CE seed a créé.
const NOUVEAUX_ALUMNI_WIKIDATA = new Set([
  'Q157',       // François Hollande
  'Q2105',      // Jacques Chirac
  'Q2124',      // Valéry Giscard d'Estaing
  'Q187099',    // Lionel Jospin
  'Q30737920',  // Michel Rocard
  'Q131660',    // Dominique de Villepin
  'Q81923',     // Ségolène Royal
  'Q32055',     // Bernard Arnault
  'Q2185',      // Georges Pompidou
  'Q356719',    // Carlos Ghosn
  'Q2142823',   // Thierry Breton
])

// ---------------------------------------------------------------------------
// PERSONNES — 7 déjà en base (macron-v2) + 11 nouvelles.
// upsertPersonne est create-only : si la personne existe déjà, elle est
// retournée telle quelle sans mise à jour (évite d'écraser macron-v2).
// ---------------------------------------------------------------------------

const PERSONNES = [
  // ── Déjà en base (seed-macron-v2) — inclus pour autonomie du seed ──────

  {
    // Sources : Wikidata Q3052772 + Wikipédia FR (Sciences Po 2001, ENA promo Léon Blum 2004)
    nom: 'Macron',
    prenom: 'Emmanuel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1977-12-21'),
    lieuNaissance: 'Amiens (Somme)',
    rolePrincipal: 'Président de la République française',
    rolesSecondaires: [
      "diplômé de Sciences Po Paris",
      "énarque (promo Léon Blum, 2004)",
    ],
    bio:
      "Président de la République depuis le 14 mai 2017. Diplômé de Sciences Po Paris et " +
      "ancien élève de l'ENA (promo Léon Blum, 2004). Ancien inspecteur des finances et banquier Rothschild.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Emmanuel_Macron',
    wikidataId: 'Q3052772',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30339350 + Wikipédia FR (Sciences Po Paris, IEP)
    nom: 'Attal',
    prenom: 'Gabriel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1989-03-16'),
    lieuNaissance: 'Clamart (Hauts-de-Seine)',
    rolePrincipal: 'Secrétaire général de Renaissance',
    rolesSecondaires: [
      "diplômé de Sciences Po Paris",
      'ancien Premier ministre (janv.-sept. 2024)',
    ],
    bio:
      "Plus jeune Premier ministre de la Ve République (janvier-septembre 2024). " +
      "Diplômé de Sciences Po Paris, secrétaire général de Renaissance depuis décembre 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Gabriel_Attal',
    wikidataId: 'Q30339350',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30339198 + Wikipédia FR (HEC Paris + Sciences Po + doctorat Polytechnique)
    nom: 'Barrot',
    prenom: 'Jean-Noël',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1983-05-13'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Ministre de l'Europe et des Affaires étrangères",
    rolesSecondaires: [
      'diplômé de HEC Paris',
      'diplômé de Sciences Po Paris',
      'docteur en économie',
    ],
    bio:
      "Ministre de l'Europe et des Affaires étrangères depuis septembre 2024. " +
      "Économiste formé à HEC Paris et Sciences Po, docteur en économie. Ancien professeur associé au MIT Sloan.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-No%C3%ABl_Barrot',
    wikidataId: 'Q30339198',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q47502155 + Wikipédia FR (ENS Ulm, normalien + Princeton)
    nom: 'Amiel',
    prenom: 'David',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1992-11-28'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Ministre de l'Action et des Comptes publics",
    rolesSecondaires: [
      'normalien (ENS Ulm)',
      'diplômé de Princeton University',
    ],
    bio:
      "Normalien (ENS Ulm) et diplômé de Princeton. Ancien conseiller à l'Élysée (2017-2019), " +
      "ministre de l'Action et des Comptes publics depuis le 22 février 2026.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/David_Amiel',
    wikidataId: 'Q47502155',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q20089181 + Wikipédia FR (Sciences Po Paris + ENA promo Jean de La Fontaine 2013)
    nom: 'Lecornu',
    prenom: 'Sébastien',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1986-06-11'),
    lieuNaissance: "Éaubonne (Val-d'Oise)",
    rolePrincipal: 'Premier ministre de la France',
    rolesSecondaires: [
      'diplômé de Sciences Po Paris',
      "énarque (promo Jean de La Fontaine, 2013)",
    ],
    bio:
      "Premier ministre depuis le 9 septembre 2025. Diplômé de Sciences Po Paris " +
      "et énarque (promo Jean de La Fontaine, 2013). Ancien ministre des Armées (2022-2025).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/S%C3%A9bastien_Lecornu',
    wikidataId: 'Q20089181',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30130489 + Wikipédia FR (HEC Paris, économiste)
    nom: 'Lescure',
    prenom: 'Roland',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-11-26'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Ministre de l'Économie et des Finances",
    rolesSecondaires: [
      'diplômé de HEC Paris',
      'ancien directeur financier Caisse de dépôt du Québec',
    ],
    bio:
      "Ministre de l'Économie depuis le 12 octobre 2025. Diplômé de HEC Paris, " +
      "il a dirigé la gestion des actifs de la Caisse de dépôt et placement du Québec avant 2017.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Roland_Lescure',
    wikidataId: 'Q30130489',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q112572505 + Wikipédia FR (Sciences Po Paris + Columbia University)
    nom: 'Haddad',
    prenom: 'Benjamin',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1985-10-23'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Ministre délégué chargé de l'Europe",
    rolesSecondaires: [
      'diplômé de Sciences Po Paris',
      "ancien chercheur à l'Atlantic Council (Washington)",
    ],
    bio:
      "Ministre délégué à l'Europe. Diplômé de Sciences Po Paris. " +
      "Ancien chercheur au centre Europe de l'Atlantic Council à Washington avant son élection comme député de Paris en 2022.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Benjamin_Haddad',
    wikidataId: 'Q112572505',
    qualiteInfluence: 'ELU',
  },

  // ── Nouveaux alumni (non encore en base) ────────────────────────────────

  {
    // Sources : Wikidata Q157 + Wikipédia FR (HEC Paris + Sciences Po Paris + ENA promo Voltaire 1980)
    nom: 'Hollande',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1954-08-12'),
    lieuNaissance: 'Rouen (Seine-Maritime)',
    rolePrincipal: 'Ancien président de la République française (2012-2017)',
    rolesSecondaires: [
      'diplômé de HEC Paris',
      'diplômé de Sciences Po Paris',
      "énarque (promo Voltaire, 1980)",
      'premier secrétaire du Parti socialiste (1997-2008)',
    ],
    bio:
      "Président de la République du 15 mai 2012 au 14 mai 2017. " +
      "Triple couronné : HEC Paris, Sciences Po Paris et ENA (promo Voltaire, 1980). " +
      "Premier secrétaire du PS de 1997 à 2008.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Hollande',
    wikidataId: 'Q157',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2105 + Wikipédia FR (Sciences Po Paris + ENA promo Vauban 1959)
    nom: 'Chirac',
    prenom: 'Jacques',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1932-11-29'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Ancien président de la République française (1995-2007)',
    rolesSecondaires: [
      'diplômé de Sciences Po Paris',
      "énarque (promo Vauban, 1959)",
      'ancien Premier ministre (1974-1976, 1986-1988)',
      'fondateur du RPR',
    ],
    bio:
      "Président de la République de 1995 à 2007. Diplômé de Sciences Po Paris " +
      "et énarque (promo Vauban, 1959). Deux fois Premier ministre, fondateur du RPR. " +
      "Décédé le 26 septembre 2019.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jacques_Chirac',
    wikidataId: 'Q2105',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2124 + Wikipédia FR (École polytechnique promo 1944 + ENA promo Félix Éboué 1954)
    nom: "Giscard d'Estaing",
    prenom: 'Valéry',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1926-02-02'),
    lieuNaissance: 'Coblence (Allemagne)',
    rolePrincipal: 'Ancien président de la République française (1974-1981)',
    rolesSecondaires: [
      'polytechnicien (promo 1944)',
      "énarque (promo Félix Éboué, 1954)",
      "fondateur de l'UDF",
      "membre de l'Académie française",
    ],
    bio:
      "Président de la République de 1974 à 1981. Polytechnicien (promo 1944) " +
      "et énarque (promo Félix Éboué, 1954). Fondateur de l'UDF, il a fait adopter " +
      "la loi Veil (IVG) et la majorité à 18 ans. Académie française. Décédé le 2 décembre 2020.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Val%C3%A9ry_Giscard_d%27Estaing',
    wikidataId: 'Q2124',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q187099 + Wikipédia FR (Sciences Po Paris + ENA promo Senghor 1970)
    nom: 'Jospin',
    prenom: 'Lionel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1937-07-12'),
    lieuNaissance: 'Meudon (Hauts-de-Seine)',
    rolePrincipal: 'Ancien Premier ministre de la France (1997-2002)',
    rolesSecondaires: [
      'diplômé de Sciences Po Paris',
      "énarque (promo Senghor, 1970)",
      'premier secrétaire du PS (1981-1988, 1995-1997)',
    ],
    bio:
      "Premier ministre de 1997 à 2002. Diplômé de Sciences Po Paris " +
      "et énarque (promo Senghor, 1970). Premier secrétaire du PS à deux reprises. " +
      "Candidat à la présidentielle 2002, éliminé au premier tour.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Lionel_Jospin',
    wikidataId: 'Q187099',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30737920 + Wikipédia FR (Sciences Po Paris + ENA, années 1950)
    nom: 'Rocard',
    prenom: 'Michel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1930-08-23'),
    lieuNaissance: 'Courbevoie (Hauts-de-Seine)',
    rolePrincipal: 'Ancien Premier ministre de la France (1988-1991)',
    rolesSecondaires: [
      'diplômé de Sciences Po Paris',
      "énarque (années 1950)",
      'eurodéputé socialiste (1994-2009)',
    ],
    bio:
      "Premier ministre de 1988 à 1991 sous François Mitterrand. " +
      "Diplômé de Sciences Po Paris et de l'ENA. Figure du courant rocardien au sein du PS. " +
      "Décédé le 2 juillet 2016.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Michel_Rocard',
    wikidataId: 'Q30737920',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q131660 + Wikipédia FR (Sciences Po Paris + ENA promo Voltaire 1980)
    nom: 'de Villepin',
    prenom: 'Dominique',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1953-11-14'),
    lieuNaissance: 'Rabat (Maroc)',
    rolePrincipal: 'Ancien Premier ministre de la France (2005-2007)',
    rolesSecondaires: [
      'diplômé de Sciences Po Paris',
      "énarque (promo Voltaire, 1980)",
      'ancien ministre des Affaires étrangères (2002-2004)',
    ],
    bio:
      "Premier ministre de 2005 à 2007. Diplômé de Sciences Po Paris " +
      "et énarque (promo Voltaire, 1980). Ministre des Affaires étrangères de 2002 à 2004, " +
      "connu pour son discours contre la guerre en Irak à l'ONU en février 2003.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Dominique_de_Villepin',
    wikidataId: 'Q131660',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q81923 + Wikipédia FR (Sciences Po Paris + ENA promo Voltaire 1980)
    nom: 'Royal',
    prenom: 'Ségolène',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1953-09-22'),
    lieuNaissance: 'Dakar (Sénégal)',
    rolePrincipal: 'Ancienne candidate PS à la présidentielle 2007',
    rolesSecondaires: [
      'diplômée de Sciences Po Paris',
      "énarque (promo Voltaire, 1980)",
      'ancienne présidente de Poitou-Charentes (2004-2014)',
      "ancienne ministre de l'Écologie (2014-2017)",
    ],
    bio:
      "Candidate socialiste à la présidentielle 2007. Diplômée de Sciences Po Paris " +
      "et énarque (promo Voltaire, 1980, même promotion que Hollande et Villepin). " +
      "Présidente de la région Poitou-Charentes de 2004 à 2014.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/S%C3%A9gol%C3%A8ne_Royal',
    wikidataId: 'Q81923',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q32055 + Wikipédia FR (École polytechnique, promo 1969, diplômé 1971)
    nom: 'Arnault',
    prenom: 'Bernard',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1949-03-05'),
    lieuNaissance: 'Roubaix (Nord)',
    rolePrincipal: 'Président-directeur général de LVMH',
    rolesSecondaires: [
      'polytechnicien (promo 1969, diplômé 1971)',
      'première ou deuxième fortune mondiale (Forbes 2023-2024)',
    ],
    bio:
      "PDG de LVMH, premier groupe mondial du luxe. Polytechnicien (promo 1969, diplômé 1971), " +
      "il construit son empire à partir de l'acquisition de Christian Dior en 1984. " +
      "Classé première ou deuxième fortune mondiale par Forbes.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bernard_Arnault',
    wikidataId: 'Q32055',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q2185 + Wikipédia FR (ENS Ulm, agrégé de lettres 1934)
    nom: 'Pompidou',
    prenom: 'Georges',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1911-07-05'),
    lieuNaissance: 'Montboudif (Cantal)',
    rolePrincipal: 'Ancien président de la République française (1969-1974)',
    rolesSecondaires: [
      "normalien (ENS Ulm, agrégé de lettres, 1934)",
      'ancien Premier ministre de De Gaulle (1962-1968)',
      'ancien directeur général de la banque Rothschild',
    ],
    bio:
      "Président de la République du 20 juin 1969 jusqu'à sa mort le 2 avril 1974. " +
      "Normalien (ENS Ulm, agrégé de lettres classiques, 1934), professeur de lettres, " +
      "puis directeur général chez Rothschild Frères. Premier ministre de De Gaulle de 1962 à 1968.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Georges_Pompidou',
    wikidataId: 'Q2185',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q356719 + Wikipédia FR (Polytechnique promo 1974 + Mines Paris 1981)
    // Statut judiciaire : condamné au Japon pour fraudes financières (2023). Présomption d'innocence levée.
    nom: 'Ghosn',
    prenom: 'Carlos',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1954-03-09'),
    lieuNaissance: 'Porto Velho (Brésil)',
    rolePrincipal: 'Ancien PDG de Renault-Nissan-Mitsubishi (2001-2019)',
    rolesSecondaires: [
      'polytechnicien (promo 1974)',
      'diplômé de Mines Paris (corps des mines, 1981)',
      'condamné au Japon pour fraudes financières (2023)',
    ],
    bio:
      "Ancien PDG de Renault (2005-2019) et Nissan (2001-2018). Polytechnicien (promo 1974) " +
      "et diplômé de Mines Paris (ingénieur du corps des mines, 1981). " +
      "Arrêté au Japon en novembre 2018 pour fraudes financières, condamné en 2023. " +
      "Statut judiciaire : condamné — présomption d'innocence levée sur les faits retenus.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Carlos_Ghosn',
    wikidataId: 'Q356719',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q2142823 + Wikipédia FR (École polytechnique, promo 1978 approx.)
    nom: 'Breton',
    prenom: 'Thierry',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1955-01-15'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Ancien commissaire européen au Marché intérieur (2019-2024)",
    rolesSecondaires: [
      'polytechnicien',
      "ancien ministre de l'Économie (2004-2007)",
      'ancien PDG France Télécom, Thomson, Atos',
    ],
    bio:
      "Polytechnicien, Thierry Breton a dirigé successivement Thomson, France Télécom puis Atos. " +
      "Ministre de l'Économie sous Chirac/Villepin (2004-2007). " +
      "Commissaire européen au Marché intérieur de 2019 à septembre 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Thierry_Breton',
    wikidataId: 'Q2142823',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — 9 grandes écoles (Q-ids vérifiés 2026-07-01).
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q273604 + Wikipédia FR
    nom: 'École polytechnique',
    sigle: 'X',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.polytechnique.edu',
    description:
      "Grande école d'ingénieurs fondée en 1794, sous tutelle du ministère des Armées. " +
      "Surnommée « l'X », elle est l'une des institutions les plus sélectives de France. " +
      "Intégrée à l'Institut polytechnique de Paris depuis 2019. Vivier des grands corps de l'État.",
    dateCreation: new Date('1794-09-28'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89cole_polytechnique_(France)',
    wikidataId: 'Q273604',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q859363 + Wikipédia FR
    nom: 'Sciences Po Paris',
    sigle: 'IEP',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.sciencespo.fr',
    description:
      "Institut d'études politiques de Paris, fondé en 1872 sous le nom d'École libre des sciences politiques. " +
      "Principal vivier des élites politiques, administratives et économiques françaises. " +
      "14 000 étudiants (2024), campus international (Paris, Reims, Nancy, Menton, Le Havre, Poitiers).",
    dateCreation: new Date('1872-10-05'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Institut_d%27%C3%A9tudes_politiques_de_Paris',
    wikidataId: 'Q859363',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q273535 + Wikipédia FR
    nom: 'HEC Paris',
    sigle: 'HEC',
    typeOrganisation: 'AUTRE',
    pays: 'France',
    siteWeb: 'https://www.hec.edu',
    description:
      "École des hautes études commerciales de Paris, fondée en 1881 par la CCI Paris Île-de-France. " +
      "Première grande école de commerce française, régulièrement top 3 mondiale (FT European Business Schools). " +
      "Réseau d'anciens : 65 000 membres dans 130 pays.",
    dateCreation: new Date('1881-10-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/HEC_Paris',
    wikidataId: 'Q273535',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q83259 + Wikipédia FR
    nom: "École normale supérieure (Ulm)",
    sigle: 'ENS',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.ens.psl.eu',
    description:
      "Fondée en 1794, l'ENS Paris (rue d'Ulm) forme les chercheurs et universitaires d'excellence. " +
      "14 médailles Fields et 13 prix Nobel français parmi ses anciens élèves. " +
      "Intégrée à PSL University depuis 2019. Surnommée « Normale sup » ou « ENS Ulm ».",
    dateCreation: new Date('1794-10-30'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89cole_normale_sup%C3%A9rieure_(Paris)',
    wikidataId: 'Q83259',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q273579 + Wikipédia FR (fermée 2021, remplacée par INSP)
    nom: "École nationale d'administration",
    sigle: 'ENA',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "École créée le 9 octobre 1945 pour démocratiser l'accès aux hauts postes de la fonction publique. " +
      "Principal vivier des hauts fonctionnaires, préfets, ambassadeurs et politiques (« énarques »). " +
      "Fermée le 31 décembre 2021, remplacée par l'INSP (Institut national du service public) depuis le 1er janvier 2022.",
    dateCreation: new Date('1945-10-09'),
    dateFin: new Date('2021-12-31'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89cole_nationale_d%27administration_(France)',
    wikidataId: 'Q273579',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q109039648 + Wikipédia FR
    nom: 'Institut national du service public',
    sigle: 'INSP',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.insp.gouv.fr',
    description:
      "Successeur de l'ENA depuis le 1er janvier 2022 (décret du 2 décembre 2021). " +
      "Forme les hauts fonctionnaires de l'État français sur un nouveau modèle pédagogique. " +
      "Premier cycle à Strasbourg, second cycle à Paris.",
    dateCreation: new Date('2022-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Institut_national_du_service_public',
    wikidataId: 'Q109039648',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q273523 + Wikipédia FR
    nom: 'École des Ponts ParisTech',
    sigle: 'ENPC',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.ecoledesponts.fr',
    description:
      "Fondée en 1747 par Daniel-Charles Trudaine, la plus ancienne école d'ingénieurs du monde en activité. " +
      "Sous tutelle du ministère chargé des Transports, intégrée à ParisTech. " +
      "Forme les ingénieurs des ponts, des eaux et des forêts (IPEF), haut corps de l'État.",
    dateCreation: new Date('1747-02-14'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89cole_nationale_des_ponts_et_chauss%C3%A9es',
    wikidataId: 'Q273523',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1189954 + Wikipédia FR
    nom: 'Mines Paris – PSL',
    sigle: 'Mines Paris',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.minesparis.psl.eu',
    description:
      "Grande école d'ingénieurs fondée en 1783 par Louis XVI. L'une des plus sélectives de France, " +
      "elle forme les ingénieurs du corps des mines (IGM), hauts fonctionnaires et dirigeants d'entreprise. " +
      "Intégrée à PSL University depuis 2019 (anciennement Mines ParisTech).",
    dateCreation: new Date('1783-03-19'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Mines_Paris_-_PSL',
    wikidataId: 'Q1189954',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q273642 + Wikipédia FR
    nom: 'ESSEC Business School',
    sigle: 'ESSEC',
    typeOrganisation: 'AUTRE',
    pays: 'France',
    siteWeb: 'https://www.essec.edu',
    description:
      "École supérieure des sciences économiques et commerciales, fondée en 1907 par des jésuites. " +
      "L'une des grandes écoles de commerce françaises de référence. " +
      "Campus à Cergy-Pontoise, Paris La Défense, Singapour et Rabat. Environ 6 000 étudiants.",
    dateCreation: new Date('1907-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/ESSEC_Business_School',
    wikidataId: 'Q273642',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — une par personne (Wikipedia FR, source primaire des formations).
// dateConsultation 2026-07-01 (ADR-006 / contrainte seed).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_macron: {
    url: 'https://fr.wikipedia.org/wiki/Emmanuel_Macron',
    titre: 'Emmanuel Macron — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : Sciences Po Paris (diplômé 2001), ENA promo Léon Blum (diplômé 2004). " +
      "Wikidata P69 (educated at) : Q859363, Q273579.",
    verifiee: true,
  },
  wp_attal: {
    url: 'https://fr.wikipedia.org/wiki/Gabriel_Attal',
    titre: 'Gabriel Attal — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : Sciences Po Paris (IEP Paris, diplômé 2011). Wikidata P69 : Q859363.",
    verifiee: true,
  },
  wp_barrot: {
    url: 'https://fr.wikipedia.org/wiki/Jean-No%C3%ABl_Barrot',
    titre: 'Jean-Noël Barrot — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : HEC Paris + Sciences Po Paris, doctorat en économie. Wikidata P69 : Q273535, Q859363.",
    verifiee: true,
  },
  wp_amiel: {
    url: 'https://fr.wikipedia.org/wiki/David_Amiel',
    titre: 'David Amiel — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : ENS Ulm (normalien, diplômé ~2014). Wikidata P69 : Q83259.",
    verifiee: true,
  },
  wp_lecornu: {
    url: 'https://fr.wikipedia.org/wiki/S%C3%A9bastien_Lecornu',
    titre: 'Sébastien Lecornu — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : Sciences Po Paris + ENA promo Jean de La Fontaine (diplômé 2013). Wikidata P69 : Q859363, Q273579.",
    verifiee: true,
  },
  wp_lescure: {
    url: 'https://fr.wikipedia.org/wiki/Roland_Lescure',
    titre: 'Roland Lescure — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : HEC Paris (diplômé ~1991). Wikidata P69 : Q273535.",
    verifiee: true,
  },
  wp_haddad: {
    url: 'https://fr.wikipedia.org/wiki/Benjamin_Haddad',
    titre: 'Benjamin Haddad — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : Sciences Po Paris. Wikidata P69 : Q859363.",
    verifiee: true,
  },
  wp_hollande: {
    url: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Hollande',
    titre: 'François Hollande — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : HEC Paris + Sciences Po Paris + ENA promo Voltaire (1980). " +
      "Triple couronné. Wikidata P69 : Q273535, Q859363, Q273579.",
    verifiee: true,
  },
  wp_chirac: {
    url: 'https://fr.wikipedia.org/wiki/Jacques_Chirac',
    titre: 'Jacques Chirac — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : Sciences Po Paris + ENA promo Vauban (diplômé 1959). Wikidata P69 : Q859363, Q273579.",
    verifiee: true,
  },
  wp_vge: {
    url: 'https://fr.wikipedia.org/wiki/Val%C3%A9ry_Giscard_d%27Estaing',
    titre: "Valéry Giscard d'Estaing — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : École polytechnique (promo 1944) + ENA promo Félix Éboué (1954). " +
      "Wikidata P69 : Q273604, Q273579.",
    verifiee: true,
  },
  wp_jospin: {
    url: 'https://fr.wikipedia.org/wiki/Lionel_Jospin',
    titre: 'Lionel Jospin — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : Sciences Po Paris + ENA promo Senghor (diplômé 1970). Wikidata P69 : Q859363, Q273579.",
    verifiee: true,
  },
  wp_rocard: {
    url: 'https://fr.wikipedia.org/wiki/Michel_Rocard',
    titre: 'Michel Rocard — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : Sciences Po Paris + ENA (années 1950). Wikidata P69 : Q859363, Q273579.",
    verifiee: true,
  },
  wp_villepin: {
    url: 'https://fr.wikipedia.org/wiki/Dominique_de_Villepin',
    titre: 'Dominique de Villepin — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : Sciences Po Paris + ENA promo Voltaire (1980). Wikidata P69 : Q859363, Q273579.",
    verifiee: true,
  },
  wp_royal: {
    url: 'https://fr.wikipedia.org/wiki/S%C3%A9gol%C3%A8ne_Royal',
    titre: 'Ségolène Royal — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : Sciences Po Paris + ENA promo Voltaire (1980). Wikidata P69 : Q859363, Q273579.",
    verifiee: true,
  },
  wp_arnault: {
    url: 'https://fr.wikipedia.org/wiki/Bernard_Arnault',
    titre: 'Bernard Arnault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : École polytechnique (promo 1969, diplômé 1971). Wikidata P69 : Q273604.",
    verifiee: true,
  },
  wp_pompidou: {
    url: 'https://fr.wikipedia.org/wiki/Georges_Pompidou',
    titre: 'Georges Pompidou — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : ENS Ulm (normalien, agrégé de lettres classiques, 1934). Wikidata P69 : Q83259.",
    verifiee: true,
  },
  wp_ghosn: {
    url: 'https://fr.wikipedia.org/wiki/Carlos_Ghosn',
    titre: 'Carlos Ghosn — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : École polytechnique (promo 1974) + Mines Paris — corps des mines (diplômé 1981). " +
      "Wikidata P69 : Q273604, Q1189954.",
    verifiee: true,
  },
  wp_breton: {
    url: 'https://fr.wikipedia.org/wiki/Thierry_Breton',
    titre: 'Thierry Breton — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formation : École polytechnique (promo ~1978). Wikidata P69 : Q273604.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — tous de type 'academique' (personne→organisation/école).
// Référencement par wikidataId (résolution via trouverEntite).
// ---------------------------------------------------------------------------

const LIENS = [
  // ── Emmanuel Macron ─────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'organisation',
    bRef: 'Q859363',
    typeLienCode: 'academique',
    description: "Emmanuel Macron est diplômé de Sciences Po Paris (IEP Paris, ~2001).",
    dateDebut: new Date('1997-09-01'),
    dateFin: new Date('2001-06-30'),
    sourceRef: 'wp_macron',
  },
  {
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'organisation',
    bRef: 'Q273579',
    typeLienCode: 'academique',
    description: "Emmanuel Macron est ancien élève de l'ENA (promo Léon Blum, diplômé 2004).",
    dateDebut: new Date('2002-09-01'),
    dateFin: new Date('2004-06-30'),
    sourceRef: 'wp_macron',
  },

  // ── Gabriel Attal ───────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q30339350',
    bType: 'organisation',
    bRef: 'Q859363',
    typeLienCode: 'academique',
    description: "Gabriel Attal est diplômé de Sciences Po Paris (IEP Paris, ~2011).",
    dateDebut: new Date('2007-09-01'),
    dateFin: new Date('2011-06-30'),
    sourceRef: 'wp_attal',
  },

  // ── Jean-Noël Barrot ────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q30339198',
    bType: 'organisation',
    bRef: 'Q273535',
    typeLienCode: 'academique',
    description: "Jean-Noël Barrot est diplômé de HEC Paris (grande école de commerce).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_barrot',
  },
  {
    aType: 'personne',
    aRef: 'Q30339198',
    bType: 'organisation',
    bRef: 'Q859363',
    typeLienCode: 'academique',
    description: "Jean-Noël Barrot est diplômé de Sciences Po Paris.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_barrot',
  },

  // ── David Amiel ─────────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q47502155',
    bType: 'organisation',
    bRef: 'Q83259',
    typeLienCode: 'academique',
    description: "David Amiel est normalien (ENS Ulm, diplômé ~2014).",
    dateDebut: new Date('2010-09-01'),
    dateFin: new Date('2014-06-30'),
    sourceRef: 'wp_amiel',
  },

  // ── Sébastien Lecornu ───────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q20089181',
    bType: 'organisation',
    bRef: 'Q859363',
    typeLienCode: 'academique',
    description: "Sébastien Lecornu est diplômé de Sciences Po Paris.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_lecornu',
  },
  {
    aType: 'personne',
    aRef: 'Q20089181',
    bType: 'organisation',
    bRef: 'Q273579',
    typeLienCode: 'academique',
    description: "Sébastien Lecornu est ancien élève de l'ENA (promo Jean de La Fontaine, diplômé 2013).",
    dateDebut: new Date('2011-09-01'),
    dateFin: new Date('2013-06-30'),
    sourceRef: 'wp_lecornu',
  },

  // ── Roland Lescure ──────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q30130489',
    bType: 'organisation',
    bRef: 'Q273535',
    typeLienCode: 'academique',
    description: "Roland Lescure est diplômé de HEC Paris (~1991).",
    dateDebut: new Date('1988-09-01'),
    dateFin: new Date('1991-06-30'),
    sourceRef: 'wp_lescure',
  },

  // ── Benjamin Haddad ─────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q112572505',
    bType: 'organisation',
    bRef: 'Q859363',
    typeLienCode: 'academique',
    description: "Benjamin Haddad est diplômé de Sciences Po Paris.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_haddad',
  },

  // ── François Hollande ───────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q157',
    bType: 'organisation',
    bRef: 'Q273535',
    typeLienCode: 'academique',
    description: "François Hollande est diplômé de HEC Paris (triple couronné HEC-Sciences Po-ENA).",
    dateDebut: null,
    dateFin: new Date('1980-06-30'),
    sourceRef: 'wp_hollande',
  },
  {
    aType: 'personne',
    aRef: 'Q157',
    bType: 'organisation',
    bRef: 'Q859363',
    typeLienCode: 'academique',
    description: "François Hollande est diplômé de Sciences Po Paris.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_hollande',
  },
  {
    aType: 'personne',
    aRef: 'Q157',
    bType: 'organisation',
    bRef: 'Q273579',
    typeLienCode: 'academique',
    description: "François Hollande est ancien élève de l'ENA (promo Voltaire, diplômé 1980).",
    dateDebut: new Date('1978-09-01'),
    dateFin: new Date('1980-06-30'),
    sourceRef: 'wp_hollande',
  },

  // ── Jacques Chirac ──────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q2105',
    bType: 'organisation',
    bRef: 'Q859363',
    typeLienCode: 'academique',
    description: "Jacques Chirac est diplômé de Sciences Po Paris.",
    dateDebut: new Date('1954-09-01'),
    dateFin: new Date('1957-06-30'),
    sourceRef: 'wp_chirac',
  },
  {
    aType: 'personne',
    aRef: 'Q2105',
    bType: 'organisation',
    bRef: 'Q273579',
    typeLienCode: 'academique',
    description: "Jacques Chirac est ancien élève de l'ENA (promo Vauban, diplômé 1959).",
    dateDebut: new Date('1957-09-01'),
    dateFin: new Date('1959-06-30'),
    sourceRef: 'wp_chirac',
  },

  // ── Valéry Giscard d'Estaing ────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q2124',
    bType: 'organisation',
    bRef: 'Q273604',
    typeLienCode: 'academique',
    description: "Valéry Giscard d'Estaing est polytechnicien (promo 1944, diplômé 1948).",
    dateDebut: new Date('1944-09-01'),
    dateFin: new Date('1948-06-30'),
    sourceRef: 'wp_vge',
  },
  {
    aType: 'personne',
    aRef: 'Q2124',
    bType: 'organisation',
    bRef: 'Q273579',
    typeLienCode: 'academique',
    description: "Valéry Giscard d'Estaing est ancien élève de l'ENA (promo Félix Éboué, diplômé 1954).",
    dateDebut: new Date('1951-09-01'),
    dateFin: new Date('1954-06-30'),
    sourceRef: 'wp_vge',
  },

  // ── Lionel Jospin ───────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q187099',
    bType: 'organisation',
    bRef: 'Q859363',
    typeLienCode: 'academique',
    description: "Lionel Jospin est diplômé de Sciences Po Paris.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_jospin',
  },
  {
    aType: 'personne',
    aRef: 'Q187099',
    bType: 'organisation',
    bRef: 'Q273579',
    typeLienCode: 'academique',
    description: "Lionel Jospin est ancien élève de l'ENA (promo Senghor, diplômé 1970).",
    dateDebut: new Date('1968-09-01'),
    dateFin: new Date('1970-06-30'),
    sourceRef: 'wp_jospin',
  },

  // ── Michel Rocard ───────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q30737920',
    bType: 'organisation',
    bRef: 'Q859363',
    typeLienCode: 'academique',
    description: "Michel Rocard est diplômé de Sciences Po Paris.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_rocard',
  },
  {
    aType: 'personne',
    aRef: 'Q30737920',
    bType: 'organisation',
    bRef: 'Q273579',
    typeLienCode: 'academique',
    description: "Michel Rocard est ancien élève de l'ENA (années 1950).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_rocard',
  },

  // ── Dominique de Villepin ───────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q131660',
    bType: 'organisation',
    bRef: 'Q859363',
    typeLienCode: 'academique',
    description: "Dominique de Villepin est diplômé de Sciences Po Paris.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_villepin',
  },
  {
    aType: 'personne',
    aRef: 'Q131660',
    bType: 'organisation',
    bRef: 'Q273579',
    typeLienCode: 'academique',
    description: "Dominique de Villepin est ancien élève de l'ENA (promo Voltaire, 1980).",
    dateDebut: new Date('1978-09-01'),
    dateFin: new Date('1980-06-30'),
    sourceRef: 'wp_villepin',
  },

  // ── Ségolène Royal ──────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q81923',
    bType: 'organisation',
    bRef: 'Q859363',
    typeLienCode: 'academique',
    description: "Ségolène Royal est diplômée de Sciences Po Paris.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_royal',
  },
  {
    aType: 'personne',
    aRef: 'Q81923',
    bType: 'organisation',
    bRef: 'Q273579',
    typeLienCode: 'academique',
    description: "Ségolène Royal est ancienne élève de l'ENA (promo Voltaire, diplômée 1980).",
    dateDebut: new Date('1978-09-01'),
    dateFin: new Date('1980-06-30'),
    sourceRef: 'wp_royal',
  },

  // ── Bernard Arnault ─────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q32055',
    bType: 'organisation',
    bRef: 'Q273604',
    typeLienCode: 'academique',
    description: "Bernard Arnault est polytechnicien (promo 1969, diplômé 1971).",
    dateDebut: new Date('1969-09-01'),
    dateFin: new Date('1971-06-30'),
    sourceRef: 'wp_arnault',
  },

  // ── Georges Pompidou ────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q2185',
    bType: 'organisation',
    bRef: 'Q83259',
    typeLienCode: 'academique',
    description: "Georges Pompidou est normalien (ENS Ulm, agrégé de lettres classiques, 1934).",
    dateDebut: new Date('1931-09-01'),
    dateFin: new Date('1934-06-30'),
    sourceRef: 'wp_pompidou',
  },

  // ── Carlos Ghosn ────────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q356719',
    bType: 'organisation',
    bRef: 'Q273604',
    typeLienCode: 'academique',
    description: "Carlos Ghosn est polytechnicien (promo 1974, diplômé ~1978).",
    dateDebut: new Date('1974-09-01'),
    dateFin: new Date('1978-06-30'),
    sourceRef: 'wp_ghosn',
  },
  {
    aType: 'personne',
    aRef: 'Q356719',
    bType: 'organisation',
    bRef: 'Q1189954',
    typeLienCode: 'academique',
    description: "Carlos Ghosn est diplômé de Mines Paris (ingénieur du corps des mines, ~1981).",
    dateDebut: new Date('1978-09-01'),
    dateFin: new Date('1981-06-30'),
    sourceRef: 'wp_ghosn',
  },

  // ── Thierry Breton ──────────────────────────────────────────────────────
  {
    aType: 'personne',
    aRef: 'Q2142823',
    bType: 'organisation',
    bRef: 'Q273604',
    typeLienCode: 'academique',
    description: "Thierry Breton est polytechnicien (diplômé ~1978).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_breton',
  },
]

// ---------------------------------------------------------------------------
// Helpers (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-grandes-ecoles] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

// create-only : ne pas écraser les personnes issues de seed-macron-v2
async function upsertPersonne(data, userId) {
  const existing = await prisma.personne.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) return existing
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
    throw new Error(
      `[seed-grandes-ecoles] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('⚠ Suppression données Grandes Écoles précédentes...')

  // Supprimer uniquement les nouveaux alumni (pas ceux du corpus Macron)
  const nouveauxIds = [...NOUVEAUX_ALUMNI_WIKIDATA]
  const ecolesIds = ORGANISATIONS.map((o) => o.wikidataId)

  const nouvPersonnes = await prisma.personne.findMany({
    where: { wikidataId: { in: nouveauxIds } },
  })
  const ecoles = await prisma.organisation.findMany({
    where: { wikidataId: { in: ecolesIds } },
  })

  const idsP = nouvPersonnes.map((p) => p.id)
  const idsO = ecoles.map((o) => o.id)

  // Supprimer les liens (avant les entités, pour éviter les contraintes FK)
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
  console.log('✓ Données précédentes supprimées.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n\u250c\u2500 seed-grandes-ecoles \u2014 noblesse d'\u00c9tat fran\u00e7aise \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\n")
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`✓ User : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ✓ ${data.titre}`)
  }

  console.log('\n— Grandes écoles (Organisations) —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ✓ ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Alumni (Personnes) —')
  let nouvellesPersonnes = 0
  let existantes = 0
  for (const p of PERSONNES) {
    const avantCreation = await prisma.personne.findFirst({ where: { wikidataId: p.wikidataId } })
    const created = await upsertPersonne(p, user.id)
    if (avantCreation) {
      existantes++
      console.log(`  ~ ${created.prenom} ${created.nom} (${p.wikidataId}) — déjà en base`)
    } else {
      nouvellesPersonnes++
      console.log(`  ✓ ${created.prenom} ${created.nom} (${p.wikidataId}) — créé`)
    }
  }

  console.log('\n— Liens academique —')
  let liensTotal = 0
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    liensTotal++
    console.log(`  ✓ academique — ${lien.description.slice(0, 70)}...`)
  }

  const liensExistants = LIENS.filter((l) =>
    ['Q3052772', 'Q30339350', 'Q30339198', 'Q47502155', 'Q20089181', 'Q30130489', 'Q112572505'].includes(l.aRef),
  ).length

  console.log('\n┌─ Bilan ────────────────────────────────────────────────────────────┐')
  console.log(`│ Grandes écoles  : ${ORGANISATIONS.length} (X, Sciences Po, HEC, ENS, ENA, INSP, Ponts, Mines, ESSEC)`)
  console.log(`│ Personnes       : ${PERSONNES.length} total (${nouvellesPersonnes} nouvelles, ${existantes} déjà en base)`)
  console.log(`│ Sources         : ${Object.keys(SOURCES).length} (Wikipedia FR, Wikidata P69)`)
  console.log(`│ Liens academique: ${liensTotal} (dont ${liensExistants} vers personnes déjà en base)`)
  console.log('└────────────────────────────────────────────────────────────────────┘\n')
}

main()
  .catch((err) => {
    console.error('[seed-grandes-ecoles] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
