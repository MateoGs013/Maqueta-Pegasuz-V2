# Reference Analysis — fluid.glass

## Sources Analyzed

| Site | Page | URL | Tech Stack | Capture Date |
|------|------|-----|-----------|-------------|
| fluid.glass | Home | https://fluid.glass | Nuxt (Vue 3) + Pinia + Storyblok CMS + Custom CSS animations | 2026-04-04 |
| fluid.glass | /about | https://fluid.glass/about | Same | 2026-04-04 |
| fluid.glass | /collection | https://fluid.glass/collection/ | Same | 2026-04-04 |
| fluid.glass | /approach | https://fluid.glass/approach | Same | 2026-04-04 |
| fluid.glass | /showroom | https://fluid.glass/showroom | Same | 2026-04-04 |
| fluid.glass | /contact | https://fluid.glass/contact | Same | 2026-04-04 |

---

## Overall Aesthetic

Fluid Glass projects an architecture-grade premium identity — the visual language is cold, restrained, and materially obsessed. The site feels like a high-end architectural journal translated into digital form: cream and near-black dominate, motion is measured and purposeful, typography is sparse and confident. There is nothing decorative that does not carry weight.

Across every page the same conviction holds: maximum negative space, monospace labeling system, and a disciplined restraint that communicates exclusivity without a single cliche. The glassmorphism is not ornament — it is literally the product. Every frosted panel echoes what the company sells.

---

## Color Insights

| Pattern | Hex Values | Where Seen | Why It Works | Confidence |
|---------|-----------|-----------|-------------|-----------|
| Near-black canvas (not pure black) | `#0b1012` | Homepage bg, footer, video overlays | Adds warmth and depth vs pure `#000`; avoids the harsh flatness of true black | HIGH |
| Warm cream as primary light | `#f3f0ec` | Page backgrounds, panels, card surfaces | Warm off-white reads as material, not digital; feels like paper or plaster | HIGH |
| Dark grey as secondary surface | `#212325` | Navigation, section backgrounds, text on cream | Sits between the black and cream — gives depth without full contrast jump | HIGH |
| Warm taupe as the only true accent | `#d4cec6` | Section labels, dividers, secondary text | A de-saturated stone color; signals luxury through restraint, not saturation | HIGH |
| Semi-transparent white as glass | `rgba(255,255,255,0.26)` | Header gradients, button overlays | Creates the frosted glass material effect — this is the core visual signature | HIGH |
| 80% black frosted overlay | `color-mix(in srgb, #0b1012 80%, transparent)` | Navigation panel, quote panel | Darkens without opaque blocking; backdrop-filter makes it glow | HIGH |
| 20% white ghost button | `color-mix(in srgb, #fff 20%, transparent)` | CTA buttons on dark backgrounds | Ghost buttons that feel physically present rather than flat outlines | HIGH |
| Gradient footer fade | `linear-gradient(180deg, transparent 0, #000000b3)` | Image card bases, footer | Classic cinematic vignette — darkens bottom of images for text legibility | HIGH |

### Site's Token System

| Token | Value | Likely Purpose |
|-------|-------|---------------|
| `--color-black` | `#0b1012` | Primary dark background |
| `--color-white` | `#fff` | Primary light |
| `--color-cream` | `#f3f0ec` | Warm background surfaces |
| `--color-taupe` | `#d4cec6` | Accent / muted text / dividers |
| `--color-grey` | `#212325` | Secondary surface / button fill |
| `--ease-in-out-quart` | `cubic-bezier(.77,0,.175,1)` | Primary animation easing |
| `--ease-in-out-cubic` | `cubic-bezier(.645,.045,.355,1)` | Secondary animation easing |
| `--ease-in-out-quad` | `cubic-bezier(.455,.03,.515,.955)` | Loader / intro easing |
| `--ease-out-quart` | `cubic-bezier(.165,.84,.44,1)` | Enter animations |
| `--ease-out-cubic` | `cubic-bezier(.215,.61,.355,1)` | Hover / quick transitions |
| `--ease-out-quad` | `cubic-bezier(.25,.46,.45,.94)` | Subtle UI transitions |
| `--font-s` | `calc((100vw/1600)*10)` | Fluid type scale base unit |
| `--font-f-aeonik-mono` | `"Aeonik Mono"` | Label / UI font |
| `--font-f-aeonik-pro` | `"Aeonik Pro"` | Display / body font |

---

## Typography Insights

| Pattern | Font / Size / Weight | Where Seen | Why It Works | Confidence |
|---------|---------------------|-----------|-------------|-----------|
| Display headline — maximum confidence | Aeonik Pro, 6.4rem desktop / 4rem mobile, weight 700, letter-spacing -0.02em to -0.03em | Hero sections, about header, major section titles | Tight negative letter-spacing on a geometric sans at large scale reads as architectural confidence, not graphic design | HIGH |
| Body copy — reading weight | Aeonik Pro, 1.6–1.8rem, weight 400 | About manifesto, values sections, approach body | The regular weight at this size is generous and calm; never feels cramped | HIGH |
| Monospace label system — UI accent | Aeonik Mono, 1.2–1.4rem, weight 500–600, letter-spacing 0.08–0.1em, text-transform uppercase | Navigation links, button text, captions, category badges, all CTAs | Monospace uppercase with expanded tracking creates a strong functional register — clearly navigation/label, never confused with editorial | HIGH |
| Large blockquote / testimonial | Aeonik Pro, 3.2rem mobile / 6.4rem desktop, weight 400 | Reviews carousel | Large-scale editorial quote at regular weight lets the words carry weight rather than the font's boldness | HIGH |
| Section number / counter label | Aeonik Mono, 1.2rem, weight 600, uppercase, 0.1em tracking | Approach phase numbers (1–4) | Provides structural wayfinding with minimal visual noise | HIGH |
| Fluid type scale system | `calc((100vw/1600)*10)` base unit × multipliers | Site-wide | All type sizes are viewport-relative with a 1600px design base — type literally resizes with the viewport rather than snapping at breakpoints | HIGH |

### Font Stack (from source)

| Font Family | Format | Weights Available | Usage |
|------------|--------|------------------|-------|
| Aeonik Pro | WOFF2 + WOFF (self-hosted) | 400 (Regular), 700 (Bold) | Display headlines, body text, blockquotes |
| Aeonik Mono | WOFF2 + WOFF (self-hosted) | 500 (Medium), 600 (SemiBold) | Navigation, buttons, labels, captions, metadata |

Both fonts are self-hosted in `/_nuxt/` — no external font service dependency.

---

## Layout Patterns Worth Using

| Pattern | Library Name | Description | Where Seen | Best For | Confidence |
|---------|-------------|-------------|-----------|---------|-----------|
| Asymmetric two-column split with tall left image | L-Hero-Split | Left column: tall portrait image. Right column: text block with generous top margin offset. Not vertically centered — the text floats at about 40% from top. | About/Founders section | Brand story, team introductions | HIGH |
| Full-viewport video hero with text overlay | L-Hero-Full | 100svh container. Background video at 1920×1080. Centered display headline on top. Dark gradient at base for legibility. | About header, Showroom hero | Primary hero sections | HIGH |
| Horizontal scroll carousel for team/products | L-Carousel | Fixed-height row with horizontal overflow. Card widths alternate (27.6rem / 49.3rem / 62.2rem desktop) to avoid monotony. | Team section, Awards gallery | People, work, product galleries | HIGH |
| Bento-style product grid | L-Grid-Bento | 24-column grid. Product cards at fixed aspect-ratio (493:608 — a near-portrait ratio). "Premium" badge absolutely positioned top-right. | Collection page | Product showcases, portfolio grids | HIGH |
| Alternating process blocks | L-Zigzag | Numbered phases (1–4). Each phase: number + title left, body right. Image grids (2–3 per phase) below the text pair. Full-bleed section break between phases. | Approach page | Process sections, how-it-works | HIGH |
| Bottom-fixed navigation bar | (custom) | Header nav pinned to `bottom: 4rem` on desktop, `bottom: 2rem` mobile. Logo left, title center, burger right. Anti-pattern for most sites — works here because the scroll container is custom. | Site-wide | Scroll-driven single-page apps with custom scroll | MEDIUM |
| Filter panel slide-in (right-side drawer) | (custom) | Fixed panel at `inset: 4rem 4rem 4rem auto`. Cream background. Scrollable filter list. Closes by clicking overlay. | Collection page filter | Multi-filter product/listing pages | HIGH |

### Navigation Pattern

- Type: Bottom-fixed header with glassmorphic blur overlay (custom scroll container pattern)
- Header height: 5rem
- Position: Fixed, bottom of viewport (`bottom: 4rem` desktop, `bottom: 2rem` mobile)
- Background: `color-mix(in srgb, #0b1012 80%, transparent)` + `backdrop-filter: blur(2rem)`
- Links: Full-screen overlay menu panel — About, Collection, Projects, Approach, Contact, News, Showroom
- Mobile: Hamburger icon (top-right within the bottom header)
- Scroll behavior: Body has `overflow: hidden` — custom scroll container manages all scroll behavior

### Footer Pattern

- Background: `#0b1012` (darkest black)
- Has columns: Yes — links left, social right, legal bottom
- Social links: Yes (Instagram, YouTube, LinkedIn, X)
- Newsletter form: No
- Legal: Privacy policy + Terms & conditions
- Image overlay: `linear-gradient(180deg, transparent 0, #000000b3)` at transition from last content section

---

## Motion Patterns Observed

| Pattern | Category Name | Description | Trigger | Where Seen | Confidence |
|---------|-------------|-------------|---------|-----------|-----------|
| Page intro — rotating 3D cube loader | Kinetic Typography | `@keyframes cube-rotate`: `rotateX(-30deg) rotateY(0 → -315deg) scaleY(0.78)`. Duration: 1.5s. Easing: `--ease-in-out-quad`. | Page load | Homepage intro | HIGH |
| Line/text mask reveal | Clip-Path Reveal | Elements animate in from behind a mask. `transform: scaleX()` on underline spans. CSS `mask` or `clip-path` implied by class names (`.line-mask`). | Scroll enter | Section headings site-wide | HIGH |
| Underline hover animation | CSS Scroll-Driven | `transform: scaleX(0 → 1)` on pseudo-element underline. Duration: 0.5s. Easing: cubic-bezier. | Hover | Navigation links, body links | HIGH |
| Opacity + translateZ 3D reveal | Stagger Cascade | `transform: translateZ` combined with opacity for depth perception on entering elements. Will-change: transform, opacity declared. | Scroll enter | Section content, team cards | HIGH |
| Overlay fade (opacity 0 → 1 at 40%) | (UI state) | Dark semi-transparent overlay fades in over content. Transition: 1s. Used for menu open state and media overlays. | Click / menu open | Navigation panel, image hovers | HIGH |
| Parallax background shift | Parallax Depth | Background images/videos use `transform: translateY()` at a slower rate than scroll — creates depth separation. Z-index layering across sections. | Scroll scrub | Hero sections | MEDIUM |
| Scale/opacity loading state | Stagger Cascade | Elements scale from 0.9 → 1 with opacity 0 → 1. Used on page transitions. `will-change: transform, opacity` declared. | Route change | Page transitions | HIGH |
| Custom scroll container | Horizontal / Pin Scroll | `body { position: fixed; overflow: hidden }`. All scrolling managed by `.scroll` component. Enables smooth scroll velocity control. | Persistent | Site-wide | HIGH |

### Tech Stack Context

- Framework: Nuxt (Vue 3 with `<script setup>`)
- Animation: Custom CSS keyframes + CSS transitions (no GSAP detected)
- Scroll: Custom scroll container — body is fixed/overflow:hidden, scroll managed via JS (no Lenis or Locomotive detected, but equivalent behavior)
- 3D: None (no Three.js or Spline detected)
- CMS: Storyblok (content blocks)
- State: Pinia
- Smooth scroll: Yes (custom implementation)
- Custom cursor: Yes — `.cursor` component with `backdrop-filter: blur(2rem)` (desktop only, disabled on touch)
- Font sources: Self-hosted WOFF2/WOFF (no Google Fonts, no Typekit)
- Build: Vite (via Nuxt)
- Image formats: AVIF + WebP with lazy loading + `srcset`

---

## Interaction Analysis

### Header Behavior

- Type: Bottom-fixed with glassmorphic backdrop (non-standard — fixed to viewport bottom)
- Height: 5rem
- Background: `color-mix(in srgb, #0b1012 80%, transparent)`
- Blur: `backdrop-filter: blur(2rem)`
- Changes on scroll: Background opacity increases as overlay states activate; the `.is-overlay` class adds `main:before { opacity: 1 }` dark veil when menu is open

### Scroll-Triggered Animations (CONFIRMED via CSS class analysis)

| Section | Element | Property Changes | Motion Category | Notes |
|---------|---------|-----------------|----------------|-------|
| Hero | Background video | translateY (parallax slower than scroll) | Parallax Depth | Z-index layering for depth |
| All sections | Heading text | transform + opacity (mask reveal via `.line-mask`) | Clip-Path Reveal | Mask-based line entrance |
| Team carousel | Team member cards | translateZ + opacity 0→1 | Stagger Cascade | 3D depth reveal on enter |
| Collection grid | Product cards | opacity + transform | Stagger Cascade | Cards enter sequentially |
| Footer | Gradient overlay | opacity 0→1 via `.is-visible` | CSS Scroll-Driven | Vignette intensifies on scroll |

### Hover States (CONFIRMED via CSS)

| Element | CSS Changes | Interaction Pattern |
|---------|------------|-------------------|
| Navigation links | `transform: scaleX(0 → 1)` on `::after` underline pseudo-element, 0.5s cubic-bezier | I-Underline |
| Product cards | `background: linear-gradient(180deg, transparent 0, #000) opacity: 0.5` overlay darkens, button appears | I-Reveal |
| Award/logo cards | Border opacity increases on hover | I-Color-Shift |
| CTA buttons `.is-black` | Background transitions from transparent to `#212325`, text color flips | I-Color-Shift |
| CTA buttons `.is-white` | Inverse — white fills, text goes dark | I-Color-Shift |
| Custom cursor | Cursor element tracks mouse via JS, blur circle follows pointer | I-Cursor-Morph |
| Team member images | No color shift — grayscale filter maintained. May have scale transition. | I-Scale (MEDIUM) |

### Click States (CONFIRMED via CSS class names)

| Type | Component | State Change |
|------|-----------|-------------|
| Menu toggle | `.header` burger → `.menu` panel | Full-screen overlay panel fades/slides in. `.is-overlay` class adds dark veil to `main`. |
| Filter panel | `.filter-panel` | Slides in from right (`inset: 4rem 4rem 4rem auto`). Overlay closes on click outside. |
| Video player | `.player` | Custom controls: play/pause, mute, timeline scrub. Appears on video content sections. |
| Quote panel | `.quote-panel` | Slides in (likely from right, similar to filter panel). Form with file upload, submit. |

---

## Spacing System

- Base unit: 1rem (scales with `--font-s` fluid calculation against 1600px viewport)
- Desktop margins: 4rem left/right
- Mobile margins: 2rem left/right
- Grid gap desktop: 2rem
- Grid gap mobile: 1.5rem
- Section vertical spacing: 8rem (mobile) → 15rem (desktop) between major blocks
- Component internal padding: 1.5rem–3rem
- Form field height: 8rem (inputs), 4.4rem (buttons)
- Button padding: 1.5rem vertical × 2.4rem horizontal
- Header height: 5rem
- Navigation from bottom: 4rem desktop / 2rem mobile

### Spacing Scale Observed

| Value | Where Used |
|-------|-----------|
| 1.5rem | Grid gap mobile, form field gaps, internal padding base |
| 2rem | Grid gap desktop, page margins mobile, component spacing |
| 3rem | Section internal spacing, vertical rhythm between text blocks |
| 4rem | Page margins desktop, nav offset from bottom, filter panel inset |
| 8rem | Section vertical gaps (mobile) |
| 15rem | Section vertical gaps (desktop), content top margins |

---

## Responsive Analysis

| Aspect | Desktop | Mobile | Quality |
|--------|---------|--------|---------|
| Layout grid | 24-column, 4rem margins | 6-column, 2rem margins | Intentional — grid ratio change is meaningful |
| Typography | 6.4rem headlines, 1.6–1.8rem body, fluid scaling via `calc(100vw/1600*10)` | 4rem headlines, same fluid base (375px breakpoint) | Scaled well — font sizes are continuously fluid, not breakpoint-snapped |
| Navigation | Bottom-fixed header, burger on right | Same pattern — bottom header, burger opens full overlay | Good — consistent pattern, works well on touch |
| Interactions | Custom cursor (blur circle), underline hovers, subtle button fills | Cursor disabled on touch (touch detection), hover states absent | Adapted — correctly suppresses desktop-only interactions |
| Atmosphere | Full-viewport video backgrounds, parallax scroll depth | Video backgrounds maintained (likely replaced with poster image at narrow widths for performance) | Good — the site doesn't strip atmosphere for mobile |
| Carousel | Fixed-height horizontal scroll with alternating card sizes (27.6rem / 49.3rem / 62.2rem) | 27.6rem card width, same horizontal scroll | Good — card widths adjusted but behavior maintained |
| Filter panel | Slides in from right with ample padding | Same slide-in, adjusted insets | Passable — tight on very small screens |
| Image format | AVIF + WebP with srcset | Same | Good — modern format stack, lazy loaded |

---

## Section Rhythm

| # | Section Type | Energy | Key Technique | Desktop Layout | Mobile Layout |
|---|-------------|--------|---------------|---------------|--------------|
| 0 | Page intro / loader | HIGH | 3D rotating cube `@keyframes cube-rotate`, 1.5s, quadratic easing | Centered cube on dark background | Same |
| 1 | Hero (video) | HIGH | Full-viewport video + centered display headline + gradient vignette | 100svh full-bleed video, headline centered | Same, 4rem title size |
| 2 | Manifesto / brand statement | LOW | Asymmetric two-column text, generous vertical padding (15rem) | 24-col grid, text in cols 5–20 | Full width, stacked |
| 3 | Collection / product grid | MEDIUM | Aspect-ratio locked cards (493:608) in 24-col grid, gradient base overlay | 3–4 col product grid | 2-col grid |
| 4 | Process / approach | MEDIUM | Numbered alternating blocks (text + image grid), horizontal dividers | Zigzag left-right pairs, phase numbers | Stacked, full-width |
| 5 | Team carousel | HIGH | Horizontal scroll, alternating portrait/landscape card sizes, grayscale photography | Wide single-row carousel | Narrower cards, same scroll |
| 6 | Values / beliefs | LOW | Three-column equal blocks, top border divider, body copy at 1.6rem | 8-column each block | Stacked full-width |
| 7 | Testimonials carousel | HIGH | Large blockquote (6.4rem), grayscale author portrait, arrow navigation | Centered quote spanning cols 7–23 | 3.2rem quote, full width |
| 8 | Awards / credentials | LOW | Horizontal scroll gallery of logo blocks (25.7rem wide, 16.8rem tall), 1px borders | Negative-margin bleed, single row | 16rem cards, same scroll |
| 9 | Footer | LOW | Dark `#0b1012`, two-column links + social, legal strip | 24-col grid, comfortable spacing | Stacked columns |

---

## Borrow List (use these for NG Inmobiliaria)

1. **Warm near-black + warm cream palette — no pure black, no pure white** — The `#0b1012` / `#f3f0ec` combination creates a premium material warmth that pure `#000`/`#fff` cannot achieve. For a luxury real estate brand this reads as "high-end print" not "startup SaaS". Use `#0b1012` as the primary dark canvas and `#f3f0ec` as the light page background. [Confidence: HIGH] [Source: CSS tokens, site-wide]

2. **Single taupe/stone accent — `#d4cec6` register** — Fluid Glass avoids saturated accent colors entirely. Their only chromatic signal is a desaturated warm stone. For real estate luxury this is correct: vibrant accent colors feel cheap next to high-value property photography. A muted warm stone (similar to the taupe or a warm sand) will feel like a material choice, not a brand color. [Confidence: HIGH] [Source: `--color-taupe` token, section labels site-wide]

3. **Monospace uppercase label system as the secondary typographic voice** — Every button, every caption, every navigation link, every metadata field uses Aeonik Mono uppercase with 0.08–0.1em letter-spacing. This creates a strong two-register typographic system: editorial (display serif or geometric sans) for headlines, monospace functional for everything else. For NG Inmobiliaria: display font for property names and headlines, mono for price labels, bedroom counts, area m², floor levels, status badges. [Confidence: HIGH] [Source: `--font-f-aeonik-mono` token, navigation + all CTAs]

4. **Fluid type scale via viewport calculation** — `calc((100vw/1600)*10)` as the base unit means typography never snaps at breakpoints — it flows continuously. This is significantly smoother than breakpoint-based type scaling. For NG Inmobiliaria: implement the same pattern with the project's design base width. [Confidence: HIGH] [Source: `--font-s` token]

5. **Glassmorphism as a material echo, not a decorative trend** — Fluid Glass uses `backdrop-filter: blur(2rem)` + `color-mix(in srgb, [color] 20%, transparent)` on UI overlays because the product is literally glass. For NG Inmobiliaria the application should be equally justified: use frosted glass treatment on property detail overlays, floating price tags on hero images, and filter panels — elements that sit over photography and need to read as "windows." Never apply it to structural section backgrounds. [Confidence: HIGH] [Source: `.cursor`, navigation, filter panel, quote panel CSS]

6. **Aspect-ratio locked property cards at near-portrait ratio (493:608 ≈ 0.81:1)** — Product cards at this ratio show buildings beautifully: tall enough to capture a facade, wide enough to show context. The gradient overlay base `(linear-gradient(180deg, transparent 0, #000))` at 50% opacity creates natural text-legibility zones without blocking the image. Borrow this exact pattern for property listing cards in NG Inmobiliaria. [Confidence: HIGH] [Source: Collection page CSS, `aspect-ratio: 493/608`]

7. **Full-viewport video hero with bottom-gradient text legibility zone** — The `linear-gradient(180deg, #ffffff26, #fff3)` / `linear-gradient(180deg, transparent 0, #000000b3)` gradient pair creates a zone where text can sit over video without opacity hacks on the text itself. For NG Inmobiliaria: use this on the primary hero with a property video or aerial footage. [Confidence: HIGH] [Source: About header, Showroom hero CSS]

8. **Negative-letter-spacing on large display type** — Tight tracking (-0.02em to -0.03em) at 6.4rem creates architectural confidence. The headline "Passionately shaping glass into timeless design" doesn't shout — it commands. Apply to NG Inmobiliaria's large property name titles and hero headlines. [Confidence: HIGH] [Source: About page heading CSS]

---

## Avoid List (don't use these)

1. **Bottom-fixed navigation bar** — This is idiosyncratic to Fluid Glass's custom scroll container architecture (body: fixed, overflow: hidden). Without that specific scroll system it looks broken and confuses users. Standard top-sticky navigation is correct for NG Inmobiliaria.

2. **Grayscale-filtered photography** — Team portraits and client images run through `filter: grayscale(100%)`. This works for a glass product brand creating a deliberately desaturated, material world. Real estate photography must stay in color — property buyers are buying the warm kitchen light and the green garden. Desaturate and you destroy the emotional sell.

3. **3D loader cube animation** — The rotating cube on page load is a product demo in miniature (it is a glass cube). There is no natural analogue for real estate — do not invent one. A clean fade or a type reveal is more appropriate for the NG Inmobiliaria brand.

4. **Full-body `overflow: hidden` + custom scroll container** — This is a complex architecture choice that requires total control of the scroll experience. For a real estate site with long property listings, maps, and filter pages, native browser scroll is more robust and more performant. Use Lenis for smooth scroll instead.

5. **24-column grid as the primary thinking tool** — The 24-column system gives Fluid Glass extreme layout flexibility but is overkill for a real estate site's content patterns. A 12-column grid (or a 6-column with defined column multipliers) is simpler to maintain, easier to communicate to developers, and sufficient for the layouts NG Inmobiliaria needs.

6. **Monochrome brand with no warmth signal** — Fluid Glass works in near-neutrals alone because the product photographs as jewel-like color anyway. Real estate copy ("warm sun-filled apartment," "lush garden views") conflicts with a fully desaturated color system. NG Inmobiliaria needs a controlled warmth — keep the near-black and cream, but allow a warm gold or amber as a meaningful accent that the listing photography can breathe with.

7. **Storyblok-style modular block CMS architecture** — Fine for a glass product company with a small product catalog. For a real estate site with dynamic listings, filtering, search, and property detail pages, a proper structured data model (properties as entities with typed fields) is required — not a block CMS.

---

## Recommendations for NG Inmobiliaria

1. **Adopt the `#0b1012` / `#f3f0ec` near-black / warm-cream palette as the foundation.** Add a single warm accent — warm gold `#c9a96e` or champagne `#d4b896` — in the same desaturated-but-warm register as Fluid Glass's taupe. This gives the brand a color signal without breaking the luxury restraint. Fluid Glass's frame 0 (dark hero) and any cream-background section demonstrate exactly how well this two-tone base works.

2. **Build a two-register typography system: editorial display + monospace functional.** Use a geometric sans (like Neue Montreal, Cabinet Grotesk, or a proper licensed alternative to Aeonik Pro) for headlines at 5.6rem–6.4rem with tight -0.02em tracking. Use a monospace (like Space Mono, Geist Mono, or Commit Mono) at 1.2rem / uppercase / 0.08em tracking for ALL metadata: price, m², bedrooms, floor, status. This directly mirrors Fluid Glass's two-voice system and is perfectly suited to real estate's data-heavy listings.

3. **Use the 493:608 portrait card ratio for all property listing cards.** This ratio photographs Argentine residential architecture beautifully — tall enough for facades and balconies, wide enough for context. Implement the `linear-gradient(180deg, transparent 0, #000)` base overlay at 0.5 opacity for the price/metadata zone at the bottom of each card.

4. **Apply glassmorphism only to overlay UI: floating price tags, filter drawers, property quick-view panels.** Fluid Glass justifies frosted glass because it is the product. NG Inmobiliaria can justify it because real estate presentations use glass (floor plans on light tables, showroom panels, architectural models behind glazing). Limit to: filter panel, property hover overlay, navigation at scroll, map controls. Not on section backgrounds.

5. **Implement a right-side filter drawer for the property listing page** — identical pattern to Fluid Glass's `.filter-panel`. Fixed panel, cream background, slides in from right on desktop. Filters: property type, bedrooms, price range, neighborhood, m². This is the strongest direct UI pattern borrow from this reference.

6. **Use full-viewport video or aerial photography for the primary hero.** Fluid Glass's approach page and showroom hero both demonstrate the 100svh full-bleed treatment. For NG Inmobiliaria: Buenos Aires aerial footage, or a slow push through a featured property, with the agency name at display scale and a monospace tagline beneath. Apply the `linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7))` base for the CTA zone.

7. **Self-host fonts and avoid Google Fonts.** Fluid Glass's entire font stack is self-hosted (WOFF2 + WOFF). This eliminates the external request waterfall, prevents the Google Fonts privacy flag in GDPR regions, and allows zero-FOUT loading with `font-display: block`. For a luxury brand, a single flash of fallback font is visually unacceptable. Choose a font pair, acquire the WOFF2 files, and host them from the same origin.
