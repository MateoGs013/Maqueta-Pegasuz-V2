<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const entries = ref([])
const loading = ref(false)
const lastFetch = ref(null)
let pollTimer = null

const fetchDiary = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const res = await fetch('/__eros/diary?limit=50')
    const data = await res.json()
    entries.value = data.entries || []
    lastFetch.value = new Date()
  } catch {
    // Keep previous
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDiary()
  pollTimer = setInterval(fetchDiary, 60000) // 1 min — diary changes slowly
})
onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

const formatTitle = (title) => {
  // Title format: "YYYY-MM-DD HH:MM — ProjectName"
  // Split into date/time/project
  const m = title.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s+—\s+(.+)$/)
  if (!m) return { date: title, time: '', project: '' }
  return { date: m[1], time: m[2], project: m[3] }
}
</script>

<template>
  <div class="panel-page diary-page">
    <h1 class="sr-only">Diario de Eros</h1>
    <div class="diary-header grid-row">
      <div class="cell">
        <p class="label">Diario de Eros</p>
        <p class="body-sm dim">
          Reflexiones post-proyecto, en primera persona. Se escriben
          automáticamente cuando se cierra un proyecto (via
          <code>eros-meta.mjs reflect</code>).
        </p>
        <p class="body-sm" v-if="entries.length">
          {{ entries.length }} entradas
        </p>
      </div>
    </div>

    <div v-if="entries.length" class="diary-list">
      <article v-for="(entry, i) in entries" :key="entry.timestamp || i" class="diary-entry">
        <header class="diary-head">
          <div class="diary-head-left">
            <span class="diary-date">{{ formatTitle(entry.title).date }}</span>
            <span class="diary-time">{{ formatTitle(entry.title).time }}</span>
          </div>
          <span class="diary-project">{{ formatTitle(entry.title).project }}</span>
        </header>
        <p class="diary-body">{{ entry.body }}</p>
      </article>
    </div>
    <div v-else-if="loading" class="diary-empty">
      <p class="body-sm dim">Cargando…</p>
    </div>
    <div v-else class="diary-empty">
      <p class="body-sm dim">
        Sin entradas todavía. Eros escribe una reflexión cada vez que un
        proyecto termina y se corre <code>eros-meta.mjs reflect --project X</code>.
      </p>
    </div>
  </div>
</template>

<style scoped>
.diary-page { max-width: 720px; }
.diary-header .cell { display: grid; gap: 6px; }
.dim { color: var(--text-dim); font-style: italic; }
code { font: 400 11px var(--font-mono); color: var(--accent); }

.diary-list { display: grid; gap: 28px; margin-top: 32px; }

.diary-entry {
  padding: 24px 0;
  border-top: 1px solid var(--line);
  display: grid;
  gap: 14px;
}
.diary-entry:first-child { border-top: 0; padding-top: 0; }

.diary-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}
.diary-head-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.diary-date {
  font: 600 10px var(--font-mono);
  color: var(--text-dim);
  letter-spacing: 0.08em;
}
.diary-time {
  font: 400 10px var(--font-mono);
  color: var(--text-dim);
  opacity: 0.6;
}
.diary-project {
  font: 500 14px var(--font-body);
  color: var(--text);
  text-align: right;
}

.diary-body {
  font: 400 15px/1.65 var(--font-body, Georgia, serif);
  color: var(--text);
  white-space: pre-wrap;
  font-style: italic;
  padding-left: 16px;
  border-left: 2px solid var(--accent);
  margin: 0;
}

.diary-empty {
  margin-top: 48px;
  padding: 48px 24px;
  text-align: center;
}
</style>
