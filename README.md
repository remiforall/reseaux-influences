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
| **Backend** | Python 3.12+ / Django 5.x / Django REST Framework |
| **Frontend** | React 18+ / Vite / Tailwind CSS |
| **Visualisation** | D3.js (graphes interactifs) |
| **Base de données** | PostgreSQL 16+ |
| **Cache** | Redis |
| **Tâches asynchrones** | Celery + Redis |
| **Authentification** | Django Allauth (email + OAuth) |
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

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+
- Redis

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Configurer les variables d'environnement
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Base de données

```bash
# Créer la base PostgreSQL
createdb reseaux_influences
# Appliquer le schéma
psql reseaux_influences < database/schema.sql
```

---

## Structure du projet

```
reseaux-influences/
├── README.md
├── docs/
│   ├── cahier-des-charges.md      # Cahier des charges fonctionnel et technique
│   ├── plan-developpement.md      # Plan de développement hebdomadaire
│   └── architecture.md            # Architecture technique
├── database/
│   └── schema.sql                 # Schéma SQL complet
├── backend/                       # Projet Django
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/                    # Configuration Django
│   ├── personnes/                 # App Django : personnes publiques
│   ├── liens/                     # App Django : liens d'influence
│   ├── sources/                   # App Django : sources médiatiques
│   ├── utilisateurs/              # App Django : utilisateurs et gamification
│   └── validations/               # App Django : validations communautaires
└── frontend/                      # Projet React + Vite
    ├── package.json
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── api/
    └── public/
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

**Rémi Vincent** — Designer et initiateur du projet
Site : [reseauxinfluences.fr](https://reseauxinfluences.fr)

---

> Ce projet s'inscrit dans une démarche d'open data, de transparence démocratique et de souveraineté numérique.
