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

## Output esperado

Mapa de navegacion que informa la implementacion del router y los componentes de nav.
