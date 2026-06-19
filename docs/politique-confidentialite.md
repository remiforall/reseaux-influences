# Politique de confidentialité — reseauxinfluences.fr

**Version** : projet v0.1 (2026-06-19)
**Statut** : **PROJET — à valider par avocat·e (double compétence RGPD + droit de la presse) et par le DPO avant publication** (ADR-010, ADR-011, ADR-026).

---

> ## ⚠️ NOTE DE CADRAGE À RÉMI — à lire avant tout (à retirer de la version publiée)
>
> Cette politique de confidentialité est le pendant « personnes concernées » des mentions légales et des CGU. Sa **difficulté propre, à ne pas rater** : ce service traite **deux populations de personnes physiques au régime juridique radicalement différent**, et il serait malhonnête — et juridiquement faux — de leur appliquer le même discours sur les droits.
>
> 1. **Les utilisateurs de la plateforme** (toi, les contributeurs, les modérateurs). Traitement **classique** : base art. 6 RGPD (exécution de la relation art. 6.1.b + intérêt légitime art. 6.1.f pour la sécurité/journalisation). **Droits pleins et entiers** (art. 15 à 22). Aucun aménagement.
> 2. **Les personnes cartographiées** (les entités d'influence publique : élus, dirigeants, lobbyistes…). Traitement **journalistique** fondé sur l'**art. 85 RGPD + art. 80 de la loi 78-17** (ADR-026). Pour ce traitement, l'**art. 80 LIL aménage et restreint expressément** certains droits et obligations (notamment information préalable art. 14, droit d'accès art. 15, droit d'opposition art. 21, et la portabilité), « dans la mesure où ces droits feraient obstacle » à la finalité d'expression. **Mais l'aménagement n'est pas la suppression** : la rectification reste due, la réclamation CNIL (art. 77) et le recours juridictionnel subsistent toujours, et le droit de réponse en ligne (art. 6-IV LCEN) est ouvert.
>
> **Le piège à éviter dans les deux sens** :
>
> - ne pas **promettre** aux personnes cartographiées un droit d'opposition / d'effacement plein qui, en réalité, sera apprécié au regard de la finalité d'intérêt public et pourra être refusé (sinon la promesse est trompeuse et expose à un grief CNIL) ;
> - ne pas non plus **prétendre supprimer tout droit** au nom de l'art. 85 (faux : c'est une dérogation _encadrée_, contrôlée par le juge et la CNIL ; le considérant 153 du RGPD impose des dérogations « nécessaires pour concilier » les deux droits fondamentaux, pas une exemption générale).
>
> La politique ci-dessous **expose honnêtement ce régime à deux vitesses**, sans le travestir. La rubrique « droits » est volontairement scindée en deux blocs distincts.
>
> **Point de cohérence technique vérifié dans le code (2026-06-19)** :
>
> - Authentification par **JWT bearer** (`Authorization: Bearer`, signé 7 jours, `backend/src/routes/auth.js` l.20-21), stocké côté client en **`localStorage` clé `token`** (`frontend/src/api/client.js` l.12) — **pas de cookie de session, aucun cookie publicitaire ni traceur tiers**. Conséquence art. 82 LIL : le `localStorage` strictement nécessaire à la fourniture du service expressément demandé par l'utilisateur **n'exige pas de recueil du consentement** (exemption de l'art. 82, II, 2°).
> - Données de compte réellement collectées (`schema.prisma` modèle `Utilisateur` l.14-57) : email, mot de passe **haché** (jamais en clair), nom, pseudo, bio et avatarUrl optionnels, rôle, compteurs de gamification, `estActif`, dates d'inscription / dernière connexion.
> - Audit (`AuditEnrichissement` l.589-603) : **IP tronquée** (`ipAddressTronquee`), `onDelete: SetNull` (ADR-008, audit immuable survivant à la suppression du compte).
> - Demandes de droits (`DemandeDroitPersonne` l.616-636) : email de contact + nom revendiqué, **jamais la pièce d'identité** (vérifiée hors-bande), IP tronquée.
>
> _Ceci n'est pas un conseil juridique engageant — à confirmer par l'avocat·e (brief Q1, Q2, Q6, Q8) et le DPO._

---

## 1. Responsable de traitement et contact

Le responsable de traitement, au sens de l'**article 4, point 7, du règlement (UE) 2016/679 (RGPD)**, est :

- **PostHack**, EURL au capital de 500 euros, SIREN **900 477 571**, RCS de Caen, dont le siège est situé **7 rue des Sorbiers, 14470 Courseulles-sur-Mer**, représentée par **Rémi Vincent**, directeur de la publication.
- Courriel : **contact@reseauxinfluences.fr**

**Délégué à la protection des données (DPO)** : `[DPO à désigner — voir § « À faire valider en externe »]`.
Contact pour l'exercice des droits et toute question relative aux données personnelles : **dpo@reseauxinfluences.fr** — `[adresse postale dédiée à compléter]`.

L'identité de l'hébergeur (**Infomaniak Network SA**, Genève, Suisse) et les autres mentions d'éditeur figurent dans les **mentions légales** (`/mentions-legales`).

---

## 2. Périmètre — deux catégories de personnes concernées

La présente politique couvre **deux traitements distincts**, reposant sur des **bases légales différentes** et ouvrant des **droits d'étendue différente**. Cette distinction est centrale et structure tout le document.

|                        | **A. Utilisateurs de la plateforme**                                                        | **B. Personnes cartographiées**                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Qui ?**              | Personnes qui créent un compte et contribuent (contributeurs, modérateurs, administrateurs) | Personnes physiques exerçant une **influence publique** (élus, dirigeants, lobbyistes, hauts fonctionnaires…) figurant dans la cartographie |
| **Base légale**        | Art. 6.1.b (exécution) + art. 6.1.f (intérêt légitime : sécurité, preuve) RGPD              | **Art. 85 RGPD + art. 80 loi n° 78-17** (régime journalistique / d'expression)                                                              |
| **Source des données** | Fournies par la personne elle-même                                                          | Sources publiques officielles et médias vérifiables                                                                                         |
| **Étendue des droits** | **Droits pleins** (art. 15 à 22)                                                            | **Droits aménagés / restreints** par l'art. 80 LIL « dans la mesure nécessaire » — voir § 7.B                                               |

> Une personne peut relever **des deux catégories** simultanément (ex. un contributeur qui serait par ailleurs une personnalité publique cartographiée). Les deux régimes s'appliquent alors **distinctement** à chaque traitement la concernant.

---

## 3. Traitement A — Données des utilisateurs de la plateforme

### 3.1. Finalités et bases légales

| Finalité                                                                       | Base légale (RGPD)                                                                                                               |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Création et gestion du compte, authentification, fourniture du service         | **Art. 6.1.b** — exécution des CGU acceptées par l'utilisateur                                                                   |
| Animation contributive (points, niveaux, badges, statistiques de validation)   | **Art. 6.1.b** — fonctionnalité contractuelle du service                                                                         |
| Sécurité, prévention des abus, journalisation, conservation de preuves (audit) | **Art. 6.1.f** — intérêt légitime de l'éditeur (sécurité du service et traçabilité ; art. 5.2 — responsabilité/_accountability_) |
| Réponse aux demandes et réclamations                                           | **Art. 6.1.c** — respect d'obligations légales (RGPD, CGU)                                                                       |

### 3.2. Catégories de données réellement collectées

Conformément au principe de **minimisation (art. 5.1.c RGPD)** :

- **Identification du compte** : adresse e-mail, nom, pseudonyme (optionnel).
- **Authentification** : mot de passe **stocké uniquement sous forme hachée** (jamais en clair, jamais transmis en clair). La session repose sur un **jeton JWT** transmis par en-tête HTTP `Authorization: Bearer` et conservé **côté navigateur** (stockage local `localStorage`) ; **aucun cookie de session, aucun cookie publicitaire, aucun traceur tiers** n'est déposé (voir § 8).
- **Profil optionnel** : biographie courte, image d'avatar (si renseignées par l'utilisateur).
- **Activité contributive** : rôle, points, niveau, nombre de validations et de soumissions, taux de précision.
- **Métadonnées techniques** : date d'inscription, date de dernière connexion, statut actif/inactif.
- **Journaux d'audit** liés aux actions d'enrichissement de l'utilisateur : action, connecteurs sollicités, entités créées, **adresse IP tronquée** (jamais l'IP complète), horodatage (voir § 5 sur l'audit immuable).

Aucune donnée sensible au sens de l'art. 9 RGPD n'est demandée à l'utilisateur pour la gestion de son compte.

### 3.3. Source

Ces données sont **fournies par l'utilisateur lui-même** lors de l'inscription et générées par son activité sur le service.

---

## 4. Traitement B — Données des personnes cartographiées

### 4.1. Finalité

Éclairer l'intérêt public sur les **relations d'influence** (mandats, fonctions, participations, financements, liens capitalistiques) entre personnalités publiques, organisations et sites web, à des fins de **journalisme de données et de redevabilité démocratique**.

### 4.2. Base légale — régime journalistique

Le traitement est fondé sur le **régime dérogatoire des traitements à des fins journalistiques et d'expression**, prévu à l'**article 85 du RGPD** et à l'**article 80 de la loi n° 78-17 du 6 janvier 1978** modifiée (loi Informatique et Libertés), tel que documenté à l'**ADR-026**.

L'intérêt légitime (art. 6.1.f) **n'est pas** la base retenue : il serait insuffisant à lever l'interdiction de principe de l'**art. 9 RGPD** (opinions politiques) et la réserve de l'**art. 10 RGPD** (données pénales). Seul le régime des art. 85 RGPD / 80 LIL permet ce traitement, _dans la mesure nécessaire_ à la finalité d'expression et conformément au **considérant 153 du RGPD** (conciliation de la liberté d'expression et d'information avec le droit à la protection des données).

> Ce régime est appliqué **sous réserve de confirmation par l'audit juridique externe** mentionné à l'ADR-010 (le service est en alpha fermée).

### 4.3. Catégories de données

- **Données d'identité publique et de fonction** : nom, fonctions, mandats, participations, fonctions dirigeantes, et le cas échéant éléments géographiques (lieu de naissance, coordonnées issues de Wikidata).
- **Données sensibles — opinions politiques (art. 9.1 RGPD)** : affiliations partisanes, déclarations d'intérêts, inscriptions au registre de transparence. Une orientation politique **inférée** d'un faisceau de liens relève **aussi** de l'art. 9 (CJUE, _Meta Platforms / Bundeskartellamt_, C-252/21, 4 juillet 2023).
- **Données pénales — condamnations et infractions (art. 10 RGPD)** : mentions de sanctions ou de procédures, gels d'avoirs, mentions issues de sources publiques. Chaque donnée porte, le cas échéant, l'indication de son **stade procédural**. **Une mention n'implique aucune culpabilité** : toute personne est **présumée innocente** (art. 9-1 du Code civil) tant qu'une condamnation définitive n'est pas intervenue.

### 4.4. Source

Exclusivement des **sources publiques officielles** et des **médias vérifiables** (Wikidata, Sirene/RNE, BODACC, HATVP, registres IGN, NosDéputés, OpenSanctions, ICIJ, RNA, annuaire santé, GLEIF, registres de l'Union européenne, flux Anticor et Cour des comptes…). La provenance est indiquée champ par champ. Le détail des sources figure dans les **mentions légales** (`/mentions-legales`).

> **Important** : le fait qu'une donnée provienne d'une source publique **ne signifie pas** qu'elle soit « manifestement rendue publique par la personne concernée » au sens de l'**art. 9.2.e RGPD** — cette exception est d'interprétation stricte et n'est pas la base du traitement. La base demeure l'art. 85 RGPD / 80 LIL (§ 4.2).

---

## 5. Durées de conservation

_(Durées proposées — `[à confirmer DPO/avocat·e]`. La politique de conservation détaillée par catégorie est un prérequis de levée d'alpha, ADR-011.)_

| Donnée                                              | Durée proposée                                                                                                                                                                                                                                                               |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Compte utilisateur actif**                        | Le temps de la relation, puis suppression / anonymisation à la demande                                                                                                                                                                                                       |
| **Compte utilisateur inactif**                      | Suppression ou anonymisation après **[3 ans à confirmer]** d'inactivité, après information préalable                                                                                                                                                                         |
| **Mot de passe haché**                              | Le temps de vie du compte                                                                                                                                                                                                                                                    |
| **Journaux d'audit d'enrichissement** (IP tronquée) | **Audit immuable conservé à des fins de preuve** (art. 5.2 RGPD, ADR-008) — `[durée à confirmer, p. ex. 3 ans ; survit à la suppression du compte par dissociation `onDelete: SetNull`]`                                                                                     |
| **Demandes d'exercice de droits**                   | **[5 ans à confirmer]** à des fins de preuve du traitement de la demande                                                                                                                                                                                                     |
| **Données des personnes cartographiées**            | Conservation longue justifiée par la finalité d'**archive d'intérêt public et de redevabilité** (art. 89 RGPD), sous réserve du droit de rectification et de la mise à jour du stade procédural — `[arbitrage « casier permanent vs droit à l'oubli » à trancher, brief Q8]` |

> Le mot de passe étant haché, et l'IP étant tronquée dès la collecte, ces données minimisées limitent l'impact d'une conservation.

---

## 6. Destinataires et sous-traitants

- **Aucune donnée n'est vendue, louée ou cédée à des fins commerciales.** Aucun courtier de données, aucune régie publicitaire.
- **Hébergeur (sous-traitant, art. 28 RGPD)** : **Infomaniak Network SA** (Genève, Suisse). L'hébergement est situé en **Suisse / Union européenne**, conformément à l'objectif de **souveraineté numérique** du projet. La Suisse bénéficie d'une **décision d'adéquation** de la Commission européenne (décision 2000/518/CE, maintenue), de sorte qu'il **ne s'agit pas d'un transfert vers un pays tiers non adéquat** au sens des art. 44 et suivants du RGPD. `[DPA Infomaniak à formaliser et joindre — art. 28.3.]`
- **Aucun transfert hors UE / hors espace adéquat.** Aucun recours à un service tiers de mesure d'audience, de publicité ou de traçage.
- **Autorités** : des données peuvent être communiquées à une autorité administrative ou judiciaire sur réquisition légale (art. 6.1.c RGPD).

---

## 7. Droits des personnes concernées — un régime à deux vitesses

> La distinction de ce paragraphe est **essentielle et assumée** : les utilisateurs disposent de **droits pleins** ; les personnes cartographiées disposent de **droits aménagés** par le régime journalistique, mais **jamais nuls** — la réclamation CNIL et le recours juridictionnel demeurent toujours ouverts.

### 7.A. Droits des utilisateurs de la plateforme (Traitement A) — droits pleins

Au titre des données de leur compte et de leur activité, les utilisateurs disposent **intégralement** des droits suivants, sans aménagement :

- **Accès** (art. 15 RGPD) ;
- **Rectification** (art. 16 RGPD) ;
- **Effacement** (art. 17 RGPD), sous réserve des données d'audit conservées à des fins de preuve (art. 17.3.b et 17.3.e — voir § 5) ;
- **Limitation** du traitement (art. 18 RGPD) ;
- **Portabilité** des données qu'ils ont fournies (art. 20 RGPD) ;
- **Opposition** (art. 21 RGPD), notamment au traitement fondé sur l'intérêt légitime ;
- **Définir des directives** relatives au sort de leurs données après leur décès (art. 85 de la loi 78-17).

Ces droits s'exercent auprès de **dpo@reseauxinfluences.fr**. Réponse dans un délai d'**un mois** (art. 12.3 RGPD), prolongeable de deux mois si la demande est complexe.

### 7.B. Droits des personnes cartographiées (Traitement B) — droits aménagés par l'art. 80 LIL

Le traitement B relevant du régime journalistique (art. 85 RGPD), l'**article 80 de la loi n° 78-17 du 6 janvier 1978** prévoit que **certains droits et obligations ne s'appliquent pas, ou s'appliquent de façon aménagée, dans la mesure où leur exercice ferait obstacle** à la finalité d'expression journalistique. Sont notamment concernés :

- l'**information préalable et l'information indirecte** (art. 13 et 14 RGPD) — l'information individuelle des personnes cartographiées peut être écartée lorsqu'elle exigerait des efforts disproportionnés ou compromettrait la finalité (art. 14.5 RGPD ; art. 80 LIL) ; la présente politique vaut **information générale** ;
- le **droit d'accès** (art. 15 RGPD) — son exercice est apprécié au regard de la finalité d'intérêt public et de la protection des sources ;
- le **droit d'opposition** (art. 21 RGPD) — apprécié au regard de la finalité d'intérêt public ; un refus motivé est possible lorsque l'information relève du débat d'intérêt général ;
- la **portabilité** (art. 20 RGPD) — non applicable à ce traitement.

En revanche, et c'est essentiel, **les droits et voies de recours suivants demeurent ouverts** aux personnes cartographiées :

- le **droit de rectification** (art. 16 RGPD) — considéré comme **incontournable** : une donnée inexacte doit être corrigée ou mise à jour (y compris l'actualisation du stade procédural d'une affaire) ;
- le **droit à l'effacement** (art. 17 RGPD) — apprécié au cas par cas, au regard de l'exception d'expression et d'archive d'intérêt public (art. 17.3.a et 17.3.d) ; il peut être refusé de façon motivée ;
- le **droit de réponse en ligne** propre aux services de communication au public (**art. 6, IV, de la loi n° 2004-575 du 21 juin 2004 — LCEN**), mis en œuvre par le dispositif anti-diffamation du service ;
- le **droit d'introduire une réclamation auprès de la CNIL** (**art. 77 RGPD**) — voir § 10 ;
- le **droit à un recours juridictionnel** (art. 79 RGPD ; et, sur le terrain de l'honneur et de la présomption d'innocence, loi du 29 juillet 1881 et art. 9-1 du Code civil).

**Procédure** : une page dédiée **`/mes-droits`** permet de soumettre une demande (accès, rectification, effacement, limitation, opposition). La demande indique l'entité visée, un nom revendiqué et un e-mail de contact ; **aucune pièce d'identité n'est stockée** (vérification d'identité effectuée hors-bande, par minimisation — art. 5.1.c). Chaque demande reçoit une **réponse motivée**, y compris en cas de refus fondé sur le régime de l'art. 85 RGPD / 80 LIL.

> **Engagement de transparence** : nous n'opposons jamais l'art. 85 RGPD pour refuser _par principe_ l'ensemble des droits. Chaque demande est examinée individuellement ; seul ce qui ferait réellement obstacle à la finalité d'intérêt public peut être aménagé, conformément à la mise en balance imposée par le considérant 153 du RGPD.

---

## 8. Cookies et traceurs

- Le service **ne dépose aucun cookie publicitaire, aucun cookie de mesure d'audience tiers, aucun traceur de réseau social**.
- L'authentification repose sur un **jeton JWT conservé dans le stockage local (`localStorage`) du navigateur**, strictement nécessaire à la fourniture du service de connexion **expressément demandé par l'utilisateur**.
- À ce titre, ce stockage bénéficie de l'**exemption de consentement** prévue à l'**article 82, II, 2°, de la loi n° 78-17 du 6 janvier 1978** (transposant l'art. 5.3 de la directive 2002/58/CE « ePrivacy »), qui dispense de consentement les opérations « strictement nécessaires à la fourniture d'un service de communication en ligne expressément demandé par l'utilisateur ». **Aucune bannière de consentement publicitaire n'est donc requise.**
- Si une fonctionnalité future devait nécessiter un traceur non strictement nécessaire, un **consentement préalable** (art. 82, I) serait recueilli au préalable, conformément à la doctrine de la CNIL. `[à réévaluer si évolution.]`

---

## 9. Sécurité (art. 32 RGPD)

Des mesures techniques et organisationnelles appropriées sont mises en œuvre, détaillées dans l'**analyse d'impact** (`docs/aipd-reseaux-influences.md`), notamment :

- mot de passe **haché** ; jeton de session signé et à durée limitée ;
- **IP tronquée** dès la collecte ; e-mails expurgés et requêtes minimisées dans le cache ;
- **statut `EN_ATTENTE` par défaut** à l'import (aucune publication automatique), validation par consensus communautaire ;
- **audit immuable** des actions d'enrichissement (ADR-008) ;
- validation anti-injection des entrées, protection anti-SSRF des connecteurs, restriction des hôtes appelés ;
- hébergement souverain (Suisse / UE), zéro CDN externe, zéro dépendance tierce de traçage.

---

## 10. Réclamation auprès de la CNIL et recours

Toute personne concernée — **utilisateur comme personne cartographiée** — qui estime que le traitement de ses données n'est pas conforme peut, après ou sans nous avoir saisis :

- **introduire une réclamation auprès de la CNIL** (art. 77 RGPD) :
  **Commission Nationale de l'Informatique et des Libertés — 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07** — [www.cnil.fr](https://www.cnil.fr) ;
- **exercer un recours juridictionnel** (art. 79 RGPD), et, sur le terrain de l'honneur, de la réputation ou de la présomption d'innocence, agir sur le fondement de la **loi du 29 juillet 1881** et de l'**article 9-1 du Code civil**.

---

## 11. Modification de la politique et entrée en vigueur

La présente politique peut être modifiée pour tenir compte de l'évolution du service, de la réglementation ou de la doctrine de la CNIL. Toute modification substantielle est portée à la connaissance des utilisateurs. La **version applicable** est celle en vigueur à la date de la consultation ou de l'opération concernée.

**Date de dernière mise à jour** : 19 juin 2026 (version projet, non encore en vigueur — service en alpha fermée).

---

> Projet de page — à valider par l'avocat·e (double compétence RGPD + droit de la presse) et par le DPO avant mise en ligne. Les champs `[à confirmer]` / `[à compléter]` doivent être levés. Ceci n'est pas un conseil juridique engageant.
