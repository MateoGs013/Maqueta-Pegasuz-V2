# Prompt: Shader Brief

> Fase: 3D | Output: Spec detallada para shaders custom
> Usar cuando el 3D scope requiere shaders personalizados.

---

## Prompt

```
Necesito un shader custom para {{PROJECT_NAME}}.

CONCEPTO VISUAL: {{CONCEPT}} (ej: "aurora boreal sutil", "ruido organico fluido")
DONDE SE USA: {{PLACEMENT}} (ej: hero background, section transition)
PALETTE: {{COLORS}} (2-4 colores del design-brief)

TIPO DE SHADER:

| Tipo | Descripcion | Uso tipico |
|------|------------|-----------|
| Gradient noise | Movimiento organico de color | Backgrounds atmosfericos |
| Voronoi | Celdas organicas | Texturas naturales |
| Simplex/Perlin noise | Terreno, nubes, humo | Paisajes abstractos |
| Fractal brownian motion | Complejidad organica | Atmosfera detallada |
| Ray marching | Formas 3D en fragment shader | Objetos procedurales |
| Distortion | Warp del espacio | Efectos de calor, agua |
| Particle shader | Puntos en GPU | Campos de particulas |

UNIFORMS NECESARIOS:
- uTime: float (animacion continua)
- uMouse: vec2 (posicion del mouse normalizada, si interactivo)
- uResolution: vec2 (tamano del canvas)
- uScroll: float (progreso de scroll, si scroll-linked)
- uColor1, uColor2, uColor3: vec3 (colores del design-brief)

REQUISITOS:
- 60fps en desktop (max 16ms frame time)
- Mobile: reducir complejidad (menos octaves, menos samples)
- El shader debe COMPLEMENTAR el contenido, no competir con el
- Intensidad configurable via uniform para poder ajustar

OUTPUT: descripcion del shader con pseudocodigo GLSL de la logica principal.
```

---

## Ejemplo: buena vs mala definicion

### Shader para fondo de hero de un SaaS de productividad

**Mala:**
```
Shader: gradient animado con colores del brand.
```
(Que tipo de gradient? Velocidad? Direccion? Que pasa con el mouse?)

**Buena:**
```
TIPO: Gradient noise (Simplex 2D)
CONCEPTO: "Flujo de pensamiento" — movimiento suave de color que evoca concentracion

COLORES (del design-brief):
  uColor1: vec3(0.286, 0.341, 0.949) — #4957F2 (primary blue)
  uColor2: vec3(0.604, 0.286, 0.949) — #9A49F2 (accent purple)
  uColor3: vec3(0.949, 0.286, 0.604) — #F2499A (highlight pink)

LOGICA PRINCIPAL:
  // Fragment shader pseudocodigo
  float noise = snoise(uv * 2.0 + uTime * 0.1);  // Movimiento lento
  float pattern = smoothstep(-0.2, 0.8, noise);    // Transiciones suaves
  vec3 color = mix(mix(uColor1, uColor2, pattern), uColor3, pattern * 0.3);
  // Mouse influence: blend sutil hacia el cursor
  float mouseDist = distance(uv, uMouse);
  color = mix(color, uColor3, smoothstep(0.3, 0.0, mouseDist) * 0.2);

UNIFORMS:
  uTime: incrementa 0.001 por frame (muy lento)
  uMouse: normalizado 0-1, smooth-lerped (no raw)
  uResolution: para aspect ratio correction
  uIntensity: 0.7 default, reducible para ajustar

MOBILE:
  Reducir: noise octaves 4 -> 2 (half los samples)
  Desactivar: mouse influence (no hover en touch)
  Resolution: canvas a 0.5x (half resolution)

PERFORMANCE TARGET:
  Desktop: <2ms fragment shader
  Mobile: <4ms fragment shader
```

---

## Shaders por tipo de proyecto

| Proyecto | Shader recomendado | Complejidad | Mood |
|----------|-------------------|------------|------|
| Fintech | Gradient noise suave | Baja | Profesional, en control |
| Estudio creativo | FBM (fractal brownian motion) | Media | Organico, detallado |
| Musica/Nightlife | Voronoi + distortion | Media-Alta | Electrico, energetico |
| Inmobiliaria luxury | Light rays / god rays | Media | Luminoso, aspiracional |
| Bienestar | Simplex flow field | Baja | Calmo, fluido |
| Tech startup | Ray marching (blob) | Alta | Futurista, llamativo |
| Gastronomia | Gradient mesh calido | Baja | Acogedor, sensorial |

---

## Common errors

- **Shader demasiado complejo para lo que muestra.** Un ray marching de 500 lineas para mostrar un gradient es overkill. Usar la tecnica mas simple que logre el efecto.
- **No smooth-lerpear el mouse.** Si el mouse uniform se actualiza raw cada frame, el shader jitters. Siempre interpolar la posicion del mouse con lerp.
- **uTime sin control de velocidad.** Si uTime incrementa con deltaTime sin multiplicador, la velocidad del shader depende del framerate. Usar un multiplicador configurable.
- **Colores en sRGB sin conversion.** Los shaders trabajan en linear space. Pasar colores sRGB sin gamma correction produce colores lavados.
- **No testear en GPU integrada.** El shader puede correr a 120fps en una RTX 4090 pero a 15fps en una Intel UHD 620 integrada. Testear en hardware bajo.
- **Shader que compite con el texto.** Si los colores y el movimiento son tan intensos que el headline es ilegible, el shader fallo. El contenido siempre gana.
- **No incluir uniform de intensidad.** Sin un uIntensity uniform, no se puede bajar la fuerza del efecto sin tocar el GLSL. Siempre incluir un knob de intensidad.

---

## Pipeline connection

```
Input: 3d-scope.md (tier elegido, concepto visual)
     + design-brief.md (paleta, tokens de color)
Output de este prompt -> Brief tecnico de shader
  Alimenta:
    - threejs-3d skill (implementacion del shader)
    - perf-check (GPU performance budget)
```

## Output esperado

Brief tecnico que guia la implementacion del shader en `threejs-3d`.
