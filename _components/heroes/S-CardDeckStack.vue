<script setup>
/**
 * S-CardDeckStack  |  Card Deck Stack Hero
 * ───────────────────────────────────────────────
 * Cinematic hero where 6 service cards start perfectly stacked
 * as a deck, then fan out in a dramatic arc with a shuffle jitter
 * pre-animation. Cards spread across the viewport in an asymmetric
 * arc with distinct rotations, creating a magician-spreading-cards feel.
 *
 * Structure:
 *   Left column  — Headline area (eyebrow + serif/display title + CTA)
 *   Full width   — Card deck area with absolute-positioned cards
 *
 * Signature: "The Grand Reveal"
 * Cards start stacked -> shuffle jitter -> fan spread with back.out easing
 * Each card has unique bg treatment, rotation, and y-offset in the arc.
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SCardDeckStack' })

const sectionRef = ref(null)
const ctaRef = ref(null)
const deckRef = ref(null)
const cardRefs = ref([])
let mm = null

/* ── Card data ────────────────────────────── */
const cards = [
  {
    id: 1,
    label: '001',
    title: 'Brand Identity',
    desc: 'Visual systems that define and distinguish.',
    tag: 'Branding',
    variant: 'accent-gradient',
  },
  {
    id: 2,
    label: '002',
    title: 'Web Design',
    desc: 'Digital experiences with purpose and craft.',
    tag: 'Design',
    variant: 'dark-glass',
  },
  {
    id: 3,
    label: '003',
    title: 'Motion Design',
    desc: 'Bringing interfaces to life through movement.',
    tag: 'Motion',
    variant: 'charcoal',
  },
  {
    id: 4,
    label: '004',
    title: 'Strategy',
    desc: 'Positioning that creates market advantage.',
    tag: 'Consulting',
    variant: 'warm-brown',
  },
  {
    id: 5,
    label: '005',
    title: 'Development',
    desc: 'Clean architecture, performant execution.',
    tag: 'Engineering',
    variant: 'code',
  },
  {
    id: 6,
    label: '006',
    title: 'Direction',
    desc: 'Creative leadership from concept to delivery.',
    tag: 'Creative',
    variant: 'near-black',
  },
]

/* ── Arc layout: x% from center, y offset, rotation ── */
const arcLayout = [
  { xPct: -38, y: 0,   rot: -8  },
  { xPct: -22, y: -24, rot: -4  },
  { xPct: -6,  y: -38, rot: -1  },
  { xPct: 10,  y: -38, rot: 2   },
  { xPct: 26,  y: -24, rot: 5   },
  { xPct: 42,  y: 0,   rot: 9   },
]

/* ── Track whether fan has completed ─────── */
const fanComplete = ref(false)
/* ── Store resolved fan positions per breakpoint ── */
const resolvedPositions = ref([])

/* ── Hover handlers ──────────────────────── */
function onCardEnter(i) {
  if (!fanComplete.value || !cardRefs.value[i] || !resolvedPositions.value[i]) return
  const el = cardRefs.value[i]
  const pos = resolvedPositions.value[i]

  gsap.to(el, {
    y: pos.y - 24,
    rotation: 0,
    scale: 1.06,
    boxShadow: '0 28px 56px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,132,62,0.18)',
    duration: 0.4,
    ease: 'back.out(1.4)',
    overwrite: 'auto',
  })

  // Push neighbors away
  cardRefs.value.forEach((card, j) => {
    if (j !== i && card) {
      const push = j < i ? -12 : 12
      gsap.to(card, {
        x: `+=${push}`,
        autoAlpha: 0.7,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  })
}

function onCardLeave(i) {
  if (!fanComplete.value) return

  cardRefs.value.forEach((card, j) => {
    if (!card || !resolvedPositions.value[j]) return
    const pos = resolvedPositions.value[j]
    gsap.to(card, {
      x: 0,
      y: pos.y,
      rotation: pos.rot,
      scale: 1,
      autoAlpha: 1,
      boxShadow: `0 ${4 + j * 3}px ${14 + j * 5}px rgba(0,0,0,${0.12 + j * 0.04})`,
      duration: 0.6,
      ease: 'back.out(1.4)',
      overwrite: 'auto',
    })
  })
}

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
    const { reduceMotion, isMobile, isTablet } = context.conditions
    if (reduceMotion) return

    /* ── Initial states ──────────────────────── */
    gsap.set(el.querySelector('.cds-eyebrow'), { autoAlpha: 0, y: 14 })
    gsap.set(el.querySelectorAll('.cds-headline-word'), { autoAlpha: 0, y: 50 })
    gsap.set(el.querySelector('.cds-cta-wrap'), { autoAlpha: 0, y: 18 })
    gsap.set(el.querySelector('.cds-line'), { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(el.querySelector('.cds-watermark'), { autoAlpha: 0, scale: 0.96 })
    gsap.set(el.querySelector('.cds-clip-reveal'), { clipPath: 'inset(0 100% 0 0)' })

    // Cards: all stacked at the same position (center of deck)
    const cardEls = el.querySelectorAll('.cds-card')
    cardEls.forEach((card, i) => {
      gsap.set(card, {
        xPercent: -50,
        yPercent: -50,
        left: '50%',
        top: '50%',
        x: i * 2,       // Slight stack offset
        y: i * 2,
        rotation: 0,
        autoAlpha: 1 - (i * 0.01),
        scale: 1 - (i * 0.008),
        boxShadow: `0 ${1 + i}px ${4 + i * 2}px rgba(0,0,0,${0.08 + i * 0.02})`,
      })
    })

    /* ── Entry timeline ──────────────────────── */
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      delay: 0.3,
    })

    // Headline reveals (5 different delay values)
    tl
      .to(el.querySelector('.cds-eyebrow'), {
        autoAlpha: 1, y: 0, duration: 0.6,
      }, 0)
      .to(el.querySelectorAll('.cds-headline-word'), {
        autoAlpha: 1, y: 0, stagger: 0.12, duration: 1.0, ease: 'power4.out',
      }, 0.12)
      .to(el.querySelector('.cds-line'), {
        scaleX: 1, duration: 1.2, ease: 'power3.inOut',
      }, 0.35)
      .to(el.querySelector('.cds-cta-wrap'), {
        autoAlpha: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)',
      }, 0.55)
      .to(el.querySelector('.cds-watermark'), {
        autoAlpha: 0.04, scale: 1, duration: 1.6, ease: 'power2.out',
      }, 0.2)
      .to(el.querySelector('.cds-clip-reveal'), {
        clipPath: 'inset(0 0% 0 0)', duration: 1.4, ease: 'power3.inOut',
      }, 0.4)

    /* ── SIGNATURE: "The Grand Reveal" ─────── */
    // Step A: Shuffle jitter — brief card chaos before the fan
    const shuffleTl = gsap.timeline({ delay: 0.55 })
    cardEls.forEach((card, i) => {
      shuffleTl.to(card, {
        x: (i * 2) + gsap.utils.random(-7, 7),
        y: (i * 2) + gsap.utils.random(-5, 5),
        rotation: gsap.utils.random(-4, 4),
        duration: 0.08,
        ease: 'none',
      }, i * 0.03)
    })

    // Step B: Fan spread — cards fly to their arc positions
    // Store resolved positions for hover/unhover
    const fanBaseDelay = 0.75
    const positions = []

    cardEls.forEach((card, i) => {
      const pos = arcLayout[i]
      let resolvedY, resolvedRot

      if (isMobile) {
        const mobileRot = gsap.utils.random(-3, 3)
        resolvedY = 0
        resolvedRot = mobileRot
        positions[i] = { y: resolvedY, rot: resolvedRot }

        const col = i % 2
        const row = Math.floor(i / 2)
        gsap.to(card, {
          left: col === 0 ? '30%' : '70%',
          top: `${25 + row * 28}%`,
          x: 0,
          y: resolvedY,
          rotation: resolvedRot,
          autoAlpha: i < 4 ? 1 : 0.5,
          scale: 1,
          duration: 1.0,
          ease: 'back.out(1.2)',
          delay: fanBaseDelay + i * 0.06,
          onComplete: i === Math.min(3, cardEls.length - 1) ? () => {
            fanComplete.value = true
            resolvedPositions.value = positions
          } : undefined,
        })
      } else if (isTablet) {
        resolvedY = pos.y * 0.65
        resolvedRot = pos.rot * 0.6
        positions[i] = { y: resolvedY, rot: resolvedRot }

        gsap.to(card, {
          left: `${50 + pos.xPct * 0.7}%`,
          top: '50%',
          x: 0,
          y: resolvedY,
          rotation: resolvedRot,
          autoAlpha: 1,
          scale: 1,
          duration: 1.1,
          ease: 'back.out(1.2)',
          delay: fanBaseDelay + i * 0.07,
          boxShadow: `0 ${4 + i * 2}px ${14 + i * 4}px rgba(0,0,0,${0.12 + i * 0.04})`,
          onComplete: i === cardEls.length - 1 ? () => {
            fanComplete.value = true
            resolvedPositions.value = positions
          } : undefined,
        })
      } else {
        resolvedY = pos.y
        resolvedRot = pos.rot
        positions[i] = { y: resolvedY, rot: resolvedRot }

        gsap.to(card, {
          left: `${50 + pos.xPct}%`,
          top: '50%',
          x: 0,
          y: resolvedY,
          rotation: resolvedRot,
          autoAlpha: 1,
          scale: 1,
          duration: 1.2,
          ease: 'back.out(1.2)',
          delay: fanBaseDelay + i * 0.08,
          boxShadow: `0 ${4 + i * 3}px ${14 + i * 5}px rgba(0,0,0,${0.12 + i * 0.04})`,
          onComplete: i === cardEls.length - 1 ? () => {
            fanComplete.value = true
            resolvedPositions.value = positions
          } : undefined,
        })
      }
    })

    /* ── Scroll parallax ─────────────────────── */
    // Deck drifts upward
    gsap.to(el.querySelector('.cds-deck'), {
      y: -80,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // Individual cards at varying rates
    cardEls.forEach((card, i) => {
      gsap.to(card, {
        y: `+=${-15 + (i % 3) * 12}`,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      })
    })

    // Headline content drifts slower
    gsap.to(el.querySelector('.cds-content'), {
      y: -45,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // Glow color shift on scroll
    gsap.to(el, {
      '--glow-offset': '-60%',
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    /* ── Magnetic CTA ────────────────────────── */
    const ctaEl = ctaRef.value
    if (ctaEl && !isMobile) {
      const xTo = gsap.quickTo(ctaEl, 'x', { duration: 0.5, ease: 'power3.out' })
      const yTo = gsap.quickTo(ctaEl, 'y', { duration: 0.5, ease: 'power3.out' })

      const handleMove = (e) => {
        const r = ctaEl.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.3)
        yTo((e.clientY - r.top - r.height / 2) * 0.3)
      }
      const handleLeave = () => { xTo(0); yTo(0) }

      ctaEl.addEventListener('mousemove', handleMove)
      ctaEl.addEventListener('mouseleave', handleLeave)

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
  <section ref="sectionRef" class="s-cds" aria-label="Hero: Card Deck Stack — Our Services">

    <!-- Atmospheric glow -->
    <div class="cds-glow" aria-hidden="true"></div>

    <!-- Giant watermark text -->
    <div class="cds-watermark" aria-hidden="true">CRAFT</div>

    <!-- Clip-path reveal element (decorative line bar) -->
    <div class="cds-clip-reveal" aria-hidden="true"></div>

    <!-- Main layout: content left + deck right/center -->
    <div class="cds-layout">

      <!-- LEFT: Headline content area -->
      <div class="cds-content">
        <span class="cds-eyebrow">Our Services</span>

        <h1 class="cds-headline">
          <span class="cds-headline-word cds-headline-word--serif">What we</span>
          <span class="cds-headline-word cds-headline-word--display">do best</span>
        </h1>

        <!-- Decorative line -->
        <div class="cds-line" aria-hidden="true"></div>

        <div class="cds-cta-wrap">
          <a
            ref="ctaRef"
            href="#work"
            class="cds-cta"
            data-magnetic
          >
            <span class="cds-cta-label">See all work</span>
            <span class="cds-cta-arrow" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 9h9M9.5 5l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </a>
        </div>
      </div>

      <!-- RIGHT: Card deck area (absolute positioned cards) -->
      <div ref="deckRef" class="cds-deck">
        <div
          v-for="(card, i) in cards"
          :key="card.id"
          :ref="el => { if (el) cardRefs[i] = el }"
          :class="['cds-card', `cds-card--${card.variant}`]"
          :style="{ zIndex: 10 + (cards.length - i) }"
          @mouseenter="onCardEnter(i)"
          @mouseleave="onCardLeave(i)"
          role="article"
          :aria-label="`Service: ${card.title}`"
          tabindex="0"
        >
          <!-- Card top-left label -->
          <span class="cds-card-label">{{ card.label }}</span>

          <!-- Card icon / decorative element -->
          <div class="cds-card-icon" aria-hidden="true">
            <template v-if="card.variant === 'accent-gradient'">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="15" stroke="currentColor" stroke-width="1"/>
                <line x1="22" y1="7" x2="22" y2="37" stroke="currentColor" stroke-width="1"/>
              </svg>
            </template>
            <template v-else-if="card.variant === 'dark-glass'">
              <svg width="44" height="36" viewBox="0 0 44 36" fill="none">
                <rect x="1" y="1" width="42" height="34" rx="3" stroke="currentColor" stroke-width="1"/>
                <line x1="1" y1="9" x2="43" y2="9" stroke="currentColor" stroke-width="1"/>
                <circle cx="6" cy="5" r="1.5" fill="currentColor" opacity="0.4"/>
                <circle cx="11" cy="5" r="1.5" fill="currentColor" opacity="0.4"/>
                <rect x="5" y="14" width="14" height="7" rx="1" stroke="currentColor" stroke-width="0.7" opacity="0.5"/>
                <line x1="5" y1="27" x2="38" y2="27" stroke="currentColor" stroke-width="0.7" opacity="0.3"/>
              </svg>
            </template>
            <template v-else-if="card.variant === 'charcoal'">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="11" cy="22" r="3" fill="currentColor" opacity="0.6"/>
                <circle cx="22" cy="22" r="3" fill="currentColor" opacity="0.4"/>
                <circle cx="33" cy="22" r="3" fill="currentColor" opacity="0.2"/>
                <circle cx="11" cy="11" r="1.5" fill="currentColor" opacity="0.15"/>
                <circle cx="33" cy="33" r="1.5" fill="currentColor" opacity="0.15"/>
              </svg>
            </template>
            <template v-else-if="card.variant === 'warm-brown'">
              <span class="cds-card-bigtext">IV</span>
            </template>
            <template v-else-if="card.variant === 'code'">
              <span class="cds-card-code">
                <span class="cds-code-line"><span class="cds-code-kw">const</span> build <span class="cds-code-op">=</span></span>
                <span class="cds-code-line">&nbsp;&nbsp;<span class="cds-code-fn">craft</span>(vision)</span>
              </span>
            </template>
            <template v-else-if="card.variant === 'near-black'">
              <span class="cds-card-number">06</span>
            </template>
          </div>

          <!-- Card title -->
          <h3 class="cds-card-title">{{ card.title }}</h3>

          <!-- Card description -->
          <p class="cds-card-desc">{{ card.desc }}</p>

          <!-- Card bottom: accent dot + tag -->
          <div class="cds-card-footer">
            <span class="cds-card-dot" aria-hidden="true"></span>
            <span class="cds-card-tag">{{ card.tag }}</span>
          </div>

          <!-- Card pattern overlay (per-variant) -->
          <div class="cds-card-pattern" aria-hidden="true"></div>
        </div>
      </div>
    </div>

    <!-- Bottom accent strip -->
    <div class="cds-strip" aria-hidden="true"></div>

  </section>
</template>

<style scoped>
/* ────────────────────────────────────────────
   BASE SECTION
──────────────────────────────────────────── */
.s-cds {
  --glow-offset: -50%;
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--color-canvas);
  color: var(--color-text);
  overflow: hidden;
  padding: clamp(100px, 14vh, 180px) var(--space-section-x) clamp(60px, 8vh, 100px);
}

/* Atmospheric pseudo-element: subtle top-down gradient */
.s-cds::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(196, 132, 62, 0.03) 0%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* Grain overlay */
.s-cds::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: cds-grain 0.5s steps(6) infinite;
}

@keyframes cds-grain {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5%, -5%); }
  50% { transform: translate(5%, 0); }
  75% { transform: translate(0, 5%); }
}


/* ────────────────────────────────────────────
   ATMOSPHERIC GLOW
──────────────────────────────────────────── */
.cds-glow {
  position: absolute;
  top: 50%;
  left: 62%;
  transform: translate(-50%, var(--glow-offset));
  width: 55vw;
  height: 55vw;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(196, 132, 62, 0.07) 0%,
    rgba(196, 132, 62, 0.025) 40%,
    transparent 70%
  );
  filter: blur(50px);
  pointer-events: none;
  z-index: var(--z-base);
}


/* ────────────────────────────────────────────
   WATERMARK (giant background text at ~4% opacity)
──────────────────────────────────────────── */
.cds-watermark {
  position: absolute;
  top: 48%;
  left: 50%;
  transform: translate(-50%, -55%);
  font-family: var(--font-display);
  font-size: clamp(160px, 22vw, 400px);
  font-weight: 700;
  letter-spacing: var(--tracking-wider);
  color: var(--color-text);
  pointer-events: none;
  z-index: 1;
  user-select: none;
  white-space: nowrap;
}


/* ────────────────────────────────────────────
   CLIP-PATH REVEAL BAR (decorative)
──────────────────────────────────────────── */
.cds-clip-reveal {
  position: absolute;
  bottom: 18%;
  left: var(--space-section-x);
  width: calc(100% - var(--space-section-x) * 2);
  height: 1px;
  background: linear-gradient(
    to right,
    var(--color-accent-subtle),
    var(--color-accent-muted),
    var(--color-accent-subtle)
  );
  z-index: 2;
}


/* ────────────────────────────────────────────
   MAIN LAYOUT — asymmetric 0.6fr 1fr grid
──────────────────────────────────────────── */
.cds-layout {
  position: relative;
  z-index: var(--z-raised);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-gap-lg);
  align-items: center;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

@media (min-width: 1280px) {
  .cds-layout {
    grid-template-columns: 0.55fr 1fr;
    gap: var(--space-gap-xl);
  }
}

@media (min-width: 768px) and (max-width: 1279px) {
  .cds-layout {
    grid-template-columns: 0.6fr 1fr;
    gap: var(--space-gap-lg);
  }
}


/* ────────────────────────────────────────────
   HEADLINE CONTENT (left column)
──────────────────────────────────────────── */
.cds-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  text-align: left;
}

/* Eyebrow */
.cds-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-accent);
  display: inline-block;
}

/* Headline */
.cds-headline {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.cds-headline-word {
  display: block;
  line-height: var(--leading-tight);
}

.cds-headline-word--serif {
  font-family: var(--font-serif);
  font-size: clamp(44px, 5.5vw, 78px);
  font-weight: 300;
  font-style: italic;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.cds-headline-word--display {
  font-family: var(--font-display);
  font-size: clamp(48px, 6vw, 84px);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

/* Decorative line */
.cds-line {
  width: clamp(50px, 8vw, 110px);
  height: 2px;
  background: linear-gradient(
    to right,
    var(--color-accent),
    var(--color-accent-muted)
  );
  border-radius: var(--radius-pill);
  margin-top: var(--space-2);
}

/* CTA wrap */
.cds-cta-wrap {
  margin-top: var(--space-3);
}

.cds-cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: 14px 28px;
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition:
    background 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* CTA shimmer sweep */
.cds-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(196, 132, 62, 0.12) 50%,
    transparent 100%
  );
  transition: left 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.cds-cta:hover::before {
  left: 100%;
}

.cds-cta:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-canvas);
  box-shadow:
    0 8px 32px rgba(196, 132, 62, 0.3),
    0 2px 8px rgba(196, 132, 62, 0.15);
}

.cds-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.cds-cta-arrow {
  display: flex;
  align-items: center;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.cds-cta:hover .cds-cta-arrow {
  transform: translateX(5px);
}


/* ────────────────────────────────────────────
   CARD DECK AREA — relative container for
   absolutely positioned cards
──────────────────────────────────────────── */
.cds-deck {
  position: relative;
  width: 100%;
  min-height: clamp(340px, 42vw, 500px);
}


/* ────────────────────────────────────────────
   INDIVIDUAL CARD — absolutely positioned
──────────────────────────────────────────── */
.cds-card {
  position: absolute;
  width: clamp(160px, 18vw, 240px);
  aspect-ratio: 1 / 1.4;
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--color-line);
}

/* Card variants */
.cds-card--accent-gradient {
  background: linear-gradient(
    135deg,
    rgba(196, 132, 62, 0.22) 0%,
    rgba(196, 132, 62, 0.06) 55%,
    var(--color-canvas-alt) 100%
  );
  border-color: rgba(196, 132, 62, 0.15);
}

.cds-card--dark-glass {
  background: var(--color-surface);
  backdrop-filter: var(--blur-glass);
  -webkit-backdrop-filter: var(--blur-glass);
  border-color: var(--color-line-strong);
}

.cds-card--charcoal {
  background: linear-gradient(160deg, #1a1917 0%, #12110f 100%);
  border-color: rgba(255, 255, 255, 0.05);
}

.cds-card--warm-brown {
  background: linear-gradient(145deg, #2a1a0a 0%, #1a1008 100%);
  border-color: rgba(196, 132, 62, 0.1);
}

.cds-card--code {
  background: linear-gradient(150deg, #0e0e12 0%, #0a0a0f 100%);
  border-color: rgba(255, 255, 255, 0.06);
}

.cds-card--near-black {
  background: linear-gradient(155deg, #0c0b0a 0%, #080706 100%);
  border-color: rgba(255, 255, 255, 0.04);
}

.cds-card:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}


/* ────────────────────────────────────────────
   CARD PATTERN OVERLAYS
──────────────────────────────────────────── */
.cds-card-pattern {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.45;
}

.cds-card--dark-glass .cds-card-pattern {
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 18px 18px;
}

.cds-card--charcoal .cds-card-pattern {
  background-image: radial-gradient(
    circle at 50% 50%,
    rgba(255,255,255,0.06) 1px,
    transparent 1px
  );
  background-size: 12px 12px;
}


/* ────────────────────────────────────────────
   CARD INNER ELEMENTS
──────────────────────────────────────────── */
.cds-card-label {
  font-family: var(--font-mono);
  font-size: var(--text-label-sm);
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-subtle);
  position: relative;
  z-index: 1;
}

.cds-card-icon {
  position: relative;
  z-index: 1;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  min-height: 44px;
}

.cds-card-bigtext {
  font-family: var(--font-serif);
  font-size: clamp(32px, 3.5vw, 48px);
  font-weight: 300;
  font-style: italic;
  letter-spacing: var(--tracking-tight);
  line-height: 1;
  color: var(--color-text-subtle);
}

.cds-card-code {
  font-family: var(--font-mono);
  font-size: var(--text-label-sm);
  line-height: 1.8;
  display: flex;
  flex-direction: column;
}

.cds-code-line { white-space: nowrap; }
.cds-code-kw { color: var(--color-accent-muted); }
.cds-code-op { color: var(--color-text-subtle); }
.cds-code-fn { color: var(--color-accent); }

.cds-card-number {
  font-family: var(--font-serif);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 300;
  font-style: italic;
  letter-spacing: var(--tracking-tight);
  line-height: 1;
  color: var(--color-text-subtle);
}

.cds-card-title {
  font-family: var(--font-display);
  font-size: clamp(14px, 1.4vw, 19px);
  font-weight: 500;
  letter-spacing: var(--tracking-normal);
  line-height: var(--leading-snug);
  margin: 0;
  position: relative;
  z-index: 1;
  transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.cds-card:hover .cds-card-title {
  color: var(--color-text);
}

.cds-card-desc {
  font-family: var(--font-body);
  font-size: var(--text-label);
  line-height: var(--leading-relaxed);
  color: var(--color-text-muted);
  margin: 0;
  position: relative;
  z-index: 1;
}

.cds-card-footer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  position: relative;
  z-index: 1;
}

.cds-card-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-accent);
  transition: box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.cds-card:hover .cds-card-dot {
  box-shadow: 0 0 10px 3px var(--color-accent-muted);
}

.cds-card-tag {
  font-family: var(--font-mono);
  font-size: var(--text-label-sm);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}


/* ────────────────────────────────────────────
   BOTTOM ACCENT STRIP
──────────────────────────────────────────── */
.cds-strip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--color-accent-muted) 20%,
    var(--color-accent) 50%,
    var(--color-accent-muted) 80%,
    transparent 100%
  );
  z-index: var(--z-raised);
}


/* ────────────────────────────────────────────
   RESPONSIVE — TABLET
──────────────────────────────────────────── */
@media (min-width: 768px) and (max-width: 1279px) {
  .s-cds {
    padding-top: clamp(80px, 10vh, 130px);
    padding-bottom: clamp(50px, 6vh, 80px);
  }

  .cds-headline-word--serif {
    font-size: clamp(36px, 5vw, 56px);
  }

  .cds-headline-word--display {
    font-size: clamp(40px, 5.5vw, 60px);
  }

  .cds-card {
    width: clamp(140px, 16vw, 200px);
  }

  .cds-deck {
    min-height: clamp(280px, 38vw, 420px);
  }
}


/* ────────────────────────────────────────────
   RESPONSIVE — MOBILE
──────────────────────────────────────────── */
@media (max-width: 767px) {
  .s-cds {
    padding-top: clamp(80px, 14vh, 120px);
    padding-bottom: clamp(40px, 6vh, 60px);
  }

  .cds-content {
    text-align: center;
    align-items: center;
  }

  .cds-headline-word--serif {
    font-size: clamp(34px, 9vw, 48px);
  }

  .cds-headline-word--display {
    font-size: clamp(38px, 10vw, 52px);
  }

  .cds-line {
    margin: 0 auto;
  }

  .cds-deck {
    min-height: clamp(300px, 80vw, 420px);
  }

  .cds-card {
    width: clamp(130px, 36vw, 160px);
  }

  .cds-watermark {
    font-size: clamp(80px, 20vw, 160px);
  }

  .cds-clip-reveal {
    bottom: 10%;
  }

  /* Hide last 2 cards on mobile */
  .cds-card:nth-child(n+5) {
    display: none;
  }
}
</style>
