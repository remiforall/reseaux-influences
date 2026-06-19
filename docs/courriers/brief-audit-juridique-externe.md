# Brief — Audit juridique externe (levée de l'alpha fermée, ADR-010)

> **Destinataire** : avocat·e / juriste spécialisé·e à **double compétence** — **données personnelles (RGPD)** ET **droit de la presse / liberté d'expression (loi du 29 juillet 1881)**. Cette double compétence est déterminante : la qualification du traitement repose sur le pont entre l'**art. 85 RGPD** (exception journalistique) et le régime de la loi de 1881 (diffamation, exception de vérité/bonne foi). Un·e spécialiste RGPD seul·e ne couvrira pas le risque pénal/civil de presse ; un·e pénaliste presse seul·e ne tranchera pas la base légale.
> **Demandeur** : Rémi Vincent — PostHack (Normandie).
> **Date** : 2026-06-18 (révision).
> **Objet** : cadrer la conformité du projet **reseauxinfluences.fr** avant toute ouverture, même restreinte. Le projet est volontairement maintenu en **alpha fermée** (aucun accès public) tant que cet audit n'a pas été rendu (ADR-010).

Ce document n'est pas une demande de validation « oui/non ». Il liste les **questions structurantes** dont les réponses conditionneront l'architecture, le périmètre des sources et la rédaction des pages légales. L'objectif est de rendre la consultation efficace et chiffrable.

---

## 1. Présentation du projet

**Nature** : plateforme collaborative (wiki-like, contributions gamifiées) de **cartographie des réseaux d'influence** entre **personnalités publiques**, **organisations** et **sites web**. Filiation revendiquée : _InfluenceNetwork_ (Owni.fr, Nicolas Kayser-Bril) — démarche de **journalisme de données / redevabilité démocratique**, pas d'investigation privée ni de surveillance d'individus.

**Finalité affichée** : éclairer l'intérêt public sur les relations d'influence (mandats, participations, financements, fonctions) à partir de **sources publiques officielles** et de **médias vérifiables**.

**Modèle de données** : entités `Personne` / `Organisation` / `SiteWeb` reliées par des `Lien` qualifiés et **datés**, avec **provenance par champ** et **audit immuable** de chaque enrichissement.

**Point qui change la qualification** (à lire avant tout) : le modèle de données **stocke et/ou laisse déduire** des données de l'**article 9.1 RGPD** (opinions politiques — type de lien `PARTI_POLITIQUE`, données HATVP, parlementaires, registre de transparence UE) et de l'**article 10 RGPD** (données relatives aux condamnations et infractions — type de lien `CONDAMNATION`, données OpenSanctions/gels Trésor-AMF, ICIJ, veille presse Anticor/Cour des comptes). C'est ce qui fait basculer la base légale (voir Q1).

## 2. État technique et garde-fous déjà en place

Le projet n'attend pas l'audit pour appliquer une discipline RGPD ; les garde-fous suivants sont **déjà actifs en code** (et opposables comme preuve de _privacy by design_, art. 25 RGPD) :

| Garde-fou                                                    | Mise en œuvre                                                                                                                                                                                    | ADR          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Sources limitées à l'open data officiel + médias vérifiables | 25 connecteurs whitelistés (Wikidata, Sirene/RNE, BODACC, HATVP, RDAP, IGN, NosDéputés, OpenSanctions, ICIJ, RNA, RPPS, GLEIF, registre transparence UE, FTS, TED, RSS Anticor/Cour des comptes) | 003, 012-025 |
| **Qualité d'influence publique obligatoire**                 | Refus d'import (HTTP 400) si le champ `qualiteInfluencePublique` (enum : ÉLU, DIRIGEANT, ARTISTE…) est vide                                                                                      | 006          |
| Statut par défaut **EN_ATTENTE**                             | Aucune donnée n'est publiée automatiquement ; consensus communautaire requis (≥ 5 validations, ratio ≥ 70 %)                                                                                     | 006          |
| **Audit immuable**                                           | `AuditEnrichissement` conservé même après suppression du compte contributeur (`onDelete: SetNull`) ; query expurgée des emails/téléphones, IP tronquée (minimisation, art. 5)                    | 008          |
| Périmètre **restreint volontairement**                       | Exclusion explicite : cadastre nominatif MAJIC, breaches/HIBP, énumération d'identifiants sociaux (maigret), reconnaissance faciale, lookup tél/IP individuels                                   | 003, 017     |
| Scraping web gelé                                            | Sous-type `BaseConnecteurScraping` scaffold-only, allowlist vide, désactivé jusqu'à validation Q5                                                                                                | 019          |
| Leaks « gris » désactivés                                    | WikiLeaks / DDoSecrets en stub inerte (risque recel art. 323-3 C. pén.) — activation conditionnée à un avis juridique au cas par cas                                                             | 013          |
| Alpha fermée                                                 | `robots.txt: Disallow: /`, aucune communication publique, aucune démo                                                                                                                            | 010, 011     |

Documents techniques annexes disponibles : `ARCHITECTURE-DECISIONS.md` (26 ADR), `docs/aipd-reseaux-influences.md` (brouillon d'AIPD), `docs/dispositif-anti-diffamation.md`, `docs/mentions-legales.md` (projet), `docs/courriers/inpi-rbe-acces-interet-legitime.md`, `docs/courriers/note-acces-cadastre-nominatif.md`.

---

## 3. Découpage en deux temps de la consultation (proposition au/à la juriste)

Vu la contrainte de trésorerie et le fait que **Q1 conditionne tout le reste**, nous proposons de scinder la mission :

- **Temps 1 — Consultation « go/no-go » cadrée (Q1 + Q4), plafond indicatif ≤ 900 € HT.**
  Objectif : trancher la base légale (art. 85 RGPD + art. 80 LIL vs art. 6.1.f) et la nécessité d'une AIPD/consultation préalable CNIL. Si la réponse Q1 est défavorable ou impose une refonte du périmètre, l'audit complet est inutile en l'état — on réoriente d'abord.
- **Temps 2 — Audit complet (Q2 à Q8 + trame des pages légales), 3 000 à 6 000 € HT.**
  Déclenché seulement si le temps 1 confirme la viabilité du fondement art. 85. Produit la note de levée d'alpha (matière de l'ADR-020) et la validation des pages légales.

Les questions ci-dessous sont **hiérarchisées** : 4 questions **bloquantes** (la levée d'alpha en dépend), 3 **importantes**, 1 de **confort**.

---

## 4. Questions BLOQUANTES (la levée d'alpha en dépend)

### Q1 — Base légale : les art. 9 et 10 imposent-ils le régime dérogatoire art. 85 RGPD + art. 80 LIL ? (LA question pivot)

**Notre analyse, soumise à votre confirmation/infirmation** : l'intérêt légitime de l'**art. 6.1.f RGPD** ne peut **pas** être le fondement, **seul**, de ce traitement.

- Le traitement porte sur des **opinions politiques** (art. 9.1 RGPD) : elles sont soit stockées explicitement (lien vers un `PARTI_POLITIQUE`, déclarations HATVP), soit **déduites** par recombinaison de liens — et une donnée sensible _inférée_ relève de l'art. 9 (CJUE, gr. ch., 4 juillet 2023, _Meta Platforms c/ Bundeskartellamt_, C-252/21).
- Il porte aussi sur des **données relatives aux condamnations et infractions** (art. 10 RGPD) : type de lien `CONDAMNATION`, gels d'avoirs Trésor/AMF via OpenSanctions, mentions issues d'ICIJ et de la veille presse anti-corruption.
- Or l'art. 9.1 **interdit par principe** le traitement de données sensibles, sauf exception de l'art. 9.2 ; et l'art. 10 réserve le traitement des données pénales aux autorités publiques ou aux cas prévus par le droit de l'État membre.
- La voie qui rend ce traitement licite est le **régime dérogatoire « journalisme et expression » de l'art. 85 RGPD**, transposé en droit français par l'**art. 80 de la loi n° 78-17 du 6 janvier 1978** (loi Informatique et Libertés), qui écarte notamment l'interdiction des art. 9 et 10 « dans la mesure nécessaire » à la finalité d'expression journalistique.
- L'art. 9.2.e (« données manifestement rendues publiques par la personne ») est **d'interprétation stricte** et ne couvre **pas** une couleur politique _déduite_ d'un faisceau de liens (même raisonnement _Meta/Bundeskartellamt_, C-252/21). Ne pas s'y appuyer comme fondement principal.

**Questions précises** :

1. Confirmez-vous que le fondement **doit** être l'art. 85 RGPD + art. 80 LIL (et non l'art. 6.1.f seul) dès lors qu'art. 9 et art. 10 sont en jeu ?
2. Une **plateforme contributive gamifiée**, ouverte à des contributeurs non journalistes (grand public), peut-elle se prévaloir de la finalité « journalistique » au sens de l'art. 85 ? La conception fonctionnelle de la notion par la CJUE est large (CJUE, 14 février 2019, _Buivids_, C-345/17 ; CJUE, gr. ch., 16 décembre 2008, _Tietosuojavaltuutettu c/ Satakunnan Markkinapörssi et Satamedia_, C-73/07 — _références à vérifier en version consolidée_). Mais la **gamification** et l'ouverture à des contributeurs anonymes sont un point de fragilité : à quelles conditions (charte éditoriale, modération, finalité documentée) l'éligibilité tient-elle ?
3. À défaut d'éligibilité art. 85 : quel fondement de repli (art. 9.2.g « intérêt public important » fondé sur une disposition de droit national ? — semble peu probable sans texte dédié) ?

> C'est **la** variable qui détermine toute l'architecture. Sans elle, le reste est indécidable.

### Q2 — Éditeur ou hébergeur ? Statut au regard de la LCEN et du DSA

Le contenu est **doublement produit** : des `Lien` saisis par des contributeurs (contenu de tiers) ET un **enrichissement automatique** déclenché par l'exploitant via 25 connecteurs paramétrés.

- Pour les contributions, sommes-nous **hébergeur** au sens de l'**art. 6-I-2 de la loi n° 2004-575 du 21 juin 2004 (LCEN)** et de l'**art. 6 du règlement (UE) 2022/2065 (DSA)** — avec le régime de responsabilité atténuée et l'obligation de retrait après notification (art. 6-I-5 LCEN, art. 16 DSA, mécanisme de notice-and-action) ?
- Pour l'enrichissement automatique paramétré par nos soins, ne devenons-nous pas **éditeur** du contenu correspondant (nous en déterminons les sources, les règles de croisement, la mise en forme) ?
- Le statut **hybride** est notre hypothèse. Comment border la frontière en pratique (qui répond de quoi) ? Quelles obligations DSA s'appliquent vu notre taille (pas une « très grande plateforme », mais obligations de base : point de contact, transparence, mécanisme de signalement) ?

### Q3 — Diffamation (loi 1881) et présomption d'innocence : le risque pénal/civil HORS RGPD

Indépendamment du RGPD, relier publiquement une personne à une « affaire », une condamnation, un réseau offshore expose à :

- la **diffamation** (art. 29, al. 1 de la loi du 29 juillet 1881 : allégation d'un fait portant atteinte à l'honneur ou à la considération), avec les défenses de l'**exception de vérité** (art. 35) et de la **bonne foi** (création prétorienne : but légitime, absence d'animosité personnelle, prudence dans l'expression, enquête sérieuse) ;
- l'atteinte à la **présomption d'innocence** (**art. 9-1 du Code civil**) si une personne est présentée comme coupable avant condamnation définitive ;
- l'obligation de **droit de réponse** (art. 13 loi 1881 ; pour les services en ligne, **art. 6-IV LCEN**).

L'art. 85 RGPD ne couvre **pas** ce risque : c'est un régime distinct. Nous avons rédigé un cadrage produit (`docs/dispositif-anti-diffamation.md`) et souhaitons votre validation des exigences (marquage du stade procédural, sourçage obligatoire, distinction fait établi / allégation, droit de réponse).

**Questions** : quelles mentions obligatoires (« mis en examen », « condamné en première instance, appel en cours », « relaxé ») ? Quel seuil de sourçage pour qu'une allégation soit défendable au titre de la bonne foi ? Quelle procédure de droit de réponse implémenter ?

### Q4 — AIPD obligatoire (art. 35) et risque de consultation préalable CNIL (art. 36)

Le traitement coche au moins trois critères de la liste des **lignes directrices WP248 rév.01** du G29 (évaluation/scoring, données sensibles art. 9/10 à grande échelle, croisement de données, données concernant des personnes vulnérables par ricochet). Il figure vraisemblablement aussi dans la liste CNIL des traitements soumis à AIPD.

**Questions** : confirmez-vous le caractère **obligatoire** de l'AIPD (art. 35 RGPD) ? Si le risque résiduel après mesures reste **élevé**, l'**art. 36 RGPD** impose une **consultation préalable de la CNIL** : pensez-vous qu'on y soit tenu ? Quel format attendez-vous (notre brouillon : `docs/aipd-reseaux-influences.md`) ?

---

## 5. Questions IMPORTANTES

### Q5 — Collecte automatisée / scraping de sources publiques

L'enrichissement **automatisé** a son propre régime (la CNIL a déjà sanctionné de la collecte sur données publiques — _cf. délibérations Clearview AI, et le contentieux sur la réutilisation de données publiques ; références à vérifier en version consolidée_).

- La collecte via **API officielles / open data** (notre cas actuel) est-elle traitée différemment du **scraping** de pages web publiques (ADR-019, gelé) ?
- Conditions pour rester licite (information des personnes art. 14, finalité, proportionnalité) ?
- Confirmation attendue : **réseaux sociaux exclus** — marge nulle ou résiduelle ?

### Q6 — Tiers « périphériques » non publics

Un réseau fait apparaître des tiers non publics (proche, collaborateur, membre de famille). Le garde-fou `qualiteInfluencePublique` vise les figures publiques, mais les nœuds périphériques sont le **maillon faible** de la défense art. 85.

- Mécanisme d'exclusion / **pseudonymisation** des nœuds sans `qualiteInfluencePublique` ?
- La cartographie des **liens familiaux** (finalité produit demandée) est-elle tenable, et à quelles conditions ?

### Q7 — Recombinaison multi-sources et licences de réutilisation

Le **risque dominant n'est pas la collecte** (sources licites isolément) mais la **recombinaison** : croiser des sources licites recrée des profils sensibles, possible **changement de finalité** (art. 6.4 RGPD) et tension avec les **licences** des sources (OpenSanctions **CC BY-NC 4.0**, conditions ICIJ propres — ≠ Licence Ouverte Etalab des données publiques françaises).

- Le croisement est-il un traitement nouveau à requalifier ?
- Les licences NC / propres des sources limitent-elles la rediffusion dans un corpus public ?

### Q8 — Droits des personnes sous régime art. 85 / art. 80 LIL

L'art. 80 LIL permet d'écarter certains droits « dans la mesure nécessaire ». Lesquels concrètement (art. 15 accès, 16 rectification, 17 effacement, 18 limitation, 21 opposition) ? Le droit de **rectification** nous paraît incontournable même sous dérogation. Procédure de contestation à prévoir ?

---

## 6. Question de CONFORT

### Q9 — Diffusion du corpus et transferts hors UE

- Diffuser un **dump nominatif** du corpus (CC-BY-SA, ADR-007 à créer) d'une base de données personnelles : compatible RGPD ? Notre position interne penche pour **ne pas diffuser de dump nominatif** (perte de maîtrise des réutilisations).
- Architecture 100 % FR/CH visée : points de vigilance résiduels sur les **transferts** (art. 44 s. RGPD) — CDN, LLM, dépendances ?

---

## 7. Livrable attendu de l'audit

Une note permettant de **trancher la levée de l'alpha** (rédaction de l'ADR-020), précisant :

1. la **base légale retenue** et ses conditions (réponse Q1) ;
2. la **qualification éditeur/hébergeur** et les obligations DSA/LCEN (Q2) ;
3. les exigences du **dispositif anti-diffamation / présomption d'innocence** (Q3) ;
4. la nécessité et le **périmètre d'une AIPD**, et le cas échéant d'une **consultation préalable CNIL** (Q4) ;
5. le **périmètre de personnes et de sources** autorisé / à exclure (Q5, Q6, Q7) ;
6. la **procédure droits des personnes** sous régime art. 85/80 (Q8) ;
7. la **trame des pages légales** (mentions, CGU, politique de confidentialité, déclaration d'accessibilité).

## 8. Pièces fournies au/à la juriste

- Le présent brief
- `ARCHITECTURE-DECISIONS.md` (26 ADR — décisions tracées et datées), en particulier **ADR-026** (base légale art. 85)
- `docs/aipd-reseaux-influences.md` (brouillon d'AIPD — trame CNIL)
- `docs/dispositif-anti-diffamation.md` (cadrage produit du risque presse)
- `docs/mentions-legales.md` (projet)
- `docs/courriers/inpi-rbe-acces-interet-legitime.md`
- `docs/courriers/note-acces-cadastre-nominatif.md`
- Accès démo en lecture (compte alpha) sur demande, sur données de seed (Bolloré/Macron) — figures publiques, corpus de test
- Schéma de données (`backend/prisma/schema.prisma`) sur demande

---

> **Notes de cadrage (internes, à retirer avant envoi)** :
>
> - **Profil recherché** : double compétence RGPD + droit de la presse (loi 1881). C'est rare : ce pont est exactement l'art. 85. Pistes : cabinets « médias & données » (ex. spécialistes presse parisiens couplés data, ou DPO externalisé avec practice presse). À défaut d'un seul profil : un binôme (un·e RGPD + un·e presse) sur la même mission.
> - **Séquence budget** : Temps 1 (Q1 + Q4, ≤ 900 € HT) AVANT Temps 2 (audit complet, 3-6 k€ HT). Q1 conditionne tout.
> - Ce brief n'est pas un conseil juridique engageant ; il prépare la consultation.
