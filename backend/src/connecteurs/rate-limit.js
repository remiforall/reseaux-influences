/**
 * @module rate-limit
 * Token bucket en mémoire pour limiter le débit des appels aux APIs externes.
 *
 * Pas de `setInterval` : la recharge est calculée à la demande via
 * `process.hrtime.bigint()` pour ne pas bloquer le processus lors des
 * tests Jest (`--watch`, `--forceExit`).
 *
 * Un bucket est créé par connecteur. Les buckets persistent tant que le
 * process Node tourne (module-level singleton).
 */

/** @type {Map<string, { tokens: number, capacite: number, debit: number, dernierAppelNs: bigint }>} */
const buckets = new Map();

/**
 * Crée ou réinitialise un bucket de rate-limit pour un connecteur donné.
 *
 * @param {string} nom - Identifiant unique du connecteur (ex: 'wikidata')
 * @param {{ debit: number, capacite: number }} config
 *   - debit    : nombre de tokens rechargés par seconde
 *   - capacite : nombre maximum de tokens (taille de la rafale autorisée)
 */
export function creerBucket(nom, { debit, capacite }) {
  buckets.set(nom, {
    tokens: capacite,
    capacite,
    debit,
    dernierAppelNs: process.hrtime.bigint(),
  });
}

/**
 * Consomme un token du bucket. Attend si aucun token n'est disponible.
 *
 * Le délai d'attente est calculé précisément : temps pour qu'un token
 * se recharge, en fonction du débit configuré.
 *
 * @param {string} nom - Identifiant du connecteur
 * @returns {Promise<void>}
 * @throws {Error} Si le bucket n'a pas été créé préalablement
 */
export async function consommer(nom) {
  const bucket = buckets.get(nom);
  if (!bucket) {
    throw new Error(`[rate-limit] Bucket non initialisé pour le connecteur "${nom}"`);
  }

  // Recharge basée sur le temps écoulé depuis le dernier appel
  const maintenant = process.hrtime.bigint();
  const ecouleSec = Number(maintenant - bucket.dernierAppelNs) / 1e9;
  bucket.tokens = Math.min(bucket.capacite, bucket.tokens + ecouleSec * bucket.debit);
  bucket.dernierAppelNs = maintenant;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return;
  }

  // Calcul du délai pour obtenir exactement 1 token
  const msAttente = Math.ceil(((1 - bucket.tokens) / bucket.debit) * 1000);
  await new Promise((resolve) => setTimeout(resolve, msAttente));

  // Après l'attente, on recharge et consomme
  const maintenant2 = process.hrtime.bigint();
  const ecouleSec2 = Number(maintenant2 - bucket.dernierAppelNs) / 1e9;
  bucket.tokens = Math.min(bucket.capacite, bucket.tokens + ecouleSec2 * bucket.debit);
  bucket.dernierAppelNs = maintenant2;
  bucket.tokens = Math.max(0, bucket.tokens - 1);
}

/**
 * Retourne l'état actuel d'un bucket (lecture seule, utile pour les tests).
 *
 * @param {string} nom
 * @returns {{ tokens: number, capacite: number, debit: number }|null}
 */
export function obtenirEtatBucket(nom) {
  const bucket = buckets.get(nom);
  if (!bucket) return null;
  return { tokens: bucket.tokens, capacite: bucket.capacite, debit: bucket.debit };
}

/**
 * Supprime tous les buckets (utile pour l'isolation des tests).
 */
export function reinitialiserBuckets() {
  buckets.clear();
}
