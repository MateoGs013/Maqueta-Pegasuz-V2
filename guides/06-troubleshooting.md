# Guide: Troubleshooting

> Problemas comunes y como resolverlos.
> Organizado por area para ir directo al problema.
> **Tip:** Usar Ctrl+F para buscar el error o sintoma exacto.

---

## Quick diagnostic

Cuando algo no funciona y no sabes por donde empezar:

```
PASO 1: Abrir DevTools > Console
  -> Errores de JavaScript? Arreglar primero.
  -> El error dice exactamente que falta.

PASO 2: Abrir DevTools > Network
  -> Requests fallando? Verificar URL, headers, status code.
  -> Filtrar por "XHR" para ver solo API calls.

PASO 3: Verificar .env
  -> Variables correctas? API accesible?
  -> VITE_API_URL y VITE_CLIENT_SLUG presentes?

PASO 4: npm run build
  -> Compila limpio? Si no, el error dice exactamente que falta.
  -> Vite es mas estricto en build que en dev.

PASO 5: Ejecutar la auditoria relevante:
  -> "Ejecutar [a11y|seo|responsive|css|perf]-audit"
  -> El reporte te dice exactamente que arreglar.
```

---

## Build & Development

### El proyecto no arranca (`npm run dev` falla)

**Sintoma:** Error al ejecutar `npm run dev`, modulos no encontrados.

**Causas y soluciones:**

```bash
# 1. Dependencias no instaladas
npm install

# 2. Cache corrupto de node_modules
rm -rf node_modules package-lock.json
npm install

# 3. Version de Node incompatible (necesita 18+)
node --version
# Si es < 18, actualizar Node.js

# 4. Puerto en uso
# Error: "Port 5173 is already in use"
# Matar el proceso o cambiar el puerto:
npx vite --port 5174
```

### `npm run build` falla con errores

**Sintoma:** El build de produccion falla aunque `dev` funciona.

**Causas comunes:**

```bash
# 1. Imports no usados (Vite es mas estricto en build)
# Buscar imports sin uso:
grep -rn "import.*from" src/ --include="*.vue" --include="*.js"
# Eliminar los que no se usan

# 2. Variables no definidas
# El build no tiene hot-reload para recuperarse de errores
# Revisar la consola del build por "is not defined"

# 3. Variables de entorno faltantes
# En build, VITE_* vars deben estar en .env
cat .env
# Verificar que VITE_API_URL y VITE_CLIENT_SLUG existen
```

### Hot-reload no funciona

**Sintoma:** Cambios en el codigo no se reflejan en el browser.

```bash
# 1. Vite HMR desconectado
# Verificar que no hay errores de WebSocket en la consola del browser
# Reiniciar el server: Ctrl+C, npm run dev

# 2. Archivo fuera del src/
# Vite solo hace HMR para archivos dentro de src/ y los que importa
# Si editaste un archivo en docs/ o public/, no hay HMR

# 3. Windows: path con caracteres especiales
# Mover el proyecto a un path sin espacios ni acentos
```

---

## API & Pegasuz

### Las requests al API fallan (CORS, 401, 404)

**Sintoma:** Errores de red en DevTools, datos no cargan.

```bash
# 1. CORS error
# "Access to XMLHttpRequest has been blocked by CORS policy"
# El backend no tiene el origin del frontend habilitado
# Verificar que el backend permite localhost:5173

# 2. 401 Unauthorized
# El x-client header no se esta enviando
# Verificar src/config/api.js:
grep "x-client" src/config/api.js
# Debe mostrar: 'x-client': import.meta.env.VITE_CLIENT_SLUG

# 3. 404 Not Found
# El endpoint no existe o el feature no esta habilitado
# Verificar que el feature flag esta activo para este tenant
curl -H "x-client: <slug>" http://localhost:3000/api/<entity>

# 4. .env no configurado
cat .env
# VITE_API_URL debe apuntar al backend correcto
# VITE_CLIENT_SLUG debe ser el slug exacto del tenant
```

### Los datos cargan pero se ven como `[object Object]`

**Sintoma:** En vez de una lista de items, se ve texto como `[object Object]`.

**Causa:** Response extraction incorrecta. Se esta asignando el objeto wrapper en lugar del array interno.

```
INCORRECTO (para Posts):
  this.items = data           // data es { posts: [...], pagination: {...} }

CORRECTO (para Posts):
  this.items = data.posts     // Extraer el array interno

CORRECTO (para Properties):
  this.items = data           // data YA es el array directamente
```

**Referencia rapida de extraction:**
```
Direct array:  Properties, Services, Categories, Tags, Menu, Media
               -> this.items = data

Wrapped:       Posts (data.posts), Projects (data.projects),
               Testimonials (data.testimonials), Contacts (data.contacts)
               -> this.items = data.<entity>

CMS:           SiteContent
               -> this.contents = data.contents
```

> Ver [03-pegasuz-integration](03-pegasuz-integration.md#phase-5-feature-binding) para la tabla completa.

### Las imagenes no cargan

**Sintoma:** Imagenes rotas o src incorrecto.

```bash
# 1. No se esta usando resolveImageUrl
grep -rn ":src=\"" src/ --include="*.vue" | grep -v "resolveImageUrl"
# Cada imagen del API debe pasar por resolveImageUrl()

# Correcto:
# <img :src="resolveImageUrl(item.image)" :alt="item.title" />

# Incorrecto:
# <img :src="item.image" :alt="item.title" />

# 2. La URL base esta mal
# Verificar que VITE_API_URL apunta al host correcto
# resolveImageUrl usa VITE_API_URL como base
cat .env | grep VITE_API_URL
```

### "Tenant not found" o "Client not found"

**Sintoma:** El API responde con error de tenant.

```bash
# 1. El slug esta mal escrito
cat .env | grep VITE_CLIENT_SLUG
# Comparar con el slug registrado en la base de datos de Pegasuz Core

# 2. El cliente no fue provisionado
# Verificar en Pegasuz Core:
curl http://localhost:3000/api/core-admin/clients \
  -H "Authorization: Bearer <admin-token>"
# Buscar el slug en la respuesta

# 3. El clientResolver no esta configurado
# Verificar que el middleware lee el header x-client correctamente
```

### Zero Omission Rule: campos faltantes

**Sintoma:** `pegasuz-validation-qa` reporta campos no mapeados.

```
Causa: Un campo del API no esta siendo consumido en el frontend.

Soluciones:
1. Mapearlo en el store y renderizarlo en la vista

2. Si deliberadamente no se usa, documentar la exclusion en el store:
   // Campo 'internal_notes' excluido: solo visible para admin
   // Campo 'sort_order' excluido: usado internamente para ordenamiento
```

---

## Vue & Router

### La pagina se ve en blanco

**Sintoma:** URL correcta pero contenido vacio.

```bash
# 1. Error de JavaScript no capturado
# Abrir DevTools > Console, buscar errores en rojo

# 2. Store no cargo datos
# Verificar que onMounted() llama a store.fetchAll()
grep -rn "onMounted" src/views/ --include="*.vue"

# 3. Loading state atrapado
# El template muestra v-if="store.loading" pero la request fallo silenciosamente
# Verificar que el store tiene error handling:
grep -rn "catch\|error" src/stores/*.js

# 4. Componente no registrado
# El componente se importo pero no se usa en el template
# Verificar que el import y el uso coinciden
```

### Router: las rutas no funcionan (404 en refresh)

**Sintoma:** Navegacion funciona con clicks pero da 404 al refrescar la pagina.

```bash
# Esto pasa porque el server no sabe que es una SPA.
# En dev con Vite ya viene configurado.
# En produccion, configurar el servidor web:

# Nginx:
# location / {
#   try_files $uri $uri/ /index.html;
# }

# Apache (.htaccess):
# <IfModule mod_rewrite.c>
#   RewriteEngine On
#   RewriteBase /
#   RewriteRule ^index\.html$ - [L]
#   RewriteCond %{REQUEST_FILENAME} !-f
#   RewriteCond %{REQUEST_FILENAME} !-d
#   RewriteRule . /index.html [L]
# </IfModule>

# Verificar que el router usa history mode (no hash):
grep -rn "createWebHistory\|createWebHashHistory" src/router/index.js
# Debe usar createWebHistory, NO createWebHashHistory
```

### Componente no se actualiza cuando cambia la ruta

**Sintoma:** Navegar entre `/properties/1` y `/properties/2` no actualiza el contenido.

**Causa:** Vue reutiliza el componente si la ruta solo cambia el param.

```vue
<!-- Opcion 1: Key en router-view (mas simple) -->
<router-view :key="$route.fullPath" />

<!-- Opcion 2: Watch en el componente (mas control) -->
<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
watch(() => route.params.id, (newId) => {
  store.fetchById(newId)
})
</script>
```

### Router: lazy loading no funciona

**Sintoma:** Todo el JS se carga en el bundle inicial.

```js
// INCORRECTO: import estatico (todo se bundlea junto)
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView }
]

// CORRECTO: lazy loading (cada ruta es un chunk separado)
const routes = [
  { path: '/', component: () => import('@/views/HomeView.vue') },
  { path: '/about', component: () => import('@/views/AboutView.vue') }
]
```

---

## GSAP & Motion

### Las animaciones no se ejecutan

**Sintoma:** Los elementos aparecen sin animacion.

```bash
# 1. GSAP no importado correctamente
grep -rn "from 'gsap'" src/ --include="*.vue"
# Debe importar gsap Y los plugins necesarios

# 2. ScrollTrigger no registrado
grep -rn "registerPlugin" src/ --include="*.vue"
# Debe existir: gsap.registerPlugin(ScrollTrigger)

# 3. prefers-reduced-motion activo
# Verificar en el sistema operativo:
# Windows: Settings > Accessibility > Visual effects > Animation effects
# Si esta desactivado, las animaciones no corren (comportamiento correcto)

# 4. El ref del template es null
# Verificar que el ref esta asignado en el template:
# <div ref="rootEl"> y que se usa ref() en setup
```

### Memory leak por GSAP (consola warnings)

**Sintoma:** Warnings de ScrollTrigger o animaciones que persisten despues de navegar.

**Causa:** No se hizo cleanup en onBeforeUnmount.

```js
// PATRON CORRECTO (obligatorio en cada componente con GSAP):
import { ref, onMounted, onBeforeUnmount } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const rootEl = ref(null)
let ctx = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ctx = gsap.context(() => {
    // todas las animaciones aqui adentro
    gsap.from('.element', { y: 32, opacity: 0 })
    ScrollTrigger.create({ /* ... */ })
  }, rootEl.value)
})

onBeforeUnmount(() => ctx?.revert())
// revert() limpia TODAS las animaciones y ScrollTriggers del contexto
```

### ScrollTrigger no se activa

**Sintoma:** Las animaciones scroll-linked nunca se disparan.

```bash
# 1. El trigger element no existe en el DOM al momento de crear el ScrollTrigger
# Solucion: crear dentro de onMounted, o usar nextTick()

# 2. El scroller no es el default (window)
# Si usas Lenis o un scroll container custom, configurar:
# ScrollTrigger.scrollerProxy() o ScrollTrigger.defaults({ scroller: ... })

# 3. El elemento tiene height: 0 o display: none
# ScrollTrigger necesita que el elemento tenga dimensiones reales

# 4. Lenis no esta sincronizado con ScrollTrigger
# Verificar que Lenis hace ScrollTrigger.update() en cada frame:
```

```js
// Sincronizar Lenis con ScrollTrigger:
const lenis = new Lenis()

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)
```

### Animacion "parpadea" al cargar

**Sintoma:** Los elementos se ven un instante antes de animarse.

```css
/* Solucion: ocultar con CSS hasta que GSAP tome control */
.gsap-reveal {
  visibility: hidden;
}
```

```js
// En el gsap.context, GSAP setea visibility: visible automaticamente
// con gsap.from() / gsap.set() / etc.
gsap.from('.gsap-reveal', {
  y: 32,
  opacity: 0,
  // GSAP auto-sets visibility: visible
})
```

---

## 3D / Three.js

### La escena 3D no renderiza (canvas negro o vacio)

**Sintoma:** El canvas existe pero no muestra nada.

```bash
# 1. WebGL no soportado
# Verificar en DevTools console:
# Si dice "WebGL not supported", agregar fallback CSS

# 2. La camara no apunta a los objetos
# Verificar position y lookAt de la camara

# 3. No hay luces en la escena
# Si usas MeshStandardMaterial, necesitas al menos una luz
# MeshBasicMaterial no necesita luces

# 4. Los objetos estan fuera del frustum
# Verificar que las posiciones de los objetos estan dentro del rango de la camara

# 5. El renderer no tiene el tamano correcto
# Verificar que se hace renderer.setSize(width, height)
```

### Performance mala en mobile (FPS bajos)

**Sintoma:** La escena 3D lagea en dispositivos moviles.

```js
// Soluciones progresivas:

// 1. Limitar pixel ratio
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

// 2. Reducir geometria en mobile
const isMobile = window.innerWidth < 768
const particleCount = isMobile ? 500 : 5000

// 3. Desactivar sombras en mobile
renderer.shadowMap.enabled = !isMobile

// 4. O directamente desactivar 3D en mobile y usar fallback CSS
if (isMobile) {
  // Mostrar fallback CSS en vez de 3D
  canvasContainer.style.display = 'none'
  cssFallback.style.display = 'block'
}
```

### Memory leak por Three.js

**Sintoma:** El uso de memoria crece al navegar entre paginas.

```js
// OBLIGATORIO en el cleanup de cada componente Three.js:
onBeforeUnmount(() => {
  // 1. Dispose geometrias y materiales
  scene.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose())
      } else {
        child.material.dispose()
      }
    }
  })

  // 2. Dispose renderer
  renderer.dispose()
  renderer.forceContextLoss()

  // 3. Limpiar la escena
  scene.clear()

  // 4. Cancelar animation frame
  cancelAnimationFrame(animationId)
})
```

---

## CSS & Responsive

### Los tokens CSS no se aplican

**Sintoma:** `var(--color-accent-primary)` no funciona, se ve el fallback o nada.

```bash
# 1. tokens.css no esta importado
grep -rn "tokens" src/main.js src/App.vue src/styles/
# Debe existir: import './styles/tokens.css' en main.js o App.vue

# 2. El token no esta definido
grep "color-accent-primary" src/styles/tokens.css
# Debe existir en :root { }

# 3. Scope incorrecto
# Si el token esta en un scope especifico (.dark, .theme-x),
# verificar que el scope esta activo en el DOM
```

### Layout roto en mobile

**Sintoma:** Elementos se salen del viewport o se superponen en 375px.

```bash
# 1. Falta overflow hidden en el contenedor
# Agregar en App.vue o body:
# overflow-x: hidden;

# 2. Texto o imagenes no escalan
# Verificar clamp() en tipografia:
grep "clamp" src/styles/tokens.css
# Verificar max-width en imagenes:
# img { max-width: 100%; height: auto; }

# 3. Grid/flex no es responsive
# Verificar media queries o auto-fit/auto-fill en grids

# 4. Padding/margin fijo en px
# Cambiar a tokens responsive o usar clamp()
```

### Fuentes no cargan

**Sintoma:** Se ve la fuente fallback (serif/sans-serif) en vez de la elegida.

```bash
# 1. Google Fonts: verificar que el link esta en index.html
grep "fonts.googleapis" index.html
# Debe existir un <link> con preconnect y el font stylesheet

# 2. Self-hosted: verificar que los archivos estan en public/ o src/assets/
ls public/fonts/ src/assets/fonts/ 2>/dev/null

# 3. @font-face: verificar la declaracion
grep -rn "@font-face" src/ --include="*.css"
# El path del src: url() debe ser correcto

# 4. Preload para evitar FOUT:
# <link rel="preload" href="/fonts/display.woff2" as="font" type="font/woff2" crossorigin>
```

---

## Foundation Docs

### No se donde empezar con los docs

```
Siempre empezar por content-brief.md (content-first):

1. Abrir docs/_templates/content-brief.template.md
2. Copiar a docs/content-brief.md
3. Llenar seccion por seccion con copy REAL del cliente
4. Si no hay copy del cliente, inventar copy REALISTA (no lorem ipsum)
5. Recien despues pasar a design-brief.md
```

> Ver [00-project-init](00-project-init.md#paso-3-foundation-docs-docs) para el proceso detallado.

### Los docs tienen placeholders que no se como llenar

```
Template dice:           Como llenarlo:
────────────             ──────────────
"{{PROJECT_NAME}}"       Nombre real del proyecto ("Restaurante Nonna")
"{{HERO_HEADLINE}}"      Headline real ("La tradicion italiana, reinventada")
"{{ACCENT_COLOR}}"       Color hex real (#c4a35a)
"{{FONT_DISPLAY}}"       Font real ('Cormorant Garamond')

Si no sabes que poner, ejecutar el prompt correspondiente:
  content-brief: prompts/02-content/copy-framework.md
  design-brief:  prompts/01-identity/design-direction.md
  page-plans:    prompts/03-architecture/page-planning.md
  motion-spec:   prompts/04-motion/motion-personality.md
```

---

## Tabla de errores frecuentes

| Error | Causa probable | Solucion rapida |
|-------|---------------|-----------------|
| `Module not found` | Dependencia no instalada | `npm install` |
| `CORS error` | Backend no permite el origin | Configurar CORS en backend |
| `401 Unauthorized` | x-client header faltante | Verificar `src/config/api.js` |
| `404 on page refresh` | Server no redirige a index.html | Configurar SPA fallback |
| `[object Object]` en la vista | Response extraction incorrecta | Verificar wrapper del API |
| `Cannot read 'map' of undefined` | Store items es null/undefined | Verificar extraction + loading state |
| `ScrollTrigger warnings` | Falta cleanup en unmount | Agregar `ctx?.revert()` |
| `Canvas black` | WebGL no soportado o camara mal | Verificar WebGL + camera position |
| `var(--token) no funciona` | tokens.css no importado | Importar en main.js |
| `Build fails, dev works` | Import sin uso o var no definida | Limpiar imports, verificar vars |
| Imagenes rotas | Falta resolveImageUrl | Envolver URL con `resolveImageUrl()` |
| Mismo fade-up en todo | No se siguio motion-spec | Diversificar tecnicas por seccion |
| Fuente no carga | Link o @font-face incorrecto | Verificar index.html o CSS |
| Memory leak en navegacion | Falta dispose/revert | Agregar cleanup en onBeforeUnmount |
| Datos no actualizan al cambiar ruta | Vue reutiliza componente | Agregar `:key="$route.fullPath"` |

---

## Relacion con otras guias

- [00-project-init](00-project-init.md) -- Problemas al iniciar un proyecto
- [03-pegasuz-integration](03-pegasuz-integration.md) -- Arquitectura y anti-patterns Pegasuz
- [04-quality-standards](04-quality-standards.md) -- Auditorias que detectan estos problemas
- [05-delivery-checklist](05-delivery-checklist.md) -- Checklist que verifica que todo funcione
- [skill-dispatch-table](skill-dispatch-table.md) -- Skills para ejecutar auditorias
