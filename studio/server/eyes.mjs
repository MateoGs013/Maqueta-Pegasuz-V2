/**
 * eyes.mjs — The deterministic perception tier (zero tokens).
 *
 * chokidar watches the project's src/ -> debounce -> Playwright capture with a
 * warm persistent browser -> pixelmatch diff vs previous capture -> filmstrip.
 * The critique tier (in-session, token-gated) is triggered by the caller only
 * when the diff crosses THRESHOLD — see session.mjs.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import chokidar from 'chokidar'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { state, nextId, persist, logActivity, CAPTURES_DIR } from './state.mjs'

const DEBOUNCE_MS = 900
/** Fraction of changed pixels above which a capture is "meaningful". */
const DIFF_THRESHOLD = 0.012

export const BREAKPOINTS = { mobile: 375, tablet: 768, desktop: 1440 }

let browser = null
let watcher = null
let debounceTimer = null
let activeBreakpoint = 'desktop'

async function getBrowser() {
  if (browser) return browser
  const { chromium } = await import('playwright')
  browser = await chromium.launch({ headless: true })
  browser.on('disconnected', () => { browser = null })
  return browser
}

function gitRef(projectDir) {
  return new Promise((resolve) => {
    execFile('git', ['rev-parse', '--short', 'HEAD'], { cwd: projectDir }, (err, out) => {
      resolve(err ? null : out.trim())
    })
  })
}

export function setBreakpoint(name) {
  if (BREAKPOINTS[name]) activeBreakpoint = name
}

export async function capture({ reason = 'manual' } = {}) {
  if (!state.project?.previewUrl) return null
  const b = await getBrowser()
  const width = BREAKPOINTS[activeBreakpoint]
  const page = await b.newPage({ viewport: { width, height: Math.round(width * 0.66) } })
  const consoleErrors = []
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  try {
    await page.goto(state.project.previewUrl, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(400)
    const id = nextId('cap')
    const file = `${id}.png`
    await page.screenshot({ path: path.join(CAPTURES_DIR, file), fullPage: false })

    const prev = state.captures[0]
    let diffRatio = 1
    if (prev && prev.breakpoint === activeBreakpoint) {
      try {
        const a = PNG.sync.read(fs.readFileSync(path.join(CAPTURES_DIR, prev.file)))
        const c = PNG.sync.read(fs.readFileSync(path.join(CAPTURES_DIR, file)))
        if (a.width === c.width && a.height === c.height) {
          const changed = pixelmatch(a.data, c.data, null, a.width, a.height, { threshold: 0.1 })
          diffRatio = changed / (a.width * a.height)
        }
      } catch { /* dimension mismatch etc — treat as full diff */ }
    }

    const entry = {
      id, file, ts: new Date().toISOString(), breakpoint: activeBreakpoint,
      reason, diffRatio: Number(diffRatio.toFixed(4)),
      consoleErrors: consoleErrors.slice(0, 10),
      gitRef: await gitRef(state.project.dir),
    }
    state.captures.unshift(entry)
    state.captures = state.captures.slice(0, 300)
    persist()
    logActivity('capture', `${activeBreakpoint} ${file} (diff ${(diffRatio * 100).toFixed(1)}%, ${reason})`)
    return { ...entry, meaningful: diffRatio >= DIFF_THRESHOLD }
  } finally {
    await page.close()
  }
}

/**
 * Start watching the project's source. onMeaningfulChange(captureEntry) fires
 * only for captures whose pixel diff crosses the threshold — that is the gate
 * that keeps the critique tier from burning the usage window.
 */
export function watchProject(onCapture) {
  stopWatching()
  if (!state.project?.dir) return
  const srcDir = path.join(state.project.dir, 'src')
  if (!fs.existsSync(srcDir)) return
  watcher = chokidar.watch(srcDir, { ignoreInitial: true, ignored: /node_modules/ })
  const trigger = () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      try {
        const entry = await capture({ reason: 'file-change' })
        if (entry) onCapture(entry)
      } catch (e) {
        logActivity('error', `capture failed: ${e.message}`)
      }
    }, DEBOUNCE_MS)
  }
  watcher.on('add', trigger).on('change', trigger).on('unlink', trigger)
  logActivity('eyes', `watching ${srcDir}`)
}

export function stopWatching() {
  if (watcher) { watcher.close(); watcher = null }
  clearTimeout(debounceTimer)
}

export async function shutdown() {
  stopWatching()
  if (browser) await browser.close().catch(() => {})
}
