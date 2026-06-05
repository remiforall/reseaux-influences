/**
 * @module normaliseur
 * Schéma interne commun pour la représentation normalisée des entités
 * enrichies par les connecteurs OSINT.
 *
 * Invariant : TOUT champ récupéré par un connecteur doit passer par
 * `marquerProvenance`. Ne jamais stocker une valeur brute sans provenance.
 */

/**
 * Crée un objet de provenance pour une valeur.
 *
 * @param {*} valeur - La valeur récupérée depuis la source
 * @param {{ source: string, url?: string, date?: string }} provenance
 *   - source : libellé de la source (ex: 'Wikidata', 'RDAP', 'BAN')
 *   - url    : URL de la ressource consultée (optionnel)
 *   - date   : date ISO de récupération (défaut = now)
 * @returns {{ valeur: *, source: string, url: string|null, date: string }}
 */
export function marquerProvenance(valeur, { source, url = null, date = null }) {
  return {
    valeur,
    source,
    url,
    date: date ?? new Date().toISOString(),
  }
}

/**
 * Crée une entité normalisée prête à être retournée par un connecteur.
 *
 * Chaque champ de `champs` doit être le résultat de `marquerProvenance`.
 * Les `liensSuggeres` sont des relations détectées automatiquement (non
 * validées) entre l'entité courante et d'autres entités.
 *
 * @param {'Personne'|'Organisation'|'SiteWeb'|'Adresse'|'TransactionFonciere'|'Parcelle'|'ZoneUrbanisme'} type
 * @param {{ [nomChamp]: { valeur: *, source: string, url: string|null, date: string } }} champs
 * @param {Array<{
 *   vers: { type: string, identifiantExterne: string },
 *   typeLienCode: string,
 *   source: string,
 *   url?: string,
 *   date?: string
 * }>} liensSuggeres
 * @returns {{ type: string, champs: object, liensSuggeres: Array }}
 */
export function creerEntiteNormalisee(type, champs, liensSuggeres = []) {
  return {
    type,
    champs,
    liensSuggeres,
  }
}

/**
 * Types d'entités valides dans le système de normalisation.
 * @type {string[]}
 */
export const TYPES_ENTITES_VALIDES = [
  'Personne',
  'Organisation',
  'SiteWeb',
  'Adresse',
  'TransactionFonciere',
  'Parcelle',
  'ZoneUrbanisme',
]
