# Politique de conservation des données (PROJET)

> **⚠️ STATUT : PROJET — durées à valider par juriste (RGPD + droit des médias).**
> Prérequis de levée de l'alpha (ADR-010 → ADR-011, prérequis A.4). Les durées proposées dépendent de la base légale retenue (brief Q1) : un régime **art. 85 (archive d'intérêt public)** justifie des durées longues pour les liens d'influence historiques, là où un régime **art. 6.1.f** impose une révision périodique plus stricte.
>
> **Date** : 2026-06-15. **Version** : 0.1 (projet).

---

## Principe

Minimisation (art. 5.1.c) et limitation de la conservation (art. 5.1.e) : chaque catégorie a une durée justifiée par sa finalité. Les données d'influence à valeur historique (mandat passé, participation ancienne) relèvent potentiellement de l'**archivage d'intérêt public** (art. 89) — durée longue, mais **traçable et justifiée**, pas indéfinie par défaut.

---

## Durées proposées (à valider)

| Catégorie                                          | Durée proposée                                                             | Justification                                    | Dépend de Q1 ?       |
| -------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ | -------------------- |
| **Liens d'influence `VALIDE`** (entités publiques) | Conservation longue / archive d'intérêt public, **revue tous les 3 ans**   | valeur documentaire et historique                | **Oui** (art. 85/89) |
| **Entités `EN_ATTENTE`** non validées              | **12 mois** puis purge si pas de consensus                                 | données non vérifiées, pas de finalité d'archive | Non                  |
| **Entités `REJETE`**                               | **6 mois** (trace anti-resoumission) puis purge                            | éviter le re-spam, sans conserver l'info écartée | Non                  |
| **Comptes contributeurs actifs**                   | durée du compte + **24 mois** d'inactivité → notification puis suppression | gestion de la communauté                         | Non                  |
| **`AuditEnrichissement`** (trace immuable)         | **3 ans** (accountability art. 5.2)                                        | preuve d'application des garde-fous              | Non                  |
| **Demandes de droits** (`DemandeDroitPersonne`)    | **3 ans** après clôture                                                    | preuve du traitement de la demande (art. 12)     | Non                  |
| **IP tronquées / logs techniques**                 | **12 mois** max                                                            | sécurité, anti-abus                              | Non                  |
| **Signalements**                                   | durée de l'entité concernée + **12 mois**                                  | suivi de modération                              | Non                  |
| **Données sensibles/pénales** (art. 9/10)          | **à statuer** — possiblement durée réduite ou exclusion                    | régime renforcé                                  | **Oui** (brief §4.3) |

---

## Mécanismes

- **Purge automatique** : tâche planifiée (cron) à implémenter pour `EN_ATTENTE > 12 mois` et `REJETE > 6 mois`. _(non encore codé — à faire avant ouverture)_
- **Droit à l'effacement** (art. 17) : traité via `/mes-droits` → `DemandeDroitPersonne` (EFFACEMENT), arbitré au cas par cas vs intérêt public (art. 17.3.a / art. 85).
- **Anonymisation vs suppression** : pour les tiers périphériques (Q2), privilégier l'**anonymisation** plutôt que la suppression du lien quand le nœud public reste pertinent.

---

> **À trancher avec le juriste** : (1) la durée d'archive des liens `VALIDE` ; (2) le sort des données art. 9/10 ; (3) la nécessité d'une purge plus agressive sous régime art. 6.1.f. Une fois validé, créer la tâche cron de purge et référencer cette politique dans `/politique-confidentialite`.
