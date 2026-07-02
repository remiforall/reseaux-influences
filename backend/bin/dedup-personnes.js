/**
 * dedup-personnes.js — Fusionne les nœuds Personne en doublon (même nom normalisé).
 *
 * Cause des doublons : une même personnalité créée par plusieurs seeds/importeurs quand la
 * clé de dédup (nom+prénom+dateNaissance) a échoué (date différente ou nulle).
 *
 * ⚠️ Lien.personneA/B est en onDelete: Cascade → on REPOINTE d'abord les liens vers le nœud
 * canonique, PUIS on supprime le redondant (sinon ses liens seraient cascadés/perdus).
 *
 * Canonique = celui avec wikidataId ; à défaut, celui qui a le plus de liens.
 * Match EXACT sur nom normalisé (prénom+nom) — aucune fusion floue.
 *
 * Usage : node bin/dedup-personnes.js [--dry]
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRY = process.argv.includes('--dry')
const norm = (s) => (s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ')

async function lienCount(id) {
  return prisma.lien.count({ where: { OR: [{ personneAId: id }, { personneBId: id }] } })
}

async function main() {
  const perss = await prisma.personne.findMany({
    select: { id: true, nom: true, prenom: true, wikidataId: true, createdAt: true },
  })
  const groupes = new Map()
  for (const p of perss) {
    const k = norm(`${p.prenom || ''} ${p.nom}`)
    if (!groupes.has(k)) groupes.set(k, [])
    groupes.get(k).push(p)
  }
  const dups = [...groupes.entries()].filter(([, v]) => v.length > 1)
  console.log(`${dups.length} groupe(s) de doublons.`)

  let fusionnes = 0
  for (const [cle, membres] of dups) {
    // score : wikidataId d'abord, puis nb de liens, puis ancienneté
    const avecCompte = []
    for (const m of membres) avecCompte.push({ ...m, nbLiens: await lienCount(m.id) })
    avecCompte.sort(
      (a, b) =>
        Number(!!b.wikidataId) - Number(!!a.wikidataId) ||
        b.nbLiens - a.nbLiens ||
        new Date(a.createdAt) - new Date(b.createdAt)
    )
    const canon = avecCompte[0]
    const redondants = avecCompte.slice(1)
    console.log(
      `• ${cle} → canonique ${canon.prenom || ''} ${canon.nom} (${canon.wikidataId || 'sans Q-id'}, ${canon.nbLiens} liens) ; fusionne ${redondants.length}`
    )
    if (DRY) continue
    // Récupérer un Q-id si le canonique n'en a pas mais un redondant oui
    if (!canon.wikidataId) {
      const avecQid = redondants.find((r) => r.wikidataId)
      if (avecQid) await prisma.personne.update({ where: { id: canon.id }, data: { wikidataId: avecQid.wikidataId } })
    }
    for (const r of redondants) {
      await prisma.lien.updateMany({ where: { personneAId: r.id }, data: { personneAId: canon.id } })
      await prisma.lien.updateMany({ where: { personneBId: r.id }, data: { personneBId: canon.id } })
      await prisma.personne.delete({ where: { id: r.id } })
      fusionnes++
    }
  }
  console.log(`\n${DRY ? '[DRY] ' : ''}${fusionnes} nœud(s) redondant(s) fusionné(s).`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('ERREUR dedup:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
