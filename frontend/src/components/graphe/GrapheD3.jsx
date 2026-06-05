/**
 * GrapheD3 — visualisation ego-network force-directed avec D3.js v7.
 *
 * Props :
 *   noeuds     : Array<{ id, nom, type: 'Personne'|'Organisation'|'SiteWeb', statut, niveauSaut }>
 *   aretes     : Array<{ id, sourceId, cibleId, typeLien, statut }>
 *   centreId   : string — id du nœud racine (niveauSaut === 0)
 *   onSelectionNoeud : (id: string) => void — callback au clic / Enter
 *
 * Ref (via forwardRef + useImperativeHandle) :
 *   .recentrer() — réinitialise le zoom/pan à la position d'origine
 *
 * Accessibilité AAA :
 *   - tabIndex={0} sur chaque nœud SVG, navigation clavier + Enter/Space
 *   - aria-label descriptif sur chaque nœud
 *   - <title> SVG dans chaque nœud (tooltip natif)
 *   - aria-describedby pointant vers une zone hors-écran décrivant le nœud focalisé
 *     (sans aria-live redondant — l'aria-describedby suffit à déclencher l'annonce SR)
 *   - prefers-reduced-motion : alphaDecay élevé → convergence instantanée
 *
 * CUD-safe :
 *   - Couleur + icône + forme distincte par type
 *   - Trait plein vs pointillé pour VALIDE vs EN_ATTENTE
 *   - Double codage : jamais couleur seule
 */
import { useEffect, useRef, useState, useId, forwardRef, useImperativeHandle } from 'react'
import * as d3 from 'd3'

/* ── Palette CUD-safe ── */
const STYLE_NOEUD = {
  Personne: { couleur: '#2563eb', icone: '●', rayon: 10 },
  Organisation: { couleur: '#f59e0b', icone: '■', rayon: 12 },
  SiteWeb: { couleur: '#7c3aed', icone: '◆', rayon: 10 },
  _defaut: { couleur: '#6b7280', icone: '?', rayon: 10 },
}

const COULEUR_ARETE_VALIDE = '#9ca3af'
const COULEUR_ARETE_ATTENTE = '#d1d5db'

/** Retourne alphaDecay élevé si l'utilisateur préfère moins de mouvement */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * GrapheD3 — utilise forwardRef pour exposer la méthode recentrer()
 * au composant parent (Graphe.jsx) sans couplage via le DOM.
 * Évite l'anti-pattern document.getElementById dans un effet D3.
 */
const GrapheD3 = forwardRef(function GrapheD3(
  { noeuds = [], aretes = [], centreId, onSelectionNoeud },
  ref,
) {
  const svgRef = useRef(null)
  const simulationRef = useRef(null)
  /* Référence stable sur la fonction zoom pour recentrer depuis l'extérieur */
  const zoomRef = useRef(null)
  const [noeudFocalise, setNoeudFocalise] = useState(null)
  const idDesc = useId()

  /* ── API exposée au parent via ref ── */
  useImperativeHandle(ref, () => ({
    /**
     * Réinitialise le zoom et le pan à la position d'origine.
     * Appelé depuis Graphe.jsx via grapheRef.current.recentrer().
     */
    recentrer() {
      if (!svgRef.current || !zoomRef.current) return
      const svg = d3.select(svgRef.current)
      svg.transition().duration(350).call(zoomRef.current.transform, d3.zoomIdentity)
    },
  }))

  /* ── Construction et mise à jour du graphe ── */
  useEffect(() => {
    if (!svgRef.current || noeuds.length === 0) return

    const conteneur = svgRef.current.parentElement
    const largeur = conteneur?.clientWidth || 800
    const hauteur = 600

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    svg
      .attr('viewBox', `0 0 ${largeur} ${hauteur}`)
      .attr('aria-label', `Graphe ego-network — ${noeuds.length} entités, ${aretes.length} liens`)
      .attr('role', 'img')

    /* Groupe principal (recevra le transform zoom) */
    const g = svg.append('g').attr('class', 'graphe-principal')

    /* ── Zoom et pan ── */
    const zoom = d3
      .zoom()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => g.attr('transform', event.transform))

    /* Stocker la référence zoom pour la méthode recentrer() */
    zoomRef.current = zoom

    svg.call(zoom)

    /* Marqueur de flèche pour les arêtes */
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'fleche')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', COULEUR_ARETE_VALIDE)
      .attr('d', 'M0,-5L10,0L0,5')

    /* ── Copie des données pour la simulation (D3 mute les objets) ── */
    const noeudsD3 = noeuds.map((n) => ({ ...n }))
    const aretesD3 = aretes.map((a) => ({
      ...a,
      /* D3 forceLink exige des champs source/target qui correspondent aux id des nœuds */
      source: a.sourceId,
      target: a.cibleId,
    }))

    /* ── Simulation force-directed ── */
    const reduced = prefersReducedMotion()

    const simulation = d3
      .forceSimulation(noeudsD3)
      .force(
        'link',
        d3.forceLink(aretesD3).id((d) => d.id).distance(130),
      )
      .force('charge', d3.forceManyBody().strength(-320))
      .force('center', d3.forceCenter(largeur / 2, hauteur / 2))
      .force('collision', d3.forceCollide().radius(30))
      /* Si prefers-reduced-motion → convergence immédiate (pas d'animation perçue) */
      .alphaDecay(reduced ? 0.9 : 0.028)

    simulationRef.current = simulation

    /* ── Arêtes ── */
    const groupeAretes = g.append('g').attr('class', 'aretes')

    const lignes = groupeAretes
      .selectAll('line')
      .data(aretesD3)
      .join('line')
      .attr('stroke', (d) =>
        d.statut === 'VALIDE' ? COULEUR_ARETE_VALIDE : COULEUR_ARETE_ATTENTE,
      )
      .attr('stroke-width', (d) => (d.statut === 'VALIDE' ? 2 : 1.5))
      .attr('stroke-dasharray', (d) => (d.statut === 'EN_ATTENTE' ? '6 3' : null))
      .attr('stroke-opacity', 0.7)
      .attr('marker-end', 'url(#fleche)')
      .attr('aria-hidden', 'true')

    /* ── Étiquettes des arêtes (type de lien) — facultatif, courts ── */
    const labelsAretes = g
      .append('g')
      .attr('class', 'labels-aretes')
      .selectAll('text')
      .data(aretesD3.filter((a) => a.typeLien?.code))
      .join('text')
      .attr('font-size', 9)
      .attr('fill', '#6b7280')
      .attr('text-anchor', 'middle')
      .attr('aria-hidden', 'true')
      .text((d) => d.typeLien?.libelle ?? d.typeLien?.code ?? '')

    /* ── Nœuds ── */
    const groupeNoeuds = g.append('g').attr('class', 'noeuds')

    const noeudsG = groupeNoeuds
      .selectAll('g.noeud')
      .data(noeudsD3)
      .join('g')
      .attr('class', 'noeud')
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (d) => {
        const style = STYLE_NOEUD[d.type] ?? STYLE_NOEUD._defaut
        return `${d.nom ?? d.id} — ${d.type ?? 'Entité'}${d.statut ? ` — ${d.statut}` : ''}${d.niveauSaut !== undefined ? ` — saut ${d.niveauSaut}` : ''} (${style.icone})`
      })
      .attr('aria-describedby', idDesc)

    /* Cercle de fond */
    noeudsG
      .append('circle')
      .attr('r', (d) => {
        const style = STYLE_NOEUD[d.type] ?? STYLE_NOEUD._defaut
        /* Le nœud racine est légèrement plus grand */
        return d.id === centreId ? style.rayon + 4 : style.rayon
      })
      .attr('fill', (d) => (STYLE_NOEUD[d.type] ?? STYLE_NOEUD._defaut).couleur)
      .attr('stroke', (d) => (d.id === centreId ? '#1a365d' : '#fff'))
      .attr('stroke-width', (d) => (d.id === centreId ? 3 : 2))
      /* Trait pointillé pour EN_ATTENTE */
      .attr('stroke-dasharray', (d) => (d.statut === 'EN_ATTENTE' ? '4 2' : null))

    /* Icône textuelle CUD — deuxième indicateur visuel */
    noeudsG
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 10)
      .attr('fill', '#fff')
      .attr('aria-hidden', 'true')
      .text((d) => (STYLE_NOEUD[d.type] ?? STYLE_NOEUD._defaut).icone)

    /* Tooltip SVG natif */
    noeudsG
      .append('title')
      .text((d) => {
        const lignes = [d.nom ?? d.id, d.type, d.statut].filter(Boolean)
        return lignes.join(' — ')
      })

    /* Étiquette textuelle sous le nœud */
    const labelsNoeuds = g
      .append('g')
      .attr('class', 'labels-noeuds')
      .selectAll('text')
      .data(noeudsD3)
      .join('text')
      .attr('font-size', 11)
      .attr('font-weight', (d) => (d.id === centreId ? 'bold' : 'normal'))
      .attr('fill', '#1a365d')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => {
        const style = STYLE_NOEUD[d.type] ?? STYLE_NOEUD._defaut
        const r = d.id === centreId ? style.rayon + 4 : style.rayon
        return r + 14
      })
      .attr('aria-hidden', 'true')
      .text((d) => {
        const nom = d.nom ?? d.id ?? ''
        return nom.length > 20 ? `${nom.slice(0, 18)}…` : nom
      })

    /* ── Drag souris ── */
    const drag = d3
      .drag()
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

    noeudsG.call(drag)

    /* ── Interactions ── */
    noeudsG
      .on('click', (event, d) => {
        onSelectionNoeud?.(d.id)
      })
      .on('keydown', (event, d) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelectionNoeud?.(d.id)
        } else if (event.key === 'Escape') {
          setNoeudFocalise(null)
        }
      })
      .on('focus', (event, d) => {
        setNoeudFocalise(d)
        /*
         * Anneau de focus conforme WCAG AA 1.4.11 : amber-700 #b45309 sur blanc.
         * Cohérent avec .focus-visible-ring dans index.css.
         */
        d3.select(event.currentTarget)
          .select('circle')
          .attr('stroke', '#b45309')
          .attr('stroke-width', 3)
      })
      .on('blur', (event, d) => {
        setNoeudFocalise(null)
        d3.select(event.currentTarget)
          .select('circle')
          .attr('stroke', d.id === centreId ? '#1a365d' : '#fff')
          .attr('stroke-width', d.id === centreId ? 3 : 2)
      })

    /* ── Tick de simulation ── */
    simulation.on('tick', () => {
      lignes
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      labelsAretes
        .attr('x', (d) => ((d.source.x ?? 0) + (d.target.x ?? 0)) / 2)
        .attr('y', (d) => ((d.source.y ?? 0) + (d.target.y ?? 0)) / 2)

      noeudsG.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
      labelsNoeuds.attr('x', (d) => d.x ?? 0).attr('y', (d) => d.y ?? 0)
    })

    return () => {
      simulation.stop()
    }
  }, [noeuds, aretes, centreId, idDesc, onSelectionNoeud])

  /* ── Description du nœud focalisé (zone hors-écran) ── */
  const descriptionFocus = noeudFocalise
    ? [
        noeudFocalise.nom ?? noeudFocalise.id,
        noeudFocalise.type,
        noeudFocalise.statut,
        noeudFocalise.niveauSaut !== undefined
          ? `saut ${noeudFocalise.niveauSaut} depuis l'entité centrale`
          : null,
      ]
        .filter(Boolean)
        .join(' — ')
    : "Aucun nœud sélectionné. Utilisez Tab pour naviguer entre les nœuds."

  return (
    <div className="relative w-full">
      {/*
       * Zone de description hors-écran pour aria-describedby.
       * Sans aria-live : l'annonce est déclenchée par aria-describedby
       * à chaque focus, ce qui évite la triple annonce SR (AAA4 fix).
       */}
      <div id={idDesc} className="sr-only">
        {descriptionFocus}
      </div>

      <svg
        ref={svgRef}
        className="w-full bg-gray-50 rounded-lg"
        style={{ height: '600px' }}
        focusable="false"
      />
    </div>
  )
})

export default GrapheD3
