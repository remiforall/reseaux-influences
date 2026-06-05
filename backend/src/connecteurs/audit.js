/**
 * @module audit
 * Enregistrement des opérations d'enrichissement dans `AuditEnrichissement`.
 *
 * Conformité RGPD :
 * - La query est expurgée si elle ressemble à un email ou un numéro de téléphone.
 * - L'adresse IP est tronquée (dernier octet supprimé) avant stockage.
 *
 * Note : ce module importe Prisma depuis `utils/prisma.js`. En test, mocker
 * ce module via `jest.unstable_mockModule`.
 */

import { prisma } from '../utils/prisma.js'

/**
 * Regex de détection d'un email dans une chaîne.
 * Intentionnellement permissive pour maximiser la redaction.
 */
const REGEX_EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

/**
 * Regex de détection d'un numéro de téléphone français (avec ou sans espaces).
 * Couvre les formats +33, 0033, 06, 07, 01-05.
 */
const REGEX_TELEPHONE = /(?:\+33|0033|0)[1-9](?:[\s.-]?\d{2}){4}/

/**
 * Tronque le dernier octet d'une adresse IPv4, ou le dernier groupe d'une IPv6.
 * Ex: '192.168.1.42' → '192.168.1.0'
 *     '2001:db8::1'  → '2001:db8::0'
 *
 * @param {string|null|undefined} ip
 * @returns {string|null}
 */
function tronquerIp(ip) {
  if (!ip) return null

  // IPv4
  const partiesV4 = ip.split('.')
  if (partiesV4.length === 4) {
    partiesV4[3] = '0'
    return partiesV4.join('.')
  }

  // IPv6 — remplace le dernier groupe non-vide
  const partiesV6 = ip.split(':')
  if (partiesV6.length > 1) {
    partiesV6[partiesV6.length - 1] = '0'
    return partiesV6.join(':')
  }

  return null
}

/**
 * Expurge une chaîne si elle contient un email ou un numéro de téléphone.
 *
 * @param {string|null|undefined} query
 * @returns {string|null}
 */
function expurgerQuery(query) {
  if (!query) return query ?? null
  if (REGEX_EMAIL.test(query) || REGEX_TELEPHONE.test(query)) {
    return '[EXPURGÉ — donnée personnelle détectée]'
  }
  return query
}

/**
 * Enregistre une opération d'enrichissement dans la table `AuditEnrichissement`.
 *
 * Accepte un client Prisma injecté (transaction `tx` ou client global) afin de
 * pouvoir s'exécuter DANS une transaction Prisma — garantissant que l'audit et
 * l'import sont atomiques (C-02 / ADR-008 : audit immuable).
 *
 * @param {{
 *   utilisateurId: string,
 *   requete: { query: string, types?: string[], connecteurs?: string[] },
 *   connecteursUtilises: Record<string, 'ok'|'erreur'|'timeout'>,
 *   entitesCreees: Array<{ type: string, id: string }>,
 *   ipAddress?: string|null
 * }} params
 * @param {import('@prisma/client').PrismaClient} [prismaClient] - Client Prisma (défaut : client global)
 * @returns {Promise<{ id: string }>} L'entrée d'audit créée (id seulement)
 */
export async function enregistrerAudit(
  { utilisateurId, requete, connecteursUtilises, entitesCreees, ipAddress = null },
  prismaClient = prisma,
) {
  const requeteExpurgee = {
    ...requete,
    query: expurgerQuery(requete.query),
  }

  const audit = await prismaClient.auditEnrichissement.create({
    data: {
      utilisateurId,
      requete: requeteExpurgee,
      connecteursUtilises,
      entitesCreees,
      ipAddressTronquee: tronquerIp(ipAddress),
    },
    select: { id: true },
  })

  return audit
}

// Exports internes exposés pour les tests
export { tronquerIp, expurgerQuery }
