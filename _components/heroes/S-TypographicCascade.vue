<script setup>
/**
 * S-TypographicCascade  |  Cascading Typography Hero
 * ────────────────────────────────────────────────────
 * Text at radically different sizes cascades down the viewport.
 * Each line: different size, weight, alignment, offset, opacity.
 * NO images. Pure typographic composition.
 * Experimental Jetset meets Swiss Punk typography.
 *
 * Structure:
 *   Row 1 [auto]  — Navigation bar
 *   Row 2 [1fr]   — Cascading type lines (5 content + CTA + tagline)
 *
 * Signature: Each line scrolls at a different parallax rate,
 * creating an illusion of typographic Z-depth on a flat screen.
 * The cascade floats apart as you scroll — closest lines move
 * fastest, furthest lines barely move.
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'STypographicCascade' })

const props = defineProps({
  line1:        { type: String, default: 'WE BUILD' },
  line2:        { type: String, default: 'digital' },
  line3:        { type: String, default: 'EXPERIENCES' },
  line4:        { type: String, default: 'that move' },
  line5:        { type: String, default: 'people.' },
  ctaText:      { type: String, default: '\u2192 Start a project' },
  ctaHref:      { type: String, default: '#contact' },
  tagline:      { type: String, default: 'Strategy \u00B7 Design \u00B7 Engineering \u00B7 Launch' },
})

const sectionRef = ref(null)
let mm = null

onMounted(() => {
  const el = sectionRef.value
  if (!el) return

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // ── Initial states ──────────────────────────
    gsap.set(el.querySelector('.tc-accent-line'), { scaleY: 0 })

    // All lines start below (yPercent reveal)
    const lineInners = el.querySelectorAll('.tc-line-inner')
    gsap.set(lineInners, { yPercent: 108 })

    gsap.set(el.querySelector('.tc-cta-link'), { autoAlpha: 0, y: 12 })
    gsap.set(el.querySelector('.tc-tagline-text'), { autoAlpha: 0 })

    // ── Main entrance timeline ──────────────────
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl
      // Nav fades in
      .to(el.querySelector('.tc-nav'), {
        autoAlpha: 1, y: 0, duration: 0.7
      }, 0)
      .to(el.querySelectorAll('.tc-nav-link, .tc-logo, .tc-nav-cta'), {
        autoAlpha: 1, stagger: 0.05, duration: 0.5
      }, 0.1)
      // Accent line draws top-to-bottom
      .to(el.querySelector('.tc-accent-line'), {
        scaleY: 1, duration: 1.2, ease: 'power2.inOut'
      }, 0.2)
      // Cascade lines reveal with stagger
      .to(lineInners, {
        yPercent: 0,
        stagger: 0.1,
        duration: 1.0,
        ease: 'power4.out'
      }, 0.3)
      // CTA fades up
      .to(el.querySelector('.tc-cta-link'), {
        autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out'
      }, 0.9)
      // Tagline fades in
      .to(el.querySelector('.tc-tagline-text'), {
        autoAlpha: 1, duration: 0.5, ease: 'power2.out'
      }, 1.0)

    // ── PARALLAX SIGNATURE — each line at different scroll speed ──
    // Different rates create Z-depth illusion:
    // Line 1 moves fastest (closest to viewer)
    // Line 5 moves slowest (furthest away)
    const parallaxConfig = [
      { selector: '.tc-line--1', y: -80 },   // fastest — closest
      { selector: '.tc-line--2', y: -45 },
      { selector: '.tc-line--3', y: -60 },
      { selector: '.tc-line--4', y: -30 },
      { selector: '.tc-line--5', y: -15 },   // slowest — furthest
      { selector: '.tc-line--cta', y: -50 },
      { selector: '.tc-tagline', y: -20 },
    ]

    parallaxConfig.forEach(({ selector, y }) => {
      const target = el.querySelector(selector)
      if (!target) return
      gsap.to(target, {
        y,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      })
    })

    // ── Radial glow subtle pulse on scroll ──
    gsap.to(el.querySelector('.tc-glow'), {
      scale: 1.15,
      autoAlpha: 0.6,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })
  })

  // ── Magnetic CTA (runs regardless of motion pref) ──
  setupMagnetic(el)
})

function setupMagnetic(el) {
  const ctaEl = navCtaRef.value
  if (!ctaEl) return

  const xTo = gsap.quickTo(ctaEl, 'x', { duration: 0.6, ease: 'power3.out' })
  const yTo = gsap.quickTo(ctaEl, 'y', { duration: 0.6, ease: 'power3.out' })

  const onMove = (e) => {
    const r = ctaEl.getBoundingClientRect()
    xTo((e.clientX - r.left - r.width / 2) * 0.4)
    yTo((e.clientY - r.top - r.height / 2) * 0.4)
  }
  const onLeave = () => {
    xTo(0)
    yTo(0)
  }

  ctaEl.addEventListener('mousemove', onMove)
  ctaEl.addEventListener('mouseleave', onLeave)

  magneticHandlers = { el: ctaEl, onMove, onLeave }
}

onBeforeUnmount(() => {
  mm?.revert()
  if (magneticHandlers) {
    magneticHandlers.el.removeEventListener('mousemove', magneticHandlers.onMove)
    magneticHandlers.el.removeEventListener('mouseleave', magneticHandlers.onLeave)
  }
})
</script>

<template>
  <section ref="sectionRef" class="s-tc" role="banner" aria-label="Hero">
    <!-- Left accent line -->
    <div class="tc-accent-line" aria-hidden="true"></div>

    <!-- Atmospheric glow (center-bottom) -->
    <div class="tc-glow" aria-hidden="true"></div>

    <!-- Navigation -->
    <nav class="tc-nav" aria-label="Main navigation">
      <a :href="navLogoHref" class="tc-logo">{{ logoText }}</a>
      <ul class="tc-nav-links">
        <li v-for="link in navLinks" :key="link.label">
          <a :href="link.href" class="tc-nav-link">{{ link.label }}</a>
        </li>
      </ul>
      <a
        ref="navCtaRef"
        :href="navCtaHref"
        class="tc-nav-cta"
        data-magnetic
      >{{ navCtaLabel }}</a>
    </nav>

    <!-- Cascade -->
    <div class="tc-cascade">
      <!-- Line 1 -->
      <div class="tc-line tc-line--1">
        <span class="tc-line-inner" aria-hidden="true">{{ line1 }}</span>
      </div>
      <!-- Line 2 -->
      <div class="tc-line tc-line--2">
        <span class="tc-line-inner" aria-hidden="true">{{ line2 }}</span>
      </div>
      <!-- Line 3 -->
      <div class="tc-line tc-line--3">
        <span class="tc-line-inner" aria-hidden="true">{{ line3 }}</span>
      </div>
      <!-- Line 4 -->
      <div class="tc-line tc-line--4">
        <span class="tc-line-inner" aria-hidden="true">{{ line4 }}</span>
      </div>
      <!-- Line 5 — largest, accent color -->
      <div class="tc-line tc-line--5">
        <span class="tc-line-inner" aria-hidden="true">{{ line5 }}</span>
      </div>

      <!-- Accessible headline (screen readers only) -->
      <h1 class="sr-only">{{ line1 }} {{ line2 }} {{ line3 }} {{ line4 }} {{ line5 }}</h1>

      <!-- CTA line -->
      <div class="tc-line tc-line--cta">
        <span class="tc-line-inner">
          <a :href="ctaHref" class="tc-cta-link">{{ ctaText }}</a>
        </span>
      </div>

      <!-- Tagline -->
      <div class="tc-tagline">
        <span class="tc-tagline-text">{{ tagline }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════
   S-TypographicCascade
   ═══════════════════════════════════════════════════════ */

.s-tc {
  position: relative;
  width: 100%;
  min-height: 100svh;
  background: var(--color-canvas);
  color: var(--color-text);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
}

/* ── Grain overlay ── */
.s-tc::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: grain 0.5s steps(6) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5%, -5%); }
  50% { transform: translate(5%, 0); }
  75% { transform: translate(0, 5%); }
}

/* ── Atmospheric glow (center-bottom radial) ── */
.tc-glow {
  position: absolute;
  bottom: -5%;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  height: 55vh;
  background: radial-gradient(
    ellipse at center bottom,
    var(--color-accent-subtle) 0%,
    transparent 65%
  );
  filter: blur(40px);
  clip-path: ellipse(55% 70% at 50% 80%);
  pointer-events: none;
  z-index: var(--z-base);
}

/* ── Left accent line ── */
.tc-accent-line {
  position: absolute;
  left: var(--space-section-x);
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--color-accent) 15%,
    var(--color-accent) 85%,
    transparent 100%
  );
  z-index: var(--z-raised);
  transform-origin: top center;
}

/* ═══════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════ */

.tc-nav {
  position: relative;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-section-x);
  height: 72px;
}

.tc-logo {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  transition: opacity 0.3s var(--ease-out);
}

.tc-logo:hover {
  opacity: 0.7;
}

.tc-logo:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.tc-nav-links {
  display: flex;
  gap: var(--space-8);
  list-style: none;
  padding: 0;
  margin: 0;
}

.tc-nav-link {
  font-family: var(--font-body);
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.3s var(--ease-out);
  position: relative;
}

.tc-nav-link::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.35s var(--ease-out);
}

.tc-nav-link:hover {
  color: var(--color-text);
}

.tc-nav-link:hover::after {
  transform: scaleX(1);
}

.tc-nav-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.tc-nav-cta {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  padding: 10px 20px;
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-pill);
  text-decoration: none;
  display: inline-block;
  transition: background 0.3s var(--ease-out), border-color 0.3s var(--ease-out);
}

.tc-nav-cta:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--color-accent-muted);
}

.tc-nav-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

/* ═══════════════════════════════════════════════════════
   CASCADE CONTAINER
   ═══════════════════════════════════════════════════════ */

.tc-cascade {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
  padding: var(--space-12) 0 var(--space-8);
  position: relative;
  z-index: var(--z-raised);
}

/* ── Each cascade line ── */
.tc-line {
  display: block;
  line-height: var(--leading-none);
  overflow: hidden;
  padding: 4px 0;
}

.tc-line-inner {
  display: block;
}

/* ─────────────────────────────────────────────────
   LINE 1: "WE BUILD" — massive display, left
   ───────────────────────────────────────────────── */
.tc-line--1 {
  padding-left: var(--space-section-x);
}

.tc-line--1 .tc-line-inner {
  font-family: var(--font-display);
  font-size: clamp(80px, 12vw, 180px);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  text-transform: uppercase;
  color: var(--color-text);
  line-height: 0.9;
}

/* ─────────────────────────────────────────────────
   LINE 2: "digital" — serif italic, faded, indented
   ───────────────────────────────────────────────── */
.tc-line--2 {
  padding-left: clamp(40px, 12vw, 160px);
}

.tc-line--2 .tc-line-inner {
  font-family: var(--font-serif);
  font-size: clamp(52px, 8vw, 120px);
  font-weight: 300;
  font-style: italic;
  letter-spacing: -0.02em;
  color: var(--color-text-muted);
  opacity: 0.55;
  line-height: 1;
}

/* ─────────────────────────────────────────────────
   LINE 3: "EXPERIENCES" — massive display, RIGHT aligned
   ───────────────────────────────────────────────── */
.tc-line--3 {
  text-align: right;
  padding-right: var(--space-section-x);
}

.tc-line--3 .tc-line-inner {
  font-family: var(--font-display);
  font-size: clamp(56px, 9vw, 140px);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  text-transform: uppercase;
  color: var(--color-text);
  line-height: 0.9;
}

/* ─────────────────────────────────────────────────
   LINE 4: "that move" — serif light, subtle, indented
   ───────────────────────────────────────────────── */
.tc-line--4 {
  padding-left: clamp(20px, 6vw, 80px);
}

.tc-line--4 .tc-line-inner {
  font-family: var(--font-serif);
  font-size: clamp(36px, 5.5vw, 88px);
  font-weight: 300;
  font-style: italic;
  color: var(--color-text-subtle);
  opacity: 0.45;
  line-height: 1.1;
}

/* ─────────────────────────────────────────────────
   LINE 5: "people." — LARGEST, accent color, weight 300
   This line bleeds — biggest in the cascade
   ───────────────────────────────────────────────── */
.tc-line--5 {
  padding-left: var(--space-section-x);
  /* Container break — line bleeds past right edge */
  margin-right: -4vw;
}

.tc-line--5 .tc-line-inner {
  font-family: var(--font-display);
  font-size: clamp(100px, 16vw, 240px);
  font-weight: 300;
  letter-spacing: var(--tracking-tight);
  color: var(--color-accent);
  line-height: 0.85;
  /* Subtle text-shadow for depth on the largest, most prominent line */
  text-shadow: 0 0 80px var(--color-accent-subtle);
}

/* ─────────────────────────────────────────────────
   CTA LINE: "-> Start a project" — mono, interactive
   ───────────────────────────────────────────────── */
.tc-line--cta {
  padding-left: clamp(60px, 18vw, 240px);
  margin-top: var(--space-8);
}

.tc-line--cta .tc-line-inner {
  display: inline-block;
}

.tc-cta-link {
  font-family: var(--font-mono);
  font-size: clamp(14px, 1.8vw, 22px);
  letter-spacing: var(--tracking-wide);
  color: var(--color-text);
  opacity: 0.65;
  text-decoration: none;
  position: relative;
  display: inline-block;
  transition: opacity 0.3s var(--ease-out);
  padding: 6px 0;
}

.tc-cta-link::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.4s var(--ease-out);
}

.tc-cta-link:hover {
  opacity: 1;
}

.tc-cta-link:hover::after {
  transform: scaleX(1);
}

.tc-cta-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
  border-radius: 2px;
}

/* ─────────────────────────────────────────────────
   TAGLINE: bottom mono caps
   ───────────────────────────────────────────────── */
.tc-tagline {
  padding-left: var(--space-section-x);
  padding-bottom: var(--space-12);
  margin-top: var(--space-6);
}

.tc-tagline-text {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-subtle);
  opacity: 0.4;
}

/* ═══════════════════════════════════════════════════════
   ACCESSIBILITY
   ═══════════════════════════════════════════════════════ */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ═══════════════════════════════════════════════════════
   RESPONSIVE — TABLET (max-width: 768px)
   ═══════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .tc-nav-links {
    display: none;
  }

  .tc-line--1 .tc-line-inner {
    font-size: clamp(56px, 14vw, 100px);
  }

  .tc-line--2 {
    padding-left: clamp(20px, 6vw, 60px);
  }

  .tc-line--2 .tc-line-inner {
    font-size: clamp(40px, 10vw, 72px);
  }

  .tc-line--3 .tc-line-inner {
    font-size: clamp(44px, 11vw, 80px);
  }

  .tc-line--4 {
    padding-left: clamp(10px, 4vw, 40px);
  }

  .tc-line--4 .tc-line-inner {
    font-size: clamp(28px, 8vw, 52px);
  }

  .tc-line--5 .tc-line-inner {
    font-size: clamp(72px, 18vw, 140px);
  }

  .tc-line--cta {
    padding-left: clamp(20px, 8vw, 60px);
  }
}

/* ═══════════════════════════════════════════════════════
   RESPONSIVE — SMALL MOBILE (max-width: 480px)
   ═══════════════════════════════════════════════════════ */

@media (max-width: 480px) {
  .tc-cascade {
    padding: var(--space-8) 0 var(--space-6);
  }

  .tc-line--1 .tc-line-inner {
    font-size: clamp(44px, 13vw, 64px);
  }

  .tc-line--2 .tc-line-inner {
    font-size: clamp(32px, 9vw, 48px);
  }

  .tc-line--3 .tc-line-inner {
    font-size: clamp(36px, 10vw, 56px);
  }

  .tc-line--4 .tc-line-inner {
    font-size: clamp(22px, 7vw, 36px);
  }

  .tc-line--5 .tc-line-inner {
    font-size: clamp(52px, 15vw, 96px);
  }

  .tc-tagline-text {
    font-size: 9px;
    letter-spacing: var(--tracking-wider);
  }
}
</style>
