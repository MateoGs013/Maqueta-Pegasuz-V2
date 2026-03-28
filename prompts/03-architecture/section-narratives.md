# Prompt: Section Narratives

> Fase: Architecture | Output: Narrativa detallada por seccion
> Para cuando el page-plan necesita mas detalle narrativo.

---

## Prompt

```
Para la pagina {{PAGE_NAME}} de {{PROJECT_NAME}}, desarrolla la narrativa
detallada de cada seccion.

PARA CADA SECCION del page-plan:

1. INTENCION NARRATIVA
   - Que debe SENTIR el usuario al ver esta seccion?
   - Que informacion nueva recibe?
   - Que pregunta responde?
   - Que accion debe querer tomar?

2. JERARQUIA VISUAL
   - Que es lo primero que ve el ojo? (focal point)
   - Que es lo segundo? (supporting element)
   - Que es lo tercero? (detail/action)
   - Regla: si todo grita, nada se escucha

3. TRANSICION NARRATIVA
   - Como conecta con la seccion anterior?
   - Que ritmo establece para la siguiente?
   - Hay un shift de tono? (ej: de informativo a emocional)

4. ESPACIO Y RITMO
   - Esta seccion necesita mucho aire (contemplativa)?
   - O es densa con informacion (energetica)?
   - Cuanto espacio vertical ocupa? (1 viewport, 0.5, 2+)

EJEMPLO DE NARRATIVA BIEN HECHA:

Seccion 3 — Energy Break (Stats)
- Intencion: resetear ritmo despues de 2 secciones densas. Impactar con numeros.
- Focal point: los numeros grandes con counter animation
- Supporting: labels descriptivos debajo de cada numero
- Transicion: los numeros validan lo dicho en las secciones anteriores
  y preparan para la evidencia visual del portfolio que viene
- Espacio: 0.5-0.7 viewport, compacto pero con aire lateral
```

---

## Ejemplo extendido: mala vs buena narrativa

### Seccion 5 — Portfolio de una agencia de branding

**Mala:**
```
Seccion 5 - Portfolio
Intencion: mostrar trabajo
Jerarquia: imagenes
Transicion: viene despues de servicios
Espacio: normal
```
(No dice nada util. "Mostrar trabajo" es obvio. No hay detalle narrativo.)

**Buena:**
```
Seccion 5 — "Lo que hacemos habla mejor que lo que decimos" (Evidence)
Intencion: Despues de 2 secciones explicando servicios y proceso (informacion densa),
  esta seccion le dice al cerebro: "ok, basta de leer. MIRA." El usuario debe sentir
  admiracion y curiosidad. La pregunta que responde: "Son realmente buenos?"
  Accion deseada: clickear un case study para ver el detalle.
Jerarquia:
  1. Las imagenes de portfolio (focal point dominante, 70% superficie)
  2. Los nombres de proyecto + industria (contexto rapido)
  3. El boton "Ver caso completo" por cada card (accion)
Transicion: Viene despues de "Proceso" (racional/secuencial). Esta seccion
  es un cambio a visual/emocional. El layout pasa de timeline horizontal a
  grid asimetrico. Esto resetea el modo cognitivo del usuario.
Espacio: 1.5-2 viewports. Las imagenes necesitan aire para respirar.
  Grid asimetrico con gaps generosos (3-4 * spacing-unit).
```

---

## Common errors

- **Narrativa que describe lo obvio.** "Esta seccion muestra los servicios" no agrega informacion. La narrativa debe explicar POR QUE esta seccion esta aqui y QUE EFECTO tiene en el usuario.
- **No considerar la seccion anterior.** Cada seccion es una transicion. Si la anterior era densa y racional, esta deberia ser visual y emocional (o viceversa).
- **Jerarquia sin numeros.** Decir "la imagen es importante" es vago. Decir "la imagen ocupa 70% de la superficie, el titulo 20%, y el CTA 10%" es implementable.
- **No definir espacio vertical.** "Normal" no es una medida. 0.5 viewport (compacto), 1 viewport (standard), o 2+ viewport (scroll-pinned) son medidas claras.
- **Todas las secciones con el mismo tipo de transicion narrativa.** Si cada seccion "viene naturalmente despues de la anterior", no hay ritmo. Algunas transiciones deben ser abruptas (cambio de modo), otras fluidas (continuacion).
- **No conectar con el content-brief.** La narrativa debe referenciar el copy exacto que va en la seccion.

---

## Pipeline connection

```
Input: page-planning.md (secciones definidas)
     + content-brief.md (copy por seccion)
Output de este prompt -> Narrativa detallada por seccion
  Alimenta:
    - page-scaffold skill (ritmo, espacio, jerarquia)
    - vue-component skill (que es focal, supporting, detail)
    - gsap-motion skill (que aparece primero, segundo, tercero)
    - responsive-review (como cambia la jerarquia en mobile)
```

## Output esperado

Narrativa detallada que enriquece el page-plan y guia la implementacion.
