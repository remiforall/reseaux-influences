/**
 * PanneauDetailGeo — Sections géographiques dans le panneau de détail d'un nœud.
 *
 * Affiche trois sections lazily chargées pour les entités géolocalisées :
 *   1. Foncier (DVF) — transactions immobilières de la zone
 *   2. Cadastre — parcelle cadastrale du siège / lieu de naissance
 *   3. Urbanisme — zonage PLU au point de géolocalisation
 *
 * Chargement lazy : l'API n'est appelée qu'au premier dépliage de chaque section
 * (via <details><summary> natif — sémantique + accessibilité clavier sans JS).
 *
 * Accessibilité AAA :
 *   - <details><summary> natif (sémantique, clavier, focus)
 *   - aria-live sur les zones de chargement/erreur
 *   - Tableau accessible pour les transactions DVF (en-têtes <th scope="col">)
 *   - Badge provenance visible sur chaque section
 *   - prefers-reduced-motion : aucune animation
 *
 * @module components/graphe/PanneauDetailGeo
 */

import { useState, useCallback } from 'react'
import { getEntiteFoncier, getEntiteCadastre, getEntiteUrbanisme } from '../../api/client'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Mappe le type interne React vers le type attendu par l'API.
 *
 * @param {string} typeNoeud - Type depuis le graphe ('Personne', 'Organisation', …)
 * @returns {'personne'|'organisation'|null}
 */
function mapperTypeApi(typeNoeud) {
  if (!typeNoeud) return null
  const t = typeNoeud.toLowerCase()
  if (t === 'personne') return 'personne'
  if (t === 'organisation') return 'organisation'
  return null
}

/**
 * Formate un nombre en euros avec séparateur de milliers.
 *
 * @param {unknown} valeur
 * @returns {string}
 */
function formaterEuros(valeur) {
  const n = Number(valeur)
  if (Number.isNaN(n) || valeur === null || valeur === undefined) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

/**
 * Formate une date ISO en date locale française.
 *
 * @param {string|null} date
 * @returns {string}
 */
function formaterDate(date) {
  if (!date) return '—'
  try {
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(new Date(date))
  } catch {
    return date
  }
}

// ---------------------------------------------------------------------------
// Sous-composants sections
// ---------------------------------------------------------------------------

/**
 * Section générique avec <details><summary> et chargement lazy.
 *
 * @param {{
 *   titre: string,
 *   badge: string,
 *   children: React.ReactNode,
 *   chargement: boolean,
 *   erreur: string|null,
 *   charge: boolean,
 *   onOuvrir: () => void
 * }} props
 */
function SectionDetail({ titre, badge, children, chargement, erreur, charge, onOuvrir }) {
  return (
    <details
      className="border border-gray-200 rounded-lg"
      onToggle={(e) => {
        if (e.target.open && !charge && !chargement) {
          onOuvrir()
        }
      }}
    >
      <summary className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer select-none rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[44px] text-sm font-medium text-gray-800 hover:bg-gray-50 list-none">
        <span>{titre}</span>
        <span className="text-xs text-gray-500 font-normal italic">{badge}</span>
      </summary>
      <div className="px-3 pb-3 pt-1">
        {chargement && (
          <p role="status" aria-live="polite" className="text-sm text-gray-500 py-2">
            Chargement…
          </p>
        )}
        {erreur && !chargement && (
          <p role="alert" aria-live="assertive" className="text-sm text-red-700 py-2">
            {erreur}
          </p>
        )}
        {!chargement && !erreur && children}
      </div>
    </details>
  )
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

/**
 * Panneau de détail géographique pour un nœud du graphe.
 *
 * N'affiche rien si l'entité n'est pas de type Personne ou Organisation.
 *
 * @param {{ noeud: { id: string, type: string, nom?: string } }} props
 */
function PanneauDetailGeo({ noeud }) {
  const typeApi = mapperTypeApi(noeud?.type)

  // ── État foncier ─────────────────────────────────────────────────────────
  const [foncier, setFoncier] = useState(null)
  const [chargementFoncier, setChargementFoncier] = useState(false)
  const [erreurFoncier, setErreurFoncier] = useState(null)

  const chargerFoncier = useCallback(async () => {
    if (!typeApi || !noeud?.id) return
    setChargementFoncier(true)
    setErreurFoncier(null)
    try {
      const { data } = await getEntiteFoncier(typeApi, noeud.id)
      setFoncier(data)
    } catch (err) {
      const msg =
        err.response?.status === 403
          ? 'Authentification requise pour consulter les données foncières.'
          : 'Impossible de charger les données foncières.'
      setErreurFoncier(msg)
    } finally {
      setChargementFoncier(false)
    }
  }, [typeApi, noeud?.id])

  // ── État cadastre ─────────────────────────────────────────────────────────
  const [cadastre, setCadastre] = useState(null)
  const [chargementCadastre, setChargementCadastre] = useState(false)
  const [erreurCadastre, setErreurCadastre] = useState(null)

  const chargerCadastre = useCallback(async () => {
    if (!typeApi || !noeud?.id) return
    setChargementCadastre(true)
    setErreurCadastre(null)
    try {
      const { data } = await getEntiteCadastre(typeApi, noeud.id)
      setCadastre(data)
    } catch (err) {
      const msg =
        err.response?.status === 403
          ? 'Authentification requise pour consulter les données cadastrales.'
          : 'Impossible de charger les données cadastrales.'
      setErreurCadastre(msg)
    } finally {
      setChargementCadastre(false)
    }
  }, [typeApi, noeud?.id])

  // ── État urbanisme ────────────────────────────────────────────────────────
  const [urbanisme, setUrbanisme] = useState(null)
  const [chargementUrbanisme, setChargementUrbanisme] = useState(false)
  const [erreurUrbanisme, setErreurUrbanisme] = useState(null)

  const chargerUrbanisme = useCallback(async () => {
    if (!typeApi || !noeud?.id) return
    setChargementUrbanisme(true)
    setErreurUrbanisme(null)
    try {
      const { data } = await getEntiteUrbanisme(typeApi, noeud.id)
      setUrbanisme(data)
    } catch (err) {
      const msg =
        err.response?.status === 403
          ? "Authentification requise pour consulter les données d'urbanisme."
          : "Impossible de charger les données d'urbanisme."
      setErreurUrbanisme(msg)
    } finally {
      setChargementUrbanisme(false)
    }
  }, [typeApi, noeud?.id])

  // On ne rend rien pour les types non supportés (SiteWeb, Parcelle…)
  if (!typeApi) return null

  return (
    <div className="space-y-2 mt-3" aria-label="Données géographiques et foncières">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Données géographiques
      </h3>

      {/* ── Section Foncier ── */}
      <SectionDetail
        titre="Foncier (DVF)"
        badge="Source : DVF Etalab"
        chargement={chargementFoncier}
        erreur={erreurFoncier}
        charge={foncier !== null}
        onOuvrir={chargerFoncier}
      >
        {foncier && (
          <>
            {foncier.raison ? (
              <p className="text-sm text-gray-500 italic">{foncier.raison}</p>
            ) : (
              <>
                {foncier.statsZone && (
                  <dl className="text-sm grid grid-cols-3 gap-2 mb-3 bg-gray-50 rounded p-2">
                    <div>
                      <dt className="text-xs text-gray-500">Transactions</dt>
                      <dd className="font-medium text-gray-900">
                        {foncier.statsZone.nbTransactions}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Prix médian</dt>
                      <dd className="font-medium text-gray-900">
                        {formaterEuros(foncier.statsZone.prixMedian)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Surface médiane</dt>
                      <dd className="font-medium text-gray-900">
                        {foncier.statsZone.surfaceMediane !== null &&
                        foncier.statsZone.surfaceMediane !== undefined
                          ? `${foncier.statsZone.surfaceMediane} m²`
                          : '—'}
                      </dd>
                    </div>
                  </dl>
                )}
                {foncier.transactions?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table
                      className="w-full text-xs border-collapse"
                      aria-label="Transactions immobilières DVF"
                    >
                      <thead>
                        <tr className="text-left border-b border-gray-200">
                          <th scope="col" className="py-1 pr-2 font-medium text-gray-600">
                            Date
                          </th>
                          <th scope="col" className="py-1 pr-2 font-medium text-gray-600">
                            Valeur
                          </th>
                          <th scope="col" className="py-1 pr-2 font-medium text-gray-600">
                            Surface
                          </th>
                          <th scope="col" className="py-1 font-medium text-gray-600">
                            Type
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {foncier.transactions.slice(0, 10).map((t, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-1 pr-2 text-gray-700">
                              {formaterDate(t.dateMutation)}
                            </td>
                            <td className="py-1 pr-2 text-gray-700">
                              {formaterEuros(t.valeurFonciere)}
                            </td>
                            <td className="py-1 pr-2 text-gray-700">
                              {t.surface !== null && t.surface !== undefined
                                ? `${t.surface} m²`
                                : '—'}
                            </td>
                            <td className="py-1 text-gray-700">{t.typeLocal ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {foncier.transactions.length > 10 && (
                      <p className="text-xs text-gray-500 mt-1">
                        + {foncier.transactions.length - 10} transaction(s) non affichée(s)
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Aucune transaction sur les 12 derniers mois.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </SectionDetail>

      {/* ── Section Cadastre ── */}
      <SectionDetail
        titre="Cadastre"
        badge="Source : IGN Cadastre"
        chargement={chargementCadastre}
        erreur={erreurCadastre}
        charge={cadastre !== null}
        onOuvrir={chargerCadastre}
      >
        {cadastre && (
          <>
            {cadastre.raison ? (
              <p className="text-sm text-gray-500 italic">{cadastre.raison}</p>
            ) : cadastre.parcelle ? (
              <dl className="text-sm divide-y divide-gray-100">
                {[
                  ['IDU', cadastre.parcelle.idu],
                  ['Section', cadastre.parcelle.section],
                  ['Numéro', cadastre.parcelle.numero],
                  [
                    'Contenance',
                    cadastre.parcelle.contenance !== null &&
                    cadastre.parcelle.contenance !== undefined
                      ? `${cadastre.parcelle.contenance} ca`
                      : null,
                  ],
                  ['Code INSEE', cadastre.parcelle.codeInsee],
                ].map(
                  ([label, valeur]) =>
                    valeur !== null &&
                    valeur !== undefined && (
                      <div key={label} className="flex justify-between py-1">
                        <dt className="text-gray-600 font-medium">{label}</dt>
                        <dd className="text-gray-900 text-right">{String(valeur)}</dd>
                      </div>
                    ),
                )}
              </dl>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Aucune parcelle trouvée pour cette zone.
              </p>
            )}
          </>
        )}
      </SectionDetail>

      {/* ── Section Urbanisme ── */}
      <SectionDetail
        titre="Urbanisme (PLU)"
        badge="Source : IGN GPU"
        chargement={chargementUrbanisme}
        erreur={erreurUrbanisme}
        charge={urbanisme !== null}
        onOuvrir={chargerUrbanisme}
      >
        {urbanisme && (
          <>
            {urbanisme.raison ? (
              <p className="text-sm text-gray-500 italic">{urbanisme.raison}</p>
            ) : urbanisme.zone ? (
              <dl className="text-sm divide-y divide-gray-100">
                {[
                  ['Libellé', urbanisme.zone.libelle],
                  ['Type de zone', urbanisme.zone.typezone],
                  ['Destinations', urbanisme.zone.destinations],
                ].map(
                  ([label, valeur]) =>
                    valeur !== null &&
                    valeur !== undefined && (
                      <div key={label} className="flex justify-between py-1 gap-2">
                        <dt className="text-gray-600 font-medium shrink-0">{label}</dt>
                        <dd className="text-gray-900 text-right">{String(valeur)}</dd>
                      </div>
                    ),
                )}
              </dl>
            ) : (
              <p className="text-sm text-gray-500 italic">Aucune zone d'urbanisme trouvée.</p>
            )}
          </>
        )}
      </SectionDetail>
    </div>
  )
}

export default PanneauDetailGeo
