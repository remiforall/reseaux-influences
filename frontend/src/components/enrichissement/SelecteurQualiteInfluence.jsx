/**
 * SelecteurQualiteInfluence — champ `<select>` obligatoire pour la qualité
 * d'influence publique (garde-fou RGPD art. 85 + LIL art. 80, cf. ADR-006).
 *
 * - Premier item disabled — aucune valeur par défaut sélectionnée
 * - `required` natif + aria-describedby vers le message d'erreur
 * - Bouton import du formulaire parent doit rester disabled tant que vide
 *
 * @param {{
 *   valeur: string,
 *   onChange: (valeur: string) => void,
 *   id?: string,
 *   erreur?: string|null,
 * }} props
 */

const VALEURS = [
  { code: 'ELU', libelle: 'Élu·e (mandat électif)' },
  { code: 'HAUT_FONCTIONNAIRE', libelle: 'Haut·e fonctionnaire' },
  { code: 'LOBBYISTE', libelle: "Lobbyiste / représentant·e d'intérêts" },
  { code: 'DIRIGEANT', libelle: "Dirigeant·e d'organisation" },
  { code: 'ARTISTE', libelle: 'Artiste / créateur·rice' },
  { code: 'PRODUCTEUR', libelle: 'Producteur·rice' },
  { code: 'EDITEUR_PRESSE', libelle: 'Éditeur·rice de presse' },
  { code: 'HEBERGEUR', libelle: 'Hébergeur·euse' },
  { code: 'EDITEUR_SITE', libelle: 'Éditeur·rice de site web' },
  { code: 'AUTRE', libelle: 'Autre figure publique' },
]

function SelecteurQualiteInfluence({ valeur, onChange, id = 'qualite-influence', erreur = null }) {
  const idErreur = `${id}-erreur`
  const idAide = `${id}-aide`

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
        Qualité d'influence publique
        <span aria-hidden="true" className="text-red-800 ml-1">
          *
        </span>
        <span className="sr-only"> (champ obligatoire)</span>
      </label>

      <p id={idAide} className="text-xs text-gray-600">
        Obligatoire — base légale RGPD art. 85 + LIL art. 80 (traitement journalistique / intérêt
        public).
      </p>

      <select
        id={id}
        name={id}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        required
        aria-describedby={`${idAide}${erreur ? ` ${idErreur}` : ''}`}
        aria-invalid={erreur ? 'true' : undefined}
        className={[
          'block w-full rounded border px-3 py-2 text-sm text-gray-900',
          'focus-visible-ring',
          'min-h-[44px]',
          erreur ? 'border-red-600 bg-red-50' : 'border-gray-400 bg-white',
        ].join(' ')}
      >
        {/* Premier item disabled — force un choix explicite */}
        <option value="" disabled>
          — Sélectionner une qualité —
        </option>
        {VALEURS.map(({ code, libelle }) => (
          <option key={code} value={code}>
            {libelle}
          </option>
        ))}
      </select>

      {erreur && (
        <p id={idErreur} role="alert" className="text-sm text-red-800 flex items-center gap-1">
          <span aria-hidden="true">⚠</span>
          {erreur}
        </p>
      )}
    </div>
  )
}

export default SelecteurQualiteInfluence
