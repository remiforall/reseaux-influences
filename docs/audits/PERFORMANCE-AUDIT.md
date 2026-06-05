# Audit Performance — Module d'enrichissement OSINT

**Auditeur** : Performance Sentinel
**Date** : 2026-05-11
**Contexte** : Infomaniak mutualisé via Phusion Passenger, MySQL/MariaDB, **pas de Redis, pas de queue**. Cache fichier disque uniquement. Périmètre lu : 12 fichiers backend (connecteurs + services + routes), 14 fichiers frontend (pages, composants enrichissement + graphe), bundle Vite `dist/assets`.

> Rappel de hiérarchie de priorité : **Sécurité > Accessibilité > UX > SEO > Performance**. Toutes les recommandations ci-dessous respectent cet ordre. Les conflits potentiels sont explicitement marqués `CONFLIT POTENTIEL`.

---

## Synthèse exécutive

Le module OSINT est globalement bien conçu côté connecteurs (rate-limit token-bucket sans `setInterval`, cache disque avec dégradation gracieuse mémoire, `Promise.allSettled` correct, AbortController systématique). **Trois bottlenecks critiques** menacent toutefois la robustesse en prod :

1. **Aucun index composite sur le modèle `Lien`** alors que la route ego-network exécute jusqu'à **N+1 requêtes en BFS séquentielles** avec un `OR` sur 6 FK + filtre `statut` — sur MySQL ce pattern ne peut pas utiliser les index FK individuels et risque le full-scan dès quelques milliers de liens.
2. **Cache disque sans verrou** : deux requêtes concurrentes sur la même clé peuvent écrire en parallèle (corruption JSON possible) et provoquer une rafale d'appels API externes au lieu d'un.
3. **D3 importé intégralement** (`import * as d3 from 'd3'`) sur la route `/graphe` → ~80 KB gzip ajoutés au bundle initial alors que D3 n'est utile que sur cette route. Tree-shaking et lazy-loading inopérants.

Le bundle global (105 KB JS gzip + 4 KB CSS gzip) reste raisonnable, mais **un bug de désynchronisation frontend** (`a.sourceId` vs `a.source` côté API) rend la page Graphe inopérante avant même de parler de perf : à corriger en urgence avant d'optimiser.

---

## Problèmes identifiés

### CRITIQUE (bloquant prod)

| ID   | Problème                                                                                                                                                                                                                                                              | Fichier:ligne                                                                                                                                                     | Impact                                                                                                                                                                                                                                                                                  | Fix proposée                                                                                                                                                                                                                                                                                                                                 |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P-C1 | **Aucun `@@index` sur `Lien` pour les FK polymorphes + statut.** Les requêtes ego-network BFS font `OR` sur 6 FK avec filtre statut. MySQL ne peut pas combiner les index implicites de FK avec un filtre statut → `filesort` + scan partiel à chaque saut.           | `backend/prisma/schema.prisma:228-280` (modèle `Lien`, aucun `@@index`) ; requête : `backend/src/routes/graphe.js:282-294`                                        | À 10 k liens : ~50–200 ms par requête × N entités × profondeur 2 = **>2 s par appel ego sur sujet bien connecté**. À 100 k liens : timeout Passenger probable (30 s défaut).                                                                                                            | Ajouter dans `schema.prisma` : `@@index([statut, personneAId])`, `@@index([statut, personneBId])`, `@@index([statut, organisationAId])`, `@@index([statut, organisationBId])`, `@@index([statut, siteWebAId])`, `@@index([statut, siteWebBId])`, `@@index([typeLienId, statut])`. Migration : `npm run db:migrate`.                          |
| P-C2 | **Ego-network BFS séquentiel : 1 requête Prisma par entité de la file.** Pas de batch. Un sujet avec 50 voisins directs → 51 requêtes pour profondeur 2 (centre + 50 voisins), chacune avec `include` complet 9-niveaux.                                              | `backend/src/routes/graphe.js:268-294` (boucle `while (file.length > 0)` avec `findMany` à chaque itération)                                                      | Explosion combinatoire sur entité hub (ex : Macron à 500 liens directs) : >500 round-trips MySQL. Sur Infomaniak mutualisé (latence DB ~2-5 ms par requête + connexion via pool Prisma), peut atteindre 3-5 s pour profondeur 2.                                                        | **Option A (simple)** : Plafonner `nbVoisinsParNiveau` à 100, déjà partiellement borné par la profondeur 1-3. **Option B (correct)** : Remplacer le BFS par UNE seule requête `findMany` avec `OR: [ … 6 conditions sur tous les ids visités à ce niveau …]`, en accumulant le batch d'ids à chaque niveau. Réduit N+1 à 2-3 requêtes total. |
| P-C3 | **Bug fonctionnel + impact perf : désynchronisation `sourceId`/`cibleId` (frontend) vs `source`/`target` (backend).** Le filtrage local frontend `idNoeudsFiltrés.has(a.sourceId)` cherche un champ qui n'existe pas → toutes les arêtes filtrées sortent vides.      | `backend/src/routes/graphe.js:111-112,190-191,336-337` (renvoie `source`/`target`) vs `frontend/src/pages/Graphe.jsx:124-129` (consomme `a.sourceId`/`a.cibleId`) | Page Graphe affiche en permanence "0 lien" même quand les données sont là. Côté perf : déclenche re-renders inutiles, et masque la pression réelle de D3 sur des graphes pleins.                                                                                                        | Choisir un seul nommage. Recommandation : aligner le frontend sur `source`/`target` (convention D3 native, déjà attendu par `forceLink`). Modifier `Graphe.jsx:124-129` et `TableauGraphe.jsx:62-72` pour utiliser `a.source` / `a.target`.                                                                                                  |
| P-C4 | **Cache disque sans verrou de fichier.** Deux requêtes simultanées sur la même clé (ex : 5 clients qui cherchent "Macron" en parallèle) → 5 `fs.writeFile` concurrents, possibles écritures partielles JSON, et 5 appels API externes au lieu d'1.                    | `backend/src/connecteurs/cache.js:131-134` (`ecrireCacheDisque` sans lock, ni promise dedup) ; lecture amont `base.js:88` (cache check) sans dédup en vol         | Multiplication des appels Wikidata/RDAP par le nombre d'utilisateurs concurrents. Risque ban User-Agent (Wikidata bannit les UA génériques **et** les rafales). Corruption JSON occasionnelle → cache miss permanent sur l'entrée.                                                      | Ajouter un Map d'in-flight requests dans `BaseConnecteur._appelHttp` : `if (this._inFlight.has(cle)) return this._inFlight.get(cle); this._inFlight.set(cle, promesseAppel); ... finally inFlight.delete(cle)`. Pour l'écriture atomique : `fs.writeFile(tmpPath, ...).then(() => fs.rename(tmpPath, finalPath))`.                           |
| P-C5 | **Transaction Prisma `importer()` contient un `setImmediate` qui s'exécute APRÈS le return de la transaction**, mais à l'intérieur du callback `$transaction`. La closure capture des références au tx fermé, et l'audit RGPD échoue silencieusement sur log console. | `backend/src/services/import-enrichissement.js:366-389`                                                                                                           | L'audit RGPD prévu n'est pas exécuté dans la transaction, ce qui est OK (non-bloquant volontaire). Mais le `setImmediate` est mal placé : il devrait être **après** `await prisma.$transaction(...)`, pas dedans. Risque que la transaction garde le lock en attente du callback async. | Sortir le `setImmediate(...)` du callback de `$transaction` et le placer juste après. Voir détail au §Recommandations.                                                                                                                                                                                                                       |

### IMPORTANT (à corriger dans cette PR)

| ID   | Problème                                                                                                                                                                                                                                                                                 | Fichier:ligne                                                                                                        | Impact                                                                                                                                                                                                                                                                                                      | Fix proposée                                                                                                                                                                                                                                                                                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P-I1 | **D3 importé en bloc** : `import * as d3 from 'd3'` → bundle inclut force, drag, zoom, selection, transition, scale, axis, geo, etc. alors que seuls 4 modules sont utilisés (`forceSimulation`, `forceLink`, `forceManyBody`, `forceCenter`, `forceCollide`, `zoom`, `drag`, `select`). | `frontend/src/components/graphe/GrapheD3.jsx:23`                                                                     | Bundle JS gzip 105 KB dont **estimé 60-75 KB pour d3** entier. Sur 4G mobile (~1.6 Mbit/s effectif), surcoût ~400 ms avant LCP de la page Graphe.                                                                                                                                                           | Imports ciblés par sous-package : `import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'`, `import { select } from 'd3-selection'`, `import { zoom, zoomIdentity } from 'd3-zoom'`, `import { drag } from 'd3-drag'`. Tree-shaking Vite fera le reste. Gain attendu : **−40 à −55 KB gzip**.                                                   |
| P-I2 | **Pas de code splitting par route.** Toutes les pages (Accueil, Liens, Graphe, Profil, Enrichissement) sont dans le bundle initial. Un utilisateur qui consulte l'Accueil télécharge D3 + tout le code Enrichissement.                                                                   | `frontend/src/App.jsx:1-8` (imports statiques)                                                                       | Bundle initial = bundle total. LCP Accueil ralentie par du code jamais utilisé.                                                                                                                                                                                                                             | Lazy-load des routes : `const Graphe = lazy(() => import('./pages/Graphe'))`, idem Enrichissement (gros consommateur de composants). Envelopper `<Routes>` dans `<Suspense fallback={...}>`. Gain : LCP Accueil divisée par 2-3 sur mobile. CONFLIT POTENTIEL Accessibility Champion : prévoir un fallback `<Suspense>` accessible (texte annoncé via `aria-live`, pas un spinner muet). |
| P-I3 | **Recréation complète du DOM SVG à chaque update du graphe** : `svg.selectAll('*').remove()` puis recréation de tous les nœuds, arêtes, marqueurs, simulation. À chaque changement de filtre ou de nœud sélectionné, on re-paye le coût complet.                                         | `frontend/src/components/graphe/GrapheD3.jsx:56-57` (et tout le `useEffect` redéclenché à chaque changement de prop) | Sur un graphe de 100 nœuds : ~30-80 ms par recréation. Sur 500 nœuds : >300 ms, INP dégradée nettement au-dessus du seuil 200 ms. Force-simulation redémarrée → animation visible inutile, qui consomme CPU 2-5 s sur mobile entrée de gamme.                                                               | Utiliser le pattern D3 d'`enter`/`update`/`exit` (`.data(noeudsD3, d => d.id).join(enter => ..., update => ..., exit => exit.remove())`). Conserver la simulation entre re-renders : ne créer la `forceSimulation` qu'une fois, réutiliser via `simulation.nodes(...)` et `simulation.force('link').links(...)`. Séparer `useEffect` initialisation vs `useEffect` mise à jour.          |
| P-I4 | **N+1 dans `import-enrichissement.js` pour upsert des sources** : boucle `for (const sourceJson of sourcesUtilisees)` avec `findFirst` puis éventuellement `create`, séquentiel.                                                                                                         | `backend/src/services/import-enrichissement.js:275-302`                                                              | Pour un import avec 5-10 sources distinctes : 5-20 requêtes DB séquentielles à l'intérieur de la transaction → lock prolongé.                                                                                                                                                                               | Pré-grouper les URLs et faire un seul `findMany({ where: { url: { in: [...urls] } } })` puis batch `createMany({ skipDuplicates: true })`. Réduit à 2 requêtes total.                                                                                                                                                                                                                    |
| P-I5 | **N+1 sur `obtenirTypeLienId`** : appelé dans la boucle `for (const indexLien of liensRetenus)`, donc autant de requêtes que de liens importés.                                                                                                                                          | `backend/src/services/import-enrichissement.js:305-329`                                                              | Import de 10 liens = 10 lookups TypeLien séquentiels dans la transaction.                                                                                                                                                                                                                                   | Récupérer en amont tous les `typeLienCode` distincts via un seul `findMany({ where: { code: { in: codesDistincts } } })` et créer en batch les manquants.                                                                                                                                                                                                                                |
| P-I6 | **Cache mémoire `cacheMemoire` sans purge ni limite de taille.** En cas de bascule disque → mémoire (quota Infomaniak), la map grossit indéfiniment.                                                                                                                                     | `backend/src/connecteurs/cache.js:25` (Map sans bornes)                                                              | Fuite mémoire lente sur prod si dégradation disque persistante. Sur Phusion Passenger, le worker est recyclé périodiquement, mais en pic d'usage on peut OOM avant le recyclage.                                                                                                                            | Limiter à N entrées (ex : 500) avec éviction LRU simple : `if (cacheMemoire.size > MAX) { const premierCle = cacheMemoire.keys().next().value; cacheMemoire.delete(premierCle); }` avant insertion.                                                                                                                                                                                      |
| P-I7 | **Wikidata SPARQL avec `CONTAINS(LCASE(?label))` = scan complet de l'index labels.** Pas d'utilisation de `wikibase:label` service ni de full-text.                                                                                                                                      | `backend/src/connecteurs/sources/wikidata.js:73-82`                                                                  | SPARQL Wikidata timeout 60 s côté serveur. Une recherche sur un terme commun ("Martin") peut taper le timeout côté Wikidata → tout le connecteur en `'timeout'` pour ces requêtes. Côté client `timeoutMs: 30_000` = 30 s d'attente avant abandon. Bloque l'UI 30 s même si autres connecteurs ont répondu. | Remplacer la recherche SPARQL par l'**API Wikidata `wbsearchentities`** (REST, ~100-300 ms typique) : `GET https://www.wikidata.org/w/api.php?action=wbsearchentities&search=...&language=fr&type=item&format=json`. Limiter aux Q5 (Personne) / Q43229 (Organisation) en post-filtrant via `detailler()`. Gain : 10-50× plus rapide, plus de timeout sur termes communs.                |
| P-I8 | **Bundle CSS Tailwind non-purgé pour les chemins dynamiques.** Tailwind purge sur classes statiques uniquement ; toutes les classes utilisées (bg-blue-100, text-amber-800, etc.) sont bien statiques ici → OK. Mais 19 KB raw / 4 KB gzip suggère un bundle déjà bien purgé.            | `frontend/tailwind.config.js:3-5`                                                                                    | RAS — point fort, juste à conserver.                                                                                                                                                                                                                                                                        | —                                                                                                                                                                                                                                                                                                                                                                                        |

### POST-MVP (optimisations)

| ID   | Problème                                                                                                                                                                                                                                                                         | Fichier:ligne                                                                                 | Impact                                                                                                                    | Fix proposée                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P-P1 | **Pas de virtualisation sur le tableau alternatif.** Au-delà de ~200 lignes, le DOM gonfle.                                                                                                                                                                                      | `frontend/src/components/graphe/TableauGraphe.jsx:161-216`                                    | Sur ego-network profondeur 3 d'une entité hub : jusqu'à 1000+ arêtes. DOM lourd, scroll heurté sur mobile.                | Au-dessus de 100 lignes, intégrer une virtualisation maison (pas de lib externe pour rester souverain). Garder le tableau natif sémantique mais ne rendre que les lignes visibles + window de buffer. Veiller à conserver `<table>`/`<tbody>` complets pour les lecteurs d'écran (CONFLIT POTENTIEL Accessibility Champion : prévoir un mode "tout afficher" pour technologies d'assistance + `aria-rowcount`/`aria-rowindex`). |
| P-P2 | **Pas de cache HTTP sur les routes GET `/graphe/*`.** Les graphes sont publics et changent rarement.                                                                                                                                                                             | `backend/src/routes/graphe.js` (aucun `reply.header('Cache-Control', ...)`)                   | Chaque navigation entre pages re-tape l'API → re-calcul backend + transfert réseau inutile.                               | Ajouter `reply.header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')` sur les GET graphe (5 min de fraîcheur acceptable). Bonus : ETag automatique via Fastify (`@fastify/etag`). Headers déjà étudiés par Eco-Design Guardian — coordonner.                                                                                                                                                                |
| P-P3 | **Re-renders React inutiles dans `Enrichissement.jsx` et `Graphe.jsx`.** Pas de `React.memo` sur les composants enfants (`PreviewEntite`, `GrapheD3`, `TableauGraphe`), pas de stabilité de référence sur les callbacks passés (`onChoixChange`, etc., sont déjà `useCallback`). | `Enrichissement.jsx:243-266`, `Graphe.jsx:250-269`                                            | Marginal sur N petit. Au-delà de 30 résultats OSINT, recréation inutile des sous-arbres React.                            | `React.memo` sur `PreviewEntite` avec comparaison `(prev, next) => prev.preview === next.preview && prev.choix === next.choix`. Idem `TableauGraphe`. Gain : -20 à -40 % de temps de render sur changement de filtre.                                                                                                                                                                                                           |
| P-P4 | **Étiquettes d'arêtes générées même si invisibles à l'échelle de zoom.** Le SVG dessine `labelsAretes` pour chaque arête, même au zoom dézoomé où elles se chevauchent.                                                                                                          | `frontend/src/components/graphe/GrapheD3.jsx:131-141`                                         | Sur 200+ arêtes, 200 `<text>` SVG inutiles.                                                                               | Filtrer par zoom : exposer le scale courant, ne rendre les étiquettes que si `scale > 1.2`. Économie DOM nette.                                                                                                                                                                                                                                                                                                                 |
| P-P5 | **`labelsNoeuds` recalcule le `dy` à chaque tick alors qu'il est constant.**                                                                                                                                                                                                     | `frontend/src/components/graphe/GrapheD3.jsx:201-211`                                         | Marginal : ~1-2 ms par tick × 300 ticks de convergence.                                                                   | Pré-calculer `dy` une fois lors du data join (`.attr('dy', ...)` reste OK en attribute, ne pas recalculer dans le `tick`).                                                                                                                                                                                                                                                                                                      |
| P-P6 | **Singleton `registrySingleton` non protégé contre les chargements concurrents.** Premier appel pendant que les requêtes arrivent en parallèle au démarrage → plusieurs `chargerConnecteurs()` peuvent s'exécuter en parallèle.                                                  | `backend/src/services/enrichissement.js:35-39` et `backend/src/connecteurs/registry.js:31-71` | Au démarrage à froid sur Passenger : 5 requêtes simultanées → 5 chargements de connecteurs (peu coûteux mais redondants). | Stocker la **promesse** au lieu du résultat : `if (registryPromise) return registryPromise; registryPromise = chargerConnecteurs(); return registryPromise;`. Évite la race au cold start.                                                                                                                                                                                                                                      |
| P-P7 | **Cache TTL identique pour Wikidata, RDAP, IGN** (24 h défaut). RDAP change beaucoup plus rarement (changements de titulaire = mois) ; IGN cadastre quasi-statique.                                                                                                              | `backend/src/connecteurs/base.js:33`                                                          | Cache miss inutile à 24h+1min sur des données qui n'ont pas bougé depuis 6 mois.                                          | TTL différenciés : RDAP/IGN 7 jours, Wikidata 24 h. Configurable via env.                                                                                                                                                                                                                                                                                                                                                       |

---

## Mesures et estimations

### Bundle frontend (état actuel)

| Asset                               | Brut       | Gzip        | Détail                                                |
| ----------------------------------- | ---------- | ----------- | ----------------------------------------------------- |
| `index-aY5Y_091.js`                 | 317 KB     | ~105 KB     | Bundle principal monolithique                         |
| `index-BF8_wdND.css`                | 19 KB      | ~4 KB       | Tailwind purgé — bien                                 |
| **Total transféré au load initial** | **336 KB** | **~109 KB** | Sur 4G mobile : ~700 ms transfert, ~300 ms parse/eval |

### Bundle estimé après optimisations P-I1 + P-I2

| Étape                             | JS gzip estimé                                       | Gain                |
| --------------------------------- | ---------------------------------------------------- | ------------------- |
| Imports D3 ciblés (P-I1)          | ~65 KB                                               | −40 KB (−38 %)      |
| Code splitting par route (P-I2)   | Accueil ~35 KB, Graphe +30 KB, Enrichissement +20 KB | LCP Accueil ÷2      |
| **Bundle Accueil après les deux** | **~35 KB gzip**                                      | **−67 % vs actuel** |

### Backend — coûts requêtes ego-network estimés

Hypothèse : 10 k liens en base, MariaDB Infomaniak mutualisé (~2 ms par requête simple FK, 50 ms si filesort).

| Scénario                          | Requêtes Prisma                          | Latence actuelle | Latence après P-C1 + P-C2 |
| --------------------------------- | ---------------------------------------- | ---------------- | ------------------------- |
| Ego prof 1, entité 5 voisins      | 1 (centre) + 1 (voisins)                 | ~40 ms           | ~10 ms                    |
| Ego prof 2, entité 5 voisins      | 1 + 5 voisins = 6 séquentielles          | ~250 ms          | ~30 ms (batch)            |
| Ego prof 2, entité hub 50 voisins | 1 + 50 séquentielles                     | ~2 000 ms        | ~50 ms                    |
| Ego prof 3, entité hub 50 voisins | 1 + 50 + 1500 = exploration combinatoire | **timeout**      | ~200 ms si on plafonne    |

### Above-the-fold (page Accueil) — état actuel

| Métrique           | Estimation actuelle                           | Cible                              |
| ------------------ | --------------------------------------------- | ---------------------------------- |
| TTFB               | ~150-300 ms (Passenger cold start ~1.5 s)     | < 200 ms                           |
| FCP                | ~1.2-2.0 s (bundle JS bloquant)               | < 1.0 s                            |
| LCP                | ~1.5-2.5 s                                    | < 1.5 s                            |
| CLS                | Non mesuré (pas de hero image, faible risque) | < 0.1                              |
| Bundle JS critique | 105 KB gzip                                   | < 50 KB gzip                       |
| Render-blocking    | 1 CSS + 1 JS module                           | 0 (inliner critical CSS, defer JS) |

### Above-the-fold — gisements

1. **Aucun `<link rel="preconnect">`** vers l'API si différente du domaine — à ajouter si déploiement multi-domaine.
2. **Aucune police custom configurée** dans Tailwind/index.css → utilise stack système par défaut, ce qui est **un point fort** (pas de FOIT/FOUT, pas de download). **À conserver tel quel sauf demande accessibilité explicite** (cf. règle a11y `a11y-wcag-rgaa.md` §5 qui mentionne Luciole/Atkinson — coordonner avec Accessibility Champion avant tout ajout).
3. **Pas de Service Worker** : sur Passenger mutualisé, possible de servir un SW depuis `frontend/dist/`. Hors scope MVP.
4. **`<meta name="viewport">` OK** (pas de `user-scalable=no`).
5. **Pas de critical CSS inliné** : Tailwind 19 KB raw → tolerable mais inline-able via plugin Vite si on veut tirer le LCP à < 1 s.

---

## Recommandations

Ordonnées par ratio impact/effort, en respectant la hiérarchie de priorité.

1. **Corriger P-C3 (désync `sourceId`/`source`) AVANT toute optim perf.** Le graphe n'affichera rien tant que ce bug n'est pas réglé — inutile d'optimiser un graphe qui ne s'affiche pas. 30 min de travail.

2. **Ajouter les `@@index` sur `Lien` (P-C1)** puis générer une migration Prisma. C'est l'optim avec le plus gros impact pour le moindre effort. 15 min + temps de migration. Voir snippet ci-dessous.

3. **Batcher le BFS ego-network (P-C2)** en une seule requête par niveau. 1-2 h de travail, réduit la latence d'un facteur 10-50× sur entités hub.

4. **Imports D3 ciblés (P-I1)**. 10 min de travail, gain ~40 KB gzip immédiat. Coordonner avec Eco-Design Guardian (réduction empreinte transfert).

5. **Code splitting routes (P-I2)**. 30 min, gain LCP majeur sur Accueil. CONFLIT POTENTIEL Accessibility Champion : le `<Suspense fallback={...}>` doit être accessible (annonce `aria-live="polite"`, message textuel "Chargement de la page graphe..."), pas un spinner muet.

6. **Verrou in-flight + écriture atomique cache (P-C4)**. 30 min, évite ban Wikidata. Sécurité avant perf — coordonner avec Security Guardian.

7. **Pré-batcher upserts sources et TypeLien dans `importer()` (P-I4, P-I5)**. 1 h, réduit durée transaction de 5-10× sur imports gros.

8. **Refactor pattern D3 enter/update/exit (P-I3)**. 2-3 h, gros gain INP page Graphe. CONFLIT POTENTIEL Accessibility Champion : maintenir le `tabindex` et les `aria-label` sur les nœuds après mise à jour incrémentale (le risque est d'introduire des nœuds non-focusables si l'enter n'est pas complet).

9. **Remplacer SPARQL Wikidata par `wbsearchentities` (P-I7)**. 1-2 h, gain 10-50× sur recherche.

10. **Cache HTTP sur `/graphe` (P-P2)**, **LRU sur cache mémoire (P-I6)**, **TTL différenciés (P-P7)**. Quick wins post-MVP.

### Snippets recommandés

**P-C1 — index Prisma à ajouter dans `schema.prisma` modèle `Lien`** (avant la fermeture `@@map`) :

```prisma
@@index([statut, personneAId], map: "idx_lien_statut_personneA")
@@index([statut, personneBId], map: "idx_lien_statut_personneB")
@@index([statut, organisationAId], map: "idx_lien_statut_orgaA")
@@index([statut, organisationBId], map: "idx_lien_statut_orgaB")
@@index([statut, siteWebAId], map: "idx_lien_statut_siteA")
@@index([statut, siteWebBId], map: "idx_lien_statut_siteB")
@@index([typeLienId, statut], map: "idx_lien_typelien_statut")
```

**P-I1 — imports D3 ciblés dans `GrapheD3.jsx`** :

```javascript
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import { select } from 'd3-selection'
import { zoom, zoomIdentity } from 'd3-zoom'
import { drag } from 'd3-drag'
// puis remplacer d3.forceSimulation par forceSimulation, d3.select par select, etc.
```

Et ajouter aux dépendances `package.json` les sous-packages (déjà inclus transitifs de `d3` mais expliciter l'intention) — à confirmer via `npm ls d3-force` avant ajout.

**P-C5 — déplacement du `setImmediate` hors de la transaction** :

```javascript
// AVANT :
await prisma.$transaction(async (tx) => {
  // ... étapes 1-4 ...
  setImmediate(async () => { await enregistrerAudit(...) })
  return { entitePrincipaleId: entitePrincipale.id }
})

// APRÈS :
const resultatTx = await prisma.$transaction(async (tx) => {
  // ... étapes 1-4 ...
  return { entitePrincipaleId: entitePrincipale.id, snapshotAudit: { ... } }
})
// Audit hors transaction — non-bloquant
setImmediate(async () => {
  try { await enregistrerAudit(resultatTx.snapshotAudit) }
  catch (errAudit) { console.error('[import-enrichissement] Échec audit :', errAudit.message) }
})
```

---

## Points forts (à conserver)

1. **Rate-limit token-bucket sans `setInterval`** : implémentation propre via `process.hrtime.bigint()` et recalcul à la demande. Pas de fuite timer, isolé pour les tests Jest. À conserver tel quel.
2. **`Promise.allSettled`** dans `rechercherMultiConnecteurs` : pas de fail-fast, un connecteur planté ne tue pas la recherche. Distinction `timeout` / `erreur` via `AbortError`. Excellent pattern.
3. **AbortController + timeout systématique** dans `BaseConnecteur._appelHttp` : chaque fetch externe est protégé contre le hang infini. `clearTimeout` dans `finally`. Modèle à reproduire ailleurs dans le codebase.
4. **Cache disque avec dégradation gracieuse** vers mémoire si quota Infomaniak atteint. Garde-fou propre.
5. **Cache lu avant rate-limit** dans `_appelHttp` : un hit ne consomme pas de token. Économise les buckets pour les vraies requêtes.
6. **Tailwind purgé efficacement** (19 KB raw / 4 KB gzip pour toute l'app). Configuration minimale, pas de plugins lourds.
7. **Stack de polices système par défaut** : zéro CDN, zéro FOIT/FOUT, parfait pour LCP. À conserver sauf demande accessibilité explicite (Luciole/Atkinson via `a11y-starter-kit/fonts/` si besoin — coordonner Accessibility Champion).
8. **`useMemo` correctement utilisé** dans `TableauGraphe` pour `noeudsParId`, `lignes`, `lignesTries` — bonne hygiène.
9. **`useCallback` sur les handlers passés en prop** dans `Enrichissement.jsx` et `Graphe.jsx`. Hygiène React standard respectée.
10. **`requestAnimationFrame` pour le focus post-changement** (au lieu de `setTimeout(0)`) : bon réflexe perf et accessibilité.
