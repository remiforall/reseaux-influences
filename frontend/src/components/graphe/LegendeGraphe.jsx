/**
 * LegendeGraphe — légende permanente et accessible du graphe ego-network.
 *
 * CUD-safe : chaque entrée cumule trois redondances (couleur + icône + texte).
 * Note explicite en bas : « La couleur n'est jamais le seul indicateur ».
 * La légende est toujours visible (pas conditionnelle).
 *
 * @param {{ className?: string }} props
 */
import { COULEURS_NOEUDS, STYLES_ARETES } from './constants'

function LegendeGraphe({ className = '' }) {
  return (
    <aside
      aria-label="Légende du graphe"
      className={`bg-white border border-gray-200 rounded-lg p-4 text-sm space-y-4 ${className}`}
    >
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Légende</h2>

      {/* Types de nœuds */}
      <section aria-labelledby="legende-noeuds">
        <h3 id="legende-noeuds" className="text-xs font-semibold text-gray-600 mb-2 uppercase">
          Types d'entité
        </h3>
        <ul className="space-y-1.5">
          {Object.entries(COULEURS_NOEUDS).map(([, { couleur, icone, libelle }]) => (
            <li key={libelle} className="flex items-center gap-2">
              {/* Pastille couleur */}
              <span
                aria-hidden="true"
                style={{ backgroundColor: couleur }}
                className="w-4 h-4 rounded-sm flex-shrink-0"
              />
              {/* Icône textuelle */}
              <span
                aria-hidden="true"
                style={{ color: couleur }}
                className="font-bold text-base leading-none"
              >
                {icone}
              </span>
              {/* Texte */}
              <span className="text-gray-800">{libelle}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Styles des arêtes */}
      <section aria-labelledby="legende-aretes">
        <h3 id="legende-aretes" className="text-xs font-semibold text-gray-600 mb-2 uppercase">
          Statut des liens
        </h3>
        <ul className="space-y-1.5">
          {STYLES_ARETES.map(({ statut, libelle, dasharray, epaisseur }) => (
            <li key={statut} className="flex items-center gap-3">
              {/* Ligne SVG illustrative */}
              <svg
                aria-hidden="true"
                width="40"
                height="10"
                className="flex-shrink-0"
                focusable="false"
              >
                <line
                  x1="0"
                  y1="5"
                  x2="40"
                  y2="5"
                  stroke="#6b7280"
                  strokeWidth={epaisseur}
                  strokeDasharray={dasharray === 'none' ? undefined : dasharray}
                />
              </svg>
              {/* Texte */}
              <span className="text-gray-800">{libelle}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Note CUD obligatoire */}
      <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">
        La couleur n'est jamais le seul indicateur — l'icône et le texte précisent toujours le type.
      </p>
    </aside>
  )
}

export default LegendeGraphe
