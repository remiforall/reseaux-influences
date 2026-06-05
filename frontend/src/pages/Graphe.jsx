/**
 * Graphe — page ego-network multi-vues avec dimension géo-historique.
 *
 * Vues disponibles (tablist) :
 *   1. Graphe  — force-directed D3 (GrapheD3)
 *   2. Tableau — liste tabulaire (TableauGraphe)
 *   3. Carte   — heatmap géographique Leaflet (CarteChaleur)
 *   4. Timeline — frise chronologique D3 (TimelineActivite)
 *
 * Curseur temporel global :
 *   - Filtre actif : dateDebut <= curseurDate && (dateFin === null || dateFin >= curseurDate)
 *   - Partagé entre les 4 vues via prop dateSelectionnee
 *   - Bouton "Désactiver le filtre temporel" pour revenir à la vue globale
 *
 * Accessibilité AAA :
 *   - tablist / tab / tabpanel aria
 *   - aria-live sur loader et erreurs
 *   - focus rendu au tab actif après changement
 *   - prefers-reduced-motion respecté
 *
 * @module pages/Graphe
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getGrapheEgo,
  getTypesLiens,
  getGrapheTimeline,
  getGrapheHeatmap,
} from '../api/client'
import GrapheD3 from '../components/graphe/GrapheD3'
import TableauGraphe from '../components/graphe/TableauGraphe'
import FiltresGraphe from '../components/graphe/FiltresGraphe'
import LegendeGraphe from '../components/graphe/LegendeGraphe'
import SelecteurEntite from '../components/graphe/SelecteurEntite'
import CarteChaleur from '../components/graphe/CarteChaleur'
import TimelineActivite from '../components/graphe/TimelineActivite'
import PanneauDetailGeo from '../components/graphe/PanneauDetailGeo'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_API_VERS_UI = {
  personne: 'Personne',
  organisation: 'Organisation',
  site_web: 'SiteWeb',
  parcelle: 'Parcelle',
}

function normaliserTypeNoeud(noeud) {
  return { ...noeud, type: TYPE_API_VERS_UI[noeud.type] ?? noeud.type }
}

const FILTRES_DEFAUT = {
  typesLien: [],
  typesEntite: ['Personne', 'Organisation', 'SiteWeb'],
  statuts: ['VALIDE', 'EN_ATTENTE'],
}

/** IDs des vues disponibles */
const VUES = ['graphe', 'tableau', 'carte', 'timeline']
const LIBELLE_VUE = {
  graphe: 'Graphe',
  tableau: 'Tableau',
  carte: 'Carte',
  timeline: 'Frise',
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

function Graphe() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [entiteRacineId, setEntiteRacineId] = useState(searchParams.get('entite') ?? null)
  const [entiteRacineNom, setEntiteRacineNom] = useState(null)

  const [filtres, setFiltres] = useState(FILTRES_DEFAUT)
  const [vueActive, setVueActive] = useState('graphe')

  // Données du graphe principal
  const [noeuds, setNoeuds] = useState([])
  const [aretes, setAretes] = useState([])

  // Données timeline
  const [periodes, setPeriodes] = useState([])
  const [evenements, setEvenements] = useState([])

  // Données heatmap
  const [pointsHeatmap, setPointsHeatmap] = useState([])

  // Données de référence
  const [typesLienDisponibles, setTypesLienDisponibles] = useState([])

  // Filtrage temporel global
  const [dateSelectionnee, setDateSelectionnee] = useState(null)

  // États de chargement
  const [loading, setLoading] = useState(false)
  const [loadingTimeline, setLoadingTimeline] = useState(false)
  const [loadingHeatmap, setLoadingHeatmap] = useState(false)
  const [erreur, setErreur] = useState(null)

  // Nœud sélectionné dans le graphe
  const [noeudSelectionne, setNoeudSelectionne] = useState(null)

  const tabsRef = useRef([])
  const grapheRef = useRef(null)

  // ── Chargement des types de liens (une seule fois) ──
  useEffect(() => {
    getTypesLiens()
      .then(({ data }) => setTypesLienDisponibles(data ?? []))
      .catch(() => {})
  }, [])

  // ── Chargement du graphe ego quand l'entité racine change ──
  useEffect(() => {
    if (!entiteRacineId) return

    setSearchParams({ entite: entiteRacineId }, { replace: true })

    const charger = async () => {
      setLoading(true)
      setErreur(null)
      setNoeudSelectionne(null)

      try {
        const params = {
          profondeur: 2,
          statut: filtres.statuts.join(',') || 'VALIDE,EN_ATTENTE',
        }
        if (filtres.typesLien.length > 0) {
          params.typesLien = filtres.typesLien.join(',')
        }

        const { data } = await getGrapheEgo(entiteRacineId, params)

        const noeudsCharges = (data.noeuds ?? []).map(normaliserTypeNoeud)
        const aretesChargees = data.aretes ?? []

        setNoeuds(noeudsCharges)
        setAretes(aretesChargees)

        if (noeudsCharges.length < 3) {
          setVueActive('tableau')
        }
      } catch (err) {
        const msg =
          err.response?.status === 401
            ? "Vous devez être connecté pour consulter le graphe."
            : err.response?.status === 404
              ? "Entité introuvable. Vérifiez l'identifiant."
              : "Impossible de charger le graphe. Réessayez ultérieurement."
        setErreur(msg)
      } finally {
        setLoading(false)
      }
    }

    charger()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entiteRacineId, filtres.statuts, filtres.typesLien])

  // ── Chargement timeline quand l'entité change ou qu'on bascule sur cette vue ──
  useEffect(() => {
    if (!entiteRacineId || vueActive !== 'timeline') return

    const charger = async () => {
      setLoadingTimeline(true)
      try {
        const { data } = await getGrapheTimeline(entiteRacineId, { granularite: 'year' })
        setPeriodes(data.periodes ?? [])
        setEvenements(data.evenements ?? [])
      } catch {
        setPeriodes([])
        setEvenements([])
      } finally {
        setLoadingTimeline(false)
      }
    }

    charger()
  }, [entiteRacineId, vueActive])

  // ── Chargement heatmap quand l'entité change ou qu'on bascule sur cette vue ──
  useEffect(() => {
    if (!entiteRacineId || vueActive !== 'carte') return

    const charger = async () => {
      setLoadingHeatmap(true)
      try {
        const params = {}
        if (dateSelectionnee) params.dateDebut = dateSelectionnee
        const { data } = await getGrapheHeatmap(entiteRacineId, params)
        setPointsHeatmap(data.points ?? [])
      } catch {
        setPointsHeatmap([])
      } finally {
        setLoadingHeatmap(false)
      }
    }

    charger()
  }, [entiteRacineId, vueActive, dateSelectionnee])

  // ── Filtrage local (types d'entité + date) sur les données chargées ──
  const noeudsFiltrés = noeuds.filter(
    (n) => filtres.typesEntite.length === 0 || filtres.typesEntite.includes(n.type),
  )

  const idNoeudsFiltrés = new Set(noeudsFiltrés.map((n) => n.id))

  const aretesFiltrées = aretes.filter((a) => {
    if (!idNoeudsFiltrés.has(a.sourceId) || !idNoeudsFiltrés.has(a.cibleId)) return false
    if (filtres.statuts.length > 0 && !filtres.statuts.includes(a.statut)) return false

    // Filtre temporel global
    if (dateSelectionnee) {
      const curseur = new Date(dateSelectionnee)
      const debut = a.dateDebut ? new Date(a.dateDebut) : null
      const fin = a.dateFin ? new Date(a.dateFin) : null
      if (debut && debut > curseur) return false
      if (fin && fin < curseur) return false
    }

    return true
  })

  // ── Sélection d'entité depuis l'autocomplete ──
  const handleSelectionEntite = useCallback((entite) => {
    setEntiteRacineId(entite.id)
    setEntiteRacineNom(entite.nom)
    setVueActive('graphe')
    setDateSelectionnee(null)
  }, [])

  // ── Clic sur un nœud ──
  const handleSelectionNoeud = useCallback(
    (id) => {
      const noeud = noeuds.find((n) => n.id === id)
      setNoeudSelectionne(noeud ?? null)
    },
    [noeuds],
  )

  // ── Changement de vue ──
  const changerVue = (vue) => {
    setVueActive(vue)
    // Pas de requestAnimationFrame ici — le focus sera géré par handleKeydownTabs
  }

  // Navigation clavier dans la tablist (flèches)
  const handleKeydownTabs = (e, idxCourant) => {
    let nouvelIdx = idxCourant
    if (e.key === 'ArrowRight') {
      nouvelIdx = (idxCourant + 1) % VUES.length
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      nouvelIdx = (idxCourant - 1 + VUES.length) % VUES.length
      e.preventDefault()
    } else {
      return
    }
    changerVue(VUES[nouvelIdx])
    requestAnimationFrame(() => tabsRef.current[nouvelIdx]?.focus())
  }

  // ── Curseur temporel : calcul des bornes depuis les arêtes ──
  const datesAretes = aretes
    .map((a) => a.dateDebut)
    .filter(Boolean)
    .sort()

  const dateCurseurMin = datesAretes[0] ?? null
  const dateCurseurMax = datesAretes[datesAretes.length - 1] ?? null

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── En-tête ── */}
      <header>
        <h1 className="text-3xl font-bold text-primary">Graphe des réseaux d'influence</h1>
        <p className="text-gray-600 mt-1">
          Explorez les connexions entre personnes, organisations et sites web jusqu'à 2 sauts.
        </p>
      </header>

      {/* ── Sélecteur d'entité racine ── */}
      <section aria-labelledby="section-entite-centrale">
        <h2 id="section-entite-centrale" className="sr-only">
          Choisir l'entité centrale
        </h2>
        <SelecteurEntite onSelection={handleSelectionEntite} />
        {entiteRacineNom && (
          <p className="text-sm text-gray-600 mt-1">
            Entité centrale : <strong>{entiteRacineNom}</strong>
          </p>
        )}
      </section>

      {/* ── Curseur temporel global ── */}
      {entiteRacineId && dateCurseurMin && dateCurseurMax && dateCurseurMin !== dateCurseurMax && (
        <section aria-labelledby="section-filtre-temporel" className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 id="section-filtre-temporel" className="text-sm font-semibold text-gray-800">
              Filtre temporel
            </h2>
            {dateSelectionnee && (
              <button
                type="button"
                onClick={() => setDateSelectionnee(null)}
                className="text-sm text-blue-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 min-h-[44px] px-2"
              >
                Désactiver le filtre temporel
              </button>
            )}
          </div>

          <div>
            <label htmlFor="curseur-temporel-global" className="block text-sm text-gray-700 mb-1">
              Date sélectionnée :{' '}
              <strong aria-live="polite">{dateSelectionnee ?? 'Toutes les périodes'}</strong>
            </label>
            <input
              id="curseur-temporel-global"
              type="range"
              min={0}
              max={datesAretes.length - 1}
              step={1}
              value={dateSelectionnee ? datesAretes.indexOf(dateSelectionnee) : datesAretes.length - 1}
              onChange={(e) => {
                const idx = Number(e.target.value)
                setDateSelectionnee(datesAretes[idx] ?? null)
              }}
              aria-label="Curseur de filtre temporel global"
              aria-valuetext={dateSelectionnee ?? 'Toutes les périodes'}
              className="w-full h-2 rounded cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{dateCurseurMin}</span>
              <span>{dateCurseurMax}</span>
            </div>
          </div>

          {dateSelectionnee && (
            <p className="text-xs text-blue-700" aria-live="polite">
              Affichage des liens actifs au {dateSelectionnee}
              {' '}— {aretesFiltrées.length} lien{aretesFiltrées.length > 1 ? 's' : ''} visible{aretesFiltrées.length > 1 ? 's' : ''}
            </p>
          )}
        </section>
      )}

      {/* Aucune entité sélectionnée */}
      {!entiteRacineId && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center text-gray-500 space-y-2">
          <p className="text-4xl" aria-hidden="true">◉</p>
          <p className="font-medium">Sélectionnez une entité pour explorer son réseau.</p>
          <p className="text-sm">
            Utilisez le champ ci-dessus pour chercher une personne ou une organisation.
          </p>
        </div>
      )}

      {/* ── Contenu principal (une fois une entité sélectionnée) ── */}
      {entiteRacineId && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Colonne gauche : filtres + légende ── */}
          <aside className="lg:w-64 flex-shrink-0 space-y-4">
            <FiltresGraphe
              typesLienDisponibles={typesLienDisponibles}
              filtres={filtres}
              onChangeFiltres={setFiltres}
            />
            <LegendeGraphe />
          </aside>

          {/* ── Zone principale ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* ── Toggle vues (tablist) ── */}
            <div
              role="tablist"
              aria-label="Vues du graphe"
              className="flex flex-wrap gap-2 border-b border-gray-200 pb-2"
            >
              {VUES.map((vue, idx) => (
                <button
                  key={vue}
                  ref={(el) => (tabsRef.current[idx] = el)}
                  type="button"
                  role="tab"
                  id={`tab-${vue}`}
                  aria-controls={`panel-${vue}`}
                  aria-selected={vueActive === vue}
                  tabIndex={vueActive === vue ? 0 : -1}
                  onClick={() => changerVue(vue)}
                  onKeyDown={(e) => handleKeydownTabs(e, idx)}
                  className={[
                    'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t border-b-2 transition-colors min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                    vueActive === vue
                      ? 'border-blue-600 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {LIBELLE_VUE[vue]}
                </button>
              ))}

              {/* Recentrer (vue graphe seulement) */}
              {vueActive === 'graphe' && (
                <button
                  type="button"
                  onClick={() => grapheRef.current?.recentrer()}
                  className="inline-flex items-center gap-2 ml-auto px-4 py-2 text-sm font-medium rounded border border-gray-400 text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[44px]"
                  aria-label="Recentrer le graphe sur la vue d'origine"
                >
                  <span aria-hidden="true">⊕</span>
                  Recentrer
                </button>
              )}
            </div>

            {/* Info nombre de nœuds */}
            <p className="text-sm text-gray-500" aria-live="polite">
              {loading
                ? 'Chargement du graphe…'
                : `${noeudsFiltrés.length} entité${noeudsFiltrés.length > 1 ? 's' : ''}, ${aretesFiltrées.length} lien${aretesFiltrées.length > 1 ? 's' : ''}`}
              {dateSelectionnee && (
                <span className="ml-1 text-blue-600 text-xs">(filtré au {dateSelectionnee})</span>
              )}
            </p>

            {/* Loader */}
            {loading && (
              <p role="status" aria-live="polite" className="text-gray-500 text-center py-8">
                Chargement du graphe…
              </p>
            )}

            {/* Erreur */}
            {erreur && (
              <p
                role="alert"
                className="bg-red-50 border border-red-300 rounded p-4 text-sm text-red-800 flex items-center gap-2"
              >
                <span aria-hidden="true">⚠</span>
                {erreur}
              </p>
            )}

            {/* ── Panel Graphe ── */}
            <div
              role="tabpanel"
              id="panel-graphe"
              aria-labelledby="tab-graphe"
              hidden={vueActive !== 'graphe'}
            >
              {!loading && !erreur && vueActive === 'graphe' && (
                <>
                  {noeudsFiltrés.length > 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <GrapheD3
                        ref={grapheRef}
                        noeuds={noeudsFiltrés}
                        aretes={aretesFiltrées}
                        centreId={entiteRacineId}
                        onSelectionNoeud={handleSelectionNoeud}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Aucune entité avec les filtres actuels.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* ── Panel Tableau ── */}
            <div
              role="tabpanel"
              id="panel-tableau"
              aria-labelledby="tab-tableau"
              hidden={vueActive !== 'tableau'}
            >
              {!loading && !erreur && vueActive === 'tableau' && (
                <TableauGraphe
                  noeuds={noeudsFiltrés}
                  aretes={aretesFiltrées}
                  onSelectionEntite={(id) => {
                    setEntiteRacineId(id)
                    const n = noeuds.find((noeud) => noeud.id === id)
                    if (n) setEntiteRacineNom(n.nom ?? id)
                  }}
                />
              )}
            </div>

            {/* ── Panel Carte ── */}
            <div
              role="tabpanel"
              id="panel-carte"
              aria-labelledby="tab-carte"
              hidden={vueActive !== 'carte'}
            >
              {vueActive === 'carte' && (
                <>
                  {loadingHeatmap ? (
                    <p role="status" aria-live="polite" className="text-gray-500 text-center py-8">
                      Chargement de la carte…
                    </p>
                  ) : (
                    <CarteChaleur
                      points={pointsHeatmap}
                      onPointClick={(id) => {
                        setEntiteRacineId(id)
                        const point = pointsHeatmap.find((p) => p.entiteId === id)
                        if (point) setEntiteRacineNom(point.libelle ?? id)
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {/* ── Panel Timeline ── */}
            <div
              role="tabpanel"
              id="panel-timeline"
              aria-labelledby="tab-timeline"
              hidden={vueActive !== 'timeline'}
            >
              {vueActive === 'timeline' && (
                <>
                  {loadingTimeline ? (
                    <p role="status" aria-live="polite" className="text-gray-500 text-center py-8">
                      Chargement de la frise chronologique…
                    </p>
                  ) : (
                    <TimelineActivite
                      periodes={periodes}
                      evenements={evenements}
                      onPeriodeClick={(date) => setDateSelectionnee(date)}
                    />
                  )}
                </>
              )}
            </div>

            {/* ── Panneau de détail du nœud sélectionné ── */}
            {noeudSelectionne && (
              <aside
                aria-label={`Détails de ${noeudSelectionne.nom ?? noeudSelectionne.id}`}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-base font-bold text-gray-900">
                    {noeudSelectionne.nom ?? noeudSelectionne.id}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setNoeudSelectionne(null)}
                    aria-label="Fermer le panneau de détail"
                    className="text-gray-500 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
                <dl className="text-sm divide-y divide-gray-100">
                  <div className="flex justify-between py-1.5">
                    <dt className="font-medium text-gray-600">Type</dt>
                    <dd className="text-gray-900">{noeudSelectionne.type ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <dt className="font-medium text-gray-600">Statut</dt>
                    <dd className="text-gray-900">{noeudSelectionne.statut ?? '—'}</dd>
                  </div>
                  {noeudSelectionne.niveauSaut !== undefined && (
                    <div className="flex justify-between py-1.5">
                      <dt className="font-medium text-gray-600">Saut</dt>
                      <dd className="text-gray-900">{noeudSelectionne.niveauSaut}</dd>
                    </div>
                  )}
                </dl>
                <button
                  type="button"
                  onClick={() => {
                    setEntiteRacineId(noeudSelectionne.id)
                    setEntiteRacineNom(noeudSelectionne.nom ?? noeudSelectionne.id)
                    setNoeudSelectionne(null)
                    setDateSelectionnee(null)
                  }}
                  className="inline-flex items-center gap-1 text-sm text-blue-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded min-h-[44px]"
                >
                  Explorer ce réseau
                </button>

                {/* Sections géographiques IGN — chargement lazy */}
                <PanneauDetailGeo noeud={noeudSelectionne} />
              </aside>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Graphe
