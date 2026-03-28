# 3D Reference: Particle Systems

> Sistemas de particulas para crear profundidad y vida.
> Tier 1-2 de complejidad.

---

## Tipos de sistema de particulas

### 1. Floating Dots
- Puntos simples flotando suavemente
- Conexiones opcionales entre puntos cercanos (constellation)
- **Complejidad:** baja | **Carga:** baja
- **Best for:** tech, minimal, data-driven

### 2. Bokeh / Light Points
- Puntos con blur y variacion de tamano
- Efecto fotografico de profundidad de campo
- **Complejidad:** baja | **Carga:** baja
- **Best for:** luxury, cinematico, nocturno

### 3. Snow / Dust
- Particulas cayendo suavemente con wind drift
- Efecto ambiental sutil
- **Complejidad:** baja | **Carga:** baja
- **Best for:** seasonal, atmosferico, sereno

### 4. Fireflies / Sparks
- Puntos con glow que parpadean
- Movimiento organico, no lineal
- **Complejidad:** media | **Carga:** baja-media
- **Best for:** magico, natural, nocturno

### 5. Galaxy / Spiral
- Particulas organizadas en espiral o galaxia
- Rotacion lenta, profundidad con perspectiva
- **Complejidad:** media | **Carga:** media
- **Best for:** tech, startup, futurista

### 6. Interactive Field
- Particulas que reaccionan al mouse (repel/attract)
- Engagement directo con el usuario
- **Complejidad:** media | **Carga:** media
- **Best for:** portfolios interactivos, hero sections

### 7. Text/Shape Particles
- Particulas que forman texto o formas
- Morph entre estados
- **Complejidad:** alta | **Carga:** media-alta
- **Best for:** hero statements, logos animados

---

## Parametros por sistema

| Parametro | Rango tipico | Notas |
|----------|-------------|-------|
| Count | 100-5000 | Mobile: 50% del desktop |
| Size | 1-8px | Variacion random para profundidad |
| Speed | 0.001-0.01 per frame | Slow = premium, fast = energetico |
| Opacity | 0.1-0.8 | Variacion para profundidad |
| Color | 1-3 del brand palette | Nunca random |
| Connection distance | 100-200px | Solo si constellation style |
| Mouse influence radius | 100-300px | Solo si interactivo |

## Performance

| Count | Desktop FPS | Mobile FPS | Recommendation |
|-------|-----------|-----------|---------------|
| 100 | 60 | 60 | Safe for any device |
| 500 | 60 | 50-60 | Good default |
| 1000 | 60 | 30-45 | Reduce on mobile |
| 5000 | 50-60 | < 30 | Desktop only, GPU particles |
| 10000+ | 30-50 | Skip | Need instanced mesh or GPU compute |
