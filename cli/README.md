# Eros — CLI

AI entry point for `cli/`. Go + Bubble Tea terminal wizard that collects a project brief, shells to `scripts/pipeline/init-project.mjs` for scaffolding, then hands off to Claude Code. Thin UX layer — zero domain logic duplicated from the Node pipeline.

**Status:** v0.1.0 (early preview). API and flags may shift between commits. Pin a commit hash for stability.

## Category map

| Directory | What lives here |
|-----------|----------------|
| [`cmd/`](./cmd/) | Cobra command definitions (`new`, `list`, `resume`, `template`) |
| [`internal/brief/`](./internal/brief/) | `Brief` struct matching `normalizeBrief` schema + derivation helpers |
| [`internal/slug/`](./internal/slug/) | Unicode-safe slugify mirroring the JS version in `bootstrap-eros-feed.mjs` |
| [`internal/paths/`](./internal/paths/) | Maqueta + project + script path discovery |
| [`internal/moods/`](./internal/moods/) | Mood profile loader shelling to `scripts/pipeline/export-moods.mjs` |
| [`internal/projects/`](./internal/projects/) | Scanner for existing Eros projects in `~/Desktop/` |
| [`internal/runner/`](./internal/runner/) | Process wrappers: node scripts, Claude launch, clipboard |
| [`internal/config/`](./internal/config/) | Per-user config dir, draft save/load |
| [`internal/templates/`](./internal/templates/) | Template store (save brief as reusable preset) |
| [`internal/tui/styles/`](./internal/tui/styles/) | Chrome primitives, theme, logo |
| [`internal/tui/keys/`](./internal/tui/keys/) | Global keymap |
| [`internal/tui/wizard/`](./internal/tui/wizard/) | State machine + 15 pantallas |
| [`testdata/fake-maqueta/`](./testdata/) | Fixture for running tests without the real maqueta |

## Install

### Global (recommended)

```powershell
.\scripts\install-cli.ps1
```

Installs `eros.exe` to `%LOCALAPPDATA%\Microsoft\WindowsApps\` — always on Windows 10/11 default PATH via execution aliases. No shell restart, no `setx`. The installer kills any running `eros.exe` before copying to prevent the binary from being locked.

Falls back to `%LOCALAPPDATA%\eros\bin\eros.exe` with a user-PATH patch if the primary target is blocked by policy.

Verify:

```powershell
eros --version
# eros version 0.1.0+commit.<hash>
```

### Local to the repo

```powershell
.\eros.ps1       # PowerShell native wrapper (recommended)
.\eros           # batch fallback for shells where .ps1 misbehaves
```

First run compiles automatically; subsequent runs are instant. Offers the global install prompt after the first successful build.

## Usage

```powershell
eros                      # open the wizard (alias of `eros new`)
eros new [slug]           # interactive wizard
eros list                 # existing projects in ~/Desktop/ with phase + progress
eros resume <slug>        # reopen Claude Code in an existing project
eros template list        # saved templates
eros template delete <n>  # delete a template
eros --version
eros --help
```

## Wizard flow

Fifteen screens collect a `Brief`, scaffold a project at `~/Desktop/{slug}/`, and hand off to Claude Code.

| # | Screen | Purpose |
|---|--------|---------|
| 1  | splash           | Main menu — N new, R resume, L list, Q quit |
| 2  | template_loader  | Pick a saved template or start from scratch |
| 3  | name             | Project name (slug derived live) |
| 4  | type             | Project archetype (creative-studio, product-saas, etc.) |
| 5  | mood             | Visual direction with live-tinted preview |
| 6  | scheme           | dark vs light |
| 7  | pages            | Multi-select predefined + custom pages |
| 8  | mode             | autonomous · interactive · supervised |
| 9  | references       | URL-validated reference list (optional) |
| 10 | constraints      | Freeform hard rules (optional) |
| 11 | banned_seeds     | 31 seed families to avoid (optional) |
| 12 | summary          | Review before commit |
| 13 | exec             | Scaffold + bootstrap `.eros/` |
| 14 | launch           | `npm install` + launch Claude Code |
| —  | advanced         | Overlay (Ctrl+A) — audience, description, brand, backend |
| —  | error            | Retry / edit / copy error / quit on exec failure |

## Shortcuts

| Key | Action |
|-----|--------|
| `Enter`       | Confirm / advance |
| `Esc` · `←`   | Back |
| `Tab`         | Skip optional screen (references, constraints, banned_seeds) |
| `Ctrl+C`      | Cancel (saves a draft) |
| `Ctrl+S`      | Save current brief as a template |
| `Ctrl+A`      | Open the Advanced overlay |
| `Ctrl+E`      | Force manual slug editing (on the name screen) |
| `Ctrl+Y`      | Copy last error to clipboard |
| `?`           | Context help |
| `Q`           | Quit (splash only) |

## Requirements

- **Go 1.22+** — build. `winget install GoLang.Go` or <https://go.dev/dl/>
- **Node.js 18+** — the CLI shells to `scripts/pipeline/*.mjs`. `winget install OpenJS.NodeJS`
- **Claude Code** — handoff target. `npm install -g @anthropic-ai/claude-code`

If Claude Code is not on PATH, the wizard finishes anyway and copies the equivalent launch command to the clipboard.

## Configuration

| Variable / path | Purpose |
|-----------------|---------|
| `EROS_MAQUETA_DIR`                         | Override maqueta path. Default: `~/Desktop/Eros/` |
| `%APPDATA%\eros\templates\*.json`          | Saved templates (Windows) |
| `~/.config/eros/templates/*.json`          | Saved templates (Unix) |
| `%APPDATA%\eros\draft.json`                | Ctrl+C draft autosave |

## Architecture

The CLI is a **thin UX layer**. Validation, bootstrapping, and scaffolding live in Node (`scripts/pipeline/*.mjs`). The wizard serializes a JSON intake and shells to `init-project.mjs` — zero duplication of pipeline logic in Go.

Chrome pipeline in `internal/tui/styles/chrome.go` forces 24-bit truecolor at init and emits raw ANSI SGR for bg padding so the full-bleed NearBlack rectangle paints correctly on every terminal regardless of `colorprofile` detection. `Page(body, w, h)` sizes the content block tight to its widest line (floor `MinBlockWidth=40`, vertical floor `CardHeight=22`), left-aligns lines inside the block so items share a common left edge, and centers the block in the viewport.

Full spec: [`docs/superpowers/specs/2026-04-16-eros-cli-design.md`](../docs/superpowers/specs/2026-04-16-eros-cli-design.md).
Implementation plan: [`docs/superpowers/plans/2026-04-16-eros-cli.md`](../docs/superpowers/plans/2026-04-16-eros-cli.md).

## Development

```powershell
cd cli
go test ./...                     # unit + bleed + block-stability guards
go build -o bin/eros.exe ./
.\bin\eros.exe
```

Regression guards in `internal/tui/wizard/dump_test.go`:

- `TestDumpAllViews` — renders every pantalla and fails if any line matches the bleed signature (ANSI reset followed by 2+ plain spaces).
- `TestBlockStableForStableContent` — asserts every rendered line equals viewport width so gutter/block arithmetic stays correct across input states.

Set `EROS_DUMP=<path>` to capture the full ANSI-colored dump of every pantalla for visual QA.

## Troubleshooting

**`eros` not recognized after install**
The installer did not land in PATH. Run `.\scripts\install-cli.ps1` from the repo root and verify `%LOCALAPPDATA%\Microsoft\WindowsApps` is in `$env:PATH`. If your corporate policy blocks that location, the fallback path (`%LOCALAPPDATA%\eros\bin`) was patched onto user PATH — restart the shell.

**Violet bleed in the background**
Your terminal does not advertise truecolor and lipgloss falls back to plain-space padding. Upgrade to Windows Terminal or a VT-aware terminal. The CLI forces truecolor SGR at init but cannot override a terminal that rewrites escape sequences.

**Card shifts left**
You are running a stale global binary. A running `eros.exe` locks the target path; old installers fell through to the fallback silently. Kill running instances (`Get-Process eros | Stop-Process`) and reinstall — the current installer does this automatically.

**`spawn EINVAL` on the exec screen**
Node ≥ 18 on Windows throws `EINVAL` when spawning `.cmd`/`.bat` without `shell: true`. Patched in `scripts/pipeline/init-project.mjs` at HEAD; update the repo.

## For AI agents

1. Working in this directory? The CLI is a UX layer over `scripts/pipeline/init-project.mjs`. Do not duplicate pipeline logic in Go.
2. Adding a new pantalla? Add a state to `stepXXX` in `internal/tui/wizard/model.go`, a `{step}.go` with `update()` and `view()`, and wire both into `Model.Update` / `Model.View`.
3. Changing chrome? Read `internal/tui/styles/chrome.go` first. Every helper exists for a specific bleed/jitter root cause — don't revert to `lipgloss.Place` with `WithWhitespaceBackground`.
4. Touching the `Brief` struct? Field names must match `normalizeBrief` in `scripts/pipeline/bootstrap-eros-feed.mjs` — rename them together or the Node side breaks.

## Roadmap

v0.1 (current):
- [x] 15-screen wizard (splash → launch)
- [x] Global install with zero PATH restart
- [x] Card-tight block + left-aligned content, no jitter
- [x] Truecolor forced (no violet bleed)
- [x] Templates save/load
- [x] Post-wizard `npm install` visible in terminal

v0.2:
- [ ] `eros resume <slug>` functional (today it only re-opens Claude, does not resume phase state)
- [ ] `eros list` with real phase + progress from `.eros/state.md`
- [ ] Draft autosave on Ctrl+C
- [ ] Stream init-project logs into the exec pantalla instead of a mute spinner

v1.0:
- [ ] Persistent TUI (Approach C in the design spec)
- [ ] Live brief editing after launch
- [ ] Multi-mood interpolation
