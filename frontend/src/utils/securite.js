/**
 * Utilitaires de sécurité front — défense XSS sur les données de sources externes.
 *
 * Le corpus est enrichi depuis des sources publiques (Wikidata, RDAP, RNA…) dont
 * les libellés et URLs ne sont PAS de confiance : un libellé Wikidata peut contenir
 * `<script>`, une URL peut être `javascript:alert(1)`. Tout rendu de donnée serveur
 * dans du HTML (Leaflet bindPopup, attribut href) doit passer par ces garde-fous.
 */

/** Schémas d'URL autorisés pour un lien externe rendu dans un `href`. */
const SCHEMAS_AUTORISES = new Set(['http:', 'https:'])

/**
 * Échappe les caractères HTML sensibles avant interpolation dans une chaîne HTML
 * (Leaflet `bindPopup` / `bindTooltip` / `divIcon({ html })` n'échappent rien).
 *
 * @param {unknown} valeur
 * @returns {string}
 */
export function echapperHtml(valeur) {
  return String(valeur ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Renvoie l'URL si et seulement si son schéma est http(s), sinon `null`.
 * Bloque `javascript:`, `data:`, `vbscript:`, `file:`… avant tout rendu en `href`.
 *
 * @param {unknown} url
 * @returns {string | null}
 */
export function urlExterneSure(url) {
  if (typeof url !== 'string' || url.trim() === '') return null
  try {
    const analysee = new URL(url, window.location.origin)
    return SCHEMAS_AUTORISES.has(analysee.protocol) ? url : null
  } catch {
    return null
  }
}
