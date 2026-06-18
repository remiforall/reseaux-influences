/**
 * Ressources — webographie OSINT : la « boîte à outils » du hub.
 *
 * Recense les sources/outils OSINT NON intégrés comme connecteurs, avec la
 * raison (liée aux ADR) et l'usage légitime. Concrétise le positionnement
 * « hub ultra-réglo qui ouvre des portes » : le graphe reste alimenté par des
 * API officielles, mais on documente honnêtement les autres univers.
 *
 * Accessibilité AAA : statuts CUD-safe (icône + texte + couleur), structure de
 * titres hiérarchisée, liens externes avec rel sécurisé, focus visible.
 */
import { STATUTS, CATEGORIES } from '../data/ressources-osint'

function BadgeStatut({ statut }) {
  const s = STATUTS[statut]
  if (!s) return null
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.classes}`}
      title={s.aide}
    >
      <span aria-hidden="true">{s.icone}</span>
      <span>{s.libelle}</span>
    </span>
  )
}

function Ressources() {
  return (
    <article className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-2">Webographie OSINT — boîte à outils</h1>
      <p className="text-gray-700 mb-4 leading-relaxed">
        Le graphe d'influence n'est alimenté que par des <strong>API et open data officiels</strong>{' '}
        (sources publiques vérifiables). Beaucoup d'autres ressources OSINT existent : utiles à un·e
        journaliste <strong>en lecture</strong>, mais incompatibles avec une ingestion automatisée
        pour des raisons juridiques, de crédibilité ou d'éthique. Cette page les recense
        honnêtement, avec la raison de leur exclusion et l'usage légitime.
      </p>
      <p className="text-gray-700 mb-6 leading-relaxed">
        <strong>Principe d'or</strong> : ces ressources servent à{' '}
        <em>remonter à la source primaire</em>. C'est cette source officielle qui entre dans le
        graphe — jamais le tweet, le blog ou la base divulguée. Toute citation manuelle reste
        soumise au consensus communautaire.
      </p>

      {/* Légende des statuts */}
      <section aria-labelledby="legende-statuts" className="mb-8">
        <h2 id="legende-statuts" className="sr-only">
          Légende des statuts
        </h2>
        <ul className="flex flex-wrap gap-3" role="list">
          {Object.entries(STATUTS).map(([cle, s]) => (
            <li key={cle} className="flex items-center gap-2 text-sm text-gray-600">
              <BadgeStatut statut={cle} />
              <span>{s.aide}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-8">
        {CATEGORIES.map((cat, i) => (
          <section
            key={i}
            aria-labelledby={`cat-${i}`}
            className="border border-gray-200 rounded-lg p-5"
          >
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 id={`cat-${i}`} className="text-xl font-semibold text-primary">
                {cat.titre}
              </h2>
              <BadgeStatut statut={cat.statut} />
              {cat.adr && (
                <span
                  className="text-xs font-mono text-gray-400"
                  title="Décision d'architecture liée"
                >
                  {cat.adr}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">{cat.raison}</p>

            <ul className="space-y-3" role="list">
              {cat.outils.map((o, j) => (
                <li key={j} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    {o.url ? (
                      <a
                        href={o.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="font-medium text-secondary underline hover:text-primary focus-visible-ring rounded"
                      >
                        {o.nom}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    ) : (
                      <span className="font-medium text-gray-800">{o.nom}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{o.desc}</p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Usage :</span> {o.usage}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="text-sm text-gray-500 mt-8">
        Cette webographie est évolutive. Une ressource peut passer de « sous condition » à « intégré
        » après autorisation légale ou évaluation technique (ex. un connecteur Wayback Machine). À
        l'inverse, rien d'exclu ne sera intégré sans ADR d'exception explicite.
      </p>
    </article>
  )
}

export default Ressources
