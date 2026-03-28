# Prompt: Motion Personality

> Fase: Motion | Output: docs/motion-spec.md completo
> Cada proyecto tiene coreografia de motion unica.

---

## Prompt

```
Define la coreografia de motion completa para {{PROJECT_NAME}} usando la template
en docs/_templates/motion-spec.template.md.

INPUT:
- Design brief: docs/design-brief.md (atmosfera, personalidad)
- Page plans: docs/page-plans.md (secciones y sus propositos)
- Brand personality: {{PERSONALITY}}

PERSONALIDADES DE MOTION A ELEGIR (no defaultear):

| Personalidad | Easing signature | Duration range | Character |
|-------------|-----------------|---------------|-----------|
| Cinematico | power4.out | 0.8-1.2s | Lento, preciso, revelador |
| Fluido | sine.inOut | 0.5-0.8s | Suave, continuo, natural |
| Staccato | steps(N) / power2.out | 0.3-0.5s | Rapido, definido, ritmico |
| Organico | elastic.out(1, 0.3) | 0.6-1.0s | Natural, imperfecto, vivo |
| Mecanico | power1.inOut | 0.4-0.6s | Preciso, industrial, funcional |
| Gravitacional | back.out(1.7) | 0.5-0.9s | Peso, inercia, rebote sutil |
| Experimental | custom bezier | variable | Unico, impredecible |

RESTRICCION: no elegir "Cinematico" por default. Cada proyecto tiene su propia personalidad.

PARA CADA SECCION del page-plan, asignar una tecnica DIFERENTE.
El catalogo de tecnicas esta en la template.

HERO TIMELINE: definir paso a paso con tiempos exactos (t=0.0s, t=0.3s, etc.)

HOVER INTERACTIONS: definir para cards, buttons, y links.

OUTPUT: docs/motion-spec.md completo con todas las secciones llenas.
```

---

## Ejemplo: buena vs mala asignacion de motion

### Hero timeline para una galeria de arte

**Mala:**
```
Hero: fadeIn 0.5s
Title: fadeIn 0.5s
Button: fadeIn 0.5s
```
(Todo con el mismo efecto, sin timeline, sin personalidad.)

**Buena:**
```
Hero entrance timeline (Cinematico — power4.out):
  t=0.0s  Canvas bg: opacity 0 -> 1 (0.8s, power2.out)
  t=0.3s  Glow orbs: scale 0 -> 1 (1.0s, elastic.out(1, 0.5))
  t=0.6s  Headline "Arte que habita": splitText chars, y:40 -> 0 (0.6s, power4.out, stagger 0.02)
  t=1.0s  Subtitle: opacity 0 -> 1, y:20 -> 0 (0.5s, power3.out)
  t=1.2s  CTA button: opacity 0 -> 1, scale 0.9 -> 1 (0.4s, back.out(1.7))
  t=1.4s  Scroll indicator: opacity 0 -> 1, y bounce loop

Total: ~2s. Secuencial pero con overlap. Cada elemento tiene su propia personalidad.
```

### Tecnicas diferentes por seccion

**Mala:** Todas las secciones usan `fadeUp` con los mismos parametros.

**Buena:**
| Seccion | Tecnica | Parametros | Por que |
|---------|---------|------------|---------|
| Sec 1 Hero | Split text + stagger | chars, 0.02 stagger | Impacto cinematico |
| Sec 2 Manifesto | Clip-path reveal | rect(0 0 0 100%) -> rect(0 100% 100% 0) | Revelacion dramatica |
| Sec 3 Stats | Counter animation | from 0 to value, 1.5s | Numeros necesitan movimiento propio |
| Sec 4 Services | Staggered cards | y:60, stagger 0.15, batch | Grid necesita ritmo grupal |
| Sec 5 Portfolio | Scale + parallax image | scale 0.8 -> 1, image parallax 0.3 | Imagenes grandes merecen profundidad |
| Sec 6 Process | Horizontal scroll pin | pin 3x viewport, scrub: true | Timeline necesita control del usuario |
| Sec 7 Testimonials | Crossfade slider | autoplay 5s, fade 0.6s | Testimonios rotan, no revelan |
| Sec 8 CTA | drawSVG underline + bounce | CTA text underline + button bounce | Urgencia final |

---

## Personalidades de motion por industria

| Industria | Personalidad sugerida | Easing signature | Caracter |
|-----------|----------------------|-----------------|----------|
| Gastronomia fine dining | Cinematico | power4.out, 0.8-1.2s | Lento, revelador, sensual |
| Fintech | Mecanico | power1.inOut, 0.3-0.5s | Preciso, eficiente, confiable |
| Inmobiliaria luxury | Fluido | sine.inOut, 0.6-0.9s | Suave, elegante, espacioso |
| Moda | Staccato | steps(N) / power2.out, 0.2-0.4s | Snappy, editorial, ritmico |
| Salud/Bienestar | Organico | elastic.out(1, 0.3), 0.6-1.0s | Natural, gentle, no brusco |
| SaaS | Gravitacional | back.out(1.7), 0.4-0.7s | Peso, bounce sutil, jugueton |
| Estudio creativo | Experimental | custom bezier, variable | Unico, sorpresivo |
| E-commerce | Fluido + rapido | power2.out, 0.3-0.5s | Rapido para no interrumpir la compra |

---

## Common errors

- **Defaultear a "Cinematico".** Es la eleccion mas comun y se vuelve generica. Un fintech con motion cinematico se siente lento. Un e-commerce se siente pesado. Elegir segun el rubro.
- **Mismo efecto en todas las secciones.** fadeUp en 10 secciones es monotono. Cada seccion necesita una tecnica diferente para mantener el interes.
- **Timeline del hero demasiado largo.** Mas de 2.5 segundos y el usuario ya quiere scrollear. El hero impresiona rapido y deja paso al contenido.
- **No definir tiempos exactos.** "Aparece con una animacion" no es implementable. t=0.3s, y:40->0, 0.6s, power3.out — eso es implementable.
- **Animaciones en layout properties.** NUNCA animar width, height, top, left. Solo transform (translate, scale, rotate) y opacity. Esto es un anti-pattern de performance.
- **Olvidar prefers-reduced-motion.** Todo el motion-spec debe especificar que se desactiva cuando reduced-motion esta activo. No es un nice-to-have, es obligatorio.
- **No asignar cleanup.** Cada animacion GSAP necesita gsap.context() + revert() en onBeforeUnmount. Sin cleanup, las animaciones se acumulan en memoria.

---

## Pipeline connection

```
Input: design-brief.md (personalidad, atmosfera)
     + page-plans.md (secciones con proposito por pagina)
     + brand-questionnaire.md (personalidad de marca)
Output de este prompt -> docs/motion-spec.md
  Alimenta directamente:
    - gsap-motion skill (implementacion de cada animacion)
    - page-scaffold skill (referencia de motion por seccion)
    - scroll-choreography.md (si se profundiza scroll)
    - interaction-patterns.md (hovers, forms, micro-interactions)
    - 3d-scope.md (motion del layer 3D)
```

## Siguiente paso

Ejecutar `05-3d/3d-scope.md` para definir elementos WebGL.
