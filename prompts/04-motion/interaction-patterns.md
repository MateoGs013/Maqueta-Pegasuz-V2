# Prompt: Interaction Patterns

> Fase: Motion | Output: Catalogo de micro-interactions
> Las micro-interactions hacen la diferencia entre bueno y premium.

---

## Prompt

```
Define el catalogo de micro-interactions para {{PROJECT_NAME}}.

1. HOVER STATES (cada tipo de elemento)

   CARDS:
   - Trigger: mouseenter
   - Animation: {{CARD_HOVER}} (ej: image scale 1.05, shadow increase, overlay fade)
   - Duration: {{DURATION}}
   - Easing: {{EASING}}
   - Exit: reverse con duracion ligeramente menor

   BUTTONS (primary):
   - Trigger: mouseenter
   - Animation: {{BTN_HOVER}} (ej: bg slide from left, icon arrow move right)
   - Duration: {{DURATION}}
   - Click feedback: {{CLICK}} (ej: scale 0.97 then back, 0.15s)

   LINKS / NAV:
   - Trigger: mouseenter
   - Animation: {{LINK_HOVER}} (ej: underline draw from left, color shift)
   - Active state: {{ACTIVE}} (ej: underline stays, weight change)

   IMAGES:
   - Trigger: mouseenter
   - Animation: {{IMG_HOVER}} (ej: slight zoom, brightness increase)

2. FORM INTERACTIONS
   - Focus: {{FOCUS}} (ej: border color accent, label float up)
   - Validation success: {{SUCCESS}} (ej: green checkmark fade in)
   - Validation error: {{ERROR}} (ej: shake + red border + message)
   - Submit loading: {{LOADING}} (ej: button text -> spinner, disable)
   - Submit success: {{SUBMIT_SUCCESS}} (ej: checkmark animation, redirect)

3. LOADING STATES
   - Skeleton: {{SKELETON_STYLE}} (ej: shimmer gradient, pulse opacity)
   - Transition to content: {{TRANSITION}} (ej: fade from skeleton to real)

4. FEEDBACK
   - Toast/notification: {{TOAST}} (ej: slide from top, auto dismiss 4s)
   - Copy to clipboard: {{COPY}} (ej: tooltip "Copiado!" fade in/out)

5. NAVIGATION
   - Mobile menu open: {{MENU_OPEN}} (ej: fullscreen overlay slide from right)
   - Mobile menu close: {{MENU_CLOSE}}
   - Hamburger icon animation: {{HAMBURGER}} (ej: morph to X)

6. CURSOR (si aplica)
   - Default: {{DEFAULT}} (ej: custom dot, blend mode difference)
   - Over interactive: {{OVER_INTERACTIVE}} (ej: scale up, label appear)
   - Over images: {{OVER_IMAGES}} (ej: "View" text appear)
   - Dragging: {{DRAGGING}} (ej: grab cursor, trail)
```

---

## Ejemplo: buena vs mala definicion

### Hover de card para un listado de propiedades

**Mala:**
```
Card hover: cambiar color
```
(Que color? Que mas cambia? Cual es la duracion? Como se revierte?)

**Buena:**
```
CARD HOVER (PropertyCard):
  Trigger: mouseenter
  Timeline:
    t=0: image scale 1 -> 1.06 (0.4s, power2.out)
    t=0: shadow 0 8px 30px rgba(0,0,0,0.08) -> 0 20px 60px rgba(0,0,0,0.15) (0.4s)
    t=0.05s: price tag y:0 -> y:-4px (0.3s, power2.out) — sutil float
    t=0.1s: "Ver propiedad" text opacity 0 -> 1, x:-10 -> 0 (0.3s, power3.out)
  Exit: reverse all, 0.3s (ligeramente mas rapido que enter)
  Mobile: tap muestra CTA, segundo tap navega
```

---

## Interaction catalogs por industria

| Industria | Card hover | Button hover | Link hover | Special |
|-----------|-----------|-------------|-----------|---------|
| Gastronomia | Image zoom + overlay con nombre del plato | Bg fill from left, icon arrow | Underline draw left-to-right | Menu items: price number count up on hover |
| Inmobiliaria | Image zoom + precio float + "Ver" CTA reveal | Bg slide + icon rotate | Color shift + underline | Map pins: scale up + tooltip on hover |
| Fintech | Border glow + subtle tilt | Fill + check icon morph | Underline + color accent | Number inputs: smooth increment/decrement |
| E-commerce | Image swap (front/back) + quick-add btn | Color invert + cart icon | Strikethrough price animation | Size selector: hover shows measurements |
| Portfolio | Image reveal from mask + project name | Magnetic follow cursor | Char-by-char color shift | Gallery: drag cursor + momentum scroll |

---

## Common errors

- **Hover sin exit animation.** Si la entrada es 0.4s pero la salida es instant, se siente roto. La salida debe ser un reverse con duracion ligeramente menor.
- **No considerar mobile.** Hover no existe en touch. Cada hover interaction necesita un equivalente tap/touch.
- **Form validation sin feedback visual.** Un campo que esta mal sin shake, sin color rojo, sin mensaje, es invisible. El error debe ser multimodal: color + texto + posicion.
- **Loading button que no se deshabilita.** Si el usuario puede clickear "Enviar" 5 veces mientras se procesa, genera 5 requests. Deshabilitar + spinner + texto de feedback.
- **Custom cursor en mobile.** Los custom cursors no existen en touch devices. Detectar touch con matchMedia('(hover: hover)').
- **Hamburger sin transicion.** El icono de hamburger que se convierte en X con una transicion suave es un detalle que se nota. Sin transicion, se siente un glitch.
- **Toast notifications que se acumulan.** Si cada accion genera un toast y no se auto-dismiss, la pantalla se llena. Limitar a 1-3 toasts visibles con auto-dismiss de 3-5s.

---

## Pipeline connection

```
Input: motion-personality.md (easing, durations, personalidad)
     + component-planning.md (que componentes existen)
Output de este prompt -> Catalogo de micro-interactions
  Alimenta:
    - vue-component skill (hover states por componente)
    - gsap-motion skill (implementacion de cada interaction)
    - css-review (hover consistency audit)
    - a11y-audit (focus states, keyboard alternatives)
```

## Output esperado

Catalogo de interactions que alimenta la implementacion de cada componente.
