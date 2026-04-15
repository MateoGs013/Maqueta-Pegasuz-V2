# Eros V7 — Workflow Completo

## La idea central

Eros no tiene "dos modos separados". Es UN SOLO cerebro con un ciclo continuo:

```
CONSTRUIR → APRENDER → MEJORAR → CONSTRUIR MEJOR
```

La diferencia es CUÁNDO aprende:

- **Durante el proyecto** → aprende de sus propias decisiones (auto-evaluación)
- **Después del proyecto** → aprende de tu feedback (training)

Ambas fuentes alimentan la MISMA memoria. No hay switch. No hay modo especial.

---

## Flujo completo: Proyecto nuevo

### 1. Vos decís `/project`

```
"Crear un sitio para un estudio de arquitectura. Dark cinematic. Referencias: sirnik.co"
```

### 2. Eros arranca autónomamente

```
┌─────────────────────────────────────────────────────────┐
│ FASE 0: DISCOVERY                                       │
│                                                         │
│  CEO parsea brief → identity.md                         │
│  CEO crea directorio → init-project.mjs                 │
│  CEO captura referencias → capture-refs.mjs             │
│  CEO analiza refs → reference-analyst agent              │
│  CEO extrae observatory → reference-observatory.md       │
│                                                         │
│  En cada paso:                                          │
│    eros-gate.mjs pre  → ¿puedo arrancar?                │
│    eros-state.mjs start → marcar IN_PROGRESS            │
│    [ejecutar]                                           │
│    eros-gate.mjs post → ¿pasó?                          │
│    eros-state.mjs advance → siguiente tarea             │
└─────────────────────────────────────────────────────────┘
```

### 3. Eros lee su memoria antes de diseñar

```
┌─────────────────────────────────────────────────────────┐
│ FASE 1: CREATIVE DIRECTION                              │
│                                                         │
│  eros-context.mjs design-brief                          │
│    ↓ lee automáticamente:                               │
│    ├── font-pairings.json → "Cormorant funciona para    │
│    │   editorial, Bebas para brutalist" (MEDIUM)         │
│    ├── color-palettes.json → "Copper en warm amber       │
│    │   funciona, purple es AI fingerprint" (HIGH)        │
│    ├── revision-patterns.json → "Los heroes text-only    │
│    │   son rechazados, siempre poner imágenes" (HIGH)    │
│    └── rules.json → "Inter/Roboto = AI fingerprint"      │
│                      (PROMOTED)                          │
│                                                         │
│    Genera: context/design-brief.md                       │
│    CON bloque "## Memory Insights" inyectado             │
│    CON bloque "## Reference Observatory" inyectado       │
│                                                         │
│  Spawn designer → DESIGN.md + tokens.md + pages/*.md    │
│                                                         │
│  eros-gate.mjs designer → 12-point validation           │
│                                                         │
│  eros-memory.mjs learn --event font_selected            │
│  eros-memory.mjs learn --event palette_selected         │
│  eros-log.mjs decision D-001, D-002, D-003             │
│                                                         │
│  ← La memoria CRECE en este momento, no al final        │
└─────────────────────────────────────────────────────────┘
```

### 4. Para cada sección, threshold dinámico

```
┌─────────────────────────────────────────────────────────┐
│ FASE 3: SECTIONS (por cada S-Hero, S-Work, etc.)        │
│                                                         │
│  eros-context.mjs section --section S-Hero              │
│    ↓ llama internamente a:                              │
│    ├── eros-memory.mjs interpret --task-type build      │
│    │   → "SplitText char reveal avg 7.8, Clip-path      │
│    │      avg 8.2" (HIGH)                                │
│    │   → "Usuarios agrandan imágenes de hero" (MEDIUM)   │
│    └── eros-memory.mjs threshold --section-type hero    │
│        → scoreMinimum: 7.8 (basado en 2 heroes          │
│          históricos, avg 8.1)                            │
│                                                         │
│  Genera: context/S-Hero.md con threshold + insights     │
│                                                         │
│  Spawn builder → S-Hero.vue + reports/S-Hero.md         │
│  Observer → capture-refs + refresh-quality               │
│                                                         │
│  eros-context.mjs evaluate --section S-Hero             │
│  Spawn evaluator → evaluations/S-Hero.md                │
│                                                         │
│  eros-gate.mjs post → APPROVE (score 8.2 > 7.8)        │
│                                                         │
│  eros-memory.mjs learn --event section_approved         │
│    → Escribe a signatures.json, section-patterns.json,  │
│      technique-scores.json                              │
│                                                         │
│  El próximo proyecto tendrá MÁS datos para              │
│  calcular thresholds más precisos                       │
└─────────────────────────────────────────────────────────┘
```

### 5. Cierre con gate obligatorio

```
┌─────────────────────────────────────────────────────────┐
│ FASE 5: INTEGRATION                                     │
│                                                         │
│  CEO escribe router, views, App.vue, SEO                │
│  Observer final pass                                     │
│                                                         │
│  eros-gate.mjs completion                               │
│    ├── observerRan: ✓                                   │
│    ├── qualityRefreshed: ✓                              │
│    ├── scorecardNonZero: ✓ (7.8/10)                    │
│    ├── queueComplete: ✓ (24/24 done)                   │
│    ├── evaluationsComplete: ✓ (5/5 evaluations)        │
│    └── queueSynced: ✓                                  │
│                                                         │
│  Si FALLA → ejecuta recovery actions → re-chequea       │
│  NO PUEDE cerrar Phase 5 hasta que todo pase            │
└─────────────────────────────────────────────────────────┘
```

### 6. Retrospective + sesión de training

```
┌─────────────────────────────────────────────────────────┐
│ FASE 6: RETROSPECTIVE                                   │
│                                                         │
│  eros-memory.mjs stats → 43 → 58 data points (creció)  │
│  eros-memory.mjs promote → RULE-005 promovida           │
│                                                         │
│  eros-train.mjs init → genera session.json              │
│                                                         │
│  CEO anuncia: "Proyecto terminado. Training listo."     │
└─────────────────────────────────────────────────────────┘
```

---

## Flujo de training (cuando vos querés enseñarle)

Podés entrenar en cualquier momento — no necesitás un proyecto activo.

### Opción A: Training rápido (mientras revisás)

```
Vos: "El hero me parece un 9, excelente profundidad"

CEO ejecuta:
  node eros-train.mjs rate --project /Desktop/coque \
    --section S-Hero --rating 9 --feedback "Excelente profundidad"

Output: { brainScore: 8.0, userRating: 9, delta: +1.0 }
→ El brain ahora sabe que underscored este hero por 1 punto
```

### Opción B: Training completo (sesión de review)

```
Vos: "Entrenar con el proyecto coque"

CEO ejecuta:
  node eros-train.mjs init --project /Desktop/coque

→ Genera session.json con todas las secciones y decisiones
→ Te presenta cada una:

  "S-Hero — Brain score: 8.0 | Signature: phantom architecture
   Técnicas: SplitText char reveal + 3-plane parallax
   ¿Tu rating? ¿Feedback?"

Vos: "9. Perfecto el back-type, me encanta la profundidad."
Vos: "S-FeaturedWork — 7. El curtain reveal es muy lento."
Vos: "S-Marquee — 8. Bien el contra-scroll."
Vos: "Nueva regla: los curtain reveals no pueden durar más de 600ms"

CEO ejecuta:
  node eros-train.mjs ingest --project /Desktop/coque

→ Propaga ratings a section-patterns.json (ajusta scores)
→ Propaga feedback a revision-patterns.json
→ Agrega regla como CANDIDATE en rules.json
→ Cuando la valide 2 veces más → se promueve a PROMOTED

  node eros-train.mjs calibrate --project /Desktop/coque

→ Output: {
    avgDelta: +0.5,
    bias: "brain underscores by 0.5",
    thresholdAdjustment: +0.25
  }

→ El threshold global sube 0.25 puntos
→ Próximos proyectos tienen barra más alta
```

---

## Cómo crece la inteligencia

```
Proyecto 1:
  Memory: 43 data points
  Thresholds: mayormente defaults (7.0)
  Insights: MEDIUM confidence en todo
  
  → Entrenas: +15 data points
  → Calibración: brain underscores by 0.3

Proyecto 2:
  Memory: 58 data points
  Thresholds: hero 7.8, features 7.5 (dinámicos)
  Insights: algunos HIGH confidence
  Threshold adjustment: +0.15
  
  → Entrenas: +12 data points
  → Calibración: brain underscores by 0.1 (mejorando)

Proyecto 5:
  Memory: 120 data points
  Thresholds: hero 8.2, features 8.0 (subieron)
  Insights: mayoría HIGH confidence
  Rules: 3 nuevas PROMOTED
  Threshold adjustment: +0.05 (casi calibrado)
  
  → El brain produce trabajo que matchea tu estándar
  → No necesitás entrenar tanto

Proyecto 10:
  Memory: 200+ data points
  Thresholds: estables y altos
  Insights: todas HIGH, patrones claros
  Rules: 10+ PROMOTED (se aplican automáticamente)
  
  → El brain ES tu estándar
  → Solo entrenás si cambiás de criterio
```

---

## Lo que NO tenés que hacer

- No tenés que revisar cada sección mientras se construye
- No tenés que aprobar paletas ni fonts (el brain decide basado en memoria)
- No tenés que recordarle reglas (están en rules.json y se inyectan automáticamente)
- No tenés que checkear si se olvidó de algo (los gates bloquean si falta algo)
- No tenés que actualizar archivos de estado (los scripts lo hacen)

## Lo que SÍ tenés que hacer

- Dar el brief inicial (nombre, tipo, mood, referencias)
- Entrenar después del proyecto (ratings + feedback)
- Agregar reglas nuevas cuando descubrís un patrón
- Decir "train" cuando querés enseñarle algo

---

## Resumen de scripts

| Script | Para qué | Quién lo usa |
|--------|----------|-------------|
| `eros-state.mjs` | Mover el estado (query/start/advance/retry/flag) | CEO en cada turn |
| `eros-memory.mjs` | Leer/escribir memoria inteligente | CEO antes/después de cada tarea |
| `eros-gate.mjs` | Verificar pre/post condiciones | CEO antes/después de cada tarea |
| `eros-context.mjs` | Armar context files con insights | CEO antes de cada agent spawn |
| `eros-log.mjs` | Loguear aprobaciones y decisiones | CEO después de cada evaluación |
| `eros-train.mjs` | Sesiones de training con tu feedback | Vos, cuando querés enseñarle |
