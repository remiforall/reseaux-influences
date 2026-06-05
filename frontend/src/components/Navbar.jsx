/**
 * Navbar — barre de navigation principale.
 *
 * Lien "Enrichir" visible uniquement si un token JWT est présent dans
 * localStorage (utilisateur authentifié). Lecture synchrone au render,
 * pas de requête réseau.
 *
 * Accessibilité AAA :
 *   - <nav> avec aria-label
 *   - Lien actif identifiable par classe visuelle + aria-current (géré
 *     par NavLink de react-router-dom si besoin — ici Link simple)
 *   - Cibles ≥ 44 px (h-16 sur la nav, py suffisant sur les liens)
 *   - Icône textuelle + libellé texte sur tous les liens (pas icône seule)
 *   - focus-visible-ring sur tous les éléments focalisables
 */
import { Link } from 'react-router-dom'

function Navbar() {
  /* Lecture synchrone du token — pas de state, pas d'effet */
  const estConnecte = Boolean(localStorage.getItem('token'))

  return (
    <nav className="bg-primary text-white shadow-lg" aria-label="Navigation principale">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / accueil */}
          <Link
            to="/"
            className="text-xl font-bold hover:text-accent focus-visible-ring rounded transition-colors"
            aria-label="Réseaux d'Influence — Accueil"
          >
            Réseaux d'Influence
          </Link>

          {/* Liens principaux */}
          <ul className="flex items-center space-x-1" role="list">
            <li>
              <Link
                to="/"
                className="flex items-center gap-1 px-3 py-2 rounded hover:text-accent focus-visible-ring transition-colors min-h-[44px]"
              >
                <span aria-hidden="true">⌂</span>
                <span>Accueil</span>
              </Link>
            </li>
            <li>
              <Link
                to="/liens"
                className="flex items-center gap-1 px-3 py-2 rounded hover:text-accent focus-visible-ring transition-colors min-h-[44px]"
              >
                <span aria-hidden="true">⇆</span>
                <span>Liens</span>
              </Link>
            </li>
            <li>
              <Link
                to="/graphe"
                className="flex items-center gap-1 px-3 py-2 rounded hover:text-accent focus-visible-ring transition-colors min-h-[44px]"
              >
                <span aria-hidden="true">◉</span>
                <span>Graphe</span>
              </Link>
            </li>
            {/* Lien Enrichissement — visible uniquement si authentifié */}
            {estConnecte && (
              <li>
                <Link
                  to="/enrichissement"
                  className="flex items-center gap-1 px-3 py-2 rounded hover:text-accent focus-visible-ring transition-colors min-h-[44px]"
                  aria-label="Importer une fiche — chercher et importer des données depuis des sources publiques"
                >
                  {/* Icône import : double indicateur pour CUD */}
                  <span aria-hidden="true">⚲</span>
                  <span>Importer</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
