# Guide: Skill Dispatch Table

> Que skill usar para que tarea. Referencia rapida.

---

## Skills de construccion

| Necesito... | Skill | Trigger |
|-------------|-------|---------|
| Definir identidad visual | `creative-design` | Paleta, tipografia, atmosfera |
| Crear estructura de pagina | `page-scaffold` | Secciones, layout, HTML semantico |
| Implementar 3D/WebGL | `threejs-3d` | Shaders, particulas, escenas |
| Crear componentes Vue | `vue-component` | Cards, buttons, forms, secciones |
| Crear composables | `vue-composable` | Logica compartida, useX functions |
| Implementar animaciones | `gsap-motion` | Scroll reveals, hover, transitions |

## Skills de auditoria

| Necesito verificar... | Skill | Que revisa |
|----------------------|-------|-----------|
| Accesibilidad | `a11y-audit` | WCAG 2.1 AA, keyboard, ARIA |
| SEO | `seo-audit` | Meta tags, JSON-LD, headings |
| Responsive | `responsive-review` | Mobile, tablet, desktop |
| CSS consistency | `css-review` | Tokens, spacing, colores |
| Performance | `perf-check` | Bundle, images, lazy loading |
| Buscar codigo | `find-code` | Patterns, archivos, funciones |

## Skills Pegasuz

| Necesito... | Skill | Cuando |
|-------------|-------|--------|
| Onboarding completo | `pegasuz-integrator` | Nuevo cliente multi-fase |
| Crear endpoints | `pegasuz-backend-development` | Schema, controllers, routes |
| Conectar API a frontend | `pegasuz-feature-binding` | Service -> Store -> View |
| Normalizar frontend | `pegasuz-frontend-normalization` | Antes de binding |
| Validar integracion | `pegasuz-validation-qa` | Post-binding, 5 layers |
| Documentar | `pegasuz-documentation-system` | Post-entrega |
| Orquestar frontend | `pegasuz-frontend-executor` | Build end-to-end |

## Pipeline de construccion (orden obligatorio)

```
1. creative-design     -> Design Brief
2. page-scaffold       -> Estructura de paginas
3. threejs-3d          -> Elementos 3D (SIEMPRE)
4. vue-component       -> Componentes
5. gsap-motion         -> Animaciones
6. Cadena de calidad   -> a11y -> seo -> responsive -> css -> perf
```

## Pipeline de calidad (orden recomendado)

```
1. pegasuz-validation-qa  (si Pegasuz)
2. a11y-audit
3. seo-audit
4. responsive-review
5. css-review
6. perf-check
```

## Agentes disponibles

| Agente | Rol |
|--------|-----|
| design-critic | Evalua propuestas visuales |
| motion-director | Revisa coreografia de motion |
| ux-reviewer | Valida claridad y conversion |
| binding-auditor | Audita cadena View->Store->Service->API |
| tenant-safety-guard | Verifica aislamiento multi-tenant |
| seo-content-architect | Revisa SEO y estructura de contenido |
| domain-expert | Logica de negocio especifica del rubro |
