# Prompt: API Integration

> Fase: Implementation | Output: Configuracion de API y services
> Solo para proyectos Pegasuz (multi-tenant).

---

## Prompt

```
Configura la integracion API para {{PROJECT_NAME}} (cliente Pegasuz).

SLUG: {{CLIENT_SLUG}}
API URL: {{API_URL}} (ej: http://localhost:3000/api)
FEATURES HABILITADAS: {{FEATURES}}

1. ARCHIVOS A CREAR

   .env:
   VITE_API_URL={{API_URL}}
   VITE_CLIENT_SLUG={{CLIENT_SLUG}}

   src/config/api.js:
   - Single axios instance
   - baseURL from VITE_API_URL
   - x-client header from VITE_CLIENT_SLUG
   - resolveImageUrl() helper
   - Response interceptor para errores

2. SERVICES (uno por entidad)
   Para cada feature habilitada, crear:

   src/services/{{entity}}Service.js:
   - getAll(params) -> GET /{{entity}}
   - getBySlug(slug) -> GET /{{entity}}/{{slug}}
   - getById(id) -> GET /{{entity}}/{{id}}
   - create(data) -> POST /{{entity}} (si aplica)
   - update(id, data) -> PUT /{{entity}}/{{id}} (si aplica)

3. RESPONSE EXTRACTION (critico — no adivinar)

   | Entidad | Endpoint | Wrapper | Extraction |
   |---------|----------|---------|-----------|
   | Properties | /properties | Direct array | data |
   | Services | /services | Direct array | data |
   | Categories | /categories | Direct array | data |
   | Tags | /tags | Direct array | data |
   | Posts | /posts | { posts, pagination } | data.posts |
   | Projects | /projects | { projects, pagination } | data.projects |
   | Testimonials | /testimonials | { testimonials, pagination } | data.testimonials |
   | Contacts | /contacts | { contacts, pagination } | data.contacts |
   | SiteContent | /site-contents | { tenant, version, contents } | data.contents |

4. VERIFICACION
   Despues de crear, verificar cada endpoint con curl:
   curl -H "x-client: {{SLUG}}" {{API_URL}}/{{entity}}

   Cada endpoint debe responder 200 con datos del tenant correcto.

REGLAS:
- NUNCA hardcodear el slug en codigo (siempre VITE_CLIENT_SLUG)
- NUNCA importar axios fuera de src/config/api.js
- SIEMPRE usar resolveImageUrl() para imagenes
- SIEMPRE manejar errores en el service (try/catch o .catch())
```

---

## Ejemplo: buena vs mala integracion

### Service para propiedades

**Mala:**
```js
import axios from 'axios'
export function getProperties() {
  return axios.get('http://localhost:3000/api/properties', {
    headers: { 'x-client': 'mi-cliente' }
  })
}
```
(axios importado directamente, URL hardcodeada, slug hardcodeado, sin error handling.)

**Buena:**
```js
// src/services/propertyService.js
import api from '@/config/api'

export default {
  getAll: (params) => api.get('/properties', { params }).then(r => r.data),
  getBySlug: (slug) => api.get(`/properties/${slug}`).then(r => r.data),
  getFeatured: () => api.get('/properties', { params: { featured: true } }).then(r => r.data),
}
```
```js
// src/config/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'x-client': import.meta.env.VITE_CLIENT_SLUG }
})

export const resolveImageUrl = (path) => {
  if (!path) return '/placeholder.jpg'
  if (path.startsWith('http')) return path
  return `${import.meta.env.VITE_API_URL}${path}`
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(`[API] ${err.config?.method?.toUpperCase()} ${err.config?.url}`, err.response?.status)
    return Promise.reject(err)
  }
)

export default api
```

---

## Extraction patterns por tipo de response

| Response shape | Extraction en store | Ejemplo |
|---------------|-------------------|---------|
| `[{...}, {...}]` (direct array) | `this.items = data` | Properties, Services, Categories, Tags, Menu, Media |
| `{ entities, pagination }` | `this.items = data.entities; this.pagination = data.pagination` | Posts (.posts), Projects (.projects), Testimonials (.testimonials) |
| `{ tenant, version, contents }` | `this.contents = data.contents` | SiteContent |
| Single object | `this.item = data` | getBySlug, getById |

---

## Common errors

- **axios importado fuera de api.js.** Si un service importa axios directamente, pierde el baseURL, el x-client header, y los interceptors. SIEMPRE importar de @/config/api.
- **Slug hardcodeado en el codigo.** `'mi-cliente'` en el header, en un service, o en un componente es un bug de multi-tenancy. SIEMPRE usar VITE_CLIENT_SLUG.
- **URLs hardcodeadas.** `http://localhost:3000` en produccion es un bug. SIEMPRE usar VITE_API_URL.
- **No verificar endpoints antes de implementar.** Hacer curl con x-client header ANTES de crear el service. Si el endpoint no existe o devuelve 404, no hay nada que integrar.
- **resolveImageUrl no usado.** Imagenes del API vienen con paths relativos. Sin resolveImageUrl(), las imagenes no cargan. SIEMPRE usarla.
- **Error handling ausente en services.** Si el service no re-throws el error, el store no puede setear `this.error`. El .then(r => r.data) ya maneja el happy path; los errores los maneja el store.
- **Multiples axios instances.** Solo debe existir UNA instancia de axios en todo el proyecto, en src/config/api.js. No crear instancias adicionales.

---

## Pipeline connection

```
Input: client-intake.md (slug, API URL, features habilitadas)
     + state-management.md (que stores necesitan que services)
Output de este prompt -> api.js + services + .env configurados
  Alimenta directamente:
    - pegasuz-feature-binding skill (completar la cadena)
    - pegasuz-validation-qa (verificar la cadena API->Service->Store->View)
    - binding-auditor agent (verificacion automatizada)
```

## Output esperado

Configuracion API funcional que pasa la verificacion del `binding-auditor`.
