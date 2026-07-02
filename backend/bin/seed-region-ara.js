/**
 * Seed Région Auvergne-Rhône-Alpes — enquête OSINT du 2026-07-02.
 *
 * Périmètre : Conseil régional ARA, son président (Wauquiez → Pannekoucke),
 *             maires des grandes villes (Lyon, Grenoble, Saint-Étienne,
 *             Clermont-Ferrand, Annecy), presse régionale de référence
 *             et affaires judiciaires d'intérêt public.
 *
 * Sources : Wikidata (Q-ids vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR, site officiel Région ARA, France Bleu/ICI, France 3 ARA,
 *           observatoire.anticor.org, Légifrance.
 *
 * Q-ids vérifiés (Special:EntityData / wikidata.org confirmé) :
 *   Q984375    Laurent Wauquiez
 *   Q62887804  Fabrice Pannekoucke
 *   Q85305187  Grégory Doucet
 *   Q16007948  Éric Piolle
 *   Q17497010  Gaël Perdriau
 *   Q16667915  Olivier Bianchi
 *   Q96739529  François Astorg
 *   Q3455745   Régis Juanico
 *   Q63436533  Antoine Armand
 *   Q19606559  Conseil régional Auvergne-Rhône-Alpes
 *   Q456       Ville de Lyon
 *   Q1289      Ville de Grenoble
 *   Q42716     Ville de Saint-Étienne
 *   Q42168     Ville de Clermont-Ferrand
 *   Q28726684  Ville d'Annecy
 *   Q20012759  Les Républicains
 *   Q10977     Le Progrès
 *   Q2642655   Le Dauphiné Libéré
 *
 * DÉPENDANCES : aucune seed préalable requise. Les maires déjà en base
 *   (ex-ministres, deputés) sont résolus par wikidataId via upsert idempotent.
 *
 * Statut judiciaire (affaire Perdriau) :
 *   Condamné en 1re instance (tribunal correctionnel de Lyon, 1er déc. 2025).
 *   Appel en cours — délibéré cour d'appel de Lyon attendu le 10 sept. 2026.
 *   La condamnation en 1re instance est NON définitive.
 *   ⚠ Présomption d'innocence applicable jusqu'à décision définitive.
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - 0 donnée médicale, 0 personne privée, 0 mineur
 *
 * Usage :
 *   cd backend && node bin/seed-region-ara.js
 *   cd backend && node bin/seed-region-ara.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — recoupées par ≥ 2 sources publiques (cf. commentaires).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q984375 + Wikipédia FR + auvergnerhonealpes.fr (fiche élu)
    // DoB confirmé Wikidata : 1975-04-12. lieuNaissance Wikipédia : Paris.
    nom: 'Wauquiez',
    prenom: 'Laurent',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1975-04-12'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Député de Haute-Loire ; président du groupe LR à l\'Assemblée nationale',
    rolesSecondaires: [
      'ancien président du Conseil régional Auvergne-Rhône-Alpes (2016-2024)',
      'ancien président de Les Républicains (2017-2019)',
      'ancien maire de Le Puy-en-Velay (2008-2016)',
      'ancien secrétaire d\'État chargé de l\'Emploi (2008-2009)',
    ],
    bio:
      'Ancien élève de l\'ENS et de l\'ENA, agrégé de lettres, Laurent Wauquiez est élu président du Conseil ' +
      'régional Auvergne-Rhône-Alpes en décembre 2015. Il préside Les Républicains de décembre 2017 à juin 2019 ' +
      'puis quitte la région en juin 2024 après sa réélection comme député de Haute-Loire aux législatives anticipées. ' +
      'Il dirige depuis juillet 2024 le groupe LR à l\'Assemblée nationale.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Laurent_Wauquiez',
    wikidataId: 'Q984375',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q62887804 + Wikipédia FR + auvergnerhonealpes.fr/actualites (élection 5 sept. 2024)
    // DoB confirmé Wikidata : 1975-05-14. Élu président de la région le 5 sept. 2024.
    nom: 'Pannekoucke',
    prenom: 'Fabrice',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1975-05-14'),
    rolePrincipal: 'Président du Conseil régional Auvergne-Rhône-Alpes (depuis sept. 2024)',
    rolesSecondaires: [
      'ancien député de Savoie (2014-2024)',
      'ancien vice-président de la Région ARA',
      'membre de Les Républicains',
    ],
    bio:
      'Fabrice Pannekoucke, LR, a été vice-président chargé des lycées sous la présidence Wauquiez avant ' +
      'd\'être élu président du Conseil régional Auvergne-Rhône-Alpes le 5 septembre 2024, succédant à ' +
      'Laurent Wauquiez démissionnaire. Il avait siégé comme député de Savoie de 2014 à 2024.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fabrice_Pannekoucke',
    wikidataId: 'Q62887804',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q85305187 + Wikipédia FR + lyon.fr (fiche officielle)
    // DoB confirmé Wikidata : 1973-08-22. Maire de Lyon depuis le 4 juillet 2020.
    nom: 'Doucet',
    prenom: 'Grégory',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1973-08-22'),
    rolePrincipal: 'Maire de Lyon (depuis juillet 2020, réélu mars 2026)',
    rolesSecondaires: [
      'membre de Les Écologistes (ex-EELV)',
      'ancien directeur d\'ONG humanitaire',
    ],
    bio:
      'Grégory Doucet, ingénieur et directeur d\'ONG, est élu maire de Lyon le 4 juillet 2020 sous l\'étiquette ' +
      'EELV, mettant fin à 73 ans de majorité de gauche non-écologiste. Réélu le 22 mars 2026 de justesse ' +
      '(50,67 %) face à Jean-Michel Aulas, son adversaire a annoncé un recours.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Gr%C3%A9gory_Doucet',
    wikidataId: 'Q85305187',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q16007948 + Wikipédia FR + grenoble.fr (fiche)
    // DoB confirmé Wikidata : 1973-01-06. Mandat terminé le 26 mars 2026.
    nom: 'Piolle',
    prenom: 'Éric',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1973-01-06'),
    lieuNaissance: 'Pau (Pyrénées-Atlantiques)',
    rolePrincipal: 'Ancien maire de Grenoble (2014-2026)',
    rolesSecondaires: [
      'ingénieur en informatique (INRIA, HP)',
      'membre de Les Écologistes (ex-EELV)',
    ],
    bio:
      'Éric Piolle, ingénieur de formation, est élu maire de Grenoble le 4 avril 2014 avec une coalition de ' +
      'gauche et d\'écologistes, battant l\'UMP Alain Carignon. Réélu en 2020, il ne se représente pas en 2026 ' +
      'et quitte la mairie le 26 mars 2026 ; il est remplacé par Laurence Ruffin (écologiste).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89ric_Piolle',
    wikidataId: 'Q16007948',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q17497010 + Wikipédia FR (affaire sextape)
    //           + observatoire.anticor.org (condamnation 1er déc. 2025)
    //           + France 3 ARA (procès en appel, juin 2026)
    // DoB confirmé Wikidata : 1972-07-08.
    // ⚠ STATUT JUDICIAIRE : condamné en 1re instance (1er déc. 2025, tribunal correctionnel Lyon),
    //   4 ans de prison ferme + 5 ans d'inéligibilité, peine d'inéligibilité exécutée immédiatement.
    //   Appel interjeté — délibéré cour d'appel de Lyon attendu le 10 sept. 2026.
    //   Condamnation en 1re instance NON définitive. Présomption d'innocence applicable.
    nom: 'Perdriau',
    prenom: 'Gaël',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1972-07-08'),
    rolePrincipal: 'Ancien maire de Saint-Étienne (2014-déc. 2025)',
    rolesSecondaires: [
      'membre de Les Républicains',
      'ancien président de Saint-Étienne Métropole',
    ],
    bio:
      'Gaël Perdriau (LR) est élu maire de Saint-Étienne en mars 2014, poste qu\'il occupe jusqu\'à sa ' +
      'condamnation en 1re instance le 1er décembre 2025 (4 ans de prison ferme, 5 ans d\'inéligibilité ' +
      'exécutée immédiatement) pour chantage à la vidéo intime, association de malfaiteurs et détournement ' +
      'de fonds publics. Appel en cours ; délibéré de la cour d\'appel de Lyon attendu le 10 septembre 2026. ' +
      '⚠ Décision non définitive — présomption d\'innocence applicable.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Ga%C3%ABl_Perdriau',
    wikidataId: 'Q17497010',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q16667915 + Wikipédia FR + clermont-ferrand.fr (fiche)
    // DoB confirmé Wikidata : 1970-06-10. Mandat terminé le 26 mars 2026.
    nom: 'Bianchi',
    prenom: 'Olivier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1970-06-10'),
    rolePrincipal: 'Ancien maire de Clermont-Ferrand (2014-2026)',
    rolesSecondaires: ['membre du Parti socialiste'],
    bio:
      'Olivier Bianchi (PS) est maire de Clermont-Ferrand depuis le 30 mars 2014. Réélu en 2020, il ne se ' +
      'représente pas aux municipales de mars 2026 ; il est remplacé le 27 mars 2026 par Julien Bony.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Olivier_Bianchi_(homme_politique)',
    wikidataId: 'Q16667915',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q96739529 + Wikipédia FR + francebleu (Astorg remplacé par Armand, mars 2026)
    // Date de naissance non confirmée par Wikidata lors de la consultation — champ laissé null.
    nom: 'Astorg',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: 'Ancien maire d\'Annecy (2020-2026)',
    rolesSecondaires: ['membre de Les Écologistes (ex-EELV)'],
    bio:
      'François Astorg (EELV) est élu maire d\'Annecy le 28 juin 2020. Il ne se représente pas en mars 2026 ' +
      'et quitte la mairie le 27 mars 2026, remplacé par Antoine Armand.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Astorg',
    wikidataId: 'Q96739529',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3455745 + Wikipédia FR + francebleu (Juanico élu maire, 27 mars 2026)
    //           + saint-etienne.fr/actualites (communiqué officiel)
    // Date de naissance non confirmée par Wikidata lors de la consultation — champ laissé null.
    nom: 'Juanico',
    prenom: 'Régis',
    pays: 'France',
    nationalite: 'française',
    rolePrincipal: 'Maire de Saint-Étienne (depuis mars 2026)',
    rolesSecondaires: ['ancien député de la Loire (2007-2022)', 'membre du Parti socialiste'],
    bio:
      'Régis Juanico, ancien député PS de la Loire (2007-2022), est élu maire de Saint-Étienne le 27 mars 2026, ' +
      'à la tête d\'une coalition de gauche. Il succède à l\'intérim de Jean-Pierre Berger qui avait pris la tête ' +
      'de la mairie après la condamnation de Gaël Perdriau en décembre 2025.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/R%C3%A9gis_Juanico',
    wikidataId: 'Q3455745',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q63436533 + Wikipédia FR (Antoine Armand)
    //           + francebleu (Armand élu maire d\'Annecy 27 mars 2026)
    // DoB confirmé Wikidata : 1991-09-10.
    // Note : Antoine Armand a été ministre de l\'Économie dans le gouvernement Bayrou
    //   (janv. 2025 → apr. 2025 environ). Devenu maire d\'Annecy en mars 2026.
    nom: 'Armand',
    prenom: 'Antoine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1991-09-10'),
    rolePrincipal: 'Maire d\'Annecy (depuis mars 2026)',
    rolesSecondaires: [
      'ancien ministre de l\'Économie (gouvernement Bayrou, janv.-avr. 2025)',
      'ancien député de Haute-Savoie (2022-2025)',
      'membre de Renaissance',
    ],
    bio:
      'Antoine Armand, énarque et inspecteur des finances, est élu député de Haute-Savoie en 2022. ' +
      'Il est ministre de l\'Économie dans le gouvernement Bayrou (janvier 2025). ' +
      'Élu maire d\'Annecy le 27 mars 2026 à la tête d\'une liste centriste-droite, il succède à François Astorg.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Antoine_Armand',
    wikidataId: 'Q63436533',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q19606559 + auvergnerhonealpes.fr (site officiel)
    nom: 'Conseil régional Auvergne-Rhône-Alpes',
    sigle: 'CRAR-ARA',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.auvergnerhonealpes.fr',
    description:
      'Assemblée délibérante de la région Auvergne-Rhône-Alpes, créée le 1er janvier 2016 par fusion de ' +
      'Rhône-Alpes et Auvergne. Présidée par Fabrice Pannekoucke (LR) depuis le 5 septembre 2024, ' +
      'après huit ans de présidence de Laurent Wauquiez (LR, 2016-2024).',
    dateCreation: new Date('2016-01-01'),
    adresseSiege: '1 esplanade François-Mitterrand, 69269 Lyon Cedex 02',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Conseil_r%C3%A9gional_d%27Auvergne-Rh%C3%B4ne-Alpes',
    wikidataId: 'Q19606559',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q456 + lyon.fr (site officiel)
    nom: 'Ville de Lyon',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.lyon.fr',
    description:
      'Commune de 540 000 habitants (2024), préfecture du Rhône et capitale des Gaules. ' +
      'Troisième ville de France. Maire : Grégory Doucet (Les Écologistes) depuis juillet 2020, ' +
      'réélu de justesse en mars 2026.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Lyon',
    wikidataId: 'Q456',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1289 + grenoble.fr (site officiel)
    nom: 'Ville de Grenoble',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.grenoble.fr',
    description:
      'Commune de 160 000 habitants, préfecture de l\'Isère. Chef-lieu scientifique et industriel. ' +
      'Maire : Laurence Ruffin (écologiste) depuis le 27 mars 2026, succédant à Éric Piolle (2014-2026).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Grenoble',
    wikidataId: 'Q1289',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q42716 + saint-etienne.fr (site officiel)
    nom: 'Ville de Saint-Étienne',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.saint-etienne.fr',
    description:
      'Commune de 170 000 habitants, préfecture de la Loire. Ville d\'art et design. ' +
      'Maire : Régis Juanico (PS) depuis le 27 mars 2026, succédant à Gaël Perdriau (condamné déc. 2025).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Saint-%C3%89tienne',
    wikidataId: 'Q42716',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q42168 + clermont-ferrand.fr (site officiel)
    nom: 'Ville de Clermont-Ferrand',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.clermont-ferrand.fr',
    description:
      'Commune de 145 000 habitants, préfecture du Puy-de-Dôme et capitale de l\'Auvergne. ' +
      'Siège de Michelin. Maire : Julien Bony depuis le 27 mars 2026, succédant à Olivier Bianchi (2014-2026).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Clermont-Ferrand',
    wikidataId: 'Q42168',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q28726684 + annecy.fr (site officiel)
    nom: 'Ville d\'Annecy',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.annecy.fr',
    description:
      'Commune de 130 000 habitants, préfecture de Haute-Savoie, au bord du lac d\'Annecy. ' +
      'Maire : Antoine Armand (centriste-droite) depuis le 27 mars 2026, succédant à François Astorg (2020-2026).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Annecy',
    wikidataId: 'Q28726684',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q20012759 + Wikipédia FR
    nom: 'Les Républicains',
    sigle: 'LR',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.republicains.fr',
    description:
      'Parti politique français de droite, fondé en 2015 à partir de l\'UMP. ' +
      'Dominant en ARA (présidence régionale Wauquiez 2016-2024, Pannekoucke depuis 2024). ' +
      'Président national : Bruno Retailleau (élu mai 2025).',
    dateCreation: new Date('2015-05-30'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_R%C3%A9publicains',
    wikidataId: 'Q20012759',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q10977 + leprogres.fr (site officiel)
    nom: 'Le Progrès',
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.leprogres.fr',
    description:
      'Quotidien régional de la métropole lyonnaise et du Rhône, fondé en 1859. ' +
      'Appartient au groupe Ebra (Crédit Mutuel). Diffusion ~ 100 000 ex. (2024).',
    dateCreation: new Date('1859-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Le_Progr%C3%A8s_(quotidien)',
    wikidataId: 'Q10977',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    // Sources : Wikidata Q2642655 + ledauphine.com (site officiel)
    nom: 'Le Dauphiné Libéré',
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.ledauphine.com',
    description:
      'Quotidien régional du Dauphiné (Isère, Drôme, Savoies), fondé en 1945. ' +
      'Appartient au groupe Ebra (Crédit Mutuel). Diffusion ~ 150 000 ex. (2024).',
    dateCreation: new Date('1945-06-08'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Le_Dauphin%C3%A9_lib%C3%A9r%C3%A9',
    wikidataId: 'Q2642655',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_wauquiez: {
    url: 'https://fr.wikipedia.org/wiki/Laurent_Wauquiez',
    titre: 'Laurent Wauquiez — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Biographie : ENS, ENA, maire du Puy-en-Velay, président LR 2017-2019, président Région ARA 2016-2024, ' +
      'député Haute-Loire 2024, président groupe LR à l\'AN depuis juillet 2024.',
    verifiee: true,
  },
  wp_pannekoucke: {
    url: 'https://fr.wikipedia.org/wiki/Fabrice_Pannekoucke',
    titre: 'Fabrice Pannekoucke — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Biographie : député de Savoie 2014-2024, vice-président Région ARA, élu président Région ARA le 5 sept. 2024.',
    verifiee: true,
  },
  ara_pannekoucke_election: {
    url: 'https://www.auvergnerhonealpes.fr/actualites/fabrice-pannekoucke-est-le-nouveau-president-de-la-region-auvergne-rhone-alpes',
    titre: 'Fabrice Pannekoucke est le nouveau président de la Région Auvergne-Rhône-Alpes',
    media: 'Région Auvergne-Rhône-Alpes (site officiel)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-09-05'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Service communication Région ARA',
    description:
      'Communiqué officiel : Fabrice Pannekoucke (LR) élu président du Conseil régional ARA le 5 sept. 2024, ' +
      'succédant à Laurent Wauquiez.',
    verifiee: true,
  },
  wp_doucet: {
    url: 'https://fr.wikipedia.org/wiki/Gr%C3%A9gory_Doucet',
    titre: 'Grégory Doucet — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Biographie : ingénieur, ONG humanitaire, maire de Lyon depuis le 4 juillet 2020 (EELV), réélu mars 2026.',
    verifiee: true,
  },
  fb_doucet_reelu: {
    url: 'https://www.francebleu.fr/auvergne-rhone-alpes/rhone-69/lyon/municipales-2026-a-lyon-le-sortant-ecologiste-gregory-doucet-largement-reelu-face-a-jean-michel-aulas-2501804',
    titre: 'Municipales 2026 : à Lyon, l\'écologiste Grégory Doucet réélu de peu face à Jean-Michel Aulas',
    media: 'France Bleu Rhône',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-03-22'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction France Bleu Rhône',
    description:
      'Doucet réélu avec 50,67 % face à Aulas (49,33 %) le 22 mars 2026 ; recours électoral annoncé par Aulas.',
    verifiee: true,
  },
  wp_piolle: {
    url: 'https://fr.wikipedia.org/wiki/%C3%89ric_Piolle',
    titre: 'Éric Piolle — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Biographie : ingénieur INRIA/HP, maire EELV de Grenoble 2014-2026, ne se représente pas en 2026.',
    verifiee: true,
  },
  wp_perdriau: {
    url: 'https://fr.wikipedia.org/wiki/Ga%C3%ABl_Perdriau',
    titre: 'Gaël Perdriau — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Biographie : maire LR de Saint-Étienne 2014-2025, condamné en 1re instance le 1er déc. 2025, appel en cours.',
    verifiee: true,
  },
  wp_affaire_perdriau: {
    url: 'https://fr.wikipedia.org/wiki/Affaire_du_chantage_%C3%A0_la_sextape_%C3%A0_Saint-%C3%89tienne',
    titre: 'Affaire du chantage à la sextape à Saint-Étienne — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Synthèse de l\'affaire : chantage à la vidéo intime visant Gilles Artigues, détournement de fonds publics, ' +
      'mise en examen 2023, jugement 1re instance déc. 2025, appel en cours.',
    verifiee: true,
  },
  anticor_perdriau_condamnation: {
    url: 'https://observatoire.anticor.org/2025/12/01/gael-perdriau-maire-de-saint-etienne-condamne-a-quatre-ans-de-prison-ferme-et-a-cinq-ans-dineligibilite-avec-execution-immediate/',
    titre: 'Gaël Perdriau condamné à quatre ans de prison ferme et à cinq ans d\'inéligibilité — Anticor',
    media: 'Observatoire Anticor',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-12-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Observatoire Anticor',
    description:
      'Jugement du tribunal correctionnel de Lyon du 1er déc. 2025 : 4 ans de prison ferme, ' +
      '5 ans d\'inéligibilité exécutée immédiatement. Chefs : chantage, association de malfaiteurs, ' +
      'détournement de fonds publics.',
    verifiee: true,
  },
  france3_perdriau_appel: {
    url: 'https://france3-regions.franceinfo.fr/auvergne-rhone-alpes/rhone/lyon/proces-en-appel-du-chantage-a-la-video-intime-je-vis-un-enfer-depuis-4-ans-je-ne-suis-pas-un-pourri-gael-perdriau-se-defend-3366511.html',
    titre: 'Procès en appel du chantage à la vidéo intime : Perdriau se défend à Lyon (juin 2026)',
    media: 'France 3 Auvergne-Rhône-Alpes',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-06-09'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction France 3 ARA',
    description:
      'Audience d\'appel (8-12 juin 2026) à Lyon. Parquet requiert 5 ans dont 2 avec sursis et 10 ans d\'inéligibilité. ' +
      'Délibéré attendu le 10 septembre 2026. Décision 1re instance non définitive.',
    verifiee: true,
  },
  fb_juanico_maire: {
    url: 'https://www.francebleu.fr/auvergne-rhone-alpes/loire-42/saint-etienne/municipales-2026-saint-etienne-bascule-a-gauche-regis-juanico-elu-maire-2343474',
    titre: 'Municipales 2026 : Saint-Étienne bascule à gauche, Régis Juanico élu maire',
    media: 'France Bleu Loire',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-03-27'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction France Bleu Loire',
    description:
      'Régis Juanico (PS) élu maire de Saint-Étienne le 27 mars 2026 par le nouveau conseil municipal. ' +
      'Saint-Étienne bascule à gauche pour la première fois depuis plusieurs décennies.',
    verifiee: true,
  },
  wp_bianchi: {
    url: 'https://fr.wikipedia.org/wiki/Olivier_Bianchi_(homme_politique)',
    titre: 'Olivier Bianchi — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description: 'Biographie : maire PS de Clermont-Ferrand 2014-2026, ne se représente pas en 2026.',
    verifiee: true,
  },
  wp_astorg: {
    url: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Astorg',
    titre: 'François Astorg — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description: 'Biographie : maire EELV d\'Annecy juin 2020 - mars 2026, remplacé par Antoine Armand.',
    verifiee: true,
  },
  wp_juanico: {
    url: 'https://fr.wikipedia.org/wiki/R%C3%A9gis_Juanico',
    titre: 'Régis Juanico — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description: 'Biographie : député PS de la Loire 2007-2022, élu maire de Saint-Étienne le 27 mars 2026.',
    verifiee: true,
  },
  wp_armand: {
    url: 'https://fr.wikipedia.org/wiki/Antoine_Armand',
    titre: 'Antoine Armand — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Biographie : énarque, député Haute-Savoie 2022-2025, ministre Économie (Bayrou, janv. 2025), ' +
      'élu maire d\'Annecy le 27 mars 2026.',
    verifiee: true,
  },
  wp_lr: {
    url: 'https://fr.wikipedia.org/wiki/Les_R%C3%A9publicains',
    titre: 'Les Républicains — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Parti de droite français, fondé en 2015 (ex-UMP). Dominant en ARA. ' +
      'Président national : Bruno Retailleau (élu mai 2025).',
    verifiee: true,
  },
  wp_conseil_regional_ara: {
    url: 'https://fr.wikipedia.org/wiki/Conseil_r%C3%A9gional_d%27Auvergne-Rh%C3%B4ne-Alpes',
    titre: 'Conseil régional d\'Auvergne-Rhône-Alpes — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Assemblée régionale créée le 1er janv. 2016, fusion de Rhône-Alpes et Auvergne. ' +
      'Majorité LR depuis les élections de décembre 2015.',
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002).
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Conseil régional ARA : présidences ---
  {
    // P-O : Wauquiez président de la région ARA 2016-2024
    aType: 'personne',
    aRef: 'Q984375',
    bType: 'organisation',
    bRef: 'Q19606559',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Laurent Wauquiez (LR) a présidé le Conseil régional Auvergne-Rhône-Alpes du 4 janvier 2016 ' +
      'au 22 juin 2024, date de sa démission après sa réélection comme député de Haute-Loire.',
    dateDebut: new Date('2016-01-04'),
    dateFin: new Date('2024-06-22'),
    sourceRef: 'wp_wauquiez',
  },
  {
    // P-O : Pannekoucke président de la région ARA depuis sept. 2024
    aType: 'personne',
    aRef: 'Q62887804',
    bType: 'organisation',
    bRef: 'Q19606559',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Fabrice Pannekoucke (LR) est élu président du Conseil régional Auvergne-Rhône-Alpes ' +
      'le 5 septembre 2024, succédant à Laurent Wauquiez démissionnaire.',
    dateDebut: new Date('2024-09-05'),
    dateFin: null,
    sourceRef: 'ara_pannekoucke_election',
  },
  {
    // P-P : succession régionale Wauquiez → Pannekoucke
    aType: 'personne',
    aRef: 'Q984375',
    bType: 'personne',
    bRef: 'Q62887804',
    typeLienCode: 'politique',
    description:
      'Wauquiez a soutenu Pannekoucke, son vice-président à la Région, comme successeur à la présidence ' +
      'du Conseil régional ARA lors de sa démission de juin 2024.',
    dateDebut: new Date('2024-06-22'),
    dateFin: null,
    sourceRef: 'ara_pannekoucke_election',
  },

  // --- Affiliations LR ---
  {
    // P-O : Wauquiez membre de LR
    aType: 'personne',
    aRef: 'Q984375',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Laurent Wauquiez est membre de Les Républicains, dont il a été président national ' +
      'de décembre 2017 à juin 2019.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_lr',
  },
  {
    // P-O : Wauquiez président national de LR (2017-2019)
    aType: 'personne',
    aRef: 'Q984375',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'DIRIGEANT',
    description:
      'Laurent Wauquiez a été élu président de Les Républicains le 13 décembre 2017 (79 % des voix) ; ' +
      'il démissionne le 2 juin 2019 après le résultat des élections européennes (8,5 %).',
    dateDebut: new Date('2017-12-13'),
    dateFin: new Date('2019-06-02'),
    sourceRef: 'wp_lr',
  },
  {
    // P-O : Pannekoucke membre de LR
    aType: 'personne',
    aRef: 'Q62887804',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Fabrice Pannekoucke est membre de Les Républicains, formation sous l\'étiquette de laquelle ' +
      'il a été élu député de Savoie et président de la Région ARA.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_pannekoucke',
  },
  {
    // P-O : Perdriau membre de LR
    aType: 'personne',
    aRef: 'Q17497010',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Gaël Perdriau est membre de Les Républicains, parti sous l\'étiquette duquel il a été élu ' +
      'et réélu maire de Saint-Étienne.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_perdriau',
  },

  // --- Mandats de maires ---
  {
    // P-O : Doucet maire de Lyon (mandat en cours, réélu 2026)
    aType: 'personne',
    aRef: 'Q85305187',
    bType: 'organisation',
    bRef: 'Q456',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Grégory Doucet (Les Écologistes) est maire de Lyon depuis le 4 juillet 2020, réélu le 22 mars 2026 ' +
      'avec 50,67 % face à Jean-Michel Aulas (recours électoral en cours).',
    dateDebut: new Date('2020-07-04'),
    dateFin: null,
    sourceRef: 'fb_doucet_reelu',
  },
  {
    // P-O : Piolle maire de Grenoble 2014-2026 (mandat terminé)
    aType: 'personne',
    aRef: 'Q16007948',
    bType: 'organisation',
    bRef: 'Q1289',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Éric Piolle (EELV) a été maire de Grenoble du 4 avril 2014 au 26 mars 2026. ' +
      'Ne s\'étant pas représenté, il est remplacé par Laurence Ruffin (écologiste) élue le 27 mars 2026.',
    dateDebut: new Date('2014-04-04'),
    dateFin: new Date('2026-03-26'),
    sourceRef: 'wp_piolle',
  },
  {
    // P-O : Perdriau maire de Saint-Étienne 2014 → déc. 2025 (révoqué par condamnation)
    // ⚠ Condamnation en 1re instance (non définitive) — appel en cours, délibéré sept. 2026.
    aType: 'personne',
    aRef: 'Q17497010',
    bType: 'organisation',
    bRef: 'Q42716',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Gaël Perdriau (LR) a été maire de Saint-Étienne du 30 mars 2014 jusqu\'à la prise de fonction ' +
      'en urgence de Jean-Pierre Berger le 11 décembre 2025, consécutive à sa condamnation en 1re instance ' +
      '(1er déc. 2025) assortie d\'une peine d\'inéligibilité d\'exécution immédiate. ' +
      '⚠ Décision frappée d\'appel (délibéré 10 sept. 2026) — présomption d\'innocence.',
    dateDebut: new Date('2014-03-30'),
    dateFin: new Date('2025-12-11'),
    sourceRef: 'anticor_perdriau_condamnation',
  },
  {
    // P-O : Perdriau ↔ Saint-Étienne — lien juridique (affaire chantage/détournement)
    // ⚠ Chefs retenus en 1re instance : chantage, association de malfaiteurs, détournement de fonds publics.
    // Appel en cours — présomption d'innocence jusqu'à décision définitive.
    aType: 'personne',
    aRef: 'Q17497010',
    bType: 'organisation',
    bRef: 'Q42716',
    typeLienCode: 'juridique',
    description:
      'Affaire du chantage à la sextape à Saint-Étienne. Gaël Perdriau condamné en 1re instance le ' +
      '1er décembre 2025 (4 ans de prison ferme, 5 ans d\'inéligibilité) pour chantage à la vidéo intime ' +
      'visant son ancien adjoint Gilles Artigues, association de malfaiteurs et détournement de fonds publics ' +
      'au détriment de la Ville de Saint-Étienne. Appel en cours — délibéré cour d\'appel de Lyon le 10 sept. 2026. ' +
      '⚠ Condamnation en 1re instance NON définitive. Présomption d\'innocence applicable.',
    dateDebut: new Date('2023-04-06'),
    dateFin: null,
    sourceRef: 'anticor_perdriau_condamnation',
  },
  {
    // P-O : Juanico maire de Saint-Étienne depuis mars 2026
    aType: 'personne',
    aRef: 'Q3455745',
    bType: 'organisation',
    bRef: 'Q42716',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Régis Juanico (PS) est élu maire de Saint-Étienne le 27 mars 2026 par le nouveau conseil municipal, ' +
      'à la tête d\'une coalition de gauche. Première bascule à gauche de la ville depuis plusieurs décennies.',
    dateDebut: new Date('2026-03-27'),
    dateFin: null,
    sourceRef: 'fb_juanico_maire',
  },
  {
    // P-O : Bianchi maire de Clermont-Ferrand 2014-2026
    aType: 'personne',
    aRef: 'Q16667915',
    bType: 'organisation',
    bRef: 'Q42168',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Olivier Bianchi (PS) a été maire de Clermont-Ferrand du 30 mars 2014 au 26 mars 2026. ' +
      'Ne s\'étant pas représenté, il est remplacé par Julien Bony le 27 mars 2026.',
    dateDebut: new Date('2014-03-30'),
    dateFin: new Date('2026-03-26'),
    sourceRef: 'wp_bianchi',
  },
  {
    // P-O : Astorg maire d'Annecy 2020-2026
    aType: 'personne',
    aRef: 'Q96739529',
    bType: 'organisation',
    bRef: 'Q28726684',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'François Astorg (EELV) a été maire d\'Annecy du 28 juin 2020 au 27 mars 2026. ' +
      'Remplacé par Antoine Armand (centriste-droite) aux élections municipales de mars 2026.',
    dateDebut: new Date('2020-06-28'),
    dateFin: new Date('2026-03-27'),
    sourceRef: 'wp_astorg',
  },
  {
    // P-O : Armand maire d'Annecy depuis mars 2026
    aType: 'personne',
    aRef: 'Q63436533',
    bType: 'organisation',
    bRef: 'Q28726684',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Antoine Armand est élu maire d\'Annecy le 27 mars 2026 à la tête d\'une liste centriste-droite. ' +
      'Il succède à François Astorg (EELV) et cumule ce mandat avec son statut de figure centrale de la ' +
      'droite de gouvernement en Haute-Savoie.',
    dateDebut: new Date('2026-03-27'),
    dateFin: null,
    sourceRef: 'wp_armand',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (pattern identique à seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-region-ara] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-region-ara] Entité introuvable pour lien ${lien.typeLienCode} ` +
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
  console.log('⚠ Suppression données Région ARA précédentes...')
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
  console.log('\n┌─ seed-region-ara — Auvergne-Rhône-Alpes ────────────────────┐\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`✓ User : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ✓ ${data.titre}`)
  }

  console.log('\n— Personnes (Wikidata) —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ✓ ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n— Organisations (Wikidata) —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ✓ ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Liens —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ✓ ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n┌─ Bilan ──────────────────────────────────────────────────────┐')
  console.log(`│ Personnes     : ${PERSONNES.length} (Wauquiez, Pannekoucke, Doucet, Piolle, Perdriau,`)
  console.log(`│                   Bianchi, Astorg, Juanico, Armand)`)
  console.log(`│ Organisations : ${ORGANISATIONS.length} (CRégional ARA, 5 communes, LR, Le Progrès, Le Dauphiné)`)
  console.log(`│ Sources       : ${Object.keys(SOURCES).length} (Wikipédia, Région ARA off., France Bleu, France 3, Anticor)`)
  console.log(`│ Liens         : ${LIENS.length} (MANDAT_ELECTIF, ANCIEN_MANDAT, AFFILIATION_PARTI, DIRIGEANT, politique, juridique)`)
  console.log('│')
  console.log('│ ⚠  Affaire Perdriau : condamné en 1re instance (1er déc. 2025)')
  console.log('│    → appel en cours, délibéré 10 sept. 2026 — non définitif.')
  console.log('│    Présomption d\'innocence applicable jusqu\'à décision définitive.')
  console.log('└──────────────────────────────────────────────────────────────┘\n')
}

main()
  .catch((err) => {
    console.error('[seed-region-ara] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
