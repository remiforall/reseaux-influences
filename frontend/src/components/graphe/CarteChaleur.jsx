/**
 * CarteChaleur — carte de chaleur géographique des liens d'une entité.
 *
 * Fonds de carte : IGN Géoplateforme WMTS (Plan IGN v2), auto-hébergé via API publique.
 * Zéro CDN externe — Leaflet est installé comme dépendance npm locale.
 *
 * Props :
 *   points        : Array<{ lat: number, lon: number, poids: number, libelle: string, entiteId: string }>
 *   centre        : { lat: number, lon: number } — centre initial (défaut : France métropolitaine)
 *   onPointClick  : (entiteId: string) => void — callback au clic sur un marqueur
 *
 * Attribution obligatoire : "Fonds de carte © IGN Géoplateforme — données reseaux-influences.fr"
 *
 * Accessibilité AAA :
 *   - Alternative tableau des 10 points les plus pondérés
 *   - prefers-reduced-motion : transitions de zoom désactivées
 *   - lang="fr" sur le conteneur
 *   - ARIA role="img" + aria-label sur la carte
 *   - Focus visible sur les marqueurs
 *   - Légende textuelle + niveaux numériques (CUD-safe — pas seulement la couleur)
 *
 * @param {{
 *   points: Array<{ lat: number, lon: number, poids: number, libelle: string, entiteId: string }>,
 *   centre?: { lat: number, lon: number },
 *   onPointClick?: (entiteId: string) => void,
 * }} props
 */
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { echapperHtml } from '../../utils/securite'

// Fix icônes Leaflet avec Vite (les assets ne sont pas résolus automatiquement)
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

/** URL du fond de carte IGN Géoplateforme WMTS (Plan IGN v2) */
const IGN_WMTS_URL =
  'https://data.geopf.fr/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE=normal' +
  '&TILEMATRIXSET=PM&FORMAT=image/png&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2' +
  '&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}'

const IGN_ATTRIBUTION =
  'Fonds de carte &copy; <a href="https://geoplateforme.ign.fr" rel="external noopener">IGN Géoplateforme</a> — données reseaux-influences.fr'

/** Centre par défaut : France métropolitaine */
const CENTRE_DEFAUT = { lat: 46.5, lon: 2.5 }
const ZOOM_DEFAUT = 5

/** Couleur par palette d'intensité CUD-safe (bleu → orange → rouge) */
const COULEUR_PAR_SEUIL = [
  { seuil: 0.1, couleur: '#2563eb', classe: 'bg-blue-600', libelle: 'Faible' },
  { seuil: 0.5, couleur: '#f59e0b', classe: 'bg-amber-500', libelle: 'Moyen' },
  { seuil: 1.5, couleur: '#dc2626', classe: 'bg-red-600', libelle: 'Fort' },
]

function obtenirCouleur(poids) {
  for (let i = COULEUR_PAR_SEUIL.length - 1; i >= 0; i--) {
    if (poids >= COULEUR_PAR_SEUIL[i].seuil) return COULEUR_PAR_SEUIL[i]
  }
  return COULEUR_PAR_SEUIL[0]
}

/**
 * Vérifie si l'utilisateur préfère moins de mouvement.
 */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function CarteChaleur({ points = [], centre = CENTRE_DEFAUT, onPointClick }) {
  const carteRef = useRef(null)
  const instanceCarteRef = useRef(null)
  const heatLayerRef = useRef(null)
  const marqueursRef = useRef([])

  const [vuTableau, setVuTableau] = useState(false)

  const pointsValides = points.filter((p) => typeof p.lat === 'number' && typeof p.lon === 'number')

  // Initialisation de la carte Leaflet
  useEffect(() => {
    if (instanceCarteRef.current) return // déjà initialisée

    const div = carteRef.current
    if (!div) return

    const carte = L.map(div, {
      center: [centre.lat, centre.lon],
      zoom: ZOOM_DEFAUT,
      // prefers-reduced-motion : désactiver les animations
      zoomAnimation: !prefersReducedMotion(),
      fadeAnimation: !prefersReducedMotion(),
      markerZoomAnimation: !prefersReducedMotion(),
      // Accessibilité clavier
      keyboard: true,
    })

    // Fond de carte IGN Géoplateforme (zéro CDN tiers)
    L.tileLayer(IGN_WMTS_URL, {
      attribution: IGN_ATTRIBUTION,
      maxZoom: 18,
    }).addTo(carte)

    instanceCarteRef.current = carte

    return () => {
      carte.remove()
      instanceCarteRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mise à jour des points sur la carte
  useEffect(() => {
    const carte = instanceCarteRef.current
    if (!carte) return

    // Supprimer les marqueurs précédents
    for (const m of marqueursRef.current) {
      m.remove()
    }
    marqueursRef.current = []

    // Supprimer le layer heatmap précédent
    if (heatLayerRef.current) {
      heatLayerRef.current.remove()
      heatLayerRef.current = null
    }

    if (pointsValides.length === 0) return

    // Couche heatmap (leaflet.heat doit être importé après Leaflet)
    // Import dynamique pour éviter les erreurs SSR
    import('leaflet.heat')
      .then(() => {
        if (!instanceCarteRef.current) return

        const heatData = pointsValides.map((p) => [p.lat, p.lon, Math.min(p.poids, 1)])
        // L.heatLayer est ajouté par leaflet.heat sur l'objet L global
        if (L.heatLayer) {
          heatLayerRef.current = L.heatLayer(heatData, {
            radius: 25,
            blur: 15,
            maxZoom: 14,
            gradient: {
              0.0: '#2563eb',
              0.5: '#f59e0b',
              1.0: '#dc2626',
            },
          }).addTo(instanceCarteRef.current)
        }
      })
      .catch(() => {
        // leaflet.heat non disponible — on affiche uniquement les marqueurs
      })

    // Marqueurs cliquables pour l'interactivité (au-dessus du layer de chaleur)
    for (const point of pointsValides) {
      const couleurInfo = obtenirCouleur(point.poids)
      const icone = L.divIcon({
        html: `<span
          style="
            display:inline-block;
            width:12px;
            height:12px;
            border-radius:50%;
            background:${couleurInfo.couleur};
            border:2px solid white;
            box-shadow:0 0 4px rgba(0,0,0,.4);
          "
          aria-hidden="true"
        ></span>`,
        className: '',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })

      const marqueur = L.marker([point.lat, point.lon], {
        icon: icone,
        title: point.libelle ?? point.entiteId,
        alt: `${point.libelle ?? 'Entité'} — poids ${point.poids.toFixed(2)}`,
        keyboard: true,
      })
        .addTo(carte)
        .bindPopup(
          // libelle/entiteId proviennent de sources externes → échappement HTML obligatoire (XSS)
          `<strong>${echapperHtml(point.libelle ?? point.entiteId)}</strong><br>
          Poids : <strong>${point.poids.toFixed(2)}</strong> (${echapperHtml(couleurInfo.libelle)})`,
        )

      if (onPointClick) {
        marqueur.on('click', () => onPointClick(point.entiteId))
        marqueur.on('keydown', (e) => {
          if (e.originalEvent?.key === 'Enter' || e.originalEvent?.key === ' ') {
            onPointClick(point.entiteId)
          }
        })
      }

      marqueursRef.current.push(marqueur)
    }

    // Recentrer la carte sur l'ensemble des points si au moins 2 points
    if (pointsValides.length >= 2) {
      const bornes = L.latLngBounds(pointsValides.map((p) => [p.lat, p.lon]))
      carte.fitBounds(bornes, { padding: [40, 40], animate: !prefersReducedMotion() })
    } else if (pointsValides.length === 1) {
      carte.setView([pointsValides[0].lat, pointsValides[0].lon], 10, {
        animate: !prefersReducedMotion(),
      })
    }
  }, [pointsValides, onPointClick])

  // Top 10 pour le tableau alternatif
  const top10 = [...pointsValides].sort((a, b) => b.poids - a.poids).slice(0, 10)

  return (
    <div lang="fr" className="space-y-3">
      {/* Barre de contrôle */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setVuTableau((v) => !v)}
          aria-pressed={vuTableau}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded border border-gray-400 text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[44px]"
        >
          <span aria-hidden="true">{vuTableau ? '◉' : '☰'}</span>
          {vuTableau ? 'Voir la carte' : 'Voir en tableau'}
        </button>

        <span className="text-sm text-gray-600">
          {pointsValides.length} point{pointsValides.length > 1 ? 's' : ''} géolocalisé
          {pointsValides.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Légende CUD-safe (couleur + texte + niveau numérique) */}
      <div
        role="complementary"
        aria-label="Légende de la carte de chaleur"
        className="flex items-center gap-4 flex-wrap text-sm"
      >
        {COULEUR_PAR_SEUIL.map((item) => (
          <span key={item.libelle} className="flex items-center gap-1.5">
            <span
              className={`inline-block w-4 h-4 rounded-full ${item.classe} flex-shrink-0`}
              aria-hidden="true"
            />
            <span>
              {item.libelle} (poids ≥ {item.seuil})
            </span>
          </span>
        ))}
      </div>

      {/* Vue carte */}
      {!vuTableau && (
        <div
          ref={carteRef}
          role="img"
          aria-label={`Carte de chaleur géographique — ${pointsValides.length} entité(s) géolocalisée(s)`}
          className="w-full rounded-lg border border-gray-200 overflow-hidden"
          style={{ height: '480px' }}
        />
      )}

      {/* Vue tableau alternatif (accessibilité AAA) */}
      {vuTableau && (
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Top {top10.length} entités par poids géographique
          </h3>
          {top10.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">Aucune entité géolocalisée.</p>
          ) : (
            <table
              className="w-full text-sm border-collapse"
              aria-label="Entités géolocalisées classées par poids"
            >
              <caption className="sr-only">
                Les entités sont classées par poids décroissant (intensite × score de confiance).
              </caption>
              <thead>
                <tr className="border-b border-gray-200">
                  <th scope="col" className="py-2 text-left font-medium text-gray-700">
                    Rang
                  </th>
                  <th scope="col" className="py-2 text-left font-medium text-gray-700">
                    Entité
                  </th>
                  <th scope="col" className="py-2 text-right font-medium text-gray-700">
                    Poids
                  </th>
                  <th scope="col" className="py-2 text-left font-medium text-gray-700">
                    Niveau
                  </th>
                  <th scope="col" className="py-2 text-right font-medium text-gray-700">
                    Lat
                  </th>
                  <th scope="col" className="py-2 text-right font-medium text-gray-700">
                    Lon
                  </th>
                </tr>
              </thead>
              <tbody>
                {top10.map((point, idx) => {
                  const couleurInfo = obtenirCouleur(point.poids)
                  return (
                    <tr key={point.entiteId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-1.5 text-gray-500">{idx + 1}</td>
                      <td className="py-1.5">
                        {onPointClick ? (
                          <button
                            type="button"
                            onClick={() => onPointClick(point.entiteId)}
                            className="text-blue-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600"
                          >
                            {point.libelle ?? point.entiteId}
                          </button>
                        ) : (
                          <span>{point.libelle ?? point.entiteId}</span>
                        )}
                      </td>
                      <td className="py-1.5 text-right font-mono">{point.poids.toFixed(3)}</td>
                      <td className="py-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-white ${couleurInfo.classe}`}
                        >
                          {couleurInfo.libelle}
                        </span>
                      </td>
                      <td className="py-1.5 text-right font-mono text-gray-600">
                        {point.lat.toFixed(4)}
                      </td>
                      <td className="py-1.5 text-right font-mono text-gray-600">
                        {point.lon.toFixed(4)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default CarteChaleur
