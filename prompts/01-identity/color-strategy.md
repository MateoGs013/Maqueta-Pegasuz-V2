# Prompt: Color Strategy

> Fase: Identity | Output: Paleta de colores justificada y unica
> Usar como complemento a design-direction si se necesita profundizar en color.

---

## Prompt

```
Necesito una estrategia de color UNICA para {{PROJECT_NAME}}.

CONTEXTO:
- Rubro: {{INDUSTRY}}
- Personalidad: {{PERSONALITY}}
- Modo: {{DARK/LIGHT/BOTH}}
- Anti-referencia: no quiero que se parezca a {{ANTI_REF}}

EXPLORAR estos territorios de color (elegir el mas apropiado):

| Territorio | Cuando usar | Ejemplo |
|-----------|------------|---------|
| Monocromatico + accent potente | Premium, minimal | Negro/gris + un color electrico |
| Analogos calidos | Calido, humano, organico | Terracota, salmon, ocre |
| Analogos frios | Tech, sereno, profesional | Slate, cyan, lavender |
| Complementarios de alto contraste | Audaz, energetico | Navy + amber, emerald + coral |
| Tritono | Experimental, creativo | Teal, magenta, lime |
| Earth tones | Natural, artesanal, sostenible | Forest, clay, cream |
| Neon sobre oscuro | Cyberpunk, tech, nightlife | Negros + neon pink/green/cyan |
| Pasteles sobre claro | Friendly, accesible, SaaS | Lavender, mint, peach |
| Metalicos | Luxury, premium, exclusivo | Gold, silver, copper tones |

PARA CADA COLOR definir:
1. Hex value exacto
2. Token CSS (--color-*)
3. Donde se usa (bg, text, accent, semantic)
4. Ratio de contraste con su fondo (WCAG)
5. Por que este color (psicologia + aplicacion)

REGLAS:
- Minimo: 1 bg, 1 text, 1 accent. Maximo: paleta de 12 tokens.
- El accent NO puede estar en mas del 15% de la superficie visual.
- Neutral tones: al menos 3 niveles (muted, secondary, primary).
- Debe funcionar en 4K y en mobile sin perder impacto.

OUTPUT: tabla de tokens CSS listos para usar.
```

---

## Ejemplos: buena vs mala paleta

### Para un restaurante de cocina japonesa contemporanea

**Mala:**
```
Primario: #000000 (negro)
Secundario: #FF0000 (rojo)
Terciario: #FFFFFF (blanco)
```
(Cliche. Rojo + negro = "sushi generico". Sin matices, sin tokens, sin justificacion.)

**Buena:**
```css
--color-bg-primary: #0f0f0f;      /* Carbon — no negro puro, evita fatiga visual */
--color-bg-warm: #1a1614;          /* Sumi ink — calidez sutil del washi paper */
--color-text-primary: #e8e0d4;     /* Kinari (crudo) — blanco japones, no clinico */
--color-accent: #c45a3c;           /* Bengara — terracota japonesa, no el rojo chino esperado */
--color-accent-subtle: #8b7355;    /* Kitsune — dorado apagado para highlights secundarios */
/* Contraste bengara sobre carbon: 5.8:1 PASS AA */
/* Contraste kinari sobre carbon: 12.1:1 PASS AAA */
```
(Cada color tiene nombre evocador, hex exacto, token CSS, contraste calculado, y razon cultural.)

---

## Territorios de color por industria

| Industria | Territorios mas efectivos | Evitar |
|-----------|--------------------------|--------|
| Gastronomia fine dining | Earth tones, negro + metalicos, analogos calidos | Rojo + negro generico, colores de fast food |
| Gastronomia casual | Colores saturados calidos, pasteles terrosos | Negro excesivo, paletas frias |
| Fintech B2B | Monocromatico frio + accent funcional | Neon sobre oscuro (demasiado crypto), colores juguetones |
| Fintech consumer | Gradientes modernos, accent vibrante | Paletas demasiado corporate/bancarias |
| Inmobiliaria luxury | Neutros + metalicos, navy + marfil | Colores brillantes, azul inmobiliario generico |
| Inmobiliaria general | Azul/verde desaturado + accent calido | Rojo/naranja agresivo, paletas oscuras |
| Salud clinica | Azul cielo + blanco + accent verde | Rojo (asocia sangre), negro excesivo |
| Bienestar/spa | Verdes suaves, lavanda, cream | Colores saturados, contrastes agresivos |
| E-commerce moda | Monocromatico + accent segun temporada | Demasiados colores compitiendo con producto |
| SaaS | Purpura/indigo + accent vibrante | Paletas de una sola empresa conocida (no copiar Stripe/Linear) |

---

## Common errors

- **Elegir colores favoritos en vez de colores estrategicos.** El gusto personal no es un brief de diseno. Cada color necesita justificacion de rubro + psicologia + aplicacion.
- **No definir suficientes neutrales.** Una paleta con 3 colores vibrantes pero sin grises intermedios es inutilizable para UI.
- **Olvidar el modo opuesto.** Si el sitio es dark mode, los colores deben funcionar sobre fondos oscuros. Definir los tokens para ambos modos si aplica.
- **Accent que ocupa demasiada superficie.** Un accent neon al 40% de la pantalla deja de ser accent y se convierte en agresion visual. Regla: max 10-15%.
- **No testear con contenido real.** Una paleta que se ve hermosa en un cuadrado abstracto puede no funcionar cuando hay texto, botones, cards, e imagenes compitiendo.
- **Confundir hex con percepcion.** Dos colores equidistantes en hex pueden verse muy diferentes al ojo. Usar herramientas perceptuales (OKLCH, CIELAB).

---

## Pipeline connection

```
Input: design-direction.md (personalidad, territorio visual)
     + brand-questionnaire.md (personalidad, anti-referencias)
Output de este prompt -> Paleta de tokens CSS
  Se integra en: docs/design-brief.md seccion 2
  Alimenta: toda la implementacion visual (componentes, secciones, 3D)
```

## Siguiente paso

Integrar la paleta en `docs/design-brief.md` seccion 2.
