#!/usr/bin/env node
// .eros/scripts/eros-doctor.mjs
// Validates Eros multi-AI architecture integrity.
// Usage: node .eros/scripts/eros-doctor.mjs

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const REPO_ROOT = process.cwd();
const issues = [];
const warnings = [];

function assert(condition, message) {
  if (!condition) issues.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

// RULE 1: Root files exist
const rootFiles = ['EROS.md', 'AGENTS.md', 'CLAUDE.md', 'GEMINI.md'];
for (const file of rootFiles) {
  assert(existsSync(join(REPO_ROOT, file)), `Missing root file: ${file}`);
}
assert(!existsSync(join(REPO_ROOT, 'CODEX.md')), `CODEX.md must not exist at root — Codex reads AGENTS.md natively`);

// RULE 2: .eros/ canonical structure
const erosDirs = ['.eros', '.eros/agents', '.eros/workflows', '.eros/memory', '.eros/scripts'];
for (const dir of erosDirs) {
  assert(existsSync(join(REPO_ROOT, dir)), `Missing .eros/ subdirectory: ${dir}`);
}
const erosFiles = ['.eros/pipeline.md', '.eros/brain-config.md'];
for (const file of erosFiles) {
  assert(existsSync(join(REPO_ROOT, file)), `Missing canonical brain file: ${file}`);
}

// RULE 3: Adapter directories exist
const adapterDirs = ['.claude', '.gemini', '.codex'];
for (const dir of adapterDirs) {
  assert(existsSync(join(REPO_ROOT, dir)), `Missing adapter directory: ${dir}`);
}

// RULE 4 (anti-contamination): AGENTS.md must be AI-neutral
if (existsSync(join(REPO_ROOT, 'AGENTS.md'))) {
  const agentsContent = readFileSync(join(REPO_ROOT, 'AGENTS.md'), 'utf8');
  const contaminants = [
    { pattern: /Skill\s*\(/, name: 'Skill() tool (Claude-specific)' },
    { pattern: /Task\s*\(\s*subagent_type/, name: 'Task(subagent_type) (Claude-specific)' },
    { pattern: /activate_skill/, name: 'activate_skill (Gemini-specific)' },
  ];
  for (const { pattern, name } of contaminants) {
    if (pattern.test(agentsContent)) {
      issues.push(`AGENTS.md contamination: contains ${name} — move to adapter file`);
    }
  }
  // For AI brand names, only flag if they appear OUTSIDE path references
  // (path refs like `.claude/`, `CLAUDE.md`, `.codex/`, etc. are legitimate)
  const lines = agentsContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Strip path-like tokens and their inline comments
    const stripped = line
      // Strip full path tokens (e.g. .claude/skills/foo, .claude/)
      .replace(/\.claude\/[\w/.-]*/g, '')
      .replace(/\.gemini\/[\w/.-]*/g, '')
      .replace(/\.codex\/[\w/.-]*/g, '')
      // Strip markdown file refs (backtick or bare)
      .replace(/`?CLAUDE\.md`?/g, '')
      .replace(/`?GEMINI\.md`?/g, '')
      .replace(/`?AGENTS\.md`?/g, '')
      .replace(/`?EROS\.md`?/g, '')
      // Strip inline directory-comment labels (e.g. "<- Claude adapter: ...")
      .replace(/<-\s*(Claude|Gemini|Codex)[^<]*/g, '')
      // Strip reference-table label prefixes (e.g. "- Claude specifics:", "- Gemini specifics:")
      .replace(/[-*]\s*(Claude|Gemini|Codex)\s+\w+:/g, '');
    if (/\b(Claude|Gemini|Codex)\b/.test(stripped)) {
      issues.push(`AGENTS.md line ${i + 1}: AI-brand jargon outside path reference — "${line.trim().slice(0, 80)}"`);
    }
  }
}

// RULE 5 (cross-reference): CLAUDE.md and GEMINI.md must reference EROS + AGENTS
for (const file of ['CLAUDE.md', 'GEMINI.md']) {
  const path = join(REPO_ROOT, file);
  if (existsSync(path)) {
    const content = readFileSync(path, 'utf8');
    assert(/EROS\.md/.test(content), `${file} does not reference EROS.md`);
    assert(/AGENTS\.md/.test(content), `${file} does not reference AGENTS.md`);
  }
}

// RULE 6 (path integrity): .eros/ files should not reference legacy .claude/ brain paths
function scanDirForLegacyRefs(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      scanDirForLegacyRefs(full);
    } else if (entry.endsWith('.md') || entry.endsWith('.mjs') || entry.endsWith('.json')) {
      const content = readFileSync(full, 'utf8');
      const badPatterns = [
        /\.claude\/memory/,
        /\.claude\/pipeline/,
        /\.claude\/brain-config/,
        /\.claude\/FRONT_BRAIN/,
        /\.claude\/front-brain/,
      ];
      for (const p of badPatterns) {
        if (p.test(content)) {
          warnings.push(`${relative(REPO_ROOT, full)} contains legacy .claude/ brain reference (should be .eros/)`);
          break;
        }
      }
    }
  }
}
scanDirForLegacyRefs(join(REPO_ROOT, '.eros'));

// RULE 7: No legacy .agents/ directory
warn(!existsSync(join(REPO_ROOT, '.agents')), `Legacy .agents/ directory still exists — delete in Phase 5`);

// RULE 8 (docs entry point): docs/README.md must exist
assert(
  existsSync(join(REPO_ROOT, 'docs', 'README.md')),
  'Missing docs/README.md — AI entry point required for docs/ layout',
);

// RULE 9 (no legacy naming): no PLAN-*.md files in docs/ root
const docsRootDir = join(REPO_ROOT, 'docs');
if (existsSync(docsRootDir)) {
  const legacyPlans = readdirSync(docsRootDir).filter((f) => /^PLAN-.*\.md$/.test(f));
  if (legacyPlans.length > 0) {
    issues.push(
      `Legacy PLAN-*.md files in docs/ root: ${legacyPlans.join(', ')}. Move to docs/plans/ (active) or docs/archive/plans/ (implemented).`,
    );
  }
}

// RULE 10 (docs is prose): no image files in docs/ — observations belong in .eros/memory/
function scanDocsForImages(dir) {
  if (!existsSync(dir)) return [];
  const imageExts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
  const found = [];
  const walk = (d) => {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else {
        const dot = entry.lastIndexOf('.');
        if (dot !== -1 && imageExts.has(entry.slice(dot).toLowerCase())) {
          found.push(relative(REPO_ROOT, full).replace(/\\/g, '/'));
        }
      }
    }
  };
  walk(dir);
  return found;
}
const docsImages = scanDocsForImages(docsRootDir);
if (docsImages.length > 0) {
  const preview = docsImages.slice(0, 5).join(', ');
  const extra = docsImages.length > 5 ? ` +${docsImages.length - 5} more` : '';
  issues.push(
    `Image files in docs/ (relocate to .eros/memory/observations/): ${preview}${extra}`,
  );
}

// RULE 11 (scripts entry point): scripts/README.md must exist
assert(
  existsSync(join(REPO_ROOT, 'scripts', 'README.md')),
  'Missing scripts/README.md — AI entry point required for scripts/ layout',
);

// RULE 12 (no legacy root scripts): no eros-*.mjs files at scripts/ root
const scriptsRootDir = join(REPO_ROOT, 'scripts');
if (existsSync(scriptsRootDir)) {
  const legacyScripts = readdirSync(scriptsRootDir).filter((f) => /^eros-.*\.mjs$/.test(f));
  if (legacyScripts.length > 0) {
    issues.push(
      `Legacy eros-*.mjs files at scripts/ root: ${legacyScripts.join(', ')}. Move into a category subdir (brain/, memory/, observer/, quality/, pipeline/, panel/, dev/) or scripts/archive/.`,
    );
  }
}

// RULE 13 (every category has README): each scripts/ subdir must have a README.md
const requiredScriptsSubdirs = ['brain', 'memory', 'observer', 'quality', 'pipeline', 'panel', 'dev', 'lib', 'archive'];
if (existsSync(scriptsRootDir)) {
  for (const subdir of requiredScriptsSubdirs) {
    const subdirPath = join(scriptsRootDir, subdir);
    if (!existsSync(subdirPath)) {
      issues.push(`Missing scripts/${subdir}/ subdirectory — scripts restructure incomplete`);
      continue;
    }
    const readmePath = join(subdirPath, 'README.md');
    if (!existsSync(readmePath)) {
      issues.push(`Missing scripts/${subdir}/README.md — every category subdir needs an entry point`);
    }
  }
}

// Report
console.log('\n=== Eros Doctor Report ===\n');
if (issues.length === 0 && warnings.length === 0) {
  console.log('All checks passed.\n');
  process.exit(0);
}
if (issues.length > 0) {
  console.log(`${issues.length} issue(s):`);
  for (const issue of issues) console.log(`   - ${issue}`);
  console.log();
}
if (warnings.length > 0) {
  console.log(`${warnings.length} warning(s):`);
  for (const warning of warnings) console.log(`   - ${warning}`);
  console.log();
}
process.exit(issues.length > 0 ? 1 : 0);
