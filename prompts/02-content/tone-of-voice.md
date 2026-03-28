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

## Ejemplos: buena vs mala guia de voz

### Atributos de voz para un cowork space

**Mala:**
| Atributo | Asi si | Asi no |
|----------|--------|--------|
| Profesional | "Somos profesionales" | "Somos amateurs" |
(Tautologico. No ayuda a escribir copy.)

**Buena:**
| Atributo | Asi si | Asi no |
|----------|--------|--------|
| Cercano sin ser informal | "Reserva tu escritorio para manana — te guardamos el cafe" | "Estimado usuario, su solicitud de reserva ha sido procesada" |
| Directo sin ser frio | "Sin contratos largos. Sin sorpresas. Paga mes a mes." | "Click aqui para mas info sobre nuestras opciones" |
| Entusiasta sin ser exagerado | "Tus mejores ideas merecen un espacio a la altura" | "EL MEJOR COWORK DEL UNIVERSO!!!" |

### Palabras de poder vs prohibidas

**Mala:** Palabras de poder: "innovador, lider, soluciones" (Estas estan en la lista de PROHIBIDAS.)

**Buena:**
Palabras de poder: "construir, crear, lanzar, escalar, tu espacio, comunidad, flexibilidad"
Palabras prohibidas: "soluciones", "lider del mercado", "de vanguardia", "sinergia", "leverage"

---

## Variaciones de tono por industria

| Industria | Voz base | Tono hero | Tono servicios | Tono error states |
|-----------|----------|-----------|----------------|-------------------|
| Gastronomia | Chef storyteller | Sensorial, evocador | Informativo, apetitoso | Calido: "La cocina esta cerrada, pero volve manana" |
| Fintech | Ingeniero claro | Confiado, datos | Tecnico accesible | Directo: "Algo fallo en el pago. Tu dinero no fue debitado." |
| Inmobiliaria | Asesor de confianza | Aspiracional | Detallado, honesto | Empatico: "No encontramos propiedades con esos filtros. Proba ampliando la zona." |
| Salud | Profesional empatico | Tranquilizador | Basado en evidencia | Calmo: "No pudimos procesar tu turno. Llama al consultorio." |
| Educacion | Mentor entusiasta | Motivador | Practico, claro | Alentador: "Ese link no funciona, pero aca tenes otros cursos que te pueden gustar" |

---

## Common errors

- **Voz y tono confundidos.** La voz es QUIEN habla (constante). El tono es COMO habla segun contexto (variable). Si la voz cambia entre paginas, no hay marca.
- **Atributos sin ejemplos concretos.** Decir "somos cercanos" sin un "asi si / asi no" es inutil. Sin ejemplo, cada persona interpreta "cercano" diferente.
- **Palabras de poder que son cliches.** "Innovador", "lider", "soluciones", "de excelencia" son ruido. Si el 80% de los sitios del rubro las usan, no diferencian.
- **No definir tono para error states y microcopy.** Estos son los momentos de mas friccion del usuario. La voz ahi importa mas que en el hero.
- **Formato de escritura no definido.** Sin regla de largo de oraciones y parrafos, el copy varia salvajemente entre secciones.

---

## Pipeline connection

```
Input: brand-questionnaire.md (personalidad, analogias)
     + copy-framework.md (si ya existe copy base)
Output de este prompt -> Guia de tono de voz
  Alimenta:
    - Toda la escritura de copy en content-brief.md
    - Microcopy en implementacion (loading, errors, forms)
    - CTA strategy (tono progresivo)
```

## Output esperado

Guia de referencia rapida para mantener consistencia de copy en todo el proyecto.
