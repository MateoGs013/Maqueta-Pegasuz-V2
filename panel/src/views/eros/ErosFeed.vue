<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const events = ref([])
const loading = ref(false)
const lastFetch = ref(null)
let pollTimer = null

const fetchFeed = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const res = await fetch('/__eros/feed?limit=100')
    const data = await res.json()
    // Reverse so newest first
    events.value = (data.events || []).slice().reverse()
    lastFetch.value = new Date()
  } catch {
    // Keep previous data on error
  } finally {
    loading.value = false
  }
}

const relativeTime = (iso) => {
  if (!iso) return ''
  const ts = new Date(iso).getTime()
  const diff = Date.now() - ts
  if (diff < 0) return 'ahora'
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'hace ' + s + 's'
  const m = Math.floor(s / 60)
  if (m < 60) return 'hace ' + m + 'm'
  const h = Math.floor(m / 60)
  if (h < 24) return 'hace ' + h + 'h'
  const d = Math.floor(h / 24)
  return 'hace ' + d + 'd'
}

// Mood → color token mapping
const moodClass = (mood) => {
  const map = {
    confident: 'mood-confident',
    reflective: 'mood-reflective',
    curious: 'mood-curious',
    determined: 'mood-determined',
    frustrated: 'mood-frustrated',
    satisfied: 'mood-satisfied',
    cautious: 'mood-cautious',
    proud: 'mood-proud',
    neutral: 'mood-neutral',
  }
  return map[mood] || 'mood-neutral'
}

// Type → label mapping
const typeLabel = (type) => {
  const map = {
    'project-completed': 'Proyecto terminado',
    'project-started': 'Proyecto iniciado',
    'project-failed': 'Proyecto falló',
    'study-reference': 'Estudiando referencia',
    'rule-promoted': 'Regla promovida',
    'rule-candidate': 'Nueva regla candidata',
    'personality-update': 'Personalidad actualizada',
    'gap-discovered': 'Gap detectado',
    'bug-fixed': 'Bug resuelto',
    'observation': 'Observación',
    'experiment': 'Experimento',
    'milestone': 'Hito',
  }
  return map[type] || type
}

// Type → icon character
const typeIcon = (type) => {
  const map = {
    'project-completed': '◆',
    'project-started': '▸',
    'project-failed': '⨯',
    'study-reference': '◉',
    'rule-promoted': '✓',
    'rule-candidate': '?',
    'personality-update': '⬢',
    'gap-discovered': '△',
    'bug-fixed': '⚐',
    'observation': '·',
    'experiment': '※',
    'milestone': '★',
  }
  return map[type] || '·'
}

const groupedByDay = computed(() => {
  const groups = new Map()
  for (const evt of events.value) {
    const day = (evt.timestamp || '').slice(0, 10)
    if (!groups.has(day)) groups.set(day, [])
    groups.get(day).push(evt)
  }
  return [...groups.entries()].map(([day, items]) => ({ day, items }))
})

const dayLabel = (day) => {
  if (!day) return 'Sin fecha'
  const d = new Date(day + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((today - d) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  if (diff < 7) return 'Hace ' + diff + ' días'
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

onMounted(() => {
  fetchFeed()
  pollTimer = setInterval(fetchFeed, 10000)
})
onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="panel-page">
    <div class="feed-header grid-row">
      <div class="cell">
        <p class="label">Feed de actividad</p>
        <p class="body-sm" v-if="events.length">{{ events.length }} eventos · última sync {{ lastFetch ? relativeTime(lastFetch.toISOString()) : '—' }}</p>
        <p class="body-sm dim" v-else>Sin actividad todavía. Eros empieza a postear cuando hace algo.</p>
      </div>
    </div>

    <div class="feed-timeline" v-if="events.length">
      <div v-for="group in groupedByDay" :key="group.day" class="feed-day">
        <p class="feed-day-label">{{ dayLabel(group.day) }}</p>
        <div class="feed-items">
          <div v-for="evt in group.items" :key="evt.id" class="feed-item" :class="moodClass(evt.mood)">
            <div class="feed-icon">{{ typeIcon(evt.type) }}</div>
            <div class="feed-body">
              <div class="feed-line-1">
                <span class="feed-type">{{ typeLabel(evt.type) }}</span>
                <span class="feed-time">{{ relativeTime(evt.timestamp) }}</span>
              </div>
              <p class="feed-title">{{ evt.title }}</p>
              <p v-if="evt.detail" class="feed-detail">{{ evt.detail }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feed-header .cell { display: grid; gap: 4px; }
.dim { color: var(--text-dim); font-style: italic; }

.feed-timeline { display: grid; gap: 32px; margin-top: 24px; }
.feed-day { display: grid; gap: 12px; }
.feed-day-label {
  font: 600 9px var(--font-mono); color: var(--text-dim);
  text-transform: uppercase; letter-spacing: 0.12em;
  padding-bottom: 8px; border-bottom: 1px solid var(--line);
}

.feed-items { display: grid; gap: 0; }

.feed-item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line-subtle, rgba(255,255,255,0.04));
  border-left: 2px solid transparent;
  padding-left: 12px;
  margin-left: -12px;
  transition: background 0.15s;
}
.feed-item:last-child { border-bottom: 0; }
.feed-item:hover { background: var(--surface); }

.feed-icon {
  display: flex; align-items: flex-start; justify-content: center;
  width: 28px; height: 28px;
  font: 600 14px var(--font-mono); color: var(--text-muted);
  padding-top: 2px;
}

.feed-body { display: grid; gap: 4px; min-width: 0; }

.feed-line-1 { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
.feed-type {
  font: 600 9px var(--font-mono); color: var(--text-dim);
  text-transform: uppercase; letter-spacing: 0.08em;
}
.feed-time { font: 400 10px var(--font-mono); color: var(--text-dim); flex-shrink: 0; }

.feed-title { font: 500 14px var(--font-body); color: var(--text); margin: 0; }
.feed-detail { font: 400 12px/1.5 var(--font-body); color: var(--text-muted); margin: 0; }

/* ── Mood colors ── */
.mood-confident  { border-left-color: #4ade80; }
.mood-confident  .feed-icon { color: #4ade80; }
.mood-reflective { border-left-color: #a78bfa; }
.mood-reflective .feed-icon { color: #a78bfa; }
.mood-curious    { border-left-color: #22d3ee; }
.mood-curious    .feed-icon { color: #22d3ee; }
.mood-determined { border-left-color: var(--accent, #f59e0b); }
.mood-determined .feed-icon { color: var(--accent, #f59e0b); }
.mood-frustrated { border-left-color: #f87171; }
.mood-frustrated .feed-icon { color: #f87171; }
.mood-satisfied  { border-left-color: #60a5fa; }
.mood-satisfied  .feed-icon { color: #60a5fa; }
.mood-cautious   { border-left-color: #fbbf24; }
.mood-cautious   .feed-icon { color: #fbbf24; }
.mood-proud      { border-left-color: #f0abfc; }
.mood-proud      .feed-icon { color: #f0abfc; }
.mood-neutral    { border-left-color: transparent; }
</style>
