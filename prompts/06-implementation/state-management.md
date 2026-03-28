# Prompt: State Management

> Fase: Implementation | Output: Mapa de stores y data flow
> Definir stores ANTES de implementar views.

---

## Prompt

```
Define la arquitectura de state management para {{PROJECT_NAME}}.

STACK: Pinia (Vue 3)
FLUJO: View -> Store -> Service -> API

STORES NECESARIOS:

1. CONTENT STORE (CMS / site-wide content)
   - Archivo: src/stores/content.js
   - Source: GET /api/site-contents (x-client: {{SLUG}})
   - Bootstraps before app mount
   - Methods: get(key), getJSON(key), loaded, error
   - NO usar para feature data (solo labels, textos, config)

2. FEATURE STORES (uno por entidad)
   Para cada feature habilitada:

   | Store | Entidad | Service | Extraction |
   |-------|---------|---------|-----------|
   | {{STORE}} | {{ENTITY}} | {{SERVICE}} | {{EXTRACTION}} |

   Cada store tiene:
   - state: items[], item, loading, error, pagination
   - actions: fetchAll(params), fetchBySlug(slug), fetchById(id)
   - getters: sortedItems, filteredItems (si aplica)

3. UI STORES (estado de interfaz)
   | Store | Proposito |
   |-------|-----------|
   | uiStore | Mobile menu open, dark mode toggle, scroll position |
   | filterStore | Filtros activos (si hay listado filtrable) |

DATA FLOW POR FEATURE:

```
View.vue
  onMounted -> store.fetchAll()
  template: v-if="store.loading" -> skeleton
            v-else-if="store.error" -> error state
            v-else -> render store.items

Store (Pinia)
  async fetchAll(params) {
    this.loading = true
    this.error = null
    try {
      const data = await entityService.getAll(params)
      this.items = data          // Direct array
      // OR
      this.items = data.posts    // Wrapped response
      this.pagination = data.pagination
    } catch (err) {
      this.error = err.message
    } finally {
      this.loading = false
    }
  }

Service (src/services/entityService.js)
  import api from '@/config/api'
  export default {
    getAll: (params) => api.get('/entity', { params }).then(r => r.data),
    getBySlug: (slug) => api.get(`/entity/${slug}`).then(r => r.data),
  }
```

REGLAS INVIOLABLES:
- View NUNCA importa service o api directamente
- Store NUNCA importa api directamente (solo service)
- Service es el unico que toca api.js
- Stores siempre tienen loading + error states
- CMS content separado de feature data
```

---

## Ejemplo: buena vs mala definicion

### Store para propiedades de una inmobiliaria

**Mala:**
```js
// propertyStore.js
const properties = ref([])
function getProperties() { /* fetch */ }
```
(Sin loading, sin error, sin pagination, sin typing. El view no puede manejar estados.)

**Buena:**
```js
// stores/property.js
export const usePropertyStore = defineStore('property', {
  state: () => ({
    items: [],
    item: null,
    loading: false,
    error: null,
    pagination: { page: 1, limit: 12, total: 0 },
    filters: { type: null, priceMin: null, priceMax: null, zone: null }
  }),
  getters: {
    hasMore: (state) => state.items.length < state.pagination.total,
    filteredItems: (state) => {
      // Client-side filter for quick UX, server-side for pagination
      return state.items
    }
  },
  actions: {
    async fetchAll(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await propertyService.getAll({
          ...this.filters,
          ...this.pagination,
          ...params
        })
        this.items = data  // Direct array extraction
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async fetchBySlug(slug) {
      this.loading = true
      this.error = null
      try {
        this.item = await propertyService.getBySlug(slug)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    setFilter(key, value) {
      this.filters[key] = value
      this.fetchAll()  // Re-fetch with new filters
    }
  }
})
```

---

## Store patterns por tipo de feature

| Feature type | State extra | Getters extra | Actions extra |
|-------------|-------------|---------------|---------------|
| Listado filtrable | filters: {} | filteredItems | setFilter, clearFilters |
| Listado con mapa | mapBounds: {}, selectedPin | itemsInBounds | fetchInBounds, selectPin |
| Detalle con relacionados | relatedItems: [] | — | fetchRelated(id) |
| Infinite scroll | cursor: null, hasMore | — | fetchMore() |
| Formulario | formData: {}, submitting, submitError | isValid | submit(), resetForm |
| Favoritos | favorites: [] | isFavorite(id) | toggleFavorite(id) |

---

## Common errors

- **Store sin loading/error state.** Sin loading, el view no puede mostrar skeleton. Sin error, el usuario no sabe que fallo. Ambos son OBLIGATORIOS.
- **View importa service directamente.** La cadena es View -> Store -> Service -> API. El view NUNCA toca el service. Esto rompe la cacheabilidad y el manejo de estado.
- **OR chains en extraction.** `this.items = data.properties || data.items || data || []` es un smell. La extraction debe ser exacta segun la tabla de response extraction.
- **CMS content mezclado con feature data.** El contentStore (site-contents) es para labels, textos, config. Los datos de properties, services, etc. van en su propio store.
- **Store que hace HTTP directamente.** `import axios from 'axios'` en un store es un anti-pattern. El store importa el service, el service importa api.js.
- **No resetear state entre navigations.** Si navego de PropertyDetail A a PropertyDetail B, el store tiene los datos de A por un instante. Resetear item al entrar.
- **Stores sin tipado de pagination.** Si la API devuelve `{ properties, pagination }`, el store debe extraer ambos. Si solo extrae items, se pierde la paginacion.

---

## Pipeline connection

```
Input: component-planning.md (store dependencies por componente)
     + api-integration.md (response extraction por entidad)
     + client-intake.md (features habilitadas)
Output de este prompt -> Mapa de stores y data flow
  Alimenta directamente:
    - pegasuz-feature-binding skill (crear stores)
    - api-integration.md (services a crear)
    - vue-component skill (que store consume cada componente)
    - pegasuz-validation-qa (verificar cadena completa)
```

## Output esperado

Mapa de stores que guia la implementacion con `pegasuz-feature-binding`.
