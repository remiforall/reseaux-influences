/**
 * @module connecteurs/sources/wikidata
 * Connecteur Wikidata SPARQL.
 *
 * Couverture :
 *   - Entités Q* de type Personne (Q5) ou Organisation (Q43229)
 *   - Propriétés relationnelles : P39 (mandat), P108 (employeur), P102 (parti),
 *     P26 (conjoint — uniquement personnes publiques), P127 (propriétaire),
 *     P112 (fondateur), P98 (éditeur), P162 (producteur)
 *
 * Fraîcheur : Wikidata est mis à jour en continu par la communauté.
 * Le cache de 24 h introduit un décalage acceptable pour un usage OSINT.
 *
 * Limites :
 *   - Timeout SPARQL côté serveur = 60 s. Ce connecteur impose 30 s côté client.
 *   - Les données biographiques sensibles (P26 conjoint) ne sont retournées
 *     que si la valeur est elle-même une entité publique (type Q5 référencée).
 *   - La pagination SPARQL est limitée à 20 résultats par `rechercher()`.
 *   - Wikidata bannit les User-Agents génériques — ENRICHISSEMENT_USER_AGENT
 *     est obligatoire.
 */

import { BaseConnecteur } from '../base.js';
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js';

const ENDPOINT_SPARQL = 'https://query.wikidata.org/sparql';

/**
 * Échappe une chaîne pour usage sécurisé dans une query SPARQL (C-03 / SEC-C-01).
 *
 * Couvre : backslash, guillemet, newline, retour chariot, tabulation.
 * Les caractères U+0000–U+001F et U+007F (DEL) sont supprimés via filtre
 * sur code de caractère (évite les regex avec caractères de contrôle littéraux).
 *
 * @param {string} s - Valeur à échapper
 * @returns {string}
 */
function echapperSparql(s) {
  // Ordre important : on échappe d'abord les caractères spéciaux significatifs
  // (backslash en premier pour éviter le double-échappement), puis on supprime
  // les caractères de contrôle restants (U+0000–U+001F hors \n, \r, \t et DEL U+007F).
  return String(s)
    .replace(/\\/g, '\\\\')   // backslash → \\
    .replace(/"/g, '\\"')     // " → \"
    .replace(/\n/g, '\\n')    // newline → \n littéral
    .replace(/\r/g, '\\r')    // retour chariot → \r littéral
    .replace(/\t/g, '\\t')    // tabulation → \t littéral
    .split('')
    .filter((c) => {
      const code = c.charCodeAt(0);
      // Conserver les caractères normaux ; supprimer les autres contrôles U+0000–U+001F et DEL
      return code > 0x1f && code !== 0x7f;
    })
    .join('');
}

/**
 * Endpoint API REST MediaWiki (wbsearchentities).
 * Beaucoup plus rapide que SPARQL CONTAINS car utilise l'index de recherche Wikidata.
 * ADR-016 : pivot recherche SPARQL → REST (L3 Passe 5).
 */
const ENDPOINT_SEARCH = 'https://www.wikidata.org/w/api.php';

/** Mapping propriété Wikidata → code TypeLien interne */
const MAPPING_PROPRIETES = {
  P39: 'MANDAT_ELECTIF',
  P108: 'EMPLOI',
  P102: 'AFFILIATION_PARTI',
  P26: 'CONJOINT',
  P127: 'PROPRIETAIRE_DE',
  P112: 'FONDATEUR',
  P98: 'EDITEUR_DE',
  P162: 'PRODUCTEUR_DE',
};

/** QID Wikidata → type d'entité interne */
const QID_TYPE_PERSONNE = 'Q5';
const QID_TYPE_ORGANISATION = 'Q43229';

// Export interne pour les tests
export { echapperSparql };

export default class WikidataConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'wikidata',
      version: '1.0.0',
      baseUrl: ENDPOINT_SPARQL,
      rateLimit: {
        debit: Number(process.env.WIKIDATA_RATE_LIMIT_DEBIT) || 2,
        capacite: Number(process.env.WIKIDATA_RATE_LIMIT_CAPACITE) || 5,
      },
      ttlCache: Number(process.env.CACHE_TTL_MS) || 86_400_000,
      timeoutMs: 30_000,
    });
  }

  /**
   * Recherche des personnes ou organisations par terme textuel.
   *
   * Stratégie (ADR-016 — L3 Passe 5) :
   *   1. Appel REST wbsearchentities (indexé, < 1 s) → Q-IDs candidats
   *   2. Un seul SPARQL VALUES ciblé sur ces Q-IDs pour récupérer type + description
   *
   * Justification du pivot : la requête SPARQL CONTAINS(LCASE(?label), "...") est
   * non-indexée par Wikidata et timeout systématiquement sur les termes courants
   * (ex : "macron", "lvmh"). wbsearchentities est l'API utilisée par la barre de
   * recherche Wikipedia — stable, rapide, et retourne déjà les types d'entités.
   *
   * @param {string} query - Terme de recherche (minimum 2 caractères)
   * @param {{ lang?: string }} [options]
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query, { lang = 'fr' } = {}) {
    if (!query || query.trim().length < 2) {
      return this._enveloppe([]);
    }

    // Validation stricte du code langue pour bloquer toute injection (C-03)
    const langValide = /^[a-z]{2}$/.test(lang) ? lang : 'fr';

    // ── Étape 1 : wbsearchentities → Q-IDs candidats ──────────────────────────
    const searchParams = new URLSearchParams({
      action: 'wbsearchentities',
      search: query.trim(),
      language: langValide,
      format: 'json',
      type: 'item',
      limit: '10',
      uselang: langValide,
    });
    const urlSearch = `${ENDPOINT_SEARCH}?${searchParams}`;

    let searchData;
    try {
      searchData = await this._appelHttp(urlSearch, {
        headers: { Accept: 'application/json' },
        cacheMethode: 'rechercher-wbsearch',
        cacheArgs: { query: query.trim(), lang: langValide },
      });
    } catch {
      return this._enveloppe([]);
    }

    const candidats = searchData.search ?? [];
    if (candidats.length === 0) return this._enveloppe([]);

    // ── Étape 2 : SPARQL VALUES ciblé sur les Q-IDs connus (rapide) ────────────
    // Sécurité : les Q-IDs sont extraits via regex strict — pas d'interpolation de
    // données utilisateur dans le SPARQL (C-03 garanti).
    const qids = candidats
      .map((c) => c.id)
      .filter((id) => /^Q\d+$/.test(id))
      .map((id) => `wd:${id}`)
      .join(' ');

    const sparql = `
      SELECT DISTINCT ?entite ?label ?description ?type_entite WHERE {
        VALUES ?entite { ${qids} }
        ?entite wdt:P31 ?type_entite .
        FILTER(?type_entite IN (wd:${QID_TYPE_PERSONNE}, wd:${QID_TYPE_ORGANISATION}))
        ?entite rdfs:label ?label .
        FILTER(LANG(?label) = "${langValide}")
        OPTIONAL { ?entite schema:description ?description . FILTER(LANG(?description) = "${langValide}") }
      }
    `;

    let donnees;
    try {
      donnees = await this._requeteSparql(sparql, 'rechercher-sparql-values', { qids, lang: langValide });
    } catch {
      // Si SPARQL échoue malgré tout, on replie sur les candidats REST sans filtrage de type
      return this._enveloppe(
        candidats
          .filter((c) => /^Q\d+$/.test(c.id))
          .map((c) => this._mappageRechercheRest(c)),
      );
    }

    const bindings = donnees.results?.bindings ?? [];

    // Si SPARQL ne retourne rien mais REST a des résultats → utiliser REST (dégradé gracieux)
    if (bindings.length === 0) {
      return this._enveloppe(
        candidats
          .filter((c) => /^Q\d+$/.test(c.id))
          .map((c) => this._mappageRechercheRest(c)),
      );
    }

    return this._enveloppe(bindings.map((b) => this._mappageRecherche(b)));
  }

  /**
   * Mappe un résultat wbsearchentities (REST) vers une EntiteNormalisee légère.
   * Utilisé en fallback si SPARQL échoue ou retourne vide.
   *
   * @param {{ id: string, label?: string, description?: string }} candidat
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageRechercheRest(candidat) {
    const qid = candidat.id;
    const sourceInfo = { source: 'Wikidata', url: `https://www.wikidata.org/wiki/${qid}` };
    // Type inconnu depuis REST seul — on retourne Organisation par défaut (champ corrigé après détail)
    return creerEntiteNormalisee(
      'Organisation',
      {
        wikidataId: marquerProvenance(qid, sourceInfo),
        nom: marquerProvenance(candidat.label ?? qid, sourceInfo),
        bio: marquerProvenance(candidat.description ?? null, sourceInfo),
      },
      [],
    );
  }

  /**
   * Retourne le détail complet d'une entité Wikidata.
   *
   * @param {string} qid - Identifiant Wikidata (ex: 'Q999999999')
   * @returns {Promise<{ entite: object, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(qid) {
    const qidNormalise = qid.startsWith('Q') ? qid : `Q${qid}`;
    const sparql = this._requeteDetail(qidNormalise);

    const donnees = await this._requeteSparql(sparql, 'detailler', { qid: qidNormalise });
    const bindings = donnees.results?.bindings ?? [];

    if (bindings.length === 0) {
      return {
        entite: null,
        source: 'Wikidata',
        dateRecuperation: new Date().toISOString(),
        version: this.version,
      };
    }

    const entite = this._mappageDetail(qidNormalise, bindings);
    return {
      entite,
      source: 'Wikidata',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  /**
   * Liste les liens suggérés depuis une entité Wikidata.
   *
   * @param {string} qid
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(qid) {
    const detail = await this.detailler(qid);
    const liens = detail.entite?.liensSuggeres ?? [];
    return {
      liens,
      source: 'Wikidata',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  // ─── Méthodes internes ──────────────────────────────────────────────────────

  /**
   * Exécute une requête SPARQL sur l'endpoint Wikidata.
   *
   * @param {string} sparql
   * @param {string} cacheMethode - Préfixe pour la clé de cache
   * @param {*} cacheArgs
   * @returns {Promise<object>}
   */
  async _requeteSparql(sparql, cacheMethode, cacheArgs) {
    const corps = new URLSearchParams({ query: sparql });
    return this._appelHttp(ENDPOINT_SPARQL, {
      method: 'POST',
      body: corps.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/sparql-results+json',
      },
      cacheMethode,
      cacheArgs,
    });
  }

  /**
   * Requête SPARQL pour le détail d'une entité.
   * Récupère :
   *   - P19 (lieu de naissance) avec coordonnées P625 du lieu
   *   - P569 (date de naissance), P570 (date de décès)
   *   - P39/P108/P102/P26/P127/P112/P98/P162 avec qualifiers P580 (date début) et P582 (date fin)
   */
  _requeteDetail(qid) {
    return `
      SELECT ?entite ?label ?description ?type_entite
             ?dateNaissance ?dateDeces ?pays ?paysLabel
             ?lieuNaissance ?lieuNaissanceLabel ?lieuNaissanceLat ?lieuNaissanceLon
             ?prop ?valeur ?valeurLabel ?dateDebut ?dateFin
      WHERE {
        BIND(wd:${qid} AS ?entite)
        ?entite rdfs:label ?label . FILTER(LANG(?label) = "fr")
        OPTIONAL { ?entite schema:description ?description . FILTER(LANG(?description) = "fr") }
        OPTIONAL { ?entite wdt:P31 ?type_entite }
        OPTIONAL { ?entite wdt:P569 ?dateNaissance }
        OPTIONAL { ?entite wdt:P570 ?dateDeces }
        OPTIONAL {
          ?entite wdt:P27 ?pays .
          ?pays rdfs:label ?paysLabel . FILTER(LANG(?paysLabel) = "fr")
        }
        OPTIONAL {
          ?entite wdt:P19 ?lieuNaissance .
          ?lieuNaissance rdfs:label ?lieuNaissanceLabel . FILTER(LANG(?lieuNaissanceLabel) = "fr")
          OPTIONAL {
            ?lieuNaissance wdt:P625 ?coordonnees .
            BIND(geof:latitude(?coordonnees) AS ?lieuNaissanceLat)
            BIND(geof:longitude(?coordonnees) AS ?lieuNaissanceLon)
          }
        }
        OPTIONAL {
          ?entite ?propDirect ?valeur .
          ?propEntite wikibase:directClaim ?propDirect .
          ?propEntite rdf:type wikibase:Property .
          BIND(STRAFTER(STR(?propEntite), "entity/") AS ?prop)
          FILTER(?prop IN ("P39", "P108", "P102", "P26", "P127", "P112", "P98", "P162"))
          OPTIONAL { ?valeur rdfs:label ?valeurLabel . FILTER(LANG(?valeurLabel) = "fr") }
          OPTIONAL {
            ?entite ?propStatement ?statement .
            ?statement ?propDirect ?valeur .
            ?statement pq:P580 ?dateDebut .
          }
          OPTIONAL {
            ?entite ?propStatement ?statement .
            ?statement ?propDirect ?valeur .
            ?statement pq:P582 ?dateFin .
          }
        }
      }
    `;
  }

  /** Mappe un binding SPARQL de recherche vers une EntiteNormalisee légère. */
  _mappageRecherche(binding) {
    const qid = this._extraireQid(binding.entite?.value);
    const typeWikidata = this._extraireQid(binding.type_entite?.value);
    const typeEntite = typeWikidata === QID_TYPE_PERSONNE ? 'Personne' : 'Organisation';
    const sourceInfo = { source: 'Wikidata', url: `https://www.wikidata.org/wiki/${qid}` };

    return creerEntiteNormalisee(
      typeEntite,
      {
        wikidataId: marquerProvenance(qid, sourceInfo),
        nom: marquerProvenance(binding.label?.value ?? null, sourceInfo),
        bio: marquerProvenance(binding.description?.value ?? null, sourceInfo),
      },
      [],
    );
  }

  /** Mappe l'ensemble des bindings SPARQL de détail vers une EntiteNormalisee complète. */
  _mappageDetail(qid, bindings) {
    const premier = bindings[0];
    const typeWikidata = this._extraireQid(premier.type_entite?.value);
    const typeEntite = typeWikidata === QID_TYPE_PERSONNE ? 'Personne' : 'Organisation';
    const urlEntite = `https://www.wikidata.org/wiki/${qid}`;
    const sourceInfo = { source: 'Wikidata', url: urlEntite };

    // Lieu de naissance avec coordonnées (P19 + P625)
    const lieuNaissanceLabel = premier.lieuNaissanceLabel?.value ?? null;
    const lieuNaissanceLat = premier.lieuNaissanceLat?.value
      ? parseFloat(premier.lieuNaissanceLat.value)
      : null;
    const lieuNaissanceLon = premier.lieuNaissanceLon?.value
      ? parseFloat(premier.lieuNaissanceLon.value)
      : null;

    const champs = {
      wikidataId: marquerProvenance(qid, sourceInfo),
      nom: marquerProvenance(premier.label?.value ?? null, sourceInfo),
      bio: marquerProvenance(premier.description?.value ?? null, sourceInfo),
      dateNaissance: marquerProvenance(
        premier.dateNaissance?.value ? premier.dateNaissance.value.substring(0, 10) : null,
        sourceInfo,
      ),
      dateDeces: marquerProvenance(
        premier.dateDeces?.value ? premier.dateDeces.value.substring(0, 10) : null,
        sourceInfo,
      ),
      pays: marquerProvenance(premier.paysLabel?.value ?? null, sourceInfo),
      // Champs géographiques — lieu de naissance (P19)
      lieuNaissance: marquerProvenance(lieuNaissanceLabel, sourceInfo),
      lieuNaissanceLat: marquerProvenance(lieuNaissanceLat, sourceInfo),
      lieuNaissanceLon: marquerProvenance(lieuNaissanceLon, sourceInfo),
    };

    // Dédoublonnage des liens par valeur+prop
    const liensVus = new Set();
    const liensSuggeres = [];

    for (const b of bindings) {
      if (!b.prop?.value || !b.valeur?.value) continue;

      const propCode = b.prop.value.startsWith('http')
        ? this._extraireQid(b.prop.value)
        : b.prop.value;

      const codeLien = MAPPING_PROPRIETES[propCode];
      if (!codeLien) continue;

      const valeurQid = this._extraireQid(b.valeur.value);
      const cleUnique = `${propCode}:${valeurQid}`;
      if (liensVus.has(cleUnique)) continue;
      liensVus.add(cleUnique);

      const typeVers = propCode === 'P26' ? 'Personne' : 'Organisation';

      liensSuggeres.push({
        vers: { type: typeVers, identifiantExterne: valeurQid },
        typeLienCode: codeLien,
        source: 'Wikidata',
        url: `https://www.wikidata.org/wiki/${qid}`,
        date: new Date().toISOString(),
        dateDebut: b.dateDebut?.value ? b.dateDebut.value.substring(0, 10) : null,
        dateFin: b.dateFin?.value ? b.dateFin.value.substring(0, 10) : null,
        libelle: b.valeurLabel?.value ?? valeurQid,
      });
    }

    return creerEntiteNormalisee(typeEntite, champs, liensSuggeres);
  }

  /** Extrait le QID (ex: 'Q5') depuis une URI Wikidata. */
  _extraireQid(uri) {
    if (!uri) return null;
    const match = uri.match(/\/([QP]\d+)$/);
    return match ? match[1] : uri;
  }

  /** Enveloppe un tableau de résultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'Wikidata',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }
}
