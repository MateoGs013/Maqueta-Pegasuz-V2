# Prompt: Design Direction

> Fase: Identity | Output: Direccion visual completa -> docs/design-brief.md
> Ejecutar con el perfil de marca de Discovery como input.
> Este prompt activa el skill `creative-design`.

---

## Prompt

```
Ejecuta /creative-design para el proyecto {{PROJECT_NAME}}.

Input del brand questionnaire:
- Personalidad: {{BRAND_PERSONALITY}}
- Rubro: {{INDUSTRY}}
- Publico: {{TARGET_AUDIENCE}}
- Nivel visual: {{VISUAL_LEVEL}}
- Anti-referencias: {{ANTI_REFERENCES}}
- URLs inspiracion: {{INSPIRATION_URLS}}

REQUERIMIENTOS:

1. PALETA unica — no puede repetir ninguna paleta usada en proyectos anteriores.
   Explorar territorios de color inesperados para el rubro.
   Justificar cada color con psicologia del color + aplicacion concreta.

2. TIPOGRAFIA unica — no puede repetir la misma combinacion.
   Explorar Google Fonts, Adobe Fonts, o foundries independientes.
   La eleccion debe reflejar la personalidad definida.

3. ATMOSFERA — definir que hace que este sitio se SIENTA diferente.
   No solo colores y tipografia. Texturas, efectos, profundidad, luz.
   Mapear cada tecnica atmosferica a una herramienta (CSS, Three.js, Canvas, SVG).

4. OUTPUT OBLIGATORIO:
   - Todos los tokens CSS listos para copiar-pegar
   - Fluid type scale con clamp()
   - Spacing scale completo
   - Shadows y radii
   - Responsive strategy por breakpoint
   - Technique-to-stack mapping

Guardar el resultado en docs/design-brief.md usando la template de docs/_templates/.
```

---

## Checklist de validacion

Despues de ejecutar, verificar:
- [ ] Paleta es unica (no repetida de otro proyecto)
- [ ] Tipografia es unica (no la misma combinacion)
- [ ] Contraste WCAG AA cumplido
- [ ] Tokens CSS son implementables (no abstractos)
- [ ] Atmosfera tiene mapeo tecnica->stack
- [ ] Responsive strategy cubre 4 breakpoints

## Ejemplos: buena vs mala salida

### Paleta de colores

**Mala:** "Usaremos azul como color principal porque transmite confianza."
(Generico. Que azul? Donde se usa? Cual es el contraste?)

**Buena:**
```css
--color-primary: #1a2b4a;     /* Navy profundo — bg principal dark mode. Transmite autoridad sin ser negro puro. */
--color-accent: #e8a838;       /* Amber calido — CTAs, highlights. Contraste 7.2:1 sobre primary. Max 10% superficie. */
--color-surface: #f5f0e8;      /* Cream — bg light sections. Calidez que evita el blanco clinico. */
```
(Valores exactos, tokens CSS, justificacion, contraste calculado, reglas de uso.)

### Tipografia

**Mala:** "Usaremos una fuente moderna para titulos y una legible para cuerpo."

**Buena:**
```css
--font-display: 'Fraunces', serif;     /* Variable font, opsz 9-144. Personalidad calida editorial. */
--font-body: 'Source Sans 3', sans-serif; /* x-height generosa, legible a 14px en mobile. */
--text-hero: clamp(2.5rem, 5vw + 1rem, 5rem);
--text-h1: clamp(2rem, 3vw + 1rem, 3.5rem);
```

---

## Industry-specific design territories

| Industria | Territorios de color tipicos | Atmosfera sugerida | Tipografia tendency |
|-----------|-----------------------------|--------------------|---------------------|
| Gastronomia | Earth tones, analogos calidos, negro + dorado | Texturas organicas, fotografia protagonista | Serif display + sans body |
| Fintech | Azules desaturados, monocromatico + accent neon | Limpio, grid patterns, data viz | Geometric sans + mono para numeros |
| Inmobiliaria luxury | Negro/blanco + metalicos, marfil + navy | Vignette, light leaks, espacios generosos | Serif elegante + sans thin |
| Salud/Bienestar | Pasteles, verdes suaves, azul cielo | Gradient mesh suave, mucho aire | Rounded sans, humanist |
| Moda | Monocromatico dramatico, tritono audaz | Film grain, contrastes fuertes | Display bold + minimal body |
| SaaS | Gradientes modernos, pasteles + accent vibrante | Illustrated, isometric, clean | Geometric sans, friendly |
| Educacion | Colores saturados pero no neon, calidos | Accesible, iconografico, claro | Humanist sans, alta legibilidad |

---

## Common errors

- **Elegir paletas seguras/genericas.** Azul + blanco + gris es la eleccion default. Debe haber una razon especifica para esta paleta, no solo "transmite confianza".
- **Tokens CSS abstractos.** Si el design-brief dice "azul vibrante" sin hex value, no es implementable. Cada token necesita un valor exacto.
- **Tipografia sin fluid scale.** Valores fijos (24px, 36px) en vez de clamp() generan saltos bruscos entre breakpoints.
- **Atmosfera sin mapeo tecnico.** Decir "queremos profundidad" sin especificar si es Three.js, CSS, o SVG deja la implementacion a la improvisacion.
- **No verificar contraste WCAG.** Una paleta hermosa que no pasa 4.5:1 de contraste es inutilizable para texto.
- **Copiar la paleta de un sitio de inspiracion.** Las URLs de inspiracion son para entender la SENSACION, no para copiar los hex values.

---

## Pipeline connection

```
Input: brand-questionnaire.md (personalidad, ejes, analogias, anti-ref)
     + competitive-analysis.md (oportunidades de diferenciacion)
Output de este prompt -> docs/design-brief.md
  Alimenta directamente:
    - copy-framework.md (tono visual para alinear copy)
    - page-planning.md (tokens de spacing, responsive strategy)
    - motion-personality.md (personalidad para elegir easing)
    - atmosphere-definition.md (si se profundiza atmosfera)
    - 3d-scope.md (palette para 3D, atmosfera target)
    - Toda la implementacion frontend (tokens CSS)
```

## Siguiente paso

Ejecutar `02-content/copy-framework.md`.
