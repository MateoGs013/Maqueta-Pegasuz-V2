<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import ObserverRadar from '@/components/ObserverRadar.vue'

const projects = ref([])
const activeProject = ref(null)
const review = ref(null)
const impact = ref(null)
const processing = ref(false)
const resultMsg = ref(null)

// Study
const studyUrls = ref('')
const studyResults = ref([])
const studying = ref(false)
const studyProgress = ref('')

// Awwwards
const awwwards = ref([])
const loadingAwwwards = ref(false)

// Auto-training
const trainHistory = ref([])
const trainRunning = ref(false)
const trainCount = ref(1)
const maxRetries = ref(1)
const skipDiscover = ref(false)

// Persistent config — loaded on mount, saved on change
const loadTrainConfig = async () => {
  try {
    const data = await (await fetch('/__eros/training/config')).json()
    trainCount.value = data.count ?? 1
    maxRetries.value = data.maxRetries ?? 1
    skipDiscover.value = data.skipDiscover ?? false
  } catch {}
}
const saveTrainConfig = async () => {
  try {
    await fetch('/__eros/training/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: trainCount.value,
        maxRetries: maxRetries.value,
        skipDiscover: skipDiscover.value,
      }),
    })
  } catch {}
}

// Detail modal
const detailSession = ref(null)
const detailFrames = ref([])
const openDetail = async (session) => {
  detailSession.value = session
  detailFrames.value = []
  // Fetch preserved preview frames for this session (if any)
  try {
    const res = await fetch(`/__eros/training/preview-list?session=${encodeURIComponent(session.id)}`)
    const data = await res.json()
    detailFrames.value = data.frames || []
  } catch { /* no frames — modal falls back to radar-only */ }
}
const closeDetail = () => {
  detailSession.value = null
  detailFrames.value = []
}

const formatDuration = (seconds) => {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s < 10 ? '0' : ''}${s}s`
}

// Live status (phase, task, progress) — written by eros-auto-train.mjs
const trainStatus = ref(null)
let statusTimer = null

const loadTrainStatus = async () => {
  try {
    const data = await (await fetch('/__eros/training/auto-train-status')).json()
    trainStatus.value = data
    // If status says active, lock the UI as running
    if (data.active) trainRunning.value = true
    else if (trainStatus.value?.finishedAt && Date.now() - new Date(trainStatus.value.finishedAt).getTime() > 60000) {
      // Finished > 60s ago → clear running flag so the button unlocks
      trainRunning.value = false
    }
  } catch { /* endpoint not available */ }
}

const progressPct = computed(() => {
  const s = trainStatus.value
  if (!s || !s.active || s.phaseIndex == null || s.phaseIndex < 0) return 0
  return Math.min(100, Math.round(((s.phaseIndex + 1) / (s.totalPhases || 10)) * 100))
})

const elapsedStr = computed(() => {
  const s = trainStatus.value
  if (!s?.startedAt) return ''
  const ms = Date.now() - new Date(s.startedAt).getTime()
  if (ms < 0) return ''
  const sec = Math.floor(ms / 1000)
  const m = Math.floor(sec / 60)
  const r = sec % 60
  return m + 'm ' + (r < 10 ? '0' : '') + r + 's'
})

const loadTrainHistory = async () => {
  try {
    const data = await (await fetch('/__eros/training/auto-train-history')).json()
    trainHistory.value = (data.sessions || []).slice().reverse().slice(0, 20)
  } catch { trainHistory.value = [] }
}

const launchTraining = async () => {
  trainRunning.value = true
  // Save config before launch so it persists for next session
  await saveTrainConfig()
  try {
    await fetch('/__eros/training/auto-train-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: trainCount.value,
        maxRetries: maxRetries.value,
        skipDiscover: skipDiscover.value,
      }),
    })
  } catch {}
  // Poll status every 3s for live phase updates + history every 15s for
  // completion detection. In-flight guard prevents stacking.
  let polling = false
  const poll = setInterval(async () => {
    if (polling) return
    polling = true
    try {
      await loadTrainHistory()
      if (trainStatus.value?.active === false && trainHistory.value.length > 0) {
        // Run ended — wait one more tick for history to sync, then unlock
        const latest = trainHistory.value[0]
        const age = Date.now() - new Date(latest.timestamp).getTime()
        if (age < 30000) { trainRunning.value = false; clearInterval(poll) }
      }
    } finally { polling = false }
  }, 15000)
  // Safety timeout — real runs take 30-90 min, not 20. 2h hard cap.
  setTimeout(() => { trainRunning.value = false; clearInterval(poll) }, 7200000)
}

const loadProjects = async () => {
  try { projects.value = await (await fetch('/__eros/training/projects')).json() } catch { projects.value = [] }
}

const loadImpact = async () => {
  try { impact.value = await (await fetch('/__eros/training/impact')).json() } catch { impact.value = null }
}

const loadAwwwards = async () => {
  loadingAwwwards.value = true
  try {
    const res = await fetch('/__eros/discover')
    const data = await res.json()
    awwwards.value = (data.sites || []).slice(0, 8)
  } catch { awwwards.value = [] }
  loadingAwwwards.value = false
}

const selectProject = async (slug) => {
  activeProject.value = slug
  resultMsg.value = null
  try { review.value = await (await fetch(`/__eros/training/review?project=${slug}`)).json() } catch { review.value = null }
}

const submitFeedback = async (action) => {
  if (!activeProject.value || !review.value) return
  processing.value = true
  resultMsg.value = null
  const feedback = { approve: [], corrections: [], rules: [], bulkApprove: true }
  if (action !== 'approve-all') {
    for (const h of review.value.highlights || []) {
      if (h.verdict === 'good') feedback.approve.push(h.name)
      else if (h.verdict === 'bad') feedback.corrections.push({ section: h.name, severity: 'bad', feedback: h.feedback || '' })
      else if (h.verdict === 'needs-work') feedback.corrections.push({ section: h.name, severity: 'needs-work', feedback: h.feedback || '' })
    }
  }
  try {
    resultMsg.value = await (await fetch('/__eros/training/review-feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: activeProject.value, feedback }),
    })).json()
    await loadImpact()
  } catch (e) { resultMsg.value = { error: e.message } }
  processing.value = false
}

// Study: supports multiple URLs (one per line or comma-separated)
const runStudy = async (url) => {
  const urls = url
    ? [url]
    : studyUrls.value.split(/[\n,]/).map(u => u.trim()).filter(u => u.startsWith('http'))

  if (urls.length === 0) return
  studying.value = true
  studyResults.value = []

  for (let i = 0; i < urls.length; i++) {
    studyProgress.value = `Analizando ${i + 1}/${urls.length}: ${urls[i].replace(/https?:\/\//, '').slice(0, 30)}...`
    try {
      const res = await fetch('/__eros/training/study', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urls[i] }),
      })
      const data = await res.json()
      studyResults.value.push({ url: urls[i], ...data })
    } catch (e) {
      studyResults.value.push({ url: urls[i], error: e.message })
    }
  }

  studyProgress.value = ''
  studying.value = false
  studyUrls.value = ''
  await loadImpact()
}

const studyAwwward = (site) => runStudy(site.url)

const setHighlightVerdict = (idx, verdict) => {
  if (review.value?.highlights?.[idx]) review.value.highlights[idx].verdict = verdict
}

onMounted(() => {
  loadTrainConfig()
  loadProjects()
  loadImpact()
  loadTrainHistory()
  loadTrainStatus()
  // Poll status every 3s — lightweight (just reads a small JSON file)
  statusTimer = setInterval(loadTrainStatus, 3000)
})
onUnmounted(() => {
  if (statusTimer) clearInterval(statusTimer)
})
</script>

<template>
  <div class="panel-page">
    <!-- IMPACT -->
    <div class="grid-row grid-row--impact" v-if="impact">
      <div class="cell metric-cell">
        <p class="label">Data points</p>
        <p class="value-sm">{{ impact.memory?.totalDataPoints || 0 }}</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Patterns</p>
        <p class="value-sm">{{ impact.memory?.patterns || 0 }}</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Accuracy</p>
        <p class="value-sm">{{ impact.calibration?.accuracy || '—' }}</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Rules</p>
        <p class="value-sm">{{ (impact.rules?.promoted || 0) + (impact.rules?.candidates || 0) }}</p>
      </div>
    </div>

    <!-- AUTO-TRAINING -->
    <div class="grid-row grid-row--1">
      <div class="cell">
        <div class="autotrain-header">
          <p class="label">Entrenamiento Autónomo</p>
          <div class="autotrain-controls">
            <select v-model="trainCount" @change="saveTrainConfig" class="train-select" :disabled="trainRunning" title="Cantidad de sesiones">
              <option :value="1">1 sesión</option>
              <option :value="2">2 sesiones</option>
              <option :value="3">3 sesiones</option>
              <option :value="5">5 sesiones</option>
            </select>
            <select v-model="maxRetries" @change="saveTrainConfig" class="train-select" :disabled="trainRunning" title="Reintentos por sección">
              <option :value="0">0 retries</option>
              <option :value="1">1 retry</option>
              <option :value="2">2 retries</option>
              <option :value="3">3 retries</option>
            </select>
            <label class="train-toggle" :title="'Saltear discover de Awwwards (usar brief genérico)'">
              <input type="checkbox" v-model="skipDiscover" @change="saveTrainConfig" :disabled="trainRunning" />
              <span>skip discover</span>
            </label>
            <button class="btn-train" @click="launchTraining" :disabled="trainRunning">
              {{ trainRunning ? 'Entrenando...' : '▶ Entrenar' }}
            </button>
          </div>
        </div>

        <!-- LIVE STATUS: phase + progress bar + elapsed time -->
        <div v-if="trainStatus?.active" class="train-running train-running--live">
          <div class="train-pulse"></div>
          <div class="train-live-body">
            <div class="train-live-line1">
              <span class="train-phase">
                {{ trainStatus.phase || 'inicializando' }}
                <span v-if="trainStatus.phaseIndex >= 0" class="train-phase-idx">
                  · phase {{ trainStatus.phaseIndex }}/{{ trainStatus.totalPhases || 10 }}
                </span>
              </span>
              <span class="train-elapsed">{{ elapsedStr }}</span>
            </div>
            <div v-if="trainStatus.currentTask" class="train-current-task">{{ trainStatus.currentTask }}</div>
            <div class="train-progress-bar"><div class="train-progress-fill" :style="{ width: progressPct + '%' }"></div></div>
            <div v-if="trainStatus.briefName" class="train-brief">
              <span>{{ trainStatus.briefName }}</span>
              <span v-if="trainStatus.mood"> · {{ trainStatus.mood }}</span>
              <span v-if="trainStatus.reference?.title"> · ref: {{ trainStatus.reference.title }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="trainRunning" class="train-running">
          <div class="train-pulse"></div>
          <span class="body-sm">Iniciando sesión...</span>
        </div>

        <div v-if="trainHistory.length" class="train-history">
          <div class="train-table-header">
            <span class="th-date">Fecha</span>
            <span class="th-ref">Referencia</span>
            <span class="th-mood">Mood</span>
            <span class="th-obs">Observer</span>
            <span class="th-audit">Audit</span>
            <span class="th-gates">Gates</span>
            <span class="th-time">Tiempo</span>
          </div>
          <button v-for="s in trainHistory" :key="s.id" class="train-row train-row--clickable" @click="openDetail(s)">
            <span class="td-date">{{ s.date }}</span>
            <span class="td-ref" :title="s.reference?.url">{{ s.reference?.title || '—' }}</span>
            <span class="td-mood">{{ s.mood?.split(' ')?.[0] || '—' }}</span>
            <span class="td-obs">
              <template v-if="s.observer">
                {{ Object.values(s.observer).length > 0
                  ? (Object.values(s.observer).reduce((a,b) => a+b, 0) / Object.values(s.observer).length).toFixed(1)
                  : '—' }}
              </template>
              <template v-else>—</template>
            </span>
            <span class="td-audit" :class="s.audit?.pass ? 'text-pass' : 'text-fail'">
              {{ s.audit?.pct != null ? s.audit.pct + '%' : '—' }}
            </span>
            <span class="td-gates">
              <template v-if="s.gates">
                <span class="pill pill--tiny pill--strong">{{ s.gates.approved }}</span>
                <span class="pill pill--tiny pill--warn" v-if="s.gates.retried">{{ s.gates.retried }}r</span>
                <span class="pill pill--tiny pill--weak" v-if="s.gates.flagged">{{ s.gates.flagged }}f</span>
              </template>
              <template v-else>—</template>
            </span>
            <span class="td-time">{{ s.duration ? Math.round(s.duration / 60) + 'm' : '—' }}</span>
          </button>
        </div>
        <p v-else class="body-sm dim">Sin sesiones de entrenamiento todavía.</p>
      </div>
    </div>

    <!-- STUDY REFERENCES -->
    <div class="grid-row grid-row--2">
      <div class="cell">
        <p class="label">Estudiar referencias</p>
        <p class="body-sm" style="margin:4px 0 12px">Pegá URLs (una por línea). Eros analiza y aprende automáticamente.</p>

        <div class="study-input-wrap">
          <textarea
            v-model="studyUrls"
            placeholder="https://sirnik.co&#10;https://fluid.glass&#10;https://artefakt.mov"
            rows="3"
            class="study-textarea"
            :disabled="studying"
          />
          <button class="btn-study" @click="runStudy()" :disabled="studying || !studyUrls.trim()">
            {{ studying ? 'Analizando...' : 'Estudiar' }}
          </button>
        </div>

        <!-- Progress -->
        <p v-if="studyProgress" class="study-progress">{{ studyProgress }}</p>

        <!-- Results -->
        <div v-if="studyResults.length" class="study-results">
          <div v-for="r in studyResults" :key="r.url" class="study-result-row">
            <div class="sr-header">
              <span class="sr-url">{{ r.url?.replace(/https?:\/\//, '').replace(/\/$/, '') }}</span>
              <span class="pill" :class="r.error ? 'pill--weak' : 'pill--strong'">
                {{ r.error ? 'error' : `+${r.memory?.growth || r.memoryUpdates || 0}` }}
              </span>
            </div>
            <template v-if="!r.error">
              <div class="sr-data">
                <span v-for="t in (r.analysis?.techniques || []).slice(0, 6)" :key="t" class="tag">{{ t }}</span>
              </div>
              <div class="sr-palette" v-if="r.analysis?.palette?.length">
                <span v-for="c in r.analysis.palette.slice(0, 6)" :key="c" class="color-dot" :style="{ background: c }"></span>
              </div>
            </template>
            <p v-else class="body-sm" style="color:var(--error)">{{ r.error }}</p>
          </div>
        </div>
      </div>

      <!-- Awwwards SOTD -->
      <div class="cell">
        <div class="aww-header">
          <p class="label">Awwwards SOTD</p>
          <button class="btn-refresh" @click="loadAwwwards" :disabled="loadingAwwwards">
            {{ loadingAwwwards ? '...' : '↻' }}
          </button>
        </div>
        <div v-if="awwwards.length" class="aww-list">
          <div v-for="site in awwwards" :key="site.url" class="aww-row">
            <div class="aww-info">
              <span class="aww-title">{{ site.title }}</span>
              <span class="aww-url">{{ site.url?.replace(/https?:\/\//, '').replace(/\/$/, '') }}</span>
            </div>
            <div class="aww-actions">
              <a class="btn-visit-sm" :href="site.url" target="_blank" rel="noopener" title="Visitar sitio">↗</a>
              <button class="btn-study-sm" @click="studyAwwward(site)" :disabled="studying">
                Estudiar
              </button>
            </div>
          </div>
        </div>
        <p v-else-if="loadingAwwwards" class="body-sm dim">Buscando en Awwwards... (puede tardar 1 min)</p>
        <p v-else class="body-sm dim">Clickeá ↻ para cargar los últimos ganadores.</p>
      </div>
    </div>

    <!-- PROJECT REVIEW -->
    <div class="grid-row grid-row--2">
      <div class="cell">
        <p class="label">Proyectos</p>
        <div class="project-list" v-if="projects.length > 0">
          <button v-for="p in projects" :key="p.slug"
            class="project-row" :class="{ 'project-row--active': activeProject === p.slug }"
            @click="selectProject(p.slug)"
          >
            <img v-if="p.preview" :src="p.preview" class="project-thumb" alt="" />
            <div v-else class="project-thumb project-thumb--empty"></div>
            <span class="project-name">{{ p.projectName || p.slug }}</span>
            <span class="pill">{{ p.score?.toFixed(1) || '—' }}</span>
          </button>
        </div>
        <p class="body-sm dim" v-else>Sin proyectos.</p>

        <div class="result-block" v-if="resultMsg">
          <p class="label">Resultado</p>
          <template v-if="!resultMsg.error">
            <div class="result-pills">
              <span class="pill pill--strong" v-if="resultMsg.memory">+{{ resultMsg.memory.growth }} data points</span>
              <span class="pill pill--accent" v-if="resultMsg.memoryUpdates">{{ resultMsg.memoryUpdates }} updates</span>
            </div>
          </template>
          <p class="body-sm" style="color:var(--error)" v-else>{{ resultMsg.error }}</p>
        </div>
      </div>

      <div class="cell" v-if="review">
        <div class="review-header">
          <p class="label">Review</p>
          <p class="title-sm">{{ review.project }}</p>
          <div class="review-meta">
            <span class="pill pill--accent">{{ review.observerScore }}</span>
            <span class="pill">{{ review.totalSections }} sec</span>
          </div>
        </div>
        <div v-if="review.highlights?.length > 0" class="highlights">
          <div v-for="(h, i) in review.highlights" :key="h.name" class="highlight-card">
            <div class="highlight-head">
              <span class="highlight-name">{{ h.name }}</span>
              <span class="body-sm">{{ h.reason }}</span>
            </div>
            <div class="verdict-buttons">
              <button :class="['vbtn', { active: h.verdict === 'good' }]" @click="setHighlightVerdict(i, 'good')">Bien</button>
              <button :class="['vbtn vbtn--mid', { active: h.verdict === 'needs-work' }]" @click="setHighlightVerdict(i, 'needs-work')">Mejorar</button>
              <button :class="['vbtn vbtn--bad', { active: h.verdict === 'bad' }]" @click="setHighlightVerdict(i, 'bad')">Mal</button>
            </div>
          </div>
        </div>
        <p v-else class="body-sm" style="margin-top:12px">{{ review.bulkCount }} secciones — sin highlights.</p>
        <div class="fb-actions">
          <button class="btn-action" @click="submitFeedback('submit')" :disabled="processing">Enviar</button>
          <button class="btn-action btn-action--primary" @click="submitFeedback('approve-all')" :disabled="processing">Todo bien</button>
        </div>
      </div>
      <div class="cell" v-else>
        <p class="label">Review</p>
        <p class="body-sm dim" style="margin-top:24px">Selecciona un proyecto.</p>
      </div>
    </div>

    <!-- ── DETAIL MODAL ── -->
    <div v-if="detailSession" class="detail-backdrop" @click.self="closeDetail">
      <div class="detail-modal">
        <header class="detail-head">
          <div class="detail-head-left">
            <p class="label">Sesión</p>
            <h2 class="detail-title">{{ detailSession.name }}</h2>
            <p class="body-sm dim">{{ detailSession.date }} · {{ formatDuration(detailSession.duration) }}</p>
          </div>
          <button class="detail-close" @click="closeDetail" title="Cerrar">×</button>
        </header>

        <div class="detail-body">
          <!-- Reference + mood + technique -->
          <div class="detail-meta">
            <div v-if="detailSession.reference" class="detail-meta-item">
              <span class="label">Referencia</span>
              <a v-if="detailSession.reference.url" :href="detailSession.reference.url" target="_blank" rel="noopener" class="detail-ref-link">
                {{ detailSession.reference.title }} ↗
              </a>
              <span v-else>{{ detailSession.reference.title }}</span>
            </div>
            <div class="detail-meta-item">
              <span class="label">Mood</span>
              <span>{{ detailSession.mood || '—' }}</span>
            </div>
            <div class="detail-meta-item">
              <span class="label">Técnica</span>
              <span>{{ detailSession.technique || '—' }}</span>
            </div>
          </div>

          <!-- Observer radar (if has data) -->
          <div v-if="detailSession.observer && Object.keys(detailSession.observer).length" class="detail-observer">
            <ObserverRadar :dimensions="detailSession.observer" :size="280" title="Observer V2" />
          </div>
          <div v-else class="detail-no-observer">
            <p class="body-sm dim">Sin datos del observer para esta sesión.</p>
          </div>

          <!-- Preserved screenshots from Phase 4 (observer) -->
          <div v-if="detailFrames.length" class="detail-previews">
            <p class="label">Screenshots (observer)</p>
            <div class="detail-previews-grid">
              <a
                v-for="f in detailFrames"
                :key="f"
                :href="`/__eros/training/preview/${encodeURIComponent(detailSession.id)}/${f}`"
                target="_blank"
                rel="noopener"
                class="detail-preview-frame"
                :title="f"
              >
                <img :src="`/__eros/training/preview/${encodeURIComponent(detailSession.id)}/${f}`" :alt="f" loading="lazy" />
                <span class="detail-preview-label">{{ f.replace(/\.(png|jpg|webp)$/, '') }}</span>
              </a>
            </div>
          </div>

          <!-- Audit + gates summary -->
          <div class="detail-stats">
            <div class="cell metric-cell">
              <p class="label">Audit</p>
              <p class="value-sm" :class="(detailSession.audit?.pct || 0) >= 75 ? 'text-pass' : (detailSession.audit?.pct || 0) >= 50 ? '' : 'text-fail'">
                {{ detailSession.audit?.pct != null ? detailSession.audit.pct + '%' : '—' }}
              </p>
              <p class="body-sm dim" v-if="detailSession.audit?.score != null && detailSession.audit?.total != null">
                {{ detailSession.audit.score }}/{{ detailSession.audit.total }}
              </p>
            </div>
            <div class="cell metric-cell">
              <p class="label">Gates aprobadas</p>
              <p class="value-sm">{{ detailSession.gates?.approved || 0 }}<span class="suffix">/{{ detailSession.gates?.total || 0 }}</span></p>
              <p class="body-sm dim">
                {{ detailSession.gates?.retried || 0 }} retries · {{ detailSession.gates?.flagged || 0 }} flagged
              </p>
            </div>
            <div class="cell metric-cell">
              <p class="label">Reglas</p>
              <p class="value-sm">{{ detailSession.rulesValidated || 0 }}</p>
              <p class="body-sm dim">validadas esta sesión</p>
            </div>
          </div>

          <!-- Sections list -->
          <div v-if="detailSession.sections?.length" class="detail-sections">
            <p class="label">Secciones</p>
            <ul class="detail-sections-list">
              <li v-for="(s, i) in detailSession.sections" :key="i">{{ s }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-row--impact { grid-template-columns: repeat(4, 1fr); }
.metric-cell { display: grid; gap: 6px; align-content: end; min-height: 80px; }

/* ── Auto-Training ── */
.autotrain-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.autotrain-controls { display: flex; align-items: center; gap: 8px; }
.train-select {
  padding: 4px 8px; background: var(--surface); border: 1px solid var(--line);
  color: var(--text); font: 400 11px var(--font-mono); cursor: pointer;
}
.train-toggle {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 8px; background: var(--surface); border: 1px solid var(--line);
  font: 400 10px var(--font-mono); color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.04em; cursor: pointer;
  user-select: none;
}
.train-toggle input { margin: 0; cursor: pointer; accent-color: var(--accent); }
.train-toggle:has(input:checked) { color: var(--accent); border-color: var(--line-accent); }
.btn-train {
  padding: 6px 14px; border: 1px solid var(--accent); background: transparent;
  color: var(--accent); font: 600 10px var(--font-mono); letter-spacing: 0.06em;
  text-transform: uppercase; cursor: pointer; transition: all 0.15s;
}
.btn-train:hover { background: var(--accent-ember); }
.btn-train:disabled { opacity: 0.5; cursor: default; }
.train-running {
  display: flex; align-items: center; gap: 10px;
  margin-top: 12px; padding: 10px 12px; background: var(--surface); border: 1px solid var(--line);
}
.train-running--live {
  align-items: flex-start;
  padding: 14px 16px;
  border-left: 2px solid var(--accent);
}
.train-pulse {
  width: 8px; height: 8px; border-radius: 50%; background: var(--accent);
  animation: pulse-dot 1.5s ease infinite;
  flex-shrink: 0; margin-top: 4px;
}
.train-live-body { flex: 1; display: grid; gap: 6px; min-width: 0; }
.train-live-line1 {
  display: flex; align-items: baseline; justify-content: space-between; gap: 16px;
}
.train-phase {
  font: 600 11px var(--font-mono); color: var(--text); text-transform: uppercase; letter-spacing: 0.06em;
}
.train-phase-idx { color: var(--text-dim); font-weight: 400; text-transform: none; letter-spacing: 0; }
.train-elapsed { font: 400 11px var(--font-mono); color: var(--text-dim); }
.train-current-task {
  font: 400 11px var(--font-mono); color: var(--text-muted); opacity: 0.8;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.train-progress-bar {
  width: 100%; height: 3px; background: var(--line); border-radius: 2px; overflow: hidden;
}
.train-progress-fill {
  height: 100%; background: var(--accent); transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.train-brief { font: 400 10px var(--font-mono); color: var(--text-dim); }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.train-history { margin-top: 12px; }
.train-table-header, .train-row {
  display: grid; grid-template-columns: 70px 1fr 80px 55px 50px 70px 45px;
  gap: 6px; align-items: center; padding: 6px 0;
}
.train-table-header {
  border-bottom: 1px solid var(--line); font: 600 8px var(--font-mono);
  color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em;
}
.train-row { border-bottom: 1px solid var(--line-subtle, rgba(255,255,255,0.04)); font: 400 11px var(--font-body); color: var(--text); }
.train-row:last-child { border-bottom: 0; }
.td-ref { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.td-mood { font: 400 10px var(--font-mono); color: var(--text-dim); }
.td-obs, .td-audit, .td-time { font: 500 11px var(--font-mono); text-align: center; }
.td-gates { display: flex; gap: 3px; }
.text-pass { color: var(--success, #4ade80); }
.text-fail { color: var(--error, #f87171); }
.pill--tiny { font-size: 8px; padding: 1px 4px; }
.pill--warn { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border-color: rgba(251, 191, 36, 0.3); }

/* ── Study ── */
.study-input-wrap { display: flex; flex-direction: column; gap: 1px; background: var(--line); }
.study-textarea {
  padding: 12px; border: 0; background: var(--surface);
  color: var(--text); font: 400 12px/1.6 var(--font-body);
  resize: vertical; outline: none; min-height: 72px;
}
.study-textarea::placeholder { color: var(--text-dim); }
.study-textarea:disabled { opacity: 0.5; }
.btn-study {
  padding: 12px; border: 0; background: var(--accent);
  color: var(--bg); font: 600 11px var(--font-mono);
  letter-spacing: 0.08em; text-transform: uppercase;
  cursor: pointer; transition: background 0.15s;
}
.btn-study:hover { background: var(--accent-hot); }
.btn-study:disabled { opacity: 0.4; cursor: not-allowed; }

.study-progress {
  font: 500 10px var(--font-mono); color: var(--accent);
  letter-spacing: 0.04em; margin-top: 8px;
  animation: pulse-text 1.5s infinite;
}
@keyframes pulse-text { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

/* Study results */
.study-results { margin-top: 12px; }
.study-result-row { padding: 10px 0; border-bottom: 1px solid var(--line); }
.study-result-row:last-child { border-bottom: 0; }
.sr-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.sr-url { font: 500 12px var(--font-body); color: var(--text); }
.sr-data { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 4px; }
.tag {
  font: 600 7px var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase;
  padding: 2px 5px; border: 1px solid var(--line-strong); color: var(--text-muted);
}
.sr-palette { display: flex; gap: 3px; }
.color-dot { width: 14px; height: 14px; border: 1px solid var(--line); }

/* ── Awwwards ── */
.aww-header { display: flex; align-items: center; justify-content: space-between; }
.btn-refresh {
  width: 28px; height: 28px; border: 1px solid var(--line); background: transparent;
  color: var(--text-muted); font: 500 14px var(--font-body);
  cursor: pointer; transition: all 0.15s;
}
.btn-refresh:hover { color: var(--accent); border-color: var(--line-accent); }
.btn-refresh:disabled { opacity: 0.4; }

.aww-list { display: grid; gap: 0; margin-top: 8px; }
.aww-row {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 8px 0; border-bottom: 1px solid var(--line);
}
.aww-row:last-child { border-bottom: 0; }
.aww-info { display: grid; gap: 1px; min-width: 0; }
.aww-title { font: 500 12px var(--font-body); color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.aww-url { font: 400 9px var(--font-mono); color: var(--text-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.btn-study-sm {
  padding: 4px 10px; border: 1px solid var(--line); background: transparent;
  color: var(--text-muted); font: 600 8px var(--font-mono);
  letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; transition: all 0.15s; flex-shrink: 0;
}
.btn-study-sm:hover { color: var(--accent); border-color: var(--line-accent); background: var(--accent-ember); }
.btn-study-sm:disabled { opacity: 0.4; }
.aww-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.btn-visit-sm {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border: 1px solid var(--line); background: transparent;
  color: var(--text-muted); font-size: 13px; text-decoration: none;
  cursor: pointer; transition: all 0.15s;
}
.btn-visit-sm:hover { color: var(--accent); border-color: var(--line-accent); background: var(--accent-ember); }

/* ── Projects ── */
.project-list { display: grid; gap: 0; margin-top: 8px; }
.project-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; padding: 10px 0; border-bottom: 1px solid var(--line);
  background: transparent; border-left: 0; border-right: 0; border-top: 0;
  cursor: pointer; text-align: left; width: 100%; transition: background 0.15s;
}
.project-row:last-child { border-bottom: 0; }
.project-row:hover { background: var(--surface); margin: 0 -32px; padding: 10px 32px; }
.project-row--active { background: var(--surface); margin: 0 -32px; padding: 10px 32px; }
.project-row--active .project-name { color: var(--accent); }
.project-name { font: 500 12px var(--font-body); color: var(--text); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.project-thumb {
  width: 48px; height: 32px; border-radius: 3px; object-fit: cover;
  flex-shrink: 0; border: 1px solid var(--line); background: var(--surface);
}
.project-thumb--empty {
  background: var(--surface); opacity: 0.4;
}
.dim { color: var(--text-dim); font-style: italic; }

.result-block { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--line); }
.result-pills { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }

/* ── Review ── */
.review-header { margin-bottom: 12px; }
.review-meta { display: flex; gap: 4px; margin-top: 6px; }
.highlight-card { padding: 12px 0; border-bottom: 1px solid var(--line); }
.highlight-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.highlight-name { font: 600 12px var(--font-body); color: var(--text); }
.verdict-buttons { display: flex; gap: 1px; background: var(--line); }
.vbtn {
  flex: 1; padding: 6px 0; border: 0; background: var(--surface);
  color: var(--text-muted); font: 600 9px var(--font-mono);
  letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; transition: all 0.15s;
}
.vbtn:hover { background: var(--surface-hot); color: var(--text); }
.vbtn.active { background: var(--success-soft); color: var(--success); }
.vbtn--mid.active { background: var(--warn-soft); color: var(--warn); }
.vbtn--bad.active { background: var(--error-soft); color: var(--error); }

.fb-actions { display: flex; gap: 1px; margin-top: 16px; background: var(--line); }
.btn-action {
  flex: 1; padding: 12px; font: 600 10px var(--font-mono);
  letter-spacing: 0.08em; text-transform: uppercase;
  cursor: pointer; border: 0; background: var(--surface);
  color: var(--text-muted); transition: all 0.15s;
}
.btn-action:hover { background: var(--surface-hot); color: var(--text); }
.btn-action:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-action--primary { background: var(--accent); color: var(--bg); }
.btn-action--primary:hover { background: var(--accent-hot); }

@media (max-width: 1200px) { .grid-row--impact { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 980px) {
  .project-row:hover, .project-row--active { margin: 0 -16px; padding: 10px 16px; }
}

/* ── Clickable rows ── */
.train-row--clickable {
  width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--line-subtle, rgba(255,255,255,0.04));
  cursor: pointer; text-align: left; font: inherit; color: inherit;
  padding: 6px 0;
}
.train-row--clickable:hover { background: var(--surface); }

/* ── Detail modal ── */
.detail-backdrop {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  animation: fade-in 0.15s ease;
}
.detail-modal {
  width: 100%; max-width: 720px; max-height: calc(100vh - 48px);
  background: var(--bg); border: 1px solid var(--line-accent);
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.detail-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  padding: 24px 32px 20px; border-bottom: 1px solid var(--line);
}
.detail-head-left { min-width: 0; flex: 1; }
.detail-title { font: 700 22px var(--font-display); color: var(--text); margin: 4px 0 6px; letter-spacing: -0.02em; }
.detail-close {
  width: 32px; height: 32px; background: transparent; border: 1px solid var(--line);
  color: var(--text-muted); font: 300 22px var(--font-mono); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.detail-close:hover { color: var(--text); border-color: var(--text); }

.detail-body {
  padding: 24px 32px 32px; overflow-y: auto;
  display: grid; gap: 24px;
}

.detail-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.detail-meta-item { display: grid; gap: 4px; }
.detail-meta-item .label { margin-bottom: 0; }
.detail-meta-item span { font: 400 13px var(--font-body); color: var(--text); }
.detail-ref-link { color: var(--accent); text-decoration: none; }
.detail-ref-link:hover { text-decoration: underline; }

.detail-observer {
  display: flex; justify-content: center;
  padding: 16px 0;
  border: 1px solid var(--line); border-left: 2px solid var(--accent);
}
.detail-no-observer {
  padding: 24px; text-align: center; border: 1px dashed var(--line);
}

.detail-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--line);
}
.detail-stats .metric-cell {
  background: var(--bg); padding: 16px;
}

.detail-sections .label { margin-bottom: 8px; }
.detail-sections-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-wrap: wrap; gap: 6px;
}
.detail-sections-list li {
  padding: 4px 10px; background: var(--surface); border: 1px solid var(--line);
  font: 500 11px var(--font-mono); color: var(--text);
}

/* Preserved preview screenshots */
.detail-previews .label { margin-bottom: 8px; }
.detail-previews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}
.detail-preview-frame {
  display: grid;
  gap: 4px;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--line);
  background: var(--surface);
  overflow: hidden;
  transition: border-color 0.15s;
}
.detail-preview-frame:hover { border-color: var(--accent); }
.detail-preview-frame img {
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  object-position: top;
}
.detail-preview-label {
  font: 500 9px var(--font-mono);
  color: var(--text-dim);
  padding: 4px 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
</style>
