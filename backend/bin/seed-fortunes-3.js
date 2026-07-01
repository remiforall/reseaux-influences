/**
 * Seed Fortunes 3 — Xavier Niel (Iliad/Free, NJJ Holding, Le Monde, Mediawan),
 *                   Matthieu Pigasse (Lazard, Combat Media, Le Monde, Mediawan),
 *                   Pierre-Antoine Capton (Mediawan),
 *                   famille Rothschild — branche bancaire française
 *                   (David de Rothschild + Alexandre de Rothschild, Rothschild & Co).
 *
 * Liens capitalistiques et croisés :
 *   - consortium Le Monde (Niel + Pigasse + Bergé, 2010-2024 — Bergé †2017, non ajouté)
 *   - Mediawan (Niel + Pigasse + Capton, co-fondé déc. 2015, privatisé oct. 2020)
 *   - Emmanuel Macron (Q3052772, nœud existant depuis seed-macron-v2.js) →
 *     lien EMPLOI Rothschild & Cie Banque 2008-2012 [lien optionnel : skip si nœud absent]
 *
 * Sources : Wikidata (Q-ids tous vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR, France Info, Next.ink, Acrimed, Le Monde diplomatique (PPA),
 *           API DINUM recherche-entreprises (SIREN Combat Media : 514035187, à noter).
 *
 * Codes capitalistiques utilisés (tous présents dans backend/prisma/seed.js — ADR-027) :
 *   DIRIGEANT, BENEFICIAIRE_EFFECTIF, DETENTION_CAPITAL, FONDATEUR, EMPLOI.
 *   Nota : ACTIONNAIRE_MAJORITAIRE n'est pas utilisé ici car les participations
 *   indirectes via Le Monde Libre sont des participations minoritaires.
 *
 * Nota bene — organisations sans Q-id :
 *   Combat Media (holding Pigasse pour Les Inrockuptibles + Radio Nova) :
 *   SIREN 514035187, siège 10-12 rue Maurice Grimaud, Paris 18e. Pas de Q-id Wikidata
 *   détecté. Non créée comme entité dans ce seed (liens Pigasse → médias en direct).
 *   À créer post-audit via annuaire-entreprises.data.gouv.fr.
 *
 * Garde-fous projet :
 *   - Toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - Idempotent (upsert par wikidataId)
 *   - Personnages publics uniquement (dirigeants, publicité de leurs fonctions attestée)
 *   - Aucun membre privé/mineur de la famille Rothschild
 *
 * Usage :
 *   cd backend && node bin/seed-fortunes-3.js
 *   cd backend && node bin/seed-fortunes-3.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — chaque fiche recoupée par >= 2 sources publiques.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q1450891 (vérifié wbsearchentities + Special:EntityData,
    //           "French billionaire businessman born 1967") + Wikipédia FR (Xavier Niel)
    // Rôle public attesté : Président du CA d'Iliad depuis 2019 ; cofondateur de Free (1999)
    nom: 'Niel',
    prenom: 'Xavier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-08-25'),
    lieuNaissance: 'Maisons-Alfort (Val-de-Marne)',
    rolePrincipal: "Président du conseil d'administration d'Iliad (groupe Free)",
    rolesSecondaires: [
      "Fondateur et actionnaire majoritaire (~72 %) du groupe Iliad/Free",
      "Dirigeant de NJJ Holding (holding personnelle, télécoms, immobilier, médias)",
      "Co-actionnaire fondateur du Groupe Le Monde via Le Monde Libre (2010-2024)",
      "Co-fondateur de Mediawan (2015)",
      "Fondateur de Station F (2017) et de Kima Ventures",
    ],
    bio:
      "Entrepreneur français né le 25 août 1967 à Maisons-Alfort. Fondateur du groupe " +
      "Iliad/Free, opérateur télécom indépendant dont il préside le conseil d'administration " +
      "et détient environ 72 % du capital. Sa holding personnelle NJJ Holding couvre les " +
      "télécoms internationaux (Salt, Monaco Telecom, Eir), l'immobilier et les médias. " +
      "Co-actionnaire fondateur du Groupe Le Monde (2010), parts transférées au Fonds pour " +
      "l'indépendance de la presse en avril 2024. Co-fondateur de Mediawan (2015).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Xavier_Niel',
    wikidataId: 'Q1450891',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3299928 (vérifié wbsearchentities,
    //           "French entrepreneur, politician and private banker") + Wikipédia FR
    // Rôle public attesté : PDG Lazard France (2002-2019) ; propriétaire Combat Media ;
    //                        co-actionnaire Groupe Le Monde (2010-2022)
    nom: 'Pigasse',
    prenom: 'Matthieu',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1968-05-25'),
    lieuNaissance: 'Lyon (Rhône)',
    rolePrincipal: 'Co-directeur de Centerview Partners Paris (depuis avril 2020)',
    rolesSecondaires: [
      "Ancien PDG de Lazard France (2002-2019)",
      "Président de Combat Media (Les Inrockuptibles, Radio Nova, Rock en Seine)",
      "Co-actionnaire fondateur du Groupe Le Monde via Le Monde Libre (2010)",
      "Co-fondateur de Mediawan (2015)",
    ],
    bio:
      "Banquier d'affaires français né le 25 mai 1968 à Lyon. PDG de Lazard France de 2002 " +
      "à octobre 2019, où il démissionne pour rejoindre Centerview Partners. Propriétaire de " +
      "Combat Media (anciennement LNEI), holding qui contrôle Les Inrockuptibles (acquis en " +
      "2009) et Radio Nova (acquis en 2015). Co-actionnaire fondateur du Groupe Le Monde via " +
      "Le Monde Libre (novembre 2010) ; cession de la majorité de ses parts à Xavier Niel en " +
      "janvier 2022, conservant ~2 % via Combat. Co-fondateur de Mediawan (décembre 2015).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Matthieu_Pigasse',
    wikidataId: 'Q3299928',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q24929668 (vérifié wbsearchentities, "producteur")
    //           + Wikipédia FR (Pierre-Antoine Capton)
    // Rôle public attesté : Président du directoire de Mediawan depuis 2016 ;
    //                        co-fondateur de Mediawan avec Niel et Pigasse
    nom: 'Capton',
    prenom: 'Pierre-Antoine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1975-04-22'),
    lieuNaissance: null,
    rolePrincipal: 'Président du directoire de Mediawan',
    rolesSecondaires: [
      "Fondateur de Troisième Œil Productions (2001)",
      "Co-fondateur de Mediawan (décembre 2015) avec Xavier Niel et Matthieu Pigasse",
      "Chevalier de la Légion d'honneur (2023)",
    ],
    bio:
      "Producteur de télévision français né le 22 avril 1975. Fondateur de Troisième Œil " +
      "Productions en 2001. Co-fondateur de Mediawan en décembre 2015 avec Xavier Niel et " +
      "Matthieu Pigasse — premier SPAC coté sur Euronext Paris (avril 2016, 250 M€ levés). " +
      "Président du directoire de Mediawan depuis l'IPO de 2016. Le groupe a été privatisé " +
      "en décembre 2020. Chevalier de la Légion d'honneur en 2023.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Pierre-Antoine_Capton',
    wikidataId: 'Q24929668',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q1176310 (vérifié Special:EntityData,
    //           "French banker") + Wikipédia FR (David de Rothschild)
    // Rôle public attesté : Président de Rothschild & Co (Paris) de 1982 à 2018
    nom: 'de Rothschild',
    prenom: 'David',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1942-12-15'),
    lieuNaissance: 'New York (États-Unis)',
    rolePrincipal: 'Ancien Président de Rothschild & Co (1982-2018)',
    rolesSecondaires: [
      "Membre de la branche française de la famille Rothschild",
      "A conduit la reconstruction de la banque Rothschild après les nationalisations de 1981",
      "A transmis la présidence exécutive à son fils Alexandre en 2018",
    ],
    bio:
      "Banquier franco-américain né le 15 décembre 1942 à New York, fils de Guy de Rothschild. " +
      "Après les nationalisations de 1981, il reconstruit la présence bancaire Rothschild en " +
      "France et préside la banque de 1982 à 2018. En février 2018, il annonce céder la " +
      "présidence exécutive à son fils Alexandre lors des assemblées générales de mai-juin 2018.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/David_de_Rothschild',
    wikidataId: 'Q1176310',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q55784971 (vérifié wbsearchentities,
    //           "French banker and executive born 1980") + Wikipédia FR (Alexandre de Rothschild)
    // Rôle public attesté : Président exécutif de Rothschild & Co depuis mai-juin 2018
    nom: 'de Rothschild',
    prenom: 'Alexandre',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1980-12-03'),
    lieuNaissance: null,
    rolePrincipal: 'Président exécutif de Rothschild & Co',
    rolesSecondaires: [
      "Fils de David de Rothschild",
      "A dirigé le retrait de la cote d'Euronext Paris (septembre 2023)",
      "Dirige un groupe générant 2,9 Mds€ de revenus en 2024 (M&A, wealth management, asset management)",
    ],
    bio:
      "Banquier français né le 3 décembre 1980, fils de David de Rothschild. Président exécutif " +
      "de Rothschild & Co depuis mai-juin 2018, succédant à son père. Sous sa direction, la " +
      "banque finalise en septembre 2023 son retrait de la cote d'Euronext Paris via une offre " +
      "publique d'achat (OPA), redevenant une entité entièrement familiale et privée.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Alexandre_de_Rothschild',
    wikidataId: 'Q55784971',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q1239347 (vérifié Special:EntityData,
    //           "French telecommunications company" — Iliad S.A.) + Wikipédia FR (Iliad)
    // Xavier Niel fondateur, ~72 % du capital, Président du CA depuis 2019
    nom: 'Iliad',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.iliad.fr',
    description:
      "Groupe de télécommunications français fondé par Xavier Niel, maison mère de Free. " +
      "Introduit en bourse en 2004, retiré de la cote en 2021 lorsque Xavier Niel en a " +
      "racheté les parts flottantes. Opère en France (Free, Free Mobile), en Italie " +
      "(Iliad Italia) et en Pologne (Play). Xavier Niel détient environ 72 % du capital.",
    dateCreation: new Date('1991-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Iliad',
    wikidataId: 'Q1239347',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q105675778 (vérifié Special:EntityData,
    //           "French holding company — holding personnelle de Xavier Niel") + Wikipédia FR (NJJ Holding)
    nom: 'NJJ Holding',
    sigle: 'NJJ',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: null,
    description:
      "Holding personnelle de Xavier Niel (le nom vient des prénoms de ses fils : Niel John Jules). " +
      "Fondée en 2010, siège au 16 rue de la Ville-l'Évêque, Paris. Contrôle des participations " +
      "en télécoms (Salt Mobile, Monaco Telecom, Eir, Millicom, Proximus), immobilier " +
      "(Unibail-Rodamco-Westfield à 25,5 %) et médias (Groupe Nice-Matin, Paris-Turf, France-Antilles). " +
      "Via NJJ Presse, était actionnaire du Groupe Le Monde jusqu'en avril 2024.",
    dateCreation: new Date('2010-02-08'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/NJJ_Holding',
    wikidataId: 'Q105675778',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3117473 (vérifié Special:EntityData,
    //           "French media conglomerate" / "groupe de presse français") + Wikipédia FR (Groupe Le Monde)
    // Contrôlé à 72,5 % par Le Monde Libre (consortium fondé en 2010 par Niel, Pigasse, Bergé)
    // puis par le Fonds pour l'indépendance de la presse (FIP) à partir d'avril 2024
    nom: 'Groupe Le Monde',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.lemonde.fr',
    description:
      "Groupe de presse français fondé en 1944 autour du quotidien Le Monde. " +
      "Comprend également Le Nouvel Observateur, Télérama, Courrier International, " +
      "Le Monde diplomatique (51 %) et HuffPost France (85 %). " +
      "Contrôlé à 72,5 % par Le Monde Libre SAS, dont les parts sont détenues à ~98 % " +
      "par le Fonds pour l'indépendance de la presse (FIP) depuis avril 2024. " +
      "Matthieu Pigasse conserve ~2 % de Le Monde Libre via Combat.",
    dateCreation: new Date('1944-12-19'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Groupe_Le_Monde',
    wikidataId: 'Q3117473',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    // Sources : Wikidata Q25389507 (vérifié Special:EntityData,
    //           "French media conglomerate") + Wikipédia FR (Mediawan)
    // Fondé déc. 2015 par Niel, Pigasse, Capton ; premier SPAC Euronext (avril 2016)
    // Privatisé déc. 2020 (OPA oct. 2020 par les fondateurs + KKR, Bpifrance, MACSF)
    nom: 'Mediawan',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.mediawan.fr',
    description:
      "Groupe de production et de distribution audiovisuelle fondé le 15 décembre 2015 " +
      "par Xavier Niel, Matthieu Pigasse et Pierre-Antoine Capton. Premier SPAC coté sur " +
      "Euronext Paris (avril 2016, 250 M€). A acquis notamment AB Groupe (2017) et " +
      "Lagardère Studios (2020). Privatisé en décembre 2020 après une OPA réussie (oct. 2020) " +
      "par les fondateurs avec KKR, Bpifrance et MACSF. Deuxième producteur indépendant " +
      "mondial après le rachat de Leonine Studios (2024).",
    dateCreation: new Date('2015-12-15'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Mediawan',
    wikidataId: 'Q25389507',
    qualiteInfluence: 'PRODUCTEUR',
  },
  {
    // Sources : Wikidata Q1537151 (vérifié Special:EntityData,
    //           "financial holding company... controlled by the French and English branch
    //           of the Rothschild family") + Wikipédia FR (Rothschild & Co)
    // Emmanuel Macron y était associé-gérant 2008-2012
    // Retiré de la cote d'Euronext Paris en septembre 2023
    nom: 'Rothschild & Co',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.rothschildandco.com',
    description:
      "Holding bancaire et financière contrôlée par les branches française et anglaise " +
      "de la famille Rothschild. Fondée en 1838, siège à Paris. Activités : conseil en fusions-" +
      "acquisitions (n°1 en France), gestion de fortune, gestion d'actifs (~22 Mds€), " +
      "private equity (Five Arrows, ~15,7 Mds€). CA 2024 : 2,9 Mds€. " +
      "Anciennement cotée sous le ticker ROTH (Euronext Paris), retirée de la cote en septembre 2023. " +
      "Emmanuel Macron y était associé-gérant de 2011 à 2012.",
    dateCreation: new Date('1838-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Rothschild_%26_Co',
    wikidataId: 'Q1537151',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q637440 (vérifié Special:EntityData,
    //           "Global Financial advisory and asset management firm") + Wikipédia FR (Lazard)
    // Matthieu Pigasse en a été PDG France (2002-2019)
    nom: 'Lazard',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'États-Unis',
    siteWeb: 'https://www.lazard.com',
    description:
      "Banque d'affaires internationale fondée en 1848, spécialisée dans le conseil financier " +
      "(M&A, restructurations) et la gestion d'actifs. Cotée au NYSE. " +
      "Matthieu Pigasse en a été associé-gérant puis PDG de Lazard France (Paris) de 2002 " +
      "à octobre 2019, date de sa démission pour rejoindre Centerview Partners.",
    dateCreation: new Date('1848-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Lazard',
    wikidataId: 'Q637440',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2758142 (vérifié wbsearchentities,
    //           "French music and politics magazine, issued monthly from 1986, weekly from 1995")
    //           + Wikipédia FR (Les Inrockuptibles)
    // Acquis par Matthieu Pigasse en 2009 via LNEI (devenue Combat Media)
    nom: 'Les Inrockuptibles',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.lesinrocks.com',
    description:
      "Magazine culturel français fondé en 1986, consacré à la musique, la culture et l'actualité. " +
      "Acquis en 2009 par Matthieu Pigasse via sa holding LNEI " +
      "(Les Nouvelles Éditions Indépendantes, SIREN 827531971, fermée en 2019), " +
      "restructurée en Combat Media (SIREN 514035187). " +
      "Combat Media, dont Pigasse est président, regroupe Les Inrockuptibles, Radio Nova et Rock en Seine.",
    dateCreation: new Date('1986-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_Inrockuptibles',
    wikidataId: 'Q2758142',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    // Sources : Wikidata Q2292969 (vérifié wbsearchentities, résultat unique pour Radio Nova France)
    //           + Wikipédia FR (Radio Nova)
    // Acquis par Matthieu Pigasse en septembre 2015 via Combat Media
    nom: 'Radio Nova',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.nova.fr',
    description:
      "Station de radio musicale française créée en 1981, basée à Paris. " +
      "Acquise à titre personnel par Matthieu Pigasse en septembre 2015 (sans coactionnaire), " +
      "rejoignant le groupe Combat Media aux côtés des Inrockuptibles. " +
      "Emmanuel Hoog en est directeur général depuis décembre 2019.",
    dateCreation: new Date('1981-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Radio_Nova',
    wikidataId: 'Q2292969',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-06-30).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_xavier_niel: {
    url: 'https://fr.wikipedia.org/wiki/Xavier_Niel',
    titre: 'Xavier Niel — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 25 août 1967 à Maisons-Alfort. Fondateur d'Iliad/Free (~72 % capital), " +
      "NJJ Holding, co-actionnaire Le Monde (2010-2024), co-fondateur Mediawan (2015).",
    verifiee: true,
  },
  wp_matthieu_pigasse: {
    url: 'https://fr.wikipedia.org/wiki/Matthieu_Pigasse',
    titre: 'Matthieu Pigasse — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 25 mai 1968 à Lyon. PDG Lazard France (2002-2019). Propriétaire Combat Media " +
      "(Les Inrockuptibles 2009, Radio Nova 2015). Co-fondateur Le Monde Libre (2010), " +
      "Mediawan (2015). Cession majorité Le Monde à Niel en janv. 2022.",
    verifiee: true,
  },
  wp_capton: {
    url: 'https://fr.wikipedia.org/wiki/Pierre-Antoine_Capton',
    titre: 'Pierre-Antoine Capton — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 22 avril 1975. Fondateur Troisième Œil Productions (2001). " +
      "Co-fondateur et Président du directoire de Mediawan depuis l'IPO d'avril 2016.",
    verifiee: true,
  },
  wp_david_rothschild: {
    url: 'https://fr.wikipedia.org/wiki/David_de_Rothschild',
    titre: 'David de Rothschild — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 15 déc. 1942 à New York. Président de Rothschild & Co (Paris) de 1982 à 2018. " +
      "Annonce en fév. 2018 la cession de la présidence à son fils Alexandre.",
    verifiee: true,
  },
  wp_alexandre_rothschild: {
    url: 'https://fr.wikipedia.org/wiki/Alexandre_de_Rothschild',
    titre: 'Alexandre de Rothschild — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Né le 3 déc. 1980. Président exécutif de Rothschild & Co depuis mai-juin 2018. " +
      "A piloté le retrait de la cote d'Euronext Paris en septembre 2023.",
    verifiee: true,
  },
  wp_iliad: {
    url: 'https://fr.wikipedia.org/wiki/Iliad',
    titre: 'Iliad — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Groupe télécoms français fondé par Xavier Niel, maison mère de Free. " +
      "Introduit en bourse en 2004, retiré de la cote en 2021. Niel détient ~72 % du capital.",
    verifiee: true,
  },
  wp_njj: {
    url: 'https://fr.wikipedia.org/wiki/NJJ_Holding',
    titre: 'NJJ Holding — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Holding personnelle de Xavier Niel fondée en 2010. Télécoms (Salt, Monaco Telecom, Eir), " +
      "immobilier (URW 25,5 %), médias (Nice-Matin). Via NJJ Presse : Le Monde (2010-2024).",
    verifiee: true,
  },
  wp_groupe_le_monde: {
    url: 'https://fr.wikipedia.org/wiki/Groupe_Le_Monde',
    titre: 'Groupe Le Monde — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Groupe de presse français (Le Monde, Le Nouvel Obs, Télérama, etc.). " +
      "Contrôlé à 72,5 % par Le Monde Libre SAS. Consortium fondé en nov. 2010 par Niel, Pigasse, Bergé.",
    verifiee: true,
  },
  wp_le_monde_libre: {
    url: 'https://fr.wikipedia.org/wiki/Le_Monde_libre_(entreprise)',
    titre: 'Le Monde libre (entreprise) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "SAS créée le 23 sept. 2010 par Pierre Bergé, Xavier Niel et Matthieu Pigasse. " +
      "Acquiert le Groupe Le Monde le 2 nov. 2010. Détient 72,5 % du Groupe Le Monde. " +
      "~98 % du capital de Le Monde Libre désormais détenus par le FIP (depuis avril 2024).",
    verifiee: true,
  },
  wp_mediawan: {
    url: 'https://fr.wikipedia.org/wiki/Mediawan',
    titre: 'Mediawan — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Fondé le 15 déc. 2015 par Pierre-Antoine Capton, Matthieu Pigasse et Xavier Niel. " +
      "Premier SPAC Euronext Paris (22 avril 2016, 250 M€). OPA fondateurs oct. 2020, " +
      "privatisé déc. 2020. Rachat Leonine Studios (avril 2024).",
    verifiee: true,
  },
  wp_rothschild_co: {
    url: 'https://fr.wikipedia.org/wiki/Rothschild_%26_Co',
    titre: 'Rothschild & Co — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Holding bancaire contrôlée par la famille Rothschild (branches française et anglaise). " +
      "Fondée en 1838. Retrait de la cote Euronext Paris en septembre 2023. CA 2024 : 2,9 Mds€.",
    verifiee: true,
  },
  wp_les_inrocks: {
    url: 'https://fr.wikipedia.org/wiki/Les_Inrockuptibles',
    titre: 'Les Inrockuptibles — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Magazine culturel français (musique, politique) fondé en 1986. " +
      "Acquis par Matthieu Pigasse en 2009 via LNEI, désormais dans Combat Media.",
    verifiee: true,
  },
  wp_radio_nova: {
    url: 'https://fr.wikipedia.org/wiki/Radio_Nova',
    titre: 'Radio Nova — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Station de radio musicale fondée en 1981. Rachetée par Matthieu Pigasse " +
      "à titre personnel en septembre 2015, sans coactionnaire.",
    verifiee: true,
  },
  wp_lazard: {
    url: 'https://fr.wikipedia.org/wiki/Lazard',
    titre: 'Lazard — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Banque d'affaires internationale fondée en 1848. " +
      "Matthieu Pigasse en a été PDG de Lazard France de 2002 à octobre 2019.",
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
      "Carte interactive de la propriété des médias français. Documente les liens " +
      "capitalistiques Niel-Pigasse (Le Monde), Pigasse (Les Inrockuptibles, Radio Nova).",
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
      "Guide des concentrations médias français (partenariat Le Monde diplomatique). " +
      "Recense les propriétaires de Niel (Iliad, Le Monde) et Pigasse (Les Inrocks, Nova).",
    verifiee: true,
  },
  wp_macron: {
    url: 'https://fr.wikipedia.org/wiki/Emmanuel_Macron',
    titre: 'Emmanuel Macron — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      "Biographie : après l'ENA et l'Inspection des finances, Macron rejoint Rothschild & Cie " +
      "en sept. 2008. Promu gérant (2010) puis associé-gérant (2011). " +
      "Quitte la banque en 2012 pour le cabinet de Pierre Moscovici.",
    verifiee: true,
  },
  fi_macron_rothschild: {
    url: 'https://www.franceinfo.fr/elections/presidentielle/quand-emmanuel-macron-etait-banquier-d-affaires-un-element-prometteur-mais-sans-plus_2171646.html',
    titre: "Quand Emmanuel Macron était banquier d'affaires : « Un élément prometteur, mais sans plus »",
    media: 'France Info',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2017-04-18'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Rédaction France Info',
    description:
      "Portrait du passage de Macron chez Rothschild & Cie (sept. 2008-2012) : " +
      "d'abord gérant (2010), puis associé-gérant (2011). A conseillé le rachat de Pfizer Nutrition " +
      "par Nestlé (deal à 9 Mds€, 2012).",
    verifiee: true,
  },
  nextink_niel_fip: {
    url: 'https://next.ink/brief-article/xavier-niel-cede-ses-parts-dans-le-journal-le-monde-a-un-fonds-de-dotation/',
    titre: "Xavier Niel cède ses parts dans le groupe Le Monde à un fonds de dotation — Next.ink",
    media: 'Next.ink',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-04-17'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Rédaction Next.ink',
    description:
      "Le FIP (Fonds pour l'indépendance de la presse) acquiert en avril 2024 la quasi-totalité " +
      "de NJJ Presse (Xavier Niel), devenant l'actionnaire indirect de référence du Groupe Le Monde.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002), exactement 1 entité non-nulle de chaque côté.
//
// Champ `optional: true` sur le lien Macron → Rothschild & Co :
//   Emmanuel Macron (Q3052772) est un nœud existant créé par seed-macron-v2.js.
//   Si ce seed est lancé avant seed-macron-v2.js, le lien est ignoré avec un avertissement
//   (voir creerLien ci-dessous) plutôt que de lever une exception.
// ---------------------------------------------------------------------------

const LIENS = [
  // =========================================================================
  // XAVIER NIEL — structure de contrôle
  // =========================================================================
  {
    // P-O : Xavier Niel est Président du CA d'Iliad depuis 2019, fondateur depuis 1991
    aType: 'personne',
    aRef: 'Q1450891',
    bType: 'organisation',
    bRef: 'Q1239347',
    typeLienCode: 'DIRIGEANT',
    description:
      "Xavier Niel préside le conseil d'administration d'Iliad depuis 2019. " +
      "Il a fondé le groupe (anciennement Fermic Multimedia) en 1991 et y a lancé Free en 1999.",
    dateDebut: new Date('2019-01-01'),
    dateFin: null,
    sourceRef: 'wp_iliad',
  },
  {
    // P-O : Xavier Niel est bénéficiaire effectif (~72 %) d'Iliad
    aType: 'personne',
    aRef: 'Q1450891',
    bType: 'organisation',
    bRef: 'Q1239347',
    typeLienCode: 'BENEFICIAIRE_EFFECTIF',
    description:
      "Xavier Niel détient environ 72 % du capital d'Iliad via ses holdings personnelles, " +
      "en faisant l'actionnaire ultra-majoritaire du groupe. Il a racheté le flottant en 2021.",
    dateDebut: new Date('2021-01-01'),
    dateFin: null,
    sourceRef: 'wp_xavier_niel',
  },
  {
    // P-O : Xavier Niel est dirigeant de NJJ Holding (sa holding personnelle)
    aType: 'personne',
    aRef: 'Q1450891',
    bType: 'organisation',
    bRef: 'Q105675778',
    typeLienCode: 'DIRIGEANT',
    description:
      "NJJ Holding est la holding personnelle de Xavier Niel, fondée en 2010. " +
      "Son nom est construit à partir des prénoms de ses fils (Niel John Jules). " +
      "Anthony Maarek en est le directeur général sous l'autorité de Niel.",
    dateDebut: new Date('2010-02-08'),
    dateFin: null,
    sourceRef: 'wp_njj',
  },
  {
    // O-O : NJJ Holding (via NJJ Presse) → Groupe Le Monde
    // Actionnaire de référence via Le Monde Libre (2010-2024)
    // En sept. 2023 : rachat des parts de Křetínský ; en avril 2024 : cession au FIP
    aType: 'organisation',
    aRef: 'Q105675778',
    bType: 'organisation',
    bRef: 'Q3117473',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "NJJ Holding (via sa filiale NJJ Presse) était actionnaire du Groupe Le Monde " +
      "via Le Monde Libre SAS (consortium fondé nov. 2010 avec Pigasse et Pierre Bergé). " +
      "En septembre 2023, Niel rachète les parts de Daniel Křetínský. " +
      "En avril 2024, il transfère la quasi-totalité de NJJ Presse au Fonds pour l'indépendance " +
      "de la presse (FIP), ne conservant qu'une seule part.",
    dateDebut: new Date('2010-11-02'),
    dateFin: new Date('2024-04-17'),
    sourceRef: 'nextink_niel_fip',
  },

  // =========================================================================
  // MATTHIEU PIGASSE — structure de contrôle
  // =========================================================================
  {
    // P-O : Matthieu Pigasse est co-actionnaire fondateur du Groupe Le Monde
    // Via Le Monde Libre SAS (avec Niel et Pierre Bergé, nov. 2010)
    // Cession de la majorité de ses parts à Xavier Niel en janvier 2022 ; conserve ~2 %
    aType: 'personne',
    aRef: 'Q3299928',
    bType: 'organisation',
    bRef: 'Q3117473',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "Matthieu Pigasse co-fonde Le Monde Libre SAS le 23 sept. 2010 avec Xavier Niel " +
      "et Pierre Bergé (†2017), et acquiert le Groupe Le Monde le 2 nov. 2010. " +
      "Il cède la majorité de ses parts à Xavier Niel en janvier 2022 et conserve " +
      "environ 2 % via Combat au sein de Le Monde Libre.",
    dateDebut: new Date('2010-11-02'),
    dateFin: null,
    sourceRef: 'wp_le_monde_libre',
  },
  {
    // P-O : Matthieu Pigasse → Les Inrockuptibles (acquisition 2009 via LNEI/Combat)
    aType: 'personne',
    aRef: 'Q3299928',
    bType: 'organisation',
    bRef: 'Q2758142',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "Matthieu Pigasse a acquis Les Inrockuptibles en 2009 via LNEI " +
      "(Les Nouvelles Éditions Indépendantes), holding restructurée ensuite en Combat Media " +
      "(SIREN 514035187, Paris 18e). Pigasse en est président.",
    dateDebut: new Date('2009-01-01'),
    dateFin: null,
    sourceRef: 'wp_les_inrocks',
  },
  {
    // P-O : Matthieu Pigasse → Radio Nova (acquisition septembre 2015)
    aType: 'personne',
    aRef: 'Q3299928',
    bType: 'organisation',
    bRef: 'Q2292969',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "Matthieu Pigasse a racheté Radio Nova en septembre 2015 à titre personnel, " +
      "sans coactionnaire. La station rejoint le groupe Combat Media aux côtés " +
      "des Inrockuptibles.",
    dateDebut: new Date('2015-09-01'),
    dateFin: null,
    sourceRef: 'wp_radio_nova',
  },
  {
    // P-O : Matthieu Pigasse → Lazard France (PDG 2002-2019)
    aType: 'personne',
    aRef: 'Q3299928',
    bType: 'organisation',
    bRef: 'Q637440',
    typeLienCode: 'EMPLOI',
    description:
      "Matthieu Pigasse a rejoint Lazard en 2002 comme associé-gérant et en est devenu " +
      "PDG de Lazard France. Il démissionne en octobre 2019 pour rejoindre Centerview Partners. " +
      "Sous sa direction, Lazard France a notamment conseillé la Grèce lors de sa restructuration de dette.",
    dateDebut: new Date('2002-01-01'),
    dateFin: new Date('2019-10-01'),
    sourceRef: 'wp_matthieu_pigasse',
  },

  // =========================================================================
  // MEDIAWAN — liens croisés (Niel + Pigasse + Capton co-fondateurs)
  // =========================================================================
  {
    // P-O : Xavier Niel → Mediawan (co-fondateur déc. 2015)
    aType: 'personne',
    aRef: 'Q1450891',
    bType: 'organisation',
    bRef: 'Q25389507',
    typeLienCode: 'FONDATEUR',
    description:
      "Xavier Niel co-fonde Mediawan le 15 décembre 2015 avec Matthieu Pigasse " +
      "et Pierre-Antoine Capton. Premier SPAC coté sur Euronext Paris (22 avril 2016, 250 M€). " +
      "Il participe à l'OPA de privatisation en octobre 2020 aux côtés de KKR et Bpifrance.",
    dateDebut: new Date('2015-12-15'),
    dateFin: null,
    sourceRef: 'wp_mediawan',
  },
  {
    // P-O : Matthieu Pigasse → Mediawan (co-fondateur déc. 2015)
    aType: 'personne',
    aRef: 'Q3299928',
    bType: 'organisation',
    bRef: 'Q25389507',
    typeLienCode: 'FONDATEUR',
    description:
      "Matthieu Pigasse co-fonde Mediawan le 15 décembre 2015 avec Xavier Niel " +
      "et Pierre-Antoine Capton. Il participe à l'OPA de privatisation en octobre 2020.",
    dateDebut: new Date('2015-12-15'),
    dateFin: null,
    sourceRef: 'wp_mediawan',
  },
  {
    // P-O : Pierre-Antoine Capton → Mediawan (co-fondateur déc. 2015)
    aType: 'personne',
    aRef: 'Q24929668',
    bType: 'organisation',
    bRef: 'Q25389507',
    typeLienCode: 'FONDATEUR',
    description:
      "Pierre-Antoine Capton co-fonde Mediawan le 15 décembre 2015 avec Xavier Niel " +
      "et Matthieu Pigasse via sa structure Troisième Œil. Il apporte son expertise " +
      "de producteur pour définir la stratégie d'acquisition de contenus audiovisuels.",
    dateDebut: new Date('2015-12-15'),
    dateFin: null,
    sourceRef: 'wp_mediawan',
  },
  {
    // P-O : Pierre-Antoine Capton → Mediawan (Président du directoire depuis l'IPO 2016)
    aType: 'personne',
    aRef: 'Q24929668',
    bType: 'organisation',
    bRef: 'Q25389507',
    typeLienCode: 'DIRIGEANT',
    description:
      "Pierre-Antoine Capton est Président du directoire de Mediawan depuis l'introduction " +
      "en bourse du 22 avril 2016. Il pilote les acquisitions stratégiques du groupe " +
      "(AB Groupe 2017, Lagardère Studios 2020, Leonine Studios 2024).",
    dateDebut: new Date('2016-04-22'),
    dateFin: null,
    sourceRef: 'wp_capton',
  },

  // =========================================================================
  // FAMILLE ROTHSCHILD (branche bancaire française)
  // =========================================================================
  {
    // P-O : David de Rothschild → Rothschild & Co (Président 1982-2018)
    aType: 'personne',
    aRef: 'Q1176310',
    bType: 'organisation',
    bRef: 'Q1537151',
    typeLienCode: 'DIRIGEANT',
    description:
      "David de Rothschild préside Rothschild & Co (Paris) de 1982 à 2018. " +
      "Après les nationalisations de 1981 qui avaient exproprié la banque Rothschild, " +
      "il la reconstruit en créant Rothschild & Cie Banque, renommée Rothschild & Co en 2018. " +
      "Il cède la présidence exécutive à son fils Alexandre lors des AG de mai-juin 2018.",
    dateDebut: new Date('1982-01-01'),
    dateFin: new Date('2018-06-30'),
    sourceRef: 'wp_david_rothschild',
  },
  {
    // P-O : Alexandre de Rothschild → Rothschild & Co (Président exécutif depuis 2018)
    aType: 'personne',
    aRef: 'Q55784971',
    bType: 'organisation',
    bRef: 'Q1537151',
    typeLienCode: 'DIRIGEANT',
    description:
      "Alexandre de Rothschild succède à son père David comme Président exécutif " +
      "de Rothschild & Co lors des assemblées générales de mai-juin 2018. " +
      "Il pilote en 2023 le retrait de la cote d'Euronext Paris, " +
      "restaurant le caractère entièrement privé et familial de la banque.",
    dateDebut: new Date('2018-06-01'),
    dateFin: null,
    sourceRef: 'wp_alexandre_rothschild',
  },

  // =========================================================================
  // LIEN CROISÉ STRATÉGIQUE : Macron → Rothschild & Co (EMPLOI 2008-2012)
  // Nœud Macron existant depuis seed-macron-v2.js — lien optionnel (skip si absent)
  // =========================================================================
  {
    optional: true,
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'organisation',
    bRef: 'Q1537151',
    typeLienCode: 'EMPLOI',
    description:
      "Emmanuel Macron, inspecteur des finances en disponibilité, rejoint Rothschild & Cie Banque " +
      "en septembre 2008. Promu gérant en 2010, associé-gérant en 2011. " +
      "A notamment conseillé le rachat de Pfizer Nutrition par Nestlé (deal à 9 Mds€, 2012). " +
      "Quitte la banque en 2012 pour rejoindre le cabinet du ministre de l'Économie Pierre Moscovici.",
    dateDebut: new Date('2008-09-01'),
    dateFin: new Date('2012-07-01'),
    sourceRef: 'fi_macron_rothschild',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js / seed-fortunes-1.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-fortunes-3] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
    if (lien.optional) {
      console.log(
        `  [SKIP optionnel] ${lien.typeLienCode} — entité absente (aRef=${lien.aRef}, bRef=${lien.bRef})`,
      )
      return null
    }
    throw new Error(
      `[seed-fortunes-3] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données Fortunes-3 précédentes...')
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
  console.log('\n-- seed-fortunes-3 — Niel/Pigasse/Rothschild (liens capitalistiques + croisés) --\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('-- Sources publiques --')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok ${data.titre}`)
  }

  console.log('\n-- Personnes (Wikidata) --')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ok ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n-- Organisations (Wikidata) --')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ok ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n-- Liens --')
  for (const lien of LIENS) {
    const result = await creerLien(lien, sourcesMap, user.id)
    if (result !== null) {
      console.log(`  ok ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
    }
  }

  console.log('\n-- Bilan --')
  console.log(`Personnes     : ${PERSONNES.length} (X. Niel, M. Pigasse, P.-A. Capton, D. de Rothschild, A. de Rothschild)`)
  console.log(`Organisations : ${ORGANISATIONS.length} (Iliad, NJJ Holding, Groupe Le Monde, Mediawan, Rothschild & Co, Lazard, Les Inrockuptibles, Radio Nova)`)
  console.log(`Sources       : ${Object.keys(SOURCES).length} (Wikipédia FR, France Info, Next.ink, Acrimed, Le Monde diplomatique)`)
  console.log(`Liens         : ${LIENS.length} (DIRIGEANT, BENEFICIAIRE_EFFECTIF, DETENTION_CAPITAL, FONDATEUR, EMPLOI — dont 1 optionnel Macron→Rothschild)`)
  console.log(`\nQ-ids vérifiés : Q1450891 Q3299928 Q24929668 Q1176310 Q55784971 Q1239347 Q105675778 Q3117473 Q25389507 Q1537151 Q637440 Q2758142 Q2292969`)
  console.log(`Noeud existant réutilisé : Q3052772 (Emmanuel Macron, seed-macron-v2.js) — lien optionnel`)
  console.log(`Sans Q-id Wikidata : Combat Media (SIREN 514035187) — non créée ici, liens Pigasse en direct`)
  console.log('')
}

main()
  .catch((err) => {
    console.error('[seed-fortunes-3] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
