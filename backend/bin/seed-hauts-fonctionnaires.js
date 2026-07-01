/**
 * Seed Hauts fonctionnaires — enquête OSINT du 2026-06-30.
 *
 * Périmètre : préfets de région (métropole + DROM), ambassadeurs des grands postes
 *             bilatéraux (G20 + partenaires clés), chefs des représentations permanentes
 *             de la France auprès des organisations internationales majeures.
 *
 * Sources : Wikidata (Q-ids vérifiés par SPARQL batch du 2026-06-30),
 *           Wikipédia FR (listes des préfets et ambassadeurs en poste),
 *           France Diplomatie (diplomatie.gouv.fr),
 *           JORF / Légifrance (décrets de nomination cités explicitement).
 *
 * Incertitudes documentées :
 *   - Dates de prise de fonctions marquées null pour les postes sans décret retrouvé.
 *   - Antoine Poussier (Q73804546) : dateNaissance 1966-01-01 est une date par défaut
 *     Wikidata (date réelle inconnue).
 *   - Philippe Léglise-Costa (Q33188283) : en poste comme représentant permanent à l'UE
 *     depuis novembre 2017 — tenure exceptionnellement longue, à re-vérifier.
 *
 * Exclusions (sans Q-id Wikidata vérifiable) :
 *   Préfets  : Frédéric Poisot (Mayotte) — aucun résultat wbsearchentities.
 *   Diplomates : Ahlem Gharbi (UNESCO) — seule entrée homonyme est une nageuse tunisienne.
 *
 * Garde-fous :
 *   - Toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence : HAUT_FONCTIONNAIRE pour chaque personne
 *   - idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-hauts-fonctionnaires.js
 *   cd backend && node bin/seed-hauts-fonctionnaires.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — Q-ids vérifiés par SPARQL batch (wbsearchentities + EntityData).
// Toutes les dates de naissance proviennent de la requête SPARQL du 2026-06-30.
// ---------------------------------------------------------------------------

const PERSONNES = [
  // ────────────────────────────────────────────────────────────────────────
  // § 1 — PRÉFETS DE RÉGION (métropole, 12 sur 13 ; Corse = collectivité
  //        territoriale depuis 2018, statut différent, non incluse)
  // Source partagée : Wikipédia FR, « Liste des préfets français »
  // ────────────────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q47546497 + Wikipedia liste préfets (2026-06-30)
    nom: 'Démaret',
    prenom: 'Violaine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1981-05-28'),
    lieuNaissance: null,
    rolePrincipal: 'Préfète de la région Bourgogne-Franche-Comté',
    rolesSecondaires: [],
    bio:
      "Administratrice de l'État, Violaine Démaret est préfète de la région Bourgogne-Franche-Comté. " +
      "Née le 28 mai 1981, elle représente l'État dans cette région et est nommée par décret du Président de la République.",
    wikidataId: 'Q47546497',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q33120808 + Wikipedia liste préfets (2026-06-30)
    nom: 'Rigoulet-Roze',
    prenom: 'Fabrice',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1968-07-10'),
    lieuNaissance: null,
    rolePrincipal: 'Préfet de la région Occitanie',
    rolesSecondaires: [],
    bio:
      "Administrateur de l'État, Fabrice Rigoulet-Roze est préfet de la région Occitanie. " +
      "Né le 10 juillet 1968, il représente l'État dans la région la plus méridionale de la métropole française.",
    wikidataId: 'Q33120808',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q48923541 + Wikipédia FR (Sophie Brocas) + Wikipedia liste préfets
    nom: 'Brocas',
    prenom: 'Sophie',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-07-03'),
    lieuNaissance: null,
    rolePrincipal: 'Préfète de la région Nouvelle-Aquitaine',
    rolesSecondaires: [],
    bio:
      'Haut fonctionnaire, romancière et journaliste, Sophie Brocas est préfète de la région ' +
      'Nouvelle-Aquitaine. Née le 3 juillet 1961.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Sophie_Brocas',
    wikidataId: 'Q48923541',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q48037943 + Wikipedia liste préfets (2026-06-30)
    nom: 'Dubée',
    prenom: 'Emmanuelle',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1978-05-10'),
    lieuNaissance: null,
    rolePrincipal: 'Préfète de la région Bretagne',
    rolesSecondaires: [],
    bio:
      "Administratrice de l'État, Emmanuelle Dubée est préfète de la région Bretagne. " +
      'Née le 10 mai 1978.',
    wikidataId: 'Q48037943',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q33181982 + Wikipedia liste préfets (2026-06-30)
    nom: 'Gaume',
    prenom: 'Bertrand',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1974-10-16'),
    lieuNaissance: null,
    rolePrincipal: 'Préfet de la région Hauts-de-France',
    rolesSecondaires: [],
    bio:
      "Administrateur de l'État, Bertrand Gaume est préfet de la région Hauts-de-France. " +
      'Né le 16 octobre 1974.',
    wikidataId: 'Q33181982',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q2841410 + Wikipédia FR (Amaury de Saint-Quentin) + Wikipedia liste
    nom: 'de Saint-Quentin',
    prenom: 'Amaury',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1960-12-24'),
    lieuNaissance: null,
    rolePrincipal: 'Préfet de la région Grand Est',
    rolesSecondaires: [
      "ancien préfet de la région Corse",
      "ancien préfet de la région Bretagne",
    ],
    bio:
      "Administrateur de l'État et homme politique, Amaury de Saint-Quentin est préfet de la région Grand Est. " +
      'Né le 24 décembre 1960, il a notamment exercé les fonctions de préfet de Corse et de Bretagne.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Amaury_de_Saint-Quentin',
    wikidataId: 'Q2841410',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q57749003 + Wikipedia liste préfets (2026-06-30)
    nom: 'Guyot',
    prenom: 'Étienne',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1962-03-31'),
    lieuNaissance: null,
    rolePrincipal: "Préfet de la région Auvergne-Rhône-Alpes",
    rolesSecondaires: [],
    bio:
      "Administrateur de l'État, Étienne Guyot est préfet de la région Auvergne-Rhône-Alpes. " +
      'Né le 31 mars 1962.',
    wikidataId: 'Q57749003',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q33115173 + Wikipedia liste préfets (2026-06-30)
    nom: 'Hottiaux',
    prenom: 'Laurent',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1973-05-31'),
    lieuNaissance: null,
    rolePrincipal: 'Préfet de la région Pays de la Loire',
    rolesSecondaires: [],
    bio:
      "Administrateur de l'État, Laurent Hottiaux est préfet de la région Pays de la Loire. " +
      'Né le 31 mai 1973.',
    wikidataId: 'Q33115173',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q33192675 + Wikipédia FR (Hugues Moutouh) + Wikipedia liste préfets
    nom: 'Moutouh',
    prenom: 'Hugues',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-12-22'),
    lieuNaissance: null,
    rolePrincipal: 'Préfet de la région Centre-Val de Loire',
    rolesSecondaires: [],
    bio:
      "Juriste et administrateur de l'État, Hugues Moutouh est préfet de la région Centre-Val de Loire. " +
      'Né le 22 décembre 1967.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Hugues_Moutouh',
    wikidataId: 'Q33192675',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q33286450 + JORF JORFTEXT000054144491 (décret 27 mai 2026)
    // NB : nommé préfet d'Île-de-France par décret du 27 mai 2026, publié au JO du 28 mai 2026.
    // Était préfet des Bouches-du-Rhône depuis janvier 2025 ; auparavant préfet du Nord (2021-2024).
    nom: 'Leclerc',
    prenom: 'Georges-François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-10-26'),
    lieuNaissance: 'Suresnes (Hauts-de-Seine)',
    rolePrincipal: "Préfet de la région Île-de-France, préfet de Paris",
    rolesSecondaires: [
      "ancien préfet des Bouches-du-Rhône (2025)",
      "ancien préfet du Nord (2021-2024)",
      "ancien préfet de Seine-Saint-Denis (2019-2021)",
    ],
    bio:
      "Administrateur de l'État (3e grade), Georges-François Leclerc est nommé préfet de la région " +
      'Île-de-France et préfet de Paris par décret du 27 mai 2026 (JO 28 mai 2026). Né le 26 octobre 1966 à Suresnes. ' +
      "Diplômé de Sciences Po (1988) et de l'ENA (1991-1993).",
    wikidataId: 'Q33286450',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q3164560 + Wikipédia FR (Jean-Benoît Albertini) + Wikipedia liste préfets
    nom: 'Albertini',
    prenom: 'Jean-Benoît',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-05-09'),
    lieuNaissance: null,
    rolePrincipal: 'Préfet de la région Normandie',
    rolesSecondaires: [],
    bio:
      "Administrateur de l'État, Jean-Benoît Albertini est préfet de la région Normandie. " +
      'Né le 9 mai 1963.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Beno%C3%AEt_Albertini',
    wikidataId: 'Q3164560',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q23415435 + Wikipedia liste préfets (2026-06-30)
    nom: 'Witkowski',
    prenom: 'Jacques',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-01-21'),
    lieuNaissance: null,
    rolePrincipal: "Préfet de la région Provence-Alpes-Côte d'Azur",
    rolesSecondaires: [],
    bio:
      "Administrateur de l'État, Jacques Witkowski est préfet de la région Provence-Alpes-Côte d'Azur. " +
      'Né le 21 janvier 1963.',
    wikidataId: 'Q23415435',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },

  // ────────────────────────────────────────────────────────────────────────
  // § 2 — PRÉFETS DROM (4 sur 5 ; Mayotte exclu, Frédéric Poisot sans Q-id)
  // ────────────────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q54893911 + Wikipedia liste préfets (2026-06-30)
    nom: 'Devimeux',
    prenom: 'Thierry',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1960-08-30'),
    lieuNaissance: null,
    rolePrincipal: 'Préfet de la Guadeloupe',
    rolesSecondaires: [],
    bio:
      "Administrateur de l'État, Thierry Devimeux est préfet de la Guadeloupe. " +
      'Né le 30 août 1960.',
    wikidataId: 'Q54893911',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q47655320 + Wikipedia liste préfets (2026-06-30)
    nom: 'Desplanques',
    prenom: 'Étienne',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1980-06-29'),
    lieuNaissance: null,
    rolePrincipal: 'Préfet de la Martinique',
    rolesSecondaires: [],
    bio:
      "Administrateur de l'État, Étienne Desplanques est préfet de la Martinique. " +
      'Né le 29 juin 1980.',
    wikidataId: 'Q47655320',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q73804546 + Wikipedia liste préfets (2026-06-30)
    // NB : dateNaissance 1966-01-01 peut être une date par défaut Wikidata (date exacte inconnue).
    nom: 'Poussier',
    prenom: 'Antoine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-01-01'),
    lieuNaissance: null,
    rolePrincipal: 'Préfet de la Guyane',
    rolesSecondaires: [],
    bio:
      "Administrateur de l'État, Antoine Poussier est préfet de la Guyane. " +
      'Né en 1966 (date exacte incertaine dans Wikidata).',
    wikidataId: 'Q73804546',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q19544959 + Wikipedia liste préfets (2026-06-30)
    nom: 'Latron',
    prenom: 'Patrice',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-07-27'),
    lieuNaissance: null,
    rolePrincipal: 'Préfet de La Réunion',
    rolesSecondaires: [],
    bio:
      "Administrateur de l'État, Patrice Latron est préfet de La Réunion. " +
      'Né le 27 juillet 1961.',
    wikidataId: 'Q19544959',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },

  // ────────────────────────────────────────────────────────────────────────
  // § 3 — AMBASSADEURS DES GRANDS POSTES BILATÉRAUX
  // Source partagée : Wikipédia FR, « Liste des ambassadeurs français » + France Diplomatie
  // Dates de nomination issues du tableau Wikipedia consulté le 2026-06-30.
  // ────────────────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q3219044 + Wikipédia FR (Laurent Bili) + Wikipedia liste ambassadeurs
    nom: 'Bili',
    prenom: 'Laurent',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-08-12'),
    lieuNaissance: null,
    rolePrincipal: "Ambassadeur de France aux États-Unis",
    rolesSecondaires: ["ancien ambassadeur de France en Chine"],
    bio:
      "Diplomate de carrière, Laurent Bili est ambassadeur de France aux États-Unis depuis le 14 février 2023. " +
      "Né le 12 août 1961.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Laurent_Bili',
    wikidataId: 'Q3219044',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q106144448 + Wikipedia liste ambassadeurs (2026-06-30)
    // NB : connue aussi sous le patronyme Tréheux-Duchêne dans les communiqués officiels.
    nom: 'Duchêne',
    prenom: 'Hélène',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-01-07'),
    lieuNaissance: null,
    rolePrincipal: "Ambassadrice de France au Royaume-Uni",
    rolesSecondaires: [],
    bio:
      'Diplomate de carrière, Hélène Duchêne (aussi référencée Tréheux-Duchêne) est ambassadrice ' +
      'de France au Royaume-Uni depuis le 12 octobre 2022. Née le 7 janvier 1963.',
    wikidataId: 'Q106144448',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q4157031 + Wikipédia FR (François Delattre) + Wikipedia liste ambassadeurs
    nom: 'Delattre',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-11-15'),
    lieuNaissance: null,
    rolePrincipal: 'Ambassadeur de France en Allemagne',
    rolesSecondaires: [
      "ancien représentant permanent de la France à l'ONU (New York)",
      "ancien secrétaire général du Quai d'Orsay",
    ],
    bio:
      'Diplomate de carrière, François Delattre est ambassadeur de France en Allemagne depuis le 31 août 2022. ' +
      "Né le 15 novembre 1963. Il a notamment été représentant permanent de la France à l'ONU (2014-2017).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Delattre',
    wikidataId: 'Q4157031',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q49428670 + Wikipedia liste ambassadeurs (2026-06-30) + France Diplomatie
    nom: 'Briens',
    prenom: 'Martin',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1971-07-15'),
    lieuNaissance: null,
    rolePrincipal: 'Ambassadeur de France en Italie',
    rolesSecondaires: [],
    bio:
      'Diplomate de carrière, Martin Briens est ambassadeur de France en Italie depuis le 17 juillet 2023. ' +
      'Né le 15 juillet 1971.',
    wikidataId: 'Q49428670',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q33259813 + Wikipedia liste ambassadeurs (2026-06-30) + France Diplomatie
    nom: 'Rispal',
    prenom: 'Kareen',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1960-09-18'),
    lieuNaissance: null,
    rolePrincipal: "Ambassadrice de France en Espagne",
    rolesSecondaires: [],
    bio:
      'Diplomate de carrière, Kareen Rispal est ambassadrice de France en Espagne depuis le 13 janvier 2025. ' +
      'Née le 18 septembre 1960.',
    wikidataId: 'Q33259813',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q33106062 + Wikipedia liste ambassadeurs (2026-06-30) + France Diplomatie
    nom: 'Lortholary',
    prenom: 'Bertrand',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1968-11-01'),
    lieuNaissance: null,
    rolePrincipal: 'Ambassadeur de France en Chine',
    rolesSecondaires: [],
    bio:
      'Diplomate de carrière, Bertrand Lortholary est ambassadeur de France en Chine depuis le 14 février 2023. ' +
      'Né le 1er novembre 1968.',
    wikidataId: 'Q33106062',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q65386852 + Wikipédia FR (Nicolas de Rivière) + Wikipedia liste ambassadeurs
    // NB : ancien représentant permanent de la France au Conseil de sécurité de l'ONU (2019-2025).
    nom: 'de Rivière',
    prenom: 'Nicolas',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-09-26'),
    lieuNaissance: null,
    rolePrincipal: 'Ambassadeur de France en Russie',
    rolesSecondaires: [
      "ancien représentant permanent de la France au Conseil de sécurité de l'ONU (2019-2025)",
    ],
    bio:
      'Diplomate de carrière, Nicolas de Rivière est ambassadeur de France en Russie depuis le 30 janvier 2025. ' +
      "Né le 26 septembre 1963. Auparavant représentant permanent de la France au Conseil de sécurité de l'ONU " +
      'à New York (2019-2025), poste sur lequel Jérôme Bonnafont lui a succédé.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nicolas_de_Rivi%C3%A8re',
    wikidataId: 'Q65386852',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q98843045 + Wikipedia liste ambassadeurs (2026-06-30) + France Diplomatie
    nom: 'Setton',
    prenom: 'Philippe',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-01-12'),
    lieuNaissance: null,
    rolePrincipal: 'Ambassadeur de France au Japon',
    rolesSecondaires: [],
    bio:
      'Diplomate de carrière, Philippe Setton est ambassadeur de France au Japon depuis le 30 septembre 2020. ' +
      'Né le 12 janvier 1966.',
    wikidataId: 'Q98843045',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q33109300 + Wikipedia liste ambassadeurs (2026-06-30) + France Diplomatie
    nom: 'Mathou',
    prenom: 'Thierry',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-03-08'),
    lieuNaissance: null,
    rolePrincipal: "Ambassadeur de France en Inde",
    rolesSecondaires: [],
    bio:
      'Diplomate de carrière et orientaliste, Thierry Mathou est ambassadeur de France en Inde ' +
      'depuis le 15 septembre 2023. Né le 8 mars 1963.',
    wikidataId: 'Q33109300',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q33102463 + Wikipedia liste ambassadeurs (2026-06-30) + France Diplomatie
    nom: 'Lenain',
    prenom: 'Emmanuel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1970-03-27'),
    lieuNaissance: null,
    rolePrincipal: 'Ambassadeur de France au Brésil',
    rolesSecondaires: [],
    bio:
      'Diplomate de carrière, Emmanuel Lenain est ambassadeur de France au Brésil depuis le 26 septembre 2023. ' +
      'Né le 27 mars 1970.',
    wikidataId: 'Q33102463',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q33153081 + Wikipedia liste ambassadeurs (2026-06-30) + France Diplomatie
    nom: 'Miraillet',
    prenom: 'Michel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1960-04-10'),
    lieuNaissance: null,
    rolePrincipal: 'Ambassadeur de France au Canada',
    rolesSecondaires: [],
    bio:
      'Diplomate de carrière, Michel Miraillet est ambassadeur de France au Canada depuis le 13 septembre 2022. ' +
      'Né le 10 avril 1960.',
    wikidataId: 'Q33153081',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },

  // ────────────────────────────────────────────────────────────────────────
  // § 4 — CHEFS DE REPRÉSENTATIONS PERMANENTES
  // ────────────────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q17635839 + JORF JORFTEXT000051163909 (décret 13 fév. 2025) + ONU NY
    // Prend ses fonctions le 1er mars 2025. Ex-représentant permanent ONU Genève (2021-2025).
    nom: 'Bonnafont',
    prenom: 'Jérôme',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-01-08'),
    lieuNaissance: null,
    rolePrincipal:
      "Représentant permanent de la France au Conseil de sécurité des Nations unies (New York)",
    rolesSecondaires: [
      "ancien représentant permanent de la France auprès de l'ONU à Genève (2021-2025)",
    ],
    bio:
      "Diplomate de carrière, Jérôme Bonnafont est représentant permanent de la France au Conseil de sécurité " +
      "de l'ONU et chef de la mission permanente à New York depuis le 1er mars 2025, nommé par décret du " +
      "13 février 2025. Né le 8 janvier 1961.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/J%C3%A9r%C3%B4me_Bonnafont',
    wikidataId: 'Q17635839',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q48630868 + communiqué ONUG (présentation lettres de créance, avr. 2025)
    // Prend ses fonctions le 29 avril 2025.
    nom: 'Jurgensen',
    prenom: 'Céline',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1976-12-08'),
    lieuNaissance: null,
    rolePrincipal:
      "Ambassadrice, représentante permanente de la France auprès de l'ONU à Genève",
    rolesSecondaires: [
      "ancienne représentante permanente de la France auprès des agences onusiennes à Rome (FAO/PAM/FIDA, 2020-2025)",
    ],
    bio:
      "Diplomate de carrière, Céline Jurgensen est ambassadrice et représentante permanente de la France " +
      "auprès de l'Office des Nations unies à Genève depuis le 29 avril 2025. Née le 8 décembre 1976.",
    wikidataId: 'Q48630868',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q33188283 + Wikipédia FR (Philippe Léglise-Costa)
    // En poste depuis novembre 2017 (décret du 2 nov. 2017). Tenure longue au COREPER.
    nom: 'Léglise-Costa',
    prenom: 'Philippe',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-11-13'),
    lieuNaissance: null,
    rolePrincipal:
      "Représentant permanent de la France auprès de l'Union européenne (COREPER)",
    rolesSecondaires: [],
    bio:
      "Haut fonctionnaire, Philippe Léglise-Costa est représentant permanent de la France auprès de l'Union " +
      'européenne depuis novembre 2017. Né le 13 novembre 1966. ' +
      'NB : tenure de 7+ ans, à re-vérifier si remplacement intervenu depuis août 2025.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Philippe_L%C3%A9glise-Costa',
    wikidataId: 'Q33188283',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q49168148 + JORF JORFTEXT000052010110 (décret 30 juil. 2025)
    // Prend ses fonctions le 31 juillet 2025.
    nom: 'Pierre',
    prenom: 'Cyrille',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1970-10-23'),
    lieuNaissance: null,
    rolePrincipal: "Ambassadeur, représentant permanent de la France auprès de l'OCDE",
    rolesSecondaires: [
      "ancien conseiller-maître à la Cour des comptes (2023-2025)",
      "ancien PDG de France Expertise Internationale (2011-2014)",
      "ancien président du conseil d'administration de l'AEFE (depuis 2023)",
    ],
    bio:
      "Diplomate et haut fonctionnaire, Cyrille Pierre est représentant permanent de la France auprès de l'OCDE " +
      "depuis le 31 juillet 2025, nommé par décret du 30 juillet 2025. Né le 23 octobre 1970. " +
      "Ancien élève de l'ENA (promotion Marc Bloch), diplômé de Sciences Po et d'un DEA de droit international.",
    wikidataId: 'Q49168148',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
  {
    // Sources : Wikidata Q48640577 + Acteurs Publics (nomination OTAN) + otan.delegfrance.org
    nom: 'Cvach',
    prenom: 'David',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1973-12-25'),
    lieuNaissance: null,
    rolePrincipal: "Représentant permanent de la France auprès de l'OTAN (Bruxelles)",
    rolesSecondaires: [],
    bio:
      "Diplomate de carrière, David Cvach est représentant permanent de la France auprès du Conseil de " +
      "l'Organisation du traité de l'Atlantique Nord à Bruxelles. Né le 25 décembre 1973. " +
      "Date exacte de prise de fonctions non retrouvée dans le JORF.",
    wikidataId: 'Q48640577',
    qualiteInfluence: 'HAUT_FONCTIONNAIRE',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q1518496 + Wikipedia Ministère de l'Intérieur (France)
    nom: "Ministère de l'Intérieur",
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.interieur.gouv.fr',
    description:
      "Ministère chargé de l'administration du territoire, de la sécurité intérieure et du corps préfectoral. " +
      'Tutelle directe des préfets de région et de département.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Minist%C3%A8re_de_l%27Int%C3%A9rieur_(France)',
    wikidataId: 'Q1518496',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q789848 + Wikipedia MEAE
    nom: "Ministère de l'Europe et des Affaires étrangères",
    sigle: 'MEAE',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.diplomatie.gouv.fr',
    description:
      "Ministère dit « Quai d'Orsay », chargé de la conduite de la politique étrangère de la France. " +
      'Tutelle du réseau diplomatique et consulaire (ambassades, représentations permanentes).',
    wikipediaUrl:
      "https://fr.wikipedia.org/wiki/Minist%C3%A8re_de_l%27Europe_et_des_Affaires_%C3%A9trang%C3%A8res",
    wikidataId: 'Q789848',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-06-30).
// ---------------------------------------------------------------------------

const SOURCES = {
  // ── Listes de référence partagées ─────────────────────────────────────
  wp_liste_prefets: {
    url: 'https://fr.wikipedia.org/wiki/Liste_des_pr%C3%A9fets_fran%C3%A7ais',
    titre: 'Liste des préfets français — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Liste officieuse des préfets en poste, région par région, régulièrement mise à jour sur Wikipédia FR.',
    verifiee: true,
  },
  wp_liste_ambassadeurs: {
    url: 'https://fr.wikipedia.org/wiki/Liste_des_ambassadeurs_fran%C3%A7ais',
    titre: 'Liste des ambassadeurs français — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Liste des ambassadeurs de France en poste, avec dates de nomination. Source : décrets publiés au JORF.',
    verifiee: true,
  },
  diplo_ambassadeurs: {
    url: 'https://www.diplomatie.gouv.fr/fr/le-ministere-et-son-reseau/organisation-et-annuaires/ambassadeurs-et-ambassadrices-en-poste/',
    titre: 'Ambassadeurs et ambassadrices en poste — France Diplomatie (MEAE)',
    media: 'France Diplomatie (MEAE)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: "Ministère de l'Europe et des Affaires étrangères",
    description: 'Annuaire officiel du MEAE listant les ambassadeurs et ambassadrices en poste.',
    verifiee: true,
  },

  // ── JORF — décrets de nomination spécifiques ──────────────────────────
  jorf_leclerc_idf: {
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054144491',
    titre: "Décret du 27 mai 2026 portant nomination du préfet de la région d'Île-de-France, préfet de Paris — M. LECLERC (Georges-François)",
    media: 'Légifrance (JORF)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-05-28'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Présidence de la République',
    description:
      "Décret nommant Georges-François Leclerc, administrateur de l'État du 3e grade, préfet d'Île-de-France et de Paris. JO n°0123 du 28 mai 2026.",
    verifiee: true,
  },
  jorf_bonnafont_onu: {
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051163909',
    titre:
      "Décret du 13 février 2025 portant nomination de l'ambassadeur représentant permanent de la France à l'ONU — M. BONNAFONT (Jérôme)",
    media: 'Légifrance (JORF)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-02-13'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Présidence de la République',
    description:
      "Décret nommant Jérôme Bonnafont ambassadeur, représentant permanent de la France au Conseil de sécurité et chef de la mission permanente à New York, à compter du 1er mars 2025.",
    verifiee: true,
  },
  jorf_cyrille_pierre: {
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052010110',
    titre:
      "Décret du 30 juillet 2025 portant nomination d'un ambassadeur, représentant permanent de la France auprès de l'OCDE — M. PIERRE (Cyrille)",
    media: 'Légifrance (JORF)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-07-30'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Présidence de la République',
    description:
      "Décret nommant Cyrille Pierre ambassadeur, représentant permanent de la France auprès de l'OCDE, à compter du 31 juillet 2025.",
    verifiee: true,
  },

  // ── Wikipedia individuel — pages personnelles vérifiées ───────────────
  wp_brocas: {
    url: 'https://fr.wikipedia.org/wiki/Sophie_Brocas',
    titre: 'Sophie Brocas — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: 'Haut fonctionnaire, romancière et journaliste, préfète de Nouvelle-Aquitaine.',
    verifiee: true,
  },
  wp_saint_quentin: {
    url: 'https://fr.wikipedia.org/wiki/Amaury_de_Saint-Quentin',
    titre: 'Amaury de Saint-Quentin — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: "Administrateur de l'État et homme politique, préfet du Grand Est.",
    verifiee: true,
  },
  wp_moutouh: {
    url: 'https://fr.wikipedia.org/wiki/Hugues_Moutouh',
    titre: 'Hugues Moutouh — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: "Juriste et administrateur de l'État, préfet de la région Centre-Val de Loire.",
    verifiee: true,
  },
  wp_albertini: {
    url: 'https://fr.wikipedia.org/wiki/Jean-Beno%C3%AEt_Albertini',
    titre: 'Jean-Benoît Albertini — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: "Administrateur de l'État, préfet de la région Normandie.",
    verifiee: true,
  },
  wp_bili: {
    url: 'https://fr.wikipedia.org/wiki/Laurent_Bili',
    titre: 'Laurent Bili — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: 'Diplomate de carrière, ambassadeur de France aux États-Unis depuis fév. 2023.',
    verifiee: true,
  },
  wp_delattre: {
    url: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Delattre',
    titre: 'François Delattre — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Diplomate, ancien représentant permanent de la France à l'ONU, ambassadeur en Allemagne.",
    verifiee: true,
  },
  wp_de_riviere: {
    url: 'https://fr.wikipedia.org/wiki/Nicolas_de_Rivi%C3%A8re',
    titre: 'Nicolas de Rivière — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Diplomate, ancien représentant permanent de la France au Conseil de sécurité de l'ONU (2019-2025), ambassadeur en Russie depuis janv. 2025.",
    verifiee: true,
  },
  wp_bonnafont: {
    url: 'https://fr.wikipedia.org/wiki/J%C3%A9r%C3%B4me_Bonnafont',
    titre: 'Jérôme Bonnafont — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Diplomate, représentant permanent de la France à l'ONU New York depuis mars 2025.",
    verifiee: true,
  },
  wp_leglise_costa: {
    url: 'https://fr.wikipedia.org/wiki/Philippe_L%C3%A9glise-Costa',
    titre: 'Philippe Léglise-Costa — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: "Haut fonctionnaire, représentant permanent de la France auprès de l'UE depuis nov. 2017.",
    verifiee: true,
  },
  onug_jurgensen: {
    url: 'https://www.ungeneva.org/en/news-media/presentation-of-credentials/2025/04/new-permanent-representative-france-presents',
    titre:
      'New Permanent Representative of France Presents Credentials — UN Geneva (avril 2025)',
    media: 'Office des Nations unies à Genève (ONUG)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2025-04-29'),
    dateConsultation: new Date('2026-06-30'),
    auteur: "Office des Nations unies à Genève",
    description:
      'Communiqué officiel ONUG : Céline Jurgensen présente ses lettres de créance comme représentante permanente de la France le 29 avril 2025.',
    verifiee: true,
  },
  otan_cvach: {
    url: 'https://acteurspublics.fr/nomination/david-cvach-futur-representant-permanent-de-la-france-aupres-de-lotan/',
    titre: "David Cvach, futur représentant permanent de la France auprès de l'OTAN — Acteurs Publics",
    media: 'Acteurs Publics',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2023-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Rédaction Acteurs Publics',
    description:
      "Article sur la nomination de David Cvach comme représentant permanent de la France auprès de l'OTAN.",
    verifiee: false,
  },
  wp_interieur: {
    url: 'https://fr.wikipedia.org/wiki/Minist%C3%A8re_de_l%27Int%C3%A9rieur_(France)',
    titre: "Ministère de l'Intérieur (France) — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Wikidata Q1518496 — ministère de l'Intérieur, tutelle des préfets. Confirmé depuis la sidebar Wikipedia.",
    verifiee: true,
  },
  wp_meae: {
    url: 'https://fr.wikipedia.org/wiki/Minist%C3%A8re_de_l%27Europe_et_des_Affaires_%C3%A9trang%C3%A8res',
    titre: "Ministère de l'Europe et des Affaires étrangères — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description: "Wikidata Q789848 — MEAE, Quai d'Orsay, tutelle du réseau diplomatique.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002). Chaque personne liée à son ministère de tutelle.
// typeLienCode : HAUT_FONCTIONNAIRE (code existant dans seed.js types OSINT phase 2).
// ---------------------------------------------------------------------------

const LIENS = [
  // ── Préfets → Ministère de l'Intérieur ──────────────────────────────────

  {
    aType: 'personne',
    aRef: 'Q47546497',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Violaine Démaret est préfète de la région Bourgogne-Franche-Comté, nommée par décret du Président de la République en Conseil des ministres, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_liste_prefets',
  },
  {
    aType: 'personne',
    aRef: 'Q33120808',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Fabrice Rigoulet-Roze est préfet de la région Occitanie, nommé par décret, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_liste_prefets',
  },
  {
    aType: 'personne',
    aRef: 'Q48923541',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Sophie Brocas est préfète de la région Nouvelle-Aquitaine, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_brocas',
  },
  {
    aType: 'personne',
    aRef: 'Q48037943',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Emmanuelle Dubée est préfète de la région Bretagne, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_liste_prefets',
  },
  {
    aType: 'personne',
    aRef: 'Q33181982',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Bertrand Gaume est préfet de la région Hauts-de-France, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_liste_prefets',
  },
  {
    aType: 'personne',
    aRef: 'Q2841410',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Amaury de Saint-Quentin est préfet de la région Grand Est, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_saint_quentin',
  },
  {
    aType: 'personne',
    aRef: 'Q57749003',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Étienne Guyot est préfet de la région Auvergne-Rhône-Alpes, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_liste_prefets',
  },
  {
    aType: 'personne',
    aRef: 'Q33115173',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Laurent Hottiaux est préfet de la région Pays de la Loire, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_liste_prefets',
  },
  {
    aType: 'personne',
    aRef: 'Q33192675',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Hugues Moutouh est préfet de la région Centre-Val de Loire, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_moutouh',
  },
  {
    aType: 'personne',
    aRef: 'Q33286450',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Georges-François Leclerc est préfet de la région Île-de-France et préfet de Paris depuis le 28 mai 2026 (décret du 27 mai 2026, JORFTEXT000054144491), sous tutelle du ministère de l'Intérieur.",
    dateDebut: new Date('2026-05-28'),
    dateFin: null,
    sourceRef: 'jorf_leclerc_idf',
  },
  {
    aType: 'personne',
    aRef: 'Q3164560',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Jean-Benoît Albertini est préfet de la région Normandie, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_albertini',
  },
  {
    aType: 'personne',
    aRef: 'Q23415435',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Jacques Witkowski est préfet de la région Provence-Alpes-Côte d'Azur, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_liste_prefets',
  },
  {
    aType: 'personne',
    aRef: 'Q54893911',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Thierry Devimeux est préfet de la Guadeloupe, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_liste_prefets',
  },
  {
    aType: 'personne',
    aRef: 'Q47655320',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Étienne Desplanques est préfet de la Martinique, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_liste_prefets',
  },
  {
    aType: 'personne',
    aRef: 'Q73804546',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Antoine Poussier est préfet de la Guyane, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_liste_prefets',
  },
  {
    aType: 'personne',
    aRef: 'Q19544959',
    bType: 'organisation',
    bRef: 'Q1518496',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Patrice Latron est préfet de La Réunion, sous tutelle du ministère de l'Intérieur.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_liste_prefets',
  },

  // ── Ambassadeurs → MEAE ──────────────────────────────────────────────────

  {
    aType: 'personne',
    aRef: 'Q3219044',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Laurent Bili est ambassadeur de France aux États-Unis depuis le 14 février 2023, accrédité auprès du gouvernement américain, sous autorité du MEAE.",
    dateDebut: new Date('2023-02-14'),
    dateFin: null,
    sourceRef: 'wp_bili',
  },
  {
    aType: 'personne',
    aRef: 'Q106144448',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Hélène Duchêne (Tréheux-Duchêne) est ambassadrice de France au Royaume-Uni depuis le 12 octobre 2022, sous autorité du MEAE.",
    dateDebut: new Date('2022-10-12'),
    dateFin: null,
    sourceRef: 'wp_liste_ambassadeurs',
  },
  {
    aType: 'personne',
    aRef: 'Q4157031',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "François Delattre est ambassadeur de France en Allemagne depuis le 31 août 2022, sous autorité du MEAE.",
    dateDebut: new Date('2022-08-31'),
    dateFin: null,
    sourceRef: 'wp_delattre',
  },
  {
    aType: 'personne',
    aRef: 'Q49428670',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Martin Briens est ambassadeur de France en Italie depuis le 17 juillet 2023, sous autorité du MEAE.",
    dateDebut: new Date('2023-07-17'),
    dateFin: null,
    sourceRef: 'diplo_ambassadeurs',
  },
  {
    aType: 'personne',
    aRef: 'Q33259813',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Kareen Rispal est ambassadrice de France en Espagne depuis le 13 janvier 2025, sous autorité du MEAE.",
    dateDebut: new Date('2025-01-13'),
    dateFin: null,
    sourceRef: 'diplo_ambassadeurs',
  },
  {
    aType: 'personne',
    aRef: 'Q33106062',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Bertrand Lortholary est ambassadeur de France en Chine depuis le 14 février 2023, sous autorité du MEAE.",
    dateDebut: new Date('2023-02-14'),
    dateFin: null,
    sourceRef: 'diplo_ambassadeurs',
  },
  {
    aType: 'personne',
    aRef: 'Q65386852',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Nicolas de Rivière est ambassadeur de France en Russie depuis le 30 janvier 2025, sous autorité du MEAE.",
    dateDebut: new Date('2025-01-30'),
    dateFin: null,
    sourceRef: 'wp_de_riviere',
  },
  {
    aType: 'personne',
    aRef: 'Q98843045',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Philippe Setton est ambassadeur de France au Japon depuis le 30 septembre 2020, sous autorité du MEAE.",
    dateDebut: new Date('2020-09-30'),
    dateFin: null,
    sourceRef: 'diplo_ambassadeurs',
  },
  {
    aType: 'personne',
    aRef: 'Q33109300',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Thierry Mathou est ambassadeur de France en Inde depuis le 15 septembre 2023, sous autorité du MEAE.",
    dateDebut: new Date('2023-09-15'),
    dateFin: null,
    sourceRef: 'diplo_ambassadeurs',
  },
  {
    aType: 'personne',
    aRef: 'Q33102463',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Emmanuel Lenain est ambassadeur de France au Brésil depuis le 26 septembre 2023, sous autorité du MEAE.",
    dateDebut: new Date('2023-09-26'),
    dateFin: null,
    sourceRef: 'diplo_ambassadeurs',
  },
  {
    aType: 'personne',
    aRef: 'Q33153081',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Michel Miraillet est ambassadeur de France au Canada depuis le 13 septembre 2022, sous autorité du MEAE.",
    dateDebut: new Date('2022-09-13'),
    dateFin: null,
    sourceRef: 'diplo_ambassadeurs',
  },

  // ── Représentants permanents → MEAE ────────────────────────────────────

  {
    aType: 'personne',
    aRef: 'Q17635839',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Jérôme Bonnafont est représentant permanent de la France au Conseil de sécurité de l'ONU et chef de la mission permanente de France à New York depuis le 1er mars 2025 (décret du 13 fév. 2025, JORFTEXT000051163909).",
    dateDebut: new Date('2025-03-01'),
    dateFin: null,
    sourceRef: 'jorf_bonnafont_onu',
  },
  {
    aType: 'personne',
    aRef: 'Q48630868',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Céline Jurgensen est représentante permanente de la France auprès de l'Office des Nations unies à Genève depuis le 29 avril 2025.",
    dateDebut: new Date('2025-04-29'),
    dateFin: null,
    sourceRef: 'onug_jurgensen',
  },
  {
    aType: 'personne',
    aRef: 'Q33188283',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Philippe Léglise-Costa est représentant permanent de la France auprès de l'Union européenne (COREPER) depuis novembre 2017. NB : tenure longue, à re-vérifier.",
    dateDebut: new Date('2017-11-02'),
    dateFin: null,
    sourceRef: 'wp_leglise_costa',
  },
  {
    aType: 'personne',
    aRef: 'Q49168148',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "Cyrille Pierre est représentant permanent de la France auprès de l'OCDE depuis le 31 juillet 2025 (décret du 30 juillet 2025, JORFTEXT000052010110).",
    dateDebut: new Date('2025-07-31'),
    dateFin: null,
    sourceRef: 'jorf_cyrille_pierre',
  },
  {
    aType: 'personne',
    aRef: 'Q48640577',
    bType: 'organisation',
    bRef: 'Q789848',
    typeLienCode: 'HAUT_FONCTIONNAIRE',
    description:
      "David Cvach est représentant permanent de la France auprès du Conseil de l'OTAN à Bruxelles. Date exacte de prise de fonctions non retrouvée dans le JORF.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'otan_cvach',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js — verbatim)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-hauts-fonctionnaires] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-hauts-fonctionnaires] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('⚠ Suppression données hauts fonctionnaires précédentes...')
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
  console.log('✓ Données précédentes supprimées.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n┌─ seed-hauts-fonctionnaires — préfets + ambassadeurs + reps permanentes ─┐\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`✓ User : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ✓ ${data.titre}`)
  }

  console.log('\n— Personnes (Wikidata — SPARQL batch 2026-06-30) —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ✓ ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n— Organisations (ministères de tutelle) —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ✓ ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Liens (HAUT_FONCTIONNAIRE → tutelle) —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ✓ ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n┌─ Bilan ─────────────────────────────────────────────────────┐')
  console.log(`│ Personnes     : ${PERSONNES.length} (16 préfets région + 11 ambassadeurs + 5 reps permanentes)`)
  console.log(`│ Organisations : ${ORGANISATIONS.length} (Ministère Intérieur, MEAE)`)
  console.log(`│ Sources       : ${Object.keys(SOURCES).length} (Wikipédia, JORF×3, France Diplomatie, ONUG, Acteurs Publics)`)
  console.log(`│ Liens         : ${LIENS.length} (HAUT_FONCTIONNAIRE personne → ministère de tutelle)`)
  console.log('│')
  console.log('│ Exclusions (sans Q-id Wikidata) :')
  console.log('│   Préfets  : Frédéric Poisot (Mayotte)')
  console.log('│   Diplomates : Ahlem Gharbi (UNESCO)')
  console.log('│')
  console.log('│ Sources JORF avec URL Légifrance vérifiée :')
  console.log('│   Leclerc IDF  : JORFTEXT000054144491 (27 mai 2026)')
  console.log('│   Bonnafont ONU NY : JORFTEXT000051163909 (13 fév. 2025)')
  console.log('│   Cyrille Pierre OCDE : JORFTEXT000052010110 (30 juil. 2025)')
  console.log('└─────────────────────────────────────────────────────────────┘\n')
}

main()
  .catch((err) => {
    console.error('[seed-hauts-fonctionnaires] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
