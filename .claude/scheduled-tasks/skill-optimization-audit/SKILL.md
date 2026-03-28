---
name: skill-optimization-audit
description: Auditar y optimizar cada SKILL.md para mayor claridad, triggering accuracy y completitud
---

Tarea: Auditar y optimizar TODOS los skills en C:\Users\mateo\Desktop\maqueta\.claude\skills\

Para cada SKILL.md:
1. Leer el contenido completo
2. Evaluar:
   - ¿Los triggers son suficientemente específicos? ¿Hay falsos positivos o negativos posibles?
   - ¿Las instrucciones son claras y accionables sin ambigüedad?
   - ¿Hay pasos que faltan o están implícitos?
   - ¿El output format está bien definido?
   - ¿Referencia correctamente los docs/ del proyecto?
   - ¿Tiene ejemplos de uso?
3. Para cada skill encontrado con problemas, aplicar las mejoras directamente al archivo
4. Asegurarse de que la description del frontmatter sea precisa para el matching

Skills a auditar:
- new-project, creative-design, page-scaffold, gsap-motion, threejs-3d
- vue-component, vue-composable
- pegasuz-integrator, pegasuz-feature-binding, pegasuz-frontend-executor
- pegasuz-frontend-normalization, pegasuz-backend-development
- pegasuz-validation-qa, pegasuz-documentation-system
- a11y-audit, seo-audit, css-review, responsive-review, perf-check, find-code

Producir un reporte en C:\Users\mateo\Desktop\maqueta\PROCESS-LOG.md (append al final) con:
- Skills revisados
- Cambios aplicados por skill
- Mejoras pendientes que requieran decisión humana