# Prompts Library

Sistema de prompts organizados por fase del proyecto. Cada prompt esta disenado para producir output de calidad profesional, original y digno de premio.

## Como usar

1. Seguir el orden numerico (00 -> 07)
2. Cada fase tiene prompts que se ejecutan en secuencia
3. El output de una fase alimenta la siguiente
4. No saltar fases — el pipeline es estricto

## Estructura

```
prompts/
  00-discovery/       Entender al cliente y su negocio
  01-identity/        Definir identidad visual unica
  02-content/         Crear copy especifico y persuasivo
  03-architecture/    Planificar paginas y secciones
  04-motion/          Coreografiar animaciones
  05-3d/              Definir elementos WebGL/Three.js
  06-implementation/  Guiar la construccion de codigo
  07-quality/         Auditar y pulir antes de entregar
```

## Regla de oro

Cada prompt produce un deliverable concreto. No hay prompts abstractos.
El output de cada prompt se guarda en `docs/` como fuente de verdad.
