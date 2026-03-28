# Prompt: CTA Strategy

> Fase: Content | Output: Mapa de CTAs por pagina y seccion
> Los CTAs son el motor de conversion. Cada uno tiene proposito.

---

## Prompt

```
Disenha la estrategia de CTAs para {{PROJECT_NAME}}.

PRINCIPIOS:
- Cada CTA es un verbo de accion (nunca "Click aqui" o "Enviar")
- Los CTAs siguen una progresion narrativa (explorar -> considerar -> actuar)
- Cada CTA tiene contexto (el usuario sabe que pasa al clickear)
- Maximo 2 CTAs visibles por viewport (primario + secundario)

MAPA DE CTAs:

Para cada pagina, definir:

| Pagina | Seccion | CTA primario | CTA secundario | Destino | Tipo visual |
|--------|---------|-------------|----------------|---------|-------------|
| Home | Hero | | | | btn-primary |
| Home | Services preview | | | | btn-secondary |
| Home | Portfolio preview | | | | btn-ghost |
| Home | CTA final | | | | btn-primary |
| About | Manifesto | | | | btn-secondary |
| Services | Individual | | | | btn-primary |
| Portfolio | Grid | | | | btn-ghost |
| Contact | Form | | | | btn-primary |
| Blog | Article | | | | btn-secondary |

PROGRESION NARRATIVA:
- Inicio del journey: CTAs exploratorios ("Descubrir", "Explorar", "Conocer")
- Mitad del journey: CTAs de consideracion ("Ver proceso", "Leer caso", "Comparar")
- Final del journey: CTAs de accion ("Agendar", "Solicitar", "Empezar")

TIPOS VISUALES:
- btn-primary: fondo accent, maximo impacto
- btn-secondary: outline/ghost, complementa al primario
- btn-ghost: solo texto + underline/arrow, minimo ruido visual

OUTPUT: tabla completa de CTAs con copy final, destino, y tipo visual.
```

---

## Ejemplos: buena vs mala estrategia

### Progresion narrativa para una firma de arquitectura

**Mala:**
| Seccion | CTA |
|---------|-----|
| Hero | Contactanos |
| Services | Contactanos |
| Portfolio | Contactanos |
| Footer | Contactanos |
(El mismo CTA generico repetido 4 veces. No hay progresion. No hay contexto.)

**Buena:**
| Seccion | CTA primario | CTA secundario | Destino |
|---------|-------------|----------------|---------|
| Hero | "Explorar nuestros proyectos" | "Conocer el estudio" | /portfolio |
| Services | "Ver un proyecto de vivienda" | — | /portfolio?filter=vivienda |
| Portfolio grid | "Ver caso completo" (por card) | — | /portfolio/:slug |
| Case study | "Iniciar un proyecto similar" | "Ver mas proyectos" | /contacto?ref=case |
| CTA final | "Agendar una consulta de diseno" | "Descargar brochure" | /contacto |
(Progresion: explorar -> considerar -> comparar -> actuar. Cada CTA tiene contexto y destino.)

---

## CTAs por industria

| Industria | CTA explorar | CTA considerar | CTA accion |
|-----------|-------------|----------------|------------|
| Gastronomia | "Descubrir el menu" | "Conocer al chef" | "Reservar mesa para hoy" |
| Inmobiliaria | "Explorar propiedades" | "Calcular hipoteca" | "Agendar visita presencial" |
| Fintech | "Simular rendimiento" | "Comparar planes" | "Abrir cuenta en 5 minutos" |
| E-commerce | "Explorar la coleccion" | "Ver guia de talles" | "Agregar al carrito" |
| SaaS | "Ver demo interactiva" | "Comparar planes" | "Empezar prueba gratuita" |
| Salud | "Conocer tratamientos" | "Leer testimonios de pacientes" | "Agendar turno online" |
| Educacion | "Explorar el programa" | "Ver proyectos de alumnos" | "Inscribirme ahora" |
| Legal | "Consultar areas de practica" | "Leer casos resueltos" | "Solicitar evaluacion gratuita" |

---

## Common errors

- **Mismo CTA en todas las secciones.** "Contactanos" en 5 lugares genera ceguera de CTA. El usuario deja de notarlos.
- **CTA de accion demasiado temprano.** Si el hero dice "Comprar ahora" antes de que el usuario sepa que vendes, hay friccion. Los CTAs tempranos deben ser exploratorios.
- **Mas de 2 CTAs por viewport.** Si hay 3 botones visibles al mismo tiempo, no hay jerarquia. El usuario no sabe que clickear.
- **CTAs sin destino definido.** Un boton que dice "Agendar consulta" pero no se sabe a donde lleva (form? Calendly? WhatsApp?) genera friccion en la implementacion.
- **Verbos pasivos o sustantivos como CTA.** "Informacion", "Contacto", "Portfolio" no son CTAs. Son labels de navegacion. Un CTA tiene verbo: "Ver portfolio", "Enviar consulta".
- **No considerar el CTA en mobile.** Un boton con "Agendar una consulta de diseno personalizada" se trunca en 375px. CTAs mobile deben ser mas cortos.

---

## Pipeline connection

```
Input: copy-framework.md (contexto de copy, servicios, publico)
     + page-planning.md (secciones donde van los CTAs)
Output de este prompt -> Mapa de CTAs por pagina y seccion
  Se integra en: docs/content-brief.md seccion 7
  Alimenta:
    - component-planning.md (variantes de boton: primary, secondary, ghost)
    - section-narratives.md (donde aparece cada CTA en la narrativa)
    - navigation-flow.md (cross-linking entre paginas)
```

## Output esperado

Mapa de CTAs que se integra en `docs/content-brief.md` seccion 7.
