/**
 * Seed Bourgogne-Franche-Comté — réseau d'influence régional
 *
 * Sources : Wikidata (Q-ids vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR, dijon.fr, France 3 Bourgogne, France Bleu.
 *
 * Périmètre :
 *   - Région BFC : Conseil régional (Q18578267) + présidente Marie-Guite Dufay (Q446672, PS)
 *   - Maires des 5 principales communes :
 *       Dijon     — Nathalie Koenders (Q20751699, PS, depuis nov. 2024)
 *                 — François Rebsamen (Q383499, PS, 2014-2024) [ANCIEN_MANDAT]
 *       Besançon  — Anne Vignot (Q87829219, LV, 2020-2026) [ANCIEN_MANDAT]
 *       Belfort   — Damien Meslot (Q3012817, LR, 2014-2026) [ANCIEN_MANDAT]
 *       Nevers    — Denis Thuriot (Q33210176, Renaissance, 2014-) [3e mandat mars 2026]
 *       Chalon    — Gilles Platret (Q33103460, LR, 2014-2026) [ANCIEN_MANDAT]
 *   - Presse régionale : Le Bien Public (Q3220437), L'Est Républicain (Q3052319)
 *   - Économique optionnel : Stellantis → Région BFC (Sochaux, ~12 000 emplois) —
 *       requiert seed-cac40-b5 ; skip avec avertissement si absent
 *   - Affiliations partisanes PS/LR/Les Verts (trouverOuCréer sans écraser)
 *
 * Garde-fous RGPD :
 *   - statut EN_ATTENTE sur toutes les entités (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur les personnes
 *   - idempotent (upsert par wikidataId)
 *   - présomption d'innocence : aucune affaire judiciaire incluse sans
 *     statut procédural exact + source publique datée. À compléter via
 *     canal éditorial sur la base de procédures publiques documentées.
 *
 * Dépendances (optionnelles) :
 *   - seed-demo          : user admin remi@reseauxinfluences.fr
 *   - seed-macron-v2     : Renaissance (Q23731823) → lien Thuriot [optionnel]
 *   - seed-hollande      : PS (Q170972), Les Verts (Q613786) [créés ici si absents]
 *   - seed-partis-chefs  : LR (Q20012759) [créé ici si absent]
 *   - seed-cac40-b5      : Stellantis (Q97439162) [lien economique optionnel]
 *
 * Usage :
 *   cd backend && node bin/seed-region-bfc.js
 *   cd backend && node bin/seed-region-bfc.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — recoupées ≥ 2 sources publiques (cf. commentaires inline).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q446672 + Wikipédia FR (marie-guite-dufay) + CR BFC (bourgognefranchecomte.fr)
    // Présidente du Conseil régional BFC depuis la création de la région le 1er janvier 2016 ;
    // ré-élue le 2 juillet 2021 (régionales BFC, liste PS-gauche).
    nom: 'Dufay',
    prenom: 'Marie-Guite',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1949-05-21'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Présidente du Conseil régional de Bourgogne-Franche-Comté',
    rolesSecondaires: [
      'ancienne conseillère régionale de Franche-Comté (2004-2015)',
      'membre du Parti socialiste',
    ],
    bio:
      'Marie-Guite Dufay (née le 21 mai 1949) est la première et unique présidente du Conseil régional ' +
      'de Bourgogne-Franche-Comté depuis la création de la région fusionnée le 1er janvier 2016. ' +
      'Membre du Parti socialiste, elle avait auparavant été conseillère régionale de Franche-Comté. ' +
      'Elle a été ré-élue en juillet 2021 à la tête de la région.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Marie-Guite_Dufay',
    wikidataId: 'Q446672',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q383499 + Wikipédia FR (francois-rebsamen)
    // Maire de Dijon du 30 mars 2014 au 18 novembre 2024 (démission, transmission à Koenders).
    // Ancien ministre du Travail (2014-2016) sous Hollande.
    nom: 'Rebsamen',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1951-06-25'),
    lieuNaissance: 'Sainte-Marie-aux-Mines (Haut-Rhin)',
    rolePrincipal: 'Ancien maire de Dijon (2014-2024)',
    rolesSecondaires: [
      "ancien ministre du Travail, de l'Emploi et du Dialogue social (2014-2016)",
      'ancien sénateur de la Côte-d\'Or',
      'membre du Parti socialiste',
    ],
    bio:
      'François Rebsamen (né le 25 juin 1951) a été maire de Dijon du 30 mars 2014 au 18 novembre 2024, ' +
      'date à laquelle il a transmis sa charge à Nathalie Koenders. Ministre du Travail sous François ' +
      'Hollande (2014-2016) et ancien sénateur, il est une figure historique du Parti socialiste en Côte-d\'Or.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Rebsamen',
    wikidataId: 'Q383499',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q20751699 + Wikipédia FR (nathalie-koenders)
    //           + dijon.fr (fiche officielle maire) + macommune.info (réélection mars 2026)
    // Première femme maire de Dijon. Élue par le conseil municipal le 25 nov. 2024
    // après la démission de Rebsamen, puis réélue lors des municipales du 22 mars 2026.
    nom: 'Koenders',
    prenom: 'Nathalie',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1977-03-01'),
    lieuNaissance: null,
    rolePrincipal: 'Maire de Dijon',
    rolesSecondaires: [
      'ancienne première adjointe au maire de Dijon',
      'ancienne conseillère départementale de la Côte-d\'Or',
      'membre du Parti socialiste',
      'ancienne championne de kayak',
    ],
    bio:
      'Nathalie Koenders (née le 1er mars 1977) est la première femme maire de Dijon. ' +
      'Élue par le conseil municipal le 25 novembre 2024 après la démission de François Rebsamen, ' +
      'elle a été réélue aux élections municipales du 22 mars 2026. ' +
      'Membre du Parti socialiste, elle avait été première adjointe de Rebsamen pendant dix ans.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nathalie_Koenders',
    wikidataId: 'Q20751699',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q87829219 + Wikipédia FR (anne-vignot)
    // Mairesse de Besançon du 28 juin 2020 au 21 mars 2026 (élections municipales).
    // Les Verts / EELV, militante écologiste de longue date.
    nom: 'Vignot',
    prenom: 'Anne',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1960-02-28'),
    lieuNaissance: null,
    rolePrincipal: 'Ancienne mairesse de Besançon (2020-2026)',
    rolesSecondaires: [
      'ancienne adjointe à la mairie de Besançon (2014-2020)',
      'ancienne conseillère régionale BFC (2020-2026)',
      'membre des Verts / Les Écologistes',
    ],
    bio:
      'Anne Vignot (née le 28 février 1960) a été mairesse de Besançon du 28 juin 2020 au 21 mars 2026, ' +
      "terme au cours duquel elle a présidé le Grand Besançon Métropole. Militante de longue date " +
      'des Verts, elle a aussi été conseillère régionale de BFC. Son mandat a pris fin avec les ' +
      'élections municipales de mars 2026.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Anne_Vignot',
    wikidataId: 'Q87829219',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3012817 + Wikipédia FR (damien-meslot)
    // Maire de Belfort du 4 avril 2014 au 21 mars 2026 (deux mandats consécutifs).
    // Ancien député du Territoire de Belfort (2002-2017), LR.
    nom: 'Meslot',
    prenom: 'Damien',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1964-11-11'),
    lieuNaissance: 'Belfort (Territoire de Belfort)',
    rolePrincipal: 'Ancien maire de Belfort (2014-2026)',
    rolesSecondaires: [
      'ancien député du Territoire de Belfort (2002-2017)',
      'membre des Républicains (LR)',
    ],
    bio:
      'Damien Meslot (né le 11 novembre 1964 à Belfort) a été maire de Belfort du 4 avril 2014 au ' +
      '21 mars 2026 (deux mandats). Ancien député de droite représentant le Territoire de Belfort ' +
      'à l\'Assemblée nationale de 2002 à 2017, il est membre des Républicains.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Damien_Meslot',
    wikidataId: 'Q3012817',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q33210176 + EverybodyWiki (denis-thuriot)
    //           + France 3 BFC (3e mandat mars 2026, url ci-dessous)
    // Maire de Nevers depuis le 30 mars 2014 (3 mandats consécutifs).
    // Ancien PS, rejoint En Marche en 2016, affilié Renaissance depuis.
    nom: 'Thuriot',
    prenom: 'Denis',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-08-19'),
    lieuNaissance: 'Nevers (Nièvre)',
    rolePrincipal: 'Maire de Nevers',
    rolesSecondaires: [
      'avocat de profession',
      'ancien membre du Parti socialiste (jusqu\'en 2012)',
      'membre de Renaissance (ex-En Marche, depuis 2016)',
    ],
    bio:
      'Denis Thuriot (né le 19 août 1966 à Nevers) est avocat et maire de Nevers depuis le 30 mars 2014. ' +
      'Il a organisé le premier meeting officiel de campagne d\'Emmanuel Macron en 2017 et a rejoint ' +
      'En Marche cette année-là. Réélu en 2020 puis en mars 2026 (3e mandat), il reste une figure ' +
      'locale de la majorité présidentielle en Nièvre.',
    wikipediaUrl: null,
    wikidataId: 'Q33210176',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q33103460 + Wikipédia FR (gilles-platret)
    // Maire de Chalon-sur-Saône du 30 mars 2014 au 21 mars 2026 (deux mandats).
    // Droite gaulliste, LR ; ancien conseiller régional BFC.
    nom: 'Platret',
    prenom: 'Gilles',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1973-04-19'),
    lieuNaissance: null,
    rolePrincipal: 'Ancien maire de Chalon-sur-Saône (2014-2026)',
    rolesSecondaires: [
      'ancien conseiller régional BFC (2014-2020)',
      'membre des Républicains (LR)',
    ],
    bio:
      'Gilles Platret (né le 19 avril 1973) a été maire de Chalon-sur-Saône du 30 mars 2014 au ' +
      '21 mars 2026 (deux mandats consécutifs). Membre des Républicains, il a également siégé ' +
      'au Conseil régional de BFC de 2014 à 2020. Son mandat a pris fin avec les élections ' +
      'municipales de mars 2026.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Gilles_Platret',
    wikidataId: 'Q33103460',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — communes, région, médias.
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q18578267 + Wikipédia FR + bourgognefranchecomte.fr
    nom: 'Région Bourgogne-Franche-Comté',
    sigle: 'BFC',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.bourgognefranchecomte.fr',
    description:
      'Région administrative française créée le 1er janvier 2016 par la fusion de la Bourgogne ' +
      'et de la Franche-Comté (loi NOTRe). Siège du Conseil régional à Besançon. ' +
      "Superficie : 47 784 km². Population : ~2,8 M d'habitants (2020). " +
      'Présidente depuis 2016 : Marie-Guite Dufay (PS).',
    dateCreation: new Date('2016-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bourgogne-Franche-Comt%C3%A9',
    wikidataId: 'Q18578267',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q7003 + Wikipédia FR + dijon.fr
    nom: 'Ville de Dijon',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.dijon.fr',
    description:
      "Préfecture de la Côte-d'Or (21) et capitale historique de la Bourgogne. " +
      "Environ 155 000 habitants. Siège du Conseil régional BFC et de Dijon Métropole. " +
      "Maire depuis novembre 2024 : Nathalie Koenders (PS).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Dijon',
    wikidataId: 'Q7003',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q37776 + Wikipédia FR + besancon.fr
    nom: 'Ville de Besançon',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.besancon.fr',
    description:
      'Préfecture du Doubs (25) et ancienne capitale de la Franche-Comté. ' +
      'Environ 117 000 habitants. Siège du Conseil régional BFC (Parlement régional). ' +
      'Mairesse de 2020 à 2026 : Anne Vignot (Les Verts).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Besan%C3%A7on',
    wikidataId: 'Q37776',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q171545 + Wikipédia FR + belfort.fr
    nom: 'Ville de Belfort',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.belfort.fr',
    description:
      "Chef-lieu du Territoire de Belfort (90), département le plus petit de France métropolitaine. " +
      "Environ 47 000 habitants. Ville industrielle historique (General Electric, Alstom). " +
      "Maire de 2014 à 2026 : Damien Meslot (LR).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Belfort',
    wikidataId: 'Q171545',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q166997 + Wikipédia FR + ville-nevers.fr
    nom: 'Ville de Nevers',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.ville-nevers.fr',
    description:
      "Préfecture de la Nièvre (58), au confluent de la Loire et de l'Allier. " +
      "Environ 32 000 habitants. Ville marquée par la faïencerie et la cathédrale Saint-Cyr. " +
      "Maire depuis 2014 : Denis Thuriot (Renaissance), réélu en 2020 et en mars 2026.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nevers',
    wikidataId: 'Q166997',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q203645 + Wikipédia FR + chalon.fr
    nom: 'Ville de Chalon-sur-Saône',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.chalon.fr',
    description:
      "Commune de Saône-et-Loire (71), deuxième ville de Bourgogne. " +
      "Environ 45 000 habitants. Ville natale de Nicéphore Niépce (invention de la photographie). " +
      "Maire de 2014 à 2026 : Gilles Platret (LR).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Chalon-sur-Sa%C3%B4ne',
    wikidataId: 'Q203645',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3220437 + Wikipédia FR (Le Bien Public)
    // Quotidien régional dijonnais fondé en 1868. Appartient au groupe EBRA
    // (Est Bourgogne Rhône Alpes, filiale du Crédit Mutuel).
    nom: 'Le Bien Public',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.bienpublic.com',
    description:
      "Quotidien régional couvrant la Côte-d'Or et la Saône-et-Loire, fondé en 1868 à Dijon. " +
      "Appartient au groupe EBRA (Est Bourgogne Rhône Alpes), filiale du Crédit Mutuel Alliance Fédérale. " +
      "Diffusion : ~35 000 exemplaires (2023). L'un des principaux médias de presse écrite de BFC.",
    dateCreation: new Date('1868-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Le_Bien_public',
    wikidataId: 'Q3220437',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    // Sources : Wikidata Q3052319 + Wikipédia FR (L'Est Républicain)
    // Quotidien régional couvrant la Lorraine et la Franche-Comté, fondé en 1889.
    // Siège à Nancy ; appartient aussi au groupe EBRA (Crédit Mutuel).
    nom: "L'Est Républicain",
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.estrepublicain.fr',
    description:
      "Quotidien régional fondé en 1889, siège à Nancy, couvrant la Lorraine et la Franche-Comté. " +
      "Appartient au groupe EBRA (filiale Crédit Mutuel). Principal journal de presse écrite en " +
      "Franche-Comté (Doubs, Jura, Haute-Saône, Belfort). Diffusion : ~125 000 exemplaires (2022).",
    dateCreation: new Date('1889-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/L%27Est_r%C3%A9publicain',
    wikidataId: 'Q3052319',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
]

// ---------------------------------------------------------------------------
// PARTIS — trouver ou créer (sans écraser les données existantes si déjà en base).
// Ces trois partis peuvent être insérés par seed-hollande.js (PS, Les Verts)
// et seed-partis-chefs.js (LR). Le BFC seed les crée s'ils sont absents.
// ---------------------------------------------------------------------------

const PARTIS = [
  {
    // Sources : Wikidata Q170972 + Wikipédia FR (Parti socialiste France)
    nom: 'Parti socialiste',
    sigle: 'PS',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.parti-socialiste.fr',
    description:
      "Parti politique français de centre-gauche fondé le 11 juillet 1969. " +
      "Parti de gouvernement sous Mitterrand (1981-1995) et Hollande (2012-2017). " +
      "Premier secrétaire depuis 2018 : Olivier Faure.",
    dateCreation: new Date('1969-07-11'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Parti_socialiste_(France)',
    wikidataId: 'Q170972',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q613786 + Wikipédia FR (Les Verts / Les Écologistes)
    nom: 'Les Écologistes',
    sigle: 'EELV',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://lesecologistes.eu',
    description:
      "Parti écologiste français, fondé en 1984 sous le nom « Les Verts », " +
      "renommé « Europe Écologie Les Verts » (EELV) en 2010, puis « Les Écologistes » en 2022. " +
      "Représenté au Conseil régional de BFC depuis 2020.",
    dateCreation: new Date('1984-01-28'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_%C3%89cologistes',
    wikidataId: 'Q613786',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q20012759 + Wikipédia FR (Les Républicains)
    nom: 'Les Républicains',
    sigle: 'LR',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.republicains.fr',
    description:
      "Parti de droite fondé le 30 mai 2015 par renommage de l'UMP. " +
      "Dirigé depuis mai 2025 par Bruno Retailleau. " +
      "Bien implanté dans les grandes villes de BFC (Belfort, Chalon-sur-Saône).",
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
  wp_bfc: {
    url: 'https://fr.wikipedia.org/wiki/Bourgogne-Franche-Comt%C3%A9',
    titre: 'Bourgogne-Franche-Comté — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Région administrative créée le 1er janv. 2016 ; présidente : Marie-Guite Dufay (PS). ' +
      'Siège CR à Besançon. ~2,8 M d\'habitants.',
    verifiee: true,
  },
  wp_dufay: {
    url: 'https://fr.wikipedia.org/wiki/Marie-Guite_Dufay',
    titre: 'Marie-Guite Dufay — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Présidente du Conseil régional BFC depuis le 1er janv. 2016 ; ré-élue le 2 juill. 2021. ' +
      'Née le 21 mai 1949. PS.',
    verifiee: true,
  },
  wp_rebsamen: {
    url: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Rebsamen',
    titre: 'François Rebsamen — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Maire de Dijon du 30 mars 2014 au 18 nov. 2024 ; ancien ministre du Travail (Hollande). ' +
      'PS. A transmis le fauteuil à Nathalie Koenders.',
    verifiee: true,
  },
  wp_koenders: {
    url: 'https://fr.wikipedia.org/wiki/Nathalie_Koenders',
    titre: 'Nathalie Koenders — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Première femme maire de Dijon. Élue le 25 nov. 2024, réélue le 22 mars 2026. ' +
      'Née le 1er mars 1977. PS. Ancienne première adjointe de Rebsamen.',
    verifiee: true,
  },
  dijon_fr_koenders: {
    url: 'https://www.dijon.fr/nouvelle-municipalite-mode-demploi/la-nouvelle-maire-qui-est-elle/',
    titre: 'Nathalie Koenders, nouvelle maire de Dijon — dijon.fr',
    media: 'Ville de Dijon (officiel)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-11-25'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Mairie de Dijon',
    description:
      'Fiche officielle de Nathalie Koenders, élue maire de Dijon par le conseil municipal le 25 nov. 2024.',
    verifiee: true,
  },
  wp_vignot: {
    url: 'https://fr.wikipedia.org/wiki/Anne_Vignot',
    titre: 'Anne Vignot — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Mairesse de Besançon du 28 juin 2020 au 21 mars 2026. Née le 28 fév. 1960. ' +
      'Les Verts / Les Écologistes.',
    verifiee: true,
  },
  wp_meslot: {
    url: 'https://fr.wikipedia.org/wiki/Damien_Meslot',
    titre: 'Damien Meslot — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Maire de Belfort du 4 avr. 2014 au 21 mars 2026 (deux mandats). LR. ' +
      'Né le 11 nov. 1964 à Belfort. Ancien député du Territoire de Belfort (2002-2017).',
    verifiee: true,
  },
  fr3_thuriot: {
    url: 'https://france3-regions.franceinfo.fr/bourgogne-franche-comte/nievre/nevers/apres-une-campagne-chahutee-denis-thuriot-s-offre-un-troisieme-mandat-a-nevers-je-suis-tres-heureux-et-soulage-le-combat-a-ete-difficile-3321705.html',
    titre:
      'Denis Thuriot s\'offre un troisième mandat à Nevers (France 3 BFC)',
    media: 'France 3 Bourgogne-Franche-Comté',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-03-22'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction France 3 BFC',
    description:
      'Denis Thuriot remporte un troisième mandat consécutif à la mairie de Nevers aux élections ' +
      'municipales de mars 2026 ; membre de Renaissance (ex-En Marche).',
    verifiee: true,
  },
  wp_platret: {
    url: 'https://fr.wikipedia.org/wiki/Gilles_Platret',
    titre: 'Gilles Platret — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Maire de Chalon-sur-Saône du 30 mars 2014 au 21 mars 2026 (deux mandats). LR. ' +
      'Né le 19 avr. 1973.',
    verifiee: true,
  },
  wp_bienPublic: {
    url: 'https://fr.wikipedia.org/wiki/Le_Bien_public',
    titre: 'Le Bien Public — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Quotidien régional de Dijon fondé en 1868. Groupe EBRA (Crédit Mutuel). " +
      "Couvre la Côte-d'Or et la Saône-et-Loire.",
    verifiee: true,
  },
  wp_estRep: {
    url: 'https://fr.wikipedia.org/wiki/L%27Est_r%C3%A9publicain',
    titre: "L'Est Républicain — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Quotidien régional fondé en 1889 à Nancy. Groupe EBRA (Crédit Mutuel). " +
      "Couvre la Lorraine et la Franche-Comté (Doubs, Jura, Haute-Saône, Belfort).",
    verifiee: true,
  },
  wp_sochaux: {
    url: 'https://fr.wikipedia.org/wiki/Usine_PSA_de_Sochaux',
    titre: 'Usine PSA de Sochaux — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Site historique de Stellantis à Sochaux (Doubs), premier site industriel de BFC. ' +
      'Environ 12 000 salariés (2023). En production depuis 1912.',
    verifiee: true,
  },
  wp_ps: {
    url: 'https://fr.wikipedia.org/wiki/Parti_socialiste_(France)',
    titre: 'Parti socialiste (France) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Parti politique français de centre-gauche fondé en 1969. ' +
      'Dirigé par Olivier Faure depuis 2018.',
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
      "Parti de droite français fondé en 2015 (ex-UMP). " +
      "Présent à Belfort et Chalon-sur-Saône via Meslot et Platret.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS principaux — les deux entités sont créées dans CE seed.
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Mandats électifs : présidente région ---
  {
    // Dufay → Région BFC (MANDAT_ELECTIF, 2016-)
    aType: 'personne',
    aRef: 'Q446672',
    bType: 'organisation',
    bRef: 'Q18578267',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Marie-Guite Dufay est présidente du Conseil régional de Bourgogne-Franche-Comté depuis ' +
      'le 1er janvier 2016 (création de la région). Ré-élue lors des régionales du 2 juillet 2021.',
    dateDebut: new Date('2016-01-01'),
    dateFin: null,
    sourceRef: 'wp_dufay',
  },

  // --- Mandats électifs : maires ---
  {
    // Rebsamen → Dijon (ANCIEN_MANDAT, 2014-2024)
    aType: 'personne',
    aRef: 'Q383499',
    bType: 'organisation',
    bRef: 'Q7003',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'François Rebsamen a été maire de Dijon du 30 mars 2014 au 18 novembre 2024, date à ' +
      'laquelle il a remis sa démission et transmis la mairie à Nathalie Koenders.',
    dateDebut: new Date('2014-03-30'),
    dateFin: new Date('2024-11-18'),
    sourceRef: 'wp_rebsamen',
  },
  {
    // Koenders → Dijon (MANDAT_ELECTIF, 2024-)
    aType: 'personne',
    aRef: 'Q20751699',
    bType: 'organisation',
    bRef: 'Q7003',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Nathalie Koenders a été élue maire de Dijon par le conseil municipal le 25 novembre 2024 ' +
      'après la démission de François Rebsamen. Première femme à occuper ce poste, elle a été ' +
      'réélue aux élections municipales du 22 mars 2026.',
    dateDebut: new Date('2024-11-25'),
    dateFin: null,
    sourceRef: 'dijon_fr_koenders',
  },
  {
    // Vignot → Besançon (ANCIEN_MANDAT, 2020-2026)
    aType: 'personne',
    aRef: 'Q87829219',
    bType: 'organisation',
    bRef: 'Q37776',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Anne Vignot a été mairesse de Besançon du 28 juin 2020 au 21 mars 2026 (fin de mandat ' +
      'lors des élections municipales). Elle a conduit une liste écologiste et de gauche.',
    dateDebut: new Date('2020-06-28'),
    dateFin: new Date('2026-03-21'),
    sourceRef: 'wp_vignot',
  },
  {
    // Meslot → Belfort (ANCIEN_MANDAT, 2014-2026)
    aType: 'personne',
    aRef: 'Q3012817',
    bType: 'organisation',
    bRef: 'Q171545',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Damien Meslot a été maire de Belfort du 4 avril 2014 au 21 mars 2026. ' +
      'Réélu en 2020 (premier tour), son mandat a pris fin avec les élections municipales de mars 2026.',
    dateDebut: new Date('2014-04-04'),
    dateFin: new Date('2026-03-21'),
    sourceRef: 'wp_meslot',
  },
  {
    // Thuriot → Nevers (MANDAT_ELECTIF, 2014-)
    aType: 'personne',
    aRef: 'Q33210176',
    bType: 'organisation',
    bRef: 'Q166997',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Denis Thuriot est maire de Nevers depuis le 30 mars 2014 (trois mandats consécutifs). ' +
      'Il a été réélu en 2020 (premier tour, 51,2 %) puis en mars 2026, selon France 3 BFC.',
    dateDebut: new Date('2014-03-30'),
    dateFin: null,
    sourceRef: 'fr3_thuriot',
  },
  {
    // Platret → Chalon-sur-Saône (ANCIEN_MANDAT, 2014-2026)
    aType: 'personne',
    aRef: 'Q33103460',
    bType: 'organisation',
    bRef: 'Q203645',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Gilles Platret a été maire de Chalon-sur-Saône du 30 mars 2014 au 21 mars 2026. ' +
      'Réélu en 2020 au premier tour, son mandat a pris fin avec les élections municipales de mars 2026.',
    dateDebut: new Date('2014-03-30'),
    dateFin: new Date('2026-03-21'),
    sourceRef: 'wp_platret',
  },

  // --- Affiliations partisanes PS ---
  {
    aType: 'personne',
    aRef: 'Q446672',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Marie-Guite Dufay est membre du Parti socialiste ; elle a conduit la liste PS-gauche ' +
      'aux régionales BFC de 2015 et 2021.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_dufay',
  },
  {
    aType: 'personne',
    aRef: 'Q383499',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'François Rebsamen est une figure historique du Parti socialiste en Côte-d\'Or ; ' +
      'il a été sénateur PS et a soutenu François Hollande puis rejoint le camp présidentiel.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_rebsamen',
  },
  {
    aType: 'personne',
    aRef: 'Q20751699',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Nathalie Koenders est membre du Parti socialiste. Le PS de Dijon a officiellement ' +
      'soutenu sa candidature aux municipales 2026.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_koenders',
  },

  // --- Affiliation partisane Les Verts ---
  {
    aType: 'personne',
    aRef: 'Q87829219',
    bType: 'organisation',
    bRef: 'Q613786',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Anne Vignot est membre des Verts / Les Écologistes (ex-EELV) ; ' +
      'elle a conduit la liste écologiste à la mairie de Besançon en 2020.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_vignot',
  },

  // --- Affiliations partisanes LR ---
  {
    aType: 'personne',
    aRef: 'Q3012817',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Damien Meslot est membre des Républicains (LR), anciennement UMP. ' +
      'Il a été élu député sous étiquette UMP (2002-2017) avant de devenir maire de Belfort.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_meslot',
  },
  {
    aType: 'personne',
    aRef: 'Q33103460',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Gilles Platret est membre des Républicains (LR). Il a conduit la liste LR ' +
      'à Chalon-sur-Saône en 2014 et 2020.',
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_platret',
  },

  // --- Liens médiatiques (presse régionale → territoire) ---
  {
    // Le Bien Public → Ville de Dijon (mediatique)
    aType: 'organisation',
    aRef: 'Q3220437',
    bType: 'organisation',
    bRef: 'Q7003',
    typeLienCode: 'mediatique',
    description:
      "Le Bien Public est le quotidien régional de référence de Dijon et de la Côte-d'Or. " +
      "Fondé en 1868, il constitue le principal vecteur médiatique de presse écrite sur " +
      "la vie politique et économique dijonnaise.",
    dateDebut: new Date('1868-01-01'),
    dateFin: null,
    sourceRef: 'wp_bienPublic',
  },
  {
    // L'Est Républicain → Région BFC (mediatique)
    aType: 'organisation',
    aRef: 'Q3052319',
    bType: 'organisation',
    bRef: 'Q18578267',
    typeLienCode: 'mediatique',
    description:
      "L'Est Républicain est le principal quotidien de presse écrite de la Franche-Comté, " +
      "couvrant notamment les départements du Doubs (Besançon, Sochaux), du Jura, de la " +
      "Haute-Saône et du Territoire de Belfort.",
    dateDebut: new Date('1889-01-01'),
    dateFin: null,
    sourceRef: 'wp_estRep',
  },
]

// ---------------------------------------------------------------------------
// LIENS OPTIONNELS — requièrent d'autres seeds (skip avec avertissement si absent).
// ---------------------------------------------------------------------------

const LIENS_OPTIONNELS = [
  {
    // Thuriot → Renaissance (Q23731823) — requiert seed-macron-v2
    aType: 'personne',
    aRef: 'Q33210176',
    bType: 'organisation',
    bRef: 'Q23731823',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Denis Thuriot a rejoint En Marche d'Emmanuel Macron en 2016, organisant le premier " +
      "meeting de campagne officiel du candidat. Il est affilié à Renaissance depuis lors.",
    dateDebut: new Date('2016-01-01'),
    dateFin: null,
    sourceRef: 'fr3_thuriot',
  },
  {
    // Stellantis (Q97439162) → Région BFC (Q18578267) — requiert seed-cac40-b5
    aType: 'organisation',
    aRef: 'Q97439162',
    bType: 'organisation',
    bRef: 'Q18578267',
    typeLienCode: 'economique',
    description:
      "L'usine Stellantis de Sochaux (Doubs) est le plus grand site industriel de BFC, " +
      "avec environ 12 000 salariés en 2023. En production depuis 1912 (Peugeot), " +
      "le site constitue un ancrage économique majeur de la région Franche-Comté.",
    dateDebut: new Date('1912-01-01'),
    dateFin: null,
    sourceRef: 'wp_sochaux',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-bfc] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

async function upsertPersonne(data, userId) {
  const existing = await prisma.personne.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.personne.update({ where: { id: existing.id }, data: { ...data, statut: 'EN_ATTENTE' } })
  }
  return prisma.personne.create({ data: { ...data, statut: 'EN_ATTENTE', creeParId: userId } })
}

async function upsertOrganisation(data, userId) {
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.organisation.update({ where: { id: existing.id }, data: { ...data, statut: 'EN_ATTENTE' } })
  }
  return prisma.organisation.create({ data: { ...data, statut: 'EN_ATTENTE', creeParId: userId } })
}

// Pour les partis : crée seulement si absent (ne pas écraser les données de seed-partis-chefs/seed-hollande).
async function trouverOuCreerOrg(data, userId) {
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) return existing
  return prisma.organisation.create({ data: { ...data, statut: 'EN_ATTENTE', creeParId: userId } })
}

async function upsertSource(key) {
  const data = SOURCES[key]
  const existing = await prisma.source.findFirst({ where: { url: data.url } })
  if (existing) return existing
  return prisma.source.create({ data })
}

async function trouverEntite(type, wikidataId) {
  if (type === 'personne') return prisma.personne.findFirst({ where: { wikidataId } })
  if (type === 'organisation') return prisma.organisation.findFirst({ where: { wikidataId } })
  throw new Error(`Type entité non supporté : ${type}`)
}

function fkPourEntite(type, entite, position) {
  const suffix = position === 'A' ? 'AId' : 'BId'
  if (type === 'personne') return { [`personne${suffix}`]: entite.id }
  if (type === 'organisation') return { [`organisation${suffix}`]: entite.id }
  if (type === 'siteWeb') return { [`siteWeb${suffix}`]: entite.id }
  throw new Error(`Type inconnu : ${type}`)
}

async function _creerOuMajLien(lien, entiteA, entiteB, sourcesMap, userId) {
  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) throw new Error(`TypeLien introuvable : ${lien.typeLienCode}`)
  const fkA = fkPourEntite(lien.aType, entiteA, 'A')
  const fkB = fkPourEntite(lien.bType, entiteB, 'B')
  const existing = await prisma.lien.findFirst({ where: { ...fkA, ...fkB, typeLienId: typeLien.id } })
  const source = lien.sourceRef ? sourcesMap[lien.sourceRef] : null
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

async function creerLien(lien, sourcesMap, userId) {
  const entiteA = await trouverEntite(lien.aType, lien.aRef)
  const entiteB = await trouverEntite(lien.bType, lien.bRef)
  if (!entiteA || !entiteB) {
    throw new Error(
      `[seed-bfc] Entité introuvable — ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
    )
  }
  return _creerOuMajLien(lien, entiteA, entiteB, sourcesMap, userId)
}

// Variante soft : skip avec avertissement si une entité manque (dépendance externe).
async function creerLienOptional(lien, sourcesMap, userId) {
  const chercher = (type, ref) =>
    type === 'personne'
      ? prisma.personne.findFirst({ where: { wikidataId: ref } })
      : prisma.organisation.findFirst({ where: { wikidataId: ref } })
  const [entiteA, entiteB] = await Promise.all([
    chercher(lien.aType, lien.aRef),
    chercher(lien.bType, lien.bRef),
  ])
  if (!entiteA || !entiteB) {
    const detail = `a:${lien.aRef}=${entiteA ? 'ok' : 'ABSENT'}, b:${lien.bRef}=${entiteB ? 'ok' : 'ABSENT'}`
    console.warn(`  ⚠ Skip ${lien.typeLienCode} [${detail}] — lancer les seeds manquants pour activer ce lien`)
    return null
  }
  return _creerOuMajLien(lien, entiteA, entiteB, sourcesMap, userId)
}

async function reset() {
  console.log('⚠ Suppression des données BFC précédentes...')
  const idsP = (
    await prisma.personne.findMany({
      where: { wikidataId: { in: PERSONNES.map((p) => p.wikidataId) } },
      select: { id: true },
    })
  ).map((p) => p.id)
  const idsO = (
    await prisma.organisation.findMany({
      where: { wikidataId: { in: ORGANISATIONS.map((o) => o.wikidataId) } },
      select: { id: true },
    })
  ).map((o) => o.id)
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
  console.log('✓ Données BFC précédentes supprimées.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n┌─ seed-region-bfc — Réseau d\'influence Bourgogne-Franche-Comté ─┐\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`✓ User : ${user.email}\n`)

  // — Sources
  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ✓ ${data.titre}`)
  }

  // — Organisations (communes + région + médias)
  console.log('\n— Organisations —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ✓ ${created.nom} (${o.wikidataId})`)
  }

  // — Partis (trouver ou créer, sans écraser)
  console.log('\n— Partis (trouverOuCréer) —')
  for (const p of PARTIS) {
    const found = await trouverOuCreerOrg(p, user.id)
    console.log(`  ✓ ${found.nom} (${p.wikidataId})`)
  }

  // — Personnes
  console.log('\n— Personnes —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ✓ ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  // — Liens principaux
  console.log('\n— Liens principaux —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ✓ ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  // — Liens optionnels (skip si entité externe absente)
  console.log('\n— Liens optionnels (dépendances externes) —')
  for (const lien of LIENS_OPTIONNELS) {
    await creerLienOptional(lien, sourcesMap, user.id)
  }

  // — Bilan
  const totalLiens = LIENS.length + LIENS_OPTIONNELS.length
  console.log('\n┌─ Bilan ────────────────────────────────────────────────────────┐')
  console.log(`│ Personnes      : ${PERSONNES.length} (Dufay, Rebsamen, Koenders, Vignot, Meslot, Thuriot, Platret)`)
  console.log(`│ Organisations  : ${ORGANISATIONS.length} (Région BFC, 5 communes, Le Bien Public, L'Est Républicain)`)
  console.log(`│ Partis (upsert): ${PARTIS.length} (PS Q170972, Les Verts Q613786, LR Q20012759)`)
  console.log(`│ Sources        : ${Object.keys(SOURCES).length} (Wikipédia, dijon.fr, France 3 BFC)`)
  console.log(`│ Liens principaux: ${LIENS.length} (MANDAT_ELECTIF, ANCIEN_MANDAT, AFFILIATION_PARTI, mediatique)`)
  console.log(`│ Liens optionnels: ${LIENS_OPTIONNELS.length} (Renaissance, Stellantis — skip si absent)`)
  console.log(`│ Total liens    : ${totalLiens}`)
  console.log('│')
  console.log('│ Note : aucune affaire judiciaire incluse — statut procédural')
  console.log('│   exact requis + source publique datée. À compléter via canal')
  console.log('│   éditorial sur la base de procédures publiques documentées.')
  console.log('└────────────────────────────────────────────────────────────────┘\n')
}

main()
  .catch((err) => {
    console.error('[seed-bfc] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
