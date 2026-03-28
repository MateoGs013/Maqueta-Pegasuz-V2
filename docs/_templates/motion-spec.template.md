# Motion Spec: {{PROJECT_NAME}}

> Coreografia completa para que `gsap-motion` implemente sin improvisar.
> Cada proyecto tiene personalidad de motion unica. NUNCA defaultear.

---

## 1. Personalidad de motion

- **Caracter:** {{MOTION_CHARACTER}} (ej: cinematico, fluido, staccato, organico, mecanico)
- **Velocidad percibida:** {{SPEED}} (ej: luxury-slow, startup-fast, editorial-measured)
- **Easing signature:** {{EASING}} (ej: power4.out, elastic.out(1, 0.3), expo.inOut)
  - NOTA: no usar power3.out por default. Elegir uno unico para este proyecto.
- **Easing secundario:** {{EASING_2}} (para variaciones: hover exits, subtitulos, elementos secundarios)
- **CSS easing equivalent:** {{CSS_EASING}} (ej: cubic-bezier(0.16, 1, 0.3, 1) — para CSS transitions que deben matchear el GSAP easing)

---

## 2. Preloader / Loading animation

> Como se ve el sitio mientras carga. Define la primera impresion antes del hero.

```
Tipo: {{PRELOADER_TYPE}} (ej: minimal progress bar, logo reveal, counter 0-100%, text shimmer, none)
Duration: {{PRELOADER_DURATION}} (ej: minimo 1s, maximo 3s, o "hasta que el DOM este listo")
Exit animation: {{PRELOADER_EXIT}} (ej: fade out + scale up, clip-path reveal, slide up)
Exit duration: {{EXIT_DURATION}}s
Easing: {{EXIT_EASING}}
Connects to hero: {{PRELOADER_HERO_CONNECTION}} (ej: preloader exit triggers hero entrance, 0.2s overlap)
```

*(Si el sitio no tiene preloader, escribir "none — el hero aparece inmediatamente" y eliminar el bloque.)*

---

## 3. Hero entrance timeline

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

*(Agregar mas pasos si el hero es complejo)*

---

## 4. Scroll reveal defaults

| Propiedad | Valor |
|-----------|-------|
| Easing | {{EASING}} |
| Duration | {{DURATION}}s |
| Y offset | {{Y_OFFSET}}px |
| X offset (para slides laterales) | {{X_OFFSET}}px |
| Stagger (children) | {{STAGGER}}s |
| Stagger from | {{FROM}} (ej: start, center, end, random) |
| ScrollTrigger start | "top 85%" |
| once | true |
| clearProps | 'all' |

---

## 5. Tecnicas por seccion

> CADA seccion usa una tecnica diferente. Nunca el mismo fade-up en todas.
> Completar una fila por cada seccion del page-plans.

### Homepage

| Seccion | Tecnica | Descripcion | Easing override (si difiere del default) |
|---------|---------|------------|----------------------------------------|
| S1 - Hero | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S2 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S3 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S4 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S5 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S6 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S7 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S8 - CTA Final | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |

### Otras paginas (seccion por seccion)

> Completar una tabla por cada pagina del proyecto. Cada seccion necesita una tecnica asignada
> para que gsap-motion no improvise. Eliminar paginas que no existen en este proyecto.

#### About

| Seccion | Tecnica | Descripcion | Easing override |
|---------|---------|------------|-----------------|
| S1 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S2 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S3 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S4 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S5 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S6 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |

#### Services

| Seccion | Tecnica | Descripcion | Easing override |
|---------|---------|------------|-----------------|
| S1 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S2 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S3 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S4 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S5 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S6 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |

#### Portfolio

| Seccion | Tecnica | Descripcion | Easing override |
|---------|---------|------------|-----------------|
| S1 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S2 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S3 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S4 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S5 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |

#### Contact

| Seccion | Tecnica | Descripcion | Easing override |
|---------|---------|------------|-----------------|
| S1 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S2 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |
| S3 - {{NAME}} | {{TECHNIQUE}} | {{DESC}} | {{EASING_OVERRIDE}} |

*(Agregar tablas para otras paginas si el proyecto las tiene: Blog, Case study, etc.)*

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
| Blur reveal | filter blur + opacity | Fotografias, overlays |
| Rotate in | rotation + opacity | Elementos decorativos |
| Elastic bounce | elastic easing + scale | CTAs, badges, iconos |

---

## 6. Hover & focus interactions

| Elemento | Hover in | Hover out | Focus visible | Duration |
|---------|----------|-----------|---------------|----------|
| Cards | {{HOVER_IN}} (ej: image scale 1.05, shadow increase) | {{HOVER_OUT}} (ej: reverse) | {{FOCUS}} (ej: outline 2px accent, offset 4px) | {{DURATION}} (ej: 0.4s) |
| Buttons | {{BTN_HOVER_IN}} (ej: bg slide from left, text color change) | {{BTN_HOVER_OUT}} | {{BTN_FOCUS}} (ej: ring 2px accent, offset 2px) | {{DURATION}} |
| Links | {{LINK_HOVER_IN}} (ej: underline draw from left) | {{LINK_HOVER_OUT}} | {{LINK_FOCUS}} (ej: underline solid, no animation) | {{DURATION}} |
| Images (grid) | {{IMG_HOVER_IN}} (ej: scale 1.03, overlay fade in) | {{IMG_HOVER_OUT}} | -- | {{DURATION}} |
| Nav items | {{NAV_HOVER_IN}} (ej: text color accent, line slide under) | {{NAV_HOVER_OUT}} | {{NAV_FOCUS}} | {{DURATION}} |

---

## 7. Navigation & menu animations

> Como se anima el header y el menu mobile.

```
Header scroll behavior:
  - On scroll down: {{HEADER_SCROLL_DOWN}} (ej: hide with y:-100%, slide up 0.3s)
  - On scroll up: {{HEADER_SCROLL_UP}} (ej: reveal with y:0, slide down 0.3s)
  - Threshold: {{SCROLL_THRESHOLD}} (ej: 100px before triggering hide/show)
  - Background transition: {{HEADER_BG_TRANSITION}} (ej: transparent -> solid at 50px scroll)

Mobile menu open:
  - Effect: {{MENU_OPEN}} (ej: fullscreen overlay fade in, items stagger from right)
  - Duration: {{MENU_OPEN_DURATION}}s
  - Easing: {{MENU_OPEN_EASING}}
  - Items stagger: {{MENU_ITEMS_STAGGER}} (ej: 0.05s per item, from top)

Mobile menu close:
  - Effect: {{MENU_CLOSE}} (ej: fade out, items reverse stagger)
  - Duration: {{MENU_CLOSE_DURATION}}s

Hamburger icon:
  - Animation: {{HAMBURGER_ANIMATION}} (ej: morph to X, rotate lines, none)
```

---

## 8. Page transitions

```
Leave animation:
  - Effect: {{PAGE_LEAVE}} (ej: fade out + y:-20, overlay wipe, clip close)
  - Duration: {{LEAVE_DURATION}}s
  - Easing: {{LEAVE_EASING}}

Enter animation:
  - Effect: {{PAGE_ENTER}} (ej: fade in + y:20->0, overlay reveal, clip open)
  - Duration: {{ENTER_DURATION}}s
  - Easing: {{ENTER_EASING}}

Route-specific overrides (opcional):
  - {{ROUTE_1}}: {{OVERRIDE}} (ej: portfolio->case study usa clip reveal horizontal)
  - {{ROUTE_2}}: {{OVERRIDE}}
```

---

## 9. Scroll-linked animations

| Elemento | Comportamiento | Rango scroll | Intensidad mobile |
|---------|---------------|-------------|-------------------|
| {{ELEMENT_1}} | {{BEHAVIOR}} | {{SCROLL_RANGE}} | {{MOBILE}} |
| {{ELEMENT_2}} | {{BEHAVIOR}} | {{SCROLL_RANGE}} | {{MOBILE}} |
| {{ELEMENT_3}} | {{BEHAVIOR}} | {{SCROLL_RANGE}} | {{MOBILE}} |

Opciones de comportamiento:
- Parallax (different scroll speeds)
- Pin (section stays while content scrolls)
- Scrub (progress-based animation)
- Color change (bg transitions between sections)
- Scale (element grows/shrinks with scroll)
- Opacity (fade in/out based on scroll position)
- Rotation (element rotates with scroll)

---

## 10. Tecnicas especiales

> Marcar las que aplican a este proyecto y describir la implementacion.

- [ ] **Marquee/ticker:** {{DESC}} (ej: logos de clientes, 40px/s, pausar en hover)
- [ ] **Counter animation:** {{DESC}} (ej: stats section, duration 2s, snap integers)
- [ ] **Text split animation:** {{DESC}} (ej: hero headline char-by-char, manifesto lines)
- [ ] **Custom cursor:** {{DESC}} (ej: circulo 24px, escala a 64px en hover de links)
- [ ] **Magnetic buttons:** {{DESC}} (ej: CTAs principales, radio 100px, fuerza 0.3)
- [ ] **Smooth scroll:** {{DESC}} (ej: Lenis, lerp 0.1, wheel multiplier 1)
- [ ] **Image reveal:** {{DESC}} (ej: clip-path inset, direction from bottom, 0.8s)
- [ ] **Sticky sections:** {{DESC}} (ej: services section, pin durante 300vh)
- [ ] **Progress indicator:** {{DESC}} (ej: barra top del viewport, accent color)
- [ ] **Noise/grain overlay:** {{DESC}} (ej: canvas grain, opacity 0.03, animado 30fps)
- [ ] **Horizontal scroll:** {{DESC}} (ej: portfolio section, pin + scrub horizontal)
- [ ] **Cursor trail:** {{DESC}} (ej: particulas que siguen el mouse, decay 0.95)

---

## 11. 3D scene motion integration

> Como la escena 3D interactua con el scroll, el mouse, y el estado de la pagina.
> Este bloque lo lee el `threejs-3d` skill. Si no hay 3D, eliminar esta seccion.

- **Scroll interaction:** {{3D_SCROLL}} (ej: camera orbit lento con scroll progress, particles density cambia, shader uniforms driven by scroll)
- **Mouse/pointer interaction:** {{3D_MOUSE}} (ej: scene rota suavemente hacia cursor, particulas se repelen del mouse, parallax interno)
- **Page state interaction:** {{3D_PAGE_STATE}} (ej: al hacer hover en un CTA las particulas se aceleran, al scrollear past hero la escena se desvanece)
- **Transition behavior:** {{3D_TRANSITION}} (ej: escena persiste entre paginas, se destruye al navegar, cambia parametros por ruta)
- **Mobile fallback:** {{3D_MOBILE}} (ej: reducir particulas 50%, desactivar mouse tracking, static fallback image)

---

## 12. Form & feedback animations

> Microinteracciones para formularios (contacto, newsletter, login).

| Elemento | Animacion | Duracion | Notas |
|---------|-----------|----------|-------|
| Input focus | {{INPUT_FOCUS}} (ej: border color transition, label float up) | {{DURATION}} | CSS transition, no GSAP |
| Input error | {{INPUT_ERROR}} (ej: shake horizontal 3px, border red) | {{DURATION}} | Breve, no agresivo |
| Form submit success | {{FORM_SUCCESS}} (ej: checkmark draw SVG, fade in message) | {{DURATION}} | |
| Form submit error | {{FORM_ERROR}} (ej: shake container, red flash) | {{DURATION}} | |
| Toast/notification | {{TOAST}} (ej: slide in from right, auto-dismiss 4s) | {{DURATION}} | |

---

## 13. prefers-reduced-motion

> SIEMPRE documentar que se desactiva.

Cuando `prefers-reduced-motion: reduce` esta activo:
- [ ] Hero timeline: mostrar todo sin animacion, visible inmediato
- [ ] Scroll reveals: elementos visibles sin transicion
- [ ] Hover effects: solo cambios de color, sin transform
- [ ] Parallax: desactivado, posiciones estaticas
- [ ] Marquee: pausado o estatico
- [ ] 3D scene: imagen estatica fallback o version simplificada
- [ ] Page transitions: corte directo, sin animacion
- [ ] Custom cursor: desactivado, cursor nativo
- [ ] Counters: mostrar valor final sin animacion

---

## 14. Performance guards

| Regla | Implementacion |
|-------|---------------|
| Solo animar transform + opacity | Nunca width, height, top, left |
| will-change solo activo | Agregar antes de animar, quitar despues |
| ScrollTrigger batch | Agrupar reveals del mismo tipo |
| Cleanup obligatorio | gsap.context() + onBeforeUnmount revert |
| Throttle scroll events | requestAnimationFrame wrapper |
| Mobile: reducir complejidad | Menos particulas, menos layers |
| Mobile: particle budget | Max {{NUMBER}} particulas (desktop: {{NUMBER}}) |
| Mobile: disable expensive effects | {{EFFECTS_TO_DISABLE}} (ej: custom cursor, grain, horizontal scroll) |
| Total concurrent tweens | Max {{NUMBER}} en viewport simultaneo |

---

## Checklist

- [ ] Personalidad de motion es unica (no el default)
- [ ] Easing signature elegido (no power3.out por default)
- [ ] Easing secundario definido
- [ ] CSS easing equivalent documentado (cubic-bezier)
- [ ] Preloader/loading animation definido (o marcado como "none")
- [ ] Hero timeline tiene pasos con tiempos exactos
- [ ] Cada seccion del Homepage usa tecnica diferente
- [ ] TODAS las paginas tienen tecnicas per-section (no solo resumen)
- [ ] Hover interactions definidas para cards, buttons, links, images, nav items
- [ ] Focus states definidos para accesibilidad
- [ ] Navigation animations definidas (scroll hide/show, mobile menu, hamburger)
- [ ] Page transitions definidas con duraciones y easings
- [ ] Scroll-linked animations documentadas con intensidad mobile
- [ ] 3D scene motion integration documentada (o seccion eliminada si no hay 3D)
- [ ] Form & feedback animations documentadas (focus, error, success, toast)
- [ ] Tecnicas especiales marcadas con descripcion de implementacion
- [ ] prefers-reduced-motion cubierto incluyendo custom cursor y counters
- [ ] Performance guards documentados con budgets mobile
- [ ] Paginas no aplicables al proyecto fueron ELIMINADAS (no dejadas vacias)
