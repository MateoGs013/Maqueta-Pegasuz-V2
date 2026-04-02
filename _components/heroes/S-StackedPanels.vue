<script setup>
/**
 * S-StackedPanels  |  Scroll-Driven Stacking Hero
 * ─────────────────────────────────────────────────
 * A pinned hero with 4 full-viewport panels that stack
 * on top of each other as you scroll. Each panel slides up
 * from below, creating a layered depth effect like papers
 * being stacked on a desk.
 *
 * Layers per panel (bottom to top):
 *   1. Panel background (unique per panel)
 *   2. Panel content (headline + body)
 *   3. Grain overlay
 *
 * Global overlays:
 *   - Panel dot indicators (right edge)
 *   - Current panel counter (bottom-left)
 *   - Tab peek strips (visible portion of buried panels)
 *
 * Signature: "Depth Stack Peek" — buried panels scale down
 * progressively (0.96 → 0.92 → 0.88) as they're stacked deeper,
 * creating a convincing Z-depth illusion.
 */

import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SStackedPanels' })

const sectionRef = ref(null)
const ctaBtnRef = ref(null)
const currentPanel = ref(0)
let mm = null

onMounted(async () => {
  await nextTick()
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

    const panels = el.querySelectorAll('.sp-panel')
    const dots = el.querySelectorAll('.sp-dot')
    const counterNum = el.querySelector('.sp-counter-current')

    if (isMobile) {
      /* ── Mobile: simpler sequential fade ── */
      panels.forEach((panel, i) => {
        if (i === 0) return
        gsap.set(panel, { autoAlpha: 0, yPercent: 8 })
      })

      const mobileTl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            const idx = Math.min(3, Math.floor(self.progress * 4))
            currentPanel.value = idx
          },
        },
      })

      panels.forEach((panel, i) => {
        if (i === 0) return
        const startPos = i / 4
        mobileTl.to(panel, {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.2,
          ease: 'power3.out',
        }, startPos)
      })

      /* ── Panel 1 entrance (mobile) ── */
      const p1Headline = panels[0].querySelector('.sp-headline')
      const p1Stats = panels[0].querySelectorAll('.sp-stat')
      if (p1Headline) {
        gsap.from(p1Headline, {
          yPercent: 10,
          autoAlpha: 0,
          duration: 1,
          ease: 'power3.out',
        })
      }
      if (p1Stats.length) {
        gsap.from(p1Stats, {
          autoAlpha: 0,
          y: 16,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.4,
        })
      }

      return
    }

    /* ══════════════════════════════════════
       DESKTOP / TABLET: Full stacking animation
       ══════════════════════════════════════ */

    const PEEK_HEIGHT = isDesktop ? 80 : 60
    const SCALE_STEP = isDesktop ? 0.04 : 0.03

    /* Initial state: panels 2-4 below viewport */
    panels.forEach((panel, i) => {
      if (i === 0) {
        gsap.set(panel, { zIndex: 4 })
      } else {
        gsap.set(panel, { yPercent: 100, zIndex: 4 + i })
      }
    })

    /* Master pinned timeline */
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        pin: '.sp-viewport',
        pinSpacing: false,
        onUpdate: (self) => {
          const progress = self.progress
          const idx = Math.min(3, Math.floor(progress * 4))
          currentPanel.value = idx

          /* Update counter text */
          if (counterNum) {
            counterNum.textContent = `0${idx + 1}`
          }

          /* Update dot indicators */
          dots.forEach((dot, di) => {
            if (di === idx) {
              dot.classList.add('sp-dot--active')
            } else {
              dot.classList.remove('sp-dot--active')
            }
          })

          /* Signature: Depth Stack Peek — scale buried panels */
          panels.forEach((panel, pi) => {
            const depth = idx - pi
            if (depth > 0 && pi < idx) {
              const targetScale = 1 - (depth * SCALE_STEP)
              const translateY = -(depth * PEEK_HEIGHT)
              gsap.set(panel, {
                scale: Math.max(targetScale, 0.85),
                y: translateY,
                transformOrigin: 'center bottom',
              })
            } else if (pi === idx) {
              gsap.set(panel, { scale: 1, y: 0 })
            }
          })
        },
      },
    })

    /* Slide each panel into view */
    panels.forEach((panel, i) => {
      if (i === 0) return
      const startPosition = (i - 0.5) / 4
      const endPosition = i / 4

      masterTl.fromTo(panel,
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: 'power3.inOut',
          duration: endPosition - startPosition,
        },
        startPosition,
      )
    })

    /* ── Panel 1 entrance animation ── */
    const p1Headline = panels[0].querySelector('.sp-headline')
    const p1Sub = panels[0].querySelector('.sp-sub')
    const p1Stats = panels[0].querySelectorAll('.sp-stat')
    const p1Dot = panels[0].querySelector('.sp-dot-grid')
    const p1Eyebrow = panels[0].querySelector('.sp-eyebrow')

    const entranceTl = gsap.timeline({
      defaults: { ease: 'power3.out' },
    })

    if (p1Eyebrow) {
      gsap.set(p1Eyebrow, { autoAlpha: 0, x: -10 })
      entranceTl.to(p1Eyebrow, {
        autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out',
      }, 0.2)
    }

    if (p1Headline) {
      gsap.set(p1Headline, { autoAlpha: 0, yPercent: 10 })
      entranceTl.to(p1Headline, {
        autoAlpha: 1, yPercent: 0, duration: 1, ease: 'power4.out',
      }, 0.3)
    }

    if (p1Sub) {
      gsap.set(p1Sub, { autoAlpha: 0, y: 12 })
      entranceTl.to(p1Sub, {
        autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out',
      }, 0.6)
    }

    if (p1Stats.length) {
      gsap.set(p1Stats, { autoAlpha: 0, y: 20 })
      entranceTl.to(p1Stats, {
        autoAlpha: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out',
      }, 0.7)
    }

    if (p1Dot) {
      gsap.set(p1Dot, { autoAlpha: 0 })
      entranceTl.to(p1Dot, {
        autoAlpha: 0.25, duration: 1.4, ease: 'power2.out',
      }, 0.4)
    }

    /* ── Dots & counter entrance ── */
    const dotsWrap = el.querySelector('.sp-dots')
    const counterWrap = el.querySelector('.sp-counter')
    if (dotsWrap) {
      gsap.set(dotsWrap, { autoAlpha: 0 })
      entranceTl.to(dotsWrap, { autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, 0.8)
    }
    if (counterWrap) {
      gsap.set(counterWrap, { autoAlpha: 0 })
      entranceTl.to(counterWrap, { autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, 0.9)
    }

    /* ── Magnetic CTA on Panel 4 ── */
    const ctaTarget = ctaBtnRef.value
    if (ctaTarget) {
      const xTo = gsap.quickTo(ctaTarget, 'x', { duration: 0.5, ease: 'power3.out' })
      const yTo = gsap.quickTo(ctaTarget, 'y', { duration: 0.5, ease: 'power3.out' })

      const onMove = (e) => {
        const r = ctaTarget.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.3)
        yTo((e.clientY - r.top - r.height / 2) * 0.3)
      }
      const onLeave = () => { xTo(0); yTo(0) }

      ctaTarget.addEventListener('mousemove', onMove)
      ctaTarget.addEventListener('mouseleave', onLeave)

      return () => {
        ctaTarget.removeEventListener('mousemove', onMove)
        ctaTarget.removeEventListener('mouseleave', onLeave)
      }
    }
  }, sectionRef.value)

  ScrollTrigger.refresh()
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section
    ref="sectionRef"
    class="s-sp"
    aria-label="Hero: Stacked panels scroll experience"
  >
    <!-- Viewport wrapper — gets pinned by ScrollTrigger -->
    <div class="sp-viewport">

      <!-- ═══════════════════════════════════════
           PANEL 1: "The Studio" — dark base
           ═══════════════════════════════════════ -->
      <div class="sp-panel sp-panel--1" aria-label="The Studio">
        <!-- Dot grid background pattern -->
        <div class="sp-dot-grid" aria-hidden="true"></div>
        <!-- Radial glow atmosphere -->
        <div class="sp-panel-glow sp-panel-glow--1" aria-hidden="true"></div>
        <!-- Grain -->
        <div class="sp-panel-grain" aria-hidden="true"></div>

        <!-- Decorative wide rule — bleeds beyond container -->
        <div class="sp-bleed-rule" aria-hidden="true"></div>

        <div class="sp-panel-content sp-panel-content--1">
          <div class="sp-p1-top">
            <span class="sp-eyebrow">The Studio</span>
            <h1 class="sp-headline sp-headline--1">
              <span class="sp-headline-line">We build</span>
              <span class="sp-headline-line sp-headline-line--italic">experiences</span>
            </h1>
            <p class="sp-sub">Creative direction and digital craft for brands that refuse to blend in.</p>
          </div>
          <div class="sp-p1-stats">
            <div class="sp-stat">
              <span class="sp-stat-number">12</span>
              <span class="sp-stat-label">Years</span>
            </div>
            <div class="sp-stat-divider" aria-hidden="true"></div>
            <div class="sp-stat">
              <span class="sp-stat-number">240</span>
              <span class="sp-stat-label">Projects</span>
            </div>
            <div class="sp-stat-divider" aria-hidden="true"></div>
            <div class="sp-stat">
              <span class="sp-stat-number">8</span>
              <span class="sp-stat-label">Awards</span>
            </div>
          </div>
        </div>

        <!-- Tab label (visible when panel is buried) -->
        <div class="sp-tab" aria-hidden="true">
          <span class="sp-tab-num">01</span>
          <span class="sp-tab-name">The Studio</span>
        </div>
      </div>

      <!-- ═══════════════════════════════════════
           PANEL 2: "Process" — dark with accent
           ═══════════════════════════════════════ -->
      <div class="sp-panel sp-panel--2" aria-label="Our Process">
        <!-- Amber gradient wash -->
        <div class="sp-panel-glow sp-panel-glow--2" aria-hidden="true"></div>
        <!-- Giant watermark text behind content -->
        <div class="sp-watermark" aria-hidden="true">PROCESS</div>
        <div class="sp-panel-grain" aria-hidden="true"></div>

        <div class="sp-panel-content sp-panel-content--2">
          <h2 class="sp-headline sp-headline--2">
            <span class="sp-headline-line sp-headline-line--light">Our</span>
            <span class="sp-headline-line">Process</span>
          </h2>

          <div class="sp-process-grid">
            <div class="sp-process-item">
              <span class="sp-process-num">01</span>
              <div class="sp-process-rule" aria-hidden="true"></div>
              <h3 class="sp-process-title">Discover</h3>
              <p class="sp-process-desc">Deep research into brand, audience, and competitive landscape.</p>
            </div>
            <div class="sp-process-item">
              <span class="sp-process-num">02</span>
              <div class="sp-process-rule" aria-hidden="true"></div>
              <h3 class="sp-process-title">Define</h3>
              <p class="sp-process-desc">Strategic direction, identity systems, and design language.</p>
            </div>
            <div class="sp-process-item">
              <span class="sp-process-num">03</span>
              <div class="sp-process-rule" aria-hidden="true"></div>
              <h3 class="sp-process-title">Design</h3>
              <p class="sp-process-desc">High-fidelity prototypes with obsessive craft and motion design.</p>
            </div>
            <div class="sp-process-item">
              <span class="sp-process-num">04</span>
              <div class="sp-process-rule" aria-hidden="true"></div>
              <h3 class="sp-process-title">Deliver</h3>
              <p class="sp-process-desc">Pixel-perfect development, testing, and launch support.</p>
            </div>
          </div>
        </div>

        <div class="sp-tab" aria-hidden="true">
          <span class="sp-tab-num">02</span>
          <span class="sp-tab-name">Process</span>
        </div>
      </div>

      <!-- ═══════════════════════════════════════
           PANEL 3: "Work" — glass/frosted
           ═══════════════════════════════════════ -->
      <div class="sp-panel sp-panel--3" aria-label="Selected Work">
        <div class="sp-panel-glow sp-panel-glow--3" aria-hidden="true"></div>
        <div class="sp-panel-grain" aria-hidden="true"></div>

        <div class="sp-panel-content sp-panel-content--3">
          <h2 class="sp-headline sp-headline--3">
            <span class="sp-headline-line sp-headline-line--light">Selected</span>
            <span class="sp-headline-line">Work</span>
          </h2>

          <div class="sp-work-grid">
            <div class="sp-work-card">
              <div class="sp-work-thumb">
                <div class="sp-work-thumb-inner"></div>
              </div>
              <div class="sp-work-info">
                <span class="sp-work-name">Meridian Studios</span>
                <span class="sp-work-year">2024</span>
              </div>
            </div>
            <div class="sp-work-card">
              <div class="sp-work-thumb">
                <div class="sp-work-thumb-inner"></div>
              </div>
              <div class="sp-work-info">
                <span class="sp-work-name">Obsidian Capital</span>
                <span class="sp-work-year">2024</span>
              </div>
            </div>
            <div class="sp-work-card">
              <div class="sp-work-thumb">
                <div class="sp-work-thumb-inner"></div>
              </div>
              <div class="sp-work-info">
                <span class="sp-work-name">Flux Architecture</span>
                <span class="sp-work-year">2023</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sp-tab" aria-hidden="true">
          <span class="sp-tab-num">03</span>
          <span class="sp-tab-name">Work</span>
        </div>
      </div>

      <!-- ═══════════════════════════════════════
           PANEL 4: "Contact" — inverted (light)
           ═══════════════════════════════════════ -->
      <div class="sp-panel sp-panel--4" aria-label="Contact">
        <div class="sp-panel-grain sp-panel-grain--light" aria-hidden="true"></div>

        <div class="sp-panel-content sp-panel-content--4">
          <div class="sp-p4-content">
            <h2 class="sp-headline sp-headline--4">
              <span class="sp-headline-line">Let's</span>
              <span class="sp-headline-line sp-headline-line--italic sp-headline-line--accent">talk</span>
            </h2>
            <p class="sp-p4-desc">Ready to create something extraordinary? We'd love to hear about your project.</p>

            <a
              ref="ctaBtnRef"
              href="#contact"
              class="sp-cta"
              data-magnetic
            >
              <span class="sp-cta-label">Start a project</span>
              <svg class="sp-cta-arrow" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>

          <div class="sp-p4-meta">
            <span class="sp-p4-email">hello@studio.com</span>
            <span class="sp-p4-location">Buenos Aires, AR</span>
          </div>
        </div>

        <div class="sp-tab" aria-hidden="true">
          <span class="sp-tab-num">04</span>
          <span class="sp-tab-name">Contact</span>
        </div>
      </div>

      <!-- ═══════════════════════════════════════
           GLOBAL OVERLAYS (above all panels)
           ═══════════════════════════════════════ -->

      <!-- Panel dot indicators — right edge -->
      <div class="sp-dots" aria-hidden="true">
        <button class="sp-dot sp-dot--active" aria-label="Panel 1"></button>
        <button class="sp-dot" aria-label="Panel 2"></button>
        <button class="sp-dot" aria-label="Panel 3"></button>
        <button class="sp-dot" aria-label="Panel 4"></button>
      </div>

      <!-- Panel counter — bottom left -->
      <div class="sp-counter" aria-hidden="true">
        <span class="sp-counter-current">01</span>
        <span class="sp-counter-sep">/</span>
        <span class="sp-counter-total">04</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════
   S-StackedPanels — Scroll-Driven Stacking Hero
   ═══════════════════════════════════════ */

.s-sp {
  position: relative;
  width: 100%;
  height: 400vh;
  background: var(--color-canvas);
}

.sp-viewport {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 600px;
  overflow: hidden;
}

/* Section-level decorative line — top edge accent */
.sp-viewport::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--color-accent-subtle) 30%,
    var(--color-accent) 50%,
    var(--color-accent-subtle) 70%,
    transparent 100%
  );
  z-index: 60;
  pointer-events: none;
  opacity: 0.6;
}


/* ═══════════════════════════════════════
   PANEL BASE
   ═══════════════════════════════════════ */

.sp-panel {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ── Grain per panel ── */
.sp-panel-grain {
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: 20;
  animation: sp-grain 0.5s steps(6) infinite;
}

.sp-panel-grain--light {
  opacity: 0.04;
  mix-blend-mode: multiply;
}

@keyframes sp-grain {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5%, -5%); }
  50% { transform: translate(5%, 0); }
  75% { transform: translate(0, 5%); }
}

/* ── Panel content shared base ── */
.sp-panel-content {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}


/* ═══════════════════════════════════════
   TAB PEEK STRIPS
   When a panel is buried, its top strip remains visible
   ═══════════════════════════════════════ */

.sp-tab {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: 0 var(--space-section-x);
  z-index: 2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  pointer-events: none;
}

.sp-tab-num {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  color: var(--color-accent);
}

.sp-tab-name {
  font-family: var(--font-body);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* Panel 4 has inverted colors */
.sp-panel--4 .sp-tab {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}
.sp-panel--4 .sp-tab-num {
  color: var(--color-accent);
}
.sp-panel--4 .sp-tab-name {
  color: var(--color-text-invert);
  opacity: 0.5;
}


/* ═══════════════════════════════════════
   PANEL 1: "The Studio"
   Dark base + dot grid + serif italic headline
   ═══════════════════════════════════════ */

.sp-panel--1 {
  background: var(--color-canvas);
}

/* Decorative bleed rule — wider than container padding */
.sp-bleed-rule {
  position: absolute;
  bottom: clamp(130px, 16vh, 200px);
  left: -4vw;
  width: calc(100% + 8vw);
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    var(--color-accent-subtle) 20%,
    var(--color-accent-muted) 50%,
    var(--color-accent-subtle) 80%,
    transparent
  );
  z-index: 3;
  pointer-events: none;
}

/* Dot grid background */
.sp-dot-grid {
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.25;
  background-image:
    radial-gradient(
      circle at center,
      rgba(245, 240, 232, 0.18) 1px,
      transparent 1px
    );
  background-size: 40px 40px;
  mask-image: radial-gradient(
    ellipse 70% 60% at 50% 40%,
    black 0%,
    transparent 100%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 70% 60% at 50% 40%,
    black 0%,
    transparent 100%
  );
  pointer-events: none;
}

.sp-panel-glow--1 {
  position: absolute;
  top: 20%;
  left: 10%;
  width: 50vw;
  height: 50vh;
  background: radial-gradient(
    ellipse at center,
    var(--color-accent-subtle) 0%,
    transparent 70%
  );
  filter: blur(80px);
  z-index: 1;
  pointer-events: none;
  opacity: 0.4;
}

.sp-panel-content--1 {
  justify-content: space-between;
  padding: clamp(100px, 14vh, 180px) var(--space-section-x) clamp(48px, 6vh, 80px);
}

.sp-p1-top {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 780px;
}

.sp-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-accent);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.sp-eyebrow::before {
  content: '';
  width: 32px;
  height: 1px;
  background: var(--color-accent);
  flex-shrink: 0;
}

.sp-headline--1 {
  font-family: var(--font-serif);
  font-size: clamp(56px, 9vw, 140px);
  font-weight: 300;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  margin: 0;
}

.sp-headline-line {
  display: block;
}

.sp-headline-line--italic {
  font-style: italic;
}

.sp-headline-line--light {
  font-weight: 300;
  color: var(--color-text-muted);
}

.sp-headline-line--accent {
  color: var(--color-accent);
}

.sp-sub {
  font-family: var(--font-body);
  font-size: var(--text-body-lg, clamp(16px, 1.2vw, 20px));
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  max-width: 420px;
}

/* Stats row */
.sp-p1-stats {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.sp-stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
}

.sp-stat-number {
  font-family: var(--font-display);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 700;
  line-height: var(--leading-none, 1);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.sp-stat-label {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.sp-stat-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--color-text-subtle),
    transparent
  );
  flex-shrink: 0;
}


/* ═══════════════════════════════════════
   PANEL 2: "Process"
   Dark with amber accent gradient
   ═══════════════════════════════════════ */

.sp-panel--2 {
  background: var(--color-canvas-alt);
}

/* Giant watermark — bleeds wider than content area */
.sp-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-display);
  font-size: clamp(120px, 18vw, 300px);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  opacity: 0.03;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1;
  user-select: none;
  width: calc(100% + 10vw);
  text-align: center;
}

.sp-panel-glow--2 {
  position: absolute;
  top: -20%;
  right: -10%;
  width: 60vw;
  height: 60vh;
  background: radial-gradient(
    ellipse at center,
    rgba(196, 132, 62, 0.08) 0%,
    transparent 70%
  );
  filter: blur(60px);
  z-index: 1;
  pointer-events: none;
}

.sp-panel-content--2 {
  align-items: center;
  justify-content: center;
  padding: clamp(60px, 8vh, 120px) var(--space-section-x);
  gap: clamp(40px, 5vh, 72px);
}

.sp-headline--2 {
  font-family: var(--font-display);
  font-size: clamp(64px, 10vw, 160px);
  font-weight: 700;
  line-height: var(--leading-none, 1);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  text-align: center;
  margin: 0;
}

.sp-process-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8) clamp(40px, 5vw, 80px);
  max-width: 720px;
  width: 100%;
}

.sp-process-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.sp-process-num {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  color: var(--color-accent);
}

.sp-process-rule {
  width: 100%;
  height: 1px;
  background: linear-gradient(
    to right,
    var(--color-accent-muted),
    transparent
  );
}

.sp-process-title {
  font-family: var(--font-display);
  font-size: clamp(18px, 1.5vw, 24px);
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
  letter-spacing: var(--tracking-tight);
}

.sp-process-desc {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  margin: 0;
}


/* ═══════════════════════════════════════
   PANEL 3: "Work"
   Glass/frosted aesthetic
   ═══════════════════════════════════════ */

.sp-panel--3 {
  background: #1a1610;
}

/* Frosted glass effect pseudo overlay */
.sp-panel--3::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(26, 22, 16, 0.4);
  backdrop-filter: blur(2px) saturate(120%);
  -webkit-backdrop-filter: blur(2px) saturate(120%);
  z-index: 2;
  pointer-events: none;
}

.sp-panel-glow--3 {
  position: absolute;
  bottom: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  height: 50vh;
  background: radial-gradient(
    ellipse at center,
    rgba(196, 132, 62, 0.06) 0%,
    transparent 65%
  );
  filter: blur(50px);
  z-index: 1;
  pointer-events: none;
}

.sp-panel-content--3 {
  justify-content: center;
  align-items: flex-end;
  padding: clamp(60px, 8vh, 120px) var(--space-section-x);
  gap: clamp(36px, 5vh, 64px);
  z-index: 5;
}

.sp-headline--3 {
  font-family: var(--font-display);
  font-size: clamp(52px, 8vw, 120px);
  font-weight: 700;
  line-height: var(--leading-none, 1);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  text-align: right;
  margin: 0;
  width: 100%;
}

.sp-work-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr;
  gap: var(--space-6);
  width: 100%;
}

.sp-work-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  cursor: pointer;
  position: relative;
}

.sp-work-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.sp-work-thumb-inner {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.02) 0%,
    rgba(196, 132, 62, 0.04) 100%
  );
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.sp-work-card:hover .sp-work-thumb-inner {
  transform: scale(1.05);
}

/* Shimmer on hover */
.sp-work-thumb::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 35%,
    rgba(255, 255, 255, 0.04) 50%,
    transparent 65%
  );
  transform: translateX(-150%);
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1;
}

.sp-work-card:hover .sp-work-thumb::after {
  transform: translateX(150%);
}

.sp-work-card:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
  border-radius: var(--radius-sm);
}

.sp-work-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sp-work-name {
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--color-text);
  letter-spacing: var(--tracking-tight);
}

.sp-work-year {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-subtle);
}


/* ═══════════════════════════════════════
   PANEL 4: "Contact"
   Inverted (light background)
   ═══════════════════════════════════════ */

.sp-panel--4 {
  background: var(--color-canvas-invert);
  color: var(--color-text-invert);
}

.sp-panel-content--4 {
  justify-content: center;
  padding: clamp(60px, 8vh, 120px) var(--space-section-x) clamp(48px, 6vh, 80px);
  gap: 0;
}

.sp-p4-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  flex: 1;
  justify-content: center;
}

.sp-headline--4 {
  font-family: var(--font-serif);
  font-size: clamp(72px, 12vw, 180px);
  font-weight: 300;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text-invert);
  text-align: center;
  margin: 0;
}

.sp-headline--4 .sp-headline-line--accent {
  color: var(--color-accent);
}

.sp-p4-desc {
  font-family: var(--font-body);
  font-size: var(--text-body-lg, clamp(16px, 1.2vw, 20px));
  line-height: var(--leading-relaxed);
  color: rgba(13, 11, 9, 0.55);
  text-align: center;
  max-width: 400px;
  margin: 0;
}

/* CTA button */
.sp-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: 18px 44px;
  background: var(--color-accent);
  color: var(--color-canvas-invert);
  border: none;
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-decoration: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition:
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* CTA hover sweep */
.sp-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  transition: left 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.sp-cta:hover::before {
  left: 100%;
}

.sp-cta:hover {
  box-shadow:
    0 8px 32px rgba(196, 132, 62, 0.35),
    0 2px 8px rgba(196, 132, 62, 0.2);
}

.sp-cta:focus-visible {
  outline: 2px solid var(--color-text-invert);
  outline-offset: 4px;
}

.sp-cta-label {
  position: relative;
  z-index: 1;
}

.sp-cta-arrow {
  position: relative;
  z-index: 1;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.sp-cta:hover .sp-cta-arrow {
  transform: translateX(4px);
}

/* Panel 4 meta */
.sp-p4-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-top: var(--space-8);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.sp-p4-email {
  font-family: var(--font-mono);
  font-size: var(--text-body-sm, 13px);
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-invert);
  opacity: 0.6;
}

.sp-p4-location {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-invert);
  opacity: 0.4;
}


/* ═══════════════════════════════════════
   GLOBAL OVERLAYS
   ═══════════════════════════════════════ */

/* Panel dot indicators */
.sp-dots {
  position: absolute;
  right: clamp(20px, 3vw, 40px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  pointer-events: auto;
}

.sp-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid var(--color-text-subtle);
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition:
    background 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.sp-dot--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  transform: scale(1.4);
  box-shadow: 0 0 12px var(--color-accent-muted);
}

.sp-dot:hover {
  border-color: var(--color-accent-muted);
  transform: scale(1.25);
}

.sp-dot:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

/* Panel counter */
.sp-counter {
  position: absolute;
  bottom: clamp(24px, 3vh, 40px);
  left: var(--space-section-x);
  z-index: 50;
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-family: var(--font-mono);
  mix-blend-mode: difference;
}

.sp-counter-current {
  font-size: clamp(18px, 1.5vw, 24px);
  font-weight: 500;
  color: var(--color-text);
  letter-spacing: var(--tracking-tight);
}

.sp-counter-sep {
  font-size: var(--text-label);
  color: var(--color-text-subtle);
}

.sp-counter-total {
  font-size: var(--text-label);
  color: var(--color-text-subtle);
  letter-spacing: var(--tracking-wide);
}


/* ═══════════════════════════════════════
   RESPONSIVE — MOBILE (max-width: 767px)
   ═══════════════════════════════════════ */

@media (max-width: 767px) {
  .s-sp {
    height: 400vh;
  }

  .sp-panel-content--1 {
    padding: clamp(80px, 12vh, 120px) var(--space-6) var(--space-8);
  }

  .sp-p1-stats {
    gap: var(--space-6);
  }

  .sp-stat-number {
    font-size: clamp(28px, 8vw, 40px);
  }

  .sp-stat-divider {
    height: 28px;
  }

  .sp-headline--2 {
    font-size: clamp(48px, 14vw, 80px);
  }

  .sp-process-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .sp-panel-content--3 {
    align-items: flex-start;
    padding: clamp(60px, 10vh, 100px) var(--space-6);
  }

  .sp-headline--3 {
    text-align: left;
    font-size: clamp(40px, 12vw, 64px);
  }

  .sp-work-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .sp-panel-content--4 {
    padding: clamp(60px, 10vh, 100px) var(--space-6) var(--space-6);
  }

  .sp-headline--4 {
    font-size: clamp(52px, 14vw, 80px);
  }

  .sp-p4-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .sp-dots {
    right: 12px;
    gap: var(--space-3);
  }

  .sp-dot {
    width: 6px;
    height: 6px;
  }

  .sp-tab {
    height: 60px;
  }
}


/* ═══════════════════════════════════════
   RESPONSIVE — TABLET (768px - 1279px)
   ═══════════════════════════════════════ */

@media (min-width: 768px) and (max-width: 1279px) {
  .sp-headline--1 {
    font-size: clamp(52px, 8vw, 100px);
  }

  .sp-process-grid {
    gap: var(--space-6) var(--space-8);
    max-width: 600px;
  }

  .sp-work-grid {
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: var(--space-4);
  }

  .sp-headline--4 {
    font-size: clamp(64px, 10vw, 120px);
  }
}
</style>
