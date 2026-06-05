/**
 * Tests du connecteur Wikidata.
 * Couvre : parsing SPARQL JSON-binding, mapping propriétés P-*, réponse vide,
 * gestion des types uri vs literal, et protection contre l'injection SPARQL (C-03).
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, '../fixtures');

// Mock du cache et du rate-limit pour isoler les tests réseau
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

const { default: WikidataConnecteur, echapperSparql } =
  await import('../../../src/connecteurs/sources/wikidata.js');

/** Charge la fixture Wikidata. */
async function chargerFixture() {
  const contenu = await readFile(path.join(FIXTURES_DIR, 'wikidata-personne.json'), 'utf8');
  return JSON.parse(contenu);
}

// ---------------------------------------------------------------------------
// Tests existants — rechercher()
// ---------------------------------------------------------------------------

describe('WikidataConnecteur — rechercher()', () => {
  it('retourne un tableau vide pour une query trop courte', async () => {
    const connecteur = new WikidataConnecteur();
    const resultat = await connecteur.rechercher('a');
    expect(resultat.resultats).toHaveLength(0);
    expect(resultat.source).toBe('Wikidata');
  });

  it('retourne un tableau vide pour une query vide', async () => {
    const connecteur = new WikidataConnecteur();
    const resultat = await connecteur.rechercher('');
    expect(resultat.resultats).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Tests existants — detailler()
// ---------------------------------------------------------------------------

describe('WikidataConnecteur — detailler() — parsing SPARQL', () => {
  let connecteur;

  beforeEach(() => {
    connecteur = new WikidataConnecteur();
  });

  it('mappe correctement la fixture personne Q999999999', async () => {
    const fixture = await chargerFixture();

    // Remplace _appelHttp pour retourner la fixture sans appel réseau
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture);

    const resultat = await connecteur.detailler('Q999999999');

    expect(resultat.entite).not.toBeNull();
    expect(resultat.entite.type).toBe('Personne');
    expect(resultat.entite.champs.nom.valeur).toBe('Jean Fictif');
    expect(resultat.entite.champs.nom.source).toBe('Wikidata');
    expect(resultat.entite.champs.wikidataId.valeur).toBe('Q999999999');
  });

  it('extrait les liens suggérés depuis les propriétés P39 et P102', async () => {
    const fixture = await chargerFixture();
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture);

    const resultat = await connecteur.detailler('Q999999999');
    const liens = resultat.entite.liensSuggeres;

    expect(liens.length).toBeGreaterThanOrEqual(2);

    const mandatElectif = liens.find((l) => l.typeLienCode === 'MANDAT_ELECTIF');
    expect(mandatElectif).toBeDefined();
    expect(mandatElectif.vers.type).toBe('Organisation');

    const affiliationParti = liens.find((l) => l.typeLienCode === 'AFFILIATION_PARTI');
    expect(affiliationParti).toBeDefined();
  });

  it('retourne entite null pour une réponse SPARQL vide', async () => {
    connecteur._appelHttp = jest.fn().mockResolvedValue({
      results: { bindings: [] },
    });

    const resultat = await connecteur.detailler('Q000000000');
    expect(resultat.entite).toBeNull();
    expect(resultat.source).toBe('Wikidata');
  });

  it('gère les valeurs uri vs literal dans les bindings', async () => {
    const fixture = await chargerFixture();
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture);

    const resultat = await connecteur.detailler('Q999999999');

    // Les champs textuels sont des literals
    expect(typeof resultat.entite.champs.nom.valeur).toBe('string');
    // Le pays vient d'un label literal
    expect(resultat.entite.champs.pays.valeur).toBe('France');
  });
});

// ---------------------------------------------------------------------------
// Tests existants — listerLiens()
// ---------------------------------------------------------------------------

describe('WikidataConnecteur — listerLiens()', () => {
  it("retourne les liens de l'entité", async () => {
    const fixture = await chargerFixture();
    const connecteur = new WikidataConnecteur();
    connecteur._appelHttp = jest.fn().mockResolvedValue(fixture);

    const resultat = await connecteur.listerLiens('Q999999999');
    expect(Array.isArray(resultat.liens)).toBe(true);
    expect(resultat.source).toBe('Wikidata');
  });
});

// ---------------------------------------------------------------------------
// C-03 / SEC-C-01 — Injection SPARQL : echapperSparql() bloque les payloads
// ---------------------------------------------------------------------------

describe('echapperSparql() — protection injection SPARQL (C-03)', () => {
  it('échappe les guillemets doubles', () => {
    expect(echapperSparql('"injection"')).toBe('\\"injection\\"');
  });

  it('échappe les backslashs', () => {
    expect(echapperSparql('a\\b')).toBe('a\\\\b');
  });

  it('échappe les newlines \\n', () => {
    expect(echapperSparql('ligne1\nligne2')).toBe('ligne1\\nligne2');
  });

  it('échappe les retours chariot \\r', () => {
    expect(echapperSparql('a\rb')).toBe('a\\rb');
  });

  it('échappe les tabulations \\t', () => {
    expect(echapperSparql('a\tb')).toBe('a\\tb');
  });

  it("supprime les caractères de contrôle (\\x00-\\x1f)", () => {
    // Un payload contenant un caractère de contrôle BEL (0x07) ne doit pas passer
    const avecControle = 'test\x07injection';
    expect(echapperSparql(avecControle)).not.toContain('\x07');
    expect(echapperSparql(avecControle)).toBe('testinjection');
  });

  it('neutralise un payload de type SPARQL union injection', () => {
    const payload = '") } UNION { SELECT * WHERE { ?s ?p ?o } FILTER(CONTAINS(LCASE(?s), "';
    const echappe = echapperSparql(payload);
    // Les guillemets doivent être échappés — pas de guillemet non protégé
    expect(echappe).not.toMatch(/(?<!\\)"/);
  });

  it('neutralise un payload avec newline pour sortir du filtre CONTAINS', () => {
    const payload = 'macron\n}) SELECT * WHERE {';
    const echappe = echapperSparql(payload);
    expect(echappe).not.toContain('\n');
    expect(echappe).toContain('\\n');
  });

  it('préserve les caractères alphabétiques normaux', () => {
    expect(echapperSparql('Emmanuel Macron')).toBe('Emmanuel Macron');
  });

  it('préserve les caractères accentués', () => {
    expect(echapperSparql('Élisabeth Borne')).toBe('Élisabeth Borne');
  });
});

// ---------------------------------------------------------------------------
// C-03 — Validation du paramètre lang (whitelist ^[a-z]{2}$)
// ---------------------------------------------------------------------------

describe('WikidataConnecteur — rechercher() — validation lang (C-03)', () => {
  it("utilise 'fr' par défaut si lang est invalide", async () => {
    const connecteur = new WikidataConnecteur();
    let sparqlCapturee = '';
    connecteur._requeteSparql = jest.fn().mockImplementation((sparql) => {
      sparqlCapturee = sparql;
      return Promise.resolve({ results: { bindings: [] } });
    });

    // Injection via lang : tenter de sortir du filtre LANG
    await connecteur.rechercher('test', { lang: 'fr") } UNION { SELECT * WHERE {' });

    // La query SPARQL ne doit PAS contenir la chaîne d'injection
    expect(sparqlCapturee).not.toContain('UNION');
    // La lang utilisée doit être 'fr' (fallback)
    expect(sparqlCapturee).toContain('"fr"');
  });

  it("accepte 'en' comme lang valide", async () => {
    const connecteur = new WikidataConnecteur();
    let sparqlCapturee = '';
    connecteur._requeteSparql = jest.fn().mockImplementation((sparql) => {
      sparqlCapturee = sparql;
      return Promise.resolve({ results: { bindings: [] } });
    });

    await connecteur.rechercher('Thatcher', { lang: 'en' });
    expect(sparqlCapturee).toContain('"en"');
  });

  it("rejette un lang de 3 caractères et replie sur 'fr'", async () => {
    const connecteur = new WikidataConnecteur();
    let sparqlCapturee = '';
    connecteur._requeteSparql = jest.fn().mockImplementation((sparql) => {
      sparqlCapturee = sparql;
      return Promise.resolve({ results: { bindings: [] } });
    });

    await connecteur.rechercher('test', { lang: 'fra' });
    // 'fra' ne passe pas ^[a-z]{2}$ → fallback 'fr'
    expect(sparqlCapturee).toContain('"fr"');
    expect(sparqlCapturee).not.toContain('"fra"');
  });
});
