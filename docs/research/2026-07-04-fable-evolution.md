# Evolución de Eros — Investigación y propuesta arquitectónica

**Autor:** Fable (Claude Fable 5) · **Fecha:** 2026-07-04
**Encargo:** `docs/fable-research-brief-2026-07-04.md` · **Auditoría base:** `docs/audit-2026-07-04.md`
**Investigación cruda:** `docs/research/raw/2026-07-04-*.md` (5 informes con fuentes citadas)

Este documento es la síntesis y la decisión. Cada frente cierra con un veredicto explícito: **qué se mantiene, qué se extiende, qué se reconstruye** — y qué queda planteado para Mateo.

---

## 0. Resumen ejecutivo

1. **El loop V8 ya corre.** Los 3 blockers de rutas de la auditoría están arreglados y commiteados, más un cuarto que la auditoría no vio (`eros-observer.mjs` en `train-reference.mjs:102`). `pipeline.md` V7 quedó marcado superado; `AGENTS.md` describe ahora el protocolo next/done real.
2. **Frente 1:** las reglas anti-IA de abril quedaron obsoletas en un sentido preciso: los *tells* ahora son **machine-checkable** (checklist de 16 patrones de Krebs, abril 2026, con detectores públicos). Reglas nuevas: 20, testables, con el giro clave de H2-2026: *el cream/beige "cálido y de buen gusto" es el nuevo violeta*. El sesgo de auto-repetición de Eros (stagger 88%, clip-path 90%) es real y se corrige con cuota por proyecto + decay.
3. **Frente 2:** hallazgo duro — el MCP de Adobe **no tiene text-to-image**. La estrategia correcta es **fotografía real primero**: Adobe Stock (licencias cubiertas por la suscripción) + cadena de edición Firefly (grade → grain → crop editorial) que es exactamente el toolkit anti-look-IA. Generación pura queda como escalación vía Firefly Boards (handoff humano) — decisión de Mateo.
4. **Frente 3:** el cerebro se reconstruye como vault Obsidian en `brain/` — carpetas por tipo + notas MOC + frontmatter tipado, consultable por humano (Obsidian Bases) y por máquina (Grep sobre frontmatter). Los JSON actuales migran 1:1 sin pérdida; el estado operacional (training-status, feeds) queda como JSON fuera del vault.
5. **Frente 4:** la interfaz nueva es **Eros Studio** — app companion local (Node + Vue) que orquesta una sesión de Claude Code vía Agent SDK (confirmado: sigue usando la suscripción, el cambio de billing se pausó el 15 de junio). No es chat: preview vivo instrumentado + decision cards + loop de ojos continuo con pins de crítica sobre la página renderizada.

---

## 1. Frente 1 — Anti-genericidad visual

### Hallazgo central

Desde abril el campo cambió de naturaleza: dejó de ser una intuición de diseñadores y se volvió **cuantitativo y adversarial**. Adrian Krebs (Kadoa) escaneó 1,590 landings de Show HN contra 16 patrones DOM/CSS deterministas — 22% slop pesado, 46% limpio — y su checklist parió herramientas públicas de detección (detectvibecode.com, VibeCheck, impeccable.style/slop con 50 reglas). **El output de Eros va a ser escaneado por esas heurísticas exactas.** La meta operativa nueva: 0–1 patrones en la checklist de Krebs, como gate duro.

### Veredictos sobre las reglas CANDIDATE de abril

| Regla abril | Veredicto | Detalle |
|---|---|---|
| DM Sans/Space Grotesk/Outfit/Sora/Plus Jakarta = fingerprints emergentes | **Parcialmente superada** | Space Grotesk confirmada top-tier. El set canónico 2026 es **Inter + Geist + Space Grotesk + Instrument Serif** (+ Poppins). Se agregan: Satoshi, General Sans, Bricolage Grotesque, Figtree, Onest. Nada gratis es "seguro" por nombre — la seguridad viene de foundry faces con historia o elecciones genuinamente oscuras. |
| Glassmorphism genérico = fingerprint | **Vigente y codificada** | Uno de los 2 fingerprints CSS dominantes de Krebs; #3 en la lista "over it 2026" de Creative Boom. Excepción estrecha: glass funcional à la Linear. |
| Fade-up como única entrada = tell | **Vigente y ampliada** | Ahora incluye stagger uniforme, hovers ausentes, snaps sin easing, y "motion porque sí". |
| Border-radius uniforme = template | **Vigente con matiz** | El tell es el *default intacto* (8/16px, rounded-2xl + shadow-lg p-6), no la consistencia. Extremos deliberados (0px, un valor firma, pill) leen como intención. |

### Lo nuevo que no estaba en el radar de abril

- **El cream/beige cálido + acento ámbar es "el em-dash del diseño"** — el escape favorito de los generadores cuando se les prohíbe el violeta. Eros venía usando "warm whites #fafaf7" como principio: hay que vigilar que no derive en el nuevo cliché.
- **El serif itálico como palabra-acento dentro de un headline sans** — LA firma de H1-2026.
- La **badge/eyebrow pill sobre el H1**, el **borde izquierdo de color en cards**, los **stat banners** y los **markers 01/02/03** son tells de primer orden.
- El espacio positivo (lo que la IA no hace): shader custom por proyecto, coreografía de ejes de variable fonts, grilla rota con intención, textura física real, pacing editorial extremo (12rem/0.75rem), motion sensible a velocidad de scroll, transiciones con canvas persistente.

### El sesgo de auto-repetición (pregunta 6 del brief)

**Veredicto: riesgo de auto-clonación, no firma de autor.** Una firma de autor es una *elección* contextual; un peso de 0.90 en un sistema de selección ponderada es un *default estadístico* que se auto-refuerza (más uso → más evidencia → más peso). Exactamente el mecanismo que produce el look v0/Lovable, a escala personal. Corrección adoptada (ya en el vault):

- **Cuota por proyecto:** máximo 2 usos de la misma técnica de reveal por página; el hero y la sección final nunca comparten técnica.
- **Decay de peso:** el peso efectivo de una técnica baja 15% por cada proyecto consecutivo que la usa; se recupera al descansar un proyecto.
- **Slot de experimento obligatorio:** el presupuesto de experimento (20%) se gasta *primero* en la categoría motion — cada proyecto debe estrenar o resucitar al menos 1 técnica con <3 usos.

### Decisión Frente 1

- **Se mantiene:** el ciclo de vida de reglas (CANDIDATE → validaciones → PROMOTED) — es bueno y probó funcionar.
- **Se extiende:** las 4 reglas promovidas viejas siguen (violeta, Inter/Roboto, 1fr 1fr, padding uniforme) — todas revalidadas por la investigación.
- **Se reconstruye:** el set completo — 20 reglas nuevas 2026-H2, testables una por una, viven como notas del vault (`brain/rules/`), no en JSON. El gate de Krebs (16 patrones) entra como criterio de QA del observer.

---

## 2. Frente 2 — Generación real de medios

### Hallazgo central (verificado contra los schemas MCP vivos, no marketing)

El MCP de Adobe conectado **no expone generación text-to-image**. Lo que sí expone es más interesante para el problema real de Eros:

1. **`asset_search` + `asset_license_and_download_stock`** — buscar y licenciar **Adobe Stock** en alta resolución, cubierto por la suscripción. Fotografía real, que por definición no tiene look de IA.
2. **La cadena de edición completa**: crop/expand generativo (con seed), 100+ presets Lightroom (film/cinematic/B&W), ajustes finos (HSL, exposure, temperatura), y el toolkit de des-digitalización exacto: **grain (30–45), halftone, noise, tint monocromático, lens blur**.
3. Compositing real: select-by-prompt, remove-background, fills con blend modes.

La generación de vanguardia (Firefly Image 5, FLUX.2, Ideogram 3, Veo 3.1, etc.) vive en la web de Firefly — ilimitada bajo la promo actual de Adobe — pero **no es alcanzable por MCP**; solo vía handoff (Eros crea un Firefly Board con el prompt pack, Mateo genera, Eros ingiere y post-procesa).

### El pipeline de assets adoptado

**"Fotografía real primero, generación como escalación":**

```
PRIMARIO   Adobe Stock → recrop editorial off-center → 1 preset de grade por proyecto
           → ajustes (highlights ↓, saturación ↓, temperatura → paleta) → grain 30–45
           → (opcional) halftone/duotone como identidad de textura del proyecto
SECUNDARIO Firefly Boards handoff (prompt pack escrito por Eros con las reglas de
           de-AI-ing: cámara/film real, imperfección explícita, composición off-center)
TERCIARIO  Canva generate-design para gráficos compuestos (OG images, social cards)
VECTOR     SVG autorado por Eros (Pencil MCP / a mano) + image_vectorize
VIDEO      Sin path autónomo. Preferir shader/WebGL motion (fortaleza actual de Eros)
```

La regla de oro que sale de la investigación: **una imagen con grade + grain + crop intencional es a la vez más "dirigida" y menos identificable como IA** — los tratamientos se componen. Y el mismo tratamiento se aplica a Stock, así el sitio entero comparte una atmósfera (eso es dirección de arte, no decoración).

### Dónde vive en la arquitectura

- Nueva fase del pipeline: **`design/assets`** — después de tokens (la paleta define el grade), antes del build de secciones (el builder recibe assets reales, nunca placeholders). El trabajo MCP lo hace la **sesión principal (CEO)** — los MCPs viven ahí, no en subagentes.
- Workflow nuevo: `.eros/workflows/media.md` — brief de asset por slot, cadena de post-proceso, y registro.
- Cada asset queda registrado como **nota del vault** (`brain/assets/`) con front-matter: fuente, prompt/stock-id, cadena de post-proceso aplicada, veredicto de Mateo y lección — extendiendo la lógica de personality.json a medios, que era exactamente lo que pedía el brief.

### Decisiones que quedan para Mateo (no asumidas)

1. **¿GPU con ≥12GB VRAM?** Si sí, ComfyUI + Flux 2 Klein local es el único camino text-to-image *autónomo y gratis*. Un chequeo de hardware decide.
2. **¿Aceptás el handoff de Firefly Boards** (Eros pausa, generás en la web, seguís)? Es el único acceso a los modelos top sin API nueva.
3. **¿Recraft API paga** para ilustración vectorial nativa? Única opción claramente superior en ese nicho.
4. **Verificar cuota real de licencias de Adobe Stock** en tu plan (un `get_account_type` + probar una licencia lo responde).

---

## 3. Frente 3 — El cerebro como vault de Obsidian

### Hallazgo central

El espacio "memoria de agente como vault de Obsidian" maduró: los proyectos de referencia convergen en **carpetas por tipo + notas MOC (hubs) + frontmatter YAML tipado** — ni Zettelkasten (IDs hostiles al humano), ni PARA (eje equivocado), ni flat-with-tags (rompe el lado máquina: el agente necesita una regla de archivado determinista). Para consultas, **Obsidian Bases ganó** (nativo, sin plugins; Dataview está congelado) — y la máquina no necesita ningún plugin: **Grep sobre frontmatter es el query engine**.

La crítica seria a "markdown como memoria" (sin schema, corrupción concurrente, flooding) tiene respuestas conocidas que adoptamos: templates como schema, hook PostToolUse que valida frontmatter en cada escritura, notas atómicas, secciones append-only con marker, un solo writer por vez con git como árbitro.

### Estructura adoptada

```
brain/                        ← vault visible en la raíz del repo (Obsidian lo abre directo)
├── Home.md                   ← dashboard humano (embebe vistas .base)
├── START.md                  ← entry point máquina, ≤2K tokens, REGENERADO
├── self/eros.md · aesthetic.md · growth-log.md
├── maps/  (5 hubs MOC: rules, techniques, projects, style, lessons)
├── rules/ · techniques/ · patterns/ · signatures/ · palettes/
├── typography/ · lessons/ · revisions/ · projects/ · references/ · assets/
├── bases/  (.base: rules, techniques, projects…)
├── templates/  (schema fuente de verdad por tipo de nota)
└── .obsidian/  (parcialmente commiteado: app, appearance, graph con colores por tipo)
```

- Nombres kebab-case descriptivos (`rules/no-purple-gradients.md`); los IDs viejos (`RULE-001`) sobreviven como `aliases`, así `[[RULE-001]]` resuelve.
- Cuerpo de nota: prosa humana arriba, `## Evidence log` + `<!-- eros:append-below -->` abajo — la máquina solo agrega debajo del marker. Cero clobbering.
- **Conocimiento vs estado:** `activity-feed.json`, `training-*.json`, `auto-train-status.json` NO migran — son estado operacional, van a `.eros/state/`. Solo el conocimiento se vuelve notas.
- Protocolo de lectura: SessionStart inyecta `START.md` (reemplaza la inyección de personality.json); después Grep dirigido (`Grep "^status: CANDIDATE" brain/rules/`), nunca bulk-read.
- Git: vault dentro del repo (un commit ata el proyecto y el conocimiento que produjo); `.obsidian/workspace.json` ignorado; un committer por sesión.

### Migración

Mapa 1:1 completo en el informe crudo (§f). Lo esencial: `personality.json` → `self/` (3 notas), `rules.json` → 17 notas + las 20 nuevas del Frente 1, `technique-scores.json` → 13 notas con arrays de scores en frontmatter, lecciones/revisiones/paletas/pairings/proyectos → notas enlazadas entre sí (los wikilinks cruzados se insertan automáticamente cruzando nombres — el grafo nace denso, cero huérfanos). Los JSON viejos quedan congelados en `.eros/memory/_archive/` un release antes de borrarse.

### Decisión Frente 3

- **Se mantiene:** el *contenido* — todo lo aprendido (Forge Studio, Coque, las 4 reglas promovidas, los scores de técnicas) migra sin pérdida. Y el principio de "escritura disciplinada" que hoy imponen los hooks.
- **Se extiende:** la memoria gana relaciones (grafo), consultabilidad humana (Bases) y editabilidad manual segura (markers append-only).
- **Se reconstruye:** el formato (JSON → markdown+frontmatter), el entry point (`START.md` regenerado en vez de personality.json crudo), y el writer (`scripts/memory/vault.mjs` reemplaza a `memory.mjs` como interfaz de escritura).

---

## 4. Frente 4 — Eros Studio (la interfaz de colaboración)

### Hallazgo central

Dos hechos técnicos habilitan todo:

1. **El Agent SDK sigue corriendo contra la suscripción.** El cambio que lo movía a créditos separados (anunciado 14 mayo) se **pausó el 15 de junio, el día que entraba en vigor**. El SDK spawnea el CLI `claude` local ya logueado — una app companion personal hereda el OAuth de la membresía, cero API keys. Esto cumple la restricción dura del mandato *hoy*, con un riesgo conocido: la política puede volver. Mitigación: un solo entry point `query()`, swap de auth en un archivo.
2. **`AskUserQuestion` está roto en modo programático** (se auto-resuelve vacío; issue cerrado not-planned). Las preguntas proactivas van como **MCP tool propia** (`propose_decision`) cuyo handler simplemente no resuelve su Promise hasta que la UI responde — bloqueo limpio y 100% bajo nuestro control.

### Qué es (y qué no es)

**No es un chat ni un dashboard.** Es una superficie de tres paneles:

| Panel | Qué hace | De dónde roba el patrón |
|---|---|---|
| **Live Preview** | iframe del dev server del proyecto, instrumentado con `data-eros-id` por elemento (plugin Vite). Overlay de pins: Mateo clickea un elemento y ancla una instrucción; Eros ancla sus críticas en el mismo lenguaje visual. | Onlook (MIT — estudiar `packages/parser`), Vercel Preview Comments |
| **Decision Dock** | Cards estructuradas en los puntos de decisión reales: paleta (3 swatches renderizados sobre un screenshot de sección real, no hexes en prosa), dirección de hero, técnica de motion. Cola no-bloqueante + un slot bloqueante. Recomendación de Eros marcada. | Devin Interactive Planning, Figma Make point-and-edit |
| **Eyes Strip** | Filmstrip de capturas (cada una atada a un commit), before/after wipe por sección, y las críticas de Eros como pins con severidad. "Eros está mirando…" — presencia sin chat. | v0 version rail, Krea realtime, Percy visual diff |

### El loop de ojos (autocrítica continua)

Dos niveles, para no quemar la ventana de 5 horas del plan:

1. **Percepción determinista (cero tokens):** chokidar sobre `src/**` → confirmación HMR de Vite → debounce 800ms → captura Playwright (contexto persistente, warm) → pixelmatch contra la captura anterior → filmstrip.
2. **Crítica (en sesión, gated):** solo cuando el diff pixel supera umbral o cierra una unidad de trabajo, el server inyecta el capture a la sesión → un **subagente evaluator** mira y juzga (el hilo principal solo recibe el veredicto) → `report_critique(capture_id, verdict: ship|adjust|rethink, pins[])` → los pins aparecen en el preview → el hook Stop **rechaza cerrar la fase** mientras haya pins `adjust` sin resolver. La crítica se persiste como JSON en `.eros/state/` y como lección en el vault si generaliza — el archivo en disco es la fuente de verdad, nunca el transcript.

### Arquitectura (respetando la restricción dura)

```
Vue app (Studio UI) ⇄ WebSocket ⇄ Node server local
                                    ├─ Agent SDK query() streaming → claude CLI (SUSCRIPCIÓN)
                                    ├─ MCP in-process: propose_decision / report_critique /
                                    │                  get_pending_feedback / capture
                                    ├─ Receptor HTTP de hooks de Claude Code (:4242)
                                    ├─ Watcher chokidar + Playwright + pixelmatch
                                    └─ Estado: .eros/state/ + filmstrip + git refs
```

El razonamiento vive **solo** en la sesión de Claude Code. El server nunca llama a un LLM: orquesta, captura, persiste y presenta.

### Qué pasa con lo que existe

- **`panel/`** (observabilidad + Workshop): queda como está a corto plazo. Studio lo reemplaza como superficie primaria; Workshop (editor de tokens) se absorbe a Studio en una fase 2 (los cambios de tokens son el caso perfecto de "edición sin tokens de LLM" à la v0 design mode). **Decisión para Mateo:** cuándo matar panel.
- **CLI (Go):** se mantiene — el wizard de brief sigue siendo el mejor intake inicial y Studio puede lanzarlo. No invertir más en `eros resume`/`list` (Studio los vuelve obsoletos). **Decisión para Mateo:** si preferís que Studio absorba también el intake, el CLI se retira.

### Decisión Frente 4

- **Se mantiene:** el loop determinista next/done como columna vertebral (ahora también server-driven vía Stop hooks), los agentes, panel a corto plazo.
- **Se extiende:** los hooks de `.claude/settings.json` ganan un canal HTTP hacia el server de Studio.
- **Se reconstruye:** la superficie de colaboración entera — `studio/` nuevo (server Node + app Vue), con los 12 primitives del catálogo de investigación como guía.

---

## 5. Stack global — veredicto

**Vue 3 + Vite + GSAP + Lenis se queda**, decidido por investigación y no inercia: "Lenis + ScrollTrigger (+ Three.js) sigue siendo el stack de producción para experiencias scroll-driven premium en 2026"; GSAP es 100% gratis desde la compra de Webflow; Awwwards mantiene categoría Vue activa. Los estudios top shippean React/Next, pero el framework no es el diferenciador — el gap real de Eros es **capacidad de shader/WebGL** (una capa TresJS/Three liviana en el scaffold) y **transiciones de canvas persistente**. Eso entra al vocabulario del builder, no cambia el stack.

## 6. Orden de ejecución (esta misma sesión)

1. ✅ Blockers + consolidación del working tree (3 commits)
2. ✅ Este documento
3. `brain/` — vault completo + migración + START.md + hook SessionStart
4. Reglas 2026-H2 como notas del vault (Frente 1) + política anti-repetición en `self/aesthetic.md`
5. `.eros/workflows/media.md` + fase `design/assets` en el orquestador (Frente 2)
6. `studio/` v1: server (SDK host + hooks + watcher + MCP tools) + app Vue (3 paneles) (Frente 4)
7. Actualización de AGENTS.md/CLAUDE.md/README para reflejar el mundo nuevo

## 7. Decisiones abiertas para Mateo (consolidadas)

| # | Decisión | Contexto |
|---|---|---|
| 1 | GPU ≥12GB VRAM → ¿ComfyUI + Flux 2 local? | Único text-to-image autónomo y gratis |
| 2 | ¿Aceptar handoff Firefly Boards (pausa humana para generar)? | Único acceso a modelos top sin API nueva |
| 3 | ¿Recraft API paga para SVG ilustrativo? | Nicho donde nada gratis compite |
| 4 | Verificar cuota Adobe Stock del plan | La estrategia stock-first la asume disponible |
| 5 | ¿Cuándo retirar `panel/` una vez que Studio cubra Workshop? | Evitar dos superficies en paralelo |
| 6 | ¿El CLI Go se retira si Studio absorbe el intake? | Hoy convive sin conflicto |
| 7 | Licencia/visibilidad del repo (MIT + remote `Maqueta-Pegasuz-V2`) | Pendiente de la auditoría, sin cambios |
