#!/bin/bash
# eros-auto-practice.sh — Eros autonomous training loop
#
# Generates a practice brief, launches Claude Code to build it,
# then reflects and learns from the result.
#
# Usage: bash eros-auto-practice.sh [--count N] [--dry-run]
#
# Requires: claude CLI in PATH, node, maqueta scripts

set -e

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
MAQUETA_DIR="$(dirname "$SCRIPTS_DIR")"
PRACTICE_DIR="$MAQUETA_DIR/_practice"
COUNT=1
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --count) COUNT="$2"; shift 2;;
    --dry-run) DRY_RUN=true; shift;;
    *) shift;;
  esac
done

echo ""
echo "═══════════════════════════════════════════"
echo " EROS AUTONOMOUS PRACTICE"
echo " Sessions: $COUNT"
echo "═══════════════════════════════════════════"
echo ""

for i in $(seq 1 $COUNT); do
  echo "──── Session $i/$COUNT ────"
  echo ""

  # 1. Generate practice brief
  echo "[eros] Generating practice brief..."
  BRIEF_JSON=$(cd "$SCRIPTS_DIR" && node eros-practice.mjs generate 2>/dev/null)
  BRIEF_ID=$(echo "$BRIEF_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.brief?.id || 'unknown')" 2>/dev/null)
  BRIEF_PATH="$PRACTICE_DIR/$BRIEF_ID.json"
  MOOD=$(echo "$BRIEF_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.brief?.mood || 'dark')" 2>/dev/null)
  TYPE=$(echo "$BRIEF_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.brief?.type || 'portfolio')" 2>/dev/null)
  NAME=$(echo "$BRIEF_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.brief?.name || 'Practice')" 2>/dev/null)
  OBJECTIVE=$(echo "$BRIEF_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.brief?.objective || '')" 2>/dev/null)
  TECHNIQUE=$(echo "$BRIEF_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.brief?.techniqueChallenge || '')" 2>/dev/null)
  SECTIONS=$(echo "$BRIEF_JSON" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log((d.brief?.sections||[]).join(', '))" 2>/dev/null)

  echo "[eros] Brief: $BRIEF_ID"
  echo "[eros] Name: $NAME | Type: $TYPE | Mood: $MOOD"
  echo "[eros] Objective: $OBJECTIVE"
  echo "[eros] Technique: $TECHNIQUE"
  echo "[eros] Sections: $SECTIONS"
  echo ""

  if [ "$DRY_RUN" = true ]; then
    echo "[eros] DRY RUN — skipping build"
    echo ""
    continue
  fi

  # 2. Build the prompt for Claude Code
  PROJECT_SLUG="practice-$(date +%s)"
  PROJECT_DIR="$HOME/Desktop/$PROJECT_SLUG"

  PROMPT="/project

## Brief
**Nombre:** $NAME
**Tipo:** $TYPE
**Mood:** $MOOD
**Esquema:** $(echo $MOOD | grep -q 'light\|pastel' && echo 'light' || echo 'dark')
**Modo:** autonomous
**Secciones:** $SECTIONS
**Desafío técnico:** $TECHNIQUE
**Objetivo:** $OBJECTIVE

Construir rápido — es un proyecto de práctica para entrenar. Priorizar las secciones listadas.
No usar referencias externas. Creatividad libre."

  echo "[eros] Launching Claude Code for $PROJECT_SLUG..."
  echo ""

  # 3. Run Claude Code in headless mode
  cd "$MAQUETA_DIR"
  timeout 600 claude -p "$PROMPT" 2>&1 | tail -20 || echo "[eros] Claude session ended"

  echo ""

  # 4. Reflect and learn
  if [ -d "$PROJECT_DIR/.eros" ]; then
    echo "[eros] Reflecting on $PROJECT_SLUG..."
    cd "$SCRIPTS_DIR"
    node eros-train.mjs correct --project "$PROJECT_DIR" 2>/dev/null || true
    node eros-meta.mjs reflect --project "$PROJECT_DIR" 2>/dev/null | head -10 || true
    node eros-meta.mjs personality 2>/dev/null > /dev/null || true
    echo "[eros] Practice recorded."
  else
    echo "[eros] No .eros/ found — project may not have been created."
  fi

  echo ""
  echo "[eros] Memory stats after session $i:"
  cd "$SCRIPTS_DIR"
  node eros-memory.mjs stats 2>/dev/null | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log('  Data points:', d.totalDataPoints, '| Patterns:', d.sectionPatterns, '| Rules:', d.rules?.total)" 2>/dev/null || true
  echo ""

  # 5. Cleanup practice project (keep only the learnings)
  if [ -d "$PROJECT_DIR" ] && [ "$PROJECT_SLUG" != "" ]; then
    echo "[eros] Cleaning up $PROJECT_SLUG (learnings preserved in memory)..."
    rm -rf "$PROJECT_DIR"
  fi

  echo "──── Session $i/$COUNT complete ────"
  echo ""
done

echo "═══════════════════════════════════════════"
echo " PRACTICE COMPLETE"
echo "═══════════════════════════════════════════"
echo ""

# Final personality update
cd "$SCRIPTS_DIR"
echo "[eros] Updating personality..."
node eros-meta.mjs personality 2>/dev/null | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log('State:', d.identity?.currentState);console.log('Philosophy:', d.voice?.philosophy)" 2>/dev/null || true
echo ""
