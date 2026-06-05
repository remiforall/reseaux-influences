/**
 * Tests du connecteur Transparence Sante (stub).
 * Verifie que le stub retourne un tableau vide sans planter et inclut
 * un avertissement documentant l'etat d'avancement.
 */

import { describe, it, expect } from '@jest/globals';

// Pas de mock cache/rate-limit : le stub ne fait aucun appel reseau

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: () => 'hash-test',
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

import { jest } from '@jest/globals';

const { default: TransparenceSanteConnecteur } = await import(
  '../../../src/connecteurs/sources/transparence-sante.js'
);

describe('TransparenceSanteConnecteur — stub', () => {
  it("rechercher() retourne un tableau vide avec source et avertissement", async () => {
    const connecteur = new TransparenceSanteConnecteur();
    const resultat = await connecteur.rechercher('Dupont');

    expect(resultat.resultats).toEqual([]);
    expect(resultat.source).toBe('Transparence Sante');
    expect(resultat.version).toMatch(/stub/);
    expect(resultat.avertissement).toBeDefined();
    expect(typeof resultat.avertissement).toBe('string');
  });

  it("rechercher() ne lance pas d'erreur meme avec une query vide", async () => {
    const connecteur = new TransparenceSanteConnecteur();
    await expect(connecteur.rechercher('')).resolves.not.toThrow();
  });
});
