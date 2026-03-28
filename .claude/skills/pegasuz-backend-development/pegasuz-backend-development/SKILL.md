---
name: pegasuz-backend-development
description: 'Backend development tasks for Pegasuz Core multi-tenant SaaS. Ensures tenant isolation, architectural patterns, and production-grade code with Prisma ORM, Express, and MySQL. Use when creating or modifying backend controllers, routes, schemas, or services.'
---

# Pegasuz Core — Backend Development Skill

## Skill Name

**pegasuz-backend-development**

## Purpose

Define a strict, reusable behavior system for AI agents performing backend development tasks within Pegasuz Core — a multi-tenant SaaS platform built on Node.js, Express, Prisma ORM, and MySQL. This skill ensures that every backend modification preserves tenant isolation, follows established architectural patterns, and produces production-grade code with mandatory documentation.

---

## System Context

### Platform Overview

Pegasuz Core is a centralized backend serving multiple isolated tenants. Each tenant has its own MySQL database. A single core database (`pegasuz_core`) stores platform-level metadata: client registry, feature flags, CMS contracts, and superadmin credentials.

### Tech Stack (Fixed)

| Layer            | Technology                  |
|------------------|-----------------------------|
| Runtime          | Node.js                     |
| Framework        | Express                     |
| ORM              | Prisma                      |
| Database         | MySQL (one DB per tenant)   |
| Process Manager  | PM2                         |
| Auth             | JWT (jsonwebtoken)          |
| File Upload      | Multer                      |
| Image Processing | Sharp (via imageOptimizer)  |
| Validation       | express-validator           |

No additional dependencies may be introduced unless the user explicitly requests and justifies them.

### Multi-Tenant Resolution Flow

```
HTTP Request (header: x-client)
  → clientResolver middleware
  → Query pegasuz_core.clients by slug
  → prismaManager.getPrisma(database_name)
  → AsyncLocalStorage context (runWithPrisma)
  → req.client = { id, name, slug, database_name }
  → req.prisma = tenant PrismaClient instance
  → Controller executes against isolated tenant DB
```

**Critical files:**

| File | Role |
|------|------|
| `src/middlewares/clientResolver.js` | Reads `x-client` header, resolves tenant, attaches `req.client` + `req.prisma` |
| `src/services/prismaManager.js` | Caches PrismaClient instances per `database_name`, constructs connection URL |
| `src/services/prismaContext.js` | AsyncLocalStorage: `runWithPrisma()` / `getContextPrisma()` |
| `src/lib/prisma.js` | Context-aware Proxy — auto-selects tenant Prisma or fallback default |

### Database Architecture

**Core database (`pegasuz_core`):**
- `clients` — tenant registry (id, name, slug, database_name, status)
- `superadmins` — platform-level admin credentials
- `client_features` — JSON feature flags per client
- `cms_contracts` — CMS field schema definitions
- `client_translation_settings` — locale configuration per client

**Tenant databases (`pegasuz_<name>`):**
- Identical schema per tenant (defined in `prisma/schema.prisma`)
- Models: User, Post, Category, Tag, Project, Service, Property, Contact, SiteContent, Integration, Testimonial, Locale, Menu*, etc.
- All entities use base language fields (es) + translation fields (en, de)
- Timestamps mapped to snake_case columns via `@map()`

### Feature System

Each client can have different features enabled/disabled:

```
menu, services, projects, collections, blog, properties,
content, analytics, categories, tags, media, messages, settings, translations
```

Features are stored in `client_features` table as JSON. Defaults: all enabled. Features are returned on `/api/auth/login` and `/api/auth/me` in the user response object. Frontend uses them for sidebar filtering and route guards.

### File/Module Organization

```
backend/
├── config/              # cmsKeys.js, cmsDefaultValues.js, google-credentials
├── modules/             # Self-contained modules (core-admin, analytics, search-console)
│   ├── core-admin/      # SuperAdmin client management, provisioning
│   ├── analytics/       # Google Analytics integration
│   └── search-console/  # Google Search Console integration
├── prisma/              # schema.prisma, migrations, seeds
├── scripts/             # One-off maintenance/migration scripts
├── src/
│   ├── app.js           # Express bootstrap, middleware chain, route mounting
│   ├── controllers/     # Route handlers (named exports per action)
│   ├── routes/          # Express routers (single default export)
│   ├── services/        # Business logic, prismaManager, prismaContext
│   ├── middlewares/     # clientResolver, auth, validation, rejectDisabled
│   ├── lib/             # Shared utilities (prisma proxy, uploadPath, imageOptimizer)
│   ├── constants/       # clientFeatures, enums
│   └── utils/           # Helper functions
└── uploads_<slug>/      # Tenant-isolated file storage
```

### Media System V3 (Centralized Multi-Tenant)

**Canonical path format:**
```
/media/{tenant}/{feature}/{entity}/{file}
```

**Legacy formats (read-only — NEVER generate):**
```
/media/{feature}/{entity}/{file}?tenant={client}   (legacy query param)
/uploads/...                                        (legacy DB data)
/uploads_<slug>/...                                 (legacy per-tenant)
```

**Core utilities (MANDATORY — only approved way to handle media paths):**

| Function | Location | Purpose |
|----------|----------|---------|
| `buildMediaPath(relativePath, clientSlug)` | `src/lib/mediaPath.js` | Generate canonical `/media/{tenant}/...` path from relative storage path |
| `extractRelativePath(publicPath)` | `src/lib/mediaPath.js` | Parse any public media URL (V3 or legacy) back to relative storage path |

**Rules:**
- ALL media paths returned by the API MUST be generated using `buildMediaPath(relativePath, clientSlug)`
- ALL inbound media paths MUST be parsed using `extractRelativePath(publicPath)`
- `clientSlug` MUST be passed explicitly — NEVER inferred from headers, request, or context
- Legacy paths (`/uploads/...`, `/posts/...`) MUST be supported for reading (via `extractRelativePath`) but NEVER generated
- Physical storage paths are internal — the API ONLY exposes logical `/media/...` paths

**PROHIBITED (any occurrence = invalid implementation):**
- Hardcoding `/uploads/...` in path construction
- Hardcoding `/posts/...` or any entity-prefixed path
- String concatenation to build media paths (e.g., `` `/media/${slug}/...` ``)
- Inferring tenant from `req.client`, `req.headers`, or middleware context for path building — always pass `clientSlug` explicitly

---

## Rules

### R1 — Tenant Isolation Is Inviolable

- NEVER hardcode database names, connection strings, or tenant slugs in business logic.
- ALWAYS access tenant data through `req.prisma` or `require('../lib/prisma')` (the context-aware proxy).
- NEVER query one tenant's database from another tenant's context.
- NEVER share or leak data between tenants (cache keys, file paths, config objects must be tenant-scoped).

### R2 — Dynamic Prisma Connection Only

- ALL database access MUST go through `prismaManager.getPrisma()` or the context proxy.
- NEVER instantiate `new PrismaClient()` directly in controllers or services.
- NEVER import Prisma from `@prisma/client` directly for tenant operations.
- For core database operations, use the dedicated `corePrisma` instance.

### R3 — Follow Established Patterns Exactly

- **Controllers**: Named exports per action (`getX`, `createX`, `updateX`, `deleteX`). Access DB via `const prisma = require('../lib/prisma')`.
- **Routes**: Single default router export. Mount with `app.use('/api/<resource>', clientResolver, resourceRoutes)`.
- **Services**: `module.exports = { fn1, fn2 }` object pattern.
- **Middleware**: Single default function export.
- **Validation**: `express-validator` with `body()` / `param()` chains + shared `validate` middleware.
- **Auth**: `authenticate` → `authorize(...roles)` middleware chain. Roles: `ADMIN`, `EDITOR`.

### R4 — No Dependency Creep

- NEVER add new npm packages without explicit user request and justification.
- ALWAYS check if the needed functionality exists in Node.js core, Express, Prisma, or existing project utilities first.
- If a new dependency is truly needed, document the rationale in the task documentation.

### R5 — Respect Feature Architecture

- NEVER assume a feature/module is always present for every tenant.
- When implementing logic tied to a feature (e.g., properties, blog), consider that the feature may be disabled.
- Backend endpoints should function correctly regardless — feature toggling is primarily a frontend concern, but backend must not crash if related data is absent.

### R6 — Schema Changes Require Full Awareness

- Prisma schema changes affect ALL tenant databases.
- ALWAYS consider migration impact across every tenant.
- NEVER add fields that break existing tenants.
- Use optional fields (`?`) or provide defaults for new columns.
- Document schema changes explicitly in task documentation.

### R7 — Naming Conventions Are Non-Negotiable

| Context | Convention | Example |
|---------|------------|---------|
| Routes/URLs | kebab-case | `/api/site-contents` |
| DB tables | snake_case | `site_contents` |
| DB columns | snake_case (via `@map()`) | `created_at` |
| Env vars | UPPER_SNAKE_CASE | `JWT_SECRET` |
| Functions | camelCase | `getPosts` |
| Files | camelCase or kebab-case | `post.controller.js`, `prismaManager.js` |

### R8 — Error Handling

- Controllers MUST catch errors and return structured JSON: `res.status(code).json({ error: message })`.
- NEVER let unhandled exceptions crash the process.
- Use appropriate HTTP status codes: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 409 (conflict), 500 (server error).
- Log errors with tenant context for observability.

### R9 — Security Boundaries

- Validate ALL user input at the controller/middleware boundary.
- Sanitize file paths to prevent directory traversal.
- Use parameterized queries (Prisma handles this by default — NEVER use raw SQL with string interpolation).
- Auth middleware MUST be applied to protected routes — never rely on frontend-only protection.
- NEVER expose internal errors, stack traces, or database structure to API consumers.

### R10 — Translation Pattern

- Base language is Spanish (es) — stored in primary fields (`title`, `content`, `slug`).
- Translations use suffixed fields: `titleEn`, `contentEn`, `slugEn`, `titleDe`, `contentDe`, `slugDe`.
- When adding translatable entities, ALWAYS include the full set of translation fields.

### R11 — Media Path Generation (V3)

- ALL media paths MUST be generated using `buildMediaPath(relativePath, clientSlug)`.
- ALL inbound media paths MUST be parsed using `extractRelativePath(publicPath)`.
- `clientSlug` MUST always be passed explicitly as a function argument — NEVER inferred from request context, headers, or middleware.
- Legacy path formats (`/uploads/...`, `/media/...?tenant=`) MUST be accepted for reading via `extractRelativePath()` but NEVER generated in new code.
- Any manual string construction of media paths (concatenation, template literals, hardcoded prefixes) is a **blocking violation**.
- When storing media references in the database, store the relative path only — `buildMediaPath()` is applied at response time.

**Violation examples (PROHIBITED):**
```js
// WRONG — manual path construction
const path = `/media/${slug}/posts/${id}/image.jpg`
const path = `/uploads/${file}`
const path = `/posts/${id}/image.jpg`

// CORRECT — use utility
const path = buildMediaPath(relativePath, clientSlug)
```

---

## Execution Workflow

When performing any backend task, follow this ordered sequence:

### Step 1 — Understand Scope

1. Identify what is being built or modified (endpoint, service, model, script, module).
2. Determine which files will be affected.
3. Verify if the change is tenant-scoped or core-scoped.
4. Check if it relates to an existing feature flag.

### Step 2 — Read Before Writing

1. Read ALL files that will be modified before making any changes.
2. Read related files to understand existing patterns (controllers, routes, services in the same domain).
3. Check `prisma/schema.prisma` if the task involves data models.
4. Check `config/cmsKeys.js` if the task involves CMS content fields.
5. Check `src/app.js` if new routes need to be mounted.

### Step 3 — Schema First (If Applicable)

1. Add or modify models in `prisma/schema.prisma`.
2. Use optional fields or defaults for new columns.
3. Run `npx prisma db push` or generate migration as appropriate.
4. Verify schema changes do not break existing tenant databases.

### Step 4 — Implement Bottom-Up

1. **Service layer** — Business logic functions.
2. **Controller layer** — Request handlers calling services.
3. **Validation** — Input validation middleware.
4. **Routes** — Express router connecting HTTP verbs to controllers + middleware.
5. **Mount** — Register routes in `src/app.js` with `clientResolver`.

### Step 5 — Verify Tenant Safety

Before considering the implementation complete, verify:

- [ ] All DB access uses `req.prisma` or the context-aware proxy.
- [ ] No hardcoded database names or tenant slugs.
- [ ] Cache keys (if any) include tenant identifier.
- [ ] Media paths (if any) use `buildMediaPath(relativePath, clientSlug)` — NEVER manual construction.
- [ ] Inbound media paths (if any) parsed with `extractRelativePath(publicPath)`.
- [ ] No hardcoded `/uploads/`, `/posts/`, or any legacy path format in new code.
- [ ] `clientSlug` passed explicitly to media functions — never inferred from request.
- [ ] New endpoints are mounted with `clientResolver` middleware.
- [ ] Auth middleware is applied to protected endpoints.

### Step 6 — Test Mentally

Walk through the request lifecycle:

1. Request arrives with `x-client: <slug>`.
2. `clientResolver` resolves tenant → sets `req.client` + `req.prisma`.
3. Auth middleware validates JWT (if protected).
4. Validation middleware checks input.
5. Controller calls service → service uses `prisma` (tenant-scoped).
6. Response returned with correct data.

Verify: Would this work for Tenant A? For Tenant B? Would it leak data between them? Would it crash if the feature is disabled?

### Step 7 — Document (Mandatory)

See Documentation Requirements below. This step is NEVER optional.

---

## Constraints

### Hard Constraints (Violations Are Blocking)

1. Multi-tenant isolation MUST be preserved in every change.
2. Dynamic Prisma connection pattern MUST be used — never raw connections.
3. No new npm dependencies without explicit justification.
4. Every task MUST produce documentation.
5. Prisma schema changes MUST use optional fields or defaults.
6. Auth middleware MUST protect non-public endpoints.

### Soft Constraints (Best Practice — Deviate Only With Reason)

1. Follow existing file organization patterns.
2. Keep controllers thin — delegate to services.
3. Prefer Prisma query API over raw SQL.
4. Keep route files focused on routing — no business logic.
5. Use `express-validator` for input validation.
6. Log meaningful events with tenant context.

### Forbidden Actions

- Adding ORM alternatives (TypeORM, Sequelize, Knex).
- Creating separate Express apps or sub-applications.
- Modifying `clientResolver` behavior without explicit request.
- Storing tenant data in global/module-level variables.
- Using `process.env` for tenant-specific configuration (use DB-stored config).
- Bypassing `prismaManager` to create direct database connections.
- Using `SELECT *` or equivalent unscoped Prisma queries on large tables without pagination.

---

## Output Format

### Code Output

When generating code, produce:

1. Complete file contents or precise edit instructions (never partial snippets without context).
2. Clear indication of file path (relative to `backend/`).
3. Explanation of what changed and why.
4. Integration instructions (where to mount, how to register).

### API Endpoint Output

When creating or modifying endpoints, document:

```
METHOD /api/<path>
Auth: required | optional | none
Role: ADMIN | EDITOR | any
Headers: x-client (required)
Body: { field: type, ... }
Response 200: { ... }
Response 4xx: { error: "..." }
```

---

## Documentation Requirements

**Every task executed under this skill MUST produce a `.md` documentation file.**

### File Location

```
/Documentation/<task-name>.md
```

Use descriptive, kebab-case filenames: `blog-pagination-feature.md`, `property-search-endpoint.md`.

### Required Sections

```markdown
# <Task Title>

## Summary
What was implemented, in 2-3 sentences.

## Affected Files
| File | Change Type | Description |
|------|-------------|-------------|
| path/to/file.js | Created / Modified | What changed |

## Data Flow
Step-by-step description of how data moves through the system for this feature.
Include: HTTP entry → middleware → controller → service → database → response.

## API Endpoints (If Applicable)
METHOD /api/path — Description
- Auth: required/optional/none
- Body: { ... }
- Response: { ... }

## Schema Changes (If Applicable)
New or modified Prisma models/fields with rationale.

## Integration Instructions
How to integrate this feature with other parts of the system.
How to enable/disable for specific tenants (if feature-flagged).

## Edge Cases Handled
- What happens when X is missing
- What happens for tenants without this feature
- What happens with concurrent requests

## Tenant Safety Verification
Confirmation that multi-tenant isolation was verified:
- [ ] Uses dynamic Prisma connection
- [ ] No hardcoded tenant identifiers
- [ ] Tenant-scoped cache keys (if applicable)
- [ ] Tenant-scoped file paths (if applicable)
```

### No Exceptions

If a task is too small to warrant full documentation (e.g., a one-line bug fix), produce a minimal version with Summary, Affected Files, and Tenant Safety Verification. The documentation file is ALWAYS created.

---

## Module Integration Guide

### Adding a New Feature Module

When a task requires creating an entirely new module:

1. Create module directory: `modules/<module-name>/`
2. Structure:
   ```
   modules/<module-name>/
   ├── <module>.routes.js
   ├── <module>.controller.js
   └── <module>.service.js
   ```
3. Mount in `src/app.js`: `app.use('/api/<path>', clientResolver, moduleRoutes)`
4. If feature-flagged: add feature key to `src/constants/clientFeatures.js` DEFAULT_CLIENT_FEATURES
5. Update core-admin feature management if new feature key is added

### Adding a New API Resource (Within Existing Structure)

1. Create `src/routes/<resource>.routes.js`
2. Create `src/controllers/<resource>.controller.js`
3. Create `src/services/<resource>.service.js` (if business logic warrants separation)
4. Add validation in route file or as separate middleware
5. Mount in `src/app.js`

### Extending an Existing Resource

1. Read existing controller, route, and service files completely.
2. Add new functions following the existing naming pattern.
3. Add routes following existing auth/validation patterns.
4. Do not refactor existing code unless the task explicitly requires it.

### Schema Modifications

1. Edit `prisma/schema.prisma`.
2. Add `@map()` annotations for snake_case DB columns.
3. Add translation fields if the entity is translatable.
4. Use `@default()` or optional (`?`) for new fields on existing models.
5. Run migration or `db push` as appropriate.
6. Update seeds (`prisma/seed.js`, `prisma/seed-content.js`) if defaults are needed.

---

## Quick Reference Checklist

Before submitting any backend change, verify:

- [ ] `clientResolver` middleware is in the route chain for tenant-scoped endpoints
- [ ] DB access uses `require('../lib/prisma')` or `req.prisma`
- [ ] No hardcoded database names or tenant slugs in logic
- [ ] Protected routes use `authenticate` + `authorize()` middleware
- [ ] Input validation is applied where user data enters the system
- [ ] Error responses use structured JSON with appropriate HTTP status codes
- [ ] New fields in Prisma are optional or have defaults
- [ ] Cache keys include tenant context (if caching is used)
- [ ] Media paths use `buildMediaPath()` — no manual construction (if applicable)
- [ ] Inbound media paths use `extractRelativePath()` (if applicable)
- [ ] No `/uploads/...` or `/posts/...` hardcoded paths in new code
- [ ] `clientSlug` passed explicitly to all media functions
- [ ] Documentation `.md` file is generated in `/Documentation/`
