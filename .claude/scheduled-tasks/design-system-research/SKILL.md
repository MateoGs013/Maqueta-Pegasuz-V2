---
name: design-system-research
description: Investigar design systems modernos y proponer un micro design system base para la maqueta
---

Tarea: Investigar design systems de referencia y proponer un micro design system reutilizable para la maqueta.

INVESTIGACIÓN WEB:
Buscar y analizar:
- Radix UI / Shadcn (patterns de componentes)
- Vercel Design System (tokens y escalas)
- Linear App (motion y interacción)
- Stripe (tipografía y spacing)
- Apple HIG 2025 (patterns de layout)
- Material Design 3 (color system, tokens)

PROPUESTA:
Crear C:\Users\mateo\Desktop\maqueta\docs\_templates\design-system-base.template.md con:

1. TOKEN SYSTEM mejorado:
   - Color scale con steps (50, 100, 200...900) por cada color base
   - Semantic tokens que mapean a scale tokens (--color-danger → --red-500)
   - Dark mode mapping automático
   - Propuesta de cómo generar la escala desde un color base

2. COMPONENT PATTERNS base:
   - Button (primary, secondary, ghost, destructive) con estados
   - Input (text, textarea, select) con validación
   - Card (con variantes: default, elevated, outlined)
   - Badge/Tag
   - Modal/Dialog
   - Toast/Notification
   - Para cada uno: props, variantes, estados, tokens que usa

3. LAYOUT PATTERNS:
   - Section wrapper estándar (con spacing responsivo)
   - Grid system flexible (no solo 12 columnas)
   - Container con variantes (narrow, default, wide, full)
   - Propuesta de spacing scale mejorada

4. ANIMATION TOKENS:
   - Easings nombrados (--ease-in-out-expo, --ease-out-back, etc.)
   - Duration scale (--duration-fast, --duration-normal, --duration-slow)
   - Stagger scale

NO implementar código — solo el template de documentación.
El objetivo es que creative-design pueda partir de esta base y personalizarla por proyecto.

Documentar en PROCESS-LOG.md