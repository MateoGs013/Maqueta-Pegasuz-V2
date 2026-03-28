# Motion Spec: {{PROJECT_NAME}}

> Coreografia completa para que `gsap-motion` implemente sin improvisar.
> Cada proyecto tiene personalidad de motion unica. NUNCA defaultear.

---

## 1. Personalidad de motion

- **Caracter:** {{MOTION_CHARACTER}} (ej: cinematico, fluido, staccato, organico, mecanico)
- **Velocidad percibida:** {{SPEED}} (ej: luxury-slow, startup-fast, editorial-measured)
- **Easing signature:** {{EASING}} (ej: power4.out, elastic.out(1, 0.3), expo.inOut)
  - NOTA: no usar power3.out por default. Elegir uno unico para este proyecto.

---

## 2. Hero entrance timeline

> Paso a paso, con tiempos exactos. El hero es la primera impresion.

```
Timeline total: {{DURATION}}s

t=0.0s  — {{STEP_1}} (ej: bg fade in, opacity 0->1, 0.4s)
t=0.3s  — {{STEP_2}} (ej: headline chars reveal, SplitType, stagger 0.03, 0.8s)
t=0.6s  — {{STEP_3}} (ej: subtitle fade up, y:20->0, 0.5s)
t=0.8s  — {{STEP_4}} (ej: CTA buttons scale in, 0.4s)
t=1.0s  — {{STEP_5}} (ej: 3D scene activate, particles start)
t=1.2s  — {{STEP_6}} (ej: scroll indicator pulse in)
```

---

## 3. Scroll reveal defaults

| Propiedad | Valor |
|-----------|-------|
| Easing | {{EASING}} |
| Duration | {{DURATION}}s |
| Y offset | {{Y_OFFSET}}px |
| Stagger (children) | {{STAGGER}}s |
| ScrollTrigger start | "top 85%" |
| once | true |
| clearProps | 'all' |

---

## 4. Tecnicas por seccion

> CADA seccion usa una tecnica diferente. Nunca el mismo fade-up en todas.

| Seccion | Tecnica | Descripcion |
|---------|---------|------------|
| Hero | {{TECHNIQUE}} | {{DESC}} |
| {{SECTION_2}} | {{TECHNIQUE}} | {{DESC}} |
| {{SECTION_3}} | {{TECHNIQUE}} | {{DESC}} |
| {{SECTION_4}} | {{TECHNIQUE}} | {{DESC}} |
| {{SECTION_5}} | {{TECHNIQUE}} | {{DESC}} |

### Catalogo de tecnicas disponibles

| Tecnica | Implementacion | Mejor para |
|---------|---------------|-----------|
| Char-by-char reveal | SplitType + stagger | Headlines, hero |
| Word-by-word reveal | SplitType words + stagger | Subtitulos, quotes |
| Line-by-line reveal | SplitType lines + clip | Parrafos, manifesto |
| Fade up | y offset + opacity | Contenido general |
| Fade in scale | scale 0.95->1 + opacity | Cards, imagenes |
| Slide from side | x offset + opacity | Layouts split |
| Clip reveal | clipPath rect/inset | Imagenes, secciones |
| Counter roll | GSAP snap + textContent | Stats, numeros |
| Parallax layers | y speed diferencial | Backgrounds, depth |
| Pin + scrub | ScrollTrigger pin + scrub | Secciones largas |
| Marquee | x loop infinito | Textos horizontales |
| Stagger grid | stagger 2D from center | Grids de cards |
| Draw SVG | drawSVG / strokeDashoffset | Iconos, lineas |
| Morph | MorphSVG | Formas, transiciones |
| Flip | GSAP Flip plugin | Layout changes |

---

## 5. Hover interactions

### Cards
```
hover in:  {{HOVER_IN}} (ej: image scale 1.05, 0.4s, shadow increase)
hover out: {{HOVER_OUT}} (ej: reverse, 0.3s)
```

### Buttons
```
hover in:  {{BTN_HOVER_IN}} (ej: bg slide from left, text color change)
hover out: {{BTN_HOVER_OUT}}
```

### Links / Navigation
```
hover in:  {{LINK_HOVER_IN}} (ej: underline draw from left, 0.3s)
hover out: {{LINK_HOVER_OUT}}
```

---

## 6. Page transitions

```
Leave:  {{PAGE_LEAVE}} (ej: fade out + y:-20, 0.3s)
Enter:  {{PAGE_ENTER}} (ej: fade in + y:20->0, 0.4s)
```

---

## 7. Scroll-linked animations

| Elemento | Comportamiento | Rango |
|---------|---------------|-------|
| {{ELEMENT}} | {{BEHAVIOR}} | {{SCROLL_RANGE}} |

Opciones:
- Parallax (different scroll speeds)
- Pin (section stays while content scrolls)
- Scrub (progress-based animation)
- Color change (bg transitions between sections)
- Scale (element grows/shrinks with scroll)

---

## 8. Tecnicas especiales

> Definir si el proyecto usa alguna de estas:

- [ ] **Marquee/ticker:** texto o logos en loop horizontal
- [ ] **Counter animation:** numeros que cuentan hasta su valor
- [ ] **Text split animation:** SplitType para chars/words/lines
- [ ] **Custom cursor:** cursor personalizado que reacciona a hover
- [ ] **Magnetic buttons:** botones que siguen el mouse
- [ ] **Smooth scroll:** Lenis smooth scrolling
- [ ] **Image reveal:** imagenes que se revelan con clip-path
- [ ] **Sticky sections:** secciones que se pinean durante scroll
- [ ] **Progress indicator:** barra de progreso de scroll
- [ ] **Noise/grain overlay:** textura animada sobre el contenido

---

## 9. prefers-reduced-motion

> SIEMPRE documentar que se desactiva.

Cuando `prefers-reduced-motion: reduce` esta activo:
- [ ] Hero timeline: mostrar todo sin animacion, visible inmediato
- [ ] Scroll reveals: elementos visibles sin transicion
- [ ] Hover effects: solo cambios de color, sin transform
- [ ] Parallax: desactivado, posiciones estaticas
- [ ] Marquee: pausado o estatico
- [ ] 3D scene: imagen estatica fallback o version simplificada
- [ ] Page transitions: corte directo, sin animacion

---

## 10. Performance guards

| Regla | Implementacion |
|-------|---------------|
| Solo animar transform + opacity | Nunca width, height, top, left |
| will-change solo activo | Agregar antes de animar, quitar despues |
| ScrollTrigger batch | Agrupar reveals del mismo tipo |
| Cleanup obligatorio | gsap.context() + onBeforeUnmount revert |
| Throttle scroll events | requestAnimationFrame wrapper |
| Mobile: reducir complejidad | Menos particulas, menos layers |

---

## Checklist

- [ ] Personalidad de motion es unica (no el default)
- [ ] Hero timeline tiene pasos con tiempos exactos
- [ ] Cada seccion usa tecnica diferente
- [ ] Hover interactions definidas para cards, buttons, links
- [ ] Page transitions definidas
- [ ] prefers-reduced-motion cubierto
- [ ] Performance guards documentados
- [ ] Easing signature elegido (no power3.out por default)
