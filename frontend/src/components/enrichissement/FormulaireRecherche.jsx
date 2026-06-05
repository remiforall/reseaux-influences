/**
 * FormulaireRecherche — formulaire de saisie pour la recherche OSINT.
 *
 * Champs :
 *   - query       : terme de recherche (min 2 caractères)
 *   - types       : personne / organisation / site (au moins un requis)
 *   - connecteurs : subset des connecteurs actifs récupérés par le parent
 *
 * Accessibilité AAA :
 *   - Tous les champs ont un <label htmlFor> + <input id>
 *   - aria-describedby vers les messages d'aide
 *   - Groupe de cases à cocher avec <fieldset> + <legend>
 *   - Bouton ≥ 44 px (min-h-[44px])
 *   - focus-visible-ring sur tous les éléments interactifs
 *
 * @param {{
 *   connecteursDisponibles: string[],
 *   onSubmit: (valeurs: { query: string, types: string[], connecteurs: string[] }) => void,
 *   enChargement: boolean,
 * }} props
 */
import { useState } from 'react'

const TYPES_ENTITE = [
  { code: 'personne', libelle: 'Personne' },
  { code: 'organisation', libelle: 'Organisation' },
  { code: 'site', libelle: 'Site web' },
]

function FormulaireRecherche({ connecteursDisponibles = [], onSubmit, enChargement = false }) {
  const [query, setQuery] = useState('')
  const [types, setTypes] = useState(['personne', 'organisation', 'site'])
  const [connecteurs, setConnecteurs] = useState(connecteursDisponibles)
  const [erreurQuery, setErreurQuery] = useState(null)
  const [erreurTypes, setErreurTypes] = useState(null)

  /** Synchronise connecteurs cochés quand les disponibles changent */
  const connecteursActifs = connecteursDisponibles.length > 0
    ? connecteurs.filter((c) => connecteursDisponibles.includes(c))
    : connecteurs

  const toggleType = (code) => {
    setErreurTypes(null)
    setTypes((prev) =>
      prev.includes(code) ? prev.filter((t) => t !== code) : [...prev, code],
    )
  }

  const toggleConnecteur = (nom) => {
    setConnecteurs((prev) =>
      prev.includes(nom) ? prev.filter((c) => c !== nom) : [...prev, nom],
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    let valide = true

    if (query.trim().length < 2) {
      setErreurQuery('Minimum 2 caractères requis.')
      valide = false
    } else {
      setErreurQuery(null)
    }

    if (types.length === 0) {
      setErreurTypes('Sélectionnez au moins un type d\'entité.')
      valide = false
    } else {
      setErreurTypes(null)
    }

    if (!valide) return

    onSubmit({
      query: query.trim(),
      types,
      connecteurs: connecteursActifs.length > 0
        ? connecteursActifs
        : connecteursDisponibles,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Formulaire de recherche OSINT"
      className="space-y-6"
    >
      {/* ── Terme de recherche ── */}
      <div className="space-y-1">
        <label htmlFor="recherche-query" className="block text-sm font-semibold text-gray-900">
          Terme de recherche
          <span aria-hidden="true" className="text-red-800 ml-1">*</span>
          <span className="sr-only"> (champ obligatoire)</span>
        </label>
        <p id="recherche-query-aide" className="text-xs text-gray-600">
          Minimum 2 caractères. Exemple : nom d'une personne, d'une organisation ou d'un domaine.
        </p>
        <input
          id="recherche-query"
          type="text"
          name="query"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setErreurQuery(null) }}
          required
          minLength={2}
          maxLength={200}
          autoComplete="off"
          aria-describedby={`recherche-query-aide${erreurQuery ? ' recherche-query-erreur' : ''}`}
          aria-invalid={erreurQuery ? 'true' : undefined}
          placeholder="Ex : Emmanuel Macron, Total Energies, lemonde.fr"
          className={[
            'block w-full rounded border px-3 py-2 text-sm text-gray-900',
            'focus-visible-ring',
            'min-h-[44px]',
            erreurQuery ? 'border-red-600 bg-red-50' : 'border-gray-400 bg-white',
          ].join(' ')}
        />
        {erreurQuery && (
          <p id="recherche-query-erreur" role="alert" className="text-sm text-red-800 flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {erreurQuery}
          </p>
        )}
      </div>

      {/* ── Types d'entité ── */}
      <fieldset
        aria-describedby={erreurTypes ? 'recherche-types-erreur' : undefined}
      >
        <legend className="text-sm font-semibold text-gray-900 mb-1">
          Types d'entité à rechercher
          <span aria-hidden="true" className="text-red-800 ml-1">*</span>
          <span className="sr-only"> (au moins un requis)</span>
        </legend>
        <div className="flex flex-wrap gap-4 mt-2">
          {TYPES_ENTITE.map(({ code, libelle }) => (
            <label
              key={code}
              className="flex items-center gap-2 cursor-pointer min-h-[44px] select-none"
            >
              <input
                type="checkbox"
                name="types"
                value={code}
                checked={types.includes(code)}
                onChange={() => toggleType(code)}
                className="w-5 h-5 rounded border-gray-400 text-secondary focus-visible-ring"
              />
              <span className="text-sm text-gray-800">{libelle}</span>
            </label>
          ))}
        </div>
        {erreurTypes && (
          <p id="recherche-types-erreur" role="alert" className="text-sm text-red-800 flex items-center gap-1 mt-1">
            <span aria-hidden="true">⚠</span>
            {erreurTypes}
          </p>
        )}
      </fieldset>

      {/* ── Connecteurs ── */}
      {connecteursDisponibles.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-gray-900 mb-1">
            Sources à interroger
          </legend>
          <p className="text-xs text-gray-600 mb-2">
            Tous les connecteurs actifs sont sélectionnés par défaut.
          </p>
          <div className="flex flex-wrap gap-4">
            {connecteursDisponibles.map((nom) => (
              <label
                key={nom}
                className="flex items-center gap-2 cursor-pointer min-h-[44px] select-none"
              >
                <input
                  type="checkbox"
                  name="connecteurs"
                  value={nom}
                  checked={connecteursActifs.includes(nom)}
                  onChange={() => toggleConnecteur(nom)}
                  className="w-5 h-5 rounded border-gray-400 text-secondary focus-visible-ring"
                />
                <span className="text-sm text-gray-800 capitalize">{nom}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* ── Bouton ── */}
      <button
        type="submit"
        disabled={enChargement}
        aria-busy={enChargement}
        className={[
          'inline-flex items-center gap-2 px-6 py-3 rounded font-semibold text-sm text-white',
          'min-h-[44px]',
          'focus-visible-ring',
          enChargement
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-secondary hover:bg-primary',
          'transition-colors',
        ].join(' ')}
      >
        {enChargement ? (
          <>
            <span aria-hidden="true">⏳</span>
            Recherche en cours…
          </>
        ) : (
          <>
            <span aria-hidden="true">🔍</span>
            Rechercher
          </>
        )}
      </button>
    </form>
  )
}

export default FormulaireRecherche
