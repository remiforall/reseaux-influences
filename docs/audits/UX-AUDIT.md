# Audit UX — Module d'enrichissement OSINT

**Auditeur** : UX Architect
**Date** : 2026-05-11
**Périmètre** : `frontend/src/pages/Enrichissement.jsx`, `frontend/src/pages/Graphe.jsx`, `frontend/src/components/enrichissement/*`, `frontend/src/components/graphe/*`, `frontend/src/components/Navbar.jsx`
**Personae cible** : Rémi (designer-journaliste, opérateur unique aujourd'hui), future journaliste accréditée (non technique), future chercheuse en sciences politiques (méthodique, comparatrice)

## Synthèse exécutive

Le module est **techniquement très soigné** (accessibilité AAA, garde-fous RGPD, double codage CUD, focus management, debounce, fallback tableau). Le travail invisible y est massif et **doit être conservé tel quel**.

En revanche, le **parcours utilisateur souffre de frictions importantes** qui le rendent inutilement laborieux pour une journaliste ou une chercheuse :

1. **Le formulaire d'import s'ouvre en parallèle du résultat sans bloquer le contexte** (pas de modal réelle, pas d'overlay, pas de focus trap) — alors qu'il a `role="dialog" aria-modal="true"`. C'est trompeur pour les technologies d'assistance et désorganisé visuellement.
2. **La sélection des sources par champ est invisible si l'utilisateur ne clique pas "Voir les détails"** — la valeur de l'outil (la provenance multi-sources) est cachée derrière un repli par défaut.
3. **Le mental model « recherche → preview → import »** est correct mais le pont entre `/enrichissement` et `/graphe` est inexistant — après import, l'utilisateur reste bloqué dans la page d'enrichissement, pas de "Voir dans le graphe" ni de continuité de session.
4. **Le filtre `dateDebut`/`dateFin` du graphe est codé mais non appliqué** — bug UX silencieux qui détruit la confiance.
5. **Plusieurs micro-copies exposent la mécanique technique** au lieu de parler le langage du journaliste (codes `EDITEUR_PRESSE`, `wikidataId`, `siren`, identifiants bruts).
6. **L'onboarding est nul** : un nouvel utilisateur arrive sur `/enrichissement`, lit un disclaimer RGPD, et n'a aucune indication de "que chercher en premier" — pas d'exemples concrets, pas de raccourcis vers les dernières recherches.

Verdict : **prêt pour un usage mono-utilisateur expert** (Rémi). **Pas prêt pour une journaliste accréditée externe sans 1-2 jours de polish UX.**

## Frictions identifiées

### CRITIQUE (bloque l'usage ou la confiance dans l'outil)

| ID  | Problème                                                                                                                                                                                                                                                                                                                                                                                 | Fichier:ligne                                                                  | Persona impacté                               | Fix proposée                                                                                                                                                                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Le `FormulaireImport` se déclare `role="dialog" aria-modal="true"` mais s'affiche **inline sous la carte concernée**, sans overlay, sans focus trap, sans fond grisé. Les utilisateurs au clavier peuvent Tab-sortir hors du "dialogue" et continuer à interagir avec le formulaire de recherche. Un lecteur d'écran annonce "boîte de dialogue" mais la sémantique réelle ne tient pas. | `FormulaireImport.jsx:75-80` + `Enrichissement.jsx:255-264`                    | Tous (sécurité a11y)                          | Soit (a) faire un vrai overlay modal avec `inert` sur le reste de la page + focus trap, soit (b) **retirer `role="dialog"` et `aria-modal`** et traiter ce bloc comme une section dépliée classique avec un titre `h3`. Option (b) suffisante et plus honnête.                |
| C2  | Filtres `dateDebut`/`dateFin` du graphe sont saisis par l'utilisateur mais **jamais appliqués** au filtrage local ni envoyés à l'API. Le useEffect ne dépend pas de ces filtres et `noeudsFiltrés`/`aretesFiltrées` ne les utilisent pas. Confiance détruite dès qu'un utilisateur méthodique teste.                                                                                     | `Graphe.jsx:115-129` (deps useEffect + filtrage) + `FiltresGraphe.jsx:136-169` | Chercheuse (méthodique, va tester)            | Soit appliquer ces filtres côté client sur `aretes[].createdAt`, soit les retirer de l'UI avec une mention « Période — bientôt disponible ». Ne pas livrer un champ qui ne fait rien.                                                                                         |
| C3  | Aucune action de continuité après import réussi : le toast de succès propose `Voir la fiche` mais **rien ne renvoie vers le graphe** alors que c'est l'usage cible (« j'enrichis pour explorer »). L'utilisateur doit deviner l'URL `?entite=:id` ou copier l'id à la main.                                                                                                              | `Enrichissement.jsx:215-234`                                                   | Journaliste, chercheuse                       | Ajouter dans le toast deux liens : `Voir la fiche` + `Explorer le réseau` (`/graphe?entite=${id}`). Et conserver le résultat de recherche (ne pas vider `previews`) pour permettre d'importer plusieurs entités d'un coup.                                                    |
| C4  | Page `/enrichissement` vide à l'arrivée : un nouvel utilisateur lit le disclaimer RGPD anxiogène puis un formulaire vide. **Aucun exemple utilisable d'un clic**, aucun historique des recherches précédentes, aucune suggestion ("essayez : un député, une SCI, un nom de domaine").                                                                                                    | `Enrichissement.jsx:144-186`                                                   | Future journaliste accréditée (pas familière) | Avant le formulaire, ajouter 3 chips d'exemples cliquables : `Élu local` `Société commerciale` `Site de presse` qui pré-remplissent une démo (`Édouard Philippe`, `Total Energies`, `mediapart.fr`). Ou montrer les 3 dernières recherches de l'utilisateur (`localStorage`). |
| C5  | `qualiteInfluencePublique` obligatoire **sans aucune explication de chaque valeur**. La chercheuse en sciences politiques voit `LOBBYISTE`, `HAUT_FONCTIONNAIRE`, `AUTRE` — comment classer un journaliste ? un syndicaliste ? un universitaire ? La taxonomie est arbitraire et invisible.                                                                                              | `SelecteurQualiteInfluence.jsx:17-28`                                          | Toutes — surtout chercheuse                   | Sous le `<select>`, ajouter un `<details>` "Voir les définitions" qui liste chaque valeur avec 1 ligne d'explication. Ou bien transformer en `<fieldset><legend>` avec radios + descriptions visibles. Bloquant pour l'usage rigoureux.                                       |

### IMPORTANTE (perte d'efficacité significative)

| ID  | Problème                                                                                                                                                                                                                                                                                      | Fichier:ligne                                                | Persona impacté             | Fix proposée                                                                                                                                                                                                                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I1  | Les **détails d'une preview sont repliés par défaut** (`useState(false)`). Or c'est précisément là que se joue la valeur de l'outil : la sélection des sources par champ. L'utilisateur doit cliquer "Voir les détails" sur **chaque résultat** pour comprendre ce que propose chaque source. | `PreviewEntite.jsx:48`                                       | Tous                        | Déplier le **premier résultat** par défaut, replier les suivants. Ou prévoir un bouton "Tout déplier" en tête de liste.                                                                                                                                    |
| I2  | Sélection d'un **candidat par champ via radio** : si une seule source propose une valeur, l'utilisateur doit quand même cliquer le radio pour le sélectionner. Sinon le champ n'est pas retenu à l'import. Friction silencieuse, on importe une entité avec un récap vide.                    | `PreviewEntite.jsx:139-165` + `FormulaireImport.jsx:96-115`  | Tous                        | Pré-sélectionner automatiquement le candidat de plus haute confiance (premier de la liste / source la plus fiable). L'utilisateur change s'il le souhaite. Documenter cette pré-sélection dans une note.                                                   |
| I3  | Les **liens suggérés affichent `lien.vers?.identifiantExterne`** (`Q12345`, `123456789` SIREN, `lemonde.fr`) comme libellé. Aucune résolution vers un nom lisible. La chercheuse voit "Dirigeant·e de → Q3036" sans savoir qu'il s'agit de Vinci.                                             | `PreviewEntite.jsx:192-198` + `FormulaireImport.jsx:128-133` | Toutes                      | Le backend doit résoudre côté preview le libellé (`vers.nom`). À défaut, sur le frontend, afficher l'identifiant en `<code>` + un sous-titre "Identifiant non résolu — l'entité sera créée lors de l'import" pour ne pas faire passer un Q-ID pour un nom. |
| I4  | **Statuts de connecteurs** : pas de différence visible entre "tous OK" et "1 KO sur 7". L'utilisateur doit scanner manuellement la liste. Aucun summary type "5/7 connecteurs ont répondu, 1 timeout (RDAP), 1 erreur (Pappers)".                                                             | `Enrichissement.jsx:188-204`                                 | Toutes — surtout chercheuse | Ajouter un résumé en h2 : "État des sources : 5 OK · 1 délai dépassé · 1 erreur" avec couleur globale. Permet de juger la qualité du résultat d'un coup.                                                                                                   |
| I5  | Le **bouton "Recentrer" du graphe** est rattaché par DOM id (`document.getElementById('btn-recentrer-graphe')`) à l'intérieur d'un useEffect — c'est une pratique anti-React, et ça casse silencieusement si le bouton se démonte (toggle tableau ↔ graphe).                                  | `GrapheD3.jsx:279-284` + `Graphe.jsx:213-222`                | Tous                        | Passer une `ref` ou un callback `onRecentrer` exposé via `useImperativeHandle`. Bug intermittent garanti à l'usage.                                                                                                                                        |
| I6  | Le **panneau de détail d'un nœud** (Graphe) s'affiche **en bas, sous le graphe**, donc invisible sans scroll sur petits écrans. Il devrait être ancré (sticky) ou en overlay latéral. Un utilisateur qui sélectionne un nœud risque de ne pas voir qu'un panneau s'est ouvert.                | `Graphe.jsx:280-326`                                         | Toutes                      | Soit `position: sticky; top: 80px` sur le panneau, soit `position: absolute; right: 0` (drawer latéral). Annoncer `aria-live` à l'ouverture.                                                                                                               |
| I7  | Le `SelecteurEntite` (autocomplete graphe) **ne propose pas les `SiteWeb`** alors qu'ils peuvent être centraux dans une investigation (titulaire de domaine, etc.).                                                                                                                           | `SelecteurEntite.jsx:48-66`                                  | Toutes                      | Ajouter `searchSitesWeb(query)` si endpoint dispo. À défaut, documenter "Personnes et organisations uniquement — pour explorer un site web, partez de son propriétaire".                                                                                   |
| I8  | Le **toggle graphe/tableau** est utile mais **ne mémorise pas le choix** (rechargement = retour au graphe). Une chercheuse qui préfère le tableau doit re-toggler à chaque visite.                                                                                                            | `Graphe.jsx:50`                                              | Chercheuse, journaliste     | Persister dans `localStorage` (`graphe-vue`). 3 lignes de code, gain quotidien.                                                                                                                                                                            |
| I9  | **Aucune indication visuelle entre "source officielle" et "source manuelle"** dans la preview. Le `BadgeProvenance` mappe sur 4 catégories (Wikidata, Pappers/RNE, RDAP, IGN), tout autre source tombe en gris générique. Une source non listée n'est pas étiquetée comme "moins fiable".     | `BadgeProvenance.jsx:24-34`                                  | Chercheuse (traçabilité)    | Ajouter un niveau de fiabilité visible (officielle / déclarative / communautaire) en surcouche, distinct de la simple icône de source.                                                                                                                     |
| I10 | Annonce `setAnnonce(...)` réécrite à chaque étape sans expiration : si l'utilisateur reste sur la page, la dernière annonce reste dans `aria-live` indéfiniment. Pas un bug visuel mais inconfort lecteur d'écran.                                                                            | `Enrichissement.jsx:35, 80, 98, 100, 111, 131`               | Utilisateur lecteur d'écran | Réinitialiser `setAnnonce(null)` 5s après chaque annonce, ou utiliser `aria-live="polite"` avec `key` qui force la ré-annonce.                                                                                                                             |
| I11 | Le **lien "Enrichir" est conditionné à `localStorage.getItem('token')`** lu **synchrone au render**. Sur un token expiré, le lien reste affiché → l'utilisateur clique → 401. Pas de feedback.                                                                                                | `Navbar.jsx:20`                                              | Toutes                      | Acceptable pour MVP mais sur la page Enrichissement, intercepter le 401 et rediriger vers `/login?retour=/enrichissement`. Aujourd'hui le message d'erreur "Vous devez être connecté" n'offre aucun moyen d'agir.                                          |

### À POLIR (post-MVP)

| ID  | Problème                                                                                                                                                                                                                                                                        | Fichier:ligne                                             | Persona impacté                          | Fix proposée                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Le **placeholder** des champs de recherche est utile (`Ex : Emmanuel Macron…`) mais répété entre Enrichissement et SelecteurEntite. Manque de cohérence : `Total Energies` vs `Total Energies`, `lemonde.fr` vs `Total Energies…`.                                              | `FormulaireRecherche.jsx:114` + `SelecteurEntite.jsx:144` | —                                        | Aligner les exemples. Préférer une diversité (1 personne, 1 orga, 1 domaine).                                                                                  |
| P2  | **Microcopie "Importer en brouillon"** — le mot "brouillon" est correct juridiquement mais flou pour un journaliste. "L'entité ira en file de validation" serait plus parlant.                                                                                                  | `FormulaireImport.jsx:208-210`                            | Journaliste accréditée                   | Reformuler : "Soumettre pour validation".                                                                                                                      |
| P3  | Le bouton "Voir les détails" / "Réduire" est positionné à droite de la carte, sans icône `⌄` / `⌃`. Affordance moyenne.                                                                                                                                                         | `PreviewEntite.jsx:112-120`                               | Toutes                                   | Ajouter chevron `aria-hidden="true"` qui pivote.                                                                                                               |
| P4  | `TableauGraphe` : tri par clic sur en-tête fonctionne mais **l'indicateur `⇅` / `▲` / `▼` n'est pas très lisible**. Et tri ne s'applique pas sur la date (utilise `localeCompare` sur la chaîne formatée, donc tri lexical "01/12/2024" < "02/01/2020").                        | `TableauGraphe.jsx:86-93`                                 | Chercheuse                               | Pour la colonne `date`, comparer `dateIso` directement. Sinon `01/12/2024` se classe avant `02/01/2020`. Bug silencieux.                                       |
| P5  | Le **footer du formulaire d'import** met le bouton "Annuler" à gauche et "Importer en brouillon" à droite — convention Mac/Web. OK. Mais on pourrait clarifier la zone de danger : pas de bouton "supprimer" donc tout va bien, mais penser à harmoniser quand l'undo arrivera. | `FormulaireImport.jsx:179-218`                            | —                                        | Pas d'action immédiate. Documenter dans le design system.                                                                                                      |
| P6  | **`StatutConnecteur`** : la couleur `bg-orange-100` pour le timeout est très proche du `bg-amber-100` pour erreur sur certains écrans, malgré la différence d'icône.                                                                                                            | `StatutConnecteur.jsx:26-35`                              | Daltonien (mineur, icônes différencient) | OK car icônes ⚠ vs ⏱ différent, mais penser à séparer plus franchement (gris pour timeout ?).                                                                  |
| P7  | La **case à cocher de confirmation RGPD** dans FormulaireImport est obligatoire à chaque import. Pour Rémi qui en fait 50 par session, friction répétée.                                                                                                                        | `FormulaireImport.jsx:148-160`                            | Rémi (power user)                        | Conserver l'obligation (sécurité juridique) mais ajouter un "Pré-cocher pour cette session" qui dure 1h. Documenter dans l'audit log que la case a été cochée. |
| P8  | **Aucun raccourci clavier global** : pas de `/` pour focus la recherche, pas de `Esc` global pour fermer le formulaire d'import (Esc fonctionne dans SelecteurEntite mais pas dans le dialogue d'import).                                                                       | `FormulaireImport.jsx` (global)                           | Rémi (power user)                        | Ajouter `useEffect` sur `keydown` global pour `Esc` quand le dialogue est ouvert.                                                                              |
| P9  | **Le sélecteur de qualité utilise `<select>`** — élégant mais pour 10 valeurs avec descriptions, un groupe de radios serait plus pédagogique (toutes les options visibles, RGAA recommande pour les cas <10 où la comparaison est utile).                                       | `SelecteurQualiteInfluence.jsx:46-72`                     | Journaliste, chercheuse                  | Migrer en `<fieldset>` radios + description courte par option.                                                                                                 |
| P10 | Le `RegionAnnonces` reste vide à l'arrivée — il faudrait peut-être annoncer à l'ouverture "Page d'enrichissement OSINT chargée. Formulaire de recherche disponible." pour les utilisateurs de lecteurs d'écran.                                                                 | `RegionAnnonces.jsx`                                      | Utilisateur lecteur d'écran              | Annonce d'arrivée optionnelle.                                                                                                                                 |

## Parcours type — étapes mesurées

**Scénario** : « Je cherche Emmanuel Macron pour démarrer une enquête sur ses réseaux. »

| Étape | Action                                                | Clics                | Frictions                                                                       |
| ----- | ----------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------- |
| 1     | Arrivée sur `/enrichissement`                         | 0                    | Long disclaimer RGPD à lire, aucun exemple pour démarrer (**C4**)               |
| 2     | Saisie "Emmanuel Macron" dans le champ recherche      | 1 + saisie           | OK, placeholder explicite                                                       |
| 3     | Décocher des types ou connecteurs si besoin           | 0-7                  | Par défaut tout coché, OK                                                       |
| 4     | Clic "Rechercher"                                     | 1                    | Bouton clair, état de chargement OK                                             |
| 5     | Lecture des statuts de connecteurs                    | scan                 | Pas de résumé global (**I4**)                                                   |
| 6     | Identifier le résultat pertinent parmi N candidats    | scan                 | Cards avec titre + type, lisible. Mais détails repliés (**I1**)                 |
| 7     | Clic "Voir les détails" sur le bon résultat           | 1                    | OK                                                                              |
| 8     | Pour chaque champ proposé, choisir une source (radio) | 5-15 clics           | Pré-sélection absente (**I2**), donc gros effort répété                         |
| 9     | Cocher les liens suggérés à importer                  | 1-20 clics           | Libellés `Q12345` non résolus (**I3**)                                          |
| 10    | Clic "Importer cette entité"                          | 1                    | OK                                                                              |
| 11    | Lecture du récap dans le formulaire                   | scan                 | Affichage correct                                                               |
| 12    | Sélection `qualiteInfluencePublique`                  | 1 + ouverture select | Aucune définition des valeurs (**C5**)                                          |
| 13    | Cocher la confirmation RGPD                           | 1                    | OK pour MVP, lourd à 50× (**P7**)                                               |
| 14    | Clic "Importer en brouillon"                          | 1                    | OK                                                                              |
| 15    | Réception du toast de succès                          | 0                    | Pas de "Voir le graphe" (**C3**), bloqué là                                     |
| 16    | Naviguer vers `/graphe`                               | clic Navbar          | Pas d'`?entite=` pré-rempli, faut chercher à nouveau Macron dans l'autocomplete |
| 17    | Sélection dans l'autocomplete                         | 1 + saisie           | OK                                                                              |
| 18    | Lecture du graphe                                     | scan                 | Légende permanente : excellent. Filtres date inactifs (**C2**).                 |

**Total** : ~16-50 clics pour importer **une** entité et la voir dans le graphe.

Cible raisonnable : 10-12 clics pour le premier import, 6-8 pour les suivants si pré-sélection des sources et lien direct vers le graphe.

## Recommandations microcopie

| Actuel                                                                                                                                        | Recommandé                                                                                                                                                            | Justification                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| "Importer en brouillon"                                                                                                                       | "Soumettre pour validation"                                                                                                                                           | "Brouillon" est ambigu — le journaliste pense "je peux revenir le modifier", or le brouillon part en file de validation communautaire. |
| "Vous devez valider N liens avant de pouvoir importer."                                                                                       | "Pour limiter le spam, l'import nécessite d'avoir validé {N} liens au préalable. Vous en avez validé {M}."                                                            | Donner le pourquoi + l'état actuel. Aujourd'hui c'est juste une porte fermée.                                                          |
| "Aucun résultat trouvé pour cette recherche. Essayez d'autres termes ou types."                                                               | "Aucune entité trouvée. Astuces : élargissez les types cochés, vérifiez l'orthographe, ou cherchez un identifiant (SIREN, domaine, Q-ID Wikidata)."                   | Actionnable.                                                                                                                           |
| "Recherchez des entités dans des sources publiques officielles (Wikidata, RDAP, IGN) et importez-les en brouillon pour contribuer au réseau." | "Cherchez une personne, une organisation ou un site dans les sources publiques (Wikidata, registre du commerce, RDAP, IGN). Importez ce que vous voulez retenir."     | Plus direct, retire "brouillon" du first contact.                                                                                      |
| `qualite-influence` valeurs brutes (`EDITEUR_PRESSE`)                                                                                         | Ajouter une note d'usage sous chaque libellé : "Éditeur·rice de presse — entreprise éditant un titre de presse (loi 1881)."                                           | Élimine l'arbitraire pour la chercheuse.                                                                                               |
| "Champ obligatoire — base légale RGPD art. 85 + LIL art. 80."                                                                                 | "Obligatoire : précisez à quel titre cette personne fait l'objet d'un traitement journalistique (base légale RGPD art. 85)."                                          | Rendre le pourquoi humain et lisible.                                                                                                  |
| Identifiants externes : `wikidataId : Q12345`                                                                                                 | `Wikidata : Q12345` (sans le suffixe Id)                                                                                                                              | Cohérence avec le badge de provenance.                                                                                                 |
| Toast succès : "Entité importée en brouillon. Voir la fiche"                                                                                  | "Entité créée. Voir la fiche · Explorer le réseau · Importer une autre"                                                                                               | Donne 3 issues, pas une.                                                                                                               |
| "Sélectionnez une entité pour explorer son réseau" (état vide Graphe)                                                                         | "Choisissez une personne ou une organisation pour voir ses liens à 2 niveaux de connexion. Astuce : utilisez la page Enrichissement pour ajouter une entité absente." | Pédagogique + pont vers /enrichissement.                                                                                               |
| "Aucune entité ou aucun lien avec les filtres actuels."                                                                                       | "Aucun résultat. Élargissez les filtres (statut, types d'entité) ou réinitialisez-les." + bouton réinitialiser inline                                                 | Actionnable.                                                                                                                           |
| `Voir les détails` / `Réduire`                                                                                                                | `Voir les sources (N)` / `Replier`                                                                                                                                    | Indique la promesse — combien de sources se cachent.                                                                                   |

## Recommandations design

1. **Décider de la nature du `FormulaireImport`** : soit vraie modale (overlay + focus trap + `inert` sur le reste + bouton Esc fonctionnel), soit section dépliée standard (retirer `role="dialog"` et `aria-modal`). Le mélange actuel est trompeur pour les technologies d'assistance.

2. **Pré-sélectionner systématiquement** : (a) le premier candidat de chaque champ proposé, (b) tous les liens suggérés de sources officielles (Pappers, IGN, RDAP). L'utilisateur **décoche** ce qui ne lui convient pas — modèle opt-out plus rapide qu'opt-in pour une majorité de cas.

3. **Ouvrir le premier résultat de recherche en mode déplié** par défaut. Les autres restent repliés. Bouton "Tout déplier / tout replier" en tête.

4. **Continuité de session** : après un import réussi, ne PAS vider les `previews`. Garder la liste, juste griser/badger "Importée" sur la carte concernée. Ça permet l'usage typique « je cherche Macron, j'importe 3-4 candidats liés ».

5. **Liens explicites entre les pages** :
   - Depuis l'accueil → CTA "Explorer un réseau" (graphe)
   - Depuis le toast succès → "Explorer le réseau" (`/graphe?entite=:id`)
   - Depuis l'état vide du graphe → "Ajouter une entité absente" (`/enrichissement`)

6. **Résumé global des connecteurs** au lieu d'une simple liste : "5 sources ont répondu sur 7 (1 délai dépassé, 1 erreur)". Donne le diagnostic en un coup d'œil.

7. **Persistance des préférences utilisateur** :
   - `localStorage.graphe-vue` (graphe / tableau)
   - `localStorage.enrichissement-recherches` (5 dernières recherches)
   - `localStorage.enrichissement-confirme-session` (case RGPD pré-cochée pendant 1h, pour Rémi qui enchaîne)

8. **Affichage des libellés d'entités** : si un `Q-ID` n'a pas de nom résolu, l'afficher en `<code>` plutôt qu'en italique simple, pour distinguer "données techniques" de "donnée éditoriale". Ajouter un tooltip "Identifiant non résolu — sera complété à l'import".

9. **Panneau de détail du nœud (Graphe)** : `position: sticky` ou drawer latéral pour qu'il reste visible quand l'utilisateur explore.

10. **Filtres date du graphe** : soit câbler le filtrage (sur `aretes[].createdAt`), soit retirer les champs avec mention "Bientôt disponible". Pas de feature factice.

11. **Wireframe textuel proposé pour l'arrivée sur `/enrichissement`** :

    ```
    ┌─────────────────────────────────────────────────────────┐
    │ Enrichissement OSINT                                    │
    │ Cherchez une personne, une organisation, un site.       │
    ├─────────────────────────────────────────────────────────┤
    │ ⚠ Base légale et responsabilité éditoriale (replié ▾)   │
    │   → cliquer pour lire le détail                         │
    ├─────────────────────────────────────────────────────────┤
    │ Rechercher                                              │
    │ [____________________________________________]          │
    │ Exemples : [Édouard Philippe] [Total Energies] [lemonde.fr] │
    │ Types : ☑ Personne ☑ Organisation ☑ Site                │
    │ [Rechercher]                                            │
    ├─────────────────────────────────────────────────────────┤
    │ Recherches récentes :                                   │
    │ • "Vinci Construction" — il y a 2 h — 3 résultats       │
    │ • "Édouard Philippe" — hier — 1 résultat importé        │
    └─────────────────────────────────────────────────────────┘
    ```

12. **Cohérence vocabulaire** : utiliser **"sources"** partout (et non "connecteurs" qui est un terme technique). Le `connecteursDisponibles` côté code peut rester, mais l'utilisateur ne devrait jamais lire "connecteur".

## Points forts

À conserver absolument :

1. **Niveau d'accessibilité exceptionnel** : focus management, `aria-live` polite, alternative tableau du graphe, `prefers-reduced-motion` respecté, cibles 44 px partout, double codage CUD sur tous les badges. C'est l'état de l'art.

2. **Double codage couleur + icône + texte** systématique (`BadgeProvenance`, `StatutConnecteur`, `TypeBadge`, `LegendeGraphe`) — fait correctement, pas par dessus la jambe.

3. **Annonces ARIA contextuelles** pour chaque transition (`Recherche en cours sur 5 connecteurs…`, `3 résultats trouvés.`, `Entité importée en brouillon avec succès.`). Excellent pour les utilisateurs de lecteurs d'écran.

4. **Synchronisation URL ↔ entité racine** du graphe (`?entite=:id`) : permet partage et favoris. Très bon pattern.

5. **Note RGPD pédagogique en tête** (`art. 85 RGPD + art. 80 LIL`) : visible, non-bloquante visuellement, conforme au cadre journalistique. Bon équilibre.

6. **Légende permanente** du graphe — pas conditionnelle, toujours visible. Bon.

7. **Confirmation explicite** avant import (case à cocher) : conforme aux attentes éditoriales sur traitement de données personnelles. À conserver.

8. **Garde-fou applicatif `peutSoumettre`** (seuil de validations préalables) + message d'erreur dédié avec lien vers la page Liens — bonne articulation contribution / consommation.

9. **Format `<time datetime="">` dans `BadgeProvenance`** — sémantique machine correcte, datable côté outils tiers.

10. **Architecture des composants** : `RegionAnnonces`, `BadgeProvenance`, `StatutConnecteur` réutilisables, séparation `constants.js` propre. Bon découpage.

## Actions prioritaires (ordre d'impact)

1. **C2** — retirer ou implémenter le filtre date du graphe (sinon perte de confiance immédiate)
2. **C1** — clarifier la nature du `FormulaireImport` (modale réelle ou section)
3. **C3** — ajouter "Explorer le réseau" dans le toast de succès + ne pas vider les previews
4. **I1 + I2** — déplier le premier résultat + pré-sélectionner les sources (les deux frictions les plus coûteuses en clics)
5. **C5** — descriptions des valeurs de `qualiteInfluencePublique`
6. **I3** — résoudre les libellés des liens suggérés (sinon import à l'aveugle)
7. **I4** — résumé global des connecteurs
8. **C4** — chips d'exemples + recherches récentes sur la page d'arrivée
9. **I6** — panneau de détail du nœud sticky/latéral
10. **I8** — persistance graphe/tableau dans `localStorage`
11. **I5** — refactor du bouton "Recentrer" via ref React
12. **Microcopies** — passe complète selon le tableau ci-dessus

Les autres (P1-P10, I7, I9, I10, I11) sont à traiter en post-MVP, sans urgence.

---

## Conflits potentiels

⚠️ **CONFLIT POTENTIEL [Security Guardian]** sur la recommandation P7 (case RGPD pré-cochée pour la session) : la confirmation explicite à chaque import est probablement exigée par le cadre RGPD / ADR-006. Proposer une variante : ne pas pré-cocher mais offrir un mode "session de saisie" qui mémorise les autres champs (qualité d'influence par défaut), de sorte que la case reste à cocher mais que le reste soit plus rapide.

⚠️ **CONFLIT POTENTIEL [Accessibility Champion]** sur la recommandation 9 (panneau de détail en drawer latéral) : sur mobile, un drawer latéral est moins accessible qu'un panneau scrollable in-flow. Proposer : sticky sur desktop (≥ 1024 px), in-flow sur mobile.

⚠️ **CONFLIT POTENTIEL [Performance Sentinel]** sur la recommandation 4 (garder les previews après import) : les previews contiennent les données brutes des connecteurs, potentiellement lourdes. Si > 50 résultats par recherche, garder en mémoire pourrait peser. À mesurer mais ne devrait pas poser problème en pratique pour le volume cible.
