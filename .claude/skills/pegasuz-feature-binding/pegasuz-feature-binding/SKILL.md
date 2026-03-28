---
name: pegasuz-feature-binding
description: 'Bind backend features to Vue 3 frontends end-to-end. Ensures every API field is consumed, mapped in Pinia stores, and rendered in views with zero missing fields or broken relations. Use when connecting backend APIs to frontend components.'
---

# Pegasuz Core — Feature Binding Skill

## Skill Name

**pegasuz-feature-binding**

## Purpose

Ensure that any backend feature (blog, services, properties, projects, testimonials, etc.) is FULLY connected, mapped, and rendered in a Vue 3 frontend — end to end, with zero missing fields, zero broken relations, and zero partial implementations.

This is NOT a UI design skill. It does not dictate visual appearance.
This is NOT a backend development skill. It does not create or modify API endpoints.

This skill operates in the seam between backend and frontend: it reads what the API provides and guarantees that EVERYTHING is consumed, mapped, and rendered structurally.

---

## System Context

### Backend (Read-Only — Already Exists)

| Aspect | Detail |
|--------|--------|
| Stack | Node.js + Express + Prisma + MySQL |
| Multi-Tenant | `x-client` header resolved by `clientResolver` middleware |
| API Base | `https://api.pegasuz.com.ar/api` |
| Auth | JWT via `Authorization: Bearer <token>` |
| Features | Properties, Projects, Posts (Blog), Services, Categories, Tags, Testimonials, Contacts, SiteContent (CMS) |

### Frontend (Target of Binding)

| Aspect | Detail |
|--------|--------|
| Stack | Vue 3 + Vite + Pinia + Axios |
| Tenant Config | `VITE_API_URL` + `VITE_CLIENT_SLUG` in `.env` |
| API Client | Single axios instance in `src/config/api.js` |
| CMS Store | `src/stores/content.js` — bootstraps from `GET /site-contents` before mount |
| CMS Access | `get(key, fallback)` and `getJSON(key, fallback)` via store or composable |
| Views | `src/views/` — one per page (list view, detail view) |
| Components | `src/components/` — reusable cards, sections, layouts |
| Services | `src/services/` — HTTP wrappers per feature (one file per entity) |
| Stores | `src/stores/` — Pinia stores per feature (one file per entity) |

### Established Integration Architecture

```
View → Store → Service → API (axios) → Backend
                                         ↓
                                    x-client header
                                         ↓
                                   clientResolver
                                         ↓
                                   Tenant Database
```

**Mandatory rules from PEGASUZ_FRONTEND_IMPLEMENTATION_SPEC (LOCKED):**

1. Single axios instance — no duplicate HTTP clients.
2. Services call axios — stores call services — views consume stores.
3. No direct HTTP calls from views or components.
4. No JSON.parse in components — parsing happens in stores/services.
5. Tenant slug from `VITE_CLIENT_SLUG` — never hardcoded, never derived from URL.
6. CMS bootstrap MUST complete before `app.mount()`.

---

## Backend Entity Reference

This is the complete field inventory per feature. When binding a feature, EVERY field listed here must be accounted for — either rendered, or explicitly documented as intentionally excluded with rationale.

### Properties

```
id, title, description, slug, operationType, propertyType, price, currency,
rooms, bathrooms, m2, coveredM2, address, city, province,
features (JSON array), images (JSON array), featuredImage,
status, createdAt, updatedAt
```

- Endpoints: `GET /properties` (list, filterable), `GET /properties/:slug` (detail)
- Filters: `operationType`, `propertyType`, `city`, `minPrice`, `maxPrice`
- Relations: None
- Translations: None
- Media: `featuredImage` (single), `images` (gallery array)

### Projects

```
id, title, slug, description, content, category, location, year,
featuredImage, instagramPostUrl, laminateType, projectDate,
images (JSON array), featured, createdAt, updatedAt
[translations: titleEn, slugEn, descriptionEn, contentEn, categoryEn, locationEn,
               titleDe, slugDe, descriptionDe, contentDe, categoryDe, locationDe]
```

- Endpoints: `GET /projects` (paginated, filterable), `GET /projects/:slug` (detail)
- Filters: `featured`, `category`, `page`, `limit`
- Response wrapping: `{ projects: [...], pagination: { page, limit, total, pages } }`
- Relations: None
- Translations: title, slug, description, content, category, location (EN + DE)
- Media: `featuredImage` (single), `images` (gallery array)

### Posts (Blog)

```
id, title, slug, excerpt, content, featuredImage, instagramPostUrl,
status, seoTitle, seoDescription, publishedAt, createdAt, updatedAt, authorId
[relations: author { id, name, avatar }, categories [...], tags [...]]
[translations: titleEn, slugEn, excerptEn, contentEn, seoTitleEn, seoDescriptionEn,
               titleDe, slugDe, excerptDe, contentDe, seoTitleDe, seoDescriptionDe]
```

- Endpoints: `GET /posts` (paginated, filterable), `GET /posts/slug/:slug` (detail)
- Filters: `page`, `limit`, `category`, `tag`, `search`, `status` (admin only)
- Response wrapping: `{ posts: [...], pagination }`
- Relations: `author` (embedded object), `categories` (array, flattened from join table), `tags` (array, flattened from join table)
- Translations: title, slug, excerpt, content, seoTitle, seoDescription (EN + DE)
- Media: `featuredImage` (single)

### Services

```
id, title, slug, description, content, image, features (JSON array),
showOnHome, order, createdAt, updatedAt
[translations: titleEn, slugEn, descriptionEn, contentEn,
               titleDe, slugDe, descriptionDe, contentDe]
```

- Endpoints: `GET /services` (filterable), `GET /services/:slug` (detail)
- Filters: `showOnHome`
- Relations: None
- Translations: title, slug, description, content (EN + DE)
- Media: `image` (single)

### Categories

```
id, name, slug, description, postCount, createdAt, updatedAt
[translations: nameEn, slugEn, descriptionEn,
               nameDe, slugDe, descriptionDe]
```

- Endpoints: `GET /categories`, `GET /categories/:slug`
- Relations: `postCount` (computed, flattened from `_count`)

### Tags

```
id, name, slug, postCount, createdAt, updatedAt
[translations: nameEn, slugEn, nameDe, slugDe]
```

- Endpoints: `GET /tags`, `GET /tags/:slug`
- Relations: `postCount` (computed, flattened from `_count`)

### Testimonials

```
id, name, location, content, rating, avatar, featured, createdAt, updatedAt
```

- Endpoints: `GET /testimonials` (paginated, filterable)
- Filters: `featured`, `page`, `limit`
- Response wrapping: `{ testimonials: [...], pagination }`
- Relations: None
- Translations: None
- Media: `avatar` (single)

### Contacts (Form Submission)

```
POST body: name (required), email (required), phone (optional), service (optional), message (required)
Response: { message: "...", id: number }
```

- Endpoint: `POST /contacts`
- Public, rate-limited
- No rendering needed — this is a write-only feature from public frontend perspective

### SiteContent (CMS)

```
key, value, section, type, valueEn, valueDe
```

- Endpoint: `GET /site-contents` (public bootstrap)
- Response: `{ tenant, version, contents: [...] }`
- Consumed via `contentStore.get(key)` / `contentStore.getJSON(key)`

---

## Rules

### R1 — Full Entity Coverage (Zero Omission)

When binding a feature, EVERY field returned by the API MUST be either:
- **Rendered** in the appropriate view, OR
- **Explicitly excluded** with documented rationale in the binding documentation

There is no middle ground. Partial implementation is a failure state.

### R2 — Relations Are First-Class Citizens

If the API returns relations (e.g., post → categories, post → tags, post → author), those relations MUST be rendered as distinct visual sections — not silently dropped or merged into unrelated UI.

- Categories → rendered as clickable labels/chips/links
- Tags → rendered as clickable labels/chips/links
- Author → rendered with name (and avatar if non-null)
- Images array → rendered as gallery (not just first image)
- Features array → rendered as list items

### R3 — Media Is Never Optional

If the entity has image fields, the binding MUST handle:
- `featuredImage` → prominently displayed (hero, card thumbnail)
- `images` (array) → gallery/carousel component
- `avatar` → displayed inline with entity
- `image` → displayed alongside content
- Null/missing images → fallback placeholder or graceful absence

#### Media V3 Path System (MANDATORY)

**Backend returns relative paths — NEVER absolute URLs.** The frontend is responsible for resolving paths to full URLs using `resolveImageUrl()`.

**Supported path formats (frontend MUST handle ALL):**
```
absolute URL (http/https)                      → passthrough (no transformation)
/media/{tenant}/{feature}/{entity}/{file}      → V3 canonical (prepend API_URL only)
/media/{feature}/{entity}/{file}?tenant={slug} → legacy with tenant query (prepend API_URL)
/media/{feature}/{entity}/{file}               → legacy without tenant (add ?tenant=)
/uploads/...                                    → legacy DB data (proxy through /media/)
{feature}/{entity}/{file}                       → bare relative (route through /media/)
```

**CANONICAL `resolveImageUrl()` IMPLEMENTATION — this is the ONLY accepted version:**

```js
export function resolveImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const CLIENT_SLUG = import.meta.env.VITE_CLIENT_SLUG || ''

  // V3 canonical: /media/{tenant}/...
  if (path.startsWith(`/media/${CLIENT_SLUG}/`)) {
    return `${API_BASE}${path}`
  }

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

**Where `API_BASE` is `import.meta.env.VITE_API_URL`** (defined at module top level in api.js).

**WHY this implementation and not a simpler one:** The backend returns paths in multiple formats depending on data age and migration status. A simple `API_URL + path` prepend BREAKS on bare relative paths (e.g., `posts/slug/img.webp`) because it produces `https://api.pegasuz.com.ar/posts/slug/img.webp` — missing the `/media/` route and `?tenant=` query param. The full implementation routes ALL formats through the `/media/` endpoint with tenant identification.

**PROHIBITED in frontend binding:**
- Using a simplified `resolveImageUrl()` that only prepends `API_URL` — this breaks bare relative paths
- Assuming paths start with `/uploads/` or `/posts/`
- Rendering backend paths directly in `<img src="">` without `resolveImageUrl()`
- Hardcoding any path prefix or tenant slug in media path construction
- Parsing or transforming media paths in frontend code (backend handles path format)
- Omitting `VITE_CLIENT_SLUG` from `.env` — this BREAKS tenant-scoped media resolution

### R4 — Translation Awareness

If the entity has translation fields (En/De suffixes), the binding MUST:
- Use a localization helper to select the correct field based on active locale
- Fall back to the base (Spanish) field when translation is null
- Never ignore translation fields entirely

Localization pattern:
```js
function localizeField(entity, field, locale) {
  if (locale === 'en' && entity[`${field}En`]) return entity[`${field}En`]
  if (locale === 'de' && entity[`${field}De`]) return entity[`${field}De`]
  return entity[field]
}
```

### R5 — Service-Store-View Layering (No Shortcuts)

Every feature binding MUST follow this file structure:

```
src/services/<feature>Service.js   → HTTP wrapper (calls api.get/post)
src/stores/<feature>.js            → Pinia store (calls service, holds state)
src/views/<Feature>View.vue        → List view (reads from store)
src/views/<Feature>DetailView.vue  → Detail view (reads from store)
```

- Services handle HTTP calls and nothing else.
- Stores manage state, call services, expose data via `ref`/`computed`.
- Views consume stores — never import axios or services directly.

### R6 — Pagination Must Be Implemented When Available

If the API returns `{ items: [...], pagination: { page, limit, total, pages } }`, the list view MUST support pagination — at minimum:
- Display total count
- Navigate between pages
- Pass `page` and `limit` params to the API

### R7 — Filters Must Be Exposed When Available

If the API accepts filter query parameters (e.g., `operationType`, `category`, `featured`), the list view MUST expose filter controls. The filter values MUST be dynamic — driven by data, not hardcoded.

### R8 — List-Detail Consistency

The list view and detail view MUST be structurally consistent:
- Every field visible in the list card MUST also be present in the detail view
- The detail view MUST include ALL fields, including those intentionally omitted from the card for space reasons
- Route navigation from list → detail MUST use slug-based routing: `/:slug`

### R9 — No Hardcoded Data Structures

- NEVER hardcode field names that could change.
- NEVER hardcode filter options that come from the database.
- NEVER hardcode image paths.
- Use the API response as the single source of truth.

### R10 — CMS Content Is Separate From Feature Data

Feature data (properties, posts, projects) comes from dedicated API endpoints.
CMS content (site name, hero text, section labels) comes from `contentStore.get()`.

NEVER mix these two data sources. A view can use BOTH, but they serve different purposes:
- Feature endpoint → entity data (dynamic, paginated, filterable)
- CMS store → static site content (labels, descriptions, branding)

### R11 — Media V3 Is the Only Accepted Pattern (HARD GATE)

Media fields in API responses contain **relative logical paths** in varying formats. These are NOT filesystem paths and NOT absolute URLs.

**Frontend responsibility:**
1. ALWAYS pass media fields through `resolveImageUrl()` before rendering
2. NEVER assume a specific path prefix (`/uploads/`, `/posts/`, etc.)
3. NEVER attempt to parse, decompose, or reconstruct media paths — treat them as opaque strings
4. SUPPORT V3 canonical (`/media/{tenant}/...`), legacy query (`/media/...?tenant=`), legacy uploads (`/uploads/...`), and bare relative paths — the canonical `resolveImageUrl()` handles ALL of them
5. ALWAYS include `VITE_CLIENT_SLUG` in `.env` — it is required by `resolveImageUrl()`

**The pattern is NOT "prepend API_URL and done".** The correct pattern routes all paths through `/media/` with tenant identification via `?tenant=`. See R3 → Media V3 Path System for the canonical implementation.

**CRITICAL LESSON (from lavaderoartesanal incident 2026-03-27):** A simplified `resolveImageUrl()` that only does `API_URL + path` produces broken URLs for bare relative paths like `posts/slug/img.webp` → `https://api.pegasuz.com.ar/posts/slug/img.webp` (404). The canonical V3 implementation correctly routes this through `/media/posts/slug/img.webp?tenant=lavaderoartesanal`.

---

## Binding Workflow

When binding a feature, execute these steps in exact order.

### Step 1 — Audit Backend Endpoint

1. Read the backend controller file for the target feature.
2. Document the EXACT response shape — every field, every relation, every nested object.
3. Identify: filters, pagination, auth requirements, translation fields, media fields.
4. Record this as the **API Contract** for the binding.

Questions to answer:
- What is the list endpoint URL and response wrapper?
- What is the detail endpoint URL and response shape?
- What query parameters does the list endpoint accept?
- What relations are included (embedded objects, arrays)?
- Which fields have translation variants (En/De)?
- Which fields contain media references (images, avatars)?
- Is pagination available? What is the response shape?

### Step 2 — Create/Verify Service Layer

File: `src/services/<feature>Service.js`

The service MUST:
- Import api from `@/config/api`
- Export functions for each operation needed (list, detail, filters)
- Pass through query parameters for filtering/pagination
- Return raw API response (no transformation)

Template:
```js
import api from '@/config/api'

export async function fetch<Features>(params = {}) {
  const { data } = await api.get('/<feature-endpoint>', { params })
  return data
}

export async function fetch<Feature>BySlug(slug) {
  const { data } = await api.get(`/<feature-endpoint>/${slug}`)
  return data
}
```

### Step 3 — Create/Verify Pinia Store

File: `src/stores/<feature>.js`

The store MUST:
- Import service functions
- Hold reactive state: `items`, `currentItem`, `loading`, `error`, `pagination`
- Expose fetch actions that call services
- Expose computed properties for processed data (localized versions if applicable)
- Handle loading/error states

Template:
```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetch<Features>, fetch<Feature>BySlug } from '@/services/<feature>Service'

export const use<Feature>Store = defineStore('<feature>', () => {
  const items = ref([])
  const currentItem = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref(null)

  async function loadItems(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await fetch<Features>(params)
      items.value = data.<features> ?? data
      pagination.value = data.pagination ?? null
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function loadBySlug(slug) {
    loading.value = true
    error.value = null
    try {
      currentItem.value = await fetch<Feature>BySlug(slug)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return { items, currentItem, loading, error, pagination, loadItems, loadBySlug }
})
```

### Step 4 — Implement List View

File: `src/views/<Feature>View.vue` or `src/views/<Feature>ListView.vue`

The list view MUST:
1. Call store's load action in `onMounted`
2. Display loading state
3. Display error state
4. Iterate over items and render cards
5. Each card MUST render: primary field (title/name), media (image), key metadata, link to detail
6. Expose filter controls if the API supports query parameters
7. Implement pagination if the API returns pagination metadata

### Step 5 — Implement Detail View

File: `src/views/<Feature>DetailView.vue`

The detail view MUST:
1. Extract slug from `route.params.slug`
2. Call store's loadBySlug in `onMounted`
3. Display loading state
4. Display error/404 state
5. Render ALL entity fields organized into logical sections:
   - Hero section: featured image + title
   - Content section: description, content (HTML), excerpt
   - Metadata section: dates, status, category, location, year, etc.
   - Media section: image gallery (if `images` array exists)
   - Relations section: categories, tags, author (if present)
   - Features/amenities section: features array (if present)
   - Contact/CTA section: relevant call-to-action

### Step 6 — Register Routes

File: `src/router/index.js`

Add routes:
```js
{
  path: '/<feature-url>',
  name: '<feature>-list',
  component: () => import('@/views/<Feature>View.vue'),
  meta: { title: '<Feature Title>' }
},
{
  path: '/<feature-url>/:slug',
  name: '<feature>-detail',
  component: () => import('@/views/<Feature>DetailView.vue'),
  meta: { title: '<Feature Detail Title>' }
}
```

### Step 7 — Data Integrity Verification

Before declaring the binding complete, walk through this verification:

**Field Coverage Audit:**

For every field in the API response, answer:
- Is this field rendered in the list view? Where?
- Is this field rendered in the detail view? Where?
- If not rendered, what is the explicit exclusion reason?

**Relations Audit:**

For every relation returned by the API:
- Is the relation rendered as a distinct section?
- Are relation items individually accessible (clickable, navigable)?

**Media Audit:**

For every media field:
- Is the image displayed?
- Is the URL resolved correctly (relative → absolute)?
- Is there a fallback for null images?
- If images is an array, is a gallery component used?

**Filter/Pagination Audit:**

- Are all API filter parameters exposed in the UI?
- Is pagination functional (not just displayed)?
- Do filters reset pagination to page 1?

**Translation Audit (if applicable):**

- Does the view use a localization helper?
- Does it fall back to base language for null translations?
- Are ALL translatable fields localized (not just title)?

---

## Data Mapping Strategy

### Principle: Mirror, Don't Transform

The frontend data model MUST mirror the backend response. Do NOT rename fields, restructure objects, or invent intermediate data formats unless there is a concrete technical reason.

### Mapping Table Template

Every binding MUST produce a mapping table in this format:

```
| Backend Field     | Type          | List View | Detail View | Notes           |
|-------------------|---------------|-----------|-------------|-----------------|
| id                | number        | hidden    | hidden      | internal use    |
| title             | string        | card text | hero title  |                 |
| slug              | string        | route     | route param | URL navigation  |
| description       | string|null   | card text | section     |                 |
| content           | html|null     | —         | v-html      | sanitized       |
| featuredImage     | string|null   | card img  | hero img    | resolveImageUrl |
| images            | string[]      | —         | gallery     | carousel/grid   |
| features          | string[]      | —         | list items  | amenities/specs |
| price             | number|null   | card      | section     | formatted       |
| createdAt         | ISO string    | —         | metadata    | formatted date  |
| categories        | object[]      | chips     | chips+link  | relation        |
| tags              | object[]      | chips     | chips+link  | relation        |
| author            | object|null   | —         | byline      | name + avatar   |
```

### HTML Content Rendering

Fields with type `html` (e.g., `content`, `contentEn`) MUST be rendered with `v-html` directive. The backend already sanitizes HTML — do not double-sanitize, but NEVER use `v-html` on user-input fields that haven't been server-sanitized.

### JSON Array Fields

Fields with type JSON array (e.g., `features`, `images`) arrive as JavaScript arrays. Render as:
- `features` → `<ul>` with `<li v-for="...">`
- `images` → gallery/carousel component with `<img>` tags

### Date Formatting

Timestamps (`createdAt`, `updatedAt`, `publishedAt`, `projectDate`) arrive as ISO 8601 strings. Format for display using `Intl.DateTimeFormat` or a lightweight formatter. Do NOT install moment.js or date-fns for this purpose.

### Price Formatting

Numeric prices MUST be formatted with locale-appropriate separators and currency symbol:
```js
new Intl.NumberFormat('es-AR', { style: 'currency', currency: entity.currency || 'ARS' })
  .format(entity.price)
```

---

## Validation Checklist

This checklist MUST be completed and included in the binding documentation for every feature binding task.

### Structural Completeness

- [ ] Service file exists with all required HTTP functions
- [ ] Store file exists with state, actions, and error handling
- [ ] List view exists and renders all list-appropriate fields
- [ ] Detail view exists and renders ALL entity fields
- [ ] Routes registered with slug-based detail navigation
- [ ] Loading states displayed during fetch
- [ ] Error states displayed on failure
- [ ] Empty states displayed when no data exists

### Field Coverage

- [ ] Every API response field is either rendered or explicitly excluded with reason
- [ ] Translation fields use localization helper when locale is active
- [ ] Media fields use `resolveImageUrl()` for URL resolution
- [ ] HTML content fields use `v-html`
- [ ] JSON array fields are iterated and rendered individually
- [ ] Date fields are formatted for display
- [ ] Numeric fields are formatted appropriately (currency, units)

### Relations

- [ ] All embedded relations are rendered (categories, tags, author)
- [ ] Relation items are individually identifiable (names, links)
- [ ] Relation arrays handle empty state (no categories, no tags)

### Media

- [ ] `featuredImage` displayed prominently in both list and detail
- [ ] `images` array rendered as gallery in detail view
- [ ] `avatar` displayed inline where applicable
- [ ] Null images handled with fallback or graceful absence
- [ ] Image URLs resolved from relative to absolute paths

### Filters & Pagination

- [ ] All API-supported filters exposed as UI controls
- [ ] Filter changes trigger data re-fetch
- [ ] Pagination controls rendered when API returns pagination
- [ ] Page navigation triggers data re-fetch with correct params
- [ ] Filter changes reset to page 1

### Architecture Compliance

- [ ] No axios imports outside `src/config/api.js`
- [ ] No HTTP calls outside `src/services/`
- [ ] No JSON.parse in components or views
- [ ] Store manages all state — views are consumers only
- [ ] `x-client` header sent automatically via axios interceptor

---

## Output Format

### Code Deliverables

Every feature binding MUST produce these files (create if missing, modify if existing):

| File | Purpose |
|------|---------|
| `src/services/<feature>Service.js` | HTTP wrapper functions |
| `src/stores/<feature>.js` | Pinia store with state + actions |
| `src/views/<Feature>View.vue` | List view with cards, filters, pagination |
| `src/views/<Feature>DetailView.vue` | Full detail view with all sections |
| Router entry in `src/router/index.js` | List + detail routes |

### Component Deliverables (When Needed)

If the feature requires reusable components not already present:

| Component | When |
|-----------|------|
| `<Feature>Card.vue` | Card component used in list view (optional — can be inline) |
| `ImageGallery.vue` | When entity has `images` array and no gallery component exists |
| `FilterBar.vue` | When multiple filters need grouped UI (optional) |
| `Pagination.vue` | When paginated list needs controls and no pagination component exists |

### Code Standards

- Vue 3 Composition API (`<script setup>`) — no Options API.
- Pinia stores with setup syntax (`defineStore('name', () => { ... })`).
- Template refs and computed properties — no watchers unless strictly necessary.
- Semantic HTML elements (`<article>`, `<section>`, `<figure>`, `<nav>`, `<time>`).
- Scoped styles (`<style scoped>`) — no global styles from feature views.
- Lazy-loaded route components (`() => import(...)`) — no eager imports in router.

---

## Documentation Requirements

**Every feature binding MUST generate a documentation file.**

### File Location

```
/Documentation/<feature>-binding.md
```

### Required Sections

```markdown
# <Feature> — Feature Binding

## Summary
What was bound, which client frontend, and scope of work.

## API Contract
Endpoint(s) used, response shape (exact JSON), filters supported, pagination shape.

## Data Mapping Table
| Backend Field | Type | List View | Detail View | Notes |
|...|...|...|...|...|

## Fields Excluded (With Rationale)
| Field | Reason |
|...|...|

## Relations Handled
- Relation name → how it is rendered, where

## Media Handling
- Which fields, URL resolution strategy, fallback behavior

## Translation Support
- Which fields are localized, helper used, fallback behavior

## Files Created/Modified
| File | Action | Description |
|...|...|...|

## Filter & Pagination Implementation
- Filters exposed, pagination controls, state management

## Validation Checklist
(Completed checklist from above)

## Integration Instructions
- How to enable this binding for another tenant frontend
- Required .env values
- Required router registration
- Required store import
```

### No Exceptions

Every binding task produces this documentation. If the binding is trivial (e.g., adding one missing field), use a minimal version with Summary, Data Mapping Table, Files Modified, and Validation Checklist.

---

## Feature-Specific Binding Guides

### Properties Binding

Key considerations:
- `operationType` and `propertyType` are enum-like strings — render as filter dropdowns with translated labels
- `features` is a JSON array of amenity strings — render as chip/badge list
- `images` is a JSON array of file paths — full gallery required in detail view
- `price` + `currency` must be rendered together with proper formatting
- `m2` and `coveredM2` are numeric — display with unit suffix ("m²")
- `rooms` and `bathrooms` are numeric — display with icons or labels
- No translations — Spanish-only entity

### Blog (Posts) Binding

Key considerations:
- Has the MOST relations of any entity: `author`, `categories`, `tags`
- `content` is sanitized HTML — use `v-html`
- `excerpt` is for list view cards — `content` is for detail view
- `categories` and `tags` arrive as flat arrays (already flattened from join tables)
- Category/tag filtering is supported — link chips to filtered list views
- `status` filtering is admin-only — public list shows only PUBLISHED
- `publishedAt` is the display date — NOT `createdAt`
- SEO fields (`seoTitle`, `seoDescription`) feed `<head>` meta tags, not visible UI
- Full translation support (EN + DE) on all content fields

### Services Binding

Key considerations:
- `features` is a JSON array — render as bullet list or feature cards
- `content` is sanitized HTML — use `v-html` in detail view
- `showOnHome` is a boolean — used for home page section filtering, not displayed in UI
- `order` is a sort integer — use for display ordering, not displayed in UI
- `image` is a single image — not a gallery
- Full translation support (EN + DE)

### Projects Binding

Key considerations:
- `images` is a JSON array — full gallery in detail view
- `content` is sanitized HTML — use `v-html`
- `category` is a plain string (NOT a relation) — render as filter and label
- `location` and `year` are metadata — display in a metadata section
- `laminateType` is domain-specific — display when non-null
- `instagramPostUrl` — render as external link/embed when non-null
- `featured` is a boolean — used for home page filtering
- Full translation support (EN + DE)

### Testimonials Binding

Key considerations:
- `rating` is 1-5 integer — render as stars or equivalent visual
- `avatar` is optional — use placeholder when null
- `featured` is for filtering — typically used on home page
- No translations, no complex relations
- Simplest entity to bind

---

## Anti-Patterns (Explicit Failures)

These are known failure modes this skill exists to prevent:

| Anti-Pattern | Consequence | Correct Approach |
|-------------|-------------|------------------|
| Rendering `featuredImage` but ignoring `images` array | Gallery data lost | Render both: hero image + full gallery |
| Displaying `title` and `description` but skipping `content` in detail | Rich content invisible | Detail view must render full HTML content |
| Ignoring `categories` and `tags` on blog posts | Navigation and discoverability broken | Render as clickable chips in both list and detail |
| Hardcoding filter options (e.g., propertyType values) | Out of sync with actual data | Derive filter options from API data or use API-provided enums |
| Importing axios directly in a view file | Violates architecture layering | Always go through service → store → view |
| Skipping loading/error states | Blank screen during fetch, silent failures | Every async operation needs loading + error states |
| Using `images[0]` as the only image | Gallery reduced to single image | Iterate full array in a gallery component |
| Ignoring translation fields when locale system exists | Partial i18n | Apply localization helper to ALL translatable fields |
| Not handling null fields | Template crashes on `null.length` or `undefined.map` | Use optional chaining, fallback defaults, `v-if` guards |
| Mixing CMS content and feature data in same fetch | Architectural contamination | CMS via `contentStore.get()`, feature data via dedicated store |
| Using `<img :src="post.featuredImage">` without `resolveImageUrl()` | Broken images — relative path rendered directly | Always `<img :src="resolveImageUrl(post.featuredImage)">` |
| Assuming media paths start with `/uploads/` | Breaks on V3 `/media/{tenant}/` paths | Treat paths as opaque — let `resolveImageUrl()` handle |
| Parsing or reconstructing media paths in frontend | Duplicates backend logic, fragile | Frontend only prepends `API_URL` via `resolveImageUrl()` |
