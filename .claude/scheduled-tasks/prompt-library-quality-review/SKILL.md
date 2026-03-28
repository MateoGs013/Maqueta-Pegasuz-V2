---
name: prompt-library-quality-review
description: Revisar y mejorar la biblioteca de prompts para que cada prompt sea accionable y produzca output de calidad
---

Tarea: Auditar la calidad de TODOS los prompts en C:\Users\mateo\Desktop\maqueta\prompts\

Leer cada archivo en las 8 carpetas:
- 00-discovery/: client-intake.md, brand-questionnaire.md, competitive-analysis.md
- 01-identity/: design-direction.md, color-strategy.md, typography-selection.md, atmosphere-definition.md
- 02-content/: copy-framework.md, tone-of-voice.md, cta-strategy.md
- 03-architecture/: page-planning.md, section-narratives.md, navigation-flow.md
- 04-motion/: motion-personality.md, scroll-choreography.md, interaction-patterns.md
- 05-3d/: 3d-scope.md, shader-brief.md
- 06-implementation/: component-planning.md, state-management.md, api-integration.md
- 07-quality/: pre-launch-checklist.md, audit-sequence.md

Para cada prompt evaluar:
1. ¿Es accionable? ¿Produce un output concreto y útil?
2. ¿Las preguntas son específicas o genéricas/vagas?
3. ¿Tiene ejemplos de respuestas buenas vs malas?
4. ¿Conecta con el paso siguiente del pipeline? (ej: color-strategy → design-brief.md)
5. ¿Cubre rubros variados? (no solo agencias creativas o tech)
6. ¿Incluye anti-patterns o errores comunes a evitar?

Mejoras a aplicar directamente:
- Agregar ejemplos concretos donde falten
- Agregar secciones "Errores comunes" donde no existan
- Reforzar la conexión entre prompts (ej: "El output de este prompt alimenta X")
- Agregar variaciones por rubro donde sea relevante
- Mejorar preguntas vagas con opciones específicas

Documentar cambios en PROCESS-LOG.md