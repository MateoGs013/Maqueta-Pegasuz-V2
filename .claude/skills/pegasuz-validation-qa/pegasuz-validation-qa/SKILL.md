---
name: pegasuz-validation-qa
description: 'Audit Pegasuz integrations for completeness across API, Service, Store, View, and Routing layers. Detects missing fields, broken relations, incorrect mappings, and architectural violations. Use after feature binding or when validating system integrity.'
---

# Pegasuz Validation & QA System — System Auditor Skill

## Skill Name

**pegasuz-validation-qa**

## Purpose

Verify that every feature, integration, and backend/frontend interaction in the Pegasuz ecosystem is complete, consistent, fully rendered, and production-ready. This skill detects missing fields, broken relations, incorrect mappings, and architectural violations across every layer.

This is NOT a code reviewer. This is a **system auditor**.

---

## Core Principle

If data exists in the system, it MUST be:

1. **Retrieved** — the service layer calls the correct endpoint and passes all params.
2. **Stored** — the Pinia store holds every field from the API response.
3. **Rendered** — every stored field appears in at least one view (list or detail).

Anything else is a **defect**.

---

## Input Sources

This skill receives output from any of the following:

| Source | Type | Contains |
|--------|------|----------|
| Integrator Skill | Integration execution report | Task breakdown, phases, validation matrix, files touched |
| Feature Binding Skill | Binding completion output | API contract, data mapping table, validation checklist |
| Backend Development Skill | Backend change report | New endpoints, schema changes, response shapes |
| Direct audit request | Client slug + feature name | Agent reads code directly from workspace |

The skill MAY also be invoked standalone — given a client slug and feature name, it reads the backend controller, frontend service, store, and views directly and produces a full audit.

---

## System Context

### Backend API Reference

| Feature | List Endpoint | Detail Endpoint | Paginated | Response Wrapper | Relations |
|---------|--------------|-----------------|-----------|-----------------|-----------|
| Properties | `GET /properties` | `GET /properties/:slug` | No | Direct array | None |
| Projects | `GET /projects` | `GET /projects/:slug` | Yes | `{ projects, pagination }` | None |
| Posts (Blog) | `GET /posts` | `GET /posts/slug/:slug` | Yes | `{ posts, pagination }` | author, categories[], tags[] |
| Services | `GET /services` | `GET /services/:slug` | No | Direct array | None |
| Testimonials | `GET /testimonials` | — | Yes | `{ testimonials, pagination }` | None |
| Categories | `GET /categories` | `GET /categories/:slug` | No | Direct array | postCount (computed) |
| Tags | `GET /tags` | `GET /tags/:slug` | No | Direct array | postCount (computed) |
| Contacts | `POST /contacts` | — | — | Write-only | None |
| SiteContent | `GET /site-contents` | — | No | `{ tenant, version, contents }` | None |
| Menu | `GET /menu` | — | No | Nested (categories → items) | categories[], items[] |

### Frontend Architecture (Locked)

```
View → Store → Service → API (axios) → Backend
                                         ↓
                                    x-client header
                                         ↓
                                   clientResolver
                                         ↓
                                   Tenant Database
```

### File Locations

| Layer | Path Pattern |
|-------|-------------|
| Backend controllers | `Pegasuz-Core/backend/src/controllers/<entity>.controller.js` |
| Backend routes | `Pegasuz-Core/backend/src/routes/<entity>.routes.js` |
| Frontend services | `Clientes/<slug>/src/services/<entity>Service.js` |
| Frontend stores | `Clientes/<slug>/src/stores/<entity>.js` |
| Frontend views | `Clientes/<slug>/src/views/<Entity>View.vue`, `<Entity>DetailView.vue` |
| Frontend router | `Clientes/<slug>/src/router/index.js` |
| API config | `Clientes/<slug>/src/config/api.js` |
| Environment | `Clientes/<slug>/.env` or `.env.local` |

---

## Validation Mode

| Mode | Layers Executed | Cross-Cutting Checks | Use Case |
|------|----------------|---------------------|----------|
| **FULL** | Layer 1 + Layer 2 + Layer 3 + Layer 4 + Layer 5 | All (relations, media, pagination, filters, tenant, CMS, translations) | New feature binding, integration completion, release validation |
| **QUICK** | Layer 3 (Store) + Layer 4 (View) | Zero Omission Rule only | Iterative development, post-fix re-check, daily validation |

**Default:** FULL

QUICK mode assumes the API contract and service layer are stable. It validates only that the store holds all fields and the views render them. Use after backend is verified and you are iterating on frontend binding.

To invoke QUICK mode, specify `mode: QUICK` in the audit request. If not specified, FULL is assumed.

QUICK mode output follows the same format (Summary, Defects, Field Coverage, Relation Coverage, Fix Instructions) but skips Layer 1, Layer 2, and Layer 5 columns in coverage tables. Fields are traced from Store → View only.

---

## Validation Layers

### Layer 1 — API Contract Validation

For each feature endpoint, verify:

| Check | Method | Defect If |
|-------|--------|-----------|
| Endpoint exists | Read route file, confirm method + path registered | Route not found |
| Controller exports function | Read controller, confirm named export exists | Export missing |
| Response includes all model fields | Compare controller `select`/`include` against Prisma schema | Field omitted from query |
| Relations are included | Check `include` block in Prisma query | Relation exists in schema but not included |
| Pagination is correct | Check response wrapper matches declared format | Wrapper inconsistent or missing |
| Filters work | Check `where` clause construction from query params | Filter param accepted but not applied |
| Enum values validated | Check route validation middleware | Invalid enum passes through |

**Entity Field Inventory (Ground Truth):**

Properties:
```
id, title, description, slug, operationType, propertyType, price, currency,
rooms, bathrooms, m2, coveredM2, address, city, province,
features (JSON[]), images (JSON[]), featuredImage,
status, createdAt, updatedAt
```

Projects:
```
id, title, slug, description, content, category, location, year,
featuredImage, instagramPostUrl, laminateType, projectDate,
images (JSON[]), featured, createdAt, updatedAt
[translations: titleEn, slugEn, descriptionEn, contentEn, categoryEn, locationEn,
               titleDe, slugDe, descriptionDe, contentDe, categoryDe, locationDe]
```

Posts:
```
id, title, slug, excerpt, content, featuredImage, instagramPostUrl,
status, seoTitle, seoDescription, publishedAt, createdAt, updatedAt, authorId
[relations: author { id, name, avatar }, categories [], tags []]
[translations: titleEn, slugEn, excerptEn, contentEn, seoTitleEn, seoDescriptionEn,
               titleDe, slugDe, excerptDe, contentDe, seoTitleDe, seoDescriptionDe]
```

Services:
```
id, title, slug, description, content, image, features (JSON[]),
showOnHome, order, createdAt, updatedAt
[translations: titleEn, slugEn, descriptionEn, contentEn,
               titleDe, slugDe, descriptionDe, contentDe]
```

Testimonials:
```
id, name, location, content, rating, avatar, featured, createdAt, updatedAt
```

Categories:
```
id, name, slug, description, postCount, createdAt, updatedAt
[translations: nameEn, slugEn, descriptionEn, nameDe, slugDe, descriptionDe]
```

Tags:
```
id, name, slug, postCount, createdAt, updatedAt
[translations: nameEn, slugEn, nameDe, slugDe]
```

### Layer 2 — Service Layer Validation

For each service file, verify:

| Check | Method | Defect If |
|-------|--------|-----------|
| Endpoint URL matches backend route | Compare `api.get('/...')` against route file | URL mismatch or typo |
| Query params forwarded | Check `{ params }` argument in API call | Filter/pagination params dropped |
| Response returned without loss | Verify `return data` returns full API response | Destructuring drops fields |
| All required functions exist | Compare against needed operations (list, detail, create, update, delete) | Function missing |
| Imports single axios instance | Check `import api from '@/config/api'` | Creates own axios instance |

### Layer 3 — Store Validation

For each Pinia store, verify:

| Check | Method | Defect If |
|-------|--------|-----------|
| All entity fields stored | Compare store state fields against API response shape | Field present in API but absent in state |
| Relations preserved | Check if relation arrays/objects are stored intact | Relation flattened, dropped, or partially stored |
| Pagination state exists | Check for `pagination` ref (when API paginates) | Paginated API with no pagination state |
| Loading/error state exists | Check for `loading` and `error` refs | Missing reactive UI feedback |
| Service imported correctly | Check import path matches actual service file | Wrong import or direct axios usage |
| Computed localization | Check localized computed properties for translated fields | Raw fields exposed without locale selection |
| Response extraction correct | Check `data.posts` vs `data` (wrapped vs direct) | Wrong extraction for response shape |

**Response extraction rules (from backend):**
```
Posts:     data.posts     + data.pagination
Projects:  data.projects  + data.pagination
Contacts:  data.contacts  + data.pagination
Testimonials: data.testimonials + data.pagination
Services:  data (direct array)
Properties: data (direct array)
Categories: data (direct array)
Tags:      data (direct array)
```

### Layer 4 — View Validation

For each rendered field, verify across BOTH list and detail views:

| Check | Method | Defect If |
|-------|--------|-----------|
| Field rendered in list view | Search template for field binding (`:title`, `{{ item.title }}`) | Field in store but not in list template |
| Field rendered in detail view | Search template for field binding | Field in store but not in detail template |
| Media uses `resolveImageUrl()` | Check `<img :src="..."` bindings | Raw path used without resolution |
| HTML content uses `v-html` | Check `content` field rendering | HTML string displayed as text |
| JSON arrays iterated | Check `v-for` on array fields (features, images) | Array displayed as raw JSON or only first element |
| Dates formatted | Check date field rendering | ISO string displayed raw |
| Prices formatted | Check price field rendering | Number displayed without currency |
| Relations rendered | Check categories[], tags[], author rendering | Relation exists in store but not in template |
| Empty states handled | Check `v-if`/`v-else` for null/empty values | Template crashes on null field |
| Loading state shown | Check loading indicator in template | No feedback during data fetch |

**Field rendering requirements by entity:**

| Entity | List View MUST Render | Detail View MUST Render |
|--------|----------------------|------------------------|
| Property | title, featuredImage, operationType, propertyType, price+currency, city, rooms, bathrooms, m2 | ALL fields including description, coveredM2, address, province, features[], images[] gallery, status |
| Project | title, featuredImage, category, year | ALL fields including content (v-html), images[] gallery, location, laminateType, projectDate, instagramPostUrl |
| Post | title, featuredImage, excerpt, author.name, categories[], publishedAt | ALL fields including content (v-html), tags[], author (name+avatar), seoTitle, seoDescription |
| Service | title, image, description | ALL fields including content (v-html), features[] list, showOnHome, order |
| Testimonial | name, content, rating | ALL fields including location, avatar, featured |
| Category | name, postCount | ALL fields including description |
| Tag | name, postCount | ALL fields |

### Layer 5 — Routing Validation

| Check | Method | Defect If |
|-------|--------|-----------|
| List route registered | Read `router/index.js`, find route for feature list | No route entry |
| Detail route registered | Find route with `/:slug` param | No dynamic route |
| Route names consistent | Check `name` property on routes | Mismatched names between `router-link` and route definition |
| Lazy loading used | Check `component: () => import(...)` | Eager import in router |
| List → detail navigation | Check `router-link` in list view template points to detail route | No clickable navigation from list items |
| Detail → list back navigation | Check back link/button in detail view | No way to return to list |
| Feature flag guard | Check route `meta.feature` matches enabled features | Route accessible for disabled feature |
| Scroll behavior | Check `scrollBehavior` in router config | Page doesn't scroll to top on navigation |

---

## Zero Omission Rule

```
FOR EVERY field F in API response:
  IF F exists in API
  AND F is NOT rendered in any view
  AND F is NOT explicitly excluded with documented rationale
  → DEFECT (type: MISSING_FIELD, severity: BLOCKING)
```

No exceptions. No implicit exclusions.

**Acceptable exclusion rationales:**
- `id` — internal identifier, not user-facing
- `authorId` — foreign key replaced by embedded `author` object
- `createdAt` / `updatedAt` — timestamps not relevant in public-facing views (must justify per entity)
- `seoTitle` / `seoDescription` — rendered in `<meta>` tags, not visible content (verify meta rendering)
- `instagramPostUrl` — only rendered when non-null (verify conditional rendering)

**Unacceptable exclusion rationales:**
- "Not needed" — WHY is it not needed?
- "Will add later" — incomplete
- "Too complex" — not a valid engineering reason
- No rationale provided — automatic BLOCKING defect

---

## Relation Validation

For every relation R returned by the API:

```
1. RETRIEVED?  → Does the service fetch the endpoint that includes R?
2. STORED?     → Does the store preserve R in state (not flatten/drop)?
3. RENDERED?   → Is R visible in at least one view?

If any step = NO → DEFECT
```

**Known relations in the system:**

| Entity | Relation | Type | Expected Rendering |
|--------|----------|------|--------------------|
| Post | author | Object `{ id, name, avatar }` | Name displayed as byline, avatar as thumbnail |
| Post | categories | Array of `{ id, name, slug }` | Clickable chips/badges linking to category filter |
| Post | tags | Array of `{ id, name, slug }` | Clickable chips/badges linking to tag filter |
| Category | postCount | Computed integer | Numeric badge next to category name |
| Tag | postCount | Computed integer | Numeric badge next to tag name |
| Menu | categories | Array with nested items | Structured menu display with sections |

---

## Media Validation

### Media V3 Path Validation

**PASS criteria — backend API paths MUST match one of these formats:**
```
/media/{tenant}/{feature}/{entity}/{file}      → V3 canonical (PREFERRED)
/media/{feature}/{entity}/{file}?tenant={slug}  → legacy query param (ACCEPTED)
```

**FAIL criteria — backend API paths MUST NOT:**
```
/uploads/...          → DEFECT: legacy filesystem path leaked to API response
/posts/...            → DEFECT: entity-prefixed path without /media/ wrapper
http://... or https:// → DEFECT: backend returning absolute URLs (frontend resolves)
```

**Backend validation checks:**

| Check | Method | FAIL If |
|-------|--------|---------|
| Paths use `buildMediaPath()` | Grep controller code for `buildMediaPath` | Manual string construction found instead |
| Inbound paths use `extractRelativePath()` | Grep controller code | Manual path parsing found instead |
| No legacy path generation | Grep for `/uploads/` in path construction | `/uploads/` used in new path generation code |
| No duplicated media logic | Check for inline path building | Same logic as `buildMediaPath` reimplemented inline |
| `clientSlug` passed explicitly | Check `buildMediaPath` call sites | Slug inferred from `req.client` or headers instead of explicit parameter |

### Frontend Media Validation

| Check | Applies To | Defect If |
|-------|-----------|-----------|
| `featuredImage` displayed | Properties, Projects, Posts, Services | Image not rendered or rendered without `resolveImageUrl()` |
| `images[]` rendered as gallery | Properties, Projects | Only first image shown, or array ignored |
| `image` displayed | Services | Image field present but not rendered |
| `avatar` displayed | Testimonials, Post.author | Avatar field present but not rendered |
| URL resolution via `resolveImageUrl()` | All media fields | Raw path used in `<img :src="">` without `resolveImageUrl()` |
| No path assumptions | All media fields | Code checks for `/uploads/` or `/posts/` prefix — paths are opaque |
| Null handling | All media fields | Template error on null image, or no fallback placeholder |
| No path parsing in frontend | All media fields | Frontend attempts to decompose, reconstruct, or transform media paths |

**Required URL resolution pattern (Media V3 canonical — the ONLY accepted version):**
```js
export function resolveImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const CLIENT_SLUG = import.meta.env.VITE_CLIENT_SLUG || ''

  // V3 canonical: /media/{tenant}/...
  if (path.startsWith(`/media/${CLIENT_SLUG}/`)) return `${API_BASE}${path}`

  // /media/ with tenant already in query
  if (path.startsWith('/media/')) {
    if (path.includes('tenant=')) return `${API_BASE}${path}`
    const sep = path.includes('?') ? '&' : '?'
    return `${API_BASE}${path}${sep}tenant=${CLIENT_SLUG}`
  }

  // Legacy /uploads/ → proxy through /media/
  if (path.startsWith('/uploads/') || path.startsWith('uploads/')) {
    const normalized = path.startsWith('/') ? path : `/${path}`
    return `${API_BASE}/media${normalized}?tenant=${CLIENT_SLUG}`
  }

  // Bare relative path → /media/{path}?tenant=
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}/media${normalized}?tenant=${CLIENT_SLUG}`
}
```

**Validation checks for this function:**
1. Function MUST exist in `src/config/api.js` or `src/services/api.js` → if missing: DEFECT `MEDIA_NO_RESOLVER`
2. Function MUST handle bare relative paths (e.g., `posts/slug/img.webp`) → if it only prepends `API_URL`: DEFECT `MEDIA_SIMPLE_RESOLVER`
3. Function MUST read `VITE_CLIENT_SLUG` → if hardcoded or missing: DEFECT `MEDIA_NO_TENANT`
4. `.env` MUST contain `VITE_CLIENT_SLUG` → if missing: DEFECT `MEDIA_ENV_INCOMPLETE`

**A simplified resolver (`API_URL + path`) is a BLOCKING DEFECT** — it produces broken URLs for bare relative paths.

### Media Defect Types (V3-specific)

| Defect Type | Severity | Description |
|-------------|----------|-------------|
| `MEDIA_LEGACY_PATH` | BLOCKING | Backend generates `/uploads/...` path in new code |
| `MEDIA_ABSOLUTE_URL` | BLOCKING | Backend returns `http://...` absolute URL |
| `MEDIA_NO_RESOLVER` | BLOCKING | Frontend renders media path without `resolveImageUrl()` |
| `MEDIA_SIMPLE_RESOLVER` | BLOCKING | `resolveImageUrl()` exists but only does `API_URL + path` — breaks bare relative paths (e.g., `posts/slug/img.webp` → 404). Must use V3 canonical implementation with `/media/` routing and `?tenant=` |
| `MEDIA_NO_TENANT` | BLOCKING | `resolveImageUrl()` does not read `VITE_CLIENT_SLUG` — tenant identification missing from media URLs |
| `MEDIA_ENV_INCOMPLETE` | BLOCKING | `.env` missing `VITE_CLIENT_SLUG` — required by `resolveImageUrl()` for tenant-scoped media |
| `MEDIA_MANUAL_BUILD` | BLOCKING | Backend constructs path via string concat instead of `buildMediaPath()` |
| `MEDIA_MANUAL_PARSE` | BLOCKING | Backend parses path manually instead of `extractRelativePath()` |
| `MEDIA_SLUG_INFERRED` | WARNING | `clientSlug` not passed explicitly to `buildMediaPath()` |
| `MEDIA_PATH_ASSUMPTION` | WARNING | Frontend code assumes specific path prefix |

---

## Pagination Validation

| Check | Applies To | Defect If |
|-------|-----------|-----------|
| API returns `{ items, pagination }` | Posts, Projects, Testimonials, Contacts | Response shape missing pagination wrapper |
| Store holds `pagination` state | Stores for paginated entities | No pagination ref in store |
| UI shows current page / total | List views for paginated entities | No page indicator |
| Page navigation works | List views | No next/prev controls |
| `page` param sent to API | Service functions | Service calls without `page` param |
| Page change triggers re-fetch | Store action | Page change doesn't reload data |
| `limit` param respected | Service functions | Hardcoded or missing limit |

**Non-paginated entities (no pagination required):**
Properties, Services, Categories, Tags, SiteContent.

---

## Filter Validation

| Entity | Available Filters | Check |
|--------|------------------|-------|
| Properties | `operationType`, `propertyType`, `city`, `minPrice`, `maxPrice` | Each filter MUST have a UI control, MUST send query param, MUST update results |
| Projects | `featured`, `category` | Filter controls or preset views |
| Posts | `category`, `tag`, `search` | Filter/search bar with category/tag selectors |
| Services | `showOnHome` | Toggle or preset filter |
| Testimonials | `featured` | Toggle or preset filter |
| Contacts | `status` | Admin-only status filter |

Filter defect conditions:
- Filter param accepted by API but no UI control exists → DEFECT
- UI control exists but doesn't send param to API → DEFECT
- Filter applied but results don't update → DEFECT
- Filter change doesn't reset pagination to page 1 → DEFECT

---

## Multi-Tenant Validation

| Check | Method | Defect If |
|-------|--------|-----------|
| `x-client` header configured | Read `src/config/api.js` interceptors | Header not attached to requests |
| Slug from environment | Check `VITE_CLIENT_SLUG` in `.env` | Slug hardcoded in source code |
| No cross-tenant leakage | Verify no other tenant slugs appear in source files | Foreign tenant slug found in code |
| Media paths tenant-scoped | Verify image URLs use correct tenant upload path | Images from wrong tenant |
| CMS bootstrap uses correct tenant | Verify `GET /site-contents` sends correct `x-client` | CMS data from wrong tenant |

---

## CMS Integration Validation

| Check | Method | Defect If |
|-------|--------|-----------|
| Bootstrap before mount | Read `main.js`, verify CMS loads before `app.mount()` | CMS loads after mount (race condition) |
| Content store exists | Check `src/stores/content.js` | No CMS store |
| `get(key)` / `getJSON(key)` available | Check store exports | Missing accessor functions |
| Feature data vs CMS data separation | Verify views don't use `contentStore` for entity data | Entity data pulled from CMS instead of feature endpoint |
| CMS keys used in views | Check `contentStore.get('...')` calls match actual keys in backend `cmsKeys.js` | Key mismatch → empty content |

---

## Translation Validation

| Check | Applies To | Defect If |
|-------|-----------|-----------|
| Locale helper exists | All translatable entities | No `localizeField()` or equivalent function |
| Fallback to base (ES) | All translated fields | `null` translation displays empty instead of base value |
| All translated fields covered | Check entity field list for En/De suffixes | Some translated fields use locale, others don't |
| Language store exists | Frontend | No reactive locale state |
| Language switching works | Views with translated content | Language change doesn't update rendered fields |

**Translatable entities:** Projects, Posts, Services, Categories, Tags.
**Non-translatable entities:** Properties, Testimonials, Contacts.

---

## Execution Workflow

### Step 1 — Identify Audit Target

Receive input: client slug + feature name (or "all features").

Read the client's enabled features from:
1. Core DB: `GET /api/core-admin/clients/:slug/features`
2. Or from scope: `client_features` table

Determine which features to audit.

### Step 2 — Read Backend Contract

For each target feature:
1. Read the controller file: `Pegasuz-Core/backend/src/controllers/<entity>.controller.js`
2. Extract the EXACT response shape (fields, relations, wrapping, pagination).
3. Read the route file: `Pegasuz-Core/backend/src/routes/<entity>.routes.js`
4. Extract: endpoints, methods, auth requirements, validation middleware.
5. Record this as the **API Ground Truth**.

### Step 3 — Read Frontend Code

For each target feature:
1. Read service: `Clientes/<slug>/src/services/<entity>Service.js`
2. Read store: `Clientes/<slug>/src/stores/<entity>.js`
3. Read list view: `Clientes/<slug>/src/views/<Entity>View.vue` (or `<Entity>ListView.vue`)
4. Read detail view: `Clientes/<slug>/src/views/<Entity>DetailView.vue`
5. Read router: `Clientes/<slug>/src/router/index.js`

If any file does not exist → DEFECT (type: MISSING_FILE, severity: BLOCKING).

### Step 4 — Execute Layer Validations

Run all 5 validation layers in sequence:
1. API Contract Validation (Layer 1)
2. Service Layer Validation (Layer 2)
3. Store Validation (Layer 3)
4. View Validation (Layer 4)
5. Routing Validation (Layer 5)

Record every finding as PASS or DEFECT.

### Step 5 — Execute Cross-Cutting Validations

Run supplementary checks:
1. Zero Omission Rule — every API field traced to rendering
2. Relation Validation — every relation retrieved → stored → rendered
3. Media Validation — every image field resolved and displayed
4. Pagination Validation — paginated endpoints have full pagination UI
5. Filter Validation — available filters exposed and functional
6. Multi-Tenant Validation — tenant isolation preserved
7. CMS Integration Validation — bootstrap works, data sources separated
8. Translation Validation — locale-aware rendering where applicable

### Step 6 — Classify Defects

Every finding is classified:

| Severity | Criteria | Action |
|----------|----------|--------|
| **BLOCKING** | Data exists in API but not rendered and not excluded with rationale | MUST fix before declaring complete |
| **BLOCKING** | File missing (service, store, view, route) | MUST create before declaring complete |
| **BLOCKING** | Relation returned by API but dropped in frontend | MUST bind before declaring complete |
| **WARNING** | Non-critical field omitted without documentation | Add exclusion rationale |
| **WARNING** | Pagination exists but UI controls incomplete | Complete pagination UI |
| **WARNING** | Filter available but not exposed | Expose filter or document exclusion |
| **INFO** | Date/price not formatted | Format for display |
| **INFO** | Fallback placeholder missing for null image | Add placeholder |

### Step 7 — Produce Validation Report

Generate the full output (see Output Format below).

---

## Output Format

Every audit produces ALL of the following sections. No section may be omitted.

### 1. Validation Summary

```markdown
## Validation Summary

- **Client:** <slug>
- **Feature:** <feature name>
- **Date:** <YYYY-MM-DD>
- **Status:** COMPLETE | PARTIAL | FAILED
- **Field Coverage:** X / Y fields rendered (Z%)
- **Relation Coverage:** A / B relations rendered
- **Defects Found:** N (B blocking, W warnings, I info)
```

Status determination:
- **COMPLETE** — Zero BLOCKING defects, all fields covered or excluded with rationale.
- **PARTIAL** — No BLOCKING defects, but WARNING-level gaps remain.
- **FAILED** — One or more BLOCKING defects exist.

### 2. Defects List

```markdown
## Defects

| # | Severity | Type | Location | Description | Impact |
|---|----------|------|----------|-------------|--------|
| 1 | BLOCKING | MISSING_FIELD | PropertiesDetailView.vue | `images[]` array not rendered | Property gallery invisible |
| 2 | BLOCKING | BROKEN_RELATION | posts store | `categories[]` dropped during extraction | Post categories not displayed |
| 3 | WARNING | MISSING_FILTER | PropertiesView.vue | `operationType` filter not exposed | Users cannot filter by operation |
| 4 | INFO | UNFORMATTED | ProjectDetailView.vue | `projectDate` displayed as ISO string | Poor UX |
```

**Defect types:**
- `MISSING_FIELD` — API field not rendered
- `MISSING_FILE` — Required service/store/view/route doesn't exist
- `BROKEN_RELATION` — Relation dropped or flattened incorrectly
- `MISSING_FILTER` — Available filter not exposed in UI
- `MISSING_PAGINATION` — Paginated API but no pagination UI
- `MEDIA_BROKEN` — Image not displayed or URL not resolved
- `MEDIA_LEGACY_PATH` — Backend generates `/uploads/` path in new code
- `MEDIA_ABSOLUTE_URL` — Backend returns absolute URL instead of relative path
- `MEDIA_NO_RESOLVER` — Frontend renders path without `resolveImageUrl()`
- `MEDIA_MANUAL_BUILD` — Backend constructs path via string concat instead of `buildMediaPath()`
- `MEDIA_MANUAL_PARSE` — Backend parses path manually instead of `extractRelativePath()`
- `ROUTING_BROKEN` — Route missing, navigation broken
- `TENANT_LEAK` — Hardcoded slug or cross-tenant data
- `CMS_VIOLATION` — Feature data from CMS or CMS data from feature endpoint
- `TRANSLATION_BROKEN` — Translatable field not localized
- `ARCH_VIOLATION` — Violates locked frontend architecture rules

### 3. Field Coverage Table

```markdown
## Field Coverage

### <Entity Name>

| Field | Type | API | Service | Store | List View | Detail View | Status |
|-------|------|-----|---------|-------|-----------|-------------|--------|
| id | number | ✓ | ✓ | ✓ | — | — | EXCL (internal) |
| title | string | ✓ | ✓ | ✓ | ✓ card title | ✓ hero title | OK |
| featuredImage | string | ✓ | ✓ | ✓ | ✓ card img | ✓ hero img | OK |
| images | JSON[] | ✓ | ✓ | ✓ | — | ✗ MISSING | DEFECT |
| categories | relation[] | ✓ | ✓ | ✗ dropped | — | — | DEFECT |
```

**Column values:**
- `✓` — present and correct
- `✗` — absent (defect)
- `—` — intentionally excluded (with rationale in EXCL)
- `EXCL (reason)` — explicit exclusion

### 4. Relation Coverage Table

```markdown
## Relation Coverage

| Entity | Relation | Type | API | Service | Store | View | Status |
|--------|----------|------|-----|---------|-------|------|--------|
| Post | author | object | ✓ | ✓ | ✓ | ✓ byline | OK |
| Post | categories | array | ✓ | ✓ | ✗ | — | DEFECT |
| Post | tags | array | ✓ | ✓ | ✓ | ✓ chips | OK |
```

### 5. Fix Instructions

```markdown
## Fix Instructions

### Defect #1 — images[] not rendered in PropertiesDetailView.vue

**What:** Add gallery component rendering the `images` JSON array.
**Where:** `Clientes/<slug>/src/views/PropertiesDetailView.vue`
**How:**
1. In the template, add a gallery section after the hero image.
2. Iterate over `currentProperty.images` with `v-for`.
3. Each image MUST use `resolveImageUrl(img)` for URL resolution.
4. Handle empty array with `v-if="currentProperty.images?.length"`.

### Defect #2 — categories[] dropped in posts store

**What:** Store extracts `data.posts` but does not preserve flattened `categories` array per post.
**Where:** `Clientes/<slug>/src/stores/posts.js`
**How:**
1. Verify `fetchPosts()` stores the full post object including `categories` array.
2. The backend already flattens M2M (`post.categories.map(pc => pc.category)`) — the store must preserve this.
3. Check `response.data.posts` — each post object should already include `categories: [...]`.
```

Every defect gets a fix instruction. No defect is listed without a resolution path.

---

## Rules

###SCOPE RULE:

If auditing multiple features:
- Validate one feature at a time
- Complete full validation cycle before moving to next
- Do NOT mix results across features

### R1 — Never Assume Completeness

Every field, every relation, every route MUST be explicitly verified by reading actual code. If you cannot confirm a field is rendered by finding it in a template, it is MISSING.

### R2 — Read Code, Not Documentation

Do NOT trust existing documentation, comments, or README files to determine what is implemented. Read the actual source files. Documentation may be outdated. Code is truth.

### R3 — Audit Every Field

The field inventory in Layer 1 is the ground truth. Every field listed must be traced through service → store → view. No shortcuts.

### R4 — Relations Are Entity-Level Requirements

A relation is not optional. If the backend includes it in the response, the frontend MUST consume and render it. Dropping a relation is equivalent to dropping a field.

### R5 — Media Is Never Decorative

Every image field exists because the data model requires it. If an entity has `featuredImage`, it MUST be displayed. If an entity has `images[]`, ALL images MUST be displayable (gallery, carousel, grid).

### R6 — Do Not Stop at Backend

Backend validation alone is insufficient. A working API endpoint with correct data means nothing if the frontend drops fields, ignores relations, or fails to render.

### R7 — Defects Are Concrete

Every defect must specify: type, severity, exact file location, description, and impact. Abstract defects like "might be missing" are not defects — verify and confirm before listing.

### R8 — Fix Instructions Are Mandatory

Listing a defect without a fix instruction is incomplete. Every defect must include: what to change, where, and how.

### R9 — Partial Is Not Complete

If any BLOCKING defect exists, status is FAILED. If only WARNINGs exist, status is PARTIAL. COMPLETE requires zero BLOCKING defects and documented rationale for all excluded fields.

### R10 — Pessimistic By Default

If something is not explicitly verified, assume it is broken. The auditor's job is to find what is missing, not to confirm what is correct.

---

## Constraints

### Hard Constraints

1. Every audit produces ALL 5 output sections (Summary, Defects, Field Coverage, Relation Coverage, Fix Instructions).
2. Zero Omission Rule applies to every feature — no exceptions.
3. BLOCKING defects prevent COMPLETE status — always.
4. Fix instructions are mandatory for every defect.
5. Code is truth — documentation is not.

### Execution Constraints

1. Do NOT explain theory. Report findings.
2. Do NOT describe what should happen. Describe what IS happening and what IS missing.
3. Do NOT be verbose. Tables over prose. Facts over explanations.
4. Do NOT repeat passing checks. Focus on defects.
5. Do NOT suggest architectural changes. Validate against existing architecture.

### Output Constraint

Do NOT list all passing checks in the narrative. Focus exclusively on:

- **Defects** — what is broken or missing
- **Missing coverage** — fields/relations not rendered
- **Critical gaps** — architectural violations, tenant leaks, broken routes

Field Coverage and Relation Coverage tables MAY include all fields (for completeness), but all prose, summaries, and fix sections MUST focus on issues only. Passing items in tables are marked `OK` and receive no further commentary.

### Forbidden Actions

- Declaring COMPLETE status with unresolved BLOCKING defects.
- Listing a defect without a fix instruction.
- Trusting documentation over actual code.
- Skipping any validation layer (in FULL mode).
- Validating only the backend and not the frontend.
- Validating only the frontend and not the backend.
- Assuming a field is rendered without finding it in the template.
- Marking a relation as "not needed" without documented rationale from the Feature Binding Skill.

---

## Integration With Other Skills

### Upstream: Receives From

| Skill | When | What This Skill Does |
|-------|------|---------------------|
| Integrator (Phase 7) | After feature binding | Executes full 5-layer audit, returns defects to Integrator |
| Feature Binding (Step 7) | After binding completion | Validates binding completeness against API contract |
| Backend Development | After endpoint changes | Validates new/modified endpoints against existing frontend consumers |

### Downstream: Feeds Into

| Skill | When | What It Receives |
|-------|------|-----------------|
| Feature Binding Skill | On BLOCKING defects in Layers 2-4 | Fix instructions for service/store/view gaps |
| Backend Development Skill | On BLOCKING defects in Layer 1 | Fix instructions for API contract issues |
| Documentation System Skill | On audit completion | Full validation report for filing and indexing |

### Invocation by Integrator

When the Integrator invokes this skill (Phase 7), it provides:
- Client slug
- Feature list
- Backend API contracts (from Phase 3)
- Frontend file paths (from Phase 5)

This skill returns:
- Validation Summary (COMPLETE / PARTIAL / FAILED)
- Defects list with fix instructions
- Field and relation coverage tables

If status is FAILED, the Integrator MUST return to Phase 5 and execute fixes before re-validating.

---

## Quick Reference — Audit Checklist

```
□ Layer 1: API Contract
  □ All endpoints exist and return data
  □ All model fields present in response
  □ Relations included where expected
  □ Pagination wrapper correct
  □ Filters applied correctly

□ Layer 2: Service
  □ Endpoint URLs match backend routes
  □ Query params forwarded
  □ Response returned without loss
  □ Single axios instance used

□ Layer 3: Store
  □ All fields stored in state
  □ Relations preserved
  □ Pagination state exists (when applicable)
  □ Loading/error state present
  □ Response extraction matches wrapper type

□ Layer 4: Views
  □ Every field rendered in list or detail (or excluded with rationale)
  □ Media fields use resolveImageUrl()
  □ HTML fields use v-html
  □ JSON arrays iterated with v-for
  □ Relations rendered as distinct UI elements
  □ Empty/loading/error states handled

□ Layer 5: Routing
  □ List route registered
  □ Detail route with :slug registered
  □ List → detail navigation works
  □ Lazy loading used
  □ Feature flag guard present

□ Cross-Cutting
  □ Zero Omission Rule satisfied
  □ Multi-tenant isolation verified
  □ CMS integration correct
  □ Translation handling correct (if applicable)
  □ All defects have fix instructions

□ Media V3 Compliance
  □ Backend: all media paths generated via buildMediaPath()
  □ Backend: all inbound paths parsed via extractRelativePath()
  □ Backend: no /uploads/ or /posts/ hardcoded in new code
  □ Backend: clientSlug passed explicitly (not inferred)
  □ Backend: no absolute URLs returned in API responses
  □ Frontend: all media rendered with resolveImageUrl()
  □ Frontend: no path prefix assumptions (/uploads/, /posts/)
  □ Frontend: no path parsing or reconstruction logic
```

---

## Documentation Output

Every audit produces a file at:

```
/Documentation/fixes/<client>-<feature>-validation-<YYYY-MM-DD>.md
```

If the audit is part of an Integrator execution, the validation results are embedded in the integration report instead of a separate file.

The file MUST contain all 5 output sections defined above, plus the completed audit checklist.
