# Inspiration: Editorial & Media

> Referencias de sitios editoriales, revistas digitales, blogs premium.
> The New York Times, Bloomberg, It's Nice That, Dezeen.
> Actualizado: Marzo 2026

---

## Referencias actuales (2025-2026)

### It's Nice That
- **URL:** https://www.itsnicethat.com/
- **Tecnica:** Magazine grid asimetrico, category pills con color, serif/sans pairing
- **Implementar con:** CSS Grid template-areas + Vue 3 dynamic card + GSAP stagger reveals

### Dezeen
- **URL:** https://www.dezeen.com/
- **Tecnica:** Clean grid, featured article hero, typography-first hierarchy, high-contrast B&W
- **Implementar con:** CSS Grid auto-fill + Vue 3 article card variants + reading progress bar

### FC Porto Memorial
- **URL:** https://www.awwwards.com/sites/fc-porto-memorial
- **Awwwards:** Site of the Day (Mar 2026)
- **Tecnica:** Storytelling editorial, scroll-driven narrative, parallax photography
- **Implementar con:** GSAP ScrollTrigger pinned sections + parallax layers + SplitType headers

### Bloomberg (Visual Stories)
- **Referencia:** La seccion de visual stories de Bloomberg — data journalism con scroll-driven visualizations, animated charts, narrative long-form
- **Tecnica:** Pinned data viz que se actualiza con scroll, chart animations, number counters, editorial photography, dark mode contraste
- **Implementar con:** GSAP ScrollTrigger pin + SVG chart animations + Vue 3 dynamic data component + CSS grid editorial
- **Relevancia:** Define el standard de data storytelling interactivo — numeros que cobran vida con scroll

### Sites tipo "Digital Magazine / Webzine"
- **Referencia:** Revistas digitales que usan el formato web como ventaja (no PDF portado) — layouts asimetricos, tipografia expresiva, video inline
- **Tecnica:** Broken grid editorial, pull quotes gigantes, full-bleed photography, video embed contextual, variable font expression
- **Implementar con:** CSS Grid template-areas + CSS clamp() fluid type + Vue 3 lazy video + GSAP stagger reveals
- **Relevancia:** El web magazine NO es un blog con posts — es un medio con identidad visual propia por edicion

### Sites tipo "Scrollytelling Documentary"
- **Referencia:** Piezas de periodismo inmersivo donde el scroll cuenta una historia con chapters, multimedia, y data inline (estilo New York Times interactive features)
- **Tecnica:** Pinned sections con contenido cambiante, maps animados, timeline scroll, audio opcional, chapter navigation sticky
- **Implementar con:** GSAP ScrollTrigger multi-pin + Vue 3 chapter navigation + Lenis + IntersectionObserver for active chapter
- **Relevancia:** El formato mas impactante para contar historias complejas — cada scroll es un avance narrativo

### Sites tipo "Archive / Retrospective"
- **Referencia:** Sitios que presentan archivos historicos o retrospectivas con timeline interactivo, fotografia de epoca, y tipografia period-accurate
- **Tecnica:** Horizontal timeline scrolleable, era-specific color palette shifts, image grain/texture filters, date-based navigation
- **Implementar con:** GSAP horizontal scroll + CSS filter grain overlay + Vue 3 timeline component + scroll-driven palette transitions
- **Relevancia:** Combina editorial rigor con interactividad moderna — ideal para instituciones, museos, marcas con historia

---

## Que observar

- **Legibilidad:** tipografia optimizada para lectura larga
- **Hierarchy:** multiples niveles de informacion organizados
- **Grid systems:** grids editoriales complejos pero claros
- **Content density:** mucha informacion sin sentirse abrumador
- **Imagery:** fotos grandes con tratamiento editorial

## Patrones comunes

| Pattern | Descripcion | Cuando usar |
|---------|------------|------------|
| Magazine grid | Grid editorial asimetrico | Homepage de blog |
| Featured article hero | Articulo destacado como hero | Blog homepage |
| Reading progress | Barra de progreso de lectura | Articulos largos |
| Related articles | Grid de articulos relacionados | Article footer |
| Category pills | Tags/categorias como chips | Navegacion de contenido |
| Author card | Info del autor inline | Blog articles |

## Tecnicas de diferenciacion

1. **Grid editorial** — No el mismo grid de 3 columnas de siempre
2. **Tipografia como sistema** — Multiples niveles de jerarquia
3. **White space generoso** — El aire hace respirable el contenido
4. **Pull quotes** — Citas grandes que rompen el flujo de texto
5. **Responsive grid** — El grid se recompone, no solo se stackea

## Referencias a buscar

- "editorial website design"
- "magazine layout web"
- "blog design premium"
- "content-heavy website UX"
