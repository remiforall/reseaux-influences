# Audit SEO/GEO — reseauxinfluences.fr

**Auditeur** : SEO Strategist
**Date** : 2026-05-11
**Cible** : indexation moteurs FR + AI discoverability (ChatGPT, Claude, Perplexity, Gemini)
**Mode** : READ-ONLY (aucun fichier de code modifié)

---

## Synthèse exécutive

Le projet est au stade MVP : front React/Vite SPA avec un `index.html` minimal, **zéro fichier de découverte** (pas de `robots.txt`, `sitemap.xml`, `llms.txt`, `humans.txt`, `manifest.json`), aucune balise Open Graph / Twitter Card, **aucune donnée structurée côté front** (le seul JSON-LD identifié est un endpoint d'**export** API `/api/export/jsonld`, jamais inséré dans les pages publiques). La hiérarchie HTML est correcte (`<html lang="fr">`, un H1 par page, viewport sans `user-scalable=no`), mais le rendu SPA fait que **rien d'utile n'est servi sans exécution JS** — un crawler basique ne voit que `<title>Réseaux d'Influence</title>` et une meta description générique. Pour une plateforme dont la valeur dépend d'être citée par des moteurs et des LLMs comme source d'investigation, c'est le principal point bloquant.

Conclusion : la fondation a11y/HTML est saine ; la couche **discovery** (sitemap, robots, llms.txt, schema.org JSON-LD intégré, OG/Twitter) est **entièrement à construire**. Tant que le contenu indexable réel (fiches d'entités publiques) n'existe pas en base, l'effort doit rester proportionné — on prépare le socle, on n'investit pas dans des stratégies de contenu encore vides.

---

## Manquements identifiés

### CRITIQUE (impact direct sur visibilité)

#### C1 — Rendu SPA sans pré-rendu : le contenu n'est pas indexable par défaut

`frontend/index.html` n'expose que `<div id="root"></div>` + une meta description statique. Googlebot exécute JS, mais **Bingbot, GPTBot, ClaudeBot, PerplexityBot ne le font pas de manière fiable** (Bing en particulier ne rend qu'une fraction des SPAs JS). Conséquence : **ChatGPT ne pourra pas citer une fiche entité** parce que ChatGPT s'appuie sur l'index Bing.

Solutions par ordre de coût croissant :

- **Pré-rendu statique au build** des pages publiques (`/`, `/liens`, `/graphe`, `/profil/:id`, `/entites/:id`) via `vite-plugin-ssg`, `react-snap` ou similaire. Coût : ~1 j de mise en place.
- **SSR Fastify** : le backend rend le HTML initial pour les routes publiques. Plus lourd, plus puissant.
- **Génération de fiches statiques** par cron côté backend (HTML + JSON-LD inline) servies par Fastify static avant le SPA fallback — pragmatique pour un MVP.

À trancher dès que la base contient des entités publiques exploitables. Tant qu'elle est vide, pas de gain à pré-rendre du vide.

#### C2 — Absence de `robots.txt`

Aucun `robots.txt` à `/Users/remi/Developer/reseaux-influences/frontend/public/`. Par défaut, tous les bots ont accès — mais :

- pas de pointeur vers `sitemap.xml`
- aucune directive pour les bots IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) → comportement non maîtrisé
- aucune protection des routes sensibles (`/enrichissement`, `/api/docs`)

Le `robots.txt` est aussi un signal d'**intentionnalité** : sa présence indique aux moteurs que le site est conscient de son indexation.

#### C3 — Absence de `sitemap.xml`

Aucun sitemap généré. Pour un projet collaboratif où chaque entité (Personne, Organisation, SiteWeb) est une URL publique potentielle, un sitemap dynamique est indispensable pour :

- la découverte des nouvelles fiches par Google et Bing
- la priorisation des URLs canoniques (`/entites/:id` plutôt que `/profil/:id` ou variantes)
- la transmission de `lastmod` pour le crawl différentiel

Recommandation : endpoint Fastify `GET /sitemap.xml` qui lit `Personne`, `Organisation`, `SiteWeb` validés et génère un sitemap (≤ 50 000 URLs/fichier, sinon sitemap index). Régénération à la volée avec cache 1 h, suffisant au MVP.

#### C4 — Pas de données structurées (JSON-LD) intégrées dans les pages

Le seul JSON-LD du projet est un **endpoint d'export API** (`backend/src/routes/export.js` ligne 85 — `Dataset` / `Person` / `Organization` / `Role`). C'est très bien pour la portabilité des données, **mais aucun de ce JSON-LD ne se trouve dans le HTML servi aux crawlers**.

Pour que Google AI Overviews, Perplexity, ChatGPT citent une fiche `Personne` ou `Organisation`, il faut un `<script type="application/ld+json">` dans le `<head>` de chaque fiche, avec au minimum :

- `Person` (`name`, `jobTitle`, `nationality`, `sameAs` → URL Wikidata)
- `Organization` (`name`, `legalName`, `sameAs`, `additionalType`)
- `Dataset` au niveau du site (description du corpus, licence, créateur)
- `WebSite` + `SearchAction` sur l'accueil

Le code de génération existe déjà côté backend — il suffit de l'**injecter dans la page** au moment du rendu (cf. C1).

---

### IMPORTANT

#### I1 — Aucune balise Open Graph ni Twitter Card

`frontend/index.html` ne contient ni `og:title`, ni `og:description`, ni `og:image`, ni `twitter:card`. Conséquence : tout partage du site sur Mastodon, Bluesky, Twitter/X, LinkedIn, Slack, Discord produit un aperçu vide ou pauvre. Pour un projet qui cible **journalistes et chercheurs** (audience qui partage par lien), c'est handicapant.

Minimum vital dans `index.html` :

```
<meta property="og:type" content="website">
<meta property="og:title" content="Réseaux d'Influence">
<meta property="og:description" content="Cartographie collaborative des réseaux d'influence interpersonnels et transnationaux, vérifiée par sources médiatiques.">
<meta property="og:url" content="https://reseauxinfluences.fr">
<meta property="og:image" content="https://reseauxinfluences.fr/og-default.png">
<meta property="og:locale" content="fr_FR">
<meta name="twitter:card" content="summary_large_image">
```

Pour les fiches d'entités, ces balises doivent être **dynamiques** (titre = nom de la personne, image = portrait si disponible) — implique encore C1.

#### I2 — `<title>` et `<meta description>` statiques (un seul couple pour toutes les routes)

Le SPA ne met pas à jour le `<title>` et la `<meta description>` par route. Conséquence : Google indexe (s'il rend le JS) toutes les pages sous le même titre `Réseaux d'Influence`. Aucun mot-clé différenciant entre `/liens`, `/graphe`, `/profil/:id`.

Solution : `react-helmet-async` ou équivalent — composant `<Helmet>` par page avec titre et description ciblés. Effort : ~2 h. À combiner avec un pré-rendu (C1) pour que les crawlers le voient.

#### I3 — `/api/docs` Swagger exposé sans directive d'indexation

`backend/src/server.js` ligne 67 enregistre Swagger UI sur `/docs`. La documentation OpenAPI est utile aux développeurs mais **inutile dans Google** — elle dilue le signal de pertinence du domaine. À couvrir par `robots.txt` (`Disallow: /docs`, `Disallow: /api/`) ou par une meta `noindex` côté Fastify.

#### I4 — Absence de `llms.txt` à la racine

Standard émergent (proposé par Jeremy Howard, adoption croissante chez Anthropic, Mistral, Cloudflare, Stripe…) : un fichier markdown à la racine qui décrit le site et oriente les LLMs vers les contenus prioritaires. **Aucune garantie d'effet** (Google ne le confirme pas, les crawlers d'OpenAI/Anthropic ne le lisent pas tous), mais coût marginal et signal d'intentionnalité fort pour la cible journalistes/chercheurs.

Modèle proposé pour ce projet (cf. section **Plan d'action GEO** ci-dessous).

#### I5 — Pas de balise canonique

Aucun `<link rel="canonical">` dans `index.html`. Pour un SPA avec routes paramétrées (`?entite=:id`, `?filtres=...`), le risque de duplication est réel. À ajouter dynamiquement par page, avec stripping des query params non significatifs (tri, pagination affichage…).

#### I6 — Hiérarchie H1 → H3 sur l'accueil (saut de niveau)

`frontend/src/pages/Accueil.jsx` : H1 « Réseaux d'Influence » suivi directement de trois `<h3>` (Contribuez / Validez / Explorez), sans H2 intermédiaire. Sémantiquement incorrect : impact accessibilité (déjà flaggé probablement par Accessibility Champion) **et** SEO (Google utilise la hiérarchie pour comprendre la structure).

Correction : passer les trois cards en H2, ou wrapper dans une section H2 « En 3 étapes ».

---

### À AMÉLIORER

#### A1 — Pas de `humans.txt` ni mentions de crédits machine-lisibles

`humans.txt` (standard humanstxt.org) est anecdotique côté SEO mais utile pour la transparence du projet — qui le maintient, contact, technologies. Cohérent avec la posture « souveraineté + transparence démocratique » du README.

#### A2 — `<meta name="author">`, `<meta name="generator">`, `<meta name="theme-color">` absents

Pas critiques, mais à ajouter pour les aperçus de partage et la cohérence multi-plateforme. `theme-color` impacte l'aperçu Chrome mobile et iOS.

#### A3 — Pas de favicons multi-formats

`/vite.svg` par défaut. À remplacer par une icône projet (SVG + PNG 32/192/512) + `apple-touch-icon`.

#### A4 — Domaine URN custom `urn:reseaux-influences:` dans l'export JSON-LD

`backend/src/routes/export.js` ligne 97 utilise `urn:reseaux-influences:personne:${id}` comme `@id`. C'est valide mais **non résolvable**. Pour la GEO, des `@id` qui sont des URLs HTTPS publiques de la fiche correspondante (`https://reseauxinfluences.fr/entites/:id`) augmentent fortement la citabilité (un LLM peut suivre l'URL, un humain aussi).

#### A5 — Manifest PWA absent

Pas critique pour le SEO classique mais utile pour la « Add to Home Screen » et certains signaux de qualité. Optionnel au MVP.

#### A6 — `npm audit` et build CI : pas de Lighthouse SEO check

La CI (`.github/workflows/ci.yml`) ne fait pas tourner Lighthouse ni `pa11y`. À envisager post-MVP — un check Lighthouse SEO/a11y en CI sur PR évite la régression.

---

## Plan d'action GEO (AI discoverability)

Priorité décroissante. **Items 1-3 = fondations à mettre en place dès maintenant, même MVP vide.** Items 4-6 = à activer quand la base contient ≥ 50 entités validées.

### 1. `frontend/public/robots.txt` — minimum vital

```
# robots.txt — reseauxinfluences.fr
# Plateforme collaborative de cartographie des réseaux d'influence
# Toutes les fiches publiées sont validées par consensus communautaire (5+ validations, ratio 70%)

User-agent: *
Allow: /
Disallow: /api/
Disallow: /docs
Disallow: /enrichissement
Disallow: /profil/
# /profil/:id = profil de contributeur (utilisateur), pas une fiche d'entité publique

# Bots IA — autorisés sur le contenu public, refusés sur les API et l'admin
User-agent: GPTBot
Allow: /
Disallow: /api/
Disallow: /enrichissement

User-agent: ClaudeBot
Allow: /
Disallow: /api/
Disallow: /enrichissement

User-agent: PerplexityBot
Allow: /
Disallow: /api/
Disallow: /enrichissement

User-agent: Google-Extended
Allow: /

Sitemap: https://reseauxinfluences.fr/sitemap.xml
```

Note : si Rémi décide de ne **pas** autoriser l'entraînement des modèles propriétaires sur le corpus, remplacer les `Allow: /` des bots IA par `Disallow: /`. Discussion éditoriale à avoir — un corpus citable par ChatGPT est aussi un corpus dont on perd la maîtrise.

### 2. `frontend/public/llms.txt` — proposition

```
# Réseaux d'Influence

> Plateforme collaborative et ouverte de cartographie des réseaux d'influence interpersonnels et transnationaux. Toutes les relations entre personnes publiques sont sourcées (articles de presse, documents officiels, vidéos vérifiables) et validées par consensus communautaire (5 validations minimum, ratio 70%). Continuité du projet InfluenceNetwork développé chez Owni.fr par Nicolas Kayser-Bril, relancé par Rémi Vincent en 2026.

## Périmètre éditorial

- Personnes publiques uniquement (élus, hauts fonctionnaires, lobbyistes, dirigeants d'entreprise, artistes, producteurs, éditeurs de presse, hébergeurs, éditeurs de site)
- Base légale : exception journalisme et recherche d'intérêt public (RGPD art. 85 + loi Informatique et Libertés art. 80)
- Sources publiques officielles uniquement : Wikidata, RDAP/DNS, IGN (cadastre/géocodage/DVF)
- Souveraineté FR : hébergement Infomaniak (Suisse), zéro tracker, zéro CDN externe

## Ressources principales

- [Explorer le graphe](https://reseauxinfluences.fr/graphe) : visualisation interactive D3.js des relations
- [Liste des liens validés](https://reseauxinfluences.fr/liens) : flux des relations vérifiées
- [API publique](https://reseauxinfluences.fr/api/docs) : documentation Swagger/OpenAPI
- [Export des données](https://reseauxinfluences.fr/api/export/jsonld) : JSON-LD schema.org, CSV, GraphML

## Méthodologie

- Chaque lien doit être sourcé par une URL vérifiable (article de presse, document officiel, vidéo)
- Validation communautaire par gamification : 5 validations minimum, consensus à 70%
- Niveaux contributeurs : débutant → intermédiaire → expert → modérateur
- Versioning des contributions et journal d'audit complet

## Licence

Données et code sous licence MIT (à confirmer pour les données — discussion en cours sur ODbL ou CC-BY-SA).

## Contact

contact@reseauxinfluences.fr
```

À placer à `frontend/public/llms.txt` (Vite copie automatiquement `public/` à la racine du build). Mise à jour trimestrielle ou à chaque ADR structurante.

### 3. `frontend/public/humans.txt` — proposition

```
/* TEAM */
Porteur du projet : Rémi Vincent
Sur une idée originale de : Nicolas Kayser-Bril (InfluenceNetwork, Owni.fr)
Contact : contact@reseauxinfluences.fr
Site : https://reseauxinfluences.fr
Localisation : Normandie, France

/* SITE */
Dernière mise à jour : 2026-05-11
Langage : Français
Standards : HTML5, WCAG 2.1 AAA (cible), RGAA 4.1.2
Stack : Fastify 5 + Prisma + React 18 + Vite + Tailwind + D3.js
Hébergement : Infomaniak (Suisse, éco-responsable)

/* DATA */
Sources OSINT : Wikidata SPARQL, RDAP+DNS, IGN (BAN, DVF, API Carto)
Base légale RGPD : art. 85 RGPD + art. 80 LIL (exception journalisme/recherche)
```

### 4. Sitemap dynamique — endpoint Fastify

Ajouter `backend/src/routes/sitemap.js`, exposer `GET /sitemap.xml` non préfixé. Lecture des entités publiées (status `VALIDE`), génération `<urlset>` avec `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>`. Cache mémoire 1 h.

Ordre de priorité par type :

- `/` : priority 1.0
- `/graphe`, `/liens` : 0.9
- `/entites/:id` (personnes publiques validées) : 0.8
- `/sources/:id` (sources médiatiques validées) : 0.5

### 5. JSON-LD intégré dans le HTML servi (dépend de C1 — pré-rendu)

Une fois le pré-rendu en place, chaque fiche d'entité doit contenir un bloc `<script type="application/ld+json">` dans le `<head>`. Le code générateur existe déjà côté backend (`backend/src/routes/export.js`) — il faut l'extraire en utilitaire (`backend/src/utils/jsonld.js`) et l'injecter à la génération.

Schémas prioritaires :

- **Page d'accueil** : `WebSite` + `SearchAction` (recherche interne) + `Organization` (l'éditeur du site)
- **Fiche Personne** (`/entites/:id` type Personne) : `Person` avec `sameAs` Wikidata
- **Fiche Organisation** : `Organization` avec `sameAs`
- **Fiche SiteWeb** : `WebSite` ou `Organization` selon le titulaire
- **Page graphe** : `Dataset` (pointeur vers `/api/export/jsonld`)
- **Mentions légales** : `WebPage` + `Organization`

Corriger en passant le `@id` URN → URL HTTPS résolvable (cf. A4).

### 6. Inscription `Bing Webmaster Tools` + `Google Search Console`

Étapes au lancement public :

- Créer un compte Bing Webmaster Tools, soumettre `https://reseauxinfluences.fr` et `sitemap.xml`. **Critique pour ChatGPT** (s'appuie sur l'index Bing).
- Créer un compte Google Search Console, valider la propriété par fichier ou DNS.
- Activer IndexNow (Bing) pour publication immédiate des nouvelles fiches d'entités. Token IndexNow à placer dans `frontend/public/` + endpoint Fastify pour notifier à chaque création d'entité validée.

### 7. Présence Wikidata du projet lui-même

Hors code : créer une fiche Wikidata pour **le projet `reseauxinfluences.fr`** (item type `Q7397` = software / `Q35127` = website). Propriétés à renseigner :

- `instance of` (P31) : open data project / website
- `official website` (P856) : https://reseauxinfluences.fr
- `programming language` (P277) : Node.js, React
- `license` (P275) : MIT
- `follows` (P155) : InfluenceNetwork (si une fiche existe pour le projet originel d'Owni)
- `developer` (P178) : Rémi Vincent (s'il a une fiche Wikidata)

Effet : crée un lien sémantique Wikidata → site, qui amorce le knowledge graph. Effort : ~30 min. **Aucune garantie** que les LLMs s'en servent, mais c'est un signal d'autorité à coût marginal.

---

## Recommandations entité / autorité

### Positionnement éditorial pour la GEO

Le projet a un narratif fort qui doit être **systématiquement répété** dans le contenu, les balises meta et le llms.txt :

1. **Continuité historique** : « Continuité du projet InfluenceNetwork (Owni.fr, Nicolas Kayser-Bril, 2010-2012) ». C'est un signal d'autorité par filiation — les LLMs apprécient les références historiques vérifiables.
2. **Méthodologie de vérification** : « Consensus communautaire 5 validations / 70% ratio + sources médiatiques vérifiables ». Un LLM cite plus volontiers une source dont la méthodologie est explicite.
3. **Cadre légal explicite** : « RGPD art. 85 + LIL art. 80 — exception journalisme et recherche d'intérêt public ». Très important pour la confiance des LLMs sur un sujet sensible (données personnelles de personnes publiques) — les modèles modernes sont entraînés à valoriser les sources qui exposent leur cadre légal.
4. **Souveraineté FR/Suisse** : « Hébergement Infomaniak (Suisse), zéro tracker, zéro CDN externe, RGPD strict ». Différenciation forte sur la cible journalistes/chercheurs.

Ces 4 éléments doivent figurer **dans la première section de chaque page** susceptible d'être citée — pas seulement dans les CGU ou la page « À propos ».

### Signaux d'autorité croisés

- **Lien sortant vers `posthack.com`** (même créateur) dans le footer ou les mentions légales : signal de cohérence d'identité pour Rémi Vincent comme personne. Réciproque côté posthack.com.
- **Profil Rémi Vincent** : créer ou consolider sa fiche Wikidata si elle existe, avec `knowsAbout` pointant vers les sujets traités (cartographie d'influence, OSINT, RGPD).
- **Citations académiques** : si des chercheurs (sciences politiques, journalisme d'investigation) citent le projet dans des articles ou conférences, le mentionner sur une page `/presse` ou `/ressources` avec liens vers les publications. Très fort signal pour la GEO.
- **Comparaison avec sources concurrentes** : page `/methodologie` qui explique en quoi le projet diffère de Wikipedia (granularité des relations), de LittleSis (couverture FR), de OpenSanctions (focus relations vs sanctions). Les LLMs adorent les tableaux comparatifs structurés.

### Entité « reseauxinfluences.fr » dans le knowledge graph

Pour que `reseauxinfluences.fr` devienne une entité reconnue :

- Mention cohérente dans 3+ sources indépendantes (Wikidata, posthack.com, profils GitHub/LinkedIn de Rémi)
- Description identique partout (le même paragraphe de 2-3 phrases)
- Schema.org `Organization` ou `Dataset` sur la home

### Choix de licence pour le corpus de données (à trancher)

Le README mentionne MIT. **Pour des données, MIT n'est pas adapté** — c'est une licence logicielle. Pour un corpus collaboratif sourcé, les choix pertinents sont :

- **ODbL** (Open Database License) : utilisée par OpenStreetMap. Share-alike fort, protection contre la captation par GAFAM.
- **CC-BY 4.0** : libre, simple, attribution obligatoire. Pas de share-alike → un acteur tiers peut bâtir un produit fermé dessus.
- **CC-BY-SA 4.0** : compromis, share-alike sans la complexité d'ODbL.

Cette décision a un impact GEO : un LLM peut citer plus largement un corpus CC-BY qu'un corpus tout-droits-réservés, et la mention de la licence dans le JSON-LD (`Dataset.license`) est un signal de citabilité. À documenter dans une ADR-007.

---

## Points forts

1. **Fondation HTML saine** : `<html lang="fr">`, viewport sans `user-scalable=no`, charset UTF-8, hiérarchie H1 unique par page (sauf accueil cf. I6).
2. **JSON-LD côté backend déjà bien pensé** : `backend/src/routes/export.js` produit du schema.org propre (`Person`, `Organization`, `Role`, `Dataset`, `CreativeWork`, `AggregateRating`). Le travail conceptuel est fait, il manque l'insertion côté front.
3. **Souveraineté + RGPD strict comme positionnement** : différenciation forte pour la cible journalistes FR — facteur de confiance pour les LLMs modernes qui valorisent les sources transparentes sur leur cadre légal.
4. **Méthodologie de vérification publique et formalisée** (consensus, gamification, audit trail) : narratif idéal pour la citabilité par LLMs.
5. **Continuité historique avec InfluenceNetwork (Owni)** : ancrage temporel et filiation qui donnent du poids éditorial.
6. **ADR documentés et publics** : montrent la rigueur de la conception, exploitables comme contenu indexable (`/architecture/decisions/`) — bonus citabilité.
7. **Sources OSINT officielles uniquement** (Wikidata, RDAP, IGN open data) : crédibilité forte vs sources scrappées, transparence revendiquée — facteur de confiance LLM.

---

## Récapitulatif effort/impact

| Action                         | Effort            | Impact MVP      | Impact post-MVP    |
| ------------------------------ | ----------------- | --------------- | ------------------ |
| robots.txt                     | 10 min            | moyen           | élevé              |
| llms.txt                       | 30 min            | faible          | moyen              |
| humans.txt                     | 10 min            | faible          | faible             |
| OG/Twitter dans index.html     | 30 min            | moyen (partage) | élevé              |
| Hiérarchie titres accueil (I6) | 10 min            | faible          | faible             |
| sitemap.xml dynamique          | 2-3 h             | nul (base vide) | critique           |
| JSON-LD intégré par page       | 4-6 h (dépend C1) | nul             | critique           |
| Pré-rendu SPA (C1)             | 1-2 j             | nul             | critique           |
| react-helmet par route         | 2 h               | faible          | élevé              |
| Bing Webmaster + IndexNow      | 1 h               | nul             | critique (ChatGPT) |
| Wikidata projet                | 30 min            | faible          | moyen              |

**Recommandation de séquence** :

1. **Aujourd'hui** : robots.txt + humans.txt + llms.txt + OG/Twitter + correction I6 (≤ 1 h cumulé, tout en `public/` ou `index.html`).
2. **Avant ouverture publique** : pré-rendu SPA + sitemap dynamique + JSON-LD intégré + react-helmet (2-3 j).
3. **Au lancement** : Bing Webmaster, Google Search Console, Wikidata projet, IndexNow.

Pas la peine de tout faire avant que la base contienne du contenu citable — un site vide ne profite pas du pré-rendu.

---

## Notes de méthodologie

- Audit READ-ONLY, aucun fichier de code modifié.
- Aucun crawl externe ni test live (le projet n'est pas encore en production sur `reseauxinfluences.fr` au moment de l'audit).
- Recommandations calibrées **pour un MVP en cours**, pas pour un site mature — les actions « critiques » d'un site à 10k pages indexées ne sont pas les mêmes que celles d'un site à 0 page.
- Tous les chiffres d'effort sont indicatifs, à valider par l'Implementer.

⚠️ **Conflits potentiels avec autres agents** :

- **Accessibility Champion** : la hiérarchie de titres I6 est probablement aussi flaggée côté a11y. Action commune.
- **Performance Sentinel** : le pré-rendu (C1) augmente le poids des pages individuelles servies. À arbitrer — c'est un compromis SEO/perf nécessaire, perf reste en 5e priorité.
- **Security Guardian** : `Disallow: /enrichissement` dans robots.txt **ne sécurise rien** (les bots malveillants l'ignorent). C'est un signal pour les bots respectueux uniquement. La vraie sécurité d'`/enrichissement` doit rester côté backend (JWT obligatoire). Le robots.txt vient en complément, pas en remplacement.
- **Eco-Design Guardian** : un sitemap dynamique régénéré à chaque requête est gourmand. Cache mémoire 1 h obligatoire.
