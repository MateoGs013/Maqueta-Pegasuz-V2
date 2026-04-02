<script setup>
/**
 * S-FloatingGlassHUD  |  Floating Glass HUD Panels Hero
 * ─────────────────────────────────────────────────────
 * Cinematic hero with glassmorphism panels floating over
 * an atmospheric gradient backdrop — futuristic HUD / premium
 * SaaS dashboard aesthetic. Deep space canvas with nebula-like
 * color blobs that drift continuously behind glass panels.
 *
 * Structure:
 *   Row 1 [auto]  — Transparent nav (logo, links, pill CTA)
 *   Row 2 [1fr]   — 3 floating glass panels (main + stat + features)
 *   Row 3 [auto]  — Thin accent gradient strip
 *
 * Signature: Atmospheric background blobs drift on infinite
 * yoyo cycles (28-40s), making the glass panels' backdrop-filter
 * blur feel alive and breathing.
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SFloatingGlassHUD' })

const props = defineProps({
  eyebrow:      { type: String, default: 'Next Generation Platform' },
  headline:     { type: String, default: 'Design the\nfuture.' },
  description:  { type: String, default: 'A new kind of creative tool. Built for teams that refuse to slow down.' },
  ctaLabel:     { type: String, default: 'Get early access' },
  ctaHref:      { type: String, default: '#access' },
  ctaSecondary: { type: String, default: 'Watch demo' },
  ctaSecondaryHref: { type: String, default: '#demo' },
  statNum:      { type: String, default: '10K+' },
  statLabel:    { type: String, default: 'Teams on waitlist' },
  features:     {
    type: Array,
    default: () => ['AI-powered workflows', 'Real-time collaboration', 'Version history', 'Custom exports'],
  },
})

const sectionRef = ref(null)
const ctaPrimaryRef = ref(null)
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

    // ── Initial states ──────────────────────────
    gsap.set(el.querySelectorAll('.gh-blob'), { autoAlpha: 0 })
    gsap.set(el.querySelector('.gh-panel--main'), { autoAlpha: 0, y: 30, scale: 0.97 })
    gsap.set(el.querySelector('.gh-panel--stat'), { autoAlpha: 0, x: -30, rotation: -4 })
    gsap.set(el.querySelector('.gh-panel--features'), { autoAlpha: 0, x: 30, rotation: 3 })
    gsap.set(el.querySelector('.gh-eyebrow'), { autoAlpha: 0 })
    gsap.set(el.querySelectorAll('.gh-headline-inner'), { yPercent: 108 })
    gsap.set(el.querySelector('.gh-description'), { autoAlpha: 0, y: 12 })
    gsap.set(el.querySelector('.gh-cta-group'), { autoAlpha: 0, y: 8 })
    gsap.set(el.querySelector('.gh-strip'), { scaleX: 0, transformOrigin: 'center' })

    // ── Entry timeline ──────────────────────────
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl
      // Nav fades in from top
      .to(el.querySelector('.gh-nav'), { autoAlpha: 1, y: 0, duration: 0.7 }, 0)
      .to(el.querySelectorAll('.gh-nav-link, .gh-logo, .gh-nav-cta'),
          { autoAlpha: 1, stagger: 0.05, duration: 0.5 }, 0.1)
      // Blobs fade in gently
      .to(el.querySelectorAll('.gh-blob'),
          { autoAlpha: 1, stagger: 0.2, duration: 1.5, ease: 'power2.out' }, 0.1)
      // Main panel rises with scale
      .to(el.querySelector('.gh-panel--main'),
          { autoAlpha: 1, y: 0, scale: 1, duration: 1.0, ease: 'power4.out' }, 0.3)
      // Eyebrow appears
      .to(el.querySelector('.gh-eyebrow'), { autoAlpha: 1, duration: 0.5 }, 0.5)
      // Headline lines reveal from masked overflow
      .to(el.querySelectorAll('.gh-headline-inner'),
          { yPercent: 0, stagger: 0.1, duration: 0.9, ease: 'power4.out' }, 0.6)
      // Description fades up
      .to(el.querySelector('.gh-description'), { autoAlpha: 1, y: 0, duration: 0.7 }, 1.0)
      // CTA group with slight bounce
      .to(el.querySelector('.gh-cta-group'),
          { autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)' }, 1.1)
      // Side panels slide in from their respective sides
      .to(el.querySelector('.gh-panel--stat'),
          { autoAlpha: 1, x: 0, rotation: -2, duration: 0.9, ease: 'power3.out' }, 0.6)
      .to(el.querySelector('.gh-panel--features'),
          { autoAlpha: 1, x: 0, rotation: 1.5, duration: 0.9, ease: 'power3.out' }, 0.7)
      // Bottom strip draws from center
      .to(el.querySelector('.gh-strip'), { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 0.8)

    // ── SIGNATURE: Ambient blob drift ──────────
    // Each blob drifts on its own very slow yoyo loop,
    // creating living atmosphere behind the glass
    gsap.to(el.querySelector('.gh-blob--a'), {
      x: 40, y: -30,
      duration: 28,
      ease: 'sine.inOut',
      yoyo: true, repeat: -1,
    })
    gsap.to(el.querySelector('.gh-blob--b'), {
      x: -50, y: 40,
      duration: 34,
      ease: 'sine.inOut',
      yoyo: true, repeat: -1,
      delay: 5,
    })
    gsap.to(el.querySelector('.gh-blob--c'), {
      x: 30, y: -50,
      duration: 40,
      ease: 'sine.inOut',
      yoyo: true, repeat: -1,
      delay: 10,
    })

    // ── Scroll parallax (blobs at different rates) ──
    gsap.to(el.querySelector('.gh-blob--a'), {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.5 },
    })
    gsap.to(el.querySelector('.gh-blob--b'), {
      yPercent: -5,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.5 },
    })
    gsap.to(el.querySelector('.gh-blob--c'), {
      yPercent: -3,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.5 },
    })
    gsap.to(el.querySelector('.gh-panels'), {
      yPercent: -3,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.5 },
    })

    // ── Magnetic CTA ────────────────────────────
    const ctaEl = ctaPrimaryRef.value
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

      // Cleanup stored on context for revert
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
  <section ref="sectionRef" class="s-gh" aria-label="Hero: Floating Glass HUD">

    <!-- ATMOSPHERE — gradient blobs behind glass -->
    <div class="gh-atmosphere" aria-hidden="true">
      <div class="gh-blob gh-blob--a"></div>
      <div class="gh-blob gh-blob--b"></div>
      <div class="gh-blob gh-blob--c"></div>
    </div>

    <!-- NAV — transparent top bar -->
    <nav class="gh-nav" aria-label="Primary navigation">
      <a :href="navLogoHref" class="gh-logo">{{ logoText }}</a>
      <ul class="gh-nav-links">
        <li v-for="link in navLinks" :key="link.label">
          <a :href="link.href" class="gh-nav-link">{{ link.label }}</a>
        </li>
      </ul>
      <a :href="navCtaHref" class="gh-nav-cta">{{ navCtaLabel }}</a>
    </nav>

    <!-- MAIN — floating panels area -->
    <div class="gh-main">
      <div class="gh-panels">

        <!-- Panel B — stat (left, overlapping) -->
        <div class="gh-panel gh-panel--stat">
          <span class="gh-stat-num">{{ statNum }}</span>
          <span class="gh-stat-label">{{ statLabel }}</span>
          <!-- Decorative ring -->
          <div class="gh-stat-ring" aria-hidden="true"></div>
        </div>

        <!-- Panel A — main content (center) -->
        <div class="gh-panel gh-panel--main">
          <div class="gh-eyebrow">
            {{ eyebrow }}
          </div>
          <h1 class="gh-headline">
            <span
              v-for="(line, i) in headlineLines"
              :key="i"
              class="gh-headline-line"
            >
              <span class="gh-headline-inner">{{ line }}</span>
            </span>
          </h1>
          <p class="gh-description">{{ description }}</p>
          <div class="gh-cta-group">
            <a
              ref="ctaPrimaryRef"
              :href="ctaHref"
              class="gh-cta-primary"
              data-magnetic
            >
              {{ ctaLabel }}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 7h11M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
            <a :href="ctaSecondaryHref" class="gh-cta-secondary">
              {{ ctaSecondary }}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M4 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Panel C — features (right, overlapping) -->
        <div class="gh-panel gh-panel--features">
          <span class="gh-features-label">Capabilities</span>
          <div
            v-for="(feat, i) in features"
            :key="i"
            class="gh-feature"
          >
            {{ feat }}
          </div>
        </div>

      </div>
    </div>

    <!-- Bottom accent strip -->
    <div class="gh-strip" aria-hidden="true"></div>

  </section>
</template>

<style scoped>
/* ────────────────────────────────────────────
   BASE SECTION
──────────────────────────────────────────── */
.s-gh {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 640px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--color-canvas);
  color: var(--color-text);
  overflow: hidden;
}

/* Grain overlay */
.s-gh::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  opacity: 0.025;
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


/* ────────────────────────────────────────────
   ATMOSPHERE — BLOBS
──────────────────────────────────────────── */
.gh-atmosphere {
  position: absolute;
  inset: 0;
  z-index: var(--z-base);
  pointer-events: none;
  overflow: hidden;
}

.gh-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

/* Blob A — warm amber, center-left */
.gh-blob--a {
  width: 55vw;
  height: 55vw;
  background: radial-gradient(circle, rgba(196, 132, 62, 0.18) 0%, transparent 65%);
  top: 10%;
  left: -10%;
}

/* Blob B — deep teal/blue, center-right */
.gh-blob--b {
  width: 45vw;
  height: 45vw;
  background: radial-gradient(circle, rgba(30, 80, 120, 0.22) 0%, transparent 65%);
  top: 20%;
  right: -5%;
}

/* Blob C — deep violet, bottom center */
.gh-blob--c {
  width: 40vw;
  height: 40vw;
  background: radial-gradient(circle, rgba(80, 40, 120, 0.15) 0%, transparent 65%);
  bottom: -10%;
  left: 30%;
}


/* ────────────────────────────────────────────
   NAVIGATION
──────────────────────────────────────────── */
.gh-nav {
  position: relative;
  z-index: var(--z-nav);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-section-x);
  height: 72px;
}

.gh-logo {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  transition: opacity 0.3s var(--ease-out);
}
.gh-logo:hover { opacity: 0.7; }
.gh-logo:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.gh-nav-links {
  display: flex;
  gap: var(--space-8);
  list-style: none;
  padding: 0;
  margin: 0;
}

.gh-nav-link {
  font-family: var(--font-body);
  font-size: var(--nav-link-size);
  letter-spacing: var(--nav-link-tracking);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.3s var(--ease-out);
}
.gh-nav-link:hover { color: var(--color-text); }
.gh-nav-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.gh-nav-cta {
  font-family: var(--font-body);
  font-size: var(--nav-link-size);
  font-weight: 500;
  padding: 10px 20px;
  background: var(--color-surface-mid);
  color: var(--color-text);
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-pill);
  text-decoration: none;
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  transition:
    background 0.3s var(--ease-out),
    border-color 0.3s var(--ease-out);
}
.gh-nav-cta:hover {
  background: var(--color-surface-high);
  border-color: rgba(255, 255, 255, 0.2);
}
.gh-nav-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}


/* ────────────────────────────────────────────
   MAIN AREA & PANELS
──────────────────────────────────────────── */
.gh-main {
  position: relative;
  z-index: var(--z-raised);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-section-x);
}

.gh-panels {
  position: relative;
  width: 100%;
  max-width: 920px;
  display: flex;
  align-items: center;
  justify-content: center;
}


/* ── Panel base glass style ───────────────── */
.gh-panel {
  background: var(--color-surface);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  position: relative;
  transition:
    transform 0.5s var(--ease-out),
    box-shadow 0.5s var(--ease-out);
}

/* Inner diagonal highlight — premium glass reflection */
.gh-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-xl);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.06) 0%,
    transparent 50%
  );
  pointer-events: none;
  z-index: 1;
}


/* ── Panel A — main content (center) ──────── */
.gh-panel--main {
  width: 60%;
  min-height: 380px;
  padding: var(--space-12) var(--space-12) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  z-index: 2;
}

.gh-panel--main:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}


/* ── Panel B — stat (left, rotated, overlapping) */
.gh-panel--stat {
  position: absolute;
  left: -4%;
  top: 50%;
  transform: translateY(-50%) rotate(-2deg);
  width: 22%;
  min-height: 160px;
  padding: var(--space-8) var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  z-index: 1;
  text-align: center;
  overflow: hidden;
}

.gh-panel--stat:hover {
  transform: translateY(-50%) rotate(-1deg) translateY(-3px);
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}


/* ── Panel C — features (right, rotated, overlapping) */
.gh-panel--features {
  position: absolute;
  right: -4%;
  top: 50%;
  transform: translateY(-50%) rotate(1.5deg);
  width: 24%;
  padding: var(--space-8) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  z-index: 1;
}

.gh-panel--features:hover {
  transform: translateY(-50%) rotate(0.5deg) translateY(-3px);
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}


/* ────────────────────────────────────────────
   PANEL A CONTENT
──────────────────────────────────────────── */

/* Eyebrow */
.gh-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-accent);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.gh-eyebrow::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
  flex-shrink: 0;
  animation: pulse-dot 3s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}


/* Headline */
.gh-headline {
  font-family: var(--font-serif);
  font-size: var(--text-hero);
  font-weight: 300;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  margin: 0;
}

.gh-headline-line {
  display: block;
  overflow: hidden;
  /* clip-path as additional mask for clean reveal */
  clip-path: inset(0 0 0 0);
}

.gh-headline-inner {
  display: block;
}


/* Description */
.gh-description {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: 380px;
}


/* CTA group */
.gh-cta-group {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  flex-wrap: wrap;
}

.gh-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: 14px 28px;
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
.gh-cta-primary::after {
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
.gh-cta-primary:hover::after {
  left: 100%;
}

.gh-cta-primary:hover {
  background: var(--color-text);
  color: var(--color-canvas);
  box-shadow: 0 8px 32px var(--color-accent-muted);
}
.gh-cta-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.gh-cta-secondary {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  transition: color 0.3s var(--ease-out);
}
.gh-cta-secondary:hover { color: var(--color-text); }
.gh-cta-secondary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}
.gh-cta-secondary svg {
  transition: transform 0.3s var(--ease-out);
}
.gh-cta-secondary:hover svg {
  transform: translateX(3px);
}


/* ────────────────────────────────────────────
   PANEL B — STAT CONTENT
──────────────────────────────────────────── */
.gh-stat-num {
  font-family: var(--font-display);
  font-size: var(--text-heading);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  line-height: var(--leading-none);
  position: relative;
  z-index: 2;
}

.gh-stat-label {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-subtle);
  text-align: center;
  position: relative;
  z-index: 2;
}

/* Decorative ring behind stat number */
.gh-stat-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 1px solid var(--color-accent-subtle);
  pointer-events: none;
  z-index: 0;
}
.gh-stat-ring::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 1px solid rgba(196, 132, 62, 0.06);
}


/* ────────────────────────────────────────────
   PANEL C — FEATURES CONTENT
──────────────────────────────────────────── */
.gh-features-label {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-subtle);
  margin-bottom: var(--space-2);
}

.gh-feature {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
  padding: 6px 0;
  border-bottom: 1px solid var(--color-line);
  transition: color 0.3s var(--ease-out);
}
.gh-feature:last-child {
  border-bottom: none;
}
.gh-feature:hover {
  color: var(--color-text);
}

.gh-feature::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-accent);
  flex-shrink: 0;
  transition: transform 0.3s var(--ease-spring);
}
.gh-feature:hover::before {
  transform: scale(1.6);
}


/* ────────────────────────────────────────────
   BOTTOM ACCENT STRIP
──────────────────────────────────────────── */
.gh-strip {
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
  .gh-panels {
    max-width: 780px;
  }
  .gh-panel--main {
    width: 64%;
    min-height: 340px;
    padding: var(--space-8);
  }
  .gh-panel--stat {
    width: 24%;
    left: -3%;
  }
  .gh-panel--features {
    width: 26%;
    right: -3%;
  }
}


/* ────────────────────────────────────────────
   RESPONSIVE — MOBILE
──────────────────────────────────────────── */
@media (max-width: 768px) {
  .s-gh {
    min-height: 100vh;
    height: auto;
  }

  .gh-nav-links {
    display: none;
  }

  .gh-main {
    padding: var(--space-6) var(--space-section-x) var(--space-12);
  }

  .gh-panels {
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
  }

  .gh-panel--main {
    width: 100%;
    min-height: auto;
    padding: var(--space-8) var(--space-6);
    order: 1;
  }

  .gh-panel--stat {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    width: 100%;
    min-height: auto;
    flex-direction: row;
    order: 2;
    padding: var(--space-6);
  }
  .gh-panel--stat:hover {
    transform: translateY(-2px);
  }

  .gh-stat-ring {
    display: none;
  }

  .gh-panel--features {
    position: relative;
    right: auto;
    top: auto;
    transform: none;
    width: 100%;
    order: 3;
    padding: var(--space-6);
  }
  .gh-panel--features:hover {
    transform: translateY(-2px);
  }

  .gh-headline {
    font-size: clamp(40px, 10vw, 72px);
  }

  .gh-blob--a {
    width: 80vw;
    height: 80vw;
  }
  .gh-blob--b {
    width: 70vw;
    height: 70vw;
  }
  .gh-blob--c {
    width: 60vw;
    height: 60vw;
  }
}
</style>
