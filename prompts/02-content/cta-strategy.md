# Prompt: CTA Strategy

> Fase: Content | Output: Mapa de CTAs por pagina y seccion
> Los CTAs son el motor de conversion. Cada uno tiene proposito.

---

## Prompt

```
Disenha la estrategia de CTAs para {{PROJECT_NAME}}.

PRINCIPIOS:
- Cada CTA es un verbo de accion (nunca "Click aqui" o "Enviar")
- Los CTAs siguen una progresion narrativa (explorar -> considerar -> actuar)
- Cada CTA tiene contexto (el usuario sabe que pasa al clickear)
- Maximo 2 CTAs visibles por viewport (primario + secundario)

MAPA DE CTAs:

Para cada pagina, definir:

| Pagina | Seccion | CTA primario | CTA secundario | Destino | Tipo visual |
|--------|---------|-------------|----------------|---------|-------------|
| Home | Hero | | | | btn-primary |
| Home | Services preview | | | | btn-secondary |
| Home | Portfolio preview | | | | btn-ghost |
| Home | CTA final | | | | btn-primary |
| About | Manifesto | | | | btn-secondary |
| Services | Individual | | | | btn-primary |
| Portfolio | Grid | | | | btn-ghost |
| Contact | Form | | | | btn-primary |
| Blog | Article | | | | btn-secondary |

PROGRESION NARRATIVA:
- Inicio del journey: CTAs exploratorios ("Descubrir", "Explorar", "Conocer")
- Mitad del journey: CTAs de consideracion ("Ver proceso", "Leer caso", "Comparar")
- Final del journey: CTAs de accion ("Agendar", "Solicitar", "Empezar")

TIPOS VISUALES:
- btn-primary: fondo accent, maximo impacto
- btn-secondary: outline/ghost, complementa al primario
- btn-ghost: solo texto + underline/arrow, minimo ruido visual

OUTPUT: tabla completa de CTAs con copy final, destino, y tipo visual.
```

---

## Output esperado

Mapa de CTAs que se integra en `docs/content-brief.md` seccion 7.
