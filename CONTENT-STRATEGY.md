# Stratégie de contenu — reseaux-influences

**Date** : 2026-05-11
**Auteur** : Content Strategist (revue Phase 3 pipeline)

## Synthèse positionnement

Le projet souffre d'une **fracture éditoriale** entre :

- une **vitrine grand-public** (Accueil, Navbar) qui promet un wiki collaboratif sur les "personnes publiques" et les liens "validés par la communauté" — héritière du framing Owni/NXX d'origine ;
- un **back-office mono-utilisateur naissant** (Enrichissement, Graphe ego-network) qui parle "OSINT", "connecteurs", "Wikidata/RDAP/IGN", "ego-network 2 sauts" — orienté outil d'investigation type LittleSis/Maltego.

Recommandation : positionner reseauxinfluences.fr comme un **wiki d'intérêt public alimenté par des sources officielles**, ouvert progressivement à la contribution communautaire. Le module d'enrichissement n'est pas une feature exposée au grand public — c'est l'**atelier éditorial** qui produit les fiches que la communauté validera ensuite. Cette distinction « atelier » vs « scène publique » doit irriguer tout le vocabulaire et l'architecture de navigation.

## Tone of voice

**Charte transversale** :

- **Registre** : informatif, neutre journalistique. Pas de marketing, pas de militantisme, pas de jargon technique en façade publique.
- **Persona** : un·e rédacteur·rice de Wikipédia en français — précis·e, sourcé·e, prudent·e, jamais accusateur·rice.
- **Lecture cible** : niveau lycée / bac. Phrases ≤ 20 mots. Une idée par phrase.

**Règles dures** :

1. **Pas de jargon technique en façade publique.** "OSINT" → "sources publiques officielles". "Connecteur" → "source". "Ego-network 2 sauts" → "réseau direct et indirect".
2. **Le terme `lien` est canonique.** Bannir "connexion", "relation", "arête", "edge" hors documentation technique interne.
3. **Écriture inclusive en doublet flexionnel** (point médian `·`) cohérente partout.

**Règles douces** :

- Préférer "Sélectionnez" à "Choisissez".
- Préférer la voix active.
- Pas d'emoji décoratifs dans les textes publiés.

## Vocabulaire métier (glossaire canonique)

| Concept                                           | Terme officiel                           | Synonymes interdits              |
| ------------------------------------------------- | ---------------------------------------- | -------------------------------- |
| Connexion entre deux entités                      | **lien**                                 | relation, connexion, arête, edge |
| Catégorie de lien                                 | **type de lien**                         | catégorie, nature                |
| Personne publique                                 | **personne**                             | individu, profil, acteur         |
| Entité morale                                     | **organisation**                         | entité, structure, société       |
| Présence en ligne                                 | **site web**                             | site, domaine, page web          |
| Justification d'un lien                           | **source**                               | référence, citation, preuve      |
| Origine de la donnée importée                     | **source officielle**                    | connecteur, API, dataset         |
| Statut d'un lien proposé                          | **en attente** / **validé** / **rejeté** | brouillon, draft, accepté        |
| Personne ou organisation justifiant la couverture | **qualité d'influence publique**         | qualité, fonction, rôle          |
| Action de proposer un lien                        | **soumettre**                            | poster, publier, créer           |
| Action de valider un lien                         | **valider** ou **rejeter**               | voter, juger, modérer            |
| Mécanisme de seuil 5 validations                  | **droit de soumission**                  | quota, gate, déblocage           |
| Réseau autour d'une entité                        | **réseau**                               | ego-network, voisinage           |
| Exception RGPD art. 85 + LIL 80                   | **intérêt public**                       | journalisme, recherche           |
| Page de prévisualisation avant import             | **aperçu**                               | preview, pré-remplissage         |

**Le terme "OSINT" doit être supprimé de tous les libellés UI** (légitime en code/docs internes, inacceptable dans `<h1>`, `aria-label`, pages publiques).

## Couverture topique — gaps critiques

| Pilier                                | Couverture MVP                                                                    | Verdict            |
| ------------------------------------- | --------------------------------------------------------------------------------- | ------------------ |
| **Politique**                         | Wikidata P39/P102/P26 — OK élus nationaux. Lacune élus locaux.                    | Bon                |
| **Économique**                        | Pappers différé (clé API absente). Dirigeants d'entreprise non couverts.          | **Lacune majeure** |
| **Culturel / médiatique / numérique** | Wikidata P98/P162 ; RDAP. Lacune producteurs audiovisuels, journalistes pigistes. | Moyen              |
| **Foncier / géographique**            | IGN BAN/DVF/Carto/GPU — non nominatif par décision éditoriale.                    | Cohérent           |

Sources non intégrées (post-MVP) : HATVP, BODACC, JOAFE, OpenSanctions, CNC, CPPAP, ARCOM.

## Architecture éditoriale — pages manquantes critiques

| Page                                                                             | Priorité                         | Action                                                                           |
| -------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| `/mentions-legales`                                                              | **URGENTE** (juridique, ADR-006) | À créer avec base légale art. 85 RGPD + LIL 80 explicite                         |
| `/sources-et-methodes`                                                           | Haute                            | Fondement de l'autorité éditoriale                                               |
| `/comment-ca-marche`                                                             | Haute                            | Modèle wiki, seuil 5/5, consensus, badges                                        |
| `/declaration-accessibilite`                                                     | Moyenne                          | Template DINUM, formulation honnête "conformité partielle"                       |
| `/cgu`                                                                           | Post-MVP                         | Interdiction explicite citoyens privés (risque R7 du plan)                       |
| Pages d'entités publiques (`/personnes/:id`, `/organisations/:id`, `/sites/:id`) | Haute                            | Pour l'instant `Enrichissement.jsx:226` renvoie `/entites/:id` route inexistante |

## Priorisation seeding initial (4-6 semaines)

Trois grappes thématiques pour bâtir l'autorité :

1. **Sphère exécutive nationale 2024-2026** (10-15 fiches) — Président, PM, ministres, partis. Couverture Wikidata excellente.
2. **Grands groupes médias français** (8-12 fiches) — Bolloré, Niel, Arnault, Dassault, Pigasse + holdings + titres de presse.
3. **Sites web français à fort enjeu** (10-20 fiches) — Grands quotidiens, médias en ligne, ONG (RDAP × Wikidata).

**Volume cible MVP** : ~40 fiches + ~80 liens validés.

## Quick wins éditoriaux (< 2 h chacun)

1. **Renommer `Enrichissement OSINT` → `Importer une fiche`** (`Enrichissement.jsx:146` h1 + `Navbar.jsx:73/77`)
2. **Réécrire les 3 cartes Accueil** pour intégrer organisations + sites web + qualité d'influence
3. **Ajouter bannière "wiki en construction"** sur Accueil avec compteur live `/api/personnes?statut=VALIDE&count=1`
4. **Aligner le README sur la réalité du code** (Fastify/MySQL, pas Django/Postgres)
5. **Glossaire embarqué dans `/comment-ca-marche`**
6. **Bandeau bêta** (template `~/Developer/a11y-starter-kit/html/beta-banner.template.html`)

## Chantiers structurants

1. **Création de `/mentions-legales`** — priorité absolue, juridique (ADR-006)
2. **Création de `/sources-et-methodes`** — fondement autorité éditoriale
3. **Création de `/comment-ca-marche`** — parcours pédagogique
4. **Pages d'entités publiques** — `Enrichissement.jsx:226` renvoie vers route inexistante `/entites/${id}`
5. **Page `/declaration-accessibilite`** — template DINUM, formulation honnête
6. **Refonte page Accueil** — assumer triple nature personne / organisation / site web
7. **Charte de contribution** (`CONTRIBUTING.md` + `/contribuer`) — indispensable dès 2e contributeur

## Verdict global

Le module d'enrichissement est techniquement abouti et juridiquement consciencieux (ADR-006 exemplaire). Le travail éditorial restant est essentiellement de **mise en cohérence et de transparence publique** : aligner le vocabulaire, simplifier les libellés, publier les mentions légales et la méthodologie, expliciter la posture wiki.

Au niveau du runway PostHack < 3 mois :

- **Quick wins** (4-6 h cumulées) suffisent à rendre le module présentable
- **Chantiers structurants** (mentions, sources, fiches d'entités) sont indispensables avant communication externe ou ouverture à un 2e contributeur.
