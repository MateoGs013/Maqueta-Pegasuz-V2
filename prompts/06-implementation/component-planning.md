# Prompt: Component Planning

> Fase: Implementation | Output: Mapa de componentes a construir
> Planificar ANTES de codear. Saber que componentes necesitamos.

---

## Prompt

```
Basandote en los page-plans (docs/page-plans.md), identifica y planifica
todos los componentes necesarios para {{PROJECT_NAME}}.

CLASIFICACION:

1. LAYOUT COMPONENTS (estructura)
   | Componente | Props | Usado en |
   |-----------|-------|---------|
   | AppHeader | transparent, solid | Global |
   | AppFooter | — | Global |
   | SectionContainer | id, bg, padding | Todas las secciones |
   | PageHero | title, subtitle, cta, bg | Todas las paginas |
   | ... | ... | ... |

2. UI COMPONENTS (interactivos, reutilizables)
   | Componente | Props | Variantes |
   |-----------|-------|-----------|
   | BaseButton | label, href, variant, icon | primary, secondary, ghost |
   | BaseCard | — (slot-based) | — |
   | BaseInput | type, label, error | text, email, textarea, select |
   | ... | ... | ... |

3. CONTENT COMPONENTS (especificos del proyecto)
   | Componente | Props | Datos de |
   |-----------|-------|---------|
   | ServiceCard | service | serviceStore |
   | TestimonialSlider | testimonials | testimonialStore |
   | StatsCounter | stats | contentStore |
   | ... | ... | ... |

4. SECTION COMPONENTS (secciones de pagina)
   | Componente | Seccion del page-plan | Proposito |
   |-----------|---------------------|-----------|
   | HeroSection | Homepage sec 1 | Impact |
   | AboutManifesto | About sec 1 | Manifesto |
   | ... | ... | ... |

5. 3D COMPONENTS
   | Componente | Tier | Usado en |
   |-----------|------|---------|
   | {{3D_COMP}} | {{TIER}} | {{WHERE}} |

PARA CADA COMPONENTE definir:
- Nombre (PascalCase)
- Props con tipos
- Slots (si usa slots)
- Store dependency (que store consume)
- Motion (que animacion tiene de motion-spec)
- Responsive notes

REGLAS:
- Componentes UI son genericos (no hardcodean datos)
- Componentes Content reciben datos via props (del store)
- Componentes Section son composiciones de UI + Content
- No crear componentes para cosas que se usan una sola vez
```

---

## Output esperado

Mapa completo de componentes que guia la implementacion con `vue-component`.
