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

## Output esperado

Un documento con todas las respuestas que se guarda como referencia interna.
No se publica — es input para las fases siguientes.

## Siguiente paso

Con las respuestas, ejecutar `competitive-analysis.md` y luego `brand-questionnaire.md`.
