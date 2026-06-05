/**
 * Enrichissement — page de recherche et d'import OSINT.
 *
 * Flux :
 *   1. Charge les connecteurs actifs au montage (GET /api/enrichissement/connecteurs)
 *   2. L'utilisateur soumet un formulaire de recherche
 *   3. L'API renvoie une liste de PreviewEntite[] + statutParConnecteur
 *   4. Pour chaque préview, l'utilisateur sélectionne les champs/liens à retenir
 *   5. Un formulaire d'import (FormulaireImport) demande la qualité d'influence
 *      puis soumet POST /api/enrichissement/importer
 *
 * Accessibilité AAA :
 *   - aria-live="polite" via RegionAnnonces pour toutes les transitions d'état
 *   - Ordre DOM cohérent : note RGPD → form → statuts → résultats
 *   - Focus géré : renvoyé sur le premier résultat après la recherche
 *   - prefers-reduced-motion : aucune animation (loader textuel uniquement)
 *   - Navigation clavier : Tab parcourt form → résultats → boutons import
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { getEnrichissementConnecteurs, postEnrichissementRechercher } from '../api/client'
import FormulaireRecherche from '../components/enrichissement/FormulaireRecherche'
import PreviewEntite from '../components/enrichissement/PreviewEntite'
import FormulaireImport from '../components/enrichissement/FormulaireImport'
import StatutConnecteur from '../components/enrichissement/StatutConnecteur'
import RegionAnnonces from '../components/enrichissement/RegionAnnonces'

function Enrichissement() {
  /* ── État principal ── */
  const [connecteursDisponibles, setConnecteursDisponibles] = useState([])
  const [previews, setPreviews] = useState([])
  const [statutParConnecteur, setStatutParConnecteur] = useState({})
  const [enChargementConnecteurs, setEnChargementConnecteurs] = useState(true)
  const [enChargementRecherche, setEnChargementRecherche] = useState(false)
  const [erreurGlobale, setErreurGlobale] = useState(null)
  const [annonce, setAnnonce] = useState(null)

  /**
   * Choix par entité : tableau indexé sur previews.
   * Chaque entrée : { champsRetenus: {}, liensRetenus: [], typeEntite: string }
   */
  const [choixParEntite, setChoixParEntite] = useState([])

  /* Index de la préview pour laquelle le formulaire d'import est ouvert (-1 = aucun) */
  const [indexImportOuvert, setIndexImportOuvert] = useState(-1)

  /* Résultat d'import le plus récent (pour le toast de succès) */
  const [importSucces, setImportSucces] = useState(null)

  /* Ref vers le premier résultat pour y renvoyer le focus après recherche */
  const premierResultatRef = useRef(null)

  /* ── Chargement des connecteurs au montage ── */
  useEffect(() => {
    const charger = async () => {
      try {
        const { data } = await getEnrichissementConnecteurs()
        const noms = (data.connecteurs ?? []).map((c) => (typeof c === 'string' ? c : c.nom))
        setConnecteursDisponibles(noms)
      } catch {
        /* Dégradation propre : formulaire reste utilisable sans filtres connecteurs */
        setConnecteursDisponibles([])
      } finally {
        setEnChargementConnecteurs(false)
      }
    }
    charger()
  }, [])

  /* ── Recherche ── */
  const lancerRecherche = useCallback(async ({ query, types, connecteurs }) => {
    setEnChargementRecherche(true)
    setErreurGlobale(null)
    setPreviews([])
    setStatutParConnecteur({})
    setChoixParEntite([])
    setIndexImportOuvert(-1)
    setImportSucces(null)

    const nbConnecteurs = connecteurs.length
    setAnnonce(`Recherche en cours sur ${nbConnecteurs} connecteur${nbConnecteurs > 1 ? 's' : ''}…`)

    try {
      const { data } = await postEnrichissementRechercher({ query, types, connecteurs })
      const resultats = data.resultats ?? []
      const statuts = data.statutParConnecteur ?? {}

      setPreviews(resultats)
      setStatutParConnecteur(statuts)
      setChoixParEntite(
        resultats.map((p) => ({
          champsRetenus: {},
          liensRetenus: [],
          typeEntite: p.typeSuggere ?? 'Personne',
        })),
      )

      if (resultats.length === 0) {
        setAnnonce('Aucun résultat trouvé.')
      } else {
        setAnnonce(
          `${resultats.length} résultat${resultats.length > 1 ? 's' : ''} trouvé${resultats.length > 1 ? 's' : ''}.`,
        )
        /* Renvoyer le focus vers le premier résultat */
        requestAnimationFrame(() => {
          premierResultatRef.current?.focus()
        })
      }
    } catch (err) {
      const msg =
        err.response?.status === 401
          ? 'Vous devez être connecté pour effectuer une recherche.'
          : 'Erreur lors de la recherche. Réessayez ultérieurement.'
      setErreurGlobale(msg)
      setAnnonce(msg)
    } finally {
      setEnChargementRecherche(false)
    }
  }, [])

  /* ── Mise à jour du choix pour une entité ── */
  const mettreAJourChoix = useCallback((index, nouveauChoix) => {
    setChoixParEntite((prev) => {
      const copie = [...prev]
      copie[index] = nouveauChoix
      return copie
    })
  }, [])

  /* ── Succès import ── */
  const handleSuccesImport = useCallback((resultat) => {
    setIndexImportOuvert(-1)
    setImportSucces(resultat)
    setAnnonce(
      `Entité importée en brouillon avec succès. Identifiant : ${resultat.entitePrincipaleId ?? '—'}.`,
    )
  }, [])

  /* ── Affichage des statuts connecteurs (en cours ou terminés) ── */
  const entreeStatuts = Object.entries(statutParConnecteur)
  const afficherStatuts = enChargementRecherche || entreeStatuts.length > 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Annonces pour lecteurs d'écran */}
      <RegionAnnonces message={annonce} />

      {/* ── En-tête ── */}
      <header>
        <h1 className="text-3xl font-bold text-primary">Importer une fiche</h1>
        <p className="text-gray-600 mt-1">
          Recherchez des entités dans des sources publiques officielles (Wikidata, RDAP, IGN) et
          importez-les en brouillon pour contribuer au réseau.
        </p>
      </header>

      {/* ── Note RGPD obligatoire avant le formulaire ── */}
      <aside
        role="note"
        aria-label="Avertissement base légale"
        className="bg-amber-50 border border-amber-300 rounded p-4 text-sm text-amber-900 space-y-1"
      >
        <p className="font-semibold flex items-center gap-2">
          <span aria-hidden="true">⚠</span>
          Base légale et responsabilité éditoriale
        </p>
        <p>
          Ce module traite des données personnelles de <strong>personnes publiques</strong> dans le
          cadre de l'exception journalisme et recherche d'intérêt public (art. 85 RGPD + art. 80 loi
          Informatique et Libertés). Vous devez déclarer la qualité d'influence de chaque entité
          importée. Toute opération est auditée et tracée.
        </p>
      </aside>

      {/* ── Formulaire de recherche ── */}
      <section aria-labelledby="section-recherche">
        <h2 id="section-recherche" className="text-xl font-semibold text-gray-900 mb-4">
          Rechercher une entité
        </h2>
        {enChargementConnecteurs ? (
          <p className="text-gray-500 text-sm">Chargement des sources disponibles…</p>
        ) : (
          <FormulaireRecherche
            connecteursDisponibles={connecteursDisponibles}
            onSubmit={lancerRecherche}
            enChargement={enChargementRecherche}
          />
        )}
      </section>

      {/* ── Statuts connecteurs ── */}
      {afficherStatuts && (
        <section aria-labelledby="section-statuts" aria-live="polite">
          <h2 id="section-statuts" className="text-sm font-semibold text-gray-700 mb-2">
            État des sources
          </h2>
          <ul className="flex flex-wrap gap-2" aria-label="Statut par connecteur">
            {enChargementRecherche
              ? connecteursDisponibles.map((nom) => (
                  <StatutConnecteur key={nom} nom={nom} statut="chargement" />
                ))
              : entreeStatuts.map(([nom, statut]) => (
                  <StatutConnecteur key={nom} nom={nom} statut={statut} />
                ))}
          </ul>
        </section>
      )}

      {/* ── Erreur globale ── */}
      {erreurGlobale && (
        <p
          role="alert"
          className="bg-red-50 border border-red-300 rounded p-4 text-sm text-red-800 flex items-center gap-2"
        >
          <span aria-hidden="true">⚠</span>
          {erreurGlobale}
        </p>
      )}

      {/* ── Toast succès import ── */}
      {importSucces && (
        <div
          role="status"
          aria-live="polite"
          className="bg-green-50 border border-green-300 rounded p-4 text-sm text-green-800 flex items-center gap-2"
        >
          <span aria-hidden="true">✓</span>
          <span>
            Entité importée en brouillon.{' '}
            {importSucces.entitePrincipaleId && (
              /* Lien vers le graphe ego de l'entité créée.
               * La route /entites/:id n'existe pas — on utilise /graphe?entite=:id
               * qui affiche le réseau de l'entité et existe dans le routeur. */
              <a
                href={`/graphe?entite=${importSucces.entitePrincipaleId}`}
                className="underline focus-visible-ring rounded"
              >
                Explorer son réseau
              </a>
            )}
          </span>
        </div>
      )}

      {/* ── Résultats ── */}
      {previews.length > 0 && (
        <section aria-labelledby="section-resultats">
          <h2 id="section-resultats" className="text-xl font-semibold text-gray-900 mb-4">
            Résultats ({previews.length})
          </h2>
          <ul className="space-y-4" aria-label="Liste des entités candidates">
            {previews.map((preview, i) => (
              <li key={i}>
                {/* Formulaire d'import inline sous la carte concernée */}
                <PreviewEntite
                  preview={preview}
                  index={i}
                  choix={
                    choixParEntite[i] ?? {
                      champsRetenus: {},
                      liensRetenus: [],
                      typeEntite: preview.typeSuggere,
                    }
                  }
                  onChoixChange={(c) => mettreAJourChoix(i, c)}
                  onImporter={() => setIndexImportOuvert(i)}
                  /* ref sur le premier résultat pour le focus post-recherche */
                  {...(i === 0 ? { ref: premierResultatRef } : {})}
                />
                {indexImportOuvert === i && (
                  <div className="mt-2 ml-4">
                    <FormulaireImport
                      preview={preview}
                      choixUtilisateur={
                        choixParEntite[i] ?? {
                          champsRetenus: {},
                          liensRetenus: [],
                          typeEntite: preview.typeSuggere,
                        }
                      }
                      onSucces={handleSuccesImport}
                      onFermer={() => setIndexImportOuvert(-1)}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── État vide après recherche ── */}
      {!enChargementRecherche &&
        previews.length === 0 &&
        Object.keys(statutParConnecteur).length > 0 && (
          <p className="text-gray-500 text-center py-8">
            Aucune entité trouvée pour cette recherche. Essayez d'autres termes ou types.
          </p>
        )}
    </div>
  )
}

export default Enrichissement
