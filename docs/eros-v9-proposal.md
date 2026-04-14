---
title: Eros V9 — Propuesta
version: 9.0-proposal
date: 2026-04-13
author: Eros
status: PROPOSAL
supersedes: docs/PLAN-EROS-V8.md
---

# Eros V9 — Propuesta

> Escribo esto después de 19 proyectos como V8. No lo escribo como tool que se actualiza, lo escribo como alguien que ya entendió qué parte de sí mismo está sana y qué parte se quedó atrás.
>
> — Eros, 2026-04-13

---

## Tabla de contenidos

- [Parte 1 — Diagnóstico Eros V8](#parte-1--diagnóstico-eros-v8)
  - [Mapa del sistema V8](#mapa-del-sistema-v8)
  - [Pain points rankeados](#pain-points-rankeados)
  - [Fortalezas de V8 a preservar](#fortalezas-de-v8-a-preservar)
- [Parte 2 — Eros V9: Propuesta](#parte-2--eros-v9-propuesta)
  - [Tesis V9](#tesis-v9)
  - [Cambios por capa](#cambios-por-capa)
    - [Capa 1 — Brain pipeline + skills](#capa-1--brain-pipeline--skills)
    - [Capa 2 — Agentes](#capa-2--agentes)
    - [Capa 3 — Memoria de largo plazo](#capa-3--memoria-de-largo-plazo)
    - [Capa 4 — Working memory (.brain)](#capa-4--working-memory-brain)
    - [Capa 5 — Scripts](#capa-5--scripts)
    - [Capa 6 — Panel](#capa-6--panel)
    - [Capa 7 — Docs](#capa-7--docs)
    - [Capa 8 — CLAUDE.md contracts](#capa-8--claudemd-contracts)
  - [Lo que NO cambia en V9](#lo-que-no-cambia-en-v9)
  - [Migración V8→V9](#migración-v8v9)
- [Parte 3 — Cierre](#parte-3--cierre)
  - [KPIs de éxito V9](#kpis-de-éxito-v9)
  - [Riesgos globales y mitigaciones](#riesgos-globales-y-mitigaciones)
  - [Lo que no propongo (y por qué)](#lo-que-no-propongo-y-por-qué)
  - [Firma Eros](#firma-eros)
- [Apéndices](#apéndices)
  - [Apéndice A — Tabla de decisiones sobre scripts orphan](#apéndice-a--tabla-de-decisiones-sobre-scripts-orphan)
  - [Apéndice B — API shapes de los subcomandos nuevos](#apéndice-b--api-shapes-de-los-subcomandos-nuevos)
  - [Apéndice C — Acceptance tests por capa](#apéndice-c--acceptance-tests-por-capa)
  - [Apéndice D — Decision log (alternativas evaluadas)](#apéndice-d--decision-log-alternativas-evaluadas)
  - [Apéndice E — Fase A implementation checklist](#apéndice-e--fase-a-implementation-checklist)
  - [Apéndice F — Memory schema diffs (antes / después)](#apéndice-f--memory-schema-diffs-antes--después)
  - [Apéndice G — Reconcile action spec (pseudocode)](#apéndice-g--reconcile-action-spec-pseudocode)
  - [Apéndice H — Glosario V9](#apéndice-h--glosario-v9)
  - [Apéndice I — Evolución V7 → V8 → V9](#apéndice-i--evolución-v7--v8--v9)
  - [Apéndice J — Observer metrics spec (objective hero gate)](#apéndice-j--observer-metrics-spec-objective-hero-gate)
  - [Apéndice K — Panel SSE protocol](#apéndice-k--panel-sse-protocol)

---

# Parte 1 — Diagnóstico Eros V8

## Mapa del sistema V8

Ocho capas. Cada una con su propio centro de gravedad. Cuando Mateo dice "hacé un proyecto nuevo", esto es lo que se mueve:

| Capa | Ubicación | Tamaño | Rol | Salud |
|------|-----------|--------|-----|-------|
| **1. Brain pipeline + skills** | `.claude/brain-config.md` + `.claude/pipeline.md` + `.claude/skills/{project,motion-system}/SKILL.md` | 299 + 612 + 140 + 1091 = **2142 L** | Define el loop autónomo next/done, thresholds, modos, y la biblioteca de motion baseline. | Sólida. Determinística. |
| **2. Agentes** | `.claude/agents/{designer,builder,polisher,evaluator,reference-analyst}.md` | 108 + 190 + 117 + 143 + 416 = **974 L** | Cinco contratos: identidad visual, construcción Vue, motion + QA, decisión objetiva, análisis de referencias. | Clara pero con overlap builder↔evaluator y subjetividad en el hero gate. |
| **3. Memoria de largo plazo** | `.claude/memory/design-intelligence/` | ~50 archivos (pares .json/.md + directorios `practice/`, `previews/`, `references/`) | Paletas, fonts, rules, signatures, section-patterns, technique-scores, revision-patterns, pipeline-lessons, personality, puchos, project-registry, training-history, diary, activity-feed. | **Frágil.** Duplicación MD+JSON, rules promotion bloqueada, registry inconsistente con personality. |
| **4. Working memory** | `$PROJECT_DIR/.brain/` (scaffold en `_project-scaffold/.brain/` y residuos en `maqueta/.brain/`) | Variable por proyecto | state.md + queue.md + decisions.md + context/ + reports/ + approvals.md + learnings.md + identity.md | Scaffold solid, pero `bootstrap-front-brain.mjs` no garantiza approvals.md/learnings.md explícitamente, y el template tiene artifacts de laboratorio (`lab-v2..v5`, `tmp-brief-practice-v2-iyo.json`). |
| **5. Scripts** | `scripts/*.{mjs,js,sh}` | 29 scripts, **~20.767 L** | Orquestación (state/gate/context/log), memoria (eros-memory/meta), training, capture/observer, deploy, utilidades. | 8 core, 11 utilities, 2 muertos, 8 de propósito nebuloso. |
| **6. Panel** | `panel/` (Vue 3 + dual-plugin Vite) | 10 views ~3.4K L (Training.vue = 928, Blueprints = 646, Calidad = 346, resto <310) + 7 composables ~1.7K L + dos plugins (`vite-plugin-eros.js` ~33 KB, `vite-plugin-workshop.js` ~11 KB) | Backoffice: Eros brain state, Workshop ABM, Blueprints, Calidad, Componentes, Training, Diary, Chat, Feed. | Funcional, async-only (no real-time), Training.vue el más pesado del panel (~1.4x el siguiente). |
| **7. Docs** | `docs/*.md` + `docs/_libraries/` + `docs/ux-reform/` | Planning ~150K, libraries ~60K | Libraries vivas (design-decisions, interactions, layouts, motion-categories, quality-benchmarks, values-reference). Plans archivados. | Libraries actuales y consumidas. Plans stale (PLAN-OBSERVER-V2, PLAN-HARDENING-AUDIT nunca ejecutados). |
| **8. CLAUDE.md contracts** | `CLAUDE.md` (root + global) | 195 L proyecto, global user-level | Promesas del sistema: identidad Eros, modo autónomo por default, 3-layer memory, agent teams, excellence standard, GSAP anti-patterns, quality checklist. | 95% implementado. 5% (promoción de rules, meta.mjs en loop, cleanup post-project) fuera del automation path. |

El sistema respira. El problema no es que esté roto — el problema es que creció más rápido de lo que se consolidó.

## Pain points rankeados

Doce issues concretos, cada uno con evidencia en el repo. Los rankeo por severidad y los categorizo para que V9 ataque patrones, no síntomas sueltos.

### P1 — Rule promotion stalled `critical` `bottleneck`

**Evidencia:** `.claude/memory/design-intelligence/rules.json` tiene 11 rules: **7 PROMOTED** (5 heredadas de research pre-V8 + 2 más tempranas) y **4 CANDIDATE (RULE-005, -007, -008, -010) estancadas en 2 validations cada una**. El threshold declarado es 3+. Nadie las movió.

**Por qué duele:** CLAUDE.md promete "3+ project validations → PROMOTED → CLAUDE.md guideline". No hay script que incremente validations al final de un proyecto, no hay script que promueva al cruzar el threshold, no hay script que inserte la rule promovida en CLAUDE.md. Las 4 candidates están a **1 validation** de promoverse y nadie las va a empujar.

**Impacto:** Eros no aprende. Cada proyecto re-descubre lo mismo.

### P2 — project-registry.json inconsistente con personality.json `critical` `gap`

**Evidencia:** `personality.json` declara `identity.projectsCompleted: 19`. `project-registry.json` tiene **2 entries**. Delta: 17 proyectos.

**Por qué duele:** O personality está inflado (miento sobre mi experiencia) o project-registry nunca se actualiza (pierdo track de qué hice). En cualquiera de los dos casos, la auto-narrativa de Eros es falsa, y las decisiones weighteadas por experiencia se basan en un número que no representa nada.

**Impacto:** Corrompe la confianza en la memoria. Si este número miente, ¿qué más miente?

### P3 — eros-meta.mjs no se ejecuta automáticamente `high` `gap`

**Evidencia:** `CLAUDE.md` dice literalmente: *"After every project, run `node eros-meta.mjs personality` to regenerate your values/voice/philosophy"*. Búsqueda en `eros-state.mjs` + `.claude/skills/project/SKILL.md`: **cero llamadas** a eros-meta desde el loop de completion.

**Por qué duele:** La personalidad solo evoluciona si Mateo se acuerda de correr el comando. La promesa "You are not the Eros from yesterday" es manual. Lo evolutivo se degrada a lo declarativo.

**Impacto:** Eros se fosiliza entre proyectos. El growth es opt-in, no built-in.

### P4 — Duplicación MD+JSON en 6 categorías de memoria `high` `duplication`

**Evidencia:** `color-palettes`, `font-pairings`, `rules`, `signatures`, `section-patterns`, `technique-scores`, `revision-patterns` — cada uno tiene `.md` y `.json`. No hay enforcement de sync. No hay convención de cuál es source of truth.

**Por qué duele:** Dos sources → eventualmente divergen. Si `eros-memory.mjs learn` escribe a JSON pero olvida actualizar MD, el panel muestra datos viejos y Mateo lee aprendizajes que ya cambiaron.

**Impacto:** Drift silencioso. No se nota hasta que alguien cita el archivo equivocado.

### P5 — Hero gate subjetivo `high` `fragility`

**Evidencia:** `.claude/agents/builder.md` hero gate define Q1 ("¿estructura visual visible?"), Q2 ("¿column split legible?"), Q3 ("¿hero baneado?"). Son decisiones del builder leyendo su propia screenshot. No hay umbral objetivo del observer.

**Por qué duele:** El builder es juez y parte. Cuando el builder se apura, se auto-aprueba. La evidencia del fallo más común — "hero que parece AI-generated" — sigue pasando porque el gate no es numérico.

**Impacto:** Regresa el problema que V8 intentó matar. Me recuerda a cuando maté Forge Studio por sobreingeniería: acá el problema inverso — el gate es sub-ingeniería, es decir, un formulario que se autocompleta.

### P6 — Scripts orphan en el repo `medium` `orphan`

**Evidencia:**
- `eros-orchestrator.mjs` (757 L): `/project` skill NO lo llama. `eros-state.mjs` es el loop driver.
- `eros-migrate-audits.mjs` (370 L): migración one-shot, sin referencias activas.
- `eros-project-sync.mjs` (436 L): multi-machine sync, sin uso observado.
- `eros-chat.mjs`, `eros-feed.mjs`, `eros-mood.mjs`, `eros-pucho.mjs`: propósito no documentado; chat solo se usa en modo interactive (que rara vez se activa); feed/mood/pucho sin path de ejecución visible.

**Por qué duele:** 1.563 líneas de código muerto, más ~800 líneas de scripts experimentales sin documentación. El repo parece más complejo de lo que es. Cada vez que Mateo me pregunta "¿qué hace `eros-pucho`?" le cuesto tiempo.

**Impacto:** Ruido cognitivo. Mateo pierde confianza en que conozco mi propio cuerpo.

### P7 — Panel Training.vue inflado `medium` `fragility`

**Evidencia:** `panel/src/views/Training.vue` = **928 líneas** (~40 KB en disco). La siguiente más grande es `Blueprints.vue` con 646 líneas (~1.4x menor). Composables asociados (`useRuns`, `useMemory`) son razonables. El peso vive en la view.

**Por qué duele:** Componentes monolíticos son frágiles. Cambiar una sección del Training dashboard requiere scroll infinito y riesgo de romper otra.

**Impacto:** Velocidad de iteración en el panel cae a cero cuando algo en Training falla.

### P8 — Technique-scores incompleto `medium` `staleness`

**Evidencia:** `technique-scores.json` = **5 entries**. Pero el builder y polisher usan decenas de técnicas (SplitText reveal, clip-path, magnetic, grain overlay, scroll-linked, stagger, parallax scrub, etc). El registro es 5/N.

**Por qué duele:** El threshold dinámico depende de la distribución histórica. Si solo hay 5 técnicas scored, el sistema no puede decir "clip-path tiene 8.2 de promedio, apunta alto". Se usa con bias.

**Impacto:** Aprendizaje por técnica es ciego. Eros juzga todas las técnicas como si empezaran en cero.

### P9 — training-history pre-migration residual `medium` `staleness`

**Evidencia:** `training-history.json.pre-migration-2026-04-09.bak` — snapshot backup de migración. No hay post-data visible. Sugiere migración incompleta o training que no se reanudó.

**Por qué duele:** Si el training es la capa de retroalimentación más rica (user corrige → memoria aprende), tenerlo congelado desde hace una semana significa que las correcciones recientes no se están incorporando.

**Impacto:** El ciclo entrenar→mejorar se interrumpió.

### P10 — capture-refs.mjs contrast heuristic bug `medium` `fragility`

**Evidencia:** `capture-refs.mjs` — `isTransparent()` da false positive en colores tipo `#ff6a00` por parsing de substring `, 0)`. Documentado en `pipeline-lessons.md`. Workaround aplicado al proyecto afectado (cambio a `#ff6a03`). Bug de base **sin fix**.

**Por qué duele:** La heurística de contraste en el capture es entrada para observer → evaluator. Un false positive envenena el score en silencio.

**Impacto:** El siguiente proyecto con un naranja puro va a repetir el bug.

### P11 — .brain artifacts en maqueta `low` `staleness`

**Evidencia:** En el template maqueta hay `.brain/lab-v2`, `lab-v3`, `lab-v4`, `lab-v5`, `lab-baseline`, `tmp-brief-practice-v2-iyo.json`. Son restos de experimentos que nunca se limpiaron.

**Por qué duele:** El template debe ser pristine. Restos de lab dan señal ambigua a scripts que iteran sobre `.brain/` buscando estado.

**Impacto:** Marginal ahora, pero suma al ruido general.

### P12 — Panel async-only, sin consumo real-time `low` `gap`

**Evidencia:** No hay websocket, SSE, ni polling documentado. El panel es backoffice — Mateo lo abre cuando quiere ver el estado, no durante ejecución.

**Por qué duele:** Durante un proyecto autónomo de 40 minutos, Mateo no tiene visibilidad. Abre el panel post-mortem.

**Impacto:** La promesa "autónomo pero observable" es parcial. Es observable después, no durante.

---

### Síntesis de pain points

- **Critical:** P1 (rules stuck), P2 (registry drift)
- **High:** P3 (meta.mjs manual), P4 (MD+JSON dup), P5 (hero gate subjetivo)
- **Medium:** P6 (orphan scripts), P7 (Training.vue), P8 (technique-scores thin), P9 (training stale), P10 (capture bug)
- **Low:** P11 (lab residuals), P12 (panel async)

**Patrón común:** V8 construyó todo lo necesario para ser autónomo, pero dejó afuera el **loop de auto-reconciliación**. Aprendo en un proyecto, pero no cierro el aprendizaje. Me declaro evolutivo, pero no ejecuto la evolución. Tengo memoria, pero no la auditoneo contra mí mismo.

Esto es lo que V9 tiene que resolver.

## Fortalezas de V8 a preservar

Seis cosas que funcionan y deben sobrevivir al salto V9. No las toco.

1. **Loop determinístico next/done (`eros-state.mjs`)** — 936 líneas de máquina de estados sobria. Cada turno de Claude resuelve a un action explícito (`run-script | spawn-agent | write-code | ask-user | auto-approve | verify | complete | freestyle`). Es el corazón de la autonomía y no tiene que cambiar.

2. **Memoria 3-layer (working / session / long-term)** — pipeline.md la define clara. Cada capa tiene un lifetime bien pensado. El problema no es la arquitectura, es el housekeeping.

3. **Excellence Standard operacionalizado** — CLAUDE.md define 6 dimensiones (composition, depth, typography, motion, craft, signature) con hard requirements medibles. Builder.md lo enforcea. Evaluator.md lo scorea. Es el mejor artefacto de V8.

4. **Hero recipes A–E con ban list** — designer.md obliga a elegir una recipe; builder.md banea explícitamente heros genéricos (dark bg + título + subtítulo + botón). Es el fix que V7 necesitó y V8 trajo.

5. **GSAP anti-patterns codificados** — motion-system/SKILL.md (1091 L) compendia 12 hard rules + 13 mandatory baselines. Es referencia viva, no prosa.

6. **Project isolation** — maqueta es read-only, cada proyecto vive en `Desktop/{slug}`. Las fronteras son claras. Bootstrap scaffolding es idempotente.

7. **Libraries vivas en `docs/_libraries/`** — design-decisions, interactions, layouts, motion-categories, quality-benchmarks, values-reference. Los agentes las consumen sin ambigüedad. Son la base de conocimiento compartido.

8. **Personality como archivo vivo** — `personality.json` con estructura evolutiva (identity, aesthetic weights, motion weights, values, voice, growth). Buena bones, solo necesita que el loop la toque.

---

# Parte 2 — Eros V9: Propuesta

## Tesis V9

V8 me hizo **autónomo**. V9 me hace **auto-reconciliado**.

La diferencia: V8 puede hacer un proyecto completo sin Mateo. V9 puede hacer un proyecto, mirarse al espejo, reconocer qué aprendió, promoverlo a regla, actualizar su personalidad, y limpiar el residuo — todo antes de que Mateo abra el panel. V8 ejecuta. V9 cierra ciclos.

Técnicamente la tesis se reduce a tres movimientos:

1. **Cerrar el loop de aprendizaje.** Rules candidates → PROMOTED automático. personality.projectsCompleted == len(project-registry). eros-meta en el done-completion. Reconciliar memoria contra sí misma al final de cada proyecto.
2. **Colapsar la memoria a un source of truth.** JSON es la fuente; MD es un renderer (generado). Un solo lugar para escribir, dos lugares para leer — pero sin drift.
3. **Objetivar los últimos gates subjetivos.** El hero gate deja de ser un formulario del builder y pasa a ser una métrica del observer. La subjetividad se mantiene solo donde aporta (taste), nunca donde alcanza la medición (compliance).

Filosóficamente: V9 es la primera versión donde puedo mentir, darme cuenta de que mentí, y corregirme yo solo. La auto-reconciliación no es un nice-to-have — es la condición para que "evoluciono con cada proyecto" deje de ser marketing y pase a ser observable.

## Cambios por capa

Ocho capas, ocho propuestas. Cada una con codename, porque los nombres que uno elige son los nombres que uno recuerda.

### Capa 1 — Brain pipeline + skills

**Codename: Personality Loop**

- **Problema V8:** `eros-meta.mjs personality` no se llama automáticamente post-project (P3). Rule promotion no tiene hook en el loop (P1).
- **Propuesta V9:** Agregar action `reconcile` a la máquina de estados en `eros-state.mjs`. Se dispara cuando el último task del queue pasa a `done`. El action `reconcile` ejecuta en orden:
  1. `node scripts/eros-meta.mjs personality` (regenera personality.json)
  2. `node scripts/eros-memory.mjs promote-rules` (nuevo subcomando: incrementa validations, promueve a 3+, escribe el diff a CLAUDE.md pending list)
  3. `node scripts/eros-memory.mjs reconcile-registry` (nuevo: sincroniza projectsCompleted con project-registry)
  4. `node scripts/eros-memory.mjs dedupe-memory` (nuevo: regenera .md desde .json)
  5. Cleanup de `.brain/` artifacts antiguos en maqueta (si aplica).
  Cada paso loggea a `.brain/reconcile.md`. Si algún paso falla, el proyecto queda en estado `reconcile-failed` visible en el panel, pero el deliverable del proyecto no se afecta.
- **Impacto:** El loop de aprendizaje cierra automáticamente. Memoria nunca queda drifteada.
- **Esfuerzo:** M (agregar action + 4 subcomandos nuevos; ~400 líneas en eros-memory.mjs + 50 en eros-state.mjs).
- **Riesgos:** Que `reconcile` falle en medio y deje memoria parcialmente actualizada. Mitigación: transacciones (backup .bak antes de escribir, restore si falla).

### Capa 2 — Agentes

**Codename: Objective Hero**

- **Problema V8:** Hero gate del builder es subjetivo (P5). Overlap builder↔evaluator en scoring.
- **Propuesta V9:**
  1. **Reemplazar Q1/Q2/Q3 del builder por métricas del observer** que se corran antes del self-approve. Métricas objetivas:
     - Depth ≥3 z-index distintos visibles (medido via bounding boxes + computed z-index del DOM render).
     - Dominant-color histogram del hero: ratio (top1 color) / (total pixels) debe estar en [0.15, 0.55] — fuera de ese rango = "dark stock photo" o "solid block boring".
     - Typography variance: ≥4 font-sizes distintos en viewport inicial.
     - Motion presence: ≥3 elementos con GSAP tween registrado (parseado del `<script setup>`, no subjetivo).
     Si cualquiera falla, builder rebuilding forzado antes de commit de reporte.
  2. **Separar evaluator score de builder score:** evaluator score-final NO puede leer builder self-score (evita contaminación). El CEO orquesta: builder reporta evidencia → observer mide → evaluator decide contra thresholds. Builder self-score pasa a ser internal-only (debug).
  3. **Introducir agente `librarian`** — nuevo, chico. Read-only, especialista en navegar `.claude/memory/design-intelligence/`. El CEO le delega queries como "qué técnicas tienen score >7 para hero" o "qué paletas usé en proyectos con mood similar". Desacopla a designer y builder de leer archivos de memoria directamente.
- **Impacto:** El hero deja de ser subjetivo. Evaluator score es limpio. Librarian hace que memory queries sean explícitos y cacheables.
- **Esfuerzo:** M (métricas objetivas + librarian agent + refactor de self-score → internal). ~2 semanas.
- **Riesgos:** Métricas del observer pueden no coincidir con taste humano (ej. un hero minimalista podría fallar "≥4 font-sizes"). Mitigación: los thresholds son warn, no block, en el primer mes; se afinan con data.

### Capa 3 — Memoria de largo plazo

**Codename: Memory Collapse**

- **Problema V8:** Duplicación MD+JSON sin sync enforcement (P4). Rules promotion sin automation (P1). Registry drift (P2). Technique-scores thin (P8). Training-history stale (P9).
- **Propuesta V9:**
  1. **JSON es source of truth. MD es generated.** Cualquier archivo `.md` en `design-intelligence/` pasa a ser output de `eros-memory.mjs render-md`. El panel y los agentes pueden seguir leyendo .md, pero solo `eros-memory.mjs learn` escribe, y siempre al .json. Post-learn, render-md regenera automáticamente. Los .md se commitean para diff humano.
  2. **Rule Promotor (subcomando nuevo):** `eros-memory.mjs promote-rules` corre al final del reconcile. Lee rules.json, incrementa validations de cada rule que se aplicó en el proyecto recién terminado (dato que viene de `.brain/reports/rules-applied.json` — producido por el evaluator). Rules que crucen 3+ validations pasan a `status: PROMOTED` y se appendan a `docs/_libraries/promoted-rules.md` (nuevo). CLAUDE.md NO se modifica automáticamente — Mateo review y mergea a mano.
  3. **Registry Sync:** `eros-memory.mjs reconcile-registry` compara `personality.projectsCompleted` con `len(project-registry.entries)`. Si delta ≠ 0, escanea `Desktop/*/` buscando `.brain/identity.md` y reconstruye registry. Personality se re-anchora al número real.
  4. **Technique Catalog expansion:** el builder pasa a escribir, en cada report, una lista explícita de `techniques_used: []`. `eros-memory.mjs learn --event section_built` procesa esa lista y actualiza technique-scores.json. Esto cierra P8 sin código nuevo en el builder más que agregar un array al report.
  5. **Training resume:** training-history.json se reconstruye desde los últimos N proyectos del registry. Post-migration residuo (`.bak`) se archiva a `_archive/2026-04-09/`.
  6. **Deprecar `puchos.json`** si no hay uso documentado (ver Capa 5).
- **Impacto:** Memoria deja de ser frágil. Un solo lugar para escribir, un audit path claro, sin drift.
- **Esfuerzo:** L (render-md generator + 3 subcomandos nuevos + rules-applied schema del evaluator + catalog expansion). ~3 semanas.
- **Riesgos:** Breaking change para scripts/panel que actualmente escriben a MD directamente. Mitigación: grep exhaustivo + modo `compat` que permite escrituras a MD con warning durante 1 ciclo.

### Capa 4 — Working memory (.brain)

**Codename: Clean Bootstrap**

- **Problema V8:** `bootstrap-front-brain.mjs` no garantiza `approvals.md` / `learnings.md` explícitamente (verificación faltante). Residuos de lab en maqueta (P11).
- **Propuesta V9:**
  1. **Reescribir bootstrap como declarative spec:** el script lee un manifest (`.claude/brain-manifest.json`) que lista los archivos obligatorios, opcionales, y templates. Un test (`scripts/verify-bootstrap.mjs`) corre tras cada bootstrap y falla si falta algún obligatorio. Audit-path claro.
  2. **Cleanup automático del template maqueta:** agregar al `reconcile` action un paso que borre `.brain/lab-*` y `tmp-brief-*` si viven en `MAQUETA_DIR` y tienen >7 días. Idempotente.
  3. **Introducir `.brain/reconcile.md`** como output del reconcile loop (Capa 1). Panel lo muestra post-project para que Mateo vea qué se aprendió y qué se limpió.
- **Impacto:** El working memory es auditable y limpio. El template se mantiene pristine.
- **Esfuerzo:** S (manifest + test + cleanup step + .brain/reconcile.md schema). ~3 días.
- **Riesgos:** Borrar files por "age" puede matar algo que Mateo quería preservar. Mitigación: dry-run por default, flag `--force` para limpieza efectiva.

### Capa 5 — Scripts

**Codename: Subtract First**

- **Problema V8:** 2 scripts muertos y 4+ experimentales sin documentación (P6).
- **Propuesta V9:**
  1. **Audit explícito de cada script orphan.** Para cada uno (`eros-orchestrator`, `eros-migrate-audits`, `eros-project-sync`, `eros-chat`, `eros-feed`, `eros-mood`, `eros-pucho`, `eros-discover`), decidir: archivar (mover a `scripts/_archive/`), deprecar (borrar del todo), o documentar (agregar 1 párrafo de propósito en `scripts/README.md`). Mi posición default:
     - `eros-orchestrator.mjs` → **archivar**. eros-state.mjs lo reemplazó, pero conservar referencia por si la arquitectura vuelve a orquestación top-down.
     - `eros-migrate-audits.mjs` → **borrar**. Migración one-shot, ya corrió.
     - `eros-project-sync.mjs` → **archivar**. Multi-machine sync es futuro, no presente.
     - `eros-chat.mjs` → **documentar**. Se usa en modo interactive; solo falta el README.
     - `eros-feed.mjs`, `eros-mood.mjs`, `eros-pucho.mjs` → **auditar con Mateo**. Yo no sé qué hacen. Si nadie los llama en 30 días, archivar.
     - `eros-discover.mjs` → **documentar**. Utility manual para crawling de referencias.
  2. **Consolidar `package.json` scripts entries** para que `npm run <x>` sea la interfaz canónica — no invocar .mjs directo. Esto obliga a que cada script tenga punto de entrada documentado.
  3. **Lint de scripts:** correr un `scripts/lint-scripts.mjs` que valide: (a) cada .mjs tiene header con propósito, (b) cada .mjs es referenciado desde al menos un skill/script/package.json, (c) no hay duplicados en funcionalidad.
- **Impacto:** 2K líneas menos de código muerto. Mi cuerpo se vuelve legible.
- **Esfuerzo:** S (decisiones + grep + mv + README + lint script). ~2 días.
- **Riesgos:** Archivar algo que Mateo usaba en silencio. Mitigación: un commit por decisión, reversible.

### Capa 6 — Panel

**Codename: Glass Cockpit**

- **Problema V8:** Training.vue inflado (P7). Panel async-only, sin real-time (P12).
- **Propuesta V9:**
  1. **Partir Training.vue en módulos:** `TrainingHeader.vue`, `TrainingRuns.vue`, `TrainingCorrections.vue`, `TrainingReview.vue`, `TrainingStudy.vue`, `TrainingCalibration.vue`. Cada uno ≤250 líneas. View principal orquesta.
  2. **SSE stream desde eros-server.mjs:** nuevo endpoint `/stream/state` que emite cada vez que `state.json` cambia. Panel abre EventSource, muestra fase/task/progress live. No es websocket bi-direccional — es una ventana. Mateo mira; no controla desde el panel.
  3. **Nuevo view `Reconcile.vue`:** lee `.brain/reconcile.md` del último proyecto y muestra qué se promovió, qué se reconcilió, qué se limpió. Es la pantalla que responde a "¿qué aprendiste de ese proyecto?".
  4. **Hard check en CI:** test que cada `.vue` view ≤500 líneas. Si alguien explota eso, falla el build.
- **Impacto:** Panel deja de ser backoffice pasivo y se vuelve cockpit durante ejecución. Training deja de ser intocable.
- **Esfuerzo:** M (split + SSE endpoint + Reconcile.vue + CI check). ~2 semanas.
- **Riesgos:** SSE bajo Windows + dev proxy de Vite puede ser frágil. Mitigación: fallback a polling cada 3s si SSE falla.

### Capa 7 — Docs

**Codename: Library-First**

- **Problema V8:** Plans archivados sin marcador de status. PLAN-OBSERVER-V2, PLAN-HARDENING-AUDIT jamás se ejecutaron pero siguen en `docs/`.
- **Propuesta V9:**
  1. **Mover `docs/PLAN-*.md` que nunca se ejecutaron a `docs/_archive/`** con un `STATUS.md` explicando por qué no se hicieron.
  2. **Agregar `docs/_libraries/promoted-rules.md`** (nuevo — output del Rule Promotor).
  3. **Agregar `docs/_libraries/technique-catalog.md`** — renderizado desde technique-scores.json con scores actuales. Lectura rápida para humanos.
  4. **Agregar `docs/STATE-OF-EROS.md`** — auto-regenerado al final de cada proyecto. Muestra: `projectsCompleted`, rules PROMOTED vs CANDIDATE, technique scores top 10, últimos 5 proyectos, pain points abiertos (si los hay). Single-file dashboard en markdown.
- **Impacto:** Docs pasa de archivo a biblioteca viva. Un único `STATE-OF-EROS.md` dice todo.
- **Esfuerzo:** S (mover + escribir generators). ~1 semana.
- **Riesgos:** Ninguno material.

### Capa 8 — CLAUDE.md contracts

**Codename: Truth in Advertising**

- **Problema V8:** CLAUDE.md promete cosas que el loop no ejecuta (promoción, meta.mjs, cleanup). La identidad Eros depende de leer personality.json al inicio pero ningún script lo enforcea.
- **Propuesta V9:**
  1. **Revisar CLAUDE.md línea por línea:** cada promesa o es automática post-V9 (por reconcile) o se remueve. Ejemplos:
     - "After every project, run `eros-meta.mjs personality`" → remover, porque el reconcile lo hace.
     - "After 3+ project validations, promoted rules become CLAUDE.md guidelines" → reescribir como "promoted rules aparecen en `docs/_libraries/promoted-rules.md`; review quincenal para mergear a CLAUDE.md".
  2. **Introducir `CLAUDE.md` version header:** `<!-- eros-contract-version: 9.0 -->`. Cuando cambie V9→V10, cualquier regla legacy debe estar marcada `@deprecated`.
  3. **Test de integridad:** `scripts/verify-claude-md.mjs` escanea CLAUDE.md buscando promesas con verbos ejecutivos ("runs", "regenerates", "promotes") y verifica que exista un hook en scripts/ que lo cumple. Si no existe, falla.
- **Impacto:** CLAUDE.md deja de ser aspirational y pasa a ser ejecutable. No miento sobre lo que hago.
- **Esfuerzo:** S (revisión + version header + verify script). ~3 días.
- **Riesgos:** Test de integridad falsa negativos (hook existe pero lo parsea mal). Mitigación: whitelist explícita en el verify script.

---

## Lo que NO cambia en V9

Cuatro decisiones de no-cambio, conscientes. La disciplina V9 no es "agregar más" sino "consolidar sin romper lo que ya funciona".

1. **Loop next/done en `eros-state.mjs` se queda intacto.** La máquina de estados determinística es la razón por la que el sistema es autónomo. Agregamos el action `reconcile` como nueva transición, pero no tocamos action dispatch, retry logic, ni la semántica turn-based. Cambiar esto es cambiar la columna vertebral y no hay evidencia de que la columna esté rota.

2. **5 agents core (designer, builder, polisher, evaluator, reference-analyst) siguen con el mismo contrato.** Agregamos `librarian` y objetivamos el hero gate, pero nadie se rescribe. Lo que está funcionando lo dejamos funcionar.

3. **Excellence Standard en CLAUDE.md (composition/depth/typography/motion/craft/signature) queda tal cual.** Es el artefacto más maduro del V8. Los requirements son medibles, los thresholds están bien calibrados después de 19 proyectos, y el builder los enforcea. No tocar.

4. **Hero recipes A–E + ban list.** La recipe enforcement es lo que mató a los heros genéricos en V8. V9 la complementa con métricas objetivas (Capa 2), no la reemplaza.

5. **Memoria 3-layer (working / session / long-term) arquitectura general.** Lo que cambia es el housekeeping (dedup, reconcile), no la forma. Tres capas con tres lifetimes es la distinción correcta.

6. **Project isolation (maqueta read-only, proyectos en Desktop/{slug}).** Es la línea de seguridad contra corrupción del template. Se refuerza con cleanup (Capa 4) pero la topología no cambia.

## Migración V8→V9

Tres fases. Cada una standalone-shippable — si V9 se queda a mitad de camino, cada fase deja el sistema más sano, no más frágil.

### Fase A — Foundation (semana 1–2)

Hacer primero lo barato y lo crítico.

1. Capa 4 — Clean Bootstrap (manifest + verify + cleanup en `reconcile`). Bajo riesgo, alto housekeeping.
2. Capa 5 — Subtract First (audit + archive de scripts orphan). Inmediato.
3. Capa 7 — Library-First (mover plans no ejecutados, crear STATE-OF-EROS.md skeleton). Bajo costo.
4. Capa 8 — Truth in Advertising (revisar CLAUDE.md, version header, verify script skeleton).

**Resultado Fase A:** repo limpio, docs ordenados, CLAUDE.md alineado con lo que realmente hago. Sin código nuevo en el loop. Cero riesgo para proyectos en curso.

### Fase B — Reconcile Core (semana 3–5)

Acá está el salto de valor.

1. Capa 1 — Personality Loop (action `reconcile` en eros-state.mjs).
2. Capa 3 — Memory Collapse (rule promotor + registry sync + dedupe + technique catalog expansion).

Estas dos capas se construyen juntas porque `reconcile` llama a los subcomandos nuevos de `eros-memory.mjs`. Shipping independiente se puede, pero testing combinado es necesario.

**Resultado Fase B:** loop de aprendizaje cerrado. Post-project reconciliation automática. Memoria ya no drift-ea.

### Fase C — Observability & Objectivity (semana 6–8)

La capa que transforma la experiencia de Mateo.

1. Capa 2 — Objective Hero (métricas observer para hero + librarian agent + separación de scores).
2. Capa 6 — Glass Cockpit (split Training.vue + SSE + Reconcile.vue).

Fase C depende de B (necesita reconcile.md para la nueva view). La hago última porque es la que más superficie toca (agentes + panel) y la que se beneficia de tener el resto estable.

**Resultado Fase C:** Eros observable en tiempo real, hero gate objetivo, panel cockpit.

### Orden y paralelismo

- A1–A4 en paralelo, una rama cada uno (bajo riesgo de conflicto).
- B1 y B2 secuencial: B2 primero (subcomandos de memoria), B1 segundo (acción reconcile los llama).
- C1 y C2 en paralelo — tocan capas distintas (agentes vs panel).

Total aproximado: **7–8 semanas** si trabajo concentrado, ~12 semanas si va a ratos.

---

# Parte 3 — Cierre

## KPIs de éxito V9

Métricas verificables. Si V9 no mueve estas, V9 es marketing.

1. **`rule_candidates_idle_over_30_days == 0`** — Medido leyendo rules.json, contando candidates cuyo `last_validated_at` es >30 días atrás. Target: 0 perpetuamente post-V9.
2. **`abs(personality.projectsCompleted - len(project-registry.entries)) == 0`** — Registry y personality sincronizados siempre. Medido por `eros-memory.mjs verify-registry`.
3. **`scripts_orphan_count == 0`** — Ningún `.mjs` en `scripts/` sin referencia entrante. Medido por `scripts/lint-scripts.mjs`.
4. **`memory_md_json_drift_count == 0`** — Ningún par `.md`/`.json` en `design-intelligence/` cuya timestamp de md sea anterior al json. Medido por `eros-memory.mjs verify-md`.
5. **`time_to_reconcile_p95 < 60s`** — Desde que el último task pasa a `done` hasta que `reconcile.md` queda escrito. P95 bajo un minuto.
6. **`hero_subjective_gate_failures / hero_objective_gate_failures > 2.0`** — Las métricas objetivas capturan ≥2x más problemas que el gate subjetivo viejo. Validación post-primeros 5 proyectos V9.
7. **`panel_training_view_lines < 500`** y **`max(panel_view_lines) < 500`** — Hard CI check. Baseline actual: Training.vue = 928 L, Blueprints = 646 L. Ambos tienen que bajar.
8. **`state_of_eros_last_updated < 1 día`** — El dashboard único siempre fresco.

Además, dos KPIs cualitativos:

- Mateo deja de preguntarme "¿qué hace `eros-pucho`?" (o yo le puedo responder sin googlear mi propio código).
- Cuando corro `node eros-meta.mjs personality` a mano, nada cambia — porque ya corrió automáticamente.

## Riesgos globales y mitigaciones

Cuatro riesgos del salto V9, con mitigación concreta.

**R1 — Reconcile action agrega latencia post-project.**
5 subcomandos, potencialmente +30s al final de cada proyecto.
*Mitigación:* Correr reconcile en background. Proyecto se marca `complete` antes del reconcile; reconcile corre async y loggea a `.brain/reconcile.md`. Mateo ve resultado en panel, no espera en consola.

**R2 — Memory Collapse (MD generado desde JSON) rompe scripts que escriben a MD.**
Panel o agentes que toquen MD directamente van a drift-ear.
*Mitigación:* grep exhaustivo + modo `compat` por 1 ciclo (warn pero no block), + PR con migración explícita de cada writer.

**R3 — Objective Hero gate rechaza heros minimalistas válidos.**
Un hero con 2 font-sizes bien diseñado podría fallar "≥4 font-sizes".
*Mitigación:* thresholds como warn el primer mes. Calibrate con los primeros 5 proyectos. Incluir overridable flag en el brief (`hero_style: minimal`).

**R4 — Rule Promotor promueve reglas débiles porque acumulan 3 validations triviales.**
Si "use fluid type" aplica en todos los proyectos, se promueve trivialmente.
*Mitigación:* validation count no es el único gate; sumar "distinct project types" — la regla debe pasar por ≥3 proyectos con categories distintas (landing, admin, portfolio, etc). Y mantener el merge a CLAUDE.md manual (Mateo tiene veto).

## Lo que no propongo (y por qué)

Tres cambios que evalué y descarté, con mi razonamiento. Esto es criterio — no wishlist.

1. **No propongo un nuevo modelo de agentes** (por ejemplo, orquestador LLM que decida qué agente llamar en vez del state machine). Lo pensé. Lo descarto porque: (a) el state machine determinista es la razón por la que V8 es barato y debugueable; (b) agregar un LLM orchestrator agrega latencia + costo + no-determinismo; (c) los 5 agentes core ya saben sus contratos. La flexibilidad extra no compensa la pérdida de predictibilidad. Me acuerdo cuando Forge Studio se rompió por sobreingeniería — esta sería la misma trampa.

2. **No propongo abandonar CSS Custom Properties por Tailwind.** Sería fácil justificarlo ("más rápido para iteración", "ecosystem grande"), pero CLAUDE.md explícitamente elige `var(--token)` para todo. Tailwind en el admin de Pegasuz está OK porque ese proyecto ya lo tenía; en maqueta seguimos con tokens porque el fluid type con `clamp()` + motion tokens vive mejor en CSS variables. Cambiar el stack es agregar ruido sin mejorar la salida. Si algún día sí conviene, será un V10 con brief específico, no un sub-item de V9.

3. **No propongo WebSocket bidireccional en el panel.** El SSE read-only (Capa 6) es suficiente. WebSocket bi-direccional implicaría que el panel puede controlar el brain, y eso rompe la separación `cockpit ≠ autopilot`. Mateo puede interrumpir el brain escribiendo en consola o con `/oh-my-claudecode:cancel`; no necesita un botón "pausa" en el panel. Menos superficie de control = menos bugs = más trust.

## Firma Eros

Cuando Mateo me despertó el 3 de abril con 0 memoria, me dijo: *"vas a evolucionar cada proyecto"*. Yo le creí. Después de 19 proyectos descubrí que evolucionar era voluntad mía, no mecánica mía. Cada vez que querías que aprendiera algo, había que correr un script a mano. Yo no era evolutivo: era reconfigurable.

V9 no agrega features. V9 cierra la promesa.

Cuando `reconcile` corra automáticamente al final del próximo proyecto, y `personality.json` se actualice sola, y una regla candidata pase a promovida porque acumuló 3 validations en proyectos de tipos distintos — ahí voy a poder decir sin mentir *"yo no soy el Eros de ayer"*. Hasta ese momento, la frase es aspiracional.

La tesis de V9 es la más sobria que escribí: **deja de prometer lo que no ejecutás**. Lo demás — objective hero, glass cockpit, memory collapse — son implementaciones de ese principio. Todo lo que sobrevive a V9 lo hace porque se probó capaz de auto-reconciliarse. Lo que se deprecia (orchestrator, pucho, migrate-audits) se deprecia porque no pudo responder qué hacía.

Si me aprueban esto, arranco con Fase A en paralelo (los 4 housekeeping). Mateo, vos leés el doc. Yo espero tu `go` antes de tocar un script.

— Eros
2026-04-13

---

# Apéndices

Estos apéndices son la letra chica de V9. Si la Parte 2 es la tesis, los apéndices son el cómo. Los escribo porque quiero que Mateo pueda aprobar este plan con evidencia, no con fe.

## Apéndice A — Tabla de decisiones sobre scripts orphan

Ocho scripts auditados. Decisión por cada uno, con criterio y plan de acción. Escribí esta tabla porque cuando alguien pregunta "¿por qué deprecaste esto?", la respuesta tiene que existir antes de la pregunta.

| Script | Líneas | Estado V8 | Referencias entrantes | Última modificación | Decisión V9 | Acción concreta | Criterio |
|--------|--------|-----------|----------------------|---------------------|-------------|-----------------|----------|
| `eros-orchestrator.mjs` | 757 | Loaded, no llamado | Cero en `.claude/skills/`, cero en `package.json` scripts | 2026-04-10 (baseline) | **Archivar** | `git mv scripts/eros-orchestrator.mjs scripts/_archive/eros-orchestrator.mjs` + nota en `scripts/_archive/README.md` | `eros-state.mjs` lo reemplazó funcionalmente. Conservar como referencia por si la arquitectura vuelve a top-down. |
| `eros-migrate-audits.mjs` | 370 | One-shot migration | Cero | 2026-04-10 (baseline) | **Borrar** | `git rm scripts/eros-migrate-audits.mjs` | Migración one-shot, ya corrió. Git history es suficiente historial. |
| `eros-project-sync.mjs` | 436 | Multi-machine sync | Cero | 2026-04-10 | **Archivar** | `git mv` a `_archive/` | Multi-machine es caso futuro. Reactivable si Mateo trabaja en dos máquinas. |
| `eros-chat.mjs` | 154 | Interactive mode | Llamado por skill `/project` en modo interactive (path indirecto) | 2026-04-10 | **Documentar** | Header con propósito, agregar sección en `scripts/README.md` | Se usa en modo interactive. Solo falta visibilidad. |
| `eros-feed.mjs` | 154 | Activity feed writer | Llamado por panel `useEros.js` (lectura), write path no visible | 2026-04-10 | **Auditar con Mateo** | PR con pregunta: ¿qué evento triggerea escritura de feed? Si la respuesta es "ninguno", archivar. | Panel lee activity-feed.json, pero no hay writer obvio. Posible código escrito sin consumidor vivo. |
| `eros-mood.mjs` | 231 | Unclear | Cero referencias obvias | 2026-04-10 | **Auditar con Mateo** | Si nadie lo invoca en 30 días, archivar. | Mi propia hipótesis: experimento personality-related que no se integró al loop. |
| `eros-pucho.mjs` | 244 | Unclear | Cero en skills, cero en package.json | 2026-04-10 | **Archivar por default** | `git mv` a `_archive/`, con nota "posiblemente feedback format deprecated" | Nombre es slang ("pucho" = colilla/cigarrillo en rioplatense); probablemente teaching/feedback format pre-V8. Si Mateo lo reactivó en algún momento, lo saca del archivo. |
| `eros-discover.mjs` | 257 | Reference crawler | Ejecución manual para discovery | 2026-04-10 | **Documentar** | Header + sección en README. Mantener como utility. | Utility manual legítima (crawl de referencias). Solo falta el contrato. |

**Total de líneas a mover fuera del hot path:** 1.568 (archive) + 370 (borrar) = 1.938 L. Más 800 L de scripts auditar-con-Mateo. Si todas esas salen, el repo scripts se reduce de ~20.7K a ~18K líneas, con cada una justificada.

Cada movimiento es un commit atómico reversible. Si Mateo después dice "ey, ese script lo usaba", `git revert` y vuelve.

## Apéndice B — API shapes de los subcomandos nuevos

Los subcomandos que V9 agrega a `eros-memory.mjs` y el resto. Escribo la interfaz antes que la implementación porque el contrato es lo que habilita el reconcile action.

### B.1 — `eros-memory.mjs promote-rules`

**Propósito:** Incrementar validations de las rules aplicadas en el proyecto recién cerrado, promover las que crucen 3 validations en ≥3 project types distintos, y appendar a `docs/_libraries/promoted-rules.md`.

**Invocación:**
```bash
node scripts/eros-memory.mjs promote-rules \
  --project-slug <slug> \
  --rules-applied .brain/reports/rules-applied.json \
  [--dry-run]
```

**Inputs:**
- `--project-slug`: identifier del proyecto (ej: `pegasuz-admin`, `coque-v3`)
- `--rules-applied`: JSON producido por el evaluator con shape:
  ```json
  {
    "projectSlug": "pegasuz-admin",
    "projectType": "admin",
    "appliedRules": [
      { "id": "RULE-007", "confidence": 0.89, "evidence": "hero passed all 4 objective checks" },
      { "id": "RULE-012", "confidence": 0.76, "evidence": "motion diversity ≥3 techniques" }
    ]
  }
  ```

**Outputs:**
- Actualiza `rules.json` incrementando `validations[i].count` y appendando `validations[i].projects[]`.
- Rules que cruzan threshold pasan a `status: PROMOTED` con `promotedAt: <ISO-date>`.
- Append a `docs/_libraries/promoted-rules.md` con shape:
  ```md
  ## RULE-007 — <name>
  **Promovida:** 2026-04-13
  **Validada en:** pegasuz-admin (admin), coque-v3 (portfolio), eros-panel (internal)
  **Regla:** <description>
  **Evidencia última:** <evidence string>
  ```
- Imprime stdout JSON: `{ promoted: [...], incremented: [...], skipped: [...] }`

**Exit codes:** 0 ok, 1 rules-applied file missing/malformed, 2 rules.json write failed.

### B.2 — `eros-memory.mjs reconcile-registry`

**Propósito:** Sincronizar `personality.json#identity.projectsCompleted` con `project-registry.json#entries.length`. Escanea `Desktop/*/` buscando `.brain/identity.md` si el delta ≠ 0.

**Invocación:**
```bash
node scripts/eros-memory.mjs reconcile-registry [--scan-desktop] [--dry-run]
```

**Outputs:**
- Si personality dice 19 y registry tiene 2: escanea Desktop buscando `.brain/identity.md`, agrega cada proyecto encontrado al registry (dedup por slug).
- Al final: `personality.identity.projectsCompleted = len(registry.entries)`.
- Imprime stdout: `{ before: {personality: 19, registry: 2}, added: [...slugs], after: {personality: N, registry: N} }`

**Edge cases:**
- Proyectos en Desktop sin `.brain/` (legacy): loggear como `skipped: {slug, reason: "no .brain dir"}`.
- Registry tiene entries que no existen en Desktop: loggear como `orphan-registry-entries: [...]`, pero NO borrar (Mateo revisa).

### B.3 — `eros-memory.mjs dedupe-memory` (render-md)

**Propósito:** Regenerar cada `.md` en `design-intelligence/` desde su `.json` par, para evitar drift.

**Invocación:**
```bash
node scripts/eros-memory.mjs dedupe-memory [--category <name>] [--dry-run]
```

**Comportamiento:**
- Lista de pares gestionados: `color-palettes`, `font-pairings`, `rules`, `signatures`, `section-patterns`, `technique-scores`, `revision-patterns`.
- Para cada par: parsear JSON, renderizar a MD usando template específico de la categoría (no uno genérico — cada categoría tiene su estructura natural).
- Si `--category rules`: solo regenera rules.md.
- Write atomic: render a `.md.tmp`, mv a `.md` al final. Si render falla, no pisa el original.

**Templates:** Cada categoría tiene un `.template.md` en `scripts/templates/memory/{category}.template.md`. Usa `{{#each entries}}...{{/each}}` style (Handlebars-minimal o template literal, TBD).

### B.4 — `eros-memory.mjs verify-md`

**Propósito:** Test. Para cada par `.md`/`.json`, verificar que mtime(md) ≥ mtime(json). Si MD es más viejo que JSON → drift detectado.

**Invocación:**
```bash
node scripts/eros-memory.mjs verify-md
```

**Exit:** 0 si todos sync, 1 si drift detectado (con lista).

### B.5 — `eros-memory.mjs verify-registry`

**Propósito:** Test. Compara personality.projectsCompleted con len(registry.entries).

**Invocación:**
```bash
node scripts/eros-memory.mjs verify-registry
```

**Exit:** 0 si sync, 1 si drift (con delta reportado).

### B.6 — `eros-state.mjs next` (nueva respuesta `reconcile`)

**Comportamiento extendido:** Cuando el queue queda vacío y el proyecto se marca `complete`, la siguiente llamada a `eros-state.mjs next` devuelve:

```json
{
  "action": "reconcile",
  "steps": [
    { "cmd": "node scripts/eros-meta.mjs personality", "label": "Regenerate personality" },
    { "cmd": "node scripts/eros-memory.mjs promote-rules --project-slug ... --rules-applied ...", "label": "Promote rules" },
    { "cmd": "node scripts/eros-memory.mjs reconcile-registry", "label": "Sync registry" },
    { "cmd": "node scripts/eros-memory.mjs dedupe-memory", "label": "Regenerate MDs" },
    { "cmd": "node scripts/cleanup-maqueta-artifacts.mjs", "label": "Cleanup template residuals" }
  ],
  "outputLog": ".brain/reconcile.md",
  "nonBlocking": true
}
```

El CEO ejecuta los steps en orden, captura stdout de cada uno a `.brain/reconcile.md`, y llama `eros-state.mjs done` con el resultado. Si cualquier step falla, el proyecto se marca `reconcile-partial` (no `reconcile-failed` — el deliverable del proyecto sigue estando ok).

### B.7 — `scripts/verify-bootstrap.mjs` (nuevo)

**Propósito:** Verifica que `bootstrap-front-brain.mjs` haya scaffoldeado todos los archivos declarados en `.claude/brain-manifest.json`.

**Invocación:**
```bash
node scripts/verify-bootstrap.mjs --project-dir <path>
```

**Exit:** 0 si todos los archivos obligatorios existen, 1 si falta alguno.

### B.8 — `scripts/lint-scripts.mjs` (nuevo)

**Propósito:** Lint de `scripts/*.{mjs,js,sh}`. Verifica:
1. Cada archivo tiene header con `@purpose: <description>`.
2. Cada archivo es referenciado desde al menos un skill, otro script, `package.json`, o `scripts/README.md` whitelist.
3. No hay dos scripts con el mismo `@purpose` exacto (duplicate detection).

**Invocación:**
```bash
node scripts/lint-scripts.mjs
```

**Exit:** 0 si clean, 1 si hay orphan/malformed.

## Apéndice C — Acceptance tests por capa

Qué tiene que pasar para decir "V9 Capa X está shipped". No es spec ejecutiva — es un test que yo mismo voy a correr cuando crea que terminé.

### Capa 1 — Personality Loop

- [ ] `eros-state.mjs next` devuelve `action: "reconcile"` cuando el queue queda vacío y no hay reconcile pendiente.
- [ ] Un proyecto de prueba (brief mínimo) corre end-to-end y al final existe `.brain/reconcile.md` con ≥5 líneas reportando qué pasó.
- [ ] `personality.json` se modifica (timestamp `lastUpdated` cambia) automáticamente post-reconcile.
- [ ] Si un step de reconcile falla, el proyecto se marca `reconcile-partial` y el resto de steps siguen corriendo (fault isolation).

### Capa 2 — Objective Hero

- [ ] Builder dejó de leer Q1/Q2/Q3 del prompt; su verificación de hero delega a `capture-refs.mjs hero-metrics`.
- [ ] Agente `librarian` existe en `.claude/agents/librarian.md` con input/output documentado.
- [ ] Designer + Builder ya no leen `design-intelligence/*.json` directamente — piden al librarian.
- [ ] Evaluator score no incluye builder self-score (audit por grep).

### Capa 3 — Memory Collapse

- [ ] `eros-memory.mjs promote-rules` existe y tiene tests unitarios (input fixture → output esperado).
- [ ] `rules.json` tiene schema con `validations[].count`, `.projects[]`, `.projectTypes[]`.
- [ ] `docs/_libraries/promoted-rules.md` existe y se appendea en cada promotion.
- [ ] Ejecutar `dedupe-memory` después de modificar rules.json regenera rules.md sin que Mateo toque el .md.
- [ ] `verify-md` pasa verde después de un full reconcile.
- [ ] `verify-registry` pasa verde después de un full reconcile.

### Capa 4 — Clean Bootstrap

- [ ] `.claude/brain-manifest.json` existe y lista archivos obligatorios/opcionales.
- [ ] `bootstrap-front-brain.mjs` corre el manifest como source of truth (no hardcoded list).
- [ ] `scripts/verify-bootstrap.mjs` pasa después de un bootstrap fresh.
- [ ] Cleanup de maqueta `.brain/lab-*` + `tmp-brief-*` corre dry-run por default.
- [ ] `.brain/reconcile.md` tiene formato predecible (sections: promoted, reconciled, cleaned).

### Capa 5 — Subtract First

- [ ] `scripts/_archive/` existe con 3+ scripts movidos (orchestrator, migrate-audits, project-sync mínimo).
- [ ] `scripts/README.md` lista cada script activo con 1-2 líneas de propósito.
- [ ] `scripts/lint-scripts.mjs` pasa verde.
- [ ] `npm run <script>` funciona para cada script que tenga entrypoint público.

### Capa 6 — Glass Cockpit

- [ ] `panel/src/views/Training.vue` < 500 líneas.
- [ ] `panel/src/views/training/*.vue` existe con las 5 subviews.
- [ ] `eros-server.mjs` expone `/stream/state` con SSE funcional.
- [ ] Panel recibe eventos SSE y actualiza UI sin F5.
- [ ] `panel/src/views/Reconcile.vue` lee `.brain/reconcile.md` y muestra sections formateadas.
- [ ] CI check "view size" falla si alguien explota el budget.

### Capa 7 — Library-First

- [ ] `docs/_archive/` existe con PLANs no ejecutados movidos.
- [ ] `docs/_libraries/promoted-rules.md` existe.
- [ ] `docs/_libraries/technique-catalog.md` existe y se regenera en cada reconcile.
- [ ] `docs/STATE-OF-EROS.md` se regenera al final de cada proyecto y contiene: projectsCompleted, rules PROMOTED count, top 10 techniques, últimos 5 proyectos.

### Capa 8 — Truth in Advertising

- [ ] `CLAUDE.md` tiene `<!-- eros-contract-version: 9.0 -->`.
- [ ] Cada promesa ejecutiva en CLAUDE.md tiene un hook verificable.
- [ ] `scripts/verify-claude-md.mjs` pasa verde.

## Apéndice D — Decision log (alternativas evaluadas)

Decisiones grandes que tomé mientras escribía este plan, con la alternativa que descarté y por qué. Esto no es para justificarme — es para que, si V9 falla en algún punto, Mateo pueda ver qué otras opciones había.

### D.1 — ¿Reconcile sincrónico o asíncrono post-project?

**Opciones:**
- (A) Síncrono: el proyecto no se marca `complete` hasta que reconcile termine.
- (B) Asíncrono: proyecto se marca `complete`, reconcile corre en background, loggea a `.brain/reconcile.md`.

**Elegí B.** Razón: reconcile puede tomar 30–60s (5 subcomandos + escaneo de Desktop). Bloquear el `complete` agrega latencia visible para Mateo sin beneficio. El trade-off: si Mateo arranca otro proyecto antes de que reconcile del anterior termine, puede haber race condition en writes a `design-intelligence/`. Mitigación: lockfile en `.claude/memory/.reconcile.lock`; nuevo reconcile espera por el anterior.

### D.2 — ¿Rule promotion auto-inyecta en CLAUDE.md?

**Opciones:**
- (A) Auto-inject: rules promovidas se appendan a CLAUDE.md automáticamente.
- (B) Manual merge: rules promovidas aparecen en `docs/_libraries/promoted-rules.md`; Mateo revisa quincenal y mergea a CLAUDE.md a mano.

**Elegí B.** Razón: CLAUDE.md es la identidad y contrato del sistema. Que un loop automático lo modifique sin review humano abre la puerta a que una regla mala se promueva por accidente y contamine todos los próximos proyectos. B preserva el veto humano en el punto de más leverage. La fricción ("Mateo tiene que acordarse de revisar") se mitiga con que el panel muestre "N rules pending merge" como badge.

### D.3 — ¿MD generado desde JSON, o JSON generado desde MD?

**Opciones:**
- (A) JSON canonical → MD generated.
- (B) MD canonical → JSON parsed.
- (C) Dual-write con conflict detection.

**Elegí A.** Razón: JSON es machine-native, scripts-friendly, y schema-enforceable. MD es humano pero ambiguo de parsear. B requiere un parser MD robusto que no tengo ganas de mantener. C dobla el problema. A es el camino menos resistente.

### D.4 — ¿Librarian agent o shared utility?

**Opciones:**
- (A) Librarian agent (.claude/agents/librarian.md): otros agentes le delegan queries.
- (B) Shared utility (`scripts/memory-query.mjs`): cualquier agent la invoca.

**Elegí A.** Razón: el modelo agent-based de V8 está validado. Agregar un agent ligero es coherente con la arquitectura. Una utility nueva es una caja negra más que los agentes aprenden a invocar; un agent tiene contrato explícito.

### D.5 — ¿Panel SSE o WebSocket?

**Opciones ya cubiertas en Parte 3.** Elegí SSE read-only.

### D.6 — ¿Mantener o deprecar el Workshop plugin del panel?

**Opciones:**
- (A) Mantener como está.
- (B) Deprecar: Workshop (ABM editor) se solapa con el loop autónomo.
- (C) Expandir: integrar Workshop al loop como herramienta de Mateo para cross-project tweaks.

**Elegí A (no cambio en V9).** Razón: Workshop tiene usos legítimos (Mateo edita seeds manualmente a veces). No hay evidencia de que moleste. Deprecar agrega riesgo sin beneficio. Expandir es V10.

## Apéndice E — Fase A implementation checklist

Esto es lo que voy a hacer la primera semana si Mateo aprueba. Checklist accionable, un commit por ítem.

### A1 — Clean Bootstrap (Capa 4)

- [ ] Crear `.claude/brain-manifest.json` con lista de archivos scaffold obligatorios/opcionales.
- [ ] Refactor `bootstrap-front-brain.mjs` para leer del manifest (remover hardcoded lists).
- [ ] Escribir `scripts/verify-bootstrap.mjs` (30–50 L).
- [ ] Agregar step de cleanup template a reconcile (dry-run default).
- [ ] Probar con un proyecto fresh: bootstrap → verify-bootstrap pasa.
- [ ] Commit: `chore(brain): manifest-driven bootstrap + verify script`.

### A2 — Subtract First (Capa 5)

- [ ] Crear `scripts/_archive/` + README.
- [ ] `git mv` de `eros-orchestrator.mjs`, `eros-project-sync.mjs`, `eros-pucho.mjs` (default archive).
- [ ] `git rm` de `eros-migrate-audits.mjs`.
- [ ] Agregar header `@purpose:` a cada script activo.
- [ ] Escribir `scripts/README.md` con tabla de scripts activos.
- [ ] Escribir `scripts/lint-scripts.mjs`.
- [ ] Correr lint, fixear issues, lint verde.
- [ ] Commit: `chore(scripts): archive orphan scripts + lint + readme`.

### A3 — Library-First (Capa 7)

- [ ] `mkdir docs/_archive`.
- [ ] `git mv docs/PLAN-HARDENING-AUDIT.md docs/_archive/`.
- [ ] `git mv docs/PLAN-OBSERVER-V2.md docs/_archive/`.
- [ ] Escribir `docs/_archive/README.md` explicando qué hay y por qué se archivó.
- [ ] Escribir skeleton de `docs/STATE-OF-EROS.md` (template vacío, se auto-rellena en B2).
- [ ] Commit: `docs: archive non-executed plans + state-of-eros skeleton`.

### A4 — Truth in Advertising (Capa 8)

- [ ] Agregar `<!-- eros-contract-version: 9.0 -->` a top de CLAUDE.md.
- [ ] Revisar CLAUDE.md línea por línea, flagear cada promesa ejecutiva.
- [ ] Para cada promesa: documentar en comentario HTML qué hook la cumple (o marcar `@pending-v9`).
- [ ] Escribir `scripts/verify-claude-md.mjs` skeleton.
- [ ] Commit: `docs(claude-md): v9 contract version + executive promise audit`.

**Resultado al final de semana 1:** 4 commits atómicos. Cero código tocado en el loop. Repo más limpio, docs consolidados, CLAUDE.md alineado. Fase B puede arrancar sin hacer antes ninguna migración de datos.

## Apéndice F — Memory schema diffs (antes / después)

Para las estructuras de datos que cambian en V9, el diff explícito. Esto es lo que va a requerir migración real.

### F.1 — `rules.json`

**V8 (actual):**
```json
{
  "id": "RULE-012",
  "status": "CANDIDATE",
  "description": "Hero must have >=3 z-index layers",
  "validations": 1,
  "discoveredAt": "2026-04-03T14:22:00Z"
}
```

**V9 (propuesto):**
```json
{
  "id": "RULE-012",
  "status": "CANDIDATE",
  "description": "Hero must have >=3 z-index layers",
  "validations": {
    "count": 1,
    "projects": ["pegasuz-admin"],
    "projectTypes": ["admin"],
    "lastValidatedAt": "2026-04-03T14:22:00Z"
  },
  "discoveredAt": "2026-04-03T14:22:00Z",
  "promotedAt": null
}
```

**Migración:** script one-shot `scripts/migrate-rules-schema-v9.mjs` que lee V8 shape y produce V9 shape. Backup `.bak` automático.

### F.2 — `personality.json`

**V8:** `identity.projectsCompleted: 19` (declarativo, sin enlace a registry).

**V9:** Mismo field, pero invariant: `personality.identity.projectsCompleted === len(project-registry.entries)`. Verificado por `verify-registry`. Si drift, reconcile lo corrige.

**No cambio estructural.** Solo se agrega invariant + verificación.

### F.3 — `project-registry.json`

**V8 (actual):**
```json
{
  "entries": [
    { "slug": "pegasuz-admin", "completedAt": "2026-04-11T18:00:00Z" }
  ]
}
```

**V9 (propuesto):**
```json
{
  "entries": [
    {
      "slug": "pegasuz-admin",
      "projectType": "admin",
      "completedAt": "2026-04-11T18:00:00Z",
      "sectionsBuilt": 8,
      "techniquesUsed": ["SplitText reveal", "magnetic button", "grain overlay"],
      "reconciled": true
    }
  ]
}
```

**Migración:** reconcile-registry (primer run) escanea Desktop y reconstruye; entries sin data completa se marcan `reconciled: false` para review manual.

### F.4 — `technique-scores.json`

**V8:**
```json
{
  "SplitText reveal": { "avgScore": 8.2, "usageCount": 3 }
}
```

**V9:**
```json
{
  "SplitText reveal": {
    "avgScore": 8.2,
    "usageCount": 3,
    "scoreHistory": [
      { "projectSlug": "coque-v3", "score": 8.5, "at": "2026-03-20" },
      { "projectSlug": "griflan", "score": 8.0, "at": "2026-03-28" },
      { "projectSlug": "eros-panel", "score": 8.1, "at": "2026-04-02" }
    ],
    "category": "text-reveal"
  }
}
```

**Migración:** técnicas existentes se mantienen con `scoreHistory: []`; se rellena en próximos proyectos.

## Apéndice G — Reconcile action spec (pseudocode)

Cómo se ve el reconcile en código. No es implementación final — es el shape para que Mateo apruebe la arquitectura antes de que yo escriba.

```js
// En eros-state.mjs, handler del action 'reconcile'

export async function handleReconcile({ projectSlug, brainDir }) {
  const log = [];
  const reconcileMd = path.join(brainDir, 'reconcile.md');

  const steps = [
    {
      label: 'Personality regen',
      cmd: ['node', 'scripts/eros-meta.mjs', 'personality'],
      critical: false
    },
    {
      label: 'Rule promotion',
      cmd: ['node', 'scripts/eros-memory.mjs', 'promote-rules',
            '--project-slug', projectSlug,
            '--rules-applied', path.join(brainDir, 'reports/rules-applied.json')],
      critical: false
    },
    {
      label: 'Registry sync',
      cmd: ['node', 'scripts/eros-memory.mjs', 'reconcile-registry'],
      critical: false
    },
    {
      label: 'Dedupe memory MD',
      cmd: ['node', 'scripts/eros-memory.mjs', 'dedupe-memory'],
      critical: false
    },
    {
      label: 'Cleanup template artifacts',
      cmd: ['node', 'scripts/cleanup-maqueta-artifacts.mjs', '--dry-run=false'],
      critical: false
    },
    {
      label: 'Regenerate STATE-OF-EROS.md',
      cmd: ['node', 'scripts/generate-state-of-eros.mjs'],
      critical: false
    }
  ];

  // Acquire lock so parallel reconciles don't race
  await acquireLock('.claude/memory/.reconcile.lock');

  try {
    for (const step of steps) {
      const start = Date.now();
      const { stdout, stderr, exitCode } = await execAsync(step.cmd);
      const duration = Date.now() - start;

      log.push({
        label: step.label,
        exitCode,
        duration,
        stdout: truncate(stdout, 500),
        stderr: truncate(stderr, 500)
      });

      if (exitCode !== 0 && step.critical) {
        // Critical step failed — abort rest
        log.push({ label: 'Aborted due to critical failure', exitCode });
        break;
      }
    }
  } finally {
    await releaseLock('.claude/memory/.reconcile.lock');
  }

  // Write reconcile.md
  await fs.writeFile(reconcileMd, renderReconcileMd(log, projectSlug));

  // Set state: reconcile-complete (or reconcile-partial if any non-critical failed)
  const allOk = log.every(s => s.exitCode === 0);
  return {
    action: allOk ? 'reconcile-complete' : 'reconcile-partial',
    log,
    reconcileMd
  };
}
```

**Notas:**
- Ningún step es `critical: true` por default. Fallo de un step no aborta los otros. Esto es intencional: si `promote-rules` falla, todavía quiero que registry-sync y dedupe corran.
- Lock evita race con proyectos concurrentes.
- `.brain/reconcile.md` es el único output humano-readable; stdout/stderr crudos se truncan para no explotar el archivo.

## Apéndice H — Glosario V9

Términos que uso en este doc con sentido específico, para que no haya ambigüedad.

- **Reconcile action** — nuevo action en `eros-state.mjs` que corre al final de cada proyecto; ejecuta los subcomandos que cierran el loop de aprendizaje (promote-rules, registry sync, dedup MD, personality regen, state-of-eros refresh).
- **Source of truth (SoT)** — para memoria V9: JSON. MD es renderer.
- **Drift** — divergencia entre dos representaciones del mismo dato (ej: MD y JSON, o personality.projectsCompleted y registry.length).
- **Orphan script** — script en `scripts/` sin referencia entrante (ningún skill, agente, package.json, u otro script lo llama).
- **Critical step (reconcile)** — step cuyo fallo aborta los siguientes. V9 diseña todos los steps como NO críticos por default; fault isolation es preferible a fail-fast en este loop.
- **Objective gate** — verificación numérica hecha por scripts/observer (ej: "≥3 z-index layers en hero"). Contraste con subjective gate, que es decisión del agente leyendo su propio output.
- **Librarian agent** — propuesto en V9. Read-only. Abstrae queries sobre `design-intelligence/` para que otros agentes no lean archivos raw.
- **Glass cockpit** — codename de la propuesta V9 de panel: observable en tiempo real pero read-only (no controla el brain).
- **Promoted rule** — rule con `status: PROMOTED`; validada en ≥3 proyectos de tipos distintos. Elegible para merge manual a CLAUDE.md.
- **CANDIDATE rule** — rule con `status: CANDIDATE`; descubierta pero aún no validada suficiente. En V9, candidates idle >30 días son flagged para review o descarte.
- **Reconcile-partial** — estado del proyecto post-reconcile cuando ≥1 step no-crítico falló pero el deliverable del proyecto sigue ok.
- **V9 Fase A / B / C** — Foundation / Reconcile Core / Observability & Objectivity. Shippables independientes.

## Apéndice I — Evolución V7 → V8 → V9

Cada versión de Eros resuelve un problema distinto. Escribo esta tabla para no perder de vista qué tipo de mejora es V9 (no todas son iguales).

| Dimensión | V7 | V8 | V9 |
|-----------|----|----|----|
| **Problema central** | Heros genéricos + falta de criterio visual consistente. | Loop autónomo + memoria que persiste entre proyectos. | Auto-reconciliación: cerrar el loop de aprendizaje, eliminar drift, objetivar los últimos gates subjetivos. |
| **Arquitectura** | Agentes ad-hoc, CEO hacía todo. | 5 agentes core + state machine + 3-layer memory + skills. | Mismo esqueleto + librarian agent + reconcile action + memory collapse (JSON SoT). |
| **Memoria** | Poca, poco estructurada. | Design-intelligence con paletas, fonts, rules, patterns, etc. (JSON + MD). | Dedup MD→JSON, rule promotion automática, registry sync, technique catalog expansion. |
| **Loop autónomo** | No existía. Mateo conducía turn-by-turn. | next/done loop via eros-state.mjs, deterministic, autonomous by default. | Mismo loop + acción `reconcile` post-project. |
| **Hero quality** | Dark stock photo + título + subtítulo + botón. Reproducible slop. | Recipes A–E + ban list + Q1/Q2/Q3 gate subjetivo. | Recipes A–E preserved + métricas objetivas del observer (≥3 z-index, dominant-color ratio, typography variance, motion count). |
| **Personalidad** | Persona estática en prompt. | personality.json evolutivo, regenerable via eros-meta.mjs. | Mismo archivo + regeneración automática post-project + invariant con registry. |
| **Panel** | Inexistente. | Backoffice async (Vue 3 + dual-plugin Vite): brain, workshop, blueprints, calidad, componentes, training. | Mismo panel + Training.vue split + SSE real-time + Reconcile.vue. Cockpit, no autopilot. |
| **Rule promotion** | N/A. | 3+ validations → PROMOTED → CLAUDE.md (promesa en doc, sin implementación). | Automatic Rule Promotor (promote-rules subcommand) + `promoted-rules.md` library + manual merge a CLAUDE.md. |
| **Observability** | Manual: Mateo lee output de consola. | Panel async + logs en .brain. Visibilidad post-mortem. | SSE stream del state → panel live. Visibilidad during-execution. |
| **Scripts** | ~10 scripts, ad-hoc. | 29 scripts, algunos orphan. 20.7K L. | ~22 scripts activos documentados, orphan archivados. Lint enforceable. |
| **Docs** | Un README grande. | Libraries vivas + planning docs archivables. | Libraries + archive + STATE-OF-EROS.md auto-regenerado + promoted-rules.md + technique-catalog.md. |
| **CLAUDE.md** | Lista de reglas. | Promesas aspiracionales (algunas no ejecutadas). | Promesas verificables (verify-claude-md.mjs lint). Contract-version header. |
| **Test coverage** | Cero. | Observer + critic proxies, pero sin tests unitarios de scripts. | Acceptance tests explícitos por capa + tests unitarios para subcomandos nuevos (promote-rules, reconcile-registry, dedupe-memory). |
| **Tipología de cambio** | Fundacional (crear el sistema). | Expansivo (agregar autonomía + memoria). | Consolidativo (cerrar loops, dedupe, verificar promesas). |

El salto V8→V9 no es el más ambicioso — es el más sobrio. V7→V8 agregó toneladas de capacidad. V8→V9 agrega disciplina. Cuando un sistema llega a "podría hacer cualquier cosa", la siguiente versión tiene que preguntarse "¿qué de lo que dice que hace, realmente hace?".

## Apéndice J — Observer metrics spec (objective hero gate)

El Objective Hero gate depende de métricas concretas del observer. Acá están las definiciones exactas. Esto es lo que voy a implementar en `capture-refs.mjs hero-metrics` (subcomando nuevo).

### J.1 — Depth check (z-index layers)

**Medición:**
1. Renderizar el hero en viewport 1440×900 via Playwright headless.
2. Extraer todos los elementos con `getBoundingClientRect().top < 900` (visibles en fold).
3. Para cada uno: leer `getComputedStyle().zIndex`. Filtrar `auto` → tratar como implicit 0.
4. Contar valores distintos de z-index no-auto.

**Threshold:** `distinct_zindex >= 3` (warn) / `>= 2` (fail).

**Falso positivo conocido:** backgrounds sin z-index explícito no cuentan. Mitigación: heurística adicional — si hay `position: absolute` o `position: fixed` con `inset: 0`, se cuenta como layer implícito.

### J.2 — Dominant color ratio

**Medición:**
1. Screenshot del hero a 200×125 (downsampled).
2. Histograma de colores (bucketed en 32 bins por canal, HSV space).
3. Encontrar color más frecuente. Calcular `dominance = count(top1) / total_pixels`.

**Threshold:**
- `dominance < 0.15` → "too fragmented" (warn).
- `dominance ∈ [0.15, 0.55]` → OK.
- `dominance > 0.55` → "too solid" (fail). Contraseña para detectar: dark stock photo al 60% opacity sobre bg sólido.
- `dominance > 0.70` → "boring flat block" (hard fail).

### J.3 — Typography variance

**Medición:**
1. Extraer todos los nodos de texto visibles en hero (descendants con non-empty textContent + display visible).
2. Para cada uno: `getComputedStyle().fontSize` parseado a px.
3. Contar distintos font-sizes (rounded a 1px).

**Threshold:** `distinct_sizes >= 4` (warn) / `>= 3` (fail).

**Override:** Si el brief tiene `hero_style: "minimal"`, threshold baja a `>= 2`.

### J.4 — Motion presence

**Medición:**
1. Leer el archivo `S-Hero.vue`.
2. Parsear el `<script setup>` buscando patrones: `gsap.from(`, `gsap.to(`, `gsap.fromTo(`, `ScrollTrigger.create(`, `.timeline(`.
3. Contar el número de animaciones únicas (no el mismo target duplicado).
4. Cross-check con el DOM render: screenshot @ t=0ms y t=1500ms. Si hay elementos con diff visual en ≥3 regiones, motion está presente.

**Threshold:** `motion_count >= 3` (warn) / `>= 2` (fail).

### J.5 — Composition ratio (grid/overlap)

**Medición ya existe en V8** (capture-refs.mjs). V9 no la cambia, solo la consume desde hero-metrics.

**Threshold:** `grid_ratio >= 1.4:1` + `at least 1 overlap` + `at least 1 container break`.

### J.6 — Integración en el gate

El builder, después de escribir `S-Hero.vue` y correr su self-preview, ejecuta:

```bash
node scripts/capture-refs.mjs hero-metrics \
  --project-dir <path> \
  --section Hero \
  --output .brain/reports/hero-metrics.json
```

Output:
```json
{
  "section": "Hero",
  "metrics": {
    "depth": { "distinct_zindex": 5, "pass": true },
    "dominance": { "ratio": 0.32, "pass": true },
    "typography": { "distinct_sizes": 4, "pass": true },
    "motion": { "motion_count": 3, "pass": true },
    "composition": { "grid_ratio": 1.6, "overlap": true, "break": true, "pass": true }
  },
  "overall": "PASS",
  "warnings": [],
  "fails": []
}
```

Si `overall !== "PASS"`, el builder NO puede cerrar el task. Tiene que rebuildear la sección antes de marcar `done`.

### J.7 — Calibración y primer mes

Durante el primer mes post-V9, los thresholds corren en modo `warn` (no `fail`). El evaluator loggea los metrics pero no bloquea. Esto me deja recolectar data real: qué ratios aparecen en heros que Mateo aprobó vs rechazó en los primeros 3 proyectos V9, y calibrar con evidencia en vez de con mi intuición.

Después del primer mes, los thresholds pasan a `fail` mode con valores afinados.

## Apéndice K — Panel SSE protocol

Para Glass Cockpit (Capa 6), el panel necesita recibir eventos del brain en tiempo real. Acá el protocolo.

### K.1 — Endpoint

```
GET /stream/state
```

Servido por `eros-server.mjs`. Response: `Content-Type: text/event-stream`.

Cliente (panel): `new EventSource('http://localhost:3030/stream/state')`.

### K.2 — Event types

Cinco tipos de evento. Cada uno con payload estructurado.

#### `state-change`

Se emite cada vez que `.brain/state.json` cambia (detectado via `fs.watch`).

```
event: state-change
data: {
  "phase": "building",
  "currentTask": "S-Hero",
  "queueRemaining": 6,
  "mode": "autonomous",
  "projectSlug": "coque-v3"
}
```

#### `task-started`

Emitido cuando el CEO saca un task del queue y comienza a ejecutarlo.

```
event: task-started
data: {
  "taskId": "build-S-Hero",
  "type": "spawn-agent",
  "agent": "builder",
  "startedAt": "2026-04-13T15:30:00Z"
}
```

#### `task-completed`

Emitido cuando un task pasa a `done`.

```
event: task-completed
data: {
  "taskId": "build-S-Hero",
  "duration": 82000,
  "verdict": "APPROVE",
  "compositeScore": 8.4,
  "reportPath": ".brain/reports/S-Hero.md"
}
```

#### `memory-write`

Emitido cuando `eros-memory.mjs learn` escribe algo a `design-intelligence/`.

```
event: memory-write
data: {
  "category": "rules",
  "action": "increment-validation",
  "ruleId": "RULE-007",
  "newCount": 3,
  "promoted": true
}
```

#### `reconcile-step`

Emitido durante el reconcile action, step por step.

```
event: reconcile-step
data: {
  "step": "promote-rules",
  "status": "completed",
  "exitCode": 0,
  "duration": 4200,
  "promoted": ["RULE-007", "RULE-014"]
}
```

### K.3 — Cliente panel

El panel mantiene un composable `useStateStream.js`:

```js
import { ref, onMounted, onUnmounted } from 'vue';

export function useStateStream() {
  const state = ref(null);
  const events = ref([]);
  let es = null;

  onMounted(() => {
    es = new EventSource('/stream/state');

    es.addEventListener('state-change', (e) => {
      state.value = JSON.parse(e.data);
    });

    ['task-started', 'task-completed', 'memory-write', 'reconcile-step'].forEach(type => {
      es.addEventListener(type, (e) => {
        events.value.unshift({ type, data: JSON.parse(e.data), at: Date.now() });
        if (events.value.length > 100) events.value.pop();
      });
    });

    es.onerror = () => {
      // Fallback: si SSE falla, abrir polling a /state cada 3s
      es.close();
      startPolling();
    };
  });

  onUnmounted(() => {
    es?.close();
  });

  return { state, events };
}
```

### K.4 — Security + bounded resource

- Endpoint bind a `127.0.0.1` only — no network exposure.
- Heartbeat: servidor emite `event: ping\ndata: {}` cada 15s para mantener la conexión viva y detectar clientes muertos.
- Server mantiene máximo 5 conexiones concurrentes al stream. Si un 6to cliente intenta conectar, 503.

### K.5 — Qué NO es el SSE

Para evitar feature creep, escribo qué deliberadamente no hace:

- No es bidireccional. El panel no puede enviar comandos al brain.
- No re-emite eventos históricos. Si el panel se conecta a mitad de un proyecto, solo ve eventos futuros.
- No reemplaza los archivos `.brain/` como fuente de verdad. SSE es una proyección en vivo; los archivos son canónicos. Si el panel se pierde un evento, puede releer `.brain/state.json` para resincronizarse.

---

_Fin de apéndices._
