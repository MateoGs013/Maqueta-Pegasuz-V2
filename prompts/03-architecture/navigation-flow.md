# Prompt: Navigation Flow

> Fase: Architecture | Output: Mapa de navegacion y user flows
> Definir como se mueve el usuario por el sitio.

---

## Prompt

```
Define la arquitectura de navegacion para {{PROJECT_NAME}}.

1. NAVEGACION PRINCIPAL (header)
   - Items del menu: {{NAV_ITEMS}}
   - Orden: por prioridad de negocio (lo mas importante primero)
   - CTA en nav? Si/No. Cual?
   - Comportamiento: fixed, sticky, hide-on-scroll, transparent->solid?
   - Mobile: hamburger, slide panel, fullscreen overlay?

2. NAVEGACION SECUNDARIA (footer)
   - Columnas: {{FOOTER_COLUMNS}}
   - Links por columna
   - Info de contacto
   - Social links
   - Legal (privacy, terms)

3. USER FLOWS PRINCIPALES
   Para cada flow, mapear el camino:

   FLOW 1: {{PRIMARY_GOAL}} (ej: "Contactar por un servicio")
   Home -> {{STEP}} -> {{STEP}} -> {{STEP}} -> Conversion
   Clicks maximos: {{N}}

   FLOW 2: {{SECONDARY_GOAL}} (ej: "Explorar portfolio")
   Home -> {{STEP}} -> {{STEP}} -> {{STEP}}
   Clicks maximos: {{N}}

   FLOW 3: {{TERTIARY_GOAL}} (ej: "Leer un articulo")
   Home/Blog -> {{STEP}} -> {{STEP}}
   Clicks maximos: {{N}}

4. CROSS-LINKING
   | Desde | Hacia | Trigger |
   |-------|-------|---------|
   | Servicio detail | Contacto | CTA "Consultar sobre este servicio" |
   | Blog article | Servicios | CTA contextual en sidebar |
   | Portfolio item | Contacto | CTA "Iniciar proyecto similar" |
   | {{FROM}} | {{TO}} | {{TRIGGER}} |

5. BREADCRUMBS
   - Paginas con breadcrumbs: {{PAGES}}
   - Formato: Home > {{Section}} > {{Current}}

6. ESTADOS ESPECIALES
   - 404: redirigir a? mostrar busqueda? sugerir paginas?
   - Empty state (search sin resultados): que mostrar?
   - Loading: skeleton, spinner, o transicion custom?
```

---

## Ejemplo: buena vs mala navegacion

### Para un e-commerce de ropa sustentable

**Mala:**
```
Menu: Home, Productos, About, Contacto
Mobile: hamburger menu
Footer: links
```
(Sin prioridad, sin user flows, sin cross-linking.)

**Buena:**
```
NAVEGACION PRINCIPAL:
Items: Mujer | Hombre | Nuestra historia | Sostenibilidad
CTA en nav: "Mi carrito (0)" — icono + badge
Comportamiento: sticky, transparent bg sobre hero -> solid al scroll
Mobile: hamburger -> fullscreen overlay con categorias prominentes + search

USER FLOWS:
Flow 1: Comprar una remera (objetivo principal)
  Home -> Mujer -> Remeras -> ProductDetail -> Talle -> Carrito -> Checkout
  Clicks: 5 (podria ser 3 si busca directo)

Flow 2: Entender la marca (confianza)
  Home -> Nuestra historia -> Sostenibilidad -> Tienda
  Clicks: 3

CROSS-LINKING:
| Desde | Hacia | Trigger |
| ProductDetail | Productos relacionados | "Combina con..." (section below) |
| Blog article sobre algodon organico | Categoria remeras | CTA: "Descubri nuestras remeras de algodon organico" |
| Checkout | Help | Link "Guia de talles" inline |
| 404 | Categorias | "No encontramos esa pagina. Proba buscando en:" + category links |
```

---

## Variaciones de nav por industria

| Industria | Nav recomendada | Comportamiento mobile | CTA en nav |
|-----------|----------------|----------------------|-----------|
| Gastronomia | Menu / Reservas / Nosotros / Contacto | Fullscreen overlay con horarios visibles | "Reservar mesa" |
| Inmobiliaria | Propiedades / Servicios / Sobre nosotros / Blog | Slide panel con search prominente | "Publicar propiedad" o "Tasar gratis" |
| Fintech | Productos / Pricing / Recursos / Login | Tab bar bottom en mobile (app-like) | "Abrir cuenta" |
| SaaS | Producto / Pricing / Docs / Blog / Login | Hamburger con search | "Start free trial" |
| Portfolio personal | Trabajo / Sobre mi / Contacto | Minimal hamburger | No CTA en nav (es portfolio) |
| E-commerce | Categorias / Ofertas / Nosotros | Fullscreen con categorias + search | Carrito icon + badge |

---

## Common errors

- **Demasiados items en nav principal.** 4-6 items es ideal. Mas de 7 genera decision fatigue. Mover items secundarios al footer.
- **No priorizar por objetivo de negocio.** Si el objetivo es vender, "Productos" va primero. Si es generar leads, "Servicios" va primero. No ordenar alfabeticamente.
- **Mobile nav que es un copy del desktop.** El mobile necesita simplificacion. Los user flows son diferentes (mas busqueda, menos browsing).
- **No definir el comportamiento del header al scroll.** Fixed vs sticky vs hide-on-scroll vs transparent->solid cambia toda la implementacion.
- **Cross-linking inexistente.** Sin links internos contextuales, el usuario queda atrapado en una pagina. Cada pagina debe tener escape routes hacia otras paginas.
- **404 que no ayuda.** Un 404 con solo "Pagina no encontrada" es un dead end. Incluir search, links populares, o redireccion al home.
- **User flows sin medicion de clicks.** Si el objetivo principal requiere 8 clicks, hay un problema. Regla: 3-4 clicks maximo para el flow principal.

---

## Pipeline connection

```
Input: client-intake.md (paginas requeridas, funcionalidades)
     + page-planning.md (paginas y secciones)
     + cta-strategy.md (destinos de CTAs)
Output de este prompt -> Mapa de navegacion y user flows
  Alimenta:
    - component-planning.md (AppHeader, AppFooter, MobileMenu)
    - router/index.js (rutas, lazy loading, scroll behavior)
    - page-scaffold skill (links entre paginas)
    - seo-audit (breadcrumbs, canonical URLs)
```

## Output esperado

Mapa de navegacion que informa la implementacion del router y los componentes de nav.
