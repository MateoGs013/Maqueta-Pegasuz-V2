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

## Reglas

| Regla | Razon |
|-------|-------|
| Total transition < 0.8s | Mas lento se siente broken |
| mode="out-in" | Evita overlap de paginas |
| Scroll to top on enter | User espera estar arriba |
| prefers-reduced-motion: skip | Corte directo sin animacion |
| Loading state if slow | Si la pagina tarda, mostrar loading |
