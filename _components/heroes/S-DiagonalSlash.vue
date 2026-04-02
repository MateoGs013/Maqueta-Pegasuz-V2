<script setup>
/**
 * S-DiagonalSlash  |  Diagonal Split Hero
 * ─────────────────────────────────────────
 * The viewport is cut diagonally — a bold diagonal line
 * divides the hero into two distinct zones.
 * Left: dark canvas with typography (52%)
 * Right: editorial photo cropped by diagonal clip-path (48%)
 * The slash IS the signature — on scroll the diagonal angle shifts.
 *
 * Signature: The clip-path polygon animates on scroll (scrub: 0.5),
 * making the diagonal boundary feel alive and unstable.
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SDiagonalSlash' })

const props = defineProps({
  eyebrow:      { type: String, default: 'Creative Studio \u2014 Est. 2019' },
  headline:     { type: String, default: 'Bold ideas.\nSharp\nexecution.' },
  description:  { type: String, default: 'We design and build digital products that cut through the noise.' },
  ctaLabel:     { type: String, default: 'See our work' },
  ctaHref:      { type: String, default: '#work' },
  imageSrc:     { type: String, required: true },
  imageAlt:     { type: String, default: 'Hero visual' },
  metaYear:     { type: String, default: '2024' },
  metaServices: { type: String, default: 'Design \u00b7 Engineering \u00b7 Strategy' },
  metaLocation: { type: String, default: 'Buenos Aires' },
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

const emit = defineEmits(['cta-click'])

const sectionRef = ref(null)
let mm = null

/* Split headline into lines for staggered reveal */
const headlineLines = props.headline.split('\n')

onMounted(() => {
  const el = sectionRef.value
  if (!el) return

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    /* ── Initial states ──────────────────────────────── */
    gsap.set(el.querySelector('.ds-nav'), { autoAlpha: 0, y: -12 })
    gsap.set(el.querySelectorAll('.ds-nav-link, .ds-logo, .ds-nav-cta'), { autoAlpha: 0 })
    gsap.set(el.querySelector('.ds-right'), { autoAlpha: 0, x: 40 })
    gsap.set(el.querySelector('.ds-slash'), { scaleY: 0, transformOrigin: 'top center' })
    gsap.set(el.querySelector('.ds-eyebrow'), { autoAlpha: 0, y: 8 })
    gsap.set(el.querySelectorAll('.ds-headline-inner'), { yPercent: 108 })
    gsap.set(el.querySelector('.ds-description'), { autoAlpha: 0, y: 12 })
    gsap.set(el.querySelector('.ds-cta'), { autoAlpha: 0, y: 8 })
    gsap.set(el.querySelectorAll('.ds-footer > *'), { autoAlpha: 0 })

    /* ── Entrance timeline ───────────────────────────── */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl
      .to(el.querySelector('.ds-nav'), { autoAlpha: 1, y: 0, duration: 0.7 }, 0)
      .to(el.querySelectorAll('.ds-nav-link, .ds-logo, .ds-nav-cta'),
          { autoAlpha: 1, stagger: 0.05, duration: 0.5 }, 0.1)
      .to(el.querySelector('.ds-right'),
          { autoAlpha: 1, x: 0, duration: 1.0, ease: 'power2.out' }, 0.15)
      .to(el.querySelector('.ds-slash'),
          { scaleY: 1, duration: 1.2, ease: 'power2.inOut' }, 0.25)
      .to(el.querySelector('.ds-eyebrow'),
          { autoAlpha: 1, y: 0, duration: 0.6 }, 0.4)
      .to(el.querySelectorAll('.ds-headline-inner'),
          { yPercent: 0, stagger: 0.1, duration: 0.9, ease: 'power4.out' }, 0.5)
      .to(el.querySelector('.ds-description'),
          { autoAlpha: 1, y: 0, duration: 0.7 }, 0.9)
      .to(el.querySelector('.ds-cta'),
          { autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)' }, 1.0)
      .to(el.querySelectorAll('.ds-footer > *'),
          { autoAlpha: 1, stagger: 0.08, duration: 0.5 }, 1.1)

    /* ── Scroll-linked: diagonal slash shift (SIGNATURE) ── */
    const rightPanel = el.querySelector('.ds-right')
    const slashLine = el.querySelector('.ds-slash')

    ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress
        const startPct = 12
        const endPct = 18
        const currentPct = startPct + (endPct - startPct) * p
        gsap.set(rightPanel, {
          clipPath: `polygon(${currentPct}% 0%, 100% 0%, 100% 100%, 0% 100%)`
        })
        gsap.set(slashLine, {
          x: currentPct * 0.5
        })
      }
    })

    /* ── Image parallax ──────────────────────────────── */
    gsap.to(el.querySelector('.ds-image'), {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      }
    })

    /* ── Magnetic CTA (gsap.quickTo) ─────────────────── */
    const ctaEl = el.querySelector('.ds-cta')
    if (ctaEl) {
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

      /* Cleanup listeners when matchMedia reverts */
      return () => {
        ctaEl.removeEventListener('mousemove', handleMove)
        ctaEl.removeEventListener('mouseleave', handleLeave)
      }
    }
  }, sectionRef.value)
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section ref="sectionRef" class="s-ds" aria-label="Hero: Diagonal slash composition">

    <!-- ═══ GRAIN OVERLAY (::after via CSS) ═══ -->

    <!-- ═══ NAV ═══ -->
    <nav class="ds-nav" aria-label="Primary navigation">
      <a :href="navLogoHref" class="ds-logo">{{ logoText }}</a>

      <ul class="ds-nav-links" role="list">
        <li v-for="link in navLinks" :key="link.label">
          <a :href="link.href" class="ds-nav-link">{{ link.label }}</a>
        </li>
      </ul>

      <a :href="navCtaHref" class="ds-nav-cta">{{ navCtaLabel }}</a>
    </nav>

    <!-- ═══ MAIN SPLIT ═══ -->
    <div class="ds-main">

      <!-- LEFT: text panel -->
      <div class="ds-left">
        <!-- Atmospheric glow (::before via CSS) -->

        <span class="ds-eyebrow">{{ eyebrow }}</span>

        <h1 class="ds-headline">
          <span
            v-for="(line, i) in headlineLines"
            :key="i"
            class="ds-headline-line"
          >
            <span class="ds-headline-inner">{{ line }}</span>
          </span>
        </h1>

        <p class="ds-description">{{ description }}</p>

        <a
          :href="ctaHref"
          class="ds-cta"
          data-magnetic
          @click.prevent="emit('cta-click')"
        >
          {{ ctaLabel }}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>

      <!-- RIGHT: image panel (diagonal clip) -->
      <div class="ds-right">
        <!-- Gradient overlay (::before via CSS) -->
        <img
          :src="imageSrc"
          :alt="imageAlt"
          width="960"
          height="1080"
          loading="eager"
          class="ds-image"
        />
      </div>

      <!-- THE SLASH: accent line along the diagonal -->
      <div class="ds-slash" aria-hidden="true"></div>
    </div>

    <!-- ═══ FOOTER METADATA ═══ -->
    <footer class="ds-footer" aria-label="Project metadata">
      <span class="ds-footer-item">{{ metaYear }}</span>
      <span class="ds-footer-sep" aria-hidden="true"></span>
      <span class="ds-footer-item">{{ metaServices }}</span>
      <span class="ds-footer-sep" aria-hidden="true"></span>
      <span class="ds-footer-item">{{ metaLocation }}</span>
    </footer>

  </section>
</template>

<style scoped>
/* ─────────────────────────────────────────────────────
   S-DiagonalSlash — Diagonal Split Hero
   Tokens only. Zero magic numbers except layout math.
───────────────────────────────────────────────────── */

.s-ds {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  min-height: 600px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--color-canvas);
  color: var(--color-text);
  overflow: hidden;
}

/* ── Grain overlay ── */
.s-ds::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: ds-grain 0.5s steps(6) infinite;
}
@keyframes ds-grain {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(-5%, -5%); }
  50%      { transform: translate(5%, 0); }
  75%      { transform: translate(0, 5%); }
}


/* ═══════════════════════════════════════════
   NAV
═══════════════════════════════════════════ */
.ds-nav {
  position: relative;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-section-x);
  height: 72px;
}

.ds-logo {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  transition: opacity 0.3s var(--ease-out);
}
.ds-logo:hover { opacity: 0.7; }
.ds-logo:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.ds-nav-links {
  display: flex;
  gap: var(--space-8);
  list-style: none;
  padding: 0;
  margin: 0;
}

.ds-nav-link {
  font-family: var(--font-body);
  font-size: 13px;
  letter-spacing: 0.02em;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.3s var(--ease-out);
  position: relative;
  padding: var(--space-2) 0;
}
.ds-nav-link::after {
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
.ds-nav-link:hover { color: var(--color-text); }
.ds-nav-link:hover::after { transform: scaleX(1); }
.ds-nav-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.ds-nav-cta {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  padding: 10px 20px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-pill);
  text-decoration: none;
  transition:
    background 0.3s var(--ease-out),
    border-color 0.3s var(--ease-out);
  cursor: pointer;
}
.ds-nav-cta:hover {
  background: var(--color-surface-high, rgba(255,255,255,0.12));
  border-color: var(--color-text-muted);
}
.ds-nav-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}


/* ═══════════════════════════════════════════
   MAIN SPLIT — 52% / 48% (ratio 1.08:1 in grid,
   but diagonal clip shifts the perceived ratio to ~1.5:1)
═══════════════════════════════════════════ */
.ds-main {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 52% 48%;
}


/* ── LEFT: text panel ── */
.ds-left {
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--space-20) var(--space-section-x) var(--space-16);
  gap: var(--space-8);
}

/* Atmospheric radial glow behind text */
.ds-left::before {
  content: '';
  position: absolute;
  bottom: -10%;
  left: -10%;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-accent-subtle) 0%, transparent 70%);
  filter: blur(40px);
  z-index: 0;
  pointer-events: none;
}


/* ── RIGHT: image panel — diagonal clip ── */
.ds-right {
  position: relative;
  overflow: hidden;
  clip-path: polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%);
}

/* Gradient overlay on image — dark on the left edge */
.ds-right::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(10, 10, 9, 0.5) 0%,
    transparent 35%
  );
  z-index: 1;
  pointer-events: none;
}

.ds-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}


/* ── THE SLASH: accent line along the diagonal ── */
.ds-slash {
  position: absolute;
  left: calc(52% - 2px);
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-accent);
  transform-origin: top center;
  transform: rotate(6deg);
  z-index: var(--z-overlay);
  box-shadow:
    0 0 12px 2px var(--color-accent-muted),
    0 0 40px 4px var(--color-accent-subtle);
  pointer-events: none;
}


/* ═══════════════════════════════════════════
   TYPOGRAPHY
═══════════════════════════════════════════ */

/* Eyebrow — mono, tracked, uppercase */
.ds-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-accent);
  position: relative;
  z-index: var(--z-raised);
}

/* Headline — serif, hero scale */
.ds-headline {
  font-family: var(--font-serif);
  font-size: var(--text-hero);
  font-weight: 300;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  white-space: pre-line;
  position: relative;
  z-index: var(--z-raised);
}

.ds-headline-line {
  display: block;
  overflow: hidden;
}
.ds-headline-inner {
  display: block;
}

/* Description */
.ds-description {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: 380px;
  position: relative;
  z-index: var(--z-raised);
}


/* ═══════════════════════════════════════════
   CTA — Magnetic button with arrow
═══════════════════════════════════════════ */
.ds-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: 14px 28px;
  min-height: 44px;
  background: var(--color-accent);
  color: var(--color-canvas);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition:
    background 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out);
  align-self: flex-start;
  position: relative;
  z-index: var(--z-raised);
}

.ds-cta:hover {
  background: var(--color-text);
  box-shadow:
    0 4px 16px var(--color-accent-muted),
    0 8px 32px var(--color-accent-subtle);
}

.ds-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.ds-cta svg {
  transition: transform 0.3s var(--ease-out);
}
.ds-cta:hover svg {
  transform: translateX(4px);
}


/* ═══════════════════════════════════════════
   FOOTER — metadata strip
═══════════════════════════════════════════ */
.ds-footer {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  padding: 0 var(--space-section-x);
  height: 52px;
  border-top: 1px solid var(--color-line);
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-subtle);
  z-index: var(--z-raised);
}

.ds-footer-sep {
  width: 1px;
  height: 14px;
  background: var(--color-line-strong);
  flex-shrink: 0;
}

.ds-footer-item {
  white-space: nowrap;
}


/* ═══════════════════════════════════════════
   RESPONSIVE — TABLET/MOBILE (max-width: 768px)
═══════════════════════════════════════════ */
@media (max-width: 768px) {
  .ds-main {
    grid-template-columns: 1fr;
    grid-template-rows: 45vh 1fr;
  }

  .ds-right {
    clip-path: polygon(0% 0%, 100% 0%, 100% 88%, 0% 100%);
    grid-row: 1;
  }

  .ds-left {
    grid-row: 2;
    justify-content: flex-start;
    padding-top: var(--space-12);
    padding-bottom: var(--space-8);
  }

  .ds-slash {
    display: none;
  }

  .ds-headline {
    font-size: clamp(42px, 9vw, 72px);
  }

  .ds-nav-links {
    display: none;
  }

  .ds-nav-cta {
    font-size: 12px;
    padding: 8px 16px;
  }

  .ds-footer {
    gap: var(--space-4);
    font-size: var(--text-label-sm);
    height: 44px;
  }
}

/* ═══════════════════════════════════════════
   RESPONSIVE — LARGE DESKTOP (min-width: 1280px)
═══════════════════════════════════════════ */
@media (min-width: 1280px) {
  .ds-left {
    padding-left: clamp(48px, 6vw, 120px);
  }

  .ds-description {
    max-width: 420px;
  }
}
</style>
