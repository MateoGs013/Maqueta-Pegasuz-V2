import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Inject tenant header
api.interceptors.request.use(config => {
  config.headers['x-client'] = import.meta.env.VITE_CLIENT_SLUG
  return config
})

// Handle errors globally
api.interceptors.response.use(
  response => response,
  error => {
    console.error('[API Error]', error.response?.status, error.message)
    return Promise.reject(error)
  }
)

/**
 * Resolve image URL from tenant uploads
 * @param {string} path - Relative image path from API
 * @returns {string} Full URL to the image
 */
export function resolveImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '')
  return `${baseUrl}/${path}`
}

export default api
