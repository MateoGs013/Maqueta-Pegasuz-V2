# Prompt: Design Direction

> Fase: Identity | Output: Direccion visual completa -> docs/design-brief.md
> Ejecutar con el perfil de marca de Discovery como input.
> Este prompt activa el skill `creative-design`.

---

## Prompt

```
Ejecuta /creative-design para el proyecto {{PROJECT_NAME}}.

Input del brand questionnaire:
- Personalidad: {{BRAND_PERSONALITY}}
- Rubro: {{INDUSTRY}}
- Publico: {{TARGET_AUDIENCE}}
- Nivel visual: {{VISUAL_LEVEL}}
- Anti-referencias: {{ANTI_REFERENCES}}
- URLs inspiracion: {{INSPIRATION_URLS}}

REQUERIMIENTOS:

1. PALETA unica — no puede repetir ninguna paleta usada en proyectos anteriores.
   Explorar territorios de color inesperados para el rubro.
   Justificar cada color con psicologia del color + aplicacion concreta.

2. TIPOGRAFIA unica — no puede repetir la misma combinacion.
   Explorar Google Fonts, Adobe Fonts, o foundries independientes.
   La eleccion debe reflejar la personalidad definida.

3. ATMOSFERA — definir que hace que este sitio se SIENTA diferente.
   No solo colores y tipografia. Texturas, efectos, profundidad, luz.
   Mapear cada tecnica atmosferica a una herramienta (CSS, Three.js, Canvas, SVG).

4. OUTPUT OBLIGATORIO:
   - Todos los tokens CSS listos para copiar-pegar
   - Fluid type scale con clamp()
   - Spacing scale completo
   - Shadows y radii
   - Responsive strategy por breakpoint
   - Technique-to-stack mapping

Guardar el resultado en docs/design-brief.md usando la template de docs/_templates/.
```

---

## Checklist de validacion

Despues de ejecutar, verificar:
- [ ] Paleta es unica (no repetida de otro proyecto)
- [ ] Tipografia es unica (no la misma combinacion)
- [ ] Contraste WCAG AA cumplido
- [ ] Tokens CSS son implementables (no abstractos)
- [ ] Atmosfera tiene mapeo tecnica->stack
- [ ] Responsive strategy cubre 4 breakpoints

## Siguiente paso

Ejecutar `02-content/copy-framework.md`.
