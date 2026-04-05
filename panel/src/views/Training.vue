<script setup>
import { ref, onMounted } from 'vue'

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

onMounted(() => { loadProjects(); loadImpact(); loadAwwwards() })
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
            <button class="btn-study-sm" @click="studyAwwward(site)" :disabled="studying">
              Estudiar
            </button>
          </div>
        </div>
        <p v-else-if="loadingAwwwards" class="body-sm dim">Buscando en Awwwards...</p>
        <p v-else class="body-sm dim">Sin resultados. Clickeá ↻ para buscar.</p>
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
  </div>
</template>

<style scoped>
.grid-row--impact { grid-template-columns: repeat(4, 1fr); }
.metric-cell { display: grid; gap: 6px; align-content: end; min-height: 80px; }

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
.project-name { font: 500 12px var(--font-body); color: var(--text); }
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
</style>
