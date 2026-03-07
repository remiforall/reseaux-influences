import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Types de liens
  const typesLiens = [
    { code: 'famille', libelle: 'Lien familial', description: 'Relation familiale (mariage, parenté, etc.)', categorie: 'personnel', couleur: '#E74C3C' },
    { code: 'amitie', libelle: 'Amitié / Proximité', description: 'Relation amicale ou de proximité connue', categorie: 'personnel', couleur: '#F39C12' },
    { code: 'politique', libelle: 'Lien politique', description: 'Collaboration politique, parti, coalition', categorie: 'professionnel', couleur: '#3498DB' },
    { code: 'economique', libelle: 'Lien économique', description: "Relation d'affaires, actionnariat, conseil", categorie: 'professionnel', couleur: '#2ECC71' },
    { code: 'mediatique', libelle: 'Lien médiatique', description: 'Collaboration médiatique, co-publication', categorie: 'professionnel', couleur: '#9B59B6' },
    { code: 'institutionnel', libelle: 'Lien institutionnel', description: 'Relation via institution, ONG, fondation', categorie: 'institutionnel', couleur: '#1ABC9C' },
    { code: 'academique', libelle: 'Lien académique', description: 'Co-scolarité, mentorat, recherche commune', categorie: 'institutionnel', couleur: '#34495E' },
    { code: 'financement', libelle: 'Financement / Mécénat', description: 'Financement, don, mécénat, sponsoring', categorie: 'professionnel', couleur: '#E67E22' },
    { code: 'lobbying', libelle: "Lobbying / Influence", description: "Activité de lobbying ou d'influence directe", categorie: 'professionnel', couleur: '#C0392B' },
    { code: 'juridique', libelle: 'Lien juridique', description: 'Affaire judiciaire commune, avocat, procès', categorie: 'institutionnel', couleur: '#7F8C8D' },
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
    { code: 'verificateur_bronze', nom: 'Vérificateur Bronze', description: 'A validé au moins 10 liens', categorie: 'validation', conditions: { type: 'validations', seuil: 10 }, couleur: '#CD7F32' },
    { code: 'verificateur_argent', nom: 'Vérificateur Argent', description: 'A validé au moins 50 liens', categorie: 'validation', conditions: { type: 'validations', seuil: 50 }, couleur: '#C0C0C0' },
    { code: 'verificateur_or', nom: 'Vérificateur Or', description: 'A validé au moins 200 liens', categorie: 'validation', conditions: { type: 'validations', seuil: 200 }, couleur: '#FFD700' },
    { code: 'moderateur', nom: 'Modérateur', description: 'A validé 100+ liens avec une précision de 80%+', categorie: 'validation', conditions: { type: 'precision', seuil: 0.8, min_validations: 100 }, couleur: '#8E44AD' },
    // Soumission
    { code: 'contributeur_bronze', nom: 'Contributeur Bronze', description: 'A soumis 5 liens acceptés', categorie: 'soumission', conditions: { type: 'soumissions_acceptees', seuil: 5 }, couleur: '#CD7F32' },
    { code: 'contributeur_argent', nom: 'Contributeur Argent', description: 'A soumis 20 liens acceptés', categorie: 'soumission', conditions: { type: 'soumissions_acceptees', seuil: 20 }, couleur: '#C0C0C0' },
    { code: 'contributeur_or', nom: 'Contributeur Or', description: 'A soumis 100 liens acceptés', categorie: 'soumission', conditions: { type: 'soumissions_acceptees', seuil: 100 }, couleur: '#FFD700' },
    // Médias
    { code: 'expert_presse', nom: 'Expert Presse', description: 'A validé 10+ liens sourcés par la presse écrite', categorie: 'media', conditions: { type: 'validations_type_media', type_media: 'PRESSE_ECRITE', seuil: 10 }, couleur: '#2980B9' },
    { code: 'expert_tv', nom: 'Expert Télévision', description: 'A validé 10+ liens sourcés par la télévision', categorie: 'media', conditions: { type: 'validations_type_media', type_media: 'TELEVISION', seuil: 10 }, couleur: '#E74C3C' },
    { code: 'expert_documents', nom: 'Expert Documents', description: 'A validé 10+ liens sourcés par des documents officiels', categorie: 'media', conditions: { type: 'validations_type_media', type_media: 'DOCUMENT_OFFICIEL', seuil: 10 }, couleur: '#27AE60' },
    // Relations
    { code: 'expert_politique', nom: 'Expert Politique', description: 'A validé 10+ liens de type politique', categorie: 'relation', conditions: { type: 'validations_type_lien', type_lien: 'politique', seuil: 10 }, couleur: '#3498DB' },
    { code: 'expert_economique', nom: 'Expert Économique', description: 'A validé 10+ liens de type économique', categorie: 'relation', conditions: { type: 'validations_type_lien', type_lien: 'economique', seuil: 10 }, couleur: '#2ECC71' },
    { code: 'expert_familial', nom: 'Expert Familial', description: 'A validé 10+ liens de type familial', categorie: 'relation', conditions: { type: 'validations_type_lien', type_lien: 'famille', seuil: 10 }, couleur: '#E74C3C' },
    { code: 'expert_lobbying', nom: 'Expert Lobbying', description: 'A validé 10+ liens de type lobbying', categorie: 'relation', conditions: { type: 'validations_type_lien', type_lien: 'lobbying', seuil: 10 }, couleur: '#C0392B' },
    // Spéciaux
    { code: 'pionnier', nom: 'Pionnier', description: 'Parmi les 100 premiers inscrits', categorie: 'special', conditions: { type: 'inscription_rang', seuil: 100 }, couleur: '#F39C12' },
    { code: 'premier_lien', nom: 'Premier Lien', description: 'A soumis son premier lien accepté', categorie: 'special', conditions: { type: 'soumissions_acceptees', seuil: 1 }, couleur: '#1ABC9C' },
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    })
  }
  console.log(`${badges.length} badges insérés.`)

  // Configuration gamification
  const configs = [
    { cle: 'seuil_validations_pour_soumettre', valeur: '5', description: 'Nombre minimum de validations avant de pouvoir soumettre un lien' },
    { cle: 'points_par_validation', valeur: '1', description: 'Points gagnés par validation effectuée' },
    { cle: 'points_par_soumission_acceptee', valeur: '5', description: 'Points gagnés quand un lien soumis est validé par la communauté' },
    { cle: 'points_par_soumission_rejetee', valeur: '-2', description: 'Points perdus quand un lien soumis est rejeté' },
    { cle: 'seuil_niveau_intermediaire', valeur: '50', description: 'Points requis pour le niveau intermédiaire' },
    { cle: 'seuil_niveau_expert', valeur: '200', description: 'Points requis pour le niveau expert' },
    { cle: 'seuil_niveau_moderateur', valeur: '500', description: 'Points requis pour le niveau modérateur' },
    { cle: 'nb_validations_consensus', valeur: '5', description: "Nombre de validations avant qu'un lien change de statut automatiquement" },
    { cle: 'seuil_consensus_validation', valeur: '0.7', description: 'Ratio vrai/(vrai+faux) requis pour valider automatiquement un lien' },
    { cle: 'seuil_consensus_rejet', valeur: '0.7', description: 'Ratio faux/(vrai+faux) requis pour rejeter automatiquement un lien' },
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
