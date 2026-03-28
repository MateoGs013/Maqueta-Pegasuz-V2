# Guide: Project Initialization

> Como arrancar un proyecto nuevo desde esta maqueta.
> **Prerequisito:** Leer [01-pipeline-overview](01-pipeline-overview.md) para entender el flujo completo.

---

## Resumen rapido

```
Copiar maqueta -> Discovery (3 prompts) -> Foundation Docs (4 archivos) -> Implementar -> Quality
```

---

## Paso 1: Copiar la maqueta

### Opcion A: Proyecto independiente (no Pegasuz)

```bash
# Copiar la carpeta completa de la maqueta
cp -r /path/to/maqueta /path/to/Clientes/<project-slug>

# Entrar al directorio
cd /path/to/Clientes/<project-slug>

# Instalar dependencias
npm install

# Verificar que arranca
npm run dev
# Debe abrir en http://localhost:5173
```

### Opcion B: Proyecto Pegasuz (multi-tenant)

```bash
# Copiar el scaffold base (no la maqueta entera)
cp -r /path/to/maqueta/_project-scaffold /path/to/Clientes/<project-slug>

cd /path/to/Clientes/<project-slug>

# Configurar el .env
cp .env.example .env
# Editar .env con:
#   VITE_API_URL=http://localhost:3000
#   VITE_CLIENT_SLUG=<slug-del-cliente>

npm install
npm run dev
```

> **Nota:** Para proyectos Pegasuz, seguir tambien [03-pegasuz-integration](03-pegasuz-integration.md) que cubre el pipeline completo de onboarding (Phases 0-7).

---

## Paso 2: Discovery (prompts/00-discovery/)

Ejecutar los 3 prompts de discovery **en este orden**. Cada uno produce informacion que el siguiente necesita.

### 2.1 Client Intake (`prompts/00-discovery/client-intake.md`)

**Que hace:** Entender el negocio, objetivos, estetica deseada, contenido disponible, y requerimientos tecnicos.

**Ejemplo de uso:**
```
Prompt: "Ejecutar client-intake para [nombre del proyecto]"

Preguntas tipicas que responde:
- Que tipo de negocio es? (restaurante, inmobiliaria, agencia, etc.)
- Que paginas necesita? (home, about, services, contact, etc.)
- Que features necesita? (blog, portfolio, booking, etc.)
- Que estetica busca? (minimal, luxury, playful, corporate, etc.)
- Tiene contenido ya? (textos, fotos, logo, etc.)
```

### 2.2 Competitive Analysis (`prompts/00-discovery/competitive-analysis.md`)

**Que hace:** Analizar competidores directos para encontrar oportunidades de diferenciacion.

**Ejemplo de uso:**
```
Prompt: "Ejecutar competitive-analysis para [nombre del proyecto]"

Output esperado:
- 3-5 competidores analizados
- Patrones comunes del rubro
- Oportunidades de diferenciacion
- Features que los competidores no tienen
```

### 2.3 Brand Questionnaire (`prompts/00-discovery/brand-questionnaire.md`)

**Que hace:** Definir la personalidad de marca: posicionamiento, tono, analogias visuales.

**Ejemplo de uso:**
```
Prompt: "Ejecutar brand-questionnaire para [nombre del proyecto]"

Output esperado:
- Personalidad de marca (3-5 adjetivos)
- Tono de voz (formal/casual, tecnico/humano, etc.)
- Analogias visuales ("como Apple pero mas calido")
- Posicionamiento vs competencia
```

**Output total del Paso 2:** Perfil completo del cliente y su marca. Este perfil alimenta los 4 docs del Paso 3.

---

## Paso 3: Foundation Docs (docs/)

### 3.1 Copiar templates

```bash
cp docs/_templates/content-brief.template.md docs/content-brief.md
cp docs/_templates/design-brief.template.md docs/design-brief.md
cp docs/_templates/page-plans.template.md docs/page-plans.md
cp docs/_templates/motion-spec.template.md docs/motion-spec.md
```

### 3.2 Llenar EN ESTE ORDEN (content-first)

El orden importa: el contenido informa el diseno, no al reves.

```
ORDEN OBLIGATORIO:

  1. content-brief.md   ── usando prompts/02-content/copy-framework.md
         |                  (copy primero — content-first)
         v
  2. design-brief.md    ── usando prompts/01-identity/design-direction.md
         |                  (activa el skill creative-design)
         v
  3. page-plans.md      ── usando prompts/03-architecture/page-planning.md
         |                  (secciones por pagina, propositos, minimos)
         v
  4. motion-spec.md     ── usando prompts/04-motion/motion-personality.md
                            (coreografia GSAP completa)
```

### 3.3 Que debe contener cada doc

| Doc | Contenido minimo | Ejemplo concreto |
|-----|-----------------|------------------|
| `content-brief.md` | Hero headline, copy de servicios, CTAs, testimonios | `"Schedule a code review"` como CTA, no `"Contactanos"` |
| `design-brief.md` | Paleta hex, tipografia, spacing scale, atmosfera | `--color-accent-primary: #ff6b35;` con tokens CSS |
| `page-plans.md` | Secciones por pagina con proposito y layout | Homepage: 8-14 secciones, cada una con proposito |
| `motion-spec.md` | Timeline del hero, scroll reveals, hover states | `Hero: title slides from left (0.8s, power3.out)` |

### 3.4 Verificar que no quedan placeholders

```bash
# Buscar placeholders sin llenar
grep -rn "{{" docs/*.md
grep -rn "TODO" docs/*.md
grep -rn "PLACEHOLDER" docs/*.md
# Debe dar 0 resultados
```

**Output del Paso 3:** 4 archivos en `docs/` completamente llenos, sin placeholders. Estos son la **fuente de verdad** para toda la implementacion.

---

## Paso 4: Implementacion

Ahora si se puede escribir codigo. Seguir el pipeline segun el tipo de proyecto:

| Tipo de proyecto | Guia a seguir |
|-----------------|---------------|
| Proyecto independiente | [01-pipeline-overview](01-pipeline-overview.md) (Phases 2-6) |
| Cliente Pegasuz | [03-pegasuz-integration](03-pegasuz-integration.md) (Phases 0-7) |

### Orden de skills para la implementacion

```
1. creative-design    -> Implementar tokens CSS (desde design-brief.md)
2. page-scaffold      -> Crear estructura HTML (desde page-plans.md)
3. threejs-3d         -> Elemento 3D (Tier 1 minimo)
4. vue-component      -> Componentes reutilizables
5. gsap-motion        -> Animaciones (desde motion-spec.md)
```

> Ver [skill-dispatch-table](skill-dispatch-table.md) para la referencia completa de skills.

---

## Paso 5: Quality Chain

Ejecutar la cadena de calidad completa: `prompts/07-quality/audit-sequence.md`

```
6 auditorias en orden:

  1. pegasuz-validation-qa   (solo si es Pegasuz)
  2. a11y-audit              accesibilidad
  3. seo-audit               meta tags, JSON-LD
  4. responsive-review       mobile/tablet/desktop
  5. css-review              tokens, consistencia
  6. perf-check              bundle, imagenes, lazy loading
```

**Gate de entrega:** 0 BLOCKING + 0 CRITICAL = puede entregarse.

> Ver [04-quality-standards](04-quality-standards.md) para detalles de cada auditoria.
> Ver [05-delivery-checklist](05-delivery-checklist.md) para el checklist final.

---

## Estructura final esperada

```
proyecto/
  docs/
    design-brief.md     <- Lleno, aprobado, sin placeholders
    content-brief.md    <- Lleno, aprobado, sin placeholders
    page-plans.md       <- Lleno, aprobado, sin placeholders
    motion-spec.md      <- Lleno, aprobado, sin placeholders
  src/
    config/
      api.js            <- Axios instance + x-client header
    services/           <- Un archivo por entidad
    stores/             <- Un store por entidad + content.js
    views/              <- Paginas
    components/         <- UI reutilizable
    composables/        <- Logica compartida
    router/
      index.js          <- Lazy loading, history mode
    styles/             <- Design tokens CSS
    App.vue
    main.js
  .env                  <- VITE_API_URL + VITE_CLIENT_SLUG
  package.json
```

---

## Regla de oro

**NO ESCRIBIR CODIGO hasta que los 4 docs esten completos.**

Los docs son el brief. El codigo es la ejecucion del brief. Sin brief, el resultado es un sitio template. Con brief, el resultado es un sitio con identidad.

---

## Problemas comunes al iniciar

| Problema | Solucion |
|----------|---------|
| `npm run dev` falla | Ver [06-troubleshooting](06-troubleshooting.md#build--development) |
| No se que estetica elegir | Ejecutar `brand-questionnaire` primero, luego `creative-design` |
| No tengo contenido del cliente | Escribir copy realista en `content-brief.md`, no usar lorem ipsum |
| Es proyecto Pegasuz pero no se por donde empezar | Ir a [03-pegasuz-integration](03-pegasuz-integration.md) |
