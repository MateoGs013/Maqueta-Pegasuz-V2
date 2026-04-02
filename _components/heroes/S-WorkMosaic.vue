<script setup>
/**
 * S-WorkMosaic  |  Portfolio Work Mosaic Hero
 * ─────────────────────────────────────────────────
 * The hero IS the portfolio. A mosaic grid of project
 * thumbnails fills 70% of the viewport, studio identity
 * overlaid at the top. "Work speaks for itself."
 *
 * Signature: Cards rise from below with organic stagger --
 * each card has a randomized starting Y offset and slight
 * initial rotation (-2 to +2 deg) that snaps to 0, creating
 * a scattered-to-ordered "rising cards" entrance that feels
 * handmade, not mechanical.
 *
 * Layout:
 *   - Nav: top bar, z-index 900
 *   - Header (30%): left-aligned headline + right-aligned tagline/CTA
 *   - Mosaic (70%): 3-col asymmetric grid, cards span 1-2 rows
 *   - Atmosphere: top accent glow + grain overlay
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SWorkMosaic' })

const props = defineProps({
  headline:    { type: String, default: 'Work that\nmoves people.' },
  tagline:     { type: String, default: 'Digital products for ambitious brands.' },
  ctaLabel:    { type: String, default: 'View all projects' },
  ctaHref:     { type: String, default: '#work' },
  projects: {
    type: Array,
    default: () => [
      { title: 'Brand Redesign',     category: 'Brand \u00b7 Strategy',    image: '', color: '#1a1612' },
      { title: 'E-commerce Platform', category: 'Design \u00b7 Engineering', image: '', color: '#0f1418' },
      { title: 'Mobile App',          category: 'Product \u00b7 Mobile',    image: '', color: '#12100e' },
      { title: 'Campaign Site',        category: 'Creative \u00b7 Web',      image: '', color: '#111419' },
      { title: 'Dashboard UI',         category: 'UI \u00b7 SaaS',           image: '', color: '#0e1212' },
      { title: 'Visual Identity',      category: 'Brand \u00b7 Print',       image: '', color: '#13100f' },
    ],
  },
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

const emit = defineEmits(['card-click', 'cta-click'])
const sectionRef = ref(null)
let mm = null

/* ── Headline lines for masked reveal ── */
const headlineLines = props.headline.split('\n')

onMounted(() => {
  const el = sectionRef.value
  if (!el) return

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {

    /* ── Initial states ──────────────────── */
    gsap.set(el.querySelector('.wm-nav'), { autoAlpha: 0, y: -14 })
    gsap.set(el.querySelectorAll('.wm-nav-link, .wm-logo, .wm-nav-cta'), { autoAlpha: 0 })
    gsap.set(el.querySelectorAll('.wm-headline-inner'), { yPercent: 108 })
    gsap.set(el.querySelector('.wm-tagline'), { autoAlpha: 0, y: 12 })
    gsap.set(el.querySelector('.wm-cta'), { autoAlpha: 0, y: 10 })
    gsap.set(el.querySelector('.wm-header-rule'), { scaleX: 0 })

    /* Cards: randomized Y + rotation for organic entrance */
    const cards = el.querySelectorAll('.wm-card')
    const rotations = []
    cards.forEach((card, i) => {
      const rot = (Math.random() - 0.5) * 4 // -2 to +2 deg
      rotations.push(rot)
      gsap.set(card, {
        autoAlpha: 0,
        y: 70 + Math.random() * 50,   // 70-120 range, varied per card
        rotation: rot,
        transformOrigin: 'center center',
      })
    })

    /* ── Master entrance timeline ──────── */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl
      /* Nav fades in from top */
      .to(el.querySelector('.wm-nav'), {
        autoAlpha: 1, y: 0, duration: 0.7
      }, 0)
      .to(el.querySelectorAll('.wm-logo, .wm-nav-link, .wm-nav-cta'), {
        autoAlpha: 1, stagger: 0.06, duration: 0.5
      }, 0.12)

      /* Headline masked reveal */
      .to(el.querySelectorAll('.wm-headline-inner'), {
        yPercent: 0,
        stagger: 0.12,
        duration: 0.95,
        ease: 'power4.out',
      }, 0.2)

      /* Rule line draws in */
      .to(el.querySelector('.wm-header-rule'), {
        scaleX: 1,
        duration: 1.1,
        ease: 'power3.inOut',
      }, 0.35)

      /* Tagline + CTA */
      .to(el.querySelector('.wm-tagline'), {
        autoAlpha: 1, y: 0, duration: 0.7
      }, 0.55)
      .to(el.querySelector('.wm-cta'), {
        autoAlpha: 1, y: 0, duration: 0.65,
        ease: 'back.out(1.4)',
      }, 0.65)

      /* Cards rise with organic stagger */
      .to(cards, {
        autoAlpha: 1,
        y: 0,
        rotation: 0,
        stagger: {
          amount: 0.7,
          from: 'random',
          ease: 'power2.out',
        },
        duration: 0.95,
        ease: 'power3.out',
      }, 0.4)

    /* ── Scroll: mosaic parallax ───────── */
    ScrollTrigger.create({
      trigger: el.querySelector('.wm-mosaic'),
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.5,
      onUpdate: (self) => {
        gsap.set(el.querySelector('.wm-mosaic'), {
          y: self.progress * -40,
        })
      },
    })

    /* ── Scroll: header parallax (slower) ── */
    ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      onUpdate: (self) => {
        gsap.set(el.querySelector('.wm-header'), {
          y: self.progress * 30,
          autoAlpha: 1 - self.progress * 0.6,
        })
      },
    })

    /* ── Magnetic CTA ─────────────────── */
    const ctaEl = el.querySelector('.wm-cta')
    if (ctaEl) {
      const xTo = gsap.quickTo(ctaEl, 'x', { duration: 0.6, ease: 'power3.out' })
      const yTo = gsap.quickTo(ctaEl, 'y', { duration: 0.6, ease: 'power3.out' })

      const onMove = (e) => {
        const r = ctaEl.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.35)
        yTo((e.clientY - r.top - r.height / 2) * 0.35)
      }
      const onLeave = () => { xTo(0); yTo(0) }

      ctaEl.addEventListener('mousemove', onMove)
      ctaEl.addEventListener('mouseleave', onLeave)

      /* Cleanup is handled by matchMedia revert */
      return () => {
        ctaEl.removeEventListener('mousemove', onMove)
        ctaEl.removeEventListener('mouseleave', onLeave)
      }
    }
  }, el) /* scope */
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section ref="sectionRef" class="s-wm" aria-label="Portfolio work mosaic">

    <!-- ── Atmosphere: accent glow ── -->
    <div class="wm-glow" aria-hidden="true" />

    <!-- ── Nav ── -->
    <nav class="wm-nav" aria-label="Primary navigation">
      <a
        :href="navLogoHref"
        class="wm-logo"
      >{{ logoText }}</a>

      <ul class="wm-nav-links" role="list">
        <li v-for="link in navLinks" :key="link.label">
          <a :href="link.href" class="wm-nav-link">{{ link.label }}</a>
        </li>
      </ul>

      <a :href="navCtaHref" class="wm-nav-cta">{{ navCtaLabel }}</a>
    </nav>

    <!-- ── Header: identity + CTA ── -->
    <header class="wm-header">
      <div class="wm-header-left">
        <h1 class="wm-headline">
          <span
            v-for="(line, i) in headlineLines"
            :key="i"
            class="wm-headline-line"
          ><span class="wm-headline-inner">{{ line }}</span></span>
        </h1>
      </div>

      <div class="wm-header-right">
        <p class="wm-tagline">{{ tagline }}</p>
        <a
          :href="ctaHref"
          class="wm-cta"
          data-magnetic
          @click.prevent="emit('cta-click')"
        >
          <span class="wm-cta-label">{{ ctaLabel }}</span>
          <svg class="wm-cta-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>

      <!-- Rule line that draws in -->
      <div class="wm-header-rule" aria-hidden="true" />
    </header>

    <!-- ── Mosaic grid ── -->
    <div class="wm-mosaic" role="list" aria-label="Featured projects">
      <article
        v-for="(project, idx) in projects"
        :key="idx"
        class="wm-card"
        :class="[`wm-card--${idx + 1}`]"
        role="listitem"
        tabindex="0"
        @click="emit('card-click', project)"
        @keydown.enter="emit('card-click', project)"
      >
        <!-- BG: image or color fallback -->
        <div
          v-if="project.image"
          class="wm-card-bg"
          :style="{ backgroundImage: `url(${project.image})` }"
        />
        <div
          v-else
          class="wm-card-bg wm-card-bg--no-image"
          :style="{ backgroundColor: project.color }"
        />

        <!-- Overlay -->
        <div class="wm-card-overlay">
          <span class="wm-card-cat">{{ project.category }}</span>
          <h3 class="wm-card-title">{{ project.title }}</h3>
        </div>

        <!-- Arrow indicator on hover -->
        <div class="wm-card-arrow" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 10L10 4M10 4H5M10 4v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>

        <!-- Index badge (top-left) -->
        <span class="wm-card-index" aria-hidden="true">{{ String(idx + 1).padStart(2, '0') }}</span>
      </article>
    </div>

    <!-- ── Bottom ambient line ── -->
    <div class="wm-bottom-line" aria-hidden="true" />

  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════════════
   S-WORK-MOSAIC  —  Portfolio Mosaic Hero
   ═══════════════════════════════════════════════ */

.s-wm {
  position: relative;
  width: 100%;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  background: var(--color-canvas);
  color: var(--color-text);
  overflow: hidden;
}

/* ── Atmosphere: accent glow (top, bleeds past container) ── */
.wm-glow {
  position: absolute;
  top: -10%;
  left: -5%;
  width: 110%;
  height: 55%;
  background: radial-gradient(
    ellipse at 30% 20%,
    var(--color-accent-subtle) 0%,
    transparent 60%
  );
  pointer-events: none;
  z-index: var(--z-base);
}

/* ── Grain overlay (::after) ── */
.s-wm::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: wm-grain 0.5s steps(6) infinite;
}
@keyframes wm-grain {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5%, -5%); }
  50% { transform: translate(5%, 0); }
  75% { transform: translate(0, 5%); }
}

/* ── Bottom ambient line (::before pseudo) ── */
.s-wm::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--space-section-x);
  right: var(--space-section-x);
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-line-strong) 20%,
    var(--color-accent-muted) 50%,
    var(--color-line-strong) 80%,
    transparent 100%
  );
  pointer-events: none;
  z-index: var(--z-raised);
}

/* ═══════════════
   NAV
   ═══════════════ */

.wm-nav {
  position: relative;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-section-x);
  height: 72px;
  flex-shrink: 0;
}

.wm-logo {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  letter-spacing: var(--tracking-tight);
  transition: opacity 0.3s var(--ease-out);
}
.wm-logo:hover { opacity: 0.7; }
.wm-logo:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.wm-nav-links {
  display: flex;
  gap: var(--space-8);
  list-style: none;
  padding: 0;
  margin: 0;
}

.wm-nav-link {
  font-family: var(--font-body);
  font-size: var(--nav-link-size);
  letter-spacing: var(--nav-link-tracking);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.3s var(--ease-out);
  position: relative;
}
.wm-nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.35s var(--ease-out);
}
.wm-nav-link:hover { color: var(--color-text); }
.wm-nav-link:hover::after { transform: scaleX(1); }
.wm-nav-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.wm-nav-cta {
  font-family: var(--font-body);
  font-size: var(--nav-link-size);
  font-weight: 500;
  padding: 10px 20px;
  background: var(--color-text);
  color: var(--color-text-invert);
  border-radius: var(--radius-pill);
  text-decoration: none;
  transition:
    background 0.3s var(--ease-out),
    transform 0.3s var(--ease-out);
}
.wm-nav-cta:hover {
  background: var(--color-accent);
  transform: translateY(-1px);
}
.wm-nav-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

/* ═══════════════
   HEADER
   ═══════════════ */

.wm-header {
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-8);
  padding: var(--space-8) var(--space-section-x) var(--space-12);
  flex-shrink: 0;
}

.wm-header-left {
  flex: 1.6;
  min-width: 0;
}

.wm-headline {
  font-family: var(--font-serif);
  font-size: var(--text-display);
  font-weight: 300;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  white-space: pre-line;
  margin: 0;
}

.wm-headline-line {
  display: block;
  overflow: hidden;
  /* clip mask for reveal */
}

.wm-headline-inner {
  display: block;
}

.wm-header-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-6);
  min-width: 200px;
}

.wm-tagline {
  font-family: var(--font-body);
  font-size: var(--text-body);
  color: var(--color-text-muted);
  text-align: right;
  max-width: 260px;
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* Rule line between header and mosaic — breaks container with negative margin */
.wm-header-rule {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-line) 10%,
    var(--color-accent-muted) 40%,
    var(--color-line) 70%,
    transparent 100%
  );
  transform-origin: left center;
}

/* ═══════════════
   CTA (magnetic)
   ═══════════════ */

.wm-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: 14px 28px;
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.35s var(--ease-out),
    border-color 0.35s var(--ease-out),
    box-shadow 0.35s var(--ease-out);
}
.wm-cta:hover {
  background: var(--color-surface-mid);
  border-color: var(--color-text-muted);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.25),
    0 0 40px var(--color-accent-subtle);
}
.wm-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.wm-cta-label {
  letter-spacing: 0.02em;
}

.wm-cta-arrow {
  transition: transform 0.35s var(--ease-out);
}
.wm-cta:hover .wm-cta-arrow {
  transform: translateX(4px);
}

/* ═══════════════
   MOSAIC GRID
   ═══════════════ */

.wm-mosaic {
  flex: 1;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.2fr;
  grid-auto-rows: minmax(160px, 1fr);
  gap: var(--space-gap-sm);
  padding: var(--space-6) var(--space-section-x) var(--space-12);
  min-height: 0;
}

/* Asymmetric: cards 1 and 4 span 2 rows */
.wm-card--1 { grid-row: span 2; }
.wm-card--4 { grid-row: span 2; }

/* ═══════════════
   CARD
   ═══════════════ */

.wm-card {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition:
    box-shadow 0.45s var(--ease-out),
    transform 0.45s var(--ease-out);
  outline: none;
}
.wm-card:hover {
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.35),
    0 4px 12px rgba(0, 0, 0, 0.2);
  transform: scale(1.018) rotate(0deg);
}
.wm-card:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

/* ── Card BG ── */
.wm-card-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.7s var(--ease-out);
}
.wm-card:hover .wm-card-bg {
  transform: scale(1.06);
}

/* Color fallback: dot-grid pattern */
.wm-card-bg--no-image {
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* ── Card overlay ── */
.wm-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 10, 9, 0.82) 0%,
    rgba(10, 10, 9, 0.25) 45%,
    transparent 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-6);
  transition:
    background 0.45s var(--ease-out),
    clip-path 0.5s var(--ease-out);
  clip-path: inset(30% 0 0 0);
}
.wm-card:hover .wm-card-overlay {
  clip-path: inset(0 0 0 0);
  background: linear-gradient(
    to top,
    rgba(10, 10, 9, 0.92) 0%,
    rgba(10, 10, 9, 0.55) 55%,
    rgba(10, 10, 9, 0.15) 100%
  );
}

/* ── Card title ── */
.wm-card-title {
  font-family: var(--font-display);
  font-size: var(--text-body);
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--color-text);
  margin: 0;
  transform: translateY(4px);
  transition: transform 0.4s var(--ease-out);
}
.wm-card:hover .wm-card-title {
  transform: translateY(0);
}

/* ── Card category ── */
.wm-card-cat {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: var(--space-1);
  transform: translateY(6px);
  opacity: 0.75;
  transition:
    transform 0.4s var(--ease-out) 0.04s,
    opacity 0.4s var(--ease-out);
}
.wm-card:hover .wm-card-cat {
  transform: translateY(0);
  opacity: 1;
}

/* ── Arrow badge (top-right, appears on hover) ── */
.wm-card-arrow {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-accent);
  color: var(--color-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.6) rotate(-45deg);
  transition:
    opacity 0.35s var(--ease-out),
    transform 0.4s var(--ease-spring);
  z-index: 2;
}
.wm-card:hover .wm-card-arrow {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

/* ── Index badge (top-left) ── */
.wm-card-index {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-label-sm);
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-subtle);
  z-index: 2;
  pointer-events: none;
}

/* ── Bottom ambient line ── */
.wm-bottom-line {
  position: absolute;
  bottom: var(--space-12);
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - var(--space-section-x) * 3);
  height: 1px;
  background: var(--color-line);
  pointer-events: none;
  z-index: var(--z-raised);
  opacity: 0.5;
}


/* ═══════════════════════════════════════
   RESPONSIVE — TABLET (768px)
   ═══════════════════════════════════════ */

@media (max-width: 768px) {
  .wm-header {
    flex-direction: column;
    align-items: flex-start;
    padding-bottom: var(--space-8);
  }

  .wm-header-right {
    align-items: flex-start;
  }

  .wm-tagline {
    text-align: left;
  }

  .wm-mosaic {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 200px;
  }

  .wm-card--1,
  .wm-card--4 {
    grid-row: span 1;
  }

  .wm-nav-links {
    display: none; /* hide on small screens, hamburger would go here */
  }

  .wm-headline {
    font-size: clamp(36px, 8vw, 56px);
  }
}


/* ═══════════════════════════════════════
   RESPONSIVE — MOBILE (480px)
   ═══════════════════════════════════════ */

@media (max-width: 480px) {
  .wm-mosaic {
    grid-template-columns: 1fr;
    grid-auto-rows: 220px;
  }

  .wm-header {
    padding-top: var(--space-6);
    padding-bottom: var(--space-6);
  }

  .wm-headline {
    font-size: clamp(32px, 9vw, 48px);
  }

  .wm-nav-cta {
    font-size: var(--text-label);
    padding: 8px 16px;
  }
}
</style>
