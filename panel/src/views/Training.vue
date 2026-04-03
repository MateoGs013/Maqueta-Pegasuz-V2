<script setup>
import { ref, onMounted, computed } from 'vue'

const projects = ref([])
const activeProject = ref(null)
const feedback = ref(null)
const memoryStats = ref(null)
const ingesting = ref(false)
const ingestResult = ref(null)
const saved = ref(false)
const newRulesText = ref('')

const loadProjects = async () => {
  try {
    const res = await fetch('/__eros/training/projects')
    projects.value = await res.json()
  } catch { projects.value = [] }
}

const loadMemoryStats = async () => {
  try {
    const res = await fetch('/__eros/memory-stats')
    memoryStats.value = await res.json()
  } catch { memoryStats.value = null }
}

const selectProject = async (slug) => {
  activeProject.value = slug
  saved.value = false
  ingestResult.value = null
  newRulesText.value = ''
  try {
    const res = await fetch(`/__eros/training/feedback?project=${slug}`)
    feedback.value = await res.json()
    if (feedback.value?.newRules?.length) {
      newRulesText.value = feedback.value.newRules.join('\n')
    }
  } catch { feedback.value = null }
}

const saveFeedback = async () => {
  if (!feedback.value) return
  feedback.value.newRules = newRulesText.value.split('\n').filter(Boolean)
  try {
    await fetch('/__eros/training/save-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback.value),
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  } catch { /* ignore */ }
}

const ingestFeedback = async () => {
  if (!activeProject.value) return
  await saveFeedback()
  ingesting.value = true
  ingestResult.value = null
  try {
    const res = await fetch('/__eros/training/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: activeProject.value }),
    })
    ingestResult.value = await res.json()
    await loadMemoryStats()
  } catch (e) {
    ingestResult.value = { error: e.message }
  }
  ingesting.value = false
}

const sessionData = computed(() => {
  if (!activeProject.value) return null
  return projects.value.find(p => p.slug === activeProject.value)
})

const ratedCount = computed(() => {
  if (!feedback.value?.sections) return 0
  return feedback.value.sections.filter(s => s.userRating != null).length
})

const deltaClass = (userRating, brainScore) => {
  if (userRating == null || brainScore == null) return ''
  const d = userRating - brainScore
  if (d > 0.3) return 'delta--pos'
  if (d < -0.3) return 'delta--neg'
  return 'delta--neutral'
}

const formatDelta = (userRating, brainScore) => {
  if (userRating == null || brainScore == null) return ''
  const d = userRating - brainScore
  return `${d > 0 ? '+' : ''}${d.toFixed(1)}`
}

onMounted(() => {
  loadProjects()
  loadMemoryStats()
})
</script>

<template>
  <div class="panel-page">
    <!-- HERO -->
    <div class="cell train-hero">
      <p class="label">Training</p>
      <h1 class="train-title">Ensenar a Eros</h1>
      <p class="body">Califica secciones, dejale feedback, y mira como calibra sus umbrales.</p>
    </div>

    <!-- MEMORY STATS -->
    <div class="grid-row grid-row--stats" v-if="memoryStats">
      <div class="cell metric-cell">
        <p class="label">Data points</p>
        <p class="value-sm">{{ memoryStats.totalDataPoints }}</p>
        <p class="body-sm">acumulados</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Fonts</p>
        <p class="value-sm">{{ memoryStats.fontPairings?.works || 0 }}</p>
        <p class="body-sm">pairings exitosos</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Signatures</p>
        <p class="value-sm">{{ memoryStats.signatures?.approved || 0 }}</p>
        <p class="body-sm">aprobadas</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Patterns</p>
        <p class="value-sm">{{ memoryStats.sectionPatterns || 0 }}</p>
        <p class="body-sm">layout+motion</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Rules</p>
        <p class="value-sm">{{ memoryStats.rules?.promoted || 0 }}</p>
        <p class="body-sm">promovidas</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Bias</p>
        <p class="value-sm" :class="(memoryStats.calibration?.globalBias || 0) > 0.3 ? 'val--pos' : (memoryStats.calibration?.globalBias || 0) < -0.3 ? 'val--neg' : ''">
          {{ (memoryStats.calibration?.globalBias || 0).toFixed(1) }}
        </p>
        <p class="body-sm">calibracion global</p>
      </div>
    </div>

    <!-- PROJECT SELECTOR + FEEDBACK -->
    <div class="grid-row grid-row--2">
      <!-- Left: project list -->
      <div class="cell">
        <p class="label">Proyectos con sesion</p>
        <div class="project-list" v-if="projects.length > 0">
          <button
            v-for="p in projects"
            :key="p.slug"
            class="project-row"
            :class="{ 'project-row--active': activeProject === p.slug }"
            @click="selectProject(p.slug)"
          >
            <span class="project-name">{{ p.projectName }}</span>
            <span class="pills">
              <span class="pill">{{ p.sections?.length || 0 }} secciones</span>
            </span>
          </button>
        </div>
        <p class="body-sm dim" v-else>Sin sesiones de training. Completa un proyecto primero.</p>

        <!-- Ingest result -->
        <div class="ingest-result" v-if="ingestResult">
          <p class="label">Resultado</p>
          <template v-if="!ingestResult.error">
            <div class="ingest-stats">
              <span class="pill pill--strong">{{ ingestResult.processed }} procesados</span>
              <span class="pill pill--accent">{{ ingestResult.memoryUpdates }} memory updates</span>
              <span class="pill pill--cool" v-if="ingestResult.rulesPromoted > 0">{{ ingestResult.rulesPromoted }} reglas promovidas</span>
            </div>
          </template>
          <p class="body-sm" style="color:var(--error)" v-else>{{ ingestResult.error }}</p>
        </div>
      </div>

      <!-- Right: feedback form -->
      <div class="cell" v-if="feedback && sessionData">
        <div class="form-header">
          <p class="label">Feedback</p>
          <p class="title-sm">{{ sessionData.projectName }}</p>
          <p class="body-sm" style="margin-top:4px">{{ ratedCount }}/{{ feedback.sections?.length || 0 }} secciones calificadas</p>
        </div>

        <!-- Overall -->
        <div class="fb-block fb-block--overall">
          <div class="fb-row">
            <span class="fb-label">Overall</span>
            <input type="range" min="1" max="10" step="0.5" v-model.number="feedback.overallRating" class="fb-range" />
            <span class="fb-val">{{ feedback.overallRating ?? '—' }}</span>
          </div>
          <textarea
            v-model="feedback.overallFeedback"
            placeholder="Feedback general..."
            rows="2"
            class="fb-textarea"
          />
        </div>

        <!-- Sections -->
        <div
          v-for="(section, i) in feedback.sections"
          :key="section.name"
          class="fb-block"
        >
          <div class="fb-row">
            <span class="fb-label">{{ section.name }}</span>
            <span class="pill" v-if="section.brainScore">Brain: {{ section.brainScore }}</span>
            <input type="range" min="1" max="10" step="0.5" v-model.number="feedback.sections[i].userRating" class="fb-range" />
            <span class="fb-val" :class="deltaClass(feedback.sections[i].userRating, section.brainScore)">
              {{ feedback.sections[i].userRating ?? '—' }}
              <small v-if="feedback.sections[i].userRating != null && section.brainScore != null">
                {{ formatDelta(feedback.sections[i].userRating, section.brainScore) }}
              </small>
            </span>
          </div>
          <textarea
            v-model="feedback.sections[i].feedback"
            :placeholder="`Feedback para ${section.name}...`"
            rows="1"
            class="fb-textarea"
          />
        </div>

        <!-- New rules -->
        <div class="fb-block">
          <div class="fb-row">
            <span class="fb-label">Nuevas reglas</span>
            <span class="pill">candidatas</span>
          </div>
          <textarea
            v-model="newRulesText"
            placeholder="Una regla por linea..."
            rows="3"
            class="fb-textarea"
          />
        </div>

        <!-- Actions -->
        <div class="fb-actions">
          <button class="btn-action" @click="saveFeedback" :disabled="saved">
            {{ saved ? 'Guardado' : 'Guardar' }}
          </button>
          <button class="btn-action btn-action--primary" @click="ingestFeedback" :disabled="ingesting">
            {{ ingesting ? 'Procesando...' : 'Ingestar a memoria' }}
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div class="cell" v-else>
        <p class="label">Feedback</p>
        <p class="body-sm dim" style="margin-top:24px">Selecciona un proyecto para calificarlo.</p>
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

.grid-row--stats { grid-template-columns: repeat(6, 1fr); }

.metric-cell { display: grid; gap: 6px; align-content: end; min-height: 120px; }

.val--pos { color: var(--success); }
.val--neg { color: var(--error); }

/* ── Project list ── */
.project-list { display: grid; gap: 0; margin-top: 12px; }

.project-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  border-left: 0;
  border-right: 0;
  border-top: 0;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
  width: 100%;
}

.project-row:last-child { border-bottom: 0; }
.project-row:hover { background: var(--surface); margin: 0 -32px; padding: 12px 32px; }
.project-row--active { background: var(--surface); margin: 0 -32px; padding: 12px 32px; }
.project-row--active .project-name { color: var(--accent); }

.project-name {
  font: 500 13px var(--font-body);
  color: var(--text);
}

.dim { color: var(--text-dim); font-style: italic; }

/* ── Ingest result ── */
.ingest-result { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--line); }
.ingest-stats { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }

/* ── Feedback form ── */
.form-header { margin-bottom: 20px; }

.fb-block {
  padding: 16px 0;
  border-bottom: 1px solid var(--line);
}

.fb-block--overall {
  border-bottom-color: var(--line-accent);
}

.fb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.fb-label {
  font: 600 12px var(--font-body);
  color: var(--text);
  min-width: 90px;
  flex-shrink: 0;
}

.fb-range {
  flex: 1;
  height: 2px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--line-strong);
  outline: none;
}

.fb-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid var(--bg);
  box-shadow: 0 0 0 1px var(--accent);
}

.fb-val {
  font: 700 16px var(--font-mono);
  color: var(--text);
  min-width: 56px;
  text-align: right;
  flex-shrink: 0;
}

.fb-val small {
  font: 500 10px var(--font-mono);
  margin-left: 2px;
}

.delta--pos { color: var(--success); }
.delta--neg { color: var(--error); }
.delta--neutral { color: var(--text); }

.fb-textarea {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 0;
  padding: 10px 12px;
  color: var(--text-muted);
  font: 400 12px/1.5 var(--font-body);
  resize: vertical;
  transition: border-color 0.15s;
}

.fb-textarea:focus {
  border-color: var(--accent);
  color: var(--text);
  outline: none;
}

.fb-textarea::placeholder { color: var(--text-dim); }

/* ── Actions ── */
.fb-actions {
  display: flex;
  gap: 1px;
  margin-top: 20px;
  background: var(--line);
}

.btn-action {
  flex: 1;
  padding: 14px 20px;
  font: 600 11px var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  border: 0;
  background: var(--surface);
  color: var(--text-muted);
  transition: all 0.15s;
}

.btn-action:hover { background: var(--surface-hot); color: var(--text); }
.btn-action:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-action--primary {
  background: var(--accent);
  color: var(--bg);
}

.btn-action--primary:hover { background: var(--accent-hot); }

/* ── Responsive ── */
@media (max-width: 1200px) {
  .grid-row--stats { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 980px) {
  .grid-row--stats { grid-template-columns: repeat(2, 1fr); }
  .metric-cell { min-height: 80px; }
  .fb-label { min-width: 70px; }
  .project-row:hover,
  .project-row--active { margin: 0 -16px; padding: 12px 16px; }
}
</style>
