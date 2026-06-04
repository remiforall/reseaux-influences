/**
 * @module routes/entites
 * Routes de fiche enrichie IGN pour une entité (Organisation ou Personne).
 *
 * GET /api/entites/:type/:id/foncier    → transactions DVF de la zone (commune)
 * GET /api/entites/:type/:id/cadastre   → parcelle cadastrale du siège
 * GET /api/entites/:type/:id/urbanisme  → zonage PLU au point de géolocalisation
 *
 * Auth : optionalAuth — fiches VALIDE accessibles publiquement ;
 * fiches EN_ATTENTE réservées aux utilisateurs authentifiés (ADR-010).
 *
 * RGPD (ADR-003) :
 *   - DVF : aucun nom de propriétaire (loi ELAN 2018, DVF public anonymisé)
 *   - Cadastre : parcelle géographique uniquement, sans propriétaire
 *   - GPU : zonage réglementaire public, aucune donnée personnelle
 */

import { prisma } from '../utils/prisma.js';
import { optionalAuth } from '../middleware/auth.js';
import IgnDvfConnecteur from '../connecteurs/sources/ign-dvf.js';
import IgnCartoCadastre from '../connecteurs/sources/ign-carto-cadastre.js';
import IgnCartoGpu from '../connecteurs/sources/ign-carto-gpu.js';

/** Types d'entités acceptés dans le paramètre de route. */
const TYPES_ENTITE_ACCEPTES = new Set(['personne', 'organisation']);

/**
 * Charge une entité Prisma depuis son type et son id.
 * Retourne null si non trouvée.
 *
 * @param {'personne'|'organisation'} type
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function chargerEntite(type, id) {
  if (type === 'personne') {
    return prisma.personne.findUnique({
      where: { id },
      select: {
        id: true,
        statut: true,
        lieuNaissanceLat: true,
        lieuNaissanceLon: true,
        lieuNaissanceCodeInsee: true,
        lieuNaissance: true,
      },
    });
  }
  if (type === 'organisation') {
    return prisma.organisation.findUnique({
      where: { id },
      select: {
        id: true,
        statut: true,
        siegeLat: true,
        siegeLon: true,
        siegeCodeInsee: true,
        adresseSiege: true,
      },
    });
  }
  return null;
}

/**
 * Extrait les coordonnées et le code INSEE depuis l'entité chargée.
 *
 * @param {'personne'|'organisation'} type
 * @param {object} entite
 * @returns {{ lat: number|null, lon: number|null, codeInsee: string|null }}
 */
function extraireGeo(type, entite) {
  if (type === 'personne') {
    return {
      lat: entite.lieuNaissanceLat ?? null,
      lon: entite.lieuNaissanceLon ?? null,
      codeInsee: entite.lieuNaissanceCodeInsee ?? null,
    };
  }
  return {
    lat: entite.siegeLat ?? null,
    lon: entite.siegeLon ?? null,
    codeInsee: entite.siegeCodeInsee ?? null,
  };
}

/**
 * Calcule les statistiques agregées depuis un tableau de transactions DVF.
 *
 * @param {Array<{ champs: { valeurFonciere?: { valeur: unknown }, surface?: { valeur: unknown } } }>} transactions
 * @returns {{ nbTransactions: number, prixMedian: number|null, surfaceMediane: number|null }}
 */
function calculerStatsDvf(transactions) {
  if (transactions.length === 0) {
    return { nbTransactions: 0, prixMedian: null, surfaceMediane: null };
  }

  const prix = transactions
    .map((t) => {
      const v = t.champs?.valeurFonciere?.valeur;
      return v !== null && v !== undefined ? Number(v) : null;
    })
    .filter((v) => v !== null && !Number.isNaN(v))
    .sort((a, b) => a - b);

  const surfaces = transactions
    .map((t) => {
      const v = t.champs?.surface?.valeur;
      return v !== null && v !== undefined ? Number(v) : null;
    })
    .filter((v) => v !== null && !Number.isNaN(v))
    .sort((a, b) => a - b);

  const mediane = (arr) => {
    if (arr.length === 0) return null;
    const m = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[m - 1] + arr[m]) / 2 : arr[m];
  };

  return {
    nbTransactions: transactions.length,
    prixMedian: mediane(prix),
    surfaceMediane: mediane(surfaces),
  };
}

export default async function entitesRoutes(fastify) {
  // ─── GET /api/entites/:type/:id/foncier ─────────────────────────────────────
  /**
   * Retourne les transactions DVF de la commune de l'entité (12 derniers mois).
   *
   * Retour : { transactions: [...], statsZone: { nbTransactions, prixMedian, surfaceMediane } }
   * Si l'entité n'est pas géolocalisée : { transactions: [], statsZone: null, raison: string }
   */
  fastify.get(
    '/:type/:id/foncier',
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const { type, id } = request.params;

      if (!TYPES_ENTITE_ACCEPTES.has(type)) {
        return reply.code(400).send({ error: 'Type d\'entité invalide. Valeurs acceptées : personne, organisation' });
      }

      const entite = await chargerEntite(type, id);
      if (!entite) return reply.code(404).send({ error: 'Entité introuvable' });

      // Entités EN_ATTENTE réservées aux utilisateurs authentifiés (ADR-010)
      if (entite.statut !== 'VALIDE' && !request.utilisateur) {
        return reply.code(403).send({ error: 'Authentification requise pour consulter cette fiche' });
      }

      const { codeInsee } = extraireGeo(type, entite);

      if (!codeInsee) {
        return reply.send({
          transactions: [],
          statsZone: null,
          raison: 'Entité non géolocalisée — code INSEE manquant',
        });
      }

      const connecteur = new IgnDvfConnecteur();
      let resultats = [];
      try {
        const reponse = await connecteur.rechercher(codeInsee);
        resultats = reponse.resultats ?? [];
      } catch {
        // IGN indisponible ou aucune donnée sur la zone — réponse vide propre
        resultats = [];
      }

      // Filtrer les 12 derniers mois
      const seuilDate = new Date();
      seuilDate.setFullYear(seuilDate.getFullYear() - 1);

      const transactions = resultats
        .filter((t) => {
          const dateMutation = t.champs?.dateMutation?.valeur;
          if (!dateMutation) return true; // conserver si pas de date
          return new Date(dateMutation) >= seuilDate;
        })
        .map((t) => ({
          dateMutation: t.champs?.dateMutation?.valeur ?? null,
          valeurFonciere: t.champs?.valeurFonciere?.valeur ?? null,
          surface: t.champs?.surface?.valeur ?? null,
          typeLocal: t.champs?.typeLocal?.valeur ?? null,
          adresse: t.champs?.adresse?.valeur ?? null,
          parcelles: t.champs?.parcelles?.valeur ?? [],
        }));

      return reply.send({
        transactions,
        statsZone: calculerStatsDvf(resultats),
        source: 'DVF Etalab — open data DGFiP',
        codeInsee,
      });
    },
  );

  // ─── GET /api/entites/:type/:id/cadastre ─────────────────────────────────────
  /**
   * Retourne la parcelle cadastrale correspondant au siège (ou lieu de naissance).
   *
   * Retour : { parcelle: object|null, parcellesAttenantes: [...] }
   * Si l'entité n'est pas géolocalisée : { parcelle: null, raison: string }
   */
  fastify.get(
    '/:type/:id/cadastre',
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const { type, id } = request.params;

      if (!TYPES_ENTITE_ACCEPTES.has(type)) {
        return reply.code(400).send({ error: 'Type d\'entité invalide. Valeurs acceptées : personne, organisation' });
      }

      const entite = await chargerEntite(type, id);
      if (!entite) return reply.code(404).send({ error: 'Entité introuvable' });

      if (entite.statut !== 'VALIDE' && !request.utilisateur) {
        return reply.code(403).send({ error: 'Authentification requise pour consulter cette fiche' });
      }

      const { codeInsee } = extraireGeo(type, entite);

      if (!codeInsee) {
        return reply.send({
          parcelle: null,
          parcellesAttenantes: [],
          raison: 'Entité non géolocalisée — code INSEE manquant',
        });
      }

      const connecteur = new IgnCartoCadastre();
      let resultats = [];
      try {
        // Requête sur toutes les parcelles de la commune — la première est la principale
        const reponse = await connecteur.rechercher(`${codeInsee}/A`);
        resultats = reponse.resultats ?? [];
      } catch {
        resultats = [];
      }

      const [principale, ...attenantes] = resultats.map((p) => ({
        idu: p.champs?.idu?.valeur ?? null,
        codeInsee: p.champs?.codeInsee?.valeur ?? null,
        section: p.champs?.section?.valeur ?? null,
        numero: p.champs?.numero?.valeur ?? null,
        contenance: p.champs?.contenance?.valeur ?? null,
        geometrie: p.champs?.geometrie?.valeur ?? null,
      }));

      return reply.send({
        parcelle: principale ?? null,
        parcellesAttenantes: attenantes.slice(0, 5),
        source: 'IGN Cadastre — open data DGFiP',
        codeInsee,
      });
    },
  );

  // ─── GET /api/entites/:type/:id/urbanisme ────────────────────────────────────
  /**
   * Retourne le zonage PLU au point de géolocalisation de l'entité.
   *
   * Retour : { zone: object|null, communesAssociees: [...] }
   * Si l'entité n'est pas géolocalisée : { zone: null, raison: string }
   */
  fastify.get(
    '/:type/:id/urbanisme',
    { preHandler: [optionalAuth] },
    async (request, reply) => {
      const { type, id } = request.params;

      if (!TYPES_ENTITE_ACCEPTES.has(type)) {
        return reply.code(400).send({ error: 'Type d\'entité invalide. Valeurs acceptées : personne, organisation' });
      }

      const entite = await chargerEntite(type, id);
      if (!entite) return reply.code(404).send({ error: 'Entité introuvable' });

      if (entite.statut !== 'VALIDE' && !request.utilisateur) {
        return reply.code(403).send({ error: 'Authentification requise pour consulter cette fiche' });
      }

      const { lat, lon } = extraireGeo(type, entite);

      if (lat === null || lat === undefined || lon === null || lon === undefined) {
        return reply.send({
          zone: null,
          communesAssociees: [],
          raison: 'Entité non géolocalisée — coordonnées manquantes',
        });
      }

      const connecteur = new IgnCartoGpu();
      let resultats = [];
      try {
        // Format "lon,lat" accepté par le connecteur GPU
        const reponse = await connecteur.rechercher(`${lon},${lat}`);
        resultats = reponse.resultats ?? [];
      } catch {
        resultats = [];
      }

      const zones = resultats.map((z) => ({
        libelle: z.champs?.libelle?.valeur ?? null,
        typezone: z.champs?.typezone?.valeur ?? null,
        destinations: z.champs?.destinations?.valeur ?? null,
        source: z.champs?.libelle?.source ?? 'IGN GPU',
      }));

      return reply.send({
        zone: zones[0] ?? null,
        communesAssociees: zones.slice(1),
        source: 'IGN GPU — Géoportail de l\'Urbanisme',
        coordonnees: { lat, lon },
      });
    },
  );
}
