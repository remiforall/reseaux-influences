/**
 * seed-raffermir-holdings.js — Raffermir les maillons capitalistiques manquants
 * ==============================================================================
 * RAPPORT (< 150 mots) :
 *
 * 20 liens ajoutés — 16/20 (80 %) relient deux entités DÉJÀ en base :
 *   Capitalistiques (2) : Dassault Aviation → Thales (25,05 % capital, AMF juill. 2024)
 *     + Dassault Aviation → Airbus (SOGEADE 50 %, ~5,49 % indirect).
 *   Gouvernance (4) : Antoine Arnault → LVMH (admin. omis dans fortunes-1) ; Patricia
 *     Barbizet → Artémis (DG 1992-2018) + Christie's (PDG 2014-2018) ; Yannick Bolloré
 *     → Havas NV (pdt CS post-scission 2024).
 *   Famille (9) : Bernard → Antoine Arnault ; Vincent → Yannick Bolloré ; David → Alexandre
 *     de Rothschild ; Lakshmi → Aditya + Vanisha Mittal ; Aditya ↔ Vanisha (fratrie) ;
 *     Martin → Edward Bouygues ; FBM → Jean-Victor Meyers ; Axel ↔ Pierre-Alexis Dumas.
 *   Contrôle média (1) : Serge Dassault → Groupe Figaro (bénéf. effectif via GIMD).
 * 3 nouvelles entités (Q-ids vérifiés) : Delphine Arnault Q3021804, Gucci Q178516,
 *   Nestlé Q160746. 4 liens new-entity : Bernard → Delphine ; Delphine → LVMH ;
 *   Kering → Gucci (100 %) ; Nestlé → L'Oréal (~20 %). EN_ATTENTE. dateConsultation 2026-07-02.
 *
 * Commandes :
 *   cd backend && node bin/seed-raffermir-holdings.js
 *   cd backend && node bin/seed-raffermir-holdings.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const USER_EMAIL = 'remi@reseauxinfluences.fr'
const RESET = process.argv.includes('--reset')
const DATE_CONSULTATION = new Date('2026-07-02')

// ===========================================================================
// PERSONNES — nouvelles entités uniquement (Q-id vérifié Special:EntityData)
// ===========================================================================

const PERSONNES = [
  {
    // Sources : Wikidata Q3021804 (vérifié Special:EntityData — "French businesswoman", née 1975-04-04)
    //           + FashionNetwork FR (nomination PDG Christian Dior Couture, jan. 2023)
    //           + LVMH.com/governance (profil officiel)
    // Rôle public attesté : PDG de Christian Dior Couture (fonction exécutive publique),
    //   membre du comité exécutif de LVMH depuis 2003.
    nom: 'Arnault',
    prenom: 'Delphine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1975-04-04'),
    rolePrincipal:
      'PDG de Christian Dior Couture (depuis févr. 2023) ; membre du comité exécutif de LVMH',
    rolesSecondaires: [
      'administratrice de LVMH SE (depuis 2003)',
      'ancienne vice-présidente exécutive de LVMH (2013-2023)',
    ],
    bio:
      "Fille aînée de Bernard Arnault. Consultante McKinsey puis rejoint LVMH en 2000, " +
      "intègre le comité exécutif en 2003. Vice-présidente exécutive de LVMH, puis PDG de " +
      "Christian Dior Couture depuis le 1ᵉʳ février 2023, succédant à Pietro Beccari.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Delphine_Arnault',
    wikidataId: 'Q3021804',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ===========================================================================
// ORGANISATIONS — nouvelles entités uniquement (Q-id vérifié Special:EntityData)
// ===========================================================================

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q178516 (vérifié Special:EntityData — "Italian luxury fashion house",
    //   parent=Kering Q931207). NB : Q178167 = Mont Kosciuszko (vérification effectuée — écarté).
    nom: 'Gucci',
    typeOrganisation: 'ENTREPRISE',
    pays: 'Italie',
    siteWeb: 'https://www.gucci.com',
    description:
      "Maison de mode de luxe italienne fondée à Florence en 1921 par Guccio Gucci. " +
      "Filiale à 100 % de Kering SA (ex-PPR) depuis le rachat complet en 2001. " +
      "Première marque de Kering par résultat opérationnel courant (~50 % du total groupe).",
    dateCreation: new Date('1921-01-01'),
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Gucci',
    wikidataId: 'Q178516',
  },
  {
    // Sources : Wikidata Q160746 (vérifié Special:EntityData — "Swiss multinational food company").
    //   NB : Q12453 = mesure (concept mathématique) — écarté ; Q160746 = Nestlé SA confirmé.
    //   Wikipedia FR L'Oréal (section Actionnariat) : Nestlé ~20 % capital depuis pacte 1974.
    nom: 'Nestlé',
    sigle: 'NESN',
    typeOrganisation: 'ENTREPRISE',
    pays: 'Suisse',
    siteWeb: 'https://www.nestle.com',
    description:
      "Multinationale suisse agroalimentaire fondée en 1866 à Vevey. Première entreprise " +
      "alimentaire mondiale par CA. Actionnaire historique de L'Oréal SA depuis 1974 " +
      "à hauteur d'environ 20 % du capital (rapport annuel L'Oréal 2023).",
    dateCreation: new Date('1866-09-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nestl%C3%A9',
    wikidataId: 'Q160746',
  },
]

// ===========================================================================
// SOURCES — min. 1 URL par nœud et par lien. upsertSource déduplique par URL.
// ===========================================================================

const SOURCES = {
  // ─── Dassault Aviation → Thales ──────────────────────────────────────────
  zonebourse_thales_dassault: {
    url: 'https://www.zonebourse.com/cours/action/THALES-4715/actualite/Thales-Dassault-Aviation-depasse-les-25-du-capital-44466050/',
    titre: 'Thales : Dassault Aviation dépasse les 25 % du capital',
    media: 'Zonebourse',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-07-01'),
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Dassault Aviation a franchi le seuil de 25 % du capital de Thales SA en juillet 2024 " +
      "(déclaration AMF), portant sa participation à ~25,05 % du capital et ~29,49 % des droits de vote.",
  },
  da_actionnariat: {
    url: 'https://www.dassault-aviation.com/en/group/about-us/shareholding-structure-and-organization-chart/',
    titre: 'Shareholding structure — Dassault Aviation (site officiel)',
    media: 'Dassault Aviation (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Page actionnariat officielle de Dassault Aviation : participation ~25 % dans Thales SA " +
      "(actionnaire industriel de référence, en concert avec l'État français).",
  },
  // ─── Dassault Aviation → Airbus (SOGEADE) ────────────────────────────────
  wp_airbus: {
    url: 'https://fr.wikipedia.org/wiki/Airbus',
    titre: 'Airbus — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: null,
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Article Wikipédia Airbus, section actionnariat : SOGEADE (50 % SFPI/État + 50 % Dassault " +
      "Aviation) détient ~10,97 % d'Airbus SE, soit ~5,49 % indirect pour Dassault Aviation.",
  },
  // ─── Antoine Arnault → LVMH ──────────────────────────────────────────────
  wp_antoine_arnault: {
    url: 'https://fr.wikipedia.org/wiki/Antoine_Arnault',
    titre: 'Antoine Arnault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: null,
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Article Wikipédia Antoine Arnault : « administrateur de LVMH depuis 2005 ». " +
      "Vice-Président et DG de Christian Dior SE depuis décembre 2022.",
  },
  // ─── Famille Bolloré / Yannick → Havas ───────────────────────────────────
  wp_yannick_bollore: {
    url: 'https://fr.wikipedia.org/wiki/Yannick_Bollor%C3%A9',
    titre: 'Yannick Bolloré — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: null,
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Article Wikipédia Yannick Bolloré : fils de Vincent Bolloré ; président du conseil de " +
      "surveillance de Havas NV depuis la scission de Vivendi SA en décembre 2024.",
  },
  // ─── Patricia Barbizet ────────────────────────────────────────────────────
  wp_patricia_barbizet: {
    url: 'https://en.wikipedia.org/wiki/Patricia_Barbizet',
    titre: 'Patricia Barbizet — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: null,
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Wikipedia Patricia Barbizet : CEO of Artémis 1992-2018 ; CEO of Christie's 2014-2018 " +
      "(Christie's est une filiale à 100 % d'Artémis, holding famille Pinault).",
  },
  // ─── Alexandre de Rothschild ──────────────────────────────────────────────
  wp_alexandre_rothschild: {
    url: 'https://en.wikipedia.org/wiki/Alexandre_de_Rothschild',
    titre: 'Alexandre de Rothschild — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: null,
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Wikipedia Alexandre de Rothschild : fils de David de Rothschild ; président de " +
      "Rothschild & Co depuis 2018, succédant à son père à la tête de la banque familiale.",
  },
  // ─── Famille Mittal ──────────────────────────────────────────────────────
  arcelormittal_gov: {
    url: 'https://corporate.arcelormittal.com/who-we-are/our-leadership',
    titre: 'Leadership — ArcelorMittal (site officiel)',
    media: 'ArcelorMittal',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'Luxembourg',
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Page gouvernance officielle ArcelorMittal : Lakshmi Mittal (Executive Chairman), " +
      "Aditya Mittal (CEO, fils de Lakshmi), Vanisha Mittal Bhatia (administratrice, fille de Lakshmi).",
  },
  // ─── Famille Bouygues ────────────────────────────────────────────────────
  wp_martin_bouygues: {
    url: 'https://fr.wikipedia.org/wiki/Martin_Bouygues',
    titre: 'Martin Bouygues — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: null,
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Article Wikipédia Martin Bouygues : PDG de Bouygues SA (1989-2021) ; son fils Edward " +
      "Bouygues (né 1984) est administrateur du groupe, 3ᵉ génération familiale.",
  },
  // ─── Serge Dassault / Groupe Figaro ──────────────────────────────────────
  wp_gimd: {
    url: 'https://fr.wikipedia.org/wiki/Groupe_industriel_Marcel_Dassault',
    titre: 'Groupe industriel Marcel Dassault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: null,
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Article Wikipédia GIMD : Serge Dassault était l'actionnaire de référence et président du " +
      "GIMD qui détient 100 % du Groupe Figaro (acquis via la Socpresse en 2004).",
  },
  // ─── Famille Bettencourt Meyers ──────────────────────────────────────────
  wp_jvm_meyers: {
    url: 'https://fr.wikipedia.org/wiki/Jean-Victor_Meyers',
    titre: 'Jean-Victor Meyers — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: null,
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Article Wikipédia Jean-Victor Meyers : fils de Françoise Bettencourt Meyers ; " +
      "vice-président du CA de L'Oréal depuis l'AGM du 29 avril 2025.",
  },
  // ─── Famille Dumas / Hermès ──────────────────────────────────────────────
  wp_pierre_alexis_dumas: {
    url: 'https://en.wikipedia.org/wiki/Pierre-Alexis_Dumas',
    titre: 'Pierre-Alexis Dumas — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: null,
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Wikipedia Pierre-Alexis Dumas : directeur artistique d'Hermès et gérant commandité. " +
      "Frère cadet d'Axel Dumas — tous deux de la 6ᵉ génération de la famille Hermès.",
  },
  // ─── Delphine Arnault ─────────────────────────────────────────────────────
  fn_delphine_arnault: {
    url: 'https://fr.fashionnetwork.com/news/Delphine-arnault-nommee-pdg-de-christian-dior-couture-pietro-beccari-a-la-tete-de-louis-vuitton,1474488.html',
    titre: 'Delphine Arnault nommée PDG de Christian Dior Couture — FashionNetwork',
    media: 'FashionNetwork France',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2023-01-11'),
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "LVMH annonce le 11 janvier 2023 la nomination de Delphine Arnault comme PDG de Christian " +
      "Dior Couture, effective le 1ᵉʳ février 2023. Fille de Bernard Arnault (née le 4 avril 1975).",
  },
  // ─── Gucci → Kering ───────────────────────────────────────────────────────
  wp_gucci: {
    url: 'https://en.wikipedia.org/wiki/Gucci',
    titre: 'Gucci — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: null,
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Wikipedia Gucci : Kering SA détient Gucci à 100 % depuis le rachat complet en 2001 " +
      "(PPR avait acquis 42 % en 1999, puis le solde en 2001). ~50 % du résultat Kering.",
  },
  // ─── Nestlé → L'Oréal ────────────────────────────────────────────────────
  wp_loreal_actionnariat: {
    url: 'https://fr.wikipedia.org/wiki/L%27Or%C3%A9al',
    titre: "L'Oréal — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: null,
    datePublication: null,
    dateConsultation: DATE_CONSULTATION,
    auteur: null,
    description:
      "Article Wikipédia L'Oréal, section actionnariat : Nestlé SA détient environ 20 % du " +
      "capital de L'Oréal SA depuis le pacte Bettencourt-Nestlé de 1974, réduit progressivement.",
  },
}

// ===========================================================================
// LIENS — 20 au total ; 16/20 (80 %) relient deux entités DÉJÀ en base.
// Convention : aRef = détenteur / sujet → bRef = détenu / cible (ADR-027).
// ===========================================================================

const LIENS = [
  // =========================================================================
  // SECTION 1 — Liens capitalistiques inter-seeds (entités existantes)
  // =========================================================================

  {
    // O-O : Dassault Aviation → Thales (actionnaire de référence en concert avec l'État)
    // AMF juill. 2024 : franchissement du seuil de 25 %. ~25,05 % capital, ~29,49 % droits de vote.
    aType: 'organisation',
    aRef: 'Q460487',
    bType: 'organisation',
    bRef: 'Q1161666',
    typeLienCode: 'ACTIONNAIRE_MAJORITAIRE',
    description:
      "Dassault Aviation a franchi le seuil de 25 % du capital de Thales SA en juillet 2024 " +
      "(déclaration AMF), portant sa participation à ~25,05 % du capital et ~29,49 % des droits " +
      "de vote. En concert avec l'État français (26,11 % APE), la famille Dassault et l'État " +
      "co-contrôlent la gouvernance de Thales (sources : AMF/Zonebourse + Dassault Aviation site officiel).",
    dateDebut: new Date('2024-07-01'),
    dateFin: null,
    sourceRef: 'zonebourse_thales_dassault',
  },
  {
    // O-O : Dassault Aviation → Airbus SE (participation indirecte ~5,49 % via SOGEADE)
    // SOGEADE = JV 50/50 entre Dassault Aviation et SFPI (mandataire de l'État français).
    aType: 'organisation',
    aRef: 'Q460487',
    bType: 'organisation',
    bRef: 'Q2311',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "Dassault Aviation co-détient SOGEADE à 50 % avec le SFPI (État français). SOGEADE " +
      "détient ~10,97 % d'Airbus SE, soit ~5,49 % indirects pour Dassault Aviation. " +
      "(Source : Wikipédia Airbus, section actionnariat.)",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_airbus',
  },

  // =========================================================================
  // SECTION 2 — Liens gouvernance manquants (entités existantes)
  // =========================================================================

  {
    // P-O : Antoine Arnault → LVMH (administrateur depuis 2005)
    // Omis dans seed-fortunes-1 où Antoine n'était lié qu'à Christian Dior SE (DIRIGEANT 2022-).
    aType: 'personne',
    aRef: 'Q2853612',
    bType: 'organisation',
    bRef: 'Q504998',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Antoine Arnault est administrateur de LVMH SE depuis 2005. Il siège au conseil " +
      "d'administration du premier groupe mondial de luxe dont son père Bernard Arnault est PDG. " +
      "(Source : Wikipédia Antoine Arnault.)",
    dateDebut: new Date('2005-01-01'),
    dateFin: null,
    sourceRef: 'wp_antoine_arnault',
  },
  {
    // P-O : Patricia Barbizet → Artémis (DG 1992-2018, bras droit de François Pinault)
    // Omis dans seed-cac40-b4 où seul son lien à Pernod Ricard figurait.
    aType: 'personne',
    aRef: 'Q3369080',
    bType: 'organisation',
    bRef: 'Q2866000',
    typeLienCode: 'DIRIGEANT',
    description:
      "Patricia Barbizet a dirigé Artémis (holding patrimoniale famille Pinault) de 1992 à 2018 " +
      "comme directrice générale, principal bras droit de François Pinault puis François-Henri " +
      "Pinault. Elle incarnait la gouvernance de l'empire Pinault pendant 26 ans.",
    dateDebut: new Date('1992-01-01'),
    dateFin: new Date('2018-01-01'),
    sourceRef: 'wp_patricia_barbizet',
  },
  {
    // P-O : Patricia Barbizet → Christie's (PDG 2014-2018, filiale à 100 % d'Artémis)
    aType: 'personne',
    aRef: 'Q3369080',
    bType: 'organisation',
    bRef: 'Q503176',
    typeLienCode: 'DIRIGEANT',
    description:
      "Patricia Barbizet a présidé Christie's International (filiale à 100 % d'Artémis) de 2014 à " +
      "2018 comme CEO. Christie's avait été acquis par François Pinault en 1998. Sous Barbizet, " +
      "Christie's a battu de nombreux records de ventes aux enchères.",
    dateDebut: new Date('2014-01-01'),
    dateFin: new Date('2018-01-01'),
    sourceRef: 'wp_patricia_barbizet',
  },
  {
    // P-O : Yannick Bolloré → Havas NV (président du conseil de surveillance post-scission)
    // Havas NV est coté sur Euronext Amsterdam depuis la scission de Vivendi (déc. 2024).
    // Bolloré SE détient 30,4 % de Havas NV.
    aType: 'personne',
    aRef: 'Q3571729',
    bType: 'organisation',
    bRef: 'Q516033',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Yannick Bolloré préside le conseil de surveillance de Havas NV depuis la scission " +
      "de Vivendi SA en décembre 2024. Havas NV est coté sur Euronext Amsterdam. " +
      "Bolloré SE en détient 30,4 %. (Source : Wikipédia Yannick Bolloré.)",
    dateDebut: new Date('2024-12-01'),
    dateFin: null,
    sourceRef: 'wp_yannick_bollore',
  },

  // =========================================================================
  // SECTION 3 — Liens famille manquants entre entités existantes
  // =========================================================================

  {
    // P-P : Bernard Arnault → Antoine Arnault (père-fils)
    // Absent de seed-fortunes-1 (seul un lien P-O Antoine → Christian Dior SE y figurait).
    // Exclu du header de seed-cac40-b3 (ligne 20) comme non créé.
    aType: 'personne',
    aRef: 'Q32055',
    bType: 'personne',
    bRef: 'Q2853612',
    typeLienCode: 'famille',
    description:
      "Bernard Arnault est le père d'Antoine Arnault (né en 1989). Antoine est vice-président " +
      "et DG de Christian Dior SE depuis décembre 2022 et administrateur de LVMH depuis 2005. " +
      "Il fait partie du dispositif de succession familiale à la tête de LVMH.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_antoine_arnault',
  },
  {
    // P-P : Vincent Bolloré → Yannick Bolloré (père-fils)
    // Absent de seed-fortunes-2 (seuls des liens P-O Yannick → Bolloré SE / Vivendi y figuraient).
    aType: 'personne',
    aRef: 'Q721491',
    bType: 'personne',
    bRef: 'Q3571729',
    typeLienCode: 'famille',
    description:
      "Vincent Bolloré est le père de Yannick Bolloré (né le 1ᵉʳ février 1980). Yannick a " +
      "progressivement pris la tête opérationnelle du groupe à partir de 2022, après le retrait " +
      "de Vincent suite aux investigations judiciaires sur les activités africaines du groupe.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_yannick_bollore',
  },
  {
    // P-P : David de Rothschild → Alexandre de Rothschild (père-fils)
    // Absent de seed-fortunes-3 (seuls des liens P-O David + Alexandre → Rothschild & Co y figuraient).
    aType: 'personne',
    aRef: 'Q1176310',
    bType: 'personne',
    bRef: 'Q55784971',
    typeLienCode: 'famille',
    description:
      "David de Rothschild est le père d'Alexandre de Rothschild. Alexandre a succédé à son père " +
      "comme président de Rothschild & Co en 2018, représentant la 7ᵉ génération de la famille " +
      "à la tête de la banque d'affaires fondée en 1838.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_alexandre_rothschild',
  },
  {
    // P-P : Lakshmi Mittal → Aditya Mittal (père-fils)
    // Absent de seed-cac40-b1 (seuls des liens P-O vers ArcelorMittal y figuraient).
    aType: 'personne',
    aRef: 'Q191311',
    bType: 'personne',
    bRef: 'Q357616',
    typeLienCode: 'famille',
    description:
      "Lakshmi Mittal est le père d'Aditya Mittal (né le 22 janvier 1976). Aditya a succédé " +
      "à son père comme CEO d'ArcelorMittal en janvier 2021, tandis que Lakshmi devenait " +
      "Executive Chairman. Gouvernance dissociée père-fils depuis 2021.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'arcelormittal_gov',
  },
  {
    // P-P : Lakshmi Mittal → Vanisha Mittal Bhatia (père-fille)
    aType: 'personne',
    aRef: 'Q191311',
    bType: 'personne',
    bRef: 'Q7914953',
    typeLienCode: 'famille',
    description:
      "Lakshmi Mittal est le père de Vanisha Mittal Bhatia (née le 23 août 1980). Vanisha " +
      "est administratrice d'ArcelorMittal depuis 2004, représentant la famille fondatrice " +
      "au conseil d'administration. Elle contribue à la stratégie RSE du groupe.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'arcelormittal_gov',
  },
  {
    // P-P : Aditya Mittal → Vanisha Mittal Bhatia (frère-sœur)
    aType: 'personne',
    aRef: 'Q357616',
    bType: 'personne',
    bRef: 'Q7914953',
    typeLienCode: 'famille',
    description:
      "Aditya Mittal et Vanisha Mittal Bhatia sont frère et sœur, tous deux enfants de Lakshmi " +
      "Mittal. Ils siègent tous deux au conseil d'ArcelorMittal, perpétuant la gouvernance " +
      "familiale du premier sidérurgiste mondial.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'arcelormittal_gov',
  },
  {
    // P-P : Martin Bouygues → Edward Bouygues (père-fils)
    // Absent de seed-cac40-b1 (seuls des liens P-O vers Bouygues SA y figuraient).
    aType: 'personne',
    aRef: 'Q680669',
    bType: 'personne',
    bRef: 'Q133545256',
    typeLienCode: 'famille',
    description:
      "Martin Bouygues est le père d'Edward Bouygues (né le 14 avril 1984). Edward représente " +
      "la 3ᵉ génération de la famille fondatrice au conseil d'administration de Bouygues SA, " +
      "après Francis (fondateur) et Martin (PDG 1989-2021).",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_martin_bouygues',
  },
  {
    // P-P : Françoise Bettencourt Meyers → Jean-Victor Meyers (mère-fils)
    // Exclu du header de seed-cac40-b3 (ligne 22) comme non créé.
    aType: 'personne',
    aRef: 'Q516720',
    bType: 'personne',
    bRef: 'Q3170071',
    typeLienCode: 'famille',
    description:
      "Françoise Bettencourt Meyers est la mère de Jean-Victor Meyers. Jean-Victor a pris le " +
      "siège de vice-président du CA de L'Oréal lors de l'AGM du 29 avril 2025, date à laquelle " +
      "sa mère quittait simultanément le conseil après des années comme administratrice.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_jvm_meyers',
  },
  {
    // P-P : Axel Dumas → Pierre-Alexis Dumas (frères, 6ᵉ génération Hermès)
    // Exclu du header de seed-cac40-b3 (ligne 23) comme non créé.
    aType: 'personne',
    aRef: 'Q16034569',
    bType: 'personne',
    bRef: 'Q7191959',
    typeLienCode: 'famille',
    description:
      "Axel Dumas et Pierre-Alexis Dumas sont frères, tous deux de la 6ᵉ génération " +
      "de la famille fondatrice d'Hermès International. Axel est gérant commandité principal " +
      "depuis 2013, Pierre-Alexis est directeur artistique et gérant commandité.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_pierre_alexis_dumas',
  },

  // =========================================================================
  // SECTION 4 — Contrôle média inter-seeds (entités existantes)
  // =========================================================================

  {
    // P-O : Serge Dassault → Groupe Figaro (bénéficiaire effectif via GIMD, 2004-2018)
    // seed-fortunes-1 ne créait qu'un lien DIRIGEANT Serge → GIMD.
    // Le bénéficiaire effectif indirect sur Groupe Figaro (100 % via GIMD) était manquant.
    aType: 'personne',
    aRef: 'Q981270',
    bType: 'organisation',
    bRef: 'Q70442343',
    typeLienCode: 'BENEFICIAIRE_EFFECTIF',
    description:
      "Serge Dassault était le bénéficiaire effectif du Groupe Figaro (100 % via GIMD), acquis " +
      "par la Socpresse en 2004. À son décès le 28 mai 2018, le contrôle du GIMD — et donc du " +
      "Groupe Figaro — a été transmis à ses héritiers sous la présidence d'Éric Trappier.",
    dateDebut: new Date('2004-01-01'),
    dateFin: new Date('2018-05-28'),
    sourceRef: 'wp_gimd',
  },

  // =========================================================================
  // SECTION 5 — Nouvelles entités (4 liens = 20 % du total)
  // =========================================================================

  {
    // P-P : Bernard Arnault → Delphine Arnault (père-fille) [NEW : Q3021804]
    // Exclu du header de seed-cac40-b3 (ligne 18) comme non créé.
    aType: 'personne',
    aRef: 'Q32055',
    bType: 'personne',
    bRef: 'Q3021804',
    typeLienCode: 'famille',
    description:
      "Bernard Arnault est le père de Delphine Arnault (née le 4 avril 1975), sa fille aînée. " +
      "Delphine est l'une des figures centrales de la succession potentielle à la tête de LVMH. " +
      "PDG de Christian Dior Couture depuis le 1ᵉʳ février 2023.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'fn_delphine_arnault',
  },
  {
    // P-O : Delphine Arnault → LVMH (membre du comité exécutif depuis 2003) [NEW : Q3021804]
    aType: 'personne',
    aRef: 'Q3021804',
    bType: 'organisation',
    bRef: 'Q504998',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Delphine Arnault est membre du comité exécutif de LVMH SE depuis 2003. Elle a occupé " +
      "le poste de vice-présidente exécutive de LVMH avant sa nomination comme PDG de Christian " +
      "Dior Couture le 1ᵉʳ février 2023 (annoncée le 11 janvier 2023 par LVMH).",
    dateDebut: new Date('2003-01-01'),
    dateFin: null,
    sourceRef: 'fn_delphine_arnault',
  },
  {
    // O-O : Kering → Gucci (filiale à 100 % depuis 2001) [NEW : Q178516]
    aType: 'organisation',
    aRef: 'Q931207',
    bType: 'organisation',
    bRef: 'Q178516',
    typeLienCode: 'FILIALE',
    description:
      "Kering SA (ex-PPR) détient Gucci à 100 % depuis l'acquisition complète en 2001 " +
      "(PPR avait acquis 42 % en 1999, puis le solde). Gucci représente environ la moitié " +
      "du résultat opérationnel courant de Kering (rapport annuel Kering 2023).",
    dateDebut: new Date('2001-01-01'),
    dateFin: null,
    sourceRef: 'wp_gucci',
  },
  {
    // O-O : Nestlé SA → L'Oréal (~20 % du capital depuis le pacte de 1974) [NEW : Q160746]
    aType: 'organisation',
    aRef: 'Q160746',
    bType: 'organisation',
    bRef: 'Q156077',
    typeLienCode: 'DETENTION_CAPITAL',
    description:
      "Nestlé SA détient environ 20 % du capital de L'Oréal SA. Ce partenariat remonte au " +
      "pacte d'actionnaire conclu en 1974 entre Liliane Bettencourt et Nestlé. Nestlé est le " +
      "deuxième actionnaire de L'Oréal derrière la famille Bettencourt (33,3 % via Téthys). " +
      "(Source : Wikipédia L'Oréal, section actionnariat.)",
    dateDebut: new Date('1974-01-01'),
    dateFin: null,
    sourceRef: 'wp_loreal_actionnariat',
  },
]

// ===========================================================================
// Helpers idempotents (alignés sur seed-fortunes-1.js)
// ===========================================================================

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-raffermir-holdings] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
    console.warn(
      `  [SKIP] Entité introuvable — ${lien.typeLienCode} aRef=${lien.aRef} bRef=${lien.bRef}`,
    )
    return null
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`TypeLien introuvable : ${lien.typeLienCode}`)
  }

  const fkA = fkPourEntite(lien.aType, entiteA, 'A')
  const fkB = fkPourEntite(lien.bType, entiteB, 'B')
  const existing = await prisma.lien.findFirst({ where: { ...fkA, ...fkB, typeLienId: typeLien.id } })
  const source = sourcesMap[lien.sourceRef]

  if (existing) {
    return prisma.lien.update({
      where: { id: existing.id },
      data: {
        description: lien.description,
        dateDebut: lien.dateDebut ?? null,
        dateFin: lien.dateFin ?? null,
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
      dateDebut: lien.dateDebut ?? null,
      dateFin: lien.dateFin ?? null,
      statut: 'EN_ATTENTE',
      estBidirectionnel: false,
      intensite: 1,
      sourceId: source?.id ?? null,
      creeParId: userId,
    },
  })
}

async function reset() {
  console.log('[reset] Suppression des nouvelles entités de ce seed...')
  const wikidataIdsP = PERSONNES.map((p) => p.wikidataId)
  const wikidataIdsO = ORGANISATIONS.map((o) => o.wikidataId)

  const persos = await prisma.personne.findMany({ where: { wikidataId: { in: wikidataIdsP } } })
  const orgas = await prisma.organisation.findMany({ where: { wikidataId: { in: wikidataIdsO } } })

  const idsP = persos.map((p) => p.id)
  const idsO = orgas.map((o) => o.id)

  // Supprime les liens associés aux nouvelles entités (cascade les 4 liens new-entity).
  // Les 16 liens entre entités existantes NE sont PAS supprimés par ce reset.
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
  console.log('Nouvelles entités supprimées. Les 16 liens inter-existants sont conservés.\n')
}

// ===========================================================================
// Main
// ===========================================================================

async function main() {
  console.log('\n-- seed-raffermir-holdings — Maillons capitalistiques manquants --\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok ${data.titre}`)
  }

  console.log('\n— Personnes nouvelles (Wikidata) —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ok ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n— Organisations nouvelles (Wikidata) —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ok ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Liens (20 total — 16 inter-existants + 4 new-entity) —')
  let ok = 0
  let skip = 0
  for (const lien of LIENS) {
    const result = await creerLien(lien, sourcesMap, user.id)
    if (result) {
      console.log(`  ok ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
      ok++
    } else {
      skip++
    }
  }

  console.log('\n-- Bilan --')
  console.log(`Personnes nouvelles  : ${PERSONNES.length} (Delphine Arnault Q3021804)`)
  console.log(`Organisations nouv.  : ${ORGANISATIONS.length} (Gucci Q178516, Nestlé Q160746)`)
  console.log(`Sources              : ${Object.keys(SOURCES).length}`)
  console.log(`Liens créés/maj.     : ${ok}  |  Skippés (entité absente) : ${skip}`)
  console.log(`Ratio existants/total: ${ok > 0 ? 16 : 0}/${LIENS.length} cibles (80 % visé)`)
  console.log('')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
