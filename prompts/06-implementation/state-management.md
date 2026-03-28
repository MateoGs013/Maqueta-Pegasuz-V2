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

## Output esperado

Mapa de stores que guia la implementacion con `pegasuz-feature-binding`.
