---
name: pegasuz-skills-deep-review
description: Auditar los 7 skills Pegasuz para asegurar que el pipeline multi-tenant funcione end-to-end sin gaps
---

Tarea: Auditar en profundidad los 7 skills Pegasuz en C:\Users\mateo\Desktop\maqueta\.claude\skills\

Skills a revisar:
1. pegasuz-integrator — orquestador multi-fase
2. pegasuz-backend-development — schema, endpoints, controllers
3. pegasuz-feature-binding — conectar API a frontend
4. pegasuz-frontend-normalization — normalizar antes de binding
5. pegasuz-frontend-executor — orquestar frontend end-to-end
6. pegasuz-validation-qa — validación 5 layers
7. pegasuz-documentation-system — documentar cambios

VERIFICAR:

1. PIPELINE END-TO-END:
   - ¿El integrator referencia correctamente las 7+ fases del onboarding?
   - ¿Cada fase tiene un output claro que la siguiente fase consume?
   - ¿Hay gaps? (ej: después de backend-development, ¿quién crea los services frontend?)

2. RESPONSE EXTRACTION:
   - ¿feature-binding documenta TODAS las extractions de la tabla del CLAUDE.md?
   - Properties, Services, Categories, Tags = Direct array
   - Posts, Projects, Testimonials, Contacts = { entity, pagination }
   - SiteContent = { tenant, version, contents }
   - ¿Hay entities nuevas que falten? (Menu, Media, Settings, Translations, Analytics)

3. TENANT ISOLATION:
   - ¿Todos los skills mencionan x-client header?
   - ¿Backend-development enforce prismaManager.getPrisma()?
   - ¿Hay algún skill que pueda producir código que rompa tenant isolation?

4. NORMALIZATION:
   - ¿frontend-normalization detecta TODOS los anti-patterns del CLAUDE.md?
   - ¿Produce acciones de refactoring concretas?

5. VALIDATION QA:
   - ¿Las 5 layers están bien definidas?
   - ¿La Zero Omission Rule está correctamente documentada?
   - ¿Tiene criterios claros de PASS/FAIL?

MEJORAS:
- Completar cualquier gap encontrado
- Agregar response extractions faltantes
- Reforzar tenant isolation checks
- Asegurar que el pipeline pueda ejecutarse sin intervención humana intermedia

Documentar en PROCESS-LOG.md