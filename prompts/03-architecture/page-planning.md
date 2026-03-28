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

## Ejemplo: buena vs mala planificacion

### Homepage de un estudio de tatuajes

**Mala:**
```
Seccion 1: Hero
Seccion 2: Servicios
Seccion 3: Portfolio
Seccion 4: Contacto
```
(4 secciones. El minimo es 8. No hay propositos, no hay ritmo, no hay narrativa.)

**Buena:**
```
Seccion 1 — "Arte en piel" (Impact)
  Layout: fullscreen video bg + headline overlay
  Contenido: content-brief #1 Hero headline
  Motion: text split reveal, video autoplay muted

Seccion 2 — "Cada trazo cuenta" (Manifesto)
  Layout: split 50/50 texto + imagen close-up
  Contenido: content-brief #2 Filosofia del estudio
  Motion: parallax image + fade in texto

Seccion 3 — "15 anos, 3000+ tatuajes" (Energy)
  Layout: stats counter fullwidth, bg oscuro
  Contenido: content-brief #3 Metricas
  Motion: counter animation on scroll enter

Seccion 4 — "Estilos" (Context)
  Layout: grid 3 columnas con filtros
  Contenido: Estilos de tatuaje del estudio (blackwork, fine line, etc.)
  Motion: staggered card reveal

Seccion 5 — "Trabajos recientes" (Evidence)
  Layout: masonry gallery con lightbox
  Contenido: Portfolio filtrable
  Motion: image scale on hover + modal transition
  Elemento especial: filtro por estilo

Seccion 6 — "El proceso" (Process)
  Layout: timeline horizontal, 4 pasos
  Contenido: content-brief #5 Proceso de consulta -> diseno -> sesion -> cuidado
  Motion: horizontal scroll pin

Seccion 7 — "Lo que dicen" (Trust)
  Layout: testimonial slider, fondo claro
  Contenido: content-brief #6 Testimonios
  Motion: auto-slide + swipe gesture

Seccion 8 — "Tu proximo tatuaje empieza aca" (Close)
  Layout: CTA grande + formulario de consulta inline
  Contenido: content-brief #7 CTA final
  Motion: reveal del form al scroll
```
(8 secciones, cada una con proposito, layout, referencia al content-brief, y motion. Ritmo narrativo: Impact -> Manifesto -> Energy break -> Context -> Evidence -> Process -> Trust -> Close.)

---

## Secciones minimas por tipo de pagina e industria

| Pagina | Gastronomia | Inmobiliaria | Fintech | Estudio creativo | E-commerce |
|--------|-------------|-------------|---------|-----------------|------------|
| Homepage | 10-12 (menu visual, chef, reviews) | 10-14 (hero search, featured, stats) | 8-12 (value prop, features, trust) | 8-12 (reel, work, process) | 10-14 (featured, categories, reviews) |
| About | 6-8 (historia, equipo, sourcing) | 6-8 (equipo, trayectoria, valores) | 6-8 (mision, team, partners) | 8-10 (manifiesto, equipo, premios) | 6-8 (marca, sustentabilidad, equipo) |
| Services | 6-8 (carta, menu degustacion, private) | 6-10 (tipos, search, featured) | 8-10 (productos, comparacion, FAQ) | 6-10 (servicios, cases, pricing) | N/A (categorias de producto) |
| Contact | 3-4 (reservas, mapa, horarios) | 3-5 (form, mapa, sucursales) | 3-5 (form, FAQ, chat) | 3-5 (form, ubicacion, social) | 3-4 (soporte, FAQ, chat) |

---

## Common errors

- **Menos secciones que el minimo.** Homepage con 5 secciones no cuenta una historia. El usuario scrollea poco y no tiene suficiente informacion para convertir.
- **Dos secciones densas consecutivas.** Si hay un grid de servicios seguido de un grid de portfolio, el usuario se fatiga. Intercalar con Energy breaks (stats, quotes, CTAs).
- **Todas las secciones con el mismo layout.** Si las 10 secciones son "texto a la izquierda, imagen a la derecha", el sitio es monotono. Variar: fullscreen, split, grid, stack, asymmetric, overlap.
- **Primera seccion sin impacto.** El hero es la primera impresion. Si es un fondo blanco con texto chico, se pierde al usuario en 3 segundos.
- **Ultima seccion sin CTA.** El cierre de cada pagina debe tener un camino claro de accion. Nunca terminar en un footer sin transicion.
- **No referenciar el content-brief.** Si la seccion dice "texto descriptivo" en vez de "content-brief #4 Servicio de interiorismo", el implementador va a improvisar.
- **Propositos duplicados sin justificacion.** Dos secciones "Evidence" consecutivas (portfolio + testimonios) pueden funcionar, pero necesitan ritmo visual diferente.

---

## Pipeline connection

```
Input: design-brief.md (tokens, spacing, responsive strategy)
     + content-brief.md (copy exacto por seccion)
     + navigation-flow.md (paginas requeridas)
Output de este prompt -> docs/page-plans.md
  Alimenta directamente:
    - motion-personality.md (seccion por seccion para asignar motion)
    - section-narratives.md (narrativa detallada por seccion)
    - component-planning.md (que componentes construir)
    - page-scaffold skill (implementacion de cada pagina)
    - 3d-scope.md (donde vive el 3D)
```

## Siguiente paso

Ejecutar `04-motion/motion-personality.md` para definir como se anima cada seccion.
