# Note d'analyse — Accès aux données cadastrales nominatives (MAJIC / Fichiers fonciers)

> Note préparatoire à valider avec un juriste spécialisé en droit fiscal et données personnelles. Cible : audit ADR-010 du projet reseaux-influences (alpha fermée).

**Date** : 2026-05-12
**Auteur** : Rémi Vincent (PostHack)
**Objectif** : cartographier les voies d'accès légales aux données cadastrales **nominatives** (propriétaires fonciers) pour le projet `reseaux-influences`.

---

## 1. Ce qui est librement accessible (déjà intégré)

| Donnée | Source | Statut |
|---|---|---|
| Géométries parcellaires | API Carto IGN, Etalab Cadastre | Open data |
| Transactions immobilières (prix, surface, type) | DVF Etalab (DGFiP) | Open data, **anonymisé** |
| Zonage urbanisme PLU/PPR | API Carto GPU (IGN) | Open data |
| Diagnostics énergétiques DPE | ADEME open data | Open data, par adresse |

Ces sources permettent de localiser, mesurer et chiffrer une parcelle, **mais jamais d'identifier nominativement son propriétaire**.

## 2. Ce qui n'est PAS librement accessible

| Donnée | Détenteur | Raison de la restriction |
|---|---|---|
| **Nom du propriétaire** d'une parcelle | DGFiP — fichier MAJIC | Secret fiscal (art. L. 103 LPF) + RGPD |
| Composition et valeur du patrimoine foncier d'une personne nominative | DGFiP — fichiers fonciers FF | Idem |
| Historique des mutations nominatives | DGFiP | Idem |

## 3. Cadre juridique de l'accès dérogatoire

L'accès au cadastre nominatif est régi par plusieurs textes superposés :

### Base légale principale

- **Article L. 107 A du Livre des procédures fiscales (LPF)** : autorise la communication des informations cadastrales nominatives **à des tiers** sous certaines conditions (limites de zone géographique, finalité légitime).
- **Article R. 107 A-1 à R. 107 A-3 du LPF** : encadrement opérationnel — demande motivée, limites quantitatives.
- **Décret n° 2018-1283 du 27 décembre 2018** : modalités de mise à disposition des fichiers fonciers anonymisés et nominatifs.
- **Article 27 de la loi n° 78-753 du 17 juillet 1978** (refondue en 2016) : accès aux documents administratifs (CADA).

### Articulation avec le RGPD

- **Article 6.1.e RGPD** : intérêt public et exercice de l'autorité publique
- **Article 85 RGPD** + **art. 80 loi 78-17** : exception journalisme/recherche
- **Article 9 RGPD** : pas concerné (les données cadastrales ne sont pas des données sensibles au sens strict)

### Jurisprudence pertinente

- **Conseil d'État, 7 juin 2019, Anticor c/ DGFiP** : reconnaissance partielle du droit d'accès des associations d'intérêt général aux fichiers fonciers, sous réserve d'anonymisation par zone.
- **CADA, avis n° 20183594 du 19 décembre 2018** : un journaliste indépendant peut accéder à des extraits MAJIC pour un cas précis et identifié, sur engagement de non-republication brute.

## 4. Quatre voies d'accès possibles

### Voie A — Demande individuelle CADA / DGFiP (recommandée pour Rémi en solo)

**Procédure** :
1. Identification d'un **cas concret précis** justifiant la demande (ex. enquête sur un dirigeant nommément cité)
2. Courrier motivé à la **Direction départementale des finances publiques (DDFiP)** de la zone concernée
3. En cas de refus : saisine de la **CADA** (Commission d'accès aux documents administratifs)
4. En cas de refus CADA : recours au Tribunal administratif

**Délai** : 2 à 6 mois selon recours
**Coût** : 0 € si demande limitée (< 100 parcelles)
**Volume** : ponctuel, pas d'extraction massive

### Voie B — Convention avec un acteur habilité

Les acteurs suivants ont déjà une convention avec la DGFiP et peuvent **redistribuer une partie des données** dans le cadre de partenariats :

- **EPF locaux** (Établissements Publics Fonciers) — accès complet, peuvent partager avec partenaires recherche
- **SAFER** (Sociétés d'Aménagement Foncier et d'Établissement Rural) — accès agricole et rural
- **Universités et laboratoires** ayant convention DGFiP — données pour la recherche scientifique
- **ANIL / ADIL** (agences info logement) — données agrégées

**Procédure** : convention de partenariat tripartite (Rémi/PostHack + acteur habilité + DGFiP)
**Délai** : 3 à 6 mois
**Coût** : variable selon partenaire, souvent gratuit pour projet d'intérêt public
**Volume** : zone géographique complète (département, région)

### Voie C — Agrégateur privé licencié

Plusieurs entreprises ont une licence DGFiP et revendent les fichiers fonciers traités :

- **Fichiers Fonciers** (CEREMA — public)
- **Pappers Pro** (avec module fonciers)
- **Doctrine** (juridique, indirect via décisions)
- **Modefi** (Modélisation Économique du Foncier)

**Coût** : 5 000 à 30 000 €/an selon volume et fraîcheur
**Avantage** : data déjà nettoyée, exploitable immédiatement
**Inconvénient** : coût rédhibitoire pour un projet personnel en alpha

### Voie D — Habilitation directe (impossible en l'état)

Réservée aux : services de l'État, certains EPCI, professionnels du foncier régulés (notaires, géomètres-experts). PostHack en tant que SARL de conseil n'est pas éligible.

## 5. Recommandation stratégique pour reseaux-influences

Vu le contexte ADR-010 (alpha fermée, mono-user, audit juridique en cours) :

### Court terme (jusqu'à l'audit ADR-010)

- **Pas de demande MAJIC**. Continuer avec les sources publiques (Cadastre + DVF + GPU + recherche-entreprises).
- La heatmap géographique de la Passe 4 reste exploitable et démonstrative sans MAJIC : géocodage des sièges sociaux + transactions DVF par zone + concentrations parcellaires d'organisations identifiées.

### Moyen terme (post-audit juridique, ouverture éventuelle alpha → bêta)

**Stratégie hybride** :

1. **Voie A pour cas ponctuels** : demande CADA quand une enquête nécessite la donnée nominative. Modèle de courrier à préparer (cf. § 6).
2. **Voie B en partenariat** : approcher un EPF local (Calvados, Normandie pour PostHack) ou un labo universitaire (par ex. Sciences Po Cevipof, IFRIS, Université de Caen) avec qui établir une convention de recherche/journalisme. Cela ouvre l'accès département complet sans coût.
3. **Voie C en dernier recours** : abonnement Pappers Pro avec module fonciers, à activer si le projet passe en mode pré-commercial et que le ROI justifie le coût.

## 6. Modèle de courrier pour Voie A (à finaliser avec juriste)

> ⚠️ Brouillon — adapter au cas précis, valider avec juriste avant envoi. Ce modèle est volontairement court et factuel ; les fonctionnaires DDFiP préfèrent les demandes circonscrites.

---

**Rémi Vincent**
PostHack — SIREN 900 477 571
7 rue des Sorbiers, 14470 Courseulles-sur-Mer
contact@posthack.com

À l'attention de
**Monsieur le Directeur départemental des finances publiques**
Service de la publicité foncière et de l'enregistrement (SPFE)
**{{adresse DDFiP du département concerné}}**

*Lettre recommandée avec accusé de réception*

{{Ville}}, le {{date}}

**Objet** : Demande de communication d'informations cadastrales nominatives au titre de l'article L. 107 A du Livre des procédures fiscales — finalité de journalisme d'intérêt public (art. 85 RGPD)

Madame, Monsieur,

Je sollicite, en ma qualité de **journaliste indépendant**, la communication d'informations cadastrales nominatives portant sur la parcelle ou les parcelles suivantes :

- **Référence cadastrale** : commune de {{commune}} (code INSEE {{insee}}), section {{section}}, parcelle(s) numéro(s) {{numéro(s)}}
- **Identifiant unique parcellaire (IDU)** : {{IDU si connu}}
- **Adresse correspondante** : {{adresse}}

Cette demande s'inscrit dans le cadre d'une enquête journalistique portant sur {{objet précis de l'enquête, par ex. « les réseaux d'influence économique de M. X, déjà cité dans Le Monde du JJ/MM/AAAA »}}. La parcelle en cause apparaît dans {{source publique : BODACC du JJ/MM, transaction DVF du JJ/MM, mention dans la presse de…}}, ce qui justifie la pertinence de l'identification de son propriétaire pour la fiabilité de l'enquête.

**Fondement juridique** :
- Article L. 107 A du Livre des procédures fiscales
- Article 85 du Règlement général sur la protection des données (UE) 2016/679
- Article 80 de la loi n° 78-17 du 6 janvier 1978 modifiée
- Avis CADA n° 20183594 du 19 décembre 2018 (accès journalistique aux fichiers fonciers)

**Engagements** :
- L'information communiquée ne sera utilisée que pour la finalité de l'enquête précitée
- Aucune republication brute de la donnée nominative ne sera effectuée
- L'information sera référencée comme « DDFiP {{département}}, courrier du JJ/MM/AAAA » dans toute publication
- La donnée sera détruite à l'issue de l'enquête, au plus tard 12 mois après communication

**Pièces jointes** :
- Pièce d'identité du demandeur
- Extrait Kbis de PostHack (SIREN 900 477 571)
- Note d'intention de l'enquête (2 pages)
- Copie de la source publique justifiant la pertinence (BODACC / article de presse / etc.)

Je vous prie d'agréer, Madame, Monsieur, l'expression de ma considération distinguée.

**Rémi Vincent**

---

## 7. Échéance et coordination

- **Avant** d'envoyer une demande Voie A : faire valider la **note d'intention de l'enquête** par le juriste (dans le cadre de l'audit ADR-010)
- Ce modèle de courrier suppose une **enquête concrète déjà lancée**, pas une demande générique d'extraction
- Délai indicatif DDFiP : 1 à 2 mois pour réponse initiale, 6 mois en cas de recours CADA

## 8. Risques et limites

- **Refus possible** : la DGFiP refuse parfois en invoquant le secret fiscal (art. L. 103 LPF). Le motif est contestable devant la CADA mais allonge les délais.
- **Restriction géographique** : la DGFiP ne communique généralement pas plus d'une zone limitée (commune ou groupe de parcelles) par demande.
- **Pas de traitement automatisé** : l'usage en base de données structurée pour cartographie est dans une zone grise. **À discuter explicitement avec le juriste** — l'usage strict pour enquête ponctuelle est protégé, l'usage pour alimentation systématique de `reseauxinfluences.fr` est plus discutable.

## Références utiles

- Texte de l'article L. 107 A LPF : https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000035179168/
- Décret 2018-1283 : https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000037873528
- Site CADA : https://www.cada.fr
- Cerema Fichiers Fonciers : https://datafoncier.cerema.fr
- Note CNIL sur le traitement de données cadastrales (2017) : disponible sur cnil.fr
