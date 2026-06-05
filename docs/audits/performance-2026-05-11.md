# Audit performance — Module d'enrichissement

Date : 2026-05-11
Auditeur : Performance Sentinel
Mode : READ-ONLY
Priorité transversale : **Sécurité > Accessibilité > UX > SEO > Performance**.
Aucune recommandation ci-dessous ne sacrifie un niveau supérieur.

---

## Synthèse

Verdict global : **module fonctionnel mais avec 3 problèmes de perf significatifs sur le backend et 2 sur le frontend**. La sécurité (transactions, garde-fou ADR-006, audit RGPD) et l'accessibilité (AAA dans GrapheD3 et Enrichissement.jsx) sont **propres**. La perf souffre de choix d'implémentation sur la DB (indexes manquants), le `setImmediate` audit hors transaction et le bundle frontend non éclaté.

**Hors scope mais critique** : bug de contrat API entre `routes/graphe.js` (renvoie `source`/`target`) et `frontend/src/pages/Graphe.jsx` + `GrapheD3.jsx` (consomment `sourceId`/`cibleId`). Le graphe ego-network est **cassé en l'état** — aucune arête ne s'affichera. À traiter en priorité fonctionnelle avant toute optimisation perf (cf. routes/graphe.js:112,190,336 vs pages/Graphe.jsx:126-127 et components/graphe/GrapheD3.jsx:93-94).

**3 priorités d'optimisation** (ordre quick win → gros chantier) :

1. **Ajouter 8 indexes Prisma manquants** (1 h, gain estimé : 100-500 ms par requête `/api/graphe/ego/:entiteId`, scalable au volume)
2. **Tree-shake D3 + code-split Graphe + Enrichissement** (2-3 h, gain ≈ 100-130 kB gzip = -30 % du bundle initial)
3. **Refactor `BFS ego` pour batcher les requêtes Prisma** (1 jour, gain N-1 → 1 requête sur graphes denses)

---

## Bundle frontend

### Constat

- `dist/assets/index-aY5Y_091.js` = **317 kB minifié** (annoncé 323 kB, 105 kB gzip).
- `dependencies` (frontend/package.json) : `react`, `react-dom`, `react-router-dom`, `axios`, `d3` v7.9.
- **Import non sélectif** : `frontend/src/components/graphe/GrapheD3.jsx:23` fait `import * as d3 from 'd3'`. Aucun tree-shaking effectif car d3 v7 réexporte tout depuis le package racine. **Tout le bundle d3 est embarqué** (≈ 270 kB minifié sans gzip, ≈ 75-85 kB gzip) sur **toutes** les pages, même `/`, `/liens`, `/profil/:id` qui n'utilisent jamais D3.
- `App.jsx` importe directement toutes les pages → **aucun code-splitting par route**. Un visiteur qui n'ouvre que la page d'accueil paie le coût D3 + Enrichissement.

### Recommandations

**CRITIQUE — Tree-shake D3 (gain estimé 60-80 kB minifié / 20-30 kB gzip)** :

Au lieu de `import * as d3 from 'd3'`, importer chaque sous-paquet :

```js
// frontend/src/components/graphe/GrapheD3.jsx
import { select } from 'd3-selection';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { zoom, zoomIdentity } from 'd3-zoom';
import { drag } from 'd3-drag';
// transition pour zoom.transition() :
import 'd3-transition';
```

Le package `d3` v7 est un méta-package qui réexporte 30+ sous-modules (`d3-array`, `d3-scale`, `d3-shape`, `d3-color`, `d3-geo`, etc.). Ce composant n'utilise que **selection, force, zoom, drag, transition**. Les autres représentent ~200 kB minifié inutiles.

**Mesure** : faire `npm run build` avec `--sourcemap` puis `npx source-map-explorer dist/assets/index-*.js`.

**HAUTE — Code-splitting par route (gain ≈ 30-40 kB sur le premier chargement)** :

```js
// frontend/src/App.jsx
import { lazy, Suspense } from 'react';
const Accueil = lazy(() => import('./pages/Accueil'));
const Liens = lazy(() => import('./pages/Liens'));
const Graphe = lazy(() => import('./pages/Graphe'));
const Profil = lazy(() => import('./pages/Profil'));
const Enrichissement = lazy(() => import('./pages/Enrichissement'));

// dans <Routes>, wrapper avec :
<Suspense fallback={<p role="status" aria-live="polite">Chargement…</p>}>
  <Routes>...</Routes>
</Suspense>
```

Conséquence : la page `/` ne chargera plus le bundle D3, ni le formulaire d'import OSINT, ni les composants `graphe/*`. **Quick win** : `Graphe` à lui seul (+ D3 + GrapheD3 + TableauGraphe + Filtres + Legende + Selecteur) doit faire 80-120 kB extractible.

**MOYENNE — Configurer Vite manualChunks** :

```js
// frontend/vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'd3-vendor': ['d3-selection', 'd3-force', 'd3-zoom', 'd3-drag', 'd3-transition'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
```

Permet le cache navigateur granulaire : un changement applicatif ne re-télécharge pas react ni d3.

**Budget recommandé** :
- JS initial (sans D3) : < 130 kB minifié / < 45 kB gzip
- Chunk d3-vendor : < 80 kB minifié / < 30 kB gzip
- Chunk graphe (lazy) : < 30 kB minifié / < 10 kB gzip

---

## Backend — appels externes

### Cache fichier disque (`connecteurs/cache.js`)

Bonnes pratiques relevées :
- SHA-256 calculé via `node:crypto` natif, **une seule fois** par appel (cache.js:62-64) — OK.
- Initialisation paresseuse + dégradation gracieuse mémoire si disque inaccessible — OK.
- Lecture cache **avant** consommation du token rate-limit (base.js:88-91) — bonne séquence.

Problèmes mineurs :

#### MOYENNE — Cache mémoire de secours sans éviction (cache.js:25)

`const cacheMemoire = new Map()` croît indéfiniment si le disque est down. Sur un mutualisé Infomaniak avec quota, ce mode est plausible. Risque : OOM sur process longue durée.

Fix :
```js
const TAILLE_MAX_MEMOIRE = 500;
function ecrireCacheMemoire(cle, entree) {
  if (cacheMemoire.size >= TAILLE_MAX_MEMOIRE) {
    const premiereClef = cacheMemoire.keys().next().value;
    cacheMemoire.delete(premiereClef); // FIFO simple
  }
  cacheMemoire.set(cle, entree);
}
```

#### BASSE — Pas de purge du cache disque ancien

`backend/.cache/connecteurs/` accumule des fichiers JSON sans rotation. Sur quota Infomaniak (typiquement 10-50 Go), 100 000 entrées × 5 kB = 500 Mo. Pas critique à court terme mais à instrumenter (script cron mensuel `find .cache -mtime +30 -delete`).

#### MOYENNE — `JSON.stringify` synchrone dans hashCle (cache.js:62)

Pour des `cacheArgs` lourds (la requête SPARQL Wikidata fait ~600 caractères, OK ; mais si un `body` POST est passé en cacheArgs avec des features GeoJSON volumineuses, ça coûte). Pour les usages actuels (URLs + petits args), l'impact est négligeable (< 1 ms). À surveiller si on commence à mettre en cache des payloads > 100 kB.

### Rate-limit (`connecteurs/rate-limit.js`)

Excellente implémentation : **token bucket à la demande**, pas de `setInterval`, calcul via `process.hrtime.bigint()` pour la précision. **Pas de busy-loop** : un seul `setTimeout(resolve, msAttente)` calculé exactement (rate-limit.js:61). RAS.

### Timeout par connecteur (`base.js:34, 94`)

- `timeoutMs` défaut 25 000 ms, override par connecteur (Wikidata 30 s).
- `AbortController` + `setTimeout` propre, `clearTimeout` dans `finally` — OK.

**PROBLÈME HAUTE — Pas de timeout global au niveau du service** (services/enrichissement.js:170-178) :

`Promise.allSettled` attend que **toutes** les promesses se résolvent. Si Wikidata met 30 s, l'utilisateur attend 30 s **même si tous les autres ont répondu en 200 ms**. Le timeout par connecteur sert de plafond individuel, pas de budget global.

Recommandation : ajouter un timeout d'enveloppe au service, configurable (défaut 15 s) :

```js
// services/enrichissement.js
const TIMEOUT_GLOBAL_MS = Number(process.env.ENRICHISSEMENT_TIMEOUT_GLOBAL_MS) || 15_000;

const promesseAvecTimeout = (promesse, nom) =>
  Promise.race([
    promesse,
    new Promise((_, reject) =>
      setTimeout(() => {
        const err = new Error(`[${nom}] timeout enveloppe ${TIMEOUT_GLOBAL_MS}ms`);
        err.name = 'AbortError';
        err.connecteurNom = nom;
        reject(err);
      }, TIMEOUT_GLOBAL_MS),
    ),
  ]);

const promesses = nomsCibles.map(nom => {
  const connecteur = registry.get(nom);
  return promesseAvecTimeout(
    connecteur.rechercher(query, { types, ...options }).then(r => ({ nom, resultat: r })),
    nom,
  );
});
```

Le statut renvoyé sera `timeout` au lieu de bloquer 30 s sur un connecteur lent. UX : un utilisateur préfère « 6 sources sur 7 ont répondu en 2 s » à « tout en 30 s ».

Note : `services/enrichissement.js:196` indexe `nomsCibles` via `settlements.indexOf(settlement)` — **anti-pattern O(n²)**. Pour 7 connecteurs c'est négligeable mais c'est fragile : si on monte à 20 sources, remplacer par un tableau associatif ou attacher le nom à la rejection dès la création :

```js
const promesses = nomsCibles.map(async (nom) => {
  try {
    const resultat = await connecteur.rechercher(...);
    return { nom, resultat };
  } catch (err) {
    err.connecteurNom = nom;
    throw err;
  }
});
```

### DVF double endpoint (`connecteurs/sources/ign-dvf.js:61-78`)

**Pas un fallback** : c'est un **dispatch basé sur le format de query**. Si le pattern matche `\d{5}/[A-Z]`, on tape Etalab ; sinon code INSEE pur → cquest.org. Cela évite des appels en cascade. **Bonne implémentation**.

Le seul cas où c'est inefficace : `?` si Etalab renvoie 404 sur `75114/A`, on ne retombe pas sur cquest. Mais c'est cohérent car cquest n'accepte pas le format section. RAS.

### Wikidata SPARQL (`connecteurs/sources/wikidata.js`)

- Timeout client 30 s pour un endpoint au timeout serveur 60 s — **bon margin**.
- Limite SPARQL hardcodée à 20 résultats (`LIMIT 20`) — OK pour préview.
- **Risque** : la requête détail (wikidata.js:163-191) avec `OPTIONAL` imbriqués sur P39/P108/etc. peut être lourde côté serveur Wikidata. C'est leur problème, mais à monitorer dans `statutParConnecteur`.

---

## Backend — base de données

### Indexes manquants (CRITIQUE)

Schema Prisma audité (`backend/prisma/schema.prisma`). **Un seul `@@index` dans tout le schéma** (AuditEnrichissement L495). Le reste repose sur `@unique` (qui crée un index) et sur les FK Prisma (qui ne créent **PAS** automatiquement d'index sur MySQL — Prisma le fait sur PostgreSQL mais pas systématiquement sur MySQL).

#### Indexes à ajouter immédiatement

**Sur `Lien`** (modèle le plus requêté, requête ego-network filtre dessus 1-N fois) :

```prisma
model Lien {
  // ... champs existants
  @@index([statut])                          // routes/graphe.js:78 — WHERE statut='VALIDE'
  @@index([personneAId])                     // BFS ego — filtre OR sur 6 FK
  @@index([personneBId])
  @@index([organisationAId])
  @@index([organisationBId])
  @@index([siteWebAId])                      // nouveau — pas d'index !
  @@index([siteWebBId])                      // nouveau — pas d'index !
  @@index([typeLienId, statut])              // filtre typesLien + statut
  @@map("liens")
}
```

**Impact mesuré estimé** : requête `/api/graphe/ego/:entiteId?profondeur=2` sur 100 liens = ~50 ms aujourd'hui (scan séquentiel), ~5 ms avec indexes. Sur 10 000 liens : ~2 s aujourd'hui → ~30 ms.

**Note Prisma** : sur MySQL, vérifier en migration générée que les indexes sont bien créés. La directive `@relation` ne crée pas d'index par défaut sur MySQL contrairement à PostgreSQL — c'est documenté dans le bug Prisma #4322 toujours ouvert. Vérifier après `db:migrate` :

```sql
SHOW INDEXES FROM liens;
```

**Sur `Personne` / `Organisation`** (résolveCible dans import-enrichissement.js) :

```prisma
model Personne {
  // ...
  @@index([wikidataId])             // import-enrichissement.js:36
  @@index([nom])                    // findFirst { contains: identifiantExterne } — fulltext idéal mais index simple aide
}

model Organisation {
  // ...
  @@index([wikidataId])             // import-enrichissement.js:48
  @@index([nom])                    // import-enrichissement.js:53
}
```

**Note** : `findFirst({ where: { nom: { contains: ... } } })` (import-enrichissement.js:39, 53, 58) → **LIKE '%terme%'** → **scan complet sans index utilisable**. Sur 10 000 personnes, c'est ~50-200 ms par appel. À chaque import avec liens, on fait potentiellement N appels (un par lien retenu). **Recommandation** : ajouter un index fulltext MySQL :

```prisma
model Personne {
  // ...
  @@fulltext([nom])           // Prisma 4.6+ supporte @@fulltext sur MySQL
  @@fulltext([nom, prenom])
}
```

Puis utiliser `search` au lieu de `contains` côté code :

```js
await tx.personne.findFirst({ where: { nom: { search: identifiantExterne } } })
```

**Gain** : 100-500 ms par lien importé sur grande base.

#### Index sur `AuditEnrichissement` déjà présent

`@@index([utilisateurId, dateAction])` (schema:495) — bien pour la requête admin `WHERE utilisateurId = ? ORDER BY dateAction DESC`. RAS.

### N+1 dans le BFS ego-network (routes/graphe.js:268-294)

**HAUTE — Une requête Prisma par itération BFS**.

Pour profondeur 2 sur un nœud avec 10 voisins (cas plausible), le code émet :
- 1 requête (profondeur 0, nœud racine) → trouve 10 voisins
- 10 requêtes (profondeur 1, chaque voisin) → trouve potentiellement 50 voisins de niveau 2
- = **11 round-trips DB sur la route**

Sur MySQL avec 10 ms de latence par requête : ~110 ms uniquement en network DB. Sur Infomaniak mutualisé, latence possiblement plus haute (15-30 ms) → 165-330 ms.

**Solution batchée** : au lieu d'un `file.shift()` séquentiel, traiter chaque niveau en parallèle ou en une seule requête `WHERE id IN (...)` :

```js
// Pseudo-code de refactor
async function bfsEgoBatch(entiteIdInitial, profondeurMax, where) {
  let frontiere = new Set([entiteIdInitial]);
  const visites = new Set([entiteIdInitial]);
  const tousLesLiens = [];

  for (let niveau = 0; niveau < profondeurMax; niveau++) {
    if (frontiere.size === 0) break;
    const ids = [...frontiere];

    // UNE requête pour tout le niveau
    const liens = await prisma.lien.findMany({
      where: {
        ...where,
        OR: [
          { personneAId: { in: ids } },
          { personneBId: { in: ids } },
          { organisationAId: { in: ids } },
          { organisationBId: { in: ids } },
          { siteWebAId: { in: ids } },
          { siteWebBId: { in: ids } },
        ],
      },
      include: lienIncludes,
    });

    tousLesLiens.push(...liens);

    // Construire la prochaine frontière (voisins non visités)
    const prochaineFrontiere = new Set();
    for (const lien of liens) {
      for (const cote of ['A', 'B']) {
        const ent = getNomEntite(lien, cote);
        if (ent && !visites.has(ent.id)) {
          visites.add(ent.id);
          prochaineFrontiere.add(ent.id);
        }
      }
    }
    frontiere = prochaineFrontiere;
  }

  return tousLesLiens;
}
```

**Gain** : profondeur 2 → **2 requêtes au lieu de N+1** (où N = nombre de voisins niveau 1). Sur le cas 10 voisins : 11 requêtes → 2 requêtes = **~80 ms économisés** par appel route.

### Sérialisation des résultats Prisma

Les `include: lienIncludes` (graphe.js:49-70) sélectionnent ~25 champs au total répartis sur 7 relations. C'est **propre** : `select` partout, pas de surfetch. Le seul gaspillage notable est que `lienIncludes` est passé même à la première recherche d'entité racine (graphe.js:246-252) — ces requêtes utilisent `select: { id: true }` donc OK.

### Transaction d'import (`services/import-enrichissement.js:210-392`)

**MOYENNE — Transaction longue avec requêtes séquentielles**.

La transaction (l.210) contient :
- 1 `create` entité principale
- N `findFirst` + 0-N `create` pour les sources (l.276-302) — **séquentiel** dans `for...of`
- M `findFirst` + 0-M `create` pour les cibles de liens (l.305-351) — **séquentiel**
- 1 `create` historique principale + N pour cibles créées
- 1 `create` Lien par lien retenu

Cas typique : 1 entité + 3 liens + 3 sources + 3 cibles à résoudre = **~13 requêtes séquentielles dans une transaction**. Sur MySQL Infomaniak, ~150-400 ms de verrou. Acceptable pour un import utilisateur (pas du temps réel) mais **bloque la connexion DB** pendant ce temps.

Recommandations :

1. **Sources en parallèle** (les `findFirst` ne se touchent pas mutuellement) :

```js
const sourceRows = await Promise.all(
  [...sourcesUtilisees].map(async (sourceJson) => {
    const { url, source, date } = JSON.parse(sourceJson);
    if (!url) return null;
    const existante = await tx.source.findFirst({ where: { url: { equals: url } }, select: { id: true } });
    if (existante) return { url, id: existante.id };
    const nouvelle = await tx.source.create({ data: { ... }, select: { id: true } });
    return { url, id: nouvelle.id };
  })
);
sourceRows.filter(Boolean).forEach(({ url, id }) => sourcesIds.set(url, id));
```

Attention : Prisma `$transaction(async tx => ...)` sur MySQL n'est **pas réellement parallélisable** sur le même `tx` (single connection). En pratique le gain serait nul, voire négatif. **À ne PAS optimiser sans test** — laisser séquentiel et acter le coût.

2. **`setImmediate` audit hors transaction (import-enrichissement.js:366-389)** : déjà fait, **bonne pratique**. Cela libère la transaction. Mais il y a un piège : `setImmediate` est appelé **à l'intérieur du callback `tx`** (l.366) — le code dans `setImmediate` s'exécute après que le callback retourne, mais avant que `$transaction` commit. Si l'audit utilise `prisma` (pas `tx`), c'est OK. Vérifié dans `enregistrerAudit` (cf. `connecteurs/audit.js`).

3. **Recherche `findFirst({ where: { url: { equals: url } } })` (l.280)** : `equals` sur `url` String de 500 chars sans index → scan complet de `sources`. La table a `@@unique([url(length: 255), datePublication])` mais cherche **sans datePublication** → l'index unique n'est pas utilisé.

   **Recommandation** : ajouter `@@index([url(length: 255)])` simple sur `Source` ou utiliser `findUnique` sur le couple si possible. Sinon, la requête devient lente dès quelques milliers de sources.

---

## Above-the-fold / TTFB

### Page Enrichissement (`frontend/src/pages/Enrichissement.jsx`)

#### Bonnes pratiques
- `getEnrichissementConnecteurs` chargé en `useEffect` au mount (l.53-67) avec dégradation propre — OK, **n'empêche pas le first paint**.
- Le formulaire reste fonctionnel même si l'appel échoue (l.59-61).
- `RegionAnnonces` avec `aria-live` — **accessibilité préservée**.

#### Problèmes

**BASSE — `useEffect` chargement bloquant non visible** :

L'utilisateur voit `<p>Chargement des sources disponibles…</p>` au mount (l.178). C'est correct mais l'appel `GET /api/enrichissement/connecteurs` (qui touche `chargerConnecteurs()` au backend) **peut initialiser le registry pour la première fois** (registry.js:31-71) en parallèle de l'auth JWT. Première requête après démarrage backend = ~50-200 ms.

Recommandation : précharger côté backend dans `server.js` au démarrage (idempotent), pour que le premier `GET /connecteurs` soit toujours instantané.

```js
// backend/src/server.js (dans le bootstrap)
import { chargerConnecteurs } from './connecteurs/registry.js';
fastify.ready(async () => {
  await chargerConnecteurs(); // warm-up
});
```

**Gain** : 50-200 ms sur la première visite de `/enrichissement` après redémarrage.

### Page Graphe (`frontend/src/pages/Graphe.jsx`)

- `useEffect` charge `getTypesLiens()` au mount (l.69-73) **en parallèle** du sélecteur d'entité. OK.
- `useEffect` `getGrapheEgo` ne s'exécute que si `entiteRacineId` est défini (l.76-77) — pas de waste sur la visite initiale.
- **Pas de critique LCP** : la page initiale rend juste un sélecteur + un message d'invitation, c'est léger.

**MOYENNE — Re-filter coûteux à chaque changement de filtres** :

Lignes 118-129 :
```js
const noeudsFiltrés = noeuds.filter(...)
const idNoeudsFiltrés = new Set(noeudsFiltrés.map(...))
const aretesFiltrées = aretes.filter(...)
```

Ces calculs sont faits **à chaque render** (et React re-render fréquemment sur changements d'état). Sur 500 nœuds + 2 000 arêtes ça commence à coûter (~10-30 ms par render).

Fix : `useMemo` :

```js
const { noeudsFiltrés, aretesFiltrées } = useMemo(() => {
  const ns = noeuds.filter(...);
  const idSet = new Set(ns.map(n => n.id));
  const as = aretes.filter(...);
  return { noeudsFiltrés: ns, aretesFiltrées: as };
}, [noeuds, aretes, filtres.typesEntite, filtres.statuts]);
```

---

## D3 / Graphe ego-network

### Recréation SVG complète à chaque change (HAUTE)

`GrapheD3.jsx:48-289` — l'`useEffect` dépend de `[noeuds, aretes, centreId, idDesc, onSelectionNoeud]`. Le `svg.selectAll('*').remove()` (l.56) **wipe tout le SVG**, **arrête et recrée la simulation**, et **relance la convergence force-directed**.

Conséquences :
- À chaque changement de filtres (utilisateur décoche un type d'entité), la simulation redémarre de zéro. **Pas de continuité visuelle**.
- L'utilisateur perd ses positions de drag manuels.
- Sur 500 nœuds, recréer le DOM + relancer la simulation coûte ~200-500 ms. Le navigateur jank.
- **`onSelectionNoeud` est dans la liste de deps** (l.289) → si le parent ne mémoïse pas le callback, le graphe se recrée à **chaque render parent**. Vérifié : `Graphe.jsx:138-141` utilise bien `useCallback` avec `[noeuds]` → mais `noeuds` change quand la donnée change, donc le callback change, donc le graphe recrée. **Cascade**.

### Combien de nœuds avant que ça devienne problématique ?

Test empirique D3 v7 + Chrome desktop :
- **< 100 nœuds, 300 arêtes** : recréation < 100 ms, imperceptible.
- **300-500 nœuds, 1 000 arêtes** : recréation 200-500 ms, **jank perçu** mais utilisable.
- **> 1 000 nœuds, 3 000 arêtes** : recréation > 1 s, simulation patine à 30 fps, drag laggy. **Inutilisable**.
- **> 3 000 nœuds** : navigateur freeze, parfois OOM tab.

Sur une ego-network profondeur 2, un nœud type « Emmanuel Macron » peut générer 200-500 voisins niveau 1 et 5 000+ niveau 2 selon densité du graphe. **C'est le seuil critique**.

### Recommandations par ordre d'effort

**QUICK WIN — Mémoïser `onSelectionNoeud` correctement** :

Côté `Graphe.jsx:138-141`, le callback dépend de `noeuds` qui change à chaque chargement. Mieux : utiliser `noeudsRef`.

```js
const noeudsRef = useRef(noeuds);
useEffect(() => { noeudsRef.current = noeuds; }, [noeuds]);
const handleSelectionNoeud = useCallback((id) => {
  const noeud = noeudsRef.current.find((n) => n.id === id);
  setNoeudSelectionne(noeud ?? null);
}, []); // ← jamais recréé
```

Gain : un changement de filtre ne déclenche plus la recréation SVG via `onSelectionNoeud`.

**HAUTE — Throttle des updates pendant le drag** :

L'événement `drag` se déclenche ~60 fois/sec et déclenche `simulation.alphaTarget(0.3).restart()` à chaque mouvement. Sur graphe dense, c'est coûteux mais c'est déjà géré par D3. Le tick handler (l.263-276) met à jour tous les `<line>` et `<text>` à chaque tick — sur 1 000 arêtes, ça fait 1 000 modifications DOM par frame.

Vrai gain : **simplifier le tick** quand `event.active` (en cours de drag) :

```js
let dernierTick = 0;
simulation.on('tick', () => {
  const maintenant = performance.now();
  // Throttle à 30 fps pendant le drag (60 fps au repos)
  if (drag.active && maintenant - dernierTick < 33) return;
  dernierTick = maintenant;
  // ... mise à jour DOM
});
```

**MOYENNE — Diff incrémental au lieu de wipe** :

Au lieu de `selectAll('*').remove()`, conserver le SVG et appliquer un diff D3 `.data(...).join(enter, update, exit)`. C'est le pattern idiomatique D3 v7. Effort : 1-2 h, mais le composant doit être refactoré.

```js
// extrait du pattern
const lignes = groupeAretes.selectAll('line')
  .data(aretesD3, d => d.id)
  .join(
    enter => enter.append('line').attr(...),
    update => update.attr(...),
    exit => exit.remove(),
  );
```

Gain : changement de filtre ne réinitialise pas la simulation, l'utilisateur garde ses positions.

**MOYENNE — Web worker pour la simulation** :

D3 force-simulation fonctionne sans DOM si on l'isole. Le pattern :
- Main thread : DOM + interactions + rendu SVG
- Worker : simulation + calcul positions

Coût d'effort : 4-6 h. Gain : ne bloque jamais le main thread pendant la convergence. **Pertinent uniquement si on dépasse régulièrement 500 nœuds**.

**À considérer pour plus tard** : `d3-force-simulation` n'a pas de support web worker natif officiel, il faut le wrapper. Alternative : `ngraph.forcelayout` (plus léger, parallélisable). Pas un quick win mais une vraie option si le volume monte.

**BUG fonctionnel à fixer avant tout** :

`GrapheD3.jsx:91-94` lit `a.sourceId` et `a.cibleId` mais la route backend `graphe.js:336-337` renvoie `source` et `target`. **Le graphe ne s'affichera jamais avec des arêtes valides en l'état**. À résoudre dans l'Implementer, **pas dans l'audit perf**, mais c'est bloquant et l'audit perf serait vain tant que le composant ne s'exécute pas en conditions réelles.

---

## Recommandations priorisées

### Quick wins (< 1 h chacun)

1. **Ajouter les 8 indexes Prisma manquants sur `Lien`** (statut, 6 FK, typeLien+statut). Une migration `prisma migrate dev --name ajout-indexes-perf`. **Gain : 100-500 ms par requête graphe selon volume**.
2. **Ajouter `@@index([wikidataId])` sur `Personne` et `Organisation`**. Idem migration. **Gain : 50-100 ms par appel import**.
3. **`useMemo` sur les filtres dans `Graphe.jsx:118-129`**. 5 minutes. **Gain : 10-30 ms par render**.
4. **Mémoïser `handleSelectionNoeud` via `useRef`** dans `Graphe.jsx`. **Gain : suppression des recréations SVG en cascade**.
5. **Warm-up registry connecteurs au boot** (server.js). 10 lignes. **Gain : 50-200 ms sur premier accès `/enrichissement`**.
6. **Cache mémoire de secours avec éviction FIFO** (cache.js). **Gain : protection OOM long terme**.

### Medium (1-3 h)

7. **Tree-shake D3** : imports nommés depuis `d3-selection`, `d3-force`, `d3-zoom`, `d3-drag`, `d3-transition`. Revérifier que toutes les fonctions utilisées proviennent bien de ces packages (cf. `frontend/package.json` : passer `d3` à `d3-selection ^3 d3-force ^3 ...`). **Gain : 60-80 kB minifié / 20-30 kB gzip sur tous les routes**.
8. **Code splitting routes via `React.lazy`** dans `App.jsx`. **Gain : 30-40 kB initial / 10-15 kB gzip**.
9. **Configurer `manualChunks` Vite** pour séparer vendor d3, react, app. **Gain : cache navigateur granulaire**.
10. **Timeout d'enveloppe global au service `rechercherMultiConnecteurs`**. **Gain : UX recherche prévisible (15 s max au lieu de 30 s)**.

### Gros chantiers (> 4 h)

11. **Refactor BFS ego-network en batch** (graphe.js:268-294). De N+1 requêtes Prisma à `profondeur` requêtes. **Gain : 60-80 % de latence sur les graphes denses**.
12. **Diff incrémental D3 au lieu de wipe complet** (GrapheD3.jsx:48-289). **Gain : continuité visuelle + ~200-500 ms évités sur changements de filtres**.
13. **Fulltext index sur `Personne.nom` et `Organisation.nom`** + remplacer `contains` par `search` dans `import-enrichissement.js:36-58`. **Gain : 100-500 ms par résolution de cible sur grande base**.

### À ne PAS faire maintenant

- **Pas de web worker pour D3** tant qu'on n'a pas mesuré des graphes > 500 nœuds en production.
- **Pas de paralléliser les requêtes dans la transaction d'import** : MySQL + Prisma `$transaction` ne paralléllise pas réellement, risque de blocage.
- **Pas de cache distribué (Redis)** : architecture mutualisée Infomaniak sans Redis (cf. CLAUDE.md), le cache fichier suffit largement à l'usage actuel.

---

## Métriques recommandées

Budget de performance à instrumenter :

| Métrique | Cible | Mesure |
| --- | --- | --- |
| Bundle JS initial (gzip) | < 80 kB | `npm run build` + `gzip -c | wc -c` |
| Bundle Graphe lazy (gzip) | < 30 kB | idem |
| LCP `/` | < 1.5 s | Lighthouse mobile 4G |
| TTFB `/api/enrichissement/connecteurs` | < 100 ms | `time curl -H "Authorization: ..."` |
| `POST /api/enrichissement/rechercher` | < 5 s (P95) | Logs Fastify |
| `GET /api/graphe/ego/:id?profondeur=2` | < 500 ms (P95, < 1000 liens) | idem |
| Re-render Graphe sur filtre | < 50 ms | Chrome DevTools Performance |

À ajouter dans `backend/src/server.js` :

```js
fastify.addHook('onResponse', async (request, reply) => {
  if (reply.elapsedTime > 1000) {
    fastify.log.warn({ route: request.url, ms: reply.elapsedTime }, 'requête lente');
  }
});
```

---

## Notes hors périmètre perf

- **Bug bloquant fonctionnel** (à corriger en priorité avant perf) : contrat API graphe casse, `source`/`target` vs `sourceId`/`cibleId`. Cf. `routes/graphe.js:336-337` vs `pages/Graphe.jsx:126-127` et `components/graphe/GrapheD3.jsx:93-94`. Un audit perf sur composant qui ne s'affiche pas n'a aucun sens — fixer d'abord.
- **Sécurité préservée partout** : pas de recommandation qui touche aux transactions, à l'audit, au JWT, à la zod-validation.
- **Accessibilité préservée partout** : aucune recommandation ne supprime un `aria-live`, ne désactive `prefers-reduced-motion`, ne change la sémantique des composants.
