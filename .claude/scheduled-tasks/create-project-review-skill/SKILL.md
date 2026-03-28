---
name: create-project-review-skill
description: Crear el skill project-review para auditar proyectos existentes y detectar deuda técnica
---

Tarea: Crear un nuevo skill "project-review" en C:\Users\mateo\Desktop\maqueta\.claude\skills\project-review\SKILL.md

Este skill debe ser capaz de auditar un proyecto existente (ya construido) y producir un reporte completo de estado, deuda técnica, y mejoras posibles.

DISEÑO DEL SKILL:

Triggers: "review project", "audit project", "revisar proyecto", "auditar proyecto", "estado del proyecto", "project health", "health check"

Flujo:
1. Detectar el stack del proyecto (Vue/React/Svelte, estado, CSS, etc.)
2. Escanear la estructura de archivos
3. Verificar contra los estándares de la maqueta:

CHECKLIST AUTOMÁTICO:
- [ ] ¿Tiene docs/? (design-brief, content-brief, page-plans, motion-spec)
- [ ] ¿Tiene design tokens en CSS custom properties?
- [ ] ¿Los tokens se usan consistentemente? (no hardcoded colors/sizes)
- [ ] ¿La cadena View→Store→Service→API está completa? (si es Pegasuz)
- [ ] ¿Hay loading y error states en cada vista?
- [ ] ¿prefers-reduced-motion respetado en todas las animaciones?
- [ ] ¿HTML semántico con landmarks y headings correctos?
- [ ] ¿Meta tags en cada página? (title, description, OG)
- [ ] ¿Imágenes con alt, width, height, lazy loading?
- [ ] ¿Router con lazy loading y history mode?
- [ ] ¿GSAP con context cleanup en onBeforeUnmount?
- [ ] ¿Mínimo de secciones cumplido por página?
- [ ] ¿Variación de animación entre secciones?
- [ ] ¿Al menos un elemento 3D (Tier 1)?
- [ ] ¿Responsive mobile-first?
- [ ] ¿Skip link y a11y básico?

OUTPUT FORMAT:
```
# Project Review: [nombre]

## Health Score: X/100

## ✅ Cumplido (N items)
## 🔴 Crítico (N items) — resolver antes de entregar
## 🟡 Mejoras (N items) — recomendadas
## 💡 Oportunidades (N items) — nice to have

## Deuda técnica estimada
## Plan de acción sugerido (ordenado por impacto)
```

Después de crear el SKILL.md:
1. Registrar el skill en CLAUDE.md en la tabla de dispatch (sección Auditoría)
2. Actualizar docs/current-state.md marcando esta mejora como completada

Documentar en PROCESS-LOG.md