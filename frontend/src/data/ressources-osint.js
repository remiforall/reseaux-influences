/**
 * Webographie OSINT — ressources NON intégrées comme connecteurs, et pourquoi.
 *
 * Philosophie « hub ultra-réglo qui ouvre des portes » : le graphe d'influence
 * n'est alimenté que par des API/open data officiels (ADR-003). Cette
 * webographie recense les autres univers OSINT — utiles à un·e journaliste en
 * lecture — en explicitant la raison de leur exclusion du pipeline automatisé
 * et l'usage légitime (toujours : remonter à la source primaire, citer,
 * soumettre au consensus communautaire).
 *
 * Statuts (CUD-safe : icône + texte + couleur, jamais la couleur seule) :
 *   - exclu      : jamais intégrable automatiquement (RGPD art. 9/10, CGU…)
 *   - manuel     : usage humain légitime, jamais connecteur (crédibilité, ToS)
 *   - en-attente : intégrable plus tard sous condition (accès légal, évaluation)
 */

export const STATUTS = {
  exclu: {
    libelle: 'Exclu',
    icone: '⛔',
    classes: 'bg-red-100 text-red-800 border-red-300',
    aide: 'Jamais intégré automatiquement — incompatible RGPD / CGU / éthique.',
  },
  manuel: {
    libelle: 'Lecture manuelle',
    icone: '👁',
    classes: 'bg-amber-100 text-amber-900 border-amber-300',
    aide: 'Consultable par un·e contributeur·rice ; jamais un connecteur. Remonter à la source primaire.',
  },
  'en-attente': {
    libelle: 'Sous condition',
    icone: '🕓',
    classes: 'bg-blue-100 text-blue-800 border-blue-300',
    aide: 'Intégrable plus tard, après démarche légale ou évaluation technique.',
  },
}

export const CATEGORIES = [
  {
    titre: 'Médias & blogs OSINT non-officiels',
    statut: 'manuel',
    raison:
      "Sources éditoriales non vérifiables comme telles (auteur·rice parfois anonyme, pas d'API stable). Risque d'intox documenté dans l'écosystème OSINT. Ne jamais ingérer en masse.",
    adr: 'ADR-003',
    outils: [
      {
        nom: 'DefenseHub',
        url: 'https://defensehub.blog/',
        desc: 'Blog défense/OSINT indépendant. Flux refusé aux robots (403).',
        usage: 'Lire ; si une source primaire est citée, intégrer celle-ci.',
      },
      {
        nom: 'Bellingcat',
        url: 'https://www.bellingcat.com/',
        desc: 'Collectif d’investigation reconnu, méthodologie ouverte.',
        usage: 'Citer leurs sources primaires (eux-mêmes sourcent l’officiel).',
      },
      {
        nom: 'Comptes OSINT sur X / Telegram',
        url: null,
        desc: 'Veille temps réel, mais fiabilité très variable, non vérifiable.',
        usage: 'Recoupement humain uniquement, jamais comme source de fiche.',
      },
    ],
  },
  {
    titre: 'Réseaux sociaux',
    statut: 'exclu',
    raison:
      'CGU des plateformes + RGPD. Exclus explicitement par le brief juridique (Q3) et le périmètre du projet.',
    adr: 'ADR-019',
    outils: [
      {
        nom: 'X / Twitter',
        url: 'https://x.com/',
        desc: 'CGU interdisant la collecte ; données personnelles.',
        usage: 'Hors périmètre.',
      },
      {
        nom: 'LinkedIn',
        url: 'https://www.linkedin.com/',
        desc: 'Scraping interdit (CGU, jurisprudence hiQ/LinkedIn).',
        usage: 'Hors périmètre.',
      },
      {
        nom: 'Meta (Facebook / Instagram)',
        url: null,
        desc: 'Données personnelles, CGU restrictives.',
        usage: 'Hors périmètre.',
      },
    ],
  },
  {
    titre: 'Fuites de données & breaches',
    statut: 'exclu',
    raison:
      'Données issues de compromissions = données personnelles, sensibles (art. 9) ou pénales (art. 10). Exclusion définitive (ADR-017 §3).',
    adr: 'ADR-017',
    outils: [
      {
        nom: 'Have I Been Pwned',
        url: 'https://haveibeenpwned.com/',
        desc: 'Présence d’un email dans des breaches.',
        usage: 'Hors périmètre (donnée de compromission).',
      },
      {
        nom: 'DeHashed / Snusbase / Intelligence X',
        url: null,
        desc: 'Index de bases divulguées.',
        usage: 'Hors périmètre.',
      },
    ],
  },
  {
    titre: 'Énumération d’identité personnelle',
    statut: 'exclu',
    raison:
      'Outils de pistage d’un individu à travers ses comptes/usernames. Surveillance de personne — hors périmètre (ADR-017 §3).',
    adr: 'ADR-017',
    outils: [
      {
        nom: 'Maigret / Sherlock',
        url: null,
        desc: 'Énumération de comptes par pseudo.',
        usage: 'Hors périmètre.',
      },
      {
        nom: 'Holehe / Epieos',
        url: null,
        desc: 'Test d’existence de comptes par email.',
        usage: 'Hors périmètre.',
      },
      {
        nom: 'GHunt',
        url: null,
        desc: 'Exploitation d’un compte Google.',
        usage: 'Hors périmètre.',
      },
    ],
  },
  {
    titre: 'Reconnaissance faciale & image inversée',
    statut: 'exclu',
    raison: 'Données biométriques (RGPD art. 9). Exclusion définitive.',
    adr: 'ADR-017',
    outils: [
      {
        nom: 'PimEyes / FaceCheck.ID',
        url: null,
        desc: 'Recherche faciale sur le web.',
        usage: 'Hors périmètre (biométrie).',
      },
      {
        nom: 'Recherche d’image inversée (sur personnes)',
        url: null,
        desc: 'Identification de personnes par photo.',
        usage: 'Hors périmètre.',
      },
    ],
  },
  {
    titre: 'Lookup téléphone / email / IP individuels',
    statut: 'exclu',
    raison: 'Identification/traçage d’une personne physique. Hors périmètre (ADR-017 §3).',
    adr: 'ADR-017',
    outils: [
      {
        nom: 'Truecaller / Sync.me',
        url: null,
        desc: 'Annuaire inversé de numéros.',
        usage: 'Hors périmètre.',
      },
      {
        nom: 'Géolocalisation IP individuelle',
        url: null,
        desc: 'Rattachement d’une IP à une personne.',
        usage: 'Hors périmètre.',
      },
    ],
  },
  {
    titre: 'Registres d’entreprises propriétaires / payants',
    statut: 'manuel',
    raison:
      'Données souvent fiables mais sous clé API payante et/ou conditions de réutilisation incompatibles avec un corpus ouvert (ADR-007 à venir). Le registre officiel sous-jacent reste la source à privilégier.',
    adr: 'ADR-007',
    outils: [
      {
        nom: 'OpenCorporates',
        url: 'https://opencorporates.com/',
        desc: 'Registres du commerce mondiaux ; API à ToS restrictives sur la rediffusion.',
        usage: 'Vérifier le registre national officiel correspondant.',
      },
      {
        nom: 'Pappers',
        url: 'https://www.pappers.fr/',
        desc: 'Données entreprises FR enrichies ; clé API payante.',
        usage:
          'Stub déjà prévu mais désactivé sans clé ; préférer recherche-entreprises (officiel).',
      },
      {
        nom: 'Sayari / Orbis (Bureau van Dijk)',
        url: null,
        desc: 'Bases capitalistiques pro, abonnement.',
        usage: 'Usage cadré hors plateforme ; citer le registre source.',
      },
    ],
  },
  {
    titre: 'Plateformes d’investigation propriétaires',
    statut: 'manuel',
    raison:
      'Outils professionnels puissants mais propriétaires, coûteux et parfois éthiquement sensibles. Hors du pipeline ouvert du projet.',
    adr: 'ADR-004',
    outils: [
      {
        nom: 'Maltego',
        url: 'https://www.maltego.com/',
        desc: 'Cartographie de liens (transforms).',
        usage: 'Outil tiers ; ne pas confondre avec le graphe interne.',
      },
      {
        nom: 'Recorded Future / Babel Street',
        url: null,
        desc: 'Renseignement commercial, agrégation massive.',
        usage: 'Hors périmètre du hub.',
      },
    ],
  },
  {
    titre: 'Accès restreints — intégrables après démarche légale',
    statut: 'en-attente',
    raison:
      'Sources officielles mais à accès encadré. Des courriers/notes de cadrage existent déjà (docs/courriers/). Intégration conditionnée à l’autorisation et à l’audit juridique.',
    adr: 'ADR-010',
    outils: [
      {
        nom: 'Cadastre nominatif (MAJIC, DGFiP)',
        url: 'https://www.data.gouv.fr/',
        desc: 'Propriétaires fonciers nominatifs — accès restreint DGFiP.',
        usage: 'Voir docs/courriers/note-acces-cadastre-nominatif.md.',
      },
      {
        nom: 'RBE complet (bénéficiaires effectifs, INPI)',
        url: 'https://data.inpi.fr/',
        desc: 'Bénéficiaires effectifs — accès sur intérêt légitime.',
        usage: 'Voir docs/courriers/inpi-rbe-acces-interet-legitime.md.',
      },
      {
        nom: 'BRIS (registres du commerce UE)',
        url: 'https://e-justice.europa.eu/',
        desc: 'Pas d’API publique (portail e-Justice seulement).',
        usage: 'Exclu faute d’API (ADR-023) ; alternative : GLEIF.',
      },
    ],
  },
  {
    titre: 'Archives & infrastructure — à évaluer',
    statut: 'en-attente',
    raison:
      'Sources publiques potentiellement intégrables (API existantes), à évaluer techniquement et juridiquement avant d’en faire des connecteurs.',
    adr: 'ADR-003',
    outils: [
      {
        nom: 'Internet Archive / Wayback Machine',
        url: 'https://archive.org/',
        desc: 'Historique de pages web ; API publique.',
        usage: 'Candidat connecteur (vérification de contenu daté).',
      },
      {
        nom: 'Censys / Shodan (infrastructure)',
        url: 'https://search.censys.io/',
        desc: 'Cartographie d’infrastructure (sites, certificats) — pas de personnes.',
        usage: 'Évaluable pour l’entité SiteWeb, jamais pour des individus.',
      },
    ],
  },
  {
    titre: 'Visualisation & data-journalisme (inspiration)',
    statut: 'manuel',
    raison:
      'Références de visualisation et de narration data, pas des sources de données OSINT du graphe. Utiles pour s’inspirer des formes (réseaux, flux, hiérarchies) et de la méthodo de sourcing.',
    adr: 'ADR-015',
    outils: [
      {
        nom: 'Information is Beautiful',
        url: 'https://informationisbeautiful.net/',
        desc: 'Dataviz éditoriale (David McCandless) ; jeux de données publiés en feuilles Google par visualisation.',
        usage:
          'Inspiration de formes/lisibilité ; si un dataset officiel est cité, remonter à la source.',
      },
      {
        nom: 'Our World in Data',
        url: 'https://ourworldindata.org/',
        desc: 'Data journalism académique ; datasets ouverts et sourcés, souvent dotés d’une API.',
        usage:
          'Source potentiellement citable (contextes), à recouper avec la source primaire officielle.',
      },
      {
        nom: 'The Pudding',
        url: 'https://pudding.cool/',
        desc: 'Essais visuels (visual essays) ; méthodo et code souvent ouverts.',
        usage: 'Inspiration narrative et technique, pas une source de fiche.',
      },
    ],
  },
]
