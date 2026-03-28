# Prompt: Motion Personality

> Fase: Motion | Output: docs/motion-spec.md completo
> Cada proyecto tiene coreografia de motion unica.

---

## Prompt

```
Define la coreografia de motion completa para {{PROJECT_NAME}} usando la template
en docs/_templates/motion-spec.template.md.

INPUT:
- Design brief: docs/design-brief.md (atmosfera, personalidad)
- Page plans: docs/page-plans.md (secciones y sus propositos)
- Brand personality: {{PERSONALITY}}

PERSONALIDADES DE MOTION A ELEGIR (no defaultear):

| Personalidad | Easing signature | Duration range | Character |
|-------------|-----------------|---------------|-----------|
| Cinematico | power4.out | 0.8-1.2s | Lento, preciso, revelador |
| Fluido | sine.inOut | 0.5-0.8s | Suave, continuo, natural |
| Staccato | steps(N) / power2.out | 0.3-0.5s | Rapido, definido, ritmico |
| Organico | elastic.out(1, 0.3) | 0.6-1.0s | Natural, imperfecto, vivo |
| Mecanico | power1.inOut | 0.4-0.6s | Preciso, industrial, funcional |
| Gravitacional | back.out(1.7) | 0.5-0.9s | Peso, inercia, rebote sutil |
| Experimental | custom bezier | variable | Unico, impredecible |

RESTRICCION: no elegir "Cinematico" por default. Cada proyecto tiene su propia personalidad.

PARA CADA SECCION del page-plan, asignar una tecnica DIFERENTE.
El catalogo de tecnicas esta en la template.

HERO TIMELINE: definir paso a paso con tiempos exactos (t=0.0s, t=0.3s, etc.)

HOVER INTERACTIONS: definir para cards, buttons, y links.

OUTPUT: docs/motion-spec.md completo con todas las secciones llenas.
```

---

## Siguiente paso

Ejecutar `05-3d/3d-scope.md` para definir elementos WebGL.
