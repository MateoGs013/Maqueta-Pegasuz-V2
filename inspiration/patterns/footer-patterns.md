# UI Patterns: Footers

> Catalogo de patrones de footer.

---

## Tipos de footer

### 1. CTA + Info Footer
```
┌──────────────────────────────────────┐
│         Ready to get started?         │  <- CTA section (accent bg)
│     [Primary CTA]  [Secondary CTA]   │
├──────────────────────────────────────┤
│ Logo        Links Col 1  Links Col 2 │  <- Info section (dark bg)
│ Description  - Link       - Link     │
│ Social icons - Link       - Link     │
│              - Link       - Link     │
├──────────────────────────────────────┤
│ Copyright  |  Privacy  |  Terms      │  <- Legal bar
└──────────────────────────────────────┘
```
**Mejor para:** servicios, agencies, SaaS

### 2. Minimal Footer
```
┌──────────────────────────────────────┐
│  Logo    |    Social    |  Copyright │
└──────────────────────────────────────┘
```
**Mejor para:** portfolios, landing pages simples

### 3. Newsletter Footer
```
┌──────────────────────────────────────┐
│  Subscribe to our newsletter          │
│  [Email input] [Subscribe button]     │
├──────────────────────────────────────┤
│  Links  |  Links  |  Contact  |  Legal│
└──────────────────────────────────────┘
```
**Mejor para:** editorial, blog, e-commerce

### 4. Map + Contact Footer
```
┌──────────────────────────────────────┐
│  [Map embed / static map]            │
│  Address  |  Phone  |  Email         │
│  Hours    |  Social |  Legal         │
└──────────────────────────────────────┘
```
**Mejor para:** negocios locales, real estate, hospitality

---

## Patrones trending 2025-2026

### 5. Reveal-on-Scroll Footer
- Footer que se "revela" debajo del contenido con efecto de parallax o clip — la pagina se levanta revelando el footer ya en posicion
- Efecto premium que da sensacion de profundidad
- **Implementar con:** CSS `position: sticky` en el footer con `bottom: 0` + z-index layering, o GSAP ScrollTrigger clip-path en la seccion anterior
- **Mejor para:** sites premium, agencias, portfolios

### 6. Interactive CTA Footer con 3D
- Footer donde el CTA principal tiene un elemento 3D o shader atmosferico de fondo
- Transforma el "ultimo empujon" en una experiencia memorable
- **Implementar con:** Three.js canvas behind CTA section + atmospheric shader + GSAP scroll-triggered reveal del 3D
- **Mejor para:** tech, creative agencies, luxury brands

### 7. Marquee Footer
- Texto marquee (ticker horizontal) gigante como headline del footer, seguido de links y legal minimal
- Reemplaza la CTA section con motion como gancho visual
- **Implementar con:** GSAP horizontal infinite scroll + SplitType chars + CSS overflow hidden
- **Mejor para:** agencies, portfolios, marcas con personalidad tipografica fuerte

---

## Elementos de footer

| Elemento | Obligatorio | Notas |
|---------|------------|-------|
| Logo | Si | Version simplificada o monochrome |
| Copyright | Si | "2026 Brand. All rights reserved." |
| Nav links | Recomendado | Replica nav principal + extras |
| Social links | Recomendado | Iconos, no texto |
| Contact info | Segun rubro | Email, telefono, direccion |
| Legal links | Si | Privacy policy, terms |
| Newsletter | Opcional | Solo si hay estrategia de email |
| CTA section | Recomendado | Ultima oportunidad de conversion |
