import { ref, onMounted, onUnmounted } from 'vue'

const logs = ref([])
const watchActive = ref(false)
let eventSource = null

export function useEros() {
  const connect = () => {
    if (eventSource) return
    eventSource = new EventSource('/__eros/logs')
    eventSource.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data)
        logs.value.push(entry)
        if (logs.value.length > 150) logs.value = logs.value.slice(-100)
      } catch { /* ignore parse errors */ }
    }
    eventSource.onerror = () => {
      watchActive.value = false
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
    checkStatus()
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    logs,
    watchActive,
    startWatch,
    stopWatch,
    generateProjectCommand,
  }
}
