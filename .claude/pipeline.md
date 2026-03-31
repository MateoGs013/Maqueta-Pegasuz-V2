# Pipeline V4 — Agent Architecture

## Project Isolation

Maqueta (`C:\Users\mateo\Desktop\maqueta`) is a **read-only template**.
Every project is created in a new directory: `C:\Users\mateo\Desktop\{project-slug}/`.

- `$MAQUETA_DIR` — template repo (scripts, scaffold, libraries, agents, skills)
- `$PROJECT_DIR` — the active project being built (docs, captures, src, node_modules)

The CEO creates `$PROJECT_DIR` in Phase 0 after the identity card is confirmed.
All subsequent paths (docs, captures, src) are relative to `$PROJECT_DIR`.

## Architecture: CEO + 4 Agents

The CEO (`/project` skill) orchestrates everything. Agents are specialized subprocesses
that receive ONLY the context they need and produce specific outputs.

**Context management is the CEO's #1 job.** Don't tell an agent "read the docs."
Extract the relevant parts and pass them inline. This keeps agent context small and focused.

**Every visual milestone requires user approval.** After QA passes, the CEO presents
a preview (screenshot) to the user. The user approves, requests changes, or rejects.
If changes are requested, the CEO applies them and re-presents. Nothing advances without
user sign-off. See `/project` skill for the User Review Protocol details.

---

## Agent Registry

| Agent | Role | Receives | Produces |
|-------|------|----------|----------|
| `reference-analyst` | Analyze captured screenshots + metadata | Screenshot paths (desktop + mobile) + manifest + original URL | `docs/reference-analysis.md` |
| `designer` | Design visual identity | Brief + full reference-analysis.md + ref frame paths | 6 foundation docs |
| `builder` | Build sections one by one | Recipe card + tokens + copy (extracted) | `S-{Name}.vue` + `AtmosphereCanvas.vue` |
| `polisher` | Implement motion + QA audit | Motion spec + section list (extracted) | Composables + preloader |

---

## Step 0: Gather Brief (CEO)

CEO gathers from the user:
- Project type, pages needed, inspiration URLs, mood, constraints
- Creates task breakdown using TodoWrite

**Gate:** Brief is clear. If ambiguous, CEO asks before proceeding.

---

## Step 0.5: Reference Analysis (if URLs provided)

### A: Capture (CEO runs directly)

**Single URL (auto-discovers internal pages, max 5):**
```bash
cd scripts && npm install --silent 2>/dev/null && node capture-refs.mjs "{url}" "../_ref-captures"
```

**Multiple URLs (batch mode):**
```bash
cd scripts && npm install --silent 2>/dev/null && node capture-refs.mjs --batch "{url1}" "{url2}" "{url3}" --out "../_ref-captures"
```

**Limit internal pages / disable discovery:**
```bash
cd scripts && npm install --silent 2>/dev/null && node capture-refs.mjs --max-pages 3 "{url}" "../_ref-captures"
cd scripts && npm install --silent 2>/dev/null && node capture-refs.mjs --no-discover "{url}" "../_ref-captures"
```

**Auto-discovery:** The script extracts nav/header links from the homepage and captures
internal pages automatically (max 5 by default). Each page gets its own directory:
- `_ref-captures/{domain}/` — homepage
- `_ref-captures/{domain}--about/` — /about page
- `_ref-captures/{domain}--work/` — /work page
- `_ref-captures/{domain}--index.json` — site-level index mapping all captured pages

**Produces per page in `_ref-captures/{domain}[--slug]/`:**
- `desktop/frame-NNN.png` — per-section desktop screenshots (1440px)
- `mobile/frame-NNN.png` — per-section mobile screenshots (375px)
- `interactions/scroll-desktop-NNN.png` — scroll-triggered animation captures
- `interactions/hover-NNN.png` — hover state captures
- `interactions/click-NNN-before.png` / `click-NNN-after.png` — click state before/after
- `full-page-desktop.png` + `full-page-mobile.png`
- `manifest.json` — rich metadata (v3.1, 4-pass sweep):
  - Clustered hex palette (text + bg, max 8 dominant colors each)
  - Exact font families + heading typography (size, weight, letter-spacing, line-height, text-transform, color)
  - Section boundaries with tag, class, id, scroll position, height
  - Tech stack (libraries, smooth scroll, custom cursor, font sources, framework)
  - CSS custom properties from `:root`
  - Media inventory (videos, canvases + WebGL, SVG, Lottie, layered images, background images)
  - **Interaction data:**
    - `scrollDiffs` — elements that changed opacity/transform/clipPath on scroll, with before/after CSS values
    - `headerBehavior` — type (static/sticky/transparent-to-solid/hide-on-scroll) with CSS diffs
    - `hoverStates` — elements that changed on hover with before/after CSS diffs
    - `clickStates` — tabs/accordions/modals with before/after screenshots and aria-expanded changes
  - Spacing system (scale, base unit, section padding consistency)
  - Layout patterns (grid/flex per section)
  - Navigation (desktop links + mobile type: hamburger/bottom-nav/visible-links)
  - Footer structure

### B: Analyze (Console: `reference-analyst`)
**Context contract:**
- IN: `_ref-captures/{domain}--index.json` — site-level index listing all captured pages per domain
- IN: paths to `_ref-captures/{domain}[--slug]/` — all screenshots (desktop + mobile + interactions) + manifest v3.1 per page
- IN: The original URL (analyst may use WebFetch to read page source for font links, meta tags, and additional library detection)
- IN: `docs/_libraries/layouts.md`, `docs/_libraries/interactions.md`, `docs/_libraries/motion-categories.md` (for pattern mapping via reverse-lookup guide)
- OUT: `docs/reference-analysis.md`

**Multi-page awareness:** When multiple pages are captured per domain, the analyst should:
1. Read the `{domain}--index.json` to understand which pages were captured
2. Analyze each page's manifest and screenshots (homepage gets deepest analysis)
3. Note page-specific patterns (e.g., "About page uses L-Zigzag" vs "Home uses L-Hero-Full")
4. Identify cross-page consistency (shared nav, footer, tokens, motion approach)

**Gate (QA validates — same as every other step):**
1. All sections filled (colors, typography, layouts, motion, interactions, spacing, rhythm, responsive, borrow/avoid, recommendations)
2. Every color/font claim references manifest data (not guessed from screenshots)
3. Borrow list has 5+ items, each with confidence level (HIGH/MEDIUM/LOW) and frame reference
4. Responsive analysis present (desktop vs mobile comparison)
5. Tech stack documented from manifest
6. Patterns mapped to library names (L-*, I-*, motion category names)
7. Interaction analysis section present with scroll diffs, hover states, click states from manifest (all CONFIRMED behaviors documented)
8. Header behavior documented with type and CSS changes
9. Spacing system reported (base unit, scale, section padding)

---

## Step 1: Creative Direction (Agent: `designer`)

**Context contract:**
- IN: User brief (project type, pages, mood, constraints)
- IN: **Full `docs/reference-analysis.md`** — CEO passes the ENTIRE file, not excerpts. The designer needs complete context (palette, typography, layouts, motion, responsive analysis, tech stack, borrow/avoid lists, confidence levels) to make informed design decisions.
- IN: Reference frame paths (`_ref-captures/{domain}/desktop/frame-NNN.png` + `mobile/frame-NNN.png`) so decisions can be attributed to specific frames
- IN: Template formats from `docs/_templates/`
- IN: Pattern libraries from `docs/_libraries/`
- OUT: 6 foundation docs:
  - `docs/design-concept.md` — creative direction, zero values
  - `docs/design-tokens.md` — all CSS-ready tokens with descriptions
  - `docs/design-decisions.md` — every token traced to a ref frame or principle
  - `docs/content-brief.md` — real copy for all sections
  - `docs/page-plans.md` — recipe cards per section
  - `docs/motion-spec.md` — easing, durations, choreography

**Gate — 12-point validation (QA agent):**
1. design-concept.md: concept statement + 3+ visual principles + anti-principles
2. design-decisions.md: entry for each major color, font, easing, layout choice — with reference attribution
3. Palette: 6+ colors with hex values, descriptions, and contrast ratios in design-tokens.md
4. Typography: actual Google Fonts family names + import URLs + full px scale
5. Motion tokens: --ease (cubic-bezier), --duration-fast/medium/slow/crawl
6. Recipe cards: every section has layout + motion + interaction + energy + data-source + responsive
7. Motion variety: no consecutive sections share category
8. Content: zero lorem ipsum, zero placeholder text, all CTAs are verb phrases
9. Motion coverage: reveals + transitions + hover + scroll-linked + preloader
10. Reduced motion: specific fallback for each animation type
11. Atmosphere: preset + mouse behavior + scroll behavior + mobile CSS fallback value
12. Section counts: homepage ≥ 8, other pages ≥ 5

**On FAIL:** CEO passes specific failures to designer to fix. Max 3 loops.

**User Review:** CEO presents concept + palette (from design-concept + design-tokens) + section plan (from page-plans) to user. User approves or requests changes. No building until user approves.

---

## Step 2: Scaffold + Atmosphere (Agent: `builder`)

**Scaffold:** CEO copies `$MAQUETA_DIR/_project-scaffold/` to `$PROJECT_DIR/`, copies `_libraries`, runs `npm install`, writes `tokens.css`.

**Atmosphere:** Builder creates `AtmosphereCanvas.vue` using atmosphere tokens from design-tokens.md.
- IN: Palette hex values (`--canvas`, `--surface`, `--accent-primary`, `--accent-secondary`)
- IN: Atmosphere token values (preset, mouse radius, opacity, colors)
- IN: Mobile fallback CSS value
- OUT: `src/components/AtmosphereCanvas.vue`

**Gate:**
1. Canvas responds to mouse position
2. Canvas responds to scroll offset
3. Mobile fallback renders visible (not `display:none`)
4. `aria-hidden="true"` present
5. Cleanup on unmount (no leaks)

**User Review:** CEO screenshots canvas on empty page. User approves or requests changes.

---

## Step 3: Sections — STATIC BUILD PHASE (Agent: `builder`, one call per section)

**All sections are built with hardcoded static data. No store imports. No API calls.**
The creative visual experience is built first. API wiring happens after the user approves the static build (Step 5B).

**Context contract — CEO extracts PER-SECTION and passes inline:**
- IN: Recipe card for THIS section only (from page-plans.md)
- IN: Content for THIS section only — exact text, verbatim (from content-brief.md)
- IN: Token values with descriptions (from design-tokens.md — actual hex, font names, px, cubic-bezier)
- IN: Relevant design decision (from design-decisions.md — the "why" behind key values for this section)
- IN: Library code snippets (paste specific layout pattern, motion GSAP code, interaction CSS from _libraries/)
- DO NOT pass: other sections' recipe cards, full docs, stores, services

**Gate — 7-layer validation (QA agent, per section):**
1. Composition: semantic HTML, heading hierarchy
2. Typography: tokens used, fluid type
3. Depth: visual layers present
4. Interaction: hover + focus + cursor states
5. Motion: uses ASSIGNED technique (not generic fade-up)
6. Atmosphere: visual depth or canvas connection
7. Responsive: works at 375, 768, 1280, 1440px

**On FAIL:** CEO passes specific layer failures to builder. Rebuild. Do not advance.

**User Review (per section, MANDATORY):** CEO takes screenshot (desktop + mobile), calls AskUserQuestion. STOPS until user responds. Changes applied → re-screenshot → re-ask. Next section starts ONLY after user responds "Approved."

---

## Step 4: Motion Choreography (Agent: `polisher`)

**Context contract — CEO extracts from motion-spec and passes inline:**
- IN: Brand easing (cubic-bezier + character)
- IN: Duration table (fast, medium, slow)
- IN: Per-section technique assignments (section name → category)
- IN: Preloader spec (sequence, duration)
- IN: Page transition spec (type, exit, enter)
- IN: Hover state definitions
- IN: Reduced-motion spec
- IN: List of existing section files and their motion assignments
- DO NOT pass: palette, content, layout details
- OUT: `src/composables/useMotion.js`, `useLenis.js`, `useCursor.js`, `useTransitions.js`, `src/components/AppPreloader.vue`

**Gate (QA agent):**
1. No consecutive sections share motion technique
2. `prefers-reduced-motion` fully supported
3. All animations use `gsap.context()` with cleanup
4. No animation on width/height/top/left
5. Page transitions work
6. Preloader matches spec

---

## Step 5A: Static Integration + Final Audit (CEO)

CEO assembles the static site:
1. Update router with lazy-loaded routes
2. Update App.vue with AtmosphereCanvas, AppPreloader, transition wrapper
3. Update HomeView.vue with section components in order
4. Create additional page views
5. Add SEO meta to every page
6. All content remains hardcoded

**Final audit (QA agent):** a11y + SEO + responsive + CSS + performance + motion + content
**User Review:** CEO screenshots all pages (desktop + mobile). AskUserQuestion. Loop until approved.

---

## Step 5B: API Wiring (CEO, only if Backend ≠ none)

After static build is approved, connect to the API:
1. Create `src/config/api.js` — single axios instance
2. Create `src/services/{resource}.js` per data type
3. Create `src/stores/{resource}.js` with Pinia (loading, error, data)
4. Replace hardcoded template content with reactive store values
5. Add loading and error states to each section that uses API data

Visual behavior must not change between static and API-wired state.

---

## Step 6: Cleanup (CEO)

1. Delete `_ref-captures/` directory
2. Final report to user

---

## Concurrency Rules

- Steps are strictly sequential: 0 → 0.5 → 1 → 2 → 3 → 4 → 5A → 5B → 6
- Within Step 3, sections are sequential (one at a time, review after each)
- Max 2 concurrent agents (builder + QA is OK)
- NEVER 3+ agents (causes API 500 — learned from AXON)
- On API errors: reduce to 1 agent, retry

## CEO Context Management Rules

1. **Extract, don't delegate reading.** CEO reads docs, extracts relevant parts, passes inline. Actual CSS-ready values: hex codes, font names, pixel sizes, cubic-bezier strings.
2. **One task per agent.** Never ask an agent to do two things.
3. **Review before forwarding.** Read agent output before passing downstream.
4. **Pass failures explicitly.** "Layer 2 failed: H2 uses 24px instead of var(--text-2xl)" — not "QA failed."
5. **Track progress.** TodoWrite after every completed task.
6. **Static first.** Creative build is frozen before any API connection. Never mix creative work with API wiring.
