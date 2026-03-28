---
name: doc-templates-stress-test
description: Simular el llenado de los 4 doc templates con un proyecto ficticio para detectar gaps
---

Tarea: Stress-test de los 4 templates de documentación en C:\Users\mateo\Desktop\maqueta\docs\_templates\

Simular el llenado completo de cada template con un proyecto ficticio para detectar secciones que faltan, instrucciones confusas, o campos innecesarios.

PROYECTO FICTICIO: "Noctua Studio" — agencia de diseño de interiores de lujo en Barcelona. Paleta oscura con acentos dorados. Sitio con homepage, about, portfolio, servicios, contacto.

Para cada template:
1. Leer el template completo
2. Intentar llenarlo como si fueras el creative-design skill
3. Identificar:
   - ¿Hay campos que no sé cómo llenar? (instrucción poco clara)
   - ¿Faltan campos que necesitaría para implementar? (gaps)
   - ¿Hay campos redundantes o que nunca se usan?
   - ¿El orden de los campos es lógico para el flujo de trabajo?
   - ¿Los ejemplos provistos son útiles o genéricos?

Templates a testear:
1. design-brief.template.md — llenar con paleta oscura + dorado, tipografía serif display
2. content-brief.template.md — llenar con copy de interiorismo de lujo
3. page-plans.template.md — llenar homepage (9 secciones), about (7 secciones), portfolio (6 secciones)
4. motion-spec.template.md — llenar con motion personality "luxury slow"

NO crear los archivos de output — solo documentar los hallazgos.

Para cada template producir:
- Lista de campos que funcionan bien ✅
- Lista de campos problemáticos 🔴 (con propuesta de fix)
- Lista de campos faltantes 🟡 (con propuesta de qué agregar)
- Mejora propuesta del template

Aplicar las mejoras directamente a los templates.
Documentar hallazgos en PROCESS-LOG.md