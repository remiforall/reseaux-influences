/**
 * Tests du scaffold BaseConnecteurScraping (ADR-019).
 * Couvre : parsing robots.txt, allowlist de domaines, anti-SSRF, fail-closed,
 * et le gel par défaut (allowlist vide → rien n'est scrapable).
 *
 * Aucun appel réseau réel : globalThis.fetch est remplacé par un mock.
 */

import { describe, it, expect, jest, afterEach } from '@jest/globals'

await jest.unstable_mockModule('../../src/connecteurs/cache.js', () => ({
  hashCle: () => 'hash-scraping-test',
  lireCache: jest.fn().mockResolvedValue(null),
  ecrireCache: jest.fn().mockResolvedValue(undefined),
  obtenirOuCalculer: (cle, ttlMs, fabrique) => fabrique(),
  reinitialiserEtatCache: jest.fn(),
}))

await jest.unstable_mockModule('../../src/connecteurs/rate-limit.js', () => ({
  creerBucket: jest.fn(),
  consommer: jest.fn().mockResolvedValue(undefined),
  reinitialiserBuckets: jest.fn(),
  obtenirEtatBucket: jest.fn(),
}))

const { BaseConnecteurScraping, cheminAutoriseParRobots } = await import(
  '../../src/connecteurs/base-scraping.js'
)

const fetchOriginal = globalThis.fetch

function mockFetch(handler) {
  globalThis.fetch = jest.fn(handler)
}

function reponse({ status = 200, text = '' }) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, text: () => Promise.resolve(text) })
}

afterEach(() => {
  globalThis.fetch = fetchOriginal
})

// ---------------------------------------------------------------------------
// Parsing robots.txt
// ---------------------------------------------------------------------------

describe('cheminAutoriseParRobots', () => {
  const robots = `
User-agent: *
Disallow: /admin
Disallow: /private

User-agent: BadBot
Disallow: /
`

  it('autorise un chemin non listé', () => {
    expect(cheminAutoriseParRobots(robots, '/article/123', 'reseauxinfluences.fr')).toBe(true)
  })

  it('refuse un chemin sous Disallow du groupe *', () => {
    expect(cheminAutoriseParRobots(robots, '/admin/x', 'reseauxinfluences.fr')).toBe(false)
  })

  it('robots vide (aucune règle) → autorisé', () => {
    expect(cheminAutoriseParRobots('', '/quoi', 'reseauxinfluences.fr')).toBe(true)
  })

  it('Disallow: / pour notre agent → tout refusé', () => {
    const r = 'User-agent: reseauxinfluences.fr\nDisallow: /'
    expect(cheminAutoriseParRobots(r, '/page', 'reseauxinfluences.fr')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Connecteur de test concret minimal
// ---------------------------------------------------------------------------

class ScraperTest extends BaseConnecteurScraping {
  constructor(domaines) {
    super({
      nom: 'scraper-test',
      version: '1.0',
      rateLimit: { debit: 1, capacite: 5 },
      domainesAutorises: domaines,
    })
  }
}

describe('BaseConnecteurScraping — allowlist & gel', () => {
  it('allowlist vide par défaut → aucun domaine scrapable', async () => {
    const scraper = new ScraperTest(undefined)
    expect(scraper.domainesAutorises).toEqual([])
    await expect(scraper._appelHtml('https://lemonde.fr/a')).rejects.toThrow(/hors allowlist/)
  })

  it('refuse un domaine hors allowlist', async () => {
    const scraper = new ScraperTest(['exemple-presse.fr'])
    await expect(scraper._appelHtml('https://autre-site.com/x')).rejects.toThrow(/hors allowlist/)
  })

  it('accepte un sous-domaine du domaine autorisé', async () => {
    const scraper = new ScraperTest(['exemple-presse.fr'])
    mockFetch((url) => {
      if (url.endsWith('/robots.txt')) return reponse({ status: 404 })
      return reponse({ text: '<html>ok</html>' })
    })
    const html = await scraper._appelHtml('https://www.exemple-presse.fr/article/1')
    expect(html).toContain('ok')
  })

  it('bloque une IP privée (anti-SSRF)', async () => {
    const scraper = new ScraperTest(['192.168.1.10'])
    await expect(scraper._appelHtml('https://192.168.1.10/x')).rejects.toThrow(/SSRF/)
  })
})

describe('BaseConnecteurScraping — respect robots.txt', () => {
  it("s'abstient quand robots.txt interdit le chemin", async () => {
    const scraper = new ScraperTest(['exemple-presse.fr'])
    mockFetch((url) => {
      if (url.endsWith('/robots.txt')) return reponse({ text: 'User-agent: *\nDisallow: /prive' })
      return reponse({ text: '<html>secret</html>' })
    })
    await expect(
      scraper._appelHtml('https://exemple-presse.fr/prive/dossier'),
    ).rejects.toThrow(/robots\.txt interdit/)
  })

  it('fail-closed : robots.txt injoignable → refus', async () => {
    const scraper = new ScraperTest(['exemple-presse.fr'])
    mockFetch((url) => {
      if (url.endsWith('/robots.txt')) return Promise.reject(new Error('réseau coupé'))
      return reponse({ text: '<html>ok</html>' })
    })
    await expect(scraper._appelHtml('https://exemple-presse.fr/a')).rejects.toThrow(/robots\.txt interdit/)
  })

  it('fail-closed : robots.txt 5xx → refus', async () => {
    const scraper = new ScraperTest(['exemple-presse.fr'])
    mockFetch((url) => {
      if (url.endsWith('/robots.txt')) return reponse({ status: 503 })
      return reponse({ text: '<html>ok</html>' })
    })
    await expect(scraper._appelHtml('https://exemple-presse.fr/a')).rejects.toThrow(/robots\.txt interdit/)
  })

  it('404 sur robots.txt → accès autorisé', async () => {
    const scraper = new ScraperTest(['exemple-presse.fr'])
    mockFetch((url) => {
      if (url.endsWith('/robots.txt')) return reponse({ status: 404 })
      return reponse({ text: '<html>article</html>' })
    })
    const html = await scraper._appelHtml('https://exemple-presse.fr/article/1')
    expect(html).toContain('article')
  })
})
