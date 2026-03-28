---
name: project-review
description: Audit an existing project for technical debt, quality standards compliance, and improvement opportunities. Produces a health score and actionable fix plan. Use when asked to review, audit, or check the health of a project. Triggers on "review project", "audit project", "revisar proyecto", "auditar proyecto", "estado del proyecto", "project health", "health check", "technical debt", "deuda tecnica".
---

# Project Review — Health Check & Technical Debt Audit

Audit an existing project (already built) against the maqueta quality standards. Produces a comprehensive health report with actionable improvements.

## Prerequisites

- The project must exist and have source code to review
- Works with any frontend project (Vue, React, Svelte, etc.)
- For Pegasuz projects, also validates the View → Store → Service → API chain

## Phase 1: Detect project context

1. Read `package.json` — identify framework, dependencies, scripts
2. Scan file structure — identify patterns (src/, components/, views/, stores/, etc.)
3. Check for `docs/` directory — do foundation docs exist?
4. Check for `.env` or `.env.example` — environment configuration
5. Check for Pegasuz markers: `x-client`, `VITE_CLIENT_SLUG`, `prismaManager`

## Phase 2: Foundation docs check

| Check | How to verify | Weight |
|-------|--------------|--------|
| `docs/design-brief.md` exists | File exists and has content | 5 pts |
| `docs/content-brief.md` exists | File exists and has content | 5 pts |
| `docs/page-plans.md` exists | File exists and has content | 5 pts |
| `docs/motion-spec.md` exists | File exists and has content | 5 pts |
| Design tokens in CSS custom properties | Grep for `--color-`, `--font-`, `--spacing-` in styles | 5 pts |
| Tokens used consistently | No hardcoded colors/sizes in components | 5 pts |

## Phase 3: Code quality checklist

### Architecture (20 pts)

- [ ] **Router**: Uses `createWebHistory` (not hash), lazy loading, `scrollBehavior` (5 pts)
- [ ] **State management**: Pinia stores with `loading`, `error`, `items` pattern (5 pts)
- [ ] **Services layer**: HTTP calls only in `src/services/`, imports from `src/config/api.js` (5 pts)
- [ ] **No shortcuts**: Views don't import axios directly, no JSON.parse in templates (5 pts)

### UI & UX (20 pts)

- [ ] **Loading states**: Every data-dependent view has loading UI (5 pts)
- [ ] **Error states**: Every data-dependent view has error UI with recovery CTA (5 pts)
- [ ] **Responsive**: Mobile-first, no horizontal overflow, touch targets ≥ 44px (5 pts)
- [ ] **Section minimum**: Pages meet minimum section count per page-plans (5 pts)

### Motion & 3D (15 pts)

- [ ] **prefers-reduced-motion**: Guard in every animated component (5 pts)
- [ ] **GSAP cleanup**: `gsap.context()` + `onBeforeUnmount(() => ctx?.revert())` (5 pts)
- [ ] **Animation variety**: Each section uses different technique (not all fade-up) (3 pts)
- [ ] **3D element**: At least Tier 1 (shader or particles) present (2 pts)

### SEO & A11y (15 pts)

- [ ] **Meta tags**: Unique title + description per page (3 pts)
- [ ] **OG tags**: og:title, og:description, og:image per page (2 pts)
- [ ] **JSON-LD**: Structured data appropriate to page type (2 pts)
- [ ] **Semantic HTML**: Proper landmarks, single h1, heading hierarchy (3 pts)
- [ ] **Skip link**: Present and functional (1 pt)
- [ ] **Alt text**: All images have descriptive alt (2 pts)
- [ ] **Images**: width, height, lazy loading attributes (2 pts)

### Pegasuz-specific (10 pts, only if Pegasuz project)

- [ ] **Tenant isolation**: `VITE_CLIENT_SLUG` from env, `x-client` header on all requests (3 pts)
- [ ] **Chain complete**: View → Store → Service → API for every feature (3 pts)
- [ ] **Response extraction**: Correct for each entity type (2 pts)
- [ ] **Image pipeline**: All images use `resolveImageUrl()` (2 pts)

## Phase 4: Calculate health score

```
Total possible: 100 pts (90 for non-Pegasuz projects)
Score = (earned / possible) × 100

90-100: Excellent — ready for delivery
75-89:  Good — minor improvements needed
60-74:  Fair — significant issues to address
Below 60: Poor — major rework needed
```

## Output format

```
# Project Review: [project name]

## Health Score: X/100

## Stack detected
- Framework: [Vue 3 / React / etc.]
- State: [Pinia / Vuex / Redux / etc.]
- Router: [Vue Router / React Router / etc.]
- Animation: [GSAP / Framer Motion / CSS / none]
- 3D: [Three.js / TresJS / none]
- Type: [Pegasuz multi-tenant / Standalone]

## ✅ PASS (N items)
[list of checks that passed]

## 🔴 CRITICAL (N items) — must fix before delivery
[list with specific file:line references and fix instructions]

## 🟡 WARNING (N items) — should fix
[list with recommendations]

## 💡 SUGGESTION (N items) — nice to have
[list of improvement opportunities]

## Technical debt estimate
[summary of effort needed]

## Action plan (ordered by impact)
1. [highest impact fix first]
2. [next highest]
...
```

## Common patterns to flag

| Pattern | Severity | Why |
|---------|----------|-----|
| Hardcoded colors in components | 🟡 WARNING | Breaks design system consistency |
| No loading state on data views | 🔴 CRITICAL | Blank page while loading = bad UX |
| axios imported outside api.js | 🔴 CRITICAL | Breaks Pegasuz chain |
| Static route imports (no lazy) | 🟡 WARNING | Bundle size impact |
| GSAP without context cleanup | 🔴 CRITICAL | Memory leak on navigation |
| Same animation on all sections | 🟡 WARNING | Monotonous experience |
| Missing meta tags | 🟡 WARNING | SEO impact |
| Images without dimensions | 🟡 WARNING | Layout shift (CLS) |
