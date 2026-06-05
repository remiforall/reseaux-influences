/**
 * Tests du stub DDoSecrets (désactivé).
 * Vérifie : résultat vide, message d'avertissement, aucun appel réseau.
 */

import { describe, it, expect } from '@jest/globals';

// Import direct du stub — pas besoin de mocker cache/rate-limit (zéro appel réseau)
const { default: DdoSecretsConnecteur } = await import(
  '../../../src/connecteurs/sources/ddosecrets.js'
);

describe('DdoSecretsConnecteur — STUB DÉSACTIVÉ', () => {
  it('rechercher() retourne un tableau resultats vide', async () => {
    const connecteur = new DdoSecretsConnecteur();
    const resultat = await connecteur.rechercher('quelconque');
    expect(resultat.resultats).toHaveLength(0);
  });

  it("rechercher() inclut un message d'avertissement juridique", async () => {
    const connecteur = new DdoSecretsConnecteur();
    const resultat = await connecteur.rechercher('test');
    expect(resultat.avertissement).toBeDefined();
    expect(resultat.avertissement).toContain('323-3');
    expect(resultat.avertissement).toContain('ADR-010');
  });

  it('rechercher() retourne la version stub 0.0.0-stub', async () => {
    const connecteur = new DdoSecretsConnecteur();
    const resultat = await connecteur.rechercher('test');
    expect(resultat.version).toBe('0.0.0-stub');
  });

  it('ne declenche aucun appel reseau (fetch non appele)', async () => {
    const fetchOriginal = global.fetch;
    let fetchAppele = false;
    global.fetch = async () => {
      fetchAppele = true;
      throw new Error('fetch ne doit pas être appelé par un stub désactivé');
    };

    try {
      const connecteur = new DdoSecretsConnecteur();
      await connecteur.rechercher('test');
      expect(fetchAppele).toBe(false);
    } finally {
      global.fetch = fetchOriginal;
    }
  });
});
