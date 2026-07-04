import { reactive } from 'vue'

export const store = reactive({
  connected: false,
  project: null,
  sessionStatus: 'idle',
  decisions: [],
  captures: [],
  critiques: [],
  feedback: [],
  activity: [],
  assistantFeed: [],
  /** UI: selected capture for pin mode / inspection */
  selectedCaptureId: null,
  pinMode: false,
})

export async function api(path, body) {
  const res = await fetch(`/api/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || res.statusText)
  return data
}

export async function loadState() {
  const s = await api('state')
  Object.assign(store, s)
}

export function connectWs() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws'
  const ws = new WebSocket(`${proto}://${location.host}/ws`)
  ws.onopen = () => { store.connected = true; loadState().catch(() => {}) }
  ws.onclose = () => { store.connected = false; setTimeout(connectWs, 2000) }
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    switch (msg.type) {
      case 'hello':
        store.sessionStatus = msg.sessionStatus
        store.project = msg.project
        break
      case 'status': store.sessionStatus = msg.status; break
      case 'project': store.project = msg.project; break
      case 'capture':
        store.captures = [msg.capture, ...store.captures.filter((c) => c.id !== msg.capture.id)].slice(0, 60)
        if (!store.selectedCaptureId) store.selectedCaptureId = msg.capture.id
        break
      case 'decision': {
        const i = store.decisions.findIndex((d) => d.id === msg.card.id)
        if (i >= 0) store.decisions[i] = msg.card
        else store.decisions.unshift(msg.card)
        break
      }
      case 'critique': {
        const i = store.critiques.findIndex((c) => c.id === msg.critique.id)
        if (i >= 0) store.critiques[i] = msg.critique
        else store.critiques.unshift(msg.critique)
        break
      }
      case 'feedback': store.feedback.unshift(msg.pin); break
      case 'feedback-drained':
        for (const p of store.feedback) if (msg.ids.includes(p.id)) p.drainedAt = new Date().toISOString()
        break
      case 'assistant-text':
        store.assistantFeed.unshift({ ts: Date.now(), text: msg.text })
        store.assistantFeed = store.assistantFeed.slice(0, 40)
        break
      case 'session-error':
        store.assistantFeed.unshift({ ts: Date.now(), text: `⚠ ${msg.error}`, error: true })
        break
    }
  }
}
