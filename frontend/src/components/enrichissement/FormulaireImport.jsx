/**
 * FormulaireImport — formulaire de validation avant import d'une entité enrichie.
 *
 * Responsabilités :
 *   - Récapituler les champs et liens sélectionnés dans le parent (PreviewEntite)
 *   - Exiger la déclaration de `qualiteInfluencePublique` (ADR-006, RGPD art. 85 + LIL art. 80)
 *   - Désactiver le bouton "Importer" tant que la qualité est absente
 *   - Demander une confirmation explicite avant soumission
 *   - Appeler `postEnrichissementImporter` et gérer 201 / 400 / 403
 *
 * @param {{
 *   preview: object,
 *   choixUtilisateur: { champsRetenus: object, liensRetenus: number[], typeEntite: string },
 *   onSucces: (resultat: object) => void,
 *   onFermer: () => void,
 * }} props
 */
import { useState, useRef, useEffect } from 'react'
import { postEnrichissementImporter } from '../../api/client'
import SelecteurQualiteInfluence from './SelecteurQualiteInfluence'

function FormulaireImport({ preview, choixUtilisateur, onSucces, onFermer }) {
  const [qualiteInfluence, setQualiteInfluence] = useState('')
  const [confirme, setConfirme] = useState(false)
  const [enChargement, setEnChargement] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [erreurQualite, setErreurQualite] = useState(null)

  /* ── Référence sur le conteneur dialog pour le focus trap ── */
  const dialogRef = useRef(null)

  /**
   * Focus trap WCAG AAA 2.1.2 :
   * - Déplace le focus sur le premier élément focusable à l'ouverture
   * - Capture Tab / Shift+Tab pour cycler à l'intérieur du dialog
   * - Escape ferme le dialog
   * - Restaure le focus sur le déclencheur à la fermeture
   */
  useEffect(() => {
    /* Mémoriser l'élément qui avait le focus avant l'ouverture */
    const declencheur = document.activeElement

    const focusables = dialogRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    /* Placer le focus sur le premier élément interactif */
    const premier = focusables?.[0]
    if (premier instanceof HTMLElement) premier.focus()

    const handleKey = (e) => {
      /* Escape → fermeture */
      if (e.key === 'Escape') {
        e.preventDefault()
        onFermer()
        return
      }

      if (e.key !== 'Tab') return

      const liste = Array.from(focusables ?? [])
      if (liste.length === 0) return

      const debut = liste[0]
      const fin = liste[liste.length - 1]

      if (e.shiftKey && document.activeElement === debut) {
        /* Shift+Tab sur le premier → aller au dernier */
        e.preventDefault()
        if (fin instanceof HTMLElement) fin.focus()
      } else if (!e.shiftKey && document.activeElement === fin) {
        /* Tab sur le dernier → aller au premier */
        e.preventDefault()
        if (debut instanceof HTMLElement) debut.focus()
      }
    }

    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('keydown', handleKey)
      /* Restaurer le focus sur le déclencheur */
      if (declencheur instanceof HTMLElement) declencheur.focus()
    }
  }, [onFermer])

  const peutSoumettre = qualiteInfluence !== '' && confirme && !enChargement

  const champsRetenus = Object.entries(choixUtilisateur.champsRetenus ?? {})
  const liensRetenus = choixUtilisateur.liensRetenus ?? []

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!qualiteInfluence) {
      setErreurQualite("Champ obligatoire — base légale RGPD art. 85 + LIL art. 80.")
      return
    }

    if (!confirme) return

    setEnChargement(true)
    setErreur(null)

    try {
      const { data } = await postEnrichissementImporter({
        preview,
        choixUtilisateur,
        qualiteInfluencePublique: qualiteInfluence,
      })
      onSucces(data)
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.error

      if (status === 403) {
        const seuil = err.response?.data?.seuilRequis
        setErreur(
          `Vous devez valider ${seuil ?? 'N'} liens avant de pouvoir importer. ` +
          'Rendez-vous sur la page Liens pour valider des contributions.',
        )
      } else if (status === 400) {
        setErreur(message ?? 'Données invalides. Vérifiez les champs.')
      } else {
        setErreur("Une erreur inattendue s'est produite. Réessayez ultérieurement.")
      }
    } finally {
      setEnChargement(false)
    }
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-titre"
      className="bg-white rounded-lg border border-gray-300 p-6 space-y-6 max-w-2xl"
    >
      <div className="flex items-start justify-between">
        <h2 id="import-titre" className="text-lg font-bold text-gray-900">
          Importer l'entité enrichie
        </h2>
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer le formulaire d'import"
          className="text-gray-500 hover:text-gray-700 focus-visible-ring rounded p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      {/* ── Récapitulatif des champs retenus ── */}
      {champsRetenus.length > 0 && (
        <section aria-labelledby="import-champs-titre">
          <h3 id="import-champs-titre" className="text-sm font-semibold text-gray-700 mb-2">
            Champs sélectionnés
          </h3>
          <dl className="divide-y divide-gray-100">
            {champsRetenus.map(([nomChamp, sourceChoisie]) => (
              <div key={nomChamp} className="flex justify-between py-1.5 text-sm">
                <dt className="font-medium text-gray-700 capitalize">
                  {nomChamp.replace(/_/g, ' ')}
                </dt>
                <dd className="text-gray-600 text-right">
                  {typeof sourceChoisie === 'object'
                    ? (sourceChoisie.valeur ?? JSON.stringify(sourceChoisie))
                    : sourceChoisie}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* ── Récapitulatif des liens retenus ── */}
      {liensRetenus.length > 0 && (
        <section aria-labelledby="import-liens-titre">
          <h3 id="import-liens-titre" className="text-sm font-semibold text-gray-700 mb-2">
            Liens suggérés retenus ({liensRetenus.length})
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {(preview.liensSuggeres ?? [])
              .filter((_, i) => liensRetenus.includes(i))
              .map((lien, idx) => (
                <li key={idx}>
                  {lien.typeLienCode ?? lien.type} — vers{' '}
                  <span className="font-medium">
                    {lien.vers?.identifiantExterne ?? lien.vers?.type ?? 'entité inconnue'}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* ── Qualité d'influence (obligatoire, ADR-006) ── */}
        <SelecteurQualiteInfluence
          valeur={qualiteInfluence}
          onChange={(v) => { setQualiteInfluence(v); setErreurQualite(null) }}
          erreur={erreurQualite}
        />

        {/* ── Confirmation explicite ── */}
        <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={confirme}
            onChange={(e) => setConfirme(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-gray-400 text-secondary focus-visible-ring"
          />
          <span className="text-sm text-gray-800">
            Je confirme que cette entité exerce une influence publique justifiant son traitement
            dans le cadre de la recherche d'intérêt public (art. 85 RGPD + art. 80 LIL).
            L'entité sera créée en statut <strong>brouillon</strong> et soumise à validation.
          </span>
        </label>

        {/* ── Erreur globale ── */}
        {erreur && (
          <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-300 rounded p-3 flex items-start gap-2">
            <span aria-hidden="true">⚠</span>
            <span>{erreur}</span>
            {erreur.includes('Liens') && (
              <a
                href="/liens"
                className="ml-2 underline focus-visible-ring rounded"
              >
                Aller aux liens
              </a>
            )}
          </p>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-wrap gap-3 justify-end">
          <button
            type="button"
            onClick={onFermer}
            className="px-4 py-2 text-sm font-medium rounded border border-gray-400 text-gray-700 hover:bg-gray-50 focus-visible-ring min-h-[44px]"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!peutSoumettre}
            aria-disabled={!peutSoumettre}
            aria-describedby={!peutSoumettre ? 'import-submit-aide' : undefined}
            className={[
              'inline-flex items-center gap-2 px-6 py-2 rounded text-sm font-semibold text-white',
              'focus-visible-ring min-h-[44px]',
              peutSoumettre
                ? 'bg-secondary hover:bg-primary'
                : 'bg-gray-300 cursor-not-allowed',
              'transition-colors',
            ].join(' ')}
          >
            {enChargement ? (
              <>
                <span aria-hidden="true">⏳</span>
                Import en cours…
              </>
            ) : (
              <>
                <span aria-hidden="true">↑</span>
                Importer en brouillon
              </>
            )}
          </button>
          {!peutSoumettre && (
            <p id="import-submit-aide" className="sr-only">
              Le bouton est désactivé : sélectionnez une qualité d'influence et cochez la confirmation.
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default FormulaireImport
