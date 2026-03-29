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
| Reference Analyst | Analyze captured screenshots | Screenshot paths + manifest | `docs/reference-analysis.md` |
| Creative Director | Design visual identity | Brief + ref analysis (extracted) | 4 foundation docs |
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
```bash
cd scripts && npm install --silent && node capture-refs.mjs "{url}" "../_ref-captures"
```
Produces: `_ref-captures/{domain}/frame-NNN.png` + `manifest.json`

### B: Analyze (Console: `reference-analyst`)
**Context contract:**
- IN: paths to `_ref-captures/{domain}/` screenshots + manifest
- IN: `docs/_libraries/layouts.md`, `docs/_libraries/interactions.md`, `docs/_libraries/motion-categories.md` (for pattern mapping)
- OUT: `docs/reference-analysis.md`

**Gate:** Analysis file exists with all sections (colors, type, layouts, motion, rhythm, borrow/avoid lists).

---

## Step 1: Creative Direction (Console: `creative-director`)

**Context contract:**
- IN: User brief (project type, pages, mood, constraints)
- IN: Key findings from `docs/reference-analysis.md` (CEO extracts and pastes inline: borrow list, color insights, layout patterns, motion patterns, recommendations)
- IN: Template formats from `docs/_templates/`
- IN: Pattern libraries from `docs/_libraries/`
- OUT: `docs/design-brief.md`, `docs/content-brief.md`, `docs/page-plans.md`, `docs/motion-spec.md`

**Gate — 12-point validation (QA console):**
1. Palette: 5+ colors with contrast >= 4.5:1
2. Typography: display + body + accent defined
3. Spacing: consistent base-unit scale
4. Recipe cards: every section has layout + motion + interaction + data
5. Motion variety: no consecutive sections share category
6. Content: zero lorem ipsum, zero placeholder text
7. CTAs: all are action verb phrases
8. Motion coverage: reveals + transitions + hover + scroll-linked
9. Reduced motion: alternatives defined
10. Atmosphere: preset + mouse + scroll behavior defined
11. Responsive: strategy per breakpoint
12. Brand easing: cubic-bezier + character description

**On FAIL:** CEO passes specific failures to Creative Director to fix. Max 3 loops.

**User Review:** CEO presents palette, typography, section plan to user. User approves or requests changes. Changes update the docs, then re-present. No building until user approves the design system.

---

## Step 2: Atmosphere (Console: `atmosphere`)

**Context contract — CEO extracts from design-brief and passes inline:**
- IN: Palette hex values (`--canvas`, `--surface`, `--accent-primary`, `--accent-secondary`)
- IN: Atmosphere concept (preset, mouse behavior, scroll behavior)
- IN: Mobile fallback description
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

## Step 3: Sections (Console: `constructor`, one call per section)

**Context contract — CEO extracts PER-SECTION and passes inline:**
- IN: Recipe card for THIS section only (name, purpose, layout, motion technique, interaction, responsive notes)
- IN: Content for THIS section only (headline, subtext, CTA — from content-brief)
- IN: Design tokens (font families, palette, spacing base, easing, radii — from design-brief)
- IN: Relevant library entry (the specific layout pattern, interaction pattern, motion category)
- DO NOT pass: other sections' recipe cards, full content-brief, full motion-spec
- OUT: `src/components/sections/S-{Name}.vue`

**Gate — 7-layer validation (QA console, per section):**
1. Composition: semantic HTML, heading hierarchy
2. Typography: tokens used, fluid type
3. Depth: visual layers present
4. Interaction: hover + focus + cursor states
5. Motion: uses ASSIGNED technique (not generic)
6. Atmosphere: visual depth or canvas connection
7. Responsive: works at 375, 768, 1280, 1440px

**On FAIL:** CEO passes specific layer failures to Constructor. Rebuild. Do not advance.

**User Review (per section):** CEO screenshots section in page context (desktop + mobile). User approves or requests changes. Changes are applied, then re-screenshot. Next section starts only after approval.

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

## Step 5: Integration + Final Audit

**CEO does integration directly:**
1. Update router with lazy-loaded routes
2. Update App.vue with AtmosphereCanvas, AppPreloader, transition wrapper
3. Update HomeView.vue with section components in order
4. Create additional page views
5. Connect stores/services if needed

**Final audit (QA console):**
All 7 categories must PASS:
1. Accessibility (WCAG 2.1 AA)
2. SEO (meta + OG + JSON-LD per page)
3. Responsive (no overflow, touch targets >= 44px)
4. CSS (tokens, no magic numbers)
5. Performance (lazy images, code splitting)
6. Motion (variety + reduced-motion)
7. Content (no placeholders)

**On FAIL:** CEO fixes critical issues directly, re-audits. Loop until PASS.

**User Review (final):** CEO screenshots all pages (desktop + mobile). User approves or requests changes. Project is NOT done until user says "Approved."

---

## Step 6: Cleanup (CEO)

1. Delete `_ref-captures/` directory
2. Final report to user

---

## Concurrency Rules

- Steps are strictly sequential: 0 → 0.5 → 1 → 2 → 3 → 4 → 5 → 6
- Within Step 3, sections are sequential (one at a time)
- Max 2 concurrent agents (builder + QA is OK)
- NEVER 3+ agents (causes API 500 — learned from AXON)
- On API errors: reduce to 1 agent, retry

## CEO Context Management Rules

1. **Extract, don't delegate reading.** CEO reads docs, extracts relevant parts, passes inline.
2. **One task per console.** Never ask a console to do two things.
3. **Review before forwarding.** Read console output before passing downstream.
4. **Pass failures explicitly.** "Typography check failed: H2 uses 24px instead of var(--text-2xl)" — not "QA failed."
5. **Track progress.** TodoWrite after every completed task.
