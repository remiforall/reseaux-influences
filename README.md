# Réseaux d'Influence

> Plateforme collaborative de cartographie des réseaux d'influence interpersonnels et transnationaux, avec contribution publique, vérification par sources médiatiques et gamification communautaire.

**URL** : [reseauxinfluences.fr](https://reseauxinfluences.fr)

---

## Objectif

Permettre au grand public, aux journalistes et aux chercheurs de :

- **Proposer** des liens entre personnes publiques (politiques, journalistes, économistes, etc.)
- **Valider** ces liens via des sources médiatiques vérifiées (articles, vidéos, déclarations publiques)
- **Explorer** les réseaux d'influence via des graphes interactifs
- **Exporter** les données structurées (CSV, JSON, API)

Ce projet s'inscrit dans la continuité du projet *InfluenceNetwork* développé chez Owni.fr par Nicolas Kayser-Bril, modernisé avec une stack technique contemporaine et un système de modération communautaire par gamification.

---

## Stack technique

| Composant | Technologie |
|---|---|
| **Backend** | Node.js 20+ / Fastify 5 / Prisma ORM |
| **Frontend** | React 18+ / Vite / Tailwind CSS |
| **Visualisation** | D3.js (graphes interactifs) |
| **Base de données** | PostgreSQL 16+ |
| **Cache** | Redis (ioredis) |
| **Tâches asynchrones** | BullMQ + Redis |
| **Authentification** | JWT + bcrypt |
| **Validation** | Zod |
| **Documentation API** | Swagger / OpenAPI |
| **Hébergement** | Infomaniak Public Cloud (Suisse, éco-responsable) |

---

## Fonctionnalités principales

### Contribution
- Formulaire pour ajouter un lien : Personne A → Personne B + type de lien + source médiatique
- Création de fiches de personnes publiques avec métadonnées (rôle, pays, biographie)
- Référencement de sources médiatiques vérifiées

### Modération communautaire et gamification
- **Obligation de validation** : un utilisateur doit valider au moins 5 liens existants (vrai/faux) avant de pouvoir soumettre un nouveau lien
- **Système de points** : chaque validation et soumission acceptée rapporte des points
- **Badges automatiques** attribués selon :
  - Le nombre de validations effectuées
  - Les domaines d'expertise (type de média, type de relation)
  - La précision des validations (taux de concordance avec le consensus)
- **Profil public** affichant badges, statistiques et historique des contributions
- **Niveaux** : débutant → intermédiaire → expert → modérateur

### Visualisation
- Graphe interactif D3.js : noeuds = personnes, arêtes = liens
- Filtres par nom, pays, type de lien, source, date
- Tooltips avec détails du lien et source

### API publique
- Endpoints REST : `/api/personnes`, `/api/liens`, `/api/sources`, `/api/utilisateurs/{id}/badges`
- Documentation Swagger/OpenAPI
- Export CSV et JSON

### Historique et traçabilité
- Versioning des contributions (modèle Wikipedia)
- Historique des modifications et des validations
- Signalement et modération avec traces

---

## Installation locale

### Prérequis

- Node.js 20+
- PostgreSQL 16+
- Redis

### Backend

```bash
cd backend
cp .env.example .env  # Configurer les variables d'environnement
npm install
npx prisma generate
npx prisma db push    # Créer les tables
node prisma/seed.js   # Insérer les données de référence (types de liens, badges, config)
npm run dev
```

L'API est accessible sur `http://localhost:3000` et la documentation Swagger sur `http://localhost:3000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend est accessible sur `http://localhost:5173`.

---

## Structure du projet

```
reseaux-influences/
├── README.md
├── docs/
│   ├── cahier-des-charges.md        # Cahier des charges fonctionnel et technique
│   └── plan-developpement.md        # Plan de développement hebdomadaire
├── database/
│   └── schema.sql                   # Schéma SQL de référence
├── backend/                         # API Node.js (Fastify + Prisma)
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma            # Modèles Prisma ORM
│   │   └── seed.js                  # Données de référence
│   └── src/
│       ├── server.js                # Point d'entrée Fastify
│       ├── routes/                  # Routes API REST
│       │   ├── auth.js              # Inscription, connexion, JWT
│       │   ├── personnes.js         # CRUD personnes publiques
│       │   ├── liens.js             # CRUD liens + seuil de soumission
│       │   ├── sources.js           # CRUD sources médiatiques
│       │   ├── validations.js       # Validation communautaire (vrai/faux)
│       │   ├── utilisateurs.js      # Profils publics, badges, classement
│       │   ├── graphe.js            # Données pour D3.js
│       │   └── export.js            # Export CSV / JSON
│       ├── services/
│       │   └── gamification.js      # Logique de points, badges, consensus
│       ├── middleware/
│       │   └── auth.js              # Authentification JWT
│       └── utils/
│           └── prisma.js            # Client Prisma
└── frontend/                        # React 18 + Vite + Tailwind
    ├── package.json
    └── src/
        ├── components/              # Navbar, ValidationForm, BadgeDisplay
        ├── pages/                   # Accueil, Liens, Graphe, Profil
        └── api/                     # Client API (axios)
```

---

## Contribuer

1. Forkez le dépôt
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commitez vos modifications (`git commit -m "Ajout de ma fonctionnalité"`)
4. Poussez la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

---

## Licence

MIT — libre d'utilisation, modification et distribution.

---

## Contact

Sur une idée de NXX
Relancée par Rémi Vincent** — porteur du projet 

Site : [reseauxinfluences.fr](https://reseauxinfluences.fr)

---

> Ce projet s'inscrit dans une démarche d'open data, de transparence démocratique et de souveraineté numérique.
