import { ref, onMounted, onUnmounted } from 'vue'

const logs = ref([])
const watchActive = ref(false)
let eventSource = null
let instanceCount = 0
let reconnectAttempts = 0
let reconnectTimer = null

export function useEros() {
  const connect = () => {
    // Close existing connection before opening a new one (prevents accumulation)
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    eventSource = new EventSource('/__eros/logs')
    eventSource.onopen = () => {
      reconnectAttempts = 0 // reset backoff on successful connect
      watchActive.value = true
    }
    eventSource.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data)
        logs.value.push(entry)
        if (logs.value.length > 150) logs.value = logs.value.slice(-100)
      } catch { /* ignore parse errors */ }
    }
    eventSource.onerror = () => {
      watchActive.value = false
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }
      // Exponential backoff: 5s, 10s, 20s, 40s, 60s (max). Prevents the
      // panel from hammering vite when vite is dead/restarting.
      reconnectAttempts++
      const delay = Math.min(60000, 5000 * Math.pow(2, Math.min(reconnectAttempts - 1, 4)))
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        if (instanceCount > 0) connect()
      }, delay)
    }
    watchActive.value = true
  }

  const disconnect = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
  }

  const startWatch = async () => {
    await fetch('/__eros/start-watch', { method: 'POST' })
    watchActive.value = true
    connect()
  }

  const stopWatch = async () => {
    await fetch('/__eros/stop-watch', { method: 'POST' })
    watchActive.value = false
  }

  const checkStatus = async () => {
    try {
      const res = await fetch('/__eros/status')
      const data = await res.json()
      watchActive.value = data.watchActive
    } catch { watchActive.value = false }
  }

  const generateProjectCommand = ({ name, type, mood, scheme, references }) => {
    const parts = []
    if (name) parts.push(name)
    if (type) parts.push(`tipo: ${type}`)
    if (mood) parts.push(`mood: ${mood}`)
    if (scheme) parts.push(`scheme: ${scheme}`)
    if (references) parts.push(`refs: ${references}`)
    return `/project ${parts.join(', ')}`
  }

  onMounted(() => {
    instanceCount++
    checkStatus()
    // Defer SSE connect until after page load to prevent browser spinner
    if (document.readyState === 'complete') {
      connect()
    } else {
      window.addEventListener('load', () => connect(), { once: true })
    }
  })

  onUnmounted(() => {
    instanceCount--
    if (instanceCount <= 0) {
      disconnect()
      instanceCount = 0
    }
  })

  return {
    logs,
    watchActive,
    startWatch,
    stopWatch,
    generateProjectCommand,
  }
}
