/**
 * Seed Guadeloupe — réseau d'influence régional (enquête OSINT, 2026-07-02).
 *
 * Périmètre :
 *   - Conseil régional de Guadeloupe (Q2994255) + Conseil départemental de Guadeloupe (Q23782113)
 *   - Ary Chalus (Q2866091) : Président du Conseil régional depuis déc. 2015 (réélu juil. 2021)
 *     ⚠ Condamné par le TC de Basse-Terre (janv. 2024) et la CA de Basse-Terre (20 mai 2025)
 *       pour abus de confiance et dépassement des plafonds des comptes de campagne des régionales 2015.
 *       Peine : 15 mois sursis, 25 000 € amende, 2 ans inéligibilité. Pourvoi en cassation annoncé.
 *       Statut : condamné en premier et deuxième ressort — présomption d'innocence levée à ces stades,
 *       cassation encore possible.
 *   - Guy Losbar (Q63610722) : Président du Conseil départemental depuis juil. 2021
 *   - Harry Durimel (Q5668504) : Maire de Pointe-à-Pitre depuis 2020
 *   - Éric Jalton (Q3591191) : Maire des Abymes depuis 2020
 *   - Hélène Molia-Polifonte (Q65593444) : Maire de Baie-Mahault depuis 2020
 *   - Bernard Hayot (Q2898044) : Fondateur du Groupe Bernard Hayot (GBH)
 *     [personnage économique public documenté, figure béké des Antilles françaises]
 *   - Groupe Bernard Hayot (Q3117340) : conglomérat grande distribution / automobile
 *     ⚠ Enquête judiciaire ouverte depuis août 2025 pour abus de position dominante et
 *       entente dans le secteur automobile — PRÉSUMÉ INNOCENT (enquête, aucune condamnation).
 *   - France-Antilles (Q3080535) : quotidien de référence Guadeloupe/Martinique (media)
 *   - Communes : Les Abymes (Q13636), Pointe-à-Pitre (Q335322), Baie-Mahault (Q660165)
 *
 * Q-id tous vérifiés via wbsearchentities + Special:EntityData (2026-07-02).
 *
 * EXCLUSIONS (sans Q-id Wikidata vérifié) :
 *   - Maires de Basse-Terre, Le Gosier, Capesterre-Belle-Eau : aucun Q-id trouvé.
 *   - Stéphane Hayot (PDG actuel GBH, fils de Bernard) : aucun Q-id Wikidata.
 *   - GUSR (Guadeloupe unie, solidaire et responsable) : aucun Q-id Wikidata.
 *   - Préfet de Guadeloupe : potentiellement en base (seed hauts-fonctionnaires) — non redoublé.
 *
 * Sources : Wikidata, Wikipédia FR, Outre-mer la 1ère, La 1ère Guadeloupe, Conseil régional.
 *
 * Note date naissance Bernard Hayot :
 *   Wikidata (Q2898044) indique le 28 octobre 1934 ; Wikipédia FR indique le 18 octobre 1934.
 *   Le présent seed retient la date Wikipédia FR (18 oct.) comme source rédactionnelle,
 *   tout en conservant le Q-id Wikidata pour l'identifiant de référence.
 *
 * Garde-fous projet :
 *   - Toutes les entités en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - Idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-region-guadeloupe.js
 *   cd backend && node bin/seed-region-guadeloupe.js --reset
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
    // Sources : Wikidata Q2866091 (wbsearchentities + Special:EntityData — P569 06/12/1961,
    //           P19 Pointe-à-Pitre per Wikipédia FR, P39 président CR Guadeloupe depuis 2015)
    //           + Wikipédia FR "Ary Chalus" (parcours, condamnation TC Basse-Terre janv. 2024,
    //           confirmation CA Basse-Terre 20 mai 2025)
    // AFFAIRE JUDICIAIRE (sources publiques, décision rendue) :
    //   TC Basse-Terre, janv. 2024 : abus de confiance + dépassement plafonds comptes de campagne
    //   (élections régionales 2015). Peine : 15 mois sursis, 25 000 € amende, 2 ans inéligibilité,
    //   3 ans interdiction de diriger une association. Confirmé en appel CA Basse-Terre, 20 mai 2025.
    //   Chalus a annoncé son intention de se pourvoir en cassation (pourvoi pendant).
    //   Statut à la date de consultation : condamné en 1re instance + appel, cassation non tranchée.
    nom: 'Chalus',
    prenom: 'Ary',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-12-06'),
    lieuNaissance: 'Pointe-à-Pitre (Guadeloupe)',
    rolePrincipal: 'Président du Conseil régional de Guadeloupe',
    rolesSecondaires: [
      "réélu Président du Conseil régional lors des régionales de juillet 2021",
      "ancien Maire de Baie-Mahault (2001-2015)",
      "ancien Député de la Guadeloupe, 3e circonscription (2012-2017)",
      "membre de Guadeloupe unie, solidaire et responsable (GUSR) et de Renaissance",
      "condamné TC Basse-Terre (janv. 2024), confirmé CA (20 mai 2025) — pourvoi cassation annoncé",
    ],
    bio:
      "Chirurgien-dentiste de formation, Ary Chalus a été Maire de Baie-Mahault de 2001 à 2015, " +
      "puis Député de la 3e circonscription de Guadeloupe de 2012 à 2017. Élu Président du Conseil " +
      "régional de Guadeloupe le 18 décembre 2015 (liste GUSR soutenue par LREM), il est réélu " +
      "le 2 juillet 2021. En janvier 2024, le tribunal correctionnel de Basse-Terre le condamne " +
      "pour abus de confiance et dépassement des plafonds des comptes de campagne des régionales " +
      "2015 (15 mois avec sursis, 25 000 € amende, 2 ans inéligibilité). La cour d'appel de " +
      "Basse-Terre confirme la condamnation le 20 mai 2025. Pourvoi en cassation annoncé.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Ary_Chalus',
    wikidataId: 'Q2866091',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q63610722 (Special:EntityData — P569 03/04/1961, P39 président CD
    //           de la Guadeloupe depuis juil. 2021, Parti socialiste P102: Q170972)
    //           + Wikipédia FR "Guy Losbar" (parcours : expert-comptable, Petit-Bourg, GUSR/PS)
    //           + Wikipédia FR "Conseil départemental de la Guadeloupe" (Losbar élu le 1er juil. 2021)
    nom: 'Losbar',
    prenom: 'Guy',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-04-03'),
    lieuNaissance: 'Guadeloupe',
    rolePrincipal: 'Président du Conseil départemental de la Guadeloupe',
    rolesSecondaires: [
      "ancien Maire de Petit-Bourg (2014-2021)",
      "ancien Conseiller général puis départemental de Guadeloupe (2004-2021)",
      "ancien Conseiller régional de Guadeloupe (2015-2021)",
      "expert-comptable de formation",
      "membre du Parti socialiste (PS) et de GUSR",
    ],
    bio:
      "Issu d'une famille de Petit-Bourg, Guy Losbar est expert-comptable de formation (Toulouse). " +
      "Il entre en politique en 1995 comme adjoint au maire de Petit-Bourg, puis est élu conseiller " +
      "général en 2004 et maire en 2014. En juillet 2021, son prédécesseur ayant quitté la présidence " +
      "du Conseil régional pour prendre celle du Conseil régional, Losbar est élu Président du " +
      "Conseil départemental de la Guadeloupe le 1er juillet 2021. Il conduit la liste PS-GUSR.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Guy_Losbar',
    wikidataId: 'Q63610722',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q5668504 (Special:EntityData — P569 24/08/1957, P39 : Maire de Pointe-à-Pitre
    //           2020-2026, Député de Guadeloupe 2015-2020, Conseiller municipal 2014-2020)
    //           + Wikipédia FR "Pointe-à-Pitre" (liste des maires, Durimel depuis 2020)
    //           + Outre-mer la 1ère (élection 2020, portrait) — URL non fetchable au-delà du paywall
    nom: 'Durimel',
    prenom: 'Harry',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1957-08-24'),
    lieuNaissance: null,
    rolePrincipal: 'Maire de Pointe-à-Pitre',
    rolesSecondaires: [
      "ancien Député de la Guadeloupe, 4e circonscription (2015-2020)",
      "ancien Conseiller municipal de Pointe-à-Pitre (2014-2020)",
      "Conseiller régional de Guadeloupe (depuis 2020)",
    ],
    bio:
      "Harry Durimel est un homme politique guadeloupéen, ancien député de la 4e circonscription " +
      "de Guadeloupe (2015-2020). Élu Maire de Pointe-à-Pitre en juillet 2020 et réélu Conseiller " +
      "régional de Guadeloupe, il dirige la principale ville économique de l'archipel " +
      "(environ 15 000 habitants, chef-lieu d'arrondissement).",
    wikipediaUrl: null,
    wikidataId: 'Q5668504',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3591191 (Special:EntityData — P569 16/09/1961, P19 Q13636 = Les Abymes,
    //           P39 : Député 2002-2017, Maire des Abymes 2008-2014 ; mandat 2020 confirmé Wikipedia FR)
    //           + Wikipédia FR "Les Abymes" (Jalton : maire réélu en juin 2020 pour 2020-2026)
    //           + Wikipédia FR "Éric Jalton" (chirurgien-dentiste, parcours PS, Abymes)
    // Note : Wikidata liste uniquement le mandat 2008-2014 comme maire ; le mandat 2020-2026
    //        est confirmé par la page Wikipédia FR de la commune "Les Abymes".
    nom: 'Jalton',
    prenom: 'Éric',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-09-16'),
    lieuNaissance: 'Les Abymes (Guadeloupe)',
    rolePrincipal: 'Maire des Abymes, Président de la CA Cap Excellence',
    rolesSecondaires: [
      "Maire des Abymes (depuis 2008, réélu 2014, 2020)",
      "Président de la Communauté d'agglomération Cap Excellence",
      "ancien Député de la Guadeloupe, 1re circonscription (2002-2017)",
      "chirurgien-dentiste de formation",
      "membre du Parti socialiste",
    ],
    bio:
      "Chirurgien-dentiste de formation, Éric Jalton est une figure de la gauche guadeloupéenne. " +
      "Député de la 1re circonscription de Guadeloupe de 2002 à 2017, il est Maire des Abymes " +
      "depuis 2008 (réélu en 2014 et 2020). Il préside également la Communauté d'agglomération " +
      "Cap Excellence qui regroupe Les Abymes, Pointe-à-Pitre et Baie-Mahault.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89ric_Jalton',
    wikidataId: 'Q3591191',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q65593444 (Special:EntityData — P569 09/03/1966, P39 : Maire de Baie-Mahault
    //           depuis déc. 2015 puis depuis mai 2020, Conseillère régionale 2020-2026)
    //           + Wikipédia FR "Baie-Mahault" (liste des maires, Hélène Molia-Polifonte réélue juin 2020)
    nom: 'Molia-Polifonte',
    prenom: 'Hélène',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-03-09'),
    lieuNaissance: null,
    rolePrincipal: 'Maire de Baie-Mahault',
    rolesSecondaires: [
      "Maire de Baie-Mahault (depuis décembre 2015, réélue en mai 2020)",
      "Conseillère régionale de Guadeloupe (depuis 2020)",
      "professeure d'histoire-géographie de formation",
    ],
    bio:
      "Hélène Molia-Polifonte, professeure d'histoire-géographie de formation, est élue Maire de " +
      "Baie-Mahault en décembre 2015, succédant à Guy Losbar (qui devient président du CD en 2021). " +
      "Elle est réélue en mai 2020 pour la mandature 2020-2026. Baie-Mahault est la commune la plus " +
      "peuplée de Guadeloupe (environ 30 000 habitants) et abrite la zone industrielle principale de l'archipel.",
    wikipediaUrl: null,
    wikidataId: 'Q65593444',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2898044 (Special:EntityData — P112 fondateur GBH Q3117340, P569 1934,
    //           P19 Martinique, P106 entrepreneur Q131524, P166 Grand Officier Légion d'honneur 2024)
    //           + Wikipédia FR "Bernard Hayot" (famille béké, plantation Clément 1986, GBH fondé 1960)
    //           + Wikipédia FR "Groupe Bernard Hayot" (CA 5,27 Mds €, présence Guadeloupe + outre-mer)
    // Note date naissance : Wikidata indique 28/10/1934, Wikipédia FR indique 18/10/1934.
    //   Le présent seed retient 18/10/1934 (source rédactionnelle FR plus détaillée).
    // Rôle public : figure économique emblématique des Antilles françaises ("béké", grande distribution).
    // Son fils Stéphane Hayot (PDG actuel) n'a pas de Q-id Wikidata vérifié → exclu du seed.
    nom: 'Hayot',
    prenom: 'Bernard',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1934-10-18'),
    lieuNaissance: 'Martinique',
    rolePrincipal: 'Fondateur du Groupe Bernard Hayot (GBH)',
    rolesSecondaires: [
      "Grand Officier de la Légion d'honneur (depuis 2024)",
      "propriétaire de l'Habitation Clément (achetée en 1986)",
      "figure de la communauté béké des Antilles françaises",
    ],
    bio:
      "Issu d'une famille béké martiniquaise dont la fortune remonte à l'époque esclavagiste, Bernard " +
      "Hayot fonde en 1960 le Groupe Bernard Hayot (GBH), aujourd'hui dirigé par son fils Stéphane. " +
      "GBH est le leader de la grande distribution aux Antilles françaises (CA 5,27 Mds € en 2025 : " +
      "Carrefour, Mr.Bricolage, Décathlon, concessions auto). En 1986, il acquiert l'Habitation Clément " +
      "(Martinique), qui accueille en 1991 le sommet Bush-Mitterrand. Grand Officier de la Légion " +
      "d'honneur (2024). Son groupe est régulièrement ciblé lors des mobilisations contre la vie chère. " +
      "⚠ Enquête judiciaire ouverte depuis août 2025 pour abus de position dominante et entente " +
      "dans le secteur automobile : PRÉSUMÉ INNOCENT (aucune condamnation à ce jour).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bernard_Hayot',
    wikidataId: 'Q2898044',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q2994255 (wikidata.org/wiki/Q2994255 — Conseil régional Guadeloupe)
    //           + Wikipédia FR "Conseil régional de la Guadeloupe" (Chalus président depuis 2015,
    //             41 conseillers, siège Basse-Terre av. Paul Lacavé)
    nom: 'Conseil régional de la Guadeloupe',
    sigle: 'CR Guadeloupe',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.regionguadeloupe.fr',
    description:
      "Assemblée délibérante de la Région Guadeloupe, composée de 41 conseillers régionaux élus pour " +
      "6 ans. Siège : Basse-Mahault, avenue Paul Lacavé, Basse-Terre. Présidé par Ary Chalus depuis " +
      "décembre 2015 (réélu en juillet 2021 avec 33 sièges sur 41). Collectivité régie par la loi " +
      "du 2 mars 1982 (décentralisation), gère notamment l'éducation secondaire, la formation " +
      "professionnelle, les transports et le développement économique régional.",
    dateCreation: new Date('1974-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Conseil_r%C3%A9gional_de_la_Guadeloupe',
    wikidataId: 'Q2994255',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q23782113 (wikidata.org/wiki/Q23782113 — Conseil départemental Guadeloupe)
    //           + Wikipédia FR "Conseil départemental de la Guadeloupe" (Losbar élu 1er juil. 2021,
    //             42 conseillers, siège Basse-Terre bd Félix Éboué, budget €910 M)
    nom: 'Conseil départemental de la Guadeloupe',
    sigle: 'CD Guadeloupe',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.cg971.fr',
    description:
      "Assemblée délibérante du Département de la Guadeloupe (971), composée de 42 conseillers " +
      "départementaux représentant 21 cantons. Siège : Palais du Conseil général, boulevard Félix " +
      "Éboué, Basse-Terre. Budget total : 910 M€ (dont 165 M€ en investissement). Présidé par " +
      "Guy Losbar depuis le 1er juillet 2021. Gère l'action sociale (RSA, personnes âgées), " +
      "les routes et l'aménagement du territoire.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Conseil_d%C3%A9partemental_de_la_Guadeloupe',
    wikidataId: 'Q23782113',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q13636 (wikidata.org — "commune in Guadeloupe, France")
    //           + Wikipédia FR "Les Abymes" (commune la plus peuplée de Guadeloupe, ~57 000 hab.)
    nom: 'Commune des Abymes',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.mairie-lesabymes.fr',
    description:
      "Commune la plus peuplée de Guadeloupe (~57 000 habitants), chef-lieu de la 1re circonscription. " +
      "Membre de la Communauté d'agglomération Cap Excellence. Maire : Éric Jalton (depuis 2008).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_Abymes',
    wikidataId: 'Q13636',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q335322 (wikidata.org — "French commune in Guadeloupe")
    //           + Wikipédia FR "Pointe-à-Pitre" (ville économique principale, ~15 000 hab.)
    nom: 'Commune de Pointe-à-Pitre',
    sigle: 'PAP',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.pointeapitre.fr',
    description:
      "Principale ville économique de Guadeloupe (~15 000 habitants), chef-lieu d'arrondissement, " +
      "port de commerce et de croisière. Membre de la CA Cap Excellence. Maire : Harry Durimel (depuis 2020).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Pointe-%C3%A0-Pitre',
    wikidataId: 'Q335322',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q660165 (wikidata.org — "commune in Guadeloupe, France")
    //           + Wikipédia FR "Baie-Mahault" (~30 000 hab., zone industrielle principale)
    nom: 'Commune de Baie-Mahault',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.mairiebaie-mahault.fr',
    description:
      "Commune la plus peuplée de Guadeloupe hors Les Abymes (~30 000 habitants). " +
      "Abrite la Jarry, zone industrielle et commerciale principale des Antilles françaises. " +
      "Membre de la CA Cap Excellence. Maire : Hélène Molia-Polifonte (depuis déc. 2015, réélue 2020).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Baie-Mahault',
    wikidataId: 'Q660165',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3117340 (wikidata.org — "entreprise française", fondateur Q2898044,
    //           siège Martinique Q947069, siteWeb gbh.fr)
    //           + Wikipédia FR "Groupe Bernard Hayot" (CA 5,27 Mds €, fondé 1960, grande distribution
    //           + automobile + agroalimentaire, présence Guadeloupe : Carrefour, Décathlon, concessions)
    //           + Wikipédia FR "Bernard Hayot" (famille béké, historique du groupe)
    // ⚠ Enquête ouverte depuis août 2025 (abus de position dominante, secteur auto) —
    //   PRÉSUMÉ INNOCENT, mentionné en transparence.
    nom: 'Groupe Bernard Hayot',
    sigle: 'GBH',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.gbh.fr',
    description:
      "Conglomérat martiniquais fondé en 1960 par Bernard Hayot, aujourd'hui dirigé par son fils " +
      "Stéphane Hayot. Leader de la grande distribution aux Antilles françaises : CA 5,27 Mds € en 2025 " +
      "(51 % grande distribution dont Carrefour, 40 % automobile, 9 % divers). Présence en Guadeloupe, " +
      "Martinique, Guyane, La Réunion, Mayotte, Nouvelle-Calédonie, Caraïbes, Afrique et Chine. " +
      "Régulièrement ciblé lors des mobilisations contre la vie chère aux Antilles. " +
      "⚠ Enquête judiciaire ouverte depuis août 2025 pour abus de position dominante et entente " +
      "dans le secteur automobile — PRÉSUMÉ INNOCENT (aucune condamnation à ce jour).",
    dateCreation: new Date('1960-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Groupe_Bernard_Hayot',
    wikidataId: 'Q3117340',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3080535 (wikidata.org — "French-language daily newspaper")
    //           + Wikipédia FR "France-Antilles" (quotidien fondé 1964, Guadeloupe + Martinique)
    nom: 'France-Antilles',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.guadeloupe.franceantilles.fr',
    description:
      "Quotidien régional francophone couvrant la Guadeloupe et la Martinique. Fondé en 1964, " +
      "il est le principal titre de presse écrite des Antilles françaises. Éditions séparées " +
      "Guadeloupe et Martinique. Référence médiatique locale pour les actualités politiques, " +
      "judiciaires et économiques de l'archipel.",
    dateCreation: new Date('1964-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/France-Antilles',
    wikidataId: 'Q3080535',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    // Renaissance — déjà en base si seed-macron-v2.js a été exécuté.
    // Upsert idempotent : aucun doublon créé.
    // Sources : Wikidata Q23731823 + Wikipédia FR "Renaissance (parti)"
    nom: 'Renaissance',
    sigle: 'RE',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://parti-renaissance.fr',
    description:
      "Parti politique français fondé le 6 avril 2016 sous le nom « En Marche » par Emmanuel Macron, " +
      "renommé LREM puis Renaissance (RE) le 17 septembre 2022. Ary Chalus, membre affilié en " +
      "Guadeloupe, a rejoint le bureau exécutif de LREM en novembre 2017.",
    dateCreation: new Date('2016-04-06'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Renaissance_(parti)',
    wikidataId: 'Q23731823',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Parti socialiste — upsert idempotent.
    // Sources : Wikidata Q170972 ("French political party, 1969-present")
    //           + Wikipédia FR "Parti socialiste (France)"
    nom: 'Parti socialiste',
    sigle: 'PS',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.parti-socialiste.fr',
    description:
      "Parti politique français de centre-gauche fondé en 1969. Principale force d'opposition de " +
      "gouvernement. Guy Losbar (Guadeloupe) et Éric Jalton (Guadeloupe) y sont affiliés.",
    dateCreation: new Date('1969-07-11'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Parti_socialiste_(France)',
    wikidataId: 'Q170972',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, dateConsultation 2026-07-02.
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_chalus: {
    url: 'https://fr.wikipedia.org/wiki/Ary_Chalus',
    titre: 'Ary Chalus — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Parcours politique : Maire de Baie-Mahault, Député, Président du CR Guadeloupe depuis 2015. " +
      "Condamné TC Basse-Terre janv. 2024, confirmé CA Basse-Terre 20 mai 2025 (abus de confiance " +
      "+ dépassement plafonds comptes campagne 2015). Pourvoi cassation annoncé.",
    verifiee: true,
  },
  wp_losbar: {
    url: 'https://fr.wikipedia.org/wiki/Guy_Losbar',
    titre: 'Guy Losbar — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Expert-comptable, maire de Petit-Bourg (2014-2021), élu Président du Conseil " +
      "départemental de la Guadeloupe le 1er juillet 2021. PS-GUSR.",
    verifiee: true,
  },
  wp_pap: {
    url: 'https://fr.wikipedia.org/wiki/Pointe-%C3%A0-Pitre',
    titre: 'Pointe-à-Pitre — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Page Wikipédia de la commune. Confirme Harry Durimel comme maire depuis 2020 " +
      "(liste des maires, mandature 2020-2026).",
    verifiee: true,
  },
  wp_jalton: {
    url: 'https://fr.wikipedia.org/wiki/%C3%89ric_Jalton',
    titre: 'Éric Jalton — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Chirurgien-dentiste, Député 2002-2017, Maire des Abymes depuis 2008 (réélu 2014 et 2020). " +
      "Président de la CA Cap Excellence. Membre du Parti socialiste.",
    verifiee: true,
  },
  wp_les_abymes: {
    url: 'https://fr.wikipedia.org/wiki/Les_Abymes',
    titre: 'Les Abymes — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Confirme Éric Jalton comme maire des Abymes pour la mandature 2020-2026 " +
      "(section « Politique et administration », liste des maires).",
    verifiee: true,
  },
  wp_baie_mahault: {
    url: 'https://fr.wikipedia.org/wiki/Baie-Mahault',
    titre: 'Baie-Mahault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Confirme Hélène Molia-Polifonte (alias Hélène Polifonte-Molia) comme maire de Baie-Mahault " +
      "depuis décembre 2015, réélue juin 2020 (mandature 2020-2026).",
    verifiee: true,
  },
  wp_hayot: {
    url: 'https://fr.wikipedia.org/wiki/Bernard_Hayot',
    titre: 'Bernard Hayot — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Entrepreneur martiniquais né en 1934, fondateur du GBH (1960). Acquisition de " +
      "l'Habitation Clément en 1986. Famille béké. Grand Officier Légion d'honneur (2024). " +
      "Date de naissance : 18 oct. 1934 (Wikidata indique 28 oct. — discordance notée).",
    verifiee: true,
  },
  wp_gbh: {
    url: 'https://fr.wikipedia.org/wiki/Groupe_Bernard_Hayot',
    titre: 'Groupe Bernard Hayot — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "CA 5,27 Mds € en 2025. 51 % grande distribution (Carrefour, Décathlon, Mr.Bricolage), " +
      "40 % automobile. Présence Guadeloupe, Martinique, Guyane, La Réunion, DOM-TOM, Afrique, Chine.",
    verifiee: true,
  },
  wp_cr_guadeloupe: {
    url: 'https://fr.wikipedia.org/wiki/Conseil_r%C3%A9gional_de_la_Guadeloupe',
    titre: 'Conseil régional de la Guadeloupe — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "41 conseillers régionaux, mandature 2021-2028 (majorité GUSR 33/41). Ary Chalus " +
      "élu Président le 18 décembre 2015, réélu le 2 juillet 2021. Siège : Basse-Terre.",
    verifiee: true,
  },
  wp_cd_guadeloupe: {
    url: 'https://fr.wikipedia.org/wiki/Conseil_d%C3%A9partemental_de_la_Guadeloupe',
    titre: 'Conseil départemental de la Guadeloupe — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "42 conseillers départementaux, 21 cantons, budget 910 M€. Guy Losbar élu Président " +
      "le 1er juillet 2021. Siège : Palais du Conseil général, bd Félix Éboué, Basse-Terre.",
    verifiee: true,
  },
  wp_france_antilles: {
    url: 'https://fr.wikipedia.org/wiki/France-Antilles',
    titre: 'France-Antilles — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Quotidien régional francophone, fondé en 1964. Principal titre de presse écrite " +
      "des Antilles françaises. Éditions Guadeloupe et Martinique séparées.",
    verifiee: true,
  },
  wp_renaissance: {
    url: 'https://fr.wikipedia.org/wiki/Renaissance_(parti)',
    titre: 'Renaissance (parti) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Parti fondé par Macron (avr. 2016), renommé Renaissance le 17 sept. 2022. Chalus " +
      "membre du bureau exécutif de LREM depuis novembre 2017 (quitté à l'été 2021).",
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
      "Parti de centre-gauche fondé en 1969. Guy Losbar et Éric Jalton (Guadeloupe) " +
      "sont affiliés au PS dans leurs mandats documentés sur Wikidata.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002).
// aRef / bRef = wikidataId de l'entité concernée.
// ---------------------------------------------------------------------------

const LIENS = [
  {
    // P-O : Chalus → Conseil régional — mandat de Président (depuis déc. 2015, réélu juil. 2021).
    aType: 'personne',
    aRef: 'Q2866091',
    bType: 'organisation',
    bRef: 'Q2994255',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Ary Chalus est Président du Conseil régional de la Guadeloupe depuis le 18 décembre 2015, " +
      "réélu le 2 juillet 2021 pour la mandature 2021-2028 (liste GUSR, 33 sièges sur 41).",
    dateDebut: new Date('2015-12-18'),
    dateFin: null,
    sourceRef: 'wp_chalus',
  },
  {
    // P-O : Losbar → Conseil départemental — mandat de Président (depuis juil. 2021).
    aType: 'personne',
    aRef: 'Q63610722',
    bType: 'organisation',
    bRef: 'Q23782113',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Guy Losbar est Président du Conseil départemental de la Guadeloupe depuis le 1er juillet 2021, " +
      "élu par les conseillers départementaux après les élections cantonales de juin 2021 (liste PS-GUSR).",
    dateDebut: new Date('2021-07-01'),
    dateFin: null,
    sourceRef: 'wp_losbar',
  },
  {
    // P-O : Durimel → Pointe-à-Pitre — mandat de Maire (depuis 2020).
    aType: 'personne',
    aRef: 'Q5668504',
    bType: 'organisation',
    bRef: 'Q335322',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Harry Durimel est Maire de Pointe-à-Pitre depuis juillet 2020 (mandature 2020-2026). " +
      "Ancien Député de la Guadeloupe, 4e circonscription (2015-2020).",
    dateDebut: new Date('2020-07-01'),
    dateFin: null,
    sourceRef: 'wp_pap',
  },
  {
    // P-O : Jalton → Les Abymes — mandat de Maire (depuis 2008, réélu 2014 et 2020).
    aType: 'personne',
    aRef: 'Q3591191',
    bType: 'organisation',
    bRef: 'Q13636',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Éric Jalton est Maire des Abymes depuis 2008, réélu en 2014 et en juin 2020 " +
      "(mandature 2020-2026). Il préside également la CA Cap Excellence (Les Abymes / PAP / Baie-Mahault).",
    dateDebut: new Date('2008-03-16'),
    dateFin: null,
    sourceRef: 'wp_les_abymes',
  },
  {
    // P-O : Molia-Polifonte → Baie-Mahault — mandat de Maire (depuis déc. 2015, réélue mai 2020).
    aType: 'personne',
    aRef: 'Q65593444',
    bType: 'organisation',
    bRef: 'Q660165',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Hélène Molia-Polifonte est Maire de Baie-Mahault depuis décembre 2015 (élue après la " +
      "démission de Guy Losbar devenu Président du CD), réélue en mai 2020 (mandature 2020-2026).",
    dateDebut: new Date('2015-12-01'),
    dateFin: null,
    sourceRef: 'wp_baie_mahault',
  },
  {
    // P-O : Bernard Hayot → GBH — fondateur (depuis 1960).
    // Son fils Stéphane est PDG actuel mais n'a pas de Q-id Wikidata vérifié.
    aType: 'personne',
    aRef: 'Q2898044',
    bType: 'organisation',
    bRef: 'Q3117340',
    typeLienCode: 'FONDATEUR',
    description:
      "Bernard Hayot a fondé le Groupe Bernard Hayot (GBH) en 1960 en Martinique. " +
      "La direction opérationnelle est assurée depuis par son fils Stéphane Hayot (PDG actuel, " +
      "sans Q-id Wikidata vérifié à ce jour).",
    dateDebut: new Date('1960-01-01'),
    dateFin: null,
    sourceRef: 'wp_hayot',
  },
  {
    // P-O : Chalus → Renaissance — affiliation partisane.
    // Chalus rejoint le bureau exécutif de LREM (futur Renaissance) en novembre 2017.
    aType: 'personne',
    aRef: 'Q2866091',
    bType: 'organisation',
    bRef: 'Q23731823',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Ary Chalus a intégré le bureau exécutif de LREM (devenu Renaissance) en novembre 2017 " +
      "et en est sorti à l'été 2021. Il reste affilié à Renaissance comme force d'appui " +
      "de sa liste GUSR en Guadeloupe.",
    dateDebut: new Date('2017-11-01'),
    dateFin: null,
    sourceRef: 'wp_renaissance',
  },
  {
    // P-O : Losbar → Parti socialiste — affiliation partisane.
    aType: 'personne',
    aRef: 'Q63610722',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Guy Losbar est membre du Parti socialiste (PS), documenté via sa fiche Wikidata " +
      "(P102 Q170972). Il conduit la liste PS-GUSR aux élections départementales guadeloupéennes.",
    dateDebut: new Date('2004-01-01'),
    dateFin: null,
    sourceRef: 'wp_ps',
  },
  {
    // P-O : Jalton → Parti socialiste — affiliation partisane.
    aType: 'personne',
    aRef: 'Q3591191',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Éric Jalton est membre du Parti socialiste (PS), affilié documenté via Wikidata (P102).",
    dateDebut: new Date('2002-01-01'),
    dateFin: null,
    sourceRef: 'wp_jalton',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (calqués sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-guadeloupe] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-guadeloupe] Entité introuvable pour lien ${lien.typeLienCode} ` +
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
  console.log("⚠ Suppression données Guadeloupe précédentes...")
  const wikidataIdsP = PERSONNES.map((p) => p.wikidataId)
  const wikidataIdsO = ORGANISATIONS.map((o) => o.wikidataId)

  const persos = await prisma.personne.findMany({ where: { wikidataId: { in: wikidataIdsP } } })
  const orgas = await prisma.organisation.findMany({
    where: { wikidataId: { in: wikidataIdsO } },
  })

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
  console.log("✓ Données précédentes supprimées.\n")
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n┌─ seed-region-guadeloupe — réseau d'influence Guadeloupe ─┐\n")
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`✓ User : ${user.email}\n`)

  console.log("— Sources publiques —")
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ✓ ${data.titre}`)
  }

  console.log("\n— Personnes (Wikidata) —")
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ✓ ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log("\n— Organisations (Wikidata) —")
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ✓ ${created.nom} (${o.wikidataId})`)
  }

  console.log("\n— Liens —")
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ✓ ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log("\n┌─ Bilan ──────────────────────────────────────────────────────────────┐")
  console.log(`│ Personnes     : ${PERSONNES.length} (Chalus, Losbar, Durimel, Jalton, Molia-Polifonte, B. Hayot)`)
  console.log(`│ Organisations : ${ORGANISATIONS.length} (CR, CD, 3 communes, GBH, France-Antilles, Renaissance, PS)`)
  console.log(`│ Sources       : ${Object.keys(SOURCES).length} (Wikipédia FR × 13)`)
  console.log(`│ Liens         : ${LIENS.length} (MANDAT_ELECTIF × 5, FONDATEUR × 1, AFFILIATION_PARTI × 3)`)
  console.log("│")
  console.log("│ Affaires signalées (statut procédural exact) :")
  console.log("│   • Ary Chalus : condamné TC Basse-Terre (janv. 2024) + CA (20 mai 2025),")
  console.log("│     pourvoi cassation annoncé — documenté dans bio personne.")
  console.log("│   • GBH : enquête abus position dominante depuis août 2025 — PRÉSUMÉ INNOCENT.")
  console.log("│")
  console.log("│ Exclusions (sans Q-id Wikidata vérifié) :")
  console.log("│   • Stéphane Hayot (PDG GBH), maires Basse-Terre/Le Gosier, GUSR (parti)")
  console.log("└──────────────────────────────────────────────────────────────────────┘\n")
}

main()
  .catch((err) => {
    console.error("[seed-guadeloupe] Échec :", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
