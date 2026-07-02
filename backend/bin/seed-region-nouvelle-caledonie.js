/**
 * Seed Nouvelle-Calédonie — réseau d'influence OSINT (corpus 2026-07-02).
 *
 * Périmètre : collectivité sui generis, Congrès, Gouvernement, 3 provinces,
 *             forces politiques (indépendantistes / loyalistes), acteurs nickel,
 *             presse principale. Q-ids Wikidata tous vérifiés via wbsearchentities
 *             et Special:EntityData.
 *
 * Sources primaires : Wikidata, Wikipédia FR, vie-publique.fr.
 *
 * Contexte sensible (à lire avant toute exploitation) :
 *  - Référendums d'autodétermination 2018 / 2020 / 2021 (dernier : 96,5 % non,
 *    participation contestée par les indépendantistes). Procédure ONU C.24 ouverte.
 *  - Crise 2024 : violences lors des débats sur le dégel du corps électoral
 *    (loi constitutionnelle), plusieurs morts, état d'urgence. Présomption
 *    d'innocence appliquée à tous les volets judiciaires toujours en cours.
 *  - Crise nickel 2023-2024 : chute des prix face à la concurrence indonésienne,
 *    menaces de fermeture SLN et Prony Resources — enjeu économique structurel.
 *
 * Entités exclues faute de Q-id Wikidata vérifié :
 *  - KNS (Koniambo Nickel SAS) — pas de résultat wbsearchentities
 *  - PALIKA — pas de résultat wbsearchentities
 *  - Présidents Province Nord et Province Îles Loyauté (mandats 2024+ non vérifiés)
 *  - Haut-commissaire de la République — potentiellement en base (réfère par wikidataId si présent)
 *
 * Garde-fous projet :
 *  - Toutes les entités en statut EN_ATTENTE (ADR-006 / ADR-010) — jamais VALIDE auto
 *  - qualiteInfluence obligatoire sur chaque personne
 *  - Idempotent (upsert par wikidataId)
 *  - Pas de champ siren (non applicable aux entités NC)
 *
 * Usage :
 *  cd backend && node bin/seed-region-nouvelle-caledonie.js
 *  cd backend && node bin/seed-region-nouvelle-caledonie.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — chaque fiche recoupée par ≥ 2 sources publiques (cf. commentaires).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q65596784 (né 23/05/1975 Nouméa, homme politique FR/NC) + Wikipédia FR
    // Fonctions vérifiées : président Le Rassemblement (avr. 2024), président gouvernement NC (jan. 2025)
    // Parcours nickel vérifié : ex-dirigeant SLN et KNS (Wikipédia FR, section biographie)
    nom: 'Ponga',
    prenom: 'Alcide',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1975-05-23'),
    lieuNaissance: 'Nouméa (Nouvelle-Calédonie)',
    rolePrincipal: 'Président du gouvernement de la Nouvelle-Calédonie',
    rolesSecondaires: [
      "président du parti Le Rassemblement depuis avril 2024",
      "ancien dirigeant de la Société Le Nickel (SLN, filiale Eramet)",
      "ancien dirigeant de Koniambo Nickel (KNS)",
    ],
    bio:
      "Issu d'une famille kanak protestante engagée pour le maintien de la NC dans la République " +
      "(mère Léontine Ponga, élue provinciale ; oncle Maurice Ponga, député européen), Alcide Ponga " +
      "a étudié à Toulouse (master science politique, programme 400 cadres). Il a occupé des fonctions " +
      "dirigeantes à la SLN et à KNS avant de prendre la présidence du Rassemblement en avril 2024. " +
      "Élu président du gouvernement de la NC le 8 janvier 2025, il succède à Louis Mapou (FLNKS).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Alcide_Ponga',
    wikidataId: 'Q65596784',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q78223158 (né 14/11/1958 Lyon, position P39 = Q3253694 depuis 08/07/2021) + Wikipédia FR
    // Fonctions vérifiées : premier président indépendantiste du gouvernement NC (2021-2024)
    nom: 'Mapou',
    prenom: 'Louis',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-11-14'),
    lieuNaissance: 'Lyon (Rhône)',
    rolePrincipal: 'Ancien président du gouvernement de la Nouvelle-Calédonie (2021-2024)',
    rolesSecondaires: [
      'membre du PALIKA (parti membre du FLNKS)',
      'conseiller de la Nouvelle-Calédonie',
    ],
    bio:
      "Premier président indépendantiste du gouvernement de la Nouvelle-Calédonie, Louis Mapou (PALIKA/FLNKS) " +
      "prend ses fonctions le 8 juillet 2021. Son gouvernement chute le 24 décembre 2024 après la " +
      "démission collective des membres de Calédonie ensemble, en pleine crise institutionnelle liée " +
      "aux émeutes de 2024 et au dégel du corps électoral.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Louis_Mapou',
    wikidataId: 'Q78223158',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3437790 (né 13/12/1950 Lyon, P39 = président Congrès 2019-2024) + Wikipédia FR
    // Fonctions vérifiées : président Congrès NC du 24/05/2019 au 29/08/2024 ; membre UC depuis 1979
    nom: 'Wamytan',
    prenom: 'Roch',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1950-12-13'),
    lieuNaissance: 'Lyon (Rhône)',
    rolePrincipal: 'Ancien président du Congrès de la Nouvelle-Calédonie (2019-2024)',
    rolesSecondaires: [
      "chef coutumier kanak indépendantiste",
      "vice-président de l'Union calédonienne (UC)",
      "conseiller de la Nouvelle-Calédonie (depuis 1999)",
    ],
    bio:
      "Figure historique de l'indépendantisme kanak, Roch Wamytan est membre de l'Union calédonienne " +
      "depuis 1979. Président du Congrès de la Nouvelle-Calédonie du 24 mai 2019 au 29 août 2024, " +
      "il est remplacé par Veylma Falaeo lors d'un vote surprise post-crise 2024. Il reste conseiller " +
      "de la NC et voix emblématique du FLNKS au niveau national.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Roch_Wamytan',
    wikidataId: 'Q3437790',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3490407 (née 21/05/1976 Paris, P39 = présidente Province Sud depuis 17/05/2019,
    //           P102 = Q3226266 Le Rassemblement) + Wikipédia FR
    nom: 'Backès',
    prenom: 'Sonia',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1976-05-21'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Présidente de la Province Sud de la Nouvelle-Calédonie',
    rolesSecondaires: [
      "membre du parti Le Rassemblement (NC) / Les Républicains (national)",
      "porte-parole de la coalition Les Loyalistes",
      "ancienne secrétaire d'État chargée de la Citoyenneté (2022-2023)",
    ],
    bio:
      "Présidente de la Province Sud depuis le 17 mai 2019, Sonia Backès est la figure de proue " +
      "du camp loyaliste calédonien. Membre du Rassemblement NC (affilié LR), elle a siégé comme " +
      "secrétaire d'État auprès du gouvernement Borne (juillet 2022 – octobre 2023). " +
      "Elle incarne la ligne dure anti-indépendance sur la scène nationale.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Sonia_Back%C3%A8s',
    wikidataId: 'Q3490407',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q127277528 (née 24/08/1982 Nouméa, politicienne calédonienne) + Wikipédia FR
    // Fonctions vérifiées : présidente du Congrès NC depuis 29/08/2024 ; fondatrice L'Éveil océanien (02/03/2019)
    nom: 'Falaeo',
    prenom: 'Veylma',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1982-08-24'),
    lieuNaissance: 'Nouméa (Nouvelle-Calédonie)',
    rolePrincipal: 'Présidente du Congrès de la Nouvelle-Calédonie',
    rolesSecondaires: [
      "membre fondatrice de L'Éveil océanien (2019)",
      "première femme présidente du Congrès NC",
      "première personnalité d'origine wallisienne-futunienne à ce poste",
    ],
    bio:
      "Élue présidente du Congrès de la Nouvelle-Calédonie le 29 août 2024, Veylma Falaeo est la première " +
      "femme et la première personnalité d'origine wallisienne-futunienne à occuper cette fonction. " +
      "Fondatrice de L'Éveil océanien (mars 2019), parti représentant la communauté walliso-futunienne, " +
      "elle incarne un positionnement centriste dans un paysage polarisé.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Veylma_Falaeo',
    wikidataId: 'Q127277528',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  // ── INSTITUTIONS PUBLIQUES ────────────────────────────────────────────────

  {
    // Source : Wikidata Q33788 + Wikipédia FR
    nom: 'Nouvelle-Calédonie',
    sigle: 'NC',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://gouv.nc',
    description:
      "Collectivité sui generis française du Pacifique Sud dotée d'un statut unique (accord de Nouméa 1998). " +
      "Dispose d'un Congrès législatif et d'un gouvernement collégial. Trois référendums d'autodétermination " +
      "organisés (2018, 2020, 2021) ; le dernier a rejeté l'indépendance à 96,5 % (participation " +
      "contestée par les indépendantistes). Crise institutionnelle et sociale majeure en 2024.",
    dateCreation: new Date('1998-05-05'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nouvelle-Cal%C3%A9donie',
    wikidataId: 'Q33788',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Source : Wikidata Q2993118 + Wikipédia FR
    nom: 'Congrès de la Nouvelle-Calédonie',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.congres.nc',
    description:
      "Assemblée délibérante de la NC, composée de 54 membres (membres des 3 assemblées de province). " +
      "Vote le budget territorial, adopte les lois du pays, élit le gouvernement collégial. " +
      "Présidée par Veylma Falaeo (L'Éveil océanien) depuis le 29 août 2024.",
    dateCreation: new Date('1999-05-09'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Congr%C3%A8s_de_la_Nouvelle-Cal%C3%A9donie',
    wikidataId: 'Q2993118',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Source : Wikidata Q3112596 + Wikipédia FR
    nom: 'Gouvernement de la Nouvelle-Calédonie',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://gouv.nc',
    description:
      "Organe exécutif collégial de la Nouvelle-Calédonie, élu par le Congrès. " +
      "Présidé par Alcide Ponga (Le Rassemblement) depuis le 8 janvier 2025, " +
      "il succède à Louis Mapou (PALIKA/FLNKS, 2021-2024).",
    dateCreation: new Date('1999-05-09'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Gouvernement_de_la_Nouvelle-Cal%C3%A9donie',
    wikidataId: 'Q3112596',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Source : Wikidata Q965632 + Wikipédia FR
    nom: 'Province Sud',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.province-sud.nc',
    description:
      "Province la plus peuplée de NC (Nouméa, Grand Nouméa). 40 des 54 membres du Congrès. " +
      "Présidée par Sonia Backès (Le Rassemblement/loyaliste) depuis mai 2019.",
    dateCreation: new Date('1988-06-26'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Province_Sud_(Nouvelle-Cal%C3%A9donie)',
    wikidataId: 'Q965632',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Source : Wikidata Q1612920 + Wikipédia FR
    nom: 'Province Nord',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.province-nord.nc',
    description:
      "Province septentrionale, à majorité kanak, traditionnellement à dominante indépendantiste. " +
      "22 membres au Congrès. Abrite le site Koniambo (nickel).",
    dateCreation: new Date('1988-06-26'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Province_Nord_(Nouvelle-Cal%C3%A9donie)',
    wikidataId: 'Q1612920',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Source : Wikidata Q18655787 + Wikipédia FR
    nom: 'Province des Îles Loyauté',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.province-iles.nc',
    description:
      "Province insulaire (Maré, Lifou, Ouvéa) à dominante kanak et indépendantiste. " +
      "14 membres au Congrès. Pas d'exploitation nickel.",
    dateCreation: new Date('1988-06-26'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Province_des_%C3%8Eles-Loyaut%C3%A9',
    wikidataId: 'Q18655787',
    qualiteInfluence: 'AUTRE',
  },

  // ── PARTIS POLITIQUES ─────────────────────────────────────────────────────

  {
    // Source : Wikidata Q1723564 + Wikipédia FR
    nom: 'Front de libération nationale kanak et socialiste',
    sigle: 'FLNKS',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Coalition indépendantiste kanak fondée en septembre 1984 (UC, PALIKA, UPM et autres). " +
      "Principal acteur de la revendication d'indépendance : accords de Matignon (1988), " +
      "accord de Nouméa (1998), référendums 2018-2021.",
    dateCreation: new Date('1984-09-01'),
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/Front_de_lib%C3%A9ration_nationale_kanak_et_socialiste',
    wikidataId: 'Q1723564',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Source : Wikidata Q3550048 + Wikipédia FR
    nom: 'Union calédonienne',
    sigle: 'UC',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Parti indépendantiste fondé en 1953, membre fondateur du FLNKS (1984). " +
      "Plus vieux parti politique calédonien. Figure emblématique : Roch Wamytan.",
    dateCreation: new Date('1953-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Union_cal%C3%A9donienne',
    wikidataId: 'Q3550048',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Source : Wikidata Q3226266 + Wikipédia FR
    // NB : anciennement RPCR (Rassemblement pour la Calédonie dans la République, fondé 1977),
    //      renommé « Le Rassemblement » en 2018. Affilié aux Républicains (LR) nationalement.
    nom: 'Le Rassemblement',
    sigle: 'R-NC',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Parti loyaliste calédonien de tradition gaulliste (ex-RPCR, renommé en 2018), affilié nationalement " +
      "aux Républicains (LR). Présidé par Alcide Ponga depuis avril 2024. " +
      "Sonia Backès en est l'autre figure principale.",
    dateCreation: new Date('1977-09-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Le_Rassemblement_(Nouvelle-Cal%C3%A9donie)',
    wikidataId: 'Q3226266',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Source : Wikidata Q2934607 + Wikipédia FR
    nom: 'Calédonie ensemble',
    sigle: 'CE',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Parti loyaliste centriste fondé en 2008 (Philippe Gomès). Ses membres ont démissionné du " +
      "gouvernement Mapou le 24 décembre 2024, provoquant sa chute.",
    dateCreation: new Date('2008-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Cal%C3%A9donie_ensemble',
    wikidataId: 'Q2934607',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Source : Wikidata Q65123851 + Wikipédia FR
    nom: "L'Éveil océanien",
    sigle: 'EO',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Parti fondé le 2 mars 2019 pour représenter la communauté wallisienne-futunienne de NC. " +
      "Positionné centralement, arbitre de plusieurs votes au Congrès. " +
      "Veylma Falaeo, présidente du Congrès depuis août 2024, en est issue.",
    dateCreation: new Date('2019-03-02'),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/L%27%C3%89veil_oc%C3%A9anien",
    wikidataId: 'Q65123851',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Source : Wikidata Q124809433 + Wikipédia FR
    nom: 'Les Loyalistes',
    sigle: null,
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Coalition de partis loyalistes (opposés à l'indépendance) regroupant Le Rassemblement, " +
      "les Républicains calédoniens et d'autres formations. " +
      "Sonia Backès en est la porte-parole nationale la plus visible.",
    dateCreation: new Date('2020-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_Loyalistes',
    wikidataId: 'Q124809433',
    qualiteInfluence: 'AUTRE',
  },

  // ── MÉDIAS ────────────────────────────────────────────────────────────────

  {
    // Source : Wikidata Q3234264 + Wikipédia FR
    nom: 'Les Nouvelles calédoniennes',
    sigle: 'LNC',
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.lnc.nc',
    description:
      "Principal quotidien de Nouvelle-Calédonie (fondé 1971), diffusé en print et en ligne. " +
      "Source de référence pour la couverture des institutions (Congrès, gouvernement, provinces) " +
      "et de l'industrie du nickel.",
    dateCreation: new Date('1971-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_Nouvelles_cal%C3%A9doniennes',
    wikidataId: 'Q3234264',
    qualiteInfluence: 'AUTRE',
  },

  // ── ENTREPRISES (nickel) ──────────────────────────────────────────────────

  {
    // Source : Wikidata Q1347990 + Wikipédia FR
    // NB : Eramet potentiellement déjà en base via seed Macron/Renaissance → upsert idempotent
    nom: 'Eramet',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.eramet.com',
    description:
      "Groupe minier et métallurgique français (CAC Mid 60). Actionnaire majoritaire de la Société " +
      "Le Nickel (SLN) en NC. Confronté à la crise de rentabilité du nickel calédonien " +
      "face à la concurrence indonésienne depuis 2023.",
    dateCreation: new Date('1880-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Eramet',
    wikidataId: 'Q1347990',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Source : Wikidata Q16677178 (label FR : « Société Le Nickel », parent P749 = Q1347990 Eramet) + Wikipédia FR
    nom: 'Société Le Nickel',
    sigle: 'SLN',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.sln.nc',
    description:
      "Filiale d'Eramet, premier producteur de nickel de NC (Doniambo, mines du Grand-Nouméa). " +
      "En grave difficulté financière depuis 2023. Alcide Ponga y a exercé des fonctions " +
      "dirigeantes avant son engagement politique à temps plein.",
    dateCreation: new Date('1880-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Soci%C3%A9t%C3%A9_Le_Nickel',
    wikidataId: 'Q16677178',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Source : Wikidata Q112179302 + Wikipédia FR
    // Prony Resources = ex-Vale NC, repris 2021 par consortium SMSP + partenaires européens
    nom: 'Prony Resources',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.prony-resources.nc',
    description:
      "Opérateur de l'usine pyrométallurgique du Sud (ex-Vale NC), repris en 2021 par un consortium " +
      "incluant la SMSP (holding industrielle kanak) et des partenaires européens. " +
      "Deuxième acteur nickel de NC. En difficulté financière (chute des cours 2023-2024).",
    dateCreation: new Date('2021-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Prony_Resources',
    wikidataId: 'Q112179302',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées. dateConsultation 2026-07-02.
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_nc: {
    url: 'https://fr.wikipedia.org/wiki/Nouvelle-Cal%C3%A9donie',
    titre: 'Nouvelle-Calédonie — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Statut sui generis, accord de Nouméa, institutions (Congrès, gouvernement, 3 provinces), " +
      "référendums 2018-2021, crise 2024, économie nickel.",
    verifiee: true,
  },
  wp_gouvernement_nc: {
    url: 'https://fr.wikipedia.org/wiki/Gouvernement_de_la_Nouvelle-Cal%C3%A9donie',
    titre: 'Gouvernement de la Nouvelle-Calédonie — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Alcide Ponga élu président du gouvernement NC le 8 jan. 2025, en fonction depuis le 16 jan. 2025 ; " +
      "Louis Mapou (FLNKS) premier indépendantiste au poste (2021-2024), chute déc. 2024.",
    verifiee: true,
  },
  wp_congres: {
    url: 'https://fr.wikipedia.org/wiki/Congr%C3%A8s_de_la_Nouvelle-Cal%C3%A9donie',
    titre: 'Congrès de la Nouvelle-Calédonie — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Veylma Falaeo (L'Éveil océanien) présidente depuis le 29 août 2024 (première femme, " +
      "première WF). Roch Wamytan président du 24 mai 2019 au 29 août 2024.",
    verifiee: true,
  },
  wp_ponga: {
    url: 'https://fr.wikipedia.org/wiki/Alcide_Ponga',
    titre: 'Alcide Ponga — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né le 23 mai 1975 à Nouméa. Président Le Rassemblement depuis avril 2024. " +
      "Président gouvernement NC depuis jan. 2025. Ancien dirigeant SLN et KNS.",
    verifiee: true,
  },
  wp_mapou: {
    url: 'https://fr.wikipedia.org/wiki/Louis_Mapou',
    titre: 'Louis Mapou — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né le 14 novembre 1958 à Lyon. PALIKA/FLNKS. Premier président indépendantiste " +
      "gouvernement NC (8 juil. 2021 – déc. 2024).",
    verifiee: true,
  },
  wp_wamytan: {
    url: 'https://fr.wikipedia.org/wiki/Roch_Wamytan',
    titre: 'Roch Wamytan — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né le 13 déc. 1950 à Lyon. Chef coutumier kanak. UC/FLNKS depuis 1979. " +
      "Président du Congrès NC 24 mai 2019 – 29 août 2024.",
    verifiee: true,
  },
  wp_backes: {
    url: 'https://fr.wikipedia.org/wiki/Sonia_Back%C3%A8s',
    titre: 'Sonia Backès — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Née le 21 mai 1976 à Paris. Présidente Province Sud NC depuis le 17 mai 2019. " +
      "Membre Le Rassemblement NC (P102 = Q3226266 per Wikidata). " +
      "Ancienne secrétaire d'État Citoyenneté (2022-2023).",
    verifiee: true,
  },
  wp_falaeo: {
    url: 'https://fr.wikipedia.org/wiki/Veylma_Falaeo',
    titre: 'Veylma Falaeo — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Née le 24 août 1982 à Nouméa. Présidente Congrès NC depuis le 29 août 2024. " +
      "Fondatrice L'Éveil océanien (2 mars 2019).",
    verifiee: true,
  },
  wp_flnks: {
    url: 'https://fr.wikipedia.org/wiki/Front_de_lib%C3%A9ration_nationale_kanak_et_socialiste',
    titre: 'Front de libération nationale kanak et socialiste — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Coalition indépendantiste (sept. 1984) : UC, PALIKA, UPM. Accords de Matignon (1988) " +
      "et de Nouméa (1998). Référendums 2018-2021.",
    verifiee: true,
  },
  wp_uc: {
    url: 'https://fr.wikipedia.org/wiki/Union_cal%C3%A9donienne',
    titre: 'Union calédonienne — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Parti indépendantiste fondé en 1953, membre fondateur du FLNKS (1984). " +
      "Roch Wamytan affilié depuis 1979.",
    verifiee: true,
  },
  wp_eramet: {
    url: 'https://fr.wikipedia.org/wiki/Eramet',
    titre: 'Eramet — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Groupe minier français, actionnaire majoritaire SLN (NC). Crise rentabilité nickel vs. " +
      "concurrence indonésienne depuis 2023.",
    verifiee: true,
  },
  wp_sln: {
    url: 'https://fr.wikipedia.org/wiki/Soci%C3%A9t%C3%A9_Le_Nickel',
    titre: 'Société Le Nickel — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Filiale Eramet (P749 = Q1347990 per Wikidata), premier producteur nickel NC. " +
      "Alcide Ponga y a exercé des fonctions dirigeantes. Difficultés financières 2023+.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — polymorphe 3 types (ADR-002). Exactement 1 entité non-nulle de chaque côté.
// Résolution des entités via wikidataId (cf. trouverEntite).
// ---------------------------------------------------------------------------

const LIENS = [
  // ── EXÉCUTIF ──────────────────────────────────────────────────────────────

  {
    // P-O : Ponga — président du gouvernement NC (en exercice depuis jan. 2025)
    aType: 'personne',
    aRef: 'Q65596784',
    bType: 'organisation',
    bRef: 'Q3112596',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Alcide Ponga est élu président du gouvernement de la Nouvelle-Calédonie le 8 janvier 2025 " +
      "par le Congrès et entre en fonction le 16 janvier 2025.",
    dateDebut: new Date('2025-01-08'),
    dateFin: null,
    sourceRef: 'wp_gouvernement_nc',
  },
  {
    // P-O : Mapou — ancien président du gouvernement NC (2021-2024)
    aType: 'personne',
    aRef: 'Q78223158',
    bType: 'organisation',
    bRef: 'Q3112596',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Louis Mapou (PALIKA/FLNKS) est le premier président indépendantiste du gouvernement NC " +
      "(8 juillet 2021). Son gouvernement chute le 24 décembre 2024 après la démission " +
      "des membres de Calédonie ensemble en pleine crise institutionnelle.",
    dateDebut: new Date('2021-07-08'),
    dateFin: new Date('2024-12-24'),
    sourceRef: 'wp_gouvernement_nc',
  },

  // ── LÉGISLATIF ────────────────────────────────────────────────────────────

  {
    // P-O : Falaeo — présidente du Congrès (en exercice depuis août 2024)
    aType: 'personne',
    aRef: 'Q127277528',
    bType: 'organisation',
    bRef: 'Q2993118',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Veylma Falaeo (L'Éveil océanien) est élue présidente du Congrès de la Nouvelle-Calédonie " +
      "le 29 août 2024, première femme et première personnalité wallisienne-futunienne à ce poste.",
    dateDebut: new Date('2024-08-29'),
    dateFin: null,
    sourceRef: 'wp_congres',
  },
  {
    // P-O : Wamytan — ancien président du Congrès (2019-2024)
    aType: 'personne',
    aRef: 'Q3437790',
    bType: 'organisation',
    bRef: 'Q2993118',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Roch Wamytan (UC/FLNKS) préside le Congrès de la Nouvelle-Calédonie du 24 mai 2019 " +
      "au 29 août 2024, date à laquelle il est remplacé par Veylma Falaeo.",
    dateDebut: new Date('2019-05-24'),
    dateFin: new Date('2024-08-29'),
    sourceRef: 'wp_wamytan',
  },

  // ── PROVINCE SUD ──────────────────────────────────────────────────────────

  {
    // P-O : Backès — présidente Province Sud (en exercice depuis mai 2019)
    aType: 'personne',
    aRef: 'Q3490407',
    bType: 'organisation',
    bRef: 'Q965632',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Sonia Backès (Le Rassemblement) est présidente de la Province Sud depuis le 17 mai 2019. " +
      "Figure de proue du camp loyaliste calédonien.",
    dateDebut: new Date('2019-05-17'),
    dateFin: null,
    sourceRef: 'wp_backes',
  },

  // ── AFFILIATIONS PARTISANES ───────────────────────────────────────────────

  {
    // P-O : Ponga — président et membre du Rassemblement
    aType: 'personne',
    aRef: 'Q65596784',
    bType: 'organisation',
    bRef: 'Q3226266',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Alcide Ponga préside Le Rassemblement depuis avril 2024, ce qui propulse " +
      "le parti loyaliste calédonien dans sa candidature à la tête du gouvernement NC.",
    dateDebut: new Date('2024-04-01'),
    dateFin: null,
    sourceRef: 'wp_ponga',
  },
  {
    // P-O : Mapou — affilié FLNKS (PALIKA membre du FLNKS)
    aType: 'personne',
    aRef: 'Q78223158',
    bType: 'organisation',
    bRef: 'Q1723564',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Louis Mapou est membre du PALIKA (Parti de libération kanak), composante du FLNKS, " +
      "dont il incarne la ligne indépendantiste.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_mapou',
  },
  {
    // P-O : Wamytan — affilié à l'Union calédonienne (depuis 1979)
    aType: 'personne',
    aRef: 'Q3437790',
    bType: 'organisation',
    bRef: 'Q3550048',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Roch Wamytan est membre de l'Union calédonienne depuis 1979 (exclusion temporaire 2004-2007). " +
      "Il en est la figure publique nationale la plus connue.",
    dateDebut: new Date('1979-01-01'),
    dateFin: null,
    sourceRef: 'wp_wamytan',
  },
  {
    // P-O : Backès — affiliée au Rassemblement NC (P102 = Q3226266 per Wikidata Q3490407)
    aType: 'personne',
    aRef: 'Q3490407',
    bType: 'organisation',
    bRef: 'Q3226266',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Sonia Backès est membre du Rassemblement NC (affilié LR nationalement). " +
      "Elle est aussi figure centrale de la coalition Les Loyalistes.",
    dateDebut: new Date('2017-12-07'),
    dateFin: null,
    sourceRef: 'wp_backes',
  },
  {
    // P-O : Falaeo — fondatrice et membre de L'Éveil océanien
    aType: 'personne',
    aRef: 'Q127277528',
    bType: 'organisation',
    bRef: 'Q65123851',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Veylma Falaeo est membre fondatrice de L'Éveil océanien (créé le 2 mars 2019), " +
      "parti représentant la communauté wallisienne-futunienne de Nouvelle-Calédonie.",
    dateDebut: new Date('2019-03-02'),
    dateFin: null,
    sourceRef: 'wp_falaeo',
  },

  // ── COALITIONS / FÉDÉRATIONS ──────────────────────────────────────────────

  {
    // O-O : UC membre fondateur du FLNKS
    aType: 'organisation',
    aRef: 'Q3550048',
    bType: 'organisation',
    bRef: 'Q1723564',
    typeLienCode: 'politique',
    description:
      "L'Union calédonienne est membre fondatrice du FLNKS (septembre 1984) et y représente " +
      "la tendance historiquement dominante de l'indépendantisme kanak.",
    dateDebut: new Date('1984-09-01'),
    dateFin: null,
    sourceRef: 'wp_uc',
  },

  // ── PARCOURS PRÉ-POLITIQUE : Ponga / SLN ─────────────────────────────────

  {
    // P-O : Ponga — ancien dirigeant SLN (avant politique à temps plein, avant avr. 2024)
    // Dates exactes non publiées dans les sources consultées ; fonction confirmée par Wikipédia FR biographie.
    aType: 'personne',
    aRef: 'Q65596784',
    bType: 'organisation',
    bRef: 'Q16677178',
    typeLienCode: 'EMPLOI',
    description:
      "Alcide Ponga a exercé des fonctions dirigeantes à la Société Le Nickel (SLN, filiale Eramet) " +
      "avant son engagement politique à temps plein (dates exactes non publiées). " +
      "Il a également dirigé Koniambo Nickel (KNS), dont le Q-id n'est pas disponible sur Wikidata.",
    dateDebut: null,
    dateFin: new Date('2024-04-01'),
    sourceRef: 'wp_ponga',
  },

  // ── LIENS INSTITUTIONNELS : institutions → collectivité NC ───────────────

  {
    // O-O : Gouvernement NC → Nouvelle-Calédonie (organe constitutif)
    aType: 'organisation',
    aRef: 'Q3112596',
    bType: 'organisation',
    bRef: 'Q33788',
    typeLienCode: 'institutionnel',
    description:
      "Le gouvernement de la NC est l'organe exécutif collégial de la collectivité sui generis, " +
      "élu par le Congrès conformément à la loi organique de 1999.",
    dateDebut: new Date('1999-05-09'),
    dateFin: null,
    sourceRef: 'wp_gouvernement_nc',
  },
  {
    // O-O : Congrès NC → Nouvelle-Calédonie (organe délibérant)
    aType: 'organisation',
    aRef: 'Q2993118',
    bType: 'organisation',
    bRef: 'Q33788',
    typeLienCode: 'institutionnel',
    description:
      "Le Congrès est l'assemblée délibérante de la collectivité NC (54 membres issus " +
      "des 3 assemblées de province).",
    dateDebut: new Date('1999-05-09'),
    dateFin: null,
    sourceRef: 'wp_congres',
  },
  {
    // O-O : Province Sud → Nouvelle-Calédonie
    aType: 'organisation',
    aRef: 'Q965632',
    bType: 'organisation',
    bRef: 'Q33788',
    typeLienCode: 'institutionnel',
    description:
      "La Province Sud est l'une des trois provinces constitutives de la NC instaurées " +
      "par les accords de Matignon (1988).",
    dateDebut: new Date('1988-06-26'),
    dateFin: null,
    sourceRef: 'wp_nc',
  },
  {
    // O-O : Province Nord → Nouvelle-Calédonie
    aType: 'organisation',
    aRef: 'Q1612920',
    bType: 'organisation',
    bRef: 'Q33788',
    typeLienCode: 'institutionnel',
    description:
      "La Province Nord est l'une des trois provinces constitutives de la NC (accords de Matignon 1988).",
    dateDebut: new Date('1988-06-26'),
    dateFin: null,
    sourceRef: 'wp_nc',
  },
  {
    // O-O : Province des Îles Loyauté → Nouvelle-Calédonie
    aType: 'organisation',
    aRef: 'Q18655787',
    bType: 'organisation',
    bRef: 'Q33788',
    typeLienCode: 'institutionnel',
    description:
      "La Province des Îles Loyauté est l'une des trois provinces constitutives de la NC.",
    dateDebut: new Date('1988-06-26'),
    dateFin: null,
    sourceRef: 'wp_nc',
  },

  // ── LIEN ÉCONOMIQUE : Eramet → SLN (filiale majoritaire) ─────────────────

  {
    // O-O : Eramet contrôle SLN via participation majoritaire
    aType: 'organisation',
    aRef: 'Q1347990',
    bType: 'organisation',
    bRef: 'Q16677178',
    typeLienCode: 'FILIALE',
    description:
      "Eramet est l'actionnaire majoritaire de la Société Le Nickel (SLN), " +
      "sa principale filiale en Nouvelle-Calédonie. " +
      "P749 (entreprise mère) = Q1347990 per Wikidata Q16677178.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_eramet',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-nc] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-nc] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
    )
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`[seed-nc] TypeLien introuvable : ${lien.typeLienCode}`)
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
  console.log('Suppression données Nouvelle-Calédonie précédentes...')
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
  console.log('\n── seed-nc — Nouvelle-Calédonie (corpus 2026-07-02) ──\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok  ${data.titre}`)
  }

  console.log('\nPersonnes —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ok  ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\nOrganisations —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ok  ${created.nom} (${o.wikidataId})`)
  }

  console.log('\nLiens —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok  ${lien.typeLienCode} — ${lien.description.slice(0, 72)}...`)
  }

  console.log('\n── Bilan ─────────────────────────────────────────────────────────────')
  console.log(`   Personnes     : ${PERSONNES.length} (Ponga, Mapou, Wamytan, Backès, Falaeo)`)
  console.log(
    `   Organisations : ${ORGANISATIONS.length} (6 institutions, 6 partis, 1 média, 3 entreprises nickel)`,
  )
  console.log(`   Sources       : ${Object.keys(SOURCES).length} (Wikipédia FR)`)
  console.log(
    `   Liens         : ${LIENS.length} (MANDAT_ELECTIF, ANCIEN_MANDAT, AFFILIATION_PARTI, politique, institutionnel, EMPLOI, FILIALE)`,
  )
  console.log('──────────────────────────────────────────────────────────────────────\n')
}

main()
  .catch((err) => {
    console.error('[seed-nc] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
