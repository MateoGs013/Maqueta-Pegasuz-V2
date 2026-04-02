<script setup>
/**
 * S-MarqueeTicker  |  Marquee Ticker Hero
 * ──────────────────────────────────────────
 * The marquee IS the hero -- not decoration but the primary visual
 * statement. 4 rows of infinitely scrolling text at different sizes,
 * speeds, directions, and opacities create a typographic landscape.
 * Headline + CTA overlay the marquee system with a radial halo.
 *
 * Layers (bottom to top):
 *   1. ::before          -- subtle radial glow atmosphere
 *   2. .mt-field         -- 4 marquee rows (GSAP x-loop)
 *   3. .mt-field::before/after -- edge fade masks
 *   4. .mt-overlay       -- centered headline + description + CTA
 *   5. .mt-nav           -- transparent nav bar
 *   6. ::after           -- grain overlay
 *
 * Signature: Hovering any marquee row slows it to 20% speed via
 * gsap.to(tl, { timeScale: 0.2 }) while other rows continue at
 * full speed. Creates a "spotlight" freeze-frame effect.
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SMarqueeTicker' })

const props = defineProps({
  headline:    { type: String, default: 'We build\nbold.' },
  description: { type: String, default: 'Strategy-led design and engineering for companies that refuse to be ordinary.' },
  ctaLabel:    { type: String, default: 'Start a project' },
  ctaHref:     { type: String, default: '#contact' },
  row1Text:    { type: String, default: 'FORGE STUDIO \u00B7 WE BUILD PRECISION \u00B7 DIGITAL EXCELLENCE \u00B7 ' },
  row2Text:    { type: String, default: 'DESIGN  \u00B7  STRATEGY  \u00B7  ENGINEERING  \u00B7  LAUNCH  \u00B7  ' },
  row3Text:    { type: String, default: 'Building tomorrow\u2019s brands today \u00B7 Award-winning digital studio \u00B7 ' },
  row4Text:    { type: String, default: 'EST. 2019 \u00B7 BUENOS AIRES \u00B7 DIGITAL STUDIO \u00B7 AWARD WINNING \u00B7 ' },
})

const sectionRef = ref(null)
const ctaRef = ref(null)
let mm = null

const headlineLines = computed(() => props.headline.split('\n'))

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

    // ── Element refs ────────────────────────────────
    const field = el.querySelector('.mt-field')
    const headlineInners = el.querySelectorAll('.mt-headline-inner')
    const descEl = el.querySelector('.mt-description')
    const ctaEl = el.querySelector('.mt-cta')
    const rows = el.querySelectorAll('.mt-row')

    // ── Marquee timelines ───────────────────────────
    const marqueeTLs = []
    // Row speeds: seconds to cross one loop (50%). Row 2 is slowest.
    const speeds = isMobile ? [14, 28, 20, 10] : [20, 40, 30, 16]
    // Directions: -1 = left, 1 = right (alternating)
    const directions = [-1, 1, -1, 1]

    rows.forEach((row, i) => {
      const track = row.querySelector('.mt-track')
      if (!track) return

      const startX = directions[i] === -1 ? '0%' : '-50%'
      const endX   = directions[i] === -1 ? '-50%' : '0%'

      gsap.set(track, { x: startX })

      const tl = gsap.to(track, {
        x: endX,
        duration: speeds[i],
        ease: 'none',
        repeat: -1,
      })

      marqueeTLs.push(tl)

      // ── SIGNATURE: hover slows row to 20% speed ──
      row.addEventListener('mouseenter', () => {
        gsap.to(tl, { timeScale: 0.2, duration: 0.6, ease: 'power2.out' })
      })
      row.addEventListener('mouseleave', () => {
        gsap.to(tl, { timeScale: 1, duration: 0.8, ease: 'power2.inOut' })
      })
    })

    // ── Initial states ──────────────────────────────
    gsap.set(field, { autoAlpha: 0 })
    gsap.set(headlineInners, { yPercent: 110 })
    gsap.set(descEl, { autoAlpha: 0, y: 14 })
    gsap.set(ctaEl, { autoAlpha: 0, y: 10, scale: 0.94 })

    // Pause marquees initially — stagger their resume
    marqueeTLs.forEach(tl => tl.pause())

    // ── Entrance timeline ───────────────────────────
    const entranceTL = gsap.timeline({ defaults: { ease: 'power3.out' } })

    entranceTL
      // Marquee field fades in
      .to(field, { autoAlpha: 1, duration: 1.2, ease: 'power2.out' }, 0.2)
      // Stagger marquee start times — each row starts at a different beat
      .call(() => marqueeTLs[0]?.resume(), null, 0.3)
      .call(() => marqueeTLs[3]?.resume(), null, 0.38)
      .call(() => marqueeTLs[2]?.resume(), null, 0.45)
      .call(() => marqueeTLs[1]?.resume(), null, 0.55)
      // Overlay content reveals
      .to(headlineInners, {
        yPercent: 0, stagger: 0.14, duration: 0.9, ease: 'power4.out',
      }, 0.55)
      .to(descEl, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.95)
      .to(ctaEl, {
        autoAlpha: 1, y: 0, scale: 1, duration: 0.65, ease: 'back.out(1.4)',
      }, 1.05)

    // ── Scroll: rows drift at different vertical rates ──
    const drifts = [-30, -15, -45, -20]
    rows.forEach((row, i) => {
      gsap.to(row, {
        y: drifts[i],
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      })
    })

    // ── Scroll: overlay content parallax + fade ─────
    gsap.to(el.querySelector('.mt-overlay'), {
      y: -60,
      autoAlpha: 0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '60% top',
        scrub: 0.5,
      },
    })

    // ── Magnetic CTA ────────────────────────────────
    if (!isMobile && ctaEl) {
      const xTo = gsap.quickTo(ctaEl, 'x', { duration: 0.6, ease: 'power3.out' })
      const yTo = gsap.quickTo(ctaEl, 'y', { duration: 0.6, ease: 'power3.out' })

      const onMove = (e) => {
        const r = ctaEl.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.4)
        yTo((e.clientY - r.top - r.height / 2) * 0.4)
      }
      const onLeave = () => { xTo(0); yTo(0) }

      ctaEl.addEventListener('mousemove', onMove)
      ctaEl.addEventListener('mouseleave', onLeave)
    }

    // ── Cleanup ─────────────────────────────────────
    return () => {
      marqueeTLs.forEach(tl => tl.kill())
      marqueeTLs.length = 0
    }
  }, el) // scope for selectors

})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section ref="sectionRef" class="s-mt" role="banner" aria-label="Hero">

    <!-- Marquee field — 4 rows of infinitely scrolling type -->
    <div class="mt-field" aria-hidden="true">
      <!-- Row 1: Display caps, fast left -->
      <div class="mt-row mt-row--1">
        <div class="mt-track">
          <span class="mt-track-copy">{{ row1Text }}</span>
          <span class="mt-track-copy">{{ row1Text }}</span>
        </div>
      </div>
      <!-- Row 2: Giant serif, slow right — the HERO row -->
      <div class="mt-row mt-row--2">
        <div class="mt-track">
          <span class="mt-track-copy">{{ row2Text }}</span>
          <span class="mt-track-copy">{{ row2Text }}</span>
        </div>
      </div>
      <!-- Row 3: Italic serif, medium left -->
      <div class="mt-row mt-row--3">
        <div class="mt-track">
          <span class="mt-track-copy">{{ row3Text }}</span>
          <span class="mt-track-copy">{{ row3Text }}</span>
        </div>
      </div>
      <!-- Row 4: Mono caps, fast right -->
      <div class="mt-row mt-row--4">
        <div class="mt-track">
          <span class="mt-track-copy">{{ row4Text }}</span>
          <span class="mt-track-copy">{{ row4Text }}</span>
        </div>
      </div>
    </div>

    <!-- Overlay content — centered on top of marquee landscape -->
    <div class="mt-overlay">
      <div class="mt-content">
        <h1 class="mt-headline" :aria-label="headline">
          <span
            v-for="(line, i) in headlineLines"
            :key="i"
            class="mt-headline-line"
          >
            <span class="mt-headline-inner">{{ line }}</span>
          </span>
        </h1>
        <p class="mt-description">{{ description }}</p>
        <a ref="ctaRef" :href="ctaHref" class="mt-cta" data-magnetic>
          {{ ctaLabel }}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </div>

  </section>
</template>

<style scoped>
/* ────────────────────────────────────────────────
   S-MarqueeTicker  |  base (375px)
──────────────────────────────────────────────── */
.s-mt {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  min-height: 600px;
  overflow: hidden;
  background: var(--color-canvas);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
}

/* ── Atmosphere: radial glow ─────────────────── */
.s-mt::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      ellipse 70% 50% at 50% 45%,
      var(--color-accent-subtle) 0%,
      transparent 70%
    ),
    radial-gradient(
      circle at 20% 80%,
      rgba(196, 132, 62, 0.04) 0%,
      transparent 50%
    );
  z-index: var(--z-base);
  pointer-events: none;
}

/* ── Grain overlay ───────────────────────────── */
.s-mt::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: mt-grain 0.5s steps(6) infinite;
}

@keyframes mt-grain {
  0%, 100% { transform: translate(0, 0); }
  25%  { transform: translate(-5%, -5%); }
  50%  { transform: translate(5%, 0); }
  75%  { transform: translate(0, 5%); }
}


/* ────────────────────────────────────────────────
   MARQUEE FIELD
──────────────────────────────────────────────── */
.mt-field {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
  z-index: var(--z-base);
  pointer-events: none;
}

/* Edge fade masks — clip the marquee edges */
.mt-field::before,
.mt-field::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: clamp(60px, 8vw, 140px);
  z-index: 2;
  pointer-events: none;
}
.mt-field::before {
  left: 0;
  background: linear-gradient(to right, var(--color-canvas) 0%, transparent 100%);
}
.mt-field::after {
  right: 0;
  background: linear-gradient(to left, var(--color-canvas) 0%, transparent 100%);
}


/* ── Individual marquee rows ─────────────────── */
.mt-row {
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  position: relative;
  pointer-events: auto;
  cursor: default;
  transition: opacity 0.4s var(--ease-out);
}

.mt-track {
  display: inline-flex;
  gap: 0;
}

.mt-track-copy {
  flex-shrink: 0;
}

/* Row 1 — Display caps, fast left, ghostly */
.mt-row--1 {
  font-family: var(--font-display);
  font-size: clamp(36px, 5vw, 72px);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  text-transform: uppercase;
  color: var(--color-text);
  opacity: 0.12;
  line-height: var(--leading-snug);
  padding: 8px 0;
}
.mt-row--1:hover { opacity: 0.35; }

/* Row 2 — GIANT serif, accent color, slow — THE hero row */
.mt-row--2 {
  font-family: var(--font-serif);
  font-size: clamp(80px, 12vw, 180px);
  font-weight: 300;
  letter-spacing: var(--tracking-tight);
  color: var(--color-accent);
  opacity: 0.35;
  line-height: var(--leading-none);
  padding: 4px 0;
}
.mt-row--2:hover { opacity: 0.65; }

/* Row 3 — Medium italic serif, very subtle */
.mt-row--3 {
  font-family: var(--font-serif);
  font-size: clamp(24px, 3.5vw, 52px);
  font-weight: 300;
  font-style: italic;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  opacity: 0.18;
  line-height: 1.4;
  padding: 10px 0;
}
.mt-row--3:hover { opacity: 0.45; }

/* Row 4 — Mono caps, small, fast, data-stream feel */
.mt-row--4 {
  font-family: var(--font-mono);
  font-size: clamp(11px, 1.5vw, 18px);
  font-weight: 400;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-subtle);
  opacity: 0.3;
  line-height: 2;
  padding: 6px 0;
}
.mt-row--4:hover { opacity: 0.6; }


/* ────────────────────────────────────────────────
   OVERLAY CONTENT
──────────────────────────────────────────────── */
.mt-overlay {
  position: relative;
  z-index: var(--z-raised);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.mt-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  text-align: center;
  pointer-events: auto;
  /* Radial halo so text is legible over the busy marquee */
  background: radial-gradient(
    ellipse at center,
    rgba(13, 11, 9, 0.75) 0%,
    rgba(13, 11, 9, 0.45) 45%,
    transparent 72%
  );
  padding: var(--space-16) var(--space-12);
  border-radius: 50%;
}

.mt-headline {
  font-family: var(--font-display);
  font-size: var(--text-display);
  font-weight: 700;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  text-transform: uppercase;
  white-space: pre-line;
}

.mt-headline-line {
  display: block;
  overflow: hidden;
}

.mt-headline-inner {
  display: block;
}

.mt-description {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: 1.6;
  color: var(--color-text-muted);
  max-width: 360px;
  text-align: center;
}

/* ── CTA button — pill with magnetic effect ──── */
.mt-cta {
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
  min-height: 44px;
  position: relative;
  transition:
    background 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out);
}
.mt-cta:hover {
  background: var(--color-text);
  box-shadow:
    0 4px 16px rgba(196, 132, 62, 0.2),
    0 12px 40px rgba(196, 132, 62, 0.12);
}
.mt-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
.mt-cta svg {
  transition: transform 0.3s var(--ease-out);
}
.mt-cta:hover svg {
  transform: translateX(4px);
}


/* ────────────────────────────────────────────────
   RESPONSIVE: tablet (768px+)
──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .mt-row--1 { font-size: clamp(28px, 8vw, 52px); }
  .mt-row--2 { font-size: clamp(56px, 14vw, 120px); }
  .mt-row--3 { font-size: clamp(20px, 6vw, 36px); }

  .mt-content {
    padding: var(--space-12) var(--space-8);
  }
  .mt-headline {
    font-size: clamp(40px, 10vw, 72px);
  }
  .mt-description {
    max-width: 280px;
  }
}

@media (min-width: 1280px) {
  .mt-content {
    padding: var(--space-20) var(--space-16);
  }
}


/* ────────────────────────────────────────────────
   CLIP-PATH: accent bar decoration on hero row
──────────────────────────────────────────────── */
.mt-row--2::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -2%;
  right: -2%;
  height: 1px;
  background: var(--color-accent-muted);
  transform: translateY(-50%);
  opacity: 0.15;
  z-index: -1;
  clip-path: inset(0 5% 0 5%);
}
</style>
