<script setup>
import MarkdownDocument from '@/components/MarkdownDocument.vue'
import {
  criticNotes,
  debtItems,
  debtSummary,
  frontBrainSnapshot,
  memoryFonts,
  memoryTechniques,
  observerGates,
  observerSignals,
  qualityIssues,
  retryInstructions,
  sectionBreakdown,
  scoreSummary,
} from '@/data/frontBrain.js'

const maxTechScore = Math.max(...memoryTechniques.map((t) => t.score), 10)

const sl = { Observer: 'Observer', Critic: 'Critico', 'Memory Alignment': 'Memoria', Final: 'Final' }
const sv = { critical: 'critico', medium: 'medio', low: 'bajo' }
</script>

<template>
  <div class="panel-page">
    <!-- SCORES -->
    <div class="grid-row grid-row--4">
      <div v-for="s in scoreSummary" :key="s.label" class="cell score-cell">
        <p class="label">{{ sl[s.label] || s.label }}</p>
        <p class="value" :class="{ 'c-ok': s.tone === 'strong', 'c-bad': s.tone === 'weak' }">{{ (s.value ?? 0).toFixed(1) }}</p>
        <p class="body-sm">{{ s.detail }}</p>
      </div>
    </div>

    <!-- SIGNALS + GATES | CRITIC -->
    <div class="grid-row grid-row--2">
      <div class="cell">
        <p class="label">Señales</p>
        <div class="pills">
          <span v-for="s in observerSignals" :key="s.id" class="pill" :class="`pill--${s.tone}`">{{ s.label }}: {{ s.value }}</span>
        </div>
        <p class="label" style="margin-top:24px">Gates</p>
        <div class="pills">
          <span v-for="g in observerGates" :key="g.id" class="pill" :class="`pill--${g.tone}`">{{ g.label }}: {{ g.value }}</span>
        </div>
        <template v-if="retryInstructions.length">
          <p class="label" style="margin-top:24px">Reintento</p>
          <ol class="ol">
            <li v-for="(inst, i) in retryInstructions" :key="i">{{ inst }}</li>
          </ol>
        </template>
      </div>
      <div class="cell">
        <p class="label">Notas del critico</p>
        <ul class="ul">
          <li v-for="note in criticNotes" :key="note">{{ note }}</li>
          <li v-if="!criticNotes.length" class="dim">Sin notas</li>
        </ul>
        <template v-if="qualityIssues.length">
          <p class="label" style="margin-top:24px">Problemas</p>
          <div class="issue-stack">
            <div v-for="issue in qualityIssues" :key="issue.label" class="issue">
              <span class="pill" :class="issue.severity === 'high' ? 'pill--weak' : 'pill--medium'">{{ issue.source }}</span>
              <span class="body-sm">{{ issue.message }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- SECTION BREAKDOWN -->
    <div v-if="sectionBreakdown.length" class="cell">
      <p class="label" style="margin-bottom:12px">Desglose por seccion</p>
      <div class="section-grid">
        <div v-for="sec in sectionBreakdown" :key="sec.section" class="sec-card">
          <div class="sec-head">
            <span class="sec-name">{{ sec.section }}</span>
            <span class="pill" :class="sec.worstSeverity === 'critical' ? 'pill--weak' : sec.worstSeverity === 'medium' ? 'pill--medium' : 'pill--strong'">
              {{ sec.issues.length }} {{ sec.issues.length === 1 ? 'problema' : 'problemas' }}
            </span>
          </div>
          <ul class="sec-issues">
            <li v-for="iss in sec.issues" :key="iss.id" class="body-sm">{{ iss.issue }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- DEBT TABLE -->
    <div v-if="debtItems.length" class="cell">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px">
        <p class="label" style="margin-bottom:0">Deuda visual</p>
        <div class="pills">
          <span v-if="debtSummary.critical" class="pill pill--weak">{{ debtSummary.critical }} {{ sv.critical }}</span>
          <span v-if="debtSummary.medium" class="pill pill--medium">{{ debtSummary.medium }} {{ sv.medio }}</span>
          <span v-if="debtSummary.low" class="pill">{{ debtSummary.low }} {{ sv.bajo }}</span>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Seccion</th><th>Severidad</th><th>Mensaje</th></tr></thead>
          <tbody>
            <tr v-for="item in debtItems" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.section }}</td>
              <td>{{ sv[item.severity] || item.severity }}</td>
              <td>{{ item.message }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MEMORY -->
    <div class="grid-row grid-row--2">
      <div class="cell">
        <p class="label">Tecnicas (memoria)</p>
        <div class="tech-bars">
          <div v-for="t in memoryTechniques" :key="t.name" class="tech-row">
            <span class="tech-name">{{ t.name }}</span>
            <div class="tech-bar-wrap">
              <div class="tech-bar" :style="{ width: (t.score / maxTechScore * 100) + '%' }" :class="t.score >= 7.5 ? 'tech-bar--ok' : t.score >= 7 ? '' : 'tech-bar--low'"></div>
            </div>
            <span class="tech-score">{{ t.score }}</span>
            <span class="tech-uses">{{ t.uses }}x</span>
          </div>
        </div>
      </div>
      <div class="cell">
        <p class="label">Fonts (memoria)</p>
        <div class="font-list">
          <div v-for="f in memoryFonts" :key="f.display" class="font-row">
            <span class="font-display">{{ f.display }}</span>
            <span class="body-sm">{{ f.body }}</span>
            <span class="pill" :class="f.status === 'ok' ? 'pill--strong' : 'pill--weak'">{{ f.status === 'ok' ? 'aprobada' : 'rechazada' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- REVIEW -->
    <div v-if="frontBrainSnapshot.reviewMarkdown" class="cell">
      <MarkdownDocument eyebrow="Review" title="Resumen de revision" :content="frontBrainSnapshot.reviewMarkdown" />
    </div>
  </div>
</template>

<style scoped>
.score-cell { display: grid; gap: 6px; align-content: end; min-height: 160px; }
.c-ok { color: var(--success); }
.c-bad { color: var(--error); }

.ol { list-style: decimal; padding-left: 16px; display: grid; gap: 6px; }
.ol li { font: 400 13px/1.6 var(--font-body); color: var(--text-muted); }

.ul { list-style: none; display: grid; gap: 0; }
.ul li { font: 400 13px/1.6 var(--font-body); color: var(--text-muted); padding: 10px 0; border-bottom: 1px solid var(--line); }
.ul li:last-child { border-bottom: 0; }
.dim { color: var(--text-dim); font-style: italic; }

.issue-stack { display: grid; gap: 0; }
.issue { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.issue:last-child { border-bottom: 0; }

/* ── Section breakdown ── */
.section-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1px; background: var(--line); }
.sec-card { background: var(--bg); padding: 16px; display: grid; gap: 8px; }
.sec-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.sec-name { font: 600 13px var(--font-display); color: var(--text); letter-spacing: -0.01em; }
.sec-issues { list-style: none; display: grid; gap: 4px; }

/* ── Memory: techniques ── */
.tech-bars { display: grid; gap: 6px; margin-top: 8px; }
.tech-row { display: grid; grid-template-columns: 140px 1fr 36px 28px; align-items: center; gap: 10px; }
.tech-name { font: 500 11px var(--font-body); color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tech-bar-wrap { height: 6px; background: var(--surface); overflow: hidden; }
.tech-bar { height: 100%; background: var(--accent); transition: width 400ms ease; }
.tech-bar--ok { background: var(--success); }
.tech-bar--low { background: var(--error); opacity: 0.7; }
.tech-score { font: 700 12px var(--font-mono); color: var(--text); text-align: right; }
.tech-uses { font: 400 10px var(--font-mono); color: var(--text-dim); }

/* ── Memory: fonts ── */
.font-list { display: grid; gap: 0; margin-top: 8px; }
.font-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.font-row:last-child { border-bottom: 0; }
.font-display { font: 600 13px var(--font-display); color: var(--text); min-width: 140px; }

.surface-card { background: var(--bg); }

@media (max-width: 1200px) { .grid-row--4 { grid-template-columns: 1fr 1fr; } }
</style>
