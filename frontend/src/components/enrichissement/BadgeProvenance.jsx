/**
 * BadgeProvenance — badge d'attribution de source pour un champ enrichi.
 *
 * Affiche : source + date de récupération + lien externe.
 * La couleur n'est JAMAIS le seul indicateur (règle CUD-safe) : une icône
 * textuelle et un libellé texte accompagnent toujours la teinte.
 *
 * Palette CUD-safe par source :
 *   - wikidata  : bleu  #2563eb  →  icône W
 *   - pappers   : orange #f59e0b →  icône P
 *   - rdap      : violet #7c3aed →  icône R
 *   - ign-*     : vert  #16a34a  →  icône I
 *   - défaut    : gris  #6b7280  →  icône ?
 *
 * @param {{
 *   source: string,
 *   url?: string,
 *   date?: string,
 *   className?: string,
 * }} props
 */
function BadgeProvenance({ source, url, date, className = '' }) {
  /** Calcule palette + icône selon la source déclarée */
  const getStyle = (src) => {
    const s = (src ?? '').toLowerCase()
    if (s.includes('wikidata')) return { bg: 'bg-blue-100', text: 'text-blue-800', icone: 'W', label: 'Wikidata' }
    if (s.includes('pappers') || s.includes('rne') || s.includes('sirene'))
      return { bg: 'bg-amber-100', text: 'text-amber-800', icone: 'P', label: 'Pappers/RNE' }
    if (s.includes('rdap') || s.includes('dns'))
      return { bg: 'bg-purple-100', text: 'text-purple-800', icone: 'R', label: 'RDAP' }
    if (s.includes('ign') || s.includes('ban') || s.includes('dvf') || s.includes('cadastre'))
      return { bg: 'bg-green-100', text: 'text-green-800', icone: 'I', label: 'IGN' }
    return { bg: 'bg-gray-100', text: 'text-gray-700', icone: '?', label: src ?? 'Source inconnue' }
  }

  const style = getStyle(source)

  /**
   * Format lisible de la date ISO si disponible.
   * On utilise `<time datetime="">` pour la sémantique machine.
   */
  const dateIso = date ?? null
  const dateAffichee = dateIso
    ? new Date(dateIso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  const ariaLabel = [
    `Source : ${style.label}`,
    dateAffichee ? `consultée le ${dateAffichee}` : null,
    url ? `URL : ${url}` : null,
  ]
    .filter(Boolean)
    .join(', ')

  const badge = (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text} ${className}`}
      aria-label={ariaLabel}
      title={url ?? style.label}
    >
      {/* Icône textuelle — premier indicateur CUD */}
      <span aria-hidden="true" className="font-bold">
        [{style.icone}]
      </span>
      {/* Libellé texte — deuxième indicateur */}
      <span>{style.label}</span>
      {/* Date — troisième indicateur si disponible */}
      {dateAffichee && (
        <>
          <span aria-hidden="true"> · </span>
          <time dateTime={dateIso}>{dateAffichee}</time>
        </>
      )}
    </span>
  )

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-visible-ring rounded"
        aria-label={`${ariaLabel} — ouvrir la source dans un nouvel onglet`}
        tabIndex={0}
      >
        {badge}
      </a>
    )
  }

  return badge
}

export default BadgeProvenance
