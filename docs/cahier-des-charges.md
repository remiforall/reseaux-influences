# Cahier des charges fonctionnel et technique

## Réseaux d'Influence — reseauxinfluences.fr

**Version** : 1.0
**Date** : Mars 2026
**Auteur** : Rémi Vincent
**Statut** : Draft

---

## 1. Contexte et vision

### 1.1 Contexte

La transparence démocratique nécessite de rendre visibles les liens d'influence entre personnes publiques — politiques, journalistes, économistes, lobbyistes — qui façonnent les décisions collectives. Ces réseaux interpersonnels et transnationaux restent souvent opaques pour le grand public.

Le projet s'inscrit dans la continuité du projet _InfluenceNetwork_ développé chez Owni.fr par Nicolas Kayser-Bril, en le modernisant avec des technologies contemporaines et un système de modération communautaire innovant.

### 1.2 Vision

Créer une plateforme collaborative, ouverte et vérifiable permettant de cartographier les réseaux d'influence à partir de sources médiatiques vérifiées, tout en garantissant la qualité des données grâce à un système de gamification communautaire.

### 1.3 Public cible

- **Grand public** : citoyens souhaitant comprendre les liens entre personnes publiques
- **Journalistes** : investigation, croisement de sources, cartographie de réseaux
- **Chercheurs** : analyse de réseaux, science politique, sociologie
- **ONG et associations** : plaidoyer, transparence

---

## 2. Spécifications fonctionnelles

### 2.1 Gestion des personnes publiques

| Fonctionnalité    | Description                                                  | Priorité |
| ----------------- | ------------------------------------------------------------ | -------- |
| Création de fiche | Formulaire avec nom, prénom, pays, rôle, biographie, photo   | MVP      |
| Recherche         | Recherche par nom avec auto-complétion (trigrams PostgreSQL) | MVP      |
| Fiche détaillée   | Page affichant toutes les informations et les liens associés | MVP      |
| Interopérabilité  | Lien vers Wikidata pour enrichissement futur                 | Post-MVP |

### 2.2 Gestion des liens d'influence

| Fonctionnalité   | Description                                                                                               | Priorité |
| ---------------- | --------------------------------------------------------------------------------------------------------- | -------- |
| Création de lien | Formulaire : Personne A → Personne B + type + source + description                                        | MVP      |
| Types de liens   | Familial, politique, économique, médiatique, institutionnel, académique, financement, lobbying, juridique | MVP      |
| Directionnalité  | Liens bidirectionnels ou unidirectionnels                                                                 | MVP      |
| Intensité        | Échelle 1-5 pour qualifier la force du lien                                                               | MVP      |
| Datation         | Date de début et de fin de la relation                                                                    | Post-MVP |

### 2.3 Gestion des sources médiatiques

| Fonctionnalité  | Description                                              | Priorité |
| --------------- | -------------------------------------------------------- | -------- |
| Ajout de source | URL, titre, média, date de publication, auteur           | MVP      |
| Vérification    | Marquage comme vérifiée par un modérateur                | MVP      |
| Types de médias | Presse écrite, télévision, radio, web, document officiel | MVP      |
| Multi-langue    | Support de sources en plusieurs langues                  | Post-MVP |

### 2.4 Modération communautaire et gamification

#### 2.4.1 Système de validation obligatoire

- Un utilisateur **doit valider au moins 5 liens** existants avant de pouvoir soumettre un nouveau lien
- Chaque validation consiste à indiquer **vrai**, **faux** ou **indécis** sur un lien existant
- L'utilisateur peut ajouter un commentaire et une source supplémentaire
- Un compteur en temps réel affiche la progression vers le seuil de soumission

#### 2.4.2 Consensus automatique

- Après un nombre configurable de validations (par défaut 5), le système évalue le consensus
- Si 70%+ des validateurs disent "vrai" → le lien passe en statut **validé**
- Si 70%+ des validateurs disent "faux" → le lien passe en statut **rejeté**
- Sinon → le lien reste **en attente** et continue de recevoir des validations

#### 2.4.3 Système de points

| Action                      | Points |
| --------------------------- | ------ |
| Validation effectuée        | +1     |
| Soumission de lien acceptée | +5     |
| Soumission de lien rejetée  | -2     |

#### 2.4.4 Niveaux

| Niveau        | Points requis |
| ------------- | ------------- |
| Débutant      | 0             |
| Intermédiaire | 50            |
| Expert        | 200           |
| Modérateur    | 500           |

#### 2.4.5 Badges

Badges attribués automatiquement selon des règles configurables :

**Badges de validation :**

- Vérificateur Bronze (10 validations)
- Vérificateur Argent (50 validations)
- Vérificateur Or (200 validations)
- Modérateur (100+ validations avec 80%+ de précision)

**Badges de soumission :**

- Contributeur Bronze (5 liens acceptés)
- Contributeur Argent (20 liens acceptés)
- Contributeur Or (100 liens acceptés)

**Badges par type de média :**

- Expert Presse (10+ validations sur sources presse)
- Expert Télévision (10+ validations sur sources TV)
- Expert Documents (10+ validations sur documents officiels)

**Badges par type de relation :**

- Expert Politique, Expert Économique, Expert Familial, Expert Lobbying

**Badges spéciaux :**

- Pionnier (parmi les 100 premiers inscrits)
- Premier Lien (premier lien accepté)

### 2.5 Profil public utilisateur

- Pseudo, avatar, biographie
- Points, niveau actuel, nombre de validations et soumissions
- Badges obtenus (avec icônes et descriptions)
- Historique des 5 dernières validations et soumissions
- Taux de précision (concordance avec le consensus)

### 2.6 Visualisation interactive

| Fonctionnalité | Description                                                  | Priorité |
| -------------- | ------------------------------------------------------------ | -------- |
| Graphe D3.js   | Noeuds = personnes, arêtes = liens, couleurs = types         | MVP      |
| Zoom et pan    | Navigation fluide dans le graphe                             | MVP      |
| Tooltips       | Détails du lien au survol (type, source, score de confiance) | MVP      |
| Filtres        | Par nom, pays, type de lien, date, score de confiance        | MVP      |
| Clusters       | Regroupement visuel par proximité de réseau                  | Post-MVP |
| Export image   | Export du graphe en PNG/SVG                                  | Post-MVP |

### 2.7 API publique

| Endpoint                        | Méthode | Description                               |
| ------------------------------- | ------- | ----------------------------------------- |
| `/api/personnes`                | GET     | Liste des personnes (pagination, filtres) |
| `/api/personnes/{id}`           | GET     | Détail d'une personne et ses liens        |
| `/api/liens`                    | GET     | Liste des liens (pagination, filtres)     |
| `/api/liens`                    | POST    | Soumettre un nouveau lien                 |
| `/api/liens/{id}/valider`       | POST    | Valider un lien (vrai/faux/indécis)       |
| `/api/sources`                  | GET     | Liste des sources                         |
| `/api/utilisateurs/{id}`        | GET     | Profil public avec badges                 |
| `/api/utilisateurs/{id}/badges` | GET     | Badges d'un utilisateur                   |
| `/api/export/csv`               | GET     | Export des données en CSV                 |
| `/api/export/json`              | GET     | Export des données en JSON                |

### 2.8 Authentification et sécurité

| Fonctionnalité    | Description                                  | Priorité |
| ----------------- | -------------------------------------------- | -------- |
| Inscription email | Email + mot de passe                         | MVP      |
| OAuth             | Connexion via Google, GitHub                 | Post-MVP |
| Rôles             | Contributeur, Modérateur, Administrateur     | MVP      |
| Rate limiting     | Limite de requêtes par IP et par utilisateur | MVP      |
| CAPTCHA           | Sur les formulaires de contribution          | MVP      |
| HTTPS             | Certificat Let's Encrypt                     | MVP      |

---

## 3. Spécifications techniques

### 3.1 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│              React 18 + Vite + Tailwind              │
│              D3.js (graphes interactifs)              │
├─────────────────────────────────────────────────────┤
│                  API REST (HTTPS)                    │
├─────────────────────────────────────────────────────┤
│                    BACKEND                           │
│          Node.js 20+ / Fastify 5 / Prisma            │
│            JWT + bcrypt (auth) / Zod (validation)    │
│              BullMQ (tâches async)                   │
├─────────────────┬───────────────────────────────────┤
│   PostgreSQL    │         Redis                      │
│   (données)     │   (cache + file de tâches)         │
└─────────────────┴───────────────────────────────────┘
```

### 3.2 Stack technologique

| Composant         | Technologie     | Version | Justification                                |
| ----------------- | --------------- | ------- | -------------------------------------------- |
| Runtime backend   | Node.js         | 20+     | Stack unifiée JS front+back, performance I/O |
| Framework backend | Fastify         | 5.x     | Performance, plugins, Swagger natif          |
| ORM               | Prisma          | 6.x     | Typage, migrations, client auto-généré       |
| Validation        | Zod             | 3.x     | Validation de schéma TypeScript-first        |
| Auth              | JWT + bcrypt    | 9.x     | Authentification stateless, hashage sécurisé |
| Tâches async      | BullMQ          | 5.x     | Attribution badges, export, notifications    |
| Frontend          | React           | 18+     | Écosystème graphes (D3.js), composants       |
| Build frontend    | Vite            | 5+      | Rapidité de build, HMR                       |
| CSS               | Tailwind CSS    | 3+      | Utility-first, personnalisable               |
| Graphes           | D3.js           | 7+      | Standard de visualisation de données         |
| BDD               | PostgreSQL      | 16+     | JSONB, trigrams, performances                |
| Cache             | Redis           | 7+      | Cache, sessions, broker BullMQ               |
| Serveur           | Node.js + Nginx | -       | Production-ready                             |

### 3.3 Sécurité

- **OWASP Top 10** : protection via Prisma ORM (injection SQL), @fastify/helmet (headers), validation Zod
- **Rate limiting** : @fastify/rate-limit sur les endpoints sensibles
- **Validation des entrées** : schémas Zod avec validation stricte sur chaque route
- **Mots de passe** : hashage bcrypt (12 rounds)
- **HTTPS** : obligatoire, certificat Let's Encrypt via Certbot
- **CORS** : configuration stricte pour le domaine reseauxinfluences.fr
- **Headers de sécurité** : HSTS, X-Content-Type-Options, X-Frame-Options
- **Sauvegardes** : quotidiennes automatisées (pg_dump + rotation)

### 3.4 Hébergement

- **Fournisseur** : Infomaniak Public Cloud (Suisse)
- **Justification** : souveraineté des données, énergie renouvelable, conformité RGPD
- **Configuration** :
  - VPS ou conteneurs Docker
  - PostgreSQL managé (ou auto-hébergé)
  - Redis managé
  - Domaine : reseauxinfluences.fr
  - DNS, certificat SSL, email : via Infomaniak

### 3.5 Performance

- **Cache Redis** : graphes fréquemment consultés, résultats de recherche
- **Index PostgreSQL** : trigrams pour la recherche, index composites sur les requêtes fréquentes
- **Pagination** : sur tous les endpoints de liste
- **CDN** : assets statiques (images, JS, CSS)
- **Compression** : gzip/brotli via Nginx

---

## 4. Contraintes

### 4.1 Légales

- **RGPD** : les données concernent des personnes publiques dans le cadre de leur activité publique ; les utilisateurs ont un droit de suppression de leur compte
- **Droit à l'image** : utilisation de photos publiques uniquement
- **Diffamation** : système de signalement et modération pour retirer les contenus problématiques
- **Mentions légales** : conformes au droit français

### 4.2 Éthiques

- Pas de tracking utilisateur (pas de Google Analytics)
- Pas de publicité
- Données ouvertes et exportables
- Code source ouvert (licence MIT)
- Hébergement éco-responsable

---

## 5. Critères de succès du MVP

- [ ] Un visiteur peut voir la liste des liens validés
- [ ] Un visiteur peut s'inscrire et se connecter
- [ ] Un utilisateur connecté peut valider des liens existants (vrai/faux)
- [ ] Un utilisateur ayant validé 5+ liens peut soumettre un nouveau lien
- [ ] Le graphe interactif D3.js affiche les liens validés
- [ ] Les badges sont attribués automatiquement
- [ ] La page de profil public affiche les badges et statistiques
- [ ] L'API REST est documentée et fonctionnelle
- [ ] L'export CSV/JSON est disponible
- [ ] Le site est accessible en HTTPS sur reseauxinfluences.fr
