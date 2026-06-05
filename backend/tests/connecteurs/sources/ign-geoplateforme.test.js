/**
 * Tests du connecteur IGN Géoplateforme (stub).
 * Couvre : génération d'URL WMS-R sans appel HTTP, paramètres par défaut,
 * couche personnalisée, bbox optionnelle.
 */

import { describe, it, expect, jest } from '@jest/globals';

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: () => 'hash-test-geoplateforme',
  lireCache: jest.fn().mockResolvedValue(null),
  ecrireCache: jest.fn().mockResolvedValue(undefined),
  reinitialiserEtatCache: jest.fn(),
}));

await jest.unstable_mockModule('../../../src/connecteurs/rate-limit.js', () => ({
  creerBucket: jest.fn(),
  consommer: jest.fn().mockResolvedValue(undefined),
  reinitialiserBuckets: jest.fn(),
  obtenirEtatBucket: jest.fn(),
}));

const { default: IgnGeoplateformeConnecteur, COUCHES_DISPONIBLES } =
  await import('../../../src/connecteurs/sources/ign-geoplateforme.js');

describe('IgnGeoplateformeConnecteur — obtenirUrlFondCarte()', () => {
  it('retourne une URL WMS-R valide avec la couche par défaut', () => {
    const connecteur = new IgnGeoplateformeConnecteur();
    const url = connecteur.obtenirUrlFondCarte();

    expect(url).toContain('data.geopf.fr/wms-r');
    expect(url).toContain('SERVICE=WMS');
    expect(url).toContain('REQUEST=GetMap');
    expect(url).toContain(COUCHES_DISPONIBLES.PLAN_IGN);
  });

  it("intègre la couche demandée dans l'URL", () => {
    const connecteur = new IgnGeoplateformeConnecteur();
    const url = connecteur.obtenirUrlFondCarte(COUCHES_DISPONIBLES.ORTHOPHOTOS);

    expect(url).toContain('ORTHOIMAGERY.ORTHOPHOTOS');
    expect(url).not.toContain('PLANIGNV2');
  });

  it("intègre la bbox dans l'URL quand elle est fournie", () => {
    const connecteur = new IgnGeoplateformeConnecteur();
    const bbox = { minx: 2.3, miny: 48.8, maxx: 2.4, maxy: 48.9 };
    const url = connecteur.obtenirUrlFondCarte(COUCHES_DISPONIBLES.PLAN_IGN, bbox);

    expect(url).toContain('BBOX=2.3');
    expect(url).toContain('48.8');
  });

  it('ne fait aucun appel réseau', () => {
    const connecteur = new IgnGeoplateformeConnecteur();
    const appelHttpSpy = jest.spyOn(connecteur, '_appelHttp');

    connecteur.obtenirUrlFondCarte();

    expect(appelHttpSpy).not.toHaveBeenCalled();
  });
});

describe('IgnGeoplateformeConnecteur — obtenirUrlBaseWms()', () => {
  it("retourne l'URL de base sans paramètres", () => {
    const connecteur = new IgnGeoplateformeConnecteur();
    const url = connecteur.obtenirUrlBaseWms();

    expect(url).toBe('https://data.geopf.fr/wms-r');
    expect(url).not.toContain('?');
  });
});

describe('IgnGeoplateformeConnecteur — rechercher()', () => {
  it('retourne toujours un tableau vide (stub)', async () => {
    const connecteur = new IgnGeoplateformeConnecteur();
    const resultat = await connecteur.rechercher('quelconque');

    expect(resultat.resultats).toHaveLength(0);
    expect(resultat.source).toBe('IGN Géoplateforme');
  });
});

describe('COUCHES_DISPONIBLES', () => {
  it('exporte les couches principales', () => {
    expect(COUCHES_DISPONIBLES.PLAN_IGN).toBeDefined();
    expect(COUCHES_DISPONIBLES.ORTHOPHOTOS).toBeDefined();
    expect(COUCHES_DISPONIBLES.PARCELLAIRE).toBeDefined();
  });
});
