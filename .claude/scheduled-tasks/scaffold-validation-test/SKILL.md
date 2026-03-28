---
name: scaffold-validation-test
description: Validar que el _project-scaffold compile y funcione como proyecto Vue 3 real
---

Tarea: Verificar que el _project-scaffold en C:\Users\mateo\Desktop\maqueta\_project-scaffold\ es un proyecto Vue 3 funcional.

Pasos:
1. Leer todos los archivos del scaffold: package.json, vite.config.js, main.js, App.vue, router/index.js, stores/content.js, config/api.js, styles/tokens.css, .env.example
2. Verificar:
   - package.json tiene TODAS las dependencias necesarias (vue, vue-router, pinia, axios, gsap, lenis, three, @tresjs/core si aplica)
   - vite.config.js tiene alias @ configurado correctamente
   - main.js bootstrapea Pinia antes de montar, importa tokens.css
   - App.vue tiene router-view con transition, skip-link a11y, Lenis setup
   - router/index.js usa createWebHistory (no hash), lazy loading, scrollBehavior
   - stores/content.js extrae data.contents correctamente (response extraction de Pegasuz)
   - api.js tiene interceptor x-client, resolveImageUrl exportado
   - tokens.css tiene TODOS los tokens documentados en docs/_templates/design-brief.template.md
   - .env.example tiene VITE_API_URL y VITE_CLIENT_SLUG
3. Verificar que NO falten archivos esenciales:
   - index.html (necesario para Vite!)
   - Placeholder para HomeView.vue y NotFoundView.vue (referenciados en router)
4. Crear los archivos faltantes
5. Verificar que se pueda instalar y levantar: copiar a una carpeta temporal, npm install, npm run dev
6. Documentar hallazgos y correcciones en PROCESS-LOG.md