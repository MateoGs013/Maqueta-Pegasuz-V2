# Prompt: Client Intake

> Fase: Discovery | Output: Perfil completo del cliente
> Ejecutar ANTES de cualquier decision de diseno o codigo.

---

## Prompt

```
Necesito que me hagas una entrevista de descubrimiento para un nuevo proyecto.

Preguntame sobre:

1. NEGOCIO
   - Que tipo de negocio es (rubro, industria)
   - Que hace exactamente (elevator pitch en 2 oraciones)
   - Quien es su cliente ideal (demografia, psicografia)
   - Cual es su diferenciador principal (por que alguien los elige a ellos)
   - Competidores directos (3-5 nombres)

2. OBJETIVOS DEL SITIO
   - Cual es el objetivo principal del sitio (vender, generar leads, informar, portfolio)
   - Que accion quiere que tome el visitante (CTA principal)
   - Hay funcionalidad especifica necesaria (formularios, filtros, blog, e-commerce)
   - Que paginas necesita (listar todas)

3. ESTETICA
   - Hay sitios que le gustan (URLs de inspiracion)
   - Que sensacion quiere transmitir (3 adjetivos)
   - Hay colores de marca existentes o libertad total
   - Hay tipografia existente o libertad total
   - Prefiere dark mode, light mode, o ambos
   - Nivel de audacia visual (conservador, moderado, experimental)

4. CONTENIDO
   - Tiene textos escritos o hay que crearlos
   - Tiene imagenes/fotos profesionales o hay que resolver
   - Tiene logo o hay que disenar
   - El contenido va a venir de un CMS o es estatico

5. TECNICO
   - Es un cliente Pegasuz (multi-tenant) o proyecto independiente
   - Hay dominio definido
   - Hay hosting definido
   - Timeline / deadline

No asumas nada. Pregunta todo. El output de esta entrevista define todo lo que viene despues.
```

---

## Ejemplos: buena vs mala respuesta

### Pregunta: "Que hace exactamente?"

**Mala:** "Somos una empresa de servicios profesionales que ofrece soluciones integrales."
(Vago, no dice nada concreto. No se puede disenar a partir de esto.)

**Buena:** "Somos un estudio de arquitectura en Buenos Aires especializado en reformas de departamentos chicos (sub-60m2). Transformamos monoambientes en espacios funcionales."
(Especifico, tiene rubro, ubicacion, nicho, y diferenciador.)

### Pregunta: "Que sensacion quiere transmitir?"

**Mala:** "Profesional y moderno."
(Demasiado generico, aplica a cualquier negocio.)

**Buena:** "Quiero que se sienta como entrar a un showroom de diseno escandinavo: limpio, calido, con materiales nobles. Nada frio ni corporativo."
(Evoca algo concreto que se puede traducir a decisiones de diseno.)

---

## Variaciones por industria

La entrevista se adapta segun el rubro. Preguntas adicionales por industria:

| Industria | Preguntas extra |
|-----------|----------------|
| Gastronomia | Hay carta digital? Sistema de reservas? Delivery propio o tercerizado? Horarios estacionales? |
| Inmobiliaria | Listado de propiedades dinamico? Mapa interactivo? Filtros (precio, zona, tipo)? Tours virtuales? |
| E-commerce | Catalogo de productos? Pasarela de pago? Inventario? Envios? Wishlist? |
| Salud/Bienestar | Turnos online? HIPAA o regulaciones de privacidad? Testimonios de pacientes (consentimiento)? |
| Fintech | Onboarding KYC? Dashboard de usuario? Graficos/data viz? Regulaciones financieras? |
| Educacion | Plataforma de cursos? Progreso del alumno? Certificados? Contenido en video? |
| Estudio creativo | Portfolio con filtros? Case studies detallados? Showreel de video? Clientes destacados? |
| SaaS | Pricing tiers? Free trial? Dashboard? Integraciones? Docs/API? |

---

## Common errors

- **No insistir cuando la respuesta es vaga.** Si el cliente dice "queremos algo moderno", repreguntar: "Moderno como Apple (minimal, blanco, producto protagonista) o moderno como Stripe (tech, gradientes, ilustraciones)?"
- **Aceptar "no tenemos competidores" como respuesta.** Siempre hay competidores o sustitutos. Repreguntar: "A quien le compran tus clientes cuando no te eligen a vos?"
- **No preguntar sobre el contenido existente.** Si el cliente no tiene textos ni fotos, eso cambia toda la planificacion. Averiguarlo temprano.
- **Asumir que "todas las paginas" son Home/About/Services/Contact.** Cada negocio tiene necesidades diferentes. Un restaurante necesita Menu y Reservas. Un estudio necesita Portfolio y Case Studies.
- **Saltar la pregunta de deadline.** Sin timeline, no se puede priorizar. Un sitio para "en 2 semanas" tiene scope muy diferente a uno para "cuando este listo".

---

## Pipeline connection

```
Output de este prompt -> Perfil del cliente (documento interno)
  Alimenta directamente:
    - competitive-analysis.md (URLs de competidores)
    - brand-questionnaire.md (personalidad, estetica, anti-referencias)
    - copy-framework.md (servicios, diferenciadores, publico)
    - page-planning.md (paginas requeridas, funcionalidades)
```

## Output esperado

Un documento con todas las respuestas que se guarda como referencia interna.
No se publica — es input para las fases siguientes.

## Siguiente paso

Con las respuestas, ejecutar `competitive-analysis.md` y luego `brand-questionnaire.md`.
