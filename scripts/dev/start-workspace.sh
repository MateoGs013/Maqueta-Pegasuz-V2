#!/usr/bin/env bash
# ═══════════════════════════════════════════
# Pegasuz Eros — Workspace Launcher
# Levanta las 3 terminales necesarias:
#   1. Watch mode (sync .eros/ → panel data)
#   2. Panel dev server (puerto 4000)
#   3. Instrucciones para lanzar un proyecto
# ═══════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PANEL_DIR="$ROOT_DIR/panel"

# Colors
O='\033[0;33m'  # orange
G='\033[0;32m'  # green
D='\033[0;90m'  # dim
R='\033[0m'     # reset
B='\033[1m'     # bold

echo ""
echo -e "${O}╔══════════════════════════════════════╗${R}"
echo -e "${O}║${R}  ${B}Pegasuz Eros${R} — Workspace            ${O}║${R}"
echo -e "${O}╚══════════════════════════════════════╝${R}"
echo ""

# ── 1. Start watch mode in background ──
echo -e "${G}[1/2]${R} Iniciando watch mode..."
node "$SCRIPT_DIR/../pipeline/sync-eros-feed-runs.mjs" --watch &
WATCH_PID=$!
echo -e "  ${D}PID: $WATCH_PID${R}"
echo ""

# ── 2. Start panel dev server ──
echo -e "${G}[2/2]${R} Iniciando panel en puerto 4000..."
echo ""
cd "$PANEL_DIR"
npx vite --port 4000 --host &
PANEL_PID=$!
echo ""

# ── Wait for server ──
sleep 3
echo ""
echo -e "${O}════════════════════════════════════════${R}"
echo -e "${B}  Panel:${R}  http://localhost:4000"
echo -e "${B}  Watch:${R}  activo (PID $WATCH_PID)"
echo -e "${O}════════════════════════════════════════${R}"
echo ""
echo -e "${D}  Para lanzar un proyecto, abri Claude Code y usa:${R}"
echo -e "${B}  /project${R}"
echo ""
echo -e "${D}  Ctrl+C para cerrar todo.${R}"
echo ""

# ── Cleanup on exit ──
cleanup() {
  echo ""
  echo -e "${O}Cerrando workspace...${R}"
  kill $WATCH_PID 2>/dev/null
  kill $PANEL_PID 2>/dev/null
  echo -e "${G}Listo.${R}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Keep alive
wait
