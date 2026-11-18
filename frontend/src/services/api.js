import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Response interceptor — normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

// ── Air Quality ──────────────────────────────────────────────────────────────
export const airQualityService = {
  getCurrent: (city) => api.get(`/api/air-quality/current`, { params: { city } }),
  getHistory: (city, days = 7) => api.get(`/api/air-quality/history`, { params: { city, days } }),
  getForecast: (city) => api.get(`/api/air-quality/forecast`, { params: { city } }),
}

// ── AI Assistant ─────────────────────────────────────────────────────────────
export const aiService = {
  chat: (payload) => api.post('/api/ai/chat', payload),
  getRecommendations: (payload) => api.post('/api/ai/recommendations', payload),
  getIndoorAdvice: (payload) => api.post('/api/ai/indoor-advice', payload),
}

// ── Routes ───────────────────────────────────────────────────────────────────
export const routeService = {
  plan: (payload) => api.post('/api/routes/plan', payload),
}

// ── Sustainability ────────────────────────────────────────────────────────────
export const sustainabilityService = {
  getRecommendations: (params) => api.get('/api/sustainability/recommendations', { params }),
  logAction: (payload) => api.post('/api/sustainability/log-action', payload),
  getImpact: (userId) => api.get(`/api/sustainability/impact`, { params: { user_id: userId } }),
}

// ── Alerts ───────────────────────────────────────────────────────────────────
export const alertsService = {
  getAlerts: (city) => api.get('/api/alerts', { params: { city } }),
}

// ── Community ────────────────────────────────────────────────────────────────
export const communityService = {
  getObservations: (city) => api.get('/api/community/observations', { params: { city } }),
  submitObservation: (payload) => api.post('/api/community/observations', payload),
  getTrends: (city) => api.get('/api/community/trends', { params: { city } }),
}

// ── Impact ───────────────────────────────────────────────────────────────────
export const impactService = {
  getSummary: (params) => api.get('/api/impact/summary', { params }),
  getWeeklyTrends: (params) => api.get('/api/impact/weekly-trends', { params }),
}

export default api
