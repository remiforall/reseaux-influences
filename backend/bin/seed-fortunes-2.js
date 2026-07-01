/**
 * Seed Fortunes 2 — Vincent Bolloré (groupe Bolloré / Vivendi) et la galaxie Mulliez (AFM).
 * Enquête OSINT journalistique du 2026-06-30 — liens capitalistiques uniquement.
 *
 * Périmètre :
 *   • Bolloré : Vincent Bolloré (fondateur, bénéficiaire effectif) + Yannick Bolloré
 *     (PDG Bolloré SE depuis 2018). Organisations : Compagnie de l'Odet (holding de contrôle
 *     familiale), Bolloré SE, Vivendi SE (entité résiduelle post-scission déc. 2024),
 *     Canal+ PLC (LSE), Havas NV (Euronext AMS), Louis Hachette Group (Euronext Paris) ;
 *     médias : CNews, Europe 1, Prisma Media.
 *   • Mulliez : Gérard Mulliez (fondateur AFM + Auchan — seul dirigeant public identifié).
 *     Organisations : Association Familiale Mulliez (AFM), Auchan, Decathlon, Adeo
 *     (Leroy Merlin), Boulanger.
 *
 * Exclusions explicites :
 *   ⚠ Editis : vendu par Vivendi à Daniel Křetínský en 2023 — hors périmètre Bolloré.
 *   ⚠ ~700 membres privés de l'AFM : personnes privées sans rôle public — exclus (ADR-006).
 *   ⚠ Dirigeants exécutifs Mulliez autres que Gérard : aucun profil public suffisamment
 *     sourcé et distinct identifié à la date de consultation.
 *
 * Volet judiciaire Vincent Bolloré (présomption d'innocence — OBLIGATOIRE) :
 *   Mis en examen le 24 avril 2018 pour « corruption d'agents publics étrangers » et
 *   « complicité d'abus de confiance » (affaire des concessions portuaires africaines,
 *   Guinée-Conakry et Togo). En 2021, convention judiciaire d'intérêt public (CJIP) :
 *   €12 M contre Bolloré SE (la société) ; le CRPC personnel est rejeté par le tribunal,
 *   un procès public est requis. Renvoi devant le tribunal correctionnel de Paris en mars 2026 ;
 *   procès fixé aux 7-17 décembre 2026. AUCUNE CONDAMNATION DÉFINITIVE — présumé innocent.
 *
 * Sources : Wikidata (Q-ids vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR, Le Monde diplomatique (PPA), Acrimed, Bolloré.com.
 *
 * Codes capitalistiques ADR-027 utilisés :
 *   DETENTION_CAPITAL (participation minoritaire < 50 % capital),
 *   ACTIONNAIRE_MAJORITAIRE (majorité du capital OU contrôle via droits de vote double),
 *   FILIALE (détention quasi totale ou contrôle intégré).
 *   Direction aRef = détenteur / mère → bRef = détenu / filiale.
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId ou par nom si wikidataId nul)
 *   - % de détention uniquement si sourcés explicitement
 *
 * Usage :
 *   cd backend && node bin/seed-fortunes-2.js
 *   cd backend && node bin/seed-fortunes-2.js --reset
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
    // Sources : Wikidata Q721491 (vérifié wbsearchentities, "CEO of investment group Bolloré")
    //           + Wikipédia FR (Vincent Bolloré)
    // Rôle public attesté : fondateur et bénéficiaire effectif du groupe Bolloré via la
    //   Compagnie de l'Odet. A quitté toutes fonctions de gouvernance le 17 février 2022.
    // ⚠ VOLET JUDICIAIRE (présomption d'innocence) :
    //   Mis en examen le 24 avril 2018 pour « corruption d'agents publics étrangers » et
    //   « complicité d'abus de confiance » (affaire des concessions portuaires africaines,
    //   Guinée et Togo). CJIP 2021 : €12 M contre Bolloré SE ; CRPC personnel rejeté.
    //   Renvoi en jugement mars 2026 ; procès fixé 7-17 déc. 2026. PRÉSUMÉ INNOCENT.
    nom: "Bolloré",
    prenom: "Vincent",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1952-04-01"),
    lieuNaissance: "Boulogne-Billancourt (Hauts-de-Seine)",
    rolePrincipal: "Fondateur et bénéficiaire effectif du groupe Bolloré",
    rolesSecondaires: [
      "ancien Président-Directeur général de Bolloré SE (1981-2022)",
      "bénéficiaire effectif via la Compagnie de l'Odet",
    ],
    bio:
      "Né le 1ᵉʳ avril 1952 à Boulogne-Billancourt. Industriel et financier français, " +
      "il reprend la papeterie Bolloré Frères en 1981 et bâtit un conglomérat diversifié " +
      "(logistique africaine, batteries, médias). Bénéficiaire effectif du groupe via la " +
      "Compagnie de l'Odet. Il quitte toutes fonctions de gouvernance le 17 février 2022. " +
      "Mis en examen le 24 avr. 2018 pour corruption d'agents publics étrangers ; renvoyé en " +
      "jugement mars 2026 ; procès fixé déc. 2026 — présumé innocent.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Vincent_Bollor%C3%A9",
    wikidataId: "Q721491",
    qualiteInfluence: "DIRIGEANT",
  },
  {
    // Sources : Wikidata Q3571729 (vérifié wbsearchentities, "businessperson", né 1980-02-01)
    //           + Wikipédia FR (Yannick Bolloré)
    // Rôle public attesté : Président du directoire de Bolloré SE depuis 2018 ;
    //   Président du conseil de surveillance de Vivendi SA (2013-2024).
    nom: "Bolloré",
    prenom: "Yannick",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1980-02-01"),
    lieuNaissance: null,
    rolePrincipal: "Président du directoire de Bolloré SE",
    rolesSecondaires: [
      "ancien Président du conseil de surveillance de Vivendi SA (2013-2024)",
      "fils de Vincent Bolloré",
    ],
    bio:
      "Né le 1ᵉʳ février 1980. Fils de Vincent Bolloré, diplômé d'HEC, il rejoint le groupe " +
      "familial en 2007. Président du directoire de Bolloré SE depuis 2018. Il a également " +
      "présidé le conseil de surveillance de Vivendi SA de 2013 à la scission de décembre 2024 " +
      "qui a créé Canal+ PLC, Havas NV et Louis Hachette Group.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Yannick_Bollor%C3%A9",
    wikidataId: "Q3571729",
    qualiteInfluence: "DIRIGEANT",
  },
  {
    // Sources : Wikidata Q1415359 (vérifié Special:EntityData — "French businessman",
    //           né 13 mai 1931, confirme rôle depuis 1969 / fondateur Auchan)
    //           + Wikipédia FR (Gérard Mulliez)
    // Rôle public attesté : fondateur d'Auchan (1961) et de l'AFM (structure familiale).
    nom: "Mulliez",
    prenom: "Gérard",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1931-05-13"),
    lieuNaissance: "Roubaix (Nord)",
    rolePrincipal: "Fondateur de la galaxie Mulliez — Auchan, Decathlon, AFM",
    rolesSecondaires: [
      "fondateur d'Auchan (1961)",
      "fondateur de l'Association Familiale Mulliez",
      "patriarche de la famille Mulliez",
    ],
    bio:
      "Né le 13 mai 1931 à Roubaix. Issu d'une famille textile nordiste, Gérard Mulliez " +
      "ouvre le premier hypermarché Auchan à Roubaix-Woippy en 1961. " +
      "Il fonde l'Association Familiale Mulliez (AFM) pour fédérer les actifs familiaux. " +
      "La galaxie comprend Auchan, Decathlon, Adeo (Leroy Merlin) et Boulanger, " +
      "toutes contrôlées majoritairement par l'AFM.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/G%C3%A9rard_Mulliez",
    wikidataId: "Q1415359",
    qualiteInfluence: "DIRIGEANT",
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  // ========================================================================
  // PÔLE BOLLORÉ
  // ========================================================================
  {
    // Sources : Wikidata Q3072532 (vérifié wbsearchentities, "French holding company")
    //           + Wikipédia FR (Compagnie de l'Odet)
    // Détient 63,72 % du capital de Bolloré SE (au 20 juin 2025, source : Wikipédia Bolloré).
    nom: "Compagnie de l'Odet",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: null,
    description:
      "Holding cotée sur Euronext Paris, intermédiaire entre la famille Bolloré et " +
      "la holding opérationnelle Bolloré SE. Détient 63,72 % du capital de Bolloré SE " +
      "(au 20 juin 2025). Vincent Bolloré en est le bénéficiaire effectif.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Compagnie_de_l%27Odet",
    wikidataId: "Q3072532",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q444172 (vérifié wbsearchentities,
    //           "French investment and industrial holding group") + Wikipédia FR (Bolloré)
    // Compagnie de l'Odet détient 63,72 % du capital (Wikipedia Bolloré, juin 2025).
    // Avant la scission de déc. 2024 : détenait 29,3 % de Vivendi SA + droits de vote
    //   double ~ 49 % des votes.
    // Post-scission : 30,4 % de Canal+ PLC, 30,4 % de Havas NV, 30,4 % de LHG
    //   (source : Wikipédia Bolloré).
    nom: "Bolloré SE",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.bollore.com",
    description:
      "Holding industrielle et financière cotée sur Euronext Paris. " +
      "Contrôlée à 63,72 % par la Compagnie de l'Odet (famille Bolloré). " +
      "Avant la scission Vivendi (déc. 2024) : 29,3 % du capital de Vivendi SA " +
      "et ~ 49 % des droits de vote (droits de vote double). " +
      "Post-scission : actionnaire à 30,4 % de Canal+ PLC, de Havas NV et de " +
      "Louis Hachette Group.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Bollor%C3%A9",
    wikidataId: "Q444172",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q1127887 (vérifié wbsearchentities,
    //           "French mass media holding company") + Wikipédia FR (Vivendi)
    // Bolloré SE détenait 29,3 % du capital de Vivendi SA pré-scission.
    // Scission déc. 2024 : Canal+ PLC (LSE), Havas NV (Euronext AMS),
    //   Louis Hachette Group (Euronext Paris) deviennent des entités cotées indépendantes.
    //   Vivendi SE est l'entité résiduelle post-scission.
    nom: "Vivendi SE",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.vivendi.com",
    description:
      "Holding médias et communications (anciennement Compagnie Générale des Eaux, 1853). " +
      "Bolloré SE en est devenu l'actionnaire de contrôle de fait (29,3 % du capital, " +
      "~ 49 % des droits de vote grâce aux droits de vote double). " +
      "La scission de décembre 2024 a créé trois entités cotées indépendantes : " +
      "Canal+ PLC, Havas NV et Louis Hachette Group. Vivendi SE est l'entité résiduelle.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Vivendi",
    wikidataId: "Q1127887",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q2663746 (vérifié wbsearchentities,
    //           "French film and television studio and distributor")
    //           + Wikipédia FR (Canal+ société) + Monde Diplo PPA
    // NB : le Q-id Q2663746 correspond à l'entité historique Canal+ S.A. (ancienne filiale
    //   à 100 % de Vivendi). Depuis déc. 2024, la société est cotée sur le London Stock Exchange
    //   sous le nom Canal+ PLC. Aucun Q-id distinct n'a été trouvé sur Wikidata pour Canal+ PLC
    //   à la date de consultation (2026-06-30) — à vérifier manuellement.
    nom: "Canal+ PLC",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.groupe-canalplus.com",
    description:
      "Groupe de télévision payante et de production cinématographique. " +
      "Ancienne filiale à 100 % de Vivendi SA ; coté sur le London Stock Exchange (LSE) " +
      "depuis décembre 2024 à l'issue de la scission Vivendi. " +
      "Bolloré SE en est actionnaire à 30,4 % (source : Wikipédia Bolloré, 2024-2025). " +
      "Le groupe comprend Canal+, C8 et CNews.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Canal%2B_(soci%C3%A9t%C3%A9)",
    wikidataId: "Q2663746",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q516033 (vérifié wbsearchentities,
    //           "French multinational advertising and public relations company")
    //           + Wikipédia FR (Havas) + Acrimed PPA
    // NB : depuis la scission Vivendi (déc. 2024), Havas est cotée sur Euronext Amsterdam
    //   sous le nom Havas NV. Q516033 correspond à l'entité historique Havas Group
    //   (intégrée dans Vivendi 2017-2024) ; utilisé en l'absence de Q-id distinct pour Havas NV.
    nom: "Havas NV",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.havasgroup.com",
    description:
      "Groupe mondial de communication et de publicité fondé en 1835. " +
      "Intégré dans Vivendi de 2017 à décembre 2024. " +
      "Depuis la scission de Vivendi (déc. 2024), coté sur Euronext Amsterdam (Havas NV). " +
      "Bolloré SE en est actionnaire à 30,4 % (source : Wikipédia Bolloré, 2024-2025).",
    dateCreation: new Date("1835-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Havas",
    wikidataId: "Q516033",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q130745255 (vérifié wbsearchentities,
    //           "French publishing, media and distribution conglomerate")
    //           + Wikipédia FR (Louis Hachette Group)
    // Créé en décembre 2024 lors de la scission Vivendi. Comprend Hachette Livre,
    //   Lagardère News (Europe 1, Paris Match, Le JDD) et Prisma Media.
    // Bolloré SE actionnaire à 30,4 % (source : Wikipédia Bolloré).
    nom: "Louis Hachette Group",
    sigle: "LHG",
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.louishachettegroup.com",
    description:
      "Conglomérat d'édition, de médias et de distribution issu de la scission Vivendi " +
      "(décembre 2024), coté sur Euronext Paris. " +
      "Regroupe Hachette Livre, Lagardère News (Europe 1, Paris Match, Le JDD) et Prisma Media. " +
      "Bolloré SE en est actionnaire à 30,4 % (source : Wikipédia Bolloré, 2024-2025).",
    dateCreation: new Date("2024-12-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Louis_Hachette_Group",
    wikidataId: "Q130745255",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q3083542 (vérifié wbsearchentities, "French television Channel")
    //           + Wikipédia FR (CNews) + Monde Diplo PPA
    // Filiale du groupe Canal+ PLC (anciennement iTELE, rebaptisée CNews en 2017).
    nom: "CNews",
    sigle: null,
    typeOrganisation: "MEDIA",
    pays: "France",
    siteWeb: "https://www.cnews.fr",
    description:
      "Chaîne d'information en continu française rebaptisée CNews en 2017 (anciennement iTELE). " +
      "Filiale du groupe Canal+ PLC (périmètre Bolloré post-scission déc. 2024).",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/CNews",
    wikidataId: "Q3083542",
    qualiteInfluence: "EDITEUR_PRESSE",
  },
  {
    // Sources : Wikidata Q314407 (vérifié wbsearchentities, "French radio station")
    //           + Wikipédia FR (Europe 1) + Acrimed PPA
    // Europe 1 appartient à Lagardère News, intégré dans Louis Hachette Group post-scission.
    nom: "Europe 1",
    sigle: null,
    typeOrganisation: "MEDIA",
    pays: "France",
    siteWeb: "https://www.europe1.fr",
    description:
      "Station de radio généraliste française créée en 1955. " +
      "Appartient à Lagardère News, intégré dans Louis Hachette Group " +
      "depuis la scission Vivendi de décembre 2024. " +
      "Actionnaire de contrôle in fine : Bolloré SE (30,4 % de LHG).",
    dateCreation: new Date("1955-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Europe_1",
    wikidataId: "Q314407",
    qualiteInfluence: "EDITEUR_PRESSE",
  },
  {
    // Sources : Wikidata Q3403917 (vérifié wbsearchentities, "company", label Prisma Media)
    //           + Wikipédia FR (Prisma Media) + Acrimed PPA
    // Acquis par Vivendi en 2021 (auprès de Bertelsmann).
    // Post-scission déc. 2024 : intégré dans Louis Hachette Group.
    nom: "Prisma Media",
    sigle: null,
    typeOrganisation: "MEDIA",
    pays: "France",
    siteWeb: "https://www.prismamedia.com",
    description:
      "Groupe de presse magazine français (Femme Actuelle, Voici, Capital, Gala, etc.). " +
      "Acquis par Vivendi en 2021 auprès de Bertelsmann. " +
      "Intégré dans Louis Hachette Group depuis la scission Vivendi de décembre 2024.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Prisma_Media",
    wikidataId: "Q3403917",
    qualiteInfluence: "EDITEUR_PRESSE",
  },

  // ========================================================================
  // PÔLE MULLIEZ
  // ========================================================================
  {
    // Sources : Wikidata Q743182 (vérifié wbsearchentities, "French holding company",
    //           label Association Familiale Mulliez) + Wikipédia FR (Association familiale Mulliez)
    // Fondée par Gérard Mulliez pour coordonner les participations familiales.
    // Les ~700 membres privés de l'AFM sont exclus de ce corpus (personnes privées).
    nom: "Association Familiale Mulliez",
    sigle: "AFM",
    typeOrganisation: "ASSOCIATION",
    pays: "France",
    siteWeb: null,
    description:
      "Association de droit français fondée par Gérard Mulliez pour coordonner les " +
      "participations familiales dans les enseignes du groupe : Auchan, Decathlon, " +
      "Adeo (Leroy Merlin), Boulanger et d'autres marques. " +
      "Structure capitalistique opaque ; les membres privés (~700 personnes) sont hors périmètre. " +
      "Actionnaire de contrôle de toutes les enseignes majeures du groupe.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Association_familiale_Mulliez",
    wikidataId: "Q743182",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q758603 (vérifié wbsearchentities,
    //           "French multinational retail company") + Wikipédia FR (Auchan)
    // Fondé par Gérard Mulliez en 1961 à Roubaix. Contrôlé par l'AFM.
    nom: "Auchan",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.auchan.fr",
    description:
      "Groupe de grande distribution alimentaire et non-alimentaire fondé par Gérard Mulliez " +
      "à Roubaix en 1961. Présent dans 12 pays. " +
      "Contrôlé par l'Association Familiale Mulliez (AFM) — groupe non coté, 100 % privé.",
    dateCreation: new Date("1961-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Auchan",
    wikidataId: "Q758603",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q509349 (vérifié wbsearchentities,
    //           "French multinational sporting goods store chain") + Wikipédia FR (Decathlon)
    // Fondé en 1976 à Englos (Nord). Contrôlé par l'AFM.
    nom: "Decathlon",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.decathlon.fr",
    description:
      "Chaîne internationale de commerce et de conception d'articles de sport fondée " +
      "en 1976 à Englos (Nord). Présente dans plus de 60 pays. " +
      "Contrôlée par l'Association Familiale Mulliez (AFM) — groupe non coté, 100 % privé.",
    dateCreation: new Date("1976-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Decathlon_(entreprise)",
    wikidataId: "Q509349",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q2941497 (vérifié wbsearchentities,
    //           "French retail group of hardware store chains") + Wikipédia FR (Adeo)
    // Anciennement Leroy Merlin SA, rebaptisé Adeo en 2018. Regroupe Leroy Merlin,
    //   Brico Dépôt, Bricocenter, Weldom. Contrôlé par l'AFM.
    nom: "Adeo",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.adeo.com",
    description:
      "Groupe de distribution spécialisé dans l'amélioration de l'habitat " +
      "(Leroy Merlin, Brico Dépôt, Bricocenter, Weldom). " +
      "Anciennement dénommé Leroy Merlin SA, rebaptisé Adeo en 2018. " +
      "Contrôlé par l'Association Familiale Mulliez (AFM) — groupe non coté, 100 % privé.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Adeo_(groupe)",
    wikidataId: "Q2941497",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikipédia FR (Boulanger) + Acrimed PPA
    // ⚠ Q-id Wikidata non trouvé via wbsearchentities à la date de consultation (2026-06-30).
    //   À vérifier manuellement : https://www.wikidata.org/w/index.php?search=Boulanger+enseigne
    //   SIREN : à documenter via annuaire-entreprises.data.gouv.fr (contrôle manuel recommandé).
    nom: "Boulanger",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.boulanger.com",
    description:
      "Chaîne de distribution d'électroménager, de multimédia et de téléphonie fondée " +
      "en 1954. Présente principalement en France. " +
      "Contrôlée par l'Association Familiale Mulliez (AFM) — groupe non coté, 100 % privé. " +
      "⚠ Q-id Wikidata non confirmé à la date de consultation — à vérifier manuellement.",
    dateCreation: new Date("1954-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Boulanger_(enseigne)",
    wikidataId: null,
    qualiteInfluence: "AUTRE",
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-06-30).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_vincent_bollore: {
    url: "https://fr.wikipedia.org/wiki/Vincent_Bollor%C3%A9",
    titre: "Vincent Bolloré — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Né le 1ᵉʳ avr. 1952. Mise en examen 24 avr. 2018 ; CJIP 2021 (€12 M contre Bolloré SE) ; " +
      "renvoi en jugement mars 2026 ; procès fixé 7-17 déc. 2026. Présumé innocent.",
    verifiee: true,
  },
  wp_yannick_bollore: {
    url: "https://fr.wikipedia.org/wiki/Yannick_Bollor%C3%A9",
    titre: "Yannick Bolloré — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Né le 1ᵉʳ février 1980. PDG (Président du directoire) de Bolloré SE depuis 2018. " +
      "Ancien Président du CS de Vivendi SA (2013-2024).",
    verifiee: true,
  },
  wp_bollore_se: {
    url: "https://fr.wikipedia.org/wiki/Bollor%C3%A9",
    titre: "Bolloré — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Compagnie de l'Odet détient 63,72 % de Bolloré SE (au 20 juin 2025). " +
      "Bolloré SE détenait 29,3 % de Vivendi pré-scission. " +
      "Post-scission déc. 2024 : 30,4 % de Canal+ PLC, Havas NV et LHG.",
    verifiee: true,
  },
  wp_compagnie_odet: {
    url: "https://fr.wikipedia.org/wiki/Compagnie_de_l%27Odet",
    titre: "Compagnie de l'Odet — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Holding familiale cotée sur Euronext Paris. Contrôlée par la famille Bolloré. " +
      "Intermédiaire entre la famille et Bolloré SE.",
    verifiee: true,
  },
  wp_vivendi: {
    url: "https://fr.wikipedia.org/wiki/Vivendi",
    titre: "Vivendi — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Scission déc. 2024 : Canal+ PLC (LSE), Havas NV (Euronext AMS), " +
      "Louis Hachette Group (Euronext Paris). Vivendi SE est l'entité résiduelle. " +
      "Bolloré SE contrôlait ~ 29 % capital + ~ 49 % votes (droits double).",
    verifiee: true,
  },
  wp_canalplus: {
    url: "https://fr.wikipedia.org/wiki/Canal%2B_(soci%C3%A9t%C3%A9)",
    titre: "Canal+ (société) — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Groupe télévision payante. Ancienne filiale à 100 % de Vivendi SA. " +
      "Coté sur le LSE (Canal+ PLC) depuis déc. 2024. Comprend Canal+, C8, CNews.",
    verifiee: true,
  },
  wp_havas: {
    url: "https://fr.wikipedia.org/wiki/Havas",
    titre: "Havas — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Groupe de communication fondé en 1835. Intégré dans Vivendi 2017-2024. " +
      "Coté sur Euronext Amsterdam (Havas NV) depuis déc. 2024.",
    verifiee: true,
  },
  wp_louis_hachette_group: {
    url: "https://fr.wikipedia.org/wiki/Louis_Hachette_Group",
    titre: "Louis Hachette Group — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Conglomérat édition/médias issu de la scission Vivendi (déc. 2024). " +
      "Comprend Hachette Livre, Lagardère News (Europe 1, Le JDD, Paris Match), Prisma Media.",
    verifiee: true,
  },
  wp_cnews: {
    url: "https://fr.wikipedia.org/wiki/CNews",
    titre: "CNews — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Chaîne d'information en continu (rebaptisée CNews en 2017, anciennement iTELE). " +
      "Filiale du groupe Canal+ PLC.",
    verifiee: true,
  },
  wp_europe1: {
    url: "https://fr.wikipedia.org/wiki/Europe_1",
    titre: "Europe 1 — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Radio généraliste fondée en 1955. Appartient à Lagardère News, " +
      "intégré dans Louis Hachette Group depuis la scission Vivendi (déc. 2024).",
    verifiee: true,
  },
  wp_prisma_media: {
    url: "https://fr.wikipedia.org/wiki/Prisma_Media",
    titre: "Prisma Media — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Groupe de presse magazine (Femme Actuelle, Voici, Capital, Gala…). " +
      "Acquis par Vivendi en 2021 ; intégré dans Louis Hachette Group post-scission 2024.",
    verifiee: true,
  },
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
      "Guide des concentrations médiatiques françaises en partenariat avec Le Monde " +
      "diplomatique. Recense la chaîne Bolloré → CNews, Europe 1, Prisma Media " +
      "via Vivendi et ses filiales.",
    verifiee: true,
  },
  wp_gerard_mulliez: {
    url: "https://fr.wikipedia.org/wiki/G%C3%A9rard_Mulliez",
    titre: "Gérard Mulliez — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Né le 13 mai 1931 à Roubaix. Fondateur d'Auchan (1961) et de l'AFM. " +
      "Patriarche de la famille Mulliez, l'une des plus grandes fortunes françaises.",
    verifiee: true,
  },
  wp_afm: {
    url: "https://fr.wikipedia.org/wiki/Association_familiale_Mulliez",
    titre: "Association familiale Mulliez — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Association de droit français regroupant la famille Mulliez. " +
      "Actionnaire de contrôle d'Auchan, Decathlon, Adeo, Boulanger et autres enseignes.",
    verifiee: true,
  },
  wp_auchan: {
    url: "https://fr.wikipedia.org/wiki/Auchan",
    titre: "Auchan — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Groupe de distribution fondé par Gérard Mulliez à Roubaix en 1961. " +
      "Contrôlé par l'AFM. Présent dans 12 pays.",
    verifiee: true,
  },
  wp_decathlon: {
    url: "https://fr.wikipedia.org/wiki/Decathlon_(entreprise)",
    titre: "Decathlon — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Chaîne internationale d'articles de sport fondée en 1976 à Englos (Nord). " +
      "Contrôlée par l'Association Familiale Mulliez (AFM).",
    verifiee: true,
  },
  wp_adeo: {
    url: "https://fr.wikipedia.org/wiki/Adeo_(groupe)",
    titre: "Adeo — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Groupe de distribution pour l'habitat (Leroy Merlin, Brico Dépôt…). " +
      "Rebaptisé Adeo en 2018. Contrôlé par l'AFM.",
    verifiee: true,
  },
  wp_boulanger: {
    url: "https://fr.wikipedia.org/wiki/Boulanger_(enseigne)",
    titre: "Boulanger (enseigne) — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-06-30"),
    auteur: null,
    description:
      "Chaîne de distribution d'électroménager et de multimédia fondée en 1954. " +
      "Contrôlée par l'Association Familiale Mulliez (AFM).",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002). Codes capitalistiques ADR-027.
// Direction aRef = détenteur / mère → bRef = détenu / filiale.
// Entités identifiées par wikidataId ; exception : Boulanger par ref spéciale "NOM:Boulanger".
// ---------------------------------------------------------------------------

const LIENS = [
  // =========================================================================
  // GROUPE BOLLORÉ — personnes vers organisations
  // =========================================================================
  {
    // P-O : Vincent Bolloré bénéficiaire effectif de la Compagnie de l'Odet
    aType: "personne",
    aRef: "Q721491",
    bType: "organisation",
    bRef: "Q3072532",
    typeLienCode: "BENEFICIAIRE_EFFECTIF",
    description:
      "Vincent Bolloré est le bénéficiaire effectif de la Compagnie de l'Odet, " +
      "holding familiale qui contrôle Bolloré SE. Bien qu'il ait quitté toutes fonctions " +
      "de gouvernance le 17 février 2022, il demeure bénéficiaire effectif du groupe.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_vincent_bollore",
  },
  {
    // P-O : Vincent Bolloré — dirigeant historique de Bolloré SE (1981-2022)
    aType: "personne",
    aRef: "Q721491",
    bType: "organisation",
    bRef: "Q444172",
    typeLienCode: "DIRIGEANT",
    description:
      "Vincent Bolloré a assuré la direction de Bolloré SE de 1981 jusqu'à son retrait " +
      "de toutes fonctions de gouvernance le 17 février 2022.",
    dateDebut: new Date("1981-01-01"),
    dateFin: new Date("2022-02-17"),
    sourceRef: "wp_vincent_bollore",
  },
  {
    // P-O : Yannick Bolloré — Président du directoire de Bolloré SE depuis 2018
    aType: "personne",
    aRef: "Q3571729",
    bType: "organisation",
    bRef: "Q444172",
    typeLienCode: "DIRIGEANT",
    description:
      "Yannick Bolloré est Président du directoire de Bolloré SE depuis 2018, " +
      "succédant à son père comme dirigeant exécutif du groupe familial.",
    dateDebut: new Date("2018-01-01"),
    dateFin: null,
    sourceRef: "wp_yannick_bollore",
  },
  {
    // P-O : Yannick Bolloré — Président du CS de Vivendi SA (2013-2024, mandat éteint à la scission)
    aType: "personne",
    aRef: "Q3571729",
    bType: "organisation",
    bRef: "Q1127887",
    typeLienCode: "DIRIGEANT",
    description:
      "Yannick Bolloré a présidé le conseil de surveillance de Vivendi SA de 2013 " +
      "à la scission de décembre 2024, qui a donné naissance à trois entités indépendantes " +
      "(Canal+ PLC, Havas NV, Louis Hachette Group).",
    dateDebut: new Date("2013-01-01"),
    dateFin: new Date("2024-12-10"),
    sourceRef: "wp_vivendi",
  },

  // =========================================================================
  // GROUPE BOLLORÉ — chaîne de contrôle capitalistique O→O
  // =========================================================================
  {
    // O-O : Compagnie de l'Odet → Bolloré SE (63,72 % du capital, au 20 juin 2025)
    aType: "organisation",
    aRef: "Q3072532",
    bType: "organisation",
    bRef: "Q444172",
    typeLienCode: "ACTIONNAIRE_MAJORITAIRE",
    description:
      "La Compagnie de l'Odet détient 63,72 % du capital de Bolloré SE " +
      "(au 20 juin 2025, source : Wikipédia Bolloré).",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_bollore_se",
  },
  {
    // O-O : Bolloré SE → Vivendi SE
    // Contrôle pré-scission : 29,3 % du capital + droits de vote double ~ 49 % des votes.
    // Bolloré SE demeure actionnaire de Vivendi SE (entité résiduelle post-scission).
    aType: "organisation",
    aRef: "Q444172",
    bType: "organisation",
    bRef: "Q1127887",
    typeLienCode: "DETENTION_CAPITAL",
    description:
      "Bolloré SE détenait 29,3 % du capital de Vivendi SA au 31 décembre 2024, " +
      "avec — grâce aux droits de vote double — environ 49 % des droits de vote, " +
      "conférant un contrôle de fait. Post-scission (déc. 2024), Bolloré SE demeure " +
      "actionnaire de Vivendi SE, entité résiduelle.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_bollore_se",
  },

  // --- Post-scission déc. 2024 : participations de Bolloré SE dans les 3 nouvelles entités ---
  {
    // O-O : Bolloré SE → Canal+ PLC (30,4 %, post-scission déc. 2024)
    aType: "organisation",
    aRef: "Q444172",
    bType: "organisation",
    bRef: "Q2663746",
    typeLienCode: "DETENTION_CAPITAL",
    description:
      "Bolloré SE est actionnaire de Canal+ PLC à hauteur de 30,4 % depuis la scission " +
      "de Vivendi en décembre 2024 (source : Wikipédia Bolloré, données 2024-2025).",
    dateDebut: new Date("2024-12-01"),
    dateFin: null,
    sourceRef: "wp_bollore_se",
  },
  {
    // O-O : Bolloré SE → Havas NV (30,4 %, post-scission déc. 2024)
    aType: "organisation",
    aRef: "Q444172",
    bType: "organisation",
    bRef: "Q516033",
    typeLienCode: "DETENTION_CAPITAL",
    description:
      "Bolloré SE est actionnaire de Havas NV à hauteur de 30,4 % depuis la scission " +
      "de Vivendi en décembre 2024 (source : Wikipédia Bolloré, données 2024-2025).",
    dateDebut: new Date("2024-12-01"),
    dateFin: null,
    sourceRef: "wp_bollore_se",
  },
  {
    // O-O : Bolloré SE → Louis Hachette Group (30,4 %, post-scission déc. 2024)
    aType: "organisation",
    aRef: "Q444172",
    bType: "organisation",
    bRef: "Q130745255",
    typeLienCode: "DETENTION_CAPITAL",
    description:
      "Bolloré SE est actionnaire de Louis Hachette Group à hauteur de 30,4 % depuis " +
      "la scission de Vivendi en décembre 2024 " +
      "(source : Wikipédia Bolloré, données 2024-2025).",
    dateDebut: new Date("2024-12-01"),
    dateFin: null,
    sourceRef: "wp_bollore_se",
  },

  // --- Médias dans le périmètre Canal+ PLC et Louis Hachette Group ---
  {
    // O-O : Canal+ PLC → CNews (filiale directe du groupe Canal+)
    aType: "organisation",
    aRef: "Q2663746",
    bType: "organisation",
    bRef: "Q3083542",
    typeLienCode: "FILIALE",
    description:
      "CNews est une chaîne du groupe Canal+ PLC, dont elle est filiale directe " +
      "(anciennement dans le périmètre Vivendi/Canal+ avant la scission de déc. 2024).",
    dateDebut: null,
    dateFin: null,
    sourceRef: "monde_diplo_ppa",
  },
  {
    // O-O : Louis Hachette Group → Europe 1 (via Lagardère News)
    aType: "organisation",
    aRef: "Q130745255",
    bType: "organisation",
    bRef: "Q314407",
    typeLienCode: "FILIALE",
    description:
      "Europe 1 appartient à Lagardère News, intégré dans Louis Hachette Group " +
      "depuis la scission de Vivendi de décembre 2024.",
    dateDebut: new Date("2024-12-01"),
    dateFin: null,
    sourceRef: "monde_diplo_ppa",
  },
  {
    // O-O : Louis Hachette Group → Prisma Media (acquis par Vivendi en 2021)
    aType: "organisation",
    aRef: "Q130745255",
    bType: "organisation",
    bRef: "Q3403917",
    typeLienCode: "FILIALE",
    description:
      "Prisma Media a été acquis par Vivendi en 2021 (auprès de Bertelsmann) " +
      "puis intégré dans Louis Hachette Group lors de la scission de décembre 2024.",
    dateDebut: new Date("2024-12-01"),
    dateFin: null,
    sourceRef: "wp_prisma_media",
  },

  // =========================================================================
  // GALAXIE MULLIEZ — personnes vers organisations
  // =========================================================================
  {
    // P-O : Gérard Mulliez — fondateur d'Auchan (1961)
    aType: "personne",
    aRef: "Q1415359",
    bType: "organisation",
    bRef: "Q758603",
    typeLienCode: "FONDATEUR",
    description:
      "Gérard Mulliez a fondé l'enseigne Auchan en 1961 à Roubaix (Nord) " +
      "en ouvrant le premier hypermarché du groupe.",
    dateDebut: new Date("1961-01-01"),
    dateFin: null,
    sourceRef: "wp_gerard_mulliez",
  },
  {
    // P-O : Gérard Mulliez — fondateur de l'Association Familiale Mulliez
    aType: "personne",
    aRef: "Q1415359",
    bType: "organisation",
    bRef: "Q743182",
    typeLienCode: "FONDATEUR",
    description:
      "Gérard Mulliez est le fondateur de l'Association Familiale Mulliez (AFM), " +
      "structure créée pour fédérer les actifs du groupe familial.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_gerard_mulliez",
  },

  // =========================================================================
  // GALAXIE MULLIEZ — chaîne de contrôle capitalistique AFM→ enseignes
  // =========================================================================
  {
    // O-O : AFM → Auchan (actionnaire de contrôle)
    aType: "organisation",
    aRef: "Q743182",
    bType: "organisation",
    bRef: "Q758603",
    typeLienCode: "ACTIONNAIRE_MAJORITAIRE",
    description:
      "L'Association Familiale Mulliez (AFM) est l'actionnaire de contrôle d'Auchan. " +
      "Groupe non coté, 100 % sous contrôle familial.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_afm",
  },
  {
    // O-O : AFM → Decathlon (actionnaire de contrôle)
    aType: "organisation",
    aRef: "Q743182",
    bType: "organisation",
    bRef: "Q509349",
    typeLienCode: "ACTIONNAIRE_MAJORITAIRE",
    description:
      "L'Association Familiale Mulliez (AFM) est l'actionnaire de contrôle de Decathlon. " +
      "Groupe non coté, 100 % sous contrôle familial.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_afm",
  },
  {
    // O-O : AFM → Adeo (actionnaire de contrôle)
    aType: "organisation",
    aRef: "Q743182",
    bType: "organisation",
    bRef: "Q2941497",
    typeLienCode: "ACTIONNAIRE_MAJORITAIRE",
    description:
      "L'Association Familiale Mulliez (AFM) est l'actionnaire de contrôle d'Adeo " +
      "(Leroy Merlin, Brico Dépôt…). Groupe non coté, 100 % sous contrôle familial.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_afm",
  },
  {
    // O-O : AFM → Boulanger (actionnaire de contrôle)
    // ⚠ Boulanger n'a pas de wikidataId confirmé → résolution par nom ("NOM:Boulanger")
    aType: "organisation",
    aRef: "Q743182",
    bType: "organisation",
    bRef: "NOM:Boulanger",
    typeLienCode: "ACTIONNAIRE_MAJORITAIRE",
    description:
      "L'Association Familiale Mulliez (AFM) est l'actionnaire de contrôle de Boulanger. " +
      "Groupe non coté, 100 % sous contrôle familial.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_boulanger",
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-fortunes-1.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-fortunes-2] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
  // Boulanger (et toute future org sans wikidataId) : recherche par nom en fallback.
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
 * Utilisé pour les organisations sans Q-id Wikidata confirmé (ex. Boulanger).
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
      `[seed-fortunes-2] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log("Suppression données Fortunes-2 précédentes...")
  const wikidataIdsP = PERSONNES.map((p) => p.wikidataId)
  const wikidataIdsO = ORGANISATIONS.filter((o) => o.wikidataId).map((o) => o.wikidataId)
  const nomsOSansQid = ORGANISATIONS.filter((o) => !o.wikidataId).map((o) => o.nom)

  const persos = await prisma.personne.findMany({ where: { wikidataId: { in: wikidataIdsP } } })
  const orgasParQid = await prisma.organisation.findMany({
    where: { wikidataId: { in: wikidataIdsO } },
  })
  const orgasParNom =
    nomsOSansQid.length > 0
      ? await prisma.organisation.findMany({ where: { nom: { in: nomsOSansQid } } })
      : []

  const idsP = persos.map((p) => p.id)
  const idsO = [...orgasParQid, ...orgasParNom].map((o) => o.id)

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
    "\n-- seed-fortunes-2 — Bolloré/Vivendi + galaxie Mulliez (liens capitalistiques) --\n",
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

  console.log("\n— Organisations (Wikidata + nom) —")
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    const ref = o.wikidataId ?? "nom:" + o.nom
    console.log(`  ok ${created.nom} (${ref})`)
  }

  console.log("\n— Liens —")
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log("\n-- Bilan --")
  console.log(
    `Personnes      : ${PERSONNES.length} (V. Bolloré, Y. Bolloré, G. Mulliez)`,
  )
  console.log(
    `Organisations  : ${ORGANISATIONS.length} (Odet, Bolloré SE, Vivendi SE, Canal+ PLC, Havas NV, LHG, ` +
      "CNews, Europe 1, Prisma Media | AFM, Auchan, Decathlon, Adeo, Boulanger)",
  )
  console.log(
    `Sources        : ${Object.keys(SOURCES).length} (Wikipédia FR, Monde Diplomatique PPA, Acrimed)`,
  )
  console.log(
    `Liens          : ${LIENS.length} (BENEFICIAIRE_EFFECTIF, DIRIGEANT, ACTIONNAIRE_MAJORITAIRE, ` +
      "DETENTION_CAPITAL, FILIALE, FONDATEUR)",
  )
  console.log("")
  console.log("Q-ids vérifiés via wbsearchentities + Special:EntityData :")
  console.log("  Personnes : Q721491, Q3571729, Q1415359")
  console.log(
    "  Orgas     : Q3072532, Q444172, Q1127887, Q2663746, Q516033, Q130745255, Q3083542",
  )
  console.log(
    "              Q314407, Q3403917, Q743182, Q758603, Q509349, Q2941497",
  )
  console.log("Sociétés sans Q-id confirmé : Boulanger (wikidataId null, lookup par nom)")
  console.log(
    "Exclusions : Editis (vendu 2023, hors périmètre), membres privés AFM ~700 (personnes privées)",
  )
  console.log("")
}

main()
  .catch((err) => {
    console.error("[seed-fortunes-2] Echec :", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
