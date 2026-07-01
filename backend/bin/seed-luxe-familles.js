/**
 * Seed Luxe Familles — holdings de contrôle du luxe français (hors LVMH/Arnault et Dassault).
 * Enquête OSINT journalistique du 2026-07-01.
 *
 * Périmètre :
 *   PINAULT  — François Pinault (Q1451167) + Artémis (Q2866000, holding)
 *               → Kering (Q931207, déjà en base), Christie's (Q503176), Puma (Q157064).
 *               François-Henri Pinault (Q1371822, déjà en base cac40-b3) : DIRIGEANT Artémis.
 *
 *   BETTENCOURT — Françoise Bettencourt Meyers (Q516720, déjà en base cac40-b3)
 *               → L'Oréal (Q156077, déjà en base cac40-b3) via Téthys Invest (~33 %).
 *               Jean-Victor Meyers (Q3170071, déjà en base cac40-b3) : lien ADMINISTRATEUR
 *               déjà créé dans cac40-b3. Nicolas Meyers (pas de Q-id vérifié) : EXCLU.
 *               Téthys SAS : aucun Q-id Wikidata stable trouvé → EXCLUE (règle sans Q-id = exclure).
 *               Lien capitalistique matérialisé directement via Françoise BM (bénéficiaire réel).
 *
 *   WERTHEIMER — Alain Wertheimer (Q557074) + Gérard Wertheimer (Q732167) → Chanel (Q218115).
 *
 *   RICHEMONT  — Johann Rupert (Q6216224) → Compagnie Financière Richemont (Q689240).
 *
 * Entités déjà en base (créées par cac40-b3 / fortunes-1) — référencées par Q-id dans les liens,
 * mais NON recréées : Q1371822 (F.-H. Pinault), Q516720 (F. Bettencourt Meyers), Q3170071 (J.-V. Meyers),
 * Q931207 (Kering), Q156077 (L'Oréal).
 *
 * Codes ADR-027 utilisés : ACTIONNAIRE_MAJORITAIRE, DETENTION_CAPITAL, FILIALE,
 * BENEFICIAIRE_EFFECTIF, DIRIGEANT, FONDATEUR, famille.
 *
 * Sources : Wikidata (Q-ids tous vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR/EN, sites officiels (groupeartemis.com, loreal.com),
 *           FashionNetwork, richemont.com.
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-luxe-familles.js
 *   cd backend && node bin/seed-luxe-familles.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — nouvelles entités uniquement (non présentes dans cac40-b3).
// Chaque fiche recoupée par ≥ 2 sources publiques.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q1451167 (vérifié Special:EntityData — né 21/08/1936) + Wikipédia FR
    // Rôle public attesté : fondateur du groupe PPR / Artémis, collectionneur d'art, milliardaire public
    nom: 'Pinault',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1936-08-21'),
    lieuNaissance: 'Les Champs-Géraux (Côtes-du-Nord)',
    rolePrincipal: "Fondateur du groupe Artémis et du conglomérat de luxe Kering (ex-PPR)",
    rolesSecondaires: [
      "Fondateur d'Artémis SAS (1992), holding familiale de contrôle",
      "Fondateur et ancien PDG de Pinault-Printemps-Redoute (PPR, devenu Kering)",
      "Grand collectionneur d'art contemporain (Palazzo Grassi, Bourse de commerce, Paris)",
    ],
    bio:
      "Né en Bretagne le 21 août 1936, François Pinault a bâti un empire commercial de la " +
      "distribution (Fnac, Conforama, Printemps) à partir des années 1960 avant de pivoter " +
      "vers le luxe (acquisition de Gucci en 1999). Il fonde Artémis SAS en 1992 pour " +
      "centraliser le contrôle familial. Son fils François-Henri dirige le groupe Kering depuis 2005.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Pinault',
    wikidataId: 'Q1451167',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q557074 (vérifié Special:EntityData — né 28/09/1948) + Wikipédia EN
    //           + Forbes Billionaires (co-propriétaire Chanel, patrimoine public)
    // Rôle public attesté : président exécutif de Chanel Ltd (fonction publique de dirigeant)
    nom: 'Wertheimer',
    prenom: 'Alain',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1948-09-28'),
    lieuNaissance: 'France',
    rolePrincipal: "Président exécutif de Chanel Ltd (co-propriétaire avec son frère Gérard)",
    rolesSecondaires: [
      "Petit-fils de Théophile Wertheimer, premier partenaire commercial de Coco Chanel (1924)",
      "Résidence principale : New York",
    ],
    bio:
      "Alain Wertheimer est le petit-fils de Théophile Wertheimer, qui a financé Coco Chanel en 1924 " +
      "en échange d'une participation dans la maison. Avec son frère Gérard, il co-possède et " +
      "co-contrôle Chanel Ltd. Il en a été co-PDG jusqu'en 2021, date à laquelle Leena Nair " +
      "(ex-Unilever) est nommée CEO, Alain conservant le rôle de président exécutif.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Alain_Wertheimer',
    wikidataId: 'Q557074',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q732167 (vérifié Special:EntityData — né 17/04/1951, Paris)
    //           + Wikipédia EN/FR (Gérard Wertheimer)
    // Rôle public attesté : co-propriétaire et directeur de Chanel Ltd
    nom: 'Wertheimer',
    prenom: 'Gérard',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1951-04-17'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Directeur et co-propriétaire de Chanel Ltd",
    rolesSecondaires: [
      "Frère d'Alain Wertheimer, co-héritier de la participation familiale dans Chanel",
      "Ancien copropriétaire de Bourjois (cosmétiques)",
    ],
    bio:
      "Gérard Wertheimer est le frère cadet d'Alain Wertheimer et l'autre co-propriétaire de " +
      "Chanel Ltd. Les deux frères ont hérité du contrôle de la maison de mode fondée par " +
      "Gabrielle Chanel, via la participation familiale établie en 1924 par leur grand-père " +
      "Théophile Wertheimer. Gérard siège au conseil de direction de Chanel Ltd.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/G%C3%A9rard_Wertheimer',
    wikidataId: 'Q732167',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q6216224 (vérifié Special:EntityData — né 01/06/1950) + Wikipédia EN
    //           + Richemont.com (confirmation rôle chairman)
    // Rôle public attesté : fondateur et président non-exécutif de Richemont
    nom: 'Rupert',
    prenom: 'Johann',
    pays: 'Suisse',
    nationalite: 'sud-africaine et suisse',
    dateNaissance: new Date('1950-06-01'),
    lieuNaissance: 'Afrique du Sud',
    rolePrincipal: "Fondateur et président non-exécutif de la Compagnie Financière Richemont SA",
    rolesSecondaires: [
      "Fils d'Anton Rupert, fondateur du groupe Remgro",
      "Contrôle 51 % des droits de vote de Richemont via Compagnie Financière Rupert",
    ],
    bio:
      "Johann Rupert a fondé la Compagnie Financière Richemont en 1988 en scindant les actifs " +
      "non-tabac du groupe familial Rembrandt (Afrique du Sud). Il exerce le contrôle via " +
      "la Compagnie Financière Rupert, qui détient 10 % du capital mais 51 % des droits de vote " +
      "de Richemont. Richemont possède Cartier, Van Cleef & Arpels, IWC, Jaeger-LeCoultre et d'autres marques.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Johann_Rupert',
    wikidataId: 'Q6216224',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — nouvelles entités uniquement.
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q2866000 (vérifié Special:EntityData — "French holding company") +
    //           Wikipédia FR + groupeartemis.com (site officiel)
    // Fondée le 10 juillet 1990 (source Wikidata P571)
    nom: 'Artémis',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.groupeartemis.com',
    description:
      "Holding patrimoniale de la famille Pinault (SAS). " +
      "Actionnaire majoritaire de Kering (42,23 % au 15 févr. 2024), propriétaire à 100 % de " +
      "Christie's (acquis en 1998) et actionnaire de référence de Puma SE (~28,7 %). " +
      "Détient aussi Le Point, Stade Rennais FC, Ponant et des domaines viticoles (Château Latour). " +
      "Siège : 12 avenue Montaigne, Paris 8e. Présidée par François-Henri Pinault.",
    dateCreation: new Date('1990-07-10'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Art%C3%A9mis_(groupe)',
    wikidataId: 'Q2866000',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q503176 (vérifié Special:EntityData — P749=Q2866000 = Artémis) +
    //           Wikipédia FR (Christie's) + groupeartemis.com
    // OPA de François Pinault via Artémis en 1998
    nom: "Christie's",
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'Royaume-Uni',
    siteWeb: 'https://www.christies.com',
    description:
      "Maison de ventes aux enchères d'art et de biens de collection fondée à Londres en 1766. " +
      "Rachetée par François Pinault via Artémis en 1998 (OPA après une première participation de ~30 %). " +
      "Société à capitaux privés, filiale directe d'Artémis. " +
      "54 bureaux dans 32 pays, ~5,7 milliards USD de ventes en 2024.",
    dateCreation: new Date('1766-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Christie%27s',
    wikidataId: 'Q503176',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q157064 (vérifié wbsearchentities — "German multinational corporation") +
    //           Wikipédia FR (Puma entreprise) — Artémis ~28,7 % depuis désengagement Kering 2018-2021
    nom: 'Puma SE',
    sigle: 'PUMA',
    typeOrganisation: 'ENTREPRISE',
    pays: 'Allemagne',
    siteWeb: 'https://about.puma.com',
    description:
      "Fabricant allemand de chaussures, vêtements et équipements de sport. Fondé le 1er oct. 1948 " +
      "par Rudolf Dassler. Coté sur le MDAX. Artémis (famille Pinault) est actionnaire de " +
      "référence avec ~28,7 % du capital depuis le désengagement de Kering (2018-2021).",
    dateCreation: new Date('1948-10-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Puma_(entreprise)',
    wikidataId: 'Q157064',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q218115 (vérifié wbsearchentities — "French fashion house") +
    //           Wikipédia FR/EN (Chanel) + Forbes (propriété Wertheimer documentée publiquement)
    nom: 'Chanel',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.chanel.com',
    description:
      "Maison de mode de luxe fondée par Gabrielle \"Coco\" Chanel en 1910, connue pour le " +
      "No. 5, la veste Chanel et les sacs 2.55. Société privée (non cotée), co-détenue à 100 % " +
      "par les frères Alain et Gérard Wertheimer depuis 1974 (héritage de la participation " +
      "familiale créée en 1924 par Théophile Wertheimer). CEO : Leena Nair depuis 2022.",
    dateCreation: new Date('1910-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Chanel',
    wikidataId: 'Q218115',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q689240 (vérifié wbsearchentities — "Swiss holding company") +
    //           Wikipédia EN (Richemont) + richemont.com (gouvernance officielle)
    // Johann Rupert : 10 % capital, 51 % droits de vote via Compagnie Financière Rupert
    nom: 'Compagnie Financière Richemont SA',
    sigle: 'CFR',
    typeOrganisation: 'ENTREPRISE',
    pays: 'Suisse',
    siteWeb: 'https://www.richemont.com',
    description:
      "Groupe de luxe suisse fondé par Johann Rupert en 1988. " +
      "Cotée au SMI (Swiss Market Index, 4e capitalisation au 31 août 2025). " +
      "Maisons emblématiques : Cartier, Van Cleef & Arpels, IWC, Jaeger-LeCoultre, Vacheron Constantin, " +
      "Montblanc. Siège : Bellevue (Genève). Famille Rupert : 10 % du capital, 51 % des droits de vote.",
    dateCreation: new Date('1988-01-01'),
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Richemont',
    wikidataId: 'Q689240',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-01).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_francois_pinault: {
    url: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Pinault',
    titre: 'François Pinault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Né le 21/08/1936, fondateur du groupe PPR/Kering et d'Artémis SAS (1992). " +
      "Grand collectionneur d'art. Son fils François-Henri dirige le groupe depuis 2005.",
    verifiee: true,
  },
  wp_artemis: {
    url: 'https://fr.wikipedia.org/wiki/Art%C3%A9mis_(groupe)',
    titre: "Artémis (groupe) — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Holding SAS de la famille Pinault, fondée en 1990. Contrôle Kering (42,23 %), " +
      "Christie's (100 %), Puma (~28,7 %), Le Point, Stade Rennais FC, Ponant, Château Latour.",
    verifiee: true,
  },
  wp_kering_actionnariat: {
    url: 'https://fr.wikipedia.org/wiki/Kering',
    titre: 'Kering — actionnariat (Wikipédia)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Au 15 février 2024, Artémis détient 42,23 % du capital de Kering SA, actionnaire majoritaire.",
    verifiee: true,
  },
  wp_christies: {
    url: 'https://fr.wikipedia.org/wiki/Christie%27s',
    titre: "Christie's — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "OPA d'Artémis en 1998 : François Pinault prend le contrôle de Christie's (Londres, 1766). " +
      "Filiale directe d'Artémis, ~5,7 Mds USD de ventes en 2024.",
    verifiee: true,
  },
  wp_puma: {
    url: 'https://fr.wikipedia.org/wiki/Puma_(entreprise)',
    titre: 'Puma (entreprise) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Artémis détient ~28,7 % de Puma SE (BNQ centrale Norvège : 3,4 % ; flottant 66,1 %). " +
      "Kering avait distribué 70,4 % aux actionnaires en 2018 ; Artémis en conserve une part.",
    verifiee: true,
  },
  wp_alain_wertheimer: {
    url: 'https://en.wikipedia.org/wiki/Alain_Wertheimer',
    titre: 'Alain Wertheimer — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Né le 28/09/1948. Président exécutif de Chanel Ltd. Petit-fils de Théophile Wertheimer " +
      "(partenaire de Coco Chanel depuis 1924). Co-propriétaire avec son frère Gérard.",
    verifiee: true,
  },
  wp_gerard_wertheimer: {
    url: 'https://en.wikipedia.org/wiki/G%C3%A9rard_Wertheimer',
    titre: 'Gérard Wertheimer — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Né le 17/04/1951 à Paris. Frère d'Alain Wertheimer, co-directeur et co-propriétaire " +
      "de Chanel Ltd. Anciennement copropriétaire de Bourjois (cosmétiques).",
    verifiee: true,
  },
  wp_chanel: {
    url: 'https://fr.wikipedia.org/wiki/Chanel',
    titre: 'Chanel — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Maison de luxe fondée en 1910 par Coco Chanel. Co-détenue à 100 % par Alain et Gérard " +
      "Wertheimer depuis 1974 (participation Théophile Wertheimer remontant à 1924). Privée, non cotée.",
    verifiee: true,
  },
  wp_loreal_actionnariat: {
    url: "https://fr.wikipedia.org/wiki/L%27Or%C3%A9al",
    titre: "L'Oréal — actionnariat (Wikipédia)",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Famille Bettencourt (via Téthys Invest) : ~33,31 % du capital de L'Oréal SA " +
      "(premier actionnaire). Nestlé : ~20 % (2e actionnaire).",
    verifiee: true,
  },
  wp_rupert: {
    url: 'https://en.wikipedia.org/wiki/Johann_Rupert',
    titre: 'Johann Rupert — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Né le 01/06/1950. Fondateur de Richemont (1988). Contrôle 51 % des droits de vote " +
      "via Compagnie Financière Rupert (10 % du capital). Père : Anton Rupert (groupe Remgro).",
    verifiee: true,
  },
  wp_richemont: {
    url: 'https://en.wikipedia.org/wiki/Richemont',
    titre: 'Richemont — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Holding suisse de luxe (Cartier, Van Cleef & Arpels, IWC, Vacheron Constantin, Montblanc). " +
      "Fondé en 1988. 4e capitalisation du SMI (août 2025). Famille Rupert : 10 % K, 51 % droits de vote.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — ADR-027 : DETENTION_CAPITAL / ACTIONNAIRE_MAJORITAIRE / FILIALE
//         aRef = détenteur/holding → bRef = détenu.
//         Liens familiaux : typeLienCode 'famille'.
// ---------------------------------------------------------------------------

const LIENS = [
  // =========================================================================
  // GROUPE PINAULT — chaîne de contrôle
  // =========================================================================

  {
    // François Pinault (père) → Artémis : fondateur de la holding en 1990
    aType: 'personne',
    aRef: 'Q1451167',
    bType: 'organisation',
    bRef: 'Q2866000',
    typeLienCode: 'FONDATEUR',
    description:
      "François Pinault a fondé Artémis SAS en 1990 pour concentrer le contrôle de la " +
      "famille Pinault sur Kering (ex-PPR), Christie's, Puma et les domaines viticoles.",
    dateDebut: new Date('1990-07-10'),
    dateFin: null,
    sourceRef: 'wp_artemis',
  },
  {
    // François-Henri Pinault (déjà en base Q1371822) → Artémis : président (dirigeant actuel)
    aType: 'personne',
    aRef: 'Q1371822',
    bType: 'organisation',
    bRef: 'Q2866000',
    typeLienCode: 'DIRIGEANT',
    description:
      "François-Henri Pinault préside Artémis SAS depuis que son père lui a transmis " +
      "les rênes du groupe. Il est le propriétaire et dirigeant de la holding familiale.",
    dateDebut: new Date('2003-01-01'),
    dateFin: null,
    sourceRef: 'wp_artemis',
  },
  {
    // Lien famille : François Pinault père ↔ François-Henri Pinault (déjà en base)
    aType: 'personne',
    aRef: 'Q1451167',
    bType: 'personne',
    bRef: 'Q1371822',
    typeLienCode: 'famille',
    description:
      "François Pinault est le père de François-Henri Pinault. Il lui a transmis la " +
      "présidence opérationnelle du groupe Kering/PPR en 2003 et le contrôle d'Artémis.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_francois_pinault',
  },
  {
    // Artémis → Kering (déjà en base Q931207) : actionnaire majoritaire 42,23 %
    aType: 'organisation',
    aRef: 'Q2866000',
    bType: 'organisation',
    bRef: 'Q931207',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "Artémis (famille Pinault) détient 42,23 % du capital de Kering SA au 15 février 2024, " +
      "position d'actionnaire de référence et de contrôle.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_kering_actionnariat',
  },
  {
    // Artémis → Christie's : filiale à 100 % (acquisition OPA 1998)
    aType: 'organisation',
    aRef: 'Q2866000',
    bType: 'organisation',
    bRef: 'Q503176',
    typeLienCode: 'FILIALE',
    description:
      "Artémis a acquis Christie's via une OPA en 1998 (après une première participation " +
      "d'environ 30 % prise en mai 1998). Christie's est une filiale privée à 100 % d'Artémis.",
    dateDebut: new Date('1998-01-01'),
    dateFin: null,
    sourceRef: 'wp_christies',
  },
  {
    // Artémis → Puma : participation ~28,7 % (actionnaire de référence post-Kering)
    aType: 'organisation',
    aRef: 'Q2866000',
    bType: 'organisation',
    bRef: 'Q157064',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "Artémis détient environ 28,7 % de Puma SE, demeurant l'actionnaire de référence " +
      "après que Kering a distribué 70,4 % de Puma à ses actionnaires en 2018.",
    dateDebut: new Date('2018-01-01'),
    dateFin: null,
    sourceRef: 'wp_puma',
  },

  // =========================================================================
  // BETTENCOURT — lien capitalistique vers L'Oréal (entités déjà en base)
  // Téthys Invest (aucun Q-id Wikidata stable) exclue comme nœud intermédiaire.
  // Lien porté par Françoise Bettencourt Meyers (bénéficiaire réel, Présidente de Téthys).
  // =========================================================================

  {
    // Françoise Bettencourt Meyers (déjà en base Q516720) → L'Oréal (déjà en base Q156077)
    // Détention via Téthys Invest (~33,31 %), premier actionnaire de L'Oréal
    aType: 'personne',
    aRef: 'Q516720',
    bType: 'organisation',
    bRef: 'Q156077',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "Françoise Bettencourt Meyers, via la holding familiale Téthys Invest dont elle est " +
      "présidente, contrôle environ 33,31 % du capital de L'Oréal SA, premier actionnaire " +
      "du groupe cosmétique mondial (source : Wikipedia FR, données post-fusion Gesparal 2014).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_loreal_actionnariat',
  },

  // =========================================================================
  // WERTHEIMER — Chanel
  // =========================================================================

  {
    // Alain Wertheimer → Chanel : bénéficiaire effectif (co-propriétaire ~50 %)
    aType: 'personne',
    aRef: 'Q557074',
    bType: 'organisation',
    bRef: 'Q218115',
    typeLienCode: 'BENEFICIAIRE_EFFECTIF',
    description:
      "Alain Wertheimer co-détient Chanel Ltd avec son frère Gérard, héritant de la " +
      "participation familiale établie en 1924 par Théophile Wertheimer. " +
      "Chanel est privée, non cotée ; les frères en sont les seuls propriétaires.",
    dateDebut: new Date('1974-01-01'),
    dateFin: null,
    sourceRef: 'wp_alain_wertheimer',
  },
  {
    // Alain Wertheimer → Chanel : dirigeant (président exécutif)
    aType: 'personne',
    aRef: 'Q557074',
    bType: 'organisation',
    bRef: 'Q218115',
    typeLienCode: 'DIRIGEANT',
    description:
      "Alain Wertheimer est président exécutif de Chanel Ltd. Il en a été co-PDG " +
      "jusqu'en 2021, date à laquelle Leena Nair (ex-Unilever) est nommée CEO.",
    dateDebut: new Date('1974-01-01'),
    dateFin: null,
    sourceRef: 'wp_alain_wertheimer',
  },
  {
    // Gérard Wertheimer → Chanel : bénéficiaire effectif (co-propriétaire ~50 %)
    aType: 'personne',
    aRef: 'Q732167',
    bType: 'organisation',
    bRef: 'Q218115',
    typeLienCode: 'BENEFICIAIRE_EFFECTIF',
    description:
      "Gérard Wertheimer co-détient Chanel Ltd avec son frère Alain, héritant de la " +
      "participation familiale établie en 1924. Il siège au conseil de direction de Chanel.",
    dateDebut: new Date('1974-01-01'),
    dateFin: null,
    sourceRef: 'wp_gerard_wertheimer',
  },
  {
    // Frères Wertheimer — lien famille
    aType: 'personne',
    aRef: 'Q557074',
    bType: 'personne',
    bRef: 'Q732167',
    typeLienCode: 'famille',
    description:
      "Alain et Gérard Wertheimer sont frères. Ensemble, ils co-détiennent et co-dirigent " +
      "Chanel Ltd, maison privée héritée de leur famille depuis 1924.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_chanel',
  },

  // =========================================================================
  // RUPERT / RICHEMONT
  // =========================================================================

  {
    // Johann Rupert → Richemont : fondateur (1988)
    aType: 'personne',
    aRef: 'Q6216224',
    bType: 'organisation',
    bRef: 'Q689240',
    typeLienCode: 'FONDATEUR',
    description:
      "Johann Rupert a fondé la Compagnie Financière Richemont en 1988 en scindant les " +
      "actifs non-tabac du groupe familial Rembrandt (Afrique du Sud).",
    dateDebut: new Date('1988-01-01'),
    dateFin: null,
    sourceRef: 'wp_richemont',
  },
  {
    // Johann Rupert → Richemont : bénéficiaire effectif (51 % droits de vote)
    aType: 'personne',
    aRef: 'Q6216224',
    bType: 'organisation',
    bRef: 'Q689240',
    typeLienCode: 'BENEFICIAIRE_EFFECTIF',
    description:
      "Via la Compagnie Financière Rupert, Johann Rupert détient environ 10 % du capital " +
      "de Richemont mais contrôle 51 % des droits de vote, assurant le contrôle de la gouvernance.",
    dateDebut: new Date('1988-01-01'),
    dateFin: null,
    sourceRef: 'wp_rupert',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-fortunes-1.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-luxe-familles] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-luxe-familles] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données luxe-familles précédentes...')
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
  console.log('\n-- seed-luxe-familles — Pinault/Artémis, Bettencourt/L\'Oréal, Wertheimer/Chanel, Rupert/Richemont --\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok ${data.titre}`)
  }

  console.log('\n— Personnes (Wikidata, nouvelles) —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ok ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n— Organisations (Wikidata, nouvelles) —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ok ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Liens capitalistiques + familiaux —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n-- Bilan --')
  console.log(`Personnes (nouvelles) : ${PERSONNES.length} (F. Pinault père, A. Wertheimer, G. Wertheimer, J. Rupert)`)
  console.log(`Organisations (nouvelles) : ${ORGANISATIONS.length} (Artémis, Christie's, Puma SE, Chanel, Richemont)`)
  console.log(`Sources       : ${Object.keys(SOURCES).length} (Wikipédia FR/EN, officiels)`)
  console.log(`Liens         : ${LIENS.length} (FONDATEUR, DIRIGEANT, ACTIONNAIRE_MAJORITAIRE, DETENTION_CAPITAL, FILIALE, BENEFICIAIRE_EFFECTIF, famille)`)
  console.log('')
  console.log('Entités déjà en base référencées (non recréées) :')
  console.log('  Personnes : Q1371822 (F.-H. Pinault), Q516720 (F. Bettencourt Meyers), Q3170071 (J.-V. Meyers)')
  console.log('  Organisations : Q931207 (Kering), Q156077 (L\'Oréal)')
  console.log('Exclus (pas de Q-id Wikidata vérifié) : Nicolas Meyers, Téthys SAS')
  console.log('')
}

main()
  .catch((err) => {
    console.error('[seed-luxe-familles] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
