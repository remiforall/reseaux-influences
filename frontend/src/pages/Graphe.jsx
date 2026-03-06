import { useEffect, useRef, useState } from 'react'
import { getGraphe } from '../api/client'

function Graphe() {
  const svgRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadGraphe = async () => {
      try {
        const { data } = await getGraphe()
        renderGraphe(data)
      } catch (err) {
        setError('Impossible de charger le graphe.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const renderGraphe = async (data) => {
      const d3 = await import('d3')
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()

      const width = svgRef.current.clientWidth
      const height = 600

      svg.attr('viewBox', `0 0 ${width} ${height}`)

      const g = svg.append('g')

      // Zoom
      const zoom = d3.zoom().scaleExtent([0.1, 4]).on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
      svg.call(zoom)

      const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id(d => d.id).distance(120))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))

      const link = g.append('g')
        .selectAll('line')
        .data(data.links)
        .join('line')
        .attr('stroke', d => d.type_couleur || '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => Math.max(1, d.intensite))

      const node = g.append('g')
        .selectAll('circle')
        .data(data.nodes)
        .join('circle')
        .attr('r', 8)
        .attr('fill', '#1a365d')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .call(d3.drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
        )

      const label = g.append('g')
        .selectAll('text')
        .data(data.nodes)
        .join('text')
        .text(d => d.nom_complet)
        .attr('font-size', 10)
        .attr('dx', 12)
        .attr('dy', 4)
        .attr('fill', '#374151')

      // Tooltip
      node.append('title').text(d => d.nom_complet)

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
        node.attr('cx', d => d.x).attr('cy', d => d.y)
        label.attr('x', d => d.x).attr('y', d => d.y)
      })
    }

    loadGraphe()
  }, [])

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Graphe des réseaux d'influence</h1>
      {loading && <p className="text-gray-500">Chargement du graphe...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <svg ref={svgRef} className="w-full" style={{ height: '600px' }} />
      </div>
    </div>
  )
}

export default Graphe
