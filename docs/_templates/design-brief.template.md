# Design Brief: {{PROJECT_NAME}}

> Producido por `creative-design`. Este archivo es la fuente de verdad visual del proyecto.
> NO escribir codigo hasta que este archivo este completo y aprobado.

---

## 1. Identidad del proyecto

- **Nombre:** {{PROJECT_NAME}}
- **Rubro:** {{INDUSTRY}}
- **Ubicacion / mercado:** {{LOCATION}} (ej: Barcelona, global, LATAM, New York)
- **Publico objetivo:** {{TARGET_AUDIENCE}}
- **Personalidad de marca:** {{BRAND_PERSONALITY}} (ej: sofisticado, energetico, minimal, brutal)
- **Nivel de referencia:** {{REFERENCE_LEVEL}} (ej: Awwwards, FWA, nivel agencia top, galeria de arte, editorial de lujo)
- **Keywords visuales:** {{VISUAL_KEYWORDS}} (ej: "oscuridad dorada", "brutalismo industrial", "naturaleza organica")
- **Sitios de referencia (si hay):** {{REFERENCE_SITES}} (URLs de inspiracion visual, o "ninguno")

---

## 2. Paleta de colores

> Cada proyecto tiene paleta unica. NUNCA reutilizar de otro proyecto.

### Tokens CSS

```css
:root {
  /* Backgrounds */
  --color-bg-primary: ;        /* Fondo principal */
  --color-bg-secondary: ;      /* Fondo alternativo para secciones */
  --color-bg-elevated: ;       /* Cards, modales, popups */
  --color-bg-overlay: ;        /* Overlays, backdrop (incluir alpha) */
  --color-bg-inverse: ;        /* Fondos invertidos para contraste */

  /* Text */
  --color-text-primary: ;      /* Texto principal */
  --color-text-secondary: ;    /* Texto secundario */
  --color-text-muted: ;        /* Texto terciario */
  --color-text-inverse: ;      /* Sobre fondos oscuros/claros */

  /* Accent */
  --color-accent-primary: ;    /* Accion principal, CTAs */
  --color-accent-hover: ;      /* Hover del accent */
  --color-accent-subtle: ;     /* Background sutil del accent (10-15% opacity) */
  --color-accent-secondary: ;  /* Segundo acento (complementario o analogous) */

  /* Borders & Dividers */
  --color-border-default: ;    /* Bordes de inputs, cards */
  --color-border-subtle: ;     /* Divisores sutiles entre secciones */
  --color-border-strong: ;     /* Bordes de enfasis */

  /* Semantic */
  --color-success: ;
  --color-warning: ;
  --color-error: ;

  /* Atmospheric */
  --color-glow: ;              /* Para efectos glow/bloom */
  --color-gradient-start: ;
  --color-gradient-mid: ;      /* Punto medio (opcional, para gradientes 3-stop) */
  --color-gradient-end: ;

  /* Selection & scrollbar */
  --color-selection-bg: ;      /* ::selection background */
  --color-selection-text: ;    /* ::selection text */
  --color-scrollbar-track: ;   /* Scrollbar track (luxury sites SIEMPRE personalizan) */
  --color-scrollbar-thumb: ;   /* Scrollbar thumb */
}
```

### Reglas de uso
- Accent primary: solo en CTAs, links activos, y highlights puntuales. No saturar.
- Accent secondary: para variacion visual (hover alternativo, tags, badges). Maximo 2 acentos.
- Contraste minimo: 4.5:1 para texto, 3:1 para elementos grandes (WCAG AA).
- Borders: usar para separar contenido sin recurrir a sombras en exceso.
- Modo: {{DARK_MODE | LIGHT_MODE | BOTH}}

### Gradientes reutilizables

> Definir gradientes como clases o custom properties para consistencia.

```css
:root {
  --gradient-primary: linear-gradient({{DIRECTION}}, var(--color-gradient-start), var(--color-gradient-end));
  --gradient-hero: {{GRADIENT_RULE}};     /* Gradiente especifico del hero (puede ser radial, conic, etc.) */
  --gradient-overlay: {{GRADIENT_RULE}};  /* Para overlays sobre imagenes */
}
```

### Dark mode overrides (si modo = BOTH)

> Si el proyecto soporta ambos modos, documentar las variaciones. Si es solo dark o solo light, eliminar esta seccion.

```css
[data-theme="dark"] {
  --color-bg-primary: ;
  --color-bg-secondary: ;
  --color-text-primary: ;
  --color-text-secondary: ;
  /* Solo documentar tokens que CAMBIAN. Los que no cambian, se omiten. */
}
```

---

## 3. Tipografia

> Display + body + opcional mono/accent. Elegir segun personalidad.

### Fuentes seleccionadas

| Rol | Familia | Fuente | Weights usados |
|-----|---------|--------|----------------|
| Display | {{DISPLAY_FONT}} | Google Fonts / Self-hosted / Adobe | {{WEIGHTS}} |
| Body | {{BODY_FONT}} | Google Fonts / Self-hosted / Adobe | {{WEIGHTS}} |
| Mono (opcional) | {{MONO_FONT}} | Google Fonts / Self-hosted / Adobe | {{WEIGHTS}} |

### Scale (fluid clamp)

```css
:root {
  --font-display: '{{DISPLAY_FONT}}', {{FALLBACK}};
  --font-body: '{{BODY_FONT}}', {{FALLBACK}};
  --font-mono: '{{MONO_FONT}}', monospace;     /* Opcional: datos, stats */

  /* Scale fluid */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.6vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
  --text-3xl: clamp(2rem, 1.5rem + 2.5vw, 3rem);
  --text-4xl: clamp(2.5rem, 1.8rem + 3.5vw, 4rem);
  --text-hero: clamp(3rem, 2rem + 5vw, 6rem);

  /* Weights */
  --weight-light: 300;
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Tracking */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;
  --tracking-wider: 0.1em;

  /* Leading */
  --leading-tight: 1.1;
  --leading-snug: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Reglas
- Display font: para headlines, hero, titulos de seccion
- Body font: para parrafos, UI, labels
- Mono: para datos numericos, stats, precios (opcional)
- Heading hierarchy: h1 = text-hero, h2 = text-4xl, h3 = text-2xl, h4 = text-xl

---

## 4. Spacing & Layout

```css
:root {
  --space-unit: 8px;
  --space-xs: calc(var(--space-unit) * 0.5);    /* 4px */
  --space-sm: var(--space-unit);                  /* 8px */
  --space-md: calc(var(--space-unit) * 2);        /* 16px */
  --space-lg: calc(var(--space-unit) * 3);        /* 24px */
  --space-xl: calc(var(--space-unit) * 4);        /* 32px */
  --space-2xl: calc(var(--space-unit) * 6);       /* 48px */
  --space-3xl: calc(var(--space-unit) * 8);       /* 64px */
  --space-4xl: calc(var(--space-unit) * 12);      /* 96px */
  --space-section: calc(var(--space-unit) * 16);  /* 128px */

  --container-max: 1280px;
  --container-narrow: 960px;
  --container-wide: 1440px;
  --container-padding: var(--space-lg);
}
```

---

## 5. Radii, Shadows, Borders & Effects

```css
:root {
  /* Radii */
  --radius-sm: ;
  --radius-md: ;
  --radius-lg: ;
  --radius-xl: ;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: ;
  --shadow-md: ;
  --shadow-lg: ;
  --shadow-glow: ;         /* Glow del accent color */

  /* Borders */
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-width-thick: 3px;
  --border-style: solid;     /* solid, dashed, etc. */

  /* Transitions (defaults para hover, focus) */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
  --transition-easing: cubic-bezier({{VALUES}});  /* Easing signature del proyecto */

  /* Z-index scale */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;

  /* Atmospheric effects */
  --grain-opacity: ;        /* 0 = sin grain, 0.03-0.05 = sutil */
  --blur-backdrop: ;        /* Para glassmorphism, si aplica */
}
```

---

## 6. Image treatment

> Como se muestran las imagenes en este proyecto.

- **Aspect ratios principales:** {{RATIOS}} (ej: 16:9 para heros, 4:3 para cards, 1:1 para avatars)
- **Filtro por defecto:** {{FILTER}} (ej: ninguno, grayscale, sepia sutil, saturacion reducida)
- **Filtro hover (si cambia):** {{FILTER_HOVER}} (ej: grayscale -> color, saturacion normal, ninguno)
- **Bordes/radii en imagenes:** {{IMAGE_RADIUS}} (ej: radius-md, sin radius, clip-path custom)
- **Hover en imagenes:** {{IMAGE_HOVER}} (ej: scale 1.05, overlay con color, filtro de color)
- **Hover transition duration:** {{IMAGE_HOVER_DURATION}} (ej: 0.4s, 0.6s — usar --transition-slow o custom)
- **Overlay color (sobre imagenes):** {{IMAGE_OVERLAY}} (ej: rgba(0,0,0,0.4), gradient, ninguno)
- **Placeholder/loading:** {{IMAGE_PLACEHOLDER}} (ej: blur hash, color solido del bg-secondary, skeleton)
- **Max image width:** {{MAX_IMAGE_WIDTH}} (ej: container-max, 100%, 800px para blog)

---

## 7. Sistema atmosferico

> Que hace que este proyecto se SIENTA diferente. No solo colores y tipografia.

### Tecnicas atmosfericas seleccionadas

| Tecnica | Aplicacion | Intensidad | Por que |
|---------|-----------|-----------|---------|
| {{TECHNIQUE_1}} | {{WHERE}} | {{LOW/MED/HIGH}} | {{JUSTIFICATION}} |
| {{TECHNIQUE_2}} | {{WHERE}} | {{LOW/MED/HIGH}} | {{JUSTIFICATION}} |
| {{TECHNIQUE_3}} | {{WHERE}} | {{LOW/MED/HIGH}} | {{JUSTIFICATION}} |

Opciones disponibles:
- Film grain overlay
- Glow orbs / bokeh particles
- Gradient mesh backgrounds
- Scan lines / CRT effect
- Noise textures
- Glassmorphism
- Aurora / nebula backgrounds
- Grid patterns
- Dot matrix
- Halftone
- Light leak / lens flare
- Vignette

### Mapeo tecnica -> stack

| Tecnica | Implementacion | Notas |
|---------|---------------|-------|
| {{TECHNIQUE_1}} | {{CSS / Canvas / Three.js / SVG / GSAP}} | {{NOTAS}} |
| {{TECHNIQUE_2}} | {{CSS / Canvas / Three.js / SVG / GSAP}} | {{NOTAS}} |
| {{TECHNIQUE_3}} | {{CSS / Canvas / Three.js / SVG / GSAP}} | {{NOTAS}} |

---

## 8. Responsive strategy

| Breakpoint | Ancho | Cambios principales | Tipografia | Layout | Motion |
|-----------|-------|-------------------|-----------|--------|--------|
| Mobile | < 768px | {{CHANGES}} | {{FONT_CHANGES}} | {{LAYOUT_CHANGES}} | {{MOTION_CHANGES}} |
| Tablet | 768-1024px | {{CHANGES}} | {{FONT_CHANGES}} | {{LAYOUT_CHANGES}} | {{MOTION_CHANGES}} |
| Desktop | > 1024px | {{CHANGES}} | {{FONT_CHANGES}} | {{LAYOUT_CHANGES}} | {{MOTION_CHANGES}} |
| Wide | > 1440px | {{CHANGES}} | {{FONT_CHANGES}} | {{LAYOUT_CHANGES}} | {{MOTION_CHANGES}} |

Notas responsive:
- Container padding: mobile {{VALUE}}, tablet {{VALUE}}, desktop {{VALUE}}
- Grid columns: mobile {{VALUE}}, tablet {{VALUE}}, desktop {{VALUE}}
- Section spacing: mobile {{VALUE}}, desktop {{VALUE}}

---

## 9. Component tokens (pre-definidos)

### Buttons
```css
.btn-primary {
  background: var(--color-accent-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-{{SIZE}});
  padding: var(--space-{{V}}) var(--space-{{H}});
  font-weight: var(--weight-{{WEIGHT}});
  transition: var(--transition-base);
}
.btn-primary:hover { /* {{HOVER_EFFECT}} */ }
.btn-primary:focus-visible { /* {{FOCUS_RING}} */ }

.btn-secondary { /* Ghost/outline: accent border, accent text */ }
.btn-ghost { /* No bg, text only, underline or opacity hover */ }
```

### Cards
```css
.card {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-{{SIZE}});
  box-shadow: var(--shadow-{{SIZE}});
  padding: var(--space-{{SIZE}});
  border: var(--border-width-thin) var(--border-style) var(--color-border-subtle);
}
.card:hover { /* {{HOVER_EFFECT}} */ }
```

### Inputs
```css
.input {
  background: var(--color-bg-secondary);
  border: var(--border-width-thin) var(--border-style) var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
}
.input:focus { /* border-color: var(--color-accent-primary); ring */ }
```

### Navigation / Header
```css
.nav {
  background: {{NAV_BG}};              /* ej: transparent -> solid on scroll, blur backdrop, solid */
  height: {{NAV_HEIGHT}};              /* ej: 72px desktop, 56px mobile */
  padding: {{NAV_PADDING}};
  position: {{NAV_POSITION}};          /* ej: fixed, sticky */
  backdrop-filter: {{NAV_BACKDROP}};   /* ej: blur(12px), none */
  border-bottom: {{NAV_BORDER}};       /* ej: 1px solid var(--color-border-subtle), none */
  transition: {{NAV_TRANSITION}};      /* ej: background 0.3s ease, all 0.3s */
}
/* Scroll state: que cambia al scrollear (bg solido, shadow, height reduce) */
.nav--scrolled { /* {{SCROLL_STATE}} */ }
```

### Links
```css
a {
  color: var(--color-accent-primary);
  text-decoration: {{LINK_DECORATION}};          /* ej: none, underline */
  text-decoration-thickness: {{LINK_THICKNESS}};  /* ej: 1px, 2px (si tiene underline) */
  text-underline-offset: {{LINK_OFFSET}};         /* ej: 4px */
  transition: var(--transition-fast);
}
a:hover { /* {{LINK_HOVER}} */ }
a:focus-visible { /* {{LINK_FOCUS}} */ }
```

### Loader / Spinner (site-wide preloader)
```css
/* Estilo del loading state global del sitio */
.loader {
  background: var(--color-bg-primary);
  /* Tipo: {{LOADER_TYPE}} (ej: minimal bar, logo animation, spinner, text shimmer) */
  /* Accent: usa --color-accent-primary */
}
```

---

## 10. Scrollbar styling

> Proyectos premium siempre personalizan el scrollbar. Omitir para proyectos utility.

```css
::-webkit-scrollbar { width: {{SCROLLBAR_WIDTH}}; /* ej: 8px, 6px, 4px */ }
::-webkit-scrollbar-track { background: var(--color-scrollbar-track); }
::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb);
  border-radius: {{SCROLLBAR_RADIUS}};  /* ej: 4px, 9999px */
}
/* Firefox */
html { scrollbar-width: {{SCROLLBAR_FF_WIDTH}}; /* thin, auto */ scrollbar-color: var(--color-scrollbar-thumb) var(--color-scrollbar-track); }
```

---

## Checklist de aprobacion

- [ ] Paleta NO repite colores de otro proyecto
- [ ] Tipografia NO repite combo de otro proyecto
- [ ] Fuentes documentadas (Google Fonts / self-hosted / Adobe)
- [ ] Contraste WCAG AA cumplido (4.5:1 texto, 3:1 elementos)
- [ ] Atmosfera es coherente con el rubro y la personalidad
- [ ] Responsive strategy definida para los 4 breakpoints con detalle
- [ ] Tokens CSS listos para implementar (no valores abstractos)
- [ ] Mapeo tecnica-stack definido para cada efecto especial
- [ ] Z-index scale definida
- [ ] Transition tokens definidos
- [ ] Image treatment documentado (incluyendo overlay, hover duration, max width)
- [ ] Borders/dividers tokens definidos
- [ ] Component tokens tienen focus states
- [ ] Navigation/Header tokens definidos (bg, height, scroll state, backdrop)
- [ ] Link styling defaults definidos (decoration, thickness, offset)
- [ ] Scrollbar styling definido (o marcado como "browser default" si no aplica)
- [ ] Selection colors definidos (::selection)
- [ ] Gradientes reutilizables definidos (hero, overlay, primary)
- [ ] Loader/preloader style definido
- [ ] Dark mode overrides documentados (si modo = BOTH) o seccion eliminada
