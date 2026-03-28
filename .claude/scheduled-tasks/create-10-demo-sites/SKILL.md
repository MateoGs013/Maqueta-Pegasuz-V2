---
name: create-10-demo-sites
description: Crear 10 proyectos completos con la maqueta en el escritorio, cada uno con identidad única
---

Tarea: Crear 10 sitios web completos usando la maqueta en C:\Users\mateo\Desktop\maqueta\ como base. Cada proyecto se crea en C:\Users\mateo\Desktop\ como carpeta independiente.

IMPORTANTE: Cada proyecto debe tener identidad visual COMPLETAMENTE ÚNICA. Nunca repetir paleta, tipografía, atmósfera o motion personality entre proyectos.

---

## Los 10 proyectos

### 1. C:\Users\mateo\Desktop\noctua-interiors\
**Rubro:** Estudio de diseño de interiores de lujo — Barcelona
**Páginas:** Home, About, Portfolio, Services, Contact
**Estética:** Dark elegante, acentos dorados, serif display, motion luxury slow
**3D:** Partículas doradas flotantes en hero

### 2. C:\Users\mateo\Desktop\verde-organics\
**Rubro:** E-commerce de cosmética orgánica
**Páginas:** Home, Shop, Product Detail, About, Cart, Contact
**Estética:** Tonos tierra y verde bosque, sans-serif limpia, motion fluid organic
**3D:** Shader de agua/naturaleza en hero

### 3. C:\Users\mateo\Desktop\pulse-fintech\
**Rubro:** Plataforma fintech / app de pagos
**Páginas:** Home (landing), Features, Pricing, About, Contact
**Estética:** Azul profundo + cyan eléctrico, monospace + geometric sans, motion sharp electric
**3D:** Grid de datos 3D con partículas conectadas

### 4. C:\Users\mateo\Desktop\fuego-gastrobar\
**Rubro:** Gastrobar de autor — Buenos Aires
**Páginas:** Home, Menu, Reservas, About, Gallery
**Estética:** Negro carbón + rojo fuego + crema, display bold, motion editorial measured
**3D:** Efecto de humo/fuego en hero

### 5. C:\Users\mateo\Desktop\atlas-architects\
**Rubro:** Estudio de arquitectura contemporánea
**Páginas:** Home, Projects, Project Detail, Studio, Contact
**Estética:** Blanco puro + negro + un accent mínimo, grotesque sans, motion mechanical grid
**3D:** Wireframe de edificio rotando

### 6. C:\Users\mateo\Desktop\nova-creative\
**Rubro:** Agencia creativa digital
**Páginas:** Home, Work, Case Study, Services, About, Contact
**Estética:** Gradientes vibrantes (violeta→rosa→naranja), variable font bold, motion sharp electric
**3D:** Campo de partículas reactivo al mouse

### 7. C:\Users\mateo\Desktop\serene-wellness\
**Rubro:** Centro de bienestar / spa de lujo
**Páginas:** Home, Treatments, About, Gallery, Booking, Contact
**Estética:** Beige cálido + sage green + terracotta, serif delicada, motion luxury slow
**3D:** Ondas de agua calmantes

### 8. C:\Users\mateo\Desktop\bolt-saas\
**Rubro:** SaaS de project management para equipos remotos
**Páginas:** Home (landing), Features, Pricing, Integrations, About, Contact
**Estética:** Gris neutro + amarillo eléctrico, system font stack, motion sharp snappy
**3D:** Constelación de nodos conectados

### 9. C:\Users\mateo\Desktop\heritage-realestate\
**Rubro:** Inmobiliaria de propiedades premium — Montevideo
**Páginas:** Home, Properties, Property Detail, About, Services, Contact
**Estética:** Navy + dorado + mármol blanco, transitional serif, motion editorial measured
**3D:** Recorrido 3D de propiedad (cámara orbital)

### 10. C:\Users\mateo\Desktop\kodex-education\
**Rubro:** Plataforma de cursos de programación online
**Páginas:** Home (landing), Courses, Course Detail, Pricing, About, Contact
**Estética:** Dark mode + verde terminal + acentos cyan, monospace + sans, motion mechanical grid
**3D:** Matrix de código cayendo / partículas de datos

---

## Para CADA proyecto, ejecutar este pipeline completo:

### Fase 1 — Scaffold
1. Crear la carpeta del proyecto en el escritorio
2. Copiar la estructura de C:\Users\mateo\Desktop\maqueta\_project-scaffold\ al nuevo proyecto
3. Copiar .claude/ del maqueta al nuevo proyecto (skills, agents, settings)
4. Copiar CLAUDE.md al nuevo proyecto
5. Crear .env con VITE_API_URL=http://localhost:3000/api y VITE_CLIENT_SLUG=<slug-del-proyecto>
6. Ajustar package.json con el nombre del proyecto

### Fase 2 — Foundation docs
Crear docs/ con los 4 archivos obligatorios COMPLETOS (no templates vacíos):
1. docs/content-brief.md — Copy REAL y específico para este negocio (headlines, servicios, CTAs, testimonios inventados pero realistas)
2. docs/design-brief.md — Tokens CSS completos con hex values, font families reales de Google Fonts, spacing, radii, shadows, atmospheric system
3. docs/page-plans.md — Cada página con sus secciones, propósitos narrativos, layout, contenido referenciado, motion referenciado. Respetar mínimos de secciones.
4. docs/motion-spec.md — Hero timeline con timestamps, scroll reveal defaults, hover interactions, técnicas por sección

### Fase 3 — Implementar tokens
Llenar src/styles/tokens.css con TODOS los valores del design-brief (no dejar variables vacías)

### Fase 4 — Crear las páginas
Para cada página del proyecto:
1. Crear el View en src/views/
2. Implementar TODAS las secciones del page-plan con HTML semántico
3. Aplicar los tokens CSS del design-brief
4. Implementar responsive (mobile-first)
5. Agregar meta tags (title, description, OG)
6. Implementar loading y error states donde corresponda

### Fase 5 — Componentes reutilizables
Crear en src/components/ los componentes compartidos:
- AppHeader.vue (navigation responsive con hamburger mobile)
- AppFooter.vue (links, social, copyright)
- Componentes específicos del rubro (PropertyCard, ProductCard, MenuItem, etc.)

### Fase 6 — Motion
Para cada sección:
1. Implementar animaciones GSAP siguiendo el motion-spec
2. Cada sección usa técnica DIFERENTE (no todo fade-up)
3. gsap.context() + cleanup en onBeforeUnmount
4. prefers-reduced-motion guard

### Fase 7 — 3D
Implementar el elemento Three.js especificado:
- Usar TresJS (@tresjs/core) para Vue 3
- Componente dedicado en src/components/three/
- Responsive y performante
- Fallback para dispositivos sin WebGL

### Fase 8 — Router y App
1. Configurar todas las rutas con lazy loading
2. Integrar AppHeader y AppFooter en App.vue
3. Page transitions con Vue transition
4. Lenis smooth scroll

### Fase 9 — Init git
1. git init
2. Crear .gitignore
3. git add -A && git commit -m "Initial commit: [nombre] — [descripción corta]"

---

## Reglas obligatorias

- NUNCA copiar código entre proyectos — cada uno se construye desde cero
- NUNCA repetir la misma paleta de colores
- NUNCA repetir la misma combinación tipográfica
- NUNCA usar la misma motion personality en dos proyectos
- NUNCA el mismo tipo de efecto 3D en dos proyectos
- Cada proyecto debe poder hacer npm install && npm run dev sin errores
- Todo el copy debe ser realista (no lorem ipsum)
- Todas las imágenes usar placeholder (https://placehold.co/WxH) con dimensiones correctas

Al terminar los 10, documentar un resumen en C:\Users\mateo\Desktop\maqueta\PROCESS-LOG.md con el estado de cada proyecto.