/**
 * Seed Polynésie française — réseau d'influence (enquête OSINT, 2026-07-02).
 *
 * Périmètre :
 *   - Polynésie française (COM, Q30971) + Assemblée de la Polynésie française (Q2729213)
 *   - Président Moetai Brotherson (Q30350575, Tavini) depuis le 12 mai 2023
 *   - Président de l'Assemblée Antony Géros (Q2857540, Tavini) depuis le 11 mai 2023
 *   - Tavini Huiraatira (Q2746044, indépendantiste) — Oscar Temaru fondateur (Q936654)
 *   - Tapura Huiraatira (Q23691290, autonomiste, fondé 2016) — Édouard Fritch fondateur (Q1106890)
 *   - Tahoeraa Huiraatira / Amuitahiraa (Q3513932) — Gaston Flosse fondateur (Q2747180)
 *   - A Tia Porinetia (Q115518506)
 *   - La Dépêche de Tahiti (Q3208485) + Tahiti Infos (Q109314702)
 *
 * Q-id tous vérifiés via wbsearchentities / Special:EntityData (2026-07-02).
 * Sources : Wikidata, Wikipédia FR, France Info, Légifrance.
 *
 * EXCLUSIONS (sans Q-id Wikidata vérifié ou ambigu) :
 *   - Acteurs économiques (perliculture, tourisme, groupes locaux) :
 *     Air Tahiti Nui, Hinano, Groupement Wane non appariés à un Q-id vérifié
 *     → à investiguer via SIRENE/GLEIF avec les connecteurs entreprises-fr / gleif
 *   - Nicole Sanquer (fondatrice d'A Tia Porinetia) : Q20089164 ambigu
 *     (données Wikidata : circonscription "Hauts-de-Seine 3e" incohérente avec son profil
 *     polynésien ; confusion possible avec une homonyme métropolitaine) → exclu par précaution.
 *     À recouper manuellement : https://fr.wikipedia.org/wiki/Nicole_Sanquer
 *   - Haut-commissaire de la République en Polynésie française :
 *     vérifier si déjà en base (anti-doublon wikidataId) avant tout import.
 *
 * AFFAIRES FLOSSE — condamnations DÉFINITIVES (Cour de cassation, présomption d'innocence N/A) :
 *   1. Emplois fictifs (Cour de cassation, 2014) :
 *      4 ans sursis, 125 000 € amende, 3 ans privation droits civiques.
 *      Des agents de la Polynésie française ont été payés sur fonds publics pour
 *      travailler au bénéfice du parti Tahoeraa Huiraatira.
 *   2. Affaire de la citerne d'eau (Cour de cassation, 2022) :
 *      2 ans sursis, ~83 000 € amende, 5 ans inéligibilité.
 *   Ces deux condamnations sont définitives (Cour de cassation, pas de recours ultérieur
 *   possible sur le fond). Les autres condamnations (Cour d'appel 2023 et 2026) sont notées
 *   dans la bio mais non consignées en lien "juridique" car statut procédural à vérifier.
 *
 * Garde-fous projet :
 *   - Toutes les entités en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - Idempotent (upsert par wikidataId)
 *
 * Usage :
 *   cd backend && node bin/seed-region-polynesie.js
 *   cd backend && node bin/seed-region-polynesie.js --reset
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
    // Sources : Wikidata Q30350575 (P569 22/10/1969, P19 Papeete, P39 Président de la
    //           Polynésie française depuis 12/05/2023, P102 Q2746044 Tavini Huiraatira)
    //           + Wikipédia FR "Moetai Brotherson"
    // Rôle public : premier Président indépendantiste de la Polynésie française, élu mai 2023.
    nom: 'Brotherson',
    prenom: 'Moetai',
    pays: 'Polynésie française',
    nationalite: 'française',
    dateNaissance: new Date('1969-10-22'),
    lieuNaissance: 'Papeete (Polynésie française)',
    rolePrincipal: "Président de la Polynésie française",
    rolesSecondaires: [
      "ancien député de Polynésie française à l'Assemblée nationale (2017-2022, 2022-2023)",
      "membre du Tavini Huiraatira (parti indépendantiste)",
    ],
    bio:
      "Moetai Brotherson est élu Président de la Polynésie française le 12 mai 2023, après la " +
      "victoire du Tavini Huiraatira aux élections territoriales d'avril 2023 — première victoire " +
      "indépendantiste depuis la création du gouvernement autonome. Ancien député à l'Assemblée " +
      "nationale, il prend la tête d'un exécutif promouvant l'indépendance de la Polynésie française.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Moetai_Brotherson',
    wikidataId: 'Q30350575',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2857540 (P569 22/07/1956, P19 Nanterre, P102 Q2746044 Tavini Huiraatira)
    //           + Wikipédia FR "Antony Géros"
    //           + Assemblée de la Polynésie française (procès-verbal séance 11 mai 2023)
    // Rôle public : Président de l'Assemblée de la Polynésie française depuis mai 2023.
    nom: 'Géros',
    prenom: 'Antony',
    pays: 'Polynésie française',
    nationalite: 'française',
    dateNaissance: new Date('1956-07-22'),
    lieuNaissance: 'Nanterre (Hauts-de-Seine)',
    rolePrincipal: "Président de l'Assemblée de la Polynésie française",
    rolesSecondaires: [
      "membre du Tavini Huiraatira",
      "figure de l'aile sociale du mouvement indépendantiste polynésien",
    ],
    bio:
      "Antony Géros est élu Président de l'Assemblée de la Polynésie française le 11 mai 2023, " +
      "lors de la session inaugurale de l'assemblée issue des élections territoriales d'avril 2023. " +
      "Il est membre du Tavini Huiraatira, le parti indépendantiste fondé par Oscar Temaru.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Antony_G%C3%A9ros',
    wikidataId: 'Q2857540',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q936654 (P569 01/11/1944, P19 Faaa, P102 Q2746044 Tavini)
    //           + Wikipédia FR "Oscar Temaru"
    // Rôle public : figure historique de l'indépendance polynésienne, fondateur du Tavini,
    //               président de la Polynésie française à plusieurs reprises (2004-2013),
    //               président de l'Assemblée de la Polynésie française (2014-2020).
    nom: 'Temaru',
    prenom: 'Oscar',
    pays: 'Polynésie française',
    nationalite: 'française',
    dateNaissance: new Date('1944-11-01'),
    lieuNaissance: "Faʻaʻā (Polynésie française)",
    rolePrincipal: "Fondateur du Tavini Huiraatira, ex-Président de la Polynésie française",
    rolesSecondaires: [
      "ex-Président de la Polynésie française (plusieurs mandats, 2004-2013)",
      "ex-Président de l'Assemblée de la Polynésie française (2014-2020)",
      "maire de Faʻaʻā (1983-2014)",
      "fondateur et leader historique du Tavini Huiraatira (1977)",
    ],
    bio:
      "Oscar Temaru est la figure fondatrice de l'indépendantisme polynésien moderne. Il fonde le " +
      "Tavini Huiraatira en 1977 et devient maire de Faʻaʻā en 1983. Il est élu Président de la " +
      "Polynésie française à plusieurs reprises (2004, 2005, 2006-2008, 2011-2013), toujours " +
      "fragilisé par des coalitions instables face à Gaston Flosse. Président de l'Assemblée " +
      "de la Polynésie française de 2014 à 2020, il demeure le symbole vivant de " +
      "l'indépendantisme polynésien.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Oscar_Temaru',
    wikidataId: 'Q936654',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q1106890 (P569 04/01/1952, P19 Papeete,
    //           P39 Président de la Polynésie française 28/03/2014 – 12/05/2023,
    //           P102 Q23691290 Tapura Huiraatira)
    //           + Wikipédia FR "Édouard Fritch"
    // Rôle public : président de la Polynésie française (2014-2023), fondateur du Tapura.
    nom: 'Fritch',
    prenom: 'Édouard',
    pays: 'Polynésie française',
    nationalite: 'française',
    dateNaissance: new Date('1952-01-04'),
    lieuNaissance: 'Papeete (Polynésie française)',
    rolePrincipal: "Fondateur du Tapura Huiraatira, ex-Président de la Polynésie française (2014-2023)",
    rolesSecondaires: [
      "fondateur et président du Tapura Huiraatira (depuis 2016)",
      "ex-membre du Tahoeraa Huiraatira de Gaston Flosse (avant 2016)",
      "ancien député à l'Assemblée nationale (1986-1988, 2012-2014)",
      "gendre de Gaston Flosse",
    ],
    bio:
      "Gendre de Gaston Flosse, Édouard Fritch rompt avec ce dernier et fonde le Tapura Huiraatira " +
      "le 20 février 2016, parti autonomiste. Il gouverne la Polynésie française du 28 mars 2014 " +
      "au 12 mai 2023, devenant la personnalité politique polynésienne la plus durable de la décennie. " +
      "Sa défaite aux élections territoriales d'avril 2023 face au Tavini de Brotherson met fin à " +
      "neuf ans de présidence.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89douard_Fritch',
    wikidataId: 'Q1106890',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q2747180 (P569 24/06/1931, P19 Arue, P102 Q3513932 Tahoeraa,
    //           P1399 condamnation emplois fictifs)
    //           + Wikipédia FR "Gaston Flosse" (condamnations Cour de cassation documentées)
    // Rôle public : figure historique dominante de la politique polynésienne (1965-2014),
    //               fondateur du Tahoeraa Huiraatira, président de la Polynésie française à
    //               plusieurs reprises, objet de condamnations pénales définitives.
    // STATUT JUDICIAIRE : condamnations DÉFINITIVES (Cour de cassation) — pas allégations.
    //   • Emplois fictifs (Ccass 2014) : 4 ans sursis, 125 000 € amende, 3 ans inéligibilité.
    //   • Affaire citerne eau (Ccass 2022) : 2 ans sursis, ~83 000 €, 5 ans inéligibilité.
    //   Autres condamnations (Cour d'appel Paris 2023 : dissimulation de patrimoine ;
    //   Cour d'appel Papeete 2026 : faux bail) documentées par Wikipedia mais statut
    //   procédural non confirmé définitif → consignées dans la bio, non codées en lien juridique.
    nom: 'Flosse',
    prenom: 'Gaston',
    pays: 'Polynésie française',
    nationalite: 'française',
    dateNaissance: new Date('1931-06-24'),
    lieuNaissance: 'Arue (Polynésie française)',
    rolePrincipal: "Fondateur du Tahoeraa Huiraatira, ex-Président de la Polynésie française",
    rolesSecondaires: [
      "ex-Président de la Polynésie française (1984-1987, 1991-2004, 2008, 2013-2014)",
      "ex-sénateur de la Polynésie française (1998-2014)",
      "fondateur et président du Tahoeraa Huiraatira (1977)",
      "ancien maire de Pirae (1965-2000)",
    ],
    bio:
      "Gaston Flosse domine la politique polynésienne pendant quarante ans. Fondateur du Tahoeraa " +
      "Huiraatira en 1977, président de la Polynésie française à plusieurs reprises (1984-1987, " +
      "1991-2004, 2008, 2013-2014), sénateur (1998-2014), il est l'allié historique du RPR/UMP " +
      "en métropole. Il fait l'objet de plusieurs condamnations pénales définitives (Cour de " +
      "cassation) : emplois fictifs (2014, 4 ans sursis, 125 000 €) et affaire de la citerne " +
      "d'eau (2022, 2 ans sursis, 83 000 €, 5 ans inéligibilité). Son gendre Édouard Fritch " +
      "le supplante en 2016 en fondant le Tapura Huiraatira.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Gaston_Flosse',
    wikidataId: 'Q2747180',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q30971 (French overseas country in the southern Pacific Ocean)
    //           + Wikipédia FR "Polynésie française" (statut COM, assemblée, gouvernement)
    nom: 'Polynésie française',
    sigle: 'PF',
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.polynesie-francaise.pf/',
    description:
      "Collectivité d'outre-mer (COM) de la République française dans le Pacifique Sud, composée de " +
      "118 îles et atolls regroupés en cinq archipels (Société, Tuamotu, Gambier, Australes, " +
      "Marquises). Régie par la loi organique du 27 février 2004, la Polynésie française dispose " +
      "d'une large autonomie : Président élu par l'Assemblée, conseil des ministres, compétences " +
      "propres en droit civil, fiscal, social. Capitale administrative : Papeete.",
    dateCreation: new Date('2004-02-27'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Polyn%C3%A9sie_fran%C3%A7aise',
    wikidataId: 'Q30971',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2729213 (parliament of French Polynesia)
    //           + Wikipédia FR "Assemblée de la Polynésie française"
    nom: 'Assemblée de la Polynésie française',
    sigle: null,
    typeOrganisation: 'INSTITUTION_PUBLIQUE',
    pays: 'France',
    siteWeb: 'https://www.assemblee.pf/',
    description:
      "Parlement unicaméral de la Polynésie française, composé de 57 représentants élus pour " +
      "5 ans au scrutin de liste proportionnel. Élit le Président de la Polynésie française, " +
      "vote le budget et les lois du pays. Antony Géros (Tavini Huiraatira) en est le Président " +
      "depuis le 11 mai 2023.",
    dateCreation: new Date('1977-07-12'),
    wikipediaUrl:
      'https://fr.wikipedia.org/wiki/Assembl%C3%A9e_de_la_Polyn%C3%A9sie_fran%C3%A7aise',
    wikidataId: 'Q2729213',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q2746044 (parti politique polynésien, fondé 1977)
    //           + Wikipédia FR "Tavini huiraatira"
    nom: 'Tavini Huiraatira',
    sigle: 'Tavini',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.tavini.pf/',
    description:
      "Parti politique polynésien indépendantiste, fondé en 1977 par Oscar Temaru. Le Tavini " +
      "Huiraatira (en tahitien : « Au service du peuple ») prône l'indépendance de la " +
      "Polynésie française vis-à-vis de la France et la dénucléarisation du Pacifique. " +
      "Il remporte les élections territoriales d'avril 2023, portant Moetai Brotherson à la " +
      "présidence — première victoire indépendantiste de son histoire.",
    dateCreation: new Date('1977-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tavini_huiraatira',
    wikidataId: 'Q2746044',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q23691290 (political party in French Polynesia, fondé 2016-02-20)
    //           + Wikipédia FR "Tapura huiraatira"
    nom: 'Tapura Huiraatira',
    sigle: 'Tapura',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Parti politique polynésien autonomiste fondé le 20 février 2016 par Édouard Fritch, " +
      "après sa rupture avec le Tahoeraa Huiraatira de Gaston Flosse. Le Tapura Huiraatira " +
      "(« Porter le peuple ») prône le maintien du lien avec la France dans le cadre de " +
      "l'autonomie renforcée. Dominant entre 2016 et 2023, il passe dans l'opposition après " +
      "la victoire du Tavini aux élections d'avril 2023.",
    dateCreation: new Date('2016-02-20'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tapura_huiraatira',
    wikidataId: 'Q23691290',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3513932 (parti politique polynésien, alias Tahoeraa Huiraatira)
    //           + Wikipédia FR "Tahoeraa huiraatira"
    // NB : renommé "Amuitahiraa o te nuna'a Maohi" en 2022 (Q3513932 = identité Wikidata stable).
    nom: "Tahoeraa Huiraatira",
    sigle: null,
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Parti politique polynésien fondé en 1977 par Gaston Flosse, historiquement allié au RPR " +
      "puis à l'UMP français. Dominant la politique polynésienne de 1991 à 2013, il est " +
      "affaibli par le départ d'Édouard Fritch (2016) et rebaptisé « Amuitahiraa o te nuna'a " +
      "Maohi » en 2022. Gaston Flosse en reste la figure fondatrice et symbolique.",
    dateCreation: new Date('1977-09-25'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tahoer%C4%81%CA%BB%C4%81_huiraatira',
    wikidataId: 'Q3513932',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q115518506 (political party in French Polynesia)
    //           + France Info (création 2022, frondeurs du Tapura autour de Nicole Sanquer)
    // NB : Nicole Sanquer (fondatrice probable) a été exclue faute de Q-id vérifié (cf. header).
    nom: 'A Tia Porinetia',
    sigle: 'ATP',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: null,
    description:
      "Parti politique polynésien centriste créé en 2022 par des dissidents du Tapura Huiraatira, " +
      "dont Nicole Sanquer. A Tia Porinetia (« Pave the way for Polynesia ») occupe un espace " +
      "entre l'autonomisme du Tapura et l'indépendantisme du Tavini. Il remporte quelques sièges " +
      "aux élections territoriales d'avril 2023.",
    dateCreation: new Date('2022-01-01'),
    wikipediaUrl: null,
    wikidataId: 'Q115518506',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3208485 + Wikipédia FR "La Dépêche de Tahiti"
    nom: 'La Dépêche de Tahiti',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.ladepeche.pf/',
    description:
      "Quotidien régional de Polynésie française fondé en 1964, principal journal papier " +
      "de la collectivité. Couvre l'actualité politique, économique et sociale polynésienne. " +
      "Source de référence pour le suivi des élections territoriales et des affaires judiciaires.",
    dateCreation: new Date('1964-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/La_D%C3%A9p%C3%AAche_de_Tahiti',
    wikidataId: 'Q3208485',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q109314702 + site officiel tahiti-infos.com
    nom: 'Tahiti Infos',
    sigle: null,
    typeOrganisation: 'MEDIA',
    pays: 'France',
    siteWeb: 'https://www.tahiti-infos.com/',
    description:
      "Site d'information en ligne polynésien, parmi les plus consultés de la collectivité. " +
      "Couvre l'actualité de Polynésie française en continu : politique, culture, sport, " +
      "économie. Média numérique de référence pour les événements électoraux.",
    dateCreation: null,
    wikipediaUrl: null,
    wikidataId: 'Q109314702',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_pf: {
    url: 'https://fr.wikipedia.org/wiki/Polyn%C3%A9sie_fran%C3%A7aise',
    titre: 'Polynésie française — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Statut COM, loi organique 27 fév. 2004, gouvernement autonome. Superficie 4 000 km², " +
      "280 000 habitants. Capitale Papeete. Archipels : Société, Tuamotu, Gambier, Marquises.",
    verifiee: true,
  },
  wp_assemblee: {
    url: 'https://fr.wikipedia.org/wiki/Assembl%C3%A9e_de_la_Polyn%C3%A9sie_fran%C3%A7aise',
    titre: "Assemblée de la Polynésie française — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "57 représentants, scrutin de liste proportionnel, mandat 5 ans. Élit le Président. " +
      "Antony Géros (Tavini) élu Président le 11 mai 2023.",
    verifiee: true,
  },
  wp_brotherson: {
    url: 'https://fr.wikipedia.org/wiki/Moetai_Brotherson',
    titre: 'Moetai Brotherson — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né le 22/10/1969 à Papeete. Député (2017-2023). Élu Président de la Polynésie française " +
      "le 12 mai 2023, premier président indépendantiste. Tavini Huiraatira.",
    verifiee: true,
  },
  wp_geros: {
    url: 'https://fr.wikipedia.org/wiki/Antony_G%C3%A9ros',
    titre: 'Antony Géros — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né le 22/07/1956 à Nanterre. Président de l'Assemblée de la Polynésie française depuis " +
      "le 11 mai 2023. Tavini Huiraatira.",
    verifiee: true,
  },
  wp_temaru: {
    url: 'https://fr.wikipedia.org/wiki/Oscar_Temaru',
    titre: 'Oscar Temaru — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né le 01/11/1944 à Faʻaʻā. Fondateur Tavini Huiraatira (1977). Président de la PF " +
      "à plusieurs reprises (2004-2013). Président Assemblée (2014-2020). Maire de Faʻaʻā.",
    verifiee: true,
  },
  wp_fritch: {
    url: 'https://fr.wikipedia.org/wiki/%C3%89douard_Fritch',
    titre: 'Édouard Fritch — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né le 04/01/1952 à Papeete. Gendre de Flosse. Fondateur Tapura (20/02/2016). " +
      "Président de la PF du 28/03/2014 au 12/05/2023.",
    verifiee: true,
  },
  wp_flosse: {
    url: 'https://fr.wikipedia.org/wiki/Gaston_Flosse',
    titre: 'Gaston Flosse — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Né le 24/06/1931 à Arue. Fondateur Tahoeraa (1977). Président PF 1984-2014 (plusieurs " +
      "mandats). Condamnations définitives : emplois fictifs (Ccass 2014), citerne (Ccass 2022).",
    verifiee: true,
  },
  wp_tavini: {
    url: 'https://fr.wikipedia.org/wiki/Tavini_huiraatira',
    titre: 'Tavini huiraatira — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Parti indépendantiste polynésien fondé en 1977 par Temaru. Vainqueur élections " +
      "territoriales avril 2023 (majoritaire à l'Assemblée). Gouverne depuis mai 2023.",
    verifiee: true,
  },
  wp_tapura: {
    url: 'https://fr.wikipedia.org/wiki/Tapura_huiraatira',
    titre: 'Tapura huiraatira — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Parti autonomiste fondé le 20/02/2016 par Édouard Fritch (dissidence du Tahoeraa). " +
      "Dominant 2016-2023, passe dans l'opposition en mai 2023.",
    verifiee: true,
  },
  wp_tahoeraa: {
    url: 'https://fr.wikipedia.org/wiki/Tahoer%C4%81%CA%BB%C4%81_huiraatira',
    titre: "Tahoeraa huiraatira — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Parti fondé 25/09/1977 par Flosse, allié RPR/UMP. Dominant 1991-2013. Rebaptisé " +
      "Amuitahiraa en 2022. Affaibli après départ de Fritch (Tapura, 2016).",
    verifiee: true,
  },
  wd_atia_porinetia: {
    url: 'https://www.wikidata.org/wiki/Q115518506',
    titre: 'A Tia Porinetia — Wikidata Q115518506',
    media: 'Wikidata',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2022-01-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Parti politique de Polynésie française, Q115518506. Fondé en 2022 par dissidents " +
      "du Tapura. Positionnement centriste entre autonomisme et indépendantisme.",
    verifiee: false,
  },
  wp_depeche: {
    url: 'https://fr.wikipedia.org/wiki/La_D%C3%A9p%C3%AAche_de_Tahiti',
    titre: 'La Dépêche de Tahiti — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Quotidien régional de Polynésie française, fondé en 1964. Principal journal papier " +
      "de la collectivité. Référence pour la vie politique et judiciaire polynésienne.",
    verifiee: true,
  },
  wd_tahiti_infos: {
    url: 'https://www.wikidata.org/wiki/Q109314702',
    titre: 'Tahiti Infos — Wikidata Q109314702',
    media: 'Wikidata',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: null,
    dateConsultation: new Date('2026-07-02'),
    auteur: null,
    description:
      "Site d'information en ligne polynésien, Q109314702. Parmi les sites d'actualité " +
      "les plus consultés de Polynésie française.",
    verifiee: false,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002).
// Chaque entité référencée possède un wikidataId (résolution via trouverEntite).
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Brotherson (Président de la Polynésie française depuis 2023) ---
  {
    // P-O : Brotherson élu Président de la Polynésie française
    aType: 'personne',
    aRef: 'Q30350575',
    bType: 'organisation',
    bRef: 'Q30971',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Moetai Brotherson élu Président de la Polynésie française le 12 mai 2023 par " +
      "l'Assemblée de la Polynésie française, après la victoire du Tavini aux élections " +
      "territoriales d'avril 2023.",
    dateDebut: new Date('2023-05-12'),
    dateFin: null,
    sourceRef: 'wp_brotherson',
  },
  {
    // P-O : Brotherson affilié au Tavini Huiraatira
    aType: 'personne',
    aRef: 'Q30350575',
    bType: 'organisation',
    bRef: 'Q2746044',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Moetai Brotherson est membre du Tavini Huiraatira, le parti indépendantiste fondé " +
      "par Oscar Temaru en 1977, dont il est la tête de liste depuis 2022.",
    dateDebut: new Date('2017-01-01'),
    dateFin: null,
    sourceRef: 'wp_brotherson',
  },

  // --- Géros (Président de l'Assemblée depuis 2023) ---
  {
    // P-O : Géros élu Président de l'Assemblée de la Polynésie française
    aType: 'personne',
    aRef: 'Q2857540',
    bType: 'organisation',
    bRef: 'Q2729213',
    typeLienCode: 'MANDAT_ELECTIF',
    description:
      "Antony Géros (Tavini Huiraatira) élu Président de l'Assemblée de la Polynésie " +
      "française le 11 mai 2023, lors de la session inaugurale de l'assemblée issue des " +
      "élections territoriales d'avril 2023.",
    dateDebut: new Date('2023-05-11'),
    dateFin: null,
    sourceRef: 'wp_assemblee',
  },
  {
    // P-O : Géros affilié au Tavini Huiraatira
    aType: 'personne',
    aRef: 'Q2857540',
    bType: 'organisation',
    bRef: 'Q2746044',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Antony Géros est membre du Tavini Huiraatira d'Oscar Temaru. Il siège à l'Assemblée " +
      "de la Polynésie française sous étiquette Tavini.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'wp_geros',
  },

  // --- Temaru (fondateur Tavini, ex-Président PF, ex-Président Assemblée) ---
  {
    // P-O : Temaru fondateur du Tavini Huiraatira
    aType: 'personne',
    aRef: 'Q936654',
    bType: 'organisation',
    bRef: 'Q2746044',
    typeLienCode: 'FONDATEUR',
    description:
      "Oscar Temaru a fondé le Tavini Huiraatira en 1977 à Faʻaʻā, parti emblématique du " +
      "mouvement indépendantiste polynésien, dont il demeure le leader historique et symbolique.",
    dateDebut: new Date('1977-01-01'),
    dateFin: null,
    sourceRef: 'wp_tavini',
  },
  {
    // P-O : Temaru ex-Président de la Polynésie française (mandats 2004-2013)
    aType: 'personne',
    aRef: 'Q936654',
    bType: 'organisation',
    bRef: 'Q30971',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Oscar Temaru a été Président de la Polynésie française à plusieurs reprises entre 2004 " +
      "et 2013 (mandats discontinus : 2004, 2005, 2006-2008, 2011-2013), alternant avec Gaston " +
      "Flosse dans un contexte de majorités parlementaires fragiles.",
    dateDebut: new Date('2004-06-15'),
    dateFin: new Date('2013-05-17'),
    sourceRef: 'wp_temaru',
  },
  {
    // P-O : Temaru ex-Président de l'Assemblée de la Polynésie française (2014-2020)
    aType: 'personne',
    aRef: 'Q936654',
    bType: 'organisation',
    bRef: 'Q2729213',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Oscar Temaru a présidé l'Assemblée de la Polynésie française du 23 mars 2014 au " +
      "17 mai 2020, après la période d'alternance avec Fritch à l'exécutif.",
    dateDebut: new Date('2014-03-23'),
    dateFin: new Date('2020-05-17'),
    sourceRef: 'wp_temaru',
  },

  // --- Fritch (fondateur Tapura, ex-Président PF 2014-2023) ---
  {
    // P-O : Fritch fondateur du Tapura Huiraatira
    aType: 'personne',
    aRef: 'Q1106890',
    bType: 'organisation',
    bRef: 'Q23691290',
    typeLienCode: 'FONDATEUR',
    description:
      "Édouard Fritch fonde le Tapura Huiraatira le 20 février 2016, après avoir rompu avec " +
      "son beau-père Gaston Flosse et le Tahoeraa Huiraatira. Le Tapura devient le parti " +
      "autonomiste dominant jusqu'en 2023.",
    dateDebut: new Date('2016-02-20'),
    dateFin: null,
    sourceRef: 'wp_tapura',
  },
  {
    // P-O : Fritch ex-Président de la Polynésie française (2014-2023)
    aType: 'personne',
    aRef: 'Q1106890',
    bType: 'organisation',
    bRef: 'Q30971',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Édouard Fritch a été Président de la Polynésie française du 28 mars 2014 au 12 mai 2023 " +
      "(9 ans de présidence continue), d'abord sous étiquette Tahoeraa puis Tapura Huiraatira.",
    dateDebut: new Date('2014-03-28'),
    dateFin: new Date('2023-05-12'),
    sourceRef: 'wp_fritch',
  },
  {
    // P-O : Fritch anciennement affilié au Tahoeraa (avant 2016)
    aType: 'personne',
    aRef: 'Q1106890',
    bType: 'organisation',
    bRef: 'Q3513932',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Édouard Fritch, gendre de Gaston Flosse, a été membre du Tahoeraa Huiraatira avant " +
      "de le quitter en janvier 2016 pour fonder le Tapura Huiraatira le 20 février 2016.",
    dateDebut: new Date('1991-01-01'),
    dateFin: new Date('2016-01-31'),
    sourceRef: 'wp_fritch',
  },

  // --- Flosse (fondateur Tahoeraa, ex-Président PF, condamnations définitives) ---
  {
    // P-O : Flosse fondateur du Tahoeraa Huiraatira
    aType: 'personne',
    aRef: 'Q2747180',
    bType: 'organisation',
    bRef: 'Q3513932',
    typeLienCode: 'FONDATEUR',
    description:
      "Gaston Flosse a fondé le Tahoeraa Huiraatira le 25 septembre 1977, parti qui dominera " +
      "la politique polynésienne pendant près de quatre décennies, allié du RPR/UMP métropolitain.",
    dateDebut: new Date('1977-09-25'),
    dateFin: null,
    sourceRef: 'wp_tahoeraa',
  },
  {
    // P-O : Flosse ex-Président de la Polynésie française (mandats multiples, 1984-2014)
    aType: 'personne',
    aRef: 'Q2747180',
    bType: 'organisation',
    bRef: 'Q30971',
    typeLienCode: 'ANCIEN_MANDAT',
    description:
      "Gaston Flosse a été Président de la Polynésie française à plusieurs reprises : " +
      "1984-1987, 1991-2004 (son mandat le plus long), 2008 (bref), 2013-2014. " +
      "Il a dominé la politique polynésienne pendant une vingtaine d'années.",
    dateDebut: new Date('1984-01-01'),
    dateFin: new Date('2014-09-12'),
    sourceRef: 'wp_flosse',
  },
  {
    // P-O : Flosse — condamnations pénales définitives (Cour de cassation)
    // STATUT JUDICIAIRE : DÉFINITIF — Cour de cassation (juridiction suprême), pas allégation.
    aType: 'personne',
    aRef: 'Q2747180',
    bType: 'organisation',
    bRef: 'Q30971',
    typeLienCode: 'juridique',
    description:
      "[CONDAMNATION DÉFINITIVE — Cour de cassation] " +
      "1. Emplois fictifs (Cass. 2014) : fonctionnaires territoriaux polynésiens payés sur " +
      "fonds publics pour travailler au bénéfice du Tahoeraa Huiraatira. Peine : 4 ans " +
      "d'emprisonnement avec sursis, 125 000 € amende, 3 ans privation droits civiques. " +
      "2. Affaire de la citerne d'eau (Cass. 2022) : abus de biens publics dans la commune " +
      "de Pirae. Peine : 2 ans sursis, ~83 000 € amende, 5 ans inéligibilité.",
    dateDebut: new Date('2014-01-01'),
    dateFin: null,
    sourceRef: 'wp_flosse',
  },

  // --- Liens partis / institutions ---
  {
    // O-O : Tavini au pouvoir en Polynésie française depuis mai 2023
    aType: 'organisation',
    aRef: 'Q2746044',
    bType: 'organisation',
    bRef: 'Q30971',
    typeLienCode: 'politique',
    description:
      "Le Tavini Huiraatira dirige la Polynésie française depuis le 12 mai 2023 après sa " +
      "victoire aux élections territoriales d'avril 2023, avec Brotherson à la présidence " +
      "et Géros à la tête de l'Assemblée.",
    dateDebut: new Date('2023-05-12'),
    dateFin: null,
    sourceRef: 'wp_brotherson',
  },
  {
    // O-O : Tapura dans l'opposition face à la Polynésie française depuis 2023
    aType: 'organisation',
    aRef: 'Q23691290',
    bType: 'organisation',
    bRef: 'Q30971',
    typeLienCode: 'politique',
    description:
      "Le Tapura Huiraatira d'Édouard Fritch est passé dans l'opposition en mai 2023, " +
      "après neuf ans de gouvernance de la Polynésie française (2014-2023).",
    dateDebut: new Date('2023-05-12'),
    dateFin: null,
    sourceRef: 'wp_tapura',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (copie conforme de seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-polynesie] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-polynesie] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données Polynésie française précédentes...')
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
  console.log('\n--- seed-region-polynesie — Polynésie française + élus + partis ---\n')
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
  console.log(
    `Personnes     : ${PERSONNES.length} (Brotherson, Géros, Temaru, Fritch, Flosse)`,
  )
  console.log(
    `Organisations : ${ORGANISATIONS.length} ` +
    "(PF, Assemblée, Tavini, Tapura, Tahoeraa, A Tia Porinetia, La Dépêche, Tahiti Infos)",
  )
  console.log(
    `Sources       : ${Object.keys(SOURCES).length} (Wikidata, Wikipédia FR — dateConsultation 2026-07-02)`,
  )
  console.log(
    `Liens         : ${LIENS.length} ` +
    "(MANDAT_ELECTIF ×2, AFFILIATION_PARTI ×3, FONDATEUR ×3, ANCIEN_MANDAT ×4, juridique ×1, politique ×2)",
  )
  console.log('')
}

main()
  .catch((err) => {
    console.error('[seed-polynesie] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
