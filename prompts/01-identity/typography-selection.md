# Prompt: Typography Selection

> Fase: Identity | Output: Sistema tipografico completo
> Usar como complemento a design-direction para profundizar en tipografia.

---

## Prompt

```
Necesito un sistema tipografico UNICO para {{PROJECT_NAME}}.

CONTEXTO:
- Personalidad de marca: {{PERSONALITY}}
- Nivel visual: {{VISUAL_LEVEL}}
- El sitio es: {{SITE_TYPE}} (landing, app, editorial, portfolio)

SELECCIONAR:

1. DISPLAY FONT (headlines, hero, titulos de seccion)
   - Serif, sans-serif, o display/decorativa?
   - Personalidad que transmite?
   - Pesos necesarios (regular + bold minimo)
   - Fuente: Google Fonts / Adobe Fonts / CDN

2. BODY FONT (parrafos, UI, labels, buttons)
   - Legibilidad en pantalla es PRIORIDAD
   - x-height generosa
   - Pesos: 400, 500, 600 minimo
   - Debe contrastar con la display pero no chocar

3. MONO FONT (opcional: datos, stats, precios, code)
   - Solo si el proyecto muestra numeros o datos prominentes
   - JetBrains Mono, Fira Code, IBM Plex Mono, etc.

COMBINACIONES A EXPLORAR (no limitarse a estas):

| Display | Body | Vibe |
|---------|------|------|
| Playfair Display | Inter | Classic premium |
| Space Grotesk | DM Sans | Modern tech |
| Fraunces | Source Sans 3 | Warm editorial |
| Clash Display | Satoshi | Bold contemporary |
| Cormorant | Nunito | Elegant + friendly |
| Syne | Work Sans | Creative agency |
| Cabinet Grotesk | General Sans | Clean modern |
| PP Neue Montreal | PP Mori | Swiss minimalism |
| Instrument Serif | Instrument Sans | Cohesive editorial |
| Bricolage Grotesque | Geist | Tech-warm |

DEFINIR:
- Fluid type scale con clamp() (8 niveles: xs a hero)
- Weights por uso (headlines, body, captions, labels)
- Letter-spacing por nivel (tight para grandes, normal para body)
- Line-height por contexto (tight para headlines, relaxed para body)

OUTPUT: tokens CSS listos para implementar.
```

---

## Ejemplos: buena vs mala seleccion

### Para una firma de abogados boutique

**Mala:** "Usaremos Inter para todo porque es segura y legible."
(Sin personalidad. Inter es excelente para UI pero no dice nada sobre la marca. Es la "no-decision".)

**Buena:**
```css
--font-display: 'Cormorant Garamond', serif;  /* Autoridad clasica, ligatures elegantes. Weight 600 para headlines. */
--font-body: 'Inter', sans-serif;              /* Legibilidad funcional para parrafos legales largos. Weight 400/500. */
--font-mono: 'JetBrains Mono', monospace;      /* Para cifras en stats: $2.5M recuperados. */

--text-hero: clamp(3rem, 6vw + 1rem, 6rem);   /* Cormorant brilla en grande. */
--text-h1: clamp(2rem, 3.5vw + 0.5rem, 3.5rem);
--text-h2: clamp(1.5rem, 2vw + 0.5rem, 2.25rem);
--text-body: clamp(1rem, 0.5vw + 0.875rem, 1.125rem);
--text-small: clamp(0.8rem, 0.3vw + 0.75rem, 0.875rem);

--tracking-tight: -0.02em;    /* Headlines grandes */
--tracking-normal: 0;          /* Body text */
--tracking-wide: 0.05em;       /* Labels, captions, uppercase */

--leading-tight: 1.1;          /* Hero headlines */
--leading-snug: 1.3;           /* Subheadings */
--leading-relaxed: 1.6;        /* Body copy */
```
(Display con personalidad, body funcional, scale fluid completo, tracking y leading definidos.)

---

## Pairings por industria

| Industria | Display recomendado | Body recomendado | Por que |
|-----------|--------------------|--------------------|---------|
| Gastronomia fine dining | Playfair Display, Cormorant | DM Sans, Source Sans 3 | Serif clasica evoca tradicion culinaria |
| Gastronomia casual | Bricolage Grotesque, Syne | Inter, Work Sans | Geometrica friendly = accesible y divertido |
| Inmobiliaria luxury | Instrument Serif, Noto Serif Display | Instrument Sans, Inter | Serif con tracking wide = exclusividad |
| Fintech | Space Grotesk, Outfit | DM Sans, Inter | Geometrica moderna = precision y confianza |
| Salud/Bienestar | Nunito, Quicksand | Source Sans 3, Lato | Rounded = amigable, no intimidante |
| Moda | Clash Display, PP Neue Montreal | General Sans, Satoshi | Bold display = statement, editorial |
| Educacion | Cabinet Grotesk, Geist | Inter, Source Sans 3 | Clara, sin distracciones, alta legibilidad |
| Legal/Consulting | Cormorant, EB Garamond | Inter, IBM Plex Sans | Serif clasica = autoridad y tradicion |

---

## Common errors

- **Usar mas de 3 familias tipograficas.** Cada font es un HTTP request y un peso visual adicional. 2 es ideal, 3 es el maximo.
- **Display font con mala legibilidad en tamanhos chicos.** La display font es para titulos GRANDES. Si la usas en body, es ilegible. Verificar a 14px.
- **No definir la fluid scale con clamp().** Valores fijos como `font-size: 36px` causan saltos bruscos. Clamp() interpola suavemente entre breakpoints.
- **Olvidar letter-spacing por nivel.** Headlines grandes necesitan tracking negativo (-0.02em). Text chico o uppercase necesita tracking positivo (0.05em). Sin esto, todo se ve amateur.
- **Cargar demasiados weights.** Cada weight es ~20-40KB. Cargar 100-900 en 9 weights cuando solo usas 400/500/700 es desperdicio de performance.
- **No testear con el idioma real del sitio.** Si el sitio es en espanol, testear con acentos, enhe, y palabras largas. Algunos fonts tienen mal soporte de caracteres latinos extendidos.
- **Combinar dos fonts del mismo genero sin contraste.** Dos sans-serif geometricas juntas no generan jerarquia visual. El pairing necesita contraste (serif+sans, rounded+geometric, etc.).

---

## Pipeline connection

```
Input: brand-questionnaire.md (personalidad) + design-direction.md (nivel visual)
Output de este prompt -> Sistema tipografico con tokens CSS
  Se integra en: docs/design-brief.md seccion 3
  Alimenta: todos los componentes (font-family, font-size, tracking, leading)
```

## Siguiente paso

Integrar tipografia en `docs/design-brief.md` seccion 3.
