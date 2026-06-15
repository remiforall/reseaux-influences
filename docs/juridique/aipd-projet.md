# AIPD — Analyse d'Impact relative à la Protection des Données (PROJET)

> **⚠️ STATUT : PROJET — à valider par juriste spécialisé·e (RGPD + droit des médias).**
> Ce brouillon suit la trame CNIL (méthode PIA en 4 volets). Il sert de **matière pour l'audit juridique externe** (ADR-010 → ADR-011) et n'est ni publié, ni opposable, tant que la base légale (brief Q1) n'est pas tranchée.
>
> **Responsable de traitement** : Rémi Vincent — PostHack (Normandie). _(Qualification à confirmer : éditeur seul, ou responsabilité conjointe art. 26 vu le modèle collaboratif — brief §4.2.)_
> **Date** : 2026-06-15. **Version** : 0.1 (projet).
> **Référence projet** : `reseauxinfluences.fr` — cartographie collaborative des réseaux d'influence.

---

## Pourquoi une AIPD est probablement obligatoire

Le traitement réunit plusieurs critères CNIL déclenchant une AIPD (≥ 2 suffisent) :

- **Évaluation/scoring** de personnes (qualification d'influence, agrégation de liens) ;
- **Traitement à grande échelle** de données relatives à des personnes physiques ;
- **Croisement de données** issues de sources multiples (21 connecteurs) ;
- **Données potentiellement sensibles** déductibles (opinions politiques via mandats/liens — art. 9) ou pénales (mentions via Anticor/OpenSanctions/ICIJ — art. 10) ;
- **Personnes vulnérables** possibles (tiers périphériques non publics apparaissant par ricochet).

→ Périmètre exact de l'AIPD à confirmer par le juriste (brief §4.1).

---

## Volet 1 — Description du traitement

### 1.1 Finalités

Éclairer l'**intérêt public** sur les relations d'influence (mandats, participations, financements, fonctions) entre **personnalités publiques**, **organisations** et **sites web**, à partir de **sources publiques officielles** et de **médias vérifiables**. Démarche de **journalisme de données / redevabilité démocratique** (filiation revendiquée : _InfluenceNetwork_, Owni.fr).

**Hors finalité** (exclusions actées) : surveillance d'individus privés, investigation privée, profilage commercial, reconnaissance faciale, énumération d'identifiants sociaux, lookup téléphone/IP individuels (ADR-003, ADR-017 §3).

### 1.2 Catégories de données

| Catégorie                      | Exemples                                                      | Source                          |
| ------------------------------ | ------------------------------------------------------------- | ------------------------------- |
| Identité publique              | nom, fonction, mandat, qualité d'influence                    | Wikidata, HATVP, Sirene/RNE     |
| Liens d'influence              | type de lien daté, intensité, direction                       | contributions + connecteurs     |
| Données économiques            | participations, dirigeance, BODACC                            | Sirene/RNE, BODACC, DVF         |
| Géographiques                  | siège, lieu de naissance, parcelle cadastrale (non nominatif) | IGN/BAN, IGN cadastre           |
| Sensibles déductibles (art. 9) | opinions politiques (via mandats/liens)                       | déduction, non collecte directe |
| Pénales (art. 10)              | mentions sanctions, signalements                              | OpenSanctions, ICIJ, Anticor    |
| Contributeurs (comptes)        | email, pseudo, IP tronquée, activité                          | inscription plateforme          |
| Demandes de droits             | nom revendiqué, email contact, IP tronquée                    | formulaire `/mes-droits`        |

### 1.3 Personnes concernées

- **Cible** : personnalités publiques (élus, dirigeants, lobbyistes, artistes…) — garde-fou `qualiteInfluencePublique` obligatoire (ADR-006).
- **Périphériques** : tiers non publics apparaissant par ricochet (proches, collaborateurs, famille) — **traitement à trancher (brief Q2)**, gelé par ADR-011.
- **Contributeurs** : utilisateurs inscrits.
- **Demandeurs** : personnes exerçant leurs droits.

### 1.4 Destinataires

- Phase actuelle : **Rémi Vincent uniquement** (alpha fermée).
- Phase ouverte (post-audit) : public, pour les seules fiches `VALIDE` (consensus communautaire ≥ 5 validations, ratio ≥ 70 %).
- Modérateurs/admins : accès aux demandes de droits et aux entités `EN_ATTENTE`.

### 1.5 Durées de conservation

Voir `politique-conservation.md`. Synthèse : liens d'influence historiques relèvent potentiellement de l'**archive d'intérêt public** (durée longue à justifier) ; données techniques (IP tronquée, logs) en minimisation courte.

### 1.6 Processus & supports

- Backend Fastify 5 + Prisma 6, base MySQL/MariaDB, hébergement **Infomaniak (FR/CH)**.
- Enrichissement via 21 connecteurs (API officielles), cache disque chiffrable, **zéro CDN, zéro tracker, pas de transfert hors UE** (à vérifier : dépendances, futur LLM local Ollama — ADR-018).

---

## Volet 2 — Proportionnalité et nécessité

| Principe                      | Mise en œuvre actuelle                                             | Reste à statuer                                                                |
| ----------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| **Base légale** (art. 6)      | —                                                                  | **Q1 brief : art. 85 (journalisme) vs 6.1.f (intérêt légitime).** Déterminant. |
| **Minimisation** (art. 5.1.c) | provenance par champ, IP tronquée, pas de pièce d'identité stockée | seuil d'exclusion des tiers périphériques (Q2)                                 |
| **Exactitude** (art. 5.1.d)   | consensus ≥ 5 validations, signalement, procédure de rectification | —                                                                              |
| **Limitation finalités**      | qualité d'influence obligatoire, exclusions ADR-003/017            | licence corpus (ADR-007 à créer)                                               |
| **Information** (art. 12-14)  | pages légales en projet, page `/mes-droits`                        | modalités d'information des personnes non inscrites                            |
| **Droits** (art. 15-21)       | ✅ procédure `/api/droits` + `/mes-droits` livrée                  | articulation avec art. 85 (Q4 brief)                                           |

---

## Volet 3 — Risques pour les droits et libertés

| Risque                                     | Impact | Mesures en place                                                             | Mesures à renforcer                                        |
| ------------------------------------------ | ------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Atteinte à la réputation / diffamation** | Élevé  | sources vérifiables, consensus, droit d'opposition, signalement DIFFAMATOIRE | charte de modération, procédure de contestation formalisée |
| **Requalification illégitime d'un privé**  | Élevé  | `qualiteInfluencePublique` obligatoire, statut `EN_ATTENTE` par défaut       | détection automatique des tiers périphériques (Q2)         |
| **Accès illégitime aux données**           | Moyen  | JWT, rôles, helmet, rate-limit, anti-SSRF                                    | audit sécurité externe avant ouverture                     |
| **Réutilisation tierce du corpus**         | Moyen  | alpha fermée, robots `Disallow:/`                                            | licence + clause RGPD réutilisation (ADR-007)              |
| **Données sensibles/pénales** (art. 9/10)  | Élevé  | restreintes à des sources officielles publiques                              | cadrage juridique de l'admissibilité (brief §4.3)          |
| **Perte/altération**                       | Faible | audit immuable, sauvegardes                                                  | politique de sauvegarde documentée                         |

---

## Volet 4 — Validation

- **Avis DPO** : _(PostHack n'a pas de DPO désigné — à statuer : désignation nécessaire ?)_
- **Avis juriste externe** : **en attente** (objet de l'audit, brief 2026-06-06).
- **Décision RT** : ouverture conditionnée à ADR-020 (après audit).
- **Réexamen** : à chaque extension de périmètre de sources (nouvelle passe de connecteurs) ou évolution jurisprudentielle CNIL sur la collecte de données publiques.

---

> **Prochaine étape** : soumettre ce projet d'AIPD au/à la juriste avec le brief et l'`ARCHITECTURE-DECISIONS.md`. Prioriser la réponse Q1 (base légale) — sans elle, les volets 2 et 4 restent indécidables.
