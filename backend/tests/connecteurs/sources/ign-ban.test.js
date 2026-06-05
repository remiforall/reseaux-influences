/**
 * Tests du connecteur IGN BAN.
 * Couvre : géocodage avec fixture, query trop courte, mapping champs normalisés.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, '../fixtures');

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: () => 'hash-test-ban',
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

const { default: IgnBanConnecteur } = await import('../../../src/connecteurs/sources/ign-ban.js');

async function chargerFixture() {
  const contenu = await readFile(path.join(FIXTURES_DIR, 'ign-ban.json'), 'utf8');
  return JSON.parse(contenu);
}

describe('IgnBanConnecteur — rechercher()', () => {
  let connecteur;

  beforeEach(() => {
    connecteur = new IgnBanConnecteur();
  });

  it('retourne tableau vide pour query trop courte', async () => {
    connecteur._appelHttp = jest.fn();
    const resultat = await connecteur.rechercher('ab');
    expect(resultat.resultats).toHaveLength(0);
    expect(connecteur._appelHttp).not.toHaveBeenCalled();
  });

  it('mappe correctement la fixture BAN', async () => {
    const fixture = await chargerFixture();
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture);

    const resultat = await connecteur.rechercher('5 avenue du général leclerc paris');

    expect(resultat.source).toBe('BAN');
    expect(resultat.resultats).toHaveLength(2);

    const premier = resultat.resultats[0];
    expect(premier.type).toBe('Adresse');
    expect(premier.champs.adresseComplete.valeur).toBe('5 Avenue du Général Leclerc 75014 Paris');
    expect(premier.champs.adresseComplete.source).toBe('BAN');
    expect(premier.champs.lat.valeur).toBe(48.8534);
    expect(premier.champs.lon.valeur).toBe(2.3488);
    expect(premier.champs.codeInsee.valeur).toBe('75114');
    expect(premier.champs.ville.valeur).toBe('Paris');
    expect(premier.champs.codePostal.valeur).toBe('75014');
  });

  it('le score de confiance est marqué avec provenance', async () => {
    const fixture = await chargerFixture();
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture);

    const resultat = await connecteur.rechercher('avenue leclerc paris');
    const score = resultat.resultats[0].champs.score;

    expect(score.valeur).toBeGreaterThan(0);
    expect(score.source).toBe('BAN');
  });
});
