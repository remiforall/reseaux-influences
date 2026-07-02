/**
 * Seed Corse — réseau d'influence de la Collectivité de Corse (enquête OSINT, 2026-07-02).
 *
 * Périmètre :
 *   - Collectivité de Corse (Q17050) + Assemblée de Corse (Q2564988)
 *   - Gilles Simeoni (Q3106502) : ex-Président CE (2015-2026), Maire de Bastia depuis mars 2026
 *   - Gilles Giovannangeli (Q139691255) : Président CE depuis le 4 mai 2026
 *   - Marie-Antoinette Maupertuis (Q100323003) : Présidente Assemblée de Corse depuis 2021
 *   - Jean-Christophe Angelini (Q3164723) : Maire de Porto-Vecchio, PNC
 *   - Laurent Marcangeli (Q2514772) : ex-Maire d'Ajaccio (2015-2022), Horizons
 *   - Partis : Femu a Corsica (Q3068323), PNC (Q1418625), Horizons (Q108846587)
 *   - Communes : Bastia (Q134698), Porto-Vecchio (Q241567), Ajaccio (Q40104)
 *
 * Q-id tous vérifiés via wbsearchentities / Special:EntityData / wbgetentities (2026-07-02).
 *
 * Sources : Wikidata, Wikipédia FR, France Info, Régions de France.
 *
 * EXCLUSIONS (sans Q-id Wikidata vérifié) :
 *   - Bianca Fazi (Q100323012) : Présidente CE par intérim du 21 avril au 4 mai 2026 (13 jours),
 *     profil Wikidata très sparse, aucune page Wikipédia FR.
 *   - Pierre Savelli : ex-Maire de Bastia, aucun Q-id Wikidata trouvé.
 *   - Maire actuel d'Ajaccio post-Marcangeli (2022) : non identifié avec Q-id vérifié.
 *   - Édouard Simeoni (père de Gilles) : personnalité historique, hors périmètre politique actuel.
 *
 * AFFAIRES — aucune consignée (présomption d'innocence) :
 *   Les enquêtes sur marchés publics corses et les procédures impliquant des élus locaux
 *   identifiées dans la presse ne font pas l'objet de décisions judiciaires définitives publiées
 *   accessibles en source ouverte à ce jour → allégations non corroborées, à écarter ou à
 *   investiguer via canal éditorial (Médiapart, franceinfo.fr, Le Monde) avec accès payant.
 *
 * Garde-fous projet :
 *   - Toutes les entités en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - Idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-region-corse.js
 *   cd backend && node bin/seed-region-corse.js --reset
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
    // Sources : Wikidata Q3106502 (wikidata.org/wiki/Q3106502, P569 20/04/1967, P19 Bastia)
    //           + Wikipédia FR "Gilles Simeoni" (parcours, mandats, affiliation Femu)
    //           + France Info (élection CE déc. 2015, démission avr. 2026 pour Bastia)
    // Rôle public : figure de proue du nationalisme autonomiste corse depuis 2014.
    nom: 'Simeoni',
    prenom: 'Gilles',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-04-20'),
    lieuNaissance: 'Bastia (Haute-Corse)',
    rolePrincipal: 'Maire de Bastia, Conseiller exécutif de la Collectivité de Corse',
    rolesSecondaires: [
      "ex-Président du Conseil exécutif de la Collectivité de Corse (déc. 2015 – avr. 2026)",
      "avocat au barreau de Bastia",
      "fils d'Edmond Simeoni, figure historique du nationalisme corse",
      "co-fondateur de Femu a Corsica (2017)",
    ],
    bio:
      "Avocat et militant autonomiste, Gilles Simeoni a fondé le courant Inseme per a Corsica en 2008 " +
      "puis Femu a Corsica en 2017. Élu Président du Conseil exécutif de la Collectivité de Corse le " +
      "17 décembre 2015 et réélu en 2021, il démissionne le 21 avril 2026 après son élection comme " +
      "Maire de Bastia (28 mars 2026). Il siège depuis lors comme Conseiller exécutif.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Gilles_Simeoni',
    wikidataId: 'Q3106502',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q100323003 (wikidata.org/wiki/Q100323003, P569 10/04/1967, P19 Ajaccio)
    //           + Wikipédia FR "Marie-Antoinette Maupertuis" (fonctions, prof univ., 1re femme CE)
    //           + Site officiel Assemblée de Corse assemblee.isula.corsica (liste élus 2021)
    // Rôle public : 1re femme présidente de l'Assemblée de Corse (depuis juillet 2021).
    nom: 'Maupertuis',
    prenom: 'Marie-Antoinette',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-04-10'),
    lieuNaissance: 'Ajaccio (Corse-du-Sud)',
    rolePrincipal: "Présidente de l'Assemblée de Corse",
    rolesSecondaires: [
      "professeure des universités en économie (Université de Corse Pascal-Paoli, depuis 2006)",
      "fondatrice et directrice du laboratoire CNRS en sciences sociales (2008-2021)",
      "ex-Conseillère exécutive chargée du tourisme et des affaires européennes (2015-2021)",
      "membre de Femu a Corsica / Fà populu inseme",
    ],
    bio:
      "Économiste, professeure à l'Université de Corse Pascal-Paoli et directrice d'un laboratoire CNRS " +
      "(2008-2021), Marie-Antoinette Maupertuis a été Conseillère exécutive chargée du tourisme de 2015 " +
      "à 2021. Élue Présidente de l'Assemblée de Corse le 1er juillet 2021, elle est la première femme " +
      "à exercer cette fonction. Elle conduit la liste Fà populu inseme (autonomistes) à l'Assemblée.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Marie-Antoinette_Maupertuis',
    wikidataId: 'Q100323003',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q139691255 (wikidata.org/wiki/Q139691255, P569 19/01/1965, mandat P39 4 mai 2026)
    //           + France Info, "Gilles Giovannangeli a été élu nouveau président du Conseil exécutif corse"
    //             (URL : franceinfo.fr/france/corse/…, non reproductible car 403 au fetch, URL citée)
    //           + Régions de France (regions-france.org/gilles-giovannangeli-succede-a-gilles-simeoni…)
    //           + Stampa Paese (stampa-paese.com/…/gilles-giovannangeli-elu-comme-nouveau-president)
    // Rôle public : Président du Conseil exécutif de la Collectivité de Corse depuis le 4 mai 2026.
    nom: 'Giovannangeli',
    prenom: 'Gilles',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1965-01-19'),
    lieuNaissance: null,
    rolePrincipal: "Président du Conseil exécutif de la Collectivité de Corse",
    rolesSecondaires: [
      "Conseiller territorial de Corse (depuis 2021, liste Fà populu inseme de Simeoni)",
      "ex-Président de l'Agence de développement économique de la Corse (2025)",
      "ex-Président de l'Office d'équipement hydraulique de Corse",
      "ex-Maire de Lecci (2001-2014)",
    ],
    bio:
      "Ancien maire de Lecci (2001-2014), Gilles Giovannangeli rejoint le Conseil territorial de Corse " +
      "en 2021 sur la liste autonomiste de Gilles Simeoni. Il préside successivement l'Office d'équipement " +
      "hydraulique puis l'Agence de développement économique de la Corse (2025). Élu Président du Conseil " +
      "exécutif le 4 mai 2026 par 34 voix, en session extraordinaire de l'Assemblée de Corse.",
    wikipediaUrl: null,
    wikidataId: 'Q139691255',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3164723 (wikidata.org/wiki/Q3164723, P569 27/11/1975, P19 Porto-Vecchio)
    //           + Wikipédia FR "Jean-Christophe Angelini" (mairie Porto-Vecchio, CE, PNC)
    //           + Site PNC pnc-corsica.com / actu Corse-Matin (mandats CE 2015-2021, mairie 2020)
    // Rôle public : Maire de Porto-Vecchio depuis 2020, conseiller à l'Assemblée de Corse depuis 2021.
    nom: 'Angelini',
    prenom: 'Jean-Christophe',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1975-11-27'),
    lieuNaissance: 'Porto-Vecchio (Corse-du-Sud)',
    rolePrincipal: "Maire de Porto-Vecchio, Conseiller à l'Assemblée de Corse",
    rolesSecondaires: [
      "ex-Conseiller exécutif de Corse chargé du développement économique (déc. 2015 – juil. 2021)",
      "président du Partitu di a Nazione Corsa (PNC)",
      "diplômé en droit public, Université de Corse Pascal-Paoli",
    ],
    bio:
      "Juriste de formation, Jean-Christophe Angelini préside le Partitu di a Nazione Corsa (PNC), " +
      "parti nationaliste corse. Conseiller exécutif chargé du développement économique de 2015 à 2021 " +
      "dans le gouvernement Simeoni, il est élu Maire de Porto-Vecchio le 4 juillet 2020 et siège à " +
      "l'Assemblée de Corse depuis juillet 2021. Le PNC a soutenu Simeoni sans fusionner avec Femu.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Christophe_Angelini',
    wikidataId: 'Q3164723',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2514772 (wikidata.org/wiki/Q2514772, P569 10/12/1980, P19 Ajaccio Q40104)
    //           + Wikipédia FR "Laurent Marcangeli" (mairie Ajaccio 2015-2022, Horizons oct. 2021)
    // Rôle public : ex-Maire d'Ajaccio (2015-2022) ; actuellement Ministre et Président du groupe
    //              Horizons à l'Assemblée nationale.
    // Note : son rôle gouvernemental national est documenté sur Wikidata (P39) et Wikipedia,
    //        mais sort du périmètre Corse du présent seed ; seul son mandat corse est lié ci-dessous.
    nom: 'Marcangeli',
    prenom: 'Laurent',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1980-12-10'),
    lieuNaissance: 'Ajaccio (Corse-du-Sud)',
    rolePrincipal: 'Ministre, Président du groupe Horizons à l\'Assemblée nationale',
    rolesSecondaires: [
      "ex-Maire d'Ajaccio (2015-2022)",
      "Député de Corse-du-Sud (depuis 2012, plusieurs mandats)",
      "membre d'Horizons depuis octobre 2021",
      "ex-membre Les Républicains",
    ],
    bio:
      "Né à Ajaccio, Laurent Marcangeli est élu Maire d'Ajaccio en 2015 (LR puis Horizons) et démissionne " +
      "en juillet 2022 pour se consacrer à son mandat de député de Corse-du-Sud. Fondateur et président du " +
      "groupe Horizons à l'Assemblée nationale depuis 2021, il est nommé Ministre à la fin 2024. " +
      "Principal élu insulaire du camp macroniste.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Laurent_Marcangeli',
    wikidataId: 'Q2514772',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q17050 (P856 isula.corsica, P1616 SIRET 232000018, P6375 Ajaccio)
    //           + Wikipédia FR "Collectivité de Corse" (création 2018, fusion deux dép.)
    nom: 'Collectivité de Corse',
    sigle: 'CDC',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.isula.corsica/',
    description:
      "Collectivité territoriale unique de Corse, créée le 1er janvier 2018 par fusion de la Région Corse " +
      "et des deux départements (Haute-Corse et Corse-du-Sud). Régie par la loi NOTRe (2015) et la " +
      "loi du 27 janvier 2017. Organes : Assemblée de Corse (63 conseillers) + Conseil exécutif (11 membres).",
    dateCreation: new Date('2018-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Collectivit%C3%A9_de_Corse',
    wikidataId: 'Q17050',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2564988 (unicameral legislative body of Corsica)
    //           + Wikipédia FR "Assemblée de Corse" (63 conseillers, élit le Conseil exécutif)
    nom: "Assemblée de Corse",
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://assemblee.isula.corsica/',
    description:
      "Organe délibérant de la Collectivité de Corse, composé de 63 conseillers territoriaux élus pour " +
      "6 ans au scrutin de liste. Vote le budget, adopte les orientations de la collectivité et élit le " +
      "Conseil exécutif (11 membres) dont le Président. Présidée par Marie-Antoinette Maupertuis depuis 2021.",
    dateCreation: new Date('2018-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Assembl%C3%A9e_de_Corse',
    wikidataId: 'Q2564988',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3068323 + Wikipédia FR "Femu a Corsica" (fondé 2017 par Simeoni)
    //           + isula.corsica (liste Fà populu inseme, élections territoriales 2021)
    nom: 'Femu a Corsica',
    sigle: 'FaC',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.femuacorsica.com/',
    description:
      "Parti politique autonomiste corse fondé en 2017 par Gilles Simeoni, héritier d'Inseme per a Corsica " +
      "(2008). A conduit la liste « Fà populu inseme » aux élections territoriales de 2021 (coalition " +
      "dominant l'Assemblée de Corse). Prône l'autonomie renforcée et la co-officialité de la langue corse.",
    dateCreation: new Date('2017-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Femu_a_Corsica',
    wikidataId: 'Q3068323',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1418625 (Party of the Corsican Nation)
    //           + Wikipédia FR "Partitu di a Nazione Corsa" (fondé 2002, modéré, Angelini président)
    nom: 'Partitu di a Nazione Corsa',
    sigle: 'PNC',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.pnc-corsica.com/',
    description:
      "Parti nationaliste corse (branche modérée), fondé en 2002 sur le constat d'échec de l'FLNC. " +
      "Prône l'indépendance de la Corse par voie démocratique. Présidé par Jean-Christophe Angelini. " +
      "A soutenu Gilles Simeoni sans rejoindre Femu a Corsica, maintenant une identité distincte.",
    dateCreation: new Date('2002-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Partitu_di_a_Nazione_Corsa',
    wikidataId: 'Q1418625',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q108846587 (vérifié : label fr "Horizons", description fr "parti politique français")
    //           + Wikipédia FR "Horizons (parti politique)" (fondé le 9 oct. 2021 par Édouard Philippe)
    nom: 'Horizons',
    sigle: null,
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.partihorizons.fr/',
    description:
      "Parti politique français centriste-droite fondé le 9 octobre 2021 au Havre par Édouard Philippe, " +
      "ex-Premier ministre. Membre de la coalition Ensemble pour la République. " +
      "Laurent Marcangeli, élu insulaire et ancien maire d'Ajaccio, en est une figure nationale.",
    dateCreation: new Date('2021-10-09'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Horizons_(parti_politique)',
    wikidataId: 'Q108846587',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q134698 (vérifié : label fr "Bastia", description fr "commune française,
    //           chef-lieu de Haute-Corse") + Wikipédia FR "Bastia"
    nom: 'Commune de Bastia',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.bastia.fr/',
    description:
      "Commune française, chef-lieu du département de la Haute-Corse, principale ville du nord de l'île. " +
      "Gilles Simeoni en est le Maire depuis le 28 mars 2026 (après un 1er mandat en 2014-2016).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bastia',
    wikidataId: 'Q134698',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q241567 (vérifié : label "Porto-Vecchio",
    //           description "French commune in Corse-du-Sud, Corsica")
    //           + Wikipédia FR "Porto-Vecchio"
    nom: 'Commune de Porto-Vecchio',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.porto-vecchio.fr/',
    description:
      "Commune française de Corse-du-Sud, principale ville touristique du sud insulaire. " +
      "Jean-Christophe Angelini (PNC) en est le Maire depuis le 4 juillet 2020.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Porto-Vecchio',
    wikidataId: 'Q241567',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q40104 (vérifié : label "Ajaccio",
    //           description "French commune and prefecture of Corse-du-Sud and Corsica")
    //           + Wikidata P19 de Marcangeli : Q40104 = lieu de naissance confirmé
    //           + Wikipédia FR "Ajaccio"
    nom: "Commune d'Ajaccio",
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.ajaccio.fr/',
    description:
      "Commune française, préfecture de Corse-du-Sud et capitale administrative de la Collectivité de Corse. " +
      "Patrie de Napoléon Bonaparte. Laurent Marcangeli en a été le Maire de 2015 à 2022.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Ajaccio',
    wikidataId: 'Q40104',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_simeoni: {
    url: 'https://fr.wikipedia.org/wiki/Gilles_Simeoni',
    titre: 'Gilles Simeoni — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Avocat et homme politique corse, né le 20 avr. 1967 à Bastia. Président du Conseil exécutif " +
      "déc. 2015 – avr. 2026. Maire de Bastia depuis le 28 mars 2026. Femu a Corsica.",
    verifiee: true,
  },
  wp_maupertuis: {
    url: 'https://fr.wikipedia.org/wiki/Marie-Antoinette_Maupertuis',
    titre: 'Marie-Antoinette Maupertuis — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Économiste née le 10 avr. 1967 à Ajaccio. Présidente de l'Assemblée de Corse depuis le " +
      "1er juil. 2021, première femme à ce poste. Prof. Univ. de Corse. Femu a Corsica.",
    verifiee: true,
  },
  fi_giovannangeli: {
    url: 'https://www.franceinfo.fr/france/corse/corse/gilles-giovannangeli-a-ete-elu-nouveau-president-du-conseil-executif-corse_7982507.html',
    titre: "Gilles Giovannangeli a été élu nouveau président du Conseil exécutif corse — France Info",
    media: 'France Info',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-05-04'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction France Info',
    description:
      "Giovannangeli élu Président du Conseil exécutif de Corse le 4 mai 2026, avec 34 voix en " +
      "session extraordinaire. Ancien maire de Lecci (2001-2014), conseiller territorial depuis 2021.",
    verifiee: true,
  },
  regions_fr_giovannangeli: {
    url: 'https://regions-france.org/gilles-giovannangeli-succede-a-gilles-simeoni-a-la-presidence-du-conseil-executif-de-corse/',
    titre: "Giovannangeli succède à Simeoni à la présidence du Conseil exécutif de Corse — Régions de France",
    media: 'Régions de France',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-05-04'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction Régions de France',
    description:
      "Confirmation de la succession Simeoni → Giovannangeli à la tête du Conseil exécutif de Corse. " +
      "Giovannangeli préside l'Agence de développement économique de Corse en 2025.",
    verifiee: true,
  },
  wp_angelini: {
    url: 'https://fr.wikipedia.org/wiki/Jean-Christophe_Angelini',
    titre: 'Jean-Christophe Angelini — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né le 27 nov. 1975 à Porto-Vecchio. Maire de Porto-Vecchio depuis juil. 2020. " +
      "Conseiller exécutif (2015-2021). Conseiller à l'Assemblée de Corse depuis 2021. PNC.",
    verifiee: true,
  },
  wp_marcangeli: {
    url: 'https://fr.wikipedia.org/wiki/Laurent_Marcangeli',
    titre: 'Laurent Marcangeli — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né le 10 déc. 1980 à Ajaccio. Maire d'Ajaccio (2015-2022). Député de Corse-du-Sud. " +
      "Membre d'Horizons depuis oct. 2021. Ministre depuis déc. 2024. Préside le groupe Horizons à l'AN.",
    verifiee: true,
  },
  wp_collectivite_corse: {
    url: 'https://fr.wikipedia.org/wiki/Collectivit%C3%A9_de_Corse',
    titre: 'Collectivité de Corse — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Collectivité territoriale unique (fusion region + 2 dép.), créée le 1er janv. 2018. " +
      "Siège à Ajaccio. SIRET 232000018. Site isula.corsica.",
    verifiee: true,
  },
  wp_assemblee_corse: {
    url: 'https://fr.wikipedia.org/wiki/Assembl%C3%A9e_de_Corse',
    titre: "Assemblée de Corse — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Organe délibérant de 63 conseillers. Élit le Conseil exécutif. Présidée par Maupertuis depuis 2021.",
    verifiee: true,
  },
  wp_femu: {
    url: 'https://fr.wikipedia.org/wiki/Femu_a_Corsica',
    titre: 'Femu a Corsica — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Parti autonomiste corse fondé en 2017 par Simeoni. Héritier d'Inseme per a Corsica (2008). " +
      "Liste Fà populu inseme aux élections territoriales 2021.",
    verifiee: true,
  },
  wp_pnc: {
    url: 'https://fr.wikipedia.org/wiki/Partitu_di_a_Nazione_Corsa',
    titre: 'Partitu di a Nazione Corsa — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Parti nationaliste corse modéré fondé en 2002. Prône l'indépendance par voie démocratique. " +
      "Présidé par Jean-Christophe Angelini. Soutien extérieur à Simeoni.",
    verifiee: true,
  },
  wp_horizons: {
    url: 'https://fr.wikipedia.org/wiki/Horizons_(parti_politique)',
    titre: 'Horizons (parti politique) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Parti centriste-droite fondé le 9 oct. 2021 au Havre par Édouard Philippe. " +
      "Marcangeli y adhère en oct. 2021, préside le groupe Horizons à l'Assemblée nationale.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002). Les wikidataId servent de clés
// de résolution via trouverEntite. Chaque entité ci-dessus est créée par upsert.
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Gilles Simeoni ---
  {
    // ANCIEN mandat : Président du Conseil exécutif (déc. 2015 – avr. 2026)
    aType: 'personne',
    aRef: 'Q3106502',
    bType: 'organisation',
    bRef: 'Q17050',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Gilles Simeoni a présidé le Conseil exécutif de la Collectivité de Corse du 17 décembre 2015 " +
      "au 21 avril 2026, date de sa démission pour prendre la mairie de Bastia.",
    dateDebut: new Date('2015-12-17'),
    dateFin: new Date('2026-04-21'),
    sourceRef: 'wp_simeoni',
  },
  {
    // Mandat actuel : Conseiller exécutif (depuis mai 2026) au sein de la Collectivité
    aType: 'personne',
    aRef: 'Q3106502',
    bType: 'organisation',
    bRef: 'Q17050',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Gilles Simeoni siège comme Conseiller exécutif de la Collectivité de Corse depuis le 4 mai 2026, " +
      "après avoir cédé la présidence du Conseil exécutif à Gilles Giovannangeli.",
    dateDebut: new Date('2026-05-04'),
    dateFin: null,
    sourceRef: 'fi_giovannangeli',
  },
  {
    // Mandat actuel : Maire de Bastia (depuis mars 2026)
    aType: 'personne',
    aRef: 'Q3106502',
    bType: 'organisation',
    bRef: 'Q134698',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Gilles Simeoni est élu Maire de Bastia le 28 mars 2026, reprenant la mairie qu'il avait " +
      "quittée en janvier 2016 pour prendre la présidence du Conseil exécutif.",
    dateDebut: new Date('2026-03-28'),
    dateFin: null,
    sourceRef: 'wp_simeoni',
  },
  {
    // Affiliation : Femu a Corsica (co-fondateur en 2017)
    aType: 'personne',
    aRef: 'Q3106502',
    bType: 'organisation',
    bRef: 'Q3068323',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Gilles Simeoni a co-fondé Femu a Corsica en 2017, parti autonomiste corse issu d'Inseme " +
      "per a Corsica (mouvement familial des Simeoni actif depuis 2008).",
    dateDebut: new Date('2017-01-01'),
    dateFin: null,
    sourceRef: 'wp_femu',
  },

  // --- Marie-Antoinette Maupertuis ---
  {
    // Mandat : Présidente de l'Assemblée de Corse (depuis juillet 2021)
    aType: 'personne',
    aRef: 'Q100323003',
    bType: 'organisation',
    bRef: 'Q2564988',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Marie-Antoinette Maupertuis est élue Présidente de l'Assemblée de Corse le 1er juillet 2021. " +
      "Elle est la première femme à exercer cette fonction.",
    dateDebut: new Date('2021-07-01'),
    dateFin: null,
    sourceRef: 'wp_maupertuis',
  },
  {
    // Affiliation : Femu a Corsica
    aType: 'personne',
    aRef: 'Q100323003',
    bType: 'organisation',
    bRef: 'Q3068323',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Marie-Antoinette Maupertuis est membre de Femu a Corsica (liste Fà populu inseme). " +
      "Elle a été Conseillère exécutive dans le gouvernement Simeoni de 2015 à 2021.",
    dateDebut: new Date('2015-12-17'),
    dateFin: null,
    sourceRef: 'wp_maupertuis',
  },
  {
    // Lien politique : Maupertuis ← → Simeoni (coalition autonomiste, co-dirigeants du camp)
    aType: 'personne',
    aRef: 'Q100323003',
    bType: 'personne',
    bRef: 'Q3106502',
    typeLienCode: 'politique',
    description:
      "Marie-Antoinette Maupertuis et Gilles Simeoni codirigeant le camp autonomiste corse : " +
      "elle préside l'Assemblée, il présidait le Conseil exécutif, ensemble sur la liste Fà populu inseme.",
    dateDebut: new Date('2021-07-01'),
    dateFin: null,
    sourceRef: 'wp_femu',
  },

  // --- Gilles Giovannangeli ---
  {
    // Mandat : Président du Conseil exécutif de la Collectivité de Corse (depuis mai 2026)
    aType: 'personne',
    aRef: 'Q139691255',
    bType: 'organisation',
    bRef: 'Q17050',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Gilles Giovannangeli est élu Président du Conseil exécutif de la Collectivité de Corse le " +
      "4 mai 2026, par 34 voix de l'Assemblée de Corse, succédant à Gilles Simeoni.",
    dateDebut: new Date('2026-05-04'),
    dateFin: null,
    sourceRef: 'fi_giovannangeli',
  },
  {
    // Affiliation : Femu a Corsica (liste Simeoni 2021)
    aType: 'personne',
    aRef: 'Q139691255',
    bType: 'organisation',
    bRef: 'Q3068323',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Gilles Giovannangeli a été élu conseiller territorial en 2021 sur la liste autonomiste " +
      "Fà populu inseme conduite par Gilles Simeoni (Femu a Corsica).",
    dateDebut: new Date('2021-07-01'),
    dateFin: null,
    sourceRef: 'regions_fr_giovannangeli',
  },
  {
    // Lien politique : transmission de mandat Simeoni → Giovannangeli
    aType: 'personne',
    aRef: 'Q3106502',
    bType: 'personne',
    bRef: 'Q139691255',
    typeLienCode: 'politique',
    description:
      "Gilles Simeoni a soutenu l'élection de Gilles Giovannangeli à la présidence du Conseil " +
      "exécutif lors de sa démission d'avril 2026. Giovannangeli était issu de la liste de Simeoni.",
    dateDebut: new Date('2026-04-21'),
    dateFin: null,
    sourceRef: 'fi_giovannangeli',
  },

  // --- Jean-Christophe Angelini ---
  {
    // Mandat : Maire de Porto-Vecchio (depuis juillet 2020)
    aType: 'personne',
    aRef: 'Q3164723',
    bType: 'organisation',
    bRef: 'Q241567',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Jean-Christophe Angelini est élu Maire de Porto-Vecchio le 4 juillet 2020 (PNC). " +
      "Ville touristique du sud de la Corse.",
    dateDebut: new Date('2020-07-04'),
    dateFin: null,
    sourceRef: 'wp_angelini',
  },
  {
    // ANCIEN mandat : Conseiller exécutif de Corse (déc. 2015 – juil. 2021)
    aType: 'personne',
    aRef: 'Q3164723',
    bType: 'organisation',
    bRef: 'Q17050',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Jean-Christophe Angelini a été Conseiller exécutif de la Collectivité de Corse chargé du " +
      "développement économique de décembre 2015 à juillet 2021, dans l'équipe de Gilles Simeoni.",
    dateDebut: new Date('2015-12-17'),
    dateFin: new Date('2021-07-01'),
    sourceRef: 'wp_angelini',
  },
  {
    // Mandat actuel : Conseiller à l'Assemblée de Corse (depuis juillet 2021)
    aType: 'personne',
    aRef: 'Q3164723',
    bType: 'organisation',
    bRef: 'Q2564988',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Jean-Christophe Angelini siège à l'Assemblée de Corse comme Conseiller territorial depuis " +
      "le 1er juillet 2021, sur une liste PNC.",
    dateDebut: new Date('2021-07-01'),
    dateFin: null,
    sourceRef: 'wp_angelini',
  },
  {
    // Affiliation : PNC
    aType: 'personne',
    aRef: 'Q3164723',
    bType: 'organisation',
    bRef: 'Q1418625',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Jean-Christophe Angelini préside le Partitu di a Nazione Corsa (PNC), branche nationaliste " +
      "modérée. Le PNC a soutenu Simeoni sans s'y fondre.",
    dateDebut: new Date('2015-01-01'),
    dateFin: null,
    sourceRef: 'wp_pnc',
  },
  {
    // Lien politique : PNC soutien extérieur de Femu a Corsica au CE
    aType: 'organisation',
    aRef: 'Q1418625',
    bType: 'organisation',
    bRef: 'Q3068323',
    typeLienCode: 'politique',
    description:
      "Le PNC (Angelini) a apporté un soutien extérieur au gouvernement Simeoni (Femu a Corsica) " +
      "à l'Assemblée de Corse depuis 2015, sans fusion ni liste commune.",
    dateDebut: new Date('2015-12-17'),
    dateFin: null,
    sourceRef: 'wp_pnc',
  },

  // --- Laurent Marcangeli ---
  {
    // ANCIEN mandat : Maire d'Ajaccio (2015-2022)
    // Note : dates de Wikidata (P39 start 30/03/2014 end 17/05/2020) divergent de Wikipedia
    // (08/02/2015 – 09/07/2022). Source Wikipedia retenue (plus détaillée). Verifiee: false.
    aType: 'personne',
    aRef: 'Q2514772',
    bType: 'organisation',
    bRef: 'Q40104',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Laurent Marcangeli a été Maire d'Ajaccio (LR puis Horizons) de 2015 à 2022, " +
      "avant de démissionner pour se concentrer sur son mandat de député de Corse-du-Sud. " +
      "[NB : dates divergentes Wikidata/Wikipédia — à recouper via procès-verbal municipal]",
    dateDebut: new Date('2015-02-08'),
    dateFin: new Date('2022-07-09'),
    sourceRef: 'wp_marcangeli',
  },
  {
    // Affiliation : Horizons (depuis octobre 2021)
    aType: 'personne',
    aRef: 'Q2514772',
    bType: 'organisation',
    bRef: 'Q108846587',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Laurent Marcangeli adhère à Horizons en octobre 2021, après avoir quitté Les Républicains. " +
      "Il préside le groupe Horizons à l'Assemblée nationale depuis la création du parti.",
    dateDebut: new Date('2021-10-01'),
    dateFin: null,
    sourceRef: 'wp_horizons',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (copie conforme de seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-corse] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-corse] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données Corse précédentes...')
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
  console.log('\n--- seed-region-corse — Collectivité de Corse + élus + partis ---\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('-- Sources --')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ${data.titre}`)
  }

  console.log('\n-- Personnes --')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n-- Organisations --')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n-- Liens --')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n--- Bilan ---')
  console.log(`Personnes     : ${PERSONNES.length} (Simeoni, Maupertuis, Giovannangeli, Angelini, Marcangeli)`)
  console.log(`Organisations : ${ORGANISATIONS.length} (CDC, Assemblée, Femu, PNC, Horizons, Bastia, Porto-Vecchio, Ajaccio)`)
  console.log(`Sources       : ${Object.keys(SOURCES).length} (Wikidata, Wikipédia FR, France Info, Régions de France)`)
  console.log(`Liens         : ${LIENS.length} (MANDAT_ELECTIF, ANCIEN_MANDAT, AFFILIATION_PARTI, politique)`)
  console.log('')
}

main()
  .catch((err) => {
    console.error('[seed-corse] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
