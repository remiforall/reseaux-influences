# Conditions Générales d'Utilisation — reseauxinfluences.fr

**Version** : projet v0.1 (2026-06-18)
**Statut** : **PROJET — à valider par avocat·e (double compétence RGPD + droit de la presse) avant publication** (ADR-010, ADR-011, ADR-026).

---

> ## ⚠️ NOTE DE CADRAGE À RÉMI — à lire avant tout (à retirer de la version publiée)
>
> ### Pourquoi ce document compte plus que les mentions légales
>
> Les **mentions légales** ne te protègent pas (une clause « je ne réponds pas des usages détournés » est inopposable, cf. note en tête de `docs/mentions-legales.md`). **Les CGU, si.** Une CGU crée une **obligation contractuelle opposable à l'utilisateur** : s'il l'enfreint, il est en faute contractuelle, tu peux suspendre/supprimer son compte, et surtout **tu démontres que tu n'as ni autorisé ni cautionné l'usage illicite** — ce qui te déplace de la responsabilité solidaire vers le retrait diligent (art. 6 LCEN, art. 16 DSA). C'est défensif, pas cosmétique. Encore faut-il que les obligations soient **claires + assorties de sanctions**, sinon ce sont des vœux pieux non opposables (art. 1188 et 1190 C. civ. : une clause ambiguë s'interprète contre celui qui l'a stipulée, ici contre toi).
>
> ### Trois alertes issues de la lecture du code (à arbitrer AVANT publication)
>
> 1. **L'export est aujourd'hui PUBLIC, NON AUTHENTIFIÉ et MASSIF.** Les routes `/api/export/{json,csv,jsonld,graphml,api-publique}` (`backend/src/routes/export.js`) renvoient le corpus complet des liens VALIDE, sans authentification, sans clé API, sans rate-limit différencié. Le JSON annonce même une **« licence MIT »**. C'est **incompatible** avec : (a) l'alpha fermée ADR-010 (`robots.txt Disallow: /`, aucun accès non authentifié prévu) ; (b) le régime art. 85 RGPD (la finalité d'expression journalistique ne légitime **pas** une rediffusion libre, à toute fin, d'un fichier nominatif de personnes liées à des « affaires ») ; (c) le bon sens RGPD (un export libre rend possible la reconstitution de profils sensibles par un tiers — c'est précisément le risque dominant identifié au cadrage). **Recommandation** : avant toute ouverture, (i) réserver l'export aux utilisateurs **authentifiés** ayant **accepté les présentes CGU**, (ii) **supprimer la mention « licence MIT »** sur le corpus de données (la licence MIT est faite pour du code, pas pour un fichier de données personnelles — l'appliquer ici reviendrait à autoriser n'importe quelle réutilisation, ce qui contredit tout le dispositif), (iii) journaliser les exports (audit). Les présentes CGU sont rédigées pour ce **modèle cible** (export soumis aux CGU), avec une clause prospective si la fonctionnalité UI n'est pas encore branchée.
>
> 2. **La licence du corpus est un ADR non tranché (ADR-007 réservé).** Je ne tranche pas ici (ce n'est pas à un document contractuel de créer la politique de licence). L'article 7 ci-dessous pose une clause **prudente et restrictive par défaut** (réutilisation encadrée, pas de licence ouverte) en attendant la décision ADR-007 + l'avis avocat. Ne pas remplacer par une licence ouverte (CC-BY-SA, ODbL, MIT) sans validation : sur un corpus nominatif, une licence ouverte = perte de maîtrise des réutilisations = ta responsabilité de responsable de traitement reste engagée alors que tu as renoncé à tout contrôle.
>
> 3. **Statut éditeur vs hébergeur (brief Q2) :** les CGU ci-dessous distinguent à dessein le contenu **contribué par les utilisateurs** (régime hébergeur, retrait sur notification) du contenu **produit/organisé par la plateforme** (enrichissement auto paramétré = régime éditeur). Cette frontière doit être confirmée par l'avocat·e ; les CGU ne peuvent pas te faire « choisir » d'être hébergeur (le juge regarde le rôle réel), mais elles peuvent **organiser la notice-and-action** qui te protège dans les deux cas.
>
> *Ceci n'est pas un conseil juridique engageant — à confirmer par l'avocat·e (brief Q1, Q2, Q3, Q7).*

---

## Préambule

Les présentes conditions générales d'utilisation (ci-après les « **CGU** ») régissent l'accès et l'utilisation du service **reseauxinfluences.fr** (ci-après le « **Service** »), édité par **PostHack**, EURL au capital de 500 euros, SIREN 900 477 571, dont le siège est situé 7 rue des Sorbiers, 14470 Courseulles-sur-Mer (ci-après l'« **Éditeur** »).

Les informations relatives à l'identité de l'Éditeur, à l'hébergeur, à la finalité du Service, aux sources de données et à l'exercice des droits des personnes figurent dans les **mentions légales** (`/mentions-legales`), qui font partie intégrante du cadre contractuel et ne sont pas reproduites ici.

---

## Article 1 — Objet et acceptation des CGU

1.1. Les présentes CGU ont pour objet de définir les conditions dans lesquelles l'utilisateur accède au Service, y contribue, et réutilise les données qui y figurent, notamment celles qu'il **exporte**.

1.2. **Acceptation.** L'accès au Service en qualité d'utilisateur authentifié, la création d'un compte, toute contribution et toute opération d'export supposent l'**acceptation pleine et entière des présentes CGU**. L'acceptation se matérialise par une case à cocher non pré-cochée lors de la création du compte (case distincte de toute autre, conformément à l'exigence de consentement spécifique en matière contractuelle et de loyauté de l'information). En l'absence d'acceptation, l'accès aux fonctionnalités de contribution et d'export est refusé.

1.3. L'utilisateur reconnaît avoir la **capacité juridique** de contracter (art. 1145 et 1146 du Code civil). Le Service n'est pas destiné aux mineurs ; un compte ne peut être créé que par une personne majeure.

1.4. **Statut du Service.** À la date des présentes, le Service est en **phase d'alpha fermée** (ADR-010) : l'accès est restreint, le Service n'est pas indexé par les moteurs de recherche, et aucune ouverture publique n'est intervenue. Les présentes CGU s'appliquent dès l'accès en alpha et continueront de régir le Service après son éventuelle ouverture publique.

---

## Article 2 — Définitions

- **Service** : la plateforme reseauxinfluences.fr, ses interfaces, ses fonctions de recherche, de visualisation, de contribution et d'export, ainsi que ses interfaces de programmation (API).
- **Utilisateur** : toute personne accédant au Service, qu'elle soit authentifiée ou non.
- **Contributeur** : utilisateur authentifié disposant du rôle `CONTRIBUTEUR` (rôle par défaut), `MODERATEUR` ou `ADMIN`, qui crée, valide ou modère des contenus.
- **Donnée** : toute information figurant dans le Service, notamment les entités (personnes, organisations, sites web), les liens entre entités, leurs attributs, sources et métadonnées de confiance.
- **Entité d'influence publique** : personne physique ou morale exerçant une **influence publique** au sens du garde-fou éditorial du Service (ADR-006), caractérisée par l'attribut obligatoire `qualiteInfluencePublique` (élu, dirigeant, lobbyiste, haut fonctionnaire, etc.). Sont **exclues** les personnes privées n'exerçant aucune influence publique.
- **Lien** : relation documentée entre deux entités, assortie d'une ou plusieurs sources, d'un statut (`EN_ATTENTE`, `VALIDE`, `REJETE`) et, le cas échéant, d'une indication de stade procédural.
- **Export** : toute opération par laquelle l'utilisateur extrait, télécharge ou récupère tout ou partie des données du Service, sous quelque format que ce soit (JSON, CSV, JSON-LD, GraphML, appels d'API, copie manuelle de volume significatif), ou par tout moyen automatisé.
- **Corpus** : l'ensemble structuré des données du Service, en ce compris la sélection, l'organisation et l'enrichissement opérés par l'Éditeur.

---

## Article 3 — Description du Service et finalité

3.1. Le Service est une plateforme collaborative de **cartographie des réseaux d'influence** entre personnalités publiques, organisations et sites web, à des fins de **journalisme de données et de redevabilité démocratique**.

3.2. **Base légale.** Le traitement de données à caractère personnel opéré par le Service est fondé sur le **régime dérogatoire des traitements à des fins journalistiques et d'expression** prévu à l'**article 85 du règlement (UE) 2016/679 (RGPD)** et à l'**article 80 de la loi n° 78-17 du 6 janvier 1978** modifiée (loi Informatique et Libertés), tel que documenté à l'ADR-026. Ce régime est applicable **sous réserve de confirmation par l'audit juridique externe** mentionné à l'ADR-010.

3.3. Le Service ne traite que des informations relatives à des **entités exerçant une influence publique**, à partir de **sources publiques officielles** et de **médias vérifiables**. Il n'a **pas** vocation à constituer un fichier de renseignement, de surveillance ou de profilage sur des personnes privées.

3.4. **Statut des contenus.** Une mention dans le Service **n'implique aucune illégalité ni culpabilité**. Toute personne mise en cause est **présumée innocente** (art. 9-1 du Code civil) tant qu'une condamnation définitive n'est pas intervenue. Le stade procédural des informations à caractère pénal est, le cas échéant, indiqué.

---

## Article 4 — Accès, compte, rôles et modération

4.1. **Compte.** Certaines fonctionnalités (contribution, validation, export) supposent la création d'un compte authentifié. L'utilisateur est responsable de la confidentialité de ses identifiants et de toute activité réalisée sous son compte. Il s'engage à fournir des informations exactes.

4.2. **Rôles.** Le Service distingue trois rôles : `CONTRIBUTEUR` (par défaut), `MODERATEUR` et `ADMIN`. Les rôles `MODERATEUR` et `ADMIN` sont attribués discrétionnairement par l'Éditeur et emportent des prérogatives de modération, de validation et de gestion.

4.3. **Mécanique contributive et consensus.** La contribution est encadrée par un dispositif de **validation collaborative** : un seuil minimal de validations préalables peut être exigé avant qu'un contributeur puisse soumettre un contenu ; tout contenu soumis est créé au statut `EN_ATTENTE` et ne devient `VALIDE` qu'après atteinte d'un **consensus** (nombre minimal de validations et ratio de confiance). Un système de **gamification** (points, niveaux, badges) accompagne la contribution.

4.4. **Caractère non rémunérateur et non opposable du dispositif de gamification.** Les points, niveaux et badges sont des éléments d'**animation éditoriale** sans valeur monétaire, ne confèrent aucun droit acquis, et peuvent être modifiés ou retirés. La gamification **n'autorise en aucun cas** à relâcher les exigences de sourçage, de neutralité et de respect des droits des personnes définies aux présentes ; le score d'un contributeur ne saurait justifier une contribution non conforme.

4.5. **Modération.** L'Éditeur se réserve le droit de modérer, corriger, masquer ou retirer tout contenu, sans préavis en cas de manquement caractérisé aux présentes ou à la loi, dans le respect de ses obligations de transparence (règlement (UE) 2022/2065, dit « DSA »).

---

## Article 5 — Obligations des contributeurs

Le contributeur s'engage, **à peine de suspension ou de suppression de son compte** (article 10) :

5.1. **Périmètre strict aux entités d'influence publique.** Ne créer ou enrichir que des entités exerçant une **influence publique**, et renseigner pour chacune l'attribut **`qualiteInfluencePublique`** obligatoire (ADR-006). Le contributeur **s'interdit expressément** de créer, enrichir, ficher ou relier toute **personne privée** n'exerçant aucune influence publique (proche, membre de la famille, simple homonyme, citoyen anonyme, personne périphérique sans rôle public).

5.2. **Sourçage obligatoire (EX-1).** N'affirmer aucun fait sans **source citable** (URL, titre, date, émetteur). Toute allégation factuelle sensible — notamment relative à une condamnation, une sanction, une enquête ou un lien d'affaires — doit être étayée par au moins une source vérifiable et conservée. Une contribution non sourcée peut être refusée.

5.3. **Marquage du stade procédural et présomption d'innocence (EX-2, EX-3).** Pour toute information à caractère pénal, indiquer le **stade procédural** exact et ne jamais présenter comme **coupable** une personne non condamnée définitivement (art. 9-1 du Code civil). Distinguer une **sanction administrative** (gel d'avoirs, sanction d'une autorité) d'une **condamnation pénale**. Distinguer un **fait établi** d'une **simple allégation**.

5.4. **Prudence et mesure dans l'expression (EX-3, bonne foi).** Employer une formulation **neutre et mesurée**, exempte d'animosité personnelle et de qualificatif inutilement infamant. Ces exigences participent de la défense de **bonne foi** en matière de diffamation (art. 29 et 35 de la loi du 29 juillet 1881) et engagent personnellement le contributeur en cas de manquement.

5.5. **Interdiction des contenus illicites.** Ne publier aucun contenu diffamatoire (art. 29 loi de 1881), injurieux, portant atteinte à la vie privée (art. 9 C. civ.), à la présomption d'innocence, au secret des sources d'un journaliste, ni aucun contenu manifestement illicite au sens de l'art. 6 de la LCEN et de l'art. 3 du DSA.

5.6. **Respect du dispositif anti-diffamation et de droit de réponse (EX-4 à EX-6).** Le contributeur reconnaît avoir pris connaissance du dispositif anti-diffamation du Service et s'engage à le respecter, notamment la conservation des sources et la traçabilité des modifications.

5.7. **Responsabilité personnelle.** Le contributeur demeure **personnellement responsable** des contenus qu'il publie, y compris au regard de la loi du 29 juillet 1881 et du Code civil, sans préjudice de la qualification du Service comme éditeur ou hébergeur (article 8).

---

## Article 6 — Usage des données exportées

> Cet article est au cœur du dispositif de protection. Il transforme une obligation légale diffuse (le RGPD) en **obligation contractuelle directement opposable** à l'utilisateur qui exporte.

6.1. **Principe.** L'export de données depuis le Service est réservé aux utilisateurs **authentifiés ayant accepté les présentes CGU**. *[Clause prospective : si l'export public non authentifié subsiste techniquement, il doit être fermé avant l'ouverture publique — cf. note de cadrage en tête.]* Toute opération d'export est subordonnée au respect intégral du présent article.

6.2. **Changement de finalité — l'utilisateur devient responsable de traitement.** L'utilisateur qui exporte des données à caractère personnel et les réutilise pour ses propres finalités devient, de ce fait, **responsable de traitement autonome** au sens de l'**article 4, point 7, du RGPD**. Il assume **l'intégralité de ses propres obligations** : disposer d'une **base légale** propre (art. 6, et le cas échéant art. 9, 10 et 85 RGPD), respecter les principes de l'**article 5** (licéité, loyauté, finalité, minimisation, exactitude, limitation de conservation), **informer les personnes** (art. 13 et 14), **garantir leurs droits** (art. 15 à 22), et tenir le **registre** prévu à l'article 30 si applicable. La réutilisation pour une finalité incompatible avec la finalité journalistique d'origine constitue un **changement de finalité** au sens de l'**article 6, paragraphe 4, du RGPD**, dont l'utilisateur répond seul.

6.3. **Finalités autorisées.** Les données exportées ne peuvent être réutilisées qu'à des fins **compatibles avec la finalité d'origine** du Service : information du public, journalisme, recherche, redevabilité démocratique, analyse d'intérêt général. Toute autre finalité est interdite sans base légale propre et autonome dûment constituée par l'utilisateur.

6.4. **Finalités strictement interdites.** Il est **formellement interdit** de réutiliser les données exportées, en tout ou partie, directement ou après recoupement, pour :

- a) la **surveillance**, le **pistage**, la **géolocalisation** ou le suivi d'une personne ;
- b) le **harcèlement**, l'**intimidation**, la **diffamation**, les menaces ou toute atteinte à l'intégrité, à la sécurité ou à la dignité d'une personne ;
- c) le **profilage commercial**, le **scoring**, la **prospection** ou le **démarchage** commercial, politique ou caritatif (en ce compris toute violation de l'art. L34-5 du Code des postes et des communications électroniques et de l'art. 21 du RGPD) ;
- d) toute **discrimination** prohibée par l'article 225-1 du Code pénal (notamment en raison de l'origine, des opinions politiques, des convictions, de l'appartenance syndicale, de l'état de santé) ;
- e) la **constitution d'un fichier détourné** de sa finalité, d'un fichier de renseignement privé, d'une liste noire, d'un dispositif de réputation ou de notation des personnes ;
- f) tout **recroisement avec des données privées** ou des données issues d'autres sources permettant de **réidentifier**, de **profiler** ou de **reconstituer des données sensibles** (opinions politiques, condamnations, état de santé) sur une personne, au-delà de ce qui figure dans le Service ;
- g) tout usage contraire au RGPD, à la loi n° 78-17 du 6 janvier 1978, à la loi du 29 juillet 1881, au Code pénal, ou aux **licences des sources** (article 7).

6.5. **Respect des droits des personnes.** L'utilisateur qui réutilise des données exportées doit faire droit aux demandes d'accès, de rectification, d'opposition et d'effacement émanant des personnes concernées, dans les conditions du RGPD, indépendamment des procédures gérées par l'Éditeur.

6.6. **Interdiction d'extraction massive abusive.** Sont interdits le **scraping**, l'aspiration automatisée, l'extraction systématique ou la reconstitution massive du Corpus en dehors des interfaces d'export prévues et dans des conditions excédant un usage normal. Une telle extraction est susceptible de porter atteinte au **droit du producteur de base de données** (articles L341-1 et suivants du Code de la propriété intellectuelle) et d'engager la responsabilité de l'utilisateur.

6.7. **Traçabilité.** L'Éditeur se réserve le droit de **journaliser** les opérations d'export (date, volume, utilisateur, format), à des fins de preuve, de sécurité et de respect des présentes, dans le respect du RGPD.

---

## Article 7 — Propriété intellectuelle et licence du corpus

7.1. **Code et éléments du Service.** Le code source, la structure, l'identité visuelle et les interfaces du Service sont protégés et demeurent la propriété de l'Éditeur ou de ses concédants.

7.2. **Données sources.** Les données proviennent de sources publiques (Wikidata, Sirene/RNE, BODACC, HATVP, IGN, OpenSanctions, ICIJ, GLEIF, registres de l'UE, etc.) soumises à des **licences distinctes**, dont certaines comportent des restrictions (notamment des clauses **non commerciales**, par ex. OpenSanctions sous licence CC BY-NC 4.0, ou des conditions de réutilisation propres à l'ICIJ). L'utilisateur qui réutilise des données **demeure tenu de respecter la licence de chaque source d'origine**, indépendamment des présentes.

7.3. **Licence du Corpus — clause prudente par défaut.** *[À TRANCHER — ADR-007 réservé, validation avocat·e requise.]* En l'absence de décision formelle de l'Éditeur sur la licence du Corpus, et compte tenu de la nature **nominative** des données, **aucune licence ouverte n'est accordée** sur le Corpus. La réutilisation des données exportées n'est autorisée que dans les conditions et limites de l'article 6 (finalités compatibles) et de l'article 7.2 (licences des sources). Toute reproduction, rediffusion ou mise à disposition du Corpus ou d'une partie substantielle de celui-ci à des tiers requiert l'accord préalable de l'Éditeur. La mention d'une « licence MIT » qui figurerait sur un fichier d'export est **sans valeur** s'agissant des données personnelles et ne saurait être interprétée comme une autorisation de réutilisation libre.

7.4. **Droit du producteur de base de données.** L'Éditeur fait valoir, sur le Corpus qu'il a constitué, organisé et enrichi, le **droit sui generis du producteur de base de données** (articles L341-1 et suivants du Code de la propriété intellectuelle). L'extraction ou la réutilisation d'une **partie substantielle** du Corpus, ou d'extractions répétées de parties non substantielles excédant l'usage normal, est interdite.

---

## Article 8 — Responsabilité, modération, signalement et retrait

8.1. **Statut hybride éditeur / hébergeur.** *[Qualification à confirmer — brief Q2.]* L'Éditeur agit en qualité d'**hébergeur** (art. 6, I, 2° de la LCEN ; art. 6 du règlement (UE) 2022/2065 — DSA) à l'égard des contenus **librement contribués par les utilisateurs**, et en qualité d'**éditeur** à l'égard des contenus qu'il **produit, sélectionne, hiérarchise ou enrichit automatiquement**. Cette qualification résulte du **rôle réel** de l'Éditeur et non d'une stipulation contractuelle.

8.2. **Signalement.** Tout utilisateur peut signaler un contenu qu'il estime illicite via le mécanisme de signalement accessible sur le Service (obligation issue de l'art. 16 du DSA). Le signalement doit être suffisamment précis et motivé pour permettre l'identification du contenu et l'appréciation de son caractère éventuellement illicite.

8.3. **Retrait diligent.** L'Éditeur retire ou rend inaccessible **promptement** tout contenu manifestement illicite dès qu'il en a connaissance effective, conformément à l'art. 6, I, 5° de la LCEN et à l'art. 16 du DSA (notice-and-action). Le retrait diligent ne vaut pas reconnaissance de responsabilité.

8.4. **Droit de réponse.** Un droit de réponse en ligne est ouvert dans les conditions de l'**art. 6, IV, de la LCEN** ; une procédure dédiée est accessible sur le Service.

8.5. **Limitation de responsabilité.** L'Éditeur fournit le Service avec diligence mais ne garantit pas l'exactitude, l'exhaustivité ou l'actualité de chaque donnée, lesquelles proviennent de sources tierces. L'Éditeur **n'autorise ni ne cautionne** les usages prohibés à l'article 6 et ne saurait être tenu responsable des réutilisations effectuées par un utilisateur en violation des présentes, lequel en répond seul en sa qualité de responsable de traitement autonome (art. 4, point 7, RGPD). La présente clause ne couvre pas et ne limite pas la responsabilité propre de l'Éditeur au titre de son activité d'éditeur ou de responsable de traitement.

---

## Article 9 — Données personnelles des utilisateurs

9.1. L'Éditeur traite les données personnelles **des utilisateurs eux-mêmes** (compte, journalisation, contributions) dans les conditions décrites par la **politique de confidentialité** (`/confidentialite`) *[à créer]*, distincte du traitement journalistique portant sur les entités d'influence publique.

9.2. Les utilisateurs disposent, sur leurs propres données, des droits prévus aux articles 15 à 22 du RGPD, exerçables auprès du contact indiqué dans les mentions légales et la politique de confidentialité.

9.3. Le traitement portant sur les **entités cartographiées** relève du régime de l'article 85 du RGPD / article 80 de la loi du 6 janvier 1978 ; les modalités d'exercice des droits des personnes concernées par ce traitement figurent dans les mentions légales (`/mentions-legales`) et la page `/mes-droits`.

---

## Article 10 — Sanctions en cas de manquement

10.1. Tout manquement aux présentes CGU, notamment aux articles 5 (obligations des contributeurs) et 6 (usage des données exportées), peut entraîner, selon la gravité et sans préavis en cas de manquement caractérisé :

- l'**avertissement** ;
- la **suspension temporaire** du compte ou de l'accès à l'export ;
- la **suppression définitive** du compte ;
- le **retrait** des contributions concernées ;
- le **signalement** aux autorités compétentes en cas d'infraction pénale (notamment art. 226-16 et suivants du Code pénal pour les traitements illicites de données, art. 225-1 pour la discrimination, ou loi du 29 juillet 1881).

10.2. Ces sanctions sont sans préjudice de toute action en réparation du préjudice subi par l'Éditeur ou par un tiers, et de la **responsabilité personnelle** de l'utilisateur au titre de ses réutilisations.

10.3. La suppression du compte d'un utilisateur n'efface pas les traces d'audit conservées à des fins de preuve (audit immuable, ADR-008), dans le respect du RGPD.

---

## Article 11 — Droit applicable, réclamations et médiation

11.1. **Droit applicable.** Les présentes CGU sont soumises au **droit français**.

11.2. **Réclamations.** Toute réclamation peut être adressée à l'Éditeur via le contact indiqué dans les mentions légales. L'Éditeur s'efforce d'y répondre dans un délai raisonnable.

11.3. **Médiation de la consommation.** *[À CONFIRMER avec l'avocat·e — applicabilité.]* Dans l'hypothèse où le Service serait fourni à des **consommateurs** au sens du Code de la consommation, l'Éditeur informerait l'utilisateur de la possibilité de recourir gratuitement à un **médiateur de la consommation** (art. L611-1 et L612-1 du Code de la consommation) et indiquerait les coordonnées du médiateur retenu. En l'état (service gratuit, finalité d'intérêt général, absence de relation commerciale), l'applicabilité de la médiation conso est incertaine et doit être tranchée.

11.4. **Litiges.** À défaut de résolution amiable, tout litige relève des juridictions françaises compétentes, sous réserve des règles d'ordre public applicables (notamment en matière de consommation et de presse).

---

## Article 12 — Modification des CGU et entrée en vigueur

12.1. L'Éditeur peut modifier les présentes CGU pour les adapter à l'évolution du Service ou de la réglementation. Les utilisateurs sont informés de toute modification substantielle, et l'usage continu du Service après notification vaut acceptation des CGU modifiées. À défaut d'acceptation, l'utilisateur doit cesser d'utiliser le Service.

12.2. La version applicable est celle en vigueur à la date de l'accès ou de l'opération concernée. La date de dernière mise à jour figure en tête des présentes.

12.3. **Entrée en vigueur.** Les présentes CGU entrent en vigueur à compter de leur acceptation par l'utilisateur et, en tout état de cause, dès l'accès au Service en phase d'alpha fermée.

---

> Projet de CGU — à valider par l'avocat·e (double compétence RGPD + droit de la presse) avant mise en ligne. Les renvois `[à créer]` (politique de confidentialité) et `[À TRANCHER / À CONFIRMER]` (licence du corpus ADR-007, médiation conso, qualification éditeur/hébergeur) doivent être levés. Ceci n'est pas un conseil juridique engageant.
