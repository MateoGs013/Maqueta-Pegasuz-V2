<script setup>
/**
 * S-Scattered  |  Deconstructed Editorial Layout
 * ─────────────────────────────────────────────────
 * Absolutely-positioned elements scattered across a dark viewport.
 * NOT a grid — elements break free of all constraints. Editorial
 * magazine layout gone digital. Think Awwwards SOTD winners.
 *
 * Signature: Rotated pills and CTA "snap to attention" (rotation -> 0)
 * on hover with spring easing, as if responding to focus.
 *
 * Layout:
 *   - Watermark: centered, giant, opacity 0.055
 *   - Nav: top bar, z-index 900
 *   - Headline: center-left, massive serif
 *   - Eyebrow: top-right, glass pill, rotated +2deg
 *   - Description: bottom-left
 *   - Services: right side, stacked pills, alternating rotations
 *   - Stats: bottom-center, horizontal strip
 *   - CTA: bottom-right, rotated -1.5deg
 *   - Floating accent pills: scattered stat items
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SScattered' })

const props = defineProps({
  eyebrow:     { type: String, default: 'Digital Studio \u2014 Est. 2019' },
  headline:    { type: String, default: 'Ideas built\nto last.' },
  subHeadline: { type: String, default: 'Forever.' },
  description: { type: String, default: 'We design and build digital products that don\'t just look good \u2014 they perform.' },
  ctaLabel:    { type: String, default: 'View our work' },
  ctaHref:     { type: String, default: '#work' },
  stat1Num:    { type: String, default: '48+' },
  stat1Label:  { type: String, default: 'Projects' },
  stat2Num:    { type: String, default: '9/10' },
  stat2Label:  { type: String, default: 'Awwwards' },
  stat3Num:    { type: String, default: '12' },
  stat3Label:  { type: String, default: 'Countries' },
  services:    { type: Array, default: () => ['Brand Strategy', 'Product Design', 'Engineering', 'Launch'] },
  watermark:   { type: String, default: 'STUDIO' },
})

const sectionRef = ref(null)
const ctaRef = ref(null)
let mm = null

/* ── Magnetic CTA ──────────────────────────────── */
function onCtaMove(e) {
  const btn = ctaRef.value
  if (!btn) return
  const rect = btn.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) * 0.3
  const y = (e.clientY - rect.top - rect.height / 2) * 0.3
  gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out' })
}
function onCtaLeave() {
  const btn = ctaRef.value
  if (!btn) return
  gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
}

/* ── Headline line splitting helper ──────────────── */
const headlineLines = props.headline.split('\n')

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
    const { isDesktop, isTablet, isMobile, reduceMotion } = context.conditions
    if (reduceMotion) return

    /* ── Initial states ─────────────────────────── */
    gsap.set(el.querySelector('.sc-watermark'), { autoAlpha: 0, scale: 0.95 })
    gsap.set(el.querySelectorAll('.sc-headline-line'), { yPercent: 108, autoAlpha: 0 })
    gsap.set(el.querySelector('.sc-sub'), { yPercent: 108, autoAlpha: 0 })
    gsap.set(el.querySelector('.sc-eyebrow'), { autoAlpha: 0, x: 20 })
    gsap.set(el.querySelector('.sc-description'), { autoAlpha: 0, y: 16 })
    gsap.set(el.querySelectorAll('.sc-service-tag'), { autoAlpha: 0, x: 20 })
    gsap.set(el.querySelectorAll('.sc-stat'), { autoAlpha: 0, y: 16 })
    gsap.set(el.querySelector('.sc-cta'), { autoAlpha: 0, y: 10 })
    gsap.set(el.querySelector('.sc-bleed-line'), { scaleX: 0 })

    /* ── Entrance timeline ──────────────────────── */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // 2. Watermark
    tl.to(el.querySelector('.sc-watermark'), {
      autoAlpha: 0.055, scale: 1, duration: 1.2, ease: 'power4.out',
    }, 0.1)

    // 3. Headline lines (overflow-hidden mask)
    tl.to(el.querySelectorAll('.sc-headline-line'), {
      yPercent: 0, autoAlpha: 1, duration: 1.0, stagger: 0.12, ease: 'power3.out',
    }, 0.2)

    // 3b. Sub-headline (accent word)
    tl.to(el.querySelector('.sc-sub'), {
      yPercent: 0, autoAlpha: 1, duration: 1.0, ease: 'power3.out',
    }, 0.44)

    // 4. Eyebrow (keeps final rotation)
    tl.to(el.querySelector('.sc-eyebrow'), {
      autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out',
    }, 0.6)

    // 5. Description
    tl.to(el.querySelector('.sc-description'), {
      autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out',
    }, 0.8)

    // 6. Service tags (stagger)
    tl.to(el.querySelectorAll('.sc-service-tag'), {
      autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out',
    }, 0.5)

    // 7. Stats (stagger)
    tl.to(el.querySelectorAll('.sc-stat'), {
      autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
    }, 0.9)

    // 8. CTA (spring easing)
    tl.to(el.querySelector('.sc-cta'), {
      autoAlpha: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)',
    }, 1.0)

    // 9. Bleed line (dramatic reveal)
    tl.to(el.querySelector('.sc-bleed-line'), {
      scaleX: 1, duration: 1.4, ease: 'power3.inOut',
    }, 0.5)

    /* ── Scroll parallax ────────────────────────── */
    // Headline: moves slower (foreground)
    gsap.to(el.querySelector('.sc-headline-block'), {
      y: isMobile ? 20 : 40,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // Watermark: recedes faster
    gsap.to(el.querySelector('.sc-watermark'), {
      y: isMobile ? -30 : -60,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // Services: drift up slightly
    if (!isMobile) {
      gsap.to(el.querySelector('.sc-services'), {
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      })
    }

    // Atmospheric glow: intensify on scroll
    gsap.to(el, {
      '--glow-opacity': 0.18,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

  }, sectionRef.value)
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section
    ref="sectionRef"
    class="s-sc"
    aria-label="Hero: Scattered editorial layout"
  >
    <!-- Atmosphere: radial glow -->
    <div class="sc-glow" aria-hidden="true"></div>

    <!-- Horizontal bleed line (100vw container break) -->
    <div class="sc-bleed-line" aria-hidden="true"></div>

    <!-- Watermark background word -->
    <div class="sc-watermark" aria-hidden="true">{{ watermark }}</div>

    <!-- Eyebrow pill (rotated) -->
    <div class="sc-eyebrow">{{ eyebrow }}</div>

    <!-- Headline block (center-left, massive serif) -->
    <div class="sc-headline-block">
      <h1 class="sc-headline">
        <span
          v-for="(line, i) in headlineLines"
          :key="i"
          class="sc-headline-mask"
        ><span class="sc-headline-line">{{ line }}</span></span>
        <span class="sc-headline-mask sc-headline-mask--sub">
          <span class="sc-headline-line sc-sub">{{ subHeadline }}</span>
        </span>
      </h1>
    </div>

    <!-- Description (bottom-left) -->
    <p class="sc-description">{{ description }}</p>

    <!-- Service tags (right side, stacked, rotated) -->
    <div class="sc-services" aria-label="Services offered">
      <span
        v-for="(service, i) in services"
        :key="service"
        class="sc-service-tag"
        :class="{ 'sc-service-tag--even': i % 2 === 1 }"
      >{{ service }}</span>
    </div>

    <!-- Stats strip (bottom center) -->
    <div class="sc-stats" aria-label="Key statistics">
      <div class="sc-stat">
        <span class="sc-stat-num">{{ stat1Num }}</span>
        <span class="sc-stat-label">{{ stat1Label }}</span>
      </div>
      <div class="sc-stat-divider" aria-hidden="true"></div>
      <div class="sc-stat">
        <span class="sc-stat-num">{{ stat2Num }}</span>
        <span class="sc-stat-label">{{ stat2Label }}</span>
      </div>
      <div class="sc-stat-divider" aria-hidden="true"></div>
      <div class="sc-stat">
        <span class="sc-stat-num">{{ stat3Num }}</span>
        <span class="sc-stat-label">{{ stat3Label }}</span>
      </div>
    </div>

    <!-- CTA button (bottom-right, rotated, magnetic) -->
    <a
      ref="ctaRef"
      :href="ctaHref"
      class="sc-cta"
      data-magnetic
      @mousemove="onCtaMove"
      @mouseleave="onCtaLeave"
    >
      <span class="sc-cta-text">{{ ctaLabel }}</span>
      <span class="sc-cta-arrow" aria-hidden="true">&rarr;</span>
    </a>
  </section>
</template>

<style scoped>
/* ─── Section Container ──────────────────────── */
.s-sc {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  min-height: 600px;
  background: var(--color-canvas);
  overflow: hidden;
  color: var(--color-text);
  --glow-opacity: 0.08;
}

/* ─── Grain overlay ──────────────────────────── */
.s-sc::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  background-repeat: repeat;
  opacity: 0.035;
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: sc-grain 0.5s steps(6) infinite;
}

@keyframes sc-grain {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5%, -5%); }
  50% { transform: translate(5%, 0); }
  75% { transform: translate(0, 5%); }
}

/* ─── Vignette atmospheric layer (::before) ──── */
.s-sc::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.45) 100%);
  pointer-events: none;
  z-index: 1;
}

/* ─── Atmospheric radial glow ────────────────── */
.sc-glow {
  position: absolute;
  left: 30%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 60vw;
  height: 60vw;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-accent-subtle) 0%, transparent 70%);
  opacity: var(--glow-opacity);
  pointer-events: none;
  z-index: var(--z-base);
}

/* ─── Watermark ──────────────────────────────── */
.sc-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--z-base);
  font-family: var(--font-display);
  font-size: clamp(160px, 22vw, 320px);
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--color-text);
  opacity: var(--hero-watermark-opacity);
  white-space: nowrap;
  user-select: none;
  pointer-events: none;
}

/* ─── Eyebrow pill (glass, rotated) ──────────── */
.sc-eyebrow {
  position: absolute;
  top: 18%;
  right: clamp(40px, 6vw, 120px);
  transform: rotate(2deg);
  background: var(--glass-dark);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: var(--glass-border-dark);
  box-shadow: var(--glass-shadow);
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-muted);
  z-index: var(--z-raised);
  white-space: nowrap;
  transition: transform 0.5s var(--ease-spring);
}

.sc-eyebrow:hover {
  transform: rotate(0deg);
}

/* ─── Headline block ─────────────────────────── */
.sc-headline-block {
  position: absolute;
  left: var(--space-section-x);
  top: 50%;
  transform: translateY(-55%);
  z-index: var(--z-raised);
  max-width: 65vw;
}

.sc-headline {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: var(--text-hero);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  margin: 0;
}

.sc-headline-mask {
  display: block;
  overflow: hidden;
}

.sc-headline-line {
  display: block;
}

.sc-sub {
  color: var(--color-accent);
  font-style: italic;
}

/* ─── Description (bottom-left) ──────────────── */
.sc-description {
  position: absolute;
  bottom: 18%;
  left: var(--space-section-x);
  max-width: 340px;
  z-index: var(--z-raised);
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  margin: 0;
}

/* ─── Service tags (right side, stacked, rotated) */
.sc-services {
  position: absolute;
  right: clamp(24px, 4vw, 64px);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  z-index: var(--z-raised);
  align-items: flex-end;
}

.sc-service-tag {
  background: var(--hero-pill-bg);
  border: 1px solid var(--hero-pill-border);
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-muted);
  white-space: nowrap;
  transform: rotate(-1.5deg);
  transition: transform 0.5s var(--ease-spring),
              background 0.3s var(--ease-out),
              color 0.3s var(--ease-out);
  cursor: default;
}

.sc-service-tag--even {
  transform: rotate(1.5deg);
}

.sc-service-tag:hover {
  transform: rotate(0deg) !important;
  background: var(--color-accent-subtle);
  color: var(--color-text);
}

/* ─── Stats strip (bottom center) ────────────── */
.sc-stats {
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-8);
  z-index: var(--z-raised);
}

.sc-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.sc-stat-num {
  font-family: var(--font-display);
  font-size: var(--text-heading);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.sc-stat-label {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.sc-stat-divider {
  width: 1px;
  height: 32px;
  background: var(--color-line);
  flex-shrink: 0;
}

/* ─── CTA button (bottom-right, rotated, magnetic) */
.sc-cta {
  position: absolute;
  bottom: 12%;
  right: clamp(40px, 8vw, 140px);
  transform: rotate(-1.5deg);
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: 14px 28px;
  background: var(--color-accent);
  color: var(--color-canvas);
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: var(--text-body-sm);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  text-decoration: none;
  z-index: var(--z-raised);
  transition: transform 0.5s var(--ease-spring),
              box-shadow 0.3s var(--ease-out);
  box-shadow: 0 4px 20px rgba(196, 132, 62, 0.2),
              0 0 0 0 var(--color-accent-muted);
  will-change: auto;
}

.sc-cta:hover {
  transform: rotate(0deg);
  box-shadow: 0 8px 32px rgba(196, 132, 62, 0.35),
              0 0 0 3px var(--color-accent-muted);
}

.sc-cta:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 4px;
}

.sc-cta-arrow {
  display: inline-block;
  transition: transform 0.3s var(--ease-out);
  font-size: var(--text-body);
}

.sc-cta:hover .sc-cta-arrow {
  transform: translateX(4px);
}

.sc-cta-text {
  pointer-events: none;
}

/* ─── Decorative accent line with clip-path ──── */
.sc-description::before {
  content: '';
  position: absolute;
  top: -16px;
  left: 0;
  width: 48px;
  height: 2px;
  background: var(--color-accent);
  clip-path: polygon(0 0, 100% 0, 92% 100%, 0 100%);
}

/* ─── Decorative corner marker (top-left atmosphere) */
.sc-headline-block::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -8px;
  width: 24px;
  height: 24px;
  border-left: 1px solid var(--color-accent-muted);
  border-top: 1px solid var(--color-accent-muted);
  opacity: 0.6;
  pointer-events: none;
}

/* ─── Horizontal bleed line (container break) ── */
.sc-bleed-line {
  position: absolute;
  bottom: 30%;
  left: -5vw;
  width: 110vw;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--color-line) 20%,
    var(--color-accent-subtle) 50%,
    var(--color-line) 80%,
    transparent 100%
  );
  z-index: 1;
  pointer-events: none;
}

/* ─── Responsive: tablet + mobile ────────────── */
@media (max-width: 1279px) {
  .sc-headline-block {
    max-width: 55vw;
  }

  .sc-services {
    right: clamp(16px, 3vw, 40px);
  }

  .sc-stats {
    gap: var(--space-6);
  }
}

@media (max-width: 768px) {
  .s-sc {
    height: auto;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    padding: 80px var(--space-section-x) var(--space-16);
    gap: var(--space-6);
  }

  .sc-watermark {
    position: absolute;
    font-size: clamp(80px, 18vw, 140px);
    letter-spacing: 0.2em;
  }

  .sc-eyebrow {
    position: relative;
    top: auto;
    right: auto;
    transform: none;
    align-self: flex-start;
  }

  .sc-headline-block {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    max-width: 100%;
  }

  .sc-headline {
    font-size: clamp(48px, 12vw, 72px);
  }

  .sc-description {
    position: relative;
    bottom: auto;
    left: auto;
    max-width: 100%;
  }

  .sc-services {
    position: relative;
    right: auto;
    top: auto;
    transform: none;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .sc-service-tag,
  .sc-service-tag--even {
    transform: none;
  }

  .sc-stats {
    position: relative;
    bottom: auto;
    left: auto;
    transform: none;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: var(--space-6);
  }

  .sc-cta {
    position: relative;
    bottom: auto;
    right: auto;
    transform: none;
    align-self: flex-start;
    margin-top: var(--space-4);
  }

  .sc-glow {
    width: 100vw;
    height: 100vw;
    left: 50%;
    top: 30%;
  }

  .sc-bleed-line {
    display: none;
  }

}
</style>
