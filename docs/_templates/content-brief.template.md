# Content Brief: {{PROJECT_NAME}}

> Content-first. Todo el texto se define ACA antes de escribir una sola linea de HTML.
> Si el contenido viene del CMS, documentar los keys y sus fallbacks.

---

## 1. Voz y tono

- **Nombre completo:** {{BUSINESS_NAME}}
- **Tagline:** {{TAGLINE}}
- **Voz:** {{VOICE}} (ej: experta pero accesible, directa y confiada, poetica y evocadora)
- **Tono general:** {{TONE}} (ej: profesional-calido, minimalista-elegante, energetico-audaz)
- **Persona:** habla como {{PERSONA}} (ej: un consultor senior, un artista, un amigo experto)
- **Nunca:** {{NEVER_DO}} (ej: nunca usar jerga tecnica sin contexto, nunca ser informal en exceso)

---

## 2. Hero principal (Homepage)

- **Headline:** {{HERO_HEADLINE}}
  - Debe ser especifico del negocio. NO generico ("Bienvenidos a nuestra web")
  - Maximo 3 palabras impactantes
- **Subheadline:** {{HERO_SUB}}
  - 1 oracion que expanden el headline (opcional)
  - Incluir la propuesta de valor unica
- **CTA primario:** {{HERO_CTA}} (verbo de accion: "Explorar proyectos", "Agendar consulta")
- **CTA secundario:** {{HERO_CTA_2}} (opcional: "Ver proceso", "Conocer mas")

---

## 3. Propuesta de valor / About

- **Parrafo principal (manifesto):**
  > {{ABOUT_MANIFESTO}}
  > 1-2 oraciones que definen QUIEN es este negocio y POR QUE existe.
  > No bullet points. Narrativa fluida.

- **Diferenciadores clave:**
  1. {{DIFF_1}} - {{DIFF_1_DESC}}
  2. {{DIFF_2}} - {{DIFF_2_DESC}}
  3. {{DIFF_3}} - {{DIFF_3_DESC}}

- **Stats / numeros:**
  | Numero | Label | Contexto |
  |--------|-------|----------|
  | {{STAT_1_NUM}} | {{STAT_1_LABEL}} | {{STAT_1_CONTEXT}} |
  | {{STAT_2_NUM}} | {{STAT_2_LABEL}} | {{STAT_2_CONTEXT}} |
  | {{STAT_3_NUM}} | {{STAT_3_LABEL}} | {{STAT_3_CONTEXT}} |
  | {{STAT_4_NUM}} | {{STAT_4_LABEL}} | {{STAT_4_CONTEXT}} |

---

## 4. Servicios / Productos

> Un bloque por cada servicio/producto principal. Copy real, no lorem ipsum.

### Servicio 1: {{SERVICE_1_NAME}}
- **Descripcion corta (1 linea):** {{SERVICE_1_SHORT}}
- **Descripcion larga (2-3 oraciones):** {{SERVICE_1_LONG}}
- **CTA:** {{SERVICE_1_CTA}}

### Servicio 2: {{SERVICE_2_NAME}}
- **Descripcion corta:** {{SERVICE_2_SHORT}}
- **Descripcion larga:** {{SERVICE_2_LONG}}
- **CTA:** {{SERVICE_2_CTA}}

### Servicio 3: {{SERVICE_3_NAME}}
- **Descripcion corta:** {{SERVICE_3_SHORT}}
- **Descripcion larga:** {{SERVICE_3_LONG}}
- **CTA:** {{SERVICE_3_CTA}}

*(Agregar mas segun necesidad)*

---

## 5. Proceso / Metodologia

> Pasos especificos de ESTE negocio. No un proceso generico.

| Paso | Nombre | Descripcion |
|------|--------|------------|
| 01 | {{STEP_1_NAME}} | {{STEP_1_DESC}} |
| 02 | {{STEP_2_NAME}} | {{STEP_2_DESC}} |
| 03 | {{STEP_3_NAME}} | {{STEP_3_DESC}} |
| 04 | {{STEP_4_NAME}} | {{STEP_4_DESC}} |

---

## 6. Testimonios / Social proof

> Reales o realistas. Con nombre, rol, y contexto.

### Testimonio 1
- **Quote:** "{{TESTIMONIAL_1}}"
- **Nombre:** {{T1_NAME}}
- **Rol:** {{T1_ROLE}}
- **Contexto:** {{T1_CONTEXT}} (que servicio uso, que resultado tuvo)

### Testimonio 2
- **Quote:** "{{TESTIMONIAL_2}}"
- **Nombre:** {{T2_NAME}}
- **Rol:** {{T2_ROLE}}
- **Contexto:** {{T2_CONTEXT}}

### Testimonio 3
- **Quote:** "{{TESTIMONIAL_3}}"
- **Nombre:** {{T3_NAME}}
- **Rol:** {{T3_ROLE}}
- **Contexto:** {{T3_CONTEXT}}

---

## 7. CTAs por pagina

> Cada CTA tiene verbo de accion + contexto. NUNCA "Contactanos" generico.

| Pagina | CTA primario | CTA secundario |
|--------|-------------|----------------|
| Homepage hero | {{CTA}} | {{CTA}} |
| Servicios | {{CTA}} | {{CTA}} |
| Portfolio/trabajo | {{CTA}} | {{CTA}} |
| About | {{CTA}} | {{CTA}} |
| Contacto | {{CTA}} | — |
| Blog | {{CTA}} | {{CTA}} |

---

## 8. Microcopy

- **Nav items:** {{NAV_ITEMS}} (ej: Inicio, Propiedades, Servicios, Blog, Contacto)
- **Footer tagline:** {{FOOTER_TAGLINE}}
- **Footer description:** {{FOOTER_DESC}} (1-2 oraciones)
- **Copyright:** {{COPYRIGHT}}
- **Empty states:** "{{EMPTY_STATE}}" (cuando no hay resultados)
- **Loading text:** "{{LOADING_TEXT}}" (si aplica)
- **404 headline:** "{{404_HEADLINE}}"
- **404 body:** "{{404_BODY}}"

---

## 9. SEO copy (por pagina)

| Pagina | title tag | meta description (120-160 chars) |
|--------|----------|----------------------------------|
| Home | {{TITLE}} | {{DESC}} |
| About | {{TITLE}} | {{DESC}} |
| Services | {{TITLE}} | {{DESC}} |
| Portfolio | {{TITLE}} | {{DESC}} |
| Blog | {{TITLE}} | {{DESC}} |
| Contact | {{TITLE}} | {{DESC}} |

---

## 10. Fuente de datos

| Contenido | Fuente | Key / endpoint |
|-----------|--------|----------------|
| {{CONTENT}} | CMS / Hardcoded / API | {{KEY_OR_ENDPOINT}} |

---

## Checklist

- [ ] Hero headline es especifico (no generico)
- [ ] Cada servicio tiene copy real (no lorem ipsum)
- [ ] Testimonios son realistas y con contexto
- [ ] CTAs usan verbos de accion (no "Click aqui")
- [ ] Microcopy cubre empty states, loading, 404
- [ ] SEO copy definido para cada pagina
- [ ] Fuente de datos documentada (CMS keys o hardcoded)
