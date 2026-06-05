# Courrier modèle — Demande d'accès au Registre des Bénéficiaires Effectifs (RBE)

> ⚠️ **Brouillon à valider avec un juriste** avant envoi. Adapter dates, paragraphes en gras, et compléter les sections `{{...}}`. Joindre les pièces justificatives listées en bas.

---

**Rémi Vincent**
PostHack — SIREN 900 477 571
7 rue des Sorbiers
14470 Courseulles-sur-Mer
contact@posthack.com
+33 {{téléphone}}

À l'attention de
**Madame, Monsieur le Délégué à la Protection des Données**
**Institut national de la propriété industrielle (INPI)**
Service du Registre national des entreprises — Bénéficiaires effectifs
15 rue des Minimes
92677 Courbevoie Cedex

*Envoyé par lettre recommandée avec accusé de réception et copie électronique à `dpo@inpi.fr`*

Courseulles-sur-Mer, le {{date du jour}}

---

**Objet** : Demande d'accès au Registre des Bénéficiaires Effectifs au titre de l'intérêt légitime journalistique (art. L. 561-46 et L. 561-46-1 du Code monétaire et financier ; arrêt CJUE C-37/20 et C-601/20 du 22 novembre 2022)

**Référence** : Aucune (première demande)

---

Madame, Monsieur,

Je sollicite, en ma qualité de **journaliste indépendant et porteur d'un projet de recherche d'intérêt public**, un accès au Registre des Bénéficiaires Effectifs (RBE) tenu par l'INPI, conformément à l'article L. 561-46-1 du Code monétaire et financier dans sa rédaction issue de l'ordonnance n° 2020-115 du 12 février 2020, telle qu'interprétée à la lumière de l'arrêt de la Cour de justice de l'Union européenne du 22 novembre 2022 (affaires jointes C-37/20 et C-601/20).

## 1. Identification du demandeur

Je suis **Rémi Vincent**, gérant de la société **PostHack** (SIREN 900 477 571), entreprise individuelle française enregistrée à Courseulles-sur-Mer (Calvados), exerçant une activité de conseil en éthique numérique et de production éditoriale (code NAF 70.22Z).

Je porte un projet personnel et professionnel de journalisme d'investigation et de cartographie civique intitulé **« Réseaux d'Influence »** (`reseauxinfluences.fr`), dont la finalité, le périmètre et les garde-fous sont décrits ci-après.

## 2. Description du projet et de son intérêt public

**Réseaux d'Influence** est une plateforme collaborative non commerciale de **cartographie des réseaux d'influence interpersonnels et transnationaux** entre :
- personnalités exerçant un mandat électif ou une fonction publique,
- dirigeants et bénéficiaires effectifs d'organisations significatives sur le plan économique, médiatique ou culturel,
- éditeurs de publications, hébergeurs et titulaires de sites web à audience publique.

Le projet s'inscrit dans la continuité directe d'initiatives journalistiques reconnues d'intérêt public (*InfluenceNetwork* d'Owni.fr porté par Nicolas Kayser-Bril, *LittleSis* aux États-Unis, *OCCRP Aleph*). Il vise à **rendre traçables, sourcées et vérifiables les relations d'influence** que les journalistes, chercheurs en sciences politiques et citoyens éclairés doivent pouvoir consulter dans le cadre du débat démocratique.

La plateforme est actuellement en **phase alpha fermée** (accès restreint à son auteur), pendant que l'analyse juridique préalable à l'ouverture publique est conduite avec un cabinet spécialisé en données personnelles et droit des médias.

## 3. Caractérisation de l'intérêt légitime

L'intérêt légitime au sens du considérant 12 de la directive (UE) 2018/843 et conformément à la jurisprudence de la CJUE précitée est ici caractérisé par les éléments cumulatifs suivants :

1. **Finalité journalistique et de recherche d'intérêt public** au sens de l'article 85 du RGPD et de l'article 80 de la loi n° 78-17 du 6 janvier 1978 modifiée.
2. **Lien direct entre l'objet du traitement et la lutte contre le blanchiment de capitaux, le financement du terrorisme et la corruption**, dès lors que la mise au jour de réseaux d'influence opaques constitue une finalité reconnue par la directive anti-blanchiment.
3. **Caractère non commercial et non-lucratif** du projet à ce stade : aucune monétisation, aucun accès payant, aucune cession de données à des tiers commerciaux.
4. **Garanties opérationnelles documentées** dans la gouvernance du projet (voir § 5).

## 4. Périmètre des demandes envisagées

Je sollicite un **accès individualisé, motivé et tracé** au RBE, **strictement limité** à :
- la consultation des bénéficiaires effectifs des **personnes morales déjà identifiées** comme exerçant une influence publique dans le projet ;
- la vérification des participations significatives (≥ 25 %) lorsqu'un lien capitalistique est cité par une source secondaire (presse, BODACC, Sirene/RNE) et nécessite confirmation officielle.

Je ne sollicite **pas** :
- d'extraction massive ni d'exploitation systématique du registre,
- de consultation de personnes morales non précédemment identifiées par recoupement de sources publiques,
- de transmission à des tiers, à l'exception des publications éditoriales rédigées dans le respect de la déontologie journalistique.

## 5. Garanties opérationnelles et conformité RGPD

Le projet « Réseaux d'Influence » applique d'ores et déjà les garde-fous suivants, documentés et auditables :

- **Déclaration obligatoire de qualité d'influence publique** pour chaque personne référencée (ADR-006 du registre d'architecture du projet). Une personne non publique ne peut techniquement pas être référencée.
- **Journal d'audit immuable** (`AuditEnrichissement`) de toutes les consultations et imports : identifiant utilisateur, requête, sources consultées, entités créées, adresse IP tronquée. La conservation de cet audit est préservée même en cas d'effacement d'un compte utilisateur (ADR-008, base légale art. 6.1.c RGPD).
- **Sources publiques officielles uniquement** : Wikidata, RDAP, IGN, Sirene/RNE, HATVP, BODACC, OpenSanctions, ICIJ. Aucune source obtenue par scraping non autorisé, aucun recel.
- **Statut « en attente de validation » par défaut** pour toute entité importée — passage à « validé » uniquement après vérification humaine éditoriale.
- **Pseudonymisation des adresses IP** dans l'audit (troncature dernier octet IPv4).
- **Hébergement souverain** Infomaniak (Suisse / France).
- **Aucun tracker** ni cookie tiers ni outil de mesure d'audience non européen.
- **Engagement à informer chaque personne référencée** sur demande (art. 14 RGPD) et à exercer son droit d'opposition (art. 21 RGPD) dans les délais légaux.

Une analyse d'impact relative à la protection des données (AIPD) est en cours de rédaction et sera transmise à la CNIL avant toute ouverture publique du service.

## 6. Engagements complémentaires

Je m'engage à :
- ne consulter le RBE que pour les **finalités strictement définies au § 4** ;
- **citer systématiquement la source RBE** dans toute publication exploitant ces données (mention « Source : Registre des Bénéficiaires Effectifs (INPI), consulté le [date] ») ;
- **conserver une traçabilité des consultations** pendant cinq (5) ans, à la disposition de l'INPI sur simple demande ;
- **respecter la confidentialité** des informations qui ne seraient pas reprises dans une publication éditoriale ;
- **renouveler la présente demande** à chaque évolution significative du projet ou de son périmètre.

## 7. Pièces jointes

- Copie d'une pièce d'identité du demandeur (carte nationale d'identité)
- Extrait Kbis de PostHack (SIREN 900 477 571) — moins de 3 mois
- Note d'intention détaillée du projet « Réseaux d'Influence » (3 pages)
- Décision d'architecture ADR-010 et ADR-006 (extraits du registre du projet, 2 pages) attestant des garde-fous techniques
- Lien vers le code source du projet (repo Git privé, accès sur demande)
- Le cas échéant, lettre de soutien du juriste ou de la rédaction partenaire (à fournir si pertinent)

## 8. Coordonnées

Je reste à votre disposition pour tout complément, audit sur site, ou entretien préalable à l'accréditation.

- **E-mail principal** : contact@posthack.com
- **E-mail technique** : {{adresse@reseauxinfluences.fr — à activer si besoin}}
- **Téléphone** : +33 {{numéro mobile}}
- **Adresse postale** : 7 rue des Sorbiers, 14470 Courseulles-sur-Mer

Je vous prie d'agréer, Madame, Monsieur, l'expression de ma considération distinguée.

**Rémi Vincent**
Gérant de PostHack
*{{Signature manuscrite}}*

---

## Notes pour la version finale (à supprimer avant envoi)

1. **Adresse exacte INPI** : confirmer auprès du standard INPI ou via `inpi.fr/contact` — le siège est à Courbevoie (92), mais le service RBE peut avoir une adresse dédiée. Vérifier également l'adresse e-mail `dpo@inpi.fr`.
2. **Pièces jointes** : préparer le Kbis sur `annuaire-entreprises.data.gouv.fr/entreprise/900477571` (gratuit, téléchargeable en PDF officiel).
3. **Note d'intention** : extraire de `CONTENT-STRATEGY.md` + `ARCHITECTURE-DECISIONS.md` les éléments clés en 3 pages mises en forme.
4. **Lettre de soutien** : optionnel mais renforce le dossier. Possibles signataires :
   - Un·e juriste reconnu·e en données personnelles
   - Une rédaction partenaire (*Mediapart*, *Disclose*, *Le Monde Diplomatique*) si tu en as un contact
   - Une école de journalisme (CFJ, ESJ Lille)
   - Une association reconnue d'utilité publique (Transparency International France, Anticor — vérifier compatibilité éditoriale)
5. **Coordonner avec l'audit juridique ADR-010** : ce courrier est à envoyer **après** la validation du dossier RGPD par le juriste, pas avant. Il sera mieux reçu si la conformité du projet a déjà été examinée par un tiers de confiance.
6. **Délai de réponse INPI** : généralement 2 à 6 semaines. L'INPI peut demander un entretien téléphonique avant accréditation.
7. **Pas de garantie de succès** : l'INPI peut refuser ou restreindre le périmètre. En cas de refus, recours possible auprès de la CADA (Commission d'accès aux documents administratifs) puis du tribunal administratif.
