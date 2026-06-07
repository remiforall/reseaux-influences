/**
 * Tests du connecteur Associations (RNA Waldec).
 * Couvre : parsing CSV point-virgule, mapping Organisation, filtrage actifs,
 * garde-fous éthiques, stubs index, listerLiens vide.
 */

import { describe, it, expect, jest } from '@jest/globals'

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: jest.fn(() => 'hash-assoc-test'),
  lireCache: jest.fn().mockResolvedValue(null),
  ecrireCache: jest.fn().mockResolvedValue(undefined),
  obtenirOuCalculer: (cle, ttlMs, fabrique) => fabrique(),
  reinitialiserEtatCache: jest.fn(),
}))

await jest.unstable_mockModule('../../../src/connecteurs/rate-limit.js', () => ({
  creerBucket: jest.fn(),
  consommer: jest.fn().mockResolvedValue(undefined),
  reinitialiserBuckets: jest.fn(),
  obtenirEtatBucket: jest.fn(),
}))

const { default: AssociationsConnecteur } =
  await import('../../../src/connecteurs/sources/associations.js')

/** Lignes CSV de fixture — format waldec (séparateur ';') */
const LIGNES_CSV_WALDEC = [
  // En-tête
  'id;siret;gestion;date_creat;date_decla;date_publi;date_dissolution;nature;groupement;titre;titre_court;objet;objet_social1;objet_social2;adrs_numvoie;adrs_typevoie;adrs_libvoie;adrs_bureau;adrs_codepostal;adrs_libcommune;adrs_rna;adrs_libpays;dir_civilite;telephone;email;site_web;etat_asso;regpar',
  // Association active
  "W751001234;;0;2010-03-15;2010-03-15;2010-04-01;;SIMPLE;;Greenpeace France;GPFR;Protection de l'environnement;;;23;RUE;DE LA PAIX;;75008;PARIS;8;;M;01 23 45 67 89;contact@greenpeace.fr;https://www.greenpeace.fr/;A;",
  // Association dissoute (ne doit pas être indexée)
  'W751009999;;0;2005-01-01;2005-01-01;2005-02-01;2020-06-30;SIMPLE;;Association Fantôme;AF;Objet quelconque;;;;;RUE;DES LILAS;;75010;PARIS;10;;M;;;; ;D;',
  // Association active sans sigle
  'W691002345;;0;2015-07-20;2015-07-20;2015-08-01;;SIMPLE;;Les Amis de la Nature;;Sensibilisation à la biodiversité;;;5;ALLEE;DES PLATANES;;69001;LYON;1;;Mme;;;;A;',
]

/**
 * Construit un connecteur avec un index pré-rempli depuis des lignes CSV.
 * Évite le téléchargement réel du dataset.
 */
function creerConnecteurAvecIndex(lignesCSV) {
  const connecteur = new AssociationsConnecteur()
  connecteur._indexNom = new Map()
  connecteur._indexId = new Map()
  connecteur._separateur = ';'

  const [lignEnTete, ...lignesData] = lignesCSV
  const enTetes = connecteur._parserLigneCSV(lignEnTete, ';')

  for (const ligne of lignesData) {
    const valeurs = connecteur._parserLigneCSV(ligne, ';')
    const obj = {}
    for (let i = 0; i < enTetes.length; i++) {
      obj[enTetes[i]] = valeurs[i] ?? ''
    }

    // Même logique de filtrage que _construireIndex
    const etat = (obj.etat_asso ?? '').trim().toUpperCase()
    if (etat !== 'A') continue

    const id = (obj.id ?? '').trim().toUpperCase()
    const titre = (obj.titre ?? '').trim()
    if (!id || !titre) continue

    connecteur._indexId.set(id, obj)
    const cle = titre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (cle && !connecteur._indexNom.has(cle)) {
      connecteur._indexNom.set(cle, obj)
    }
  }

  return connecteur
}

describe('AssociationsConnecteur — rechercher()', () => {
  it('retourne un tableau vide pour une query trop courte (< 3 caractères)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.rechercher('gp')
    expect(resultat.resultats).toHaveLength(0)
    expect(resultat.source).toBe('RNA — Répertoire National des Associations')
  })

  it('trouve Greenpeace France par nom', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.rechercher('Greenpeace')
    expect(resultat.resultats).toHaveLength(1)
    expect(resultat.resultats[0].champs.nom.valeur).toBe('Greenpeace France')
  })

  it('retourne le type Organisation', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.rechercher('Greenpeace')
    expect(resultat.resultats[0].type).toBe('Organisation')
  })

  it('positionne typeOrganisation à ASSOCIATION', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.rechercher('Greenpeace')
    expect(resultat.resultats[0].champs.typeOrganisation.valeur).toBe('ASSOCIATION')
  })

  it('positionne le pays à France', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.rechercher('Greenpeace')
    expect(resultat.resultats[0].champs.pays.valeur).toBe('France')
  })

  it('inclut le badge provenance avec source RNA (ADR-014)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.rechercher('Greenpeace')
    const badge = resultat.resultats[0].champs.badgeProvenance.valeur
    expect(badge.source).toContain('RNA')
    expect(badge.statut).toBe('EN_ATTENTE')
  })

  it('applique le statut EN_ATTENTE par défaut (ADR-006, ADR-013)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.rechercher('Greenpeace')
    expect(resultat.resultats[0].champs.statut.valeur).toBe('EN_ATTENTE')
  })

  it('exclut les associations dissoutes (etat_asso = D)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.rechercher('Fantôme')
    expect(resultat.resultats).toHaveLength(0)
  })

  it('trouve une association active par terme partiel', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.rechercher('Nature')
    expect(resultat.resultats.length).toBeGreaterThanOrEqual(1)
  })

  it('retourne [] si aucune correspondance', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.rechercher('introuvable_xyz_999')
    expect(resultat.resultats).toHaveLength(0)
  })
})

describe('AssociationsConnecteur — detailler()', () => {
  it("retourne l'entité par ID RNA", async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.detailler('W751001234')
    expect(resultat.entite).not.toBeNull()
    expect(resultat.entite.champs.nom.valeur).toBe('Greenpeace France')
  })

  it('retourne entite null pour un ID inconnu', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.detailler('W999999999')
    expect(resultat.entite).toBeNull()
  })
})

describe('AssociationsConnecteur — listerLiens()', () => {
  it('retourne un tableau de liens vide (aucun dirigeant dans le CSV waldec)', async () => {
    const connecteur = creerConnecteurAvecIndex(LIGNES_CSV_WALDEC)
    const resultat = await connecteur.listerLiens('W751001234')
    expect(resultat.liens).toHaveLength(0)
    expect(resultat.note).toBeDefined()
    expect(resultat.note).toContain('JOAFE')
  })
})

describe('AssociationsConnecteur — _parserLigneCSV()', () => {
  it('parse une ligne avec séparateur point-virgule', () => {
    const connecteur = new AssociationsConnecteur()
    connecteur._indexNom = new Map()
    connecteur._indexId = new Map()
    const champs = connecteur._parserLigneCSV('W751001234;123456789;0;2010-01-01', ';')
    expect(champs[0]).toBe('W751001234')
    expect(champs[1]).toBe('123456789')
    expect(champs[3]).toBe('2010-01-01')
  })

  it('gère les champs entre guillemets contenant le séparateur', () => {
    const connecteur = new AssociationsConnecteur()
    connecteur._indexNom = new Map()
    connecteur._indexId = new Map()
    const champs = connecteur._parserLigneCSV('"Association ; du coin";PARIS', ';')
    expect(champs[0]).toBe('Association ; du coin')
    expect(champs[1]).toBe('PARIS')
  })
})
