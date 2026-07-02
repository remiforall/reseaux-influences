/**
 * Seed Centre-Val de Loire — réseau d'influence régional.
 *
 * Enquête OSINT journalistique — 2026-07-02.
 *
 * Périmètre :
 *   Personnalités NOUVELLES :
 *     · François Bonneau (Q3084029) — Président du conseil régional CVL depuis 2007 (PS)
 *     · Serge Grouard (Q3479338)    — Maire d'Orléans, UMP heritage, réélu 2026
 *     · Emmanuel Denis (Q84564783)  — Maire de Tours depuis 2020, EELV, réélu 2026
 *     · Yann Galut (Q2507343)       — Maire de Bourges depuis 2020, PS, réélu 2026
 *     · Marc Gricourt (Q3288081)    — Maire de Blois depuis 2014, PS, réélu 2026
 *     · Jean-Pierre Gorges (Q3169360) — Ancien maire de Chartres 2001-2026 (4 mandats), DL/UMP
 *
 *   Personnalités DEJA EN BASE (référencées dans les liens uniquement) :
 *     Jack Lang (Q379229) — ex-maire de Blois 1989-2000, mandat ajouté s'il manque.
 *
 *   Organisations NOUVELLES :
 *     · Conseil régional Centre-Val de Loire (Q647976)
 *     · Communes : Orléans (Q6548), Tours (Q288), Bourges (Q132404), Blois (Q160927), Chartres (Q130272)
 *     · Cosmetic Valley (Q2817322) — pôle de compétitivité parfumerie-cosmétiques, créé 1994, Chartres
 *     · La Nouvelle République du Centre-Ouest (Q3211144) — quotidien régional, Tours
 *     · La République du Centre (Q3212596) — quotidien régional, Orléans
 *     · Parti socialiste (Q170972), UMP (Q173152), EELV (Q613786)
 *
 * Statuts judiciaires (présomption d'innocence — art. 9 CPC + art. 6 CESDH) :
 *   — Gorges : condamné en 2021 pour "injures publiques" envers une conseillère écologiste
 *     -> INFIRME en appel (Cour d'appel de Versailles, 2022) — aucune condamnation définitive.
 *     Signalement chambre régionale des comptes (2023) sur frais de représentation (42 000 euros/an
 *     sans justification détaillée) -> contrôle administratif, pas une procédure pénale.
 *     Défait aux élections municipales de mars 2026 par Ladislas Vergne.
 *
 * Sources : Wikidata (Q-id tous vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipedia FR, vie-publique.fr, chambre régionale des comptes (signalements publics).
 *
 * Cosmetic Valley : Wikipedia FR attribue l'initiative à Jean-Paul Guerlain (Q3168517) en 1994.
 *   Wikidata liste Jean-Luc Ansel (Q33102802) en P112 (fondateur). Discordance non recoupée
 *   a >= 2 sources -> aucun lien fondateur/dirigeant créé ici. A investiguer manuellement.
 *
 * Garde-fous :
 *   - EN_ATTENTE par défaut (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-region-cvl.js
 *   cd backend && node bin/seed-region-cvl.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — recoupées par >= 2 sources publiques (Wikidata + Wikipedia FR).
// ---------------------------------------------------------------------------

const PERSONNES = [
  {
    // Sources : Wikidata Q3084029 + Wikipedia FR
    // Wikidata P39 Q125905056 (president du conseil regional CVL) debut 2007-09-07
    nom: 'Bonneau',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1953-10-12'),
    lieuNaissance: 'Montargis (Loiret)',
    rolePrincipal: 'Président du conseil régional Centre-Val de Loire',
    rolesSecondaires: [
      'ancien conseiller municipal de Montargis (1983-2008)',
      'ancien adjoint au maire de Montargis (1989-2001)',
      'vice-président de Régions de France',
    ],
    bio:
      "Professeur puis conseiller pédagogique de formation, François Bonneau est élu conseiller " +
      "régional du Centre en 1998. Il devient président du conseil régional du Centre le " +
      "7 septembre 2007 en remplacement de Michel Sapin, poste qu'il conserve après le " +
      "changement de nom de la région en Centre-Val de Loire. Membre du Parti socialiste.",
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Bonneau_(homme_politique,_1953)',
    wikidataId: 'Q3084029',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3479338 + Wikipedia FR
    // Wikidata P39 Q62093606 (maire d'Orléans) : 2001-2008, 2008-2014, 2014-2020, 2020-2026, 2026-
    nom: 'Grouard',
    prenom: 'Serge',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1959-03-19'),
    lieuNaissance: 'Orléans (Loiret)',
    rolePrincipal: "Maire d'Orléans",
    rolesSecondaires: [
      'ancien député du Loiret (2002-2017)',
      'militant UMP puis LR',
    ],
    bio:
      "Serge Grouard est élu maire d'Orléans pour la première fois le 23 mars 2001. " +
      "Il exerce en parallèle un mandat de député du Loiret de 2002 à 2017. Réélu à la " +
      "mairie à chaque élection municipale (2008, 2014, 2020, 2026), il est la figure " +
      "centrale de la droite orléanaise, inscrit dans la tradition UMP puis LR.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Serge_Grouard',
    wikidataId: 'Q3479338',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q84564783 + Wikipedia FR
    // Wikidata P39 Q61235115 (maire de Tours) debut 2020-07-03, réélu 2026-03-27
    nom: 'Denis',
    prenom: 'Emmanuel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1971-09-23'),
    lieuNaissance: 'Tours (Indre-et-Loire)',
    rolePrincipal: 'Maire de Tours',
    rolesSecondaires: [
      "enseignant-chercheur en aménagement du territoire",
      'militant EELV',
    ],
    bio:
      "Emmanuel Denis, enseignant-chercheur en aménagement du territoire à l'Université de " +
      "Tours, mène une liste écologiste aux municipales de 2020 et remporte la ville le " +
      "28 juin 2020, mettant fin à 25 ans de gouvernance socialiste. Réélu en mars 2026. " +
      "Membre d'Europe Écologie Les Verts (EELV).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Emmanuel_Denis',
    wikidataId: 'Q84564783',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2507343 + Wikipedia FR
    // Wikidata P39 Q21172249 (maire de Bourges) debut 2020-07-03, réélu 2026-03-27
    nom: 'Galut',
    prenom: 'Yann',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1966-03-14'),
    lieuNaissance: null,
    rolePrincipal: 'Maire de Bourges',
    rolesSecondaires: [
      'ancien député du Cher (1997-2002 et 2012-2017)',
      'avocat',
      'militant PS',
    ],
    bio:
      "Avocat de formation, Yann Galut est élu député du Cher à deux reprises " +
      "(1997-2002 et 2012-2017). Il devient maire de Bourges le 3 juillet 2020 (PS), " +
      "réélu en mars 2026.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Yann_Galut',
    wikidataId: 'Q2507343',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3288081 + Wikipedia EN (pas de page Wikipedia FR distincte)
    // Wikidata P39 Q61744637 (maire de Blois) : 2014-2020, 2020-2026, 2026- (en cours)
    nom: 'Gricourt',
    prenom: 'Marc',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1961-04-05'),
    lieuNaissance: null,
    rolePrincipal: 'Maire de Blois',
    rolesSecondaires: [
      'conseiller régional Centre-Val de Loire depuis 2015',
      'militant PS',
    ],
    bio:
      "Marc Gricourt est élu maire de Blois le 5 avril 2014, réélu en 2020 et en " +
      "mars 2026 (mandat actuel depuis le 28 mars 2026). Conseiller régional " +
      "Centre-Val de Loire depuis décembre 2015. Membre du Parti socialiste. " +
      "Source principale : Wikidata Q3288081 + Wikipedia EN (pas de page Wikipedia FR).",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Marc_Gricourt',
    wikidataId: 'Q3288081',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3169360 + Wikipedia FR
    // Wikidata P39 Q62087594 (maire de Chartres) fin=2026-03-27 — mandat clos.
    // Statut judiciaire : condamné 2021 pour injures publiques -> INFIRME en appel 2022.
    // CRC 2023 : frais de représentation 42 000 euros/an sans justification -> contrôle administratif.
    nom: 'Gorges',
    prenom: 'Jean-Pierre',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1953-08-03'),
    lieuNaissance: null,
    rolePrincipal: 'Ancien maire de Chartres (2001-2026)',
    rolesSecondaires: [
      "ancien député d'Eure-et-Loir (2002-2007, mandat annulé par le Conseil constitutionnel)",
      'militant Démocratie libérale puis UMP',
    ],
    bio:
      "Jean-Pierre Gorges exerce 4 mandats consécutifs de maire de Chartres " +
      "(23 mars 2001 - 28 mars 2026). Défait lors des élections municipales de " +
      "mars 2026 par Ladislas Vergne. Son élection de député 2007 a été annulée " +
      "par le Conseil constitutionnel (inaugurations de logements influençant le vote). " +
      "En 2021, condamnation pour injures publiques envers une conseillère écologiste " +
      "INFIRMEE en appel (Cour d'appel de Versailles, 2022) — aucune condamnation " +
      "définitive. La chambre régionale des comptes a pointé en 2023 des frais de " +
      "représentation (42 000 euros/an) sans justification détaillée — contrôle " +
      "administratif, hors procédure pénale.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Pierre_Gorges',
    wikidataId: 'Q3169360',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q647976 + site officiel du conseil régional
    nom: 'Conseil régional Centre-Val de Loire',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.regioncentre-valdeloire.fr',
    description:
      "Assemblée délibérante de la région Centre-Val de Loire, dont le siège est à Orléans. " +
      "Présidée par François Bonneau (PS) depuis 2007. Anciennement conseil régional du Centre.",
    dateCreation: new Date('1972-07-05'),
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/Conseil_r%C3%A9gional_du_Centre-Val_de_Loire',
    wikidataId: 'Q647976',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Wikidata Q6548 — chef-lieu de région
    nom: 'Orléans',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.orleans.fr',
    description:
      "Commune chef-lieu du département du Loiret et de la région Centre-Val de Loire. " +
      "Maire actuel : Serge Grouard (LR heritage), réélu en mars 2026.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Orl%C3%A9ans',
    wikidataId: 'Q6548',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Wikidata Q288
    nom: 'Tours',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.tours.fr',
    description:
      "Commune préfecture d'Indre-et-Loire, deuxième ville de Centre-Val de Loire. " +
      "Maire actuel : Emmanuel Denis (EELV) depuis 2020, réélu 2026.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tours',
    wikidataId: 'Q288',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Wikidata Q132404
    nom: 'Bourges',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.ville-bourges.fr',
    description:
      "Commune préfecture du Cher. Maire actuel : Yann Galut (PS) depuis 2020, réélu 2026.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bourges',
    wikidataId: 'Q132404',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Wikidata Q160927
    nom: 'Blois',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.blois.fr',
    description:
      "Commune préfecture de Loir-et-Cher. Ancienne ville de Jack Lang (maire 1989-2000). " +
      "Maire actuel : Marc Gricourt (PS) depuis 2014, réélu 2026.",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Blois',
    wikidataId: 'Q160927',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Wikidata Q130272
    nom: 'Chartres',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.chartres.fr',
    description:
      "Commune préfecture d'Eure-et-Loir. Siège du pôle de compétitivité Cosmetic Valley. " +
      "Ancien maire : Jean-Pierre Gorges (2001-2026). Nouveau maire : Ladislas Vergne (2026).",
    dateCreation: null,
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Chartres',
    wikidataId: 'Q130272',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2817322 + Wikipedia FR
    // Fondateur selon WP FR : Jean-Paul Guerlain (1994). Wikidata liste Ansel (P112) — discordance.
    // -> aucun lien fondateur créé (voir commentaire en tête de fichier).
    nom: 'Cosmetic Valley',
    sigle: null,
    typeOrganisation: 'ASSOCIATION',
    pays: 'France',
    siteWeb: 'https://www.cosmetic-valley.com',
    description:
      "Pôle de compétitivité français de la filière parfumerie-cosmétiques, créé en 1994 " +
      "à l'initiative de Jean-Paul Guerlain dans la région de Chartres. Labellisé pôle de " +
      "compétitivité en 2005. Membres : L'Oréal, LVMH, Shiseido, Caudalie. Couvre plusieurs " +
      "départements (Eure-et-Loir, Loiret, Indre-et-Loire, Eure, Yvelines).",
    dateCreation: new Date('1994-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Cosmetic_Valley',
    wikidataId: 'Q2817322',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3211144
    nom: 'La Nouvelle République du Centre-Ouest',
    sigle: 'NR',
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.lanouvellerepublique.fr',
    description:
      "Quotidien régional français fondé en 1944, basé à Tours. " +
      "Principal journal de presse régionale de Centre-Val de Loire. " +
      "Propriété du groupe NR (Wikidata Q3345182).",
    dateCreation: new Date('1944-01-01'),
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/La_Nouvelle_R%C3%A9publique_du_Centre-Ouest',
    wikidataId: 'Q3211144',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    // Sources : Wikidata Q3212596
    nom: 'La République du Centre',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.larep.fr',
    description:
      "Quotidien régional français, principal journal du Loiret (Orléans). " +
      "Publié par le groupe Centre France (Wikidata Q2944761).",
    dateCreation: null,
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/La_R%C3%A9publique_du_Centre',
    wikidataId: 'Q3212596',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    // Sources : Wikidata Q170972 + Wikipedia FR
    nom: 'Parti socialiste',
    sigle: 'PS',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.parti-socialiste.fr',
    description:
      "Parti politique français de centre-gauche, fondé en 1969. En Centre-Val de Loire, " +
      "dominant dans les grandes villes (Bourges, Blois) et à la tête du conseil régional.",
    dateCreation: new Date('1969-07-11'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Parti_socialiste_(France)',
    wikidataId: 'Q170972',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q173152 + Wikipedia FR
    nom: 'Union pour un mouvement populaire',
    sigle: 'UMP',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Parti politique français de centre-droit, existant de 2002 à 2015, devenu Les Républicains. " +
      "Parti de rattachement de Serge Grouard et de Jean-Pierre Gorges selon Wikidata.",
    dateCreation: new Date('2002-11-17'),
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/Union_pour_un_mouvement_populaire',
    wikidataId: 'Q173152',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q613786 + Wikipedia FR
    nom: 'Europe Écologie Les Verts',
    sigle: 'EELV',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://lesecologistes.fr',
    description:
      "Parti politique français écologiste, fondé en 2010. Parti de rattachement d'Emmanuel Denis, " +
      "maire de Tours élu en 2020 et réélu 2026.",
    dateCreation: new Date('2010-11-13'),
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/Europe_%C3%89cologie_Les_Verts',
    wikidataId: 'Q613786',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_bonneau: {
    url: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Bonneau_(homme_politique,_1953)',
    titre: 'François Bonneau — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Biographie : enseignant reconverti, président du CR Centre depuis sept. 2007 (suite à M. Sapin), PS.",
    verifiee: true,
  },
  wp_grouard: {
    url: 'https://fr.wikipedia.org/wiki/Serge_Grouard',
    titre: 'Serge Grouard — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Maire d'Orléans depuis 2001, député Loiret 2002-2017, UMP/LR. Multiple mandats consécutifs.",
    verifiee: true,
  },
  wp_denis: {
    url: 'https://fr.wikipedia.org/wiki/Emmanuel_Denis',
    titre: 'Emmanuel Denis — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Enseignant-chercheur en aménagement, élu maire de Tours juin 2020 (EELV), réélu 2026.",
    verifiee: true,
  },
  wp_galut: {
    url: 'https://fr.wikipedia.org/wiki/Yann_Galut',
    titre: 'Yann Galut — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Avocat, ex-député du Cher (1997-2002 et 2012-2017), maire de Bourges depuis juillet 2020 (PS).",
    verifiee: true,
  },
  wp_gorges: {
    url: 'https://fr.wikipedia.org/wiki/Jean-Pierre_Gorges',
    titre: 'Jean-Pierre Gorges — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Maire de Chartres 2001-2026 (4 mandats, DL/UMP). Défait en 2026. Annulation mandat député 2007.",
    verifiee: true,
  },
  wp_jack_lang: {
    url: 'https://fr.wikipedia.org/wiki/Jack_Lang',
    titre: 'Jack Lang — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Homme politique français, PS, ancien ministre de la Culture, maire de Blois 1989-2000.",
    verifiee: true,
  },
  wp_cvl_region: {
    url: 'https://fr.wikipedia.org/wiki/Conseil_r%C3%A9gional_du_Centre-Val_de_Loire',
    titre: 'Conseil régional du Centre-Val de Loire — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Présidence de François Bonneau depuis 2007, assemblée régionale siégeant à Orléans.",
    verifiee: true,
  },
  wp_cosmetic_valley: {
    url: 'https://fr.wikipedia.org/wiki/Cosmetic_Valley',
    titre: 'Cosmetic Valley — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Pôle parfumerie-cosmétiques fondé en 1994 à Chartres à l'initiative de Jean-Paul Guerlain ; pôle de compétitivité depuis 2005.",
    verifiee: true,
  },
  wd_gricourt: {
    url: 'https://www.wikidata.org/wiki/Q3288081',
    titre: 'Marc Gricourt — Wikidata Q3288081',
    media: 'Wikidata',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Données structurées : maire de Blois P39/Q61744637, mandats 2014-2020, 2020-2026, 2026-. Pas de Wikipedia FR.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002), exactement 1 entité non-nulle de chaque côté.
// ---------------------------------------------------------------------------

const LIENS = [
  // ── François Bonneau ──────────────────────────────────────────────────────

  {
    // P-O : Bonneau -> Conseil régional CVL (mandat électif en cours)
    aType: 'personne',
    aRef: 'Q3084029',
    bType: 'organisation',
    bRef: 'Q647976',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "François Bonneau est président du conseil régional Centre-Val de Loire depuis le " +
      "7 septembre 2007, réélu à chaque renouvellement régional (2010, 2015, 2021).",
    dateDebut: new Date('2007-09-07'),
    dateFin: null,
    sourceRef: 'wp_bonneau',
  },
  {
    // P-O : Bonneau -> PS
    aType: 'personne',
    aRef: 'Q3084029',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "François Bonneau est membre du Parti socialiste, parti sous l'étiquette duquel il " +
      "exerce l'ensemble de ses mandats régionaux.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_bonneau',
  },

  // ── Serge Grouard ─────────────────────────────────────────────────────────

  {
    // P-O : Grouard -> Orléans (premier mandat 2001, en cours depuis 2026)
    aType: 'personne',
    aRef: 'Q3479338',
    bType: 'organisation',
    bRef: 'Q6548',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Serge Grouard est élu maire d'Orléans pour la première fois le 23 mars 2001 ; " +
      "réélu en 2008, 2014, 2020 et 2026 (mandat actuel depuis le 29 mars 2026).",
    dateDebut: new Date('2001-03-23'),
    dateFin: null,
    sourceRef: 'wp_grouard',
  },
  {
    // P-O : Grouard -> UMP
    aType: 'personne',
    aRef: 'Q3479338',
    bType: 'organisation',
    bRef: 'Q173152',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Serge Grouard exerce ses mandats sous l'étiquette UMP (puis LR). " +
      "Wikidata recense affiliations RPR (Q1052584) et UMP (Q173152).",
    dateDebut: new Date('2002-11-17'),
    dateFin: null,
    sourceRef: 'wp_grouard',
  },

  // ── Emmanuel Denis ────────────────────────────────────────────────────────

  {
    // P-O : Denis -> Tours
    aType: 'personne',
    aRef: 'Q84564783',
    bType: 'organisation',
    bRef: 'Q288',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Emmanuel Denis devient maire de Tours le 3 juillet 2020 (liste EELV-Gauche unie), " +
      "réélu lors des élections municipales de mars 2026.",
    dateDebut: new Date('2020-07-03'),
    dateFin: null,
    sourceRef: 'wp_denis',
  },
  {
    // P-O : Denis -> EELV
    aType: 'personne',
    aRef: 'Q84564783',
    bType: 'organisation',
    bRef: 'Q613786',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Emmanuel Denis est membre d'Europe Écologie Les Verts (EELV), parti sous l'étiquette " +
      "duquel il remporte Tours en 2020 et 2026.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_denis',
  },

  // ── Yann Galut ────────────────────────────────────────────────────────────

  {
    // P-O : Galut -> Bourges
    aType: 'personne',
    aRef: 'Q2507343',
    bType: 'organisation',
    bRef: 'Q132404',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Yann Galut est élu maire de Bourges le 3 juillet 2020 (PS), réélu en mars 2026.",
    dateDebut: new Date('2020-07-03'),
    dateFin: null,
    sourceRef: 'wp_galut',
  },
  {
    // P-O : Galut -> PS
    aType: 'personne',
    aRef: 'Q2507343',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Yann Galut est membre du Parti socialiste, élu et réélu maire de Bourges sous cette étiquette.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_galut',
  },

  // ── Marc Gricourt ─────────────────────────────────────────────────────────

  {
    // P-O : Gricourt -> Blois
    aType: 'personne',
    aRef: 'Q3288081',
    bType: 'organisation',
    bRef: 'Q160927',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Marc Gricourt est élu maire de Blois le 5 avril 2014, réélu en mai 2020 et mars 2026 " +
      "(mandat actuel depuis le 28 mars 2026). Source : Wikidata Q3288081 + Wikipedia EN.",
    dateDebut: new Date('2014-04-05'),
    dateFin: null,
    sourceRef: 'wd_gricourt',
  },
  {
    // P-O : Gricourt -> PS
    aType: 'personne',
    aRef: 'Q3288081',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Marc Gricourt est membre du Parti socialiste, élu et réélu maire de Blois sous cette étiquette.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wd_gricourt',
  },

  // ── Jean-Pierre Gorges ────────────────────────────────────────────────────

  {
    // P-O : Gorges -> Chartres (4 mandats — ANCIEN_MANDAT car terme clos en mars 2026)
    aType: 'personne',
    aRef: 'Q3169360',
    bType: 'organisation',
    bRef: 'Q130272',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Jean-Pierre Gorges exerce 4 mandats consécutifs de maire de Chartres " +
      "(23 mars 2001 - 28 mars 2026). Défait aux municipales 2026 par Ladislas Vergne. " +
      "Statut judiciaire : condamnation 2021 pour injures publiques INFIRMEE en appel 2022 " +
      "(aucune condamnation définitive) ; frais de représentation signalés par la CRC 2023 " +
      "(contrôle administratif, pas pénal).",
    dateDebut: new Date('2001-03-23'),
    dateFin: new Date('2026-03-28'),
    sourceRef: 'wp_gorges',
  },
  {
    // P-O : Gorges -> UMP
    aType: 'personne',
    aRef: 'Q3169360',
    bType: 'organisation',
    bRef: 'Q173152',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Jean-Pierre Gorges rejoint l'UMP après son militantisme à Démocratie libérale (Q686372). " +
      "Wikidata recense aussi Nous Citoyens (Q18188987) parmi ses partis successifs.",
    dateDebut: new Date('2002-11-17'),
    dateFin: null,
    sourceRef: 'wp_gorges',
  },

  // ── Jack Lang (déjà en base) — ANCIEN_MANDAT Blois 1989-2000 ─────────────

  {
    // P-O : Jack Lang -> Blois (ANCIEN_MANDAT 1989-2000)
    // Jack Lang est déjà en base (Q379229). trouverEntite cherche par wikidataId.
    // Si absent : le lien est ignoré avec un avertissement (voir main()).
    aType: 'personne',
    aRef: 'Q379229',
    bType: 'organisation',
    bRef: 'Q160927',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Jack Lang est élu maire de Blois le 20 mars 1989 et démissionne le 1er janvier 2000 " +
      "après sa nomination comme ministre de l'Education nationale. " +
      "Source : Wikidata Q379229 (P39/Q61744637, dates 1989-03-20 à 2000-01-01).",
    dateDebut: new Date('1989-03-20'),
    dateFin: new Date('2000-01-01'),
    sourceRef: 'wp_jack_lang',
  },

  // ── Cosmetic Valley ──────────────────────────────────────────────────────

  {
    // O-O : Cosmetic Valley -> Chartres (lien économique : siège + territoire)
    aType: 'organisation',
    aRef: 'Q2817322',
    bType: 'organisation',
    bRef: 'Q130272',
    typeLienCode: 'economique',
    description:
      "Cosmetic Valley a son siège social à Chartres (Eure-et-Loir) et constitue le principal " +
      "pôle de compétitivité économique du territoire chartrain depuis 1994.",
    dateDebut: new Date('1994-01-01'),
    dateFin: null,
    sourceRef: 'wp_cosmetic_valley',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-cvl] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-cvl] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Reset : suppression données CVL précédentes...')
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
  console.log('\n--- seed-region-cvl : Réseau d\'influence Centre-Val de Loire ---\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('Sources publiques :')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  OK ${data.titre}`)
  }

  console.log('\nPersonnes (nouvelles) :')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  OK ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\nJack Lang (déjà en base) : vérification...')
  const lang = await trouverEntite('personne', 'Q379229')
  if (!lang) {
    console.warn(
      '  AVERT Jack Lang (Q379229) introuvable — lancer seed-hollande ou seed-grandes-ecoles avant.',
    )
    console.warn('  -> Le lien ANCIEN_MANDAT Jack Lang -> Blois sera ignoré.')
  } else {
    console.log(`  OK Jack Lang (${lang.prenom} ${lang.nom}) trouvé en base.`)
  }

  console.log('\nOrganisations :')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  OK ${created.nom} (${o.wikidataId})`)
  }

  console.log('\nLiens :')
  for (const lien of LIENS) {
    if (lien.aRef === 'Q379229' && !lang) {
      console.warn(`  SKIP (Jack Lang absent) : ${lien.typeLienCode} Q379229 -> ${lien.bRef}`)
      continue
    }
    try {
      await creerLien(lien, sourcesMap, user.id)
      console.log(`  OK ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
    } catch (err) {
      console.error(`  ERREUR ${lien.typeLienCode} (${lien.aRef}->${lien.bRef}) : ${err.message}`)
    }
  }

  const liensEffectifs = lang ? LIENS.length : LIENS.length - 1

  console.log('\n--- Bilan ---')
  console.log(`Personnes nouvelles : ${PERSONNES.length} (Bonneau, Grouard, Denis, Galut, Gricourt, Gorges)`)
  console.log(`Deja en base        : Jack Lang (Q379229) reference uniquement`)
  console.log(`Organisations       : ${ORGANISATIONS.length} (conseil regional, 5 communes, Cosmetic Valley, 2 medias, 3 partis)`)
  console.log(`Sources             : ${Object.keys(SOURCES).length} (Wikipedia FR/EN, Wikidata)`)
  console.log(`Liens               : ${liensEffectifs} / ${LIENS.length} (MANDAT_ELECTIF, ANCIEN_MANDAT, AFFILIATION_PARTI, economique)`)
  console.log('Affaire Gorges      : condamnation 2021 INFIRMEE appel 2022 — aucune condamnation definitive.')
  console.log('Cosmetic Valley     : discordance fondateur Wikidata/WP -> aucun lien fondateur cree.')
  console.log('Grouard LR          : Wikidata recense UMP, pas LR — AFFILIATION_PARTI sur UMP (historique).')
}

main()
  .catch((err) => {
    console.error('[seed-cvl] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
