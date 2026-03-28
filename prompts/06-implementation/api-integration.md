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

## Output esperado

Configuracion API funcional que pasa la verificacion del `binding-auditor`.
