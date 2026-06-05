/**
 * Tests du token bucket de rate-limit.
 * Couvre : rafale autorisée, blocage hors capacité, recharge progressive.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  creerBucket,
  consommer,
  obtenirEtatBucket,
  reinitialiserBuckets,
} from '../../src/connecteurs/rate-limit.js';

describe('rate-limit — rafale autorisée', () => {
  beforeEach(() => reinitialiserBuckets());

  it('consomme les tokens disponibles sans attendre', async () => {
    creerBucket('test-rafale', { debit: 10, capacite: 5 });

    const debut = Date.now();
    for (let i = 0; i < 5; i++) {
      await consommer('test-rafale');
    }
    const duree = Date.now() - debut;

    // 5 tokens disponibles immédiatement → quasi instantané
    expect(duree).toBeLessThan(200);
    const etat = obtenirEtatBucket('test-rafale');
    expect(etat.tokens).toBeLessThan(1);
  });
});

describe('rate-limit — blocage quand le bucket est vide', () => {
  beforeEach(() => reinitialiserBuckets());

  it('attend quand la capacité est dépassée', async () => {
    // Débit 5/s, capacité 1 → après le 1er token, le 2ème coûte ~200ms
    creerBucket('test-blocage', { debit: 5, capacite: 1 });

    const debut = Date.now();
    await consommer('test-blocage'); // immédiat (1 token dispo)
    await consommer('test-blocage'); // doit attendre ~200ms (1/5s)
    const duree = Date.now() - debut;

    expect(duree).toBeGreaterThan(100);
  }, 10_000);
});

describe('rate-limit — recharge progressive', () => {
  beforeEach(() => reinitialiserBuckets());

  it('recharge les tokens au fil du temps', async () => {
    creerBucket('test-recharge', { debit: 10, capacite: 10 });

    // Vide le bucket
    for (let i = 0; i < 10; i++) {
      await consommer('test-recharge');
    }

    // Attend 300ms → ~3 tokens rechargés
    await new Promise((r) => setTimeout(r, 300));

    // Les 3 prochains appels doivent être quasi-immédiats
    const debut = Date.now();
    await consommer('test-recharge');
    await consommer('test-recharge');
    await consommer('test-recharge');
    const duree = Date.now() - debut;

    expect(duree).toBeLessThan(200);
  }, 10_000);

  it('lève une erreur pour un bucket non initialisé', async () => {
    await expect(consommer('inexistant')).rejects.toThrow(
      'Bucket non initialisé pour le connecteur "inexistant"',
    );
  });
});
