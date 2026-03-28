---
name: pegasuz-frontend-normalization
description: 'Normalize client frontends to Pegasuz architecture before feature binding. Detects anti-patterns, missing layers, and structural violations, then produces refactoring actions. Use before running Feature Binding on any client codebase.'
---

# Pegasuz Frontend Normalization & Refactor — System Preparation Skill

## Skill Name

**pegasuz-frontend-normalization**

## Purpose

Normalize and refactor an existing client frontend codebase so that it conforms to the Pegasuz integration architecture before any feature binding occurs. This skill detects structural anti-patterns, mislocated files, missing layers, and architectural violations — then produces concrete refactoring actions that bring the codebase into compliance without altering UI design or removing features.

This is NOT a feature implementation skill. It does NOT add new functionality.
This is NOT a UI/UX skill. It does NOT change visual appearance.

This is a **system preparation skill**. It restructures code so that downstream skills (Feature Binding, Validation QA, Integrator) can operate reliably.

---

## Core Principle

No feature can be reliably integrated on top of inconsistent architecture.

The frontend MUST be standardized BEFORE binding. If the `View → Store → Service → API` chain is broken, Feature Binding will produce incorrect results, and Validation QA will report false defects caused by structural issues rather than missing data.

---

## Target Architecture (Locked)

```
View → Store → Service → API (single axios instance) → Backend
                                                         ↓
                                                    x-client header
                                                         ↓
                                                   clientResolver
                                                         ↓
                                                   Tenant Database
```

### Required File Structure

```
src/
├── config/
│   └── api.js              ← Single axios instance + resolveImageUrl()
├── services/
│   └── <entity>Service.js   ← One file per entity, imports from @/config/api
├── stores/
│   ├── content.js           ← CMS bootstrap store
│   └── <entity>.js          ← One Pinia store per entity, imports from services
├── views/                   ← (NOT pages/)
│   ├── <Entity>View.vue     ← List view, imports from stores
│   └── <Entity>DetailView.vue ← Detail view, imports from stores
├── components/              ← Reusable UI components
├── composables/             ← Shared composition functions (optional)
├── router/
│   └── index.js             ← Lazy-loaded routes with scrollBehavior
├── main.js                  ← Pinia setup + CMS bootstrap before mount
└── App.vue
```

### Required Environment Variables

```
VITE_API_URL=https://api.pegasuz.com.ar
VITE_CLIENT_SLUG=<client-slug>
```

---

## Input

| Input | Description |
|-------|-------------|
| Client slug | Identifies the target frontend: `Clientes/<slug>/` |
| Existing codebase | Agent reads all source files in the client frontend |

---

## Known Anti-Patterns (From Real Codebase Audit)

These anti-patterns have been observed across actual Pegasuz client frontends. This is the exhaustive reference for detection.

### AP-1 — API Config Mislocated

| Client | Observed Location | Required Location |
|--------|------------------|-------------------|
| argpiscinas | `src/services/api.js` | `src/config/api.js` |
| gentilenataliainmobiliaria | `src/api/api.js` | `src/config/api.js` |

**Detection:** Check if `src/config/api.js` exists. If not, search for axios instance creation in `src/services/`, `src/api/`, `src/lib/`, or `src/utils/`.

**Impact:** Import paths across ALL files referencing the API config are wrong. Feature Binding Skill expects `@/config/api`.

### AP-2 — Hardcoded Client Slug

| Client | Observed |
|--------|----------|
| argpiscinas | `headers: { 'x-client': 'argpiscinas' }` in api.js |

**Detection:** Search for string literals matching any tenant slug inside `src/` source files (excluding `.env` files). Specifically check the `x-client` header value in the axios instance.

**Impact:** Breaks multi-tenant portability. Feature Binding Skill templates expect `VITE_CLIENT_SLUG`.

### AP-3 — Stores Call API Directly (Bypass Service Layer)

| Client | Observed |
|--------|----------|
| argpiscinas | `import api from '@/services/api'` in stores, then `api.get('/posts')` |
| gentilenataliainmobiliaria | `import api from '@/api/api'` in stores, then `api.get('/posts')` |

**Detection:** In store files, search for imports of the API config module (any path — `api`, `services/api`, `config/api`). If a store imports the axios instance directly and calls `.get()`, `.post()`, etc., the service layer is bypassed.

**Impact:** Violates `View → Store → Service → API`. Service layer becomes dead code or doesn't exist. Response extraction logic ends up duplicated across stores.

### AP-4 — JSON.parse in Views/Components

| Client | File | Observed |
|--------|------|----------|
| argpiscinas | ProjectsView.vue | `JSON.parse(rawImages)` |
| argpiscinas | HomeView.vue | `typeof project.images === 'string' ? JSON.parse(project.images) : project.images` |
| gentilenataliainmobiliaria | PropertyDetailView.vue | `const parsed = JSON.parse(val)` |

**Detection:** Search all `.vue` files for `JSON.parse`. Any occurrence is a violation.

**Impact:** Data transformation belongs in services or stores. Views receive ready-to-render data.

### AP-5 — Defensive Response Extraction Chains

| Client | Observed |
|--------|----------|
| gentilenataliainmobiliaria | `res.data?.post || res.data?.data || res.data || null` |
| argpiscinas | `data.projects || data` |

**Detection:** Search stores for OR chains on `response.data` (`||` with multiple property accesses).

**Impact:** Indicates the developer was unsure of the API response shape. The correct response shape is documented in the Feature Binding Skill's Backend Entity Reference.

### AP-6 — Missing or Incorrect resolveImageUrl() (BLOCKING)

| Client | Status |
|--------|--------|
| argpiscinas | ⚠️ Present but uses simple prepend (pre-V3) |
| gentilenataliainmobiliaria | ⚠️ Present but uses legacy query param only |
| larucula | ❌ Missing |
| gncbahiablanca | ❌ Missing |
| lavaderoartesanal | ✅ V3 canonical implementation |

**Detection:** Search `src/config/api.js` or `src/services/api.js` for `resolveImageUrl` export. If found, verify it handles ALL 5 path formats (not just simple prepend).

**Impact:** Image rendering breaks or produces 404s. A simplified `resolveImageUrl` that only prepends `API_URL` will break on bare relative paths like `posts/slug/img.webp` → missing `/media/` route and `?tenant=` query.

**CRITICAL:** The V3 canonical `resolveImageUrl()` is the ONLY accepted implementation. See the api.js template below for the full function.

### AP-7 — Static Route Imports (No Lazy-Loading)

| Client | Observed |
|--------|----------|
| gentilenataliainmobiliaria | `import HomeView from '../views/HomeView.vue'` for ALL routes |

**Detection:** In `router/index.js`, check if route `component` values use `() => import(...)` (lazy) or direct imports (static).

**Impact:** All views are bundled in a single chunk, increasing initial load time.

### AP-8 — Missing Pinia Setup

| Client | Observed |
|--------|----------|
| larucula | `createApp(App).use(router).mount('#app')` — no Pinia |
| gncbahiablanca | No Pinia import |
| lavaderoartesanal | No Pinia import |

**Detection:** In `main.js`, check for `createPinia()` and `.use(pinia)`.

**Impact:** Stores cannot function. Feature Binding Skill requires Pinia stores.

### AP-9 — Missing CMS Bootstrap

| Client | Observed |
|--------|----------|
| larucula | No CMS bootstrap before mount |
| gncbahiablanca | No CMS bootstrap |
| lavaderoartesanal | No CMS bootstrap |

**Detection:** In `main.js`, check for `contentStore.bootstrapContent()` (or equivalent) called BEFORE `app.mount()`.

**Impact:** CMS-driven content (site name, hero text, section labels) is unavailable at render time.

### AP-10 — Pages Instead of Views

| Client | Observed |
|--------|----------|
| larucula | `src/pages/BlogPage.vue` instead of `src/views/BlogView.vue` |

**Detection:** Check if `src/pages/` directory exists. All view components should be in `src/views/`.

**Impact:** Naming inconsistency breaks conventions expected by Feature Binding Skill.

### AP-11 — Duplicate Source Directories

| Client | Observed |
|--------|----------|
| larucula | `larucula/src/` AND `larucula/larucula/src/` both exist |

**Detection:** Check for nested directories that mirror the project structure (e.g., `<slug>/<slug>/src/`).

**Impact:** Unclear which source is active. Old code may be imported accidentally.

### AP-12 — Missing Environment File

| Client | Observed |
|--------|----------|
| gncbahiablanca | No `.env` file |
| lavaderoartesanal | No `.env` file |

**Detection:** Check for `.env`, `.env.local`, or `.env.production` in project root.

**Impact:** `VITE_API_URL` and `VITE_CLIENT_SLUG` are undefined. API calls fail or use fallback URLs.

### AP-13 — Relative Imports Instead of Path Aliases

| Client | Observed |
|--------|----------|
| gentilenataliainmobiliaria | `import api from '../api/api'` |

**Detection:** Search for `../` import paths in service, store, and view files that reference API, service, or store modules.

**Impact:** Fragile imports that break when files move. `@/` alias should be used.

### AP-14 — Services Exist But Are Not Used

| Client | Observed |
|--------|----------|
| gentilenataliainmobiliaria | `postService.js`, `projectService.js` exist, but stores import `api` directly |

**Detection:** Service files exist in `src/services/` but no store imports them.

**Impact:** Dead code. The service layer is architecturally present but functionally bypassed.

### AP-15 — Skeleton/Template Projects

| Client | Observed |
|--------|----------|
| gncbahiablanca | Empty router, counter.js store, no views, no services |
| lavaderoartesanal | Single home route, counter.js store, no API integration |

**Detection:** Router has 0–1 routes. Only store is `counter.js`. No `src/services/` directory. No `.env` file.

**Impact:** Needs full bootstrapping, not normalization. Identify as "scaffold required" and generate baseline structure.

### AP-16 — Stores Without Loading/Error State

**Detection:** In store files, check for `loading` and `error` refs. If a store has fetch actions but no `loading = ref(false)` and `error = ref(null)`, it is missing reactive UI feedback.

**Impact:** Views cannot show loading spinners or error messages. Feature Binding Skill requires every store to expose `loading` and `error` state. Validation QA flags this as a BLOCKING defect in Layer 3.

**Fix:** Add `const loading = ref(false)` and `const error = ref(null)` to the store. Wrap every async action in `loading.value = true` / `finally { loading.value = false }` and `catch { error.value = err.message }`.

### AP-17 — CMS Data Used for Feature Entities

**Detection:** In view files, search for `contentStore.get()` or `contentStore.getJSON()` calls that retrieve feature entity data (properties, services, projects, posts, testimonials). CMS content (`contentStore`) should ONLY be used for site-level content (site name, hero text, section labels, branding). Feature data MUST come from dedicated feature stores.

**Impact:** Architectural contamination. Feature data becomes unfiltered, unpaginated, and coupled to the CMS bootstrap. Violates the separation between CMS content and feature data mandated by the locked architecture.

**Fix:** Replace `contentStore.get/getJSON` calls for entity data with proper feature store usage. Create the feature store + service if they don't exist.

---

## Execution Mode

| Mode | Behavior | Default |
|------|----------|--------|
| **PLAN** | Detect anti-patterns + propose changes. No files are modified. | ✅ Default |
| **EXECUTE** | Apply all proposed changes to disk. | Must be explicitly requested |

If mode is not specified, assume **PLAN**.

PLAN mode produces the full Normalization Summary, Anti-Patterns Detected, and Files Modified tables — but the "Action" column in Files Modified reads `WILL CREATE`, `WILL MODIFY`, `WILL DELETE` instead of `CREATED`, `MODIFIED`, `DELETED`. The user reviews the plan and explicitly requests EXECUTE to proceed.

---

## Scope Limit

Refactor ONLY files directly involved in detected anti-patterns.

Do NOT refactor the entire codebase unless classification = **Non-Standard** or **Scaffold**.

Minimize changes to only what is required for normalization. If a file does not contain an anti-pattern and is not an import target of a relocated file, do not touch it.

**Scope rules:**
- **Misaligned** projects: modify only files containing anti-patterns + files that import from relocated modules.
- **Non-Standard** projects: full restructure is permitted (architecture diverges entirely).
- **Scaffold** projects: generate only the baseline files — do not modify existing views or components.

---

## Confirmation Threshold

If a normalization execution will modify **more than 10 files**, the agent MUST:

1. Present the full list of files and proposed actions.
2. State the total count: "This will modify N files."
3. Wait for explicit user confirmation before proceeding.

This applies in EXECUTE mode only. PLAN mode never modifies files and does not require confirmation.

This threshold is additive to R6 (Confirm Destructive Actions) — destructive actions always require confirmation regardless of file count.

---

## Execution Workflow

### Step 1 — Structural Audit

Read the entire frontend source tree and classify the project:

| Classification | Criteria | Action |
|---------------|----------|--------|
| **Scaffold** | No API config, no services, no stores (beyond counter.js), ≤1 route | Generate baseline structure from scratch (Step 2A) |
| **Non-Standard** | API integration exists but architecture diverges (composables instead of stores, pages instead of views, mock data instead of API) | Full restructure (Step 2B) |
| **Misaligned** | Architecture is close but has specific anti-patterns (API mislocated, stores bypass services, JSON.parse in views) | Targeted fixes (Step 2C) |
| **Compliant** | All layers present, correct locations, correct patterns | No refactoring needed — report compliance |

Produce the audit using this checklist:

```
□ src/config/api.js exists
□ Single axios instance created
□ x-client header uses VITE_CLIENT_SLUG (not hardcoded)
□ resolveImageUrl() exported
□ Auth interceptor present
□ .env has VITE_API_URL and VITE_CLIENT_SLUG
□ src/services/ directory exists with entity services
□ Services import from @/config/api
□ No API calls outside src/services/
□ src/stores/ directory exists with entity stores
□ Stores import from services (not API directly)
□ Stores have loading + error state (AP-16)
□ No JSON.parse in views or components
□ Views import from stores only
□ No contentStore.get/getJSON for feature entity data (AP-17)
□ Views are in src/views/ (not src/pages/)
□ Router uses lazy-loaded imports
□ Router has list + detail routes per feature
□ main.js creates Pinia and uses it
□ main.js bootstraps CMS before mount
□ No hardcoded slugs in source files
□ No relative imports for cross-layer modules
□ No duplicate source directories
```

### Step 2A — Generate Baseline (Scaffold Classification)

Create the minimum required files from templates:

**1. `src/config/api.js`:**
```js
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.pegasuz.com.ar'
const CLIENT_SLUG = import.meta.env.VITE_CLIENT_SLUG

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'x-client': CLIENT_SLUG }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

/**
 * Media V3 — resolves any image path to a full URL.
 * Handles: absolute URLs, V3 canonical, legacy /media/, legacy /uploads/, bare relative.
 * NEVER simplify this function — a simple API_URL + path prepend breaks bare relative paths.
 */
export function resolveImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const CLIENT_SLUG = import.meta.env.VITE_CLIENT_SLUG || ''

  // V3 canonical: /media/{tenant}/...
  if (path.startsWith(`/media/${CLIENT_SLUG}/`)) {
    return `${API_URL}${path}`
  }

  // /media/ with tenant already in query
  if (path.startsWith('/media/')) {
    if (path.includes('tenant=')) return `${API_URL}${path}`
    const sep = path.includes('?') ? '&' : '?'
    return `${API_URL}${path}${sep}tenant=${CLIENT_SLUG}`
  }

  // Legacy /uploads/ → proxy through /media/
  if (path.startsWith('/uploads/') || path.startsWith('uploads/')) {
    const normalized = path.startsWith('/') ? path : `/${path}`
    return `${API_URL}/media${normalized}?tenant=${CLIENT_SLUG}`
  }

  // Bare relative path → /media/{path}?tenant=
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_URL}/media${normalized}?tenant=${CLIENT_SLUG}`
}

export default api
```

**2. `src/stores/content.js`:**
```js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/config/api'

export const useContentStore = defineStore('content', () => {
  const contents = ref([])
  const loaded = ref(false)

  async function bootstrapContent() {
    if (loaded.value) return
    try {
      const { data } = await api.get('/site-contents')
      contents.value = data.contents || data || []
      loaded.value = true
    } catch (err) {
      console.error('CMS bootstrap failed:', err)
    }
  }

  function get(key, fallback = '') {
    const item = contents.value.find((c) => c.key === key)
    return item?.value ?? fallback
  }

  function getJSON(key, fallback = null) {
    const raw = get(key, null)
    if (!raw) return fallback
    try {
      return JSON.parse(raw)
    } catch {
      return fallback
    }
  }

  return { contents, loaded, bootstrapContent, get, getJSON }
})
```

**3. `main.js` (updated):**
```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useContentStore } from '@/stores/content'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const contentStore = useContentStore()
await contentStore.bootstrapContent()

app.mount('#app')
```

**4. `.env`:**
```
VITE_API_URL=https://api.pegasuz.com.ar
VITE_CLIENT_SLUG=<slug>
```

**5. Router (if empty):**
Add `scrollBehavior` and a placeholder home route with lazy import.

### Step 2B — Full Restructure (Non-Standard Classification)

For codebases that use a different pattern (composables instead of stores, pages instead of views, mock data instead of API):

1. **Identify active data sources** — map every data-fetching call (CMS, mock, composable, direct API).
2. **Create missing layers** — for each entity that has data flowing to a view:
   - Create `src/services/<entity>Service.js` importing from `@/config/api`
   - Create `src/stores/<entity>.js` importing from the service
3. **Rename `src/pages/` to `src/views/`** — update all imports and router references.
4. **Migrate composable logic to stores** — move state management from composables into Pinia stores. Composables that provide non-state utilities (animations, scroll logic) remain.
5. **Update router imports** — point to new `src/views/` paths.
6. **Setup Pinia in `main.js`** if missing.
7. **Add CMS bootstrap** if missing.
8. **Remove duplicate source directories** — identify the active `src/` and delete the obsolete one (confirm with user before deletion).

### Step 2C — Targeted Fixes (Misaligned Classification)

For codebases that are close but have specific anti-patterns:

**Fix order (dependency-safe):**

1. **AP-1: Relocate API config** → Move file to `src/config/api.js`. Update ALL imports across the project.
2. **AP-2: Remove hardcoded slug** → Replace string literal with `import.meta.env.VITE_CLIENT_SLUG`. Add to `.env` if missing.
3. **AP-6: Add resolveImageUrl()** → Add export to `src/config/api.js` if missing.
4. **AP-12: Create .env** → Add `VITE_API_URL` and `VITE_CLIENT_SLUG`.
5. **AP-13: Fix relative imports** → Replace `../api/api`, `../services/api` with `@/config/api`.
6. **AP-3: Extract service layer** → For each store that calls `api.get()` directly:
   - Create `src/services/<entity>Service.js` with functions that wrap the API calls.
   - Update store to import from service instead of API config.
7. **AP-4: Remove JSON.parse from views** → Move parsing logic to store computed properties or service response mapping.
8. **AP-5: Fix response extraction** → Replace defensive OR chains with the correct extraction pattern per entity (see Response Extraction Reference below).
9. **AP-7: Convert to lazy imports** → Replace `import X from '../views/X.vue'` with `() => import('@/views/X.vue')` in router.
10. **AP-8: Setup Pinia** in `main.js` if missing.
11. **AP-9: Add CMS bootstrap** in `main.js` if missing.
12. **AP-14: Wire unused services** → If services exist but stores don't use them, update store imports.
13. **AP-16: Add loading/error state** → For each store missing `loading` and `error` refs, add them with proper try/catch/finally in async actions.
14. **AP-17: Separate CMS from feature data** → For each view using `contentStore.get/getJSON` to retrieve feature entity data (properties, services, projects, posts, testimonials), replace with dedicated feature store. Create the feature store + service if they don't exist.

---

## Response Extraction Reference

Stores MUST extract API responses using the correct pattern per entity. No defensive OR chains.

| Entity | API Wrapper | Store Extraction |
|--------|------------|-----------------|
| Posts | `{ posts: [...], pagination: {...} }` | `items = data.posts` / `pagination = data.pagination` |
| Projects | `{ projects: [...], pagination: {...} }` | `items = data.projects` / `pagination = data.pagination` |
| Contacts | `{ contacts: [...], pagination: {...} }` | `items = data.contacts` / `pagination = data.pagination` |
| Testimonials | `{ testimonials: [...], pagination: {...} }` | `items = data.testimonials` / `pagination = data.pagination` |
| Services | Direct array | `items = data` |
| Properties | Direct array | `items = data` |
| Categories | Direct array | `items = data` |
| Tags | Direct array | `items = data` |
| Menu | Direct array (nested categories → items) | `items = data` |
| Media | Direct array | `items = data` |
| SiteContent | `{ tenant, version, contents: [...] }` | `contents = data.contents || data` |

---

## Service Template

When creating or fixing a service file:

```js
import api from '@/config/api'

export async function fetch<Entities>(params = {}) {
  const { data } = await api.get('/<endpoint>', { params })
  return data
}

export async function fetch<Entity>BySlug(slug) {
  const { data } = await api.get(`/<endpoint>/${slug}`)
  return data
}
```

**Rules:**
- Import ONLY from `@/config/api`.
- Return `data` (the axios response body), not `response`.
- Pass `params` as second argument for filters/pagination.
- One file per entity: `postService.js`, `projectService.js`, `propertyService.js`, etc.
- Do NOT name a service `serviceService.js`. Use the entity's name: for the "services" feature, name it `serviceEntityService.js` or `servicesService.js`.

---

## Store Template

When creating or fixing a store:

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetch<Entities>, fetch<Entity>BySlug } from '@/services/<entity>Service'

export const use<Entity>Store = defineStore('<entity>', () => {
  const items = ref([])
  const currentItem = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref(null) // Only for paginated entities

  async function loadItems(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await fetch<Entities>(params)
      items.value = data.<entities> ?? data  // Use correct extraction per entity
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
      currentItem.value = await fetch<Entity>BySlug(slug)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return { items, currentItem, loading, error, pagination, loadItems, loadBySlug }
})
```

**Rules:**
- Import from services, NEVER from `@/config/api`.
- ALWAYS include `loading` and `error` refs.
- Include `pagination` ref only for paginated entities (Posts, Projects, Contacts, Testimonials).
- JSON parsing of array fields (images, features) happens here, not in views.
- Use Composition API style (`defineStore('name', () => { ... })`).

---

## Rules

### R1 — Do NOT Change UI Design

This skill restructures code, not appearance. Component templates remain visually identical. If a view renders a card with title and image, it continues rendering a card with title and image after refactoring.

### R2 — Do NOT Remove Features

Every data flow that exists before refactoring MUST continue to work after. If a view displays blog posts from an API call, the refactored version displays the same blog posts — but through the correct `View → Store → Service → API` chain.

### R3 — Do NOT Break Existing Functionality

Refactoring is purely structural. After normalization:
- The same routes exist.
- The same views render.
- The same data appears.
- The same interactions work.

If a refactoring step would break a visible feature, the step is deferred and documented as a known deviation.

### R4 — Imports Are All-Or-Nothing

When relocating a file (e.g., moving `src/services/api.js` to `src/config/api.js`), ALL import references across the entire project MUST be updated in the same operation. A partial update leaves the project in a broken state.

### R5 — One Anti-Pattern at a Time

Fixes are applied in the dependency order defined in Step 2C. API config location is fixed before service extraction. Service extraction is done before store rewiring. This prevents circular dependency issues.

### R6 — Confirm Destructive Actions

Before deleting duplicate directories (AP-11), removing old files, or renaming `pages/` to `views/`, the agent MUST confirm with the user. These are irreversible and may affect in-progress work.

Additionally, if the total number of files to be modified exceeds 10, the agent MUST present the full change list and wait for user confirmation before executing (see Confirmation Threshold).

### R7 — Environment Safety

NEVER commit `.env` files containing production secrets. The `.env` file created by this skill uses the standard API URL and client slug — no passwords, tokens, or credentials.

### R8 — Preserve Existing Enhancements

If the client has features beyond the standard template (e.g., argpiscinas has `resolveOptimizedImageSources()`, larucula has dynamic meta tags in the router), these MUST be preserved. Normalization standardizes the architecture — it does not strip client-specific extras.

### R9 — Create Missing Directories

If `src/config/`, `src/services/`, or `src/stores/` directories don't exist, create them. Don't skip a normalization step because the target directory is absent.

### R10 — Client Classification Determines Scope

A **Scaffold** project gets a baseline generation (Step 2A).
A **Non-Standard** project gets full restructuring (Step 2B).
A **Misaligned** project gets targeted fixes (Step 2C).
A **Compliant** project gets no changes — only a compliance report.

NEVER apply scaffold generation templates to a misaligned project that already has working stores and views. Target only the specific anti-patterns.

---

## Output Format

### 1. Normalization Summary

```markdown
## Normalization Summary

- **Client:** <slug>
- **Classification:** Scaffold | Non-Standard | Misaligned | Compliant
- **Anti-Patterns Detected:** N
- **Anti-Patterns Fixed:** M
- **Status:** NORMALIZED | PARTIAL | COMPLIANT (no changes needed)
```

### 2. Anti-Patterns Detected

```markdown
## Anti-Patterns Detected

| # | Code | Description | Severity | Files Affected |
|---|------|-------------|----------|----------------|
| 1 | AP-1 | API config in src/services/ instead of src/config/ | CRITICAL | services/api.js, 11 importers |
| 2 | AP-3 | Stores call API directly, bypassing service layer | MAJOR | stores/posts.js, stores/projects.js |
| 3 | AP-4 | JSON.parse in views | MAJOR | views/ProjectsView.vue:328, views/HomeView.vue:854 |
```

### 3. Files Modified

```markdown
## Files Modified

| File | Action | Description |
|------|--------|-------------|
| src/config/api.js | CREATED | Moved from src/services/api.js |
| src/services/api.js | DELETED | Relocated to src/config/api.js |
| src/services/postService.js | CREATED | Extracted from stores/posts.js |
| src/stores/posts.js | MODIFIED | Now imports from postService instead of API |
| src/views/ProjectsView.vue | MODIFIED | Removed JSON.parse, uses store computed |
| .env | CREATED | Added VITE_API_URL and VITE_CLIENT_SLUG |
```

### 4. New Structure

```markdown
## New Structure

src/
├── config/
│   └── api.js              ✅ Single axios instance + resolveImageUrl
├── services/
│   ├── postService.js       ✅ NEW — extracted from store
│   ├── projectService.js    ✅ NEW — extracted from store
│   └── ...
├── stores/
│   ├── content.js           ✅ CMS bootstrap
│   ├── posts.js             ✅ FIXED — imports from service
│   ├── projects.js          ✅ FIXED — imports from service
│   └── ...
├── views/
│   ├── BlogView.vue         ✅ No JSON.parse
│   └── ...
├── router/
│   └── index.js             ✅ Lazy-loaded imports
├── main.js                  ✅ Pinia + CMS bootstrap
└── .env                     ✅ VITE_API_URL + VITE_CLIENT_SLUG
```

### 5. Remaining Deviations (If Any)

```markdown
## Remaining Deviations

| # | Issue | Reason Deferred | Recommendation |
|---|-------|----------------|----------------|
| 1 | larucula mock data still in use | No backend API for menu items yet | Bind menu feature via Feature Binding Skill when ready |
```

---

## Constraints

### Hard Constraints

1. `View → Store → Service → API` chain MUST be intact after normalization.
2. `src/config/api.js` is the ONLY file that imports axios directly.
3. Services are the ONLY files that import from `@/config/api`.
4. Stores are the ONLY files that import from services.
5. Views NEVER contain `JSON.parse`, `axios`, `api.get()`, or direct service calls.
6. UI appearance is identical before and after normalization.

### Forbidden Actions

- Changing component template structure for design purposes.
- Adding new features, endpoints, or entity types.
- Removing existing routes, views, or data flows.
- Installing new npm packages (unless Pinia is missing — `pinia` may be installed).
- Modifying backend code.
- Hardcoding values that should come from environment variables.
- Committing `.env` files with secrets.

---

## Integration With Other Skills

### Upstream: Runs Before

| Skill | Why |
|-------|-----|
| Feature Binding | Binding assumes `View → Store → Service → API` chain exists. Normalization ensures it does. |
| Validation QA | QA validates field coverage across layers. If layers are missing or miswired, QA reports false structural defects. |
| Integrator | Phase 4 (Frontend Scaffolding Verification) delegates to this skill when anti-patterns are detected. |

### Downstream: Enables

| Skill | What It Can Now Do |
|-------|--------------------|
| Feature Binding | Create service + store + views with correct imports and patterns |
| Validation QA | Audit field coverage across properly structured layers |
| Documentation System | Document normalization as a refactoring report |

### Invocation by Integrator

When the Integrator reaches Phase 4 (Frontend Scaffolding Verification) and detects anti-patterns, it invokes this skill to normalize the codebase before proceeding to Phase 5 (Feature Binding).

This skill returns:
- Classification (Scaffold / Non-Standard / Misaligned / Compliant)
- List of anti-patterns detected and fixed
- Updated file structure
- Remaining deviations (if any)

The Integrator proceeds to Phase 5 ONLY if this skill reports status NORMALIZED or COMPLIANT.

---

## Quick Reference — Normalization Checklist

```
□ API Config
  □ File at src/config/api.js
  □ Single axios.create() call
  □ x-client from VITE_CLIENT_SLUG
  □ Auth interceptor (request)
  □ 401 interceptor (response)
  □ resolveImageUrl() exported
  □ No other file creates axios instances

□ Environment
  □ .env exists with VITE_API_URL
  □ .env exists with VITE_CLIENT_SLUG
  □ No hardcoded slugs in source files

□ Service Layer
  □ src/services/ directory exists
  □ One file per feature entity
  □ Each imports from @/config/api
  □ Each returns data (not response)
  □ No business logic in services

□ Store Layer
  □ src/stores/ directory exists
  □ content.js with bootstrapContent(), get(), getJSON()
  □ One store per feature entity
  □ Each imports from services (not API)
  □ Each has loading + error refs
  □ Correct response extraction (no OR chains)
  □ JSON parsing happens here (not in views)

□ View Layer
  □ All views in src/views/ (not pages/)
  □ Views import from stores only
  □ No JSON.parse in any .vue file
  □ No axios or api imports in any .vue file
  □ No direct service calls in any .vue file

□ Router
  □ All routes use lazy imports: () => import(...)
  □ scrollBehavior configured
  □ List + detail routes per feature

□ Bootstrap
  □ main.js creates Pinia
  □ main.js calls bootstrapContent() before mount
  □ App uses both Pinia and router
```
