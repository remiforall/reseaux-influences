/**
 * Seed Hollande — enquête OSINT du 2026-06-30.
 *
 * Périmètre : François Hollande (Président 2012-2017), ses 3 Premiers ministres
 *             (Ayrault I & II, Valls I & II, Cazeneuve), 11 ministres marquants
 *             et les organisations de la coalition gouvernementale.
 *
 * Sources : Wikidata (Q-ids tous vérifiés via wbsearchentities + Special:EntityData),
 *           Wikipédia FR, Légifrance (JORF décret 21 juin 2012 vérifié).
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire sur chaque personne
 *   - idempotent (upsert par wikidataId)
 *
 * Q-ids vérifiés :
 *   Q157 Hollande, Q7711 Ayrault, Q10287 Valls, Q560890 Cazeneuve,
 *   Q217070 Fabius, Q713296 Sapin, Q356919 Moscovici, Q268675 Taubira,
 *   Q268529 Vallaud-Belkacem, Q81923 Royal, Q559040 Le Drian,
 *   Q737311 Montebourg, Q818118 Hamon, Q3052772 Macron,
 *   Q170972 PS, Q613786 EELV, Q427965 PRG.
 *
 * Usage :
 *   cd backend && node bin/seed-hollande.js
 *   cd backend && node bin/seed-hollande.js --reset
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
    // Sources : Wikidata Q157 + Wikipédia FR (François Hollande) + Présidence Hollande (Wikipédia FR)
    nom: 'Hollande',
    prenom: 'François',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1954-08-12'),
    lieuNaissance: 'Rouen (Seine-Maritime)',
    rolePrincipal: 'Président de la République française (2012-2017)',
    rolesSecondaires: [
      'premier secrétaire du Parti socialiste (1997-2008)',
      'député de Corrèze (1988-2012)',
      'président du conseil général de Corrèze (2008-2012)',
    ],
    bio:
      "Énarque et Sciences Po, François Hollande dirige le Parti socialiste de 1997 à 2008. " +
      "Élu président de la République le 6 mai 2012, il nomme trois Premiers ministres successifs " +
      "(Ayrault, Valls, Cazeneuve) et préside la COP21 (Accord de Paris, 2015). " +
      "Il renonce à se représenter en décembre 2016, premier président sous la Ve République à ne pas solliciter sa réélection.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Hollande',
    wikidataId: 'Q157',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q7711 + Wikipédia FR (Jean-Marc Ayrault) + JORF décret 21 juin 2012
    nom: 'Ayrault',
    prenom: 'Jean-Marc',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1950-01-26'),
    lieuNaissance: 'Maulévrier (Maine-et-Loire)',
    rolePrincipal: 'Premier ministre (2012-2014)',
    rolesSecondaires: [
      "président du groupe PS à l'Assemblée nationale (1997-2012)",
      'maire de Nantes (1989-2012)',
      "ministre des Affaires étrangères (2016, sous Valls II puis Cazeneuve)",
    ],
    bio:
      "Professeur d'allemand de formation, Jean-Marc Ayrault préside le groupe socialiste à l'AN pendant quinze ans. " +
      "Nommé Premier ministre le 16 mai 2012, il forme deux gouvernements (Ayrault I et II) " +
      "jusqu'au 31 mars 2014. Il revient comme ministre des Affaires étrangères en février 2016.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Marc_Ayrault',
    wikidataId: 'Q7711',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q10287 + Wikipédia FR (Manuel Valls) + Gouvernement Valls II (Wikipédia FR)
    nom: 'Valls',
    prenom: 'Manuel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1962-08-13'),
    lieuNaissance: 'Barcelone, Espagne',
    rolePrincipal: 'Premier ministre (2014-2016)',
    rolesSecondaires: [
      "ministre de l'Intérieur (2012-2014)",
      "député de l'Essonne (2002-2012)",
      "maire d'Évry (2001-2012)",
    ],
    bio:
      "Né à Barcelone, naturalisé français, Manuel Valls est ministre de l'Intérieur sous Ayrault (2012-2014) " +
      "avant d'être nommé Premier ministre le 31 mars 2014. Il forme deux gouvernements (Valls I et II) " +
      "jusqu'au 6 décembre 2016, menant une politique économique dite de l'offre et les réformes du Code du travail.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Manuel_Valls',
    wikidataId: 'Q10287',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q560890 + Wikipédia FR (Bernard Cazeneuve) + Gouvernement Cazeneuve (Wikipédia FR)
    nom: 'Cazeneuve',
    prenom: 'Bernard',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1963-06-02'),
    lieuNaissance: 'Senlis (Oise)',
    rolePrincipal: 'Premier ministre (2016-2017)',
    rolesSecondaires: [
      "ministre de l'Intérieur (2014-2016)",
      'ministre délégué chargé du Budget (2012-2014)',
      'député de la Manche (2002-2014)',
    ],
    bio:
      "Énarque et élu normand, Bernard Cazeneuve est ministre délégué au Budget puis ministre de l'Intérieur " +
      "sous les gouvernements Ayrault et Valls. Nommé Premier ministre le 6 décembre 2016 " +
      "après la démission de Valls pour la primaire PS, il assure la fin du quinquennat jusqu'au 15 mai 2017.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Bernard_Cazeneuve',
    wikidataId: 'Q560890',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q217070 + Wikipédia FR (Laurent Fabius) + Gouvernement Ayrault II (Wikipédia FR)
    nom: 'Fabius',
    prenom: 'Laurent',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1946-08-20'),
    lieuNaissance: 'Paris',
    rolePrincipal: 'Ministre des Affaires étrangères et du Développement international (2012-2016)',
    rolesSecondaires: [
      'président du Conseil constitutionnel (depuis mars 2016)',
      'Premier ministre (1984-1986)',
      "président de l'Assemblée nationale (1988-1992, 1997-2000)",
    ],
    bio:
      "Énarque et figure historique du PS, Laurent Fabius a été le plus jeune Premier ministre de la Ve République (1984). " +
      "Sous Hollande, il dirige le Quai d'Orsay de mai 2012 à février 2016, présidant la COP21 " +
      "et l'adoption de l'Accord de Paris (décembre 2015). Il devient président du Conseil constitutionnel en mars 2016.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Laurent_Fabius',
    wikidataId: 'Q217070',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q713296 + Wikipédia FR (Michel Sapin) + Gouvernement Valls II (Wikipédia FR)
    nom: 'Sapin',
    prenom: 'Michel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1952-04-09'),
    lieuNaissance: 'Boulogne-Billancourt (Hauts-de-Seine)',
    rolePrincipal: 'Ministre des Finances et des Comptes publics (2014-2017)',
    rolesSecondaires: [
      "ministre du Travail, de l'Emploi et de la Formation professionnelle (2012-2014)",
      "ministre de l'Économie et des Finances (1992-1993)",
      'garde des Sceaux (2000-2002)',
    ],
    bio:
      "Énarque et compagnon de route de Hollande depuis Sciences Po, Michel Sapin est ministre du Travail " +
      "sous Ayrault (2012-2014), puis ministre des Finances sous Valls I & II et Cazeneuve (2014-2017). " +
      "Il porte la loi Sapin II de transparence et de lutte contre la corruption (décembre 2016).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Michel_Sapin',
    wikidataId: 'Q713296',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q356919 + Wikipédia FR (Pierre Moscovici) + Gouvernement Ayrault II (Wikipédia FR)
    nom: 'Moscovici',
    prenom: 'Pierre',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1957-09-16'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Ministre de l'Économie et des Finances (2012-2014)",
    rolesSecondaires: [
      "commissaire européen aux Affaires économiques et financières (2014-2019)",
      "directeur de campagne d'Hollande (2012)",
      'député du Doubs (1997-2012)',
    ],
    bio:
      "Ancien élève de l'ENS et de l'ENA, Pierre Moscovici dirige la campagne présidentielle de Hollande en 2012 " +
      "avant d'être nommé ministre de l'Économie et des Finances. " +
      "Il quitte le gouvernement en avril 2014 pour devenir commissaire européen à Bruxelles, chargé des affaires économiques et financières.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Pierre_Moscovici',
    wikidataId: 'Q356919',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q268675 + Wikipédia FR (Christiane Taubira) + Gouvernement Ayrault II (Wikipédia FR)
    nom: 'Taubira',
    prenom: 'Christiane',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1952-02-02'),
    lieuNaissance: 'Cayenne (Guyane française)',
    rolePrincipal: 'Garde des Sceaux, ministre de la Justice (2012-2016)',
    rolesSecondaires: [
      "candidate à l'élection présidentielle de 2002 (Parti radical de gauche)",
      'fondatrice du mouvement Walwari (Guyane, 1993)',
      'députée de Guyane (1993-2012)',
    ],
    bio:
      "Christiane Taubira, figure de la gauche guyanaise affiliée au PRG, est Garde des Sceaux de mai 2012 à janvier 2016. " +
      "Elle porte la loi ouvrant le mariage aux couples de même sexe (promulguée le 17 mai 2013, dite « loi Taubira »). " +
      "Elle démissionne le 27 janvier 2016 en protestation contre le projet de déchéance de nationalité.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Christiane_Taubira',
    wikidataId: 'Q268675',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q268529 + Wikipédia FR (Najat Vallaud-Belkacem) + Gouvernement Valls II (Wikipédia FR)
    nom: 'Vallaud-Belkacem',
    prenom: 'Najat',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1977-10-04'),
    lieuNaissance: 'Béni-Chiker, Maroc',
    rolePrincipal: "Ministre de l'Éducation nationale (2014-2017)",
    rolesSecondaires: [
      "ministre des Droits des femmes et porte-parole du gouvernement (2012-2014)",
      'première femme ministre de l\'Éducation nationale en France',
      'députée du Rhône (2012-2017)',
    ],
    bio:
      "Arrivée en France à l'âge de quatre ans, Sciences Po Grenoble, Najat Vallaud-Belkacem est d'abord " +
      "ministre des Droits des femmes (2012-2014), puis première femme nommée ministre de l'Éducation nationale (août 2014). " +
      "Elle porte la réforme du collège (2015) jusqu'à la fin du quinquennat en mai 2017.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Najat_Vallaud-Belkacem',
    wikidataId: 'Q268529',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q81923 + Wikipédia FR (Ségolène Royal) + Gouvernement Valls II (Wikipédia FR)
    nom: 'Royal',
    prenom: 'Ségolène',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1953-09-22'),
    lieuNaissance: 'Dakar, Sénégal',
    rolePrincipal: "Ministre de l'Écologie, du Développement durable et de l'Énergie (2014-2017)",
    rolesSecondaires: [
      "candidate PS à l'élection présidentielle de 2007",
      'présidente du conseil régional de Poitou-Charentes (2004-2014)',
      "ministre déléguée à l'Enseignement scolaire (1997-2002)",
    ],
    bio:
      "ENA et Conseil d'État, Ségolène Royal a été candidate PS à la présidentielle de 2007. " +
      "Nommée ministre de l'Écologie et de l'Énergie dans le gouvernement Valls II (août 2014), " +
      "elle porte la loi de transition énergétique pour la croissance verte (promulguée le 17 août 2015).",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/S%C3%A9gol%C3%A8ne_Royal',
    wikidataId: 'Q81923',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q559040 + Wikipédia FR (Jean-Yves Le Drian) + Présidence Hollande (Wikipédia FR)
    nom: 'Le Drian',
    prenom: 'Jean-Yves',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1947-06-30'),
    lieuNaissance: 'Lorient (Morbihan)',
    rolePrincipal: 'Ministre de la Défense (2012-2017)',
    rolesSecondaires: [
      "ministre des Affaires étrangères (2017-2022, sous Macron)",
      'président de la région Bretagne (2004-2017)',
      'député du Morbihan (1981-2004)',
    ],
    bio:
      "Historien de formation et élu breton, Jean-Yves Le Drian est l'un des piliers du quinquennat Hollande, " +
      "occupant le poste de ministre de la Défense de mai 2012 à mai 2017, à travers les trois gouvernements successifs " +
      "(Ayrault I & II, Valls I & II, Cazeneuve). Il conduit les opérations Serval puis Barkhane au Mali.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Jean-Yves_Le_Drian',
    wikidataId: 'Q559040',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q737311 + Wikipédia FR (Arnaud Montebourg) + Gouvernement Ayrault II (Wikipédia FR)
    nom: 'Montebourg',
    prenom: 'Arnaud',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1962-10-30'),
    lieuNaissance: 'Clamecy (Nièvre)',
    rolePrincipal: 'Ministre du Redressement productif (2012-2014)',
    rolesSecondaires: [
      "troisième de la primaire socialiste de 2011 (promoteur de la démondialisation)",
      'député de Saône-et-Loire (1997-2012)',
      "fondateur du mouvement Engagement citoyen (2015)",
    ],
    bio:
      "Avocat et élu bourguignon, Arnaud Montebourg arrive troisième de la primaire socialiste de 2011 " +
      "en portant un programme de « démondialisation ». Ministre du Redressement productif de 2012 à 2014, " +
      "il démissionne le 25 août 2014 après avoir publiquement critiqué la ligne économique du gouvernement Valls.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Arnaud_Montebourg',
    wikidataId: 'Q737311',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q818118 + Wikipédia FR (Benoît Hamon) + Gouvernement Ayrault II (Wikipédia FR)
    nom: 'Hamon',
    prenom: 'Benoît',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1967-06-26'),
    lieuNaissance: 'Brest (Finistère)',
    rolePrincipal: "Ministre délégué à l'Économie sociale et solidaire (2012-2014)",
    rolesSecondaires: [
      "candidat PS à l'élection présidentielle de 2017",
      "brièvement ministre de l'Éducation nationale (jan.-août 2014)",
      "fondateur du mouvement Génération.s (2017)",
    ],
    bio:
      "Issu de l'aile gauche du PS, Benoît Hamon est ministre délégué à l'Économie sociale et solidaire dès 2012, " +
      "puis brièvement ministre de l'Éducation nationale en 2014. Il démissionne le 25 août 2014 avec Arnaud Montebourg. " +
      "Vainqueur de la primaire PS 2017, il fonde ensuite le mouvement Génération.s.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Beno%C3%AEt_Hamon',
    wikidataId: 'Q818118',
    qualiteInfluence: 'ELU',
  },
  {
    // Sources : Wikidata Q3052772 + Wikipédia FR (Emmanuel Macron) + Gouvernement Valls II (Wikipédia FR)
    nom: 'Macron',
    prenom: 'Emmanuel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1977-12-21'),
    lieuNaissance: 'Amiens (Somme)',
    rolePrincipal: "Ministre de l'Économie, de l'Industrie et du Numérique (2014-2016)",
    rolesSecondaires: [
      'Président de la République depuis 2017',
      "fondateur d'En Marche (2016)",
      "conseiller à l'Élysée chargé des affaires économiques (2012-2014)",
      'ancien associé-gérant de Rothschild & Cie',
    ],
    bio:
      "Inspecteur des finances puis banquier (Rothschild & Cie), Emmanuel Macron est conseiller économique " +
      "à l'Élysée sous Hollande (2012-2014) avant d'être nommé ministre de l'Économie dans le gouvernement Valls II " +
      "le 26 août 2014. Il démissionne le 30 août 2016 pour fonder En Marche et remporte la présidentielle de 2017.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Emmanuel_Macron',
    wikidataId: 'Q3052772',
    qualiteInfluence: 'ELU',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q170972 + Wikipédia FR (Parti socialiste, France)
    nom: 'Parti socialiste',
    sigle: 'PS',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.parti-socialiste.fr',
    description:
      'Parti politique français fondé au congrès d\'Épinay en juin 1971. ' +
      'Force de gouvernement sous François Hollande (2012-2017), dont les gouvernements Ayrault, Valls et Cazeneuve. ' +
      'Premier secrétaire durant le quinquennat Hollande : Harlem Désir (2012-2014) puis Jean-Christophe Cambadélis (2014-2017).',
    dateCreation: new Date('1971-06-11'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Parti_socialiste_(France)',
    wikidataId: 'Q170972',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q613786 + Wikipédia FR (Les Écologistes – EELV)
    nom: 'Europe Écologie Les Verts',
    sigle: 'EELV',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.lesecologistes.fr',
    description:
      'Parti politique écologiste français fondé en 2010. ' +
      'Partenaire de coalition du PS lors du quinquennat Hollande (2012-2014) ; ' +
      'représenté notamment par Cécile Duflot et Pascal Canfin dans les gouvernements Ayrault I et II.',
    dateCreation: new Date('2010-11-13'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Les_%C3%89cologistes_%E2%80%93_EELV',
    wikidataId: 'Q613786',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q427965 + Wikipédia FR (Parti radical de gauche)
    nom: 'Parti radical de gauche',
    sigle: 'PRG',
    typeOrganisation: 'PARTI_POLITIQUE',
    pays: 'France',
    siteWeb: 'https://www.partiradicaledegauche.fr',
    description:
      'Parti politique français issu du Parti républicain radical et radical-socialiste. ' +
      'Allié du PS sous Hollande, représenté dans la majorité gouvernementale tout au long du quinquennat. ' +
      'Christiane Taubira, sa candidate à la présidentielle de 2002, a été Garde des Sceaux 2012-2016.',
    dateCreation: new Date('1972-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Parti_radical_de_gauche',
    wikidataId: 'Q427965',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-06-30).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_hollande: {
    url: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Hollande',
    titre: 'François Hollande — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Biographie : ENA, PS premier secrétaire 1997-2008, président de la République 2012-2017, COP21, Accord de Paris.',
    verifiee: true,
  },
  wp_presidence_hollande: {
    url: 'https://fr.wikipedia.org/wiki/Pr%C3%A9sidence_de_Fran%C3%A7ois_Hollande',
    titre: 'Présidence de François Hollande — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Bilan du quinquennat 2012-2017 : trois gouvernements (Ayrault, Valls, Cazeneuve), loi Taubira, COP21, réforme travail.',
    verifiee: true,
  },
  wp_ayrault: {
    url: 'https://fr.wikipedia.org/wiki/Jean-Marc_Ayrault',
    titre: 'Jean-Marc Ayrault — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Professeur d\'allemand, maire de Nantes 1989-2012, Premier ministre 16 mai 2012 - 31 mars 2014 (gouvernements Ayrault I et II).',
    verifiee: true,
  },
  wp_valls: {
    url: 'https://fr.wikipedia.org/wiki/Manuel_Valls',
    titre: 'Manuel Valls — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Né à Barcelone, ministre de l\'Intérieur 2012-2014, Premier ministre 31 mars 2014 - 6 décembre 2016 (Valls I et II).',
    verifiee: true,
  },
  wp_cazeneuve: {
    url: 'https://fr.wikipedia.org/wiki/Bernard_Cazeneuve',
    titre: 'Bernard Cazeneuve — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Énarque normand, ministre de l\'Intérieur 2014-2016, Premier ministre 6 décembre 2016 - 15 mai 2017.',
    verifiee: true,
  },
  wp_fabius: {
    url: 'https://fr.wikipedia.org/wiki/Laurent_Fabius',
    titre: 'Laurent Fabius — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Plus jeune PM de la Ve République (1984-1986), ministre des AE 2012-2016, président du Conseil constitutionnel depuis mars 2016.',
    verifiee: true,
  },
  wp_sapin: {
    url: 'https://fr.wikipedia.org/wiki/Michel_Sapin',
    titre: 'Michel Sapin — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Énarque, ministre du Travail 2012-2014, ministre des Finances 2014-2017, auteur de la loi Sapin II (2016).',
    verifiee: true,
  },
  wp_moscovici: {
    url: 'https://fr.wikipedia.org/wiki/Pierre_Moscovici',
    titre: 'Pierre Moscovici — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'ENS + ENA, directeur de campagne de Hollande (2012), ministre de l\'Économie 2012-2014, commissaire européen 2014-2019.',
    verifiee: true,
  },
  wp_taubira: {
    url: 'https://fr.wikipedia.org/wiki/Christiane_Taubira',
    titre: 'Christiane Taubira — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Candidate PRG à la présidentielle 2002, Garde des Sceaux 2012-2016, auteure de la loi sur le mariage pour tous (2013).',
    verifiee: true,
  },
  wp_vallaud_belkacem: {
    url: 'https://fr.wikipedia.org/wiki/Najat_Vallaud-Belkacem',
    titre: 'Najat Vallaud-Belkacem — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Première femme ministre de l\'Éducation nationale (2014-2017), auparavant ministre des Droits des femmes (2012-2014).',
    verifiee: true,
  },
  wp_royal: {
    url: 'https://fr.wikipedia.org/wiki/S%C3%A9gol%C3%A8ne_Royal',
    titre: 'Ségolène Royal — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Candidate PS à la présidentielle de 2007, ministre de l\'Écologie et de l\'Énergie 2014-2017, loi de transition énergétique 2015.',
    verifiee: true,
  },
  wp_le_drian: {
    url: 'https://fr.wikipedia.org/wiki/Jean-Yves_Le_Drian',
    titre: 'Jean-Yves Le Drian — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Ministre de la Défense 2012-2017 (toute la durée du quinquennat, trois gouvernements successifs), opérations Serval et Barkhane.',
    verifiee: true,
  },
  wp_montebourg: {
    url: 'https://fr.wikipedia.org/wiki/Arnaud_Montebourg',
    titre: 'Arnaud Montebourg — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Ministre du Redressement productif 2012-2014, démissionne le 25 août 2014 en critiquant la ligne économique du gouvernement.',
    verifiee: true,
  },
  wp_hamon: {
    url: 'https://fr.wikipedia.org/wiki/Beno%C3%AEt_Hamon',
    titre: 'Benoît Hamon — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Ministre ESS 2012-2014, démissionne le 25 août 2014 avec Montebourg, candidat PS à la présidentielle de 2017.',
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
      'Conseiller Élysée (2012-2014), ministre de l\'Économie 2014-2016, démission le 30 août 2016 pour fonder En Marche.',
    verifiee: true,
  },
  wp_ps: {
    url: 'https://fr.wikipedia.org/wiki/Parti_socialiste_(France)',
    titre: 'Parti socialiste (France) — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Historique du PS depuis le congrès d\'Épinay (1971), liste des premiers secrétaires incluant F. Hollande (1997-2008).',
    verifiee: true,
  },
  wp_eelv: {
    url: 'https://fr.wikipedia.org/wiki/Les_%C3%89cologistes_%E2%80%93_EELV',
    titre: 'Les Écologistes – EELV — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Parti fondé en 2010. Accord de gouvernement avec le PS en 2012 ; Cécile Duflot et Pascal Canfin dans les gouvernements Ayrault.',
    verifiee: true,
  },
  wp_prg: {
    url: 'https://fr.wikipedia.org/wiki/Parti_radical_de_gauche',
    titre: 'Parti radical de gauche — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Allié du PS sous Hollande ; Christiane Taubira, candidate PRG à la présidentielle 2002, Garde des Sceaux 2012-2016.',
    verifiee: true,
  },
  wp_gouv_ayrault_ii: {
    url: 'https://fr.wikipedia.org/wiki/Gouvernement_Ayrault_II',
    titre: 'Gouvernement Ayrault II — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Composition du gouvernement Ayrault II (21 juin 2012 - 31 mars 2014) : Fabius, Moscovici, Taubira, Le Drian, Sapin, Montebourg.',
    verifiee: true,
  },
  wp_gouv_valls_ii: {
    url: 'https://fr.wikipedia.org/wiki/Gouvernement_Valls_II',
    titre: 'Gouvernement Valls II — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Composition du gouvernement Valls II (26 août 2014 - 6 déc. 2016) : Macron (Économie), Royal (Écologie), Vallaud-Belkacem (Éducation).',
    verifiee: true,
  },
  wp_gouv_cazeneuve: {
    url: 'https://fr.wikipedia.org/wiki/Gouvernement_Cazeneuve',
    titre: 'Gouvernement Cazeneuve — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-06-30'),
    auteur: null,
    description:
      'Composition du gouvernement Cazeneuve (6 décembre 2016 - 15 mai 2017), dernier gouvernement du quinquennat Hollande.',
    verifiee: true,
  },
  jorf_ayrault_ii: {
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000026050285',
    titre: 'Décret du 21 juin 2012 relatif à la composition du Gouvernement',
    media: 'Légifrance (JORF)',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2012-06-21'),
    dateConsultation: new Date('2026-06-30'),
    auteur: 'Premier ministre',
    description:
      'Décret officiel de composition du gouvernement Ayrault II, formé le 21 juin 2012 après les élections législatives.',
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002), exactement 1 entité non-nulle de chaque côté.
// Chaque entité référencée possède un wikidataId (résolution via trouverEntite).
// ---------------------------------------------------------------------------

const LIENS = [
  // --- Nominations de Premiers ministres par Hollande ---
  {
    // P-P : Hollande nomme Ayrault Premier ministre
    aType: 'personne',
    aRef: 'Q157',
    bType: 'personne',
    bRef: 'Q7711',
    typeLienCode: 'politique',
    description:
      "François Hollande nomme Jean-Marc Ayrault Premier ministre le 16 mai 2012 " +
      "(gouvernements Ayrault I et II jusqu'au 31 mars 2014).",
    dateDebut: new Date('2012-05-16'),
    dateFin: new Date('2014-03-31'),
    sourceRef: 'wp_ayrault',
  },
  {
    // P-P : Hollande nomme Valls Premier ministre
    aType: 'personne',
    aRef: 'Q157',
    bType: 'personne',
    bRef: 'Q10287',
    typeLienCode: 'politique',
    description:
      "François Hollande nomme Manuel Valls Premier ministre le 31 mars 2014 " +
      "(gouvernements Valls I et II jusqu'au 6 décembre 2016).",
    dateDebut: new Date('2014-04-01'),
    dateFin: new Date('2016-12-06'),
    sourceRef: 'wp_valls',
  },
  {
    // P-P : Hollande nomme Cazeneuve Premier ministre
    aType: 'personne',
    aRef: 'Q157',
    bType: 'personne',
    bRef: 'Q560890',
    typeLienCode: 'politique',
    description:
      "François Hollande nomme Bernard Cazeneuve Premier ministre le 6 décembre 2016, " +
      "après la démission de Valls pour se présenter à la primaire PS. Fin du gouvernement : 15 mai 2017.",
    dateDebut: new Date('2016-12-06'),
    dateFin: new Date('2017-05-14'),
    sourceRef: 'wp_cazeneuve',
  },

  // --- Ministres des gouvernements Ayrault (lien au Premier ministre) ---
  {
    // P-P : Fabius ministre sous Ayrault (puis Valls jusqu'en fév. 2016)
    aType: 'personne',
    aRef: 'Q217070',
    bType: 'personne',
    bRef: 'Q7711',
    typeLienCode: 'politique',
    description:
      "Laurent Fabius est ministre des Affaires étrangères du gouvernement Ayrault II (juin 2012 - mars 2014), " +
      "puis maintenu dans les gouvernements Valls I et II jusqu'au 11 février 2016.",
    dateDebut: new Date('2012-05-16'),
    dateFin: new Date('2016-02-11'),
    sourceRef: 'wp_gouv_ayrault_ii',
  },
  {
    // P-P : Moscovici ministre sous Ayrault
    aType: 'personne',
    aRef: 'Q356919',
    bType: 'personne',
    bRef: 'Q7711',
    typeLienCode: 'politique',
    description:
      "Pierre Moscovici est ministre de l'Économie et des Finances du gouvernement Ayrault II " +
      "(21 juin 2012 - 1er avril 2014), avant de rejoindre la Commission européenne.",
    dateDebut: new Date('2012-06-21'),
    dateFin: new Date('2014-04-01'),
    sourceRef: 'wp_gouv_ayrault_ii',
  },
  {
    // P-P : Taubira ministre sous Ayrault (puis Valls jusqu'à démission jan. 2016)
    aType: 'personne',
    aRef: 'Q268675',
    bType: 'personne',
    bRef: 'Q7711',
    typeLienCode: 'politique',
    description:
      "Christiane Taubira est Garde des Sceaux du gouvernement Ayrault II (juin 2012 - mars 2014), " +
      "puis maintenue sous Valls I et II jusqu'à sa démission le 27 janvier 2016.",
    dateDebut: new Date('2012-05-16'),
    dateFin: new Date('2016-01-27'),
    sourceRef: 'wp_taubira',
  },
  {
    // P-P : Montebourg ministre sous Ayrault (démission août 2014)
    aType: 'personne',
    aRef: 'Q737311',
    bType: 'personne',
    bRef: 'Q7711',
    typeLienCode: 'politique',
    description:
      "Arnaud Montebourg est ministre du Redressement productif du gouvernement Ayrault II " +
      "(juin 2012 - mars 2014), puis brièvement sous Valls I avant de démissionner le 25 août 2014.",
    dateDebut: new Date('2012-06-21'),
    dateFin: new Date('2014-08-25'),
    sourceRef: 'wp_montebourg',
  },
  {
    // P-P : Hamon ministre sous Ayrault (démission août 2014)
    aType: 'personne',
    aRef: 'Q818118',
    bType: 'personne',
    bRef: 'Q7711',
    typeLienCode: 'politique',
    description:
      "Benoît Hamon est ministre délégué à l'Économie sociale et solidaire (puis à l'Éducation nationale) " +
      "dans les gouvernements Ayrault II et Valls I, jusqu'à sa démission le 25 août 2014 avec Montebourg.",
    dateDebut: new Date('2012-06-21'),
    dateFin: new Date('2014-08-25'),
    sourceRef: 'wp_hamon',
  },

  // --- Ministre de la Défense sur tout le quinquennat (lien direct à Hollande) ---
  {
    // P-P : Le Drian ministre sur toute la durée du quinquennat, rattaché à Hollande
    aType: 'personne',
    aRef: 'Q559040',
    bType: 'personne',
    bRef: 'Q157',
    typeLienCode: 'politique',
    description:
      "Jean-Yves Le Drian, ministre de la Défense nommé par François Hollande le 16 mai 2012, " +
      "occupe ce poste sans interruption à travers les gouvernements Ayrault, Valls et Cazeneuve, " +
      "jusqu'au 15 mai 2017.",
    dateDebut: new Date('2012-05-16'),
    dateFin: new Date('2017-05-14'),
    sourceRef: 'wp_le_drian',
  },

  // --- Ministres des gouvernements Valls (lien au Premier ministre Valls) ---
  {
    // P-P : Sapin ministre des Finances sous Valls (et Cazeneuve)
    aType: 'personne',
    aRef: 'Q713296',
    bType: 'personne',
    bRef: 'Q10287',
    typeLienCode: 'politique',
    description:
      "Michel Sapin, ministre du Travail sous Ayrault (2012-2014), est nommé ministre des Finances " +
      "dans le gouvernement Valls I (avril 2014), puis maintenu sous Valls II et Cazeneuve jusqu'en mai 2017.",
    dateDebut: new Date('2014-04-01'),
    dateFin: new Date('2017-05-14'),
    sourceRef: 'wp_gouv_valls_ii',
  },
  {
    // P-P : Vallaud-Belkacem ministre de l'Éducation sous Valls II
    aType: 'personne',
    aRef: 'Q268529',
    bType: 'personne',
    bRef: 'Q10287',
    typeLienCode: 'politique',
    description:
      "Najat Vallaud-Belkacem, ministre des Droits des femmes sous Ayrault (2012-2014), " +
      "est nommée ministre de l'Éducation nationale dans le gouvernement Valls II le 26 août 2014. " +
      "Elle conserve ce portefeuille jusqu'en mai 2017.",
    dateDebut: new Date('2014-08-26'),
    dateFin: new Date('2017-05-14'),
    sourceRef: 'wp_gouv_valls_ii',
  },
  {
    // P-P : Macron ministre de l'Économie sous Valls II
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'personne',
    bRef: 'Q10287',
    typeLienCode: 'politique',
    description:
      "Emmanuel Macron est nommé ministre de l'Économie, de l'Industrie et du Numérique " +
      "dans le gouvernement Valls II le 26 août 2014. Il démissionne le 30 août 2016 pour fonder En Marche.",
    dateDebut: new Date('2014-08-26'),
    dateFin: new Date('2016-08-30'),
    sourceRef: 'wp_macron',
  },
  {
    // P-P : Royal ministre de l'Écologie sous Valls II
    aType: 'personne',
    aRef: 'Q81923',
    bType: 'personne',
    bRef: 'Q10287',
    typeLienCode: 'politique',
    description:
      "Ségolène Royal est nommée ministre de l'Écologie, du Développement durable et de l'Énergie " +
      "dans le gouvernement Valls II le 26 août 2014. Elle porte la loi de transition énergétique (2015) " +
      "et reste en poste jusqu'en mai 2017.",
    dateDebut: new Date('2014-08-26'),
    dateFin: new Date('2017-05-14'),
    sourceRef: 'wp_gouv_valls_ii',
  },

  // --- Direction du Parti socialiste ---
  {
    // P-O : Hollande premier secrétaire du PS (1997-2008)
    aType: 'personne',
    aRef: 'Q157',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'DIRIGEANT',
    description:
      "François Hollande est élu premier secrétaire du Parti socialiste le 27 novembre 1997 (91 % des voix). " +
      "Il occupe cette fonction pendant onze ans, jusqu'au congrès de Reims le 25 novembre 2008 " +
      "où Martine Aubry lui succède.",
    dateDebut: new Date('1997-11-27'),
    dateFin: new Date('2008-11-25'),
    sourceRef: 'wp_ps',
  },

  // --- Affiliations partisanes ---
  {
    // P-O : Hollande affilié au PS
    aType: 'personne',
    aRef: 'Q157',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description: "François Hollande est membre du Parti socialiste depuis 1979, première secrétaire 1997-2008, candidat investi à la présidentielle de 2012.",
    dateDebut: new Date('1979-01-01'),
    dateFin: null,
    sourceRef: 'wp_hollande',
  },
  {
    // P-O : Ayrault affilié au PS
    aType: 'personne',
    aRef: 'Q7711',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description: "Jean-Marc Ayrault est membre du Parti socialiste, président du groupe PS à l'Assemblée nationale 1997-2012.",
    dateDebut: new Date('1977-01-01'),
    dateFin: null,
    sourceRef: 'wp_ayrault',
  },
  {
    // P-O : Valls affilié au PS
    aType: 'personne',
    aRef: 'Q10287',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description: "Manuel Valls est membre du Parti socialiste, élu maire d'Évry et député de l'Essonne sous étiquette PS avant d'en démissionner en 2017.",
    dateDebut: new Date('1985-01-01'),
    dateFin: new Date('2017-02-01'),
    sourceRef: 'wp_valls',
  },
  {
    // P-O : Cazeneuve affilié au PS
    aType: 'personne',
    aRef: 'Q560890',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description: "Bernard Cazeneuve est membre du Parti socialiste, élu sous étiquette PS dans la Manche, ministre et Premier ministre sous Hollande.",
    dateDebut: new Date('1985-01-01'),
    dateFin: null,
    sourceRef: 'wp_cazeneuve',
  },
  {
    // P-O : Fabius affilié au PS
    aType: 'personne',
    aRef: 'Q217070',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description: "Laurent Fabius est membre du Parti socialiste depuis les années 1970, Premier ministre PS (1984-1986), figure historique de la gauche française.",
    dateDebut: new Date('1974-01-01'),
    dateFin: null,
    sourceRef: 'wp_fabius',
  },
  {
    // P-O : Taubira affiliée au PRG
    aType: 'personne',
    aRef: 'Q268675',
    bType: 'organisation',
    bRef: 'Q427965',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Christiane Taubira est affiliée au Parti radical de gauche (PRG), dont elle est la candidate " +
      "à l'élection présidentielle de 2002 et vice-présidente de 2002 à 2004. " +
      "Elle est nommée Garde des Sceaux en 2012 dans le cadre de la coalition PS-PRG.",
    dateDebut: new Date('2002-01-01'),
    dateFin: null,
    sourceRef: 'wp_taubira',
  },
  {
    // P-O : Royal affiliée au PS
    aType: 'personne',
    aRef: 'Q81923',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description: "Ségolène Royal est membre du Parti socialiste, candidate PS à la présidentielle de 2007, ministre sous Hollande 2014-2017.",
    dateDebut: new Date('1978-01-01'),
    dateFin: null,
    sourceRef: 'wp_royal',
  },
  {
    // P-O : Macron affilié au PS (2006-2016)
    aType: 'personne',
    aRef: 'Q3052772',
    bType: 'organisation',
    bRef: 'Q170972',
    typeLienCode: 'AFFILIATION_PARTI',
    description:
      "Emmanuel Macron adhère au Parti socialiste en 2006, servant de rapporteur à la commission Attali. " +
      "Il démissionne du PS en avril 2016 lors du lancement d'En Marche, rompant avec son appartenance socialiste.",
    dateDebut: new Date('2006-01-01'),
    dateFin: new Date('2016-04-06'),
    sourceRef: 'wp_macron',
  },

  // --- Coalitions gouvernementales (Organisation à Organisation) ---
  {
    // O-O : PS en coalition avec EELV (gouvernements Ayrault)
    aType: 'organisation',
    aRef: 'Q170972',
    bType: 'organisation',
    bRef: 'Q613786',
    typeLienCode: 'politique',
    description:
      "Le Parti socialiste et EELV concluent un accord de gouvernement en 2012. " +
      "EELV est représenté dans les gouvernements Ayrault I et II (Cécile Duflot au Logement, Pascal Canfin au Développement) " +
      "avant de quitter la coalition en 2014.",
    dateDebut: new Date('2012-05-16'),
    dateFin: new Date('2014-04-01'),
    sourceRef: 'wp_eelv',
  },
  {
    // O-O : PS en coalition avec le PRG (tout le quinquennat)
    aType: 'organisation',
    aRef: 'Q170972',
    bType: 'organisation',
    bRef: 'Q427965',
    typeLienCode: 'politique',
    description:
      "Le Parti socialiste et le Parti radical de gauche forment une coalition gouvernementale " +
      "tout au long du quinquennat Hollande (2012-2017). Le PRG soutient la majorité et " +
      "Christiane Taubira (affiliée PRG) occupe le poste de Garde des Sceaux de 2012 à 2016.",
    dateDebut: new Date('2012-05-16'),
    dateFin: new Date('2017-05-14'),
    sourceRef: 'wp_prg',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-perso.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-hollande] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-hollande] Entité introuvable pour lien ${lien.typeLienCode} (aRef=${lien.aRef}, bRef=${lien.bRef})`,
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
  console.log('Suppression données Hollande précédentes...')
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
  console.log('\n-- seed-hollande — gouvernements Hollande 2012-2017 --\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`Utilisateur : ${user.email}\n`)

  console.log('--- Sources publiques ---')
  const sourcesMap = {}
  for (const [key, data] of Object.entries(SOURCES)) {
    sourcesMap[key] = await upsertSource(key)
    console.log(`  ok ${data.titre}`)
  }

  console.log('\n--- Personnes (Wikidata) ---')
  for (const p of PERSONNES) {
    const created = await upsertPersonne(p, user.id)
    console.log(`  ok ${created.prenom} ${created.nom} (${p.wikidataId})`)
  }

  console.log('\n--- Organisations (Wikidata) ---')
  for (const o of ORGANISATIONS) {
    const created = await upsertOrganisation(o, user.id)
    console.log(`  ok ${created.nom} (${o.wikidataId})`)
  }

  console.log('\n--- Liens ---')
  for (const lien of LIENS) {
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok ${lien.typeLienCode} -- ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n-- Bilan --------------------------------------------------------')
  console.log(`   Personnes     : ${PERSONNES.length}`)
  console.log(`   Organisations : ${ORGANISATIONS.length} (PS, EELV, PRG)`)
  console.log(`   Sources       : ${Object.keys(SOURCES).length} (Wikipedia FR + JORF Légifrance)`)
  console.log(`   Liens         : ${LIENS.length}`)
  console.log('   Types liens   : politique, AFFILIATION_PARTI, DIRIGEANT')
  console.log('-----------------------------------------------------------------\n')
}

main()
  .catch((err) => {
    console.error('[seed-hollande] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
