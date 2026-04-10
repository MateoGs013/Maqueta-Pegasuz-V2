# Estado de implementación de planes

Review de `docs/PLAN-*.md` contra el código actual. Verificado con análisis automatizado del código.

Leyenda: ✅ implementado · 🟡 parcial · ❌ pendiente · ⚪ N/A

> **Actualización 2026-04-10:** Verificación completa con 3 agentes Explore
> en paralelo escaneando todo el codebase. Se corrigieron porcentajes inflados
> y se documentaron los gaps reales restantes. Cambios clave desde 2026-04-08:
> observer pipeline fix (stale manifest detection + freshness validation),
> audit de 18 archivos de design-intelligence (signal-to-noise 35%→90%),
> 4 nuevas reglas anti-AI V2 (RULE-015 a RULE-018).

---

## PLAN-EROS-V8.md — Orquestador + Alma

Plan de ~16h dividido en 10 fases.

### Bloque A: Orquestador (Eros controla a Claude)

| Fase | Qué | Estado | Evidencia |
|------|-----|--------|-----------|
| 1 | `next` engine con ACTION_MAP | ✅ | `eros-orchestrator.mjs:67-515` — 40+ task patterns, exporta `resolveAction` |
| 1 | `cmdNext` en eros-state | ✅ | `eros-state.mjs:694` |
| 1 | `cmdDone` en eros-state | ✅ | `eros-state.mjs:730` |
| 2 | Verificación determinista (file exists + non-empty) | ✅ | `resolveAction` incluye `expectedOutputs`, `verifyOutputs` implementado |
| 2 | Vite compile check post-build | ❌ | Solo existe en `eros-deploy.mjs:112`, no en orchestrator verification |
| 3 | SKILL.md minimal (500 → 20 líneas) | ✅ | `.claude/skills/project/SKILL.md` = 140 líneas (loop minimal GET NEXT → EXECUTE → REPORT) |
| 4 | Dev server management como action | ✅ | `eros-orchestrator.mjs:288-320` (`server/start`, `/stop`, `/status`) + `eros-server.mjs` (216 líneas) |
| 5 | Recovery engine (`resolveRecovery`) | ✅ | `eros-orchestrator.mjs:715-739` |

### Bloque B: Alma (Eros aprende solo)

| Fase | Qué | Estado | Evidencia |
|------|-----|--------|-----------|
| 6 | `eros-meta.mjs gaps` | ✅ | `eros-meta.mjs:72-129` |
| 6 | `eros-meta.mjs reflect --project` | ✅ | `eros-meta.mjs:135-242` (incluye append a diary.md) |
| 6 | `eros-meta.mjs personality` | ✅ | `eros-meta.mjs:349-536`, produce `personality.json` |
| 6 | `eros-meta.mjs diary` | ✅ | `eros-meta.mjs:321-343` — retorna entries parsed |
| 7 | `eros-practice.mjs generate` | ✅ | `eros-practice.mjs:59-129` — genera brief targeting debilidades |
| 7 | `eros-practice.mjs run` | ✅ | `eros-practice.mjs:170-221` — spawns `eros-auto-train.mjs --count 1` (pipeline real, no stub) |
| 7 | `eros-practice.mjs history` | ✅ | `eros-practice.mjs:272-292` |
| 7 | `eros-practice.mjs record` | ✅ | `eros-practice.mjs:227-251` |
| 8 | `personality.json` evolución | ✅ | Archivo existe con contenido real, rewritten en audit 2026-04-10 |
| 9 | Anti-convergencia completa | ✅ | `eros-auto-train.mjs:197-267` — lee últimas 5 sesiones, evita moods/técnicas/secciones repetidas |

### Bloque C: Testing

| Fase | Qué | Estado | Evidencia |
|------|-----|--------|-----------|
| 10 | E2E test actualizado | ✅ | `eros-test-e2e.mjs:313-377` (orchestrator V8 loop) + `405-413` (practice autonomous) |

### Resumen Eros V8

**Implementado:** ~95%. Todo el orquestador, alma, meta, práctica y E2E test.

**Pendiente (1 item):**
- Vite compile check como verify step en el orchestrator (existe en deploy, no en pipeline principal)

---

## PLAN-AUTO-TRAIN-V2.md — Entrenamiento Real

Plan de ~9h para convertir auto-training en workflow real con gates.

| Componente | Estado | Evidencia |
|-----------|--------|-----------|
| 1. Brief basado en referencia | ✅ | `eros-auto-train.mjs:128-308` — discover + study → `generateBriefFromReference(ref)` |
| 2. Dev server management | ✅ | `findFreePort:405-414`, `waitForServer:416-429`, `startDevServer:431-456`, `stopDevServer:458-466` |
| 3. Gates reales post-observer | ✅ | `runGates:536-580` — RETRY/FLAG/APPROVE verdicts por sección |
| 4. `eros-audit.mjs` (cadena de calidad) | ✅ | `scripts/eros-audit.mjs` (412 líneas) — a11y, seo, responsive, css, perf |
| 5. Validación de reglas con observer scores | ✅ | `validateRulesWithObserver:655-728` — mapea rules a excellence dimensions |
| 6. Retry automático por sección débil | ✅ | `retrySection:586-649` — spawn claude CLI con fix prompt + failure reasons |
| 7. Limpieza del proceso spawn en error | ✅ | `stopDevServer:458-466` — SIGTERM + SIGKILL timeout 3s. try/finally en pipeline |
| 8. Observer freshness validation | ✅ | `runObserver:472-514` — pre-run `rm -rf localhost/` + capturedAt check (added 2026-04-10) |

### Resumen Auto-Train V2

**Implementado: ~100%.** Pipeline completo end-to-end: brief desde referencia → dev server → observer (con freshness) → gates → retry → audit → rules validation → learn → cleanup.

**Pendiente: nada.** Los 3 items que estaban en duda (retry, rule validation, cleanup) fueron verificados como implementados.

---

## PLAN-OBSERVER-V2.md — Eros ve por sí mismo

Plan de ~11.5h para migrar de Puppeteer/V1 a Playwright/V2 con 6 capas.

| Fase | Qué | Estado | Evidencia |
|------|-----|--------|-----------|
| 1 | Setup Playwright + scaffold | ✅ | `eros-observer.mjs:22` — `import { chromium } from 'playwright'` |
| 2 | Migrar capas 5+6 (structural/functional) | ✅ | `eros-observer.mjs:661-748` — z-index, clip-path, canvas, hover, scroll |
| 3 | Capa 1 — Geometría Visual | ✅ | `extractGeometry:114-230` — visual balance, centro de masa, cuadrantes, overlap |
| 4 | Capa 2 — Estética | ✅ | `colorHarmony:418-425`, `whitespace:426-431`, typography:432-440 |
| 5 | Capa 3 — Semántica (ARIA) | ✅ | `eros-observer.mjs:448-527` — `page.accessibility.snapshot()` at line 450 |
| 6 | Capa 4 — Anti-Template | ✅ | `detectAntiTemplate:532-656` — layout fingerprinting, pattern detection |
| 7 | Scoring Engine V2 (scores continuos 0-10) | ✅ | `refresh-quality.mjs:338-344` — V2 range auto-detection, weighted composition |
| 8 | Integración + backward compat | ✅ | `findObserverSourceDir:439-475` con `maxAgeMs` freshness gate (added 2026-04-10) |
| 9 | Deprecar V1 | ✅ | `capture-refs.mjs:3,32` — header DEPRECATED + stderr warning |

### Resumen Observer V2

**Implementado: ~95%.** Las 6 capas completas en Playwright. ARIA semántica confirmada. V1 deprecated con warning.

**Pendiente (1 item — low priority):**
- Extraer `eros-observer-core.mjs` con lógica compartida (PLAN-HARDENING Rama 4 commit 4.4) para eliminar duplicación ~3000 líneas

---

## PLAN-EROS-ALIVE.md — Darle vida a Eros

Plan breve con 5 features aprobadas.

| Feature | Estado | Evidencia |
|---------|--------|-----------|
| 1. Chat en el panel | ✅ | `ErosChat.vue` (264 líneas) + ruta `/eros/chat` + endpoint `/__eros/chat` |
| 1. Chat con personalidad | ✅ | `eros-chat.mjs:26-107` — inyecta personality, values, opinions, techniques, rules como systemPrompt |
| 2. Feed de actividad vivo | ✅ | `eros-feed.mjs` (155 líneas) + `ErosFeed.vue` (222 líneas) + endpoint `/__eros/feed` + `activity-feed.json` |
| 3. Estado emocional | ✅ | `eros-mood.mjs` (232 líneas) — 6 moods (Confiado/Reflexivo/Curioso/Determinado/Frustrado/Latente) + endpoint `/__eros/mood` |
| 4. Eros ES Claude en maqueta | ✅ | `CLAUDE.md:3-35` — identidad completa con esencia, voz, crecimiento |
| 5. Diario de Eros | ✅ | `eros-meta.mjs:321-343` diary subcommand + `ErosDiary.vue` (140 líneas) + endpoint `/__eros/diary` + `diary.md` con contenido real |

### Resumen Eros Alive

**Implementado: ~100%.** Las 5 features están en código y funcionan.

**Pendiente: nada sustancial.** Solo polish (ej: más variedad de posts automáticos en el feed).

---

## PLAN-TRAINING-DASHBOARD.md — Dashboard completo

Plan de ~10h con 6 componentes.

| Componente | Estado | Evidencia |
|-----------|--------|-----------|
| 1. Live Status file (`auto-train-status.json`) | ✅ | `eros-auto-train.mjs:47-81` — `updateStatus()`/`setPhase()` escriben en cada transición |
| 1. Status endpoint | ✅ | `vite-plugin-eros.js:622-632` — `/__eros/training/auto-train-status` |
| 1. Phase tracking con progress bar | ✅ | `Training.vue:77-98,299-315` — phaseIndex/totalPhases + barra animada |
| 2. SSE Progress Stream | ❌ | No existe `/__eros/training/auto-train-stream`. Polling cada 3s como sustituto funcional |
| 3. Training History persistido | ✅ | `training-history.json` + endpoint `/__eros/training/auto-train-history` + `Training.vue:111-116` |
| 4. Per-Session Detail View | ✅ | `Training.vue:52-68` — modal con ObserverRadar + preview frames |
| 4. Radar chart (6 dimensiones) | ✅ | `ObserverRadar.vue` — SVG hexagonal puro, 6 ejes, grid rings |
| 5. Training Config panel | ✅ | `training-config.json` + GET/POST `/__eros/training/config` + UI dropdowns/toggle |
| 6. Trigger endpoint + botón | ✅ | `/__eros/training/auto-train-start` POST + botón "▶ Entrenar" |

### Resumen Training Dashboard

**Implementado: ~95%.** Todas las fases (MVP + live status + detail + radar + config) están en código.

**Pendiente (1 item — low priority):**
- SSE stream real (el polling cada 3s funciona como sustituto; SSE daría feedback sub-segundo)

---

## PLAN-VERCEL-DEPLOY.md — Previews automáticos

Plan de ~2.5h.

| Componente | Estado | Evidencia |
|-----------|--------|-----------|
| 1. Setup Vercel CLI + secrets | ⚪ | Acción manual del usuario (`vercel login`) |
| 2. `scripts/eros-deploy.mjs` (CLI deploy) | ✅ | 235 líneas — `deploy`/`list`/`remove` subcommands, Windows `.cmd` resolution |
| 3. Panel endpoints | ✅ | `/__eros/training/deploy` POST + `/__eros/training/deploys` GET en vite-plugin-eros.js |
| 4. Panel UI — botón "Deploy ↗" | ✅ | `ProjectResumen.vue:27-71` — botón + URL display |
| 5. Deploy registry | 🟡 | Código existe (`eros-deploy.mjs:157-166`), archivo se crea al primer deploy (ninguno hecho aún) |
| 6. GitHub Action (alternativa) | ❌ | No hay `.github/workflows/` — solo deploy via CLI |

### Resumen Vercel Deploy

**Implementado: ~80%.** Script completo + endpoints + UI. Falta solo el GitHub Action (opcional) y ejecutar el primer deploy para crear registry.

**Pendiente:**
- GitHub Action para deploy automático en push (opcional, no bloquea)
- Ejecutar `vercel login` + primer deploy para crear `deploy-registry.json`

---

## PLAN-HARDENING-AUDIT.md — Endurecimiento del repo

Plan de ~24h en 6 ramas independientes. ~95 hallazgos totales.

### Rama 1: Security (P0)

| Commit | Qué | Estado | Evidencia |
|--------|-----|--------|-----------|
| 1.1 | `isValidSlug` path traversal | 🟡 | Slug extraído sin validación explícita `isValidSlug()` |
| 1.2 | `readJsonBody` con maxBytes | ❌ | 5+ endpoints sin límite de body size |
| 1.3 | XSS escape en chat/markdown | ✅ | `markdown.js:1-13` — `escapeHtml()` aplicado |
| 1.4 | postMessage origin check | ❌ | `App.vue:32` acepta cualquier origen |
| 1.5 | Backup rotation | ❌ | `vite-plugin-workshop.js:75-142` sin límite de backups |

### Rama 2: Memory Leaks (P0)

| Commit | Qué | Estado | Evidencia |
|--------|-----|--------|-----------|
| 2.1 | HMR interval cleanup | ✅ | `useRuns.js:88-90`, `frontBrain.js:415-418` — `import.meta.hot.dispose` |
| 2.2 | EventSource cleanup | ✅ | `useRuns.js:80-82` — `dataSource.close()` |
| 2.3 | Training.vue poll cleanup | ✅ | `Training.vue:244-246` — `clearInterval` en `onUnmounted` |
| 2.4 | eros-log.mjs atomic append | ❌ | `eros-log.mjs:24-31` — read-then-write, no `appendFile` |
| 2.5 | eros-memory.mjs mkdir | ✅ | `eros-memory.mjs:1420` — `mkdir({ recursive: true })` |
| 2.6 | Server kill on error | ✅ | `eros-auto-train.mjs:453,461,463` — SIGTERM + SIGKILL timeout |

### Rama 3: Scaffold (P1)

| Commit | Qué | Estado | Evidencia |
|--------|-----|--------|-----------|
| 3.2 | GSAP plugins centralizados | ✅ | `panel/src/main.js:10` — `gsap.registerPlugin(ScrollTrigger)` |
| 3.3 | Lenis initialization | ❌ | No hay import ni init de Lenis en main.js |
| 3.4 | Infinite loops con IntersectionObserver | ❌ | 9 componentes con `repeat: -1` sin pause |
| 3.6 | Remover will-change preventivo | ❌ | Sigue en S-TypeMonument, S-Scattered, etc. |

### Ramas 4-6: Scripts + Docs + Polish

| Rama | Estado | Nota |
|------|--------|------|
| 4. Scripts cross-platform | 🟡 | Algunos `rm -rf`/`/dev/null` reemplazados, `eros-observer-core.mjs` no extraído |
| 5. Docs coherence | 🟡 | `AGENTS.md` dice V6.1, `CLAUDE.md` dice V8 — no estandarizado |
| 6. Quality polish | ❌ | v-for keys, regex lastIndex, error states — sin hacer |

### Resumen Hardening

**Implementado: ~40%.** Rama 2 (leaks) mayoría hecha. Rama 1 (security) tiene gaps críticos. Ramas 3-6 apenas tocadas.

**Pendiente crítico (P0):**
- `isValidSlug()` para path traversal
- `readJsonBody` con maxBytes en POST endpoints
- `postMessage` origin check
- `eros-log.mjs` atomic append

**Pendiente P1-P3:**
- Backup rotation, Lenis init, infinite loop pause, will-change cleanup, docs version, v-for keys

---

## Resumen global

| Plan | 2026-04-06 | 2026-04-08 | **Verificado 2026-04-10** | Gaps restantes |
|------|---:|---:|---:|------------------|
| **PLAN-EROS-V8** | ~75% | ~85% | **~95%** | Vite compile check como verify step |
| **PLAN-AUTO-TRAIN-V2** | ~85% | ~100% | **~100%** | — |
| **PLAN-OBSERVER-V2** | ~80% | ~90% | **~95%** | Extraer `eros-observer-core.mjs` (low priority) |
| **PLAN-EROS-ALIVE** | ~30% | ~55% | **~100%** | Solo polish |
| **PLAN-TRAINING-DASHBOARD** | ~30% | ~70% | **~95%** | SSE stream (polling 3s funciona como sustituto) |
| **PLAN-VERCEL-DEPLOY** | 0% | ~80% | **~80%** | GitHub Action opcional + primer deploy |
| **PLAN-HARDENING-AUDIT** | nuevo | parcial | **~40%** | Rama 1 security P0 tiene gaps críticos |

### Cambios desde última revisión (2026-04-08 → 2026-04-10)

**Observer pipeline fix:**
- ✅ `runObserver()` en eros-auto-train.mjs: pre-run cleanup de manifests stale + validación `capturedAt`
- ✅ `findObserverSourceDir()` en refresh-quality.mjs: nuevo parámetro `maxAgeMs` para rechazar manifests viejos

**Audit de design-intelligence (18 archivos):**
- ✅ Signal-to-noise de 35% → ~90%
- ✅ technique-scores.json: 22→13 técnicas (eliminó phantoms/duplicados)
- ✅ signatures.json: 41→8 aprobadas (eliminó 33 shells vacíos)
- ✅ rules.json: +4 reglas anti-AI V2 (RULE-015 a RULE-018)
- ✅ section-patterns.json: 67→43 patterns
- ✅ personality.json: rewrite completo con datos reales
- ✅ diary.md: contenido reflexivo real (no templates)
- ✅ training-history.json: campos `observerTrust` + `status`

---

## Recomendación de siguiente trabajo

1. **PLAN-HARDENING Rama 1** (security P0) — slug validation, maxBytes, origin check. ~4h. **Bloquea riesgo real.**
2. **PLAN-HARDENING Rama 2 restante** — eros-log.mjs atomic append. ~1h.
3. **PLAN-HARDENING Rama 3** — Lenis init + infinite loop pause + will-change. ~4h. Mejora perf/UX.
4. **Vercel primer deploy** — `vercel login` + test deploy. ~30min manual.
5. **SSE stream** (Training Dashboard) — reemplazar polling 3s. ~1h. Nice-to-have.
6. **Vite compile check** (Eros V8) — agregar al orchestrator verify. ~30min. Cierra el plan.

En ~10h quedarían TODOS los planes por encima de 95% y el hardening security P0 cerrado.
