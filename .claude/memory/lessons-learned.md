---
name: lessons-learned
description: Problems found and how they were solved — prevents repeating mistakes across sessions
type: feedback
---

# Lessons Learned

| Date | Problem | Solution | Skill |
|------|---------|----------|-------|
| 2026-03-28 | threejs-3d pipeline step contradicted between list (3) and table (5) | Unified to step 5 in both CLAUDE.md and dispatch table | claude-md-optimization |
| 2026-03-28 | Motion defaults confused with project-specific values | Reframed as "emergency fallbacks" — motion-spec.md is source of truth | claude-md-optimization |
| 2026-03-28 | Response extraction table missing Menu and Media entities | Added all entities to consolidated table | claude-md-optimization |
| 2026-03-28 | pegasuz-integrator Phase 4 did not mention normalization skill | Added explicit reference + normalization to skill registry | pegasuz-skills-deep-review |
| 2026-03-28 | pegasuz-feature-binding lacked consolidated response extraction table | Added Response Extraction Reference with 10 entities | pegasuz-skills-deep-review |
| 2026-03-28 | pegasuz-validation-qa missing SiteContent and Menu in extraction rules | Added both entities to extraction rules and field inventory | pegasuz-skills-deep-review |
| 2026-03-28 | pegasuz-frontend-executor pre-QA had no tenant isolation checks | Added 4 tenant checks to pre-QA checklist | pegasuz-skills-deep-review |
| 2026-03-28 | pegasuz-frontend-normalization missing AP-16 and AP-17 | Added: stores sin loading/error, CMS data for feature entities | pegasuz-skills-deep-review |
| 2026-03-28 | page-plans template said "min 8 sections" but only templated 4 | Expanded all pages to meet their stated minimums | doc-templates-stress-test |
| 2026-03-28 | design-brief template lacked accent-secondary and border tokens | Added --color-accent-secondary, border tokens, transition tokens, z-index scale | doc-templates-stress-test |
| 2026-03-28 | content-brief hero headline "max 3 words" too restrictive | Changed to "2 to 8 words" | doc-templates-stress-test |
| 2026-03-28 | motion-spec only had 5 technique rows but homepage needs min 8 | Restructured with homepage subsection (8 rows) + other pages summary | doc-templates-stress-test |
| 2026-03-28 | 20 of 23 prompts lacked common errors section | Added errores comunes to 20 prompts | prompt-library-quality-review |
| 2026-03-28 | skill-dispatch-table.md missing new-project entry point | Added new-project as primary entry point with triggers | guides-completeness-rewrite |
