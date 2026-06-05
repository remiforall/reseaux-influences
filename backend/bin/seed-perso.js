/**
 * Seed personnel — Rémi Vincent + PostHack + posthack.com.
 *
 * Agrège 3 sources publiques officielles (data.gouv.fr) :
 *  1. Wikidata Q127335356 — Rémi Vincent (candidat législatives 2022)
 *  2. recherche-entreprises.api.gouv.fr — POSTHACK (SIREN 900477571, RNE/Sirene)
 *  3. RDAP Verisign — posthack.com (registrar, dates, hébergeur)
 *
 * Idempotent (peut être relancé sans créer de doublons).
 *
 * Usage :
 *   cd backend && node bin/seed-perso.js
 *   cd backend && node bin/seed-perso.js --reset    # purge avant re-seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RESET = process.argv.includes('--reset');
const USER_EMAIL = 'remi@reseauxinfluences.fr';

// ---------------------------------------------------------------------------
// Données issues des sources publiques (récupérées via API gratuites)
// ---------------------------------------------------------------------------

const PERSONNE_REMI = {
  nom: 'Vincent',
  prenom: 'Rémi',
  pays: 'France',
  nationalite: 'française',
  dateNaissance: new Date('1978-06-01'), // précision mois (recherche-entreprises)
  rolePrincipal: 'Gérant de PostHack',
  bio: 'Designer et consultant en éthique numérique, gérant de PostHack (Courseulles-sur-Mer, Normandie). Candidat aux élections législatives françaises de juin 2022.',
  wikipediaUrl: null,
  wikidataId: 'Q127335356',
  qualiteInfluence: 'DIRIGEANT',
};

const ORGANISATION_POSTHACK = {
  nom: 'PostHack',
  sigle: null,
  typeOrganisation: 'ENTREPRISE',
  pays: 'France',
  siteWeb: 'https://posthack.com',
  description:
    "PostHack — entreprise individuelle / société de conseil en éthique numérique. " +
    'SIREN 900477571 · SIRET siège 90047757100021 · NAF 70.22Z (Conseil pour les affaires et autres conseils de gestion). ' +
    'Siège : 7 rue des Sorbiers, 14470 Courseulles-sur-Mer (Calvados, Normandie). ' +
    'Catégorie INSEE : PME. Source : recherche-entreprises.api.gouv.fr',
  dateCreation: new Date('2021-06-16'),
  wikipediaUrl: null,
  wikidataId: null, // pas de fiche Wikidata pour PostHack (à créer si pertinent)
  qualiteInfluence: 'AUTRE',
};

const SITE_POSTHACK = {
  domaine: 'posthack.com',
  url: 'https://posthack.com',
  titre: 'PostHack — site officiel',
  description: 'Site officiel de PostHack. Enregistré chez Gandi SAS, hébergé sur infrastructure Gandi.',
  dateEnregistrement: new Date('2012-08-09'),
  dateExpiration: new Date('2032-08-09'),
  registrar: 'Gandi SAS',
  hebergeurProbable: 'Gandi',
  nameservers: ['NS-166-A.GANDI.NET', 'NS-190-C.GANDI.NET', 'NS-50-B.GANDI.NET'],
  titulaireRedacted: false,
  qualiteInfluence: 'EDITEUR_SITE',
};

const SOURCES = {
  wikidata: {
    url: 'https://www.wikidata.org/wiki/Q127335356',
    titre: 'Rémi Vincent — fiche Wikidata Q127335356',
    media: 'Wikidata',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'International',
    datePublication: new Date('2024-07-09'),
  },
  legislatives_2022: {
    url: 'https://www.data.gouv.fr/fr/datasets/r/8597b9e5-162b-472a-a27e-fe1b25eb0c35',
    titre: 'Élections législatives des 12 et 19 juin 2022 — Liste des candidats du 1er tour',
    media: 'data.gouv.fr',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date('2022-06-01'),
  },
  recherche_entreprises: {
    url: 'https://recherche-entreprises.api.gouv.fr/search?q=POSTHACK&siren=900477571',
    titre: 'PostHack — annuaire des entreprises (API recherche-entreprises)',
    media: 'data.gouv.fr / annuaire-entreprises',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'fr',
    paysMedia: 'France',
    datePublication: new Date(),
  },
  rdap_verisign: {
    url: 'https://rdap.verisign.com/com/v1/domain/posthack.com',
    titre: 'posthack.com — données RDAP Verisign (.com)',
    media: 'Verisign RDAP',
    typeMedia: 'DOCUMENT_OFFICIEL',
    langue: 'en',
    paysMedia: 'International',
    datePublication: new Date('2026-04-22'), // last changed
  },
};

const LIENS = [
  {
    deA: { type: 'Personne', wikidataId: 'Q127335356' },
    versB: { type: 'Organisation', match: { description_contains: 'SIREN 900477571' } },
    typeLienCode: 'DIRIGEANT',
    description:
      'Rémi Vincent est gérant de PostHack (qualité : Gérant, source Sirene/RNE via recherche-entreprises.api.gouv.fr).',
    sources: ['recherche_entreprises'],
  },
  {
    deA: { type: 'Organisation', match: { description_contains: 'SIREN 900477571' } },
    versB: { type: 'SiteWeb', domaine: 'posthack.com' },
    typeLienCode: 'EDITEUR_DU_SITE',
    description: 'PostHack édite le site posthack.com (faisceau : domaine identique au nom commercial).',
    sources: ['rdap_verisign'],
  },
];

// ---------------------------------------------------------------------------
// Helpers idempotents
// ---------------------------------------------------------------------------

async function getUserDemo() {
  const user = await prisma.utilisateur.findUnique({ where: { email: USER_EMAIL } });
  if (!user) {
    throw new Error(
      `[seed-perso] Utilisateur ${USER_EMAIL} introuvable. Lancer d'abord : node bin/seed-demo.js`,
    );
  }
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
  // PostHack n'a pas de wikidataId → matcher par "SIREN xxxxx" dans la description
  const sirenMatch = data.description.match(/SIREN (\d{9})/);
  const siren = sirenMatch?.[1];
  const existing = siren
    ? await prisma.organisation.findFirst({
        where: { description: { contains: `SIREN ${siren}` } },
      })
    : null;
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

async function upsertSource(key) {
  const data = SOURCES[key];
  const existing = await prisma.source.findFirst({ where: { url: data.url } });
  if (existing) return existing;
  return prisma.source.create({
    data: { ...data, dateConsultation: new Date(), verifiee: false },
  });
}

async function trouverEntite(ref) {
  if (ref.type === 'Personne') {
    return prisma.personne.findFirst({ where: { wikidataId: ref.wikidataId } });
  }
  if (ref.type === 'Organisation') {
    if (ref.match?.description_contains) {
      return prisma.organisation.findFirst({
        where: { description: { contains: ref.match.description_contains } },
      });
    }
    return prisma.organisation.findFirst({ where: { wikidataId: ref.wikidataId } });
  }
  if (ref.type === 'SiteWeb') {
    return prisma.siteWeb.findUnique({ where: { domaine: ref.domaine } });
  }
  return null;
}

function fkPourEntite(ref, entite, position) {
  const suffix = position === 'A' ? 'AId' : 'BId';
  if (ref.type === 'Personne') return { [`personne${suffix}`]: entite.id };
  if (ref.type === 'Organisation') return { [`organisation${suffix}`]: entite.id };
  if (ref.type === 'SiteWeb') return { [`siteWeb${suffix}`]: entite.id };
  throw new Error(`Type inconnu : ${ref.type}`);
}

async function creerLien(lien, userId) {
  const entiteA = await trouverEntite(lien.deA);
  const entiteB = await trouverEntite(lien.versB);
  if (!entiteA || !entiteB) {
    throw new Error(`[seed-perso] Entité introuvable pour lien ${lien.typeLienCode}`);
  }

  const typeLien = await prisma.typeLien.findUnique({ where: { code: lien.typeLienCode } });
  if (!typeLien) throw new Error(`TypeLien introuvable : ${lien.typeLienCode}`);

  const fkA = fkPourEntite(lien.deA, entiteA, 'A');
  const fkB = fkPourEntite(lien.versB, entiteB, 'B');

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

async function reset() {
  console.log('⚠ Suppression données perso précédentes...');
  const remi = await prisma.personne.findFirst({ where: { wikidataId: 'Q127335356' } });
  const posthack = await prisma.organisation.findFirst({
    where: { description: { contains: 'SIREN 900477571' } },
  });
  const site = await prisma.siteWeb.findUnique({ where: { domaine: 'posthack.com' } });

  const idsP = [remi?.id].filter(Boolean);
  const idsO = [posthack?.id].filter(Boolean);
  const idsS = [site?.id].filter(Boolean);

  await prisma.lien.deleteMany({
    where: {
      OR: [
        { personneAId: { in: idsP } },
        { personneBId: { in: idsP } },
        { organisationAId: { in: idsO } },
        { organisationBId: { in: idsO } },
        { siteWebAId: { in: idsS } },
        { siteWebBId: { in: idsS } },
      ],
    },
  });
  if (remi) await prisma.personne.delete({ where: { id: remi.id } });
  if (posthack) await prisma.organisation.delete({ where: { id: posthack.id } });
  if (site) await prisma.siteWeb.delete({ where: { id: site.id } });
  console.log('✓ Données perso supprimées.\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n┌─ seed-perso — Rémi Vincent + PostHack + posthack.com ───────┐\n');
  if (RESET) await reset();

  const user = await getUserDemo();
  console.log(`✓ User : ${user.email}\n`);

  console.log('— Personne (Wikidata Q127335356) —');
  const remi = await upsertPersonne(PERSONNE_REMI, user.id);
  console.log(`  ✓ ${remi.prenom} ${remi.nom}`);

  console.log('\n— Organisation (Sirene SIREN 900477571) —');
  const posthack = await upsertOrganisation(ORGANISATION_POSTHACK, user.id);
  console.log(`  ✓ ${posthack.nom}`);

  console.log('\n— Site web (RDAP Verisign) —');
  const site = await upsertSiteWeb(SITE_POSTHACK, user.id);
  console.log(`  ✓ ${site.domaine}`);

  console.log('\n— Sources publiques —');
  const sources = {};
  for (const [key, data] of Object.entries(SOURCES)) {
    sources[key] = await upsertSource(key);
    console.log(`  ✓ ${data.titre}`);
  }

  console.log('\n— Liens —');
  for (const lien of LIENS) {
    await creerLien(lien, user.id);
    console.log(`  ✓ ${lien.typeLienCode} — ${lien.description.slice(0, 60)}...`);
  }

  console.log('\n┌─ Bilan ─────────────────────────────────────────────────────┐');
  console.log('│ Personnes  : 1 (Rémi Vincent — Q127335356)');
  console.log('│ Orgas      : 1 (PostHack — SIREN 900477571)');
  console.log('│ Sites web  : 1 (posthack.com — Gandi)');
  console.log('│ Sources    : 4 (Wikidata, data.gouv.fr × 2, RDAP Verisign)');
  console.log('│ Liens      : 2 (Rémi→DIRIGEANT→PostHack, PostHack→EDITEUR_DU_SITE→posthack.com)');
  console.log('└─────────────────────────────────────────────────────────────┘\n');
  console.log('Ouvre http://localhost:5173 → /graphe → tape "Rémi" ou "PostHack"\n');
}

main()
  .catch((err) => {
    console.error('[seed-perso] Échec :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
