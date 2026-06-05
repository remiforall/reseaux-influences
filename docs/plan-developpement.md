# Plan de développement hebdomadaire

## Réseaux d'Influence — MVP en 6 semaines

**Début estimé** : Mars 2026
**Objectif** : Plateforme fonctionnelle déployée sur reseauxinfluences.fr

---

## Semaine 1 — Fondations et modèles de données

### Objectifs

Mettre en place l'environnement de développement et les modèles de base.

### Tâches

- [ ] Initialiser le projet Django (config, settings, apps)
- [ ] Initialiser le projet React (Vite, Tailwind CSS, structure)
- [ ] Configurer PostgreSQL local et appliquer le schéma SQL
- [ ] Créer les modèles Django : `Personne`, `Source`, `TypeLien`, `Lien`
- [ ] Créer les sérialiseurs DRF pour chaque modèle
- [ ] Configurer l'admin Django pour la gestion manuelle des données
- [ ] Créer les migrations Django
- [ ] Insérer les données de référence (types de liens)
- [ ] Tester localement : création et lecture de personnes et liens via l'admin

### Livrables

- Projet Django fonctionnel avec modèles et admin
- Projet React initialisé avec Tailwind CSS
- Base PostgreSQL opérationnelle avec schéma complet

---

## Semaine 2 — Interface de contribution et liste des liens

### Objectifs

Permettre la contribution et l'affichage des données via le frontend.

### Tâches

- [ ] Créer les endpoints API REST : `GET/POST /api/personnes`, `GET/POST /api/liens`, `GET /api/sources`
- [ ] Créer la page d'accueil React (présentation du projet, statistiques globales)
- [ ] Créer le formulaire de contribution (ajout d'un lien entre deux personnes)
- [ ] Créer le formulaire d'ajout de personne (avec auto-complétion sur les noms existants)
- [ ] Créer la page de liste des liens (avec statut, source, type)
- [ ] Ajouter les filtres de base : par nom, pays, type de lien
- [ ] Ajouter la pagination sur les listes
- [ ] Connecter le frontend à l'API Django (axios ou fetch)

### Livrables

- Formulaire de contribution fonctionnel
- Page de liste des liens avec filtres
- Communication frontend ↔ backend opérationnelle

---

## Semaine 3 — Visualisation interactive (graphe D3.js)

### Objectifs

Offrir une représentation visuelle interactive des réseaux d'influence.

### Tâches

- [ ] Créer l'endpoint API pour les données du graphe (`/api/graphe` : noeuds + arêtes)
- [ ] Intégrer D3.js dans le projet React
- [ ] Créer le composant `GrapheInfluence` : force-directed layout
- [ ] Implémenter les noeuds (personnes) avec taille proportionnelle au nombre de liens
- [ ] Implémenter les arêtes (liens) avec couleur par type de lien
- [ ] Ajouter le zoom, le pan et le drag des noeuds
- [ ] Ajouter les tooltips au survol (type de lien, source, score de confiance)
- [ ] Ajouter les filtres visuels (par type de lien, par pays)
- [ ] Tester avec un jeu de données fictif (20-30 personnes, 50-80 liens)

### Livrables

- Graphe interactif D3.js fonctionnel
- Filtres visuels opérationnels
- Jeu de données de test

---

## Semaine 4 — Authentification, modération et gamification

### Objectifs

Mettre en place le système d'utilisateurs, la modération communautaire et la gamification.

### Tâches

- [ ] Configurer Django Allauth (inscription email + connexion)
- [ ] Créer les modèles `Utilisateur` et `Validation` avec les champs de gamification
- [ ] Créer l'endpoint de validation : `POST /api/liens/{id}/valider` (vrai/faux/indécis)
- [ ] Implémenter le blocage de soumission si < 5 validations
- [ ] Créer le composant React de validation (boutons vrai/faux/indécis + commentaire)
- [ ] Afficher le compteur de progression vers le seuil de soumission
- [ ] Implémenter les triggers PostgreSQL : mise à jour des compteurs, consensus automatique
- [ ] Créer les modèles `Badge` et `UtilisateurBadge`
- [ ] Implémenter l'attribution automatique des badges (tâche Celery ou signal Django)
- [ ] Créer la page de profil public : pseudo, badges, statistiques, historique
- [ ] Créer les pages d'inscription et de connexion (frontend)
- [ ] Ajouter la gestion des rôles (contributeur, modérateur, admin)

### Livrables

- Système d'authentification complet
- Validation communautaire fonctionnelle
- Attribution automatique des badges
- Page de profil public avec badges et statistiques

---

## Semaine 5 — API publique, export et documentation

### Objectifs

Exposer les données via une API documentée et permettre l'export.

### Tâches

- [ ] Finaliser tous les endpoints REST avec pagination et filtres
- [ ] Ajouter l'endpoint `/api/utilisateurs/{id}/badges`
- [ ] Implémenter l'export CSV (liens, personnes, sources)
- [ ] Implémenter l'export JSON structuré
- [ ] Configurer Swagger/OpenAPI via drf-spectacular
- [ ] Ajouter le rate limiting sur les endpoints (django-ratelimit)
- [ ] Ajouter le CAPTCHA sur les formulaires de contribution (hCaptcha ou Turnstile)
- [ ] Créer la page de documentation API (frontend)
- [ ] Ajouter les filtres avancés : par pays, type de lien, score de confiance, date
- [ ] Tester l'API avec des requêtes curl et via la documentation Swagger

### Livrables

- API REST complète et documentée (Swagger)
- Export CSV/JSON fonctionnel
- Rate limiting et CAPTCHA actifs

---

## Semaine 6 — Optimisation, tests, déploiement

### Objectifs

Stabiliser, sécuriser et déployer la plateforme.

### Tâches

- [ ] Écrire les tests unitaires Django (modèles, vues, sérialiseurs)
- [ ] Écrire les tests pour le système de gamification (attribution badges, consensus)
- [ ] Écrire les tests frontend (React Testing Library)
- [ ] Optimiser les requêtes PostgreSQL (EXPLAIN ANALYZE sur les requêtes fréquentes)
- [ ] Configurer Redis pour le cache (graphes, résultats de recherche)
- [ ] Configurer Celery pour les tâches asynchrones (badges, export, notifications)
- [ ] Configurer Nginx + Gunicorn pour la production
- [ ] Configurer HTTPS (Let's Encrypt via Certbot)
- [ ] Configurer les headers de sécurité (HSTS, CSP, X-Frame-Options)
- [ ] Déployer sur Infomaniak Public Cloud
- [ ] Configurer le DNS pour reseauxinfluences.fr
- [ ] Configurer les sauvegardes automatiques (pg_dump quotidien)
- [ ] Tester en conditions réelles (création de comptes, contribution, validation)
- [ ] Mettre à jour le README avec les instructions de déploiement

### Livrables

- Plateforme déployée et accessible sur reseauxinfluences.fr
- Tests unitaires passants
- HTTPS actif, headers de sécurité configurés
- Sauvegardes automatiques opérationnelles

---

## Post-MVP — Évolutions prévues

### Semaine 7-8 : Améliorations UX

- Carte géographique des liens (par pays) avec Leaflet ou Mapbox
- Historique des modifications (versioning type Wikipedia)
- Système de notification (email, in-app)
- Recherche avancée avec suggestions et auto-complétion

### Semaine 9-10 : Communauté

- Système de vote communautaire (en plus de la validation vrai/faux)
- Tableau de bord des meilleurs contributeurs (leaderboard)
- Newsletter hebdomadaire des nouveaux liens validés
- Intégration OAuth supplémentaire (France Connect, etc.)

### Semaine 11-12 : Données et interopérabilité

- Import/export Wikidata
- Intégration avec des bases de données publiques (data.gouv.fr, OpenCorporates)
- API GraphQL (en complément de REST)
- Internationalisation (i18n) : anglais, espagnol

---

## Métriques de suivi

| Métrique              | Objectif Semaine 6     |
| --------------------- | ---------------------- |
| Personnes référencées | 50+ (données de test)  |
| Liens créés           | 100+ (données de test) |
| Utilisateurs inscrits | 5+ (équipe de test)    |
| Tests unitaires       | 80%+ de couverture     |
| Temps de réponse API  | < 200ms                |
| Score Lighthouse      | > 80                   |
| Disponibilité         | 99%+                   |
