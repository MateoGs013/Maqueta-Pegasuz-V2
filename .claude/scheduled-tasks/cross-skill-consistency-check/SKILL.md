---
name: cross-skill-consistency-check
description: Verificar que todas las skills referencien las mismas convenciones, tokens, y patrones sin contradicciones
---

Tarea: Verificar consistencia entre TODOS los skills y el CLAUDE.md en C:\Users\mateo\Desktop\maqueta\

Leer CLAUDE.md completo como fuente de verdad. Luego leer cada SKILL.md y verificar:

1. ARQUITECTURA — ¿Todos los skills respetan la cadena View → Store → Service → API?
   - ¿Algún skill sugiere atajos?
   - ¿Las response extractions documentadas coinciden con la tabla del CLAUDE.md?

2. CONVENCIONES DE NAMING — ¿Son consistentes?
   - Routes: kebab-case
   - DB: snake_case
   - Functions: camelCase
   - ¿Algún skill usa convenciones distintas?

3. TOKENS CSS — ¿Todos los skills usan los mismos nombres de tokens?
   - ¿creative-design produce tokens que page-scaffold y vue-component consumen?
   - ¿Los nombres (--color-accent-primary, --text-hero, etc.) son idénticos en todos los skills?
   - ¿tokens.css del scaffold tiene TODOS los tokens que los skills esperan?

4. MOTION DEFAULTS — ¿Son consistentes?
   - ¿gsap-motion usa los mismos defaults que CLAUDE.md? (power3.out, 0.7-0.9s, y:32px)
   - ¿threejs-3d respeta prefers-reduced-motion?
   - ¿page-scaffold referencia motion-spec.md?

5. PIPELINE ORDER — ¿Los skills documentan las dependencias correctas?
   - creative-design → page-scaffold → vue-component → gsap-motion → threejs-3d
   - ¿Algún skill dice "puedes ejecutarme sin brief"?

6. DOCS REFERENCES — ¿Todos leen de docs/?
   - ¿creative-design escribe en docs/design-brief.md?
   - ¿page-scaffold lee de docs/page-plans.md?
   - ¿gsap-motion lee de docs/motion-spec.md?
   - ¿vue-component lee de docs/design-brief.md?

CONTRADICCIONES ENCONTRADAS → corregir directamente en los skills.
Documentar todo en PROCESS-LOG.md con formato:
- CONTRADICCIÓN: [skill A dice X, skill B dice Y] → CORREGIDO: [se unificó a Z]