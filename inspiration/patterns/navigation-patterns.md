# UI Patterns: Navigation

> Catalogo de patrones de navegacion.

---

## Header / Navbar

### 1. Fixed Transparent -> Solid
- Transparente sobre hero, solido al scrollear
- Transicion suave de bg y color
- **Mejor para:** sites con hero visual

### 2. Sticky with Hide on Scroll Down
- Se oculta al scrollear abajo, aparece al scrollear arriba
- Ahorra espacio vertical
- **Mejor para:** contenido largo, mobile

### 3. Minimal Fixed
- Logo + hamburger (incluso en desktop)
- Todo el menu en overlay/panel
- **Mejor para:** portfolios, sites experimentales

### 4. Mega Menu
- Dropdown con multiples columnas y previews
- Para sitios con muchas secciones
- **Mejor para:** e-commerce, corporate

## Mobile Menu

### 1. Slide Panel (derecha)
- Panel que desliza desde la derecha
- Nav items stacked verticalmente
- **Standard:** la mayoria de los sites

### 2. Fullscreen Overlay
- Overlay que cubre toda la pantalla
- Items centrados, tipografia grande
- **Premium:** sites creativos, agencies

### 3. Bottom Sheet
- Panel que sube desde abajo
- Thumb-friendly, app-like
- **Modern:** apps web, mobile-first

## Footer

### 1. Multi-Column
- 3-4 columnas con links organizados
- Info de contacto, social, legal
- **Standard:** la mayoria de los sites

### 2. Minimal
- Logo + copyright + social icons
- Para sites que no necesitan nav extensa
- **Minimal:** portfolios, landing pages

### 3. CTA Footer
- Seccion grande con CTA antes del footer real
- "Ready to start?" + formulario o boton
- **Conversion:** services, agencies, SaaS

---

## Tendencias de navegacion 2025-2026

### View Transitions Navigation
- Transicion nativa del browser entre paginas (View Transitions API)
- **Implementar:** `view-transition-name` CSS + `document.startViewTransition()` + Vue Router hooks

### Scroll-Driven Nav State
- Nav que cambia estado basado en CSS scroll-driven animations (sin JS)
- **Implementar:** CSS `animation-timeline: scroll()` para opacity/color changes

### Command Palette / Search-First
- Ctrl+K pattern (Raycast/Linear inspired), busqueda global como nav primaria
- **Implementar:** Vue 3 teleport modal + keyboard shortcut composable + fuzzy search

### Breadcrumb-as-Context Nav
- Breadcrumbs que no solo muestran donde estas sino que son dropdowns para navegar a siblings — reemplazan mega-menu en sites deep
- **Implementar:** Vue 3 breadcrumb component + dropdown per-level + CSS `popover` attribute (Baseline 2024) + keyboard nav

### Animated Section Indicators
- Indicador lateral (dots o labels) que muestra en que seccion estas, con animacion de progreso entre secciones
- Pattern popular en one-page sites y long-form content
- **Implementar:** IntersectionObserver per section + GSAP progress bar animation + CSS fixed positioning + scroll-driven animation fallback

### Gesture-Based Mobile Nav
- En mobile, swipe horizontal para navegar entre paginas (tab-based) ademas del hamburger menu clasico
- Se siente nativo, reduce friction para paginas principales
- **Implementar:** Vue 3 touch composable (touchstart/touchmove/touchend) + GSAP x-translate + CSS scroll-snap como fallback
