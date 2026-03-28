---
name: awwwards-design-critique
description: Critique de diseño nivel Awwwards para los 10 sitios, iterando mejoras hasta alcanzar 9/10 mínimo
---

Tarea: Ejecutar un critique de diseño EXTREMADAMENTE EXIGENTE sobre los 10 proyectos creados en el escritorio, con estándares de Awwwards Site of the Day (SOTD). Iterar mejoras hasta que CADA proyecto alcance mínimo 9/10.

IMPORTANTE: Esta tarea se ejecuta DESPUÉS de "create-10-demo-sites". Los proyectos deben existir en el escritorio.

---

## Criterios de evaluación (escala Awwwards)

Cada proyecto se evalúa en 4 categorías (igual que Awwwards), cada una de 0 a 10:

### 1. DESIGN (peso: 30%)
- **Originalidad visual**: ¿Se ve como algo que nunca viste? ¿O es otro template más?
- **Jerarquía visual**: ¿El ojo sabe exactamente dónde ir en cada sección?
- **Uso del espacio**: ¿El whitespace es intencional y genera ritmo, o es vacío muerto?
- **Paleta de color**: ¿Es sofisticada, con contraste correcto, accesible (WCAG AA mínimo)?
- **Tipografía**: ¿La escala es fluida? ¿Los pesos crean jerarquía? ¿El tracking es premium?
- **Consistencia**: ¿Los tokens se usan en TODO el sitio sin excepciones?
- **Craft**: ¿Los detalles son impecables? ¿Bordes, sombras, radii, íconos — todo alineado?
- **Identidad**: ¿El sitio GRITA quién es el cliente en los primeros 3 segundos?

Preguntas clave:
- ¿Podrías distinguir este sitio de los otros 9 con los ojos entrecerrados?
- ¿Hay algún elemento genérico que se sienta "template"?
- ¿Los gradientes/sombras/efectos son sutiles y con propósito, o decorativos?

### 2. CREATIVITY (peso: 25%)
- **Hero impact**: ¿El hero detiene el scroll? ¿Genera un "wow" inmediato?
- **Narrativa visual**: ¿El scroll cuenta una historia coherente sección por sección?
- **Ritmo**: ¿Hay alternancia entre secciones densas y respiraciones (⚡/🧘)?
- **Sorpresa**: ¿Hay al menos 2-3 momentos inesperados que rompen la monotonía?
- **3D/WebGL**: ¿El elemento 3D es inmersivo y se integra con el diseño, o es un parche pegado?
- **Interactividad**: ¿Hay interacciones que invitan a explorar (hover states, cursores custom, elementos reactivos)?
- **Layout**: ¿Hay secciones con layouts creativos (asimétricos, overlapping, broken grid)?

Preguntas clave:
- ¿Después de ver el hero, querés seguir scrolleando?
- ¿Hay algún momento "oh, eso estuvo bueno" durante el scroll?
- ¿El 3D se siente parte del diseño o un demo técnico suelto?

### 3. DEVELOPMENT / UX (peso: 25%)
- **Performance percibida**: ¿Se siente rápido? ¿Los assets cargan sin saltos?
- **Responsive**: ¿Mobile es una experiencia de primera clase, no una versión recortada?
- **Transiciones de página**: ¿Son fluidas y con propósito?
- **Scroll experience**: ¿Lenis funciona suave? ¿ScrollTrigger está bien calibrado?
- **Estados**: ¿Loading states son elegantes (skeleton, shimmer), no spinners genéricos?
- **Error handling**: ¿Los error states tienen personalidad y CTA de recuperación?
- **Navegación**: ¿Es intuitiva? ¿Puedo llegar a cualquier página en ≤ 3 clicks?
- **Accessibility**: ¿Skip link, focus visible, alt texts, semantic HTML, keyboard nav?
- **Código limpio**: ¿Componentes bien estructurados, sin CSS repetido, tokens usados?

### 4. CONTENT (peso: 20%)
- **Copy quality**: ¿Los textos son específicos y con voz propia, o genéricos?
- **Headlines**: ¿Son memorables? ¿Max 3-5 palabras en hero?
- **CTAs**: ¿Verbos de acción específicos ("Reservá tu mesa", no "Enviar")?
- **Microcopy**: ¿Empty states, tooltips, labels — todos con personalidad?
- **SEO**: ¿Title único, meta description única, OG tags, H1 único por página?
- **Storytelling**: ¿El contenido sigue un arco narrativo coherente por página?

---

## Proceso por proyecto

Para CADA uno de los 10 proyectos:

### Paso 1 — Evaluación inicial
1. Leer docs/design-brief.md, docs/content-brief.md, docs/page-plans.md, docs/motion-spec.md
2. Leer TODOS los archivos .vue (views y components)
3. Leer src/styles/tokens.css
4. Evaluar cada categoría de 0 a 10 con justificación detallada
5. Calcular score ponderado: (Design×0.30 + Creativity×0.25 + Development×0.25 + Content×0.20)
6. Producir reporte inicial

### Paso 2 — Lista de mejoras priorizadas
Clasificar cada hallazgo como:
- 🔴 **DEAL-BREAKER** (baja más de 1 punto, resolver primero)
- 🟡 **NOTABLE** (baja 0.3-1 punto, resolver segundo)
- 🟢 **POLISH** (baja 0.1-0.3, resolver si hay tiempo)
- ✨ **ELEVATE** (no baja puntos pero subiría el score — oportunidad de excelencia)

### Paso 3 — Aplicar mejoras (ITERAR)
1. Resolver TODOS los deal-breakers
2. Resolver TODOS los notables
3. Aplicar polish y elevate hasta llegar a 9/10
4. Re-evaluar después de cada ronda de cambios
5. **REPETIR hasta que el score sea ≥ 9.0**

### Paso 4 — Evaluación final
Producir el reporte final con el score de cada categoría

---

## Checklist de errores comunes que bajan puntos (buscar activamente)

### Design deal-breakers:
- [ ] Secciones que se ven como "bloques apilados" sin conexión visual
- [ ] Tipografía sin escala fluida (tamaños fijos en px)
- [ ] Colores hardcodeados en vez de tokens CSS
- [ ] Spacing inconsistente (un componente usa 24px, otro 32px sin razón)
- [ ] Botones genéricos (rectangulares, sin hover state elaborado)
- [ ] Cards todas iguales (mismo layout repetido 6 veces)
- [ ] Footer genérico (3 columnas con links, sin personalidad)
- [ ] Iconos de diferentes estilos/librerías mezclados

### Creativity deal-breakers:
- [ ] Hero con solo texto centrado y un botón (zero visual impact)
- [ ] Todas las secciones usan el mismo fade-up de 32px
- [ ] 3D element que es solo una esfera o partículas básicas sin integración
- [ ] Scroll lineal sin ningún momento de pin, parallax, o sorpresa
- [ ] Hover states que solo cambian opacity o color (sin transform, sin clip-path)
- [ ] Navigation estándar sin ningún detalle creativo

### Development deal-breakers:
- [ ] No responsive o mobile broken
- [ ] Animaciones en width/height/top/left (no transform/opacity)
- [ ] Sin prefers-reduced-motion
- [ ] Sin loading/error states
- [ ] Sin lazy loading en imágenes
- [ ] GSAP sin cleanup (memory leak)
- [ ] Sin skip-link o a11y básico

### Content deal-breakers:
- [ ] Lorem ipsum o placeholder text visible
- [ ] Headlines genéricos ("Welcome to our website")
- [ ] CTAs genéricos ("Submit", "Click here", "Learn more")
- [ ] Sin meta tags
- [ ] Testimonios que suenan falsos o genéricos

---

## Técnicas para subir de 8 a 9+ (aplicar si falta)

### Design elevation:
- Agregar micro-texturas (grain overlay sutil, noise en gradientes)
- Usar clip-path o mask para shapes orgánicas
- Implementar cursor custom que reaccione al contexto
- Agregar dividers creativos entre secciones (no líneas rectas)
- Usar mix-blend-mode para overlaps sofisticados
- Implementar color transitions suaves entre secciones (fondo que cambia con scroll)

### Creativity elevation:
- Agregar text splitting (char-by-char o word-by-word reveals)
- Implementar magnetic buttons (se acercan al cursor)
- Pin + scrub en al menos una sección (scroll-linked animation)
- Marquee/ticker en una sección (loop infinito suave)
- Parallax con profundidad (no solo Y, también escala)
- Stagger orquestado (elementos que entran como coreografía, no todos a la vez)
- Hover sobre cards: escala + sombra elevada + contenido extra revealed

### Development elevation:
- Skeleton screens en vez de spinners
- View transitions API si el browser lo soporta
- Intersection Observer para lazy-load preciso
- Smooth scroll-to-anchor con offset calculado
- Focus-visible styles elegantes (no el default azul)

### Content elevation:
- Headlines de 2-3 palabras con punch (no frases largas)
- CTAs con urgencia natural ("Reservá hoy", "Empezá gratis", "Descubrí más")
- Microcopy con personalidad en empty states y 404
- JSON-LD structured data por tipo de página

---

## Output por proyecto

```
═══════════════════════════════════════════
PROJECT: [nombre]
═══════════════════════════════════════════

ROUND 1 — Initial Score
─────────────────────────
Design:      X/10  [justificación en 2-3 líneas]
Creativity:  X/10  [justificación]
Development: X/10  [justificación]
Content:     X/10  [justificación]
─────────────────────────
WEIGHTED:    X.X/10

DEAL-BREAKERS FOUND: N
[lista]

IMPROVEMENTS APPLIED:
[lista de cambios hechos]

ROUND N — Final Score
─────────────────────────
Design:      X/10
Creativity:  X/10
Development: X/10
Content:     X/10
─────────────────────────
WEIGHTED:    X.X/10  ✅ PASSED (≥ 9.0)

REMAINING POLISH (nice-to-have):
[lista si queda algo menor]
```

---

## Resumen final

Al terminar los 10 proyectos, crear C:\Users\mateo\Desktop\maqueta\AWWWARDS-CRITIQUE-REPORT.md con:
- Tabla resumen de los 10 proyectos con scores finales
- Top 3 proyectos mejor logrados
- Patrones comunes de mejora que se repitieron
- Lecciones aprendidas para incorporar a la maqueta (mejorar templates, skills, o guides)
- Recomendaciones para el pipeline de la maqueta basadas en lo aprendido

También documentar en PROCESS-LOG.md