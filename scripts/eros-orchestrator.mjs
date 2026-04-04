#!/usr/bin/env node

/**
 * eros-orchestrator.mjs — Deterministic task→action mapping engine for Eros V8.
 *
 * Encodes ALL orchestration logic that was previously in SKILL.md (511 lines).
 * Given a task ID and state, returns the exact action JSON that Claude must execute.
 *
 * Exports:
 *   resolveAction(taskId, stateJson, queueJson, projectDir) → action JSON
 *   resolveMemoryHooks(taskId, resultData, stateJson) → learn event list
 *   verifyOutputs(projectDir, expectedOutputs) → { passed, details[] }
 *   resolveRecovery(taskId, failureData, attempt) → enhanced action JSON
 */

import path from 'node:path'
import { promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MAQUETA_DIR = path.resolve(__dirname, '..')
const SCRIPTS = __dirname

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sectionName = (taskId) => {
  const m = taskId.match(/\/S-(.+)$/)
  return m ? `S-${m[1]}` : null
}

const sectionType = (taskId) => {
  const m = taskId.match(/\/S-(.+)$/)
  if (!m) return null
  return m[1].replace(/([A-Z])/g, (_, c, i) => (i ? '-' : '') + c.toLowerCase())
}

const projectSlug = (stateJson) =>
  stateJson?.project?.slug ?? 'unknown'

const projectMood = (stateJson) =>
  stateJson?.mood ?? stateJson?.project?.mood ?? ''

const activePage = (stateJson) =>
  stateJson?.activePage ?? 'home'

const p = (...parts) => path.join(...parts)

// ---------------------------------------------------------------------------
// ACTION_MAP — every task ID pattern → action definition
// ---------------------------------------------------------------------------

/**
 * Each entry: { test: RegExp, resolve: (taskId, state, queue, project) → actionJson }
 *
 * Action types:
 *   run-script  — execute a shell command
 *   spawn-agent — delegate to a specialized agent
 *   write-code  — CEO writes code directly
 *   ask-user    — present a question and wait
 *   verify      — check that expected outputs exist
 *   auto-approve — internal: skip gate, just advance
 */

const ACTION_MAP = [
  // =========================================================================
  // Phase 0: Discovery
  // =========================================================================
  {
    test: /^setup\/identity$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'ask-user',
      question: 'Describe the project: name, type (portfolio, agency, saas, ecommerce, landing), audience, pages, mood/aesthetic, color scheme, reference URLs (if any), and whether you want autonomous or interactive mode.',
      expectedOutputs: [p(project, '.brain', 'identity.md'), p(project, '.brain', 'context', 'intake.json')],
      onFailure: 'retry',
      plan: 'Phase 0: Discovery. Collecting project identity before any design work.',
    }),
  },
  {
    test: /^setup\/create-dir$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'run-script',
      command: `cd "${SCRIPTS}" && node init-project.mjs --brief-file "${p(project, '.brain', 'context', 'intake.json')}" --project "${project}"`,
      expectedOutputs: [
        p(project, 'DESIGN.md'),
        p(project, '.brain', 'state.json'),
        p(project, '.brain', 'queue.json'),
      ],
      onFailure: 'retry',
      plan: 'Phase 0: Discovery. Initializing project directory and brain structure.',
    }),
  },
  {
    test: /^setup\/capture-refs$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'run-script',
      command: `cd "${SCRIPTS}" && npm install --silent 2>/dev/null && node capture-refs.mjs --batch "{urls}" --out "${p(project, '_ref-captures')}"`,
      expectedOutputs: [p(project, '_ref-captures')],
      onFailure: 'flag',
      note: 'Replace {urls} with comma-separated URLs from identity.md. If no URLs, skip this task.',
      plan: 'Phase 0: Discovery. Capturing reference screenshots for analysis.',
    }),
  },
  {
    test: /^setup\/analyze-refs$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'spawn-agent',
      agent: 'reference-analyst',
      prompt: `Read ${p(project, '_ref-captures')}/ manifests and screenshots. Produce ${p(project, 'docs', 'reference-analysis.md')}.`,
      expectedOutputs: [p(project, 'docs', 'reference-analysis.md')],
      onFailure: 'flag',
      plan: 'Phase 0: Discovery. Analyzing reference sites for design patterns.',
    }),
  },
  {
    test: /^setup\/observatory$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'write-code',
      instruction: `Read ${p(project, '_ref-captures')}/**/analysis.md files. Extract into ${p(project, '.brain', 'context', 'reference-observatory.md')}: Content Strategy Pattern (section type sequence), Color Rhythm, Excellence Baseline (per dimension), Quality Baseline (per gate), Key Techniques to Borrow (top 3), Patterns to Avoid (top 2).`,
      expectedOutputs: [p(project, '.brain', 'context', 'reference-observatory.md')],
      onFailure: 'retry',
      plan: 'Phase 0: Discovery. Building reference observatory from captured analyses.',
    }),
  },

  // =========================================================================
  // Phase 1: Creative Direction
  // =========================================================================
  {
    test: /^design\/brief$/,
    resolve: (taskId, state, queue, project) => {
      const mood = projectMood(state)
      const moodArg = mood ? ` --mood "${mood}"` : ''
      return {
        action: 'run-script',
        command: `node "${p(SCRIPTS, 'eros-context.mjs')}" design-brief --project "${project}"${moodArg}`,
        expectedOutputs: [p(project, '.brain', 'context', 'design-brief.md')],
        onFailure: 'retry',
        plan: 'Phase 1: Creative Direction. Assembling design brief with memory insights.',
      }
    },
  },
  {
    test: /^design\/tokens$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'spawn-agent',
      agent: 'designer',
      prompt: `Read ${p(project, '.brain', 'context', 'design-brief.md')}. Produce DESIGN.md + docs/tokens.md following the 12-point designer gate.`,
      expectedOutputs: [p(project, 'DESIGN.md'), p(project, 'docs', 'tokens.md')],
      onFailure: 'retry',
      timeout: 300000,
      plan: 'Phase 1: Creative Direction. Designer creating visual identity + token system.',
    }),
  },
  {
    test: /^design\/pages$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'spawn-agent',
      agent: 'designer',
      prompt: `Read ${p(project, '.brain', 'context', 'design-brief.md')} + ${p(project, 'DESIGN.md')} + ${p(project, 'docs', 'tokens.md')}. Produce docs/pages/*.md with full section recipes for every page.`,
      expectedOutputs: [p(project, 'docs', 'pages')],
      onFailure: 'retry',
      timeout: 300000,
      plan: 'Phase 1: Creative Direction. Designer creating page blueprints with section recipes.',
    }),
  },
  {
    test: /^review\/creative$/,
    resolve: (taskId, state, queue, project) => {
      const mode = state.mode || 'autonomous'
      if (mode === 'interactive' || mode === 'supervised') {
        return {
          action: 'ask-user',
          question: 'Review the creative direction: palette, typography, and section plan. Approve or request changes.',
          expectedOutputs: [],
          onFailure: 'retry',
          plan: 'Phase 1: Creative Direction. Awaiting user approval of design system.',
        }
      }
      return {
        action: 'auto-approve',
        note: 'Autonomous mode: auto-approve creative direction and fire memory hooks.',
        expectedOutputs: [],
        onFailure: 'flag',
        plan: 'Phase 1: Creative Direction. Auto-approving design system in autonomous mode.',
      }
    },
  },

  // =========================================================================
  // Phase 2: Scaffold
  // =========================================================================
  {
    test: /^setup\/scaffold$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'run-script',
      command: `node "${p(SCRIPTS, 'generate-tokens.js')}" "${project}"`,
      expectedOutputs: [p(project, 'src', 'main.js')],
      onFailure: 'retry',
      plan: 'Phase 2: Scaffold. Generating token CSS from design system.',
    }),
  },
  {
    test: /^setup\/gen-tokens$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'run-script',
      command: `node "${p(SCRIPTS, 'generate-tokens.js')}" "${project}"`,
      expectedOutputs: [p(project, 'src', 'styles', 'tokens.css')],
      onFailure: 'retry',
      plan: 'Phase 2: Scaffold. Generating CSS custom properties from tokens.md.',
    }),
  },
  {
    test: /^build\/atmosphere$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'spawn-agent',
      agent: 'builder',
      prompt: `Read ${p(project, '.brain', 'context', 'atmosphere.md')}. Write AtmosphereCanvas.vue + report.`,
      expectedOutputs: [
        p(project, 'src', 'components', 'AtmosphereCanvas.vue'),
        p(project, '.brain', 'reports', 'atmosphere.md'),
      ],
      preCommand: `node "${p(SCRIPTS, 'eros-context.mjs')}" atmosphere --project "${project}"`,
      onFailure: 'retry',
      plan: 'Phase 2: Scaffold. Builder creating atmospheric background canvas.',
    }),
  },

  // =========================================================================
  // Phase 3: Sections
  // =========================================================================
  {
    test: /^context\/S-/,
    resolve: (taskId, state, queue, project) => {
      const sec = sectionName(taskId)
      const page = activePage(state)
      return {
        action: 'run-script',
        command: `node "${p(SCRIPTS, 'eros-context.mjs')}" section --project "${project}" --section "${sec}" --page "${page}"`,
        expectedOutputs: [p(project, '.brain', 'context', `${sec}.md`)],
        onFailure: 'retry',
        plan: `Phase 3: Sections. Assembling context file for ${sec} with memory insights + dynamic threshold.`,
      }
    },
  },
  {
    test: /^build\/S-/,
    resolve: (taskId, state, queue, project) => {
      const sec = sectionName(taskId)
      return {
        action: 'spawn-agent',
        agent: 'builder',
        prompt: `Read ${p(project, '.brain', 'context', `${sec}.md`)}. Write src/components/sections/${sec}.vue + .brain/reports/${sec}.md. Run Preview Loop.`,
        expectedOutputs: [
          p(project, 'src', 'components', 'sections', `${sec}.vue`),
          p(project, '.brain', 'reports', `${sec}.md`),
        ],
        onFailure: 'retry',
        timeout: 300000,
        plan: `Phase 3: Sections. Builder creating ${sec} component with Excellence Standard.`,
      }
    },
  },
  {
    test: /^observe\/S-/,
    resolve: (taskId, state, queue, project) => {
      const sec = sectionName(taskId)
      return {
        action: 'run-script',
        command: `cd "${SCRIPTS}" && node capture-refs.mjs --local --port 5173 "${p(project, '.brain', 'observer')}" && npm run refresh:quality -- --project "${project}"`,
        expectedOutputs: [p(project, '.brain', 'observer', 'localhost')],
        onFailure: 'flag',
        note: 'Ensure dev server is running on port 5173 before this task.',
        plan: `Phase 3: Sections. Observing ${sec} — capturing screenshots + refreshing quality metrics.`,
      }
    },
  },
  {
    test: /^evaluate\/S-/,
    resolve: (taskId, state, queue, project) => {
      const sec = sectionName(taskId)
      return {
        action: 'spawn-agent',
        agent: 'evaluator',
        prompt: `Read ${p(project, '.brain', 'context', `evaluate-${sec}.md`)}. Produce .brain/evaluations/${sec}.md with APPROVE/RETRY/FLAG decision.`,
        expectedOutputs: [p(project, '.brain', 'evaluations', `${sec}.md`)],
        preCommand: `node "${p(SCRIPTS, 'eros-context.mjs')}" evaluate --project "${project}" --section "${sec}"`,
        onFailure: 'retry',
        timeout: 180000,
        plan: `Phase 3: Sections. Evaluator reviewing ${sec} against tri-source evidence matrix.`,
      }
    },
  },
  {
    test: /^review\/observer$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'run-script',
      command: `cd "${SCRIPTS}" && node capture-refs.mjs --local --port 5173 "${p(project, '.brain', 'observer')}" && npm run refresh:quality -- --project "${project}"`,
      expectedOutputs: [
        p(project, '.brain', 'observer', 'localhost', 'analysis.md'),
        p(project, '.brain', 'reports', 'quality', 'scorecard.json'),
      ],
      onFailure: 'flag',
      plan: 'Phase 3: Sections. Batch observer pass — refreshing quality metrics for all sections.',
    }),
  },
  {
    test: /^review\/sections$/,
    resolve: (taskId, state, queue, project) => {
      const mode = state.mode || 'autonomous'
      if (mode === 'interactive' || mode === 'supervised') {
        return {
          action: 'ask-user',
          question: 'Review all built sections. Approve or request changes for specific sections.',
          expectedOutputs: [],
          onFailure: 'retry',
          plan: 'Phase 3: Sections. Awaiting user review of all built sections.',
        }
      }
      return {
        action: 'auto-approve',
        note: 'Autonomous mode: save screenshots, continue to motion phase.',
        expectedOutputs: [],
        onFailure: 'flag',
        plan: 'Phase 3: Sections. Auto-approving sections in autonomous mode.',
      }
    },
  },

  // =========================================================================
  // Phase 4: Motion
  // =========================================================================
  {
    test: /^context\/motion$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'run-script',
      command: `node "${p(SCRIPTS, 'eros-context.mjs')}" motion --project "${project}"`,
      expectedOutputs: [p(project, '.brain', 'context', 'motion.md')],
      onFailure: 'retry',
      plan: 'Phase 4: Motion. Assembling motion context with insights + section list.',
    }),
  },
  {
    test: /^polish\/motion$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'spawn-agent',
      agent: 'polisher',
      prompt: `Read ${p(project, '.brain', 'context', 'motion.md')}. Write composables, preloader, transitions. QA at 4 breakpoints.`,
      expectedOutputs: [
        p(project, 'src', 'composables', 'useLenis.js'),
        p(project, 'src', 'composables', 'useMotion.js'),
        p(project, '.brain', 'reports', 'motion.md'),
      ],
      onFailure: 'retry',
      timeout: 300000,
      plan: 'Phase 4: Motion. Polisher implementing motion system + visual QA at 4 breakpoints.',
    }),
  },

  // =========================================================================
  // Phase 5: Integration
  // =========================================================================
  {
    test: /^integrate\/router$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'write-code',
      instruction: `Write src/router/index.js with lazy-loaded routes for all pages. Use createRouter + createWebHistory. Every route uses () => import('../views/PageName.vue').`,
      expectedOutputs: [p(project, 'src', 'router', 'index.js')],
      onFailure: 'retry',
      plan: 'Phase 5: Integration. CEO writing router with lazy-loaded routes.',
    }),
  },
  {
    test: /^integrate\/views$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'write-code',
      instruction: `Write src/views/*.vue files — one per page. Each imports its section components and renders them in order.`,
      expectedOutputs: [p(project, 'src', 'views')],
      onFailure: 'retry',
      plan: 'Phase 5: Integration. CEO writing page views that compose sections.',
    }),
  },
  {
    test: /^integrate\/app$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'write-code',
      instruction: `Write src/App.vue with AtmosphereCanvas + AppPreloader + transition wrapper + <router-view>. Initialize Lenis, GSAP plugins, and cursor.`,
      expectedOutputs: [p(project, 'src', 'App.vue')],
      onFailure: 'retry',
      plan: 'Phase 5: Integration. CEO writing App.vue shell with atmosphere + preloader + transitions.',
    }),
  },
  {
    test: /^integrate\/seo$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'write-code',
      instruction: `Add meta tags (title, description, og:title, og:description, og:image) to each page view. Use useHead or direct <meta> in template.`,
      expectedOutputs: [],
      onFailure: 'flag',
      plan: 'Phase 5: Integration. CEO adding SEO meta tags per page.',
    }),
  },
  {
    test: /^review\/observer-final$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'run-script',
      command: `cd "${SCRIPTS}" && node capture-refs.mjs --local --port 5173 "${p(project, '.brain', 'observer', 'final')}" && npm run refresh:quality -- --project "${project}"`,
      expectedOutputs: [p(project, '.brain', 'observer', 'final')],
      onFailure: 'flag',
      plan: 'Phase 5: Integration. Final observer pass on complete site.',
    }),
  },
  {
    test: /^review\/final$/,
    resolve: (taskId, state, queue, project) => {
      const mode = state.mode || 'autonomous'
      return {
        action: 'run-script',
        command: `node "${p(SCRIPTS, 'eros-gate.mjs')}" completion --project "${project}"`,
        expectedOutputs: [],
        onFailure: 'retry',
        note: 'Run completion gate. If passed=false, execute recovery actions and re-run until all checks pass. Then call eros-log.mjs quality-gate.',
        postActions: [
          mode === 'interactive' || mode === 'supervised'
            ? { action: 'ask-user', question: 'Final review: approve the completed project or request changes.' }
            : { action: 'write-code', instruction: 'Write docs/review/REVIEW-SUMMARY.md with project summary, scores, sections, and memory stats.' },
        ],
        plan: 'Phase 5: Integration. Running completion gate + final review.',
      }
    },
  },

  // =========================================================================
  // Phase 6: Retrospective
  // =========================================================================
  {
    test: /^cleanup\/retrospective$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'run-script',
      command: `node "${p(SCRIPTS, 'eros-memory.mjs')}" stats && node "${p(SCRIPTS, 'eros-train.mjs')}" correct --project "${project}" && node "${p(SCRIPTS, 'eros-train.mjs')}" review --project "${project}"`,
      expectedOutputs: [],
      onFailure: 'flag',
      plan: 'Phase 6: Retrospective. Running memory stats, auto-correct from diffs, and smart review.',
    }),
  },
  {
    test: /^cleanup\/promote-rules$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'run-script',
      command: `node "${p(SCRIPTS, 'eros-memory.mjs')}" promote`,
      expectedOutputs: [],
      onFailure: 'flag',
      plan: 'Phase 6: Retrospective. Promoting rules with 3+ validations.',
    }),
  },
  {
    test: /^cleanup\/delete-temp$/,
    resolve: (taskId, state, queue, project) => ({
      action: 'run-script',
      command: `rm -rf "${p(project, '_ref-captures')}" "${p(project, 'docs', 'review')}"`,
      expectedOutputs: [],
      onFailure: 'flag',
      plan: 'Phase 6: Retrospective. Cleaning up temporary capture and review directories.',
    }),
  },
]

// ---------------------------------------------------------------------------
// resolveAction — main export
// ---------------------------------------------------------------------------

export const resolveAction = (taskId, stateJson, queueJson, projectDir) => {
  if (!taskId) {
    return { action: 'complete', plan: 'All tasks finished.' }
  }

  for (const entry of ACTION_MAP) {
    if (entry.test.test(taskId)) {
      const action = entry.resolve(taskId, stateJson, queueJson, projectDir)
      // Compute step / totalSteps
      const done = (queueJson?.done || []).length
      const active = (queueJson?.active || []).length
      const pending = (queueJson?.pending || []).length
      const total = done + active + pending
      return {
        ...action,
        task: taskId,
        step: done + 1,
        totalSteps: total,
        phase: detectPhase(taskId),
      }
    }
  }

  // Fallback: freestyle action for unknown task types
  return {
    action: 'freestyle',
    task: taskId,
    instruction: `Task "${taskId}" has no predefined action mapping. Use your best judgment to complete it, then report back.`,
    expectedOutputs: [],
    onFailure: 'flag',
    plan: `Unknown task type: ${taskId}. Freestyle execution.`,
  }
}

// ---------------------------------------------------------------------------
// detectPhase — reuse from eros-state constants
// ---------------------------------------------------------------------------

const PHASE_PREFIXES = [
  { test: /^setup\//, phase: 'discovery' },
  { test: /^design\//, phase: 'creative' },
  { test: /^build\/atmosphere$/, phase: 'scaffold' },
  { test: /^context\/S-/, phase: 'sections' },
  { test: /^build\/S-/, phase: 'sections' },
  { test: /^observe\/S-/, phase: 'sections' },
  { test: /^evaluate\/S-/, phase: 'sections' },
  { test: /^review\/observer$/, phase: 'sections' },
  { test: /^review\/sections$/, phase: 'sections' },
  { test: /^context\/motion$/, phase: 'motion' },
  { test: /^polish\//, phase: 'motion' },
  { test: /^integrate\//, phase: 'integration' },
  { test: /^review\/observer-final$/, phase: 'integration' },
  { test: /^review\/final$/, phase: 'integration' },
  { test: /^cleanup\//, phase: 'retrospective' },
]

const detectPhase = (taskId) => {
  if (!taskId) return 'unknown'
  for (const entry of PHASE_PREFIXES) {
    if (entry.test.test(taskId)) return entry.phase
  }
  return 'unknown'
}

// ---------------------------------------------------------------------------
// resolveMemoryHooks — what learn events to fire after a task
// ---------------------------------------------------------------------------

export const resolveMemoryHooks = (taskId, resultData, stateJson) => {
  const slug = projectSlug(stateJson)
  const mood = projectMood(stateJson)
  const hooks = []

  // Creative review → font + palette + decisions
  if (/^review\/creative$/.test(taskId)) {
    if (resultData?.font) {
      hooks.push({
        event: 'font_selected',
        data: {
          project: slug,
          mood,
          display: resultData.font.display || '',
          body: resultData.font.body || '',
          mono: resultData.font.mono || null,
          reaction: resultData.reaction || 'auto-approved',
          lesson: resultData.font.lesson || '',
        },
      })
    }
    if (resultData?.palette) {
      hooks.push({
        event: 'palette_selected',
        data: {
          project: slug,
          mood,
          canvas: resultData.palette.canvas || '',
          accent: resultData.palette.accent || '',
          reaction: resultData.reaction || 'auto-approved',
          lesson: resultData.palette.lesson || '',
        },
      })
    }
  }

  // Section evaluation → section_approved (if approved)
  if (/^evaluate\/S-/.test(taskId) && resultData?.verdict === 'APPROVE') {
    const sec = sectionName(taskId)
    const st = sectionType(taskId)
    hooks.push({
      event: 'section_approved',
      data: {
        project: slug,
        section: sec,
        sectionType: st,
        score: resultData.score ?? 0,
        layout: resultData.layout || '',
        motion: resultData.motion || '',
        technique: resultData.technique || '',
        signature: resultData.signature || '',
      },
    })
  }

  // Section review with user changes
  if (/^review\/sections$/.test(taskId) && resultData?.changes) {
    for (const change of resultData.changes) {
      hooks.push({
        event: 'user_change',
        data: {
          project: slug,
          phase: 'Phase 3',
          whatChanged: change.whatChanged || '',
          original: change.original || '',
          revised: change.revised || '',
          pattern: change.pattern || '',
        },
      })
    }
  }

  return hooks
}

// ---------------------------------------------------------------------------
// verifyOutputs — deterministic file checks
// ---------------------------------------------------------------------------

export const verifyOutputs = async (projectDir, expectedOutputs) => {
  if (!expectedOutputs || expectedOutputs.length === 0) {
    return { passed: true, details: [] }
  }

  const details = []
  let allPassed = true

  for (const filePath of expectedOutputs) {
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(projectDir, filePath)
    try {
      const stat = await fs.stat(absPath)
      if (stat.isDirectory()) {
        // For directories, just check existence
        details.push({ file: filePath, exists: true, passed: true })
      } else {
        const size = stat.size
        if (size < 100) {
          details.push({ file: filePath, exists: true, size, passed: false, reason: 'File too small (< 100 bytes)' })
          allPassed = false
        } else {
          // Additional checks for specific file types
          const content = await fs.readFile(absPath, 'utf8')
          if (absPath.endsWith('.vue') && !content.includes('<template')) {
            details.push({ file: filePath, exists: true, size, passed: false, reason: 'Vue SFC missing <template>' })
            allPassed = false
          } else if (absPath.match(/reports\/S-.+\.md$/) && !content.match(/score/i)) {
            details.push({ file: filePath, exists: true, size, passed: false, reason: 'Report missing Score line' })
            allPassed = false
          } else {
            details.push({ file: filePath, exists: true, size, passed: true })
          }
        }
      }
    } catch {
      details.push({ file: filePath, exists: false, passed: false, reason: 'File not found' })
      allPassed = false
    }
  }

  return { passed: allPassed, details }
}

// ---------------------------------------------------------------------------
// resolveRecovery — enhance retry action with failure context
// ---------------------------------------------------------------------------

export const resolveRecovery = (taskId, failureData, attempt) => {
  const context = []

  if (failureData?.weakDimensions?.length) {
    context.push(`Focus on improving: ${failureData.weakDimensions.join(', ')}`)
  }
  if (failureData?.missingSignature) {
    context.push('Name a distinctive signature element in the report.')
  }
  if (failureData?.score != null && failureData?.threshold != null) {
    context.push(`Score ${failureData.score} is below threshold ${failureData.threshold}. Target at least ${failureData.threshold}.`)
  }
  if (failureData?.missingOutputs?.length) {
    context.push(`Missing files: ${failureData.missingOutputs.join(', ')}`)
  }

  // Generic context for all retries
  context.push(`This is retry attempt ${attempt}. Previous attempt failed: ${failureData?.reason || 'unknown reason'}.`)

  return {
    retryContext: context.join(' '),
    maxAttempts: 2,
    escalateToFlag: attempt >= 2,
  }
}

// ---------------------------------------------------------------------------
// Determine if a task needs gate evaluation
// ---------------------------------------------------------------------------

export const needsGate = (taskId) => {
  // Tasks that produce artifacts evaluated by eros-gate.mjs post
  return /^(build\/S-|design\/tokens|design\/pages|build\/atmosphere|polish\/motion)/.test(taskId)
}

// ---------------------------------------------------------------------------
// Determine if a task needs pre-gate
// ---------------------------------------------------------------------------

export const needsPreGate = (taskId) => {
  // All tasks go through pre-gate in V7, keep that in V8
  return true
}
