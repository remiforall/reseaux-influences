/**
 * Tests du connecteur Cour des comptes.
 * Couvre : parsing RSS, filtrage par terme, typeMedia DOCUMENT_OFFICIEL, cas vide.
 */

import { describe, it, expect, jest } from '@jest/globals';

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: () => 'hash-ccomptes-test',
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

const { default: CourDesComptesConnecteur } = await import(
  '../../../src/connecteurs/sources/cour-des-comptes.js'
);

/** Fixture RSS Cour des comptes avec 3 rapports */
const FIXTURE_RSS_CCOMPTES = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Cour des comptes — Publications</title>
    <item>
      <title>Rapport sur la gestion des communes de plus de 10 000 habitants</title>
      <link>https://www.ccomptes.fr/fr/publications/rapport-gestion-communes</link>
      <pubDate>Wed, 20 Mar 2024 08:00:00 +0000</pubDate>
      <description>Analyse des finances et de la gouvernance des communes françaises.</description>
    </item>
    <item>
      <title>Avis sur le budget de l'État 2025</title>
      <link>https://www.ccomptes.fr/fr/publications/avis-budget-etat-2025</link>
      <pubDate>Mon, 15 Oct 2024 10:30:00 +0000</pubDate>
      <description>Observations de la Cour sur le projet de loi de finances pour 2025.</description>
    </item>
    <item>
      <title>Rapport sur les aides aux entreprises pendant la crise</title>
      <link>https://www.ccomptes.fr/fr/publications/rapport-aides-entreprises-crise</link>
      <pubDate>Fri, 05 Apr 2024 09:00:00 +0000</pubDate>
      <description>Évaluation des dispositifs d'aide aux entreprises mis en place durant la crise sanitaire.</description>
    </item>
  </channel>
</rss>`;

describe('CourDesComptesConnecteur — rechercher()', () => {
  it('retourne un tableau vide pour une query vide', async () => {
    const connecteur = new CourDesComptesConnecteur();
    const resultat = await connecteur.rechercher('');
    expect(resultat.resultats).toHaveLength(0);
    expect(resultat.sources).toHaveLength(0);
    expect(resultat.source).toBe('Cour des comptes');
  });

  it('filtre correctement les rapports matchant le terme', async () => {
    const connecteur = new CourDesComptesConnecteur();
    connecteur._telechargerRss = jest.fn().mockResolvedValue(FIXTURE_RSS_CCOMPTES);

    const resultat = await connecteur.rechercher('communes');

    expect(resultat.resultats).toHaveLength(0); // pas de nouvelles entités
    expect(resultat.sources).toHaveLength(1);
    expect(resultat.sources[0].titre).toContain('communes');
    expect(resultat.sources[0].typeMedia).toBe('DOCUMENT_OFFICIEL');
    expect(resultat.sources[0].media).toBe('Cour des comptes');
    expect(resultat.sources[0].paysMedia).toBe('France');
  });

  it('différencie le typeMedia DOCUMENT_OFFICIEL (vs PRESSE_ECRITE pour Anticor)', async () => {
    const connecteur = new CourDesComptesConnecteur();
    connecteur._telechargerRss = jest.fn().mockResolvedValue(FIXTURE_RSS_CCOMPTES);

    const resultat = await connecteur.rechercher('budget');
    expect(resultat.sources[0].typeMedia).toBe('DOCUMENT_OFFICIEL');
    expect(resultat.sources[0].paysMedia).toBe('France');
    expect(resultat.sources[0].auteur).toBe('Cour des comptes');
  });

  it('retourne [] si aucun rapport ne matche', async () => {
    const connecteur = new CourDesComptesConnecteur();
    connecteur._telechargerRss = jest.fn().mockResolvedValue(FIXTURE_RSS_CCOMPTES);

    const resultat = await connecteur.rechercher('xyz_introuvable_456');
    expect(resultat.sources).toHaveLength(0);
  });
});

describe('CourDesComptesConnecteur — _parserRss()', () => {
  it('extrait les 3 items de la fixture', () => {
    const connecteur = new CourDesComptesConnecteur();
    const items = connecteur._parserRss(FIXTURE_RSS_CCOMPTES);
    expect(items).toHaveLength(3);
    expect(items[1].url).toContain('avis-budget');
    expect(items[1].datePublication).toMatch(/2024/);
  });

  it('retourne [] pour XML vide', () => {
    const connecteur = new CourDesComptesConnecteur();
    expect(connecteur._parserRss('')).toHaveLength(0);
  });
});
