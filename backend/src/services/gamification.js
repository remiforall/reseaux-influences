import { prisma } from '../utils/prisma.js'

/**
 * Vérifie si un utilisateur peut soumettre un lien (seuil de validations atteint).
 */
export async function peutSoumettre(utilisateurId) {
  const config = await prisma.configGamification.findUnique({
    where: { cle: 'seuil_validations_pour_soumettre' },
  })
  const seuil = parseInt(config?.valeur || '5', 10)

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId },
    select: { validationsEffectuees: true },
  })

  return {
    autorise: (utilisateur?.validationsEffectuees || 0) >= seuil,
    validationsEffectuees: utilisateur?.validationsEffectuees || 0,
    seuilRequis: seuil,
    restantes: Math.max(0, seuil - (utilisateur?.validationsEffectuees || 0)),
  }
}

/**
 * Met à jour les compteurs après une validation et vérifie le consensus.
 */
export async function traiterValidation(utilisateurId, lienId, verdict) {
  // Incrémenter les compteurs de l'utilisateur
  const configPoints = await prisma.configGamification.findUnique({
    where: { cle: 'points_par_validation' },
  })
  const points = parseInt(configPoints?.valeur || '1', 10)

  await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: {
      validationsEffectuees: { increment: 1 },
      points: { increment: points },
    },
  })

  // Mettre à jour les compteurs du lien
  const champCompteur =
    verdict === 'VRAI' ? 'nbValidationsVrai'
    : verdict === 'FAUX' ? 'nbValidationsFaux'
    : 'nbValidationsIndecis'

  const lien = await prisma.lien.update({
    where: { id: lienId },
    data: { [champCompteur]: { increment: 1 } },
  })

  // Recalculer le score de confiance
  const totalVraiFaux = lien.nbValidationsVrai + lien.nbValidationsFaux
  const scoreConfiance = totalVraiFaux > 0
    ? (lien.nbValidationsVrai / totalVraiFaux) * 100
    : 0

  await prisma.lien.update({
    where: { id: lienId },
    data: { scoreConfiance },
  })

  // Vérifier le consensus
  await verifierConsensus(lienId)

  // Mettre à jour le niveau de l'utilisateur
  await mettreAJourNiveau(utilisateurId)

  // Vérifier et attribuer les badges
  await verifierBadges(utilisateurId)
}

/**
 * Vérifie si un lien a atteint le consensus et met à jour son statut.
 */
async function verifierConsensus(lienId) {
  const lien = await prisma.lien.findUnique({ where: { id: lienId } })
  if (!lien || lien.statut !== 'EN_ATTENTE') return

  const configNb = await prisma.configGamification.findUnique({
    where: { cle: 'nb_validations_consensus' },
  })
  const seuilNb = parseInt(configNb?.valeur || '5', 10)

  const nbTotal = lien.nbValidationsVrai + lien.nbValidationsFaux + lien.nbValidationsIndecis
  if (nbTotal < seuilNb) return

  const totalVraiFaux = lien.nbValidationsVrai + lien.nbValidationsFaux
  if (totalVraiFaux === 0) return

  const ratioVrai = lien.nbValidationsVrai / totalVraiFaux
  const ratioFaux = lien.nbValidationsFaux / totalVraiFaux

  const configValidation = await prisma.configGamification.findUnique({
    where: { cle: 'seuil_consensus_validation' },
  })
  const seuilValidation = parseFloat(configValidation?.valeur || '0.7')

  const configRejet = await prisma.configGamification.findUnique({
    where: { cle: 'seuil_consensus_rejet' },
  })
  const seuilRejet = parseFloat(configRejet?.valeur || '0.7')

  let nouveauStatut = null
  if (ratioVrai >= seuilValidation) {
    nouveauStatut = 'VALIDE'
  } else if (ratioFaux >= seuilRejet) {
    nouveauStatut = 'REJETE'
  }

  if (nouveauStatut) {
    await prisma.lien.update({
      where: { id: lienId },
      data: { statut: nouveauStatut },
    })

    // Mettre à jour les compteurs de l'auteur du lien
    if (lien.creeParId) {
      const configPts = await prisma.configGamification.findUnique({
        where: {
          cle: nouveauStatut === 'VALIDE'
            ? 'points_par_soumission_acceptee'
            : 'points_par_soumission_rejetee',
        },
      })
      const pts = parseInt(configPts?.valeur || '0', 10)

      const updateData = { points: { increment: pts } }
      if (nouveauStatut === 'VALIDE') {
        updateData.soumissionsAcceptees = { increment: 1 }
      }

      await prisma.utilisateur.update({
        where: { id: lien.creeParId },
        data: updateData,
      })

      await verifierBadges(lien.creeParId)
    }
  }
}

/**
 * Met à jour le niveau d'un utilisateur en fonction de ses points.
 */
async function mettreAJourNiveau(utilisateurId) {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId },
    select: { points: true },
  })
  if (!utilisateur) return

  const configs = await prisma.configGamification.findMany({
    where: {
      cle: {
        in: ['seuil_niveau_intermediaire', 'seuil_niveau_expert', 'seuil_niveau_moderateur'],
      },
    },
  })

  const seuils = {}
  for (const c of configs) {
    seuils[c.cle] = parseInt(c.valeur, 10)
  }

  let niveau = 'DEBUTANT'
  if (utilisateur.points >= (seuils.seuil_niveau_moderateur || 500)) {
    niveau = 'MODERATEUR'
  } else if (utilisateur.points >= (seuils.seuil_niveau_expert || 200)) {
    niveau = 'EXPERT'
  } else if (utilisateur.points >= (seuils.seuil_niveau_intermediaire || 50)) {
    niveau = 'INTERMEDIAIRE'
  }

  await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: { niveau },
  })
}

/**
 * Vérifie et attribue les badges éligibles à un utilisateur.
 */
export async function verifierBadges(utilisateurId) {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: utilisateurId },
    include: { badges: { select: { badgeId: true } } },
  })
  if (!utilisateur) return

  const badgesExistants = new Set(utilisateur.badges.map((b) => b.badgeId))

  const tousLesBadges = await prisma.badge.findMany({
    where: { estActif: true },
  })

  for (const badge of tousLesBadges) {
    if (badgesExistants.has(badge.id)) continue

    const eligible = await verifierConditionBadge(utilisateurId, badge.conditions)
    if (eligible) {
      await prisma.utilisateurBadge.create({
        data: {
          utilisateurId,
          badgeId: badge.id,
        },
      })
    }
  }
}

async function verifierConditionBadge(utilisateurId, conditions) {
  const { type } = conditions

  if (type === 'validations') {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: { validationsEffectuees: true },
    })
    return (utilisateur?.validationsEffectuees || 0) >= conditions.seuil
  }

  if (type === 'soumissions_acceptees') {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: { soumissionsAcceptees: true },
    })
    return (utilisateur?.soumissionsAcceptees || 0) >= conditions.seuil
  }

  if (type === 'precision') {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: { tauxPrecision: true, validationsEffectuees: true },
    })
    return (
      (utilisateur?.validationsEffectuees || 0) >= conditions.min_validations &&
      (utilisateur?.tauxPrecision || 0) >= conditions.seuil * 100
    )
  }

  if (type === 'validations_type_lien') {
    const count = await prisma.validation.count({
      where: {
        utilisateurId,
        lien: { typeLien: { code: conditions.type_lien } },
      },
    })
    return count >= conditions.seuil
  }

  if (type === 'validations_type_media') {
    const count = await prisma.validation.count({
      where: {
        utilisateurId,
        lien: { source: { typeMedia: conditions.type_media } },
      },
    })
    return count >= conditions.seuil
  }

  if (type === 'inscription_rang') {
    const rang = await prisma.utilisateur.count({
      where: {
        dateInscription: {
          lte: (await prisma.utilisateur.findUnique({
            where: { id: utilisateurId },
            select: { dateInscription: true },
          }))?.dateInscription,
        },
      },
    })
    return rang <= conditions.seuil
  }

  return false
}
