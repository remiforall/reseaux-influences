/**
 * @module connecteurs/sources/ddosecrets
 * Connecteur Distributed Denial of Secrets (DDoSecrets) — STUB DÉSACTIVÉ.
 *
 * Ce connecteur est intentionnellement désactivé et ne fait aucun appel réseau.
 *
 * Raison de la désactivation (ADR-010, ADR-013) :
 *   DDoSecrets publie des datasets issus de fuites de données dont la licéité
 *   varie fortement selon les publications. L'utilisation en France expose à :
 *   - Art. 323-3 Code pénal (recel de données issues d'accès frauduleux)
 *   - Art. L226-1 Code pénal (atteinte à la vie privée) pour certains datasets
 *   - Risque RGPD sur les données de personnes physiques non publiques
 *
 *   Certains datasets DDoSecrets ont une valeur journalistique reconnue et ont
 *   été utilisés par des médias mainstream — mais une analyse au cas par cas
 *   est indispensable avant toute utilisation dans ce projet.
 *
 * Activation manuelle :
 *   Ce connecteur NE DOIT PAS être activé sans :
 *   1. Audit juridique externe par un avocat spécialisé droit des médias / RGPD
 *   2. Identification précise des datasets visés et de leur statut juridique
 *   3. Mise à jour de l'ADR-010 avec les conclusions de l'audit
 *
 * Ce stub retourne proprement des tableaux vides sans aucun appel réseau.
 */

export default class DdoSecretsConnecteur {
  constructor() {
    this.nom = 'ddosecrets'
    this.version = '0.0.0-stub'
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
      source: 'DDoSecrets (désactivé)',
      avertissement:
        'Connecteur désactivé par défaut — risque juridique français (art. 323-3 du Code pénal, RGPD). ' +
        'À activer manuellement APRÈS audit juridique externe et analyse dataset par dataset (ADR-010).',
      version: this.version,
    }
  }

  /**
   * @param {string} _id
   * @returns {Promise<{ entite: null, source: string, avertissement: string, version: string }>}
   */
  async detailler(_id) {
    return {
      entite: null,
      source: 'DDoSecrets (désactivé)',
      avertissement: 'Connecteur désactivé — voir ADR-010.',
      version: this.version,
    }
  }

  /**
   * @param {string} _id
   * @returns {Promise<{ liens: [], source: string, avertissement: string, version: string }>}
   */
  async listerLiens(_id) {
    return {
      liens: [],
      source: 'DDoSecrets (désactivé)',
      avertissement: 'Connecteur désactivé — voir ADR-010.',
      version: this.version,
    }
  }
}
