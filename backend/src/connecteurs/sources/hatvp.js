/**
 * @module connecteurs/sources/hatvp
 * Connecteur HATVP — Haute Autorite pour la Transparence de la Vie Publique.
 *
 * Endpoint : https://www.hatvp.fr/livraison/merge/declarations.xml
 * Fichier XML unique (~78 Mo), mis a jour mensuellement.
 *
 * Strategie de chargement :
 *   - Au premier appel, le fichier XML est telecharge via fetch natif (cache disque 7 jours).
 *   - Un mini-parseur regex extrait les blocs declaration.
 *   - L'index en memoire est construit : Map par nom normalise.
 *   - Les appels suivants interrogent l'index en O(n) sur les cles.
 *
 * Avertissement latence initiale : le telechargement + parsing du XML prend 5-15 s
 * selon le reseau et le CPU. C'est un cout one-shot compense par le cache disque 7 jours.
 *
 * Limites :
 *   - Le parseur regex ne supporte pas les balises XML avec namespaces non standards.
 *   - Les declarations d'interets complexes sont retournees en format texte aplati dans bio.
 *   - Seules les declarations publiees sont indexees.
 */

import { BaseConnecteur } from '../base.js';
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js';

const URL_XML = 'https://www.hatvp.fr/livraison/merge/declarations.xml';

/** TTL cache specifique : 7 jours (le dataset HATVP est mensuel). */
const TTL_HATVP_MS = 7 * 24 * 60 * 60 * 1000;

/** Regex d'extraction d'un bloc declaration complet. */
const REGEX_DECLARATION = /<declaration>([\s\S]*?)<\/declaration>/gi;

/**
 * Construit une regex d'extraction de la valeur d'une balise simple.
 *
 * @param {string} balise
 * @returns {RegExp}
 */
function regexChamp(balise) {
  return new RegExp(`<${balise}[^>]*>([\\s\\S]*?)<\\/${balise}>`, 'i');
}

/**
 * Extrait le texte d'une balise dans un bloc XML.
 *
 * @param {string} bloc - Fragment XML
 * @param {string} balise - Nom de la balise
 * @returns {string|null}
 */
function extraireChamp(bloc, balise) {
  const m = regexChamp(balise).exec(bloc);
  if (!m) return null;
  return m[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim() || null;
}

/**
 * Extrait toutes les occurrences d'une balise dans un bloc.
 *
 * @param {string} bloc
 * @param {string} balise
 * @returns {string[]}
 */
function extraireChampsTous(bloc, balise) {
  const regex = new RegExp(`<${balise}[^>]*>([\\s\\S]*?)<\\/${balise}>`, 'gi');
  const resultats = [];
  let m;
  while ((m = regex.exec(bloc)) !== null) {
    const valeur = m[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    if (valeur) resultats.push(valeur);
  }
  return resultats;
}

/**
 * Normalise une chaine pour la recherche (minuscules, sans accents, sans ponctuation).
 *
 * @param {string} chaine
 * @returns {string}
 */
function normaliserRecherche(chaine) {
  return chaine
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default class HatvpConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'hatvp',
      version: '1.0.0',
      baseUrl: URL_XML,
      rateLimit: {
        debit: Number(process.env.HATVP_RATE_LIMIT_DEBIT) || 1,
        capacite: Number(process.env.HATVP_RATE_LIMIT_CAPACITE) || 3,
      },
      ttlCache: TTL_HATVP_MS,
      timeoutMs: 120_000, // Le fichier XML fait ~78 Mo
    });

    /** @type {Map<string, object>|null} Index par nom normalise */
    this._indexNom = null;
    /** @type {boolean} Garde-fou anti-double chargement concurrent */
    this._chargementEnCours = false;
    /** @type {Promise<void>|null} Promesse du chargement en cours */
    this._promesseChargement = null;
  }

  /**
   * Recherche de declarants par nom (personne physique).
   *
   * @param {string} query - Nom ou prenom a rechercher (min 2 caracteres)
   * @param {object} [_options]
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query, _options = {}) {
    const terme = String(query ?? '').trim();
    if (terme.length < 2) return this._enveloppe([]);

    await this._assureIndex();
    if (!this._indexNom || this._indexNom.size === 0) return this._enveloppe([]);

    const termeNormalise = normaliserRecherche(terme);
    const resultats = [];

    for (const [cleNom, declaration] of this._indexNom) {
      if (cleNom.includes(termeNormalise)) {
        resultats.push(this._mappageDeclaration(declaration));
        if (resultats.length >= 10) break;
      }
    }

    return this._enveloppe(resultats);
  }

  /**
   * Detail d'un declarant par son identifiant normalise (format "nom prenom").
   *
   * @param {string} id
   * @returns {Promise<{ entite: object|null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(id) {
    await this._assureIndex();
    if (!this._indexNom) {
      return {
        entite: null,
        source: 'HATVP',
        dateRecuperation: new Date().toISOString(),
        version: this.version,
      };
    }

    const idNormalise = normaliserRecherche(id);
    let trouvee = null;

    for (const [cle, declaration] of this._indexNom) {
      if (cle === idNormalise || cle.startsWith(idNormalise)) {
        trouvee = declaration;
        break;
      }
    }

    return {
      entite: trouvee ? this._mappageDeclaration(trouvee) : null,
      source: 'HATVP',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  /**
   * Liens suggeres depuis un declarant HATVP.
   *
   * @param {string} id
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(id) {
    const detail = await this.detailler(id);
    const liens = detail.entite?.liensSuggeres ?? [];
    return {
      liens,
      source: 'HATVP',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }

  // --- Methodes internes ---

  /**
   * Charge le XML HATVP et construit l'index en memoire si necessaire.
   * Idempotent et thread-safe : utilise une promesse partagee pour eviter
   * les doubles telechargements concurrents.
   *
   * @returns {Promise<void>}
   */
  async _assureIndex() {
    if (this._indexNom !== null) return;

    if (this._promesseChargement) {
      await this._promesseChargement;
      return;
    }

    this._promesseChargement = this._charger();
    try {
      await this._promesseChargement;
    } finally {
      this._promesseChargement = null;
    }
  }

  /**
   * Effectue le telechargement et le parsing du XML.
   *
   * @returns {Promise<void>}
   */
  async _charger() {
    try {
      const xmlTexte = await this._telechargerXmlBrut(URL_XML);
      this._indexNom = this._construireIndex(xmlTexte);
    } catch (err) {
      console.error(`[hatvp] Echec du chargement XML : ${err.message}`);
      // Index vide pour ne pas bloquer indefiniment les appels suivants
      this._indexNom = new Map();
    }
  }

  /**
   * Telecharge le XML HATVP en brut (text), en contournant le parseur JSON de _appelHttp.
   * Valide l'URL anti-SSRF via la fonction exportee de base.js.
   *
   * @param {string} url
   * @returns {Promise<string>}
   */
  async _telechargerXmlBrut(url) {
    const { validerUrlDestination } = await import('../base.js');
    validerUrlDestination('hatvp', url);

    const userAgent =
      process.env.ENRICHISSEMENT_USER_AGENT ??
      'reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)';

    const controleur = new AbortController();
    const minuterie = setTimeout(() => controleur.abort(), this.timeoutMs);

    try {
      const reponse = await fetch(url, {
        signal: controleur.signal,
        headers: {
          'User-Agent': userAgent,
          Accept: 'application/xml, text/xml, */*',
        },
      });

      if (!reponse.ok) {
        throw new Error(`HTTP ${reponse.status} sur ${url}`);
      }

      return await reponse.text();
    } finally {
      clearTimeout(minuterie);
    }
  }

  /**
   * Parse le XML et construit un index Map<nomNormalise, declarationParsee>.
   *
   * @param {string} xmlTexte
   * @returns {Map<string, object>}
   */
  _construireIndex(xmlTexte) {
    const index = new Map();
    const regex = new RegExp(REGEX_DECLARATION.source, 'gi');
    let match;

    while ((match = regex.exec(xmlTexte)) !== null) {
      const bloc = match[1];
      const declaration = this._parserBloc(bloc);
      if (!declaration.nom) continue;

      const cle = normaliserRecherche(`${declaration.nom} ${declaration.prenom ?? ''}`);
      if (!index.has(cle)) {
        index.set(cle, declaration);
      }
    }

    return index;
  }

  /**
   * Parse un bloc declaration et retourne un objet structure.
   *
   * @param {string} bloc - Contenu interne du bloc declaration
   * @returns {object}
   */
  _parserBloc(bloc) {
    const mandats = extraireChampsTous(bloc, 'libelle');
    const participations = extraireChampsTous(bloc, 'denomination');

    // Heuristique qualite : ELU si mandat electif detecte, sinon HAUT_FONCTIONNAIRE
    const textesMandats = mandats.join(' ');
    const qualite =
      /\b(depute|senateur|maire|conseiller|president|elu|assemblee|senat|parlament)/i.test(
        textesMandats,
      )
        ? 'ELU'
        : 'HAUT_FONCTIONNAIRE';

    return {
      nom: extraireChamp(bloc, 'nom'),
      prenom: extraireChamp(bloc, 'prenom'),
      dateNaissance: extraireChamp(bloc, 'dateDeNaissance'),
      fonctionPrincipale: extraireChamp(bloc, 'fonctionPrincipale') ?? mandats[0] ?? null,
      mandats,
      participations,
      parti:
        extraireChamp(bloc, 'partipolitique') ??
        extraireChamp(bloc, 'parti'),
      qualite,
    };
  }

  /**
   * Mappe une declaration parsee vers une EntiteNormalisee de type Personne.
   *
   * @param {object} declaration
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageDeclaration(declaration) {
    const sourceInfo = { source: 'HATVP', url: URL_XML };

    const bioParties = [];
    if (declaration.mandats.length > 0) {
      bioParties.push(`Mandats : ${declaration.mandats.slice(0, 5).join(', ')}`);
    }
    if (declaration.participations.length > 0) {
      bioParties.push(`Participations : ${declaration.participations.slice(0, 5).join(', ')}`);
    }

    const champs = {
      nom: marquerProvenance(declaration.nom, sourceInfo),
      prenom: marquerProvenance(declaration.prenom, sourceInfo),
      dateNaissance: marquerProvenance(declaration.dateNaissance, sourceInfo),
      pays: marquerProvenance('France', sourceInfo),
      rolePrincipal: marquerProvenance(declaration.fonctionPrincipale, sourceInfo),
      bio: marquerProvenance(bioParties.join(' — ') || null, sourceInfo),
      qualiteInfluence: marquerProvenance(declaration.qualite, sourceInfo),
    };

    const liensSuggeres = [];
    const maintenant = new Date().toISOString();

    // Mandats electifs -> institutions
    for (const mandat of declaration.mandats.slice(0, 3)) {
      liensSuggeres.push({
        vers: { type: 'Organisation', identifiantExterne: mandat },
        typeLienCode: 'MANDAT_ELECTIF',
        source: 'HATVP',
        url: URL_XML,
        date: maintenant,
      });
    }

    // Participations dans des entreprises -> DIRIGEANT
    for (const participation of declaration.participations.slice(0, 3)) {
      liensSuggeres.push({
        vers: { type: 'Organisation', identifiantExterne: participation },
        typeLienCode: 'DIRIGEANT',
        source: 'HATVP',
        url: URL_XML,
        date: maintenant,
      });
    }

    // Affiliation parti politique
    if (declaration.parti) {
      liensSuggeres.push({
        vers: { type: 'Organisation', identifiantExterne: declaration.parti },
        typeLienCode: 'AFFILIATION_PARTI',
        source: 'HATVP',
        url: URL_XML,
        date: maintenant,
      });
    }

    return creerEntiteNormalisee('Personne', champs, liensSuggeres);
  }

  /** Enveloppe un tableau de resultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'HATVP',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    };
  }
}
