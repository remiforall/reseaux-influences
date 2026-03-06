import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getPersonnes = (params) => api.get('/personnes/', { params })
export const getLiens = (params) => api.get('/liens/', { params })
export const getGraphe = () => api.get('/liens/graphe/')
export const getSources = (params) => api.get('/sources/', { params })
export const getUtilisateur = (id) => api.get(`/utilisateurs/${id}/`)
export const postValidation = (data) => api.post('/validations/', data)
export const postLien = (data) => api.post('/liens/', data)

export default api
