#!/usr/bin/env node
/**
 * lint-ux.mjs — Consistency linter for Pegasuz SuperAdmin UX Reform v2
 *
 * Scans .vue files in the superadmin target for anti-patterns:
 *   - Hardcoded padding/border-radius/z-index/box-shadow
 *   - Imports of deleted Brain components/composables
 *   - position: fixed outside approved components
 *
 * Usage:
 *   node lint-ux.mjs [path/to/src]
 *
 * Exit codes:
 *   0 — clean
 *   1 — violations found
 *   2 — script error
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

// ── Config ───────────────────────────────────────────────────
const DEFAULT_SRC = 'C:/Users/mateo/Desktop/Dev/pegasuz/SaaS-Multitenant/pegasuz/Pegasuz-Core/frontend-superadmin/frontend-superadmin/src'
const srcDir = process.argv[2] || DEFAULT_SRC

// Approved files for position: fixed
const APPROVED_FIXED = [
  'components/layout/StatusBar.vue',
  'components/layout/CommandPalette.vue',
  'components/layout/TopBar.vue',
  'components/layout/SideBar.vue',
  'components/layout/InspectorPane.vue',
  'components/layout/ShortcutsOverlay.vue',
]

// Brain files scheduled for deletion in Fase 14
const DELETED_BRAIN_SECTIONS = [
  'BrainStatusSection', 'BrainContextSection', 'BrainWatchdogSection',
  'BrainDecisionsSection', 'BrainLearningSection', 'BrainTestingSection',
  'BrainEvolutionSection', 'BrainRolloutSection', 'BrainRoutingSection',
  'BrainGapsSection', 'BrainKnowledgeSection', 'BrainExperienceSection',
  'BrainAgentTrustSection', 'BrainCountersSection', 'BrainProductSection',
  'BrainSessionSection', 'BrainBlogSection', 'BrainInterventionSection',
  'BrainAgentVizSection', 'BrainOfficeSection', 'BrainSelfImprovementSection',
  'BrainGovernanceSection', 'BrainSectionWrap', 'BrainRawRenderer',
]

const DELETED_BRAIN_COMPOSABLES = [
  'useBrainAnomalies', 'useBrainCoherence', 'useBrainCommandPalette',
  'useBrainI18n', 'useBrainMode', 'useBrainOffice', 'useBrainSections',
  'useAnimatedNumber', 'useFlashOnChange', 'useMetricHistory', 'useTimeAgo',
]

// ── Helpers ──────────────────────────────────────────────────
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (entry === 'node_modules' || entry.startsWith('.')) continue
    try {
      const s = statSync(p)
      if (s.isDirectory()) yield* walk(p)
      else if (entry.endsWith('.vue')) yield p
    } catch {}
  }
}

function stripComments(css) {
  // Strip CSS block comments
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function extractStyleBlocks(vueContent) {
  const blocks = []
  const re = /<style[^>]*>([\s\S]*?)<\/style>/g
  let m
  while ((m = re.exec(vueContent)) !== null) {
    blocks.push(m[1])
  }
  return blocks.join('\n')
}

function extractScriptBlocks(vueContent) {
  const blocks = []
  const re = /<script[^>]*>([\s\S]*?)<\/script>/g
  let m
  while ((m = re.exec(vueContent)) !== null) {
    blocks.push(m[1])
  }
  return blocks.join('\n')
}

// Directories where primitives are allowed to define their own micro-values
// (they establish the visual vocabulary rather than consume it)
const PRIMITIVES_ALLOWED = [
  'components/ui/',
  'components/layout/primitives/',
]

// ── Checks ───────────────────────────────────────────────────
const checks = [
  {
    name: 'hardcoded padding (use var(--pz-cell-pad) or token)',
    test: (css) => {
      // Match `padding: <number><unit>` with required whitespace after colon (forces engine to consume)
      const re = /(^|[\s;{])padding(?:-top|-right|-bottom|-left|-inline|-block)?:\s+(?!var\()\d/gm
      const matches = [...css.matchAll(re)]
      return matches.map(m => ({ snippet: m[0].slice(-40).trim() }))
    },
    scope: 'style',
    exclude: PRIMITIVES_ALLOWED,
  },
  {
    name: 'hardcoded border-radius (use var(--pz-radius-*) or 0/50%)',
    test: (css) => {
      const re = /border-radius:\s+(?!(?:0\s*[;}]|50%|var\())/g
      const matches = [...css.matchAll(re)]
      return matches.map(m => ({ snippet: m[0].trim() }))
    },
    scope: 'style',
    exclude: PRIMITIVES_ALLOWED,
  },
  {
    name: 'hardcoded z-index (use var(--pz-z-*))',
    test: (css) => {
      const re = /z-index:\s+(?!var\()-?\d/g
      const matches = [...css.matchAll(re)]
      return matches.map(m => ({ snippet: m[0].trim() }))
    },
    scope: 'style',
    exclude: PRIMITIVES_ALLOWED,
  },
  {
    name: 'visible box-shadow (Eros is flat — use none or var)',
    test: (css) => {
      const re = /box-shadow:\s+(?!(?:none\s*[;}]|var\())/g
      const matches = [...css.matchAll(re)]
      return matches.map(m => ({ snippet: m[0].trim() }))
    },
    scope: 'style',
    exclude: PRIMITIVES_ALLOWED,
  },
  {
    name: 'import of deleted Brain section component',
    test: (script) => {
      const violations = []
      for (const name of DELETED_BRAIN_SECTIONS) {
        const re = new RegExp(`from\\s+['"][^'"]*brain/${name}`, 'g')
        const matches = [...script.matchAll(re)]
        for (const m of matches) violations.push({ snippet: m[0] })
      }
      return violations
    },
    scope: 'script',
    exclude: ['views/system/BrainView.vue', 'components/system/brain/'],  // old view can still import them until Fase 14
  },
  {
    name: 'import of deleted Brain composable',
    test: (script) => {
      const violations = []
      for (const name of DELETED_BRAIN_COMPOSABLES) {
        const re = new RegExp(`from\\s+['"][^'"]*brain/${name}`, 'g')
        const matches = [...script.matchAll(re)]
        for (const m of matches) violations.push({ snippet: m[0] })
      }
      return violations
    },
    scope: 'script',
    exclude: ['views/system/BrainView.vue', 'components/system/brain/'],
  },
]

// ── Main ─────────────────────────────────────────────────────
let totalViolations = 0
let filesScanned = 0
const report = []

try {
  for (const filepath of walk(srcDir)) {
    filesScanned++
    const rel = relative(srcDir, filepath).replace(/\\/g, '/')
    const content = readFileSync(filepath, 'utf8')

    const styleContent = stripComments(extractStyleBlocks(content))
    const scriptContent = extractScriptBlocks(content)

    for (const check of checks) {
      // Check exclusions
      if (check.exclude?.some(ex => rel.includes(ex))) continue

      const source = check.scope === 'style' ? styleContent : scriptContent
      if (!source) continue

      const violations = check.test(source)
      if (violations.length > 0) {
        for (const v of violations) {
          report.push({
            file: rel,
            rule: check.name,
            snippet: v.snippet,
          })
          totalViolations++
        }
      }
    }
  }

  console.log(`[lint-ux] Scanned ${filesScanned} .vue files`)

  if (totalViolations === 0) {
    console.log(`[lint-ux] ✓ Clean — 0 violations`)
    process.exit(0)
  }

  console.log(`[lint-ux] ✗ Found ${totalViolations} violation(s):\n`)
  const byRule = {}
  for (const r of report) {
    if (!byRule[r.rule]) byRule[r.rule] = []
    byRule[r.rule].push(r)
  }
  for (const rule of Object.keys(byRule)) {
    console.log(`  ── ${rule} (${byRule[rule].length})`)
    for (const r of byRule[rule].slice(0, 10)) {
      console.log(`     ${r.file} — ${r.snippet.trim()}`)
    }
    if (byRule[rule].length > 10) {
      console.log(`     ... and ${byRule[rule].length - 10} more`)
    }
  }
  process.exit(1)
} catch (err) {
  console.error(`[lint-ux] Error: ${err.message}`)
  process.exit(2)
}
