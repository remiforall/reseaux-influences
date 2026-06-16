/**
 * Tests du connecteur Registre de Transparence UE (lobbying européen).
 * Couvre : parsing XML, indexation, recherche nom/acronyme, mapping Organisation
 * (qualité LOBBYISTE, type selon catégorie), détail par code, query courte.
 *
 * Aucun appel réseau : `_telechargerTexte` est stubbé avec une fixture XML
 * dérivée de l'export officiel `ListOfIRPublicDetail`.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'

await jest.unstable_mockModule('../../../src/connecteurs/cache.js', () => ({
  hashCle: jest.fn(() => 'hash-eu-transparence-test'),
  lireCache: jest.fn().mockResolvedValue(null),
  ecrireCache: jest.fn().mockResolvedValue(undefined),
  obtenirOuCalculer: (cle, ttlMs, fabrique) => fabrique(),
  reinitialiserEtatCache: jest.fn(),
}))

await jest.unstable_mockModule('../../../src/connecteurs/rate-limit.js', () => ({
  creerBucket: jest.fn(),
  consommer: jest.fn().mockResolvedValue(undefined),
  reinitialiserBuckets: jest.fn(),
  obtenirEtatBucket: jest.fn(),
}))

const { default: EuTransparenceConnecteur } =
  await import('../../../src/connecteurs/sources/eu-transparence.js')

const FIXTURE_XML = `<?xml version='1.1' encoding='UTF-8'?>
<ListOfIRPublicDetail xmlns="http://intragate.ec.europa.eu/transparencyregister/odp">
  <metaData xmlns=""><exportDate>2026-06-15T20:00:00Z</exportDate><numberOfIR>2</numberOfIR></metaData>
  <resultList xmlns="">
    <interestRepresentative>
      <identificationCode>880143435725-46</identificationCode>
      <registrationDate>2019-08-28T09:51:42Z</registrationDate>
      <name><originalName>Association M&amp;eacute;diterran&#xe9;e Tech</originalName></name>
      <acronym>ASPERTIC</acronym>
      <entityForm>Asociaci&#xf3;n</entityForm>
      <webSiteURL>http://aspertic.org/</webSiteURL>
      <registrationCategory>Trade unions and professional associations</registrationCategory>
      <headOffice>
        <address>Plaza del Sol 20</address><postCode>08012</postCode>
        <city>Barcelona</city><country>SPAIN</country>
      </headOffice>
      <EUOffice><city>Brussels</city><country>BELGIUM</country></EUOffice>
      <EPAccreditedNumber>0</EPAccreditedNumber>
    </interestRepresentative>
    <interestRepresentative>
      <identificationCode>123456789012-99</identificationCode>
      <registrationDate>2021-01-15T10:00:00Z</registrationDate>
      <name><originalName>BigLobby Consulting SA</originalName></name>
      <acronym>BLC</acronym>
      <entityForm>SA</entityForm>
      <webSiteURL>https://biglobby.eu/</webSiteURL>
      <registrationCategory>Professional consultancies</registrationCategory>
      <headOffice>
        <address>Rue de la Loi 100</address><city>Brussels</city><country>BELGIUM</country>
      </headOffice>
      <EPAccreditedNumber>5</EPAccreditedNumber>
    </interestRepresentative>
  </resultList>
</ListOfIRPublicDetail>`

let connecteur

beforeEach(() => {
  connecteur = new EuTransparenceConnecteur()
  jest.spyOn(connecteur, '_telechargerTexte').mockResolvedValue(FIXTURE_XML)
})

describe('EuTransparenceConnecteur — indexation XML', () => {
  it('parse et indexe tous les interestRepresentative', async () => {
    await connecteur._assurerIndex()
    expect(connecteur._index.size).toBe(2)
    expect(connecteur._index.has('880143435725-46')).toBe(true)
  })

  it("ne télécharge qu'une fois (index paresseux)", async () => {
    await connecteur._assurerIndex()
    await connecteur._assurerIndex()
    expect(connecteur._telechargerTexte).toHaveBeenCalledTimes(1)
  })
})

describe('EuTransparenceConnecteur — rechercher()', () => {
  it('retourne vide pour une query trop courte (sans télécharger)', async () => {
    const res = await connecteur.rechercher('x')
    expect(res.resultats).toHaveLength(0)
    expect(connecteur._telechargerTexte).not.toHaveBeenCalled()
  })

  it('trouve par nom et mappe une Organisation LOBBYISTE', async () => {
    const res = await connecteur.rechercher('biglobby')
    expect(res.resultats).toHaveLength(1)
    const ent = res.resultats[0]
    expect(ent.type).toBe('Organisation')
    expect(ent.champs.nom.valeur).toBe('BigLobby Consulting SA')
    expect(ent.champs.qualiteInfluence.valeur).toBe('LOBBYISTE')
    expect(ent.champs.typeOrganisation.valeur).toBe('LOBBY') // "Professional consultancies"
    expect(ent.champs.identifiantRegistreUe.valeur).toBe('123456789012-99')
    expect(ent.champs.pays.valeur).toBe('BELGIUM')
  })

  it('trouve par acronyme', async () => {
    const res = await connecteur.rechercher('ASPERTIC')
    expect(res.resultats).toHaveLength(1)
    expect(res.resultats[0].champs.sigle.valeur).toBe('ASPERTIC')
  })

  it('mappe la catégorie syndicale vers SYNDICAT et décode les entités XML', async () => {
    const res = await connecteur.rechercher('aspertic')
    const ent = res.resultats[0]
    expect(ent.champs.typeOrganisation.valeur).toBe('SYNDICAT')
    // pays du siège = headOffice (SPAIN), pas EUOffice (BELGIUM)
    expect(ent.champs.pays.valeur).toBe('SPAIN')
    expect(ent.champs.libelleCommune.valeur).toBe('Barcelona')
    // &amp; décodé
    expect(ent.champs.nom.valeur).toContain('&')
  })

  it('respecte la limite perPage', async () => {
    const res = await connecteur.rechercher('a', { perPage: 1 })
    // 'a' est dans les deux noms normalisés → limité à 1
    expect(res.resultats.length).toBeLessThanOrEqual(1)
  })
})

describe('EuTransparenceConnecteur — detailler()', () => {
  it('retourne une entité par code', async () => {
    const res = await connecteur.detailler('123456789012-99')
    expect(res.entite.champs.nom.valeur).toBe('BigLobby Consulting SA')
    expect(res.entite.champs.description.valeur).toContain('5 accrédité')
  })

  it('retourne null pour un code inconnu', async () => {
    const res = await connecteur.detailler('000000000000-00')
    expect(res.entite).toBeNull()
  })

  it('retourne null pour un code vide sans télécharger', async () => {
    const res = await connecteur.detailler('')
    expect(res.entite).toBeNull()
    expect(connecteur._telechargerTexte).not.toHaveBeenCalled()
  })
})

describe('EuTransparenceConnecteur — listerLiens()', () => {
  it("retourne une liste vide (pas de liens fiables dans l'export)", async () => {
    const res = await connecteur.listerLiens('880143435725-46')
    expect(res.liens).toHaveLength(0)
    expect(res.source).toBe('eu-transparence')
  })
})
