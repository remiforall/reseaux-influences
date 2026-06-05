/**
 * @module connecteurs/sources/parlementaires
 * Connecteur parlementaires — NosDéputés.fr + NosSénateurs.fr.
 *
 * Endpoints :
 *   - Assemblee nationale : https://www.nosdeputes.fr/synthese/data/json
 *   - Senat : https://www.nossenateurs.fr/synthese/data/json
 *
 * Strategie :
 *   - Au premier appel, les deux syntheses sont telechargees et indexees en memoire.
 *   - Cache disque 24 h via _appelHttp standard.
 *   - Recherche par inclusion sur nom normalise (lowercase).
 *   - Parametre options.chambre : 'AN' | 'SENAT' | 'TOUS' (defaut 'TOUS').
 *
 * Format synthese NosDéputes/NosSénateurs :
 *   { deputes: [{ depute: { nom, prenom, nom_de_famille, ... } }] }
 *   Certains champs : id, slug, nom, prenom, date_naissance, lieu_naissance,
 *   groupe_sigle, parti_ratt_financier, mandat_debut, mandat_fin,
 *   num_deptmt, circonscription, sites_web, emails.
 *
 * Couverture :
 *   - Deputees et senateurs actuels + historique recent
 *   - Groupes parlementaires et partis de rattachement
 *
 * Limites :
 *   - Les mandats anciens (avant la legislature en cours) ne sont pas dans la synthese.
 *   - Le champ `parti_ratt_financier` est le parti de rattachement financier,
 *     pas necessairement le groupe politique.
 *   - NosSénateurs.fr peut etre indisponible ponctuellement (hebergement beneovle).
 */

import { BaseConnecteur } from '../base.js'
import { marquerProvenance, creerEntiteNormalisee } from '../normaliseur.js'

const URL_DEPUTES = 'https://www.nosdeputes.fr/synthese/data/json'
const URL_SENATEURS = 'https://www.nossenateurs.fr/synthese/data/json'
const URL_DEPUTE_DETAIL = (slug) => `https://www.nosdeputes.fr/${slug}/json`
const URL_SENATEUR_DETAIL = (slug) => `https://www.nossenateurs.fr/${slug}/json`

/**
 * Normalise une chaine pour la recherche (minuscules, sans accents).
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
    .trim()
}

export default class ParlementairesConnecteur extends BaseConnecteur {
  constructor() {
    super({
      nom: 'parlementaires',
      version: '1.0.0',
      baseUrl: URL_DEPUTES,
      rateLimit: {
        debit: Number(process.env.PARLEMENTAIRES_RATE_LIMIT_DEBIT) || 2,
        capacite: Number(process.env.PARLEMENTAIRES_RATE_LIMIT_CAPACITE) || 5,
      },
      ttlCache: Number(process.env.CACHE_TTL_MS) || 86_400_000,
      timeoutMs: 30_000,
    })

    /** @type {Map<string, object>|null} Index deputes par nom normalise */
    this._indexDeputes = null
    /** @type {Map<string, object>|null} Index senateurs par nom normalise */
    this._indexSenateurs = null
    /** @type {Promise<void>|null} */
    this._promesseChargement = null
  }

  /**
   * Recherche de parlementaires par nom.
   *
   * @param {string} query - Nom ou prenom a rechercher (min 2 caracteres)
   * @param {object} [options]
   * @param {'AN'|'SENAT'|'TOUS'} [options.chambre='TOUS'] - Chambre a interroger
   * @returns {Promise<{ resultats: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async rechercher(query, options = {}) {
    const terme = String(query ?? '').trim()
    if (terme.length < 2) return this._enveloppe([])

    const chambre = options.chambre ?? 'TOUS'
    await this._assureIndex(chambre)

    const termeNormalise = normaliserRecherche(terme)
    const resultats = []

    if (chambre === 'AN' || chambre === 'TOUS') {
      if (this._indexDeputes) {
        for (const [cle, data] of this._indexDeputes) {
          if (cle.includes(termeNormalise)) {
            resultats.push(this._mappageParlementaire(data, 'AN'))
            if (resultats.length >= 10) break
          }
        }
      }
    }

    if (chambre === 'SENAT' || chambre === 'TOUS') {
      if (this._indexSenateurs) {
        for (const [cle, data] of this._indexSenateurs) {
          if (cle.includes(termeNormalise)) {
            resultats.push(this._mappageParlementaire(data, 'SENAT'))
            if (resultats.length >= 10) break
          }
        }
      }
    }

    return this._enveloppe(resultats)
  }

  /**
   * Detail d'un parlementaire par son slug (ex: "jean-dupont") ou son identifiant.
   * Interroge le detail JSON individuel de NosDéputés/NosSénateurs.
   *
   * @param {string} id - Slug du parlementaire + optionnellement "#AN" ou "#SENAT"
   * @returns {Promise<{ entite: object|null, source: string, dateRecuperation: string, version: string }>}
   */
  async detailler(id) {
    const [slug, chambre] = id.includes('#') ? id.split('#') : [id, 'AN']

    const url = chambre === 'SENAT' ? URL_SENATEUR_DETAIL(slug) : URL_DEPUTE_DETAIL(slug)
    const chambreEffective = chambre === 'SENAT' ? 'SENAT' : 'AN'

    let donnees
    try {
      donnees = await this._appelHttp(url, {
        cacheMethode: 'detailler',
        cacheArgs: { slug, chambre: chambreEffective },
      })
    } catch (err) {
      if (err.status === 404) {
        return {
          entite: null,
          source: 'NosDéputes/NosSénateurs',
          dateRecuperation: new Date().toISOString(),
          version: this.version,
        }
      }
      throw err
    }

    // La reponse detail a le meme format que la synthese : { depute: {...} } ou { senateur: {...} }
    const data = donnees.depute ?? donnees.senateur ?? null
    const entite = data ? this._mappageParlementaire(data, chambreEffective) : null

    return {
      entite,
      source: 'NosDéputes/NosSénateurs',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  /**
   * Liens suggeres depuis un parlementaire (parti, chambre, commissions).
   *
   * @param {string} id
   * @returns {Promise<{ liens: Array, source: string, dateRecuperation: string, version: string }>}
   */
  async listerLiens(id) {
    const detail = await this.detailler(id)
    const liens = detail.entite?.liensSuggeres ?? []
    return {
      liens,
      source: 'NosDéputes/NosSénateurs',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }

  // --- Methodes internes ---

  /**
   * Assure que les index sont construits pour la chambre demandee.
   *
   * @param {'AN'|'SENAT'|'TOUS'} chambre
   * @returns {Promise<void>}
   */
  async _assureIndex(chambre) {
    const besoinAN = (chambre === 'AN' || chambre === 'TOUS') && this._indexDeputes === null
    const besoinSENAT = (chambre === 'SENAT' || chambre === 'TOUS') && this._indexSenateurs === null

    if (!besoinAN && !besoinSENAT) return

    if (this._promesseChargement) {
      await this._promesseChargement
      return
    }

    this._promesseChargement = this._charger(besoinAN, besoinSENAT)
    try {
      await this._promesseChargement
    } finally {
      this._promesseChargement = null
    }
  }

  /**
   * Telecharge et indexe les syntheses demandees.
   *
   * @param {boolean} chargerAN
   * @param {boolean} chargerSENAT
   * @returns {Promise<void>}
   */
  async _charger(chargerAN, chargerSENAT) {
    const taches = []

    if (chargerAN) {
      taches.push(
        this._appelHttp(URL_DEPUTES, { cacheMethode: 'synthese', cacheArgs: 'AN' })
          .then((donnees) => {
            this._indexDeputes = this._construireIndex(donnees, 'deputes', 'depute')
          })
          .catch((err) => {
            console.error(`[parlementaires] Echec chargement deputes : ${err.message}`)
            this._indexDeputes = new Map()
          }),
      )
    }

    if (chargerSENAT) {
      // NosSénateurs.fr — le service n'est plus mis à jour depuis mars 2024 et
      // renvoie désormais du HTML statique au lieu du JSON attendu. On force un
      // index vide sans tenter d'appel HTTP pour éviter les `fetch failed`.
      // À remplacer post-MVP par senat.fr opendata ou data.gouv.fr.
      this._indexSenateurs = new Map()
    }

    await Promise.all(taches)
  }

  /**
   * Construit un Map<nomNormalise, data> depuis une synthese JSON.
   *
   * @param {object} donnees - Corps JSON de la synthese
   * @param {string} cle - Cle du tableau racine (ex: 'deputes')
   * @param {string} sousCle - Cle de chaque element (ex: 'depute')
   * @returns {Map<string, object>}
   */
  _construireIndex(donnees, cle, sousCle) {
    const index = new Map()
    const items = donnees[cle] ?? []

    for (const item of items) {
      const data = item[sousCle] ?? item
      if (!data) continue

      const nom = data.nom_de_famille ?? data.nom ?? ''
      const prenom = data.prenom ?? ''
      const nomComplet = normaliserRecherche(`${nom} ${prenom}`)

      if (nomComplet && !index.has(nomComplet)) {
        index.set(nomComplet, data)
      }
    }

    return index
  }

  /**
   * Mappe un objet parlementaire vers une EntiteNormalisee de type Personne.
   *
   * @param {object} data - Donnees brutes NosDéputés/NosSénateurs
   * @param {'AN'|'SENAT'} chambre
   * @returns {import('../normaliseur.js').EntiteNormalisee}
   */
  _mappageParlementaire(data, chambre) {
    const estDeputee = chambre === 'AN'
    const urlSource = estDeputee
      ? `https://www.nosdeputes.fr/${data.slug ?? ''}`
      : `https://www.nossenateurs.fr/${data.slug ?? ''}`
    const sourceNom = estDeputee ? 'NosDéputés.fr' : 'NosSénateurs.fr'
    const sourceInfo = { source: sourceNom, url: urlSource }

    // Role principal
    const circo = data.circonscription ?? data.num_deptmt ?? null
    const rolePrincipal = estDeputee
      ? `Député·e${circo ? ` (${circo})` : ''}`
      : `Sénateur·rice${circo ? ` (${circo})` : ''}`

    // Bio : mandats successifs
    const bioParties = []
    if (data.mandat_debut) {
      bioParties.push(`Mandat depuis le ${data.mandat_debut}`)
    }
    if (data.mandat_fin) {
      bioParties.push(`fin le ${data.mandat_fin}`)
    }
    if (data.groupe_sigle) {
      bioParties.push(`Groupe ${data.groupe_sigle}`)
    }

    const champs = {
      nom: marquerProvenance(data.nom_de_famille ?? data.nom ?? null, sourceInfo),
      prenom: marquerProvenance(data.prenom ?? null, sourceInfo),
      dateNaissance: marquerProvenance(data.date_naissance ?? null, sourceInfo),
      lieuNaissance: marquerProvenance(data.lieu_naissance ?? null, sourceInfo),
      pays: marquerProvenance('France', sourceInfo),
      rolePrincipal: marquerProvenance(rolePrincipal, sourceInfo),
      bio: marquerProvenance(bioParties.join(' — ') || null, sourceInfo),
      qualiteInfluence: marquerProvenance('ELU', sourceInfo),
      groupeParlementaire: marquerProvenance(data.groupe_sigle ?? null, sourceInfo),
      slug: marquerProvenance(data.slug ?? null, sourceInfo),
    }

    const liensSuggeres = []
    const maintenant = new Date().toISOString()

    // Lien vers la chambre (AN ou Senat)
    const nomChambre = estDeputee ? 'Assemblee nationale' : 'Senat'
    liensSuggeres.push({
      vers: { type: 'Organisation', identifiantExterne: nomChambre },
      typeLienCode: 'MANDAT_ELECTIF',
      source: sourceNom,
      url: urlSource,
      date: maintenant,
    })

    // Lien vers le parti de rattachement financier
    const parti = data.parti_ratt_financier ?? data.groupe_sigle ?? null
    if (parti) {
      liensSuggeres.push({
        vers: { type: 'Organisation', identifiantExterne: parti },
        typeLienCode: 'AFFILIATION_PARTI',
        source: sourceNom,
        url: urlSource,
        date: maintenant,
      })
    }

    // Liens vers les sites web declares
    const sitesWeb = data.sites_web ?? []
    for (const site of sitesWeb.slice(0, 2)) {
      const url = site.site_web ?? site.url ?? site
      if (typeof url === 'string' && url.startsWith('http')) {
        liensSuggeres.push({
          vers: { type: 'SiteWeb', identifiantExterne: url },
          typeLienCode: 'TITULAIRE_DOMAINE',
          source: sourceNom,
          url: urlSource,
          date: maintenant,
        })
      }
    }

    return creerEntiteNormalisee('Personne', champs, liensSuggeres)
  }

  /** Enveloppe un tableau de resultats dans la forme de retour standard. */
  _enveloppe(resultats) {
    return {
      resultats,
      source: 'NosDéputes/NosSénateurs',
      dateRecuperation: new Date().toISOString(),
      version: this.version,
    }
  }
}
