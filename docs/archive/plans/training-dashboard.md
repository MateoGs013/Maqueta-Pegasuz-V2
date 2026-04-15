# Plan: Training Dashboard Completo

> **Status:** `implemented`
> **Last reviewed:** 2026-04-14

## Objetivo

Visibilidad total del auto-training desde el panel. Ver qué está pasando
en tiempo real, revisar historial, y lanzar sesiones sin tocar la terminal.

## Componentes

### 1. Live Status (tiempo real)

**Archivo de estado:** `design-intelligence/auto-train-status.json`

```json
{
  "running": true,
  "sessionId": "practice-1712412345678",
  "phase": 4,
  "phaseLabel": "Running observer...",
  "totalPhases": 10,
  "startedAt": "2026-04-06T15:00:00Z",
  "elapsed": 342,
  "currentSection": "S-Hero",
  "reference": { "title": "Artefakt", "url": "https://artefakt.mov/" }
}
```

**Flujo:**
1. `eros-auto-train.mjs` escribe este archivo al inicio de cada fase
2. El panel pollea `/__eros/training/auto-train-status` cada 3s (o SSE)
3. UI muestra: fase actual, barra de progreso, timer, referencia

**Cambios en auto-train:**
```javascript
const updateStatus = async (data) => {
  await writeJson(statusPath, {
    ...data,
    elapsed: Math.round((Date.now() - sessionStart) / 1000),
    updatedAt: new Date().toISOString(),
  })
}

// Al inicio de cada fase:
await updateStatus({ running: true, phase: 4, phaseLabel: 'Running observer...' })

// Al terminar:
await updateStatus({ running: false, phase: 10, phaseLabel: 'Complete' })
```

### 2. SSE Progress Stream

Para feedback más granular que el polling:

**Endpoint:** `/__eros/training/auto-train-stream` (SSE)

```javascript
server.middlewares.use('/__eros/training/auto-train-stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  const interval = setInterval(async () => {
    const status = await readJson(statusPath)
    res.write(`data: ${JSON.stringify(status)}\n\n`)
  }, 2000)

  req.on('close', () => clearInterval(interval))
})
```

**UI:**
```javascript
const evtSource = new EventSource('/__eros/training/auto-train-stream')
evtSource.onmessage = (e) => {
  trainStatus.value = JSON.parse(e.data)
}
```

### 3. Training History (persistido)

**Archivo:** `design-intelligence/training-history.json`

```json
{
  "sessions": [
    {
      "id": "practice-1712412345678",
      "date": "2026-04-06",
      "reference": { "title": "Artefakt", "url": "..." },
      "mood": "dark cinematic",
      "sections": ["S-Hero", "S-Features", "S-CTA"],
      "technique": "Stagger cascade",
      "duration": 580,
      "observer": { "composition": 7.2, "depth": 6.8, "typography": 7.5, "motion": 5.1, "craft": 6.0 },
      "audit": { "pct": 72, "pass": true },
      "gates": { "approved": 2, "retried": 1, "flagged": 0, "total": 3 },
      "rulesValidated": 4,
      "preview": "frame-000.png"
    }
  ]
}
```

### 4. Per-Session Detail View

Click en una sesión del historial → modal o panel lateral con:

- **Scores radar chart** (6 dimensiones del observer)
- **Audit breakdown** (5 capas, cada check pass/fail)
- **Gate results** por sección (APPROVE/RETRY/FLAG con reasons)
- **Reglas validadas** (cuáles se promovieron)
- **Preview screenshot** del proyecto
- **Referencia** con link al sitio original

### 5. Training Config

Panel de configuración para ajustar sin editar código:

| Setting | Default | UI |
|---------|---------|-----|
| Sessions por run | 1 | Number input |
| Max retries | 1 | Number input |
| Skip discover | false | Toggle |
| Auto-cleanup | true | Toggle |
| Gate threshold | 7.0 | Slider |

**Almacenado en:** `design-intelligence/training-config.json`

### 6. Training Trigger

Botón "Entrenar" en el panel:

```
POST /__eros/training/auto-train
Body: { count: 1, maxRetries: 1, skipDiscover: false }
```

El backend spawna el proceso en background y devuelve inmediatamente:
```json
{ "started": true, "sessionId": "practice-..." }
```

El panel cambia a modo "live" mostrando el status.

## UI Layout

```
┌─────────────────────────────────────────────┐
│ Entrenamiento Autónomo                      │
│                                             │
│ [▶ Entrenar]  [⚙ Config]    Status: Idle    │
│                                             │
│ ┌─ En vivo ──────────────────────────────┐  │
│ │ Fase 4/10: Running observer...         │  │
│ │ ████████████░░░░░░░░  40%   5:42       │  │
│ │ Ref: Artefakt · Mood: dark cinematic   │  │
│ └────────────────────────────────────────┘  │
│                                             │
│ ┌─ Historial ────────────────────────────┐  │
│ │ Fecha     Ref        Obs  Audit Gates  │  │
│ │ 04/06     Artefakt   7.1  72%  2/0/1   │  │
│ │ 04/05     Fluid Gl.  6.8  68%  3/0/0   │  │
│ │ 04/04     IYO        5.2  55%  1/1/1   │  │
│ └────────────────────────────────────────┘  │
│                                             │
│ ┌─ Detalle: Artefakt (04/06) ────────────┐  │
│ │ [preview.png]                          │  │
│ │ Comp: 7.2 Depth: 6.8 Typo: 7.5       │  │
│ │ Motion: 5.1 Craft: 6.0               │  │
│ │ Audit: a11y 57% seo 83% resp 67%     │  │
│ │ S-Hero: APPROVE (8.1)                 │  │
│ │ S-Features: RETRY → APPROVE (7.2)    │  │
│ │ S-CTA: APPROVE (7.5)                 │  │
│ │ Rules: +4 validated, 1 promoted       │  │
│ └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Estimación

| Componente | Esfuerzo |
|-----------|----------|
| Status file + write en auto-train | 1h |
| SSE endpoint | 30 min |
| History persistence | 30 min (ya parcialmente implementado) |
| History UI (tabla) | 1h |
| Detail view (modal/panel) | 2h |
| Radar chart (observer scores) | 1h |
| Config panel + persistence | 1h |
| Trigger endpoint + background spawn | 30 min |
| Live progress bar UI | 1h |
| Testing + polish | 1.5h |
| **Total** | **~10h** |

## Fases de implementación

1. **MVP (implementado ahora):** historial + botón lanzar
2. **Fase 2:** live status con polling + progress bar
3. **Fase 3:** SSE stream + detail view con scores
4. **Fase 4:** config panel + radar chart

## Prioridad

Alta. Sin visibilidad, el auto-training es difícil de evaluar y mejorar.
El MVP (historial + botón) da el 80% del valor con el 20% del esfuerzo.
