import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8002',
  timeout: 10000,
})

export default api

export const analyticsService = {
  getSuccessRate: (days = 30) => api.get(`/analytics/success-rate?days=${days}`),
  getMTTR: (days = 30) => api.get(`/analytics/mttr?days=${days}`),
  getTrends: (days = 30) => api.get(`/analytics/trends?days=${days}`),
  getPatterns: () => api.get('/analytics/patterns'),
}

export const deploymentService = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.service) params.append('service', filters.service)
    if (filters.limit) params.append('limit', filters.limit)
    return api.get(`/deployments/?${params.toString()}`)
  },
  create: (data) => api.post('/deployments/', data),
  getServices: () => api.get('/deployments/services'),
}
