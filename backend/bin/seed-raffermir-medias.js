/**
 * seed-raffermir-medias.js — Consolidation et enrichissement du graphe médias français.
 *
 * Ce seed enrichit les entités issues de import-medias-mdiplo.js (~275 organisations dont
 * ~286 sans wikidataId) en apportant des Q-ids vérifiés, des typeOrganisation corrects et
 * des descriptions sourcées pour les nœuds les plus importants absents des seeds précédents
 * (seed-fortunes-1/2/3, seed-barons-medias).
 *
 * Stratégie anti-doublon :
 *   - Upsert par wikidataId EN PREMIER.
 *     → Si trouvé (entité déjà correctement seedée) : mise à jour.
 *     → Si non trouvé : création avec Q-id (peut coexister temporairement avec une entrée
 *       mdiplo sans Q-id — voir commentaires « NOM_MDIPLO » pour rapprochement manuel).
 *   - Les entités DÉJÀ présentes dans les seeds précédents (Les Échos Q923193, Le Parisien
 *     Q142348, Le Figaro Q216047, BFM TV Q517444, Europe 1 Q314407, etc.) ne sont PAS
 *     redéfinies — on s'y réfère seulement dans les LIENS via leur wikidataId.
 *
 * Corroboration :
 *   Chaque lien capitalistique ou éditorial est corroboré par ≥ 2 sources (Wikidata/Wikipedia
 *   + Acrimed ou presse de référence). Les caractérisations de ligne éditoriale sont TOUJOURS
 *   attribuées à leur source (anti-diffamation, précaution Bolloré procédurier).
 *
 * Sources primaires :
 *   Wikidata (Q-ids vérifiés via wbsearchentities + Special:EntityData 2026-07-02),
 *   Wikipédia FR, Acrimed « Médias français : qui possède quoi »
 *   (https://www.acrimed.org/Medias-francais-qui-possede-quoi),
 *   Le Monde diplomatique données mdiplo (ODC-By, mdiplo/Medias_francais).
 *
 * Garde-fous projet :
 *   - Toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - Idempotent (upsert par wikidataId)
 *   - dateConsultation : 2026-07-02
 *
 * Entités NE PAS recréer (déjà dans seeds précédents, wikidataId correct) :
 *   LVMH Q504998, Les Échos Q923193, Le Parisien Q142348, Radio Classique Q1340362,
 *   GIMD Q1434948, Groupe Figaro Q70442343, Le Figaro Q216047 (→ seed-fortunes-1)
 *   Vivendi SE Q1127887, Canal+ PLC Q2663746, Havas NV Q516033,
 *   Louis Hachette Group Q130745255, CNews Q3083542, Europe 1 Q314407,
 *   Prisma Media Q3403917 (→ seed-fortunes-2)
 *   Groupe Le Monde Q3117473, NJJ Holding Q105675778, Xavier Niel Q1450891,
 *   Iliad Q1239347, Mediawan Q25389507 (→ seed-fortunes-3)
 *   CMA CGM Q1023867, CMA Média Q118869829, BFM TV Q517444, RMC Q686375,
 *   La Provence Q1799045, La Tribune Q1799197, Rodolphe Saadé Q3438372 (→ seed-barons-medias)
 *   Bouygues Q895325 (→ seed-cac40-b1)
 *
 * Usage :
 *   cd backend && node bin/seed-raffermir-medias.js
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// Normalisation (même algo que import-medias-mdiplo.js)
// ---------------------------------------------------------------------------
const norm = (s) =>
  (s || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')

// ---------------------------------------------------------------------------
// PERSONNES — 4 dirigeants médias non encore seeded.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q691440 (vérifié wbsearchentities, "French businessman")
    //           + Wikipédia FR (Arnaud Lagardère)
    // Rôle public attesté : PDG de Lagardère SA depuis 2003 (héritage Jean-Luc Lagardère †2003).
    // NOM_MDIPLO : "Arnaud Lagardère"
    nom: 'Lagardère',
    prenom: 'Arnaud',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1971-06-18'),
    lieuNaissance: 'Boulogne-Billancourt (Hauts-de-Seine)',
    rolePrincipal: 'Gérant commandité de Lagardère SCA',
    rolesSecondaires: [
      'PDG Lagardère SA depuis 2023 (après OPA de Vivendi)',
      'Héritier du groupe fondé par son père Jean-Luc Lagardère (†2003)',
      'Ancien co-gérant commandité de Lagardère SCA',
    ],
    bio:
      'Fils de Jean-Luc Lagardère, Arnaud Lagardère a hérité du groupe éponyme en 2003. ' +
      'Vivendi a progressivement monté au capital de Lagardère SA à partir de 2020 et en a pris ' +
      'le contrôle total (squeeze-out) en décembre 2023. Il reste PDG opérationnel du groupe.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Arnaud_Lagard%C3%A8re',
    wikidataId: 'Q691440',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q15714038 (vérifié wbsearchentities, "Israeli and French businessman")
    //           + Wikipédia FR (Patrick Drahi)
    // Rôle public attesté : fondateur et actionnaire de référence d'Altice Group depuis 2001.
    // NOM_MDIPLO : "Patrick Drahi"
    nom: 'Drahi',
    prenom: 'Patrick',
    pays: 'France',
    nationalite: 'franco-israélienne',
    dateNaissance: new Date('1963-08-06'),
    lieuNaissance: 'Reims (Marne)',
    rolePrincipal: "Fondateur et actionnaire de référence d'Altice Group",
    rolesSecondaires: [
      'Fondateur de SFR (via Altice France)',
      "Ancien propriétaire de BFM TV, RMC et L'Express (cédés 2023-2024)",
    ],
    bio:
      "Ingénieur de l'École Polytechnique, Patrick Drahi a fondé Altice en 2001 et bâti un " +
      'empire télécoms/médias en Europe et aux États-Unis. En France, il contrôle Altice France ' +
      '(SFR). Ses actifs médias français (BFM TV, RMC, L\'Express) ont été cédés entre 2023 et 2024.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Patrick_Drahi',
    wikidataId: 'Q15714038',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q11774225 (vérifié wbsearchentities, "Czech businessman (born 1975)")
    //           + Wikipédia FR (Daniel Křetínský)
    // Rôle public attesté : fondateur de CMI (Czech Media Invest), actionnaire majoritaire de CMI France.
    // NOM_MDIPLO : "Daniel Křetínský" ou "Daniel Kretinsky"
    nom: 'Křetínský',
    prenom: 'Daniel',
    pays: 'République tchèque',
    nationalite: 'tchèque',
    dateNaissance: new Date('1975-07-06'),
    lieuNaissance: 'Brno (République tchèque)',
    rolePrincipal: 'Fondateur et PDG de Czech Media Invest (CMI)',
    rolesSecondaires: [
      "Actionnaire majoritaire de CMI France (L'Express, Elle, Marie Claire…)",
      'Actionnaire minoritaire du Groupe Le Monde (~20 %) via International Media Invest',
      'Fondateur de EP Energy (énergie)',
    ],
    bio:
      'Juriste de formation, Daniel Křetínský a bâti un conglomérat énergétique (EP Energy) puis ' +
      'médiatique via Czech Media Invest (CMI). En France, CMI France édite L\'Express depuis ' +
      'novembre 2023 (rachat à Altice Media). Il est également actionnaire minoritaire du Groupe ' +
      'Le Monde via International Media Invest (~20 % de Le Monde Libre SAS).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Daniel_K%C5%99et%C3%ADnsk%C3%BD',
    wikidataId: 'Q11774225',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3048836 (vérifié wbsearchentities, "French journalist and writer")
    //           + Wikipédia FR (Edwy Plenel)
    // Rôle public attesté : cofondateur et président de Mediapart depuis 2008.
    // NOM_MDIPLO : "Edwy Plenel"
    nom: 'Plenel',
    prenom: 'Edwy',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1952-07-02'),
    lieuNaissance: 'Nantes (Loire-Atlantique)',
    rolePrincipal: 'Cofondateur et président de Mediapart',
    rolesSecondaires: [
      'Ancien directeur de la rédaction du Monde (1996-2004)',
      'Journaliste, écrivain (Prix Albert-Londres 1980)',
    ],
    bio:
      'Journaliste d\'investigation formé au Monde dont il a été directeur de la rédaction de 1996 ' +
      'à 2004, Edwy Plenel a cofondé Mediapart en 2008 avec François Bonnet, Laurent Mauduit et ' +
      'Marie-Hélène Smiejan-Smiejant. Mediapart est détenu à 100 % par la Société éditrice de ' +
      'Mediapart (SEM), dont Plenel est l\'un des actionnaires fondateurs.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Edwy_Plenel',
    wikidataId: 'Q3048836',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — entités importantes absentes des seeds précédents.
// Pour chaque entrée, « NOM_MDIPLO » indique le nom exact probable dans la base
// (issu de l'import mdiplo) → rapprochement manuel à effectuer via l'admin.
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q12461 (vérifié wbsearchentities, "French daily newspaper founded in 1944")
    //           + Wikipédia FR (Le Monde) + Acrimed PPA
    // NOM_MDIPLO : "Le Monde"
    // À NE PAS confondre avec « Groupe Le Monde » (Q3117473, déjà dans seed-fortunes-3).
    nom: 'Le Monde',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.lemonde.fr',
    description:
      'Quotidien français de référence fondé le 19 décembre 1944 par Hubert Beuve-Méry. ' +
      'Publié par la SA Le Monde, filiale du Groupe Le Monde (Q3117473). ' +
      'Contrôlé à 72,5 % par Le Monde Libre SAS (Fonds pour l\'indépendance de la presse depuis avril 2024). ' +
      'Tirage moyen (2023) : ~290 000 exemplaires ; site lemonde.fr ~30 M de visiteurs uniques/mois.',
    dateCreation: new Date('1944-12-19'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Le_Monde',
    wikidataId: 'Q12461',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1490400 (vérifié wbsearchentities, "entreprise de médias française")
    //           + Wikipédia FR (Lagardère SA) + Acrimed PPA
    // NOM_MDIPLO : "Lagardère" ou "Lagardère Group"
    nom: 'Lagardère',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.lagardere.com',
    description:
      'Groupe de médias français fondé par Jean-Luc Lagardère. Historiquement coté au CAC 40, ' +
      'racheté intégralement par Vivendi SE (squeeze-out décembre 2023). ' +
      'Pôle édition : Hachette Livre (1er éditeur FR, Larousse, Fayard, Stock, Calmann-Lévy). ' +
      'Pôle médias : Europe 1, Le Journal du Dimanche, Paris Match (détenus indirectement via filiales). ' +
      'Pôle distribution : Lagardère Travel Retail.',
    dateCreation: new Date('1992-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Lagard%C3%A8re_(entreprise)',
    wikidataId: 'Q1490400',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q20967159 (vérifié wbsearchentities)
    //           + Wikipédia FR (Altice France) + Acrimed PPA
    // NOM_MDIPLO : "Altice France" ou "SFR"
    nom: 'Altice France',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.altice.fr',
    description:
      'Filiale française d\'Altice Group (fondé par Patrick Drahi Q15714038). ' +
      'Maison mère de SFR (2e opérateur télécom FR). ' +
      'Anciens actifs médias (BFM TV, RMC, L\'Express) cédés en 2023-2024 : ' +
      'BFM TV et RMC vendus à CMA Média (Saadé) en juillet 2024 ; L\'Express vendu à CMI France (Křetínský) en novembre 2023.',
    dateCreation: new Date('2002-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Altice_France',
    wikidataId: 'Q20967159',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q110415285 (vérifié wbsearchentities, "French media holding")
    //           + Wikipédia FR (CMI France) + presse (Le Monde, 2023)
    // NOM_MDIPLO : "CMI France" (probable)
    nom: 'CMI France',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.cmi-france.fr',
    description:
      'Holding de médias française contrôlée par Daniel Křetínský (Czech Media Invest). ' +
      'Éditeur de L\'Express (rachat à Altice Media, novembre 2023), Elle France, Marie Claire, ' +
      'Version Femina, Télé 7 Jours, France Dimanche et d\'autres titres de presse magazine. ' +
      'Anciennement Mondadori France (racheté en 2018).',
    dateCreation: new Date('2018-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/CMI_France',
    wikidataId: 'Q110415285',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q770596 (vérifié wbsearchentities, "French weekly news magazine")
    //           + Wikipédia FR (L'Express) + Acrimed PPA
    // NOM_MDIPLO : "L'Express"
    nom: "L'Express",
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.lexpress.fr',
    description:
      'Magazine d\'information français fondé en 1953 par Jean-Jacques Servan-Schreiber et Françoise Giroud. ' +
      'Passé du groupe L\'Express-L\'Expansion (Roularta) à Altice Media en 2015, ' +
      'puis à CMI France (Daniel Křetínský) en novembre 2023 pour environ 40 M€. ' +
      'Diffusion papier en déclin mais forte présence numérique.',
    dateCreation: new Date('1953-05-16'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/L%27Express',
    wikidataId: 'Q770596',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3117481 (vérifié wbsearchentities, "French media broadcaster")
    //           + Wikipédia FR (Groupe M6) + Acrimed PPA
    // NOM_MDIPLO : "M6" ou "Groupe M6" ou "RTL Group"
    nom: 'Groupe M6',
    sigle: 'M6',
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.m6.fr',
    description:
      'Groupe audiovisuel français coté à Euronext Paris. ' +
      'Actionnaire de référence historique : RTL Group (Bertelsmann), environ 48 % du capital. ' +
      'Chaînes : M6, W9, 6ter, Paris Première, Téva. Radio : RTL, Fun Radio. ' +
      'La tentative de fusion avec TF1 (2021-2022) a été abandonnée en septembre 2022 ' +
      'après refus de l\'Autorité de la concurrence.',
    dateCreation: new Date('1987-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Groupe_M6',
    wikidataId: 'Q3117481',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2412906 (vérifié wbsearchentities, "French media holding company")
    //           + Wikipédia FR (Groupe TF1) + Acrimed PPA
    // NOM_MDIPLO : "TF1" ou "Groupe TF1"
    nom: 'Groupe TF1',
    sigle: 'TF1',
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.tf1.fr',
    description:
      'Groupe audiovisuel français leader de l\'audience nationale. ' +
      'Coté à Euronext Paris ; actionnaire de référence : Bouygues SA (~43,7 % du capital). ' +
      'Chaînes : TF1, TMC, TFX, TF1 Séries Films, LCI. ' +
      'Privatisé en 1987 (actionnaire Bouygues depuis 1987). ' +
      'La tentative de fusion avec M6 (2021-2022) a été abandonnée en septembre 2022.',
    dateCreation: new Date('1987-04-16'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Groupe_TF1',
    wikidataId: 'Q2412906',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1124861 (vérifié wbsearchentities, "French public television group")
    //           + Wikipédia FR (France Télévisions)
    // NOM_MDIPLO : "France Télévisions"
    nom: 'France Télévisions',
    sigle: 'FTV',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.francetelevisions.fr',
    description:
      'Société nationale de programmes détenue à 100 % par l\'État français. ' +
      'Regroupe France 2, France 3, France 4, France 5, France Ô (supprimée 2020) et franceinfo:. ' +
      'Présidente-directrice générale : Delphine Ernotte Cunci (depuis 2015, renouvelée 2020). ' +
      'Budget annuel ~2,9 Mds€ (dont ~2,5 Mds€ de dotation publique).',
    dateCreation: new Date('1992-09-07'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/France_T%C3%A9l%C3%A9visions',
    wikidataId: 'Q1124861',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2120364 (vérifié wbsearchentities, "French public service radio broadcaster")
    //           + Wikipédia FR (Radio France)
    // NOM_MDIPLO : "Radio France"
    nom: 'Radio France',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.radiofrance.fr',
    description:
      'Société nationale de radiodiffusion détenue à 100 % par l\'État français. ' +
      'Regroupe France Inter, France Info, France Culture, France Musique, France Bleu (44 stations), ' +
      'Mouv\' et FIP. ' +
      'Présidente : Sibyle Veil (depuis 2018).',
    dateCreation: new Date('1975-07-06'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Radio_France',
    wikidataId: 'Q2120364',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q660769 (vérifié wbsearchentities, "French newspaper")
    //           + Wikipédia FR (Ouest-France) + Acrimed PPA
    // NOM_MDIPLO : "Ouest-France"
    // Premier quotidien français par tirage (600 000 ex./jour en 2023).
    nom: 'Ouest-France',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.ouest-france.fr',
    description:
      'Premier quotidien français par tirage (~600 000 ex./jour) et par audience numérique. ' +
      'Fondé en 1944. Éditeur : SA du journal Ouest-France, filiale de SIPA — Ouest-France (Q3117551). ' +
      'Siège : Rennes (Ille-et-Vilaine). Directeur de la publication : François-Xavier Lefranc. ' +
      'Couverture : Grand Ouest (Bretagne, Pays de la Loire, Normandie, Sarthe).',
    dateCreation: new Date('1944-08-07'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Ouest-France',
    wikidataId: 'Q660769',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3117551 (vérifié wbsearchentities, "Holding française, propriétaire du journal Ouest-France")
    //           + Wikipédia FR (SIPA – Ouest-France)
    // NOM_MDIPLO : "SIPA Ouest-France" ou "SIPA — Ouest-France"
    nom: 'SIPA — Ouest-France',
    sigle: 'SIPA',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.sipa-ouest-france.fr',
    description:
      'Groupe de presse régionale français, holding propriétaire du quotidien Ouest-France (Q660769). ' +
      'Contrôlé par l\'association Cœur de Bretagne (actionnaire majoritaire), liée à la famille Hutin. ' +
      'Regroupe également des participations dans des titres de presse régionale (Presse Océan, Maine Libre…) ' +
      'et le groupe de petites annonces Le Bon Coin (participation historique). ' +
      'Structure indépendante des grands groupes financiers parisiens.',
    dateCreation: new Date('1990-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/SIPA_%E2%80%94_Ouest-France',
    wikidataId: 'Q3117551',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2567583 (vérifié wbsearchentities, "French daily newspaper")
    //           + Wikipédia FR (La Voix du Nord) + Acrimed PPA
    // NOM_MDIPLO : "La Voix du Nord"
    nom: 'La Voix du Nord',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.lavoixdunord.fr',
    description:
      'Premier quotidien régional du Nord-Pas-de-Calais, fondé en 1941 (Résistance). ' +
      'Tirage ~170 000 ex./jour. ' +
      'Détenu depuis 2022 par le groupe Rossel (Belgique), qui a racheté le groupe VDN à ' +
      'la famille Lepers-Lemoine, abandonnant ainsi une structure familiale historique. ' +
      'Siège : Lille.',
    dateCreation: new Date('1944-09-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/La_Voix_du_Nord',
    wikidataId: 'Q2567583',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q619342 (vérifié wbsearchentities, "French independent online newspaper")
    //           + Wikipédia FR (Mediapart) + Le Monde diplomatique (PPA)
    // NOM_MDIPLO : "Mediapart"
    nom: 'Mediapart',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.mediapart.fr',
    description:
      'Journal d\'investigation en ligne, 100 % numérique, fondé en mars 2008 par Edwy Plenel, ' +
      'François Bonnet, Laurent Mauduit et Marie-Hélène Smiejan-Smiejant. ' +
      'Détenu à 100 % par la Société éditrice de Mediapart (SEM), dont les salariés sont actionnaires ' +
      'majoritaires depuis 2023 (rachat des parts du fondateur). ' +
      'Environ 250 000 abonnés payants en 2024. Modèle sans publicité ni subvention publique.',
    dateCreation: new Date('2008-03-16'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Mediapart',
    wikidataId: 'Q619342',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3117475 (vérifié via API wbgetentities, label FR "Groupe Les Échos-Le Parisien",
    //           description FR "holding française dans le domaine des médias et de la publicité")
    //           + Wikipédia FR (Groupe Les Échos-Le Parisien) + LVMH.com
    // NOM_MDIPLO : absent (holding intermédiaire LVMH, rarement nommée dans les datasets publics)
    nom: 'Groupe Les Échos-Le Parisien',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.groupelesechos-leparisien.fr',
    description:
      'Holding médias du groupe LVMH (Q504998), regroupant les titres de presse détenus par Bernard Arnault. ' +
      'Comprend Les Échos (Q923193, acq. 2007, 240 M€), Le Parisien (Q142348, acq. 2015), ' +
      'Radio Classique (Q1340362) et les sites numériques associés. ' +
      'PDG depuis 2018 : Pierre Louette.',
    dateCreation: new Date('2015-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Groupe_Les_%C3%89chos-Le_Parisien',
    wikidataId: 'Q3117475',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — 2 sources minimum par claim, datées, vérifiées.
// dateConsultation : 2026-07-02
// ---------------------------------------------------------------------------

const SOURCES = {
  acrimed_ppa: {
    url: 'https://www.acrimed.org/Medias-francais-qui-possede-quoi',
    titre: 'Médias français : qui possède quoi — Acrimed',
    media: 'Acrimed',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-01-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Rédaction Acrimed',
    description:
      'Carte interactive des propriétaires des principaux médias français (presse, TV, radio, numérique). ' +
      'Mise à jour régulière. Corroboration des liens de détention.',
    verifiee: true,
  },
  wp_le_monde: {
    url: 'https://fr.wikipedia.org/wiki/Le_Monde',
    titre: 'Le Monde — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Journal fondé 1944, publié par SA Le Monde filiale du Groupe Le Monde. ' +
      'Fonds pour l\'indépendance de la presse (FIP) contrôle Le Monde Libre SAS depuis avril 2024.',
    verifiee: true,
  },
  wp_lagardere: {
    url: 'https://fr.wikipedia.org/wiki/Lagard%C3%A8re_(entreprise)',
    titre: 'Lagardère (entreprise) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Vivendi a atteint ~57 % de Lagardère SA en 2022, puis squeeze-out en décembre 2023. ' +
      'Pôle médias : Europe 1, JDD, Paris Match, Hachette Livre.',
    verifiee: true,
  },
  wp_drahi: {
    url: 'https://fr.wikipedia.org/wiki/Patrick_Drahi',
    titre: 'Patrick Drahi — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Fondateur Altice Group, actionnaire de référence Altice France (SFR). ' +
      'Cession BFM TV+RMC à CMA Média (juil. 2024), L\'Express à CMI France (nov. 2023).',
    verifiee: true,
  },
  wp_altice_fr: {
    url: 'https://fr.wikipedia.org/wiki/Altice_France',
    titre: 'Altice France — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Filiale française d\'Altice Group (Drahi). Anciens actifs médias cédés : BFM TV+RMC (juil. 2024), ' +
      'L\'Express (nov. 2023).',
    verifiee: true,
  },
  wp_kretinsky: {
    url: 'https://fr.wikipedia.org/wiki/Daniel_K%C5%99et%C3%ADnsk%C3%BD',
    titre: 'Daniel Křetínský — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Fondateur CMI (Czech Media Invest). CMI France : rachat L\'Express à Altice nov. 2023. ' +
      'Actionnaire minoritaire Groupe Le Monde via International Media Invest.',
    verifiee: true,
  },
  wp_cmi_france: {
    url: 'https://fr.wikipedia.org/wiki/CMI_France',
    titre: 'CMI France — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Holding de presse magazine détenue par Daniel Křetínský. Éditeur de L\'Express (depuis nov. 2023), ' +
      'Elle France, Marie Claire, Télé 7 Jours, France Dimanche.',
    verifiee: true,
  },
  wp_mediapart: {
    url: 'https://fr.wikipedia.org/wiki/Mediapart',
    titre: 'Mediapart — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Journal numérique fondé mars 2008 par Edwy Plenel et co-fondateurs. ' +
      'Salariés actionnaires majoritaires depuis 2023. ~250 000 abonnés 2024.',
    verifiee: true,
  },
  wp_plenel: {
    url: 'https://fr.wikipedia.org/wiki/Edwy_Plenel',
    titre: 'Edwy Plenel — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Journaliste, ancien directeur du Monde (1996-2004), cofondateur et président de Mediapart (2008). ' +
      'Prix Albert-Londres 1980.',
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
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Groupe Le Monde contrôle Le Monde (journal), Le Monde diplomatique (51 %), HuffPost France (85 %), ' +
      'Courrier International, Télérama, La Vie.',
    verifiee: true,
  },
  wp_groupe_echos_parisien: {
    url: 'https://fr.wikipedia.org/wiki/Groupe_Les_%C3%89chos-Le_Parisien',
    titre: 'Groupe Les Échos-Le Parisien — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Holding médias de LVMH. Regroupe Les Échos (acq. 2007), Le Parisien (acq. 2015), Radio Classique.',
    verifiee: true,
  },
  wp_lagardere_arnaud: {
    url: 'https://fr.wikipedia.org/wiki/Arnaud_Lagard%C3%A8re',
    titre: 'Arnaud Lagardère — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Fils de Jean-Luc Lagardère, héritier du groupe éponyme en 2003. ' +
      'Vivendi a finalisé la prise de contrôle intégrale de Lagardère SA en décembre 2023.',
    verifiee: true,
  },
  wp_ouest_france: {
    url: 'https://fr.wikipedia.org/wiki/Ouest-France',
    titre: 'Ouest-France — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Premier quotidien français par tirage. Filiale de SIPA — Ouest-France. ' +
      'Structure indépendante contrôlée par l\'association Cœur de Bretagne.',
    verifiee: true,
  },
  wp_tf1_groupe: {
    url: 'https://fr.wikipedia.org/wiki/Groupe_TF1',
    titre: 'Groupe TF1 — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Leader audiences TV France. Bouygues actionnaire de référence (~43,7 % du capital). ' +
      'Privatisé en 1987 ; Bouygues actionnaire depuis 1987.',
    verifiee: true,
  },
  mdiplo_source: {
    url: 'https://github.com/mdiplo/Medias_francais',
    titre: 'Médias français : qui possède quoi — données mdiplo (ODC-By)',
    media: 'Le Monde diplomatique',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-01-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Le Monde diplomatique',
    description:
      'Base de données des liens capitalistiques entre actionnaires et médias français, licence ODC-By v1.0. ' +
      'Source primaire de l\'import mdiplo.',
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Polymorphe (P→O ou O→O). Résolution par wikidataId.
//
// Entités référencées par wikidataId (déjà dans d'autres seeds) :
//   Q3117473 : Groupe Le Monde (seed-fortunes-3)
//   Q504998  : LVMH (seed-fortunes-1)
//   Q923193  : Les Échos (seed-fortunes-1)
//   Q142348  : Le Parisien (seed-fortunes-1)
//   Q1127887 : Vivendi SE (seed-fortunes-2)
//   Q314407  : Europe 1 (seed-fortunes-2)
//   Q895325  : Bouygues (seed-cac40-b1)
//   Q1450891 : Xavier Niel (seed-fortunes-3)
//   Q11774225 : Daniel Křetínský (ce seed)
//   Q15714038 : Patrick Drahi (ce seed)
//   Q691440  : Arnaud Lagardère (ce seed)
//   Q3048836 : Edwy Plenel (ce seed)
// ---------------------------------------------------------------------------

const LIENS = [
  // ────── Groupe Le Monde → Le Monde journal ──────────────────────────────
  {
    // O→O : Groupe Le Monde éditeur de Le Monde journal
    // Sources : wp_groupe_le_monde (Wikipedia) + wp_le_monde (Wikipedia)
    // ≥ 2 sources indépendantes : verifiee: true
    aType: 'organisation',
    aRef: 'Q3117473',
    bType: 'organisation',
    bRef: 'Q12461',
    typeLienCode: 'EDITEUR_DE',
    description:
      'Le Groupe Le Monde (Q3117473) édite le quotidien Le Monde via sa filiale SA Le Monde. ' +
      'Le Monde Libre SAS contrôle le Groupe Le Monde à 72,5 %.',
    dateDebut: new Date('1944-12-19'),
    dateFin: null,
    sourceRef: 'wp_le_monde',
  },

  // ────── LVMH → Groupe Les Échos-Le Parisien ────────────────────────────
  {
    // O→O : LVMH détient le Groupe Les Échos-Le Parisien comme filiale
    // Sources : wp_groupe_echos_parisien (Wikipedia) + acrimed_ppa (Acrimed)
    aType: 'organisation',
    aRef: 'Q504998',
    bType: 'organisation',
    bRef: 'Q3117475',
    typeLienCode: 'FILIALE',
    description:
      'LVMH (Q504998) contrôle à 100 % le Groupe Les Échos-Le Parisien, ' +
      'holding de son pôle médias (Les Échos, Le Parisien, Radio Classique).',
    dateDebut: new Date('2015-01-01'),
    dateFin: null,
    sourceRef: 'wp_groupe_echos_parisien',
  },
  {
    // O→O : Groupe Les Échos-Le Parisien éditeur de Les Échos
    // Sources : wp_groupe_echos_parisien + acrimed_ppa
    aType: 'organisation',
    aRef: 'Q3117475',
    bType: 'organisation',
    bRef: 'Q923193',
    typeLienCode: 'EDITEUR_DE',
    description:
      'Le Groupe Les Échos-Le Parisien (Q3117475, filiale LVMH) édite Les Échos depuis ' +
      'l\'acquisition LVMH en novembre 2007 (240 M€).',
    dateDebut: new Date('2007-11-01'),
    dateFin: null,
    sourceRef: 'wp_groupe_echos_parisien',
  },
  {
    // O→O : Groupe Les Échos-Le Parisien éditeur de Le Parisien
    // Sources : wp_groupe_echos_parisien + acrimed_ppa
    aType: 'organisation',
    aRef: 'Q3117475',
    bType: 'organisation',
    bRef: 'Q142348',
    typeLienCode: 'EDITEUR_DE',
    description:
      'Le Groupe Les Échos-Le Parisien (Q3117475, filiale LVMH) édite Le Parisien depuis ' +
      'l\'acquisition LVMH auprès du groupe Amaury en 2015.',
    dateDebut: new Date('2015-01-01'),
    dateFin: null,
    sourceRef: 'wp_groupe_echos_parisien',
  },

  // ────── Arnaud Lagardère → Lagardère Group ──────────────────────────────
  {
    // P→O : Arnaud Lagardère, dirigeant de Lagardère SA
    // Sources : wp_lagardere_arnaud (Wikipedia) + wp_lagardere (Wikipedia)
    aType: 'personne',
    aRef: 'Q691440',
    bType: 'organisation',
    bRef: 'Q1490400',
    typeLienCode: 'DIRIGEANT',
    description:
      'Arnaud Lagardère dirige le groupe Lagardère SA depuis 2003 (succession de son père Jean-Luc †2003). ' +
      'Vivendi a pris le contrôle intégral du groupe en décembre 2023 (squeeze-out).',
    dateDebut: new Date('2003-03-27'),
    dateFin: null,
    sourceRef: 'wp_lagardere_arnaud',
  },

  // ────── Vivendi SE → Lagardère Group ────────────────────────────────────
  {
    // O→O : Vivendi SE actionnaire de contrôle de Lagardère SA depuis 2023
    // Sources : wp_lagardere (Wikipedia) + acrimed_ppa (Acrimed)
    aType: 'organisation',
    aRef: 'Q1127887',
    bType: 'organisation',
    bRef: 'Q1490400',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      'Vivendi SE (Q1127887) a acquis le contrôle de Lagardère SA progressivement (2020-2023). ' +
      'Squeeze-out finalisé en décembre 2023 — Vivendi détient alors 100 % de Lagardère SA. ' +
      'Lagardère n\'est plus cotée depuis début 2024.',
    dateDebut: new Date('2022-06-01'),
    dateFin: null,
    sourceRef: 'wp_lagardere',
  },

  // ────── Lagardère Group → Europe 1 ──────────────────────────────────────
  {
    // O→O : Lagardère Group éditeur historique d'Europe 1 (avant déconsolidation Vivendi)
    // Sources : wp_lagardere (Wikipedia) + acrimed_ppa (Acrimed)
    // NB : Vivendi→Europe 1 lien mediatique déjà dans seed-fortunes-2 / seed-barons-medias.
    aType: 'organisation',
    aRef: 'Q1490400',
    bType: 'organisation',
    bRef: 'Q314407',
    typeLienCode: 'EDITEUR_DE',
    description:
      'Lagardère SA est éditeur d\'Europe 1 via Lagardère Médias/Lagardère News. ' +
      'Depuis la prise de contrôle de Lagardère par Vivendi (2022-2023), Europe 1 est ' +
      'indirectement contrôlée par Vivendi SE.',
    dateDebut: new Date('1955-01-01'),
    dateFin: null,
    sourceRef: 'wp_lagardere',
  },

  // ────── Patrick Drahi → Altice France ───────────────────────────────────
  {
    // P→O : Drahi dirigeant et actionnaire de référence d'Altice France
    // Sources : wp_drahi (Wikipedia) + wp_altice_fr (Wikipedia)
    aType: 'personne',
    aRef: 'Q15714038',
    bType: 'organisation',
    bRef: 'Q20967159',
    typeLienCode: 'DIRIGEANT',
    description:
      'Patrick Drahi a fondé Altice Group en 2001 et contrôle Altice France (maison mère de SFR) ' +
      'via Next Private BV, son holding luxembourgeois. Il reste actionnaire de référence d\'Altice France.',
    dateDebut: new Date('2012-01-01'),
    dateFin: null,
    sourceRef: 'wp_drahi',
  },
  {
    // P→O : Drahi actionnaire majoritaire d'Altice France
    // Sources : wp_drahi + acrimed_ppa
    aType: 'personne',
    aRef: 'Q15714038',
    bType: 'organisation',
    bRef: 'Q20967159',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      'Patrick Drahi contrôle la majorité du capital d\'Altice France via Next Private BV (Luxembourg). ' +
      'Anciens actifs médias cédés : BFM TV + RMC → CMA Média (juillet 2024) ; L\'Express → CMI France (novembre 2023).',
    dateDebut: new Date('2012-01-01'),
    dateFin: null,
    sourceRef: 'acrimed_ppa',
  },

  // ────── Altice France → L'Express (détention passée) ───────────────────
  {
    // O→O : Altice France éditeur de L'Express (2015-2023)
    // Sources : wp_altice_fr (Wikipedia) + acrimed_ppa (Acrimed)
    aType: 'organisation',
    aRef: 'Q20967159',
    bType: 'organisation',
    bRef: 'Q770596',
    typeLienCode: 'EDITEUR_DE',
    description:
      'Altice France (via Altice Media) a édité L\'Express de 2015 à novembre 2023, ' +
      'date de cession à CMI France (Daniel Křetínský) pour environ 40 M€.',
    dateDebut: new Date('2015-01-01'),
    dateFin: new Date('2023-11-01'),
    sourceRef: 'wp_altice_fr',
  },

  // ────── Daniel Křetínský → CMI France → L'Express ───────────────────────
  {
    // P→O : Křetínský actionnaire de CMI France
    // Sources : wp_kretinsky (Wikipedia) + wp_cmi_france (Wikipedia)
    aType: 'personne',
    aRef: 'Q11774225',
    bType: 'organisation',
    bRef: 'Q110415285',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      'Daniel Křetínský contrôle CMI France (Czech Media Invest France) via Czech Media Invest (CMI). ' +
      'CMI France éditeur de L\'Express, Elle, Marie Claire, Télé 7 Jours et autres titres de presse magazine.',
    dateDebut: new Date('2018-01-01'),
    dateFin: null,
    sourceRef: 'wp_kretinsky',
  },
  {
    // O→O : CMI France éditeur de L'Express (depuis novembre 2023)
    // Sources : wp_cmi_france (Wikipedia) + wp_kretinsky (Wikipedia)
    aType: 'organisation',
    aRef: 'Q110415285',
    bType: 'organisation',
    bRef: 'Q770596',
    typeLienCode: 'EDITEUR_DE',
    description:
      'CMI France édite L\'Express depuis novembre 2023, date de rachat à Altice Media pour ~40 M€. ' +
      'L\'Express devient ainsi une propriété de la sphère Křetínský, aux côtés d\'Elle et Marie Claire.',
    dateDebut: new Date('2023-11-01'),
    dateFin: null,
    sourceRef: 'wp_cmi_france',
  },

  // ────── SIPA — Ouest-France → Ouest-France journal ──────────────────────
  {
    // O→O : SIPA éditeur de Ouest-France
    // Sources : wp_ouest_france (Wikipedia) + acrimed_ppa (Acrimed)
    aType: 'organisation',
    aRef: 'Q3117551',
    bType: 'organisation',
    bRef: 'Q660769',
    typeLienCode: 'EDITEUR_DE',
    description:
      'SIPA — Ouest-France (Q3117551) est le groupe éditeur du quotidien Ouest-France (Q660769), ' +
      'premier quotidien français par tirage (~600 000 ex.). ' +
      'Structure indépendante contrôlée par l\'association Cœur de Bretagne (famille Hutin).',
    dateDebut: new Date('1990-01-01'),
    dateFin: null,
    sourceRef: 'wp_ouest_france',
  },

  // ────── Edwy Plenel → Mediapart ─────────────────────────────────────────
  {
    // P→O : Plenel cofondateur de Mediapart
    // Sources : wp_plenel (Wikipedia) + wp_mediapart (Wikipedia)
    aType: 'personne',
    aRef: 'Q3048836',
    bType: 'organisation',
    bRef: 'Q619342',
    typeLienCode: 'FONDATEUR',
    description:
      'Edwy Plenel est cofondateur et président de Mediapart depuis sa création en mars 2008, ' +
      'avec François Bonnet, Laurent Mauduit et Marie-Hélène Smiejan-Smiejant.',
    dateDebut: new Date('2008-03-16'),
    dateFin: null,
    sourceRef: 'wp_plenel',
  },

  // ────── Bouygues → Groupe TF1 ───────────────────────────────────────────
  {
    // O→O : Bouygues actionnaire de référence de Groupe TF1
    // Sources : wp_tf1_groupe (Wikipedia) + acrimed_ppa (Acrimed)
    aType: 'organisation',
    aRef: 'Q895325',
    bType: 'organisation',
    bRef: 'Q2412906',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      'Bouygues SA (Q895325) est actionnaire de référence de Groupe TF1 avec ~43,7 % du capital, ' +
      'ce qui lui assure le contrôle effectif depuis la privatisation de TF1 en 1987. ' +
      'Directeur général : Rodolphe Belmer.',
    dateDebut: new Date('1987-04-16'),
    dateFin: null,
    sourceRef: 'wp_tf1_groupe',
  },

  // ────── Xavier Niel → Le Monde (journal) ────────────────────────────────
  {
    // P→O : Xavier Niel co-actionnaire historique du Groupe Le Monde
    //        (déjà seeded dans fortunes-3 via NJJ Holding → Groupe Le Monde)
    //        Ajout d'un lien mediatique pour le rôle éditorial indirect, attribué à Acrimed.
    // Sources : wp_groupe_le_monde (Wikipedia) + acrimed_ppa (Acrimed)
    // ⚠ Caractérisation : selon Acrimed, la co-propriété de Niel est un fait capitalistique
    //   documenté, pas une influence éditoriale directe (charte rédactionnelle préserve l'indépendance).
    aType: 'personne',
    aRef: 'Q1450891',
    bType: 'organisation',
    bRef: 'Q12461',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      'Xavier Niel a co-fondé Le Monde Libre SAS en 2010 (avec Pigasse et Bergé) qui contrôle ' +
      'le Groupe Le Monde. Ses parts ont été transférées au Fonds pour l\'indépendance de la ' +
      'presse (FIP) en avril 2024. Source capitalistique : Acrimed, Wikipedia FR.',
    dateDebut: new Date('2010-11-01'),
    dateFin: new Date('2024-04-01'),
    sourceRef: 'acrimed_ppa',
  },
]

// ---------------------------------------------------------------------------
// Helpers — alignés sur seed-macron-v2.js
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-raffermir-medias] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

async function upsertPersonne(data, userId) {
  const existing = await prisma.personne.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.personne.update({ where: { id: existing.id }, data: { ...data, statut: 'EN_ATTENTE' } })
  }
  return prisma.personne.create({ data: { ...data, statut: 'EN_ATTENTE', creeParId: userId } })
}

async function upsertOrganisation(data, userId) {
  // 1. Upsert par wikidataId (prioritaire — absorbe les entrées seeds précédents ET les entrées
  //    mdiplo si celles-ci ont déjà été enrichies dans un run précédent).
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return prisma.organisation.update({ where: { id: existing.id }, data: { ...data, statut: 'EN_ATTENTE' } })
  }
  // 2. Aucune entrée avec ce wikidataId → création.
  //    Si une entrée mdiplo du même nom existe sans Q-id, elle coexistera temporairement.
  //    → Voir commentaires NOM_MDIPLO dans la section ORGANISATIONS pour le rapprochement manuel.
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
  throw new Error(`[seed-raffermir-medias] Type entité inconnu : ${type}`)
}

function fkPourEntite(type, entite, position) {
  const suffix = position === 'A' ? 'AId' : 'BId'
  if (type === 'personne') return { [`personne${suffix}`]: entite.id }
  if (type === 'organisation') return { [`organisation${suffix}`]: entite.id }
  throw new Error(`[seed-raffermir-medias] Type FK inconnu : ${type}`)
}

async function creerLien(lien, sourcesMap, userId) {
  const entiteA = await trouverEntite(lien.aType, lien.aRef)
  const entiteB = await trouverEntite(lien.bType, lien.bRef)
  if (!entiteA || !entiteB) {
    console.warn(
      `  ⚠ Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef}) — lien ignoré`,
    )
    return null
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    console.warn(`  ⚠ TypeLien introuvable : ${lien.typeLienCode} — lien ignoré`)
    return null
  }

  const fkA = fkPourEntite(lien.aType, entiteA, 'A')
  const fkB = fkPourEntite(lien.bType, entiteB, 'B')

  const existing = await prisma.lien.findFirst({
    where: { ...fkA, ...fkB, typeLienId: typeLien.id },
  })

  const source = sourcesMap[lien.sourceRef] ?? null

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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n┌─ seed-raffermir-medias — enrichissement graphe médias FR ─┐\n')

  const user = await getUserAdmin()
  console.log(`✓ User : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ✓ ${data.titre}`)
  }

  console.log('\n— Personnes —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ✓ ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n— Organisations —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ✓ ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Liens —')
  let liensCreed = 0
  let liensIgnores = 0
  for (const lien of LIENS) {
    const result = await creerLien(lien, sourcesMap, user.id)
    if (result) {
      liensCreed++
      console.log(`  ✓ ${lien.typeLienCode} : ${lien.aRef} → ${lien.bRef}`)
    } else {
      liensIgnores++
    }
  }

  console.log('\n┌─ Bilan ─────────────────────────────────────────────────────────┐')
  console.log(`│ Personnes enrichies  : ${PERSONNES.length} (Lagardère A., Drahi, Křetínský, Plenel)`)
  console.log(`│ Organisations        : ${ORGANISATIONS.length} (Le Monde j., Lagardère, Altice France, CMI Fr,`)
  console.log(`│                        L'Express, M6, TF1, FTV, RF, Ouest-Fr, SIPA,`)
  console.log(`│                        La Voix du Nord, Mediapart, Gr. Échos-Parisien)`)
  console.log(`│ Sources              : ${Object.keys(SOURCES).length} (Wikipedia FR, Acrimed, mdiplo)`)
  console.log(`│ Liens créés/mis à j. : ${liensCreed} / Ignorés (entité manquante) : ${liensIgnores}`)
  console.log('│')
  console.log('│ Rapprochement manuel requis (NOM_MDIPLO dans code) :')
  console.log('│   "Le Monde", "Lagardère", "Altice France", "CMI France",')
  console.log('│   "L\'Express", "M6"/"Groupe M6", "TF1"/"Groupe TF1",')
  console.log('│   "France Télévisions", "Radio France", "Ouest-France",')
  console.log('│   "SIPA Ouest-France", "La Voix du Nord", "Mediapart",')
  console.log('│   "Arnaud Lagardère", "Patrick Drahi", "Daniel Křetínský", "Edwy Plenel"')
  console.log('└─────────────────────────────────────────────────────────────────┘\n')
}

main()
  .catch((err) => {
    console.error('[seed-raffermir-medias] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
