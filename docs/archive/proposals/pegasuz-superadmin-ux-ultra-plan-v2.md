# Ultra Plan v2 — Pegasuz SuperAdmin
## Un replanteo de UX/UI por Eros — corregido contra el codigo real

> **Supersedes:** `pegasuz-superadmin-ux-ultra-plan.md` (v1). Este documento lo reemplaza.
> **Status del reskin:** EJECUTADO. Los tokens `--pz-*` del reskin-plan ya estan aplicados en `src/assets/design-system.css` (verificado: `#0a0a0b` bg, `#f0e7d8` text, `#ff6a00` accent, DM Sans + DM Mono + Space Grotesk, radius 0, shadows none). No hay dependency bloqueante — v2 arranca directo.
> **Proyecto target:** `C:/Users/mateo/Desktop/Dev/pegasuz/SaaS-Multitenant/pegasuz/Pegasuz-Core/frontend-superadmin/frontend-superadmin/`
> **Namespace unico:** v2 extiende `--pz-*` (no introduce `--pz-*` paralelos). Reutiliza todo lo que ya existe y solo agrega lo nuevo.

---

## Preámbulo — Lo que cambió entre v1 y v2

v1 se escribio con demasiada confianza en el mapa mental sin verificar contra el territorio. Los 4 reviews (critic, architect, analyst, verifier) encontraron 12 findings criticos. Ademas, Mateo corrigio dos decisiones de fondo en vivo. v2 integra todo.

### Los 14 cambios de fondo

**Correcciones factuales (eran mentiras en v1):**

1. **El Brain tiene 22 section components, no 21.** El faltante era `BrainAgentTrustSection.vue` (yo lo llamaba "BrainAgentsSection"). Lista real verificada en `src/views/system/BrainView.vue:12-33`.
2. **Los modales de ClientsView SI son inline.** `FeaturesModal` esta inline en `ClientsView.vue:522-688`, `CmsModal` en `690-800+`. Solo `UserModal` esta extraido como componente. v1 decia "reusar la logica del FeaturesModal existente" — imposible sin extraer primero.
3. **El superadmin son 10 views, no 9.** v1 olvidaba `CreateClientView.vue` en `/clients/new`.
4. **`useBrainSearch` y `useBrainShortcuts` no existen.** v1 los citaba como "siguen funcionando igual".
5. **`useBrainStore` no es un composable — es un store Pinia** en `src/stores/system/brain.js`. Similar para `useSystemSocketStore`.
6. **`useSystemUIStore` ya existe** en `src/stores/system/ui.js` (maneja operator/raw mode + filters). v1 proponia crear `src/stores/ui.js` — nombre confuso. v2 renombra a `useAppShellStore` en `src/stores/shell.js`.

**Correcciones de direccion (Mateo en vivo):**

7. **No reutilizar BrainView.** v1 pivot proponia "preservar BrainView porque tiene UX sofisticada". Mateo corrigio: *"es muy estresante el view de brain"*. Tener features sofisticados no es tener buen UX. v2 rediseña BrainView desde cero. No reutiliza composables de UX del Brain (`useBrainSections`, `useBrainCommandPalette`, `useBrainMode`, `useBrainI18n`, `useBrainCoherence`, `useBrainAnomalies`, `useBrainOffice`, `useMetricHistory`, `useFlashOnChange`, `useAnimatedNumber`, `useBrainSectionsWrap`). Solo lee data de `useBrainStore` porque es la fuente unica del estado del cerebro.
8. **Regla universal: nunca vacio.** *"No puede aparecer vacio cuando entras a esa seccion"*. Cada celda, cada view, tiene los 4 estados definidos: data / loading (skeleton) / empty (mensaje calmo con proximo paso) / error (inline con retry). Elevado a RULE 11 en Parte 10.

**Correcciones arquitecturales (architect review):**

9. **`<KeepAlive>` obligatorio en cualquier tab/drawer switching** que swape componentes con pollers en `onMounted`. Sin esto, cada switch remount = refire de pollers + double-fetches + race conditions. Verificado en `BrainGovernanceSection.vue:140-149`, `BrainInterventionSection.vue:69-90`, `BrainTestingSection.vue:109-110`. En BrainView v2 esto no aplica porque no usamos esos componentes, pero aplica a ClientsView inspector tabs y a LocalCommandView.
10. **CSS fix: `.canvas` necesita `min-height: 0; min-width: 0;`** para que `overflow-y: auto` funcione dentro de grid children. Gotcha conocido de grid-template-areas.
11. **CSS fix: shorthand aritmetico invalido.** `calc(var(--pz-cell-pad) * 1.5)` con `--pz-cell-pad: 28px 32px` (2 valores) es CSS invalido. Split a `--pz-cell-pad-y` / `--pz-cell-pad-x`.
12. **Inspector subject con `shallowRef` + `router.afterEach(close)` + `markRaw` en tab components.** Sin estos, reactividad excesiva + componentes stale tras route change.

**Correcciones de scope (verifier + analyst):**

13. **Smoke test suite obligatorio.** Fase 0B crea `scripts/smoke-test.mjs` con Playwright (nueva dependencia dev) + 12 assertions basicas que corren < 2min. Sin esto, los verification gates son "documentacion de intencion, no mecanismos de garantia". Listado como dependencia opcional-recomendada: si se rechaza instalar Playwright, el plan tiene alternativa con script Node + HTTP requests contra backend (menos cobertura pero cero deps).
14. **Definition of Done explicito + rollback por fase.** DoD al final de Parte 12. Rollback procedure por fase de riesgo alto (3, 7, 10, 11).

### El giro de fondo: calma primero

La queja de Mateo destila a dos palabras: **abrumo + vacio**. Esos son los dos extremos del mismo fallo — jerarquia rota. Cuando todo tiene el mismo peso, el ojo se panica buscando donde aterrizar (abrumo) y simultaneamente ve vastos territorios sin mensaje (vacio).

v1 intento resolverlo con reorganizacion estructural. Se quedo corto porque no enfrento el principio subyacente: **una view debe comunicar calma antes que densidad**.

v2 adopta esta filosofia:

> **Calma primero, profundidad a demanda.** Al entrar a cualquier view ves entre 3 y 7 elementos grandes que responden *una* pregunta. Si necesitas mas, scroll o click. Nunca te bombardea. Nunca te deja sin respuesta.

Esto se aplica de forma mas radical al BrainView, pero aplica a TODAS las views. Es la regla estetica de fondo.

---

## Parte 0 — Dependencies y precondiciones

### 0.1 Reskin — RESUELTO (verificado contra codigo)

El reskin-plan ya se ejecuto. Verificado en `src/assets/design-system.css:1-102`:

```
--pz-bg-base: #0a0a0b        ← Eros warm near-black
--pz-text-primary: #f0e7d8   ← Eros warm cream
--pz-accent: #ff6a00         ← Eros hot orange
--pz-font-display: 'Space Grotesk'
--pz-font-body: 'DM Sans'
--pz-font-mono: 'DM Mono'
--pz-radius-*: 0             ← angular
--pz-shadow-*: none          ← flat
--pz-transition: 120ms cubic-bezier(0.16, 1, 0.3, 1)
--pz-sidebar-width: 220px
--pz-cell-pad: 28px 32px
```

`index.html` tambien carga los 3 font families correctos. El CSS header literal dice *"Eros aesthetic: angular, warm near-blacks, zero ornament"*.

**Consecuencia:** v2 arranca directo sin Fase de verificacion de reskin. El gap-as-separator pattern se apoya en `--pz-bg-base` y `--pz-border` que ya tienen los valores correctos.

### 0.2 Testing infra — RESUELTO (observer ya disponible)

Verificado: `maqueta/scripts/package.json` declara `"playwright": "^1.59.1"` y `node_modules/playwright` existe. El observer `scripts/eros-observer.mjs` (1849 lineas) lo usa.

**Verification system official:** Eros Observer v2 (6 capas). Ver Parte 12.0 para setup y targets.

No se instala nada adicional. No hace falta `@playwright/test`, el observer usa directamente `import { chromium } from 'playwright'`.

### 0.3 Precondiciones tecnicas

- Vue 3.5+ con `<script setup>` (confirmado en `package.json`)
- Vite 7+ (confirmado)
- Pinia 3+ (confirmado)
- socket.io-client 4+ (confirmado)
- **NO hay `@vueuse/core`** — cualquier keyboard handling debe ser hand-rolled. `useMagicKeys` no disponible. Aceptable — la implementacion es ~60 lineas.
- **NO hay tests previos** — este plan introduce el primer smoke test suite.

### 0.4 Archivos intocables (lista absoluta, verificada)

```
src/stores/system/*.js        — NO (excepto agregamos uno nuevo: shell.js en src/stores/)
src/stores/system/index.js    — AGREGAR un export nuevo, nada mas
src/services/*                — NO
src/api/*                     — NO
src/router/index.js           — NO (excepto agregar query params via $route)
src/composables/*             — NO modificar existentes (agregar nuevos OK)
src/components/system/brain/useBrain*.js  — NO leer ni modificar. v2 no los usa.
src/config/*                  — NO
src/constants/*               — NO
src/utils/*                   — NO
vite.config.js                — NO
package.json                  — SOLO agregar @playwright/test si se elige testing infra
```

Todo cambio vive en: `<template>` y `<style>` de los `.vue` existentes, nuevos componentes en `src/components/layout/*`, nuevos componentes en `src/components/inspector/**`, nuevos componentes en `src/views/system/brain-v2/*`, nuevos composables en `src/composables/ui/*`, un store nuevo `src/stores/shell.js`, y tokens en `design-system.css`.

---

## Parte 1 — Los 8 principios que guian cada decision

Rankeados. Si dos entran en conflicto, el de arriba gana.

### 1. Calma antes que densidad

**Regla:** Al entrar a cualquier view, el usuario ve entre 3 y 7 elementos grandes. Nunca mas. El resto vive detras de affordances (scroll, click, drawer, tab).

### 2. Nunca vacio

**Regla:** Cada celda tiene los 4 estados definidos y siempre renderiza algo intencional.

| Estado | Cuando | Que se ve |
|---|---|---|
| `data` | Hay datos | El contenido real |
| `loading` | Primera carga sin cache | Skeleton calmo con pulse |
| `empty` | Carga exitosa pero 0 items | Mensaje calmo con proximo paso ("Esperando primer ciclo en 12m...") |
| `error` | Fetch fallo | Banner inline con retry button |

Ningun componente puede renderizar un rectangulo en blanco. Ningun componente puede renderizar un spinner generico "Loading...". Cada estado es intencional y diseñado.

### 3. Jerarquia antes que simetria

**Regla:** Nunca 4 cosas en fila solo porque 4 entran. Decidir que importa mas y dimensionar en consecuencia. Una metric grande + 3 secundarias > 4 equivalentes.

### 4. Progressive disclosure

**Regla:** Mostrar titular. Esconder el detalle hasta que el usuario lo pida. Drill-down via drawer, no navegacion.

### 5. Contexto persistente

**Regla:** El usuario nunca debe recordar en que contexto esta. Topbar breadcrumb + statusbar pulse + inspector subject se encargan.

### 6. Un solo camino por accion

**Regla:** Cada accion del usuario tiene una sola ruta clara. No 3 formas de llegar al mismo lugar.

### 7. Feedback inmediato

**Regla:** Toda accion muestra respuesta visual en <200ms. Si tarda mas, skeleton. Si falla, mensaje inline.

### 8. Keyboard-first para operadores

**Regla:** Todo lo usable con teclado, el mouse es para descubrir. Command palette global + shortcuts esenciales (no 20+).

**Simplificacion vs v1:** v1 tenia 30+ shortcuts. v2 reduce al minimo esencial — `Ctrl+K` (palette), `Ctrl+I` (inspector), `Esc` (close), `/` (search), `g + letra` (jumps), `j`/`k` (list nav), `1-5` (tabs). Nada mas. Se documenta en un overlay unico.

---

## Parte 2 — Arquitectura del shell de 5 zonas (corregida)

### 2.1 Diagrama

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOPBAR                              32px                            │  Z1
│  [breadcrumb] [context-pill] [search] [notif] [user]                 │
├──────────┬─────────────────────────────────────────────┬─────────────┤
│          │                                             │             │
│ SIDEBAR  │    MAIN CANVAS                              │  INSPECTOR  │
│ 220px    │    (view content — grid-driven)             │  360px      │
│ (Z2)     │                                             │  togglable  │
│ con      │    (Z3)                                     │  (Z4)       │
│ iconos   │                                             │             │
│          │                                             │             │
├──────────┴─────────────────────────────────────────────┴─────────────┤
│  STATUS BAR                          24px                            │  Z5
│  [● ws] [last log line]                  [uptime] [ver] [user]       │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Correcciones vs v1

| v1 decia | v2 dice | Motivo |
|---|---|---|
| Sidebar sin iconos (solo texto) | **Sidebar CON iconos + texto** | Hoy el panel tiene iconos (verified en `App.vue` navItems `{ to, label, icon }`). Sacarlos es regresion de descubribilidad. Los iconos no son "ruido" en un panel admin — son landmarks. |
| 3 densidades | **2 densidades: comfortable + dense** | Analyst dijo overkill. Mateo es power user unico, va a elegir una y quedarse. Menos codigo, menos bugs. |
| `.canvas` sin min-height | `.canvas { min-height: 0; min-width: 0 }` | Gotcha de grid-template-areas con overflow interno |
| `--pz-cell-pad: 28px 32px` | `--pz-cell-pad-y: 28px; --pz-cell-pad-x: 32px` | CSS aritmetica invalida sobre shorthand |
| InspectorPane nuevo | **Inspector pane es nuevo pero NO reutiliza SectionDrawer** | Mateo pidio no reutilizar nada de Brain |
| 30+ shortcuts | ~12 esenciales | Simplificacion |
| Nombre store: `ui` | **Nombre store: `shell`** (`useAppShellStore`) | Evita colision con `useSystemUIStore` existente |

### 2.3 Shell CSS (corregido)

```css
.shell {
  display: grid;
  grid-template:
    "topbar topbar topbar" 32px
    "sidebar canvas inspector" 1fr
    "status status status" 24px
    / 220px 1fr 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.shell--inspector-open {
  grid-template-columns: 220px 1fr 360px;
}

/* Narrow mode: canvas pierde row-4 cuando inspector abre en <1440 */
.shell--inspector-open .canvas { container-type: inline-size; }

.topbar    { grid-area: topbar;    min-width: 0; }
.sidebar   { grid-area: sidebar;   min-width: 0; min-height: 0; }
.canvas    { grid-area: canvas;    min-width: 0; min-height: 0; overflow-y: auto; overflow-x: hidden; }
.inspector { grid-area: inspector; min-width: 0; min-height: 0; overflow: hidden; }
.status    { grid-area: status;    min-width: 0; height: 24px; overflow: hidden; }

@media (max-width: 1024px) {
  .shell {
    grid-template:
      "topbar" 32px
      "canvas" 1fr
      "status" 24px
      / 1fr;
  }
  .sidebar   { position: fixed; top: 0; left: 0; bottom: 0; width: 220px;
               transform: translateX(-100%); z-index: 100;
               transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1); }
  .sidebar--open { transform: translateX(0); }
  .inspector { position: fixed; top: 32px; right: 0; bottom: 24px; width: 100%;
               max-width: 360px; z-index: 90;
               transform: translateX(100%);
               transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1); }
  .shell--inspector-open .inspector { transform: translateX(0); }
}
```

### 2.4 Z1 — Topbar (32px, siempre visible)

Contenido de izquierda a derecha:

- **Breadcrumb** — derivado de `$route.matched`. Formato: `Pegasuz / Clients / Acme`. Mono 11px, text-muted, ultimo segment text-primary.
- **Context pill** (cuando aplica) — `[TENANT · acme]` o `[ENV · production]` en pill style accent.
- **Spacer** (flex-grow)
- **Quick search** — icono de lupa + placeholder "Ctrl+K". Click o shortcut abre command palette.
- **Notification dot** — 6px, ilumina cuando hay alerts nuevos en brain store o system store.
- **User menu** — iniciales en square 22px + dropdown.

**Reglas:**
- Height exacto 32px, no 28, no 48.
- Border-bottom 1px solid var(--pz-border).
- Background var(--pz-bg-raised).
- Cada item responde una pregunta. Ninguno decorativo.

### 2.5 Z2 — Sidebar (220px, con iconos, agrupado)

**v1 decia:** Sidebar sin iconos (solo texto). **v2 corrige:** con iconos porque hoy los tiene y sacarlos es regresion de descubribilidad.

**Estructura:**

```
┌───────────────────────────┐
│ PEGASUZ           v8      │  brand block (48px)
├───────────────────────────┤
│                           │
│ OPERATIONS ─────          │  section label (mono 8px uppercase)
│  🏠 Dashboard             │
│  👥 Tenants               │
│  📄 CMS Contracts         │
│                           │
│ OBSERVABILITY ─────       │
│  🧠 Brain                 │
│  📊 System                │
│  📜 Logs                  │
│  🖥️ GPU                   │
│                           │
│ CONFIGURATION ─────       │
│  ⚙ Environment           │
│                           │
├───────────────────────────┤
│ [● system active]         │  pulse dot (footer)
└───────────────────────────┘
```

**Correccion:** Los iconos son los actuales del proyecto (no hay que inventar). Si algun nav item no tiene icono, se le asigna uno semantico. Tamaño 14px, color heredado del estado del link.

**Rules:**
- 3 grupos semanticos
- Section labels mono 8px uppercase 0.16em
- Items: icono 14px + body 13px, padding 10px 20px, border-left 2px transparent → accent on active
- Hover: background var(--pz-bg-surface) + padding-left 24px (micro-shift 4px)
- Active: background var(--pz-accent-soft) + border-left accent + text-primary
- Transition 150ms cubic-bezier(0.16, 1, 0.3, 1)

### 2.6 Z3 — Main canvas (grid-driven, edge-to-edge)

Cero padding en el canvas. El padding vive dentro de las cells del grid system (Parte 3).

### 2.7 Z4 — Inspector pane (360px, togglable, right-side)

**NUEVO componente**, NO reutiliza `SectionDrawer` del Brain. Mateo pidio no reutilizar nada de Brain.

Proposito: Mostrar detalle de algo seleccionado sin modal, sin navegar fuera. Casos de uso:
- ClientsView: click en tenant → inspector tabs (Overview, Features, Users, CMS, Audit)
- SystemPanelView: click en section card → inspector section detail
- LogsView: click en log line → inspector log detail
- LocalCommandView: click en modelo → inspector telemetry
- CmsContractsView: click en contract → inspector schema

**NO usado en BrainView.** BrainView tiene su propio drawer interno al diseño (Parte 4.1).

**Specs:**
- Width exacto 360px
- Background var(--pz-bg-base)
- Border-left 1px solid var(--pz-border)
- Header 32px con titulo + subtitle opcional + boton X
- Tab bar 28px
- Content scrollable independiente con padding var(--pz-cell-pad-y) var(--pz-cell-pad-x)
- Toggle: `Ctrl+I` o boton en topbar
- Anima con transform translateX (no width — performance)

**Contrato tecnico (correcciones del architect):**

```js
// src/stores/shell.js (NUEVO — NO es useSystemUIStore)
export const useAppShellStore = defineStore('appShell', () => {
  const sidebarCollapsed = ref(false)
  const density = ref(localStorage.getItem('pegasuz.shell.v1.density') || 'comfortable')

  // Inspector state con shallowRef para el subject (architect fix)
  const inspectorOpen = ref(false)
  const inspectorSubject = shallowRef(null)  // { type, id, data }
  const inspectorTabs = ref([])              // [{ key, label }]
  const inspectorActiveTab = ref(null)

  // Open inspector con markRaw en components
  const openInspector = (subject, tabs) => {
    inspectorSubject.value = subject
    inspectorTabs.value = tabs.map(t => ({ ...t, component: markRaw(t.component) }))
    inspectorActiveTab.value = tabs[0]?.key || null
    inspectorOpen.value = true
  }

  const closeInspector = () => {
    inspectorOpen.value = false
    // No borrar subject inmediatamente — permite animacion de cierre
    setTimeout(() => {
      if (!inspectorOpen.value) {
        inspectorSubject.value = null
        inspectorTabs.value = []
      }
    }, 200)
  }

  return { sidebarCollapsed, density, inspectorOpen, inspectorSubject,
           inspectorTabs, inspectorActiveTab, openInspector, closeInspector }
})
```

**Router integration (architect fix — critico):**

```js
// src/router/index.js — SOLO agregar afterEach, no tocar rutas
router.afterEach(() => {
  // Evitar componentes stale tras route change
  const shell = useAppShellStore()
  if (shell.inspectorOpen) shell.closeInspector()
})
```

### 2.8 Z5 — Status bar (24px, siempre visible)

Contenido izquierda a derecha:

```
● ws-live │ [last log line — mono 10px truncado]     │ uptime 3d │ v8.1.2 │ mateo
```

**Specs:**
- Height 24px
- Background var(--pz-bg-raised)
- Border-top 1px solid var(--pz-border)
- Font mono 10px uniforme
- Click en log line abre LogsView
- Click en ws dot muestra popover con stats de WS
- `aria-live="polite"` SOLO en el ws dot, NO en last log line (screen reader no grita) (architect fix)

### 2.9 Regla de inspector + canvas en breakpoints medios (architect fix)

Cuando inspector abre en viewport entre 1024-1440px, el canvas pierde espacio. Sin handling, `.canvas-row--4` tiene cells de <250px (inusable).

**Regla del inspector responsive:**

```css
.shell--inspector-open .canvas-row--4 { grid-template-columns: 1fr 1fr; }
.shell--inspector-open .canvas-row--3 { grid-template-columns: 1fr 1fr; }

@media (min-width: 1600px) {
  .shell--inspector-open .canvas-row--4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
  .shell--inspector-open .canvas-row--3 { grid-template-columns: 1fr 1fr 1fr; }
}
```

Cuando el inspector abre y hay menos de 1600px, las rows de 3 y 4 columnas degradan a 2. Cuando se cierra o hay espacio, vuelven.

---

## Parte 3 — Sistema de layout grid-first (corregido)

### 3.1 Tokens de layout (extension del namespace `--pz-*` existente)

v2 NO introduce un prefijo nuevo. Extiende los `--pz-*` del reskin ya ejecutado. Esto evita duplicacion de namespace y mantiene coherencia visual.

**Tokens que se REUSAN tal cual (ya existen):**

```css
/* Ya definidos — NO tocar */
--pz-bg-base, --pz-bg-raised, --pz-bg-surface, --pz-bg-card, --pz-bg-input
--pz-text-primary, --pz-text-secondary, --pz-text-muted, --pz-text-inverse
--pz-accent, --pz-accent-hover, --pz-accent-soft, --pz-accent-glow
--pz-border, --pz-border-strong, --pz-border-subtle, --pz-border-focus
--pz-success, --pz-success-soft, --pz-error, --pz-error-soft, --pz-warning, --pz-warning-soft, --pz-info, --pz-info-soft
--pz-font-display, --pz-font-body, --pz-font-mono
--pz-radius-sm/md/lg/xl/full (todos 0)
--pz-shadow-sm/md/lg/glow/card (todos none)
--pz-transition, --pz-transition-slow
--pz-space-xs/sm/md/lg/xl/2xl/3xl       ← para micro-spacing dentro de cells
--pz-sidebar-width                        ← 220px, matchea lo que v2 quiere
--pz-cell-pad                             ← 28px 32px, se preserva como shorthand
```

**Tokens que se MODIFICAN (valor nuevo):**

```css
/* Antes: 0px (topbar oculto en desktop). Ahora: 32px (siempre visible en v2). */
--pz-topbar-height: 32px;   /* era 0px */
```

**Tokens NUEVOS que v2 agrega al bloque `:root` de `design-system.css`:**

```css
:root {
  /* === v2 layout additions === */

  /* Cell padding split por axis (para aritmetica calc()) */
  --pz-cell-pad-y:    28px;
  --pz-cell-pad-x:    32px;
  /* --pz-cell-pad (shorthand) se redefine para usar los anteriores */
  --pz-cell-pad:      var(--pz-cell-pad-y) var(--pz-cell-pad-x);

  /* Shell primitives nuevos */
  --pz-statusbar-height: 24px;
  --pz-inspector-width:  360px;

  /* Gap constante del grid (nuevo) */
  --pz-gap: 1px;

  /* Prose constraint para texto largo (MarkdownDocument) */
  --pz-prose-w: 65ch;

  /* Z-index scale unica (ninguno existia hardcoded en tokens) */
  --pz-z-canvas:    1;
  --pz-z-sticky:    10;
  --pz-z-inspector: 80;
  --pz-z-sidebar-m: 100;
  --pz-z-drawer:    200;
  --pz-z-modal:     300;
  --pz-z-palette:   350;
  --pz-z-toast:     400;
  --pz-z-tooltip:   500;
}

/* Densidad — solo 2 modos (simplificacion vs v1) */
[data-density="comfortable"] {
  --pz-cell-pad-y: 28px;
  --pz-cell-pad-x: 32px;
}
[data-density="dense"] {
  --pz-cell-pad-y: 16px;
  --pz-cell-pad-x: 20px;
}

/* Reduced motion — global */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Total:** ~15 tokens nuevos + 1 modificado. Nada de `--pz-*` paralelos. Los CSS examples del resto del documento usan `--pz-*` consistente con el codebase existente.

### 3.2 Las primitivas — 5 componentes, sin excepciones

```css
.canvas {
  grid-area: canvas;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;  /* v2 fix */
  min-width: 0;   /* v2 fix */
  background: var(--pz-border);  /* el fondo del canvas ES la linea separadora */
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--pz-gap);
}

.canvas > * { background: var(--pz-bg-base); }

.canvas-row {
  display: grid;
  gap: var(--pz-gap);
  background: var(--pz-border);
  grid-auto-rows: min-content;
}

.canvas-row > * { background: var(--pz-bg-base); }

.canvas-row--1       { grid-template-columns: 1fr; }
.canvas-row--2       { grid-template-columns: 1fr 1fr; }
.canvas-row--3       { grid-template-columns: 1fr 1fr 1fr; }
.canvas-row--4       { grid-template-columns: 1fr 1fr 1fr 1fr; }
.canvas-row--aside   { grid-template-columns: 1fr 320px; }
.canvas-row--aside-l { grid-template-columns: 320px 1fr; }
.canvas-row--golden  { grid-template-columns: 1.618fr 1fr; }

.canvas-cell {
  padding: var(--pz-cell-pad);
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* Hero cell — mas aire vertical */
.canvas-cell-hero {
  padding-inline: var(--pz-cell-pad-x);
  padding-block: calc(var(--pz-cell-pad-y) * 1.5);  /* v2 fix — ahora es aritmetica valida */
}

/* Flush cell — v2 fix: el legitimate padding: 0 */
.canvas-cell--flush {
  padding: 0;
}

.canvas-stack {
  display: grid;
  gap: 16px;
}
```

**El `canvas-cell--flush` reemplaza los 3 `style="padding: 0;"` de v1.** Se usa en cells que contienen tablas o componentes con padding propio (`<ClientTable>`, `<LogsConsole>`). Es una exception legitimizada, no un hack.

### 3.3 Responsive — breakpoints definitivos

```css
@media (max-width: 1600px) {
  /* cuando inspector abre, rows de 4 y 3 degradan */
  .shell--inspector-open .canvas-row--4 { grid-template-columns: 1fr 1fr; }
  .shell--inspector-open .canvas-row--3 { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 1280px) {
  .canvas-row--4 { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 1024px) {
  .canvas-row--4 { grid-template-columns: 1fr 1fr; }
  .canvas-row--3 { grid-template-columns: 1fr 1fr; }
  .canvas-row--aside   { grid-template-columns: 1fr; }
  .canvas-row--aside-l { grid-template-columns: 1fr; }
  .canvas-row--golden  { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .canvas-row--2 { grid-template-columns: 1fr; }
  .canvas-row--3 { grid-template-columns: 1fr; }
  .canvas-row--4 { grid-template-columns: 1fr; }
  :root { --pz-cell-pad-y: 16px; --pz-cell-pad-x: 16px; }
}
```

### 3.4 Scope mobile — confirmar con Mateo

**Pregunta abierta (analyst):** ¿Mateo abre el SuperAdmin en mobile? Si no, Fase 13 puede recortarse a solo 1280-2560 y ahorrar ~3h de trabajo. Default: full range 768-2560. Confirmar antes de Fase 13.

### 3.5 Anti-patterns prohibidos

| Anti-pattern | Por que | Que usar |
|---|---|---|
| `padding: 24px` hardcoded | Rompe densidad | `var(--pz-cell-pad)` |
| `margin` entre cells | Separador es gap | Nada — dejar el gap hacer el trabajo |
| `border` entre cells | Duplica gap | Nada — el gap es el border |
| `grid-template-columns` ad-hoc | No determinista | Solo las 7 variantes definidas |
| `style="padding: 0;"` inline | Hack | `.canvas-cell--flush` class |
| `box-shadow` visible en cells | Eros es flat | Nada |
| `border-radius` en cells | Eros es angular | Nada (default 0) |

---

## Parte 4 — View-by-view reform (v2)

Orden de impacto (de mas transformativa a menos):

1. **BrainView** — rebuild completo desde cero (la pieza mas critica del plan)
2. **ClientsView** — Fase 7a extrae modales inline, despues split + inspector
3. **DashboardView** — jerarquia radical: 1 hero + 4 context + feed
4. **LocalCommandView** — hero + progressive bands, similar filosofia a Brain
5. **SystemPanelView** — refinar pattern existente, usar nuevo inspector
6. **LogsView** — sticky filter + keyboard shortcuts
7. **CmsContractsView** — table + inspector minimal
8. **CreateClientView** — wizard simplificado (NUEVO en v2, v1 lo olvidaba)
9. **EnvManagerView** — single column clean
10. **LoginView** — minima intervencion

---

## 4.1 BrainView — rebuild completo

### El problema, en palabras de Mateo

> "es muy estresante el view de brain"

> "no puede aparecer vacio cuando entras a esa seccion"

Dos sintomas, un origen: **nadie decidio que importa mas que que**. Los 22 section components estan apilados con el mismo peso visual. Cada uno puede estar en estado "cargando", "sin data", o "con 10 metricas". El ojo no encuentra donde aterrizar (abrumo) y simultaneamente ve rectangulos vacios (loading, collapsed, null data).

### La filosofia del rebuild

**Calma primero, profundidad a demanda.** Cuando Mateo abre BrainView ve una sola respuesta grande: *¿esta el brain OK?*. Un numero. Una palabra. Cuatro facts. Eso es todo — 5 elementos grandes en el primer viewport.

Si quiere mas, scrolleando encuentra bandas progresivas de contexto. Cada banda responde una pregunta. Cada banda tiene sus propios 4 estados (data/loading/empty/error) — ninguna puede verse vacia.

Si quiere profundidad total, al final hay un "explorer" — un grid de 22 tiles con health dot + nombre, cada uno click abre un drawer con los datos raw de esa seccion. Las 22 secciones NO se renderean inline simultaneamente. Nunca. Eso es el origen del stress.

### Qué NO se reutiliza (Mateo explicit)

```
❌ src/views/system/BrainView.vue               — se REESCRIBE
❌ src/components/system/brain/*.vue            — 22 section components NO se usan
❌ src/components/system/brain/BrainSectionWrap.vue  — NO se usa
❌ src/components/system/brain/useBrainSections.js   — NO se usa
❌ src/components/system/brain/useBrainCommandPalette.js — NO se usa
❌ src/components/system/brain/useBrainMode.js       — NO se usa
❌ src/components/system/brain/useBrainCoherence.js  — NO se usa
❌ src/components/system/brain/useBrainAnomalies.js  — NO se usa
❌ src/components/system/brain/useBrainI18n.js       — NO se usa (v2 usa strings crudas por ahora)
❌ src/components/system/brain/useBrainOffice.js     — NO se usa
❌ src/components/system/brain/useMetricHistory.js   — NO se usa
❌ src/components/system/brain/useFlashOnChange.js   — NO se usa
❌ src/components/system/brain/useAnimatedNumber.js  — NO se usa
❌ src/components/system/brain/useTimeAgo.js         — NO se usa
❌ src/components/system/SectionDrawer.vue           — NO se usa en BrainView (si en otras views)
```

### Que SI se usa (porque es la fuente de datos)

```
✓ src/stores/system/brain.js (useBrainStore)   — fuente unica de data del cerebro
✓ src/stores/system/socket.js (useSystemSocketStore) — WebSocket real-time
```

Esto es todo. El rediseño lee data directamente del store Pinia, sin pasar por los composables de UI viejos.

### El layout — 5 bandas progresivas

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  BAND 1 — HERO "Is the brain OK?"                              │  ~40% viewport
│                                                                 │  siempre visible
│              78                                                 │  primer render
│           COHERENT                                              │
│         ●●●●●●●○○○                                              │
│                                                                 │
│  ACTIVE         MODE          NEXT CYCLE     LAST ACTIVITY     │
│  4,291 cycles   AUTO          in 12m         2 min ago         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BAND 2 — PULSE "Que ha estado pasando?"                       │
│                                                                 │
│  coherence  ▁▂▃▅▆▇█▇▆▅ (sparkline 16 puntos, last 30min)       │
│  activity   ▁▃▅▇▅▃▁▂▄▆ (sparkline 16 puntos, last 30min)       │
│                                                                 │
│  LAST 3 DECISIONS                                               │
│   2min ago   — promote rule "ai-fingerprint-fonts"             │
│   14min ago  — reject approach "gradient-placeholder"           │
│   28min ago  — learn pattern "warm-near-blacks works"           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BAND 3 — CURRENT "Que esta haciendo ahora?"                   │
│                                                                 │
│  Cycle 4291        Agent: executor       Task: impl hero-band   │
│  ████████░░ 67%    started 8min ago      waiting on: verifier   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BAND 4 — EVOLUTION "Que esta cambiando?"                      │
│                                                                 │
│  RECENT LEARNINGS (5)    PENDING ROLLOUTS (3)   TESTING (12)   │
│  - font stack valida     - new grid system       9 pass         │
│  - gap-as-separator ok   - dense density mode    2 fail         │
│  - 4 col at ultrawide    - inspector pane        1 skip         │
│  - anti pattern noted                                           │
│  - experiment budget                                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BAND 5 — ARCHIVE "Explorar todo"                              │
│                                                                 │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐           │
│  │STAT●│CTX ●│WTCH●│DEC ●│LRN ●│TST ●│EVO ●│           │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤           │
│  │ROL ●│RTG ●│GAP ●│KNW ●│EXP ●│AGT ●│CNT ●│           │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤           │
│  │PRD ●│SES ●│BLG ●│INT ●│VIZ ●│OFF ●│SLF ●│           │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┤           │
│  │GOV ●│                                             │           │
│  └──────┘                                             │           │
│                                                                 │
│  (click en tile → abre BrainDeepDrawer con data raw)           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Specs por banda

#### BAND 1 — HERO "Is the brain OK?"

**Componente:** `src/views/system/brain-v2/BrainHeroBand.vue` (NUEVO)

**Layout:**
- Cell hero full-width (`.canvas-row--1 > .canvas-cell-hero`)
- Padding vertical generoso (`calc(var(--pz-cell-pad-y) * 2)`)
- Alineacion centrada horizontalmente

**Contenido:**
- Numero coherence grande: `font: 700 clamp(96px, 12vw, 160px)/0.85 var(--pz-font-display); letter-spacing: -0.04em`
- Label debajo: `font: 600 14px var(--pz-font-mono); letter-spacing: 0.18em; text-transform: uppercase`. Texto: "COHERENT" si >= 70, "STRAINED" si 50-69, "CRITICAL" si < 50.
- Dot gauge de 10 dots 8px cada uno: relleno segun coherence/10. Accent color.
- Row de 4 context facts abajo (grid 4-col interno):
  - ACTIVE: cycle count total
  - MODE: AUTO / MANUAL / PAUSED
  - NEXT CYCLE: tiempo hasta proximo cycle (countdown)
  - LAST ACTIVITY: tiempo desde ultimo evento (relativo: "2 min ago")

**Data source (directo del store, NO composables):**
```js
const brain = useBrainStore()

// Coherence calculation — v2 no reutiliza useBrainCoherence
// Aca metemos el calculo inline o en un helper local al componente
const coherenceScore = computed(() => {
  if (!brain.data) return null
  // Simple: promedio de healthFactors definidos en store
  // (si el store ya lo calcula, usar brain.health directamente)
  return brain.health ?? null
})

const coherenceLabel = computed(() => {
  const s = coherenceScore.value
  if (s === null) return 'LOADING'
  if (s >= 70) return 'COHERENT'
  if (s >= 50) return 'STRAINED'
  return 'CRITICAL'
})

const cycleCount = computed(() => brain.data?.state?.cycles ?? null)
const mode       = computed(() => brain.data?.state?.mode ?? 'LOADING')
const nextCycle  = computed(() => brain.data?.state?.next_cycle_eta ?? null)
const lastActivity = computed(() => brain.data?.state?.last_activity_ts ?? null)
```

**Estados de empty/loading para BAND 1:**

```js
// Never empty rule
const state = computed(() => {
  if (brain.error) return 'error'
  if (brain.loading && !brain.data) return 'loading'
  if (!brain.data || coherenceScore.value === null) return 'empty'
  return 'data'
})
```

Cuando `state === 'loading'`:
- Numero grande reemplazado por 3 dots pulsantes animados (8px cada, 80px total)
- Label: "STARTING UP"
- Dot gauge todos gris con pulse
- Context facts: "—" (guion em) en vez de valores

Cuando `state === 'empty'`:
- Numero reemplazado por: "—"
- Label: "WAITING"
- Mensaje pequeño abajo: "Esperando primer ciclo. El cerebro esta iniciando pero aun no reporta data."
- Context facts: `—`

Cuando `state === 'error'`:
- Banner inline debajo del hero (no modal) con: "Error al conectar con el cerebro. Retry."
- Boton retry dispara `brain.fetch()`
- Hero queda en estado empty mientras

**El hero nunca esta vacio.** Siempre muestra algo.

#### BAND 2 — PULSE "Que ha estado pasando?"

**Componente:** `src/views/system/brain-v2/BrainPulseBand.vue` (NUEVO)

**Layout:**
- `.canvas-row--golden` — 1.618fr | 1fr
- Col izquierda (1.618fr): sparklines
- Col derecha (1fr): ultima 3 decisiones

**Sparklines (sin reutilizar useMetricHistory):**

```js
// Tracking local de last 30min con ring buffer
const RING_SIZE = 30
const coherenceRing = ref(Array(RING_SIZE).fill(null))
const activityRing  = ref(Array(RING_SIZE).fill(null))

// Push cada vez que llega un brain update
watch(() => brain.data, (d) => {
  if (d?.state) {
    coherenceRing.value = [...coherenceRing.value.slice(1), brain.health ?? null]
    activityRing.value  = [...activityRing.value.slice(1),  d.state.activity_rate ?? null]
  }
}, { deep: true })
```

**Sparkline render (SVG puro, sin libs):**

```vue
<svg class="sparkline" viewBox="0 0 300 40">
  <polyline
    :points="sparklinePoints(coherenceRing)"
    fill="none"
    stroke="var(--pz-accent)"
    stroke-width="1.5"
  />
</svg>
```

**Ultimas 3 decisiones (lista):**

```js
const lastDecisions = computed(() => {
  const recs = brain.data?.learning?.cycle_records ?? []
  return recs.slice(-3).reverse().map(r => ({
    id: r.cycle_id,
    ts: r.timestamp,
    description: r.outcome || r.decision || '(sin descripcion)',
    agoLabel: formatTimeAgo(r.timestamp),  // helper local, no useTimeAgo
  }))
})
```

**Empty state:**
- Sparklines con 0 data: linea horizontal gris con texto "Acumulando primeros 30 minutos..."
- Decisiones con 0 items: "Aun sin decisiones registradas. El proximo ciclo llegara en {nextCycle}."

#### BAND 3 — CURRENT "Que esta haciendo ahora?"

**Componente:** `src/views/system/brain-v2/BrainCurrentBand.vue` (NUEVO)

**Layout:** `.canvas-row--3` (cycle | agent | task) o `.canvas-row--1` con grid interno segun decision estetica.

**Contenido:**
- Cycle id + progress bar horizontal (2px height, accent fill)
- Agent activo (nombre + tiempo activo)
- Task actual (descripcion corta + "waiting on: X")

**Data source:**
```js
const currentCycle = computed(() => brain.data?.current_cycle ?? null)
const currentAgent = computed(() => brain.data?.current_agent ?? null)
const currentTask  = computed(() => brain.data?.current_task ?? null)
```

**Empty state:**
- Cycle: "No cycle running" + boton "Start manual cycle" (si mode es MANUAL)
- Agent: "Idle"
- Task: "Waiting for next cycle"

No hay rectangulos en blanco. Siempre texto intencional.

#### BAND 4 — EVOLUTION "Que esta cambiando?"

**Componente:** `src/views/system/brain-v2/BrainEvolutionBand.vue` (NUEVO)

**Layout:** `.canvas-row--3` (learnings | rollouts | testing)

**Contenido:**
- **Learnings:** lista de los 5 mas recientes (titulo + tiempo relativo). Click abre BrainDeepDrawer con detalle.
- **Rollouts:** lista de hasta 3 pending rollouts (nombre + estado). Click abre drawer.
- **Testing:** 3 contadores grandes: pass (verde) / fail (rojo) / skip (gris).

**Data source:**
```js
const recentLearnings = computed(() => brain.data?.learning?.recent?.slice(0, 5) ?? [])
const pendingRollouts = computed(() => brain.data?.operational?.pending_rollouts?.slice(0, 3) ?? [])
const testingStats = computed(() => ({
  pass: brain.data?.testing?.pass_count ?? 0,
  fail: brain.data?.testing?.fail_count ?? 0,
  skip: brain.data?.testing?.skip_count ?? 0,
}))
```

**Empty states individuales por cell:**
- Learnings 0 items: "Brain aun no ha aprendido patterns nuevos en este session."
- Rollouts 0 items: "No hay cambios pendientes de deploy."
- Testing 0/0/0: "Aun sin tests ejecutados este session."

#### BAND 5 — ARCHIVE "Explorar todo"

**Componente:** `src/views/system/brain-v2/BrainArchiveGrid.vue` (NUEVO)

Esta es la unica banda donde aparecen las 22 secciones — pero **como tiles pequeños, NO con sus datos inline**.

**Layout:** Grid interno 7 columnas × 4 filas (22 tiles con 6 huecos):

```css
.brain-archive-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--pz-border);
  padding: var(--pz-cell-pad);
}
.brain-archive-grid > .tile { background: var(--pz-bg-base); }
```

**Cada tile (~80×80px):**

```
┌──────────┐
│ STAT  ● │   ← codigo 4 letras + health dot
│  142    │   ← un numero KPI principal de la seccion
└──────────┘
```

- Codigo 4 letras mono 10px uppercase: STAT, CTX, WTCH, DEC, LRN, TST, EVO, ROL, RTG, GAP, KNW, EXP, AGT, CNT, PRD, SES, BLG, INT, VIZ, OFF, SLF, GOV
- Health dot 6px (verde/amarillo/rojo segun `brain.data.sectionHealth[key]`)
- Un numero KPI derivado de `brain.data[sectionKey]` — el que tenga sentido como indicador (count de rules, trust promedio, count de gaps, etc)
- Tooltip on hover con nombre completo ("System Status", "Context", etc)

**Click en tile abre `BrainDeepDrawer`** (nuevo componente — ver abajo).

**Empty state tile:** Si no hay data para esa seccion, tile en gris con `—` en vez de numero. Health dot gris. Click muestra drawer con mensaje "Aun sin data para esta seccion."

### Componente nuevo: BrainDeepDrawer

**Archivo:** `src/views/system/brain-v2/BrainDeepDrawer.vue` (NUEVO, NO es el InspectorPane global)

**Por que un drawer propio?** Mateo pidio no reutilizar nada de Brain. SectionDrawer se usa en otras views (SystemPanel) pero no en el nuevo BrainView. BrainDeepDrawer es local al modulo brain-v2 y se especializa en mostrar data raw de una seccion.

**Specs:**
- Modal-style drawer desde la derecha (slide in)
- Width 480px (mas ancho que Inspector normal — data raw es densa)
- Header: codigo 4 letras + nombre completo + boton cerrar
- Content: data raw de la seccion formateada en tabla key-value o JSON-pretty
- Footer: boton "Ver en modo OPS" (link que copia el JSON al clipboard)

**Render logic:**

```vue
<template>
  <Transition name="drawer">
    <aside v-if="open" class="brain-deep-drawer">
      <header class="bdd-head">
        <span class="bdd-code">{{ section.code }}</span>
        <h2 class="bdd-title">{{ section.title }}</h2>
        <button @click="close">✕</button>
      </header>

      <div class="bdd-body">
        <!-- Empty state -->
        <div v-if="!sectionData" class="bdd-empty">
          Aun sin data para {{ section.title }}. El proximo ciclo del cerebro traera actualizaciones.
        </div>

        <!-- Render raw data -->
        <div v-else class="bdd-kv">
          <div v-for="[key, value] in flattenEntries(sectionData)" :key="key" class="kv-row">
            <span class="kv-key">{{ key }}</span>
            <span class="kv-val">{{ formatValue(value) }}</span>
          </div>
        </div>
      </div>

      <footer class="bdd-foot">
        <button class="pz-btn pz-btn-ghost" @click="copyJson">Copy JSON</button>
      </footer>
    </aside>
  </Transition>
</template>
```

**Helpers locales:**
- `flattenEntries(obj)` — convierte objeto nested a lista de `[path, value]` pares (max depth 2)
- `formatValue(v)` — formatea numeros, fechas, booleans, strings, arrays
- `copyJson()` — clipboard API

**Sin reutilizacion de:** `BrainSectionWrap`, `SectionDrawer`, `BrainRawRenderer`. Es un componente aislado.

### Estructura de archivos de brain-v2

```
src/views/system/
  BrainView.vue                    ← REESCRIBE (queda solo como wrapper que importa brain-v2)
  brain-v2/
    BrainHeroBand.vue              ← NUEVO
    BrainPulseBand.vue             ← NUEVO
    BrainCurrentBand.vue           ← NUEVO
    BrainEvolutionBand.vue         ← NUEVO
    BrainArchiveGrid.vue           ← NUEVO
    BrainDeepDrawer.vue            ← NUEVO
    helpers/
      coherence.js                 ← calculo de coherence sin useBrainCoherence
      timeAgo.js                   ← format relativo sin useTimeAgo
      sparkline.js                 ← SVG polyline points
      flatten.js                   ← flatten nested objects
      sectionMeta.js               ← mapping de 22 sections a {code, title, kpiPath, healthPath}
```

### BrainView.vue (el wrapper nuevo)

```vue
<script setup>
import { useBrainStore, useSystemSocketStore } from '@/stores/system'
import BrainHeroBand from './brain-v2/BrainHeroBand.vue'
import BrainPulseBand from './brain-v2/BrainPulseBand.vue'
import BrainCurrentBand from './brain-v2/BrainCurrentBand.vue'
import BrainEvolutionBand from './brain-v2/BrainEvolutionBand.vue'
import BrainArchiveGrid from './brain-v2/BrainArchiveGrid.vue'
import BrainDeepDrawer from './brain-v2/BrainDeepDrawer.vue'
import { onMounted, onUnmounted, ref } from 'vue'

const brain = useBrainStore()
const socket = useSystemSocketStore()

onMounted(() => {
  brain.fetch()
  // WS ya conectado por el shell store — aca solo subscribirnos si hace falta
})

// Drawer state local a BrainView
const drawerOpen = ref(false)
const drawerSection = ref(null)

function openSection(sectionKey) {
  drawerSection.value = sectionKey
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
}
</script>

<template>
  <div class="canvas">
    <div class="canvas-row canvas-row--1">
      <BrainHeroBand class="canvas-cell canvas-cell-hero" />
    </div>

    <div class="canvas-row canvas-row--golden">
      <BrainPulseBand class="canvas-cell" />
    </div>

    <div class="canvas-row canvas-row--1">
      <BrainCurrentBand class="canvas-cell" />
    </div>

    <div class="canvas-row canvas-row--1">
      <BrainEvolutionBand class="canvas-cell" />
    </div>

    <div class="canvas-row canvas-row--1">
      <BrainArchiveGrid class="canvas-cell canvas-cell--flush" @open-section="openSection" />
    </div>

    <BrainDeepDrawer :open="drawerOpen" :section-key="drawerSection" @close="closeDrawer" />
  </div>
</template>
```

**~40 lineas de Vue.** Una view entera. Eso es simplicidad.

### Que pasa con los 22 Brain*Section.vue componentes viejos?

**Se vuelven codigo muerto.** Fase 14 los borra. Si por alguna razon se quiere preservar la raw data view de un section, se puede extraer su render logic al BrainDeepDrawer — pero como lectura, no como composable de UX.

Riesgo de esta decision: se pierde la densidad informacional de vistas como `BrainGovernanceSection` (que muestra 10+ metricas). Mitigacion: BrainDeepDrawer puede crecer hasta mostrar todo lo que la seccion tenia, pero como raw data, no como UI compleja. Si un seccion especifica justifica UI mas rica, se hace un drawer especializado (`BrainGovernanceDrawer.vue`) manualmente, sin reutilizar el section viejo.

**Decision explicita:** empezamos minimalista (solo raw data en drawer). Si despues de ejecutar y usar Mateo dice "falta X seccion en detalle", iteramos.

### Keyboard shortcuts en BrainView v2

Solo los esenciales:
- `r` — force refresh
- `1` — scroll to HERO
- `2` — scroll to PULSE
- `3` — scroll to CURRENT
- `4` — scroll to EVOLUTION
- `5` — scroll to ARCHIVE
- `Escape` — cerrar BrainDeepDrawer si abierto

NO hay:
- `Ctrl+.` para density (eso es global del shell)
- `Ctrl+K` para palette (global del shell)
- `j/k` navigation (no hay lista focused)

### Verificacion de la regla "nunca vacio" en BrainView v2

**Test manual obligatorio en Fase 10:**

1. Abrir BrainView con WebSocket desconectado → debe verse: hero en "STARTING UP" con dots, pulse en "Acumulando datos...", current en "Idle", evolution con 3 celdas empty-state, archive con tiles gris. Ningun rectangulo vacio.

2. Abrir BrainView con brain.data null → mismo comportamiento, todas las bandas en empty state.

3. Abrir BrainView con brain fresco (data existe pero sin history) → hero muestra data real, pulse sparklines vacios con "Acumulando primer 30min", current con cycle actual, evolution puede tener 0 items por band (cada una con empty state intencional), archive con tiles mostrando la data que existe.

4. Abrir BrainView con brain maduro → todo renderiza data real.

**En ninguno de los 4 escenarios debe haber un espacio sin mensaje.**

---

## 4.2 ClientsView — Fase 7a (extract) + Fase 7b (split + inspector)

### El problema real (verificado en codigo)

`ClientsView.vue` tiene:
- Import de `UserModal` (separado, OK)
- **FeaturesModal INLINE** en `ClientsView.vue:522-688` (167 lineas de markup)
- **CmsModal INLINE** en `ClientsView.vue:690-800+` (~110 lineas)
- 3 refs de state (`showUsersModal`, `showFeaturesModal`, `showCmsModal`)
- Funciones distribuidas de open/close/refresh para cada uno

El critic tenia razon — los modales son inline. v1 decia "reusar la logica del FeaturesModal existente" sin darse cuenta que no existe como archivo.

### Fase 7a — Extraer modales inline (prerequisito)

**Objetivo:** Convertir los modales inline en componentes separados en `src/components/clients/modals/` sin cambiar logica.

**Archivos a crear:**
- `src/components/clients/modals/FeaturesModal.vue` — extraer lineas 522-688
- `src/components/clients/modals/CmsModal.vue` — extraer lineas 690-800+

**Contrato de cada modal extraido:**

```vue
<!-- FeaturesModal.vue -->
<script setup>
const props = defineProps({
  visible: Boolean,
  tenant: Object,  // selectedFeaturesClient
  featuresForm: Object,
  translationForm: Object,
  // ... resto de props que vienen del state actual
})

const emit = defineEmits([
  'close',
  'save',
  'toggle-feature',
  'sync-translations',
])
</script>

<template>
  <div v-if="visible" class="pz-overlay" @click.self="$emit('close')">
    <!-- ... markup identico a lineas 522-688 ... -->
  </div>
</template>
```

**ClientsView.vue despues de Fase 7a:**

```vue
<FeaturesModal
  :visible="showFeaturesModal"
  :tenant="selectedFeaturesClient"
  :features-form="featuresForm"
  :translation-form="translationForm"
  @close="closeFeaturesModal"
  @save="saveFeatures"
  @sync-translations="syncExistingTranslations"
/>
```

**Check de Fase 7a:**
- Click en features de cualquier tenant abre modal con los mismos datos
- Toggle de cualquier feature funciona
- Save funciona
- Translation sync funciona
- CMS modal igual

Sin cambiar UX — solo refactor de codigo. Esto desbloquea Fase 7b.

### Fase 7b — Split table + inspector

**Layout nuevo:**

```html
<div class="canvas">
  <!-- Row 1: context header -->
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell">
      <ClientsContextHeader
        :count="clients.length"
        :filter="filter"
        @filter-change="filter = $event"
        @new-tenant="goToCreate"
      />
    </div>
  </div>

  <!-- Row 2: table -->
  <div class="canvas-row canvas-row--1" style="flex: 1;">
    <div class="canvas-cell canvas-cell--flush">
      <ClientTable
        :clients="filteredClients"
        :loading="loading"
        :selected-slug="selectedClient?.slug"
        @row-click="openInspector"
        @disable-client="disableClient"
        @enable-client="enableClient"
        @delete-client="deleteClient"
      />
    </div>
  </div>
</div>
```

**Y el inspector se llena desde el shell store:**

```js
function openInspector(client) {
  selectedClient.value = client
  shell.openInspector(
    { type: 'tenant', id: client.slug, data: client },
    [
      { key: 'overview', label: 'Overview', component: TenantOverviewTab },
      { key: 'features', label: 'Features', component: TenantFeaturesTab },
      { key: 'users',    label: 'Users',    component: TenantUsersTab },
      { key: 'cms',      label: 'CMS',      component: TenantCmsTab },
      { key: 'audit',    label: 'Audit',    component: TenantAuditTab },
    ]
  )
}
```

**Componentes nuevos (Inspector tabs):**

```
src/components/inspector/tenant/
  TenantOverviewTab.vue    ← NUEVO: lee props.subject.data + muestra info general
  TenantFeaturesTab.vue    ← REUSA FeaturesModal refactorizado — pasa props en vez de modal wrapper
  TenantUsersTab.vue       ← REUSA UserModal refactorizado
  TenantCmsTab.vue         ← REUSA CmsModal refactorizado
  TenantAuditTab.vue       ← NUEVO: ultimos 20 eventos del tenant
```

**Importante:** Las Fases 7a y 7b son **secuenciales**. 7a debe pasar su check antes de iniciar 7b.

**Keyboard shortcuts:**
- `j`/`k` — next/prev row con auto-scroll
- `i` o `Enter` — abrir inspector del row activo
- `Esc` — cerrar inspector y deseleccionar
- `/` — focus search en context header
- `n` — go to create new tenant

**Modales que sobreviven:** Solo `DeleteConfirmModal` (accion destructiva). El resto muere en Fase 14.

---

## 4.3 DashboardView — jerarquia radical

### El problema

13 elementos equiweighted sin jerarquia:
- 4 stat cards iguales
- 4 quick cards iguales
- 1 tabla "Recent Tenants"
- 4 system status items

### El nuevo layout

```html
<div class="canvas">
  <!-- Row 1: HERO — un solo indicador dominante -->
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell canvas-cell-hero">
      <SystemPulseHero />
    </div>
  </div>

  <!-- Row 2: CONTEXT — 4 metricas secundarias -->
  <div class="canvas-row canvas-row--4">
    <div class="canvas-cell">
      <MetricCell label="TENANTS" :value="tenantsCount" suffix="total" />
    </div>
    <div class="canvas-cell">
      <MetricCell label="ACTIVE" :value="activeCount" :suffix="`/${tenantsCount}`" />
    </div>
    <div class="canvas-cell">
      <MetricCell label="ERRORS" :value="errorCount" suffix="last 1h" variant="warn" />
    </div>
    <div class="canvas-cell">
      <MetricCell label="UPTIME" :value="uptimePct" suffix="%" />
    </div>
  </div>

  <!-- Row 3: DRILL-DOWN — activity feed + quick actions -->
  <div class="canvas-row canvas-row--golden">
    <div class="canvas-cell">
      <RecentActivityFeed />
    </div>
    <div class="canvas-cell">
      <QuickActions />
    </div>
  </div>
</div>
```

### `SystemPulseHero` — hero component

Similar filosofia al BrainHeroBand — calma primero:
- Un numero grande: system health 0-100 (computed de latency + error rate + uptime)
- Label: "GOOD" / "DEGRADED" / "CRITICAL"
- Sparkline 24h de system health
- **Empty state:** "System metrics loading..." con pulse

### Empty states obligatorios en Dashboard

- Tenants count: "0 tenants yet" si cero
- Errors: "No errors in last hour" (positive empty state) si cero
- Activity feed: "No recent events. The system has been quiet." si cero
- Quick actions: siempre tiene contenido (son links)

---

## 4.4 LocalCommandView — hero + progressive bands

### El problema

Segun audit: 15+ subcomponentes (ModelBenchmark, NodeStatus, RoutingDecision, ErrorSignatures, TokenUsage, LatencyGraphs, etc) apilados. Similar al stress de BrainView.

### La solucion

Misma filosofia que BrainView v2: 5 bands progresivas.

```
BAND 1 — HERO: active models + health + mode
BAND 2 — TELEMETRY: latency sparkline + token usage + cost
BAND 3 — ACTIVE REQUEST: current request being processed
BAND 4 — ERRORS: recent error signatures
BAND 5 — MODELS GRID: tiles de cada modelo con click → drawer
```

**Componentes:** `src/views/system/local-command-v2/LocalHeroBand.vue`, `LocalTelemetryBand.vue`, `LocalActiveBand.vue`, `LocalErrorsBand.vue`, `LocalModelsGrid.vue`, `LocalDeepDrawer.vue`.

**Igual que Brain:** no se reutilizan componentes viejos (`ModelBenchmark`, `NodeStatus`, etc). Se reescribe usando el store `useLocalCommandStore` (o el que sea).

**Decision:** si el scope es demasiado, **LocalCommandView puede ir a v3**. Prioridad es BrainView. LocalCommand se marca como "stretch goal" y se ejecuta solo si el tiempo lo permite post Fase 10.

---

## 4.5 SystemPanelView — refine existing pattern + new inspector

### Lo que se preserva

SystemPanelView ya tiene el pattern HUD + drawer drill-down que funciona razonablemente. Solo refinar:

1. Migrar el layout a `.canvas-row--3` grid (12 sections en 4 filas de 3)
2. Agregar hero band de 4 system-wide metricas (hosts, alerts, uptime, load)
3. Reemplazar `SectionDrawer` interno con el **Inspector global** (`useAppShellStore.openInspector`)
4. Empty states por card

### Layout

```html
<div class="canvas">
  <!-- Row 1: HERO — metricas agregadas -->
  <div class="canvas-row canvas-row--4">
    <div class="canvas-cell"><MetricCell label="HOSTS" :value="hosts" /></div>
    <div class="canvas-cell"><MetricCell label="ALERTS" :value="alerts" variant="warn" /></div>
    <div class="canvas-cell"><MetricCell label="UPTIME" :value="uptime" suffix="%" /></div>
    <div class="canvas-cell"><MetricCell label="LOAD" :value="load" /></div>
  </div>

  <!-- Rows 2-5: 12 HUD cards -->
  <div class="canvas-row canvas-row--3">
    <div class="canvas-cell"><SystemCard subject="performance"  @click="inspectCard" /></div>
    <div class="canvas-cell"><SystemCard subject="infrastructure" @click="inspectCard" /></div>
    <div class="canvas-cell"><SystemCard subject="security"     @click="inspectCard" /></div>
  </div>
  <!-- ... 3 mas rows similares ... -->
</div>
```

**Nota:** `SectionDrawer` sigue existiendo (es usado por otras cosas), pero SystemPanelView lo deja de usar y pasa al Inspector global. Esto unifica el pattern.

---

## 4.6 LogsView — sticky filter + keyboard

```html
<div class="canvas">
  <div class="canvas-row canvas-row--1" style="position: sticky; top: 0; z-index: var(--pz-z-sticky);">
    <div class="canvas-cell">
      <LogsFilterBar
        :tenant-filter="tenantFilter"
        :level-filter="levelFilter"
        :paused="paused"
        @filter-change="applyFilter"
        @toggle-pause="togglePause"
        @clear="clearLogs"
      />
    </div>
  </div>

  <div class="canvas-row canvas-row--1" style="flex: 1; min-height: 0;">
    <div class="canvas-cell canvas-cell--flush">
      <LogsConsole :lines="filteredLines" :paused="paused" @line-click="inspectLog" />
    </div>
  </div>
</div>
```

**Empty states:**
- Lines 0, WS conectado: "Waiting for first log line. System quiet."
- WS desconectado: banner amarillo en filter bar "Disconnected. Reconnecting..."
- Filter sin matches: "No matches for current filters. Try broadening."

**Keyboard:**
- `p` — pause/resume
- `c` — clear
- `/` — focus search
- `1` `2` `3` `4` — filter por level (error/warn/info/debug)
- `g g` — scroll top
- `G` — scroll bottom + resume follow
- Click en line → inspector con detail

---

## 4.7 CmsContractsView — table + inspector minimal

```html
<div class="canvas">
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell">
      <ContractsHeader @new="createContract" @search="search" />
    </div>
  </div>

  <div class="canvas-row canvas-row--1" style="flex: 1;">
    <div class="canvas-cell canvas-cell--flush">
      <ContractsTable :contracts="filtered" @row-click="inspectContract" />
    </div>
  </div>
</div>
```

**Inspector tabs:** Overview | Schema | Preview.

**Empty state:** "No CMS contracts defined yet. Create the first one to enable tenant templates."

---

## 4.8 CreateClientView — wizard simplificado (NUEVO en v2)

v1 olvidaba este view. Existe en `src/views/CreateClientView.vue` y es un form para crear tenants.

**Layout:** single-column wizard con pasos claros.

```html
<div class="canvas">
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell">
      <h1 class="title">Nuevo Tenant</h1>
      <p class="body">Define identidad + acceso + features iniciales.</p>
    </div>
  </div>

  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell">
      <CreateClientWizard @submit="handleCreate" @cancel="goBack" />
    </div>
  </div>
</div>
```

**Decision:** si el wizard actual funciona bien, refactor minimo — solo aplicar el grid y tokens. Si el wizard es confuso, rediseñarlo en 3-4 pasos claros (Identity → Features → Admin User → Review).

---

## 4.9 EnvManagerView — single column clean

```html
<div class="canvas">
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell">
      <h1 class="title">Frontend URLs</h1>
      <p class="body">Allowed origins. Changes restart pegasuz-api.</p>
    </div>
  </div>

  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell">
      <UrlListEditor :urls="urls" @add="addUrl" @remove="removeUrl" @save="saveUrls" />
    </div>
  </div>

  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell">
      <LastSavedInfo :timestamp="lastSaved" :by="lastSavedBy" />
    </div>
  </div>
</div>
```

**Empty state:** lista con 0 URLs: "No URLs configured. Add the first frontend URL to enable access."

---

## 4.10 LoginView — minima intervencion

LoginView tiene su propio shell (no sidebar, no topbar, no statusbar). Solo ajustes esteticos:
- Centrar el card con tokens del grid (sin `canvas` ni `shell`)
- Aplicar tipografia nueva
- Empty state: "Enter credentials to continue"

Es la unica view exenta del sistema de 5 zonas.

---

## Parte 5 — Empty state spec (nueva seccion elevada a principio)

La regla "nunca vacio" es tan central que tiene su propia parte. Cada componente que renderiza data debe cumplir esta especificacion.

### 5.1 Los 4 estados canonicos

Cada cell, cada card, cada lista tiene exactamente 4 estados. Nunca mas, nunca menos.

```
STATE         CUANDO                        QUE SE VE
─────         ──────                        ─────────
data          hay datos disponibles         el contenido real
loading       primera carga sin cache       SkeletonCell con pulse
empty         carga OK pero 0 items         EmptyCell con mensaje calmo
error         fetch fallo                   ErrorCell con retry inline
```

### 5.2 SkeletonCell — el componente canon de loading

**Archivo:** `src/components/ui/SkeletonCell.vue` (NUEVO)

**Filosofia:** El skeleton NO es "cargando spinner". Es una version degradada del contenido final. Debe feel intencional, no improvisado.

**Props:**
```js
defineProps({
  variant: {
    type: String,
    default: 'metric',  // metric | list | table | chart | text
  },
  rows: { type: Number, default: 3 },  // para list/table variants
})
```

**Variants:**

- **`metric`** — placeholder para MetricCell. 3 elementos verticales: label (rect pequeño), value (rect grande), suffix (rect mediano). Todos con pulse animation.
- **`list`** — N rows con icon + text + time (cada uno rect pulsante).
- **`table`** — header row + N body rows con columnas simuladas.
- **`chart`** — un rect grande con 16 bars de alturas random (pero deterministicas via seeded random).
- **`text`** — 3 lineas de texto con anchos 100%, 85%, 60%.

**Pulse animation:**

```css
.skeleton {
  background: var(--pz-bg-surface);
  animation: skeleton-pulse 2s ease-in-out infinite;
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 0.8; }
}
```

**Respeta prefers-reduced-motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; opacity: 0.7; }
}
```

### 5.3 EmptyCell — el componente canon de empty

**Archivo:** `src/components/ui/EmptyCell.vue` (NUEVO)

**Filosofia:** Empty NO es "no hay nada". Es "esto es lo que sigue". Cada empty state dice: (1) que esta vacio, (2) por que, (3) que va a pasar despues, o que puede hacer el usuario.

**Props:**
```js
defineProps({
  title:    { type: String, required: true },
  subtitle: String,
  action: {
    type: Object,  // { label, onClick, variant: 'primary' | 'secondary' | 'ghost' }
    default: null,
  },
  variant: {
    type: String,
    default: 'calm',  // calm | positive | waiting
  },
})
```

**Template:**

```vue
<div class="empty-cell" :class="`empty-cell--${variant}`">
  <p class="empty-title">{{ title }}</p>
  <p v-if="subtitle" class="empty-subtitle">{{ subtitle }}</p>
  <button v-if="action" class="pz-btn" :class="`pz-btn-${action.variant || 'ghost'}`" @click="action.onClick">
    {{ action.label }}
  </button>
</div>
```

**Estilos:**

```css
.empty-cell {
  display: grid;
  gap: 8px;
  align-content: center;
  justify-items: start;
  padding: var(--pz-cell-pad);
  min-height: 120px;
}
.empty-title {
  font: 500 13px/1.4 var(--pz-font-body);
  color: var(--pz-text-secondary);
}
.empty-subtitle {
  font: 400 11px/1.5 var(--pz-font-body);
  color: var(--pz-text-muted);
}
.empty-cell--positive .empty-title { color: var(--pz-success); }
.empty-cell--waiting  .empty-title { color: var(--pz-accent-hover); }
```

**Ejemplos de uso:**

```vue
<!-- Activity feed vacio (esperado al inicio) -->
<EmptyCell
  title="No recent events"
  subtitle="The system has been quiet. Events will appear here as they occur."
  variant="calm"
/>

<!-- Error count cero (estado positivo) -->
<EmptyCell
  title="No errors in the last hour"
  variant="positive"
/>

<!-- Brain loading por primera vez -->
<EmptyCell
  title="Waiting for first cycle"
  subtitle="The brain is starting up. Next cycle expected in ~12 minutes."
  variant="waiting"
/>

<!-- Empty con accion -->
<EmptyCell
  title="No CMS contracts defined"
  subtitle="Create a contract to enable content templates for tenants."
  :action="{ label: 'Create contract', onClick: createContract, variant: 'primary' }"
/>
```

### 5.4 ErrorCell — el componente canon de error

**Archivo:** `src/components/ui/ErrorCell.vue` (NUEVO)

**Filosofia:** Errores son inline, no bloqueantes. Nunca overlay. Nunca modal rojo. Mensaje claro + retry button.

**Props:**
```js
defineProps({
  message: { type: String, required: true },
  retry:   { type: Function, default: null },
  detail:  String,  // opcional, puede ser stack trace corto
})
```

**Template:**

```vue
<div class="error-cell" role="alert">
  <div class="error-icon">!</div>
  <div class="error-body">
    <p class="error-title">{{ message }}</p>
    <p v-if="detail" class="error-detail">{{ detail }}</p>
  </div>
  <button v-if="retry" class="pz-btn pz-btn-ghost" @click="retry">Retry</button>
</div>
```

**Estilos:** banner horizontal con borde izquierdo rojo, padding moderado, no taparle nada al resto del layout.

### 5.5 MetricCell — el componente canon con estados

**Archivo:** `src/components/layout/primitives/MetricCell.vue` (NUEVO)

**Usa SkeletonCell + EmptyCell + ErrorCell automaticamente.** Es el wrapper que todos los cells de metrica usan.

```vue
<script setup>
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number, null], default: null },
  suffix: String,
  variant: { type: String, default: 'default' },  // default | warn | error | success
  state: { type: String, default: 'data' },  // data | loading | empty | error
  errorMessage: String,
  onRetry: Function,
  emptyMessage: { type: String, default: '—' },
})

const resolvedState = computed(() => {
  if (props.state !== 'data') return props.state
  if (props.value === null || props.value === undefined) return 'empty'
  return 'data'
})
</script>

<template>
  <div class="metric-cell" :class="`metric-cell--${variant}`">
    <span class="metric-label">{{ label }}</span>

    <template v-if="resolvedState === 'data'">
      <span class="metric-value">{{ value }}</span>
      <span v-if="suffix" class="metric-suffix">{{ suffix }}</span>
    </template>

    <SkeletonCell v-else-if="resolvedState === 'loading'" variant="metric" />

    <div v-else-if="resolvedState === 'empty'" class="metric-empty">
      <span class="metric-value metric-value--empty">{{ emptyMessage }}</span>
    </div>

    <ErrorCell
      v-else-if="resolvedState === 'error'"
      :message="errorMessage || 'Failed to load'"
      :retry="onRetry"
    />
  </div>
</template>
```

**Uso en views:**

```vue
<MetricCell
  label="TENANTS"
  :value="tenantsCount"
  suffix="total"
  :state="store.loading ? 'loading' : 'data'"
/>
```

Nunca mas se renderiza una metrica "desnuda" sin pasar por este componente.

### 5.6 Regla de auditoria automatica

El lint script (Parte 12) debe checar:

- Ningun `<div>` o `<section>` dentro de un `.canvas-cell` que no tenga fallback para estados `loading` / `empty` / `error`.
- Regex aproximada: cualquier `<div class="canvas-cell"` que contenga `{{ computedValue }}` sin un `v-if` cerca debe flagearse.

No es 100% preciso pero pega el 80% de los casos de vacio.

### 5.7 Checklist manual por view

Antes de cerrar cualquier fase, abrir la view con cada uno de los 4 estados del store y verificar:

- [ ] `data` — renderiza correctamente
- [ ] `loading` (forzado: `store.$patch({ loading: true, data: null })`) — muestra skeletons
- [ ] `empty` (forzado: `store.$patch({ loading: false, data: {} })`) — muestra mensajes empty calmos
- [ ] `error` (forzado: `store.$patch({ loading: false, error: 'test' })`) — muestra retry inline

Si algun estado muestra un rectangulo blanco, la fase no pasa.

---

## Parte 6 — Componentes nuevos (inventario v2)

### 6.1 Shell-level (viven en `src/components/layout/`)

| Componente | Archivo | Proposito |
|---|---|---|
| `AppShell.vue` | `src/components/layout/AppShell.vue` | Shell de 5 zonas, reemplaza el root de `App.vue` |
| `TopBar.vue` | `src/components/layout/TopBar.vue` | Z1 — breadcrumb + context pill + search + user |
| `SideBar.vue` | `src/components/layout/SideBar.vue` | Z2 — nav agrupado con iconos + section labels |
| `InspectorPane.vue` | `src/components/layout/InspectorPane.vue` | Z4 — drawer global, renderiza tabs del store |
| `StatusBar.vue` | `src/components/layout/StatusBar.vue` | Z5 — ws dot + last log + uptime + version + user |
| `CommandPalette.vue` | `src/components/layout/CommandPalette.vue` | Global Ctrl+K |
| `ShortcutsOverlay.vue` | `src/components/layout/ShortcutsOverlay.vue` | Overlay con shortcuts (`?`) |

### 6.2 Layout primitives (viven en `src/components/layout/primitives/`)

| Componente | Proposito |
|---|---|
| `CanvasRow.vue` | Wrapper para `.canvas-row` con prop `variant` |
| `CanvasCell.vue` | Wrapper para `.canvas-cell` con props `hero`, `flush` |
| `MetricCell.vue` | Metrica con 4 estados (data/loading/empty/error) |
| `ContextHeader.vue` | Header standard: title + subtitle + slot de actions |
| `TabBar.vue` | Tab bar generico (usado en Inspector y sub-views) |
| `SectionTitle.vue` | Titulo de seccion standardizado (mono uppercase) |

### 6.3 UI primitives (viven en `src/components/ui/`)

| Componente | Proposito |
|---|---|
| `SkeletonCell.vue` | Loading state canonico — 5 variants |
| `EmptyCell.vue` | Empty state canonico — 3 variants |
| `ErrorCell.vue` | Error state canonico con retry inline |
| `HealthDot.vue` | Dot de 6px con variants (green/amber/red/gray) |
| `PulseIndicator.vue` | Dot pulsante para "live" status |
| `Sparkline.vue` | SVG polyline de N puntos con mini axes opcional |
| `KeyChip.vue` | Pill mono para mostrar shortcuts (`Ctrl K`) |

### 6.4 Inspector tabs (viven en `src/components/inspector/`)

Agrupados por subject type:

**Tenant (`src/components/inspector/tenant/`):**
- `TenantOverviewTab.vue`
- `TenantFeaturesTab.vue` (reusa `FeaturesModal` ya extraido en Fase 7a)
- `TenantUsersTab.vue` (reusa `UserModal` existente)
- `TenantCmsTab.vue` (reusa `CmsModal` ya extraido)
- `TenantAuditTab.vue`

**Contract (`src/components/inspector/contract/`):**
- `ContractOverviewTab.vue`
- `ContractSchemaTab.vue`
- `ContractPreviewTab.vue`

**System (`src/components/inspector/system/`):**
- `SystemSectionTab.vue` (generico para cualquier section de SystemPanelView)

**Log (`src/components/inspector/log/`):**
- `LogDetailTab.vue`

**NO se crea:** `BrainAlertTab` ni `BrainSectionTab` — BrainView tiene su propio `BrainDeepDrawer` separado del Inspector global.

### 6.5 Brain-v2 components (viven en `src/views/system/brain-v2/`)

Ya listados en Parte 4.1, repito aqui para inventario:

- `BrainHeroBand.vue`
- `BrainPulseBand.vue`
- `BrainCurrentBand.vue`
- `BrainEvolutionBand.vue`
- `BrainArchiveGrid.vue`
- `BrainDeepDrawer.vue`
- `helpers/coherence.js`, `helpers/timeAgo.js`, `helpers/sparkline.js`, `helpers/flatten.js`, `helpers/sectionMeta.js`

### 6.6 LocalCommand-v2 components (si se ejecuta Fase 11)

- `src/views/system/local-command-v2/LocalHeroBand.vue`
- `LocalTelemetryBand.vue`, `LocalActiveBand.vue`, `LocalErrorsBand.vue`, `LocalModelsGrid.vue`, `LocalDeepDrawer.vue`

### 6.7 Composables nuevos (viven en `src/composables/ui/`)

| Composable | Proposito |
|---|---|
| `useKeyboard.js` | Keyboard shortcut registry con scopes (global / view / focused) |
| `useCommandPalette.js` | Command palette global con registro dinamico de commands |
| `useBreadcrumb.js` | Breadcrumb derivado de route + view-provided context |
| `useDensity.js` | Density mode (2 modes) con persistencia |
| `useEmptyState.js` | Helper para derivar state (data/loading/empty/error) a partir del store |
| `useRowKeyboardNav.js` | j/k navigation para tablas y listas |

### 6.8 Stores nuevos

**Unico store nuevo:** `src/stores/shell.js` con `useAppShellStore`.

Estructura ya definida en Parte 2.7. Maneja:
- `sidebarCollapsed`
- `density`
- `inspectorOpen`, `inspectorSubject`, `inspectorTabs`, `inspectorActiveTab`
- `commandPaletteOpen`

**Stores que NO se crean:**
- No `useInspectorStore` separado — merged en `useAppShellStore`
- No `useLogsStore` para `lastLogLine` — se usa el existente de logs si existe, o se agrega como computed al `useSystemSocketStore` existente (sin tocarlo internamente — solo leer)

**Export:** agregar a `src/stores/system/index.js` un line `export { useAppShellStore } from '../shell.js'` — unica modificacion al index.

---

## Parte 7 — Keyboard navigation (simplificado)

v1 tenia 30+ shortcuts. v2 reduce a lo esencial.

### 7.1 Shortcuts globales (funcionan en cualquier view)

| Tecla | Accion | Scope |
|---|---|---|
| `Ctrl+K` | Abrir command palette | global |
| `Ctrl+I` | Toggle inspector | global |
| `Ctrl+B` | Toggle sidebar (collapse a 56px en desktop) | global |
| `Ctrl+.` | Cycle density (comfortable ⟷ dense) | global |
| `?` | Shortcuts overlay | global |
| `Esc` | Close current overlay | global |
| `/` | Focus search | context-dependent |

### 7.2 Jumps (`g` prefix, Vim-style, timeout 1.5s)

| Tecla | Destino |
|---|---|
| `g d` | Dashboard |
| `g c` | Clients |
| `g l` | Logs |
| `g b` | Brain |
| `g s` | System |
| `g m` | CMS contracts |
| `g p` | GPU panel |
| `g e` | Environment |

**Timeout:** Si despues de `g` pasan > 1.5s sin segunda tecla, el prefix se cancela. Se usa un timer local en `useKeyboard`.

### 7.3 Navegacion en listas/tablas

| Tecla | Accion |
|---|---|
| `j` | Next row |
| `k` | Prev row |
| `Enter` | Open/drill into selected |
| `Escape` | Deselect |

### 7.4 Tabs switching (cuando view tiene tabs)

| Tecla | Accion |
|---|---|
| `1` – `9` | Switch a tab N |
| `Tab` | Next tab |
| `Shift+Tab` | Prev tab |

### 7.5 Scope precedence (architect fix)

```
focused > view > global
```

Esto significa:
- Si hay un `<input>` o `<textarea>` o `[contenteditable=true]` focused, NINGUN shortcut de view ni global se dispara (excepto `Esc` que puede bluur el input).
- Si hay un view active con sus propios shortcuts registrados, gana sobre globales (para shortcuts duplicados — ej: `1` en BrainView es "scroll to HERO", que sobreescribe `1` global si lo hubiera).
- Los globales son fallback.

### 7.6 `useKeyboard.js` — implementacion

```js
// src/composables/ui/useKeyboard.js
const scopes = new Map()  // scopeId -> Map<keyCombo, handler>
const scopeStack = []     // stack de scopes activos (last = highest priority)

export function useKeyboard() {
  const registerScope = (scopeId) => {
    if (!scopes.has(scopeId)) scopes.set(scopeId, new Map())
    if (!scopeStack.includes(scopeId)) scopeStack.push(scopeId)

    return {
      bind(keyCombo, handler) {
        scopes.get(scopeId).set(keyCombo, handler)
      },
      dispose() {
        scopes.delete(scopeId)
        const idx = scopeStack.indexOf(scopeId)
        if (idx >= 0) scopeStack.splice(idx, 1)
      },
    }
  }

  return { registerScope }
}

// Single global listener montado en AppShell.vue
function handleKeydown(e) {
  // Guard: skip if typing in an input
  const target = e.target
  if (target.closest('input, textarea, [contenteditable="true"]')) {
    if (e.key !== 'Escape') return  // solo Esc pasa cuando hay focus
  }

  const combo = buildCombo(e)  // ej: "ctrl+k", "g", "j"

  // Walk scopes desde el top (highest priority) hacia el bottom
  for (let i = scopeStack.length - 1; i >= 0; i--) {
    const scopeMap = scopes.get(scopeStack[i])
    if (scopeMap?.has(combo)) {
      e.preventDefault()
      scopeMap.get(combo)(e)
      return
    }
  }
}
```

**Uso en un view:**

```js
// BrainView.vue
import { useKeyboard } from '@/composables/ui/useKeyboard.js'
import { onMounted, onBeforeUnmount } from 'vue'

const { registerScope } = useKeyboard()
let scope

onMounted(() => {
  scope = registerScope('brain-view')
  scope.bind('1', () => scrollTo('hero'))
  scope.bind('2', () => scrollTo('pulse'))
  scope.bind('3', () => scrollTo('current'))
  scope.bind('4', () => scrollTo('evolution'))
  scope.bind('5', () => scrollTo('archive'))
  scope.bind('r', () => brain.fetch())
})

onBeforeUnmount(() => scope.dispose())
```

### 7.7 Conflictos con browser shortcuts

Verificado:
- `Ctrl+K` — disponible en Chrome/Firefox/Safari modernos (no es el address bar focus, que es `Ctrl+L`)
- `Ctrl+I` — Chrome lo usa para "info del page" en algunos contextos. Aceptable `e.preventDefault()`.
- `Ctrl+B` — Chrome lo usa para toggle bookmarks bar en algunos OS. Aceptable con preventDefault.
- `Ctrl+.` — Windows emoji picker en algunas configs. Documentar en overlay.
- `/` — Chrome "quick find". Gated por input-focus check.
- `?` — Usado para help en muchos apps. Aceptable.

**Estrategia:** Todos los shortcuts listados llaman `e.preventDefault()` dentro del handler.

### 7.8 ShortcutsOverlay

**Trigger:** `?` o `Ctrl+/`

**Contenido:** lista agrupada de shortcuts (Global / Jumps / List Nav / Tabs). Cada entry con `<KeyChip>` + descripcion.

**Empty state:** n/a (siempre tiene contenido).

---

## Parte 8 — Accessibility (NUEVA — v1 no la tenia)

La accesibilidad es requirement, no bonus. Este plan produce un panel que funciona con keyboard completo, con screen readers, y con focus management correcto.

### 8.1 ARIA roles por componente

| Componente | Role | Atributos clave |
|---|---|---|
| `AppShell` | n/a | `<div>` basico |
| `TopBar` | `banner` | `<header role="banner">` |
| `SideBar` | `navigation` | `<nav aria-label="Main">` |
| `InspectorPane` | `complementary` | `<aside role="complementary" aria-label="Inspector">` — NO role="dialog" porque no es modal bloqueante |
| `StatusBar` | `status` | `<footer role="status">` |
| `CommandPalette` | `dialog` | `<div role="dialog" aria-modal="true" aria-label="Command palette">` |
| `TabBar` | `tablist` | children con `role="tab"` + `aria-selected` |
| `MetricCell` | n/a | label con `<span>` readable |
| `HealthDot` | `status` | `aria-label="Status: healthy"` |
| Modal (delete confirm) | `dialog` | `aria-modal="true"` + focus trap |

### 8.2 Focus management

**Regla:** Toda apertura/cierre de un overlay debe preservar focus history.

| Accion | Focus va a |
|---|---|
| Ctrl+K abre palette | Input del palette |
| Esc cierra palette | Elemento que tenia focus antes de abrir |
| Ctrl+I abre inspector | Primer elemento interactivo del tab activo |
| Esc cierra inspector | Row de la tabla que disparo el inspector (o elemento previo) |
| Click en tile del BrainArchive | Header del BrainDeepDrawer |
| Esc cierra BrainDeepDrawer | Tile clickeado |
| Route change | Primer heading `<h1>` de la nueva view |

**Implementacion:** `useFocusMemory` composable (nuevo) que al abrir algo guarda `document.activeElement`, al cerrar lo restaura con `focus()`.

### 8.3 Focus trap en modales reales

Solo hay 1 modal bloqueante en el plan: `DeleteConfirmModal` (acciones destructivas). Este debe tener focus trap:
- Tab cicla solo dentro del modal
- Esc cancela
- Enter confirma (o Escape según orden)
- Return focus al boton "Delete" de la tabla al cerrar

### 8.4 Screen reader (SR) patterns

**StatusBar live log line — NO debe gritarse al SR.**

```html
<footer class="status-bar" role="status">
  <span class="ws-dot" aria-live="polite" aria-atomic="true">{{ wsStatusText }}</span>
  <span class="last-log" aria-live="off">{{ lastLogLine }}</span>  <!-- OFF — no gritar -->
</footer>
```

**WS desconexion SI debe anunciarse:**

```html
<span class="ws-dot" :aria-label="wsStatusText">
  <!-- wsStatusText cambia a "Disconnected. Reconnecting." cuando aplica -->
</span>
```

**BrainView empty states** — cada banda en empty state tiene `aria-label` que describe: "BAND pulse, empty state: Waiting for first cycle"

### 8.5 Keyboard shortcuts descubribles

Los shortcuts vim-style (`j`, `k`, `g d`) no son intuitivos. Mitigacion:

- **Overlay de shortcuts siempre accesible con `?`**
- **Onboarding hint una sola vez** al primer login: toast "Tip: press ? to see keyboard shortcuts"
- **Cada boton principal muestra su shortcut asociado** si existe. Ej: el boton search del topbar muestra `<KeyChip>Ctrl K</KeyChip>` al costado.

### 8.6 prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .skeleton { animation: none; }
  .pulse-dot { animation: none; }
}
```

Global, aplicado en `design-system.css`.

### 8.7 Contrast check

**Verificacion manual (parte de Fase 13):** WCAG AA contrast ratio >= 4.5:1 para texto normal, >= 3:1 para texto grande.

- `text-primary` (#f0e7d8) sobre `bg-base` (#0a0a0b) — ratio ~13:1 ✓
- `text-muted` (#8a8578) sobre `bg-base` — ratio ~5:1 ✓
- `text-dim` (0.25 opacity) sobre `bg-base` — requires check
- `accent` (#ff6a00) sobre `bg-base` — ratio ~5:1 ✓
- `accent` sobre `accent-ember` (accent 6%) — low contrast, solo uso decorativo en hover

### 8.8 Multi-window localStorage sync

Detectar cambios en localStorage desde otra pestaña:

```js
// En useAppShellStore o main.js
window.addEventListener('storage', (e) => {
  if (e.key === 'pegasuz.shell.v1') {
    const shell = useAppShellStore()
    const newState = JSON.parse(e.newValue || '{}')
    shell.density = newState.density
    shell.sidebarCollapsed = newState.sidebarCollapsed
  }
})
```

Sin esto, cambiar density en una pestaña no se refleja en las otras.

---

## Parte 9 — State persistence (nueva)

### 9.1 Un unico key versionado

**Key:** `pegasuz.shell.v1`

**Shape:**

```json
{
  "density": "comfortable",
  "sidebarCollapsed": false,
  "inspectorOpen": false,
  "brainLastSection": "status",
  "logsFilters": {
    "tenant": null,
    "level": ["error", "warn", "info"],
    "paused": false
  },
  "shortcutsOverlayShown": true
}
```

**Version prefix:** `v1`. Cuando el shape cambie, bumpear a `v2` y escribir una migracion simple (leer v1, transformar, escribir v2, opcionalmente borrar v1).

### 9.2 Que se persiste

**SI:**
- `density` — preferencia del usuario
- `sidebarCollapsed` — preferencia visual
- `brainLastSection` — ultimo section abierto en BrainDeepDrawer (para restaurar al volver)
- `logsFilters` — filtros del LogsView (tenant, level, paused)
- `shortcutsOverlayShown` — si el onboarding hint ya se vio
- `inspectorOpen` (solo el flag boolean, no el subject)

### 9.3 Que NO se persiste

**NO:**
- `inspectorSubject` — el subject puede ser un tenant que ya no existe. Resurrecturarlo triggers 404. **Critical bug que v1 hubiera tenido.**
- `inspectorTabs`, `inspectorActiveTab` — dependen del subject
- `commandPaletteOpen` — siempre falso al iniciar
- `lastLogLine` — efimero

### 9.4 Estrategia de escritura

**Debounced:** No escribir en cada mutation. Debounce 500ms.

```js
// src/stores/shell.js
import { debounce } from '@/utils/debounce'  // helper simple, si no existe se crea

const STORAGE_KEY = 'pegasuz.shell.v1'

const saveToStorage = debounce((state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    density: state.density,
    sidebarCollapsed: state.sidebarCollapsed,
    inspectorOpen: state.inspectorOpen,
    shortcutsOverlayShown: state.shortcutsOverlayShown,
    // brainLastSection y logsFilters vienen de stores especificos
  }))
}, 500)

watch(
  () => ({ density: density.value, sidebarCollapsed: sidebarCollapsed.value, ... }),
  (newState) => saveToStorage(newState),
  { deep: true }
)
```

### 9.5 Estrategia de lectura (init)

Al montar `AppShell`:

```js
onMounted(() => {
  const stored = localStorage.getItem('pegasuz.shell.v1')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      shell.density = parsed.density ?? 'comfortable'
      shell.sidebarCollapsed = parsed.sidebarCollapsed ?? false
      shell.shortcutsOverlayShown = parsed.shortcutsOverlayShown ?? false
    } catch (e) {
      // corrupt state, reset
      localStorage.removeItem('pegasuz.shell.v1')
    }
  }
})
```

### 9.6 Migracion futura

Cuando el shape cambie, bumpear version:

```js
function migrate(stored, version) {
  if (version === 1) {
    // transformar a v2
    return { ...stored, newField: 'default' }
  }
  return stored
}
```

### 9.7 Multi-window sync

Ya cubierto en Parte 8.8 — `storage` event listener.

---

## Parte 10 — Reglas de consistencia (13 rules, no-negociables)

v1 tenia 10 rules. v2 agrega 3 mas (empty state, keyboard scope, persistence). Todas son LAW — cualquier PR que las rompe se rechaza.

### RULE 1 — Un solo token de padding

`var(--pz-cell-pad)` para cells. `var(--pz-cell-pad-y)` / `var(--pz-cell-pad-x)` para axis-specific. Nada de `padding: 24px`. Nada de `padding-top: 40px`.

### RULE 2 — Separadores solo con gap

Ningun `border` entre cells. Excepciones legitimas: pills, buttons, inputs, el border-left activo del sidebar.

### RULE 3 — Jerarquia tipografica unica

9 clases:

| Clase | Uso |
|---|---|
| `.value` | Hero numbers clamp 96-160px (BrainHero) |
| `.value-lg` | Secondary numbers clamp 40-64px |
| `.value-sm` | Tertiary numbers clamp 32-52px |
| `.title` | Section titles clamp 24-36px |
| `.title-sm` | Sub-titles 16px |
| `.body` | Running text 13px |
| `.body-sm` | Secondary 11px |
| `.label` | Uppercase mono 10px |
| `.pill` | Uppercase mono 9px |

No inventar clases nuevas.

### RULE 4 — Estados interactivos unicos

4 estados: default / hover / active / disabled. No mas. Ver Parte 1 principio 7.

### RULE 5 — Cada cell tiene los 4 estados

Cada cell que muestra data tiene los 4 estados definidos en Parte 5: data / loading / empty / error. Ningun rectangulo en blanco es aceptable.

### RULE 6 — Empty states tienen formato fijo

Usan `EmptyCell`. Texto obligatorio: (1) que esta vacio, (2) por que, (3) que sigue. No "No data" ni "Nothing here" genericos.

### RULE 7 — Loading states tienen formato fijo

Usan `SkeletonCell`. Nunca spinners centrados. Nunca texto "Loading...".

### RULE 8 — Error states son inline

Usan `ErrorCell`. Banner o cell interno con retry. Nunca modal overlay para errores no bloqueantes.

### RULE 9 — Cada view tiene un ContextHeader

Primera row de cada canvas es un `<ContextHeader>`. Sin excepciones salvo LoginView.

### RULE 10 — Z-index solo de la scale

Solo `var(--pz-z-*)`. Nada de `z-index: 100` hardcoded.

### RULE 11 — Nunca vacio (elevada de v1)

Derivada de rules 5, 6, 7, 8. Pero la enuncio standalone por importancia:

> **Una view del SuperAdmin nunca debe tener un espacio visible sin un mensaje intencional.** Si hay data, mostrala. Si esta cargando, skeleton. Si esta vacia, mensaje calmo. Si fallo, banner con retry. Cero blancos, cero "huecos".

### RULE 12 — Keyboard scope precedence

`focused > view > global`. Implementado en `useKeyboard.js`. Los shortcuts de view no se disparan dentro de inputs. Los globales son fallback.

### RULE 13 — State persistence versioned

Todo estado persistido usa el key `pegasuz.shell.vN`. Jamas multiple keys. Jamas persistir referencias a objetos del servidor (tenants, contratos, etc) — solo preferencias del usuario.

---

## Parte 11 — Orden de ejecucion (16 fases atomicas)

v1 tenia 15 fases. v2 agrega Fase 0B (smoke tests), 7a/7b (split de ClientsView), y reordena Fase 10 (BrainView es reescrito, no reorganizado).

Cada fase es atomica y verificable. No se avanza sin pasar el check.

### Fase 0 — Preparacion

- [ ] Commit limpio: `chore: pre-ux-reform-v2 snapshot`
- [ ] Branch: `ux/superadmin-reform-v2`
- [ ] Screenshots de TODAS las views → `docs/ux-reform/before/` (10 views)
- [ ] Verificar `npm run dev` arranca sin errores
- [ ] Leer `docs/pegasuz-superadmin-ux-ultra-plan-v2.md` completo
- [ ] Verificar que `design-system.css` tiene los tokens de Eros activos (spot check: `--pz-bg-base: #0a0a0b`, `--pz-accent: #ff6a00`, `--pz-font-body: 'DM Sans'`) — **ya ejecutado pero re-check defensive**

### Fase 0B — Baseline del observer (ya ejecutado)

**Playwright ya esta instalado** — vive en `maqueta/scripts/node_modules/playwright` (versio 1.59.1). No hace falta instalar nada.

**El baseline del login page ya se capturo** en `docs/ux-reform/observer-baseline/localhost/`. Ver Parte 12.0 para los numeros.

**Sub-pasos de esta fase:**

- [ ] Confirmar dev server del superadmin corriendo (puerto 5179 actual)
- [ ] Correr observer contra login: `node scripts/eros-observer.mjs --local --port 5179 ../docs/ux-reform/observer-baseline/` (ya hecho)
- [ ] Verificar que `docs/ux-reform/observer-baseline/localhost/analysis.md` existe
- [ ] Leer los scores y confirmarlos como punto de partida (documentados en Parte 12.0)

**Opcional — baseline extendido (post-login):**

Para capturar baselines de rutas autenticadas (dashboard, brain, system, etc), el usuario debe hacer login manual primero y luego el observer puede correr contra cada ruta navegando manualmente o usando un helper. Esto no es bloqueante — se puede hacer despues de Fase 3 cuando el nuevo shell este en su lugar.

### Fase 1 — Layout tokens

**Archivo:** `src/assets/design-system.css`

- [ ] Agregar bloque `/* LAYOUT SYSTEM V2 */` con tokens `--pz-*` de Parte 3.1
- [ ] Agregar `[data-density="comfortable"]` y `[data-density="dense"]`
- [ ] Agregar `@media (prefers-reduced-motion: reduce)` global

**Check:** devtools inspeccionar `:root` — ver todos los tokens `--pz-*`. `npm run dev` sin warnings.

### Fase 2 — Primitives + CSS system

**Archivos nuevos:**
- `src/components/layout/primitives/CanvasRow.vue`
- `src/components/layout/primitives/CanvasCell.vue`
- `src/components/layout/primitives/MetricCell.vue`
- `src/components/layout/primitives/ContextHeader.vue`
- `src/components/layout/primitives/TabBar.vue`
- `src/components/layout/primitives/SectionTitle.vue`
- `src/components/ui/SkeletonCell.vue`
- `src/components/ui/EmptyCell.vue`
- `src/components/ui/ErrorCell.vue`
- `src/components/ui/HealthDot.vue`
- `src/components/ui/Sparkline.vue`
- `src/components/ui/KeyChip.vue`
- `src/components/ui/PulseIndicator.vue`

**CSS:** Agregar clases `.canvas`, `.canvas-row--*`, `.canvas-cell`, `.canvas-cell-hero`, `.canvas-cell--flush`, `.canvas-stack` a `design-system.css`.

**Check:** Crear route temporal `/dev/primitives` con un playground que muestre cada primitive con sus 4 estados (data/loading/empty/error). Verificar visual.

### Fase 3 — Shell de 5 zonas

**Archivos:**
- Crear `src/components/layout/AppShell.vue`
- Crear `src/components/layout/TopBar.vue`
- Crear `src/components/layout/SideBar.vue` (CON iconos existentes — v2 fix)
- Crear `src/components/layout/StatusBar.vue`
- Crear `src/stores/shell.js` (useAppShellStore)
- Refactor `src/App.vue` para usar `<AppShell>` como root

**NO tocar:** nav logic, router, stores existentes.

**Check (protocolo explicito — verifier fix):**

1. Navegacion entre todas las rutas funciona (verificar manualmente las 10)
2. Sidebar collapse con `Ctrl+B` — sidebar colapsa a 56px con iconos visibles
3. Login/logout flow intacto
4. WebSocket still works: **Devtools Network → WS filter → navegar a /superadmin/logs → esperar 10s → verificar >= 3 frames recibidos**
5. WebSocket still works: **Devtools Network → WS filter → navegar a /system/brain → esperar 10s → verificar >= 3 frames**
6. Status bar muestra ws dot verde y ultimo log line actualizando
7. Topbar muestra breadcrumb correcto en cada view
8. `npm run build` sin warnings

**Rollback si falla:** `git revert <Fase 3 commit>` afecta: `App.vue`, `src/components/layout/*`, `src/stores/shell.js`.

### Fase 4 — Inspector pane + store inspector methods

**Archivos:**
- Crear `src/components/layout/InspectorPane.vue`
- Crear `src/components/inspector/` (directorio vacio por ahora)
- Agregar `openInspector`/`closeInspector` a `useAppShellStore`
- Agregar `router.afterEach(closeInspector)` en `src/router/index.js` (UNA sola linea nueva)
- Crear `src/composables/ui/useFocusMemory.js`

**Check:** Desde devtools, disparar `useAppShellStore().openInspector({type: 'test', data: {}}, [{key: 't1', label: 'Test', component: {...}}])`. Inspector aparece con 360px width. `Ctrl+I` toggle. `Esc` cierra. Navegar a otra route → inspector se cierra automaticamente.

### Fase 5 — Command palette + keyboard system

**Archivos:**
- Crear `src/composables/ui/useKeyboard.js` (implementacion de Parte 7.6)
- Crear `src/composables/ui/useCommandPalette.js`
- Crear `src/components/layout/CommandPalette.vue`
- Crear `src/components/layout/ShortcutsOverlay.vue`
- Agregar listener global de keyboard en `AppShell.vue`

**Commands iniciales (viven en `useCommandPalette.registerDefaults()`):**
- Navigate: `g d`, `g c`, `g l`, `g b`, `g s`, `g m`, `g p`, `g e`
- Toggle: inspector, sidebar, density, shortcuts

**Check:**
1. `Ctrl+K` abre palette
2. Escribir "dash" → filtra a "Go to Dashboard" → Enter navega
3. `g d` desde cualquier view navega a dashboard
4. `g` solo sin siguiente tecla en 1.5s no hace nada
5. `?` abre shortcuts overlay
6. `Esc` cierra cualquier overlay
7. Focus en un input: `j` NO hace nada (respeta scope precedence)

### CHECKPOINT 1 — Shell + sistema de overlays completo

En este punto el shell de 5 zonas funciona con todas sus overlays globales. **Ninguna view esta modificada aun.** Merge stable point.

Check de checkpoint:
- [ ] Todas las 10 views siguen renderizando como antes (ningun cambio en su interior)
- [ ] Shell de 5 zonas funciona en desktop (1440px+)
- [ ] Mobile (768px) shell colapsa correctamente
- [ ] Smoke tests (Fase 0B si aplica) pasan
- [ ] `npm run build` limpio
- [ ] Commit: `feat(ux): shell de 5 zonas + command palette + inspector global`

### Fase 6 — DashboardView redesign

**Archivos:**
- Refactor `src/views/DashboardView.vue`
- Crear `src/components/dashboard/SystemPulseHero.vue`
- Crear `src/components/dashboard/RecentActivityFeed.vue`
- Crear `src/components/dashboard/QuickActions.vue`

**NO tocar:** stores de dashboard, fetching logic.

**Check:** Visual diff vs before. Un solo elemento dominante (SystemPulseHero). Los 4 MetricCells tienen los 4 estados (data/loading/empty/error). Activity feed empty state visible cuando no hay eventos.

### Fase 7a — Extract inline modals de ClientsView

**Archivos:**
- Crear `src/components/clients/modals/FeaturesModal.vue` — extraer `ClientsView.vue:522-688`
- Crear `src/components/clients/modals/CmsModal.vue` — extraer `ClientsView.vue:690-800+`
- Modificar `ClientsView.vue` para importar los nuevos componentes

**Check:**
1. Click en features de tenant → modal abre con datos correctos
2. Toggle de features funciona
3. Save de features persiste
4. Translation sync funciona (si aplica)
5. CMS modal: click en cms → modal abre, contract select funciona, preview, save
6. **Sin cambios visuales** — esto es refactor puro

### Fase 7b — ClientsView split + inspector integration

**Archivos:**
- Refactor `src/views/ClientsView.vue` al layout split
- Crear `src/components/clients/ClientsContextHeader.vue`
- Crear `src/components/inspector/tenant/TenantOverviewTab.vue`
- Crear `src/components/inspector/tenant/TenantFeaturesTab.vue` (wraps FeaturesModal extraido)
- Crear `src/components/inspector/tenant/TenantUsersTab.vue` (wraps UserModal existente)
- Crear `src/components/inspector/tenant/TenantCmsTab.vue` (wraps CmsModal extraido)
- Crear `src/components/inspector/tenant/TenantAuditTab.vue`

**Check:**
1. Click en row abre inspector con 5 tabs
2. Cada tab muestra data correcta (diffed contra modales viejos)
3. CRUD destructivos siguen usando modal (delete confirm)
4. `j`/`k` navega rows
5. `i` toggle inspector
6. `Esc` cierra inspector y deselect row
7. `/` focus search
8. `n` va a /clients/new

**Rollback:** `git revert` Fase 7b + Fase 7a.

### Fase 8 — LogsView sticky + keyboard

**Archivos:**
- Refactor `src/views/LogsView.vue`
- Crear `src/components/logs/LogsFilterBar.vue`
- Crear `src/components/logs/LogsConsole.vue`
- Crear `src/components/inspector/log/LogDetailTab.vue`

**Check:**
1. Filter bar sticky at top 0, no scrollea con logs
2. WebSocket stream llega (verificar Network)
3. Shortcuts: p, c, /, 1-4, g g, G funcionan
4. Click en log line abre inspector
5. Empty state: logs vacios con mensaje "Waiting for first log line"

### Fase 9 — SystemPanelView refine

**Archivos:**
- Refactor `src/views/SystemPanelView.vue` al grid system
- Migrar SectionDrawer → Inspector global
- Crear `src/components/inspector/system/SystemSectionTab.vue`

**Check:**
1. Las 12 cards renderizan con grid 3-col
2. Click en card abre inspector (no el drawer viejo)
3. Hero band de 4 metricas arriba
4. Real-time updates visibles

### CHECKPOINT 2 — Views primitivas reformadas (Dashboard + Clients + Logs + System)

Merge stable point. Las views simples estan done. Solo queda Brain + LocalCommand + los menores.

### Fase 10 — BrainView rebuild completo (LA FASE CRITICA)

**Archivos:**
- Reescribir `src/views/system/BrainView.vue` (el wrapper simple de ~40 lineas)
- Crear `src/views/system/brain-v2/BrainHeroBand.vue`
- Crear `src/views/system/brain-v2/BrainPulseBand.vue`
- Crear `src/views/system/brain-v2/BrainCurrentBand.vue`
- Crear `src/views/system/brain-v2/BrainEvolutionBand.vue`
- Crear `src/views/system/brain-v2/BrainArchiveGrid.vue`
- Crear `src/views/system/brain-v2/BrainDeepDrawer.vue`
- Crear `src/views/system/brain-v2/helpers/coherence.js`
- Crear `src/views/system/brain-v2/helpers/timeAgo.js`
- Crear `src/views/system/brain-v2/helpers/sparkline.js`
- Crear `src/views/system/brain-v2/helpers/flatten.js`
- Crear `src/views/system/brain-v2/helpers/sectionMeta.js`

**NO tocar ni importar:**
- Los 22 Brain*Section.vue componentes viejos
- BrainSectionWrap.vue
- Ningun composable en `src/components/system/brain/useBrain*.js`
- SectionDrawer.vue

**SI importar:**
- `useBrainStore` (el store, para data)
- `useSystemSocketStore` (si hace falta subscribir a events especificos)

**Check (protocolo explicito tab-por-tab — verifier fix):**

1. **Empty state test:** Abrir BrainView con ws desconectado (devtools offline mode) → verificar que TODAS las bandas muestran empty/loading states intencionales. **Ningun rectangulo blanco.**
2. **Data state test:** Reconectar → verificar que cada banda recibe data y se actualiza.
3. **Coherence live:** Verificar que el numero coherence en hero cambia cuando `brain.health` cambia en devtools Vue DevTools.
4. **Archive grid:** Click en cada uno de los 22 tiles → verifica que abre BrainDeepDrawer con data raw.
5. **Keyboard:** `1`-`5` scrollea entre bandas. `r` fuerza refresh (verificar en Network). `Esc` cierra drawer.
6. **WebSocket integrity:** Devtools Network → WS filter → brain → verificar frames llegando cada N segundos, y que los sparklines de BrainPulseBand se actualizan.
7. **No double-fetch:** Devtools Network filter XHR/fetch → cambiar entre rutas /system/brain ↔ /dashboard 5 veces → contar fetches a `/brain` endpoint. Debe ser 1 fetch por visita (no duplicados).
8. **Screen reader test:** Navegar con NVDA o VoiceOver → el SR anuncia cada banda con su label, no grita el log line de statusbar.
9. `npm run build` sin warnings
10. Smoke tests (si aplica) pasan

**Rollback:** `git revert <Fase 10 commit>` — afecta solo `src/views/system/BrainView.vue` y `src/views/system/brain-v2/*`. Los 22 componentes viejos siguen existiendo como dead code, no borrados aun.

### Fase 11 — LocalCommandView (opcional — stretch goal)

**Decision antes de empezar:** ¿el tiempo alcanza? Si no, saltar a Fase 12.

Si se ejecuta, mismo approach que Fase 10: rebuild completo en `src/views/system/local-command-v2/`, no reutilizar componentes viejos.

### Fase 12 — Views restantes

**Archivos:**
- Refactor `src/views/CmsContractsView.vue`
- Refactor `src/views/CreateClientView.vue`
- Refactor `src/views/system/EnvManagerView.vue`
- Refactor `src/views/LoginView.vue`

**Check:** Cada una renderiza con el grid system, tiene ContextHeader, maneja empty/loading/error states, y funcionalidad intacta.

### Fase 13 — Responsive audit

**Viewports a testear (confirmar scope con Mateo antes):**
- Desktop ancho: 1920px, 2560px
- Desktop normal: 1440px, 1280px
- Tablet: 1024px, 768px
- Mobile: 375px (confirmar si aplica — si no, skip)

**Para cada viewport:**
- [ ] Abrir cada view (10 views)
- [ ] Verificar no hay horizontal scroll
- [ ] Verificar cells no se rompen (< 200px width en cells normales)
- [ ] Inspector open no rompe layout
- [ ] Density cycle en cada uno

### Fase 14 — Cleanup de codigo muerto

**Archivos a eliminar:**

```
src/views/system/BrainView.vue (version vieja — solo queda el wrapper)
src/components/system/brain/BrainStatusSection.vue
src/components/system/brain/BrainContextSection.vue
src/components/system/brain/BrainWatchdogSection.vue
src/components/system/brain/BrainDecisionsSection.vue
src/components/system/brain/BrainLearningSection.vue
src/components/system/brain/BrainTestingSection.vue
src/components/system/brain/BrainEvolutionSection.vue
src/components/system/brain/BrainRolloutSection.vue
src/components/system/brain/BrainRoutingSection.vue
src/components/system/brain/BrainGapsSection.vue
src/components/system/brain/BrainKnowledgeSection.vue
src/components/system/brain/BrainExperienceSection.vue
src/components/system/brain/BrainAgentTrustSection.vue
src/components/system/brain/BrainCountersSection.vue
src/components/system/brain/BrainProductSection.vue
src/components/system/brain/BrainSessionSection.vue
src/components/system/brain/BrainBlogSection.vue
src/components/system/brain/BrainInterventionSection.vue
src/components/system/brain/BrainAgentVizSection.vue
src/components/system/brain/BrainOfficeSection.vue
src/components/system/brain/BrainSelfImprovementSection.vue
src/components/system/brain/BrainGovernanceSection.vue
src/components/system/brain/BrainSectionWrap.vue
src/components/system/brain/BrainRawRenderer.vue
src/components/system/brain/useBrain*.js (12 composables)
```

**PRECAUCION:** Antes de borrar, hacer grep global para verificar que NADA los importa fuera de BrainView.vue viejo. Si algo mas los usa, se preserva o se migra.

**Archivos tambien a limpiar:**
- Modal inline viejo en ClientsView (ya migrado en Fase 7a, pero verificar)
- `useSystemCommandPalette` — si se ramplazo con palette global, eliminar

**Check:** `npm run build` sin warnings, sin imports rotos. Lint script (Parte 12) pasa.

### Fase 15 — Verification gates

Ver Parte 12.

---

## Parte 12 — Verification gates v2 (corregidos)

v1 tenia 6 gates manuales. v2 agrega: smoke tests, rollback procedures, DoD explicito, protocolos de check.

### 12.0 — Eros Observer v2 (verification system)

**CAMBIO vs v2 inicial:** El plan originalmente proponia smoke tests custom con Playwright. Tras descubrir que `scripts/eros-observer.mjs` (1849 lineas, Playwright-based 6-layer analyzer) ya existe en `maqueta/scripts/`, lo adoptamos como verification system oficial. Es infinitamente mas potente que smoke tests custom.

**Que es el observer:**

`scripts/eros-observer.mjs` corre contra cualquier URL (local o remota) y produce, por pagina:
- `manifest.json` — data completa de las 6 capas de analisis
- `analysis.md` — reporte legible con scores y findings
- `full-page-desktop.png` + `full-page-mobile.png` — screenshots completos
- `desktop/*.png` + `mobile/*.png` — screenshots per-section
- `wheel-states/*.png` — si es wheel-driven
- Site-level `--index.json` si corre en batch

**Las 6 capas de analisis:**

1. **Geometry** — visual balance, center of mass, quadrant distribution, symmetry, intentional overlaps, spatial surprises
2. **Aesthetics** — color harmony (mixed/cohesive/monochrome), temperature, saturation, AI fingerprint detection, whitespace ratio, rhythm variance, typography scale (size ratio, levels, weights, modular scale, letter-spacing)
3. **Semantic** — heading hierarchy, landmarks (main/nav/aside), interactive element naming, skip links, ARIA tree
4. **Anti-Template** — template detection (centered-everything, uniform-padding, stock-hero, missing-surprise, low-layout-variety), layout variety score, signatures per section
5. **Structural** — z-index layers, clip-paths, backdrop-filters, shadows + variety, overlap count, pseudo-elements, grain/noise, canvas layers
6. **Motion** — CSS transitions count + avg duration, custom cubic-beziers, CSS animations, GSAP runtime detection, ScrollTrigger count + scrub count, tween count, wheel-driven states

**Quality gates (separados de las 6 capas):**

- Contrast (WCAG)
- Animations (anti-pattern detection)
- Images (alt, dimensions)
- Headings (hierarchy, h1 count)
- Meta/SEO (title, description, OG)
- Overall (pass/fail)

**Excellence signals output:**

- Composition (1-10 + STRONG/MEDIUM/WEAK)
- Depth (1-10)
- Typography (1-10)
- Motion (1-10)
- Craft (1-10)

### Uso durante las 15 fases

**Comando base:**

```bash
cd C:/Users/mateo/Desktop/Dev/tools/maqueta/scripts
node eros-observer.mjs --local --port 5179 ../docs/ux-reform/observer-{phase-id}/
```

Con `--no-discover` para capturar una sola URL (la que este activa en el dev server). Sin `--no-discover` si se quiere crawlear las 10 rutas automaticamente.

### Baseline (ya capturado)

El observer ya corrio contra el superadmin en estado ACTUAL (login page — `/`) y produjo `docs/ux-reform/observer-baseline/localhost/`. Los numeros de partida son:

```
Composition: 5.4/10  MEDIUM
Depth:       3.1/10  WEAK
Typography:  4.5/10  WEAK
Motion:      1.1/10  WEAK
Craft:       4.3/10  WEAK

Quality Gates:
  Contrast:   PASS (5.38 ratio)
  Animations: FAIL (1 HIGH issue)
  Images:     PASS
  Headings:   PASS
  Meta:       FAIL (0/5)
  Overall:    FAIL

Anti-template findings: missing-surprise
Semantic findings: missing-main-landmark, missing-nav-landmark, low-interactive-naming: 33%, missing-skip-link
```

**Este es el punto de partida.** Cualquier fase que haga que estos numeros regresen, falla el gate.

### Target post-ejecucion (criterios cuantitativos)

Al terminar las 15 fases, el observer debe reportar:

| Metric | Baseline | Target |
|---|---|---|
| Composition | 5.4 | >= 7.5 |
| Depth | 3.1 | >= 6.0 |
| Typography | 4.5 | >= 7.0 |
| Motion | 1.1 | >= 5.0 |
| Craft | 4.3 | >= 7.0 |
| Contrast | PASS | PASS (no regresion) |
| Animations | FAIL (1 HIGH) | PASS (0 HIGH) |
| Images | PASS | PASS |
| Headings | PASS | PASS (no regresion) |
| Meta | FAIL (0/5) | PASS (>= 4/5) |
| Overall | FAIL | PASS |
| Anti-template findings | `missing-surprise` | 0 findings |
| Semantic issues | 4 issues | 0-1 issues |

**Si al final de Fase 15 el observer no reporta estos targets, iteramos las fases hasta llegar.**

### Gate por fase — protocolo

Antes y despues de cada fase de riesgo alto (3, 7, 10), ademas del check manual:

1. Guardar snapshot anterior: rename directorio `observer-phase-N-before`
2. Ejecutar la fase
3. Correr observer: `node eros-observer.mjs --local --port 5179 ../docs/ux-reform/observer-phase-N-after/`
4. Diff los scores:
   - Composition >= before (strict)
   - Depth >= before (strict)
   - Typography >= before (strict)
   - Craft >= before (strict)
   - Motion >= before (permisivo — puede bajar si simplificamos animaciones)
   - Ningun quality gate regresa de PASS a FAIL
5. Si algun score regresa, rollback + iterar

### Baseline crawl completo (antes de arrancar Fase 1)

Como pre-step a Fase 1, ampliar el baseline para cubrir TODAS las 10 rutas (no solo `/`):

Con el dev server corriendo y un usuario autenticado (si hace falta), ejecutar el observer en batch contra cada ruta. Nota: login es necesario para rutas autenticadas — observer no tiene login automatizado, asi que el baseline de rutas autenticadas requiere una session cookie prepopulada, o capturarlas manualmente con `localStorage.setItem('auth', ...)` antes.

Estrategia pragmatica: capturar baseline unicamente del login page (ya hecho) + una captura manual post-login de dashboard usando devtools. El baseline completo se actualiza despues de Fase 3 cuando el shell nuevo este en su lugar.

### Si Playwright no esta disponible

`scripts/eros-observer.mjs` ya usa Playwright instalado en `maqueta/scripts/node_modules/playwright`. Verificado: `scripts/package.json` lista `playwright: ^1.59.1`. No hace falta instalar nada.

### 12.1 — Cognitive walkthrough (con protocolo anti-bias)

**NUEVO:** En vez de tiempo objetivo, contar acciones. El tiempo es auto-evaluacion sesgada.

Para cada tarea:
- Protocolo: NO haber abierto esa view en las ultimas 24h. Pantalla a 1280px. Sin cheatsheet abierto.
- Metrica: numero de clicks + keystrokes para completar.
- Umbral: > 3 acciones para el camino feliz = fail.

Tareas:

| # | Tarea | Target |
|---|---|---|
| 1 | Ver salud del sistema | 1 click (navegar a dashboard) |
| 2 | Editar features de tenant X | Ctrl+K + nombre + Enter + click Features = 4 acciones |
| 3 | Ver por que brain decidio X | 1 click (g b) + scroll = 1 action + scroll |
| 4 | Filtrar logs de tenant X errores | g l + tenant filter + level = 3 clicks |
| 5 | Cambiar densidad | Ctrl+. = 1 action |
| 6 | Ver brain coherence history | g b + scroll a PULSE = 1 action + scroll |

### 12.2 — Visual diff por view

Screenshots before/after en 3 viewports (1440, 1024, 768). Revision manual con los 2 lado a lado.

### 12.3 — Consistency lint script

**Archivo:** `scripts/lint-ux.mjs`

Corregido con lookaheads para evitar falsos positivos (verifier fix):

```js
const checks = [
  {
    name: 'hardcoded padding',
    regex: /padding:\s*(?!var\()\d/g,  // excluye var(
    target: 'src/**/*.vue',
    exclude: ['src/views/LoginView.vue'],  // login tiene su propio layout
  },
  {
    name: 'hardcoded border-radius (except 0 and 50%)',
    regex: /border-radius:\s*(?!0|50%|var\()\S/g,
    target: 'src/**/*.vue',
  },
  {
    name: 'hardcoded z-index',
    regex: /z-index:\s*(?!var\()\d/g,
    target: 'src/**/*.vue',
  },
  {
    name: 'visible box-shadow (not none)',
    regex: /box-shadow:\s*(?!none|var\()\S/g,
    target: 'src/**/*.vue',
  },
  {
    name: 'imports of deleted Brain section components',
    regex: /from\s+['"].*brain\/Brain(Status|Context|Watchdog|Decisions|Learning|Testing|Evolution|Rollout|Routing|Gaps|Knowledge|Experience|AgentTrust|Counters|Product|Session|Blog|Intervention|AgentViz|Office|SelfImprovement|Governance|SectionWrap|RawRenderer)Section/g,
    target: 'src/**/*.vue',
  },
  {
    name: 'imports of deleted Brain composables',
    regex: /from\s+['"].*brain\/useBrain/g,
    target: 'src/**/*.vue',
  },
  {
    name: 'position: fixed outside approved components',
    regex: /position:\s*fixed/g,
    target: 'src/**/*.vue',
    exclude: [
      'src/components/layout/StatusBar.vue',
      'src/components/layout/CommandPalette.vue',
      'src/components/layout/TopBar.vue',
      'src/components/layout/SideBar.vue',
      'src/components/layout/InspectorPane.vue',
    ],
  },
]

// Strip CSS comments before running regex
function stripComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, '')
}
```

Exit code 0 si todo limpio, > 0 si hay fallos. Bloquea merge.

### 12.4 — Empty space audit

Abrir cada view en 1920px con devtools:
- [ ] Cada cell tiene contenido o empty state visible
- [ ] Ninguna zona > 100px vacia sin proposito
- [ ] Grids balanceados (cells dentro de una row con altura similar)
- [ ] Inspector open no deja huecos en canvas

**Semi-automatizable:** Script que toma screenshot de cada view y analiza regiones de pixel constante > 100px × 100px. Flag como potencial vacio.

### 12.5 — Keyboard navigation test

Checklist manual, con overlay abierto para referencia:

- [ ] `Ctrl+K` desde las 10 views
- [ ] `g d`, `g c`, `g l`, `g b`, `g s`, `g m`, `g p`, `g e` desde cualquier view
- [ ] `Ctrl+I` toggle inspector en ClientsView, SystemPanelView
- [ ] `Ctrl+B` toggle sidebar
- [ ] `Ctrl+.` cycle density
- [ ] `?` muestra shortcuts overlay
- [ ] `Esc` cierra todos los overlays
- [ ] `j`/`k` en ClientsView table
- [ ] `1`-`5` en BrainView scrolling
- [ ] Focus en un `<input>` — ningun shortcut de view/global se dispara (excepto Esc)

### 12.6 — Functional regression (con protocolo)

**Con protocolo explicito, no solo checklist (verifier fix):**

| Item | Protocolo |
|---|---|
| Login/logout | Logout, click login, enter creds, verify dashboard loads |
| WS Brain | Navegar /system/brain, devtools Network WS filter, esperar 10s, verificar >= 3 frames |
| WS Logs | Navegar /superadmin/logs, devtools Network WS filter, esperar 10s, verificar >= 3 frames |
| CRUD tenant create | Ir a /clients/new, fill form, submit, verificar aparece en list |
| CRUD tenant features | Click tenant, inspector features tab, toggle una feature, save, refresh page, verificar persistencia |
| CRUD CMS contract | /cms-contracts, click "new", create contract, verificar aparece |
| Env save | /system/env, add URL, save, verificar toast success, verificar backend recibio |
| Modals destructivos | Delete tenant → modal confirm, cancel funciona, confirm borra |
| Real-time brain | BrainView abierto, verificar que coherence number cambia cada N segundos |

### 12.7 — Rollback procedures por fase

| Fase | Rollback command | Archivos afectados |
|---|---|---|
| Fase 3 (Shell) | `git revert <sha>` | `App.vue`, `src/components/layout/*`, `src/stores/shell.js` |
| Fase 7 (Clients) | `git revert <sha-7b>` + `git revert <sha-7a>` | `ClientsView.vue`, `src/components/clients/*`, `src/components/inspector/tenant/*` |
| Fase 10 (Brain) | `git revert <sha>` | `src/views/system/BrainView.vue`, `src/views/system/brain-v2/*` |
| Fase 14 (Cleanup) | `git revert <sha>` — restaura 22 componentes viejos | `src/components/system/brain/*` |

### 12.8 — Definition of Done (DoD)

Una fase solo esta **completa** cuando:

- [ ] El check de la fase pasa (con protocolo explicito)
- [ ] `npm run build` sin warnings
- [ ] `npm run lint` (si existe) sin warnings
- [ ] `scripts/lint-ux.mjs` pasa
- [ ] Screenshots before/after guardados en `docs/ux-reform/phase-N/`
- [ ] Smoke tests (si aplican) pasan
- [ ] Commit con mensaje: `feat(ux): [fase N] descripcion breve`
- [ ] Evidencia adjunta al PR description: output de lint, path de screenshots, logs del build

**Nadie puede declarar una fase completa sin esos items.** Un reviewer externo puede bloquear el merge si falta evidencia.

---

## Parte 13 — Anti-patterns (ampliado)

Lista de cosas prohibidas durante la ejecucion de este plan.

### Layout

- Agregar `padding` al wrapper del canvas (el padding vive en cells)
- Usar `max-width` hardcoded en cells o rows
- Usar `margin` entre cells (separador = gap)
- Usar `grid-template-columns` ad-hoc (solo las 7 variantes)
- Poner `border` en una cell (separador = gap)
- Usar `style="padding: 0"` inline (usar `.canvas-cell--flush`)

### UX

- Reemplazar modal por otro modal (los modales se eliminan, solo sobreviven los destructivos)
- Duplicar acciones en multiples lugares
- Mostrar el mismo dato en dos views distintas
- Usar tooltip para explicar un label mal nombrado (si necesita tooltip, el label esta mal)
- Iconos decorativos sin significado (los iconos del sidebar SI tienen significado)
- Mezclar idiomas (es/en) en la misma view

### Interaccion

- Hover-only interactions sin focus-visible equivalente
- Overlay bloqueante para errores (todo error es inline o banner)
- Spinners centrados (usar SkeletonCell)
- Animaciones > 300ms
- Transitions lentas (max 150ms)

### Codigo

- Modificar stores existentes
- Modificar services / API / router (excepto `router.afterEach(closeInspector)`)
- Agregar dependencias nuevas sin justificacion (Playwright es la unica propuesta en v2)
- Importar componentes de `src/components/system/brain/` en el nuevo BrainView o en cualquier parte nueva del shell
- Importar composables `useBrain*` en nuevos componentes
- Reutilizar `SectionDrawer` en el nuevo BrainView (SI se puede en otras views)
- Crear un segundo store "ui" — `useAppShellStore` es el unico

### Estados

- Renderizar un componente de data sin los 4 estados
- Texto "Loading..." o "No data" generico
- Spinner en el medio de una card
- Empty state sin mensaje explicativo del proximo paso

---

## Parte 14 — Scope (lista absoluta)

### Archivos que se crean

```
src/stores/shell.js                                   ← NUEVO
src/components/layout/AppShell.vue                    ← NUEVO
src/components/layout/TopBar.vue                      ← NUEVO
src/components/layout/SideBar.vue                     ← NUEVO
src/components/layout/StatusBar.vue                   ← NUEVO
src/components/layout/InspectorPane.vue               ← NUEVO
src/components/layout/CommandPalette.vue              ← NUEVO
src/components/layout/ShortcutsOverlay.vue            ← NUEVO
src/components/layout/primitives/CanvasRow.vue        ← NUEVO
src/components/layout/primitives/CanvasCell.vue       ← NUEVO
src/components/layout/primitives/MetricCell.vue       ← NUEVO
src/components/layout/primitives/ContextHeader.vue    ← NUEVO
src/components/layout/primitives/TabBar.vue           ← NUEVO
src/components/layout/primitives/SectionTitle.vue     ← NUEVO
src/components/ui/SkeletonCell.vue                    ← NUEVO
src/components/ui/EmptyCell.vue                       ← NUEVO
src/components/ui/ErrorCell.vue                       ← NUEVO
src/components/ui/HealthDot.vue                       ← NUEVO
src/components/ui/PulseIndicator.vue                  ← NUEVO
src/components/ui/Sparkline.vue                       ← NUEVO
src/components/ui/KeyChip.vue                         ← NUEVO
src/components/dashboard/SystemPulseHero.vue          ← NUEVO
src/components/dashboard/RecentActivityFeed.vue       ← NUEVO
src/components/dashboard/QuickActions.vue             ← NUEVO
src/components/clients/ClientsContextHeader.vue       ← NUEVO
src/components/clients/modals/FeaturesModal.vue       ← EXTRAIDO (Fase 7a)
src/components/clients/modals/CmsModal.vue            ← EXTRAIDO (Fase 7a)
src/components/inspector/tenant/TenantOverviewTab.vue ← NUEVO
src/components/inspector/tenant/TenantFeaturesTab.vue ← NUEVO (wraps FeaturesModal)
src/components/inspector/tenant/TenantUsersTab.vue    ← NUEVO (wraps UserModal)
src/components/inspector/tenant/TenantCmsTab.vue      ← NUEVO (wraps CmsModal)
src/components/inspector/tenant/TenantAuditTab.vue    ← NUEVO
src/components/inspector/contract/ContractOverviewTab.vue ← NUEVO
src/components/inspector/contract/ContractSchemaTab.vue   ← NUEVO
src/components/inspector/contract/ContractPreviewTab.vue  ← NUEVO
src/components/inspector/system/SystemSectionTab.vue  ← NUEVO
src/components/inspector/log/LogDetailTab.vue         ← NUEVO
src/components/logs/LogsFilterBar.vue                 ← NUEVO
src/components/logs/LogsConsole.vue                   ← NUEVO
src/views/system/brain-v2/BrainHeroBand.vue           ← NUEVO
src/views/system/brain-v2/BrainPulseBand.vue          ← NUEVO
src/views/system/brain-v2/BrainCurrentBand.vue        ← NUEVO
src/views/system/brain-v2/BrainEvolutionBand.vue      ← NUEVO
src/views/system/brain-v2/BrainArchiveGrid.vue        ← NUEVO
src/views/system/brain-v2/BrainDeepDrawer.vue         ← NUEVO
src/views/system/brain-v2/helpers/coherence.js        ← NUEVO
src/views/system/brain-v2/helpers/timeAgo.js          ← NUEVO
src/views/system/brain-v2/helpers/sparkline.js        ← NUEVO
src/views/system/brain-v2/helpers/flatten.js          ← NUEVO
src/views/system/brain-v2/helpers/sectionMeta.js      ← NUEVO
src/composables/ui/useKeyboard.js                     ← NUEVO
src/composables/ui/useCommandPalette.js               ← NUEVO
src/composables/ui/useFocusMemory.js                  ← NUEVO
src/composables/ui/useBreadcrumb.js                   ← NUEVO
src/composables/ui/useDensity.js                      ← NUEVO
src/composables/ui/useEmptyState.js                   ← NUEVO
src/composables/ui/useRowKeyboardNav.js               ← NUEVO
scripts/lint-ux.mjs                                   ← NUEVO
scripts/smoke-test.mjs                                ← NUEVO (si Playwright se instala)
```

Total: ~55 archivos nuevos.

### Archivos que se modifican

```
src/App.vue                                           ← refactor a AppShell
src/assets/design-system.css                          ← agregar tokens --pz-* + primitives CSS
src/router/index.js                                   ← agregar UNA linea: afterEach closeInspector
src/stores/system/index.js                            ← agregar UNA linea: export useAppShellStore
src/views/DashboardView.vue                           ← refactor template
src/views/ClientsView.vue                             ← refactor template (split)
src/views/CmsContractsView.vue                        ← refactor template
src/views/CreateClientView.vue                        ← refactor template
src/views/LoginView.vue                               ← ajustes menores
src/views/LogsView.vue                                ← refactor template
src/views/system/BrainView.vue                        ← reescritura completa (wrapper simple)
src/views/system/EnvManagerView.vue                   ← refactor template
src/views/system/LocalCommandView.vue                 ← refactor (opcional Fase 11)
src/views/system/SystemPanelView.vue                  ← refactor template
package.json                                          ← agregar @playwright/test (si aplica)
```

Total: ~15 archivos modificados.

### Archivos que se ELIMINAN en Fase 14

```
src/components/system/brain/BrainStatusSection.vue
src/components/system/brain/BrainContextSection.vue
src/components/system/brain/BrainWatchdogSection.vue
src/components/system/brain/BrainDecisionsSection.vue
src/components/system/brain/BrainLearningSection.vue
src/components/system/brain/BrainTestingSection.vue
src/components/system/brain/BrainEvolutionSection.vue
src/components/system/brain/BrainRolloutSection.vue
src/components/system/brain/BrainRoutingSection.vue
src/components/system/brain/BrainGapsSection.vue
src/components/system/brain/BrainKnowledgeSection.vue
src/components/system/brain/BrainExperienceSection.vue
src/components/system/brain/BrainAgentTrustSection.vue
src/components/system/brain/BrainCountersSection.vue
src/components/system/brain/BrainProductSection.vue
src/components/system/brain/BrainSessionSection.vue
src/components/system/brain/BrainBlogSection.vue
src/components/system/brain/BrainInterventionSection.vue
src/components/system/brain/BrainAgentVizSection.vue
src/components/system/brain/BrainOfficeSection.vue
src/components/system/brain/BrainSelfImprovementSection.vue
src/components/system/brain/BrainGovernanceSection.vue
src/components/system/brain/BrainSectionWrap.vue
src/components/system/brain/BrainRawRenderer.vue
src/components/system/brain/useBrainAnomalies.js
src/components/system/brain/useBrainCoherence.js
src/components/system/brain/useBrainCommandPalette.js
src/components/system/brain/useBrainI18n.js
src/components/system/brain/useBrainMode.js
src/components/system/brain/useBrainOffice.js
src/components/system/brain/useBrainSections.js
src/components/system/brain/useAnimatedNumber.js
src/components/system/brain/useFlashOnChange.js
src/components/system/brain/useMetricHistory.js
src/components/system/brain/useTimeAgo.js
```

Total: ~35 archivos eliminados.

### Archivos INTOCABLES

```
src/stores/system/*.js (excepto index.js para agregar un export)
src/stores/system/brain.js                            ← SE LEE, NO SE MODIFICA
src/stores/system/socket.js                           ← SE LEE, NO SE MODIFICA
src/services/*
src/api/*
src/composables/useSystemAlerts.js
src/composables/useSystemCommandPalette.js
src/composables/useSystemSectionHealth.js
src/config/*
src/constants/*
src/utils/*
vite.config.js
```

---

## Apendice A — Matrix de impacto por archivo (corregida v2)

| Archivo | Accion | Riesgo | Fase | Rollback atomic |
|---|---|---|---|---|
| `design-system.css` | Agregar tokens | Bajo | 1 | Revert |
| `App.vue` | Refactor root a AppShell | Medio | 3 | Revert |
| `src/components/layout/*.vue` (7) | Crear | Bajo | 3-5 | Delete folder |
| `src/components/layout/primitives/*.vue` (6) | Crear | Bajo | 2 | Delete folder |
| `src/components/ui/*.vue` (7) | Crear | Bajo | 2 | Delete folder |
| `src/stores/shell.js` | Crear | Bajo | 3 | Delete file |
| `src/composables/ui/*.js` (7) | Crear | Bajo | 4-5 | Delete folder |
| `src/router/index.js` | Agregar 1 linea | Bajo | 4 | Revert linea |
| `DashboardView.vue` | Refactor template | Bajo | 6 | Revert |
| `ClientsView.vue` | Split + extract modals | Alto | 7a, 7b | Revert 7b, Revert 7a |
| `src/components/clients/modals/*.vue` (2) | Extraer | Medio | 7a | Delete + restore inline |
| `src/components/inspector/tenant/*.vue` (5) | Crear | Medio | 7b | Delete folder |
| `LogsView.vue` | Refactor + sticky | Medio | 8 | Revert |
| `SystemPanelView.vue` | Refactor + migrate drawer | Medio | 9 | Revert |
| `BrainView.vue` | **Reescritura completa** | **Alto** | **10** | Revert all brain-v2 |
| `src/views/system/brain-v2/*` (6 + helpers) | Crear | Alto | 10 | Delete folder |
| `LocalCommandView.vue` | Refactor o stretch | Alto | 11 (opcional) | Revert |
| `CmsContractsView.vue` | Refactor + inspector | Bajo | 12 | Revert |
| `CreateClientView.vue` | Refactor template | Bajo | 12 | Revert |
| `EnvManagerView.vue` | Refactor | Bajo | 12 | Revert |
| `LoginView.vue` | Ajustes menores | Bajo | 12 | Revert |
| Brain viejos (35 archivos) | **Eliminar** | Bajo (ya no se usan) | 14 | Revert (restaura) |
| `scripts/lint-ux.mjs` | Crear | Bajo | 2 | Delete |
| `scripts/smoke-test.mjs` | Crear | Bajo | 0B | Delete |
| `package.json` | +@playwright/test | Bajo | 0B | Revert |

---

## Apendice B — Risk matrix v2 (corregida con findings)

| Riesgo | Impacto | Probabilidad | Mitigacion |
|---|---|---|---|
| BrainView no se percibe simple (sigue estresante) | Alto | Medio | Fase 10 tiene check empty-state-test + sr-test + walkthrough de 5 tareas. Iteracion visual con Mateo antes de merge. |
| Brain WebSocket data no llega a las bandas nuevas (error en store usage) | Alto | Bajo | Protocolo de check Fase 10 ítem 6 explicita: Network WS filter, verificar frames y sparkline update. |
| Extraccion de modales inline rompe funcionalidad (Fase 7a) | Alto | Medio | 7a es refactor puro — check ítem 6 "sin cambios visuales". Rollback atomico si algo rompe. |
| Inspector store causa re-renders excesivos | Medio | Bajo | `shallowRef` en subject + `markRaw` en tab components (architect fix). |
| Keyboard shortcuts colisionan con browser | Bajo | Medio | `e.preventDefault()` en todos. Shortcuts raros (Ctrl+.) documentados en overlay. |
| Empty states se ven "tristes" y no "calmos" | Medio | Medio | Diseño explicito en Parte 5. Revision con Mateo del playground de EmptyCell antes de extender. |
| ~~Reskin-plan no esta ejecutado~~ | — | — | **RESUELTO — reskin ejecutado y verificado en codigo. No aplica.** |
| 22 Brain sections tienen data crucial que BrainDeepDrawer no muestra bien | Medio | Medio | BrainDeepDrawer es minimalista por design. Si falta algo, iteracion post-Fase 10 con drawers especializados (no reutilizando). |
| Smoke tests tardan > 2 min (bloquea iteration speed) | Bajo | Bajo | Scope cerrado a 12 asserts. Si tarda mas, paralelizar con playwright workers. |
| Playwright install rompe algo en el projecto | Bajo | Bajo | Instalacion es dev-only, no afecta build. Rollback via package.json. |
| Densidad "dense" no se ve bien en cells hero | Medio | Medio | Dense solo afecta `--pz-cell-pad-*`. El hero usa `calc(* 1.5)` que se mantiene proporcional. Verificar en Fase 2 playground. |
| LocalCommandView Fase 11 consume tiempo del scope principal | Medio | Medio | Marcada como stretch goal. Skip si Fase 10 llevo mas tiempo del previsto. |
| El scope de 55 archivos nuevos es too much para un PR | Medio | Alto | Los checkpoints (3 stable points) permiten merges parciales. Cada fase es su propio commit. |

---

## Apendice C — Las 10 decisiones duras (corregidas v2)

**1. ¿Max-width global o canvas unlimited?**
→ Unlimited. En widescreen se llena con row--4. Inspector abierto degrada a row--2 en < 1600 (architect fix).

**2. ¿Modales para edit o inspector pane?**
→ Inspector para edit. Modales solo para destructivos (delete confirm).

**3. ¿Brain view tabs, bands, o mantener stack?**
→ **Bandas progresivas (5) NO tabs.** v1 proponia tabs, Mateo pidio simplificar mas. Las bandas muestran info jerarquicamente con scroll natural, sin ocultar nada, sin clicks para cambiar de contexto. El archive al final es el "explorar todo" sin forzar estructura tab-semantica.

**4. ¿Topbar en desktop visible o oculto?**
→ Visible, 32px, con breadcrumb.

**5. ¿Sidebar con iconos o solo texto?**
→ **Con iconos.** v1 proponia sin iconos. v2 corrige: los iconos son landmarks, sacarlos es regresion (sidebar actual tiene iconos).

**6. ¿Command palette solo en Brain o global?**
→ Global. Extraido del Brain a un sistema nuevo (no reusando `useBrainCommandPalette`).

**7. ¿Density toggle 3 modos o menos?**
→ **2 modos (comfortable / dense).** v1 tenia 3. Analyst + simplification = 2.

**8. ¿Status bar nueva o agregamos info al topbar?**
→ Nueva, abajo, 24px. Separa "donde estoy" de "como anda el sistema".

**9. ¿Se preserva algo del Brain actual?**
→ **Solo la data (store Pinia).** Ni los componentes, ni los composables de UX, ni el SectionDrawer. Mateo explicit.

**10. ¿Smoke tests con Playwright o manual?**
→ Recomendado Playwright (Fase 0B). Manual como fallback. Sin smoke tests la verificacion queda comprometida (verifier fix).

---

## Apendice D — Execution order with checkpoints (v2)

```
Phase 0    ─── Backup + screenshots + dep check          [verify dev runs + tokens spot-check]
Phase 0B   ─── Smoke test infrastructure (opcional)      [playwright install + 12 asserts]
Phase 1    ─── Layout tokens                             [devtools inspection]
Phase 2    ─── Primitives + CSS + lint script            [playground test]
Phase 3    ─── Shell 5-zone + SideBar con iconos         [CRITICAL: nav + ws protocol + login]
Phase 4    ─── Inspector pane + router afterEach         [manual dispatch test]
Phase 5    ─── Command palette + keyboard system         [all shortcuts work]
           ─────────────────────────────── CHECKPOINT 1 (shell done, views untouched)

Phase 6    ─── Dashboard redesign                        [visual diff + 4 estados]
Phase 7a   ─── Extract inline modals (ClientsView)       [refactor puro — no visual change]
Phase 7b   ─── ClientsView split + inspector             [CRITICAL: CRUD works + modals migrated]
Phase 8    ─── Logs sticky + keyboard                    [WS stream still live + shortcuts]
Phase 9    ─── System panel refine                       [drawer → inspector + hero band]
           ─────────────────────────────── CHECKPOINT 2 (views primitivas done)

Phase 10   ─── BrainView rebuild COMPLETO                [CRITICAL: empty-state test + WS + SR test]
Phase 11   ─── LocalCommand (stretch, opcional)          [similar a Brain]
           ─────────────────────────────── CHECKPOINT 3 (heavy views done)

Phase 12   ─── CMS + CreateClient + Env + Login          [final views]
Phase 13   ─── Responsive audit                          [all breakpoints + density]
Phase 14   ─── Cleanup dead code (35 archivos)           [npm run build clean + lint]
Phase 15   ─── Verification gates                        [all gates pass + DoD]
           ─────────────────────────────── READY TO MERGE
```

---

## Apendice E — Review findings mapping (v2 traceability)

Para cada finding de los 4 reviewers, donde esta abordado en v2:

### Critic (REVISE)

| Finding | Abordado en |
|---|---|
| BrainAgentsSection no existe | Parte 4.1 — 22 componentes reales listados |
| FeaturesModal/UsersModal/etc inline | Fase 7a — extract modals |
| useBrainSearch / useBrainShortcuts no existen | Parte 4.1 — no se citan mas |
| CreateClientView olvidado | Parte 4.8 — wizard incluido |
| Padding hardcoded contradictions | `.canvas-cell--flush` en Parte 3.2 |
| CSS shorthand aritmetico | Parte 3.1 — split --y/--x |
| Sidebar sin iconos vs collapse con iconos | Parte 2.5 — con iconos |
| Inspector + tabs conflict | Parte 2.9 — responsive degradacion |
| BrainSectionWrap assumption | Parte 4.1 — no se usa |
| No tests | Parte 12.0 — smoke tests |
| ARIA missing | Parte 8 completa |
| Multi-window localStorage | Parte 8.8 + Parte 9.7 |
| Rollback por fase missing | Parte 12.7 |
| i18n strategy missing | Parte 4.1 — strings crudas, no usa useBrainI18n |

### Architect (REVISE)

| Finding | Abordado en |
|---|---|
| `.canvas` necesita min-height: 0 | Parte 3.2 |
| Inspector con shallowRef + router.afterEach + markRaw | Parte 2.7 |
| Command palette scope tokens | Parte 7.6 — useKeyboard impl |
| BrainView lifecycle (KeepAlive needed) | Parte 4.1 — no se usan los componentes viejos, problem eliminated |
| Store name collision useSystemUIStore | Parte 2.2 — renamed to useAppShellStore |
| Keyboard scope precedence | Parte 7.5 — focused > view > global |
| State persistence strategy | Parte 9 completa |
| Single key versionado | Parte 9.1 — pegasuz.shell.v1 |

### Analyst (REQUEST_CHANGES)

| Finding | Abordado en |
|---|---|
| Orden SI | Rules 1-13 force orden sistemico |
| Claridad PARCIAL (keyboard not 30s obvious) | Parte 8.5 — onboarding hint + KeyChip on buttons |
| Uniformidad SI | Rules 1-13 + lint script |
| Reduce macro pero no micro | Parte 4.1 — rebuild radical resuelve micro |
| Vacios dinamicos sin spec | Parte 5 completa |
| Reskin dependency implicita | Parte 0.1 — verificado ejecutado. No bloquea. |
| 3 densities overkill | Parte 3.1 — 2 modes |
| No moment of delight | Parte 4.1 BrainHero (hero number gigante = signature element) |
| Brain micro-density not audited | Parte 4.1 — rebuild by-pass el issue |
| Empty state spec per MetricCell | Parte 5.5 — MetricCell implementa los 4 estados |

### Verifier (FAIL, 4 blockers)

| Blocker | Abordado en |
|---|---|
| No automated tests | Parte 12.0 — smoke tests Fase 0B |
| WS data integrity not verified | Parte 12.6 — protocolo explicito con Network filter |
| No rollback plan | Parte 12.7 — rollback por fase |
| No DoD | Parte 12.8 — checklist explicito |
| Fase 3/7/10 checks insufficient | Parte 11 — protocolos en cada fase |
| lint script false positives | Parte 12.3 — regex con lookaheads |
| Cognitive walkthrough biased | Parte 12.1 — conteo de acciones, no tiempo |
| Error states not tested | Parte 5.7 — checklist 4-estado manual |

---

## Epilogo — Por que v2 va a funcionar donde v1 habria fallado

Tres razones concretas.

**Primera: v2 esta verificado contra el codigo real.** Todas las referencias a archivos, composables, lineas, y stores fueron grepeadas. Las mentiras de v1 (BrainAgentsSection, useBrainSearch, modales como componentes) estan corregidas. Cuando alguien abra `src/components/system/brain/` y haga `ls`, lo que vea va a matchear lo que dice este plan.

**Segunda: v2 escucha al usuario, no a mi intuicion.** v1 pivoto incorrectamente cuando asumi "BrainView tiene sofisticacion = preservar". Mateo me corrigio: *"es muy estresante"*. v2 abraza la correcion y reescribe BrainView desde cero. Las features sofisticadas del Brain actual (command palette, density, mini-mode, drawer) se pierden — pero se ganan en el shell global, mejor diseñadas, y lo mas importante, se gana **calma**. Una view que no estresa vale mas que una que tiene 10 features.

**Tercera: v2 tiene "nunca vacio" elevado a principio y regla.** Parte 5 + RULE 11 + los 4 estados canonicos + SkeletonCell/EmptyCell/ErrorCell aseguran que ningun rectangulo en blanco aparezca. La queja original de Mateo no puede volver — la estructura del plan no lo permite.

---

Cuando termine esto Mateo va a abrir el panel y:

- Ver el Dashboard y saber en 3 segundos si el sistema esta OK (el hero dominante responde)
- Editar un tenant sin perder el contexto de la lista (split + inspector)
- Debuggear decisiones del brain sin scrollear 3000px (5 bandas calmas)
- Al entrar al BrainView no va a ver 22 cajas apiladas — va a ver un numero grande, respirar, y entender
- Nunca va a ver un rectangulo en blanco sin mensaje
- Va a navegar todo con teclado usando 12 shortcuts esenciales
- Va a cambiar densidad con un toque (Ctrl+.)
- Va a encontrar cualquier cosa en < 3 acciones

**Y cuando lo muestre, va a sentir orgullo, no solo funcionalidad.**

Esa es la promesa. Como Eros, la firmo.

---

*Plan v2 escrito por Eros, Director Creativo Autonomo, corregido contra 12 findings de 4 reviews + 2 correcciones de direccion de Mateo en vivo. Basado en grep real sobre el codigo target, no en mapa mental.*

*Fecha: 2026-04-10*
*Version: 2.0*
*Supersedes: v1 (pegasuz-superadmin-ux-ultra-plan.md)*

