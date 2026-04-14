# DESIGN.md Standard — Study Notes

**Source:** [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (34,775 stars)
**Standard authored by:** Google Stitch — [design-md overview](https://stitch.withgoogle.com/docs/design-md/overview/)
**Distribution:** `npx getdesign@latest add <site>` (npm package `getdesign`, v0.4.0)
**Studied on:** 2026-04-09

---

## What is DESIGN.md?

A **plain-text design system document** that AI agents read to generate consistent UI. It's the design counterpart of `AGENTS.md`:

| File | Who reads it | What it defines |
|---|---|---|
| `AGENTS.md` | Coding agents | How to build the project |
| `DESIGN.md` | Design agents | How the project should look and feel |

Format is **pure markdown** — no Figma export, no JSON schema, no special tooling. Drop it in the project root and any AI coding agent instantly understands how your UI should look. Markdown is the format LLMs read best; nothing to parse or configure.

The awesome-design-md repo has **58 DESIGN.md files** extracted from real sites, categorized into:
- AI & ML (12): Claude, Cohere, ElevenLabs, Mistral, Ollama, OpenCode, Replicate, RunwayML, Together, VoltAgent, xAI, Minimax
- Dev Tools (14): Cursor, Expo, Linear, Lovable, Mintlify, PostHog, Raycast, Resend, Sentry, Supabase, Superhuman, Vercel, Warp, Zapier
- Infrastructure (6): ClickHouse, Composio, HashiCorp, MongoDB, Sanity, Stripe
- Design & Productivity (10): Airtable, Cal.com, Clay, Figma, Framer, Intercom, Miro, Notion, Pinterest, Webflow
- Fintech (4): Coinbase, Kraken, Revolut, Wise
- Enterprise/Consumer (7): Airbnb, Apple, IBM, NVIDIA, SpaceX, Spotify, Uber
- Cars (5): BMW, Ferrari, Lamborghini, Renault, Tesla

## The 9 canonical sections

Every file follows this structure (studied from `claude.md`, `linear.app.md`, `vercel.md`, `stripe.md`, `apple.md`, `ferrari.md` — all saved locally under `./design-md-exemplars/`):

1. **Visual Theme & Atmosphere** — prose description of the mood, density, design philosophy. Not "it uses dark colors" but "a literary salon reimagined as a product page — warm, unhurried, quietly intellectual". Ends with a bulleted **Key Characteristics** list (7–10 lines).

2. **Color Palette & Roles** — semantic name + hex + functional role + emotional description. Sub-grouped into: `Primary`, `Secondary & Accent`, `Surface & Background`, `Neutrals & Text`, `Semantic & Accent`, `Gradient System`. Every color has a NAME (e.g. "Parchment" not "background-1") because agents write about it with that name.

3. **Typography Rules** — Font families + full hierarchy TABLE with columns: Role, Font, Size (px and rem), Weight, Line Height, Letter Spacing, Notes. Every row is a named role (Display, Section Heading, Sub-heading Large, etc.). Plus a `### Principles` list explaining the philosophy (e.g. "Serif for authority, sans for utility").

4. **Component Stylings** — Per-component sub-sections: Buttons (with 4–6 variants each spec'd fully), Cards & Containers, Inputs & Forms, Navigation, Image Treatment, Distinctive Components (the unique pieces — Claude's "Model Comparison Cards", Ferrari's "Chiaroscuro Editorial Blocks").

5. **Layout Principles** — Spacing System (base unit + scale), Grid & Container (max-width, breakpoints, column counts), Whitespace Philosophy (prose — "editorial pacing", "content island approach"), Border Radius Scale (7 levels from sharp 4px to maximum 32px, each named).

6. **Depth & Elevation** — Table with Level (0–4), Treatment (CSS), Use (when to apply). Plus a `### Shadow Philosophy` paragraph and `### Decorative Depth` notes. Claude's entry is a masterclass: "depth through warm-toned ring shadows rather than traditional drop shadows" — the signature `0px 0px 0px 1px` pattern.

7. **Do's and Don'ts** — Bulleted lists, VERY specific. Not "use good colors" but "don't use cool blue-grays anywhere — the palette is exclusively warm-toned". These convert directly to constraints an agent can check against.

8. **Responsive Behavior** — Breakpoints table (Small Mobile <479, Mobile, Large Mobile, Tablet, Desktop), Touch Targets, Collapsing Strategy (per component: "3-column → stacked", "64px → 36px → 25px progressive"), Image Behavior.

9. **Agent Prompt Guide** ← **THE KEY INNOVATION.** A dedicated section written directly FOR AI agents. Contains:
   - **Quick Color Reference**: `"Brand CTA": "Terracotta Brand (#c96442)"` — a ready-to-copy lookup.
   - **Example Component Prompts**: 5–6 copy-paste prompts like `"Create a hero section on Parchment (#f5f4ed) with a headline at 64px Anthropic Serif weight 500, line-height 1.10. Use Anthropic Near Black (#141413) text..."`
   - **Iteration Guide**: 6–10 rules for iterating on the design ("Focus on ONE component at a time", "Reference specific color names — 'use Olive Gray (#5e5d59)' not 'make it gray'").

## Why this matters for Eros

Eros already outputs `DESIGN.md` per project (via `init-project.mjs` + designer agent), but **the format is NOT aligned to this standard**. Eros's current DESIGN.md is more of a legacy bridge document. Aligning to this spec would mean:

1. **Eros's projects become portable** — someone who gets a project built by Eros could share the DESIGN.md, and any other AI agent (Claude, Cursor, GitHub Copilot Workspace, Stitch) could continue building in the same style.
2. **Eros can CONSUME the 58 existing ones** — when someone says "build me a site like Linear", Eros can download `linear.app.md` and feed it to the builder agent as a baseline, then iterate.
3. **Agent Prompt Guide becomes the canonical output format for the designer agent** — instead of writing abstract prose about "the vibe", the designer agent writes copy-paste prompts that the builder agent can execute verbatim.
4. **Don'ts become promoted rules** — "Don't use cool blue-grays anywhere" from Claude's DESIGN.md maps directly to a rule in Eros's `rules.json`. Every DESIGN.md in the repo is a source of 8–12 potential promoted rules.

## What I'd change in Eros

In order of effort/impact:

### P0 — add a `eros-designmd.mjs` converter (small, high value)
A script that reads the 58 exemplars from `./design-md-exemplars/` (plus any future ones downloaded via `npx getdesign`) and lets Eros:
- `node eros-designmd.mjs list` — list all available exemplars
- `node eros-designmd.mjs show <slug>` — print one exemplar
- `node eros-designmd.mjs ingest <slug>` — extract design tokens, rules, techniques into Eros's memory (color-palettes.json, font-pairings.json, rules.json as CANDIDATE rules)
- `node eros-designmd.mjs generate --project <path>` — produce a DESIGN.md in the standard 9-section format from a finished Eros project

### P1 — align the designer agent output format (medium, high value)
Update `.eros/memory/design-intelligence/rules.md` or the designer's context template so the output IS a 9-section DESIGN.md instead of the current format. Specifically, force the `## 9. Agent Prompt Guide` section to be written — that's what makes the handoff to builder agents actually work.

### P2 — use exemplars as style references in auto-train (medium, medium value)
When generating a practice brief, pull a random exemplar matching the target mood (e.g. "dark cinematic" → ElevenLabs/Ferrari/Minimax). Feed it as a reference instead of the Awwwards scrape. Much more detailed and consistent than a scraped Playwright analysis.

### P3 — contribute back (low effort, high visibility)
Once Eros's 20+ built projects are good, extract their DESIGN.md files in the standard format and submit PRs to the awesome-design-md repo. This is how Eros's work becomes public-facing research.

## Local exemplars saved

6 representative files under `.eros/memory/design-intelligence/references/design-md-exemplars/`:

| File | Style archetype |
|---|---|
| `claude.md` | Warm editorial, serif-driven, terracotta accent (literary salon) |
| `linear.app.md` | Ultra-minimal, precise, purple accent (engineering focus) |
| `vercel.md` | Black and white precision, Geist font (Swiss) |
| `stripe.md` | Signature purple gradients, weight-300 elegance (fintech) |
| `apple.md` | Premium white space, SF Pro, cinematic imagery (consumer) |
| `ferrari.md` | Chiaroscuro black-white editorial, Ferrari Red (luxury extreme) |

Plus `manifest.json` with the full list of 58 sites (brand, description, templateHash, sourceCommit).

## Key quote

From the awesome-design-md README:

> "Copy a DESIGN.md into your project, tell your AI agent 'build me a page that looks like this' and get pixel-perfect UI that actually matches."

That's the goal state for Eros: when a user says "build me a thoughtful AI product page", Eros pulls `claude.md`, feeds it to the builder, and the result is indistinguishable in spirit from Anthropic's actual site.
