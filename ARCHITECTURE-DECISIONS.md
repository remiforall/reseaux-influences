# Architecture Decision Records — reseaux-influences

Registre des décisions structurantes du projet, par ordre chronologique.
Convention : ADR-NNN, statut (Proposé / Accepté / Remplacé / Déprécié), date, contexte, décision, conséquences.

---

## ADR-001 — Domaine canonique : reseauxinfluences.fr

**Statut** : Accepté
**Date** : 2026-05-11
**Décideur** : Rémi Vincent

### Contexte

Divergence entre `README.md` (`reseauxinfluences.fr`), `backend/.env.example` (`influence-network.net`) et `backend/src/server.js` ligne 53 (`reseauxinfluences.fr` dans la doc Swagger).

### Décision

`reseauxinfluences.fr` est le domaine canonique. Alignement de `.env.example` lors du déploiement du module enrichissement.

### Conséquences

- `CORS_ORIGIN` par défaut : `https://reseauxinfluences.fr,https://www.reseauxinfluences.fr`
- User-Agent envoyé aux APIs externes : `reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)`
- Documentation Swagger : `https://reseauxinfluences.fr/api/docs`

---

## ADR-002 — Modélisation `SiteWeb` dans le `Lien` polymorphe : extension à 6 colonnes

**Statut** : Accepté
**Date** : 2026-05-11
**Décideur** : Rémi Vincent (sur reco Planner)

### Contexte

Le modèle `Lien` actuel est polymorphe à 2 types (`Personne`, `Organisation`) via 4 colonnes : `personneAId`, `organisationAId`, `personneBId`, `organisationBId`. L'invariant « exactement un de A non-nul, exactement un de B non-nul » est applicatif (zod sur `routes/liens.js`), pas DB.

Le module d'enrichissement OSINT introduit un troisième type d'entité, `SiteWeb` (titulaire de domaine, hébergeur, éditeur de site), qui doit pouvoir participer à un `Lien` (ex : `Personne` → `TITULAIRE_DOMAINE` → `SiteWeb` ; `SiteWeb` → `HEBERGE_PAR` → `Organisation`).

Deux options :

- **Option A — Extension à 6 colonnes** : ajouter `siteWebAId`, `siteWebBId`. Invariant applicatif élargi à 9 combinaisons (P-P, P-O, P-S, O-P, O-O, O-S, S-P, S-O, S-S).
- **Option B — Table de jointure générique** : nouvelle table `LienEntite` avec discriminator `entiteType` (`PERSONNE|ORGANISATION|SITEWEB`) + `entiteId`. Lien devient `Lien { id, typeLienId, source } → LienEntite[2]`.

### Décision

**Option A**. Justification :

- Préserve la cohérence référentielle Prisma (relations typées, validations DB)
- Préserve les routes existantes (`routes/liens.js`, `routes/graphe.js`, `routes/export.js`) — extension simple, pas de refactor
- Garde les jointures performantes (1 INDEX par colonne FK, vs scans de discriminator)
- Coût de l'invariant applicatif élargi : marginal (table de combinaisons explicites dans `routes/liens.js`)

### Conséquences

- Migration Prisma : ajout `siteWebAId`, `siteWebBId` sur `Lien` (nullable, FK vers `SiteWeb`)
- `routes/liens.js` : étendre la validation zod aux 9 combinaisons
- `routes/graphe.js` : compléter les `includes` pour hydrater les 3 types
- `routes/export.js` : étendre le mappage CSV/JSON
- Si un 4ᵉ type d'entité émerge (ex : `Parcelle` foncière), réévaluer cette ADR — au-delà de 8 colonnes (4 types × 2 positions), l'Option B redevient pertinente.

---

## ADR-003 — Périmètre des sources OSINT MVP : Wikidata + RDAP + IGN multi-API

**Statut** : Accepté
**Date** : 2026-05-11
**Décideur** : Rémi Vincent

### Contexte

Le module d'enrichissement OSINT doit nourrir le projet `reseaux-influences` à partir de sources publiques officielles. Pappers (entreprises) initialement prévu en connecteur pivot, mais clé API non encore obtenue. IGN ajouté pour couvrir la dimension géographique/foncière des réseaux d'influence.

### Décision

**Connecteurs MVP** :

1. **Wikidata SPARQL** — pivot relations entre personnes publiques et organisations (P39, P108, P102, P26, P127, P112, P98, P162)
2. **RDAP + DNS** — titulaire de domaine, hébergeur, dates pour entités `SiteWeb`
3. **IGN multi-API** — couverture géographique :
   - **API Adresse BAN** (`api-adresse.data.gouv.fr`) : géocodage adresses → lat/lon, code commune
   - **DVF** (`app.dvf.etalab.gouv.fr/api`) : transactions immobilières publiques depuis 2014 (prix, surface, type, **sans nom de propriétaire**)
   - **API Carto IGN** (`apicarto.ign.fr/api`) : cadastre parcelles, GPU urbanisme, AOC viticoles, RPG agricole
   - **Géoplateforme IGN** : fonds de plan pour affichage

**Connecteurs différés** :

- **Pappers** : intégré quand `PAPPERS_API_KEY` fournie (registry skip propre si absente)

**Connecteurs explicitement exclus du MVP** (post-MVP si traction) :

- HATVP, BODACC, JOAFE, Open Sanctions, CNC, MusicBrainz, BNF, CPPAP, ARCOM, JORF, registre UE Transparence, Wayback Machine, Certificate Transparency logs
- Toute source nécessitant scraping ou contournement de CGU
- Cadastre nominatif (fichiers fonciers MAJIC) — nécessite demande administrative motivée auprès de la DGFiP

### Conséquences

- Nouvelle entité Prisma `Parcelle` (référence cadastrale, commune, surface, géométrie GeoJSON optionnelle) — atterrissage des données IGN parcellaires
- Décision RGPD explicite : la **propriété foncière nominative n'est pas dans le scope**. Le module géo permet de visualiser le marché (DVF, parcelles), pas d'identifier des propriétaires.
- `BaseConnecteur` doit gérer la pluralité d'APIs derrière un même connecteur logique (IGN regroupe 5 endpoints) — soit 5 connecteurs distincts, soit 1 connecteur composite. **Reco** : 1 connecteur par endpoint pour rate-limit et cache indépendants (5 entrées dans le registry sous le préfixe `ign-`).
- Variables `.env` : 1 jeu de rate-limit par connecteur IGN (toutes APIs IGN sont en open data, pas de clé API requise sauf Géoplateforme tuiles cartographiques pour usage intensif — hors MVP).
- Tests : 1 fixture JSON par endpoint IGN.

---

## ADR-004 — Pas de serveur MCP pour les connecteurs (MVP)

**Statut** : Accepté
**Date** : 2026-05-11
**Décideur** : Rémi Vincent (sur reco Maestro)

### Contexte

Hypothèse initiale : exposer les sources OSINT via un serveur MCP, pour partage avec Claude Desktop et autres agents.

### Décision

**Connecteurs directs dans le backend Fastify**, pas de couche MCP intermédiaire pour le MVP.

### Justification

- Le frontend React appelle le backend Fastify directement, aucun bénéfice à passer par MCP
- Infomaniak mutualisé n'accepte qu'un seul process Node (Phusion Passenger via `app.js` racine) — un serveur MCP secondaire imposerait une infra séparée
- Latence supplémentaire et surface d'attaque élargie
- En post-MVP, si Rémi veut consommer ses propres connecteurs depuis Claude Desktop pour des sessions d'investigation agentic, un wrapper MCP qui consomme les modules `backend/src/connecteurs/sources/*.js` est trivial à extraire (~50 lignes).

### Conséquences

- Architecture connecteurs reste 100 % interne au backend Fastify
- Les modules `sources/*.js` exportent une classe instanciable hors contexte Fastify (importable par un futur wrapper MCP ou un script CLI d'enrichissement batch)

---

## ADR-005 — Cache fichier disque (pas Redis)

**Statut** : Accepté
**Date** : 2026-05-11
**Décideur** : Rémi Vincent (sur reco Planner)

### Contexte

Le projet est hébergé sur Infomaniak **mutualisé** (Phusion Passenger), pas de Redis disponible. Les appels aux APIs externes (Wikidata, RDAP, IGN) doivent être mis en cache pour respecter les politesses (User-Agent, rate-limits) et limiter la latence.

### Décision

Cache **fichier disque** sous `backend/.cache/connecteurs/`, clé `sha256(connecteur+méthode+args)`, TTL configurable (défaut 24 h).

### Conséquences

- `.gitignore` doit exclure `backend/.cache/`
- Création récursive au runtime (`fs.mkdir({ recursive: true })`) — pas de migration manuelle
- Pas de purge automatique au MVP (Implementer pourra ajouter un cron applicatif post-MVP)
- Si traction et migration vers Public Cloud Infomaniak avec Redis disponible, ADR à réviser

---

## ADR-008 — Conservation des `AuditEnrichissement` après suppression d'un utilisateur

**Statut** : Accepté
**Date** : 2026-05-11
**Décideur** : Rémi Vincent (sur fix Phase 4 — C-01 / SEC-C-02)

### Contexte

L'ancienne relation `AuditEnrichissement.utilisateur` portait `onDelete: Cascade`. En conséquence, la suppression d'un compte utilisateur (auto-suppression ou suppression admin) effaçait en cascade toutes ses entrées d'audit d'enrichissement OSINT. Cela viole :

- **Art. 5.1.f RGPD** (intégrité et confidentialité) : les logs constituent une preuve de traitement légitime.
- **Art. 5.2 RGPD** (accountability / responsabilité) : le responsable de traitement doit être en mesure de démontrer la conformité de ses traitements, y compris a posteriori lors d'une demande CNIL ou d'un incident.
- **Art. 30 RGPD** (registre des activités) : la traçabilité des importations est un élément du registre. Si les logs disparaissent avec l'utilisateur, il devient impossible de répondre à la question « qui a importé telle fiche, quand, depuis quelle source ».

### Décision

Modifier `AuditEnrichissement.utilisateur` : `onDelete: Cascade` → `onDelete: SetNull`, et rendre `utilisateurId` nullable (`String?`).

Ainsi, quand un utilisateur est supprimé :

- La ligne `AuditEnrichissement` est **conservée** avec `utilisateurId = NULL`.
- On sait qu'une opération a eu lieu, avec sa date, ses connecteurs et les entités créées.
- L'identité de l'opérateur est perdue (SetNull), ce qui respecte les droits à l'effacement de l'utilisateur (art. 17 RGPD) tout en préservant la traçabilité agrégée.

L'audit est désormais créé **à l'intérieur de la transaction Prisma** (`$transaction`) via `enregistrerAudit(params, tx)` — garantissant l'atomicité import ↔ audit (C-02). Si l'audit échoue, l'import rollback également.

### Base légale

- Art. 6.1.c RGPD : obligation légale (base légale pour la conservation des traces au-delà du retrait du consentement).
- Art. 5.2 RGPD : accountability — le responsable de traitement doit pouvoir prouver la conformité.
- Les logs d'enrichissement constituent le registre des activités de traitement exigé par l'art. 30 RGPD.

### Conséquences

- Migration Prisma : `utilisateurId` passe de `String @db.VarChar(36)` à `String? @db.VarChar(36)` (nullable).
- `onDelete: Cascade` → `onDelete: SetNull` sur la relation `utilisateur`.
- `enregistrerAudit()` dans `connecteurs/audit.js` accepte désormais un second paramètre `prismaClient` (défaut : client global) pour être appelé depuis une transaction.
- Si une demande RGPD art. 17 porte sur un utilisateur supprimé, les audits anonymisés (utilisateurId NULL) ne doivent PAS être supprimés — ils concernent des entités tierces, pas l'ancien utilisateur.
- Optionnel post-MVP : ajouter un champ `operateurExpurge` (ex : `r***@p***.fr`) figé à la création pour conserver une trace partielle lisible sans données identifiantes strictes.

---

## ADR-006 — Garde-fou RGPD : `qualiteInfluencePublique` obligatoire à l'import

**Statut** : Accepté
**Date** : 2026-05-11
**Décideur** : Rémi Vincent

### Contexte

Le projet `reseaux-influences` traite des données personnelles de personnes physiques sous le régime de l'exception journalisme/recherche (art. 85 RGPD + art. 80 loi Informatique et Libertés). Cette exception est strictement conditionnée au caractère **public** de la personne et au caractère d'**intérêt public** de l'information.

### Décision

À chaque import depuis le module d'enrichissement, l'utilisateur **doit déclarer** la qualité d'influence publique de la personne ou organisation importée, parmi :

`ELU`, `HAUT_FONCTIONNAIRE`, `LOBBYISTE`, `DIRIGEANT`, `ARTISTE`, `PRODUCTEUR`, `EDITEUR_PRESSE`, `HEBERGEUR`, `EDITEUR_SITE`, `AUTRE`.

Si le champ est vide → import refusé (HTTP 400, message explicite).

La déclaration est **stockée** sur l'entité (`Personne.qualiteInfluence`, `Organisation.qualiteInfluence`) et tracée dans `AuditEnrichissement`.

### Conséquences

- Migration Prisma : enum `QualiteInfluence` + colonne sur `Personne` et `Organisation`
- Service `importer()` lève `Error('Qualité d\'influence publique requise (RGPD art. 85 + LIL art. 80)')` si vide
- UI `Enrichissement.jsx` rend le champ obligatoire (`required` + validation client + message d'erreur explicite)
- Page publique des entités affiche le badge de qualité (transparence éditoriale)
- Documentation `/mentions-legales` cite cette ADR comme garde-fou opérationnel

---

## ADR-010 — Phase alpha fermée jusqu'à audit juridique externe

**Statut** : Accepté
**Date** : 2026-05-12
**Décideur** : Rémi Vincent

### Contexte

Le module d'enrichissement OSINT est fonctionnellement complet et passe ses tests, mais le périmètre juridique (RGPD art. 85, exception journalisme/recherche, AIPD CNIL, mentions légales, CGU) n'a pas encore été validé par un juriste spécialisé en données personnelles et droit des médias.

Les audits Phase 3 (Security Guardian, Content Strategist) ont identifié plusieurs prérequis avant toute ouverture publique :

- Rédaction d'une AIPD (Analyse d'Impact relative à la Protection des Données) — obligatoire pour ce type de traitement (donnée publique à grande échelle, risque pour droits et libertés)
- Page `/mentions-legales` formelle citant la base légale
- Page `/declaration-accessibilite` (modèle DINUM)
- CGU précisant l'interdiction d'enrichir des citoyens privés
- Politique de conservation des données (durées explicites)
- Procédure de droit d'opposition (art. 21 RGPD)

### Décision

Le projet reste en **alpha fermé** (accès Rémi uniquement, pas d'inscription publique, pas d'indexation moteurs) jusqu'à :

1. Audit juridique externe par un·e avocat·e ou juriste spécialisé·e en données personnelles + droit des médias
2. Rédaction de l'AIPD CNIL
3. Publication des pages légales obligatoires (mentions, accessibilité, CGU, politique de cookies)
4. Décision explicite d'ouverture publique (qui fera l'objet d'une ADR-011 dédiée)

### Conséquences

**Côté infrastructure** :

- `robots.txt` en `Disallow: /` total (toutes les routes, tous les bots, y compris IA crawlers)
- Pas de sitemap.xml exposé tant que l'ouverture publique n'est pas actée
- `llms.txt` conservé pour cohérence du standard mais sans effet (le `robots.txt` prime)
- Pas de référencement actif (pas de Google Search Console, pas de Bing Webmaster Tools)
- Recommandé : ajouter une auth basique HTTP (BasicAuth Phusion Passenger) en plus du JWT applicatif, pour empêcher tout accès non authentifié au frontend

**Côté pratiques internes** :

- Le garde-fou ADR-006 (`qualiteInfluencePublique` obligatoire) reste pleinement actif — même en alpha mono-user, la discipline éditoriale doit être respectée pour préparer l'ouverture
- L'audit `AuditEnrichissement` (ADR-008) reste actif et immuable — il constitue la preuve d'application de l'art. 85 dès maintenant
- Tous les enrichissements effectués en alpha doivent rester réutilisables après ouverture (pas de raccourcis qu'il faudrait défaire)

**Côté communication** :

- Toute mention publique du projet (CV, portfolio, posthack.com, posts) précise « alpha fermée, ouverture publique conditionnée à audit juridique »
- Pas de démonstration publique tant que l'audit n'est pas fait

**Côté priorisation post-pipeline** :

- Les chantiers SSR / sitemap dynamique / SEO public / JSON-LD intégré sont **différés**
- Les chantiers `/mentions-legales`, `/sources-et-methodes`, `/comment-ca-marche`, `/declaration-accessibilite`, CGU sont **gelés** jusqu'à l'audit (le juriste guidera leur rédaction)
- Les fixes techniques résiduels (perf, a11y AAA spécifique, refactor) peuvent continuer car ils améliorent la robustesse de la phase alpha

### Critères de levée

Cette ADR est remplacée par ADR-011 (à créer) le jour où :

1. Le juriste a rendu son rapport et ses recommandations
2. L'AIPD est rédigée et validée
3. Les pages légales sont publiées
4. La décision d'ouverture (totale, sur invitation, par lots de contributeurs accrédités) est tranchée

---

## ADR-012 — Extension du périmètre OSINT : 5 nouveaux connecteurs publics français

**Statut** : Accepté
**Date** : 2026-05-12
**Décideur** : Rémi Vincent

### Contexte

Le périmètre OSINT MVP (ADR-003) couvrait Wikidata, RDAP et les APIs IGN. Ces sources couvrent bien les entités géographiques et les sites web, mais laissent un angle mort important sur les acteurs institutionnels français :

- **Élus et hauts fonctionnaires** : aucune source structurée de mandats et déclarations d'intérêts
- **Annonces légales** : aucune source pour les créations, modifications, liquidations d'entreprises
- **Parlementaires** : aucune donnée sur les groupes, circumscriptions, affiliations partisanes actuelles
- **Recherche publique** : aucune couverture des laboratoires, EPST et établissements universitaires
- **Flux financiers santé** : les conventions entre laboratoires et professionnels de santé sont une source d'influence majeure non couverte

### Décision

Ajout de 5 connecteurs s'appuyant exclusivement sur des sources open data françaises :

| Connecteur              | Source                                        | Statut                            |
| ----------------------- | --------------------------------------------- | --------------------------------- |
| `hatvp.js`              | HATVP — déclarations d'intérêts et patrimoine | Fonctionnel (parseur XML regex)   |
| `transparence-sante.js` | Transparence Santé (Sunshine Act FR)          | Stub — post-MVP (voir ci-dessous) |
| `bodacc.js`             | BODACC — annonces commerciales (OpenDataSoft) | Fonctionnel                       |
| `parlementaires.js`     | NosDéputés.fr + NosSénateurs.fr               | Fonctionnel                       |
| `dataesr.js`            | DataESR — structures de recherche publiques   | Fonctionnel                       |

### Détail des écarts et reports

**Transparence Santé (stub)** : L'exploration des endpoints (2026-05-12) montre que :

- L'API OpenDataSoft renvoie des millions de lignes sans endpoint de recherche textuelle performant
- Le dataset CSV complet dépasse 500 Mo (incompatible avec le contexte Infomaniak mutualisé 512 Mo RAM)
- Un endpoint de recherche par bénéficiaire existe sur le site mais n'est pas documenté en API publique stable

Action requise post-MVP : identifier l'endpoint de recherche par bénéficiaire, implémenter avec pagination et cache disque. Nouveaux TypeLiens à ajouter : `AVANTAGE_RECU`, `CONVENTION_SIGNEE` (déjà dans seed.js en attente).

**HATVP — parseur XML regex** : Le fichier XML (~78 Mo) est parsé via regex car aucune dépendance npm n'est autorisée (contrainte architecture). Latence initiale 5–15 s au premier appel, compensée par un cache disque 7 jours. Le parseur couvre les champs principaux mais ne structure pas les déclarations de patrimoine détaillées (valeurs d'actifs, dettes). Ce niveau de détail est hors périmètre OSINT MVP.

### Sources reportées (prochaine passe)

- **Open Sanctions** : base de données internationale (sanctions, PEP, entités liées). Endpoint API disponible (`https://api.opensanctions.org/`) mais nécessite une clé API et une analyse juridique préalable (données sensibles sur personnes physiques — RGPD art. 85 applicable comme pour le reste du module).
- **Cour des comptes** : rapports publics structurés disponibles via data.gouv.fr, mais en format PDF/HTML non structuré. Nécessite un pipeline d'extraction dédié (OCR + parsing sémantique) hors périmètre MVP.
- **Anticor / autres associations** : données non disponibles via API publique structurée. Nécessite du scraping documenté ou un accord de partage de données.

### Nouveaux TypeLiens introduits (seed.js)

- `HAUT_FONCTIONNAIRE` : personne exerçant une haute fonction publique (HATVP)
- `AVANTAGE_RECU` : avantage reçu d'un laboratoire pharmaceutique (Transparence Santé — stub)
- `CONVENTION_SIGNEE` : convention signée entre professionnel de santé et laboratoire (stub)
- `MEMBRE_COMMISSION` : appartenance à une commission parlementaire
- `TUTELLE` : relation de tutelle institutionnelle (DataESR)

### Conséquences

- 5 nouveaux fichiers dans `backend/src/connecteurs/sources/`
- `DEFAUT_CONNECTEURS` étendu dans `registry.js`
- `HOSTS_AUTORISES` étendu dans `base.js`
- Variables `.env` documentées dans `docs/env-dev-local.txt`
- Le connecteur HATVP bypasse `_appelHttp` pour le téléchargement XML brut (fetch natif avec validation anti-SSRF via `validerUrlDestination` exportée de `base.js`)

---

## ADR-013 — Extension du périmètre OSINT : Passe 2 — leaks journalistiques + sanctions + veille presse

**Statut** : Accepté
**Date** : 2026-05-12
**Décideur** : Rémi Vincent

### Contexte

La Passe 1 (ADR-012) a couvert les sources institutionnelles françaises (HATVP, BODACC, parlementaires, DataESR). Il restait un angle mort important sur les réseaux offshore, les sanctions financières, les élus locaux (maires) et la veille journalistique anti-corruption.

### Décision

Ajout de 6 connecteurs :

| Connecteur               | Source                              | Type                    | Statut      |
| ------------------------ | ----------------------------------- | ----------------------- | ----------- |
| `icij-offshore-leaks.js` | ICIJ Panama/Paradise/Pandora Papers | Dataset bulk ZIP ~73 Mo | Fonctionnel |
| `open-sanctions.js`      | OpenSanctions — 5 sub-datasets FR   | Datasets bulk JSONL     | Fonctionnel |
| `anticor.js`             | Anticor — flux RSS articles         | RSS XML (veille)        | Fonctionnel |
| `cour-des-comptes.js`    | Cour des comptes — rapports RSS     | RSS XML (veille)        | Fonctionnel |
| `wikileaks.js`           | WikiLeaks                           | STUB DÉSACTIVÉ          | Stub propre |
| `ddosecrets.js`          | DDoSecrets                          | STUB DÉSACTIVÉ          | Stub propre |

### Garde-fous éthiques et juridiques

Ces connecteurs introduisent des sources de nature plus sensible que les connecteurs Passe 1.
Les mesures suivantes sont **obligatoires et non négociables** :

**1. Statut EN_ATTENTE par défaut**
Toutes les entités importées depuis ICIJ et OpenSanctions portent `statut: 'EN_ATTENTE'`.
Jamais de basculement automatique en `VALIDE`. Un humain doit valider chaque lien.

**2. Badge BadgeProvenance explicite**
Chaque entité porte un badge `badgeProvenance` avec :

- La source exacte (ex: "ICIJ Offshore Leaks — Panama Papers")
- L'avertissement : "Une mention n'implique pas d'illégalité. Vérifier avant publication."
- L'état : `EN_ATTENTE`

**3. Matching strict**
ICIJ : par identifiant ICIJ (`node_id`) ou nom + pays. Pas de fuzzy par nom seul.
OpenSanctions : par identifiant FtM ou nom normalisé. Pas de fuzzy.
Objectif : éviter les homonymies sur des figures publiques (risque diffamatoire).

**4. Cache disque long (30 jours)**
ICIJ et OpenSanctions : cache disque 30 jours. Pas de re-téléchargement quotidien des leaks.
RSS Anticor / Cour des comptes : cache 6 heures (flux d'actualité).

### Statut juridique par source

**ICIJ Offshore Leaks (Panama, Paradise, Pandora Papers)** :

- Données publiées par un consortium de 600 journalistes dans 90 pays
- Jurisprudence française (TGI Paris) et européenne valident leur exploitation journalistique
- Précédents : Le Monde, OCCRP, süddeutsche Zeitung ont publié sans condamnation
- Base légale RGPD : art. 85 (traitement journalistique/recherche)
- Risque résiduel : mentions de personnes privées (non publiques) → ne pas importer

**OpenSanctions (fr_assemblee, fr_senat, fr_maires, fr_amf, fr_tresor)** :

- Sources primaires sont des données officielles françaises (Journal Officiel, AMF, Trésor)
- OpenSanctions agrège et structure ces données open data
- Base légale RGPD : art. 6.1.e (mission d'intérêt public) + art. 85
- Licence CC BY-NC 4.0 — usage non-commercial confirmé (projet alpha non monétisé)

**Anticor RSS** :

- Articles d'une association anti-corruption agréée par le Ministère de la Justice
- Données publiques, licence ouverte
- Usage : veille éditoriale uniquement (pas d'import d'entités)

**Cour des comptes RSS** :

- Documents officiels de la Cour des comptes (institution constitutionnelle)
- Données publiques, domaine public
- typeMedia `DOCUMENT_OFFICIEL` — citations légalement sans restriction

**WikiLeaks (STUB)** :

- Désactivé — art. 323-3 Code pénal (recel données accès frauduleux)
- Certains datasets peuvent être légitimement utilisables en journalisme, mais nécessitent
  une analyse au cas par cas par un juriste avant activation

**DDoSecrets (STUB)** :

- Désactivé — mêmes risques que WikiLeaks + variabilité élevée selon les datasets
- Activation requiert : audit juridique + identification précise des datasets visés

### Architecture technique

**ICIJ** :

- Téléchargement unique du ZIP (~73 Mo) via `fetch` natif + `execFile('/usr/bin/unzip', [...])` (anti-injection shell — pas de `exec` avec interpolation)
- Filtrage en streaming ligne par ligne (CSV) pour ne garder que les nodes FR/DOM-TOM/Monaco/Andorre
- Index en mémoire Map<nomNormalise, node> + Map<id, node>
- Cache disque : `backend/.cache/connecteurs/icij/` (isolé du cache standard)

**OpenSanctions** :

- 5 datasets téléchargés séquentiellement (JSONL FtM)
- Parser JSONL ligne par ligne avec `text.split('\n')` + `JSON.parse`
- Index commun Map<nomNormalise, {entite, dataset}>
- Cache disque : clé hashée par dataset via `hashCle` standard

**Stubs WikiLeaks / DDoSecrets** :

- N'étendent PAS `BaseConnecteur` (pas de `creerBucket` inutile, pas d'entrée HOSTS_AUTORISES)
- Retournent des objets propres `{ resultats: [], avertissement: '...', version: '0.0.0-stub' }`
- Chargés normalement par le registry — ne produisent aucun résultat

### Nouveaux hôtes autorisés (HOSTS_AUTORISES dans base.js)

```
'icij-offshore-leaks': ['offshoreleaks-data.icij.org']
'open-sanctions':      ['data.opensanctions.org']
anticor:               ['www.anticor.org', 'anticor.org']
'cour-des-comptes':    ['www.ccomptes.fr']
```

WikiLeaks et DDoSecrets n'ont pas d'entrée (aucun appel réseau possible depuis les stubs).

### Conséquences

- 6 nouveaux fichiers dans `backend/src/connecteurs/sources/`
- 6 nouveaux fichiers de tests dans `backend/tests/connecteurs/sources/`
- `DEFAUT_CONNECTEURS` étendu dans `registry.js`
- `HOSTS_AUTORISES` étendu dans `base.js` (4 entrées)
- `docs/env-dev-local.txt` : 4 blocs RATE_LIMIT + documentation stubs
- Tests : 150 au total (105 passe 1 + 45 passe 2), tous verts
- Lint : 0 erreur (warnings préexistants non introduits par cette passe)

### Points d'attention post-MVP

- **Filtrage ICIJ** : seules les entités avec `countries` contenant FR/MCO/AND/DOM-TOM sont retenues.
  Si une requête ne trouve rien, c'est souvent normal (structure offshore sans référence FR explicite).
- **Volume OpenSanctions fr_maires** : 68 353 entités — indexation lente au premier appel (~5-10 s).
  Cache 30 jours, transparent pour les appels suivants.
- **Intégration UI** : les connecteurs RSS (Anticor, Cour des comptes) retournent `sources` (pas `resultats`).
  L'UI `Enrichissement.jsx` doit afficher ces sources séparément (rubrique "Articles liés").
- **Stubs à documenter dans l'UI** : afficher un badge "Désactivé — audit juridique requis" sur
  WikiLeaks et DDoSecrets dans le panneau de statut des connecteurs.

---

## ADR-014 — Extension du périmètre OSINT : Passe 3 — sphère associative + professionnels de santé

**Statut** : Accepté
**Date** : 2026-05-12
**Décideur** : Rémi Vincent

### Contexte

Les Passes 1 et 2 ont couvert les acteurs institutionnels français (élus, entreprises, hauts fonctionnaires, leaks journalistiques). Il restait deux angles morts importants pour la cartographie d'influence :

- **Sphère associative** : ~1,5 million d'associations loi 1901 actives en France. Les associations sont des acteurs d'influence majeurs (think tanks, lobbies structurés en association, fondations d'entreprise, associations de patients pilotées par des laboratoires). Aucune source structurée n'était intégrée.
- **Professionnels de santé** : le croisement avec Transparence Santé (stub ADR-012) requiert une base de professionnels de santé identifiables par nom. Le RPPS en libre accès constitue cette base.

### Décision

Ajout de 2 connecteurs :

| Connecteur          | Source                                   | Type                        | Statut      |
| ------------------- | ---------------------------------------- | --------------------------- | ----------- |
| `associations.js`   | RNA Waldec — Ministère de l'Intérieur    | Dataset bulk ZIP ~200 Mo    | Fonctionnel |
| `annuaire-sante.js` | Annuaire Santé RPPS — data.gouv.fr (ANS) | Dataset bulk ZIP ~50-100 Mo | Fonctionnel |

### Garde-fous éthiques et juridiques renforcés

#### Connecteur `associations.js`

**Absence de dirigeants nominaux dans le CSV waldec** :
Le Ministère de l'Intérieur a retiré les noms de dirigeants d'associations du dataset public après les décisions CJUE 2022 sur les données personnelles dans les registres publics. Le connecteur retourne donc uniquement les entités `Organisation` sans liens auto-générés vers des personnes physiques.

Ce comportement est **intentionnel et documenté** — il ne s'agit pas d'un bug. L'enrichissement en dirigeants se fera par croisement ultérieur avec :

1. Le BODACC (dirigeants d'associations déclarant des actes commerciaux)
2. Le JOAFE (Journal Officiel des Associations et Fondations d'Entreprise) — intégration post-MVP, après accord DILA sur les conditions d'accès aux données nominatives

#### Connecteur `annuaire-sante.js`

Ce connecteur présente un risque spécifique : **le profilage massif de 1,4 million de professionnels de santé privés**, dont la grande majorité n'exerce aucune influence publique particulière. Les mesures suivantes sont obligatoires et non contournables :

**1. Recherche minimum 3 caractères**
Seuil plus élevé que les autres connecteurs (minimum 2). Évite de répondre à des requêtes très courtes qui pourraient extraire des centaines de milliers de résultats.

**2. Limite stricte 25 résultats maximum**
Constante `LIMITE_MAX_RESULTATS = 25` dans le code. Même si l'appelant demande `limite: 1000`, la réponse ne dépassera pas 25 entrées. Objectif : empêcher l'extraction systématique du registre médical.

**3. `detailler()` désactivé**
La méthode `detailler(id)` retourne `entite: null` avec une note explicative. Justification : permettre un lookup par numéro RPPS transformerait le connecteur en annuaire médical interrogeable par identifiant pivot — risque de profilage à grande échelle (ex : dump de tous les médecins d'une région par numéros RPPS séquentiels). Seule la recherche par nom est exposée.

**4. `qualiteInfluence: 'AUTRE'` par défaut**
Un médecin libéral ou un pharmacien n'est pas automatiquement une personne d'influence publique au sens de l'art. 85 RGPD. L'utilisateur doit déclarer explicitement la qualité d'influence avant tout import (garde-fou ADR-006 toujours actif).

**5. Badge BadgeProvenance avec avertissement art. 85 RGPD**
Chaque entité porte un badge explicite : "Vérifier que la personne exerce bien une influence publique avant d'importer (article 85 RGPD)."

**6. Statut EN_ATTENTE systématique**
Cohérent avec ADR-006 et ADR-013. Aucun import automatique en `VALIDE`.

### Limites techniques documentées

**RNA Waldec — absence de dirigeants** : voir ci-dessus. Non contournable sans source complémentaire.

**Annuaire Santé — format CSV variable** : La version du dataset (colonnes, séparateur `;` ou `|`) peut varier selon les exports de l'ANS. Le connecteur détecte automatiquement le séparateur et cherche les colonnes par plusieurs noms alternatifs (ex: `"Nom d'exercice"` vs `NOM`). Si l'ANS modifie les noms de colonnes de façon majeure, le connecteur dégrades gracieusement (champs null) mais ne plante pas.

**URL dynamique via data.gouv** : les deux connecteurs résolvent l'URL du dernier dataset via l'API data.gouv avant chaque téléchargement. Si l'API data.gouv est indisponible, un fallback URL (URL construite avec la date du mois courant ou URL statique connue) est utilisé.

### Architecture technique

**RNA Waldec** :

- Résolution URL via `https://www.data.gouv.fr/api/1/datasets/repertoire-national-des-associations/`
- Téléchargement streaming → `backend/.cache/connecteurs/rna/rna_waldec.zip`
- Décompression via `execFile('/usr/bin/unzip', [...])` (anti-injection shell)
- Filtrage ligne par ligne sur `etat_asso = 'A'` (actif)
- Index `Map<nomNormalise, assoc>` + `Map<idRNA, assoc>`
- Cache disque 30 jours (configurable via `ASSOCIATIONS_TTL_DATASET_MS`)

**Annuaire Santé RPPS** :

- Résolution URL via `https://www.data.gouv.fr/api/1/datasets/annuaire-sante-extractions-des-donnees-en-libre-acces-des-professions/`
- Téléchargement streaming → `backend/.cache/connecteurs/annuaire-sante/`
- Décompression si ZIP via `execFile('/usr/bin/unzip', [...])`
- Détection automatique du séparateur (`;` ou `|`) sur la première ligne
- Index `Map<nomNormalise, professionnel>` (première occurrence par nom)
- Cache disque 30 jours (configurable via `ANNUAIRE_SANTE_TTL_DATASET_MS`)

### Whitelist HOSTS_AUTORISES

```
associations:    ['media.interieur.gouv.fr', 'www.data.gouv.fr']
annuaire-sante:  ['www.data.gouv.fr', 'static.data.gouv.fr']
```

### Conséquences

- 2 nouveaux fichiers dans `backend/src/connecteurs/sources/`
- 2 nouveaux fichiers de tests dans `backend/tests/connecteurs/sources/`
- `DEFAUT_CONNECTEURS` étendu dans `registry.js` (22 connecteurs au total)
- `HOSTS_AUTORISES` étendu dans `base.js` (2 nouvelles entrées)
- `docs/env-dev-local.txt` : 2 blocs de variables + documentation des garde-fous
- `ENRICHISSEMENT_CONNECTEURS_ACTIFS` dans `env-dev-local.txt` étendu
- Enum `TypeOrganisation.ASSOCIATION` déjà présent dans `schema.prisma` — aucune migration requise
- Tests : ~18 nouveaux tests (11 pour associations, 7 pour annuaire-santé)

### Post-MVP recommandé

1. **JOAFE** : après accord DILA, intégrer les avis de création/modification pour enrichir les associations en dirigeants nominaux (président, trésorier, secrétaire).
2. **Transparence Santé** : croiser l'annuaire RPPS avec les avantages déclarés par les laboratoires (stub ADR-012 à compléter) → `TypeLien.AVANTAGE_RECU`, `TypeLien.CONVENTION_SIGNEE`.
3. **Fédérations associatives** : le champ `groupement` du CSV waldec peut être exploité pour inférer des liens d'appartenance entre associations et fédérations nationales (UNAF, Ligue de l'Enseignement, etc.).

---

## ADR-016 — Passe 5 : connecteurs IGN pleinement exploités + 3 bugs résiduels corrigés

**Statut** : Accepté
**Date** : 2026-05-13
**Décideur** : Rémi Vincent

### Contexte

La Passe 4 avait introduit les colonnes géographiques (`lieuNaissance*`, `siege*`, `adresseSiege`) et les connecteurs IGN. Mais trois bugs empêchaient l'exploitation réelle de ces données :

1. **L1** : `CHAMPS_AUTORISES.Personne` ne contenait pas `lieuNaissance`, `lieuNaissanceLat`, `lieuNaissanceLon`, `lieuNaissanceCodeInsee` → les données P19/P625 extraites par Wikidata étaient silencieusement ignorées à l'import.
2. **L2** : `tx.lien.create` n'incluait pas `dateDebut`/`dateFin` depuis `lienSuggere` → les qualifiers P580/P582 récupérés par Wikidata étaient perdus.
3. **L3** : La requête `CONTAINS(LCASE(?label), "macron")` de `wikidata.js#rechercher()` est non-indexée par Wikidata et timeout systématiquement sur les termes courants (> 30 s côté client).

### Décisions

#### Pivot recherche Wikidata : SPARQL CONTAINS → wbsearchentities + SPARQL VALUES (L3)

**Stratégie** :

1. Appel REST `wbsearchentities` (`www.wikidata.org/w/api.php?action=wbsearchentities`) → top 10 Q-IDs en < 1 s (API indexée utilisée par la barre de recherche Wikipedia)
2. SPARQL `VALUES ?entite { wd:Q123 ... }` ciblé uniquement sur ces IDs → récupération type + description en < 2 s supplémentaires
3. Fallback gracieux : si SPARQL échoue, retourner les résultats REST seuls (type non filtré)

**Sécurité** (C-03 maintenu) : les Q-IDs extraits des résultats REST sont validés par regex `/^Q\d+$/` avant interpolation dans le SPARQL. Aucune donnée utilisateur n'est interpolée directement.

**HOSTS_AUTORISES** : ajout de `www.wikidata.org` à la whitelist du connecteur `wikidata`.

#### Routes fiche enrichie IGN (L4)

Trois nouvelles routes dans `backend/src/routes/entites.js` :

| Route                                  | Source       | Données                                                         |
| -------------------------------------- | ------------ | --------------------------------------------------------------- |
| `GET /api/entites/:type/:id/foncier`   | DVF Etalab   | Transactions immobilières 12 mois, prix médian, surface médiane |
| `GET /api/entites/:type/:id/cadastre`  | IGN Cadastre | Parcelle principale + 5 attenantes                              |
| `GET /api/entites/:type/:id/urbanisme` | IGN GPU      | Zone PLU au point de géoloc                                     |

**Garde-fous RGPD** :

- DVF : aucun nom de propriétaire (loi ELAN 2018)
- Cadastre : parcelle géographique uniquement
- GPU : zonage réglementaire public
- Entités `EN_ATTENTE` réservées aux utilisateurs authentifiés (ADR-010)
- `optionalAuth` sur toutes les routes : pas d'obligation de connexion pour les fiches `VALIDE`

#### Champs lieuNaissance\* peuplés à l'import (L1)

`CHAMPS_AUTORISES.Personne` étendu, `tx.personne.create` complété avec les 4 champs géographiques (conversion en `Number()` pour `lat`/`lon` au cas où la valeur serait une string SPARQL).

#### dateDebut/dateFin transférés vers les Lien (L2)

`tx.lien.create` inclut désormais `parseDate(lienSuggere.dateDebut)` et `parseDate(lienSuggere.dateFin)`. La fonction `parseDate` ajoutée en Passe 4 couvre les formats SPARQL.

#### Géocodage rétroactif (L5)

Script `backend/bin/seed-complement-geo.js` : complète les organisations validées sans `adresseSiege` via l'API `recherche-entreprises`, puis lance `geocoderEntitesEnLot(200)` pour résoudre les coordonnées. Idempotent, supporte `--dry-run`.

#### Frontend : sections géo dans le panneau de détail (L6)

Composant `PanneauDetailGeo.jsx` avec 3 sections `<details><summary>` (chargement lazy, semantic HTML, accessibilité AAA) inséré dans le panneau de détail nœud de `Graphe.jsx`. Helpers `getEntiteFoncier`, `getEntiteCadastre`, `getEntiteUrbanisme` ajoutés dans `api/client.js`.

### Conséquences

- `backend/src/connecteurs/base.js` : `HOSTS_AUTORISES.wikidata` étendu avec `www.wikidata.org`
- `backend/src/connecteurs/sources/wikidata.js` : méthode `rechercher()` réécrite + ajout `_mappageRechercheRest()`
- `backend/src/services/import-enrichissement.js` : CHAMPS_AUTORISES + `personne.create` + `lien.create`
- `backend/src/routes/entites.js` : nouveau fichier (3 routes)
- `backend/src/server.js` : enregistrement `entitesRoutes` sous `/api/entites`
- `backend/bin/seed-complement-geo.js` : nouveau script
- `frontend/src/api/client.js` : 3 nouveaux helpers
- `frontend/src/components/graphe/PanneauDetailGeo.jsx` : nouveau composant
- `frontend/src/pages/Graphe.jsx` : intégration `PanneauDetailGeo`
- Tests : `backend/tests/routes/entites.test.js` (16 tests couvrant les 3 routes)
- Si les APIs IGN sont indisponibles : toutes les routes retournent 200 avec payload vide propre (pas de 500)

---

## ADR-015 — Passe 4 : dimension géo-historique + auto-enrichissement UX + Leaflet

**Statut** : Accepté
**Date** : 2026-05-13
**Décideur** : Rémi Vincent

### Contexte

La Passe 3 a livré 150+ tests verts mais avec des connecteurs cassés en runtime (format CSV `rna_import` vs `rna_waldec`, URL 404 sur l'Annuaire Santé). La Passe 4 consolide ces régressions et ajoute la dimension temporelle et géographique manquante pour une vraie visualisation de réseaux d'influence.

### Décision — 6 lots

**L1 — Fix connecteurs runtime** :

- `associations.js` : le ZIP `rna_import` contient ~100 CSV par département (pas un seul fichier `rna_waldec`). Correction : itération sur tous les fichiers `rna_import_*_dpt_*.csv`, filtre sur `position = 'A'` (format import) et non `etat_asso = 'A'` (format waldec), mappage des colonnes réelles (`titre`, `objet`, `adr1/adr2/adr3`, `adrs_codepostal`, `libcom`, `siteweb`, `date_creat`). BOM UTF-8 retirée sur la clé `id`.
- `annuaire-sante.js` : URL fallback 404 remplacée par une résolution dynamique en 2 passes (recherche textuelle data.gouv + slug direct). Si aucune URL résoluble : index vide, `rechercher()` retourne `[]` sans planter.

**L2 — Migration Prisma** :

- `Personne` : ajout `lieuNaissance`, `lieuNaissanceCodeInsee`, `lieuNaissanceLat`, `lieuNaissanceLon`
- `Organisation` : ajout `siegeLat`, `siegeLon`, `siegeCodeInsee`, `adresseSiege`
- Nouveaux modèles : `Evenement` (avec enum `TypeEvenement`, 14 valeurs) et `ParticipationEvenement` (polymorphe Personne/Organisation/SiteWeb, cohérent ADR-002)
- `TypeLien` : ajout `ANCIEN_MANDAT` et `EX_CONJOINT` dans le seed

**L3 — Backend services et routes** :

- `wikidata.js` : requête SPARQL étendue pour P19 (lieu de naissance) + P625 (coordonnées), P569/P570 (dates naissance/décès), dates début/fin sur tous les mandats
- `geocoder.js` : service d'appel à l'API Adresse BAN (IGN / data.gouv.fr) pour géocodage en live + en lot
- Route `GET /api/graphe/timeline/:entiteId` : agrégat des liens par période (year/month), avec liste des Evenement liés
- Route `GET /api/graphe/heatmap/:entiteId` : points géolocalisés des entités liées (lat/lon des Personne.lieuNaissanceLat et Organisation.siegeLat)
- Route `POST /api/enrichissement/recherche-globale` : recherche locale d'abord, puis connecteurs externes si 0 résultat et utilisateur authentifié

**L4/L5 — Frontend composants** :

- `CarteChaleur.jsx` : Leaflet + leaflet.heat, fond IGN Géoplateforme WMTS, légende CUD-safe, alternative tableau accessible AAA
- `TimelineActivite.jsx` : histogramme D3, curseur `<input type="range">` natif, marqueurs événements, alternative tableau AAA

**L6 — Frontend pages** :

- `Graphe.jsx` : 4 vues via `role="tablist"` (Graphe / Tableau / Carte / Timeline), curseur temporel global qui filtre les arêtes, état partagé
- `SelecteurEntite.jsx` : dropdown secondaire "Sources publiques", modale d'import avec qualiteInfluencePublique obligatoire (ADR-006), annonce aria-live

### Justification — exception Leaflet (zéro CDN ≠ zéro dep npm)

La contrainte « zéro CDN externe » s'applique aux assets chargés depuis les navigateurs des utilisateurs (Google Fonts, trackers, polices tierces). L'installation de `leaflet` et `leaflet.heat` comme dépendances npm locales ne viole pas ce principe : les fichiers JS/CSS sont bundlés dans `frontend/dist/` par Vite et servis depuis `reseauxinfluences.fr` — aucun appel réseau vers cdn.jsdelivr.net ou unpkg.com. La tuile IGN Géoplateforme est une exception acceptable : l'IGN est une infrastructure publique française (EPST), non commerciale, sans tracking, dans la logique de souveraineté numérique du projet.

### Conséquences

- `npx prisma db push` requis pour les nouvelles colonnes et tables
- `npx prisma generate` requis pour le nouveau client TypeScript
- Le service `geocoder.js` ne cache pas les coordonnées en disque — elles sont persistées directement en DB (voir ADR-005 : pas de Redis, cache disque uniquement pour les connecteurs)
- Tests Jest pour les nouvelles routes à compléter en Passe 5 (non bloquant pour le runtime)
- La route `/api/graphe/timeline/:entiteId` retourne `evenements: []` si la table `participations_evenement` n'existe pas encore en base (try/catch gracieux)
- La route `POST /api/enrichissement/recherche-globale` est optionnelAuth — elle est accessible sans token pour la partie locale (privacy-first : ne pas forcer l'authentification pour une recherche simple)

---

## ADR-017 — Pattern Connecteur OSINT : contrat stable et garde-fous obligatoires

**Statut** : Accepté
**Date** : 2026-06-04
**Décideur** : Rémi Vincent

### Contexte

5 passes d'extension OSINT (ADR-003, 012, 013, 014, 016) ont produit **21 connecteurs** instanciés au boot via `backend/src/connecteurs/registry.js`. Le pattern d'extension (`BaseConnecteur` + `HOSTS_AUTORISES` + `_appelHttp`) fonctionne et est testé (24 fichiers `*.test.js` côté connecteurs), mais n'a **jamais été formalisé comme contrat**. Il existe par convention de relecture.

Trois signaux convergents poussent à le formaliser maintenant :

1. **Risque d'érosion silencieuse** : à la prochaine passe d'extension, un connecteur peut être ajouté sans cache, sans whitelist M-03, sans audit RGPD ou sans rate-limit. Le code passerait probablement la relecture parce que le contrat n'est nulle part écrit, mais ferait sauter ADR-006 ou ADR-010 en production.
2. **Veille externe — Flowsint** (`reconurge/flowsint`, 5,1k★, Apache 2.0, mai 2026). Plateforme OSINT graphique à architecture modulaire similaire (`flowsint-core`, `flowsint-enrichers`, `flowsint-types`). Confirme empiriquement la pertinence du pattern, mais montre aussi 3 dérives à éviter :
   - enrichers orientés cybersécurité (breaches, ASN, geoloc IP, Maigret social) — incompatibles avec ADR-006 `qualiteInfluencePublique` qui restreint à des personnalités publiques validables sur source médiatique vérifiée ;
   - stack Python/FastAPI + **Neo4j** + Celery — incompatibles avec ADR-005 (cache disque, pas Redis) et le choix MariaDB ;
   - ETHICS.md formel mais aucune mention RGPD — insuffisant dans notre cadre (cf. ADR-010 audit juridique en attente).
3. **Préparation Passe 6+** : sans contrat écrit, le coût d'onboarding d'un futur contributeur (ou de moi-même dans 6 mois) est élevé. Le pattern est dans la tête, pas dans `docs/`.

### Décision

#### 1. `BaseConnecteur` est le contrat stable et obligatoire

Tout connecteur OSINT (existant et futur) **DOIT** :

- étendre la classe `BaseConnecteur` de `backend/src/connecteurs/base.js` ;
- implémenter les 3 méthodes du contrat : `rechercher(query, options)`, `detailler(id, options)`, `listerLiens(id, options)` — même retour vide (`[]` ou `null`) si la source ne fournit pas la donnée ;
- passer **toutes** ses requêtes HTTP par `this._appelHttp(...)` qui factorise cache disque (ADR-005) + rate-limit token-bucket + validation anti-SSRF (M-03) + User-Agent (ADR-001) + AbortController ;
- déclarer ses hôtes dans `HOSTS_AUTORISES` de `base.js`. Aucun appel HTTP ne sort vers un hostname non whitelisté. Aucun appel ne sort vers une IP privée RFC1918 / loopback / link-local.
- être enregistré dans `DEFAUT_CONNECTEURS` de `registry.js` et activable / désactivable via `ENRICHISSEMENT_CONNECTEURS_ACTIFS` (CSV `.env`) ;
- être audité via `audit.js` à chaque appel utilisateur : la query expurgée des emails/téléphones, l'IP tronquée (RGPD art. 5 minimisation).

#### 2. Stack maintenue — refus du portage Python/Neo4j/Celery

La modularité Flowsint est inspirante mais sa stack est **incompatible** avec les ADR-004 (pas de MCP), ADR-005 (cache disque), et le choix Node 20+/Fastify 5/Prisma 6/MariaDB. Aucun portage du runtime n'est envisagé. Le pattern de modularité de Flowsint est référencé comme inspiration architecturale, pas comme dépendance.

#### 3. Périmètre des enrichers — restriction explicite

Sont **HORS périmètre** et ne seront pas intégrés :

- enrichers de cybersécurité destinés à des entités humaines : `have-i-been-pwned`, `gravatar`, `maigret` (énumération identifiants sociaux), recherches de breaches, géolocalisation d'IP individuelle, lookup téléphone individuel. Ces enrichers déplacent le risque légal d'« intérêt légitime journalistique » (RGPD art. 6.1.f) vers « investigation cyber » (art. 9 données sensibles, art. 10 données pénales). Incompatibles avec ADR-006 `qualiteInfluencePublique`.
- enrichers crypto par défaut. Possibles plus tard pour des **organisations** publiques (DAOs, ONG sanctionnées) mais pas pour des personnes physiques.

Sont **DANS périmètre** : sources publiques officielles françaises et européennes (open data, registres légaux), médias professionnels vérifiables, ONG d'investigation reconnues (cf. ADR-003, 012, 013, 014).

#### 4. Checklist d'acceptation d'un nouveau connecteur

Toute PR introduisant un nouveau connecteur OSINT est refusée si l'une des cases est manquante. La checklist est à coller dans le corps de la PR :

```
- [ ] Fichier `backend/src/connecteurs/sources/<nom>.js` étend `BaseConnecteur`
- [ ] `rechercher`, `detailler`, `listerLiens` implémentées (retour vide acceptable)
- [ ] Tous les appels HTTP passent par `this._appelHttp(...)` (pas de `fetch` direct)
- [ ] `HOSTS_AUTORISES.<nom>` ajouté dans `base.js` (liste ou regex stricte)
- [ ] Nom ajouté à `DEFAUT_CONNECTEURS` dans `registry.js`
- [ ] Test unitaire dans `backend/tests/connecteurs/<nom>.test.js` couvre : succès, 404 source, 5xx source, payload malformé, rate-limit dépassé
- [ ] Pas de PII en cache disque (cf. `cache.js` — hash sur la query uniquement)
- [ ] Source documentée dans le commentaire d'en-tête : URL d'API, licence des données, base légale (CADA, open data, etc.)
- [ ] Si clé API requise : skip propre si variable d'env absente (voir Pappers dans `registry.js`)
```

#### 5. Pas de release publique du registre tant qu'ADR-010 n'est pas levée

Le registre des sources actives reste interne (`.env` non public). Aucune communication publique sur les enrichers tant que l'audit juridique externe n'a pas validé le périmètre actuel (ADR-010).

### Conséquences

- `backend/src/connecteurs/base.js` : devient documentation contractuelle. Le JSDoc en tête de fichier sera enrichi avec un lien vers cette ADR-017.
- `backend/src/connecteurs/sources/` : aucun changement requis sur les 21 connecteurs existants — ils étaient **conformes par construction au pattern**, c'est ce qui rend la formalisation possible.
- Création d'un template `backend/src/connecteurs/sources/_TEMPLATE.js` au prochain ajout de connecteur (Passe 6), à dupliquer pour démarrer. Non créé maintenant pour ne pas figer un template avant d'avoir un nouveau cas réel.
- `docs/CONTRIBUTING.md` (si créé un jour) référencera cette ADR pour le pattern enricher.
- La checklist PR est à intégrer dans le futur template GitHub `.github/pull_request_template.md` quand le projet sortira de l'alpha fermée.
- **Aucune migration de code** : tous les connecteurs existants respectent déjà le contrat. L'ADR documente l'existant et verrouille les futures passes.
- Veille à conserver sur Flowsint : releases majeures, évolutions de leur modèle `flowsint-types` (Pydantic) → comparer avec notre approche Prisma/JSDoc pour la passe future « types stricts ».

---

## ADR-018 — Couche workbench interactive + chat IA local, et isolement du proto d'auto-audit OSINT hors plateforme

**Statut** : Accepté (direction UX) — activation sur données réelles **gelée par ADR-010**
**Date** : 2026-06-06
**Décideur** : Rémi Vincent

### Contexte

Veille externe sur **WebVetted Workbench** (`webvetted.com/workbench`, SaaS OSINT commercial US, ~299–1188 $/an). Outil graphique « cible → 80+ transformations → graphe → chat IA », positionné explicitement comme _« map your targets, find hidden connections in seconds »_. C'est, fonctionnellement, un proche de Maltego et de Flowsint (déjà analysé en ADR-017).

Deux enseignements opposés :

1. **À ne pas reproduire** — le cœur de valeur de WebVetted repose sur le scraping de réseaux sociaux (followers Facebook/Instagram/TikTok/X/LinkedIn), les bases de fuites (HIBP), le ciblage nominatif par email/téléphone, la reconnaissance faciale (reverse image / deepfake). C'est exactement le périmètre **exclu** par ADR-017 §3, et c'est l'antithèse de la filiation du projet (InfluenceNetwork / Owni.fr = journalisme sur figures publiques, pas surveillance d'individus). WebVetted sert ici de **miroir inversé** : il clarifie le positionnement « alternative européenne, transparente, légale » plutôt qu'un modèle à copier.

2. **À reprendre** — l'**ergonomie d'interaction** est légitime et réutilisable sans aucun risque RGPD : le flux _cible → enrichissement progressif du graphe → chat IA contextualisé répondant avec citations vers la source brute_. C'est de l'UX, pas une source de données.

### Décision

#### 1. Direction UX « workbench » retenue, sur sources légales uniquement

La couche workbench (cible → enrichissement incrémental → graphe → chat IA) est adoptée comme direction d'évolution du frontend. Elle se branche **exclusivement** sur les 21 connecteurs légaux existants (ADR-003/012/013/014/016) et sur les données déjà détenues légalement. **Aucune nouvelle source de données** n'est introduite par cette ADR — elle ne porte que sur l'interaction.

#### 2. Chat IA = LLM **local** (Ollama), jamais cloud US

Le « chat sur le graphe » (ex. « quel chemin relie X à Y ? », « résume l'influence de cette entité ») s'appuie sur un **LLM local via Ollama** (souveraineté, RGPD, zéro fuite vers OpenAI/Anthropic/US). Contraintes :

- le LLM **raisonne uniquement sur le sous-graphe déjà chargé en session** (entités/liens déjà importés et validés) ; il ne déclenche aucun appel réseau enrichissant ;
- pas de provider cloud par défaut. Si un fallback EU (Mistral API) est un jour envisagé, ce sera une ADR distincte avec clause d'opt-in explicite ;
- la réponse cite systématiquement les `provenance` / `AuditEnrichissement` des données mobilisées (cohérent avec le principe de traçabilité ADR-006/008).

#### 3. Le proto d'auto-audit OSINT vit **hors du dépôt**, n'est jamais un connecteur

Pour étudier empiriquement « jusqu'où va le côté obscur », un prototype d'auto-audit (maigret, holehe, HIBP, reverse image, SERP, archives) est mené **sur les seules données personnelles du décideur, auto-consenties**. Règles non négociables :

- ce proto réside **hors** de `~/Developer/reseaux-influences/` (répertoire séparé, hors git, output gitignoré — données d'exposition personnelle = ultra-sensibles) ;
- il **n'est jamais** intégré comme connecteur, ni importé dans `registry.js`, ni exposé via une route API. Il ne touche pas la plateforme ;
- sa finalité est documentaire : alimenter la conception éthique et le brief d'audit juridique en montrant ce que la plateforme **refuse** de faire ;
- il **réaffirme ADR-017 §3** : ces enrichers (breaches, énumération sociale, reconnaissance faciale, lookup tél/IP individuels) restent définitivement hors périmètre plateforme.

#### 4. Activation gelée par ADR-010

La couche workbench peut être **prototypée sur seed de démo / données fictives** dès maintenant. Son activation sur des données réelles de tiers reste **gelée jusqu'à la levée de l'alpha fermée** (audit juridique externe, ADR-010 → futur ADR-011).

### Conséquences

- **Aucun code plateforme produit par cette ADR pour l'instant** — elle fixe une direction. L'implémentation (composant chat frontend + route `/api/graphe/chat` adossée à Ollama) viendra dans une passe dédiée, après validation du périmètre par le juriste.
- Réutilise l'install Ollama du workspace (binaire CLI standalone `~/.local/ollama/`, cf. mémoire `project_scrapegraphai_setup.md`) — pas de nouvelle dépendance lourde au MVP.
- Le proto d'auto-audit est tracé hors-dépôt ; aucun de ses outils n'apparaîtra jamais dans `package.json`, `registry.js` ou `HOSTS_AUTORISES`.
- Le brief d'audit juridique (`docs/courriers/brief-audit-juridique-externe.md`) intègre les questions soulevées par cette veille (collecte automatisée, base légale, périmètre des personnes).
- Veille à conserver : évolution de la réglementation sur le scraping « public » (jurisprudence CNIL) — impacte directement la frontière connecteurs légaux / interdit.

---

## ADR-011 — Cadre de levée de l'alpha fermée : prérequis et critères de sortie

**Statut** : Accepté (cadre) — la décision d'ouverture effective restera conditionnée à l'audit juridique
**Date** : 2026-06-15
**Décideur** : Rémi Vincent

### Contexte

L'ADR-010 a gelé toute ouverture publique jusqu'à un audit juridique externe, sans formaliser **ce qui doit être prêt** pour lever le gel. Le brief d'audit (`docs/courriers/brief-audit-juridique-externe.md`, 2026-06-06) a depuis structuré les questions à trancher (base légale Q1, périmètre des personnes Q2, collecte automatisée Q3). Cette ADR fixe la **checklist de levée** côté plateforme, indépendamment du verdict juridique : ce sont les prérequis matériels sans lesquels la consultation serait prématurée, et que l'audit exigera de toute façon.

Décision de cadrage confirmée le 2026-06-15 : on **prépare la levée** (on construit les prérequis) tout en restant fermé ; on ne réouvre pas avant le rendu de l'audit.

### Décision

La levée de l'alpha (future **ADR-020** actant l'ouverture effective) est subordonnée à **deux conditions cumulatives** :

**A. Prérequis techniques/documentaires produits par la plateforme** (réalisables sans le juriste) :

1. **Procédure droits des personnes** (RGPD art. 15 à 21) opérationnelle — modèle `DemandeDroitPersonne`, route publique `/api/droits`, page `/mes-droits`. ✅ _livré (commit `feat(droits)`)_
2. **Pages légales** publiées en projet : `/mentions-legales`, `/politique-confidentialite`, `/cgu` (interdiction explicite d'enrichir des citoyens privés), `/cookies`, `/declaration-accessibilite` (modèle DINUM).
3. **Brouillon d'AIPD/DPIA** (`docs/juridique/aipd-projet.md`) suivant la trame CNIL, à soumettre au juriste.
4. **Politique de conservation** documentée (`docs/juridique/politique-conservation.md`) — durées par catégorie de donnée.
5. **`robots.txt`** prêt en deux versions (alpha `Disallow: /` actuelle / ouverture sélective), bascule manuelle et tracée.

**B. Conditions juridiques (hors plateforme, bloquantes)** :

6. Réponse écrite du juriste sur **Q1 (base légale)** — variable déterminante ; tant qu'elle n'est pas tranchée, les pages légales restent en statut « PROJET ».
7. Position sur **Q2 (tiers périphériques / sphère familiale)** et **Q3 (collecte automatisée / scraping)**.
8. Avis sur la **nécessité et le périmètre d'une AIPD** formelle.
9. Décision explicite d'ouverture, actée par une ADR-020 dédiée.

### Conséquences

- Les pages légales et l'AIPD sont produites **en statut « PROJET — à valider par juriste »** : utiles à l'audit comme matière, jamais opposables tant que Q1 n'est pas tranchée.
- La sphère **familiale** demandée comme finalité produit (cartographie des liens familiaux) est explicitement **suspendue à la réponse Q2** : le modèle `TypeLien` peut décrire des liens familiaux entre personnalités publiques, mais l'inclusion de tiers non-publics par ricochet reste gelée.
- Cette ADR ne rouvre rien : `robots.txt` reste en `Disallow: /`, aucune inscription publique, aucune communication. Elle balise le chemin de sortie.

---

## ADR-019 — Scraping web encadré : sous-type de connecteur, garde-fous, activation gelée

**Statut** : Accepté (direction) — implémentation gated, **désactivée** jusqu'à validation Q3 par l'audit
**Date** : 2026-06-15
**Décideur** : Rémi Vincent

### Contexte

Le périmètre de collecte a jusqu'ici exclu volontairement le scraping (ADR-003 : API/open data officiels uniquement). Or la valeur journalistique d'une cartographie d'influence suppose aussi des **sources éditoriales vérifiables** (presse, communiqués, sites institutionnels) qui n'exposent pas toujours d'API. Décision de cadrage 2026-06-15 : **autoriser le scraping web encadré comme direction**, à condition de le borner strictement et de geler son activation jusqu'à ce que le juriste tranche la Q3 du brief (régime distinct du scraping vs API officielle, jurisprudence CNIL sur la collecte « données publiques »).

### Décision

Le scraping web est introduit comme **sous-type de connecteur** (`BaseConnecteurScraping extends BaseConnecteur`), héritant de tous les garde-fous existants (cache disque, rate-limit, anti-SSRF, provenance par champ, audit), **plus** les contraintes spécifiques suivantes, **non négociables** :

1. **Respect de `robots.txt`** de la cible (lecture + obéissance `Disallow`) avant toute requête. Une cible qui refuse les robots n'est jamais scrapée.
2. **Allowlist de domaines** éditoriaux/institutionnels vérifiables (presse établie, sites publics, communiqués officiels), maintenue explicitement — pas de scraping généraliste du web ouvert.
3. **Réseaux sociaux exclus** (CGU + RGPD), conformément au brief Q3 et à ADR-017 §3. Aucune exception sans nouvelle ADR.
4. **Provenance + URL + horodatage** capturés pour chaque champ extrait (traçabilité ADR-006/008, citation de source côté UI).
5. **Pas de contournement** : ni rotation d'IP/User-Agent trompeur, ni résolution de CAPTCHA, ni accès à du contenu derrière authentification ou paywall.
6. **Désactivé par défaut** dans `registry.js` (`ENRICHISSEMENT_CONNECTEURS_ACTIFS` ne le liste pas) ; activable seulement après réponse favorable Q3 et sur seed/données fictives en attendant.

### Conséquences

- Le scaffold `BaseConnecteurScraping` peut être écrit et testé **sur fixtures locales** dès maintenant ; aucun domaine réel n'est activé tant que Q3 n'est pas tranchée.
- Cohérent avec ADR-018 (gel d'activation par ADR-010) et ADR-017 §3 (enrichers individuels hors périmètre).
- Si l'audit refuse le scraping même encadré : le sous-type reste inerte (zéro domaine en allowlist), aucune dette — la plateforme retombe sur les seules API officielles.
- La frontière « connecteur API officiel » / « connecteur scraping encadré » doit rester lisible dans le code et la doc, pour ne jamais brouiller la base légale entre les deux régimes.

---

## ADR-021 — Connecteur GLEIF : dimension mondiale (identifiants d'entités juridiques)

**Statut** : Accepté
**Date** : 2026-06-16
**Décideur** : Rémi Vincent

> Note de numérotation : l'ADR-020 reste **réservée** à l'acte d'ouverture publique effective (cf. ADR-011). Ce connecteur prend donc le numéro 021.

### Contexte

Les 21 connecteurs existants couvrent essentiellement la sphère **française** (Sirene/RNE, BODACC, HATVP, IGN, RNA, RPPS…). La finalité du projet vise explicitement les réseaux d'influence « française, **européenne et mondiale** ». Il manquait une brique d'identité d'entités juridiques **transnationale** permettant de relier une société française à ses sociétés mères / filiales à l'étranger.

### Décision

Ajout du connecteur **`gleif`** sur l'API publique GLEIF (`api.gleif.org`, système LEI ISO 17442, supervisé par le Regulatory Oversight Committee du G20). Conforme à ADR-003 (source publique officielle, pas de scraping) et au pattern ADR-017 (`BaseConnecteur`, entrée `HOSTS_AUTORISES['gleif']`, contrat `rechercher`/`detailler`/`listerLiens`).

- **`rechercher`** : plein-texte (`filter[fulltext]`) ou direct par LEI → entités `Organisation` normalisées (nom, juridiction ISO, forme juridique, adresse, LEI).
- **`listerLiens`** : relations de propriété/contrôle (société mère directe, mère ultime, filiales directes) via les endpoints `direct-parent` / `ultimate-parent` / `direct-children`. Mappées en liens `BENEFICIAIRE_EFFECTIF` (contrôle capitalistique), **entre personnes morales uniquement** — jamais de personne physique (reste hors champ art. 9/10).

### Conséquences

- `gleif` ajouté à `DEFAUT_CONNECTEURS` (registry) et à `HOSTS_AUTORISES`. Couverture : ~2,7 M d'entités dans 200+ juridictions.
- 22 connecteurs actifs désormais. 404 sur une relation traité proprement (pas de lien, pas de crash).
- Brique fondatrice de la dimension mondiale ; prochaines extensions EU naturelles : registre de transparence UE (lobbying), interconnexion BRIS des registres du commerce européens.

---

## ADR-022 — Connecteur Registre de Transparence UE : dimension européenne (lobbying)

**Statut** : Accepté
**Date** : 2026-06-16
**Décideur** : Rémi Vincent

### Contexte

Après la brique mondiale (GLEIF, ADR-021), il manquait la sphère d'influence **européenne** : qui cherche à peser sur la décision publique de l'UE. Le **registre de transparence** (commun Parlement européen + Commission + Conseil) recense ~17 000 représentants d'intérêts déclarés, avec catégorie, niveau d'intérêt, présence à Bruxelles et nombre de personnes accréditées au Parlement européen. C'est la source officielle de référence du lobbying européen.

### Décision

Ajout du connecteur **`eu-transparence`** sur l'export XML public quotidien : `https://ec.europa.eu/transparencyregister/public/files/ODP/download/XML/latest` (le domaine `transparency-register.europa.eu` y redirige). Conforme ADR-003 (source publique officielle, pas de scraping) et ADR-006 (toute organisation importée porte `qualiteInfluence = LOBBYISTE` — les inscrits sont par définition des représentants d'intérêts déclarés).

- **Bulk + index paresseux** (pattern `open-sanctions`) : téléchargement de l'export (~95 Mo, format `ListOfIRPublicDetail`), parsing **regex zéro-dépendance** (politique du projet — `xml-js` interdit), indexation en mémoire par code d'identification.
- **`rechercher`** : nom ou acronyme → `Organisation` (catégorie d'inscription mappée vers `TypeOrganisation` : consultancies→LOBBY, syndicats→SYNDICAT, ONG→ONG, think tanks→THINK_TANK, etc.).
- **`detailler`** : par code d'identification. **`listerLiens`** : vide (les personnes accréditées au PE ne sont qu'un compte agrégé dans l'export — pas de liens nominatifs fiables).
- Cache **30 jours** (export volumineux, mise à jour quotidienne côté source ; TTL long suffisant). Timeout 60 s.

### Conséquences

- `eu-transparence` ajouté à `DEFAUT_CONNECTEURS` et à `HOSTS_AUTORISES` (`ec.europa.eu`, `transparency-register.europa.eu`). **23 connecteurs actifs.**
- Validation runtime sur données réelles : ~14 700 entités parsées, accents préservés, siège pris sur `headOffice` (pas `EUOffice`).
- **Champs financiers et bureau UE extraits** : `budgetLobbyingDeclar` (fourchette `financialData > closedYear > costs > range`, formatée FR + année close), `bureauUe` (Bruxelles le plus souvent), `personnesAccrediteesPe`. Ces champs alimentent directement la lecture d'influence (combien dépensé, présence à Bruxelles).
- L'UI d'enrichissement affiche ces champs automatiquement (`PreviewEntite` est piloté par les champs renvoyés) ; les liens de propriété GLEIF montrent désormais leur rôle (« Société mère ultime », « Filiale directe »).

---

## ADR-023 — BRIS exclu (pas d'API publique) ; alternatives EU retenues

**Statut** : Accepté (exclusion)
**Date** : 2026-06-16
**Décideur** : Rémi Vincent

### Contexte

La piste « interconnexion BRIS des registres du commerce européens » a été étudiée comme brique EU complémentaire (registres nationaux des sociétés). Vérification faite : **BRIS n'expose aucune API publique**. L'accès se fait uniquement via l'interface web du portail e-Justice ; BRIS ne détient pas les données (couche de routage vers les registres nationaux) et ne fournit qu'un contrôle d'existence harmonisé, sans capitalistique ni comptes.

### Décision

**Aucun connecteur BRIS.** Le seul moyen d'extraire des données BRIS serait de **scraper le portail e-Justice** — ce qui viole ADR-003 (sources via API officielle) et tombe sous le scraping **gelé** (ADR-019, allowlist vide jusqu'à validation juridique Q3). On ne le fait pas.

### Alternatives EU réellement ouvertes (pour une passe ultérieure)

À privilégier si l'on veut étendre la couverture européenne par des **API/exports officiels** (conformes ADR-003) :

1. **EU Financial Transparency System (FTS)** — bénéficiaires du budget de l'UE (subventions, marchés). Export officiel. Cartographie « qui reçoit l'argent de l'UE » = dépendance/influence directe. _Candidat recommandé._
2. **TED — Tenders Electronic Daily** — marchés publics européens attribués, API open data. Qui remporte les contrats publics UE.
3. **GLEIF** (déjà intégré, ADR-021) couvre déjà l'identité transnationale des entités et leurs mères/filiales — recouvre une grande part du besoin « registres du commerce ».

> **OpenCorporates** (registres du commerce mondiaux par API) est écarté pour l'instant : clé API requise + conditions de réutilisation restreignant la rediffusion dans un corpus public CC-BY (tension avec l'ADR-007 à venir). À réévaluer si licence compatible.

### Conséquences

- Pas de dette : aucune ligne de code BRIS, aucune entrée `HOSTS_AUTORISES`.
- Trace explicite pour éviter qu'une session future ne retente BRIS sans revérifier l'absence d'API.
- Prochaine extension EU recommandée : connecteur **FTS** (même pattern bulk que `eu-transparence`).

---

## ADR-024 — Connecteur EU FTS (bénéficiaires du budget UE) + lecteur XLSX zéro-dépendance

**Statut** : Accepté
**Date** : 2026-06-16
**Décideur** : Rémi Vincent

### Contexte

Alternative EU recommandée par l'ADR-023 (BRIS étant inaccessible par API). Le **Financial Transparency System** publie les bénéficiaires des fonds UE en gestion directe (subventions, marchés) — signal d'influence : quelles organisations dépendent du financement européen, par programme. Seul format de distribution officiel : **XLSX annuel** (pas de CSV/XML réel — les variantes renvoient une page HTML). Le projet interdit les dépendances npm (`xml-js` déjà banni) ; il fallait donc un lecteur XLSX maison.

### Décision

**1. Lecteur `xlsx-mini` zéro-dépendance** (`backend/src/connecteurs/xlsx-mini.js`) : un `.xlsx` est une archive ZIP de XML. Lecture du répertoire central + décompression via `zlib.inflateRawSync` (natif Node), puis parsing regex de `sharedStrings.xml` et de la première feuille. Réutilisable pour tout futur export gouvernemental XLSX.

**2. Connecteur `eu-fts`** : télécharge le dernier export annuel disponible (résolution par sondage de la signature ZIP « PK » sur les 3 dernières années), parse, **agrège par bénéficiaire** (un bénéficiaire = N lignes d'engagement → pays, type, programmes, nombre d'engagements, engagement max). Cache 30 j du résultat agrégé compact (JSON), pas du binaire.

**Garde-fou RGPD (ADR-006)** : les bénéficiaires personnes physiques sont **masqués `\*\*\***`à la source** ; on les **écarte systématiquement** — seules les organisations nommées sont indexées.`qualiteInfluence`suggérée :`AUTRE`(bénéficiaire de fonds, pas un mandat).`Beneficiary type`→`TypeOrganisation`.

### Conséquences

- `eu-fts` + `xlsx-mini` ajoutés ; `eu-fts` dans `DEFAUT_CONNECTEURS` et `HOSTS_AUTORISES` (`ec.europa.eu`). **24 connecteurs actifs.**
- Validation runtime : export 2024 (~106 k lignes, 16 Mo) → **23 359 organisations bénéficiaires** agrégées ; recherche « fraunhofer » → entités réelles avec montants formatés FR.
- Le montant retenu est l'**engagement maximal** observé (les colonnes de montants de l'export ne sont pas documentées finement ; pas de somme hasardeuse). À affiner si la doc officielle des colonnes est récupérée.
- Coût : parsing ~16 s au premier appel par process (puis cache 30 j). Acceptable pour un connecteur bulk.

---

## ADR-025 — Connecteur TED (marchés publics de l'UE)

**Statut** : Accepté
**Date** : 2026-06-18
**Décideur** : Rémi Vincent

### Contexte

Troisième brique européenne (après le lobbying `eu-transparence` et les fonds `eu-fts`) : la **commande publique**. TED (Tenders Electronic Daily) publie les avis de marchés publics de l'UE. Une API de recherche publique existe (`POST https://api.ted.europa.eu/v3/notices/search`, sans clé), contrairement à BRIS (ADR-023) — donc connecteur légitime sans scraping.

### Décision

Connecteur **`ted`**, API live (pas bulk), via `_appelHttp` en POST (cache + rate-limit + anti-SSRF hérités). Recherche experte plein-texte `FT~"terme"`.

**Sémantique assumée** : l'API de recherche n'expose pas l'attributaire (`winner-name` toujours `null` ; il n'est que dans le XML détaillé, trop coûteux à parser). L'entité renvoyée est donc l'**acheteur public** (`buyer-name`, toujours présent), agrégé par nom : nombre d'avis correspondant au terme, pays, dernière date, exemples de titres + liens. `TypeOrganisation = INSTITUTION_PUBLIQUE`, `qualiteInfluence = AUTRE`. Le terme matche partout dans l'avis (acheteur, attributaire, objet) → on remonte les acheteurs liés au terme cherché.

### Conséquences

- `ted` ajouté à `DEFAUT_CONNECTEURS` et `HOSTS_AUTORISES` (`api.ted.europa.eu`). **25 connecteurs actifs.**
- Champs multilingues TED (`{lang: valeur}`) : extraction fra → eng → première langue.
- Validation runtime : « AP-HP » → 4 acheteurs publics agrégés avec compteurs d'avis réels.
- Limite connue : pas d'attributaire (faute de l'exposer dans l'API de recherche). Évolution possible : récupérer le XML détaillé d'un avis pour en extraire l'attributaire, si le besoin se confirme.

---

## ADR-026 — Base légale du traitement : régime dérogatoire art. 85 RGPD + art. 80 LIL (et non intérêt légitime art. 6.1.f seul)

**Statut** : Accepté **sous réserve de confirmation par l'audit juridique externe** (ADR-010) — décision de cadrage, non acquise
**Date** : 2026-06-18
**Décideur** : Rémi Vincent (sur analyse juriste-fr-eu)

> Note de numérotation : 020 reste **réservée** à l'acte d'ouverture publique (cf. ADR-011, ADR-021) ; 007 (licence corpus) et 009 (SSR) restent réservées à leurs sujets. Cet ADR prend donc le numéro **026**, premier numéro séquentiel libre.

### Contexte

Jusqu'ici, les ADR mentionnaient la base légale de façon dispersée et parfois contradictoire :

- ADR-006 cite « art. 85 RGPD + art. 80 LIL » comme cadre du garde-fou `qualiteInfluencePublique` ;
- ADR-008 fonde la conservation des audits sur l'art. 6.1.c (obligation légale) et l'art. 5.2 (accountability) — ce qui est correct **pour les logs**, mais ne dit rien du fondement du traitement principal ;
- ADR-013 mélange « art. 6.1.e (mission d'intérêt public) + art. 85 » pour OpenSanctions ;
- le brief d'audit (Q1) présentait encore l'intérêt légitime (art. 6.1.f) comme une option défendable « au cas par cas ».

Or le modèle de données franchit deux seuils qui **ferment** la voie de l'art. 6.1.f seul :

1. **Données sensibles — opinions politiques (art. 9.1 RGPD)** : présentes en code via `TypeLien.PARTI_POLITIQUE` (`schema.prisma` l. 169), les déclarations HATVP, les affiliations parlementaires, le registre de transparence UE. Une opinion politique **déduite** par recombinaison de liens relève aussi de l'art. 9 (CJUE, gr. ch., 4 juillet 2023, _Meta Platforms c/ Bundeskartellamt_, C-252/21, pts 68-70 sur les données sensibles inférées — _à vérifier en version consolidée_).
2. **Données pénales (art. 10 RGPD)** : présentes en code via `TypeLien.CONDAMNATION` (`schema.prisma` l. 525), les gels d'avoirs Trésor/AMF (OpenSanctions, ADR-013), ICIJ, et la veille presse anti-corruption (Anticor, Cour des comptes).

L'**art. 9.1 interdit par principe** le traitement de données sensibles (sauf exceptions de l'art. 9.2) ; l'**art. 10** réserve le traitement des données pénales aux autorités ou aux cas prévus par le droit de l'État membre. L'intérêt légitime (art. 6.1.f) est un fondement de **licéité au sens de l'art. 6**, mais il ne **lève pas** l'interdiction de l'art. 9 ni la réserve de l'art. 10. Il est donc, à lui seul, **insuffisant et juridiquement inopérant** pour ce traitement.

### Décision

Le fondement du traitement principal de `reseaux-influences` est le **régime dérogatoire de l'article 85 du RGPD** (traitements à des fins journalistiques et d'expression), transposé en droit français par l'**article 80 de la loi n° 78-17 du 6 janvier 1978** (loi Informatique et Libertés). Ce régime écarte, « dans la mesure nécessaire » à la finalité d'expression, l'interdiction des articles 9 et 10, et aménage certains droits des personnes.

Conséquences de principe :

- L'**intérêt légitime (art. 6.1.f) n'est PAS retenu comme fondement** du traitement principal. Il pourra rester pertinent à la marge pour des traitements accessoires non sensibles (ex. logs techniques), mais jamais comme base du cœur métier.
- L'**art. 9.2.e** (« données manifestement rendues publiques par la personne ») n'est **pas** un fondement principal : son interprétation est stricte et ne couvre pas une donnée sensible _déduite_ (même arrêt C-252/21). Il peut tout au plus conforter le caractère public de certaines données déjà publiées par la personne.
- L'éligibilité au régime art. 85 suppose une **véritable finalité d'expression/information du public** ; la conception est fonctionnelle et large (CJUE, 14 février 2019, _Buivids_, C-345/17 ; CJUE, gr. ch., 16 décembre 2008, _Satamedia_, C-73/07 — _références à vérifier en version consolidée_), mais le caractère **contributif gamifié et ouvert** est un **point de fragilité** à sécuriser (charte éditoriale, modération, traçabilité).

### Statut de la décision — SOUS RÉSERVE

Cette décision est **un cadrage interne, pas un acquis**. Elle est **subordonnée à la confirmation par l'audit juridique externe** (brief Q1, ADR-010). Tant que le/la juriste n'a pas confirmé par écrit :

- les pages légales restent en statut « PROJET — à valider » (cohérent ADR-011) ;
- aucune communication ne présente l'art. 85 comme une base acquise ;
- si l'audit infirme l'éligibilité art. 85, le périmètre du traitement (notamment les champs art. 9/10) devra être **réduit ou refondu**, pas seulement « rebasé » sur l'art. 6.1.f.

### Conséquences

- ADR-006 et ADR-013 sont **rendus cohérents** par renvoi : le fondement unique du traitement principal est art. 85 RGPD + art. 80 LIL ; les mentions éparses (« 6.1.e + 85 », « 6.1.f au cas par cas ») sont à lire à la lumière du présent ADR.
- Le brief d'audit (`docs/courriers/brief-audit-juridique-externe.md`) reformule Q1 dans ce sens (la base légale n'est plus présentée comme un choix ouvert entre 6.1.f et 85, mais comme une qualification imposée par art. 9 + art. 10, à faire confirmer).
- L'AIPD (`docs/aipd-reseaux-influences.md`) documente ce fondement et la mise en balance art. 85 (liberté d'expression / vie privée, art. 11 et 8 de la Charte des droits fondamentaux de l'UE).
- Le **risque pénal/civil de presse** (diffamation loi 1881, présomption d'innocence art. 9-1 C. civ.) n'est **pas** couvert par l'art. 85 RGPD et fait l'objet d'un dispositif distinct (`docs/dispositif-anti-diffamation.md`).
- Aucune migration de code : l'ADR documente et verrouille la base légale, il ne modifie pas le schéma.

---

## ADR-027 — Codes de lien capitalistiques dédiés (détention / contrôle)

**Date** : 2026-06-30
**Statut** : Accepté

### Contexte

La construction du corpus (programme de seed OSINT : gouvernements, fortunes, CAC 40, participations CDC, médias mdiplo) génère un grand volume de **liens capitalistiques** entre personnes et organisations (actionnariat, détention majoritaire, filiales). Le référentiel `types_liens` ne disposait que d'un code générique `economique` (« Relation d'affaires, actionnariat, conseil »). Tasser des milliers de liens de détention dans `economique` rend le cœur du réseau d'influence — *qui contrôle qui, et à quel niveau* — **illisible** (impossible de filtrer « détention majoritaire » ou de distinguer une filiale d'une participation minoritaire).

### Décision

Ajout de **trois codes** dans `backend/prisma/seed.js` (catégorie `financier`) :

- `DETENTION_CAPITAL` — participation **minoritaire** au capital (origine → cible).
- `ACTIONNAIRE_MAJORITAIRE` — majorité du **capital OU des droits de vote** (contrôle), origine → cible. Couvre le cas du contrôle par droits de vote majoritaires sans majorité du capital (ex. Christian Dior SE → LVMH : 41,89 % du capital, 56,69 % des droits de vote).
- `FILIALE` — l'origine contrôle la cible comme **filiale** (détention quasi totale).

Convention de direction : `aRef` = détenteur/mère, `bRef` = détenu/filiale (cohérent avec le modèle mdiplo `origine → cible`).

### Conséquences

- `economique` est **conservé** pour les relations d'affaires non capitalistiques (conseil, partenariat).
- Le seed `bin/seed-fortunes-1.js` (vague 1b) est mis à jour : ses 8 liens de détention passent de `economique` aux codes précis selon le % réel.
- Les vagues capitalistiques à venir (CAC 40, CDC/Bpifrance/APE, importeur médias mdiplo) **doivent** utiliser ces codes, pas `economique`.
- Aucune migration de schéma : `typeLienCode` est une valeur du référentiel `types_liens`, pas un enum Prisma. Le code est créé à l'exécution de `npm run db:seed`.

---
