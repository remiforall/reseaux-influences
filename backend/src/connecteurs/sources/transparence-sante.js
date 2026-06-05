/**
 * @module connecteurs/sources/transparence-sante
 * Connecteur Transparence Sante (Sunshine Act FR).
 *
 * SOURCE OFFICIELLE : https://base-donnees-publique.medicaments.gouv.fr/
 * Dataset cible : conventions, avantages et remunerations entre laboratoires
 * pharmaceutiques et professionnels de sante / associations / etudiants.
 *
 * ETAT IMPLEMENTATION : STUB — dataset non integre (post-MVP).
 *
 * TODO ADR-012 : Le dataset "Transparence Sante" est accessible via l'API
 * OpenDataSoft sur transparence.sante.gouv.fr, mais l'exploration des endpoints
 * disponibles (2026-05-12) montre :
 *
 *   1. L'API d'exploration retourne une liste de datasets mais les records
 *      sont pagines sur des millions de lignes et ne proposent pas d'endpoint
 *      de recherche textuelle par beneficiaire performant sans cle API.
 *
 *   2. Le dataset CSV complet depasse 500 Mo, ce qui rend un telechargement
 *      en memoire inadapte au contexte Infomaniak mutualise (512 Mo RAM max).
 *
 *   3. Un endpoint de recherche par nom de beneficiaire existe sur
 *      https://transparence.sante.gouv.fr/flow/main mais n'est pas documente
 *      en tant qu'API publique stable et necessite une investigation supplementaire.
 *
 * Prochaines etapes (post-MVP) :
 *   - Identifier et documenter l'endpoint de recherche par beneficiaire.
 *   - Implementer le connecteur avec pagination et cache disque.
 *   - Ajouter des TypeLiens specifiques : AVANTAGE_RECU, CONVENTION_SIGNEE.
 *
 * Ce stub retourne toujours un tableau vide sans appel reseau.
 */

import { BaseConnecteur } from '../base.js'

export default class TransparenceSanteConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'transparence-sante',
      version: '0.1.0-stub',
      baseUrl: 'https://transparence.sante.gouv.fr',
      rateLimit: {
        debit: Number(process.env.TRANSPARENCE_SANTE_RATE_LIMIT_DEBIT) || 2,
        capacite: Number(process.env.TRANSPARENCE_SANTE_RATE_LIMIT_CAPACITE) || 5,
      },
    })
  }

  /**
   * Recherche de beneficiaires dans le dataset Transparence Sante.
   *
   * Stub — retourne toujours un tableau vide.
   * Voir commentaire module pour l'etat d'avancement.
   *
   * @param {string} _query
   * @returns {Promise<{ resultats: [], source: string, dateRecuperation: string, version: string, avertissement: string }>}
   */
  async rechercher(_query) {
    return this._enveloppe([])
  }

  /**
   * Detail d'un beneficiaire par identifiant.
   *
   * Stub — retourne toujours null.
   *
   * @param {string} _id
   * @returns {Promise<{ entite: null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(_id) {
    return {
      entite: null,
      source: 'Transparence Sante',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
      avertissement: 'Connecteur en cours de developpement — voir ADR-012 pour le calendrier.',
    }
  }

  /**
   * Liste les liens entre un beneficiaire et des laboratoires.
   *
   * Stub — retourne toujours un tableau vide.
   *
   * @param {string} _id
   * @returns {Promise<{ liens: [], source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(_id) {
    return {
      liens: [],
      source: 'Transparence Sante',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  /** Enveloppe standard avec avertissement stub. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'Transparence Sante',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
      avertissement: 'Connecteur en cours de developpement — voir ADR-012 pour le calendrier.',
    }
  }
}
