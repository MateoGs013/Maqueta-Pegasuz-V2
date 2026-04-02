<script setup>
/**
 * S-CinematicCurtain  |  Theatrical Curtain Reveal Hero
 * ─────────────────────────────────────────────────────
 * A hero that opens like a theatre curtain -- two dark panels
 * slide apart left and right, revealing a full-bleed image or
 * gradient scene behind. Content is revealed as the curtains open.
 *
 * Layers (bottom to top):
 *   1. .cc-scene        -- full-bleed hero image + dark overlay
 *   2. .cc-content      -- centered headline + description + CTA
 *   3. .cc-curtain-left -- left curtain panel (fabric texture)
 *   4. .cc-curtain-right-- right curtain panel (fabric texture)
 *   5. .cc-gap-line     -- accent center line between curtains
 *   6. .cc-nav          -- transparent navigation
 *   7. .cc-meta         -- bottom metadata strip
 *   8. ::after          -- grain overlay
 *
 * Signature: Curtains overshoot their open position with
 * elastic.out(1, 0.5) easing, giving them physical mass --
 * they swing past -100%/+100% then spring back.
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

defineOptions({ name: 'SCinematicCurtain' })

const props = defineProps({
  eyebrow:     { type: String, default: 'Now Presenting' },
  headline:    { type: String, default: 'The art of\nbold thinking.' },
  description: { type: String, default: 'A creative studio that transforms ambitious ideas into extraordinary digital experiences.' },
  ctaLabel:    { type: String, default: 'Enter' },
  ctaHref:     { type: String, default: '#enter' },
  imageSrc:    { type: String, required: true },
  imageAlt:    { type: String, default: 'Hero background' },
  metaLeft:    { type: String, default: 'Est. 2019' },
  metaCenter:  { type: String, default: 'Digital Studio' },
  metaRight:   { type: String, default: 'Buenos Aires' },
  logoText:    { type: String, default: 'Studio.' },
  navLinks: {
    type: Array,
    default: () => [
      { label: 'Work',     href: '#work' },
      { label: 'About',    href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Contact',  href: '#contact' },
    ],
  },
  navCtaLabel: { type: String, default: 'Start a project' },
  navCtaHref:  { type: String, default: '#contact' },
  navLogoHref: { type: String, default: '/' },
})

const emit = defineEmits(['cta-click'])

const sectionRef = ref(null)
const ctaBtnRef = ref(null)
let mm = null

const headlineLines = computed(() => props.headline.split('\n'))

onMounted(() => {
  const el = sectionRef.value
  if (!el) return

  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 768px)',
    isMobile: '(max-width: 767px)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  }, (context) => {
    const { reduceMotion } = context.conditions
    if (reduceMotion) return

    // ── Element references ──────────────────────────
    const nav = el.querySelector('.cc-nav')
    const logo = el.querySelector('.cc-logo')
    const navLinks = el.querySelectorAll('.cc-nav-link')
    const navCta = el.querySelector('.cc-nav-cta')
    const curtainLeft = el.querySelector('.cc-curtain-left')
    const curtainRight = el.querySelector('.cc-curtain-right')
    const gapLine = el.querySelector('.cc-gap-line')
    const eyebrowEl = el.querySelector('.cc-eyebrow')
    const headlineInners = el.querySelectorAll('.cc-headline-inner')
    const descEl = el.querySelector('.cc-description')
    const ctaEl = el.querySelector('.cc-cta')
    const metaEl = el.querySelector('.cc-meta')
    const contentEl = el.querySelector('.cc-content')
    const imageEl = el.querySelector('.cc-image')
    const sceneOverlay = el.querySelector('.cc-scene-overlay')
    const diamondEl = el.querySelector('.cc-diamond')

    // ── Initial states ──────────────────────────────
    gsap.set(nav, { autoAlpha: 0, y: -16 })
    gsap.set([logo, ...navLinks, navCta], { autoAlpha: 0 })
    gsap.set(gapLine, { scaleY: 0 })
    gsap.set(eyebrowEl, { autoAlpha: 0, y: 10 })
    gsap.set(headlineInners, { yPercent: 110 })
    gsap.set(descEl, { autoAlpha: 0, y: 14 })
    gsap.set(ctaEl, { autoAlpha: 0, y: 10, scale: 0.95 })
    gsap.set(metaEl, { autoAlpha: 0 })
    gsap.set(sceneOverlay, { autoAlpha: 0.85 })
    gsap.set(diamondEl, { autoAlpha: 0, scale: 0.6, rotation: 45 })

    // ── The Curtain Sequence ────────────────────────
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
    })

    tl
      // 1. Nav slides in from above
      .to(nav, {
        autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out',
      }, 0.3)
      .to(logo, {
        autoAlpha: 1, duration: 0.5, ease: 'power3.out',
      }, 0.4)
      .to(navLinks, {
        autoAlpha: 1, stagger: 0.06, duration: 0.4, ease: 'power3.out',
      }, 0.45)
      .to(navCta, {
        autoAlpha: 1, duration: 0.5, ease: 'power3.out',
      }, 0.55)

      // 2. Gap line appears (the seam between curtains)
      .to(gapLine, {
        scaleY: 1, duration: 0.5, ease: 'power2.out',
      }, 0.5)

      // 3. CURTAINS OPEN -- elastic overshoot is THE SIGNATURE
      .to(curtainLeft, {
        xPercent: -100,
        duration: 1.8,
        ease: 'elastic.out(1, 0.5)',
      }, 0.7)
      .to(curtainRight, {
        xPercent: 100,
        duration: 1.8,
        ease: 'elastic.out(1, 0.5)',
      }, 0.7)

      // 4. Scene overlay lightens as curtains open (reveals image brightness)
      .to(sceneOverlay, {
        autoAlpha: 0.5,
        duration: 1.2,
        ease: 'power2.inOut',
      }, 0.8)

      // 5. Gap line fades out as curtains clear center
      .to(gapLine, {
        autoAlpha: 0, duration: 0.35, ease: 'power2.out',
      }, 0.9)

      // 6. Diamond accent appears behind content
      .to(diamondEl, {
        autoAlpha: 0.4, scale: 1, rotation: 45,
        duration: 1.4, ease: 'power2.out',
      }, 1.0)

      // 7. Content reveals -- staggered cascade
      .to(eyebrowEl, {
        autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out',
      }, 1.1)
      .to(headlineInners, {
        yPercent: 0, stagger: 0.14, duration: 1.1, ease: 'power4.out',
      }, 1.2)
      .to(descEl, {
        autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out',
      }, 1.6)
      .to(ctaEl, {
        autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.6)',
      }, 1.8)

      // 8. Meta strip fades in last
      .to(metaEl, {
        autoAlpha: 1, duration: 0.5, ease: 'power2.out',
      }, 2.0)

      // 9. Enable pointer events on content
      .call(() => {
        if (contentEl) contentEl.style.pointerEvents = 'auto'
      }, null, 2.2)

    // ── Image scale parallax on scroll ──────────────
    gsap.to(imageEl, {
      scale: 1.0,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // ── Overlay darken on scroll ────────────────────
    gsap.to(sceneOverlay, {
      autoAlpha: 0.8,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // ── Diamond slow rotation on scroll ───────────────
    gsap.to(diamondEl, {
      rotation: 90,
      scale: 1.15,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // ── Magnetic CTA ────────────────────────────────
    const ctaTarget = ctaBtnRef.value
    if (ctaTarget) {
      const xTo = gsap.quickTo(ctaTarget, 'x', { duration: 0.6, ease: 'power3.out' })
      const yTo = gsap.quickTo(ctaTarget, 'y', { duration: 0.6, ease: 'power3.out' })

      const onMove = (e) => {
        const r = ctaTarget.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.4)
        yTo((e.clientY - r.top - r.height / 2) * 0.4)
      }
      const onLeave = () => { xTo(0); yTo(0) }

      ctaTarget.addEventListener('mousemove', onMove)
      ctaTarget.addEventListener('mouseleave', onLeave)

      // Cleanup is handled by matchMedia revert
      return () => {
        ctaTarget.removeEventListener('mousemove', onMove)
        ctaTarget.removeEventListener('mouseleave', onLeave)
      }
    }
  }, sectionRef.value)
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section
    ref="sectionRef"
    class="s-cc"
    aria-label="Hero: Cinematic curtain reveal"
  >
    <!-- LAYER 1: Background scene (image + overlay) -->
    <div class="cc-scene">
      <img
        class="cc-image"
        :src="imageSrc"
        :alt="imageAlt"
        width="1920"
        height="1080"
        loading="eager"
      />
      <div class="cc-scene-overlay"></div>
      <!-- Atmospheric radial glow behind content -->
      <div class="cc-scene-glow"></div>
    </div>

    <!-- Decorative diamond accent behind content -->
    <div class="cc-diamond" aria-hidden="true"></div>

    <!-- LAYER 2: Content (behind curtains z-index wise, revealed after open) -->
    <div class="cc-content">
      <span class="cc-eyebrow">{{ eyebrow }}</span>

      <h1 class="cc-headline">
        <span
          v-for="(line, i) in headlineLines"
          :key="i"
          class="cc-headline-line"
        ><span class="cc-headline-inner">{{ line }}</span></span>
      </h1>

      <p class="cc-description">{{ description }}</p>

      <a
        ref="ctaBtnRef"
        :href="ctaHref"
        class="cc-cta"
        data-magnetic
        @click.prevent="emit('cta-click')"
      >
        <span class="cc-cta-label">{{ ctaLabel }}</span>
        <svg
          class="cc-cta-arrow"
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

    <!-- LAYER 3: Curtain panels -->
    <div class="cc-curtain-left" aria-hidden="true">
      <div class="cc-curtain-fold cc-curtain-fold--right"></div>
    </div>
    <div class="cc-curtain-right" aria-hidden="true">
      <div class="cc-curtain-fold cc-curtain-fold--left"></div>
    </div>

    <!-- LAYER 4: Center gap line -->
    <div class="cc-gap-line" aria-hidden="true"></div>

    <!-- LAYER 5: Navigation -->
    <nav class="cc-nav" aria-label="Main navigation">
      <a
        :href="navLogoHref"
        class="cc-logo"
      >{{ logoText }}</a>

      <ul class="cc-nav-links">
        <li v-for="link in navLinks" :key="link.label">
          <a
            :href="link.href"
            class="cc-nav-link"
          >{{ link.label }}</a>
        </li>
      </ul>

      <a
        :href="navCtaHref"
        class="cc-nav-cta"
      >{{ navCtaLabel }}</a>
    </nav>

    <!-- LAYER 6: Bottom metadata strip -->
    <div class="cc-meta" aria-label="Studio information">
      <span class="cc-meta-item">{{ metaLeft }}</span>
      <span class="cc-meta-item cc-meta-item--center">{{ metaCenter }}</span>
      <span class="cc-meta-item">{{ metaRight }}</span>
    </div>
  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════
   S-CinematicCurtain
   Theatrical curtain reveal hero
   ═══════════════════════════════════════ */

.s-cc {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 600px;
  overflow: hidden;
  background: var(--color-canvas);
  color: var(--color-text);
}

/* ── Grain overlay ───────────────────── */
.s-cc::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: cc-grain 0.5s steps(6) infinite;
}

@keyframes cc-grain {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(-5%, -5%); }
  50%      { transform: translate(5%, 0); }
  75%      { transform: translate(0, 5%); }
}


/* ═══════════════════════════════════════
   BACKGROUND SCENE
   ═══════════════════════════════════════ */

.cc-scene {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
}

.cc-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.05);
}

.cc-scene-overlay {
  position: absolute;
  inset: 0;
  background: var(--overlay-mid);
  z-index: 1;
}

/* Atmospheric radial glow -- subtle light behind content center */
.cc-scene-glow {
  position: absolute;
  top: 35%;
  left: 50%;
  width: 80vw;
  height: 60vh;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    ellipse at center,
    var(--color-accent-subtle) 0%,
    transparent 70%
  );
  z-index: 2;
  pointer-events: none;
  opacity: 0.5;
  filter: blur(60px);
}


/* ═══════════════════════════════════════
   CURTAIN PANELS
   ═══════════════════════════════════════ */

.cc-curtain-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  z-index: var(--z-raised);
  background-color: var(--color-canvas);
  /* Subtle vertical stripe texture -- fabric weave */
  background-image:
    repeating-linear-gradient(
      to right,
      transparent 0px,
      transparent 3px,
      rgba(255, 255, 255, 0.006) 3px,
      rgba(255, 255, 255, 0.006) 4px
    );
  transform-origin: left center;
}

.cc-curtain-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  z-index: var(--z-raised);
  background-color: var(--color-canvas);
  background-image:
    repeating-linear-gradient(
      to right,
      transparent 0px,
      transparent 3px,
      rgba(255, 255, 255, 0.006) 3px,
      rgba(255, 255, 255, 0.006) 4px
    );
  transform-origin: right center;
}

/* ── Curtain fold -- inner edge shadow for depth ── */
.cc-curtain-fold {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
  pointer-events: none;
}

.cc-curtain-fold--right {
  right: 0;
  background: linear-gradient(
    to left,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.15) 40%,
    transparent 100%
  );
}

.cc-curtain-fold--left {
  left: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.15) 40%,
    transparent 100%
  );
}

/* ── Curtain top drape shadow (pseudo) ── */
.cc-curtain-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.25) 0%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
}

.cc-curtain-right::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.25) 0%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
}


/* ═══════════════════════════════════════
   CENTER GAP LINE
   ═══════════════════════════════════════ */

.cc-gap-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  margin-left: -0.5px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--color-accent) 25%,
    var(--color-accent) 75%,
    transparent 100%
  );
  z-index: calc(var(--z-raised) + 1);
  transform: scaleY(0);
  transform-origin: center;
  pointer-events: none;
}


/* ═══════════════════════════════════════
   DECORATIVE DIAMOND
   ═══════════════════════════════════════ */

.cc-diamond {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(200px, 25vw, 400px);
  height: clamp(200px, 25vw, 400px);
  transform: translate(-50%, -50%) rotate(45deg);
  border: 1px solid var(--color-line);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  z-index: 3;
  pointer-events: none;
  opacity: 0;
}


/* ═══════════════════════════════════════
   CONTENT
   ═══════════════════════════════════════ */

.cc-content {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--space-6);
  padding: var(--space-20) var(--space-section-x) var(--space-16);
  pointer-events: none;
}

.cc-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-accent);
  display: block;
}

.cc-headline {
  font-family: var(--font-serif);
  font-size: var(--text-hero);
  font-weight: 300;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  text-align: center;
  margin: 0;
}

.cc-headline-line {
  display: block;
  overflow: hidden;
  /* Clip mask for the yPercent reveal */
}

.cc-headline-inner {
  display: block;
}

.cc-description {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: 440px;
  text-align: center;
}

/* ── CTA Button ── */
.cc-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: 16px 40px;
  background: transparent;
  color: var(--color-text);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-decoration: none;
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition:
    background 0.4s var(--ease-out),
    border-color 0.4s var(--ease-out),
    box-shadow 0.4s var(--ease-out);
}

/* CTA shimmer sweep on hover */
.cc-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 100%
  );
  transition: left 0.6s var(--ease-out);
  pointer-events: none;
}

.cc-cta:hover::before {
  left: 100%;
}

.cc-cta:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.06);
}

.cc-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.cc-cta-label {
  position: relative;
  z-index: 1;
}

.cc-cta-arrow {
  position: relative;
  z-index: 1;
  transition: transform 0.35s var(--ease-out);
}

.cc-cta:hover .cc-cta-arrow {
  transform: translateX(4px);
}


/* ═══════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════ */

.cc-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-section-x);
  height: 72px;
}

.cc-logo {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  transition: opacity 0.3s var(--ease-out);
}

.cc-logo:hover {
  opacity: 0.7;
}

.cc-logo:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.cc-nav-links {
  display: flex;
  gap: var(--space-8);
  list-style: none;
  padding: 0;
  margin: 0;
}

.cc-nav-link {
  font-family: var(--font-body);
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  text-decoration: none;
  position: relative;
  transition: color 0.3s var(--ease-out);
}

/* Underline hover effect for nav links */
.cc-nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: right center;
  transition: transform 0.4s var(--ease-out);
}

.cc-nav-link:hover {
  color: var(--color-text);
}

.cc-nav-link:hover::after {
  transform: scaleX(1);
  transform-origin: left center;
}

.cc-nav-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.cc-nav-cta {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  padding: 10px 20px;
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-pill);
  text-decoration: none;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition:
    background 0.3s var(--ease-out),
    border-color 0.3s var(--ease-out);
}

.cc-nav-cta:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
}

.cc-nav-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}


/* ═══════════════════════════════════════
   BOTTOM METADATA STRIP
   ═══════════════════════════════════════ */

.cc-meta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-section-x);
  height: 52px;
  border-top: 1px solid var(--color-line);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.cc-meta-item {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.cc-meta-item--center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: var(--color-text-muted);
}


/* ═══════════════════════════════════════
   RESPONSIVE -- MOBILE
   ═══════════════════════════════════════ */

@media (max-width: 767px) {
  .cc-nav {
    height: 60px;
  }

  .cc-nav-links {
    display: none;
  }

  .cc-nav-cta {
    font-size: 12px;
    padding: 8px 16px;
  }

  .cc-content {
    padding: var(--space-16) var(--space-6) var(--space-12);
    gap: var(--space-4);
  }

  .cc-headline {
    font-size: clamp(48px, 12vw, 80px);
  }

  .cc-description {
    max-width: 90%;
    font-size: 14px;
  }

  .cc-cta {
    padding: 14px 32px;
  }

  .cc-meta {
    height: 44px;
  }

  .cc-meta-item--center {
    display: none;
  }

  .cc-scene-glow {
    width: 100vw;
    height: 50vh;
    top: 40%;
  }
}

/* ═══════════════════════════════════════
   RESPONSIVE -- TABLET
   ═══════════════════════════════════════ */

@media (min-width: 768px) and (max-width: 1279px) {
  .cc-headline {
    font-size: clamp(56px, 9vw, 120px);
  }

  .cc-nav-links {
    gap: var(--space-6);
  }
}
</style>
