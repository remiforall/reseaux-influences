/**
 * RegionAnnonces — zone aria-live pour les annonces dynamiques.
 *
 * Rôle : informer les lecteurs d'écran de l'évolution de l'état sans
 * déplacer le focus. On utilise `polite` (et non `assertive`) pour ne
 * pas interrompre une lecture en cours.
 *
 * @param {{ message: string|null }} props
 */
function RegionAnnonces({ message }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message ?? ''}
    </div>
  )
}

export default RegionAnnonces
