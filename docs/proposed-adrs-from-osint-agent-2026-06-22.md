# ADRs proposés — détectés par l'agent OSINT le 2026-06-22

> **Statut** : DRAFT, non décidé. À valider par Rémi avant intégration dans `ARCHITECTURE-DECISIONS.md`.
>
> **Contexte** : ces deux lacunes du référentiel ont été rencontrées par l'agent `osint-investigation` (mémoire `project_agents_backup`, instance Why) en seedant un corpus Macron + Brigitte Macron + Lecornu + Renaissance le 2026-06-22. L'agent a contourné en utilisant les codes les plus proches existants, mais la modélisation reste imparfaite.
>
> **Note de numérotation (2026-06-24)** : ébauches d'abord nommées ADR-019 / ADR-020 par l'agent, renumérotées **ADR-026 / ADR-027** car les numéros jusqu'à ADR-025 (TED) sont déjà attribués.

---

## ADR-026 (proposé) — Ajout d'une valeur `CONJOINT_PUBLIC` à l'enum `QualiteInfluence`

**Statut** : DRAFT
**Date proposée** : 2026-06-22
**Auteur ébauche** : agent osint-investigation (instance Why)

### Contexte

L'enum `QualiteInfluence` (ADR-006) couvre actuellement 10 valeurs orientées « rôle public exercé » : `ELU`, `HAUT_FONCTIONNAIRE`, `LOBBYISTE`, `DIRIGEANT`, `ARTISTE`, `PRODUCTEUR`, `EDITEUR_PRESSE`, `HEBERGEUR`, `EDITEUR_SITE`, `AUTRE`.

Le cas du **conjoint·e d'une figure publique** (typiquement Brigitte Macron, mais aussi conjoint·es de dirigeants exposés) n'a pas de catégorie propre. L'agent a casé Brigitte Macron en `AUTRE` par défaut, ce qui :

- noie l'information dans une catégorie fourre-tout
- empêche les filtres UI / API de distinguer ces cas particuliers (à mi-chemin entre figure publique et personne privée par alliance)
- ne reflète pas la base légale art. 85 RGPD spécifique : le conjoint d'une personnalité publique a une **présomption d'intérêt général atténuée**, qui mérite traçabilité explicite plutôt qu'agrégation sous `AUTRE`

### Décision proposée

Ajouter `CONJOINT_PUBLIC` à l'enum `QualiteInfluence`. Définition : conjoint·e (mariage, PACS, union notoire publique) d'une personne dont le `qualiteInfluence` est lui-même non-`AUTRE`, et dont la conjugalité a fait l'objet d'une communication publique de l'intéressé·e ou d'une couverture médiatique notoire.

### Conséquences

- Migration Prisma : `ALTER TYPE` enum (1 valeur)
- UI `Enrichissement.jsx` : ajouter `CONJOINT_PUBLIC` dans le dropdown + tooltip déontologique (rappeler que la couverture journalistique reste conditionnée à l'intérêt général, art. 85 RGPD)
- Composant fiche entité : afficher le badge avec une nuance visuelle (couleur secondaire vs personnalités principales) pour matérialiser la base légale atténuée
- Documentation `/mentions-legales` : ajouter une ligne explicitant le périmètre `CONJOINT_PUBLIC`
- Rétro-actif : 0 ligne à migrer (corpus seed-perso actuel ne contient pas de cas — Brigitte Macron uniquement dans `seed-macron-v2.js` produit hors plateforme)

### Alternatives envisagées et rejetées

- Conserver `AUTRE` : noie l'info, pas explicite vis-à-vis du juriste audit ADR-010
- Créer une table de qualifiers secondaire : complexité disproportionnée pour 1 cas particulier

---

## ADR-027 (proposé) — Ajout d'un code `nomination_gouvernementale` au référentiel `TypeLien`

**Statut** : DRAFT
**Date proposée** : 2026-06-22
**Auteur ébauche** : agent osint-investigation (instance Why)

### Contexte

Le référentiel `TypeLien` (cf. `backend/prisma/seed.js`) couvre actuellement :

- Catégoriels : `famille`, `amitie`, `politique`, `economique`, `mediatique`, `institutionnel`, `academique`, `financement`, `lobbying`, `juridique`
- Relations spécifiques : `DIRIGEANT`, `BENEFICIAIRE_EFFECTIF`, `MANDAT_ELECTIF`, `EMPLOI`, `AFFILIATION_PARTI`

Le cas spécifique d'une **nomination gouvernementale** (un·e président·e nomme un·e premier·e ministre, un·e premier·e ministre nomme un·e ministre) n'a pas de code dédié :

- `MANDAT_ELECTIF` ne convient pas → un·e PM nommé·e n'est pas élu·e à ce poste
- `politique` est trop générique et perd l'information « nomination »
- `EMPLOI` est trop banal pour la nature constitutionnelle de l'acte

L'agent a contourné en utilisant `politique` (générique), ce qui exprime mal la relation Macron → Lecornu (PM).

### Décision proposée

Ajouter le code `nomination_gouvernementale` au référentiel `TypeLien`. Libellé : « Nomination gouvernementale ». Catégorie : `institutionnel`. Description : « Lien créé par décret de nomination à une fonction gouvernementale (PM, ministre, secrétaire d'État, etc.), distinct d'un mandat électif. La source de référence est le JORF (Journal Officiel) ou la communication officielle du gouvernement. »

### Conséquences

- Migration Prisma : 1 ligne `INSERT INTO types_liens` (idempotent dans `seed.js`)
- Source canonique du lien : URL JORF dans `Source.url`, `typeMedia: DOCUMENT_OFFICIEL`
- Modélisation : permet de représenter proprement les **architectures gouvernementales** (Macron → PM → ministres) comme arbres de nomination, distinct des affiliations partisanes
- Compatible ADR-018 (chat IA sur graphe) : le LLM pourra distinguer « X est ministre nommé par Y » de « X siège au parti de Y »

### Alternatives envisagées et rejetées

- Conserver `politique` : perd l'info, complique l'analyse graphique
- Créer une famille de codes (`nomination_pm`, `nomination_ministre`, `nomination_secdetat`) : sur-modélisation, le champ `description` du `Lien` suffit pour préciser
- Reprendre `MANDAT_ELECTIF` avec un sous-champ : casse la sémantique de l'élection
