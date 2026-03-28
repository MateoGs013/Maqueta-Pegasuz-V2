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

## Output esperado

Catalogo de interactions que alimenta la implementacion de cada componente.
