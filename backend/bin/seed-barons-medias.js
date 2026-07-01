/**
 * Seed Barons des médias — Rodolphe Saadé (CMA CGM + acquisitions médias)
 * et Vincent Bolloré (volet influence médiatique/idéologique, enquêtes presse).
 *
 * Périmètre :
 *   • Saadé : Rodolphe Saadé (PDG CMA CGM). Organisations : CMA CGM (armateur),
 *     CMA Média (holding médias), La Provence (89 %, août 2022),
 *     La Tribune (100 %, juil. 2023), BFM TV + RMC (100 %, juil. 2024, 1,55 Md€).
 *   • Bolloré — volet INFLUENCE UNIQUEMENT (capitalistique déjà dans seed-fortunes-2.js) :
 *     liens mediatique entre Vincent Bolloré (Q721491) et CNews (Q3083542) / Europe 1 (Q314407),
 *     documentés par les enquêtes d'Acrimed et du Monde diplomatique.
 *     ⚠ Ces entités Bolloré sont déjà des nœuds (seed-fortunes-2.js) — l'upsert les fusionnera ;
 *       les LIENS d'influence sont NOUVEAUX dans ce seed.
 *
 * Pré-requis : lancer seed-fortunes-2.js AVANT ce seed
 *   (Vincent Bolloré Q721491, CNews Q3083542, Europe 1 Q314407 doivent exister).
 *
 * Sources : Wikidata Q-ids vérifiés via Wikipedia FR (Special:EntityData ou infobox) :
 *   Q3438372 (Saadé), Q1023867 (CMA CGM), Q118869829 (CMA Média),
 *   Q1799045 (La Provence), Q1799197 (La Tribune), Q517444 (BFM TV), Q686375 (RMC).
 *   Presse : France Info, Acrimed, Le Monde diplomatique (PPA).
 *
 * Anti-diffamation :
 *   Toute caractérisation de ligne éditoriale est formulée EN ATTRIBUANT à sa source
 *   (Acrimed, Monde diplomatique), jamais comme un fait établi de l'éditeur.
 *   Présomption d'innocence Bolloré préservée (volet judiciaire dans seed-fortunes-2.js).
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-barons-medias.js
 *   cd backend && node bin/seed-barons-medias.js --reset
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const RESET = process.argv.includes("--reset")
const USER_EMAIL = "remi@reseauxinfluences.fr"

// ---------------------------------------------------------------------------
// PERSONNES — seule entité nouvelle : Rodolphe Saadé.
// Les personnages Bolloré (Vincent, Yannick) sont déjà dans seed-fortunes-2.js.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q3438372 (vérifié via Wikipedia FR "Rodolphe Saadé", infobox)
    //           + Wikipedia EN (date de naissance 3 mars 1970, lieu Beyrouth)
    //           + site officiel CMA CGM (cmacgm-group.com/governance/rodolphe-saade)
    // Rôle public attesté : PDG de CMA CGM depuis novembre 2017.
    nom: "Saadé",
    prenom: "Rodolphe",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1970-03-03"),
    lieuNaissance: "Beyrouth (Liban)",
    rolePrincipal: "Président-directeur général de CMA CGM",
    rolesSecondaires: [
      "armateur franco-libanais, PDG de CMA CGM depuis novembre 2017",
      "actionnaire principal de CMA Média (La Provence, La Tribune, BFM TV, RMC)",
      "fils de Jacques Saadé, fondateur de CMA CGM",
    ],
    bio:
      "Né le 3 mars 1970 à Beyrouth. Homme d'affaires franco-libanais, Rodolphe Saadé " +
      "a rejoint le groupe CMA CGM en 1994 et en est devenu PDG en novembre 2017, " +
      "succédant à son père. Il a engagé une diversification médiatique : La Provence " +
      "(août 2022), La Tribune (juillet 2023), BFM TV et RMC (juillet 2024, 1,55 Md€).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Rodolphe_Saad%C3%A9",
    wikidataId: "Q3438372",
    qualiteInfluence: "DIRIGEANT",
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — nouvelles dans ce seed.
// NE PAS redéfinir : Bolloré SE, Vivendi SE, Canal+ PLC, CNews, Europe 1,
// Louis Hachette Group, Havas NV, Prisma Media — déjà dans seed-fortunes-2.js.
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q1023867 (vérifié via Wikipedia FR "CMA CGM", infobox)
    //           + Wikipedia FR (SIREN 562 024 422, fondée 1996, siège Marseille)
    // Premier armateur français, 3e mondial. Fondé par Jacques Saadé.
    nom: "CMA CGM",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.cmacgm-group.com",
    description:
      "Premier armateur français et troisième mondial de transport de conteneurs. " +
      "Fondé à Marseille en 1996 par la fusion de la CMA (Compagnie Maritime d'Affrètement) " +
      "et de la CGM (Compagnie Générale Maritime). SIREN : 562 024 422. " +
      "Siège : Tour CMA CGM, Marseille. PDG : Rodolphe Saadé depuis novembre 2017.",
    dateCreation: new Date("1996-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/CMA_CGM",
    wikidataId: "Q1023867",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q118869829 (vérifié via Wikipedia FR "CMA Média", infobox)
    //           + Wikipedia FR (créée oct. 2022 ; anciens noms : CMA CGM Médias → Whynot Média)
    // Filiale médias à 100 % de CMA CGM. Présidente : Véronique Albertini-Saadé.
    nom: "CMA Média",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: null,
    description:
      "Filiale médias à 100 % du groupe CMA CGM, créée en octobre 2022. " +
      "Anciennement dénommée « CMA CGM Médias » puis « Whynot Média ». " +
      "Siège : Tour CMA CGM, Marseille. Présidente : Véronique Albertini-Saadé. " +
      "DG : Claire Léost (depuis août 2025). " +
      "Contrôle La Provence (89 %), La Tribune (100 %), BFM TV et RMC (100 %, juil. 2024).",
    dateCreation: new Date("2022-10-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/CMA_M%C3%A9dia",
    wikidataId: "Q118869829",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q1799045 (vérifié via Wikipedia FR "La Provence", infobox)
    //           + Wikipedia FR (fondée 4 juin 1997 ; CMA CGM acquiert 89 % le 30 août 2022)
    // Xavier Niel conserve 11 % du capital.
    nom: "La Provence",
    sigle: null,
    typeOrganisation: "MEDIA",
    pays: "France",
    siteWeb: "https://www.laprovence.com",
    description:
      "Quotidien régional français publié à Marseille, fondé le 4 juin 1997 " +
      "(par fusion du Méridional et du Provençal). Comprend aussi Corse-Matin. " +
      "CMA CGM (via CMA Média) en est actionnaire à 89 % depuis le 30 août 2022 ; " +
      "Xavier Niel conserve 11 %.",
    dateCreation: new Date("1997-06-04"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/La_Provence",
    wikidataId: "Q1799045",
    qualiteInfluence: "EDITEUR_PRESSE",
  },
  {
    // Sources : Wikidata Q1799197 (vérifié via Wikipedia FR "La Tribune (France, 1985)", infobox)
    //           + Wikipedia FR (rachat officialisé 27 juillet 2023 via CMA Média/Hima Group)
    nom: "La Tribune",
    sigle: null,
    typeOrganisation: "MEDIA",
    pays: "France",
    siteWeb: "https://www.latribune.fr",
    description:
      "Quotidien économique et financier français fondé le 15 janvier 1985. " +
      "Acquis par CMA Média (via la société Hima Group, détenue à 100 % par Rodolphe Saadé) " +
      "le 27 juillet 2023.",
    dateCreation: new Date("1985-01-15"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/La_Tribune_(France,_1985)",
    wikidataId: "Q1799197",
    qualiteInfluence: "EDITEUR_PRESSE",
  },
  {
    // Sources : Wikidata Q517444 (vérifié via Wikipedia FR "BFM TV", infobox)
    //           + Wikipedia FR (créée le 28 nov. 2005 ; rachat Altice Média finalisé 2 juil. 2024)
    // Chaîne intégrée à CMA Média dans le cadre du rachat d'Altice Média pour 1,55 Md€.
    nom: "BFM TV",
    sigle: null,
    typeOrganisation: "MEDIA",
    pays: "France",
    siteWeb: "https://www.bfmtv.com",
    description:
      "Chaîne d'information en continu française créée le 28 novembre 2005. " +
      "Appartenant au groupe Altice (Patrick Drahi) jusqu'en 2024. " +
      "Intégrée à CMA Média à l'issue du rachat d'Altice Média pour 1,55 milliard d'euros, " +
      "finalisé le 2 juillet 2024 (autorisation Arcom + Autorité de la concurrence).",
    dateCreation: new Date("2005-11-28"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/BFM_TV",
    wikidataId: "Q517444",
    qualiteInfluence: "EDITEUR_PRESSE",
  },
  {
    // Sources : Wikidata Q686375 (vérifié via wikidata.org/wiki/Q686375 + Wikipedia FR)
    //           + Wikipedia FR (reformatée « Info Talk Sport » en janvier 2001 ;
    //             rachat Altice Média finalisé 2 juil. 2024)
    nom: "RMC",
    sigle: null,
    typeOrganisation: "MEDIA",
    pays: "France",
    siteWeb: "https://rmc.bfmtv.com",
    description:
      "Station de radio d'information et de sport (Radio Monte-Carlo), créée en 1943, " +
      "reformatée « Info Talk Sport » en janvier 2001. " +
      "Intégrée à CMA Média à l'issue du rachat d'Altice Média pour 1,55 milliard d'euros, " +
      "finalisé le 2 juillet 2024.",
    dateCreation: new Date("1943-07-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Radio_Monte-Carlo",
    wikidataId: "Q686375",
    qualiteInfluence: "EDITEUR_PRESSE",
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-06-30).
// monde_diplo_ppa et acrimed_ppa sont déjà dans seed-fortunes-2.js ;
// upsertSource les retrouvera par URL sans créer de doublon.
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_saade: {
    url: "https://fr.wikipedia.org/wiki/Rodolphe_Saad%C3%A9",
    titre: "Rodolphe Saadé — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Né le 3 mars 1970 à Beyrouth. PDG de CMA CGM depuis nov. 2017. " +
      "Acquisitions médias : La Provence (août 2022), La Tribune (juil. 2023), " +
      "BFM TV et RMC (juil. 2024, 1,55 Md€). Q-id vérifié : Q3438372.",
    verifiee: true,
  },
  wp_cma_cgm: {
    url: "https://fr.wikipedia.org/wiki/CMA_CGM",
    titre: "CMA CGM — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Premier armateur français, 3e mondial. Fondé en 1996 (fusion CMA + CGM). " +
      "SIREN : 562 024 422. Siège : Marseille. PDG : Rodolphe Saadé.",
    verifiee: true,
  },
  wp_cma_media: {
    url: "https://fr.wikipedia.org/wiki/CMA_M%C3%A9dia",
    titre: "CMA Média — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Filiale médias de CMA CGM créée en oct. 2022. Anciens noms : CMA CGM Médias → " +
      "Whynot Média → CMA Média. Détient La Provence (89 %), La Tribune (100 %), " +
      "BFM TV et RMC (100 %).",
    verifiee: true,
  },
  wp_la_provence: {
    url: "https://fr.wikipedia.org/wiki/La_Provence",
    titre: "La Provence — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Quotidien régional marseillais fondé le 4 juin 1997. " +
      "CMA CGM acquiert 89 % du groupe le 30 août 2022 ; Xavier Niel conserve 11 %.",
    verifiee: true,
  },
  wp_la_tribune: {
    url: "https://fr.wikipedia.org/wiki/La_Tribune_(France,_1985)",
    titre: "La Tribune (France, 1985) — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Quotidien économique fondé le 15 janvier 1985. Acquis par CMA Média " +
      "(via Hima Group, 100 % Rodolphe Saadé) le 27 juillet 2023.",
    verifiee: true,
  },
  wp_bfmtv: {
    url: "https://fr.wikipedia.org/wiki/BFM_TV",
    titre: "BFM TV — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Chaîne d'information en continu créée le 28 nov. 2005. " +
      "Rachat d'Altice Média par CMA CGM finalisé le 2 juillet 2024.",
    verifiee: true,
  },
  wp_rmc: {
    url: "https://fr.wikipedia.org/wiki/Radio_Monte-Carlo",
    titre: "Radio Monte-Carlo (RMC) — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Station radio créée en 1943, reformatée « Info Talk Sport » en janvier 2001. " +
      "Rachat d'Altice Média par CMA CGM finalisé le 2 juillet 2024.",
    verifiee: true,
  },
  fi_rachat_altice: {
    // Titre et date vérifiés via recherche web (fetch retourné 403 — extrait non reproduit).
    // Recoupé par : Wikipedia FR (BFM TV, RMC), Journal du Net, telquel.ma.
    url: "https://www.franceinfo.fr/economie/medias/bfmtv-et-rmc-passent-officiellement-aux-mains-de-l-armateur-cma-cgm_6640443.html",
    titre: "BFMTV et RMC passent officiellement aux mains de l'armateur CMA CGM — France Info",
    media: "France Info",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2024-07-02"),
    dateConsultation: new Date("2026-06-30"),
    auteur: "Rédaction France Info",
    description:
      "Officialisation du rachat d'Altice Média (BFM TV, RMC, RMC Découverte, RMC Story) " +
      "par CMA CGM pour 1,55 milliard d'euros, le 2 juillet 2024.",
    verifiee: true,
  },
  acrimed_europe1_2024: {
    // Titre, date et auteurs vérifiés via fetch de l'URL Acrimed (HTTP 200).
    url: "https://www.acrimed.org/Europe-1-une-matinale-au-coeur-de-la-contre",
    titre: "Europe 1 : une matinale au cœur de la contre-révolution réactionnaire — Acrimed",
    media: "Acrimed",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2024-04-02"),
    dateConsultation: new Date("2026-06-30"),
    auteur: "Elvis Bruneaux et Pauline Perrenot",
    description:
      "Selon Acrimed, la matinale d'Europe 1 constitue « un condensé du prêt-à-penser " +
      "médiatique 2.0 » caractérisé par « un sacrifice systématique des opinions " +
      "et des représentants de la gauche ».",
    verifiee: true,
  },
  // Sources déjà dans seed-fortunes-2.js — upsertSource retrouve l'existante sans doublon.
  monde_diplo_ppa: {
    url: "https://www.monde-diplomatique.fr/cartes/PPA",
    titre: "Médias français : qui possède quoi — Le Monde diplomatique",
    media: "Le Monde diplomatique",
    typeMedia: "PRESSE_ECRITE",
    langue: "fr",
    paysMedia: "France",
    datePublication: null,
    dateConsultation: new Date("2026-06-30"),
    auteur: "Rédaction Le Monde diplomatique / Acrimed",
    description:
      "Carte interactive de la propriété des grands médias français. Documente la chaîne " +
      "Bolloré → Vivendi → Canal+ → CNews et Bolloré → LHG → Europe 1 / Prisma Media.",
    verifiee: true,
  },
  acrimed_ppa: {
    url: "https://www.acrimed.org/Medias-francais-qui-possede-quoi",
    titre: "Médias français : qui possède quoi ? — Acrimed",
    media: "Acrimed",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "France",
    datePublication: null,
    dateConsultation: new Date("2026-06-30"),
    auteur: "Rédaction Acrimed",
    description:
      "Guide des concentrations médiatiques françaises en partenariat avec Le Monde diplomatique. " +
      "Recense la chaîne Bolloré → CNews, Europe 1, Prisma Media via Vivendi et ses filiales.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002). Codes ADR-027 + codes référentiel seed.js.
// Volet Saadé : capitalistique (DIRIGEANT, FILIALE, ACTIONNAIRE_MAJORITAIRE).
// Volet Bolloré : influence médiatique/idéologique (mediatique) — entités déjà
//   présentes dans seed-fortunes-2.js, retrouvées via wikidataId.
// Direction aRef = détenteur/mère → bRef = détenu/filiale pour les liens capitalistiques.
// ---------------------------------------------------------------------------

const LIENS = [
  // =========================================================================
  // GROUPE CMA CGM / SAADÉ
  // =========================================================================
  {
    // P-O : Rodolphe Saadé — PDG de CMA CGM depuis novembre 2017
    aType: "personne",
    aRef: "Q3438372",
    bType: "organisation",
    bRef: "Q1023867",
    typeLienCode: "DIRIGEANT",
    description:
      "Rodolphe Saadé est président-directeur général de CMA CGM depuis novembre 2017, " +
      "succédant à son père Jacques Saadé, fondateur du groupe.",
    dateDebut: new Date("2017-11-01"),
    dateFin: null,
    sourceRef: "wp_saade",
  },
  {
    // O-O : CMA CGM → CMA Média (filiale à 100 % créée en octobre 2022)
    aType: "organisation",
    aRef: "Q1023867",
    bType: "organisation",
    bRef: "Q118869829",
    typeLienCode: "FILIALE",
    description:
      "CMA Média est une filiale à 100 % de CMA CGM, créée en octobre 2022 " +
      "pour porter les acquisitions médias du groupe (La Provence, La Tribune, BFM TV, RMC).",
    dateDebut: new Date("2022-10-01"),
    dateFin: null,
    sourceRef: "wp_cma_media",
  },
  {
    // O-O : CMA Média → La Provence (89 % du capital, depuis le 30 août 2022)
    // Xavier Niel conserve 11 %.
    aType: "organisation",
    aRef: "Q118869829",
    bType: "organisation",
    bRef: "Q1799045",
    typeLienCode: "ACTIONNAIRE_MAJORITAIRE",
    description:
      "CMA CGM (via CMA Média) acquiert 89 % des parts du groupe La Provence " +
      "le 30 août 2022 ; Xavier Niel conserve 11 %. Source : Wikipedia FR (La Provence).",
    dateDebut: new Date("2022-08-30"),
    dateFin: null,
    sourceRef: "wp_la_provence",
  },
  {
    // O-O : CMA Média → La Tribune (100 %, via société Hima Group, depuis le 27 juillet 2023)
    aType: "organisation",
    aRef: "Q118869829",
    bType: "organisation",
    bRef: "Q1799197",
    typeLienCode: "FILIALE",
    description:
      "CMA Média acquiert La Tribune à 100 % (via la société Hima Group, détenue par " +
      "Rodolphe Saadé) le 27 juillet 2023. Source : Wikipedia FR (La Tribune).",
    dateDebut: new Date("2023-07-27"),
    dateFin: null,
    sourceRef: "wp_la_tribune",
  },
  {
    // O-O : CMA Média → BFM TV (100 %, rachat Altice Média, finalisé 2 juillet 2024)
    aType: "organisation",
    aRef: "Q118869829",
    bType: "organisation",
    bRef: "Q517444",
    typeLienCode: "FILIALE",
    description:
      "BFM TV intègre le périmètre de CMA Média à l'issue du rachat d'Altice Média " +
      "(1,55 milliard d'euros), finalisé le 2 juillet 2024 après avis Arcom et " +
      "Autorité de la concurrence.",
    dateDebut: new Date("2024-07-02"),
    dateFin: null,
    sourceRef: "fi_rachat_altice",
  },
  {
    // O-O : CMA Média → RMC (100 %, même rachat Altice Média, finalisé 2 juillet 2024)
    aType: "organisation",
    aRef: "Q118869829",
    bType: "organisation",
    bRef: "Q686375",
    typeLienCode: "FILIALE",
    description:
      "RMC intègre le périmètre de CMA Média à l'issue du rachat d'Altice Média " +
      "(1,55 milliard d'euros), finalisé le 2 juillet 2024.",
    dateDebut: new Date("2024-07-02"),
    dateFin: null,
    sourceRef: "fi_rachat_altice",
  },

  // =========================================================================
  // VOLET BOLLORÉ — INFLUENCE MÉDIATIQUE/IDÉOLOGIQUE
  // Entités déjà dans seed-fortunes-2.js :
  //   Q721491 (Vincent Bolloré), Q3083542 (CNews), Q314407 (Europe 1).
  // Ces liens mediatique sont NOUVEAUX — les liens capitalistiques correspondants
  // (Bolloré SE → Canal+ PLC → CNews ; Bolloré SE → LHG → Europe 1) sont déjà
  // dans seed-fortunes-2.js et ne sont pas dupliqués ici.
  //
  // ⚠ Anti-diffamation OBLIGATOIRE :
  //   Toute caractérisation de ligne éditoriale est attribuée à Acrimed et/ou au
  //   Monde diplomatique. Présomption d'innocence préservée (mise en examen 2018,
  //   procès fixé déc. 2026, AUCUNE condamnation définitive — cf. seed-fortunes-2.js).
  // =========================================================================
  {
    // P-O : Vincent Bolloré → CNews
    // Influence médiatique documentée par le Monde diplomatique (PPA) et Acrimed,
    // qui décrivent la ligne éditoriale de la chaîne depuis son entrée dans le
    // périmètre Bolloré/Canal+.
    // NB : Bolloré a quitté toutes fonctions de gouvernance le 17 fév. 2022 ;
    //      depuis la scission Vivendi (déc. 2024), CNews est dans le périmètre
    //      Canal+ PLC dont Bolloré SE détient 30,4 %.
    aType: "personne",
    aRef: "Q721491",
    bType: "organisation",
    bRef: "Q3083542",
    typeLienCode: "mediatique",
    description:
      "Selon la carte des médias du Monde diplomatique et d'Acrimed, CNews — filiale " +
      "de Canal+ PLC dans le périmètre Bolloré — est décrite par ces médias comme " +
      "une chaîne ayant adopté, depuis l'entrée du groupe dans son actionnariat, " +
      "une orientation éditoriale que ces sources qualifient de proche de la droite radicale.",
    dateDebut: new Date("2017-01-01"),
    dateFin: null,
    sourceRef: "monde_diplo_ppa",
  },
  {
    // P-O : Vincent Bolloré → Europe 1
    // Influence éditoriale documentée par Acrimed (Elvis Bruneaux et Pauline Perrenot,
    // 2 avril 2024). Europe 1 appartient à Lagardère News / Louis Hachette Group
    // (Bolloré SE détient 30,4 % de LHG depuis la scission Vivendi de déc. 2024).
    aType: "personne",
    aRef: "Q721491",
    bType: "organisation",
    bRef: "Q314407",
    typeLienCode: "mediatique",
    description:
      "Selon une enquête d'Acrimed (Bruneaux et Perrenot, 2 avr. 2024), la matinale " +
      "d'Europe 1 — dans le périmètre Bolloré via Louis Hachette Group — est qualifiée " +
      "par Acrimed de « condensé du prêt-à-penser médiatique 2.0 » avec « un sacrifice " +
      "systématique des opinions et des représentants de la gauche ».",
    dateDebut: new Date("2021-01-01"),
    dateFin: null,
    sourceRef: "acrimed_europe1_2024",
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-fortunes-2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-barons-medias] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

async function upsertPersonne(data, userId) {
  const existing = await prisma.personne.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.personne.update({
      where: { id: existing.id },
      data: { ...data, statut: "EN_ATTENTE" },
    })
  }
  return prisma.personne.create({ data: { ...data, statut: "EN_ATTENTE", creeParId: userId } })
}

async function upsertOrganisation(data, userId) {
  const existing = data.wikidataId
    ? await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
    : await prisma.organisation.findFirst({ where: { nom: data.nom } })
  if (existing) {
    return prisma.organisation.update({
      where: { id: existing.id },
      data: { ...data, statut: "EN_ATTENTE" },
    })
  }
  return prisma.organisation.create({ data: { ...data, statut: "EN_ATTENTE", creeParId: userId } })
}

async function upsertSource(key) {
  const data = SOURCES[key]
  const existing = await prisma.source.findFirst({ where: { url: data.url } })
  if (existing) return existing
  return prisma.source.create({ data })
}

/**
 * Résout une entité par wikidataId (personne ou organisation).
 * Les entités Bolloré (Q721491, Q3083542, Q314407) doivent préexister
 * (créées par seed-fortunes-2.js).
 */
async function trouverEntite(type, ref) {
  if (type === "personne") {
    return prisma.personne.findFirst({ where: { wikidataId: ref } })
  }
  if (type === "organisation") {
    return prisma.organisation.findFirst({ where: { wikidataId: ref } })
  }
  throw new Error(`Type entité non supporté ici : ${type}`)
}

function fkPourEntite(type, entite, position) {
  const suffix = position === "A" ? "AId" : "BId"
  if (type === "personne") return { [`personne${suffix}`]: entite.id }
  if (type === "organisation") return { [`organisation${suffix}`]: entite.id }
  if (type === "siteWeb") return { [`siteWeb${suffix}`]: entite.id }
  throw new Error(`Type inconnu : ${type}`)
}

async function creerLien(lien, sourcesMap, userId) {
  const entiteA = await trouverEntite(lien.aType, lien.aRef)
  const entiteB = await trouverEntite(lien.bType, lien.bRef)
  if (!entiteA || !entiteB) {
    throw new Error(
      `[seed-barons-medias] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef}, bRef=${lien.bRef}). ` +
        `Vérifier que seed-fortunes-2.js a été lancé (entités Bolloré requises).`,
    )
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`TypeLien introuvable : ${lien.typeLienCode}`)
  }

  const fkA = fkPourEntite(lien.aType, entiteA, "A")
  const fkB = fkPourEntite(lien.bType, entiteB, "B")

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
        statut: "EN_ATTENTE",
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
      statut: "EN_ATTENTE",
      estBidirectionnel: false,
      intensite: 1,
      sourceId: source?.id ?? null,
      creeParId: userId,
    },
  })
}

async function reset() {
  console.log("Suppression données barons-medias précédentes...")
  // Seules les entités NOUVELLES de ce seed sont supprimées.
  // Les entités Bolloré (seed-fortunes-2.js) ne sont PAS touchées par le reset.
  const wikidataIdsP = PERSONNES.map((p) => p.wikidataId)
  const wikidataIdsO = ORGANISATIONS.filter((o) => o.wikidataId).map((o) => o.wikidataId)

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
  console.log("Données précédentes supprimées.\n")
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(
    "\n-- seed-barons-medias — Saadé/CMA CGM (acquisitions médias) + Bolloré (influence) --\n",
  )
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log("— Sources publiques —")
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok ${data.titre}`)
  }

  console.log("\n— Personnes (Wikidata) —")
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ok ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log("\n— Organisations (Wikidata) —")
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ok ${created.nom} (${o.wikidataId})`)
  }

  console.log("\n— Liens —")
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log("\n-- Bilan --")
  console.log(`Personnes      : ${PERSONNES.length} (Rodolphe Saadé — Q3438372)`)
  console.log(
    `Organisations  : ${ORGANISATIONS.length} (CMA CGM, CMA Média, La Provence, La Tribune, BFM TV, RMC)`,
  )
  console.log(
    `Sources        : ${Object.keys(SOURCES).length} (Wikipédia FR ×7, France Info, Acrimed ×2, Monde diplomatique PPA)`,
  )
  console.log(
    `Liens          : ${LIENS.length} (DIRIGEANT ×1, FILIALE ×4, ACTIONNAIRE_MAJORITAIRE ×1, mediatique ×2)`,
  )
  console.log("")
  console.log("Q-ids vérifiés via Wikipedia FR :")
  console.log("  Personnes    : Q3438372 (Rodolphe Saadé)")
  console.log("  Orgas        : Q1023867 (CMA CGM), Q118869829 (CMA Média),")
  console.log("                 Q1799045 (La Provence), Q1799197 (La Tribune),")
  console.log("                 Q517444 (BFM TV), Q686375 (RMC)")
  console.log("Nœuds Bolloré réutilisés (seed-fortunes-2.js, non recréés) :")
  console.log("  Q721491 (Vincent Bolloré), Q3083542 (CNews), Q314407 (Europe 1)")
  console.log("Sociétés sans Q-id confirmé : aucune")
  console.log("Exclusions : Brut (acquisition sept. 2025 — à vérifier Q-id), RMC Sport,")
  console.log("  M6 (participation minoritaire — % non sourcé précisément à cette date)")
  console.log("Formulations sensibles Bolloré : attribuées à Acrimed (2024-04-02)")
  console.log("  et au Monde diplomatique (PPA) — jamais formulées comme faits établis")
  console.log("")
  console.log("⚠ Pré-requis : seed-fortunes-2.js doit avoir été lancé avant ce seed.")
  console.log("  (entités Bolloré requises pour les 2 liens mediatique)")
  console.log("")
}

main()
  .catch((err) => {
    console.error("[seed-barons-medias] Echec :", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
