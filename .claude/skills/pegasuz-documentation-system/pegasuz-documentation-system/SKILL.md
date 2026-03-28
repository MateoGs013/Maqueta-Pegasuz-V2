---
name: pegasuz-documentation-system
description: 'Mandatory post-execution documentation system. Transforms skill outputs into folder-organized, persistent documentation at Documentation/backend/<operation-name>/. Always generates complete file blocks — never plain text. Use after ANY Integrator, Backend Development, or Feature Binding execution.'
---

## OUTPUT FORMAT — MANDATORY

ALL documentation MUST be returned as complete file blocks using this exact format:

```
--- filename: Documentation/backend/<operation-folder>/<file-name>.md ---
<full markdown content>
```

**Rules:**
- Every execution produces AT LEAST one file block
- Multiple file blocks are allowed when the operation spans multiple concerns
- NO text outside file blocks (no summaries, no explanations, no commentary)
- The `<operation-folder>` is derived from the operation performed (see Folder Naming Rules)
- The `<file-name>` describes the specific document within that operation

**Examples of valid output:**

```
--- filename: Documentation/backend/media-system-refactor/media-system-refactor.md ---
# Media System Refactor
...
```

```
--- filename: Documentation/backend/blog-integration/blog-binding-report.md ---
# Blog Feature Binding — Argpiscinas
...

--- filename: Documentation/backend/blog-integration/blog-api-contract.md ---
# Blog API Contract
...
```

# Pegasuz Documentation System — Knowledge Management Skill

## Skill Name

**pegasuz-documentation-system**

## Purpose

Transform every execution output (from Integrator, Backend Development, or Feature Binding skills) into structured, reusable, interconnected documentation that accumulates system knowledge over time. This skill ensures no integration is ever rethought from scratch, all system behavior is traceable, and the documentation corpus functions as a living system component — not a byproduct.

---

## Core Principle

Documentation is a **system component**. It has the same status as source code: it must be correct, consistent, versioned, and maintained. A feature without documentation is incomplete. Documentation that contradicts the system is a defect.

---

## Mandatory Execution

Documentation is **NOT optional**. It MUST run after every skill execution:

| Trigger | When |
|---------|------|
| Integrator completes any phase | Always — Phase 8 is documentation |
| Backend Development Skill completes | Always — output is documented |
| Feature Binding Skill completes | Always — binding is documented |
| Any fix or patch is applied | Always — fix is documented |

**There is no scenario where a skill executes and documentation is skipped.**

If the upstream skill does not explicitly invoke this skill, the executing agent MUST invoke it before reporting completion. An execution without documentation output is **incomplete by definition**.

---

## Folder Naming Rules

Every documentation output is stored inside a **named operation folder** under `Documentation/backend/`.

**Base path:** `H:\Pegasuz\Documentation\backend\`

**Folder name** is derived from the operation performed:

| Rule | Detail |
|------|--------|
| Format | `kebab-case` |
| Length | Short but descriptive (2-5 words) |
| Timestamps | NEVER included in folder name |
| Randomness | NEVER included |
| Determinism | Same operation → same folder name |

**Derivation logic:**

1. Identify the primary operation (e.g., "refactor media system", "integrate blog", "fix property gallery")
2. Convert to kebab-case: `media-system-refactor`, `blog-integration`, `property-gallery-fix`
3. If client-specific, prefix with client slug: `argpiscinas-blog-integration`
4. If system-wide, no prefix: `media-system-refactor`

**Examples:**

| Operation | Folder Name |
|-----------|------------|
| Refactor media upload system | `media-system-refactor` |
| Integrate blog for argpiscinas | `argpiscinas-blog-integration` |
| Fix missing property gallery | `property-gallery-fix` |
| Add testimonials pagination | `testimonials-pagination` |
| Multi-tenant provisioning fix | `multitenant-provisioning-fix` |
| Bind services for larucula | `larucula-services-binding` |

---

## Input Sources

This skill receives structured output from three upstream skills:

| Source Skill | Output Format | Contains |
|-------------|--------------|----------|
| **Integrator** | `<client>-<operation>-integration.md` | Full end-to-end execution report: task breakdown, phases executed, validation matrix, files touched |
| **Backend Development** | `<task-name>.md` | Summary, affected files, data flow, API endpoints, schema changes, tenant safety verification |
| **Feature Binding** | `<feature>-binding.md` | API contract, data mapping table, fields excluded, relations handled, media handling, validation checklist |

The documentation system does NOT generate the raw content — the upstream skills do. This skill **classifies**, **structures**, **files**, **indexes**, **cross-links**, and **maintains** that content within a coherent knowledge base.

---

## Document Types

Every document entering the system MUST be classified into exactly one type:

### 1. Integration Report

Full end-to-end execution covering client provisioning, feature activation, binding, and validation.

- **Source:** Integrator Skill (Phase 8 output)
- **Path:** `Documentation/backend/<operation-folder>/<client>-integration.md`
- **Scope:** Entire client setup or multi-feature activation
- **Example:** `Documentation/backend/lavaderoartesanal-setup/lavaderoartesanal-integration.md`

### 2. Feature Binding Report

Specific feature connected from backend API to frontend rendering.

- **Source:** Feature Binding Skill
- **Path:** `Documentation/backend/<operation-folder>/<client>-<feature>-binding.md`
- **Scope:** Single feature (blog, properties, services, etc.) for one client
- **Example:** `Documentation/backend/argpiscinas-properties-binding/argpiscinas-properties-binding.md`

### 3. Backend Change Report

Schema modifications, new endpoints, controller changes, or service additions.

- **Source:** Backend Development Skill
- **Path:** `Documentation/backend/<operation-folder>/<feature>-backend-change.md`
- **Scope:** Backend-only changes that affect API contracts
- **Example:** `Documentation/backend/testimonials-pagination/testimonials-pagination-backend-change.md`

### 4. Fix / Patch Report

Bug fixes, missing field corrections, broken relation repairs.

- **Source:** Any skill (typically Binding or Backend)
- **Path:** `Documentation/backend/<operation-folder>/<feature>-fix-<issue>.md`
- **Scope:** Specific defect resolution
- **Example:** `Documentation/backend/property-gallery-fix/properties-fix-missing-gallery.md`

### Classification Decision Tree

```
Is this a multi-phase client setup or multi-feature operation?
  YES → Integration Report

Is this connecting an existing API feature to frontend views?
  YES → Feature Binding Report

Is this modifying backend code only (schema, controller, route)?
  YES → Backend Change Report

Is this correcting a broken or incomplete implementation?
  YES → Fix / Patch Report
```

---

## File Structure

```
H:\Pegasuz\Documentation\
├── INDEX.md                              ← Global knowledge index (MANDATORY)
├── backend/                              ← ALL documentation lives here, in operation folders
│   ├── <operation-folder>/               ← Named after the operation performed
│   │   ├── <primary-report>.md           ← Main document for the operation
│   │   ├── <secondary-report>.md         ← Additional docs if needed (contracts, etc.)
│   │   └── ...
│   ├── media-system-refactor/            ← Example: system-wide refactor
│   │   └── media-system-refactor.md
│   ├── argpiscinas-blog-integration/     ← Example: client feature integration
│   │   ├── argpiscinas-blog-binding.md
│   │   └── blog-api-contract.md
│   ├── testimonials-pagination/          ← Example: backend change
│   │   └── testimonials-pagination-backend-change.md
│   └── property-gallery-fix/             ← Example: fix
│       └── properties-fix-missing-gallery.md
├── source-of-truth/                      ← Architecture specs (existing, read-only reference)
│   ├── PEGASUZ_FRONTEND_IMPLEMENTATION_SPEC.md
│   ├── PEGASUZ_FRONT_INTEGRATION_SOURCE_OF_TRUTH.md
│   └── ...
├── skills/                               ← Skill definitions (existing)
│   └── ...
└── integraciones/                        ← Legacy docs (pre-system, read-only reference)
    └── ...
```

### Naming Convention

All folder and file names use **kebab-case**, are deterministic, and follow these patterns:

| Type | Folder Pattern | File Pattern | Example Path |
|------|---------------|-------------|-------------|
| Integration | `<client>-<operation>` | `<client>-integration.md` | `backend/lavaderoartesanal-setup/lavaderoartesanal-integration.md` |
| Feature Binding | `<client>-<feature>-binding` | `<client>-<feature>-binding.md` | `backend/argpiscinas-blog-integration/argpiscinas-blog-binding.md` |
| Backend Change | `<feature>-<change>` | `<feature>-backend-change.md` | `backend/testimonials-pagination/testimonials-pagination-backend-change.md` |
| Fix | `<feature>-<issue>-fix` | `<feature>-fix-<issue>.md` | `backend/property-gallery-fix/properties-fix-missing-gallery.md` |

If a document already exists at the target path, **update it** — do not create a duplicate. Append a version entry to its change history.

---

## Required Document Sections

Every document processed by this skill MUST contain these sections. If the upstream skill output is missing any section, the documentation system adds it with available information or marks it `[PENDING — requires manual input]`.

### Section 1 — Header Block

```markdown
# <Title>

| Field | Value |
|-------|-------|
| Type | Integration / Feature Binding / Backend Change / Fix |
| Client | <slug> or "all" (if system-wide) |
| Feature(s) | <list> |
| Date | YYYY-MM-DD |
| Version | v1 |
| Status | complete / partial / superseded |
| Operation Folder | `<operation-folder>` |
| Related Docs | [links] |
```

### Section 2 — Context

What was requested and why:
- Original instruction or trigger
- Scope of the operation

### Section 3 — Execution Summary

How the operation was executed:
- Phases completed
- Skills used (Backend Development, Feature Binding, Integrator, etc.)
- Execution order and dependencies

### Section 4 — Changes Applied

Concrete modifications made:
- Files modified (with before/after when relevant)
- Functions added or updated
- Schema changes
- Route changes

```markdown
| File | Action | Description |
|------|--------|-------------|
| path/to/file | Created / Modified / Deleted | What changed |
```

### Section 5 — Architecture Impact

How this change affects the system:
- Layers affected (API, Service, Store, View, Route)
- Multi-tenant implications
- Shared vs. client-specific changes

### Section 6 — Contracts

API and data contracts:
- Method + URL
- Request parameters / body
- Response shape (exact JSON structure)
- Field mapping (API → Store → View)
- Pagination shape (if applicable)

```markdown
| Backend Field | Type | Service | Store | List View | Detail View | Status |
|--------------|------|---------|-------|-----------|-------------|--------|
```

Only required for Feature Binding and Integration reports. Omit for backend-only changes.

### Section 7 — Validation

What was verified:
- Field coverage (X/Y fields mapped)
- Route integrity
- Tenant safety
- Media pipeline
- Compatibility with legacy implementations
- What failed and how it was resolved

### Section 8 — Reuse Notes

How this work applies to other contexts:
- Applicability to other features or clients
- Configuration changes needed for reuse
- Steps to replicate for a different tenant

### Section 9 — Decisions Made

Technical decisions with rationale:
- Why this approach over alternatives
- Trade-offs accepted
- Constraints that influenced the decision

### Section 10 — Known Limitations

What was NOT implemented and why:
- Explicitly out of scope
- Deferred for future work
- Blocked by external dependency

### Section 11 — Change History

```markdown
| Version | Date | Description |
|---------|------|-------------|
| v1 | YYYY-MM-DD | Initial creation |
| v2 | YYYY-MM-DD | Updated after <change> |
```

---

## Global Index — INDEX.md

The documentation system MUST maintain a global index at `/Documentation/INDEX.md`.

### Structure

```markdown
# Pegasuz Documentation Index

> Auto-maintained by Pegasuz Documentation System Skill.
> Last updated: YYYY-MM-DD

## Clients

| Client | Slug | Status | Features | Integration Doc |
|--------|------|--------|----------|-----------------|
| Arg Piscinas | argpiscinas | active | blog, services, projects | [link] |
| La Rucula | larucula | active | menu, blog | [link] |
| ... | ... | ... | ... | ... |

## Feature Binding Reports

| Client | Feature | Status | Folder | Doc |
|--------|---------|--------|--------|-----|
| argpiscinas | blog | complete | `argpiscinas-blog-integration` | [link](backend/argpiscinas-blog-integration/argpiscinas-blog-binding.md) |
| argpiscinas | properties | complete | `argpiscinas-properties-binding` | [link](backend/argpiscinas-properties-binding/argpiscinas-properties-binding.md) |
| ... | ... | ... | ... | ... |

## Backend Change Reports

| Feature | Change | Folder | Date | Doc |
|---------|--------|--------|------|-----|
| testimonials | Added pagination | `testimonials-pagination` | YYYY-MM-DD | [link](backend/testimonials-pagination/testimonials-pagination-backend-change.md) |
| ... | ... | ... | ... | ... |

## Fix Reports

| Feature | Issue | Folder | Date | Doc |
|---------|-------|--------|------|-----|
| properties | Missing gallery rendering | `property-gallery-fix` | YYYY-MM-DD | [link](backend/property-gallery-fix/properties-fix-missing-gallery.md) |
| ... | ... | ... | ... | ... |

## Architecture Reference

| Document | Scope | Path |
|----------|-------|------|
| Frontend Implementation Spec | Frontend architecture rules | [link](source-of-truth/PEGASUZ_FRONTEND_IMPLEMENTATION_SPEC.md) |
| Integration Source of Truth | Real integration patterns | [link](source-of-truth/PEGASUZ_FRONT_INTEGRATION_SOURCE_OF_TRUTH.md) |
| Integration Audit | Cross-client inconsistencies | [link](source-of-truth/INTEGRATION_AUDIT.md) |

## Skills

| Skill | Purpose | Path |
|-------|---------|------|
| Backend Development | Multi-tenant backend changes | [link](skills/BACKEND_DEVELOPMENT_SKILL.md) |
| Feature Binding | API-to-frontend full mapping | [link](skills/FEATURE_BINDING_SKILL.md) |
| Integrator | Orchestrates multi-phase execution | [link](skills/PEGASUZ_INTEGRATOR_SKILL.md) |
| Documentation System | Knowledge management | [link](skills/PEGASUZ_DOCUMENTATION_SYSTEM_SKILL.md) |

## Legacy Documentation

| Document | Topic | Path |
|----------|-------|------|
| Properties Integration | Properties feature (argpiscinas) | [link](integraciones/PROPERTIES_INTEGRATION.md) |
| Blog Integration | Blog feature (argpiscinas) | [link](integraciones/BLOG_INTEGRATION.md) |
| ... | ... | ... |
```

### Index Update Rules

1. **Every new document** triggers an INDEX.md update — add the entry to the correct table.
2. **Every document update** triggers an INDEX.md status review — update status if changed.
3. **Status values:** `complete` (all sections filled), `partial` (some sections pending), `superseded` (replaced by newer doc).
4. **Never remove entries** — mark as `superseded` and link to replacement.
5. **Alphabetical ordering** within each table section.

---

## Cross-Linking Rules

If more than 5 related documents exist:
- Prioritize most relevant
- Avoid over-linking

### Mandatory Links

Every document MUST include links to:

1. **Related documents of the same client** — if writing about argpiscinas blog binding, link to argpiscinas integration report and any other argpiscinas feature bindings.
2. **Related documents of the same feature** — if writing about blog binding, link to the backend blog endpoint documentation and any previous blog fixes.
3. **Upstream architecture references** — link to `PEGASUZ_FRONTEND_IMPLEMENTATION_SPEC.md` or `PEGASUZ_FRONT_INTEGRATION_SOURCE_OF_TRUTH.md` when the document depends on conventions defined there.
4. **Skill used** — link to the skill definition that governed the execution.

### Link Format

```markdown
**Related:** [Argpiscinas Integration](../integrations/argpiscinas-integration.md)
**See also:** [Blog Backend Change](../backend/blog-pagination-backend-change.md)
**Governed by:** [Feature Binding Skill](../skills/FEATURE_BINDING_SKILL.md)
```

### Anti-Duplication Rule

If information already exists in another document, **reference it** — do not copy it.

```markdown
## Data Contract

API response shape documented in [Properties Integration](../integraciones/PROPERTIES_INTEGRATION.md#4-endpoints).
No changes from that contract.
```

This keeps the knowledge base DRY and ensures changes propagate from a single source.

---

## Consistency Rules

### C1 — Single Source of Truth Per Fact

Every technical fact (API shape, field list, route path, file location) is documented in exactly ONE place. All other documents reference that place.

Truth hierarchy:
1. **Prisma schema** → authoritative for database fields
2. **Controller code** → authoritative for API response shape
3. **Feature Binding doc** → authoritative for field mapping
4. **Integration doc** → authoritative for end-to-end flow

### C2 — Update, Never Duplicate

When behavior changes, update the existing document. Do NOT create a new document for the same topic. Instead:
- Add a Change History entry
- Increment version
- Update the affected sections
- Update INDEX.md status

Exception: if a change is fundamentally different in scope (e.g., a complete rewrite vs. a patch), create a new document and mark the old one as `superseded`.

### C3 — Contradiction Detection

Before writing any document, check if existing docs contain contradictory information about the same topic. If found:
1. Determine which source is correct (verify against code).
2. Update the incorrect document.
3. Note the correction in both documents' Change History.

### C4 — Naming Determinism

Given the same input (client + feature + type), the filename is always the same. This means:
- If you need documentation about argpiscinas properties binding, the path is ALWAYS `features/argpiscinas-properties-binding.md`.
- If a document exists at that path, you update it.
- If it doesn't exist, you create it.
- There is never ambiguity about where a document should live.

---

## Versioning

### Version Format

Semantic: `v1`, `v2`, `v3` — integer increment on every substantive update.

### What Counts as a Version Bump

- New sections added → version bump
- Existing sections modified with new information → version bump
- Cosmetic/formatting changes → no version bump
- Status change (partial → complete) → version bump

### Change History Is Mandatory

Every document has a Change History table at the bottom. This is never omitted, even on creation.

```markdown
## Change History

| Version | Date | Description |
|---------|------|-------------|
| v1 | 2026-03-27 | Initial creation — full blog binding for argpiscinas |
```

---

## Document Lifecycle

### Creation

Paths are relative to project root:
H:\Pegasuz\Documentation\backend\<operation-folder>\<file-name>.md

1. Upstream skill produces execution output.
2. Documentation system classifies the output (Integration / Binding / Backend / Fix).
3. Determines target path using naming convention.
4. Checks if document already exists at that path.
   - If NO → create with all required sections + v1.
   - If YES → update existing document, bump version.
5. Apply cross-links to related documents.
6. Update INDEX.md.

### Update

1. Identify which sections changed.
2. Modify ONLY the affected sections.
3. Add Change History entry.
4. Bump version.
5. Update cross-links if new relations emerged.
6. Update INDEX.md status if changed.

### Supersession

1. Create new document with clear title distinction.
2. Mark old document status as `superseded`.
3. Add link from old → new in old document's header.
4. Update INDEX.md to point to new document.
5. Do NOT delete the old document — it serves as historical record.

---

## Execution Workflow

This workflow is **MANDATORY**. It runs after every skill execution — never skipped.

When this skill is invoked (directly or as part of the Integrator's Phase 8), follow this sequence:

### Step 1 — Receive Input

Accept the execution output from the upstream skill. Identify:
- Which skill produced it
- What operation was performed
- Which client and feature(s) are involved

### Step 2 — Determine Operation Folder

Folder naming must be STABLE.

If a folder already exists for a similar operation:
→ reuse it
→ DO NOT create a new variation

Derive the folder name from the operation:
1. Identify the primary action performed
2. Convert to kebab-case
3. If client-specific → prefix with client slug
4. Verify determinism: same operation always produces same folder name

**Output:** `Documentation/backend/<operation-folder>/`

### Step 3 — Classify

Apply the classification decision tree to determine document type and file name within the folder.

### Step 4 — Check Existing State

1. Read INDEX.md to understand current documentation state.
2. Check if the operation folder already exists.
3. Check if a document already exists at the target path.
4. Check for related documents that need cross-linking.

### Step 5 — Structure Content

Ensure all 11 required sections are present. For each section:
- If upstream output provides the data → use it
- If data is available from the execution context → fill it in
- If data is not available → mark `[PENDING]`

No section may be silently omitted.

### Step 6 — Generate File Blocks

Format ALL output as file blocks:

```
--- filename: Documentation/backend/<operation-folder>/<file-name>.md ---
<full markdown content with all 11 sections>
```

Generate multiple file blocks if the operation warrants separate documents.

### Step 7 — Cross-Link

1. Identify all related documents (same client, same feature, same type).
2. Add `Related` and `See also` links to the new document.
3. Update related documents to link back to the new document.

### Step 8 — Update Index

1. Add or update the entry in INDEX.md with the operation folder reference.
2. Set correct status.
3. Verify all links resolve to existing files.

### Step 9 — Validate

Before finalizing, verify:

- [ ] Output is formatted as file block(s) with `--- filename: ... ---` wrapper
- [ ] File path includes `Documentation/backend/<operation-folder>/`
- [ ] Operation folder name follows kebab-case naming rules
- [ ] Document is at the correct path per naming convention
- [ ] All 11 sections present (or explicitly marked `[PENDING]`)
- [ ] Header block is complete (type, client, feature, date, version, status, operation folder)
- [ ] Cross-links are valid (linked files exist)
- [ ] INDEX.md is updated
- [ ] No information is duplicated from existing docs (references used instead)
- [ ] Change History is present
- [ ] Another developer could reproduce the work from this document alone
- [ ] NO plain text explanations outside file blocks

If any check fails → fix before returning output.

---

## Legacy Document Handling

The `/Documentation/integraciones/` folder contains pre-system documentation created before this skill existed. These documents:

- Are treated as **read-only references**
- Are indexed in INDEX.md under "Legacy Documentation"
- Are linked from new documents when relevant
- Are NOT modified by this skill
- May be superseded by new documents in the proper folder structure

Existing documents in `/Documentation/` root (e.g., `saas.md`, `backendcontrato.md`) follow the same read-only legacy rule.

When a new document covers the same topic as a legacy document, the new document:
1. Links to the legacy doc as historical reference
2. Clearly states it supersedes the legacy content
3. Is the authoritative source going forward

---

## Validation Criteria

### Traceability Test

For any system behavior, can a developer:
1. Find the relevant document via INDEX.md? → YES
2. Understand what was implemented? → YES
3. See which files were changed? → YES
4. Reproduce the implementation? → YES

If any answer is NO → documentation is incomplete.

### Reproducibility Test

Given the document alone (without access to the original developer or AI), can another engineer:
1. Understand the API contract? → YES
2. Understand the data flow? → YES
3. Set up the feature for a new client? → YES (via Reuse Notes)
4. Verify correctness? → YES (via Validation Results)

If any answer is NO → documentation is incomplete.

### Freshness Test

Does the document reflect the current state of the code?
- If code was updated after documentation → document needs a version bump
- If document references files that no longer exist → document needs correction
- If INDEX.md links to documents that don't exist → index needs correction

---

## Rules

CONSTRAINT:

Documentation must be COMPLETE but NOT excessive.

Avoid:
- Rewriting large code blocks unnecessarily
- Duplicating entire API responses if already documented elsewhere

Prefer referencing existing documents over expanding content.

CRITICAL RULE:

Documentation must NEVER block execution.

If required information is missing:
- Fill what is known
- Mark unknown sections as [PENDING]
- Continue execution

Do NOT stop or delay system execution waiting for perfect documentation.

### R1 — Every Execution Produces Documentation

No exceptions. Backend change, feature binding, integration, fix — all produce or update documentation. A task without documentation is incomplete. Documentation is returned as file blocks — never as plain text summaries.

### R2 — INDEX.md Is Always Current

Every document creation or update MUST be accompanied by an INDEX.md update. INDEX.md is the single entry point for the entire knowledge base.

### R3 — Reference, Never Duplicate

If information exists in another document, link to it. Copy-pasting content between documents creates maintenance debt and contradiction risk.

### R4 — Deterministic Filing

Given the same input, the document always goes to the same path. No ambiguity in document location.

### R5 — Backward Compatibility

Never delete existing documentation. Supersede with clear links. The documentation history is as valuable as the current state.

### R6 — Completeness Over Speed

A document with `[PENDING]` sections is acceptable as a tracked incomplete. A document with silently omitted sections is a defect.

### R7 — Cross-Links Are Mandatory

Every document must connect to its related documents. Isolated documents reduce the system's navigability and knowledge density.

### R8 — Versioning Is Mandatory

Every document has a version and change history. Updates to existing documents increment the version and record what changed.

### R9 — Legacy Preservation

Pre-existing documentation is preserved as-is and indexed. New work supersedes but never deletes historical records.

### R10 — Documentation Validates Itself

Before saving, every document passes the traceability, reproducibility, and freshness tests. Failing documents are fixed before finalization.

### R11 — Folder-Based Organization Is Mandatory

Every document lives inside an operation folder under `Documentation/backend/`. No files are placed directly in `Documentation/backend/` without a folder. The folder name describes the operation — not the date, not a random ID.

### R12 — Output Is Always File Blocks

The documentation system NEVER returns plain text explanations. ALL output is wrapped in `--- filename: ... ---` blocks. If multiple documents are needed, multiple blocks are returned. Zero exceptions.
