# CLAUDE.md

Guidance pour Claude Code sur le projet **reseaux-influences** — plateforme collaborative de cartographie des réseaux d'influence + module d'enrichissement OSINT légal multi-sources.

## Statut projet — alpha fermée (ADR-010)

⚠️ **Le projet est en alpha fermée** jusqu'à audit juridique externe (avocat·e spécialisé·e données personnelles + droit des médias). Voir `ARCHITECTURE-DECISIONS.md` § ADR-010 pour les critères de levée.

Implications opérationnelles :

- `robots.txt` en `Disallow: /` total
- Aucune communication publique du projet
- Toute donnée importée reste en `EN_ATTENTE` par défaut (garde-fou ADR-006)
- Audit immuable (`AuditEnrichissement`) actif dès maintenant — preuve d'application art. 85 RGPD
- Documents préparatoires juridique : `docs/courriers/inpi-rbe-acces-interet-legitime.md` + `docs/courriers/note-acces-cadastre-nominatif.md`

## Avertissement — divergences README / code

Le `README.md` et `docs/plan-developpement.md` ont **dérivé** par rapport au code actuel. **Faire confiance au code, pas aux docs**.

| Annoncé README                  | Réalité code                                                            |
| ------------------------------- | ----------------------------------------------------------------------- |
| Django + DRF + Celery           | **Fastify 5** + Prisma 6 (Node 20+ ESM)                                 |
| PostgreSQL 16                   | **MySQL/MariaDB**                                                       |
| Redis + BullMQ                  | Aucun Redis — cache fichier disque (ADR-005)                            |
| Infomaniak Public Cloud         | **Infomaniak mutualisé** (Phusion Passenger via `app.js` racine)        |
| Backend port :3000              | Backend port **:3001** en dev local (Remotion bloque 3000)              |
| Tests `src/**/*.test.js`        | Tests `**tests/**/*.test.js**` (cf. `backend/jest.config.js`)           |
| « Visualisation D3 à venir »    | 4 vues complètes : Graphe D3 / Tableau / Carte Leaflet + IGN / Frise D3 |
| « Test suite vide »             | **235 tests Jest verts**, 28 suites                                     |
| Domaine `influence-network.net` | Domaine canonique `reseauxinfluences.fr` (ADR-001)                      |

## Démarrage local

Pré-requis : **Colima + Docker CLI + docker compose** (Docker Desktop incompatible macOS 13). Sur macOS Intel : `brew install colima docker docker-compose`.

```bash
# 1. Lancer Colima (VM Docker)
colima start --cpu 2 --memory 4

# 2. Préparer .env (le hook protect-sensitive bloque l'édition directe)
cp docs/env-dev-local.txt backend/.env

# 3. One-shot : Docker MariaDB + Prisma + seeds
./bin/dev-start.sh

# 4. Lancer en parallèle (2 terminaux)
cd backend && npm run dev      # Fastify :3001
cd frontend && npm run dev     # Vite :5173

# Compte démo créé par le seed
# remi@reseauxinfluences.fr / AlphaDev2026! (rôle ADMIN)
```

## Commandes

```bash
# Installation
npm run install:all

# Dev — 2 terminaux
cd backend && npm run dev      # Fastify :3001 watch mode + Swagger /docs
cd frontend && npm run dev     # Vite :5173 (proxy /api → backend :3001)

# Tests (Jest ESM, pattern tests/**/*.test.js)
cd backend && npm test
cd backend && npm test -- tests/connecteurs   # un sous-dossier
cd backend && npm test -- -t "nom du test"

# Lint
npm run lint                    # eslint backend + frontend

# Build
cd frontend && npm run build    # 540 kB JS gzip 174 kB (Leaflet + D3)

# Prisma (depuis backend/)
npm run db:generate             # client après modif schema
npm run db:push                 # sync schéma → DB (dev sans migration)
npm run db:migrate              # créer migration nommée (prod)
npm run db:studio               # UI :5555

# Seeds (depuis backend/)
npm run db:seed                  # types liens + badges + config gamification
npm run db:seed:demo             # corpus démo Bolloré/Macron (3 personnes + 2 orgas)
npm run db:seed:enrichi          # enrichissement multi-cibles via les 25 connecteurs
npm run db:seed:complement-geo   # retro-géocodage orgas existantes via BAN
node bin/seed-perso.js           # Rémi + PostHack + posthack.com (seed personnel)
```

## Architecture — points non-triviaux

### Entrée serveur

`app.js` racine → `backend/src/server.js`. Indirection **uniquement pour Phusion Passenger** (Infomaniak mutualisé). Ne pas supprimer.

En prod (`NODE_ENV=production`) : Fastify sert aussi `frontend/dist/` en static + SPA fallback. En dev : seul l'API tourne, Vite séparé.

### Modèle Lien polymorphe à 3 types (ADR-002)

`backend/prisma/schema.prisma` — un `Lien` connecte deux entités, chacune pouvant être **Personne / Organisation / SiteWeb** :

```
personneAId / organisationAId / siteWebAId  →  exactement UN non-nul
personneBId / organisationBId / siteWebBId  →  exactement UN non-nul
→ 9 combinaisons possibles (P-P, P-O, P-S, O-P, O-O, O-S, S-P, S-O, S-S)
```

Invariant **applicatif** (pas DB) — validation zod sur `routes/liens.js`. Toute requête sur les liens doit gérer les 9 combinaisons (hydratation 3 types dans `includes`).

### Modèles ajoutés (Passes 2-5)

- **SiteWeb** : domaine unique, registrar, hébergeurProbable, nameservers, statut
- **Parcelle** : référence cadastrale IGN (idu, codeInsee, section, contenance)
- **Evenement** + **ParticipationEvenement** : événements datés (élection, nomination, fusion…) avec géoloc, lié aux entités via table de jointure
- **AuditEnrichissement** : trace immuable (`onDelete: SetNull` sur user, ADR-008), IP tronquée + redaction emails
- Géolocalisation : `Personne.lieuNaissance/Lat/Lon`, `Organisation.adresseSiege/siegeLat/siegeLon/siegeCodeInsee`

## Module Enrichissement OSINT (cœur du projet)

### 25 connecteurs actifs

Sources publiques officielles uniquement (ADR-003) :

| Catégorie                 | Connecteurs                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| **Identité publique**     | wikidata (wbsearchentities + SPARQL ciblé)                                                         |
| **Entreprises FR**        | recherche-entreprises (Sirene/RNE), bodacc, hatvp, dataesr                                         |
| **Entreprises monde**     | gleif (LEI ISO 17442 — mères/filiales transnationales, ADR-021)                                    |
| **Influence UE**          | eu-transparence (lobbying, ADR-022), eu-fts (fonds UE, ADR-024), ted (marchés publics UE, ADR-025) |
| **Web**                   | rdap (bootstrap IANA → registries)                                                                 |
| **Géographie / cadastre** | ign-ban, ign-dvf, ign-carto-cadastre, ign-carto-gpu, ign-geoplateforme                             |
| **Politique**             | parlementaires (NosDéputés/NosSénateurs — Sénat désactivé, service mort 2024)                      |
| **Sanctions / leaks**     | open-sanctions (5 sub-datasets FR), icij-offshore-leaks (Panama/Paradise/Pandora)                  |
| **Veille presse**         | anticor (RSS), cour-des-comptes (RSS)                                                              |
| **Société civile**        | associations (RNA), annuaire-sante (RPPS)                                                          |
| **Stubs désactivés**      | wikileaks, ddosecrets — activables post-audit juridique ADR-010                                    |

### Architecture connecteur — `backend/src/connecteurs/`

- `base.js` : classe abstraite `BaseConnecteur`. La méthode `_appelHttp(url, opts)` gère **automatiquement** : cache disque SHA-256, rate-limit token-bucket, User-Agent, AbortController, validation anti-SSRF (whitelist hosts dans `HOSTS_AUTORISES`).
- `cache.js` : cache fichier `backend/.cache/connecteurs/` TTL 24 h (ou 30 j pour datasets bulk)
- `rate-limit.js` : bucket par connecteur, recharge via `hrtime.bigint`
- `registry.js` : chargement dynamique selon `ENRICHISSEMENT_CONNECTEURS_ACTIFS` (CSV `.env`)
- `audit.js` : `enregistrerAudit()` accepte un client Prisma (transaction) — appelé DANS `prisma.$transaction` (ADR C-02 atomicité)
- `normaliseur.js` : `creerEntiteNormalisee()` + `marquerProvenance()` (provenance par champ)
- `sources/<nom>.js` : chaque connecteur hérite de `BaseConnecteur`

### Routes API enrichissement

- `GET /api/enrichissement/connecteurs` — liste connecteurs actifs
- `POST /api/enrichissement/rechercher` — recherche multi-connecteurs en parallèle (`Promise.allSettled`)
- `POST /api/enrichissement/importer` — création transactionnelle EN_ATTENTE + audit
- `POST /api/enrichissement/recherche-globale` — auto-enrichissement : recherche locale d'abord, fallback externe si vide

### Routes API graphe / entité enrichie

- `GET /api/graphe/ego/:entiteId?profondeur=2` — ego-network avec hydratation 3 types
- `GET /api/graphe/timeline/:entiteId` — agrégation volume + intensité moyenne par période (mois/année)
- `GET /api/graphe/heatmap/:entiteId` — points géolocalisés pour Leaflet
- `GET /api/entites/:type/:id/foncier` — transactions DVF de la zone
- `GET /api/entites/:type/:id/cadastre` — parcelle cadastrale IGN
- `GET /api/entites/:type/:id/urbanisme` — zone PLU GPU

### Garde-fous RGPD (non-négociables)

1. **`qualiteInfluencePublique` obligatoire** à l'import (ADR-006) — enum 10 valeurs (ELU, DIRIGEANT, ARTISTE…). Refus 400 si vide.
2. **Statut import par défaut** : `EN_ATTENTE` — jamais `VALIDE` auto
3. **Audit immuable** (ADR-008) : `AuditEnrichissement.utilisateurId onDelete: SetNull` (jamais Cascade — préserve la trace après suppression user)
4. **Audit DANS la transaction** : si l'audit échoue, l'import rollback (C-02)
5. **Cadastre nominatif (MAJIC)** explicitement hors scope (ADR-003) — accès restreint DGFiP, voir `docs/courriers/note-acces-cadastre-nominatif.md`

## Gamification

Toute la logique dans `backend/src/services/gamification.js`. Mécaniques :

- **Seuil soumission** : 5 validations avant import (configurable via `ConfigGamification`)
- **Consensus** : `nb_validations_total ≥ 5` ET ratio vrai/faux ≥ 70 % → bascule `EN_ATTENTE` → `VALIDE`/`REJETE`
- **Niveaux** : DEBUTANT (0) → INTERMEDIAIRE (50) → EXPERT (200) → MODERATEUR (500)
- **Badges** : conditions JSON, types reconnus listés dans `verifierConditionBadge()` — étendre la fonction pour ajouter un type

## Authentification

JWT bearer dans `Authorization: Bearer <token>`, vérifié par `backend/src/middleware/auth.js` :

- `authenticate` — exige token valide, hydrate `request.utilisateur`
- `optionalAuth` — utilise le token s'il existe, sinon continue anonyme (utilisé sur les routes /graphe et /entites)
- `requireRole(['ADMIN', 'MODERATEUR'])`

`JWT_SECRET` ≥ 32 chars en prod (fail-fast au démarrage `server.js`).

## Frontend — `frontend/src/`

### Structure

- `api/client.js` — toutes les fonctions API (axios), token JWT auto depuis localStorage
- `pages/` — Accueil, Liens, Graphe, Profil, Enrichissement
- `components/graphe/` — **6 composants** : `SelecteurEntite` (autocomplete + auto-enrichissement), `GrapheD3`, `TableauGraphe`, `CarteChaleur` (Leaflet + leaflet.heat), `TimelineActivite` (D3 histogramme), `FiltresGraphe`, `LegendeGraphe`, `PanneauDetailGeo` (sections foncier/cadastre/urbanisme lazy-loaded)
- `components/enrichissement/` — **7 composants** : `FormulaireRecherche`, `PreviewEntite`, `BadgeProvenance`, `FormulaireImport`, `SelecteurQualiteInfluence`, `StatutConnecteur`, `RegionAnnonces`

### Pattern UI

- **4 vues graphe** (tablist accessible) : Graphe (D3 force-directed) / Tableau / Carte (Leaflet + tuiles IGN Géoplateforme) / Frise (D3 histogramme volume + intensité + score confiance)
- **Curseur temporel global** filtre les 4 vues simultanément sur `dateDebut`/`dateFin` des liens
- **Auto-enrichissement** : si recherche locale dans `SelecteurEntite` renvoie 0, déclenche automatiquement `recherche-globale` sur tous les connecteurs → dropdown secondaire « Trouvé dans les sources publiques » → import 1 clic
- **Accessibilité AAA** : ARIA tablist, `aria-live` polite, contrastes 7:1, focus visible 3:1, alternatives tableau pour le graphe SVG

### Dépendances frontend

`leaflet` + `leaflet.heat` ajoutés exceptionnellement (deps npm locales, pas CDN — ADR-015). D3 déjà présent. Pas d'autres deps UI externes.

## Pièges connus (bugs récurrents Implementer)

À éviter sur ce projet :

1. **Apostrophes françaises dans single-quote strings** → ✅ utiliser **double quotes** :

   ```js
   it("crée d'audit", ...)   // pas it('crée d'audit', ...)
   ```

2. **Mélange `?? || ` sans parenthèses** = SyntaxError :

   ```js
   ttlCache ?? (Number(env) || 86_400_000) // pas ttlCache ?? Number(env) || 86_400_000
   ```

3. **`import prisma from '../utils/prisma.js'`** → ❌ default import. Le module exporte `export const prisma`, donc :

   ```js
   import { prisma } from '../utils/prisma.js'
   ```

4. **`findUnique` sur champ non-`@unique`** → ❌ utiliser `findFirst`. Cas typique : `wikidataId` n'est pas unique sur Personne/Organisation.

5. **Wikidata SPARQL `CONTAINS(LCASE())`** = timeout 30 s. ✅ Utiliser `wbsearchentities` (REST MediaWiki) puis SPARQL ciblé via `VALUES`.

6. **BOM UTF-8 dans regex** = ESLint `no-irregular-whitespace`. ✅ Utiliser `/^﻿/` (escape Unicode) plutôt que le caractère littéral.

7. **OpenDataSoft v2.1 `?where=field like "X"`** invalide sur champs texte → ✅ utiliser `?q=X` (full-text).

8. **Annoncer « tests verts » sans lancer `npm test`** = bug récurrent. **Self-verify obligatoire** côté Implementer (les tests Jest mockent fetch, ne valident pas le runtime live).

9. **Le hook `protect-sensitive.sh`** bloque l'édition des fichiers `.env*`. Pour mettre à jour, éditer `docs/env-dev-local.txt` puis `cp -f` vers `backend/.env`.

10. **Process Remotion orphelins** peuvent bloquer ports 3000-3001 : `lsof -i :3001 -sTCP:LISTEN` puis `kill -9 <PID>`.

## Conventions

- **Langue** : tout en français (commits, commentaires, UI, JSDoc, noms métier)
- **Prettier** (`.prettierrc` racine) : single quotes, **sans semis** (`semi: false`), trailing commas all, printWidth 100
- **ESLint flat config** par sous-projet (`backend/eslint.config.js`, `frontend/eslint.config.js`)
- **Accessibilité** : WCAG 2.1 **AAA** visée (audit externe planifié avant ouverture publique)
- **Souveraineté** : zéro CDN externe, hébergement FR/CH
- **RGPD** : cookies essentiels uniquement, pas de tracker

## ADR documentés

Voir `ARCHITECTURE-DECISIONS.md` pour le détail :

| ADR | Sujet                                                        |
| --- | ------------------------------------------------------------ |
| 001 | Domaine canonique `reseauxinfluences.fr`                     |
| 002 | Lien polymorphe étendu à 6 colonnes (SiteWeb)                |
| 003 | Périmètre sources OSINT (Wikidata + RDAP + IGN multi-API)    |
| 004 | Pas de serveur MCP au MVP (connecteurs internes)             |
| 005 | Cache fichier disque (pas Redis)                             |
| 006 | `qualiteInfluencePublique` obligatoire RGPD                  |
| 008 | `AuditEnrichissement.utilisateurId` SetNull (audit immuable) |
| 010 | Phase alpha fermée jusqu'à audit juridique                   |
| 012 | Extension passe 2 (5 connecteurs leaks/sanctions)            |
| 013 | Garde-fous éthiques connecteurs leaks                        |
| 014 | Passe 3 : associations RNA + annuaire-santé RPPS             |
| 015 | Passe 4 : dimension géo-historique + Leaflet exception       |
| 016 | Passe 5 : Wikidata wbsearchentities + routes IGN par entité  |

ADR-007 (licence corpus CC-BY-SA vs MIT), ADR-009 (rendu public SSR), ADR-011 (levée alpha) **à créer plus tard**.

## CI

`.github/workflows/ci.yml` sur `main` et PR : lint + Prettier check + build frontend + tests backend + npm audit.

**Le build CI n'inclut pas `prisma generate`** — si une migration touche le client, lancer `npm run db:generate` localement avant push.

## Workspace context

Voir aussi `~/Developer/CLAUDE.md` (parent) pour les conventions transversales du workspace (tout en français, RGPD radical, priorité **Sécurité > Accessibilité > UX > SEO > Performance**).

Mémoire utilisateur : `~/.claude/projects/-Users-remi-Developer/memory/project_reseaux_influences.md` synthétise l'état du projet pour les sessions futures.
