/**
 * Tests du connecteur EU FTS (bénéficiaires du budget UE).
 * Construit un vrai .xlsx déflaté en mémoire (comme l'export FTS), stubbe le
 * téléchargement + la résolution d'URL. Couvre : parsing/agrégation, exclusion
 * des bénéficiaires masqués `*****`, recherche, mapping, montant max.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { deflateRawSync } from 'node:zlib'

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: jest.fn(() => 'hash-eu-fts-test'),
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

const { default: EuFtsConnecteur } = await import('../../../src/connecteurs/sources/eu-fts.js')

// --- Constructeur de .xlsx minimal (method 8) ---
function construireXlsx(fichiers) {
  const entrees = []
  const locaux = []
  let offset = 0
  for (const [nom, contenu] of Object.entries(fichiers)) {
    const nomBuf = Buffer.from(nom, 'utf8')
    const data = Buffer.from(contenu, 'utf8')
    const comp = deflateRawSync(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(8, 8)
    local.writeUInt32LE(comp.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nomBuf.length, 26)
    locaux.push(local, nomBuf, comp)
    entrees.push({ nom: nomBuf, compLen: comp.length, uncompLen: data.length, offset })
    offset += 30 + nomBuf.length + comp.length
  }
  const cdDebut = offset
  const cd = []
  for (const e of entrees) {
    const h = Buffer.alloc(46)
    h.writeUInt32LE(0x02014b50, 0)
    h.writeUInt16LE(8, 10)
    h.writeUInt32LE(e.compLen, 20)
    h.writeUInt32LE(e.uncompLen, 24)
    h.writeUInt16LE(e.nom.length, 28)
    h.writeUInt32LE(e.offset, 42)
    cd.push(h, e.nom)
    offset += 46 + e.nom.length
  }
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(entrees.length, 8)
  eocd.writeUInt16LE(entrees.length, 10)
  eocd.writeUInt32LE(offset - cdDebut, 12)
  eocd.writeUInt32LE(cdDebut, 16)
  return Buffer.concat([...locaux, ...cd, eocd])
}

// On construit la feuille à la main pour contrôler les indices de colonnes
// (FTS : E=4 nom, M=12 pays, Q-W=16-22 montants, AG=32 type).
function colRef(idx) {
  let s = ''
  idx += 1
  while (idx > 0) {
    const r = (idx - 1) % 26
    s = String.fromCharCode(65 + r) + s
    idx = Math.floor((idx - 1) / 26)
  }
  return s
}

function ligneXml(numero, valeursParIndex, ss) {
  const cells = Object.entries(valeursParIndex)
    .map(([idx, val]) => {
      const ref = `${colRef(Number(idx))}${numero}`
      if (typeof val === 'number') return `<c r="${ref}"><v>${val}</v></c>`
      const si = ss.indexOf(val)
      return `<c r="${ref}" t="s"><v>${si}</v></c>`
    })
    .join('')
  return `<row r="${numero}">${cells}</row>`
}

// Chaînes partagées
const SS = [
  'Name of beneficiary',
  'Beneficiary country',
  'Beneficiary type',
  'Programme name',
  'ACME RESEARCH GMBH',
  'Germany',
  'Private Companies',
  'Horizon Europe',
  'GREENPEACE EU',
  'Belgium',
  'Non Governmental Organisations (NGO)',
  'LIFE Programme',
]
const sharedXml = `<sst>${SS.map((t) => `<si><t>${t}</t></si>`).join('')}</sst>`

// En-tête (ligne 1) : on place au moins les colonnes utiles
const HEADER = ligneXml(
  1,
  {
    4: 'Name of beneficiary',
    12: 'Beneficiary country',
    32: 'Beneficiary type',
    29: 'Programme name',
  },
  SS,
)
// ACME : 2 engagements (montants 1M et 5M) → max 5M
const ACME1 = ligneXml(
  2,
  {
    4: 'ACME RESEARCH GMBH',
    12: 'Germany',
    32: 'Private Companies',
    29: 'Horizon Europe',
    19: 1000000,
  },
  SS,
)
const ACME2 = ligneXml(
  3,
  {
    4: 'ACME RESEARCH GMBH',
    12: 'Germany',
    32: 'Private Companies',
    29: 'Horizon Europe',
    20: 5000000,
  },
  SS,
)
// GREENPEACE : ONG
const GP = ligneXml(
  4,
  {
    4: 'GREENPEACE EU',
    12: 'Belgium',
    32: 'Non Governmental Organisations (NGO)',
    29: 'LIFE Programme',
    18: 250000,
  },
  SS,
)
// Ligne masquée (personne physique) → doit être écartée
const MASQUE = ligneXml(5, { 4: '*****', 12: 'France', 19: 9999 }, SS)

const sheetXml = `<worksheet><sheetData>${HEADER}${ACME1}${ACME2}${GP}${MASQUE}</sheetData></worksheet>`

const XLSX = construireXlsx({
  'xl/sharedStrings.xml': sharedXml,
  'xl/worksheets/sheet1.xml': sheetXml,
})

let connecteur

beforeEach(() => {
  connecteur = new EuFtsConnecteur()
  jest.spyOn(connecteur, '_resoudreUrl').mockResolvedValue('http://x/2024.xlsx')
  jest.spyOn(connecteur, '_telechargerBinaire').mockResolvedValue(XLSX)
})

describe('EuFtsConnecteur — parsing & agrégation', () => {
  it('agrège par bénéficiaire et exclut les lignes masquées *****', async () => {
    await connecteur._assurerIndex()
    // ACME + GREENPEACE = 2 entités (la ligne ***** est écartée)
    expect(connecteur._index).toHaveLength(2)
    const noms = connecteur._index.map((e) => e.nom).sort()
    expect(noms).toEqual(['ACME RESEARCH GMBH', 'GREENPEACE EU'])
  })

  it('retient le plus gros engagement et compte les lignes', async () => {
    await connecteur._assurerIndex()
    const acme = connecteur._index.find((e) => e.nom === 'ACME RESEARCH GMBH')
    expect(acme.nb).toBe(2)
    expect(acme.montantMax).toBe(5000000)
  })
})

describe('EuFtsConnecteur — rechercher() & mapping', () => {
  it('retourne vide pour une query trop courte sans télécharger', async () => {
    const res = await connecteur.rechercher('x')
    expect(res.resultats).toHaveLength(0)
    expect(connecteur._telechargerBinaire).not.toHaveBeenCalled()
  })

  it('mappe une entreprise (ENTREPRISE, montant formaté FR)', async () => {
    const res = await connecteur.rechercher('acme')
    expect(res.resultats).toHaveLength(1)
    const ent = res.resultats[0]
    expect(ent.type).toBe('Organisation')
    expect(ent.champs.typeOrganisation.valeur).toBe('ENTREPRISE')
    expect(ent.champs.qualiteInfluence.valeur).toBe('AUTRE')
    expect(ent.champs.pays.valeur).toBe('Germany')
    expect(ent.champs.financementUeMaxEur.valeur).toMatch(/5\s?000\s?000 €/)
    expect(ent.champs.programmesUe.valeur).toContain('Horizon Europe')
  })

  it('mappe une ONG (type NGO → ONG)', async () => {
    const res = await connecteur.rechercher('greenpeace')
    expect(res.resultats[0].champs.typeOrganisation.valeur).toBe('ONG')
  })
})

describe('EuFtsConnecteur — detailler() & listerLiens()', () => {
  it('detailler trouve par nom exact', async () => {
    const res = await connecteur.detailler('greenpeace eu')
    expect(res.entite.champs.pays.valeur).toBe('Belgium')
  })

  it('detailler retourne null si inconnu', async () => {
    const res = await connecteur.detailler('inexistant sarl')
    expect(res.entite).toBeNull()
  })

  it('listerLiens retourne vide', async () => {
    const res = await connecteur.listerLiens('acme research gmbh')
    expect(res.liens).toHaveLength(0)
  })
})
