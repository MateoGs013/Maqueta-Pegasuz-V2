# Page Plans: {{PROJECT_NAME}}

> Cada pagina definida seccion por seccion con proposito narrativo.
> Este archivo es el blueprint. El codigo es la ejecucion de este blueprint.

---

## Minimos obligatorios

| Tipo de pagina | Secciones minimas |
|---------------|-------------------|
| Homepage / Landing | 8-14 |
| About / Studio | 6-10 |
| Services | 6-10 |
| Service detail | 5-8 |
| Portfolio / Work | 5-8 |
| Case study | 6-10 |
| Contact | 3-5 |
| Blog listing | 4-6 |
| Blog article | 3-5 |
| Property / Product detail | 5-8 |

## Propositos de seccion disponibles

| Proposito | Funcion narrativa | Ejemplo |
|-----------|------------------|---------|
| **Impact** | Primer golpe visual. Captar atencion | Hero con headline + 3D/video |
| **Manifesto** | Declarar quien sos y que crees | About section con narrativa |
| **Energy** | Break visual para resetear ritmo | Marquee, stats counter, fullbleed image |
| **Context** | Dar contexto o explicar proceso | Steps, timeline, methodology |
| **Proof** | Demostrar resultados | Portfolio grid, case studies |
| **Showcase** | El contenido visual ES el mensaje | Galeria fullscreen, slider inmersivo, video reel |
| **Process** | Mostrar como trabajas | Steps numerados, timeline |
| **Trust** | Generar confianza | Testimonios, logos, certificaciones |
| **Evidence** | Datos duros | Stats, numeros, metricas |
| **Differentiator** | Que te hace diferente | Comparison, unique features |
| **Close** | Cerrar con accion | CTA final, contacto, newsletter |

## Ritmo narrativo

Alternar secciones energeticas y contemplativas:
- NUNCA dos secciones densas consecutivas sin un Energy break
- NUNCA tres secciones con el mismo layout
- Cada seccion usa una tecnica de animacion DIFERENTE

## Notas de uso

- **Paginas opcionales:** Blog listing, Blog article, Case study, Service detail, y Property/Product detail son opcionales. Si el proyecto no las tiene, eliminar esas secciones del documento final. No dejarlas vacias.
- **Paginas custom:** Si el proyecto necesita paginas que no estan en este template (ej: Pricing, Team, FAQ), agregar una seccion nueva siguiendo el mismo formato.
- **Campo "Background":** Cada seccion define el color/tratamiento de su fondo. Esto es critico para proyectos dark-mode que alternan secciones claras/oscuras.
- **Campo "Component":** Nombre tentativo del Vue component que implementa esta seccion. Ayuda al page-scaffold skill a saber que crear.

---

## Global: Header & Footer

> Definir estructura de navegacion y footer antes de las paginas individuales.

### Header / Navigation
- **Tipo:** {{NAV_TYPE}} (ej: fixed transparent -> solid on scroll, sticky, hamburger-only, sidebar)
- **Items:** {{NAV_ITEMS}} (ej: Inicio, Estudio, Servicios, Portfolio, Contacto)
- **CTA en nav (si hay):** {{NAV_CTA}} (ej: boton "Reservar consulta" a la derecha)
- **Logo:** {{LOGO_TYPE}} (ej: logotipo texto, isotipo + texto, solo isotipo)
- **Mobile behavior:** {{MOBILE_NAV}} (ej: hamburger menu fullscreen, slide-in drawer, bottom nav)
- **Ref:** design-brief nav tokens, motion-spec nav animations

### Footer
- **Columnas:** {{FOOTER_COLUMNS}} (ej: 4 columnas — Logo+desc, Nav links, Servicios, Contacto)
- **Contenido columna 1:** {{COL_1}} (ej: logo, tagline, 1-2 oraciones, redes sociales)
- **Contenido columna 2:** {{COL_2}} (ej: links de navegacion)
- **Contenido columna 3:** {{COL_3}} (ej: servicios / links utiles)
- **Contenido columna 4:** {{COL_4}} (ej: info de contacto, email, telefono)
- **Bottom bar:** {{FOOTER_BOTTOM}} (ej: copyright + links legales)
- **Newsletter (si hay):** {{NEWSLETTER}} (ej: si, en columna 4 o como barra separada)
- **Ref:** content-brief microcopy, content-brief contacto

---

## Homepage

> Minimo 8 secciones. Completar TODAS.

### Seccion 1 — Hero
- **Proposito:** Impact
- **Layout:** {{LAYOUT}} (ej: fullscreen, split, asymmetric)
- **Background:** {{BG}} (ej: bg-primary, gradient-hero, imagen fullbleed con overlay, video)
- **Contenido:** headline + sub + CTA (de content-brief #2)
- **Motion:** {{MOTION}} (de motion-spec)
- **3D/Visual:** {{3D_ELEMENT}} (ej: shader bg, particles, model)
- **Component:** {{COMPONENT}} (ej: HeroSection.vue)
- **Data source:** {{SOURCE}} (hardcoded / CMS key)
- **Responsive:** {{MOBILE_VARIANT}} (que cambia en mobile)
- **Loading state:** {{LOADING}} (ej: skeleton shimmer, bg color until 3D loads)
- **Ref:** content-brief #2, motion-spec hero timeline

### Seccion 2 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}} (ej: Manifesto, Context, Differentiator)
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}} (referencia a content-brief seccion #)
- **Motion:** {{MOTION_REF}} (referencia a motion-spec tecnica)
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 3 — {{SECTION_NAME}}
- **Proposito:** Energy
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 4 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 5 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 6 — {{SECTION_NAME}}
- **Proposito:** Energy
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 7 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 8 — CTA Final
- **Proposito:** Close
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** CTA final (de content-brief #10)
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

*(Agregar secciones 9-14 si el proyecto lo requiere)*

---

## About / Studio

> Minimo 6 secciones. Completar TODAS.

### Seccion 1 — {{SECTION_NAME}}
- **Proposito:** Impact / Manifesto
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 2 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 3 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 4 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 5 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 6 — {{SECTION_NAME}}
- **Proposito:** Close
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

---

## Services

> Minimo 6 secciones. Completar TODAS.

### Seccion 1 — {{SECTION_NAME}}
- **Proposito:** Impact
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 2 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 3 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 4 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 5 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 6 — {{SECTION_NAME}}
- **Proposito:** Close
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

---

## Portfolio / Work

> Minimo 5 secciones. Completar TODAS.

### Seccion 1 — {{SECTION_NAME}}
- **Proposito:** Impact / Showcase
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 2 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 3 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 4 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 5 — {{SECTION_NAME}}
- **Proposito:** Close
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

---

## Contact

> Minimo 3 secciones. Completar TODAS.

### Seccion 1 — {{SECTION_NAME}}
- **Proposito:** Impact
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 2 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 3 — {{SECTION_NAME}}
- **Proposito:** Close
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

---

## Service detail (opcional)

> Minimo 5 secciones. Completar si el proyecto tiene paginas individuales por servicio.
> Eliminar esta seccion completa si los servicios se muestran solo en la pagina Services.

### Seccion 1 — {{SECTION_NAME}}
- **Proposito:** Impact
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}} (nombre del servicio, descripcion hero)
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 2 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}} (ej: Context — detalles del servicio, que incluye)
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 3 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}} (ej: Process — como se ejecuta este servicio)
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 4 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}} (ej: Proof — proyectos relacionados, resultados)
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 5 — {{SECTION_NAME}}
- **Proposito:** Close
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

---

## Case study (opcional)

> Minimo 6 secciones. Completar si el proyecto tiene case studies detallados.
> Eliminar esta seccion completa si no hay case studies.

### Seccion 1 — {{SECTION_NAME}}
- **Proposito:** Impact (titulo del proyecto, imagen hero)
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 2 — {{SECTION_NAME}}
- **Proposito:** Context (brief del cliente, challenge, scope)
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 3 — {{SECTION_NAME}}
- **Proposito:** Process (solucion, approach, herramientas)
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 4 — {{SECTION_NAME}}
- **Proposito:** Showcase (galeria de resultados, imagenes fullbleed)
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 5 — {{SECTION_NAME}}
- **Proposito:** Evidence (resultados, metricas, impacto)
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 6 — {{SECTION_NAME}}
- **Proposito:** Close (CTA, next project link)
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

---

## Blog listing (opcional)

> Minimo 4 secciones. Completar si el proyecto tiene blog. Eliminar si no aplica.

### Seccion 1 — {{SECTION_NAME}}
- **Proposito:** Impact
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 2 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 3 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 4 — {{SECTION_NAME}}
- **Proposito:** Close
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

---

## Blog article (opcional)

> Minimo 3 secciones. Completar si el proyecto tiene blog. Eliminar si no aplica.

### Seccion 1 — {{SECTION_NAME}}
- **Proposito:** Impact
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 2 — {{SECTION_NAME}}
- **Proposito:** {{PURPOSE}}
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

### Seccion 3 — {{SECTION_NAME}}
- **Proposito:** Close
- **Layout:** {{LAYOUT}}
- **Background:** {{BG}}
- **Contenido:** {{CONTENT_REF}}
- **Motion:** {{MOTION_REF}}
- **Component:** {{COMPONENT}}
- **Data source:** {{SOURCE}}
- **Responsive:** {{MOBILE_VARIANT}}

---

## Checklist

- [ ] Header/Footer plan definido con items, layout, mobile behavior
- [ ] Cada pagina cumple el minimo de secciones
- [ ] Ritmo narrativo: no hay dos densas consecutivas
- [ ] Cada seccion tiene proposito definido
- [ ] Cada seccion tiene Background definido (color/treatment)
- [ ] Cada seccion referencia content-brief para copy
- [ ] Cada seccion referencia motion-spec para animacion
- [ ] Cada seccion tiene Component name tentativo
- [ ] Cada seccion tiene data source (CMS / hardcoded / API)
- [ ] Cada seccion tiene nota responsive (que cambia en mobile)
- [ ] Hero tiene elemento 3D/visual definido
- [ ] Hero tiene loading state definido
- [ ] Ultima seccion de cada pagina tiene CTA (Close)
- [ ] Layouts variados (no todo es el mismo grid)
- [ ] Paginas opcionales no aplicables fueron ELIMINADAS (no dejadas vacias)
- [ ] Service detail y Case study tienen plan (si aplica al proyecto)
