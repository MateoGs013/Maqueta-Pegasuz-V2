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

## Performance tips

| Tip | Razon |
|-----|-------|
| `once: true` para reveals | No re-calcular en cada scroll |
| `scrub: 1` (no `true`) | Smoothing de 1 segundo |
| Batch similar triggers | Menos listeners |
| `invalidateOnRefresh: true` | Recalcular en resize |
| `will-change` solo durante animacion | No preventivo |
