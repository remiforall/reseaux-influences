/**
 * Seed enrichi — nourrit la base en appelant directement les services
 * d'enrichissement + géocodage batch.
 *
 * Sans clic dans l'UI, ce script :
 *   1. Lance la recherche multi-connecteurs sur N entités cibles
 *   2. Importe automatiquement la première PreviewEntite la plus pertinente
 *      avec sa qualiteInfluencePublique prédéclarée
 *   3. Géocode en lot toutes les entités (lieu de naissance, siège social)
 *
 * ⚠️ Usage : alpha/dev local UNIQUEMENT. Ce script court-circuite l'UX humaine
 *    de vérification ADR-006 — toutes les fiches importées restent en EN_ATTENTE
 *    et doivent être validées manuellement avant publication.
 *
 * Usage :
 *   cd backend && node bin/seed-enrichi.js
 *   cd backend && node bin/seed-enrichi.js --reset    # purge avant
 *   cd backend && node bin/seed-enrichi.js --geocoder-only
 *   cd backend && node bin/seed-enrichi.js --enrich-only
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { rechercherMultiConnecteurs } from '../src/services/enrichissement.js';
import { importer } from '../src/services/import-enrichissement.js';
import { geocoderEntitesEnLot } from '../src/services/geocoder.js';

const prisma = new PrismaClient();
const RESET = process.argv.includes('--reset');
const GEOCODER_ONLY = process.argv.includes('--geocoder-only');
const ENRICH_ONLY = process.argv.includes('--enrich-only');

// ---------------------------------------------------------------------------
// Cibles à enrichir — choisies pour donner un graphe démonstratif riche
// ---------------------------------------------------------------------------

const CIBLES = [
  // Sphère politique
  {
    nom: 'Emmanuel Macron',
    types: ['personne'],
    qualite: 'ELU',
    connecteurs: ['wikidata', 'parlementaires', 'open-sanctions'],
  },
  {
    nom: 'Édouard Philippe',
    types: ['personne'],
    qualite: 'ELU',
    connecteurs: ['wikidata', 'parlementaires', 'open-sanctions'],
  },
  {
    nom: 'Marine Le Pen',
    types: ['personne'],
    qualite: 'ELU',
    connecteurs: ['wikidata', 'parlementaires', 'open-sanctions'],
  },
  {
    nom: 'Jean-Luc Mélenchon',
    types: ['personne'],
    qualite: 'ELU',
    connecteurs: ['wikidata', 'parlementaires', 'open-sanctions'],
  },
  // Sphère économique / médias
  {
    nom: 'Bernard Arnault',
    types: ['personne'],
    qualite: 'DIRIGEANT',
    connecteurs: ['wikidata', 'open-sanctions'],
  },
  {
    nom: 'Xavier Niel',
    types: ['personne'],
    qualite: 'DIRIGEANT',
    connecteurs: ['wikidata', 'open-sanctions'],
  },
  {
    nom: 'Patrick Drahi',
    types: ['personne'],
    qualite: 'DIRIGEANT',
    connecteurs: ['wikidata', 'open-sanctions'],
  },
  // Organisations
  {
    nom: 'Vivendi',
    types: ['organisation'],
    qualite: 'EDITEUR_PRESSE',
    connecteurs: ['wikidata', 'recherche-entreprises', 'bodacc'],
  },
  {
    nom: 'LVMH',
    types: ['organisation'],
    qualite: 'AUTRE',
    connecteurs: ['wikidata', 'recherche-entreprises', 'bodacc'],
  },
  {
    nom: 'Iliad',
    types: ['organisation'],
    qualite: 'AUTRE',
    connecteurs: ['wikidata', 'recherche-entreprises', 'bodacc'],
  },
  {
    nom: 'Altice',
    types: ['organisation'],
    qualite: 'EDITEUR_PRESSE',
    connecteurs: ['wikidata', 'recherche-entreprises'],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function obtenirUtilisateurDemo() {
  const user = await prisma.utilisateur.findUnique({
    where: { email: 'remi@reseauxinfluences.fr' },
  });
  if (!user) {
    throw new Error('User demo introuvable. Lance d\'abord : node bin/seed-demo.js');
  }
  return user;
}

/**
 * Construit automatiquement un `choixUtilisateur` à partir d'une PreviewEntite :
 *   - champsRetenus : pour chaque champ, prend le 1er candidat (source la plus prioritaire)
 *   - liensRetenus : tous les liens suggérés
 *   - typeEntite : déduit du typeSuggere
 */
function construireChoixAuto(preview) {
  const champsRetenus = {};
  for (const [nomChamp, candidats] of Object.entries(preview.candidatsParChamp ?? {})) {
    if (Array.isArray(candidats) && candidats.length > 0 && candidats[0].source) {
      champsRetenus[nomChamp] = candidats[0].source;
    }
  }

  const liensRetenus = (preview.liensSuggeres ?? []).map((_, idx) => idx).slice(0, 50);

  return {
    champsRetenus,
    liensRetenus,
    typeEntite: preview.typeSuggere ?? 'Personne',
  };
}

async function enrichirEntite(cible, utilisateurId) {
  console.log(`\n→ Enrichissement de "${cible.nom}" (${cible.connecteurs.join(', ')})...`);

  let resultatRecherche;
  try {
    resultatRecherche = await rechercherMultiConnecteurs({
      query: cible.nom,
      types: cible.types,
      connecteurs: cible.connecteurs,
    });
  } catch (err) {
    console.warn(`  ⚠ Recherche échouée : ${err.message}`);
    return null;
  }

  const previews = resultatRecherche.resultats ?? [];
  if (previews.length === 0) {
    console.log(`  ⊘ Aucun résultat trouvé.`);
    return null;
  }

  // Statut par connecteur
  for (const [nom, statut] of Object.entries(resultatRecherche.statutParConnecteur ?? {})) {
    if (statut !== 'ok') console.log(`  · ${nom}: ${statut}`);
  }

  const preview = previews[0];
  const choixUtilisateur = construireChoixAuto(preview);

  try {
    const resultat = await importer({
      preview,
      choixUtilisateur,
      qualiteInfluencePublique: cible.qualite,
      utilisateurId,
      ipAddress: '127.0.0.1',
    });
    console.log(
      `  ✓ Importé : entité=${resultat.entitePrincipaleId.slice(0, 8)} liens=${resultat.liensCrees?.length ?? 0}`,
    );
    return resultat;
  } catch (err) {
    console.warn(`  ⚠ Import échoué : ${err.message}`);
    return null;
  }
}

async function reset() {
  console.log('⚠ Mode --reset : suppression des entités enrichies en EN_ATTENTE...');
  // Supprime seulement les entités créées récemment et en EN_ATTENTE (pas les seed-demo)
  const il_y_a_5_min = new Date(Date.now() - 5 * 60 * 1000);
  await prisma.lien.deleteMany({
    where: { statut: 'EN_ATTENTE', createdAt: { gte: il_y_a_5_min } },
  });
  await prisma.personne.deleteMany({
    where: { statut: 'EN_ATTENTE', createdAt: { gte: il_y_a_5_min } },
  });
  await prisma.organisation.deleteMany({
    where: { statut: 'EN_ATTENTE', createdAt: { gte: il_y_a_5_min } },
  });
  console.log('✓ Entités EN_ATTENTE récentes supprimées.\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n┌─ seed-enrichi — auto-import + géocodage batch ──────────────┐\n');

  const utilisateur = await obtenirUtilisateurDemo();
  console.log(`User : ${utilisateur.email} (id=${utilisateur.id.slice(0, 8)})`);

  if (RESET) await reset();

  let nbImports = 0;
  if (!GEOCODER_ONLY) {
    console.log(`\n┌─ Enrichissement de ${CIBLES.length} cibles ─────────────────────┐`);
    for (const cible of CIBLES) {
      const r = await enrichirEntite(cible, utilisateur.id);
      if (r) nbImports++;
    }
    console.log(`\nRésultat : ${nbImports}/${CIBLES.length} cibles importées en EN_ATTENTE.`);
  }

  if (!ENRICH_ONLY) {
    console.log('\n┌─ Géocodage batch (jusqu\'à 200 entités) ─────────────────────┐');
    try {
      const stats = await geocoderEntitesEnLot(200);
      console.log(
        `Géocodage : ${stats.geocodees ?? '?'} succès / ${stats.echecs ?? '?'} échecs / ${stats.totales ?? '?'} totales`,
      );
    } catch (err) {
      console.warn(`⚠ Géocodage échoué : ${err.message}`);
    }
  }

  console.log('\n┌─ Final ─────────────────────────────────────────────────────┐');
  const stats = {
    personnes: await prisma.personne.count(),
    personnesValides: await prisma.personne.count({ where: { statut: 'VALIDE' } }),
    personnesEnAttente: await prisma.personne.count({ where: { statut: 'EN_ATTENTE' } }),
    organisations: await prisma.organisation.count(),
    siteWebs: await prisma.siteWeb.count(),
    liens: await prisma.lien.count(),
    geolocPersonnes: await prisma.personne.count({ where: { lieuNaissanceLat: { not: null } } }),
    geolocOrgas: await prisma.organisation.count({ where: { siegeLat: { not: null } } }),
  };
  console.log(`│ Personnes      : ${stats.personnes} (${stats.personnesValides} validés, ${stats.personnesEnAttente} en attente)`);
  console.log(`│ Organisations  : ${stats.organisations}`);
  console.log(`│ Sites web      : ${stats.siteWebs}`);
  console.log(`│ Liens          : ${stats.liens}`);
  console.log(`│ Géoloc personnes : ${stats.geolocPersonnes}`);
  console.log(`│ Géoloc orgas   : ${stats.geolocOrgas}`);
  console.log('└─────────────────────────────────────────────────────────────┘\n');
  console.log('→ Ouvre http://localhost:5173/graphe pour explorer le réseau enrichi.\n');
}

main()
  .catch((err) => {
    console.error('\n[seed-enrichi] Échec :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
