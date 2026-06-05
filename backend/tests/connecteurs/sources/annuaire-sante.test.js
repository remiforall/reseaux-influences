/**
 * Tests du connecteur Annuaire Santé RPPS.
 * Couvre : parsing CSV (séparateur ';' et '|'), mapping Personne, garde-fous RGPD,
 * limites de résultats, detailler() désactivé, listerLiens() vide.
 */

import { describe, it, expect, jest } from '@jest/globals';

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: jest.fn(() => 'hash-sante-test'),
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

const { default: AnnuaireSanteConnecteur } = await import(
  '../../../src/connecteurs/sources/annuaire-sante.js'
);

/** Lignes CSV de fixture — format RPPS avec séparateur ';' */
const LIGNES_CSV_RPPS_PV = [
  // En-tête
  "Identifiant PP;Nom d'exercice;Prénom d'exercice;Profession;Spécialité ordinale;Mode d'exercice;Genre d'activité",
  // Données
  '10000123456;DUPONT;Jean;Médecin;Médecine générale;Libéral;Cabinet individuel',
  '10000123457;DUPONT;Marie;Médecin;Cardiologie;Libéral;Cabinet de groupe',
  '10000123458;MARTIN;Pierre;Pharmacien;Pharmacien officinal;Salarié;Officine',
  '10000123459;DURAND;Sophie;Sage-femme;;Libéral;Cabinet individuel',
];

/** Lignes CSV de fixture — format RPPS avec séparateur '|' */
const LIGNES_CSV_RPPS_PIPE = [
  "Identifiant PP|Nom d'exercice|Prénom d'exercice|Profession|Spécialité ordinale|Mode d'exercice",
  '10000999001|BERNARD|Lucie|Médecin|Pédiatrie|Libéral',
  '10000999002|BERNARD|Paul|Dentiste||Libéral',
];

/**
 * Construit un connecteur avec un index pré-rempli depuis des lignes CSV.
 * Évite le téléchargement réel du dataset.
 *
 * @param {string[]} lignesCSV
 * @param {string} [separateur=';']
 */
function creerConnecteurAvecIndex(lignesCSV, separateur = ';') {
  const connecteur = new AnnuaireSanteConnecteur();
  connecteur._indexNom = new Map();
  connecteur._separateur = separateur;

  const [lignEnTete, ...lignesData] = lignesCSV;
  const enTetes = connecteur._parserLigne(lignEnTete, separateur);

  for (const ligne of lignesData) {
    const valeurs = connecteur._parserLigne(ligne, separateur);
    const obj = {};
    for (let i = 0; i < enTetes.length; i++) {
      obj[enTetes[i]] = valeurs[i] ?? '';
    }

    const nomExercice = (obj["Nom d'exercice"] ?? obj.Nom ?? '').trim();
    if (!nomExercice) continue;

    const cle = nomExercice
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cle && !connecteur._indexNom.has(cle)) {
      connecteur._indexNom.set(cle, obj);
    }
  }

  return connecteur;
}

describe('AnnuaireSanteConnecteur — rechercher()', () => {
  it('retourne un tableau vide pour une query trop courte (< 3 caractères — ADR-014)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.rechercher('Du');
    expect(resultat.resultats).toHaveLength(0);
    expect(resultat.source).toBe('Annuaire Santé RPPS');
  });

  it('retourne une personne par nom de famille', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.rechercher('Dupont');
    expect(resultat.resultats.length).toBeGreaterThanOrEqual(1);
  });

  it('retourne le type Personne', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.rechercher('Dupont');
    expect(resultat.resultats[0].type).toBe('Personne');
  });

  it('inclut le nom mappé dans les champs', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.rechercher('Dupont');
    expect(resultat.resultats[0].champs.nom.valeur).toBe('DUPONT');
  });

  it('inclut le prénom mappé', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.rechercher('Dupont');
    const prenom = resultat.resultats[0].champs.prenom.valeur;
    // L'index ne stocke que la première occurrence (DUPONT Jean ici)
    expect(prenom).toBe('Jean');
  });

  it('inclut le rôle principal (profession + spécialité)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.rechercher('Martin');
    const role = resultat.resultats[0].champs.rolePrincipal.valeur;
    expect(role).toContain('Pharmacien');
  });

  it('applique qualiteInfluence AUTRE par défaut (ADR-014)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.rechercher('Dupont');
    expect(resultat.resultats[0].champs.qualiteInfluence.valeur).toBe('AUTRE');
  });

  it('applique le statut EN_ATTENTE par défaut (ADR-006, ADR-014)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.rechercher('Dupont');
    expect(resultat.resultats[0].champs.statut.valeur).toBe('EN_ATTENTE');
  });

  it('inclut le badge provenance avec avertissement RGPD art. 85 (ADR-014)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.rechercher('Dupont');
    const badge = resultat.resultats[0].champs.badgeProvenance.valeur;
    expect(badge.source).toBe('Annuaire Santé RPPS');
    expect(badge.avertissement).toContain('article 85 RGPD');
    expect(badge.statut).toBe('EN_ATTENTE');
  });

  it('inclut un avertissement global dans la réponse (ADR-014)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.rechercher('Dupont');
    expect(resultat.avertissement).toBeDefined();
    expect(resultat.avertissement).toContain('RGPD');
  });

  it('respecte la limite max 25 résultats (garde-fou RGPD ADR-014)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    // Demande une limite > 25
    const resultat = await connecteur.rechercher('Dup', { limite: 100 });
    // Le plafond ne peut dépasser 25 même si demandé plus
    expect(resultat.resultats.length).toBeLessThanOrEqual(25);
  });

  it('fonctionne avec un CSV à séparateur pipe (|)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PIPE, '|');
    const resultat = await connecteur.rechercher('Bernard');
    expect(resultat.resultats.length).toBeGreaterThanOrEqual(1);
    expect(resultat.resultats[0].champs.nom.valeur).toBe('BERNARD');
  });

  it('retourne [] si aucune correspondance', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.rechercher('introuvable_xyz_999');
    expect(resultat.resultats).toHaveLength(0);
  });
});

describe('AnnuaireSanteConnecteur — detailler()', () => {
  it('retourne entite null et une note explicative (méthode désactivée ADR-014)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.detailler('10000123456');
    expect(resultat.entite).toBeNull();
    expect(resultat.note).toBeDefined();
    expect(resultat.note).toContain('ADR-014');
  });
});

describe('AnnuaireSanteConnecteur — listerLiens()', () => {
  it('retourne un tableau de liens vide (croisement Transparence Santé post-MVP)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_RPPS_PV);
    const resultat = await connecteur.listerLiens('10000123456');
    expect(resultat.liens).toHaveLength(0);
    expect(resultat.note).toBeDefined();
    expect(resultat.note).toContain('Transparence Santé');
  });
});

describe('AnnuaireSanteConnecteur — _parserLigne()', () => {
  it('parse une ligne avec séparateur point-virgule', () => {
    const connecteur = new AnnuaireSanteConnecteur();
    connecteur._indexNom = new Map();
    const champs = connecteur._parserLigne('10000123456;DUPONT;Jean;Médecin', ';');
    expect(champs[0]).toBe('10000123456');
    expect(champs[1]).toBe('DUPONT');
    expect(champs[3]).toBe('Médecin');
  });

  it('parse une ligne avec séparateur pipe', () => {
    const connecteur = new AnnuaireSanteConnecteur();
    connecteur._indexNom = new Map();
    const champs = connecteur._parserLigne('10000999001|BERNARD|Lucie|Médecin', '|');
    expect(champs[1]).toBe('BERNARD');
    expect(champs[2]).toBe('Lucie');
  });

  it('gère les guillemets avec séparateur interne', () => {
    const connecteur = new AnnuaireSanteConnecteur();
    connecteur._indexNom = new Map();
    const champs = connecteur._parserLigne('"DUPONT;MARTIN";Jean;Médecin', ';');
    expect(champs[0]).toBe('DUPONT;MARTIN');
    expect(champs[1]).toBe('Jean');
  });
});
