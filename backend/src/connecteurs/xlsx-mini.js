/**
 * @module xlsx-mini
 * Lecteur XLSX minimal, **zéro dépendance** (politique du projet — pas de
 * SheetJS ni xml-js). Un `.xlsx` est une archive ZIP de fichiers XML ; on
 * lit l'archive via le répertoire central, on décompresse avec `zlib` natif
 * (`inflateRawSync`), puis on parse `sharedStrings.xml` et la première feuille
 * par regex.
 *
 * Limites assumées : pas de ZIP64 (suffisant — entrées < 4 Go, < 65535), pas
 * de styles/formats de date (les valeurs sont renvoyées telles quelles). Conçu
 * pour des exports gouvernementaux tabulaires simples (ex : FTS UE, ADR-024).
 */

import { inflateRawSync } from 'node:zlib'

/** Décode les entités XML fréquentes. */
function decoderXml(t) {
  if (!t) return t
  return t
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
}

/** 'A'→0, 'Z'→25, 'AA'→26, 'AB'→27… (lettres d'une référence de cellule). */
function indexColonne(ref) {
  const m = ref.match(/^([A-Z]+)/)
  if (!m) return 0
  let n = 0
  for (const ch of m[1]) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n - 1
}

/**
 * Lit le répertoire central d'un ZIP et décompresse les entrées dont le nom
 * passe le filtre `besoin`. Utilise les tailles du répertoire central (fiables
 * même avec data descriptor).
 *
 * @param {Buffer} buf
 * @param {(nom: string) => boolean} besoin
 * @returns {Map<string, Buffer>}
 */
function lireZip(buf, besoin) {
  // End Of Central Directory : signature 0x06054b50, dans les ~64 Ko de fin.
  let eocd = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd === -1) throw new Error('[xlsx-mini] ZIP invalide : EOCD introuvable')

  const nbEntrees = buf.readUInt16LE(eocd + 10)
  let off = buf.readUInt32LE(eocd + 16)
  const fichiers = new Map()

  for (let i = 0; i < nbEntrees; i++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) break
    const methode = buf.readUInt16LE(off + 10)
    const tailleComp = buf.readUInt32LE(off + 20)
    const nameLen = buf.readUInt16LE(off + 28)
    const extraLen = buf.readUInt16LE(off + 30)
    const commentLen = buf.readUInt16LE(off + 32)
    const localOff = buf.readUInt32LE(off + 42)
    const nom = buf.toString('utf8', off + 46, off + 46 + nameLen)

    if (besoin(nom)) {
      // En-tête local : longueurs propres (peuvent différer du central).
      const lNameLen = buf.readUInt16LE(localOff + 26)
      const lExtraLen = buf.readUInt16LE(localOff + 28)
      const debut = localOff + 30 + lNameLen + lExtraLen
      const comp = buf.subarray(debut, debut + tailleComp)
      fichiers.set(nom, methode === 8 ? inflateRawSync(comp) : Buffer.from(comp))
    }

    off += 46 + nameLen + extraLen + commentLen
  }
  return fichiers
}

/**
 * Parse `sharedStrings.xml` → tableau de chaînes (concatène les runs `<t>`).
 * @param {Buffer|undefined} buf
 * @returns {string[]}
 */
function parserSharedStrings(buf) {
  if (!buf) return []
  const xml = buf.toString('utf8')
  const out = []
  const regexSi = /<si>([\s\S]*?)<\/si>/g
  let m
  while ((m = regexSi.exec(xml)) !== null) {
    const morceaux = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1])
    out.push(decoderXml(morceaux.join('')))
  }
  return out
}

/**
 * Parse une feuille → tableau de lignes, chaque ligne étant un tableau de
 * chaînes indexé par colonne (trous comblés par '').
 *
 * @param {Buffer} buf
 * @param {string[]} sharedStrings
 * @returns {string[][]}
 */
function parserFeuille(buf, sharedStrings) {
  const xml = buf.toString('utf8')
  const lignes = []
  const regexRow = /<row[^>]*>([\s\S]*?)<\/row>/g
  let mr
  while ((mr = regexRow.exec(xml)) !== null) {
    const cellules = []
    const regexCell = /<c\s+r="([A-Z]+\d+)"([^>]*)>([\s\S]*?)<\/c>|<c\s+r="([A-Z]+\d+)"([^>]*)\/>/g
    let mc
    while ((mc = regexCell.exec(mr[1])) !== null) {
      const ref = mc[1] ?? mc[4]
      const attrs = mc[2] ?? mc[5] ?? ''
      const contenu = mc[3] ?? ''
      const col = indexColonne(ref)

      let valeur = ''
      const vMatch = contenu.match(/<v>([\s\S]*?)<\/v>/)
      const isMatch = contenu.match(/<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>[\s\S]*?<\/is>/)
      if (vMatch) {
        valeur = vMatch[1]
        if (/\bt="s"/.test(attrs)) valeur = sharedStrings[Number(valeur)] ?? ''
        else valeur = decoderXml(valeur)
      } else if (isMatch) {
        valeur = decoderXml(isMatch[1])
      }
      cellules[col] = valeur
    }
    for (let i = 0; i < cellules.length; i++) if (cellules[i] === undefined) cellules[i] = ''
    lignes.push(cellules)
  }
  return lignes
}

/**
 * Lit un buffer `.xlsx` et renvoie les lignes de la première feuille (en-tête
 * inclus en première ligne).
 *
 * @param {Buffer} buffer - contenu binaire du fichier .xlsx
 * @returns {string[][]} lignes (tableaux de chaînes)
 */
export function lireXlsx(buffer) {
  const fichiers = lireZip(
    buffer,
    (n) => n === 'xl/sharedStrings.xml' || /^xl\/worksheets\/sheet\d+\.xml$/.test(n),
  )
  const sharedStrings = parserSharedStrings(fichiers.get('xl/sharedStrings.xml'))
  const nomFeuille = [...fichiers.keys()]
    .filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))
    .sort()[0]
  if (!nomFeuille) throw new Error('[xlsx-mini] aucune feuille trouvée')
  return parserFeuille(fichiers.get(nomFeuille), sharedStrings)
}
