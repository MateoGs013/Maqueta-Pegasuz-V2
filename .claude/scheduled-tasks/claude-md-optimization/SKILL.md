---
name: claude-md-optimization
description: Optimizar CLAUDE.md para reducir tokens y mejorar la precisión de instrucciones para Claude
---

Tarea: Optimizar el CLAUDE.md principal en C:\Users\mateo\Desktop\maqueta\CLAUDE.md

El CLAUDE.md es el archivo más importante de la maqueta — Claude lo lee en cada interacción. Hay que optimizarlo para:

1. REDUCCIÓN DE TOKENS:
   - Identificar información redundante o repetida
   - Comprimir tablas donde se pueda sin perder info
   - Mover detalles extensos a archivos referenciados (ej: "ver guides/03-pegasuz-integration.md")
   - Mantener lo esencial en CLAUDE.md, delegar lo extenso

2. CLARIDAD DE INSTRUCCIONES:
   - ¿Hay instrucciones ambiguas que Claude podría malinterpretar?
   - ¿Hay contradicciones internas?
   - ¿El dispatch de skills es claro sobre cuándo usar cada uno?
   - ¿Las "reglas inviolables" son realmente inviolables o hay excepciones no documentadas?

3. PRIORIZACIÓN:
   - ¿Lo más importante está al principio del archivo?
   - ¿Claude ve las reglas críticas (design-first, content-first, chain locked) antes que los detalles?
   - ¿La sección de anti-patterns está posicionada donde Claude la va a leer antes de codear?

4. ACTUALIZACIÓN:
   - ¿Todas las features listadas en "Features disponibles" existen realmente?
   - ¿La tabla de response extraction está completa?
   - ¿El pipeline de ejecución refleja el flujo actual con foundation docs?
   - ¿El dispatch de skills coincide con los skills que existen en .claude/skills/?

TAMBIÉN revisar el CLAUDE.md global en C:\Users\mateo\.claude\CLAUDE.md:
   - ¿Hay duplicación entre el global y el del proyecto?
   - ¿Se complementan o se contradicen?
   - Proponer qué va en cada uno (global = reglas universales, proyecto = reglas de la maqueta)

Aplicar las optimizaciones directamente.
Documentar cambios en PROCESS-LOG.md con antes/después del word count.