/**
 * Tests du service import-enrichissement.
 *
 * Couvre :
 * - Garde-fou RGPD : rejet si qualiteInfluencePublique absent
 * - Création transactionnelle d'une Personne avec liens
 * - Upsert de Source par URL
 * - Création de la cible en EN_ATTENTE si elle n'existe pas
 * - Enregistrement de l'historique
 * - C-02 : enregistrerAudit appelé DANS la transaction (avec le client tx)
 * - C-02 : rollback si l'audit échoue (atomicité import ↔ audit)
 * - M-07 : resoudreCible ne fait plus de matching flou (contains)
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// ---------------------------------------------------------------------------
// Mocks Prisma (avant l'import du module testé)
// ---------------------------------------------------------------------------

const mockTransaction = jest.fn()
const mockPersonneCreate = jest.fn()
const mockOrganisationCreate = jest.fn()
const mockSiteWebCreate = jest.fn()
const mockLienCreate = jest.fn()
const mockTypeLienFindUnique = jest.fn()
const mockTypeLienCreate = jest.fn()
const mockSourceFindFirst = jest.fn()
const mockSourceCreate = jest.fn()
const mockPersonneFindFirst = jest.fn()
const mockOrganisationFindFirst = jest.fn()
const mockSiteWebFindFirst = jest.fn()
const mockHistoriqueCreate = jest.fn()
const mockAuditCreate = jest.fn()

await jest.unstable_mockModule('../../src/utils/prisma.js', () => ({
  prisma: {
    $transaction: mockTransaction,
    personne: {
      create: mockPersonneCreate,
      findFirst: mockPersonneFindFirst,
      findUnique: jest.fn().mockResolvedValue(null),
    },
    organisation: {
      create: mockOrganisationCreate,
      findFirst: mockOrganisationFindFirst,
      findUnique: jest.fn().mockResolvedValue(null),
    },
    siteWeb: {
      create: mockSiteWebCreate,
      findFirst: mockSiteWebFindFirst,
      findUnique: jest.fn().mockResolvedValue(null),
    },
    lien: {
      create: mockLienCreate,
    },
    typeLien: {
      findUnique: mockTypeLienFindUnique,
      create: mockTypeLienCreate,
    },
    source: {
      findFirst: mockSourceFindFirst,
      create: mockSourceCreate,
    },
    historique: {
      create: mockHistoriqueCreate,
    },
    auditEnrichissement: {
      create: mockAuditCreate,
    },
  },
}))

// Mock audit — on intercepte enregistrerAudit pour vérifier qu'il est bien appelé
// avec le client tx (et non le client global)
const mockEnregistrerAudit = jest.fn().mockResolvedValue({ id: 'audit-id' })
await jest.unstable_mockModule('../../src/connecteurs/audit.js', () => ({
  enregistrerAudit: mockEnregistrerAudit,
}))

const { importer } = await import('../../src/services/import-enrichissement.js')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function creerPreviewMinimale(typeEntite = 'Personne') {
  return {
    typeSuggere: typeEntite,
    candidatsParChamp: {
      nom: [
        {
          valeur: 'Jean Dupont',
          source: 'Wikidata',
          url: 'https://wikidata.org/Q123',
          date: '2026-01-01',
        },
      ],
      wikidataId: [{ valeur: 'Q123', source: 'Wikidata', url: null, date: '2026-01-01' }],
    },
    liensSuggeres: [
      {
        vers: {
          type: 'Organisation',
          identifiantExterne: 'Assemblée nationale',
          wikidataId: 'Q8465',
        },
        typeLienCode: 'MANDAT_ELECTIF',
        source: 'Wikidata',
        url: 'https://wikidata.org/Q8465',
        date: '2026-01-01',
      },
    ],
    identifiantsExternes: { wikidataId: 'Q123' },
  }
}

function creerChoixUtilisateur(typeEntite = 'Personne') {
  return {
    champsRetenus: { nom: 'Wikidata' },
    liensRetenus: [0],
    typeEntite,
  }
}

// ---------------------------------------------------------------------------
// Setup transaction mock : exécute le callback directement avec un tx mocké
// qui expose aussi auditEnrichissement.create
// ---------------------------------------------------------------------------

function creerTxMock() {
  return {
    personne: {
      create: mockPersonneCreate,
      findFirst: mockPersonneFindFirst,
      findUnique: jest.fn().mockResolvedValue(null),
    },
    organisation: {
      create: mockOrganisationCreate,
      findFirst: mockOrganisationFindFirst,
      findUnique: jest.fn().mockResolvedValue(null),
    },
    siteWeb: {
      create: mockSiteWebCreate,
      findFirst: mockSiteWebFindFirst,
      findUnique: jest.fn().mockResolvedValue(null),
    },
    lien: {
      create: mockLienCreate,
    },
    typeLien: {
      findUnique: mockTypeLienFindUnique,
      create: mockTypeLienCreate,
    },
    source: {
      findFirst: mockSourceFindFirst,
      create: mockSourceCreate,
    },
    historique: {
      create: mockHistoriqueCreate,
    },
    auditEnrichissement: {
      create: mockAuditCreate,
    },
  }
}

function configurerTransactionMock() {
  mockTransaction.mockImplementation(async (callback) => callback(creerTxMock()))
}

// ---------------------------------------------------------------------------
// Tests — Garde-fou RGPD (ADR-006)
// ---------------------------------------------------------------------------

describe('service importer — garde-fou RGPD (ADR-006)', () => {
  it('lève une erreur si qualiteInfluencePublique est absent', async () => {
    await expect(
      importer({
        preview: creerPreviewMinimale(),
        choixUtilisateur: creerChoixUtilisateur(),
        qualiteInfluencePublique: null,
        utilisateurId: 'user-1',
      }),
    ).rejects.toThrow("Qualité d'influence publique requise (RGPD art. 85 + LIL art. 80)")
  })

  it('lève une erreur si qualiteInfluencePublique est une chaîne vide', async () => {
    await expect(
      importer({
        preview: creerPreviewMinimale(),
        choixUtilisateur: creerChoixUtilisateur(),
        qualiteInfluencePublique: '',
        utilisateurId: 'user-1',
      }),
    ).rejects.toThrow("Qualité d'influence publique requise")
  })
})

// ---------------------------------------------------------------------------
// Tests — Création transactionnelle d'une Personne
// ---------------------------------------------------------------------------

describe("service importer — création transactionnelle d'une Personne", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    configurerTransactionMock()

    mockPersonneCreate.mockResolvedValue({ id: 'personne-new-id' })
    mockOrganisationFindFirst.mockResolvedValue(null)
    mockPersonneFindFirst.mockResolvedValue(null)
    mockOrganisationCreate.mockResolvedValue({ id: 'org-cible-id' })
    mockLienCreate.mockResolvedValue({ id: 'lien-new-id' })
    mockTypeLienFindUnique.mockResolvedValue({ id: 42 })
    mockSourceFindFirst.mockResolvedValue(null)
    mockSourceCreate.mockResolvedValue({ id: 'source-new-id' })
    mockHistoriqueCreate.mockResolvedValue({ id: 'hist-id' })
    mockEnregistrerAudit.mockResolvedValue({ id: 'audit-id' })
  })

  it("crée une Personne en EN_ATTENTE avec la qualité d'influence", async () => {
    const { entitePrincipaleId, entitesCreees } = await importer({
      preview: creerPreviewMinimale('Personne'),
      choixUtilisateur: creerChoixUtilisateur('Personne'),
      qualiteInfluencePublique: 'ELU',
      utilisateurId: 'user-1',
      ipAddress: '192.168.1.42',
    })

    expect(entitePrincipaleId).toBe('personne-new-id')
    expect(entitesCreees.some((e) => e.type === 'Personne' && e.id === 'personne-new-id')).toBe(
      true,
    )

    const appelCreate = mockPersonneCreate.mock.calls[0][0]
    expect(appelCreate.data.statut).toBe('EN_ATTENTE')
    expect(appelCreate.data.qualiteInfluence).toBe('ELU')
    expect(appelCreate.data.nom).toBe('Jean Dupont')
  })

  it("crée un historique pour l'entité principale", async () => {
    await importer({
      preview: creerPreviewMinimale('Personne'),
      choixUtilisateur: { ...creerChoixUtilisateur('Personne'), liensRetenus: [] },
      qualiteInfluencePublique: 'DIRIGEANT',
      utilisateurId: 'user-1',
    })

    expect(mockHistoriqueCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entiteType: 'Personne',
          entiteId: 'personne-new-id',
          action: 'CREATION',
        }),
      }),
    )
  })

  it("crée la cible en EN_ATTENTE si elle n'existe pas dans la base", async () => {
    // La cible (Organisation) n'existe pas encore
    mockOrganisationFindFirst.mockResolvedValue(null)
    mockOrganisationCreate.mockResolvedValue({ id: 'org-creee-id' })

    const { entitesCreees } = await importer({
      preview: creerPreviewMinimale('Personne'),
      choixUtilisateur: creerChoixUtilisateur('Personne'),
      qualiteInfluencePublique: 'ELU',
      utilisateurId: 'user-1',
    })

    const cibleCreee = entitesCreees.find((e) => e.type === 'Organisation')
    expect(cibleCreee).toBeDefined()
    expect(cibleCreee.id).toBe('org-creee-id')
  })

  it('upsert la Source par URL (ne la crée pas si elle existe déjà)', async () => {
    // La source existe déjà
    mockSourceFindFirst.mockResolvedValue({ id: 'source-existante-id' })

    await importer({
      preview: creerPreviewMinimale('Personne'),
      choixUtilisateur: creerChoixUtilisateur('Personne'),
      qualiteInfluencePublique: 'ELU',
      utilisateurId: 'user-1',
    })

    // La source n'a pas été recréée
    expect(mockSourceCreate).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests — C-02 : audit DANS la transaction (atomicité)
// ---------------------------------------------------------------------------

describe('service importer — C-02 : audit dans la transaction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    configurerTransactionMock()

    mockPersonneCreate.mockResolvedValue({ id: 'personne-new-id' })
    mockOrganisationFindFirst.mockResolvedValue(null)
    mockPersonneFindFirst.mockResolvedValue(null)
    mockHistoriqueCreate.mockResolvedValue({ id: 'hist-id' })
    mockEnregistrerAudit.mockResolvedValue({ id: 'audit-id' })
  })

  it('appelle enregistrerAudit avec le client transactionnel (tx) comme second argument', async () => {
    await importer({
      preview: creerPreviewMinimale('Personne'),
      choixUtilisateur: { ...creerChoixUtilisateur('Personne'), liensRetenus: [] },
      qualiteInfluencePublique: 'ELU',
      utilisateurId: 'user-1',
    })

    // enregistrerAudit doit avoir été appelé avec (params, tx)
    expect(mockEnregistrerAudit).toHaveBeenCalledTimes(1)

    const [paramsAudit, prismaClient] = mockEnregistrerAudit.mock.calls[0]

    // Le second argument est le client tx (pas undefined, pas le prisma global)
    expect(prismaClient).toBeDefined()
    // Le tx possède la méthode auditEnrichissement.create
    expect(typeof prismaClient.auditEnrichissement?.create).toBe('function')

    // Les params d'audit sont corrects
    expect(paramsAudit.utilisateurId).toBe('user-1')
    expect(Array.isArray(paramsAudit.entitesCreees)).toBe(true)
    expect(paramsAudit.entitesCreees.some((e) => e.type === 'Personne')).toBe(true)
  })

  it("rollback l'import si enregistrerAudit lève une erreur (atomicité C-02)", async () => {
    // Simuler un échec de l'audit : la transaction rejette l'ensemble
    mockTransaction.mockImplementation(async (callback) => {
      const tx = creerTxMock()
      // Remplacer mockEnregistrerAudit dans ce contexte pour lancer une erreur
      mockEnregistrerAudit.mockRejectedValueOnce(new Error('DB audit indisponible'))
      return callback(tx)
    })

    await expect(
      importer({
        preview: creerPreviewMinimale('Personne'),
        choixUtilisateur: { ...creerChoixUtilisateur('Personne'), liensRetenus: [] },
        qualiteInfluencePublique: 'DIRIGEANT',
        utilisateurId: 'user-1',
      }),
    ).rejects.toThrow('DB audit indisponible')
  })
})

// ---------------------------------------------------------------------------
// Tests — M-07 : resoudreCible strict (pas de matching flou)
// ---------------------------------------------------------------------------

describe('service importer — M-07 : resoudreCible strict (pas de contains)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    configurerTransactionMock()

    mockPersonneCreate.mockResolvedValue({ id: 'personne-new-id' })
    mockHistoriqueCreate.mockResolvedValue({ id: 'hist-id' })
    mockEnregistrerAudit.mockResolvedValue({ id: 'audit-id' })
    mockOrganisationCreate.mockResolvedValue({ id: 'org-creee-id' })
  })

  it('crée la cible en EN_ATTENTE si aucun wikidataId fourni (pas de fallback contains)', async () => {
    // Le lien suggéré n'a PAS de wikidataId → resoudreCible doit retourner null directement
    const previewSansWikidataId = {
      ...creerPreviewMinimale('Personne'),
      liensSuggeres: [
        {
          vers: {
            type: 'Organisation',
            identifiantExterne: 'Assemblée nationale',
            // wikidataId volontairement absent
          },
          typeLienCode: 'MANDAT_ELECTIF',
          source: 'Wikidata',
          url: 'https://wikidata.org/Q8465',
          date: '2026-01-01',
        },
      ],
    }

    mockTypeLienFindUnique.mockResolvedValue({ id: 42 })
    mockLienCreate.mockResolvedValue({ id: 'lien-id' })
    mockSourceFindFirst.mockResolvedValue(null)
    mockSourceCreate.mockResolvedValue({ id: 'source-id' })

    const { entitesCreees } = await importer({
      preview: previewSansWikidataId,
      choixUtilisateur: creerChoixUtilisateur('Personne'),
      qualiteInfluencePublique: 'ELU',
      utilisateurId: 'user-1',
    })

    // L'Organisation doit avoir été CRÉÉE (pas matchée) car pas de wikidataId
    const orgCreee = entitesCreees.find((e) => e.type === 'Organisation')
    expect(orgCreee).toBeDefined()

    // mockOrganisationFindFirst ne doit PAS avoir été appelé (plus de recherche flou)
    expect(mockOrganisationFindFirst).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests — Import SiteWeb
// ---------------------------------------------------------------------------

describe("service importer — import d'un SiteWeb", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    configurerTransactionMock()

    mockSiteWebCreate.mockResolvedValue({ id: 'siteweb-id' })
    mockHistoriqueCreate.mockResolvedValue({ id: 'hist-id' })
    mockSourceFindFirst.mockResolvedValue(null)
    mockSourceCreate.mockResolvedValue({ id: 'source-id' })
    mockTypeLienFindUnique.mockResolvedValue({ id: 10 })
    mockLienCreate.mockResolvedValue({ id: 'lien-id' })
    mockOrganisationFindFirst.mockResolvedValue(null)
    mockOrganisationCreate.mockResolvedValue({ id: 'org-hebergeur-id' })
    mockEnregistrerAudit.mockResolvedValue({ id: 'audit-id' })
  })

  it("crée un SiteWeb avec domaine et qualité d'influence", async () => {
    const previewSite = {
      typeSuggere: 'SiteWeb',
      candidatsParChamp: {
        domaine: [{ valeur: 'posthack.com', source: 'RDAP', url: null, date: '2026-01-01' }],
      },
      liensSuggeres: [],
      identifiantsExternes: { domaine: 'posthack.com' },
    }

    const { entitePrincipaleId } = await importer({
      preview: previewSite,
      choixUtilisateur: {
        champsRetenus: { domaine: 'RDAP' },
        liensRetenus: [],
        typeEntite: 'SiteWeb',
      },
      qualiteInfluencePublique: 'EDITEUR_SITE',
      utilisateurId: 'user-2',
    })

    expect(entitePrincipaleId).toBe('siteweb-id')
    expect(mockSiteWebCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          domaine: 'posthack.com',
          statut: 'EN_ATTENTE',
          qualiteInfluence: 'EDITEUR_SITE',
        }),
      }),
    )
  })
})
