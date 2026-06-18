# Dispositif anti-diffamation et présomption d'innocence

**Projet** : reseauxinfluences.fr
**Version** : cadrage v0.1 (2026-06-18)
**Statut** : **PROJET — à valider par avocat·e presse** (brief d'audit Q3). Non implémenté en code à ce jour.

> Ce document cadre un **risque pénal et civil distinct du RGPD**. L'exception journalistique de l'art. 85 RGPD rend *licite le traitement de données personnelles* (y compris sensibles et pénales) — mais elle **ne couvre en rien** la diffamation, l'atteinte à la présomption d'innocence ou le défaut de droit de réponse. Ces régimes relèvent de la **loi du 29 juillet 1881** et du **Code civil**, pas du RGPD. C'est aujourd'hui le **manque le plus critique** du projet : aucun outillage n'existe pour le couvrir.

---

## 1. Cadre juridique applicable

### 1.1. Diffamation — loi du 29 juillet 1881

- **Art. 29, al. 1** : la diffamation est « toute allégation ou imputation d'un fait qui porte atteinte à l'honneur ou à la considération de la personne ou du corps auquel le fait est imputé ». Une cartographie reliant une personne à une « affaire », un réseau offshore, une condamnation, est une **allégation de fait** susceptible de tomber sous ce texte.
- **Distinction fait / opinion** : seule l'allégation d'un **fait précis** est diffamatoire (l'opinion ou le jugement de valeur relève de l'injure, voire de la pure liberté d'expression). Un lien « X → CONDAMNATION → Y » articule un **fait** : il est dans le champ de l'art. 29.
- **Prescription courte** : l'action en diffamation se prescrit par **3 mois** à compter de la publication (art. 65 loi 1881). Sur internet, le point de départ est la **première mise en ligne** (Cass., position constante). Implication : conserver l'**horodatage de première publication** de chaque allégation est une mesure défensive directe.

### 1.2. Les deux causes d'exonération (à outiller)

- **Exception de vérité** (art. 35 loi 1881) : la preuve de la vérité du fait diffamatoire exonère. Elle est encadrée (procédure stricte, offre de preuve dans les 10 jours). En pratique, elle suppose un **sourçage solide et conservé**.
- **Bonne foi** (construction jurisprudentielle, 4 critères cumulatifs) : (1) **but légitime** (information du public sur une question d'intérêt général), (2) **absence d'animosité personnelle**, (3) **prudence et mesure dans l'expression**, (4) **enquête sérieuse / base factuelle suffisante**. C'est le **socle de défense réaliste** d'une plateforme de redevabilité : il faut le rendre démontrable par construction (sourçage, neutralité de formulation, traçabilité).

### 1.3. Présomption d'innocence — art. 9-1 du Code civil

« Chacun a droit au respect de la présomption d'innocence. » Présenter publiquement comme **coupable** une personne qui n'a pas été condamnée définitivement (mise en examen, garde à vue, simple mise en cause, poursuite en cours) engage la responsabilité civile et permet une mesure de publication d'un communiqué rectificatif, y compris en référé. **Le marquage du stade procédural n'est pas optionnel.**

### 1.4. Droit de réponse

- **Presse / général** : art. 13 de la loi de 1881.
- **Services de communication au public en ligne** : **art. 6-IV de la LCEN** (loi n° 2004-575 du 21 juin 2004) — droit de réponse spécifique en ligne, demande dans les 3 mois, insertion sous 3 jours. Une procédure dédiée doit exister sur la plateforme.

### 1.5. Articulation avec le statut éditeur/hébergeur (rappel, brief Q2)

Le degré de responsabilité dépend du statut : **hébergeur** (responsabilité atténuée, retrait après notification — art. 6-I-2 et 6-I-5 LCEN, art. 16 DSA) pour les contributions de tiers ; **éditeur** (responsabilité pleine) pour le contenu que l'exploitant produit ou organise (enrichissement auto paramétré). Le dispositif ci-dessous vaut **dans les deux cas** : il réduit le risque éditeur et facilite le retrait diligent côté hébergeur.

---

## 2. Traduction en exigences produit

Chaque exigence ci-dessous est destinée à devenir une spécification implémentable. Aucune n'est codée à ce jour.

### EX-1 — Sourçage obligatoire de toute allégation factuelle

- Tout `Lien` portant une allégation factuelle sensible (notamment `CONDAMNATION`, mais aussi tout lien issu d'OpenSanctions/ICIJ/veille presse) **doit** porter au moins une **source citable** : URL, titre, date, émetteur. Refus de validation sinon (analogue au refus HTTP 400 d'ADR-006).
- La provenance par champ existe déjà côté connecteurs ; il faut l'**imposer aussi aux liens saisis manuellement** par un contributeur.
- Conservation de la source (capture/horodatage) pour servir l'exception de vérité (art. 35) et la bonne foi.

### EX-2 — Marquage obligatoire du stade procédural (présomption d'innocence)

- Pour toute donnée pénale (art. 10 RGPD) reliée à une personne physique, un champ **statut procédural obligatoire** parmi une énumération contrôlée, par ex. :
  `SIGNALEMENT` · `ENQUETE_EN_COURS` · `MISE_EN_EXAMEN` · `RENVOI_PROCES` · `CONDAMNATION_1ERE_INSTANCE_NON_DEFINITIVE` · `CONDAMNATION_DEFINITIVE` · `RELAXE_ACQUITTEMENT` · `SANCTION_ADMINISTRATIVE` (gel d'avoirs, sanction AMF — *n'est pas une condamnation pénale*) · `NON_PRECISE`.
- **Affichage non ambigu** côté UI : jamais « condamné » par défaut. La mention par défaut en l'absence de stade établi est « mis en cause — présumé innocent ».
- Distinguer explicitement **sanction administrative** (gel Trésor/AMF) de **condamnation pénale** : ce sont des régimes différents, les confondre est diffamatoire.

### EX-3 — Distinction fait établi / allégation

- Marqueur visuel et sémantique distinguant un **fait établi** (source officielle, ex. JORF, décision publiée) d'une **allégation** (article de presse, signalement associatif). Le badge de provenance existant (ADR-013) doit porter ce niveau de qualification.
- Formulation neutre imposée (prudence et mesure — critère de bonne foi) : pas de qualificatif inutilement infamant généré par la plateforme.

### EX-4 — Droit de réponse / rectification (art. 6-IV LCEN, art. 9-1 C. civ.)

- Procédure publique de **droit de réponse** distincte de la procédure RGPD (`/mes-droits`) : une personne mise en cause peut demander l'insertion d'une réponse, traitée sous 3 jours (LCEN).
- Procédure de **rectification** : même sous régime art. 85/80 LIL, la rectification reste incontournable (brief Q8). Réutiliser le modèle `DemandeDroitPersonne` (ADR-011) en ajoutant un motif « réponse/rectification presse ».
- Traçabilité : conserver la demande, la décision et l'horodatage (preuve de diligence — atténue la responsabilité, cf. retrait diligent LCEN).

### EX-5 — Modération et retrait diligent

- File de modération sur les contenus signalés ; **retrait ou correction sans délai** après notification crédible (art. 6-I-5 LCEN, art. 16 DSA — notice-and-action).
- Mécanisme de signalement accessible et documenté (obligation DSA de base).
- Journalisation des signalements et des suites données (transparence DSA + preuve de bonne foi).

### EX-6 — Conservation des preuves (défense)

- Conserver, pour chaque allégation : source, horodatage de **première publication** (point de départ prescription art. 65), historique des modifications, décisions de modération. Cohérent avec l'audit immuable (ADR-008).

---

## 3. Risque et priorité

- **Nature** : pénale (diffamation, loi 1881) **et** civile (présomption d'innocence art. 9-1 C. civ., droit de réponse).
- **Niveau** : **élevé**, et **non couvert** aujourd'hui (aucun outillage). C'est, avec la base légale (Q1) et l'AIPD (Q4), l'un des **bloquants** de la levée d'alpha.
- **Aggravant** : les sources pénales (OpenSanctions, ICIJ, veille presse) sont précisément celles qui exposent le plus, et elles sont déjà actives en code.

---

## 4. À valider en externe

- Avocat·e **presse (loi 1881)** : libellés de stade procédural, seuil de sourçage suffisant pour la bonne foi, procédure de droit de réponse conforme (brief Q3).
- Articulation avec le statut éditeur/hébergeur (brief Q2).

> Ceci n'est pas un conseil juridique engageant. Toute mise en production des exigences ci-dessus doit être validée par un·e avocat·e spécialisé·e en droit de la presse.
