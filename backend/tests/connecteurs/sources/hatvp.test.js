/**
 * Tests du connecteur HATVP.
 * Couvre : recherche vide, recherche avec index mock, parseur XML, mapping normalise,
 * resilience sur erreur telechargement.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock du cache et du rate-limit pour isoler les tests reseau
await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: () => 'hash-test',
  lireCache: jest.fn().mockResolvedValue(null),
  ecrireCache: jest.fn().mockResolvedValue(undefined),
  reinitialiserEtatCache: jest.fn(),
}))

await jest.unstable_mockModule('../../../src/connecteurs/rate-limit.js', () => ({
  creerBucket: jest.fn(),
  consommer: jest.fn().mockResolvedValue(undefined),
  reinitialiserBuckets: jest.fn(),
  obtenirEtatBucket: jest.fn(),
}))

const { default: HatvpConnecteur } = await import('../../../src/connecteurs/sources/hatvp.js')

/** Fragment XML HATVP synthetique pour les tests. */
const XML_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<declarations>
  <declaration>
    <nom>DUPONT</nom>
    <prenom>Jean</prenom>
    <dateDeNaissance>1965-03-15</dateDeNaissance>
    <fonctionPrincipale>Depute de la 3eme circonscription du Calvados</fonctionPrincipale>
    <libelle>Depute a l\'Assemblee nationale</libelle>
    <libelle>Membre de la commission des finances</libelle>
    <denomination>Dupont Conseil SARL</denomination>
    <partipolitique>La Republique En Marche</partipolitique>
  </declaration>
  <declaration>
    <nom>MARTIN</nom>
    <prenom>Marie</prenom>
    <dateDeNaissance>1972-07-22</dateDeNaissance>
    <fonctionPrincipale>Senatrice du Nord</fonctionPrincipale>
    <libelle>Senatrice representant le departement du Nord</libelle>
    <denomination>Martin Investissements SAS</denomination>
  </declaration>
</declarations>`

describe('HatvpConnecteur — rechercher()', () => {
  it('retourne un tableau vide pour une query trop courte', async () => {
    const connecteur = new HatvpConnecteur()
    const resultat = await connecteur.rechercher('a')
    expect(resultat.resultats).toHaveLength(0)
    expect(resultat.source).toBe('HATVP')
    expect(resultat.version).toBeDefined()
  })

  it('retourne un tableau vide pour une query vide', async () => {
    const connecteur = new HatvpConnecteur()
    const resultat = await connecteur.rechercher('')
    expect(resultat.resultats).toHaveLength(0)
  })

  it('retourne un tableau vide quand le telechargement echoue', async () => {
    const connecteur = new HatvpConnecteur()
    // Simuler un echec de telechargement
    connecteur._telechargerXmlBrut = jest.fn().mockRejectedValue(new Error('Network error'))
    const resultat = await connecteur.rechercher('Dupont')
    expect(resultat.resultats).toHaveLength(0)
    expect(resultat.source).toBe('HATVP')
  })
})

describe('HatvpConnecteur — parsing XML et mapping', () => {
  let connecteur

  beforeEach(() => {
    connecteur = new HatvpConnecteur()
  })

  it('indexe correctement les declarations depuis le XML fixture', async () => {
    // Injecter le XML directement dans le constructeur d'index
    connecteur._indexNom = connecteur._construireIndex(XML_FIXTURE)
    expect(connecteur._indexNom.size).toBe(2)
  })

  it('mappe correctement une declaration de depute', async () => {
    connecteur._indexNom = connecteur._construireIndex(XML_FIXTURE)
    const resultat = await connecteur.rechercher('Dupont')

    expect(resultat.resultats).toHaveLength(1)
    const entite = resultat.resultats[0]
    expect(entite.type).toBe('Personne')
    expect(entite.champs.nom.valeur).toBe('DUPONT')
    expect(entite.champs.prenom.valeur).toBe('Jean')
    expect(entite.champs.pays.valeur).toBe('France')
    expect(entite.champs.qualiteInfluence.valeur).toBe('ELU')
    expect(entite.champs.nom.source).toBe('HATVP')
  })

  it('genere des liens suggeres (mandat, participation, parti)', async () => {
    connecteur._indexNom = connecteur._construireIndex(XML_FIXTURE)
    const resultat = await connecteur.rechercher('Dupont')

    expect(resultat.resultats).toHaveLength(1)
    const liens = resultat.resultats[0].liensSuggeres
    expect(liens.length).toBeGreaterThanOrEqual(1)

    const typesLiens = liens.map((l) => l.typeLienCode)
    expect(typesLiens).toContain('AFFILIATION_PARTI')
    expect(typesLiens).toContain('MANDAT_ELECTIF')
  })

  it('classe comme HAUT_FONCTIONNAIRE les declarants sans mandat electif', async () => {
    const xmlSansMandatElu = `<declarations>
      <declaration>
        <nom>LEMAIRE</nom>
        <prenom>Bruno</prenom>
        <fonctionPrincipale>Directeur general de ministere</fonctionPrincipale>
        <libelle>Directeur general de l\'administration centrale</libelle>
      </declaration>
    </declarations>`
    connecteur._indexNom = connecteur._construireIndex(xmlSansMandatElu)
    const resultat = await connecteur.rechercher('Lemaire')
    expect(resultat.resultats[0].champs.qualiteInfluence.valeur).toBe('HAUT_FONCTIONNAIRE')
  })
})
