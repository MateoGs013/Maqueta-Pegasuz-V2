# Prompt: Page Planning

> Fase: Architecture | Output: docs/page-plans.md completo
> Cada pagina planificada seccion por seccion con proposito narrativo.

---

## Prompt

```
Crea el page plan completo para {{PROJECT_NAME}} usando la template
en docs/_templates/page-plans.template.md.

INPUT:
- Design brief: docs/design-brief.md (tokens, atmosfera, responsive)
- Content brief: docs/content-brief.md (copy, servicios, CTAs)
- Paginas requeridas: {{PAGES_LIST}}

REGLAS DE PLANIFICACION:

1. MINIMOS DE SECCIONES (inviolable)
   - Homepage: 8-14 secciones
   - About: 6-10 secciones
   - Services: 6-10 secciones
   - Portfolio: 5-8 secciones
   - Contact: 3-5 secciones
   - Blog listing: 4-6 secciones

2. PROPOSITO NARRATIVO
   Cada seccion tiene uno de estos propositos:
   Impact | Manifesto | Energy | Context | Proof | Process | Trust | Evidence | Differentiator | Close

3. RITMO
   - Alternar secciones densas y secciones de respiro
   - Nunca 2 secciones densas consecutivas sin un Energy break
   - Nunca 3 secciones con el mismo tipo de layout

4. POR CADA SECCION definir:
   - Nombre descriptivo
   - Proposito (del catalogo)
   - Layout (fullscreen, split, grid, stack, asymmetric, overlap)
   - Contenido (referencia exacta al content-brief: "content-brief #4 Servicio 1")
   - Motion (referencia a motion-spec o tipo de animacion)
   - Elemento especial si hay (3D, parallax, video, marquee)

5. PRIMERA Y ULTIMA SECCION
   - Primera: siempre Impact (hero con maximo impacto visual)
   - Ultima: siempre Close (CTA fuerte, camino claro de accion)

6. HOMEPAGE ESPECIAL
   La homepage es una pelicula. Tiene actos:
   - Acto 1 (sec 1-3): Impacto + identidad + primera prueba
   - Acto 2 (sec 4-8): Profundidad + evidencia + proceso
   - Acto 3 (sec 9-fin): Confianza + diferenciacion + cierre

OUTPUT: docs/page-plans.md completo. Cada pagina con todas sus secciones definidas.
```

---

## Siguiente paso

Ejecutar `04-motion/motion-personality.md` para definir como se anima cada seccion.
