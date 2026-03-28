---
name: lessons-learned
description: Problems found and solutions applied across sessions -- prevents repeating mistakes
type: feedback
---

# Lessons Learned

Read this file at the start of any session that modifies skills, templates, CLAUDE.md, or runs scheduled tasks. Every entry here represents a mistake that was already found and fixed -- do not re-introduce them.

## How to use this file

### Before modifying a skill
Check if there are entries for that skill in the table below. Apply the lesson proactively.

### After finding a new problem
Add a row with the date, problem, solution, and which skill/file was affected. Be specific enough that a future session can understand the fix without reading the diff.

### Categories
- **architecture** -- pipeline, phase ordering, skill connections
- **extraction** -- API response handling, store data extraction
- **tenant** -- multi-tenant isolation, x-client, slug handling
- **normalization** -- anti-pattern detection, code quality rules
- **templates** -- doc template completeness, minimums, structure
- **prompts** -- prompt quality, examples, pipeline connections
- **motion** -- animation defaults, GSAP patterns, reduced-motion
- **content** -- copy rules, CTA strategy, headline constraints

---

## Architecture lessons

| Date | Problem | Solution | Affected |
|------|---------|----------|----------|
| 2026-03-28 | threejs-3d pipeline step contradicted between CLAUDE.md list (step 3) and table (step 5) | Unified to step 5 in both CLAUDE.md and dispatch table | CLAUDE.md, skill-dispatch-table.md |
| 2026-03-28 | pegasuz-integrator Phase 4 did not mention normalization skill | Added explicit reference to `pegasuz-frontend-normalization` + added to Skill Registry | pegasuz-integrator SKILL.md |
| 2026-03-28 | pegasuz-integrator Skill Registry only listed 5 of 6 skills (missing normalization) | Added normalization as 6th skill | pegasuz-integrator SKILL.md |
| 2026-03-28 | pegasuz-frontend-executor pre-QA checklist had no tenant isolation checks | Added 4 tenant checks: x-client header, VITE_CLIENT_SLUG usage, no hardcoded slugs, DB isolation | pegasuz-frontend-executor SKILL.md |
| 2026-03-28 | skill-dispatch-table.md missing `new-project` as primary entry point | Added new-project with triggers and description as the first entry | guides/skill-dispatch-table.md |

## Extraction lessons

| Date | Problem | Solution | Affected |
|------|---------|----------|----------|
| 2026-03-28 | Response extraction table in CLAUDE.md missing Menu and Media entities | Added all 11 entities to consolidated table | CLAUDE.md |
| 2026-03-28 | pegasuz-feature-binding lacked a consolidated response extraction reference | Added Response Extraction Reference with all 10 entities and their patterns | pegasuz-feature-binding SKILL.md |
| 2026-03-28 | pegasuz-validation-qa missing SiteContent in extraction rules (had 8/9 entities) | Added SiteContent with `contents = data.contents` pattern | pegasuz-validation-qa SKILL.md |
| 2026-03-28 | pegasuz-validation-qa missing Menu in extraction rules and Entity Field Inventory | Added Menu entity to both extraction rules and field inventory | pegasuz-validation-qa SKILL.md |

## Normalization lessons

| Date | Problem | Solution | Affected |
|------|---------|----------|----------|
| 2026-03-28 | pegasuz-frontend-normalization missing anti-pattern for stores without loading/error states | Added AP-16: stores sin loading/error/pagination states | pegasuz-frontend-normalization SKILL.md |
| 2026-03-28 | pegasuz-frontend-normalization missing anti-pattern for CMS data used for feature entities | Added AP-17: CMS data para feature entities (should use feature stores) | pegasuz-frontend-normalization SKILL.md |

## Template lessons

| Date | Problem | Solution | Affected |
|------|---------|----------|----------|
| 2026-03-28 | page-plans template said "min 8 sections" for homepage but only templated 4 sections | Expanded all page templates to meet their stated minimum section counts | docs/_templates/page-plans.template.md |
| 2026-03-28 | design-brief template lacked accent-secondary, border tokens, transition tokens, z-index scale | Added --color-accent-secondary, border tokens, transition tokens, z-index scale | docs/_templates/design-brief.template.md |
| 2026-03-28 | motion-spec template only had 5 technique rows but homepage needs min 8 different techniques | Restructured with homepage subsection (8+ technique rows) plus per-page summaries | docs/_templates/motion-spec.template.md |

## Content lessons

| Date | Problem | Solution | Affected |
|------|---------|----------|----------|
| 2026-03-28 | content-brief hero headline constraint "max 3 words" was too restrictive for many rubros | Changed to "2 to 8 words" to allow more expressive headlines | docs/_templates/content-brief.template.md |

## Motion lessons

| Date | Problem | Solution | Affected |
|------|---------|----------|----------|
| 2026-03-28 | Motion defaults in CLAUDE.md confused with project-specific values, creating contradictions | Reframed as "emergency fallbacks" that only apply when `docs/motion-spec.md` does not exist. motion-spec is always the source of truth. | CLAUDE.md |

## Prompt lessons

| Date | Problem | Solution | Affected |
|------|---------|----------|----------|
| 2026-03-28 | 20 of 23 prompts lacked an "errores comunes" (common errors) section | Added errores comunes section to 20 prompts with 5-7 concrete mistakes each | prompts/ (20 files) |
| 2026-03-28 | 14 of 23 prompts had no concrete good-vs-bad examples | Added specific examples for 14 prompts showing correct and incorrect output | prompts/ (14 files) |
| 2026-03-28 | 10 of 23 prompts had no rubro-specific variations | Added rubro variations (4-6 rubros each) to 10 prompts | prompts/ (10 files) |
| 2026-03-28 | Most prompts did not specify what happens next in the pipeline | Added "conexion pipeline" and "siguiente paso" sections to 20 prompts | prompts/ (20 files) |

---

## Patterns to watch for (recurring risks)

These patterns have caused issues before. Check for them proactively:

1. **Minimum section counts**: When a template or page-plan states a minimum, verify the actual content meets it. Templates tend to under-template.
2. **Entity coverage in tables**: When listing entities (extraction, validation, field inventory), count them against the canonical list of 11: Properties, Services, Categories, Tags, Menu, Media, Posts, Projects, Testimonials, Contacts, SiteContent.
3. **Skill registry completeness**: When a skill references other skills, verify all are listed. Easy to miss one.
4. **CLAUDE.md contradictions**: When the same concept is defined in multiple places (list vs table, rules vs defaults), they can drift. Check both locations.
5. **Anti-pattern numbering**: When adding new AP codes to normalization, check the last number first to avoid gaps or duplicates.
