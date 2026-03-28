# Prompt: Tone of Voice

> Fase: Content | Output: Guia de tono de voz para copy consistente
> Complemento al copy-framework cuando se necesita mas definicion.

---

## Prompt

```
Define la guia de tono de voz para {{PROJECT_NAME}}.

LA VOZ es constante (quien habla). EL TONO varia (como habla segun contexto).

1. VOZ DE MARCA
   - "Hablamos como ___" (persona concreta)
   - 3 atributos de voz: {{ATT_1}}, {{ATT_2}}, {{ATT_3}}
   - Para cada atributo, un ejemplo de "asi si" y "asi no":

   | Atributo | Asi si | Asi no |
   |----------|--------|--------|
   | {{ATT}} | "{{GOOD}}" | "{{BAD}}" |

2. TONO POR CONTEXTO
   | Contexto | Tono | Ejemplo |
   |----------|------|---------|
   | Hero / headlines | Inspiracional, impactante | "Transformamos espacios en experiencias" |
   | Servicios | Informativo, confiado | "Nuestro equipo de 15 arquitectos..." |
   | Testimonios | Emocional, autentico | "Superaron todas nuestras expectativas" |
   | Blog | Educativo, accesible | "3 tendencias que van a cambiar..." |
   | CTAs | Directo, energetico | "Agenda tu consulta gratuita" |
   | Error states | Empatico, util | "No encontramos eso, pero proba con..." |
   | Microcopy | Claro, amigable | "Tu mensaje fue enviado" |

3. PALABRAS DE PODER (usar frecuentemente)
   - {{WORD_1}}, {{WORD_2}}, {{WORD_3}}, ...

4. PALABRAS PROHIBIDAS (nunca usar)
   - {{BANNED_1}}, {{BANNED_2}}, {{BANNED_3}}, ...
   - Genericas: "lider", "innovador", "soluciones" (a menos que sea verdad comprobable)

5. FORMATO DE ESCRITURA
   - Oraciones: {{LENGTH}} (cortas y directas / largas y narrativas / mixtas)
   - Parrafos: maximo {{MAX_LINES}} lineas
   - Listas: preferir sobre parrafos para features/beneficios
   - Numeros: usar digitos (5, no "cinco") para impacto visual
```

---

## Output esperado

Guia de referencia rapida para mantener consistencia de copy en todo el proyecto.
