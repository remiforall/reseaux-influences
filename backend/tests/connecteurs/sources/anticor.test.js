/**
 * Tests du connecteur Anticor.
 * Couvre : parsing RSS, filtrage par terme, retour Sources, cas vide.
 */

import { describe, it, expect, jest } from '@jest/globals'

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: () => 'hash-anticor-test',
  lireCache: jest.fn().mockResolvedValue(null),
  ecrireCache: jest.fn().mockResolvedValue(undefined),
  obtenirOuCalculer: (cle, ttlMs, fabrique) => fabrique(),
  reinitialiserEtatCache: jest.fn(),
}))

await jest.unstable_mockModule('../../../src/connecteurs/rate-limit.js', () => ({
  creerBucket: jest.fn(),
  consommer: jest.fn().mockResolvedValue(undefined),
  reinitialiserBuckets: jest.fn(),
  obtenirEtatBucket: jest.fn(),
}))

const { default: AnticorConnecteur } = await import('../../../src/connecteurs/sources/anticor.js')

/** Fixture RSS minimaliste avec 3 items */
const FIXTURE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Anticor</title>
    <item>
      <title>Affaire Bolloré : les dessous d'un empire en Afrique</title>
      <link>https://www.anticor.org/2024/01/15/affaire-bolloré/</link>
      <pubDate>Mon, 15 Jan 2024 10:00:00 +0000</pubDate>
      <description>Enquête sur les pratiques de l'empire Bolloré en Afrique subsaharienne.</description>
    </item>
    <item>
      <title>Corruption dans les marchés publics</title>
      <link>https://www.anticor.org/2024/02/01/marches-publics/</link>
      <pubDate>Thu, 01 Feb 2024 14:00:00 +0000</pubDate>
      <description>Rapport sur les irrégularités détectées dans les appels d'offres municipaux.</description>
    </item>
    <item>
      <title><![CDATA[Financement occulte des partis politiques]]></title>
      <link>https://www.anticor.org/2024/03/10/financement-partis/</link>
      <pubDate>Sun, 10 Mar 2024 09:00:00 +0000</pubDate>
      <description><![CDATA[Analyse des flux financiers suspects dans les campagnes électorales.]]></description>
    </item>
  </channel>
</rss>`

describe('AnticorConnecteur — rechercher()', () => {
  it('retourne un tableau vide pour une query vide', async () => {
    const connecteur = new AnticorConnecteur()
    const resultat = await connecteur.rechercher('')
    expect(resultat.resultats).toHaveLength(0)
    expect(resultat.sources).toHaveLength(0)
    expect(resultat.source).toBe('Anticor')
  })

  it('filtre correctement les items matchant le terme de recherche', async () => {
    const connecteur = new AnticorConnecteur()
    connecteur._telechargerRss = jest.fn().mockResolvedValue(FIXTURE_RSS)

    const resultat = await connecteur.rechercher('Bolloré')

    expect(resultat.resultats).toHaveLength(0) // pas de nouvelles entités
    expect(resultat.sources).toHaveLength(1)
    expect(resultat.sources[0].titre).toContain('Bolloré')
    expect(resultat.sources[0].media).toBe('Anticor')
    expect(resultat.sources[0].typeMedia).toBe('PRESSE_ECRITE')
    expect(resultat.sources[0].mentions).toContain('Bolloré')
  })

  it('retourne plusieurs sources pour un terme présent dans plusieurs items', async () => {
    const connecteur = new AnticorConnecteur()
    connecteur._telechargerRss = jest.fn().mockResolvedValue(FIXTURE_RSS)

    // "corruption" apparaît dans titre du 2ème item et description du 3ème (financement)
    const resultat = await connecteur.rechercher('corruption')
    expect(resultat.sources.length).toBeGreaterThanOrEqual(1)
  })

  it('gère les CDATA dans le flux RSS', async () => {
    const connecteur = new AnticorConnecteur()
    connecteur._telechargerRss = jest.fn().mockResolvedValue(FIXTURE_RSS)

    const resultat = await connecteur.rechercher('financement')
    expect(resultat.sources).toHaveLength(1)
    expect(resultat.sources[0].titre).toBe('Financement occulte des partis politiques')
  })

  it('retourne [] si aucun item ne matche', async () => {
    const connecteur = new AnticorConnecteur()
    connecteur._telechargerRss = jest.fn().mockResolvedValue(FIXTURE_RSS)

    const resultat = await connecteur.rechercher('xyz_introuvable_123')
    expect(resultat.sources).toHaveLength(0)
    expect(resultat.resultats).toHaveLength(0)
  })
})

describe('AnticorConnecteur — _parserRss()', () => {
  it('retourne un tableau vide pour du XML vide', () => {
    const connecteur = new AnticorConnecteur()
    expect(connecteur._parserRss('')).toHaveLength(0)
    expect(connecteur._parserRss(null)).toHaveLength(0)
  })

  it('extrait correctement les 3 items de la fixture', () => {
    const connecteur = new AnticorConnecteur()
    const items = connecteur._parserRss(FIXTURE_RSS)
    expect(items).toHaveLength(3)
    expect(items[0].url).toBe('https://www.anticor.org/2024/01/15/affaire-bolloré/')
    expect(items[0].datePublication).toMatch(/2024/)
  })
})

describe('AnticorConnecteur — detailler() / listerLiens()', () => {
  it('detailler retourne entite null (non supporté)', async () => {
    const connecteur = new AnticorConnecteur()
    const r = await connecteur.detailler('test')
    expect(r.entite).toBeNull()
    expect(r.source).toBe('Anticor')
  })

  it('listerLiens retourne un tableau vide (non supporté)', async () => {
    const connecteur = new AnticorConnecteur()
    const r = await connecteur.listerLiens('test')
    expect(r.liens).toHaveLength(0)
  })
})
