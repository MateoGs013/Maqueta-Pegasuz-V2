---
name: active-projects
description: Track projects being built from this maqueta -- name, slug, rubro, status, last touch
type: project
---

# Active Projects

Track every project built from this maqueta. This file persists across sessions so any agent can know what projects exist, their current status, and where they left off.

## How to use this file

### When starting a new project
Add a row to the table below with status `planning`. Include the project directory path.

### When resuming work
Check the Status and Last Phase columns to know exactly where to pick up. Read the Notes for any blockers or context from the previous session.

### When completing a phase
Update Last Phase, Last Touch, and Notes. Move Status forward when appropriate.

## Project registry

| Project | Slug | Rubro | Directory | Status | Last Phase | Last Touch | Notes |
|---------|------|-------|-----------|--------|------------|------------|-------|
| _(no projects yet)_ | | | | | | | |

## Status values

| Status | Meaning | Next action |
|--------|---------|-------------|
| `planning` | Foundation docs being created (content-brief, design-brief, page-plans, motion-spec) | Complete all 4 docs in `docs/` |
| `building` | Code being written -- scaffold, components, pages, motion, 3D | Continue construction per page-plans |
| `qa` | Quality chain running (validation-qa, a11y, seo, responsive, css, perf) | Fix all CRITICAL/BLOCKING, then MAJOR |
| `iterating` | Post-QA improvements, Awwwards critique cycle | Score target >= 9.0/10 |
| `delivered` | Handed off to client or deployed | Archive -- no further work unless requested |

## Phase tracking reference

Each project goes through these phases in order. Record the last completed phase in the table above.

```
Phase 0  - Discovery (client intake, brand questionnaire)
Phase 1  - Foundation docs (content-brief -> design-brief -> page-plans -> motion-spec)
Phase 2  - Scaffold (copy _project-scaffold/, configure .env, install deps)
Phase 3  - Design tokens (CSS custom properties from design-brief)
Phase 4  - Pages (one by one: HTML -> data -> styles -> motion -> SEO)
Phase 5  - 3D/WebGL (Tier 1 minimum)
Phase 6  - Quality chain (6 audits)
Phase 7  - Iteration (critique + fix cycle)
Phase 8  - Delivery
```

## Pegasuz client projects

For Pegasuz multi-tenant clients, also track:

| Client Slug | DB Name | Feature Flags | API Verified | Frontend Bound |
|-------------|---------|---------------|-------------|----------------|
| _(no clients yet)_ | | | | |
