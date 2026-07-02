/**
 * Seed Grand Est — réseau d'influence régional (corpus OSINT 2026-07-02).
 *
 * Périmètre :
 *   - Conseil Régional Grand Est (institution + président Franck Leroy)
 *   - Maires des principales villes (Strasbourg, Reims, Metz, Nancy, Mulhouse) —
 *     mandats 2020-2026 ; les mandats post-élections municipales de mars 2026 sont
 *     documentés dans les cas vérifiés par Wikidata Special:EntityData.
 *   - Fortune régionale (famille Taittinger / Champagne Taittinger, Reims)
 *   - Presse régionale (L'Est Républicain, DNA, L'Alsace, L'Union)
 *
 * Affaires judiciaires documentées :
 *   — François Grosdidier (Metz) :
 *     (1) Condamné 2015 : détournement fonds publics (usage véhicule municipal) → €6 000 d'amende.
 *         Statut : condamnation devenue définitive.
 *     (2) Condamné 7 fév. 2023 : prise illégale d'intérêts (réserve parlementaire 2009-2011,
 *         €160 000 versés à son asso "Valeur Écologie") → 6 mois sursis + €10 000.
 *         Statut : confirmé en appel ; statut cassation à vérifier.
 *     (3) Renvoyé en correctionnelle déc. 2025 : détournement fonds publics + prise illégale
 *         d'intérêts (cabinet de maire sur-doté à Woippy) → cassation en cours.
 *         PRÉSOMPTION D'INNOCENCE : procédure non définitive.
 *   Sources : Wikipédia FR (article Grosdidier, section "Affaires judiciaires"), recoupé Le Monde.
 *
 * Sources : Wikidata (tous Q-ids vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR, Paris Match (Taittinger).
 *
 * Anti-doublons :
 *   Partis DÉJÀ EN BASE (seed-partis-chefs.js + seed-macron-v2.js) :
 *     LR Q20012759 • PS Q170972 • Les Écologistes Q613786 • Horizons Q108846587
 *   → Seulement référencés ici, non recréés.
 *   Soyons libres Q65128542 → CRÉÉ ici (absent des seeds précédents).
 *
 * Garde-fous RGPD / ADR-006 / ADR-010 :
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - statut EN_ATTENTE sur toutes les entités
 *   - idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-region-grandest.js
 *   cd backend && node bin/seed-region-grandest.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — chaque fiche recoupée par ≥ 2 sources publiques.
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q3082186 + Wikipédia FR (https://fr.wikipedia.org/wiki/Franck_Leroy)
    // Parti : UDF (1995-2007) → UDI (2012-2018) → Horizons (2022-2023) → non-inscrit depuis jan. 2023.
    nom: 'Leroy',
    prenom: 'Franck',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-01-12'),
    lieuNaissance: 'Boulogne-sur-Mer (Pas-de-Calais)',
    rolePrincipal: 'Président du Conseil régional Grand Est',
    rolesSecondaires: [
      'ancien maire d\'Épernay (2000-2023)',
      'avocat',
      'président de la CA Épernay Coteaux et Plaine de Champagne (depuis 2017)',
      'président de l\'AFIT France (depuis 2024)',
    ],
    bio:
      'Avocat et élu centriste, Franck Leroy a été maire d\'Épernay pendant 23 ans (2000-2023). ' +
      'Membre du conseil régional Grand Est depuis 2016, il est élu président de la région le ' +
      '13 janvier 2023, succédant à Jean Rottner. Il n\'est affilié à aucun parti depuis début 2023.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Franck_Leroy',
    wikidataId: 'Q3082186',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3084783 + Wikipédia FR (https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Grosdidier)
    // Parti : UMP/LR jusqu'en déc. 2022 → Soyons libres depuis 2018.
    // ⚠ AFFAIRES JUDICIAIRES (cf. entête du fichier) :
    //   Condamné en 2015 (€6 000) + condamné 7 fév. 2023 (6 mois sursis + €10 000 prise illégale
    //   d'intérêts) + renvoyé en correctionnelle déc. 2025 (cassation en cours — présomption innocence).
    nom: 'Grosdidier',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-02-25'),
    lieuNaissance: 'Metz (Moselle)',
    rolePrincipal: 'Maire de Metz (réélu mars 2026)',
    rolesSecondaires: [
      'ancien député de la Moselle (2002-2017)',
      'ancien sénateur de la Moselle (2017-2020)',
      'ancien maire de Woippy (2001-2014)',
    ],
    bio:
      'Homme politique né à Metz, François Grosdidier est maire de Metz depuis le 3 juillet 2020 ' +
      'et réélu le 27 mars 2026. Proche de la droite (LR jusqu\'en déc. 2022, Soyons libres depuis). ' +
      '⚠ Condamné à €6 000 d\'amende en 2015 (détournement), condamné le 7 fév. 2023 ' +
      '(prise illégale d\'intérêts, 6 mois sursis + €10 000). Renvoyé en correctionnelle en ' +
      'décembre 2025 pour de nouveaux faits (cassation en cours — présomption d\'innocence maintenue ' +
      'pour cette procédure).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Grosdidier',
    wikidataId: 'Q3084783',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2863211 + Wikipédia FR
    // Parti : Les Républicains (Q20012759) — déjà en base.
    nom: 'Robinet',
    prenom: 'Arnaud',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1975-04-30'),
    lieuNaissance: 'Reims (Marne)',
    rolePrincipal: 'Ancien maire de Reims (mandat 2020-2026)',
    rolesSecondaires: [
      'maire de Reims de 2008 à 2026',
      'médecin',
      'président de la Fédération Hospitalière de France (2016-2020)',
    ],
    bio:
      'Médecin de formation, Arnaud Robinet est élu maire de Reims en 2008 sous étiquette LR. ' +
      'Réélu en 2014 et 2020, son mandat prend fin le 26 mars 2026 à l\'issue des élections ' +
      'municipales. Il préside la Fédération Hospitalière de France de 2016 à 2020.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Arnaud_Robinet',
    wikidataId: 'Q2863211',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q87246317 + Wikipédia FR
    // Parti : Les Écologistes (ex-EELV) Q613786 — déjà en base.
    nom: 'Barseghian',
    prenom: 'Jeanne',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1980-12-06'),
    lieuNaissance: null,
    rolePrincipal: 'Ancienne maire de Strasbourg (mandat 2020-2026)',
    rolesSecondaires: [
      'juriste',
      'ancienne conseillère régionale du Grand Est (2020-2026)',
    ],
    bio:
      'Juriste et militante écologiste, Jeanne Barseghian est élue maire de Strasbourg le ' +
      '4 juillet 2020 (EELV/Les Écologistes). Première femme à diriger la ville, elle est aussi ' +
      'conseillère régionale du Grand Est. Son mandat prend fin le 27 mars 2026 à l\'issue ' +
      'des élections municipales.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jeanne_Barseghian',
    wikidataId: 'Q87246317',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q16663734 + Wikipédia FR
    // Parti : Parti socialiste Q170972 — déjà en base.
    nom: 'Klein',
    prenom: 'Mathieu',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1976-01-20'),
    lieuNaissance: 'Lyon (Rhône)',
    rolePrincipal: 'Ancien maire de Nancy (mandat 2020-2026)',
    rolesSecondaires: [
      'ancien conseiller régional de Lorraine',
      'ancien conseiller municipal de Nancy (2014-2020)',
    ],
    bio:
      'Mathieu Klein (PS) est élu maire de Nancy le 28 juin 2020. Ancien conseiller régional ' +
      'de Lorraine, son mandat de maire prend fin le 21 mars 2026 à l\'issue des élections ' +
      'municipales. Il est également décoré de la médaille d\'honneur ukrainienne en mai 2026 ' +
      'pour son soutien à la ville jumelle de Nancy.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Mathieu_Klein',
    wikidataId: 'Q16663734',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q47872392 + Wikipédia FR
    // Affiliation : proche LR (élue sur liste LR 2020, ex-députée LR 2017-2020).
    nom: 'Lutz',
    prenom: 'Michèle',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-11-15'),
    lieuNaissance: 'Mulhouse (Haut-Rhin)',
    rolePrincipal: 'Ancienne maire de Mulhouse (mandat 2020-2026)',
    rolesSecondaires: [
      'ancienne députée du Haut-Rhin (2017-2020, LR)',
      'ancienne adjointe au maire de Mulhouse',
    ],
    bio:
      'Michèle Lutz est élue maire de Mulhouse le 28 juin 2020 sur une liste LR/divers droite. ' +
      'Elle était auparavant députée du Haut-Rhin (2017-2020) sous étiquette LR. ' +
      'Son mandat de maire prend fin le 26 mars 2026 à l\'issue des élections municipales.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Mich%C3%A8le_Lutz',
    wikidataId: 'Q47872392',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3382982 + Wikipédia FR (Champagne Taittinger)
    //           + Paris Match, déc. 2014 ("Mon champagne, ma bataille", J.-F. Chaigneau).
    // PDG Champagne Taittinger de 2006 à 2019. Cède la présidence à sa fille Vitalie en jan. 2020.
    nom: 'Taittinger',
    prenom: 'Pierre-Emmanuel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1953-05-06'),
    lieuNaissance: null,
    rolePrincipal: 'Ancien PDG de Champagne Taittinger (2006-2019)',
    rolesSecondaires: [
      'co-repreneur de Champagne Taittinger (2006, avec Crédit Agricole Nord-Est)',
      'fondateur de la famille Taittinger du champagne',
    ],
    bio:
      'Fils de Jean Taittinger, Pierre-Emmanuel Taittinger a conduit le rachat de la maison ' +
      'Champagne Taittinger en mai 2006 — après sa vente au fonds américain Starwood Capital ' +
      'en 2005 — avec l\'appui du Crédit Agricole Nord-Est, pour un montant supérieur à ' +
      '500 millions d\'euros. Il préside la maison jusqu\'au 31 décembre 2019, date à laquelle ' +
      'il transmet la présidence à sa fille Vitalie Taittinger.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Champagne_Taittinger',
    wikidataId: 'Q3382982',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q119049742 + Wikipédia FR (Champagne Taittinger + article Vitalie Taittinger)
    nom: 'Taittinger',
    prenom: 'Vitalie',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1979-06-29'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Présidente de Champagne Taittinger (depuis janvier 2020)',
    rolesSecondaires: [
      'ancienne directrice marketing et communication de Champagne Taittinger',
      'fille de Pierre-Emmanuel Taittinger',
    ],
    bio:
      'Vitalie Taittinger prend la présidence de la maison Champagne Taittinger le 2 janvier 2020, ' +
      'succédant à son père Pierre-Emmanuel. Elle avait rejoint l\'entreprise depuis plusieurs années ' +
      'en tant que directrice marketing et communication. Elle dirige la maison avec son frère Clovis.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Vitalie_Taittinger',
    wikidataId: 'Q119049742',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q124156208 + site officiel grandest.fr
    nom: 'Conseil régional Grand Est',
    sigle: 'CR Grand Est',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.grandest.fr',
    description:
      'Institution publique issue de la fusion des régions Alsace, Champagne-Ardenne et Lorraine ' +
      '(loi NOTRe, 2015). Le conseil régional siège à Strasbourg. Président depuis jan. 2023 : ' +
      'Franck Leroy (non-inscrit, ex-Horizons).',
    dateCreation: new Date('2016-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Conseil_r%C3%A9gional_du_Grand_Est',
    wikidataId: 'Q124156208',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q6602 + Wikipedia FR
    nom: 'Strasbourg',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.strasbourg.eu',
    description:
      'Capitale de la région Grand Est, siège du Parlement européen et du Conseil de l\'Europe. ' +
      'Commune la plus peuplée d\'Alsace (~290 000 hab.).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Strasbourg',
    wikidataId: 'Q6602',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q41876 + Wikipedia FR
    nom: 'Reims',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.reims.fr',
    description:
      'Commune de la Marne (Grand Est), ancienne ville du sacre des rois de France. ' +
      '~185 000 habitants. Capitale mondiale du champagne.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Reims',
    wikidataId: 'Q41876',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q22690 + Wikipedia FR
    nom: 'Metz',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.metz.fr',
    description:
      'Préfecture de la Moselle (Grand Est), ~120 000 habitants. Ancienne capitale de la Lorraine.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Metz',
    wikidataId: 'Q22690',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q40898 + Wikipedia FR
    nom: 'Nancy',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.nancy.fr',
    description:
      'Préfecture de Meurthe-et-Moselle (Grand Est), ~105 000 habitants. Ancienne capitale du ' +
      'duché de Lorraine, célèbre pour la place Stanislas (UNESCO).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nancy',
    wikidataId: 'Q40898',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q79815 + Wikipedia FR
    nom: 'Mulhouse',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.mulhouse.fr',
    description:
      'Commune du Haut-Rhin (Grand Est), ~110 000 habitants. Ville industrielle alsacienne, ' +
      'connue pour ses musées techniques (automobile, train, électricité).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Mulhouse',
    wikidataId: 'Q79815',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q204901 + Wikipédia FR (https://fr.wikipedia.org/wiki/Champagne_Taittinger)
    //           + Paris Match déc. 2014 (rachat 2006, Crédit Agricole Nord-Est)
    nom: 'Champagne Taittinger',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.taittinger.fr',
    description:
      'Maison de champagne fondée à Reims, rachetée par la famille Taittinger en mai 2006 ' +
      '(avec Crédit Agricole Nord-Est) après une vente temporaire au fonds américain Starwood Capital ' +
      '(2005). Présidée depuis jan. 2020 par Vitalie Taittinger.',
    dateCreation: new Date('1734-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Champagne_Taittinger',
    wikidataId: 'Q204901',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3052319 + Wikipedia FR
    nom: "L'Est Républicain",
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.estrepublicain.fr',
    description:
      'Quotidien régional basé à Nancy (Grand Est), fondé en 1889. Appartient au groupe EBRA ' +
      '(Est Bourgogne Rhône Alpes), lui-même détenu par le Crédit Mutuel.',
    dateCreation: new Date('1889-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/L%27Est_r%C3%A9publicain',
    wikidataId: 'Q3052319',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q381431 + Wikipedia FR
    nom: 'Dernières Nouvelles d\'Alsace',
    sigle: 'DNA',
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.dna.fr',
    description:
      'Quotidien régional alsacien basé à Strasbourg, fondé en 1877. Premier quotidien de la ' +
      'région Alsace. Appartient au groupe EBRA (Crédit Mutuel).',
    dateCreation: new Date('1877-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Derni%C3%A8res_nouvelles_d%27Alsace',
    wikidataId: 'Q381431',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1398234 + Wikipedia FR
    nom: "L'Alsace",
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.lalsace.fr',
    description:
      'Quotidien régional basé à Mulhouse, couvrant le Haut-Rhin et le Territoire de Belfort. ' +
      'Appartient au groupe EBRA (Crédit Mutuel).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/L%27Alsace',
    wikidataId: 'Q1398234',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3204802 + Wikipedia FR (https://fr.wikipedia.org/wiki/L%27Union_(journal))
    nom: "L'Union",
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.lunion.fr',
    description:
      'Quotidien régional basé à Reims, couvrant la Marne et l\'Ardenne (Champagne-Ardenne). ' +
      'Appartient au groupe EBRA (Crédit Mutuel).',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/L%27Union_(journal)',
    wikidataId: 'Q3204802',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q65128542 + Wikipedia FR
    // Parti fondé par François Grosdidier (et autres) en 2018, distinct de LR.
    // Grosdidier quitte LR en décembre 2022 (après élection Ciotti).
    nom: 'Soyons libres',
    sigle: 'SL',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      'Parti politique de droite libérale fondé en 2018, notamment soutenu par François Grosdidier ' +
      '(maire de Metz). Grosdidier quitte formellement LR en décembre 2022 pour rejoindre ce ' +
      'mouvement à plein temps.',
    dateCreation: new Date('2018-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Soyons_libres',
    wikidataId: 'Q65128542',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_leroy: {
    url: 'https://fr.wikipedia.org/wiki/Franck_Leroy',
    titre: 'Franck Leroy — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Avocat et maire d\'Épernay (2000-2023), président du Conseil régional Grand Est depuis le ' +
      '13 janv. 2023 (ex-UDI/Horizons, non-inscrit depuis début 2023).',
    verifiee: true,
  },
  wp_grosdidier: {
    url: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Grosdidier',
    titre: 'François Grosdidier — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Maire de Metz réélu mars 2026 (Soyons libres, ex-LR). Condamné 2015 (€6 000) et ' +
      'fév. 2023 (prise illégale intérêts, 6 mois sursis + €10 000). Renvoyé en correctionnel déc. 2025.',
    verifiee: true,
  },
  wp_robinet: {
    url: 'https://fr.wikipedia.org/wiki/Arnaud_Robinet',
    titre: 'Arnaud Robinet — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-05-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Médecin, maire de Reims (LR) de 2008 au 26 mars 2026. ' +
      'Président de la Fédération Hospitalière de France (2016-2020).',
    verifiee: true,
  },
  wp_barseghian: {
    url: 'https://fr.wikipedia.org/wiki/Jeanne_Barseghian',
    titre: 'Jeanne Barseghian — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Juriste et militante EELV, première femme maire de Strasbourg (juil. 2020 — mars 2026). ' +
      'Conseillère régionale Grand Est.',
    verifiee: true,
  },
  wp_klein: {
    url: 'https://fr.wikipedia.org/wiki/Mathieu_Klein',
    titre: 'Mathieu Klein — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Élu socialiste, maire de Nancy de juin 2020 au 21 mars 2026. ' +
      'Ancien conseiller régional de Lorraine.',
    verifiee: true,
  },
  wp_lutz: {
    url: 'https://fr.wikipedia.org/wiki/Mich%C3%A8le_Lutz',
    titre: 'Michèle Lutz — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-05-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Ancienne députée LR du Haut-Rhin (2017-2020), maire de Mulhouse de juin 2020 au 26 mars 2026.',
    verifiee: true,
  },
  wp_taittinger_pe: {
    url: 'https://fr.wikipedia.org/wiki/Champagne_Taittinger',
    titre: 'Champagne Taittinger — Wikipédia (section historique)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Pierre-Emmanuel Taittinger conduit le rachat de la maison en mai 2006 avec Crédit Agricole ' +
      'Nord-Est (>500 M€). Vitalie Taittinger lui succède comme présidente le 2 janv. 2020.',
    verifiee: true,
  },
  wp_taittinger_vitalie: {
    url: 'https://fr.wikipedia.org/wiki/Vitalie_Taittinger',
    titre: 'Vitalie Taittinger — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-05-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Fille de Pierre-Emmanuel Taittinger. Présidente de Champagne Taittinger depuis le 2 janv. 2020.',
    verifiee: true,
  },
  pm_taittinger: {
    url: 'https://www.parismatch.com/actu/societe/mon-champagne-ma-bataille-668398',
    titre: 'Mon champagne, ma bataille — Paris Match',
    media: 'Paris Match',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2014-12-11'),
    dateConsultation: new Date('2026-07-02'),
    auteur: 'Jean-François Chaigneau',
    description:
      'Récit du rachat de Champagne Taittinger par Pierre-Emmanuel Taittinger et le Crédit Agricole ' +
      'Nord-Est en 2006. Source primaire sur les conditions du rachat (>500 M€).',
    verifiee: true,
  },
  wp_cr_grandest: {
    url: 'https://fr.wikipedia.org/wiki/Conseil_r%C3%A9gional_du_Grand_Est',
    titre: 'Conseil régional du Grand Est — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Institution issue de la fusion Alsace / Champagne-Ardenne / Lorraine (loi NOTRe 2015). ' +
      'Siège à Strasbourg. Franck Leroy élu président le 13 janv. 2023.',
    verifiee: true,
  },
  wp_grandest: {
    url: 'https://fr.wikipedia.org/wiki/Grand_Est',
    titre: 'Grand Est — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Région administrative française créée au 1er janv. 2016 (fusion 3 régions). ' +
      '5,6 millions d\'habitants. Capitale administrative : Strasbourg.',
    verifiee: true,
  },
  wp_lestrep: {
    url: 'https://fr.wikipedia.org/wiki/L%27Est_r%C3%A9publicain',
    titre: "L'Est Républicain — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-04-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Quotidien régional fondé en 1889, Nancy. Groupe EBRA (Crédit Mutuel). ' +
      '1er quotidien de Lorraine.',
    verifiee: true,
  },
  wp_dna: {
    url: 'https://fr.wikipedia.org/wiki/Derni%C3%A8res_nouvelles_d%27Alsace',
    titre: 'Dernières Nouvelles d\'Alsace — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-04-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Quotidien régional alsacien fondé en 1877, Strasbourg. Groupe EBRA (Crédit Mutuel). ' +
      '1er quotidien d\'Alsace.',
    verifiee: true,
  },
  wp_alsace: {
    url: 'https://fr.wikipedia.org/wiki/L%27Alsace',
    titre: "L'Alsace — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-04-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Quotidien régional mulhousien (Haut-Rhin + Territoire de Belfort). Groupe EBRA (Crédit Mutuel).',
    verifiee: true,
  },
  wp_lunion: {
    url: 'https://fr.wikipedia.org/wiki/L%27Union_(journal)',
    titre: "L'Union — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-04-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      'Quotidien régional rémois (Marne / Ardenne, Champagne-Ardenne). Groupe EBRA (Crédit Mutuel).',
    verifiee: true,
  },
  wp_soyonslibres: {
    url: 'https://fr.wikipedia.org/wiki/Soyons_libres',
    titre: 'Soyons libres — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-04-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description: 'Parti politique de droite libérale fondé en 2018, distinct de LR.',
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002).
// Entités référencées par wikidataId (résolution via trouverEntite).
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Mandats régionaux et municipaux ---
  {
    // P-O : Leroy président du Conseil régional Grand Est
    aType: 'personne',
    aRef: 'Q3082186',
    bType: 'organisation',
    bRef: 'Q124156208',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'Franck Leroy est élu président du Conseil régional Grand Est le 13 janvier 2023, ' +
      'succédant à Jean Rottner (démissionnaire). Mandat régional en cours (prochain scrutin : 2027).',
    dateDebut: new Date('2023-01-13'),
    dateFin: null,
    sourceRef: 'wp_leroy',
  },
  {
    // P-O : Grosdidier maire de Metz (réélu mars 2026, mandat en cours)
    aType: 'personne',
    aRef: 'Q3084783',
    bType: 'organisation',
    bRef: 'Q22690',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      'François Grosdidier est maire de Metz depuis le 3 juillet 2020 (Soyons libres, ex-LR). ' +
      'Réélu lors des élections municipales du 27 mars 2026. Mandat en cours.',
    dateDebut: new Date('2020-07-03'),
    dateFin: null,
    sourceRef: 'wp_grosdidier',
  },
  {
    // P-O : Robinet ancien maire de Reims (mandat expiré mars 2026)
    aType: 'personne',
    aRef: 'Q2863211',
    bType: 'organisation',
    bRef: 'Q41876',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Arnaud Robinet (LR) a été maire de Reims de 2008 au 26 mars 2026. ' +
      'Son dernier mandat (2020-2026) prend fin à l\'issue des élections municipales de mars 2026.',
    dateDebut: new Date('2020-05-18'),
    dateFin: new Date('2026-03-26'),
    sourceRef: 'wp_robinet',
  },
  {
    // P-O : Barseghian ancienne maire de Strasbourg (mandat expiré mars 2026)
    aType: 'personne',
    aRef: 'Q87246317',
    bType: 'organisation',
    bRef: 'Q6602',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Jeanne Barseghian (EELV / Les Écologistes) a été maire de Strasbourg du 4 juillet 2020 ' +
      'au 27 mars 2026. Première femme maire de la ville.',
    dateDebut: new Date('2020-07-04'),
    dateFin: new Date('2026-03-27'),
    sourceRef: 'wp_barseghian',
  },
  {
    // P-O : Klein ancien maire de Nancy (mandat expiré mars 2026)
    aType: 'personne',
    aRef: 'Q16663734',
    bType: 'organisation',
    bRef: 'Q40898',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Mathieu Klein (PS) a été maire de Nancy du 28 juin 2020 au 21 mars 2026.',
    dateDebut: new Date('2020-06-28'),
    dateFin: new Date('2026-03-21'),
    sourceRef: 'wp_klein',
  },
  {
    // P-O : Lutz ancienne maire de Mulhouse (mandat expiré mars 2026)
    aType: 'personne',
    aRef: 'Q47872392',
    bType: 'organisation',
    bRef: 'Q79815',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Michèle Lutz (LR / divers droite) a été maire de Mulhouse du 28 juin 2020 au 26 mars 2026.',
    dateDebut: new Date('2020-06-28'),
    dateFin: new Date('2026-03-26'),
    sourceRef: 'wp_lutz',
  },

  // --- Direction de Champagne Taittinger ---
  {
    // P-O : Vitalie Taittinger présidente de Champagne Taittinger (mandat en cours)
    aType: 'personne',
    aRef: 'Q119049742',
    bType: 'organisation',
    bRef: 'Q204901',
    typeLienCode: 'DIRIGEANT',
    description:
      'Vitalie Taittinger est présidente de Champagne Taittinger depuis le 2 janvier 2020, ' +
      'succédant à son père Pierre-Emmanuel Taittinger.',
    dateDebut: new Date('2020-01-02'),
    dateFin: null,
    sourceRef: 'wp_taittinger_vitalie',
  },
  {
    // P-O : Pierre-Emmanuel Taittinger ancien PDG de Champagne Taittinger (mandat terminé)
    aType: 'personne',
    aRef: 'Q3382982',
    bType: 'organisation',
    bRef: 'Q204901',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Pierre-Emmanuel Taittinger a présidé Champagne Taittinger de mai 2006 (rachat au fonds ' +
      'Starwood Capital avec Crédit Agricole Nord-Est) au 31 décembre 2019.',
    dateDebut: new Date('2006-05-31'),
    dateFin: new Date('2019-12-31'),
    sourceRef: 'wp_taittinger_pe',
  },
  {
    // P-P : lien familial Vitalie / Pierre-Emmanuel Taittinger
    aType: 'personne',
    aRef: 'Q119049742',
    bType: 'personne',
    bRef: 'Q3382982',
    typeLienCode: 'famille',
    description:
      'Vitalie Taittinger est la fille de Pierre-Emmanuel Taittinger. Elle lui succède à la ' +
      'présidence de Champagne Taittinger le 2 janvier 2020.',
    dateDebut: new Date('1979-06-29'),
    dateFin: null,
    sourceRef: 'wp_taittinger_vitalie',
  },

  // --- Affiliations partisanes ---
  {
    // P-O : Leroy ex-membre d'Horizons (déjà en base, Q108846587)
    aType: 'personne',
    aRef: 'Q3082186',
    bType: 'organisation',
    bRef: 'Q108846587',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Franck Leroy a rejoint Horizons (parti d\'Édouard Philippe) en 2022, ' +
      'avant de ne pas renouveler son adhésion pour 2023 afin de rester non-inscrit.',
    dateDebut: new Date('2022-01-01'),
    dateFin: new Date('2023-01-01'),
    sourceRef: 'wp_leroy',
  },
  {
    // P-O : Robinet affilié LR (Q20012759, déjà en base)
    aType: 'personne',
    aRef: 'Q2863211',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description: 'Arnaud Robinet est membre de Les Républicains (ex-UMP). Élu maire de Reims sous étiquette LR.',
    dateDebut: new Date('2002-01-01'),
    dateFin: null,
    sourceRef: 'wp_robinet',
  },
  {
    // P-O : Grosdidier affilié Soyons libres (Q65128542, créé dans ce seed)
    aType: 'personne',
    aRef: 'Q3084783',
    bType: 'organisation',
    bRef: 'Q65128542',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'François Grosdidier est affilié à Soyons libres depuis 2018. Il quitte formellement LR ' +
      'en décembre 2022 (suite à l\'élection d\'Éric Ciotti à la présidence du parti).',
    dateDebut: new Date('2018-01-01'),
    dateFin: null,
    sourceRef: 'wp_soyonslibres',
  },
  {
    // P-O : Barseghian affiliée Les Écologistes (Q613786, déjà en base)
    aType: 'personne',
    aRef: 'Q87246317',
    bType: 'organisation',
    bRef: 'Q613786',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Jeanne Barseghian est membre de Les Écologistes (ex-EELV) depuis 2013. ' +
      'Élue maire de Strasbourg sous étiquette EELV en 2020.',
    dateDebut: new Date('2013-01-01'),
    dateFin: null,
    sourceRef: 'wp_barseghian',
  },
  {
    // P-O : Klein affilié PS (Q170972, déjà en base)
    aType: 'personne',
    aRef: 'Q16663734',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Mathieu Klein est membre du Parti socialiste. Élu maire de Nancy et ancien conseiller ' +
      'régional de Lorraine sous étiquette PS.',
    dateDebut: new Date('2014-01-01'),
    dateFin: null,
    sourceRef: 'wp_klein',
  },
  {
    // P-O : Lutz affiliée LR (Q20012759, déjà en base)
    aType: 'personne',
    aRef: 'Q47872392',
    bType: 'organisation',
    bRef: 'Q20012759',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      'Michèle Lutz est affiliée à Les Républicains (LR). Élue députée LR du Haut-Rhin en 2017, ' +
      'puis maire de Mulhouse en 2020 sur liste LR / divers droite.',
    dateDebut: new Date('2017-06-18'),
    dateFin: null,
    sourceRef: 'wp_lutz',
  },

  // --- Lien conseillère régionale (Barseghian → CR Grand Est) ---
  {
    // P-O : Barseghian conseillère régionale Grand Est (2020-2026)
    aType: 'personne',
    aRef: 'Q87246317',
    bType: 'organisation',
    bRef: 'Q124156208',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      'Jeanne Barseghian a été conseillère régionale du Grand Est de juin 2020 au 21 mars 2026, ' +
      'en parallèle de son mandat de maire de Strasbourg.',
    dateDebut: new Date('2020-06-28'),
    dateFin: new Date('2026-03-21'),
    sourceRef: 'wp_barseghian',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-region-grandest] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
    throw new Error(
      `[seed-region-grandest] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données Grand Est précédentes...')
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
  console.log('Donnees precedentes supprimees.\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n+-- seed-region-grandest — Réseau d\'influence du Grand Est --+\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`OK User : ${user.email}\n`)

  console.log('-- Sources publiques --')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  OK ${data.titre}`)
  }

  console.log('\n-- Personnes (Wikidata) --')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  OK ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n-- Organisations (Wikidata) --')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  OK ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n-- Liens --')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  OK ${lien.typeLienCode} -- ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n+-- Bilan -----------------------------------------------+')
  console.log(`|  Personnes     : ${PERSONNES.length}`)
  console.log(`|    Leroy (CR Grand Est), Grosdidier (Metz), Robinet (Reims),`)
  console.log(`|    Barseghian (Strasbourg), Klein (Nancy), Lutz (Mulhouse),`)
  console.log(`|    P.-E. Taittinger, Vitalie Taittinger`)
  console.log(`|  Organisations : ${ORGANISATIONS.length}`)
  console.log(`|    CR Grand Est + 5 communes + Champagne Taittinger`)
  console.log(`|    + 4 médias (L'Est Rep., DNA, L'Alsace, L'Union)`)
  console.log(`|    + Soyons libres (nouveau parti, Q65128542)`)
  console.log(`|  Sources       : ${Object.keys(SOURCES).length} (Wikidata/Wikipédia + Paris Match)`)
  console.log(`|  Liens         : ${LIENS.length}`)
  console.log(`|    MANDAT_ELECTIF x2 (Leroy, Grosdidier — mandats en cours)`)
  console.log(`|    ANCIEN_MANDAT x5 (Robinet, Barseghian, Klein, Lutz, P.-E. Taittinger)`)
  console.log(`|    DIRIGEANT x1 (Vitalie Taittinger) + famille x1`)
  console.log(`|    AFFILIATION_PARTI x5 + ANCIEN_MANDAT x1 (Barseghian CR)`)
  console.log('|')
  console.log('|  Affaires judiciaires (Grosdidier) documentees dans bio.')
  console.log('|  Parties deja en base : LR Q20012759, PS Q170972,')
  console.log('|    Ecologistes Q613786, Horizons Q108846587.')
  console.log('+--------------------------------------------------------+\n')
}

main()
  .catch((err) => {
    console.error('[seed-region-grandest] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
