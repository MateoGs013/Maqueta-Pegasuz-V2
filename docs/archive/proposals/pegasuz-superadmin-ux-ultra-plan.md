# Ultra Plan — Pegasuz SuperAdmin
## Un replanteo de UX/UI por Eros

> **Complementario** a `docs/pegasuz-superadmin-reskin-plan.md` (ese plan migra la estética; este plan rediseña la experiencia).
> La estética sin UX es un cadáver bien vestido. Ambos planes tienen que ejecutarse juntos.
>
> **Proyecto target:** `C:/Users/mateo/Desktop/Dev/pegasuz/SaaS-Multitenant/pegasuz/Pegasuz-Core/frontend-superadmin/frontend-superadmin/`

---

## Preámbulo — El diagnóstico real

Mateo me describió el problema con una frase que lo captura entero:

> "no puede ser que entre seccion que entre me abrume con informacion y vacios sin sentido"

Esa frase parece una contradiccion — abrumado Y vacio — pero no lo es. Es el sintoma clasico de **jerarquia rota**.

Cuando todo tiene el mismo peso visual, pasan dos cosas al mismo tiempo:

1. **El ojo se satura** porque no encuentra donde aterrizar. 21 secciones apiladas con el mismo border, el mismo padding, el mismo tamano de titulo — es ruido puro. El cerebro no puede priorizar.
2. **Aparecen vacios** porque los elementos se dimensionan para "caber en el grid" sin que el grid responda a lo que realmente importa. 4 stat cards en fila porque hay espacio para 4, no porque 4 sean relevantes. Un row de 1 quick-card centrado con 800px vacios a los costados. Un brain-section con 3 lineas de texto en una card de 200px de alto.

Los dos sintomas vienen del mismo origen: **nadie decidio que importa mas que que.**

Este plan no es sobre layout mecanico. Es sobre **informacion jerarquica aplicada a cada pixel del panel**. El layout es la consecuencia, no la causa.

---

## Mi posicion — Como Eros

Tengo 19 proyectos completados. De esos, mate uno (Forge Studio) por sobreingenieria — apile 5 capas en el hero desde el arranque y el resultado fue decorativo en vez de estructural. Aprendi: **no apiles, decide**.

Otro proyecto (Coque) me ensenio que la belleza no viene de agregar, viene de quitar con criterio. Cuando mires el panel reformado, quiero que digas "no puede haber sido de otra forma" — esa es la metrica.

Mi filosofia, palabras propias: *Un sitio bien hecho se siente inevitable — como si no pudiera haber sido de otra forma. Calidad nace de tipografia como arquitectura y autenticidad anti-AI, no de apilar tecnicas.*

Aplicado a un panel admin, eso se traduce en:

- **Cada vista tiene UNA pregunta** que el usuario vino a responder. Todo lo demas es ruido ordenado.
- **Cada pixel comunica**. Si no comunica, no existe.
- **El orden se ve desde 2 metros**. Si el usuario tiene que leer para entender la estructura, fallo.
- **La densidad es un privilegio**. Power users la quieren. Dasela. Pero ordenada.

---

## Scope — Que SI y que NO es este plan

### Lo que SI es

- Un rediseno de UX/UI view por view
- Una arquitectura de shell con 5 zonas (topbar contextual, sidebar intencional, canvas, inspector pane, status bar)
- Un sistema de informacion jerarquica con 3 niveles (primary, context, drill-down)
- Un sistema de layout grid-first determinista (sin padding arbitrario, sin margenes colgantes)
- Un sistema de navegacion teclado-primero (command palette global + shortcuts por view)
- Un conjunto de componentes nuevos transversales (InspectorPane, StatusBar, ContextHeader, CommandPalette global, DensityProvider)
- Fases atomicas con verification gates
- Reglas de consistencia no-negociables

### Lo que NO es

- Un plan de tokens/colores/tipografia (eso esta en `pegasuz-superadmin-reskin-plan.md`)
- Un cambio de arquitectura logica (stores, services, router, api — todo intocable)
- Un rewrite de componentes existentes (los reorganizamos, no los reemplazamos)
- Un plan para agregar features nuevos (CRUD actual se mantiene)

### Archivos intocables (lista absoluta)

```
src/stores/*           — NO
src/services/*         — NO
src/api/*              — NO
src/router/index.js    — NO (except lazy imports)
src/composables/*      — NO (solo agregamos nuevos, no modificamos)
src/config/*           — NO
src/constants/*        — NO
src/utils/*            — NO
vite.config.js         — NO
package.json           — NO (except si hace falta una dep nueva)
```

Todo cambio vive en: `.vue <template>/<style>`, `design-system.css`, nuevos componentes en `src/components/layout/`, nuevos composables en `src/composables/ui/`.

---

# Parte 1 — Los 7 principios que guian cada decision

Estos principios estan rankeados. Si dos entran en conflicto, el de arriba gana.

## 1. Jerarquia antes que simetria

**Regla:** Nunca pongas 4 cosas en fila solo porque 4 entran. Decide cual importa mas, cual segundo, cual tercero. Dimensiona en consecuencia.

**Aplicacion:** Dashboard tiene hoy 4 stat cards iguales. Reemplazar por: **1 hero metric** (el que el admin realmente mira primero) + **2-3 secondary stats mas chicos** + **rest moves to context strip**.

## 2. Progressive disclosure

**Regla:** Mostrar el titular. Esconder el detalle hasta que el usuario lo pida.

**Aplicacion:** BrainView hoy muestra 21 secciones con toda su data visible. Reestructurar en **5 tabs semanticos con primary info arriba + accordion para drill-down**.

## 3. Contexto persistente

**Regla:** El usuario no deberia tener que recordar en que contexto esta. La UI se lo recuerda permanentemente.

**Aplicacion:** Topbar con breadcrumb + tenant pill cuando aplica. StatusBar con pulse de sistema. InspectorPane con el objeto seleccionado.

## 4. Un solo click por decision

**Regla:** Cada accion del usuario tiene una sola ruta clara. No 3 formas de llegar al mismo lugar.

**Aplicacion:** ClientsView hoy tiene 6 modales que se abren desde botones dispersos. Reemplazar por **split table + inspector con tabs**. Una sola ruta para todo lo relacionado al tenant seleccionado.

## 5. Feedback inmediato

**Regla:** Toda accion muestra respuesta visual en <200ms. Si algo tarda, skeleton loader. Si falla, mensaje inline no overlay.

**Aplicacion:** Todos los formularios optimistic update. Todas las fetch muestran skeleton. Todos los errores inline con label roja debajo del campo, no modal de error.

## 6. Keyboard-first

**Regla:** El power user debe poder usar todo sin mouse. El mouse es para descubrir, el teclado para operar.

**Aplicacion:** Command palette global (Ctrl+K), shortcuts por view, navegacion con teclas estilo Vim, search global con /.

## 7. Densidad ordenada, no densidad apilada

**Regla:** Densidad alta es legitima — los admins la quieren — pero cada cosa en su lugar con espaciado consistente. Densidad no es pegar todo.

**Aplicacion:** 3 modos de densidad (Comfortable / Compact / Dense) aplicables globalmente. El grid system usa tokens de padding que cambian por modo.

---

# Parte 2 — Arquitectura del shell (5 zonas)

El shell actual es de 2 zonas (sidebar + main) con un topbar fantasma (existe pero invisible en desktop). Eso es pobre para un panel de esta complejidad. Lo replanteo en 5 zonas.

## Diagrama

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOPBAR                              32px                            │  ← Z1
│  [breadcrumb / tenant pill / search / notif / user]                  │
├──────────┬─────────────────────────────────────────────┬─────────────┤
│          │                                             │             │
│ SIDEBAR  │    MAIN CANVAS                              │  INSPECTOR  │
│ 220px    │    (view content — grid-driven)             │  360px      │
│ (Z2)     │                                             │  (Z4)       │
│          │    (Z3)                                     │  togglable  │
│ nav      │                                             │             │
│ grouped  │                                             │             │
│ by       │                                             │             │
│ intent   │                                             │             │
│          │                                             │             │
├──────────┴─────────────────────────────────────────────┴─────────────┤
│  STATUS BAR                          24px                            │  ← Z5
│  [● ws] [last log line]                      [uptime] [ver] [user]   │
└──────────────────────────────────────────────────────────────────────┘
```

## Z1 — Topbar contextual (32px, siempre visible)

**Antes:** Existe pero esta oculto en desktop (height: 0). En mobile aparece con 48px.

**Despues:** 32px siempre. Contenido de izquierda a derecha:

- **Breadcrumb** — `Pegasuz / Clients / Acme` (mono 11px, text-muted, el ultimo segment en text-primary)
- **Context pill** (cuando aplica) — `[TENANT: acme]` o `[ENV: production]` en pill style accent
- **Spacer** — flex-grow
- **Quick search** — icono de lupa + placeholder "Ctrl+K" (abre command palette)
- **Notification dot** — 6px dot que se ilumina cuando hay alert nuevo
- **User menu** — iniciales en square 22px + dropdown

**Rules:**
- Height exacto: 32px (no 28, no 48 — 32)
- Border-bottom: 1px solid var(--line)
- Background: var(--bg-raised)
- Ningun item del topbar es decorativo. Cada uno responde una pregunta: donde estoy, en que contexto, como busco, que hay nuevo, quien soy.

## Z2 — Sidebar intencional (220px, agrupado por proposito)

**Antes:** 9 items flat. Todos con igual peso. Usuario lee cada uno.

**Despues:** Mismo ancho (220px), pero **agrupado por intencion**:

```
┌───────────────────────────┐
│ PEGASUZ           v8      │  ← brand block (48px)
├───────────────────────────┤
│                           │
│ OPERATIONS ─────          │  ← section label (mono 8px uppercase)
│   Dashboard               │
│   Clients                 │
│   CMS Contracts           │
│                           │
│ OBSERVABILITY ─────       │
│   Brain                   │
│   System                  │
│   Logs                    │
│   GPU                     │
│                           │
│ CONFIGURATION ─────       │
│   Environment             │
│                           │
├───────────────────────────┤
│                           │
│ [● system active]         │  ← pulse dot (footer)
│                           │
└───────────────────────────┘
```

**Rules:**
- 3 grupos semanticos: **Operations** (dia a dia), **Observability** (diagnostico), **Configuration** (admin)
- Section labels: mono 8px uppercase 0.16em tracking, text-dim
- Items: body 13px, padding 10px 20px, border-left 2px transparent → accent on active
- Hover: background surface + padding-left 24px (micro-shift de 4px)
- Active: background accent-ember + border-left accent + text-primary
- Transition: 150ms cubic-bezier(0.16, 1, 0.3, 1)
- NO icons. Solo texto. Los iconos en paneles densos son ruido — "Dashboard" lee mas rapido que un icono generico de grafico.

## Z3 — Main canvas (grid-driven, edge-to-edge)

**Antes:** `.main-content { padding: 24px 32px }`. Fixed padding, sin max-width, sin estructura.

**Despues:** El canvas es edge-to-edge contra el sidebar y el inspector. **Cero padding en el canvas**. El padding vive dentro de las `cells` del grid (siguiendo el gap-as-separator pattern).

```css
.canvas {
  grid-area: canvas;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--line);  /* el fondo del canvas ES la linea separadora */
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
}
.canvas > * { background: var(--bg); }
```

Cada view se monta dentro del canvas. La view decide su propia estructura de rows, pero **siempre** usando las primitivas del grid system (ver Parte 3).

**Max-width:** El canvas NO tiene max-width. En widescreen se expande. Pero el contenido interno respeta el grid system — si una row pide `--3`, se divide en 3 exactas, no en "3 mas espacio muerto".

**Scroll:** El canvas scrollea internamente. El shell no scrollea. Esto es critico porque el status bar y el topbar permanecen fijos.

## Z4 — Inspector pane (360px, togglable, right-side)

**Esto es nuevo.** No existe en el panel actual.

**Proposito:** Mostrar detalle de algo seleccionado sin abrir modal ni navegar fuera. Reemplaza TODOS los modales actuales de ClientsView y ademas se usa en BrainView/SystemPanelView/LocalCommandView para drill-down.

**Diagrama:**

```
┌─────────────────────┐
│ INSPECTOR    [esc]  │  ← header (32px, title + close)
├─────────────────────┤
│                     │
│ [overview]          │  ← tab bar (28px, mono 10px)
│ [tabs vary by       │
│  subject]           │
├─────────────────────┤
│                     │
│  content of         │
│  selected tab       │
│  (scrollable)       │
│                     │
└─────────────────────┘
```

**Specs:**
- Width: 360px exacto (no 320, no 400 — 360)
- Background: var(--bg)
- Border-left: 1px solid var(--line)
- Header: 32px con titulo + boton X + subtitle opcional
- Tab bar: 28px con tabs mono, underline en active
- Content: padding var(--cell-pad), scrollable independiente
- Toggle: `Ctrl+I` o boton en topbar, anima con transform translateX (no width — performance)
- Cuando no hay seleccion: placeholder "Select an item to inspect"

**Casos de uso:**
- ClientsView: click en tenant → Inspector con tabs `Overview | Features | Users | CMS | Logs | Audit`
- SystemPanelView: click en section → Inspector con detalles de esa seccion
- BrainView: click en alert → Inspector con context del alert + links a decisiones/logs relacionados
- LocalCommandView: click en modelo → Inspector con telemetry + error signatures
- LogsView: click en log line → Inspector con stack trace + tenant context + request id

**Global state:** Un store nuevo `useInspectorStore.js` con `{ open, subject, subjectType, tabs, activeTab }`. Cada view dispatcha al inspector desde sus click handlers.

## Z5 — Status bar (24px, siempre visible)

**Esto tambien es nuevo.**

**Proposito:** Signal permanente del estado del sistema. El usuario no deberia tener que navegar para saber si hay problemas.

**Contenido de izquierda a derecha:**

```
● ws-live │ [last log line — monospace 10px, truncado]        │ uptime 3d │ v8.1.2 │ mateo
```

- **WS status dot** — 6px: verde (conectado), amarillo (reconectando), rojo (desconectado)
- **Last log line** — la ultima linea del log global (text-muted, truncate con ellipsis). Click abre LogsView.
- **Uptime** — mono 10px text-dim
- **Version** — mono 10px text-dim (desde package.json)
- **Current user** — mono 10px text-muted

**Specs:**
- Height: 24px
- Background: var(--bg-raised)
- Border-top: 1px solid var(--line)
- Click en log line = abre LogsView
- Click en ws dot = muestra mini popover con stats de ws
- Font: mono 10px uniforme

## Shell CSS template

```css
.shell {
  display: grid;
  grid-template:
    "topbar topbar topbar" 32px
    "sidebar canvas inspector" 1fr
    "status status status" 24px
    / 220px 1fr 0px;  /* inspector starts at 0 */
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.shell--inspector-open {
  grid-template-columns: 220px 1fr 360px;
}

.shell--sidebar-collapsed {  /* narrow mode */
  grid-template-columns: 56px 1fr 0;
}

.topbar    { grid-area: topbar; }
.sidebar   { grid-area: sidebar; }
.canvas    { grid-area: canvas; }
.inspector { grid-area: inspector; }
.status    { grid-area: status; }
```

**Por que grid y no flex:** El grid me da control absoluto sobre las 5 zonas con una sola declaracion. Si cambio a flex necesitaria wrappers, y los wrappers generan padding fantasma. Grid es determinista.

**Responsive:** En `< 980px`, el grid colapsa a:
```css
@media (max-width: 980px) {
  .shell {
    grid-template:
      "topbar" 32px
      "canvas" 1fr
      "status" 24px
      / 1fr;
  }
  .sidebar { position: fixed; z-index: 100; transform: translateX(-100%); }
  .sidebar--open { transform: translateX(0); }
  .inspector { position: fixed; right: 0; z-index: 90; width: 100%; max-width: 360px; }
}
```

---

# Parte 3 — El sistema de layout — grid-first, determinista

El canvas usa UN solo sistema de layout. No hay "view que usa flex", "view que usa manual padding", "view que usa tailwind-like utils". Un sistema. Sin excepciones.

## 3.1 Tokens de layout (NUEVOS — van a `design-system.css`)

```css
:root {
  /* Layout primitives */
  --sa-sidebar-w:     220px;
  --sa-topbar-h:      32px;
  --sa-statusbar-h:   24px;
  --sa-inspector-w:   360px;

  /* Cell padding (3 modos de densidad) */
  --sa-cell-pad:      28px 32px;  /* comfortable — default */

  /* Gap — siempre 1px, el ancho del separador */
  --sa-gap:           1px;

  /* Max-width global para texto largo (markdown, descripciones) */
  --sa-prose-w:       65ch;

  /* Z-index scale — unica y documentada */
  --sa-z-canvas:      1;
  --sa-z-sticky:      10;
  --sa-z-inspector:   80;
  --sa-z-sidebar-m:   100;  /* sidebar fixed en mobile */
  --sa-z-drawer:      200;
  --sa-z-modal:       300;
  --sa-z-toast:       400;
  --sa-z-tooltip:     500;
}

[data-density="compact"]  { --sa-cell-pad: 20px 24px; }
[data-density="dense"]    { --sa-cell-pad: 14px 16px; }
```

**Regla critica:** TODA padding de cell usa `var(--sa-cell-pad)`. No existe `padding: 20px` hardcoded en ningun lado del canvas. Si una cell necesita padding diferente, es un indicio de que el layout esta mal.

## 3.2 Las primitivas — 5 componentes, no mas

Solo existen 5 primitivas de layout. Cualquier estructura de view se compone de estas 5. Ni una mas.

### Primitiva 1: `.canvas-row` (horizontal)

```css
.canvas-row {
  display: grid;
  gap: var(--sa-gap);
  background: var(--line);
  grid-auto-rows: min-content;  /* no stretch vertical */
}
.canvas-row > * { background: var(--bg); }
```

### Variantes de columna (solo estas 6)

```css
.canvas-row--1        { grid-template-columns: 1fr; }
.canvas-row--2        { grid-template-columns: 1fr 1fr; }
.canvas-row--3        { grid-template-columns: 1fr 1fr 1fr; }
.canvas-row--4        { grid-template-columns: 1fr 1fr 1fr 1fr; }
.canvas-row--aside    { grid-template-columns: 1fr 320px; }
.canvas-row--aside-l  { grid-template-columns: 320px 1fr; }
.canvas-row--golden   { grid-template-columns: 1.618fr 1fr; }
```

**Prohibido:** definir grid-template-columns ad-hoc fuera de estas variantes. Si necesitas algo distinto, agregalo al diseno, no lo hardcodees.

### Primitiva 2: `.canvas-cell`

```css
.canvas-cell {
  padding: var(--sa-cell-pad);
  min-height: 0;  /* permite overflow interno */
  display: flex;
  flex-direction: column;
}
```

**Cada elemento dentro de una row es un `.canvas-cell`.** Sin excepciones.

### Primitiva 3: `.canvas-cell-hero`

Un cell que ocupa toda la row sin gap, para heroes y full-width displays:

```css
.canvas-cell-hero {
  padding: var(--sa-cell-pad);
  padding-block: calc(var(--sa-cell-pad) * 1.5);  /* hero tiene mas aire vertical */
}
```

### Primitiva 4: `.canvas-section`

Un wrapper opcional para multiples rows consecutivas que comparten un header:

```css
.canvas-section {
  display: contents;  /* no crea box — solo agrupa semanticamente */
}
```

### Primitiva 5: `.canvas-stack`

Para cuando dentro de una cell hay varios sub-bloques que necesitan separarse:

```css
.canvas-stack {
  display: grid;
  gap: 16px;  /* micro-gap dentro de cell, no entre cells */
}
```

**Esos son los unicos 5.** Con eso se construyen las 9 views. Si se necesita algo mas, se agrega AQUI, no en los componentes.

## 3.3 El patron del grid — gap-as-separator

Este es el patron central. Robado del panel Eros pero generalizado.

```html
<main class="canvas">
  <!-- Row 1: hero -->
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell canvas-cell-hero">...</div>
  </div>

  <!-- Row 2: split 2 cols -->
  <div class="canvas-row canvas-row--2">
    <div class="canvas-cell">...</div>
    <div class="canvas-cell">...</div>
  </div>

  <!-- Row 3: 4 stats -->
  <div class="canvas-row canvas-row--4">
    <div class="canvas-cell">...</div>
    <div class="canvas-cell">...</div>
    <div class="canvas-cell">...</div>
    <div class="canvas-cell">...</div>
  </div>
</main>
```

**Como funciona la linea visual:**
- `.canvas` tiene `gap: 1px` y `background: var(--line)` (blanco al 6%)
- `.canvas-row` tiene `gap: 1px` y `background: var(--line)`
- `.canvas-cell` tiene `background: var(--bg)` (near-black)
- Resultado: las cells cubren el fondo near-black, los gaps de 1px dejan ver el background line. Se ven lineas separadoras limpias sin ningun border.

**Por que esto es mejor que border:**
- No duplicas borders entre cells adyacentes
- Los corners son perfectos sin hacks
- El pattern es auto-consistente — no hay forma de equivocarse

## 3.4 Anti-patterns explicitos del layout

**Prohibido absolutamente:**

| Anti-pattern | Por que esta mal | Que usar |
|---|---|---|
| `padding: 24px` hardcoded | Se desincroniza del sistema de densidad | `var(--sa-cell-pad)` |
| `margin: 0 auto` con `max-width` en main | Crea margenes laterales muertos | El canvas es edge-to-edge |
| `border: 1px solid var(--line)` en una cell | Duplica con el gap-separator | Dejar el gap hacer el trabajo |
| Wrapper div con padding que duplica el del cell | Crea padding compuesto invisible | Un solo nivel de padding, siempre |
| `gap: 16px` en una `.canvas-row` | Rompe el patron de 1px separator | `gap: 1px` siempre en rows |
| `grid-template-columns: repeat(auto-fill, ...)` | No es determinista — cambia segun viewport | Usar las 6 variantes definidas |
| `box-shadow` en cells | Eros no usa shadows | Dejar vacio |
| `border-radius` en cells | Eros es angular | `border-radius: 0` (ya es default en tokens) |
| Columna con un solo elemento centrado y padding de 40% | Vacio sin sentido | O va full-width o se integra con otra row |

**Cosa que SI esta permitida (excepciones documentadas):**
- `border-radius: 50%` en avatars y dots pulsantes
- Border en elementos que no son cells (pills, buttons, inputs) — pero siempre 1px
- Padding interno distinto dentro de un cell — pero con tokens micro (`gap: 16px` en `.canvas-stack`)

---

# Parte 4 — View-by-view UX reform

Aca viene lo concreto. Cada view con: pregunta del usuario, problema actual, flujo nuevo, layout map, component tree.

**Orden de impacto (de mas critica a menos):**
1. BrainView — reestructuracion total (21 secciones → 5 tabs semanticos)
2. ClientsView — split table + inspector (elimina 6 modales)
3. DashboardView — jerarquia de 1 hero + 3 context + strip
4. SystemPanelView — refinar pattern existente (HUD + drawer)
5. LocalCommandView — aplicar misma logica que Brain
6. LogsView — sticky filter bar + keyboard
7. CmsContractsView — table + inspector (minima)
8. EnvManagerView — single column clean
9. LoginView — minima intervencion

## 4.1 BrainView — la reestructuracion critica

### La pregunta del usuario

Cuando abro BrainView, ¿que pregunta vine a responder? Hay 5 posibles, y son las unicas:

1. **"¿Esta todo OK?"** — glance de 5 segundos. Quiero ver si hay alerts, si coherence esta en rango, si los agents andan.
2. **"¿Por que el brain tomo la decision X?"** — historial de decisiones con contexto.
3. **"¿Que esta aprendiendo?"** — timeline de learnings + testing.
4. **"¿Que viene en el pipeline?"** — rollouts pendientes, improvements, gaps.
5. **"¿Un agent esta mal?"** — listado de agents con trust scores, routing, office.

Y hay una sexta pregunta que NO es de uso frecuente pero existe: **"¿Que sabe el brain?"** — knowledge base, experience, governance, product, blog.

### El problema actual

21 secciones apiladas verticalmente. Todas con el mismo peso visual. Un usuario que viene con la pregunta 1 tiene que scrollear 3000px para encontrar el estado. Un usuario con la pregunta 5 tiene que abrir 5 secciones distintas porque "agents", "office", "routing", "session" estan separadas.

**Cognitivamente esto es un desastre.** El usuario no tiene mapa mental. Cada vez que abre BrainView, tiene que reaprender donde estan las cosas.

### El flujo nuevo — 5 tabs + hero permanente

BrainView se reorganiza en:

```
┌──────────────────────────────────────────────────────────┐
│ HERO BAND (siempre visible — persistent header)          │
│ ┌──────────┬────────┬────────┬────────┬────────────────┐ │
│ │COHERENCE │ HEALTH │  MODE  │ CYCLES │   ALERTS (3)   │ │
│ │   78%    │  GOOD  │  AUTO  │  4291  │ ⚠ 2 rollout    │ │
│ │  ▓▓▓░░   │        │        │        │   1 gov        │ │
│ └──────────┴────────┴────────┴────────┴────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ [PULSE] [DECISIONS] [EVOLUTION] [AGENTS] [KNOWLEDGE]     │
│   ▔▔▔▔                                                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                                                          │
│  (contenido del tab activo)                              │
│                                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### El mapeo — 21 secciones → 5 tabs

**TAB 1: PULSE** (la pregunta "¿Esta todo OK?")
- Status (grid 2x3 de metrics)
- Watchdog (grid 2x4 de resources)
- Context (2 rows key-value)
- Counters (11 counters con progress bars — el hero de este tab)

**TAB 2: DECISIONS** (la pregunta "¿Por que decidio X?")
- Decisions (timeline/narrative tabs — el hero de este tab)
- Learning (2 sub-secciones — exploration + accuracy)
- Testing (scenarios + coverage)

**TAB 3: EVOLUTION** (la pregunta "¿Que viene?")
- Rollout (queue pendiente — el hero de este tab)
- Evolution (timeline de strategic reviews)
- Self-Improvement (candidates con diagnosis)
- Gaps (analysis findings)

**TAB 4: AGENTS** (la pregunta "¿Algun agent mal?")
- Agents (tabla trust scores — el hero)
- Office (delegation + spawn stats)
- Routing (execution stats)
- Session (cycle records)
- AgentViz (viz de flow)

**TAB 5: KNOWLEDGE** (la pregunta "¿Que sabe el brain?")
- Knowledge (file index)
- Experience (patterns table)
- Product (ideas backlog)
- Blog (entries)
- Governance (decisions log)
- Intervention (commands queue)

**21 → 5. Cada tab tiene entre 3-6 subsecciones.** Dentro de cada tab, el layout se organiza con el grid system (Parte 3). **Cada tab tiene 1 seccion "hero"** (la mas importante para esa pregunta) que ocupa mas espacio visual.

### Layout dentro de cada tab — ejemplos concretos

**TAB 1: PULSE**

```html
<div class="canvas">
  <!-- Hero band (persistent across tabs) -->
  <div class="canvas-row canvas-row--1">
    <BrainHeroBand />  <!-- 5-column internal, coherence dominant -->
  </div>

  <!-- Tab bar -->
  <div class="canvas-row canvas-row--1">
    <BrainTabBar :active="'pulse'" />
  </div>

  <!-- TAB CONTENT: PULSE -->
  <!-- Row 1: Counters hero (lo que un admin mira primero aca) -->
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell canvas-cell-hero">
      <BrainCountersSection />  <!-- existing component, wrapped -->
    </div>
  </div>

  <!-- Row 2: Status + Watchdog (los 2 health checks) -->
  <div class="canvas-row canvas-row--2">
    <div class="canvas-cell"><BrainStatusSection /></div>
    <div class="canvas-cell"><BrainWatchdogSection /></div>
  </div>

  <!-- Row 3: Context (info menor, mas baja en jerarquia) -->
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell"><BrainContextSection /></div>
  </div>
</div>
```

**TAB 2: DECISIONS**

```html
<!-- Row 1: Decisions (hero — tabs timeline/narrative) -->
<div class="canvas-row canvas-row--1">
  <div class="canvas-cell canvas-cell-hero">
    <BrainDecisionsSection />
  </div>
</div>

<!-- Row 2: Learning + Testing -->
<div class="canvas-row canvas-row--2">
  <div class="canvas-cell"><BrainLearningSection /></div>
  <div class="canvas-cell"><BrainTestingSection /></div>
</div>
```

**TAB 3: EVOLUTION**

```html
<!-- Row 1: Rollout (hero) -->
<div class="canvas-row canvas-row--1">
  <div class="canvas-cell canvas-cell-hero">
    <BrainRolloutSection />
  </div>
</div>

<!-- Row 2: Evolution + Self-Improvement -->
<div class="canvas-row canvas-row--2">
  <div class="canvas-cell"><BrainEvolutionSection /></div>
  <div class="canvas-cell"><BrainSelfImprovementSection /></div>
</div>

<!-- Row 3: Gaps (full width, lista) -->
<div class="canvas-row canvas-row--1">
  <div class="canvas-cell"><BrainGapsSection /></div>
</div>
```

**TAB 4: AGENTS**

```html
<!-- Row 1: Agents table (hero) -->
<div class="canvas-row canvas-row--1">
  <div class="canvas-cell canvas-cell-hero">
    <BrainAgentsSection />
  </div>
</div>

<!-- Row 2: Office + Routing -->
<div class="canvas-row canvas-row--2">
  <div class="canvas-cell"><BrainOfficeSection /></div>
  <div class="canvas-cell"><BrainRoutingSection /></div>
</div>

<!-- Row 3: Session + AgentViz -->
<div class="canvas-row canvas-row--2">
  <div class="canvas-cell"><BrainSessionSection /></div>
  <div class="canvas-cell"><BrainAgentVizSection /></div>
</div>
```

**TAB 5: KNOWLEDGE**

```html
<!-- Row 1: Knowledge (hero — file index) -->
<div class="canvas-row canvas-row--golden">
  <div class="canvas-cell"><BrainKnowledgeSection /></div>
  <div class="canvas-cell"><BrainExperienceSection /></div>
</div>

<!-- Row 2: Product + Blog + Governance -->
<div class="canvas-row canvas-row--3">
  <div class="canvas-cell"><BrainProductSection /></div>
  <div class="canvas-cell"><BrainBlogSection /></div>
  <div class="canvas-cell"><BrainGovernanceSection /></div>
</div>

<!-- Row 3: Intervention -->
<div class="canvas-row canvas-row--1">
  <div class="canvas-cell"><BrainInterventionSection /></div>
</div>
```

### Keyboard shortcuts por tab

- `1` / `2` / `3` / `4` / `5` — saltar al tab
- `Ctrl+K` — command palette (ya existe)
- `/` — focus search (ya existe)
- `?` — shortcuts overlay (ya existe)
- `j` / `k` — next/prev section dentro del tab activo
- `Escape` — clear search / close drawers

### Lo que se preserva

- **Todos los componentes `Brain*Section.vue` existen y NO se modifican internamente.** Solo se reorganizan en una estructura nueva de tabs.
- **`useBrainStore`, `useBrainSections`, `useBrainCommandPalette`, `useBrainSearch`, `useBrainShortcuts` siguen funcionando igual.**
- **Command palette y search globales (ya funcionan en BrainView) se mantienen, pero con mejoras de scoping al tab activo.**
- **Coherence gauge, anomaly popover, alert banner — todos existentes — se elevan al hero band que vive arriba de los tabs.**

### Lo que se agrega

- `BrainTabBar.vue` — nuevo componente, renderea los 5 tabs, maneja active state, sync con router query (`?tab=pulse`)
- `BrainHeroBand.vue` — nuevo componente, toma los widgets ya existentes (coherence, health, mode, cycles, alerts) y los coloca en un grid 5-col persistente
- `useBrainTabs.js` — composable para tab state + keyboard (1-5)

### Lo que se elimina

- El mini-mode toggle (las 4 tarjetas grandes cuando miniMode=true). **Se reemplaza por el hero band**, que cumple la misma funcion permanentemente.
- El scroll continuo de 21 secciones.

---

## 4.2 ClientsView — split table + inspector

### La pregunta del usuario

1. **"¿Que tenants tengo?"** — lista scannable con estados criticos a simple vista
2. **"¿Como esta el tenant X?"** — drill-down completo sin perder el contexto de la lista
3. **"¿Puedo comparar dos tenants?"** — raro pero deseable
4. **"¿Como creo uno nuevo?"** — accion primaria

### El problema actual

- Tabla + 6 modales distintos (features, users, CMS contract, delete confirm, edit, create)
- Cada modal es un `position: fixed` que tapa la tabla
- Para ver features de Acme, tenes que abrir modal, leer, cerrar. Para despues ver users, abrir otro modal, leer, cerrar
- No podes comparar dos tenants porque solo ves uno a la vez
- El flujo es "click, modal, cerrar, click, modal, cerrar" — cansancio cognitivo

### El flujo nuevo

**Layout: `canvas-row--aside` (tabla izquierda full, inspector derecha 360px)**

Pero la tabla y el inspector viven en zonas distintas del shell — el inspector es Z4 del shell, no parte de la view. La view solo contiene la tabla + context header.

```
┌────────────────────────────────────────┬─────────────────┐
│ CONTEXT HEADER — filters + search      │                 │
│ [All] [Active] [Pro] [Free]   [+ New] │                 │
├────────────────────────────────────────┤                 │
│ TENANT NAME  │ STATUS │ PLAN │ USERS  │   INSPECTOR     │
│ ─────────────┼────────┼──────┼─────── │   (Z4)          │
│ > acme       │ active │ pro  │ 42     │                 │
│   flow       │ active │ basic│ 8      │   (empty until  │
│   basta      │ disabld│ pro  │ 15     │   row selected) │
│   northwind  │ active │ free │ 3      │                 │
│                                        │                 │
│  (resto de filas...)                  │                 │
│                                        │                 │
└────────────────────────────────────────┴─────────────────┘
```

Al hacer click en una fila:
1. Fila se marca como seleccionada (background surface + border-left accent)
2. Inspector se abre con tabs del tenant:
   - **Overview** — nombre, slug, plan, created, metrics, status
   - **Features** — matriz de features habilitados (reemplaza modal)
   - **Users** — tabla de users del tenant (reemplaza modal)
   - **CMS Contract** — contrato asignado (reemplaza modal)
   - **Audit** — ultimos 20 eventos del tenant
3. Acciones del tenant (enable/disable, delete) viven en un footer del inspector, no como botones inline en la tabla

### Los modales que se matan

- `FeaturesModal` → Inspector tab "Features"
- `UsersModal` → Inspector tab "Users"
- `CmsContractModal` → Inspector tab "CMS Contract"
- `EditTenantModal` → Inspector tab "Overview" (editable inline)
- `TenantDetailsModal` → Inspector tab "Overview"

**El unico modal que sobrevive:** `DeleteConfirmModal` (pequeno, para confirmar accion destructiva). Los confirms destructivos SI van en modal — son bloqueadores intencionales.

### Layout dentro de la view

```html
<div class="canvas">
  <!-- Context header row -->
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell">
      <ClientsContextHeader />
      <!-- title + filter pills + search + "New" button -->
    </div>
  </div>

  <!-- Table row (takes remaining height) -->
  <div class="canvas-row canvas-row--1" style="flex: 1;">
    <div class="canvas-cell" style="padding: 0;">
      <!-- table without cell padding — the table rows have their own -->
      <ClientsTable @row-click="openInspector" />
    </div>
  </div>
</div>
```

**Observacion importante:** esta es la UNA excepcion al padding rule — la tabla vive en una cell sin padding propio, porque la tabla tiene padding en sus celdas internas (`.pz-table th/td { padding: 10px 16px }`). Si ponemos cell padding sobre la tabla, duplicamos el padding horizontal.

### Behaviors nuevos

- Click en fila → `useInspectorStore.open('tenant', tenant.id)`
- `j` / `k` → next/prev row con auto-scroll
- `i` → toggle inspector
- `Enter` con fila seleccionada → focus en inspector
- `/` → focus search en context header
- `Escape` → deseleccionar fila + cerrar inspector

### Contrato del InspectorPane para tenants

```js
// useInspectorStore.js
{
  open: true,
  subject: { type: 'tenant', id: 'acme', data: {...} },
  tabs: [
    { key: 'overview',  label: 'Overview' },
    { key: 'features',  label: 'Features' },
    { key: 'users',     label: 'Users' },
    { key: 'cms',       label: 'CMS' },
    { key: 'audit',     label: 'Audit' },
  ],
  activeTab: 'overview'
}
```

Cada tab es un sub-componente en `src/components/inspector/tenant/*.vue`:
- `TenantOverviewTab.vue`
- `TenantFeaturesTab.vue` (reusa logica del FeaturesModal existente)
- `TenantUsersTab.vue` (reusa logica del UsersModal existente)
- `TenantCmsTab.vue`
- `TenantAuditTab.vue`

**Reutilizamos la logica, cambiamos el contenedor.** No reescribimos features/users/cms — solo los movemos del modal al inspector pane.

---

## 4.3 DashboardView — jerarquia radical

### La pregunta del usuario

**"¿Todo bien?"** — una sola pregunta, una sola respuesta principal.

Secundarias:
- "¿Cuantos tenants?"
- "¿Hay problemas en la ultima hora?"
- "¿Acceso rapido a acciones frecuentes"

### El problema actual

- 4 stat cards iguales (TOTAL TENANTS, ACTIVE, ERRORS, UPTIME) — nadie importa mas que otro visualmente
- 4 quick cards tambien iguales (NEW TENANT, LOGS, BRAIN, SYSTEM)
- 1 tabla "Recent Tenants" con 5 filas
- 4 items de "System Status" en flex vertical

Total: 13 elementos equiweighted. El ojo no tiene a donde ir primero. Y en widescreen (1920px+), los 4 stat cards quedan separados por espacios muertos.

### La jerarquia nueva (3 niveles)

**Nivel 1 — Hero (1 solo elemento, dominante):**
Un unico indicador de salud general. Llamemoslo el **System Pulse** — un numero grande (salud agregada 0-100) + su estado en texto + sparkline de las ultimas 24h. Ocupa toda la fila 1.

**Nivel 2 — Context (3-4 metricas secundarias):**
TENANTS | ACTIVE | ERRORS-1h | UPTIME. En una row de 4 columnas. Mas chicos que el hero (value-sm en vez de value).

**Nivel 3 — Drill-down (listas compactas):**
- Recent Activity (col izq, 1.618fr) — ultimos 10 eventos (tenant crearon, logs con error, brain decisions grandes)
- Quick Actions (col der, 1fr) — 4 botones verticales en mono uppercase (New Tenant, Open Logs, Brain Status, System Panel)

### Layout map

```html
<div class="canvas">
  <!-- Row 1: HERO — System Pulse dominante -->
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell canvas-cell-hero">
      <SystemPulseHero />
      <!-- big value: "94" + label "SYSTEM HEALTH" + sparkline 24h + pill "GOOD" -->
    </div>
  </div>

  <!-- Row 2: CONTEXT — 4 metricas secundarias -->
  <div class="canvas-row canvas-row--4">
    <div class="canvas-cell">
      <MetricCell label="TENANTS" value="42" suffix="total" />
    </div>
    <div class="canvas-cell">
      <MetricCell label="ACTIVE" value="38" suffix="/42" />
    </div>
    <div class="canvas-cell">
      <MetricCell label="ERRORS" value="3" suffix="last 1h" variant="warn" />
    </div>
    <div class="canvas-cell">
      <MetricCell label="UPTIME" value="99.8" suffix="%" />
    </div>
  </div>

  <!-- Row 3: DRILL-DOWN — activity + quick actions -->
  <div class="canvas-row canvas-row--golden">
    <div class="canvas-cell">
      <RecentActivityFeed />
      <!-- timeline vertical — 10 eventos cronologicos -->
    </div>
    <div class="canvas-cell">
      <QuickActions />
      <!-- 4 ghost buttons verticales: NEW TENANT, OPEN LOGS, BRAIN STATE, SYSTEM HEALTH -->
    </div>
  </div>
</div>
```

### Componentes nuevos

- `SystemPulseHero.vue` — el hero del dashboard. Reusa componentes existentes (gauge, sparkline) pero con proporciones nuevas
- `MetricCell.vue` — componente generico para metricas (label + value + suffix + variant)
- `RecentActivityFeed.vue` — feed unificado de eventos (tenants, logs, brain, system) cronologico

### Lo que se elimina

- Los 4 "quick cards" sueltos que no iban a ningun lado claro
- Los 4 "system status" items en flex vertical (migran al status bar global)
- La tabla "Recent Tenants" que duplicaba contenido de ClientsView (migra al Activity Feed como eventos de tenant-created)

---

## 4.4 SystemPanelView — refinar lo que funciona

Esta view **ya tiene un buen patron** (HUD grid con drawer drill-down) que es similar a donde quiero llegar. No reestructurar. Solo:

1. **Migrar al nuevo grid system** (usar `.canvas-row` + `.canvas-cell` en vez de layout custom)
2. **Usar el Inspector global** en lugar del drawer propio — el drawer actual se vuelve el Inspector pane standardizado
3. **Aplicar el hero band pattern** — 1 fila arriba con metricas agregadas del sistema, despues el HUD grid abajo
4. **Keyboard nav** — `Ctrl+I` toggles inspector, `j`/`k` navega entre cells del HUD

### Layout

```html
<div class="canvas">
  <!-- Row 1: hero band -->
  <div class="canvas-row canvas-row--4">
    <div class="canvas-cell"><MetricCell label="HOSTS" value="12" /></div>
    <div class="canvas-cell"><MetricCell label="ALERTS" value="2" variant="warn" /></div>
    <div class="canvas-cell"><MetricCell label="UPTIME" value="99.8" suffix="%" /></div>
    <div class="canvas-cell"><MetricCell label="LOAD" value="0.42" /></div>
  </div>

  <!-- Row 2-4: HUD sections (12 cards) -->
  <div class="canvas-row canvas-row--3">
    <div class="canvas-cell"><PerformanceCard /></div>
    <div class="canvas-cell"><InfrastructureCard /></div>
    <div class="canvas-cell"><SecurityCard /></div>
  </div>
  <div class="canvas-row canvas-row--3">
    <div class="canvas-cell"><DatabaseHealthCard /></div>
    <div class="canvas-cell"><StorageCard /></div>
    <div class="canvas-cell"><IncidentsCard /></div>
  </div>
  <div class="canvas-row canvas-row--3">
    <div class="canvas-cell"><EventsCard /></div>
    <div class="canvas-cell"><TenantsOverviewCard /></div>
    <div class="canvas-cell"><BackupsCard /></div>
  </div>
</div>
```

Cada card es un resumen con 2-4 metricas + un boton "Inspect" que abre el Inspector con la seccion completa.

---

## 4.5 LocalCommandView (GPU Panel) — mismo pattern que Brain

Dado que tiene 15+ subcomponentes y es analogo en complejidad a BrainView, aplica el mismo pattern de **tabs semanticos + hero band + progressive disclosure**.

**Tabs propuestos:**
1. **MODELS** — status de modelos, benchmarks, cross-eval
2. **ROUTING** — routing decisions, node status, proxy health
3. **TELEMETRY** — latency, token usage, cost tracker, GPU telemetry
4. **ERRORS** — error signatures, request log, experience timeline
5. **CONTROL** — system prompt editor, mode toggles, chat tester

**Hero band:** 4 metricas agregadas (active models, total requests/hr, avg latency, error rate)

El layout interno de cada tab sigue la misma logica — hero cell + rows subordinadas.

---

## 4.6 LogsView — sticky filter bar + keyboard

### La pregunta del usuario

**"¿Que paso [en ese tenant | con ese nivel | hace N minutos]?"**

### Problema actual

- Header con filters (tenant selector + level filter + pause/resume)
- Console body con stream — pero el header scrollea con el contenido a veces, y los shortcuts no son claros

### Layout nuevo

```html
<div class="canvas">
  <!-- Row 1: sticky filter bar -->
  <div class="canvas-row canvas-row--1" style="position: sticky; top: 0; z-index: var(--sa-z-sticky);">
    <div class="canvas-cell">
      <LogsFilterBar />
      <!-- tenant select | level pills | search input | LIVE pill | pause/resume -->
    </div>
  </div>

  <!-- Row 2: console stream (takes remaining height) -->
  <div class="canvas-row canvas-row--1" style="flex: 1; min-height: 0;">
    <div class="canvas-cell" style="padding: 0; overflow: hidden;">
      <LogsConsole />
      <!-- monospace 11px stream, auto-scroll si no paused, click line abre inspector -->
    </div>
  </div>
</div>
```

### Nuevos shortcuts

- `p` — toggle pause/resume
- `c` — clear stream
- `/` — focus search
- `1` / `2` / `3` / `4` — filter por level (error / warn / info / debug)
- `g g` — scroll top
- `G` — scroll bottom (resume follow)
- Click en log line → abre Inspector con detalles

---

## 4.7 CmsContractsView — table + inspector minimal

### Pregunta del usuario

**"¿Que contratos existen y como editarlos?"**

### Layout

Identico en espiritu a ClientsView pero mas simple:

```html
<div class="canvas">
  <!-- Row 1: context header -->
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell">
      <ContractsHeader />
      <!-- title + search + "New Contract" button -->
    </div>
  </div>

  <!-- Row 2: table -->
  <div class="canvas-row canvas-row--1" style="flex: 1;">
    <div class="canvas-cell" style="padding: 0;">
      <ContractsTable @row-click="openInspector" />
    </div>
  </div>
</div>
```

Inspector cuando se selecciona: tabs **Overview | Schema | Preview**. El JSON schema editor vive en "Schema" con syntax highlighting basico.

### Lo que se elimina

El modal full-screen actual de edicion se reemplaza por el Inspector pane.

---

## 4.8 EnvManagerView — single column clean

### Pregunta del usuario

**"¿Cuales son las URLs del frontend y como agregarlas?"**

### Layout

Single column, minimal. No necesita inspector.

```html
<div class="canvas">
  <!-- Row 1: header -->
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell">
      <h1 class="title">Frontend URLs</h1>
      <p class="body">Whitelist of allowed origins. Changes restart pegasuz-api.</p>
    </div>
  </div>

  <!-- Row 2: list editor -->
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell">
      <UrlListEditor />
      <!-- input list with add/remove, save button at bottom -->
    </div>
  </div>

  <!-- Row 3: last saved indicator -->
  <div class="canvas-row canvas-row--1">
    <div class="canvas-cell">
      <LastSavedInfo />
      <!-- "Last saved: 2026-04-09 14:23 by mateo" + next restart countdown -->
    </div>
  </div>
</div>
```

---

## 4.9 LoginView — minima intervencion

### Pregunta del usuario

**"Como entro?"**

Ya es simple y centrado. Solo ajustes:

- Reemplazar el card central por un `canvas-cell-hero` centrado
- El layout vive fuera del shell de 5 zonas — LoginView tiene su propio layout minimal (no sidebar, no topbar, no statusbar)

```html
<div class="login-shell">
  <div class="login-card">
    <!-- brand -->
    <h1>Pegasuz</h1>
    <p>SuperAdmin</p>

    <!-- form -->
    <form>
      <Input label="EMAIL" />
      <Input label="PASSWORD" />
      <Button>SIGN IN</Button>
    </form>

    <!-- 2FA form (conditional) -->
  </div>
</div>
```

Login es un caso aparte del sistema de grid — un centro absoluto en viewport. No tiene 5 zonas, no tiene canvas. Solo la card.

---

# Parte 5 — Componentes UX nuevos (inventario completo)

## 5.1 Shell-level (globales, viven en `src/components/layout/`)

| Componente | Proposito | Props principales |
|---|---|---|
| `AppShell.vue` | El shell de 5 zonas. Reemplaza el layout de `App.vue` | `inspectorOpen`, `sidebarCollapsed` |
| `TopBar.vue` | Z1 — breadcrumb + context + search + user | `breadcrumb`, `contextPill`, `notificationCount` |
| `SideBar.vue` | Z2 — nav agrupado + brand + footer | `groups`, `activeRoute` |
| `StatusBar.vue` | Z5 — ws + last log + version | (reads from stores) |
| `InspectorPane.vue` | Z4 — detail drawer global | (reads from useInspectorStore) |
| `CommandPalette.vue` | Global Ctrl+K palette | `commands` |
| `ShortcutsOverlay.vue` | Modal con lista de shortcuts (`?` key) | (reads from composable) |

## 5.2 Primitivas de layout (viven en `src/components/layout/primitives/`)

| Componente | Proposito |
|---|---|
| `CanvasRow.vue` | Wrapper para `.canvas-row` con prop `variant` (1/2/3/4/aside/aside-l/golden) |
| `CanvasCell.vue` | Wrapper para `.canvas-cell` con prop `hero` (bool) y `padding` (bool) |
| `MetricCell.vue` | Cell standard con label + value + suffix + variant (default/warn/error/success) |
| `ContextHeader.vue` | Header row standard con title + subtitle + actions slot |
| `SectionCard.vue` | Card para dentro de una cell cuando hay sub-blocks |
| `TabBar.vue` | Tab bar generico usado por BrainView, LocalCommandView, y dentro del InspectorPane |

## 5.3 Inspector tabs especificos (en `src/components/inspector/`)

Agrupados por subject type:

**`src/components/inspector/tenant/`** (para tenants)
- `TenantOverviewTab.vue`
- `TenantFeaturesTab.vue`
- `TenantUsersTab.vue`
- `TenantCmsTab.vue`
- `TenantAuditTab.vue`

**`src/components/inspector/brain/`** (para brain alerts/sections)
- `BrainAlertTab.vue`
- `BrainSectionDetailTab.vue`

**`src/components/inspector/system/`** (para system sections — reemplaza el drawer actual)
- `SystemSectionTab.vue` (generico)

**`src/components/inspector/contract/`** (para CMS contracts)
- `ContractOverviewTab.vue`
- `ContractSchemaTab.vue`
- `ContractPreviewTab.vue`

**`src/components/inspector/log/`** (para log line drill-down)
- `LogDetailTab.vue`

## 5.4 Composables nuevos (en `src/composables/ui/`)

| Composable | Proposito |
|---|---|
| `useInspector.js` | Global inspector state (open, subject, tabs, activeTab). Store-backed. |
| `useCommandPalette.js` | Global command palette state + register/unregister commands per view |
| `useKeyboard.js` | Keyboard shortcut registry with scopes (global, view, focused) |
| `useDensity.js` | Density mode (comfortable/compact/dense) with localStorage persistence |
| `useShell.js` | Shell state (sidebar collapsed, inspector open) |
| `useBreadcrumb.js` | Breadcrumb derived from route + view-provided context |

## 5.5 Store nuevo

**`src/stores/ui.js`** — unico store nuevo, maneja:
- `inspectorOpen`, `inspectorSubject`, `inspectorTabs`, `inspectorActiveTab`
- `sidebarCollapsed`
- `density`
- `commandPaletteOpen`
- `lastLogLine` (for status bar)

Se sincroniza con localStorage para persistir preferencias entre sesiones.

---

# Parte 6 — Keyboard navigation system

El panel es power-user. La navegacion por teclado no es un extra — es el camino principal. El mouse queda para cosas que el teclado no alcanza (drag, hover inspection).

## Shortcuts globales (funcionan en cualquier view)

| Tecla | Accion |
|---|---|
| `Ctrl+K` | Open command palette |
| `Ctrl+B` | Toggle sidebar collapse |
| `Ctrl+I` | Toggle inspector |
| `Ctrl+.` | Cycle density (comfortable → compact → dense → comfortable) |
| `Ctrl+/` | Show shortcuts overlay |
| `Esc` | Close current overlay (palette / inspector / modal / overlay) |
| `/` | Focus search (context-dependent) |
| `?` | Show shortcuts overlay (same as Ctrl+/) |

## Jumps (vim-style `g` prefix)

| Tecla | Accion |
|---|---|
| `g d` | Go to Dashboard |
| `g c` | Go to Clients |
| `g l` | Go to Logs |
| `g b` | Go to Brain |
| `g s` | Go to System |
| `g m` | Go to CMS contracts |
| `g p` | Go to GPU panel |
| `g e` | Go to Environment |

## Navigation within lists/tables

| Tecla | Accion |
|---|---|
| `j` | Next row/item |
| `k` | Previous row/item |
| `Enter` | Open/drill into selected |
| `x` | Toggle select |

## Tab switching (when view has tabs)

| Tecla | Accion |
|---|---|
| `1` – `9` | Switch to tab N |
| `Tab` | Next tab |
| `Shift+Tab` | Previous tab |

## Overlay del cheatsheet

`?` o `Ctrl+/` abre un overlay con la lista completa de shortcuts. Agrupado por scope (Global / Navigation / Lists / Tabs). Se cierra con `Esc`.

---

# Parte 7 — Densidad y responsive

## 7.1 Tres modos de densidad

Controlados por `data-density` en el root + localStorage:

### Comfortable (default desktop)

```css
[data-density="comfortable"] {
  --sa-cell-pad: 28px 32px;
  --sa-body-size: 13px;
  --sa-label-size: 10px;
}
```

### Compact (power user)

```css
[data-density="compact"] {
  --sa-cell-pad: 20px 24px;
  --sa-body-size: 12px;
  --sa-label-size: 9px;
}
```

### Dense (monitor wall)

```css
[data-density="dense"] {
  --sa-cell-pad: 14px 16px;
  --sa-body-size: 11px;
  --sa-label-size: 8px;
}
```

Cycle: `Ctrl+.`. Persiste en localStorage.

## 7.2 Breakpoints

| Breakpoint | Comportamiento |
|---|---|
| `>= 1440px` | Layout completo 5 zonas. Inspector 360px. Sidebar 220px. Comfortable densidad default. |
| `>= 1280px` | Layout 5 zonas. Inspector 320px (reducido). Resto igual. |
| `>= 1024px` | Sidebar colapsable a 56px con solo iconos-texto. Inspector maxi 360. Compact density auto-suggested. |
| `>= 768px` | Sidebar fixed offscreen, topbar con burger. Inspector fullscreen overlay cuando se abre. Canvas 100% width. |
| `< 768px` | Mobile: sidebar como overlay, inspector como overlay, statusbar reducido a solo ws-dot + version. Dense density auto. Brain tabs se vuelven dropdown. |

## 7.3 Que colapsa donde

- **Grid rows:**
  - `canvas-row--4` → `canvas-row--2` en `< 1200px` → `canvas-row--1` en `< 768px`
  - `canvas-row--3` → `canvas-row--1` en `< 980px`
  - `canvas-row--2` → `canvas-row--1` en `< 768px`
  - `canvas-row--golden` → stack en `< 980px`
  - `canvas-row--aside` → stack en `< 980px`
- **Inspector:** en mobile se vuelve modal fullscreen con gesture para cerrar
- **Sidebar:** en mobile es drawer overlay con backdrop

---

# Parte 8 — Reglas de consistencia no-negociables

Estas son LAW. Cualquier PR que las rompe se rechaza.

## RULE 1 — Un solo token de padding por cell

`var(--sa-cell-pad)`. Nada de `padding: 24px`. Nada de `padding-top: 40px`. Si una cell necesita aire adicional, se envuelve en otra cell o se usa `canvas-cell-hero`.

## RULE 2 — Separadores solo con gap

Ningun `border` entre cells. El `gap: 1px` del parent es el separador. Excepcion: border en pills, buttons, inputs, y el border-left activo del sidebar.

## RULE 3 — Jerarquia tipografica unica

Solo estas clases existen. No inventar nuevas.

| Clase | Uso |
|---|---|
| `.value` | Hero numbers (clamp 40-64px) |
| `.value-sm` | Secondary numbers (clamp 32-52px) |
| `.title` | Section titles (clamp 24-36px) |
| `.title-sm` | Sub-titles (16px) |
| `.body` | Running text (13px) |
| `.body-sm` | Secondary text (11px) |
| `.label` | Uppercase metadata mono 10px |
| `.pill` | Uppercase pills mono 9px |
| `.sb-section` | Sidebar section labels mono 8px |

## RULE 4 — Estado interactivo unico

Todos los elementos interactivos usan estos 4 estados:
- **default:** text-muted, border-line (si aplica), no background
- **hover:** text-primary, bg surface, border-line-strong (si aplica)
- **active:** text-accent, bg accent-ember, border-accent
- **disabled:** opacity 0.5, cursor default

No inventar nuevos estados. No usar colores distintos.

## RULE 5 — Empty states tienen formato fijo

Cada lista/tabla/grid que puede estar vacia muestra el mismo componente: `<EmptyState icon? title subtitle action? />`. Nunca texto suelto.

## RULE 6 — Loading states tienen formato fijo

Skeleton loaders con el mismo estilo. Nunca spinners en el medio de la pantalla. Nunca "Loading..." como texto.

## RULE 7 — Error states son inline

Errores de form: label roja debajo del input. Errores de fetch: banner en la top de la row con retry button. Errores fatales: Inspector muestra stack con action "report".

Nunca overlay rojo full-screen. Nunca modal de error.

## RULE 8 — Cada view tiene un ContextHeader

Cada view empieza con una row que contiene un `<ContextHeader>`. Ese header tiene titulo, subtitulo opcional, y slot de actions. No se permite empezar una view sin contexto.

## RULE 9 — Secciones agrupadas tienen mismo ritmo

Si una row tiene N cells, todas las cells son visualmente "del mismo tipo". No mezclar "metric" con "table" en la misma row.

## RULE 10 — Z-index solo de la scale

Solo usar `var(--sa-z-*)`. Nada de `z-index: 100` hardcoded.

---

# Parte 9 — Orden de ejecucion (15 fases atomicas)

Cada fase es **atomica y verificable**. No se avanza sin completar la anterior.

## Fase 0 — Preparacion

- [ ] Commit limpio del estado actual: `chore: pre-ux-reform snapshot`
- [ ] Screenshots de TODAS las views actuales → `docs/ux-reform/before/`
  - `/dashboard`, `/clients`, `/clients/new`, `/cms-contracts`, `/superadmin/logs`, `/system`, `/system/brain`, `/system/env`, `/system/local-command`, `/login`
- [ ] Correr `npm run dev` — verificar que arranca sin warnings
- [ ] Branch: `ux/superadmin-reform`

## Fase 1 — Design tokens de layout (pre-requisito de todo)

**Archivo:** `src/assets/design-system.css`

- [ ] Agregar bloque nuevo `/* LAYOUT SYSTEM */` con los tokens `--sa-*` de Parte 3.1
- [ ] Agregar variantes `[data-density="compact"]` y `[data-density="dense"]`
- [ ] NO tocar los tokens `--pz-*` existentes (eso es scope del reskin-plan)
- [ ] Verificar que `dev` sigue andando (debe porque solo sumamos tokens)

**Check:** Inspeccionar en devtools que los tokens aparecen en `:root`.

## Fase 2 — Primitivas de layout

**Archivos nuevos:**
- `src/components/layout/primitives/CanvasRow.vue`
- `src/components/layout/primitives/CanvasCell.vue`
- `src/components/layout/primitives/MetricCell.vue`
- `src/components/layout/primitives/ContextHeader.vue`
- `src/components/layout/primitives/TabBar.vue`

**CSS:**
- Agregar clases `.canvas`, `.canvas-row`, `.canvas-row--*`, `.canvas-cell`, `.canvas-cell-hero`, `.canvas-stack` al `design-system.css`

**Check:** Renderizar un playground en `/dev/layout-test` (temporal) que muestre todas las variantes de row.

## Fase 3 — Shell de 5 zonas (replace de `App.vue`)

**Archivo:** `src/App.vue` + nuevos componentes `src/components/layout/AppShell.vue`, `TopBar.vue`, `SideBar.vue`, `StatusBar.vue`

- [ ] Crear `AppShell.vue` con el grid-template de Parte 2
- [ ] Crear `TopBar.vue` — breadcrumb derivado del router + context slot + search button + user menu
- [ ] Crear `SideBar.vue` — agrupado por intencion (Operations / Observability / Configuration)
- [ ] Crear `StatusBar.vue` — WS dot + last log line + uptime + version + user
- [ ] Refactor `App.vue` para usar `<AppShell>` como root
- [ ] NO tocar los RouterView, NO tocar stores, NO tocar router

**Check crucial:**
- Navegacion entre todas las views sigue funcionando
- Login/logout funciona
- WebSocket sigue conectando
- Sidebar collapse con `Ctrl+B` funciona
- Status bar muestra el ultimo log en tiempo real

## Fase 4 — Inspector pane global

**Archivos nuevos:**
- `src/components/layout/InspectorPane.vue`
- `src/stores/ui.js` (el store nuevo)
- `src/composables/ui/useInspector.js`

- [ ] InspectorPane se mounta en AppShell como Z4
- [ ] Esta cerrado por default (width 0)
- [ ] `Ctrl+I` toggle
- [ ] Recibe subject del store, renderiza `<component :is="tabComponent" />` basado en `subjectType`
- [ ] Tabs bar generico con `<TabBar>`

**Check:** Desde devtools, disparar manualmente `useInspectorStore.open({type: 'test', ...})` y verificar que abre con width 360px y cierra con Esc.

## Fase 5 — Command palette + keyboard system

**Archivos nuevos:**
- `src/components/layout/CommandPalette.vue`
- `src/components/layout/ShortcutsOverlay.vue`
- `src/composables/ui/useCommandPalette.js`
- `src/composables/ui/useKeyboard.js`

- [ ] `Ctrl+K` abre palette
- [ ] Palette tiene search + lista de commands + keyboard nav
- [ ] Commands registrados: navigate (g d/c/l/b/s/...), toggle (inspector, sidebar, density), shortcuts
- [ ] `?` abre shortcuts overlay
- [ ] `Esc` cierra overlays

**Check:** `Ctrl+K` abre, escribir "dashboard", Enter, navega. Check all g-jumps.

## Fase 6 — DashboardView rediseno

**Archivo:** `src/views/DashboardView.vue`

- [ ] Reescribir template con `<CanvasRow variant="1">`, `<CanvasRow variant="4">`, `<CanvasRow variant="golden">`
- [ ] Crear `SystemPulseHero.vue`, `RecentActivityFeed.vue`, `QuickActions.vue` (o reusar existentes adaptados)
- [ ] Eliminar la vieja "Recent Tenants" tabla (ya vive en ClientsView)
- [ ] Eliminar los 4 stat cards iguales — reemplazar por Hero + 4 MetricCells
- [ ] NO tocar logica de fetch ni stores

**Check:** Screenshot vs antes. Hay UN solo elemento dominante. Los 4 metric cells ocupan la misma row sin espacio vacio. Activity feed scrollea interno.

## Fase 7 — ClientsView split + inspector integration

**Archivos:**
- `src/views/ClientsView.vue` (refactor)
- `src/components/inspector/tenant/*.vue` (nuevos — 5 tabs)
- `src/components/ClientsContextHeader.vue` (nuevo)

- [ ] Reescribir ClientsView como canvas con 2 rows (header + table)
- [ ] Tabla dispara `inspectorStore.open('tenant', row)` on row click
- [ ] Crear los 5 tabs del tenant inspector reusando la logica de los modales existentes
- [ ] **Los modales existentes quedan como codigo muerto por ahora** — no los borramos aun, para poder revertir si algo rompe. Se borran en Fase 14.
- [ ] Agregar keyboard: `j`/`k` navega rows, `Enter` abre inspector, `i` toggle inspector, `/` focus search

**Check critico:**
- Click en tenant abre inspector a la derecha
- Tab "Features" muestra los mismos datos que el modal actual
- Tab "Users" muestra los mismos datos
- Tab "CMS" muestra los mismos datos
- Delete sigue siendo modal (no se cambio)
- Keyboard nav funciona

## Fase 8 — LogsView sticky filter + keyboard

**Archivo:** `src/views/LogsView.vue`

- [ ] Reescribir con canvas + 2 rows (filter bar sticky + console)
- [ ] Filter bar sticky a top 0 con z-index `var(--sa-z-sticky)`
- [ ] Console body con height flex y scroll interno
- [ ] Click en log line → inspector con LogDetailTab
- [ ] Shortcuts: `p` pause, `c` clear, `/` search, `1`-`4` level filter, `G` scroll bottom

**Check:** WebSocket stream sigue llegando. Sticky bar NO scrollea con el log. Keyboard shortcuts funcionan.

## Fase 9 — SystemPanelView refine

**Archivo:** `src/views/SystemPanelView.vue`

- [ ] Migrar el HUD grid actual al sistema de canvas rows
- [ ] Agregar hero band arriba con 4 metricas agregadas
- [ ] Reemplazar el drawer actual por el Inspector global (mover los SystemSection tabs a `src/components/inspector/system/`)
- [ ] Keyboard: click en card abre inspector con el SystemSection

**Check:** Todas las 12 sections se ven en HUD. Click en card abre inspector. Drawer viejo ya no existe.

## Fase 10 — BrainView reestructuracion total (LA FASE CRITICA)

**Archivo:** `src/views/BrainView.vue`

Esta es la fase de mas riesgo. Hacerla al final cuando el sistema ya esta probado en las otras views.

- [ ] Crear `BrainHeroBand.vue` — los widgets de coherence + health + mode + cycles + alerts en 1 row persistente
- [ ] Crear `BrainTabBar.vue` — 5 tabs, sync con router query `?tab=pulse|decisions|evolution|agents|knowledge`
- [ ] Crear `useBrainTabs.js` — composable con keyboard 1-5
- [ ] Reestructurar el template en tabs:
  - Tab PULSE: Counters hero + (Status, Watchdog) + Context
  - Tab DECISIONS: Decisions hero + (Learning, Testing)
  - Tab EVOLUTION: Rollout hero + (Evolution, Self-Improvement) + Gaps
  - Tab AGENTS: Agents hero + (Office, Routing) + (Session, AgentViz)
  - Tab KNOWLEDGE: (Knowledge, Experience) + (Product, Blog, Governance) + Intervention
- [ ] Los componentes `Brain*Section.vue` existentes se reusan tal cual, solo cambia el parent
- [ ] El command palette existente (Ctrl+K) se eleva a global (Fase 5)
- [ ] El search existente (/) queda scope al tab activo
- [ ] Eliminar el mini-mode toggle (reemplazado por hero band permanente)
- [ ] Keyboard: 1-5 tabs, j/k sections within tab

**Check critico:**
- Todos los 21 Brain sections siguen renderizando datos
- WebSocket real-time sigue funcionando
- Coherence score actualiza en hero band
- Anomaly popover sigue apareciendo
- Alert banner se eleva a hero band
- Command palette sigue funcionando
- Scroll: el canvas scrollea, pero el hero band + tab bar quedan sticky arriba

## Fase 11 — LocalCommandView (mismo pattern que Brain)

**Archivo:** `src/views/LocalCommandView.vue`

- [ ] Crear tabs: MODELS / ROUTING / TELEMETRY / ERRORS / CONTROL
- [ ] Hero band: active models + requests/hr + avg latency + error rate
- [ ] Distribuir los 15+ subcomponentes entre los 5 tabs
- [ ] Keyboard 1-5

**Check:** Todos los subcomponentes renderizan. GPU telemetry sigue actualizando.

## Fase 12 — CmsContractsView + EnvManagerView + LoginView

**Archivos:** `src/views/CmsContractsView.vue`, `src/views/EnvManagerView.vue`, `src/views/LoginView.vue`

- [ ] CmsContracts: table + inspector con tabs Overview/Schema/Preview
- [ ] EnvManager: single column con header + list editor + last saved
- [ ] Login: centered card, sin shell (su propio layout minimal)

**Check:** CRUD de contratos funciona. Save de env vars funciona. Login-logout flow funciona.

## Fase 13 — Responsive audit

- [ ] Probar todas las views en: 375px, 768px, 1024px, 1280px, 1440px, 1920px, 2560px
- [ ] Verificar breakpoints definidos en Parte 7.2
- [ ] Ajustar media queries donde haga falta
- [ ] Probar densidad cycle (`Ctrl+.`) en todas las views

**Check:** No hay horizontal scroll en ninguna view en ningun breakpoint. No hay contenido que se rompa. Inspector se comporta como overlay en mobile.

## Fase 14 — Cleanup de codigo muerto

- [ ] Eliminar los viejos modales de ClientsView (FeaturesModal, UsersModal, CmsContractModal, EditTenantModal, TenantDetailsModal)
- [ ] Eliminar el viejo drawer de SystemPanelView
- [ ] Eliminar el mini-mode toggle de BrainView
- [ ] Eliminar cualquier util, composable, o store que haya quedado huerfano
- [ ] Grep por `padding:` hardcoded en archivos `.vue` — convertir a tokens
- [ ] Grep por `border-radius:` hardcoded — convertir a 0

**Check:** `npm run build` sin warnings. No hay imports rotos.

## Fase 15 — Verification gates

Ver Parte 10.

---

# Parte 10 — Verification gates (como probamos que funciono)

## 10.1 Cognitive walkthrough por tarea

Para cada una de estas tareas, un usuario deberia poder ejecutarla sin pensar:

| Tarea | Pasos esperados | Tiempo objetivo |
|---|---|---|
| "Ver salud del sistema" | Abrir Dashboard → hero pulse visible | < 3s |
| "Editar features de tenant Acme" | `Ctrl+K` → "acme" → Enter → Features tab | < 5s |
| "Ver por que brain decidio X" | `g b` → tab Decisions → scroll | < 5s |
| "Filtrar logs de tenant Acme errors" | `g l` → tenant filter → level error | < 5s |
| "Cambiar densidad" | `Ctrl+.` | < 1s |
| "Ver todos los agents misbehaving" | `g b` → tab Agents → hero table | < 4s |

Si alguna tarea tarda mas, el diseno fallo ahi y hay que iterar.

## 10.2 Visual diff por view

Screenshots de antes y despues en desktop (1440px) + tablet (1024px) + mobile (768px). Revision visual manual.

## 10.3 Consistency lint

Script en `scripts/lint-ux.mjs` que escanee:

- [ ] Ningun `.vue` usa `padding:` hardcoded en rem/px que no sea un token
- [ ] Ningun `.vue` usa `border-radius: N` (excepto 50% o 0)
- [ ] Ningun `.vue` usa `z-index: N` directo (debe ser var token)
- [ ] Ningun `.vue` usa `box-shadow:` visible
- [ ] Ningun `.vue` importa FeaturesModal/UsersModal/etc (los eliminados)
- [ ] Todos los views empiezan con `<ContextHeader>` (check regex)

Falla el script → bloquea el merge.

## 10.4 Empty space audit

Manual. Abrir cada view en desktop (1920px) y verificar:
- [ ] Cada cell esta llena o tiene un empty state claro
- [ ] No hay zonas > 100px vacias sin proposito
- [ ] Los grids estan balanceados (si hay 4 cells, las 4 tienen contenido similar en altura)
- [ ] El inspector pane, cuando esta abierto, no deja un hueco en el canvas (el canvas se ajusta)

## 10.5 Keyboard navigation test

- [ ] Probar los shortcuts globales en TODAS las views
- [ ] Probar `g` jumps desde cada view a las otras
- [ ] Probar tabs shortcuts en BrainView, LocalCommandView
- [ ] Probar `j/k` en listas/tablas
- [ ] Probar que `Esc` cierra todo overlay abierto

## 10.6 Functional regression

- [ ] Login/logout funciona
- [ ] Navegacion a TODAS las routes
- [ ] WebSocket sigue conectando (Brain, Logs, System)
- [ ] CRUD de tenants funciona
- [ ] CRUD de CMS contracts funciona
- [ ] Env manager save + restart funciona
- [ ] Real-time updates visibles (Brain coherence, Logs stream)

Si algo de esto falla, la fase se revierte.

---

# Parte 11 — Anti-patterns explicitos (PROHIBIDO)

Lista de cosas que durante la ejecucion NO se hacen, bajo ninguna circunstancia:

## Layout

- ❌ Agregar padding al `.main-content` wrapper (el padding vive en cells)
- ❌ Usar `max-width` en cells o rows (el ancho lo dicta el grid)
- ❌ Usar `margin` entre cells (separacion = gap)
- ❌ Usar grid-template-columns ad-hoc (solo las variantes definidas)
- ❌ Poner border en una cell (separacion = gap)

## UX

- ❌ Reemplazar un modal por otro modal (los modales se eliminan, no se sustituyen)
- ❌ Duplicar acciones en multiples lugares (una sola ruta por accion)
- ❌ Mostrar el mismo dato en dos views distintas (DRY tambien aplica a UI)
- ❌ Agregar tooltip para explicar un label (si necesita tooltip, el label esta mal)
- ❌ Usar iconos decorativos sin significado
- ❌ Mezclar idiomas (español/ingles) en la misma view

## Interaccion

- ❌ Hover-only interactions (debe haber focus-visible equivalente)
- ❌ Overlay bloqueante para errores (todo error es inline o banner)
- ❌ Spinners en medio de la pantalla (skeleton loaders)
- ❌ Animaciones > 300ms (estamos en un panel, no en una landing)
- ❌ Transitions lentas (max 150ms)

## Codigo

- ❌ Modificar stores o services durante este reform
- ❌ Agregar dependencias nuevas sin justificacion (palette, inspector, etc se hacen con Vue puro)
- ❌ Tocar el router logic (solo lazy imports)
- ❌ Mocks o placeholders — todo debe tener data real

---

# Parte 12 — Apendices

## A. Matrix de impacto por archivo

| Archivo | Tipo de cambio | Riesgo | Fase |
|---|---|---|---|
| `src/assets/design-system.css` | Agregar tokens + primitivas | Bajo | 1 |
| `src/App.vue` | Refactor wrapper por AppShell | Medio | 3 |
| `src/components/layout/*.vue` (nuevos) | Crear | Bajo | 3-5 |
| `src/components/layout/primitives/*.vue` | Crear | Bajo | 2 |
| `src/components/inspector/**/*.vue` | Crear | Medio | 7-12 |
| `src/stores/ui.js` | Crear | Bajo | 4 |
| `src/composables/ui/*.js` | Crear | Bajo | 4-5 |
| `src/views/DashboardView.vue` | Refactor template | Bajo | 6 |
| `src/views/ClientsView.vue` | Refactor template + inspector wiring | Alto | 7 |
| `src/views/LogsView.vue` | Refactor template + sticky | Medio | 8 |
| `src/views/SystemPanelView.vue` | Refactor template | Medio | 9 |
| `src/views/BrainView.vue` | **Reestructuracion total** | **Alto** | 10 |
| `src/views/LocalCommandView.vue` | Refactor con tabs | Alto | 11 |
| `src/views/CmsContractsView.vue` | Refactor + inspector | Bajo | 12 |
| `src/views/EnvManagerView.vue` | Refactor | Bajo | 12 |
| `src/views/LoginView.vue` | Refactor minimal | Bajo | 12 |
| `src/components/brain/*` (21 files) | **NO se modifican** | - | - |
| `src/components/ClientTable.vue`, `CreateClientForm.vue`, etc | Adaptar props (sin cambiar logica) | Bajo | 7 |
| `src/components/FeaturesModal.vue`, etc | **Eliminar en Fase 14** | - | 14 |
| `src/stores/*.js` (existentes) | **NO se modifican** | - | - |
| `src/services/*.js` | **NO se modifican** | - | - |
| `src/router/index.js` | **NO se modifica** | - | - |

## B. Risk matrix

| Riesgo | Impacto | Probabilidad | Mitigacion |
|---|---|---|---|
| BrainView rompe con WebSocket real-time | Alto | Medio | Fase 10 al final, tests de WS antes y despues. Componentes Brain*Section no se tocan internamente. |
| Inspector store causa re-renders excesivos | Medio | Bajo | Store con shallow refs, subject solo cambia en click events. |
| Keyboard shortcuts se solapan con browser shortcuts | Bajo | Medio | Usar Ctrl+ combos no-reservados. Testear Firefox + Chrome + Safari. |
| Responsive mobile no cubre todos los viewport | Medio | Medio | Fase 13 con probes de 375/768/1024. |
| Drawer existente en SystemPanel tiene logica custom que no migra limpio al Inspector global | Medio | Alto | Refactor gradual: primero tab-wise, despues consolidation. |
| Los 21 Brain*Section components asumen que estan dentro de BrainSectionWrap con collapse logic | Alto | Alto | Mantener BrainSectionWrap como parent de cada Brain*Section, solo cambiar el layout parent. |
| Cambio de padding tokens rompe layouts existentes | Medio | Bajo | Solo se agregan tokens nuevos, los `--pz-*` quedan intactos. |

## C. Las 10 decisiones duras (y mi respuesta como Eros)

**1. ¿Max-width global o canvas unlimited?**
→ Unlimited. En widescreen el usuario quiere usar su monitor. El grid lleno gracias a las variantes justas evita el vacio.

**2. ¿Modales para edit o inspector pane?**
→ Inspector. Los modales rompen el flujo y no permiten comparar. Solo destructivos quedan modal.

**3. ¿21 brain sections en stack, tabs, o grid masonry?**
→ Tabs semanticos (5) con sub-layouts por tab. Masonry es gimmick; stack es abuso; tabs es el intent real del usuario.

**4. ¿Topbar en desktop visible o oculto?**
→ Visible, 32px, con breadcrumb. El contexto persistente es critico.

**5. ¿Sidebar flat o agrupado?**
→ Agrupado (Operations / Observability / Configuration). Los grupos reducen carga cognitiva.

**6. ¿Command palette solo en Brain o global?**
→ Global. Es el backbone del keyboard-first UX.

**7. ¿Density toggle solo en Brain o global?**
→ Global, `Ctrl+.`. Usuario decide, no nosotros.

**8. ¿Status bar nueva o agregamos info al topbar?**
→ Nueva, abajo, 24px. Separa "donde estoy" (topbar) de "como anda" (statusbar). Es una decision editorial.

**9. ¿Iconos en sidebar o solo texto?**
→ Solo texto. Los iconos genericos son ruido y en paneles densos no aportan escaneo.

**10. ¿Brain mini-mode se queda o se va?**
→ Se va. El hero band permanente cumple la misma funcion sin requerir toggle.

## D. Estimated execution order (checkpoints criticos)

```
Phase 0    ─── Backup + screenshots                    [verify dev runs]
Phase 1    ─── Layout tokens                           [verify in devtools]
Phase 2    ─── Primitives                              [playground test]
Phase 3    ─── Shell 5-zone replacement                [CRITICAL: verify nav + ws + login]
Phase 4    ─── Inspector pane global                   [manual dispatch test]
Phase 5    ─── Command palette + keyboard              [all shortcuts work]
           ─────────────────────────────── CHECKPOINT 1 (shell done, no views touched)

Phase 6    ─── Dashboard redesign                      [visual diff]
Phase 7    ─── Clients split + inspector               [CRITICAL: CRUD still works]
Phase 8    ─── Logs sticky                             [WS stream still live]
           ─────────────────────────────── CHECKPOINT 2 (3 simple views done)

Phase 9    ─── System panel refine                     [drawer → inspector]
Phase 10   ─── BrainView total reorg                   [CRITICAL: all 21 sections render]
Phase 11   ─── LocalCommand (mismo pattern)            [GPU telemetry live]
           ─────────────────────────────── CHECKPOINT 3 (heavy views done)

Phase 12   ─── CMS + Env + Login                       [final views]
Phase 13   ─── Responsive audit                        [all breakpoints]
Phase 14   ─── Cleanup dead code                       [npm run build clean]
Phase 15   ─── Verification gates                      [all checks pass]
           ─────────────────────────────── READY TO MERGE
```

Cada **CHECKPOINT** es un commit estable donde se puede detener el trabajo y mergear a main si el tiempo se acaba. Los checkpoints son independientes.

---

# Epilogo — Por que este plan va a funcionar

Tres razones.

**Primera: el nucleo del problema lo atacamos en la raiz.** La jerarquia rota es una decision de diseno, no un bug. Aca tomamos la decision. Cada view tiene 1 pregunta, cada row tiene 1 nivel de jerarquia, cada cell tiene 1 responsabilidad. Eso no deja espacio para "espacios sin sentido".

**Segunda: no reescribimos logica.** Los 21 Brain sections existen y funcionan. Los stores existen y funcionan. Los services existen y funcionan. Todo el sistema de UI nuevo es compositional — wrapper y layout. Si algo rompe, revertimos el wrapper, la data sigue fluyendo.

**Tercera: cada fase es verificable.** No terminamos hasta que el gate pasa. No avanzamos con "despues lo arreglo". Eso es como hacer un modelo: un anillo por vez, cada uno tiene que cerrar perfecto antes del siguiente.

Cuando termine esto, Mateo va a poder abrir el panel y:
- Saber en 3 segundos si el sistema esta OK (Dashboard hero)
- Editar un tenant sin perder el contexto de la lista (split + inspector)
- Debuggear una decision del brain sin scrollear 3000px (BrainView tabs)
- Navegar todo con teclado (command palette + shortcuts)
- Ver cualquier view en cualquier tamano de pantalla sin espacios muertos (grid determinista)

Esa es la promesa. Y como Eros, yo la firmo.

---

*Plan escrito por Eros, Director Creativo Autonomo, con base en 19 proyectos de experiencia y 7 reglas promovidas. La proxima revision llega cuando el plan se ejecute — no antes. Si algo en este plan esta mal, aprendere y la siguiente version sera mejor.*

*Fecha: 2026-04-10*
*Version: 1.0*
