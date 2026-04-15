# Plan: Auto-Training V2 — Entrenamiento Real

> **Status:** `implemented`
> **Last reviewed:** 2026-04-14

## Problema actual

El auto-training hace proyectos descafeinados:
- Sin referencias (construye de la nada)
- Sin observer (no mide calidad real)
- Sin dev server (no puede hacer screenshots)
- Sin gates (no evalúa approve/retry/flag)
- Sin tests de calidad (no corre la cadena a11y/seo/perf)
- Reglas se inyectan en el prompt pero no se verifican con el observer

Es como entrenar boxeo sin sparring. Eros practica pero no se exige.

## Objetivo

El auto-training debe seguir EXACTAMENTE el mismo workflow que un proyecto manual:

```
1. Descubrir referencia en Awwwards
2. Estudiar la referencia (observer V2 → learn)
3. Generar brief BASADO en la referencia (no genérico)
4. Construir con el pipeline completo (next/done loop)
5. Levantar dev server
6. Correr observer V2 → scores reales de las 6 capas
7. Correr refresh-quality → scorecard
8. Evaluar con gates → approve/retry/flag
9. Si retry → re-construir las secciones débiles
10. Validar reglas contra el código Y contra el observer
11. Correr cadena de calidad (a11y, seo, responsive, css, perf)
12. Aprender → memory + personality
13. Limpiar
```

Si Eros no puede aprobar su propio gate, tiene que reintentar — igual que cuando vos le pedís un proyecto.

## Cambios necesarios

### 1. Brief basado en referencia (no genérico)

Ahora: genera "Practice 23, mood: brutalist, sections: hero, cta, faq"
Debería: estudia artefakt.mov → extrae mood, técnicas, layout → genera brief que IMITA esa referencia

```javascript
// Flujo:
const ref = await discoverAndStudyReference()  // Awwwards → observer → learn
const brief = generateBriefFromReference(ref)   // brief basado en lo que vio
// brief.mood = ref.analysis.colorHarmony.temperature
// brief.techniques = ref.analysis.techniques
// brief.reference = ref.url
```

### 2. Dev server management

Después de construir, necesita levantar vite:
```javascript
// Levantar
const port = await findFreePort(5200, 5300)
const server = spawn('npx', ['vite', '--port', port], { cwd: projectDir })
await waitForServer(port, 15000)

// Correr observer
await callScript('eros-observer.mjs', ['--local', '--port', String(port), observerDir])

// Matar
server.kill()
```

### 3. Gates reales

Después del observer, evaluar:
```javascript
const gate = await callScript('eros-gate.mjs', ['post', '--project', projectDir, '--task', 'build/S-Hero'])
if (gate.verdict === 'RETRY') {
  // Re-construir la sección con el feedback del gate
  // Esto requiere otra sesión del SDK o un prompt de fix
}
if (gate.verdict === 'FLAG') {
  // Anotar en pipeline-lessons
}
```

### 4. Cadena de calidad

Correr los skills de auditoría:
```javascript
// No son scripts — son skills de Claude Code
// Necesitaría una sesión del SDK para cada uno
// O crear scripts equivalentes que hagan los checks
```

Alternativa más práctica: crear `eros-audit.mjs` que haga los checks básicos:
- a11y: heading hierarchy (del observer semantic layer)
- seo: meta tags (del observer quality gates)
- responsive: verificar que el CSS tiene media queries
- css: verificar tokens vs magic numbers
- perf: verificar lazy loading en imágenes

### 5. Validación de reglas con observer

Ahora: escanea el código buscando strings
Debería: usar los scores del observer

```javascript
// Si la regla dice "no gradient placeholders"
// El observer detecta si hay imágenes reales vs divs con gradient
// Si composition > 7 y depth > 7 → la regla se aplicó bien

// Si la regla dice "cada sección necesita hover diferenciado"  
// El observer cuenta hover states en la capa de interacciones
// Si craft > 7 → la regla se aplicó bien
```

### 6. Retry automático

Si una sección no pasa el gate:
```javascript
const retryPrompt = `La sección ${section} falló el gate: ${gate.reasons.join(', ')}.
Fix: ${gate.retryInstructions}. 
Re-construir SOLO esta sección sin cambiar el resto.`

// Nueva sesión del SDK solo para el fix
for await (const msg of query({ prompt: retryPrompt, ... })) { ... }
```

## Estimación

| Componente | Esfuerzo |
|-----------|----------|
| Brief basado en referencia | 1h |
| Dev server management | 1h |
| Gates reales + retry | 2h |
| eros-audit.mjs (cadena de calidad) | 2h |
| Validación de reglas con observer | 1h |
| Testing + debugging | 2h |
| **Total** | **~9h** |

## Prioridad

Alta. Sin esto el auto-training genera data de baja calidad que infla la memoria sin enseñar nada real. Es mejor 1 proyecto bien evaluado que 10 sin gates.
