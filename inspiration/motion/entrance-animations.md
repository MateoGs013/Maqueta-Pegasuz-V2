# Motion Reference: Entrance Animations

> Catalogo de tecnicas de entrada/reveal para elementos.

---

## Tecnicas de entrada

### Text Reveals

| Tecnica | Implementacion | Efecto | Mejor para |
|---------|---------------|--------|-----------|
| Char-by-char | SplitType chars + stagger 0.02-0.04s | Cinematico, preciso | Headlines hero |
| Word-by-word | SplitType words + stagger 0.05-0.08s | Fluido, legible | Subtitulos |
| Line-by-line | SplitType lines + clip from bottom | Editorial, elegante | Parrafos |
| Typewriter | Chars con delay constante | Tecnico, retro | Monospace text |
| Scramble | Chars random antes de resolver | Hacker, tech | Titulos tech |
| Fade up words | Words opacity + y offset | Suave, universal | Cualquier texto |

### Image/Media Reveals

| Tecnica | CSS/GSAP | Efecto | Mejor para |
|---------|---------|--------|-----------|
| Clip rect | clipPath: inset() animado | Cortina que revela | Imagenes editoriales |
| Scale from center | scale 0 -> 1 + opacity | Dramatico | Imagenes hero |
| Wipe horizontal | clipPath: inset(0 100% 0 0) -> inset(0) | Reveal lateral | Split layouts |
| Blur to clear | filter: blur(20px) -> blur(0) | Cinematico, suave | Fondos, fotos |
| Parallax enter | y: 100 -> 0 con velocity | Profundidad | Cualquier imagen |
| Color overlay lift | Overlay color que se levanta | Elegante, con marca | Cards, portfolio |

### Container/Section Reveals

| Tecnica | Implementacion | Efecto |
|---------|---------------|--------|
| Fade up | y: 40, opacity: 0 -> 1 | Standard, confiable |
| Fade in scale | scale: 0.95, opacity: 0 | Sutil, premium |
| Slide from side | x: -60 o x: 60 | Lateral, dinamico |
| Stagger children | Children stagger 0.08-0.12s | Organizado, ritmico |
| Draw border | Border que se dibuja alrededor | Tecnico, preciso |
| Accordion open | height: 0 -> auto + content reveal | Expandible |

---

---

## Tecnicas trending 2025-2026

### CSS @starting-style Entrances (no JS)
- Animaciones de entrada usando `@starting-style` — define el estado inicial para elementos que entran al DOM
- Ideal para elementos que aparecen via `display: none` -> `display: block` (modals, dropdowns, toast notifications)
- Browser support: Chrome 117+, Edge 117+, Safari 17.5+, Firefox 129+
- **Cuando usar:** cualquier elemento que toglea visibilidad — reemplaza JS para entrances simples

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s, transform 0.3s, display 0.3s allow-discrete;

  @starting-style {
    opacity: 0;
    transform: translateY(20px);
  }
}
```

### CSS `transition-behavior: allow-discrete` for Display Transitions
- Permite transicionar la propiedad `display` — antes imposible en CSS
- Combinado con `@starting-style`, permite animar aparicion y desaparicion de elementos sin JS
- **Cuando usar:** modals, tooltips, dropdowns, cualquier show/hide que antes necesitaba JS

### View Transition Morphing Entrances
- Usando View Transitions API, un elemento en la pagina anterior "morpha" al elemento en la nueva pagina
- No es una animacion de entrada clasica — es una metamorfosis entre estados del DOM
- **Cuando usar:** list-to-detail transitions, thumbnail-to-hero, card-to-page

```css
/* En la pagina de origen */
.product-thumb { view-transition-name: product-hero; }
/* En la pagina destino */
.product-image { view-transition-name: product-hero; }
/* El browser anima automaticamente la transicion entre ambos */
```

### Staggered FLIP Grid Entrance
- Items de un grid que entran con FLIP animation desde posiciones random o desde fuera del viewport
- Combina stagger timing con layout animation para una entrada organica
- **Cuando usar:** portfolio grids, product listings, team pages — primera carga

```js
// Items comienzan invisible, se posicionan, luego FLIP desde el estado "apilado"
const state = Flip.getState(items)
// Mover items a su posicion final en el grid
items.forEach(item => grid.appendChild(item))
Flip.from(state, { duration: 0.8, stagger: 0.05, ease: 'power3.out' })
```

---

## Reglas de timing

| Contexto | Duration | Delay | Easing |
|---------|---------|-------|--------|
| Hero elements | 0.6-1.2s | Timeline sequencial | Brand easing |
| Scroll reveals | 0.5-0.8s | 0 (trigger on scroll) | Brand easing |
| Stagger items | 0.4-0.6s each | 0.06-0.12s stagger | Brand easing |
| Hover states | 0.2-0.4s | 0 | power2.out |
| Micro-interactions | 0.15-0.3s | 0 | power1.out |

## Decision matrix: CSS nativo vs GSAP para entrances

| Tipo de entrada | CSS nativo | GSAP | Recomendacion |
|----------------|-----------|------|---------------|
| Fade-in simple | `@starting-style` o `animation-timeline: view()` | overkill | CSS nativo |
| Stagger grid | Posible con `nth-child` delays | `stagger` property | GSAP (mas control) |
| Scroll-triggered reveal | `animation-timeline: view()` | ScrollTrigger | CSS si simple, GSAP si complejo |
| FLIP layout entrance | No posible en CSS | Flip plugin | GSAP obligatorio |
| View Transition morph | View Transitions API | No necesario | CSS nativo |
| Complex timeline | No posible en CSS | GSAP timeline | GSAP obligatorio |
| Show/hide toggle | `@starting-style` + `allow-discrete` | gsap.from | CSS nativo (mas simple) |
