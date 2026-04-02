<script setup>
/**
 * S-TypeMonument  |  Pure Typographic Hero
 * ─────────────────────────────────────────────
 * Typography IS the hero. No background image.
 * Words so large they partially clip off the screen edges.
 * Dark canvas, type is the visual event.
 * Herb Lubalin meets Rick Valicenti.
 *
 * Structure:
 *   Row 1 [72px]  — Navigation bar
 *   Row 2 [1fr]   — Typographic monument (left-aligned, overflow-right)
 *   Row 3 [48px]  — Infinite marquee footer
 *
 * Signature: The XL line overflows the viewport to the right,
 * creating a massive typographic bleed that clips against the edge.
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'STypeMonument' })

const props = defineProps({
  line1:        { type: String, default: 'WE' },
  line2:        { type: String, default: 'BUILD' },
  line3:        { type: String, default: 'PRECISION.' },
  description:  { type: String, default: 'Strategy-led design and engineering for ambitious digital products that demand craft.' },
  marqueeText:  { type: String, default: 'STRATEGY \u00B7 DESIGN \u00B7 ENGINEERING \u00B7 LAUNCH \u00B7 DIGITAL STUDIO \u00B7' },
})

const sectionRef = ref(null)
const navCtaRef = ref(null)
let mm = null

onMounted(() => {
  const el = sectionRef.value
  if (!el) return

  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 1280px)',
    isTablet: '(min-width: 768px) and (max-width: 1279px)',
    isMobile: '(max-width: 767px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { isDesktop, isTablet, isMobile, reduceMotion } = context.conditions
    if (reduceMotion) return

    // ── Initial states ────────────────────────────────────
    gsap.set(el.querySelector('.tm-line--sm'),           { autoAlpha: 0, x: -80 })
    gsap.set(el.querySelector('.tm-line--xl'),           { autoAlpha: 0, x: -120 })
    gsap.set(el.querySelector('.tm-line--md'),           { autoAlpha: 0, x: -60 })
    gsap.set(el.querySelector('.tm-rule'),               { scaleY: 0 })
    gsap.set(el.querySelector('.tm-desc'),               { autoAlpha: 0, y: 20 })
    gsap.set(el.querySelector('.tm-marquee'),            { autoAlpha: 0 })

    // ── Entrance timeline ─────────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl
      // Line 1 — small word: t=0.15
      .to(el.querySelector('.tm-line--sm'),         { autoAlpha: 1, x: 0, duration: 1.0, ease: 'power3.out' }, 0.15)

      // Line 2 — MASSIVE accent word: t=0.3
      .to(el.querySelector('.tm-line--xl'),         { autoAlpha: 1, x: 0, duration: 1.2, ease: 'power4.out' }, 0.3)

      // Line 3 — stroke outline: t=0.55
      .to(el.querySelector('.tm-line--md'),         { autoAlpha: 1, x: 0, duration: 1.0, ease: 'power3.out' }, 0.55)

      // Vertical rule: t=0.7
      .to(el.querySelector('.tm-rule'),             { scaleY: 1, duration: 0.7, ease: 'power4.out' }, 0.7)

      // Description: t=0.85
      .to(el.querySelector('.tm-desc'),             { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.85)

      // Marquee fade-in: t=0.95
      .to(el.querySelector('.tm-marquee'),          { autoAlpha: 1, duration: 0.6 }, 0.95)

    // ── Marquee infinite scroll ──────────────────────────
    const marqueeInner = el.querySelector('.tm-marquee-track')
    if (marqueeInner) {
      gsap.to(marqueeInner, {
        xPercent: -50,
        duration: 18,
        ease: 'none',
        repeat: -1,
      })
    }

    // ── Scroll: XL line drifts right ─────────────────────
    gsap.to(el.querySelector('.tm-line--xl'), {
      x: isMobile ? 15 : 30,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // ── Scroll: atmospheric gradient shift ───────────────
    gsap.to(el.querySelector('.tm-atmosphere'), {
      opacity: 0.12,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // ── Scroll: monument subtle parallax ─────────────────
    gsap.to(el.querySelector('.tm-monument'), {
      yPercent: -4,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })
  }, sectionRef.value)

  // ── Magnetic CTA button ──────────────────────────────
  const cta = navCtaRef.value
  if (cta) {
    const onMove = (e) => {
      const rect = cta.getBoundingClientRect()
      const mx = (e.clientX - rect.left - rect.width / 2) * 0.3
      const my = (e.clientY - rect.top - rect.height / 2) * 0.3
      gsap.to(cta, { x: mx, y: my, duration: 0.3, ease: 'power2.out' })
    }
    const onLeave = () => {
      gsap.to(cta, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
    }
    cta.addEventListener('mousemove', onMove)
    cta.addEventListener('mouseleave', onLeave)
  }
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section ref="sectionRef" class="s-tm" aria-label="Hero — Typographic Monument">

    <!-- Atmosphere layer: radial gradient glow -->
    <div class="tm-atmosphere" aria-hidden="true"></div>

    <!-- Grain overlay via pseudo-element on .s-tm::after -->

    <!-- Giant watermark behind content -->
    <div class="tm-watermark" aria-hidden="true">{{ line2 }}</div>

    <!-- ── ROW 1: Navigation ──────────────────── -->
    <nav class="tm-nav" aria-label="Primary navigation">
      <a :href="navLogoHref" class="tm-logo">{{ logoText }}</a>
      <ul class="tm-nav-links" role="list">
        <li v-for="link in navLinks" :key="link.href">
          <a :href="link.href" class="tm-nav-link">{{ link.label }}</a>
        </li>
      </ul>
      <a
        ref="navCtaRef"
        :href="navCtaHref"
        class="tm-nav-cta"
        data-magnetic
      >{{ navCtaLabel }}</a>
    </nav>

    <!-- ── ROW 2: Typographic Monument ────────── -->
    <div class="tm-content">

      <!-- Vertical rule — amber accent line -->
      <div class="tm-rule" aria-hidden="true"></div>

      <!-- Monument block -->
      <div class="tm-monument">
        <span class="tm-line tm-line--sm">{{ line1 }}</span>
        <span class="tm-line tm-line--xl">{{ line2 }}</span>
        <span class="tm-line tm-line--md">{{ line3 }}</span>
      </div>

      <!-- Description beneath -->
      <p class="tm-desc">{{ description }}</p>
    </div>

    <!-- ── ROW 3: Marquee Footer ──────────────── -->
    <footer class="tm-marquee" aria-label="Services marquee">
      <div class="tm-marquee-track">
        <span class="tm-marquee-text">{{ marqueeText }}&nbsp;</span>
        <span class="tm-marquee-text">{{ marqueeText }}&nbsp;</span>
      </div>
    </footer>

  </section>
</template>

<style scoped>
/* ──────────────────────────────────────────────
   S-TypeMonument  |  Pure Typographic Hero
   3-row grid: nav / monument / marquee
────────────────────────────────────────────── */

.s-tm {
  position: relative;
  min-height: 100svh;
  display: grid;
  grid-template-rows: 72px 1fr 48px;
  overflow: hidden;
  background: var(--color-canvas);
  color: var(--color-text);
}

/* ── Grain overlay ─────────────────────────── */

.s-tm::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: var(--z-raised, 10);
  animation: tm-grain 0.5s steps(6) infinite;
}

@keyframes tm-grain {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(-5%, -5%); }
  50%      { transform: translate(5%, 0); }
  75%      { transform: translate(0, 5%); }
}

/* ── Atmosphere: radial gradient glow ──────── */

.tm-atmosphere {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 15% 40%, rgba(196, 132, 62, 0.06) 0%, transparent 70%),
    radial-gradient(ellipse 50% 70% at 85% 70%, rgba(196, 132, 62, 0.03) 0%, transparent 60%);
  opacity: 0.06;
  pointer-events: none;
  z-index: var(--z-base, 0);
}

/* ── Giant watermark behind content ────────── */

.tm-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-display);
  font-size: clamp(200px, 38vw, 600px);
  font-weight: 900;
  letter-spacing: -0.06em;
  line-height: var(--leading-none, 1);
  color: var(--color-text);
  opacity: var(--hero-watermark-opacity, 0.055);
  white-space: nowrap;
  pointer-events: none;
  z-index: var(--z-base, 0);
  user-select: none;
}

/* ── Navigation ────────────────────────────── */

.tm-nav {
  grid-row: 1;
  display: flex;
  align-items: center;
  padding: 0 clamp(20px, 3vw, 40px);
  position: relative;
  z-index: var(--z-nav, 900);
  box-shadow: 0 1px 0 var(--color-line);
}

.tm-logo {
  flex-shrink: 0;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text);
  text-decoration: none;
  transition: opacity var(--duration-fast) var(--ease-out);
}
.tm-logo:hover         { opacity: 0.6; }
.tm-logo:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }

.tm-nav-links {
  display: flex;
  gap: var(--space-8, 32px);
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  justify-content: center;
}

.tm-nav-link {
  font-family: var(--font-body);
  font-size: var(--text-label, 11px);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  text-decoration: none;
  position: relative;
  padding: 4px 0;
  transition: color var(--duration-fast) var(--ease-out);
}
/* Underline grow on hover */
.tm-nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.3s var(--ease-out);
}
.tm-nav-link:hover         { color: var(--color-text); }
.tm-nav-link:hover::after  { transform: scaleX(1); }
.tm-nav-link:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }

.tm-nav-cta {
  flex-shrink: 0;
  font-family: var(--font-body);
  font-size: var(--text-label, 11px);
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--color-text-invert);
  background: var(--color-text);
  text-decoration: none;
  padding: 10px 22px;
  border-radius: var(--radius-xs, 4px);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  transition:
    background var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}
.tm-nav-cta:hover {
  background: var(--color-accent);
  box-shadow: 0 4px 20px rgba(196, 132, 62, 0.25),
              0 1px 4px rgba(196, 132, 62, 0.15);
}
.tm-nav-cta:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }

/* ── Content area (monument + rule + desc) ─── */

.tm-content {
  grid-row: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(40px, 6vw, 80px) 0 clamp(32px, 4vw, 56px) 4vw;
  overflow: visible;
  z-index: 2;
}

/* ── Vertical rule ─────────────────────────── */

.tm-rule {
  position: absolute;
  left: clamp(12px, 2vw, 28px);
  top: 50%;
  width: 1px;
  height: 60px;
  background: var(--color-accent);
  transform-origin: bottom center;
  transform: translateY(-50%);
}

/* ── Monument ──────────────────────────────── */

.tm-monument {
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: relative;
}

.tm-line {
  font-family: var(--font-display);
  display: block;
  line-height: var(--leading-tight, 1.06);
  margin: 0;
  will-change: auto;
}

/* Line 1: small, normal weight */
.tm-line--sm {
  font-size: clamp(48px, 8vw, 120px);
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: var(--tracking-tight, -0.04em);
}

/* Line 2: MASSIVE, accent fill, italic — the signature */
.tm-line--xl {
  font-size: clamp(120px, 22vw, 340px);
  font-weight: 900;
  color: var(--color-accent);
  letter-spacing: -0.05em;
  font-style: italic;
  line-height: 0.92;
  margin-left: -0.04em;
  /* This intentionally overflows to the right — the signature bleed */
  white-space: nowrap;
}

/* Line 3: medium, stroke only (outline) */
.tm-line--md {
  font-size: clamp(60px, 10vw, 160px);
  font-weight: 700;
  color: transparent;
  -webkit-text-stroke: 1px var(--color-text);
  letter-spacing: var(--tracking-tight, -0.04em);
}

/* ── Description ───────────────────────────── */

.tm-desc {
  font-family: var(--font-body);
  font-size: var(--text-body-sm, 13px);
  line-height: var(--leading-normal, 1.5);
  color: var(--color-text-muted);
  max-width: 400px;
  margin: clamp(24px, 3vw, 40px) 0 0 0;
  position: relative;
}

/* ── Marquee footer ────────────────────────── */

.tm-marquee {
  grid-row: 3;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  box-shadow: 0 -1px 0 var(--color-line);
  z-index: 2;
}

/* Fade edges with clip-path mask */
.tm-marquee::before,
.tm-marquee::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  z-index: 3;
  pointer-events: none;
}
.tm-marquee::before {
  left: 0;
  background: linear-gradient(to right, var(--color-canvas), transparent);
}
.tm-marquee::after {
  right: 0;
  background: linear-gradient(to left, var(--color-canvas), transparent);
}

.tm-marquee-track {
  display: flex;
  white-space: nowrap;
  will-change: transform;
}

.tm-marquee-text {
  font-family: var(--font-mono);
  font-size: var(--text-label, 11px);
  font-weight: 400;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  flex-shrink: 0;
  padding-right: 0.5em;
}

/* ── Responsive ────────────────────────────── */

@media (max-width: 767px) {
  .tm-nav-links {
    display: none;
  }

  .tm-line--xl {
    font-size: clamp(80px, 18vw, 120px);
  }

  .tm-line--sm {
    font-size: clamp(32px, 7vw, 56px);
  }

  .tm-line--md {
    font-size: clamp(40px, 9vw, 72px);
  }

  .tm-content {
    padding-left: 6vw;
    padding-top: clamp(48px, 8vw, 80px);
    padding-bottom: clamp(24px, 4vw, 40px);
  }

  .tm-rule {
    left: clamp(8px, 1.5vw, 16px);
    height: 40px;
  }

  .tm-desc {
    max-width: 280px;
    font-size: 12px;
  }

  .tm-watermark {
    font-size: clamp(120px, 28vw, 260px);
  }
}

@media (min-width: 768px) and (max-width: 1279px) {
  .tm-line--xl {
    font-size: clamp(100px, 18vw, 240px);
  }

  .tm-content {
    padding-left: 5vw;
  }
}

@media (min-width: 1280px) {
  .tm-content {
    padding-left: 4vw;
  }

  .tm-rule {
    left: 2vw;
  }
}
</style>
