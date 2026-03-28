# Inspiration: Luxury Real Estate

> Referencias de real estate de alta gama.
> Nivel: Sotheby's International Realty, Compass, The Agency, Knight Frank.
> Actualizado: Marzo 2026

---

## Referencias actuales (2025-2026)

### Sotheby's International Realty
- **URL:** https://www.sothebysrealty.com/
- **Tecnica:** Cinematic storytelling, full-screen 4K photography, video tours, minimal UI
- **Implementar con:** Vue 3 fullscreen hero + lazy video + GSAP parallax + Three.js grain overlay

### Compass
- **URL:** https://www.compass.com/
- **Tecnica:** B&W minimalista, 3 tipografias (Tiempos + Harmonia + Pressura), mapa interactivo
- **Implementar con:** Vue 3 map integration + Pinia search store + GSAP micro-interactions

### The Agency
- **URL:** https://www.theagencyre.com/
- **Tecnica:** Photography-first, property cards con hover cinematico, video backgrounds
- **Implementar con:** Vue 3 lazy images + GSAP scroll reveals + CSS aspect-ratio containers

### Knight Frank
- **URL:** https://www.knightfrank.com/
- **Tecnica:** Data-driven design con tipografia premium, mega-menu, neighborhood guides
- **Implementar con:** Vue 3 dynamic components + GSAP counter animations + responsive grid

### Sites tipo "Virtual Staging interactivo"
- **Referencia:** Proptech startups que muestran furnished vs empty rooms con slider interactivo
- **Tecnica:** Before/after slider con staging virtual, transicion suave entre estados, annotations interactivas
- **Implementar con:** Vue 3 before/after component + GSAP Draggable + CSS clip-path + lazy loaded image pairs
- **Relevancia:** Diferencia a la inmobiliaria de la competencia — la propiedad se vende desde el browser

### Sites tipo "Architectural Walkthrough"
- **Referencia:** Sitios de arquitectura premium que usan scroll-driven camera movement dentro de renders 3D
- **Tecnica:** Secuencia de imagenes renderizadas que cambian con scroll, simulando caminar por la propiedad
- **Implementar con:** GSAP ScrollTrigger + image sequence (canvas drawImage) + preload progressive
- **Relevancia:** Reemplaza el tour virtual con una experiencia cinematica controlada por scroll

### Sites tipo "Neighborhood as Experience"
- **Referencia:** Inmobiliarias luxury que dedican secciones completas al barrio con mapa interactivo, puntos de interes, y lifestyle photography
- **Tecnica:** Mapa custom (no Google Maps default), markers animados, hover cards con info del POI, photography editorial del barrio
- **Implementar con:** Vue 3 custom map component (Mapbox GL JS) + GSAP marker animations + Pinia location store
- **Relevancia:** No vender metros cuadrados — vender el estilo de vida del barrio

### Sites tipo "Property Cinematic Landing"
- **Referencia:** Propiedades individuales de ultra-lujo que tienen su propia landing page con storytelling visual
- **Tecnica:** Fullscreen video hero, scroll-driven room tour, specs como typography art, appointment CTA sticky
- **Implementar con:** Vue 3 lazy video + GSAP pinned sections + Three.js grain overlay + Lenis smooth scroll
- **Relevancia:** Cada propiedad premium merece su propia experiencia digital, no solo una ficha

---

## Que observar en este rubro

- **Fotografia:** hero images enormes, calidad editorial
- **Busqueda:** filtros sofisticados pero intuitivos
- **Property detail:** galeria inmersiva, datos organizados
- **Maps:** integracion de mapas interactivos
- **Trust signals:** logos, certificaciones, testimonios de alto perfil
- **Tono:** exclusividad sin ser inaccesible

## Patrones comunes

| Pattern | Descripcion | Cuando usar |
|---------|------------|------------|
| Fullscreen property hero | Imagen de propiedad a pantalla completa | Property detail |
| Map-based browsing | Mapa interactivo con markers | Busqueda por zona |
| Gallery lightbox | Galeria con thumbnails y lightbox | Property detail |
| Virtual tour CTA | Boton prominente para tour 360 | Property detail |
| Price display | Precio con moneda y formato local | Cards y detail |
| Neighborhood guide | Info del barrio con fotos | Property detail |
| Similar properties | Grid de propiedades similares | Property detail footer |

## Tecnicas de diferenciacion

1. **Menos es mas** — Pocos elementos, mucho espacio, cada imagen respira
2. **Narrativa de estilo de vida** — No vender metros cuadrados, vender la experiencia
3. **Datos como design element** — m2, habitaciones, precio como tipografia premium
4. **Atencion al detalle** — Transiciones suaves, loading refinado, hover elegante
5. **Color restraint** — Paleta neutral + un accent estrategico

## Referencias a buscar

- "luxury real estate website"
- "property showcase premium"
- "real estate portfolio Awwwards"
- "architectural homes website"
