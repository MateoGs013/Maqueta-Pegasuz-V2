import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'));

// --- Helpers ---

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function weightedAvg(items) {
  let sum = 0;
  let totalWeight = 0;
  for (const { value, weight } of items) {
    if (value == null) continue;
    sum += value * weight;
    totalWeight += weight;
  }
  return totalWeight === 0 ? null : sum / totalWeight;
}

function toSignal(score) {
  if (score == null) return 'WEAK';
  if (score > 7.0) return 'STRONG';
  if (score >= 4.5) return 'MEDIUM';
  return 'WEAK';
}

function safe(obj, ...keys) {
  return keys.reduce((acc, k) => (acc != null && typeof acc === 'object' ? acc[k] : undefined), obj);
}

// --- Dimension scorers ---

function scoreComposition(structural, perceptual, intelligence, judgment) {
  // Color harmony: boost monochromatic/analogous intentional palettes
  let harmonyScore = safe(perceptual, 'colorHarmony', 'score');
  const harmonyTemplate = safe(perceptual, 'colorHarmony', 'template');
  if (harmonyScore != null && (harmonyTemplate === 'i' || harmonyTemplate === 'V')) {
    harmonyScore = clamp(harmonyScore + 2, 0, 10); // intentional restraint = bonus
  }

  const items = [
    { value: safe(structural, 'aria', 'score'), weight: 0.6 },
    { value: safe(structural, 'score'), weight: 0.8 },
    { value: harmonyScore, weight: 0.8 },
    { value: safe(intelligence, 'uniqueness', 'score'), weight: 0.6 },
    { value: safe(judgment, 'composition', 'score'), weight: 1.2 },
  ];
  const raw = weightedAvg(items);
  return raw != null ? clamp(raw, 0, 10) : null;
}

function scoreDepth(structural, perceptual, judgment) {
  // Build a heuristic from structural layer signals
  let layerScore = null;
  const zCount = safe(structural, 'layers', 'zIndexCount');
  const hasClip = safe(structural, 'layers', 'clipPath');
  const hasBackdrop = safe(structural, 'layers', 'backdropFilter');
  const shadowCount = safe(structural, 'layers', 'shadows');

  if (zCount != null) {
    // 3+ distinct z-index values = good (scale 0-10)
    let score = clamp((zCount / 6) * 10, 0, 10);
    if (hasClip) score = clamp(score + 1, 0, 10);
    if (hasBackdrop) score = clamp(score + 1, 0, 10);
    if (shadowCount != null) score = clamp(score + Math.min(shadowCount / 3, 1), 0, 10);
    layerScore = score;
  }

  // Normalize gpu layers: 3-15 = good range (maps to ~5-10)
  let gpuScore = null;
  const gpuCount = safe(perceptual, 'gpuLayers', 'count');
  if (gpuCount != null) {
    gpuScore = clamp(((gpuCount - 3) / 12) * 10, 0, 10);
  }

  const items = [
    { value: layerScore, weight: 1.2 },
    { value: gpuScore, weight: 0.6 },
    { value: safe(judgment, 'depth', 'score'), weight: 1.2 },
  ];
  const raw = weightedAvg(items);
  return raw != null ? clamp(raw, 0, 10) : null;
}

function scoreTypography(structural, perceptual, judgment) {
  // CSS quality metrics serve as proxy for typography discipline
  const maintainability = safe(structural, 'cssQuality', 'maintainability');
  const complexity = safe(structural, 'cssQuality', 'complexity');

  // CSS quality → typography proxy: high maintainability + low complexity = disciplined type system
  let cssTypScore = null;
  if (maintainability != null && complexity != null) {
    cssTypScore = clamp((maintainability + complexity) / 2, 0, 10);
  } else if (maintainability != null) {
    cssTypScore = clamp(maintainability, 0, 10);
  }

  const items = [
    { value: cssTypScore, weight: 1.0 },
    { value: safe(structural, 'aria', 'score'), weight: 0.5 },
    { value: safe(judgment, 'typography', 'score'), weight: 1.2 },
  ];
  const raw = weightedAvg(items);
  return raw != null ? clamp(raw, 0, 10) : null;
}

function scoreMotion(perceptual, judgment) {
  const easingQ = safe(perceptual, 'animations', 'easingQuality');
  const stagger = safe(perceptual, 'animations', 'staggerDetected');
  const jankRaw = safe(perceptual, 'jank', 'score');
  // jank is inverted: lower jank = higher score
  const jankScore = jankRaw != null ? clamp(10 - jankRaw, 0, 10) : null;

  let easingBonus = easingQ != null ? clamp(easingQ, 0, 10) : null;
  if (easingBonus != null && stagger === true) {
    easingBonus = clamp(easingBonus + 1, 0, 10);
  }

  const items = [
    { value: easingBonus, weight: 1.2 },
    { value: jankScore, weight: 0.8 },
    { value: safe(judgment, 'motion', 'score'), weight: 1.2 },
  ];
  const raw = weightedAvg(items);
  return raw != null ? clamp(raw, 0, 10) : null;
}

function scoreCraft(structural, perceptual, judgment) {
  // Hover effects: coverage (0-1) → 0-10
  const hoverCoverage = safe(perceptual, 'hoverEffects', 'coverage');
  const hoverScore = hoverCoverage != null ? clamp(hoverCoverage * 10, 0, 10) : null;

  const colorHarmony = safe(perceptual, 'colorHarmony', 'score');
  const semanticScore = safe(structural, 'aria', 'score');

  // CSS unused penalty from coverage data
  const cssUnusedPct = safe(structural, 'cssCoverage', 'unusedPercent');
  let unusedPenalty = null;
  if (cssUnusedPct != null) {
    // 0% unused = 10, 100% unused = 0
    unusedPenalty = clamp(10 - (cssUnusedPct / 10), 0, 10);
  }

  // CSS quality performance score
  const cssPerfScore = safe(structural, 'cssQuality', 'performance');

  const items = [
    { value: hoverScore, weight: 0.8 },
    { value: colorHarmony, weight: 0.7 },
    { value: semanticScore, weight: 0.7 },
    { value: unusedPenalty, weight: 0.4 },
    { value: cssPerfScore, weight: 0.5 },
    { value: safe(judgment, 'uniqueness', 'score'), weight: 1.2 },
  ];
  const raw = weightedAvg(items);
  return raw != null ? clamp(raw, 0, 10) : null;
}

// --- Public API ---

export function computeFinalScores(passResults, cfg = config) {
  const { structural = null, perceptual = null, intelligence = null, judgment = null } = passResults ?? {};
  const weights = cfg.scoring.dimensionWeights;

  const dimensions = {
    composition: scoreComposition(structural, perceptual, intelligence, judgment),
    depth:       scoreDepth(structural, perceptual, judgment),
    typography:  scoreTypography(structural, perceptual, judgment),
    motion:      scoreMotion(perceptual, judgment),
    craft:       scoreCraft(structural, perceptual, judgment),
  };

  const signals = Object.fromEntries(
    Object.entries(dimensions).map(([k, v]) => [k, toSignal(v)])
  );

  const overallItems = Object.entries(dimensions).map(([k, v]) => ({
    value: v,
    weight: weights[k] ?? 1,
  }));
  const overall = weightedAvg(overallItems);

  return {
    dimensions,
    signals,
    overall: overall != null ? clamp(overall, 0, 10) : null,
    overallSignal: toSignal(overall),
  };
}

export function computePerformanceGrade(perceptual, cfg = config) {
  const { lcpTarget, clsTarget, tbtTarget } = cfg.performance;

  function grade(value, target) {
    if (value == null) return null;
    if (value <= target) return 'good';
    if (value <= target * 1.6) return 'needs-improvement';
    return 'poor';
  }

  const lcp = safe(perceptual, 'vitals', 'lcp');
  const cls = safe(perceptual, 'vitals', 'cls');
  const tbt = safe(perceptual, 'vitals', 'tbt');

  return {
    lcpGrade: grade(lcp, lcpTarget),
    clsGrade: grade(cls, clsTarget),
    tbtGrade: grade(tbt, tbtTarget),
  };
}
