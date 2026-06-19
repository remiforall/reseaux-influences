# AIPD — Analyse d'Impact relative à la Protection des Données

**Projet** : reseauxinfluences.fr — plateforme collaborative de cartographie des réseaux d'influence + enrichissement OSINT multi-sources.
**Version** : brouillon v0.1 (2026-06-18)
**Statut** : **PROJET — à compléter et valider avec le DPO / l'avocat·e** (cf. ADR-010, ADR-011, brief d'audit Q4).
**Référentiel** : art. 35 RGPD ; lignes directrices **WP248 rév.01** du G29 (adoptées par l'EDPB) ; guide PIA de la CNIL (méthode + bases de connaissances).

> Avertissement : ce document est une **trame** pré-remplie par les éléments connus en interne. Les sections marquées **[À COMPLÉTER — DPO/avocat·e]** appellent une expertise externe. Il n'est ni une AIPD finalisée ni un conseil juridique engageant. Il constitue la matière à soumettre au/à la juriste (brief Q4).

---

## 0. Pourquoi une AIPD est (très probablement) obligatoire

L'art. 35.1 RGPD impose une AIPD lorsqu'un traitement est « susceptible d'engendrer un risque élevé pour les droits et libertés des personnes physiques ». Les WP248 listent 9 critères ; **2 suffisent** à présumer l'obligation. Le traitement en réunit au moins **quatre** :

1. **Évaluation ou notation** (scoring) : agrégation et qualification de liens d'influence, score de confiance.
2. **Données sensibles ou hautement personnelles** : opinions politiques (art. 9.1 RGPD) et données pénales (art. 10 RGPD) — voir §3.
3. **Données traitées à grande échelle**.
4. **Croisement / combinaison d'ensembles de données** issus de 25 sources hétérogènes.
   S'y ajoute, par ricochet, le traitement de **personnes vulnérables / tiers non consentants** (nœuds périphériques, §5).

**Conclusion provisoire** : AIPD **obligatoire** (art. 35). À confirmer (brief Q4). Si le risque résiduel demeure **élevé** après mesures, **consultation préalable de la CNIL obligatoire** (art. 36 RGPD) — voir §8.

---

## 1. Description systématique du traitement (art. 35.7.a)

### 1.1. Finalité

Éclairer l'intérêt public sur les relations d'influence (mandats, participations, financements, fonctions, liens capitalistiques) entre **personnalités publiques**, **organisations** et **sites web**, à des fins de **journalisme de données et de redevabilité démocratique** (filiation InfluenceNetwork / Owni.fr).

### 1.2. Base légale

**Art. 85 RGPD + art. 80 de la loi n° 78-17 du 6 janvier 1978** (régime dérogatoire « journalisme et expression »). **L'intérêt légitime (art. 6.1.f) n'est pas retenu** car insuffisant à lever l'interdiction de l'art. 9 et la réserve de l'art. 10. Voir **ADR-026**. **[À COMPLÉTER — confirmation avocat·e, brief Q1]**.

### 1.3. Acteurs et rôles

- **Responsable de traitement** : Rémi Vincent / PostHack (à confirmer en cas de coresponsabilité art. 26 avec les contributeurs — **[À COMPLÉTER — brief Q2]**).
- **Contributeurs** : saisie de liens (statut éditeur/hébergeur à border, brief Q2).
- **Sous-traitants** (art. 28) : hébergeur Infomaniak (FR/CH). **[À COMPLÉTER — DPA Infomaniak à joindre]**.
- **Sources tierces** : 25 connecteurs open data / médias (voir `ARCHITECTURE-DECISIONS.md`).

### 1.4. Flux de données

Recherche multi-connecteurs → prévisualisation → import en `EN_ATTENTE` (jamais `VALIDE` auto) → validation par consensus communautaire (≥ 5 validations, ratio ≥ 70 %) → affichage. Chaque enrichissement est tracé dans `AuditEnrichissement` (immuable, ADR-008).

### 1.5. Cycle de vie et durées de conservation

**[À COMPLÉTER — DPO]** : politique de conservation par catégorie (`docs/juridique/politique-conservation.md`, ADR-011). Question ouverte : un mandat passé relève-t-il de l'archive d'intérêt public (durée longue) ou doit-il être purgé (brief Q8) ?

---

## 2. Évaluation de la nécessité et de la proportionnalité (art. 35.7.b)

| Principe                                    | Mise en œuvre actuelle                                                                                                                                                    | Évaluation                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **Limitation des finalités** (art. 5.1.b)   | Finalité unique documentée (cartographie d'influence). Risque de **changement de finalité** par recombinaison (art. 6.4)                                                  | **[À COMPLÉTER — brief Q7]** |
| **Minimisation** (art. 5.1.c)               | `CHAMPS_AUTORISES` en liste blanche à l'import ; pas d'énumération d'identifiants individuels (ADR-017 §3) ; bénéficiaires personnes physiques masqués côté FTS (ADR-024) | Satisfaisant, à documenter   |
| **Exactitude** (art. 5.1.d)                 | Provenance par champ + horodatage + score de confiance ; statut `EN_ATTENTE` ; droit de rectification (incontournable même sous art. 80, §6)                              | Satisfaisant                 |
| **Limitation de conservation** (art. 5.1.e) | **[À COMPLÉTER — politique de conservation]**                                                                                                                             | Non finalisé                 |
| **Licéité** (art. 6, 9, 10)                 | Art. 85 RGPD + art. 80 LIL (ADR-026)                                                                                                                                      | À confirmer (brief Q1)       |

---

## 3. Catégories de données — isolement des données sensibles et pénales

### 3.1. Données « ordinaires » (personnes physiques publiques)

Identité publique, fonctions, mandats, participations, fonctions dirigeantes, lieu de naissance/coordonnées géographiques (Wikidata P19/P625), liens datés.

### 3.2. Données SENSIBLES — art. 9.1 RGPD (opinions politiques)

- **Stockées** : `TypeLien.PARTI_POLITIQUE` (`schema.prisma` l. 169) ; déclarations d'intérêts HATVP ; affiliations parlementaires (NosDéputés) ; inscriptions au registre de transparence UE.
- **Déduites** : une couleur politique inférée d'un faisceau de liens relève **aussi** de l'art. 9 (CJUE C-252/21).
- **Régime** : interdiction de principe (art. 9.1), levée par l'art. 85 RGPD + art. 80 LIL « dans la mesure nécessaire ».

### 3.3. Données PÉNALES — art. 10 RGPD (condamnations et infractions)

- `TypeLien.CONDAMNATION` (`schema.prisma` l. 525) ; gels d'avoirs Trésor/AMF (OpenSanctions) ; mentions ICIJ ; veille presse anti-corruption (Anticor, Cour des comptes).
- **Régime** : traitement réservé (art. 10), admis ici via art. 85 RGPD + art. 80 LIL.
- **Risque spécifique** : confusion entre _sanction administrative_ (gel d'avoirs), _poursuite en cours_ et _condamnation définitive_ → croise directement le risque presse (présomption d'innocence, §5 et `docs/dispositif-anti-diffamation.md`).

### 3.4. Catégories EXCLUES (par construction)

Cadastre nominatif MAJIC, breaches/HIBP, énumération d'identifiants sociaux, reconnaissance faciale, lookup tél/IP individuels (ADR-003, 017, 018) ; bénéficiaires personnes physiques de fonds UE masqués (ADR-024) ; dirigeants d'associations absents du RNA (ADR-014).

---

## 4. Sources et licéité de la réutilisation

**[À COMPLÉTER — brief Q7]**. Point de vigilance : les licences sont **hétérogènes** — Licence Ouverte/Etalab pour l'open data FR, mais **CC BY-NC 4.0** pour OpenSanctions et conditions propres pour ICIJ. La recombinaison dans un corpus potentiellement rediffusé pose une question de compatibilité de licences distincte du RGPD (et de l'ADR-007 licence corpus, à créer).

---

## 5. Risques pour les droits et libertés des personnes (art. 35.7.c)

| Risque                                    | Description                                                                               | Gravité × Vraisemblance (à coter)                              |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Profilage politique**                   | Inférence d'opinions politiques (art. 9) par recombinaison de liens                       | **[À COTER — DPO]** — _a priori_ élevé                         |
| **Réidentification de tiers**             | Nœuds périphériques non publics identifiables par ricochet (proche, collaborateur)        | **[À COTER]** — maillon faible de la défense art. 85           |
| **Atteinte à la présomption d'innocence** | Personne présentée comme coupable avant condamnation définitive (art. 9-1 C. civ.)        | **[À COTER]** — élevé, hors champ RGPD, voir dispositif dédié  |
| **Diffamation**                           | Allégation factuelle inexacte/non sourcée portant atteinte à l'honneur (art. 29 loi 1881) | **[À COTER]** — hors champ RGPD                                |
| **Erreur d'homonymie**                    | Rattachement d'une donnée pénale à la mauvaise personne                                   | Atténué (matching strict, pas de fuzzy par nom seul — ADR-013) |
| **Détournement d'usage**                  | Réutilisation des exports à des fins de surveillance/harcèlement                          | **[À COTER]** — encadrement CGU + voir mentions légales        |
| **Effet « casier permanent »**            | Conservation indéfinie de faits anciens (droit à l'oubli vs archive)                      | **[À COMPLÉTER — politique de conservation, brief Q8]**        |

---

## 6. Mesures existantes et mesures à ajouter (art. 35.7.d)

### 6.1. Mesures déjà en place (opposables — privacy by design, art. 25)

- **`qualiteInfluencePublique` obligatoire** à l'import (ADR-006) — refus HTTP 400 si vide.
- **Statut `EN_ATTENTE` par défaut** ; pas de publication auto ; **consensus communautaire** (≥ 5 validations, ratio ≥ 70 %).
- **Audit immuable** `AuditEnrichissement` (ADR-008) — `onDelete: SetNull`, créé dans la transaction.
- **Minimisation** : query expurgée des emails/téléphones, **IP tronquée**, hash sur la query en cache (pas de PII en cache disque).
- **Matching strict** (pas de fuzzy par nom seul) anti-homonymie (ADR-013).
- **Sources whitelistées** ; scraping gelé (ADR-019) ; leaks « gris » désactivés (ADR-013).
- **Alpha fermée** : `robots.txt: Disallow: /` (ADR-010, 011).
- **Procédure droits des personnes** opérationnelle (`DemandeDroitPersonne`, route `/api/droits`, page `/mes-droits` — ADR-011).

### 6.2. Mesures à ajouter / à finaliser

- **Dispositif anti-diffamation / présomption d'innocence** : marquage du stade procédural, sourçage obligatoire, droit de réponse (`docs/dispositif-anti-diffamation.md`) — **à implémenter**.
- **Pseudonymisation des nœuds périphériques** sans `qualiteInfluencePublique` — **[À ARBITRER — brief Q6]**.
- **Politique de conservation** chiffrée par catégorie — **[À COMPLÉTER]**.
- **Information des personnes** (art. 14 RGPD), aménagée sous art. 80 LIL — **[À COMPLÉTER]**.
- **DPA Infomaniak** à formaliser et joindre (art. 28).

### 6.3. Articulation art. 85 / droits fondamentaux

La mise en balance impose de documenter l'équilibre entre la **liberté d'expression et d'information** (art. 11 de la Charte des droits fondamentaux de l'UE ; art. 10 CEDH) et le **droit à la vie privée et à la protection des données** (art. 7 et 8 de la Charte ; art. 8 CEDH). **[À COMPLÉTER — avocat·e]**.

---

## 7. Avis des parties prenantes (art. 35.9)

- **DPO** : avis requis (art. 35.2) — **[À RECUEILLIR]** (DPO externe à désigner ?).
- **Personnes concernées / leurs représentants** : avis « le cas échéant » — non recueilli au stade alpha ; à documenter.

---

## 8. Conclusion et suites

- **Risque résiduel après mesures** : **[À COTER — DPO/avocat·e]**.
- Si **élevé** → **consultation préalable de la CNIL obligatoire (art. 36 RGPD)** avant toute mise en œuvre (= avant levée d'alpha). Délai indicatif CNIL : jusqu'à 8 semaines, prolongeable.
- Si **acceptable** → levée d'alpha possible sous réserve des autres prérequis (ADR-011) et du verdict art. 85 (brief Q1).

**Réexamen** : l'AIPD doit être réexaminée à chaque évolution du périmètre des sources ou des finalités (art. 35.11).

---

> Document de travail interne — ni AIPD finalisée, ni conseil juridique engageant. À soumettre au/à la juriste (brief Q4) et au DPO.
