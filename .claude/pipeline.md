# Pipeline V3 — Console Architecture

## Architecture: CEO + 6 Consoles

The CEO (`/project` skill) orchestrates everything. Consoles are specialized agents
that receive ONLY the context they need and produce specific outputs.

**Context management is the CEO's #1 job.** Don't tell a console "read the docs."
Extract the relevant parts and pass them inline. This keeps console context small and focused.

**Every visual milestone requires user approval.** After QA passes, the CEO presents
a preview (screenshot) to the user. The user approves, requests changes, or rejects.
If changes are requested, the CEO applies them and re-presents. Nothing advances without
user sign-off. See `/project` skill for the User Review Protocol details.

---

## Console Registry

| Console | Role | Receives | Produces |
|---------|------|----------|----------|
| Reference Analyst | Analyze captured screenshots + metadata | Screenshot paths (desktop + mobile) + manifest + original URL | `docs/reference-analysis.md` |
| Creative Director | Design visual identity | Brief + full reference-analysis.md + ref frame paths | 6 foundation docs |
| Atmosphere | Build WebGL/Canvas layer | Palette + atmosphere concept (extracted) | `AtmosphereCanvas.vue` |
| Constructor | Build sections one by one | Recipe card + tokens + copy (extracted) | `S-{Name}.vue` |
| Choreographer | Implement all motion | Motion spec + section list (extracted) | Composables + preloader |
| QA | Validate between every step | Step outputs + relevant docs | PASS/FAIL report |

---

## Step 0: Gather Brief (CEO)

CEO gathers from the user:
- Project type, pages needed, inspiration URLs, mood, constraints
- Creates task breakdown using TodoWrite

**Gate:** Brief is clear. If ambiguous, CEO asks before proceeding.

---

## Step 0.5: Reference Analysis (if URLs provided)

### A: Capture (CEO runs directly)

**Single URL:**
```bash
cd scripts && npm install --silent && node capture-refs.mjs "{url}" "../_ref-captures"
```

**Multiple URLs (batch mode):**
```bash
cd scripts && npm install --silent && node capture-refs.mjs --batch "{url1}" "{url2}" "{url3}" --out "../_ref-captures"
```

**Produces per domain in `_ref-captures/{domain}/`:**
- `desktop/frame-NNN.png` — per-section desktop screenshots (1440px)
- `mobile/frame-NNN.png` — per-section mobile screenshots (375px)
- `full-page-desktop.png` — full-page bird's eye
- `full-page-mobile.png` — full-page mobile
- `manifest.json` — rich metadata (v2):
  - Clustered hex palette (text + bg, max 8 dominant colors each)
  - Exact font families + heading typography (size, weight, letter-spacing, line-height, text-transform)
  - Section boundaries with tag, class, scroll position, height
  - Tech stack detection (GSAP, Three.js, Lenis, Locomotive, Spline, framework, etc.)
  - CSS custom properties from `:root` (the site's own token system)
  - Media inventory (videos with autoplay/size/isBackground, canvases with WebGL detection, SVG/Lottie counts)
  - Navigation pattern (link count, header position, header bg)

### B: Analyze (Console: `reference-analyst`)
**Context contract:**
- IN: paths to `_ref-captures/{domain}/` screenshots (desktop + mobile) + manifest
- IN: The original URL (analyst may use WebFetch to read page source for font links, meta tags, and additional library detection)
- IN: `docs/_libraries/layouts.md`, `docs/_libraries/interactions.md`, `docs/_libraries/motion-categories.md` (for pattern mapping via reverse-lookup guide)
- OUT: `docs/reference-analysis.md`

**Gate (QA validates — same as every other step):**
1. All sections filled (colors, typography, layouts, motion, rhythm, responsive, borrow/avoid, recommendations)
2. Every color/font claim references manifest data (not guessed from screenshots)
3. Borrow list has 5+ items, each with confidence level (HIGH/MEDIUM/LOW) and frame reference
4. Responsive analysis present (desktop vs mobile comparison)
5. Tech stack documented from manifest
6. Patterns mapped to library names (L-*, I-*, motion category names)

---

## Step 1: Creative Direction (Console: `creative-director`)

**Context contract:**
- IN: User brief (project type, pages, mood, constraints)
- IN: **Full `docs/reference-analysis.md`** — CEO passes the ENTIRE file, not excerpts. The Creative Director needs complete context (palette, typography, layouts, motion, responsive analysis, tech stack, borrow/avoid lists, confidence levels) to make informed design decisions.
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

**Gate — 12-point validation (QA console):**
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

**On FAIL:** CEO passes specific failures to Creative Director to fix. Max 3 loops.

**User Review:** CEO presents concept + palette (from design-concept + design-tokens) + section plan (from page-plans) to user. User approves or requests changes. No building until user approves.

---

## Step 2: Atmosphere (Console: `atmosphere`)

**Context contract — CEO extracts from design-tokens.md and passes inline:**
- IN: Palette hex values (`--canvas`, `--surface`, `--accent-primary`, `--accent-secondary`)
- IN: Atmosphere token values from design-tokens.md (preset, mouse radius, opacity, colors)
- IN: Mobile fallback CSS value (full CSS string from `--atmosphere-mobile-fallback`)
- DO NOT pass: typography, spacing, content, page plans (irrelevant to this console)
- OUT: `src/components/AtmosphereCanvas.vue`

**Gate (QA console):**
1. Canvas responds to mouse position
2. Canvas responds to scroll offset
3. Mobile fallback renders visible (not `display:none`)
4. `aria-hidden="true"` present
5. Cleanup on unmount (no leaks)

**User Review:** CEO screenshots canvas on empty page. User approves or requests changes.

---

## Step 3: Sections — STATIC BUILD PHASE (Console: `constructor`, one call per section)

**All sections are built with hardcoded static data. No store imports. No API calls.**
The creative visual experience is built first. API wiring happens after the user approves the static build (Step 5B).

**Context contract — CEO extracts PER-SECTION and passes inline:**
- IN: Recipe card for THIS section only (from page-plans.md)
- IN: Content for THIS section only — exact text, verbatim (from content-brief.md)
- IN: Token values with descriptions (from design-tokens.md — actual hex, font names, px, cubic-bezier)
- IN: Relevant design decision (from design-decisions.md — the "why" behind key values for this section)
- IN: Library code snippets (paste specific layout pattern, motion GSAP code, interaction CSS from _libraries/)
- DO NOT pass: other sections' recipe cards, full docs, stores, services

**Gate — 7-layer validation (QA console, per section):**
1. Composition: semantic HTML, heading hierarchy
2. Typography: tokens used, fluid type
3. Depth: visual layers present
4. Interaction: hover + focus + cursor states
5. Motion: uses ASSIGNED technique (not generic fade-up)
6. Atmosphere: visual depth or canvas connection
7. Responsive: works at 375, 768, 1280, 1440px

**On FAIL:** CEO passes specific layer failures to Constructor. Rebuild. Do not advance.

**User Review (per section, MANDATORY):** CEO takes screenshot (desktop + mobile), calls AskUserQuestion. STOPS until user responds. Changes applied → re-screenshot → re-ask. Next section starts ONLY after user responds "Approved."

---

## Step 4: Motion Choreography (Console: `choreographer`)

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

**Gate (QA console):**
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

**Final audit (QA console):** a11y + SEO + responsive + CSS + performance + motion + content
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
2. **One task per console.** Never ask a console to do two things.
3. **Review before forwarding.** Read console output before passing downstream.
4. **Pass failures explicitly.** "Layer 2 failed: H2 uses 24px instead of var(--text-2xl)" — not "QA failed."
5. **Track progress.** TodoWrite after every completed task.
6. **Static first.** Creative build is frozen before any API connection. Never mix creative work with API wiring.
