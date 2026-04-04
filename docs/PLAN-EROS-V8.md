# Plan: Eros V8 — De Asistente a Orquestador

## Estado actual (V7)

```
Claude lee SKILL.md (500 líneas) → interpreta → llama scripts cuando se acuerda
```

**Eros es un toolkit. Claude es el jefe.**

Claude decide:
- Cuándo llamar cada script
- Qué argumentos pasar
- Cómo interpretar los resultados
- Qué hacer cuando algo falla
- Cuándo saltar un paso

Scripts son herramientas pasivas que Claude usa a discreción.

## Objetivo (V8)

```
Eros dice exactamente qué hacer → Claude ejecuta UNA cosa → Eros verifica → siguiente
```

**Eros es el jefe. Claude es el ejecutor.**

## Investigación: Qué dice la industria

### Hallazgo 1: Flow Engineering > Agentes Autónomos
La industria en 2025-2026 se movió de "dejar que el LLM decida" a **grafos de estado explícitos** donde el desarrollador diseña el flujo y el agente llena decisiones locales dentro de esa estructura.

### Hallazgo 2: Orquestador Determinista + Validación
Combinar **orquestación determinista (código)** con **ejecución LLM** es el patrón más robusto. El orquestador planifica y valida; el LLM ejecuta tareas puntuales.

### Hallazgo 3: Plan Completo > Paso a Paso
Darle al LLM solo "el siguiente paso" funciona PEOR que darle un plan completo de alto nivel. Necesita contexto de dónde está en el flujo global.

### Hallazgo 4: Guard Nodes
Nodos de validación insertados en puntos específicos del grafo — no solo al final. Gates antes Y después de cada acción.

### Hallazgo 5: Verificación Determinista
Verificar resultados con CÓDIGO (archivos existen, compilan, pasan checks) es más confiable que pedirle al LLM que verifique su propio trabajo.

## Arquitectura V8

### El cambio fundamental

Hoy `eros-state.mjs query` devuelve:
```json
{ "phase": "sections", "task": "build/S-Hero", "next": "Run builder agent..." }
```

V8 `eros-state.mjs next` devuelve:
```json
{
  "step": 14,
  "totalSteps": 47,
  "phase": "sections",
  "task": "build/S-Hero",
  "action": "spawn-agent",
  "agent": "builder",
  "prompt": "Read C:/Users/mateo/Desktop/proyecto/.brain/context/S-Hero.md. Write src/components/sections/S-Hero.vue and .brain/reports/S-Hero.md following the Excellence Standard.",
  "contextFile": ".brain/context/S-Hero.md",
  "expectedOutputs": [
    "src/components/sections/S-Hero.vue",
    ".brain/reports/S-Hero.md"
  ],
  "timeout": 300000,
  "onSuccess": "verify-outputs",
  "onFailure": "retry",
  "plan": "Phase 3: Building 6 sections. Currently on section 2/6 (S-Hero). After this: observe → evaluate → next section."
}
```

Claude recibe:
- Qué hacer exactamente (`action` + `agent` + `prompt`)
- Qué archivos debería crear (`expectedOutputs`)
- Qué hacer si falla (`onFailure`)
- Dónde está en el plan global (`plan`)

### El nuevo SKILL.md (20 líneas, no 500)

```markdown
# /project — Eros Orchestrator V8

You are controlled by Eros. You do NOT decide what to do. Eros decides.

## Protocol

1. Query: `node "$SCRIPTS/eros-state.mjs" next --project "$PROJECT_DIR"`
2. Read the JSON response
3. Execute the `action` field:
   - "run-script": run the `command` field
   - "spawn-agent": spawn the agent specified with the `prompt` field
   - "write-file": write the content specified
   - "ask-user": present the `question` to the user, wait for response
   - "verify": check that `expectedOutputs` exist and are non-empty
4. Report: `node "$SCRIPTS/eros-state.mjs" done --project "$PROJECT_DIR" --result '{...}'`
5. Repeat from step 1

## Rules
- Execute EXACTLY what Eros says. Nothing more, nothing less.
- If `action` is "ask-user", wait for user response and include it in the result.
- If an action fails, report the error. Eros decides the recovery, not you.
- You do NOT write to state/queue/memory/approvals/decisions files.
```

### Nuevo subcommand: `next`

Toda la lógica de orquestación que hoy vive en SKILL.md se mueve a `eros-state.mjs next`:

```
next --project $DIR
  1. Lee state.json → sabe dónde está
  2. Lee queue.json → sabe qué sigue
  3. Determina la acción exacta para el task actual:
     - setup/identity → action: "ask-user", question: "Describe the project..."
     - setup/create-dir → action: "run-script", command: "node init-project.mjs ..."
     - design/brief → action: "run-script", command: "node eros-context.mjs design-brief ..."
     - design/tokens → action: "spawn-agent", agent: "designer", prompt: "..."
     - build/S-Hero → action: "spawn-agent", agent: "builder", prompt: "Read context/S-Hero.md..."
     - review/creative → (mode dependent) action: "ask-user" OR "run-script"
     - integrate/router → action: "write-code", instruction: "Write src/router/index.js with lazy routes..."
  4. Incluye expectedOutputs para verificación
  5. Incluye plan (contexto de dónde está en el flujo global)
  6. Retorna JSON
```

### Nuevo subcommand: `done`

Reemplaza el ciclo manual de gate → log → advance → learn:

```
done --project $DIR --result '{"success": true, "outputs": ["S-Hero.vue"]}'
  1. Verifica que expectedOutputs existen (deterministic file check)
  2. Si es build task: corre eros-gate.mjs post automáticamente
  3. Si gate APPROVE: corre eros-log.mjs approve + eros-memory.mjs learn
  4. Si gate RETRY: incrementa attempt, devuelve la misma instrucción con retry context
  5. Si gate FLAG: loguea, avanza a siguiente task
  6. Avanza el state machine (eros-state advance)
  7. Retorna el resultado + el SIGUIENTE next (para que Claude no tenga que hacer 2 calls)
```

### Flujo completo V8

```
Claude: node eros-state.mjs next --project /Desktop/mi-proyecto
Eros:   { action: "run-script", command: "node eros-context.mjs section --project ... --section S-Hero" }

Claude: (ejecuta el comando)
Claude: node eros-state.mjs done --project /Desktop/mi-proyecto --result '{"success": true}'

Eros:   (internamente: verifica outputs, corre gate, loguea, avanza)
Eros:   {
          result: { verdict: "APPROVE", score: 8.2 },
          next: { action: "spawn-agent", agent: "builder", prompt: "Read context/S-Features.md..." }
        }

Claude: (spawns builder con el prompt exacto que Eros le dio)
Claude: node eros-state.mjs done --result '{"success": true}'
...
```

Claude nunca:
- Decide qué script correr
- Arma prompts para agentes
- Interpreta gate verdicts
- Decide retry vs flag
- Escribe memory hooks

Todo eso lo hace `done` internamente.

## Plan de implementación

### Fase 1: `next` engine (el cerebro)

**Archivo:** `scripts/eros-orchestrator.mjs` (nuevo, ~400 líneas)

Contiene la lógica de orquestación que hoy vive en SKILL.md:
- Task ID → action mapping (qué hacer para cada tipo de tarea)
- Agent prompt templates (qué decirle a cada agente)
- Expected outputs por tarea
- Mode-dependent behavior (autonomous vs interactive)
- Error recovery recipes
- Memory hook triggers (qué learn events disparar después de cada task)

Subcommands:
- `next --project $DIR` → retorna la instrucción exacta
- `done --project $DIR --result '{...}'` → verifica, evalúa, avanza, retorna siguiente
- `plan --project $DIR` → retorna el plan completo (todas las tareas pendientes con sus acciones)

### Fase 2: Verificación determinista

Agregar a `done`:
- File existence check (expectedOutputs)
- Vite compilation check (para build tasks: `npx vite build --mode development 2>&1`)
- Report structure validation (para build tasks: tiene Score? tiene Excellence?)
- Non-empty check (archivo > 100 bytes)

### Fase 3: SKILL.md minimal

Reemplazar las 500 líneas con 20. Claude solo sabe:
1. Correr `next`
2. Ejecutar lo que dice
3. Correr `done`
4. Repetir

### Fase 4: Dev server management

Agregar al orchestrator:
- `action: "start-server"` → levanta vite dev server en un puerto libre
- `action: "stop-server"` → mata el server
- Tracking del PID y puerto activo en state.json

### Fase 5: Recovery engine

Agregar al orchestrator:
- Cuando `done` recibe un error, consulta un mapa de recovery recipes
- Retorna la acción de recovery como el `next` step
- Si la recovery también falla, escala a FLAG automáticamente

## Qué NO cambia

- `eros-memory.mjs` — sigue igual (el orchestrator lo llama internamente)
- `eros-gate.mjs` — sigue igual (el orchestrator lo llama internamente)
- `eros-context.mjs` — sigue igual (el orchestrator lo llama internamente)
- `eros-log.mjs` — sigue igual (el orchestrator lo llama internamente)
- Panel (Eros dashboard) — sigue igual (lee runs.generated.json)
- Agents (builder, designer, etc.) — siguen igual (leen context files)
- Memory files — siguen igual (JSON + MD)
- Hooks en settings.json — siguen igual (enforcement)

## Qué SÍ cambia

| Antes (V7) | Después (V8) |
|-------------|--------------|
| SKILL.md tiene 500 líneas de lógica | SKILL.md tiene 20 líneas de loop |
| Claude decide qué script correr | Eros decide, Claude ejecuta |
| Claude arma prompts para agentes | Eros pre-computa los prompts |
| Claude interpreta gate verdicts | `done` interpreta automáticamente |
| Claude se olvida de memory hooks | `done` los dispara automáticamente |
| Claude improvisa en errores | Orchestrator tiene recovery recipes |
| Claude necesita recordar 6 scripts | Claude solo conoce `next` y `done` |

## Riesgos

1. **Over-engineering**: si el orchestrator se vuelve muy complejo, es más difícil de debuggear que el SKILL.md actual
2. **Flexibilidad perdida**: el SKILL.md actual permite que Claude se adapte a situaciones inesperadas. Un orchestrator rígido podría no manejar edge cases.
3. **Prompt templates**: pre-computar los prompts de agentes puede ser limitante si el proyecto requiere instrucciones específicas que el orchestrator no prevé.

### Mitigación

- El orchestrator tiene un fallback `action: "freestyle"` que le da a Claude instrucciones generales + le deja decidir (para edge cases)
- Los prompt templates usan variables interpoladas del context file (no son strings fijos)
- El orchestrator loguea cada decisión para debugging

---

## Fase 6-9: Eros Autónomo — "El Alma"

### El concepto

Eros no solo ejecuta instrucciones — **sabe lo que no sabe, practica solo, y evoluciona su criterio estético.**

Basado en research de:
- **Generator-Verifier-Updater (GVU)**: generar → verificar determinísticamente → actualizar
- **Self-play SWE-RL**: agentes que practican en tareas de complejidad creciente
- **Reflexion**: fallar → criticar el intento → reintentar condicionado al feedback
- **Anti-convergencia**: loops creativos autónomos convergen a lo genérico sin diversidad forzada

### Fase 6: Metacognición — "Saber lo que no sabe"

**Archivo:** `scripts/eros-meta.mjs`

Subcommands:
- `gaps` — analiza la memoria y reporta debilidades:
  ```json
  {
    "weakSectionTypes": ["pricing", "testimonial"],
    "untouchedTechniques": ["Spline 3D", "pin + morph"],
    "lowConfidenceRules": ["Curtain reveals max 600ms (1/3)"],
    "moodBlindSpots": ["minimal", "playful", "editorial light"],
    "aestheticBias": "90% dark themes, 0% light-only",
    "suggestion": "Practice a light minimal pricing page to fill 3 gaps at once"
  }
  ```
- `reflect --project $DIR` — analiza un proyecto completado:
  ```json
  {
    "whatWorked": ["SplitText on hero scored 8.5", "Asymmetric grid"],
    "whatFailed": ["CTA button too small, contrast issue"],
    "whatWasNew": ["First time using glass morphism"],
    "confidenceGains": { "hero": "MEDIUM → HIGH", "glass": "LOW → MEDIUM" },
    "nextExperiment": "Try glass morphism on a feature section, not just hero"
  }
  ```
- `personality` — genera un perfil estético basado en toda la memoria:
  ```json
  {
    "strengths": ["Dark cinematic", "Typography hierarchy", "Parallax depth"],
    "weaknesses": ["Light themes", "Pricing layouts", "Playful motion"],
    "signature": "Asymmetric layouts with phantom back-type and SplitText reveals",
    "avoids": ["Purple gradients", "Stock photos", "Uniform padding", "Inter/Roboto"],
    "preferredStack": "GSAP + ScrollTrigger + Lenis + clip-path",
    "evolution": [
      { "project": "Forge Studio", "learned": "Simple > layered technique" },
      { "project": "Coque", "learned": "Phantom back-type as depth without imagery" },
      { "project": "Axon", "learned": "7 pages, 38 sections, consistent quality" }
    ]
  }
  ```

### Fase 7: Auto-Training — "Practicar solo"

**Archivo:** `scripts/eros-practice.mjs`

Eros genera proyectos de práctica apuntando a sus debilidades:

```bash
node eros-practice.mjs generate
# Lee eros-meta.mjs gaps → identifica debilidades
# Genera un brief de práctica:
{
  "brief": {
    "name": "Practice-017",
    "type": "saas-product",
    "mood": "minimal light",          ← apunta a blind spot
    "sections": ["hero", "pricing", "testimonials"],  ← apunta a sección débil
    "technique_challenge": "Spline 3D",  ← técnica no usada
    "objective": "Fill gaps: light theme + pricing + 3D"
  }
}

node eros-practice.mjs run --brief practice-017.json
# 1. Crea el proyecto con init-project.mjs
# 2. Corre el pipeline completo (next → done loop)
# 3. Observer evalúa
# 4. Reflexión: eros-meta.mjs reflect
# 5. Aprende: eros-train.mjs correct
# 6. Borra el proyecto (solo queda el aprendizaje en memoria)

node eros-practice.mjs history
# Lista todos los entrenamientos autónomos con resultados
```

**Anti-convergencia**: cada brief de práctica FUERZA una restricción nueva:
- Un mood que nunca usó
- Una técnica que tiene < 2 usos
- Un tipo de sección con < 3 data points
- Un color scheme opuesto al último (si fue dark → forzar light)

### Fase 8: Evolución Estética — "Desarrollar gusto"

La memoria actual tiene reglas binarias ("nunca usar Inter"). La evolución estética agrega **preferencias con peso**:

**Archivo:** `.claude/memory/design-intelligence/aesthetic-profile.json`

```json
{
  "compositionPreferences": {
    "asymmetric": { "weight": 0.9, "evidence": 12, "avgScore": 8.4 },
    "centered": { "weight": 0.3, "evidence": 3, "avgScore": 7.1 },
    "bento": { "weight": 0.7, "evidence": 5, "avgScore": 8.0 }
  },
  "motionPreferences": {
    "SplitText + parallax": { "weight": 0.95, "evidence": 8, "avgScore": 8.3 },
    "stagger cascade": { "weight": 0.8, "evidence": 6, "avgScore": 7.8 },
    "pin + morph": { "weight": 0.4, "evidence": 1, "avgScore": 7.2 }
  },
  "colorTemperature": {
    "warm": { "weight": 0.85, "usage": 4 },
    "cool": { "weight": 0.5, "usage": 2 },
    "neutral": { "weight": 0.3, "usage": 1 }
  },
  "densityPreference": "medium-high",
  "depthPreference": "3+ layers always",
  "experimentBudget": 0.2
}
```

`experimentBudget: 0.2` = en el 20% de las decisiones, Eros elige deliberadamente algo que NO es su preferencia alta, para explorar. Esto previene la convergencia.

El `interpret` de `eros-memory.mjs` lee este perfil y lo inyecta como "## Aesthetic Direction" en el context file, en vez de solo listar data points.

### Fase 9: El Loop Completo — "El Alma"

```
                    ┌─────────────┐
                    │   MATEO     │
                    │  (entrena,  │
                    │   corrige)  │
                    └──────┬──────┘
                           │ feedback real (review)
                           ▼
┌──────────────────────────────────────────────────┐
│                    EROS                           │
│                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │ METACOG  │───▶│ PRACTICE │───▶│ REFLECT  │   │
│  │ (gaps)   │    │ (build)  │    │ (learn)  │   │
│  └──────────┘    └──────────┘    └──────────┘   │
│       ▲                               │         │
│       │         ┌──────────┐          │         │
│       └─────────│ AESTHETIC│◀─────────┘         │
│                 │ (evolve) │                    │
│                 └──────────┘                    │
│                                                  │
│  Inputs:  memoria + observer + tu feedback       │
│  Output:  proyectos cada vez mejores             │
│  Ciclo:   detectar gap → practicar → evaluar     │
│           → aprender → evolucionar → repetir     │
└──────────────────────────────────────────────────┘
```

Mateo interviene cuando quiere:
- "Entrenar con Axon" → review
- "Estudiar fluid.glass" → study
- "No me gusta eso" → correction → regla candidata
- O no interviene → Eros practica solo y mejora

### Protección contra convergencia

La investigación muestra que los loops autónomos convergen a "música de ascensor visual". Mitigación:

1. **Experiment budget** (20%): 1 de cada 5 decisiones es deliberadamente exploratoria
2. **Mood rotation**: nunca repetir el mismo mood en 2 prácticas consecutivas
3. **Technique forcing**: cada práctica usa al menos 1 técnica con < 3 usos
4. **Reference injection**: antes de cada práctica, Eros estudia una referencia nueva (study)
5. **Mateo veto**: si ves que la práctica generó algo genérico, lo marcás y Eros aprende a evitarlo

---

## Estimación

### Bloque A: Orquestador (Eros controla a Claude)

| Fase | Qué | Esfuerzo | Dependencia |
|------|-----|----------|-------------|
| 1 | `next` engine — lógica de SKILL.md en código | 3-4 horas | Ninguna |
| 2 | Verificación determinista (file + compile checks) | 1 hora | Fase 1 |
| 3 | SKILL.md minimal (500 → 20 líneas) | 30 min | Fase 1 |
| 4 | Dev server management | 1 hora | Fase 1 |
| 5 | Recovery engine | 1 hora | Fase 1 + 2 |

### Bloque B: Alma (Eros aprende solo)

| Fase | Qué | Esfuerzo | Dependencia |
|------|-----|----------|-------------|
| 6 | Metacognición (gaps, reflect, personality) | 2 horas | Bloque A |
| 7 | Auto-training (generate, run, history) | 3 horas | Fase 6 |
| 8 | Evolución estética (aesthetic-profile.json) | 1 hora | Fase 6 |
| 9 | Loop completo + anti-convergencia | 1 hora | Todo |

### Bloque C: Testing

| Fase | Qué | Esfuerzo |
|------|-----|----------|
| 10 | E2E test actualizado + test de práctica autónoma | 2 horas |

**Total Bloque A: ~7 horas**
**Total Bloque B: ~7 horas**
**Total Bloque C: ~2 horas**
**Total: ~16 horas**

Recomendación: Bloque A primero (Eros controla a Claude), probarlo con un proyecto real, después Bloque B (el alma).

## Fuentes de la investigación

- [State Diagrams and Orchestrators for Complex LLM Agent Pipelines](https://brics-econ.org/state-diagrams-and-orchestrators-for-complex-llm-agent-pipelines)
- [AI Agents vs AI Workflows: Why Pipelines Dominate in 2025](https://intuitionlabs.ai/articles/ai-agent-vs-ai-workflow)
- [The Verifiable Orchestrator: A New Agentic Pattern](https://appliedingenuity.substack.com/p/the-verifiable-orchestrator-a-new)
- [Deterministic AI Orchestration: Platform Architecture](https://www.praetorian.com/blog/deterministic-ai-orchestration-a-platform-architecture-for-autonomous-development/)
- [Agents At Work: The 2026 Playbook for Reliable Agentic Workflows](https://promptengineering.org/agents-at-work-the-2026-playbook-for-building-reliable-agentic-workflows/)
- [The 2026 Guide to Agentic Workflow Architectures](https://www.stackai.com/blog/the-2026-guide-to-agentic-workflow-architectures)
- [AI Agents in Production: What Actually Works in 2026](https://47billion.com/blog/ai-agents-in-production-frameworks-protocols-and-what-actually-works-in-2026/)
- [Deterministic AI vs Autonomous Agents: Choosing the Right Level](https://paulserban.eu/blog/post/deterministic-ai-vs-autonomous-agents-choosing-the-right-level-of-intelligence/)
- [Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams)
- [Claude AI Agents Architecture & Deployment Guide 2026](https://dextralabs.com/blog/claude-ai-agents-architecture-deployment-guide/)
