# Design Brief: {{PROJECT_NAME}}

> Producido por `creative-design`. Este archivo es la fuente de verdad visual del proyecto.
> NO escribir codigo hasta que este archivo este completo y aprobado.

---

## 1. Identidad del proyecto

- **Nombre:** {{PROJECT_NAME}}
- **Rubro:** {{INDUSTRY}}
- **Publico objetivo:** {{TARGET_AUDIENCE}}
- **Personalidad de marca:** {{BRAND_PERSONALITY}} (ej: sofisticado, energetico, minimal, brutal)
- **Nivel de referencia:** {{REFERENCE_LEVEL}} (ej: Awwwards, FWA, nivel agencia top)

---

## 2. Paleta de colores

> Cada proyecto tiene paleta unica. NUNCA reutilizar de otro proyecto.

### Tokens CSS

```css
:root {
  /* Backgrounds */
  --color-bg-primary: ;        /* Fondo principal */
  --color-bg-secondary: ;      /* Fondo alternativo */
  --color-bg-elevated: ;       /* Cards, modales */
  --color-bg-overlay: ;        /* Overlays, backdrop */

  /* Text */
  --color-text-primary: ;      /* Texto principal */
  --color-text-secondary: ;    /* Texto secundario */
  --color-text-muted: ;        /* Texto terciario */
  --color-text-inverse: ;      /* Sobre fondos oscuros/claros */

  /* Accent */
  --color-accent-primary: ;    /* Accion principal, CTAs */
  --color-accent-hover: ;      /* Hover del accent */
  --color-accent-subtle: ;     /* Background sutil del accent */

  /* Semantic */
  --color-success: ;
  --color-warning: ;
  --color-error: ;

  /* Atmospheric */
  --color-glow: ;              /* Para efectos glow/bloom */
  --color-gradient-start: ;
  --color-gradient-end: ;
}
```

### Reglas de uso
- Accent: solo en CTAs, links activos, y highlights puntuales. No saturar.
- Contraste minimo: 4.5:1 para texto, 3:1 para elementos grandes (WCAG AA).
- Modo: {{DARK_MODE | LIGHT_MODE | BOTH}}

---

## 3. Tipografia

> Display + body + opcional mono/accent. Elegir segun personalidad.

### Scale (fluid clamp)

```css
:root {
  --font-display: '', serif;
  --font-body: '', sans-serif;
  --font-mono: '', monospace;     /* Opcional: datos, stats */

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

## 5. Radii, Shadows & Effects

```css
:root {
  --radius-sm: ;
  --radius-md: ;
  --radius-lg: ;
  --radius-xl: ;
  --radius-full: 9999px;

  --shadow-sm: ;
  --shadow-md: ;
  --shadow-lg: ;
  --shadow-glow: ;         /* Glow del accent color */

  /* Atmospheric effects */
  --grain-opacity: ;        /* 0 = sin grain, 0.03-0.05 = sutil */
  --blur-backdrop: ;        /* Para glassmorphism, si aplica */
}
```

---

## 6. Sistema atmosferico

> Que hace que este proyecto se SIENTA diferente. No solo colores y tipografia.

### Tecnicas atmosfericas seleccionadas

| Tecnica | Aplicacion | Intensidad |
|---------|-----------|-----------|
| {{TECHNIQUE_1}} | {{WHERE}} | {{LOW/MED/HIGH}} |
| {{TECHNIQUE_2}} | {{WHERE}} | {{LOW/MED/HIGH}} |
| {{TECHNIQUE_3}} | {{WHERE}} | {{LOW/MED/HIGH}} |

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

### Mapeo tecnica -> stack

| Tecnica | Implementacion |
|---------|---------------|
| {{TECHNIQUE}} | {{CSS / Canvas / Three.js / SVG / GSAP}} |

---

## 7. Responsive strategy

| Breakpoint | Ancho | Cambios principales |
|-----------|-------|-------------------|
| Mobile | < 768px | {{CHANGES}} |
| Tablet | 768-1024px | {{CHANGES}} |
| Desktop | > 1024px | {{CHANGES}} |
| Wide | > 1440px | {{CHANGES}} |

---

## 8. Component tokens (pre-definidos)

### Buttons
```css
.btn-primary { /* Accent bg, inverse text, radius, shadow */ }
.btn-secondary { /* Ghost/outline, accent border, accent text */ }
.btn-ghost { /* No bg, text only, underline hover */ }
```

### Cards
```css
.card { /* Elevated bg, radius-lg, shadow-md, padding-lg */ }
.card:hover { /* Shadow-lg, subtle scale or glow */ }
```

### Inputs
```css
.input { /* Bg secondary, border subtle, radius-md, focus ring accent */ }
```

---

## Checklist de aprobacion

- [ ] Paleta NO repite colores de otro proyecto
- [ ] Tipografia NO repite combo de otro proyecto
- [ ] Contraste WCAG AA cumplido (4.5:1 texto, 3:1 elementos)
- [ ] Atmosfera es coherente con el rubro y la personalidad
- [ ] Responsive strategy definida para los 4 breakpoints
- [ ] Tokens CSS listos para implementar (no valores abstractos)
- [ ] Mapeo tecnica-stack definido para cada efecto especial
