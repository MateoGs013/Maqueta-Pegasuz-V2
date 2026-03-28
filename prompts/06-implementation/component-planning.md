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

## Ejemplo: buena vs mala planificacion

### Para un servicio de catering

**Mala:**
```
Componentes: Header, Footer, Hero, MenuCard, Form
```
(Sin props, sin clasificacion, sin store dependencies, sin motion refs.)

**Buena:**
```
LAYOUT COMPONENTS:
| Componente | Props | Slots | Usado en |
|-----------|-------|-------|---------|
| AppHeader | :transparent="true" | — | Global, transparent en Home hero |
| AppFooter | — | — | Global |
| SectionContainer | :id :bg :padding="lg" | default | Todas las secciones |
| PageHero | :title :subtitle :image :cta :video | overlay | Home, About |

UI COMPONENTS:
| Componente | Props | Variantes | Store dependency |
|-----------|-------|-----------|-----------------|
| BaseButton | :label :href :variant :icon :loading | primary, secondary, ghost | — |
| BaseCard | — | — (slot-based) | — |
| BaseImage | :src :alt :width :height :lazy | — | Uses resolveImageUrl() |

CONTENT COMPONENTS:
| Componente | Props | Motion (motion-spec ref) | Store |
|-----------|-------|--------------------------|-------|
| MenuCard | :menu (object) | Card hover: image zoom + price float | menuStore |
| TestimonialSlider | :testimonials (array) | Crossfade 0.6s, auto 5s | testimonialStore |
| EventCard | :event (object) | Stagger reveal, y:40 | eventStore |
| ChefProfile | :chef (object) | Parallax image + text fade | contentStore |

SECTION COMPONENTS:
| Componente | Page plan ref | Proposito | Special |
|-----------|-------------|-----------|---------|
| HeroSection | Home sec 1 | Impact | Video bg autoplay |
| MenuShowcase | Home sec 4 | Context | Filtrable por tipo (entrada, plato, postre) |
| EventsCTA | Home sec 8 | Close | Form inline |
```

---

## Component patterns por industria

| Industria | Componentes unicos frecuentes |
|-----------|------------------------------|
| Gastronomia | MenuCard, ReservationForm, ChefProfile, GalleryMasonry, EventCard |
| Inmobiliaria | PropertyCard (con mapa), PriceRange filter, VirtualTour embed, MortgageCalculator |
| Fintech | PricingTable, FeatureComparison, MetricCard, TrustBadges, InteractiveChart |
| E-commerce | ProductCard (size/color variants), CartDrawer, SizeSelector, WishlistButton, ReviewStars |
| SaaS | PricingToggle (monthly/annual), FeatureGrid, IntegrationLogos, DemoEmbed, StatusBadge |
| Portfolio | ProjectCard (hover reveal), CaseStudyHero, BeforeAfter slider, SkillBar, ClientLogos |

---

## Common errors

- **Componentes que se usan una sola vez.** Si "HeroStatsCounter" solo se usa en el hero de Home, probablemente deberia ser parte de HeroSection, no un componente separado.
- **Props demasiado granulares.** Un ServiceCard con 15 props individuales (title, desc, icon, color, cta, ctaHref...) deberia recibir un objeto :service="service".
- **No definir slots.** Componentes sin slots no son componibles. BaseCard deberia tener slots, no props para cada pieza de contenido.
- **Store dependencies no documentadas.** Si el componente necesita datos del serviceStore pero eso no esta documentado, el implementador va a hardcodear datos.
- **Componentes UI con logica de negocio.** BaseButton no deberia saber de navegacion ni de analytics. Componentes UI son genericos, la logica vive en los parent views.
- **No referenciar el motion-spec.** Cada componente interactivo tiene un hover/enter behavior definido en el motion-spec. Si no se referencia, el implementador improvisa.
- **Olvidar componentes de estado.** LoadingSpinner, ErrorState, EmptyState son componentes que se necesitan en CADA view con data fetching. Planificarlos.
- **No incluir componentes 3D.** El canvas Three.js es un componente Vue. Planificarlo con su tier, props, y cleanup.

---

## Pipeline connection

```
Input: page-plans.md (secciones -> que componentes)
     + motion-spec.md (motion por componente)
     + 3d-scope.md (componentes 3D)
     + navigation-flow.md (nav components)
     + design-brief.md (responsive behavior)
Output de este prompt -> Mapa de componentes
  Alimenta directamente:
    - vue-component skill (crear cada componente)
    - state-management.md (store dependencies)
    - gsap-motion skill (motion refs por componente)
```

## Output esperado

Mapa completo de componentes que guia la implementacion con `vue-component`.
