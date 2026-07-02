/**
 * Seed influenceurs — créateurs français top-tier + volet judiciaire documenté.
 * Enquête OSINT journalistique du 2026-07-02 — sources publiques uniquement.
 *
 * Périmètre :
 *   • Créateurs top-tier (> ~1 M abonnés, notoriété médiatique avérée, Q-id vérifié
 *     via wbsearchentities/Special:EntityData) :
 *     Squeezie, Cyprien, Norman Thavaud, Léna Mahfouf (Léna Situations),
 *     Tibo InShape, Inoxtag, Mister V.
 *   • Volet judiciaire documenté :
 *     Nabilla Benattia (sanction DGCCRF 2021, condamnation 2015),
 *     Magali Berdah (condamnée 2019 — décision définitive).
 *
 * Exclusions explicites (Q-id Wikidata non confirmé à la date de consultation) :
 *   ⚠ McFly (Marie-Alexis Colin) : Q-id non confirmé → exclu.
 *   ⚠ Carlito (Guillaume Tordjman) : Q-id non confirmé → exclu.
 *   ⚠ Michou : Q-id non confirmé → exclu.
 *   ⚠ Marc Blata / Nadé Blata : Q-id non confirmé → exclus.
 *   ⚠ Membres privés de l'entourage : hors périmètre, personnes privées (ADR-006).
 *
 * Volet judiciaire — présomption d'innocence OBLIGATOIRE :
 *   Nabilla Benattia :
 *     — Condamnée le 19 mai 2015 pour violences volontaires aggravées (affaire Thomas
 *       Vergara) : 6 mois ferme (purgés en détention provisoire) + 18 mois sursis +
 *       2 ans de mise à l'épreuve. DÉCISION DÉFINITIVE.
 *     — Sanctionnée administrativement en juillet 2021 par la DGCCRF (amende 20 000 €)
 *       pour pratiques commerciales trompeuses : publication d'une story Snapchat en 2018
 *       faisant la promotion d'un service de placements financiers sans mention « #publicité ».
 *       SANCTION ADMINISTRATIVE DÉFINITIVE.
 *   Magali Berdah :
 *     — Condamnée en 2019 par le tribunal correctionnel pour abus de faiblesse et
 *       blanchiment d'argent (victime : retraité de 96 ans, 221 556 € versés) :
 *       1 an d'emprisonnement avec sursis + interdiction de gérer une société pendant 5 ans.
 *       DÉCISION DÉFINITIVE.
 *     — Acquittée en novembre 2024 par le tribunal correctionnel de Nice des poursuites
 *       pour banqueroute frauduleuse (société BA & CO, 2014-2015). DÉCISION DÉFINITIVE.
 *   Norman Thavaud :
 *     — Accusations de harcèlement sexuel, viol et corruption de mineurs depuis 2018.
 *       Placé en garde à vue par le parquet de Paris en décembre 2022.
 *       Enquête préliminaire classée sans suite en octobre 2023
 *       (infractions insuffisamment caractérisées).
 *       Plaintes avec constitution de partie civile déposées par les avocats des plaignantes
 *       en octobre 2023 — statut judiciaire ultérieur non établi à la date de consultation.
 *       PRÉSUMÉ INNOCENT.
 *
 * Sources : Wikidata (Q-ids vérifiés via wbsearchentities, 2026-07-02),
 *           Wikipédia FR, France Info, DGCCRF.
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId ; organisations sans Q-id : upsert par nom)
 *
 * Usage :
 *   cd backend && node bin/seed-influenceurs.js
 *   cd backend && node bin/seed-influenceurs.js --reset
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const RESET = process.argv.includes("--reset")
const USER_EMAIL = "remi@reseauxinfluences.fr"

// ---------------------------------------------------------------------------
// PERSONNES — chaque fiche recoupée par ≥ 2 sources publiques (cf. commentaires).
// ---------------------------------------------------------------------------

const PERSONNES = [
  // =========================================================================
  // TOP-TIER — créateurs sans volet judiciaire commercial spécifique
  // =========================================================================

  {
    // Sources : Wikidata Q20971386 (vérifié wbsearchentities, "French vlogger",
    //           85 statements, 12 sitelinks) + Wikipédia FR (Squeezie)
    nom: "Hauchard",
    prenom: "Lucas",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1996-01-27"),
    lieuNaissance: null,
    rolePrincipal: "Créateur de contenu YouTube et Twitch (Squeezie)",
    rolesSecondaires: [
      "co-fondateur de Gentle Mates (organisation esport, 2023)",
      "co-fondateur de Ciao (marque de boissons, 2025)",
      "organisateur du GP Explorer (course Formule 4 créateurs, 2022-2025)",
    ],
    bio:
      "Pseudonyme Squeezie. Né le 27 janvier 1996. Lancé sur YouTube en janvier 2011, " +
      "il a été le YouTubeur francophone le plus suivi pendant près de 5 ans (20,1 M " +
      "d'abonnés en 2024), dépassé par Tibo InShape en mai 2024. A organisé le GP Explorer " +
      "(record d'audience Twitch francophone). Co-fondateur de Gentle Mates (janv. 2023) " +
      "et de la marque de boissons Ciao (2025) avec Léna Situations et Inoxtag.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Squeezie",
    wikidataId: "Q20971386",
    qualiteInfluence: "ARTISTE",
  },

  {
    // Sources : Wikidata Q3008879 (vérifié wbsearchentities, "French comedian and YouTuber",
    //           né 1989-05-12, 77 statements, 13 sitelinks) + Wikipédia FR (Cyprien Iov)
    nom: "Iov",
    prenom: "Cyprien",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1989-05-12"),
    lieuNaissance: "Nice (Alpes-Maritimes)",
    rolePrincipal: "Créateur de contenu YouTube (Cyprien)",
    rolesSecondaires: [
      "comédien, acteur et scénariste",
      "auteur de bandes dessinées",
      "ex-YouTubeur francophone le plus abonné (2013-2020)",
    ],
    bio:
      "Né le 12 mai 1989 à Nice. Pionnier du YouTube francophone, il a été le créateur " +
      "français le plus abonné de 2013 à 2020, notamment grâce à ses sketches humoristiques " +
      "courts. Diversifié dans la bande dessinée, le cinéma et l'écriture. " +
      "14,6 M d'abonnés YouTube en juillet 2025, 3ᵉ YouTubeur francophone.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Cyprien_Iov",
    wikidataId: "Q3008879",
    qualiteInfluence: "ARTISTE",
  },

  {
    // Sources : Wikidata Q3343832 (vérifié wbsearchentities, "French comedian and YouTuber",
    //           60 statements, 14 sitelinks) + Wikipédia FR (Norman Thavaud)
    //
    // ⚠ VOLET JUDICIAIRE (présomption d'innocence — statut procédural exact) :
    //   Plusieurs plaignantes accusent Norman Thavaud de harcèlement sexuel, viol et
    //   corruption de mineurs depuis 2018. Il est placé en garde à vue par le parquet
    //   de Paris en décembre 2022. Le parquet classe sans suite l'enquête préliminaire
    //   en octobre 2023 (infractions insuffisamment caractérisées). Les avocats des
    //   plaignantes déposent des plaintes avec constitution de partie civile en octobre 2023.
    //   Le statut judiciaire au-delà d'octobre 2023 n'est pas établi à la date de consultation
    //   (2026-07-02). PRÉSUMÉ INNOCENT.
    nom: "Thavaud",
    prenom: "Norman",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1987-04-14"),
    lieuNaissance: "Arras (Pas-de-Calais)",
    rolePrincipal: "Créateur de contenu YouTube (Norman fait des vidéos)",
    rolesSecondaires: [
      "comédien et humoriste web",
    ],
    bio:
      "Né le 14 avril 1987 à Arras. Pionnier du YouTube francophone avec « Norman fait des " +
      "vidéos » depuis 2010 (11,2 M d'abonnés, 4ᵉ YouTubeur francophone au 30 juin 2026). " +
      "Objet de plaintes pour harcèlement sexuel, viol et corruption de mineurs depuis 2018. " +
      "Placé en garde à vue en déc. 2022 ; enquête préliminaire classée sans suite par le " +
      "parquet de Paris en oct. 2023 (infractions insuffisamment caractérisées). " +
      "Plaintes avec constitution de partie civile déposées oct. 2023 — présumé innocent.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Norman_Thavaud",
    wikidataId: "Q3343832",
    qualiteInfluence: "ARTISTE",
  },

  {
    // Sources : Wikidata Q93549102 (vérifié wbsearchentities, "French vlogger and Internet
    //           influencer", 69 statements, 7 sitelinks) + Wikipédia FR (Léna Mahfouf)
    nom: "Mahfouf",
    prenom: "Léna",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1997-11-19"),
    lieuNaissance: null,
    rolePrincipal: "Créatrice de contenu et entrepreneuse (Léna Situations)",
    rolesSecondaires: [
      "fondatrice de la marque Hôtel Mahfouf (juin 2022)",
      "co-fondatrice de Ciao (marque de boissons, 2025)",
      "autrice (Toujours Plus, 2020 — 370 000 ex. vendus)",
      "première influenceuse française invitée au Met Gala (mai 2022)",
    ],
    bio:
      "Pseudonyme Léna Situations. Née le 19 novembre 1997. Influenceuse et entrepreneuse " +
      "franco-algérienne spécialisée dans la mode et le lifestyle. Première influenceuse " +
      "française invitée au Met Gala (2 mai 2022). Fondatrice de la marque Hôtel Mahfouf " +
      "(juin 2022). Autrice du livre Toujours Plus (2020, 370 000 exemplaires vendus). " +
      "Co-fondatrice de la marque de boissons Ciao avec Squeezie et Inoxtag (2025). " +
      "4,8 M d'abonnés Instagram (avr. 2025).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/L%C3%A9na_Mahfouf",
    wikidataId: "Q93549102",
    qualiteInfluence: "ARTISTE",
  },

  {
    // Sources : Wikidata Q31969862 (vérifié wbsearchentities, "French vlogger",
    //           59 statements, 5 sitelinks) + Wikipédia FR (Tibo InShape)
    nom: "Delapart",
    prenom: "Thibaud",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1992-01-19"),
    lieuNaissance: "Toulouse (Haute-Garonne)",
    rolePrincipal: "Créateur de contenu YouTube (Tibo InShape)",
    rolesSecondaires: [
      "1ᵉʳ YouTubeur francophone depuis mai 2024 (26,9 M abonnés)",
      "fondateur de ShapeYou (marque fitness)",
    ],
    bio:
      "Pseudonyme Tibo InShape. Né le 19 janvier 1992 à Toulouse. Lancé en novembre 2013 " +
      "avec du contenu fitness et musculation, il est devenu le YouTubeur francophone le " +
      "plus suivi le 26 mai 2024 en dépassant Squeezie (26,9 M d'abonnés en mai 2026). " +
      "Fondateur de la marque ShapeYou. Marié à Justine Becattini (Juju Fitcats) le 17 mai 2025.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Tibo_InShape",
    wikidataId: "Q31969862",
    qualiteInfluence: "ARTISTE",
  },

  {
    // Sources : Wikidata Q108732480 (vérifié wbsearchentities, "French-Algerian livestreamer
    //           and vlogger", 45 statements, 5 sitelinks, màj 27 avr. 2026)
    //           + Wikipédia FR (Inoxtag)
    nom: "Benazzouz",
    prenom: "Inès",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("2002-02-02"),
    lieuNaissance: "Levallois-Perret (Hauts-de-Seine)",
    rolePrincipal: "Créateur de contenu YouTube et Twitch (Inoxtag)",
    rolesSecondaires: [
      "rappeur et mangaka (manga Instinct, 2024)",
      "co-fondateur de Ciao (marque de boissons, 2025)",
      "documentariste (Kaizen — Expédition Everest 2024, Disney+)",
    ],
    bio:
      "Pseudonyme Inoxtag. Né le 2 février 2002 à Levallois-Perret. Créateur franco-algérien " +
      "sur YouTube (9,4 M d'abonnés) et Twitch. Connu pour le gaming (Minecraft, Fortnite) " +
      "puis pour le documentaire Kaizen retraçant son expédition de l'Everest (2024, " +
      "~340 000 entrées en salle, puis Disney+). Rappeur et auteur du manga Instinct (2024). " +
      "Co-fondateur de la marque de boissons Ciao avec Squeezie et Léna Situations (2025).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Inoxtag",
    wikidataId: "Q108732480",
    qualiteInfluence: "ARTISTE",
  },

  {
    // Sources : Wikidata Q23816443 (vérifié wbsearchentities, "French YouTuber and rapper",
    //           76 statements, màj 20 mai 2026) + Wikipédia FR (Mister V)
    nom: "Letexier",
    prenom: "Yvick",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1993-08-14"),
    lieuNaissance: "Grenoble (Isère)",
    rolePrincipal: "Créateur de contenu YouTube et rappeur (Mister V)",
    rolesSecondaires: [
      "comédien et humoriste web",
      "acteur",
    ],
    bio:
      "Pseudonyme Mister V. Né le 14 août 1993 à Grenoble. Pionnier de la première " +
      "génération de comédiens internet français, actif depuis 2008. " +
      "6,46 M d'abonnés YouTube (fév. 2026). Rappeur : albums Double V (2017, #1 et " +
      "certifié platine) et MVP (2020, platine). A lancé la gamme Pizza Delamama (2022). " +
      "Engagé dans des actions caritatives (Banque Alimentaire de l'Isère).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Mister_V_(youtubeur)",
    wikidataId: "Q23816443",
    qualiteInfluence: "ARTISTE",
  },

  // =========================================================================
  // VOLET JUDICIAIRE DOCUMENTÉ
  // =========================================================================

  {
    // Sources : Wikidata Q10872855 (vérifié wbsearchentities,
    //           "French-Swiss-Algerian model and TV personality",
    //           55 statements, 12 sitelinks, màj 29 juin 2026)
    //           + Wikipédia FR (Nabilla Benattia)
    //
    // ⚠ VOLET JUDICIAIRE (décisions définitives — statut procédural exact) :
    //   1. Condamnée le 19 mai 2015 par le tribunal correctionnel de Lyon pour violences
    //      volontaires aggravées (affaire Thomas Vergara, blessures au thorax en nov. 2014) :
    //      6 mois d'emprisonnement ferme (purgés en détention provisoire)
    //      + 18 mois sursis + 2 ans de mise à l'épreuve. CONDAMNATION DÉFINITIVE.
    //   2. Sanctionnée administrativement en juillet 2021 par la DGCCRF (Direction générale
    //      de la concurrence, de la consommation et de la répression des fraudes) :
    //      amende de 20 000 € pour pratiques commerciales trompeuses — promotion non déclarée
    //      d'un service de placements financiers sur Snapchat en 2018 (absence de mention
    //      « #publicité » ou équivalent). SANCTION ADMINISTRATIVE DÉFINITIVE.
    nom: "Benattia",
    prenom: "Nabilla",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1992-02-05"),
    lieuNaissance: "Ambilly (Haute-Savoie)",
    rolePrincipal: "Personnalité de télé-réalité et influenceuse (Nabilla)",
    rolesSecondaires: [
      "animatrice (Amazon Prime Video : Love Island France, Cosmic Love)",
      "mannequin",
    ],
    bio:
      "Née le 5 février 1992 à Ambilly. Personnalité de télé-réalité devenue influenceuse " +
      "et animatrice, rendue célèbre en 2013 par la phrase virale « Allô ! Non mais allô quoi ! ». " +
      "Condamnée en mai 2015 pour violences volontaires aggravées (6 mois ferme + 18 mois " +
      "sursis — décision définitive). Sanctionnée par la DGCCRF en juillet 2021 (amende " +
      "20 000 €) pour promotion non déclarée d'un service financier sur Snapchat en 2018 " +
      "(pratiques commerciales trompeuses — sanction administrative définitive).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Nabilla_Benattia",
    wikidataId: "Q10872855",
    qualiteInfluence: "ARTISTE",
  },

  {
    // Sources : Wikidata Q88772206 (vérifié wbsearchentities,
    //           "French businesswoman specialising in branded integration deal",
    //           28 statements, 2 sitelinks, màj 19 juin 2026)
    //           + Wikipédia FR (Magali Berdah)
    //
    // ⚠ VOLET JUDICIAIRE (décisions définitives) :
    //   1. Condamnée en 2019 par le tribunal correctionnel pour abus de faiblesse
    //      et blanchiment d'argent (victime : un retraité de 96 ans qui avait versé
    //      221 556 € sur 6 mois) : 1 an d'emprisonnement avec sursis + interdiction de
    //      gérer une société pendant 5 ans. CONDAMNATION DÉFINITIVE.
    //   2. Placée en garde à vue en septembre 2023 pour suspicion de banqueroute
    //      frauduleuse et infractions financières (société BA & CO, 2014-2015,
    //      2,5 M€ de passif) ; acquittée par le tribunal correctionnel de Nice
    //      en novembre 2024. DÉCISION DÉFINITIVE D'ACQUITTEMENT.
    nom: "Berdah",
    prenom: "Magali",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1981-11-26"),
    lieuNaissance: "Lyon (Rhône)",
    rolePrincipal: "Agente et entrepreneuse, fondatrice de Shauna Events",
    rolesSecondaires: [
      "chroniqueuse TV (TPMP, C8)",
      "ex-PDG de Shauna Events (interdite de gérer depuis 2019)",
    ],
    bio:
      "Née Magali Liévois le 26 novembre 1981 à Lyon. Fondatrice de l'agence de marketing " +
      "d'influence Shauna Events (janvier 2017), spécialisée dans le placement de produits " +
      "pour influenceurs issus de la télé-réalité (CA estimé ~40 M€ en 2020). " +
      "Condamnée en 2019 pour abus de faiblesse et blanchiment (1 an sursis + interdiction " +
      "de gérer 5 ans — décision définitive). Acquittée en novembre 2024 " +
      "des poursuites pour banqueroute frauduleuse (affaire BA & CO).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Magali_Berdah",
    wikidataId: "Q88772206",
    qualiteInfluence: "DIRIGEANT",
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — entreprises fondées par les créateurs, sourcées et déclarées.
// Toutes sans Q-id Wikidata confirmé à la date de consultation : upsert par nom.
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikipédia FR (Gentle Mates) + communiqué officiel avr. 2023
    // ⚠ Q-id Wikidata non confirmé (2026-07-02) → upsert par nom.
    nom: "Gentle Mates",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.gentlemates.com",
    description:
      "Organisation esportive française créée le 2 janvier 2023 sous le nom SBG, " +
      "annoncée officiellement sous le nom Gentle Mates le 13 avril 2023. " +
      "Co-fondée par Squeezie (Lucas Hauchard), Gotaga (Corentin Houssein) " +
      "et Brawks (Kevin Georges). Active en Valorant, Rocket League, Fortnite, " +
      "CoD et Age of Empires IV. " +
      "⚠ Q-id Wikidata non confirmé à la date de consultation — à vérifier manuellement.",
    dateCreation: new Date("2023-01-02"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Gentle_Mates",
    wikidataId: null,
    qualiteInfluence: "AUTRE",
  },
  {
    // Source : Wikipédia FR (Léna Mahfouf — « Founded the clothing and lifestyle brand
    //   Hôtel Mahfouf in June 2022 »)
    // ⚠ Q-id Wikidata non confirmé (2026-07-02) → upsert par nom.
    nom: "Hôtel Mahfouf",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.hotelmahfouf.fr",
    description:
      "Marque de mode et de lifestyle fondée par Léna Mahfouf (Léna Situations) en juin 2022. " +
      "⚠ Q-id Wikidata non confirmé à la date de consultation — à vérifier manuellement.",
    dateCreation: new Date("2022-06-01"),
    wikipediaUrl: null,
    wikidataId: null,
    qualiteInfluence: "AUTRE",
  },
  {
    // Source : Wikipédia FR (Squeezie — « Ciao : Beverage brand launching kombucha and
    //   energy drinks (2025-2026), with co-ownership by Léna Situations and Inoxtag »)
    // ⚠ Q-id Wikidata non confirmé (2026-07-02) → upsert par nom.
    nom: "Ciao",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: null,
    description:
      "Marque de boissons (kombucha et boissons énergétiques) co-fondée en 2025 par " +
      "Squeezie (Lucas Hauchard), Léna Situations (Léna Mahfouf) et Inoxtag (Inès Benazzouz). " +
      "⚠ Q-id Wikidata non confirmé à la date de consultation — à vérifier manuellement.",
    dateCreation: new Date("2025-01-01"),
    wikipediaUrl: null,
    wikidataId: null,
    qualiteInfluence: "AUTRE",
  },
  {
    // Source : Wikipédia FR (Magali Berdah)
    // ⚠ Q-id Wikidata non confirmé (2026-07-02) → upsert par nom.
    nom: "Shauna Events",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.shaunaevents.com",
    description:
      "Agence de marketing d'influence fondée par Magali Berdah en janvier 2017, " +
      "spécialisée dans le placement de produits pour des influenceurs issus de la " +
      "télé-réalité française. CA estimé à ~40 M€ en 2020. Banijay a pris 50 % du " +
      "capital pour 3 M€ avant de se retirer fin 2022 (Magali Berdah retrouve la pleine " +
      "propriété). Magali Berdah est interdite de gérer la société depuis sa condamnation " +
      "de 2019 (5 ans d'interdiction de gérer). " +
      "⚠ Q-id Wikidata non confirmé à la date de consultation — à vérifier manuellement.",
    dateCreation: new Date("2017-01-01"),
    wikipediaUrl: null,
    wikidataId: null,
    qualiteInfluence: "AUTRE",
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_squeezie: {
    url: "https://fr.wikipedia.org/wiki/Squeezie",
    titre: "Squeezie — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Lucas Hauchard, né le 27 janv. 1996. 20,1 M abonnés YT. " +
      "Co-fondateur de Gentle Mates (janv. 2023) et Ciao (2025). " +
      "Organisateur du GP Explorer (record Twitch FR).",
    verifiee: true,
  },
  wp_cyprien: {
    url: "https://fr.wikipedia.org/wiki/Cyprien_Iov",
    titre: "Cyprien Iov — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 12 mai 1989 à Nice. 14,6 M abonnés YT (juill. 2025). " +
      "Pionnier YT francophone, #1 YouTubeur FR 2013-2020.",
    verifiee: true,
  },
  wp_norman: {
    url: "https://fr.wikipedia.org/wiki/Norman_Thavaud",
    titre: "Norman Thavaud — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 14 avr. 1987 à Arras. 11,2 M abonnés. Garde à vue déc. 2022 (plaintes harcèlement " +
      "sexuel, viol, corruption de mineurs). Enquête classée sans suite oct. 2023 " +
      "(infractions insuffisamment caractérisées). Plainte partie civile oct. 2023. Présumé innocent.",
    verifiee: true,
  },
  wp_lena_situations: {
    url: "https://fr.wikipedia.org/wiki/L%C3%A9na_Mahfouf",
    titre: "Léna Mahfouf — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Née le 19 nov. 1997. Influenceuse lifestyle franco-algérienne. " +
      "1ère Française au Met Gala (mai 2022). Fondatrice Hôtel Mahfouf (juin 2022). " +
      "Co-fondatrice Ciao (2025). Livre Toujours Plus (2020, 370 000 ex.).",
    verifiee: true,
  },
  wp_tibo_inshape: {
    url: "https://fr.wikipedia.org/wiki/Tibo_InShape",
    titre: "Tibo InShape — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Thibaud Delapart, né le 19 janv. 1992 à Toulouse. 26,9 M abonnés YT (mai 2026). " +
      "#1 YouTubeur francophone depuis le 26 mai 2024.",
    verifiee: true,
  },
  wp_inoxtag: {
    url: "https://fr.wikipedia.org/wiki/Inoxtag",
    titre: "Inoxtag — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Inès Dany Benazzouz, né le 2 fév. 2002 à Levallois-Perret. 9,4 M abonnés YT. " +
      "Documentaire Kaizen (Everest 2024, ~340 000 entrées, puis Disney+). " +
      "Co-fondateur Ciao (2025).",
    verifiee: true,
  },
  wp_mister_v: {
    url: "https://fr.wikipedia.org/wiki/Mister_V_(youtubeur)",
    titre: "Mister V (youtubeur) — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Yvick Letexier, né le 14 août 1993 à Grenoble. 6,46 M abonnés YT (fév. 2026). " +
      "Rappeur (Double V, 2017, platine ; MVP, 2020, platine). Pizza Delamama (2022).",
    verifiee: true,
  },
  wp_nabilla: {
    url: "https://fr.wikipedia.org/wiki/Nabilla_Benattia",
    titre: "Nabilla Benattia — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Née le 5 fév. 1992 à Ambilly. Condamnée mai 2015 violences volontaires aggravées. " +
      "Amende DGCCRF 20 000 € (juill. 2021) pour promotion non déclarée Snapchat 2018. " +
      "Animatrice Amazon Prime Video depuis 2020.",
    verifiee: true,
  },
  wp_magali_berdah: {
    url: "https://fr.wikipedia.org/wiki/Magali_Berdah",
    titre: "Magali Berdah — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Née le 26 nov. 1981 à Lyon. Fondatrice Shauna Events (janv. 2017). " +
      "Condamnée 2019 (abus de faiblesse + blanchiment, 1 an sursis, interdiction gérer 5 ans). " +
      "Acquittée nov. 2024 (banqueroute frauduleuse).",
    verifiee: true,
  },
  wp_gentle_mates: {
    url: "https://fr.wikipedia.org/wiki/Gentle_Mates",
    titre: "Gentle Mates — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Organisation esportive française fondée le 2 janv. 2023 par Squeezie, Gotaga et Brawks. " +
      "Active en Valorant, Rocket League, Fortnite, CoD.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — fondations de sociétés déclarées et sourcées.
// Lien polymorphe ADR-002 — exactement 1 entité non-nulle de chaque côté.
// Organisations sans Q-id résolues via le préfixe "NOM:<nom>".
// ---------------------------------------------------------------------------

const LIENS = [
  {
    // P-O : Squeezie co-fondateur de Gentle Mates (2023)
    aType: "personne",
    aRef: "Q20971386",
    bType: "organisation",
    bRef: "NOM:Gentle Mates",
    typeLienCode: "FONDATEUR",
    description:
      "Lucas Hauchard (Squeezie) a co-fondé l'organisation esportive Gentle Mates le " +
      "2 janvier 2023 avec Gotaga (Corentin Houssein) et Brawks (Kevin Georges).",
    dateDebut: new Date("2023-01-02"),
    dateFin: null,
    sourceRef: "wp_gentle_mates",
  },
  {
    // P-O : Léna Mahfouf fondatrice de Hôtel Mahfouf (2022)
    aType: "personne",
    aRef: "Q93549102",
    bType: "organisation",
    bRef: "NOM:Hôtel Mahfouf",
    typeLienCode: "FONDATEUR",
    description:
      "Léna Mahfouf (Léna Situations) a fondé la marque de mode et de lifestyle " +
      "Hôtel Mahfouf en juin 2022.",
    dateDebut: new Date("2022-06-01"),
    dateFin: null,
    sourceRef: "wp_lena_situations",
  },
  {
    // P-O : Squeezie co-fondateur de Ciao (2025)
    aType: "personne",
    aRef: "Q20971386",
    bType: "organisation",
    bRef: "NOM:Ciao",
    typeLienCode: "FONDATEUR",
    description:
      "Lucas Hauchard (Squeezie) est co-fondateur de la marque de boissons Ciao " +
      "(kombucha et boissons énergétiques), lancée en 2025 avec Léna Situations et Inoxtag.",
    dateDebut: new Date("2025-01-01"),
    dateFin: null,
    sourceRef: "wp_squeezie",
  },
  {
    // P-O : Léna Mahfouf co-fondatrice de Ciao (2025)
    aType: "personne",
    aRef: "Q93549102",
    bType: "organisation",
    bRef: "NOM:Ciao",
    typeLienCode: "FONDATEUR",
    description:
      "Léna Mahfouf (Léna Situations) est co-fondatrice de la marque de boissons Ciao, " +
      "lancée en 2025 avec Squeezie (Lucas Hauchard) et Inoxtag (Inès Benazzouz).",
    dateDebut: new Date("2025-01-01"),
    dateFin: null,
    sourceRef: "wp_squeezie",
  },
  {
    // P-O : Inoxtag co-fondateur de Ciao (2025)
    aType: "personne",
    aRef: "Q108732480",
    bType: "organisation",
    bRef: "NOM:Ciao",
    typeLienCode: "FONDATEUR",
    description:
      "Inès Benazzouz (Inoxtag) est co-fondateur de la marque de boissons Ciao, " +
      "lancée en 2025 avec Squeezie (Lucas Hauchard) et Léna Situations (Léna Mahfouf).",
    dateDebut: new Date("2025-01-01"),
    dateFin: null,
    sourceRef: "wp_squeezie",
  },
  {
    // P-O : Magali Berdah fondatrice de Shauna Events (2017)
    aType: "personne",
    aRef: "Q88772206",
    bType: "organisation",
    bRef: "NOM:Shauna Events",
    typeLienCode: "FONDATEUR",
    description:
      "Magali Berdah a fondé l'agence de marketing d'influence Shauna Events en janvier 2017. " +
      "Condamnée en 2019 à une interdiction de gérer de 5 ans, elle ne peut plus exercer " +
      "la direction opérationnelle de la société depuis cette date.",
    dateDebut: new Date("2017-01-01"),
    dateFin: null,
    sourceRef: "wp_magali_berdah",
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (même pattern que seed-fortunes-2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-influenceurs] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
  // Toutes les orgas de ce seed n'ont pas de wikidataId confirmé → fallback par nom.
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
 * Résout une entité par son wikidataId OU, si le ref est de la forme "NOM:<nom>", par son nom.
 * Utilisé pour les organisations sans Q-id Wikidata confirmé.
 */
async function trouverEntite(type, ref) {
  if (ref && ref.startsWith("NOM:")) {
    const nom = ref.slice(4)
    if (type === "organisation") {
      return prisma.organisation.findFirst({ where: { nom } })
    }
  }
  if (type === "personne") {
    return prisma.personne.findFirst({ where: { wikidataId: ref } })
  }
  if (type === "organisation") {
    return prisma.organisation.findFirst({ where: { wikidataId: ref } })
  }
  throw new Error(`Type entité non supporté : ${type}`)
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
      `[seed-influenceurs] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log("Suppression données influenceurs précédentes...")
  const wikidataIdsP = PERSONNES.map((p) => p.wikidataId)
  const nomsOSansQid = ORGANISATIONS.filter((o) => !o.wikidataId).map((o) => o.nom)

  const persos = await prisma.personne.findMany({ where: { wikidataId: { in: wikidataIdsP } } })
  const orgasParNom =
    nomsOSansQid.length > 0
      ? await prisma.organisation.findMany({ where: { nom: { in: nomsOSansQid } } })
      : []

  const idsP = persos.map((p) => p.id)
  const idsO = orgasParNom.map((o) => o.id)

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
  console.log("\n-- seed-influenceurs — créateurs top-tier + volet judiciaire documenté --\n")
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

  console.log("\n— Organisations (nom — Q-id non confirmé) —")
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ok ${created.nom} (wikidataId=${o.wikidataId ?? "null, lookup nom"})`)
  }

  console.log("\n— Liens —")
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log("\n-- Bilan --")
  console.log(
    `Créateurs top-tier   : 7 (Squeezie, Cyprien, Norman Thavaud, Léna Situations,`,
  )
  console.log(
    `                           Tibo InShape, Inoxtag, Mister V)`,
  )
  console.log(
    `Volet judiciaire     : 2 (Nabilla Benattia, Magali Berdah)`,
  )
  console.log(
    `Organisations        : ${ORGANISATIONS.length} (Gentle Mates, Hôtel Mahfouf, Ciao, Shauna Events)`,
  )
  console.log(
    `Sources              : ${Object.keys(SOURCES).length} (Wikipédia FR × 10)`,
  )
  console.log(
    `Liens                : ${LIENS.length} (FONDATEUR uniquement — partenariats non sourcés exclus)`,
  )
  console.log("")
  console.log("Q-ids vérifiés via wbsearchentities (2026-07-02) :")
  console.log(
    "  Personnes : Q20971386 (Squeezie), Q3008879 (Cyprien), Q3343832 (Norman),",
  )
  console.log(
    "              Q93549102 (Léna Situations), Q31969862 (Tibo InShape),",
  )
  console.log(
    "              Q108732480 (Inoxtag), Q23816443 (Mister V),",
  )
  console.log(
    "              Q10872855 (Nabilla), Q88772206 (Magali Berdah)",
  )
  console.log(
    "Sociétés sans Q-id confirmé : Gentle Mates, Hôtel Mahfouf, Ciao, Shauna Events",
  )
  console.log(
    "Exclusions : McFly, Carlito, Michou, Marc Blata, Nadé Blata (Q-id non confirmé)",
  )
  console.log("")
}

main()
  .catch((err) => {
    console.error("[seed-influenceurs] Echec :", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
