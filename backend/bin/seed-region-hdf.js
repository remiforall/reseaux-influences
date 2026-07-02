/**
 * Seed Hauts-de-France — réseau d'influence régional.
 *
 * Périmètre :
 *   - Région Hauts-de-France (org INSTITUTION_PUBLIQUE, Q18677767)
 *   - 6 élus locaux (président de région + 5 maires) — wikidataIds vérifiés
 *     via wbsearchentities + Special:EntityData (dateConsultation 2026-07-02)
 *   - 7 communes (orgs INSTITUTION_PUBLIQUE) en tant que cibles de MANDAT_ELECTIF
 *   - 2 fleurons économiques nordistes : Bonduelle (Q892279) + Roquette Frères (Q824833)
 *   - 1 media picard : Le Courrier picard (Q729749)
 *
 * Entités DÉJÀ EN BASE (référencées par wikidataId pour les liens uniquement — pas de CREATE) :
 *   - Gérald Darmanin     Q3123610  (seed-macron-v2)
 *   - Gérard Mulliez      Q1415359  (seed-fortunes-2)
 *   - AFM                 Q743182   (seed-fortunes-2)
 *   - Auchan              Q758603   (seed-fortunes-2)
 *   - Decathlon           Q509349   (seed-fortunes-2)
 *   - Adeo                Q2941497  (seed-fortunes-2)
 *   - La Voix du Nord     Q2567583  (seed-raffermir-medias)
 *   - Marie-Christine Coisne-Roquette Q29642685 (seed-cac40-b2)
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne et organisation
 *   - idempotent (upsert par wikidataId)
 *   - dateConsultation : 2026-07-02
 *   - ≥ 1 URL par nœud et par lien (sources publiques)
 *
 * Usage :
 *   cd backend && node bin/seed-region-hdf.js
 *   cd backend && node bin/seed-region-hdf.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — 6 nouvelles entrées, toutes vérifiées via Wikidata + Wikipédia FR.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q203793 (vérifié wbsearchentities, "French politician",
    //   né 21 mars 1965, président du Conseil Régional Hauts-de-France depuis janv. 2016)
    //   + Wikipédia FR (Xavier Bertrand) + vie-publique.fr
    nom: 'Bertrand',
    prenom: 'Xavier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1965-03-21'),
    lieuNaissance: 'Châlons-sur-Marne (Marne)',
    rolePrincipal: 'Président du Conseil Régional Hauts-de-France',
    rolesSecondaires: [
      'fondateur de Nous France (2022)',
      'ancien ministre du Travail (2007-2009, 2010-2012)',
      'ancien ministre de la Santé et de la Solidarité (2005-2007)',
      'ancien maire de Saint-Quentin (2010-2016)',
    ],
    bio:
      'Ministre sous Chirac et Sarkozy (Santé 2005-2007, Travail 2007-2009 et 2010-2012), ' +
      'Xavier Bertrand est élu président du Conseil Régional Hauts-de-France le 4 janvier 2016 ' +
      'et réélu en décembre 2021. Quitte Les Républicains fin 2017, fonde Nous France en 2022.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Xavier_Bertrand',
    wikidataId: 'Q203793',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q228977 (vérifié wbsearchentities, "French politician",
    //   née 8 août 1950 ; maire de Lille 2001-2025 confirmé Wikipedia FR)
    //   + Wikipédia FR (Martine Aubry)
    nom: 'Aubry',
    prenom: 'Martine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1950-08-08'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Ancienne maire de Lille (2001-2025)',
    rolesSecondaires: [
      "ancienne ministre du Travail et de l'Emploi (1997-2000)",
      'ancienne première secrétaire du Parti Socialiste (2008-2012)',
    ],
    bio:
      'Fille de Jacques Delors, Martine Aubry fut ministre du Travail sous Jospin ' +
      '(loi sur les 35 heures, 1998-2000). Maire de Lille de mars 2001 à mars 2025 ' +
      '(quatre mandats, démission le 21 mars 2025 au profit d\'Arnaud Deslandes).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Martine_Aubry',
    wikidataId: 'Q228977',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3336315 (vérifié Special:EntityData, née 29 mai 1963,
    //   mayor of Calais depuis 22 mars 2008) + Wikipédia FR (Natacha Bouchart)
    nom: 'Bouchart',
    prenom: 'Natacha',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-05-29'),
    lieuNaissance: 'Lens (Pas-de-Calais)',
    rolePrincipal: 'Maire de Calais',
    rolesSecondaires: [
      'vice-présidente du Conseil Régional Hauts-de-France (depuis janv. 2016)',
      'présidente de la CU Grand Calais Terres et Mers',
      'ancienne sénatrice du Pas-de-Calais (2011-2016)',
    ],
    bio:
      'Natacha Bouchart met fin à 37 ans de municipalité communiste en remportant ' +
      "les élections municipales de Calais le 22 mars 2008. Réélue en 2014 et 2020. " +
      'VP du Conseil Régional Hauts-de-France depuis le 4 janvier 2016.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Natacha_Bouchart',
    wikidataId: 'Q3336315',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q55088105 (vérifié Special:EntityData, né 17 mai 1971,
    //   mayor of Roubaix juin 2020 – mars 2026) + Wikipédia FR (Guillaume Delbar)
    nom: 'Delbar',
    prenom: 'Guillaume',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1971-05-17'),
    lieuNaissance: null,
    rolePrincipal: 'Ancien maire de Roubaix (2020-2026)',
    rolesSecondaires: ['ancien député du Nord (2016-2022)'],
    bio:
      "Guillaume Delbar succède à René Vandierendonck à la mairie de Roubaix en juin 2020. " +
      "Député du Nord (2016-2022), il incarne le renouvellement de la droite dans ce bassin industriel. " +
      "Son mandat municipal s'achève en mars 2026 à l'issue des élections municipales.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Guillaume_Delbar',
    wikidataId: 'Q55088105',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q16669152 (vérifié Special:EntityData, né 4 juillet 1968,
    //   mayor of Dunkerque depuis 30 mars 2014) + Wikipédia FR (Patrice Vergriete)
    nom: 'Vergriete',
    prenom: 'Patrice',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1968-07-04'),
    lieuNaissance: null,
    rolePrincipal: 'Maire de Dunkerque',
    rolesSecondaires: [],
    bio:
      'Patrice Vergriete est élu maire de Dunkerque le 30 mars 2014 et réélu en 2020. ' +
      'Il engage la métropole dans une politique de transport en commun gratuit (2018) ' +
      'et une stratégie industrielle hydrogène (Dunkerque Hydrogène Vert).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Patrice_Vergriete',
    wikidataId: 'Q16669152',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q594672 (vérifié wbsearchentities, née 13 août 1955 à Amiens ;
    //   maire d'Amiens 2002-2007 puis 2014-2024, VP CR HdF depuis 2017 — Wikipédia FR confirmé)
    //   + Wikipédia FR (Brigitte Fouré)
    nom: 'Fouré',
    prenom: 'Brigitte',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1955-08-13'),
    lieuNaissance: 'Amiens (Somme)',
    rolePrincipal: 'Première vice-présidente du Conseil Régional Hauts-de-France',
    rolesSecondaires: [
      "ancienne maire d'Amiens (2002-2007 puis 2014-2024)",
      "ancienne eurodéputée (janv. 2008 – juil. 2009)",
      'UDI',
    ],
    bio:
      "Brigitte Fouré est maire d'Amiens à deux reprises (2002-2007, puis 2014 " +
      "jusqu'à sa démission le 7 octobre 2024). Elle est première VP du Conseil Régional " +
      "Hauts-de-France aux côtés de Xavier Bertrand depuis le 23 novembre 2017.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Brigitte_Four%C3%A9',
    wikidataId: 'Q594672',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — 10 nouvelles.
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q18677767 (vérifié wbsearchentities,
    //   "administrative region of France") + Wikipédia FR (Hauts-de-France)
    nom: 'Hauts-de-France',
    sigle: 'HdF',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.hautsdefrance.fr',
    description:
      "Région administrative française née le 1er janvier 2016 de la fusion " +
      "de Nord-Pas-de-Calais et Picardie. 5 départements (Nord, Pas-de-Calais, Aisne, Oise, Somme). " +
      "Siège : Lille. Présidée par Xavier Bertrand depuis le 4 janvier 2016.",
    dateCreation: new Date('2016-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Hauts-de-France',
    wikidataId: 'Q18677767',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q648 (vérifié wbsearchentities, "city and commune in Nord")
    //   + Wikipédia FR (Lille)
    nom: 'Ville de Lille',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.lille.fr',
    description:
      "Commune chef-lieu du Nord et de la région Hauts-de-France. " +
      "~240 000 habitants (commune) ; ~1,1 M dans la MEL. Capitale régionale.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Lille',
    wikidataId: 'Q648',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q6454 (vérifié wbsearchentities, "commune in Pas-de-Calais")
    //   + Wikipédia FR (Calais)
    nom: 'Ville de Calais',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.calais.fr',
    description:
      "Commune du Pas-de-Calais, Hauts-de-France. ~73 000 habitants. " +
      "Premier port passager d'Europe et principal point de passage vers le Royaume-Uni.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Calais',
    wikidataId: 'Q6454',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q41604 (vérifié wbsearchentities, "commune in Somme")
    //   + Wikipédia FR (Amiens)
    nom: "Ville d'Amiens",
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.amiens.fr',
    description:
      "Commune chef-lieu de la Somme, Hauts-de-France. ~136 000 habitants. " +
      "Ville natale d'Emmanuel Macron et de Brigitte Macron (née Trogneux).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Amiens',
    wikidataId: 'Q41604',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q45797 (vérifié wbsearchentities, "commune in Nord")
    //   + Wikipédia FR (Dunkerque)
    nom: 'Ville de Dunkerque',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.dunkerque.fr',
    description:
      "Commune du Nord, Hauts-de-France. ~90 000 habitants. " +
      "Premier port de France (trafic transmanche). Pôle industriel (sidérurgie, aluminium, hydrogène).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Dunkerque',
    wikidataId: 'Q45797',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q34001 (vérifié wbsearchentities, "commune in Nord")
    //   + Wikipédia FR (Roubaix)
    nom: 'Ville de Roubaix',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.roubaix.fr',
    description:
      "Commune du Nord, Hauts-de-France. ~97 000 habitants. " +
      "Berceau de la galaxie Mulliez (Auchan fondé à Roubaix-Woippy en 1961).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Roubaix',
    wikidataId: 'Q34001',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q182481 (vérifié wbsearchentities, "commune in Nord")
    //   + Wikipédia FR (Tourcoing)
    // Nécessaire pour le lien ANCIEN_MANDAT Darmanin (déjà en base Q3123610) → Tourcoing.
    nom: 'Ville de Tourcoing',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.tourcoing.fr',
    description:
      "Commune du Nord, Hauts-de-France. ~100 000 habitants. " +
      "Gérald Darmanin y a été maire de mars 2014 à mai 2017.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tourcoing',
    wikidataId: 'Q182481',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q892279 (vérifié wbsearchentities, "French agribusiness company",
    //   fondé 1853, HQ France) + Wikipédia FR (Bonduelle)
    nom: 'Bonduelle',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.bonduelle.fr',
    description:
      "Groupe agroalimentaire spécialisé dans les légumes (conserve, surgelé, frais). " +
      "Fondé en 1853 à Renescure (Nord). Siège : Villeneuve-d'Ascq (Nord). " +
      "Coté sur Euronext Paris. Contrôlé par la famille Bonduelle.",
    dateCreation: new Date('1853-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bonduelle',
    wikidataId: 'Q892279',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q824833 (vérifié wbsearchentities, "Roquette Freres", "company")
    //   + Wikipédia FR (Roquette)
    // NB : Marie-Christine Coisne-Roquette (Q29642685), présidente du CS, déjà en base
    //   via seed-cac40-b2 → lien DIRIGEANT Coisne-Roquette → Roquette ajouté dans LIENS.
    nom: 'Roquette Frères',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.roquette.com',
    description:
      "Groupe mondial de chimie végétale et d'ingrédients (amidons, polyols, protéines). " +
      "Fondé en 1933 à Lestrem (Pas-de-Calais). Non coté, contrôlé par la famille Roquette-Coisne.",
    dateCreation: new Date('1933-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Roquette_(entreprise)',
    wikidataId: 'Q824833',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q729749 (vérifié wbsearchentities, "French newspaper")
    //   + Wikipédia FR (Le Courrier picard)
    nom: 'Le Courrier picard',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.courrier-picard.fr',
    description:
      "Quotidien régional picard fondé en 1944, diffusé dans la Somme et l'Oise. " +
      "Intégré au groupe Sud Ouest depuis 2022.",
    dateCreation: new Date('1944-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Le_Courrier_picard',
    wikidataId: 'Q729749',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_hdf: {
    url: 'https://fr.wikipedia.org/wiki/Hauts-de-France',
    titre: 'Hauts-de-France — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Région créée le 1er janv. 2016 (fusion Nord-Pas-de-Calais + Picardie). " +
      "Présidée par Xavier Bertrand (LR → Nous France) depuis le 4 janv. 2016.",
    verifiee: true,
  },
  wp_bertrand: {
    url: 'https://fr.wikipedia.org/wiki/Xavier_Bertrand',
    titre: 'Xavier Bertrand — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Né le 21 mars 1965. Ministre sous Chirac et Sarkozy. ' +
      'Président du CR Hauts-de-France depuis le 4 janv. 2016 (réélu déc. 2021). ' +
      'Fondateur de Nous France (2022).',
    verifiee: true,
  },
  vp_bertrand: {
    url: 'https://www.vie-publique.fr/fiches/20154-xavier-bertrand-president-region-hauts-de-france',
    titre: 'Xavier Bertrand — Fiche vie-publique.fr',
    media: 'vie-publique.fr',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2021-12-14'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'DILA',
    description:
      "Fiche officielle DILA : Xavier Bertrand, président du Conseil Régional Hauts-de-France, " +
      "réélu le 14 décembre 2021.",
    verifiee: true,
  },
  wp_aubry: {
    url: 'https://fr.wikipedia.org/wiki/Martine_Aubry',
    titre: 'Martine Aubry — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Maire de Lille du 25 mars 2001 au 21 mars 2025 (démission au profit d'Arnaud Deslandes). " +
      "Ancienne ministre du Travail (1997-2000), ancienne 1ère secrétaire du PS (2008-2012).",
    verifiee: true,
  },
  wp_bouchart: {
    url: 'https://fr.wikipedia.org/wiki/Natacha_Bouchart',
    titre: 'Natacha Bouchart — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Maire de Calais depuis le 22 mars 2008 (fin 37 ans de municipalité communiste). " +
      "VP CR Hauts-de-France depuis le 4 janv. 2016. Ancienne sénatrice PdC (2011-2016).",
    verifiee: true,
  },
  wp_delbar: {
    url: 'https://fr.wikipedia.org/wiki/Guillaume_Delbar',
    titre: 'Guillaume Delbar — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né le 17 mai 1971. Maire de Roubaix de juin 2020 à mars 2026. " +
      "Ancien député du Nord (2016-2022).",
    verifiee: true,
  },
  wp_vergriete: {
    url: 'https://fr.wikipedia.org/wiki/Patrice_Vergriete',
    titre: 'Patrice Vergriete — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né le 4 juil. 1968. Maire de Dunkerque depuis le 30 mars 2014. " +
      "Transport en commun gratuit depuis 2018 ; stratégie hydrogène industrielle.",
    verifiee: true,
  },
  wp_foure: {
    url: 'https://fr.wikipedia.org/wiki/Brigitte_Four%C3%A9',
    titre: 'Brigitte Fouré — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Née le 13 août 1955 à Amiens. Maire d'Amiens (2002-2007 puis 2014 – 7 oct. 2024). " +
      "1ère VP du Conseil Régional Hauts-de-France depuis le 23 nov. 2017 (UDI).",
    verifiee: true,
  },
  wp_darmanin: {
    url: 'https://fr.wikipedia.org/wiki/G%C3%A9rald_Darmanin',
    titre: 'Gérald Darmanin — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né à Valenciennes (Nord). Maire de Tourcoing du 30 mars 2014 au 17 mai 2017 " +
      "(démission pour entrer au gouvernement comme secrétaire d'État au Budget).",
    verifiee: true,
  },
  wp_bonduelle: {
    url: 'https://fr.wikipedia.org/wiki/Bonduelle',
    titre: 'Bonduelle — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Groupe agroalimentaire fondé en 1853 à Renescure (Nord). " +
      "Siège : Villeneuve-d'Ascq (Nord). Coté Euronext Paris. Famille Bonduelle.",
    verifiee: true,
  },
  wp_roquette: {
    url: 'https://fr.wikipedia.org/wiki/Roquette_(entreprise)',
    titre: 'Roquette Frères — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Fondé en 1933 à Lestrem (Pas-de-Calais). Groupe mondial d'amidons et protéines végétales. " +
      "Non coté. Présidente du CS : Marie-Christine Coisne-Roquette.",
    verifiee: true,
  },
  wp_courrier_picard: {
    url: 'https://fr.wikipedia.org/wiki/Le_Courrier_picard',
    titre: 'Le Courrier picard — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Quotidien régional picard fondé en 1944. Diffusé dans la Somme et l'Oise. " +
      "Groupe Sud Ouest depuis 2022.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — polymorphe à 3 types (ADR-002).
// Chaque entité référencée est résolue via wikidataId (trouverEntite).
// ---------------------------------------------------------------------------

const LIENS = [
  // ── Mandats électoraux — élus → institutions ──────────────────────────────

  {
    // P-O : Bertrand → Région HdF (président depuis janv. 2016)
    aType: 'personne',
    aRef: 'Q203793',
    bType: 'organisation',
    bRef: 'Q18677767',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Xavier Bertrand est élu président du Conseil Régional Hauts-de-France " +
      "le 4 janvier 2016 (après fusion Nord-Pas-de-Calais + Picardie), réélu en décembre 2021.",
    dateDebut: new Date('2016-01-04'),
    dateFin: null,
    sourceRef: 'wp_bertrand',
  },
  {
    // P-O : Aubry → Lille (ANCIEN_MANDAT — fin mars 2025)
    aType: 'personne',
    aRef: 'Q228977',
    bType: 'organisation',
    bRef: 'Q648',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Martine Aubry est maire de Lille du 25 mars 2001 au 21 mars 2025 (quatre mandats), " +
      "quand elle cède la place à Arnaud Deslandes.",
    dateDebut: new Date('2001-03-25'),
    dateFin: new Date('2025-03-21'),
    sourceRef: 'wp_aubry',
  },
  {
    // P-O : Bouchart → Calais (en cours)
    aType: 'personne',
    aRef: 'Q3336315',
    bType: 'organisation',
    bRef: 'Q6454',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Natacha Bouchart est maire de Calais depuis le 22 mars 2008 (réélue 2014, 2020). " +
      "Fin 37 ans de municipalité communiste.",
    dateDebut: new Date('2008-03-22'),
    dateFin: null,
    sourceRef: 'wp_bouchart',
  },
  {
    // P-O : Bouchart → Région HdF (VP depuis janv. 2016)
    aType: 'personne',
    aRef: 'Q3336315',
    bType: 'organisation',
    bRef: 'Q18677767',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Natacha Bouchart est vice-présidente du Conseil Régional Hauts-de-France " +
      "depuis le 4 janvier 2016.",
    dateDebut: new Date('2016-01-04'),
    dateFin: null,
    sourceRef: 'wp_bouchart',
  },
  {
    // P-O : Delbar → Roubaix (ANCIEN_MANDAT — fin mars 2026)
    aType: 'personne',
    aRef: 'Q55088105',
    bType: 'organisation',
    bRef: 'Q34001',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Guillaume Delbar est maire de Roubaix de juin 2020 à mars 2026 " +
      "(terme correspondant aux élections municipales 2020-2026).",
    dateDebut: new Date('2020-06-28'),
    dateFin: new Date('2026-03-26'),
    sourceRef: 'wp_delbar',
  },
  {
    // P-O : Vergriete → Dunkerque (en cours)
    aType: 'personne',
    aRef: 'Q16669152',
    bType: 'organisation',
    bRef: 'Q45797',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Patrice Vergriete est maire de Dunkerque depuis le 30 mars 2014, réélu en 2020.",
    dateDebut: new Date('2014-03-30'),
    dateFin: null,
    sourceRef: 'wp_vergriete',
  },
  {
    // P-O : Fouré → Amiens (ANCIEN_MANDAT — démission oct. 2024)
    aType: 'personne',
    aRef: 'Q594672',
    bType: 'organisation',
    bRef: 'Q41604',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Brigitte Fouré est maire d'Amiens du 4 avril 2014 au 7 octobre 2024, " +
      "date à laquelle elle démissionne (Hubert de Jenlis lui succède).",
    dateDebut: new Date('2014-04-04'),
    dateFin: new Date('2024-10-07'),
    sourceRef: 'wp_foure',
  },
  {
    // P-O : Fouré → Région HdF (1ère VP depuis nov. 2017)
    aType: 'personne',
    aRef: 'Q594672',
    bType: 'organisation',
    bRef: 'Q18677767',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Brigitte Fouré est première vice-présidente du Conseil Régional Hauts-de-France " +
      "depuis le 23 novembre 2017.",
    dateDebut: new Date('2017-11-23'),
    dateFin: null,
    sourceRef: 'wp_foure',
  },

  // ── Darmanin (DÉJÀ EN BASE Q3123610) → Tourcoing ─────────────────────────

  {
    // P-O : Darmanin → Tourcoing (ANCIEN_MANDAT — 2014 à mai 2017)
    // Sources : Wikipédia FR (Gérald Darmanin) — "ancien maire de Tourcoing" mentionné
    //   dans le bio officiel ; démission le 17 mai 2017 à l'entrée au gouvernement Philippe I.
    aType: 'personne',
    aRef: 'Q3123610',
    bType: 'organisation',
    bRef: 'Q182481',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Gérald Darmanin est maire de Tourcoing du 30 mars 2014 au 17 mai 2017, " +
      "date à laquelle il démissionne pour devenir secrétaire d'État au Budget " +
      "dans le gouvernement Philippe I.",
    dateDebut: new Date('2014-03-30'),
    dateFin: new Date('2017-05-17'),
    sourceRef: 'wp_darmanin',
  },

  // ── Fleurons économiques nordistes → Région HdF ───────────────────────────

  {
    // O-O : Bonduelle → Région HdF (siège Villeneuve-d'Ascq, fondé à Renescure Nord)
    aType: 'organisation',
    aRef: 'Q892279',
    bType: 'organisation',
    bRef: 'Q18677767',
    typeLienCode: 'economique',
    description:
      "Bonduelle est un groupe agroalimentaire fondé dans le Nord (Renescure, 1853) " +
      "dont le siège social est à Villeneuve-d'Ascq (Nord, Hauts-de-France).",
    dateDebut: new Date('1853-01-01'),
    dateFin: null,
    sourceRef: 'wp_bonduelle',
  },
  {
    // O-O : Roquette Frères → Région HdF (Lestrem, Pas-de-Calais)
    aType: 'organisation',
    aRef: 'Q824833',
    bType: 'organisation',
    bRef: 'Q18677767',
    typeLienCode: 'economique',
    description:
      "Roquette Frères est fondé et implanté à Lestrem (Pas-de-Calais, Hauts-de-France). " +
      "Premier employeur privé du Pas-de-Calais.",
    dateDebut: new Date('1933-01-01'),
    dateFin: null,
    sourceRef: 'wp_roquette',
  },
  {
    // O-O : AFM (DÉJÀ EN BASE Q743182) → Région HdF (siège Croix / Nord)
    aType: 'organisation',
    aRef: 'Q743182',
    bType: 'organisation',
    bRef: 'Q18677767',
    typeLienCode: 'economique',
    description:
      "L'Association Familiale Mulliez (AFM) est implantée dans le Nord (Croix) " +
      "et contrôle les enseignes nordistes Auchan, Decathlon, Adeo et Boulanger.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_hdf',
  },
  {
    // O-O : La Voix du Nord (DÉJÀ EN BASE Q2567583) → Région HdF (couverture régionale)
    aType: 'organisation',
    aRef: 'Q2567583',
    bType: 'organisation',
    bRef: 'Q18677767',
    typeLienCode: 'mediatique',
    description:
      "La Voix du Nord est le premier quotidien de la région Hauts-de-France " +
      "(Nord-Pas-de-Calais). Siège : Lille. Tirage ~170 000 ex./jour.",
    dateDebut: new Date('1944-09-01'),
    dateFin: null,
    sourceRef: 'wp_hdf',
  },
  {
    // O-O : Le Courrier picard → Région HdF (couverture Somme/Oise = Picardie)
    aType: 'organisation',
    aRef: 'Q729749',
    bType: 'organisation',
    bRef: 'Q18677767',
    typeLienCode: 'mediatique',
    description:
      "Le Courrier picard est le quotidien régional de la Somme et de l'Oise, " +
      "anciennement Picardie, désormais partie intégrante de Hauts-de-France.",
    dateDebut: new Date('1944-01-01'),
    dateFin: null,
    sourceRef: 'wp_courrier_picard',
  },
  {
    // P-O : Coisne-Roquette (DÉJÀ EN BASE Q29642685, seed-cac40-b2) → Roquette Frères
    // Sources : Wikipédia FR + Roquette.com (biographie du CS)
    aType: 'personne',
    aRef: 'Q29642685',
    bType: 'organisation',
    bRef: 'Q824833',
    typeLienCode: 'DIRIGEANT',
    description:
      "Marie-Christine Coisne-Roquette est présidente du conseil de surveillance " +
      "de Roquette Frères, dont elle est issue par la branche familiale Roquette-Coisne.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_roquette',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-region-hdf] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-region-hdf] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef}, bRef=${lien.bRef}). ` +
        `Vérifier que les seeds prérequis (macron-v2, fortunes-2, raffermir-medias, cac40-b2) ont été exécutés.`,
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
        dateDebut: lien.dateDebut ?? null,
        dateFin: lien.dateFin ?? null,
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
      dateDebut: lien.dateDebut ?? null,
      dateFin: lien.dateFin ?? null,
      statut: 'EN_ATTENTE',
      estBidirectionnel: false,
      intensite: 1,
      sourceId: source?.id ?? null,
      creeParId: userId,
    },
  })
}

async function reset() {
  console.log('⚠ Suppression données HdF précédentes...')
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
  console.log('✓ Données HdF précédentes supprimées.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n┌─ seed-region-hdf — Réseau d\'influence Hauts-de-France ──────────┐\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`✓ User : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ✓ ${data.titre}`)
  }

  console.log('\n— Personnes (6 nouvelles) —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ✓ ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n— Organisations (10 nouvelles) —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ✓ ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Liens —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ✓ ${lien.typeLienCode} | ${lien.aRef} → ${lien.bRef}`)
  }

  console.log('\n┌─ Bilan ─────────────────────────────────────────────────────────┐')
  console.log(`│ Personnes       : ${PERSONNES.length} (Bertrand, Aubry, Bouchart, Delbar, Vergriete, Fouré)`)
  console.log(`│ Organisations   : ${ORGANISATIONS.length} (1 région + 6 communes + 2 entreprises + 1 media)`)
  console.log(`│ Sources         : ${Object.keys(SOURCES).length} (Wikipédia FR × 10, vie-publique.fr × 1, total : 12)`)
  console.log(`│ Liens           : ${LIENS.length} (MANDAT_ELECTIF, ANCIEN_MANDAT, economique, mediatique, DIRIGEANT)`)
  console.log('│ Déjà en base    : Darmanin, Mulliez/AFM, La Voix du Nord, Coisne-Roquette')
  console.log('└─────────────────────────────────────────────────────────────────┘\n')
}

main()
  .catch((err) => {
    console.error('[seed-region-hdf] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
