#!/usr/bin/env node
/**
 * eros-memory.mjs
 * SINGLE AUTHORITY for all reads/writes to .claude/memory/design-intelligence/
 * Claude never writes to memory files directly — always through this script.
 *
 * Uses JSON files as source of truth, renders markdown views from them.
 * All output is JSON to stdout. Errors go to stderr with exit code 1.
 *
 * Subcommands:
 *   interpret  --task-type <design|build|polish> [--mood "..."] [--section-type "..."]
 *   learn      --event <event_name> --data '<json>'
 *   threshold  --section-type <type>
 *   promote
 *   stats
 *   migrate
 *
 * No external dependencies.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEMORY_DIR = path.resolve(__dirname, '..', '.claude', 'memory', 'design-intelligence');

const FILES = {
  fontPairings:        'font-pairings',
  colorPalettes:       'color-palettes',
  signatures:          'signatures',
  sectionPatterns:     'section-patterns',
  techniqueScores:     'technique-scores',
  revisionPatterns:    'revision-patterns',
  pipelineLessons:     'pipeline-lessons',
  rules:               'rules',
  calibration:         'training-calibration',
};

function jsonPath(base) { return path.join(MEMORY_DIR, `${base}.json`); }
function mdPath(base)   { return path.join(MEMORY_DIR, `${base}.md`); }

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function today() { return new Date().toISOString().slice(0, 10); }

async function readJSON(base) {
  try {
    const raw = await fs.readFile(jsonPath(base), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeJSON(base, data) {
  await fs.writeFile(jsonPath(base), JSON.stringify(data, null, 2), 'utf-8');
}

function parseArgs(argv) {
  const args = {};
  let i = 0;
  while (i < argv.length) {
    const key = argv[i];
    if (key.startsWith('--')) {
      const name = key.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[name] = next;
        i += 2;
      } else {
        args[name] = true;
        i += 1;
      }
    } else {
      i += 1;
    }
  }
  return args;
}

function fail(msg) {
  process.stderr.write(`Error: ${msg}\n`);
  process.exit(1);
}

function output(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// Markdown table parser (for migrate)
// ---------------------------------------------------------------------------

function parseMdTable(text) {
  const lines = text.split('\n');
  const tables = [];
  let currentTable = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map(c => c.trim());

      // Skip separator rows (all cells are dashes/colons)
      if (cells.every(c => /^[-:]+$/.test(c))) continue;

      if (!currentTable) {
        // First row = headers
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
    } else {
      if (currentTable && currentTable.rows.length > 0) {
        tables.push(currentTable);
        currentTable = null;
      } else if (currentTable) {
        // Headers found but no rows yet — keep looking for separator + rows
        // Actually if we hit a non-table line after headers, reset
        currentTable = null;
      }
    }
  }
  if (currentTable && currentTable.rows.length > 0) {
    tables.push(currentTable);
  }

  return tables;
}

function cellVal(val) {
  if (!val || val === '—' || val === '-' || val === '(none)') return null;
  return val;
}

function cellNum(val) {
  if (!val || val === '—' || val === '-') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

// ---------------------------------------------------------------------------
// Markdown renderers
// ---------------------------------------------------------------------------

function renderTable(headers, rows) {
  const hLine = '| ' + headers.join(' | ') + ' |';
  const sLine = '|' + headers.map(() => '------|').join('');
  const rLines = rows.map(r => {
    const cells = headers.map((_, i) => r[i] ?? '');
    return '| ' + cells.join(' | ') + ' |';
  });
  return [hLine, sLine, ...rLines].join('\n');
}

async function renderFontPairings(data) {
  let md = `# Font Pairings\n\nCross-project font intelligence. CEO appends after Phase 1 user review.\n\n`;
  md += `## What Works\n\n`;
  const wHeaders = ['Date', 'Project', 'Mood', 'Display', 'Body', 'Reaction', 'Lesson'];
  const wRows = data.works.map(w => [
    w.date || '\u2014', w.project || '\u2014', w.mood || '\u2014',
    w.display || '\u2014',
    [w.body, w.mono ? `(+${w.mono})` : ''].filter(Boolean).join(' ') || '\u2014',
    w.reaction || '\u2014', w.lesson || '\u2014'
  ]);
  md += renderTable(wHeaders, wRows);
  md += `\n\n## What Failed\n\n`;
  const fHeaders = ['Date', 'Project', 'Mood', 'Display', 'Body', 'Reaction', 'Lesson'];
  const fRows = data.failures.map(f => [
    f.date || '\u2014', f.project || '(seed)', f.mood || '\u2014',
    f.display || '\u2014', f.body || '\u2014', f.reaction || '\u2014',
    f.reason || '\u2014'
  ]);
  md += renderTable(fHeaders, fRows);
  md += '\n';
  await fs.writeFile(mdPath(FILES.fontPairings), md, 'utf-8');
}

async function renderColorPalettes(data) {
  let md = `# Color Palettes\n\nCross-project palette intelligence. CEO appends after Phase 1 user review.\n\n`;
  md += `## What Works\n\n`;
  const wHeaders = ['Date', 'Project', 'Mood', 'Canvas', 'Accent', 'Reaction', 'Lesson'];
  const wRows = data.works.map(w => [
    w.date || '\u2014', w.project || '\u2014', w.mood || '\u2014',
    w.canvas || '\u2014', w.accent || '\u2014', w.reaction || '\u2014', w.lesson || '\u2014'
  ]);
  md += renderTable(wHeaders, wRows);
  md += `\n\n## What Failed\n\n`;
  const fHeaders = ['Date', 'Project', 'Mood', 'Canvas', 'Accent', 'Reaction', 'Lesson'];
  const fRows = data.failures.map(f => [
    f.date || '\u2014', f.project || '(seed)', f.mood || '\u2014',
    f.canvas || '\u2014', f.accent || '\u2014', f.reaction || '\u2014',
    f.reason || '\u2014'
  ]);
  md += renderTable(fHeaders, fRows);
  md += '\n';
  await fs.writeFile(mdPath(FILES.colorPalettes), md, 'utf-8');
}

async function renderSignatures(data) {
  let md = `# Signature Elements\n\nCross-project signature intelligence. CEO appends after Phase 3 batch review.\n\n`;
  md += `## Approved\n\n`;
  const aHeaders = ['Date', 'Project', 'Section', 'Element', 'Description', 'Why It Worked'];
  const aRows = data.approved.map(a => [
    a.date || '\u2014', a.project || '\u2014', a.section || '\u2014',
    a.element || '\u2014', a.description || '\u2014', a.whyItWorked || '\u2014'
  ]);
  md += renderTable(aHeaders, aRows);
  md += `\n\n## Rejected\n\n`;
  const rHeaders = ['Date', 'Project', 'Section', 'Element', 'User Feedback', 'Lesson'];
  const rRows = data.rejected.map(r => [
    r.date || '\u2014', r.project || '\u2014', r.section || '\u2014',
    r.element || '\u2014', r.feedback || '\u2014', r.lesson || '\u2014'
  ]);
  md += renderTable(rHeaders, rRows);
  md += '\n';
  await fs.writeFile(mdPath(FILES.signatures), md, 'utf-8');
}

async function renderSectionPatterns(data) {
  let md = `# Section Patterns\n\nHigh-scoring layout + motion combinations. CEO appends after Phase 3 scores.\n\n`;
  const headers = ['Date', 'Project', 'Section Type', 'Layout', 'Motion', 'Key Technique', 'Score'];
  const rows = data.patterns.map(p => [
    p.date || '\u2014', p.project || '\u2014', p.sectionType || '\u2014',
    p.layout || '\u2014', p.motion || '\u2014', p.keyTechnique || '\u2014',
    p.score != null ? String(p.score) : '\u2014'
  ]);
  md += renderTable(headers, rows);
  md += '\n';
  await fs.writeFile(mdPath(FILES.sectionPatterns), md, 'utf-8');
}

async function renderTechniqueScores(data) {
  let md = `# Technique Effectiveness\n\nUsage counts and average scores per technique. CEO updates after Phase 3.\n\n`;
  const headers = ['Technique', 'Times Used', 'Avg Score', 'Notes'];
  const rows = data.techniques.map(t => [
    t.name || '\u2014',
    t.timesUsed != null ? String(t.timesUsed) : '0',
    t.avgScore != null ? String(t.avgScore) : '\u2014',
    t.notes || '\u2014'
  ]);
  md += renderTable(headers, rows);
  md += '\n';
  await fs.writeFile(mdPath(FILES.techniqueScores), md, 'utf-8');
}

async function renderRevisionPatterns(data) {
  let md = `# Revision Patterns\n\nWhat users consistently change. CEO appends EVERY TIME user requests a change.\nThis is the most valuable learning \u2014 it predicts future revision requests.\n\n`;
  const headers = ['Date', 'Project', 'Phase', 'What Changed', 'Original', 'New', 'Pattern'];
  const rows = data.patterns.map(p => [
    p.date || '\u2014', p.project || '\u2014', p.phase || '\u2014',
    p.whatChanged || '\u2014', p.original || '\u2014', p.revised || '\u2014',
    p.pattern || '\u2014'
  ]);
  md += renderTable(headers, rows);
  md += '\n';
  await fs.writeFile(mdPath(FILES.revisionPatterns), md, 'utf-8');
}

async function renderPipelineLessons(data) {
  let md = `# Pipeline Lessons\n\nProcess friction, delays, and resolutions. CEO appends throughout project.\n\n`;
  const headers = ['Date', 'Project', 'Phase', 'Issue', 'Resolution', 'Prevention'];
  const rows = data.lessons.map(l => [
    l.date || '\u2014', l.project || '\u2014', l.phase || '\u2014',
    l.issue || '\u2014', l.resolution || '\u2014', l.prevention || '\u2014'
  ]);
  md += renderTable(headers, rows);
  md += '\n';
  await fs.writeFile(mdPath(FILES.pipelineLessons), md, 'utf-8');
}

async function renderRules(data) {
  let md = `# Rules Discovered\n\nHard rules from experience. Promoted to CLAUDE.md or agent files after 3+ project validations.\n\n`;
  const headers = ['ID', 'Date', 'Rule', 'Source', 'Validations', 'Status', 'Promoted At'];
  const rows = data.rules.map(r => [
    r.id || '\u2014',
    r.createdAt || '\u2014',
    r.text || '\u2014',
    r.source || '\u2014',
    r.validations != null ? String(r.validations) : '\u2014',
    r.status || '\u2014',
    r.promotedAt || '\u2014'
  ]);
  md += renderTable(headers, rows);
  md += '\n';
  await fs.writeFile(mdPath(FILES.rules), md, 'utf-8');
}

const RENDERERS = {
  [FILES.fontPairings]:    renderFontPairings,
  [FILES.colorPalettes]:   renderColorPalettes,
  [FILES.signatures]:      renderSignatures,
  [FILES.sectionPatterns]: renderSectionPatterns,
  [FILES.techniqueScores]: renderTechniqueScores,
  [FILES.revisionPatterns]:renderRevisionPatterns,
  [FILES.pipelineLessons]: renderPipelineLessons,
  [FILES.rules]:           renderRules,
};

async function renderMd(base, data) {
  const renderer = RENDERERS[base];
  if (renderer) await renderer(data);
}

// ---------------------------------------------------------------------------
// MIGRATE — parse existing .md tables into .json
// ---------------------------------------------------------------------------

async function cmdMigrate() {
  const results = [];

  // --- font-pairings ---
  if (!(await readJSON(FILES.fontPairings))) {
    const raw = await fs.readFile(mdPath(FILES.fontPairings), 'utf-8').catch(() => null);
    if (raw) {
      const sections = raw.split(/^## /m);
      const data = { works: [], failures: [] };

      for (const section of sections) {
        const isWorks = section.startsWith('What Works');
        const isFails = section.startsWith('What Failed');
        if (!isWorks && !isFails) continue;

        const tables = parseMdTable(section);
        if (tables.length === 0) continue;
        const table = tables[0];

        for (const row of table.rows) {
          const h = table.headers;
          const get = (name) => {
            const idx = h.findIndex(hh => hh.toLowerCase().includes(name.toLowerCase()));
            return idx >= 0 ? cellVal(row[idx]) : null;
          };

          if (isWorks) {
            // Parse body field: might be "DM Sans (+JetBrains Mono)"
            let bodyRaw = get('Body') || '';
            let body = bodyRaw;
            let mono = null;
            const monoMatch = bodyRaw.match(/\(\+(.+?)\)/);
            if (monoMatch) {
              mono = monoMatch[1].trim();
              body = bodyRaw.replace(/\s*\(\+.+?\)/, '').trim();
            }
            data.works.push({
              date: get('Date'),
              project: get('Project') || (get('Date') === null ? '(seed)' : null),
              mood: get('Mood'),
              display: get('Display'),
              body: body || null,
              mono: mono,
              reaction: get('Reaction'),
              lesson: get('Lesson'),
              userRating: null,
              validations: 1,
            });
          } else {
            data.failures.push({
              date: get('Date'),
              display: get('Display'),
              body: get('Body'),
              reason: get('Lesson') || get('Reaction'),
              source: get('Project') === '(seed)' || !get('Project') ? 'seed' : get('Project'),
            });
          }
        }
      }

      await writeJSON(FILES.fontPairings, data);
      await renderMd(FILES.fontPairings, data);
      results.push('font-pairings.json');
    }
  }

  // --- color-palettes ---
  if (!(await readJSON(FILES.colorPalettes))) {
    const raw = await fs.readFile(mdPath(FILES.colorPalettes), 'utf-8').catch(() => null);
    if (raw) {
      const sections = raw.split(/^## /m);
      const data = { works: [], failures: [] };

      for (const section of sections) {
        const isWorks = section.startsWith('What Works');
        const isFails = section.startsWith('What Failed');
        if (!isWorks && !isFails) continue;

        const tables = parseMdTable(section);
        if (tables.length === 0) continue;
        const table = tables[0];

        for (const row of table.rows) {
          const h = table.headers;
          const get = (name) => {
            const idx = h.findIndex(hh => hh.toLowerCase().includes(name.toLowerCase()));
            return idx >= 0 ? cellVal(row[idx]) : null;
          };

          if (isWorks) {
            data.works.push({
              date: get('Date'),
              project: get('Project'),
              mood: get('Mood'),
              canvas: get('Canvas'),
              accent: get('Accent'),
              reaction: get('Reaction'),
              lesson: get('Lesson'),
              userRating: null,
              validations: 1,
            });
          } else {
            data.failures.push({
              date: get('Date'),
              accent: get('Accent'),
              reason: get('Lesson') || get('Reaction'),
              source: !get('Project') || get('Project') === '(seed)' ? 'seed' : get('Project'),
            });
          }
        }
      }

      await writeJSON(FILES.colorPalettes, data);
      await renderMd(FILES.colorPalettes, data);
      results.push('color-palettes.json');
    }
  }

  // --- signatures ---
  if (!(await readJSON(FILES.signatures))) {
    const raw = await fs.readFile(mdPath(FILES.signatures), 'utf-8').catch(() => null);
    if (raw) {
      const sections = raw.split(/^## /m);
      const data = { approved: [], rejected: [] };

      for (const section of sections) {
        const isApproved = section.startsWith('Approved');
        const isRejected = section.startsWith('Rejected');
        if (!isApproved && !isRejected) continue;

        const tables = parseMdTable(section);
        if (tables.length === 0) continue;
        const table = tables[0];

        for (const row of table.rows) {
          const h = table.headers;
          const get = (name) => {
            const idx = h.findIndex(hh => hh.toLowerCase().includes(name.toLowerCase()));
            return idx >= 0 ? cellVal(row[idx]) : null;
          };

          if (isApproved) {
            data.approved.push({
              date: get('Date'),
              project: get('Project'),
              section: get('Section'),
              sectionType: null,
              element: get('Element'),
              description: get('Description'),
              whyItWorked: get('Why It Worked') || get('Why'),
              userRating: null,
            });
          } else {
            data.rejected.push({
              date: get('Date'),
              project: get('Project'),
              section: get('Section'),
              element: get('Element'),
              feedback: get('User Feedback') || get('Feedback'),
              lesson: get('Lesson'),
            });
          }
        }
      }

      await writeJSON(FILES.signatures, data);
      await renderMd(FILES.signatures, data);
      results.push('signatures.json');
    }
  }

  // --- section-patterns ---
  if (!(await readJSON(FILES.sectionPatterns))) {
    const raw = await fs.readFile(mdPath(FILES.sectionPatterns), 'utf-8').catch(() => null);
    if (raw) {
      const tables = parseMdTable(raw);
      const data = { patterns: [] };

      if (tables.length > 0) {
        const table = tables[0];
        for (const row of table.rows) {
          const h = table.headers;
          const get = (name) => {
            const idx = h.findIndex(hh => hh.toLowerCase().includes(name.toLowerCase()));
            return idx >= 0 ? cellVal(row[idx]) : null;
          };
          data.patterns.push({
            date: get('Date'),
            project: get('Project'),
            sectionType: get('Section Type'),
            layout: get('Layout'),
            motion: get('Motion'),
            keyTechnique: get('Key Technique'),
            score: cellNum(get('Score')),
            userRating: null,
          });
        }
      }

      await writeJSON(FILES.sectionPatterns, data);
      await renderMd(FILES.sectionPatterns, data);
      results.push('section-patterns.json');
    }
  }

  // --- technique-scores ---
  if (!(await readJSON(FILES.techniqueScores))) {
    const raw = await fs.readFile(mdPath(FILES.techniqueScores), 'utf-8').catch(() => null);
    if (raw) {
      const tables = parseMdTable(raw);
      const data = { techniques: [] };

      if (tables.length > 0) {
        const table = tables[0];
        for (const row of table.rows) {
          const h = table.headers;
          const get = (name) => {
            const idx = h.findIndex(hh => hh.toLowerCase().includes(name.toLowerCase()));
            return idx >= 0 ? cellVal(row[idx]) : null;
          };
          const timesUsed = cellNum(get('Times Used')) || 0;
          const avgScore = cellNum(get('Avg Score'));
          data.techniques.push({
            name: get('Technique'),
            timesUsed,
            avgScore,
            avgUserRating: null,
            scores: avgScore != null ? Array(timesUsed).fill(avgScore) : [],
            bestWith: [],
            notes: get('Notes'),
          });
        }
      }

      await writeJSON(FILES.techniqueScores, data);
      await renderMd(FILES.techniqueScores, data);
      results.push('technique-scores.json');
    }
  }

  // --- revision-patterns ---
  if (!(await readJSON(FILES.revisionPatterns))) {
    const raw = await fs.readFile(mdPath(FILES.revisionPatterns), 'utf-8').catch(() => null);
    if (raw) {
      const tables = parseMdTable(raw);
      const data = { patterns: [] };

      if (tables.length > 0) {
        const table = tables[0];
        for (const row of table.rows) {
          const h = table.headers;
          const get = (name) => {
            const idx = h.findIndex(hh => hh.toLowerCase().includes(name.toLowerCase()));
            return idx >= 0 ? cellVal(row[idx]) : null;
          };
          data.patterns.push({
            date: get('Date'),
            project: get('Project'),
            phase: get('Phase'),
            whatChanged: get('What Changed'),
            original: get('Original'),
            revised: get('New'),
            pattern: get('Pattern'),
          });
        }
      }

      await writeJSON(FILES.revisionPatterns, data);
      await renderMd(FILES.revisionPatterns, data);
      results.push('revision-patterns.json');
    }
  }

  // --- pipeline-lessons ---
  if (!(await readJSON(FILES.pipelineLessons))) {
    const raw = await fs.readFile(mdPath(FILES.pipelineLessons), 'utf-8').catch(() => null);
    if (raw) {
      const tables = parseMdTable(raw);
      const data = { lessons: [] };

      if (tables.length > 0) {
        const table = tables[0];
        for (const row of table.rows) {
          const h = table.headers;
          const get = (name) => {
            const idx = h.findIndex(hh => hh.toLowerCase().includes(name.toLowerCase()));
            return idx >= 0 ? cellVal(row[idx]) : null;
          };
          data.lessons.push({
            date: get('Date'),
            project: get('Project'),
            phase: get('Phase'),
            issue: get('Issue'),
            resolution: get('Resolution'),
            prevention: get('Prevention'),
          });
        }
      }

      await writeJSON(FILES.pipelineLessons, data);
      await renderMd(FILES.pipelineLessons, data);
      results.push('pipeline-lessons.json');
    }
  }

  // --- rules ---
  if (!(await readJSON(FILES.rules))) {
    const raw = await fs.readFile(mdPath(FILES.rules), 'utf-8').catch(() => null);
    if (raw) {
      const tables = parseMdTable(raw);
      const data = { rules: [], nextId: 1 };

      if (tables.length > 0) {
        const table = tables[0];
        for (const row of table.rows) {
          const h = table.headers;
          const get = (name) => {
            const idx = h.findIndex(hh => hh.toLowerCase().includes(name.toLowerCase()));
            return idx >= 0 ? cellVal(row[idx]) : null;
          };
          const validationsRaw = get('Validations');
          const validations = validationsRaw === 'Pre-validated' ? 5 : (cellNum(validationsRaw) || 1);
          const status = get('Status') || 'CANDIDATE';
          data.rules.push({
            id: `RULE-${String(data.nextId).padStart(3, '0')}`,
            text: get('Rule'),
            source: get('Source'),
            validations,
            status,
            promotedTo: status === 'PROMOTED' ? 'CLAUDE.md' : null,
            promotedAt: status === 'PROMOTED' ? get('Date') || '2025-01-01' : null,
            createdAt: get('Date') || '2025-01-01',
          });
          data.nextId++;
        }
      }

      await writeJSON(FILES.rules, data);
      await renderMd(FILES.rules, data);
      results.push('rules.json');
    }
  }

  // --- training-calibration (create default if missing) ---
  if (!(await readJSON(FILES.calibration))) {
    const data = { projects: [], globalBias: 0.0, thresholdAdjustment: 0.0 };
    await writeJSON(FILES.calibration, data);
    results.push('training-calibration.json');
  }

  output({ migrated: results, count: results.length });
}

// ---------------------------------------------------------------------------
// INTERPRET — read memory and return formatted insights
// ---------------------------------------------------------------------------

async function cmdInterpret(args) {
  const taskType = args['task-type'];
  if (!taskType) fail('--task-type is required (design|build|polish)');

  const mood = args.mood || null;
  const sectionType = args['section-type'] || null;

  // Determine which files to read
  let filesToRead;
  switch (taskType) {
    case 'design':
      filesToRead = [FILES.fontPairings, FILES.colorPalettes, FILES.revisionPatterns, FILES.rules];
      break;
    case 'build':
      filesToRead = [FILES.signatures, FILES.techniqueScores, FILES.sectionPatterns, FILES.revisionPatterns];
      break;
    case 'polish':
      filesToRead = [FILES.techniqueScores, FILES.pipelineLessons];
      break;
    default:
      fail(`Unknown task-type: ${taskType}. Use design|build|polish`);
  }

  const memoryData = {};
  for (const f of filesToRead) {
    memoryData[f] = await readJSON(f);
  }

  // Build insights table rows
  const insights = [];

  // --- Design insights ---
  if (taskType === 'design') {
    const fp = memoryData[FILES.fontPairings];
    if (fp) {
      // Font successes
      for (const w of fp.works) {
        const relevance = computeMoodRelevance(w.mood, mood);
        if (relevance === 'NONE') continue;
        const confidence = w.validations >= 3 ? 'HIGH' : (w.validations >= 1 ? 'MEDIUM' : 'LOW');
        insights.push({
          topic: 'Font',
          insight: `${w.display} + ${w.body}${w.mono ? ` + ${w.mono}` : ''} \u2192 ${w.reaction || 'used'} for ${w.mood || 'general'}${w.lesson ? `. ${w.lesson}` : ''}`,
          confidence,
          relevance,
        });
      }
      // Font failures
      for (const f of fp.failures) {
        insights.push({
          topic: 'Font AVOID',
          insight: `${f.display || 'unknown'}${f.body ? ` + ${f.body}` : ''}: ${f.reason}`,
          confidence: 'HIGH',
          relevance: 'HIGH',
        });
      }
    }

    const cp = memoryData[FILES.colorPalettes];
    if (cp) {
      for (const w of cp.works) {
        const relevance = computeMoodRelevance(w.mood, mood);
        if (relevance === 'NONE') continue;
        const confidence = w.validations >= 3 ? 'HIGH' : (w.validations >= 1 ? 'MEDIUM' : 'LOW');
        insights.push({
          topic: 'Palette',
          insight: `${w.canvas} + ${w.accent} \u2192 ${w.reaction || 'used'} for ${w.mood || 'general'}${w.lesson ? `. ${w.lesson}` : ''}`,
          confidence,
          relevance,
        });
      }
      for (const f of cp.failures) {
        insights.push({
          topic: 'Palette AVOID',
          insight: `${f.accent}: ${f.reason}`,
          confidence: 'HIGH',
          relevance: 'HIGH',
        });
      }
    }

    const rp = memoryData[FILES.revisionPatterns];
    if (rp) {
      for (const p of rp.patterns) {
        insights.push({
          topic: 'Revision Pattern',
          insight: `${p.project}/${p.phase}: ${p.pattern || p.whatChanged || p.revised || '—'}`,
          confidence: 'HIGH',
          relevance: 'MEDIUM',
        });
      }
    }
  }

  // --- Build insights ---
  if (taskType === 'build') {
    const sig = memoryData[FILES.signatures];
    if (sig) {
      for (const a of sig.approved) {
        const matchesSection = !sectionType || (a.sectionType && a.sectionType.includes(sectionType)) ||
          (a.section && a.section.toLowerCase().includes((sectionType || '').toLowerCase()));
        if (!matchesSection) continue;
        insights.push({
          topic: 'Signature',
          insight: `${a.project}/${a.section}: "${a.element}" \u2014 ${a.whyItWorked || a.description}`,
          confidence: 'MEDIUM',
          relevance: matchesSection ? 'HIGH' : 'LOW',
        });
      }
      for (const r of sig.rejected) {
        const matchesSection = !sectionType || (r.section && r.section.toLowerCase().includes((sectionType || '').toLowerCase()));
        if (!matchesSection) continue;
        insights.push({
          topic: 'Signature AVOID',
          insight: `${r.project}/${r.section}: "${r.element}" \u2014 ${r.lesson || r.feedback}`,
          confidence: 'HIGH',
          relevance: 'HIGH',
        });
      }
    }

    const ts = memoryData[FILES.techniqueScores];
    if (ts) {
      const sorted = [...ts.techniques].sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));
      for (const t of sorted) {
        const matchesSection = !sectionType || (t.bestWith && t.bestWith.some(b => b.includes(sectionType || '')));
        const confidence = t.timesUsed >= 3 ? 'HIGH' : (t.timesUsed >= 1 ? 'MEDIUM' : 'LOW');
        insights.push({
          topic: 'Technique',
          insight: `${t.name}: avg ${t.avgScore}, used ${t.timesUsed}x${t.notes ? `. ${t.notes}` : ''}`,
          confidence,
          relevance: matchesSection ? 'HIGH' : 'MEDIUM',
        });
      }
    }

    const sp = memoryData[FILES.sectionPatterns];
    if (sp) {
      const filtered = sectionType
        ? sp.patterns.filter(p => p.sectionType && p.sectionType.includes(sectionType))
        : sp.patterns;
      const sorted = [...filtered].sort((a, b) => (b.score || 0) - (a.score || 0));
      for (const p of sorted.slice(0, 5)) {
        insights.push({
          topic: 'Pattern',
          insight: `${p.project}/${p.sectionType}: ${p.keyTechnique} (score ${p.score})`,
          confidence: p.score >= 8 ? 'HIGH' : 'MEDIUM',
          relevance: 'HIGH',
        });
      }
    }

    const rp = memoryData[FILES.revisionPatterns];
    if (rp) {
      for (const p of rp.patterns) {
        insights.push({
          topic: 'Revision Pattern',
          insight: `${p.project}/${p.phase}: ${p.pattern || p.whatChanged || p.revised || '—'}`,
          confidence: 'HIGH',
          relevance: 'MEDIUM',
        });
      }
    }
  }

  // --- Polish insights ---
  if (taskType === 'polish') {
    const ts = memoryData[FILES.techniqueScores];
    if (ts) {
      const sorted = [...ts.techniques].sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));
      for (const t of sorted) {
        const confidence = t.timesUsed >= 3 ? 'HIGH' : (t.timesUsed >= 1 ? 'MEDIUM' : 'LOW');
        insights.push({
          topic: 'Technique',
          insight: `${t.name}: avg ${t.avgScore}, used ${t.timesUsed}x${t.notes ? `. ${t.notes}` : ''}`,
          confidence,
          relevance: 'MEDIUM',
        });
      }
    }

    const pl = memoryData[FILES.pipelineLessons];
    if (pl) {
      for (const l of pl.lessons) {
        insights.push({
          topic: 'Pipeline',
          insight: `${l.project}/${l.phase}: ${l.issue} \u2192 ${l.prevention}`,
          confidence: 'HIGH',
          relevance: 'HIGH',
        });
      }
    }
  }

  // Filter out insights with null/empty/garbage content
  const cleanInsights = insights.filter(i => {
    if (!i.insight || i.insight === 'null' || i.insight === 'undefined') return false;
    // Remove entries that are mostly null fields
    const nullCount = (i.insight.match(/\bnull\b/gi) || []).length;
    const words = i.insight.split(/\s+/).length;
    if (nullCount > 0 && nullCount / words > 0.3) return false;
    // Remove entries shorter than 10 chars (likely empty/useless)
    if (i.insight.replace(/[^a-zA-Z0-9]/g, '').length < 10) return false;
    return true;
  });

  // Build markdown table
  let insightsMd = '## Memory Insights\n\n';
  if (cleanInsights.length === 0) {
    insightsMd += '_No relevant data found for this task type._\n';
  } else {
    // Sort by relevance then confidence
    const relOrder = { HIGH: 0, MEDIUM: 1, LOW: 2, NONE: 3 };
    const confOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    cleanInsights.sort((a, b) => {
      const rd = (relOrder[a.relevance] || 3) - (relOrder[b.relevance] || 3);
      if (rd !== 0) return rd;
      return (confOrder[a.confidence] || 2) - (confOrder[b.confidence] || 2);
    });

    insightsMd += '| Topic | Insight | Confidence |\n';
    insightsMd += '|-------|---------|------------|\n';
    for (const i of cleanInsights) {
      // Clean up any remaining null tokens in the insight text
      const cleanText = i.insight.replace(/\bnull\b/g, '—').replace(/\s+/g, ' ').trim();
      insightsMd += `| ${i.topic} | ${cleanText} | ${i.confidence} |\n`;
    }
  }

  // Compute threshold
  const threshold = await computeThreshold(sectionType);

  // Get relevant rules
  const rulesData = await readJSON(FILES.rules);
  const relevantRules = [];
  if (rulesData) {
    for (const r of rulesData.rules) {
      relevantRules.push({ rule: r.text, status: r.status });
    }
  }

  output({
    insightsMarkdown: insightsMd,
    threshold,
    relevantRules,
  });
}

// Similarity scoring: compute relevance between item mood/context and query mood.
// Uses word-overlap with synonym expansion and partial matching.
const MOOD_SYNONYMS = {
  dark: ['noir', 'moody', 'shadow', 'night'],
  cinematic: ['film', 'editorial', 'atmospheric', 'dramatic'],
  minimal: ['clean', 'simple', 'stripped', 'restrained'],
  brutalist: ['brutalism', 'raw', 'industrial', 'exposed'],
  playful: ['fun', 'colorful', 'vibrant', 'energetic'],
  elegant: ['luxury', 'refined', 'premium', 'sophisticated'],
  warm: ['cozy', 'amber', 'copper', 'earthy'],
  cool: ['cold', 'ice', 'blue', 'steel'],
  light: ['bright', 'airy', 'white', 'luminous'],
};

function expandMoodTokens(tokens) {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    // Add synonyms
    for (const [key, synonyms] of Object.entries(MOOD_SYNONYMS)) {
      if (token === key || synonyms.includes(token)) {
        expanded.add(key);
        for (const s of synonyms) expanded.add(s);
      }
    }
  }
  return [...expanded];
}

function computeMoodRelevance(itemMood, queryMood) {
  if (!queryMood) return 'MEDIUM';
  if (!itemMood) return 'LOW';

  const itemTokens = itemMood.toLowerCase().split(/[\s,+]+/).filter(Boolean);
  const queryTokens = queryMood.toLowerCase().split(/[\s,+]+/).filter(Boolean);

  // Expand both with synonyms
  const expandedItem = expandMoodTokens(itemTokens);
  const expandedQuery = expandMoodTokens(queryTokens);

  // Compute overlap score
  let directMatches = 0;
  let synonymMatches = 0;

  for (const qt of queryTokens) {
    if (itemTokens.some(it => it === qt)) {
      directMatches++;
    } else if (expandedItem.some(it => it === qt || qt.includes(it) || it.includes(qt))) {
      synonymMatches++;
    }
  }

  for (const it of itemTokens) {
    if (!queryTokens.includes(it) && expandedQuery.some(eq => eq === it || it.includes(eq) || eq.includes(it))) {
      synonymMatches++;
    }
  }

  const totalScore = directMatches * 2 + synonymMatches;
  const maxPossible = queryTokens.length * 2;

  if (totalScore === 0) return 'NONE';
  const ratio = totalScore / maxPossible;
  if (ratio >= 0.6 || directMatches >= 2) return 'HIGH';
  if (ratio >= 0.3 || directMatches >= 1) return 'MEDIUM';
  return 'LOW';
}

// ---------------------------------------------------------------------------
// LEARN — append data to memory files
// ---------------------------------------------------------------------------

// Schema definitions: required fields per event type
const EVENT_SCHEMAS = {
  font_selected:    { required: ['display'], recommended: ['project', 'mood', 'body', 'lesson'] },
  font_rejected:    { required: ['display', 'reason'], recommended: ['project'] },
  palette_selected: { required: ['canvas', 'accent'], recommended: ['project', 'mood', 'lesson'] },
  palette_rejected: { required: ['accent', 'reason'], recommended: [] },
  section_approved: { required: ['section', 'sectionType'], recommended: ['project', 'score', 'layout', 'motion', 'signature'] },
  section_rejected: { required: ['section', 'element'], recommended: ['project', 'feedback', 'lesson'] },
  user_change:      { required: ['whatChanged', 'pattern'], recommended: ['project', 'phase', 'original', 'revised'] },
  pipeline_issue:   { required: ['issue', 'resolution'], recommended: ['project', 'phase', 'prevention'] },
  rule_discovered:  { required: ['text'], recommended: ['source'] },
  rule_validated:   { required: ['id'], recommended: [] },
};

function validateLearnData(event, data) {
  const schema = EVENT_SCHEMAS[event];
  if (!schema) return { valid: false, error: `Unknown event type: "${event}". Valid events: ${Object.keys(EVENT_SCHEMAS).join(', ')}` };

  const missing = schema.required.filter(field => {
    const val = data[field] ?? data[field === 'text' ? 'rule' : undefined];
    return val === undefined || val === null || val === '';
  });

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Event "${event}" requires fields: ${schema.required.join(', ')}. Missing: ${missing.join(', ')}. ` +
             `Recommended (optional): ${schema.recommended.join(', ') || 'none'}.`
    };
  }

  return { valid: true };
}

async function cmdLearn(args) {
  const event = args.event;
  if (!event) fail('--event is required');

  let data;
  try {
    data = JSON.parse(args.data || '{}');
  } catch {
    fail('--data must be valid JSON');
  }

  // Validate schema
  const validation = validateLearnData(event, data);
  if (!validation.valid) fail(validation.error);

  const written = [];
  let rowsAdded = 0;

  switch (event) {
    case 'font_selected': {
      const fp = (await readJSON(FILES.fontPairings)) || { works: [], failures: [] };
      fp.works.push({
        date: data.date || today(),
        project: data.project || null,
        mood: data.mood || null,
        display: data.display || null,
        body: data.body || null,
        mono: data.mono || null,
        reaction: data.reaction || null,
        lesson: data.lesson || null,
        userRating: data.userRating || null,
        validations: data.validations || 1,
      });
      await writeJSON(FILES.fontPairings, fp);
      await renderMd(FILES.fontPairings, fp);
      written.push('font-pairings.json');
      rowsAdded++;
      break;
    }

    case 'font_rejected': {
      const fp = (await readJSON(FILES.fontPairings)) || { works: [], failures: [] };
      fp.failures.push({
        date: data.date || today(),
        display: data.display || null,
        body: data.body || null,
        reason: data.reason || null,
        source: data.source || data.project || null,
      });
      await writeJSON(FILES.fontPairings, fp);
      await renderMd(FILES.fontPairings, fp);
      written.push('font-pairings.json');
      rowsAdded++;
      break;
    }

    case 'palette_selected': {
      const cp = (await readJSON(FILES.colorPalettes)) || { works: [], failures: [] };
      cp.works.push({
        date: data.date || today(),
        project: data.project || null,
        mood: data.mood || null,
        canvas: data.canvas || null,
        accent: data.accent || null,
        reaction: data.reaction || null,
        lesson: data.lesson || null,
        userRating: data.userRating || null,
        validations: data.validations || 1,
      });
      await writeJSON(FILES.colorPalettes, cp);
      await renderMd(FILES.colorPalettes, cp);
      written.push('color-palettes.json');
      rowsAdded++;
      break;
    }

    case 'palette_rejected': {
      const cp = (await readJSON(FILES.colorPalettes)) || { works: [], failures: [] };
      cp.failures.push({
        date: data.date || today(),
        accent: data.accent || null,
        reason: data.reason || null,
        source: data.source || data.project || null,
      });
      await writeJSON(FILES.colorPalettes, cp);
      await renderMd(FILES.colorPalettes, cp);
      written.push('color-palettes.json');
      rowsAdded++;
      break;
    }

    case 'section_approved': {
      // Write to signatures, section-patterns, and technique-scores
      const sig = (await readJSON(FILES.signatures)) || { approved: [], rejected: [] };
      sig.approved.push({
        date: data.date || today(),
        project: data.project || null,
        section: data.section || null,
        sectionType: data.sectionType || null,
        element: data.element || null,
        description: data.description || null,
        whyItWorked: data.whyItWorked || null,
        userRating: data.userRating || null,
      });
      await writeJSON(FILES.signatures, sig);
      await renderMd(FILES.signatures, sig);
      written.push('signatures.json');
      rowsAdded++;

      // Section patterns
      if (data.sectionType) {
        const sp = (await readJSON(FILES.sectionPatterns)) || { patterns: [] };
        sp.patterns.push({
          date: data.date || today(),
          project: data.project || null,
          sectionType: data.sectionType || null,
          layout: data.layout || null,
          motion: data.motion || null,
          keyTechnique: data.keyTechnique || null,
          score: data.score != null ? data.score : null,
          userRating: data.userRating || null,
        });
        await writeJSON(FILES.sectionPatterns, sp);
        await renderMd(FILES.sectionPatterns, sp);
        if (!written.includes('section-patterns.json')) written.push('section-patterns.json');
        rowsAdded++;
      }

      // Technique scores
      if (data.technique) {
        const ts = (await readJSON(FILES.techniqueScores)) || { techniques: [] };
        const existing = ts.techniques.find(t => t.name === data.technique);
        if (existing) {
          existing.timesUsed++;
          if (data.score != null) {
            existing.scores.push(data.score);
            existing.avgScore = +(existing.scores.reduce((a, b) => a + b, 0) / existing.scores.length).toFixed(1);
          }
          if (data.sectionType && !existing.bestWith.includes(data.sectionType)) {
            existing.bestWith.push(data.sectionType);
          }
        } else {
          ts.techniques.push({
            name: data.technique,
            timesUsed: 1,
            avgScore: data.score != null ? data.score : null,
            avgUserRating: data.userRating || null,
            scores: data.score != null ? [data.score] : [],
            bestWith: data.sectionType ? [data.sectionType] : [],
            notes: data.techniqueNotes || null,
          });
        }
        await writeJSON(FILES.techniqueScores, ts);
        await renderMd(FILES.techniqueScores, ts);
        if (!written.includes('technique-scores.json')) written.push('technique-scores.json');
        rowsAdded++;
      }
      break;
    }

    case 'section_rejected': {
      const sig = (await readJSON(FILES.signatures)) || { approved: [], rejected: [] };
      sig.rejected.push({
        date: data.date || today(),
        project: data.project || null,
        section: data.section || null,
        element: data.element || null,
        feedback: data.feedback || null,
        lesson: data.lesson || null,
      });
      await writeJSON(FILES.signatures, sig);
      await renderMd(FILES.signatures, sig);
      written.push('signatures.json');
      rowsAdded++;
      break;
    }

    case 'user_change': {
      const rp = (await readJSON(FILES.revisionPatterns)) || { patterns: [] };
      rp.patterns.push({
        date: data.date || today(),
        project: data.project || null,
        phase: data.phase || null,
        whatChanged: data.whatChanged || null,
        original: data.original || null,
        revised: data.revised || null,
        pattern: data.pattern || null,
      });
      await writeJSON(FILES.revisionPatterns, rp);
      await renderMd(FILES.revisionPatterns, rp);
      written.push('revision-patterns.json');
      rowsAdded++;
      break;
    }

    case 'pipeline_issue': {
      const pl = (await readJSON(FILES.pipelineLessons)) || { lessons: [] };
      pl.lessons.push({
        date: data.date || today(),
        project: data.project || null,
        phase: data.phase || null,
        issue: data.issue || null,
        resolution: data.resolution || null,
        prevention: data.prevention || null,
      });
      await writeJSON(FILES.pipelineLessons, pl);
      await renderMd(FILES.pipelineLessons, pl);
      written.push('pipeline-lessons.json');
      rowsAdded++;
      break;
    }

    case 'rule_discovered': {
      const rules = (await readJSON(FILES.rules)) || { rules: [], nextId: 1 };
      const id = `RULE-${String(rules.nextId).padStart(3, '0')}`;
      rules.rules.push({
        id,
        text: data.rule || data.text || null,
        source: data.source || null,
        validations: 1,
        status: 'CANDIDATE',
        promotedTo: null,
        promotedAt: null,
        createdAt: data.date || today(),
      });
      rules.nextId++;
      await writeJSON(FILES.rules, rules);
      await renderMd(FILES.rules, rules);
      written.push('rules.json');
      rowsAdded++;
      break;
    }

    case 'rule_validated': {
      const rules = (await readJSON(FILES.rules)) || { rules: [], nextId: 1 };
      const ruleId = data.id || data.ruleId;
      const ruleText = data.rule || data.text;

      let target = null;
      if (ruleId) {
        target = rules.rules.find(r => r.id === ruleId);
      }
      if (!target && ruleText) {
        target = rules.rules.find(r => r.text && r.text.toLowerCase().includes(ruleText.toLowerCase()));
      }

      if (!target) {
        fail(`Rule not found: ${ruleId || ruleText}`);
      }

      target.validations = (target.validations || 0) + 1;
      if (target.validations >= 3 && target.status !== 'PROMOTED') {
        target.status = 'PROMOTED';
        target.promotedTo = 'CLAUDE.md';
        target.promotedAt = today();
      }

      await writeJSON(FILES.rules, rules);
      await renderMd(FILES.rules, rules);
      written.push('rules.json');
      rowsAdded = 0; // validation, not addition
      break;
    }

    default:
      fail(`Unknown event: ${event}. Valid: font_selected, font_rejected, palette_selected, palette_rejected, section_approved, section_rejected, user_change, pipeline_issue, rule_discovered, rule_validated`);
  }

  output({ written, rowsAdded });
}

// ---------------------------------------------------------------------------
// THRESHOLD — compute dynamic quality threshold
// ---------------------------------------------------------------------------

async function computeThreshold(sectionType) {
  const sp = await readJSON(FILES.sectionPatterns);
  const cal = (await readJSON(FILES.calibration)) || { projects: [], globalBias: 0.0, thresholdAdjustment: 0.0 };

  if (!sp || !sectionType) {
    return {
      scoreMinimum: 7.0,
      historicalAvg: null,
      dataPoints: 0,
      isDefault: true,
      bias: cal.globalBias || 0.0,
    };
  }

  const matching = sp.patterns.filter(p =>
    p.sectionType && p.sectionType.toLowerCase().includes(sectionType.toLowerCase())
  );

  if (matching.length === 0) {
    return {
      scoreMinimum: 7.0,
      historicalAvg: null,
      dataPoints: 0,
      isDefault: true,
      bias: cal.globalBias || 0.0,
    };
  }

  const scores = matching.map(p => p.score).filter(s => s != null);
  if (scores.length === 0) {
    return {
      scoreMinimum: 7.0,
      historicalAvg: null,
      dataPoints: matching.length,
      isDefault: true,
      bias: cal.globalBias || 0.0,
    };
  }

  const historicalAvg = +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  const scoreMinimum = +Math.max(7.0, historicalAvg - 0.3 + (cal.thresholdAdjustment || 0)).toFixed(1);

  return {
    scoreMinimum,
    historicalAvg,
    dataPoints: scores.length,
    isDefault: false,
    bias: cal.globalBias || 0.0,
  };
}

async function cmdThreshold(args) {
  const sectionType = args['section-type'];
  if (!sectionType) fail('--section-type is required');
  output(await computeThreshold(sectionType));
}

// ---------------------------------------------------------------------------
// PROMOTE — auto-promote rules with 3+ validations
// ---------------------------------------------------------------------------

async function cmdPromote() {
  const rules = (await readJSON(FILES.rules)) || { rules: [], nextId: 1 };

  const promoted = [];
  const pending = [];

  for (const r of rules.rules) {
    if (r.validations >= 3 && r.status !== 'PROMOTED') {
      r.status = 'PROMOTED';
      r.promotedTo = 'CLAUDE.md';
      r.promotedAt = today();
      promoted.push({ id: r.id, rule: r.text });
    } else if (r.status !== 'PROMOTED') {
      pending.push({ id: r.id, rule: r.text, validations: r.validations });
    }
  }

  if (promoted.length > 0) {
    await writeJSON(FILES.rules, rules);
    await renderMd(FILES.rules, rules);
  }

  output({ promoted, pending });
}

// ---------------------------------------------------------------------------
// STATS — counts for each memory file
// ---------------------------------------------------------------------------

async function cmdStats() {
  const fp = (await readJSON(FILES.fontPairings)) || { works: [], failures: [] };
  const cp = (await readJSON(FILES.colorPalettes)) || { works: [], failures: [] };
  const sig = (await readJSON(FILES.signatures)) || { approved: [], rejected: [] };
  const sp = (await readJSON(FILES.sectionPatterns)) || { patterns: [] };
  const ts = (await readJSON(FILES.techniqueScores)) || { techniques: [] };
  const rp = (await readJSON(FILES.revisionPatterns)) || { patterns: [] };
  const pl = (await readJSON(FILES.pipelineLessons)) || { lessons: [] };
  const rules = (await readJSON(FILES.rules)) || { rules: [], nextId: 1 };
  const cal = (await readJSON(FILES.calibration)) || { projects: [], globalBias: 0.0 };

  const promotedCount = rules.rules.filter(r => r.status === 'PROMOTED').length;
  const candidateCount = rules.rules.filter(r => r.status !== 'PROMOTED').length;

  const totalDataPoints =
    fp.works.length + fp.failures.length +
    cp.works.length + cp.failures.length +
    sig.approved.length + sig.rejected.length +
    sp.patterns.length +
    ts.techniques.length +
    rp.patterns.length +
    pl.lessons.length +
    rules.rules.length;

  output({
    fontPairings: { works: fp.works.length, failures: fp.failures.length },
    colorPalettes: { works: cp.works.length, failures: cp.failures.length },
    signatures: { approved: sig.approved.length, rejected: sig.rejected.length },
    sectionPatterns: sp.patterns.length,
    techniqueScores: ts.techniques.length,
    revisionPatterns: rp.patterns.length,
    pipelineLessons: pl.lessons.length,
    rules: { promoted: promotedCount, candidate: candidateCount, total: rules.rules.length },
    totalDataPoints,
    calibration: { projects: cal.projects.length, globalBias: cal.globalBias },
  });
}

// ---------------------------------------------------------------------------
// Main dispatch
// ---------------------------------------------------------------------------

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0];
  const args = parseArgs(argv.slice(1));

  if (!command) {
    fail('Usage: eros-memory.mjs <interpret|learn|threshold|promote|stats|migrate> [options]');
  }

  // Ensure memory directory exists
  await fs.mkdir(MEMORY_DIR, { recursive: true });

  switch (command) {
    case 'interpret': await cmdInterpret(args); break;
    case 'learn':     await cmdLearn(args); break;
    case 'threshold': await cmdThreshold(args); break;
    case 'promote':   await cmdPromote(); break;
    case 'stats':     await cmdStats(); break;
    case 'migrate':   await cmdMigrate(); break;
    default:
      fail(`Unknown command: ${command}. Valid: interpret, learn, threshold, promote, stats, migrate`);
  }
}

main().catch(err => {
  process.stderr.write(`Fatal: ${err.message}\n${err.stack}\n`);
  process.exit(1);
});
