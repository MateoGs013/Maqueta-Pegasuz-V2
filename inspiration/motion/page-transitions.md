# Motion Reference: Page Transitions

> Catalogo de transiciones entre paginas.

---

## Tipos de page transition

### 1. Fade (simple, confiable)
```
Leave: opacity 1 -> 0, 0.3s
Enter: opacity 0 -> 1, 0.4s
```
**Mejor para:** cualquier proyecto, fallback seguro

### 2. Slide + Fade
```
Leave: opacity 1 -> 0 + y: 0 -> -20, 0.3s
Enter: opacity 0 -> 1 + y: 20 -> 0, 0.4s
```
**Mejor para:** apps, dashboards, navegacion vertical

### 3. Cover (overlay que tapa)
```
Leave: overlay desliza cubriendo la pagina, 0.4s
Switch: contenido cambia detras del overlay
Enter: overlay desliza descubriendo nueva pagina, 0.4s
```
**Mejor para:** portfolios, case studies, sites creativos

### 4. Clip Path
```
Leave: clipPath circle/rect se contrae, 0.4s
Enter: clipPath circle/rect se expande, 0.5s
```
**Mejor para:** sites experimentales, galerias

### 5. Shared Element
```
Leave: elemento clickeado se expande a fullscreen
Enter: fullscreen se contrae a nueva posicion
```
**Mejor para:** galerias, product detail, case studies

### 6. Morph
```
Leave: elementos morph a formas basicas
Enter: formas basicas morph a nuevos elementos
```
**Mejor para:** portfolios artisticos, ultra-premium

---

## Implementacion en Vue Router

```js
// router-view con transition
<router-view v-slot="{ Component }">
  <transition name="page" mode="out-in">
    <component :is="Component" />
  </transition>
</router-view>

// O con GSAP para control total
<router-view v-slot="{ Component }">
  <transition
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @enter="onEnter"
    mode="out-in"
  >
    <component :is="Component" />
  </transition>
</router-view>
```

---

## Tecnicas nuevas 2025-2026

### 7. View Transitions API (nativo del browser)
- **MDN:** https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
- **Chrome DevTools:** https://developer.chrome.com/docs/web-platform/view-transitions
- Transiciones nativas del browser entre estados del DOM
- Same-document: Chrome 111+, Edge 111+, Firefox 133+, Safari 18+
- Cross-document: Chrome 126+, Edge 126+, Safari 18.2+

```css
/* Marcar elementos para transicion compartida */
.thumbnail { view-transition-name: hero-image; }
.detail-image { view-transition-name: hero-image; }

/* Customizar la animacion */
::view-transition-old(hero-image) {
  animation: fade-out 0.3s ease-out;
}
::view-transition-new(hero-image) {
  animation: fade-in 0.4s ease-in;
}
```

```js
// En Vue 3 con router
router.beforeResolve(async (to) => {
  if (document.startViewTransition) {
    await document.startViewTransition(async () => {
      // Vue router resuelve la navegacion dentro de la transition
    }).ready
  }
})
```

**Mejor para:** galerias, product detail, list-to-detail, cualquier shared element
**Degradacion:** si no hay soporte, el cambio es instantaneo (sin animacion) — seguro de usar hoy

### 8. FLIP Animation (First Last Invert Play)
- **Referencia:** https://gsap.com/docs/v3/Plugins/Flip/
- **Concepto:** Medir posicion inicial -> aplicar cambio -> calcular diff -> animar con transform
- Permite animar layout changes (grid reorder, filter, expand) con 60fps
- GSAP Flip plugin lo automatiza completamente

```js
// Con GSAP Flip plugin
import { Flip } from 'gsap/Flip'
gsap.registerPlugin(Flip)

// 1. Capturar estado actual
const state = Flip.getState('.cards')

// 2. Hacer el cambio de layout (filter, reorder, etc)
container.classList.toggle('filtered')

// 3. Animar desde la posicion anterior a la nueva
Flip.from(state, {
  duration: 0.7,
  ease: 'power3.out',
  stagger: 0.05,
  absolute: true,
  onEnter: elements => gsap.from(elements, { opacity: 0, scale: 0.8 }),
  onLeave: elements => gsap.to(elements, { opacity: 0, scale: 0.8 })
})
```

**Mejor para:** filtros de portfolio, grid reordering, tab changes, expand/collapse
**Implementar con:** GSAP Flip plugin + Vue 3 TransitionGroup + computed filtering

---

## Reglas

| Regla | Razon |
|-------|-------|
| Total transition < 0.8s | Mas lento se siente broken |
| mode="out-in" | Evita overlap de paginas |
| Scroll to top on enter | User espera estar arriba |
| prefers-reduced-motion: skip | Corte directo sin animacion |
| Loading state if slow | Si la pagina tarda, mostrar loading |
| View Transitions API first | Usar nativo cuando sea suficiente, GSAP para control total |
| FLIP for layout changes | Nunca animar width/height directamente — siempre FLIP |
| Progressive enhancement | Detectar soporte antes de usar APIs nuevas |
