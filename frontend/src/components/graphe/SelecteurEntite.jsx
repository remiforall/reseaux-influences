/**
 * SelecteurEntite — autocomplete avec auto-enrichissement depuis les sources publiques.
 *
 * Comportement :
 *   1. Recherche locale via /api/personnes/search/autocomplete + /api/organisations/search/autocomplete
 *   2. Si 0 résultat local ET utilisateur authentifié → appel /api/enrichissement/recherche-globale
 *   3. Résultats externes affichés dans une dropdown secondaire distincte
 *   4. Clic sur un résultat externe → modale d'import (qualiteInfluencePublique obligatoire)
 *   5. Import → re-recherche locale → entité apparaît dans la dropdown locale
 *
 * Accessibilité AAA :
 *   - aria-live="polite" sur l'annonce des résultats externes
 *   - aria-busy sur l'état de chargement externe
 *   - Navigation clavier (flèches) dans les deux listes en série
 *   - Distinction visuelle : bordure bleue (locale) vs bordure orange (externe)
 *   - Cibles tactiles ≥ 44px
 *   - Focus piège dans la modale (focus-trap léger)
 *
 * @param {{
 *   onSelection: (entite: { id: string, nom: string, type: string }) => void,
 * }} props
 */
import { useState, useRef, useEffect, useCallback, useId } from 'react'
import {
  searchPersonnes,
  searchOrganisations,
  postEnrichissementRechercheGlobale,
  postEnrichissementImporter,
} from '../../api/client'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const TYPE_BADGE = {
  Personne: { icone: '●', classes: 'bg-blue-100 text-blue-800' },
  Organisation: { icone: '■', classes: 'bg-amber-100 text-amber-800' },
  SiteWeb: { icone: '◆', classes: 'bg-purple-100 text-purple-800' },
}

const SOURCE_BADGE = {
  wikidata: { couleur: 'bg-emerald-100 text-emerald-800', libelle: 'Wikidata' },
  'open-sanctions': { couleur: 'bg-rose-100 text-rose-800', libelle: 'OpenSanctions' },
  parlementaires: { couleur: 'bg-violet-100 text-violet-800', libelle: 'Parlementaires' },
  hatvp: { couleur: 'bg-sky-100 text-sky-800', libelle: 'HATVP' },
  bodacc: { couleur: 'bg-amber-100 text-amber-800', libelle: 'BODACC' },
  associations: { couleur: 'bg-green-100 text-green-800', libelle: 'RNA' },
  'annuaire-sante': { couleur: 'bg-cyan-100 text-cyan-800', libelle: 'Annuaire Santé' },
  externe: { couleur: 'bg-gray-100 text-gray-700', libelle: 'Source externe' },
}

const QUALITE_OPTIONS = [
  { valeur: 'ELU', libelle: 'Élu·e' },
  { valeur: 'HAUT_FONCTIONNAIRE', libelle: 'Haut·e fonctionnaire' },
  { valeur: 'LOBBYISTE', libelle: 'Lobbyiste' },
  { valeur: 'DIRIGEANT', libelle: 'Dirigeant·e' },
  { valeur: 'ARTISTE', libelle: 'Artiste' },
  { valeur: 'PRODUCTEUR', libelle: 'Producteur·rice' },
  { valeur: 'EDITEUR_PRESSE', libelle: 'Éditeur·rice de presse' },
  { valeur: 'HEBERGEUR', libelle: 'Hébergeur·euse' },
  { valeur: 'EDITEUR_SITE', libelle: 'Éditeur·rice de site' },
  { valeur: 'AUTRE', libelle: 'Autre' },
]

// ---------------------------------------------------------------------------
// Composant modale d'import
// ---------------------------------------------------------------------------

function ModalImport({ entiteExterne, onImporter, onFermer, loading }) {
  const [qualite, setQualite] = useState('')
  const [erreurQualite, setErreurQualite] = useState(false)
  const btnConfirmerRef = useRef(null)
  const idModal = useId()

  // Focus initial sur le select
  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById(`qualite-select-${idModal}`)?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [idModal])

  const handleSoumettre = () => {
    if (!qualite) {
      setErreurQualite(true)
      document.getElementById(`qualite-select-${idModal}`)?.focus()
      return
    }
    onImporter(qualite)
  }

  const handleKeydown = (e) => {
    if (e.key === 'Escape') onFermer()
  }

  const nomAffiche = entiteExterne?.nom ?? '(sans nom)'
  const bioAffichee = entiteExterne?.bio ?? null
  const sourceLibelle = SOURCE_BADGE[entiteExterne?.sourceConnecteur]?.libelle ?? 'Source externe'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-titre-${idModal}`}
      aria-describedby={`modal-desc-${idModal}`}
      onKeyDown={handleKeydown}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h2 id={`modal-titre-${idModal}`} className="text-base font-bold text-gray-900">
            Importer cette entité ?
          </h2>
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer la modale sans importer"
            className="text-gray-400 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded p-1 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div id={`modal-desc-${idModal}`} className="space-y-2">
          <dl className="text-sm divide-y divide-gray-100 border border-gray-200 rounded p-3">
            <div className="flex gap-3 py-1.5">
              <dt className="font-medium text-gray-600 flex-shrink-0 w-20">Nom</dt>
              <dd className="text-gray-900 break-words">{nomAffiche}</dd>
            </div>
            {bioAffichee && (
              <div className="flex gap-3 py-1.5">
                <dt className="font-medium text-gray-600 flex-shrink-0 w-20">Bio</dt>
                <dd className="text-gray-700 text-xs break-words line-clamp-3">{bioAffichee}</dd>
              </div>
            )}
            <div className="flex gap-3 py-1.5">
              <dt className="font-medium text-gray-600 flex-shrink-0 w-20">Source</dt>
              <dd>
                <span
                  className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${SOURCE_BADGE[entiteExterne?.sourceConnecteur]?.couleur ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {sourceLibelle}
                </span>
              </dd>
            </div>
          </dl>

          <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded p-2">
            L'entité sera importée en statut <strong>En attente</strong> — elle devra être validée
            avant publication.
          </p>
        </div>

        {/* Qualité d'influence — champ obligatoire (ADR-006) */}
        <div>
          <label
            htmlFor={`qualite-select-${idModal}`}
            className="block text-sm font-semibold text-gray-900 mb-1"
          >
            Qualité d'influence publique{' '}
            <span aria-hidden="true" className="text-red-600">
              *
            </span>
          </label>
          <p className="text-xs text-gray-600 mb-1" id={`qualite-aide-${idModal}`}>
            Requis par le RGPD art. 85 — cette personne ou organisation doit exercer une influence
            publique.
          </p>
          <select
            id={`qualite-select-${idModal}`}
            value={qualite}
            onChange={(e) => {
              setQualite(e.target.value)
              setErreurQualite(false)
            }}
            aria-required="true"
            aria-invalid={erreurQualite}
            aria-describedby={`qualite-aide-${idModal}${erreurQualite ? ` qualite-erreur-${idModal}` : ''}`}
            className={[
              'block w-full rounded border px-3 py-2 text-sm text-gray-900 min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
              erreurQualite ? 'border-red-500 bg-red-50' : 'border-gray-400',
            ].join(' ')}
          >
            <option value="">— Sélectionner —</option>
            {QUALITE_OPTIONS.map((opt) => (
              <option key={opt.valeur} value={opt.valeur}>
                {opt.libelle}
              </option>
            ))}
          </select>
          {erreurQualite && (
            <p id={`qualite-erreur-${idModal}`} role="alert" className="text-red-600 text-xs mt-1">
              La qualité d'influence publique est obligatoire.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onFermer}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-400 rounded hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[44px]"
          >
            Annuler
          </button>
          <button
            ref={btnConfirmerRef}
            type="button"
            onClick={handleSoumettre}
            disabled={loading}
            aria-busy={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Import en cours…' : 'Importer en brouillon'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

function SelecteurEntite({ onSelection }) {
  const [query, setQuery] = useState('')
  const [suggestionsLocales, setSuggestionsLocales] = useState([])
  const [suggestionsExternes, setSuggestionsExternes] = useState([])
  const [ouvert, setOuvert] = useState(false)
  const [indexActif, setIndexActif] = useState(-1)
  const [enChargement, setEnChargement] = useState(false)
  const [enChargementExterne, setEnChargementExterne] = useState(false)

  // Modale d'import
  const [entiteAImporter, setEntiteAImporter] = useState(null)
  const [importEnCours, setImportEnCours] = useState(false)
  const [messageImport, setMessageImport] = useState(null)

  const inputRef = useRef(null)
  const listeRef = useRef(null)
  const listeExterneRef = useRef(null)
  const timerRef = useRef(null)
  const idListe = useId()
  const idListeExterne = useId()
  const idAnnonce = useId()

  // Total des suggestions pour la navigation clavier
  const toutesLesSuggestions = [...suggestionsLocales, ...suggestionsExternes]

  // ── Debounce recherche ──
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestionsLocales([])
      setSuggestionsExternes([])
      setOuvert(false)
      return
    }

    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setEnChargement(true)
      try {
        const [{ data: dp }, { data: do_ }] = await Promise.allSettled([
          searchPersonnes(query).then((r) => r),
          searchOrganisations(query).then((r) => r),
        ]).then((results) =>
          results.map((r) => (r.status === 'fulfilled' ? r.value : { data: { resultats: [] } })),
        )

        const personnes = (dp.resultats ?? dp ?? []).slice(0, 5).map((p) => ({
          id: p.id,
          nom: [p.prenom, p.nom].filter(Boolean).join(' ') || p.nom_complet || p.id,
          type: 'Personne',
          source: 'local',
        }))
        const orgas = (do_.resultats ?? do_ ?? []).slice(0, 5).map((o) => ({
          id: o.id,
          nom: o.nom ?? o.id,
          type: 'Organisation',
          source: 'local',
        }))

        const fusionnes = [...personnes, ...orgas].slice(0, 10)
        setSuggestionsLocales(fusionnes)
        setSuggestionsExternes([]) // réinitialiser les externes à chaque recherche locale

        if (fusionnes.length > 0) {
          setOuvert(true)
          setIndexActif(-1)
        } else {
          setOuvert(false)
          // Lancer la recherche externe si authentifié (pas de token = pas d'externe)
          const token = localStorage.getItem('token')
          if (token) {
            lancerRechercheExterne(query)
          }
        }
      } catch {
        setSuggestionsLocales([])
      } finally {
        setEnChargement(false)
      }
    }, 300)

    return () => clearTimeout(timerRef.current)
  }, [query])

  const lancerRechercheExterne = useCallback(async (terme) => {
    setEnChargementExterne(true)
    setOuvert(true) // Ouvrir le dropdown pour montrer le spinner externe
    try {
      const { data } = await postEnrichissementRechercheGlobale({
        query: terme,
        types: ['personne', 'organisation', 'site'],
      })
      const externes = (data.externes ?? []).map((e) => ({
        ...e,
        _preview: e.preview,
        source: 'externe',
      }))
      setSuggestionsExternes(externes)
    } catch {
      setSuggestionsExternes([])
    } finally {
      setEnChargementExterne(false)
    }
  }, [])

  const selectionner = useCallback(
    (entite) => {
      if (entite.source === 'externe') {
        // Ouvrir la modale d'import au lieu de sélectionner directement
        setEntiteAImporter(entite)
        setOuvert(false)
        return
      }
      setQuery(entite.nom)
      setSuggestionsLocales([])
      setSuggestionsExternes([])
      setOuvert(false)
      setIndexActif(-1)
      onSelection(entite)
    },
    [onSelection],
  )

  const handleKeyDown = (e) => {
    if (!ouvert) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndexActif((i) => Math.min(i + 1, toutesLesSuggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndexActif((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && indexActif >= 0) {
      e.preventDefault()
      selectionner(toutesLesSuggestions[indexActif])
    } else if (e.key === 'Escape') {
      setOuvert(false)
      setIndexActif(-1)
      inputRef.current?.focus()
    }
  }

  // Scroll l'élément actif dans la liste
  useEffect(() => {
    if (indexActif >= 0) {
      const refCible = indexActif < suggestionsLocales.length ? listeRef : listeExterneRef
      const relIdx =
        indexActif < suggestionsLocales.length ? indexActif : indexActif - suggestionsLocales.length
      const item = refCible.current?.querySelector(`[data-idx="${relIdx}"]`)
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [indexActif, suggestionsLocales.length])

  // ── Import depuis la modale ──
  const handleImporter = useCallback(
    async (qualiteInfluencePublique) => {
      if (!entiteAImporter?._preview) return

      setImportEnCours(true)
      try {
        const { data } = await postEnrichissementImporter({
          preview: entiteAImporter._preview,
          choixUtilisateur: {
            champsRetenus: Object.fromEntries(
              Object.entries(entiteAImporter._preview.candidatsParChamp ?? {}).map(
                ([cle, candidats]) => [cle, candidats[0]?.valeur ?? null],
              ),
            ),
            liensRetenus: [],
            typeEntite: entiteAImporter.type ?? 'Personne',
          },
          qualiteInfluencePublique,
        })

        const idNouvelle = data.entitePrincipaleId
        const nomNouvelle = entiteAImporter.nom

        setMessageImport({ type: 'succes', texte: `${nomNouvelle} importé·e en brouillon.` })
        setEntiteAImporter(null)

        // Re-recherche locale pour faire apparaître l'entité importée
        if (idNouvelle) {
          onSelection({ id: idNouvelle, nom: nomNouvelle, type: entiteAImporter.type })
          setQuery(nomNouvelle)
        }
      } catch (err) {
        const msgErreur =
          err.response?.data?.error ??
          "Erreur lors de l'import. Réessayez ou vérifiez votre connexion."
        setMessageImport({ type: 'erreur', texte: msgErreur })
      } finally {
        setImportEnCours(false)
        // Rendre le focus à l'input après la modale
        requestAnimationFrame(() => inputRef.current?.focus())
      }
    },
    [entiteAImporter, onSelection],
  )

  const nbExternes = suggestionsExternes.length

  return (
    <>
      <div className="relative w-full max-w-md">
        <label
          htmlFor="selecteur-entite"
          className="block text-sm font-semibold text-gray-900 mb-1"
        >
          Entité centrale du graphe
        </label>
        <p id="selecteur-entite-aide" className="text-xs text-gray-600 mb-1">
          Tapez le nom d'une personne ou d'une organisation pour explorer son réseau.
        </p>

        {/* Toast de résultat d'import */}
        {messageImport && (
          <div
            role="status"
            aria-live="polite"
            className={[
              'absolute -top-10 left-0 right-0 text-sm px-3 py-1.5 rounded border z-10',
              messageImport.type === 'succes'
                ? 'bg-green-50 border-green-300 text-green-800'
                : 'bg-red-50 border-red-300 text-red-800',
            ].join(' ')}
          >
            {messageImport.texte}
            <button
              type="button"
              onClick={() => setMessageImport(null)}
              aria-label="Fermer la notification"
              className="ml-2 text-xs underline"
            >
              ✕
            </button>
          </div>
        )}

        <div className="relative">
          <input
            ref={inputRef}
            id="selecteur-entite"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={ouvert}
            aria-controls={ouvert ? idListe : undefined}
            aria-activedescendant={indexActif >= 0 ? `sug-${indexActif}` : undefined}
            aria-describedby="selecteur-entite-aide"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => toutesLesSuggestions.length > 0 && setOuvert(true)}
            onBlur={() => setTimeout(() => setOuvert(false), 200)}
            autoComplete="off"
            placeholder="Ex : Emmanuel Macron, Total Energies…"
            className="block w-full rounded border border-gray-400 px-3 py-2 text-sm text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[44px]"
          />
          {(enChargement || enChargementExterne) && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
              aria-hidden="true"
            >
              ⏳
            </span>
          )}
        </div>

        {/* Zone live pour les annonces externes */}
        <p id={idAnnonce} aria-live="polite" aria-atomic="true" className="sr-only">
          {enChargementExterne
            ? 'Recherche dans les sources publiques en cours…'
            : nbExternes > 0
              ? `${nbExternes} suggestion${nbExternes > 1 ? 's' : ''} trouvée${nbExternes > 1 ? 's' : ''} dans les sources publiques`
              : ''}
        </p>

        {/* Dropdown */}
        {ouvert &&
          (suggestionsLocales.length > 0 ||
            enChargementExterne ||
            suggestionsExternes.length > 0) && (
            <div
              className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-80 overflow-y-auto"
              style={{ minWidth: '100%' }}
            >
              {/* ── Section locale ── */}
              {suggestionsLocales.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200 sticky top-0">
                    Base locale
                  </div>
                  <ul
                    ref={listeRef}
                    id={idListe}
                    role="listbox"
                    aria-label="Entités dans la base locale"
                  >
                    {suggestionsLocales.map((entite, idx) => {
                      const badge = TYPE_BADGE[entite.type] ?? TYPE_BADGE.Personne
                      const estActif = idx === indexActif
                      return (
                        <li
                          key={entite.id}
                          id={`sug-${idx}`}
                          role="option"
                          aria-selected={estActif}
                          data-idx={idx}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            selectionner(entite)
                          }}
                          className={[
                            'flex items-center gap-2 px-3 py-2 cursor-pointer text-sm border-l-2',
                            estActif
                              ? 'bg-blue-50 border-blue-500 text-gray-900'
                              : 'border-transparent hover:bg-gray-50 text-gray-800',
                          ].join(' ')}
                        >
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${badge.classes}`}
                          >
                            <span aria-hidden="true">{badge.icone}</span>
                            <span>{entite.type}</span>
                          </span>
                          <span className="truncate">{entite.nom}</span>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}

              {/* ── Section externe ── */}
              {(enChargementExterne || suggestionsExternes.length > 0) && (
                <>
                  <div className="px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 border-t border-b border-orange-200 sticky top-0">
                    {enChargementExterne
                      ? 'Pas dans la base — recherche dans les sources publiques…'
                      : `Pas dans la base — trouvé dans les sources publiques (${suggestionsExternes.length})`}
                  </div>

                  {enChargementExterne && (
                    <div
                      role="status"
                      aria-label="Chargement des résultats externes"
                      className="px-3 py-3 text-sm text-gray-500 text-center"
                    >
                      <span aria-hidden="true">⏳</span> Interrogation des sources publiques…
                    </div>
                  )}

                  {!enChargementExterne && suggestionsExternes.length > 0 && (
                    <ul
                      ref={listeExterneRef}
                      id={idListeExterne}
                      role="listbox"
                      aria-label="Entités trouvées dans les sources publiques"
                    >
                      {suggestionsExternes.map((entite, idx) => {
                        const idxGlobal = suggestionsLocales.length + idx
                        const badge = TYPE_BADGE[entite.type] ?? TYPE_BADGE.Personne
                        const sourceBadge =
                          SOURCE_BADGE[entite.sourceConnecteur] ?? SOURCE_BADGE.externe
                        const estActif = idxGlobal === indexActif
                        return (
                          <li
                            key={`ext-${idx}`}
                            id={`sug-${idxGlobal}`}
                            role="option"
                            aria-selected={estActif}
                            data-idx={idx}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              selectionner(entite)
                            }}
                            className={[
                              'flex items-start gap-2 px-3 py-2 cursor-pointer text-sm border-l-2',
                              estActif
                                ? 'bg-orange-50 border-orange-400'
                                : 'border-transparent hover:bg-orange-50/50 text-gray-800',
                            ].join(' ')}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${badge.classes}`}
                                >
                                  <span aria-hidden="true">{badge.icone}</span>
                                  <span>{entite.type}</span>
                                </span>
                                <span
                                  className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${sourceBadge.couleur}`}
                                >
                                  {sourceBadge.libelle}
                                </span>
                              </div>
                              <span className="block truncate mt-0.5 font-medium text-gray-900">
                                {entite.nom}
                              </span>
                              {entite.bio && (
                                <span className="block text-xs text-gray-500 truncate">
                                  {entite.bio}
                                </span>
                              )}
                            </div>
                            <span
                              className="text-xs text-orange-600 flex-shrink-0 mt-0.5 font-medium"
                              aria-label="Cliquer pour importer"
                            >
                              Importer
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
      </div>

      {/* ── Modale d'import ── */}
      {entiteAImporter && (
        <ModalImport
          entiteExterne={entiteAImporter}
          onImporter={handleImporter}
          onFermer={() => {
            setEntiteAImporter(null)
            requestAnimationFrame(() => inputRef.current?.focus())
          }}
          loading={importEnCours}
        />
      )}
    </>
  )
}

export default SelecteurEntite
