/**
 * Footer — pied de page avec les liens légaux obligatoires.
 *
 * Accessibilité AAA : <footer> avec aria-label, liens ≥ 44 px, focus visible.
 * Présent sur toutes les pages (rendu dans App). Les pages cibles sont en
 * statut « PROJET » tant que l'audit juridique n'a pas été rendu (ADR-010/011).
 */
import { Link } from 'react-router-dom'

const LIENS = [
  { to: '/ressources', label: 'Boîte à outils OSINT' },
  { to: '/mentions-legales', label: 'Mentions légales' },
  { to: '/politique-confidentialite', label: 'Confidentialité' },
  { to: '/cgu', label: 'CGU' },
  { to: '/cookies', label: 'Cookies' },
  { to: '/declaration-accessibilite', label: 'Accessibilité' },
  { to: '/mes-droits', label: 'Exercer mes droits' },
]

function Footer() {
  return (
    <footer
      className="bg-gray-100 border-t border-gray-200 mt-12"
      aria-label="Informations légales et accessibilité"
    >
      <div className="container mx-auto px-4 py-6">
        <nav aria-label="Liens légaux">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 justify-center" role="list">
            {LIENS.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="inline-flex items-center min-h-[44px] text-sm text-gray-700 underline hover:text-primary focus-visible-ring rounded"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-center text-xs text-gray-500 mt-4">
          Réseaux d'Influence — projet de journalisme de données en alpha fermée. Sources publiques
          officielles uniquement. Hébergement FR/CH, zéro tracker.
        </p>
      </div>
    </footer>
  )
}

export default Footer
