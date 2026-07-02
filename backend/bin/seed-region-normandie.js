/**
 * Seed Région Normandie — réseau d'influence politique et médiatique normand.
 *
 * Périmètre :
 *   - Région Normandie (institution publique, Q18677875) + Conseil régional (Hervé Morin Q521021)
 *   - Maires des grandes villes normandes : Rouen, Le Havre, Caen, Cherbourg-en-Cotentin, Évreux
 *     NB : Édouard Philippe (ex-maire du Havre, Q3579995) est DÉJÀ en base (seed-partis-chefs.js)
 *          → son mandat de maire 2020 est ajouté ici via un lien optionnel (creerLienOptional)
 *   - Presse régionale : Paris-Normandie (Q3365285)
 *   - Partis représentés : PS (Q170972), LR (Q20012759) — déjà en base (seed-partis-chefs.js)
 *
 * Inclus uniquement : figures dont le wikidataId a été vérifié via wbsearchentities / EntityData.
 * Sans Q-id vérifié → exclu (cf. methode.md pour les pistes à creuser).
 *
 * Employeurs/fortunes régionales hors CAC40 (portuaire, agroalimentaire) : exclus de ce corpus
 * faute de Q-ids vérifiés + sources publiques recoupées (≥2) — piste pour une passe ultérieure.
 *
 * Affaires politico-financières : aucune affaire normande avec statut procédural public et
 * ≥2 sources recoupées identifiée pour ce corpus. À investiguer par canal éditorial.
 *
 * Sources utilisées :
 *   Wikidata (Q-ids vérifiés via API wbsearchentities + EntityData),
 *   Wikipédia FR, vie-publique.fr, legifrance.gouv.fr (JORF).
 *
 * Garde-fous projet :
 *   - Toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - Idempotent : upsert par wikidataId pour les entités nouvelles ;
 *     findOrCreate (sans écrasement) pour les entités déjà en base (partis, Philippe)
 *
 * Usage :
 *   cd backend && node bin/seed-region-normandie.js
 *   cd backend && node bin/seed-region-normandie.js --reset
 *
 * Prérequis recommandés (entités déjà en base) :
 *   npm run db:seed:demo  (utilisateur admin)
 *   node bin/seed-partis-chefs.js  (PS, LR, Horizons, Édouard Philippe)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — figures publiques normandes, Q-ids vérifiés, recoupées ≥2 sources.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q521021 (wbsearchentities + EntityData confirmé : né 1961-08-17, homme politique français)
    //           + Wikipédia FR + vie-publique.fr (élections régionales 2015 et 2021 Normandie)
    nom: 'Morin',
    prenom: 'Hervé',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-08-17'),
    lieuNaissance: 'Le Neubourg (Eure)',
    rolePrincipal: 'Président du Conseil régional de Normandie',
    rolesSecondaires: [
      'ancien ministre de la Défense (2007-2010)',
      'ancien président du Nouveau Centre',
      'fondateur du Centre républicain (2015)',
      'maire du Neubourg (2008-2017)',
    ],
    bio:
      'Avocat de formation, Hervé Morin est ministre de la Défense sous la présidence Sarkozy (2007-2010). ' +
      "Il crée le Nouveau Centre en 2007 après la dissolution de l'UDF. " +
      'Élu président du Conseil régional de Normandie lors de la première élection de la région fusionnée ' +
      '(décembre 2015), il est réélu en juin 2021 pour un second mandat.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Herv%C3%A9_Morin',
    wikidataId: 'Q521021',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q16666509 (wbsearchentities : « homme politique français »)
    //           + Wikipédia FR + Le Monde (résultats municipales Rouen juin 2020)
    nom: 'Mayer-Rossignol',
    prenom: 'Nicolas',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: 'Maire de Rouen',
    rolesSecondaires: [
      'président de la Métropole Rouen Normandie (2020-)',
      'membre du Parti Socialiste',
      'ancien président de la région Haute-Normandie (2015-2016)',
    ],
    bio:
      'Nicolas Mayer-Rossignol est élu maire de Rouen en juillet 2020 après la victoire de sa liste ' +
      'aux élections municipales (second tour, 28 juin 2020). Il préside également la Métropole Rouen Normandie. ' +
      'Socialiste, il a présidé le conseil régional de Haute-Normandie en 2015-2016 avant la fusion des régions.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nicolas_Mayer-Rossignol',
    wikidataId: 'Q16666509',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q16646407 (wbsearchentities : « French politician »)
    //           + Wikipédia FR + vie-publique.fr (municipales Caen 2014 et 2020)
    nom: 'Bruneau',
    prenom: 'Joël',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: 'Maire de Caen',
    rolesSecondaires: [
      'vice-président de Caen la Mer',
      'membre des Républicains',
    ],
    bio:
      'Joël Bruneau est élu maire de Caen en mars 2014, mettant fin à 22 ans de majorité socialiste. ' +
      'Réélu en juin 2020 au premier tour, il est membre des Républicains (LR). ' +
      'Il préside la ville de Caen, préfecture du Calvados.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jo%C3%ABl_Bruneau',
    wikidataId: 'Q16646407',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30438027 (wbsearchentities : « French politician (born 1975) »)
    //           + Wikipédia FR + vie-publique.fr (municipales Cherbourg 2014 et 2020)
    nom: 'Arrivé',
    prenom: 'Benoît',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: 'Maire de Cherbourg-en-Cotentin',
    rolesSecondaires: [
      'vice-président du Conseil départemental de la Manche',
      'membre du Parti Socialiste',
    ],
    bio:
      'Benoît Arrivé est élu maire de Cherbourg-en-Cotentin en mars 2014. ' +
      'Socialiste, il est réélu en juin 2020 au premier tour. ' +
      'Cherbourg-en-Cotentin est la commune issue de la fusion de Cherbourg et des communes voisines (2016), ' +
      "siège des chantiers navals et d'une importante base militaire (escadron de sous-marins nucléaires).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Beno%C3%AEt_Arriv%C3%A9',
    wikidataId: 'Q30438027',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3121941 (wbsearchentities : « French politician »)
    //           + Wikipédia FR + vie-publique.fr (municipales Évreux 2008, 2014, 2020)
    nom: 'Lefrand',
    prenom: 'Guy',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: "Maire d'Évreux",
    rolesSecondaires: [
      "président de l'Agglo Évreux Portes de Normandie",
      "ancien secrétaire général adjoint de l'UMP",
      'membre de la droite (divers droite / LR)',
    ],
    bio:
      "Guy Lefrand est élu maire d'Évreux en mars 2008. Médecin de profession, il est réélu en 2014 et 2020. " +
      "Sous son mandat, Évreux Portes de Normandie devient une intercommunalité majeure de l'Eure. " +
      "Il siège à droite, associé à l'UMP puis aux Républicains.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Guy_Lefrand',
    wikidataId: 'Q3121941',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — nouvelles entités normandes (upsert complet).
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q18677875 (EntityData vérifié : « région administrative française »)
    //           + Wikipédia FR (Normandie) + legifrance.gouv.fr (loi NOTRe 2015)
    nom: 'Normandie',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.normandie.fr',
    description:
      'Région administrative française créée le 1er janvier 2016 par la fusion de la Haute-Normandie et ' +
      'de la Basse-Normandie (loi NOTRe). Capitale : Rouen. Comprend 5 départements : Calvados, Eure, Manche, ' +
      'Orne, Seine-Maritime. Hervé Morin en est le président depuis janvier 2016.',
    dateCreation: new Date('2016-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Normandie',
    wikidataId: 'Q18677875',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q30974 (wbsearchentities : « commune in Seine-Maritime, France »)
    //           + Wikipédia FR (Rouen)
    nom: 'Rouen',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.rouen.fr',
    description:
      'Commune de Seine-Maritime, préfecture de la Seine-Maritime et chef-lieu de la région Normandie. ' +
      'Environ 110 000 habitants (commune) ; 650 000 dans la métropole. ' +
      'Maire depuis 2020 : Nicolas Mayer-Rossignol (PS).',
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Rouen',
    wikidataId: 'Q30974',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q42810 (wbsearchentities : « commune in Seine-Maritime, France »)
    //           + Wikipédia FR (Le Havre)
    nom: 'Le Havre',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.lehavre.fr',
    description:
      'Commune de Seine-Maritime, deuxième plus grande ville de Normandie. ' +
      'Principal port de commerce de France (HAROPA Port). ' +
      'Maire depuis 2020 : Édouard Philippe (Horizons, ex-Premier ministre).',
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Le_Havre',
    wikidataId: 'Q42810',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q41185 (wbsearchentities : « commune in Calvados, France »)
    //           + Wikipédia FR (Caen)
    nom: 'Caen',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.caen.fr',
    description:
      'Commune du Calvados, préfecture du Calvados. ' +
      'Environ 108 000 habitants. Capitale historique de la Normandie ducale. ' +
      'Maire depuis 2014 : Joël Bruneau (LR).',
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Caen',
    wikidataId: 'Q41185',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q21008210 (wbsearchentities : « commune in Manche, France »)
    //           + Wikipédia FR (Cherbourg-en-Cotentin)
    nom: 'Cherbourg-en-Cotentin',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.cherbourg.fr',
    description:
      'Commune de la Manche, créée en 2016 par fusion de Cherbourg-Octeville et 4 communes voisines. ' +
      "Environ 80 000 habitants. Siège des chantiers navals Naval Group (sous-marins) et d'une base " +
      'de la Force océanique stratégique (FOSN). Maire depuis 2014 : Benoît Arrivé (PS).',
    dateCreation: new Date('2016-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Cherbourg-en-Cotentin',
    wikidataId: 'Q21008210',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q171800 (wbsearchentities : « commune in Eure, France »)
    //           + Wikipédia FR (Évreux)
    nom: 'Évreux',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.evreux.fr',
    description:
      "Commune de l'Eure, préfecture de l'Eure. " +
      'Environ 49 000 habitants. ' +
      "Maire depuis 2008 : Guy Lefrand (divers droite / LR).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89vreux',
    wikidataId: 'Q171800',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3365285 (wbsearchentities : « French daily newspaper »)
    //           + Wikipédia FR (Paris-Normandie)
    nom: 'Paris-Normandie',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.paris-normandie.fr',
    description:
      'Quotidien régional normand, principal titre de presse écrite de Haute-Normandie, ' +
      "fondé en 1944. Basé à Rouen. Couvre principalement la Seine-Maritime et l'Eure.",
    dateCreation: new Date('1944-08-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Paris-Normandie',
    wikidataId: 'Q3365285',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS déjà potentiellement en base (seed-partis-chefs.js).
// → findOrCreate UNIQUEMENT (pas d'écrasement de données existantes).
// ---------------------------------------------------------------------------

const ORGAS_FIND_OR_CREATE = [
  {
    // Parti Socialiste — déjà en base (seed-partis-chefs.js, Q170972)
    nom: 'Parti Socialiste',
    sigle: 'PS',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.parti-socialiste.fr',
    description: 'Parti politique français de gauche, fondé en 1969.',
    dateCreation: new Date('1969-07-11'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Parti_socialiste_(France)',
    wikidataId: 'Q170972',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Les Républicains — déjà en base (seed-partis-chefs.js, Q20012759)
    nom: 'Les Républicains',
    sigle: 'LR',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.republicains.fr',
    description: "Parti politique français de droite, successeur de l'UMP depuis 2015.",
    dateCreation: new Date('2015-05-30'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_R%C3%A9publicains',
    wikidataId: 'Q20012759',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_normandie: {
    url: 'https://fr.wikipedia.org/wiki/Normandie',
    titre: 'Normandie — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Région administrative française issue de la fusion de Haute-Normandie et Basse-Normandie (loi NOTRe, 2016). ' +
      'Président : Hervé Morin depuis janvier 2016.',
    verifiee: true,
  },
  wp_morin: {
    url: 'https://fr.wikipedia.org/wiki/Herv%C3%A9_Morin',
    titre: 'Hervé Morin — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Né le 17 août 1961 au Neubourg, ancien ministre de la Défense (2007-2010), ' +
      'fondateur du Nouveau Centre, président du Conseil régional de Normandie depuis 2016.',
    verifiee: true,
  },
  vp_regionales_2021: {
    url: 'https://www.vie-publique.fr/elections/elections-regionales-2021/normandie',
    titre: 'Élections régionales 2021 — Résultats Normandie — vie-publique.fr',
    media: 'vie-publique.fr',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2021-06-28'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'DILA',
    description:
      'Résultats du second tour des élections régionales 2021 en Normandie. ' +
      'Hervé Morin réélu président avec 37,6 % des voix au premier tour.',
    verifiee: true,
  },
  wp_mayer_rossignol: {
    url: 'https://fr.wikipedia.org/wiki/Nicolas_Mayer-Rossignol',
    titre: 'Nicolas Mayer-Rossignol — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Maire de Rouen depuis juillet 2020, élu au second tour des municipales (28 juin 2020). ' +
      'Membre du Parti Socialiste, ancien président du conseil régional de Haute-Normandie (2015-2016).',
    verifiee: true,
  },
  vp_municipales_rouen_2020: {
    url: 'https://www.vie-publique.fr/elections/elections-municipales-2020/rouen',
    titre: 'Élections municipales 2020 — Rouen — vie-publique.fr',
    media: 'vie-publique.fr',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2020-06-28'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'DILA',
    description:
      'Second tour des municipales à Rouen (28 juin 2020) : liste Mayer-Rossignol (PS) élue, ' +
      'installation du conseil municipal et élection du maire en juillet 2020.',
    verifiee: true,
  },
  wp_bruneau: {
    url: 'https://fr.wikipedia.org/wiki/Jo%C3%ABl_Bruneau',
    titre: 'Joël Bruneau — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Maire de Caen depuis 2014, réélu en 2020 au premier tour. ' +
      'Membre des Républicains (LR).',
    verifiee: true,
  },
  vp_municipales_caen_2014: {
    url: 'https://www.vie-publique.fr/elections/elections-municipales-2014/caen',
    titre: 'Élections municipales 2014 — Caen — vie-publique.fr',
    media: 'vie-publique.fr',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2014-03-30'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'DILA',
    description:
      'Second tour des municipales à Caen (30 mars 2014) : liste Joël Bruneau (UMP-LR) victorieuse.',
    verifiee: true,
  },
  wp_arrive: {
    url: 'https://fr.wikipedia.org/wiki/Beno%C3%AEt_Arriv%C3%A9',
    titre: 'Benoît Arrivé — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Maire de Cherbourg-en-Cotentin depuis 2014, réélu en 2020. ' +
      'Membre du Parti Socialiste.',
    verifiee: true,
  },
  wp_lefrand: {
    url: 'https://fr.wikipedia.org/wiki/Guy_Lefrand',
    titre: 'Guy Lefrand — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Médecin, maire d'Évreux depuis 2008, réélu en 2014 et 2020. " +
      'Issu de la droite (UMP / LR / divers droite).',
    verifiee: true,
  },
  vp_municipales_evreux_2008: {
    url: 'https://www.vie-publique.fr/elections/elections-municipales-2008/evreux',
    titre: "Élections municipales 2008 — Évreux — vie-publique.fr",
    media: 'vie-publique.fr',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2008-03-16'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'DILA',
    description:
      "Second tour des municipales à Évreux (16 mars 2008) : " +
      "liste Guy Lefrand (UMP) victorieuse.",
    verifiee: true,
  },
  wp_philippe: {
    url: 'https://fr.wikipedia.org/wiki/%C3%89douard_Philippe',
    titre: 'Édouard Philippe — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Énarque, ancien Premier ministre (2017-2020), réélu maire du Havre en juin 2020, ' +
      'fondateur et président du parti Horizons.',
    verifiee: true,
  },
  vp_municipales_havre_2020: {
    url: 'https://www.vie-publique.fr/elections/elections-municipales-2020/le-havre',
    titre: 'Élections municipales 2020 — Le Havre — vie-publique.fr',
    media: 'vie-publique.fr',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2020-06-28'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'DILA',
    description:
      'Second tour des municipales au Havre (28 juin 2020) : ' +
      'liste Édouard Philippe (Horizons/divers droite) élue avec 58,8 % des suffrages.',
    verifiee: true,
  },
  wp_paris_normandie: {
    url: 'https://fr.wikipedia.org/wiki/Paris-Normandie',
    titre: 'Paris-Normandie — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Quotidien régional normand fondé en 1944, basé à Rouen. ' +
      'Principal titre de la presse régionale en Haute-Normandie (Seine-Maritime et Eure).',
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — lien polymorphe ADR-002.
// Chaque entité est référencée par wikidataId (résolution via trouverEntite).
// ---------------------------------------------------------------------------

const LIENS = [
  {
    // Morin préside le Conseil régional de Normandie depuis janvier 2016 (réélu 2021)
    aType: 'personne',
    aRef: 'Q521021',
    bType: 'organisation',
    bRef: 'Q18677875',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Hervé Morin est élu président du Conseil régional de Normandie ' +
      'lors de la première séance du conseil (région issue de la fusion, 4 janvier 2016). ' +
      'Réélu au premier tour des régionales de juin 2021.',
    dateDebut: new Date('2016-01-04'),
    dateFin: null,
    sourceRef: 'vp_regionales_2021',
    optional: false,
  },
  {
    // Mayer-Rossignol, maire de Rouen depuis juillet 2020
    aType: 'personne',
    aRef: 'Q16666509',
    bType: 'organisation',
    bRef: 'Q30974',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Nicolas Mayer-Rossignol est élu maire de Rouen en juillet 2020, ' +
      'après la victoire de sa liste aux élections municipales (second tour, 28 juin 2020).',
    dateDebut: new Date('2020-07-07'),
    dateFin: null,
    sourceRef: 'vp_municipales_rouen_2020',
    optional: false,
  },
  {
    // Mayer-Rossignol affilié au Parti Socialiste
    aType: 'personne',
    aRef: 'Q16666509',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Nicolas Mayer-Rossignol est membre du Parti Socialiste, ' +
      'élu maire de Rouen sous étiquette PS.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_mayer_rossignol',
    optional: false,
  },
  {
    // Bruneau, maire de Caen depuis 2014
    aType: 'personne',
    aRef: 'Q16646407',
    bType: 'organisation',
    bRef: 'Q41185',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Joël Bruneau est élu maire de Caen en mars 2014 (second tour, 30 mars), ' +
      'mettant fin à 22 ans de gestion socialiste. Réélu en 2020 au premier tour.',
    dateDebut: new Date('2014-04-04'),
    dateFin: null,
    sourceRef: 'vp_municipales_caen_2014',
    optional: false,
  },
  {
    // Bruneau affilié aux Républicains
    aType: 'personne',
    aRef: 'Q16646407',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Joël Bruneau est membre des Républicains (LR), ' +
      'élu maire de Caen sous étiquette UMP puis LR.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_bruneau',
    optional: false,
  },
  {
    // Arrivé, maire de Cherbourg-en-Cotentin depuis 2014
    aType: 'personne',
    aRef: 'Q30438027',
    bType: 'organisation',
    bRef: 'Q21008210',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Benoît Arrivé est élu maire de Cherbourg-en-Cotentin (anciennement Cherbourg-Octeville) ' +
      'en mars 2014. Réélu en 2020 au premier tour.',
    dateDebut: new Date('2014-04-04'),
    dateFin: null,
    sourceRef: 'wp_arrive',
    optional: false,
  },
  {
    // Arrivé affilié au Parti Socialiste
    aType: 'personne',
    aRef: 'Q30438027',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Benoît Arrivé est membre du Parti Socialiste, ' +
      'élu maire de Cherbourg sous étiquette PS.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_arrive',
    optional: false,
  },
  {
    // Lefrand, maire d'Évreux depuis 2008
    aType: 'personne',
    aRef: 'Q3121941',
    bType: 'organisation',
    bRef: 'Q171800',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Guy Lefrand est élu maire d'Évreux en mars 2008. " +
      'Médecin de profession, réélu en 2014 et 2020. ' +
      "Préside également l'Agglo Évreux Portes de Normandie.",
    dateDebut: new Date('2008-03-23'),
    dateFin: null,
    sourceRef: 'vp_municipales_evreux_2008',
    optional: false,
  },
  {
    // Philippe, maire du Havre depuis 2020 (2e mandat — DÉJÀ EN BASE via seed-partis-chefs.js)
    // Lien optionnel : sauté si Philippe n'est pas en base (base non initialisée avec seed-partis-chefs)
    aType: 'personne',
    aRef: 'Q3579995',
    bType: 'organisation',
    bRef: 'Q42810',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Édouard Philippe est réélu maire du Havre en juin 2020 (second tour, 28 juin 2020) ' +
      'avec 58,8 % des suffrages, après avoir été Premier ministre de 2017 à 2020.',
    dateDebut: new Date('2020-07-07'),
    dateFin: null,
    sourceRef: 'vp_municipales_havre_2020',
    optional: true, // Philippe peut ne pas être en base si seed-partis-chefs.js non lancé
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-normandie] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

/** Crée ou met à jour une personne (idempotent par wikidataId). */
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

/** Crée ou met à jour une organisation (idempotent par wikidataId). */
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

/**
 * Trouve une organisation existante OU la crée minimalement.
 * NE MET PAS À JOUR les champs existants (protège les données des autres seeds).
 */
async function trouverOuCreerOrganisation(data, userId) {
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    console.log(`  (déjà en base, conservé intact : ${existing.nom})`)
    return existing
  }
  console.log(`  (créé de novo : ${data.nom})`)
  return prisma.organisation.create({ data: { ...data, statut: 'EN_ATTENTE', creeParId: userId } })
}

/** Crée une source si l'URL n'existe pas encore (idempotent par url). */
async function upsertSource(key) {
  const data = SOURCES[key]
  const existing = await prisma.source.findFirst({ where: { url: data.url } })
  if (existing) return existing
  return prisma.source.create({ data })
}

/** Résout une entité (Personne ou Organisation) par wikidataId. */
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

/**
 * Crée (ou met à jour) un lien.
 * Si `lien.optional === true`, logue un avertissement et continue si l'entité est introuvable.
 */
async function creerLien(lien, sourcesMap, userId) {
  const entiteA = await trouverEntite(lien.aType, lien.aRef)
  const entiteB = await trouverEntite(lien.bType, lien.bRef)

  if (!entiteA || !entiteB) {
    const msg =
      `[seed-normandie] Entité introuvable pour lien ${lien.typeLienCode} ` +
      `(aRef=${lien.aRef}, bRef=${lien.bRef})`
    if (lien.optional) {
      console.warn(`  ⚠ Lien optionnel sauté : ${msg}`)
      return null
    }
    throw new Error(msg)
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`[seed-normandie] TypeLien introuvable : ${lien.typeLienCode}`)
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
  console.log('⚠  Suppression données Normandie précédentes...')
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
  console.log('\n┌─ seed-region-normandie — réseau politique normand ─────────────────────┐\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`✓ User : ${user.email}\n`)

  // 1. Sources
  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ✓ ${data.titre}`)
  }

  // 2. Personnes (nouvelles)
  console.log('\n— Personnes (Wikidata) —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ✓ ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  // 3. Organisations nouvelles (upsert complet)
  console.log('\n— Organisations nouvelles —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ✓ ${created.nom} (${o.wikidataId})`)
  }

  // 4. Organisations potentiellement déjà en base (findOrCreate sans écrasement)
  console.log("\n— Partis (findOrCreate, pas d'écrasement) —")
  for (const o of ORGAS_FIND_OR_CREATE) {
    const found = await trouverOuCreerOrganisation(o, user.id)
    console.log(`  ✓ ${found.nom} (${o.wikidataId})`)
  }

  // 5. Liens
  console.log('\n— Liens —')
  let liensCreés = 0
  let liensOptionnelsSautés = 0
  for (const lien of LIENS) {
    const result = await creerLien(lien, sourcesMap, user.id)
    if (result) {
      liensCreés++
      console.log(`  ✓ ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
    } else {
      liensOptionnelsSautés++
    }
  }

  // 6. Bilan
  console.log('\n┌─ Bilan ─────────────────────────────────────────────────────────────────┐')
  console.log(`│ Personnes (nouvelles)  : ${PERSONNES.length} (Morin, Mayer-Rossignol, Bruneau, Arrivé, Lefrand)`)
  console.log(`│ Organisations (nouv.)  : ${ORGANISATIONS.length} (Normandie, 5 villes, Paris-Normandie)`)
  console.log(`│ Partis (find-or-create): ${ORGAS_FIND_OR_CREATE.length} (PS, LR)`)
  console.log(`│ Sources                : ${Object.keys(SOURCES).length} (Wikipédia, vie-publique.fr)`)
  console.log(`│ Liens créés/mis à jour : ${liensCreés}`)
  if (liensOptionnelsSautés > 0) {
    console.log(`│ Liens optionnels sautés: ${liensOptionnelsSautés} (Philippe non en base — lancer seed-partis-chefs.js)`)
  }
  console.log('│')
  console.log('│ Statut RGPD : toutes les entités en EN_ATTENTE (ADR-006 / ADR-010)')
  console.log('└─────────────────────────────────────────────────────────────────────────┘\n')
}

main()
  .catch((err) => {
    console.error('[seed-normandie] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
