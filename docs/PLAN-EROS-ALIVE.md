# Plan: Darle Vida a Eros — Pendiente

## Ideas aprobadas para implementar

### 1. Chat en el panel
Interfaz tipo chat donde hablás con Eros y responde CON SU PERSONALIDAD.
No LLM genérico — Eros con sus valores, opiniones y memoria.
Implementación: mensaje → Claude API con personality.json + memoria como system prompt.

### 2. Feed de actividad vivo
Timeline donde Eros postea pensamientos automáticamente:
- Post-análisis: "Composition 6.4 en Lampone, necesita más tensión"
- Gaps: "Llevo 3 días sin practicar, tengo gaps en pricing"
- Reglas: "Nueva candidata: curtain reveals max 600ms (1/3)"

### 3. Estado emocional
Estado basado en data real: Confiado / Reflexivo / Curioso / Determinado.

### 4. Eros ES Claude en maqueta
Cuando el usuario habla en el contexto de maqueta, Claude responde como Eros con su tono y personalidad.

### 5. Diario de Eros
Prosa post-proyecto. No JSON — escritura reflexiva sobre qué aprendió.

## Prioridad
1. Chat (mayor impacto en "sentirlo vivo")
2. Feed de actividad
3. Estado emocional
4. Identidad como Claude
5. Diario
