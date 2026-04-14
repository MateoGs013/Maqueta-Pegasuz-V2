#!/usr/bin/env node
/**
 * eros-migrate-audits.mjs — One-shot migration after the audit + observer fixes.
 *
 * Applied after:
 *   - Fix A: observer scores key corrected in eros-auto-train.mjs
 *   - Fix B: preview screenshots now preserved before cleanup
 *   - Fix C: eros-audit.mjs now reads index.html (breaking the 50% myth)
 *
 * Does 3 things (idempotent, dry-run capable):
 *
 *   1. Re-audits every Desktop project with .brain/ using the new audit,
 *      overwriting .brain/reports/quality/audit.json with real scores.
 *
 *   2. Backfills training-history.json: for each session, best-effort
 *      matches a project dir and fills in the real observer scores
 *      (from manifest.excellenceSignals._scores) and re-audit scores.
 *      Backs up the original history to training-history.json.pre-migration.bak.
 *
 *   3. Copies observer screenshots from .brain/observer/localhost/*.png
 *      into .eros/memory/design-intelligence/previews/<project-name>/
 *      so the Training detail modal can show them even for old projects.
 *
 * Usage:
 *   node eros-migrate-audits.mjs --dry-run     # preview without writing
 *   node eros-migrate-audits.mjs               # execute
 */

import { execFile } from 'node:child_process'
import { promises as fs, existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, readJson, writeJson, readText, ensureDir, out, fail, today } from './eros-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const maquetaDir = path.resolve(__dirname, '..')
const memDir = path.join(maquetaDir, '.eros', 'memory', 'design-intelligence')
const historyPath = path.join(memDir, 'training-history.json')
const previewsRoot = path.join(memDir, 'previews')
const desktopDir = path.join(os.homedir(), 'Desktop')

// Skip these directory names — they aren't projects.
const SKIP = new Set([
  'maqueta', 'Maqueta-Pegasuz-V2', '.', '..', 'desktop',
])

const log = (msg) => process.stderr.write(`[migrate] ${msg}\n`)

// ─── Spawn helper ─────────────────────────────────────────────────────────

const spawnAudit = (projectDir) =>
  new Promise((resolve) => {
    execFile(
      process.execPath,
      [path.join(__dirname, 'eros-audit.mjs'), '--project', projectDir],
      { cwd: __dirname, timeout: 30000, maxBuffer: 10 * 1024 * 1024 },
      (err, stdout) => {
        if (err) { resolve(null); return }
        try { resolve(JSON.parse(stdout)) } catch { resolve(null) }
      },
    )
  })

// ─── Observer score extraction (matches Fix A logic in auto-train) ───────

const extractObserverScores = (manifest) => {
  if (!manifest) return null
  const raw = manifest.excellenceSignals?._scores
  if (!raw || typeof raw !== 'object') return null
  return {
    composition: raw.composition ?? null,
    depth: raw.depth ?? null,
    typography: raw.typography ?? null,
    motion: raw.motion ?? null,
    craft: raw.craft ?? null,
    antiTemplate: manifest.antiTemplate?.score ?? manifest.antiTemplate?._score ?? null,
  }
}

// ─── Project scanner ──────────────────────────────────────────────────────

const scanProjects = async () => {
  const entries = await fs.readdir(desktopDir, { withFileTypes: true }).catch(() => [])
  const projects = []
  for (const e of entries) {
    if (!e.isDirectory()) continue
    if (SKIP.has(e.name)) continue
    const projectDir = path.join(desktopDir, e.name)
    const brainDir = path.join(projectDir, '.brain')
    if (!existsSync(brainDir)) continue

    const manifestPath = path.join(brainDir, 'observer', 'localhost', 'manifest.json')
    const manifest = existsSync(manifestPath) ? await readJson(manifestPath) : null

    // Read state.md modification time to estimate "when this project was last worked on"
    let mtimeMs = null
    try {
      const stat = await fs.stat(path.join(brainDir, 'state.md'))
      mtimeMs = stat.mtimeMs
    } catch {}

    projects.push({
      name: e.name,
      projectDir,
      brainDir,
      hasObserver: !!manifest,
      manifest,
      observerScores: extractObserverScores(manifest),
      mtimeMs,
    })
  }
  return projects
}

// ─── Capa 1: Re-audit every project ───────────────────────────────────────

const reauditProjects = async (projects, dryRun) => {
  const results = []
  for (const p of projects) {
    const auditResult = await spawnAudit(p.projectDir)
    if (!auditResult) {
      results.push({ ...p, auditError: 'audit script failed or returned non-JSON' })
      continue
    }
    const overall = auditResult.overall || {}
    const entry = {
      name: p.name,
      newAudit: overall,
      oldAuditPath: path.join(p.brainDir, 'reports', 'quality', 'audit.json'),
    }

    if (!dryRun) {
      // Write the new scorecard back to the project's quality dir
      try {
        await ensureDir(path.join(p.brainDir, 'reports', 'quality'))
        await writeJson(entry.oldAuditPath, auditResult)
        entry.written = true
      } catch (err) {
        entry.writeError = err.message
      }
    }

    // Attach observer scores (from Fix A logic) if available
    if (p.observerScores) entry.observerScores = p.observerScores

    results.push(entry)
  }
  return results
}

// ─── Capa 2: Match + backfill history ─────────────────────────────────────

// Best-effort matcher. Known exact matches first, then heuristic.
const KNOWN_MATCHES = {
  // session brief.id → project dir name
  'practice-1775675550907': 'practice-v2',   // 74m no-ref run
  'practice-1775692287411': 'practice-19',   // confirmed via earlier validation run logs
}

// Exact-match first, then heuristic on remaining (unclaimed) projects.
// Projects can only match ONE session — once claimed, they're removed
// from the heuristic pool so two sessions can't both point at practice-v2.
const resolveMatches = (sessions, projects) => {
  const claimed = new Set()
  const resolved = []

  // Pass 1: exact matches
  for (const session of sessions) {
    const knownName = KNOWN_MATCHES[session.id]
    if (knownName) {
      const project = projects.find((p) => p.name === knownName)
      if (project) {
        claimed.add(project.name)
        resolved.push({ session, project, confidence: 'exact', reason: 'KNOWN_MATCHES table' })
        continue
      }
    }
    resolved.push({ session, project: null })
  }

  // Pass 2: heuristic on remaining sessions + unclaimed projects.
  // SKIP: sessions whose duration is < 150s — they died early and never
  // produced a project (e.g. the SŌM run that died in ENOENT at 132s).
  for (const entry of resolved) {
    if (entry.project) continue
    const { session } = entry

    if ((session.duration || 0) < 150) {
      entry.skipReason = `duration ${session.duration}s too short — died before producing a project`
      continue
    }

    const sessionTime = new Date(session.timestamp || session.date + 'T00:00:00').getTime()
    const pool = projects.filter((p) => !claimed.has(p.name) && p.mtimeMs)
    const near = pool
      .filter((p) => Math.abs(p.mtimeMs - sessionTime) < 24 * 60 * 60 * 1000)
      .sort((a, b) => Math.abs(a.mtimeMs - sessionTime) - Math.abs(b.mtimeMs - sessionTime))

    if (near.length > 0) {
      const pick = near[0]
      claimed.add(pick.name)
      entry.project = pick
      entry.confidence = 'heuristic'
      entry.reason = `closest mtime (${Math.round(Math.abs(pick.mtimeMs - sessionTime) / 60000)}min apart)`
    }
  }

  return resolved
}

const backfillHistory = async (projects, dryRun) => {
  const history = (await readJson(historyPath)) || { sessions: [] }
  const backup = JSON.parse(JSON.stringify(history))

  const sessions = history.sessions || []
  const resolved = resolveMatches(sessions, projects)
  const matches = []

  for (const entry of resolved) {
    const { session, project, confidence, reason, skipReason } = entry

    if (!project) {
      session.audited_with_buggy_code = true
      session.migration_note = skipReason || 'No matching project found — left as-is'
      matches.push({ sessionId: session.id, matched: false, skipReason })
      continue
    }

    const before = {
      observer: session.observer,
      audit: session.audit,
    }

    if (project.observerScores) {
      session.observer = project.observerScores
    }
    const auditResult = await spawnAudit(project.projectDir)
    if (auditResult?.overall) {
      session.audit = auditResult.overall
    }

    session.migrated_at = new Date().toISOString()
    session.matched_project_dir = project.name
    session.match_confidence = confidence

    matches.push({
      sessionId: session.id,
      matched: true,
      projectName: project.name,
      confidence,
      reason,
      before,
      after: { observer: session.observer, audit: session.audit },
    })
  }

  if (!dryRun) {
    // Backup
    const backupPath = `${historyPath}.pre-migration-${today()}.bak`
    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2) + '\n', 'utf8')
    log(`backup: ${backupPath}`)

    // Write updated history
    await writeJson(historyPath, history)
  }

  return matches
}

// ─── Capa 3: Copy screenshots to previews dir ─────────────────────────────

const copyPreviews = async (projects, dryRun) => {
  const results = []
  for (const p of projects) {
    if (!p.hasObserver) continue
    const srcDir = path.join(p.brainDir, 'observer', 'localhost')
    const destDir = path.join(previewsRoot, p.name)

    let copied = 0
    const framesToCopy = ['full-page-desktop.png', 'full-page-mobile.png', 'frame-000.png', 'frame-001.png']

    for (const frame of framesToCopy) {
      const src = path.join(srcDir, frame)
      if (!existsSync(src)) continue
      if (!dryRun) {
        try {
          await ensureDir(destDir)
          await fs.copyFile(src, path.join(destDir, frame))
          copied++
        } catch {}
      } else {
        copied++
      }
    }

    // Also copy first frame from desktop/ and mobile/ subdirs if present
    for (const sub of ['desktop', 'mobile']) {
      try {
        const entries = await fs.readdir(path.join(srcDir, sub))
        const first = entries.find((f) => /^frame-\d+\.png$/.test(f))
        if (first) {
          if (!dryRun) {
            await ensureDir(destDir)
            await fs.copyFile(
              path.join(srcDir, sub, first),
              path.join(destDir, `${sub}-${first}`),
            )
            copied++
          } else {
            copied++
          }
        }
      } catch {}
    }

    results.push({ name: p.name, framesCopied: copied })
  }
  return results
}

// ─── Main ─────────────────────────────────────────────────────────────────

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const dryRun = args['dry-run'] === true

  log(`Scanning Desktop for projects with .brain/ ...`)
  const projects = await scanProjects()
  log(`Found ${projects.length} projects (${projects.filter((p) => p.hasObserver).length} with observer data)`)

  log(`\nCapa 1: re-auditing all projects${dryRun ? ' (DRY RUN)' : ''}...`)
  const auditResults = await reauditProjects(projects, dryRun)

  log(`\nCapa 2: backfilling training-history.json${dryRun ? ' (DRY RUN)' : ''}...`)
  const matches = await backfillHistory(projects, dryRun)

  log(`\nCapa 3: copying preview screenshots${dryRun ? ' (DRY RUN)' : ''}...`)
  const previews = await copyPreviews(projects, dryRun)

  // Summary
  const summary = {
    dryRun,
    projectsScanned: projects.length,
    projectsWithObserver: projects.filter((p) => p.hasObserver).length,
    capa1: {
      audited: auditResults.length,
      written: auditResults.filter((r) => r.written).length,
      summary: auditResults.map((r) => ({
        name: r.name,
        audit: r.newAudit ? `${r.newAudit.score}/${r.newAudit.total} (${r.newAudit.pct}%)` : 'ERROR',
      })),
    },
    capa2: {
      sessionsProcessed: matches.length,
      matched: matches.filter((m) => m.matched).length,
      unmatched: matches.filter((m) => !m.matched).length,
      matches,
    },
    capa3: {
      projects: previews.length,
      totalFrames: previews.reduce((s, p) => s + p.framesCopied, 0),
      perProject: previews,
    },
  }

  out(summary)
}

main().catch((err) => { log(`Fatal: ${err.message}`); process.exit(1) })
