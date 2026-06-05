/**
 * @module services/import-enrichissement
 * Création transactionnelle d'entités depuis une preview OSINT.
 *
 * Garde-fou ADR-006 : si `qualiteInfluencePublique` est absent ou vide,
 * l'import est refusé avec un message explicite (RGPD art. 85 + LIL art. 80).
 *
 * Transaction Prisma :
 *   1. Créer l'entité principale (Personne / Organisation / SiteWeb) en EN_ATTENTE
 *      avec la qualité d'influence déclarée.
 *   2. Upsert des Source pour chaque provenance utilisée (par URL unique).
 *   3. Pour chaque lien retenu : résoudre la cible par identifiant exact (wikidataId,
 *      siren ou domaine). Si aucun match exact → créer en EN_ATTENTE (M-07 : pas de
 *      matching flou `contains` pour éviter les faux positifs).
 *   4. Créer une entrée Historique par entité créée.
 *   5. Enregistrer l'audit RGPD DANS la transaction (C-02 : atomicité garantie).
 */

import { prisma } from '../utils/prisma.js'
import { enregistrerAudit } from '../connecteurs/audit.js'

/**
 * Whitelist des champs acceptés par type d'entité.
 * Protège contre le mass-assignment (SEC-I-05 / SEC-I-06).
 */
const CHAMPS_AUTORISES = {
  Personne: [
    'nom',
    'prenom',
    'pays',
    'nationalite',
    'dateNaissance',
    'rolePrincipal',
    'bio',
    'photoUrl',
    'wikipediaUrl',
    'wikidataId',
    // Géolocalisation lieu de naissance (L1 Passe 5 — données issues de Wikidata P19/P625)
    'lieuNaissance',
    'lieuNaissanceCodeInsee',
    'lieuNaissanceLat',
    'lieuNaissanceLon',
  ],
  Organisation: [
    'nom',
    'sigle',
    'typeOrganisation',
    'pays',
    'siteWeb',
    'description',
    'logoUrl',
    'dateCreation',
    'dateFin',
    'wikipediaUrl',
    'wikidataId',
    'adresseSiege',
  ],
  SiteWeb: [
    'domaine',
    'url',
    'titre',
    'description',
    'dateEnregistrement',
    'dateExpiration',
    'registrar',
    'hebergeurProbable',
    'nameservers',
  ],
}

/**
 * Valide qu'une URL est bien http(s) avant de l'insérer en base (SEC-I-01).
 *
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
/**
 * Convertit une date (string ISO, YYYY-MM-DD, ou Date) en objet Date Prisma-compatible.
 * Retourne null si la valeur est falsy ou invalide.
 *
 * @param {string|Date|null|undefined} valeur
 * @returns {Date|null}
 */
function parseDate(valeur) {
  if (!valeur) return null
  if (valeur instanceof Date) return Number.isNaN(valeur.getTime()) ? null : valeur
  if (typeof valeur !== 'string') return null
  const v = valeur.trim()
  if (!v) return null
  // YYYY ou YYYY-MM ou YYYY-MM-DD ou ISO complet
  const date = /^\d{4}$/.test(v)
    ? new Date(`${v}-01-01T00:00:00Z`)
    : /^\d{4}-\d{2}$/.test(v)
      ? new Date(`${v}-01T00:00:00Z`)
      : /^\d{4}-\d{2}-\d{2}$/.test(v)
        ? new Date(`${v}T00:00:00Z`)
        : new Date(v)
  return Number.isNaN(date.getTime()) ? null : date
}

function validerUrl(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.protocol === 'http:' || u.protocol === 'https:') return url
    return null
  } catch {
    return null
  }
}

/**
 * Résout l'identifiant d'une entité cible depuis ses identifiants EXTERNES STRICTS.
 *
 * M-07 : On ne fait plus de matching flou (`contains`) sur le nom.
 * Si aucun identifiant externe connu ne matche (wikidataId, siren, domaine),
 * retourne null → la cible sera créée en EN_ATTENTE.
 *
 * @param {{ type: string, identifiantExterne: string, wikidataId?: string, siren?: string, domaine?: string }} cible
 * @param {import('@prisma/client').PrismaClient} tx - client transactionnel
 * @returns {Promise<{ id: string, type: string }|null>}
 */
async function resoudreCible(cible, tx) {
  const { type, wikidataId, domaine } = cible

  if (type === 'Personne') {
    if (!wikidataId) return null
    const entite = await tx.personne.findFirst({ where: { wikidataId }, select: { id: true } })
    return entite ? { id: entite.id, type: 'Personne' } : null
  }

  if (type === 'Organisation') {
    if (!wikidataId) return null
    const entite = await tx.organisation.findFirst({ where: { wikidataId }, select: { id: true } })
    return entite ? { id: entite.id, type: 'Organisation' } : null
  }

  if (type === 'SiteWeb') {
    if (!domaine) return null
    const entite = await tx.siteWeb.findFirst({ where: { domaine } }, { select: { id: true } })
    return entite ? { id: entite.id, type: 'SiteWeb' } : null
  }

  return null
}

/**
 * Crée une entité cible minimale en EN_ATTENTE si elle n'existe pas.
 *
 * @param {{ type: string, identifiantExterne: string, wikidataId?: string }} cible
 * @param {string} utilisateurId
 * @param {import('@prisma/client').PrismaClient} tx
 * @returns {Promise<{ id: string, type: string }>}
 */
async function creerCibleEnAttente(cible, utilisateurId, tx) {
  const { type, identifiantExterne, wikidataId } = cible

  if (type === 'Personne') {
    // Extraire prénom/nom approximatifs depuis l'identifiant
    const parties = identifiantExterne.split(' ')
    const nom = parties.slice(-1)[0] ?? identifiantExterne
    const prenom = parties.length > 1 ? parties.slice(0, -1).join(' ') : null

    const nouvelle = await tx.personne.create({
      data: {
        nom,
        prenom,
        statut: 'EN_ATTENTE',
        creeParId: utilisateurId,
        wikidataId: wikidataId ?? null,
      },
      select: { id: true },
    })
    return { id: nouvelle.id, type: 'Personne' }
  }

  if (type === 'Organisation') {
    const nouvelle = await tx.organisation.create({
      data: {
        nom: identifiantExterne,
        typeOrganisation: 'AUTRE',
        statut: 'EN_ATTENTE',
        creeParId: utilisateurId,
        wikidataId: wikidataId ?? null,
      },
      select: { id: true },
    })
    return { id: nouvelle.id, type: 'Organisation' }
  }

  if (type === 'SiteWeb') {
    const nouvelle = await tx.siteWeb.create({
      data: {
        domaine: identifiantExterne,
        statut: 'EN_ATTENTE',
        creeParId: utilisateurId,
      },
      select: { id: true },
    })
    return { id: nouvelle.id, type: 'SiteWeb' }
  }

  throw new Error(`Type d'entité cible inconnu : ${type}`)
}

/**
 * Résout ou crée le TypeLien en base par son code.
 *
 * @param {string} code
 * @param {import('@prisma/client').PrismaClient} tx
 * @returns {Promise<number>} L'id du TypeLien
 */
async function obtenirTypeLienId(code, tx) {
  const type = await tx.typeLien.findUnique({ where: { code }, select: { id: true } })
  if (type) return type.id

  // Créer à la volée si inconnu (non seédé)
  const nouveau = await tx.typeLien.create({
    data: { code, libelle: code, categorie: 'autre' },
    select: { id: true },
  })
  return nouveau.id
}

/**
 * Extrait la valeur source depuis `champsRetenus[nomChamp]`.
 *
 * SEC-I-06 : le frontend peut envoyer soit un string (nom de source) soit un
 * objet candidat complet. On normalise toujours vers un string (nom de source).
 *
 * @param {unknown} valeur - Valeur brute dans champsRetenus
 * @returns {string|null}
 */
function normaliserSourceChoisie(valeur) {
  if (!valeur) return null
  if (typeof valeur === 'string') return valeur
  // Format objet : { source: string, valeur: unknown, ... }
  if (typeof valeur === 'object' && typeof valeur.source === 'string') return valeur.source
  return null
}

/**
 * Importe une entité et ses liens depuis une preview OSINT.
 *
 * @param {{
 *   preview: import('../services/enrichissement.js').PreviewEntite,
 *   choixUtilisateur: {
 *     champsRetenus: Record<string, string|object>,
 *     liensRetenus: number[],
 *     typeEntite: 'Personne'|'Organisation'|'SiteWeb'
 *   },
 *   qualiteInfluencePublique: string,
 *   utilisateurId: string,
 *   ipAddress?: string|null
 * }} params
 * @returns {Promise<{ entitePrincipaleId: string, entitesCreees: { type: string, id: string }[], liensCrees: string[] }>}
 * @throws {Error} Si qualiteInfluencePublique est absent (garde-fou RGPD ADR-006)
 */
export async function importer({
  preview,
  choixUtilisateur,
  qualiteInfluencePublique,
  utilisateurId,
  ipAddress = null,
}) {
  // Garde-fou ADR-006 — obligatoire avant toute transaction
  if (!qualiteInfluencePublique) {
    throw new Error("Qualité d'influence publique requise (RGPD art. 85 + LIL art. 80)")
  }

  const { champsRetenus, liensRetenus = [], typeEntite } = choixUtilisateur
  const { candidatsParChamp, liensSuggeres = [], identifiantsExternes = {} } = preview

  // Whitelist des champs autorisés pour ce type d'entité (protection mass-assignment)
  const champsWhitelist = CHAMPS_AUTORISES[typeEntite] ?? []

  // Construire les données de l'entité principale depuis les champs retenus
  const donneesEntite = {
    qualiteInfluence: qualiteInfluencePublique,
    statut: 'EN_ATTENTE',
    creeParId: utilisateurId,
  }

  for (const [nomChamp, sourceRaw] of Object.entries(champsRetenus)) {
    // Ignorer les champs non autorisés (protection mass-assignment)
    if (!champsWhitelist.includes(nomChamp)) continue

    const sourceChoisie = normaliserSourceChoisie(sourceRaw)
    const candidats = candidatsParChamp[nomChamp] ?? []
    const candidat = sourceChoisie
      ? (candidats.find((c) => c.source === sourceChoisie) ?? candidats[0])
      : candidats[0]
    if (candidat) donneesEntite[nomChamp] = candidat.valeur
  }

  // Collecter les sources utilisées (provenance des champs retenus)
  const sourcesUtilisees = new Set()
  for (const [nomChamp, sourceRaw] of Object.entries(champsRetenus)) {
    if (!champsWhitelist.includes(nomChamp)) continue

    const sourceChoisie = normaliserSourceChoisie(sourceRaw)
    const candidats = candidatsParChamp[nomChamp] ?? []
    const candidat = sourceChoisie
      ? (candidats.find((c) => c.source === sourceChoisie) ?? candidats[0])
      : candidats[0]

    // SEC-I-01 : valider l'URL avant de l'inclure
    const urlValidee = validerUrl(candidat?.url)
    if (urlValidee) {
      sourcesUtilisees.add(
        JSON.stringify({ url: urlValidee, source: candidat.source, date: candidat.date }),
      )
    }
  }

  // Ajouter les identifiants externes connus
  if (identifiantsExternes.wikidataId) donneesEntite.wikidataId = identifiantsExternes.wikidataId

  /** @type {{ type: string, id: string }[]} */
  const entitesCreees = []
  /** @type {string[]} */
  const liensCrees = []

  // Préparer les paramètres d'audit avant la transaction (les données sont disponibles ici)
  const paramsAudit = {
    utilisateurId,
    requete: {
      query: identifiantsExternes.wikidataId ?? identifiantsExternes.domaine ?? typeEntite,
      types: [typeEntite.toLowerCase()],
      connecteurs:
        Object.keys(candidatsParChamp ?? {}).length > 0
          ? [
              ...new Set(
                Object.values(candidatsParChamp ?? {})
                  .flat()
                  .map((c) => c.source)
                  .filter(Boolean),
              ),
            ]
          : [],
    },
    connecteursUtilises: {},
    ipAddress,
  }

  await prisma.$transaction(async (tx) => {
    // Étape 1 : créer l'entité principale
    let entitePrincipale

    if (typeEntite === 'Personne') {
      entitePrincipale = await tx.personne.create({
        data: {
          nom: donneesEntite.nom ?? 'Inconnu',
          prenom: donneesEntite.prenom ?? null,
          pays: donneesEntite.pays ?? null,
          nationalite: donneesEntite.nationalite ?? null,
          dateNaissance: parseDate(donneesEntite.dateNaissance),
          bio: donneesEntite.bio ?? null,
          photoUrl: donneesEntite.photoUrl ?? null,
          wikipediaUrl: donneesEntite.wikipediaUrl ?? null,
          wikidataId: donneesEntite.wikidataId ?? null,
          // Géolocalisation lieu de naissance (L1 Passe 5 — Wikidata P19/P625)
          lieuNaissance: donneesEntite.lieuNaissance ?? null,
          lieuNaissanceCodeInsee: donneesEntite.lieuNaissanceCodeInsee ?? null,
          lieuNaissanceLat:
            donneesEntite.lieuNaissanceLat !== null && donneesEntite.lieuNaissanceLat !== undefined
              ? Number(donneesEntite.lieuNaissanceLat)
              : null,
          lieuNaissanceLon:
            donneesEntite.lieuNaissanceLon !== null && donneesEntite.lieuNaissanceLon !== undefined
              ? Number(donneesEntite.lieuNaissanceLon)
              : null,
          statut: 'EN_ATTENTE',
          qualiteInfluence: qualiteInfluencePublique,
          creeParId: utilisateurId,
        },
        select: { id: true },
      })
    } else if (typeEntite === 'Organisation') {
      entitePrincipale = await tx.organisation.create({
        data: {
          nom: donneesEntite.nom ?? 'Inconnu',
          sigle: donneesEntite.sigle ?? null,
          typeOrganisation: donneesEntite.typeOrganisation ?? 'AUTRE',
          pays: donneesEntite.pays ?? null,
          siteWeb: donneesEntite.siteWeb ?? null,
          description: donneesEntite.description ?? null,
          dateCreation: parseDate(donneesEntite.dateCreation),
          wikipediaUrl: donneesEntite.wikipediaUrl ?? null,
          wikidataId: donneesEntite.wikidataId ?? null,
          adresseSiege: donneesEntite.adresseSiege ?? null,
          statut: 'EN_ATTENTE',
          qualiteInfluence: qualiteInfluencePublique,
          creeParId: utilisateurId,
        },
        select: { id: true },
      })
    } else if (typeEntite === 'SiteWeb') {
      entitePrincipale = await tx.siteWeb.create({
        data: {
          domaine: donneesEntite.domaine ?? identifiantsExternes.domaine ?? 'inconnu',
          url: donneesEntite.url ?? null,
          titre: donneesEntite.titre ?? null,
          description: donneesEntite.description ?? null,
          dateEnregistrement: donneesEntite.dateEnregistrement ?? null,
          dateExpiration: donneesEntite.dateExpiration ?? null,
          registrar: donneesEntite.registrar ?? null,
          hebergeurProbable: donneesEntite.hebergeurProbable ?? null,
          nameservers: donneesEntite.nameservers ?? [],
          statut: 'EN_ATTENTE',
          qualiteInfluence: qualiteInfluencePublique,
          creeParId: utilisateurId,
        },
        select: { id: true },
      })
    } else {
      throw new Error(`Type d'entité inconnu : ${typeEntite}`)
    }

    entitesCreees.push({ type: typeEntite, id: entitePrincipale.id })

    // Étape 2 : upsert des Sources par URL
    const sourcesIds = new Map()
    for (const sourceJson of sourcesUtilisees) {
      const { url, source: mediaLibelle, date } = JSON.parse(sourceJson)
      if (!url) continue

      const sourceExistante = await tx.source.findFirst({
        where: { url: { equals: url } },
        select: { id: true },
      })

      if (sourceExistante) {
        sourcesIds.set(url, sourceExistante.id)
      } else {
        const nouvelleSource = await tx.source.create({
          data: {
            url,
            titre: mediaLibelle ?? url,
            media: mediaLibelle ?? null,
            typeMedia: 'WEB',
            verifiee: false,
            dateConsultation: date ? new Date(date) : new Date(),
            creeParId: utilisateurId,
          },
          select: { id: true },
        })
        sourcesIds.set(url, nouvelleSource.id)
      }
    }

    // Étape 3 : créer les liens retenus
    for (const indexLien of liensRetenus) {
      const lienSuggere = liensSuggeres[indexLien]
      if (!lienSuggere) continue

      const { vers, typeLienCode, url: lienUrl } = lienSuggere

      // Résoudre ou créer la cible (M-07 : matching strict, pas de `contains`)
      let cibleResolue = await resoudreCible(vers, tx)
      if (!cibleResolue) {
        cibleResolue = await creerCibleEnAttente(vers, utilisateurId, tx)
        entitesCreees.push(cibleResolue)

        // Historique pour la cible créée en attente (M-07 : traçabilité de l'absence de match)
        await tx.historique.create({
          data: {
            entiteType: cibleResolue.type,
            entiteId: cibleResolue.id,
            action: 'CREATION',
            donneesApres: {
              source: 'enrichissement_osint',
              viaEntite: entitePrincipale.id,
              note: 'Entité créée sans match exact sur identifiant externe (M-07)',
            },
            utilisateurId,
          },
        })
      }

      const typeLienId = await obtenirTypeLienId(typeLienCode, tx)

      // SEC-I-01 : valider l'URL du lien avant usage
      const urlLienValidee = validerUrl(lienUrl ?? null)
      const sourceIdLien = urlLienValidee ? (sourcesIds.get(urlLienValidee) ?? null) : null

      // Construire les FK selon le type d'entité principale et de la cible
      const fkLien = construireFkLien({ id: entitePrincipale.id, type: typeEntite }, cibleResolue)

      const nouveauLien = await tx.lien.create({
        data: {
          ...fkLien,
          typeLienId,
          statut: 'EN_ATTENTE',
          sourceId: sourceIdLien,
          creeParId: utilisateurId,
          // Dimension temporelle du lien (L2 Passe 5 — Wikidata P580/P582)
          dateDebut: parseDate(lienSuggere.dateDebut),
          dateFin: parseDate(lienSuggere.dateFin),
        },
        select: { id: true },
      })
      liensCrees.push(nouveauLien.id)
    }

    // Étape 4 : historique pour l'entité principale
    await tx.historique.create({
      data: {
        entiteType: typeEntite,
        entiteId: entitePrincipale.id,
        action: 'CREATION',
        donneesApres: {
          source: 'enrichissement_osint',
          qualiteInfluence: qualiteInfluencePublique,
        },
        utilisateurId,
      },
    })

    // Étape 5 : audit RGPD DANS la transaction (C-02 / ADR-008)
    // Si l'audit échoue, toute la transaction rollback — garantissant l'atomicité
    // import ↔ audit (pas d'import sans trace, pas de trace sans import).
    await enregistrerAudit({ ...paramsAudit, entitesCreees }, tx)

    return { entitePrincipaleId: entitePrincipale.id }
  })

  return {
    entitePrincipaleId: entitesCreees[0]?.id,
    entitesCreees,
    liensCrees,
  }
}

/**
 * Construit les clés étrangères pour un Lien selon les types des deux entités.
 *
 * @param {{ id: string, type: string }} entiteA
 * @param {{ id: string, type: string }} entiteB
 * @returns {Record<string, string|null>}
 */
function construireFkLien(entiteA, entiteB) {
  const fk = {
    personneAId: null,
    organisationAId: null,
    siteWebAId: null,
    personneBId: null,
    organisationBId: null,
    siteWebBId: null,
  }

  if (entiteA.type === 'Personne') fk.personneAId = entiteA.id
  else if (entiteA.type === 'Organisation') fk.organisationAId = entiteA.id
  else if (entiteA.type === 'SiteWeb') fk.siteWebAId = entiteA.id

  if (entiteB.type === 'Personne') fk.personneBId = entiteB.id
  else if (entiteB.type === 'Organisation') fk.organisationBId = entiteB.id
  else if (entiteB.type === 'SiteWeb') fk.siteWebBId = entiteB.id

  return fk
}
