import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Types de liens
  const typesLiens = [
    {
      code: 'famille',
      libelle: 'Lien familial',
      description: 'Relation familiale (mariage, parenté, etc.)',
      categorie: 'personnel',
      couleur: '#E74C3C',
    },
    {
      code: 'amitie',
      libelle: 'Amitié / Proximité',
      description: 'Relation amicale ou de proximité connue',
      categorie: 'personnel',
      couleur: '#F39C12',
    },
    {
      code: 'politique',
      libelle: 'Lien politique',
      description: 'Collaboration politique, parti, coalition',
      categorie: 'professionnel',
      couleur: '#3498DB',
    },
    {
      code: 'economique',
      libelle: 'Lien économique',
      description: "Relation d'affaires, actionnariat, conseil",
      categorie: 'professionnel',
      couleur: '#2ECC71',
    },
    {
      code: 'mediatique',
      libelle: 'Lien médiatique',
      description: 'Collaboration médiatique, co-publication',
      categorie: 'professionnel',
      couleur: '#9B59B6',
    },
    {
      code: 'institutionnel',
      libelle: 'Lien institutionnel',
      description: 'Relation via institution, ONG, fondation',
      categorie: 'institutionnel',
      couleur: '#1ABC9C',
    },
    {
      code: 'academique',
      libelle: 'Lien académique',
      description: 'Co-scolarité, mentorat, recherche commune',
      categorie: 'institutionnel',
      couleur: '#34495E',
    },
    {
      code: 'financement',
      libelle: 'Financement / Mécénat',
      description: 'Financement, don, mécénat, sponsoring',
      categorie: 'professionnel',
      couleur: '#E67E22',
    },
    {
      code: 'lobbying',
      libelle: 'Lobbying / Influence',
      description: "Activité de lobbying ou d'influence directe",
      categorie: 'professionnel',
      couleur: '#C0392B',
    },
    {
      code: 'juridique',
      libelle: 'Lien juridique',
      description: 'Affaire judiciaire commune, avocat, procès',
      categorie: 'institutionnel',
      couleur: '#7F8C8D',
    },
    // --- Nouveaux types OSINT (module enrichissement) ---
    {
      code: 'DIRIGEANT',
      libelle: 'Dirigeant·e de',
      description: "Relation de direction au sein d'une organisation",
      categorie: 'professionnel',
      couleur: '#2980B9',
    },
    {
      code: 'BENEFICIAIRE_EFFECTIF',
      libelle: 'Bénéficiaire effectif·ve de',
      description: 'Bénéficiaire effectif au sens RNE / Pappers',
      categorie: 'financier',
      couleur: '#27AE60',
    },
    {
      code: 'DETENTION_CAPITAL',
      libelle: 'Détention de capital',
      description: 'Détient une participation minoritaire au capital de (origine → cible)',
      categorie: 'financier',
      couleur: '#117A65',
    },
    {
      code: 'ACTIONNAIRE_MAJORITAIRE',
      libelle: 'Actionnaire majoritaire',
      description:
        'Détient la majorité du capital OU des droits de vote (contrôle), origine → cible',
      categorie: 'financier',
      couleur: '#0E6655',
    },
    {
      code: 'FILIALE',
      libelle: 'Société mère / filiale',
      description: "L'origine contrôle la cible comme filiale (détention quasi totale)",
      categorie: 'financier',
      couleur: '#1A5276',
    },
    {
      code: 'ADMINISTRATEUR',
      libelle: 'Administrateur·rice',
      description:
        'Membre du conseil d’administration / de surveillance (origine = personne → cible = société). Jetons de présence en description si sourcés (URD).',
      categorie: 'professionnel',
      couleur: '#6C3483',
    },
    {
      code: 'MANDAT_ELECTIF',
      libelle: 'Mandat électif',
      description: 'Mandat électif (P39 Wikidata)',
      categorie: 'politique',
      couleur: '#8E44AD',
    },
    {
      code: 'EMPLOI',
      libelle: 'Emploi salarié',
      description: 'Relation employeur–salarié (P108 Wikidata)',
      categorie: 'professionnel',
      couleur: '#16A085',
    },
    {
      code: 'AFFILIATION_PARTI',
      libelle: 'Affiliation à un parti',
      description: 'Appartenance à un parti politique (P102 Wikidata)',
      categorie: 'politique',
      couleur: '#2C3E50',
    },
    {
      code: 'CONJOINT',
      libelle: 'Conjoint·e',
      description: 'Relation conjugale (P26 Wikidata — personnes publiques seulement)',
      categorie: 'familial',
      couleur: '#E74C3C',
    },
    {
      code: 'FONDATEUR',
      libelle: 'Fondateur·rice de',
      description: 'Relation de fondation (P112 Wikidata)',
      categorie: 'professionnel',
      couleur: '#D35400',
    },
    {
      code: 'EDITEUR_DE',
      libelle: 'Éditeur·rice de',
      description: 'Relation éditoriale (P98 Wikidata)',
      categorie: 'media',
      couleur: '#6C3483',
    },
    {
      code: 'PRODUCTEUR_DE',
      libelle: 'Producteur·rice de',
      description: 'Relation de production (P162 Wikidata)',
      categorie: 'media',
      couleur: '#1A5276',
    },
    {
      code: 'TITULAIRE_DOMAINE',
      libelle: 'Titulaire du domaine',
      description: 'Titulaire enregistré du nom de domaine (RDAP)',
      categorie: 'numerique',
      couleur: '#117A65',
    },
    {
      code: 'HEBERGE_PAR',
      libelle: 'Hébergé·e par',
      description: 'Hébergement du site web (NS déduit par RDAP)',
      categorie: 'numerique',
      couleur: '#1F618D',
    },
    {
      code: 'HEBERGEUR_DE',
      libelle: 'Hébergeur·euse de',
      description: "Prestation d'hébergement fournie",
      categorie: 'numerique',
      couleur: '#1F618D',
    },
    {
      code: 'EDITEUR_DU_SITE',
      libelle: 'Éditeur·rice du site',
      description: 'Responsable éditorial du site web',
      categorie: 'numerique',
      couleur: '#5B2C6F',
    },
    // --- Types OSINT phase 2 (ADR-012 : HATVP, BODACC, Parlementaires, DataESR) ---
    {
      code: 'HAUT_FONCTIONNAIRE',
      libelle: 'Haut·e fonctionnaire',
      description: 'Personne exerçant une haute fonction publique (HATVP)',
      categorie: 'institutionnel',
      couleur: '#6D4C8C',
    },
    {
      code: 'AVANTAGE_RECU',
      libelle: 'Avantage reçu de',
      description:
        "Avantage (cadeau, repas, rémunération) reçu d'un laboratoire pharmaceutique (Transparence Santé)",
      categorie: 'financier',
      couleur: '#A93226',
    },
    {
      code: 'CONVENTION_SIGNEE',
      libelle: 'Convention signée avec',
      description:
        'Convention signée entre un professionnel de santé et un laboratoire (Transparence Santé)',
      categorie: 'financier',
      couleur: '#C0392B',
    },
    {
      code: 'MEMBRE_COMMISSION',
      libelle: 'Membre de commission',
      description: 'Appartenance à une commission parlementaire permanente ou spéciale',
      categorie: 'institutionnel',
      couleur: '#1A5276',
    },
    {
      code: 'TUTELLE',
      libelle: 'Sous tutelle de',
      description:
        'Relation de tutelle institutionnelle (DataESR : laboratoire / établissement de rattachement)',
      categorie: 'institutionnel',
      couleur: '#117A65',
    },
    // --- Types historiques (Passe 4 — dimension géo-historique) ---
    {
      code: 'ANCIEN_MANDAT',
      libelle: 'Ancien mandat électif',
      description: 'Mandat électif passé (terminé)',
      categorie: 'politique',
      couleur: '#5D6D7E',
    },
    {
      code: 'EX_CONJOINT',
      libelle: 'Ex-conjoint·e',
      description: 'Lien conjugal éteint (divorce, séparation légale)',
      categorie: 'familial',
      couleur: '#CB4335',
    },
  ]

  for (const type of typesLiens) {
    await prisma.typeLien.upsert({
      where: { code: type.code },
      update: type,
      create: type,
    })
  }
  console.log(`${typesLiens.length} types de liens insérés.`)

  // Badges
  const badges = [
    // Validation
    {
      code: 'verificateur_bronze',
      nom: 'Vérificateur Bronze',
      description: 'A validé au moins 10 liens',
      categorie: 'validation',
      conditions: { type: 'validations', seuil: 10 },
      couleur: '#CD7F32',
    },
    {
      code: 'verificateur_argent',
      nom: 'Vérificateur Argent',
      description: 'A validé au moins 50 liens',
      categorie: 'validation',
      conditions: { type: 'validations', seuil: 50 },
      couleur: '#C0C0C0',
    },
    {
      code: 'verificateur_or',
      nom: 'Vérificateur Or',
      description: 'A validé au moins 200 liens',
      categorie: 'validation',
      conditions: { type: 'validations', seuil: 200 },
      couleur: '#FFD700',
    },
    {
      code: 'moderateur',
      nom: 'Modérateur',
      description: 'A validé 100+ liens avec une précision de 80%+',
      categorie: 'validation',
      conditions: { type: 'precision', seuil: 0.8, min_validations: 100 },
      couleur: '#8E44AD',
    },
    // Soumission
    {
      code: 'contributeur_bronze',
      nom: 'Contributeur Bronze',
      description: 'A soumis 5 liens acceptés',
      categorie: 'soumission',
      conditions: { type: 'soumissions_acceptees', seuil: 5 },
      couleur: '#CD7F32',
    },
    {
      code: 'contributeur_argent',
      nom: 'Contributeur Argent',
      description: 'A soumis 20 liens acceptés',
      categorie: 'soumission',
      conditions: { type: 'soumissions_acceptees', seuil: 20 },
      couleur: '#C0C0C0',
    },
    {
      code: 'contributeur_or',
      nom: 'Contributeur Or',
      description: 'A soumis 100 liens acceptés',
      categorie: 'soumission',
      conditions: { type: 'soumissions_acceptees', seuil: 100 },
      couleur: '#FFD700',
    },
    // Médias
    {
      code: 'expert_presse',
      nom: 'Expert Presse',
      description: 'A validé 10+ liens sourcés par la presse écrite',
      categorie: 'media',
      conditions: { type: 'validations_type_media', type_media: 'PRESSE_ECRITE', seuil: 10 },
      couleur: '#2980B9',
    },
    {
      code: 'expert_tv',
      nom: 'Expert Télévision',
      description: 'A validé 10+ liens sourcés par la télévision',
      categorie: 'media',
      conditions: { type: 'validations_type_media', type_media: 'TELEVISION', seuil: 10 },
      couleur: '#E74C3C',
    },
    {
      code: 'expert_documents',
      nom: 'Expert Documents',
      description: 'A validé 10+ liens sourcés par des documents officiels',
      categorie: 'media',
      conditions: { type: 'validations_type_media', type_media: 'DOCUMENT_OFFICIEL', seuil: 10 },
      couleur: '#27AE60',
    },
    // Relations
    {
      code: 'expert_politique',
      nom: 'Expert Politique',
      description: 'A validé 10+ liens de type politique',
      categorie: 'relation',
      conditions: { type: 'validations_type_lien', type_lien: 'politique', seuil: 10 },
      couleur: '#3498DB',
    },
    {
      code: 'expert_economique',
      nom: 'Expert Économique',
      description: 'A validé 10+ liens de type économique',
      categorie: 'relation',
      conditions: { type: 'validations_type_lien', type_lien: 'economique', seuil: 10 },
      couleur: '#2ECC71',
    },
    {
      code: 'expert_familial',
      nom: 'Expert Familial',
      description: 'A validé 10+ liens de type familial',
      categorie: 'relation',
      conditions: { type: 'validations_type_lien', type_lien: 'famille', seuil: 10 },
      couleur: '#E74C3C',
    },
    {
      code: 'expert_lobbying',
      nom: 'Expert Lobbying',
      description: 'A validé 10+ liens de type lobbying',
      categorie: 'relation',
      conditions: { type: 'validations_type_lien', type_lien: 'lobbying', seuil: 10 },
      couleur: '#C0392B',
    },
    // Spéciaux
    {
      code: 'pionnier',
      nom: 'Pionnier',
      description: 'Parmi les 100 premiers inscrits',
      categorie: 'special',
      conditions: { type: 'inscription_rang', seuil: 100 },
      couleur: '#F39C12',
    },
    {
      code: 'premier_lien',
      nom: 'Premier Lien',
      description: 'A soumis son premier lien accepté',
      categorie: 'special',
      conditions: { type: 'soumissions_acceptees', seuil: 1 },
      couleur: '#1ABC9C',
    },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    })
  }
  console.log(`${badges.length} badges insérés.`)

  // Types d'organisations (exemples)
  const organisations = [
    {
      nom: 'Transparency International',
      sigle: 'TI',
      typeOrganisation: 'ONG',
      pays: 'Allemagne',
      description: 'ONG internationale de lutte contre la corruption',
      siteWeb: 'https://www.transparency.org',
      wikidataId: 'Q131566',
      statut: 'VALIDE',
    },
    {
      nom: 'Parlement européen',
      sigle: 'PE',
      typeOrganisation: 'INSTITUTION_PUBLIQUE',
      pays: 'Union européenne',
      description: "Institution parlementaire de l'Union européenne",
      siteWeb: 'https://www.europarl.europa.eu',
      wikidataId: 'Q8889',
      statut: 'VALIDE',
    },
    {
      nom: 'TotalEnergies',
      sigle: 'TTE',
      typeOrganisation: 'ENTREPRISE',
      pays: 'France',
      description: 'Compagnie pétrolière et gazière multinationale',
      siteWeb: 'https://totalenergies.com',
      wikidataId: 'Q154037',
      statut: 'VALIDE',
    },
    {
      nom: 'Reporters sans frontières',
      sigle: 'RSF',
      typeOrganisation: 'ONG',
      pays: 'France',
      description: 'ONG de défense de la liberté de la presse',
      siteWeb: 'https://rsf.org',
      wikidataId: 'Q199584',
      statut: 'VALIDE',
    },
    {
      nom: 'Institut Montaigne',
      typeOrganisation: 'THINK_TANK',
      pays: 'France',
      description: 'Think tank libéral français',
      siteWeb: 'https://www.institutmontaigne.org',
      wikidataId: 'Q3152452',
      statut: 'VALIDE',
    },
  ]

  for (const org of organisations) {
    const existing = await prisma.organisation.findFirst({ where: { nom: org.nom } })
    if (!existing) {
      await prisma.organisation.create({ data: org })
    }
  }
  console.log(`${organisations.length} organisations de référence insérées.`)

  // Configuration gamification
  const configs = [
    {
      cle: 'seuil_validations_pour_soumettre',
      valeur: '5',
      description: 'Nombre minimum de validations avant de pouvoir soumettre un lien',
    },
    {
      cle: 'points_par_validation',
      valeur: '1',
      description: 'Points gagnés par validation effectuée',
    },
    {
      cle: 'points_par_soumission_acceptee',
      valeur: '5',
      description: 'Points gagnés quand un lien soumis est validé par la communauté',
    },
    {
      cle: 'points_par_soumission_rejetee',
      valeur: '-2',
      description: 'Points perdus quand un lien soumis est rejeté',
    },
    {
      cle: 'seuil_niveau_intermediaire',
      valeur: '50',
      description: 'Points requis pour le niveau intermédiaire',
    },
    {
      cle: 'seuil_niveau_expert',
      valeur: '200',
      description: 'Points requis pour le niveau expert',
    },
    {
      cle: 'seuil_niveau_moderateur',
      valeur: '500',
      description: 'Points requis pour le niveau modérateur',
    },
    {
      cle: 'nb_validations_consensus',
      valeur: '5',
      description: "Nombre de validations avant qu'un lien change de statut automatiquement",
    },
    {
      cle: 'seuil_consensus_validation',
      valeur: '0.7',
      description: 'Ratio vrai/(vrai+faux) requis pour valider automatiquement un lien',
    },
    {
      cle: 'seuil_consensus_rejet',
      valeur: '0.7',
      description: 'Ratio faux/(vrai+faux) requis pour rejeter automatiquement un lien',
    },
  ]

  for (const config of configs) {
    await prisma.configGamification.upsert({
      where: { cle: config.cle },
      update: config,
      create: config,
    })
  }
  console.log(`${configs.length} configurations de gamification insérées.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
