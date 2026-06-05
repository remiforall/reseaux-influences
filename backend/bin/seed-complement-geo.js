/**
 * Script seed-complement-geo — Passe 5 L5.
 *
 * Complète les organisations existantes sans adresse de siège en les recherchant
 * via l'API recherche-entreprises (annuaire data.gouv.fr), puis lance le géocodage
 * batch via l'API Adresse BAN pour résoudre les coordonnées manquantes.
 *
 * Objectif : passer de 4 organisations géolocalisées à ~12-15 dans la base démo.
 *
 * Usage :
 *   cd backend && node bin/seed-complement-geo.js
 *   cd backend && node bin/seed-complement-geo.js --dry-run  # afficher sans modifier
 *
 * Prérequis :
 *   - DATABASE_URL configuré dans .env
 *   - ENRICHISSEMENT_USER_AGENT configuré (politesse APIs publiques)
 */

import { PrismaClient } from '@prisma/client';
import RechercheEntreprisesConnecteur from '../src/connecteurs/sources/recherche-entreprises.js';
import { geocoderEntitesEnLot } from '../src/services/geocoder.js';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');

if (!process.env.ENRICHISSEMENT_USER_AGENT) {
  process.env.ENRICHISSEMENT_USER_AGENT =
    'reseauxinfluences.fr/1.0-alpha (contact: contact@reseauxinfluences.fr)';
}

/**
 * Délai de politesse entre les appels APIs externes.
 * L'API recherche-entreprises ne rate-limite pas agressivement,
 * mais on reste courtois.
 *
 * @param {number} ms
 * @returns {Promise<void>}
 */
function attendre(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Normalise le nom de l'entreprise pour la comparaison (insensible casse,
 * sans accents, sans forme juridique courante).
 *
 * @param {string} nom
 * @returns {string}
 */
function normaliserNom(nom) {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\b(sas|sa|sca|scl|sarl|sasu|eurl|ses|se|soc|groupe)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.info('[seed-complement-geo] Démarrage…');
  if (DRY_RUN) console.info('[seed-complement-geo] Mode --dry-run : aucune modification en base');

  // ── Étape 1 : organisations validées sans adresse de siège ──────────────────
  const orgasSansAdresse = await prisma.organisation.findMany({
    where: {
      adresseSiege: null,
      statut: 'VALIDE',
    },
    select: { id: true, nom: true, sigle: true },
    orderBy: { nom: 'asc' },
  });

  console.info(
    `[seed-complement-geo] ${orgasSansAdresse.length} organisation(s) sans adresse de siège`,
  );

  if (orgasSansAdresse.length === 0) {
    console.info('[seed-complement-geo] Aucune organisation à compléter — passage au géocodage');
  } else {
    const connecteur = new RechercheEntreprisesConnecteur();
    let mises_a_jour = 0;
    let echecs = 0;

    for (const orga of orgasSansAdresse) {
      const terme = orga.sigle ?? orga.nom;
      console.info(`  → Recherche : "${terme}"`);

      let resultats = [];
      try {
        const reponse = await connecteur.rechercher(terme, { perPage: 3 });
        resultats = reponse.resultats ?? [];
      } catch (err) {
        console.warn(`    [ERREUR] ${err.message}`);
        echecs++;
        await attendre(300);
        continue;
      }

      if (resultats.length === 0) {
        console.info('    Aucun résultat');
        echecs++;
        await attendre(200);
        continue;
      }

      // Sélectionner le résultat dont le nom normalisé est le plus proche
      const nomNormalise = normaliserNom(orga.nom);
      const meilleurResultat = resultats.find((r) => {
        const nomR = r.champs?.nom?.valeur;
        return nomR && normaliserNom(String(nomR)).includes(nomNormalise.split(' ')[0]);
      }) ?? resultats[0];

      const adresse = meilleurResultat.champs?.adresseSiege?.valeur ?? null;
      const description = meilleurResultat.champs?.description?.valeur ?? null;

      if (!adresse) {
        console.info('    Résultat trouvé mais adresse vide');
        echecs++;
        await attendre(200);
        continue;
      }

      console.info(`    Adresse trouvée : "${adresse}"`);

      if (!DRY_RUN) {
        await prisma.organisation.update({
          where: { id: orga.id },
          data: {
            adresseSiege: String(adresse),
            // Enrichir la description si vide ou moins riche
            ...(description && !orga.description
              ? { description: String(description) }
              : {}),
          },
        });
      }

      mises_a_jour++;
      // Délai de politesse entre les appels
      await attendre(300);
    }

    console.info(
      `[seed-complement-geo] Adresses : ${mises_a_jour} mise(s) à jour, ${echecs} échec(s)`,
    );
  }

  // ── Étape 2 : géocodage batch des adresses récemment ajoutées ───────────────
  if (DRY_RUN) {
    console.info('[seed-complement-geo] (--dry-run) Géocodage batch simulé — pas d\'appel BAN');
  } else {
    console.info('[seed-complement-geo] Géocodage batch (limite 200 entités)…');
    const stats = await geocoderEntitesEnLot(200);
    console.info(
      `[seed-complement-geo] Géocodage terminé : ` +
      `${stats.personnesGeocodes} personne(s), ${stats.organisationsGeocodees} organisation(s)`,
    );
  }

  // ── Bilan final ────────────────────────────────────────────────────────────
  const [nbOrgasGeo, nbPersonnesGeo] = await Promise.all([
    prisma.organisation.count({ where: { siegeLat: { not: null } } }),
    prisma.personne.count({ where: { lieuNaissanceLat: { not: null } } }),
  ]);

  console.info(
    `[seed-complement-geo] Bilan géolocalisation :` +
    `\n  Organisations avec coords : ${nbOrgasGeo}` +
    `\n  Personnes avec coords lieu naissance : ${nbPersonnesGeo}`,
  );
}

main()
  .catch((err) => {
    console.error('[seed-complement-geo] Erreur fatale :', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
