/**
 * Tests du connecteur TED (marchés publics UE).
 * Couvre : requête experte FT~, agrégation par acheteur, extraction des champs
 * multilingues, liens d'avis, mapping INSTITUTION_PUBLIQUE, query courte.
 *
 * `_appelHttp` de l'instance est stubbé avec une fixture de réponse TED.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: jest.fn(() => 'hash-ted-test'),
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

const { default: TedConnecteur } = await import('../../../src/connecteurs/sources/ted.js')

const REPONSE = {
  totalNoticeCount: 3,
  notices: [
    {
      'publication-number': '208253-2016',
      'buyer-name': { fra: ['AP-HP'] },
      'buyer-country': ['FRA'],
      'publication-date': '2016-06-18+02:00',
      'notice-title': {
        fra: 'France-Paris : Services de support logiciel',
        eng: 'France-Paris: Software support',
      },
      links: { html: { FRA: 'https://ted.europa.eu/fr/notice/-/detail/208253-2016' } },
    },
    {
      'publication-number': '209000-2016',
      'buyer-name': { fra: ['AP-HP'] },
      'buyer-country': ['FRA'],
      'publication-date': '2017-02-01+01:00',
      'notice-title': { fra: 'France-Paris : Maintenance' },
      links: { html: { FRA: 'https://ted.europa.eu/fr/notice/-/detail/209000-2016' } },
    },
    {
      'publication-number': '211168-2016',
      'buyer-name': { eng: ['NHS Shared Business Services'] },
      'buyer-country': ['GBR'],
      'publication-date': '2016-06-21+02:00',
      'notice-title': { eng: 'United Kingdom-Salford: Facilities management' },
      links: { html: { ENG: 'https://ted.europa.eu/en/notice/-/detail/211168-2016' } },
    },
  ],
}

let connecteur

beforeEach(() => {
  connecteur = new TedConnecteur()
})

describe('TedConnecteur — rechercher()', () => {
  it('retourne vide pour une query trop courte sans appel réseau', async () => {
    const spy = jest.spyOn(connecteur, '_appelHttp')
    const res = await connecteur.rechercher('x')
    expect(res.resultats).toHaveLength(0)
    expect(spy).not.toHaveBeenCalled()
  })

  it('construit une requête experte FT~ et agrège par acheteur', async () => {
    const spy = jest.spyOn(connecteur, '_appelHttp').mockResolvedValue(REPONSE)
    const res = await connecteur.rechercher('AP-HP')

    const corps = JSON.parse(spy.mock.calls[0][1].body)
    expect(corps.query).toBe('FT~"AP-HP"')
    expect(spy.mock.calls[0][1].method).toBe('POST')

    // 2 acheteurs distincts (AP-HP agrégé sur 2 avis + NHS)
    expect(res.resultats).toHaveLength(2)
    const apHp = res.resultats.find((e) => e.champs.nom.valeur === 'AP-HP')
    expect(apHp.champs.nombreAvisTed.valeur).toBe(2)
    expect(apHp.champs.typeOrganisation.valeur).toBe('INSTITUTION_PUBLIQUE')
    expect(apHp.champs.pays.valeur).toBe('FRA')
    expect(apHp.champs.derniereActiviteTed.valeur).toBe('2017-02-01') // date la plus récente
  })

  it("extrait le titre multilingue (fra préféré) et le lien de l'avis", async () => {
    jest.spyOn(connecteur, '_appelHttp').mockResolvedValue(REPONSE)
    const res = await connecteur.rechercher('logiciel')
    const apHp = res.resultats.find((e) => e.champs.nom.valeur === 'AP-HP')
    expect(apHp.champs.description.valeur).toContain('Services de support logiciel')
  })

  it('gère une réponse sans notices', async () => {
    jest.spyOn(connecteur, '_appelHttp').mockResolvedValue({ notices: [] })
    const res = await connecteur.rechercher('inconnu')
    expect(res.resultats).toHaveLength(0)
  })

  it('échappe les guillemets dans le terme', async () => {
    const spy = jest.spyOn(connecteur, '_appelHttp').mockResolvedValue({ notices: [] })
    await connecteur.rechercher('a"b')
    expect(JSON.parse(spy.mock.calls[0][1].body).query).toBe('FT~"ab"')
  })
})

describe('TedConnecteur — _texteMultilingue', () => {
  it('préfère fra, puis eng, puis première langue', () => {
    expect(connecteur._texteMultilingue({ fra: ['A'], eng: ['B'] })).toBe('A')
    expect(connecteur._texteMultilingue({ eng: ['B'], deu: ['C'] })).toBe('B')
    expect(connecteur._texteMultilingue({ ita: 'D' })).toBe('D')
    expect(connecteur._texteMultilingue(null)).toBeNull()
  })
})

describe('TedConnecteur — detailler/listerLiens', () => {
  it('detailler renvoie une entité nulle', async () => {
    const res = await connecteur.detailler('x')
    expect(res.entite).toBeNull()
  })
  it('listerLiens renvoie vide', async () => {
    const res = await connecteur.listerLiens('x')
    expect(res.liens).toHaveLength(0)
  })
})
