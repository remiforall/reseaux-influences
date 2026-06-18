/**
 * PreviewEntite — carte de résultat OSINT pour une entité candidate.
 *
 * Structure d'une PreviewEntite (format backend) :
 * {
 *   typeSuggere: 'Personne'|'Organisation'|'SiteWeb',
 *   candidatsParChamp: {
 *     [nomChamp]: [{ valeur, source, url, date }, ...]
 *   },
 *   liensSuggeres: [{ vers, typeLienCode, source, url, date }, ...],
 *   identifiantsExternes: { wikidataId?, siren?, domaine? },
 * }
 *
 * L'utilisateur sélectionne, pour chaque champ, la source qu'il retient,
 * et coche les liens à importer. Ces sélections remontent vers le parent
 * via `onChoixChange`.
 *
 * @param {{
 *   preview: object,
 *   index: number,
 *   choix: { champsRetenus: object, liensRetenus: number[], typeEntite: string },
 *   onChoixChange: (choix: object) => void,
 *   onImporter: () => void,
 * }} props
 */
import { useState, useEffect } from 'react'
import BadgeProvenance from './BadgeProvenance'

/** Libellé lisible du type de lien */
const libelleTypeLien = (code) => {
  const MAP = {
    DIRIGEANT: 'Dirigeant·e de',
    BENEFICIAIRE_EFFECTIF: 'Bénéficiaire effectif·ve de',
    MANDAT_ELECTIF: 'Mandat électif',
    EMPLOI: 'Emploi salarié',
    AFFILIATION_PARTI: 'Affiliation à un parti',
    CONJOINT: 'Conjoint·e',
    FONDATEUR: 'Fondateur·rice de',
    EDITEUR_DE: 'Éditeur·rice de',
    PRODUCTEUR_DE: 'Producteur·rice de',
    TITULAIRE_DOMAINE: 'Titulaire du domaine',
    HEBERGE_PAR: 'Hébergé·e par',
  }
  return MAP[code] ?? code
}

function PreviewEntite({ preview, index, choix, onChoixChange, onImporter }) {
  const [ouvert, setOuvert] = useState(false)

  const candidatsParChamp = preview.candidatsParChamp ?? {}
  const liensSuggeres = preview.liensSuggeres ?? []
  const identifiants = preview.identifiantsExternes ?? {}

  /**
   * Pré-sélection automatique des candidats uniques (UX fix).
   * Si un champ n'a qu'un seul candidat, il est retenu d'office
   * pour éviter de forcer l'utilisateur à sélectionner manuellement
   * une option qui n'en est pas une (minimum de clics).
   * S'exécute une seule fois au montage du composant.
   */
  useEffect(() => {
    const preselectionsAutomatiques = {}
    Object.entries(candidatsParChamp).forEach(([nomChamp, candidats]) => {
      if (candidats.length === 1 && !choix.champsRetenus?.[nomChamp]) {
        preselectionsAutomatiques[nomChamp] = candidats[0]
      }
    })
    if (Object.keys(preselectionsAutomatiques).length > 0) {
      onChoixChange({
        ...choix,
        champsRetenus: {
          ...preselectionsAutomatiques,
          ...(choix.champsRetenus ?? {}),
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Sélectionne un candidat comme valeur retenue pour un champ */
  const selectionnerCandidat = (nomChamp, candidat) => {
    onChoixChange({
      ...choix,
      champsRetenus: {
        ...(choix.champsRetenus ?? {}),
        [nomChamp]: candidat,
      },
    })
  }

  /** Bascule l'inclusion d'un lien suggéré dans l'import */
  const toggleLien = (idx) => {
    const liensActuels = choix.liensRetenus ?? []
    const nouveaux = liensActuels.includes(idx)
      ? liensActuels.filter((i) => i !== idx)
      : [...liensActuels, idx]
    onChoixChange({ ...choix, liensRetenus: nouveaux })
  }

  /**
   * Nom d'affichage principal : premier candidat du champ `nom` ou `domaine`,
   * ou fallback sur l'identifiant externe.
   */
  const nomPrincipal =
    candidatsParChamp.nom?.[0]?.valeur ??
    candidatsParChamp.domaine?.[0]?.valeur ??
    identifiants.wikidataId ??
    identifiants.siren ??
    identifiants.domaine ??
    `Entité ${index + 1}`

  return (
    <article
      className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
      aria-label={`Résultat ${index + 1} : ${nomPrincipal}`}
      tabIndex={-1}
    >
      {/* ── En-tête ── */}
      <div className="flex items-start justify-between p-4 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Badge type CUD-safe : icône + texte + couleur */}
            <TypeBadge type={preview.typeSuggere} />
            <h3 className="text-base font-bold text-gray-900 truncate">{nomPrincipal}</h3>
          </div>
          {/* Identifiants externes */}
          {Object.entries(identifiants).filter(([, v]) => v).length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {Object.entries(identifiants)
                .filter(([, v]) => v)
                .map(([k, v]) => `${k} : ${v}`)
                .join(' · ')}
            </p>
          )}
        </div>

        {/* Bouton déplier/replier */}
        <button
          type="button"
          aria-expanded={ouvert}
          aria-controls={`preview-detail-${index}`}
          onClick={() => setOuvert((v) => !v)}
          className="flex-shrink-0 text-sm text-secondary underline focus-visible-ring rounded min-h-[44px] px-3"
        >
          {ouvert ? 'Réduire' : 'Voir les détails'}
        </button>
      </div>

      {/* ── Détails dépliables ── */}
      {ouvert && (
        <div id={`preview-detail-${index}`} className="border-t border-gray-100 p-4 space-y-5">
          {/* Champs avec candidats par source */}
          {Object.entries(candidatsParChamp).length > 0 && (
            <section aria-labelledby={`champs-titre-${index}`}>
              <h4
                id={`champs-titre-${index}`}
                className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3"
              >
                Champs proposés — sélectionnez la source à retenir
              </h4>
              <dl className="space-y-3">
                {Object.entries(candidatsParChamp).map(([nomChamp, candidats]) => (
                  <div key={nomChamp} className="space-y-1">
                    <dt className="text-xs font-medium text-gray-600 capitalize">
                      {nomChamp.replace(/_/g, ' ')}
                    </dt>
                    <dd className="space-y-1">
                      {candidats.map((candidat, ci) => {
                        const estSelectionne =
                          choix.champsRetenus?.[nomChamp]?.source === candidat.source &&
                          choix.champsRetenus?.[nomChamp]?.valeur === candidat.valeur
                        return (
                          <label
                            key={ci}
                            className="flex items-center gap-2 cursor-pointer min-h-[44px] group"
                          >
                            <input
                              type="radio"
                              name={`champ-${index}-${nomChamp}`}
                              checked={estSelectionne}
                              onChange={() => selectionnerCandidat(nomChamp, candidat)}
                              className="w-4 h-4 border-gray-400 text-secondary focus-visible-ring"
                            />
                            <span className="text-sm text-gray-800 flex-1">
                              {String(candidat.valeur ?? '')}
                            </span>
                            <BadgeProvenance
                              source={candidat.source}
                              url={candidat.url}
                              date={candidat.date}
                            />
                          </label>
                        )
                      })}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Liens suggérés */}
          {liensSuggeres.length > 0 && (
            <section aria-labelledby={`liens-titre-${index}`}>
              <h4
                id={`liens-titre-${index}`}
                className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3"
              >
                Liens suggérés — cochez ceux à importer
              </h4>
              <ul className="space-y-2">
                {liensSuggeres.map((lien, li) => {
                  const estRetenu = (choix.liensRetenus ?? []).includes(li)
                  return (
                    <li key={li}>
                      <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
                        <input
                          type="checkbox"
                          checked={estRetenu}
                          onChange={() => toggleLien(li)}
                          aria-label={`Retenir le lien : ${libelleTypeLien(lien.typeLienCode)} vers ${lien.vers?.details?.nom ?? lien.vers?.identifiantExterne ?? lien.vers?.type ?? 'entité'}`}
                          className="w-4 h-4 rounded border-gray-400 text-secondary focus-visible-ring"
                        />
                        <span className="text-sm text-gray-800 flex-1">
                          <span className="font-medium">
                            {libelleTypeLien(lien.typeLienCode)}
                            {lien.roleRelation ? ` (${lien.roleRelation})` : ''}
                          </span>
                          {' → '}
                          <span className="italic">
                            {lien.vers?.details?.nom ??
                              lien.vers?.identifiantExterne ??
                              lien.vers?.type ??
                              'entité inconnue'}
                          </span>
                        </span>
                        <BadgeProvenance source={lien.source} url={lien.url} date={lien.date} />
                      </label>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* Bouton "Importer cette entité" */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onImporter}
              className="inline-flex items-center gap-2 px-5 py-2 rounded text-sm font-semibold text-white bg-secondary hover:bg-primary focus-visible-ring min-h-[44px] transition-colors"
            >
              <span aria-hidden="true">↑</span>
              Importer cette entité
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

/**
 * TypeBadge — badge de type d'entité CUD-safe.
 * Trois redondances : icône + texte + couleur de fond.
 * Utilisée dans le JSX de PreviewEntite.
 */
// eslint-disable-next-line no-unused-vars
function TypeBadge({ type }) {
  const CONFIG = {
    Personne: { icone: '●', classes: 'bg-blue-100 text-blue-800', libelle: 'Personne' },
    Organisation: { icone: '■', classes: 'bg-amber-100 text-amber-800', libelle: 'Organisation' },
    SiteWeb: { icone: '◆', classes: 'bg-purple-100 text-purple-800', libelle: 'Site web' },
  }
  const cfg = CONFIG[type] ?? {
    icone: '?',
    classes: 'bg-gray-100 text-gray-700',
    libelle: type ?? 'Inconnu',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.classes}`}
    >
      <span aria-hidden="true">{cfg.icone}</span>
      <span>{cfg.libelle}</span>
    </span>
  )
}

export default PreviewEntite
