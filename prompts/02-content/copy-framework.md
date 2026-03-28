# Prompt: Copy Framework

> Fase: Content | Output: docs/content-brief.md completo
> Content-first. El copy se escribe ANTES de tocar una linea de CSS.

---

## Prompt

```
Crea el content brief completo para {{PROJECT_NAME}} usando la template
en docs/_templates/content-brief.template.md.

INPUT:
- Client intake: {{REF_INTAKE}}
- Brand personality: {{PERSONALITY}}
- Rubro: {{INDUSTRY}}
- Publico: {{AUDIENCE}}
- Servicios/productos: {{SERVICES}}
- Diferenciadores: {{DIFFERENTIATORS}}

REGLAS DE COPY:

1. ESPECIFICIDAD
   - Cada headline debe ser especifico del negocio. "Bienvenidos" esta prohibido.
   - Cada descripcion de servicio debe decir QUE hacen, no generalidades.
   - Los testimonios deben mencionar resultados concretos.

2. VOZ
   - Consistente en todo el sitio (misma persona, mismo tono).
   - Definir la voz como "habla como ___" (ej: "un arquitecto que ama su trabajo").
   - El tono puede variar por seccion (hero: inspiracional, servicios: informativo,
     testimonios: emocional) pero la voz es una sola.

3. CTAs
   - Verbo de accion SIEMPRE ("Explorar", "Descubrir", "Agendar", "Solicitar")
   - NUNCA "Click aqui", "Enviar", "Submit", "Contactanos" generico
   - Cada CTA tiene contexto (que pasa cuando clickeo)
   - Progresion: CTAs tempranos son exploratorios, CTAs finales son de accion

4. MICROCOPY
   - Empty states: mensajes utiles, no "No hay resultados"
   - Loading: puede tener personalidad ("Preparando tu experiencia...")
   - 404: oportunidad de marca, no un error frio
   - Form labels: claros y directos

5. SEO COPY
   - Title tags: 50-60 chars, keyword + brand
   - Meta descriptions: 120-160 chars, propuesta de valor + CTA
   - Unico por pagina, nunca duplicado

OUTPUT: archivo docs/content-brief.md completo con TODOS los campos llenos.
Ningun placeholder {{}} debe quedar. Todo texto es final o near-final.
```

---

## Ejemplos: buena vs mala copy

### Hero headline para una clinica dental premium

**Mala:** "Bienvenidos a Smile Clinic - Tu sonrisa, nuestra prioridad"
(Generico. "Bienvenidos" esta prohibido. "Tu X, nuestra Y" es un template.)

**Buena:** "Odontologia de precision para quienes no aceptan compromisos"
(Especifico al posicionamiento premium. Habla al publico target. Tiene actitud.)

### Descripcion de servicio

**Mala:** "Ofrecemos soluciones integrales de diseno para su hogar."
("Soluciones integrales" no dice nada. Que hacen exactamente?)

**Buena:** "Reformamos departamentos de menos de 60m2 en Buenos Aires. Cada metro cuadrado cuenta: almacenamiento oculto, divisiones moviles, y luz natural como protagonista."
(Que hacen, donde, para quien, y como se diferencian. En 2 oraciones.)

### CTA

**Mala:** "Contactenos" / "Enviar" / "Click aqui"

**Buena:** "Agendar visita a tu departamento" / "Ver el antes y despues" / "Calcular presupuesto en 2 minutos"
(Verbo de accion + contexto de que pasa al clickear.)

---

## Variaciones de voz por industria

| Industria | Voz sugerida | Headline ejemplo | CTA ejemplo |
|-----------|-------------|-----------------|-------------|
| Gastronomia | Chef apasionado que cuenta la historia del plato | "Cada plato empieza en la huerta de San Pedro" | "Reservar una mesa" |
| Inmobiliaria | Asesor de confianza que entiende tus suenos | "Tu proximo hogar existe. Nosotros lo encontramos." | "Explorar propiedades en Belgrano" |
| Fintech | Ingeniero brillante que habla claro | "Tu plata trabaja. Vos no deberias." | "Simular mi rendimiento" |
| Salud | Profesional empatico y directo | "Tratamientos basados en evidencia, no en moda" | "Agendar consulta sin cargo" |
| Moda | Editor de moda con ojo critico | "Menos piezas. Mejor manufactura." | "Explorar la coleccion invierno" |
| Educacion | Profesor entusiasmado con el tema | "Aprende a programar construyendo, no memorizando" | "Empezar el curso gratis" |
| Legal | Abogado confiable sin jerga | "Protegemos tu patrimonio con estrategia, no burocracia" | "Solicitar evaluacion de caso" |

---

## Common errors

- **Dejar placeholders {{}} en el output.** El content-brief es copy FINAL o near-final. Si dice {{SERVICIO_1}}, fallo.
- **Copy generico que aplica a cualquier negocio.** Si puedes cambiar el nombre de la empresa y el copy sigue funcionando, no es especifico.
- **Testimonios inventados sin verosimilitud.** Un testimonio de "J.P., CEO" no es creible. Usar nombres completos, empresas reales, y resultados medibles.
- **CTAs pasivos.** "Mas informacion" no es un CTA. Es un link. Un CTA tiene verbo + resultado esperado.
- **Voz inconsistente entre secciones.** Si el hero es poetico y el footer es corporate, hay una ruptura de personalidad.
- **Copy demasiado largo para web.** Las oraciones de 3 lineas en una landing no se leen. Regla: si puedes decirlo en menos palabras, hacelo.
- **No escribir microcopy.** Empty states, loading messages, 404, y form labels son parte del content-brief. Si se olvidan, el dev los inventa con "No data found".

---

## Pipeline connection

```
Input: client-intake.md (servicios, diferenciadores, publico)
     + brand-questionnaire.md (personalidad, voz, anti-referencias)
     + design-direction.md (tono visual para alinear)
Output de este prompt -> docs/content-brief.md
  Alimenta directamente:
    - page-planning.md (copy exacto por seccion)
    - cta-strategy.md (progresion de CTAs)
    - section-narratives.md (contenido por seccion)
    - Toda la implementacion frontend (texto real, no lorem ipsum)
```

## Siguiente paso

Ejecutar `02-content/tone-of-voice.md` si se necesita profundizar en voz.
Luego `03-architecture/page-planning.md`.
