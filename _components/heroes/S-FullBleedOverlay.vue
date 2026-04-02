<script setup>
/**
 * S-FullBleedOverlay  |  Full-Viewport Editorial Image Hero
 * ──────────────────────────────────────────────────────────
 * A single editorial image bleeds to all four edges of the
 * viewport. All content floats over it in transparent layers.
 * Feels like an editorial magazine spread — atmospheric,
 * cinematic, authoritative.
 *
 * Layers (bottom to top):
 *   1. .fbo-bg       — full-bleed image (parallax y -8%)
 *   2. .fbo-overlay  — split gradient overlay (bottom-left dark → top-right clear)
 *   3. .fbo-grain    — noise texture at 3% opacity
 *   4. .fbo-nav      — navigation (absolute top)
 *   5. .fbo-content  — hero content (absolute bottom-left)
 *   6. .fbo-aside    — vertical sidebar label (absolute right)
 *
 * Signature: The split gradient overlay creates darkness precisely
 * where the text sits (bottom-left) while letting the image breathe
 * at the top-right — not a uniform dark rectangle.
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

defineOptions({ name: 'SFullBleedOverlay' })

const props = defineProps({
  eyebrow:      { type: String, default: 'EST. 2019 \u2014 DIGITAL STUDIO' },
  headline:     { type: String, default: 'Where vision\nmeets\nprecision.' },
  description:  { type: String, default: 'Strategy-led design and engineering for ambitious digital products that define categories.' },
  ctaLabel:     { type: String, default: 'Explore our work' },
  ctaHref:      { type: String, default: '#work' },
  imageSrc:     { type: String, required: true },
  imageAlt:     { type: String, default: 'Hero editorial image' },
  stat:         { type: String, default: '48+ projects delivered' },
})

const emit = defineEmits(['cta-click'])
const sectionRef = ref(null)
const ctaBtnRef = ref(null)
let mm = null

onMounted(() => {
  const el = sectionRef.value
  if (!el) return

  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 768px)',
    isMobile: '(max-width: 767px)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  }, (context) => {
    const { isDesktop, reduceMotion } = context.conditions
    if (reduceMotion) return

    // ── Initial hidden states ─────────────────────────────────
    const bgImage = el.querySelector('.fbo-bg-image')
    const overlay = el.querySelector('.fbo-overlay')
    const eyebrowEl = el.querySelector('.fbo-eyebrow')
    const headingLines = el.querySelectorAll('.fbo-heading-line')
    const rule = el.querySelector('.fbo-rule')
    const desc = el.querySelector('.fbo-desc')
    const ctaEl = el.querySelector('.fbo-cta')
    const aside = el.querySelector('.fbo-aside')
    const statEl = el.querySelector('.fbo-stat')

    gsap.set(bgImage, { scale: 1.06 })
    gsap.set(overlay, { autoAlpha: 0 })
    gsap.set(eyebrowEl, { autoAlpha: 0, y: 14 })
    gsap.set(headingLines, { yPercent: 110 })
    gsap.set(rule, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(desc, { autoAlpha: 0, y: 18 })
    gsap.set(ctaEl, { autoAlpha: 0, y: 12 })
    gsap.set(aside, { autoAlpha: 0 })
    if (statEl) gsap.set(statEl, { autoAlpha: 0, y: 10 })

    // ── Main entrance timeline ────────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl
      // t=0: Image scale 1.06 -> 1 (slowest, most cinematic)
      .to(bgImage, {
        scale: 1,
        duration: 2.2,
        ease: 'power2.out',
      }, 0)

      // t=0.1: Overlay fades in
      .to(overlay, {
        autoAlpha: 1,
        duration: 1.4,
        ease: 'power2.inOut',
      }, 0.1)

      // t=0.6: Eyebrow slides up
      .to(eyebrowEl, {
        autoAlpha: 1, y: 0,
        duration: 0.9,
        ease: 'power3.out',
      }, 0.6)

      // t=0.7: Heading reveals from mask (most dramatic)
      .to(headingLines, {
        yPercent: 0,
        duration: 1.6,
        ease: 'power4.out',
        stagger: 0.09,
      }, 0.7)

      // t=1.1: Rule scales in from left
      .to(rule, {
        scaleX: 1,
        duration: 0.6,
        ease: 'power3.inOut',
      }, 1.1)

      // t=1.2: Description + CTA fade up with stagger
      .to(desc, {
        autoAlpha: 1, y: 0,
        duration: 0.9,
        ease: 'power3.out',
      }, 1.2)
      .to(ctaEl, {
        autoAlpha: 1, y: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, 1.35)

      // t=1.35: Aside text fade in
      .to(aside, {
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power2.out',
      }, 1.35)

    // Stat (if exists)
    if (statEl) {
      tl.to(statEl, {
        autoAlpha: 1, y: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, 1.5)
    }

    // ── Scroll parallax: image y -8% ──────────────────────────
    if (isDesktop) {
      gsap.to(bgImage, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      })

      // Subtle overlay intensity shift on scroll
      gsap.to(overlay, {
        opacity: 0.85,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      })
    }

    // ── Magnetic CTA button effect ────────────────────────────
    if (isDesktop && ctaBtnRef.value) {
      const btn = ctaBtnRef.value
      const strength = 0.3

      const onMove = (e) => {
        const rect = btn.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) * strength
        const y = (e.clientY - rect.top - rect.height / 2) * strength
        gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out' })
      }
      const onLeave = () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
      }

      btn.addEventListener('mousemove', onMove)
      btn.addEventListener('mouseleave', onLeave)

      return () => {
        btn.removeEventListener('mousemove', onMove)
        btn.removeEventListener('mouseleave', onLeave)
      }
    }
  }, sectionRef.value)
})

onBeforeUnmount(() => mm?.revert())

/** Split headline by newlines for masked line reveals */
const headlineLines = props.headline.split('\n')
</script>

<template>
  <section ref="sectionRef" class="s-fbo" aria-label="Hero">

    <!-- Layer 1: Full-bleed background image -->
    <div class="fbo-bg" aria-hidden="true">
      <img
        :src="imageSrc"
        :alt="imageAlt"
        class="fbo-bg-image"
        width="1920"
        height="1080"
        loading="eager"
        draggable="false"
      />
    </div>

    <!-- Layer 2: Split gradient overlay -->
    <div class="fbo-overlay" aria-hidden="true"></div>

    <!-- Layer 3: Grain texture -->
    <div class="fbo-grain" aria-hidden="true"></div>

    <!-- Layer 4: Navigation -->
    <nav class="fbo-nav" aria-label="Primary navigation">
      <a :href="navLogoHref" class="fbo-logo">{{ logoText }}</a>
      <ul class="fbo-nav-links" role="list">
        <li v-for="link in navLinks" :key="link.href">
          <a :href="link.href" class="fbo-nav-link">{{ link.label }}</a>
        </li>
      </ul>
      <a :href="navCtaHref" class="fbo-nav-cta">{{ navCtaLabel }}</a>
    </nav>

    <!-- Layer 5: Hero content (bottom-left) -->
    <div class="fbo-content">
      <p class="fbo-eyebrow">{{ eyebrow }}</p>

      <h1 class="fbo-heading">
        <span
          v-for="(line, i) in headlineLines"
          :key="i"
          class="fbo-heading-mask"
        >
          <span class="fbo-heading-line">{{ line }}</span>
        </span>
      </h1>

      <div class="fbo-rule" aria-hidden="true"></div>

      <div class="fbo-meta">
        <p class="fbo-desc">{{ description }}</p>
        <a
          ref="ctaBtnRef"
          :href="ctaHref"
          class="fbo-cta"
          data-magnetic
          @click.prevent="emit('cta-click', ctaHref)"
        >
          <span class="fbo-cta-label">{{ ctaLabel }}</span>
          <span class="fbo-cta-arrow" aria-hidden="true">&#8599;</span>
        </a>
      </div>

      <p v-if="stat" class="fbo-stat">{{ stat }}</p>
    </div>

    <!-- Layer 6: Vertical aside label (right edge) -->
    <div class="fbo-aside" aria-hidden="true">
      <span class="fbo-aside-text">FEATURED WORK / 2026</span>
    </div>

    <!-- Scroll indicator -->
    <div class="fbo-scroll-hint" aria-hidden="true">
      <span class="fbo-scroll-line"></span>
    </div>

  </section>
</template>

<style scoped>
/* ──────────────────────────────────────────────
   S-FullBleedOverlay  |  Full-Viewport Editorial Hero
   Single editorial image bleeds to all edges.
   Content floats over in transparent layers.
────────────────────────────────────────────── */

.s-fbo {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  background: var(--color-canvas);
  color: var(--color-text);
}


/* ── Layer 1: Background Image ─────────────── */

.fbo-bg {
  position: absolute;
  inset: 0;
  z-index: var(--z-base, 0);
  overflow: hidden;
}

.fbo-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transform-origin: center center;
  /* Prevent white flash — fill before load */
  background: var(--color-canvas);
}


/* ── Layer 2: Split Gradient Overlay ───────── */
/* NOT a uniform dark rectangle. Darkness at bottom-left
   where text sits, fading to the image at top-right. */

.fbo-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(to top,
      rgba(13, 11, 9, 0.92) 0%,
      rgba(13, 11, 9, 0.6) 40%,
      rgba(13, 11, 9, 0.1) 100%
    ),
    linear-gradient(100deg,
      rgba(13, 11, 9, 0.65) 0%,
      transparent 55%
    );
}

/* Atmospheric vignette pseudo-element */
.fbo-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 70% 20%,
    transparent 40%,
    rgba(13, 11, 9, 0.35) 100%
  );
  pointer-events: none;
}


/* ── Layer 3: Grain Texture ────────────────── */

.fbo-grain {
  position: absolute;
  inset: 0;
  z-index: var(--z-raised, 10);
  background-image: url('/noise.png');
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  animation: fbo-grain 0.5s steps(6) infinite;
}

@keyframes fbo-grain {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(-5%, -5%); }
  50%      { transform: translate(5%, 0); }
  75%      { transform: translate(0, 5%); }
}


/* ── Layer 4: Navigation ───────────────────── */

.fbo-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-nav, 900);
  display: flex;
  align-items: center;
  height: var(--nav-height-full, 80px);
  padding: 0 clamp(24px, 4vw, 56px);
  gap: var(--space-6, 24px);
}

/* Subtle bottom border for nav separation */
.fbo-nav::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: clamp(24px, 4vw, 56px);
  right: clamp(24px, 4vw, 56px);
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

.fbo-logo {
  flex-shrink: 0;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text);
  text-decoration: none;
  transition: opacity var(--duration-fast) var(--ease-out);
  line-height: 1;
}
.fbo-logo:hover         { opacity: 0.6; }
.fbo-logo:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }

.fbo-nav-links {
  display: flex;
  gap: clamp(20px, 2.5vw, 36px);
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  justify-content: center;
}

.fbo-nav-link {
  position: relative;
  font-family: var(--font-body);
  font-size: var(--text-label, 11px);
  font-weight: 500;
  letter-spacing: var(--tracking-wide, 0.1em);
  text-transform: uppercase;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: var(--space-2, 8px) 0;
  transition: color var(--duration-fast) var(--ease-out);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.fbo-nav-link:hover         { color: var(--color-text); }
.fbo-nav-link:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }

/* Underline reveal on hover */
.fbo-nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.3s var(--ease-out);
}
.fbo-nav-link:hover::after { transform: scaleX(1); }

.fbo-nav-cta {
  flex-shrink: 0;
  font-family: var(--font-body);
  font-size: var(--text-label, 11px);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text);
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-pill, 9999px);
  padding: var(--space-2, 8px) var(--space-6, 24px);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
}
.fbo-nav-cta:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-subtle);
}
.fbo-nav-cta:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }


/* ── Layer 5: Hero Content ─────────────────── */

.fbo-content {
  position: absolute;
  bottom: 10%;
  left: 6vw;
  z-index: 5;
  max-width: clamp(480px, 55vw, 780px);
}


/* Eyebrow */

.fbo-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-label-sm, 10px);
  font-weight: 500;
  letter-spacing: var(--tracking-wider, 0.2em);
  text-transform: uppercase;
  color: var(--color-accent);
  margin: 0 0 var(--space-6, 24px);
  line-height: var(--leading-none, 1);
}


/* Heading with masked line reveals */

.fbo-heading {
  font-family: var(--font-serif, Georgia, serif);
  font-size: clamp(48px, 7vw, 110px);
  font-weight: 300;
  line-height: var(--leading-tight, 1.06);
  letter-spacing: var(--tracking-tight, -0.04em);
  color: var(--color-text);
  margin: 0 0 var(--space-8, 32px);
  display: flex;
  flex-direction: column;
}

.fbo-heading-mask {
  overflow: hidden;
  display: block;
  padding-bottom: 0.06em;
}

.fbo-heading-line {
  display: block;
}


/* Amber rule */

.fbo-rule {
  width: 80px;
  height: 2px;
  background: var(--color-accent);
  margin-bottom: var(--space-8, 32px);
  border-radius: var(--radius-pill, 9999px);
}


/* Meta: description + CTA side by side */

.fbo-meta {
  display: flex;
  align-items: flex-start;
  gap: clamp(24px, 3vw, 48px);
  margin-bottom: var(--space-6, 24px);
}

.fbo-desc {
  font-family: var(--font-body);
  font-size: var(--text-body-sm, 13px);
  line-height: var(--leading-relaxed, 1.7);
  color: var(--color-text-muted);
  margin: 0;
  max-width: 340px;
}

.fbo-cta {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2, 8px);
  height: 48px;
  padding: 0 var(--space-6, 24px);
  font-family: var(--font-body);
  font-size: var(--text-label, 11px);
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-canvas);
  background: var(--color-text);
  text-decoration: none;
  border-radius: var(--radius-pill, 9999px);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s var(--ease-out);
  will-change: auto;
}

/* Background slide hover effect */
.fbo-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-accent);
  transform: translateX(-101%);
  transition: transform 0.4s var(--ease-out);
  border-radius: inherit;
}
.fbo-cta:hover::before { transform: translateX(0); }
.fbo-cta:hover { color: var(--color-text); }
.fbo-cta:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }

.fbo-cta-label,
.fbo-cta-arrow {
  position: relative;
  z-index: 1;
}

.fbo-cta-arrow {
  font-size: 14px;
  transition: transform 0.3s var(--ease-out);
}
.fbo-cta:hover .fbo-cta-arrow {
  transform: translate(2px, -2px);
}


/* Stat pill */

.fbo-stat {
  font-family: var(--font-mono);
  font-size: var(--text-label-sm, 10px);
  font-weight: 500;
  letter-spacing: var(--tracking-wide, 0.1em);
  text-transform: uppercase;
  color: var(--color-text-subtle);
  margin: 0;
  line-height: var(--leading-none, 1);
}


/* ── Layer 6: Vertical Aside ───────────────── */

.fbo-aside {
  position: absolute;
  right: 3vw;
  bottom: 12%;
  z-index: 5;
}

.fbo-aside-text {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: var(--tracking-widest, 0.3em);
  text-transform: uppercase;
  color: var(--color-text-subtle);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  line-height: var(--leading-none, 1);
}


/* ── Scroll indicator ──────────────────────── */

.fbo-scroll-hint {
  position: absolute;
  bottom: var(--space-6, 24px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
}

.fbo-scroll-line {
  display: block;
  width: 1px;
  height: 40px;
  background: linear-gradient(
    to bottom,
    var(--color-accent) 0%,
    transparent 100%
  );
  animation: fbo-scroll-pulse 2s var(--ease-out) infinite;
}

@keyframes fbo-scroll-pulse {
  0%   { opacity: 1; transform: scaleY(1); transform-origin: top; }
  50%  { opacity: 0.4; transform: scaleY(0.5); transform-origin: top; }
  100% { opacity: 1; transform: scaleY(1); transform-origin: top; }
}


/* ── Responsive: Mobile ────────────────────── */

@media (max-width: 767px) {
  .s-fbo {
    height: auto;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
  }

  .fbo-bg {
    position: relative;
    height: 45vh;
    flex-shrink: 0;
  }

  .fbo-overlay {
    background:
      linear-gradient(to top,
        rgba(13, 11, 9, 0.95) 0%,
        rgba(13, 11, 9, 0.7) 50%,
        rgba(13, 11, 9, 0.2) 100%
      );
  }

  .fbo-nav {
    padding: 0 var(--space-4, 16px);
    height: 56px;
  }
  .fbo-nav::after {
    left: var(--space-4, 16px);
    right: var(--space-4, 16px);
  }

  .fbo-nav-links { display: none; }

  .fbo-content {
    position: relative;
    bottom: auto;
    left: auto;
    padding: var(--space-8, 32px) var(--space-6, 24px) var(--space-12, 48px);
    max-width: none;
    z-index: 5;
  }

  .fbo-heading {
    font-size: clamp(36px, 10vw, 56px);
    margin-bottom: var(--space-6, 24px);
  }

  .fbo-meta {
    flex-direction: column;
    gap: var(--space-6, 24px);
  }

  .fbo-desc {
    max-width: none;
  }

  .fbo-aside { display: none; }

  .fbo-scroll-hint { display: none; }
}


/* ── Responsive: Tablet ────────────────────── */

@media (min-width: 768px) and (max-width: 1279px) {
  .fbo-content {
    bottom: 8%;
    left: 5vw;
    max-width: 60vw;
  }

  .fbo-heading {
    font-size: clamp(44px, 6vw, 80px);
  }

  .fbo-aside {
    right: 2.5vw;
    bottom: 10%;
  }
}


/* ── Responsive: Large Desktop ─────────────── */

@media (min-width: 1440px) {
  .fbo-content {
    left: clamp(80px, 6vw, 120px);
    max-width: 820px;
  }
}
</style>
