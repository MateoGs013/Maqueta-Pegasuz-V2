# Guide: Troubleshooting

> Problemas comunes y como resolverlos.
> Organizado por area para ir directo al problema.

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

---

## API & Pegasuz

### Las requests al API fallan (CORS, 401, 404)

**Sintoma:** Errores de red en DevTools, datos no cargan.

```bash
# 1. CORS error
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
Direct array:  Properties, Services, Categories, Tags
               -> this.items = data

Wrapped:       Posts (data.posts), Projects (data.projects),
               Testimonials (data.testimonials), Contacts (data.contacts)
               -> this.items = data.<entity>

CMS:           SiteContent
               -> this.contents = data.contents
```

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

# 3. Loading state atrapado
# El template muestra v-if="store.loading" pero la request fallo silenciosamente
# Verificar que el store tiene error handling:
grep -n "catch\|error" src/stores/*.js

# 4. Componente no registrado
# El componente se importo pero no se usa en el template
# Verificar que el import y el uso coinciden
```

### Router: las rutas no funcionan (404 en refresh)

**Sintoma:** Navegacion funciona con clicks pero da 404 al refrescar la pagina.

```bash
# Esto pasa porque el server no sabe que es una SPA
# Solucion para Vite dev server (ya viene configurado):
# En produccion, configurar el servidor web:

# Nginx:
# location / {
#   try_files $uri $uri/ /index.html;
# }

# Verificar que el router usa history mode (no hash):
grep -n "createWebHistory\|createWebHashHistory" src/router/index.js
# Debe usar createWebHistory, NO createWebHashHistory
```

### Componente no se actualiza cuando cambia la ruta

**Sintoma:** Navegar entre `/properties/1` y `/properties/2` no actualiza el contenido.

```
Causa: Vue reutiliza el componente si la ruta solo cambia el param.
Solucion: Usar key en el router-view o watch en el param.
```

```vue
<!-- Opcion 1: Key en router-view -->
<router-view :key="$route.fullPath" />

<!-- Opcion 2: Watch en el componente -->
<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
watch(() => route.params.id, (newId) => {
  store.fetchById(newId)
})
</script>
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

```
Causa: No se hizo cleanup en onBeforeUnmount.
Solucion: Siempre usar gsap.context() y revert().
```

```js
// PATRON CORRECTO (obligatorio):
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
# Solucion: usar nextTick() o crear dentro de onMounted

# 2. El scroller no es el default (window)
# Si usas Lenis o un scroll container custom, configurar scroller:
# ScrollTrigger.scrollerProxy() o ScrollTrigger.defaults({ scroller: ... })

# 3. El elemento tiene height: 0 o display: none
# ScrollTrigger necesita que el elemento tenga dimensiones reales

# 4. Lenis no esta sincronizado con ScrollTrigger
# Verificar que Lenis hace ScrollTrigger.update() en cada frame
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

# 4. Los objetos estan fuera del frustum
# Verificar que las posiciones de los objetos estan dentro del rango de la camara

# 5. El renderer no tiene el tamano correcto
# Verificar que se hace renderer.setSize(width, height)
```

### Performance mala en mobile (FPS bajos)

**Sintoma:** La escena 3D lagea en dispositivos moviles.

```
Soluciones:
1. Reducir geometria en mobile (menos particulas, meshes simples)
2. Usar pixelRatio limitado: renderer.setPixelRatio(Math.min(2, devicePixelRatio))
3. Desactivar sombras en mobile
4. Usar LOD (Level of Detail) para objetos complejos
5. O directamente desactivar 3D en mobile y usar fallback CSS

Ejemplo de deteccion mobile:
const isMobile = window.innerWidth < 768
if (isMobile) {
  // Mostrar fallback CSS en vez de 3D
  // O reducir complejidad significativamente
}
```

### Memory leak por Three.js

**Sintoma:** El uso de memoria crece al navegar entre paginas.

```js
// OBLIGATORIO en el cleanup:
onBeforeUnmount(() => {
  // Dispose geometrias
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

  // Dispose renderer
  renderer.dispose()
  renderer.forceContextLoss()

  // Limpiar la escena
  scene.clear()
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
# Agregar: overflow-x: hidden en body o app root

# 2. Texto o imagenes no escalan
# Verificar clamp() en tipografia y max-width en imagenes

# 3. Grid/flex no es responsive
# Verificar media queries o auto-fit/auto-fill en grids

# 4. Padding/margin fijo en px
# Cambiar a tokens responsive o usar clamp()

# Verificar responsive:
# Prompt: "Ejecutar responsive-review"
```

---

## Pegasuz-specific

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
```

---

## Quick diagnostic

Cuando algo no funciona y no sabes por donde empezar:

```
1. Abrir DevTools > Console
   -> Errores de JavaScript? Arreglar primero.

2. Abrir DevTools > Network
   -> Requests fallando? Verificar URL, headers, status code.

3. Verificar .env
   -> Variables correctas? API accesible?

4. npm run build
   -> Compila limpio? Si no, el error dice exactamente que falta.

5. Ejecutar la auditoria relevante:
   "Ejecutar [a11y|seo|responsive|css|perf]-audit"
   -> El reporte te dice exactamente que arreglar.
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
| Imagenes rotas | Falta resolveImageUrl | Envolver URL con resolveImageUrl() |
| Mismo fade-up en todo | No se siguio motion-spec | Diversificar tecnicas por seccion |
