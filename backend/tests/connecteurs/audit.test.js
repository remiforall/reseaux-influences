/**
 * Tests du module audit.
 * Couvre : écriture standard, redaction d'un email dans la query.
 *
 * Prisma est mocké via `jest.unstable_mockModule` pour éviter toute
 * connexion réelle à la base de données.
 */

import { describe, it, expect, jest } from '@jest/globals'

// Mock Prisma AVANT l'import d'audit
const mockCreate = jest.fn().mockResolvedValue({ id: 'uuid-test-audit' })

await jest.unstable_mockModule('../../src/utils/prisma.js', () => ({
  prisma: {
    auditEnrichissement: {
      create: mockCreate,
    },
  },
}))

const { enregistrerAudit, tronquerIp, expurgerQuery } =
  await import('../../src/connecteurs/audit.js')

describe('audit — enregistrerAudit', () => {
  it("crée une entrée d'audit avec IP tronquée", async () => {
    mockCreate.mockClear()

    await enregistrerAudit({
      utilisateurId: 'user-123',
      requete: { query: 'Emmanuel Macron', types: ['personne'] },
      connecteursUtilises: { wikidata: 'ok', rdap: 'timeout' },
      entitesCreees: [{ type: 'Personne', id: 'entite-456' }],
      ipAddress: '192.168.1.42',
    })

    expect(mockCreate).toHaveBeenCalledTimes(1)
    const appelArgs = mockCreate.mock.calls[0][0]

    expect(appelArgs.data.utilisateurId).toBe('user-123')
    expect(appelArgs.data.ipAddressTronquee).toBe('192.168.1.0')
    expect(appelArgs.data.requete.query).toBe('Emmanuel Macron')
    expect(appelArgs.data.connecteursUtilises).toEqual({ wikidata: 'ok', rdap: 'timeout' })
  })

  it('expurge la query si elle contient un email', async () => {
    mockCreate.mockClear()

    await enregistrerAudit({
      utilisateurId: 'user-456',
      requete: { query: 'jean.dupont@exemple.fr', types: ['personne'] },
      connecteursUtilises: { wikidata: 'ok' },
      entitesCreees: [],
      ipAddress: '10.0.0.5',
    })

    const appelArgs = mockCreate.mock.calls[0][0]
    expect(appelArgs.data.requete.query).toBe('[EXPURGÉ — donnée personnelle détectée]')
  })
})

describe('audit — helpers', () => {
  it("tronque le dernier octet d'une IPv4", () => {
    expect(tronquerIp('192.168.1.42')).toBe('192.168.1.0')
    expect(tronquerIp('10.0.0.1')).toBe('10.0.0.0')
  })

  it('retourne null pour une IP absente', () => {
    expect(tronquerIp(null)).toBeNull()
    expect(tronquerIp(undefined)).toBeNull()
    expect(tronquerIp('')).toBeNull()
  })

  it('expurge un numéro de téléphone', () => {
    const resultat = expurgerQuery('0612345678')
    expect(resultat).toBe('[EXPURGÉ — donnée personnelle détectée]')
  })

  it('laisse une query normale intacte', () => {
    expect(expurgerQuery('Emmanuel Macron')).toBe('Emmanuel Macron')
  })
})
