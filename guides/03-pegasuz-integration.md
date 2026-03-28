# Guide: Pegasuz Integration

> Guia especifica para clientes dentro del ecosistema Pegasuz multi-tenant.
> **Prerequisito:** Familiaridad con Vue 3 y el concepto de multi-tenancy.
> **Contexto:** Leer [01-pipeline-overview](01-pipeline-overview.md) para el pipeline general.

---

## Que es Pegasuz

Plataforma SaaS multi-tenant. Backend centralizado (Node.js + Express + Prisma + MySQL) sirviendo multiples clientes, cada uno con su propia base de datos y frontend Vue 3.

**Cada cliente tiene:**
- Su propia base de datos MySQL
- Su propio frontend Vue 3
- Un slug unico que identifica al tenant (`x-client` header)
- Feature flags que controlan que funcionalidad tiene habilitada

---

## Arquitectura locked

```
FRONTEND (Vue 3)                              BACKEND (Node.js)
==================                            ==================

  View.vue                                    HTTP Request
     |                                             |
     v                                        x-client header
  Pinia Store                                      |
     |                                             v
     v                                        clientResolver middleware
  Service (src/services/)                          |
     |                                             v
     v                                        prismaManager.getPrisma(db_name)
  api.js (axios + x-client)  ─── HTTP ───>         |
                                                   v
                                              Controller -> Service -> Prisma
                                                   |
                                                   v
                                              Tenant Database (MySQL)
```

**Regla inviolable:** La cadena `View -> Store -> Service -> API` no se rompe nunca. Sin atajos.

---

## Pipeline completo de onboarding (Phases 0-7)

### Phase 0: Analizar request

**Skill:** `pegasuz-integrator`

Antes de tocar codigo, analizar que necesita el cliente:

```
Input: "Nuevo cliente: Restaurante Nonna, necesita menu, reservas, galeria, blog"

Output (task breakdown):
  - Provisionar tenant con slug "nonna"
  - Features: menu, media, blog, messages (para reservas)
  - Frontend: 5 paginas (home, menu, galeria, blog, contacto)
  - 3D: Tier 1 (shader atmosferico)
```

### Phase 1: Provisionar cliente

```bash
# Crear el tenant en Pegasuz Core
curl -X POST http://localhost:3000/api/core-admin/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "Restaurante Nonna",
    "slug": "nonna",
    "database_name": "pegasuz_nonna",
    "admin_email": "admin@nonna.com",
    "admin_password": "SecurePassword123"
  }'

# Respuesta esperada: { "id": 5, "slug": "nonna", ... }
```

### Phase 2: Configurar feature flags

```bash
# Habilitar las features que necesita este cliente
curl -X POST http://localhost:3000/api/core-admin/clients/5/features \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "features": ["menu", "media", "blog", "messages", "content", "settings"]
  }'
```

**Features disponibles en Pegasuz:**
```
properties    services    projects    blog
collections   categories  tags        media
messages      settings    analytics   translations
menu          content
```

### Phase 3: Verificar endpoints

Para CADA feature habilitada, verificar que el endpoint responde:

```bash
# Verificar cada feature
curl -H "x-client: nonna" http://localhost:3000/api/menu
# Debe responder 200 con data (array o objeto)

curl -H "x-client: nonna" http://localhost:3000/api/media
# Debe responder 200

curl -H "x-client: nonna" http://localhost:3000/api/posts
# Debe responder 200 con { posts: [], pagination: {...} }

curl -H "x-client: nonna" http://localhost:3000/api/content
# Debe responder 200 con { tenant, version, contents: [...] }

# Si algun endpoint responde 404, el feature flag no esta activo
# Si responde 401, falta el x-client header
```

### Phase 4: Scaffold frontend

**Skill:** `pegasuz-frontend-normalization`

```bash
# Copiar scaffold base
cp -r /path/to/maqueta/_project-scaffold /path/to/Clientes/nonna

cd /path/to/Clientes/nonna

# Configurar .env
cat > .env << 'EOF'
VITE_API_URL=http://localhost:3000
VITE_CLIENT_SLUG=nonna
EOF

npm install
npm run dev
# Verificar que arranca en http://localhost:5173
```

**Configurar `src/config/api.js`:**

```js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: {
    'x-client': import.meta.env.VITE_CLIENT_SLUG
  }
})

export function resolveImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${import.meta.env.VITE_API_URL}${path}`
}

export default api
```

### Phase 5: Feature binding

**Skill:** `pegasuz-feature-binding`

Para cada feature, crear la cadena completa: Service -> Store -> View.

**5.1 Service (`src/services/<entity>Service.js`):**

```js
// src/services/menuService.js
import api from '@/config/api'

export default {
  async getAll() {
    const { data } = await api.get('/menu')
    return data
  },
  async getById(id) {
    const { data } = await api.get(`/menu/${id}`)
    return data
  }
}
```

**5.2 Store (`src/stores/<entity>.js`):**

```js
// src/stores/menu.js
import { defineStore } from 'pinia'
import menuService from '@/services/menuService'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      this.error = null
      try {
        const data = await menuService.getAll()
        this.items = data  // Direct array (ver tabla de extraction abajo)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    }
  }
})
```

**5.3 Response extraction (CRITICO -- la causa #1 de bugs):**

```
 Entity          API Response Shape            Store Extraction
 ───────         ──────────────────            ─────────────────
 Properties      [ {...}, {...} ]              items = data
 Services        [ {...}, {...} ]              items = data
 Categories      [ {...}, {...} ]              items = data
 Tags            [ {...}, {...} ]              items = data
 Menu            [ {...}, {...} ]              items = data
 Media           [ {...}, {...} ]              items = data

 Posts           { posts: [...], pagination }  items = data.posts
 Projects        { projects: [...], pagination } items = data.projects
 Testimonials    { testimonials: [...], pagination } items = data.testimonials
 Contacts        { contacts: [...], pagination } items = data.contacts

 SiteContent     { tenant, version, contents } contents = data.contents
```

> Si ves `[object Object]` en la vista, la extraction esta mal. Ver [06-troubleshooting](06-troubleshooting.md#los-datos-cargan-pero-se-ven-como-object-object).

**5.4 View (`src/views/<Entity>View.vue`):**

```vue
<template>
  <div class="menu-view">
    <div v-if="store.loading" class="loading">Cargando...</div>
    <div v-else-if="store.error" class="error">{{ store.error }}</div>
    <div v-else>
      <div v-for="item in store.items" :key="item.id">
        <img
          :src="resolveImageUrl(item.image)"
          :alt="item.name"
          width="400"
          height="300"
          loading="lazy"
        />
        <h2>{{ item.name }}</h2>
        <p>{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { resolveImageUrl } from '@/config/api'

const store = useMenuStore()
onMounted(() => store.fetchAll())
</script>
```

### Phase 5a: Foundation docs

Mismo proceso que cualquier proyecto. Crear `docs/` con los 4 archivos obligatorios:

```
1. docs/content-brief.md   <- Copy especifico de ESTE cliente
2. docs/design-brief.md    <- Identidad visual via creative-design
3. docs/page-plans.md      <- Secciones por pagina con propositos
4. docs/motion-spec.md     <- Coreografia GSAP
```

> Ver [00-project-init](00-project-init.md#paso-3-foundation-docs-docs) para el proceso detallado.

### Phase 5b: UI/UX application

**Skills:** `creative-design` -> `page-scaffold` -> `threejs-3d` -> `vue-component` -> `gsap-motion`

Implementar leyendo de `docs/` en cada paso. Cada decision visual, de copy, de animacion tiene una referencia en los docs.

> Ver [01-pipeline-overview](01-pipeline-overview.md) Phases 2-6 para detalles.

### Phase 6: Validation QA

**Skill:** `pegasuz-validation-qa`

5 layers de validacion, en este orden:

```
Layer 1: API
  - Cada endpoint responde 200 con data correcta
  - x-client header presente en cada request

Layer 2: Service
  - Cada service importa solo de api.js
  - Cada service tiene getAll() y getById() minimo

Layer 3: Store
  - Cada store tiene loading, error, items
  - Response extraction correcta (ver tabla arriba)
  - No OR chains (items = data || data.posts -> MAL)

Layer 4: View
  - Loading state implementado
  - Error state implementado
  - Datos reales (no mock)
  - resolveImageUrl() en todas las imagenes

Layer 5: Route
  - History mode (no hash)
  - Lazy loading en todas las rutas
  - scrollBehavior configurado
```

**Zero Omission Rule:** Cada campo del API esta mapeado en el frontend o excluido con documentacion.

```js
// Si un campo no se usa, documentar por que:
// Campo 'internal_notes' excluido: solo visible para admin
// Campo 'sort_order' excluido: usado internamente para ordenamiento
```

### Phase 7: Documentation

**Skill:** `pegasuz-documentation-system`

Documentar:
- Features habilitadas y su binding
- Decisiones de diseno y por que
- Campos excluidos y por que
- Setup instructions para otro desarrollador

---

## Anti-patterns Pegasuz (bloquear activamente)

| Anti-pattern | Por que es malo | Correccion |
|-------------|----------------|-----------|
| Axios import en store o view | Rompe la cadena, no se puede testear | Solo importar en `src/config/api.js` |
| Slug hardcodeado en codigo | No funciona en otro tenant | Usar `import.meta.env.VITE_CLIENT_SLUG` |
| JSON.parse en views | Logica de negocio en la vista | Parsear en store o service |
| Store importa API directo | Salta el service layer | Store -> Service -> API |
| Imagenes sin resolveImageUrl | URL relativa no resuelve | Siempre `resolveImageUrl(path)` |
| CMS data mezclada con features | Confunde labels con datos | `contentStore` = labels/copy, `featureStore` = data |
| `new PrismaClient()` directo | Rompe tenant isolation | Siempre `prismaManager.getPrisma(db)` |
| Hardcoded DB names en backend | No funciona multi-tenant | Siempre dynamic desde clientResolver |
| Raw SQL con interpolacion | SQL injection | Usar Prisma queries |
| Endpoints sin auth middleware | Seguridad | `authenticate` + `authorize(...roles)` |

---

## Estructura esperada por cliente

```
Clientes/<slug>/
  docs/
    design-brief.md
    content-brief.md
    page-plans.md
    motion-spec.md
  src/
    config/
      api.js                <- axios + resolveImageUrl + x-client
    services/
      menuService.js        <- Un archivo por entidad
      postService.js
      contentService.js
    stores/
      content.js            <- CMS bootstrap (get, getJSON)
      menu.js               <- Feature store
      post.js
    views/
      HomeView.vue
      MenuView.vue
      BlogView.vue
      PostDetailView.vue
      ContactView.vue
    components/
      MenuCard.vue
      PostCard.vue
      ...
    composables/
      useScrollAnimation.js
    router/
      index.js              <- Lazy loading, history mode, scrollBehavior
    styles/
      tokens.css            <- Design tokens del cliente
    App.vue
    main.js                 <- Pinia + CMS bootstrap before mount
  .env                      <- VITE_API_URL + VITE_CLIENT_SLUG
  package.json
```

---

## Quick reference: Skills por fase

| Phase | Skill |
|-------|-------|
| 0 - Analizar | `pegasuz-integrator` |
| 1 - Provisionar | (manual curl) |
| 2 - Features | (manual curl) |
| 3 - Verificar | (manual curl) |
| 4 - Scaffold | `pegasuz-frontend-normalization` |
| 5 - Binding | `pegasuz-feature-binding` |
| 5a - Docs | `creative-design` (para design-brief) |
| 5b - UI/UX | `page-scaffold` + `threejs-3d` + `vue-component` + `gsap-motion` |
| 6 - QA | `pegasuz-validation-qa` + 5 audit skills |
| 7 - Docs | `pegasuz-documentation-system` |

> Ver [skill-dispatch-table](skill-dispatch-table.md) para la tabla completa de skills.
> Ver [06-troubleshooting](06-troubleshooting.md#api--pegasuz) para problemas comunes de Pegasuz.
