import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

// Attache le token JWT
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Redirige si token expiré
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

// AUTH
export const login = (email, password) => {
  const form = new URLSearchParams()
  form.append('username', email)   // FastAPI OAuth2 attend "username"
  form.append('password', password)
  return api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
}

// MESURES
export const getDernieresMesures  = ()                    => api.get('/mesures/derniere')
export const getMesures           = (type, limit = 50)    => api.get('/mesures', { params: { type_mesure: type, limit } })
export const postMesure           = payload               => api.post('/mesures', payload)

// ACTIONNEURS
export const getEtatActionneurs     = ()                  => api.get('/actionneurs')
export const getHistoriqueActions   = (limit = 100)       => api.get('/actionneurs/historique', { params: { limit } })
export const envoyerCommande        = (actionneur, commande) =>
  api.post('/actionneurs', { actionneur, commande, source: 'manuel' })

// ALERTES
export const getAlertes     = (non_resolues = null) =>
  api.get('/alertes', { params: non_resolues !== null ? { non_resolues } : {} })
export const resoudreAlerte = id => api.patch(`/alertes/${id}/resoudre`)

// SEUILS
export const getSeuils      = ()                    => api.get('/seuils')
export const modifierSeuil  = (type, payload)       => api.patch(`/seuils/${type}`, payload)

export default api

// UTILISATEURS (admin seulement)
export const getUtilisateurs    = ()              => api.get('/utilisateurs/')
export const creerUtilisateur   = payload         => api.post('/utilisateurs/', payload)
export const toggleUtilisateur  = id              => api.patch(`/utilisateurs/${id}/toggle`)
export const supprimerUtilisateur = id            => api.delete(`/utilisateurs/${id}`)
export const changerRole        = (id, role)      => api.patch(`/utilisateurs/${id}/role`, null, { params: { role } })
