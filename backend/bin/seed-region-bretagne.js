/**
 * Seed Région Bretagne — enquête OSINT du 2026-07-02.
 *
 * Périmètre :
 *   - Région Bretagne (institution) + son président Loïg Chesnais-Girard
 *   - Maires / ex-maires des principales communes :
 *       Rennes    (Nathalie Appéré, en mandat)
 *       Brest     (François Cuillandre, mandat 2020-2026)
 *       Quimper   (Isabelle Assih, réélue mars 2026)
 *       Lorient   (Fabrice Loher, mandat 2020-2026)
 *       Saint-Malo (Gilles Lurton, en mandat)
 *       Vannes    (David Robo, mandat 2020-2026)
 *   - Économie régionale hors CAC40 :
 *       Groupe Bigard (Q2902387), Groupe Le Duff (Q3117472), Groupe Roullier (Q56277889)
 *       (dirigeants avec Q-id vérifié : Jean-Paul Bigard Q40895554, Louis Le Duff Q3262464)
 *   - Presse régionale :
 *       Le Télégramme (Q3088647) + Groupe Télégramme (Q3117586) — Édouard Coudurier Q129168213
 *       Ouest-France (Q660769) DÉJÀ EN BASE (seed-raffermir-medias.js) — non recréé ici
 *
 * Entités DÉJÀ EN BASE (référencées dans les liens, non recréées ici) :
 *   Personnes    : Vincent Bolloré Q721491, François Pinault Q1451167,
 *                  François-Henri Pinault Q1371822
 *   Organisations: Stade Rennais FC Q19509, Groupe Artémis Q2866000,
 *                  Ouest-France Q660769, SIPA — Ouest-France Q3117551,
 *                  PS Q170972 (seed-eurodeputes-fr.js / seed-hollande.js)
 *
 * Affaires politico-financières : aucune procédure judiciaire publique documentée
 *   au 2026-07-02 pour les figures de ce corpus (Chesnais-Girard, Appéré, Cuillandre,
 *   Assih, Loher, Lurton, Robo, Bigard, Le Duff, Coudurier) — piste à réexaminer
 *   via Légifrance, HATVP, AMF.
 *
 * Sources : Wikidata (Q-ids tous vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR, vie-publique.fr, site officiel bretagne.bzh.
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-region-bretagne.js
 *   cd backend && node bin/seed-region-bretagne.js --reset
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const RESET = process.argv.includes("--reset")
const USER_EMAIL = "remi@reseauxinfluences.fr"

// ---------------------------------------------------------------------------
// PERSONNES — recoupées ≥ 2 sources (Wikidata + Wikipédia FR au minimum).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q29579537 (vérifié Special:EntityData) + Wikipédia FR
    // + site officiel bretagne.bzh (fiche président du Conseil régional)
    // Président du Conseil régional de Bretagne depuis le 22 juin 2017, réélu juillet 2021.
    // Ancien membre du PS (1997-2022) — a quitté le parti en juin 2022, opposé à l'alliance PS/LFI.
    nom: "Chesnais-Girard",
    prenom: "Loïg",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1977-03-25"),
    lieuNaissance: "Liffré (Ille-et-Vilaine)",
    rolePrincipal: "Président du Conseil régional de Bretagne",
    rolesSecondaires: [
      "ancien maire de Liffré (2008-2017)",
      "membre du Comité européen des régions",
      "président de Mégalis Bretagne (déploiement fibre)",
      "ancien membre du Parti Socialiste (1997-2022)",
    ],
    bio:
      "Né le 25 mars 1977 à Liffré (Ille-et-Vilaine), Loïg Chesnais-Girard préside le Conseil " +
      "régional de Bretagne depuis juin 2017 et a été réélu en juillet 2021. Ancien élu PS, " +
      "il a quitté le parti en juin 2022, refusant l'alliance avec La France Insoumise. " +
      "Il dirige aussi Mégalis Bretagne (déploiement de la fibre optique).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Lo%C3%AFg_Chesnais-Girard",
    wikidataId: "Q29579537",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q2920825 (vérifié Special:EntityData — P39 maire Rennes depuis 2020-07-09)
    //           + Wikipédia FR (Nathalie Appéré)
    // Maire de Rennes depuis le 9 juillet 2020. Présidente de Rennes Métropole.
    // Ancienne députée PS d'Ille-et-Vilaine 2e circo. (2012-2017).
    nom: "Appéré",
    prenom: "Nathalie",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1975-07-08"),
    lieuNaissance: null,
    rolePrincipal: "Maire de Rennes et présidente de Rennes Métropole",
    rolesSecondaires: [
      "ancienne députée PS d'Ille-et-Vilaine (2012-2017)",
      "conseillère régionale de Bretagne (depuis 2015)",
      "membre du Parti Socialiste",
    ],
    bio:
      "Née le 8 juillet 1975, Nathalie Appéré est maire de Rennes depuis le 9 juillet 2020 " +
      "et présidente de Rennes Métropole. Ancienne députée PS d'Ille-et-Vilaine (2012-2017), " +
      "elle est l'une des figures du PS en Bretagne et une proche d'Anne Hidalgo.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Nathalie_App%C3%A9r%C3%A9",
    wikidataId: "Q2920825",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q3084338 (vérifié Special:EntityData — P39 maire Brest 2020-2026)
    //           + Wikipédia FR (François Cuillandre)
    // Maire de Brest depuis 2001 (réélu 2008, 2014, 2020). Mandat 2020-2026 terminé mars 2026.
    nom: "Cuillandre",
    prenom: "François",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1955-02-05"),
    lieuNaissance: null,
    rolePrincipal: "Ancien maire de Brest (2001-2026)",
    rolesSecondaires: [
      "ancien président de Brest Métropole (2001-2026)",
      "membre du Parti Socialiste",
    ],
    bio:
      "Né le 5 février 1955, François Cuillandre est maire de Brest depuis 2001 (réélu en 2008, " +
      "2014 et 2020). Proche du Parti Socialiste, il a largement présidé Brest Métropole pendant " +
      "vingt-cinq ans. Son mandat 2020-2026 s'est achevé lors des élections municipales " +
      "de mars 2026.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Cuillandre",
    wikidataId: "Q3084338",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q63763816 (vérifié Special:EntityData — P39 maire Quimper depuis 2020-07-05,
    //           réélue mars 2026) + Wikipédia FR (Isabelle Assih)
    // Première femme maire de Quimper. Affiliée au Parti Socialiste.
    // Née le 27 février 1970 à Douarnenez (Finistère) — psychologue scolaire de formation.
    nom: "Assih",
    prenom: "Isabelle",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1970-02-27"),
    lieuNaissance: "Douarnenez (Finistère)",
    rolePrincipal: "Maire de Quimper et présidente de Quimper Bretagne Occidentale",
    rolesSecondaires: [
      "première femme maire de Quimper (depuis 2020)",
      "conseillère départementale du Finistère",
      "membre du Parti Socialiste",
    ],
    bio:
      "Née le 27 février 1970 à Douarnenez (Finistère), Isabelle Assih est institutrice " +
      "et psychologue scolaire de formation. Élue maire de Quimper le 5 juillet 2020 — " +
      "première femme à la tête de la ville — elle est réélue lors des municipales de mars 2026. " +
      "Elle préside Quimper Bretagne Occidentale. Chevalière de la Légion d'honneur (2025).",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Isabelle_Assih",
    wikidataId: "Q63763816",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q96757595 (vérifié Special:EntityData — P39 maire Lorient 2020-03-21-2026)
    //           + Wikipédia FR (Fabrice Loher)
    // Maire de Lorient du 28 juin 2020 au 21 mars 2026 (élections municipales).
    nom: "Loher",
    prenom: "Fabrice",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1966-12-29"),
    lieuNaissance: null,
    rolePrincipal: "Ancien maire de Lorient (2020-2026)",
    rolesSecondaires: [
      "ancien président de Lorient Agglomération (2020-2026)",
      "ancien vice-président de la Région Bretagne",
    ],
    bio:
      "Né le 29 décembre 1966, Fabrice Loher est maire de Lorient du 28 juin 2020 au 21 mars 2026 " +
      "et président de Lorient Agglomération sur la même période. Son mandat s'est achevé lors " +
      "des élections municipales de mars 2026.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Fabrice_Loher",
    wikidataId: "Q96757595",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q3106366 (vérifié Special:EntityData — P39 maire Saint-Malo depuis 2020-07-03)
    //           + Wikipédia FR (Gilles Lurton)
    // Maire de Saint-Malo depuis le 3 juillet 2020. Ancien député d'Ille-et-Vilaine (2012-2017).
    nom: "Lurton",
    prenom: "Gilles",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1963-07-06"),
    lieuNaissance: null,
    rolePrincipal: "Maire de Saint-Malo et président de l'Agglomération de Saint-Malo",
    rolesSecondaires: [
      "ancien député d'Ille-et-Vilaine (2012-2017)",
      "président de la Communauté d'agglomération de Saint-Malo (depuis 2020)",
    ],
    bio:
      "Né le 6 juillet 1963, Gilles Lurton est maire de Saint-Malo depuis le 3 juillet 2020 " +
      "et président de la Communauté d'agglomération de Saint-Malo. Ancien député d'Ille-et-Vilaine " +
      "(XIVe législature, 2012-2017), il incarne la droite modérée malouine.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Gilles_Lurton",
    wikidataId: "Q3106366",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q3018703 (vérifié Special:EntityData — P39 maire Vannes 2020-2026)
    //           + Wikipédia FR (David Robo)
    // Maire de Vannes depuis 2011 (réélu 2014, 2020). Mandat 2020-2026.
    nom: "Robo",
    prenom: "David",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1970-06-10"),
    lieuNaissance: null,
    rolePrincipal: "Ancien maire de Vannes (2011-2026)",
    rolesSecondaires: [
      "ancien député du Morbihan (2015-2022)",
      "ancien président de Vannes Agglomération",
    ],
    bio:
      "Né le 10 juin 1970, David Robo est maire de Vannes depuis 2011 (réélu en 2014 et 2020) " +
      "et ancien député du Morbihan (2015-2022). Élu de droite (UDI/MoDem), il a également " +
      "présidé Vannes Agglomération. Son mandat 2020-2026 s'est achevé lors des municipales " +
      "de mars 2026.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/David_Robo",
    wikidataId: "Q3018703",
    qualiteInfluence: "ELU",
  },
  {
    // Sources : Wikidata Q40895554 (vérifié Special:EntityData, "French industrial")
    //           + Wikipédia FR (Bigard (entreprise)) : PDG depuis 2004, fils de Lucien Bigard.
    // ~90 % du capital du Groupe Bigard (premier abatteur français). Fortune ~550 M€ (2019).
    nom: "Bigard",
    prenom: "Jean-Paul",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1948-11-12"),
    lieuNaissance: null,
    rolePrincipal: "Président-directeur général du Groupe Bigard",
    rolesSecondaires: [
      "président de Culture Viande (syndicat national de l'industrie de la viande)",
      "actionnaire majoritaire (~90 %) du Groupe Bigard",
    ],
    bio:
      "Né le 12 novembre 1948, Jean-Paul Bigard est PDG du Groupe Bigard depuis 2004, " +
      "succédant à son père Lucien Bigard qui avait fondé l'entreprise à Quimper en 1968. " +
      "Il détient environ 90 % du capital. Le groupe est le premier abatteur français " +
      "(marques Bigard, Charal, Socopa) avec un CA de plus de 3 Md€.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Jean-Paul_Bigard",
    wikidataId: "Q40895554",
    qualiteInfluence: "DIRIGEANT",
  },
  {
    // Sources : Wikidata Q3262464 (vérifié wbsearchentities, "French businessman")
    //           + Wikipédia FR (Louis Le Duff)
    // Fondateur de Brioche Dorée à Brest en 1976. Fondateur et président du Groupe Le Duff.
    nom: "Le Duff",
    prenom: "Louis",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1946-08-01"),
    lieuNaissance: null,
    rolePrincipal: "Fondateur et président du Groupe Le Duff",
    rolesSecondaires: [
      "fondateur de Brioche Dorée (Brest, 1976)",
      "membre du Club des Trente",
      "docteur en sciences de gestion",
    ],
    bio:
      "Né le 1er août 1946, Louis Le Duff fonde Brioche Dorée à Brest en 1976, première brique " +
      "d'un groupe mondial de restauration et boulangerie-pâtisserie artisanale. Le Groupe Le Duff " +
      "regroupe aujourd'hui Del Arte, Bridor, La Madeleine (USA) et plus de 1 260 restaurants " +
      "dans 100 pays, pour 30 000 collaborateurs. Siège social à Rennes.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Louis_Le_Duff",
    wikidataId: "Q3262464",
    qualiteInfluence: "DIRIGEANT",
  },
  {
    // Sources : Wikidata Q129168213 (vérifié wbsearchentities, né 1961)
    //           + Wikipédia FR (Le Télégramme) : Édouard Coudurier = président et directeur
    //             de publication depuis au moins 2025. Arrière-petit-fils du fondateur Marcel Coudurier.
    // NB : entrée Wikidata peu détaillée (pas de P39 renseigné) — confidence medium.
    nom: "Coudurier",
    prenom: "Édouard",
    pays: "France",
    nationalite: "française",
    dateNaissance: new Date("1961-01-01"),
    // NB : seule l'année de naissance est disponible sur Wikidata (précision = année).
    lieuNaissance: null,
    rolePrincipal: "Président du Groupe Télégramme et directeur de publication du Télégramme",
    rolesSecondaires: [
      "président-directeur du Groupe Télégramme (Tébéo, TébéSud)",
      "directeur de publication du quotidien Le Télégramme",
    ],
    bio:
      "Né en 1961, Édouard Coudurier est l'héritier de la famille Coudurier qui fonde Le Télégramme " +
      "à Brest en 1944. Président et directeur de publication du quotidien, il dirige le Groupe " +
      "Télégramme (Morlaix), qui inclut les chaînes Tébéo et TébéSud. En 2025, le groupe engage " +
      "des négociations pour entrer au capital de Réel Média.",
    wikipediaUrl: null,
    wikidataId: "Q129168213",
    qualiteInfluence: "EDITEUR_PRESSE",
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q12130 + site officiel bretagne.bzh
    nom: "Région Bretagne",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.bretagne.bzh",
    description:
      "Collectivité territoriale de l'Ouest de la France (Côtes-d'Armor, Finistère, " +
      "Ille-et-Vilaine, Morbihan). Environ 3,4 millions d'habitants, chef-lieu Rennes. " +
      "Présidée par Loïg Chesnais-Girard depuis 2017.",
    dateCreation: new Date("1972-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Bretagne_(r%C3%A9gion_administrative)",
    wikidataId: "Q12130",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q647 + Wikipédia FR
    nom: "Rennes",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.rennes.fr",
    description:
      "Capitale de la région Bretagne et préfecture d'Ille-et-Vilaine, environ 220 000 habitants " +
      "(aire métropolitaine ~440 000). Siège de Rennes Métropole (43 communes). " +
      "Ville universitaire majeure (Rennes 1, Rennes 2, Sciences Po, ENS).",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Rennes",
    wikidataId: "Q647",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q12193 + Wikipédia FR
    nom: "Brest",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.brest.fr",
    description:
      "Commune du Finistère, 2e ville de Bretagne (~140 000 hab.). Port militaire majeur " +
      "(arsenaux de la Marine nationale). Siège de l'IUEM et de Brest Métropole.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Brest",
    wikidataId: "Q12193",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q342 + Wikipédia FR
    nom: "Quimper",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.quimper.bzh",
    description:
      "Préfecture du Finistère, environ 66 000 habitants. Connue pour la faïence HB-Henriot, " +
      "centre de la Cornouaille bretonne. Siège de Quimper Bretagne Occidentale.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Quimper",
    wikidataId: "Q342",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q71724 + Wikipédia FR
    nom: "Lorient",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.lorient.fr",
    description:
      "Commune du Morbihan, environ 58 000 habitants. Port de pêche et base navale majeurs. " +
      "Ville de la Compagnie des Indes (XVIIIe s.). Hôte du Festival Interceltique (annuel).",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Lorient",
    wikidataId: "Q71724",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q163108 + Wikipédia FR
    nom: "Saint-Malo",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.saint-malo.fr",
    description:
      "Commune d'Ille-et-Vilaine, environ 48 000 habitants. Cité corsaire, destination " +
      "touristique bretonne (intra-muros). Port ferry (Bretagne, Normandie Brittany Ferries). " +
      "Siège historique du Groupe Roullier.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Saint-Malo",
    wikidataId: "Q163108",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q6593 + Wikipédia FR
    nom: "Vannes",
    sigle: null,
    typeOrganisation: "INSTITUTION_PUBLIQUE",
    pays: "France",
    siteWeb: "https://www.mairie-vannes.fr",
    description:
      "Préfecture du Morbihan, environ 54 000 habitants. Porte du golfe du Morbihan, " +
      "territoire à forte attractivité touristique. Siège de Vannes Agglomération.",
    dateCreation: null,
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Vannes",
    wikidataId: "Q6593",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q2902387 + Wikipédia FR (Bigard entreprise)
    // 1er abatteur français (bovins et porcins). Fondé 1968 par Lucien Bigard à Quimper.
    // PDG depuis 2004 : Jean-Paul Bigard (fils fondateur). CA >3 Md€. Non coté.
    nom: "Groupe Bigard",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.groupebigard.fr",
    description:
      "Premier groupe français d'abattage et de transformation de viandes bovine et porcine. " +
      "Fondé en 1968 à Quimper par Lucien Bigard. Marques : Bigard, Charal, Socopa. " +
      "CA >3 Md€, non coté. PDG : Jean-Paul Bigard (fils du fondateur, depuis 2004).",
    dateCreation: new Date("1968-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Bigard_(entreprise)",
    wikidataId: "Q2902387",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q3117472 + Wikipédia FR (Groupe Le Duff)
    // Fondé en 1976 par Louis Le Duff à Brest (Brioche Dorée). Siège à Rennes.
    // 30 000 collaborateurs, +1 260 restaurants et boulangeries dans 100 pays.
    nom: "Groupe Le Duff",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.groupeleduff.com",
    description:
      "Groupe international de restauration et boulangerie-pâtisserie artisanale, fondé à Brest " +
      "en 1976 par Louis Le Duff. Marques : Brioche Dorée, Del Arte, Bridor, La Madeleine (USA). " +
      "30 000 collaborateurs, +1 260 points de vente dans 100 pays. Siège à Rennes.",
    dateCreation: new Date("1976-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Groupe_Le_Duff",
    wikidataId: "Q3117472",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q56277889 + Wikipédia FR (Groupe Roullier)
    // Fondé en 1959 à Saint-Malo par Jacques Roullier. Spécialiste agrofourniture / nutrition végétale.
    // 9 000 salariés, 100 pays. NB : fondateur décédé (Jacques Roullier, 1921-2008) ;
    // actuel dirigeant Philippe Roullier n'a pas de Q-id Wikidata → non ajouté (ADR-périmètre).
    nom: "Groupe Roullier",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.roullier.com",
    description:
      "Groupe d'agrofourniture et de nutrition végétale et animale fondé en 1959 à Saint-Malo " +
      "(Ille-et-Vilaine) par Jacques Roullier. Spécialisé minéraux/nutriments pour l'agriculture. " +
      "9 000 salariés, présent dans 100 pays. Non coté. Dirigé par Philippe Roullier (famille).",
    dateCreation: new Date("1959-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Groupe_Roullier",
    wikidataId: "Q56277889",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q3088647 + Wikipédia FR (Le Télégramme)
    // Fondé le 18 septembre 1944 à Brest (libération) par Marcel Coudurier.
    // 1er quotidien du Finistère et des Côtes-d'Armor (~200 000 lecteurs). Siège : Morlaix.
    nom: "Le Télégramme",
    sigle: null,
    typeOrganisation: "MEDIA",
    pays: "France",
    siteWeb: "https://www.letelegramme.fr",
    description:
      "Quotidien régional breton fondé le 18 septembre 1944 par Marcel Coudurier lors de la " +
      "libération de Brest. Premier quotidien du Finistère et des Côtes-d'Armor (~200 000 lecteurs). " +
      "Édité par le Groupe Télégramme (famille Coudurier), siège à Morlaix.",
    dateCreation: new Date("1944-09-18"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Le_T%C3%A9l%C3%A9gramme",
    wikidataId: "Q3088647",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q3117586 (label : "Groupe Télégramme", "groupe de média français",
    //           fondé 14 déc. 2005, siège Morlaix) + Wikipédia FR (Le Télégramme)
    // Holding éditrice du Télégramme, Tébéo, TébéSud. Contrôlée par la famille Coudurier.
    nom: "Groupe Télégramme",
    sigle: null,
    typeOrganisation: "MEDIA",
    pays: "France",
    siteWeb: "https://www.letelegramme.fr",
    description:
      "Groupe de médias breton fondé le 14 décembre 2005, basé à Morlaix (Finistère). " +
      "Publie Le Télégramme (quotidien régional) et exploite les chaînes TV Tébéo et TébéSud. " +
      "Contrôlé par la famille Coudurier (Édouard Coudurier, président).",
    dateCreation: new Date("2005-12-14"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Le_T%C3%A9l%C3%A9gramme",
    wikidataId: "Q3117586",
    qualiteInfluence: "AUTRE",
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_chesnais: {
    url: "https://fr.wikipedia.org/wiki/Lo%C3%AFg_Chesnais-Girard",
    titre: "Loïg Chesnais-Girard — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 25 mars 1977 à Liffré. Président du Conseil régional de Bretagne depuis le 22 juin 2017, " +
      "réélu en juillet 2021. Ancien PS (quitté en juin 2022 contre l'alliance LFI).",
    verifiee: true,
  },
  bretagne_bzh: {
    url: "https://www.bretagne.bzh/le-conseil-regional/president/",
    titre: "Loïg Chesnais-Girard, Président de Bretagne — bretagne.bzh",
    media: "Région Bretagne (site officiel)",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2021-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: "Conseil régional de Bretagne",
    description:
      "Fiche officielle du président du Conseil régional de Bretagne : mandat, attributions, biographie.",
    verifiee: true,
  },
  wp_appere: {
    url: "https://fr.wikipedia.org/wiki/Nathalie_App%C3%A9r%C3%A9",
    titre: "Nathalie Appéré — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Née le 8 juillet 1975. PS. Maire de Rennes depuis le 9 juillet 2020 et présidente " +
      "de Rennes Métropole. Ancienne députée d'Ille-et-Vilaine (2012-2017).",
    verifiee: true,
  },
  wp_cuillandre: {
    url: "https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Cuillandre",
    titre: "François Cuillandre — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 5 février 1955. Maire de Brest depuis 2001, PS. Mandat 2020-2026 terminé mars 2026.",
    verifiee: true,
  },
  wp_assih: {
    url: "https://fr.wikipedia.org/wiki/Isabelle_Assih",
    titre: "Isabelle Assih — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Née le 27 fév. 1970 à Douarnenez. PS. Maire de Quimper depuis le 5 juillet 2020 — " +
      "première femme à ce poste — réélue mars 2026. Chevalière de la Légion d'honneur (2025).",
    verifiee: true,
  },
  wp_loher: {
    url: "https://fr.wikipedia.org/wiki/Fabrice_Loher",
    titre: "Fabrice Loher — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 29 déc. 1966. Maire de Lorient du 28 juin 2020 au 21 mars 2026 " +
      "(Wikidata P39 : dateFin 2026-03-21). Ancien président Lorient Agglomération.",
    verifiee: true,
  },
  wp_lurton: {
    url: "https://fr.wikipedia.org/wiki/Gilles_Lurton",
    titre: "Gilles Lurton — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 6 juillet 1963. Maire de Saint-Malo depuis le 3 juillet 2020 (Wikidata P39). " +
      "Ancien député d'Ille-et-Vilaine (2012-2017).",
    verifiee: true,
  },
  wp_robo: {
    url: "https://fr.wikipedia.org/wiki/David_Robo",
    titre: "David Robo — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 10 juin 1970. Maire de Vannes depuis 2011, réélu 2014 et 2020. Wikidata : terme 2020-2026. " +
      "Ancien député du Morbihan (2015-2022).",
    verifiee: true,
  },
  wp_bigard_ent: {
    url: "https://fr.wikipedia.org/wiki/Bigard_(entreprise)",
    titre: "Bigard (entreprise) — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Groupe Bigard fondé en 1968 par Lucien Bigard à Quimper. PDG Jean-Paul Bigard depuis 2004 " +
      "(fils du fondateur, ~90 % du capital). 1er abatteur français. CA >3 Md€.",
    verifiee: true,
  },
  wp_leduff: {
    url: "https://fr.wikipedia.org/wiki/Louis_Le_Duff",
    titre: "Louis Le Duff — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Né le 1er août 1946. Fonde Brioche Dorée à Brest en 1976. Président du Groupe Le Duff " +
      "(Del Arte, Bridor, La Madeleine, +1 260 restaurants, 30 000 salariés, 100 pays).",
    verifiee: true,
  },
  wp_roullier: {
    url: "https://fr.wikipedia.org/wiki/Groupe_Roullier",
    titre: "Groupe Roullier — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Fondé en 1959 à Saint-Malo par Jacques Roullier. Spécialiste agrofourniture et nutrition " +
      "végétale/animale. 9 000 salariés, 100 pays. Dirigé par Philippe Roullier (famille).",
    verifiee: true,
  },
  wp_telegr: {
    url: "https://fr.wikipedia.org/wiki/Le_T%C3%A9l%C3%A9gramme",
    titre: "Le Télégramme — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-07-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Fondé le 18 septembre 1944 par Marcel Coudurier. 1er quotidien du Finistère et des " +
      "Côtes-d'Armor. Président 2025 : Édouard Coudurier. Groupe Télégramme (Morlaix).",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — lien polymorphe (ADR-002). Résolution par wikidataId.
// Entités déjà en base : PS Q170972 (seed-eurodeputes-fr.js requis).
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Loïg Chesnais-Girard ---

  {
    // P→O : président du Conseil régional de Bretagne depuis le 22 juin 2017
    aType: "personne",
    aRef: "Q29579537",
    bType: "organisation",
    bRef: "Q12130",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Loïg Chesnais-Girard est président du Conseil régional de Bretagne depuis le 22 juin 2017, " +
      "réélu lors des élections régionales de juin 2021.",
    dateDebut: new Date("2017-06-22"),
    dateFin: null,
    sourceRef: "wp_chesnais",
  },
  {
    // P→O : affiliation PS (1997-2022) — PS (Q170972) déjà en base.
    // Chesnais-Girard a quitté le PS en juin 2022 sans rejoindre un autre parti.
    aType: "personne",
    aRef: "Q29579537",
    bType: "organisation",
    bRef: "Q170972",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Loïg Chesnais-Girard était membre du Parti Socialiste de 1997 à juin 2022, date à " +
      "laquelle il a quitté le parti en refusant l'alliance PS/LFI.",
    dateDebut: new Date("1997-01-01"),
    dateFin: new Date("2022-06-30"),
    sourceRef: "wp_chesnais",
  },

  // --- Nathalie Appéré ---

  {
    // P→O : maire de Rennes depuis le 9 juillet 2020
    aType: "personne",
    aRef: "Q2920825",
    bType: "organisation",
    bRef: "Q647",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Nathalie Appéré est maire de Rennes depuis le 9 juillet 2020 et présidente de Rennes " +
      "Métropole (43 communes). Élue sous étiquette PS/liste de gauche.",
    dateDebut: new Date("2020-07-09"),
    dateFin: null,
    sourceRef: "wp_appere",
  },
  {
    // P→O : affiliation PS — PS (Q170972) déjà en base.
    aType: "personne",
    aRef: "Q2920825",
    bType: "organisation",
    bRef: "Q170972",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Nathalie Appéré est membre du Parti Socialiste, ancienne députée PS et maire PS de Rennes.",
    dateDebut: new Date("2000-01-01"),
    dateFin: null,
    sourceRef: "wp_appere",
  },

  // --- François Cuillandre ---

  {
    // P→O : maire de Brest 2020-2026 (mandat achevé mars 2026)
    aType: "personne",
    aRef: "Q3084338",
    bType: "organisation",
    bRef: "Q12193",
    typeLienCode: "ANCIEN_MANDAT",
    description:
      "François Cuillandre a été maire de Brest de 2001 à mars 2026 (réélu 2008, 2014, 2020). " +
      "Son mandat 2020-2026 s'est achevé lors des élections municipales de mars 2026.",
    dateDebut: new Date("2001-03-18"),
    dateFin: new Date("2026-03-21"),
    sourceRef: "wp_cuillandre",
  },

  // --- Isabelle Assih ---

  {
    // P→O : maire de Quimper depuis le 5 juillet 2020, réélue mars 2026
    aType: "personne",
    aRef: "Q63763816",
    bType: "organisation",
    bRef: "Q342",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Isabelle Assih est maire de Quimper depuis le 5 juillet 2020 (première femme à ce poste). " +
      "Elle a été réélue lors des élections municipales de mars 2026.",
    dateDebut: new Date("2020-07-05"),
    dateFin: null,
    sourceRef: "wp_assih",
  },
  {
    // P→O : affiliation PS — PS (Q170972) déjà en base.
    aType: "personne",
    aRef: "Q63763816",
    bType: "organisation",
    bRef: "Q170972",
    typeLienCode: "AFFILIATION_PARTI",
    description:
      "Isabelle Assih est membre du Parti Socialiste, s'est engagée pour Anne Hidalgo " +
      "(PS) lors de la présidentielle de 2022.",
    dateDebut: new Date("2014-01-01"),
    dateFin: null,
    sourceRef: "wp_assih",
  },

  // --- Fabrice Loher ---

  {
    // P→O : maire de Lorient 2020-2026 (mandat achevé le 21 mars 2026 — Wikidata P39)
    aType: "personne",
    aRef: "Q96757595",
    bType: "organisation",
    bRef: "Q71724",
    typeLienCode: "ANCIEN_MANDAT",
    description:
      "Fabrice Loher a été maire de Lorient du 28 juin 2020 au 21 mars 2026 " +
      "(Wikidata Q96757595, P39 dateFin 2026-03-21).",
    dateDebut: new Date("2020-06-28"),
    dateFin: new Date("2026-03-21"),
    sourceRef: "wp_loher",
  },

  // --- Gilles Lurton ---

  {
    // P→O : maire de Saint-Malo depuis le 3 juillet 2020 (Wikidata P39)
    aType: "personne",
    aRef: "Q3106366",
    bType: "organisation",
    bRef: "Q163108",
    typeLienCode: "MANDAT_ELECTIF",
    description:
      "Gilles Lurton est maire de Saint-Malo depuis le 3 juillet 2020 " +
      "et président de la Communauté d'agglomération de Saint-Malo (depuis juillet 2020).",
    dateDebut: new Date("2020-07-03"),
    dateFin: null,
    sourceRef: "wp_lurton",
  },

  // --- David Robo ---

  {
    // P→O : maire de Vannes 2020-2026 (Wikidata : terme 2020-2026, cohérent avec mars 2026)
    aType: "personne",
    aRef: "Q3018703",
    bType: "organisation",
    bRef: "Q6593",
    typeLienCode: "ANCIEN_MANDAT",
    description:
      "David Robo a été maire de Vannes de 2011 à mars 2026 (réélu en 2014 et 2020). " +
      "Son mandat 2020-2026 s'est achevé lors des élections municipales de mars 2026.",
    dateDebut: new Date("2011-04-01"),
    dateFin: new Date("2026-03-21"),
    sourceRef: "wp_robo",
  },

  // --- Jean-Paul Bigard → Groupe Bigard ---

  {
    // P→O : PDG du Groupe Bigard depuis 2004 (Wikipédia : Bigard entreprise)
    aType: "personne",
    aRef: "Q40895554",
    bType: "organisation",
    bRef: "Q2902387",
    typeLienCode: "DIRIGEANT",
    description:
      "Jean-Paul Bigard est PDG du Groupe Bigard depuis 2004, succédant à son père Lucien Bigard " +
      "(fondateur, 1968). Il détient environ 90 % du capital et préside Culture Viande.",
    dateDebut: new Date("2004-01-01"),
    dateFin: null,
    sourceRef: "wp_bigard_ent",
  },

  // --- Louis Le Duff → Groupe Le Duff ---

  {
    // P→O : fondateur du Groupe Le Duff (Brioche Dorée fondée à Brest en 1976)
    aType: "personne",
    aRef: "Q3262464",
    bType: "organisation",
    bRef: "Q3117472",
    typeLienCode: "FONDATEUR",
    description:
      "Louis Le Duff fonde Brioche Dorée à Brest en 1976, première entité du groupe qui " +
      "deviendra le Groupe Le Duff (Del Arte, Bridor, La Madeleine, etc.).",
    dateDebut: new Date("1976-01-01"),
    dateFin: null,
    sourceRef: "wp_leduff",
  },
  {
    // P→O : président du Groupe Le Duff (toujours en poste)
    aType: "personne",
    aRef: "Q3262464",
    bType: "organisation",
    bRef: "Q3117472",
    typeLienCode: "DIRIGEANT",
    description:
      "Louis Le Duff préside le Groupe Le Duff, groupe international de restauration et " +
      "boulangerie-pâtisserie artisanale (>1 260 restaurants, 30 000 salariés, 100 pays).",
    dateDebut: new Date("1976-01-01"),
    dateFin: null,
    sourceRef: "wp_leduff",
  },

  // --- Édouard Coudurier → Groupe Télégramme → Le Télégramme ---

  {
    // P→O : président du Groupe Télégramme et directeur de publication du Télégramme
    aType: "personne",
    aRef: "Q129168213",
    bType: "organisation",
    bRef: "Q3117586",
    typeLienCode: "DIRIGEANT",
    description:
      "Édouard Coudurier préside le Groupe Télégramme (Morlaix) et est directeur de publication " +
      "du quotidien Le Télégramme, fondé en 1944 par son aïeul Marcel Coudurier.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_telegr",
  },
  {
    // O→O : Groupe Télégramme éditeur du quotidien Le Télégramme
    aType: "organisation",
    aRef: "Q3117586",
    bType: "organisation",
    bRef: "Q3088647",
    typeLienCode: "EDITEUR_DE",
    description:
      "Le Groupe Télégramme (Q3117586) est la société éditrice du quotidien Le Télégramme " +
      "(Q3088647), contrôlée par la famille Coudurier depuis 1944.",
    dateDebut: new Date("2005-12-14"),
    dateFin: null,
    sourceRef: "wp_telegr",
  },
]

// ---------------------------------------------------------------------------
// Helpers — identiques à seed-region-naquitaine.js
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-bretagne] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

async function upsertPersonne(data, userId) {
  const existing = await prisma.personne.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.personne.update({ where: { id: existing.id }, data: { ...data, statut: "EN_ATTENTE" } })
  }
  return prisma.personne.create({ data: { ...data, statut: "EN_ATTENTE", creeParId: userId } })
}

async function upsertOrganisation(data, userId) {
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.organisation.update({ where: { id: existing.id }, data: { ...data, statut: "EN_ATTENTE" } })
  }
  return prisma.organisation.create({ data: { ...data, statut: "EN_ATTENTE", creeParId: userId } })
}

async function upsertSource(key) {
  const data = SOURCES[key]
  const existing = await prisma.source.findFirst({ where: { url: data.url } })
  if (existing) return existing
  return prisma.source.create({ data })
}

async function trouverEntite(type, wikidataId) {
  if (type === "personne") {
    return prisma.personne.findFirst({ where: { wikidataId } })
  }
  if (type === "organisation") {
    return prisma.organisation.findFirst({ where: { wikidataId } })
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
    console.warn(
      `  ⚠ Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef} → ${entiteA ? "OK" : "MANQUANT"}, ` +
        `bRef=${lien.bRef} → ${entiteB ? "OK" : "MANQUANT"}) — ignoré`,
    )
    return null
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) throw new Error(`TypeLien introuvable : ${lien.typeLienCode}`)

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
  console.log("Suppression données Bretagne précédentes...")
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
  console.log("Données précédentes supprimées.\n")
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n--- seed-region-bretagne — Réseau d'influence Bretagne (2026-07-02) ---\n")
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log("Sources publiques")
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  OK ${data.titre}`)
  }

  console.log("\nPersonnes (Wikidata)")
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  OK ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log("\nOrganisations (Wikidata)")
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  OK ${created.nom} (${o.wikidataId})`)
  }

  console.log("\nLiens")
  let liensCreated = 0
  for (const lien of LIENS) {
    const result = await creerLien(lien, sourcesMap, user.id)
    if (result) {
      liensCreated++
      console.log(`  OK ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
    }
  }

  console.log("\n--- Bilan ---")
  console.log(`Personnes     : ${PERSONNES.length} nouvelles`)
  console.log(
    "  Chesnais-Girard (Région Bretagne), Appéré (Rennes), Cuillandre (Brest),",
  )
  console.log(
    "  Assih (Quimper), Loher (Lorient), Lurton (Saint-Malo), Robo (Vannes),",
  )
  console.log("  Bigard, Le Duff, Coudurier (Télégramme)")
  console.log(`Organisations : ${ORGANISATIONS.length} nouvelles`)
  console.log(
    "  Région Bretagne, Rennes, Brest, Quimper, Lorient, Saint-Malo, Vannes,",
  )
  console.log("  Groupe Bigard, Groupe Le Duff, Groupe Roullier, Le Télégramme, Groupe Télégramme")
  console.log(`Sources       : ${Object.keys(SOURCES).length}`)
  console.log(`Liens         : ${liensCreated} / ${LIENS.length} tentés`)
  console.log("  MANDAT_ELECTIF x4, ANCIEN_MANDAT x3, AFFILIATION_PARTI x3,")
  console.log("  DIRIGEANT x3, FONDATEUR x1, EDITEUR_DE x1")
  console.log("\nRéférences déjà en base (non recréées) :")
  console.log(
    "  Q721491 Bolloré, Q1451167 F.Pinault, Q1371822 FH.Pinault, Q19509 Stade Rennais,",
  )
  console.log(
    "  Q2866000 Artémis, Q660769 Ouest-France, Q3117551 SIPA-Ouest-France, Q170972 PS",
  )
  console.log("\nAffaires judiciaires : néant (aucune procédure publique documentée")
  console.log("  pour les 10 figures de ce corpus au 2026-07-02 — piste à réexaminer")
  console.log("  via Légifrance, HATVP, AMF).")
  console.log("\n⚠ Prérequis AFFILIATION_PARTI (PS Q170972) :")
  console.log("  seed-eurodeputes-fr.js OU seed-hollande.js doit avoir été lancé avant.")
  console.log("  Les 3 liens AFFILIATION_PARTI seront ignorés (warning) si PS absent.")
}

main()
  .catch((err) => {
    console.error("[seed-bretagne] Échec :", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
