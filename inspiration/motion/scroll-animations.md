# Motion Reference: Scroll Animations

> Tecnicas de animacion ligadas al scroll.

---

## ScrollTrigger Patterns

### 1. Standard Reveal (once: true)
```js
gsap.from(element, {
  y: 40, opacity: 0, duration: 0.7,
  scrollTrigger: { trigger: element, start: 'top 85%', once: true }
})
```
**Uso:** default para cualquier contenido below the fold

### 2. Stagger Reveal (grid de items)
```js
gsap.from(items, {
  y: 40, opacity: 0, duration: 0.5, stagger: 0.08,
  scrollTrigger: { trigger: container, start: 'top 80%', once: true }
})
```
**Uso:** grids de cards, listas, features

### 3. Parallax (velocidad diferencial)
```js
gsap.to(bgElement, {
  y: '20%',
  scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true }
})
```
**Uso:** backgrounds, imagenes decorativas

### 4. Pin + Content Change
```js
ScrollTrigger.create({
  trigger: section, pin: true, start: 'top top',
  end: '+=300%',
  onUpdate: (self) => { /* update content based on self.progress */ }
})
```
**Uso:** features showcase, storytelling, proceso

### 5. Horizontal Scroll
```js
gsap.to(panels, {
  xPercent: -100 * (panels.length - 1),
  scrollTrigger: { trigger: container, pin: true, scrub: 1,
    end: () => '+=' + container.offsetWidth }
})
```
**Uso:** galeria horizontal, timeline

### 6. Counter Animation
```js
gsap.from(counter, {
  textContent: 0, duration: 2, snap: { textContent: 1 },
  scrollTrigger: { trigger: counter, start: 'top 80%', once: true }
})
```
**Uso:** stats, numeros, metricas

### 7. Color Transition Between Sections
```js
sections.forEach((section, i) => {
  ScrollTrigger.create({
    trigger: section, start: 'top center', end: 'bottom center',
    onEnter: () => gsap.to('body', { backgroundColor: colors[i], duration: 0.5 }),
    onEnterBack: () => gsap.to('body', { backgroundColor: colors[i], duration: 0.5 })
  })
})
```
**Uso:** secciones con identidad de color diferente

---

---

## Tecnicas trending 2025-2026

### 8. CSS Scroll-Driven Animations (sin JS)
- `animation-timeline: scroll()` para animaciones basadas en scroll progress del contenedor
- `animation-timeline: view()` para animaciones basadas en la visibilidad del elemento en el viewport
- Chrome 115+, Firefox 131+, Safari 18+ (Baseline late 2024)
- **Usar cuando:** progress bars, fade-ins, parallax simple, reveal on view

```css
/* Scroll progress animation */
.progress-bar {
  animation: fill-bar linear both;
  animation-timeline: scroll();
}
@keyframes fill-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }

/* View-based animation (fade in when element enters viewport) */
.reveal {
  animation: fade-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 9. Scroll-Driven 3D Camera Control
- Camera de una escena Three.js controlada por scroll progress
- El usuario "vuela" por la escena scrolleando — position, rotation, y FOV ligados al progreso
- **Implementar:** GSAP ScrollTrigger scrub + Three.js camera + lerp para smooth interpolation

```js
ScrollTrigger.create({
  trigger: container,
  start: 'top top', end: 'bottom bottom',
  scrub: 2,
  onUpdate: (self) => {
    const t = self.progress
    camera.position.lerpVectors(startPos, endPos, t)
    camera.lookAt(target)
  }
})
```

### 10. Scroll Velocity Skew
- Elementos que se deforman (skewY) basado en la velocidad del scroll
- Scroll rapido = skew visible, scroll lento = forma normal
- Efecto sutil pero premium que da sensacion de fisica real

```js
// Con Lenis
lenis.on('scroll', ({ velocity }) => {
  gsap.to('.skew-element', {
    skewY: velocity * 0.5,
    duration: 0.3,
    ease: 'power2.out'
  })
})
```

### 11. Progressive Number Counter with Scroll
- Numeros que no solo countan una vez sino que incrementan/decrementan proporcionalmente al scroll
- El numero "acompana" al scroll — mas inmersivo que el counter clasico
- **Implementar:** GSAP ScrollTrigger scrub + `textContent` interpolation

---

## CSS vs GSAP Decision for Scroll Animations

| Animacion | CSS Scroll-Driven | GSAP ScrollTrigger | Recomendacion |
|-----------|------------------|-------------------|---------------|
| Progress bar | `animation-timeline: scroll()` | overkill | CSS |
| Fade-in on view | `animation-timeline: view()` | overkill | CSS |
| Parallax simple | `animation-timeline: scroll()` + transform | possible | CSS (zero JS) |
| Complex stagger reveals | No viable | `stagger` + `scrollTrigger` | GSAP |
| Pinned sections | No viable en CSS | `pin: true` | GSAP |
| Horizontal scroll | No viable en CSS | `xPercent` + `pin` | GSAP |
| 3D camera control | No viable en CSS | scrub + Three.js | GSAP |
| Color transitions | Possible but limited | `onUpdate` + `gsap.to` | GSAP (mas control) |

**Regla:** CSS scroll-driven para lo simple (progress, fades, parallax basico). GSAP para todo lo demas.

---

## Performance tips

| Tip | Razon |
|-----|-------|
| `once: true` para reveals | No re-calcular en cada scroll |
| `scrub: 1` (no `true`) | Smoothing de 1 segundo |
| Batch similar triggers | Menos listeners |
| `invalidateOnRefresh: true` | Recalcular en resize |
| `will-change` solo durante animacion | No preventivo |
| CSS scroll-driven first | Zero JS overhead para animaciones simples |
| `animation-range` preciso | Controlar exactamente cuando empieza/termina la animacion en view() |
