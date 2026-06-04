# Plan d'implémentation — Module d'enrichissement OSINT légal

**Projet** : reseaux-influences
**Auteur** : Planner
**Date** : 2026-05-11
**Cible** : MVP intégré au backend Fastify 5 + frontend React 18 existants
**Statut** : à valider avant exécution

---

## 1. Synthèse (10 lignes)

Ajout d'un module **`enrichissement`** au monorepo existant permettant d'agréger des données issues de trois sources publiques officielles (Pappers / Sirene-RNE, Wikidata SPARQL, RDAP + DNS) pour pré-remplir des fiches `Personne`, `Organisation` et un nouveau type `SiteWeb`. L'agrégation est **synchrone** (pas de Redis sur l'hôte mutualisé Infomaniak), avec un **cache fichier disque** TTL 24 h et un **rate-limit par connecteur** type token-bucket en mémoire. Une **route `/api/enrichissement/rechercher`** interroge les connecteurs en parallèle et renvoie une **preview** où chaque champ porte sa **provenance** (source + URL + date). Une **route `/api/enrichissement/importer`** crée les entités en statut `EN_ATTENTE` et impose la déclaration d'une **`QualiteInfluence`** (élu, dirigeant, artiste, etc.) — garde-fou RGPD (art. 85 RGPD / art. 80 LIL). Une **table d'audit `AuditEnrichissement`** trace chaque opération. La **page React `Enrichissement`** propose recherche + preview + import sélectif (WCAG AAA). La **page `Graphe`** est refondue en ego-network 2 sauts D3 avec alternative tableau.

---

## 2. Points à valider avant exécution

Trois décisions bloquantes pour l'Implementer :

| #      | Sujet                                         | Question                                                                                                                                                                                                 | Recommandation Planner                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **V1** | Domaine canonique                             | Le README dit `reseauxinfluences.fr` (cohérent avec server.js ligne 53), `.env.example` ligne 7 dit `influence-network.net`. Lequel garder ?                                                             | `reseauxinfluences.fr` (déjà dans le code et le `swagger`). Aligner `.env.example` lors de la migration ce lot.                                                                                                                                                                                                                                                                                                                  |
| **V2** | Clé API Pappers                               | Rémi doit créer un compte sur https://www.pappers.fr/api (gratuit jusqu'à 1 000 requêtes/jour) et fournir la clé.                                                                                        | Bloquer V2 hors de la phase Build : utiliser une variable `PAPPERS_API_KEY` optionnelle ; si absente, le connecteur Pappers se désactive proprement (registry skip + log warn).                                                                                                                                                                                                                                                  |
| **V3** | Modélisation `SiteWeb` dans `Lien` polymorphe | Le `Lien` actuel a 4 colonnes (`personneAId`, `organisationAId`, `personneBId`, `organisationBId`). Ajouter `SiteWeb` → 6 colonnes (4 combinaisons → 9) et la contrainte applicative passe de 4 à 9 cas. | **Recommandation : étendre `Lien` à 6 colonnes** (`siteWebAId`, `siteWebBId`), conserver la même règle « exactement un de A, exactement un de B ». La table de jointure générique (`LienEntite` avec `entiteType` + `entiteId`) casserait la cohérence référentielle Prisma et imposerait un refactor de `routes/graphe.js`, `routes/liens.js`, `routes/export.js`. **À documenter dans `ARCHITECTURE-DECISIONS.md` (à créer).** |

**Stop net si V1/V3 ne sont pas tranchés.** V2 peut être différé (connecteurs Wikidata + RDAP suffisent pour démarrer).

---

## 3. Plan par lot

### Lot L1 — Architecture connecteurs (socle)

**Objectif** : fournir au Lot L2 un kit `BaseConnecteur` + cache + rate-limit + registry + audit, **testé et documenté**.

#### Fichiers à créer

| Chemin absolu                                                                           | Rôle                                                           | Exports clés                                                                                               | Dépendances                     |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `/Users/remi/Developer/reseaux-influences/backend/src/connecteurs/base.js`              | Classe abstraite `BaseConnecteur`                              | `class BaseConnecteur`                                                                                     | aucune (stdlib)                 |
| `/Users/remi/Developer/reseaux-influences/backend/src/connecteurs/cache.js`             | Cache fichier disque SHA-256                                   | `lireCache(cle, ttl)`, `ecrireCache(cle, donnees)`, `hashCle(connecteur, methode, args)`                   | `crypto`, `fs/promises`, `path` |
| `/Users/remi/Developer/reseaux-influences/backend/src/connecteurs/rate-limit.js`        | Token bucket en mémoire par connecteur                         | `creerBucket(nom, debit, capacite)`, `consommer(nom)` (async, attend si bucket vide)                       | `process.hrtime.bigint`         |
| `/Users/remi/Developer/reseaux-influences/backend/src/connecteurs/registry.js`          | Registry des connecteurs actifs lus du `.env`                  | `chargerConnecteurs()`, `obtenirConnecteur(nom)`, `listerConnecteurs()`                                    | imports dynamiques des sources  |
| `/Users/remi/Developer/reseaux-influences/backend/src/connecteurs/audit.js`             | Helper d'écriture `AuditEnrichissement`                        | `enregistrerAudit({ userId, requete, connecteursUtilises, entitesCreees, ipAddress })`                     | `prisma`                        |
| `/Users/remi/Developer/reseaux-influences/backend/src/connecteurs/normaliseur.js`       | Schéma interne commun + helpers de mappage                     | `creerEntiteNormalisee(type, champs, source)`, type-helpers `marquerProvenance(valeur, source, url, date)` | aucune                          |
| `/Users/remi/Developer/reseaux-influences/backend/tests/connecteurs/cache.test.js`      | Tests Jest cache                                               | tests CRUD + TTL expiré + hash stable                                                                      | `@jest/globals`, `fs/promises`  |
| `/Users/remi/Developer/reseaux-influences/backend/tests/connecteurs/rate-limit.test.js` | Tests Jest rate-limit                                          | tests rafale + recharge + concurrence                                                                      | `@jest/globals`                 |
| `/Users/remi/Developer/reseaux-influences/backend/tests/connecteurs/registry.test.js`   | Tests Jest registry (mocks ESM via `jest.unstable_mockModule`) | tests `.env` partiel, désactivation propre                                                                 | `@jest/globals`                 |
| `/Users/remi/Developer/reseaux-influences/backend/tests/connecteurs/audit.test.js`      | Tests Jest audit (mock Prisma)                                 | test écriture, redaction des champs sensibles                                                              | `@jest/globals`                 |

#### Fichiers à modifier

| Chemin absolu                                                     | Modification                                                                         |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `/Users/remi/Developer/reseaux-influences/.gitignore`             | Ajouter `backend/.cache/` (pour le cache disque)                                     |
| `/Users/remi/Developer/reseaux-influences/backend/.env.example`   | Voir tableau `.env` ci-dessous                                                       |
| `/Users/remi/Developer/reseaux-influences/backend/jest.config.js` | Aucun changement — le pattern `**/tests/**/*.test.js` couvre déjà notre arborescence |

#### Spécifications détaillées

**`base.js`** — classe abstraite, méthodes :

- `constructor({ nom, version, baseUrl, rateLimit, ttlCache })`
- `async rechercher(query, options)` → `{ resultats: EntiteNormalisee[], source, dateRecuperation, version }`
- `async detailler(id)` → `{ entite: EntiteNormalisee, source, dateRecuperation, version }`
- `async listerLiens(id)` → `{ liens: LienSuggere[], source, dateRecuperation, version }`
- Implémentation : lance `Error('non implémenté')`, à override par chaque connecteur
- Méthode helper `async _appelHttp(url, options)` qui appelle `cache.lireCache` → si miss, `rate-limit.consommer(this.nom)` → `fetch` (natif Node 20) → `cache.ecrireCache`. **User-Agent obligatoire** : `'reseauxinfluences.fr/1.0 (contact: <mailto défini dans env>)'`.

**`cache.js`** :

- Dossier `backend/.cache/connecteurs/`, **création récursive au runtime** (`fs.mkdir({ recursive: true })`)
- Clé = `sha256(JSON.stringify({ connecteur, methode, args }))` → 64 chars hex
- Fichier `<cle>.json`, contenu `{ ecritLe: ISO, donnees: ... }`
- `lireCache(cle, ttlMs)` : retourne `null` si fichier absent OU `Date.now() - ecritLe > ttlMs`
- TTL par défaut lu de `CACHE_TTL_MS` ou 86_400_000 (24 h)
- **Pas de purge automatique** dans le MVP (Implementer peut ajouter un cron applicatif post-MVP)
- Test obligatoire : deux appels identiques avec mock `fetch` → un seul appel réseau

**`rate-limit.js`** :

- Token bucket en mémoire (variable module-level `const buckets = new Map()`)
- `creerBucket(nom, { debit, capacite })` où `debit` = tokens/seconde, `capacite` = burst max
- `consommer(nom)` : si tokens ≥ 1 → décrémente, return ; sinon `await new Promise(r => setTimeout(r, ms_pour_1_token))`
- Recharge calculée à chaque consommation via `hrtime.bigint()` (pas de `setInterval` qui empêcherait le `--watch` de quitter)
- Test : 10 appels successifs avec débit 5/s → durée ≈ 1 s

**`registry.js`** :

- Lit `process.env.ENRICHISSEMENT_CONNECTEURS_ACTIFS` (CSV, défaut `'wikidata,rdap'`)
- Pour chaque nom, `await import('./sources/<nom>.js')` dynamique (try/catch + warn si échec)
- **Skip Pappers si `PAPPERS_API_KEY` absente** (log info, pas error)
- Exporte une `Map<nom, BaseConnecteur>` accessible par le lot L3

**`audit.js`** :

- `enregistrerAudit({ userId, requete, connecteursUtilises, entitesCreees, ipAddress })` → `prisma.auditEnrichissement.create()`
- **Redaction RGPD** : si `requete.query` ressemble à un email/téléphone → tronquer dans le log (regex simple)
- IP stockée sous forme **tronquée** (`192.168.1.0`) — `request.ip` Fastify, sans le dernier octet — pour limiter la profondeur identifiante

**`normaliseur.js`** :

- Type `EntiteNormalisee = { type: 'Personne'|'Organisation'|'SiteWeb', champs: { [nomChamp]: { valeur, source, url, date } }, liensSuggeres: [{ vers: { type, identifiantExterne }, typeLienCode, source, url, date }] }`
- Helpers : `marquerProvenance(valeur, { source, url, date })` retourne `{ valeur, source, url, date }`
- **Tous les champs récupérés par un connecteur DOIVENT passer par `marquerProvenance`** (invariant testé)

#### Tests à ajouter (L1)

- `cache.test.js` : 4 tests (écriture, lecture, TTL expiré, hash stable)
- `rate-limit.test.js` : 3 tests (rafale autorisée, blocage hors capacité, recharge progressive)
- `registry.test.js` : 3 tests (config par défaut, skip connecteur manquant, ordre déterministe)
- `audit.test.js` : 2 tests (écriture standard, redaction d'un email dans la query)

#### Variables `.env` à ajouter (`.env.example`)

```dotenv
# === Enrichissement OSINT ===
ENRICHISSEMENT_CONNECTEURS_ACTIFS="wikidata,rdap"
# Pappers — laisser vide pour désactiver le connecteur
PAPPERS_API_KEY=""
PAPPERS_RATE_LIMIT_DEBIT="5"          # tokens/seconde
PAPPERS_RATE_LIMIT_CAPACITE="5"
WIKIDATA_RATE_LIMIT_DEBIT="2"
WIKIDATA_RATE_LIMIT_CAPACITE="5"
RDAP_RATE_LIMIT_DEBIT="2"
RDAP_RATE_LIMIT_CAPACITE="3"
# Cache fichier disque
CACHE_TTL_MS="86400000"               # 24h
CACHE_DIR="./.cache/connecteurs"
# User-Agent envoyé aux APIs publiques
ENRICHISSEMENT_USER_AGENT="reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)"
```

#### Critères de done L1

- [ ] `cd backend && npm test -- tests/connecteurs` → 12+ tests verts
- [ ] `npm run lint` ne signale rien sur les nouveaux fichiers
- [ ] Le dossier `.cache/connecteurs/` est créé au premier appel test et gitignoré
- [ ] Aucun nouveau dépendance npm ajoutée (tout est stdlib + Prisma existant)

---

### Lot L2 — Trois connecteurs pivots (Pappers, Wikidata, RDAP)

**Objectif** : implémenter les trois connecteurs avec fixtures de test reproductibles.

#### Fichiers à créer

| Chemin absolu                                                                                         | Rôle                               | Couverture                                                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/Users/remi/Developer/reseaux-influences/backend/src/connecteurs/sources/pappers.js`                 | Connecteur Pappers API             | entreprises (SIREN), dirigeants, bénéficiaires effectifs                                                                                                                        |
| `/Users/remi/Developer/reseaux-influences/backend/src/connecteurs/sources/wikidata.js`                | Connecteur Wikidata SPARQL         | entités Q\* + propriétés P39 (mandat), P108 (employeur), P102 (parti), P26 (conjoint), P127 (propriétaire), P112 (fondateur), P98 (éditeur), P162 (producteur), P31/P279 (type) |
| `/Users/remi/Developer/reseaux-influences/backend/src/connecteurs/sources/rdap.js`                    | Connecteur RDAP + DNS              | titulaire domaine, dates, NS, hébergeur                                                                                                                                         |
| `/Users/remi/Developer/reseaux-influences/backend/tests/connecteurs/sources/pappers.test.js`          | Tests avec fixture JSON            | mock fetch, mappage normalisé                                                                                                                                                   |
| `/Users/remi/Developer/reseaux-influences/backend/tests/connecteurs/sources/wikidata.test.js`         | Tests SPARQL parsing               | mock fetch, fixture résultat SPARQL réel anonymisé                                                                                                                              |
| `/Users/remi/Developer/reseaux-influences/backend/tests/connecteurs/sources/rdap.test.js`             | Tests RDAP + DNS                   | mock fetch RDAP + mock `dns.promises.resolveNs`                                                                                                                                 |
| `/Users/remi/Developer/reseaux-influences/backend/tests/connecteurs/fixtures/pappers-entreprise.json` | Fixture réponse Pappers anonymisée | SIREN factice (`000000000`)                                                                                                                                                     |
| `/Users/remi/Developer/reseaux-influences/backend/tests/connecteurs/fixtures/wikidata-personne.json`  | Fixture SPARQL JSON-binding        | entité fictive `Q999999999`                                                                                                                                                     |
| `/Users/remi/Developer/reseaux-influences/backend/tests/connecteurs/fixtures/rdap-domain.json`        | Fixture RDAP `example.fr`          | format IANA standard                                                                                                                                                            |

#### Spécifications par connecteur

**`pappers.js`** :

- Endpoint base : `https://api.pappers.fr/v2`
- Méthodes :
  - `rechercher(query)` → `GET /recherche?api_token=…&q=…&par_page=20`
  - `detailler(siren)` → `GET /entreprise?api_token=…&siren=…`
  - `listerLiens(siren)` → reconstruction depuis `detailler` (dirigeants + bénéficiaires)
- Mappage normalisé :
  - `type: 'Organisation'`
  - `champs.nom`, `champs.sigle`, `champs.siret`, `champs.siren`, `champs.dateCreation`, `champs.pays = 'FR'`, `champs.formeJuridique`, `champs.adresseSiege` (chaîne, **pas géocodage** côté connecteur)
  - `champs.typeOrganisation` = `ENTREPRISE` par défaut (Implementer pourra raffiner via code APE plus tard)
- `liensSuggeres` : pour chaque dirigeant/BE → `{ vers: { type: 'Personne', identifiantExterne: nom+prénom+date_naissance }, typeLienCode: 'DIRIGEANT' ou 'BENEFICIAIRE_EFFECTIF', source: 'Pappers/RNE', url: lienPappers, date: dateRecuperation }`
- **Garde-fou** : si la `query` contient < 3 caractères → return `{ resultats: [], ... }` sans appel API
- JSDoc en tête : énumérer les champs Pappers utilisés et la fraîcheur (typiquement J+1 sur RNE)
- Couverture test : recherche, détail (avec fixture), gestion 401 (clé invalide), gestion 429 (rate limit serveur)

**`wikidata.js`** :

- Endpoint : `https://query.wikidata.org/sparql` (POST `query=…` + `Accept: application/sparql-results+json`)
- Méthodes :
  - `rechercher(query, { lang = 'fr' })` → SPARQL `SELECT` par `wdt:P31` (instance of) `Q5` (personne) ou `Q43229` (organisation), filtre `CONTAINS(LCASE(?label), …)` — pagination `LIMIT 20`
  - `detailler(qid)` → SPARQL pour récupérer label, description, P39, P108, P102, P26 (avec qualifiers `pq:P580/P582` dates), P127, P112, P98, P162
  - `listerLiens(qid)` → idem detailler, mappage spécifique
- **User-Agent obligatoire** (sinon ban Wikidata) — `process.env.ENRICHISSEMENT_USER_AGENT`
- Mappage normalisé :
  - Si `P31` parmi `Q5` → `type: 'Personne'`, sinon → `type: 'Organisation'`
  - `champs.wikidataId`, `champs.nom`, `champs.bio` (description), `champs.dateNaissance` (P569), `champs.pays` (P27 → label), `champs.wikipediaUrl` (sitelink frwiki si disponible)
- `liensSuggeres` mappage :
  - `P39` (position held) → `{ typeLienCode: 'MANDAT_ELECTIF', vers: { type: 'Organisation', identifiantExterne: <Q-ID institution> } }`
  - `P108` (employer) → `{ typeLienCode: 'EMPLOI', vers: { type: 'Organisation' } }`
  - `P102` (party) → `{ typeLienCode: 'AFFILIATION_PARTI', vers: { type: 'Organisation' } }`
  - `P26` (spouse) → `{ typeLienCode: 'CONJOINT', vers: { type: 'Personne' } }` ⚠️ **uniquement si la personne est elle-même publique** (P3373 fratrie volontairement omis — privacy)
  - `P127` (owned by), `P112` (founded by), `P98` (editor), `P162` (producer) → équivalents
- Couverture test : parsing SPARQL JSON-binding, gestion `?value.type === 'uri'` vs `'literal'`, gestion réponse vide
- ⚠️ **Wikidata est verbeux** : timeout SPARQL côté serveur = 60 s. Côté connecteur, AbortController à 30 s.

**`rdap.js`** :

- Endpoint bootstrap : `https://rdap.iana.org/domain/<domaine>` (suit la redirection vers le bon registry)
- DNS : `import { promises as dns } from 'node:dns'`, `dns.resolveNs(domaine)`, `dns.resolveMx(domaine)` (optionnel)
- Méthodes :
  - `rechercher(query)` : valide d'abord que `query` ressemble à un domaine (regex `^[a-z0-9-]+(\.[a-z0-9-]+)+$`), sinon return vide. **Ne pas** faire de fuzzy-search (RDAP ne le supporte pas).
  - `detailler(domaine)` → `GET /domain/<domaine>` (suit redirect automatique de fetch Node 20)
  - `listerLiens(domaine)` → reconstruit depuis `detailler` (titulaire, registrar, NS)
- Mappage normalisé :
  - `type: 'SiteWeb'`
  - `champs.domaine`, `champs.dateEnregistrement`, `champs.dateExpiration`, `champs.registrar`, `champs.statut` (clientHold, ok, etc.)
  - `champs.nameservers` (array)
  - `champs.hebergeurProbable` = label déduit du premier NS (ex: `ns1.ovh.net` → `OVH`) — **règle simple à hard-coder en mapping `Map<suffixeNs, libelle>`** (OVH, Gandi, Cloudflare, AWS, Infomaniak, etc.) — fallback `null` si inconnu
- `liensSuggeres` :
  - titulaire (entity role `registrant`) → `{ vers: { type: 'Personne ou Organisation', identifiantExterne: nom }, typeLienCode: 'TITULAIRE_DOMAINE' }` ⚠️ Très souvent **anonymisé par les registrars depuis le RGPD** → champ peut être `'REDACTED FOR PRIVACY'`, à détecter et omettre du `liensSuggeres`
  - hébergeur déduit → `{ vers: { type: 'Organisation', identifiantExterne: libelle }, typeLienCode: 'HEBERGE_PAR' }`
- Couverture test : domaine `.fr` avec redirect vers AFNIC RDAP, gestion REDACTED, mapping NS → hébergeur

#### Tests à ajouter (L2)

- `pappers.test.js` : 4 tests (recherche, détail, 401, 429)
- `wikidata.test.js` : 4 tests (recherche, détail, mapping P-\*, réponse vide)
- `rdap.test.js` : 4 tests (détail .fr, REDACTED handling, NS → hébergeur, domaine invalide)

#### Variables `.env` à ajouter (L2)

Aucune nouvelle au-delà du L1.

#### Nouveaux `TypeLien` à seeder

À ajouter dans `prisma/seed.js` (lot L4 ou L3, peu importe — à faire avant l'exécution réelle des imports) :

| code                    | libelle                     | categorie     |
| ----------------------- | --------------------------- | ------------- |
| `DIRIGEANT`             | Dirigeant·e de              | professionnel |
| `BENEFICIAIRE_EFFECTIF` | Bénéficiaire effectif·ve de | financier     |
| `MANDAT_ELECTIF`        | Mandat électif              | politique     |
| `EMPLOI`                | Emploi salarié              | professionnel |
| `AFFILIATION_PARTI`     | Affiliation à un parti      | politique     |
| `CONJOINT`              | Conjoint·e                  | familial      |
| `FONDATEUR`             | Fondateur·rice de           | professionnel |
| `EDITEUR_DE`            | Éditeur·rice de             | media         |
| `PRODUCTEUR_DE`         | Producteur·rice de          | media         |
| `TITULAIRE_DOMAINE`     | Titulaire du domaine        | numerique     |
| `HEBERGE_PAR`           | Hébergé·e par               | numerique     |
| `HEBERGEUR_DE`          | Hébergeur·euse de           | numerique     |
| `EDITEUR_DU_SITE`       | Éditeur·rice du site        | numerique     |

**Vérifier** dans `prisma/seed.js` les codes déjà présents avant de doublonner.

#### Critères de done L2

- [ ] `cd backend && npm test -- tests/connecteurs/sources` → 12+ tests verts
- [ ] Appel réel manuel (script jetable, non commit) sur un SIREN public (ex: `542065479` Total) → mappage cohérent
- [ ] Appel réel Wikidata sur `Q11008` (Emmanuel Macron) → P39, P26, P108 récupérés
- [ ] Appel réel RDAP sur `posthack.com` → titulaire/NS/dates renvoyés
- [ ] JSDoc complète sur chaque méthode publique (couverture champ + fraîcheur + limites)

---

### Lot L3 — Routes API enrichissement + extension graphe

**Objectif** : exposer `/api/enrichissement/{rechercher,importer}` et compléter `/api/graphe/ego/:entiteId`.

#### Fichiers à créer

| Chemin absolu                                                                            | Rôle                                                                               |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `/Users/remi/Developer/reseaux-influences/backend/src/routes/enrichissement.js`          | Routes Fastify de l'enrichissement                                                 |
| `/Users/remi/Developer/reseaux-influences/backend/src/services/enrichissement.js`        | Orchestration multi-connecteurs (parallel) + consolidation preview                 |
| `/Users/remi/Developer/reseaux-influences/backend/src/services/import-enrichissement.js` | Création des entités `Personne`/`Organisation`/`SiteWeb` + `Lien` brouillons en DB |
| `/Users/remi/Developer/reseaux-influences/backend/tests/routes/enrichissement.test.js`   | Tests d'intégration (mock Prisma + mock registry)                                  |
| `/Users/remi/Developer/reseaux-influences/backend/tests/services/enrichissement.test.js` | Tests unitaires service                                                            |

#### Fichiers à modifier

| Chemin absolu                                                           | Modification                                                                                                                                                                                                         |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/Users/remi/Developer/reseaux-influences/backend/src/server.js`        | Importer `enrichissementRoutes` et l'enregistrer sous `/api/enrichissement`. **Aussi** : ajouter le serveur URL canonique `reseauxinfluences.fr` si V1 tranchée.                                                     |
| `/Users/remi/Developer/reseaux-influences/backend/src/routes/graphe.js` | Ajouter route `GET /api/graphe/ego/:entiteId?profondeur=2&typesLien=…&statut=…` (le frontend Graphe.jsx en a besoin pour L5). Compléter les `lienIncludes` pour inclure `siteWebA`/`siteWebB` après migration L1bis. |
| `/Users/remi/Developer/reseaux-influences/frontend/src/api/client.js`   | Ajouter `postEnrichissementRechercher`, `postEnrichissementImporter`, `getGrapheEgo`                                                                                                                                 |

#### Spécifications détaillées

**`services/enrichissement.js`** :

- Export `async function rechercherMultiConnecteurs({ query, types, connecteurs, options })`
- Pour chaque connecteur sélectionné (intersection avec registry actif) : `Promise.allSettled([...])`
- **Pas de fail-fast** : si Pappers timeout, Wikidata et RDAP doivent quand même rendre leurs résultats
- Consolidation :
  - Dédoublonnage par `wikidataId`, `siren`, `domaine` quand présents
  - Fusion des champs : si deux connecteurs renvoient `nom`, **on conserve les deux** dans la preview (l'utilisateur choisira), pas de merge silencieux
  - Format de sortie : `{ resultats: PreviewEntite[], statutParConnecteur: { wikidata: 'ok'|'erreur'|'timeout', ... }, dureeMs }`
- `PreviewEntite = { typeSuggere, candidatsParChamp: { nom: [{ valeur, source, url, date }, …] }, liensSuggeres: [...], identifiantsExternes: { wikidataId?, siren?, domaine? } }`

**`services/import-enrichissement.js`** :

- Export `async function importer({ preview, choixUtilisateur, qualiteInfluencePublique, utilisateurId, ipAddress })`
- `choixUtilisateur` = `{ champsRetenus: { nom: <source choisie>, ... }, liensRetenus: [<index>], typeEntite: 'Personne'|'Organisation'|'SiteWeb' }`
- **Validation obligatoire** : si `qualiteInfluencePublique` est `null/undefined/''` → throw `Error('Qualité d\'influence publique requise (RGPD art. 85 + LIL art. 80)')`
- Transaction Prisma (`prisma.$transaction`) :
  1. Créer l'entité principale avec `statut = 'EN_ATTENTE'` + `qualiteInfluence` (nouvelle colonne, voir migration §4)
  2. Pour chaque source utilisée → créer `Source` (ou récupérer existante par `url` unique) avec `verifiee = false`, `creeParId = utilisateurId`
  3. Pour chaque lien retenu → résoudre la cible (recherche entité existante par `wikidataId`/`siren`/`domaine`, sinon créer `EN_ATTENTE`), puis créer `Lien` avec `statut = 'EN_ATTENTE'`, `sourceId` attaché
  4. `prisma.historique.create` pour chaque entité créée
  5. `audit.enregistrerAudit({...})`
- Retour : `{ entitePrincipaleId, entitesCreees: [...], liensCrees: [...] }`

**`routes/enrichissement.js`** :

```javascript
// Pseudo-code (à implémenter par l'Implementer)
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { peutSoumettre } from '../services/gamification.js';
import { rechercherMultiConnecteurs } from '../services/enrichissement.js';
import { importer } from '../services/import-enrichissement.js';
import { listerConnecteurs } from '../connecteurs/registry.js';

const rechercherSchema = z.object({
  query: z.string().min(2).max(200),
  types: z.array(z.enum(['personne', 'organisation', 'site'])).min(1),
  connecteurs: z.array(z.string()).optional(), // défaut = tous actifs
});

const importerSchema = z.object({
  preview: z.object({
    /* shape PreviewEntite */
  }),
  choixUtilisateur: z.object({
    /* shape choix */
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

export default async function enrichissementRoutes(fastify) {
  fastify.get('/connecteurs', { preHandler: [authenticate] }, async () => {
    return { connecteurs: listerConnecteurs() };
  });

  fastify.post('/rechercher', { preHandler: [authenticate] }, async (req, reply) => {
    const result = rechercherSchema.safeParse(req.body);
    if (!result.success)
      return reply.code(400).send({ error: 'Données invalides', details: result.error.flatten() });
    const reponse = await rechercherMultiConnecteurs(result.data);
    return reponse;
  });

  fastify.post('/importer', { preHandler: [authenticate] }, async (req, reply) => {
    const eligibilite = await peutSoumettre(req.utilisateur.id);
    if (!eligibilite.autorise) {
      return reply
        .code(403)
        .send({
          error: `Vous devez valider ${eligibilite.seuilRequis} liens avant.`,
          ...eligibilite,
        });
    }
    const result = importerSchema.safeParse(req.body);
    if (!result.success)
      return reply.code(400).send({ error: 'Données invalides', details: result.error.flatten() });
    try {
      const reponse = await importer({
        ...result.data,
        utilisateurId: req.utilisateur.id,
        ipAddress: req.ip,
      });
      return reply.code(201).send(reponse);
    } catch (err) {
      if (err.message.startsWith('Qualité')) return reply.code(400).send({ error: err.message });
      throw err;
    }
  });
}
```

**`server.js`** modifications :

- Ligne ~24 : `import enrichissementRoutes from './routes/enrichissement.js'`
- Ligne ~87 : `await fastify.register(enrichissementRoutes, { prefix: '/api/enrichissement' })`
- Ligne ~53 : si V1 tranchée, ajouter `{ url: 'https://reseauxinfluences.fr' }` dans `servers`

**`routes/graphe.js`** ajout (`/ego/:entiteId`) :

- Query params : `profondeur` (default 2, max 3), `typesLien` (CSV), `statut` (CSV, default `VALIDE,EN_ATTENTE`)
- Implémentation BFS : depuis l'entité racine, récupérer les liens directs (saut 1), puis pour chaque voisin, récupérer ses liens (saut 2), en évitant de revisiter les nœuds déjà vus
- Format de retour identique à `/api/graphe/entite/:id` mais avec champ supplémentaire `niveauSaut: 0|1|2` par nœud
- Inclure `SiteWeb` côté A et B (relations à ajouter dans `lienIncludes` après migration L1bis)

#### Tests à ajouter (L3)

- `tests/services/enrichissement.test.js` : 5 tests (parallélisme, fail un connecteur ne bloque pas, dédoublonnage, intersection registry, statutParConnecteur correct)
- `tests/routes/enrichissement.test.js` : 6 tests (401 sans token, 403 si seuil non atteint, 400 si query trop courte, 400 si qualiteInfluence absente, 201 import nominal, audit écrit)

#### Variables `.env` à ajouter (L3)

Aucune.

#### Critères de done L3

- [ ] `npm test` global → 30+ tests verts
- [ ] `curl -X POST http://localhost:3000/api/enrichissement/rechercher -H "Authorization: Bearer …" -d '{"query":"Macron","types":["personne"]}'` → réponse JSON avec preview + provenance
- [ ] Test manuel d'import : entité créée en `EN_ATTENTE` + ligne `AuditEnrichissement` + lignes `Historique`
- [ ] Swagger `/docs` documente les 3 nouvelles routes (les schémas zod ne génèrent pas auto — l'Implementer doit attacher manuellement `schema` à chaque route Fastify pour OpenAPI, **ou** documenter l'absence dans la PR)

---

### Lot L4 — UI React `Enrichissement`

**Objectif** : page accessible WCAG AAA permettant la recherche, la preview avec provenance, et l'import sélectif.

#### Fichiers à créer

| Chemin absolu                                                                                                   | Rôle                                                                         |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `/Users/remi/Developer/reseaux-influences/frontend/src/pages/Enrichissement.jsx`                                | Page racine (route `/enrichissement`)                                        |
| `/Users/remi/Developer/reseaux-influences/frontend/src/components/enrichissement/FormulaireRecherche.jsx`       | Form recherche (query + types + connecteurs)                                 |
| `/Users/remi/Developer/reseaux-influences/frontend/src/components/enrichissement/PreviewEntite.jsx`             | Carte preview avec provenance par champ                                      |
| `/Users/remi/Developer/reseaux-influences/frontend/src/components/enrichissement/BadgeProvenance.jsx`           | Badge cliquable (source + date + lien)                                       |
| `/Users/remi/Developer/reseaux-influences/frontend/src/components/enrichissement/StatutConnecteur.jsx`          | Indicateur de chargement par connecteur (ok / chargement / erreur / timeout) |
| `/Users/remi/Developer/reseaux-influences/frontend/src/components/enrichissement/SelecteurQualiteInfluence.jsx` | Select obligatoire (10 valeurs enum)                                         |
| `/Users/remi/Developer/reseaux-influences/frontend/src/components/enrichissement/RegionAnnonces.jsx`            | `aria-live="polite"` pour annoncer chargements/erreurs                       |

#### Fichiers à modifier

| Chemin absolu                                                                 | Modification                                                                                                                                   |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `/Users/remi/Developer/reseaux-influences/frontend/src/App.jsx`               | Ajouter `import Enrichissement from './pages/Enrichissement'` et `<Route path="/enrichissement" element={<Enrichissement />} />`               |
| `/Users/remi/Developer/reseaux-influences/frontend/src/components/Navbar.jsx` | Ajouter `<Link to="/enrichissement">Enrichir</Link>` — **visible uniquement si token présent dans localStorage** (lecture synchrone au render) |
| `/Users/remi/Developer/reseaux-influences/frontend/src/api/client.js`         | Ajouter trois fonctions API (cf. L3)                                                                                                           |
| `/Users/remi/Developer/reseaux-influences/frontend/src/index.css`             | Ajouter utilitaires `.sr-only`, `.focus-visible-ring` (focus-visible 3:1) si pas présents — vérifier d'abord                                   |

#### Spécifications WCAG AAA

- **Contrastes 7:1** sur tous les libellés/boutons/badges → palette ajustée (le `bg-primary` actuel `#1a365d` sur blanc = ~10:1 ✓, garder)
- **Focus visible 3:1 minimum** : ajouter classe Tailwind `focus:ring-2 focus:ring-offset-2 focus:ring-amber-500` sur tous les éléments interactifs
- **Cibles tactiles ≥ 44 px** : `min-h-[44px]` sur boutons et checkboxes (wrapper)
- **Navigation clavier** : ordre logique form → résultats → import ; chaque résultat a un `<article tabIndex={-1}>` pour ancre
- **Lecteurs d'écran** :
  - `<RegionAnnonces>` `aria-live="polite"` (PAS `assertive`) pour : « Recherche en cours sur 3 connecteurs », « 2 résultats trouvés », « Erreur sur le connecteur Pappers »
  - Chaque badge provenance a `aria-label="Source : Wikidata, consultée le 11 mai 2026"`
- **Pas de couleur seule** : statuts connecteurs = icône `✓ ⏳ ⚠️` + libellé texte + couleur (jamais couleur seule)
- **Form fields** :
  - `<label htmlFor>` explicite + `<input id>`
  - `aria-describedby` reliant le champ à son aide (« Minimum 2 caractères »)
  - Le select `qualiteInfluencePublique` est `required` et **n'a pas de valeur par défaut sélectionnée** (premier item disabled)
- **Pas d'animations** sans `@media (prefers-reduced-motion: reduce)` → loader = simple texte « Recherche… » (pas de spinner CSS sans guard)
- Texte d'aide explicite **avant** le form expliquant la base légale RGPD (`<aside role="note">` court — 2 lignes)

#### Comportement page `Enrichissement.jsx`

1. État : `{ query, types, connecteursActifs, preview, statutParConnecteur, choixUtilisateur, qualiteInfluence, statutImport }`
2. Au mount : `GET /api/enrichissement/connecteurs` pour afficher les connecteurs actifs en checkboxes (tous cochés par défaut)
3. Submit form → `POST /api/enrichissement/rechercher`, mise à jour preview et statutParConnecteur (l'API renvoie le détail par connecteur)
4. Sélection champs (checkboxes par candidat) + liens (checkboxes par lien suggéré) → mise à jour `choixUtilisateur`
5. Sélection `qualiteInfluencePublique` (obligatoire — bouton import disabled tant que vide)
6. Submit import → `POST /api/enrichissement/importer` → toast succès + lien vers la nouvelle entité (`/personnes/:id` ou `/organisations/:id`)
7. En cas d'erreur 403 (seuil gamification) → message clair pointant vers `/liens` pour valider d'abord

#### Tests à ajouter (L4)

⚠️ Le projet n'a **pas** de framework de test frontend installé (`frontend/package.json` n'a ni Vitest, ni Testing Library). **Décision Planner** : ne pas en introduire dans ce MVP — coût d'install non justifié par le runway PostHack. Documenter en TODO et tester manuellement avec une **checklist d'acceptation** dans la PR :

- [ ] Tab depuis l'URL parcourt : barre → form → preview → boutons import dans l'ordre logique
- [ ] Screen reader (VoiceOver macOS) annonce les changements de statut
- [ ] Désactiver JS → message statique acceptable
- [ ] Désactiver le CSS → contenu reste lisible (ordre DOM cohérent)
- [ ] Test contraste (axe DevTools ou Lighthouse) → 0 violation AAA

#### Variables `.env` à ajouter (L4)

Aucune côté frontend (les API URLs sont absolues via le proxy Vite ou `VITE_API_URL`).

#### Critères de done L4

- [ ] `cd frontend && npm run build` → 0 erreur, 0 warning
- [ ] Lighthouse Accessibility ≥ 95 sur la page (mesure dev local)
- [ ] axe DevTools : 0 violation critical/serious sur `/enrichissement`
- [ ] Capture d'écran clavier-only (focus visible sur chaque élément) jointe à la PR
- [ ] Mention de la base légale RGPD visible avant le form

---

### Lot L5 — Visualisation D3 ego-network

**Objectif** : remplacer le contenu actuel de `Graphe.jsx` (qui est **cassé** — consomme `data.nodes/links/nom_complet` alors que l'API renvoie `noeuds/aretes`) par un vrai ego-network 2 sauts D3 + alternative tableau.

⚠️ **Bug latent à corriger en passant** : le format consommé par `Graphe.jsx` actuel ne correspond pas au format de `routes/graphe.js`. Le Lot L5 inclut donc cette correction par construction.

#### Fichiers à créer

| Chemin absolu                                                                                 | Rôle                                            |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `/Users/remi/Developer/reseaux-influences/frontend/src/components/graphe/GrapheD3.jsx`        | Composant SVG D3 force simulation               |
| `/Users/remi/Developer/reseaux-influences/frontend/src/components/graphe/TableauGraphe.jsx`   | Alternative tableau accessible (toggle)         |
| `/Users/remi/Developer/reseaux-influences/frontend/src/components/graphe/FiltresGraphe.jsx`   | Filtres type lien / type entité / statut / date |
| `/Users/remi/Developer/reseaux-influences/frontend/src/components/graphe/LegendeGraphe.jsx`   | Légende couleurs **CUD-safe** + icônes + texte  |
| `/Users/remi/Developer/reseaux-influences/frontend/src/components/graphe/SelecteurEntite.jsx` | Autocomplete pour choisir l'entité racine       |

#### Fichiers à modifier

| Chemin absolu                                                            | Modification                                                                                                               |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `/Users/remi/Developer/reseaux-influences/frontend/src/pages/Graphe.jsx` | Réécriture : assemble `SelecteurEntite` + `FiltresGraphe` + (`GrapheD3` OU `TableauGraphe` selon toggle) + `LegendeGraphe` |
| `/Users/remi/Developer/reseaux-influences/frontend/src/api/client.js`    | Ajouter `getGrapheEgo(id, params)` (consomme `/api/graphe/ego/:id`)                                                        |

#### Spécifications

**`GrapheD3.jsx`** :

- Props : `{ noeuds, aretes, centreId, onSelectionNoeud }`
- Force simulation D3 : `forceLink` (distance 120), `forceManyBody` (strength -300), `forceCenter`, `forceCollide` (radius 30)
- Pan/zoom : `d3.zoom().scaleExtent([0.2, 4])`
- Recentrage : bouton « Recentrer » qui restaure `transform = identity`
- **Pas de drag souris seul** : ajouter aussi navigation clavier (`tabIndex={0}` sur chaque `<circle>`, `keydown` Enter/Space → ouvre détails)
- Tooltips au hover ET au focus (utiliser un `<title>` SVG **et** un `aria-describedby` pointant vers une zone hors-écran qui décrit le nœud focalisé)
- Couleurs nœuds (CUD-safe) :
  - Personne validée : `#2563eb` (bleu) + icône `●`
  - Personne en attente : `#2563eb` + halo pointillé + icône `◐`
  - Organisation : `#f59e0b` (orange) + icône `■`
  - SiteWeb : `#7c3aed` (violet) + icône `◆`
- Couleurs arêtes : déterminées par `typeLien.couleur` côté backend, override CUD-safe si conflit (ex: si type a `couleur: #ff0000`, le remplacer par `#dc2626` côté front + texte du libellé tjs visible)
- Trait pointillé pour les liens `EN_ATTENTE`, plein pour `VALIDE`

**`TableauGraphe.jsx`** :

- Toggle bouton « Afficher en tableau » accessible (`aria-pressed`)
- `<table>` avec caption, headers `<th scope="col">`, rows par arête : « De | Type lien | Vers | Statut | Source »
- Tri par colonne (clavier-friendly)

**`FiltresGraphe.jsx`** :

- Multi-select type lien (depuis `/api/liens/types/all`)
- Multi-select type entité (Personne, Organisation, SiteWeb)
- Multi-select statut (Validé / En attente)
- Range date (de / à) — natif `<input type="date">`
- Bouton « Réinitialiser »

**`LegendeGraphe.jsx`** :

- Affichage visible **toujours** (pas conditionnel)
- Chaque entrée = pastille couleur + icône + texte (3 redondances pour CUD)
- Note explicite : « La couleur n'est jamais le seul indicateur — icône et texte précisent toujours le type »

**`Graphe.jsx` (réécriture)** :

- État : `{ entiteRacineId, filtres, donnees, vueTableau, loading, erreur }`
- Si pas d'entité racine sélectionnée : afficher uniquement le `<SelecteurEntite>` + texte d'invitation
- Au choix d'entité : `GET /api/graphe/ego/:id?profondeur=2&...filtres`
- Bouton toggle vue (graphe / tableau)
- Lien permanent : `?entite=:id&profondeur=2` (sync URL ↔ état via React Router `useSearchParams`)

#### Tests à ajouter (L5)

Idem L4 (pas de framework test frontend) → checklist manuelle :

- [ ] Tab sur le graphe focalise les nœuds un par un (ordre stable)
- [ ] Enter sur un nœud focalisé → recentre OU ouvre détails (au choix de l'Implementer, mais documenté)
- [ ] Toggle tableau accessible avec `aria-pressed` correct
- [ ] `prefers-reduced-motion: reduce` → simulation D3 démarre avec `alphaDecay` élevé (convergence en 1-2 frames, pas d'animation perçue)
- [ ] Test grayscale (filtre CSS appliqué temporairement) : les types de nœuds restent identifiables par icône
- [ ] Lighthouse Accessibility ≥ 95 sur `/graphe`

#### Variables `.env` à ajouter (L5)

Aucune.

#### Critères de done L5

- [ ] La page `/graphe` n'affiche **plus** d'erreur console (le bug actuel `data.nodes` est résolu par construction)
- [ ] L'ego-network 2 sauts converge en < 2 s sur un dataset de 50 nœuds (mesure dev local)
- [ ] Le toggle tableau fonctionne et est navigable au clavier seul
- [ ] D3.js est déjà en dépendance (`frontend/package.json` ligne 14) — aucun ajout npm

---

## 4. Migrations Prisma

⚠️ **Une seule migration regroupée** recommandée — appelée `enrichissement-osint`. À lancer après V1/V3 tranchés.

### Pseudo-code Prisma à intégrer dans `schema.prisma`

```prisma
// =============================================================================
// SITES WEB (nouvelle entité)
// =============================================================================

model SiteWeb {
  id                String   @id @default(uuid()) @db.VarChar(36)
  domaine           String   @unique @db.VarChar(255)
  url               String?  @db.VarChar(500)
  titre             String?  @db.VarChar(500)
  description       String?  @db.Text
  dateEnregistrement DateTime? @map("date_enregistrement") @db.Date
  dateExpiration    DateTime? @map("date_expiration") @db.Date
  registrar         String?  @db.VarChar(255)
  hebergeurProbable String?  @map("hebergeur_probable") @db.VarChar(255)
  nameservers       Json     @default("[]")
  statut            StatutEntite @default(EN_ATTENTE)
  qualiteInfluence  QualiteInfluence? @map("qualite_influence")
  creePar           Utilisateur? @relation("SiteWebCreeePar", fields: [creeParId], references: [id], onDelete: SetNull)
  creeParId         String?  @map("cree_par") @db.VarChar(36)
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  liensCommeA       Lien[]   @relation("SiteWebA")
  liensCommeB       Lien[]   @relation("SiteWebB")

  @@map("sites_web")
}

// =============================================================================
// QUALITÉ D'INFLUENCE (enum)
// =============================================================================

enum QualiteInfluence {
  ELU
  HAUT_FONCTIONNAIRE
  LOBBYISTE
  DIRIGEANT
  ARTISTE
  PRODUCTEUR
  EDITEUR_PRESSE
  HEBERGEUR
  EDITEUR_SITE
  AUTRE
}

// Ajouter sur Personne :
//   qualiteInfluence  QualiteInfluence? @map("qualite_influence")

// Ajouter sur Organisation :
//   qualiteInfluence  QualiteInfluence? @map("qualite_influence")

// =============================================================================
// AUDIT ENRICHISSEMENT
// =============================================================================

model AuditEnrichissement {
  id                   String   @id @default(uuid()) @db.VarChar(36)
  utilisateur          Utilisateur @relation("AuditEnrichissementUtilisateur", fields: [utilisateurId], references: [id], onDelete: Cascade)
  utilisateurId        String   @map("utilisateur_id") @db.VarChar(36)
  dateAction           DateTime @default(now()) @map("date_action")
  requete              Json     // { query, types, connecteurs }
  connecteursUtilises  Json     @map("connecteurs_utilises") // { wikidata: 'ok', pappers: 'erreur', ... }
  entitesCreees        Json     @map("entites_creees")       // [{ type, id }, ...]
  ipAddressTronquee    String?  @map("ip_address_tronquee") @db.VarChar(45)

  @@index([utilisateurId, dateAction])
  @@map("audit_enrichissement")
}

// =============================================================================
// LIEN — étendre pour SiteWeb (V3 = option étendue)
// =============================================================================

model Lien {
  // ... (existant : personneA, organisationA, personneB, organisationB)

  // NOUVEAU
  siteWebA            SiteWeb?     @relation("SiteWebA", fields: [siteWebAId], references: [id], onDelete: Cascade)
  siteWebAId          String?      @map("site_web_a_id") @db.VarChar(36)
  siteWebB            SiteWeb?     @relation("SiteWebB", fields: [siteWebBId], references: [id], onDelete: Cascade)
  siteWebBId          String?      @map("site_web_b_id") @db.VarChar(36)

  // ... (reste inchangé)
}

// =============================================================================
// UTILISATEUR — ajouter relations
// =============================================================================

model Utilisateur {
  // ... (existant)
  sitesWebCrees        SiteWeb[]              @relation("SiteWebCreeePar")
  auditsEnrichissement AuditEnrichissement[]  @relation("AuditEnrichissementUtilisateur")
}
```

### Invariant applicatif à mettre à jour

`routes/liens.js` ligne 29-35 — la double `.refine(...)` doit passer de **« exactement un parmi 2 »** à **« exactement un parmi 3 »** (Personne OR Organisation OR SiteWeb) pour A et B.

### Étapes d'exécution

```bash
cd /Users/remi/Developer/reseaux-influences/backend
# 1. Backup DB Infomaniak avant (dump SQL manuel via phpMyAdmin Infomaniak)
# 2. Modifier schema.prisma (voir pseudo-code ci-dessus)
# 3. Générer la migration :
npm run db:migrate -- --name enrichissement-osint
# 4. Régénérer le client :
npm run db:generate
# 5. Seeder les nouveaux TypeLien :
npm run db:seed
```

### `ARCHITECTURE-DECISIONS.md` à créer

Chemin : `/Users/remi/Developer/reseaux-influences/ARCHITECTURE-DECISIONS.md`

Contenu minimal (template) :

```markdown
# Architecture Decisions — reseaux-influences

## ADR-001 (2026-05-11) — Lien polymorphe : extension à 3 types d'entités

**Contexte** : ajout de l'entité `SiteWeb` au modèle. Le `Lien` actuel a 4 colonnes (`personneAId`, `organisationAId`, `personneBId`, `organisationBId`).

**Options envisagées** :

1. Étendre à 6 colonnes (`siteWebAId`, `siteWebBId`)
2. Table de jointure générique `LienEntite(entiteType, entiteId, role: 'A'|'B')`
3. Modélisation graphe externe (Neo4j) — exclue, hors stack

**Décision** : option 1 (extension à 6 colonnes).

**Justification** :

- Préserve la cohérence référentielle Prisma (foreign keys propres)
- Aucun refactor de `routes/graphe.js`, `routes/liens.js`, `routes/export.js` au-delà de l'ajout du 3e cas
- Coût en colonnes nulles assumé (acceptable : un lien a 2 entités, donc 4 colonnes sont nulles par défaut sur 6)

**Conséquences** :

- L'invariant applicatif passe de « exactement un de {P, O} pour A et pour B » à « exactement un de {P, O, S} pour A et pour B » → mise à jour zod dans `routes/liens.js`
- Tous les `include` Prisma qui hydratent A/B doivent ajouter `siteWebA` et `siteWebB`
- Le helper `getNomEntite` de `routes/graphe.js` doit gérer le 3e cas

**Date d'effet** : à la livraison du Lot L1 du module enrichissement.
```

---

## 5. Risques et mitigations

| #   | Risque                                                                                                 | Probabilité            | Impact     | Mitigation                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------ | ---------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Wikidata change le format de réponse SPARQL JSON-binding                                               | Faible                 | Élevé      | Tests sur fixtures locales ; pin du `Accept: application/sparql-results+json` ; alerte si parsing échoue                                                                                        |
| R2  | Pappers durcit les rate limits (5/s peut devenir 1/s)                                                  | Moyenne                | Moyen      | Rate limit configurable via `.env`, valeur conservative au démarrage (2/s) + cache 24 h                                                                                                         |
| R3  | RDAP titulaire majoritairement `REDACTED`                                                              | Élevée                 | Faible     | Comportement attendu post-RGPD ; hébergeur déduit des NS reste fiable                                                                                                                           |
| R4  | Audit enrichissement crée beaucoup de lignes → table croît vite                                        | Faible (mono-user MVP) | Faible     | `@@index` sur `(utilisateurId, dateAction)` ; rotation/archivage post-MVP                                                                                                                       |
| R5  | Cache disque pollue le filesystem mutualisé Infomaniak (quota)                                         | Moyenne                | Moyen      | TTL 24 h ; ajout post-MVP d'un script de purge cron (`rm` fichiers > 7 j) ; `du -sh .cache/` documenté dans CLAUDE.md                                                                           |
| R6  | Phusion Passenger ne gère pas bien les imports dynamiques `registry.js`                                | Faible                 | Élevé      | Tester en environnement de staging Infomaniak avant prod ; fallback registry statique si besoin                                                                                                 |
| R7  | RGPD — un utilisateur tente d'enrichir un citoyen privé                                                | Moyenne                | Très élevé | Champ `qualiteInfluencePublique` **obligatoire** + texte d'avertissement avant le form + audit IP tronquée + page CGU à compléter post-MVP                                                      |
| R8  | Diffamation potentielle si un lien faux est créé et reste public                                       | Moyenne                | Élevé      | Statut `EN_ATTENTE` par défaut, **non public** tant que non validé par consensus (déjà géré par le filtre `statut: 'VALIDE'` dans `routes/personnes.js`, `routes/graphe.js`, `routes/liens.js`) |
| R9  | Performance — recherche parallèle sur 3 connecteurs peut dépasser le timeout Fastify par défaut (30 s) | Moyenne                | Moyen      | Timeout côté connecteur 25 s (AbortController) + `Promise.allSettled` → renvoie ce qu'on a même si un connecteur timeout                                                                        |
| R10 | Bug actuel `Graphe.jsx` (format incompatible) reste si Lot L5 n'est pas livré                          | Certain                | Faible     | Documenter dans la PR L1 que `/graphe` est cassé indépendamment ; idéalement livrer L5 dans le même sprint que L3                                                                               |
| R11 | Tests Jest ESM avec mock dynamique (`jest.unstable_mockModule`) capricieux                             | Moyenne                | Faible     | Documenter le pattern dans `tests/connecteurs/README.md` ; si trop coûteux, fallback sur injection de dépendance (passer `fetch` en arg)                                                        |

---

## 6. Ordre d'exécution recommandé (Phase 2 Build)

Graphe de dépendances :

```
L1 (socle)
 ├─→ L2 (sources) — peut être lancé en parallèle dès que L1.base.js + L1.normaliseur.js sont stables
 │   │
 │   └─→ Migration Prisma (séquentielle, doit précéder L3 service)
 │
 ├─→ Migration Prisma (peut être faite en parallèle de L2)
 │
 └─→ L3 (routes API) — dépend de L1 + L2 + migration
       │
       ├─→ L4 (UI Enrichissement) — dépend de L3
       │
       └─→ L5 (UI Graphe) — dépend de L3 (route `/ego/:id`)
             └─→ L4 et L5 sont parallélisables après L3
```

**Séquence recommandée pour un Implementer seul** :

1. **Jour 1 matin** — L1 complet (utilitaires + tests)
2. **Jour 1 après-midi** — Migration Prisma + seed des nouveaux TypeLien
3. **Jour 2 entier** — L2 (3 connecteurs + tests + fixtures + JSDoc)
4. **Jour 3 matin** — L3 (routes + services + tests)
5. **Jour 3 après-midi** — L4 (UI Enrichissement)
6. **Jour 4 matin** — L5 (Graphe D3 + tableau alternative)
7. **Jour 4 après-midi** — Pipeline audit (Security / Accessibility / Performance) + corrections

**Séquence parallèle (2 implementers)** :

- Implementer A : L1 → Migration → L2 → L3
- Implementer B : (attend fin L1) → L4 squelette avec mock data → branche-toi sur L3 quand prêt → L5

---

## 7. Critères de done globaux (avant clôture du module)

- [ ] `npm test` à la racine → 100% verts (>= 35 tests backend)
- [ ] `npm run lint` à la racine → 0 erreur, 0 warning
- [ ] `npm run format:check` → propre
- [ ] `npm run build` côté frontend → 0 erreur
- [ ] Migration Prisma appliquée et seed re-jouée
- [ ] `.env.example` à jour avec toutes les nouvelles variables
- [ ] `ARCHITECTURE-DECISIONS.md` créé avec l'ADR-001
- [ ] `CLAUDE.md` du projet mis à jour : table des projets + section enrichissement
- [ ] Audit manuel sur 3 cas réels :
  - [ ] Personne politique (ex: Q11008) → fiche + liens cohérents
  - [ ] Entreprise (SIREN public) → Pappers récupère dirigeants
  - [ ] Site web (`posthack.com`) → RDAP récupère titulaire + hébergeur
- [ ] Lighthouse Accessibility ≥ 95 sur `/enrichissement` ET `/graphe`
- [ ] Capture clavier-only jointe à la PR finale
- [ ] Zéro CDN ajouté, zéro tracker, zéro dépendance npm UI externe
- [ ] Pipeline complet via `/pipeline` passé (Security / A11y / UX / SEO / Perf / Eco / Content)

---

## Annexes

### A. Mapping rapide propriétés Wikidata → TypeLien

| Wikidata                         | Direction                                    | TypeLien.code                           | Notes                                   |
| -------------------------------- | -------------------------------------------- | --------------------------------------- | --------------------------------------- |
| P39 (position held)              | Personne → Organisation                      | MANDAT_ELECTIF                          | qualifiers P580/P582 = date début/fin   |
| P108 (employer)                  | Personne → Organisation                      | EMPLOI                                  |                                         |
| P102 (member of political party) | Personne → Organisation                      | AFFILIATION_PARTI                       |                                         |
| P26 (spouse)                     | Personne → Personne                          | CONJOINT                                | uniquement si conjoint est aussi public |
| P127 (owned by)                  | Organisation/SiteWeb → Organisation/Personne | (existe déjà ? sinon : PROPRIETAIRE_DE) | inversion direction                     |
| P112 (founded by)                | Organisation → Personne                      | FONDATEUR                               | inversion direction (Personne → Org)    |
| P98 (editor)                     | Organisation/SiteWeb → Personne              | EDITEUR_DE                              |                                         |
| P162 (producer)                  | Œuvre → Personne                             | PRODUCTEUR_DE                           | hors-scope MVP (pas d'entité Œuvre)     |

### B. Plan de fallback si `.cache/` indisponible

Si Infomaniak refuse l'écriture dans le dossier `.cache/connecteurs/` (quota / permissions), `cache.js` doit **dégrader proprement** vers un cache mémoire `Map` global (mêmes signatures), avec un log warn au démarrage. Pas de crash applicatif.

### C. Hors-scope MVP explicite

- Pas d'OAuth Pappers (clé API simple suffit)
- Pas d'OpenStreetMap / géocodage (adresse stockée en string)
- Pas de moteur de fuzzy-search entre entités (déduplication exacte par identifiant externe uniquement)
- Pas de scraping HCMaster, Transparency, JORF — reportés à un module v2 distinct
- Pas de scoring de fiabilité des sources (le `verifiee = false` initial suffit)
- Pas de WebSockets ni de polling — recherche synchrone bloquante côté UI (loader + `aria-live`)
- Pas de queue async (Bull/BullMQ exclu, cf. CLAUDE.md « pas de Redis »)

---

**Fin du plan. À valider par Rémi (points V1, V2, V3) avant lancement de la Phase Build.**
