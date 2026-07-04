# Raw research — Top-tier human web design, mid-2026

> Agente de investigación Fable, 2026-07-04. Fuentes web en vivo. Insumo para `docs/research/2026-07-04-fable-evolution.md`.

## (a) Named patterns/techniques current in top human design

1. **Persistent WebGL/WebGPU scenes across page transitions** — canvas survives navigation; DOM swaps under a continuous GPU scene. Codrops: "Building Persistent Page Transitions with WebGPU and Vanilla JavaScript" (Jun 30, 2026); "Seamless 3D Transitions with Webflow, GSAP, and Three.js" (Mar 2026). ([tympanus.net/codrops](https://tympanus.net/codrops/category/tutorials/))
2. **Scroll-driven shader reveals** — images/text revealed via custom GLSL, driven by scroll velocity. Codrops Feb 2026: "Scroll-Revealed WebGL Gallery with GSAP, Three.js, Astro and Barba.js"; May 2026: Shader.se's scroll-driven WebGPU pipeline.
3. **Typography as primary architecture / kinetic type** — font weight & width mapped to scroll; variable-font axes per character (SplitText + rAF). ([line25 2026 trends](https://line25.com/articles/web-design-trends-2026/), [Codrops dual-wave text](https://tympanus.net/codrops/2026/01/15/building-a-scroll-driven-dual-wave-text-animation-with-gsap/), [ABC Dinamo variable fonts](https://abcdinamo.com/news/using-variable-fonts-on-the-web))
4. **Tactile brutalism / intentional imperfection** — raw geometry, harsh contrast, simulated physical texture (grain, paper, ink bleed, pencil lines) explicitly "to prove human authorship." 45% of senior CDs reportedly reject AI assets for tier-one campaigns citing "soul and provenance." ([Fireart 2026](https://fireart.studio/blog/the-best-web-design-trends/), [Lindsay Marsh, "Imperfection, Rebellion"](https://lindsaymarsh.substack.com/p/design-trends-2026-imperfection-rebellion), [Creative Bloq anti-design](https://www.creativebloq.com/design/why-are-we-all-obsessed-with-anti-design))
5. **Editorial/cinematic art direction** — Codrops "Inside Bisous: Designing an Editorial Experience for Cinematic CGI" (Beaucoup, Jun 2026); OFF+BRAND digital-sculpture Tsitsipas piece. Oversized high-contrast serifs, broken/asymmetric grids with overlap. ([visimade 2026 report](https://www.visimade.com/p/2026-design-trends-report), [graphicdesignjunction](https://graphicdesignjunction.com/2025/12/web-design-trends-of-2026/))
6. **SVG mask / clip reveal transitions on scroll** — grid/blind reveals, dual-scene fluid "X-ray" reveals (Codrops Mar 2026, two tutorials).
7. **Infinite seamless loops & sticky choreography** — "The Never Ending Story: Seamless Infinite Scroll" (May 2026), "Sticky Grid Scroll" progressive unfold (Mar 2026), scroll-driven 3D cube galleries.
8. **MotionPath / curved-trajectory thumbnail flows** — GSAP MotionPath for image streams along bezier paths (Codrops Jun 2026).
9. **Physics-flavored micro-interactions** — gravity-based mouse trails with image cascading (Codrops May 2026); velocity-responsive motion (scroll speed modulates distortion/lag).
10. **Real-time 3D as standard on premium work** — Awwwards SOTM 2026: Floema (Bürocratik), Oryzo AI (Lusion), Bruno Simon's drivable 3D portfolio; Active Theory's Hydra engine portfolio. "Clients expect working WebGL heroes on premium projects." ([svilenkovic scrollytelling 2026](https://svilenkovic.com/3d/scrollytelling-trends-2026), [Awwwards SOTM](https://www.awwwards.com/websites/sites_of_the_month/))
11. **Generative-meets-classical mashups** — Shopify "The Renaissance Edition" (SOTM Feb 2026); retro-tech nostalgia (Shader.se "80s business tech").
12. **Single desaturated palette + restraint** — grainy textures, soft single-color gradients, vintage photography; the counter to AI's saturated gradient soup. ([jukeboxprint 2026](https://www.jukeboxprint.com/blog/20-of-the-biggest-graphic-design-trends-for-2026))
13. **Monospace-as-texture** — mono cuts (Söhne Mono, GT Pressura Mono, Monument Grotesk Semi-Mono) for labels/metadata as craft signal. ([Creative Boom 50 fonts](https://www.creativeboom.com/resources/top-50-fonts-in-2026/))
14. **CSS-native scroll orchestration** — scroll-driven animations spec universal in browsers; scroll-state queries; View Transitions (same-page Baseline since 2025). ([CSS-Tricks Interop 2026](https://css-tricks.com/interop-2026/), [riadkilani.com](https://blog.riadkilani.com/2026-css-features-you-must-know/), [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations))

## (b) High-signal territory (what AI can't/won't do by default)

- **Custom shaders tied to content** — scroll-velocity-driven GLSL reveals, persistent scenes. A bespoke shader is the single strongest human signal.
- **Variable-font axis choreography** — animating wght/wdth per character on scroll.
- **Broken grid with intent** — one deliberately overlapping/misaligned element that still resolves compositionally.
- **Physical texture pipeline** — real grain, scanned paper, ink bleed, halftone; not CSS `filter: blur`.
- **Editorial pacing** — asymmetric type scale (12rem display / 0.75rem meta, nothing between); AI defaults to uniform 1.25 modular scales.
- **Anti-slop palette discipline** — one desaturated base + one non-purple accent; light backgrounds are now contrarian.
- **Velocity-aware motion** — motion responding to *how fast* you scroll (Lenis velocity → skew/blur/lag).
- **Persistent transitions** — page changes that never blank the screen (Barba/Taxi + shared canvas).

## (c) Typography direction — distinctive, non-fingerprint

**Avoid (AI fingerprints): Inter, Space Grotesk, Instrument Serif, Geist, default system stacks.**

| Typeface | Foundry | Role | Free alternative |
|---|---|---|---|
| Neue Haas Grotesk (#2, 391 uses) | Monotype | neutral grotesk | Switzer (Fontshare) |
| PP Neue Montreal (#4, 310 uses) | Pangram Pangram | warm grotesk | Hanken Grotesk (Google) |
| ABC Diatype (#9, 190 uses) | Dinamo | screen-optimized grotesk | Switzer / General Sans* |
| Söhne (+Mono) | Klim | grotesk system | Switzer; mono → Fragment Mono (Google) |
| Suisse Int'l | Swiss Typefaces | Swiss neutrality | Switzer |
| GT Alpina | Grilli Type | expressive workhorse serif | Erode / Sentient (Fontshare) |
| Canela | Commercial Type | sans-serif hybrid | Boska (Fontshare) |
| Ogg | Sharp Type | calligraphic display serif | Gambetta (Fontshare) |
| PP Editorial New | Pangram Pangram | narrow editorial serif | Zodiak (Fontshare) |
| Druk | Commercial Type | extreme-width display | Archivo Expanded/Condensed (Google, variable width) |
| Monument Extended | Pangram Pangram | brutalist wide display | Clash Display (Fontshare) |
| GT Flexa | Grilli Type | variable wght+wdth+ital — built for axis animation | Archivo / Fraunces (Google) |
| GT Pressura (+Mono) | Grilli Type | ink-pressure texture | JetBrains Mono / Fragment Mono |
| Aeonik | CoType | neo-grotesk | General Sans* |

\* Ojo: el informe de AI-tells marca General Sans como contaminado — preferir Switzer/Hanken en la práctica.

Free stack that doesn't read as AI: **Switzer, Clash Display, Cabinet Grotesk, Zodiak, Boska, Sentient, Gambetta, Author, Bespoke Serif** (Fontshare); **Fraunces** (Google — SOFT/WONK axes, ideal for intentional-imperfection axis animation); **Archivo** (variable width, Druk-style compression). ([Fontshare](https://fontshare.com/), [madegooddesigns Fontshare review](https://madegooddesigns.com/fontshare/), [font trends 2026](https://madegooddesigns.com/font-trends-2026/))

## (d) Motion vocabulary for GSAP + Lenis

- **Velocity skew/distort**: `lenis.on('scroll', e => …)` → map `e.velocity` to skewY/letter-spacing/shader uniform; spring back with `gsap.quickTo`.
- **Line-mask reveal**: SplitText (free since GSAP 3.13) → lines in `overflow:hidden`, `yPercent:100→0`, `stagger:0.08`, `power3.out`. 2026 refinement: animate on *landing moments*, not just entry.
- **Dual-wave text**: two overlapping SplitText layers, sine-offset per char, scroll-scrubbed (Codrops Jan 2026).
- **Variable-axis scrub**: ScrollTrigger scrub → `font-variation-settings` per char via rAF (GT Flexa/Fraunces/Archivo class).
- **SVG mask transitions**: grid/blinds clip-path/SVG mask scrubbed (Codrops Mar 2026).
- **Sticky unfold**: pinned section, children progressively unfold on scrub.
- **Infinite seamless loop**: Lenis `infinite: true` + `gsap.utils.wrap`.
- **MotionPath thumbnail flow**: images travel a bezier path (Codrops Jun 2026).
- **Persistent-canvas page transitions**: Barba.js/Taxi.js + one WebGL canvas never unmounts; DOM syncs positions to planes.
- **Gravity mouse trail**: pointer spawns images with gravity decay — background-only reactivity (compatible con la regla "nada imantado al cursor").
- **CSS fallback layer**: `animation-timeline: view()` universal — cheap ambient effects; GSAP para coreografía.

## (e) Stack verdict

- **GSAP + Lenis: still the production standard.** "In 2026, Lenis dominates smooth scroll; GSAP ScrollTrigger 4.0 has better mobile support; Lenis + ScrollTrigger + Three.js remains the production stack for premium scroll-driven experiences" ([svilenkovic](https://svilenkovic.com/3d/scrollytelling-trends-2026)). GSAP (all plugins incl. SplitText) fully free since the Webflow acquisition.
- **Framework:** top studios ship React-side (darkroom.engineering: Next.js 16 + React 19 + R3F + GSAP — Satus starter; basement.studio similar). **But framework is not the differentiator** — Awwwards has an active Vue winners category; Nuxt/Vue + GSAP + Lenis is documented award-work stack. Vue 3 stays; the gap to close is **shader/WebGL capability** (TresJS or raw Three.js layer) and **persistent-canvas transitions**.
- **Watch:** WebGPU is the 2026 frontier; WebGL remains shipping baseline.

**Bottom line:** the positive space is *texture + typographic extremity + velocity-aware motion + one custom shader per project + palette discipline (never purple, rarely default-dark)*. Perfection now reads as machine-made; the winning language is crafted imperfection over an impeccable technical base.
