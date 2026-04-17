// Exports moodProfiles from bootstrap-eros-feed.mjs as JSON.
// Consumed by the Go CLI (cli/internal/moods) to render mood previews
// without duplicating the profile data. Single source of truth.

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { readFile } from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const bootstrapPath = path.join(__dirname, 'bootstrap-eros-feed.mjs')

const source = await readFile(bootstrapPath, 'utf8')
const profilesMatch = source.match(/const moodProfiles = (\[[\s\S]*?\]\s*)\r?\n\s*\r?\nconst defaultProfile/)

if (!profilesMatch) {
  console.error('export-moods: could not locate moodProfiles array in bootstrap-eros-feed.mjs')
  process.exit(1)
}

// moodProfiles contains RegExp literals, so JSON.parse will not work.
// Evaluate the array literal via Function constructor (scope-isolated).
const evaluate = new Function(`return ${profilesMatch[1]}`)
const profiles = evaluate()

const labelFor = (profile) => {
  const src = profile.test.source
  if (/cinematic|film|editorial|atmospheric/.test(src)) return 'Dark cinematic editorial'
  if (/brutalist|bold|poster|graphic/.test(src)) return 'Brutalist bold'
  if (/luxury|premium|elegant|fashion/.test(src)) return 'Luxury refined'
  if (/product|saas|app|platform|dashboard/.test(src)) return 'Product UI'
  return 'Custom'
}

const out = profiles.map((p) => ({
  label: labelFor(p),
  keywordsRegex: p.test.source,
  families: p.families,
  layoutBias: p.layoutBias,
  sectionRhythm: p.sectionRhythm,
  spatialSurprise: p.spatialSurprise,
  displayRole: p.displayRole,
  bodyRole: p.bodyRole,
  scaleStrategy: p.scaleStrategy,
  densityRule: p.densityRule,
  canvas: p.canvas,
  text: p.text,
  accent: p.accent,
  atmosphere: p.atmosphere,
  revealBias: p.revealBias,
  scrollBehavior: p.scrollBehavior,
  hoverLanguage: p.hoverLanguage,
  motionAvoid: p.motionAvoid,
  mobilePriority: p.mobilePriority,
  tabletBehavior: p.tabletBehavior,
  desktopBehavior: p.desktopBehavior,
}))

process.stdout.write(JSON.stringify(out, null, 2))
process.stdout.write('\n')
