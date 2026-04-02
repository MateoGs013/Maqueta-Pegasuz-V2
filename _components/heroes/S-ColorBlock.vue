<script setup>
/**
 * S-ColorBlock  |  Geometric Color-Block Hero
 * ─────────────────────────────────────────────
 * Bold Bauhaus/Swiss-design hero. The viewport is divided
 * into large geometric zones of solid color — NO photography.
 * The geometry IS the design.
 *
 * Structure:
 *   Row 1 [72px]   — Full-width navigation bar
 *   Row 2 [1fr]    — Main: left 55% near-black + right 45% accent block
 *   Row 3 [52px]   — Monospaced metadata strip
 *
 * Signature: The right 45% of viewport is pure accent color —
 * a razor-sharp 1px hairline divides the two worlds. A giant
 * decorative circle floats inside the amber block, partially
 * cropped, purely geometric. Bauhaus meets Mondrian.
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SColorBlock' })

const props = defineProps({
  eyebrow:      { type: String, default: 'Brand Strategy \u00B7 Digital Studio \u00B7 Est. 2019' },
  headline:     { type: String, default: 'We design\nfor what\u2019s\nnext.' },
  description:  { type: String, default: 'Strategy-led branding and digital products for ambitious companies ready to move fast.' },
  ctaLabel:     { type: String, default: 'Start a project' },
  ctaHref:      { type: String, default: '#contact' },
  metaLocation: { type: String, default: 'Buenos Aires, ARG' },
  metaYear:     { type: String, default: '2024' },
  metaRole:     { type: String, default: 'Creative Studio' },
})

const headlineLines = props.headline.split('\n')
const sectionRef = ref(null)
const ctaRef = ref(null)
let mm = null

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
    const { reduceMotion } = context.conditions
    if (reduceMotion) return

    // ── Initial states ──────────────────────────────────
    gsap.set(el.querySelector('.cb-nav'), { autoAlpha: 0, y: -10 })
    gsap.set(el.querySelector('.cb-right'), { autoAlpha: 0, x: 40 })
    gsap.set(el.querySelector('.cb-eyebrow'), { autoAlpha: 0, y: 12 })
    gsap.set(el.querySelectorAll('.cb-headline-inner'), { yPercent: 108 })
    gsap.set(el.querySelector('.cb-description'), { autoAlpha: 0, y: 16 })
    gsap.set(el.querySelector('.cb-cta'), { autoAlpha: 0, y: 10 })
    gsap.set(el.querySelectorAll('.cb-meta-item'), { autoAlpha: 0 })
    gsap.set(el.querySelector('.cb-circle'), { autoAlpha: 0, scale: 0.88 })
    gsap.set(el.querySelector('.cb-circle-sm'), { autoAlpha: 0, scale: 0.88 })
    gsap.set(el.querySelector('.cb-divider'), { scaleY: 0 })

    // ── Entrance timeline ───────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

    tl
      // 1. Nav
      .to(el.querySelector('.cb-nav'), {
        autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out',
      }, 0)

      // 2. Accent block
      .to(el.querySelector('.cb-right'), {
        autoAlpha: 1, x: 0, duration: 1.2, ease: 'power4.out',
      }, 0.1)

      // Hairline divider
      .to(el.querySelector('.cb-divider'), {
        scaleY: 1, duration: 1.0, ease: 'power3.inOut',
        transformOrigin: 'center top',
      }, 0.15)

      // 3. Eyebrow pill
      .to(el.querySelector('.cb-eyebrow'), {
        autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out',
      }, 0.3)

      // 4. Headline lines — staggered mask reveal
      .to(el.querySelectorAll('.cb-headline-inner'), {
        yPercent: 0, duration: 0.9, ease: 'power4.out',
        stagger: 0.1,
      }, 0.4)

      // 5. Description
      .to(el.querySelector('.cb-description'), {
        autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out',
      }, 0.8)

      // 6. CTA
      .to(el.querySelector('.cb-cta'), {
        autoAlpha: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)',
      }, 0.9)

      // 7. Meta row — staggered
      .to(el.querySelectorAll('.cb-meta-item'), {
        autoAlpha: 1, duration: 0.5, ease: 'power2.out',
        stagger: 0.08,
      }, 1.0)

      // 8. Decorative circles
      .to(el.querySelector('.cb-circle'), {
        autoAlpha: 1, scale: 1, duration: 1.0, ease: 'power3.out',
      }, 0.2)
      .to(el.querySelector('.cb-circle-sm'), {
        autoAlpha: 1, scale: 1, duration: 0.8, ease: 'power3.out',
      }, 0.35)

    // ── Scroll-linked parallax ──────────────────────────
    gsap.to(el.querySelector('.cb-right'), {
      yPercent: -4,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    gsap.to(el.querySelector('.cb-headline'), {
      y: -24,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // Decorative circle slow parallax
    gsap.to(el.querySelector('.cb-circle'), {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // ── Magnetic CTA ────────────────────────────────────
    const ctaEl = ctaRef.value
    if (ctaEl) {
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

      // Return cleanup function for matchMedia revert
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
  <section ref="sectionRef" class="s-cb" role="banner" aria-label="Hero">
    <!-- ── Grain overlay ─────────────────────────────── -->
    <!-- handled by ::after pseudo-element -->

    <!-- ── Ambient glow (atmospheric pseudo — ::before) ── -->
    <!-- handled by ::before pseudo-element -->

    <!-- ── Navigation ────────────────────────────────── -->
    <nav class="cb-nav" aria-label="Main navigation">
      <a :href="props.navLogoHref" class="cb-logo" aria-label="Home">
        {{ props.logoText }}
      </a>
      <ul class="cb-nav-links" role="list">
        <li v-for="link in props.navLinks" :key="link.label">
          <a :href="link.href" class="cb-nav-link">{{ link.label }}</a>
        </li>
      </ul>
      <a :href="props.navCtaHref" class="cb-nav-cta">
        {{ props.navCtaLabel }}
      </a>
    </nav>

    <!-- ── Main split ────────────────────────────────── -->
    <div class="cb-main">
      <!-- LEFT: near-black with text -->
      <div class="cb-left">
        <span class="cb-eyebrow">{{ props.eyebrow }}</span>
        <h1 class="cb-headline">
          <span
            v-for="(line, i) in headlineLines"
            :key="i"
            class="cb-headline-line"
          ><span class="cb-headline-inner">{{ line }}</span></span>
        </h1>
        <p class="cb-description">{{ props.description }}</p>
        <a
          ref="ctaRef"
          :href="props.ctaHref"
          class="cb-cta"
          data-magnetic
        >
          <span class="cb-cta-label">{{ props.ctaLabel }}</span>
          <svg
            class="cb-cta-arrow"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </a>
      </div>

      <!-- Razor divider -->
      <div class="cb-divider" aria-hidden="true"></div>

      <!-- RIGHT: accent color block -->
      <div class="cb-right" aria-hidden="true">
        <div class="cb-circle"></div>
        <div class="cb-circle-sm"></div>
        <!-- Cross-hair decorative lines inside accent -->
        <div class="cb-cross-h" aria-hidden="true"></div>
        <div class="cb-cross-v" aria-hidden="true"></div>
      </div>
    </div>

    <!-- ── Meta row ──────────────────────────────────── -->
    <div class="cb-meta" aria-label="Studio information">
      <span class="cb-meta-item">{{ props.metaLocation }}</span>
      <span class="cb-meta-sep" aria-hidden="true"></span>
      <span class="cb-meta-item">{{ props.metaYear }}</span>
      <span class="cb-meta-sep" aria-hidden="true"></span>
      <span class="cb-meta-item">{{ props.metaRole }}</span>
    </div>
  </section>
</template>

<style scoped>
/* ═════════════════════════════════════════════
   S-ColorBlock  — Geometric Color-Block Hero
   ═════════════════════════════════════════════ */

.s-cb {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  min-height: 600px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--color-canvas);
  overflow: hidden;
  font-family: var(--font-body);
  color: var(--color-text);
}

/* ── Ambient glow — atmospheric pseudo-element ────── */
.s-cb::before {
  content: '';
  position: absolute;
  top: -20%;
  left: 30%;
  width: 60%;
  height: 70%;
  background: radial-gradient(
    ellipse at center,
    var(--color-accent-subtle) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: var(--z-base);
  filter: blur(80px);
}

/* ── Grain overlay ────── */
.s-cb::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  opacity: 0.035;
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: cb-grain 0.5s steps(6) infinite;
}

@keyframes cb-grain {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(-5%, -5%); }
  50%      { transform: translate(5%, 0); }
  75%      { transform: translate(0, 5%); }
}


/* ═══════ NAVIGATION ═══════ */
.cb-nav {
  position: relative;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-section-x);
  height: var(--nav-height-full);
  border-bottom: 1px solid var(--color-line);
}

.cb-logo {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  letter-spacing: var(--tracking-tight);
  transition: color 0.3s var(--ease-out);
}
.cb-logo:hover {
  color: var(--color-accent);
}
.cb-logo:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.cb-nav-links {
  display: flex;
  gap: var(--space-8);
  list-style: none;
  padding: 0;
  margin: 0;
}

.cb-nav-link {
  font-family: var(--font-body);
  font-size: var(--nav-link-size);
  letter-spacing: var(--nav-link-tracking);
  color: var(--color-text-muted);
  text-decoration: none;
  position: relative;
  padding: var(--space-2) 0;
  transition: color 0.3s var(--ease-out);
}
.cb-nav-link::after {
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
.cb-nav-link:hover {
  color: var(--color-text);
}
.cb-nav-link:hover::after {
  transform: scaleX(1);
}
.cb-nav-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.cb-nav-cta {
  font-family: var(--font-body);
  font-size: var(--nav-link-size);
  font-weight: 500;
  padding: 10px 20px;
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-pill);
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.3s var(--ease-out),
    border-color 0.3s var(--ease-out),
    color 0.3s var(--ease-out);
}
.cb-nav-cta:hover {
  background: var(--color-surface-high);
  border-color: var(--color-text-muted);
}
.cb-nav-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}


/* ═══════ MAIN SPLIT ═══════ */
.cb-main {
  display: grid;
  grid-template-columns: 59% 41%;
  height: 100%;
  position: relative;
}

/* ── Left panel ── */
.cb-left {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-24) var(--space-section-x) var(--space-12);
  position: relative;
  z-index: var(--z-raised);
}

/* ── Right panel (accent block) ── */
.cb-right {
  background: var(--hero-block-accent);
  position: relative;
  overflow: hidden;
}

/* ── Razor divider ── */
.cb-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 59%;
  width: 1px;
  background: rgba(255, 255, 255, 0.15);
  z-index: var(--z-raised);
  pointer-events: none;
}


/* ═══════ DECORATIVE GEOMETRY ═══════ */
.cb-circle {
  position: absolute;
  width: 80%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.10);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.cb-circle-sm {
  position: absolute;
  width: 40%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.25);
  top: 15%;
  right: -10%;
  clip-path: circle(50% at 50% 50%);
}

/* Cross-hair accent lines inside the accent block */
.cb-cross-h {
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.cb-cross-v {
  position: absolute;
  top: 10%;
  bottom: 10%;
  left: 50%;
  width: 1px;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}


/* ═══════ TYPOGRAPHY ═══════ */
.cb-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-8);
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
}

.cb-eyebrow::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 1px;
  background: var(--color-accent);
  flex-shrink: 0;
}

.cb-headline {
  font-family: var(--font-serif);
  font-size: var(--text-hero);
  font-weight: 300;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  margin: 0 0 var(--space-8) 0;
}

.cb-headline-line {
  display: block;
  overflow: hidden;
}

.cb-headline-inner {
  display: block;
}

.cb-description {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: 360px;
  margin-bottom: var(--space-12);
}


/* ═══════ CTA BUTTON ═══════ */
.cb-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: 14px 28px;
  background: var(--color-text);
  color: var(--color-text-invert);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border: none;
  position: relative;
  overflow: hidden;
  transition:
    background 0.3s var(--ease-out),
    color 0.3s var(--ease-out);
}

/* Clip-path hover wipe effect */
.cb-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-accent);
  transform: translateX(-101%);
  transition: transform 0.45s var(--ease-out);
  border-radius: inherit;
}

.cb-cta:hover::before {
  transform: translateX(0);
}

.cb-cta:hover {
  color: var(--color-canvas);
}

.cb-cta-label {
  position: relative;
  z-index: 1;
}

.cb-cta-arrow {
  position: relative;
  z-index: 1;
  transition: transform 0.3s var(--ease-out);
  flex-shrink: 0;
}

.cb-cta:hover .cb-cta-arrow {
  transform: translateX(4px);
}

.cb-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}


/* ═══════ META ROW ═══════ */
.cb-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-8);
  padding: 0 var(--space-section-x);
  height: 52px;
  border-top: 1px solid var(--color-line);
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  color: var(--color-text-subtle);
  text-transform: uppercase;
  text-align: right;
  position: relative;
  z-index: var(--z-raised);
}

.cb-meta-item {
  white-space: nowrap;
}

.cb-meta-sep {
  width: 1px;
  height: 14px;
  background: var(--color-line-strong);
  flex-shrink: 0;
}


/* ═══════ RESPONSIVE ═══════ */

/* Tablet */
@media (max-width: 1279px) {
  .cb-main {
    grid-template-columns: 56% 44%;
  }

  .cb-nav-links {
    gap: var(--space-6);
  }
}

/* Mobile */
@media (max-width: 767px) {
  .s-cb {
    height: auto;
    min-height: 100svh;
    grid-template-rows: auto auto 1fr auto;
  }

  .cb-nav-links {
    display: none;
  }

  .cb-nav-cta {
    font-size: var(--text-label);
    padding: 8px 16px;
  }

  .cb-main {
    grid-template-columns: 1fr;
    grid-template-rows: 40vh 1fr;
  }

  .cb-right {
    order: -1;
  }

  .cb-left {
    padding: var(--space-8) var(--space-section-x) var(--space-8);
    justify-content: flex-start;
  }

  .cb-divider {
    display: none;
  }

  .cb-headline {
    font-size: clamp(40px, 10vw, 72px);
  }

  .cb-description {
    max-width: 100%;
  }

  .cb-circle {
    width: 70%;
  }

  .cb-circle-sm {
    width: 35%;
    top: 10%;
    right: -5%;
  }

  .cb-cross-h,
  .cb-cross-v {
    display: none;
  }

  .cb-meta {
    gap: var(--space-4);
    padding: 0 var(--space-section-x);
    height: 44px;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
