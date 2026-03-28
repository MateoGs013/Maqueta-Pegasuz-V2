# Prompt: Scroll Choreography

> Fase: Motion | Output: Mapa detallado de comportamiento por scroll
> Complemento al motion-spec para experiencias scroll-driven.

---

## Prompt

```
Disena la coreografia de scroll completa para {{PAGE_NAME}} de {{PROJECT_NAME}}.

El scroll es la interaccion principal del usuario. Cada pixel de scroll
debe sentirse intencional.

MAPA DE SCROLL (por seccion, en orden):

| Viewport range | Seccion | Que pasa al scrollear |
|---------------|---------|----------------------|
| 0-100vh | Hero | {{BEHAVIOR}} |
| 100vh-200vh | {{SEC}} | {{BEHAVIOR}} |
| 200vh-300vh | {{SEC}} | {{BEHAVIOR}} |
| ... | ... | ... |

TECNICAS DE SCROLL:

1. PARALLAX LAYERS
   | Elemento | Speed | Rango | Direccion |
   |---------|-------|-------|-----------|
   | {{ELEMENT}} | {{0.5-1.5}} | {{RANGE}} | vertical/horizontal |

2. PIN SECTIONS (si aplica)
   | Seccion | Pin duration | Que pasa mientras esta pineado |
   |---------|-------------|-------------------------------|
   | {{SEC}} | {{DURATION}} | {{STEPS}} |

3. SCRUB ANIMATIONS (progreso ligado al scroll)
   | Elemento | Propiedad | Valor inicio | Valor fin | Rango scroll |
   |---------|-----------|-------------|----------|-------------|
   | {{ELEM}} | {{PROP}} | {{START}} | {{END}} | {{RANGE}} |

4. COLOR TRANSITIONS (si cambia el bg entre secciones)
   | De seccion | A seccion | Color inicio | Color fin |
   |-----------|----------|-------------|----------|
   | {{FROM}} | {{TO}} | {{COLOR}} | {{COLOR}} |

5. SCROLL INDICATORS
   - Indicador de "scroll down" en hero: si/no
   - Progress bar global: si/no
   - Section indicators: si/no

PERFORMANCE:
- Throttle: requestAnimationFrame
- will-change: solo durante scroll activo
- Mobile: reducir o eliminar parallax, simplificar pins
```

---

## Output esperado

Mapa de scroll que se integra en `docs/motion-spec.md` seccion 7.
