import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const inscription = (data) => api.post('/auth/inscription', data)
export const connexion = (data) => api.post('/auth/connexion', data)
export const getMoi = () => api.get('/auth/moi')

// Personnes
export const getPersonnes = (params) => api.get('/personnes', { params })
export const getPersonne = (id) => api.get(`/personnes/${id}`)
export const postPersonne = (data) => api.post('/personnes', data)
export const searchPersonnes = (q) => api.get('/personnes/search/autocomplete', { params: { q } })

// Liens
export const getLiens = (params) => api.get('/liens', { params })
export const getLiensAValider = (params) => api.get('/liens/a-valider', { params })
export const getLien = (id) => api.get(`/liens/${id}`)
export const postLien = (data) => api.post('/liens', data)
export const getTypesLiens = () => api.get('/liens/types/all')

// Organisations
export const getOrganisations = (params) => api.get('/organisations', { params })
export const getOrganisation = (id) => api.get(`/organisations/${id}`)
export const postOrganisation = (data) => api.post('/organisations', data)
export const searchOrganisations = (q) =>
  api.get('/organisations/search/autocomplete', { params: { q } })
export const getTypesOrganisations = () => api.get('/organisations/types/all')

// Sources
export const getSources = (params) => api.get('/sources', { params })
export const postSource = (data) => api.post('/sources', data)

// Validations
export const postValidation = (data) => api.post('/validations', data)
export const getStatutSoumission = () => api.get('/validations/statut-soumission')

// Utilisateurs
export const getUtilisateur = (id) => api.get(`/utilisateurs/${id}`)
export const getBadgesUtilisateur = (id) => api.get(`/utilisateurs/${id}/badges`)
export const getClassement = (params) => api.get('/utilisateurs/classement/top', { params })

// Graphe
export const getGraphe = (params) => api.get('/graphe', { params })
export const getGraphePersonne = (id, params) => api.get(`/graphe/personne/${id}`, { params })
export const getGrapheEntite = (id, params) => api.get(`/graphe/entite/${id}`, { params })
export const getGrapheEgo = (entiteId, params) => api.get(`/graphe/ego/${entiteId}`, { params })

// Enrichissement OSINT
export const getEnrichissementConnecteurs = () => api.get('/enrichissement/connecteurs')
export const postEnrichissementRechercher = (body) => api.post('/enrichissement/rechercher', body)
export const postEnrichissementImporter = (body) => api.post('/enrichissement/importer', body)
export const postEnrichissementRechercheGlobale = (body) =>
  api.post('/enrichissement/recherche-globale', body)
export const getIgnGeoplateformeWmsConfig = () =>
  api.get('/enrichissement/connecteurs/ign-geoplateforme/wms-config')

// Graphe — timeline et heatmap (Passe 4)
export const getGrapheTimeline = (entiteId, params) =>
  api.get(`/graphe/timeline/${entiteId}`, { params })
export const getGrapheHeatmap = (entiteId, params) =>
  api.get(`/graphe/heatmap/${entiteId}`, { params })

// Fiche enrichie IGN (Passe 5 — L4/L6)
export const getEntiteFoncier = (type, id) => api.get(`/entites/${type}/${id}/foncier`)
export const getEntiteCadastre = (type, id) => api.get(`/entites/${type}/${id}/cadastre`)
export const getEntiteUrbanisme = (type, id) => api.get(`/entites/${type}/${id}/urbanisme`)

// Export
export const getExportJSON = (params) => api.get('/export/json', { params })
export const getExportCSV = (params) => api.get('/export/csv', { params, responseType: 'blob' })
export const getExportJSONLD = (params) => api.get('/export/jsonld', { params })
export const getExportGraphML = (params) =>
  api.get('/export/graphml', { params, responseType: 'blob' })
export const getApiPublique = (params) => api.get('/export/api-publique', { params })

// Droits des personnes (RGPD art. 15-21) — soumission publique, sans auth
export const postDemandeDroit = (data) => api.post('/droits', data)
export const getDemandesDroit = (params) => api.get('/droits', { params })
export const patchDemandeDroit = (id, data) => api.patch(`/droits/${id}`, data)

export default api
