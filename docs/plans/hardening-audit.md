# Plan: Hardening & Audit — Maqueta V8

> **Status:** `in-progress`
> **Last reviewed:** 2026-04-14

Plan de endurecimiento derivado del audit completo del repo (panel, scripts, configs, scaffold). ~95 hallazgos totales: 10 críticos, ~20 altos, ~40 medios, resto bajos.

Organizado en **6 ramas independientes** que pueden correr en paralelo (no hay conflictos de archivos entre ellas). Cada rama tiene commits atómicos y verificables.

---

## Mapa de ramas

```
master
  ├─ fix/security-hardening       (seguridad explotable — P0)
  ├─ fix/memory-leaks             (leaks y races — P0)
  ├─ fix/scaffold-broken          (scaffold roto + componentes — P1)
  ├─ fix/scripts-cross-platform   (Windows + duplicación — P1)
  ├─ fix/docs-coherence           (configs y agents — P2)
  └─ fix/quality-polish           (mediums y bajos — P3)
```

| Rama | Prioridad | Commits | Riesgo merge |
|------|-----------|---------|--------------|
| `fix/security-hardening` | P0 — esta semana | 5 | Bajo (solo panel/vite-plugin-*) |
| `fix/memory-leaks` | P0 — esta semana | 6 | Bajo (scripts/eros-* + panel/composables) |
| `fix/scaffold-broken` | P1 — esta semana | 7 | Medio (afecta todo proyecto futuro) |
| `fix/scripts-cross-platform` | P1 — próxima | 5 | Medio (touch wide en scripts/) |
| `fix/docs-coherence` | P2 — próxima | 4 | Nulo (solo docs) |
| `fix/quality-polish` | P3 — después | 8 | Bajo (nits dispersos) |

**Orden de merge sugerido:** security → memory → scaffold → scripts → docs → polish. Las primeras 3 pueden desarrollarse en paralelo. Scripts depende solo de sí misma. Docs no depende de código.

---

## Rama 1: `fix/security-hardening` (P0)

**Objetivo:** cerrar los agujeros explotables del panel antes de que alguien más lo corra.

**Archivos tocados:** `panel/vite-plugin-eros.js`, `panel/vite-plugin-workshop.js`, `panel/src/views/eros/ErosChat.vue`, `panel/src/components/MarkdownDocument.vue`, `panel/src/utils/markdown.js`, `panel/src/App.vue`.

### Commit 1.1 — `fix(panel): validate slug in path traversal endpoints`

**Por qué:** `/__eros/observer?project=...` y `/__eros/preview/{slug}/...` concatenan el query directo a `path.join(homedir(), 'Desktop', slug, ...)`. Un `../../../.ssh/id_rsa` lee archivos fuera del workspace.

**Qué:**
- Añadir helper `isValidSlug(s)` al top del archivo: `/^[a-zA-Z0-9_-]{1,80}$/`
- Aplicar en `panel/vite-plugin-eros.js:118-131` (`/__eros/observer`)
- Aplicar en `panel/vite-plugin-eros.js:331-354` (`/__eros/preview`)
- Normalizar el path resultante y verificar que empieza con el prefijo esperado (`path.resolve(expected).startsWith(...)`)
- Responder `400 { error: 'invalid project slug' }` cuando falla

**Verificación:** `curl http://localhost:4000/__eros/observer?project=../../etc` → 400.

### Commit 1.2 — `fix(panel): cap request body size in all POST endpoints`

**Por qué:** 5+ endpoints hacen `let body=''; req.on('data', c => body += c)` sin límite. 100MB tira el dev server.

**Qué:**
- Crear helper `readJsonBody(req, { maxBytes = 1_000_000 })` en `panel/vite-plugin-eros.js`
- Reemplazar los 5 lugares (líneas ~252-266, 272-287, 292-306, 310-324, 399-404)
- Cuando excede: `req.destroy()` + `res.writeHead(413, 'Payload Too Large')`
- Aplicar lo mismo en `panel/vite-plugin-workshop.js` (endpoints `/write`, `/create`)

**Verificación:** `curl -X POST -d @big.bin http://.../__eros/...` con 10MB → 413.

### Commit 1.3 — `fix(panel): escape captures in markdown/chat renderers (XSS)`

**Por qué:** `formatText()` en `ErosChat.vue:13-19` y `renderInline()` en `panel/src/utils/markdown.js:9-13` aplican `escapeHtml()` al texto entero, pero luego sus regex envuelven grupos capturados sin re-escaparlos. `**<img onerror=alert(1)>**` se ejecuta porque `$1` ya perdió el escape del contexto exterior.

**Qué:**
- Refactor a funciones reemplazadoras con callback:
  ```js
  .replace(/\*\*(.+?)\*\*/g, (_, g) => `<strong>${escapeHtml(g)}</strong>`)
  ```
- Aplicar el mismo patrón en `panel/src/utils/markdown.js` para `code`, `em`, `strong`, `link`
- Test manual con payloads: `**<script>alert(1)</script>**`, `` `<img src=x onerror=alert(1)>` ``

**Alternativa considerada:** DOMPurify. Descartada: agrega dependencia para un caso cerrado.

### Commit 1.4 — `fix(panel): origin-check postMessage listener in preview mode`

**Por qué:** `panel/src/App.vue:32-41` acepta `message` de cualquier origen en modo preview. Un iframe hermano puede inyectar props arbitrarias.

**Qué:**
- Guard al inicio de `onMessage`: `if (e.origin !== window.location.origin) return`
- Validar también `e.source` contra `window.parent`

### Commit 1.5 — `fix(panel): restrict workshop backup rotation + vite fs.allow`

**Por qué:** `vite-plugin-workshop.js:75-82` crea un `.bak` por cada save sin rotación; puede crecer a GB. Y `vite.config.js:25` hace `fs.allow: ['..']` — demasiado permisivo.

**Qué:**
- En `writeBackup()`: después del write, listar backups del mismo archivo, ordenar por mtime, borrar todos salvo los 20 más recientes.
- En `vite.config.js`: restringir a `[_components, _components-preview, .claude, docs]` específicamente.

**Verificación:** hacer 25 saves del mismo componente → quedan 20 `.bak` más recientes.

---

## Rama 2: `fix/memory-leaks` (P0)

**Objetivo:** eliminar leaks, races e intervals que se acumulan con HMR o en runs autónomos.

**Archivos tocados:** `panel/src/composables/useMemory.js`, `panel/src/data/frontBrain.js`, `panel/src/composables/useRuns.js`, `panel/src/views/Training.vue`, `panel/src/views/eros/ErosChat.vue`, `panel/vite-plugin-eros.js`, `scripts/eros-log.mjs`, `scripts/eros-memory.mjs`, `scripts/eros-auto-train.mjs`.

### Commit 2.1 — `fix(panel): remove flawed interval guards in composables`

**Por qué:** `useMemory.js:73-78` y `frontBrain.js:341-349` tienen el mismo anti-patrón: `if (!interval) interval = setInterval(...)`. Con HMR el módulo se reevalúa y `interval` reaparece como `null` en la siguiente instancia, pero el viejo sigue corriendo. Fetches duplicados crecen geométricamente.

**Qué:**
- Quitar el guard `if (!interval)`.
- Asignación directa + cleanup incondicional en `import.meta.hot.dispose`:
  ```js
  const interval = setInterval(fetchMemory, 30000)
  if (import.meta.hot) import.meta.hot.dispose(() => clearInterval(interval))
  ```

### Commit 2.2 — `fix(panel): guarantee EventSource + Training poll cleanup`

**Por qué:**
- `useRuns.js:67-90`: EventSource en el scope del módulo sin garantía de close si HMR no re-importa.
- `Training.vue:33-54`: `setInterval` sin `onUnmounted` → leak al salir de la vista.

**Qué:**
- Añadir `window.addEventListener('beforeunload', stopLiveSync)` en `useRuns.js`.
- En `Training.vue`: almacenar el interval en ref y limpiarlo en `onUnmounted`.
- Reemplazar la heurística `age < 30000` por un check de `status === 'idle'` del archivo de status (ver `PLAN-TRAINING-DASHBOARD.md`).

### Commit 2.3 — `fix(panel): track timeouts in ErosChat + sync reads in vite-plugin`

**Por qué:**
- `ErosChat.vue:51`: `setTimeout(() => briefCopied = false, 2000)` sin tracking.
- `vite-plugin-eros.js:30,102`: `readFileSync()` en el hot path bloquea todo el middleware.

**Qué:**
- `ErosChat.vue`: almacenar timeout en `let briefTimeout`, `clearTimeout` al re-disparar y en `onUnmounted`.
- `vite-plugin-eros.js`: cambiar `readFileSync` → `await fs.readFile`, convertir los handlers a `async`.

### Commit 2.4 — `fix(scripts): atomic append in eros-log.mjs`

**Por qué:** `eros-log.mjs:28-30` hace read → modify → write. Dos llamadas concurrentes pierden líneas (el segundo read no ve el primer write pendiente).

**Qué:**
- Cambiar a `fs.appendFile()` (atómico hasta tamaño de bloque en POSIX/NTFS).
- Si el formato requiere rebuild completo (ej. ordenar), mover ese caso a un `rewriteLog()` explícito con file-lock vía `proper-lockfile` o rename-dance.

### Commit 2.5 — `fix(scripts): ensure parent dir before write in eros-memory.mjs`

**Por qué:** `eros-memory.mjs:67-68` hace `fs.writeFile` sin `mkdir`. Primer run en máquina nueva crashea silencioso si el directorio padre no existe.

**Qué:**
- Helper `async function writeJSONSafe(p, data)`:
  ```js
  await fs.mkdir(path.dirname(p), { recursive: true })
  const tmp = p + '.tmp'
  await fs.writeFile(tmp, JSON.stringify(data, null, 2))
  await fs.rename(tmp, p)  // atómico
  ```
- Reemplazar `writeJSON()` y `writeText()` actuales.
- Aplicar el mismo patrón en `capture-refs.mjs:679` y `eros-observer.mjs:1761` (sync writes de manifest.json).

### Commit 2.6 — `fix(scripts): kill dev server on error in eros-auto-train.mjs`

**Por qué:** `eros-auto-train.mjs:441-449` spawnea el dev server pero no lo mata si `query()` lanza. Deja procesos Node huérfanos.

**Qué:**
- Envolver la sección en `try { ... } finally { server?.proc?.kill() }`.
- Agregar cleanup en `process.on('SIGINT')` y `process.on('uncaughtException')`.
- Lo mismo para `eros-observer.mjs` cuando corre en modo `--local`.

---

## Rama 3: `fix/scaffold-broken` (P1)

**Objetivo:** arreglar los bugs visibles del scaffold y componentes — todo proyecto futuro nace sano.

**Archivos tocados:** `_components/heroes/S-FloatingGlassHUD.vue`, `_components/heroes/S-CinematicCurtain.vue`, `_components/heroes/S-FullBleedOverlay.vue`, `_components/heroes/S-ProductStage.vue`, `_project-scaffold/src/main.js`, `_components/heroes/S-AmbientAtmosphere.vue` + 8 más.

### Commit 3.1 — `fix(components): declare missing props in S-FloatingGlassHUD`

**Por qué:** El template usa `logoText`, `navLogoHref`, `navCtaHref`, `navCtaLabel`, `navLinks` (`S-FloatingGlassHUD.vue:192-198`) pero ninguna está en `defineProps()` (líneas 26-40). Render con `undefined`.

**Qué:**
- Añadir las 5 props a `defineProps()` con defaults razonables.
- Validar con un render preview en `_components-preview`.

### Commit 3.2 — `fix(scaffold): register GSAP plugins centrally in main.js`

**Por qué:** `S-CinematicCurtain`, `S-FullBleedOverlay`, `S-ProductStage` llaman `gsap.registerPlugin(ScrollTrigger)` inline. Viola la regla de CLAUDE.md "Register GSAP plugins once in `main.js`". Duplica registros y dispersa imports.

**Qué:**
- En `_project-scaffold/src/main.js`: importar y registrar `ScrollTrigger`, `SplitText` una sola vez.
- Quitar los `registerPlugin()` inline de los 3 componentes.
- Verificar que los imports `import { ScrollTrigger } from 'gsap/ScrollTrigger'` siguen existiendo en los componentes (el registry se acumula global, no necesitan re-registrar).

### Commit 3.3 — `feat(scaffold): initialize Lenis in main.js`

**Por qué:** `package.json` declara `lenis: ^1.1.0` pero `main.js` nunca lo inicializa. Los proyectos copiados tienen smooth scroll fantasma.

**Qué:**
- Añadir la inicialización estándar en `main.js` (lerp 0.1, smoothWheel, `raf` loop).
- Exponer la instancia vía provide/inject para que las páginas puedan pausar/reanudar en transiciones.
- Respetar `prefers-reduced-motion`: si está activo, no inicializar Lenis.

### Commit 3.4 — `fix(components): pause infinite loops via IntersectionObserver`

**Por qué:** 9 componentes usan `repeat: -1` o `requestAnimationFrame` sin límite (`S-FloatingGlassHUD`, `S-AmbientAtmosphere`, `S-OrbitalShowcase`, `S-ProductStage`, `S-MarqueeTicker`, `S-BentoDashboard`, `S-TypeMonument`, `N-HiddenReveal`, `N-GlassBlur`). Drena CPU/batería fuera del viewport. Viola CLAUDE.md "No loops decorativos infinitos".

**Qué:**
- Crear `_components/_shared/useVisibleLoop.js` — composable que envuelve cualquier animación en un `IntersectionObserver` y pausa/resume automáticamente.
- Refactor en cascada (1 commit por componente si resulta ruidoso, o 1 commit combinado). Proponer **sub-commits**:
  - 3.4a — create `useVisibleLoop.js`
  - 3.4b — apply to 3 hero components
  - 3.4c — apply to 3 more hero components
  - 3.4d — apply to nav + remaining

### Commit 3.5 — `fix(components): clean up listeners + rAF in S-AmbientAtmosphere`

**Por qué:** Starts `requestAnimationFrame` loop + `resize` listener sin limpiarlos en `onBeforeUnmount`. Memory leak al navegar.

**Qué:**
- Almacenar `animFrameId` y `handleResize` refs.
- `onBeforeUnmount`: `cancelAnimationFrame(animFrameId); window.removeEventListener('resize', handleResize)`.

### Commit 3.6 — `chore(components): remove preventive will-change`

**Por qué:** `S-TypeMonument:404,484`, `S-Scattered:538`, `S-FullBleedOverlay`, `S-BentoDashboard` declaran `will-change: auto/transform` preventivamente. Memoria GPU desperdiciada. Viola CLAUDE.md.

**Qué:**
- Grep del repo por `will-change:` en `_components/**.vue`.
- Eliminar donde no hay una animación GSAP activa asociada.
- Donde sí hay, mover a `gsap.set({ willChange })` → animar → `gsap.set({ willChange: 'auto' })`.

### Commit 3.7 — `fix(components): replace hardcoded px with var(--token) in S-KineticGrid`

**Por qué:** `S-KineticGrid.vue` usa `gap: 24px`, `padding: 8px 20px`, etc. sin tokens. Viola CLAUDE.md "`var(--token)` for everything".

**Qué:**
- Extender `_project-scaffold/src/styles/tokens.css` con `--space-5`, `--space-7`, `--text-nav`, `--color-line-subtle` si faltan.
- Reemplazar los ~20 magic numbers en `S-KineticGrid.vue`.
- Opcional: script `scripts/eros-audit.mjs` que detecte este anti-patrón (alinea con `PLAN-AUTO-TRAIN-V2.md`).

---

## Rama 4: `fix/scripts-cross-platform` (P1)

**Objetivo:** hacer que todo corra en Windows sin excepciones + reducir duplicación masiva entre scripts.

**Archivos tocados:** `scripts/eros-orchestrator.mjs`, `scripts/eros-detect-changes.mjs`, `scripts/eros-state.mjs`, `scripts/eros-observer.mjs`, `scripts/eros-auto-train.mjs`, nuevo `scripts/eros-observer-core.mjs`.

### Commit 4.1 — `fix(scripts): replace rm -rf and /dev/null with fs primitives`

**Por qué:** `eros-orchestrator.mjs:99,468` usa `rm -rf` y `2>/dev/null` — Unix only. Rompe en Windows silencioso o con errores crípticos.

**Qué:**
- Reemplazar `rm -rf X` por `await fs.rm(X, { recursive: true, force: true })`.
- Reemplazar redirecciones `2>/dev/null` por spawn options: `stdio: ['ignore', 'pipe', 'ignore']`.
- Auditar con grep: `rg "rm -rf|/dev/null|2>/dev/null" scripts/`.

### Commit 4.2 — `fix(scripts): use execFile arrays to prevent shell injection`

**Por qué:** `eros-detect-changes.mjs:40-46` interpola `--since="${since}"` en un comando shell. `since` con `"` o `;` → injection. Patrón repetido en otros lugares.

**Qué:**
- Cambiar a `execFile('git', ['log', `--since=${since}`, ...])`.
- `eros-auto-train.mjs:730`: quitar `shell: true` innecesario.
- Validar `since` contra regex `/^[0-9\-T:Z.\s]+$/` antes de pasar.

### Commit 4.3 — `fix(scripts): atomic writes + hex parse robustness`

**Por qué:**
- `eros-state.mjs:210-215`: `Promise.all` de 4 writes no atómico — estado + queue desincronizados si 1 falla.
- `eros-observer.mjs:317-318`: `[1,3,5].map(i => parseInt(h.slice(i,i+2),16))` asume `#` al inicio sin verificar.
- `eros-gate.mjs:325`: `observerScore` sin clamp — JSON corrupto con `999` rompe comparaciones.

**Qué:**
- Usar el helper `writeJSONSafe` de commit 2.5 para los 4 writes de state.
- Hex parse: `const hex = h.replace(/^#/, ''); if (hex.length !== 6) return null; const rgb = [0,2,4].map(i => parseInt(hex.slice(i,i+2), 16))`.
- Gate: `observerScore = Math.max(0, Math.min(10, Number(raw) || 0))`.

### Commit 4.4 — `refactor(scripts): extract eros-observer-core.mjs from duplicated logic`

**Por qué:** `capture-refs.mjs` y `eros-observer.mjs` son ~3000 líneas cada uno con análisis Layer 1-6 casi idéntico. Cualquier fix hay que hacerlo dos veces. Alineado con `PLAN-OBSERVER-V2.md` Fase 9 (deprecar V1).

**Qué:**
- Crear `scripts/eros-observer-core.mjs` con las funciones compartidas: `extractGeometry`, `extractColorHarmony`, `extractWhitespace`, `extractTypographyRhythm`, `extractSemantic`, `detectTemplate`, `computeExcellence`.
- Ambos scripts importan desde ahí.
- NO es un rewrite — es extract. El observer-v2 plan puede continuar después de esto.
- Verificar que `manifest.json` producido es idéntico antes/después (diff binario).

### Commit 4.5 — `refactor(scripts): consolidate parseArgs + callScript in eros-utils.mjs`

**Por qué:** `eros-discover.mjs:37-49`, `eros-train.mjs`, `eros-train-reference.mjs`, `eros-practice.mjs` reimplementan sus propios `parseArgs()` y `callScript()`. Ya existen en `eros-utils.mjs` pero no se importan.

**Qué:**
- Exportar `parseArgs`, `callScript`, `readJson`, `writeJson` desde `eros-utils.mjs` (si faltan).
- Eliminar las copias locales en los 4 scripts.
- Grep de sanidad: `rg "function parseArgs|const parseArgs" scripts/` debería devolver solo `eros-utils.mjs`.

---

## Rama 5: `fix/docs-coherence` (P2)

**Objetivo:** que los docs dejen de contradecirse. Solo archivos markdown — sin riesgo de romper runtime.

**Archivos tocados:** `AGENTS.md`, `CLAUDE.md`, `.eros/brain-config.md`, `.eros/pipeline.md`, `.claude/agents/*.md`, `.claude/launch.json`, `.eros/memory/design-intelligence/*`.

### Commit 5.1 — `docs: standardize V8 version across all meta-files`

**Por qué:** `AGENTS.md:1` dice "V6.1", `CLAUDE.md:1,39` dice "V8", `brain-config.md` y `pipeline.md` mezclan V6.1/V7. ¿Cuál es la canónica?

**Qué:**
- Reemplazar todas las menciones a "V6.1" y "V7" con "V8" en los headers.
- Añadir sección "Version History" al final de `.eros/FRONT_BRAIN_SCHEMA.md` explicando V6.1 → V7 → V8.
- Clarificar en `CLAUDE.md:39` la relación: **Eros** = identidad creativa, **Pegasuz** = pipeline técnico.

### Commit 5.2 — `docs: define reference-observatory.md format + Dynamic Threshold block`

**Por qué:** `pipeline.md:121,288` menciona `reference-observatory.md` pero ningún doc define su formato. `brain-config.md` explica el threshold algo pero `pipeline.md` no dice cuándo correrlo ni dónde inyectarlo en el context file. Los agentes no saben dónde leer.

**Qué:**
- Añadir a `pipeline.md` una sección "Context file format" con ejemplos concretos:
  - `## Dynamic Threshold` block con los campos `section_type`, `score_minimum`, `basis`, `confidence`.
  - `## Reference Observatory` block con `sectionSequence`, `energyRhythm`, `baselineScores`, `borrowList`.
- Añadir a `builder.md` y `evaluator.md` en la sección "Input Validation": "si el bloque X no está presente, usar fallback Y".

### Commit 5.3 — `docs: clarify evaluator composite score + designer outputs`

**Por qué:**
- `evaluator.md:144` define `(0.3·builder + 0.5·excellence + 0.2·gate)` pero `brain-config.md:45` no lo menciona.
- `pipeline.md:265` lista `DESIGN.md + tokens.md` como output del designer, pero `designer.md` solo declara `tokens.md + pages/*.md`.

**Qué:**
- Añadir la fórmula del composite score a `brain-config.md` sección "Thresholds".
- Añadir `DESIGN.md` a la sección Output de `designer.md`, o quitarla de `pipeline.md:265`. Decidir quién lo genera.
- Clarificar la tabla de decisión APPROVE/RETRY/FLAG del evaluator: qué pasa con 4 STRONG + 1 MEDIUM, etc.

### Commit 5.4 — `docs: document practice folder lifecycle + launch.json cwd`

**Por qué:**
- `.eros/memory/design-intelligence/practice/` tiene 19 JSONs sin política de retención.
- `.claude/launch.json` define "maqueta-panel" pero no especifica `cwd`, rompe paths relativos.

**Qué:**
- Añadir sección "Practice Folder Lifecycle" a `.claude/MEMORY.md` (retención 30d, comando de cleanup).
- Crear `scripts/eros-cleanup.mjs` con subcommand `practice --older-than 30d`.
- `launch.json`: añadir `"cwd": "${workspaceRoot}/panel"`.

---

## Rama 6: `fix/quality-polish` (P3)

**Objetivo:** nits dispersos que no son críticos pero acumulan deuda. Una sola rama, commits temáticos.

### Commit 6.1 — `fix(panel): stable v-for keys in ErosChat/DiffViewer/PanelShell/ErosShell`

Reemplazar `:key="i"` por IDs estables (usar `msg.id`, `item.path`, generar `crypto.randomUUID()` en creación).

### Commit 6.2 — `fix(scripts): reset regex lastIndex in generate-tokens.js`

`generate-tokens.js:36-40` usa `exec()` en loop con regex persistente — puede perder matches. Usar `content.matchAll(fenceRegex)` o resetear `lastIndex`.

### Commit 6.3 — `fix(scripts): validate OPENAI_QUALITY_MODEL env var`

`multimodal-critic.mjs:4` acepta cualquier string. Añadir whitelist o `throw` con mensaje claro si no matchea.

### Commit 6.4 — `feat(scripts): incremental markdown rendering in eros-memory`

`eros-memory.mjs` rebuildea markdown completo en cada `learn`. Para archivos con >100 entradas es O(n) innecesario. Cambiar a append-only log + rebuild periódico con flag `--rebuild`.

### Commit 6.5 — `feat(scripts): populate project-registry on completion`

`project-registry.json` está vacío. Añadir a `eros-orchestrator.mjs done` (cuando el task es `cleanup/final`): llamar `eros-memory.mjs learn --event project_complete` con metadatos.

### Commit 6.6 — `fix(panel): proper error states in Training.vue`

Reemplazar los `} catch { value = [] }` silenciosos por estados de error explícitos que la UI pueda mostrar.

### Commit 6.7 — `chore(panel): restrict vite fs.allow to known subdirs`

Ya cubierto parcialmente en commit 1.5. Este commit es un follow-up: asegurar que no se olvidó ningún path necesario (testear con builds reales).

### Commit 6.8 — `chore: delete S-Scattered unused will-change + cleanup TODOs`

Barrido final: `rg "TODO|FIXME|XXX" _components/ scripts/` y resolver los triviales.

---

## Checklist transversal (aplicable a cualquier rama)

Antes de mergear cualquier rama al master:

- [ ] `cd scripts && node eros-test-e2e.mjs` pasa
- [ ] `cd panel && npm run build` pasa (sin warnings nuevos)
- [ ] `cd panel && npm run dev` arranca y carga las 4 vistas principales
- [ ] `node scripts/eros-observer.mjs --local --port 5173 .brain/observer/test` corre sin errores
- [ ] Grep final: `rg "TODO|FIXME" <archivos-tocados>` sin resultados nuevos
- [ ] Commit messages siguen el formato del repo (`type(scope): subject`)

---

## Qué NO está en este plan

Cosas reales del audit que quedaron **fuera de alcance** conscientemente:

1. **Rewrite de `capture-refs.mjs` a Playwright V2.** Está cubierto por `PLAN-OBSERVER-V2.md`. Aquí solo extraemos el core compartido.
2. **Dashboard de training completo.** Está en `PLAN-TRAINING-DASHBOARD.md`. Aquí solo arreglamos el leak del poll.
3. **Auto-training con gates reales.** Está en `PLAN-AUTO-TRAIN-V2.md`. Aquí solo arreglamos el cleanup del server.
4. **Eros Alive (chat, feed, personalidad).** Está en `PLAN-EROS-ALIVE.md`. Independiente.
5. **Vercel deploys.** Está en `PLAN-VERCEL-DEPLOY.md`. Independiente.
6. **Bundle analysis del panel.** Side quest para P3 si aparece en métricas.

Estas 6 cosas se mencionan para que el reader sepa que NO se perdieron — están en sus propios planes.

---

## Estimación total

| Rama | Commits | Esfuerzo | Paralelizable |
|------|---------|----------|---------------|
| 1. security-hardening | 5 | 4h | Sí |
| 2. memory-leaks | 6 | 5h | Sí |
| 3. scaffold-broken | 7 (+4 sub) | 6h | Sí |
| 4. scripts-cross-platform | 5 | 4h | Parcial (4.4 es grande) |
| 5. docs-coherence | 4 | 2h | Sí |
| 6. quality-polish | 8 | 3h | Sí |
| **Total** | **35+** | **~24h** | |

En una sesión de foco continuo: 3 días de trabajo. Con el brain autónomo: 1 día corriendo en paralelo las ramas 1/2/3.

---

## Prioridad

**Esta semana:** ramas 1 + 2 (P0 — agujeros explotables y leaks que pueden destruir state).
**Próxima semana:** ramas 3 + 4 (P1 — scaffold y cross-platform, desbloquean proyectos futuros).
**Después:** 5 + 6 (P2/P3 — deuda técnica, no bloquean nada).

Si solo hay tiempo para una rama: **Rama 1**. Los path traversals son explotables remotamente si alguien expone el panel en LAN.

---

## Fuentes

- Audit completo ejecutado el 2026-04-06, 4 agentes Explore en paralelo (panel, scripts, configs, scaffold)
- ~95 hallazgos: 10 críticos, 20+ altos, 40+ medios, resto bajos
- Plan organizado por ramas independientes para permitir desarrollo paralelo sin conflictos
