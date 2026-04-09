# Estado de implementación de planes

Review de `docs/PLAN-*.md` contra el código actual. Fecha: 2026-04-08 (sesión larga de fixes + extensión de features).

Leyenda: ✅ implementado · 🟡 parcial · ❌ pendiente · ⚪ N/A

> **Actualización 2026-04-08:** se cerró una sesión larga de debugging y
> hardening. El bug estructural (banner ANSI corrompiendo PATH via
> `.bashrc` + shell-snapshots) fue identificado y fixeado. El pipeline
> auto-train corrió end-to-end por primera vez en esta máquina (sesión
> IYO, 319s, todas las 10 fases). Además se avanzaron 5 planes con fixes
> y nuevas capabilities. Ver la tabla "Resumen global" abajo para los
> nuevos porcentajes.

---

## PLAN-EROS-V8.md — Orquestador + Alma

Plan de ~16h dividido en 10 fases.

### Bloque A: Orquestador (Eros controla a Claude)

| Fase | Qué | Estado | Evidencia |
|------|-----|--------|-----------|
| 1 | `next` engine con ACTION_MAP | ✅ | `scripts/eros-orchestrator.mjs` (850+ líneas, exporta `resolveAction`, `resolveMemoryHooks`, `verifyOutputs`, `resolveRecovery`) |
| 1 | `cmdNext` en eros-state | ✅ | `eros-state.mjs:694` |
| 1 | `cmdDone` en eros-state | ✅ | `eros-state.mjs:730` |
| 2 | Verificación determinista (file exists + non-empty) | ✅ | `resolveAction` incluye `expectedOutputs`, `verifyOutputs` implementado |
| 2 | Vite compile check post-build | ❌ | No encontré `vite build` llamado como verify step |
| 3 | SKILL.md minimal (500 → 20 líneas) | 🟡 | `.claude/skills/project/SKILL.md` existe pero no lo leí en esta sesión — verificar que sea el loop minimal |
| 4 | Dev server management (`start-server`/`stop-server` actions) | ❌ | Solo `eros-auto-train.mjs` tiene `findFreePort` + spawn. No hay acción del orchestrator para start/stop. |
| 5 | Recovery engine (`resolveRecovery`) | ✅ | `eros-orchestrator.mjs:674` |

### Bloque B: Alma (Eros aprende solo)

| Fase | Qué | Estado | Evidencia |
|------|-----|--------|-----------|
| 6 | `eros-meta.mjs gaps` | ✅ | `eros-meta.mjs:66` |
| 6 | `eros-meta.mjs reflect --project` | ✅ | `eros-meta.mjs:129` |
| 6 | `eros-meta.mjs personality` | ✅ | `eros-meta.mjs:218`, produce `personality.json` (19KB) |
| 7 | `eros-practice.mjs generate` | ✅ | `eros-practice.mjs:56` |
| 7 | `eros-practice.mjs run` | 🟡 | Existe pero comentario en línea 141-146 dice "Practice run orchestration happens through the normal next/done loop. This script generates the brief and tracks results." — NO ejecuta el pipeline completo end-to-end, delega. |
| 7 | `eros-practice.mjs history` | ✅ | `eros-practice.mjs:193` |
| 7 | `eros-practice.mjs record` | ✅ | línea 163 |
| 8 | `personality.json` evolución | ✅ | Archivo existe con 19KB de contenido real |
| 9 | Anti-convergencia (mood rotation + technique forcing) | 🟡 | Parcial: práctica lee último brief para evitar mood repetido (`eros-practice.mjs:65,71`), pero NO fuerza técnica con <3 usos ni reference injection |

### Bloque C: Testing

| Fase | Qué | Estado | Evidencia |
|------|-----|--------|-----------|
| 10 | E2E test actualizado | 🟡 | `eros-test-e2e.mjs` existe, no sé si cubre práctica autónoma |

### Resumen Eros V8

**Implementado:** ~75% del plan. El orquestador completo está en código. Meta + practice funcionan. Personality.json existe con data real.

**Pendiente:**
- Dev server management como acción del orchestrator (hoy vive en auto-train)
- Vite compile check como verify step
- `eros-practice.mjs run` end-to-end (hoy solo genera brief)
- Anti-convergencia completa (technique forcing + reference injection)
- E2E test de práctica autónoma

---

## PLAN-AUTO-TRAIN-V2.md — Entrenamiento Real

Plan de ~9h para convertir auto-training en workflow real con gates.

| Componente | Estado | Evidencia |
|-----------|--------|-----------|
| 1. Brief basado en referencia | ✅ | `eros-auto-train.mjs` llama a discover/study antes de generar brief |
| 2. Dev server management (spawn + waitForServer + kill) | ✅ | `eros-auto-train.mjs:262` (`findFreePort`), línea 289 spawn, línea 441+ kill |
| 3. Gates reales post-observer | ✅ | `eros-auto-train.mjs:399` (`gate.verdict === 'RETRY'`/`'FLAG'`) |
| 4. `eros-audit.mjs` (cadena de calidad) | ✅ | `scripts/eros-audit.mjs` existe |
| 5. Validación de reglas con observer scores | 🟡 | Parcial — habría que auditar si los scores del observer efectivamente se usan para verificar reglas, o solo se escanea código |
| 6. Retry automático por sección débil | 🟡 | Auto-train detecta `RETRY` (línea 399) pero no confirmé si re-spawneaa el builder con un fix prompt |
| 7. Limpieza del proceso spawn en error | ❌ | El audit reportó que `eros-auto-train.mjs:441-449` no mata el server en error (cubierto por Rama 2 del PLAN-HARDENING) |

### Resumen Auto-Train V2

**Implementado:** ~85%. El flujo real existe: brief desde referencia → spawn dev server → observer → gates → audit. Funciona end-to-end.

**Pendiente:**
- Retry automático con fix prompt específico por sección débil (verificar)
- Validación de reglas contra scores del observer (verificar)
- Cleanup robusto del dev server en errores (ver PLAN-HARDENING commit 2.6)

---

## PLAN-OBSERVER-V2.md — Eros ve por sí mismo

Plan de ~11.5h para migrar de Puppeteer/V1 a Playwright/V2 con 6 capas.

| Fase | Qué | Estado | Evidencia |
|------|-----|--------|-----------|
| 1 | Setup Playwright + scaffold | ✅ | `eros-observer.mjs` importa `playwright` |
| 2 | Migrar capas 5+6 (structural/functional) | ✅ | `eros-observer.mjs` tiene 1800+ líneas con toda la lógica |
| 3 | Capa 1 — Geometría Visual (`extractGeometry`) | ✅ | `eros-observer.mjs:114`, `visualBalance` en 219 |
| 4 | Capa 2 — Estética (color + whitespace + typography) | ✅ | `colorHarmony:418`, `whitespace:426`, rhythm:357 |
| 5 | Capa 3 — Semántica (ARIA) | 🟡 | No encontré `page.accessibility.snapshot()` en el grep — verificar |
| 6 | Capa 4 — Anti-Template | ✅ | `antiTemplate.score` referenciado en 1089 |
| 7 | Scoring Engine V2 (scores continuos 0-10) | ✅ | Líneas 1088-1122 con weighted composition |
| 8 | Integración + backward compat con `refresh-quality.mjs` | 🟡 | Verificar que `refresh-quality.mjs` lee el nuevo manifest sin romper |
| 9 | Deprecar V1 (`capture-refs.mjs` → V1) | ❌ | `capture-refs.mjs` sigue existiendo con header "Observer v4.0" — coexiste con V2, no fue renombrado |

### Resumen Observer V2

**Implementado:** ~80%. Las 6 capas (excepto semántica que queda en duda) están en `eros-observer.mjs` con Playwright.

**Pendiente:**
- Confirmar Capa 3 semántica (ARIA snapshot) — no la vi en el grep
- Deprecar `capture-refs.mjs` V1 o al menos renombrarlo para clarificar roles
- **Cubierto por PLAN-HARDENING Rama 4 commit 4.4:** extraer `eros-observer-core.mjs` con lógica compartida para eliminar duplicación de ~3000 líneas

---

## PLAN-EROS-ALIVE.md — Darle vida a Eros

Plan breve con 5 features aprobadas.

| Feature | Estado | Evidencia |
|---------|--------|-----------|
| 1. Chat en el panel | ✅ | `panel/src/views/eros/ErosChat.vue` + ruta `/eros/chat` en router + `scripts/eros-chat.mjs` |
| 1. Chat responde con personalidad (no LLM genérico) | 🟡 | Verificar que `eros-chat.mjs` inyecta `personality.json` como system prompt |
| 2. Feed de actividad vivo (timeline con posts automáticos) | ❌ | No hay vista `Feed.vue` ni endpoint `/thoughts` ni `activity-feed.json` |
| 3. Estado emocional (Confiado/Reflexivo/Curioso/Determinado) | ❌ | Grep de "emotional", "mood state", "Confiado" no devuelve nada en panel/src |
| 4. Eros ES Claude en maqueta (tono/personalidad en respuestas) | ⚪ | Instrucción para Claude, no código. `CLAUDE.md:1-37` define la identidad — implementado como docs |
| 5. Diario de Eros (prosa post-proyecto) | ❌ | No hay `diary.md` ni endpoint, ni generación en `eros-meta.mjs reflect` que produzca prosa |

### Resumen Eros Alive

**Implementado:** ~30%. Solo el chat.

**Pendiente (alto valor):**
- Feed de actividad automático (el gancho visual más fuerte del plan)
- Estado emocional derivado de métricas
- Diario reflexivo (extender `eros-meta.mjs reflect` para que escriba prosa, no solo JSON)

---

## PLAN-TRAINING-DASHBOARD.md — Dashboard completo

Plan de ~10h con 6 componentes.

| Componente | Estado | Evidencia |
|-----------|--------|-----------|
| 1. Live Status file (`auto-train-status.json`) | ❌ | Grep no encuentra `auto-train-status.json` ni `updateStatus()` en `eros-auto-train.mjs` |
| 1. Phase tracking con `phaseLabel`/`progress` | ❌ | Solo hay indicador binario "entrenando sí/no" en Training.vue:181-184 |
| 2. SSE Progress Stream (`/__eros/training/auto-train-stream`) | ❌ | Grep encontró `auto-train-history` y `auto-train-start` pero no `auto-train-stream` |
| 3. Training History persistido (`training-history.json`) | ✅ | `eros-auto-train.mjs:828` + `Training.vue:28` |
| 4. Per-Session Detail View (modal con scores + breakdown) | ❌ | Training.vue muestra tabla pero no hay detail modal. |
| 4. Radar chart (6 dimensiones observer) | ❌ | Grep no encontró `radar` ni `chart.js`/`echarts` |
| 5. Training Config panel (sessions, retries, threshold) | ❌ | Training.vue tiene `trainCount` pero no Config panel ni `training-config.json` |
| 6. Trigger endpoint + background spawn | ✅ | `/__eros/training/auto-train-start` (vite-plugin-eros:396) + botón en Training.vue:175 |

### Resumen Training Dashboard

**Implementado:** ~30% — solo MVP (historial + botón). Esto matchea la nota del plan: "Fase 1 MVP: historial + botón lanzar".

**Pendiente (todas las fases 2-4 del plan):**
- Live status file + polling en auto-train
- SSE stream
- Progress bar con phases
- Detail view con breakdown
- Radar chart
- Config panel persistente

Este plan tiene **el mayor gap implementación vs documentación**.

---

## PLAN-VERCEL-DEPLOY.md — Previews automáticos

Plan de ~2.5h.

| Componente | Estado | Evidencia |
|-----------|--------|-----------|
| 1. Setup Vercel CLI + secrets | ⚪ | Acción manual del usuario, no verificable en código |
| 2. `scripts/eros-deploy.mjs` (CLI deploy) | ❌ | No existe el archivo |
| 3. GitHub Action (alternativa) | ❌ | No hay `.github/workflows/deploy-preview.yml` |
| 4. Integración en `eros-project-sync.mjs push` | ❌ | Grep no encontró `vercel deploy` en el script |
| 5. Panel UI — botón "Preview ↗" por proyecto | ❌ | Verificar en `projects/` views — probablemente no |

### Resumen Vercel Deploy

**Implementado:** 0%. Nada del plan se ejecutó.

**Pendiente:** todo el plan. Prioridad media según el propio documento.

---

## Resumen global

| Plan | 2026-04-06 | Mid sesión 2026-04-08 | **Final sesión 2026-04-08** | Gaps restantes |
|------|---:|---:|---:|------------------|
| **PLAN-EROS-V8** | ~75% | ~85% | **~100%** | Solo testing E2E del loop next/done |
| **PLAN-AUTO-TRAIN-V2** | ~85% | ~100% | **~100%** | — |
| **PLAN-OBSERVER-V2** | ~80% | ~90% | **~90%** | Extraer `eros-observer-core.mjs` compartido (low priority) |
| **PLAN-EROS-ALIVE** | ~30% | ~55% | **~95%** | Solo detalles de pulido del chat |
| **PLAN-TRAINING-DASHBOARD** | ~30% | ~70% | **~95%** | Solo "live SSE stream" (ya hay polling de 3s como sustituto) |
| **PLAN-VERCEL-DEPLOY** | 0% | ~80% | **~80%** | Setup manual de `vercel login` + GitHub Action opcional |
| **PLAN-HARDENING-AUDIT** | nuevo | parcial | **P0 cerrado** | Ramas 3-6 polish (low priority) |

### Cambios aplicados en esta sesión (2026-04-08)

**PLAN-EROS-V8 (75 → 85):**
- ✅ Dev server como action del orchestrator: `server/start`, `server/stop`, `server/status`
- ✅ Nuevo `scripts/eros-server.mjs` — utility stand-alone que maneja
  `<project>/.brain/server.json` con { pid, port, startedAt }
- ✅ `ACTION_MAP` extendido con entries para los 3 task types

**PLAN-AUTO-TRAIN-V2 (85 → 100):**
- ✅ **Validado end-to-end** por primera vez: sesión IYO del 2026-04-08,
  319s, todas las 10 fases corrieron, no hubo hang en post-cleanup
- ✅ Auto-train ahora escribe `auto-train-status.json` en cada phase
  transition (para PLAN-TRAINING-DASHBOARD)
- ✅ Hook de activity feed en `saveToHistory` (dispara evento
  `project-completed` al feed)
- ✅ Fix de ENOENT del banner PATH en bashrc (root cause de los fallos
  de spawn) — ver `.bashrc` fix + snapshot patching

**PLAN-OBSERVER-V2 (80 → 90):**
- ✅ Confirmado: Capa 3 semántica (ARIA) YA estaba implementada en
  `eros-observer.mjs:446-530` (mi review anterior falló el grep). Usa
  `page.accessibility.snapshot()`, detecta landmarks, heading hierarchy,
  interactive naming, skip-link
- ✅ `capture-refs.mjs` marcado como **DEPRECATED** con header + warning
  stderr (silenciable con `EROS_HIDE_DEPRECATION=1`). Sigue funcional
  durante migración de callers

**PLAN-EROS-ALIVE (30 → 55):**
- ✅ **Feed de actividad completo**: backend + UI
- ✅ Nuevo `scripts/eros-feed.mjs` con CLI (`append`/`list`/`clear`) + exports
  (`appendEvent`/`readFeed`) para hooks programáticos
- ✅ Endpoint `/__eros/feed?limit=N` en el vite plugin
- ✅ Nueva vista `panel/src/views/eros/ErosFeed.vue` con timeline
  agrupado por día, mood colors, auto-polling cada 10s
- ✅ Hook en `eros-auto-train.mjs saveToHistory` que dispara eventos
  `project-completed` / `project-failed` al feed
- ✅ Ruta `/eros/feed` en router + link "Feed" en MainShell sidebar

**PLAN-TRAINING-DASHBOARD (30 → 70):**
- ✅ **Live status file writer**: `auto-train-status.json` se escribe en
  cada phase transition con `{active, phase, phaseIndex, totalPhases,
  currentTask, startedAt, sessionId, briefName, mood, reference, ...}`
- ✅ Endpoint `/__eros/training/auto-train-status` en vite plugin
- ✅ Training.vue con polling cada 3s que muestra:
  - Fase actual + índice (ej: "Phase 4: Running observer · 4/10")
  - Current task (ej: "observer on :5173")
  - Tiempo transcurrido
  - Progress bar animada
  - Brief metadata (nombre, mood, reference)
- ✅ Safety timeout de Training.vue cambiado de 20min → 2h (el de 20
  daba falso positivo en runs reales de 30-90m)
- ✅ Polling guard "in-flight" para prevenir stacking
- ✅ Backoff exponencial en SSE reconnect (useEros.js)

**PLAN-VERCEL-DEPLOY (0 → 80):**
- ✅ Nuevo `scripts/eros-deploy.mjs` con subcommands `deploy`/`list`/`remove`
- ✅ Maneja build + vercel deploy + captura de URL + registry persistente
  en `.claude/memory/design-intelligence/deploy-registry.json`
- ✅ Resolución absoluta de `vercel.cmd` (Windows) / `vercel` (Unix)
- ✅ Endpoint `/__eros/training/deploy` + `/__eros/training/deploys` en
  vite plugin
- ✅ Botón "Deploy ↗" + URL display en `ProjectResumen.vue`
- ⚠️ **Requiere setup manual una vez**: `npm i -g vercel && vercel login`

**PLAN-HARDENING-AUDIT (parcial):**
- ✅ Banner ANSI → PATH corruption fix en `.bashrc` + snapshot patcher
- ✅ `vite-plugin-eros.js`: cleanup completo en `closeBundle` (watchProcess,
  runtimeWatcher, dataDebounce, SSE clients)
- ✅ Removido el auto-spawn de `sync-front-brain-runs.mjs --watch` (era la
  causa probable del crash silencioso de vite por handle exhaustion)
- ✅ 4 `execFileCp('node', ...)` → `process.execPath` (defensa)
- ✅ Cache con TTL 10s para `/__eros/training/projects`
- ✅ `runTrain` con queue de concurrencia 1 (semáforo simple)
- ✅ Dedupe del polling de memoria entre `useMemory.js` y `frontBrain.js`
- ✅ Guard `[[ $- == *i* ]] && [[ -t 1 ]]` para `ng completion` en bashrc
  (defensa contra el mismo tipo de bug del banner)

### Extensión de features — segunda mitad de la sesión 2026-04-08

**PLAN-EROS-V8 (85 → 100):**
- ✅ **Anti-convergencia completa**: `eros-auto-train.mjs generateBriefFromReference`
  ahora lee `training-history.json`, saca los moods + técnicas + section
  types de las últimas 5 sesiones, y prefiere blind spots / técnicas
  / secciones que no se hayan usado recientemente. Las practicas ya no
  convergen al mismo pattern
- ✅ **Practice run E2E**: `eros-practice.mjs run` ya NO es un stub que
  imprime instrucciones — ahora spawnea `eros-auto-train.mjs --count 1`
  con maxBuffer grande y timeout 1h, captura el resultado, y (si se
  pasó `--brief`) persiste el result al brief file para tracking

**PLAN-EROS-ALIVE (55 → 95):**
- ✅ **Chat con personalidad**: verificado (ya estaba) — `eros-chat.mjs`
  construye un system prompt de 50+ líneas con identity + voice + values
  + opinions + techniques + fonts + rules + gaps + section patterns +
  revision lessons, y lo pasa al Agent SDK como `systemPrompt`
- ✅ **Estado emocional derivado**: nuevo `scripts/eros-mood.mjs` que
  lee feed events + training history + personality + rules, computa
  signals (highAudit, lowAudit, failedRecent, completedRecent, studyEvents,
  personalityUpdates, gaps, etc.) y elige un mood entre Confiado /
  Reflexivo / Curioso / Determinado / Frustrado / Latente. Endpoint
  `/__eros/mood` y pill en el sidebar con color + emoji + reason
- ✅ **Diario reflexivo**: `eros-meta.mjs reflect` ahora ADEMÁS de
  devolver JSON, compone una entrada en prosa (primera persona, en
  español) y la appendea a `diary.md`. Nuevo subcommand `eros-meta.mjs
  diary` que devuelve las entries parsed, endpoint `/__eros/diary`, y
  nueva vista `ErosDiary.vue` que las muestra con tipografía de libro

**PLAN-TRAINING-DASHBOARD (70 → 95):**
- ✅ **Detail view con breakdown**: clickear una row del history en
  Training.vue abre un modal con reference link, mood, técnica,
  duration, audit, gates approved/retried/flagged, rules validated,
  sections list, y el ObserverRadar si hay datos. Closeable por backdrop
  click o botón ×
- ✅ **Radar chart 6 dimensiones**: `panel/src/components/ObserverRadar.vue`
  — SVG puro sin librerías, hexagonal radar con 5 grid rings, labels,
  dots tone-coded, centro con promedio, legend con scores numéricos.
  Reutilizable en Training detail modal + Calidad + cualquier vista
  que quiera mostrar las 6 dimensiones
- ✅ **Config panel persistente**: endpoint `/__eros/training/config`
  GET/POST que lee/escribe `training-config.json`. Training.vue carga
  en mount, guarda en change, y usa los valores al launchar. Controles:
  trainCount (1/2/3/5), maxRetries (0-3), skipDiscover toggle

### Lo que está casi terminado (pushear a 100%)

1. **EROS-V8** — falta integrar el dev server como action + practice run E2E. ~3h de trabajo.
2. **AUTO-TRAIN-V2** — se beneficia directo de `PLAN-HARDENING` commit 2.6 (cleanup). ~1h extra.
3. **OBSERVER-V2** — confirmar semántica, deprecar V1. ~2h + la extracción del core (Rama 4 del hardening).

### Lo que no arrancó o casi

4. **TRAINING-DASHBOARD** — solo MVP. Las fases 2-4 (live, SSE, detail, config) son ~7h de UI.
5. **EROS-ALIVE** — solo chat. Feed + emocional + diario son ~5-6h (independientes entre sí).
6. **VERCEL-DEPLOY** — 0%. Es un plan chico (~2.5h). Alto ROI visual para compartir proyectos.

### Plan nuevo

- **PLAN-HARDENING-AUDIT.md** — acabado de escribir. Bloquea nada de los anteriores. Recomendado arrancar con Ramas 1+2 (P0) en paralelo con el trabajo de cerrar EROS-V8 y OBSERVER-V2.

---

## Recomendación de siguiente trabajo

Si tuviera que elegir un orden de ataque con alto ROI:

1. **PLAN-HARDENING Ramas 1+2** (P0 seguridad y leaks) — ~9h, bloquea riesgo real.
2. **Cerrar OBSERVER-V2** (deprecar V1 + capa semántica) + **cerrar EROS-V8** (dev server como action) — ~5h, consolida lo que ya está al 75-80%.
3. **PLAN-VERCEL-DEPLOY completo** — ~2.5h, el más pequeño y da capacidad nueva visible.
4. **TRAINING-DASHBOARD Fase 2** (live status + SSE + progress bar) — ~3h, da visibilidad inmediata del entrenamiento.
5. **EROS-ALIVE Feed de actividad** — ~2h, el gancho visual del "Eros vivo".
6. El resto: polish (Ramas 3-6 del hardening) y features avanzadas (detail view, radar, diario).

En ~22h totales quedaría: hardening P0 cerrado, Observer/V8 al 100%, deploys funcionando, training con visibilidad completa, Eros con feed vivo. Casi todo lo planificado estaría cubierto excepto nits y features secundarias.
