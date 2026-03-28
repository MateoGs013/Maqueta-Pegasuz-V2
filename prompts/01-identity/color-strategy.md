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

## Siguiente paso

Integrar la paleta en `docs/design-brief.md` seccion 2.
