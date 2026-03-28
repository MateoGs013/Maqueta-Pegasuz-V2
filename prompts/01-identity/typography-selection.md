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

## Siguiente paso

Integrar tipografia en `docs/design-brief.md` seccion 3.
