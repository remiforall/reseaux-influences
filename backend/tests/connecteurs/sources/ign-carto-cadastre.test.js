/**
 * Tests du connecteur IGN Carto Cadastre.
 * Couvre : format codeInsee/section/numero, mapping IDU, query invalide,
 * détail par IDU.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, '../fixtures');

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: () => 'hash-test-cadastre',
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

const { default: IgnCartoCadastre } =
  await import('../../../src/connecteurs/sources/ign-carto-cadastre.js');

async function chargerFixture() {
  const contenu = await readFile(path.join(FIXTURES_DIR, 'ign-carto-cadastre.json'), 'utf8');
  return JSON.parse(contenu);
}

describe('IgnCartoCadastre — rechercher()', () => {
  let connecteur;

  beforeEach(() => {
    connecteur = new IgnCartoCadastre();
  });

  it('retourne tableau vide pour une query invalide', async () => {
    connecteur._appelHttp = jest.fn();
    const resultat = await connecteur.rechercher('invalide');
    expect(resultat.resultats).toHaveLength(0);
    expect(connecteur._appelHttp).not.toHaveBeenCalled();
  });

  it("construit l'URL correcte pour codeInsee/section/numero", async () => {
    const fixture = await chargerFixture();
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture);

    await connecteur.rechercher('75114/A/0012');

    const urlAppelée = connecteur._appelHttp.mock.calls[0][0];
    expect(urlAppelée).toContain('apicarto.ign.fr');
    expect(urlAppelée).toContain('code_insee=75114');
    expect(urlAppelée).toContain('section=A');
    expect(urlAppelée).toContain('numero=0012');
  });

  it('mappe correctement une parcelle depuis la fixture', async () => {
    const fixture = await chargerFixture();
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture);

    const resultat = await connecteur.rechercher('75114/A/0012');

    expect(resultat.resultats).toHaveLength(1);
    const parcelle = resultat.resultats[0];

    expect(parcelle.type).toBe('Parcelle');
    expect(parcelle.champs.idu.valeur).toBe('75114000A0012');
    expect(parcelle.champs.codeInsee.valeur).toBe('75114');
    expect(parcelle.champs.section.valeur).toBe('A');
    expect(parcelle.champs.numero.valeur).toBe('0012');
    expect(parcelle.champs.contenance.valeur).toBe(312);
    expect(parcelle.champs.idu.source).toBe('IGN Cadastre');
  });

  it('la géométrie est incluse avec provenance', async () => {
    const fixture = await chargerFixture();
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture);

    const resultat = await connecteur.rechercher('75114/A/0012');
    const geometrie = resultat.resultats[0].champs.geometrie;

    expect(geometrie.valeur).not.toBeNull();
    expect(geometrie.valeur.type).toBe('Polygon');
    expect(geometrie.source).toBe('IGN Cadastre');
  });

  it('accepte codeInsee/section sans numéro', async () => {
    const fixture = await chargerFixture();
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture);

    await connecteur.rechercher('75114/A');

    const urlAppelée = connecteur._appelHttp.mock.calls[0][0];
    expect(urlAppelée).toContain('section=A');
    expect(urlAppelée).not.toContain('numero=');
  });
});
