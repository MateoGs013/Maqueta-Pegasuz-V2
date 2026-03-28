---
name: agent-completeness-review
description: Revisar los 7 agentes para consistencia, completitud y agregar checklists accionables
---

Tarea: Auditar los 7 agentes en C:\Users\mateo\Desktop\maqueta\.claude\agents\ para consistencia y completitud.

Agentes a revisar:
1. design-critic.md
2. motion-director.md
3. ux-reviewer.md
4. binding-auditor.md
5. tenant-safety-guard.md
6. seo-content-architect.md
7. domain-expert.md

Para cada agente verificar:
1. ¿Tiene YAML frontmatter correcto? (name + description)
2. ¿La description es lo suficientemente específica para que Claude lo invoque correctamente?
3. ¿Tiene instrucciones claras de CUÁNDO usarlo?
4. ¿Tiene un output format definido? (ej: ✅/🔴/🟡 formato)
5. ¿Referencia los docs/ del proyecto como fuente de verdad?
6. ¿Tiene checklist concreto de qué verificar?
7. ¿Cubre edge cases? (ej: qué pasa si no hay design-brief aún)

Mejoras a aplicar:
- Unificar el output format entre todos los agentes (usar el mismo sistema de severidad)
- Agregar sección "Cuándo NO usar este agente" para evitar invocaciones innecesarias
- Agregar sección "Prerequisitos" (qué docs deben existir antes de invocar)
- Reforzar checklists con items específicos y accionables
- Verificar que design-critic lea docs/design-brief.md, motion-director lea docs/motion-spec.md, etc.

Proponer 2-3 agentes nuevos que podrían ser útiles:
- ¿Falta un agente de "brand consistency"?
- ¿Falta un agente de "content quality"?
- ¿Falta un agente de "performance budget"?

Documentar todo en PROCESS-LOG.md