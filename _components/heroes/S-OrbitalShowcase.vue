<script setup>
/**
 * S-OrbitalShowcase  |  Orbital Showcase Hero
 * ───────────────────────────────────────────────
 * Cinematic hero where content elements orbit in concentric
 * elliptical rings around a central focal point. Inner orbit
 * (stats) rotates clockwise at 40s period. Outer orbit
 * (services) rotates counter-clockwise at 60s period.
 *
 * Structure:
 *   Row 1 [auto]  — Transparent nav (logo, links, pill CTA)
 *   Row 2 [1fr]   — Orbital canvas: center headline + 2 orbit rings
 *   Row 3 [auto]  — CTA area: description + button
 *
 * Signature: Inner + outer orbits rotate in opposite directions
 * continuously, creating a mesmerizing planetary-system feel.
 * Pills maintain upright orientation via computed position math.
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SOrbitalShowcase' })

const props = defineProps({
  eyebrow:     { type: String, default: 'Launching 2024' },
  headline:    { type: String, default: 'The future\nis orbiting.' },
  description: { type: String, default: 'We build products at the intersection of design, technology, and human experience.' },
  ctaLabel:    { type: String, default: 'Enter orbit' },
  ctaHref:     { type: String, default: '#start' },
  stats: {
    type: Array,
    default: () => [
      { num: '48+',  label: 'Projects' },
      { num: '12',   label: 'Countries' },
      { num: '99%',  label: 'Retention' },
    ],
  },
  services: {
    type: Array,
    default: () => [
      { label: 'Strategy' },
      { label: 'Design' },
      { label: 'Engineering' },
      { label: 'Growth' },
    ],
  },
  logoText:     { type: String, default: 'Studio.' },
  navLinks: {
    type: Array,
    default: () => [
      { label: 'Work',     href: '#work' },
      { label: 'About',    href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Contact',  href: '#contact' },
    ],
  },
  navCtaLabel:  { type: String, default: 'Start a project' },
  navCtaHref:   { type: String, default: '#contact' },
  navLogoHref:  { type: String, default: '/' },
})

const sectionRef = ref(null)
const ctaRef = ref(null)
let mm = null

/* ── Headline lines for reveal ────────────── */
const headlineLines = computed(() => props.headline.split('\n'))

/* ── Orbital position math ────────────────── */
const innerAngle = ref(0)
const outerAngle = ref(0)

// Elliptical orbit: rx=220, ry=90 — 3 stats at 120deg apart starting from 30deg
const innerPositions = computed(() =>
  props.stats.map((_, i) => {
    const baseAngle = i * (360 / props.stats.length) + 30
    const a = (baseAngle + innerAngle.value) * (Math.PI / 180)
    return { x: Math.cos(a) * 220, y: Math.sin(a) * 90 }
  })
)

// Elliptical orbit: rx=380, ry=155 — 4 services at 90deg apart starting from 0deg
const outerPositions = computed(() =>
  props.services.map((_, i) => {
    const baseAngle = i * (360 / props.services.length)
    const a = (baseAngle + outerAngle.value) * (Math.PI / 180)
    return { x: Math.cos(a) * 380, y: Math.sin(a) * 155 }
  })
)

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

    // ── Initial states ──────────────────────────
    gsap.set(el.querySelector('.os-nav'), { autoAlpha: 0, y: -12 })
    gsap.set(el.querySelectorAll('.os-nav-link, .os-logo, .os-nav-cta'), { autoAlpha: 0 })
    gsap.set(el.querySelector('.os-star'), { scale: 0, autoAlpha: 0 })
    gsap.set(el.querySelector('.os-eyebrow'), { autoAlpha: 0, y: 8 })
    gsap.set(el.querySelectorAll('.os-headline-inner'), { yPercent: 108 })
    gsap.set(el.querySelectorAll('.os-rings ellipse'), { autoAlpha: 0 })
    gsap.set(el.querySelectorAll('.os-center-ring'), { scale: 0, autoAlpha: 0 })
    gsap.set(el.querySelectorAll('.os-stat-pill'), { scale: 0, autoAlpha: 0 })
    gsap.set(el.querySelectorAll('.os-service-pill'), { scale: 0, autoAlpha: 0 })
    gsap.set(el.querySelector('.os-description'), { autoAlpha: 0, y: 12 })
    gsap.set(el.querySelector('.os-cta'), { autoAlpha: 0, y: 8 })

    // ── Entry timeline ──────────────────────────
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl
      // Nav
      .to(el.querySelector('.os-nav'), { autoAlpha: 1, y: 0, duration: 0.7 }, 0)
      .to(el.querySelectorAll('.os-nav-link, .os-logo, .os-nav-cta'),
          { autoAlpha: 1, stagger: 0.05, duration: 0.5 }, 0.1)
      // Star dot scales in with bounce
      .to(el.querySelector('.os-star'),
          { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(2)' }, 0.3)
      // Center rings expand outward
      .to(el.querySelectorAll('.os-center-ring'),
          { scale: 1, autoAlpha: 1, stagger: 0.15, duration: 0.8, ease: 'power3.out' }, 0.35)
      // Eyebrow
      .to(el.querySelector('.os-eyebrow'), { autoAlpha: 1, y: 0, duration: 0.5 }, 0.4)
      // Headline lines reveal
      .to(el.querySelectorAll('.os-headline-inner'),
          { yPercent: 0, stagger: 0.1, duration: 0.9, ease: 'power4.out' }, 0.5)
      // SVG orbital rings
      .to(el.querySelectorAll('.os-rings ellipse'),
          { autoAlpha: 1, stagger: 0.3, duration: 1.0 }, 0.6)
      // Stat pills scale in with back easing
      .to(el.querySelectorAll('.os-stat-pill'),
          { scale: 1, autoAlpha: 1, stagger: 0.12, duration: 0.6, ease: 'back.out(1.8)' }, 0.8)
      // Service pills scale in
      .to(el.querySelectorAll('.os-service-pill'),
          { scale: 1, autoAlpha: 1, stagger: 0.1, duration: 0.6, ease: 'back.out(1.8)' }, 1.0)
      // Description + CTA
      .to(el.querySelector('.os-description'), { autoAlpha: 1, y: 0, duration: 0.7 }, 1.1)
      .to(el.querySelector('.os-cta'),
          { autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)' }, 1.2)

    // ── SIGNATURE: Orbit rotations ──────────────
    if (!isMobile) {
      const innerTracker = { val: 0 }
      const outerTracker = { val: 0 }

      gsap.to(innerTracker, {
        val: 360,
        duration: 40,
        ease: 'none',
        repeat: -1,
        onUpdate: () => { innerAngle.value = innerTracker.val },
      })

      gsap.to(outerTracker, {
        val: -360,
        duration: 60,
        ease: 'none',
        repeat: -1,
        onUpdate: () => { outerAngle.value = outerTracker.val },
      })

      // SVG rings follow the same rotation (svgOrigin for correct center pivot)
      gsap.to(el.querySelector('.os-ring-inner'), {
        rotation: 360,
        duration: 40,
        ease: 'none',
        repeat: -1,
        svgOrigin: '410 410',
      })
      gsap.to(el.querySelector('.os-ring-outer'), {
        rotation: -360,
        duration: 60,
        ease: 'none',
        repeat: -1,
        svgOrigin: '410 410',
      })
    }

    // ── Star dot pulse (GSAP yoyo, not CSS infinite) ──
    gsap.fromTo(el.querySelector('.os-star'), {
      boxShadow: '0 0 12px 4px rgba(196, 132, 62, 0.55)',
    }, {
      boxShadow: '0 0 24px 8px rgba(196, 132, 62, 0.55)',
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    // ── Scroll: orbital canvas parallax ─────────
    gsap.to(el.querySelector('.os-canvas'), {
      scale: 0.95,
      autoAlpha: 0.7,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // ── Scroll: center glow shifts ──────────────
    gsap.to(el, {
      '--glow-y': '-55%',
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // ── Magnetic CTA ────────────────────────────
    const ctaEl = ctaRef.value
    if (ctaEl && !isMobile) {
      const xTo = gsap.quickTo(ctaEl, 'x', { duration: 0.6, ease: 'power3.out' })
      const yTo = gsap.quickTo(ctaEl, 'y', { duration: 0.6, ease: 'power3.out' })

      const handleMove = (e) => {
        const r = ctaEl.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.4)
        yTo((e.clientY - r.top - r.height / 2) * 0.4)
      }
      const handleLeave = () => { xTo(0); yTo(0) }

      ctaEl.addEventListener('mousemove', handleMove)
      ctaEl.addEventListener('mouseleave', handleLeave)

      return () => {
        ctaEl.removeEventListener('mousemove', handleMove)
        ctaEl.removeEventListener('mouseleave', handleLeave)
      }
    }
  }, el)
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section ref="sectionRef" class="s-os" aria-label="Hero: Orbital Showcase">

    <!-- NAV — transparent top bar -->
    <nav class="os-nav" aria-label="Primary navigation">
      <a :href="navLogoHref" class="os-logo">{{ logoText }}</a>
      <ul class="os-nav-links">
        <li v-for="link in navLinks" :key="link.label">
          <a :href="link.href" class="os-nav-link">{{ link.label }}</a>
        </li>
      </ul>
      <a :href="navCtaHref" class="os-nav-cta">{{ navCtaLabel }}</a>
    </nav>

    <!-- MAIN — orbital area -->
    <div class="os-main">
      <div class="os-canvas">

        <!-- SVG orbital rings — decorative -->
        <svg
          class="os-rings"
          viewBox="0 0 820 820"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <!-- Inner ring -->
          <ellipse
            class="os-ring-inner"
            cx="410" cy="410" rx="220" ry="90"
            stroke="rgba(255,255,255,0.06)"
            stroke-width="1"
            stroke-dasharray="6 8"
          />
          <!-- Outer ring -->
          <ellipse
            class="os-ring-outer"
            cx="410" cy="410" rx="380" ry="160"
            stroke="rgba(255,255,255,0.04)"
            stroke-width="1"
            stroke-dasharray="4 12"
          />
        </svg>

        <!-- Stat pills (inner orbit) -->
        <div
          v-for="(stat, i) in stats"
          :key="`stat-${i}`"
          class="os-stat-pill"
          :style="{
            left: `calc(50% + ${innerPositions[i].x}px)`,
            top: `calc(50% + ${innerPositions[i].y}px)`,
          }"
        >
          <span class="os-stat-num">{{ stat.num }}</span>
          <span class="os-stat-label">{{ stat.label }}</span>
        </div>

        <!-- Service pills (outer orbit) -->
        <div
          v-for="(service, i) in services"
          :key="`service-${i}`"
          class="os-service-pill"
          :style="{
            left: `calc(50% + ${outerPositions[i].x}px)`,
            top: `calc(50% + ${outerPositions[i].y}px)`,
          }"
        >
          {{ service.label }}
        </div>

        <!-- CENTER CONTENT -->
        <div class="os-center">
          <!-- Decorative concentric rings behind star -->
          <div class="os-center-ring os-center-ring--outer" aria-hidden="true"></div>
          <div class="os-center-ring os-center-ring--inner" aria-hidden="true"></div>
          <div class="os-star" aria-hidden="true"></div>
          <div class="os-eyebrow">{{ eyebrow }}</div>
          <h1 class="os-headline">
            <span
              v-for="(line, i) in headlineLines"
              :key="i"
              class="os-headline-line"
            >
              <span class="os-headline-inner">{{ line }}</span>
            </span>
          </h1>
        </div>
      </div>

      <!-- CTA AREA — below the orbital canvas -->
      <div class="os-cta-area">
        <p class="os-description">{{ description }}</p>
        <a
          ref="ctaRef"
          :href="ctaHref"
          class="os-cta"
          data-magnetic
        >
          {{ ctaLabel }}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 7h11M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- MOBILE STATS — visible only on small screens -->
    <div class="os-mobile-stats" aria-label="Key statistics">
      <div
        v-for="(stat, i) in stats"
        :key="`mobile-stat-${i}`"
        class="os-mobile-stat"
      >
        <span class="os-mobile-stat-num">{{ stat.num }}</span>
        <span class="os-mobile-stat-label">{{ stat.label }}</span>
      </div>
    </div>

    <!-- MOBILE SERVICES — visible only on small screens -->
    <div class="os-mobile-services" aria-label="Services">
      <span
        v-for="(service, i) in services"
        :key="`mobile-service-${i}`"
        class="os-mobile-service-tag"
      >{{ service.label }}</span>
    </div>

    <!-- Bottom accent strip -->
    <div class="os-strip" aria-hidden="true"></div>

  </section>
</template>

<style scoped>
/* ────────────────────────────────────────────
   BASE SECTION
──────────────────────────────────────────── */
.s-os {
  --glow-y: -50%;
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 700px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--color-canvas);
  color: var(--color-text);
  overflow: hidden;
}

/* ATMOSPHERIC CENTER GLOW */
.s-os::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, var(--glow-y));
  width: 50vw;
  height: 50vw;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(196, 132, 62, 0.12) 0%,
    rgba(196, 132, 62, 0.04) 40%,
    transparent 70%
  );
  filter: blur(30px);
  pointer-events: none;
  z-index: var(--z-base);
}

/* Grain overlay */
.s-os::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  opacity: 0.025;
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: os-grain 0.5s steps(6) infinite;
}

@keyframes os-grain {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5%, -5%); }
  50% { transform: translate(5%, 0); }
  75% { transform: translate(0, 5%); }
}


/* ────────────────────────────────────────────
   NAVIGATION
──────────────────────────────────────────── */
.os-nav {
  position: relative;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-section-x);
  height: 72px;
}

.os-logo {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  transition: opacity 0.3s var(--ease-out);
}
.os-logo:hover { opacity: 0.7; }
.os-logo:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.os-nav-links {
  display: flex;
  gap: var(--space-8);
  list-style: none;
  padding: 0;
  margin: 0;
}

.os-nav-link {
  font-family: var(--font-body);
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.3s var(--ease-out);
}
.os-nav-link:hover { color: var(--color-text); }
.os-nav-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.os-nav-cta {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  padding: 10px 20px;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-pill);
  text-decoration: none;
  transition:
    background 0.3s var(--ease-out),
    border-color 0.3s var(--ease-out);
}
.os-nav-cta:hover {
  background: var(--color-surface-mid);
  border-color: rgba(255, 255, 255, 0.2);
}
.os-nav-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}


/* ────────────────────────────────────────────
   MAIN AREA
──────────────────────────────────────────── */
.os-main {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: var(--z-raised);
}


/* ────────────────────────────────────────────
   ORBITAL CANVAS — the circular stage
──────────────────────────────────────────── */
.os-canvas {
  position: relative;
  width: clamp(500px, 65vw, 820px);
  height: clamp(500px, 65vw, 820px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}


/* ────────────────────────────────────────────
   SVG ORBITAL RINGS
──────────────────────────────────────────── */
.os-rings {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}


/* ────────────────────────────────────────────
   CENTER CONTENT
──────────────────────────────────────────── */
.os-center {
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
  max-width: 480px;
}

/* Decorative concentric rings behind the star */
.os-center-ring {
  position: absolute;
  top: 0;
  left: 50%;
  border-radius: 50%;
  border: 1px solid var(--color-accent-subtle);
  pointer-events: none;
}
.os-center-ring--inner {
  width: 60px;
  height: 60px;
  transform: translate(-50%, -20px);
}
.os-center-ring--outer {
  width: 100px;
  height: 100px;
  transform: translate(-50%, -40px);
  border-color: rgba(196, 132, 62, 0.06);
}

/* Star dot */
.os-star {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 12px 4px var(--color-accent-muted);
  margin-bottom: var(--space-3);
}

/* Eyebrow */
.os-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-accent);
}

/* Headline */
.os-headline {
  font-family: var(--font-serif);
  font-size: var(--text-display);
  font-weight: 300;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  white-space: pre-line;
  text-align: center;
  margin: 0;
}

.os-headline-line {
  display: block;
  overflow: hidden;
  clip-path: inset(0 0 0 0);
}

.os-headline-inner {
  display: block;
}


/* ────────────────────────────────────────────
   STAT PILLS (inner orbit)
──────────────────────────────────────────── */
.os-stat-pill {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 16px;
  background: var(--color-surface);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-md);
  white-space: nowrap;
  cursor: default;
  transition:
    background 0.4s var(--ease-out),
    box-shadow 0.4s var(--ease-out),
    border-color 0.4s var(--ease-out);
}

.os-stat-pill:hover {
  background: var(--color-surface-mid);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.08);
  border-color: var(--color-accent-muted);
}

.os-stat-num {
  font-family: var(--font-display);
  font-size: var(--text-title);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  line-height: 1;
}

.os-stat-label {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}


/* ────────────────────────────────────────────
   SERVICE PILLS (outer orbit)
──────────────────────────────────────────── */
.os-service-pill {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 2;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-muted);
  white-space: nowrap;
  cursor: default;
  transition:
    color 0.3s var(--ease-out),
    border-color 0.3s var(--ease-out),
    background 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out);
}

.os-service-pill:hover {
  color: var(--color-text);
  border-color: var(--color-accent-muted);
  background: var(--color-accent-subtle);
  box-shadow: 0 4px 16px rgba(196, 132, 62, 0.1);
}


/* ────────────────────────────────────────────
   CTA AREA
──────────────────────────────────────────── */
.os-cta-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  padding-bottom: var(--space-8);
  position: relative;
  z-index: var(--z-raised);
  margin-top: calc(-1 * var(--space-12));
}

.os-description {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  text-align: center;
  max-width: 420px;
}

.os-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: 14px 32px;
  background: var(--color-accent);
  color: var(--color-canvas);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  position: relative;
  overflow: hidden;
  transition:
    background 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out);
}

/* Shimmer sweep on hover */
.os-cta::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%
  );
  transition: left 0.6s var(--ease-out);
  pointer-events: none;
}
.os-cta:hover::after {
  left: 100%;
}

.os-cta:hover {
  background: var(--color-text);
  box-shadow: 0 8px 32px var(--color-accent-muted);
}

.os-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.os-cta svg {
  transition: transform 0.3s var(--ease-out);
}
.os-cta:hover svg {
  transform: translateX(4px);
}


/* ────────────────────────────────────────────
   MOBILE STATS (hidden on desktop)
──────────────────────────────────────────── */
.os-mobile-stats {
  display: none;
}

.os-mobile-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.os-mobile-stat-num {
  font-family: var(--font-display);
  font-size: var(--text-title);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  line-height: 1;
}

.os-mobile-stat-label {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}


/* ────────────────────────────────────────────
   MOBILE SERVICES (hidden on desktop)
──────────────────────────────────────────── */
.os-mobile-services {
  display: none;
}

.os-mobile-service-tag {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-muted);
}


/* ────────────────────────────────────────────
   BOTTOM ACCENT STRIP
──────────────────────────────────────────── */
.os-strip {
  position: relative;
  z-index: var(--z-raised);
  height: 2px;
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--color-accent-muted) 30%,
    var(--color-accent) 50%,
    var(--color-accent-muted) 70%,
    transparent 100%
  );
}


/* ────────────────────────────────────────────
   RESPONSIVE — TABLET
──────────────────────────────────────────── */
@media (max-width: 1279px) and (min-width: 769px) {
  .os-canvas {
    width: clamp(420px, 80vw, 680px);
    height: clamp(420px, 80vw, 680px);
  }
}


/* ────────────────────────────────────────────
   RESPONSIVE — MOBILE
──────────────────────────────────────────── */
@media (max-width: 768px) {
  .s-os {
    min-height: 100vh;
    height: auto;
    grid-template-rows: auto auto auto auto auto auto;
  }

  .os-nav-links {
    display: none;
  }

  /* Simplified orbital canvas: just center content */
  .os-canvas {
    width: 100%;
    height: auto;
    min-height: 240px;
    padding: var(--space-12) var(--space-section-x) var(--space-6);
  }

  /* Hide orbital elements on mobile */
  .os-rings { display: none; }
  .os-stat-pill { display: none; }
  .os-service-pill { display: none; }

  .os-center {
    max-width: 100%;
  }

  .os-headline {
    font-size: clamp(40px, 10vw, 72px);
  }

  .os-cta-area {
    margin-top: 0;
    padding: var(--space-4) var(--space-section-x) var(--space-8);
  }

  /* Show mobile stats row */
  .os-mobile-stats {
    display: flex;
    gap: var(--space-8);
    justify-content: center;
    flex-wrap: wrap;
    padding: var(--space-6) var(--space-section-x);
  }

  /* Show mobile services row */
  .os-mobile-services {
    display: flex;
    gap: var(--space-3);
    justify-content: center;
    flex-wrap: wrap;
    padding: 0 var(--space-section-x) var(--space-6);
  }
}
</style>
