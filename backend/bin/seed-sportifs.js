/**
 * Seed Sportifs français top-tier — enquête OSINT du 2026-07-01.
 *
 * Périmètre : 10 sportifs de très haut niveau (football, basketball, rugby, judo),
 * clubs employeurs actuels et historiques emblématiques, sponsors confirmés par sources
 * officielles ou presse de référence.
 *
 * Sources : Wikidata (Q-ids vérifiés via wbsearchentities + EntityData),
 *           Wikipédia FR, sites officiels des clubs, communiqués de presse LVMH/Hublot,
 *           Filière Sport (Griezmann-Decathlon), Boardroom.tv (Wembanyama-Nike).
 *
 * Garde-fous projet :
 *   - toutes les entités importées en statut EN_ATTENTE (ADR-006 / ADR-010) — JAMAIS VALIDE auto
 *   - qualiteInfluence obligatoire : ARTISTE pour les sportifs professionnels (art public performatif)
 *   - idempotent (upsert par wikidataId)
 *   - sponsors uniquement si partenariat déclaré dans un communiqué officiel ou presse de référence
 *   - contrat Nike Mbappé : dateFin 2026-06-30 (expiration reportée, non-renouvellement documenté)
 *
 * Liens croisés avec des seeds existants :
 *   - LVMH (Q504998, seed-fortunes-1.js) : Hublot en est filiale (non re-seedé ici pour éviter dep.)
 *   - PSG (Q483020) et ASVEL (Q4089) apparaissent ici pour la première fois
 *
 * Usage :
 *   cd backend && node bin/seed-sportifs.js
 *   cd backend && node bin/seed-sportifs.js --reset
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
    // Sources : Wikidata Q21621995 + Wikipedia FR + realmadrid.com (présentation officielle 01/07/2024)
    nom: 'Mbappé',
    prenom: 'Kylian',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1998-12-20'),
    lieuNaissance: 'Bondy (Seine-Saint-Denis)',
    rolePrincipal: "Footballeur professionnel, attaquant du Real Madrid CF",
    rolesSecondaires: [
      "Capitaine de l'équipe de France de football",
      "Ambassadeur Hublot (depuis octobre 2018)",
      "Partenariat Nike (2007-2026, expiré)",
      "Ancien attaquant du Paris Saint-Germain (2017-2024)",
    ],
    bio:
      "Né à Bondy le 20 décembre 1998, Kylian Mbappé est formé à l'AS Monaco avant de rejoindre le PSG " +
      "en août 2017. Champion du monde 2018 avec la France (256 buts en 7 saisons au PSG), il signe au " +
      "Real Madrid en juillet 2024 en tant que joueur libre. Son contrat Nike, débuté à l'âge de 8 ans, " +
      "est arrivé à expiration le 30 juin 2026 sans renouvellement.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Kylian_Mbapp%C3%A9',
    wikidataId: 'Q21621995',
    qualiteInfluence: 'ARTISTE',
  },
  {
    // Sources : Wikidata Q455462 + Wikipedia FR + atleticodemadrid.com
    // NB : Griezmann est avec Decathlon/Kipsta depuis janv. 2025 (ex-Puma 2010-2024, jamais Adidas)
    nom: 'Griezmann',
    prenom: 'Antoine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1991-03-21'),
    lieuNaissance: 'Mâcon (Saône-et-Loire)',
    rolePrincipal: "Footballeur professionnel, attaquant de l'Atlético de Madrid",
    rolesSecondaires: [
      "Champion du monde 2018 avec l'équipe de France",
      "Ambassadeur Decathlon/Kipsta (depuis janvier 2025)",
      "Ancien joueur du FC Barcelone (2019-2021)",
      "Partenariat Puma (2010-2024)",
    ],
    bio:
      "Né à Mâcon le 21 mars 1991, Antoine Griezmann est formé à la Real Sociedad. Il rejoint l'Atlético de " +
      "Madrid en 2014, remporte la Ligue Europa 2018, puis signe au FC Barcelone (2019-2021) avant de revenir " +
      "à l'Atlético en septembre 2021. Champion du monde 2018. Il devient ambassadeur Decathlon/Kipsta en " +
      "janvier 2025 après 14 ans de partenariat Puma.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Antoine_Griezmann',
    wikidataId: 'Q455462',
    qualiteInfluence: 'ARTISTE',
  },
  {
    // Sources : Wikidata Q20851003 + Wikipedia FR + psg.fr
    nom: 'Dembélé',
    prenom: 'Ousmane',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1997-05-15'),
    lieuNaissance: 'Vernon (Eure)',
    rolePrincipal: "Footballeur professionnel, ailier du Paris Saint-Germain",
    rolesSecondaires: [
      "Champion du monde 2018 avec l'équipe de France",
      "Ancien joueur du FC Barcelone (2017-2023)",
    ],
    bio:
      "Né à Vernon le 15 mai 1997, Ousmane Dembélé est formé au Stade Rennais, passe par Dortmund et Barcelone. " +
      "Champion du monde 2018 avec la France, il rejoint le Paris Saint-Germain en juillet 2023 comme ailier.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Ousmane_Demb%C3%A9l%C3%A9',
    wikidataId: 'Q20851003',
    qualiteInfluence: 'ARTISTE',
  },
  {
    // Sources : Wikidata Q16665941 + Wikipedia FR + al-ittihad.com.sa (annonce officielle juillet 2023)
    nom: 'Kanté',
    prenom: "N'Golo",
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1991-03-29'),
    lieuNaissance: 'Paris',
    rolePrincipal: "Footballeur professionnel, milieu de terrain à Al-Ittihad FC",
    rolesSecondaires: [
      "Champion du monde 2018 avec l'équipe de France",
      "Champion d'Angleterre avec Leicester City (2016) et Chelsea (2017)",
      "Vainqueur de la Ligue des champions UEFA 2021 avec Chelsea",
    ],
    bio:
      "Né à Paris le 29 mars 1991, N'Golo Kanté est formé à Boulogne puis à Caen avant d'exploser à Leicester " +
      "City en 2016. Il rejoint Chelsea en 2016, remporte la C1 en 2021 et le Mondial 2018. En juillet 2023, " +
      "il signe à Al-Ittihad FC en Arabie Saoudite.",
    wikipediaUrl: "https://fr.wikipedia.org/wiki/N%27Golo_Kant%C3%A9",
    wikidataId: 'Q16665941',
    qualiteInfluence: 'ARTISTE',
  },
  {
    // Sources : Wikidata Q1912 + Wikipedia FR + al-ittihad.com.sa + realmadrid.com (communiqué départ)
    nom: 'Benzema',
    prenom: 'Karim',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1987-12-19'),
    lieuNaissance: 'Lyon (Rhône)',
    rolePrincipal: "Footballeur professionnel, attaquant à Al-Ittihad FC",
    rolesSecondaires: [
      "Ballon d'Or 2022",
      "Meilleur buteur de l'histoire du Real Madrid (354 buts en compétition officielle)",
      "81 sélections en équipe de France",
    ],
    bio:
      "Né à Lyon le 19 décembre 1987, Karim Benzema rejoint le Real Madrid en 2009 après l'Olympique Lyonnais. " +
      "En 14 saisons blanches, il remporte 5 Ligues des champions et le Ballon d'Or 2022 (354 buts). " +
      "En juin 2023, il signe à Al-Ittihad FC en Arabie Saoudite.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Karim_Benzema',
    wikidataId: 'Q1912',
    qualiteInfluence: 'ARTISTE',
  },
  {
    // Sources : Wikidata Q20666534 + Wikipedia FR + stade-toulousain.fr + worldrugby.org
    nom: 'Dupont',
    prenom: 'Antoine',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1996-11-15'),
    lieuNaissance: 'Lorp-Sentaraille (Ariège)',
    rolePrincipal: "Joueur de rugby à XV professionnel, capitaine du XV de France",
    rolesSecondaires: [
      "World Rugby Player of the Year 2021, 2022 et 2023 (trois années consécutives)",
      "Médaillé d'or en rugby à VII aux Jeux Olympiques de Paris 2024",
      "Capitaine du Stade Toulousain",
    ],
    bio:
      "Né à Lorp-Sentaraille le 15 novembre 1996, Antoine Dupont est élu meilleur joueur du monde par World " +
      "Rugby trois années de suite (2021-2023). Demi de mêlée au Stade Toulousain depuis 2017 et au XV de " +
      "France, il remporte la médaille d'or en rugby à VII aux JO de Paris 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Antoine_Dupont',
    wikidataId: 'Q20666534',
    qualiteInfluence: 'ARTISTE',
  },
  {
    // Sources : Wikidata Q72941595 + Wikipedia FR + nba.com/spurs + boardroom.tv (Nike deal, juin 2023)
    nom: 'Wembanyama',
    prenom: 'Victor',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('2004-01-04'),
    lieuNaissance: 'Le Chesnay (Yvelines)',
    rolePrincipal: "Joueur de basketball professionnel (NBA), pivot des San Antonio Spurs",
    rolesSecondaires: [
      "Premier choix absolu de la draft NBA 2023",
      "NBA Rookie of the Year 2024",
      "Ambassadeur Nike (depuis 2022, prolongé juin 2023 pour 3 ans)",
    ],
    bio:
      "Né le 4 janvier 2004 au Chesnay, Victor Wembanyama est formé à Nanterre puis à l'ASVEL avant de " +
      "rejoindre les Metropolitans 92. Sélectionné en premier choix absolu de la draft NBA 2023 par les " +
      "San Antonio Spurs, il remporte le titre de NBA Rookie of the Year 2024.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Victor_Wembanyama',
    wikidataId: 'Q72941595',
    qualiteInfluence: 'ARTISTE',
  },
  {
    // Sources : Wikidata Q193108 + Wikipedia FR + asvel.com + lyoncapitale.fr (coach ASVEL juin 2026)
    nom: 'Parker',
    prenom: 'Tony',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1982-05-17'),
    lieuNaissance: 'Bruges (Belgique)',
    rolePrincipal: "Ancien joueur NBA, président et entraîneur-chef de l'ASVEL Lyon-Villeurbanne",
    rolesSecondaires: [
      "Actionnaire majoritaire et président de l'ASVEL Lyon-Villeurbanne (depuis 2014)",
      "Entraîneur-chef de l'ASVEL (depuis juin 2026)",
      "Quadruple champion NBA avec les San Antonio Spurs (2003, 2005, 2007, 2014)",
      "MVP des Finales NBA 2007",
    ],
    bio:
      "Né à Bruges le 17 mai 1982, Tony Parker est formé en France avant de rejoindre les San Antonio Spurs " +
      "en 2001. Quadruple champion NBA et MVP des Finales 2007, il prend sa retraite sportive en 2019. Dès " +
      "2014, il reprend l'ASVEL Lyon-Villeurbanne et en fait le premier club français à évoluer durablement " +
      "en EuroLeague. En juin 2026, il en devient également l'entraîneur-chef.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Tony_Parker',
    wikidataId: 'Q193108',
    qualiteInfluence: 'ARTISTE',
  },
  {
    // Sources : Wikidata Q353514 + Wikipedia FR + ffj.fr + paris2024.org
    nom: 'Riner',
    prenom: 'Teddy',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1989-04-07'),
    lieuNaissance: 'Pointe-à-Pitre (Guadeloupe)',
    rolePrincipal: "Judoka professionnel, triple champion olympique",
    rolesSecondaires: [
      "Triple champion olympique (Londres 2012, Tokyo 2020, Paris 2024)",
      "Dix fois champion du monde (catégorie +100 kg)",
      "Médaillé d'or en équipes mixtes aux JO de Paris 2024",
    ],
    bio:
      "Né le 7 avril 1989 à Pointe-à-Pitre, Teddy Riner est le judoka le plus titré de l'histoire. Trois " +
      "fois champion olympique et dix fois champion du monde, il est l'un des plus grands sportifs français " +
      "de tous les temps. Il concourt en catégorie +100 kg sous licence à la FFJDA.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Teddy_Riner',
    wikidataId: 'Q353514',
    qualiteInfluence: 'ARTISTE',
  },
  {
    // Sources : Wikidata Q2975621 + Wikipedia FR + ffj.fr + paris2024.org
    nom: 'Agbégnénou',
    prenom: 'Clarisse',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1992-10-02'),
    lieuNaissance: 'Rennes (Ille-et-Vilaine)',
    rolePrincipal: "Judoka professionnelle, championne olympique et mondiale",
    rolesSecondaires: [
      "Six fois championne du monde (-63 kg, 2012-2022)",
      "Médaillée d'or par équipes mixtes aux JO de Paris 2024",
      "Médaillée d'argent individuelle à Tokyo 2020",
    ],
    bio:
      "Née le 2 octobre 1992 à Rennes, Clarisse Agbégnénou est l'une des judokates les plus titrées de " +
      "l'histoire. Six fois championne du monde, elle remporte l'or par équipes mixtes aux JO de Paris 2024 " +
      "aux côtés de Teddy Riner. Licenciée à la FFJDA, catégorie -63 kg.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Clarisse_Agb%C3%A9gn%C3%A9nou',
    wikidataId: 'Q2975621',
    qualiteInfluence: 'ARTISTE',
  },
]

// ---------------------------------------------------------------------------
// ORGANISATIONS
// ---------------------------------------------------------------------------

const ORGANISATIONS = [
  {
    // Sources : Wikidata Q483020 + Wikipedia FR + psg.fr
    nom: 'Paris Saint-Germain FC',
    sigle: 'PSG',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.psg.fr',
    description:
      "Club de football professionnel fondé le 12 août 1970, basé à Paris (Parc des Princes). " +
      "Propriété du fonds Qatar Sports Investments (QSI) depuis 2011. Club de Dembélé (depuis 2023) " +
      "et ex-club de Mbappé (2017-2024).",
    dateCreation: new Date('1970-08-12'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Paris_Saint-Germain_FC',
    wikidataId: 'Q483020',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q8682 + Wikipedia FR + realmadrid.com
    nom: 'Real Madrid Club de Fútbol',
    sigle: 'Real Madrid',
    typeOrganisation: 'ASSOCIATION',
    pays: 'Espagne',
    siteWeb: 'https://www.realmadrid.com',
    description:
      "Club de football fondé le 6 mars 1902 à Madrid. Quinze fois vainqueur de la Ligue des champions. " +
      "Ex-club de Benzema (2009-2023), club de Mbappé depuis juillet 2024.",
    dateCreation: new Date('1902-03-06'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Real_Madrid_CF',
    wikidataId: 'Q8682',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q8701 + Wikipedia FR + atleticodemadrid.com
    nom: "Club Atlético de Madrid",
    sigle: "Atlético",
    typeOrganisation: 'ENTREPRISE',
    pays: 'Espagne',
    siteWeb: 'https://www.atleticodemadrid.com',
    description:
      "Club de football professionnel espagnol (SAD), fondé en 1903. " +
      "Club d'Antoine Griezmann depuis son retour en septembre 2021.",
    dateCreation: new Date('1903-04-26'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Atl%C3%A9tico_de_Madrid',
    wikidataId: 'Q8701',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q309480 + Wikipedia FR + al-ittihad.com.sa
    nom: 'Al-Ittihad Club',
    sigle: null,
    typeOrganisation: 'ASSOCIATION',
    pays: 'Arabie Saoudite',
    siteWeb: 'https://www.al-ittihad.com.sa',
    description:
      "Club de football saoudien fondé en 1927, basé à Djeddah. Dans le cadre de l'essor de la Saudi " +
      "Pro League, il recrute Karim Benzema (juin 2023) et N'Golo Kanté (juillet 2023).",
    dateCreation: new Date('1927-11-15'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Al-Ittihad_Club_(Djeddah)',
    wikidataId: 'Q309480',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q431412 + Wikipedia FR + stade-toulousain.fr
    nom: 'Stade Toulousain',
    sigle: 'ST',
    typeOrganisation: 'ASSOCIATION',
    pays: 'France',
    siteWeb: 'https://www.stade-toulousain.fr',
    description:
      "Club de rugby à XV professionnel français fondé en 1907, basé à Toulouse. Six fois champion " +
      "d'Europe, vingt-deux fois champion de France. Club d'Antoine Dupont depuis 2017.",
    dateCreation: new Date('1907-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Stade_toulousain',
    wikidataId: 'Q431412',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q159729 + Wikipedia FR + nba.com/spurs
    nom: 'San Antonio Spurs',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'États-Unis',
    siteWeb: 'https://www.nba.com/spurs',
    description:
      "Franchise NBA fondée en 1967 et basée à San Antonio (Texas). Cinq fois champion NBA. " +
      "Employeur historique de Tony Parker (2001-2018) et club de Victor Wembanyama (draft 2023).",
    dateCreation: new Date('1967-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/San_Antonio_Spurs',
    wikidataId: 'Q159729',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q4089 + Wikipedia FR + asvel.com
    nom: 'ASVEL Lyon-Villeurbanne',
    sigle: 'ASVEL',
    typeOrganisation: 'ASSOCIATION',
    pays: 'France',
    siteWeb: 'https://www.asvel.com',
    description:
      "Club de basketball professionnel français fondé en 1948, basé à Villeurbanne. Propriété de " +
      "Tony Parker depuis 2014, participant régulier à l'EuroLeague. Parker en devient entraîneur en 2026.",
    dateCreation: new Date('1948-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/ASVEL_Lyon-Villeurbanne',
    wikidataId: 'Q4089',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q483915 + Wikipedia FR + nike.com
    // Partenaires FR documentés : Mbappé (2007-2026-06-30, expiré) + Wembanyama (2022-2026)
    nom: 'Nike',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'États-Unis',
    siteWeb: 'https://www.nike.com',
    description:
      "Multinationale américaine d'équipements sportifs fondée en 1964, cotée au NYSE. " +
      "Partenaire de Kylian Mbappé (2007-2026, non renouvelé) et de Victor Wembanyama (depuis 2022).",
    dateCreation: new Date('1964-01-25'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Nike_(entreprise)',
    wikidataId: 'Q483915',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q509349 + Wikipedia FR + decathlon.fr
    // Sponsor officiel d'Antoine Griezmann depuis janvier 2025 (annonce filieresport.com 2025-01-24)
    nom: 'Decathlon',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.decathlon.fr',
    description:
      "Multinationale française de distribution d'articles de sport fondée en 1976, groupe Mulliez. " +
      "Antoine Griezmann en est ambassadeur officiel (marque Kipsta) depuis janvier 2025, après 14 ans " +
      "chez Puma.",
    dateCreation: new Date('1976-07-10'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Decathlon_(enseigne)',
    wikidataId: 'Q509349',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q691958 + Wikipedia FR + LVMH.fr (communiqué officiel oct. 2018)
    nom: 'Hublot',
    sigle: null,
    typeOrganisation: 'ENTREPRISE',
    pays: 'Suisse',
    siteWeb: 'https://www.hublot.com',
    description:
      "Manufacture horlogère de luxe suisse fondée en 1980, filiale du groupe LVMH depuis 2008. " +
      "Kylian Mbappé en est ambassadeur officiel depuis octobre 2018 (communiqué LVMH du 31 oct. 2018).",
    dateCreation: new Date('1980-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Hublot_(horlogerie)',
    wikidataId: 'Q691958',
    qualiteInfluence: 'AUTRE',
  },
  {
    // Sources : Wikidata Q3091809 + Wikipedia FR + ffj.fr
    nom: 'Fédération Française de Judo et Disciplines Associées',
    sigle: 'FFJDA',
    typeOrganisation: 'ASSOCIATION',
    pays: 'France',
    siteWeb: 'https://www.ffj.fr',
    description:
      "Fédération sportive délégataire du judo en France, fondée en 1946. Gère les licences et " +
      "compétitions de Teddy Riner (+100 kg) et Clarisse Agbégnénou (-63 kg), deux des judokas " +
      "les plus titrés de l'histoire.",
    dateCreation: new Date('1946-01-01'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/F%C3%A9d%C3%A9ration_fran%C3%A7aise_de_judo',
    wikidataId: 'Q3091809',
    qualiteInfluence: 'AUTRE',
  },
]

// ---------------------------------------------------------------------------
// SOURCES — publiques, recoupées, datées (dateConsultation 2026-07-01).
// ---------------------------------------------------------------------------

const SOURCES = {
  wp_mbappe: {
    url: 'https://fr.wikipedia.org/wiki/Kylian_Mbapp%C3%A9',
    titre: 'Kylian Mbappé — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Carrière : AS Monaco, PSG (2017-2024, 256 buts), Real Madrid (depuis juil. 2024). " +
      "Nike (2007-2026, expiré), Hublot (depuis oct. 2018). CM 2018.",
    verifiee: true,
  },
  wp_griezmann: {
    url: 'https://fr.wikipedia.org/wiki/Antoine_Griezmann',
    titre: 'Antoine Griezmann — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Carrière : Real Sociedad, Atletico (2014-2019 et 2021-), Barcelone (2019-2021). " +
      "Puma (2010-2024), Decathlon/Kipsta (depuis janv. 2025). CM 2018.",
    verifiee: true,
  },
  wp_dembele: {
    url: 'https://fr.wikipedia.org/wiki/Ousmane_Demb%C3%A9l%C3%A9',
    titre: 'Ousmane Dembélé — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Carrière : Rennais, Dortmund, Barcelone (2017-2023), PSG (depuis juil. 2023). CM 2018.",
    verifiee: true,
  },
  wp_kante: {
    url: "https://fr.wikipedia.org/wiki/N%27Golo_Kant%C3%A9",
    titre: "N'Golo Kanté — Wikipédia",
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Carrière : Boulogne, Caen, Leicester, Chelsea (C1 2021), Al-Ittihad (depuis juil. 2023). CM 2018.",
    verifiee: true,
  },
  wp_benzema: {
    url: 'https://fr.wikipedia.org/wiki/Karim_Benzema',
    titre: 'Karim Benzema — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Carrière : OL, Real Madrid (2009-2023, 354 buts, 5 C1, BO 2022), Al-Ittihad (depuis juin 2023).",
    verifiee: true,
  },
  wp_dupont: {
    url: 'https://fr.wikipedia.org/wiki/Antoine_Dupont',
    titre: 'Antoine Dupont — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Stade Toulousain depuis 2017, XV de France (capitaine). World Rugby Player of Year 2021-2023. " +
      "Or JO Paris 2024 rugby VII.",
    verifiee: true,
  },
  wp_wembanyama: {
    url: 'https://fr.wikipedia.org/wiki/Victor_Wembanyama',
    titre: 'Victor Wembanyama — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Formé à Nanterre, ASVEL, Metropolitans 92. Draft NBA 2023 (1er choix) aux San Antonio Spurs. " +
      "NBA Rookie of the Year 2024.",
    verifiee: true,
  },
  wp_parker: {
    url: 'https://fr.wikipedia.org/wiki/Tony_Parker',
    titre: 'Tony Parker — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "San Antonio Spurs 2001-2018 (4 titres NBA, MVP Finales 2007). Retraite 2019. " +
      "Actionnaire majoritaire et président de l'ASVEL depuis 2014.",
    verifiee: true,
  },
  wp_riner: {
    url: 'https://fr.wikipedia.org/wiki/Teddy_Riner',
    titre: 'Teddy Riner — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Judoka +100 kg, triple champion olympique (2012, 2020, 2024), 10 fois champion du monde. " +
      "Licencié FFJDA.",
    verifiee: true,
  },
  wp_agbegnenou: {
    url: 'https://fr.wikipedia.org/wiki/Clarisse_Agb%C3%A9gn%C3%A9nou',
    titre: 'Clarisse Agbégnénou — Wikipédia',
    media: 'Wikipédia',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2026-06-01'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Judoka -63 kg, 6 fois championne du monde, or par équipes mixtes JO Paris 2024 avec Riner. " +
      "Licenciée FFJDA.",
    verifiee: true,
  },
  hublot_mbappe: {
    url: 'https://www.lvmh.fr/actualites-documents/actualites/kylian-mbappe-devient-nouvel-ambassadeur-de-maison-hublot/',
    titre: "Kylian Mbappé devient nouvel ambassadeur de la Maison Hublot — LVMH.fr",
    media: 'LVMH (groupe)',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2018-10-31'),
    dateConsultation: new Date('2026-07-01'),
    auteur: 'LVMH',
    description:
      "Communiqué officiel du groupe LVMH annonçant Kylian Mbappé comme ambassadeur de la marque " +
      "horlogère Hublot le 31 octobre 2018. Premier footballeur en activité représentant Hublot.",
    verifiee: true,
  },
  griezmann_decathlon: {
    url: 'https://www.filieresport.com/rse/2025-01-24/antoine-griezmann-nomme-ambassadeur-de-decathlon',
    titre: "Antoine Griezmann nommé ambassadeur de Decathlon — Filière Sport",
    media: 'Filière Sport',
    typeMedia: 'WEB',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2025-01-24'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Annonce officielle du partenariat Griezmann-Decathlon/Kipsta en janvier 2025, après 14 ans " +
      "de partenariat avec Puma. Griezmann portera les crampons Kipsta CLR Elite en compétition.",
    verifiee: true,
  },
  wemba_nike: {
    url: 'https://boardroom.tv/headline-to-go/june-20-2023-wembanyama-nike-deal-nba/',
    titre: "Victor Wembanyama Officially Extends Deal with Nike — Boardroom",
    media: 'Boardroom',
    typeMedia: 'WEB',
    langue: 'en',
    paysMedia: 'États-Unis',
    datePublication: new Date('2023-06-20'),
    dateConsultation: new Date('2026-07-01'),
    auteur: null,
    description:
      "Confirmation officielle du renouvellement (3 ans) du contrat Nike de Victor Wembanyama " +
      "en juin 2023, avant son entrée en NBA avec les San Antonio Spurs (draft 22 juin 2023).",
    verifiee: true,
  },
}

// ---------------------------------------------------------------------------
// LIENS — Lien polymorphe à 3 types (ADR-002), exactement 1 entité non-nulle de chaque côté.
// Chaque entité référencée possède un wikidataId (résolution via trouverEntite).
// ---------------------------------------------------------------------------

const LIENS = [
  // =========================================================================
  // FOOTBALL
  // =========================================================================

  // --- Mbappé ---
  {
    // P-O : Mbappé au Real Madrid (depuis juillet 2024, joueur libre)
    aType: 'personne',
    aRef: 'Q21621995',
    bType: 'organisation',
    bRef: 'Q8682',
    typeLienCode: 'EMPLOI',
    description:
      "Kylian Mbappé signe au Real Madrid CF en juillet 2024 en tant que joueur libre à l'expiration " +
      "de son contrat avec le PSG. Présenté officiellement le 1er juillet 2024 au Bernabéu.",
    dateDebut: new Date('2024-07-01'),
    dateFin: null,
    sourceRef: 'wp_mbappe',
  },
  {
    // P-O : Mbappé au PSG (lien historique — 7 saisons, 256 buts)
    aType: 'personne',
    aRef: 'Q21621995',
    bType: 'organisation',
    bRef: 'Q483020',
    typeLienCode: 'EMPLOI',
    description:
      "Kylian Mbappé rejoint le PSG en prêt le 31 août 2017, puis définitivement en juin 2018 " +
      "(145 M€). Il quitte le club en juin 2024 après 7 saisons et 256 buts. Lien historique.",
    dateDebut: new Date('2017-08-31'),
    dateFin: new Date('2024-06-30'),
    sourceRef: 'wp_mbappe',
  },
  {
    // P-O : Mbappé × Nike (contrat personnel 2007-2026, non renouvelé)
    aType: 'personne',
    aRef: 'Q21621995',
    bType: 'organisation',
    bRef: 'Q483915',
    typeLienCode: 'economique',
    description:
      "Mbappé est partenaire de Nike depuis l'âge de 8 ans (vers 2007). Accord professionnel " +
      "renouvelé en 2019 et 2022. Le contrat expire le 30 juin 2026 et n'est pas renouvelé selon " +
      "plusieurs sources sportives (Le Parisien, Goal.com, Footy Headlines).",
    dateDebut: new Date('2007-01-01'),
    dateFin: new Date('2026-06-30'),
    sourceRef: 'wp_mbappe',
  },
  {
    // P-O : Mbappé × Hublot (ambassadeur officiel depuis octobre 2018)
    aType: 'personne',
    aRef: 'Q21621995',
    bType: 'organisation',
    bRef: 'Q691958',
    typeLienCode: 'mediatique',
    description:
      "Hublot (filiale LVMH) annonce Kylian Mbappé comme ambassadeur le 31 octobre 2018. " +
      "Il est le premier footballeur en activité à représenter la marque. Lien croisé : " +
      "Hublot appartient à LVMH (Q504998, seed-fortunes-1.js).",
    dateDebut: new Date('2018-10-31'),
    dateFin: null,
    sourceRef: 'hublot_mbappe',
  },

  // --- Griezmann ---
  {
    // P-O : Griezmann à l'Atlético de Madrid (retour sept. 2021)
    aType: 'personne',
    aRef: 'Q455462',
    bType: 'organisation',
    bRef: 'Q8701',
    typeLienCode: 'EMPLOI',
    description:
      "Antoine Griezmann retourne à l'Atlético de Madrid en septembre 2021 (retour de prêt depuis " +
      "Barcelone, clause libératoire levée en 2022). L'un des joueurs les plus capés du club.",
    dateDebut: new Date('2021-09-01'),
    dateFin: null,
    sourceRef: 'wp_griezmann',
  },
  {
    // P-O : Griezmann × Decathlon/Kipsta (ambassadeur depuis janvier 2025)
    aType: 'personne',
    aRef: 'Q455462',
    bType: 'organisation',
    bRef: 'Q509349',
    typeLienCode: 'economique',
    description:
      "Antoine Griezmann devient ambassadeur officiel de Decathlon (marque Kipsta) en janvier 2025, " +
      "après 14 ans de partenariat avec Puma. Il co-développe les crampons Kipsta CLR Elite.",
    dateDebut: new Date('2025-01-24'),
    dateFin: null,
    sourceRef: 'griezmann_decathlon',
  },

  // --- Dembélé ---
  {
    // P-O : Dembélé au PSG (depuis juillet 2023)
    aType: 'personne',
    aRef: 'Q20851003',
    bType: 'organisation',
    bRef: 'Q483020',
    typeLienCode: 'EMPLOI',
    description:
      "Ousmane Dembélé rejoint le Paris Saint-Germain en juillet 2023 à l'expiration de son contrat " +
      "avec le FC Barcelone. Il s'impose comme titulaire sur le côté droit de l'attaque.",
    dateDebut: new Date('2023-07-01'),
    dateFin: null,
    sourceRef: 'wp_dembele',
  },

  // --- Kanté ---
  {
    // P-O : Kanté à Al-Ittihad (depuis juillet 2023)
    aType: 'personne',
    aRef: 'Q16665941',
    bType: 'organisation',
    bRef: 'Q309480',
    typeLienCode: 'EMPLOI',
    description:
      "N'Golo Kanté signe à Al-Ittihad FC (Arabie Saoudite) en juillet 2023 après l'expiration de " +
      "son contrat avec Chelsea. Annonce officielle par les deux clubs.",
    dateDebut: new Date('2023-07-01'),
    dateFin: null,
    sourceRef: 'wp_kante',
  },

  // --- Benzema ---
  {
    // P-O : Benzema à Al-Ittihad (depuis juin 2023)
    aType: 'personne',
    aRef: 'Q1912',
    bType: 'organisation',
    bRef: 'Q309480',
    typeLienCode: 'EMPLOI',
    description:
      "Karim Benzema signe à Al-Ittihad FC le 7 juin 2023, après 14 saisons au Real Madrid. " +
      "Contrat de 3 ans annoncé officiellement par le club saoudien et le Real Madrid.",
    dateDebut: new Date('2023-06-07'),
    dateFin: null,
    sourceRef: 'wp_benzema',
  },
  {
    // P-O : Benzema au Real Madrid (historique, 14 saisons emblématiques)
    aType: 'personne',
    aRef: 'Q1912',
    bType: 'organisation',
    bRef: 'Q8682',
    typeLienCode: 'EMPLOI',
    description:
      "Karim Benzema joue au Real Madrid du 9 juillet 2009 au 1er juin 2023 (14 saisons). " +
      "354 buts en compétition officielle, 5 Ligues des champions, Ballon d'Or 2022. " +
      "Meilleur buteur de l'histoire du club.",
    dateDebut: new Date('2009-07-09'),
    dateFin: new Date('2023-06-01'),
    sourceRef: 'wp_benzema',
  },

  // =========================================================================
  // RUGBY
  // =========================================================================

  // --- Dupont ---
  {
    // P-O : Dupont au Stade Toulousain (depuis 2017)
    aType: 'personne',
    aRef: 'Q20666534',
    bType: 'organisation',
    bRef: 'Q431412',
    typeLienCode: 'EMPLOI',
    description:
      "Antoine Dupont rejoint le Stade Toulousain lors de la saison 2017-2018. Il en devient le " +
      "capitaine et le joueur le plus reconnu. Élu meilleur joueur du monde trois années de suite.",
    dateDebut: new Date('2017-07-01'),
    dateFin: null,
    sourceRef: 'wp_dupont',
  },

  // =========================================================================
  // BASKETBALL
  // =========================================================================

  // --- Wembanyama ---
  {
    // P-O : Wembanyama aux San Antonio Spurs (depuis la draft du 22 juin 2023)
    aType: 'personne',
    aRef: 'Q72941595',
    bType: 'organisation',
    bRef: 'Q159729',
    typeLienCode: 'EMPLOI',
    description:
      "Victor Wembanyama est sélectionné par les San Antonio Spurs en premier choix absolu lors de " +
      "la draft NBA le 22 juin 2023. Il signe un contrat rookie de 4 ans avec le club.",
    dateDebut: new Date('2023-06-22'),
    dateFin: null,
    sourceRef: 'wp_wembanyama',
  },
  {
    // P-O : Wembanyama × Nike (contrat renouvelé juin 2023, valable jusqu'en 2026)
    aType: 'personne',
    aRef: 'Q72941595',
    bType: 'organisation',
    bRef: 'Q483915',
    typeLienCode: 'economique',
    description:
      "Victor Wembanyama est partenaire Nike depuis 2022 (signé en France). Le contrat est " +
      "officiellement renouvelé pour 3 ans en juin 2023 (Boardroom.tv, 20 juin 2023), couvrant " +
      "chaussures et vêtements. Expiration prévue en octobre 2026.",
    dateDebut: new Date('2022-01-01'),
    dateFin: null,
    sourceRef: 'wemba_nike',
  },

  // --- Parker ---
  {
    // P-O : Parker × ASVEL (président et actionnaire majoritaire depuis 2014)
    aType: 'personne',
    aRef: 'Q193108',
    bType: 'organisation',
    bRef: 'Q4089',
    typeLienCode: 'DIRIGEANT',
    description:
      "Tony Parker devient actionnaire majoritaire puis président de l'ASVEL Lyon-Villeurbanne en " +
      "2014. Il développe le club pour l'EuroLeague. En juin 2026, il prend également les fonctions " +
      "d'entraîneur-chef tout en restant président.",
    dateDebut: new Date('2014-01-01'),
    dateFin: null,
    sourceRef: 'wp_parker',
  },
  {
    // P-O : Parker aux San Antonio Spurs (lien historique, 17 saisons)
    aType: 'personne',
    aRef: 'Q193108',
    bType: 'organisation',
    bRef: 'Q159729',
    typeLienCode: 'EMPLOI',
    description:
      "Tony Parker joue pour les San Antonio Spurs de 2001 à 2018 (17 saisons). Il remporte quatre " +
      "titres NBA (2003, 2005, 2007, 2014) et le titre de MVP des Finales en 2007. Lien historique.",
    dateDebut: new Date('2001-07-01'),
    dateFin: new Date('2018-07-01'),
    sourceRef: 'wp_parker',
  },

  // =========================================================================
  // JUDO
  // =========================================================================

  // --- Riner ---
  {
    // P-O : Riner × FFJDA (licence compétitive nationale et internationale)
    aType: 'personne',
    aRef: 'Q353514',
    bType: 'organisation',
    bRef: 'Q3091809',
    typeLienCode: 'institutionnel',
    description:
      "Teddy Riner est licencié à la Fédération Française de Judo et Disciplines Associées (FFJDA) " +
      "depuis ses débuts en compétition. Il concourt sous ses couleurs dans les championnats nationaux " +
      "et représente la France aux Jeux Olympiques.",
    dateDebut: new Date('2000-01-01'),
    dateFin: null,
    sourceRef: 'wp_riner',
  },

  // --- Agbégnénou ---
  {
    // P-O : Agbégnénou × FFJDA (licence compétitive nationale et internationale)
    aType: 'personne',
    aRef: 'Q2975621',
    bType: 'organisation',
    bRef: 'Q3091809',
    typeLienCode: 'institutionnel',
    description:
      "Clarisse Agbégnénou est licenciée à la Fédération Française de Judo et Disciplines Associées " +
      "(FFJDA) depuis ses débuts. Six fois championne du monde sous ces couleurs, médaillée aux JO.",
    dateDebut: new Date('2003-01-01'),
    dateFin: null,
    sourceRef: 'wp_agbegnenou',
  },
]

// ---------------------------------------------------------------------------
// Helpers idempotents (alignés sur seed-macron-v2.js)
// ---------------------------------------------------------------------------

async function getUserAdmin() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } })
  if (!user) {
    throw new Error(
      `[seed-sportifs] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : npm run db:seed:demo`,
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
      `[seed-sportifs] Entité introuvable pour lien ${lien.typeLienCode} ` +
        `(aRef=${lien.aRef}, bRef=${lien.bRef})`,
    )
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } })
  if (!typeLien) {
    throw new Error(`[seed-sportifs] TypeLien introuvable : ${lien.typeLienCode}`)
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
  console.log('Suppression données sportifs précédentes...')
  const wikidataIdsP = PERSONNES.map((p) => p.wikidataId)
  const wikidataIdsO = ORGANISATIONS.map((o) => o.wikidataId)

  const persos = await prisma.personne.findMany({ where: { wikidataId: { in: wikidataIdsP } } })
  const orgas = await prisma.organisation.findMany({
    where: { wikidataId: { in: wikidataIdsO } },
  })

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
  console.log('\n+-- seed-sportifs — Sportifs FR top-tier (football, basket, rugby, judo) --+\n')
  if (RESET) await reset()

  const user = await getUserAdmin()
  console.log(`ok User : ${user.email}\n`)

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
    await creerLien(lien, sourcesMap, user.id)
    console.log(`  ok ${lien.typeLienCode} — ${lien.description.slice(0, 70)}...`)
  }

  console.log('\n+-- Bilan ----------------------------------------------------------------+')
  console.log(`| Personnes     : ${PERSONNES.length} (Mbappé, Griezmann, Dembélé, Kanté, Benzema, Dupont,`)
  console.log(`|                    Wembanyama, Parker, Riner, Agbégnénou)`)
  console.log(
    `| Organisations : ${ORGANISATIONS.length} (PSG, Real Madrid, Atletico, Al-Ittihad, Stade Toulousain,`,
  )
  console.log(`|                    Spurs, ASVEL, Nike, Decathlon, Hublot, FFJDA)`)
  console.log(
    `| Sources       : ${Object.keys(SOURCES).length} (10 Wikipedia FR + LVMH.fr + Filière Sport + Boardroom)`,
  )
  console.log(
    `| Liens         : ${LIENS.length} (EMPLOI, DIRIGEANT, economique, mediatique, institutionnel)`,
  )
  console.log('|')
  console.log('| Liens croisés notables (sponsors = marques déjà en base) :')
  console.log('|   Hublot (Q691958) -> filiale LVMH (Q504998, seed-fortunes-1.js)')
  console.log('|   Nike (Q483915)   -> Mbappé (contrat expiré 30/06/2026) + Wembanyama')
  console.log('|   PSG (Q483020)    -> Mbappé (historique) + Dembélé (actuel)')
  console.log('|   Al-Ittihad (Q309480) -> Kanté + Benzema (Saudi Pro League)')
  console.log('+-------------------------------------------------------------------------+\n')
}

main()
  .catch((err) => {
    console.error('[seed-sportifs] Echec :', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
