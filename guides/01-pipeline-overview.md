# Guide: Pipeline Overview

> El flujo completo de creacion de un proyecto, paso a paso.

---

## Pipeline visual

```
DISCOVERY          FOUNDATION         BUILD               QUALITY
─────────          ──────────         ─────                ───────
Client Intake      Content Brief      creative-design      validation-qa
Competitive        Design Brief       page-scaffold        a11y-audit
  Analysis         Page Plans         threejs-3d           seo-audit
Brand Profile      Motion Spec        vue-component        responsive-review
                                      gsap-motion          css-review
                                                           perf-check
```

## Fases detalladas

### Phase 0: Discovery
- **Duracion:** 1 sesion
- **Input:** brief del cliente o idea del proyecto
- **Prompts:** `00-discovery/*`
- **Output:** perfil completo de cliente + marca
- **Quien decide:** el usuario (Mateo) con input del cliente

### Phase 1: Foundation Docs
- **Duracion:** 1-2 sesiones
- **Input:** discovery output
- **Prompts:** `01-identity/*`, `02-content/*`, `03-architecture/*`, `04-motion/*`
- **Output:** 4 archivos en `docs/` completos
- **Regla:** content-first (copy antes de diseno)

### Phase 2: Design System
- **Skill:** `creative-design`
- **Input:** `docs/design-brief.md`
- **Output:** tokens CSS implementados en `src/styles/`
- **Regla:** todo sale del brief, nada se inventa

### Phase 3: Page Structure
- **Skill:** `page-scaffold`
- **Input:** `docs/page-plans.md` + tokens
- **Output:** paginas con HTML semantico, secciones, layout
- **Regla:** respetar minimos de secciones y propositos

### Phase 4: 3D Elements
- **Skill:** `threejs-3d`
- **Input:** `docs/design-brief.md` atmosfera + 3D scope
- **Output:** elementos WebGL implementados
- **Regla:** Tier 1 minimo, siempre

### Phase 5: Components
- **Skill:** `vue-component`
- **Input:** tokens + page structure + content
- **Output:** componentes reutilizables con datos reales
- **Regla:** datos del store, no hardcodeados

### Phase 6: Motion
- **Skill:** `gsap-motion`
- **Input:** `docs/motion-spec.md`
- **Output:** animaciones implementadas
- **Regla:** cada seccion tecnica diferente, reduced-motion respetado

### Phase 7: Quality Chain
- **Skills:** cadena de 6 auditorias
- **Input:** proyecto construido
- **Output:** reporte con issues categorizados
- **Regla:** 0 BLOCKING, 0 CRITICAL antes de entregar

---

## Reglas del pipeline

1. **Orden estricto:** no saltar fases
2. **Design-first:** sin brief no hay codigo
3. **Content-first:** copy antes de visual
4. **Identidad unica:** cada proyecto tiene paleta/tipo/motion propios
5. **3D siempre:** Tier 1 como minimo
6. **Quality gate:** 0 CRITICAL para entregar
