<script setup>
/**
 * S-BentoDashboard  |  iOS/macOS Bento Box Grid Hero
 * ───────────────────────────────────────────────────
 * Full-viewport bento grid — 8 cards of varying sizes
 * arranged on a 12-column, 8-row grid. Each card has
 * distinct content and animation personality.
 *
 *  Card A  [c1-5,  r1-4]  — Hero text (serif heading, bottom-aligned)
 *  Card B  [c5-8,  r1-3]  — Editorial photo (portrait crop)
 *  Card C  [c8-13, r1-2]  — Metric (big number, accent tint)
 *  Card D  [c8-13, r2-4]  — Services list (icon dashes)
 *  Card E  [c1-4,  r4-6]  — Stat (large number + label)
 *  Card F  [c4-8,  r3-6]  — Description + CTA
 *  Card G  [c8-13, r4-6]  — Accent block (arrow + year)
 *  Card H  [c1-13, r6-8]  — Wide banner (eyebrow + marquee)
 *
 *  Signature: The entire viewport IS the grid — no wrapper,
 *  no hero-inside-a-page. Cards scale in from 0.94 with
 *  stagger creating a "home screen loading" effect.
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SBentoDashboard' })

const props = defineProps({
  eyebrow:      { type: String, default: 'Digital Studio  /  Est. 2019' },
  headline:     { type: String, default: 'Crafting digital\nexperiences with\nprecision.' },
  description:  { type: String, default: 'We build strategy-led products for ambitious companies. From concept to launch, every pixel is intentional.' },
  ctaLabel:     { type: String, default: 'Start a project' },
  ctaHref:      { type: String, default: '#contact' },
  imageSrc:     { type: String, required: true },
  imageAlt:     { type: String, default: 'Editorial portrait' },
  stat1Num:     { type: String, default: '48' },
  stat1Label:   { type: String, default: 'projects delivered' },
  stat2Num:     { type: String, default: '12' },
  stat2Label:   { type: String, default: 'countries served' },
  metric:       { type: String, default: '$2B+' },
  metricLabel:  { type: String, default: 'client revenue generated' },
  services:     {
    type: Array,
    default: () => ['Brand Strategy', 'Product Design', 'Engineering', 'Growth & Launch'],
  },
  logoText:     { type: String, default: 'Studio.' },
  navLinks:     {
    type: Array,
    default: () => [
      { label: 'Work', href: '#work' },
      { label: 'About', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  navCtaLabel:  { type: String, default: 'Let\u2019s talk' },
  navCtaHref:   { type: String, default: '#contact' },
  navLogoHref:  { type: String, default: '/' },
  marqueeText:  { type: String, default: 'Design \u00b7 Strategy \u00b7 Engineering \u00b7 Launch \u00b7 Growth \u00b7 Innovation \u00b7 ' },
})

const emit = defineEmits(['cta-click'])
const sectionRef = ref(null)
const marqueeRef = ref(null)
let mm = null

/* ── Magnetic helper ─────────────────────────── */
function initMagnetic(el) {
  if (!el) return
  const strength = 0.3
  const onMove = (e) => {
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    gsap.to(el, { x, y, duration: 0.3, ease: 'power2.out' })
  }
  const onLeave = () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
  }
  el.addEventListener('mousemove', onMove)
  el.addEventListener('mouseleave', onLeave)
  el._magneticCleanup = () => {
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('mouseleave', onLeave)
  }
}

onMounted(() => {
  const el = sectionRef.value
  if (!el) return

  mm = gsap.matchMedia()

  /* ── Magnetic buttons ─────────────────────── */
  el.querySelectorAll('[data-magnetic]').forEach(initMagnetic)

  /* ── Marquee infinite scroll ──────────────── */
  const marqueeTrack = el.querySelector('.bd-marquee-track')
  if (marqueeTrack) {
    gsap.to(marqueeTrack, {
      xPercent: -50,
      duration: 28,
      ease: 'none',
      repeat: -1,
    })
  }

  mm.add({
    isDesktop: '(min-width: 1280px)',
    isTablet: '(min-width: 768px) and (max-width: 1279px)',
    isMobile: '(max-width: 767px)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  }, (context) => {
    const { isDesktop, isTablet, isMobile, reduceMotion } = context.conditions
    if (reduceMotion) return

    /* ── Cards stagger entrance ─────────────── */
    const cards = el.querySelectorAll('.bd-card')
    gsap.set(cards, { scale: 0.94, autoAlpha: 0 })

    const cardsTl = gsap.timeline({ delay: 0.15 })
    cardsTl.to(cards, {
      scale: 1,
      autoAlpha: 1,
      duration: 0.7,
      stagger: {
        amount: 0.6,
        from: 'start',
        grid: 'auto',
      },
      ease: 'power3.out',
    })

    /* ── Nav entrance ───────────────────────── */
    const navItems = el.querySelectorAll('.bd-nav-item')
    gsap.set(navItems, { autoAlpha: 0, y: -12 })
    gsap.to(navItems, {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power4.out',
      delay: 0.05,
    })

    /* ── Heading reveal in Card A ───────────── */
    const heading = el.querySelector('.bd-heading')
    if (heading) {
      gsap.set(heading, { yPercent: 100, autoAlpha: 0 })
      gsap.to(heading, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.9,
        ease: 'power4.out',
        delay: 0.65,
      })
    }

    /* ── Eyebrow fade ───────────────────────── */
    const eyebrow = el.querySelector('.bd-eyebrow')
    if (eyebrow) {
      gsap.set(eyebrow, { autoAlpha: 0, x: -8 })
      gsap.to(eyebrow, {
        autoAlpha: 1,
        x: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.5,
      })
    }

    /* ── Metric number in Card C ────────────── */
    const metricNum = el.querySelector('.bd-metric-value')
    if (metricNum) {
      gsap.set(metricNum, { y: 24, autoAlpha: 0 })
      gsap.to(metricNum, {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.85,
      })
    }

    /* ── Stat number in Card E ──────────────── */
    const statNum = el.querySelector('.bd-stat-value')
    if (statNum) {
      gsap.set(statNum, { y: 24, autoAlpha: 0 })
      gsap.to(statNum, {
        y: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: 'power3.out',
        delay: 0.95,
      })
    }

    /* ── Services stagger in Card D ─────────── */
    const serviceItems = el.querySelectorAll('.bd-service-item')
    if (serviceItems.length) {
      gsap.set(serviceItems, { autoAlpha: 0, x: -6 })
      gsap.to(serviceItems, {
        autoAlpha: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 1.0,
      })
    }

    /* ── Description + CTA in Card F ────────── */
    const descBody = el.querySelector('.bd-desc-body')
    const descCta = el.querySelector('.bd-desc-cta')
    if (descBody) {
      gsap.set(descBody, { autoAlpha: 0, y: 14 })
      gsap.to(descBody, {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 1.05,
      })
    }
    if (descCta) {
      gsap.set(descCta, { autoAlpha: 0, y: 10 })
      gsap.to(descCta, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
        delay: 1.2,
      })
    }

    /* ── Accent arrow in Card G ─────────────── */
    const accentArrow = el.querySelector('.bd-accent-arrow')
    if (accentArrow) {
      gsap.set(accentArrow, { scale: 0.6, autoAlpha: 0, rotate: -15 })
      gsap.to(accentArrow, {
        scale: 1,
        autoAlpha: 1,
        rotate: 0,
        duration: 0.7,
        ease: 'back.out(1.7)',
        delay: 1.1,
      })
    }

    /* ── Image clip-path reveal in Card B ───── */
    const imageCard = el.querySelector('.bd-card-image')
    if (imageCard) {
      gsap.set(imageCard, { clipPath: 'inset(0 0 100% 0)' })
      gsap.to(imageCard, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.2,
        ease: 'power3.inOut',
        delay: 0.4,
      })
    }

    /* ── Scroll-linked parallax on image ────── */
    const imageEl = el.querySelector('.bd-image')
    if (imageEl && isDesktop) {
      gsap.to(imageEl, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      })
    }

    /* ── Scroll-linked card G background shift ─ */
    const cardG = el.querySelector('.bd-card-accent')
    if (cardG && isDesktop) {
      gsap.to(cardG, {
        '--accent-shift': '18%',
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      })
    }

    /* ── Footer stats entrance ──────────────── */
    const footerItems = el.querySelectorAll('.bd-footer-stat')
    if (footerItems.length) {
      gsap.set(footerItems, { autoAlpha: 0, y: 8 })
      gsap.to(footerItems, {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 1.3,
      })
    }
  }, el)
})

onBeforeUnmount(() => {
  mm?.revert()
  const el = sectionRef.value
  if (el) {
    el.querySelectorAll('[data-magnetic]').forEach((btn) => {
      btn._magneticCleanup?.()
    })
  }
})
</script>

<template>
  <section
    ref="sectionRef"
    class="s-bento-dashboard"
    aria-label="Hero dashboard"
  >
    <!-- ═══ GRAIN OVERLAY ═══ -->
    <div class="bd-grain" aria-hidden="true"></div>

    <!-- ═══ NAVIGATION ═══ -->
    <nav class="bd-nav" aria-label="Primary navigation">
      <a :href="navLogoHref" class="bd-nav-item bd-nav-logo">
        {{ logoText }}
      </a>

      <div class="bd-nav-links">
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          class="bd-nav-item bd-nav-link"
        >
          {{ link.label }}
        </a>
      </div>

      <a
        :href="navCtaHref"
        class="bd-nav-item bd-nav-cta"
        data-magnetic
      >
        {{ navCtaLabel }}
      </a>
    </nav>

    <!-- ═══ BENTO GRID ═══ -->
    <div class="bd-grid">

      <!-- Card A — Hero text -->
      <article class="bd-card bd-card-hero">
        <div class="bd-card-hero-bg" aria-hidden="true"></div>
        <span class="bd-eyebrow">{{ eyebrow }}</span>
        <div class="bd-heading-wrap">
          <h1 class="bd-heading">
            <span
              v-for="(line, i) in headline.split('\n')"
              :key="i"
              class="bd-heading-line"
            >{{ line }}</span>
          </h1>
        </div>
      </article>

      <!-- Card B — Image -->
      <div class="bd-card bd-card-image">
        <img
          :src="imageSrc"
          :alt="imageAlt"
          class="bd-image"
          width="600"
          height="800"
          loading="eager"
        />
      </div>

      <!-- Card C — Metric -->
      <article class="bd-card bd-card-metric">
        <span class="bd-metric-value">{{ metric }}</span>
        <span class="bd-metric-label">{{ metricLabel }}</span>
      </article>

      <!-- Card D — Services -->
      <article class="bd-card bd-card-services">
        <span class="bd-services-title">What we do</span>
        <ul class="bd-services-list">
          <li
            v-for="service in services"
            :key="service"
            class="bd-service-item"
          >
            <span class="bd-service-dash" aria-hidden="true">&mdash;</span>
            {{ service }}
          </li>
        </ul>
      </article>

      <!-- Card E — Stat -->
      <article class="bd-card bd-card-stat">
        <span class="bd-stat-value">{{ stat1Num }}</span>
        <span class="bd-stat-label">{{ stat1Label }}</span>
      </article>

      <!-- Card F — Description + CTA -->
      <article class="bd-card bd-card-desc">
        <p class="bd-desc-body">{{ description }}</p>
        <a
          :href="ctaHref"
          class="bd-desc-cta"
          data-magnetic
          @click.prevent="emit('cta-click')"
        >
          <span class="bd-cta-label">{{ ctaLabel }}</span>
          <span class="bd-cta-arrow" aria-hidden="true">&#8599;</span>
        </a>
      </article>

      <!-- Card G — Accent block -->
      <div class="bd-card bd-card-accent">
        <span class="bd-accent-arrow" aria-hidden="true">&#8599;</span>
        <span class="bd-accent-year">2025</span>
      </div>

      <!-- Card H — Wide banner with marquee -->
      <div class="bd-card bd-card-banner">
        <span class="bd-banner-eyebrow">Selected work &amp; capabilities</span>
        <div class="bd-marquee" ref="marqueeRef" aria-hidden="true">
          <div class="bd-marquee-track">
            <!-- Duplicate for seamless loop -->
            <span class="bd-marquee-text">{{ marqueeText }}</span>
            <span class="bd-marquee-text">{{ marqueeText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ FOOTER BAR ═══ -->
    <footer class="bd-footer" aria-label="Quick stats">
      <div class="bd-footer-stat">
        <span class="bd-footer-stat-num">{{ stat1Num }}</span>
        <span class="bd-footer-stat-label">{{ stat1Label }}</span>
      </div>
      <div class="bd-footer-stat">
        <span class="bd-footer-stat-num">{{ stat2Num }}</span>
        <span class="bd-footer-stat-label">{{ stat2Label }}</span>
      </div>
      <div class="bd-footer-stat">
        <span class="bd-footer-stat-num">{{ metric }}</span>
        <span class="bd-footer-stat-label">{{ metricLabel }}</span>
      </div>
      <span class="bd-footer-copy">&copy; {{ new Date().getFullYear() }}</span>
    </footer>
  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════════
   S-BentoDashboard  —  iOS Bento Grid Hero
   ═══════════════════════════════════════════ */

.s-bento-dashboard {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  background: var(--color-canvas, #0a0a0f);
  color: var(--color-text, #e8e6e1);
  overflow: hidden;
}

/* ── Grain ─────────────────────────────────── */
.bd-grain {
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: 10;
  animation: bd-grain 0.5s steps(6) infinite;
}

@keyframes bd-grain {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5%, -5%); }
  50% { transform: translate(5%, 0); }
  75% { transform: translate(0, 5%); }
}

/* ── Navigation ────────────────────────────── */
.bd-nav {
  position: relative;
  z-index: var(--z-nav, 50);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  padding: 0 var(--space-lg, 24px);
  border-bottom: 1px solid color-mix(in srgb, var(--color-text, #e8e6e1) 8%, transparent);
  flex-shrink: 0;
}

.bd-nav-logo {
  font-family: var(--font-display, 'Inter', sans-serif);
  font-size: clamp(16px, 1.2vw, 20px);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text, #e8e6e1);
  text-decoration: none;
}

.bd-nav-links {
  display: flex;
  gap: var(--space-lg, 24px);
}

.bd-nav-link {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--color-text-muted, #8a887f);
  text-decoration: none;
  text-transform: uppercase;
  position: relative;
  transition: color 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.bd-nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--color-accent, #c8a97e);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.bd-nav-link:hover {
  color: var(--color-text, #e8e6e1);
}

.bd-nav-link:hover::after {
  transform: scaleX(1);
}

.bd-nav-link:focus-visible,
.bd-nav-logo:focus-visible,
.bd-nav-cta:focus-visible {
  outline: 2px solid var(--color-accent, #c8a97e);
  outline-offset: 4px;
  border-radius: 2px;
}

.bd-nav-cta {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-canvas, #0a0a0f);
  background: var(--color-text, #e8e6e1);
  padding: 10px 20px;
  border-radius: 999px;
  text-decoration: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  transition:
    background 200ms cubic-bezier(0.16, 1, 0.3, 1),
    color 200ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.bd-nav-cta:hover {
  background: var(--color-accent, #c8a97e);
  color: var(--color-canvas, #0a0a0f);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.08);
}

/* ── Bento Grid ────────────────────────────── */
.bd-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 10px;
  flex: 1;
  padding: 10px;
  min-height: 0;
}

/* ── Card base ─────────────────────────────── */
.bd-card {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  transition:
    transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.bd-card:hover {
  transform: scale(1.02);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    0 12px 40px rgba(0, 0, 0, 0.15);
}

/* ── Card A — Hero text ────────────────────── */
.bd-card-hero {
  grid-column: 1 / 5;
  grid-row: 1 / 4;
  background: var(--color-canvas, #0a0a0f);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--space-lg, 24px);
  z-index: 2;
}

.bd-card-hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      ellipse at 20% 80%,
      color-mix(in srgb, var(--color-accent, #c8a97e) 6%, transparent) 0%,
      transparent 60%
    );
  pointer-events: none;
  z-index: 0;
}

.bd-eyebrow {
  position: relative;
  z-index: 1;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted, #8a887f);
  line-height: 1;
}

.bd-heading-wrap {
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.bd-heading {
  font-family: var(--font-serif, 'Georgia', serif);
  font-size: clamp(32px, 3.5vw, 52px);
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--color-text, #e8e6e1);
  margin: 0;
}

.bd-heading-line {
  display: block;
}

/* ── Card B — Image ────────────────────────── */
.bd-card-image {
  grid-column: 5 / 8;
  grid-row: 1 / 3;
  padding: 0;
  background: var(--color-canvas-alt, #141418);
}

.bd-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
}

.bd-card-image:hover .bd-image {
  transform: scale(1.06);
}

/* Override card-level scale on image card — image zoom is enough */
.bd-card-image:hover {
  transform: none;
}

/* ── Card C — Metric ───────────────────────── */
.bd-card-metric {
  grid-column: 8 / 13;
  grid-row: 1 / 2;
  background: color-mix(in srgb, var(--color-accent, #c8a97e) 15%, var(--color-canvas, #0a0a0f));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs, 4px);
  padding: var(--space-md, 16px);
  text-align: center;
}

.bd-metric-value {
  font-family: var(--font-serif, 'Georgia', serif);
  font-size: clamp(36px, 5vw, 72px);
  font-weight: 300;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--color-text, #e8e6e1);
}

.bd-metric-label {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted, #8a887f);
}

/* ── Card D — Services ─────────────────────── */
.bd-card-services {
  grid-column: 8 / 13;
  grid-row: 2 / 4;
  background: var(--color-canvas-alt, #141418);
  padding: var(--space-lg, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
}

.bd-services-title {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-subtle, #5c5a54);
  padding-bottom: var(--space-sm, 8px);
  border-bottom: 1px solid color-mix(in srgb, var(--color-text, #e8e6e1) 6%, transparent);
}

.bd-services-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 8px);
}

.bd-service-item {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted, #8a887f);
  display: flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  transition: color 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.bd-service-item:hover {
  color: var(--color-text, #e8e6e1);
}

.bd-service-dash {
  color: var(--color-accent, #c8a97e);
  font-size: 10px;
  flex-shrink: 0;
}

/* ── Card E — Stat ─────────────────────────── */
.bd-card-stat {
  grid-column: 1 / 4;
  grid-row: 4 / 6;
  background: var(--color-canvas, #0a0a0f);
  border: 1px solid color-mix(in srgb, var(--color-text, #e8e6e1) 6%, transparent);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: var(--space-xl, 32px) var(--space-lg, 24px);
  gap: var(--space-xs, 4px);
}

.bd-stat-value {
  font-family: var(--font-serif, 'Georgia', serif);
  font-size: clamp(48px, 6vw, 88px);
  font-weight: 300;
  line-height: 0.9;
  letter-spacing: -0.03em;
  color: var(--color-text, #e8e6e1);
}

.bd-stat-label {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-subtle, #5c5a54);
}

/* ── Card F — Description + CTA ────────────── */
.bd-card-desc {
  grid-column: 4 / 8;
  grid-row: 3 / 6;
  background: var(--color-canvas, #0a0a0f);
  border: 1px solid color-mix(in srgb, var(--color-text, #e8e6e1) 6%, transparent);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--space-lg, 24px);
}

.bd-desc-body {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 13px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-text-muted, #8a887f);
  max-width: 36ch;
  margin: 0;
}

.bd-desc-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm, 8px);
  align-self: flex-start;
  padding: 12px 24px;
  border: 1px solid color-mix(in srgb, var(--color-text, #e8e6e1) 20%, transparent);
  border-radius: 999px;
  text-decoration: none;
  color: var(--color-text, #e8e6e1);
  min-height: 44px;
  transition:
    background 300ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 300ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.bd-desc-cta:hover {
  background: color-mix(in srgb, var(--color-accent, #c8a97e) 10%, transparent);
  border-color: var(--color-accent, #c8a97e);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.06),
    0 8px 24px rgba(0, 0, 0, 0.1);
}

.bd-desc-cta:focus-visible {
  outline: 2px solid var(--color-accent, #c8a97e);
  outline-offset: 4px;
}

.bd-cta-label {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.bd-cta-arrow {
  font-size: 16px;
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.bd-desc-cta:hover .bd-cta-arrow {
  transform: translate(2px, -2px);
}

/* ── Card G — Accent block ─────────────────── */
.bd-card-accent {
  --accent-shift: 8%;
  grid-column: 8 / 13;
  grid-row: 4 / 6;
  background:
    radial-gradient(
      circle at 70% var(--accent-shift),
      color-mix(in srgb, var(--color-accent, #c8a97e) 12%, transparent) 0%,
      color-mix(in srgb, var(--color-accent, #c8a97e) 4%, var(--color-canvas, #0a0a0f)) 100%
    );
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  padding: var(--space-lg, 24px);
}

.bd-accent-arrow {
  font-size: clamp(40px, 4vw, 64px);
  line-height: 1;
  color: var(--color-accent, #c8a97e);
  opacity: 0.7;
}

.bd-accent-year {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.1em;
  color: var(--color-text-subtle, #5c5a54);
  text-align: right;
}

/* ── Card H — Wide banner + marquee ────────── */
.bd-card-banner {
  grid-column: 1 / 13;
  grid-row: 6 / 9;
  background: var(--color-canvas-alt, #141418);
  display: flex;
  align-items: center;
  gap: var(--space-xl, 32px);
  padding: 0 var(--space-lg, 24px);
  overflow: hidden;
}

.bd-banner-eyebrow {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-subtle, #5c5a54);
  white-space: nowrap;
  flex-shrink: 0;
}

.bd-marquee {
  flex: 1;
  overflow: hidden;
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 8%,
    black 92%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 8%,
    black 92%,
    transparent 100%
  );
}

.bd-marquee-track {
  display: flex;
  white-space: nowrap;
  will-change: transform;
}

.bd-marquee-text {
  font-family: var(--font-display, 'Inter', sans-serif);
  font-size: clamp(18px, 2vw, 28px);
  font-weight: 300;
  letter-spacing: 0.02em;
  color: color-mix(in srgb, var(--color-text, #e8e6e1) 25%, transparent);
  padding-right: var(--space-xl, 32px);
  flex-shrink: 0;
}

/* ── Footer bar ────────────────────────────── */
.bd-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 var(--space-lg, 24px);
  border-top: 1px solid color-mix(in srgb, var(--color-text, #e8e6e1) 6%, transparent);
  flex-shrink: 0;
}

.bd-footer-stat {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs, 4px);
}

.bd-footer-stat-num {
  font-family: var(--font-serif, 'Georgia', serif);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text, #e8e6e1);
}

.bd-footer-stat-label {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: var(--color-text-subtle, #5c5a54);
}

.bd-footer-copy {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  color: var(--color-text-subtle, #5c5a54);
  letter-spacing: 0.06em;
}

/* ═══════════════════════════════════════════
   ATMOSPHERIC PSEUDO-ELEMENTS
   ═══════════════════════════════════════════ */

/* Vignette on whole section */
.s-bento-dashboard::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 40%,
    rgba(0, 0, 0, 0.35) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* Accent glow — top right atmosphere */
.s-bento-dashboard::after {
  content: '';
  position: absolute;
  top: -10%;
  right: -5%;
  width: 50%;
  height: 50%;
  background: radial-gradient(
    ellipse at center,
    color-mix(in srgb, var(--color-accent, #c8a97e) 4%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
  filter: blur(60px);
}

/* ═══════════════════════════════════════════
   RESPONSIVE — Tablet (768px)
   ═══════════════════════════════════════════ */

@media (min-width: 768px) and (max-width: 1279px) {
  .bd-grid {
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: auto;
    gap: 8px;
    padding: 8px;
  }

  .bd-card-hero {
    grid-column: 1 / 4;
    grid-row: 1 / 3;
  }

  .bd-card-image {
    grid-column: 4 / 7;
    grid-row: 1 / 2;
  }

  .bd-card-metric {
    grid-column: 4 / 7;
    grid-row: 2 / 3;
  }

  .bd-card-services {
    grid-column: 1 / 4;
    grid-row: 3 / 4;
  }

  .bd-card-stat {
    grid-column: 4 / 7;
    grid-row: 3 / 4;
  }

  .bd-card-desc {
    grid-column: 1 / 4;
    grid-row: 4 / 5;
  }

  .bd-card-accent {
    grid-column: 4 / 7;
    grid-row: 4 / 5;
  }

  .bd-card-banner {
    grid-column: 1 / 7;
    grid-row: 5 / 6;
    min-height: 100px;
  }
}

/* ═══════════════════════════════════════════
   RESPONSIVE — Mobile (< 768px)
   ═══════════════════════════════════════════ */

@media (max-width: 767px) {
  .bd-nav-links {
    display: none;
  }

  .bd-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    flex: 1;
  }

  /* Show only Card A, B, and F on mobile */
  .bd-card-metric,
  .bd-card-services,
  .bd-card-stat,
  .bd-card-accent,
  .bd-card-banner {
    display: none;
  }

  .bd-card-hero {
    flex: 1.2;
    min-height: 180px;
  }

  .bd-card-image {
    flex: 1;
    min-height: 200px;
  }

  .bd-card-desc {
    flex: 0.8;
    min-height: 160px;
  }

  .bd-heading {
    font-size: clamp(28px, 7vw, 40px);
  }

  .bd-footer {
    flex-wrap: wrap;
    height: auto;
    padding: var(--space-sm, 8px) var(--space-md, 16px);
    gap: var(--space-sm, 8px);
  }

  .bd-footer-stat {
    flex: 1 1 40%;
  }
}

/* ═══════════════════════════════════════════
   DESKTOP ENHANCEMENTS (1280px+)
   ═══════════════════════════════════════════ */

@media (min-width: 1280px) {
  .bd-nav {
    padding: 0 var(--space-xl, 32px);
  }

  .bd-card-hero {
    padding: var(--space-xl, 32px);
  }

  .bd-card-desc {
    padding: var(--space-xl, 32px);
  }

  .bd-footer {
    padding: 0 var(--space-xl, 32px);
  }
}

/* ═══════════════════════════════════════════
   WIDE SCREENS (1440px+)
   ═══════════════════════════════════════════ */

@media (min-width: 1440px) {
  .bd-grid {
    gap: 12px;
    padding: 12px;
  }

  .bd-heading {
    font-size: clamp(44px, 3.5vw, 60px);
  }

  .bd-metric-value {
    font-size: clamp(48px, 5vw, 80px);
  }

  .bd-stat-value {
    font-size: clamp(56px, 6vw, 96px);
  }
}

/* ═══════════════════════════════════════════
   FOCUS VISIBLE (all interactive elements)
   ═══════════════════════════════════════════ */

.bd-nav-link:focus-visible,
.bd-nav-logo:focus-visible,
.bd-nav-cta:focus-visible,
.bd-desc-cta:focus-visible {
  outline: 2px solid var(--color-accent, #c8a97e);
  outline-offset: 4px;
  border-radius: 2px;
}
</style>
