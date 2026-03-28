# Guide: Pegasuz Integration

> Guia especifica para clientes dentro del ecosistema Pegasuz multi-tenant.

---

## Que es Pegasuz

Plataforma SaaS multi-tenant. Backend centralizado (Node.js + Express + Prisma + MySQL) sirviendo multiples clientes, cada uno con su propia base de datos y frontend Vue 3.

## Arquitectura locked

```
Frontend (Vue 3)
  View.vue -> Pinia Store -> Service -> api.js (axios + x-client header)
                                          |
                                    Pegasuz Core API
                                          |
                                    clientResolver middleware
                                          |
                                    prismaManager.getPrisma(db_name)
                                          |
                                    Tenant Database
```

## Pipeline de onboarding (nuevo cliente)

### 1. Provisionar cliente
```
POST /api/core-admin/clients
Body: { name, slug, database_name, admin_email, admin_password }
```

### 2. Configurar feature flags
```
POST /api/core-admin/clients/:id/features
Body: { features: ["properties", "services", "blog", ...] }
```

### 3. Verificar endpoints
Para cada feature habilitada, verificar:
```bash
curl -H "x-client: <slug>" http://localhost:3000/api/<entity>
# Debe responder 200
```

### 4. Scaffold frontend
Usar `_project-scaffold/` como base. Configurar:
- `.env` con VITE_API_URL y VITE_CLIENT_SLUG
- `src/config/api.js` con axios instance + x-client header

### 5. Feature binding
Para cada feature:
- Service: `src/services/<entity>Service.js`
- Store: `src/stores/<entity>.js`
- View: `src/views/<Entity>View.vue`

Response extraction (critico):
| Entidad | Extraction |
|---------|-----------|
| Properties, Services, Categories, Tags | `items = data` (direct array) |
| Posts | `items = data.posts`, `pagination = data.pagination` |
| Projects | `items = data.projects` |
| Testimonials | `items = data.testimonials` |
| SiteContent | `contents = data.contents` |

### 6. Foundation docs + UI
Mismo pipeline que cualquier proyecto: `docs/` primero, codigo despues.

### 7. Validation QA
5 layers: API -> Service -> Store -> View -> Route
Zero Omission Rule: cada campo mapeado o excluido con razon.

## Anti-patterns Pegasuz

| Anti-pattern | Correccion |
|-------------|-----------|
| Axios import en store o view | Solo en src/config/api.js |
| Slug hardcodeado | VITE_CLIENT_SLUG |
| JSON.parse en views | Parsear en store o service |
| Store importa API directo | Store -> Service -> API |
| Imagenes sin resolveImageUrl | Siempre resolver URLs |
| CMS data mezclada con features | contentStore = labels, featureStore = data |
