/**
 * Tests d'intégration des routes enrichissement.
 *
 * Couvre :
 * - 401 si pas de token d'authentification
 * - 403 si seuil gamification non atteint
 * - 400 si query trop courte (< 2 caractères)
 * - 400 si qualiteInfluencePublique absent à l'import
 * - 201 import nominal
 * - Réponse GET /connecteurs
 *
 * Architecture de test : le plugin Fastify est monté directement via
 * Fastify.register() sans lancer le serveur complet, via fastify.inject().
 * Tous les modules applicatifs sont mockés pour éviter les appels DB/réseau.
 */

import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';
import Fastify from 'fastify';

// ---------------------------------------------------------------------------
// Mocks (AVANT l'import des modules applicatifs)
// ---------------------------------------------------------------------------

// Mock middleware auth
await jest.unstable_mockModule('../../src/middleware/auth.js', () => ({
  authenticate: jest.fn(async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer valide')) {
      return reply.code(401).send({ error: 'Token manquant' });
    }
    request.utilisateur = { id: 'user-test-id', role: 'CONTRIBUTEUR', validationsEffectuees: 0 };
  }),
  optionalAuth: jest.fn(async (request) => {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer valide')) {
      request.utilisateur = { id: 'user-test-id', role: 'CONTRIBUTEUR' };
    }
  }),
}));

// Mock gamification
const mockPeutSoumettre = jest.fn();
await jest.unstable_mockModule('../../src/services/gamification.js', () => ({
  peutSoumettre: mockPeutSoumettre,
}));

// Mock service enrichissement
const mockRechercherMultiConnecteurs = jest.fn();
await jest.unstable_mockModule('../../src/services/enrichissement.js', () => ({
  rechercherMultiConnecteurs: mockRechercherMultiConnecteurs,
  reinitialiserRegistrySingleton: jest.fn(),
}));

// Mock service import-enrichissement
const mockImporter = jest.fn();
await jest.unstable_mockModule('../../src/services/import-enrichissement.js', () => ({
  importer: mockImporter,
}));

// Mock registry
const mockListerConnecteurs = jest.fn();
await jest.unstable_mockModule('../../src/connecteurs/registry.js', () => ({
  listerConnecteurs: mockListerConnecteurs,
  chargerConnecteurs: jest.fn().mockResolvedValue(new Map()),
  obtenirConnecteur: jest.fn(),
  reinitialiserRegistry: jest.fn(),
}));

// Import du plugin APRÈS les mocks
const { default: enrichissementRoutes } = await import('../../src/routes/enrichissement.js');

// ---------------------------------------------------------------------------
// Setup Fastify de test
// ---------------------------------------------------------------------------

let fastify;

beforeAll(async () => {
  fastify = Fastify({ logger: false });
  await fastify.register(enrichissementRoutes, { prefix: '/api/enrichissement' });
  await fastify.ready();
});

afterAll(async () => {
  await fastify.close();
});

const HEADERS_VALIDES = { authorization: 'Bearer valide-token' };
const HEADERS_INVALIDES = {};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GET /api/enrichissement/connecteurs", () => {
  it("retourne 401 sans token", async () => {
    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/enrichissement/connecteurs',
      headers: HEADERS_INVALIDES,
    });
    expect(rep.statusCode).toBe(401);
  });

  it("retourne la liste des connecteurs avec un token valide", async () => {
    mockListerConnecteurs.mockResolvedValue(['wikidata', 'rdap', 'ign-ban']);

    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/enrichissement/connecteurs',
      headers: HEADERS_VALIDES,
    });

    expect(rep.statusCode).toBe(200);
    const body = rep.json();
    expect(body.connecteurs).toEqual(['wikidata', 'rdap', 'ign-ban']);
  });
});

describe("GET /api/enrichissement/connecteurs/ign-geoplateforme/wms-config", () => {
  it("retourne la config WMS sans token (auth optionnelle)", async () => {
    const rep = await fastify.inject({
      method: 'GET',
      url: '/api/enrichissement/connecteurs/ign-geoplateforme/wms-config',
    });

    expect(rep.statusCode).toBe(200);
    const body = rep.json();
    expect(body.urlBase).toBe('https://data.geopf.fr/wms-r');
    expect(Array.isArray(body.couchesDisponibles)).toBe(true);
  });
});

describe("POST /api/enrichissement/rechercher", () => {
  it("retourne 401 sans token", async () => {
    const rep = await fastify.inject({
      method: 'POST',
      url: '/api/enrichissement/rechercher',
      headers: HEADERS_INVALIDES,
      payload: { query: 'Macron', types: ['personne'] },
    });
    expect(rep.statusCode).toBe(401);
  });

  it("retourne 400 si la query est trop courte (< 2 chars)", async () => {
    const rep = await fastify.inject({
      method: 'POST',
      url: '/api/enrichissement/rechercher',
      headers: HEADERS_VALIDES,
      payload: { query: 'M', types: ['personne'] },
    });
    expect(rep.statusCode).toBe(400);
    const body = rep.json();
    expect(body.error).toBe('Données invalides');
  });

  it("retourne 400 si types est vide", async () => {
    const rep = await fastify.inject({
      method: 'POST',
      url: '/api/enrichissement/rechercher',
      headers: HEADERS_VALIDES,
      payload: { query: 'Macron', types: [] },
    });
    expect(rep.statusCode).toBe(400);
  });

  it("retourne 200 avec la preview pour une recherche valide", async () => {
    mockRechercherMultiConnecteurs.mockResolvedValue({
      resultats: [
        {
          typeSuggere: 'Personne',
          candidatsParChamp: {
            nom: [{ valeur: 'Macron', source: 'Wikidata', url: null, date: '2026-01-01' }],
          },
          liensSuggeres: [],
          identifiantsExternes: { wikidataId: 'Q11008' },
        },
      ],
      statutParConnecteur: { wikidata: 'ok' },
      dureeMs: 123,
    });

    const rep = await fastify.inject({
      method: 'POST',
      url: '/api/enrichissement/rechercher',
      headers: HEADERS_VALIDES,
      payload: { query: 'Macron', types: ['personne'] },
    });

    expect(rep.statusCode).toBe(200);
    const body = rep.json();
    expect(body.resultats).toHaveLength(1);
    expect(body.statutParConnecteur.wikidata).toBe('ok');
  });
});

describe("POST /api/enrichissement/importer", () => {
  const previewValide = {
    typeSuggere: 'Personne',
    candidatsParChamp: {
      nom: [{ valeur: 'Jean Dupont', source: 'Wikidata', url: null, date: '2026-01-01' }],
    },
    liensSuggeres: [],
    identifiantsExternes: { wikidataId: 'Q123' },
  };

  const choixValide = {
    champsRetenus: { nom: 'Wikidata' },
    liensRetenus: [],
    typeEntite: 'Personne',
  };

  it("retourne 401 sans token", async () => {
    const rep = await fastify.inject({
      method: 'POST',
      url: '/api/enrichissement/importer',
      headers: HEADERS_INVALIDES,
      payload: {
        preview: previewValide,
        choixUtilisateur: choixValide,
        qualiteInfluencePublique: 'ELU',
      },
    });
    expect(rep.statusCode).toBe(401);
  });

  it("retourne 403 si le seuil de gamification n'est pas atteint", async () => {
    mockPeutSoumettre.mockResolvedValue({
      autorise: false,
      validationsEffectuees: 2,
      seuilRequis: 5,
      restantes: 3,
    });

    const rep = await fastify.inject({
      method: 'POST',
      url: '/api/enrichissement/importer',
      headers: HEADERS_VALIDES,
      payload: {
        preview: previewValide,
        choixUtilisateur: choixValide,
        qualiteInfluencePublique: 'ELU',
      },
    });

    expect(rep.statusCode).toBe(403);
    const body = rep.json();
    expect(body.restantes).toBe(3);
  });

  it("retourne 400 si qualiteInfluencePublique est absent du body", async () => {
    mockPeutSoumettre.mockResolvedValue({ autorise: true, validationsEffectuees: 10, seuilRequis: 5, restantes: 0 });

    const rep = await fastify.inject({
      method: 'POST',
      url: '/api/enrichissement/importer',
      headers: HEADERS_VALIDES,
      payload: {
        preview: previewValide,
        choixUtilisateur: choixValide,
        // qualiteInfluencePublique absent
      },
    });

    expect(rep.statusCode).toBe(400);
  });

  it("retourne 201 pour un import nominal complet", async () => {
    mockPeutSoumettre.mockResolvedValue({
      autorise: true,
      validationsEffectuees: 10,
      seuilRequis: 5,
      restantes: 0,
    });
    mockImporter.mockResolvedValue({
      entitePrincipaleId: 'personne-new-id',
      entitesCreees: [{ type: 'Personne', id: 'personne-new-id' }],
      liensCrees: [],
    });

    const rep = await fastify.inject({
      method: 'POST',
      url: '/api/enrichissement/importer',
      headers: HEADERS_VALIDES,
      payload: {
        preview: previewValide,
        choixUtilisateur: choixValide,
        qualiteInfluencePublique: 'ELU',
      },
    });

    expect(rep.statusCode).toBe(201);
    const body = rep.json();
    expect(body.entitePrincipaleId).toBe('personne-new-id');
    expect(body.entitesCreees).toHaveLength(1);
  });
});
