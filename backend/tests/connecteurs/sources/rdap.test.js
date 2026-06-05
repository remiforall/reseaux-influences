/**
 * Tests du connecteur RDAP.
 * Couvre : détail .fr avec fixture, gestion REDACTED, mapping NS → hébergeur,
 * domaine invalide.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURES_DIR = path.join(__dirname, '../fixtures')

// Mock cache et rate-limit
await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: () => 'hash-test-rdap',
  lireCache: jest.fn().mockResolvedValue(null),
  ecrireCache: jest.fn().mockResolvedValue(undefined),
  reinitialiserEtatCache: jest.fn(),
}))

await jest.unstable_mockModule('../../../src/connecteurs/rate-limit.js', () => ({
  creerBucket: jest.fn(),
  consommer: jest.fn().mockResolvedValue(undefined),
  reinitialiserBuckets: jest.fn(),
  obtenirEtatBucket: jest.fn(),
}))

const { default: RdapConnecteur } = await import('../../../src/connecteurs/sources/rdap.js')

async function chargerFixture() {
  const contenu = await readFile(path.join(FIXTURES_DIR, 'rdap-domain.json'), 'utf8')
  return JSON.parse(contenu)
}

describe('RdapConnecteur — domaine invalide', () => {
  it('retourne tableau vide sans appel réseau pour une chaîne non-domaine', async () => {
    const connecteur = new RdapConnecteur()
    connecteur._appelHttp = jest.fn()

    const resultat = await connecteur.rechercher('pas un domaine valide!!!')
    expect(resultat.resultats).toHaveLength(0)
    expect(connecteur._appelHttp).not.toHaveBeenCalled()
  })

  it('retourne tableau vide pour une chaîne vide', async () => {
    const connecteur = new RdapConnecteur()
    const resultat = await connecteur.rechercher('')
    expect(resultat.resultats).toHaveLength(0)
  })
})

describe('RdapConnecteur — détail domaine .fr avec fixture', () => {
  let connecteur

  beforeEach(() => {
    connecteur = new RdapConnecteur()
  })

  it('mappe correctement la fixture example.fr', async () => {
    const fixture = await chargerFixture()
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture)

    const resultat = await connecteur.detailler('example.fr')

    expect(resultat.entite).not.toBeNull()
    expect(resultat.entite.type).toBe('SiteWeb')
    expect(resultat.entite.champs.domaine.valeur).toBe('example.fr')
    expect(resultat.entite.champs.domaine.source).toBe('RDAP')
    expect(resultat.entite.champs.registrar.valeur).toBe('Gandi SAS')
  })

  it("extrait les dates d'enregistrement et d'expiration", async () => {
    const fixture = await chargerFixture()
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture)

    const resultat = await connecteur.detailler('example.fr')
    const champs = resultat.entite.champs

    expect(champs.dateEnregistrement.valeur).toBe('2001-03-15T00:00:00Z')
    expect(champs.dateExpiration.valeur).toBe('2026-03-15T00:00:00Z')
  })

  it('extrait les nameservers', async () => {
    const fixture = await chargerFixture()
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture)

    const resultat = await connecteur.detailler('example.fr')
    const ns = resultat.entite.champs.nameservers.valeur

    expect(Array.isArray(ns)).toBe(true)
    expect(ns).toContain('a.dns.gandi.net')
    expect(ns).toContain('b.dns.gandi.net')
  })
})

describe('RdapConnecteur — gestion REDACTED', () => {
  it("n'ajoute pas de lien TITULAIRE_DOMAINE si titulaire est REDACTED", async () => {
    const fixture = await chargerFixture()
    const connecteur = new RdapConnecteur()
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture)

    // La fixture a "REDACTED FOR PRIVACY" comme registrant
    const resultat = await connecteur.detailler('example.fr')
    const liens = resultat.entite.liensSuggeres

    const lienTitulaire = liens.find((l) => l.typeLienCode === 'TITULAIRE_DOMAINE')
    expect(lienTitulaire).toBeUndefined()
  })
})

describe('RdapConnecteur — mapping NS → hébergeur', () => {
  it('déduit Gandi depuis un NS gandi.net', async () => {
    const fixture = await chargerFixture()
    const connecteur = new RdapConnecteur()
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture)

    const resultat = await connecteur.detailler('example.fr')
    const champs = resultat.entite.champs

    // a.dns.gandi.net → Gandi
    expect(champs.hebergeurProbable.valeur).toBe('Gandi')
  })

  it('retourne null pour un NS inconnu', () => {
    const connecteur = new RdapConnecteur()
    const hebergeur = connecteur._deduireHebergeur('ns1.registrar-inconnu.xyz')
    expect(hebergeur).toBeNull()
  })

  it('déduit OVH depuis un NS ovh.net', () => {
    const connecteur = new RdapConnecteur()
    const hebergeur = connecteur._deduireHebergeur('dns1.p00.ovh.net')
    expect(hebergeur).toBe('OVH')
  })
})
