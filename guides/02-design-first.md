# Guide: Design-First Methodology

> Por que y como aplicar design-first en cada proyecto.

---

## El principio

**No escribir CSS, no elegir colores, no definir spacing, no animar sin antes tener un plan de creative-design.**

El plan es el brief. El codigo es la ejecucion del brief.

## Por que design-first

| Sin brief | Con brief |
|-----------|----------|
| Colores elegidos al azar | Paleta justificada y unica |
| Tipografia "la de siempre" | Combinacion seleccionada por personalidad |
| Spacing inconsistente | Scale de 8px con tokens definidos |
| Motion generico (fade up) | Coreografia con personalidad |
| "Uh, le falta algo" | Atmosfera definida y coherente |
| Resultado: sitio template | Resultado: sitio con identidad |

## El flujo

```
1. Entender      -> Discovery (quien es, que quiere, como se ve)
2. Documentar    -> Foundation Docs (4 archivos de verdad)
3. Tokenizar     -> Design tokens CSS listos para usar
4. Construir     -> Codigo que ejecuta los tokens, no que inventa
5. Verificar     -> Cada pixel tiene referencia al brief
```

## Reglas inviolables

### Identidad unica, siempre
- NUNCA reutilizar la paleta de otro proyecto
- NUNCA reutilizar la combinacion tipografica de otro proyecto
- NUNCA defaultear a "dark + warm accent + power3.out + grain"
- Cada proyecto es una identidad nueva

### Variacion de animacion, siempre
- NUNCA el mismo fade-up en todas las secciones
- Cada seccion usa una tecnica diferente
- El motion tiene personalidad propia (no generico)

### 3D/WebGL, siempre
- CADA proyecto incluye al menos un elemento 3D
- Tier 1 minimo: shader atmosferico o campo de particulas
- 3D es herramienta de inmersion, no decoracion

### Tokens sobre valores, siempre
- Usar `var(--color-accent-primary)`, no `#ff6b35`
- Usar `var(--text-2xl)`, no `font-size: 2rem`
- Usar `var(--space-lg)`, no `padding: 24px`
- Si un valor no tiene token, crear el token primero

## Como verificar que se esta siguiendo el brief

| Pregunta | Si la respuesta es "no" |
|----------|----------------------|
| Este color esta en el design-brief? | Cambiar al token correcto |
| Esta tipografia esta en el design-brief? | Cambiar a la font correcta |
| Esta animacion esta en el motion-spec? | Definirla o cambiarla |
| Este copy esta en el content-brief? | Agregar al brief primero |
| Esta seccion esta en el page-plan? | Agregarla al plan primero |
