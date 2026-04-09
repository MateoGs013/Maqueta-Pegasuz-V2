<script setup>
import { computed } from 'vue'

/**
 * Observer Radar Chart — pure SVG, no chart library.
 *
 * Displays the 6 Excellence Standard dimensions on a hexagonal radar:
 *   composition · depth · typography · motion · craft · antiTemplate
 *
 * Scores are expected on a 0–10 scale. Missing dimensions render as 0.
 *
 * Props:
 *   dimensions  Object  { composition: 7.8, depth: 8.2, ... }
 *   size        Number  Total SVG size in pixels (default 260)
 *   title       String  Optional heading shown above
 */
const props = defineProps({
  dimensions: { type: Object, default: () => ({}) },
  size: { type: Number, default: 260 },
  title: { type: String, default: '' },
})

const AXES = [
  { key: 'composition', label: 'composition' },
  { key: 'depth', label: 'depth' },
  { key: 'typography', label: 'type' },
  { key: 'motion', label: 'motion' },
  { key: 'craft', label: 'craft' },
  { key: 'antiTemplate', label: 'anti-tpl' },
]

const MAX_SCORE = 10
const PADDING = 36 // leave room for labels

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size / 2) - PADDING)

// Compute (x, y) for a given axis + value (0..MAX_SCORE)
const pointFor = (axisIndex, value) => {
  const ratio = Math.max(0, Math.min(1, value / MAX_SCORE))
  // Start at top (−90°) and rotate clockwise
  const angle = -Math.PI / 2 + (axisIndex * 2 * Math.PI) / AXES.length
  const r = radius.value * ratio
  return {
    x: center.value + r * Math.cos(angle),
    y: center.value + r * Math.sin(angle),
  }
}

const extractScore = (value) => {
  if (value == null) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'object') return value.score ?? value.value ?? 0
  return Number(value) || 0
}

const dataPoints = computed(() =>
  AXES.map((axis, i) => {
    const rawScore = extractScore(props.dimensions[axis.key])
    const p = pointFor(i, rawScore)
    return { ...axis, index: i, score: rawScore, ...p }
  }),
)

const polygonPath = computed(() =>
  dataPoints.value.map((p) => `${p.x},${p.y}`).join(' '),
)

// Grid rings at 2, 4, 6, 8, 10
const gridRings = [2, 4, 6, 8, 10].map((level) => {
  return { level, ratio: level / MAX_SCORE }
})

const gridPolygonFor = (ratio) => {
  return AXES.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length
    const r = radius.value * ratio
    return `${center.value + r * Math.cos(angle)},${center.value + r * Math.sin(angle)}`
  }).join(' ')
}

// Axis lines (from center to outer edge)
const axisLines = computed(() =>
  AXES.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length
    return {
      x1: center.value,
      y1: center.value,
      x2: center.value + radius.value * Math.cos(angle),
      y2: center.value + radius.value * Math.sin(angle),
    }
  }),
)

// Label positions (just outside the outer ring)
const labelPositions = computed(() =>
  AXES.map((axis, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / AXES.length
    const r = radius.value + 16
    const x = center.value + r * Math.cos(angle)
    const y = center.value + r * Math.sin(angle)
    // Text anchor based on angle
    let anchor = 'middle'
    if (Math.cos(angle) > 0.3) anchor = 'start'
    else if (Math.cos(angle) < -0.3) anchor = 'end'
    return { ...axis, x, y, anchor }
  }),
)

const averageScore = computed(() => {
  const scores = AXES.map((a) => extractScore(props.dimensions[a.key]))
  if (!scores.length) return 0
  const sum = scores.reduce((a, b) => a + b, 0)
  return sum / scores.length
})

const toneClass = (score) => {
  if (score >= 8) return 'tone-strong'
  if (score >= 6) return 'tone-medium'
  return 'tone-weak'
}
</script>

<template>
  <figure class="radar">
    <figcaption v-if="title" class="radar-title">{{ title }}</figcaption>

    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="radar-svg">
      <!-- Concentric grid polygons -->
      <g class="radar-grid">
        <polygon
          v-for="ring in gridRings"
          :key="ring.level"
          :points="gridPolygonFor(ring.ratio)"
          class="radar-grid-ring"
          :class="{ 'radar-grid-ring--outer': ring.level === 10 }"
        />
      </g>

      <!-- Axis lines -->
      <g class="radar-axes">
        <line
          v-for="(axis, i) in axisLines"
          :key="i"
          :x1="axis.x1"
          :y1="axis.y1"
          :x2="axis.x2"
          :y2="axis.y2"
          class="radar-axis-line"
        />
      </g>

      <!-- Data polygon -->
      <polygon :points="polygonPath" class="radar-fill" />
      <polygon :points="polygonPath" class="radar-stroke" />

      <!-- Data dots -->
      <g class="radar-dots">
        <circle
          v-for="p in dataPoints"
          :key="p.key"
          :cx="p.x"
          :cy="p.y"
          r="3"
          :class="['radar-dot', toneClass(p.score)]"
        />
      </g>

      <!-- Axis labels -->
      <g class="radar-labels">
        <text
          v-for="p in labelPositions"
          :key="p.key"
          :x="p.x"
          :y="p.y"
          :text-anchor="p.anchor"
          class="radar-label"
        >
          {{ p.label }}
        </text>
      </g>

      <!-- Center average score -->
      <g class="radar-center">
        <text :x="center" :y="center + 4" text-anchor="middle" class="radar-avg">
          {{ averageScore.toFixed(1) }}
        </text>
      </g>
    </svg>

    <!-- Numeric breakdown below the chart -->
    <ul class="radar-legend">
      <li v-for="p in dataPoints" :key="p.key" class="radar-legend-item">
        <span class="radar-legend-label">{{ p.label }}</span>
        <span class="radar-legend-score" :class="toneClass(p.score)">{{ p.score.toFixed(1) }}</span>
      </li>
    </ul>
  </figure>
</template>

<style scoped>
.radar {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
}

.radar-title {
  font: 600 9px var(--font-mono);
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.radar-svg {
  display: block;
}

.radar-grid-ring {
  fill: none;
  stroke: var(--line);
  stroke-width: 1;
  stroke-opacity: 0.3;
}
.radar-grid-ring--outer {
  stroke-opacity: 0.6;
}

.radar-axis-line {
  stroke: var(--line);
  stroke-width: 1;
  stroke-opacity: 0.3;
}

.radar-fill {
  fill: var(--accent, #f59e0b);
  fill-opacity: 0.15;
}
.radar-stroke {
  fill: none;
  stroke: var(--accent, #f59e0b);
  stroke-width: 1.5;
}

.radar-dot { fill: var(--text); }
.radar-dot.tone-strong { fill: #4ade80; }
.radar-dot.tone-medium { fill: var(--accent, #f59e0b); }
.radar-dot.tone-weak { fill: #f87171; }

.radar-label {
  font: 600 9px var(--font-mono);
  fill: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.radar-avg {
  font: 700 22px var(--font-display, sans-serif);
  fill: var(--text);
  letter-spacing: -0.03em;
}

.radar-legend {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px 16px;
  font: 400 10px var(--font-mono);
}
.radar-legend-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
}
.radar-legend-label {
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 9px;
}
.radar-legend-score {
  font-weight: 700;
  font-size: 12px;
  color: var(--text);
}
.radar-legend-score.tone-strong { color: #4ade80; }
.radar-legend-score.tone-medium { color: var(--accent, #f59e0b); }
.radar-legend-score.tone-weak { color: #f87171; }
</style>
