/**
 * @module services/geocoder
 * Géocodage d'adresses via l'API Adresse BAN (IGN / data.gouv.fr).
 *
 * Endpoint : https://api-adresse.data.gouv.fr/search/?q=...&limit=1
 * Aucune clé API requise — service public français en open data.
 *
 * Fonctions exportées :
 *   - geocoderAdresse(adresse)          : géocode une adresse → { lat, lon, codeInsee, libelle }
 *   - geocoderEntitesEnLot(limite)      : géocode en lot les Personne/Organisation sans coordonnées
 *
 * ADR-003 : L'API Adresse BAN est dans le périmètre IGN multi-API validé.
 * ADR-005 : Pas de cache disque ici — les coordonnées sont persistées en DB.
 */

import { prisma } from '../utils/prisma.js';

/** Endpoint BAN (API Adresse IGN / data.gouv.fr) */
const BAN_ENDPOINT = 'https://api-adresse.data.gouv.fr/search/';

/** User-Agent transmis à la BAN */
const userAgent =
  process.env.ENRICHISSEMENT_USER_AGENT ??
  'reseauxinfluences.fr/1.0 (contact: contact@reseauxinfluences.fr)';

/**
 * Géocode une adresse textuelle via l'API Adresse BAN.
 *
 * @param {string} adresse - Adresse à géocoder (ex : "10 rue de la Paix 75001 Paris")
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<{ lat: number, lon: number, codeInsee: string|null, libelle: string|null }|null>}
 *   null si l'adresse n'a pas pu être géocodée
 */
export async function geocoderAdresse(adresse, { timeoutMs = 10_000 } = {}) {
  if (!adresse || adresse.trim().length < 5) return null;

  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), timeoutMs);

  try {
    const url = new URL(BAN_ENDPOINT);
    url.searchParams.set('q', adresse.trim());
    url.searchParams.set('limit', '1');

    const reponse = await fetch(url.toString(), {
      signal: controleur.signal,
      headers: { 'User-Agent': userAgent, Accept: 'application/json' },
    });

    if (!reponse.ok) {
      console.warn(`[geocoder] BAN a renvoyé HTTP ${reponse.status} pour l'adresse : ${adresse}`);
      return null;
    }

    const donnees = await reponse.json();
    const feature = donnees.features?.[0];
    if (!feature) return null;

    const [lon, lat] = feature.geometry?.coordinates ?? [null, null];
    const props = feature.properties ?? {};

    return {
      lat: typeof lat === 'number' ? lat : null,
      lon: typeof lon === 'number' ? lon : null,
      codeInsee: props.citycode ?? props.city_code ?? null,
      libelle: props.label ?? null,
    };
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.warn(`[geocoder] Erreur géocodage BAN (${adresse}) : ${err.message}`);
    }
    return null;
  } finally {
    clearTimeout(minuterie);
  }
}

/**
 * Géocode en lot les entités sans coordonnées géographiques.
 *
 * Pour les Personne : utilise lieuNaissance si lieuNaissanceLat est null.
 * Pour les Organisation : utilise adresseSiege si siegeLat est null.
 *
 * Délai de politesse entre chaque appel BAN : 200 ms (évite le rate-limiting).
 *
 * @param {number} [limite=100] - Nombre maximum d'entités à traiter par lot
 * @returns {Promise<{ personnesGeocodes: number, organisationsGeocodees: number }>}
 */
export async function geocoderEntitesEnLot(limite = 100) {
  let personnesGeocodes = 0;
  let organisationsGeocodees = 0;

  // Personnes avec lieu de naissance mais sans coordonnées
  const personnesSansGeo = await prisma.personne.findMany({
    where: {
      lieuNaissance: { not: null },
      lieuNaissanceLat: null,
    },
    select: { id: true, lieuNaissance: true },
    take: Math.ceil(limite / 2),
  });

  for (const personne of personnesSansGeo) {
    const resultat = await geocoderAdresse(personne.lieuNaissance);
    if (resultat?.lat && resultat?.lon) {
      await prisma.personne.update({
        where: { id: personne.id },
        data: {
          lieuNaissanceLat: resultat.lat,
          lieuNaissanceLon: resultat.lon,
          lieuNaissanceCodeInsee: resultat.codeInsee ?? undefined,
        },
      });
      personnesGeocodes++;
    }
    // Délai de politesse BAN
    await new Promise((res) => setTimeout(res, 200));
  }

  // Organisations avec adresse de siège mais sans coordonnées
  const limitOrgas = limite - personnesSansGeo.length;
  if (limitOrgas > 0) {
    const orgasSansGeo = await prisma.organisation.findMany({
      where: {
        adresseSiege: { not: null },
        siegeLat: null,
      },
      select: { id: true, adresseSiege: true },
      take: limitOrgas,
    });

    for (const orga of orgasSansGeo) {
      const resultat = await geocoderAdresse(orga.adresseSiege);
      if (resultat?.lat && resultat?.lon) {
        await prisma.organisation.update({
          where: { id: orga.id },
          data: {
            siegeLat: resultat.lat,
            siegeLon: resultat.lon,
            siegeCodeInsee: resultat.codeInsee ?? undefined,
          },
        });
        organisationsGeocodees++;
      }
      await new Promise((res) => setTimeout(res, 200));
    }
  }

  console.info(
    `[geocoder] Lot terminé : ${personnesGeocodes} personne(s), ${organisationsGeocodees} organisation(s) géocodée(s).`,
  );

  return { personnesGeocodes, organisationsGeocodees };
}
