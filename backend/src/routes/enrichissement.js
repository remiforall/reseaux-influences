/**
 * @module routes/enrichissement
 * Routes Fastify du module d'enrichissement OSINT.
 *
 * Routes :
 *   GET  /connecteurs                       → liste des connecteurs actifs
 *   POST /rechercher                        → recherche multi-connecteurs (preview)
 *   POST /importer                          → import transactionnel (garde-fou qualité d'influence)
 *   GET  /connecteurs/ign-geoplateforme/wms-config → config WMS pour Leaflet/MapLibre
 *
 * Toutes les routes requièrent une authentification Bearer JWT sauf la config WMS
 * qui accepte un auth optionnel (utile pour pré-charger le fond de carte).
 */

import { z } from 'zod';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { peutSoumettre } from '../services/gamification.js';
import { rechercherMultiConnecteurs } from '../services/enrichissement.js';
import { importer } from '../services/import-enrichissement.js';
import { listerConnecteurs } from '../connecteurs/registry.js';
import { prisma } from '../utils/prisma.js';

// ---------------------------------------------------------------------------
// Schémas de validation Zod
// ---------------------------------------------------------------------------

const rechercherSchema = z.object({
  query: z.string().min(2, 'La requête doit contenir au moins 2 caractères').max(200),
  types: z
    .array(z.enum(['personne', 'organisation', 'site']))
    .min(1, 'Au moins un type d\'entité est requis'),
  connecteurs: z.array(z.string()).optional(),
  options: z.record(z.unknown()).optional(),
});

/**
 * Valide qu'une URL est bien http(s) — SEC-I-01.
 * Utilisé en `.refine()` sur les champs URL des schémas Zod.
 *
 * @param {string|null|undefined} url
 * @returns {boolean}
 */
function estUrlHttp(url) {
  if (!url) return true; // null/undefined : champ optionnel, accepté
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const candidatChampSchema = z.object({
  valeur: z.unknown(),
  source: z.string().max(200),
  // SEC-I-01 : refus des schémas javascript:, data:, vbscript:, etc.
  url: z
    .string()
    .nullable()
    .optional()
    .refine(estUrlHttp, { message: "L'URL doit commencer par http:// ou https://" }),
  date: z.string().optional(),
});

const lienSuggereSchema = z.object({
  vers: z.object({
    type: z.string(),
    identifiantExterne: z.string().max(500),
    wikidataId: z.string().max(20).optional(),
    siren: z.string().max(20).optional(),
    domaine: z.string().max(255).optional(),
  }),
  typeLienCode: z.string().max(50),
  source: z.string().max(200).optional(),
  // SEC-I-01 : refus des schémas javascript:, data:, vbscript:, etc.
  url: z
    .string()
    .optional()
    .refine(estUrlHttp, { message: "L'URL doit commencer par http:// ou https://" }),
  date: z.string().optional(),
});

const previewEntiteSchema = z.object({
  typeSuggere: z.string().max(50),
  // SEC-I-05 : limiter le nb de champs (50) et de candidats par champ (20) — anti-DoS mémoire
  // z.record() n'expose pas .max() — on utilise .refine() pour borner le nombre de clés
  candidatsParChamp: z
    .record(z.array(candidatChampSchema).max(20))
    .refine((r) => Object.keys(r).length <= 50, { message: 'Trop de champs (max 50)' }),
  // SEC-I-05 : limiter liensSuggeres à 100 max
  liensSuggeres: z.array(lienSuggereSchema).max(100).optional().default([]),
  identifiantsExternes: z
    .object({
      wikidataId: z.string().max(20).optional(),
      siren: z.string().max(20).optional(),
      domaine: z.string().max(255).optional(),
      idu: z.string().max(50).optional(),
    })
    .optional()
    .default({}),
});

const importerSchema = z.object({
  preview: previewEntiteSchema,
  choixUtilisateur: z.object({
    // SEC-I-06 : accepter string OU objet candidat complet (le service normalise vers string)
    // z.record() n'expose pas .max() — .refine() pour borner
    champsRetenus: z
      .record(z.union([z.string().nullable(), z.object({ source: z.string() }).passthrough()]))
      .refine((r) => Object.keys(r).length <= 50, { message: 'Trop de champs retenus (max 50)' }),
    liensRetenus: z.array(z.number().int().nonnegative()).max(100),
    typeEntite: z.enum(['Personne', 'Organisation', 'SiteWeb']),
  }),
  qualiteInfluencePublique: z.enum([
    'ELU',
    'HAUT_FONCTIONNAIRE',
    'LOBBYISTE',
    'DIRIGEANT',
    'ARTISTE',
    'PRODUCTEUR',
    'EDITEUR_PRESSE',
    'HEBERGEUR',
    'EDITEUR_SITE',
    'AUTRE',
  ]),
});

// ---------------------------------------------------------------------------
// Plugin Fastify
// ---------------------------------------------------------------------------

/**
 * Enregistre les routes d'enrichissement OSINT.
 *
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function enrichissementRoutes(fastify) {
  /**
   * GET /connecteurs
   * Retourne la liste des connecteurs actifs dans le registry.
   */
  fastify.get('/connecteurs', { preHandler: [authenticate] }, async () => {
    const connecteurs = await listerConnecteurs();
    return { connecteurs };
  });

  /**
   * GET /connecteurs/ign-geoplateforme/wms-config
   * Retourne la configuration WMS IGN Géoplateforme pour le frontend Leaflet/MapLibre.
   * Auth optionnelle (permet le pré-chargement sans token).
   */
  fastify.get(
    '/connecteurs/ign-geoplateforme/wms-config',
    { preHandler: [optionalAuth] },
    async () => {
      return {
        urlBase: 'https://data.geopf.fr/wms-r',
        couchesDisponibles: [
          { nom: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2', libelle: 'Plan IGN v2' },
          { nom: 'ORTHOIMAGERY.ORTHOPHOTOS', libelle: 'Orthophotos' },
          { nom: 'CADASTRALPARCELS.PARCELLAIRE_EXPRESS', libelle: 'Parcellaire cadastral' },
        ],
        parametresParDefaut: {
          format: 'image/png',
          transparent: true,
          version: '1.3.0',
        },
      };
    },
  );

  /**
   * POST /rechercher
   * Interroge les connecteurs actifs et retourne une preview multi-source.
   *
   * Body : { query, types, connecteurs?, options? }
   * Réponse : { resultats, statutParConnecteur, dureeMs }
   */
  fastify.post('/rechercher', { preHandler: [authenticate] }, async (request, reply) => {
    const validation = rechercherSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send({
        error: 'Données invalides',
        details: validation.error.flatten(),
      });
    }

    const reponse = await rechercherMultiConnecteurs(validation.data);
    return reponse;
  });

  /**
   * POST /importer
   * Crée les entités en statut EN_ATTENTE depuis une preview OSINT.
   *
   * Vérifie d'abord le seuil de gamification (peutSoumettre).
   * La qualiteInfluencePublique est obligatoire (ADR-006).
   *
   * Body : { preview, choixUtilisateur, qualiteInfluencePublique }
   * Réponse 201 : { entitePrincipaleId, entitesCreees, liensCrees }
   */
  fastify.post('/importer', { preHandler: [authenticate] }, async (request, reply) => {
    // Vérification seuil gamification
    const eligibilite = await peutSoumettre(request.utilisateur.id);
    if (!eligibilite.autorise) {
      return reply.code(403).send({
        error: `Vous devez effectuer ${eligibilite.restantes} validation(s) supplémentaire(s) avant de pouvoir importer.`,
        validationsEffectuees: eligibilite.validationsEffectuees,
        seuilRequis: eligibilite.seuilRequis,
        restantes: eligibilite.restantes,
      });
    }

    // Validation du corps
    const validation = importerSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send({
        error: 'Données invalides',
        details: validation.error.flatten(),
      });
    }

    try {
      const reponse = await importer({
        preview: validation.data.preview,
        choixUtilisateur: validation.data.choixUtilisateur,
        qualiteInfluencePublique: validation.data.qualiteInfluencePublique,
        utilisateurId: request.utilisateur.id,
        ipAddress: request.ip,
      });
      return reply.code(201).send(reponse);
    } catch (err) {
      // Garde-fou ADR-006 : qualité manquante
      if (err.message.startsWith("Qualité d'influence")) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  /**
   * POST /recherche-globale
   * Auto-enrichissement : recherche d'abord en local (BDD), puis via les connecteurs externes
   * si aucun résultat local n'est trouvé et que l'utilisateur est authentifié.
   *
   * Body : { query: string, types: ('personne'|'organisation'|'site')[] }
   * Réponse : { locales: [...], externes: [...] }
   *
   * Auth optionnelle : la recherche locale est publique.
   * La recherche externe nécessite un token valide (requêtes vers APIs tierces).
   *
   * Utilisé par SelecteurEntite pour le flux auto-enrichissement (L6 Passe 4).
   */
  fastify.post('/recherche-globale', { preHandler: [optionalAuth] }, async (request, reply) => {
    const schemaRechercheGlobale = z.object({
      query: z.string().min(2).max(200),
      types: z.array(z.enum(['personne', 'organisation', 'site'])).min(1).default(['personne', 'organisation', 'site']),
    });

    const validation = schemaRechercheGlobale.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send({
        error: 'Données invalides',
        details: validation.error.flatten(),
      });
    }

    const { query, types } = validation.data;
    const termeNormalise = query.trim().toLowerCase();

    // Étape 1 : recherche locale en BDD
    const locales = [];

    if (types.includes('personne')) {
      const personnes = await prisma.personne.findMany({
        where: {
          OR: [
            { nom: { contains: termeNormalise } },
            { prenom: { contains: termeNormalise } },
          ],
        },
        select: { id: true, nom: true, prenom: true, rolePrincipal: true, statut: true, wikidataId: true },
        take: 10,
      });
      for (const p of personnes) {
        locales.push({
          id: p.id,
          type: 'Personne',
          nom: p.prenom ? `${p.prenom} ${p.nom}` : p.nom,
          rolePrincipal: p.rolePrincipal ?? null,
          statut: p.statut,
          wikidataId: p.wikidataId ?? null,
          source: 'local',
        });
      }
    }

    if (types.includes('organisation')) {
      const orgas = await prisma.organisation.findMany({
        where: {
          OR: [
            { nom: { contains: termeNormalise } },
            { sigle: { contains: termeNormalise } },
          ],
        },
        select: { id: true, nom: true, sigle: true, typeOrganisation: true, statut: true, wikidataId: true },
        take: 10,
      });
      for (const o of orgas) {
        locales.push({
          id: o.id,
          type: 'Organisation',
          nom: o.sigle ? `${o.nom} (${o.sigle})` : o.nom,
          typeOrganisation: o.typeOrganisation,
          statut: o.statut,
          wikidataId: o.wikidataId ?? null,
          source: 'local',
        });
      }
    }

    if (types.includes('site')) {
      const sites = await prisma.siteWeb.findMany({
        where: {
          OR: [
            { domaine: { contains: termeNormalise } },
            { titre: { contains: termeNormalise } },
          ],
        },
        select: { id: true, domaine: true, titre: true, statut: true },
        take: 10,
      });
      for (const s of sites) {
        locales.push({
          id: s.id,
          type: 'SiteWeb',
          nom: s.titre ?? s.domaine,
          domaine: s.domaine,
          statut: s.statut,
          source: 'local',
        });
      }
    }

    // Étape 2 : si aucun résultat local ET utilisateur authentifié → connecteurs externes
    let externes = [];
    if (locales.length === 0 && request.utilisateur) {
      try {
        const multiResultat = await rechercherMultiConnecteurs({
          query,
          types,
        });

        // Aplatir les préviews en format simplifié pour le frontend SelecteurEntite
        externes = (multiResultat.resultats ?? []).slice(0, 15).map((preview) => {
          const nomCandidat = preview.candidatsParChamp?.nom?.[0];
          const wikidataIdCandidat = preview.candidatsParChamp?.wikidataId?.[0];
          const bioCandidat = preview.candidatsParChamp?.bio?.[0];

          return {
            type: preview.typeSuggere,
            nom: nomCandidat?.valeur ?? '(sans nom)',
            bio: bioCandidat?.valeur ?? null,
            sourceConnecteur: nomCandidat?.source ?? 'externe',
            wikidataId: wikidataIdCandidat?.valeur ?? null,
            identifiantsExternes: preview.identifiantsExternes ?? {},
            // Transmettre la preview complète pour permettre l'import depuis le frontend
            preview,
          };
        });
      } catch (err) {
        // Erreur des connecteurs → ne pas planter, retourner [] avec un avertissement
        console.warn(`[recherche-globale] Connecteurs externes en erreur : ${err.message}`);
        externes = [];
      }
    }

    return { locales, externes };
  });
}
