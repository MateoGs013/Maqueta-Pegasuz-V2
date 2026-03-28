# CLAUDE.md — Pegasuz Maqueta V3 (Creative Pipeline Rebuild)

## Philosophy

Every site this system produces is Awwwards-competitive. Not as aspiration — as hard requirement. Mediocrity does not pass. Generic does not ship.

**Three laws**:
1. **Nothing is optional** — Lenis, custom cursor, page transitions, preloader, atmospheric canvas, section variety. ALL ship with EVERY project.
2. **Quality gates block progress** — `creative-qa` runs between every step. Failures mean fix, not skip.
3. **Docs are law** — If the recipe card says "blur-to-clear reveal with stagger 0.04s", that's what gets built. No improvisation.

---

## Cardinal Rules

1. **Design-first**: Without `creative-director` brief, no CSS, no colors, no code
2. **Content-first**: `docs/content-brief.md` exists before any visual decisions
3. **Unique identity**: Palette, typography, easing, atmosphere — unique per project. NEVER reuse
4. **Atmosphere mandatory**: Every project ships with persistent WebGL/Canvas atmospheric layer
5. **Motion variety enforced**: Each section uses a different motion technique. No same fade-up on all
6. **Section recipes are law**: If page-plans says 10 fields per section, all 10 get implemented
7. **12-point validation**: Creative concept must pass ALL 12 points before any code is written

---

## Anti-Patterns (HARD BLOCKS)

### Creative
- NO dark+orange palette (#0a0a0a + #ff6a00 or similar)
- NO power3.out as default easing
- NO 32px Y offset + 0.8s duration (the generic trinity)
- NO same fade-up animation on all sections
- NO centered-text-on-solid-color hero
- NO hover: scale(1.05) as only card interaction
- NO system cursor (custom cursor mandatory)
- NO mobile = "same but flex-direction: column"
- NO Inter/Poppins/Montserrat as primary font
- NO spinner preloader (brand-themed required)

### Technical
- NO axios outside `api.js`
- NO HTTP outside `services/`
- NO JSON.parse in views
- NO hardcoded slugs (use `VITE_CLIENT_SLUG`)
- NO stores without loading/error states
- NO static route imports (lazy loading required)
- NO animate width/height/top/left (only transform + opacity)
- NO pages without meta tags
- NO images without `resolveImageUrl()`

---

## Architecture (locked)

**Platform**: Pegasuz Core — SaaS multi-tenant. Node.js + Express + Prisma + MySQL.

**Backend chain**: `HTTP (x-client) → clientResolver → prismaManager → Controller → Service → Prisma`

**Frontend chain**: `View.vue → Pinia Store → Service → api.js → API (x-client)`

**Inviolable**: Tenant isolation. Complete chain, no shortcuts. CMS content separate from features. Images via `resolveImageUrl()`. Routes kebab-case, DB snake_case, functions camelCase.

---

## Foundation Docs (BEFORE code)

Templates in `docs/_templates/`. ALL 4 docs completed before any code.

| Order | Doc | Skill | Content |
|-------|-----|-------|---------|
| 1 | `docs/content-brief.md` | `creative-director` | All copy, CTAs, voice, typography-as-design notes |
| 2 | `docs/design-brief.md` | `creative-director` | Visual tokens, palette, type, spacing, atmosphere, cursor, transitions |
| 3 | `docs/page-plans.md` | `creative-director` | Section Recipe Cards (10 fields each), motion category map |
| 4 | `docs/motion-spec.md` | `creative-director` | Easing, hero timeline, per-section techniques, cursor, preloader |

**Which doc to consult**: text → content-brief | colors/type/spacing → design-brief | sections/layout → page-plans | animation → motion-spec

---

## Pipeline — New Project

```
User describes project
    │
    ▼
[1] creative-director (discovery → concept → 12-point validation)
    │ HARD GATE: 12-point creative validation
    ▼
[2] Foundation docs (4 files + section recipe cards)
    │ creative-qa Gate 1: Concept Validation
    ▼
[3] atmosphere-layer (persistent canvas FIRST — foundation of atmosphere)
    │ creative-qa Gate 2: Atmosphere Validation
    ▼
[4] section-builder (ONE section at a time, 7 layers each)
    │ creative-qa Gate 3: Section Validation (per section)
    ▼ (repeat for all sections)
[5] motion-system (page-level: Lenis, cursor, transitions, preloader)
    │ creative-qa Gate 4: Motion Validation
    ▼
[6] Final assembly (router, App.vue, global styles)
    │ creative-qa Gate 5: Final Coherence
    ▼
[7] Audit chain: a11y → seo → responsive → css → perf
```

### Mandatory Baseline (ships with EVERY project)
- Lenis smooth scroll
- Custom cursor (3+ states)
- Magnetic buttons on CTAs
- Page transitions (exit + enter)
- Brand preloader (not spinner)
- Atmospheric canvas (WebGL/Canvas, mouse + scroll reactive)
- Section-specific motion (each section different technique)
- Hero entrance timeline (4+ steps)

---

## Skill Dispatch

**Entry point**: "nuevo proyecto" / "new project" / "/new-project" → `creative-director`

### Creative Pipeline (strict order)

| Step | Skill | Output | Gate |
|------|-------|--------|------|
| 1 | `creative-director` | All 4 foundation docs | 12-point validation |
| 2 | `atmosphere-layer` | Persistent WebGL/Canvas | Gate 2 |
| 3 | `section-builder` (per section) | Section components | Gate 3 (each) |
| 4 | `motion-system` | Lenis, cursor, transitions, preloader | Gate 4 |
| 5 | `creative-qa` | Final coherence check | Gate 5 |
| 6 | Audits (parallel) | CRITICAL/WARNING/SUGGESTION | — |

### Pegasuz Pipeline (unchanged)

`pegasuz-integrator` → `pegasuz-backend-development` → `pegasuz-feature-binding` → `pegasuz-frontend-normalization` → `pegasuz-frontend-executor` → `pegasuz-validation-qa` → `pegasuz-documentation-system`

### Audits

`a11y-audit` → `seo-audit` → `responsive-review` → `css-review` → `perf-check` → `project-review`

Resolve CRITICAL before shipping.

---

## Response Extraction (Pegasuz)

| Entity | API Response | Store Extraction |
|--------|-------------|-----------------|
| Properties, Services, Categories, Tags, Menu, Media | Direct array | `items = data` |
| Posts | `{ posts, pagination }` | `items = data.posts` |
| Projects | `{ projects, pagination }` | `items = data.projects` |
| Testimonials | `{ testimonials, pagination }` | `items = data.testimonials` |
| Contacts | `{ contacts, pagination }` | `items = data.contacts` |
| SiteContent | `{ tenant, version, contents }` | `contents = data.contents` |

---

## Frontend Structure

```
Project/
  docs/                          ← 4 foundation docs
  src/
    config/api.js                ← axios + resolveImageUrl + x-client
    services/<entity>Service.js
    stores/content.js            ← CMS bootstrap
    stores/<entity>.js           ← loading, error, pagination
    views/<Page>View.vue
    components/
      AtmosphereCanvas.vue       ← persistent WebGL/Canvas
      AppCursor.vue              ← custom cursor (3+ states)
      AppPreloader.vue           ← brand preloader
      AppHeader.vue
      AppFooter.vue
      sections/                  ← per-section components
    composables/
      useLenis.js                ← smooth scroll
      useMagnetic.js             ← magnetic buttons
    router/index.js              ← lazy loading
    styles/tokens.css            ← design tokens + cursor + transitions
    App.vue                      ← Lenis + cursor + transitions + router-view
    main.js
  .env
```

---

## Motion Fallbacks (ONLY if no motion-spec exists)

These are EMERGENCY fallbacks, not defaults. Every project should have a motion-spec.

```js
// Easing: brand easing from design-brief (NEVER power3.out by default)
// Duration: from design-brief (NEVER 0.8s by default)
// Y offset: from design-brief (NEVER 32px by default)
// ScrollTrigger: once: true
// Cleanup: gsap.context + onBeforeUnmount

let ctx = null
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ctx = gsap.context(() => { /* animations */ }, rootEl)
})
onBeforeUnmount(() => ctx?.revert())
```
