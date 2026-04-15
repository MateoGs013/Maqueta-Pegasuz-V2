<script setup>
import { computed } from 'vue'
import MarkdownDocument from '@/components/MarkdownDocument.vue'
import {
  criticNotes,
  debtItems,
  debtSummary,
  erosFeedSnapshot,
  memoryFonts,
  memoryTechniques,
  observerExcellence,
  observerGeometry,
  observerAesthetics,
  observerSemantic,
  observerAntiTemplate,
  observerQualityGates,
  observerSignals,
  observerGates,
  qualityIssues,
  retryInstructions,
  scoreSummary,
  sectionBreakdown,
} from '@/data/erosFeed.js'

const hasV2 = computed(() => observerExcellence.value !== null)

const excellenceDims = computed(() => {
  const e = observerExcellence.value
  if (!e) return []
  return [
    { key: 'composition', label: 'Composicion', ...e.composition },
    { key: 'depth', label: 'Profundidad', ...e.depth },
    { key: 'typography', label: 'Tipografia', ...e.typography },
    { key: 'motion', label: 'Motion', ...e.motion },
    { key: 'craft', label: 'Craft', ...e.craft },
  ]
})

const scoreTone = (v) => v >= 8 ? 'strong' : v >= 5 ? 'medium' : 'weak'
const pct = (v) => Math.round((v || 0) * 100)

const gateList = computed(() => {
  const g = observerQualityGates.value
  if (!g) return []
  return [
    { key: 'contrast', label: 'Contraste', signal: g.contrast?.signal || '—' },
    { key: 'animations', label: 'Animaciones', signal: g.animations?.clean ? 'PASS' : 'FAIL' },
    { key: 'images', label: 'Imagenes', signal: g.images?.signal || '—' },
    { key: 'headings', label: 'Headings', signal: g.headings?.signal || '—' },
    { key: 'meta', label: 'Meta', signal: g.meta?.signal || '—' },
  ]
})

const gateTone = (s) => s === 'PASS' ? 'strong' : s === 'WARN' ? 'medium' : 'weak'

const maxTechScore = computed(() => {
  const scores = memoryTechniques.value.map((t) => t.score)
  return scores.length > 0 ? Math.max(...scores, 10) : 10
})
</script>

<template>
  <div class="panel-page">
    <!-- V2 EXCELLENCE SCORES (continuous 0-10) -->
    <div v-if="hasV2" class="grid-row grid-row--5">
      <div v-for="d in excellenceDims" :key="d.key" class="cell score-cell">
        <p class="label">{{ d.label }}</p>
        <p class="value" :class="`c-${scoreTone(d.score)}`">{{ (d.score ?? 0).toFixed(1) }}</p>
        <span class="pill" :class="`pill--${scoreTone(d.score)}`">{{ d.signal }}</span>
      </div>
    </div>

    <!-- Fallback: V1 scores if no V2 data -->
    <div v-else class="grid-row grid-row--4">
      <div v-for="s in scoreSummary" :key="s.label" class="cell score-cell">
        <p class="label">{{ s.label }}</p>
        <p class="value" :class="{ 'c-strong': s.tone === 'strong', 'c-weak': s.tone === 'weak' }">{{ (s.value ?? 0).toFixed(1) }}</p>
        <p class="body-sm">{{ s.detail }}</p>
      </div>
    </div>

    <!-- V2 LAYERS: Geometry + Aesthetics + Semantic + Anti-Template -->
    <div v-if="hasV2" class="grid-row grid-row--2">
      <!-- Geometry -->
      <div class="cell">
        <p class="label">Geometria visual</p>
        <div class="layer-data" v-if="observerGeometry">
          <div class="layer-row">
            <span class="layer-key">Balance</span>
            <span class="layer-val">{{ observerGeometry.visualBalance?.score?.toFixed(1) }}</span>
            <span class="pill" :class="`pill--${scoreTone(observerGeometry.visualBalance?.score)}`">{{ observerGeometry.visualBalance?.type }}</span>
          </div>
          <div class="layer-row">
            <span class="layer-key">Centro de masa</span>
            <span class="layer-val">X:{{ observerGeometry.visualBalance?.centerOfMass?.x?.toFixed(2) }} Y:{{ observerGeometry.visualBalance?.centerOfMass?.y?.toFixed(2) }}</span>
          </div>
          <div class="layer-row">
            <span class="layer-key">Overlaps intencionales</span>
            <span class="layer-val">{{ observerGeometry.overlap?.intentional || 0 }}</span>
          </div>
          <div class="layer-row">
            <span class="layer-key">Sorpresas visuales</span>
            <span class="layer-val">{{ observerGeometry.surprise?.count || 0 }}</span>
            <span class="body-sm" v-if="observerGeometry.surprise?.types?.length">{{ observerGeometry.surprise.types.join(', ') }}</span>
          </div>
        </div>
        <p v-else class="body-sm dim">Sin datos de geometria</p>
      </div>

      <!-- Aesthetics -->
      <div class="cell">
        <p class="label">Estetica</p>
        <div class="layer-data" v-if="observerAesthetics">
          <div class="layer-row">
            <span class="layer-key">Color</span>
            <span class="layer-val">{{ observerAesthetics.colorHarmony?.score?.toFixed(1) }}</span>
            <span class="pill" :class="`pill--${scoreTone(observerAesthetics.colorHarmony?.score)}`">{{ observerAesthetics.colorHarmony?.type }}</span>
            <span class="pill">{{ observerAesthetics.colorHarmony?.temperature }}</span>
          </div>
          <div class="layer-row" v-if="observerAesthetics.colorHarmony?.aiFingerprint">
            <span class="pill pill--weak">AI fingerprint detectado</span>
          </div>
          <div class="layer-row">
            <span class="layer-key">Whitespace</span>
            <span class="layer-val">{{ pct(observerAesthetics.whitespace?.globalRatio) }}%</span>
            <span class="pill" :class="`pill--${observerAesthetics.whitespace?.verdict === 'balanced' || observerAesthetics.whitespace?.verdict === 'generous' ? 'strong' : 'medium'}`">{{ observerAesthetics.whitespace?.verdict }}</span>
          </div>
          <div class="layer-row">
            <span class="layer-key">Tipografia</span>
            <span class="layer-val">{{ observerAesthetics.typography?.score?.toFixed(1) }}</span>
            <span class="body-sm">ratio {{ observerAesthetics.typography?.sizeRatio?.toFixed(1) }}x · {{ observerAesthetics.typography?.levels }} niveles · {{ observerAesthetics.typography?.weights?.length || 0 }} weights</span>
          </div>
          <div class="layer-row" v-if="observerAesthetics.typography?.modularScale">
            <span class="layer-key">Escala modular</span>
            <span class="layer-val">{{ observerAesthetics.typography.modularScale }}</span>
          </div>
        </div>
        <p v-else class="body-sm dim">Sin datos de estetica</p>
      </div>
    </div>

    <div v-if="hasV2" class="grid-row grid-row--2">
      <!-- Semantic -->
      <div class="cell">
        <p class="label">Semantica</p>
        <div class="layer-data" v-if="observerSemantic">
          <div class="layer-row">
            <span class="layer-key">Score</span>
            <span class="layer-val">{{ observerSemantic.score?.toFixed(1) }}</span>
            <span class="pill" :class="`pill--${scoreTone(observerSemantic.score)}`">{{ observerSemantic.headingHierarchy }}</span>
          </div>
          <div class="layer-row">
            <span class="layer-key">Landmarks</span>
            <span class="body-sm">{{ (observerSemantic.landmarks || []).join(', ') || 'ninguno' }}</span>
          </div>
          <div class="layer-row">
            <span class="layer-key">Interactive accesibles</span>
            <span class="layer-val">{{ observerSemantic.interactiveNamed }}%</span>
          </div>
          <div v-if="observerSemantic.issues?.length" class="layer-issues">
            <div v-for="iss in observerSemantic.issues" :key="iss" class="body-sm" style="color:var(--error)">{{ iss }}</div>
          </div>
        </div>
        <p v-else class="body-sm dim">Sin datos semanticos</p>
      </div>

      <!-- Anti-Template -->
      <div class="cell">
        <p class="label">Anti-template</p>
        <div class="layer-data" v-if="observerAntiTemplate">
          <div class="layer-row">
            <span class="layer-key">Score</span>
            <span class="layer-val">{{ observerAntiTemplate.score?.toFixed(1) }}</span>
            <span class="pill" :class="observerAntiTemplate.isTemplate ? 'pill--weak' : 'pill--strong'">
              {{ observerAntiTemplate.isTemplate ? 'template' : 'unico' }}
            </span>
          </div>
          <div class="layer-row">
            <span class="layer-key">Variedad de layout</span>
            <span class="layer-val">{{ pct(observerAntiTemplate.layoutVariety) }}%</span>
          </div>
          <div v-if="observerAntiTemplate.findings?.length" class="layer-issues">
            <span v-for="f in observerAntiTemplate.findings" :key="f" class="pill pill--medium" style="margin:2px">{{ f }}</span>
          </div>
          <div v-if="observerAntiTemplate.signatures?.length" class="layer-sigs">
            <p class="body-sm" style="margin-top:8px;color:var(--text-muted)">Signatures:</p>
            <span v-for="s in observerAntiTemplate.signatures.slice(0, 5)" :key="s" class="body-sm" style="display:block">{{ s }}</span>
          </div>
        </div>
        <p v-else class="body-sm dim">Sin datos anti-template</p>
      </div>
    </div>

    <!-- QUALITY GATES -->
    <div v-if="hasV2 && gateList.length" class="cell">
      <p class="label">Quality Gates</p>
      <div class="pills" style="margin-top:8px">
        <span v-for="g in gateList" :key="g.key" class="pill" :class="`pill--${gateTone(g.signal)}`">
          {{ g.label }}: {{ g.signal }}
        </span>
      </div>
    </div>

    <!-- V1 SIGNALS + GATES (fallback) -->
    <div v-if="!hasV2" class="grid-row grid-row--2">
      <div class="cell">
        <p class="label">Señales</p>
        <div class="pills">
          <span v-for="s in observerSignals" :key="s.id" class="pill" :class="`pill--${s.tone}`">{{ s.label }}: {{ s.value }}</span>
        </div>
        <p class="label" style="margin-top:24px">Gates</p>
        <div class="pills">
          <span v-for="g in observerGates" :key="g.id" class="pill" :class="`pill--${g.tone}`">{{ g.label }}: {{ g.value }}</span>
        </div>
      </div>
      <div class="cell">
        <p class="label">Notas del critico</p>
        <ul class="ul">
          <li v-for="note in criticNotes" :key="note">{{ note }}</li>
          <li v-if="!criticNotes.length" class="dim">Sin notas</li>
        </ul>
      </div>
    </div>

    <!-- RETRY INSTRUCTIONS -->
    <div v-if="retryInstructions.length" class="cell">
      <p class="label">Instrucciones de reintento</p>
      <ol class="ol">
        <li v-for="(inst, i) in retryInstructions" :key="i">{{ inst }}</li>
      </ol>
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

    <!-- MEMORY: techniques + fonts -->
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
    <div v-if="erosFeedSnapshot.reviewMarkdown" class="cell">
      <MarkdownDocument eyebrow="Review" title="Resumen de revision" :content="erosFeedSnapshot.reviewMarkdown" />
    </div>
  </div>
</template>

<style scoped>
.grid-row--5 { grid-template-columns: repeat(5, 1fr); }

.score-cell { display: grid; gap: 6px; align-content: end; min-height: 140px; }
.c-strong { color: var(--success); }
.c-medium { color: var(--accent); }
.c-weak { color: var(--error); }

/* ── Layer data ── */
.layer-data { display: grid; gap: 0; margin-top: 8px; }
.layer-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid var(--line);
}
.layer-row:last-child { border-bottom: 0; }
.layer-key { font: 500 11px var(--font-body); color: var(--text-muted); min-width: 120px; flex-shrink: 0; }
.layer-val { font: 700 14px var(--font-mono); color: var(--text); min-width: 40px; }
.layer-issues { padding: 8px 0; }
.layer-sigs { padding: 4px 0; }

.dim { color: var(--text-dim); font-style: italic; }

.ol { list-style: decimal; padding-left: 16px; display: grid; gap: 6px; }
.ol li { font: 400 13px/1.6 var(--font-body); color: var(--text-muted); }

.ul { list-style: none; display: grid; gap: 0; }
.ul li { font: 400 13px/1.6 var(--font-body); color: var(--text-muted); padding: 10px 0; border-bottom: 1px solid var(--line); }
.ul li:last-child { border-bottom: 0; }

.issue-stack { display: grid; gap: 0; }
.issue { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.issue:last-child { border-bottom: 0; }

.section-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1px; background: var(--line); }
.sec-card { background: var(--bg); padding: 16px; display: grid; gap: 8px; }
.sec-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.sec-name { font: 600 13px var(--font-display); color: var(--text); letter-spacing: -0.01em; }
.sec-issues { list-style: none; display: grid; gap: 4px; }

.tech-bars { display: grid; gap: 6px; margin-top: 8px; }
.tech-row { display: grid; grid-template-columns: 140px 1fr 36px 28px; align-items: center; gap: 10px; }
.tech-name { font: 500 11px var(--font-body); color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tech-bar-wrap { height: 6px; background: var(--surface); overflow: hidden; }
.tech-bar { height: 100%; background: var(--accent); transition: width 400ms ease; }
.tech-bar--ok { background: var(--success); }
.tech-bar--low { background: var(--error); opacity: 0.7; }
.tech-score { font: 700 12px var(--font-mono); color: var(--text); text-align: right; }
.tech-uses { font: 400 10px var(--font-mono); color: var(--text-dim); }

.font-list { display: grid; gap: 0; margin-top: 8px; }
.font-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--line); }
.font-row:last-child { border-bottom: 0; }
.font-display { font: 600 13px var(--font-display); color: var(--text); min-width: 140px; }

@media (max-width: 1200px) {
  .grid-row--5 { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 980px) {
  .grid-row--5 { grid-template-columns: repeat(2, 1fr); }
  .tech-row { grid-template-columns: 100px 1fr 32px 24px; }
}
</style>
