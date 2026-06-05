/**
 * @module services/enrichissement
 * Orchestration multi-connecteurs pour la recherche OSINT.
 *
 * Principe : appelle en parallèle tous les connecteurs sélectionnés via
 * `Promise.allSettled` (pas de fail-fast). Consolide les résultats en une
 * liste de `PreviewEntite` dédoublonnée par identifiant externe connu
 * (wikidataId, siren, domaine, idu).
 *
 * Format de sortie :
 *   {
 *     resultats: PreviewEntite[],
 *     statutParConnecteur: Record<string, 'ok'|'erreur'|'timeout'>,
 *     dureeMs: number
 *   }
 *
 * PreviewEntite :
 *   {
 *     typeSuggere: string,
 *     candidatsParChamp: Record<string, { valeur, source, url, date }[]>,
 *     liensSuggeres: LienSuggere[],
 *     identifiantsExternes: { wikidataId?, siren?, domaine?, idu? }
 *   }
 */

import { chargerConnecteurs } from '../connecteurs/registry.js'

/** @type {Map<string, import('../connecteurs/base.js').BaseConnecteur>|null} */
let registrySingleton = null

/**
 * Retourne le registry en singleton (chargé une fois par démarrage).
 * @returns {Promise<Map<string, import('../connecteurs/base.js').BaseConnecteur>>}
 */
async function obtenirRegistry() {
  if (registrySingleton !== null) return registrySingleton
  registrySingleton = await chargerConnecteurs()
  return registrySingleton
}

/**
 * Réinitialise le singleton (tests uniquement).
 */
export function reinitialiserRegistrySingleton() {
  registrySingleton = null
}

/**
 * Dédoublonne les résultats normalisés par identifiant externe.
 *
 * Deux entités sont considérées identiques si elles partagent le même
 * wikidataId, siren, domaine ou idu (parcelle). Quand un doublon est détecté,
 * les champs sont fusionnés : les candidats de chaque source sont conservés
 * (liste multi-source), pas de merge silencieux.
 *
 * @param {import('../connecteurs/normaliseur.js').EntiteNormalisee[]} entites
 * @returns {PreviewEntite[]}
 */
function consoliderResultats(entites) {
  /** @type {Map<string, PreviewEntite>} */
  const index = new Map()

  for (const entite of entites) {
    const { type: typeSuggere, champs, liensSuggeres = [] } = entite

    // Extraire les identifiants externes connus
    const wikidataId = champs.wikidataId?.valeur ?? null
    const siren = champs.siren?.valeur ?? null
    const domaine = champs.domaine?.valeur ?? null
    const idu = champs.idu?.valeur ?? null

    // Construire une clé de déduplication
    const cleDedup =
      (wikidataId ? `wikidata:${wikidataId}` : null) ??
      (siren ? `siren:${siren}` : null) ??
      (domaine ? `domaine:${domaine}` : null) ??
      (idu ? `idu:${idu}` : null) ??
      `type:${typeSuggere}:${JSON.stringify(Object.keys(champs).sort())}`

    if (index.has(cleDedup)) {
      // Doublon détecté : fusionner les candidatsParChamp
      const existant = index.get(cleDedup)

      for (const [nomChamp, valeurAvecProvenance] of Object.entries(champs)) {
        if (!existant.candidatsParChamp[nomChamp]) {
          existant.candidatsParChamp[nomChamp] = []
        }
        // Vérifier que cette source n'est pas déjà présente pour ce champ
        const dejaPresente = existant.candidatsParChamp[nomChamp].some(
          (c) =>
            c.source === valeurAvecProvenance.source && c.valeur === valeurAvecProvenance.valeur,
        )
        if (!dejaPresente) {
          existant.candidatsParChamp[nomChamp].push(valeurAvecProvenance)
        }
      }

      // Fusionner les liens suggérés (dédoublonnage par typeLienCode + identifiantExterne)
      for (const lien of liensSuggeres) {
        const lienDejaPresent = existant.liensSuggeres.some(
          (l) =>
            l.typeLienCode === lien.typeLienCode &&
            l.vers.identifiantExterne === lien.vers.identifiantExterne,
        )
        if (!lienDejaPresent) {
          existant.liensSuggeres.push(lien)
        }
      }
    } else {
      // Nouvelle entité : transformer champs → candidatsParChamp (liste de candidats)
      /** @type {Record<string, { valeur: *, source: string, url: string|null, date: string }[]>} */
      const candidatsParChamp = {}

      for (const [nomChamp, valeurAvecProvenance] of Object.entries(champs)) {
        candidatsParChamp[nomChamp] = [valeurAvecProvenance]
      }

      /** @type {PreviewEntite} */
      const preview = {
        typeSuggere,
        candidatsParChamp,
        liensSuggeres: [...liensSuggeres],
        identifiantsExternes: {
          ...(wikidataId ? { wikidataId } : {}),
          ...(siren ? { siren } : {}),
          ...(domaine ? { domaine } : {}),
          ...(idu ? { idu } : {}),
        },
      }

      index.set(cleDedup, preview)
    }
  }

  return [...index.values()]
}

/**
 * Recherche multi-connecteurs en parallèle.
 *
 * @param {{
 *   query: string,
 *   types: ('personne'|'organisation'|'site')[],
 *   connecteurs?: string[],
 *   options?: Record<string, unknown>
 * }} params
 * @returns {Promise<{
 *   resultats: PreviewEntite[],
 *   statutParConnecteur: Record<string, 'ok'|'erreur'|'timeout'>,
 *   dureeMs: number
 * }>}
 */
export async function rechercherMultiConnecteurs({ query, types, connecteurs, options = {} }) {
  const debut = Date.now()
  const registry = await obtenirRegistry()

  // Sélectionner les connecteurs : intersection avec les actifs
  const nomsCibles = connecteurs ? connecteurs.filter((n) => registry.has(n)) : [...registry.keys()]

  if (nomsCibles.length === 0) {
    return {
      resultats: [],
      statutParConnecteur: {},
      dureeMs: Date.now() - debut,
    }
  }

  // Lancer tous les connecteurs en parallèle (pas de fail-fast)
  const promesses = nomsCibles.map(async (nom) => {
    const connecteur = registry.get(nom)
    return {
      nom,
      resultat: await connecteur.rechercher(query, { types, ...options }),
    }
  })

  const settlements = await Promise.allSettled(promesses)

  /** @type {Record<string, 'ok'|'erreur'|'timeout'>} */
  const statutParConnecteur = {}
  /** @type {import('../connecteurs/normaliseur.js').EntiteNormalisee[]} */
  const toutesEntites = []

  for (const settlement of settlements) {
    if (settlement.status === 'fulfilled') {
      const { nom, resultat } = settlement.value
      statutParConnecteur[nom] = 'ok'
      if (Array.isArray(resultat?.resultats)) {
        toutesEntites.push(...resultat.resultats)
      }
    } else {
      // Distinguer timeout des autres erreurs
      const err = settlement.reason
      // Le nom est extrait de l'erreur si disponible, sinon on utilise l'index
      const nomConnecteur = err?.connecteurNom ?? nomsCibles[settlements.indexOf(settlement)]
      const estTimeout =
        err?.name === 'AbortError' ||
        err?.message?.toLowerCase().includes('timeout') ||
        err?.message?.toLowerCase().includes('aborted')
      statutParConnecteur[nomConnecteur] = estTimeout ? 'timeout' : 'erreur'
    }
  }

  const resultats = consoliderResultats(toutesEntites)

  return {
    resultats,
    statutParConnecteur,
    dureeMs: Date.now() - debut,
  }
}
