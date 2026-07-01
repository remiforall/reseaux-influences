/**
 * Seed CAC 40 — Conseils d'administration BATCH 4 (7 sociétés).
 *
 * Enquête OSINT journalistique — consultation du 2026-07-01.
 * Périmètre : Orange, Pernod Ricard, Publicis Groupe, Renault,
 *             Safran, Saint-Gobain, Schneider Electric.
 *
 * INTERLOCKS DÉTECTÉS :
 *   — Jacques Aschenbroich (Q3158153) : Orange + TotalEnergies + BNP Paribas (pilote)
 *   — Pierre-André de Chalendar (Q1518898) : Saint-Gobain (hist.) + BNP Paribas (pilote)
 *   — Clotilde Delbos (Q48441071) : Renault + AXA + Sanofi (pilote)
 *   — Benoît Bazin (Q33161719) : Saint-Gobain PDG + Vinci (admin — hors corpus)
 *   — Olivier Andriès (Q32588324) : Safran DG + Veolia (admin depuis 2023 — hors corpus)
 *   — Ross McInnes (Q18638252) : Safran président CA + Engie (admin — hors corpus)
 *
 * Membres exclus (sans wikidataId vérifié) — listés par société :
 *   Orange (~13 membres hors Aschenbroich/Heydemann) :
 *     Stéphane Richard (ex-PDG, condamné), et les administrateurs non vérifiés :
 *     Bpifrance (rep.), État français (rep. OPT), représentants salariés, et admins
 *     indépendants dont Q-id non confirmé (Hélène Dupont, Aliette Mousnier-Lompré,
 *     Nicolas Namias, Rose-Marie Van Lerberghe, etc.)
 *   Pernod Ricard (~12 membres hors Alexandre Ricard/Barbizet) :
 *     César Giron, Maria Jesus de Aldama, Veronica Augustsson, Ségolène Gallienne,
 *     Patricia Pessarossi-Asseraf, Ian Gallienne, Anne-Hélène Monsallier,
 *     Wolfgang Colberg, Gilles Bogaert, María Almudena García-Rubio, etc.
 *   Publicis (~12 membres hors Sadoun/Badinter/Thiam) :
 *     Benjamin Badinter, Jean Charest, Sophie Dulac, Thomas H. Glocer,
 *     Marie-Josée Kravis, André Kudelski, Suzan LeVine,
 *     Antonella Mei-Pochtler, Pierre Pénicaud (salarié), Jaime Teevan,
 *     Patricia Velay-Borrini (salariée)
 *   Renault (~13 membres hors Senard/Delbos/de Meo) :
 *     François Provost (DG depuis 31 juil. 2025, sans Q-id), représentants
 *     Nissan, représentant État, représentants salariés et actionnaires salariés,
 *     Marie-José Donsion, Annette Winkler, etc.
 *   Safran (~10 membres hors McInnes/Andriès) :
 *     Odile Desforges, Marc Aubry (salarié), Hélène Caillet, Robert Peugeot,
 *     Stéphanie Frachet, Vincent Imbert, Jean-Pierre Clamadieu, etc.
 *   Saint-Gobain (~12 membres hors Bazin/Cirelli/de Chalendar) :
 *     Siân Herbert-Jones, Thierry Delaporte (audit), Laurence Broseta,
 *     Agnès Lemarchand, Jean-François Palus, Agnès Touraine, etc.
 *   Schneider Electric (~12 membres hors Tricoire) :
 *     Olivier Blum (DG depuis nov. 2024, sans Q-id Wikidata confirmé),
 *     Peter Herweck (ancien DG 2023-2024), Cécile Cabanis, Willy Chahine (salarié),
 *     Leo Apotheker, Jill Lee, Anders Runevad, Xiaoyun (Lucy) Peng, etc.
 *
 * Sources : sites gouvernance officiels, Wikidata, Wikipédia, URD, communiqués.
 *
 * Garde-fous :
 *   - toutes les entités en statut EN_ATTENTE (ADR-006 / ADR-010)
 *   - qualiteInfluence obligatoire
 *   - idempotent (upsert par wikidataId)
 *   - ⚠ --reset supprime aussi les personnes partagées avec le pilote
 *     (Aschenbroich, Delbos, de Chalendar) ; ne pas utiliser conjointement
 *
 * Usage :
 *   cd backend && node bin/seed-cac40-b4.js
 *   cd backend && node bin/seed-cac40-b4.js --reset
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const RESET = process.argv.includes('--reset')
const USER_EMAIL = 'remi@reseauxinfluences.fr'

// ---------------------------------------------------------------------------
// PERSONNES — wikidataIds vérifiés via wikidata.org/wiki/<Q-id>
// dateConsultation 2026-07-01
// ---------------------------------------------------------------------------

const PERSONNES = [
  // ─── Partagées avec le pilote (upsert idempotent) ──────────────────────────

  {
    // Sources : Wikidata Q3158153 + Wikipedia EN + orange.com/governance
    // + totalenergies.com/governance + group.bnpparibas
    // INTERLOCK TRIPLE : Orange (président CA) + TotalEnergies (admin référent, pilote)
    //                   + BNP Paribas (admin, pilote)
    nom: 'Aschenbroich',
    prenom: 'Jacques',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1954-06-03'),
    lieuNaissance: 'France',
    rolePrincipal: "Président du conseil d'administration d'Orange ; administrateur référent de TotalEnergies",
    rolesSecondaires: [
      "ancien PDG de Valeo (2009-2022)",
      "ingénieur du Corps des mines",
      "administrateur indépendant de BNP Paribas (depuis 2023)",
    ],
    bio:
      "Ingénieur du Corps des mines, Jacques Aschenbroich a dirigé Valeo pendant treize ans (2009-2022). " +
      "Président du conseil d'Orange depuis avril 2022 (gouvernance dissociée avec Christel Heydemann DG), " +
      "il est aussi administrateur référent de TotalEnergies (depuis 2021) et administrateur de BNP Paribas " +
      "(depuis 2023). Interlock triple documenté entre ces trois conseils.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Jacques_Aschenbroich',
    wikidataId: 'Q3158153',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q1518898 + Wikipedia EN + saint-gobain.com + group.bnpparibas
    // INTERLOCK : Saint-Gobain (président CA jusqu'en juin 2024) + BNP Paribas (admin, pilote)
    // NB : depuis le 6 juin 2024, Benoît Bazin est PDG de Saint-Gobain (cumul) ;
    //      de Chalendar a quitté la présidence du CA à cette date.
    nom: 'de Chalendar',
    prenom: 'Pierre-André',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-04-12'),
    lieuNaissance: 'Vichy (Allier)',
    rolePrincipal: "Administrateur de BNP Paribas ; ancien président du conseil d'administration de Saint-Gobain",
    rolesSecondaires: [
      "ancien PDG de Saint-Gobain (2010-2021)",
      "ancien président non exécutif du CA de Saint-Gobain (2021-2024)",
      "ESSEC + ENA (promotion 1983)",
      "administrateur de Veolia",
    ],
    bio:
      "Issu de l'ESSEC et de l'ENA, Pierre-André de Chalendar a dirigé Saint-Gobain comme PDG de 2010 " +
      "à 2021, puis comme président non exécutif du conseil jusqu'au 6 juin 2024, date à laquelle Benoît " +
      "Bazin a pris le cumul des fonctions de PDG. Il siège au conseil de BNP Paribas depuis 2021.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Pierre-Andr%C3%A9_de_Chalendar',
    wikidataId: 'Q1518898',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q48441071 + Wikipedia EN + renaultgroup.com + axa.com + sanofi.com
    // INTERLOCK TRIPLE : Renault (DGD/CFO) + AXA (admin, pilote) + Sanofi (admin, pilote)
    nom: 'Delbos',
    prenom: 'Clotilde',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Directrice générale déléguée et directrice financière du groupe Renault",
    rolesSecondaires: [
      "administratrice indépendante de Sanofi (depuis 2024)",
      "administratrice indépendante d'AXA (depuis 2021)",
      "diplômée d'emlyon business school",
    ],
    bio:
      "Directrice financière du groupe Renault depuis 2013 et DGD depuis juillet 2020, Clotilde Delbos " +
      "siège au conseil d'AXA depuis 2021 et à celui de Sanofi depuis avril 2024. Son double mandat " +
      "hors Renault constitue un interlock documenté entre ces deux conseils du CAC 40.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Clotilde_Delbos',
    wikidataId: 'Q48441071',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Orange ───────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q33112117 + Wikipedia EN + orange.com/governance (PR janv. 2022)
    nom: 'Heydemann',
    prenom: 'Christel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1971-04-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Directrice générale d'Orange",
    rolesSecondaires: [
      "ancienne responsable de la zone Europe centrale de Schneider Electric",
      "DEA Telecom ParisTech + diplôme Politecnico di Torino",
    ],
    bio:
      "Ingénieure en informatique (Politecnico di Torino, DEA Telecom ParisTech), Christel Heydemann " +
      "a passé une large partie de sa carrière chez Schneider Electric, dont elle a dirigé la zone " +
      "Europe centrale. Nommée directrice générale d'Orange le 4 avril 2022, elle succède à Stéphane " +
      "Richard dans le cadre d'une gouvernance dissociée avec Jacques Aschenbroich président du CA.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Christel_Heydemann',
    wikidataId: 'Q33112117',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Pernod Ricard ────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q19291561 + Wikipedia EN + pernod-ricard.com/governance
    nom: 'Ricard',
    prenom: 'Alexandre',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1972-05-12'),
    lieuNaissance: 'France',
    rolePrincipal: 'PDG de Pernod Ricard',
    rolesSecondaires: [
      "petit-fils de Paul Ricard, fondateur du groupe",
      "ESCP Europe (1995) + MBA Wharton (finance et entrepreneuriat)",
      "vice-président de Pernod Ricard de 2012 à 2015",
    ],
    bio:
      "Petit-fils de Paul Ricard, fondateur du groupe éponyme, Alexandre Ricard est diplômé de l'ESCP " +
      "Europe et du MBA Wharton. Il rejoint Pernod Ricard en 2003 et en devient PDG le 11 février 2015, " +
      "à 42 ans, l'un des plus jeunes PDG du CAC 40. Le groupe est le deuxième acteur mondial des vins " +
      "et spiritueux.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Alexandre_Ricard',
    wikidataId: 'Q19291561',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3369080 + Wikipedia EN + pernod-ricard.com/governance
    nom: 'Barbizet',
    prenom: 'Patricia',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1955-04-17'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Administratrice référente indépendante de Pernod Ricard",
    rolesSecondaires: [
      "ancienne PDG d'Artémis (société d'investissement famille Pinault, 1992-2018)",
      "ESCP Europe",
      "ancienne administratrice de TotalEnergies et de Kering",
    ],
    bio:
      "Diplômée de l'ESCP Europe, Patricia Barbizet a dirigé Artémis, société d'investissement de la " +
      "famille Pinault, de 1992 à 2018. Ancienne administratrice de Kering et TotalEnergies, elle " +
      "siège au conseil de Pernod Ricard depuis 2018 et en est l'administratrice référente indépendante " +
      "depuis janvier 2019.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Patricia_Barbizet',
    wikidataId: 'Q3369080',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Publicis Groupe ──────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q2865328 + Wikipedia EN + publicisgroupe.com/governance
    nom: 'Sadoun',
    prenom: 'Arthur',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1971-05-23'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'PDG de Publicis Groupe',
    rolesSecondaires: [
      "EBS Paris (1992) + MBA INSEAD (1997)",
      "fondateur de Z Group Chile (1992, revendu à BBDO 1997)",
      "ancien PDG de Publicis Conseil (2012-2017)",
    ],
    bio:
      "Diplômé de l'EBS Paris et MBA INSEAD, Arthur Sadoun a fondé une agence publicitaire au Chili " +
      "puis rejoint TBWA (1999) avant d'entrer chez Publicis en 2006. Troisième PDG de l'histoire de " +
      "Publicis après Marcel Bleustein-Blanchet et Maurice Lévy, il dirige le groupe depuis le " +
      "1er juin 2017.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Arthur_Sadoun',
    wikidataId: 'Q2865328',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q274309 + Wikipedia FR + publicisgroupe.com/governance
    nom: 'Badinter',
    prenom: 'Élisabeth',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1944-03-05'),
    lieuNaissance: 'Boulogne-Billancourt (Hauts-de-Seine)',
    rolePrincipal: "Vice-présidente du conseil d'administration de Publicis Groupe",
    rolesSecondaires: [
      "philosophe et essayiste (L'Amour en plus, L'Un est l'autre…)",
      "professeure émérite à l'École polytechnique",
      "héritière de Marcel Bleustein-Blanchet, fondateur de Publicis",
      "actionnaire de référence du groupe Publicis",
    ],
    bio:
      "Philosophe, essayiste et professeure émérite à l'École polytechnique, Élisabeth Badinter est " +
      "connue pour ses travaux féministes. Héritière de Marcel Bleustein-Blanchet, fondateur de " +
      "Publicis, elle est actionnaire de référence du groupe et vice-présidente du conseil " +
      "d'administration depuis plusieurs décennies.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/%C3%89lisabeth_Badinter',
    wikidataId: 'Q274309',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3528191 + Wikipedia EN + publicisgroupe.com/governance
    nom: 'Thiam',
    prenom: 'Tidjane',
    pays: 'France',
    nationalite: "franco-ivoirienne",
    dateNaissance: new Date('1962-07-29'),
    lieuNaissance: "Abidjan (Côte d'Ivoire)",
    rolePrincipal: "Administrateur indépendant de Publicis Groupe",
    rolesSecondaires: [
      "École polytechnique + ENSAE + INSEAD",
      "ancien PDG de Prudential plc (2009-2015)",
      "ancien PDG du Crédit Suisse (2015-2020)",
      "président de la Fédération africaine des marchés financiers",
    ],
    bio:
      "Diplômé de Polytechnique, de l'ENSAE et de l'INSEAD, Tidjane Thiam a dirigé Prudential plc " +
      "(2009-2015) et le Crédit Suisse (2015-2020). Il est administrateur indépendant de Publicis " +
      "Groupe et préside la Fédération africaine des marchés financiers. Ancien directeur général " +
      "de la CNPS en Côte d'Ivoire.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Tidjane_Thiam',
    wikidataId: 'Q3528191',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q1347130 + Wikipedia FR + publicisgroupe.com/governance
    // NB : Maurice Lévy est « président d'honneur » depuis 2024 — il ne siège plus
    //      au conseil d'administration proprement dit (cf. page gouvernance Publicis).
    //      Son lien DIRIGEANT est créé avec dateFin 2017-05-31 (historique).
    nom: 'Lévy',
    prenom: 'Maurice',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1942-02-05'),
    lieuNaissance: 'Oujda (Maroc)',
    rolePrincipal: "Président d'honneur de Publicis Groupe",
    rolesSecondaires: [
      "PDG de Publicis Groupe de 1987 à 2017",
      "architecte de l'internationalisation de Publicis (Leo Burnett, Saatchi & Saatchi, Sapient…)",
      "diplômé de Sciences Po Paris + INSEAD",
    ],
    bio:
      "Architecte de la montée en puissance de Publicis pendant trente ans (1987-2017), Maurice Lévy " +
      "a transformé l'agence parisienne en troisième réseau publicitaire mondial via une stratégie " +
      "d'acquisitions (Leo Burnett, Saatchi & Saatchi, Digitas, Sapient…). Il en est désormais " +
      "président d'honneur, sans siège au conseil d'administration.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Maurice_L%C3%A9vy_(publicitaire)',
    wikidataId: 'Q1347130',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Renault ──────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q1684801 + Wikipedia EN + renaultgroup.com/governance (CA 24 janv. 2019)
    nom: 'Senard',
    prenom: 'Jean-Dominique',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-02-26'),
    lieuNaissance: 'France',
    rolePrincipal: "Président du conseil d'administration de Renault",
    rolesSecondaires: [
      "ESCP Europe + Corps des mines",
      "ancien PDG de Michelin (2012-2019)",
      "copilote de l'alliance Renault-Nissan-Mitsubishi",
    ],
    bio:
      "Ingénieur du Corps des mines et ESCP Europe, Jean-Dominique Senard a dirigé le groupe Michelin " +
      "de 2012 à 2019 avant d'être élu président du conseil d'administration de Renault le 24 janvier " +
      "2019, dans le sillage de la crise Ghosn-Nissan. Il préside la refondation de l'alliance " +
      "Renault-Nissan-Mitsubishi.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Jean-Dominique_Senard',
    wikidataId: 'Q1684801',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3264974 + Wikipedia EN + renaultgroup.com
    //           + globenewswire.com PR 30 juil. 2025 (départ vers Kering)
    // NB : Luca de Meo a quitté Renault le 31 juillet 2025 pour prendre la tête de Kering.
    //      François Provost lui a succédé comme DG (sans Q-id Wikidata identifié à ce jour).
    nom: 'de Meo',
    prenom: 'Luca',
    pays: 'Italie',
    nationalite: 'italienne',
    dateNaissance: new Date('1967-06-09'),
    lieuNaissance: 'Milan (Italie)',
    rolePrincipal: "Ancien directeur général de Renault (2020-2025) ; PDG de Kering (depuis 2025)",
    rolesSecondaires: [
      "Université commerciale Luigi Bocconi (Milan)",
      "ancien PDG de Seat S.A. (2015-2020)",
      "ancien responsable de Volkswagen Italie et Audi",
    ],
    bio:
      "Diplômé de l'Université Bocconi (Milan), Luca de Meo a dirigé Seat et Volkswagen Italie avant " +
      "de rejoindre Renault comme directeur général en juillet 2020. Sous sa direction, Renault a lancé " +
      "la marque électrique Ampere. Il quitte le groupe le 31 juillet 2025 pour prendre la tête de " +
      "Kering (Gucci, Saint Laurent, Bottega Veneta).",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Luca_de_Meo',
    wikidataId: 'Q3264974',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Safran ───────────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q18638252 + Wikipedia EN + safran-group.com/governance
    // NB : Ross McInnes est également administrateur d'Engie (interlock hors corpus B4)
    nom: 'McInnes',
    prenom: 'Ross',
    pays: 'France',
    nationalite: 'franco-australienne',
    dateNaissance: new Date('1956-01-01'),
    lieuNaissance: 'Australie',
    rolePrincipal: "Président du conseil d'administration de Safran",
    rolesSecondaires: [
      "Sciences Po Paris + INSEAD",
      "ancien DFO de Thomson Multimedia et Pechiney",
      "ancien directeur financier de PPR (Kering)",
      "administrateur d'Engie (interlock hors corpus)",
    ],
    bio:
      "Franco-australien, diplômé de Sciences Po Paris et de l'INSEAD, Ross McInnes a exercé des " +
      "fonctions de direction financière chez Pechiney, PPR et Thomson. Président du conseil " +
      "d'administration de Safran depuis 2015, il préside également le comité des rémunérations " +
      "et siège au conseil d'Engie.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Ross_McInnes',
    wikidataId: 'Q18638252',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q32588324 + safran-group.com (PR 16 déc. 2020 + profile page)
    // NB : Olivier Andriès est également administrateur indépendant de Veolia (depuis avr. 2023)
    //      — interlock hors corpus B4.
    nom: "Andriès",
    prenom: 'Olivier',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1962-04-17'),
    lieuNaissance: 'France',
    rolePrincipal: "Directeur général de Safran",
    rolesSecondaires: [
      "École polytechnique + Corps des mines de Paris",
      "DG de Safran depuis le 1er janvier 2021",
      "administrateur indépendant de Veolia (depuis avr. 2023, interlock hors corpus)",
    ],
    bio:
      "Polytechnicien et ingénieur du Corps des mines, Olivier Andriès débute sa carrière chez Total " +
      "avant de rejoindre Safran Aircraft Engines puis la direction générale du groupe. Nommé directeur " +
      "général de Safran le 1er janvier 2021, il accélère la stratégie dans les équipements " +
      "aéronautiques et la défense. Administrateur de Veolia depuis 2023.",
    wikipediaUrl: null,
    wikidataId: 'Q32588324',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Saint-Gobain ─────────────────────────────────────────────────────────

  {
    // Sources : Wikidata Q33161719 + Wikipedia EN + saint-gobain.com/governance (PR 6 juin 2024)
    // NB : Benoît Bazin est également administrateur de Vinci (interlock hors corpus B4).
    nom: 'Bazin',
    prenom: 'Benoît',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1968-12-29'),
    lieuNaissance: 'Boulogne-Billancourt (Hauts-de-Seine)',
    rolePrincipal: "PDG de Compagnie de Saint-Gobain",
    rolesSecondaires: [
      "École polytechnique + École des Ponts ParisTech + MIT (Master of Science)",
      "Sciences Po IEP Paris (économie)",
      "directeur général de Saint-Gobain depuis juillet 2021, PDG depuis juin 2024",
      "administrateur de Vinci (interlock hors corpus B4)",
    ],
    bio:
      "Polytechnicien, ingénieur des Ponts et titulaire d'un master MIT, Benoît Bazin rejoint " +
      "Saint-Gobain en 2002. Directeur général depuis juillet 2021, il prend également la présidence " +
      "du conseil d'administration le 6 juin 2024 (cumul des fonctions de PDG) lorsque Pierre-André " +
      "de Chalendar quitte la présidence du CA. Administrateur de Vinci.",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Beno%C3%AEt_Bazin',
    wikidataId: 'Q33161719',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    // Sources : Wikidata Q3165536 + saint-gobain.com (PR 6 juin 2024 + PR 28 nov. 2024)
    // Administrateur de Saint-Gobain depuis 2020 ; vice-président et administrateur
    // référent indépendant depuis le 6 juin 2024.
    nom: 'Cirelli',
    prenom: 'Jean-François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1958-07-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Vice-président et administrateur référent indépendant de Saint-Gobain",
    rolesSecondaires: [
      "ENA + Sciences Po Paris + Harvard Kennedy School",
      "inspecteur des finances",
      "ancien PDG de Gaz de France (2004-2008)",
      "ancien DGA de GDF Suez / Engie (2008-2014)",
      "vice-président de BlackRock France",
    ],
    bio:
      "Inspecteur des finances, Jean-François Cirelli a été PDG de Gaz de France (2004-2008) puis " +
      "directeur général adjoint de GDF Suez (devenu Engie, 2008-2014). Vice-président de BlackRock " +
      "France, il siège au conseil de Saint-Gobain depuis 2020, dont il est vice-président et " +
      "administrateur référent indépendant depuis juin 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Fran%C3%A7ois_Cirelli',
    wikidataId: 'Q3165536',
    qualiteInfluence: 'DIRIGEANT',
  },

  // ─── Schneider Electric ───────────────────────────────────────────────────

  {
    // Sources : Wikidata Q3168302 + Wikipedia EN + se.com/governance
    // NB : Olivier Blum est DG depuis novembre 2024 mais son Q-id Wikidata
    //      n'est pas confirmé à la date de consultation → exclu du seed.
    nom: 'Tricoire',
    prenom: 'Jean-Pascal',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-01-01'),
    lieuNaissance: 'France',
    rolePrincipal: "Président du conseil d'administration de Schneider Electric",
    rolesSecondaires: [
      "ESC Bordeaux-Échanges",
      "CEO de Schneider Electric de 2006 à mai 2023",
      "président non exécutif du CA depuis mai 2023",
    ],
    bio:
      "Diplômé de l'ESC Bordeaux-Échanges, Jean-Pascal Tricoire rejoint Schneider Electric en 1986 " +
      "et en devient PDG exécutif en 2006. Il transforme Schneider en acteur mondial de la gestion " +
      "d'énergie et de l'automatisation. Président non exécutif du conseil depuis mai 2023, après " +
      "avoir cédé les fonctions exécutives (Peter Herweck, puis Olivier Blum en novembre 2024).",
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Jean-Pascal_Tricoire',
    wikidataId: 'Q3168302',
    qualiteInfluence: 'DIRIGEANT',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS — 7 sociétés CAC 40
// wikidataIds vérifiés via Special:EntityData
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q1431486 + Wikipedia FR + orange.com
    nom: 'Orange',
    sigle: 'ORA',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.orange.com',
    description:
      "Opérateur de télécommunications français issu de France Télécom (privatisée en 1997, renommée " +
      "Orange SA en 2013). Présent dans plus de 26 pays, ~130 000 employés. Gouvernance dissociée " +
      "depuis 2022 : Aschenbroich (président CA non exec.), Heydemann (DG). CAC 40.",
    dateCreation: new Date('1988-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Orange_SA',
    wikidataId: 'Q1431486',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q837049 + Wikipedia FR + pernod-ricard.com
    nom: 'Pernod Ricard',
    sigle: 'RI',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.pernod-ricard.com',
    description:
      "Deuxième acteur mondial des vins et spiritueux (Absolut, Jameson, Malibu, Mumm, Martell…), " +
      "né en 1975 de la fusion de Pernod Fils et Ricard. PDG : Alexandre Ricard. Siège : Paris. " +
      "~19 000 employés, présent dans plus de 70 pays. CAC 40.",
    dateCreation: new Date('1975-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Pernod_Ricard',
    wikidataId: 'Q837049',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1537378 + Wikipedia FR + publicisgroupe.com
    nom: 'Publicis Groupe',
    sigle: 'PUB',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.publicisgroupe.com',
    description:
      "Troisième réseau publicitaire et de communication mondial, fondé en 1926 par Marcel " +
      "Bleustein-Blanchet. PDG : Arthur Sadoun. Périmètre : Publicis Sapient, Leo Burnett, Saatchi " +
      "& Saatchi, MSLGROUP, etc. ~100 000 employés dans 100 pays. CAC 40.",
    dateCreation: new Date('1926-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Publicis',
    wikidataId: 'Q1537378',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q6686 + Wikipedia FR + renaultgroup.com
    nom: 'Renault',
    sigle: 'RNO',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.renaultgroup.com',
    description:
      "Constructeur automobile français fondé en 1899 par Louis Renault. Membre de l'alliance " +
      "Renault-Nissan-Mitsubishi. Président CA : Jean-Dominique Senard. DG depuis juil. 2025 : " +
      "François Provost. Environ 110 000 employés. CAC 40.",
    dateCreation: new Date('1899-10-25'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Renault',
    wikidataId: 'Q6686',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q1886126 + Wikipedia FR + safran-group.com
    nom: 'Safran',
    sigle: 'SAF',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.safran-group.com',
    description:
      "Groupe industriel français spécialisé dans les équipements aéronautiques, spatiaux et de " +
      "défense (moteurs CFM avec GE, nacelles, trains d'atterrissage, avionique, cybersécurité). " +
      "Né en 2000 de la fusion Sagem-Snecma. Président CA : Ross McInnes. DG : Olivier Andriès. " +
      "~100 000 employés. CAC 40.",
    dateCreation: new Date('2000-05-11'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Safran_(entreprise)',
    wikidataId: 'Q1886126',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q678565 + Wikipedia FR + saint-gobain.com
    nom: 'Compagnie de Saint-Gobain',
    sigle: 'SGO',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.saint-gobain.com',
    description:
      "L'un des plus anciens groupes industriels du monde (fondé en 1665 par Colbert comme " +
      "Manufacture royale des glaces). Leader mondial des matériaux de construction et des " +
      "solutions de performance. PDG depuis juin 2024 : Benoît Bazin (cumul). ~170 000 employés, " +
      "76 pays. CAC 40.",
    dateCreation: new Date('1665-10-23'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Compagnie_de_Saint-Gobain',
    wikidataId: 'Q678565',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q49053 + Wikipedia FR + se.com
    nom: 'Schneider Electric',
    sigle: 'SU',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.se.com',
    description:
      "Spécialiste mondial de la gestion de l'énergie et de l'automatisation, fondé en 1836 par " +
      "Eugène Schneider. Produits : tableau électrique, automatismes, UPS, logiciels SCADA/AVEVA. " +
      "Président CA non exec. : Jean-Pascal Tricoire. DG depuis nov. 2024 : Olivier Blum. " +
      "~150 000 employés, 100 pays. CAC 40.",
    dateCreation: new Date('1836-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Schneider_Electric',
    wikidataId: 'Q49053',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées. dateConsultation 2026-07-01.
// ---------------------------------------------------------------------------

const SOURCES = {
  // ── Orange ─────────────────────────────────────────────────────────────────
  gov_orange: {
    url: 'https://www.orange.com/fr/a-propos/gouvernance/le-conseil-dadministration',
    titre: "Conseil d'administration — Orange (site officiel)",
    media: 'Orange (site officiel)',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-04-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Orange SA',
    description:
      "Page gouvernance officielle d'Orange : liste et biographies des administrateurs, " +
      "gouvernance dissociée depuis avril 2022 (Aschenbroich président, Heydemann DG).",
    verifiee: true,
  },
  wp_heydemann: {
    url: 'https://en.wikipedia.org/wiki/Christel_Heydemann',
    titre: 'Christel Heydemann — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Biographie : ingénieure informatique (Torino/ParisTech), Schneider Electric (Europe centrale), " +
      "DG d'Orange depuis le 4 avril 2022.",
    verifiee: true,
  },
  wp_aschenbroich: {
    url: 'https://en.wikipedia.org/wiki/Jacques_Aschenbroich',
    titre: 'Jacques Aschenbroich — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Corps des mines, PDG Valeo (2009-2022), président du CA d'Orange (2022-), " +
      "administrateur référent TotalEnergies (2021-), administrateur BNP Paribas (2023-).",
    verifiee: true,
  },

  // ── Pernod Ricard ──────────────────────────────────────────────────────────
  gov_pernod: {
    url: 'https://www.pernod-ricard.com/en/our-group/our-governance',
    titre: "Our Governance — Pernod Ricard (site officiel)",
    media: 'Pernod Ricard (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Pernod Ricard',
    description:
      "Page gouvernance Pernod Ricard : conseil d'administration, comités, biographies. " +
      "Alexandre Ricard PDG ; Patricia Barbizet administratrice référente indépendante.",
    verifiee: true,
  },
  wp_alexandre_ricard: {
    url: 'https://en.wikipedia.org/wiki/Alexandre_Ricard',
    titre: 'Alexandre Ricard — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Biographie : petit-fils de Paul Ricard, ESCP + Wharton MBA, PDG de Pernod Ricard " +
      "depuis le 11 février 2015.",
    verifiee: true,
  },
  wp_barbizet: {
    url: 'https://en.wikipedia.org/wiki/Patricia_Barbizet',
    titre: 'Patricia Barbizet — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "ESCP, PDG d'Artémis (1992-2018), ancienne administratrice de Kering et TotalEnergies, " +
      "administratrice référente de Pernod Ricard depuis 2018-2019.",
    verifiee: true,
  },

  // ── Publicis Groupe ────────────────────────────────────────────────────────
  gov_publicis: {
    url: 'https://www.publicisgroupe.com/fr/le-groupe/gouvernance',
    titre: "Gouvernance — Publicis Groupe (site officiel)",
    media: 'Publicis Groupe (site officiel)',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Publicis Groupe',
    description:
      "Page gouvernance Publicis Groupe : Arthur Sadoun PDG, Élisabeth Badinter VP, " +
      "Tidjane Thiam administrateur indépendant. Maurice Lévy président d'honneur (hors CA).",
    verifiee: true,
  },
  wp_sadoun: {
    url: 'https://en.wikipedia.org/wiki/Arthur_Sadoun',
    titre: 'Arthur Sadoun — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "EBS Paris + INSEAD MBA ; fondateur Z Group Chile, TBWA, Publicis Conseil PDG ; " +
      "PDG de Publicis Groupe depuis le 1er juin 2017.",
    verifiee: true,
  },
  wp_badinter: {
    url: 'https://fr.wikipedia.org/wiki/%C3%89lisabeth_Badinter',
    titre: 'Élisabeth Badinter — Wikipédia (FR)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Philosophe et essayiste, héritière de Marcel Bleustein-Blanchet, actionnaire et " +
      "vice-présidente du conseil d'administration de Publicis Groupe.",
    verifiee: true,
  },
  wp_thiam: {
    url: 'https://en.wikipedia.org/wiki/Tidjane_Thiam',
    titre: 'Tidjane Thiam — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Polytechnique + ENSAE + INSEAD ; PDG Prudential (2009-2015), PDG Crédit Suisse " +
      "(2015-2020) ; administrateur indépendant de Publicis Groupe.",
    verifiee: true,
  },
  wp_levy: {
    url: 'https://fr.wikipedia.org/wiki/Maurice_L%C3%A9vy_(publicitaire)',
    titre: 'Maurice Lévy — Wikipédia (FR)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "PDG de Publicis Groupe de 1987 à 2017 ; a transformé Publicis en 3e réseau mondial " +
      "via acquisitions (Leo Burnett, Saatchi, Sapient…). Président d'honneur depuis ~2024.",
    verifiee: true,
  },

  // ── Renault ────────────────────────────────────────────────────────────────
  gov_renault: {
    url: 'https://www.renaultgroup.com/en/group/leadership/board-of-directors/',
    titre: "Board of Directors — Renault Group (site officiel)",
    media: 'Renault Group (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Renault Group',
    description:
      "Page gouvernance officielle de Renault Group : 16 administrateurs au 1er juil. 2026. " +
      "Président CA : Jean-Dominique Senard. DG depuis juil. 2025 : François Provost.",
    verifiee: true,
  },
  wp_senard: {
    url: 'https://en.wikipedia.org/wiki/Jean-Dominique_Senard',
    titre: 'Jean-Dominique Senard — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "ESCP + Corps des mines ; PDG de Michelin (2012-2019) ; président du CA de Renault " +
      "depuis le 24 janvier 2019.",
    verifiee: true,
  },
  wp_demeo: {
    url: 'https://en.wikipedia.org/wiki/Luca_de_Meo',
    titre: 'Luca de Meo — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Bocconi Milan ; PDG de Seat, DG de Renault (juil. 2020 - juil. 2025), " +
      "PDG de Kering depuis 2025.",
    verifiee: true,
  },
  pr_provost: {
    url: 'https://media.renaultgroup.com/renault-group-appoints-francois-provost-as-chief-executive-officer-and-director/',
    titre: "Renault Group appoints François Provost as Chief Executive Officer and Director",
    media: 'Renault Group (communiqué officiel)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2025-07-30'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Renault Group',
    description:
      "Communiqué officiel du 30 juillet 2025 : François Provost nommé DG de Renault " +
      "à compter du 31 juillet 2025, succédant à Luca de Meo parti chez Kering.",
    verifiee: true,
  },
  wp_delbos: {
    url: 'https://en.wikipedia.org/wiki/Clotilde_Delbos',
    titre: 'Clotilde Delbos — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "DGD et DFO de Renault ; administratrice indépendante d'AXA (depuis 2021) et de Sanofi " +
      "(depuis avril 2024). Interlock documenté AXA-Sanofi-Renault.",
    verifiee: true,
  },

  // ── Safran ─────────────────────────────────────────────────────────────────
  gov_safran: {
    url: 'https://www.safran-group.com/group/profile/governance',
    titre: "Governance — Safran Group (site officiel)",
    media: 'Safran (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Safran',
    description:
      "Page gouvernance Safran : Ross McInnes président du CA, Olivier Andriès DG depuis " +
      "le 1er janvier 2021. Conseil de 12 membres dont 9 indépendants.",
    verifiee: true,
  },
  wp_mcinnes: {
    url: 'https://en.wikipedia.org/wiki/Ross_McInnes',
    titre: 'Ross McInnes — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Sciences Po + INSEAD ; DFO de Pechiney, PPR et Thomson ; président du CA de " +
      "Safran depuis 2015 ; administrateur d'Engie.",
    verifiee: true,
  },
  pr_andries: {
    url: 'https://www.safran-group.com/pressroom/safrans-board-directors-appoints-olivier-andries-chief-executive-officer-safran-january-1-2021-2020-12-16',
    titre: "Safran appoints Olivier Andriès CEO as of January 1, 2021",
    media: 'Safran (communiqué officiel)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2020-12-16'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Safran',
    description:
      "Communiqué officiel du 16 décembre 2020 : Olivier Andriès nommé directeur général " +
      "de Safran à compter du 1er janvier 2021.",
    verifiee: true,
  },

  // ── Saint-Gobain ───────────────────────────────────────────────────────────
  gov_saintgobain: {
    url: 'https://www.saint-gobain.com/en/group/corporate-governance/board-directors-and-committees',
    titre: "Board of Directors and Committees — Saint-Gobain (site officiel)",
    media: 'Saint-Gobain (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-06-05'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Compagnie de Saint-Gobain',
    description:
      "Page gouvernance Saint-Gobain après AG du 5 juin 2026 : Benoît Bazin PDG ; " +
      "Jean-François Cirelli vice-président et administrateur référent.",
    verifiee: true,
  },
  pr_bazin_pdg: {
    url: 'https://www.saint-gobain.com/en/news/saint-gobains-board-directors-proposes-renewal-benoit-bazins-mandate-and-appointment-three-new',
    titre: "Saint-Gobain Board proposes renewal of Benoît Bazin as PDG — Saint-Gobain",
    media: 'Saint-Gobain (communiqué officiel)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2024-06-06'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Compagnie de Saint-Gobain',
    description:
      "Communiqué confirmant Benoît Bazin PDG depuis le 6 juin 2024 (cumul président CA " +
      "et DG) et Jean-François Cirelli vice-président et administrateur référent.",
    verifiee: true,
  },
  wp_bazin: {
    url: 'https://en.wikipedia.org/wiki/Beno%C3%AEt_Bazin',
    titre: 'Benoît Bazin — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Polytechnique + Ponts ParisTech + MIT ; Saint-Gobain depuis 2002, DG depuis " +
      "juil. 2021, PDG (cumul) depuis juin 2024.",
    verifiee: true,
  },
  wp_chalendar: {
    url: 'https://en.wikipedia.org/wiki/Pierre-Andr%C3%A9_de_Chalendar',
    titre: 'Pierre-André de Chalendar — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "ESSEC + ENA ; PDG Saint-Gobain (2010-2021), président CA (2021-2024) ; " +
      "administrateur de BNP Paribas depuis 2021.",
    verifiee: true,
  },

  // ── Schneider Electric ─────────────────────────────────────────────────────
  gov_schneider: {
    url: 'https://www.se.com/ww/en/about-us/governance/board-of-directors/',
    titre: "Board of Directors — Schneider Electric (site officiel)",
    media: 'Schneider Electric (site officiel)',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'France',
    datePublication: new Date('2026-05-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'Schneider Electric',
    description:
      "Page gouvernance Schneider Electric : Jean-Pascal Tricoire président non exécutif du " +
      "CA depuis mai 2023 ; Olivier Blum DG depuis novembre 2024.",
    verifiee: true,
  },
  wp_tricoire: {
    url: 'https://en.wikipedia.org/wiki/Jean-Pascal_Tricoire',
    titre: 'Jean-Pascal Tricoire — Wikipedia (EN)',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "ESC Bordeaux-Échanges ; CEO de Schneider Electric (2006-2023) ; président non " +
      "exécutif du CA depuis mai 2023.",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe (ADR-002). aRef/bRef = wikidataId des entités.
// typeLienCode ADMINISTRATEUR ou DIRIGEANT selon le rôle.
// ---------------------------------------------------------------------------

const LIENS = [
  // ══════════════════════════════════════════════════════════════════════════
  // Orange
  // ══════════════════════════════════════════════════════════════════════════

  {
    // Jacques Aschenbroich — président non exécutif du CA
    // INTERLOCK : même personne au CA de TotalEnergies (pilote) et BNP Paribas (pilote)
    aType: 'personne',
    aRef: 'Q3158153',
    bType: 'organisation',
    bRef: 'Q1431486',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Jacques Aschenbroich est président du conseil d'administration d'Orange depuis " +
      "avril 2022, dans le cadre d'une gouvernance dissociée (DG : Christel Heydemann). " +
      "INTERLOCK : siège simultanément au CA de TotalEnergies (admin. référent) et BNP Paribas.",
    dateDebut: new Date('2022-04-04'),
    dateFin: null,
    sourceRef: 'gov_orange',
  },
  {
    // Christel Heydemann — directrice générale (exec.)
    aType: 'personne',
    aRef: 'Q33112117',
    bType: 'organisation',
    bRef: 'Q1431486',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Christel Heydemann est administratrice et directrice générale d'Orange depuis le " +
      "4 avril 2022, succédant à Stéphane Richard démissionnaire.",
    dateDebut: new Date('2022-04-04'),
    dateFin: null,
    sourceRef: 'gov_orange',
  },
  {
    aType: 'personne',
    aRef: 'Q33112117',
    bType: 'organisation',
    bRef: 'Q1431486',
    typeLienCode: 'DIRIGEANT',
    description:
      "Christel Heydemann est directrice générale d'Orange depuis le 4 avril 2022, " +
      "dans une gouvernance dissociée avec Jacques Aschenbroich président non exécutif.",
    dateDebut: new Date('2022-04-04'),
    dateFin: null,
    sourceRef: 'wp_heydemann',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Pernod Ricard
  // ══════════════════════════════════════════════════════════════════════════

  {
    // Alexandre Ricard — PDG (cumul président CA + DG)
    aType: 'personne',
    aRef: 'Q19291561',
    bType: 'organisation',
    bRef: 'Q837049',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Alexandre Ricard est administrateur et PDG de Pernod Ricard depuis le 11 février " +
      "2015, cumulant les fonctions de président du conseil d'administration et de " +
      "directeur général.",
    dateDebut: new Date('2015-02-11'),
    dateFin: null,
    sourceRef: 'gov_pernod',
  },
  {
    aType: 'personne',
    aRef: 'Q19291561',
    bType: 'organisation',
    bRef: 'Q837049',
    typeLienCode: 'DIRIGEANT',
    description:
      "Alexandre Ricard est PDG (président-directeur général) de Pernod Ricard depuis " +
      "le 11 février 2015, succédant à Pierre Pringuet.",
    dateDebut: new Date('2015-02-11'),
    dateFin: null,
    sourceRef: 'wp_alexandre_ricard',
  },
  {
    // Patricia Barbizet — administratrice référente indépendante
    aType: 'personne',
    aRef: 'Q3369080',
    bType: 'organisation',
    bRef: 'Q837049',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Patricia Barbizet est administratrice indépendante de Pernod Ricard depuis 2018 " +
      "et administratrice référente depuis le 23 janvier 2019.",
    dateDebut: new Date('2018-11-01'),
    dateFin: null,
    sourceRef: 'gov_pernod',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Publicis Groupe
  // ══════════════════════════════════════════════════════════════════════════

  {
    // Arthur Sadoun — PDG (cumul)
    aType: 'personne',
    aRef: 'Q2865328',
    bType: 'organisation',
    bRef: 'Q1537378',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Arthur Sadoun est administrateur et PDG de Publicis Groupe depuis le 1er juin 2017, " +
      "cumulant les fonctions de président du conseil d'administration et de directeur général.",
    dateDebut: new Date('2017-06-01'),
    dateFin: null,
    sourceRef: 'gov_publicis',
  },
  {
    aType: 'personne',
    aRef: 'Q2865328',
    bType: 'organisation',
    bRef: 'Q1537378',
    typeLienCode: 'DIRIGEANT',
    description:
      "Arthur Sadoun est PDG de Publicis Groupe depuis le 1er juin 2017, succédant à " +
      "Maurice Lévy qui avait dirigé le groupe pendant trente ans.",
    dateDebut: new Date('2017-06-01'),
    dateFin: null,
    sourceRef: 'wp_sadoun',
  },
  {
    // Élisabeth Badinter — vice-présidente du CA
    aType: 'personne',
    aRef: 'Q274309',
    bType: 'organisation',
    bRef: 'Q1537378',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Élisabeth Badinter est vice-présidente du conseil d'administration de Publicis Groupe, " +
      "dont elle est actionnaire de référence en tant qu'héritière du fondateur Marcel " +
      "Bleustein-Blanchet.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'gov_publicis',
  },
  {
    // Tidjane Thiam — administrateur indépendant
    aType: 'personne',
    aRef: 'Q3528191',
    bType: 'organisation',
    bRef: 'Q1537378',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Tidjane Thiam est administrateur indépendant de Publicis Groupe, apportant son " +
      "expertise en banque internationale et marchés financiers mondiaux.",
    dateDebut: null,
    dateFin: null,
    sourceRef: 'gov_publicis',
  },
  {
    // Maurice Lévy — PDG historique (lien DIRIGEANT terminé en 2017)
    // NB : Lévy est désormais président d'honneur, sans siège au CA.
    aType: 'personne',
    aRef: 'Q1347130',
    bType: 'organisation',
    bRef: 'Q1537378',
    typeLienCode: 'DIRIGEANT',
    description:
      "Maurice Lévy a dirigé Publicis Groupe comme PDG de 1987 à 2017, transformant " +
      "l'agence en troisième réseau publicitaire mondial. Il est depuis président d'honneur, " +
      "sans mandat d'administrateur.",
    dateDebut: new Date('1987-01-01'),
    dateFin: new Date('2017-05-31'),
    sourceRef: 'wp_levy',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Renault
  // ══════════════════════════════════════════════════════════════════════════

  {
    // Jean-Dominique Senard — président non exécutif du CA
    aType: 'personne',
    aRef: 'Q1684801',
    bType: 'organisation',
    bRef: 'Q6686',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Jean-Dominique Senard est président du conseil d'administration de Renault depuis " +
      "le 24 janvier 2019, dans le cadre d'une gouvernance dissociée instaurée après la " +
      "crise Ghosn-Nissan.",
    dateDebut: new Date('2019-01-24'),
    dateFin: null,
    sourceRef: 'gov_renault',
  },
  {
    // Clotilde Delbos — DGD/CFO (exec.)
    // INTERLOCK : même personne au CA d'AXA (pilote) et de Sanofi (pilote)
    aType: 'personne',
    aRef: 'Q48441071',
    bType: 'organisation',
    bRef: 'Q6686',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Clotilde Delbos est administratrice et directrice générale déléguée de Renault " +
      "depuis juillet 2020. INTERLOCK : siège simultanément au CA d'AXA (depuis 2021) " +
      "et de Sanofi (depuis 2024).",
    dateDebut: new Date('2020-07-01'),
    dateFin: null,
    sourceRef: 'gov_renault',
  },
  {
    aType: 'personne',
    aRef: 'Q48441071',
    bType: 'organisation',
    bRef: 'Q6686',
    typeLienCode: 'DIRIGEANT',
    description:
      "Clotilde Delbos est directrice générale déléguée (DGD) et directrice financière " +
      "de Renault depuis juillet 2020, dans la gouvernance dissociée Senard/Delbos.",
    dateDebut: new Date('2020-07-01'),
    dateFin: null,
    sourceRef: 'wp_delbos',
  },
  {
    // Luca de Meo — DG 2020-2025 (historique, terminé)
    aType: 'personne',
    aRef: 'Q3264974',
    bType: 'organisation',
    bRef: 'Q6686',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Luca de Meo a été administrateur et directeur général de Renault de juillet 2020 " +
      "à juillet 2025. Il a lancé la marque électrique Ampere et restructuré le groupe.",
    dateDebut: new Date('2020-07-01'),
    dateFin: new Date('2025-07-31'),
    sourceRef: 'pr_provost',
  },
  {
    aType: 'personne',
    aRef: 'Q3264974',
    bType: 'organisation',
    bRef: 'Q6686',
    typeLienCode: 'DIRIGEANT',
    description:
      "Luca de Meo a été directeur général de Renault de juillet 2020 à juillet 2025, " +
      "avant de prendre la direction de Kering. Succédé par François Provost.",
    dateDebut: new Date('2020-07-01'),
    dateFin: new Date('2025-07-31'),
    sourceRef: 'wp_demeo',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Safran
  // ══════════════════════════════════════════════════════════════════════════

  {
    // Ross McInnes — président non exécutif du CA
    aType: 'personne',
    aRef: 'Q18638252',
    bType: 'organisation',
    bRef: 'Q1886126',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Ross McInnes est président du conseil d'administration de Safran depuis 2015. " +
      "Il préside le comité des rémunérations et le comité de gouvernance.",
    dateDebut: new Date('2015-04-23'),
    dateFin: null,
    sourceRef: 'gov_safran',
  },
  {
    // Olivier Andriès — directeur général (exec.)
    aType: 'personne',
    aRef: 'Q32588324',
    bType: 'organisation',
    bRef: 'Q1886126',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Olivier Andriès est administrateur et directeur général de Safran depuis le " +
      "1er janvier 2021, dans une gouvernance dissociée avec Ross McInnes président du CA.",
    dateDebut: new Date('2021-01-01'),
    dateFin: null,
    sourceRef: 'pr_andries',
  },
  {
    aType: 'personne',
    aRef: 'Q32588324',
    bType: 'organisation',
    bRef: 'Q1886126',
    typeLienCode: 'DIRIGEANT',
    description:
      "Olivier Andriès est directeur général de Safran depuis le 1er janvier 2021, " +
      "succédant à Philippe Petitcolin. Il accélère la stratégie aéronautique et défense.",
    dateDebut: new Date('2021-01-01'),
    dateFin: null,
    sourceRef: 'gov_safran',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Saint-Gobain
  // ══════════════════════════════════════════════════════════════════════════

  {
    // Benoît Bazin — PDG (cumul depuis juin 2024)
    aType: 'personne',
    aRef: 'Q33161719',
    bType: 'organisation',
    bRef: 'Q678565',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Benoît Bazin est administrateur et PDG de Saint-Gobain depuis le 6 juin 2024 " +
      "(cumul des fonctions de président du CA et de directeur général). DG depuis " +
      "juillet 2021, il a succédé à Pierre-André de Chalendar à la présidence du CA.",
    dateDebut: new Date('2021-07-01'),
    dateFin: null,
    sourceRef: 'pr_bazin_pdg',
  },
  {
    aType: 'personne',
    aRef: 'Q33161719',
    bType: 'organisation',
    bRef: 'Q678565',
    typeLienCode: 'DIRIGEANT',
    description:
      "Benoît Bazin est PDG (président-directeur général) de Saint-Gobain depuis le " +
      "6 juin 2024, cumulant la présidence du conseil et la direction générale.",
    dateDebut: new Date('2024-06-06'),
    dateFin: null,
    sourceRef: 'wp_bazin',
  },
  {
    // Jean-François Cirelli — VP et administrateur référent indépendant (depuis juin 2024)
    aType: 'personne',
    aRef: 'Q3165536',
    bType: 'organisation',
    bRef: 'Q678565',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Jean-François Cirelli est administrateur de Saint-Gobain depuis 2020 et " +
      "vice-président du conseil ainsi qu'administrateur référent indépendant depuis " +
      "le 6 juin 2024, date du basculement vers le cumul PDG.",
    dateDebut: new Date('2020-06-04'),
    dateFin: null,
    sourceRef: 'pr_bazin_pdg',
  },
  {
    // Pierre-André de Chalendar — ancien président CA (historique, terminé en juin 2024)
    // INTERLOCK : même personne au CA de BNP Paribas (pilote)
    aType: 'personne',
    aRef: 'Q1518898',
    bType: 'organisation',
    bRef: 'Q678565',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Pierre-André de Chalendar a été président non exécutif du conseil de Saint-Gobain " +
      "de mai 2021 au 6 juin 2024, date à laquelle Benoît Bazin a pris le cumul des " +
      "fonctions de PDG. INTERLOCK : administrateur de BNP Paribas depuis 2021.",
    dateDebut: new Date('2021-05-05'),
    dateFin: new Date('2024-06-06'),
    sourceRef: 'wp_chalendar',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Schneider Electric
  // ══════════════════════════════════════════════════════════════════════════

  {
    // Jean-Pascal Tricoire — président non exécutif du CA (depuis mai 2023)
    aType: 'personne',
    aRef: 'Q3168302',
    bType: 'organisation',
    bRef: 'Q49053',
    typeLienCode: 'ADMINISTRATEUR',
    description:
      "Jean-Pascal Tricoire est président non exécutif du conseil d'administration de " +
      "Schneider Electric depuis mai 2023, date à laquelle il a cédé les fonctions " +
      "exécutives à Peter Herweck (puis Olivier Blum en novembre 2024).",
    dateDebut: new Date('2023-05-11'),
    dateFin: null,
    sourceRef: 'gov_schneider',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents — recopiés verbatim de seed-cac40-pilote.js
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-cac40-b4] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-cac40-b4] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données CAC 40 B4 précédentes...')
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
  console.log(`\n┌─ seed-cac40-b4 — Conseils d'administration CAC 40 (7 sociétés) ──────┐\n`)
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('— Sources publiques —')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  + ${data.titre}`)
  }

  console.log('\n— Personnes (Wikidata) —')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  + ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n— Organisations (Wikidata) —')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  + ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n— Liens —')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  + ${lien.typeLienCode} | ${lien.aRef} → ${lien.bRef}`)
  }

  console.log('\n┌─ Bilan ──────────────────────────────────────────────────────────────┐')
  console.log(`│ Personnes     : ${PERSONNES.length} (dont 3 partagées avec le pilote)`)
  console.log(`│ Organisations : ${ORGANISATIONS.length} (Orange, Pernod Ricard, Publicis, Renault, Safran, Saint-Gobain, Schneider)`)
  console.log(`│ Sources       : ${Object.keys(SOURCES).length}`)
  console.log(`│ Liens         : ${LIENS.length} (ADMINISTRATEUR + DIRIGEANT)`)
  console.log(`│`)
  console.log(`│ INTERLOCKS avec le pilote (B1) :`)
  console.log(`│   Aschenbroich (Q3158153) : Orange + TotalEnergies + BNP Paribas  [triple]`)
  console.log(`│   Delbos (Q48441071)      : Renault + AXA + Sanofi               [triple]`)
  console.log(`│   de Chalendar (Q1518898) : Saint-Gobain (hist.) + BNP Paribas   [double]`)
  console.log(`│`)
  console.log(`│ INTERLOCKS hors corpus (à enrichir) :`)
  console.log(`│   Bazin (Q33161719)  : Saint-Gobain PDG + Vinci (admin)`)
  console.log(`│   Andriès (Q32588324): Safran DG + Veolia (admin depuis 2023)`)
  console.log(`│   McInnes (Q18638252): Safran CA + Engie (admin)`)
  console.log('└───────────────────────────────────────────────────────────────────────┘\n')
}

main()
  .catch((err) => {
    console.error('[seed-cac40-b4] Échec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
