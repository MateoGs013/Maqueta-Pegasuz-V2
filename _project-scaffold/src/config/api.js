// Axios instance — only used by services/, never imported directly in views/components
// For standalone projects without an API, this file can be removed

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach client slug for Pegasuz multi-tenant (if applicable)
const slug = import.meta.env.VITE_CLIENT_SLUG
if (slug) {
  api.defaults.headers.common['x-client'] = slug
}

/**
 * Resolve image URL from API path to full URL
 * @param {string} path - Image path from API response
 * @returns {string} Full image URL
 */
export function resolveImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_API_URL || ''
  return `${base.replace('/api', '')}${path}`
}

export default api
