/**
 * Script de seeding démo — phase alpha fermée (ADR-010).
 *
 * Insère un mini-corpus de 6 entités + 5 liens + leurs sources pour
 * exercer immédiatement le graphe et la modération sans dépendre des
 * connecteurs OSINT (Wikidata/RDAP/IGN) — pratique en avion ou si l'API
 * Wikidata est lente.
 *
 * Idempotent : peut être relancé sans créer de doublons (upsert par
 * wikidataId / domaine / email + nettoyage ciblé des liens).
 *
 * Usage :
 *   cd backend && node bin/seed-demo.js
 *   cd backend && node bin/seed-demo.js --reset   # supprime puis recrée
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const RESET = process.argv.includes('--reset');

// ---------------------------------------------------------------------------
// Données démo — Sphère Bolloré + Macron (cf. CONTENT-STRATEGY.md §seeding)
// ---------------------------------------------------------------------------

const USER_DEMO = {
  email: 'remi@reseauxinfluences.fr',
  motDePasse: 'AlphaDev2026!',
  nom: 'Rémi Vincent',
  pseudo: 'remi',
  role: 'ADMIN',
};

const PERSONNES = [
  {
    nom: 'Macron',
    prenom: 'Emmanuel',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1977-12-21'),
    rolePrincipal: 'Président de la République française',
    bio: "Président de la République depuis mai 2017. Ancien ministre de l'Économie.",
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Emmanuel_Macron',
    wikidataId: 'Q3052772',
    qualiteInfluence: 'ELU',
  },
  {
    nom: 'Bolloré',
    prenom: 'Vincent',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1952-04-01'),
    rolePrincipal: 'Industriel, président du Conseil de surveillance de Vivendi',
    bio: 'Dirigeant du groupe Bolloré, président du Conseil de surveillance de Vivendi.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Vincent_Bollor%C3%A9',
    wikidataId: 'Q2519614',
    qualiteInfluence: 'DIRIGEANT',
  },
  {
    nom: 'Bolloré',
    prenom: 'Yannick',
    pays: 'France',
    nationalite: 'française',
    dateNaissance: new Date('1979-08-08'),
    rolePrincipal: 'Président du Conseil de surveillance de Vivendi',
    bio: 'Fils de Vincent Bolloré, dirigeant de Havas et Vivendi.',
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Yannick_Bollor%C3%A9',
    wikidataId: 'Q1389428',
    qualiteInfluence: 'DIRIGEANT',
  },
];

const ORGANISATIONS = [
  {
    nom: 'Vivendi',
    sigle: 'VIV',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.vivendi.com',
    description: 'Groupe français de médias, divertissement et communication.',
    dateCreation: new Date('1853-12-14'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Vivendi',
    wikidataId: 'Q166877',
    qualiteInfluence: 'EDITEUR_PRESSE',
  },
  {
    nom: 'Bolloré SE',
    sigle: 'BOL',
    typeOrganisation: 'ENTREPRISE',
    pays: 'France',
    siteWeb: 'https://www.bollore.com',
    description: 'Conglomérat industriel français — transport, médias, plantations.',
    dateCreation: new Date('1822-02-02'),
    wikipediaUrl: 'https://fr.wikipedia.org/wiki/Groupe_Bollor%C3%A9',
    wikidataId: 'Q894664',
    qualiteInfluence: 'DIRIGEANT',
  },
];

const SITES_WEB = [
  {
    domaine: 'cnews.fr',
    url: 'https://www.cnews.fr',
    titre: 'CNews',
    description: "Chaîne d'information en continu du groupe Canal+ (Vivendi).",
    registrar: 'OVHcloud',
    hebergeurProbable: 'OVH',
    nameservers: ['dns1.ovh.net', 'dns2.ovh.net'],
    qualiteInfluence: 'EDITEUR_SITE',
  },
];

const LIENS = [
  {
    deA: { type: 'Personne', wikidataId: 'Q2519614' },
    versB: { type: 'Organisation', wikidataId: 'Q894664' },
    typeLienCode: 'DIRIGEANT',
    description: 'Vincent Bolloré dirige le groupe Bolloré SE.',
  },
  {
    deA: { type: 'Personne', wikidataId: 'Q2519614' },
    versB: { type: 'Organisation', wikidataId: 'Q166877' },
    typeLienCode: 'DIRIGEANT',
    description: 'Vincent Bolloré préside le Conseil de surveillance de Vivendi.',
  },
  {
    deA: { type: 'Personne', wikidataId: 'Q1389428' },
    versB: { type: 'Organisation', wikidataId: 'Q166877' },
    typeLienCode: 'DIRIGEANT',
    description: 'Yannick Bolloré est président du Conseil de surveillance de Vivendi.',
  },
  {
    deA: { type: 'Organisation', wikidataId: 'Q894664' },
    versB: { type: 'Organisation', wikidataId: 'Q166877' },
    typeLienCode: 'FONDATEUR',
    description: 'Le groupe Bolloré est actionnaire de référence de Vivendi.',
  },
  {
    deA: { type: 'Organisation', wikidataId: 'Q166877' },
    versB: { type: 'SiteWeb', domaine: 'cnews.fr' },
    typeLienCode: 'EDITEUR_DU_SITE',
    description: 'Vivendi (via Canal+) édite la chaîne et le site CNews.',
  },
];

const SOURCES = {
  bollore_vivendi: {
    url: 'https://www.lemonde.fr/actualite-medias/article/2024/04/15/bollore-vivendi.html',
    titre: 'Bolloré et Vivendi — analyse du contrôle capitalistique',
    media: 'Le Monde',
    typeMedia: 'PRESSE_ECRITE',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-04-15'),
    auteur: 'Rédaction Médias',
  },
  cnews_editeur: {
    url: 'https://www.cnews.fr/mentions-legales',
    titre: 'Mentions légales CNews',
    media: 'CNews',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2024-01-01'),
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function upsertUserDemo() {
  const motDePasseHash = await bcrypt.hash(USER_DEMO.motDePasse, 10);
  const user = await prisma.utilisateur.upsert({
    where: { email: USER_DEMO.email },
    update: { role: USER_DEMO.role, nom: USER_DEMO.nom, pseudo: USER_DEMO.pseudo },
    create: { ...USER_DEMO, motDePasseHash, motDePasse: undefined },
  });
  console.log(`✓ User demo : ${user.email} (id=${user.id}, role=${user.role})`);
  return user;
}

async function upsertPersonne(data, userId) {
  const existing = await prisma.personne.findFirst({ where: { wikidataId: data.wikidataId } });
  if (existing) {
    return prisma.personne.update({
      where: { id: existing.id },
      data: { ...data, statut: 'VALIDE' },
    });
  }
  return prisma.personne.create({ data: { ...data, statut: 'VALIDE', creeParId: userId } });
}

async function upsertOrganisation(data, userId) {
  const existing = await prisma.organisation.findFirst({ where: { wikidataId: data.wikidataId } });
  if (existing) {
    return prisma.organisation.update({
      where: { id: existing.id },
      data: { ...data, statut: 'VALIDE' },
    });
  }
  return prisma.organisation.create({ data: { ...data, statut: 'VALIDE', creeParId: userId } });
}

async function upsertSiteWeb(data, userId) {
  return prisma.siteWeb.upsert({
    where: { domaine: data.domaine },
    update: { ...data, statut: 'VALIDE' },
    create: { ...data, statut: 'VALIDE', creeParId: userId },
  });
}

async function trouverEntite(ref, index) {
  if (ref.type === 'Personne') {
    return prisma.personne.findFirst({ where: { wikidataId: ref.wikidataId } });
  }
  if (ref.type === 'Organisation') {
    return prisma.organisation.findFirst({ where: { wikidataId: ref.wikidataId } });
  }
  if (ref.type === 'SiteWeb') {
    return prisma.siteWeb.findUnique({ where: { domaine: ref.domaine } });
  }
  throw new Error(`[seed-demo] Type d'entité inconnu (lien #${index}) : ${ref.type}`);
}

function fkPourEntite(ref, entite, position) {
  const suffix = position === 'A' ? 'AId' : 'BId';
  if (ref.type === 'Personne') return { [`personne${suffix}`]: entite.id };
  if (ref.type === 'Organisation') return { [`organisation${suffix}`]: entite.id };
  if (ref.type === 'SiteWeb') return { [`siteWeb${suffix}`]: entite.id };
  throw new Error(`[seed-demo] Type inconnu : ${ref.type}`);
}

async function upsertSource(key) {
  const data = SOURCES[key];
  const existing = await prisma.source.findFirst({ where: { url: data.url } });
  if (existing) return existing;
  return prisma.source.create({
    data: { ...data, dateConsultation: new Date(), verifiee: false },
  });
}

async function creerLien(lien, userId, index) {
  const entiteA = await trouverEntite(lien.deA, index);
  const entiteB = await trouverEntite(lien.versB, index);
  if (!entiteA || !entiteB) {
    throw new Error(`[seed-demo] Lien #${index} : entité introuvable`);
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } });
  if (!typeLien) {
    throw new Error(`[seed-demo] TypeLien introuvable : ${lien.typeLienCode}`);
  }

  const fkA = fkPourEntite(lien.deA, entiteA, 'A');
  const fkB = fkPourEntite(lien.versB, entiteB, 'B');

  // Idempotence : si un lien existe déjà entre ces 2 entités avec ce typeLien, on le réutilise
  const existing = await prisma.lien.findFirst({
    where: { ...fkA, ...fkB, typeLienId: typeLien.id },
  });
  if (existing) return existing;

  return prisma.lien.create({
    data: {
      ...fkA,
      ...fkB,
      typeLienId: typeLien.id,
      description: lien.description,
      statut: 'VALIDE',
      estBidirectionnel: false,
      intensite: 1,
      creeParId: userId,
    },
  });
}

async function attacherSource(lienId, sourceId) {
  // Le modèle Lien a probablement une table de jointure Lien-Source ou un champ "preuves".
  // On vérifie l'existence dynamiquement.
  try {
    await prisma.lienSource?.upsert?.({
      where: { lienId_sourceId: { lienId, sourceId } },
      update: {},
      create: { lienId, sourceId },
    });
  } catch {
    // Si le modèle n'existe pas, on ignore — la source est créée mais non rattachée.
  }
}

async function resetDonneesDemo() {
  console.log('⚠ Mode --reset : suppression des données démo existantes...');
  const wikidataIds = [
    ...PERSONNES.map((p) => p.wikidataId),
    ...ORGANISATIONS.map((o) => o.wikidataId),
  ];
  const personnes = await prisma.personne.findMany({ where: { wikidataId: { in: wikidataIds } } });
  const organisations = await prisma.organisation.findMany({
    where: { wikidataId: { in: wikidataIds } },
  });
  const sitesWeb = await prisma.siteWeb.findMany({
    where: { domaine: { in: SITES_WEB.map((s) => s.domaine) } },
  });

  const idsPersonnes = personnes.map((p) => p.id);
  const idsOrganisations = organisations.map((o) => o.id);
  const idsSitesWeb = sitesWeb.map((s) => s.id);

  await prisma.lien.deleteMany({
    where: {
      OR: [
        { personneAId: { in: idsPersonnes } },
        { personneBId: { in: idsPersonnes } },
        { organisationAId: { in: idsOrganisations } },
        { organisationBId: { in: idsOrganisations } },
        { siteWebAId: { in: idsSitesWeb } },
        { siteWebBId: { in: idsSitesWeb } },
      ],
    },
  });
  await prisma.personne.deleteMany({ where: { id: { in: idsPersonnes } } });
  await prisma.organisation.deleteMany({ where: { id: { in: idsOrganisations } } });
  await prisma.siteWeb.deleteMany({ where: { id: { in: idsSitesWeb } } });
  console.log('✓ Données démo précédentes supprimées.');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n┌─ seed-demo — Sphère Bolloré/Macron ─────────────────────────┐\n');

  if (RESET) await resetDonneesDemo();

  const user = await upsertUserDemo();

  console.log('\n— Personnes —');
  for (const p of PERSONNES) {
    const personne = await upsertPersonne(p, user.id);
    console.log(`  ✓ ${personne.prenom} ${personne.nom} (${personne.wikidataId})`);
  }

  console.log('\n— Organisations —');
  for (const o of ORGANISATIONS) {
    const orga = await upsertOrganisation(o, user.id);
    console.log(`  ✓ ${orga.nom} (${orga.wikidataId})`);
  }

  console.log('\n— Sites web —');
  for (const s of SITES_WEB) {
    const site = await upsertSiteWeb(s, user.id);
    console.log(`  ✓ ${site.domaine}`);
  }

  console.log('\n— Sources —');
  const sourceBolloreVivendi = await upsertSource('bollore_vivendi');
  const sourceCnews = await upsertSource('cnews_editeur');
  console.log(`  ✓ ${sourceBolloreVivendi.titre}`);
  console.log(`  ✓ ${sourceCnews.titre}`);

  console.log('\n— Liens —');
  for (let i = 0; i < LIENS.length; i++) {
    const lien = await creerLien(LIENS[i], user.id, i);
    const sourceId = i === LIENS.length - 1 ? sourceCnews.id : sourceBolloreVivendi.id;
    await attacherSource(lien.id, sourceId);
    console.log(
      `  ✓ ${LIENS[i].deA.wikidataId ?? LIENS[i].deA.domaine} → ${LIENS[i].typeLienCode} → ${LIENS[i].versB.wikidataId ?? LIENS[i].versB.domaine}`,
    );
  }

  console.log('\n┌─ Bilan ─────────────────────────────────────────────────────┐');
  console.log(`│ User demo  : ${USER_DEMO.email}`);
  console.log(`│ Mot de passe : ${USER_DEMO.motDePasse}`);
  console.log(`│ Rôle       : ${USER_DEMO.role}`);
  console.log(`│ Personnes  : ${PERSONNES.length}`);
  console.log(`│ Orgas      : ${ORGANISATIONS.length}`);
  console.log(`│ Sites web  : ${SITES_WEB.length}`);
  console.log(`│ Liens      : ${LIENS.length}`);
  console.log('└─────────────────────────────────────────────────────────────┘\n');
  console.log(
    'Prochaine étape : http://localhost:5173 → Connexion → /graphe → rechercher "Bolloré"',
  );
}

main()
  .catch((err) => {
    console.error('[seed-demo] Échec :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
