<script setup>
import { ref, onMounted, computed } from 'vue'

const projects = ref([])
const activeProject = ref(null)
const review = ref(null)
const impact = ref(null)
const studyUrl = ref('')
const studyResult = ref(null)
const processing = ref(false)
const resultMsg = ref(null)

const loadProjects = async () => {
  try {
    const res = await fetch('/__eros/training/projects')
    projects.value = await res.json()
  } catch { projects.value = [] }
}

const loadImpact = async () => {
  try {
    const res = await fetch('/__eros/training/impact')
    impact.value = await res.json()
  } catch { impact.value = null }
}

const selectProject = async (slug) => {
  activeProject.value = slug
  resultMsg.value = null
  try {
    const res = await fetch(`/__eros/training/review?project=${slug}`)
    review.value = await res.json()
  } catch { review.value = null }
}

const submitFeedback = async (action) => {
  if (!activeProject.value || !review.value) return
  processing.value = true
  resultMsg.value = null

  const feedback = { approve: [], corrections: [], rules: [], bulkApprove: true }

  if (action === 'approve-all') {
    // Everything approved
  } else {
    // Collect from highlights
    for (const h of review.value.highlights || []) {
      if (h.verdict === 'good') feedback.approve.push(h.name)
      else if (h.verdict === 'bad') {
        feedback.corrections.push({ section: h.name, severity: 'bad', feedback: h.feedback || '' })
      } else if (h.verdict === 'needs-work') {
        feedback.corrections.push({ section: h.name, severity: 'needs-work', feedback: h.feedback || '' })
      } else {
        // No verdict set — bulk approve
      }
    }
  }

  try {
    const res = await fetch('/__eros/training/review-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: activeProject.value, feedback }),
    })
    resultMsg.value = await res.json()
    await loadImpact()
  } catch (e) {
    resultMsg.value = { error: e.message }
  }
  processing.value = false
}

const runStudy = async () => {
  if (!studyUrl.value) return
  processing.value = true
  studyResult.value = null
  try {
    const res = await fetch('/__eros/training/study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: studyUrl.value }),
    })
    studyResult.value = await res.json()
  } catch (e) {
    studyResult.value = { error: e.message }
  }
  processing.value = false
}

const runCorrect = async (slug) => {
  processing.value = true
  resultMsg.value = null
  try {
    const res = await fetch('/__eros/training/correct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    resultMsg.value = await res.json()
  } catch (e) {
    resultMsg.value = { error: e.message }
  }
  processing.value = false
}

const setHighlightVerdict = (idx, verdict) => {
  if (review.value?.highlights?.[idx]) {
    review.value.highlights[idx].verdict = verdict
  }
}

onMounted(() => {
  loadProjects()
  loadImpact()
})
</script>

<template>
  <div class="panel-page">
    <!-- HERO -->
    <div class="cell train-hero">
      <p class="label">Training</p>
      <h1 class="train-title">Ensenar a Eros</h1>
      <p class="body">Corrige, aprueba, estudia. Sin puntajes manuales.</p>
    </div>

    <!-- IMPACT DASHBOARD -->
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
        <p class="body-sm">{{ impact.rules?.promoted || 0 }} promoted</p>
      </div>
    </div>

    <!-- MAIN CONTENT: Projects + Review -->
    <div class="grid-row grid-row--2">
      <!-- Left: project list -->
      <div class="cell">
        <p class="label">Proyectos</p>
        <div class="project-list" v-if="projects.length > 0">
          <button
            v-for="p in projects"
            :key="p.slug"
            class="project-row"
            :class="{ 'project-row--active': activeProject === p.slug }"
            @click="selectProject(p.slug)"
          >
            <span class="project-name">{{ p.projectName || p.slug }}</span>
            <span class="pills">
              <span class="pill">{{ p.sections?.length || '?' }} sec</span>
            </span>
          </button>
        </div>
        <p class="body-sm dim" v-else>Sin proyectos. Completa uno primero.</p>

        <!-- Study a reference -->
        <div class="study-section">
          <p class="label" style="margin-top: 24px">Estudiar referencia</p>
          <div class="study-row">
            <input v-model="studyUrl" placeholder="https://..." class="study-input" />
            <button class="btn-action" @click="runStudy" :disabled="processing || !studyUrl">
              {{ processing ? '...' : 'Analizar' }}
            </button>
          </div>
          <div class="study-result" v-if="studyResult">
            <template v-if="!studyResult.error">
              <p class="body-sm">Tecnicas: {{ studyResult.analysis?.techniques?.join(', ') || '—' }}</p>
              <p class="body-sm">Fonts: {{ studyResult.analysis?.fonts?.join(', ') || '—' }}</p>
            </template>
            <p class="body-sm" style="color:var(--error)" v-else>{{ studyResult.error }}</p>
          </div>
        </div>

        <!-- Result message -->
        <div class="result-block" v-if="resultMsg">
          <p class="label">Resultado</p>
          <template v-if="!resultMsg.error">
            <div class="result-pills">
              <span class="pill pill--strong" v-if="resultMsg.memory">+{{ resultMsg.memory.growth }} data points</span>
              <span class="pill pill--accent" v-if="resultMsg.memoryUpdates">{{ resultMsg.memoryUpdates }} updates</span>
              <span class="pill pill--cool" v-if="resultMsg.rulesAdded">{{ resultMsg.rulesAdded }} rules</span>
            </div>
          </template>
          <p class="body-sm" style="color:var(--error)" v-else>{{ resultMsg.error }}</p>
        </div>
      </div>

      <!-- Right: Smart Review -->
      <div class="cell" v-if="review">
        <div class="review-header">
          <p class="label">Review</p>
          <p class="title-sm">{{ review.project }}</p>
          <div class="review-meta">
            <span class="pill pill--accent">Observer: {{ review.observerScore }}</span>
            <span class="pill">{{ review.totalSections }} secciones</span>
            <span class="pill pill--strong" v-if="review.excellence?.composition === 'STRONG'">5x STRONG</span>
          </div>
        </div>

        <!-- Highlights (need input) -->
        <div v-if="review.highlights?.length > 0" class="highlights">
          <p class="label" style="margin-top:20px">Necesita tu input</p>
          <div v-for="(h, i) in review.highlights" :key="h.name" class="highlight-card">
            <div class="highlight-head">
              <span class="highlight-name">{{ h.name }}</span>
              <span class="body-sm">{{ h.reason }}</span>
            </div>
            <textarea
              v-model="review.highlights[i].feedback"
              placeholder="Feedback (opcional)..."
              rows="1"
              class="fb-textarea"
            />
            <div class="verdict-buttons">
              <button
                :class="['vbtn', { active: h.verdict === 'good' }]"
                @click="setHighlightVerdict(i, 'good')"
              >Bien</button>
              <button
                :class="['vbtn vbtn--mid', { active: h.verdict === 'needs-work' }]"
                @click="setHighlightVerdict(i, 'needs-work')"
              >Mejorar</button>
              <button
                :class="['vbtn vbtn--bad', { active: h.verdict === 'bad' }]"
                @click="setHighlightVerdict(i, 'bad')"
              >Mal</button>
            </div>
          </div>
        </div>

        <!-- Questions from brain -->
        <div v-if="review.questions?.length > 0" class="questions">
          <p class="label" style="margin-top:20px">Eros pregunta</p>
          <p v-for="q in review.questions" :key="q" class="body-sm question">{{ q }}</p>
        </div>

        <!-- Bulk -->
        <div class="bulk-section">
          <p class="body-sm" style="margin-top:20px">
            {{ review.bulkCount }} secciones con score {{ review.bulkAvgScore }}+ — se aprueban automaticamente.
          </p>
        </div>

        <!-- Actions -->
        <div class="fb-actions">
          <button class="btn-action" @click="submitFeedback('submit')" :disabled="processing">
            {{ processing ? 'Procesando...' : 'Enviar feedback' }}
          </button>
          <button class="btn-action btn-action--primary" @click="submitFeedback('approve-all')" :disabled="processing">
            Todo bien
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div class="cell" v-else>
        <p class="label">Review</p>
        <p class="body-sm dim" style="margin-top:24px">Selecciona un proyecto.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.train-hero { display: grid; gap: 12px; }
.train-title {
  font: 700 clamp(40px, 6vw, 64px)/0.9 var(--font-display);
  color: var(--text);
  letter-spacing: -0.04em;
}

.grid-row--impact { grid-template-columns: repeat(4, 1fr); }

.metric-cell { display: grid; gap: 6px; align-content: end; min-height: 100px; }

/* ── Project list ── */
.project-list { display: grid; gap: 0; margin-top: 12px; }

.project-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line);
  background: transparent; border-left: 0; border-right: 0; border-top: 0;
  cursor: pointer; text-align: left; width: 100%;
  transition: background 0.15s;
}
.project-row:last-child { border-bottom: 0; }
.project-row:hover { background: var(--surface); margin: 0 -32px; padding: 12px 32px; }
.project-row--active { background: var(--surface); margin: 0 -32px; padding: 12px 32px; }
.project-row--active .project-name { color: var(--accent); }
.project-name { font: 500 13px var(--font-body); color: var(--text); }
.dim { color: var(--text-dim); font-style: italic; }

/* ── Study ── */
.study-row { display: flex; gap: 1px; margin-top: 8px; background: var(--line); }
.study-input {
  flex: 1; padding: 10px 12px; border: 0; background: var(--surface);
  color: var(--text); font: 400 12px var(--font-body);
}
.study-input:focus { outline: none; }
.study-input::placeholder { color: var(--text-dim); }
.study-result { margin-top: 8px; }

/* ── Result ── */
.result-block { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line); }
.result-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }

/* ── Review ── */
.review-header { margin-bottom: 16px; }
.review-meta { display: flex; gap: 6px; margin-top: 8px; }

/* ── Highlights ── */
.highlight-card {
  padding: 16px 0; border-bottom: 1px solid var(--line);
}
.highlight-head {
  display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px;
}
.highlight-name { font: 600 13px var(--font-body); color: var(--text); }

.verdict-buttons { display: flex; gap: 1px; margin-top: 8px; background: var(--line); }
.vbtn {
  flex: 1; padding: 8px 0; border: 0; background: var(--surface);
  color: var(--text-muted); font: 600 10px var(--font-mono);
  letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; transition: all 0.15s;
}
.vbtn:hover { background: var(--surface-hot); color: var(--text); }
.vbtn.active { background: var(--success-soft); color: var(--success); }
.vbtn--mid.active { background: var(--warn-soft); color: var(--warn); }
.vbtn--bad.active { background: var(--error-soft); color: var(--error); }

.fb-textarea {
  width: 100%; background: var(--surface); border: 1px solid var(--line);
  border-radius: 0; padding: 8px 12px; color: var(--text-muted);
  font: 400 12px/1.5 var(--font-body); resize: vertical;
  transition: border-color 0.15s;
}
.fb-textarea:focus { border-color: var(--accent); color: var(--text); outline: none; }
.fb-textarea::placeholder { color: var(--text-dim); }

.questions { margin-top: 12px; }
.question { padding: 8px 0; border-bottom: 1px solid var(--line); color: var(--accent-hot); }

/* ── Actions ── */
.fb-actions { display: flex; gap: 1px; margin-top: 20px; background: var(--line); }
.btn-action {
  flex: 1; padding: 14px 20px; font: 600 11px var(--font-mono);
  letter-spacing: 0.08em; text-transform: uppercase;
  cursor: pointer; border: 0; background: var(--surface);
  color: var(--text-muted); transition: all 0.15s;
}
.btn-action:hover { background: var(--surface-hot); color: var(--text); }
.btn-action:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-action--primary { background: var(--accent); color: var(--bg); }
.btn-action--primary:hover { background: var(--accent-hot); }

/* ── Responsive ── */
@media (max-width: 1200px) { .grid-row--impact { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 980px) {
  .metric-cell { min-height: 80px; }
  .project-row:hover, .project-row--active { margin: 0 -16px; padding: 12px 16px; }
}
</style>
