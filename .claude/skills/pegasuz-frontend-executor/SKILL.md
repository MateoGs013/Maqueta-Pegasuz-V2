---
name: pegasuz-frontend-executor
description: Orchestration layer for all Pegasuz frontend work. Bridges backend skills with the frontend skill suite. Operates in institutional site mode (useCMS, no Pinia, Contracts V2) or client frontend mode (Pinia + axios + feature-binding). Enforces design system, architecture rules, and multi-tenant awareness. Use when building features end-to-end, implementing pages, or applying UI to backend output. Triggers on "ejecuta", "implementa", "construye", "build page", "implement feature", "conectar API", "pegasuz integrator", "frontend completo", "build section".
---

# Pegasuz Frontend Executor

Orchestration layer that positions, routes, and enforces all frontend work within the Pegasuz ecosystem. This skill IS the "UI/UX Skill" referenced in **Phase 6** of `pegasuz-integrator`.

It does not replace the other frontend skills - it dispatches to them in the right order, with the right constraints, for the right project context.

---

## Step 0: Identify execution context

Before anything else, determine which mode applies:

### Mode A - INSTITUTIONAL SITE (Pegasuz Website V2)

Indicators:
- Task involves `pegasuz-website-v2` repo
- Files reference `useCMS`, `siteService`, `sitePayload`
- Content comes from `content`, `services`, `projects`, `blog`, `settings` features
- No Pinia stores for data loading
- No axios instances in `src/services/`

Architecture in this mode:

```
Page.vue
  └── useCMS(feature, slug?)     <- composable (src/composables/useCMS.js)
        └── siteService.js        <- central data layer (src/services/siteService.js)
              └── sitePayload     <- Contracts V2 assignment response
                    └── Pegasuz Core API  <- with x-client: pegasuz header
```

Rules:
- **No Pinia** for content/data loading. Pinia only for pure UI state if needed.
- **No axios instances** created per-feature. Use the central `siteService.js`.
- **No hardcoded content** as final source. Demo data only with `VITE_ENABLE_LOCAL_DEMO=true`.
- **useCMS()** is the only interface between pages/components and data.

---

### Mode B - CLIENT FRONTEND (argpiscinas, etc.)

Indicators:
- Task involves a tenant client's frontend app
- Files have `src/store/`, `src/services/`, Pinia stores
- Features follow `View -> Store -> Service -> API` pattern

Architecture in this mode:

```
View.vue
  └── Store (Pinia)              <- feature store
        └── Service (axios)       <- API service file
              └── Pegasuz Core API  <- with x-client: [tenant] header
```

In this mode: hand off data layer concerns to `pegasuz-feature-binding` skill. This executor handles the **UI and visual layer only** after feature-binding scaffolds the wiring.

---

## Step 1: Read the design system

**Mandatory before any output.** Read these docs in order - they are the non-negotiable visual constitution of Pegasuz Website V2:

1. `docs/brand.md` - Color palette, typography scale, tone of voice
2. `docs/ui-rules.md` - Spacing system, grid, component patterns, dos/don'ts
3. `docs/motion-rules.md` - GSAP easing, durations, scroll behavior rules
4. `docs/graphics-system.md` - Illustration style, icon system, media treatment

If any of these files is missing or empty, flag it and ask the user before proceeding.

> The web must feel like a brand + product system. Not a collection of pretty sections.

---

## Step 2: Understand the feature being built

Identify what feature this task maps to from the allowed feature set:

| Feature | What it powers |
|---------|---------------|
| `content` | Homepage hero, manifesto, platform overview, CTA blocks |
| `services` | Services page, service cards/previews |
| `projects` | Portfolio page, case study pages |
| `blog` | Insights listing, article pages |
| `collections` | Content groupings |
| `categories` | Taxonomy navigation |
| `tags` | Content filtering |
| `media` | Image/video assets |
| `messages` | Contact forms |
| `settings` | Global metadata, nav links, config |
| `analytics` | Tracking hooks |
| `translations` | Multi-language readiness |

**Out of scope - never implement:**
- `menu` feature (not in this site's contract)
- `properties` feature (not in this site's contract)

Check `docs/api-contract.md` and `docs/contracts-v2-web-adaptation.md` for data shapes if needed.

---

## Step 3: Data contract verification

Before writing any component, verify the data contract:

### For Mode A (Institutional Site)

Check that `useCMS()` or `siteService.js` already exposes the needed endpoint. If not:

1. Check `src/config/api.js` for base URL config
2. Check `src/services/siteService.js` for existing methods
3. Add the method if missing - following the existing pattern exactly
4. Expose via `useCMS(feature, options?)` composable

Expected data shapes per feature (from Contracts V2 `pegasuz-corporate-v1`):

**`services`** -> `{ slug, title, summary, longDescription, badges, featuredImage }`
**`projects`** -> `{ slug, title, client, challenge, solution, outcome, gallery }`
**`blog`** -> `{ slug, title, excerpt, readingTime, cover, category }`
**`content`** -> `{ hero, manifesto, platformOverview, ctaBlocks, legalMeta }`

### Three-tier data loading (always implement for resilience)

```js
// Priority: Contracts V2 -> Legacy API -> Demo content
const loadData = async (feature) => {
  if (import.meta.env.VITE_ENABLE_LOCAL_DEMO === 'true') {
    return localDemoData[feature]
  }
  try {
    return await contractsV2Service.getFeature(feature)
  } catch {
    return await legacyApiService.getFeature(feature) // fallback
  }
}
```

---

## Step 4: Dispatch to specialized skills

### MANDATORY FIRST STEP: Design Brief via `creative-design`

Before dispatching to ANY construction skill, verify that a **Design Brief** exists for this project/page. The Design Brief is produced by `creative-design` and contains: visual identity tokens, section architecture, motion choreography, interaction design, and immersion strategy.

**If no Design Brief exists → invoke `creative-design` FIRST.** Pass it:
- The client's business type/industry
- Aesthetic direction (from user or inferred from brand docs)
- URL of inspiration (if provided)
- Features being implemented (from Step 2)

**Only after the Design Brief is confirmed** → dispatch to construction skills.

### Skill dispatch table

| Task type | Primary skill | Requires Design Brief? | Default dispatch? |
|-----------|--------------|----------------------|-------------------|
| **Design Brief creation** | `creative-design` | N/A — this IS the brief | ALWAYS first |
| New page scaffold | `page-scaffold` | YES — section architecture, tokens, motion | ALWAYS |
| Vue component creation | `vue-component` | YES — tokens, atmosphere, interactions | As needed |
| Animation / scroll effects | `gsap-motion` | YES — motion choreography | ALWAYS after scaffold |
| **3D / WebGL atmosphere** | `threejs-3d` | YES — technique mapping | **ALWAYS** (Tier 1 minimum) |
| Composable creation | `vue-composable` | No | As needed |
| CSS / token audit | `css-review` | No | Post-construction |
| Accessibility check | `a11y-audit` | No | Post-construction |
| Performance check | `perf-check` | No | Post-construction |
| Responsive audit | `responsive-review` | No | Post-construction |
| Code search / exploration | `find-code` | No | As needed |

**IMPORTANT: `threejs-3d` is now a DEFAULT dispatch.** Every project gets at least Tier 1 (atmospheric shader/particles). The brief defines the tier and specifics. Only skip if the user explicitly opts out.

### Dispatch instructions

1. Pass the Design Brief's relevant sections to each construction skill. Do not make sub-skills re-read docs.
2. The brief's section architecture defines WHAT pages contain. `page-scaffold` implements it, not invents it.
3. The brief's motion choreography defines HOW things animate. `gsap-motion` implements it, not invents it.
4. Every visual decision in construction skills must trace back to the brief.

### Construction pipeline — strict order

Skills MUST execute in this order. Each step depends on the previous:

```
creative-design → page-scaffold → threejs-3d → vue-component → gsap-motion → audits
```

**Note: `threejs-3d` runs BEFORE `vue-component`** so that 3D canvases are established before component styling. The 3D layer is foundational atmosphere, not a final add-on.

### Skill handoff contracts

Each skill produces specific output that the next skill consumes:

| From | To | Contract (what is passed) |
|------|----|--------------------------|
| `creative-design` | `page-scaffold` | Design Brief file at `docs/design-brief.md` with: visual identity (palette hex, type families, spacing scale), section architecture (ordered list with purpose + layout + content per section), atmospheric system (grain, glow, grid specs) |
| `creative-design` | `gsap-motion` | Motion Choreography section of brief: brand easing curve, reveal defaults (Y offset, duration, stagger), scroll-linked specs (pin sections, scrub targets), page transition spec, preloader spec |
| `creative-design` | `vue-component` | Visual identity tokens + interaction design (hover patterns, cursor states) + atmospheric techniques |
| `creative-design` | `threejs-3d` | 3D/WebGL Scope section: where (hero/section/persistent), what (particles/wireframe/shader), scroll integration, mobile fallback |
| `page-scaffold` | `vue-component` | List of sections that need reusable components extracted. Section HTML structure with class names. |
| `page-scaffold` | `gsap-motion` | Page structure with section refs and element selectors for animation targeting |
| `vue-component` | `gsap-motion` | Component refs and animation-ready class names |
| All construction | Audit skills | Complete `.vue` files with template + script + styles for audit |

### Verification between handoffs

Before each dispatch, verify the input exists:

| Before dispatching to | Verify |
|----------------------|--------|
| `page-scaffold` | Design Brief file exists and has section architecture |
| `vue-component` | Page scaffold exists with sections, Design Brief has tokens |
| `gsap-motion` | Components/pages have refs and selectors, Design Brief has motion spec |
| `threejs-3d` | Design Brief has 3D scope section, project has Three.js installed |
| Audit skills | All construction skills have completed their output |

If verification fails, **do not proceed** — report what's missing and which step needs to run first.

---

## Step 5: Apply Pegasuz visual system

After the structural/data layer is done, apply the visual layer. This is where the design system docs translate into implementation.

### Visual enforcement checklist

**Tone** (from `docs/brand.md`):
- [ ] Closer to high-end product/development agency than startup landing
- [ ] No generic SaaS layouts (gradient blob + headline + "Get started" CTA)
- [ ] Typography uses the defined scale - no ad-hoc font sizes
- [ ] Color palette strictly from brand tokens - no improvised colors

**Layout** (from `docs/ui-rules.md`):
- [ ] Spacing follows the defined system (no magic numbers)
- [ ] Grid is consistent across sections
- [ ] Component patterns match existing established patterns
- [ ] No one-page pattern reintroduced (multi-page architecture maintained)

**Motion** (from Design Brief or `docs/motion-rules.md`):
- [ ] GSAP easing: from Design Brief (NOT always power3.out — each project has its own)
- [ ] Duration range: from Design Brief (varies per project)
- [ ] Y offset: from Design Brief (NOT always 32px — varies per project)
- [ ] `once: true` on all ScrollTrigger instances
- [ ] `clearProps: 'all'` after animation
- [ ] `prefers-reduced-motion` respected - always
- [ ] No infinite decorative loops
- [ ] No scrolljacking
- [ ] Animation VARIES per section (not same fade-up everywhere)

**3D/WebGL** (from Design Brief):
- [ ] At least one 3D/WebGL element present (Tier 1 minimum)
- [ ] Mobile fallback defined and implemented
- [ ] Canvas paused when off-screen (IntersectionObserver)
- [ ] GPU resources disposed on unmount

**Graphics** (from `docs/graphics-system.md`):
- [ ] Images follow defined treatment (duotone, blend-mode, or as-is per spec)
- [ ] Icons use the defined system - no mixing icon sets
- [ ] Illustration style matches brand direction

---

## Step 6: Integration with backend skills pipeline

### If receiving output from `pegasuz-integrator`

The integrator's Phase 6 calls this executor. It provides:
- Feature spec (what feature, what data shape)
- Backend verification status (routes, controller, service are confirmed)
- Required frontend contract (what props/data flows to the view)

Accept this input and proceed from Step 2 of this skill.

### If receiving output from `pegasuz-feature-binding` (Mode B)

Feature-binding scaffolds the full `View -> Store -> Service -> API` chain. This executor receives a structurally complete but visually unstyled output. Apply:
1. Pegasuz visual system (Step 5)
2. Motion layer via `gsap-motion` skill
3. Responsive behavior via `responsive-review` if needed

### Before handing to `pegasuz-validation-qa`

Ensure:
- [ ] All data fields specified in the contract are rendered (zero omission rule)
- [ ] No placeholder/hardcoded content in production paths
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Mobile layout confirmed
- [ ] Accessibility basics confirmed (semantic HTML, aria, keyboard)
- [ ] **Tenant isolation verified:**
  - [ ] `x-client` header configured in axios instance (from `VITE_CLIENT_SLUG`)
  - [ ] No hardcoded tenant slugs in source files
  - [ ] `.env` contains both `VITE_API_URL` and `VITE_CLIENT_SLUG`
  - [ ] `resolveImageUrl()` uses V3 canonical implementation (not simple prepend)
  - [ ] No cross-tenant data leakage paths
  - [ ] CMS bootstrap uses correct tenant context
- [ ] **Store integrity verified:**
  - [ ] Every feature store has `loading` and `error` refs (AP-16)
  - [ ] Feature data comes from dedicated stores, NOT from `contentStore` (AP-17)
  - [ ] Response extraction matches entity type (direct array vs paginated wrapper)

Then flag output as ready for `pegasuz-validation-qa`.

---

## Step 7: Anti-pattern enforcement

Flag and block the following patterns immediately:

| Anti-pattern | Why | Correct alternative |
|--------------|-----|-------------------|
| One-page architecture (all content in App.vue or single route) | Breaks editorial scale, AGENTS.md rule #1 | Multi-page with Vue Router |
| Generic SaaS layout (gradient + hero CTA + features grid) | Wrong tone for Pegasuz brand | Editorial, product-agency aesthetic |
| Hardcoded content as permanent source | Not API-first | Content via useCMS() or siteService |
| Pinia store for API data (Mode A) | Wrong architecture for institutional site | useCMS() composable |
| Axios instance per feature (Mode A) | Bypasses central data layer | siteService.js |
| `menu` or `properties` features | Out of scope in this site's contract | Remove, use allowed features only |
| Missing loading/error states | Poor UX and QA failure | Always implement both |
| Inline styles for spacing/color | Breaks design system | CSS custom properties / defined tokens |
| Animate layout properties (width, height, top, left) | Performance jank | Transform + opacity only |
| Skipping `prefers-reduced-motion` | Accessibility violation | Always wrap animations in media query check |
| **Same fade-up on every section** | Boring, no narrative variation | Each section gets a DIFFERENT animation technique |
| **No 3D/WebGL element anywhere** | Flat experience, missing immersion | At minimum Tier 1 atmospheric (shader/particles) |
| **Hardcoded pegasuz values** (#0a0a0b, #ff6a00, power3.out, 32px, 0.8s, 80px grid) | Clones pegasuz.com.ar instead of creating original work | All values from Design Brief, unique per project |
| **No reactive/interactive elements** | Page feels dead — just scrolling through static content | Mouse-reactive elements, tilt, magnetic buttons, cursor effects |
| **Dark + warm accent on every project** | Aesthetic monoculture | Each project has its own palette, mode, and personality |

---

## Step 8: Output format

Structure all output in this order:

### 1. Context summary (brief)
- Mode (A or B)
- Feature being implemented
- Data contract used

### 2. Data layer (if new)
- New method in `siteService.js` (if needed)
- useCMS composable call pattern

### 3. Component(s)
- Full Vue SFC: `<template>`, `<script setup>`, `<style scoped>`
- Inline design intent comments for non-obvious decisions

### 4. Motion layer
- GSAP animation block if applicable
- Timing and easing values called out explicitly

### 5. Validation readiness notes
- What the `validation-qa` skill should check
- Any known edge cases or gaps

---

## Quick reference: Pegasuz Website V2 stack

```
Vue 3 (Composition API, <script setup>)
Vite (build)
Vue Router (multi-page, no hash routing)
GSAP 3.13 + ScrollTrigger
Lenis 1.3 (smooth scroll)
SplitType 0.3 (text animation)
CSS Custom Properties (dark theme, no Tailwind)
No Pinia (for data - only for pure UI state if justified)
No axios instances per feature (central siteService.js)
```

**Contracts V2 contract name:** `pegasuz-corporate-v1`
**Template pack:** `pegasuz-editorial-dark-v1`
**Suggested render variants:** `services:editorial-grid`, `projects:case-study-rail`, `blog:insight-cards`, `content:cinematic-hero`
