# Eros Panel — Aesthetic Brief

> Documento portable para replicar la identidad visual del panel de Eros en otros paneles/dashboards.
> Extraido del codigo fuente real, no inferido.

---

## 1. Personalidad Visual

**Concepto:** Terminal de comando de una nave espacial diseñada por un arquitecto italiano.

El panel combina la densidad informacional de un HUD de sistemas con la calidez material de un estudio de diseño nocturno. No es frio como un dashboard SaaS generico, ni decorativo como un portfolio. Es **utilitario con alma** — cada pixel comunica algo, pero lo hace con elegancia.

**Palabras clave:** warm-dark, utilitarian-elegant, data-dense, restrained-luxury, editorial-grid

**Lo que NO es:** glassmorphism exagerado, gradientes decorativos, bordes redondeados excesivos, colores saturados, animaciones llamativas

---

## 2. Color System

### Fundacion oscura (warm near-blacks)

```css
--bg:          #0a0a0b;      /* fondo principal — casi negro, ligeramente calido */
--bg-raised:   #111113;      /* fondo elevado — para headers/footers fijos */
--surface:     #161618;      /* superficie interactiva — hover backgrounds, bars */
--surface-hot: #1c1c1f;      /* superficie activa — hover intenso */
```

**Principio:** Nunca `#000` puro. Los negros tienen un micro-tinte calido que los hace habitables. Las capas se distinguen por cambios de 5-8 puntos en luminosidad, no por bordes gruesos.

### Texto (warm whites, 3 niveles)

```css
--text:        #f0e7d8;                    /* texto principal — blanco crema, nunca #fff */
--text-muted:  #8a8578;                    /* texto secundario — info contextual */
--text-dim:    rgba(240, 231, 216, 0.25);  /* texto terciario — metadata, etiquetas silenciosas */
```

**Principio:** El texto principal tiene un tono crema/pergamino, no blanco frio. Los niveles de muted/dim se logran con opacidad sobre ese mismo tono base, creando coherencia.

### Accent (naranja calido)

```css
--accent:      #ff6a00;                    /* accion principal, links activos, barras de progreso */
--accent-hot:  #ff8c33;                    /* hover del accent — mas claro, no mas saturado */
--accent-glow: rgba(255, 106, 0, 0.12);   /* halos, glows sutiles */
--accent-ember: rgba(255, 106, 0, 0.06);  /* backgrounds activos — apenas perceptible */
```

**Principio:** El accent es HOT — un naranja que quema. Pero se usa con restriccion extrema: solo en indicadores activos, links hover, barras de progreso, y borders de estado. Nunca como background solido. Siempre en micro-dosis (`0.06` a `0.3` de opacidad).

### Lineas y bordes

```css
--line:         rgba(255, 255, 255, 0.06);  /* separadores principales — casi invisibles */
--line-strong:  rgba(255, 255, 255, 0.14);  /* bordes de pills/tags — ligeramente visibles */
--line-accent:  rgba(255, 106, 0, 0.3);     /* bordes con accent — pills activos, badges */
```

**Principio:** Los separadores entre secciones son lineas de 1px a muy baja opacidad. No hay bordes gruesos. La grilla se define por gaps de 1px con `background: var(--line)` en el contenedor — las celdas cubren el fondo, y el gap queda visible como linea.

### Status semantico

```css
--success:      #3ee8b5;                     /* score alto, reglas promovidas */
--success-soft: rgba(62, 232, 181, 0.12);    /* background sutil de success */
--error:        #ff4040;                      /* score bajo, errores */
--error-soft:   rgba(255, 64, 64, 0.12);
--warn:         #fbbf24;                      /* deuda tecnica, warnings */
--warn-soft:    rgba(251, 191, 36, 0.12);
--info:         #60a5fa;                      /* informativo neutral */
--info-soft:    rgba(96, 165, 250, 0.12);
--metal:        #c0b8a8;                      /* metalico neutro — estado medio */
```

**Principio:** Cada color de status tiene su version `soft` al 12% de opacidad para backgrounds. Los pills usan `border + background-soft + text-color` como triade.

---

## 3. Typography System

### Font stack (3 familias, roles claros)

```css
--font-display: 'Space Grotesk', system-ui, sans-serif;  /* titulos, scores, numeros grandes */
--font-body:    'DM Sans', system-ui, sans-serif;         /* texto corrido, labels de navegacion */
--font-mono:    'DM Mono', ui-monospace, monospace;       /* metadata, etiquetas, pills, status */
```

**Google Fonts import:**
```
DM Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500
DM Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700
Space Grotesk:wght@300..700
```

### Escala tipografica

| Clase | Font | Size | Weight | L-H | Tracking | Uso |
|-------|------|------|--------|-----|----------|-----|
| `.value` | display | `clamp(40px, 5vw, 64px)` | 700 | 0.9 | -0.04em | Numeros hero, scores grandes |
| `.value-sm` | display | `clamp(32px, 4vw, 52px)` | 700 | 0.9 | -0.04em | Metricas secundarias |
| `.title` | display | `clamp(24px, 3vw, 36px)` | 700 | 1.05 | -0.03em | Titulos de seccion |
| `.title-sm` | display | `16px` | 600 | 1.2 | -0.02em | Subtitulos, nombres |
| `.body` | body | `13px` | 400 | 1.6 | — | Texto corrido |
| `.body-sm` | body | `11px` | 400 | 1.5 | — | Texto secundario |
| `.label` | mono | `10px` | 500 | — | 0.12em | Etiquetas de campo (UPPERCASE) |
| `.pill` | mono | `9px` | 600 | — | 0.08em | Status tags (UPPERCASE) |
| `.sb-section` | mono | `8px` | 600 | — | 0.16em | Secciones de nav (UPPERCASE) |

### Reglas tipograficas

- Los titulos usan **letter-spacing negativo** (-0.03 a -0.05em) para compactar y dar peso
- Las etiquetas y pills usan **letter-spacing positivo** (0.06 a 0.18em) y **text-transform: uppercase** para leer como metadata de sistema
- Nunca mezclar display con uppercase — solo mono y labels van en mayusculas
- El body base es **13px** (no 14, no 16) — denso pero legible
- Los numeros hero usan line-height `0.82-0.9` — super apretado, sin espacio desperdiciado

---

## 4. Layout System

### Estructura shell

```
.shell (flex, height: 100vh, overflow: hidden)
  .sidebar (220px fixed, flex-column, border-right: 1px --line)
  .main-area (flex: 1, overflow: hidden)
    <RouterView>
```

- Sidebar: **220px** fijo, fondo `var(--bg)`, borde derecho `1px solid var(--line)`
- Main: flex-grow, contenido scrolleable internamente

### Grid de contenido (gap-as-separator pattern)

```css
.panel-page {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;                    /* <- el gap ES el separador */
  background: var(--line);     /* <- color visible entre celdas */
}

.panel-page > * {
  background: var(--bg);       /* <- cada celda tapa el fondo */
}
```

**Este patron es central.** No hay bordes en las celdas — el gap de 1px sobre el background del contenedor crea las lineas de separacion. Simple y limpio.

### Grid rows

```css
.grid-row--2 { grid-template-columns: 1fr 1fr; }
.grid-row--3 { grid-template-columns: 1fr 1fr 1fr; }
.grid-row--4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
```

### Padding interno

```css
--cell-pad: 28px 32px;  /* padding de cada celda */
```

- Horizontal (32px) mayor que vertical (28px)
- Los paddings son **generosos** — esto no es un dashboard apretado, respira

---

## 5. Component Patterns

### Pills (status indicators)

```css
.pill {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 2px 8px;
  border: 1px solid var(--line-strong);
  background: transparent;
  color: var(--text-muted);
  font: 600 9px var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

**5 variantes por status:**

| Variante | Border | Background | Text |
|----------|--------|------------|------|
| default | `--line-strong` (14% white) | transparent | `--text-muted` |
| `--accent` | `--line-accent` (30% orange) | `--accent-ember` (6% orange) | `--accent-hot` |
| `--strong` | 30% green | `--success-soft` (12% green) | `--success` |
| `--weak` | 30% red | `--error-soft` (12% red) | `--error` |
| `--medium` | `--line-strong` | transparent | `--metal` |

**Principio:** Nunca border-radius en pills. Son **rectangulares** — no pill-shaped. Esto es una decision estetica fuerte que diferencia al panel de UIs genericas. El borde es de 1px, delgado.

### Metric cells

```css
.metric-cell {
  display: grid;
  gap: 6px;
  align-content: end;    /* <- contenido alineado al fondo de la celda */
  min-height: 100-120px;
}
```

Estructura:
```
[LABEL] ← mono 10px uppercase muted
[VALUE] ← display 32-64px bold tight
[SUFFIX] ← mono 14px dim (opcional)
```

### Progress bars

```css
.prog-bar {
  height: 2px;                /* <- muy delgada, 2px */
  background: var(--surface); /* fondo gris oscuro */
  overflow: hidden;
}
.prog-fill {
  height: 100%;
  background: var(--accent);  /* fill naranja */
}
```

**Principio:** Las barras de progreso son **ultrafinas** (2px). No rounded. Sin animacion de relleno (solo transition suave). Comunicacion minima, maxima claridad.

### Accent bars (vertical, en listas)

```css
.row-accent { width: 3px; height: 100%; align-self: stretch; }
.accent-strong { background: var(--success); }
.accent-medium { background: var(--accent); }
.accent-weak   { background: var(--error); }
```

Barra vertical de 3px al inicio de cada fila que indica estado con color.

### Tables

```css
th {
  font: 500 9px var(--font-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}
td {
  font: 400 12px/1.5 var(--font-body);
  color: var(--text-muted);
  border-bottom: 1px solid var(--line);
}
tr:hover { background: var(--surface); }
```

### Buttons (ghost style)

```css
.btn {
  padding: 6px 14px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font: 600 10px var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s;
}
.btn:hover { background: var(--accent-ember); }
.btn:disabled { opacity: 0.5; cursor: default; }
```

**Principio:** Botones son **ghost** — borde accent, fondo transparente. En hover ganan un micro-background accent. Nunca solid fill.

---

## 6. Navigation (Sidebar)

### Brand block

```
[Logo]     [version badge]
 Eros        v8
 Creative Brain
```

- Logo: `font: 700 18px display, -0.04em`
- Tagline: `font: 400 9px mono, 0.08em, uppercase, dim`
- Version badge: `font: 700 9px mono, accent, border accent, bg accent-ember`

### Nav items

```css
.sb-link {
  padding: 10px 20px;
  border-left: 2px solid transparent;
  color: var(--text-muted);
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
}
.sb-link:hover {
  color: var(--text);
  background: var(--surface);
  padding-left: 24px;        /* <- shift sutil a la derecha */
}
.sb-link.active {
  color: var(--text);
  border-left-color: var(--accent);
  background: var(--accent-ember);
  padding-left: 24px;
}
```

**Detalles clave:**
- Border-left de 2px como indicador activo (no dot, no highlight completo)
- El hover hace un **micro-shift** de 4px a la derecha (padding 20→24)
- Section headers: `font: 600 8px mono, 0.16em tracking, uppercase, dim`
- Labels: `font: 500 13px body`

### Footer status

```css
.sb-foot-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 6px var(--success-soft);
  animation: pulse-dot 3s infinite;
}
```

Dot verde pulsante (3s cycle, opacity 1→0.4→1) + texto "Sistema activo" en mono 9px dim.

---

## 7. Interactive States

### Transitions

```css
/* Transition base — presente en casi todo */
transition: background 120ms;              /* filas de tabla */
transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);  /* nav links */
transition: all 0.15s;                     /* botones */
transition: color 120ms;                   /* texto en hover */
```

**Principio:** Transiciones **rapidas** (120-150ms). Nunca lentas. El panel se siente responsivo e inmediato. El easing `cubic-bezier(0.16, 1, 0.3, 1)` da un snap sutil.

### Hover patterns

- **Filas:** `background: var(--surface)` + nombre cambia a `color: var(--accent)`
- **Nav items:** background surface + shift derecha + color full white
- **Botones:** background accent-ember (micro-tinte)
- **Links mono:** underline on hover

### Focus

```css
*:focus-visible {
  outline: 1px solid var(--accent);
  outline-offset: 2px;
}
```

Una sola regla global. Outline naranja, 1px, con 2px de offset. Simple.

---

## 8. Scrollbar

```css
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--line); }
```

**Ultra-delgada** (3px). Track transparente. Thumb del color de las lineas. Casi invisible hasta que scrolleas.

---

## 9. Responsive Strategy

### Breakpoints

| Breakpoint | Cambio |
|------------|--------|
| 1200px | Grid de 4 columnas → 2 |
| 980px | Cell padding reduce: `20px 16px`. Grids → 1 columna. Body scroll habilitado |
| 900px | Tablas: header oculto, filas simplifican a `accent + name + score` |
| 768px | Sidebar colapsa: pasa a horizontal top-bar con scroll-x. Shell cambia a `flex-direction: column` |

### Mobile adaptations

- Sidebar: pierde sections labels, pulse bar. Links se hacen horizontales con border-bottom en vez de border-left
- Grids: todo colapsa a 1 columna
- Padding: se reduce de `28x32` a `20x16`

---

## 10. Patrones Prohibidos (Anti-patterns)

| Prohibido | Por que | En cambio |
|-----------|---------|-----------|
| `border-radius: 999px` en pills | El panel es angular, no bubbly | border-radius: 0 o 2px maximo |
| Gradientes de color visibles | Romperian la planitud utilitaria | Solo gradientes al 3-8% opacity como atmosphere |
| Box-shadows visibles | No hay sombras en ningun componente | Depth via capas de background |
| Colores saturados como fondo | El fondo siempre es near-black | Solo como text-color o border a baja opacidad |
| Iconos decorativos | El panel no usa iconos (cero) | Texto mono + color = la unica senalizacion |
| Bordes gruesos (>1px) | Excepto el indicador activo de nav (2px) | Todo es 1px max |
| Font sizes grandes en body | El body base es 13px, pills son 9px | Mantener la densidad, no inflar |
| Animaciones de entrada | No hay mount animations ni stagger | Solo transitions de estado (hover, active) |
| Backgrounds solidos de accent | El naranja nunca es bg solid | Solo como text, border, o micro-tinte (6%) |
| White text puro (#fff) | Siempre warm: #f0e7d8 | Mantener el crema |

---

## 11. Tokens Listos para Copiar

```css
:root {
  /* Backgrounds */
  --bg:          #0a0a0b;
  --bg-raised:   #111113;
  --surface:     #161618;
  --surface-hot: #1c1c1f;

  /* Accent */
  --accent:       #ff6a00;
  --accent-hot:   #ff8c33;
  --accent-glow:  rgba(255, 106, 0, 0.12);
  --accent-ember: rgba(255, 106, 0, 0.06);

  /* Neutral */
  --metal: #c0b8a8;

  /* Status */
  --success:      #3ee8b5;
  --success-soft: rgba(62, 232, 181, 0.12);
  --error:        #ff4040;
  --error-soft:   rgba(255, 64, 64, 0.12);
  --warn:         #fbbf24;
  --warn-soft:    rgba(251, 191, 36, 0.12);
  --info:         #60a5fa;
  --info-soft:    rgba(96, 165, 250, 0.12);

  /* Lines */
  --line:         rgba(255, 255, 255, 0.06);
  --line-strong:  rgba(255, 255, 255, 0.14);
  --line-accent:  rgba(255, 106, 0, 0.3);

  /* Text */
  --text:       #f0e7d8;
  --text-muted: #8a8578;
  --text-dim:   rgba(240, 231, 216, 0.25);

  /* Typography */
  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-mono:    'DM Mono', ui-monospace, monospace;

  /* Layout */
  --sidebar-w: 220px;
  --cell-pad:  28px 32px;
}
```

---

## 12. Resumen en Una Frase

> Un dashboard de sistemas que parece la interfaz de control de un estudio de arquitectura a las 2am: oscuro, calido, denso en informacion, tipograficamente sofisticado, absolutamente cero decoracion innecesaria. Cada elemento comunica funcion. La belleza emerge de la restriccion.
