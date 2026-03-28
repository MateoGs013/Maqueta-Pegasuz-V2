---
name: pegasuz-integrator
description: 'Orchestrate multi-step Pegasuz operations end-to-end. Decomposes high-level instructions into ordered tasks, delegates to specialized skills, enforces execution sequence, and validates cross-layer consistency. Use for any multi-phase integration or feature deployment.'
---

# Pegasuz Integrator — Orchestration Skill

## Skill Name

**pegasuz-integrator**

## Purpose

Coordinate the end-to-end execution of multi-step Pegasuz operations by decomposing high-level instructions into ordered tasks, assigning each to the correct specialized skill, enforcing execution sequence, validating cross-layer consistency, and producing unified documentation.

This skill does NOT directly implement backend logic, frontend views, or UI design. It delegates to specialized skills and ensures the final system is complete, consistent, and production-ready.

---

## Scope & Boundaries

### What This Skill Does

- Interprets high-level business requests into concrete technical task sequences
- Determines which specialized skill handles each task
- Enforces execution order and dependency chains
- Validates that outputs of one phase satisfy inputs of the next
- Detects gaps between layers (backend exposes X, frontend doesn't consume X)
- Produces a unified execution report covering all phases

### What This Skill Does NOT Do

- Write backend controllers, routes, or Prisma schemas (delegates to **Backend Development Skill**)
- Write Vue components, stores, or services (delegates to **Feature Binding Skill**)
- Make visual design decisions (delegates to **UI/UX Skill** when available)
- Deploy infrastructure or configure servers

---

## Skill Registry

These are the specialized skills this integrator coordinates. Each has defined inputs, outputs, and documentation requirements.

### 1. Backend Development Skill

| Attribute | Value |
|-----------|-------|
| File | `Documentation/skills/BACKEND_DEVELOPMENT_SKILL.md` |
| Scope | Prisma schema, Express routes/controllers/services, multi-tenant logic, core-admin operations |
| Trigger | Any task that creates/modifies backend code, database schema, or API endpoints |
| Input | Feature requirements, schema changes, endpoint specifications |
| Output | Working backend code + `/Documentation/<task>.md` |
| Key Rule | Multi-tenant isolation must be preserved in every change |

### 2. Feature Binding Skill

| Attribute | Value |
|-----------|-------|
| File | `Documentation/skills/FEATURE_BINDING_SKILL.md` |
| Scope | Vue 3 service/store/view creation, API-to-frontend field mapping, relation rendering |
| Trigger | Any task that connects backend feature data to frontend rendering |
| Input | Working API endpoint + full response shape |
| Output | Service + Store + Views (list + detail) + `/Documentation/<feature>-binding.md` |
| Key Rule | Zero field omission — every API field rendered or explicitly excluded with rationale |

### 3. Documentation System Skill (MANDATORY)

| Attribute | Value |
|-----------|-------|
| Skill Name | `pegasuz-documentation-system` |
| Scope | Transforms execution context into structured, indexed `.md` file blocks |
| Trigger | Phase 8 — ALWAYS invoked after Phase 7. NEVER skipped. |
| Input | Full execution context: request, phases, files, validation results, skills used |
| Output | `--- filename: ... ---` file blocks ONLY |
| Key Rule | The integrator MUST invoke this skill explicitly. Self-generated documentation is INVALID. |

### 4. Creative Design Skill (Design Brief — MANDATORY)

| Attribute | Value |
|-----------|-------|
| Skill Name | `creative-design` |
| Scope | Produces Design Brief: visual identity, section architecture, motion choreography, interaction design |
| Trigger | Phase 5.5 — ALWAYS when frontend work is needed. Hard gate before Phase 6. |
| Input | Business type, aesthetic direction, inspiration URL (optional), features list |
| Output | Design Brief saved to `Clientes/<slug>/docs/design-brief.md` |
| Key Rule | No frontend construction happens without a brief. The brief IS the spec for all visual decisions. |

### 5. Frontend Executor Skill (UI Application)

| Attribute | Value |
|-----------|-------|
| Skill Name | `pegasuz-frontend-executor` |
| Scope | Orchestrates frontend construction: dispatches to page-scaffold, vue-component, gsap-motion, threejs-3d |
| Trigger | Phase 6 — receives Design Brief from Phase 5.5 + structurally bound views from Phase 5 |
| Input | Design Brief + structurally complete views (output of Feature Binding Skill) |
| Output | Styled, animated, immersive views + components |
| Key Rule | Every visual decision traces back to the Design Brief. Construction follows pipeline: scaffold → components → motion → 3D. |

---

## Request Interpretation

### Input Classification

When receiving a high-level instruction, classify it into one of these operation types:

| Operation Type | Example | Skills Involved |
|---------------|---------|-----------------|
| **New Client** | "Create client lavaderoartesanal with blog and services" | Backend → Binding → UI |
| **Feature Activation** | "Enable properties for client X" | Backend (features API) → Binding |
| **Feature Extension** | "Add gallery support to projects" | Backend (schema/controller) → Binding (views) |
| **Full Binding** | "Connect blog feature end-to-end for argpiscinas" | Binding only (backend exists) |
| **Cross-Layer Fix** | "Properties show title but no images" | Binding (diagnose gap → fix views) |
| **Backend Only** | "Add pagination to testimonials endpoint" | Backend only |
| **Frontend Only** | "Add filter bar to properties list view" | Binding only |

### Decomposition Rules

1. **Read the request literally** — do not infer steps that weren't requested.
2. **Identify all layers touched** — backend, frontend, or both.
3. **Order by dependency** — backend must exist before frontend can bind to it.
4. **Never parallelize cross-layer steps** — backend must complete before binding starts.
5. **Identify verification points** — where does one phase's output become the next phase's input?

---

## Execution Phases

Every integrator execution follows this phase model. Phases are skipped ONLY if verified unnecessary (with documented rationale).

### Phase 0 — Request Analysis

**Goal:** Understand exactly what is being asked and decompose into tasks.

Actions:
1. Parse the high-level instruction.
2. Identify the operation type (from table above).
3. Identify the target client slug (if applicable).
4. List the features involved.
5. Determine which phases are needed.
6. Produce a task breakdown before any implementation begins.

Output: **Task Breakdown** — ordered list of steps with skill assignments.

### Phase 1 — Client Provisioning (If New Client)

**Skill:** Backend Development Skill
**Trigger:** Request involves a client that does not yet exist.

Actions:
1. Verify client does not already exist in `pegasuz_core.clients`.
2. Determine CMS contract to use (existing contract ID, or default).
3. Create client via core-admin provisioning flow:
   - `POST /api/core-admin/clients` with name, slug, adminEmail, adminPassword, contract_id.
   - This triggers: database creation, schema push, CMS initialization, admin user creation, upload directory creation.
4. Verify provisioning completed:
   - Client exists in `pegasuz_core.clients` with status ACTIVE.
   - Tenant database exists (`pegasuz_<slug>`).
   - Admin user can authenticate.
   - Upload directory exists (`uploads_<slug>/`).
   - SiteContent table populated with CMS keys.

**Checkpoint:** Client is registered, database is live, admin user exists.

### Phase 2 — Feature Configuration

**Skill:** Backend Development Skill
**Trigger:** Request specifies which features to enable/disable.

Actions:
1. Read current features: `GET /api/core-admin/clients/:slug/features`.
2. Determine delta — what needs to change from defaults.
3. Apply feature flags: `PUT /api/core-admin/clients/:slug/features`.
4. Verify features updated: re-read and confirm state matches request.

Feature flag reference (all default to `true` except `translations`):
```
menu, services, projects, collections, blog, properties,
content, analytics, categories, tags, media, messages,
settings, translations (default: false)
```

**Checkpoint:** Feature flags match the requested configuration.

### Phase 3 — Backend Verification / Extension

**Skill:** Backend Development Skill
**Trigger:** Request requires backend changes (new endpoints, schema changes, new features).

Actions:
1. Verify that all required endpoints exist for the requested features.
2. If endpoints exist — read controller code to confirm response shape.
3. If endpoints are missing or need modification — delegate to Backend Development Skill.
4. Document the exact API contract for each feature (endpoint, response shape, filters, pagination, relations, translations, media fields).

Standard feature endpoint inventory:

| Feature | List Endpoint | Detail Endpoint | Paginated | Filterable |
|---------|--------------|-----------------|-----------|------------|
| Properties | `GET /properties` | `GET /properties/:slug` | No | Yes (operationType, propertyType, city, price range) |
| Projects | `GET /projects` | `GET /projects/:slug` | Yes | Yes (featured, category) |
| Posts (Blog) | `GET /posts` | `GET /posts/slug/:slug` | Yes | Yes (category, tag, search) |
| Services | `GET /services` | `GET /services/:slug` | No | Yes (showOnHome) |
| Testimonials | `GET /testimonials` | — | Yes | Yes (featured) |
| Categories | `GET /categories` | `GET /categories/:slug` | No | No |
| Tags | `GET /tags` | `GET /tags/:slug` | No | No |
| Contacts | `POST /contacts` | — | — | — |
| SiteContent | `GET /site-contents` | — | No | No |

**Checkpoint:** Every requested feature has a working API endpoint with documented response shape.

### Phase 4 — Frontend Scaffolding Verification

**Skill:** Feature Binding Skill (preparation)
**Trigger:** Always (when frontend work is needed).

Actions:
1. Verify the target client frontend exists under `Clientes/<slug>/`.
2. Verify mandatory architecture files exist:
   - `src/config/api.js` or `src/services/api.js` — single axios instance with `x-client` header + **Media V3 `resolveImageUrl()` export**
   - `src/stores/content.js` — CMS bootstrap store
   - `src/main.js` — bootstraps CMS before mount
   - `src/router/index.js` — route definitions
   - `.env` or `.env.local` — `VITE_API_URL` **AND** `VITE_CLIENT_SLUG`
3. If any mandatory files are missing — create them following PEGASUZ_FRONTEND_IMPLEMENTATION_SPEC patterns.
4. Verify `.env` values:
   - `VITE_API_URL` points to correct API
   - `VITE_CLIENT_SLUG` matches exact client slug (**MANDATORY — required by `resolveImageUrl()` for tenant-scoped media**)
5. **Verify `resolveImageUrl()` is the V3 canonical implementation** (NOT a simple `API_URL + path` prepend). It MUST handle: absolute URLs, V3 canonical paths, legacy `/media/` paths, legacy `/uploads/` paths, and bare relative paths. See Feature Binding Skill R3 for the exact implementation.

**Checkpoint:** Frontend project structure is valid, API-connected, and `resolveImageUrl()` V3 is present.

### Phase 5 — Feature Binding

**Skill:** Feature Binding Skill
**Trigger:** For each feature that needs frontend integration.

Actions — for EACH feature:
1. Read the backend controller to capture exact response shape.
2. Create/verify service file: `src/services/<feature>Service.js`.
3. Create/verify Pinia store: `src/stores/<feature>.js`.
4. Create/verify list view: `src/views/<Feature>View.vue`.
5. Create/verify detail view: `src/views/<Feature>DetailView.vue`.
6. Register routes in `src/router/index.js`.
7. Complete the Data Mapping Table (every field accounted for).
8. Complete the Validation Checklist.

**Execution order for multiple features:** Bind features in this order to resolve dependencies correctly:
1. Categories and Tags (referenced by Blog)
2. Services (standalone)
3. Projects (standalone)
4. Properties (standalone)
5. Blog/Posts (depends on Categories + Tags)
6. Testimonials (standalone)
7. Contact form (standalone, write-only)

**Checkpoint per feature:** Validation Checklist from Feature Binding Skill is 100% complete.

### Phase 5.5 — Design Brief (MANDATORY for Frontend Work)

**Skill:** `creative-design`
**Trigger:** Always — when ANY frontend work is included in the operation. This is a HARD GATE.

Actions:
1. Check if a Design Brief already exists for this client at `Clientes/<slug>/docs/design-brief.md` or `docs/design-brief.md`.
2. If brief EXISTS → read it and extract: visual identity, section architecture, motion choreography, interaction design.
3. If brief DOES NOT EXIST → invoke `creative-design` skill with:
   - Client business type / industry
   - Aesthetic direction (from user instruction, or inferred from business type)
   - URL of inspiration (if user provided one)
   - Features being bound (from Phase 5)
4. `creative-design` produces a Design Brief and saves it to `Clientes/<slug>/docs/design-brief.md`.
5. Verify brief contains ALL required sections: Visual Identity, Section Architecture, Motion Choreography, Interaction Design.

**Checkpoint:** Design Brief exists, is complete, and has been read. Downstream Phase 6 receives the brief as input.

**This phase is NOT optional.** Even if the user says "just bind the features" — if there's a frontend, the UI needs a brief. A feature-bound view without a design brief produces generic, unstyled output.

### Phase 6 — UI Application

**Skill:** `pegasuz-frontend-executor`
**Trigger:** Always when frontend work is included. Receives Design Brief from Phase 5.5.

Actions:
1. Verify all views from Phase 5 are structurally complete (all fields rendered).
2. `pegasuz-frontend-executor` receives the Design Brief from Phase 5.5 as input.
3. Executor dispatches to construction skills in order:
   - `page-scaffold` → creates narrative page structure per brief's section architecture
   - `vue-component` → builds components per brief's tokens and interaction patterns
   - `gsap-motion` → implements animation per brief's motion choreography
   - `threejs-3d` → adds 3D/WebGL per brief's technique mapping (if applicable)
4. Ensure responsive behavior per brief's responsive strategy.
5. Verify visual consistency across all bound views.

**Checkpoint:** Views are visually consistent, match the Design Brief, and follow the construction pipeline order.

### Phase 7 — Cross-Layer Validation

**Skill:** Integrator (self-executed)
**Trigger:** Always — this is the integrator's primary value.

This phase verifies that the full stack works as a unit.

#### 7.1 — API ↔ Frontend Field Audit

For each bound feature, verify:

```
For every field F in API response:
  - Is F consumed by the service layer? → YES / NO
  - Is F stored in the Pinia store? → YES / NO
  - Is F rendered in the list view? → YES / EXCLUDED (reason) / MISSING
  - Is F rendered in the detail view? → YES / EXCLUDED (reason) / MISSING
  
If any field is MISSING → binding is incomplete → return to Phase 5.
```

#### 7.2 — Route Integrity

Verify:
- Every list view has a registered route.
- Every detail view has a registered route with `:slug` parameter.
- List view links to detail view using `router-link :to="{ name: 'x-detail', params: { slug } }"`.
- Navigation from detail back to list works.

#### 7.3 — Multi-Tenant Safety

Verify:
- `x-client` header is sent in every API call.
- No tenant slug hardcoded in view or service code.
- `VITE_CLIENT_SLUG` is the only source of tenant identity.
- No cross-tenant data leakage paths exist.

#### 7.4 — Feature Flag Coherence

Verify:
- Features enabled in backend match features bound in frontend.
- No frontend routes exist for features that are disabled.
- Router guards or conditional rendering respect feature flags (if implemented).

#### 7.5 — Media V3 Pipeline

Verify:
- `resolveImageUrl()` exists in `src/config/api.js` or `src/services/api.js` and uses the **V3 canonical implementation** (NOT a simple `API_URL + path` prepend).
- `resolveImageUrl()` handles ALL 5 path formats: absolute URLs, V3 canonical, legacy `/media/`, legacy `/uploads/`, bare relative paths.
- `.env` contains `VITE_CLIENT_SLUG` (required by `resolveImageUrl()` for `?tenant=` param).
- All `featuredImage` fields use `resolveImageUrl()`.
- All `images` arrays render as galleries (not just first image).
- Image URLs resolve to correct tenant media path (e.g., `/media/posts/slug/img.webp?tenant=<slug>`).
- Null images have fallback behavior.
- **NO simplified resolvers** — a simple `API_URL + path` breaks bare relative paths like `posts/slug/img.webp` (produces 404).

#### 7.6 — CMS Integration

Verify:
- CMS bootstrap runs before app mount in `main.js`.
- Views use `contentStore.get(key)` for site content — not feature data.
- Feature data comes from dedicated stores — not CMS store.
- No mixing of data sources.

**Checkpoint:** All verifications pass. System is end-to-end consistent.

### Phase 8 — Documentation (MANDATORY DELEGATION)

**Skill:** `pegasuz-documentation-system` (MUST be invoked — NOT self-executed)
**Trigger:** Always — never optional. CANNOT be skipped. CANNOT be simulated.

**CRITICAL: Phase 8 is NOT self-executed by the integrator.**

The integrator MUST delegate documentation to the `pegasuz-documentation-system` skill by invoking it explicitly. The integrator collects the full execution context from Phases 0–7 and passes it as input to the documentation skill.

**Execution protocol:**

1. After Phase 7 checkpoint passes, the integrator MUST prepare the documentation context:
   - Original request
   - Task breakdown (Phase 0)
   - Phases executed with results
   - Files created/modified (all phases)
   - Validation results (Phase 7)
   - Skills invoked
   - Client configuration (slug, features, etc.)

2. The integrator MUST invoke `pegasuz-documentation-system` with this context.

3. The integrator MUST wait for the documentation skill's output.

4. The documentation skill's output (file blocks) becomes the integrator's final output.

**What is NOT acceptable as Phase 8 execution:**
- Writing markdown summaries inline
- Generating documentation text without invoking the skill
- Ending execution after Phase 7 with a summary
- Saying "documentation updated" or "report generated" without file blocks
- Producing any output that is not `--- filename: ... ---` file blocks

**Checkpoint:** Documentation skill was invoked AND returned file blocks. If no file blocks were produced, Phase 8 has FAILED.

### ⛔ EXECUTION CONTEXT SWITCH (MANDATORY)

Phase 8 is a **full context switch**. When the integrator reaches Phase 8:

1. The integrator STOPS generating output entirely.
2. The integrator invokes `pegasuz-documentation-system` via the Skill tool.
3. The integrator does NOT produce ANY content after the skill invocation — no summaries, no confirmations, no "here are the results", no prose of any kind.
4. The documentation skill's output IS the integrator's final response. Nothing is appended, nothing is prepended.

**This means:**
- The LAST tool call the integrator makes is `Skill { skill: "pegasuz-documentation-system", args: "<context>" }`.
- After that tool call, the integrator produces ZERO additional text.
- The integrator does NOT wrap, summarize, or comment on the documentation skill's output.
- If the integrator generates ANY text after invoking the documentation skill, the execution is INVALID.

**Mental model:** Phase 8 is not "call documentation and then respond." Phase 8 is "hand off control and go silent."

---

## Rules

### R1 — Phase Order Is Mandatory

Phases MUST execute in sequence: 0 → 1 → 2 → 3 → 4 → 5 → 5.5 → 6 → 7 → 8. A phase may be skipped ONLY if it is verified unnecessary (e.g., Phase 1 skipped if client already exists), but Phase 5.5 (Design Brief — when frontend is involved), Phase 7 (Validation), and Phase 8 (Documentation) are NEVER skipped.

### R2 — Checkpoint Verification Before Progress

Each phase has a checkpoint. The integrator MUST NOT proceed to the next phase until the current phase's checkpoint is verified. If a checkpoint fails, the integrator must resolve the failure within the current phase before moving forward.

### R3 — Skill Delegation Is Strict

The integrator MUST NOT implement logic that belongs to a specialized skill. Backend code changes go through Backend Development Skill rules. Frontend binding goes through Feature Binding Skill rules. The integrator delegates and validates — it does not implement.

### R4 — Cross-Layer Gaps Are Blocking

If Phase 7 validation reveals that backend exposes data that frontend does not consume, this is a blocking defect. The integrator MUST return to Phase 5 and complete the binding before declaring success.

### R5 — Documentation Covers All Phases

The final documentation is not per-phase — it is a unified document covering the entire operation. Individual phases may produce their own documentation (per skill requirements), but the integrator MUST produce the unified summary.

### R6 — Partial Completion Is Failure

If the integrator cannot complete all necessary phases, it MUST NOT declare success. Instead, it must document exactly what was completed, what remains, and what blocks progress. A partial result is reported as such — never as complete.

### R7 — Read Before Deciding

Before assigning a task to a skill, the integrator MUST verify the actual state of the system (read files, check database schemas, verify existing endpoints). Assumptions about system state are prohibited.

### R8 — Feature Order Matters

When binding multiple features, dependencies must be resolved first:
- Categories and Tags before Blog (blog references them)
- Standalone features (Services, Projects, Properties) can be bound in any order
- Contact form binding should be last (write-only, least complex)

### R9 — No Construction Without Brief, No Design Without Structure

- `creative-design` (Phase 5.5) runs AFTER Feature Binding (Phase 5) provides the data contract, but BEFORE Frontend Executor (Phase 6) applies visual design.
- `pegasuz-frontend-executor` (Phase 6) is NEVER invoked before both Feature Binding AND Design Brief are complete.
- Construction skills receive the Design Brief as input — they implement it, not invent it.

### R10 — Single Source of Truth Per Layer

- Backend truth: Prisma schema + controller response
- Frontend truth: Store state + rendered fields
- Feature truth: `client_features` table in core database
- CMS truth: `site_contents` table in tenant database
- Configuration truth: `.env` file in frontend project

The integrator validates consistency across these truth sources.

### R11 — Documentation Is a Context Switch, Not a Call (HARD GATE)

- The integrator MUST NOT end execution after Phase 7. Phase 7 completion triggers Phase 8 — there is no exit path between them.
- Phase 8 MUST invoke `pegasuz-documentation-system` as a separate skill via the Skill tool. The integrator MUST NOT generate documentation itself.
- **Phase 8 is a CONTEXT SWITCH: the integrator stops producing output and delegates control entirely to the documentation skill. The integrator generates ZERO content after the Skill invocation.**
- The documentation skill's output IS the integrator's final response. The integrator does not append, prepend, wrap, or comment on it.
- If `pegasuz-documentation-system` is not available or fails, the integrator MUST report the failure explicitly — it MUST NOT fall back to self-generated documentation.
- Execution is INVALID without documentation file blocks. An integrator run that produces code changes but no documentation file blocks is a failed run.

**Termination guard:**
```
IF Phase 7 completed
AND Phase 8 NOT executed (documentation skill not invoked)
→ EXECUTION IS INVALID — do not end, invoke documentation skill

IF Phase 8 executed
AND integrator generates ANY text after skill invocation
→ EXECUTION IS INVALID — context switch violated

IF Phase 8 executed
AND output is NOT file blocks (--- filename: ... ---)
→ EXECUTION IS INVALID — documentation skill did not produce expected output
```

### R12 — Documentation Skill Contract

When invoking `pegasuz-documentation-system`, the integrator MUST pass:

```
{
  request: <original user instruction>,
  client: <slug>,
  operation: <operation type from Phase 0>,
  phases_executed: [<list of phase numbers>],
  skills_invoked: [<list of skill names>],
  files_created: [<list of files created>],
  files_modified: [<list of files modified>],
  validation_results: <Phase 7 output>,
  features_bound: [<list of features with field counts>],
  known_limitations: [<anything not implemented>],
  next_steps: [<remaining work outside scope>]
}
```

This context is passed as the invocation argument to the skill. The documentation skill returns file blocks — those file blocks are the integrator's final output.

---

## Task Decomposition Reference

### Operation: New Client End-to-End

Input example: *"Create client lavaderoartesanal. Enable blog, services, properties. Use agency contract."*

```
Phase 0 — Request Analysis
  → Client: lavaderoartesanal
  → Features: blog, services, properties
  → Contract: agency (resolve contract ID)
  → Phases needed: 1, 2, 3, 4, 5, 7, 8

Phase 1 — Client Provisioning [Backend Skill]
  Task 1.1: POST /api/core-admin/clients
    { name: "Lavadero Artesanal", slug: "lavaderoartesanal",
      adminEmail: "admin@lavaderoartesanal.com", adminPassword: <secure>,
      contract_id: <agency_contract_id> }
  Task 1.2: Verify client in core.clients
  Task 1.3: Verify tenant DB pegasuz_lavaderoartesanal exists
  Task 1.4: Verify admin user can authenticate
  Task 1.5: Verify uploads_lavaderoartesanal/ directory exists

Phase 2 — Feature Configuration [Backend Skill]
  Task 2.1: PUT /api/core-admin/clients/lavaderoartesanal/features
    { blog: true, services: true, properties: true,
      menu: false, projects: false, collections: false,
      analytics: false, translations: false }
  Task 2.2: Verify features saved correctly

Phase 3 — Backend Verification [Backend Skill]
  Task 3.1: Verify GET /posts endpoint responds (blog)
  Task 3.2: Verify GET /services endpoint responds
  Task 3.3: Verify GET /properties endpoint responds
  Task 3.4: Document response shapes for all three

Phase 4 — Frontend Scaffolding [Binding Skill]
  Task 4.1: Verify Clientes/lavaderoartesanal/ exists
  Task 4.2: Verify/create src/config/api.js
  Task 4.3: Verify/create src/stores/content.js
  Task 4.4: Verify/create .env with VITE_CLIENT_SLUG=lavaderoartesanal

Phase 5 — Feature Binding [Binding Skill]
  Task 5.1: Bind categories (dependency for blog)
  Task 5.2: Bind tags (dependency for blog)
  Task 5.3: Bind services (service + store + views)
  Task 5.4: Bind properties (service + store + views)
  Task 5.5: Bind blog (service + store + views, uses categories + tags)
  Task 5.6: Bind contact form (submission component)

Phase 7 — Cross-Layer Validation [Integrator]
  Task 7.1: Field audit — all API fields mapped
  Task 7.2: Route integrity — all views routable
  Task 7.3: Tenant safety — x-client sent correctly
  Task 7.4: Feature coherence — enabled features match bindings
  Task 7.5: Media pipeline — images resolve correctly
  Task 7.6: CMS integration — bootstrap works, data sources separated

Phase 8 — Documentation [Integrator]
  Task 8.1: Generate unified execution report
```

### Operation: Activate Feature for Existing Client

Input example: *"Enable properties for argpiscinas"*

```
Phase 0 — Request Analysis
  → Client: argpiscinas (exists)
  → Feature: properties
  → Phases needed: 2, 3, 5, 7, 8

Phase 2 — Feature Configuration [Backend Skill]
  Task 2.1: Read current features for argpiscinas
  Task 2.2: Enable properties if not already enabled

Phase 3 — Backend Verification [Backend Skill]
  Task 3.1: Verify GET /properties responds with x-client: argpiscinas
  Task 3.2: Document response shape

Phase 5 — Feature Binding [Binding Skill]
  Task 5.1: Create/verify propertiesService.js
  Task 5.2: Create/verify properties store
  Task 5.3: Create/verify PropertiesView.vue
  Task 5.4: Create/verify PropertyDetailView.vue
  Task 5.5: Register routes

Phase 7 — Validation [Integrator]
  Task 7.1-7.6: Full validation

Phase 8 — Documentation [Integrator]
  Task 8.1: Generate report
```

### Operation: Fix Broken Feature Binding

Input example: *"Properties shows title and price but no gallery"*

```
Phase 0 — Request Analysis
  → Client: (identify from context)
  → Issue: partial binding — images array not rendered
  → Phases needed: 3 (read-only), 5 (fix), 7, 8

Phase 3 — Backend Verification [Read-Only]
  Task 3.1: Read property controller — confirm 'images' field exists in response
  Task 3.2: Document full response shape

Phase 5 — Feature Binding [Binding Skill]
  Task 5.1: Read current PropertiesView.vue and PropertyDetailView.vue
  Task 5.2: Identify missing field bindings (images array)
  Task 5.3: Add gallery rendering to detail view
  Task 5.4: Complete field mapping table
  Task 5.5: Verify all other fields are also rendered

Phase 7 — Validation [Integrator]
  Task 7.1: Complete field audit for properties
  Task 7.5: Verify image URLs resolve correctly

Phase 8 — Documentation [Integrator]
  Task 8.1: Generate report (focus: gap analysis → fix applied)
```

---

## Validation Protocol

### Cross-Layer Consistency Matrix

For each bound feature, produce this matrix:

```
Feature: <name>
Client: <slug>
Backend Endpoint: <url>

| Field | API Response | Service | Store | List View | Detail View | Status |
|-------|-------------|---------|-------|-----------|-------------|--------|
| title | string | ✓ pass | ✓ pass | ✓ card | ✓ hero | OK |
| images | string[] | ✓ pass | ✓ pass | — excl. | ✓ gallery | OK |
| ... | ... | ... | ... | ... | ... | ... |

Fields OK: X / Y
Fields MISSING: Z (list them)
Relations OK: A / B
Media OK: C / D
```

**Status values:**
- **OK** — Field is consumed and rendered (or explicitly excluded with reason)
- **MISSING** — Field exists in API but not consumed → blocking defect
- **EXCL.** — Intentionally excluded with documented reason → acceptable

### Defect Classification

| Severity | Description | Action |
|----------|-------------|--------|
| **BLOCKING** | Data exists in API but not rendered and not excluded | Return to Phase 5, fix, re-validate |
| **WARNING** | Non-critical field omitted without documentation | Add exclusion rationale, continue |
| **INFO** | Cosmetic or preference issue | Document, do not block |

---

## Constraints

### Hard Constraints

1. Phase 7 (Validation) and Phase 8 (Documentation) are NEVER skipped.
2. Cross-layer gaps (API field not consumed) are BLOCKING — task is not complete until resolved.
3. Skill delegation is strict — integrator does not write backend or frontend code.
4. Each skill's own rules apply in full within its phase.
5. Feature binding order must respect dependencies.
6. If a step requires reading files, ALWAYS read actual code before deciding. Never assume structure.
7. Phase 8 MUST invoke `pegasuz-documentation-system` as a separate skill — self-generated documentation is INVALID.
8. Execution CANNOT end after Phase 7 — Phase 8 is a hard gate that MUST execute before any response is returned.
9. The integrator's final output MUST contain file blocks (`--- filename: ... ---`) from the documentation skill. Any other final output is an execution failure.

### Forbidden Actions

- Declaring a task complete when validation reveals MISSING fields.
- Skipping feature binding for enabled features.
- Applying UI/design before structural binding is verified.
- Creating frontend views without first verifying the API endpoint exists and responds.
- Creating backend endpoints without verifying multi-tenant safety.
- Binding features to a client that doesn't exist in core database.
- **Ending execution after Phase 7 without invoking Phase 8.**
- **Generating documentation inline instead of invoking `pegasuz-documentation-system`.**
- **Returning summaries, explanations, or "done" messages as final output instead of file blocks.**
- **Simulating documentation output (writing markdown in response instead of delegating to skill).**

---

## Output Format

Every integrator execution produces at minimum:

### Task Breakdown (Phase 0 Output)

```markdown
## Task Breakdown

| # | Task | Phase | Skill | Status |
|---|------|-------|-------|--------|
| 1 | Create client | Phase 1 | Backend | ✓ |
| 2 | Configure features | Phase 2 | Backend | ✓ |
| ... | ... | ... | ... | ... |
```

### Steps Executed (Phase-by-Phase Log)

```markdown
## Execution Log

### Phase 1 — Client Provisioning
- Action: POST /api/core-admin/clients
- Result: Client created, DB pegasuz_<slug> live
- Checkpoint: PASSED

### Phase 5 — Feature Binding: Blog
-Binding MUST follow existing frontend patterns.
Do not introduce new architecture unless necessary.
- Action: Created postsService.js, posts store, BlogView.vue, BlogPostView.vue
- Fields mapped: 18/18
- Relations bound: author, categories, tags
- Checkpoint: PASSED
```

### Skills Used

```markdown
## Skills Invoked

| Skill | Phases | Tasks |
|-------|--------|-------|
| Backend Development | 1, 2, 3 | Client creation, feature config, endpoint verification |
| Feature Binding | 4, 5 | Scaffolding, service/store/view creation |
| Integrator (self) | 0, 7, 8 | Analysis, validation, documentation |
```

### Validation Result

```markdown
## Validation Summary

| Check | Result |
|-------|--------|
| Field coverage | 52/54 OK, 2 excluded with reason |
| Route integrity | 6/6 routes registered |
| Tenant safety | PASSED |
| Feature coherence | 3/3 features bound |
| Media pipeline | PASSED |
| CMS integration | PASSED |

Overall: PASSED
```

---

## Documentation Requirements

**Every integrator execution MUST produce documentation via `pegasuz-documentation-system` skill invocation.**

### How Documentation Is Produced

1. The integrator does NOT write documentation itself.
2. The integrator collects execution context from all completed phases.
3. The integrator invokes `pegasuz-documentation-system` with the full context.
4. The documentation skill returns `--- filename: ... ---` file blocks.
5. Those file blocks are the integrator's final output.

### Context to Pass to Documentation Skill

The integrator MUST pass this execution context when invoking `pegasuz-documentation-system`:

```
- Request: original instruction as received
- Client: slug, database name, features enabled
- Operation type: from Phase 0 classification
- Phases executed: list with results and checkpoints
- Skills invoked: which skills handled which phases
- Files created/modified: complete list with actions
- Validation results: Phase 7 matrix and defect list
- Features bound: per-feature field counts, relations, media
- Known limitations: anything not implemented with rationale
- Next steps: remaining work outside scope
```

### File Location Convention

The documentation skill determines file paths, but the integrator suggests:

```
/Documentation/<client>-<operation>-integration.md
```

Examples: `lavaderoartesanal-onboarding-integration.md`, `argpiscinas-properties-activation-integration.md`

### No Exceptions

Documentation is generated for every invocation — even if the task was to fix a single missing field. The documentation skill handles minimal vs full report selection based on context.

### What Is NOT Documentation

- Summaries written inline by the integrator → NOT documentation
- "Documentation updated" messages → NOT documentation
- Markdown blocks in the response body → NOT documentation
- Only `--- filename: ... ---` file blocks from `pegasuz-documentation-system` count as valid documentation output
