/**
 * FiltresGraphe — panneau de filtres pour l'ego-network.
 *
 * Filtres disponibles :
 *   - Types de lien (liste dynamique depuis /api/liens/types/all)
 *   - Types d'entité : Personne, Organisation, SiteWeb
 *   - Statut du lien : VALIDE, EN_ATTENTE
 *
 * Logique typesLien :
 *   - État initial [] = tous les types cochés (convention : vide = tout)
 *   - Décocher un type → retire ce code du tableau
 *   - "Tout cocher" / "Tout décocher" : boutons dédiés
 *   - Cette convention évite le bug où un tableau vide était traité
 *     comme "aucun type" alors qu'il signifiait "pas de filtre actif".
 *
 * Filtres date retirés (C2 fix) : dateDebut/dateFin ne sont pas exposés
 * dans le payload des arêtes côté backend. Ils reviendront quand le champ
 * `date` sera disponible dans les liens API.
 *
 * @param {{
 *   typesLienDisponibles: Array<{ id: string, code: string, libelle: string }>,
 *   filtres: {
 *     typesLien: string[],
 *     typesEntite: string[],
 *     statuts: string[],
 *   },
 *   onChangeFiltres: (filtres: object) => void,
 * }} props
 */

const TYPES_ENTITE_OPTIONS = [
  { code: 'Personne', libelle: 'Personne' },
  { code: 'Organisation', libelle: 'Organisation' },
  { code: 'SiteWeb', libelle: 'Site web' },
]

const STATUTS_OPTIONS = [
  { code: 'VALIDE', libelle: 'Validé' },
  { code: 'EN_ATTENTE', libelle: 'En attente' },
]

function FiltresGraphe({ typesLienDisponibles = [], filtres, onChangeFiltres }) {
  const metAJour = (cle, valeur) => onChangeFiltres({ ...filtres, [cle]: valeur })

  const toggleDansTableau = (tableau, valeur) =>
    tableau.includes(valeur) ? tableau.filter((v) => v !== valeur) : [...tableau, valeur]

  const reinitialiser = () =>
    onChangeFiltres({
      typesLien: [],
      typesEntite: ['Personne', 'Organisation', 'SiteWeb'],
      statuts: ['VALIDE', 'EN_ATTENTE'],
    })

  /**
   * Pour les types de lien :
   *   - [] (vide) = tous cochés
   *   - [code1, code2] = seuls ces codes sont actifs
   *
   * Quand l'utilisateur décoche un type depuis l'état "tout coché" (tableau vide),
   * on initialise d'abord le tableau avec TOUS les codes, puis on retire celui cliqué.
   */
  const toggleTypeLien = (code) => {
    const tousLesCodes = typesLienDisponibles.map((t) => t.code)
    /* Si vide = tout coché, on développe d'abord vers "tous explicites" */
    const base = filtres.typesLien.length === 0 ? tousLesCodes : filtres.typesLien
    const nouveau = base.includes(code) ? base.filter((c) => c !== code) : [...base, code]
    /* Si tout est coché, revenir à la convention vide (= tout) */
    const normalise = nouveau.length === tousLesCodes.length ? [] : nouveau
    metAJour('typesLien', normalise)
  }

  /** Vérifie si un code de type lien est actuellement coché */
  const estTypeLienCoche = (code) =>
    filtres.typesLien.length === 0 || filtres.typesLien.includes(code)

  return (
    <aside
      aria-label="Filtres du graphe"
      className="bg-white border border-gray-200 rounded-lg p-4 space-y-5 text-sm"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filtres</h2>
        <button
          type="button"
          onClick={reinitialiser}
          className="text-xs text-secondary underline focus-visible-ring rounded min-h-[44px] px-2"
          aria-label="Réinitialiser tous les filtres"
        >
          Réinitialiser
        </button>
      </div>

      {/* Types de lien */}
      {typesLienDisponibles.length > 0 && (
        <fieldset>
          <legend className="text-xs font-semibold text-gray-600 uppercase mb-2">
            Types de lien
          </legend>
          {/* Boutons tout cocher / tout décocher */}
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => metAJour('typesLien', [])}
              className="text-xs text-secondary underline focus-visible-ring rounded min-h-[36px] px-1"
            >
              Tout cocher
            </button>
            <button
              type="button"
              onClick={() => metAJour('typesLien', ['__aucun__'])}
              className="text-xs text-secondary underline focus-visible-ring rounded min-h-[36px] px-1"
            >
              Tout décocher
            </button>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1" role="group">
            {typesLienDisponibles.map((tl) => (
              <label key={tl.code} className="flex items-center gap-2 cursor-pointer min-h-[36px]">
                <input
                  type="checkbox"
                  checked={estTypeLienCoche(tl.code)}
                  onChange={() => toggleTypeLien(tl.code)}
                  className="w-4 h-4 rounded border-gray-400 text-secondary focus-visible-ring"
                />
                <span className="text-gray-800">{tl.libelle ?? tl.code}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Types d'entité */}
      <fieldset>
        <legend className="text-xs font-semibold text-gray-600 uppercase mb-2">
          Types d'entité
        </legend>
        <div className="space-y-1.5">
          {TYPES_ENTITE_OPTIONS.map(({ code, libelle }) => (
            <label key={code} className="flex items-center gap-2 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={filtres.typesEntite.includes(code)}
                onChange={() =>
                  metAJour('typesEntite', toggleDansTableau(filtres.typesEntite, code))
                }
                className="w-4 h-4 rounded border-gray-400 text-secondary focus-visible-ring"
              />
              <span className="text-gray-800">{libelle}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Statut */}
      <fieldset>
        <legend className="text-xs font-semibold text-gray-600 uppercase mb-2">
          Statut des liens
        </legend>
        <div className="space-y-1.5">
          {STATUTS_OPTIONS.map(({ code, libelle }) => (
            <label key={code} className="flex items-center gap-2 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={filtres.statuts.includes(code)}
                onChange={() => metAJour('statuts', toggleDansTableau(filtres.statuts, code))}
                className="w-4 h-4 rounded border-gray-400 text-secondary focus-visible-ring"
              />
              <span className="text-gray-800">{libelle}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </aside>
  )
}

export default FiltresGraphe
