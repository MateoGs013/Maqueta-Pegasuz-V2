# Design Decision Trees

Concrete decision frameworks for all subjective design choices.
Agents follow these trees instead of relying on intuition.

---

## 1. Font Selection

### Step 1: Determine personality from mood

| Mood Keywords | Font Personality | Display Category | Body Category |
|---------------|-----------------|------------------|---------------|
| dark, cinematic, dramatic, bold | High-impact | Display sans or high-contrast serif | Clean grotesque sans |
| minimal, clean, elegant, refined | Sophisticated | Geometric sans or thin serif | Humanist sans |
| playful, fun, creative, energetic | Expressive | Quirky display or rounded sans | Friendly geometric sans |
| luxury, premium, exclusive, haute | Prestigious | High-contrast didone serif | Refined sans |
| tech, futuristic, digital, cyber | Technical | Geometric or monospaced display | Monospaced or geometric sans |
| editorial, magazine, storytelling | Editorial | Display serif with personality | Classic readable serif or sans |
| brutalist, raw, industrial, grunge | Raw | Bold grotesque or condensed | Monospaced or system-adjacent |
| organic, natural, warm, handmade | Organic | Soft serif or humanist display | Readable humanist sans |

### Step 2: Select specific fonts (Google Fonts available)

**Display fonts (headlines):**

| Category | Font | Character | Pairs With |
|----------|------|-----------|------------|
| Display sans | **Space Grotesk** | Geometric, tech-forward | JetBrains Mono, Inter (only as body) |
| Display sans | **Clash Display** (Fontshare) | Bold geometric, premium | Satoshi, General Sans |
| Display sans | **Syne** | Wide, futuristic | DM Sans, Outfit |
| Display sans | **Archivo Black** | Heavy, impactful | Archivo, Source Sans 3 |
| Display sans | **Unbounded** | Rounded, modern | Outfit, Plus Jakarta Sans |
| High-contrast serif | **Playfair Display** | Classic editorial luxury | Source Sans 3, Lato |
| High-contrast serif | **DM Serif Display** | Sharp, contemporary | DM Sans |
| Serif | **Fraunces** | Quirky optical, warm | Commissioner, Outfit |
| Serif | **Lora** | Elegant, readable | Merriweather Sans, Nunito Sans |
| Geometric | **Orbitron** | Sci-fi, technical | Rajdhani, Exo 2 |
| Geometric | **Audiowide** | Futuristic display | Questrial, Titillium Web |
| Condensed | **Oswald** | Tall, bold, editorial | Quattrocento Sans, Open Sans |
| Condensed | **Bebas Neue** | All-caps display, impact | Montserrat, Raleway |

**Body fonts (text):**

| Category | Font | Character |
|----------|------|-----------|
| Grotesque | **Satoshi** (Fontshare) | Modern, clean, premium |
| Grotesque | **General Sans** (Fontshare) | Neutral, versatile |
| Geometric | **DM Sans** | Google's premium workhorse |
| Geometric | **Outfit** | Friendly, rounded terminals |
| Geometric | **Plus Jakarta Sans** | Refined, contemporary |
| Humanist | **Source Sans 3** | Adobe's readable classic |
| Humanist | **Nunito Sans** | Soft, approachable |
| Mono | **JetBrains Mono** | Technical, developer |
| Mono | **Fira Code** | Ligatures, code-oriented |

### Step 3: Validate pairing

- [ ] Display and body are from DIFFERENT categories (serif + sans, geometric + humanist)
- [ ] Display has strong personality at 64px+ (not bland or generic)
- [ ] Body is readable at 16px with line-height 1.5-1.6
- [ ] Both available on Google Fonts or Fontshare (free)
- [ ] Neither is Inter, Roboto, Arial, Open Sans, or system-ui

---

## 2. Palette Construction

### Step 1: Select near-black base

| Mood | Base Color | Hex | HSL |
|------|-----------|-----|-----|
| Tech / SaaS / futuristic | Cool blue | `#0a0a12` | 240, 30%, 5% |
| Creative / luxury digital | Cool violet | `#0d0b14` | 260, 30%, 5% |
| Versatile / product-focused | Neutral | `#0a0a0a` | 0, 0%, 4% |
| Luxury / editorial / warm | Warm amber | `#0f0d0a` | 35, 25%, 5% |
| Nature / fintech / health | Green-tinted | `#0a0f0c` | 140, 25%, 5% |

For light themes: warm white base `#fafaf7` (HSL: 50, 33%, 97%) — never pure `#fff`.

### Step 2: Build gray scale (5 steps)

From base, increase lightness in steps. Maintain same hue.

| Token | Role | Lightness | Example (cool blue base) |
|-------|------|-----------|--------------------------|
| `--canvas` | Page background | 5% | `#0a0a12` |
| `--surface` | Elevated cards/panels | 9% | `#141420` |
| `--surface-2` | Higher elevation | 13% | `#1e1e2e` |
| `--border` | Subtle borders | 18% | `#2a2a3c` |
| `--muted` | Disabled text, placeholders | 40% | `#5c5c78` |

### Step 3: Select text colors

| Token | Role | Value |
|-------|------|-------|
| `--text` | Primary text | `#fafaf7` (warm white) |
| `--text-secondary` | Secondary text | 70% opacity of --text |
| `--text-muted` | Tertiary/disabled | 40% opacity of --text |

### Step 4: Select accent colors (1 primary + 1 secondary)

| Mood | Primary Accent | Hex | Secondary Accent |
|------|---------------|-----|------------------|
| Bold / energetic | Electric green | `#00ff88` | Warm yellow `#ffd60a` |
| Premium / luxury | Gold | `#d4a853` | Cream `#f5e6c8` |
| Tech / digital | Electric blue | `#3b82f6` | Cyan `#06b6d4` |
| Creative / artistic | Coral/salmon | `#ff6b6b` | Mint `#64dfdf` |
| Warm / editorial | Terracotta | `#c2703e` | Sage `#8fae8b` |
| Minimal / elegant | Single white accent | `#ffffff` | None (monochrome) |
| Brutalist / raw | Neon yellow | `#e4ff1a` | Hot red `#ff3333` |
| Nature / organic | Forest green | `#2d6a4f` | Earth brown `#a68a64` |

**Rules:**
- Primary accent must have ≥ 4.5:1 contrast against --canvas
- Aim for 7:1+ contrast for maximum visual impact
- NEVER use purple gradient (#667eea → #764ba2) — most common AI fingerprint
- NEVER use Tailwind default indigo (#5E6AD2)

### Step 5: Add semantic colors

| Token | Role | Value |
|-------|------|-------|
| `--success` | Positive feedback | Green-tinted (`#22c55e` or similar) |
| `--warning` | Caution | Amber-tinted (`#f59e0b` or similar) |
| `--error` | Negative feedback | Red-tinted (`#ef4444` or similar) |

### Step 6: Validate palette

- [ ] 8+ total colors (canvas + 5 grays + text + 2 accents + 3 semantic = 12)
- [ ] No pure #000 or #fff — all near-blacks and warm whites
- [ ] Primary accent contrast ≥ 4.5:1 against canvas
- [ ] Palette is NOT purple-gradient or Tailwind-indigo
- [ ] Color temperature is intentional (warm OR cool, not neither)
- [ ] Accent colors create emotional response (not safe/bland)

---

## 3. Typography Scale

### Step 1: Select scale ratio from project type

| Project Type | Ratio | Name | Character |
|--------------|-------|------|-----------|
| Data-heavy app, dashboard | 1.200 | Minor Third | Moderate contrast |
| General website, portfolio | 1.250 | Major Third | Balanced, versatile |
| Marketing, landing page | 1.333 | Perfect Fourth | Strong contrast |
| Editorial, magazine | 1.414 | Augmented Fourth | Dramatic |
| Display-heavy, luxury | 1.500 | Perfect Fifth | High contrast |

### Step 2: Compute scale (base 16px)

Apply selected ratio to compute each step:

| Token | Formula | 1.250 ratio | 1.333 ratio | 1.414 ratio |
|-------|---------|-------------|-------------|-------------|
| `--text-xs` | base ÷ ratio² | 10px | 9px | 8px |
| `--text-sm` | base ÷ ratio | 13px | 12px | 11px |
| `--text-base` | base | 16px | 16px | 16px |
| `--text-lg` | base × ratio | 20px | 21px | 23px |
| `--text-xl` | base × ratio² | 25px | 28px | 32px |
| `--text-2xl` | base × ratio³ | 31px | 38px | 45px |
| `--text-3xl` | base × ratio⁴ | 39px | 50px | 64px |
| `--text-4xl` | base × ratio⁵ | 49px | 67px | 91px |
| `--text-5xl` | base × ratio⁶ | 61px | 89px | 128px |
| `--text-6xl` | base × ratio⁷ | 76px | 119px | 181px |

### Step 3: Assign fluid typography with clamp()

```
slope = (maxSize - minSize) / (1440 - 375)
intercept = minSize - (slope × 375)
preferred = intercept(rem) + slope × 100vw
```

Standard fluid values:

| Token | Clamp (1.250 ratio) | Clamp (1.333 ratio) |
|-------|---------------------|---------------------|
| `--text-base` | `clamp(1rem, 0.95rem + 0.19vw, 1.125rem)` | `clamp(1rem, 0.95rem + 0.19vw, 1.125rem)` |
| `--text-lg` | `clamp(1.25rem, 1.1rem + 0.56vw, 1.5rem)` | `clamp(1.31rem, 1.1rem + 0.75vw, 1.69rem)` |
| `--text-xl` | `clamp(1.56rem, 1.25rem + 1.13vw, 2rem)` | `clamp(1.75rem, 1.3rem + 1.6vw, 2.5rem)` |
| `--text-3xl` | `clamp(2.44rem, 1.8rem + 2.25vw, 3.5rem)` | `clamp(3.13rem, 2rem + 4vw, 5rem)` |
| `--text-5xl` | `clamp(3.05rem, 2rem + 3.75vw, 5rem)` | `clamp(4rem, 2.5rem + 5.6vw, 7.5rem)` |

### Step 4: Set line-height and letter-spacing per size

| Size Range | Line-Height | Letter-Spacing |
|------------|-------------|----------------|
| Display (64px+) | 0.9 - 1.0 | -0.03em to -0.02em |
| H1 (48-64px) | 1.0 - 1.1 | -0.02em |
| H2-H3 (32-48px) | 1.1 - 1.2 | -0.01em |
| Body (16-18px) | 1.5 - 1.6 | 0 to +0.01em |
| Small (12-14px) | 1.6 - 1.8 | +0.01em to +0.02em |
| ALL CAPS labels | — | +0.08em to +0.12em |
| Buttons | — | +0.05em to +0.1em |

### Step 5: Validate

- [ ] Largest ÷ smallest font size ≥ 4x
- [ ] At least 8 distinct sizes in scale
- [ ] Line-height varies per size (not uniform)
- [ ] Letter-spacing tightens at large sizes, opens at small sizes
- [ ] Fluid clamp() on all sizes above --text-base
- [ ] Characters per line: 50-75 on desktop, 30-50 on mobile

---

## 4. Easing Curve Selection

### Standard curve set (every project gets all 4)

| Token | Cubic-Bezier | Character | Use For |
|-------|-------------|-----------|---------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth deceleration, silk | Default for reveals, modals, large movements |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetric, intentional | Page transitions, morphing |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful overshoot | Buttons, hover states, success feedback |
| `--ease-snap` | `cubic-bezier(0.5, 0, 0, 1)` | Quick start, dramatic stop | Snappy reveals, menu items |

### Personality-specific additions (pick 1-2 per project)

| Mood | Additional Curve | Cubic-Bezier | Character |
|------|-----------------|-------------|-----------|
| Cinematic | `--ease-dramatic` | `cubic-bezier(0.7, 0, 0.3, 1)` | Slow build, sharp resolve |
| Playful | `--ease-elastic` | GSAP `elastic.out(1, 0.3)` | Bouncy spring |
| Minimal | `--ease-subtle` | `cubic-bezier(0.25, 0.1, 0.25, 1)` | Barely perceptible |
| Luxury | `--ease-crawl` | `cubic-bezier(0.19, 1, 0.22, 1)` | Ultra-smooth, slow reveal |
| Tech | `--ease-step` | `steps(8, end)` | Digital, mechanical |

### Duration tokens

| Token | Value | Use For |
|-------|-------|---------|
| `--dur-micro` | 100ms | Tooltips, button press |
| `--dur-fast` | 200ms | Hovers, toggles, feedback |
| `--dur-medium` | 400ms | Small reveals, dropdowns |
| `--dur-slow` | 800ms | Section reveals, large movements |
| `--dur-crawl` | 1200ms | Hero sequences, dramatic moments |

### Stagger tokens

| Token | Value | Context |
|-------|-------|---------|
| `--stagger-char` | 25ms | Character-by-character text animation |
| `--stagger-word` | 80ms | Word-by-word text animation |
| `--stagger-item` | 100ms | List/grid items |
| `--stagger-section` | 150ms | Major elements within a section |

---

## 5. Atmosphere Technique Selection

### Decision tree

```
Is the project tech/SaaS/futuristic?
├── YES → Does it justify 3D complexity?
│   ├── YES → Spline scene (abstract geometry, particles)
│   └── NO → Animated gradient mesh (CSS radial-gradients + scroll response)
└── NO
    Is the project luxury/editorial/portfolio?
    ├── YES → Gradient mesh with grain + vignette
    └── NO
        Is the project playful/creative?
        ├── YES → Animated noise field or particle canvas
        └── NO → Layered radial-gradients with parallax response
```

### Atmosphere specs by technique

**Gradient mesh (most common):**
```css
background-color: var(--canvas);
background-image:
  radial-gradient(circle at 20% 30%, var(--accent-primary-10) 0%, transparent 50%),
  radial-gradient(circle at 80% 60%, var(--accent-secondary-10) 0%, transparent 60%);
```
- 2-3 radial gradients, each at 8-15% accent opacity
- Positioned asymmetrically (never centered)
- Responds to scroll: shift position or opacity

**Grain overlay (ALL projects):**
```css
.section::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-repeat: repeat;
  opacity: 0.03; /* 2-4% range */
  pointer-events: none;
  z-index: 10;
  animation: grain 0.5s steps(6) infinite;
}
```

**Vignette (dark projects):**
```css
radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)
```

**Spline 3D (only when justified):**
- Scene concept must be described: what objects, what behavior
- Self-hosted .splinecode URL required
- Max 1-2 per page, 1 on mobile
- Static image fallback ALWAYS required
- Bundle adds ~500KB-1MB (lazy-loaded)

---

## 6. Section Planning

### Homepage section count

| Project Type | Min Sections | Typical | Max |
|--------------|-------------|---------|-----|
| Portfolio | 8 | 8-10 | 12 |
| Landing page | 6 | 8-10 | 12 |
| SaaS / Product | 8 | 10-12 | 14 |
| Agency / Studio | 8 | 10-12 | 14 |
| Editorial / Blog | 6 | 8-10 | 12 |

### Standard section sequence (pick from this order)

| Position | Section Type | Purpose | Required? |
|----------|-------------|---------|-----------|
| 1 | **Hero** | First impression, brand statement | YES |
| 2 | **Statement / Manifesto** | What we believe, brand personality | Optional |
| 3 | **Services / Features** | What we do / offer | YES |
| 4 | **Work / Portfolio** | Proof of capability | YES (portfolio/agency) |
| 5 | **Process / How It Works** | Methodology, numbered steps | Optional |
| 6 | **About / Team** | Human element, credibility | Optional |
| 7 | **Stats / Numbers** | Social proof with data | Optional |
| 8 | **Testimonials / Clients** | Social proof with words | Optional |
| 9 | **Blog / News** | Content freshness | Optional |
| 10 | **CTA** | Call to action, conversion | YES |
| 11 | **Contact** | Form or contact info | YES (if standalone page) |
| 12 | **Footer** | Navigation, legal, social | YES |

### Other pages (minimum sections)

| Page | Min Sections | Required Types |
|------|-------------|----------------|
| About | 5 | Hero, Story, Values/Skills, Team/Bio, CTA |
| Work | 5 | Hero, Project Grid, Case Study Preview, Process, CTA |
| Contact | 4 | Hero, Form, Map/Location, CTA |
| Services | 6 | Hero, Overview, Service Details, Process, Pricing, CTA |

### Energy rhythm

Sections must alternate energy levels. Never 3+ HIGH or 3+ LOW in sequence.

| Section Type | Default Energy |
|--------------|---------------|
| Hero | HIGH |
| Statement | LOW |
| Services | MEDIUM |
| Work/Portfolio | HIGH |
| Process | MEDIUM |
| About | LOW |
| Stats | MEDIUM-HIGH |
| Testimonials | LOW |
| CTA | HIGH |
| Contact | LOW |
| Footer | LOW |

---

## 7. Motion Category Assignment

### Section type → compatible categories

| Section Type | Compatible Motion Categories (pick 1) |
|-------------|---------------------------------------|
| Hero | 1-Clip-Path Reveal, 3-Parallax Depth, 5-Kinetic Typography |
| Statement | 5-Kinetic Typography, 6-Scroll-Speed Differential, 9-Draw-On |
| Services | 2-Stagger Cascade, 4-Counter/Ticker, 8-Morph/Flip |
| Work/Portfolio | 1-Clip-Path Reveal, 7-Infinite Marquee, 10-Perspective Tilt |
| Process | 2-Stagger Cascade, 9-Draw-On, 4-Counter/Ticker |
| About | 3-Parallax Depth, 6-Scroll-Speed Differential, 5-Kinetic Typography |
| Stats | 4-Counter/Ticker, 2-Stagger Cascade, 9-Draw-On |
| Testimonials | 8-Morph/Flip, 11-Scroll-Snap Carousel, 2-Stagger Cascade |
| CTA | 5-Kinetic Typography, 1-Clip-Path Reveal, 10-Perspective Tilt |
| Contact | 2-Stagger Cascade, 3-Parallax Depth, 6-Scroll-Speed Differential |
| Footer | 2-Stagger Cascade, 6-Scroll-Speed Differential |

### Assignment algorithm

1. For each section in order, look up compatible categories
2. Pick the FIRST compatible category that was NOT used in the previous section
3. If all compatible categories conflict with previous, pick the LEAST recently used
4. Verify: no two adjacent sections share a category
5. Aim for ≥ 5 unique categories across the homepage

---

## 8. Spatial Composition Defaults

### Grid ratio presets (never 1fr 1fr)

| Ratio | Grid | Character | Best For |
|-------|------|-----------|----------|
| Golden | `1.618fr 1fr` | Classic proportion | Hero, about |
| Asymmetric | `1.4fr 0.6fr` | Moderate asymmetry | Features, services |
| Dominant | `2fr 0.8fr` | Strong hierarchy | Hero, statement |
| Narrow accent | `2.5fr 0.5fr` | Extreme asymmetry | Work showcase, stats |
| Three-column | `1.2fr 1fr 0.8fr` | Varied columns | Features, process |

### Overlap amounts

| Overlap Type | Amount | Implementation |
|--------------|--------|----------------|
| Image into text column | 40-80px | `margin-left: -60px` or absolute positioning |
| Section overlap (next section) | 60-120px | `margin-top: -80px; position: relative; z-index: 2` |
| Decorative bleed | 20-50% of element | `position: absolute` with negative offset |
| Typography bleed | 10-20% beyond container | `font-size: 15vw` or negative margin |

### Section padding presets (asymmetric)

| Section Position | Padding-Top | Padding-Bottom |
|-----------------|-------------|----------------|
| Hero (first) | `clamp(120px, 15vw, 200px)` | `clamp(80px, 10vw, 140px)` |
| High energy | `clamp(100px, 12vw, 160px)` | `clamp(64px, 8vw, 120px)` |
| Low energy | `clamp(80px, 10vw, 120px)` | `clamp(64px, 8vw, 96px)` |
| CTA | `clamp(64px, 8vw, 96px)` | `clamp(80px, 10vw, 120px)` (inverted) |
| Footer | `clamp(64px, 8vw, 96px)` | `clamp(32px, 4vw, 48px)` |

### Container widths

| Context | Max-Width |
|---------|-----------|
| Content container | 1200px |
| Text-heavy content | 1100px |
| Narrow text column | 720px |
| Full-width sections | 100vw (no container) |

---

## 9. Responsive Breakdowns

### Breakpoints

| Name | Width | Columns | Container Margin |
|------|-------|---------|-----------------|
| Mobile | 375px | 1 | 20px |
| Tablet | 768px | 2 | 40px |
| Desktop | 1280px | 12 | 60px |
| Large desktop | 1440px | 12 | auto (centered) |

### Common responsive transformations

| Desktop Pattern | Tablet | Mobile |
|----------------|--------|--------|
| 2-column grid | 2-column (narrower gap) | Single column stacked |
| 3-column grid | 2-column + 1 below | Single column stacked |
| Asymmetric split (1.4fr 0.6fr) | Single column, image first | Single column, image first |
| Overlapping elements | Reduce overlap by 50% | Remove overlap, stack |
| Container breaks | Maintain on tablet | Remove, full-width |
| Font size 72px+ | Scale down 70% | Scale down 50% |
| Section padding 160px | 120px | 80px |
| Decorative elements | Keep if < 30% of viewport | Hide or simplify |
