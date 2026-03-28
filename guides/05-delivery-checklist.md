# Guide: Delivery Checklist

> Checklist final antes de considerar un proyecto terminado.
> **Cuando usar:** Despues de Phase 7 (Quality Chain) del [pipeline](01-pipeline-overview.md).
> **Prerequisito:** Haber ejecutado las 6 auditorias de [04-quality-standards](04-quality-standards.md).

---

## Como usar este checklist

1. Ejecutar la cadena de calidad completa (ver [04-quality-standards](04-quality-standards.md))
2. Resolver todos los BLOCKING y CRITICAL
3. Recorrer este checklist seccion por seccion
4. Marcar cada item como Pass
5. Firmar el sign-off al final

---

## Pre-delivery

### 1. Docs completos

- [ ] `docs/design-brief.md` existe y esta lleno
- [ ] `docs/content-brief.md` existe y esta lleno
- [ ] `docs/page-plans.md` existe y esta lleno
- [ ] `docs/motion-spec.md` existe y esta lleno
- [ ] No quedan placeholders `{{}}` en ningun doc

```bash
# Verificar rapidamente:
ls docs/design-brief.md docs/content-brief.md docs/page-plans.md docs/motion-spec.md
grep -c "{{" docs/*.md         # Debe dar 0 en cada linea
grep -c "TODO" docs/*.md       # Debe dar 0 en cada linea
grep -c "PLACEHOLDER" docs/*.md # Debe dar 0 en cada linea
```

### 2. Auditorias ejecutadas

- [ ] `a11y-audit` ejecutado -- 0 CRITICAL
- [ ] `seo-audit` ejecutado -- 0 CRITICAL
- [ ] `responsive-review` ejecutado -- 0 CRITICAL
- [ ] `css-review` ejecutado -- 0 CRITICAL
- [ ] `perf-check` ejecutado -- 0 CRITICAL
- [ ] `pegasuz-validation-qa` ejecutado (si aplica) -- 0 CRITICAL

```
Para ejecutar toda la cadena:
  Prompt: "Ejecutar audit-sequence" (prompts/07-quality/audit-sequence.md)

O ejecutar individualmente:
  Prompt: "Ejecutar a11y-audit"
  Prompt: "Ejecutar seo-audit"
  Prompt: "Ejecutar responsive-review"
  Prompt: "Ejecutar css-review"
  Prompt: "Ejecutar perf-check"
  Prompt: "Ejecutar pegasuz-validation-qa"  (solo si es Pegasuz)
```

### 3. Funcionalidad

- [ ] Todas las paginas cargan sin errores en consola
- [ ] Datos reales (no mock data, a menos que sea deliberado)
- [ ] Formularios funcionan end-to-end
- [ ] Links internos verificados (no 404s)
- [ ] Links externos abren en nueva tab (`target="_blank" rel="noopener"`)
- [ ] 404 page implementada
- [ ] Loading states en todas las paginas con datos async
- [ ] Error states en todas las paginas con datos async

```bash
# Verificar que no hay errores de build:
npm run build
# Debe completar sin errores ni warnings

# Verificar que las rutas estan lazy loaded:
grep -rn "import(" src/router/index.js
# Cada ruta debe usar () => import('./views/X.vue')
```

### 4. Visual

- [ ] Design tokens aplicados (no valores hardcodeados)
- [ ] Responsive verificado en: 375px, 768px, 1280px, 1440px+
- [ ] Imagenes optimizadas con width y height
- [ ] Favicon instalado
- [ ] Fuentes cargando correctamente

```bash
# Verificar tokens vs hardcoded values:
# El css-review skill hace esto automaticamente, pero manualmente:
grep -rn "color: #" src/ --include="*.vue" --include="*.css"
# Idealmente 0 resultados (todo deberia ser var(--token))
```

### 5. Motion

- [ ] Hero timeline funciona en carga limpia (no solo en hot-reload)
- [ ] Scroll reveals en todas las secciones
- [ ] Hover interactions en todo lo clickeable
- [ ] prefers-reduced-motion: todo desactivado cuando esta on
- [ ] GSAP cleanup (`ctx?.revert()`) en todos los componentes con animaciones
- [ ] Variacion: cada seccion usa tecnica diferente (no mismo fade-up)

```bash
# Verificar cleanup pattern:
grep -rn "onBeforeUnmount" src/ --include="*.vue"
# Cada componente con GSAP debe tener cleanup

grep -rn "prefers-reduced-motion" src/ --include="*.vue"
# Cada componente con GSAP debe respetar reduced-motion
```

### 6. 3D

- [ ] Al menos 1 elemento 3D implementado (Tier 1 minimo)
- [ ] Fallback CSS para navegadores sin WebGL
- [ ] Fallback para reduced-motion
- [ ] Mobile: version simplificada o desactivada si lagea
- [ ] Canvas dispose en onBeforeUnmount (evitar memory leak)

```bash
# Verificar dispose pattern:
grep -rn "dispose" src/ --include="*.vue"
# Debe existir en componentes con Three.js
```

### 7. Pegasuz (si aplica)

- [ ] x-client header en todas las requests (`src/config/api.js`)
- [ ] 0 slugs hardcodeados en source code
- [ ] View -> Store -> Service -> API chain intacta (sin atajos)
- [ ] Zero Omission Rule: todos los campos mapeados o excluidos con razon
- [ ] `resolveImageUrl()` en todas las imagenes del API
- [ ] CMS content (contentStore) separado de feature data (feature stores)

```bash
# Verificar que no hay slugs hardcodeados:
grep -rn "x-client.*:" src/ --include="*.js" --include="*.vue" | grep -v "VITE_CLIENT_SLUG"
# Debe dar 0 resultados

# Verificar que todas las imagenes usan resolveImageUrl:
grep -rn ":src=" src/ --include="*.vue" | grep -v "resolveImageUrl"
# Idealmente 0 resultados (para imagenes del API)
```

---

## Sign-off

| Area | Status | Notas |
|------|--------|-------|
| Docs completos | [ ] Pass | |
| Auditorias (0 CRITICAL) | [ ] Pass | |
| Funcionalidad | [ ] Pass | |
| Visual | [ ] Pass | |
| Motion | [ ] Pass | |
| 3D | [ ] Pass | |
| Performance | [ ] Pass | |
| SEO | [ ] Pass | |
| A11y | [ ] Pass | |
| Pegasuz | [ ] Pass / N/A | |

**Entregable cuando todas las areas estan en Pass.**

---

## Problemas comunes en pre-delivery

| Problema | Referencia |
|----------|-----------|
| Build falla | [06-troubleshooting](06-troubleshooting.md#build--development) |
| Animaciones no corren | [06-troubleshooting](06-troubleshooting.md#gsap--motion) |
| Imagenes rotas | [06-troubleshooting](06-troubleshooting.md#las-imagenes-no-cargan) |
| Layout roto en mobile | [06-troubleshooting](06-troubleshooting.md#css--responsive) |
| API errors | [06-troubleshooting](06-troubleshooting.md#api--pegasuz) |
