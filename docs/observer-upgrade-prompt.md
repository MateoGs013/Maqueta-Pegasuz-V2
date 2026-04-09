# Observer Upgrade — Interactive Experience Support

Necesito que mejores el observer y el quality pipeline para que mida correctamente experiencias interactivas (wheel-driven, canvas-based, single-viewport). Actualmente el observer solo captura screenshots estaticos y no puede evaluar:

## Problemas actuales

### 1. Wheel-driven experiences
Sitios donde el scroll no es nativo sino wheel events que cambian estados (como un morphing grid). El observer necesita simular `wheel` events con deltaY > 50 para capturar cada estado.

### 2. Canvas depth
El observer ve `<canvas>` como elementos vacios. Necesita contar canvas elements como capas de profundidad reales (cada `<canvas>` visible = +1 z-layer en el score de depth).

### 3. Runtime GSAP
El observer busca GSAP en el HTML estatico pero las animaciones se registran en `onMounted()`. Necesita ejecutar JS y detectar `gsap` en `window` o registros de ScrollTrigger/tweens activos via `gsap.globalTimeline.getChildren()`.

### 4. Grain loop false positive
`animation: grain` con `steps()` es intencional para texture noise. No deberia contar como FAIL en animations. Agregar excepcion para animaciones con `steps()` en elementos con clase `grain` o `aria-hidden="true"`.

### 5. Single-viewport composition
Sitios que son 100vh sin scroll natural. El observer los mide como "1 seccion" con 0 compositional breaks. Necesita detectar absolute-positioned children como sub-composiciones dentro del viewport.

## Archivos a modificar

- `scripts/capture-refs.mjs` — agregar wheel event simulation despues de las capturas normales. Hacer N wheel events (configurable, default 5), esperar 1s entre cada uno, capturar screenshot de cada estado.

- `scripts/refresh-quality.mjs` (o el scorer que genera observer.json/critic.json) — actualizar las heuristicas:
  - Depth: contar `<canvas>` visibles como layers
  - Motion: detectar GSAP runtime via page.evaluate
  - Composition: contar children con position:absolute como sub-compositions
  - Animations: excluir grain/noise loops intencionales

- `scripts/` cualquier otro script que calcule los scores de excellence (composition/depth/typography/motion/craft).

## Criterio de exito

Un sitio como Coque (wheel-driven, 5 estados, 4 canvas layers, GSAP runtime) deberia scorear al menos 6-7/10 en observer despues de estos cambios, no 3.2/10. El score final deberia reflejar la calidad real de la experiencia.

## No cambiar

- La estructura de output (analysis.md, observer.json, scorecard.json, metrics.json)
- Los quality gates (contrast, images, headings, meta)
- El formato del REVIEW-SUMMARY.md
- La integracion con el panel Eros

Investiga los scripts, entende como calculan cada score, y hace los cambios necesarios. Mostra antes/despues de cada heuristica que modifiques.
