function BadgeDisplay({ badges }) {
  if (!badges || badges.length === 0) {
    return <p className="text-gray-500 text-sm">Aucun badge obtenu pour le moment.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map(({ badge, attribue_le }) => (
        <div
          key={badge.code}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
          style={{ borderColor: badge.couleur, color: badge.couleur }}
          title={badge.description}
        >
          <span className="mr-1">{badge.nom}</span>
        </div>
      ))}
    </div>
  )
}

export default BadgeDisplay
