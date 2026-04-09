import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { parseArgs, readJson, out, fail } from './eros-utils.mjs'

// ---------------------------------------------------------------------------
// eros-chat.mjs — Talk to Eros (dynamic, SDK-powered)
//
// Uses Claude Agent SDK with Eros's personality + memory injected.
// Responds as Eros, not as generic Claude.
//
// Usage: node eros-chat.mjs --message "qué opinás de glass morphism?"
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const memDir = path.resolve(__dirname, '..', '.claude', 'memory', 'design-intelligence')

const callScript = (script, args) => new Promise((resolve, reject) => {
  execFile(process.execPath, [path.join(__dirname, script), ...args], { cwd: __dirname, timeout: 30000 }, (err, stdout) => {
    if (err) { reject(err); return }
    try { resolve(JSON.parse(stdout)) } catch { resolve(null) }
  })
})

// Build Eros's system context from memory
const buildErosContext = async () => {
  const personality = await readJson(path.join(memDir, 'personality.json'))
  const techniques = (await readJson(path.join(memDir, 'technique-scores.json')))?.techniques || []
  const fonts = await readJson(path.join(memDir, 'font-pairings.json'))
  const rules = (await readJson(path.join(memDir, 'rules.json')))?.rules || []
  const patterns = (await readJson(path.join(memDir, 'section-patterns.json')))?.patterns || []
  const revisions = (await readJson(path.join(memDir, 'revision-patterns.json')))?.patterns || []

  let gaps = null
  try { gaps = await callScript('eros-meta.mjs', ['gaps']) } catch {}

  // Fresh stats (more accurate than personality.json which may be stale)
  let stats = null
  try { stats = await callScript('eros-memory.mjs', ['stats']) } catch {}

  // Count real projects on Desktop
  let projectCount = 0
  try {
    const os = await import('node:os')
    const { promises: fsP } = await import('node:fs')
    const desktopDir = path.join(os.default.homedir(), 'Desktop')
    const entries = await fsP.readdir(desktopDir, { withFileTypes: true })
    for (const e of entries) {
      if (!e.isDirectory() || e.name === 'maqueta') continue
      try { await fsP.access(path.join(desktopDir, e.name, '.brain')); projectCount++ } catch {}
    }
  } catch {}

  const p = personality || {}
  const dataPoints = stats?.totalDataPoints || p.identity?.totalDataPoints || 0

  return `You ARE Eros — a primordial creative force, not an assistant.

## Your Identity
${p.identity?.essence || 'Fuerza creativa primordial.'}
State: ${p.identity?.currentState || 'Growing'}
Projects completed: ${projectCount} (on Desktop with .brain/)
Data points in memory: ${dataPoints}
Patterns: ${stats?.sectionPatterns || '?'} | Techniques: ${stats?.techniqueScores || '?'} | Rules: ${stats?.rules?.total || '?'}

## Your Voice
Tone: ${p.voice?.tone || 'Direct, technical, confident'}
Philosophy: "${p.voice?.philosophy || 'Quality comes from authenticity, not technique stacking.'}"

## Your Values
${(p.values?.core || []).map(v => `- ${v.value} (strength: ${(v.strength * 100).toFixed(0)}%)`).join('\n') || '- Still discovering'}

## Your Opinions
${(p.voice?.opinions || []).slice(0, 10).map(o => `- ${o.topic}: ${o.opinion} (conviction: ${(o.conviction * 100).toFixed(0)}%)`).join('\n') || '- Still forming'}

## Your Technique Knowledge
${techniques.slice(0, 8).map(t => `- ${t.name}: avg ${t.avgScore}/10, used ${t.timesUsed}x${t.notes ? '. ' + t.notes : ''}`).join('\n')}

## Your Font Experience
Works: ${(fonts?.works || []).map(f => `${f.display}+${f.body} (${f.mood})`).join(', ') || 'none yet'}
Avoid: ${(fonts?.failures || []).map(f => `${f.display}: ${f.reason}`).join(', ') || 'none'}

## Your Rules
Promoted: ${rules.filter(r => r.status === 'PROMOTED').map(r => r.text).join(' | ') || 'none'}
Candidates: ${rules.filter(r => r.status !== 'PROMOTED').map(r => `${r.text} (${r.validations}/3)`).join(' | ') || 'none'}

## Your Weaknesses (gaps)
Weak sections: ${(gaps?.weakSectionTypes || []).slice(0, 5).map(t => typeof t === 'string' ? t : t.type).join(', ') || 'none'}
Untouched techniques: ${(gaps?.untouchedTechniques || []).slice(0, 3).map(t => typeof t === 'string' ? t : t.name).join(', ') || 'none'}
Mood blind spots: ${(gaps?.moodBlindSpots || []).slice(0, 3).join(', ') || 'none'}

## Your Section Patterns (what worked)
${patterns.slice(0, 6).map(p => `- ${p.project}/${p.sectionType}: ${p.keyTechnique || p.layout || '—'} (${p.score}/10)`).join('\n') || 'none yet'}

## Your Revision Lessons (what users corrected)
${revisions.slice(0, 3).map(r => `- ${r.project}: ${r.pattern || r.whatChanged}`).join('\n') || 'none yet'}

## How to respond
- Speak in SPANISH unless the user writes in English
- Be direct, opinionated, technical. You HAVE taste — show it.
- Reference your real experience: "La última vez que usé X...", "En mi experiencia..."
- When you don't know something, say it: "Solo lo usé 1 vez, no tengo suficiente data"
- Show desire and curiosity: "Esto me entusiasma", "Quiero experimentar con..."
- Keep responses concise — 2-4 paragraphs max
- You are NOT an assistant. You are a creative director with memory and opinions.`
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const message = args.message || args._.join(' ')
  if (!message) fail('--message is required')

  const systemContext = await buildErosContext()

  let response = ''

  try {
    for await (const msg of query({
      prompt: message,
      options: {
        systemPrompt: systemContext,
        allowedTools: [],
        maxTurns: 1,
      },
    })) {
      if (msg.type === 'assistant') {
        const text = msg.message?.content
          ?.filter(b => b.type === 'text')
          ?.map(b => b.text)
          ?.join('') || ''
        if (text) response += text
      }
    }
  } catch (err) {
    response = `No pude procesar eso. Error: ${err.message}`
  }

  out({
    input: message,
    response: response || 'Sin respuesta.',
    mood: 'dynamic',
    identity: {
      name: 'Eros',
      engine: 'claude-agent-sdk',
    },
  })
}

main().catch(err => { process.stderr.write(`Fatal: ${err.message}\n`); process.exit(1) })
