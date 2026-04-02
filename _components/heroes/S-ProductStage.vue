<script setup>
/**
 * S-ProductStage  |  Single Product on a Centered Stage
 * ─────────────────────────────────────────────────────
 * A cinematic product launch hero. ONE product sits dead center
 * on a softly lit circular "stage" — a radial spotlight glow on
 * a dark canvas. Type flanks left, specs flank right, price/CTA
 * sits below. Think Apple product launch meets Awwwards winner.
 *
 * Layers (bottom to top):
 *   0. .s-ps::before   — large ambient radial glow (warm accent)
 *   1. .ps-stage-glow  — tighter spotlight radial behind product
 *   2. .ps-product     — centered product image with float + 3D scroll
 *   3. .ps-product-reflection — flipped, blurred mirror beneath product
 *   4. .ps-left / .ps-right  — flanking text panels
 *   5. .ps-nav         — minimal transparent nav (z-nav)
 *   6. .s-ps::after    — grain overlay (z-overlay)
 *
 * Signature: The product "floats" via a yoyo sine oscillation (6s period)
 * and rotates in 3D (rotateY up to 8deg) on scroll via ScrollTrigger
 * scrub — as if the user is walking around the product. The stage glow
 * "breathes" with a subtle scale/opacity pulse.
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

defineOptions({ name: 'SProductStage' })

const props = defineProps({
  eyebrow:            { type: String, default: 'Introducing' },
  productName:        { type: String, default: 'Studio Pro' },
  tagline:            { type: String, default: 'Built for\ncreators.' },
  description:        { type: String, default: 'The most powerful creative tool we\'ve ever made. Designed from the ground up for ambitious digital work.' },
  price:              { type: String, default: 'From $299' },
  ctaLabel:           { type: String, default: 'Order now' },
  ctaHref:            { type: String, default: '#order' },
  ctaSecondary:       { type: String, default: 'Learn more' },
  ctaSecondaryHref:   { type: String, default: '#learn' },
  productImage:       { type: String, required: true },
  productAlt:         { type: String, default: 'Product image' },
  features: {
    type: Array,
    default: () => [
      { label: 'Performance', value: '2\u00d7 faster' },
      { label: 'Battery',     value: '18h life' },
      { label: 'Display',     value: 'ProMotion' },
      { label: 'Memory',      value: '32GB RAM' },
    ],
  },
  logoText:           { type: String, default: 'Studio.' },
  navLinks: {
    type: Array,
    default: () => [
      { label: 'Features', href: '#features' },
      { label: 'Specs',    href: '#specs' },
      { label: 'Reviews',  href: '#reviews' },
      { label: 'Buy',      href: '#buy' },
    ],
  },
  navCtaLabel:        { type: String, default: 'Buy now' },
  navCtaHref:         { type: String, default: '#buy' },
  navLogoHref:        { type: String, default: '/' },
})

const headlineLines = computed(() => props.tagline.split('\n'))

const sectionRef = ref(null)
const ctaPrimaryRef = ref(null)
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
    const { isDesktop, reduceMotion } = context.conditions
    if (reduceMotion) return

    // ── Element references ──────────────────────────────────
    const nav = el.querySelector('.ps-nav')
    const logo = el.querySelector('.ps-logo')
    const navLinks = el.querySelectorAll('.ps-nav-link')
    const navCta = el.querySelector('.ps-nav-cta')
    const stageGlow = el.querySelector('.ps-stage-glow')
    const product = el.querySelector('.ps-product')
    const reflection = el.querySelector('.ps-product-reflection')
    const eyebrow = el.querySelector('.ps-eyebrow')
    const headlineInners = el.querySelectorAll('.ps-headline-inner')
    const desc = el.querySelector('.ps-description')
    const features = el.querySelectorAll('.ps-feature')
    const featuresLabel = el.querySelector('.ps-features-label')
    const ctaStrip = el.querySelector('.ps-cta-strip')
    const meta = el.querySelector('.ps-meta')
    const stage = el.querySelector('.ps-stage')

    // ── Initial hidden states ───────────────────────────────
    gsap.set(nav, { autoAlpha: 0, y: -12 })
    gsap.set([logo, ...navLinks, navCta], { autoAlpha: 0 })
    gsap.set(product, { autoAlpha: 0, y: 40, scale: 0.9 })
    gsap.set(stageGlow, { autoAlpha: 0, scale: 0.6 })
    gsap.set(eyebrow, { autoAlpha: 0, x: 20 })
    gsap.set(headlineInners, { yPercent: 108 })
    gsap.set(desc, { autoAlpha: 0, x: 20 })
    if (featuresLabel) gsap.set(featuresLabel, { autoAlpha: 0, x: -20 })
    gsap.set(features, { autoAlpha: 0, x: -20 })
    gsap.set(ctaStrip, { autoAlpha: 0, y: 12 })
    gsap.set(meta, { autoAlpha: 0 })
    gsap.set(reflection, { autoAlpha: 0 })

    // ── Main entrance timeline ──────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl
      // t=0: Nav fades in
      .to(nav, { autoAlpha: 1, y: 0, duration: 0.7 }, 0)
      .to([logo, ...navLinks, navCta], {
        autoAlpha: 1,
        stagger: 0.05,
        duration: 0.5,
      }, 0.1)

      // t=0.2: Stage glow expands (slower, dramatic)
      .to(stageGlow, {
        autoAlpha: 1,
        scale: 1,
        duration: 1.4,
        ease: 'power2.out',
      }, 0.2)

      // t=0.4: Product rises in (most dramatic entrance)
      .to(product, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: 'power4.out',
      }, 0.4)

      // t=0.9: Reflection fades in (subtle)
      .to(reflection, {
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power2.out',
      }, 0.9)

      // t=0.6: Left panel — eyebrow
      .to(eyebrow, {
        autoAlpha: 1,
        x: 0,
        duration: 0.6,
      }, 0.6)

      // t=0.7: Headline lines mask-reveal with stagger
      .to(headlineInners, {
        yPercent: 0,
        stagger: 0.1,
        duration: 0.9,
        ease: 'power4.out',
      }, 0.7)

      // t=1.1: Description
      .to(desc, {
        autoAlpha: 1,
        x: 0,
        duration: 0.7,
      }, 1.1)

      // t=0.65: Features label
      .to(featuresLabel, {
        autoAlpha: 1,
        x: 0,
        duration: 0.5,
      }, 0.65)

      // t=0.7: Right panel — features stagger
      .to(features, {
        autoAlpha: 1,
        x: 0,
        stagger: 0.07,
        duration: 0.6,
      }, 0.7)

      // t=1.1: CTA strip
      .to(ctaStrip, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
      }, 1.1)

      // t=1.3: Meta strip
      .to(meta, {
        autoAlpha: 1,
        duration: 0.5,
        ease: 'power2.out',
      }, 1.3)

    // ── Floating product animation (SIGNATURE) ──────────────
    gsap.to(product, {
      yPercent: -2,
      duration: 3,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    // ── Stage glow breathing pulse ──────────────────────────
    gsap.to(stageGlow, {
      scale: 1.08,
      autoAlpha: 0.7,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    // ── Scroll: 3D rotation (SIGNATURE) ─────────────────────
    ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress
        gsap.set(stage, {
          rotateY: p * 8,
          transformOrigin: 'center center',
        })
        gsap.set(product, {
          y: p * -20,
        })
      },
    })

    // ── Magnetic CTA (gsap.quickTo) ─────────────────────────
    const ctaEl = ctaPrimaryRef.value
    if (ctaEl && isDesktop) {
      const xTo = gsap.quickTo(ctaEl, 'x', { duration: 0.6, ease: 'power3.out' })
      const yTo = gsap.quickTo(ctaEl, 'y', { duration: 0.6, ease: 'power3.out' })

      const handleMove = (e) => {
        const r = ctaEl.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.35)
        yTo((e.clientY - r.top - r.height / 2) * 0.35)
      }
      const handleLeave = () => {
        xTo(0)
        yTo(0)
      }

      ctaEl.addEventListener('mousemove', handleMove)
      ctaEl.addEventListener('mouseleave', handleLeave)

      // Cleanup is handled by matchMedia revert
      return () => {
        ctaEl.removeEventListener('mousemove', handleMove)
        ctaEl.removeEventListener('mouseleave', handleLeave)
      }
    }
  }, el) // 3rd arg = scope
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section
    ref="sectionRef"
    class="s-ps"
    role="banner"
    aria-label="Product hero"
  >
    <!-- ─── Navigation ───────────────────────────────────── -->
    <nav class="ps-nav" aria-label="Main navigation">
      <a :href="navLogoHref" class="ps-logo" :aria-label="`${logoText} home`">
        {{ logoText }}
      </a>
      <ul class="ps-nav-links">
        <li v-for="link in navLinks" :key="link.label">
          <a :href="link.href" class="ps-nav-link">{{ link.label }}</a>
        </li>
      </ul>
      <a :href="navCtaHref" class="ps-nav-cta">{{ navCtaLabel }}</a>
    </nav>

    <!-- ─── Main 3-column layout ─────────────────────────── -->
    <div class="ps-main">
      <!-- LEFT: headline + description -->
      <div class="ps-left">
        <span class="ps-eyebrow">{{ eyebrow }}</span>
        <h1 class="ps-headline" :aria-label="tagline.replace('\\n', ' ')">
          <span
            v-for="(line, i) in headlineLines"
            :key="i"
            class="ps-headline-line"
          >
            <span class="ps-headline-inner">{{ line }}</span>
          </span>
        </h1>
        <p class="ps-description">{{ description }}</p>
      </div>

      <!-- CENTER: stage -->
      <div class="ps-stage">
        <div class="ps-stage-glow" aria-hidden="true"></div>
        <img
          :src="productImage"
          :alt="productAlt"
          class="ps-product"
          width="480"
          height="480"
        />
        <img
          :src="productImage"
          alt=""
          class="ps-product-reflection"
          aria-hidden="true"
          width="480"
          height="480"
        />
      </div>

      <!-- RIGHT: specs -->
      <div class="ps-right">
        <p class="ps-features-label">Key features</p>
        <div
          v-for="feat in features"
          :key="feat.label"
          class="ps-feature"
        >
          <span class="ps-feature-label">{{ feat.label }}</span>
          <span class="ps-feature-value">{{ feat.value }}</span>
        </div>
      </div>
    </div>

    <!-- ─── CTA strip ────────────────────────────────────── -->
    <div class="ps-cta-strip">
      <span class="ps-price">{{ price }}</span>
      <a
        ref="ctaPrimaryRef"
        :href="ctaHref"
        class="ps-cta-primary"
        data-magnetic
      >
        {{ ctaLabel }}
      </a>
      <a :href="ctaSecondaryHref" class="ps-cta-secondary">
        {{ ctaSecondary }}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 7h12M7 1l6 6-6 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </a>
    </div>

    <!-- ─── Meta strip ───────────────────────────────────── -->
    <div class="ps-meta" aria-label="Product metadata">
      <span>{{ logoText }}</span>
      <span class="ps-meta-sep" aria-hidden="true"></span>
      <span>Professional</span>
      <span class="ps-meta-sep" aria-hidden="true"></span>
      <span>2024</span>
    </div>
  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════════════
   S-ProductStage — Cinematic Product Launch Hero
   ═══════════════════════════════════════════════ */

.s-ps {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  min-height: 640px;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  background: var(--color-canvas);
  color: var(--color-text);
  overflow: hidden;
  perspective: 1200px;
}

/* ─── Atmospheric pseudo: ambient glow ──────────── */
.s-ps::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  width: 60vw;
  height: 60vw;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(196, 132, 62, 0.08) 0%,
    transparent 65%
  );
  pointer-events: none;
  z-index: var(--z-base);
}

/* ─── Grain overlay ─────────────────────────────── */
.s-ps::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: ps-grain 0.5s steps(6) infinite;
}

@keyframes ps-grain {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(-5%, -5%); }
  50%      { transform: translate(5%, 0); }
  75%      { transform: translate(0, 5%); }
}

/* ─── Navigation ────────────────────────────────── */
.ps-nav {
  position: relative;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-section-x);
  height: 72px;
}

.ps-logo {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  transition: opacity 0.3s var(--ease-out);
}
.ps-logo:hover { opacity: 0.7; }
.ps-logo:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.ps-nav-links {
  display: flex;
  gap: var(--space-8);
  list-style: none;
  padding: 0;
  margin: 0;
}

.ps-nav-link {
  font-family: var(--font-body);
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.3s var(--ease-out);
  position: relative;
}
.ps-nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.3s var(--ease-out);
}
.ps-nav-link:hover { color: var(--color-text); }
.ps-nav-link:hover::after { transform: scaleX(1); }
.ps-nav-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.ps-nav-cta {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  padding: 10px 20px;
  background: var(--color-accent);
  color: var(--color-canvas);
  border-radius: var(--radius-pill);
  text-decoration: none;
  transition:
    background 0.3s var(--ease-out),
    transform 0.3s var(--ease-spring);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.ps-nav-cta:hover {
  background: var(--color-text);
  color: var(--color-text-invert);
  transform: translateY(-1px);
}
.ps-nav-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

/* ─── Main 3-column stage ───────────────────────── */
.ps-main {
  display: grid;
  grid-template-columns: 1fr clamp(280px, 36vw, 560px) 1fr;
  align-items: center;
  gap: 0;
  position: relative;
  z-index: var(--z-raised);
  padding: var(--space-8) 0;
}

/* ─── LEFT: headline panel ──────────────────────── */
.ps-left {
  padding: 0 var(--space-12) 0 var(--space-section-x);
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-8);
}

.ps-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-accent);
}

.ps-headline {
  font-family: var(--font-serif);
  font-size: var(--text-hero);
  font-weight: 300;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  white-space: pre-line;
  text-align: right;
}

.ps-headline-line {
  display: block;
  overflow: hidden;
  clip-path: inset(0 0 -10% 0);
}

.ps-headline-inner {
  display: block;
}

.ps-description {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: 280px;
  text-align: right;
}

/* ─── CENTER: the stage ─────────────────────────── */
.ps-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: var(--z-raised);
}

.ps-stage-glow {
  position: absolute;
  width: 120%;
  height: 120%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    ellipse at center,
    rgba(196, 132, 62, 0.18) 0%,
    rgba(196, 132, 62, 0.06) 35%,
    transparent 70%
  );
  filter: blur(20px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.ps-product {
  position: relative;
  z-index: 1;
  max-width: 100%;
  max-height: clamp(280px, 40vh, 480px);
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.35))
          drop-shadow(0 60px 100px rgba(0, 0, 0, 0.25));
}

.ps-product-reflection {
  position: absolute;
  bottom: -15%;
  left: 50%;
  transform: translateX(-50%) scaleY(-1);
  max-width: 80%;
  max-height: 30%;
  object-fit: contain;
  opacity: 0.15;
  filter: blur(4px);
  mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  pointer-events: none;
  z-index: 0;
}

/* ─── RIGHT: specs panel ────────────────────────── */
.ps-right {
  padding: 0 var(--space-section-x) 0 var(--space-12);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.ps-features-label {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-subtle);
  margin-bottom: var(--space-3);
}

.ps-feature {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-line);
  transition: border-color 0.3s var(--ease-out);
}
.ps-feature:last-child { border-bottom: none; }
.ps-feature:hover {
  border-color: var(--color-accent-muted);
}

.ps-feature-label {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-subtle);
  transition: color 0.3s var(--ease-out);
}

.ps-feature-value {
  font-family: var(--font-display);
  font-size: var(--text-title);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  transition: color 0.3s var(--ease-out);
}

.ps-feature:hover .ps-feature-label {
  color: var(--color-accent-muted);
}
.ps-feature:hover .ps-feature-value {
  color: var(--color-accent);
}

/* ─── CTA strip ─────────────────────────────────── */
.ps-cta-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-6);
  padding: var(--space-6) var(--space-section-x);
  border-top: 1px solid var(--color-line);
  position: relative;
  z-index: var(--z-raised);
}

.ps-price {
  font-family: var(--font-display);
  font-size: var(--text-heading);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  margin-right: var(--space-8);
}

.ps-cta-primary {
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
  transition:
    background 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out);
}
.ps-cta-primary:hover {
  background: var(--color-text);
  box-shadow:
    0 4px 16px rgba(196, 132, 62, 0.25),
    0 12px 40px rgba(196, 132, 62, 0.15);
}
.ps-cta-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.ps-cta-secondary {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 44px;
  padding: 0 var(--space-2);
  transition: color 0.3s var(--ease-out);
  position: relative;
}
.ps-cta-secondary::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: var(--space-2);
  right: var(--space-2);
  height: 1px;
  background: var(--color-text);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.3s var(--ease-out);
}
.ps-cta-secondary:hover { color: var(--color-text); }
.ps-cta-secondary:hover::after { transform: scaleX(1); }
.ps-cta-secondary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}
.ps-cta-secondary svg {
  transition: transform 0.3s var(--ease-out);
}
.ps-cta-secondary:hover svg {
  transform: translateX(3px);
}

/* ─── Meta strip ────────────────────────────────── */
.ps-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
  padding: 0 var(--space-section-x);
  height: 44px;
  border-top: 1px solid var(--color-line);
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.ps-meta-sep {
  width: 1px;
  height: 12px;
  background: var(--color-line-strong);
}

/* ═══════════════════════════════════════════════
   RESPONSIVE: tablet (768px)
   ═══════════════════════════════════════════════ */
@media (max-width: 1279px) {
  .ps-main {
    grid-template-columns: 1fr clamp(240px, 40vw, 400px) 1fr;
    padding: var(--space-4) 0;
  }

  .ps-left {
    padding: 0 var(--space-6) 0 var(--space-section-x);
    gap: var(--space-6);
  }

  .ps-right {
    padding: 0 var(--space-section-x) 0 var(--space-6);
  }

  .ps-price {
    margin-right: var(--space-4);
  }
}

/* ═══════════════════════════════════════════════
   RESPONSIVE: mobile (767px and below)
   ═══════════════════════════════════════════════ */
@media (max-width: 767px) {
  .s-ps {
    height: auto;
    min-height: 100svh;
    grid-template-rows: auto auto auto auto;
  }

  .ps-nav-links {
    display: none;
  }

  .ps-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    text-align: center;
    padding: var(--space-6) var(--space-section-x) var(--space-8);
    gap: var(--space-8);
  }

  /* On mobile: stage first, then left text, then right specs */
  .ps-stage { order: 0; }
  .ps-left  { order: 1; }
  .ps-right { order: 2; }

  .ps-left {
    text-align: center;
    align-items: center;
    padding: 0;
    gap: var(--space-6);
  }

  .ps-headline {
    text-align: center;
  }

  .ps-description {
    text-align: center;
    margin: 0 auto;
  }

  .ps-right {
    align-items: center;
    padding: 0;
  }

  .ps-feature {
    align-items: center;
    text-align: center;
  }

  .ps-product {
    max-height: 240px;
  }

  .ps-cta-strip {
    flex-wrap: wrap;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-section-x);
  }

  .ps-price {
    width: 100%;
    text-align: center;
    margin-right: 0;
    margin-bottom: var(--space-2);
    font-size: var(--text-title);
  }

  .ps-meta {
    gap: var(--space-4);
  }
}
</style>
