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

## Output esperado

Brief tecnico que guia la implementacion del shader en `threejs-3d`.
