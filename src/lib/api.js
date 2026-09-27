import axios from 'axios'

const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim().replace(/\/+$/, '')
const API_URL = rawApiUrl.replace(/\/api$/, '')

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('theapka_token') : null
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 and parse validation errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('theapka_token')
        localStorage.removeItem('theapka_user')
        // Only redirect if not already on login or public routes
        const path = window.location.pathname
        if (!path.startsWith('/login') && !path.startsWith('/register') && !path.startsWith('/i/')) {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
