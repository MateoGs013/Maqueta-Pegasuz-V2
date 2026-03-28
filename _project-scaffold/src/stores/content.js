import { defineStore } from 'pinia'
import api from '@/config/api'

export const useContentStore = defineStore('content', {
  state: () => ({
    contents: {},
    loaded: false,
    error: null
  }),

  actions: {
    async bootstrap() {
      if (this.loaded) return
      try {
        const { data } = await api.get('/site-contents')
        const raw = data.contents || data
        if (Array.isArray(raw)) {
          raw.forEach(item => {
            this.contents[item.key] = item.value
          })
        }
        this.loaded = true
      } catch (err) {
        this.error = err.message
        console.error('[CMS Bootstrap]', err)
      }
    },

    get(key, fallback = '') {
      return this.contents[key] ?? fallback
    },

    getJSON(key, fallback = null) {
      const raw = this.contents[key]
      if (!raw) return fallback
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch {
        return fallback
      }
    }
  }
})
