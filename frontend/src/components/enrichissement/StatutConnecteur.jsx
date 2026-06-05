/**
 * StatutConnecteur — indicateur visuel du statut d'un connecteur OSINT.
 *
 * La couleur n'est JAMAIS le seul indicateur (règle CUD-safe) :
 * chaque statut a une icône textuelle + un libellé + une couleur distincte.
 *
 * Statuts reconnus : 'chargement' | 'ok' | 'erreur' | 'timeout' | 'aucune_donnee'
 *
 * @param {{
 *   nom: string,
 *   statut: 'chargement'|'ok'|'erreur'|'timeout'|'aucune_donnee'|null,
 * }} props
 */
function StatutConnecteur({ nom, statut }) {
  const CONFIG = {
    chargement: {
      icone: '⏳',
      libelle: 'Recherche en cours',
      classes: 'bg-gray-100 text-gray-700',
    },
    ok: {
      icone: '✓',
      libelle: 'Résultats trouvés',
      classes: 'bg-green-100 text-green-800',
    },
    erreur: {
      icone: '⚠',
      libelle: 'Erreur',
      classes: 'bg-red-100 text-red-800',
    },
    timeout: {
      icone: '⏱',
      libelle: 'Délai dépassé',
      classes: 'bg-orange-100 text-orange-800',
    },
    aucune_donnee: {
      icone: '○',
      libelle: 'Aucun résultat',
      classes: 'bg-gray-50 text-gray-500',
    },
  }

  const cfg = CONFIG[statut ?? 'chargement'] ?? CONFIG['erreur']

  return (
    <li
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.classes}`}
      aria-label={`Connecteur ${nom} : ${cfg.libelle}`}
    >
      {/* Icône textuelle — premier indicateur CUD */}
      <span aria-hidden="true">{cfg.icone}</span>
      {/* Libellé source */}
      <span className="font-semibold">{nom}</span>
      {/* Libellé statut — deuxième indicateur */}
      <span aria-hidden="true">—</span>
      <span>{cfg.libelle}</span>
    </li>
  )
}

export default StatutConnecteur
