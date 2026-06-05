/**
 * Constantes partagées pour la visualisation du graphe.
 * Extraites dans un fichier séparé pour respecter la contrainte
 * react-refresh/only-export-components (un fichier = soit des composants
 * soit des constantes, pas les deux).
 */

/** Types de nœuds — palette CUD-safe */
export const COULEURS_NOEUDS = {
  Personne: { couleur: '#2563eb', icone: '●', libelle: 'Personne', forme: 'circle' },
  PersonneEnAttente: {
    couleur: '#2563eb',
    icone: '◐',
    libelle: 'Personne (brouillon)',
    forme: 'circle-dashed',
  },
  Organisation: { couleur: '#f59e0b', icone: '■', libelle: 'Organisation', forme: 'rect' },
  SiteWeb: { couleur: '#7c3aed', icone: '◆', libelle: 'Site web', forme: 'diamond' },
}

/** Styles des arêtes selon statut */
export const STYLES_ARETES = [
  { statut: 'VALIDE', libelle: 'Lien validé', dasharray: 'none', epaisseur: 2 },
  {
    statut: 'EN_ATTENTE',
    libelle: 'Lien en attente de validation',
    dasharray: '6 3',
    epaisseur: 1.5,
  },
  { statut: 'REJETE', libelle: 'Lien rejeté', dasharray: '2 4', epaisseur: 1 },
]
