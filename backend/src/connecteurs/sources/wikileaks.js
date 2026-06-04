/**
 * @module connecteurs/sources/wikileaks
 * Connecteur WikiLeaks — STUB DÉSACTIVÉ.
 *
 * Ce connecteur est intentionnellement désactivé et ne fait aucun appel réseau.
 *
 * Raison de la désactivation (ADR-010, ADR-013) :
 *   L'utilisation de données issues de WikiLeaks en France expose à un risque
 *   juridique non négligeable au titre de l'art. 323-3 du Code pénal (recel
 *   de données obtenues par accès frauduleux à un système informatique).
 *   Contrairement aux données ICIJ (publiées par un consortium de journalistes
 *   après vérification), les publications WikiLeaks incluent des données brutes
 *   dont la licéité de l'origine n'est pas établie dans tous les cas.
 *
 * Activation manuelle :
 *   Ce connecteur NE DOIT PAS être activé sans :
 *   1. Audit juridique externe par un avocat spécialisé droit des médias / RGPD
 *   2. Analyse au cas par cas des datasets visés (certains sont librement utilisables,
 *      d'autres exposent à des risques)
 *   3. Mise à jour de l'ADR-010 avec les conclusions de l'audit
 *
 * En attendant, ce stub retourne proprement des tableaux vides sans aucun appel réseau.
 */

export default class WikiLeaksConnecteur {
  constructor() {
    this.nom = 'wikileaks';
    this.version = '0.0.0-stub';
  }

  /**
   * Retourne un résultat vide avec avertissement juridique.
   * Aucun appel réseau, aucune dépendance externe.
   *
   * @param {string} _query
   * @returns {Promise<{ resultats: [], source: string, avertissement: string, version: string }>}
   */
  async rechercher(_query) {
    return {
      resultats: [],
      source: 'WikiLeaks (désactivé)',
      avertissement:
        'Connecteur désactivé par défaut — risque juridique français (art. 323-3 du Code pénal recel). ' +
        'À activer manuellement APRÈS audit juridique externe (ADR-010).',
      version: this.version,
    };
  }

  /**
   * @param {string} _id
   * @returns {Promise<{ entite: null, source: string, avertissement: string, version: string }>}
   */
  async detailler(_id) {
    return {
      entite: null,
      source: 'WikiLeaks (désactivé)',
      avertissement: 'Connecteur désactivé — voir ADR-010.',
      version: this.version,
    };
  }

  /**
   * @param {string} _id
   * @returns {Promise<{ liens: [], source: string, avertissement: string, version: string }>}
   */
  async listerLiens(_id) {
    return {
      liens: [],
      source: 'WikiLeaks (désactivé)',
      avertissement: 'Connecteur désactivé — voir ADR-010.',
      version: this.version,
    };
  }
}
