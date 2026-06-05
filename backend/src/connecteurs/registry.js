/**
 * @module registry
 * Registry des connecteurs OSINT actifs.
 *
 * Lit `ENRICHISSEMENT_CONNECTEURS_ACTIFS` (CSV) depuis le `.env`.
 * Pour chaque nom, charge dynamiquement `./sources/<nom>.js`.
 *
 * Pappers : skippé proprement si `PAPPERS_API_KEY` est absente (log info).
 * Connecteur inconnu ou en erreur d'import : log warn, pas de crash.
 *
 * Utilisation :
 *   const registry = await chargerConnecteurs();
 *   const wikidata = registry.get('wikidata');
 */

const DEFAUT_CONNECTEURS =
  'wikidata,rdap,recherche-entreprises,ign-ban,ign-dvf,ign-carto-cadastre,ign-carto-gpu,ign-geoplateforme,' +
  'hatvp,transparence-sante,bodacc,parlementaires,dataesr,' +
  'icij-offshore-leaks,open-sanctions,anticor,cour-des-comptes,wikileaks,ddosecrets,' +
  'associations,annuaire-sante'

/** @type {Map<string, import('./base.js').BaseConnecteur>|null} */
let registryInstancie = null

/**
 * Charge et instancie les connecteurs actifs.
 *
 * L'appel est idempotent : un second appel retourne le même Map sans
 * réimporter les modules. Utiliser `reinitialiserRegistry()` pour forcer
 * un rechargement (tests uniquement).
 *
 * @returns {Promise<Map<string, import('./base.js').BaseConnecteur>>}
 */
export async function chargerConnecteurs() {
  if (registryInstancie !== null) return registryInstancie

  const csv = process.env.ENRICHISSEMENT_CONNECTEURS_ACTIFS?.trim() || DEFAUT_CONNECTEURS

  const noms = csv
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean)

  const registry = new Map()

  for (const nom of noms) {
    // Garde-fou Pappers : désactivé si clé API absente
    if (nom === 'pappers') {
      if (!process.env.PAPPERS_API_KEY) {
        console.info('[registry] Connecteur "pappers" ignoré — PAPPERS_API_KEY non définie.')
        continue
      }
    }

    try {
      const module = await import(`./sources/${nom}.js`)
      const ConnecteurClasse = module.default ?? Object.values(module)[0]

      if (typeof ConnecteurClasse !== 'function') {
        console.warn(
          `[registry] Le module "sources/${nom}.js" n'exporte pas de classe. Connecteur ignoré.`,
        )
        continue
      }

      registry.set(nom, new ConnecteurClasse())
    } catch (err) {
      console.warn(`[registry] Échec du chargement du connecteur "${nom}" : ${err.message}`)
    }
  }

  registryInstancie = registry
  return registry
}

/**
 * Retourne un connecteur par son nom.
 * Lance `chargerConnecteurs()` si le registry n'est pas encore initialisé.
 *
 * @param {string} nom
 * @returns {Promise<import('./base.js').BaseConnecteur|undefined>}
 */
export async function obtenirConnecteur(nom) {
  const registry = await chargerConnecteurs()
  return registry.get(nom)
}

/**
 * Retourne la liste des noms de connecteurs chargés.
 *
 * @returns {Promise<string[]>}
 */
export async function listerConnecteurs() {
  const registry = await chargerConnecteurs()
  return [...registry.keys()]
}

/**
 * Réinitialise le registry (tests uniquement).
 * Le prochain appel à `chargerConnecteurs()` recharge depuis le `.env`.
 */
export function reinitialiserRegistry() {
  registryInstancie = null
}
