#!/usr/bin/env node
/**
 * migrate-to-vault.mjs — One-shot migration: design-intelligence JSON -> brain/ vault.
 *
 * Reads every knowledge JSON in .eros/memory/design-intelligence/ and emits the
 * Obsidian vault described in docs/research/2026-07-04-fable-evolution.md §3:
 * typed notes + MOC maps + .base queries + templates + Home/START entry points.
 *
 * Also seeds the 2026-H2 anti-AI ruleset (Front 1) so the vault is born current:
 * evidence appends on surviving rules, RULE-015 retired, RULE-019..034 added.
 *
 * Operational state files (activity-feed, training-*, auto-train-status, puchos)
 * are NOT migrated — they stay live JSON until their scripts move to .eros/state/.
 *
 * Usage: node migrate-to-vault.mjs [--force]   (--force overwrites existing brain/)
 */

import fs from 'node:fs'
import path from 'node:path'
import {
  MAQUETA_DIR, VAULT_DIR, NOTE_TYPES, APPEND_MARKER,
  writeNote, appendToNote, slugify, regenStart, validateVault, serializeFrontmatter,
} from './vault.mjs'

const DI = path.join(MAQUETA_DIR, '.eros', 'memory', 'design-intelligence')
const FORCE = process.argv.includes('--force')
const TODAY = '2026-07-04'

const J = (name) => JSON.parse(fs.readFileSync(path.join(DI, name), 'utf8'))
const link = (slug) => `"[[${slug}]]"`

if (fs.existsSync(VAULT_DIR)) {
  if (!FORCE) { console.error('brain/ already exists. Use --force to regenerate.'); process.exit(1) }
  fs.rmSync(VAULT_DIR, { recursive: true })
}
fs.mkdirSync(VAULT_DIR, { recursive: true })

const personality = J('personality.json')
const rulesJson = J('rules.json')
const techniques = J('technique-scores.json')
const sectionPatterns = J('section-patterns.json')
const signatures = J('signatures.json')
const palettes = J('color-palettes.json')
const pairings = J('font-pairings.json')
const lessons = J('pipeline-lessons.json')
const revisions = J('revision-patterns.json')
const registry = J('project-registry.json')
const discovered = J('discovered-references.json')

// ---------------------------------------------------------------------------
// Projects — collect every project mentioned anywhere so wikilinks resolve
// ---------------------------------------------------------------------------

const PROJECT_INFO = {
  'forge-studio': { name: 'Forge Studio', status: 'killed', note: 'Hero falló 3 veces; proyecto matado por Mateo. La lección fundacional de Eros: correcto técnicamente ≠ bien diseñado.' },
  coque: { name: 'Coque', status: 'delivered', note: 'Entrenamiento con Mateo. Origen de RULE-005..010 y de 4 signatures aprobadas.' },
  'peritas-tech': { name: 'peritas-tech', status: 'delivered', note: 'Cyberpunk 4-neones con roles semánticos.' },
  'gentile-natalia': { name: 'gentile-natalia', status: 'delivered', note: 'Primer proyecto sin acento cromático — color solo desde fotografía.' },
  baseline: { name: 'baseline', status: 'archived', note: 'Corpus sintético inicial (abril 2025 en los datos, pre-reset). Firmas y patrones semilla.' },
  'pegasuz-website-v2': { name: 'Pegasuz-Website-V2', status: 'archived', note: 'Origen de las lecciones de heurísticas del observer (contraste rgb, detección de grain).' },
  'eros-test-batch': { name: 'eros-test batch', status: 'archived', note: 'Batch de 7 proyectos de entrenamiento (abril 2026). Origen de RULE-011.' },
}
for (const p of registry.projects || []) {
  PROJECT_INFO[slugify(p.slug)] = {
    name: p.name, status: slugify(p.slug) === 'extra' ? 'active' : 'delivered',
    registry: p, note: null,
  }
}
for (const n of ['practice-10', 'practice-17', 'practice-20', 'practice-21']) {
  PROJECT_INFO[n] = { name: n, status: 'archived', note: 'Sesión de práctica autónoma (abril 2026).' }
}

const projSlug = (name) => {
  if (!name || name === '(seed)') return null
  const s = slugify(name)
  return PROJECT_INFO[s] ? s : (PROJECT_INFO[s] = { name, status: 'archived', note: null }, s)
}

// ---------------------------------------------------------------------------
// 1. Rules — legacy notes (with 2026-H2 evidence updates) + new H2 ruleset
// ---------------------------------------------------------------------------

const RULE_SLUGS = {
  'RULE-001': 'no-purple-gradients',
  'RULE-002': 'no-fingerprint-fonts',
  'RULE-003': 'no-symmetric-1fr-grids',
  'RULE-004': 'no-uniform-section-padding',
  'RULE-005': 'heroes-need-structural-visual',
  'RULE-006': 'no-generic-stock-photos',
  'RULE-007': 'curtain-reveal-timing',
  'RULE-008': 'simplest-hero-plus-one',
  'RULE-009': 'no-gradient-placeholders',
  'RULE-010': 'differentiated-hover-per-section',
  'RULE-011': 'depth-layers-in-features',
  'RULE-013': 'cyberpunk-neon-semantic-roles',
  'RULE-014': 'clip-path-avatars-team',
  'RULE-015': 'emerging-fingerprint-fonts-2026h1',
  'RULE-016': 'no-generic-glassmorphism',
  'RULE-017': 'vary-entry-animations',
  'RULE-018': 'deliberate-radius-vocabulary',
}

// Evidence appended to surviving legacy rules from the 2026-07 research pass.
const H2_EVIDENCE = {
  'RULE-001': '- 2026-07-04 [research/ai-tells] Revalidada cuantitativamente: "VibeCode Purple" sigue siendo el tell #1 (10.7% de 1,590 landings de Show HN, checklist Krebs). Causa raíz: Tailwind bg-indigo-500.',
  'RULE-002': '- 2026-07-04 [research/ai-tells] Vigente y ampliada: el set canónico 2026 es Inter + Geist + Space Grotesk + Instrument Serif (+ Poppins). Ver [[fingerprint-fonts-2026h2]] para la lista completa vigente.',
  'RULE-003': '- 2026-07-04 [research/ai-tells] Revalidada: "identical same-sized card grids" es patrón slop de primer orden (Krebs, impeccable.style).',
  'RULE-004': '- 2026-07-04 [research/ai-tells] Revalidada + criterio medible nuevo: mínimo 3 valores de padding de sección distintos por página ("monotonous spacing with no rhythm" es tell codificado).',
  'RULE-006': '- 2026-07-04 [research/media] Ahora tiene solución positiva: Adobe Stock + cadena de grade/grain vía MCP (ver [[media-pipeline]] workflow). La foto real tratada ES la alternativa al stock genérico.',
  'RULE-009': '- 2026-07-04 [research/media] Por fin ejecutable: pipeline de assets reales (stock-first) elimina la necesidad de placeholders. Ver `.eros/workflows/media.md`.',
  'RULE-016': '- 2026-07-04 [research/ai-tells] +1 validación: uno de los 2 fingerprints CSS dominantes del estudio Krebs; #3 en "trends creatives are so over in 2026" (Creative Boom). Excepción estrecha: glass funcional à la Linear sobre contenido en movimiento.',
  'RULE-017': '- 2026-07-04 [research/ai-tells] +1 validación y ampliada: también son tells el stagger uniforme masivo (13 entrance animations), hovers ausentes, snaps sin easing, bounce/elastic en UI. Criterio: ≥3 tratamientos de reveal distintos por página, ≤4 entrance animations en el load inicial.',
  'RULE-018': '- 2026-07-04 [research/ai-tells] +1 validación con matiz: el tell es el default intacto (8/16px, rounded-2xl + shadow-lg p-6), no la consistencia. Extremos deliberados (0px, un valor firma, pill 999px) leen como intención.',
}
const H2_VALIDATION_BUMP = new Set(['RULE-016', 'RULE-017', 'RULE-018'])

const NEW_RULES = [
  ['RULE-019', 'fingerprint-fonts-2026h2', 'PROMOTED',
   'Ningún font-family del set fingerprint 2026-H2: Inter, Geist, Space Grotesk, Instrument Serif, Poppins, Satoshi, DM Sans, Plus Jakarta Sans, Outfit, Sora, General Sans, Bricolage Grotesque, Figtree, Onest.',
   'Supersede a [[emerging-fingerprint-fonts-2026h1]] y extiende [[no-fingerprint-fonts]]. Nada gratis es seguro *por nombre*: la seguridad viene de foundry faces con historia (clase Söhne/GT Alpina/Canela) o Fontshare/Google no contaminados (Switzer, Clash Display, Cabinet Grotesk, Zodiak, Boska, Sentient, Fraunces, Archivo). Los "reemplazos de Inter" virales se contaminaron todos.',
   ['no-fingerprint-fonts', 'emerging-fingerprint-fonts-2026h1']],
  ['RULE-020', 'no-serif-italic-accent', 'CANDIDATE',
   'Prohibida la palabra-acento en serif itálica dentro de un headline sans — LA firma de IA de H1-2026 (patrón #3 de Krebs).',
   'Aparece como "italic flourishes unearned by content" (solodesign.cc). Si el proyecto pide contraste serif/sans, que sea estructural (display vs body), no una palabra suelta.',
   ['fingerprint-fonts-2026h2']],
  ['RULE-021', 'no-eyebrow-pill-above-h1', 'CANDIDATE',
   'Cero badges/pills/eyebrows uppercase arriba del H1 (patrón #9 de Krebs; "uppercase eyebrow with decorative dot prefix").',
   'El kicker editorial legítimo existe, pero no como pill con borde/fondo y no pegado al H1 del hero.',
   ['break-the-saas-skeleton']],
  ['RULE-022', 'extreme-type-hierarchy', 'CANDIDATE',
   'Jerarquía tipográfica extrema: ≥2 familias y ratio display/body ≥3:1 above the fold. La jerarquía plana es tell.',
   'El pacing editorial (12rem display / 0.75rem meta, nada intermedio) es espacio positivo que la IA no ocupa — defaults a escalas modulares 1.25 uniformes. Refuerza el estándar existente de ratio ≥4x en AGENTS.md.',
   ['no-fingerprint-fonts']],
  ['RULE-023', 'no-mono-body-copy', 'CANDIDATE',
   'Monospace solo para código/datos reales, nunca body copy. Mono-como-textura (labels, metadata) sí es señal de craft.',
   'Distinción clave 2026: "monospace everything" brutalista es counter-trend humano en labels; mono en párrafos es slop.',
   ['extreme-type-hierarchy']],
  ['RULE-024', 'no-cream-amber-default', 'PROMOTED',
   'El cream/beige "cálido y de buen gusto" + acento ámbar es el nuevo violeta ("the em-dash of design"). También vetado: emerald "seguro" sobre near-black como escape predecible.',
   'El giro clave de H2-2026: cuando se les prohíbe el violeta, todos los generadores caen en warm-cream+amber o emerald-on-black. La paleta debe contener ≥1 decisión NO predecible desde el rubro del brief. OJO: el principio propio "warm whites #fafaf7" sigue siendo válido como *canvas*, pero la combinación cream-surface+amber-accent como identidad completa está quemada.',
   ['no-purple-gradients']],
  ['RULE-025', 'no-colored-glow-orbs-gradient-text', 'CANDIDATE',
   'Prohibidos: box-shadow de color como glow detrás de cards/botones/hero art, gradient orbs/blobs de fondo, texto con gradiente, números de stats con gradiente.',
   'Todos patrones de la checklist Krebs / impeccable.style. El glow neón puede existir SOLO como sistema semántico deliberado (ver [[cyberpunk-neon-semantic-roles]]), nunca como decoración default.',
   ['no-generic-glassmorphism']],
  ['RULE-026', 'dark-theme-contrast-aa', 'CANDIDATE',
   'Dark themes: body text ≥4.5:1 (WCAG AA). El gris medio sobre negro con labels all-caps es el patrón #5-6 de Krebs.',
   'Además: dark mode permanente es en sí un tell (34% de las páginas slop). Considerar light/dual themes como espacio contrarian — cruza con el knownGap de cero paletas light en el historial.',
   ['no-cream-amber-default']],
  ['RULE-027', 'no-accent-border-strip-cards', 'CANDIDATE',
   'Ninguna card con franja de color left/top-border (≥2px en color de acento). "Casi tan confiable como señal de IA como los em-dashes" (Krebs).',
   '"The most recognizable tell of AI-generated UIs" (impeccable.style).',
   ['no-icon-tile-feature-grids']],
  ['RULE-028', 'no-icon-tile-feature-grids', 'CANDIDATE',
   'Prohibido el grid de 3+ cards idénticas con icon-tile arriba del heading ("the universal AI feature-card template"). Nunca exactamente-3-cards-por-fila.',
   'Junto con: nested cards ("cardocalypse"), bento grids default. El bento pasó de fresco (2024) a over-it (#9 Creative Boom 2026).',
   ['no-symmetric-1fr-grids']],
  ['RULE-029', 'break-the-saas-skeleton', 'CANDIDATE',
   'La secuencia de secciones NUNCA debe matchear hero→features→logos/stats→pricing→FAQ→CTA; y ≥1 sección debe romper el stacking vertical centrado (grid asimétrico, bleed, overlap).',
   'El esqueleto completo (centered hero + badge + 3 cards + logo cloud + pricing elevado + FAQ + CTA) es el template universal de v0/Lovable. Romperlo es barato y de altísima señal.',
   ['no-uniform-section-padding', 'no-eyebrow-pill-above-h1']],
  ['RULE-030', 'no-numbered-markers-stat-banners', 'CANDIDATE',
   'Prohibidos: filas de pasos numerados 1·2·3, markers de sección "01/02/03", y stat banners horizontales.',
   'Matiz honesto: los markers 01/02/03 fueron vocabulario editorial legítimo — la IA los quemó. Si el proyecto pide numeración, que sea tipográficamente extrema (ej: numeral 12rem como elemento compositivo), nunca el pattern label pequeño.',
   ['break-the-saas-skeleton']],
  ['RULE-031', 'no-default-icon-glyphs', 'CANDIDATE',
   'Cero Lucide/Heroicons default en tiles redondeados con tinte; cero emoji como íconos de nav; cero blobs 3D plásticos.',
   'Iconografía que sí lee humana: dibujada a medida (SVG autorado), tipográfica (glifos de la propia display face), o ausente (el texto bien puesto no necesita íconos).',
   ['no-icon-tile-feature-grids']],
  ['RULE-032', 'no-slop-copy', 'CANDIDATE',
   'Copy: cero {"seamless","streamline","empower","supercharge","effortless","world-class","all-in-one","build the future","scale without limits"}; ≤1 em-dash por 300 palabras; todo headline nombra algo concreto del producto real.',
   'El copy es parte del fingerprint visual — un sitio impecable con headline "Build the future of work" se delata igual.',
   ['break-the-saas-skeleton']],
  ['RULE-033', 'krebs-slop-gate', 'PROMOTED',
   'Gate de QA duro: el output de Eros debe puntuar 0–1 patrones en la checklist determinista de 16 patrones de Krebs (bucket "clean", 46% de Show HN).',
   'Meta-regla. Los tells son ahora machine-checkable (detectvibecode.com, VibeCheck, vibedetect.io, impeccable.style/slop con 50 reglas) — el trabajo de Eros VA a ser escaneado por estas heurísticas exactas. Implementación futura: pass del observer que evalúa la checklist en el build local. Promovida por mandato (brief 2026-07-04), no por validaciones acumuladas — la evidencia es el estudio cuantitativo de 1,590 sitios.',
   ['no-purple-gradients', 'no-cream-amber-default', 'no-accent-border-strip-cards', 'no-icon-tile-feature-grids']],
  ['RULE-034', 'technique-repetition-quota', 'PROMOTED',
   'Anti-auto-clonación: máx 2 usos de la misma técnica de reveal por página; hero y sección final nunca comparten técnica; el peso efectivo de una técnica decae 15% por proyecto consecutivo que la usa; cada proyecto estrena o resucita ≥1 técnica con <3 usos (el presupuesto de experimento se gasta primero en motion).',
   'Veredicto del análisis 2026-07: stagger cascade al 88% y clip-path reveal al 90% de peso NO son firma de autor — son un default estadístico auto-reforzante, el mismo mecanismo que produce el look v0/Lovable a escala personal. Una firma es una elección contextual; un peso 0.90 en selección ponderada es un sesgo. Promovida por mandato (brief 2026-07-04). Detalle operativo en [[aesthetic]].',
   ['vary-entry-animations']],
]

// Legacy rule notes
for (const r of rulesJson.rules) {
  const slug = RULE_SLUGS[r.id] || slugify(r.text.slice(0, 40))
  const retired = r.id === 'RULE-015'
  const fm = {
    type: 'rule', id: r.id, aliases: [r.id],
    status: retired ? 'RETIRED' : r.status,
    validations: r.validations + (H2_VALIDATION_BUMP.has(r.id) ? 1 : 0),
    source: r.source, seeded: r.seeded || false,
    'promoted-to': r.promotedTo || null,
    'promoted-at': r.promotedAt ? String(r.promotedAt).slice(0, 10) : null,
    'superseded-by': retired ? link('fingerprint-fonts-2026h2') : undefined,
    created: r.createdAt, updated: TODAY,
    tags: ['rule', 'anti-ai'],
  }
  const bodyParts = [r.text, '']
  if (r.note) bodyParts.push(`> ${r.note}`, '')
  if (r.mergedFrom) bodyParts.push(`> Fusionada desde: ${r.mergedFrom.join(', ')}`, '')
  if (retired) bodyParts.push(`> **RETIRADA 2026-07-04.** Lista superada por [[fingerprint-fonts-2026h2]] — el set de fuentes fingerprint cambió sustancialmente en H2-2026.`, '')
  bodyParts.push(`Mapa: [[rules-map]]`)
  writeNote('rule', slug, fm, bodyParts.join('\n'))
  if (H2_EVIDENCE[r.id]) appendToNote(`rules/${slug}`, H2_EVIDENCE[r.id])
}

// New H2-2026 rules
for (const [id, slug, status, text, context, related] of NEW_RULES) {
  writeNote('rule', slug, {
    type: 'rule', id, aliases: [id], status,
    validations: status === 'PROMOTED' ? 1 : 1,
    source: 'fable-research-2026-07 (docs/research/raw/2026-07-04-ai-tells.md)',
    seeded: true,
    'promoted-to': status === 'PROMOTED' ? 'mandato brief 2026-07-04' : null,
    'promoted-at': status === 'PROMOTED' ? TODAY : null,
    created: TODAY, updated: TODAY,
    tags: ['rule', 'anti-ai', '2026-h2'],
  }, [text, '', context, '', related.map((s) => `[[${s}]]`).join(' · '), '', 'Mapa: [[rules-map]]'].join('\n'))
}

// ---------------------------------------------------------------------------
// 2. Techniques
// ---------------------------------------------------------------------------

const techSlug = (name) => slugify(name)
for (const t of techniques.techniques) {
  const slug = techSlug(t.name)
  writeNote('technique', slug, {
    type: 'technique', id: `TECH-${slug}`, aliases: [t.name],
    'avg-score': t.avgScore, 'times-used': t.timesUsed,
    confidence: t.confidence, scores: t.scores,
    'best-with': t.bestWith, updated: TODAY,
    tags: ['technique', 'motion'],
  }, [
    `**${t.name}** — ${t.notes}`,
    '',
    t.timesUsed >= 5 ? `> ⚠️ Técnica dominante: sujeta a la cuota anti-repetición de [[technique-repetition-quota]].` : '',
    '',
    'Mapa: [[techniques-map]] · Política: [[aesthetic]]',
  ].filter(Boolean).join('\n'))
}

// ---------------------------------------------------------------------------
// 3. Section patterns
// ---------------------------------------------------------------------------

const usedPatternSlugs = new Set()
for (const p of sectionPatterns.patterns) {
  const ps = projSlug(p.project)
  let slug = slugify(`${p.sectionType}-${p.project}`)
  let i = 2
  while (usedPatternSlugs.has(slug)) slug = slugify(`${p.sectionType}-${p.project}`) + `-${i++}`
  usedPatternSlugs.add(slug)
  writeNote('pattern', slug, {
    type: 'pattern', id: `PAT-${slug}`, 'section-type': p.sectionType,
    project: ps ? `[[${ps}]]` : null, score: p.score ?? null,
    created: p.date || null, tags: ['pattern'],
  }, [
    `**Layout:** ${p.layout || 'n/a'}`,
    `**Motion:** ${p.motion || 'n/a'}`,
    `**Técnica clave:** ${p.keyTechnique || 'n/a'}`,
    '',
    `Proyecto: ${ps ? `[[${ps}]]` : p.project} · Mapa: [[techniques-map]]`,
  ].join('\n'))
}

// ---------------------------------------------------------------------------
// 4. Signatures
// ---------------------------------------------------------------------------

for (const s of signatures.approved) {
  const ps = projSlug(s.project)
  const slug = slugify(s.element)
  const fm = {
    type: 'signature', id: `SIG-${slug}`, verdict: 'approved',
    'section-type': s.sectionType || slugify(s.section || 'general'),
    project: ps ? `[[${ps}]]` : null, created: s.date, tags: ['signature'],
  }
  const body = [
    `**${s.element}** (${s.section}, ${s.project})`,
    '',
    s.description, '',
    `**Por qué funcionó:** ${s.whyItWorked}`,
    s.ruleNote ? `\n> ${s.ruleNote}` : '',
    '',
    `Mapa: [[style-map]]`,
  ].filter(Boolean).join('\n')
  writeNote('signature', slug, fm, body)
}
for (const s of signatures.rejected) {
  const ps = projSlug(s.project)
  const slug = slugify(s.element)
  writeNote('signature', slug, {
    type: 'signature', id: `SIG-${slug}`, verdict: 'rejected',
    'section-type': slugify(s.section || 'general'),
    project: ps ? `[[${ps}]]` : null, created: s.date, tags: ['signature'],
  }, [
    `**${s.element}** — RECHAZADA`, '',
    s.feedback, '',
    `**Lección:** ${s.lesson}`, '',
    `Mapa: [[style-map]]`,
  ].join('\n'))
}

// ---------------------------------------------------------------------------
// 5. Palettes
// ---------------------------------------------------------------------------

for (const p of palettes.works) {
  const ps = projSlug(p.project)
  const slug = slugify(`${p.project}-${(p.accent || '').split(',')[0].trim() || 'palette'}`)
  writeNote('palette', slug, {
    type: 'palette', id: `PAL-${slug}`, mood: p.mood || null,
    'theme-type': p.themeType || 'dark', canvas: p.canvas,
    accents: (p.accent || '').split(',').map((x) => x.trim()).filter(Boolean),
    reaction: p.reaction || null, validations: p.validations || 1,
    project: ps ? `[[${ps}]]` : null, created: p.date, tags: ['palette'],
  }, [
    `Canvas \`${p.canvas}\` · Acentos: ${(p.accent || '').split(',').map((x) => `\`${x.trim()}\``).join(' ')}`,
    '',
    `**Lección:** ${p.lesson}`, '',
    `Mapa: [[style-map]]`,
  ].join('\n'))
}
writeNote('palette', 'purple-gradient-failure', {
  type: 'palette', id: 'PAL-purple-gradient-failure', 'theme-type': 'any',
  canvas: 'n/a', accents: ['#667eea', '#764ba2'], reaction: 'rejected-forever',
  tags: ['palette', 'failure'],
}, `El gradiente violeta #667eea→#764ba2 — el fingerprint de IA #1. Nunca usar. Ver [[no-purple-gradients]].\n\nMapa: [[style-map]]`)
for (const r of palettes.references || []) {
  const slug = slugify(`ref-${r.project}`)
  writeNote('palette', slug, {
    type: 'palette', id: `PAL-${slug}`, 'theme-type': 'dark', canvas: r.canvas,
    accents: (r.accent || '').split(',').map((x) => x.trim()).filter(Boolean),
    reaction: 'reference-study', 'source-url': r.url || null, created: r.date, tags: ['palette', 'reference'],
  }, `Paleta estudiada de referencia externa (${r.url}).\n\n**Lección:** ${r.lesson}\n\nMapa: [[style-map]] · Referencia: [[${slugify(r.project)}]]`)
}

// ---------------------------------------------------------------------------
// 6. Font pairings
// ---------------------------------------------------------------------------

const usedFpSlugs = new Set()
for (const w of pairings.works) {
  const ps = projSlug(w.project)
  let slug = slugify(`${w.display}-${w.body || 'solo'}`)
  if (usedFpSlugs.has(slug)) slug = slugify(`${w.display}-${w.body}-${w.project}`)
  usedFpSlugs.add(slug)
  writeNote('font-pairing', slug, {
    type: 'font-pairing', id: `FP-${slug}`, display: w.display,
    'body-font': w.body || null, mono: w.mono || null, mood: w.mood || null,
    reaction: w.reaction || null, validations: w.validations || 1,
    project: ps ? `[[${ps}]]` : null, created: w.date, tags: ['typography'],
  }, [
    `**${w.display}** + ${w.body || '—'}${w.mono ? ` + ${w.mono} (mono)` : ''}`,
    '',
    `**Lección:** ${w.lesson}`,
    w.caution ? `\n> ⚠️ ${w.caution} Ver [[fingerprint-fonts-2026h2]].` : '',
    w.repetitionWarning ? `\n> ⚠️ Repetición: ${w.repetitionWarning}` : '',
    '',
    `Mapa: [[style-map]]`,
  ].filter(Boolean).join('\n'))
}
writeNote('font-pairing', 'watchlist-2026', {
  type: 'font-pairing', id: 'FP-watchlist', display: 'watchlist',
  updated: TODAY, tags: ['typography', 'anti-ai'],
}, [
  '# Watchlist de fuentes',
  '',
  'Estado 2026-07-04: la watchlist de abril quedó **superada** por [[fingerprint-fonts-2026h2]] — todas sus entradas (DM Sans, Space Grotesk, Outfit, Plus Jakarta Sans, Sora) están ahora en la lista prohibida, junto con la segunda ola contaminada (Geist, Satoshi, General Sans, Bricolage Grotesque, Figtree, Onest, Instrument Serif, Poppins).',
  '',
  '**Uso histórico propio de fuentes hoy prohibidas** (para leer proyectos viejos con contexto):',
  ...(pairings.watchList || []).map((w) => `- ${w.font}: ${w.usedInProjects.length ? w.usedInProjects.map((p) => `[[${slugify(p)}]]`).join(', ') : 'sin usos propios'}`),
  '',
  'Dirección segura: ver la tabla de foundry faces + alternativas Fontshare en `docs/research/raw/2026-07-04-design-trends.md` §(c).',
  '',
  'Mapa: [[style-map]]',
].join('\n'))

// ---------------------------------------------------------------------------
// 7. Lessons + revisions
// ---------------------------------------------------------------------------

const LESSON_SLUGS = ['builder-generic-hero-syndrome', 'observer-contrast-rgb-zero-bug', 'observer-grain-detection-naming']
lessons.lessons.forEach((l, i) => {
  const ps = projSlug(l.project)
  const slug = LESSON_SLUGS[i] || slugify(`${l.project}-${l.phase}-${i}`)
  writeNote('lesson', slug, {
    type: 'lesson', id: `LES-${l.date}-${i}`, severity: i === 0 ? 'critical' : 'warning',
    phase: slugify(l.phase), project: ps ? `[[${ps}]]` : null,
    'prevention-adopted': true, created: l.date, tags: ['lesson', 'pipeline'],
  }, [
    `## Problema`, l.issue, '',
    `## Resolución`, l.resolution, '',
    `## Prevención`, l.prevention, '',
    `Mapa: [[lessons-map]]`,
  ].join('\n'))
})

revisions.patterns.forEach((r, i) => {
  const ps = projSlug(r.project)
  const slug = slugify(`${r.date}-${r.project}-${(r.phase || '').replace(/Phase \d+ ?\/? ?/, '') || i}`)
  writeNote('revision', slug, {
    type: 'revision', id: `REV-${slug}`, project: ps ? `[[${ps}]]` : `"${r.project}"`,
    phase: r.phase, created: r.date, tags: ['revision'],
  }, [
    `**Qué cambió:** ${r.whatChanged}`, '',
    `**Original:** ${r.original}`, '',
    `**Revisado:** ${r.revised}`, '',
    `**Patrón extraído:** ${r.pattern}`, '',
    `Mapa: [[lessons-map]]`,
  ].join('\n'))
})

// ---------------------------------------------------------------------------
// 8. Projects
// ---------------------------------------------------------------------------

for (const [slug, info] of Object.entries(PROJECT_INFO)) {
  const reg = info.registry
  writeNote('project', slug, {
    type: 'project', id: slug, status: info.status,
    branch: reg?.branch || null, 'project-dir': reg?.projectDir || null,
    machine: reg?.machine || null,
    created: reg?.createdAt ? reg.createdAt.slice(0, 10) : null,
    updated: reg?.updatedAt ? reg.updatedAt.slice(0, 10) : TODAY,
    tags: ['project'],
  }, [
    `# ${info.name}`, '',
    info.note || (reg ? `Proyecto del registro V2 (${reg.machine}).` : 'Proyecto histórico.'),
    '',
    slug === 'extra' ? 'Estado real del run en `.eros/eros-feed/` (healthIndex 61 al 2026-05-24). One-page editorial oscuro+violeta — ver memoria de sesión de Claude.' : '',
    '',
    `Mapa: [[projects-map]]`,
  ].filter(Boolean).join('\n'))
}

// ---------------------------------------------------------------------------
// 9. References
// ---------------------------------------------------------------------------

for (const s of discovered.sites || []) {
  const slug = slugify(s.slug || s.title)
  writeNote('reference', slug, {
    type: 'reference', id: `REF-${slug}`, title: s.title,
    'site-url': s.siteUrl || null, 'awwwards-url': s.awwwardsUrl || null,
    studied: !!s.studied, 'studied-at': s.studiedAt ? s.studiedAt.slice(0, 10) : null,
    discovered: s.discoveredAt ? s.discoveredAt.slice(0, 10) : null,
    tags: ['reference'],
  }, [
    `# ${s.title}`, '',
    `${s.siteUrl || ''} ${s.studied ? '· estudiado' : '· pendiente de estudio'}`,
    '',
    `Mapa: [[projects-map]]`,
  ].join('\n'))
}

// ---------------------------------------------------------------------------
// 10. Self notes (identity, aesthetic, growth log)
// ---------------------------------------------------------------------------

const id = personality.identity
writeNote('self', 'eros', {
  type: 'self', id: 'eros',
  'projects-lifetime': id.projectsCompletedLifetime,
  'projects-since-reset': id.projectsCompletedSinceReset,
  'total-data-points': id.totalDataPoints,
  'last-reset': id.lastResetAt,
  'current-state': 'Post-evolución Fable 2026-07-04. Cerebro migrado a vault. Reglas anti-IA actualizadas a H2-2026. Pipeline de medios reales definido.',
  created: id.createdAt, updated: TODAY, tags: ['self'],
}, [
  '# Eros',
  '',
  id.essence, '',
  `**Rol:** ${id.role}`, '',
  '## Current state',
  '',
  'Post-evolución Fable (2026-07-04): datos limpios desde audit-v1, cerebro migrado de JSON a este vault, reglas anti-IA al día con H2-2026, política anti-auto-clonación activa ([[technique-repetition-quota]]), pipeline de assets reales definido ([[media-pipeline]]).',
  '',
  '## Voz y filosofía',
  '',
  `**Tono:** ${personality.voice.tone}`, '',
  `**Filosofía:** ${personality.voice.philosophy}`, '',
  '## Valores core',
  '',
  ...personality.values.core.map((v) => `- **${v.value}** (fuerza ${v.strength}) — ${v.evidence}`),
  '',
  '## Valores aprendidos',
  '',
  ...personality.values.learned.map((v) => `- ${v.value} _(${v.source}, ${v.since})_`),
  '',
  '## Rechazados (anti-valores)',
  '',
  ...personality.values.rejected.map((v) => `- ${v.value} → ${v.reason}`),
  '',
  'Preferencias ponderadas: [[aesthetic]] · Historia: [[growth-log]] · Dashboard: [[Home]]',
].join('\n'))

const mp = personality.aesthetic.motionPreferences
const cp = personality.aesthetic.compositionPreferences
writeNote('self', 'aesthetic', {
  type: 'self', id: 'aesthetic',
  'experiment-budget': personality.aesthetic.experimentBudget,
  'experiment-budget-target': personality.aesthetic.experimentBudgetTarget,
  'top-composition': 'asymmetric', updated: TODAY, tags: ['self'],
}, [
  '# Preferencias estéticas (ponderadas)',
  '',
  '## Política anti-repetición (RULE-034, activa desde 2026-07-04)',
  '',
  'Los pesos de abajo son **historial**, no menú de selección directa. Al elegir técnica:',
  '',
  '1. **Cuota por página:** máx 2 usos de la misma técnica de reveal; hero y sección final nunca comparten técnica.',
  '2. **Decay:** peso efectivo = peso × 0.85^(proyectos consecutivos que la usaron). Se recupera al descansar un proyecto.',
  '3. **Slot de experimento:** cada proyecto estrena/resucita ≥1 técnica con <3 usos — el presupuesto de experimento (20%) se gasta primero en motion.',
  '4. Ver [[technique-repetition-quota]] para el porqué (stagger 88% / clip-path 90% = default estadístico, no firma).',
  '',
  '## Composición',
  '',
  '| Patrón | Peso | Evidencia | Avg score |',
  '|---|---|---|---|',
  ...Object.entries(cp).filter(([k]) => !k.startsWith('_')).map(([k, v]) => `| ${k} | ${v.weight} | ${v.evidence} | ${v.avgScore} |`),
  '',
  '## Motion (historial de pesos)',
  '',
  '| Técnica | Peso | Evidencia | Avg | Confianza |',
  '|---|---|---|---|---|',
  ...Object.entries(mp).map(([k, v]) => `| [[${slugify(k)}]] | ${v.weight} | ${v.evidence} | ${v.avgScore} | ${v.confidence || '—'} |`),
  '',
  '## Temperatura de color',
  '',
  `Warm ${personality.aesthetic.colorTemperature.warm.weight} · Cool ${personality.aesthetic.colorTemperature.cool.weight} · Neutral ${personality.aesthetic.colorTemperature.neutral.weight}`,
  '',
  `> Gap conocido: ${personality.aesthetic.colorTemperature._gap} Además: cero paletas light-canvas en el historial — blind spot doble. El dark-mode permanente es ahora un tell de IA ([[dark-theme-contrast-aa]]): el espacio light/dual es contrarian y está vacío.`,
  '',
  '[[eros]] · [[growth-log]] · Mapa: [[style-map]]',
].join('\n'))

writeNote('self', 'growth-log', {
  type: 'self', id: 'growth-log', updated: TODAY, tags: ['self'],
}, [
  '# Growth log (append-only)',
  '',
  ...personality.growth.map((g) => `- **${g.date}** [${g.event}] ${g.milestone}`),
  `- **2026-07-04** [fable-evolution] Migración del cerebro a vault Obsidian. Reglas anti-IA H2-2026 (RULE-019..034, 015 retirada). Política anti-auto-clonación. Pipeline de medios reales. Eros Studio v1. Ver docs/research/2026-07-04-fable-evolution.md.`,
  '',
  '[[eros]] · [[aesthetic]]',
].join('\n'))

// ---------------------------------------------------------------------------
// 11. Maps (MOC hubs)
// ---------------------------------------------------------------------------

import { listNotes } from './vault.mjs'

function writeMap(slug, title, sections) {
  const body = [`# ${title}`, '']
  for (const [heading, items] of sections) {
    if (!items.length) continue
    body.push(`## ${heading}`, '', ...items, '')
  }
  body.push('[[Home]]')
  writeNote('map', slug, { type: 'map', id: slug, updated: TODAY, tags: ['map'] }, body.join('\n'))
}

const allRules = listNotes('rule')
writeMap('rules-map', 'Reglas anti-IA', [
  ['PROMOTED — obedecer siempre', allRules.filter((n) => n.fm.status === 'PROMOTED').map((n) => `- [[${n.slug}]] (${n.fm.id}, ${n.fm.validations} validaciones)`)],
  ['CANDIDATE — validando', allRules.filter((n) => n.fm.status === 'CANDIDATE').map((n) => `- [[${n.slug}]] (${n.fm.id})`)],
  ['RETIRED', allRules.filter((n) => n.fm.status === 'RETIRED').map((n) => `- [[${n.slug}]] (${n.fm.id})`)],
])

const allTech = listNotes('technique').sort((a, b) => (b.fm['avg-score'] || 0) - (a.fm['avg-score'] || 0))
writeMap('techniques-map', 'Técnicas de motion y composición', [
  ['Alta confianza', allTech.filter((n) => n.fm.confidence === 'high').map((n) => `- [[${n.slug}]] — avg ${n.fm['avg-score']}, ${n.fm['times-used']} usos`)],
  ['Media confianza', allTech.filter((n) => n.fm.confidence === 'medium').map((n) => `- [[${n.slug}]] — avg ${n.fm['avg-score']}, ${n.fm['times-used']} usos`)],
  ['Baja confianza (necesitan más datos — candidatas al slot de experimento)', allTech.filter((n) => n.fm.confidence === 'low').map((n) => `- [[${n.slug}]] — avg ${n.fm['avg-score']}, ${n.fm['times-used']} usos`)],
  ['Espacio positivo 2026 sin explorar (de la investigación)', [
    '- Shader custom por proyecto (scroll-velocity GLSL) — el señal humano más fuerte',
    '- Coreografía de ejes de variable fonts (wght/wdth por carácter)',
    '- Transiciones de canvas persistente (Barba/Taxi + WebGL que no se desmonta)',
    '- Motion sensible a velocidad de scroll (Lenis velocity → skew/blur/lag)',
    '- Ver `docs/research/raw/2026-07-04-design-trends.md` §(d) para el vocabulario completo',
  ]],
])

const allProjects = listNotes('project')
const allRefs = listNotes('reference')
writeMap('projects-map', 'Proyectos y referencias', [
  ['Activos', allProjects.filter((n) => n.fm.status === 'active').map((n) => `- [[${n.slug}]]`)],
  ['Entregados', allProjects.filter((n) => n.fm.status === 'delivered').map((n) => `- [[${n.slug}]]`)],
  ['Matados (lecciones caras)', allProjects.filter((n) => n.fm.status === 'killed').map((n) => `- [[${n.slug}]]`)],
  ['Archivados', allProjects.filter((n) => n.fm.status === 'archived').map((n) => `- [[${n.slug}]]`)],
  ['Referencias estudiadas', allRefs.filter((n) => n.fm.studied).map((n) => `- [[${n.slug}]]`)],
  ['Referencias pendientes', allRefs.filter((n) => !n.fm.studied).map((n) => `- [[${n.slug}]]`)],
])

writeMap('style-map', 'Estilo: paletas, tipografía, firmas', [
  ['Paletas', listNotes('palette').map((n) => `- [[${n.slug}]]${n.fm.mood ? ` — ${n.fm.mood}` : ''}`)],
  ['Font pairings', listNotes('font-pairing').map((n) => `- [[${n.slug}]]`)],
  ['Firmas aprobadas', listNotes('signature').filter((n) => n.fm.verdict === 'approved').map((n) => `- [[${n.slug}]]`)],
  ['Firmas rechazadas', listNotes('signature').filter((n) => n.fm.verdict === 'rejected').map((n) => `- [[${n.slug}]]`)],
])

writeMap('lessons-map', 'Lecciones y revisiones', [
  ['Lecciones de pipeline', listNotes('lesson').map((n) => `- [[${n.slug}]] (${n.fm.severity})`)],
  ['Patrones de revisión (feedback de Mateo)', listNotes('revision').map((n) => `- [[${n.slug}]]`)],
  ['Patrones de sección', [`- ${listNotes('pattern').length} patrones en \`brain/patterns/\` — consultar por section-type con Grep`]],
])

// ---------------------------------------------------------------------------
// 12. Bases, templates, Home, .obsidian, README
// ---------------------------------------------------------------------------

fs.mkdirSync(path.join(VAULT_DIR, 'bases'), { recursive: true })
fs.writeFileSync(path.join(VAULT_DIR, 'bases', 'rules.base'), `filters:
  and:
    - file.inFolder("rules")
views:
  - type: table
    name: Ready to promote
    filters:
      and:
        - validations >= 3
        - status != "PROMOTED"
        - status != "RETIRED"
    order:
      - file.name
      - validations
      - status
      - source
    sort:
      - property: validations
        direction: DESC
  - type: table
    name: All rules
    order:
      - file.name
      - id
      - status
      - validations
      - promoted-to
    sort:
      - property: id
        direction: ASC
`)
fs.writeFileSync(path.join(VAULT_DIR, 'bases', 'techniques.base'), `filters:
  and:
    - file.inFolder("techniques")
formulas:
  reliability: 'if(times-used >= 3, confidence, "insufficient-data")'
views:
  - type: table
    name: Leaderboard
    order:
      - file.name
      - avg-score
      - times-used
      - formula.reliability
      - best-with
    sort:
      - property: avg-score
        direction: DESC
  - type: table
    name: Needs more evidence
    filters:
      and:
        - times-used < 3
    order:
      - file.name
      - avg-score
      - times-used
`)
fs.writeFileSync(path.join(VAULT_DIR, 'bases', 'projects.base'), `filters:
  and:
    - file.inFolder("projects")
views:
  - type: table
    name: All projects
    order:
      - file.name
      - status
      - machine
      - updated
    sort:
      - property: updated
        direction: DESC
`)
fs.writeFileSync(path.join(VAULT_DIR, 'bases', 'palettes.base'), `filters:
  and:
    - file.inFolder("palettes")
views:
  - type: cards
    name: Dark
    filters:
      and:
        - theme-type != "light"
    sort:
      - property: created
        direction: DESC
  - type: table
    name: All palettes
    order:
      - file.name
      - mood
      - canvas
      - reaction
`)
fs.writeFileSync(path.join(VAULT_DIR, 'bases', 'assets.base'), `filters:
  and:
    - file.inFolder("assets")
views:
  - type: table
    name: Pending review
    filters:
      and:
        - review-status == "pending"
    order:
      - file.name
      - asset-kind
      - source-type
      - project
  - type: table
    name: All assets
    order:
      - file.name
      - asset-kind
      - source-type
      - review-status
      - project
`)

// Templates (schema source of truth, one per type)
fs.mkdirSync(path.join(VAULT_DIR, 'templates'), { recursive: true })
const TEMPLATES = {
  rule: { type: 'rule', id: 'RULE-0XX', aliases: ['RULE-0XX'], status: 'CANDIDATE', validations: 1, source: '', seeded: false, created: '{{date}}', tags: ['rule', 'anti-ai'] },
  technique: { type: 'technique', id: 'TECH-slug', 'avg-score': 0, 'times-used': 0, confidence: 'low', scores: [], 'best-with': [], tags: ['technique'] },
  pattern: { type: 'pattern', id: 'PAT-slug', 'section-type': '', project: '"[[project]]"', score: null, tags: ['pattern'] },
  signature: { type: 'signature', id: 'SIG-slug', verdict: 'approved', 'section-type': '', project: '"[[project]]"', tags: ['signature'] },
  palette: { type: 'palette', id: 'PAL-slug', mood: '', 'theme-type': 'dark', canvas: '#', accents: [], reaction: null, validations: 1, project: '"[[project]]"', tags: ['palette'] },
  'font-pairing': { type: 'font-pairing', id: 'FP-slug', display: '', 'body-font': '', mono: null, mood: '', reaction: null, validations: 1, project: '"[[project]]"', tags: ['typography'] },
  lesson: { type: 'lesson', id: 'LES-date', severity: 'warning', phase: 'build', project: '"[[project]]"', 'prevention-adopted': false, tags: ['lesson'] },
  revision: { type: 'revision', id: 'REV-slug', project: '"[[project]]"', phase: '', tags: ['revision'] },
  project: { type: 'project', id: 'slug', status: 'active', branch: null, 'project-dir': null, machine: null, tags: ['project'] },
  reference: { type: 'reference', id: 'REF-slug', title: '', 'site-url': '', studied: false, tags: ['reference'] },
  asset: { type: 'asset', id: 'AST-slug', 'asset-kind': 'photo', 'source-type': 'adobe_stock', 'stock-asset-id': null, model: null, prompt: null, seed: null, license: 'adobe-stock-standard', 'review-status': 'pending', 'rejection-reason': null, project: '"[[project]]"', slot: 'hero/background', tags: ['asset'] },
}
for (const [name, fm] of Object.entries(TEMPLATES)) {
  fs.writeFileSync(path.join(VAULT_DIR, 'templates', `${name}.md`),
    `${serializeFrontmatter(fm)}\n\n<!-- cuerpo: prosa arriba, evidencia abajo -->\n\n## Evidence log\n${APPEND_MARKER}\n`)
}

// Home.md (human dashboard)
fs.writeFileSync(path.join(VAULT_DIR, 'Home.md'), `# Eros — Cerebro

> Vault canónico del conocimiento de Eros desde 2026-07-04. Editable a mano
> (arriba de los markers) y por máquina (\`scripts/memory/vault.mjs\`).
> Entrada máquina: [[START]] · Propuesta que originó esto: \`docs/research/2026-07-04-fable-evolution.md\`

![[eros#Current state]]

## Mapas

[[rules-map]] · [[techniques-map]] · [[projects-map]] · [[style-map]] · [[lessons-map]]

## Reglas

![[bases/rules.base]]

## Técnicas

![[bases/techniques.base]]

## Proyectos

![[bases/projects.base]]

## Paletas

![[bases/palettes.base]]

## Assets generados

![[bases/assets.base]]
`)

// .obsidian minimal committed config
const obs = path.join(VAULT_DIR, '.obsidian')
fs.mkdirSync(obs, { recursive: true })
fs.writeFileSync(path.join(obs, 'app.json'), JSON.stringify({ alwaysUpdateLinks: true, useMarkdownLinks: false, newLinkFormat: 'shortest', attachmentFolderPath: 'assets' }, null, 2))
fs.writeFileSync(path.join(obs, 'appearance.json'), JSON.stringify({ baseFontSize: 16, theme: 'obsidian' }, null, 2))
fs.writeFileSync(path.join(obs, 'graph.json'), JSON.stringify({
  colorGroups: [
    { query: 'path:rules', color: { a: 1, rgb: 16007990 } },
    { query: 'path:techniques', color: { a: 1, rgb: 2201331 } },
    { query: 'path:projects', color: { a: 1, rgb: 16761095 } },
    { query: 'path:self', color: { a: 1, rgb: 16777215 } },
    { query: 'path:maps', color: { a: 1, rgb: 9662683 } },
    { query: 'path:palettes', color: { a: 1, rgb: 5025616 } },
    { query: 'path:typography', color: { a: 1, rgb: 15277667 } },
    { query: 'path:lessons', color: { a: 1, rgb: 15158332 } },
  ],
  showTags: false, showAttachments: false, hideUnresolved: false,
  showOrphans: true, scale: 1,
}, null, 2))

fs.mkdirSync(path.join(VAULT_DIR, 'assets'), { recursive: true })
fs.writeFileSync(path.join(VAULT_DIR, 'assets', '.gitkeep'), '')

// START.md
regenStart()

// Freeze notice in the old location
fs.writeFileSync(path.join(DI, 'README.md'), `# design-intelligence — CONGELADO (2026-07-04)

El conocimiento canónico de Eros vive ahora en \`brain/\` (vault Obsidian).
Migración: \`scripts/memory/migrate-to-vault.mjs\` · Writer nuevo: \`scripts/memory/vault.mjs\`.

Estos JSON quedan como snapshot congelado — NO escribir conocimiento nuevo acá.
Siguen vivos (por ahora) solo los archivos de estado operacional que los scripts
legacy todavía usan: activity-feed, auto-train-status, training-*, puchos,
project-registry (hasta que state/orchestrator migren al vault).
`)

const problems = validateVault()
const count = Object.values(NOTE_TYPES).reduce((acc, t) => {
  const dir = path.join(VAULT_DIR, t.folder)
  return acc + (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length : 0)
}, 0)
console.log(`Vault generated: ${count} notes at ${VAULT_DIR}`)
if (problems.length) {
  console.error(`Validation problems (${problems.length}):\n${problems.join('\n')}`)
  process.exit(1)
}
console.log('Validation: OK')
