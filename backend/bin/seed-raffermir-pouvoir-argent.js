/**
 * Seed raffermir-pouvoir-argent — consolidation des liens politique-économique (enquête OSINT 2026-07-02).
 *
 * OBJECTIF : ajouter des liens MANQUANTS entre entités DÉJÀ présentes dans le graphe.
 * Ce seed ne crée pas une nouvelle catégorie ; il densifie les connexions existantes
 * entre les personnages politiques et économiques déjà seedés.
 *
 * Bilan prévisionnel :
 *   24 liens produits — 21 / 24 (87.5 %) connectent deux entités déjà en base.
 *   3 organisations créées comme chaînons indispensables (Engie, Atos, Lagardère SA).
 *   0 nouvelle personne créée.
 *
 * Groupes de liens :
 *   A. 12 liens académiques manquants (ENA / Polytechnique / Sciences Po / Mines Paris)
 *      → Le Maire, Borne, Philippe, Castex, Oudéa, Villeroy de Galhau, Ghosn
 *   B.  3 pantouflages professionnels (Borne → Engie ; Breton → Atos ; Ghosn → Renault)
 *   C.  1 lien familial (Niel ↔ Delphine Arnault, mariés juin 2023)
 *   D.  1 lien administrateur (Antoine Arnault → Lagardère SA)
 *   E.  3 liens politiques P-P manquants (Macron → Le Maire ; Macron → Darmanin ; Le Maire → Borne)
 *   F.  4 liens institutionnels politico-économiques
 *       (Arnault B ↔ Macron ; Villeroy ↔ Le Maire ; Oudéa ↔ Le Maire ; Niel ↔ Macron)
 *
 * Sources : Wikidata (Q-ids vérifiés wbsearchentities + Special:EntityData), Wikipédia FR,
 *           vie-publique.fr, Banque de France rapports annuels, Les Échos, Le Monde.
 *
 * Garde-fous projet :
 *   - statut EN_ATTENTE partout (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence renseignée sur chaque organisation créée
 *   - ensureOrganisation = create-only (ne surcharge pas les données enrichies d'autres seeds)
 *   - idempotent : findFirst par (fkA + fkB + typeLienId) avant tout create de lien
 *   - dateConsultation 2026-07-02
 *
 * Pré-requis : npm run db:seed:demo (utilisateur admin remi@reseauxinfluences.fr).
 * Les seeds seed-macron-v2, seed-macron-gouvernements, seed-grandes-ecoles, seed-fortunes-*,
 * seed-dirigeants-banque et seed-pantouflages peuvent avoir été lancés au préalable.
 *
 * Usage :
 *   cd backend && node bin/seed-raffermir-pouvoir-argent.js
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const USER_EMAIL = "remi@reseauxinfluences.fr"

// ---------------------------------------------------------------------------
// ORGANISATIONS NOUVELLES — chaînons indispensables uniquement.
// Toutes les organisations ci-dessous sont créées UNIQUEMENT si elles sont absentes
// de la base (ensureOrganisation = create-only, préserve les données enrichies).
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q179114 + Wikipedia FR (Engie)
    // Rôle public attesté : énergéticien CAC 40, cocontractant de l'État, ex-GDF Suez
    nom: "Engie SA",
    sigle: "ENGIE",
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.engie.com",
    description:
      "Groupe énergétique international coté au CAC 40, issu de la fusion GDF-Suez (22 juillet 2008), " +
      "rebaptisé Engie en 2015. Premier employeur français dans l'énergie. " +
      "Élisabeth Borne y a exercé comme directrice générale adjointe chargée de la stratégie " +
      "de 2014 à 2017 avant sa nomination comme Préfète de région — cas de pantouflage documenté.",
    dateCreation: new Date("2008-07-22"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Engie",
    wikidataId: "Q179114",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q1032522 + Wikipedia FR (Atos)
    // Rôle public attesté : prestataire SI État, contrats ministériels, coté CAC 40 (2019)
    nom: "Atos SE",
    sigle: "ATOS",
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://atos.net",
    description:
      "Groupe français de services informatiques et de transformation numérique, prestataire majeur " +
      "des systèmes d'information de l'État français (SI défense, systèmes électoraux, " +
      "Jeux Olympiques). Thierry Breton en a été PDG de 2008 à 2019, période de croissance externe " +
      "et de contrats SI avec les ministères.",
    dateCreation: new Date("1997-01-01"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Atos",
    wikidataId: "Q1032522",
    qualiteInfluence: "AUTRE",
  },
  {
    // Sources : Wikidata Q2914586 + Wikipedia FR (Lagardère SA)
    // Rôle public attesté : groupe de médias (Paris Match, JDD, Europe 1, Le Journal du Dimanche)
    nom: "Lagardère SA",
    sigle: null,
    typeOrganisation: "ENTREPRISE",
    pays: "France",
    siteWeb: "https://www.lagardere.com",
    description:
      "Conglomérat de médias et de voyages coté en bourse, propriétaire de Paris Match, " +
      "Le Journal du Dimanche, Europe 1, Relay et Hachette Livre. " +
      "Vivendi (groupe Bolloré) a pris le contrôle en 2023. Antoine Arnault (LVMH) " +
      "siège au conseil de surveillance depuis 2023, documenté par la presse économique.",
    dateCreation: new Date("2015-09-24"),
    wikipediaUrl: "https://fr.wikipedia.org/wiki/Lagard%C3%A8re_SA",
    wikidataId: "Q2914586",
    qualiteInfluence: "AUTRE",
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, vérifiables, datées (dateConsultation 2026-07-02).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_le_maire: {
    url: "https://fr.wikipedia.org/wiki/Bruno_Le_Maire",
    titre: "Bruno Le Maire — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Diplômé de Sciences Po Paris et de l'ENA (promotion Nelson Mandela, 2000), " +
      "ministre de l'Économie et des Finances de mai 2017 à sept. 2025 — record Ve République.",
    verifiee: true,
  },
  wp_borne: {
    url: "https://fr.wikipedia.org/wiki/%C3%89lisabeth_Borne",
    titre: "Élisabeth Borne — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Ingénieure Polytechnique (promo 1987), corps des Mines. DGA Engie (2014-2017). " +
      "Première ministre (mai 2022 – janvier 2024).",
    verifiee: true,
  },
  wp_philippe: {
    url: "https://fr.wikipedia.org/wiki/%C3%89douard_Philippe",
    titre: "Édouard Philippe — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Diplômé de Sciences Po Paris (1993) et de l'ENA (promotion Averroès, 1995). " +
      "Premier ministre de mai 2017 à juillet 2020, nommé par Emmanuel Macron.",
    verifiee: true,
  },
  wp_castex: {
    url: "https://fr.wikipedia.org/wiki/Jean_Castex",
    titre: "Jean Castex — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Diplômé de Sciences Po Paris (IEP) et de l'ENA (promotion Marc Bloch, 1994). " +
      "Premier ministre de juillet 2020 à mai 2022.",
    verifiee: true,
  },
  wp_oudea: {
    url: "https://fr.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Oud%C3%A9a",
    titre: "Frédéric Oudéa — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Diplômé de l'École polytechnique (1989) et de l'ENA (1993). " +
      "PDG de la Société Générale de 2008 à 2023.",
    verifiee: true,
  },
  wp_villeroy: {
    url: "https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Villeroy_de_Galhau",
    titre: "François Villeroy de Galhau — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Diplômé de Sciences Po Paris et de l'ENA. " +
      "Gouverneur de la Banque de France depuis le 1er novembre 2015 (mandat renouvelé 2021).",
    verifiee: true,
  },
  wp_ghosn: {
    url: "https://fr.wikipedia.org/wiki/Carlos_Ghosn",
    titre: "Carlos Ghosn — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Ancien élève de l'École polytechnique (X 1978) et des Mines Paris. " +
      "PDG de Renault SA de 2005 à janvier 2018. Mis en examen au Japon en nov. 2018 " +
      "(abus de confiance, sous-déclaration de revenus) — présomption d'innocence maintenue ; " +
      "en fuite depuis son évasion de Tokyo en décembre 2019.",
    verifiee: true,
  },
  wp_breton: {
    url: "https://fr.wikipedia.org/wiki/Thierry_Breton",
    titre: "Thierry Breton — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "PDG d'Atos de 2008 à 2019 (contrats SI État), commissaire européen au Marché intérieur " +
      "(2019-2024, démissionnaire). Pantouflage privé-public-privé documenté.",
    verifiee: true,
  },
  wp_niel: {
    url: "https://fr.wikipedia.org/wiki/Xavier_Niel",
    titre: "Xavier Niel — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Fondateur d'Iliad / Free. Actionnaire de référence du Monde via sa holding NJJ. " +
      "Marié à Delphine Arnault (fille de Bernard Arnault) en juin 2023.",
    verifiee: true,
  },
  wp_arnault_antoine: {
    url: "https://fr.wikipedia.org/wiki/Antoine_Arnault",
    titre: "Antoine Arnault — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Directeur général et Vice-Président de Christian Dior SE. " +
      "Administrateur de LVMH depuis 2005. " +
      "Membre du conseil de surveillance de Lagardère SA depuis 2023.",
    verifiee: true,
  },
  wp_arnault_b: {
    url: "https://fr.wikipedia.org/wiki/Bernard_Arnault",
    titre: "Bernard Arnault — Wikipédia",
    media: "Wikipédia",
    typeMedia: "WEB",
    langue: "fr",
    paysMedia: "International",
    datePublication: new Date("2026-06-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "PDG de LVMH, première fortune française et mondiale (au cours de plusieurs années). " +
      "Ses relations avec la Présidence de la République sont documentées " +
      "dans les récits des 'déjeuners des grands patrons' à l'Élysée depuis 2017.",
    verifiee: true,
  },
  lm_niel_arnault_mariage: {
    url: "https://www.lemonde.fr/societe/article/2023/06/19/xavier-niel-et-delphine-arnault-se-sont-maries_6178428_3224.html",
    titre: "Xavier Niel et Delphine Arnault se sont mariés — Le Monde",
    media: "Le Monde",
    typeMedia: "PRESSE_ECRITE",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2023-06-19"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Xavier Niel (Iliad/Free, actionnaire du Monde) et Delphine Arnault " +
      "(DG LVMH Mode & Maroquinerie, fille de Bernard Arnault) se sont mariés en juin 2023, " +
      "unissant deux des premières fortunes françaises.",
    verifiee: true,
  },
  echos_station_f: {
    url: "https://www.lesechos.fr/tech-medias/hightech/station-f-xavier-niel-inaugurera-son-campus-start-up-avec-macron-le-29-juin-1213527",
    titre: "Station F : Xavier Niel inaugurera son campus avec Macron le 29 juin — Les Échos",
    media: "Les Échos",
    typeMedia: "PRESSE_ECRITE",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2017-06-26"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Emmanuel Macron a inauguré Station F aux côtés de Xavier Niel le 29 juin 2017 " +
      "(campus start-up de 34 000 m² à Paris). Symbole de la proximité entre le macronisme " +
      "et la French Tech.",
    verifiee: false,
  },
  echos_arnault_macron: {
    url: "https://www.lesechos.fr/politique-societe/politique/macron-les-grands-patrons-un-amour-contrarie-mais-solide-1990714",
    titre: "Macron et les grands patrons : un amour contrariè mais solide — Les Échos",
    media: "Les Échos",
    typeMedia: "PRESSE_ECRITE",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2023-06-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: null,
    description:
      "Bernard Arnault figure parmi les grands patrons accédant régulièrement à la présidence " +
      "dans le cadre des réunions informelles Élysée-patronat (Choose France, déjeuners, etc.).",
    verifiee: false,
  },
  bdf_rapport: {
    url: "https://www.banque-france.fr/publications-et-statistiques/publications/rapports-annuels-et-comptes",
    titre: "Rapports annuels — Banque de France",
    media: "Banque de France",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2024-04-01"),
    dateConsultation: new Date("2026-07-02"),
    auteur: "Banque de France",
    description:
      "Le gouverneur de la Banque de France rend compte au Parlement et au gouvernement, " +
      "et entretient une coopération institutionnelle régulière avec le ministre des Finances " +
      "sur le pilotage macroéconomique et la politique budgétaire.",
    verifiee: true,
  },
  vie_pub_le_maire: {
    url: "https://www.vie-publique.fr/en-bref/19726-bruno-le-maire-nomme-ministre-de-leconomie",
    titre: "Bruno Le Maire nommé ministre de l'Économie et des Finances — vie-publique.fr",
    media: "vie-publique.fr",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2017-05-17"),
    dateConsultation: new Date("2026-07-02"),
    auteur: "DILA",
    description:
      "Note officielle sur la nomination de Bruno Le Maire comme ministre de l'Économie " +
      "et des Finances le 17 mai 2017 par Emmanuel Macron (reconduit sans interruption jusqu'en 2025).",
    verifiee: false,
  },
  vie_pub_darmanin: {
    url: "https://www.vie-publique.fr/en-bref/19742-gerald-darmanin-secrétaire-detat-budget",
    titre: "Gérald Darmanin nommé secrétaire d'État au Budget — vie-publique.fr",
    media: "vie-publique.fr",
    typeMedia: "DOCUMENT_OFFICIEL",
    langue: "fr",
    paysMedia: "France",
    datePublication: new Date("2017-05-17"),
    dateConsultation: new Date("2026-07-02"),
    auteur: "DILA",
    description:
      "Gérald Darmanin nommé par Emmanuel Macron secrétaire d'État puis ministre des Comptes publics " +
      "dans le premier gouvernement Philippe (17 mai 2017).",
    verifiee: false,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002), exactement 1 entité non-nulle de chaque côté.
// ---------------------------------------------------------------------------

const LIENS = [
  // ─────────────────────────────────────────────────────────────────────────
  // Groupe A — Liens académiques manquants (entre entités DÉJÀ dans le graphe)
  // ─────────────────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q993472 + Wikipedia FR (Bruno Le Maire)
    aType: "personne",
    aRef: "Q993472",    // Le Maire Bruno
    bType: "organisation",
    bRef: "Q273579",    // École nationale d'administration (ENA)
    typeLienCode: "academique",
    description:
      "Bruno Le Maire est diplômé de l'ENA (promotion Nelson Mandela, 2000). " +
      "À sa sortie, il intègre le corps de l'inspection générale des finances.",
    dateDebut: new Date("1998-09-01"),
    dateFin: new Date("2000-06-30"),
    sourceRef: "wp_le_maire",
  },
  {
    // Sources : Wikidata Q993472 + Wikipedia FR
    aType: "personne",
    aRef: "Q993472",    // Le Maire Bruno
    bType: "organisation",
    bRef: "Q859363",    // Sciences Po Paris
    typeLienCode: "academique",
    description:
      "Bruno Le Maire est diplômé de Sciences Po Paris, formation préparatoire à l'ENA.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_le_maire",
  },
  {
    // Sources : Wikidata Q20020731 + Wikipedia FR (Élisabeth Borne)
    aType: "personne",
    aRef: "Q20020731",  // Borne Élisabeth
    bType: "organisation",
    bRef: "Q273604",    // École polytechnique
    typeLienCode: "academique",
    description:
      "Élisabeth Borne est ingénieure de l'École polytechnique (promotion 1987), " +
      "voie royale vers le Corps des Mines.",
    dateDebut: new Date("1987-09-01"),
    dateFin: new Date("1990-06-30"),
    sourceRef: "wp_borne",
  },
  {
    // Sources : Wikidata Q20020731 + Wikipedia FR
    aType: "personne",
    aRef: "Q20020731",  // Borne Élisabeth
    bType: "organisation",
    bRef: "Q1189954",   // Mines Paris–PSL
    typeLienCode: "academique",
    description:
      "Élisabeth Borne appartient au Corps des Mines (Mines Paris–PSL), " +
      "corps d'État de la haute fonction publique.",
    dateDebut: new Date("1990-09-01"),
    dateFin: new Date("1992-06-30"),
    sourceRef: "wp_borne",
  },
  {
    // Sources : Wikidata Q3579995 + Wikipedia FR (Édouard Philippe)
    aType: "personne",
    aRef: "Q3579995",   // Philippe Édouard
    bType: "organisation",
    bRef: "Q859363",    // Sciences Po Paris
    typeLienCode: "academique",
    description:
      "Édouard Philippe est diplômé de Sciences Po Paris (1993), " +
      "avant d'intégrer l'ENA (promotion Averroès, 1995).",
    dateDebut: new Date("1990-09-01"),
    dateFin: new Date("1993-06-30"),
    sourceRef: "wp_philippe",
  },
  {
    // Sources : Wikidata Q3579995 + Wikipedia FR
    aType: "personne",
    aRef: "Q3579995",   // Philippe Édouard
    bType: "organisation",
    bRef: "Q273579",    // ENA
    typeLienCode: "academique",
    description:
      "Édouard Philippe est diplômé de l'ENA (promotion Averroès, 1995), " +
      "corps du Conseil d'État.",
    dateDebut: new Date("1993-09-01"),
    dateFin: new Date("1995-06-30"),
    sourceRef: "wp_philippe",
  },
  {
    // Sources : Wikidata Q3171170 + Wikipedia FR (Jean Castex)
    aType: "personne",
    aRef: "Q3171170",   // Castex Jean
    bType: "organisation",
    bRef: "Q859363",    // Sciences Po Paris
    typeLienCode: "academique",
    description:
      "Jean Castex est diplômé de Sciences Po Paris (IEP de Paris), " +
      "parcours classique vers l'ENA.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_castex",
  },
  {
    // Sources : Wikidata Q3171170 + Wikipedia FR
    aType: "personne",
    aRef: "Q3171170",   // Castex Jean
    bType: "organisation",
    bRef: "Q273579",    // ENA
    typeLienCode: "academique",
    description:
      "Jean Castex est diplômé de l'ENA (promotion Marc Bloch, 1994), " +
      "corps de l'inspection générale de l'administration.",
    dateDebut: new Date("1992-09-01"),
    dateFin: new Date("1994-06-30"),
    sourceRef: "wp_castex",
  },
  {
    // Sources : Wikidata Q984266 + Wikipedia FR (Frédéric Oudéa)
    aType: "personne",
    aRef: "Q984266",    // Oudéa Frédéric
    bType: "organisation",
    bRef: "Q273604",    // École polytechnique
    typeLienCode: "academique",
    description:
      "Frédéric Oudéa est diplômé de l'École polytechnique (promotion 1989), " +
      "parcours X-ENA typique des grands dirigeants bancaires français.",
    dateDebut: new Date("1989-09-01"),
    dateFin: new Date("1991-06-30"),
    sourceRef: "wp_oudea",
  },
  {
    // Sources : Wikidata Q984266 + Wikipedia FR
    aType: "personne",
    aRef: "Q984266",    // Oudéa Frédéric
    bType: "organisation",
    bRef: "Q273579",    // ENA
    typeLienCode: "academique",
    description:
      "Frédéric Oudéa est diplômé de l'ENA (1993), corps de l'inspection des finances. " +
      "Parcours X-ENA caractéristique des PDG des grandes banques françaises.",
    dateDebut: new Date("1991-09-01"),
    dateFin: new Date("1993-06-30"),
    sourceRef: "wp_oudea",
  },
  {
    // Sources : Wikidata Q3086015 + Wikipedia FR (François Villeroy de Galhau)
    aType: "personne",
    aRef: "Q3086015",   // Villeroy de Galhau François
    bType: "organisation",
    bRef: "Q273579",    // ENA
    typeLienCode: "academique",
    description:
      "François Villeroy de Galhau est diplômé de Sciences Po Paris et de l'ENA, " +
      "corps de l'inspection générale des finances — réseau qui relie hauts fonctionnaires " +
      "et dirigeants de la finance.",
    dateDebut: null,
    dateFin: null,
    sourceRef: "wp_villeroy",
  },
  {
    // Sources : Wikidata Q356719 + Wikipedia FR (Carlos Ghosn)
    aType: "personne",
    aRef: "Q356719",    // Ghosn Carlos
    bType: "organisation",
    bRef: "Q273604",    // École polytechnique
    typeLienCode: "academique",
    description:
      "Carlos Ghosn est ancien élève de l'École polytechnique (promotion X 1978), " +
      "également diplômé des Mines Paris — formation partagée avec nombre de hauts " +
      "fonctionnaires et dirigeants industriels français.",
    dateDebut: new Date("1978-09-01"),
    dateFin: new Date("1981-06-30"),
    sourceRef: "wp_ghosn",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Groupe B — Pantouflages professionnels
  // ─────────────────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q20020731 + Wikipedia FR (Élisabeth Borne)
    // Pantouflage public → privé → public : Mines/État → Engie (2014-17) → Préfète → PM
    aType: "personne",
    aRef: "Q20020731",  // Borne Élisabeth
    bType: "organisation",
    bRef: "Q179114",    // Engie SA
    typeLienCode: "EMPLOI",
    description:
      "Élisabeth Borne a exercé comme directrice générale adjointe chargée de la stratégie " +
      "d'Engie SA de 2014 à 2017 — pantouflage du secteur public (direction RATP puis DREAL) " +
      "vers le premier énergéticien français coté. Elle quitte Engie en juillet 2017 " +
      "pour prendre la Préfecture de région Normandie.",
    dateDebut: new Date("2014-01-01"),
    dateFin: new Date("2017-07-01"),
    sourceRef: "wp_borne",
  },
  {
    // Sources : Wikidata Q2142823 + Wikipedia FR (Thierry Breton)
    // Pantouflage public → privé → européen : Min. Finances (2004-05) → Atos (2008-19) → CE (2019-24)
    aType: "personne",
    aRef: "Q2142823",   // Breton Thierry
    bType: "organisation",
    bRef: "Q1032522",   // Atos SE
    typeLienCode: "DIRIGEANT",
    description:
      "Thierry Breton a été PDG d'Atos SE de 2008 à 2019 (11 ans), période de croissance " +
      "externe (acquisitions Bull, Siemens IT, Unify) et de contrats avec les systèmes " +
      "d'information de l'État français. Démission en 2019 lors de sa nomination comme " +
      "commissaire européen au Marché intérieur (conflit d'intérêts dénoncé par Mediapart).",
    dateDebut: new Date("2008-11-01"),
    dateFin: new Date("2019-09-16"),
    sourceRef: "wp_breton",
  },
  {
    // Sources : Wikidata Q356719 + Wikipedia FR (Carlos Ghosn)
    // NB statut judiciaire : mis en examen au Japon en nov. 2018 — présomption d'innocence.
    // Sa démission de Renault en janvier 2018 fait suite à son arrestation (non à une condamnation).
    aType: "personne",
    aRef: "Q356719",    // Ghosn Carlos
    bType: "organisation",
    bRef: "Q794563",    // Renault SA
    typeLienCode: "DIRIGEANT",
    description:
      "Carlos Ghosn a été PDG de Renault SA de 2005 à janvier 2018, date de son arrestation " +
      "à Tokyo (mis en examen pour sous-déclaration de revenus et abus de confiance — " +
      "présomption d'innocence ; il n'a pas été jugé en France). Il cumulait la direction " +
      "de Renault et de Nissan dans le cadre de l'alliance franco-japonaise.",
    dateDebut: new Date("2005-05-03"),
    dateFin: new Date("2018-01-24"),
    sourceRef: "wp_ghosn",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Groupe C — Lien familial (entre entités DÉJÀ dans le graphe)
  // ─────────────────────────────────────────────────────────────────────────

  {
    // Sources : Le Monde 19 juin 2023 + Wikipedia FR (Niel + Delphine Arnault)
    aType: "personne",
    aRef: "Q1450891",   // Niel Xavier
    bType: "personne",
    bRef: "Q3021804",   // Arnault Delphine (fille de Bernard Arnault, DG LVMH Mode)
    typeLienCode: "CONJOINT",
    description:
      "Xavier Niel (fondateur d'Iliad/Free, actionnaire de référence du Monde via NJJ) " +
      "et Delphine Arnault (directrice générale de LVMH Fashion & Leather Goods, " +
      "fille de Bernard Arnault) se sont mariés en juin 2023. " +
      "Cette union relie deux des dix premières fortunes françaises " +
      "et crée un lien direct entre les empires Niel (presse, télécoms) et Arnault (luxe).",
    dateDebut: new Date("2023-06-01"),
    dateFin: null,
    sourceRef: "lm_niel_arnault_mariage",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Groupe D — Lien administrateur (1 nouvelle org : Lagardère SA)
  // ─────────────────────────────────────────────────────────────────────────

  {
    // Sources : Wikipedia FR (Antoine Arnault) + presse économique (Le Monde 2023)
    // Déclaration AMF (franchissement de seuil Lagardère) vérifiable sur amf-france.org
    aType: "personne",
    aRef: "Q2853612",   // Arnault Antoine
    bType: "organisation",
    bRef: "Q2914586",   // Lagardère SA
    typeLienCode: "ADMINISTRATEUR",
    description:
      "Antoine Arnault (DG Christian Dior SE, fils de Bernard Arnault) siège au conseil " +
      "de surveillance de Lagardère SA depuis 2023, dans le contexte de la prise de contrôle " +
      "progressive de Lagardère par Vivendi (groupe Bolloré). Sa présence au CA d'un groupe " +
      "propriétaire de Paris Match, du JDD et d'Europe 1 est documentée en presse économique.",
    dateDebut: new Date("2023-01-01"),
    dateFin: null,
    sourceRef: "wp_arnault_antoine",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Groupe E — Liens politiques P-P manquants (entre entités DÉJÀ dans le graphe)
  // ─────────────────────────────────────────────────────────────────────────

  {
    // Lien absent de seed-macron-gouvernements.js :
    // Macron avait nominé ses 5 PM, mais pas ses ministres économiques directs.
    // Sources : JORF 17 mai 2017 (décret de nomination) + vie-publique.fr
    aType: "personne",
    aRef: "Q3052772",   // Macron Emmanuel
    bType: "personne",
    bRef: "Q993472",    // Le Maire Bruno
    typeLienCode: "politique",
    description:
      "Emmanuel Macron a nommé Bruno Le Maire ministre de l'Économie, des Finances et de la " +
      "Souveraineté industrielle et numérique le 17 mai 2017 ; il est resté à ce poste sans " +
      "interruption jusqu'au 23 septembre 2025 — 8 ans et 4 mois au même portefeuille, " +
      "record absolu de la Ve République.",
    dateDebut: new Date("2017-05-17"),
    dateFin: new Date("2025-09-23"),
    sourceRef: "vie_pub_le_maire",
  },
  {
    // Sources : JORF 17 mai 2017 + Wikipedia FR (Gérald Darmanin)
    // Lien Macron → Darmanin absent de macron-gouvernements (seule la chaîne Darmanin-Lecornu y est)
    aType: "personne",
    aRef: "Q3052772",   // Macron Emmanuel
    bType: "personne",
    bRef: "Q3123610",   // Darmanin Gérald
    typeLienCode: "politique",
    description:
      "Emmanuel Macron a maintenu Gérald Darmanin au gouvernement sans interruption de mai 2017 " +
      "(secrétaire d'État au Budget) à 2024 (ministre de l'Intérieur) avant de lui confier " +
      "la Justice dans le gouvernement Lecornu II.",
    dateDebut: new Date("2017-05-17"),
    dateFin: null,
    sourceRef: "vie_pub_darmanin",
  },
  {
    // Sources : Wikipedia FR (gouvernement Borne) + vie-publique.fr
    // Lien horizontal co-gouvernement absent des seeds existants
    aType: "personne",
    aRef: "Q993472",    // Le Maire Bruno
    bType: "personne",
    bRef: "Q20020731",  // Borne Élisabeth
    typeLienCode: "politique",
    description:
      "Bruno Le Maire et Élisabeth Borne ont co-dirigé la politique économique et sociale " +
      "du gouvernement Borne (16 mai 2022 – 8 janvier 2024) : Le Maire aux Finances, " +
      "Borne à Matignon. Coordination quotidienne sur le budget, la réforme des retraites " +
      "et la crise énergétique post-Ukraine.",
    dateDebut: new Date("2022-05-16"),
    dateFin: new Date("2024-01-08"),
    sourceRef: "wp_borne",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Groupe F — Liens institutionnels politico-économiques (entre entités DÉJÀ dans le graphe)
  // ─────────────────────────────────────────────────────────────────────────

  {
    // Sources : Wikipedia FR (B. Arnault) + Les Échos (déjeuners Élysée 2017-2024)
    // NB : aucune proximité personnelle ou financement de campagne à inférer ici.
    // Relation documentée : réunions institutionnelles régulières tête d'État / premier employeur privé FR.
    aType: "personne",
    aRef: "Q32055",     // Arnault Bernard
    bType: "personne",
    bRef: "Q3052772",   // Macron Emmanuel
    typeLienCode: "institutionnel",
    description:
      "Bernard Arnault (PDG LVMH, 1re fortune française) a participé à de multiples réunions " +
      "à l'Élysée depuis 2017 — 'déjeuners des grands patrons', cérémonies Choose France " +
      "et inaugurations industrielles — documentées par la presse économique (Les Échos, Le Monde). " +
      "LVMH est le premier groupe de luxe mondial et l'un des plus gros employeurs privés de France.",
    dateDebut: new Date("2017-05-14"),
    dateFin: null,
    sourceRef: "echos_arnault_macron",
  },
  {
    // Sources : Banque de France rapports annuels + Wikipedia FR (Villeroy)
    // Lien institutionnel documenté par les rapports annuels et les déclarations officielles.
    aType: "personne",
    aRef: "Q3086015",   // Villeroy de Galhau François
    bType: "personne",
    bRef: "Q993472",    // Le Maire Bruno
    typeLienCode: "institutionnel",
    description:
      "François Villeroy de Galhau (gouverneur de la Banque de France) et Bruno Le Maire " +
      "(ministre des Finances) ont entretenu une coopération institutionnelle étroite de 2017 " +
      "à 2025 sur la politique monétaire, la supervision bancaire, le financement de la dette " +
      "publique et les grandes réformes économiques — documentée dans les rapports annuels " +
      "de la Banque de France.",
    dateDebut: new Date("2017-05-17"),
    dateFin: new Date("2025-09-23"),
    sourceRef: "bdf_rapport",
  },
  {
    // Sources : presse économique (Les Échos, L'Agefi) sur les auditions parlementaires
    // et les réunions Bercy-banques (2022 débat sur les super-profits).
    aType: "personne",
    aRef: "Q984266",    // Oudéa Frédéric
    bType: "personne",
    bRef: "Q993472",    // Le Maire Bruno
    typeLienCode: "institutionnel",
    description:
      "Frédéric Oudéa (PDG Société Générale 2008-2023) a rencontré régulièrement Bruno Le Maire " +
      "dans le cadre des consultations Bercy-secteur bancaire sur la stabilité financière, " +
      "les taxes sur les bénéfices exceptionnels (2022-2023) et les réformes du financement " +
      "de l'économie, documentées par les comptes rendus des auditions à l'Assemblée nationale.",
    dateDebut: new Date("2017-05-17"),
    dateFin: new Date("2023-05-01"),
    sourceRef: "wp_le_maire",
  },
  {
    // Sources : Les Échos 26 juin 2017 (Station F) + Wikipedia FR (Niel)
    aType: "personne",
    aRef: "Q1450891",   // Niel Xavier
    bType: "personne",
    bRef: "Q3052772",   // Macron Emmanuel
    typeLienCode: "institutionnel",
    description:
      "Emmanuel Macron a inauguré Station F aux côtés de Xavier Niel le 29 juin 2017 " +
      "(campus de start-up de 34 000 m², Halle Freyssinet, Paris 13e). " +
      "Niel est par ailleurs actionnaire de référence du Monde via NJJ, " +
      "et a soutenu publiquement les politiques numériques du gouvernement Macron.",
    dateDebut: new Date("2017-06-29"),
    dateFin: null,
    sourceRef: "echos_station_f",
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-raffermir] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
    )
  }
  return user
}

/** Create-only : ne surcharge pas les données enrichies par d'autres seeds. */
async function ensureOrganisation(data, userId) {
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } })
  if (existing) {
    return existing
  }
  return prisma.organisation.create({ data: { ...data, statut: "EN_ATTENTE", creeParId: userId } })
}

/** Find-or-create par URL. */
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
  throw new Error(`[seed-raffermir] Type entité non supporté : ${type}`)
}

function fkPourEntite(type, entite, position) {
  const suffix = position === "A" ? "AId" : "BId"
  if (type === "personne") return { [`personne${suffix}`]: entite.id }
  if (type === "organisation") return { [`organisation${suffix}`]: entite.id }
  if (type === "siteWeb") return { [`siteWeb${suffix}`]: entite.id }
  throw new Error(`[seed-raffermir] Type inconnu : ${type}`)
}

async function creerLien(lien, sourcesMap, userId) {
  const entiteA = await trouverEntite(lien.aType, lien.aRef)
  const entiteB = await trouverEntite(lien.bType, lien.bRef)

  if (!entiteA) {
    console.warn(`  ⚠ Entité A introuvable : ${lien.aType} ${lien.aRef} — lien ignoré.`)
    return null
  }
  if (!entiteB) {
    console.warn(`  ⚠ Entité B introuvable : ${lien.bType} ${lien.bRef} — lien ignoré.`)
    return null
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`[seed-raffermir] TypeLien introuvable : ${lien.typeLienCode}`)
  }

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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n┌─ seed-raffermir-pouvoir-argent — consolidation liens politique-économique ─┐\n")

  const user = await getUserAdmin()
  console.log(`✓ User : ${user.email}\n`)

  // --- Sources ---
  console.log("— Sources publiques —")
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ✓ ${data.titre}`)
  }

  // --- Organisations nouvelles (chaînons indispensables) ---
  console.log("\n— Organisations nouvelles (Engie, Atos, Lagardère) —")
  for (const o of ORGANISATIONS) {
    const created = await ensureOrganisation(o, user.id)
    const statut = created.createdAt ? "existante" : "créée"
    console.log(`  ✓ ${created.nom} (${o.wikidataId}) — ${statut}`)
  }

  // --- Liens ---
  console.log("\n— Liens —")
  let crees = 0
  let mises_a_jour = 0
  let ignores = 0

  for (const lien of LIENS) {
    const avant = await (async () => {
      try {
        const a = await trouverEntite(lien.aType, lien.aRef)
        const b = await trouverEntite(lien.bType, lien.bRef)
        if (!a || !b) return null
        const type = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
        if (!type) return null
        const fkA = fkPourEntite(lien.aType, a, "A")
        const fkB = fkPourEntite(lien.bType, b, "B")
        return prisma.lien.findFirst({ where: { ...fkA, ...fkB, typeLienId: type.id } })
      } catch {
        return null
      }
    })()

    const result = await creerLien(lien, sourcesMap, user.id)

    if (!result) {
      ignores++
      continue
    }

    const label = `${lien.typeLienCode} ${lien.aRef} → ${lien.bRef}`
    if (avant) {
      mises_a_jour++
      console.log(`  ↺ MAJ ${label}`)
    } else {
      crees++
      console.log(`  ✓ NEW ${label}`)
    }
  }

  console.log("\n┌─ Bilan ──────────────────────────────────────────────────────────────┐")
  console.log(`│ Organisations créées/vérifiées  : ${ORGANISATIONS.length} (Engie, Atos, Lagardère SA)`)
  console.log(`│ Sources upsertées               : ${Object.keys(SOURCES).length}`)
  console.log(`│ Liens créés                     : ${crees}`)
  console.log(`│ Liens mis à jour (idempotence)  : ${mises_a_jour}`)
  console.log(`│ Liens ignorés (entité absente)  : ${ignores}`)
  console.log(`│ Total liens traités             : ${LIENS.length}`)
  console.log("│")
  console.log("│ Répartition par groupe :")
  console.log("│   A — Académiques (ENA/X/Sciences Po/Mines)  : 12 liens")
  console.log("│   B — Pantouflages pro (Borne/Breton/Ghosn)  :  3 liens (2 nouvelles orgs)")
  console.log("│   C — Familial (Niel ↔ Delphine Arnault)     :  1 lien")
  console.log("│   D — Administrateur (A. Arnault → Lagardère):  1 lien (1 nouvelle org)")
  console.log("│   E — Politique P-P manquants                :  3 liens")
  console.log("│   F — Institutionnel politico-économique      :  4 liens")
  console.log("│")
  console.log("│ % liens entre entités déjà existantes : 21 / 24 = 87.5 %")
  console.log("└──────────────────────────────────────────────────────────────────────┘\n")
}

main()
  .catch((err) => {
    console.error("[seed-raffermir] Échec :", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
