/**
 * TableauGraphe — alternative tableau accessible au graphe SVG.
 *
 * Structure : une ligne par arête (lien), colonnes :
 *   Entité source | Type de lien | Entité cible | Statut | Source | Date
 *
 * Fonctionnalités :
 *   - Tri par colonne (clavier : Enter/Space sur l'en-tête)
 *   - Navigation clavier dans le tableau : Tab entre cellules focalisables
 *   - Enter sur une ligne → callback onSelectionEntite (pour naviguer vers la fiche)
 *
 * Accessibilité AAA :
 *   - <caption> descriptive
 *   - <th scope="col"> sur chaque en-tête
 *   - aria-sort sur la colonne triée
 *   - Contraste 7:1 sur les textes (palette dark)
 *
 * @param {{
 *   noeuds: Array<{ id: string, nom: string, type: string, statut: string }>,
 *   aretes: Array<{
 *     id: string,
 *     sourceId: string,
 *     cibleId: string,
 *     typeLien: { code: string, libelle: string },
 *     statut: string,
 *     source?: { nom: string, url: string },
 *     createdAt?: string,
 *   }>,
 *   onSelectionEntite: (id: string) => void,
 * }} props
 */
import { useState, useMemo } from 'react'
import { urlExterneSure } from '../../utils/securite'

const COLONNES = [
  { cle: 'source', libelle: 'Entité source' },
  { cle: 'typeLien', libelle: 'Type de lien' },
  { cle: 'cible', libelle: 'Entité cible' },
  { cle: 'statut', libelle: 'Statut' },
  { cle: 'sourceLien', libelle: 'Source' },
  { cle: 'date', libelle: 'Date' },
]

const LIBELLE_STATUT = {
  VALIDE: 'Validé',
  EN_ATTENTE: 'En attente',
  REJETE: 'Rejeté',
}

function TableauGraphe({ noeuds = [], aretes = [], onSelectionEntite }) {
  const [triColonne, setTriColonne] = useState('source')
  const [triSens, setTriSens] = useState('asc')

  /* Index des nœuds par id pour un accès O(1) */
  const noeudsParId = useMemo(() => {
    const map = new Map()
    noeuds.forEach((n) => map.set(n.id, n))
    return map
  }, [noeuds])

  /* Lignes du tableau construites depuis les arêtes */
  const lignes = useMemo(() => {
    return aretes.map((a) => {
      const noeudSource = noeudsParId.get(a.sourceId) ?? { nom: a.sourceId, type: '?' }
      const noeudCible = noeudsParId.get(a.cibleId) ?? { nom: a.cibleId, type: '?' }
      const dateAffichee = a.createdAt
        ? new Date(a.createdAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '—'
      return {
        id: a.id,
        sourceId: a.sourceId,
        cibleId: a.cibleId,
        source: noeudSource.nom ?? a.sourceId,
        typeLien: a.typeLien?.libelle ?? a.typeLien?.code ?? '—',
        cible: noeudCible.nom ?? a.cibleId,
        statut: LIBELLE_STATUT[a.statut] ?? a.statut ?? '—',
        statutCode: a.statut,
        sourceLien: a.source?.nom ?? '—',
        sourceLienUrl: a.source?.url ?? null,
        date: dateAffichee,
        dateIso: a.createdAt ?? null,
      }
    })
  }, [aretes, noeudsParId])

  /* Tri */
  const lignesTries = useMemo(() => {
    return [...lignes].sort((a, b) => {
      const va = a[triColonne] ?? ''
      const vb = b[triColonne] ?? ''
      const cmp = va.localeCompare(vb, 'fr', { sensitivity: 'base' })
      return triSens === 'asc' ? cmp : -cmp
    })
  }, [lignes, triColonne, triSens])

  const changerTri = (cle) => {
    if (cle === triColonne) {
      setTriSens((s) => (s === 'asc' ? 'desc' : 'asc'))
    } else {
      setTriColonne(cle)
      setTriSens('asc')
    }
  }

  const handleKeyDownEnTete = (e, cle) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      changerTri(cle)
    }
  }

  /* handleKeyDownLigne supprimé : les <button> dans chaque cellule
   * gèrent déjà l'interaction clavier. tabIndex sur <tr> retiré
   * pour éviter le triple focus (B-03 fix). */

  if (aretes.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        Aucun lien à afficher avec les filtres actuels.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <caption className="text-left px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50">
          Liens du réseau — {aretes.length} lien{aretes.length > 1 ? 's' : ''} affiché
          {aretes.length > 1 ? 's' : ''}
        </caption>
        <thead className="bg-gray-50">
          <tr>
            {COLONNES.map(({ cle, libelle }) => {
              const estTrie = cle === triColonne
              const ariaSens = estTrie ? (triSens === 'asc' ? 'ascending' : 'descending') : 'none'
              return (
                <th
                  key={cle}
                  scope="col"
                  aria-sort={ariaSens}
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDownEnTete(e, cle)}
                  onClick={() => changerTri(cle)}
                  className={[
                    'px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer select-none',
                    'focus-visible-ring hover:bg-gray-100',
                    estTrie ? 'bg-gray-100' : '',
                  ].join(' ')}
                >
                  <span className="flex items-center gap-1">
                    {libelle}
                    <span aria-hidden="true" className="text-gray-400">
                      {estTrie ? (triSens === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {lignesTries.map((row) => (
            <tr
              key={row.id}
              aria-label={`Lien de ${row.source} vers ${row.cible} — ${row.typeLien}`}
              className="hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium text-gray-900">
                <button
                  type="button"
                  onClick={() => onSelectionEntite?.(row.sourceId)}
                  className="text-secondary underline focus-visible-ring rounded text-left"
                >
                  {row.source}
                </button>
              </td>
              <td className="px-4 py-3 text-gray-700">{row.typeLien}</td>
              <td className="px-4 py-3 font-medium text-gray-900">
                <button
                  type="button"
                  onClick={() => onSelectionEntite?.(row.cibleId)}
                  className="text-secondary underline focus-visible-ring rounded text-left"
                >
                  {row.cible}
                </button>
              </td>
              <td className="px-4 py-3">
                <StatutBadge statut={row.statutCode} libelle={row.statut} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {urlExterneSure(row.sourceLienUrl) ? (
                  <a
                    href={urlExterneSure(row.sourceLienUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary underline focus-visible-ring rounded"
                    aria-label={`Source : ${row.sourceLien} — ouvrir dans un nouvel onglet`}
                  >
                    {row.sourceLien}
                  </a>
                ) : (
                  row.sourceLien
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {row.dateIso ? <time dateTime={row.dateIso}>{row.date}</time> : row.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * StatutBadge — badge CUD-safe pour le statut d'un lien.
 * Triple redondance : icône + texte + couleur de fond.
 * Utilisée dans les cellules JSX de TableauGraphe.
 */
// eslint-disable-next-line no-unused-vars
function StatutBadge({ statut, libelle }) {
  const CONFIG = {
    VALIDE: { icone: '✓', classes: 'bg-green-100 text-green-800' },
    EN_ATTENTE: { icone: '⏳', classes: 'bg-amber-100 text-amber-800' },
    REJETE: { icone: '✕', classes: 'bg-red-100 text-red-800' },
  }
  const cfg = CONFIG[statut] ?? { icone: '?', classes: 'bg-gray-100 text-gray-700' }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.classes}`}
    >
      <span aria-hidden="true">{cfg.icone}</span>
      <span>{libelle}</span>
    </span>
  )
}

export default TableauGraphe
