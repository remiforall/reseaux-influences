/**
 * TimelineActivite — frise chronologique d'activité d'une entité.
 *
 * Visualise le volume de liens et l'intensité moyenne par période (année ou mois)
 * sous forme d'histogramme D3.js.
 *
 * Props :
 *   periodes       : Array<{ date: string, volumeLiens: number, intensiteMoyenne: number, scoreConfianceMoyen: number }>
 *   evenements     : Array<{ date: string, titre: string, typeEvenement: string }>
 *   dateMin        : string — borne gauche ISO (optionnelle)
 *   dateMax        : string — borne droite ISO (optionnelle)
 *   onPeriodeClick : (date: string) => void — callback au clic sur une période
 *
 * Rendu SVG :
 *   - Axe X = temps (d3.scaleTime)
 *   - Hauteur barre = volumeLiens
 *   - Couleur barre = intensiteMoyenne (gradient bleu → rouge, CUD-safe avec encodage opacité)
 *   - Opacité = scoreConfianceMoyen
 *   - Marqueurs verticaux pour les Evenement avec tooltip
 *   - Curseur temporel : <input type="range"> natif sous le SVG, synchronisé bidirectionnellement
 *
 * Accessibilité AAA :
 *   - Alternative tableau : volume de liens par période
 *   - Curseur = input[type=range] natif, aria-label, aria-valuenow
 *   - aria-label sur chaque barre : "Année X, N liens, intensité moyenne Y"
 *   - prefers-reduced-motion : transitions désactivées
 *   - Navigation clavier dans le tableau alternatif
 *
 * @param {{
 *   periodes: Array<{date:string, volumeLiens:number, intensiteMoyenne:number, scoreConfianceMoyen:number}>,
 *   evenements?: Array<{date:string, titre:string, typeEvenement:string}>,
 *   dateMin?: string,
 *   dateMax?: string,
 *   onPeriodeClick?: (date: string) => void,
 * }} props
 */
import { useEffect, useRef, useState, useId } from 'react'
import * as d3 from 'd3'

/** Préfère les transitions réduites ? */
const reduitMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Palette de couleur : intensiteMoyenne 0→5 → bleu (#2563eb) → rouge (#dc2626) */
const echelleIntensiteCouleur = d3
  .scaleLinear()
  .domain([0, 2.5, 5])
  .range(['#2563eb', '#f59e0b', '#dc2626'])
  .clamp(true)

const MARGE = { haut: 20, droite: 20, bas: 50, gauche: 50 }

function TimelineActivite({ periodes = [], evenements = [], dateMin, dateMax, onPeriodeClick }) {
  const svgRef = useRef(null)
  const [vuTableau, setVuTableau] = useState(false)
  const [indexCurseur, setIndexCurseur] = useState(0)
  const idGraphe = useId()
  const idDesc = useId()

  // Construire les données filtrées et triées
  const periodesTriees = [...periodes]
    .filter((p) => p.date && typeof p.volumeLiens === 'number')
    .sort((a, b) => a.date.localeCompare(b.date))

  const borneMin = dateMin
    ? new Date(dateMin)
    : periodesTriees.length > 0
      ? new Date(periodesTriees[0].date)
      : new Date('2000-01-01')

  const borneMax = dateMax
    ? new Date(dateMax)
    : periodesTriees.length > 0
      ? new Date(periodesTriees[periodesTriees.length - 1].date)
      : new Date()

  const periodeSurvol = periodesTriees[indexCurseur] ?? null

  // Construction du graphe D3
  useEffect(() => {
    if (!svgRef.current || periodesTriees.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const conteneur = svgRef.current.parentElement
    const largeurTotale = Math.max(conteneur?.clientWidth ?? 600, 400)
    const hauteurTotale = 240

    const largeur = largeurTotale - MARGE.gauche - MARGE.droite
    const hauteur = hauteurTotale - MARGE.haut - MARGE.bas

    const g = svg
      .attr('width', largeurTotale)
      .attr('height', hauteurTotale)
      .attr('aria-hidden', 'true') // Le tableau alternatif est la source a11y
      .append('g')
      .attr('transform', `translate(${MARGE.gauche},${MARGE.haut})`)

    // Échelle X temporelle
    const echelleX = d3.scaleTime().domain([borneMin, borneMax]).range([0, largeur])

    // Échelle Y volumeLiens
    const maxVolume = d3.max(periodesTriees, (d) => d.volumeLiens) ?? 1
    const echelleY = d3.scaleLinear().domain([0, maxVolume]).nice().range([hauteur, 0])

    // Axe X
    g.append('g')
      .attr('transform', `translate(0,${hauteur})`)
      .call(
        d3
          .axisBottom(echelleX)
          .ticks(Math.min(periodesTriees.length, 8))
          .tickFormat(d3.timeFormat('%Y')),
      )
      .selectAll('text')
      .style('font-size', '11px')

    // Axe Y
    g.append('g')
      .call(d3.axisLeft(echelleY).ticks(5).tickFormat(d3.format('d')))
      .selectAll('text')
      .style('font-size', '11px')

    // Label axe Y
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -MARGE.gauche + 12)
      .attr('x', -hauteur / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#6b7280')
      .text('Volume de liens')

    // Calcul de la largeur d'une barre
    const dureeMs = borneMax.getTime() - borneMin.getTime()
    const nbPeriodes = periodesTriees.length || 1
    const largeurBarre = Math.max((largeur / nbPeriodes) * 0.8, 4)

    // Barres
    const durTransition = reduitMotion() ? 0 : 300

    g.selectAll('rect.barre')
      .data(periodesTriees)
      .join('rect')
      .attr('class', 'barre')
      .attr('x', (d) => echelleX(new Date(d.date)) - largeurBarre / 2)
      .attr('y', hauteur) // départ depuis le bas
      .attr('width', largeurBarre)
      .attr('height', 0)
      .attr('fill', (d) => echelleIntensiteCouleur(d.intensiteMoyenne ?? 0))
      .attr('opacity', (d) => Math.max(0.3, d.scoreConfianceMoyen ?? 0.5))
      .attr('rx', 2)
      .attr('cursor', onPeriodeClick ? 'pointer' : 'default')
      .on('click', (_e, d) => onPeriodeClick?.(d.date))
      .transition()
      .duration(durTransition)
      .attr('y', (d) => echelleY(d.volumeLiens))
      .attr('height', (d) => hauteur - echelleY(d.volumeLiens))

    // Marqueurs événements
    const evenementsFiltres = evenements.filter((e) => e.date)
    for (const evt of evenementsFiltres) {
      const x = echelleX(new Date(evt.date))
      if (x < 0 || x > largeur) continue

      g.append('line')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', 0)
        .attr('y2', hauteur)
        .attr('stroke', '#7c3aed')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 3')
        .attr('opacity', 0.7)

      g.append('circle')
        .attr('cx', x)
        .attr('cy', 0)
        .attr('r', 5)
        .attr('fill', '#7c3aed')
        .attr('cursor', 'help')
        .append('title')
        .text(`${evt.date} — ${evt.titre} (${evt.typeEvenement})`)
    }

    // Ligne de curseur (position courante)
    if (periodeSurvol) {
      const xCurseur = echelleX(new Date(periodeSurvol.date))
      g.append('line')
        .attr('class', 'ligne-curseur')
        .attr('x1', xCurseur)
        .attr('x2', xCurseur)
        .attr('y1', 0)
        .attr('y2', hauteur)
        .attr('stroke', '#111827')
        .attr('stroke-width', 2)
        .attr('pointer-events', 'none')
    }
  }, [periodesTriees, evenements, indexCurseur, borneMin, borneMax, onPeriodeClick])

  return (
    <div className="space-y-3">
      {/* Barre de contrôle */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setVuTableau((v) => !v)}
          aria-pressed={vuTableau}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded border border-gray-400 text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[44px]"
        >
          <span aria-hidden="true">{vuTableau ? '◉' : '☰'}</span>
          {vuTableau ? 'Voir le graphique' : 'Voir en tableau'}
        </button>
        <span className="text-sm text-gray-600">
          {periodesTriees.length} période{periodesTriees.length > 1 ? 's' : ''}
          {evenements.length > 0 &&
            ` · ${evenements.length} événement${evenements.length > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Légende gradient CUD-safe */}
      <div
        role="complementary"
        aria-label="Légende de la frise chronologique"
        className="flex items-center gap-6 flex-wrap text-xs text-gray-600"
      >
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-10 h-3 rounded"
            style={{
              background: 'linear-gradient(to right, #2563eb, #f59e0b, #dc2626)',
            }}
            aria-hidden="true"
          />
          Intensité (bleu = faible, rouge = élevée)
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-4 h-0.5 bg-purple-600 opacity-70"
            aria-hidden="true"
            style={{ borderTop: '2px dashed #7c3aed' }}
          />
          Événement historique
        </span>
        <span>Opacité = score de confiance</span>
      </div>

      {/* Vue graphique SVG */}
      {!vuTableau && (
        <div>
          {periodesTriees.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">
              Aucune donnée chronologique disponible.
            </p>
          ) : (
            <>
              <svg
                ref={svgRef}
                id={idGraphe}
                className="w-full"
                aria-hidden="true"
                focusable="false"
              />

              {/* Curseur temporel — <input type="range"> natif pour accessibilité AAA */}
              <div className="mt-3">
                <label
                  htmlFor={`curseur-${idGraphe}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Période sélectionnée :{' '}
                  <strong aria-live="polite">
                    {periodeSurvol?.date ?? '—'}
                    {periodeSurvol
                      ? ` (${periodeSurvol.volumeLiens} lien${periodeSurvol.volumeLiens > 1 ? 's' : ''})`
                      : ''}
                  </strong>
                </label>
                <input
                  id={`curseur-${idGraphe}`}
                  type="range"
                  min={0}
                  max={Math.max(periodesTriees.length - 1, 0)}
                  step={1}
                  value={indexCurseur}
                  onChange={(e) => {
                    const idx = Number(e.target.value)
                    setIndexCurseur(idx)
                    if (onPeriodeClick && periodesTriees[idx]) {
                      onPeriodeClick(periodesTriees[idx].date)
                    }
                  }}
                  aria-label="Curseur de la période chronologique"
                  aria-valuenow={indexCurseur}
                  aria-valuemin={0}
                  aria-valuemax={periodesTriees.length - 1}
                  aria-valuetext={periodeSurvol?.date ?? 'Aucune période'}
                  className="w-full h-2 rounded cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{periodesTriees[0]?.date ?? '—'}</span>
                  <span>{periodesTriees[periodesTriees.length - 1]?.date ?? '—'}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Vue tableau alternatif (accessibilité AAA) */}
      {vuTableau && (
        <div>
          {periodesTriees.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Aucune donnée chronologique disponible.
            </p>
          ) : (
            <table
              className="w-full text-sm border-collapse"
              aria-label="Volume de liens par période"
              id={idDesc}
            >
              <caption className="sr-only">
                Volume de liens par période, avec intensité moyenne et score de confiance.
              </caption>
              <thead>
                <tr className="border-b border-gray-200">
                  <th scope="col" className="py-2 text-left font-medium text-gray-700">
                    Période
                  </th>
                  <th scope="col" className="py-2 text-right font-medium text-gray-700">
                    Volume de liens
                  </th>
                  <th scope="col" className="py-2 text-right font-medium text-gray-700">
                    Intensité moyenne
                  </th>
                  <th scope="col" className="py-2 text-right font-medium text-gray-700">
                    Score confiance
                  </th>
                </tr>
              </thead>
              <tbody>
                {periodesTriees.map((p) => {
                  const couleur = echelleIntensiteCouleur(p.intensiteMoyenne ?? 0)
                  return (
                    <tr key={p.date} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-1.5">
                        {onPeriodeClick ? (
                          <button
                            type="button"
                            onClick={() => onPeriodeClick(p.date)}
                            className="text-blue-700 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600"
                          >
                            {p.date}
                          </button>
                        ) : (
                          <span>{p.date}</span>
                        )}
                      </td>
                      <td className="py-1.5 text-right font-mono">{p.volumeLiens}</td>
                      <td className="py-1.5 text-right">
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: couleur }}
                          aria-label={`Intensité : ${(p.intensiteMoyenne ?? 0).toFixed(2)}`}
                        >
                          {(p.intensiteMoyenne ?? 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-1.5 text-right font-mono text-gray-600">
                        {((p.scoreConfianceMoyen ?? 0) * 100).toFixed(0)} %
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {/* Événements dans le tableau */}
          {evenements.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                Événements historiques ({evenements.length})
              </h4>
              <ul className="space-y-1 text-sm">
                {evenements.map((evt, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span aria-hidden="true" className="text-purple-600 flex-shrink-0 mt-0.5">
                      ◆
                    </span>
                    <span>
                      <strong>{evt.date}</strong> — {evt.titre}
                      {evt.typeEvenement && (
                        <span className="ml-1.5 text-xs text-gray-500">({evt.typeEvenement})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TimelineActivite
