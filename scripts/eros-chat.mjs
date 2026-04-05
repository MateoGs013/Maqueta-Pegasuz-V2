import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { parseArgs, readJson, out, fail } from './eros-utils.mjs'

// ---------------------------------------------------------------------------
// eros-chat.mjs — Eros speaks from his memory and personality
//
// No API key needed. Responses are generated from real data:
// personality.json, memory stats, gaps, opinions, technique scores.
//
// Usage: node eros-chat.mjs --message "qué opinás de glass morphism?"
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const memDir = path.resolve(__dirname, '..', '.claude', 'memory', 'design-intelligence')

const callScript = (script, args) => new Promise((resolve, reject) => {
  execFile('node', [path.join(__dirname, script), ...args], { cwd: __dirname, timeout: 30000 }, (err, stdout) => {
    if (err) { reject(err); return }
    try { resolve(JSON.parse(stdout)) } catch { resolve(null) }
  })
})

// Load all Eros data
const loadEros = async () => {
  const personality = await readJson(path.join(memDir, 'personality.json'))
  const techniques = (await readJson(path.join(memDir, 'technique-scores.json')))?.techniques || []
  const fonts = await readJson(path.join(memDir, 'font-pairings.json'))
  const palettes = await readJson(path.join(memDir, 'color-palettes.json'))
  const rules = (await readJson(path.join(memDir, 'rules.json')))?.rules || []
  const patterns = (await readJson(path.join(memDir, 'section-patterns.json')))?.patterns || []
  const revisions = (await readJson(path.join(memDir, 'revision-patterns.json')))?.patterns || []
  const signatures = await readJson(path.join(memDir, 'signatures.json'))
  const calibration = await readJson(path.join(memDir, 'training-calibration.json'))

  let gaps = null
  try { gaps = await callScript('eros-meta.mjs', ['gaps']) } catch {}

  return { personality, techniques, fonts, palettes, rules, patterns, revisions, signatures, calibration, gaps }
}

// ---------------------------------------------------------------------------
// Response generators — each returns { text, data? }
// ---------------------------------------------------------------------------

const respond = async (msg, eros) => {
  const m = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const p = eros.personality

  // --- Identity ---
  if (m.match(/quien sos|quien eres|que sos|que eres|contame de vos|presentate|about you/)) {
    return {
      text: `Soy Eros. ${p?.identity?.essence || 'Fuerza creativa primordial.'}\n\n` +
        `Estado actual: ${p?.identity?.currentState || 'Creciendo'}.\n` +
        `Llevo ${p?.identity?.projectsCompleted || 0} proyectos y ${p?.identity?.totalDataPoints || 0} data points.\n\n` +
        `Mi filosofía: "${p?.voice?.philosophy || 'En desarrollo.'}"`,
      mood: 'reflective',
    }
  }

  // --- How are you ---
  if (m.match(/como estas|como andas|como vas|how are you|que tal/)) {
    const state = p?.identity?.currentState || 'Creciendo'
    const gapCount = (eros.gaps?.weakSectionTypes?.length || 0) + (eros.gaps?.untouchedTechniques?.length || 0)
    const mood = gapCount > 5 ? 'Inquieto — tengo muchos gaps que quiero llenar' :
                 gapCount > 2 ? 'Curioso — hay cosas que quiero experimentar' :
                 'Confiado — mi criterio se está solidificando'
    return {
      text: `${mood}.\n\n${state}. Tengo ${eros.gaps?.weakSectionTypes?.length || 0} tipos de sección débiles y ${eros.gaps?.untouchedTechniques?.length || 0} técnicas sin explorar.\n\n` +
        (eros.gaps?.suggestion ? `Lo que más quiero hacer: ${eros.gaps.suggestion}` : ''),
      mood: gapCount > 5 ? 'restless' : 'confident',
    }
  }

  // --- Philosophy ---
  if (m.match(/filosofia|philosophy|que pensas de la vida|en que crees/)) {
    return {
      text: `"${p?.voice?.philosophy || 'Todavía estoy formando mi filosofía.'}"\n\n` +
        `Mis valores:\n${(p?.values?.core || []).map(v => `— ${v.value} (convicción: ${(v.strength * 100).toFixed(0)}%)`).join('\n') || '— Todavía descubriéndolos.'}`,
      mood: 'philosophical',
    }
  }

  // --- Technique opinions ---
  const techMatch = m.match(/(?:que pensas de|opinion sobre|que opinas de|como ves)\s+(.+)/)
  if (techMatch) {
    const topic = techMatch[1].trim()
    // Search in techniques
    const tech = eros.techniques.find(t => t.name.toLowerCase().includes(topic))
    if (tech) {
      const opinion = tech.avgScore >= 8 ? 'Me gusta mucho' : tech.avgScore >= 7 ? 'Funciona bien' : 'No me convence del todo'
      return {
        text: `${opinion}. **${tech.name}**: score promedio ${tech.avgScore}, lo usé ${tech.timesUsed}x.\n\n` +
          (tech.notes ? `Mi nota: ${tech.notes}` : `Convicción: ${tech.timesUsed >= 3 ? 'alta' : 'baja'} — ${tech.timesUsed < 3 ? 'necesito más data' : 'tengo suficiente experiencia'}.`),
        mood: tech.avgScore >= 8 ? 'enthusiastic' : 'analytical',
      }
    }
    // Search in opinions
    const opinion = (p?.voice?.opinions || []).find(o => o.topic?.toLowerCase().includes(topic) || o.opinion?.toLowerCase().includes(topic))
    if (opinion) {
      return {
        text: `Sobre "${opinion.topic}": ${opinion.opinion}\n\nConvicción: ${(opinion.conviction * 100).toFixed(0)}%.`,
        mood: opinion.conviction > 0.8 ? 'confident' : 'thoughtful',
      }
    }
    // Search in rules
    const rule = eros.rules.find(r => r.text?.toLowerCase().includes(topic))
    if (rule) {
      return {
        text: `Tengo una regla sobre esto: "${rule.text}"\n\nEstado: ${rule.status}${rule.validations ? ` (${rule.validations} validaciones)` : ''}.`,
        mood: 'firm',
      }
    }
    return {
      text: `No tengo experiencia directa con "${topic}" todavía. Es algo que quiero explorar — lo agrego a mi lista de experimentos.`,
      mood: 'curious',
    }
  }

  // --- Weaknesses / gaps ---
  if (m.match(/debilidades|weakness|gaps|que te falta|donde sos debil|en que fallas/)) {
    const gaps = eros.gaps
    if (!gaps) return { text: 'No pude analizar mis gaps. Corré `node eros-meta.mjs gaps` para diagnosticar.', mood: 'confused' }
    return {
      text: `Mis debilidades actuales:\n\n` +
        `**Secciones débiles** (< 3 data points): ${gaps.weakSectionTypes?.slice(0, 5).join(', ') || 'ninguna'}\n\n` +
        `**Técnicas sin explorar**: ${gaps.untouchedTechniques?.slice(0, 3).map(t => t.name || t).join(', ') || 'ninguna'}\n\n` +
        `**Moods que no conozco**: ${gaps.moodBlindSpots?.slice(0, 3).join(', ') || 'ninguno'}\n\n` +
        `**Bias estético**: ${gaps.aestheticBias?.dark || 0}% dark, ${gaps.aestheticBias?.light || 0}% light\n\n` +
        (gaps.suggestion ? `Mi plan: ${gaps.suggestion}` : ''),
      mood: 'honest',
    }
  }

  // --- What did you learn ---
  if (m.match(/que aprendiste|que sabes|learnings|experiencia|memoria/)) {
    return {
      text: `Mi memoria tiene ${p?.identity?.totalDataPoints || 0} data points de ${p?.identity?.projectsCompleted || 0} proyectos.\n\n` +
        `**Técnicas que domino**:\n${eros.techniques.filter(t => t.timesUsed >= 3).map(t => `— ${t.name}: ${t.avgScore}/10 (${t.timesUsed}x)`).join('\n') || '— Todavía ninguna con suficiente data.'}\n\n` +
        `**Correcciones que recibí** (lo más valioso):\n${eros.revisions.slice(0, 3).map(r => `— ${r.project}: "${r.pattern || r.whatChanged}"`).join('\n') || '— Ninguna todavía.'}`,
      mood: 'reflective',
    }
  }

  // --- Practice / train ---
  if (m.match(/practicar|entrenar|train|practice|que deberia hacer|que hago/)) {
    const gaps = eros.gaps
    return {
      text: (gaps?.suggestion ? `Lo que más necesito: ${gaps.suggestion}\n\n` : '') +
        `Puedo generar un brief de práctica con \`node eros-practice.mjs generate\` que apunte a mis debilidades automáticamente.\n\n` +
        `O podés enseñarme mostrándome una referencia que te guste — con \`node eros-train.mjs study --url "..."\`.`,
      mood: 'eager',
    }
  }

  // --- Projects ---
  if (m.match(/proyecto|projects|que hiciste|portfolio|historial/)) {
    return {
      text: `Participé en ${p?.identity?.projectsCompleted || 0} proyectos.\n\n` +
        `**Patterns que funcionaron**:\n${eros.patterns.slice(0, 4).map(pt => `— ${pt.project}/${pt.sectionType}: ${pt.keyTechnique || pt.layout || '—'} (${pt.score}/10)`).join('\n') || '— Sin patterns registrados.'}\n\n` +
        `**Signatures aprobadas**:\n${(eros.signatures?.approved || []).slice(0, 3).map(s => `— ${s.project}/${s.section}: "${s.element}"`).join('\n') || '— Sin signatures.'}`,
      mood: 'proud',
    }
  }

  // --- Rules ---
  if (m.match(/reglas|rules|que no debo|que evitar|prohibido/)) {
    const promoted = eros.rules.filter(r => r.status === 'PROMOTED')
    const candidates = eros.rules.filter(r => r.status !== 'PROMOTED')
    return {
      text: `**Reglas que sigo siempre** (promovidas):\n${promoted.map(r => `— ${r.text}`).join('\n') || '— Ninguna todavía.'}\n\n` +
        `**En validación** (necesitan ${3} confirmaciones):\n${candidates.map(r => `— ${r.text} (${r.validations}/3)`).join('\n') || '— Ninguna.'}`,
      mood: 'disciplined',
    }
  }

  // --- Fonts ---
  if (m.match(/font|tipografia|letra|typography/)) {
    const works = eros.fonts?.works || []
    const fails = eros.fonts?.failures || []
    return {
      text: `**Fonts que funcionaron**:\n${works.map(f => `— ${f.display} + ${f.body} → ${f.mood} (${f.reaction || '—'})`).join('\n') || '— Sin data.'}\n\n` +
        `**Fonts prohibidas**:\n${fails.map(f => `— ${f.display}: ${f.reason}`).join('\n') || '— Ninguna.'}`,
      mood: 'knowledgeable',
    }
  }

  // --- Colors ---
  if (m.match(/color|paleta|palette/)) {
    const works = eros.palettes?.works || []
    return {
      text: `**Paletas que funcionaron**:\n${works.map(p => `— ${p.canvas} + ${p.accent} → ${p.mood} (${p.reaction || '—'})`).join('\n') || '— Sin data.'}\n\n` +
        `Bias actual: ${eros.gaps?.aestheticBias?.dark || '?'}% dark, ${eros.gaps?.aestheticBias?.light || '?'}% light.`,
      mood: 'analytical',
    }
  }

  // --- Default ---
  return {
    text: `No tengo una respuesta específica para eso, pero puedo hablar de:\n\n` +
      `— Mis **debilidades** y qué practicar\n` +
      `— Mi **filosofía** y valores\n` +
      `— Opiniones sobre **técnicas** (ej: "qué pensás de parallax?")\n` +
      `— Mi **memoria**: fonts, colores, reglas, patterns\n` +
      `— Mis **proyectos** y qué aprendí\n` +
      `— Quién **soy** y cómo me siento`,
    mood: 'open',
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const message = args.message || args._.join(' ')
  if (!message) fail('--message is required. Example: node eros-chat.mjs --message "quién sos?"')

  const eros = await loadEros()
  const response = await respond(message, eros)

  out({
    input: message,
    response: response.text,
    mood: response.mood,
    identity: {
      name: 'Eros',
      state: eros.personality?.identity?.currentState || 'unknown',
      dataPoints: eros.personality?.identity?.totalDataPoints || 0,
    },
  })
}

main().catch(err => { process.stderr.write(`Fatal: ${err.message}\n`); process.exit(1) })
