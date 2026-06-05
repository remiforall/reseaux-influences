/**
 * Tests du connecteur DataESR.
 * Couvre : recherche standard, cas vide, erreur HTTP 4xx, mapping Organisation.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

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

const { default: DataEsrConnecteur } = await import(
  '../../../src/connecteurs/sources/dataesr.js'
);

/** Fixture simulant une reponse DataESR pour une structure de recherche. */
const FIXTURE_REPONSE_DATAESR = {
  total_count: 1,
  results: [
    {
      uai: '0751717J',
      libelle: 'Laboratoire de Recherche en Informatique',
      uo_lib: 'LRI',
      sigle: 'LRI',
      siret: '19751062700014',
      ville_principale: 'Orsay',
      tutelle_principale: 'CNRS',
      tutelle_secondaire_1: "Universite Paris-Saclay",
      effectifs: 250,
    },
  ],
};

describe('DataEsrConnecteur — rechercher()', () => {
  it('retourne un tableau vide pour une query trop courte', async () => {
    const connecteur = new DataEsrConnecteur();
    const resultat = await connecteur.rechercher('a');
    expect(resultat.resultats).toHaveLength(0);
    expect(resultat.source).toBe('DataESR');
  });

  it('retourne un tableau vide pour une query vide', async () => {
    const connecteur = new DataEsrConnecteur();
    const resultat = await connecteur.rechercher('');
    expect(resultat.resultats).toHaveLength(0);
  });

  it('mappe correctement un laboratoire de recherche', async () => {
    const connecteur = new DataEsrConnecteur();
    connecteur._appelHttp = jest.fn().mockResolvedValue(FIXTURE_REPONSE_DATAESR);

    const resultat = await connecteur.rechercher('LRI');

    expect(resultat.resultats).toHaveLength(1);
    const entite = resultat.resultats[0];
    expect(entite.type).toBe('Organisation');
    expect(entite.champs.nom.valeur).toBe('Laboratoire de Recherche en Informatique');
    expect(entite.champs.sigle.valeur).toBe('LRI');
    expect(entite.champs.pays.valeur).toBe('France');
    expect(entite.champs.codeUai.valeur).toBe('0751717J');
    expect(entite.champs.tutellePrincipale.valeur).toBe('CNRS');
    expect(entite.champs.nom.source).toBe('DataESR');
  });

  it('genere des liens de tutelle vers les etablissements de rattachement', async () => {
    const connecteur = new DataEsrConnecteur();
    connecteur._appelHttp = jest.fn().mockResolvedValue(FIXTURE_REPONSE_DATAESR);

    const resultat = await connecteur.rechercher('LRI');
    const liens = resultat.resultats[0].liensSuggeres;

    expect(liens.length).toBeGreaterThanOrEqual(1);
    const lienCnrs = liens.find((l) => l.vers.identifiantExterne === 'CNRS');
    expect(lienCnrs).toBeDefined();
    expect(lienCnrs.typeLienCode).toBe('institutionnel');
  });

  it("leve une erreur si l'API retourne une erreur 4xx", async () => {
    const connecteur = new DataEsrConnecteur();
    const erreur = new Error('[dataesr] HTTP 429 sur ...');
    erreur.status = 429;
    connecteur._appelHttp = jest.fn().mockRejectedValue(erreur);

    await expect(connecteur.rechercher('LRI')).rejects.toThrow('HTTP 429');
  });
});

describe('DataEsrConnecteur — detailler()', () => {
  it('retourne null pour un id vide', async () => {
    const connecteur = new DataEsrConnecteur();
    const resultat = await connecteur.detailler('');
    expect(resultat.entite).toBeNull();
  });

  it('mappe correctement un resultat par UAI', async () => {
    const connecteur = new DataEsrConnecteur();
    connecteur._appelHttp = jest.fn().mockResolvedValue(FIXTURE_REPONSE_DATAESR);

    const resultat = await connecteur.detailler('0751717J');
    expect(resultat.entite).not.toBeNull();
    expect(resultat.entite.champs.codeUai.valeur).toBe('0751717J');
  });
});
