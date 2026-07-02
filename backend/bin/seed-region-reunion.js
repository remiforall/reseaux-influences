/**
 * Seed réseau d'influence — La Réunion (enquête OSINT, 2026-07-02).
 *
 * Périmètre :
 *   - Conseil régional de La Réunion (Q2994247) + Conseil départemental de La Réunion (Q23782071)
 *   - Huguette Bello (Q3142774) : Présidente du Conseil régional depuis juil. 2021 (liste gauche/Péi)
 *   - Cyrille Melchior (Q46248279) : Président du Conseil départemental depuis avr. 2015 (LR/UMP)
 *   - Didier Robert (Q3027191) : Ancien Président CR Réunion (2010-2021), affaires judiciaires :
 *       • Affaire indemnités de séjour 2016-2020 (~134 000 €) : condamné définitivement en appel
 *         le 18 juin 2026 (prise illégale d'intérêts) — peine : 1 an d'inéligibilité + 10 000 €.
 *         Acquitté du chef d'extorsion. Condamnation DÉFINITIVE.
 *       • Affaire emplois présumés fictifs à la Région : acquitté en 1re instance (mai 2024) ;
 *         appel du parquet en cours à la date de consultation (avril 2026 selon presse).
 *   - Ericka Bareigts (Q3056510) : Maire de Saint-Denis depuis juil. 2020, réélue mars 2026 (PS)
 *   - Emmanuel Séraphin (Q107451744) : Maire de Saint-Paul depuis juil. 2021, réélu mars 2026 (PLR)
 *   - André Thien Ah Koon (Q2848693) : Ancien Maire du Tampon (1983-2006, 2014-2024)
 *     ⚠ Condamné définitivement (prise illégale d'intérêts, affaire Sudec SPL) : 5 ans d'inéligibilité
 *       confirmés en appel. Démission de tous mandats le 13 juin 2024.
 *   - Joé Bédier (Q63607714) : Maire de Saint-André depuis juil. 2020, réélu mars 2026
 *   - David Lorion (Q30334974) : Maire de Saint-Pierre depuis avr. 2025 (Renaissance/LREM),
 *     succédant à Michel Fontaine (décédé mars 2025), réélu mars 2026 avec 56,01 %
 *   - Jacques de Chateauvieux (Q3160264) : PDG de Bourbon Corporation depuis 1987
 *   - Bourbon Corporation (Q2922257) : groupe fondé à La Réunion, services pétroliers offshore
 *
 * Q-id tous vérifiés via wbsearchentities + Special:EntityData (2026-07-02).
 *
 * EXCLUSIONS (sans Q-id Wikidata vérifié) :
 *   - Alexis Chaussalet (maire du Tampon depuis mars 2026) : aucun Q-id Wikidata trouvé.
 *   - Patrice Thien Ah Koon (maire du Tampon juin 2024 – mars 2026) : aucun Q-id Wikidata.
 *   - Michel Fontaine (ancien maire Saint-Pierre, décédé mars 2025) : décédé, hors périmètre.
 *   - Tereos Océan Indien (sucre) : filiale locale sans Q-id Wikidata propre.
 *   - Le Quotidien de La Réunion (Q3226205) + JIR (Q3186848) : aucun dirigeant public avec Q-id.
 *   - Préfet de La Réunion : potentiellement en base (seed hauts-fonctionnaires) — non redoublé.
 *
 * Garde-fous projet :
 *   - Toutes les entités en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - Présomption d'innocence respectée : statut procédural exact + source pour chaque affaire
 *   - Idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-region-reunion.js
 *   cd backend && node bin/seed-region-reunion.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — recoupées par ≥ 2 sources publiques (cf. commentaires inline).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q3142774 (wbsearchentities + Special:EntityData — P569 24/08/1950,
    //           P19 La Réunion Q249884, P39 présidente CR Réunion 2021-, P39 députée 1997-2020)
    //           + Wikipédia FR "Huguette Bello" (mandats, coalition, élection 2 juil. 2021)
    nom: 'Bello',
    prenom: 'Huguette',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1950-08-24'),
    lieuNaissance: 'La Réunion',
    rolePrincipal: 'Présidente du Conseil régional de La Réunion',
    rolesSecondaires: [
      "ancienne députée de La Réunion, 1re circonscription (cinq mandats, 1997-2020)",
      "ancienne Maire de Saint-Paul de La Réunion (1988-1994)",
      "ancienne vice-présidente du Conseil régional de La Réunion",
      "figure de la gauche réunionnaise, mouvement Péi La Réunion",
    ],
    bio:
      "Militante de la gauche réunionnaise, Huguette Bello a représenté La Réunion à " +
      "l'Assemblée nationale durant cinq mandats consécutifs (1997-2020). Élue Présidente " +
      "du Conseil régional de La Réunion le 2 juillet 2021, à la tête d'une coalition de " +
      "gauche et des forces locales (liste « Réunion en commun »), elle succède à Didier Robert.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Huguette_Bello',
    wikidataId: 'Q3142774',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q46248279 (Special:EntityData — P569 06/09/1961, P19 Saint-Denis Réunion,
    //           P39 président CD Réunion depuis 2015, P39 député Réunion 2017-2022)
    //           + Wikipédia FR "Cyrille Melchior" (LR/UMP, réélu 1er juil. 2021 avec 38/50 voix)
    //           + departement974.fr (séance plénière 1er juillet 2021, source officielle)
    nom: 'Melchior',
    prenom: 'Cyrille',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-09-06'),
    lieuNaissance: 'Saint-Denis, La Réunion',
    rolePrincipal: 'Président du Conseil départemental de La Réunion',
    rolesSecondaires: [
      "ancien député de La Réunion, 2e circonscription (2017-2022)",
      "membre de Les Républicains (anciennement UMP, UDF)",
      "réélu Président du CD de La Réunion le 1er juillet 2021 (38 voix sur 50)",
    ],
    bio:
      "Cyrille Melchior, figure de la droite réunionnaise, est Président du Conseil " +
      "départemental de La Réunion depuis le 2 avril 2015. Successivement membre de l'UDF, " +
      "de l'UMP puis de LR, il est réélu le 1er juillet 2021 par 38 des 50 conseillers " +
      "départementaux. Il a également exercé un mandat de député pour La Réunion de 2017 à 2022.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Cyrille_Melchior',
    wikidataId: 'Q46248279',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3027191 (frwiki title lookup — P569 26/04/1964 Paris, P39 : Maire
    //           Saint-Denis 2006-2010, député 2007-2012, Président CR Réunion 2010-2021, sénateur)
    //           + Wikipédia FR "Didier Robert" (mandats, affaires judiciaires)
    //           + la1ere.franceinfo.fr (condamnation définitive en appel 18 juin 2026, affaire
    //             indemnités de séjour : prise illégale d'intérêts, 1 an inéligibilité + 10 000 €)
    // AFFAIRES JUDICIAIRES (sources publiques, décisions rendues) :
    //   1. Affaire indemnités de séjour (2016-2020, ~134 000 €) :
    //      - 1re instance : condamné (prise illégale d'intérêts + extorsion, 8 mois sursis,
    //        5 ans inéligibilité, 100 000 € amende) — il avait fait appel.
    //      - Appel (CA Saint-Denis, 18 juin 2026) : condamné pour prise illégale d'intérêts,
    //        ACQUITTÉ de l'extorsion. Peine : 1 an d'inéligibilité + 10 000 € amende.
    //        Condamnation DÉFINITIVE selon presse (aucun pourvoi en cassation signalé à la date).
    //   2. Affaire emplois présumés fictifs à la Région :
    //      - 1re instance (mai 2024) : ACQUITTÉ ainsi que les 10 co-prévenus.
    //      - Parquet a fait appel le 22 mai 2024. Audience en appel renvoyée (oct. 2025, avr. 2026).
    //        Statut au 2026-07-02 : PRÉSUMÉ INNOCENT (appel du parquet pendant).
    nom: 'Robert',
    prenom: 'Didier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1964-04-26'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Ancien Président du Conseil régional de La Réunion',
    rolesSecondaires: [
      "ancien député de La Réunion, 3e circonscription (2007-2012)",
      "ancien Maire de Saint-Denis de La Réunion (2006-2010)",
      "affiliation politique : droite réunionnaise (LR)",
      "condamné définitivement en appel (juin 2026) — affaire indemnités de séjour",
    ],
    bio:
      "Didier Robert a présidé le Conseil régional de La Réunion de mars 2010 à juillet 2021, " +
      "succédant à Paul Vergès (PCR). AFFAIRE INDEMNITÉS DE SÉJOUR : condamné définitivement " +
      "en appel le 18 juin 2026 pour prise illégale d'intérêts (indemnités 2016-2020, ~134 000 €) — " +
      "peine : 1 an d'inéligibilité + 10 000 € d'amende, acquitté de l'extorsion. " +
      "AFFAIRE EMPLOIS FICTIFS : acquitté en 1re instance (mai 2024) ; appel du parquet en cours " +
      "— PRÉSUMÉ INNOCENT sur ce chef au 2026-07-02.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Didier_Robert',
    wikidataId: 'Q3027191',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3056510 (wbsearchentities — "French politician")
    //           + Wikipédia FR "Ericka Bareigts" (P569 16/04/1967 Saint-Denis, PS depuis 1986,
    //             première femme maire de Saint-Denis 4 juil. 2020, réélue 2026 avec 62,2 % au 1er tour)
    nom: 'Bareigts',
    prenom: 'Ericka',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-04-16'),
    lieuNaissance: 'Saint-Denis, La Réunion',
    rolePrincipal: 'Maire de Saint-Denis de La Réunion',
    rolesSecondaires: [
      "ancienne secrétaire d'État chargée de l'Égalité réelle (2016-2017, gouvernement Valls II)",
      "ancienne députée de La Réunion, 1re circonscription (2012-2017)",
      "membre du Parti socialiste depuis 1986",
      "première femme maire de Saint-Denis de La Réunion",
    ],
    bio:
      "Ericka Bareigts est élue le 4 juillet 2020 première femme maire de Saint-Denis de La Réunion. " +
      "Ancienne secrétaire d'État chargée de l'Égalité réelle sous François Hollande (2016-2017), " +
      "elle est réélue en mars 2026 avec 62,2 % des voix au premier tour.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Ericka_Bareigts',
    wikidataId: 'Q3056510',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q107451744 (Special:EntityData — P569 21/03/1972,
    //           P39 Maire Saint-Paul depuis 8 juil. 2021, Conseiller régional depuis juil. 2021)
    //           + Wikipédia FR "Emmanuel Séraphin" (PLR/PCR, réélu 28 mars 2026 avec 55,7 %)
    nom: 'Séraphin',
    prenom: 'Emmanuel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1972-03-21'),
    lieuNaissance: null,
    rolePrincipal: 'Maire de Saint-Paul de La Réunion',
    rolesSecondaires: [
      "conseiller régional de La Réunion depuis juillet 2021",
      "membre de Pour La Réunion (PLR) depuis 2012",
      "ancien membre du Parti Communiste Réunionnais (PCR)",
      "réélu maire de Saint-Paul le 28 mars 2026 avec 55,7 % des voix",
    ],
    bio:
      "Emmanuel Séraphin est maire de Saint-Paul de La Réunion depuis le 8 juillet 2021, " +
      "commune la plus étendue de l'île et la plus peuplée hors Saint-Denis (≈108 000 hab.). " +
      "Issu de la mouvance communiste réunionnaise (PCR/PLR), il est réélu en mars 2026.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Emmanuel_S%C3%A9raphin',
    wikidataId: 'Q107451744',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2848693 (wbsearchentities — P569 16/05/1940)
    //           + Wikipédia FR "André Thien Ah Koon" (Maire du Tampon 1983-2006, réélu 2014,
    //             démission 13 juin 2024 après condamnation définitive : 5 ans inéligibilité,
    //             prise illégale d'intérêts, affaire Sudec SPL)
    //           + la1ere.franceinfo.fr (Patrice Thien Ah Koon successeur, 24 juin 2024)
    // AFFAIRE JUDICIAIRE (source publique, décision définitive) :
    //   Condamné définitivement pour prise illégale d'intérêts dans l'affaire Sudec SPL
    //   (Société Publique Locale du Tampon). Peine de 5 ans d'inéligibilité confirmée en appel,
    //   le contraignant à démissionner de l'ensemble de ses mandats le 13 juin 2024.
    nom: 'Thien Ah Koon',
    prenom: 'André',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1940-05-16'),
    lieuNaissance: null,
    rolePrincipal: 'Ancien Maire du Tampon',
    rolesSecondaires: [
      "Maire du Tampon (1983-2006, puis 2014-2024)",
      "ancien conseiller général de La Réunion",
      "élu sans étiquette nationale (indépendant)",
      "condamné définitivement pour prise illégale d'intérêts (affaire Sudec SPL) — 5 ans d'inéligibilité",
    ],
    bio:
      "André Thien Ah Koon a exercé la mairie du Tampon pendant plus de trente ans cumulés " +
      "(1983-2006, puis 2014-2024). Condamné définitivement pour prise illégale d'intérêts dans " +
      "l'affaire Sudec SPL (Société Publique Locale du Tampon), il a démissionné de l'ensemble " +
      "de ses mandats le 13 juin 2024 après confirmation en appel d'une peine de 5 ans d'inéligibilité.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Andr%C3%A9_Thien_Ah_Koon',
    wikidataId: 'Q2848693',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q63607714 (Special:EntityData — P569 27/02/1959, P39 Maire Saint-André
    //           4 juil. 2020 – 27 mars 2026, P39 Maire Saint-André depuis 28 mars 2026)
    //           Pas d'article Wikipédia FR identifié pour ce maire — Wikidata utilisé comme référence.
    nom: 'Bédier',
    prenom: 'Joé',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1959-02-27'),
    lieuNaissance: null,
    rolePrincipal: 'Maire de Saint-André de La Réunion',
    rolesSecondaires: [
      "conseiller municipal de Saint-André depuis 2015",
      "réélu maire de Saint-André le 28 mars 2026",
    ],
    bio:
      "Joé Bédier est maire de Saint-André de La Réunion depuis le 4 juillet 2020, commune " +
      "de ≈57 000 habitants dans le Nord-Est de l'île, à forte tradition sucrière et tamoule. " +
      "Réélu le 28 mars 2026 pour un nouveau mandat de six ans (source Wikidata Q63607714).",
    wikipediaUrl: null,
    wikidataId: 'Q63607714',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q30334974 (Special:EntityData — P569 15/10/1964, P39 : député Réunion
    //           2017-2022, conseiller régional 2015-2017, maire Saint-Pierre depuis oct. 2025)
    //           + la1ere.franceinfo.fr (Lorion élu nouveau maire de Saint-Pierre après décès
    //             de Michel Fontaine, mars 2025)
    //           + linfo.re (Lorion réélu maire de Saint-Pierre aux municipales 2026 avec 56,01 %)
    // Note : Michel Fontaine (ancien maire Saint-Pierre, décédé mars 2025) — décédé, hors périmètre.
    nom: 'Lorion',
    prenom: 'David',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1964-10-15'),
    lieuNaissance: null,
    rolePrincipal: 'Maire de Saint-Pierre de La Réunion',
    rolesSecondaires: [
      "ancien député de La Réunion, 5e circonscription (2017-2022)",
      "ancien conseiller régional de La Réunion (2015-2017)",
      "membre de Renaissance (ex-La République En Marche)",
      "élu maire de Saint-Pierre aux municipales 2026 avec 56,01 % au second tour",
    ],
    bio:
      "David Lorion est maire de Saint-Pierre de La Réunion depuis avril 2025, succédant à " +
      "Michel Fontaine décédé en mars 2025. Ancien député (2017-2022) sous étiquette LREM/Renaissance, " +
      "il est confirmé à ce poste lors des élections municipales de mars 2026 avec 56,01 % des voix.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/David_Lorion',
    wikidataId: 'Q30334974',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3160264 (Special:EntityData — P569 13/02/1951 Lyon, P39 positions
    //           depuis 1987 (Q23906822 = PDG Bourbon), P106 entrepreneur/homme d'affaires)
    //           + Wikipédia FR "Bourbon Corporation" (groupe fondé à La Réunion, restructuration
    //             judiciaire 2019-2021, PDG Jacques de Chateauvieux depuis 1987)
    nom: 'de Chateauvieux',
    prenom: 'Jacques',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1951-02-13'),
    lieuNaissance: 'Lyon',
    rolePrincipal: 'Président-directeur général de Bourbon Corporation',
    rolesSecondaires: [
      "fondateur et PDG du Groupe Bourbon (depuis 1987)",
      "figure de l'entrepreneuriat réunionnais à rayonnement mondial",
    ],
    bio:
      "Jacques de Chateauvieux est le PDG de Bourbon Corporation (ex-Groupe Bourbon), conglomérat " +
      "fondé à La Réunion par la famille de Chateauvieux. Société cotée à la Bourse de Paris, " +
      "spécialisée dans les services pétroliers offshore. Elle a traversé une restructuration " +
      "judiciaire (2019-2021) avec plan de sauvegarde homologué. Chateauvieux en dirige la holding " +
      "depuis 1987.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bourbon_Corporation',
    wikidataId: 'Q3160264',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q2994247 (frwiki "Conseil_régional_de_La_Réunion")
    //           + Wikipédia FR (Bello présidente depuis 2021, 45 conseillers régionaux,
    //             Vergès 1998-2010, Robert 2010-2021, Bello 2021-)
    nom: 'Conseil régional de La Réunion',
    sigle: 'CR Réunion',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.regionreunion.com',
    description:
      "Assemblée délibérante de la Région Réunion, composée de 45 conseillers régionaux élus " +
      "pour 6 ans. Siège : Avenue René Cassin, Saint-Denis. Présidée par Huguette Bello depuis " +
      "le 2 juillet 2021. Compétences : développement économique, formation, lycées, transports.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Conseil_r%C3%A9gional_de_La_R%C3%A9union',
    wikidataId: 'Q2994247',
  },
  {
    // Sources : Wikidata Q23782071 (frwiki "Conseil_départemental_de_La_Réunion")
    //           + departement974.fr + Wikipédia FR (50 conseillers, Melchior depuis avril 2015)
    nom: 'Conseil départemental de La Réunion',
    sigle: 'CD Réunion',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.departement974.fr',
    description:
      "Assemblée délibérante du Département de La Réunion (depuis 2015, ex-Conseil général), " +
      "composée de 50 conseillers départementaux. Présidé par Cyrille Melchior depuis avril 2015. " +
      "Compétences : action sociale, collèges, routes départementales.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Conseil_d%C3%A9partemental_de_La_R%C3%A9union',
    wikidataId: 'Q23782071',
  },
  {
    // Sources : Wikidata Q47045 (frwiki "Saint-Denis_(La_Réunion)")
    //           + Wikipédia FR (chef-lieu, ≈152 000 hab., Bareigts maire depuis 2020)
    nom: 'Commune de Saint-Denis de La Réunion',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.mairie-saintdenis.re',
    description:
      "Chef-lieu de La Réunion et préfecture. Commune la plus peuplée de l'île (≈152 000 hab.). " +
      "Siège de la préfecture, des administrations régionales et départementales. " +
      "Maire : Ericka Bareigts depuis le 4 juillet 2020.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Saint-Denis_(La_R%C3%A9union)',
    wikidataId: 'Q47045',
  },
  {
    // Sources : Wikidata Q316887 (Special:EntityData Q46248279 — P39 conseil municipal
    //           Saint-Paul Q316887) + Wikipédia FR "Saint-Paul_(La_Réunion)"
    //           (≈108 000 hab., commune la plus étendue, Séraphin maire depuis 2021)
    nom: 'Commune de Saint-Paul de La Réunion',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.mairie-saintpaul.re',
    description:
      "Commune de La Réunion la plus étendue géographiquement, la plus peuplée hors Saint-Denis " +
      "(≈108 000 hab.). Maire : Emmanuel Séraphin depuis le 8 juillet 2021.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Saint-Paul_(La_R%C3%A9union)',
    wikidataId: 'Q316887',
  },
  {
    // Sources : Wikidata Q249884 (frwiki "Saint-Pierre_(La_Réunion)")
    //           + la1ere.franceinfo.fr (Lorion maire depuis avr. 2025, réélu 2026)
    nom: 'Commune de Saint-Pierre de La Réunion',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.mairie-saintpierre.re',
    description:
      "Principale commune du Sud de La Réunion (≈82 000 hab.), centre économique du sud de l'île. " +
      "Maire : David Lorion depuis avril 2025 (réélu mars 2026, 56,01 %).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Saint-Pierre_(La_R%C3%A9union)',
    wikidataId: 'Q249884',
  },
  {
    // Sources : Wikidata Q13648 (frwiki "Le_Tampon")
    //           + Wikipédia FR (≈80 000 hab., Thien Ah Koon maire 2014-2024,
    //             Patrice Thien Ah Koon juin 2024, Chaussalet mars 2026)
    nom: 'Commune du Tampon',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.ville-letampon.re',
    description:
      "Commune des Hauts de La Réunion (≈80 000 hab.), en forte croissance démographique. " +
      "Ex-fief d'André Thien Ah Koon (1983-2006, 2014-2024, démissionnaire après condamnation). " +
      "Maire depuis mars 2026 : Alexis Chaussalet (sans Q-id Wikidata).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Le_Tampon',
    wikidataId: 'Q13648',
  },
  {
    // Sources : Wikidata Q1649370 (frwiki "Saint-André_(La_Réunion)")
    //           + Wikidata Q63607714 (Bédier maire 2020-2026, réélu 2026)
    nom: 'Commune de Saint-André de La Réunion',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.mairie-saintandre.re',
    description:
      "Commune du Nord-Est de La Réunion (≈57 000 hab.), à forte tradition sucrière et tamoule. " +
      "Maire : Joé Bédier depuis le 4 juillet 2020 (réélu le 28 mars 2026).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Saint-Andr%C3%A9_(La_R%C3%A9union)',
    wikidataId: 'Q1649370',
  },
  {
    // Sources : Wikidata Q2922257 (wbsearchentities — "Bourbon Corporation", French corporation)
    //           + Wikipédia FR "Bourbon_Corporation" (groupe fondé à La Réunion, cotation Paris,
    //             restructuration judiciaire 2019-2021, PDG Chateauvieux depuis 1987)
    nom: 'Bourbon Corporation',
    sigle: 'Bourbon',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.bourbon-online.com',
    description:
      "Groupe maritime fondé à La Réunion par la famille de Chateauvieux. Spécialisé en services " +
      "pétroliers offshore (navires AHTS, PSV). Coté à Euronext Paris. A traversé une " +
      "restructuration judiciaire (2019-2021) avec plan de sauvegarde homologué.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bourbon_Corporation',
    wikidataId: 'Q2922257',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, dateConsultation 2026-07-02.
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_bello: {
    url: 'https://fr.wikipedia.org/wiki/Huguette_Bello',
    titre: 'Huguette Bello — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Parcours complet : ancienne députée (5 mandats, 1997-2020), ancienne maire de Saint-Paul " +
      "(1988-1994), élue Présidente du CR Réunion le 2 juillet 2021 (coalition gauche/Péi).",
    verifiee: true,
  },
  dept974_melchior: {
    url: 'https://www.departement974.fr/actualite/seance-pleniere-1er-juillet-2021-cyrille-melchior-reelu-president-conseil-departemental',
    titre: "Séance Plénière du 1er juillet 2021 : Cyrille Melchior réélu Président du Conseil départemental",
    media: 'Département de La Réunion (site officiel)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2021-07-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Communiqué officiel : Cyrille Melchior réélu président du Conseil départemental de La Réunion " +
      "le 1er juillet 2021, avec 38 voix sur 50 conseillers départementaux.",
    verifiee: true,
  },
  wp_robert: {
    url: 'https://fr.wikipedia.org/wiki/Didier_Robert',
    titre: 'Didier Robert — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Parcours politique : Maire Saint-Denis 2006-2010, député 2007-2012, Président CR Réunion " +
      "2010-2021. Affaires judiciaires détaillées (indemnités séjour, emplois fictifs).",
    verifiee: true,
  },
  la1ere_robert_appel: {
    url: 'https://la1ere.franceinfo.fr/reunion/affaire-des-indemnites-de-sejour-didier-robert-condamne-en-appel-a-un-an-d-ineligibilite-et-10-000-euros-d-amende-1711774.html',
    titre: "Affaire des indemnités de séjour : Didier Robert condamné en appel à un an d'inéligibilité et 10 000 euros d'amende",
    media: "La 1ère Réunion (France Info)",
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-06-18'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Arrêt de la cour d'appel de Saint-Denis du 18 juin 2026 : Robert condamné pour prise " +
      "illégale d'intérêts (indemnités de séjour 2016-2020, ≈134 000 €), acquitté de l'extorsion. " +
      "Peine : 1 an d'inéligibilité + 10 000 € d'amende. Condamnation définitive.",
    verifiee: true,
  },
  wp_bareigts: {
    url: 'https://fr.wikipedia.org/wiki/Ericka_Bareigts',
    titre: 'Ericka Bareigts — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Première femme maire de Saint-Denis de La Réunion (élue le 4 juil. 2020). Ancienne " +
      "secrétaire d'État (2016-2017). PS depuis 1986. Réélue mars 2026 avec 62,2 % au 1er tour.",
    verifiee: true,
  },
  wp_seraphIn: {
    url: 'https://fr.wikipedia.org/wiki/Emmanuel_S%C3%A9raphin',
    titre: 'Emmanuel Séraphin — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Maire de Saint-Paul de La Réunion depuis le 8 juillet 2021 (PLR/PCR). " +
      "Réélu le 28 mars 2026 avec 55,7 % des voix.",
    verifiee: true,
  },
  wp_thien: {
    url: 'https://fr.wikipedia.org/wiki/Andr%C3%A9_Thien_Ah_Koon',
    titre: 'André Thien Ah Koon — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Ancien maire du Tampon (1983-2006, 2014-2024). Condamné définitivement pour prise illégale " +
      "d'intérêts (affaire Sudec SPL) : 5 ans d'inéligibilité, démission le 13 juin 2024.",
    verifiee: true,
  },
  la1ere_thien: {
    url: 'https://la1ere.franceinfo.fr/reunion/patrice-thien-ah-koon-succede-a-son-pere-et-devient-le-nouveau-maire-du-tampon-1499690.html',
    titre: "Patrice Thien Ah Koon succède à son père et devient le nouveau maire du Tampon",
    media: "La 1ère Réunion (France Info)",
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-06-24'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Élection de Patrice Thien Ah Koon (fils d'André) comme nouveau maire du Tampon le 24 juin 2024, " +
      "après la démission de son père suite à sa condamnation définitive (5 ans d'inéligibilité, " +
      "prise illégale d'intérêts, affaire Sudec SPL).",
    verifiee: true,
  },
  wd_bedier: {
    url: 'https://www.wikidata.org/wiki/Q63607714',
    titre: 'Joé Bédier — Wikidata Q63607714',
    media: 'Wikidata',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Fiche Wikidata de Joé Bédier, maire de Saint-André de La Réunion depuis le 4 juillet 2020 " +
      "(P39 dateDebut 2020-07-04, dateFin 2026-03-27 puis réélu 2026-03-28). Né le 27/02/1959. " +
      "Seule source publique identifiée — à recouper via presse locale.",
    verifiee: false,
  },
  la1ere_lorion: {
    url: 'https://la1ere.franceinfo.fr/reunion/saint-pierre/david-lorion-est-le-nouveau-maire-de-saint-pierre-1577284.html',
    titre: "David Lorion est le nouveau maire de Saint-Pierre",
    media: "La 1ère Réunion (France Info)",
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-04-10'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Élection de David Lorion comme maire de Saint-Pierre de La Réunion en avril 2025, " +
      "après le décès de Michel Fontaine (mars 2025). Confirmé aux municipales mars 2026 (56,01 %).",
    verifiee: true,
  },
  wp_bourbon: {
    url: 'https://fr.wikipedia.org/wiki/Bourbon_Corporation',
    titre: 'Bourbon Corporation — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Groupe maritime fondé à La Réunion par la famille de Chateauvieux. Jacques de Chateauvieux " +
      "PDG depuis 1987. Restructuration judiciaire 2019-2021. Coté Euronext Paris.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002).
// aRef / bRef = wikidataId de l'entité concernée.
// ---------------------------------------------------------------------------

const LIENS = [
  {
    // P-O : Bello → Conseil régional de La Réunion — MANDAT_ELECTIF depuis juil. 2021.
    aType: 'personne',
    aRef: 'Q3142774',
    bType: 'organisation',
    bRef: 'Q2994247',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Huguette Bello est Présidente du Conseil régional de La Réunion depuis le 2 juillet 2021, " +
      "élue par les conseillers régionaux après la victoire de sa liste « Réunion en commun » " +
      "aux régionales des 20 et 27 juin 2021.",
    dateDebut: new Date('2021-07-02'),
    dateFin: null,
    sourceRef: 'wp_bello',
  },
  {
    // P-O : Melchior → Conseil départemental de La Réunion — MANDAT_ELECTIF depuis avr. 2015.
    aType: 'personne',
    aRef: 'Q46248279',
    bType: 'organisation',
    bRef: 'Q23782071',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Cyrille Melchior est Président du Conseil départemental de La Réunion depuis le 2 avril 2015 " +
      "(premier tour des élections cantonales mars 2015). Réélu le 1er juillet 2021 par 38 des " +
      "50 conseillers départementaux (source officielle : departement974.fr).",
    dateDebut: new Date('2015-04-02'),
    dateFin: null,
    sourceRef: 'dept974_melchior',
  },
  {
    // P-O : Robert → Conseil régional — ANCIEN_MANDAT (mars 2010 – juil. 2021).
    aType: 'personne',
    aRef: 'Q3027191',
    bType: 'organisation',
    bRef: 'Q2994247',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Didier Robert a présidé le Conseil régional de La Réunion du 26 mars 2010 au 2 juillet 2021, " +
      "succédant à Paul Vergès (PCR) après la victoire de la droite aux régionales de mars 2010. " +
      "Réélu en 2015, battu en juin 2021 par la coalition conduite par Huguette Bello.",
    dateDebut: new Date('2010-03-26'),
    dateFin: new Date('2021-07-02'),
    sourceRef: 'wp_robert',
  },
  {
    // P-O : Robert → Conseil régional — lien juridique (condamnation définitive juin 2026).
    // Les faits poursuivis (indemnités de séjour perçues indûment) ont été commis en qualité
    // de Président de la Région Réunion — d'où le lien juridique entre Robert et le Conseil régional.
    aType: 'personne',
    aRef: 'Q3027191',
    bType: 'organisation',
    bRef: 'Q2994247',
    typeLienCode: 'juridique',
    description:
      "Condamné définitivement en appel le 18 juin 2026 pour prise illégale d'intérêts (CA Saint-Denis) : " +
      "indemnités de séjour indûment perçues (2016-2020, ≈134 000 €) en sa qualité de président " +
      "de la Région Réunion. Peine : 1 an d'inéligibilité + 10 000 € d'amende. Acquitté de l'extorsion. " +
      "Affaire emplois fictifs : acquitté en 1re instance (mai 2024) — appel du parquet PENDANT " +
      "(présomption d'innocence sur ce chef).",
    dateDebut: new Date('2026-06-18'),
    dateFin: null,
    sourceRef: 'la1ere_robert_appel',
  },
  {
    // P-O : Bareigts → Commune de Saint-Denis — MANDAT_ELECTIF depuis juil. 2020.
    aType: 'personne',
    aRef: 'Q3056510',
    bType: 'organisation',
    bRef: 'Q47045',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Ericka Bareigts est maire de Saint-Denis de La Réunion depuis le 4 juillet 2020, " +
      "première femme à diriger la capitale réunionnaise. Réélue en mars 2026 avec 62,2 % " +
      "des voix au premier tour.",
    dateDebut: new Date('2020-07-04'),
    dateFin: null,
    sourceRef: 'wp_bareigts',
  },
  {
    // P-O : Séraphin → Commune de Saint-Paul — MANDAT_ELECTIF depuis juil. 2021.
    aType: 'personne',
    aRef: 'Q107451744',
    bType: 'organisation',
    bRef: 'Q316887',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Emmanuel Séraphin est maire de Saint-Paul de La Réunion depuis le 8 juillet 2021 " +
      "(commune ≈108 000 hab.). Issu du mouvement Pour La Réunion (PLR/PCR). " +
      "Réélu le 28 mars 2026 avec 55,7 % des voix.",
    dateDebut: new Date('2021-07-08'),
    dateFin: null,
    sourceRef: 'wp_seraphIn',
  },
  {
    // P-O : Thien Ah Koon → Commune du Tampon — ANCIEN_MANDAT (avr. 2014 – juin 2024).
    // NB : il avait aussi exercé la mairie de 1983 à 2006 ; on retient ici le dernier mandat.
    aType: 'personne',
    aRef: 'Q2848693',
    bType: 'organisation',
    bRef: 'Q13648',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "André Thien Ah Koon a exercé la mairie du Tampon du 4 avril 2014 au 13 juin 2024, " +
      "date à laquelle il a démissionné de l'ensemble de ses mandats après confirmation en appel " +
      "de sa condamnation pour prise illégale d'intérêts (affaire Sudec SPL, 5 ans d'inéligibilité). " +
      "Il avait aussi exercé la mairie de 1983 à 2006.",
    dateDebut: new Date('2014-04-04'),
    dateFin: new Date('2024-06-13'),
    sourceRef: 'wp_thien',
  },
  {
    // P-O : Thien Ah Koon → Commune du Tampon — lien juridique (condamnation définitive).
    aType: 'personne',
    aRef: 'Q2848693',
    bType: 'organisation',
    bRef: 'Q13648',
    typeLienCode: 'juridique',
    description:
      "Condamné définitivement pour prise illégale d'intérêts dans l'affaire Sudec SPL " +
      "(Société Publique Locale du Tampon), faits commis en sa qualité de maire du Tampon. " +
      "Peine de 5 ans d'inéligibilité confirmée en appel — démission de tous mandats le 13 juin 2024.",
    dateDebut: new Date('2024-06-13'),
    dateFin: null,
    sourceRef: 'la1ere_thien',
  },
  {
    // P-O : Bédier → Commune de Saint-André — MANDAT_ELECTIF depuis juil. 2020.
    aType: 'personne',
    aRef: 'Q63607714',
    bType: 'organisation',
    bRef: 'Q1649370',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Joé Bédier est maire de Saint-André de La Réunion depuis le 4 juillet 2020 " +
      "(commune ≈57 000 hab.). Réélu le 28 mars 2026 pour un nouveau mandat. " +
      "Source : Wikidata Q63607714 (à recouper via presse locale — verifiee: false).",
    dateDebut: new Date('2020-07-04'),
    dateFin: null,
    sourceRef: 'wd_bedier',
  },
  {
    // P-O : Lorion → Commune de Saint-Pierre — MANDAT_ELECTIF depuis avr. 2025.
    aType: 'personne',
    aRef: 'Q30334974',
    bType: 'organisation',
    bRef: 'Q249884',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "David Lorion est maire de Saint-Pierre de La Réunion depuis avril 2025, succédant à " +
      "Michel Fontaine (décédé mars 2025). Confirmé aux élections municipales de mars 2026 " +
      "avec 56,01 % au second tour (linfo.re, 22 mars 2026).",
    dateDebut: new Date('2025-04-10'),
    dateFin: null,
    sourceRef: 'la1ere_lorion',
  },
  {
    // P-O : de Chateauvieux → Bourbon Corporation — DIRIGEANT (depuis 1987).
    aType: 'personne',
    aRef: 'Q3160264',
    bType: 'organisation',
    bRef: 'Q2922257',
    typeLienCode: 'DIRIGEANT',
    description:
      "Jacques de Chateauvieux dirige Bourbon Corporation (ex-Groupe Bourbon) depuis 1987 " +
      "(position Q23906822 documentée sur Wikidata Q3160264). Le groupe, fondé à La Réunion " +
      "par la famille de Chateauvieux, est un acteur mondial des services maritimes pétroliers " +
      "offshore, après restructuration judiciaire (2019-2021).",
    dateDebut: new Date('1987-01-01'),
    dateFin: null,
    sourceRef: 'wp_bourbon',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (calqués sur seed-macron-v2.js et seed-region-guadeloupe.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-region-reunion] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-region-reunion] Entité introuvable pour lien ${lien.typeLienCode} ` +
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
  console.log('⚠ Suppression données Réunion précédentes...')
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
  console.log('\n┌─ seed-region-reunion — Réseau d\'influence de La Réunion ─────────────┐\n')
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

  console.log('\n┌─ Bilan ───────────────────────────────────────────────────────────────┐')
  console.log(`│ Personnes     : ${PERSONNES.length}  (Bello, Melchior, Robert, Bareigts, Séraphin,`)
  console.log(`│                     Thien Ah Koon, Bédier, Lorion, de Chateauvieux)`)
  console.log(`│ Organisations : ${ORGANISATIONS.length}  (CR, CD, 5 communes, Bourbon Corporation)`)
  console.log(`│ Sources       : ${Object.keys(SOURCES).length}  (Wikidata, Wikipédia, dept974.fr, la1ere.franceinfo.fr)`)
  console.log(`│ Liens         : ${LIENS.length} (MANDAT_ELECTIF ×6, ANCIEN_MANDAT ×2, juridique ×2, DIRIGEANT ×1)`)
  console.log(`│ Affaires jud. : Robert (déf. juin 2026) + Thien Ah Koon (déf. 2024)`)
  console.log('└───────────────────────────────────────────────────────────────────────┘\n')
}

main()
  .catch((err) => {
    console.error('[seed-region-reunion] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
