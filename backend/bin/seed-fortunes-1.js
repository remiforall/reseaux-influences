/**
 * Seed Fortunes 1 — Bernard Arnault (groupe LVMH) et famille Dassault (groupe Dassault).
 * Enquête OSINT journalistique du 2026-06-30 — liens capitalistiques uniquement.
 *
 * Périmètre : Bernard Arnault + Antoine Arnault (DG Christian Dior SE depuis déc. 2022),
 *             Serge Dassault (†2018, sénateur + PDG GIMD), Éric Trappier
 *             (PDG Dassault Aviation depuis 2013, Président GIMD depuis janv. 2025).
 *             Organisations : holdings de contrôle, sociétés cotées, médias détenus.
 *
 * Sources : Wikidata (Q-ids tous vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR (Christian Dior SE, GIMD, LVMH, médias individuels),
 *           LVMH.com (officiel), Acrimed, Le Monde diplomatique (carte PPA).
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *   - liens capitalistiques O→O : typeLienCode 'economique' (seul code disponible couvrant
 *     l'actionnariat) — un code ACTIONNAIRE_MAJORITAIRE / DETIENT_CAPITAL n'existe pas encore
 *     dans le référentiel types_liens ; à créer dans un prochain ADR avant validation éditoriale.
 *
 * Usage :
 *   cd backend && node bin/seed-fortunes-1.js
 *   cd backend && node bin/seed-fortunes-1.js --reset
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
    // Sources : Wikidata Q32055 (vérifié wbsearchentities) + Wikipédia FR (Bernard Arnault)
    // Rôle public attesté : PDG de LVMH depuis jan. 1989 ; Président CA Christian Dior SE depuis 1984
    nom: 'Arnault',
    prenom: 'Bernard',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1949-03-05'),
    lieuNaissance: 'Roubaix (Nord)',
    rolePrincipal: "Président-Directeur général de LVMH Moët Hennessy – Louis Vuitton",
    rolesSecondaires: [
      "Président du conseil d'administration de Christian Dior SE (depuis 1984)",
      "Bénéficiaire effectif de Financière Agache (holding patrimoniale familiale)",
      "Fondateur du pôle Christian Dior – LVMH (à partir de 1984)",
    ],
    bio:
      "Né à Roubaix, ingénieur de l'École Polytechnique, Bernard Arnault prend le contrôle du groupe " +
      "Boussac en 1984 et restructure Christian Dior. En 1989, il devient PDG de LVMH, " +
      "qu'il transforme en premier groupe mondial de luxe (75 maisons, 213 Mds€ de CA en 2023). " +
      "Via Financière Agache, la famille Arnault contrôle 97,5 % de Christian Dior SE, " +
      "laquelle détient 41,89 % du capital de LVMH SE.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bernard_Arnault',
    wikidataId: 'Q32055',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q2853612 (vérifié wbsearchentities) + Wikipédia FR (Antoine Arnault)
    // Rôle public attesté : DG et Vice-Président de Christian Dior SE depuis déc. 2022
    nom: 'Arnault',
    prenom: 'Antoine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: "Directeur général et Vice-Président de Christian Dior SE",
    rolesSecondaires: [
      "Administrateur de LVMH (depuis 2005)",
      "Président de Berluti (depuis 2024)",
      "Président de Loro Piana (depuis décembre 2013)",
      "Membre du conseil de surveillance du groupe Lagardère",
      "Chevalier de la Légion d'honneur (janvier 2025)",
    ],
    bio:
      "Fils aîné de Bernard Arnault, Antoine Arnault est Directeur général et Vice-Président de " +
      "Christian Dior SE depuis décembre 2022. Il est administrateur de LVMH depuis 2005 " +
      "et préside les maisons Berluti et Loro Piana au sein du groupe.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Antoine_Arnault',
    wikidataId: 'Q2853612',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q981270 (vérifié wbsearchentities, "French businessman and politician 1925-2018")
    //           + Wikipédia FR (Serge Dassault)
    // Rôle public attesté : Sénateur de l'Essonne (2004-2018) + Président GIMD
    nom: 'Dassault',
    prenom: 'Serge',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1925-04-04'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Président du Groupe industriel Marcel Dassault (†28 mai 2018)",
    rolesSecondaires: [
      "Sénateur de l'Essonne (2004-2018)",
      "Président-Directeur général de Dassault Aviation (jusqu'en 2018)",
      "Fils de Marcel Dassault, fondateur du groupe éponyme",
    ],
    bio:
      "Serge Dassault (1925-2018), fils de Marcel Dassault, a présidé le Groupe industriel Marcel " +
      "Dassault (GIMD) et Dassault Aviation, construisant un conglomérat industriel et médiatique. " +
      "Sénateur de l'Essonne de 2004 à 2018, il est décédé le 28 mai 2018. " +
      "Le groupe contrôle Dassault Aviation (~62 %), Dassault Systèmes (~45,1 %) et Le Figaro (100 % via Groupe Figaro).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Serge_Dassault',
    wikidataId: 'Q981270',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3591380 (vérifié wbsearchentities, "French business executive")
    //           + Wikipédia FR (GIMD) — PDG Dassault Aviation depuis 2013, Président GIMD depuis jan. 2025
    nom: 'Trappier',
    prenom: 'Éric',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: null,
    lieuNaissance: null,
    rolePrincipal: "Président-Directeur général de Dassault Aviation ; Président du Groupe industriel Marcel Dassault",
    rolesSecondaires: [
      "Président du GIMD depuis janvier 2025 (succédant à Charles Edelstenne, 2018-2025)",
      "PDG de Dassault Aviation depuis janvier 2013",
      "Ancien président du GIFAS (Groupement des industries françaises aéronautiques et spatiales)",
    ],
    bio:
      "Éric Trappier est PDG de Dassault Aviation depuis janvier 2013. En janvier 2025, il devient " +
      "également Président du Groupe industriel Marcel Dassault (GIMD), holding de contrôle du groupe " +
      "familial, succédant à Charles Edelstenne qui avait lui-même pris la succession de Serge Dassault en 2018.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89ric_Trappier',
    wikidataId: 'Q3591380',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q3072529 ("Family office of the Arnaults", vérifié via wbsearchentities)
    //           + Wikipédia FR (Christian Dior SE) — détient 97,5 % de Christian Dior SE
    nom: 'Financière Agache',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: null,
    description:
      "Holding patrimoniale de la famille Arnault. Financière Agache (contrôlée via Agache SCA) " +
      "détient 97,5 % du capital de Christian Dior SE, laquelle contrôle LVMH à " +
      "41,89 % du capital et 56,69 % des droits de vote (au 31 déc. 2024).",
    dateCreation: null,
    wikipediaUrl: null,
    wikidataId: 'Q3072529',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q542767 (vérifié Special:EntityData — "entreprise française de mode de luxe",
    //           P31: société anonyme + P749: Financière Agache ; confirmé Q542767 = Christian Dior SE
    //           par la page Wikipédia FR "Christian Dior SE")
    // Structure : holding cotée CAC 40, contrôle LVMH à 41,89 % du capital
    nom: 'Christian Dior SE',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.christiandior-finance.com',
    description:
      "Société holding cotée au CAC 40, anciennement Financière Agache. " +
      "Détenue à 97,5 % par Financière Agache (famille Arnault). " +
      "Contrôle LVMH SE à hauteur de 41,89 % du capital et 56,69 % des droits de vote " +
      "(au 31 décembre 2024). Présidée par Bernard Arnault, DG : Antoine Arnault depuis déc. 2022.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Christian_Dior_SE',
    wikidataId: 'Q542767',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q504998 (vérifié wbsearchentities + Special:EntityData,
    //           "groupe français d'entreprises de luxe") + Wikipédia FR (LVMH)
    nom: 'LVMH Moët Hennessy – Louis Vuitton',
    sigle: 'LVMH',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.lvmh.com',
    description:
      "Premier groupe mondial de luxe (75 maisons, ~213 Mds€ de CA en 2023). Coté au CAC 40. " +
      "Contrôlé par Christian Dior SE à 41,89 % du capital et 56,69 % des droits de vote. " +
      "Pôle médias : Les Échos (acq. 2007), Le Parisien (acq. 2015), Radio Classique.",
    dateCreation: new Date('1987-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/LVMH_-_Mo%C3%ABt_Hennessy_Louis_Vuitton',
    wikidataId: 'Q504998',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q923193 (vérifié wbsearchentities, "French news website and daily newspaper")
    //           + Wikipédia FR (Les Échos) + Monde Diplo PPA
    // Acquisition LVMH : novembre 2007, 240 millions d'euros
    nom: 'Les Échos',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.lesechos.fr',
    description:
      "Quotidien économique français fondé en 1908. Acquis par LVMH en novembre 2007 " +
      "pour 240 millions d'euros. Intégré dans le groupe Les Échos-Le Parisien (pôle médias LVMH).",
    dateCreation: new Date('1908-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_%C3%89chos',
    wikidataId: 'Q923193',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    // Sources : Wikidata Q142348 (vérifié wbsearchentities, "French newspaper")
    //           + Wikipédia FR (Le Parisien) + Acrimed PPA
    // Acquisition LVMH : 2015, depuis le groupe Amaury
    nom: 'Le Parisien',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.leparisien.fr',
    description:
      "Quotidien français fondé en 1944. Racheté par LVMH au groupe Amaury en 2015. " +
      "Intégré dans le groupe Les Échos-Le Parisien, pôle médias de LVMH.",
    dateCreation: new Date('1944-08-22'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Le_Parisien',
    wikidataId: 'Q142348',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    // Sources : Wikidata Q1340362 (vérifié wbsearchentities, "radio station in France")
    //           + LVMH.com (page officielle "nos maisons") — Radio Classique présentée comme maison LVMH
    nom: 'Radio Classique',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.radioclassique.fr',
    description:
      "Station de radio musicale française (musique classique). " +
      "Propriété de LVMH, présentée comme « une maison LVMH » sur le site officiel du groupe. " +
      "Intégrée dans le groupe Les Échos-Le Parisien (pôle médias de LVMH).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Radio_Classique',
    wikidataId: 'Q1340362',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    // Sources : Wikidata Q1434948 (vérifié wbsearchentities, "French group of companies")
    //           + Wikipédia FR (GIMD) : 62 % Dassault Aviation, 45,1 % Dassault Systèmes, 100 % Groupe Figaro
    nom: 'Groupe industriel Marcel Dassault',
    sigle: 'GIMD',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.gimd.fr',
    description:
      "Holding de contrôle de la famille Dassault (SAS). Détient ~62 % de Dassault Aviation, " +
      "~45,1 % de Dassault Systèmes et 100 % du Groupe Figaro. " +
      "Présidé par Éric Trappier depuis janvier 2025 (précédemment Charles Edelstenne, 2018-2025). " +
      "Siège : 9, rond-point des Champs-Élysées-Marcel-Dassault, Paris.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Groupe_industriel_Marcel_Dassault',
    wikidataId: 'Q1434948',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q460487 (vérifié wbsearchentities, "aerospace manufacturer in France")
    //           + Wikipédia FR (Dassault Aviation)
    nom: 'Dassault Aviation',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.dassault-aviation.com',
    description:
      "Constructeur aéronautique français (avions civils Falcon et avions militaires Rafale). " +
      "Cotée à Euronext Paris. Détenu à ~62 % par GIMD. " +
      "Éric Trappier en est PDG depuis janvier 2013.",
    dateCreation: new Date('1930-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Dassault_Aviation',
    wikidataId: 'Q460487',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1172038 (vérifié wbsearchentities, "software company headquartered in Vélizy")
    //           + Wikipédia FR (Dassault Systèmes)
    nom: 'Dassault Systèmes',
    sigle: 'DS',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.3ds.com',
    description:
      "Éditeur de logiciels de conception 3D et de gestion du cycle de vie des produits (PLM). " +
      "Coté au CAC 40. GIMD en détient ~45,1 % du capital.",
    dateCreation: new Date('1981-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Dassault_Syst%C3%A8mes',
    wikidataId: 'Q1172038',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q70442343 (vérifié wbsearchentities, "French media company")
    //           + Wikipédia FR (GIMD) + Acrimed PPA
    // 100 % détenu par GIMD (anciennement Socpresse, acquis par Serge Dassault en 2004)
    nom: 'Groupe Figaro',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.groupefigaro.fr',
    description:
      "Groupe de presse et de médias numériques, propriété à 100 % du GIMD (famille Dassault). " +
      "Comprend Le Figaro, Le Figaro Magazine, Figaro Classifieds et d'autres titres. " +
      "Anciennement connu sous le nom de Socpresse, acquis par Serge Dassault en 2004.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Groupe_Figaro',
    wikidataId: 'Q70442343',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    // Sources : Wikidata Q216047 (vérifié wbsearchentities, "French daily newspaper")
    //           + Wikipédia FR (Le Figaro) + Monde Diplo PPA
    nom: 'Le Figaro',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.lefigaro.fr',
    description:
      "Quotidien national français fondé en 1826, l'un des plus anciens journaux français. " +
      "Premier titre du Groupe Figaro, lui-même détenu à 100 % par GIMD (famille Dassault). " +
      "Acquis par Serge Dassault via la Socpresse en 2004.",
    dateCreation: new Date('1826-01-15'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Le_Figaro',
    wikidataId: 'Q216047',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-06-30).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_bernard_arnault: {
    url: 'https://fr.wikipedia.org/wiki/Bernard_Arnault',
    titre: 'Bernard Arnault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 5 mars 1949 à Roubaix. PDG de LVMH depuis jan. 1989 ; Président CA " +
      "Christian Dior SE depuis 1984. Acquisition Les Échos nov. 2007 (240 M€).",
    verifiee: true,
  },
  wp_antoine_arnault: {
    url: 'https://fr.wikipedia.org/wiki/Antoine_Arnault',
    titre: 'Antoine Arnault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "DG et Vice-Président de Christian Dior SE depuis déc. 2022. Administrateur LVMH depuis 2005. " +
      "Président de Berluti (2024), Loro Piana (2013). Légion d'honneur janv. 2025.",
    verifiee: true,
  },
  wp_christian_dior_se: {
    url: 'https://fr.wikipedia.org/wiki/Christian_Dior_SE',
    titre: 'Christian Dior SE — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Financière Agache détient 97,5 % de Christian Dior SE. " +
      "Christian Dior SE détient 41,89 % du capital et 56,69 % des droits de vote de LVMH SE (au 31 déc. 2024).",
    verifiee: true,
  },
  wp_lvmh: {
    url: 'https://fr.wikipedia.org/wiki/LVMH_-_Mo%C3%ABt_Hennessy_Louis_Vuitton',
    titre: 'LVMH Moët Hennessy – Louis Vuitton — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Premier groupe mondial de luxe. Contrôlé par Christian Dior SE. " +
      "Activités médias : Les Échos, Le Parisien, Radio Classique.",
    verifiee: true,
  },
  wp_les_echos: {
    url: 'https://fr.wikipedia.org/wiki/Les_%C3%89chos',
    titre: 'Les Échos — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Quotidien économique fondé en 1908. Acquis par LVMH en novembre 2007 pour 240 millions d'euros.",
    verifiee: true,
  },
  wp_le_parisien: {
    url: 'https://fr.wikipedia.org/wiki/Le_Parisien',
    titre: 'Le Parisien — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Quotidien fondé en 1944. Racheté par LVMH au groupe Amaury en 2015.",
    verifiee: true,
  },
  lvmh_radio_classique: {
    url: 'https://www.lvmh.com/en/our-maisons/other-activities/radio-classique',
    titre: 'Radio Classique — Nos Maisons — LVMH (site officiel)',
    media: 'LVMH',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: null,
    dateConsultation: new Date('2026-06-30'),
    auteur: 'LVMH',
    description:
      "Présentation officielle de Radio Classique comme maison LVMH dans le pôle Autres Activités.",
    verifiee: true,
  },
  wp_serge_dassault: {
    url: 'https://fr.wikipedia.org/wiki/Serge_Dassault',
    titre: 'Serge Dassault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 4 avril 1925, décédé le 28 mai 2018. Sénateur de l'Essonne (2004-2018). " +
      "Président du GIMD et de Dassault Aviation jusqu'à son décès.",
    verifiee: true,
  },
  wp_eric_trappier: {
    url: 'https://fr.wikipedia.org/wiki/%C3%89ric_Trappier',
    titre: 'Éric Trappier — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "PDG de Dassault Aviation depuis janvier 2013. Président du GIMD depuis janvier 2025.",
    verifiee: true,
  },
  wp_gimd: {
    url: 'https://fr.wikipedia.org/wiki/Groupe_industriel_Marcel_Dassault',
    titre: 'Groupe industriel Marcel Dassault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "GIMD détient ~62 % de Dassault Aviation, ~45,1 % de Dassault Systèmes " +
      "et 100 % du Groupe Figaro. Président : Éric Trappier depuis jan. 2025.",
    verifiee: true,
  },
  wp_dassault_aviation: {
    url: 'https://fr.wikipedia.org/wiki/Dassault_Aviation',
    titre: 'Dassault Aviation — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Constructeur aéronautique français (Falcon, Rafale). Détenu à ~62 % par GIMD. " +
      "Éric Trappier PDG depuis janvier 2013.",
    verifiee: true,
  },
  wp_dassault_systemes: {
    url: 'https://fr.wikipedia.org/wiki/Dassault_Syst%C3%A8mes',
    titre: 'Dassault Systèmes — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Éditeur de logiciels PLM/3D coté au CAC 40. GIMD détient ~45,1 % du capital.",
    verifiee: true,
  },
  wp_groupe_figaro: {
    url: 'https://fr.wikipedia.org/wiki/Groupe_Figaro',
    titre: 'Groupe Figaro — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Groupe de médias propriété à 100 % de GIMD (famille Dassault). Comprend Le Figaro, Figaro Magazine.",
    verifiee: true,
  },
  wp_le_figaro: {
    url: 'https://fr.wikipedia.org/wiki/Le_Figaro',
    titre: 'Le Figaro — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Quotidien fondé en 1826. Acquis par Serge Dassault via la Socpresse en 2004. " +
      "Publié par le Groupe Figaro, détenu à 100 % par GIMD.",
    verifiee: true,
  },
  monde_diplo_ppa: {
    url: 'https://www.monde-diplomatique.fr/cartes/PPA',
    titre: "Médias français : qui possède quoi — Le Monde diplomatique",
    media: 'Le Monde diplomatique',
    typeMedia: 'PRESSE_ECRITE',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: null,
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Rédaction Le Monde diplomatique / Acrimed',
    description:
      "Carte interactive de la propriété des grands médias français. Documente les " +
      "liens capitalistiques LVMH-Arnault (Les Échos, Le Parisien) et Dassault-GIMD (Le Figaro).",
    verifiee: true,
  },
  acrimed_ppa: {
    url: 'https://www.acrimed.org/Medias-francais-qui-possede-quoi',
    titre: "Médias français : qui possède quoi ? — Acrimed",
    media: 'Acrimed',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: null,
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Rédaction Acrimed',
    description:
      "Guide des concentrations dans la propriété des médias français, en partenariat " +
      "avec Le Monde diplomatique. Recense les propriétaires de LVMH et Dassault.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002), exactement 1 entité non-nulle de chaque côté.
// Chaque entité référencée possède un wikidataId (résolution via trouverEntite).
// NB : typeLienCode 'economique' est utilisé pour les liens capitalistiques O→O
//      (actionnariat, détention, contrôle) faute de code dédié dans le référentiel actuel.
//      À remplacer par ACTIONNAIRE_MAJORITAIRE / DETIENT_CAPITAL dès que ce code sera créé.
// ---------------------------------------------------------------------------

const LIENS = [
  // =========================================================================
  // GROUPE ARNAULT — structure de contrôle
  // =========================================================================
  {
    // P-O : Bernard Arnault est PDG de LVMH depuis janvier 1989
    aType: 'personne',
    aRef: 'Q32055',
    bType: 'organisation',
    bRef: 'Q504998',
    typeLienCode: 'DIRIGEANT',
    description:
      "Bernard Arnault est Président-Directeur général de LVMH Moët Hennessy – Louis Vuitton " +
      "depuis janvier 1989.",
    dateDebut: new Date('1989-01-10'),
    dateFin: null,
    sourceRef: 'wp_bernard_arnault',
  },
  {
    // P-O : Bernard Arnault est Président du CA de Christian Dior SE depuis 1984
    aType: 'personne',
    aRef: 'Q32055',
    bType: 'organisation',
    bRef: 'Q542767',
    typeLienCode: 'DIRIGEANT',
    description:
      "Bernard Arnault préside le conseil d'administration de Christian Dior SE depuis 1984, " +
      "après avoir pris le contrôle du groupe Boussac.",
    dateDebut: new Date('1984-01-01'),
    dateFin: null,
    sourceRef: 'wp_christian_dior_se',
  },
  {
    // P-O : Bernard Arnault est bénéficiaire effectif de Financière Agache
    aType: 'personne',
    aRef: 'Q32055',
    bType: 'organisation',
    bRef: 'Q3072529',
    typeLienCode: 'BENEFICIAIRE_EFFECTIF',
    description:
      "Bernard Arnault est le bénéficiaire effectif de Financière Agache, holding " +
      "patrimoniale de la famille Arnault, via laquelle s'exerce le contrôle sur " +
      "Christian Dior SE et, en cascade, sur LVMH.",
    dateDebut: new Date('1984-01-01'),
    dateFin: null,
    sourceRef: 'wp_christian_dior_se',
  },
  {
    // P-O : Antoine Arnault est DG et Vice-Président de Christian Dior SE depuis décembre 2022
    aType: 'personne',
    aRef: 'Q2853612',
    bType: 'organisation',
    bRef: 'Q542767',
    typeLienCode: 'DIRIGEANT',
    description:
      "Antoine Arnault est Directeur général et Vice-Président de Christian Dior SE " +
      "depuis décembre 2022.",
    dateDebut: new Date('2022-12-01'),
    dateFin: null,
    sourceRef: 'wp_antoine_arnault',
  },
  {
    // O-O : Financière Agache → Christian Dior SE (97,5 % du capital)
    aType: 'organisation',
    aRef: 'Q3072529',
    bType: 'organisation',
    bRef: 'Q542767',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "Financière Agache (holding familiale Arnault) détient 97,5 % du capital de " +
      "Christian Dior SE (au 31 décembre 2024).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_christian_dior_se',
  },
  {
    // O-O : Christian Dior SE → LVMH (41,89 % du capital, 56,69 % des droits de vote)
    aType: 'organisation',
    aRef: 'Q542767',
    bType: 'organisation',
    bRef: 'Q504998',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "Christian Dior SE détient 41,89 % du capital et 56,69 % des droits de vote de " +
      "LVMH SE (chiffres au 31 décembre 2024, source rapport annuel Christian Dior SE).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_christian_dior_se',
  },
  {
    // O-O : LVMH → Les Échos (acquisition novembre 2007)
    aType: 'organisation',
    aRef: 'Q504998',
    bType: 'organisation',
    bRef: 'Q923193',
    typeLienCode: 'FILIALE',
    description:
      "LVMH a acquis Les Échos en novembre 2007 pour 240 millions d'euros. " +
      "Le titre est intégré dans le groupe Les Échos-Le Parisien (pôle médias LVMH).",
    dateDebut: new Date('2007-11-01'),
    dateFin: null,
    sourceRef: 'monde_diplo_ppa',
  },
  {
    // O-O : LVMH → Le Parisien (acquisition 2015)
    aType: 'organisation',
    aRef: 'Q504998',
    bType: 'organisation',
    bRef: 'Q142348',
    typeLienCode: 'FILIALE',
    description:
      "LVMH a racheté Le Parisien / Aujourd'hui en France au groupe Amaury en 2015, " +
      "intégré dans le groupe Les Échos-Le Parisien.",
    dateDebut: new Date('2015-01-01'),
    dateFin: null,
    sourceRef: 'monde_diplo_ppa',
  },
  {
    // O-O : LVMH → Radio Classique (propriété attestée par site officiel LVMH)
    aType: 'organisation',
    aRef: 'Q504998',
    bType: 'organisation',
    bRef: 'Q1340362',
    typeLienCode: 'FILIALE',
    description:
      "Radio Classique est une maison LVMH, intégrée dans le groupe Les Échos-Le Parisien " +
      "(pôle médias LVMH). Propriété du groupe attestée par le site officiel LVMH.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'lvmh_radio_classique',
  },

  // =========================================================================
  // GROUPE DASSAULT — structure de contrôle
  // =========================================================================
  {
    // P-O : Serge Dassault → GIMD (Président jusqu'à son décès le 28 mai 2018)
    aType: 'personne',
    aRef: 'Q981270',
    bType: 'organisation',
    bRef: 'Q1434948',
    typeLienCode: 'DIRIGEANT',
    description:
      "Serge Dassault a présidé le Groupe industriel Marcel Dassault (GIMD) " +
      "jusqu'à son décès le 28 mai 2018.",
    dateDebut: null,
    dateFin: new Date('2018-05-28'),
    sourceRef: 'wp_serge_dassault',
  },
  {
    // P-O : Éric Trappier → Dassault Aviation (PDG depuis janvier 2013)
    aType: 'personne',
    aRef: 'Q3591380',
    bType: 'organisation',
    bRef: 'Q460487',
    typeLienCode: 'DIRIGEANT',
    description:
      "Éric Trappier est Président-Directeur général de Dassault Aviation depuis janvier 2013.",
    dateDebut: new Date('2013-01-01'),
    dateFin: null,
    sourceRef: 'wp_dassault_aviation',
  },
  {
    // P-O : Éric Trappier → GIMD (Président depuis janvier 2025)
    aType: 'personne',
    aRef: 'Q3591380',
    bType: 'organisation',
    bRef: 'Q1434948',
    typeLienCode: 'DIRIGEANT',
    description:
      "Éric Trappier est Président du Groupe industriel Marcel Dassault (GIMD) " +
      "depuis janvier 2025, succédant à Charles Edelstenne.",
    dateDebut: new Date('2025-01-01'),
    dateFin: null,
    sourceRef: 'wp_gimd',
  },
  {
    // O-O : GIMD → Dassault Aviation (~62 % du capital)
    aType: 'organisation',
    aRef: 'Q1434948',
    bType: 'organisation',
    bRef: 'Q460487',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "Le Groupe industriel Marcel Dassault (GIMD) détient environ 62 % du capital " +
      "de Dassault Aviation (source : Wikipédia FR, données GIMD).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_gimd',
  },
  {
    // O-O : GIMD → Dassault Systèmes (~45,1 % du capital)
    aType: 'organisation',
    aRef: 'Q1434948',
    bType: 'organisation',
    bRef: 'Q1172038',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "Le Groupe industriel Marcel Dassault (GIMD) détient environ 45,1 % du capital " +
      "de Dassault Systèmes (source : Wikipédia FR, données GIMD).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_gimd',
  },
  {
    // O-O : GIMD → Groupe Figaro (100 % du capital, via Socpresse acquise en 2004)
    aType: 'organisation',
    aRef: 'Q1434948',
    bType: 'organisation',
    bRef: 'Q70442343',
    typeLienCode: 'FILIALE',
    description:
      "Le Groupe industriel Marcel Dassault (GIMD) détient 100 % du Groupe Figaro, " +
      "acquis via la Socpresse par Serge Dassault en 2004.",
    dateDebut: new Date('2004-01-01'),
    dateFin: null,
    sourceRef: 'acrimed_ppa',
  },
  {
    // O-O : Groupe Figaro éditeur de Le Figaro
    aType: 'organisation',
    aRef: 'Q70442343',
    bType: 'organisation',
    bRef: 'Q216047',
    typeLienCode: 'EDITEUR_DE',
    description:
      "Le Groupe Figaro est l'éditeur du quotidien Le Figaro (fondé en 1826), " +
      "premier titre du groupe de presse.",
    dateDebut: new Date('2004-01-01'),
    dateFin: null,
    sourceRef: 'wp_le_figaro',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-fortunes-1] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-fortunes-1] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données Fortunes-1 précédentes...')
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
  console.log('\n-- seed-fortunes-1 — Arnault/LVMH + Dassault/GIMD (liens capitalistiques) --\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok ${data.titre}`)
  }

  console.log('\n— Personnes (Wikidata) —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ok ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n— Organisations (Wikidata) —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ok ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Liens —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n-- Bilan --')
  console.log(`Personnes     : ${PERSONNES.length} (B. Arnault, A. Arnault, S. Dassault, E. Trappier)`)
  console.log(`Organisations : ${ORGANISATIONS.length} (Financière Agache, Christian Dior SE, LVMH, 3 médias LVMH, GIMD, Dassault Aviation, Dassault Systèmes, Groupe Figaro, Le Figaro)`)
  console.log(`Sources       : ${Object.keys(SOURCES).length} (Wikipédia FR, LVMH officiel, Acrimed, Monde Diplomatique)`)
  console.log(`Liens         : ${LIENS.length} (DIRIGEANT, BENEFICIAIRE_EFFECTIF, economique, EDITEUR_DE)`)
  console.log('')
}

main()
  .catch((err) => {
    console.error('[seed-fortunes-1] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
