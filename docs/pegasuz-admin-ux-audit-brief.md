# Pegasuz Admin Panel — UX/UI Audit + Reform Brief

> **Para ejecutar en una sesión CLI nueva.** Este documento es self-contained: no asume contexto previo. Leelo completo antes de tocar código.

---

## 0. Resumen ejecutivo

El repo pegasuz tiene **dos paneles frontend separados**:

1. `Pegasuz-Core/frontend-superadmin/` — para nosotros (Mateo + técnicos). Acabamos de terminar un reform v2 completo en `master` (commits `e6598078` → `75cbedf3`). **No tocar**.
2. `Pegasuz-Core/frontend-admin/admin/` — **este es el target**. Es el panel que usan los **clientes del SaaS** (no-técnicos) para administrar el contenido de su tenant: posts, proyectos, propiedades, contratos de alquiler, shop, menú, media, etc.

**El problema:** el panel admin fue construido a lo largo del tiempo sin un pase de UX dedicado. Tiene 34+ vistas, 58 rutas, y varios módulos con formularios ABM (alta/baja/modificación) gigantes (MenuView 82KB, ContentView 49KB, ProjectFormView 40KB). La audiencia son usuarios **no técnicos** que van a usar esto mayoritariamente desde **dispositivos móviles y tablets**.

**Objetivo del reform:**
- UX/UI simple, clara, confiable para usuarios no-técnicos
- **100% responsive** (mobile-first — clientes usan celular)
- **Contraste accesible** (WCAG AA mínimo, AAA donde sea posible)
- **Foco en ABM** — los flujos de crear/editar/listar/eliminar recursos son el corazón del panel
- **Estética propia** — NO debe parecerse al panel superadmin (que es denso y técnico). Este panel debe sentirse **amigable, calmo, editorial, con respiración**.

---

## 1. Restricciones duras (no negociables)

1. **Scope absoluto:** solo `Pegasuz-Core/frontend-admin/admin/`. No tocar `frontend-superadmin`, ni `backend`, ni `Clientes/LaRucula/*` (trabajo del usuario en progreso), ni `brain/`.
2. **Nunca tocar:**
   - `src/services/**` (API clients)
   - `src/stores/**` (Pinia stores existentes — podés agregar nuevos pero no romper los viejos)
   - `src/router/index.js` — solo agregar rutas, no renombrar ni remover existentes
   - `src/composables/**` (existentes — agregar nuevos OK)
   - `vite.config.js`, `tailwind.config.js`, `package.json` (podés agregar deps pero solo si están explícitamente justificadas)
3. **Cero cambios funcionales en la primera pasada.** La auditoría + reform se enfoca en UX/UI y layout. Si encontrás un bug funcional, lo flageás en el reporte pero no lo arreglás en el mismo commit que el reform visual.
4. **i18n existente:** el panel probablemente tiene strings en español mezcladas con código. Mantener idioma actual en cada vista. No introducir nuevo sistema de i18n en este reform — solo respetar el que haya.
5. **Git hygiene:** una rama dedicada (`ux/admin-reform`), commits atómicos por módulo, nunca `git add -A` a la raíz, nunca `--no-verify`.
6. **No breaking changes en formas de datos.** Los forms deben enviar el mismo payload al backend.

---

## 2. Target técnico

```
Path:        C:/Users/mateo/Desktop/Dev/pegasuz/SaaS-Multitenant/pegasuz/Pegasuz-Core/frontend-admin/admin/
App name:    pegasuz-admin-frontend
Stack:       Vue 3 + Vite + Pinia + Axios + GSAP + TipTap
Styling:     Tailwind CSS + custom theme (midnight/silver palette, display fonts)
Dev server:  npm run dev → http://localhost:5173
Build:       npm run build
```

### Tokens existentes (revisar `tailwind.config.js` y `src/assets/styles/main.css`)
- Paleta: `midnight-*` (backgrounds), `silver-*` (foregrounds). Dark theme por default.
- Fonts: `font-display` + `font-sans`
- Utility-first (Tailwind), NO CSS custom properties style del reform superadmin (ese usaba `--pz-*`)

**Importante:** el panel superadmin usa CSS variables propias (`--pz-bg-base`, etc). Este panel admin usa **Tailwind con tema custom**. No mezcles los enfoques — este reform debe trabajar dentro del sistema Tailwind existente.

### Stores + servicios
- `src/stores/` — Pinia stores por dominio
- `src/services/` — axios clients por endpoint
- `src/composables/` — hooks reutilizables

---

## 3. Inventario de vistas (mapa del territorio)

**Vistas admin** (34 en `src/views/admin/`):

| Módulo | Vistas | Complejidad |
|---|---|---|
| **Dashboard** | DashboardView, InmobiliariaDashboardView | Medium (24KB) |
| **Content** | ContentView (49KB) | **Alta — forma gigante** |
| **Menu** | MenuView (82KB) | **Crítica — la más pesada** |
| **Posts (blog)** | PostsListView, PostFormView (30KB) | Alta |
| **Projects** | ProjectsListView, ProjectFormView (40KB) | Alta |
| **Testimonials** | TestimonialsListView, TestimonialFormView | Media |
| **Services** | ServicesListView, ServiceFormView, ServiceCollectionsListView, ServiceCollectionFormView | Media |
| **Taxonomy** | CategoriesView, TagsView | Baja |
| **Media** | MediaLibraryView | Alta (uploads) |
| **Shop** | ShopCategoriesView, ShopProductsListView, ShopProductFormView, ShopOrdersListView, ShopOrderDetailView | Alta (e-commerce) |
| **Real estate** | inmobiliaria/, properties/PropertiesListView, PropertyFormView (24KB), PropertyDetailView | **Alta — dominio específico** |
| **Rentals** | rentals/ContractsListView (36KB), ContractDetailView (29KB), RentPaymentsView (28KB) | **Crítica — ABM financiero** |
| **Comms** | ContactsView, NewsletterListView, NewsletterSettingsView | Media |
| **Analytics** | AnalyticsView | Media |
| **Meta** | GuiaView (26KB — probablemente help/onboarding), ConfigDebugView, LoginView | Baja |

**Vistas tenant portal** (5 en `src/views/tenant/`):
- TenantDashboardView, TenantLoginView, TenantMaintenanceView, TenantPaymentsView, TenantTaxesView

Hay también `src/components/admin/AdminLayout.vue` (512 líneas) que es el shell con sidebar+topbar.

**Las 4 vistas más críticas a auditar con profundidad:**
1. `MenuView.vue` — 82KB, probablemente el builder del menú navegable del sitio cliente
2. `rentals/ContractsListView.vue` + `ContractDetailView.vue` — contratos de alquiler, ABM financiero
3. `ContentView.vue` — editor de contenido global
4. `properties/PropertyFormView.vue` + `rentals/RentPaymentsView.vue` — formularios grandes de ABM

---

## 4. Aesthetic brief — qué distingue este panel del superadmin

El superadmin (frontend-superadmin) usa **dense data + monospace + hot orange accent + near-black bg**. Es para técnicos, prioriza densidad.

**Este panel (admin client-facing) debe sentirse distinto:**

| Dimensión | Superadmin (para nosotros) | **Admin (para clientes)** |
|---|---|---|
| Densidad | Alta — 5-7 elementos por viewport | **Baja — 3-5 elementos, respiración** |
| Tipografía | Display + mono con `clamp()` agresivo | **Display + sans con sizes generosas, lectura cómoda** |
| Color | `#0a0a0b` + `#ff6a00` hot orange | **Midnight bg existente + accent más warm, CTAs claros** |
| Motion | Sutil, `cubic-bezier(0.16, 1, 0.3, 1)` 120ms | **Sutil, pero con más "pulse" de feedback en acciones** |
| Iconografía | Mínima — a veces glifos mono | **Icon set consistente (Lucide/Heroicons), labels siempre** |
| Jerarquía | Una primary por vista | **Claridad del "próximo paso" siempre visible** |
| Voz | Técnica — "PROVISIONING", "COHERENCE" | **Humana — "Crear propiedad", "Guardar cambios"** |

**Lo que el panel admin necesita y el superadmin no:**
- **Onboarding inline** — tooltips, empty states con explicación clara, "primera vez" states
- **Confirmaciones amigables** — modales de "¿Estás seguro?" con preview de lo que se va a afectar
- **Save feedback visible** — toasts con "Guardado ✓" persistente 3-4 segundos
- **Error messages accionables** — no "500 Internal Server Error", sino "No pudimos guardar. Intentá de nuevo o avisanos."
- **Mobile-first layouts** — todos los forms deben colapsar limpio en 375px
- **Autosave hints** donde aplique

---

## 5. Metodología de auditoría (fase por fase)

### Fase 0 — Setup + exploración
```bash
cd Pegasuz-Core/frontend-admin/admin
git status                          # verificar árbol limpio
git checkout -b ux/admin-reform
npm install                         # si es necesario
npm run dev                         # chequear que arranca en :5173
```

Explorar:
- `AdminLayout.vue` — entender sidebar, topbar, navegación
- `tailwind.config.js` — extraer tokens actuales
- `main.css` — ver base styles
- Loguearse al panel (necesitás un tenant de prueba + credenciales)

### Fase 1 — Audit pasivo (solo lectura, sin cambios)
Para cada vista crítica (empezando por las 4 del punto 3), producir un reporte en `docs/admin-ux-audit.md` con:

Por vista:
1. **Screenshot desktop (1440px) + mobile (375px)** — capturar con Playwright o manualmente
2. **Pain points identificados** con severity (critical/high/medium/low):
   - Jerarquía visual rota
   - Forms con demasiados campos juntos
   - Labels ambiguos
   - CTAs escondidos o no-obvios
   - Breakpoints rotos en mobile
   - Contraste fallando WCAG AA
   - Estados faltantes (loading/empty/error)
   - Flujos ABM confusos (¿dónde guardo?, ¿cómo cancelo?, ¿qué pasó?)
3. **Propuesta concreta** — en 2-3 bullets por vista

El audit NO implementa. Solo observa y propone.

### Fase 2 — Decisiones de sistema
Después de auditar las 4 críticas, decidir:
- **Design tokens nuevos** (si hace falta extender Tailwind config):
  - Escala tipográfica legible (min 14px body, 16px en mobile)
  - Paleta de estados (success/warning/error) con WCAG AA contra midnight
  - Spacing scale consistente
  - Shadow scale para profundidad
  - Radius scale (el admin puede permitirse curvas, NO como el superadmin angular)
- **Componentes primitivos** a crear en `src/components/ui/`:
  - `FormField.vue` — label + input + hint + error, consistente
  - `PageHeader.vue` — breadcrumb + title + actions
  - `ResourceListLayout.vue` — filtros + tabla/grid + paginación
  - `ResourceFormLayout.vue` — sections + sticky actions
  - `EmptyState.vue` — icon + title + subtitle + primary action
  - `ConfirmDialog.vue` — destructive action confirmation
  - `ToastContainer.vue` si no existe
  - `MobileDrawer.vue` para sidebar en mobile

### Fase 3 — Implementación módulo por módulo
Orden sugerido (de menos a más crítico):

1. **Shell** — AdminLayout responsive (sidebar → drawer en mobile, topbar adaptativa)
2. **Primitives** — los componentes `src/components/ui/*` listados arriba
3. **Dashboard** — refactor usando nuevos primitives (vista más visible al login)
4. **Taxonomy simple** — Categories, Tags (forms chicos, ideal para validar el sistema)
5. **Posts + Projects** — list + form pattern aplicado
6. **Testimonials + Services** — idem
7. **Shop** — Categories + Products + Orders
8. **Real estate** — Properties (crítico — domain-specific)
9. **Rentals** — Contracts + Payments (el más complejo, dejar al final)
10. **Menu builder** — la vista más grande, probablemente requiere rediseño del builder UX
11. **Content + Media** — editor + library
12. **Tenant portal** — las 5 vistas de `/tenant/` (otra audiencia: el usuario final del tenant)

Cada módulo = un commit atómico:
```
feat(ux/admin): reform <module-name>
```

### Fase 4 — Responsive audit
Después de cada módulo implementado, probar en:
- 375px (mobile S)
- 414px (mobile L)
- 768px (tablet)
- 1024px (small desktop)
- 1440px (desktop)
- 1920px (wide)

Checklist por viewport:
- [ ] Sin scroll horizontal
- [ ] Tap targets >= 44x44px
- [ ] Forms legibles (min 16px input font-size para no disparar zoom en iOS)
- [ ] Sidebar colapsa limpio
- [ ] Modales ocupan < 90vh / < 90vw
- [ ] Tablas scrollean internas o se convierten en cards en mobile

### Fase 5 — Contraste + accesibilidad
- Instalar axe-core o usar Lighthouse para pasar WCAG AA
- Todos los fg/bg con contrast ratio >= 4.5:1 (texto normal) o >= 3:1 (texto large)
- `focus-visible` en todo elemento interactivo
- `aria-label` en icon-only buttons
- `<label for="">` en todos los inputs
- Keyboard navigation: tab order lógico, Enter submit forms, Esc cierra modales

### Fase 6 — Final polish
- Animations con `prefers-reduced-motion` respetado
- Loading skeletons en cada list view
- Empty states escritos a mano (nada de "No hay datos")
- Error boundaries con copy amigable
- Build limpio: `npm run build` sin warnings

---

## 6. Deliverables esperados

Al terminar el audit + reform:

1. **`docs/admin-ux-audit.md`** — reporte de audit con findings por vista
2. **`docs/admin-design-system.md`** — decisiones de tokens + componentes primitivos
3. **Branch `ux/admin-reform`** con N commits atómicos por módulo
4. **PR description completa** con antes/después por módulo (screenshots)
5. **`docs/admin-responsive-report.md`** — matriz de viewports x vistas con ✅/❌

---

## 7. Usando OMC agents

Este brief está pensado para ejecutarse con el skill `ralph` de oh-my-claudecode. Invocarlo así:

```
/oh-my-claudecode:ralph

Ejecutar el audit + reform descripto en docs/pegasuz-admin-ux-audit-brief.md
del repo maqueta. Target: frontend-admin/admin. Stop condition: Fase 4
(responsive audit) completa para los módulos 1-8 del orden de implementación.
Reviewer: code-reviewer entre fases. --critic=architect para la decisión de
tokens/primitives (Fase 2).
```

### Agents recomendados por fase

| Fase | Agent | Modelo | Rol |
|---|---|---|---|
| 1 audit | `analyst` / direct Read | Opus | Leer + identificar pain points |
| 2 sistema | `architect` | Opus | Decidir tokens + primitives |
| 3 implementación | `executor` | Sonnet | Refactor por módulo |
| review entre fases | `code-reviewer` | Sonnet | Validar cada módulo |
| 4 responsive | `qa-tester` o manual | Sonnet | Playwright screenshots multi-viewport |
| 5 a11y | `security-reviewer` (modo a11y) o `verifier` | Sonnet | axe-core + keyboard tests |

### Skills útiles
- `ralph` — loop con PRD + verificación
- `ultrawork` — paralelización de módulos independientes (e.g., Posts + Projects + Testimonials al mismo tiempo)
- `ai-slop-cleaner` — post-implementación

---

## 8. Checklist antes de cerrar el reform

- [ ] `docs/admin-ux-audit.md` escrito con findings de las 4 vistas críticas mínimo
- [ ] `docs/admin-design-system.md` con tokens y primitives documentados
- [ ] AdminLayout responsive (drawer + topbar adaptativa) pasa 375-1920
- [ ] 8+ módulos reformados (mínimo: Dashboard + Taxonomy + Posts + Projects + Testimonials + Properties + Rentals/ContractsList + Menu)
- [ ] WCAG AA verificado con axe-core en las 8 vistas
- [ ] Build limpio
- [ ] PR abierto contra `master`
- [ ] Screenshots antes/después de las 4 vistas críticas
- [ ] Zero regresiones funcionales — todos los forms envían el mismo payload al backend
- [ ] Ningún import roto a `services/` o `stores/` existentes

---

## 9. Context útil para el CLI nuevo

**Últimos commits en master** (el reform del superadmin, no tocar):
```
75cbedf3 fix(ux): global canvas bg — kill gray dead zones across all views
7e06f555 feat(ux): inspector dynamic width + brain deep-drawer smart renderer
6a305b69 chore(cms): remove debug console.info spam
9fdffcb3 fix(ux): system panel + brain view visual bugs
5cb3eedd Merge branch 'ux/superadmin-reform-v2'
e6598078 feat(ux): superadmin reform v2 — Fases 0-14
```

**Trabajo en curso del usuario (intocable):**
- `Clientes/LaRucula/*` — Mateo tiene WIP sin commitear. Si aparece en `git status`, ignorar y **nunca stagear esos paths**.

**Pegasuz-Core/frontend-superadmin/frontend-superadmin/** — el panel que acabamos de reformar. No leer ni importar desde ahí. Es otro universo de tokens (`--pz-*` CSS vars) y no se comparten primitives con el admin panel.

**Feature del admin que es único:**
- TipTap editor (`@tiptap/*` deps) — el editor rich-text para content/posts. El reform debe respetarlo o mejorarlo sin romperlo.
- Media Library — probablemente maneja uploads, cropping, alt text. Audit con cuidado.

**Ambiente:**
- Windows 11, Git Bash. Paths con forward slashes.
- Dev server con hot reload en :5173.
- No hay CI/tests automatizados (hasta donde sé — verificar `tests/` folder).

---

## 10. Si algo falla — escalation

- **Build roto existente:** hay que verificar si el proyecto builda limpio ANTES de empezar el reform. Si no builda, el audit tiene un baseline roto y hay que fixear lo mínimo para tener un starting point verde.
- **Backend down:** algunas vistas fallan si el backend no está arriba. Usar fixtures o mock responses para avanzar en audit visual sin depender del API.
- **Scope creep:** si una vista resulta ser 10x más compleja que estimado (como MenuView 82KB), hacer un mini-plan separado en `docs/admin-<module>-reform-plan.md` antes de tocar código.
- **User feedback:** Mateo puede interrumpir y pedir cambios. Respetar prioridades nuevas, preservar trabajo ya commiteado (no rebase destructivo).

---

**Fin del brief.** Está diseñado para ser self-sufficient — un CLI nuevo lee esto y empieza a trabajar sin historia previa. Si alguna sección necesita más profundidad durante la ejecución, documentarlo como pregunta en el audit report antes de asumir.
