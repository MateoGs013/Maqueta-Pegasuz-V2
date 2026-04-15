# Plan de Migracion Estetica: Pegasuz SuperAdmin → Eros Aesthetic

> **Objetivo:** Migrar la identidad visual del panel SuperAdmin de Pegasuz a la estetica del panel de Eros.
> **Alcance:** SOLO CSS, HTML de template, fonts. CERO cambios en logica, endpoints, stores, router, API, WebSocket.
> **Proyecto:** `C:\Users\mateo\Desktop\Dev\pegasuz\SaaS-Multitenant\pegasuz\Pegasuz-Core\frontend-superadmin\frontend-superadmin\`
> **Referencia estetica:** `C:\Users\mateo\Desktop\Dev\tools\maqueta\docs\eros-panel-aesthetic-brief.md`

---

## Inventario del Trabajo

| Categoria | Archivos | Lineas CSS aprox |
|-----------|----------|------------------|
| Design system global | 1 (`design-system.css`) | 776 |
| CSS compartido Brain | 1 (`brain-shared.css`) | 177 |
| Font imports | 1 (`index.html`) | 4 lineas |
| App shell | 1 (`App.vue`) | 314 |
| Views principales | 6 | ~1,050 |
| Views system | 4 | ~1,820 |
| Componentes core | 3 | ~477 |
| Componentes system | 14 | ~2,100 |
| Componentes brain | 22 | ~5,800 |
| **TOTAL** | **53 archivos** | **~12,500 lineas** |

---

## Estrategia General

La buena noticia: **todo usa tokens `--pz-*`**. No hay colores hardcodeados. Esto permite una migracion en 2 oleadas:

1. **Oleada de tokens** — Cambiar valores en `design-system.css`. Esto propaga ~70% del cambio visual automaticamente a los 38 archivos con estilos scoped.
2. **Oleada de patrones** — Los cambios estructurales que los tokens no cubren: border-radius, shadows, layout patterns, glassmorphism, typography classes.

---

## Fase 0: Preparacion

**Archivo: ninguno (solo verificacion)**

- [ ] Hacer un commit limpio del estado actual antes de tocar nada
- [ ] Verificar que `npm run dev` arranca sin errores
- [ ] Tomar screenshots de referencia de TODAS las vistas:
  - `/dashboard`
  - `/clients`
  - `/clients/new`
  - `/cms-contracts`
  - `/superadmin/logs`
  - `/system`
  - `/system/brain`
  - `/system/env`
  - `/system/local-command`
  - `/login`
- [ ] Guardar screenshots en `docs/reskin-before/` como referencia

---

## Fase 1: Tokens Globales (`design-system.css`)

**Archivo:** `src/assets/design-system.css`
**Impacto:** Cascadea a los 38 archivos con estilos

### 1.1 Color Tokens

Reemplazar TODOS los valores de color en `:root`:

```css
:root {
  /* Surfaces — Eros warm near-blacks */
  --pz-bg-base:       #0a0a0b;     /* era #111114 */
  --pz-bg-raised:     #111113;     /* era #18181c */
  --pz-bg-card:       #0a0a0b;     /* era #1e1e23 — en Eros las cards NO son mas claras */
  --pz-bg-card-hover: #161618;     /* era #25252b */
  --pz-bg-surface:    #161618;     /* era #2a2a31 */
  --pz-bg-elevated:   #161618;     /* era #25252b */
  --pz-bg-input:      #111113;     /* era #1a1a1f */
  --pz-bg-overlay:    rgba(0, 0, 0, 0.6);  /* se mantiene */

  /* Glass — ELIMINAR (Eros no usa glassmorphism) */
  --pz-glass-bg:       rgba(22, 22, 24, 0.95);  /* opaco, sin blur */
  --pz-glass-border:   rgba(255, 255, 255, 0.06);
  --pz-glass-bg-hover: rgba(28, 28, 31, 0.95);

  /* Borders — Eros style */
  --pz-border:        rgba(255, 255, 255, 0.06);  /* era 0.08 — mas sutil */
  --pz-border-subtle: rgba(255, 255, 255, 0.04);
  --pz-border-focus:  var(--pz-accent);
  --pz-border-strong: rgba(255, 255, 255, 0.14);  /* se mantiene */

  /* Text — Eros warm whites */
  --pz-text-primary:   #f0e7d8;    /* era #f0f0f2 — ahora CREMA, no frio */
  --pz-text-secondary: #8a8578;    /* era #a0a0ae — ahora calido */
  --pz-text-muted:     rgba(240, 231, 216, 0.25);  /* era #6b6b7a */
  --pz-text-inverse:   #0a0a0b;    /* era #111114 */

  /* Accent — Eros hot orange */
  --pz-accent:         #ff6a00;    /* era #e8952f */
  --pz-accent-hover:   #ff8c33;    /* era #f0a540 */
  --pz-accent-soft:    rgba(255, 106, 0, 0.06);  /* era 0.12 — mas sutil en Eros */
  --pz-accent-glow:    rgba(255, 106, 0, 0.12);  /* era 0.18 */
  --pz-accent-text:    #ff8c33;    /* era #f5b04a */

  /* Gradients — SIMPLIFICAR (Eros no usa gradientes visibles) */
  --pz-gradient-accent: linear-gradient(135deg, #ff6a00 0%, #ff6a00 100%);  /* flat */
  --pz-gradient-warm:   none;  /* ELIMINAR — background transparente */
  --pz-gradient-card:   none;  /* ELIMINAR */

  /* Semantic — Eros colors */
  --pz-success:      #3ee8b5;      /* era #34d399 */
  --pz-success-soft: rgba(62, 232, 181, 0.12);
  --pz-warning:      #fbbf24;      /* se mantiene */
  --pz-warning-soft: rgba(251, 191, 36, 0.12);
  --pz-error:        #ff4040;      /* era #f87171 — mas agresivo */
  --pz-error-soft:   rgba(255, 64, 64, 0.12);
  --pz-danger:       #ff4040;
  --pz-danger-soft:  rgba(255, 64, 64, 0.12);
  --pz-info:         #60a5fa;      /* se mantiene */
  --pz-info-soft:    rgba(96, 165, 250, 0.12);
}
```

### 1.2 Typography Tokens

```css
  /* Typography — Eros font stack */
  --pz-font-display: 'Space Grotesk', system-ui, sans-serif;  /* SE MANTIENE */
  --pz-font-body:    'DM Sans', system-ui, sans-serif;        /* era 'Roboto' */
  --pz-font-mono:    'DM Mono', ui-monospace, monospace;      /* era 'JetBrains Mono' */
```

### 1.3 Radius — Angular

```css
  /* Radius — Eros es angular */
  --pz-radius-sm:   0;       /* era 6px */
  --pz-radius-md:   0;       /* era 10px */
  --pz-radius-lg:   0;       /* era 14px */
  --pz-radius-xl:   0;       /* era 20px */
  --pz-radius-full: 0;       /* era 9999px — CRITICO: pills rectangulares */
```

> **Nota:** Esto es la decision estetica mas fuerte. Eliminar todo border-radius transforma la personalidad del panel inmediatamente. Si alguna cosa especifica necesita radius (avatars, dots), se hace con override local, no con token.

### 1.4 Shadows — Eliminar

```css
  /* Shadows — Eros NO usa shadows */
  --pz-shadow-sm:   none;
  --pz-shadow-md:   none;
  --pz-shadow-lg:   none;
  --pz-shadow-glow: none;
  --pz-shadow-card: none;
```

### 1.5 Transitions — Mas rapidas

```css
  --pz-transition:      120ms cubic-bezier(0.16, 1, 0.3, 1);  /* era 180ms ease */
  --pz-transition-slow: 150ms cubic-bezier(0.16, 1, 0.3, 1);  /* era 300ms ease */
```

### 1.6 Focus y States

```css
  --pz-focus-ring: none;  /* Eros usa outline, no box-shadow ring */
  --pz-console-bg: #0a0a0b;
```

### 1.7 Layout

```css
  --pz-sidebar-width: 220px;   /* era 260px */
  --pz-topbar-height: 0px;     /* ELIMINAR topbar — Eros no tiene */
```

### 1.8 Nuevo token: cell padding

```css
  --pz-cell-pad: 28px 32px;    /* NUEVO — padding estandar de celdas Eros */
```

### 1.9 Base styles updates

```css
/* Scrollbar — ultra-delgada como Eros */
::-webkit-scrollbar { width: 3px; height: 3px; }  /* era 6px */
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.06); }
/* ELIMINAR ::-webkit-scrollbar-thumb:hover */

/* Focus — outline simple, no ring */
:focus-visible {
  outline: 1px solid var(--pz-accent);
  outline-offset: 2px;
  box-shadow: none;  /* ELIMINAR el ring doble */
}

/* ELIMINAR input focus ring separado — hereda el global */
```

### 1.10 Cards — Flat, sin glass

```css
.pz-card {
  background: var(--pz-bg-base);     /* era bg-card — ahora MISMO fondo */
  border: 1px solid var(--pz-border);
  border-radius: 0;                  /* token ya lo maneja pero ser explicito */
  padding: var(--pz-cell-pad);       /* era space-xl */
  box-shadow: none;                  /* ELIMINAR shadow-card */
}
.pz-card:hover {
  border-color: var(--pz-border-strong);  /* sutil, sin shadow */
}

/* ELIMINAR .pz-card-glass completamente — o reescribir sin backdrop-filter */
.pz-card-glass {
  background: var(--pz-bg-base);
  border: 1px solid var(--pz-border);
  padding: var(--pz-cell-pad);
  /* SIN backdrop-filter, SIN blur */
}
```

### 1.11 Buttons — Ghost by default

```css
.pz-btn {
  padding: 6px 14px;                          /* era 10px 18px — mas compacto */
  border-radius: 0;
  font-family: var(--pz-font-mono);           /* era font-body */
  font-size: 10px;                            /* era 0.875rem */
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid var(--pz-accent);
  background: transparent;
  color: var(--pz-accent);
}
.pz-btn:active:not(:disabled) {
  transform: none;  /* ELIMINAR scale effect */
}

.pz-btn-primary {
  background: transparent;                    /* era gradient-accent */
  color: var(--pz-accent);
  border-color: var(--pz-accent);
}
.pz-btn-primary:hover:not(:disabled) {
  background: var(--pz-accent-soft);
  box-shadow: none;                           /* era shadow-glow */
  filter: none;                               /* era brightness(1.1) */
}

.pz-btn-secondary {
  background: transparent;
  color: var(--pz-text-secondary);
  border-color: var(--pz-border-strong);
}
.pz-btn-secondary:hover:not(:disabled) {
  background: var(--pz-bg-surface);
  border-color: var(--pz-border-strong);
  color: var(--pz-text-primary);
}

.pz-btn-ghost {
  border-color: transparent;  /* ghost es SIN borde */
}
.pz-btn-ghost:hover:not(:disabled) {
  background: var(--pz-bg-surface);
  color: var(--pz-text-primary);
}
```

### 1.12 Badges → Pills (rectangulares)

```css
.pz-badge {
  padding: 2px 8px;
  border-radius: 0;                          /* era radius-full (9999px) */
  font-size: 9px;                            /* era 0.7rem */
  font-family: var(--pz-font-mono);          /* NUEVO — mono como Eros */
  letter-spacing: 0.08em;
  border: 1px solid var(--pz-border-strong); /* NUEVO — siempre borde */
  background: transparent;                   /* default transparente */
}

/* Variantes — borde + bg-soft + text-color */
.pz-badge-active  { border-color: rgba(62, 232, 181, 0.3);  background: var(--pz-success-soft); color: var(--pz-success); }
.pz-badge-disabled { border-color: rgba(255, 64, 64, 0.3);  background: var(--pz-error-soft);   color: var(--pz-error); }
.pz-badge-default { border-color: rgba(255, 106, 0, 0.3);   background: var(--pz-accent-soft);  color: var(--pz-accent-hover); }
.pz-badge-ai     { border-color: rgba(96, 165, 250, 0.3);   background: var(--pz-info-soft);    color: var(--pz-info); }
.pz-badge-manual { border-color: var(--pz-border-strong);    background: transparent;            color: var(--pz-text-secondary); }
```

### 1.13 Tables — Eros style

```css
.pz-table-wrap {
  border: none;                             /* era 1px solid border */
  border-radius: 0;
  background: transparent;                  /* era bg-card */
}

.pz-table th {
  font-family: var(--pz-font-mono);        /* era font-display */
  font-weight: 500;
  font-size: 9px;                           /* era 0.75rem */
  letter-spacing: 0.12em;
  color: var(--pz-text-muted);
  background: transparent;                  /* era bg-raised */
  border-bottom: 1px solid var(--pz-border);
  padding: 10px 16px;
}

.pz-table td {
  font-size: 12px;                          /* era 0.875rem */
  color: var(--pz-text-secondary);
  border-bottom: 1px solid var(--pz-border);
  padding: 10px 16px;
}

.pz-table tbody tr:hover {
  background: var(--pz-bg-surface);         /* era bg-card-hover */
}
```

### 1.14 Stat cards — Cell pattern

```css
.pz-stat-card {
  background: var(--pz-bg-base);
  border: none;                             /* ELIMINAR borde individual */
  border-radius: 0;
  padding: var(--pz-cell-pad);
  box-shadow: none;
}
.pz-stat-card:hover {
  border-color: transparent;
  box-shadow: none;                         /* ELIMINAR hover shadow */
}

.pz-stat-label {
  font-size: 10px;
  font-family: var(--pz-font-mono);        /* NUEVO */
  letter-spacing: 0.12em;
  color: var(--pz-text-secondary);          /* era text-muted */
}

.pz-stat-value {
  font-size: clamp(32px, 4vw, 52px);       /* era 1.75rem */
  letter-spacing: -0.04em;                  /* era -0.02em — mas tight */
  line-height: 0.9;                         /* NUEVO — tight como Eros */
}

.pz-stat-accent {
  border-color: transparent;
  background: var(--pz-bg-base);            /* era gradient */
}
```

### 1.15 Stat grid — Gap-as-separator

```css
.pz-stat-grid {
  gap: 1px;                                 /* era space-lg (16px) */
  background: var(--pz-border);             /* NUEVO — el gap es el separador */
}
.pz-stat-grid > * {
  background: var(--pz-bg-base);            /* NUEVO — celdas tapan el fondo */
}
```

### 1.16 Modals

```css
.pz-overlay {
  backdrop-filter: none;                    /* ELIMINAR blur */
}

.pz-modal {
  border-radius: 0;
  box-shadow: none;                         /* era shadow-lg */
  animation: none;                          /* era pz-slide-up */
}
```

### 1.17 Forms

```css
.pz-input, .pz-select, .pz-textarea {
  border-radius: 0;
  padding: 8px 12px;                        /* mas compacto */
  font-size: 13px;                          /* era 0.875rem */
}
.pz-input:focus, .pz-select:focus, .pz-textarea:focus {
  box-shadow: none;                         /* ELIMINAR — solo outline */
  border-color: var(--pz-accent);
}

.pz-label {
  font-family: var(--pz-font-mono);        /* NUEVO */
  font-size: 10px;                          /* era 0.8rem */
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--pz-text-secondary);
}
```

### 1.18 Animations — Simplificar

```css
/* ELIMINAR pz-slide-up — Eros no tiene mount animations */
/* MANTENER pz-fade-in pero reducir a 120ms */
@keyframes pz-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* MANTENER pz-spin para spinners */

/* ELIMINAR light theme override completo */
/* [data-theme="light"] { ... } — BORRAR TODO */
```

---

## Fase 2: Font Imports (`index.html`)

**Archivo:** `index.html`

Reemplazar los Google Fonts imports:

```html
<!-- ANTES -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Roboto:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- DESPUES -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet">
```

---

## Fase 3: App Shell (`App.vue`)

**Archivo:** `src/App.vue`
**Cambios:** Solo `<style scoped>` — NO tocar `<script>` ni `<template>` logica

### 3.1 Sidebar — Reducir a 220px, estilo Eros

Cambios en scoped CSS de App.vue:

```
.sidebar
  width: 220px (era 260px via token, pero hay que verificar que use el token)
  background: var(--pz-bg-base) (era bg-raised — en Eros sidebar = mismo fondo)

.sidebar-brand
  Simplificar: eliminar brand-mark (la "P" con gradiente)
  Solo texto: "Pegasuz" + "SuperAdmin" subtitulo
  Logo: font: 700 18px display, -0.04em (como Eros)
  Tagline: font: 400 9px mono, 0.08em, uppercase, dim

.brand-mark
  ELIMINAR — reemplazar por texto plano
  (en template: cambiar <span class="brand-mark">P</span> por texto)
```

**Atencion:** Esto requiere un cambio MINIMO en template — solo reemplazar el div del logo, no logica.

### 3.2 Navigation — Eros pattern

```
.nav-item
  border-radius: 0 (era radius-md)
  padding: 10px 20px (era 10px 14px)
  border-left: 2px solid transparent (NUEVO)
  Eliminar ::before pseudo-element (la barra animada)

.nav-item:hover
  background: var(--pz-bg-surface)
  color: var(--pz-text-primary)
  padding-left: 24px (micro-shift de 4px)

.nav-item--active
  color: var(--pz-text-primary)
  border-left-color: var(--pz-accent)
  background: var(--pz-accent-soft)
  padding-left: 24px

.nav-label
  font: 500 13px body

.nav-icon
  font-size: 0.8rem (reducir ligeramente)
```

### 3.3 Topbar — Eliminar o minimalizar

Eros no tiene topbar. Opciones:
- **Opcion A (recomendada):** Mantener pero invisibilizar — `height: 0; border: none; padding: 0; overflow: hidden`
- **Opcion B:** Reducir a una linea minima con solo el titulo en mono 10px

Si se opta por Opcion A, el page title se puede mover al contenido de cada vista (ya lo hacen algunas).

### 3.4 Sidebar footer

```
.user-avatar
  border-radius: 0 (era radius-full — cuadrado!)
  background: var(--pz-accent-soft)
  font: 700 10px mono (era display)

.logout-btn
  border-radius: 0

.user-name
  font: 600 11px body

.user-email
  font: 400 9px mono, dim
```

### 3.5 Footer status — Agregar dot pulsante

Agregar al sidebar footer un dot de estado como Eros:

```css
/* En App.vue, agregar al .sidebar-footer */
.sb-foot-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--pz-success);
  box-shadow: 0 0 6px rgba(62, 232, 181, 0.12);
  animation: pulse-dot 3s infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

**Template mini-change:** Agregar `<span class="sb-foot-dot"></span>` + texto "Sistema activo" al footer. Esto es un cambio de template MINIMO y puramente visual.

---

## Fase 4: Brain Module

### 4.1 `brain-shared.css`

```
.brain-section-header
  border-left: 2px solid var(--pz-accent) (era 3px info con gradient)
  border-image: none (ELIMINAR gradient)
  :hover — eliminar box-shadow glow

.brain-section-header h3
  text-shadow: none (ELIMINAR)
  :hover color — var(--pz-accent) (era pz-info)

.brain-count
  border-radius: 0

.brain-badge-*
  border-radius: 0
  Agregar border: 1px solid (como pills de Eros)

.brain-placeholder
  border-radius: 0

.brain-focusable:focus-visible
  outline-color: var(--pz-accent) (era pz-info)
  border-radius: 0

.brain-scrollbar
  ::-webkit-scrollbar { width: 3px } (era 4px)
```

### 4.2 `BrainSectionWrap.vue`

```
.brain-section :deep(.pz-card)
  ELIMINAR todo box-shadow (shadow-card, info-glow, hover shadow)
  ELIMINAR transform: translateY(-1px) en hover
  border-color: var(--pz-border) (simple, no info-glow)

.health-green/amber/red :deep(.pz-card)
  Cambiar border-top a border-left (mas Eros — indicador lateral)
  O mantener border-top pero sin shadow

.section-toggle
  border-radius: 0

Stagger animation:
  MANTENER pero reducir a 0.15s (era 0.3s)
```

### 4.3 `BrainView.vue` (1194 lineas de CSS)

Este es el archivo mas grande. Cambios principales:

```
Todas las cards internas:
  border-radius: 0
  box-shadow: none
  background: var(--pz-bg-base) (no bg-card)

Todos los badges/chips internos:
  border-radius: 0
  Agregar border 1px solid

Todos los section headers:
  Cambiar color info → accent donde sea decorativo
  Eliminar gradientes y glows

Metric displays:
  Usar font scale de Eros (values grandes, labels mono 10px)

Grid layouts:
  Considerar gap-as-separator donde haya grids de metricas
```

**Nota:** Este archivo es grande pero repetitivo — los mismos patrones se repiten en cada seccion. Un search-and-replace cuidadoso cubre mucho.

### 4.4 Los 21 Brain Section Components

Patron comun en todos:
- Cambiar cualquier `border-radius` hardcodeado a `0`
- Eliminar `box-shadow` inline
- Reemplazar `var(--pz-info)` como color decorativo por `var(--pz-accent)` donde sea un highlight visual (no donde sea semantico de "informacion")
- Badges internos: agregar borde, quitar radius
- Cualquier `backdrop-filter`: eliminar
- Scale effects en hover (transform: scale): eliminar

Los archivos mas pesados que requieren atencion individual:

| Archivo | Lineas CSS | Prioridad |
|---------|-----------|-----------|
| BrainGovernanceSection.vue | 604 | Alta — mas CSS |
| BrainLocalModelsSection.vue | 458 | Alta |
| BrainRoutingSection.vue | 415 | Alta |
| BrainContextSection.vue | 404 | Media |
| BrainAgentVizSection.vue | 391 | Media |
| BrainStatusSection.vue | 360 | Media |
| BrainSessionSection.vue | 346 | Media |
| BrainProductSection.vue | 343 | Media |
| BrainDecisionsSection.vue | 341 | Media |
| Resto (12 archivos) | 100-300 c/u | Baja — pattern repetido |

---

## Fase 5: Views Principales

### 5.1 `DashboardView.vue`

```
.dash-hero
  background: transparent (era gradient-warm)
  border: none (ELIMINAR — usar gap separator del parent)
  border-radius: 0
  padding: var(--pz-cell-pad)

.quick-card
  border-radius: 0
  :hover — eliminar shadow-glow, eliminar translateY
  .quick-icon — border-radius: 0 (era radius-md)

.system-grid
  border-radius: 0
  Considerar gap-as-separator

.system-dot (status dots)
  MANTENER border-radius: 50% — los dots son circular por naturaleza
  Reducir shadow glow
```

### 5.2 `LoginView.vue`

```
Mantener centrado pero:
  Card de login: border-radius: 0, sin shadow
  Input fields: heredan de global
  Brand section: simplificar
```

### 5.3 `ClientsView.vue` (394 lineas)

```
Client grid/cards: border-radius: 0, sin shadows
Search input: border-radius: 0
Filters: convertir a pills rectangulares
Action modals: heredan de global
```

### 5.4 `LogsView.vue`

```
Console area: ya es oscura, ajustar al --pz-bg-base
Timestamps: usar font-mono
Level indicators: convertir a pills Eros
```

### 5.5 `CmsContractsView.vue`

```
Tabla: hereda de .pz-table global
Cards: hereda de .pz-card global
Filtros: pills rectangulares
```

### 5.6 System views

`SystemPanelView.vue`, `EnvManagerView.vue`, `LocalCommandView.vue`:
- Heredan mayoria de tokens globales
- Ajustar cards, badges, y section headers al pattern

---

## Fase 6: Componentes Restantes

### Componentes que heredan mayoria por tokens:
- `ClientTable.vue` — hereda de .pz-table
- `CreateClientForm.vue` — hereda de .pz-input/.pz-label
- `ActionModal.vue` — hereda de .pz-modal
- `SubsystemStatusRow.vue` — minimo CSS propio

### Componentes que necesitan atencion:
- `ProvisioningFloat.vue` (371 lineas) — floating panel, progress bars, animaciones
- `SeverityPill.vue` — pulse animation, convertir a pill rectangular
- `KpiChip.vue` — metricas, adaptar a font scale Eros
- `GaugeBar.vue` — progress bar, hacer 2px como Eros
- `EventStream.vue` + `EventRow.vue` — log styling
- `TenantCard.vue` + `TenantGrid.vue` — card grid, eliminar shadows
- `IncidentTimeline.vue` — timeline visualization
- `DatabaseHealthSection.vue` (423 lineas) — pesado, atencion individual

---

## Fase 7: Verificacion

- [ ] **Visual diff** de cada vista contra los screenshots de Fase 0
- [ ] **Funcionalidad intacta:**
  - [ ] Login/logout funciona
  - [ ] Navegacion entre todas las rutas
  - [ ] WebSocket sigue conectando (logs, brain updates)
  - [ ] CRUD de tenants funciona
  - [ ] Modales abren/cierran
  - [ ] Responsive en 768px y 480px
- [ ] **Consistencia:**
  - [ ] Ningun border-radius residual (excepto dots/avatars)
  - [ ] Ningun box-shadow residual
  - [ ] Ningun gradiente decorativo visible
  - [ ] Ningun color `#f0f0f2` o `#a0a0ae` residual (frios)
  - [ ] Todos los texts son crema, no frios
  - [ ] Font stack correcto (DM Sans body, DM Mono metadata)
- [ ] **Regresion cero:**
  - [ ] No se toco ningun archivo .js (excepto main.js si hay font preload)
  - [ ] No se toco ningun store
  - [ ] No se toco ningun router
  - [ ] No se toco ningun service/api
  - [ ] Ningun endpoint cambio

---

## Orden de Ejecucion Recomendado

```
1. Fase 0: Screenshots de referencia           [5 min]
2. Fase 1: design-system.css tokens            [~30 min]  ← 70% del impacto visual
3. Fase 2: index.html fonts                    [2 min]
4. Fase 3: App.vue shell                       [~20 min]  ← 85% del impacto visual
   → Checkpoint: verificar dashboard se ve Eros-like
5. Fase 5.1: DashboardView                     [~15 min]
6. Fase 5.2: LoginView                         [~10 min]
   → Checkpoint: las 2 vistas mas visitadas ya migradas
7. Fase 4.1-4.2: brain-shared + SectionWrap    [~15 min]  ← cascadea a 21 brain sections
8. Fase 4.3: BrainView.vue                     [~30 min]  ← el archivo mas grande
9. Fase 4.4: Brain sections (batch)            [~45 min]  ← repetitivo
10. Fase 5.3-5.6: Views restantes              [~30 min]
11. Fase 6: Componentes restantes              [~30 min]
12. Fase 7: Verificacion                       [~20 min]
```

**Tiempo estimado total:** ~4 horas de trabajo CSS puro
**Riesgo de regresion funcional:** Cercano a cero si no se tocan scripts

---

## Archivos que NO se tocan (lista explicita)

```
src/stores/*           — TODOS intactos
src/services/*         — TODOS intactos
src/api/*              — TODOS intactos
src/router/*           — INTACTO
src/composables/*      — TODOS intactos
src/config/*           — INTACTO
src/constants/*        — INTACTO
src/utils/*            — INTACTO
vite.config.js         — INTACTO
package.json           — INTACTO
```

Solo se modifican: `<style>` blocks en `.vue` files, `design-system.css`, `brain-shared.css`, `index.html`.
