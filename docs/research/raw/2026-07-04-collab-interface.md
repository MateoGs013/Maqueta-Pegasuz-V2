# Raw research — Live collaboration surface (2026-07-04)

> Agente de investigación Fable. Fuentes web en vivo. Insumo para `docs/research/2026-07-04-fable-evolution.md`.

## (a) Pattern catalog — UI primitives worth stealing

| # | Primitive | What it is | Who does it | Steal for Eros |
|---|-----------|------------|-------------|----------------|
| 1 | **Instrumented live preview with element-level selection** | Running app served through a wrapper that stamps every element with a stable id (`data-oid`) at build time; clicking any element maps back to exact source, patched + HMR-reloaded | [Onlook](https://github.com/onlook-dev/onlook) (MIT, CodeSandbox SDK + oid instrumentation) | Centerpiece pane. Vite plugin stamping `data-eros-id` gives Mateo and Eros a shared coordinate system |
| 2 | **Point-and-edit / point-and-describe** | Click element → tweak properties directly (no tokens) or attach NL instruction to that element | [Figma Make](https://help.figma.com/hc/en-us/articles/31304485164695), [v0 Design Mode](https://community.vercel.com/t/introducing-design-mode-on-v0/13225) (design-mode edits are credit-free) | Mateo's primary input gesture; element-anchored instructions = structured events, not chat |
| 3 | **Annotation-on-live-page (comment pins)** | Pins/comments on the rendered page, threads anchored to elements | [Vercel Preview Comments](https://vercel.com/docs/comments), Playwright CLI [annotations for AI agents](https://azukiazusa.dev/en/blog/playwright-cli-ai-agent-visual-feedback/) | Bidirectional: Mateo pins feedback; **Eros pins its own critiques** — same visual language |
| 4 | **Draw-on-top iteration loop** | Screenshot on canvas; human marks it up with arrows/sketches; annotated image = next prompt | [tldraw "make real"](https://tldraw.dev/blog/make-real-the-story-so-far) | "Art direction" mode: Mateo scribbles over the hero screenshot |
| 5 | **Decision cards at real decision points (mixed-initiative)** | Structured choice — options with previews, recommendation, "you decide / I decide" dial. Interruption timing decides whether proactivity helps ([CHI 2025](https://arxiv.org/abs/2410.04596)) | [Devin Interactive Planning](https://docs.devin.ai/work-with-devin/interactive-planning); Claude Code AskUserQuestion | Core primitive: palette card shows 3 rendered swatches applied to a real section screenshot. Non-blocking queue + one blocking slot |
| 6 | **Visible agent workspace (follow mode)** | Tabbed panes auto-switching to what the agent is doing, "Following" toggle | [Devin](https://www.datacamp.com/tutorial/devin-ai) | "Eros is looking at…" strip: current capture, file, critique — presence without chat |
| 7 | **Side-by-side input/output, continuous regeneration** | Left: manipulable input; right: output updating live | [Krea Realtime](https://docs.krea.ai/realtime) | Token/CSS-variable changes applied instantly without the model |
| 8 | **Timeline scrubbing / version rail** | Every iteration snapshotted (screenshot + git ref); scrub visual history, fork from any point | v0 versions; Onlook checkpoints | Filmstrip of hero evolution; each capture paired with commit hash |
| 9 | **Diff overlay in the rendered page** | Before/after slider, onion-skin, highlight-changed-regions on screenshots | Percy/Chromatic visual regression | After each adjustment, before/after wipe on the affected section |
| 10 | **Ambient status + escalation** | Agent works silently; persistent ambient indicator; escalates only when input genuinely needed | Claude Code [Notification hooks](https://code.claude.com/docs/en/hooks) (`agent_needs_input` etc.) | Decision dock pulses only when a card arrives; never modal |
| 11 | **Structured elicitation forms** | Server sends JSON schema; client renders real form | [MCP Elicitation, Claude Code ≥2.1.76](https://claudelab.net/en/articles/claude-code/mcp-elicitation-support) | Decision cards can be MCP elicitations; or custom tool (preferido, ver (b)) |
| 12 | **Asset tray from generation MCPs** | Generated media lands in a tray; drag onto element to apply | Canva remote MCP, Adobe MCP via [`--mcp-config`](https://code.claude.com/docs/en/mcp) | Eros requests assets mid-build; results appear with provenance; Mateo approves/drags |

**NOT to copy:** Google Stitch / Subframe / Polymet (batch prompt→screens, no live loop). OpenAI Canvas / Claude Artifacts (document side-panels).

## (b) Recommended architecture

**Headline finding:** the June 15, 2026 change moving Agent SDK / `claude -p` to separate credits **was paused the day it took effect** — Agent SDK + headless still draw from the Pro/Max subscription ([The New Stack](https://thenewstack.io/anthropic-pauses-claude-agent-sdk-subscription-change/), [help center](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)). The Agent SDK spawns the locally installed, logged-in `claude` CLI → a **personal local** companion app inherits subscription OAuth, zero API keys. Caveats: (1) no `--bare` (bare mode requires ANTHROPIC_API_KEY); (2) ToS scopes this to personal use — can't ship as hosted product.

```
┌──────────────────────────────  BROWSER  ──────────────────────────────┐
│  Eros Surface (Vue 3)                                                 │
│  ┌───────────────────┐ ┌──────────────┐ ┌───────────────────────────┐ │
│  │ LIVE PREVIEW      │ │ DECISION DOCK│ │ EYES STRIP                │ │
│  │ iframe: Vite dev  │ │ cards from   │ │ latest capture + Eros's   │ │
│  │ server :5173 +    │ │ eros MCP     │ │ critique pins + timeline  │ │
│  │ data-eros-id      │ │ tools        │ │ filmstrip (git-pinned)    │ │
│  │ overlay + pins    │ │              │ │ before/after wipe         │ │
│  └───────────────────┘ └──────────────┘ └───────────────────────────┘ │
└───────────────▲───────────────────▲───────────────────────────────────┘
                │ WebSocket (state, cards, captures, pins)
┌───────────────┴──────────  EROS SERVER (Node, local)  ────────────────┐
│ 1. Session host: Claude Agent SDK (TS) query() streaming input        │
│    → spawns `claude` CLI → SUBSCRIPTION AUTH                          │
│ 2. In-process MCP server (createSdkMcpServer) exposing INTO session:  │
│      propose_decision(card) ── BLOCKS until UI answers                │
│      report_critique(capture_id, verdict, pins[])                     │
│      get_pending_feedback()  ← Mateo's element pins & scribbles       │
│      capture(view, breakpoint) → Playwright, returns image path       │
│ 3. HTTP hook receiver :4242 ← Claude Code hooks POST every event      │
│ 4. Watcher: chokidar src/** + Vite HMR hook → debounce →              │
│    Playwright capture → pixel diff → enqueue eyes-cycle               │
│ 5. State store: .eros/state/*.json + screenshot archive + git refs    │
└───────┬───────────────────────┬────────────────────────┬──────────────┘
        │ stdin/stdout          │ CDP/Playwright         │ HTTP MCP (OAuth)
┌───────▼──────────┐  ┌─────────▼─────────┐   ┌──────────▼─────────────┐
│ claude CLI       │  │ Headless Chromium │   │ Firefly / Canva /      │
│ (Agent SDK child)│  │ + Vite dev server │   │ Chrome DevTools MCP    │
└──────────────────┘  └───────────────────┘   └────────────────────────┘
```

**Mechanisms:**
1. **App → Session**: Agent SDK `query()` streaming input mode (async-generator prompt, persistent session; push messages as they happen). Supported successor of raw `claude -p --input-format stream-json` (NDJSON stdin [undocumented](https://github.com/anthropics/claude-code/issues/24594)).
2. **Session → App (decisions)**: custom MCP tools, **NOT AskUserQuestion** — it auto-resolves with empty answers in SDK programmatic mode ([#30983](https://github.com/anthropics/claude-code/issues/30983), closed not-planned). `propose_decision` handler simply doesn't resolve its Promise until the UI answers. Alternative: MCP elicitation (≥2.1.76).
3. **Session → App (telemetry)**: HTTP hooks (`type: "http"` → POST localhost:4242). PostToolUse (edits → refresh), Stop (can return `decision:"block"` — server-driven next/done), SubagentStop, Notification, PermissionRequest.
4. **Wake-on-change**: FileChanged hook + watchPaths, or server injects message via streaming input.
5. **Permissions**: `acceptEdits` + curated allowedTools + PermissionRequest HTTP hook → decision card instead of dead session.
6. **Media MCPs**: attach via `mcpServers` SDK options (HTTP transport, OAuth via elicitation URL-mode); results → asset tray via PostToolUse hook.

## (c) The eyes loop

Event-driven, debounced, **two-tier** (continuous cheap perception; periodic expensive critique):

1. **Trigger tier (deterministic, zero tokens).** Chokidar watches src/**; Vite HMR websocket confirms update applied; debounce ~800ms; long-lived Playwright context captures viewport screenshot at active breakpoint + console errors + optional a11y snapshot. Each capture: disk + git-ref tag + pixelmatch diff vs previous.
2. **Gating (economy).** Send to model only when: (a) pixel diff > threshold, (b) work unit finished (PostToolUse batch), (c) N minutes accumulated. Everything else just updates the filmstrip.
3. **Critique tier (in-session, subscription).** Server injects: "New capture: <path>. Critique against brief and your last stated intent; call report_critique." Better: **evaluator subagent** does look-and-judge so main thread only gets the verdict. Chrome DevTools MCP `take_snapshot` (a11y tree) for structural checks — pixels only for aesthetic judgment.
4. **Structured output**: `report_critique(capture_id, verdict: ship|adjust|rethink, pins:[{eros_id|bbox, severity, note}])`. Pins render on the preview overlay. Stop hook refuses phase end while unresolved `adjust` pins exist.
5. **Mateo's pins ride the same bus in reverse**: overlay click → server → immediate injection (if idle) or `get_pending_feedback()` drained at next checkpoint (CHI 2025: timing determines whether proactivity helps).

## (d) Risks & limitations

1. **Billing-policy volatility (highest).** Split announced May 14, paused Jun 15 — likely returns. Mitigation: single `query()` entry point; ToS scopes subscription OAuth to personal use.
2. **AskUserQuestion broken in programmatic mode** — use custom MCP tool. Verify `canUseTool` per release ([#227](https://github.com/anthropics/claude-agent-sdk-python/issues/227)).
3. **Rate limits.** 5-hour rolling windows + weekly caps; naive continuous loop burns them. Mitigations: pixel-diff gating, a11y-first checks, downscaled captures (~1200px), critique batching, subagents.
4. **Context growth.** Critiques stored as structured JSON in `.eros/state/` (re-injectable), never rely on transcript as archive; filmstrip on disk is source of truth.
5. **Headless one-shots kill background processes ~5s after result** — dev server + Playwright owned by the Node server, never started inside the session. One persistent streaming session, not repeated `-p`.
6. **Hook fragility:** HTTP hook failures silently non-blocking → server down = Eros "deaf" without errors. Heartbeat + link-health in UI.
7. **Preview instrumentation cost:** Vite plugin stamping ids; mapping Vue SFC elements back to template lines is the hardest engineering item (study Onlook `packages/parser`, MIT).
8. **Media MCP auth friction:** OAuth refresh failures mid-session → surface re-auth card, don't retry blindly.

Sources: [Onlook](https://github.com/onlook-dev/onlook) · [v0 Design Mode](https://community.vercel.com/t/introducing-design-mode-on-v0/13225) · [Figma Make](https://www.figma.com/blog/introducing-figma-make/) · [tldraw make real](https://tldraw.dev/blog/make-real-the-story-so-far) · [Krea Realtime](https://docs.krea.ai/realtime) · [Devin Interactive Planning](https://docs.devin.ai/work-with-devin/interactive-planning) · [CHI 2025](https://arxiv.org/abs/2410.04596) · [Agent SDK + plan](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan) · [SDK credit pause](https://thenewstack.io/anthropic-pauses-claude-agent-sdk-subscription-change/) · [Headless docs](https://code.claude.com/docs/en/headless) · [Hooks](https://code.claude.com/docs/en/hooks) · [#30983](https://github.com/anthropics/claude-code/issues/30983) · [MCP elicitation](https://claudelab.net/en/articles/claude-code/mcp-elicitation-support) · [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) · [Visual feedback handbook](https://tweag.github.io/agentic-coding-handbook/WORKFLOW_VISUAL_FEEDBACK/)
