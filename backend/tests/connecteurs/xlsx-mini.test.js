/**
 * Tests du lecteur XLSX zéro-dépendance (xlsx-mini).
 * Construit un vrai .xlsx déflaté en mémoire (deflateRawSync + ZIP fait main)
 * pour exercer le chemin complet : lecture ZIP → inflate → parsing XML.
 */

import { describe, it, expect } from '@jest/globals'
import { deflateRawSync } from 'node:zlib'
import { lireXlsx } from '../../src/connecteurs/xlsx-mini.js'

/**
 * Construit un buffer .xlsx (ZIP method 8) à partir de {nom: contenu}.
 * CRC laissé à 0 (le lecteur ne le vérifie pas).
 */
function construireXlsx(fichiers) {
  const entrees = []
  const morceauxLocaux = []
  let offset = 0

  for (const [nom, contenu] of Object.entries(fichiers)) {
    const nomBuf = Buffer.from(nom, 'utf8')
    const data = Buffer.from(contenu, 'utf8')
    const comp = deflateRawSync(data)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(8, 8) // method = deflate
    local.writeUInt32LE(comp.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nomBuf.length, 26)
    morceauxLocaux.push(local, nomBuf, comp)

    entrees.push({ nom: nomBuf, compLen: comp.length, uncompLen: data.length, offset })
    offset += 30 + nomBuf.length + comp.length
  }

  const cdDebut = offset
  const morceauxCd = []
  for (const e of entrees) {
    const cd = Buffer.alloc(46)
    cd.writeUInt32LE(0x02014b50, 0)
    cd.writeUInt16LE(8, 10)
    cd.writeUInt32LE(e.compLen, 20)
    cd.writeUInt32LE(e.uncompLen, 24)
    cd.writeUInt16LE(e.nom.length, 28)
    cd.writeUInt32LE(e.offset, 42)
    morceauxCd.push(cd, e.nom)
    offset += 46 + e.nom.length
  }
  const cdTaille = offset - cdDebut

  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0)
  eocd.writeUInt16LE(entrees.length, 8)
  eocd.writeUInt16LE(entrees.length, 10)
  eocd.writeUInt32LE(cdTaille, 12)
  eocd.writeUInt32LE(cdDebut, 16)

  return Buffer.concat([...morceauxLocaux, ...morceauxCd, eocd])
}

const SHARED = `<?xml version="1.0"?><sst>
  <si><t>Name</t></si>
  <si><t>Country</t></si>
  <si><t>ACME Corp</t></si>
  <si><t>France</t></si>
</sst>`

// Ligne 2 : A=string ACME, B=string France, C=nombre brut, D=inlineStr, F=string (trou en E)
const SHEET = `<?xml version="1.0"?><worksheet><sheetData>
  <row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>
  <row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2" t="s"><v>3</v></c><c r="C2"><v>15000</v></c><c r="D2" t="inlineStr"><is><t>Inline</t></is></c><c r="F2" t="s"><v>2</v></c></row>
</sheetData></worksheet>`

describe('xlsx-mini — lireXlsx', () => {
  const buf = construireXlsx({
    'xl/sharedStrings.xml': SHARED,
    'xl/worksheets/sheet1.xml': SHEET,
  })

  it('lit les en-têtes via les chaînes partagées', () => {
    const lignes = lireXlsx(buf)
    expect(lignes[0]).toEqual(['Name', 'Country'])
  })

  it('résout les chaînes partagées des cellules de données', () => {
    const lignes = lireXlsx(buf)
    expect(lignes[1][0]).toBe('ACME Corp')
    expect(lignes[1][1]).toBe('France')
  })

  it('lit les nombres bruts et les inlineStr', () => {
    const lignes = lireXlsx(buf)
    expect(lignes[1][2]).toBe('15000')
    expect(lignes[1][3]).toBe('Inline')
  })

  it('comble les colonnes manquantes (trou en E → index 4 vide, F en index 5)', () => {
    const lignes = lireXlsx(buf)
    expect(lignes[1][4]).toBe('') // colonne E absente
    expect(lignes[1][5]).toBe('ACME Corp') // colonne F = index 5
  })

  it('lève une erreur sur un buffer non-ZIP', () => {
    expect(() => lireXlsx(Buffer.from('pas un zip'))).toThrow(/EOCD/)
  })
})
