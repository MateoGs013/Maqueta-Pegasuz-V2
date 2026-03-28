# Prompt: Competitive Analysis

> Fase: Discovery | Output: Analisis de competidores y oportunidades
> Ejecutar con las URLs de competidores del Client Intake.

---

## Prompt

```
Analiza los siguientes sitios web de competidores: {{COMPETITOR_URLS}}

Para cada uno evalua:

1. PRIMERA IMPRESION (3 segundos)
   - Que comunica inmediatamente?
   - Es claro que hacen y para quien?
   - Que emocion genera?

2. DISENO VISUAL
   - Paleta de colores (modo, tono general)
   - Tipografia (serif/sans, personalidad)
   - Uso del espacio (denso vs aireado)
   - Calidad de imagenes/fotografia
   - Coherencia visual (se siente como una marca unificada?)

3. EXPERIENCIA DE USUARIO
   - Navegacion (clara, intuitiva, confusa?)
   - Flujo principal (cuantos clicks al objetivo?)
   - Mobile (responsive, app-like, basico?)
   - Velocidad percibida

4. MOTION Y INTERACTIVIDAD
   - Tiene animaciones? Que tipo?
   - 3D/WebGL? Efectos especiales?
   - Hover interactions?
   - Se siente vivo o estatico?

5. CONTENIDO Y COPY
   - Tono de voz (formal, casual, tecnico)
   - Headline principal (generico o especifico?)
   - CTAs (claros, persuasivos, o genericos?)
   - Social proof (testimonios, logos, numeros)

DESPUES del analisis individual, producir:

## MAPA DE OPORTUNIDADES

| Area | Lo que hacen bien (NO copiar) | Lo que hacen mal (OPORTUNIDAD) |
|------|------------------------------|-------------------------------|
| Visual | | |
| UX | | |
| Motion | | |
| Content | | |
| Tech | | |

## DIFERENCIACION

3 areas concretas donde nuestro proyecto puede superar a TODOS los competidores:
1. _____
2. _____
3. _____
```

---

## Ejemplos: buena vs mala respuesta

### Primera impresion

**Mala:** "Se ve profesional y moderno."
(No dice nada util. Todos los competidores "se ven profesionales".)

**Buena:** "Comunica confianza institutional inmediatamente: hero con foto de equipo en oficina, headline directo 'Transformamos negocios desde 2005'. Pero se siente frio — no hay personalidad ni motion. Parece un template corporativo editado."
(Especifico, con elementos concretos y una opinion formada que guia diferenciacion.)

### Mapa de oportunidades

**Mala:**
| Area | Bien | Mal |
| Visual | Buenos colores | Podria mejorar |

**Buena:**
| Area | Bien (NO copiar) | Mal (OPORTUNIDAD) |
| Motion | Competidor A tiene scroll-triggered reveals en portfolio | Ninguno tiene 3D/WebGL. TODOS son estaticos. Oportunidad: experiencia inmersiva. |
| Content | Competidor B tiene testimonios con metricas ($2M ahorro) | Todos usan headlines genericos ("Soluciones a medida"). Oportunidad: copy especifico con numeros. |

---

## Variaciones por industria

Aspectos especificos a evaluar segun rubro:

| Industria | Evaluar adicionalmente |
|-----------|----------------------|
| Gastronomia | Fotografia de platos, integracion con delivery, carta digital, reservas online, Google Maps |
| Inmobiliaria | Calidad del listado, filtros de busqueda, mapa interactivo, tours virtuales, velocidad de carga con muchas imagenes |
| E-commerce | Flujo de checkout (cuantos pasos), fotografia de producto, filtros, recomendaciones, mobile UX del carrito |
| SaaS | Pricing page clarity, demo/trial flow, feature comparison, docs/API, onboarding |
| Salud | Confianza/credenciales visibles, facilidad para agendar turnos, informacion de seguros, testimonios con consentimiento |
| Fintech | Seguridad percibida, claridad del producto, regulaciones visibles, onboarding flow, dashboard UX |

---

## Common errors

- **Analizar solo lo visual.** Un competidor puede tener un diseno mediocre pero excelente UX y conversion. Evaluar todas las capas.
- **Copiar lo que hacen bien.** El objetivo es DIFERENCIARSE, no converger. Lo que hacen bien se nota, lo que hacen mal es la oportunidad.
- **Analizar pocos competidores.** 3-5 es el minimo. Con 1-2 no se pueden ver patrones del sector.
- **No visitar en mobile.** Muchos sitios se ven bien en desktop pero colapsan en mobile. Eso es una oportunidad enorme.
- **Olvidar la velocidad.** Abrir DevTools > Network. Si un competidor carga en 8 segundos, esa es una ventaja competitiva gratuita.
- **No documentar URLs y capturas.** Las referencias visuales se pierden. Guardar URLs y describir lo que se ve para que el documento sea autosuficiente.

---

## Pipeline connection

```
Input: client-intake.md (URLs de competidores, rubro)
Output de este prompt -> Analisis competitivo + Mapa de oportunidades
  Alimenta directamente:
    - brand-questionnaire.md (benchmark visual, anti-referencias)
    - design-direction.md (diferenciacion visual, oportunidades)
    - copy-framework.md (tono de voz, CTAs que otros no usan)
```

## Output esperado

Documento de analisis competitivo que informa las decisiones de diferenciacion visual.

## Siguiente paso

Usar las oportunidades identificadas en `brand-questionnaire.md` y luego `01-identity/design-direction.md`.
