# Motion Reference: Entrance Animations

> Catalogo de tecnicas de entrada/reveal para elementos.

---

## Tecnicas de entrada

### Text Reveals

| Tecnica | Implementacion | Efecto | Mejor para |
|---------|---------------|--------|-----------|
| Char-by-char | SplitType chars + stagger 0.02-0.04s | Cinematico, preciso | Headlines hero |
| Word-by-word | SplitType words + stagger 0.05-0.08s | Fluido, legible | Subtitulos |
| Line-by-line | SplitType lines + clip from bottom | Editorial, elegante | Parrafos |
| Typewriter | Chars con delay constante | Tecnico, retro | Monospace text |
| Scramble | Chars random antes de resolver | Hacker, tech | Titulos tech |
| Fade up words | Words opacity + y offset | Suave, universal | Cualquier texto |

### Image/Media Reveals

| Tecnica | CSS/GSAP | Efecto | Mejor para |
|---------|---------|--------|-----------|
| Clip rect | clipPath: inset() animado | Cortina que revela | Imagenes editoriales |
| Scale from center | scale 0 -> 1 + opacity | Dramatico | Imagenes hero |
| Wipe horizontal | clipPath: inset(0 100% 0 0) -> inset(0) | Reveal lateral | Split layouts |
| Blur to clear | filter: blur(20px) -> blur(0) | Cinematico, suave | Fondos, fotos |
| Parallax enter | y: 100 -> 0 con velocity | Profundidad | Cualquier imagen |
| Color overlay lift | Overlay color que se levanta | Elegante, con marca | Cards, portfolio |

### Container/Section Reveals

| Tecnica | Implementacion | Efecto |
|---------|---------------|--------|
| Fade up | y: 40, opacity: 0 -> 1 | Standard, confiable |
| Fade in scale | scale: 0.95, opacity: 0 | Sutil, premium |
| Slide from side | x: -60 o x: 60 | Lateral, dinamico |
| Stagger children | Children stagger 0.08-0.12s | Organizado, ritmico |
| Draw border | Border que se dibuja alrededor | Tecnico, preciso |
| Accordion open | height: 0 -> auto + content reveal | Expandible |

---

## Reglas de timing

| Contexto | Duration | Delay | Easing |
|---------|---------|-------|--------|
| Hero elements | 0.6-1.2s | Timeline sequencial | Brand easing |
| Scroll reveals | 0.5-0.8s | 0 (trigger on scroll) | Brand easing |
| Stagger items | 0.4-0.6s each | 0.06-0.12s stagger | Brand easing |
| Hover states | 0.2-0.4s | 0 | power2.out |
| Micro-interactions | 0.15-0.3s | 0 | power1.out |
