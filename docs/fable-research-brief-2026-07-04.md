# Brief de investigación para Fable — evolución de Eros (2026-07-04)

Este documento es un encargo, no un informe. Está escrito para que lo recoja **Fable** (motor más potente que el que armó este brief) y lo use como punto de partida para investigar y después reconstruir lo que haga falta de Eros. No contiene la investigación en sí — contiene el problema, el estado actual verificado, y el mandato.

Contexto de dónde viene esto: se hizo una auditoría técnica completa el mismo día (`docs/audit-2026-07-04.md`) que cubre bugs, rutas rotas y consistencia de documentación — ese documento es sobre que Eros **funcione** tal como está diseñado hoy. Este documento es otra cosa: es sobre que Eros **deje de ser un proyecto a medio terminar** y se convierta en lo que Mateo realmente quiere — un asistente personal que actúe como director creativo de verdad, con una interfaz real para colaborar con él, no solo un pipeline autónomo que corre solo y entrega un resultado al final.

## Mandato — libertad total, con una sola restricción dura

Fable tiene libertad total. Nada de lo que existe hoy en Eros es intocable:

- Si el stack (Vue 3 + Vite + GSAP + Lenis) es la elección correcta, mantenerlo — pero decidido por investigación, no por inercia. Si otra cosa sirve mejor al objetivo, cambiarlo.
- Si la arquitectura del loop (`state.mjs next/done`, orquestador determinístico, agentes fijos) no alcanza para lo que se pide acá, rediseñarla.
- Si `rules.json`, `personality.json`, o cualquier otra pieza del sistema de memoria necesitan un modelo de datos distinto para soportar lo nuevo, cambiarlos.
- Si la respuesta correcta es reescribir partes enteras del sistema en vez de parchear, reescribir.

**La única restricción dura:** el razonamiento de Eros tiene que seguir corriendo dentro de una sesión de Claude Code, usando la membresía de Mateo — no una arquitectura que llame a la API de Anthropic (u otro LLM) por su cuenta con facturación medida por separado. Esto no significa que no pueda haber una app/servicio propio corriendo en paralelo (estado, UI, servidor local) — significa que ese servicio nunca reemplaza a la sesión de Claude Code como el cerebro que piensa y decide; a lo sumo la orquesta, le pasa contexto, o expone una interfaz para interactuar con ella. Todo lo demás — stack, arquitectura, memoria, interfaz, agentes — está abierto a rediseño completo.

Eros hoy es un proyecto inconcluso. Le falta mucho. Este brief no es una lista cerrada de tareas — es el punto de partida para que Fable investigue en serio y después decida cuánto de Eros hay que reconstruir para llegar a eso.

## Los cuatro frentes

1. **Anti-genericidad visual** — que el resultado deje de parecerse a "hecho por IA".
2. **Generación de medios real** — que Eros pueda producir imagen/video/assets de verdad, no simularlos con CSS.
3. **El cerebro** — reconstruir la memoria de Eros como un vault de Obsidian real, no una colección de JSON opacos.
4. **La interfaz de colaboración** — una superficie 100% enfocada en front-end que proponga ideas, haga preguntas, tenga "ojos" sobre su propio trabajo, y se conecte a los MCPs de los frentes anteriores — no un chat.

Los cuatro están relacionados: el cerebro (3) es lo que hace que el anti-genericidad (1) y el aprendizaje de qué assets generados funcionan (2) sean acumulativos y consultables; la interfaz (4) es lo que hace que todo eso sea colaborativo con Mateo en vivo, en vez de un batch autónomo que solo se puede aprobar o rechazar al final.

## Frente 1 — Anti-genericidad visual

### Qué existe hoy (verificado, no supuesto)

Eros ya tiene un motor de reglas anti-IA en `.eros/memory/design-intelligence/rules.json`. Esto importa porque **no es investigación desde cero** — hay que evolucionar esto o reemplazarlo por algo mejor, con conocimiento de causa. Reglas ya promovidas a `CLAUDE.md` (activas, aplicándose siempre):

- Gradientes violeta = fingerprint instantáneo de IA
- Inter/Roboto = tipografías fingerprint de IA
- Grids `1fr 1fr` = look de template
- Padding uniforme entre secciones = tell de IA

Reglas más nuevas, todavía en estado `CANDIDATE` (no promovidas, con 1 sola validación cada una — poca evidencia real detrás), creadas el **2026-04-10** en una auditoría interna llamada `audit-v1/anti-ai-evolution`:

- DM Sans, Space Grotesk, Outfit, Sora, Plus Jakarta Sans → "tipografías fingerprint de IA emergentes"
- Glassmorphism genérico (blur + rgba bg + border-radius 16+) = "fingerprint de IA 2026"
- Fade-up como única animación de entrada = tell de IA
- Border-radius uniforme en todos los elementos = sensación de template

**El problema concreto:** esta lista tiene ~3 meses de antigüedad relativa a hoy y nunca se actualizó desde entonces. El campo de "qué se ve genérico hecho por IA" se mueve rápido — lo que era distintivo en abril de 2026 (glassmorphism, Space Grotesk) puede ya haberse convertido en el nuevo default de todos los generadores de código con IA, y lo que hoy se ve fresco puede no estar ni siquiera en esta lista.

Además, en `.eros/memory/design-intelligence/personality.json → aesthetic.motionPreferences` hay señales de que el propio Eros repite técnicas: "Stagger cascade" con 88% de peso y 6 evidencias, "Clip-path image reveal" con 90% de peso — son técnicas que Eros usa *mucho*. Investigar si un peso tan alto en pocas técnicas es "una firma de autor" (bien) o "el propio Eros generando su propio patrón repetitivo" (mal, exactamente el problema que se supone que evita).

### Preguntas que tiene que responder la investigación

1. ¿Cuáles son los tells visuales de "hecho con IA" vigentes en la segunda mitad de 2026 — no los de abril? (paletas, tipografías, composición, motion, glassmorphism/neumorphism/gradientes específicos, iconografía, spacing).
2. ¿Qué está pasando en diseño real no-IA en este momento — Awwwards, Site Inspire, agencias top (ver lista de referencias más abajo) — que un generador de código con IA típicamente NO hace? (Ej: tipografía editorial con jerarquía extrema, grids rotos deliberadamente, texturas físicas escaneadas, motion con imperfección intencional, paletas de un solo color desaturado + un acento, etc.)
3. ¿Qué workflows de proceso creativo (no solo outputs) hacen que un diseño se sienta "hecho por alguien con intención" en vez de "generado"? Por ejemplo: ¿empezar por una referencia física/analógica, restricciones de paleta deliberadamente limitadas, un elemento "roto"/asimétrico a propósito, deconstrucción tipográfica?
4. Concretamente: ¿la lista `CANDIDATE` de `rules.json` sigue siendo válida hoy, o ya es "lo que todos hacen" (se volvió el nuevo cliché)? Justificar caso por caso.
5. Producir una lista nueva de reglas — en el formato de `rules.json` si ese formato sigue siendo el adecuado, o en uno mejor si Fable decide rediseñar el sistema de memoria.
6. Evaluar el patrón de repetición de motion (`stagger cascade` al 88%, `clip-path reveal` al 90%) — ¿es firma de autor o riesgo de auto-clonación? Proponer si conviene bajar el peso de las técnicas dominantes, diversificar el "menú" de motion, o cambiar directamente cómo se pondera esto.

### Dónde investigar

Fuentes reales, no teoría: Awwwards (sitio del día/mes/año, no solo el listado), Site Inspire, Codrops/Codrops Playground para motion, Behance curado, estudios como Locomotive, Basement.studio, Resn, Active Theory, Hello Monday — estudios que consistentemente ganan por *no* verse genéricos. También investigar del lado contrario: qué dicen los propios críticos de IA (hay hilos y artículos específicamente sobre "cómo se ve un sitio hecho con v0/Lovable/Claude Artifacts/Cursor" — esos son justamente los tells a evitar).

## Frente 2 — Generación de medios real

### Qué existe hoy (verificado, no supuesto)

Este mismo entorno de Claude Code **ya tiene conectados** varios servidores MCP orientados a creación visual, a nivel de cuenta (no específicos de este proyecto, y no wireados a Eros todavía):

- **Adobe for Creativity** (`illustrator` en la config MCP local) — generación y edición de imagen con Firefly (remove background, generative fill/expand, ajustes, vectorizado, presets), herramientas de video (quick-cut, resize, render, metadata), y generación de documentos/diseño visual (exportación a Adobe Express).
- **Canva** — generación de diseños completos, plantillas de marca, exportación, edición.
- **Pencil** — herramienta de diseño/wireframing con guías de estilo, variables, export de nodos.
- **Google Drive** — lectura/escritura de archivos, útil para mover assets generados.

Es decir: hay infraestructura de generación de medios ya disponible en la cuenta, pero investigar libremente si conviene usarla, complementarla, o directamente ir por otra cosa (modelos locales vía ComfyUI, APIs directas de Flux/Ideogram/Runway/Luma/Kling, lo que sea que la investigación determine que da mejor resultado). No hay que quedarse con lo que ya está conectado si algo mejor existe.

Ahora mismo, según `.eros/agents/builder.md`, el flujo de "visual estructural" en un hero se resuelve con: fotografía a 75-85% de opacidad, gradientes CSS, o tipografía como textura — nunca con una imagen o video generado a medida para ese proyecto específico. Y `rules.json` (RULE-009) ya registra que **"gradient placeholders en vez de imágenes reales = rechazo"** — Eros ya sabe que esto es un problema, pero no tiene ninguna herramienta para resolverlo generando el asset real.

### Qué tiene que responder la investigación

1. **Elección de herramienta:** evaluar todas las opciones (MCPs ya conectados, otros MCPs, APIs directas, modelos locales) para: imagen editorial/fotográfica de alta calidad que no tenga el propio "look de IA generada" (piel de más, simetría perfecta, iluminación de stock), video corto (loops de fondo, micro-clips para hover/scroll), y si hace falta, generación 3D o audio. Elegir con criterio, no por disponibilidad.
2. **Dónde vive esto en la arquitectura:** ¿nueva fase del pipeline, nuevo agente, responsabilidad del `builder` existente? Si la arquitectura actual del loop no tiene un buen lugar para esto, rediseñarla — no forzar la pieza nueva adentro de una estructura que no la contempla.
3. **Control de calidad del asset generado:** técnicas de prompting/post-proceso (grano, tratamiento de color, recorte no convencional, mezcla con elementos gráficos) que eviten que el asset generado se vea "generado".
4. **Costo/cuota/latencia:** investigar cómo encajar generación real (con costo y tiempo no triviales) sin romper el flujo — batch al inicio, cacheo, límites por sección, lo que tenga más sentido.
5. **Versionado y memoria:** si Eros genera un asset, cómo queda registrado (prompt, modelo, resultado, aprobación/rechazo de Mateo) para que el sistema aprenda qué estilos de generación funcionan para qué tipo de proyecto — extendiendo la lógica de `personality.json` a medios, no solo a código.
6. **Modelos para otras tareas:** copywriting de microcopy, nombres, taglines — evaluar si conviene un modelo/MCP distinto al que orquesta el pipeline para estas tareas puntuales.

## Frente 3 — El cerebro (memoria en Obsidian)

### Qué existe hoy (verificado, no supuesto)

La memoria de Eros hoy son ~15 archivos JSON sueltos en `.eros/memory/design-intelligence/` (`personality.json`, `rules.json`, `project-registry.json`, `revision-patterns.json`, `pipeline-lessons.json`, `signatures.json`, `section-patterns.json`, `technique-scores.json`, varios `training-*.json`, etc.), editables solo a través de scripts (`memory.mjs`, con un shim `eros-memory.mjs`) porque hooks en `.claude/settings.json` bloquean la escritura directa. La auditoría del mismo día encontró que esto ya muestra señales de fragmentación: proyectos que aparecen en `previews/` pero no en `project-registry.json` tras una purga de migración, y lecciones narradas en `revision-patterns.json`/`pipeline-lessons.json` que ni siquiera están conectadas entre archivos vía ningún tipo de referencia — todo vive en silos JSON separados, sin grafo de relaciones real.

Dato interesante como punto de partida: la memoria que uso yo mismo entre sesiones de Claude Code (no la de Eros — la mía, en `~/.claude/.../memory/`) ya sigue una convención parecida a la que Mateo pide: archivos markdown con frontmatter, un `MEMORY.md` como índice, y `[[wikilinks]]` entre notas relacionadas. Es básicamente un vault de Obsidian sin abrirse nunca en Obsidian. Vale la pena que Fable la mire como referencia de formato — no para copiarla literal, pero sí como prueba de que el patrón nota-markdown-con-links funciona bien para este tipo de conocimiento acumulativo.

Mateo quiere que el cerebro de Eros sea un vault de Obsidian real y navegable: notas en markdown, con links y grafo visual, que se puedan abrir, leer y editar a mano — no JSON opaco que solo un script sabe interpretar.

### Qué tiene que responder la investigación

1. Cómo estructurar el vault: ¿una nota por proyecto, una por regla anti-IA, una por técnica de motion/composición, una por lección de sección, con wikilinks cruzados entre ellas? ¿Carpetas por tipo o todo plano con tags y backlinks?
2. Cómo lee/escribe esto Claude Code en runtime: Obsidian es una capa de visualización sobre archivos `.md` en disco — Claude ya puede leer y escribir markdown directamente, no hace falta ninguna API de Obsidian para eso. Investigar si conviene apoyarse en convenciones de plugins populares (Dataview para queries tipo tabla sobre el frontmatter, Templater para templates de notas nuevas) para que el vault también sea consultable programáticamente y no solo navegable a ojo.
3. Migración: cómo pasar el conocimiento ya validado en los JSON actuales (reglas promovidas, lecciones reales de Forge Studio/Coque, el registro de proyectos) a notas de Obsidian sin perder la señal ya acumulada — la auditoría tiene el detalle de qué archivos y qué contenido es genuinamente valioso vs. ruido.
4. Cómo el resto del sistema escribe en este cerebro sin duplicar la lógica de enforcement que hoy tienen los hooks (evitar que se vuelva a fragmentar en archivos que nadie cruza).
5. Si el vault conviene que sea parte del propio repo de Eros o una carpeta separada, sincronizada, para poder abrir Obsidian de verdad sobre esto sin interferir con el git del proyecto.

## Frente 4 — La interfaz de colaboración

### Qué existe hoy (verificado, no supuesto)

Hoy existe `panel/` (Vue 3 + Vite, documentado en el README raíz) con dos superficies: **Eros** (`/eros/*`) — observabilidad de calidad en modo solo-lectura vía SSE (score, queue, timeline, señales del observer, blueprint browser, historial de runs) — y **Workshop** (`/workshop/*`) — un editor ABM local de tokens y componentes con preview en vivo y staging/diff.

Esto **no es** lo que Mateo pide. Él no quiere un chat, ni un dashboard de métricas: quiere una interfaz 100% enfocada en desarrollo front-end que se comporte como un colaborador activo — que proponga ideas y haga preguntas por su cuenta, no que solo espere instrucciones o muestre un semáforo de aprobado/rechazado. Y quiere que Eros tenga "ojos": que pueda ver capturas de su propio proyecto en progreso y criticarlo él mismo, en loop continuo, no solo en una pasada de auditoría al final de una fase.

Adicionalmente, el CLI (Go + Bubble Tea, `cli/`) resuelve la creación inicial del proyecto (wizard de brief) pero por diseño propio no gestiona el estado en curso — su propio README admite que `eros resume` no restaura fase real y `eros list` no está conectado a `.eros/state.md`.

### Qué tiene que responder la investigación

1. Qué significa concretamente "que no sea un simple chat" en términos de UI real — ¿un lienzo visual donde se ven las secciones armándose en vivo con anotaciones de Eros al costado y preguntas puntuales, en vez de una ventana de texto tipo mensajería? Investigar patrones de UI de colaboración humano-IA en vivo fuera del mundo de diseño web puro (herramientas de imagen/video con steering en vivo, copilots de código con revisión inline) y traer lo que aplique.
2. Cómo se implementa la proactividad: Eros generando preguntas y propuestas por su cuenta en los puntos de decisión reales (paleta, dirección de un hero, qué técnica de motion usar) en vez de esperar que Mateo pregunte primero.
3. "Ojos" y autocrítica: esto ya existe parcialmente como el sistema de `observer`/`capture-refs` con Puppeteer (ver auditoría). Investigar cómo llevar eso a un loop de autocrítica continuo — screenshot → crítica propia vía visión multimodal → nota nueva en el cerebro (Frente 3) → ajuste — en vez de una pasada de auditoría aislada al final de una fase.
4. Cómo se conecta la interfaz con MCPs — tanto los de generación de medios (Frente 2) como potencialmente otros (edición de imagen en vivo, exportación).
5. Cómo se conecta la interfaz con el runtime de Claude Code sin romper la restricción dura del mandato: la interfaz puede ser una app companion con su propio servidor local de estado/UI, pero el razonamiento real tiene que seguir pasando por la sesión de Claude Code, no por llamadas directas a una API facturada aparte.
6. Cómo encaja o desaparece el CLI (Go) frente a esta interfaz nueva.

## Entregable esperado de Fable

No se espera una lista de tareas menores — se espera una propuesta real de hacia dónde tiene que evolucionar Eros, y después la ejecución de esa propuesta hasta donde el alcance lo permita. Concretamente:

1. Un documento de investigación y propuesta arquitectónica (`docs/research/` o donde Fable considere que corresponde) que cubra los cuatro frentes, con hallazgos concretos y citables, y una decisión explícita para cada uno: qué se mantiene de Eros tal cual está, qué se extiende, y qué se reconstruye desde cero.
2. Si la propuesta implica cambios de arquitectura (loop, agentes, memoria, interfaz), documentarlos con el mismo nivel de detalle que un rediseño real necesitaría — no una nota de intención.
3. Ejecutar lo que se pueda ejecutar en la misma pasada. Donde haga falta una decisión de Mateo (por ejemplo, presupuesto de generación, qué proveedor de imagen/video preferir, cuánto rediseñar el CLI vs. la interfaz web), dejarla planteada explícitamente en vez de asumirla.

La vara es alta a propósito: el objetivo final es que Eros deje de sentirse como un proyecto a medio construir y empiece a sentirse como el director creativo personal que se supone que es.
