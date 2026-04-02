<script setup>
/**
 * S-BrutalistGrid  |  Neo-Brutalist Grid Hero
 * ─────────────────────────────────────────────
 * Raw, unapologetic brutalism. Heavy 3px borders,
 * oversized type, extreme typographic contrast,
 * monochromatic power. The grid IS the design.
 *
 * Structure:
 *   Row 1 [64px]  — Navigation bar with thick ruled border
 *   Row 2 [1fr]   — Main grid (Zone A headline | Zone C description)
 *                   (Zone B services below Zone A, thick rule top)
 *   Row 3 [52px]  — Footer strip with metadata
 *
 * Signature: Thick ruled lines (3px) "draw themselves" on entrance
 * — scaleY/scaleX 0->1. A massive watermark number behind Zone A.
 *
 * Theme: 'dark' (default) or 'light' via data-theme attribute.
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SBrutalistGrid' })

const props = defineProps({
  eyebrow:      { type: String, default: 'Digital Studio' },
  index:        { type: String, default: '01' },
  headline:     { type: String, default: 'WE BUILD\nWHAT\nMATTERS.' },
  description:  { type: String, default: 'Strategy-led design and engineering for companies that refuse to be ordinary.' },
  ctaLabel:     { type: String, default: 'Start a project' },
  ctaHref:      { type: String, default: '#contact' },
  metaYear:     { type: String, default: '2024' },
  metaAgency:   { type: String, default: 'Forge Studio' },
  metaLocation: { type: String, default: 'Buenos Aires' },
  services: {
    type: Array,
    default: () => ['Brand Strategy', 'Product Design', 'Engineering', 'Launch'],
  },
  theme:        { type: String, default: 'dark' },
})

const sectionRef = ref(null)
const ctaRef = ref(null)
let mm = null

const headlineLines = computed(() => props.headline.split('\n'))
const computedTheme = computed(() => props.theme === 'light' ? 'light' : 'dark')

onMounted(() => {
  const el = sectionRef.value
  if (!el) return

  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 1280px)',
    isTablet: '(min-width: 768px) and (max-width: 1279px)',
    isMobile: '(max-width: 767px)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  }, (context) => {
    const { reduceMotion, isMobile } = context.conditions
    if (reduceMotion) return

    // ── Initial states ────────────────────────────────────
    const vRule = el.querySelector('.bg-v-rule')
    const hRule = el.querySelector('.bg-h-rule')

    if (vRule) gsap.set(vRule, { scaleY: 0, transformOrigin: 'top center' })
    if (hRule) gsap.set(hRule, { scaleX: 0, transformOrigin: 'left center' })

    gsap.set(el.querySelector('.bg-watermark'),    { autoAlpha: 0, scale: 0.92 })
    gsap.set(el.querySelectorAll('.bg-headline-line .bg-headline-inner'), { yPercent: 108 })
    gsap.set(el.querySelector('.bg-eyebrow'),      { autoAlpha: 0 })
    gsap.set(el.querySelector('.bg-index'),        { autoAlpha: 0 })
    gsap.set(el.querySelector('.bg-description'),  { autoAlpha: 0, y: 16 })
    gsap.set(el.querySelector('.bg-cta'),          { autoAlpha: 0, y: 10, clipPath: 'inset(0 100% 0 0)' })
    gsap.set(el.querySelectorAll('.bg-service'),   { autoAlpha: 0, x: -16 })
    gsap.set(el.querySelector('.bg-footer'),       { autoAlpha: 0 })

    // ── Entrance timeline ─────────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // 2. Rules DRAW — the signature moment
    if (vRule) {
      tl.to(vRule, { scaleY: 1, duration: 1.4, ease: 'power2.inOut' }, 0.2)
    }
    if (hRule) {
      tl.to(hRule, { scaleX: 1, duration: 1.0, ease: 'power2.inOut' }, 0.6)
    }

    // 3. Watermark fades in with subtle scale
    tl.to(el.querySelector('.bg-watermark'), {
      autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power4.out',
    }, 0.3)

    // 4. Headline reveals (line by line)
    tl.to(el.querySelectorAll('.bg-headline-line .bg-headline-inner'), {
      yPercent: 0, stagger: 0.12, duration: 0.9, ease: 'power4.out',
    }, 0.5)

    // 5. Eyebrow + index
    tl.to(el.querySelector('.bg-eyebrow'), { autoAlpha: 1, duration: 0.5 }, 0.8)
      .to(el.querySelector('.bg-index'),   { autoAlpha: 1, duration: 0.5 }, 0.85)

    // 6. Description + CTA
    tl.to(el.querySelector('.bg-description'), {
      autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out',
    }, 0.9)
    tl.to(el.querySelector('.bg-cta'), {
      autoAlpha: 1, y: 0, clipPath: 'inset(0 0% 0 0)',
      duration: 0.7, ease: 'power3.inOut',
    }, 1.0)

    // 7. Services stagger in
    tl.to(el.querySelectorAll('.bg-service'), {
      autoAlpha: 1, x: 0, stagger: 0.07, duration: 0.5, ease: 'power3.out',
    }, 0.95)

    // 8. Footer last
    tl.to(el.querySelector('.bg-footer'), { autoAlpha: 1, duration: 0.5 }, 1.1)

    // ── Scroll parallax ──────────────────────────────────
    ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      onUpdate(self) {
        const p = self.progress
        gsap.set(el.querySelector('.bg-watermark'), { y: p * 70 })
        gsap.set(el.querySelectorAll('.bg-headline-line'), { y: p * -25 })
        if (vRule) gsap.set(vRule, { autoAlpha: 1 - p * 0.4 })
      },
    })

    // ── Magnetic CTA ─────────────────────────────────────
    const ctaEl = ctaRef.value
    if (ctaEl && !isMobile) {
      const xTo = gsap.quickTo(ctaEl, 'x', { duration: 0.5, ease: 'power3.out' })
      const yTo = gsap.quickTo(ctaEl, 'y', { duration: 0.5, ease: 'power3.out' })

      const onMove = (e) => {
        const r = ctaEl.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.35)
        yTo((e.clientY - r.top - r.height / 2) * 0.35)
      }
      const onLeave = () => { xTo(0); yTo(0) }

      ctaEl.addEventListener('mousemove', onMove)
      ctaEl.addEventListener('mouseleave', onLeave)

      return () => {
        ctaEl.removeEventListener('mousemove', onMove)
        ctaEl.removeEventListener('mouseleave', onLeave)
      }
    }
  }, sectionRef.value)
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section
    ref="sectionRef"
    class="s-bg"
    :data-theme="computedTheme"
    aria-label="Hero section"
  >
    <!-- ── Grain overlay ────────────────────────── -->
    <div class="bg-grain" aria-hidden="true"></div>

    <!-- ── Main grid ────────────────────────────── -->
    <div class="bg-main">
      <!-- Vertical rule (between columns) — desktop only -->
      <div class="bg-v-rule" aria-hidden="true"></div>
      <!-- Horizontal rule (zone A / zone B divider) — desktop only -->
      <div class="bg-h-rule" aria-hidden="true"></div>

      <!-- Zone A: Headline ──────────────────────── -->
      <div class="bg-zone-a">
        <!-- Watermark number -->
        <span class="bg-watermark" aria-hidden="true">{{ index }}</span>

        <!-- Eyebrow (vertical, top-right of zone A) -->
        <span class="bg-eyebrow">{{ eyebrow }}</span>

        <!-- Index number top-right corner -->
        <span class="bg-index">({{ index }})</span>

        <!-- Headline with overflow:hidden line wrappers -->
        <p class="bg-headline" :aria-label="headline.replace(/\n/g, ' ')">
          <span
            v-for="(line, i) in headlineLines"
            :key="i"
            class="bg-headline-line"
          ><span class="bg-headline-inner">{{ line }}</span></span>
        </p>
      </div>

      <!-- Zone B: Services ──────────────────────── -->
      <div class="bg-zone-b">
        <span
          v-for="(service, i) in services"
          :key="i"
          class="bg-service"
        >{{ service }}</span>
      </div>

      <!-- Zone C: Description + CTA ─────────────── -->
      <div class="bg-zone-c">
        <div class="bg-zone-c-inner">
          <p class="bg-description">{{ description }}</p>
          <a
            ref="ctaRef"
            :href="ctaHref"
            class="bg-cta"
            data-magnetic
          >
            <span class="bg-cta-label">{{ ctaLabel }}</span>
            <span class="bg-cta-arrow" aria-hidden="true">&#8599;</span>
          </a>
        </div>
      </div>
    </div>

    <!-- ── Footer strip ─────────────────────────── -->
    <footer class="bg-footer" aria-label="Hero metadata">
      <span class="bg-meta">{{ metaAgency }}</span>
      <span class="bg-meta">{{ metaLocation }}</span>
      <span class="bg-meta">&copy; {{ metaYear }}</span>
    </footer>
  </section>
</template>

<style scoped>
/* ──────────────────────────────────────────────────
   ROOT
────────────────────────────────────────────────── */
.s-bg {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  min-height: 600px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--color-canvas);
  color: var(--color-text);
  overflow: hidden;
  font-family: var(--font-body);

  /* Theme-dependent CSS vars for rules + watermark */
  --bg-rule-color: rgba(255, 255, 255, 0.18);
  --bg-watermark-color: rgba(255, 255, 255, var(--hero-watermark-opacity, 0.055));
}

/* ── Light theme override ──────────────────────── */
.s-bg[data-theme="light"] {
  background: var(--color-canvas-invert);
  color: var(--color-text-invert);
  --bg-rule-color: rgba(10, 10, 15, 0.18);
  --bg-watermark-color: rgba(10, 10, 15, var(--hero-watermark-opacity, 0.055));
}
.s-bg[data-theme="light"] .bg-nav-cta:hover {
  background: var(--color-text-invert);
  color: var(--color-canvas-invert);
}
.s-bg[data-theme="light"] .bg-cta:hover {
  color: var(--color-canvas-invert);
}

/* ── Atmospheric vignette on root ──────────────── */
.s-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 100%,
    transparent 50%,
    rgba(0, 0, 0, 0.25) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* ── Grain overlay ─────────────────────────────── */
.bg-grain {
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  background-repeat: repeat;
  opacity: 0.025;
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: grain 0.5s steps(6) infinite;
}
@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(-5%, -5%); }
  50%      { transform: translate(5%, 0); }
  75%      { transform: translate(0, 5%); }
}

/* ──────────────────────────────────────────────────
   MAIN GRID
────────────────────────────────────────────────── */
.bg-main {
  display: grid;
  grid-template-columns: 1.63fr 1fr;
  grid-template-rows: 1fr auto;
  height: 100%;
  position: relative;
}

/* ── Ruled lines (absolute positioned) ─────────── */
.bg-v-rule {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 62%;
  width: var(--hero-rule-width);
  background: var(--bg-rule-color);
  z-index: var(--z-raised);
  transform-origin: top center;
}

.bg-h-rule {
  position: absolute;
  left: 0;
  width: 62%;
  /* Sits on the Zone A / Zone B boundary — auto row line */
  bottom: 0;
  height: var(--hero-rule-width);
  background: var(--bg-rule-color);
  z-index: var(--z-raised);
  transform-origin: left center;
}

/* ──────────────────────────────────────────────────
   ZONE A — Headline (top-left, largest zone)
────────────────────────────────────────────────── */
.bg-zone-a {
  grid-column: 1;
  grid-row: 1;
  padding: var(--space-20) var(--space-section-x) var(--space-12);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  overflow: hidden;
}

/* Watermark — massive background number (the 2nd signature) */
.bg-watermark {
  position: absolute;
  right: -0.05em;
  bottom: -0.12em;
  font-family: var(--font-display);
  font-size: clamp(200px, 28vw, 420px);
  font-weight: 900;
  letter-spacing: -0.08em;
  line-height: var(--leading-none);
  color: var(--bg-watermark-color);
  pointer-events: none;
  user-select: none;
  z-index: var(--z-base);
}

/* Eyebrow — vertical text anchored top-right of zone A */
.bg-eyebrow {
  position: absolute;
  top: var(--space-16);
  right: var(--space-8);
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  opacity: 0.5;
}

/* Index number — top right corner */
.bg-index {
  position: absolute;
  top: var(--space-8);
  right: var(--space-section-x);
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  opacity: 0.4;
}

/* Headline — MASSIVE typography */
.bg-headline {
  font-family: var(--font-display);
  font-size: clamp(64px, 9vw, 148px);
  font-weight: 700;
  line-height: var(--leading-none);
  letter-spacing: -0.03em;
  text-transform: uppercase;
  position: relative;
  z-index: var(--z-raised);
  margin: 0;
}

.bg-headline-line {
  display: block;
  overflow: hidden;
  /* Clip-path used on each headline line for brutalist cut feel */
  clip-path: inset(0 0 0 0);
}

.bg-headline-inner {
  display: block;
}

/* ──────────────────────────────────────────────────
   ZONE B — Services (bottom-left, narrow strip)
────────────────────────────────────────────────── */
.bg-zone-b {
  grid-column: 1;
  grid-row: 2;
  padding: var(--space-6) var(--space-section-x);
  display: flex;
  align-items: center;
  gap: var(--space-8);
  flex-wrap: wrap;
  min-height: 56px;
  position: relative;
}

.bg-service {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  opacity: 0.6;
  cursor: default;
  position: relative;
  padding: var(--space-1) 0;
  transition: opacity 0.3s var(--ease-out), transform 0.3s var(--ease-out);
}
/* Arrow prefix */
.bg-service::before {
  content: '\2192';
  color: var(--color-accent);
  font-size: var(--text-body-sm);
  transition: transform 0.3s var(--ease-out);
}
/* Service hover: opacity + arrow shift (distinct hover #2) */
.bg-service:hover {
  opacity: 1;
}
.bg-service:hover::before {
  transform: translateX(3px);
}

/* ──────────────────────────────────────────────────
   ZONE C — Description + CTA (right column, full height)
────────────────────────────────────────────────── */
.bg-zone-c {
  grid-column: 2;
  grid-row: 1 / 3;
  padding: var(--space-20) var(--space-section-x) var(--space-16);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-left: var(--hero-rule-width) solid var(--bg-rule-color);
  position: relative;
}

/* Atmospheric accent glow inside zone C */
.bg-zone-c::before {
  content: '';
  position: absolute;
  bottom: 20%;
  right: 10%;
  width: 60%;
  height: 40%;
  background: radial-gradient(
    ellipse at 70% 60%,
    rgba(196, 132, 62, 0.05) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: var(--z-base);
}

.bg-zone-c-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  position: relative;
  z-index: 2;
}

.bg-description {
  font-family: var(--font-body);
  font-size: var(--text-body-lg, clamp(16px, 1.2vw, 20px));
  line-height: var(--leading-relaxed);
  opacity: 0.7;
  max-width: 320px;
  margin: 0;
}

/* ── CTA ───────────────────────────────────────── */
.bg-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-8);
  border: var(--hero-rule-width) solid currentColor;
  background: transparent;
  color: currentColor;
  font-family: var(--font-display);
  font-size: var(--text-body-sm);
  font-weight: 700;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  border-radius: 0;
  position: relative;
  overflow: hidden;
  transition: color 0.3s var(--ease-out), border-color 0.3s var(--ease-out);
  align-self: flex-start;
  min-height: 48px;
}

/* CTA fill wipe on hover via scaleX pseudo-element */
.bg-cta::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.4s var(--ease-out);
  z-index: 0;
}
.bg-cta:hover::after {
  transform: scaleX(1);
}
.bg-cta:hover {
  color: var(--color-canvas);
  border-color: var(--color-accent);
}
.bg-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: var(--space-1);
}

.bg-cta-label {
  position: relative;
  z-index: 1;
}

.bg-cta-arrow {
  position: relative;
  z-index: 1;
  font-size: var(--text-body);
  transition: transform 0.3s var(--ease-out);
}
.bg-cta:hover .bg-cta-arrow {
  transform: translate(2px, -2px);
}

/* ──────────────────────────────────────────────────
   FOOTER STRIP
────────────────────────────────────────────────── */
.bg-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-section-x);
  height: 52px;
  border-top: var(--hero-rule-width) solid var(--bg-rule-color);
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  opacity: 0.5;
}

.bg-meta {
  display: inline-block;
}

/* ──────────────────────────────────────────────────
   RESPONSIVE — Tablet
────────────────────────────────────────────────── */
@media (max-width: 1279px) {
  .bg-nav-links {
    gap: var(--space-6);
  }
}

/* ──────────────────────────────────────────────────
   RESPONSIVE — Mobile (768px)
────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .s-bg {
    min-height: 100svh;
    grid-template-rows: auto 1fr auto;
  }

  .bg-main {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto auto;
  }

  .bg-zone-a {
    grid-column: 1;
    grid-row: 1;
    padding: var(--space-12) var(--space-section-x) var(--space-8);
  }

  .bg-zone-b {
    grid-column: 1;
    grid-row: 2;
    border-top: var(--hero-rule-width) solid var(--bg-rule-color);
    gap: var(--space-6);
    padding: var(--space-4) var(--space-section-x);
  }

  .bg-zone-c {
    grid-column: 1;
    grid-row: 3;
    border-left: none;
    border-top: var(--hero-rule-width) solid var(--bg-rule-color);
    padding: var(--space-8) var(--space-section-x) var(--space-6);
  }

  .bg-v-rule {
    display: none;
  }

  .bg-h-rule {
    display: none;
  }

  .bg-headline {
    font-size: clamp(48px, 14vw, 100px);
  }

  .bg-watermark {
    font-size: clamp(140px, 40vw, 260px);
  }

  .bg-eyebrow {
    display: none;
  }

  .bg-nav-links {
    display: none;
  }

  .bg-nav-cta {
    font-size: var(--text-label-sm);
    padding: var(--space-2) var(--space-4);
  }

  .bg-footer {
    height: 44px;
    font-size: var(--text-label-sm);
    gap: var(--space-4);
  }

  .bg-description {
    max-width: none;
  }
}
</style>
