# Veille outils OSINT 2026 — pourquoi le projet n'intègre pas l'outillage « mainstream »

> **Statut** : note de référence (anti-régression). Date : 2026-06-26.
> **Objet** : tracer le verdict d'un audit d'outils OSINT grand public, pour éviter de re-débattre
> périodiquement de leur intégration et documenter la cohérence du périmètre vis-à-vis de l'audit
> juridique (ADR-010).

## Contexte

Audit demandé sur une série d'outils/listes OSINT « tendance 2026 » :

- `fingerprint.com` / `fingerprint.io` (ex-FingerprintJS)
- `github.com/xpux/CrossTrace`
- blog.crea-troyes.fr — « OSINT : les 10 meilleurs outils gratuits en 2026 »
- joinmassive.com — « The OSINT stack in 2026: 93 tools across 12 categories »
- dcod.ch — « outils OSINT 2026 »

## Le filtre du projet (rappel)

Un outil n'est pertinent pour `reseaux-influences` que s'il satisfait **simultanément** :

1. **Sources publiques officielles** (registres d'État, données ouvertes gouvernementales) — ADR-003.
2. **Pas de scraping** — le scraping est un sous-type gelé (ADR-019).
3. **Souveraineté FR/EU**, zéro dépendance à un courtier de données opaque.
4. **RGPD strict**, base légale art. 85 RGPD / art. 80 LIL (ADR-026), zéro tracker.
5. **Cibles = personnages publics** exerçant une influence publique (qualiteInfluence obligatoire, ADR-006),
   jamais des individus privés / visiteurs web quelconques.

## Verdict

**Aucun des outils de ces cinq sources n'est adoptable.** Ils relèvent d'un paradigme OSINT opposé :
cyber-reconnaissance offensive, courtiers de dossiers personnels, scraping via proxies, agrégation de
fuites. Le seul outil réellement aligné cité (RDAP/WHOIS) est **déjà** couvert par le connecteur `rdap`.

| Cible                       | Nature réelle                                           | Verdict             | Motif                                                                                       |
| --------------------------- | ------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| **fingerprint.io**          | Device/browser fingerprinting anti-fraude (US)          | ⛔ Rejet dur        | Traceur e-Privacy, pas de l'OSINT. Antithétique à « zéro tracker ».                         |
| **CrossTrace**              | Recoupement de comptes sociaux d'individus (MIT, local) | ⛔ Rejet            | Cible des individus privés via réseaux sociaux ; sources non officielles. Hors ADR-003/006. |
| **joinmassive (93 outils)** | Listicle d'un vendeur de proxies résidentiels           | ⛔ Source biaisée   | Publi-rédactionnel pro-scraping/contournement. Anti-ADR-019. Non neutre.                    |
| **crea-troyes (10 outils)** | Recon réseau, énumération username, scraping social     | ⚠️ Rien d'adoptable | Seul aligné = RDAP, déjà couvert.                                                           |
| **dcod.ch**                 | Outils infra/cyber (Shodan, Censys, Intelligence X…)    | ⚠️ Rien d'adoptable | Aucun branché sur un registre d'État. Massivement US.                                       |

## Ce que l'audit confirme

- L'approche du projet — **accès direct aux registres souverains** plutôt que revente de données
  pré-agrégées — est **rare** dans l'écosystème OSINT grand public, et reste le bon positionnement.
- Le gisement d'expansion n'est **pas** dans ces outils mais dans **davantage de registres publics
  FR/EU** (cf. trajectoire GLEIF → eu-transparence → eu-fts → ted, ADR-021 à 025).
- Catégories conceptuellement intéressantes mais à ré-implémenter en connecteur API-officielle maison,
  jamais via les SaaS listés : forensics crypto/blockchain (flux de financement — explorers on-chain
  publics en lecture seule, si un cas d'usage émerge), GEOINT (déjà couvert côté foncier par IGN/DVF/cadastre).
- **OSINT Framework** (annuaire de liens neutre) : utile uniquement pour _repérer_ de nouveaux portails
  open-data officiels à transformer en connecteurs — pas comme outil de collecte.

## Règle de décision (à réappliquer aux futures propositions d'outils)

Avant d'envisager un outil/source OSINT externe, le passer au filtre des 5 critères ci-dessus.
Un échec sur **un seul** suffit à l'exclure. En particulier : tout outil reposant sur du scraping, des
proxies, du fingerprinting, des bases de fuites, ou la revente de dossiers de personnes privées est
exclu d'office, quelle que soit sa popularité.
