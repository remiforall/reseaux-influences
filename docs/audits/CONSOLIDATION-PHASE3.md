# Consolidation Phase 3 — Pipeline review 6 agents

**Date** : 2026-05-11
**Pipeline** : /pipeline module enrichissement OSINT
**Priorité d'arbitrage** : Sécurité > Accessibilité > UX > SEO/GEO > Performance

Audits livrés (avec doublons cross-check) :
- `docs/audits/security-2026-05-11.md` (synthétisé ci-dessous — agent a refusé l'écriture)
- `docs/audits/ACCESSIBILITY-AUDIT.md` + `docs/audits/accessibility-2026-05-11.md`
- `docs/audits/PERFORMANCE-AUDIT.md` + `docs/audits/performance-2026-05-11.md`
- `docs/audits/UX-AUDIT.md` + `docs/audits/ux-2026-05-11.md`
- `docs/audits/SEO-AUDIT.md` (+ rapport étendu dans transcript)
- `CONTENT-STRATEGY.md`

---

## 1. Bug fonctionnel bloquant détecté (hors classification d'audit)

**P-C3 — Contrat API graphe cassé** :
- Backend `routes/graphe.js:336-337` renvoie `{source, target}`
- Frontend `pages/Graphe.jsx:126-127` et `components/graphe/GrapheD3.jsx:93-94` lisent `{sourceId, cibleId}`
- **Conséquence : aucune arête ne s'affiche dans le graphe**
- Régression introduite en L3 (alignement partiel `noeuds/aretes` → `nodes/links` sans aligner les FK)
- **Doit être fixé AVANT tout autre travail UX/perf sur le graphe**

---

## 2. Sécurité — priorité absolue

### Critiques (bloquants déploiement)

| ID | Issue | Fichier | Fix |
|---|---|---|---|
| **C-01** | `AuditEnrichissement.utilisateurId onDelete: Cascade` viole ADR-006 | `prisma/schema.prisma:486` | Passer en `SetNull` + `utilisateurId String?` (nullable) + migration |
| **C-02** | Audit RGPD hors transaction via `setImmediate` → perte silencieuse possible | `services/import-enrichissement.js:366-389` | Inclure audit DANS `prisma.$transaction` (tx.auditEnrichissement.create) |
| **C-03** | Injection SPARQL Wikidata mal échappée (backslash, newlines, `lang` non validé) | `connecteurs/sources/wikidata.js:66-83` | Whitelist `^[a-z]{2}$` sur `lang`, échappement complet `\\`, `\n`, `\r`, `\t`, contrôles |

### Majeurs (à corriger en Phase 4)

| ID | Issue | Fichier | Fix |
|---|---|---|---|
| **M-01** | `JWT_SECRET` non vérifié au démarrage (valeur par défaut acceptée silencieusement) | `server.js` | Check fatal au boot si absent ou == valeur par défaut |
| **M-02** | Route `/api/graphe/ego/:entiteId` publique avec `EN_ATTENTE` par défaut → exposition brouillons non modérés diffamatoires | `routes/graphe.js:230,235` | `optionalAuth` + statut défaut `'VALIDE'` si non authentifié |
| **M-03** | SSRF résiduelle via redirections HTTP (Wikidata, RDAP, DVF) | `connecteurs/base.js:101-109` | `redirect: 'manual'` + whitelist hôtes + refus IPs RFC1918 |
| **M-05** | Swagger UI exposé en prod → cartographie complète de l'API par tout attaquant | `server.js:67-69` | Gate sur `NODE_ENV !== 'production'` |
| **M-06** | `request.ip` non-fiable derrière Phusion Passenger → audit forensique cassé (`127.0.0.0` partout) | `server.js` Fastify init | `trustProxy: true` en prod |
| **M-07** | `resoudreCible` matching `nom: { contains }` → false-positives, pollution silencieuse de données | `services/import-enrichissement.js:38-60` | Matcher `wikidataId` exact, sinon créer en EN_ATTENTE plutôt que d'associer à mauvaise personne |

### Mineurs (post-MVP)

- m-01 : `REGEX_TELEPHONE` strictement FR
- m-02 : `expurgerQuery` ne traite que `requete.query`, pas le reste récursivement
- m-03 : IPv6 tronqué seulement sur dernier groupe (perd peu de bits — CNIL recommande 80 bits)
- m-04 : Pas de `.max()` sur `liensRetenus` ni `champsRetenus` → DoS mémoire possible
- m-05 : `candidatsParChamp` accepte 10 000 candidats par champ
- m-06 : `Source.url` accepte `javascript:alert(1)` → ajouter `.refine(u => u.startsWith('http'))`
- m-07 : `console.warn` peut leaker chemins système
- m-09 : Cache mémoire sans bornage LRU → OOM possible

### Conformité RGPD — statut

| Article | Statut | Note |
|---|---|---|
| 5.1.a (transparence) | ✅ | Note RGPD avant formulaire |
| 5.1.c (minimisation) | ⚠️ | OK sauf Wikidata P26 conjoint sur entités cibles non publiques |
| 5.1.e (durée conservation) | ❌ | Aucune définie |
| 6 (base légale) | ✅ | Art. 85 + LIL 80 cités |
| 13/14 (information) | ⚠️ | `/mentions-legales` absente |
| 17 (effacement) | ❌ | Bloqué par C-01 |
| 22 (décision auto) | ✅ | Consensus communautaire |
| 25 (privacy by design) | ⚠️ | Cassé par M-07 |
| 35 (AIPD) | ❌ | Obligatoire, non rédigée |
| 85 (journalisme/recherche) | ✅ partiel | Garde-fou ADR-006 OK mais court-circuitable par M-02 |

---

## 3. Accessibilité — score AAA réel : 60-65 %

### Bloquants (échec niveau A/AA)

| ID | Issue | Fichier | Fix |
|---|---|---|---|
| **B-01 / AAA6 / UX C1** | `FormulaireImport role="dialog" aria-modal="true"` SANS focus trap, focus initial, ni Échap | `FormulaireImport.jsx:74-79` | Vrai focus trap + focus initial + Escape + restauration focus trigger |
| **B1** | Focus ring `amber-500 #f59e0b` annoncé 3.06:1 mais réel **2.15:1** → échec WCAG AA 1.4.11 | `index.css:28-33` | Passer en `amber-700 #b45309` (4.69:1) ou `primary` |
| **B-02** | Bouton "Recentrer" couplé via `document.getElementById` (anti-pattern React + race condition) | `GrapheD3.jsx:279-284` | Refactor via ref/callback prop `onRecentrer` |
| **B-03** | Triple focus sur `<tr>` du tableau graphe (`tabIndex={0}` + 2 `<button>` internes) | `TableauGraphe.jsx` | Choisir une seule cible de focus par ligne |
| **B-04** | Commentaire promet navigation flèches sur graphe SVG, code n'implémente pas | `GrapheD3.jsx:12` | Soit implémenter, soit corriger le commentaire et documenter alternative tableau |
| **T1** | Skip links absents (`Aller au contenu`) | `App.jsx`, `Navbar.jsx` | Ajouter `<a href="#contenu-principal">` + `id` sur main |

### Non-conformités AAA

- **B2** : `text-secondary #2b6cb0` sur blanc : 5.27:1 (échec AAA, OK AA)
- **B3** : `text-red-700 #b91c1c` sur blanc : 5.94:1 (échec AAA, OK AA)
- **A1** : `text-gray-500` (4.83:1) sur blanc — limite AA
- **AAA5** : `prefers-contrast: more` jamais déclaré
- **AAA4** : `aria-live` redondant avec `aria-describedby` sur GrapheD3 → triple annonce SR

### Transversales

- **T2** : Pas de toolbar accessibilité (police OpenDyslexic/Luciole/Atkinson) — règle Rémi globale
- **T4** : Déclaration accessibilité absente (template DINUM disponible)

---

## 4. UX — frictions critiques

| ID | Issue | Impact |
|---|---|---|
| **C1** | `FormulaireImport` fausse modale (cf. A11y B-01) | Convergence avec A11y |
| **C2** | Filtres `dateDebut`/`dateFin` codés mais jamais appliqués | Bug silencieux qui détruit la confiance |
| **C3** | Aucune continuité après import (toast vert, mais previews vidées, pas "Explorer") | Perte de momentum sessions 30-60 min |
| **C4** | Onboarding nul — disclaimer RGPD anxiogène + formulaire vide | Premier usage frustrant |
| **C5** | `qualiteInfluencePublique` obligatoire mais 10 valeurs sans définition | Saisie médiocre par défaut, atterrissage sur "AUTRE" |

### Frictions importantes

- 12 clics minimum pour un import (jusqu'à 22 pour un import complet) — pré-sélection des candidats uniques absente
- Carte preview fermée par défaut (étape supplémentaire "Voir les détails")
- 3 répétitions du jargon RGPD (bandeau + label + checkbox "Je confirme")
- Bug filtre `typesLien`: état vide ≠ tout coché → décocher un élément ne fait rien
- Seuil gamification 5/5 = catch-22 pour mono-user Rémi (besoin de valider 5 liens AVANT pouvoir enrichir, mais base vide)
- Icônes incohérentes (emoji 🔍 ⏳ vs caractères Unicode ◉ ⊕)
- Lien "Voir la fiche" → `/entites/${id}` route inexistante (cf. SEO)

---

## 5. SEO/GEO — verdict critique

### Bloquant stratégie "source de référence"

- **SPA 100 % CSR sans SSR/SSG** → invisible à Bing, GPTBot, ClaudeBot, PerplexityBot, CCBot (qui n'exécutent pas JS)
- **Routes publiques manquantes** : `/personnes/:id`, `/organisations/:id`, `/sites/:domaine`
- **`Enrichissement.jsx:226`** → `/entites/${id}` route inexistante (lien mort)
- **Soft 404** : `server.js:setNotFoundHandler` fallback SPA retourne 200 sur toute URL inconnue → pénalisé par Google
- **JSON-LD** : endpoint backend existe (`/api/export/jsonld`) mais jamais intégré dans le HTML public

### Quick wins (1 h cumulé)

- `frontend/public/robots.txt` (avec IA crawlers)
- `frontend/public/llms.txt`
- `frontend/public/humans.txt`
- OG/Twitter Cards dans `index.html`
- Correction hiérarchie titres `Accueil.jsx` (saut H1 → H3 sur les 3 cartes)

### Chantiers structurants (2-3 j)

- Choix de rendu public (SSR Fastify recommandé pour préserver le stack)
- Sitemap.xml dynamique
- JSON-LD intégré côté SSR
- Schemas `Person`, `Organization`, `WebSite`, `ClaimReview` (pour les liens sourcés)
- ADR-007 à créer : licence du **corpus de données** (CC-BY ou ODbL — MIT inadaptée)

---

## 6. Performance

### Critiques

| ID | Issue | Fichier | Fix |
|---|---|---|---|
| **P-C1** | Aucun index sur les 6 FK polymorphes de `Lien` + sur `wikidataId`/`siren`/`domaine` (MySQL Prisma ne les crée pas auto) | `prisma/schema.prisma` | Migration avec `@@index` composites |
| **P-C2** | BFS ego-network N+1 — 1 requête par voisin | `routes/graphe.js:268-294` | Batch `WHERE id IN (...)` par niveau |
| **P-C3** | (déjà listé §1) Bug contrat API graphe |  |  |
| **P-C4** | Cache fichier disque sans verrou ni dédup → corruption JSON + ban User-Agent Wikidata possible | `connecteurs/cache.js` | Locks par clé OU dédup des requêtes en vol via Map |
| **P-C5** | `setImmediate(audit)` INSIDE `$transaction` → lock DB maintenu | `services/import-enrichissement.js` | Couvert par fix sécurité C-02 |

### Importants

- D3 `import * as d3` (`GrapheD3.jsx:23`) — tree-shake économise ~40 kB gzip
- Pas de code splitting (`App.jsx` importe tout) — `React.lazy` sur Graphe + Enrichissement
- Recréation totale du DOM SVG à chaque update D3 (pas de `selection.join()` différentielle)
- Cache mémoire sans LRU → OOM possible sur disque inaccessible
- SPARQL Wikidata `CONTAINS(LCASE())` peut timeout sur termes communs ("Macron" → 30 s)
- Bundle actuel : 105 kB JS gzip + 4 kB CSS gzip → cible -67 % via optimisations

---

## 7. Content — pages manquantes critiques

| Page | Priorité | Justification |
|---|---|---|
| `/mentions-legales` | **URGENTE juridique** | ADR-006 l'exige (base légale art. 85 + LIL 80 explicite) |
| `/sources-et-methodes` | Haute | Fondement de l'autorité éditoriale, transparence sur sources et lacunes |
| `/comment-ca-marche` | Haute | Modèle wiki, seuil 5/5, consensus, badges |
| `/declaration-accessibilite` | Moyenne | Template DINUM, formulation honnête "conformité partielle" |
| Pages d'entités publiques | Haute | `Enrichissement.jsx:226` renvoie vers `/entites/:id` inexistant |
| `/cgu` | Post-MVP | Interdire explicitement enrichissement sur citoyens privés |

### Renommages vocabulaire critique

- **"Enrichissement OSINT"** → **"Importer une fiche"** (`Enrichissement.jsx:146`, `Navbar.jsx:73,77`)
- Glossaire `lien` canonique (bannir relation/connexion/arête en UI)
- Suppression "OSINT" de toute façade publique

---

## 8. Plan de fix Phase 4 — séquence

### LOT FIX 1 — Bloquants déploiement (Sécurité + bug fonctionnel)

1. **P-C3** : Aligner contrat API graphe `{source, target}` ↔ `{sourceId, cibleId}` — **D'ABORD**
2. **C-01** : Migration Prisma `AuditEnrichissement.utilisateurId` → `SetNull` + nullable
3. **C-02** : Inclure `enregistrerAudit` dans `prisma.$transaction` (suppression `setImmediate`)
4. **C-03** : Échappement SPARQL complet + validation `lang` regex `^[a-z]{2}$`
5. **M-01** : Check `JWT_SECRET` au démarrage `server.js`
6. **M-02** : `optionalAuth` sur `/api/graphe/ego/:entiteId` + filtre `statut=VALIDE` par défaut si non authentifié
7. **M-06** : `trustProxy: true` en prod Fastify
8. **M-05** : Gate Swagger UI sur `NODE_ENV !== 'production'`

### LOT FIX 2 — A11y AA critiques

1. **B-01 / UX C1** : Vrai focus trap dans `FormulaireImport` + Escape + focus restauration
2. **B1** : Focus ring CSS → `amber-700` ou `primary` (1 ligne `index.css`)
3. **T1** : Skip links dans `App.jsx`
4. **B-02** : Refactor bouton "Recentrer" via ref/callback
5. **B-03** : Fix triple focus tableau graphe (1 seule cible par ligne)
6. **B2/B3** : Contrastes `text-secondary`/`text-red-700` → 7:1

### LOT FIX 3 — UX critiques

1. **C2** : Câbler OU retirer filtres `dateDebut`/`dateFin`
2. Pré-sélection candidats uniques (`PreviewEntite` : auto-select si `candidats.length === 1`)
3. SelecteurQualiteInfluence : exemples sous chaque option
4. Auto-bascule tableau si `noeuds.length < 3`
5. Bouton "Rechercher autre chose" dans toast succès
6. Fix bug filtre `typesLien` (état vide ≠ tout coché)

### LOT FIX 4 — SEO quick wins (1 h)

1. `frontend/public/robots.txt`
2. `frontend/public/llms.txt`
3. OG/Twitter Cards dans `index.html`
4. Fix `Enrichissement.jsx:226` → route correcte ou désactiver le lien

### LOT FIX 5 — Performance

1. **P-C1** : Migration Prisma indexes (FK + identifiants)
2. **P-C4** : Verrou par clé sur cache disque
3. **P-C2** : Batch BFS ego-network — différable
4. Tree-shake D3 + `React.lazy` — différable

### LOT FIX 6 — Content / pages manquantes (chantier dédié)

Différable hors pipeline actuel — sera traité dans une session dédiée :
1. `/mentions-legales` (URGENT juridique)
2. `/declaration-accessibilite`
3. `/sources-et-methodes`
4. Renommage "Enrichissement OSINT" → "Importer une fiche"
5. Réécriture Accueil

---

## 9. Conflits arbitrés

| Conflit | Résolution |
|---|---|
| **SEO** veut SSR pour indexabilité ↔ **Perf** prévient TTFB +50-150 ms | SSR différable post-MVP (runway PostHack). Quick wins SEO suffisent court terme. |
| **SEO** propose `Disallow: /enrichissement` ↔ **Security** rappelle que le vrai gate est JWT | Cumul : `Disallow` pour signal moteurs + JWT pour vraie sécu. |
| **A11y** veut focus ring contrasté ↔ **UX** veut esthétique amber | A11y prime (priorité 2 vs 3). Amber-700 reste cohérent ton mais conforme AA. |
| **Perf** veut code-splitting ↔ **A11y** exige `<Suspense fallback>` accessible | Coordonner : fallback Suspense avec `role="status" aria-live="polite"`. |

---

## 10. ADR à créer

- **ADR-007** — Licence du corpus de données (CC-BY-SA 4.0 recommandée vs MIT inadaptée) — décision Rémi
- **ADR-008** — Conservation des `AuditEnrichissement` même après suppression utilisateur (art. 6.1.c base légale obligation légale) — formalise C-01 fix
- **ADR-009** — Stratégie de rendu public (SSR Fastify recommandé) — décision Rémi avant Phase 5

---

## 11. Statut consolidé

```
🔒 Sécurité     : 3 critiques + 6 majeurs + 9 mineurs
♿ Accessibilité : 6 bloquants AA/AAA + 4 AAA spécifiques + 4 transversaux
🎨 UX           : 5 critiques + 11 importants
🔍 SEO/GEO      : 1 bloquant stratégique + 7 quick wins
⚡ Performance   : 5 critiques (dont 1 bug fonctionnel) + 8 importants
📝 Contenu      : 6 pages manquantes + glossaire à uniformiser

Bug fonctionnel transverse : graphe inopérant (contrat API cassé)
Convergences détectées : 4 (FormulaireImport modal, audit RGPD, bouton recentrer, route /entites mort)
```
