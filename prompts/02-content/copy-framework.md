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

## Siguiente paso

Ejecutar `02-content/tone-of-voice.md` si se necesita profundizar en voz.
Luego `03-architecture/page-planning.md`.
