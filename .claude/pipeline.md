# Pipeline V5 — Agent Architecture

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

| Agent | Role | Key Tools | Receives | Produces |
|-------|------|-----------|----------|----------|
| `reference-analyst` | Analyze captured screenshots + metadata | Read, Glob, WebFetch | Screenshot paths + manifest + URL | `docs/reference-analysis.md` |
| `designer` | Design visual identity | Read, Glob, WebFetch | Brief + reference-analysis + ref frames | `docs/tokens.md` + `docs/pages/*.md` |
| `builder` | Build sections with self-preview | Read, Write, Edit, Glob, Grep, Preview MCP | Recipe card + tokens + copy (extracted) | `S-{Name}.vue` + `AtmosphereCanvas.vue` |
| `polisher` | Motion + visual QA audit | Read, Write, Edit, Glob, Grep, Preview MCP | Motion spec + section list (extracted) | Composables + preloader |

---

## V5 Protocols

### Preview Loop (Builder Self-Correction)

The builder doesn't code blind — it SEES its output and self-corrects before QA.

```
1. Builder writes S-{Name}.vue
2. Builder starts dev server (if not running): preview_start
3. Builder navigates to the page section: preview_eval (scroll to section)
4. Builder screenshots desktop: preview_screenshot
5. Builder screenshots mobile: preview_resize "mobile" → preview_screenshot → preview_resize "desktop"
6. Builder EVALUATES against the cinematic description:
   - Does the layout match the spatial composition? (grid fr, overlaps, breaks)
   - Are there 3+ depth layers visible?
   - Is the typography scale contrast dramatic enough?
   - Does the composition have visible asymmetry?
7. If NO on any check → Builder fixes → re-screenshots → re-evaluates (max 2 self-loops)
8. If YES on all → Builder reports done
```

**The builder must explicitly state what it checked and what it fixed in each loop.**
This protocol catches 80%+ of "basic" output before QA even runs.

### Visual QA Protocol

QA uses real screenshots — not code reading — to validate visual quality.

```
1. preview_start (if not running)
2. For each breakpoint [375, 768, 1280, 1440]:
   a. preview_resize to width
   b. preview_screenshot
   c. Evaluate screenshot against quality criteria:
      - Depth: can you count 3+ visual layers?
      - Asymmetry: is the layout visibly unbalanced (intentionally)?
      - Scale contrast: is there dramatic size difference between elements?
      - Overlap: does at least one element cross its container boundary?
      - Atmosphere: is there grain, gradient, or decorative layer visible?
      - Typography: are there 3+ distinct text sizes visible?
3. preview_resize back to desktop
4. Report: PASS/FAIL per breakpoint with visual evidence
```

**Visual QA > code QA.** A section can have perfect code and still look basic.
The screenshot is the truth.

### Pencil Mockup Protocol (CEO — Phase 1 User Review only)

The CEO creates a hero section mockup using Pencil MCP to give the user a
visual preview of the creative direction BEFORE any code is written.

```
After designer completes tokens.md + pages/*.md:

1. CEO reads the hero section recipe + palette + typography from designer output
2. CEO uses Pencil MCP to create a visual mockup:
   a. get_guidelines(topic="landing-page")
   b. get_style_guide_tags → pick relevant tags
   c. get_style_guide(tags=[relevant]) — for layout inspiration
   d. open_document("new")
   e. batch_design — create hero mockup with:
      - Exact palette colors from tokens.md
      - Font families + scale from tokens.md
      - Grid proportions from cinematic description (1.4fr/0.6fr, etc.)
      - Key spatial relationships (overlaps, bleeds, asymmetry)
   f. get_screenshot — capture as image for user review
3. CEO presents to user: palette + typography + section plan + hero mockup screenshot
4. User approves creative direction with visual confidence (not just hex codes)
```

**This is optional.** If Pencil MCP is unavailable, the CEO presents text-only
(palette hex + font names + section plan table). The pipeline works either way.

**Only the hero mockup.** One mockup for user approval, not mockups per section.
The builder uses cinematic descriptions + Preview Loop — not mockups.

### Parallel Section Protocol

Sections that don't depend on each other can be built simultaneously
using isolated git worktrees. Max 2 builders at once.

```
1. CEO identifies independent sections (e.g., S-Hero and S-Features don't depend on each other)
2. CEO spawns 2 builders with isolation: "worktree"
   - Builder A: writes S-Hero.vue in worktree branch
   - Builder B: writes S-Features.vue in worktree branch
3. Each builder runs its own Preview Loop independently
4. CEO merges completed sections back to main branch
5. QA runs on merged result
```

**Rules:**
- Max 2 concurrent builders (API limit protection)
- Sections on the same page that share visual flow (e.g., hero→intro transition) must be sequential
- If API errors occur, fall back to sequential (1 builder at a time)
- CEO resolves merge conflicts (usually none — different files)

---

## Multi-Page Document Structure

V5 uses per-page files instead of a single sections.md:

```
docs/
  tokens.md                    ← global design system (palette, type, spacing, easing, atmosphere, cursor)
  pages/
    home.md                    ← homepage sections (recipe + cinematic + copy per section)
    about.md                   ← about page sections
    services.md                ← services page sections
    contact.md                 ← contact page sections
  mockups/                     ← CEO-generated hero mockup for Phase 1 User Review (Pencil MCP)
  reference-analysis.md        ← from reference analyst (if references provided)
  _libraries/                  ← copied from maqueta (layouts, interactions, motion)
```

Each page file follows the same format:

```markdown
# {Page Name}

## 1. Section Name
- **Purpose:** what this section achieves
- **Layout:** L-{Pattern} from _libraries/layouts.md
- **Motion:** M-{Category} from _libraries/motion-categories.md
- **Interaction:** I-{Pattern} from _libraries/interactions.md
- **Energy:** HIGH / LOW / MEDIUM
- **Responsive:** specific transformation
- **Headline:** "exact text"
- **Subtext:** "exact text"
- **CTA:** "verb phrase"

### Cinematic Description
[Full cinematic description with spatial composition, entry sequence, etc.]
```

**Benefits:**
- Smaller context per builder call (only the relevant page)
- Router structure maps 1:1 to file structure
- Easy to add/remove pages without touching other page specs

---

## Rich Checkpoint Format

Context compaction WILL happen. The checkpoint must have enough detail to resume cold.

```markdown
# Pipeline State

## Project
- Name: {name}
- Slug: {slug}
- PROJECT_DIR: {absolute path}
- MAQUETA_DIR: C:\Users\mateo\Desktop\maqueta

## Current Phase
{phase number and name}

## Completed
- [x] Phase 0: Discovery — identity card confirmed
- [x] Phase 0.5: References — {domains} captured
- [x] Phase 1: Creative Direction — user approved
- [x] Phase 2: Scaffold — tokens.css generated, atmosphere approved
- [x] Phase 3.1: S-Hero — approved
- [x] Phase 3.2: S-Intro — approved (builder self-corrected overlap issue)
- [ ] Phase 3.3: S-Features — IN PROGRESS
- [ ] Phase 4: Motion — pending
- [ ] Phase 5A: Integration — pending

## Key Decisions
- Palette: {canvas} + {accent} hexes
- Fonts: {display} + {body}
- Easing: {cubic-bezier}
- Pages: {list}
- Sections total: {N}
- Backend: {static/API}

## Last Agent Instruction
{Exact prompt that was sent to the last agent — so CEO can re-dispatch if compacted mid-build}
Example: "Build S-Features with L-Grid-Bento layout, M-Stagger-Cascade motion..."

## Last QA Feedback
{If QA failed, the exact failure details — so CEO knows what to fix on resume}
Example: "Layer 3 FAIL: no depth layers visible. Layer 5 FAIL: motion is generic fade-up, not M-Stagger-Cascade."

## Pending Changes
{Any uncommitted files or in-progress work}
Example: "S-Features.vue half-written — builder was applying QA fix for overlap when compacted"

## Files Created
- docs/tokens.md, docs/pages/home.md, docs/pages/about.md
- src/styles/tokens.css
- src/components/AtmosphereCanvas.vue
- src/components/sections/S-Hero.vue, S-Intro.vue

## Next Action
{Exact instruction for cold resume — specific enough to act on without reading conversation}
```

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

### B: Analyze (Agent: `reference-analyst`)
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

**Gate (QA validates):**
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
- IN: **Full `docs/reference-analysis.md`** — CEO passes the ENTIRE file, not excerpts
- IN: Reference frame paths for attribution
- IN: Template formats from `docs/_templates/`
- IN: Pattern libraries from `docs/_libraries/`
- OUT: Design documents:
  - `docs/tokens.md` — complete design system (palette, typography, spacing, easing, atmosphere, cursor, CSS output block)
  - `docs/pages/home.md` — homepage sections with recipe cards + cinematic descriptions + copy
  - `docs/pages/{other}.md` — other page sections (one file per page)

**Gate — 12-point validation (QA agent):**
1. tokens.md: concept direction + 3+ visual principles stated
2. tokens.md: 8+ colors with hex, semantic role, contrast ratios
3. tokens.md: distinctive Google Fonts (NOT Inter/Roboto/Arial) + full px scale + import URLs
4. tokens.md: motion tokens — --ease (cubic-bezier), --duration-fast/medium/slow/crawl
5. tokens.md: atmosphere preset + mouse/scroll behavior + mobile CSS fallback
6. tokens.md: complete :root {} CSS output block
7. pages/*.md: every section has ALL recipe card fields + full cinematic description
8. pages/*.md: cinematic descriptions have spatial composition (grid fr, overlaps, z-layers, padding asymmetry)
9. pages/*.md: every entry sequence has 3+ numbered stages with ms timing
10. pages/*.md: no consecutive sections share motion category
11. pages/*.md: zero lorem ipsum, zero placeholder, CTAs are verb phrases
12. pages/*.md: homepage ≥ 8 sections, other pages ≥ 5

**On FAIL:** CEO passes specific failures to designer to fix. Max 3 loops.

**User Review:** CEO presents concept + palette + section plan to user.
If Pencil MCP is available, CEO also creates a hero mockup (see Pencil Mockup Protocol)
to give the user a visual preview alongside the text summary.
User approves or requests changes.

---

## Step 2: Scaffold + Atmosphere (Agent: `builder`)

**Scaffold:** CEO copies `$MAQUETA_DIR/_project-scaffold/` to `$PROJECT_DIR/`, copies `_libraries`, runs `npm install`.

**Tokens CSS — auto-generated:**
```bash
node "$MAQUETA_DIR/scripts/generate-tokens.js" "$PROJECT_DIR"
```
This parses `docs/tokens.md`, extracts the `:root {}` CSS block + Google Fonts imports,
and writes `src/styles/tokens.css`. No manual copy-paste needed.

**Atmosphere:** Builder creates `AtmosphereCanvas.vue` using atmosphere tokens from tokens.md.
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

**Auto-QA:** CEO screenshots canvas, verifies 5 checks pass. No user review needed for atmosphere —
it will be seen in context during the Phase 3 batch review.

---

## Step 3: Sections — STATIC BUILD PHASE (Agent: `builder`, with Preview Loop)

**All sections are built with hardcoded static data. No store imports. No API calls.**
The creative visual experience is built first. API wiring happens after the user approves (Step 5B).

**Context contract — CEO extracts PER-SECTION and passes inline:**
- IN: Recipe card for THIS section only (from pages/{page}.md)
- IN: Content for THIS section only — exact text, verbatim
- IN: Token values with descriptions (from tokens.md — actual hex, font names, px, cubic-bezier)
- IN: Library code snippets (layout pattern, motion GSAP code, interaction CSS from _libraries/)
- IN: Reference frame path — the captured screenshot that best matches this section type
  (e.g., hero frame from `_ref-captures/{domain}/desktop/frame-001.png`)
  Builder uses this during Preview Loop Pass B to compare visual quality
- DO NOT pass: other sections' recipe cards, full docs, stores, services

### Builder Flow (per section):

```
1. Builder reads context (tokens, recipe, copy, library snippets, reference frame)
2. Builder writes S-{Name}.vue
3. ► PREVIEW LOOP: Builder screenshots its own output
   a. preview_start (if needed)
   b. Navigate to section → preview_screenshot (desktop)
   c. preview_resize "mobile" → preview_screenshot → restore desktop
   d. PASS A: Evaluate against cinematic description (technical accuracy)
   e. PASS B: Compare against reference frame (aesthetic quality)
   f. SCORE on Quality Rubric (5 dimensions, 0-2 each, total /10)
4. Auto-correction:
   Score < 7  → MANDATORY self-fix → re-screenshot → re-score (max 3 loops)
   Score >= 7 → Report done with score + breakdown
5. Builder returns: score, per-dimension breakdown, screenshots, self-assessment vs reference
```

### Quality Rubric (Builder self-scores, CEO verifies)

| Dimension | 0 (reject) | 1 (weak) | 2 (strong) |
|-----------|-----------|----------|------------|
| Composition | Centered/symmetric, no breaks | Some asymmetry, safe grid | Intentional asymmetry, overlap, container breaks |
| Depth | Flat — content on bg | 2 layers | 3+ layers with independent spatial behavior |
| Typography | One size, one weight | 2-3 sizes, some contrast | 4+ sizes, dramatic scale, mixed weights |
| Motion | Generic fade-up, default easing | 2 stages, custom easing | 3+ stages, scroll-linked, different easing per role |
| Craft | No hover, no focus | Basic hover + focus-visible | Magnetic, reveals, cursor reactions, micro-interactions |

**Auto-reject (score 0 regardless):** centered-everything, `ease`/`ease-in-out` anywhere, no z-layering.
**Minimum to ship: 7/10.** Builder self-corrects until it reaches 7 or exhausts 3 loops.

### Parallel build (when applicable):

If 2+ sections are independent (no shared visual flow):
```
CEO spawns Builder A (isolation: "worktree") → S-Hero
CEO spawns Builder B (isolation: "worktree") → S-Features
Both run Preview Loop + scoring independently
CEO merges worktrees on completion
```
Max 2 concurrent builders. Fall back to sequential on API errors.

### Auto-QA Gate (replaces per-section user review)

After builder reports done, CEO runs a quick QA check:

```
1. CEO reads builder's score + screenshots
2. If score >= 7 and screenshots look reasonable → section PASSES auto-QA
3. If score < 7 or CEO spots an issue → re-dispatch builder with specific feedback
4. Max 2 CEO-triggered correction loops per section
5. After auto-QA pass → section is APPROVED INTERNALLY (no user review yet)
```

**Sections accumulate.** The user does NOT review individual sections.

### Batch User Review (after ALL sections pass auto-QA)

Once all sections are built and pass auto-QA:

```
1. CEO assembles all sections in HomeView.vue (and other page views)
2. preview_start → navigate to each page
3. Full-page screenshot: desktop + mobile per page
4. ⛔ AskUserQuestion:
   Q: "All {N} sections are built. Here's the complete page(s). How does it look?"
   Options:
     "Approved — move to polish"
     "Needs changes on specific sections"     → user names sections → CEO re-dispatches
     "Major revision needed"                  → CEO identifies scope → targeted rebuild
5. If "Needs changes": CEO re-dispatches only the named sections → builder fixes → re-screenshot → re-ask
```

**This reduces Phase 3 from N reviews (one per section) to 1-2 reviews (full page).**
The quality bar is maintained by the builder's self-scoring + CEO auto-QA gate.

---

## Step 4: Motion Choreography (Agent: `polisher`)

**Context contract — CEO extracts from tokens.md and pages/*.md:**
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

**Gate (QA agent — visual verification):**
1. No consecutive sections share motion technique
2. `prefers-reduced-motion` fully supported
3. All animations use `gsap.context()` with cleanup
4. No animation on width/height/top/left
5. Page transitions work (verify with Preview: navigate between routes)
6. Preloader matches spec (verify with Preview: reload page, screenshot sequence)

---

## Step 5A: Static Integration + Final Audit (CEO)

CEO assembles the static site:
1. Update router with lazy-loaded routes
2. Update App.vue with AtmosphereCanvas, AppPreloader, transition wrapper
3. Update HomeView.vue with section components in order
4. Create additional page views
5. Add SEO meta to every page
6. All content remains hardcoded

**Final audit (QA agent — full visual + code):**
- Visual: screenshots of all pages at all breakpoints
- a11y + SEO + responsive + CSS + performance + motion + content
- Lighthouse performance check if available

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
- Within Step 3: up to 2 sections can build in parallel (worktree isolation)
- Sequential sections (where visual flow matters) must still be built in order
- Max 2 concurrent agents (builder + QA is OK, 2 builders is OK)
- NEVER 3+ agents simultaneously
- On API errors: reduce to 1 agent, retry
- Preview Loop runs inside the builder — not a separate agent

## CEO Context Management Rules

1. **Extract, don't delegate reading.** CEO reads docs, extracts relevant parts, passes inline.
2. **One task per agent.** Never ask an agent to do two things.
3. **Review before forwarding.** Read agent output before passing downstream.
4. **Pass failures explicitly.** "Layer 2 failed: H2 uses 24px instead of var(--text-2xl)" — not "QA failed."
5. **Write checkpoint after every phase.** Rich format with last instruction + last QA feedback.
6. **After compaction: read checkpoint first.** Trust the file over conversation memory.
7. **Tokens auto-gen:** Always use `generate-tokens.js` instead of manual copy-paste.
8. **Multi-page docs:** Read the specific page file, not all pages. Pass only the relevant section.
