---
name: memory-system-improvement
description: Mejorar el sistema de memoria para que Claude tenga contexto preciso entre sesiones
---

Tarea: Mejorar el sistema de memoria en C:\Users\mateo\Desktop\maqueta\.claude\memory\

Archivos actuales:
- MEMORY.md — índice general
- current-state.md — estado de la maqueta
- template-purpose.md — propósito de la carpeta
- architecture-rules.md — reglas de arquitectura
- pipeline.md — pipeline de ejecución

EVALUAR:
1. ¿La memoria actual le da a Claude el contexto necesario para retomar trabajo entre sesiones?
2. ¿Hay información duplicada entre memory files y CLAUDE.md?
3. ¿Falta algo que Claude necesitaría saber al arrancar una nueva sesión?

MEJORAS A IMPLEMENTAR:

1. Crear C:\Users\mateo\Desktop\maqueta\.claude\memory\active-projects.md:
   - Template para trackear proyectos activos que se están construyendo desde esta maqueta
   - Formato: nombre, slug, rubro, estado (planning/building/qa/delivered), last touch date
   - Cuando un proyecto arranca, se registra acá

2. Crear C:\Users\mateo\Desktop\maqueta\.claude\memory\lessons-learned.md:
   - Registro de problemas encontrados y cómo se resolvieron
   - Para que Claude no repita los mismos errores
   - Formato: fecha, problema, solución, skill involucrado

3. Mejorar current-state.md:
   - Agregar versión de la maqueta (V2.0)
   - Agregar fecha de última actualización
   - Agregar conteo de skills/agents/docs

4. Revisar MEMORY.md global (C:\Users\mateo\.claude\CLAUDE.md) y el project memory (C:\Users\mateo\.claude\projects\C--Users-mateo-Desktop-maqueta\memory\MEMORY.md):
   - ¿El global sabe que existe la maqueta?
   - ¿El project memory tiene info útil?

Aplicar cambios directamente.
Documentar en PROCESS-LOG.md