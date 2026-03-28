# Prompt: Brand Questionnaire

> Fase: Discovery | Output: Perfil de marca para guiar identidad visual
> Ejecutar despues del Client Intake.

---

## Prompt

```
Basandote en la informacion del client intake, necesito que definas el perfil de marca:

1. PERSONALIDAD DE MARCA (elegir 3-5 adjetivos y justificar)
   Opciones:
   - Sofisticado / Elegante / Premium / Exclusivo
   - Moderno / Innovador / Disruptivo / Tech-forward
   - Calido / Humano / Accesible / Cercano
   - Audaz / Provocativo / Experimental / Creativo
   - Sereno / Minimal / Limpio / Zen
   - Robusto / Confiable / Solido / Profesional
   - Energetico / Dinamico / Vibrante / Playful
   - Poetico / Artistico / Evocador / Atmosferico

2. ESPECTRO DE POSICIONAMIENTO
   Marcar donde cae en cada eje:
   - Formal ◄————————► Casual
   - Premium ◄————————► Accesible
   - Tradicional ◄————————► Innovador
   - Maximalista ◄————————► Minimalista
   - Serio ◄————————► Playful
   - Corporate ◄————————► Artistic

3. ANALOGIAS DE MARCA
   "Si esta marca fuera un/a _____, seria _____"
   - Si fuera un auto: _____ (y por que)
   - Si fuera un hotel: _____ (y por que)
   - Si fuera una pelicula: _____ (y por que)
   - Si fuera una tipografia: _____ (y por que)

4. ANTI-REFERENCIAS
   Que NO quiere ser:
   - No quiere parecer _____ (ej: "una startup generica")
   - No quiere sentirse como _____ (ej: "un template de WordPress")
   - No quiere comunicar _____ (ej: "barato o masivo")

5. BENCHMARK VISUAL
   De los competidores analizados y las URLs de inspiracion:
   - Que elementos tomar como referencia (layout, motion, atmosfera)
   - Que elementos evitar
   - Donde superar a la competencia visualmente

El output debe ser concreto y actionable — cada punto debe poder traducirse
a una decision de diseno (color, tipografia, spacing, motion, atmosfera).
```

---

## Ejemplos: buena vs mala respuesta

### Personalidad de marca

**Mala:** "Queremos ser innovadores y profesionales."
(Generico. Aplica a cualquier empresa. No se puede traducir a una decision de diseno.)

**Buena:** "Sofisticado + Calido + Poetico. Sofisticado porque nuestros clientes son exigentes y esperan atencion al detalle. Calido porque somos un equipo chico y cercano, no una corporacion. Poetico porque nuestro trabajo de interiorismo tiene una capa artistica que lo diferencia de la competencia funcionalista."
(Cada adjetivo tiene justificacion anclada al negocio. Se puede traducir a decisiones concretas.)

### Analogia de marca

**Mala:** "Si fuera un auto, seria un BMW." (Sin explicacion. BMW tiene muchos modelos y significados.)

**Buena:** "Si fuera un auto, seria un Volvo XC90: premium pero no ostentoso, seguridad como prioridad, diseno escandinavo limpio, familia pero con estilo."
(El modelo especifico + las razones dan informacion accionable.)

---

## Variaciones por industria

| Industria | Analogias mas utiles | Ejes de posicionamiento extra |
|-----------|---------------------|------------------------------|
| Gastronomia | "Si fuera un restaurante en otra ciudad...", "Si fuera un ingrediente..." | Gourmet vs Casual, Local vs Internacional |
| Fintech | "Si fuera un banco tradicional...", "Si fuera una app que ya existe..." | Regulado vs Disruptivo, B2B vs B2C |
| Moda | "Si fuera una marca de ropa...", "Si fuera una decada estetica..." | Fast fashion vs Slow fashion, Streetwear vs Haute couture |
| Salud | "Si fuera un espacio fisico...", "Si fuera un color..." | Clinico vs Holistico, Tecnologico vs Humano |
| Inmobiliaria | "Si fuera un barrio...", "Si fuera un material de construccion..." | Boutique vs Masivo, Tradicional vs Moderno |

---

## Common errors

- **Elegir personalidades contradictorias sin resolver la tension.** "Minimalista + Maximalista" no funciona a menos que se defina como coexisten (ej: "minimal en layout, maximalista en tipografia").
- **Anti-referencias demasiado vagas.** "No queremos parecer baratos" no ayuda. Mejor: "No queremos parecer Fiverr — el pricing accesible no debe comunicar baja calidad."
- **Saltarse las analogias.** Las analogias revelan matices que los adjetivos no capturan. Un cliente que dice "somos como un Audi" tiene expectativas diferentes a uno que dice "somos como un Jeep".
- **No validar con el cliente.** Este perfil es una interpretacion. Debe confirmarse antes de avanzar a Identity.
- **Confundir lo que la marca ES con lo que ASPIRA a ser.** Si hoy son una startup de 3 personas, posicionarse como "corporate" generara disonancia visual.

---

## Pipeline connection

```
Input: client-intake.md (respuestas) + competitive-analysis.md (oportunidades)
Output de este prompt -> Perfil de marca
  Alimenta directamente:
    - design-direction.md (personalidad visual, anti-referencias)
    - color-strategy.md (territorio de color segun personalidad)
    - typography-selection.md (tipografia segun personalidad)
    - atmosphere-definition.md (referencia emocional)
    - tone-of-voice.md (voz y atributos)
```

## Output esperado

Perfil de marca que alimenta directamente la fase de Identity (01-identity).

## Siguiente paso

Ejecutar `01-identity/design-direction.md` con este perfil como input.
