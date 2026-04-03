<script setup>
import { ref, onMounted, computed } from 'vue'

const projects = ref([])
const activeProject = ref(null)
const feedback = ref(null)
const memoryStats = ref(null)
const ingesting = ref(false)
const ingestResult = ref(null)
const saved = ref(false)

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
  try {
    const res = await fetch(`/__eros/training/feedback?project=${slug}`)
    feedback.value = await res.json()
  } catch { feedback.value = null }
}

const saveFeedback = async () => {
  if (!feedback.value) return
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

onMounted(() => {
  loadProjects()
  loadMemoryStats()
})
</script>

<template>
  <div class="panel-page training-page">
    <!-- Header -->
    <header class="training-header">
      <h1>Training</h1>
      <p class="body-sm">Teach Eros your quality standard. Rate sections, provide feedback, and watch the brain calibrate.</p>
    </header>

    <!-- Memory Stats Bar -->
    <div class="stats-bar" v-if="memoryStats">
      <div class="stat">
        <span class="stat-value">{{ memoryStats.totalDataPoints }}</span>
        <span class="stat-label">Data Points</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ memoryStats.fontPairings?.works || 0 }}</span>
        <span class="stat-label">Font Pairings</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ memoryStats.signatures?.approved || 0 }}</span>
        <span class="stat-label">Signatures</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ memoryStats.sectionPatterns || 0 }}</span>
        <span class="stat-label">Patterns</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ memoryStats.rules?.promoted || 0 }}</span>
        <span class="stat-label">Rules</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ memoryStats.calibration?.globalBias?.toFixed(1) || '0.0' }}</span>
        <span class="stat-label">Bias</span>
      </div>
    </div>

    <!-- Project Selector -->
    <div class="project-selector">
      <h2>Projects with Training Sessions</h2>
      <div class="project-list" v-if="projects.length > 0">
        <button
          v-for="p in projects"
          :key="p.slug"
          :class="['project-card', { active: activeProject === p.slug }]"
          @click="selectProject(p.slug)"
        >
          <span class="project-name">{{ p.projectName }}</span>
          <span class="project-meta">{{ p.sections?.length || 0 }} sections</span>
        </button>
      </div>
      <p class="body-sm empty" v-else>No training sessions found. Complete a project first.</p>
    </div>

    <!-- Feedback Form -->
    <div class="feedback-form" v-if="feedback && sessionData">
      <h2>Rate Sections — {{ sessionData.projectName }}</h2>

      <!-- Overall -->
      <div class="section-card overall">
        <h3>Overall Rating</h3>
        <div class="rating-row">
          <input
            type="range" min="1" max="10" step="0.5"
            v-model.number="feedback.overallRating"
          />
          <span class="rating-value">{{ feedback.overallRating || '—' }}</span>
        </div>
        <textarea
          v-model="feedback.overallFeedback"
          placeholder="Overall feedback..."
          rows="2"
        />
      </div>

      <!-- Section Cards -->
      <div
        v-for="(section, i) in feedback.sections"
        :key="section.name"
        class="section-card"
      >
        <div class="section-header">
          <h3>{{ section.name }}</h3>
          <span class="brain-score" v-if="section.brainScore">
            Brain: {{ section.brainScore }}
          </span>
        </div>

        <div class="rating-row">
          <label>Your rating:</label>
          <input
            type="range" min="1" max="10" step="0.5"
            v-model.number="feedback.sections[i].userRating"
          />
          <span class="rating-value" :class="{
            positive: feedback.sections[i].userRating > (section.brainScore || 0),
            negative: feedback.sections[i].userRating < (section.brainScore || 0),
          }">
            {{ feedback.sections[i].userRating || '—' }}
            <small v-if="feedback.sections[i].userRating && section.brainScore">
              ({{ feedback.sections[i].userRating > section.brainScore ? '+' : '' }}{{ (feedback.sections[i].userRating - section.brainScore).toFixed(1) }})
            </small>
          </span>
        </div>

        <textarea
          v-model="feedback.sections[i].feedback"
          :placeholder="`Feedback for ${section.name}...`"
          rows="2"
        />
      </div>

      <!-- New Rules -->
      <div class="section-card rules">
        <h3>New Rules</h3>
        <p class="body-sm">Add rules you want Eros to learn. They start as CANDIDATE and get promoted after 3 validations.</p>
        <textarea
          v-model="newRulesText"
          placeholder="One rule per line..."
          rows="3"
          @input="feedback.newRules = $event.target.value.split('\n').filter(Boolean)"
        />
      </div>

      <!-- Actions -->
      <div class="actions">
        <button class="btn-save" @click="saveFeedback" :disabled="saved">
          {{ saved ? 'Saved' : 'Save Feedback' }}
        </button>
        <button class="btn-ingest" @click="ingestFeedback" :disabled="ingesting">
          {{ ingesting ? 'Processing...' : 'Ingest to Memory' }}
        </button>
      </div>

      <!-- Ingest Result -->
      <div class="ingest-result" v-if="ingestResult">
        <template v-if="!ingestResult.error">
          <p>Processed {{ ingestResult.processed }} sections</p>
          <p>{{ ingestResult.memoryUpdates }} memory updates</p>
          <p v-if="ingestResult.rulesPromoted > 0">
            {{ ingestResult.rulesPromoted }} rules promoted
          </p>
        </template>
        <p class="error" v-else>Error: {{ ingestResult.error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default { data: () => ({ newRulesText: '' }) }
</script>

<style scoped>
.training-page {
  max-width: 800px;
  padding: var(--space-lg) var(--space-md);
}

.training-header h1 {
  font-size: var(--fs-xl);
  margin-bottom: var(--space-xs);
}

.stats-bar {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: 8px;
  margin: var(--space-md) 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: var(--fs-lg);
  font-weight: 600;
  color: var(--accent);
}

.stat-label {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.project-selector {
  margin: var(--space-lg) 0;
}

.project-selector h2 {
  font-size: var(--fs-md);
  margin-bottom: var(--space-sm);
}

.project-list {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.project-card {
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.project-card:hover,
.project-card.active {
  border-color: var(--accent);
}

.project-name {
  font-weight: 500;
}

.project-meta {
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.feedback-form {
  margin-top: var(--space-lg);
}

.feedback-form h2 {
  font-size: var(--fs-md);
  margin-bottom: var(--space-md);
}

.section-card {
  padding: var(--space-md);
  background: var(--bg-card);
  border: 1px solid var(--line);
  border-radius: 8px;
  margin-bottom: var(--space-sm);
}

.section-card.overall {
  border-color: var(--accent);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.section-header h3 {
  font-size: var(--fs-sm);
  font-weight: 600;
}

.brain-score {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  background: var(--bg);
  padding: 2px 8px;
  border-radius: 4px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.rating-row label {
  font-size: var(--fs-xs);
  color: var(--text-muted);
  min-width: 80px;
}

.rating-row input[type="range"] {
  flex: 1;
  accent-color: var(--accent);
}

.rating-value {
  font-weight: 600;
  min-width: 60px;
  text-align: right;
}

.rating-value.positive { color: var(--success); }
.rating-value.negative { color: var(--error); }

textarea {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: var(--space-xs);
  color: var(--text);
  font-family: inherit;
  font-size: var(--fs-xs);
  resize: vertical;
}

.actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.btn-save, .btn-ingest {
  padding: var(--space-xs) var(--space-md);
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--line);
  transition: all 0.15s;
}

.btn-save {
  background: var(--bg-card);
  color: var(--text);
}

.btn-save:hover { border-color: var(--accent); }

.btn-ingest {
  background: var(--accent);
  color: var(--bg);
  border-color: var(--accent);
}

.btn-ingest:hover { opacity: 0.9; }
.btn-ingest:disabled, .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

.ingest-result {
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-card);
  border: 1px solid var(--success);
  border-radius: 6px;
  font-size: var(--fs-xs);
}

.ingest-result .error {
  color: var(--error);
}

.empty {
  color: var(--text-muted);
  font-style: italic;
}
</style>
