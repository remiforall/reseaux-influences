# Brief — Audit juridique externe (levée de l'alpha fermée, ADR-010)

> **Destinataire** : avocat·e / juriste spécialisé·e **données personnelles (RGPD)** + **droit des médias / liberté d'expression**.
> **Demandeur** : Rémi Vincent — PostHack (Normandie).
> **Date** : 2026-06-06.
> **Objet** : cadrer la conformité du projet **reseauxinfluences.fr** avant toute ouverture, même restreinte. Le projet est volontairement maintenu en **alpha fermée** (aucun accès public) tant que cet audit n'a pas été rendu (ADR-010).

Ce document n'est pas une demande de validation « oui/non ». Il liste les **questions structurantes** dont les réponses conditionneront l'architecture, le périmètre des sources et la rédaction des pages légales. L'objectif est de rendre la consultation efficace et chiffrable.

---

## 1. Présentation du projet

**Nature** : plateforme collaborative (wiki-like, contributions gamifiées) de **cartographie des réseaux d'influence** entre **personnalités publiques**, **organisations** et **sites web**. Filiation revendiquée : _InfluenceNetwork_ (Owni.fr, Nicolas Kayser-Bril) — démarche de **journalisme de données / redevabilité démocratique**, pas d'investigation privée ni de surveillance d'individus.

**Finalité affichée** : éclairer l'intérêt public sur les relations d'influence (mandats, participations, financements, fonctions) à partir de **sources publiques officielles** et de **médias vérifiables**.

**Modèle de données** : entités `Personne` / `Organisation` / `SiteWeb` reliées par des `Lien` qualifiés et **datés**, avec **provenance par champ** et **audit immuable** de chaque enrichissement.

## 2. État technique et garde-fous déjà en place

Le projet n'attend pas l'audit pour appliquer une discipline RGPD ; les garde-fous suivants sont **déjà actifs en code** (et opposables comme preuve de _privacy by design_, art. 25) :

| Garde-fou                                                    | Mise en œuvre                                                                                                                                                                 | ADR          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Sources limitées à l'open data officiel + médias vérifiables | 21 connecteurs whitelistés (Wikidata, Sirene/RNE, BODACC, HATVP, RDAP, IGN, NosDéputés, OpenSanctions, ICIJ, RNA, RPPS, RSS Anticor/Cour des comptes)                         | 003, 012-016 |
| **Qualité d'influence publique obligatoire**                 | Refus d'import (HTTP 400) si le champ `qualiteInfluencePublique` (enum : ÉLU, DIRIGEANT, ARTISTE…) est vide                                                                   | 006          |
| Statut par défaut **EN_ATTENTE**                             | Aucune donnée n'est publiée automatiquement ; consensus communautaire requis (≥ 5 validations, ratio ≥ 70 %)                                                                  | 006          |
| **Audit immuable**                                           | `AuditEnrichissement` conservé même après suppression du compte contributeur (`onDelete: SetNull`) ; query expurgée des emails/téléphones, IP tronquée (minimisation, art. 5) | 008          |
| Périmètre **restreint volontairement**                       | Exclusion explicite : cadastre nominatif MAJIC, breaches/HIBP, énumération d'identifiants sociaux (maigret), reconnaissance faciale, lookup tél/IP individuels                | 003, 017     |
| Alpha fermée                                                 | `robots.txt: Disallow: /`, aucune communication publique, aucune démo                                                                                                         | 010          |

Documents techniques annexes disponibles : `ARCHITECTURE-DECISIONS.md` (18 ADR), `docs/courriers/inpi-rbe-acces-interet-legitime.md`, `docs/courriers/note-acces-cadastre-nominatif.md`.

---

## 3. Questions centrales (priorité 1)

### Q1 — Base légale du traitement

Le traitement porte sur des données personnelles de personnes **physiques** (élus, dirigeants…). Deux fondements possibles, aux régimes très différents :

- **(a) Exception « journalistique / expression » (RGPD art. 85 + LIL art. 80)** : permettrait un régime allégé (dérogations à certains droits). **Question : notre usage qualifie-t-il pour l'art. 85 ?** Cela dépend-il de la qualité des contributeurs (journalistes ? chercheurs ? grand public anonyme ?) et de la finalité (information du public vs base de données réutilisable) ?
- **(b) Intérêt légitime (art. 6.1.f)** : exige un **test de mise en balance** documenté et le respect plein des droits des personnes. **Question : est-ce le fondement le plus défendable vu le caractère collaboratif/ouvert des contributions ?**

> C'est **la** variable qui détermine toute l'architecture. Quelle est la qualification la plus sûre, et à quelles conditions ?

### Q2 — Périmètre des personnes concernées

Le garde-fou `qualiteInfluencePublique` vise les figures publiques. Mais un réseau fait inévitablement apparaître des **tiers « périphériques »** (un proche, un collaborateur non public, un membre de famille mentionné dans une source).

- Comment traiter ces tiers non publics qui apparaissent par ricochet ?
- Faut-il un seuil / un mécanisme d'exclusion automatique ? Une anonymisation des tiers périphériques ?

### Q3 — Collecte automatisée (scraping) de sources publiques

Même limité à des sources publiques officielles, l'enrichissement **automatisé** a son propre régime (la CNIL a déjà sanctionné de la collecte « sur données publiques »).

- La collecte automatisée via API officielles / open data (notre cas actuel) est-elle traitée différemment du _scraping_ de pages web publiques ?
- Quelles conditions pour rester licite (information des personnes, finalité, proportionnalité) ?
- Confirmation attendue : **réseaux sociaux exclus** (CGU + RGPD) — y a-t-il une marge, ou interdiction nette ?

---

## 4. Questions complémentaires (priorité 2)

1. **AIPD / DPIA** : le traitement est-il soumis à analyse d'impact obligatoire (probable : évaluation/notation de personnes + grande échelle) ? Quel format attendu ?
2. **Qualification du responsable de traitement** : dans un modèle collaboratif gamifié, qui est responsable — l'éditeur de la plateforme, les contributeurs, responsabilité conjointe (art. 26) ?
3. **Données « sensibles » (art. 9) et pénales (art. 10)** : opinions politiques déductibles des liens, mentions de condamnations (via Anticor, OpenSanctions, ICIJ). Quel encadrement ? Faut-il bannir certaines catégories ?
4. **Droits des personnes vs art. 85** : comment articuler droit d'opposition / effacement / rectification avec une base à visée d'archive d'intérêt public ? Procédure de contestation à prévoir ?
5. **Durée de conservation** : un lien d'influence historique (mandat passé) a-t-il une durée de conservation, ou relève-t-il de l'archive ?
6. **Mineurs** : exclusion totale, ou cas des personnalités publiques mineures ?
7. **Transferts hors UE** : architecture 100 % FR/CH visée — points de vigilance résiduels (CDN, LLM, dépendances) ?
8. **Licence du corpus** (ADR-007 à créer) : diffusion CC-BY-SA d'une base de données personnelles — compatible RGPD ? Risques de réutilisation tierce ?
9. **Mentions légales / CGU / déclaration d'accessibilité** : éléments obligatoires spécifiques à ce type de traitement.

---

## 5. Livrable attendu de l'audit

Une note permettant de **trancher la levée de l'alpha** (rédaction de l'ADR-011), précisant :

1. la **base légale retenue** et ses conditions (réponse Q1) ;
2. le **périmètre de personnes et de sources** autorisé / à exclure (Q2, Q3, §4.3) ;
3. la nécessité et le **périmètre d'une AIPD** (§4.1) ;
4. la **qualification du/des responsable(s) de traitement** (§4.2) ;
5. la **procédure droits des personnes** à implémenter (§4.4) ;
6. la **trame des pages légales** (mentions, CGU, politique de confidentialité, déclaration d'accessibilité).

## 6. Pièces fournies au/à la juriste

- Le présent brief
- `ARCHITECTURE-DECISIONS.md` (18 ADR — décisions tracées et datées)
- `docs/courriers/inpi-rbe-acces-interet-legitime.md`
- `docs/courriers/note-acces-cadastre-nominatif.md`
- Accès démo en lecture (compte alpha) sur demande, sur données de seed (Bolloré/Macron) — figures publiques, corpus de test
- Schéma de données (`backend/prisma/schema.prisma`) sur demande

---

> **Note de cadrage budget** (interne, à retirer avant envoi) : viser une consultation cadrée (les questions ci-dessus structurent le devis). Prioriser Q1 (base légale) — sans elle, le reste est indécidable. Vu le runway PostHack, envisager une première consultation courte « go/no-go + base légale » avant l'audit complet.
