# Guide: Design-First Methodology

> Por que y como aplicar design-first en cada proyecto.
> **Contexto:** Esta es la filosofia core de la maqueta. Leer antes de construir cualquier cosa.
> **Prerequisito:** [00-project-init](00-project-init.md) para el flujo completo.

---

## El principio

**No escribir CSS, no elegir colores, no definir spacing, no animar sin antes tener un plan de creative-design.**

El plan es el brief. El codigo es la ejecucion del brief.

---

## Por que design-first

| Sin brief | Con brief |
|-----------|----------|
| Colores elegidos al azar | Paleta justificada y unica |
| Tipografia "la de siempre" | Combinacion seleccionada por personalidad |
| Spacing inconsistente | Scale de 8px con tokens definidos |
| Motion generico (fade up) | Coreografia con personalidad |
| "Uh, le falta algo" | Atmosfera definida y coherente |
| Resultado: sitio template | Resultado: sitio con identidad |

**En la practica, esto significa:**

```
SIN design-first:
  "Voy a hacer la landing" -> elige un azul -> pone Inter ->
  padding 20px -> fade-up en todo -> resultado generico

CON design-first:
  "Voy a hacer la landing" -> lee design-brief.md ->
  --color-accent: #c4a35a (dorado del brief) ->
  --font-display: 'Cormorant Garamond' (del brief) ->
  --space-section: var(--space-4xl) (del brief) ->
  Hero: text-reveal con clip-path (del motion-spec) ->
  resultado: identidad propia
```

---

## El flujo paso a paso

### Paso 1: Entender (Discovery)

```
Ejecutar: prompts/00-discovery/client-intake.md
                                competitive-analysis.md
                                brand-questionnaire.md

Output: Quien es el cliente, que quiere, como se ve, en que se diferencia.
```

### Paso 2: Documentar (Foundation Docs)

```
Crear en este orden:

  1. docs/content-brief.md    <- Copy especifico del cliente
     Prompt: prompts/02-content/copy-framework.md

  2. docs/design-brief.md     <- Identidad visual completa
     Prompt: prompts/01-identity/design-direction.md
     Skill: creative-design

  3. docs/page-plans.md       <- Secciones por pagina
     Prompt: prompts/03-architecture/page-planning.md

  4. docs/motion-spec.md      <- Coreografia de animaciones
     Prompt: prompts/04-motion/motion-personality.md
```

### Paso 3: Tokenizar (Design System)

```
Input:  docs/design-brief.md
Output: src/styles/tokens.css

Ejemplo:
  Brief dice: "Accent color: #ff6b35 (Warm Tangerine)"
  Token:      --color-accent-primary: #ff6b35;

  Brief dice: "Display font: Playfair Display, weights 400/700"
  Token:      --font-display: 'Playfair Display', serif;

  Brief dice: "Spacing base 8px"
  Tokens:     --space-xs: 4px; --space-sm: 8px; ... --space-4xl: 96px;
```

### Paso 4: Construir (Implementar)

```
Cada linea de CSS referencia un token:
  color: var(--color-accent-primary);    NO: color: #ff6b35;
  font-family: var(--font-display);      NO: font-family: 'Playfair Display';
  padding: var(--space-lg);              NO: padding: 24px;

Cada animacion referencia el motion-spec:
  Hero: stagger reveal (motion-spec section 1)    NO: inventar un fade-up
  Cards: hover tilt (motion-spec interactions)     NO: "le pongo un scale"

Cada seccion referencia el page-plan:
  Section 3 = "Process" con 4 pasos               NO: "le agrego una seccion mas"
```

### Paso 5: Verificar (Audit)

```
Cada pixel tiene referencia al brief:
  Este color -> design-brief.md linea X
  Esta animacion -> motion-spec.md seccion Y
  Este copy -> content-brief.md seccion Z
```

---

## Reglas inviolables

### Identidad unica, siempre

- NUNCA reutilizar la paleta de otro proyecto
- NUNCA reutilizar la combinacion tipografica de otro proyecto
- NUNCA defaultear a "dark + warm accent + power3.out + grain"
- Cada proyecto es una identidad nueva

**Test rapido:** Si alguien puede confundir este sitio con otro que hiciste, la identidad no es unica.

### Variacion de animacion, siempre

- NUNCA el mismo fade-up en todas las secciones
- Cada seccion usa una tecnica diferente
- El motion tiene personalidad propia (no generico)

**Ejemplo de variacion correcta:**
```
Section 1: Text reveal con clip-path
Section 2: Parallax con scroll-driven
Section 3: Cards con stagger y hover tilt
Section 4: Counter animation con scrub
Section 5: Image reveal con mask
Section 6: CTA con glow pulse
```

**Ejemplo de variacion incorrecta:**
```
Section 1: fade-up, opacity 0 -> 1, y: 32 -> 0
Section 2: fade-up, opacity 0 -> 1, y: 32 -> 0
Section 3: fade-up, opacity 0 -> 1, y: 32 -> 0
(Repetitivo, sin personalidad)
```

### 3D/WebGL, siempre

- CADA proyecto incluye al menos un elemento 3D
- Tier 1 minimo: shader atmosferico o campo de particulas
- 3D es herramienta de inmersion, no decoracion

> Ver [skill-dispatch-table](skill-dispatch-table.md) para el skill `threejs-3d`.

### Tokens sobre valores, siempre

```css
/* CORRECTO: tokens del design-brief */
.hero-title {
  color: var(--color-text-primary);
  font-family: var(--font-display);
  font-size: var(--text-hero);
  padding: var(--space-3xl) var(--space-xl);
}

/* INCORRECTO: valores hardcodeados */
.hero-title {
  color: #f5f5f0;
  font-family: 'Playfair Display', serif;
  font-size: 4.5rem;
  padding: 64px 32px;
}
```

Si un valor no tiene token, crear el token primero en `src/styles/tokens.css` y luego usarlo.

---

## Como verificar que se esta siguiendo el brief

| Pregunta | Si la respuesta es "no" | Accion |
|----------|----------------------|--------|
| Este color esta en el design-brief? | Cambiar al token correcto | `grep "color" docs/design-brief.md` |
| Esta tipografia esta en el design-brief? | Cambiar a la font correcta | `grep "font" docs/design-brief.md` |
| Esta animacion esta en el motion-spec? | Definirla o cambiarla | `grep "section" docs/motion-spec.md` |
| Este copy esta en el content-brief? | Agregar al brief primero | `grep "headline" docs/content-brief.md` |
| Esta seccion esta en el page-plan? | Agregarla al plan primero | `grep "Section" docs/page-plans.md` |

---

## Relacion con otras guias

- [00-project-init](00-project-init.md) -- Como crear los foundation docs
- [01-pipeline-overview](01-pipeline-overview.md) -- Donde encaja design-first en el pipeline
- [04-quality-standards](04-quality-standards.md) -- Como se audita que se cumpla el brief
- [skill-dispatch-table](skill-dispatch-table.md) -- Skills `creative-design`, `css-review`
