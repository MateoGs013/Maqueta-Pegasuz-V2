<script setup>
/**
 * S-ArtisanWarm  |  Earthy Craft Aesthetic Hero
 * ──────────────────────────────────────────────
 * A warm, textured, handcrafted-feeling hero for
 * premium artisan brands. Think olive oil, wine,
 * artisan coffee, luxury food. Earthy tones, organic
 * shapes, generous whitespace, craft typography.
 *
 * LIGHT theme: canvas-invert background, text-invert color.
 *
 * Structure:
 *   Row 1 [72px]  — Navigation (serif logo, body nav, pill CTA)
 *   Row 2 [1fr]   — Main split (55% image | 45% text)
 *   Row 3 [52px]  — Footer strip (mono caps, dot separators)
 *
 * Signature: "Origin stamp" — circular CSS badge rotated -12deg,
 * overlapping image bottom-left. Springs in from -24deg with
 * back.out(2.2) easing.
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SArtisanWarm' })

const props = defineProps({
  eyebrow:      { type: String, default: 'Small-batch \u00B7 Handcrafted \u00B7 Est. 2019' },
  headline:     { type: String, default: 'Made with\ncare.' },
  subline:      { type: String, default: 'Nothing more.' },
  description:  { type: String, default: 'Every product is made in small batches, using traditional methods passed down through generations. No shortcuts. No compromises.' },
  ctaLabel:     { type: String, default: 'Shop the collection' },
  ctaHref:      { type: String, default: '#shop' },
  ctaSecondary:     { type: String, default: 'Our story' },
  ctaSecondaryHref: { type: String, default: '#story' },
  imageSrc:     { type: String, required: true },
  imageAlt:     { type: String, default: 'Artisan product' },
  stampYear:    { type: String, default: '2019' },
  stampTop:     { type: String, default: 'HAND\u00B7CRAFTED' },
  stampBottom:  { type: String, default: 'SINCE' },
  footerItems:  {
    type: Array,
    default: () => ['Small Batch', 'Organic', 'Handmade', 'Buenos Aires'],
  },
})

const sectionRef = ref(null)
const ctaRef = ref(null)
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

    // ── Initial hidden states ────────────────────────────────
    gsap.set(el.querySelector('.aw-image-wrap'), { autoAlpha: 0, x: -30 })
    gsap.set(el.querySelector('.aw-stamp'), { autoAlpha: 0, rotation: -24, scale: 0.8 })
    gsap.set(el.querySelector('.aw-label-tag'), { autoAlpha: 0, y: 10 })
    gsap.set(el.querySelector('.aw-eyebrow'), { autoAlpha: 0, y: 8 })
    gsap.set(el.querySelectorAll('.aw-headline-inner'), { yPercent: 108 })
    gsap.set(el.querySelector('.aw-subline'), { autoAlpha: 0, y: 8 })
    gsap.set(el.querySelector('.aw-rule'), { autoAlpha: 0 })
    gsap.set(el.querySelector('.aw-rule-line-l'), { scaleX: 0, transformOrigin: 'right center' })
    gsap.set(el.querySelector('.aw-rule-line-r'), { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(el.querySelector('.aw-description'), { autoAlpha: 0, y: 12 })
    gsap.set(el.querySelector('.aw-cta-group'), { autoAlpha: 0, y: 8 })
    gsap.set(el.querySelector('.aw-footer'), { autoAlpha: 0 })

    // ── Entrance timeline ────────────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl
      // 1. Image slides in
      .to(el.querySelector('.aw-image-wrap'), {
        autoAlpha: 1, x: 0, duration: 1.0, ease: 'power2.out',
      }, 0.2)

      // 3. Label tag
      .to(el.querySelector('.aw-label-tag'), {
        autoAlpha: 1, y: 0, duration: 0.6,
      }, 0.5)

      // 4. Stamp springs in — SIGNATURE MOMENT
      .to(el.querySelector('.aw-stamp'), {
        autoAlpha: 1,
        rotation: -12,
        scale: 1,
        duration: 1.0,
        ease: 'back.out(2.2)',
      }, 0.6)

      // 5. Eyebrow
      .to(el.querySelector('.aw-eyebrow'), {
        autoAlpha: 1, y: 0, duration: 0.6,
      }, 0.4)

      // 6. Headline reveals (line by line, masked)
      .to(el.querySelectorAll('.aw-headline-inner'), {
        yPercent: 0, stagger: 0.1, duration: 0.9, ease: 'power4.out',
      }, 0.5)

      // 7. Subline
      .to(el.querySelector('.aw-subline'), {
        autoAlpha: 1, y: 0, duration: 0.7,
      }, 0.9)

      // 8. Decorative rule — lines draw from center outward
      .to(el.querySelector('.aw-rule'), { autoAlpha: 1, duration: 0.3 }, 0.95)
      .to(el.querySelector('.aw-rule-line-l'), {
        scaleX: 1, duration: 0.7, ease: 'power3.inOut',
      }, 1.0)
      .to(el.querySelector('.aw-rule-line-r'), {
        scaleX: 1, duration: 0.7, ease: 'power3.inOut',
      }, 1.0)

      // 9. Description
      .to(el.querySelector('.aw-description'), {
        autoAlpha: 1, y: 0, duration: 0.7,
      }, 1.0)

      // 10. CTA group with slight overshoot
      .to(el.querySelector('.aw-cta-group'), {
        autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)',
      }, 1.1)

      // 11. Footer last
      .to(el.querySelector('.aw-footer'), { autoAlpha: 1, duration: 0.5 }, 1.2)

    // ── Scroll parallax — image drifts up ─────────────────
    gsap.to(el.querySelector('.aw-image'), {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // ── Scroll parallax — stamp drifts opposite ───────────
    gsap.to(el.querySelector('.aw-stamp'), {
      y: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // ── Scroll — text column subtle fade on exit ──────────
    gsap.to(el.querySelector('.aw-text-col'), {
      autoAlpha: 0.3,
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: '60% top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // ── Magnetic CTA ──────────────────────────────────────
    const ctaEl = ctaRef.value
    if (ctaEl && !isMobile) {
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
  <section
    ref="sectionRef"
    class="s-aw"
    aria-label="Hero section — artisan craft"
  >
    <!-- ── Paper-texture overlay (light bg) ─────── -->
    <div class="aw-grain" aria-hidden="true"></div>

    <!-- ── Atmospheric warm gradient (bottom) ───── -->
    <div class="aw-atmosphere" aria-hidden="true"></div>

    <!-- ── Main content grid ────────────────────── -->
    <div class="aw-main">

      <!-- IMAGE COLUMN -->
      <div class="aw-image-col">
        <!-- Label tag — rotated above image, top-right -->
        <span class="aw-label-tag" aria-hidden="true">{{ eyebrow.split('\u00B7')[0]?.trim() || 'Small-batch' }}</span>

        <!-- Image with border + rounded corners -->
        <div class="aw-image-wrap">
          <img
            :src="imageSrc"
            :alt="imageAlt"
            class="aw-image"
            width="640"
            height="800"
            loading="eager"
          />
        </div>

        <!-- ORIGIN STAMP — the signature element -->
        <div class="aw-stamp" aria-hidden="true">
          <div class="aw-stamp-ring">
            <span class="aw-stamp-top">{{ stampTop }}</span>
            <span class="aw-stamp-year">{{ stampYear }}</span>
            <span class="aw-stamp-bottom">{{ stampBottom }}</span>
          </div>
        </div>
      </div>

      <!-- TEXT COLUMN -->
      <div class="aw-text-col">
        <!-- Eyebrow -->
        <span class="aw-eyebrow">{{ eyebrow }}</span>

        <!-- Headline with overflow:hidden mask per line -->
        <h1 class="aw-headline" :aria-label="headline.replace(/\n/g, ' ')">
          <span
            v-for="(line, i) in headlineLines"
            :key="i"
            class="aw-headline-line"
          ><span class="aw-headline-inner">{{ line }}</span></span>
        </h1>

        <!-- Subline (italic, accent color) -->
        <span class="aw-subline">{{ subline }}</span>

        <!-- Decorative rule with botanical mark -->
        <div class="aw-rule" aria-hidden="true">
          <span class="aw-rule-line aw-rule-line-l"></span>
          <span class="aw-rule-mark">&#10045;</span>
          <span class="aw-rule-line aw-rule-line-r"></span>
        </div>

        <!-- Description -->
        <p class="aw-description">{{ description }}</p>

        <!-- CTA group -->
        <div class="aw-cta-group">
          <a
            ref="ctaRef"
            :href="ctaHref"
            class="aw-cta"
            data-magnetic
          >
            <span class="aw-cta-label">{{ ctaLabel }}</span>
            <svg class="aw-cta-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 13L13 3M13 3H5M13 3v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <a :href="ctaSecondaryHref" class="aw-cta-link">
            {{ ctaSecondary }}
          </a>
        </div>
      </div>
    </div>

    <!-- ── Footer strip ─────────────────────────── -->
    <footer class="aw-footer" aria-label="Product details">
      <template v-for="(item, i) in footerItems" :key="item">
        <span class="aw-footer-item">{{ item }}</span>
        <span v-if="i < footerItems.length - 1" class="aw-footer-sep" aria-hidden="true">&middot;</span>
      </template>
    </footer>
  </section>
</template>

<style scoped>
/* ──────────────────────────────────────────────────
   ROOT — LIGHT THEME
────────────────────────────────────────────────── */
.s-aw {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  min-height: 640px;
  display: grid;
  grid-template-rows: 1fr auto;
  background: var(--color-canvas-invert);
  color: var(--color-text-invert);
  overflow: hidden;
  font-family: var(--font-body);
}

/* ── Paper-texture grain overlay ──────────────── */
.aw-grain {
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  background-repeat: repeat;
  opacity: 0.06;
  pointer-events: none;
  z-index: var(--z-overlay);
  mix-blend-mode: multiply;
  animation: aw-grain 0.5s steps(6) infinite;
}
@keyframes aw-grain {
  0%, 100% { transform: translate(0, 0); }
  25%      { transform: translate(-5%, -5%); }
  50%      { transform: translate(5%, 0); }
  75%      { transform: translate(0, 5%); }
}

/* ── Warm atmospheric gradient (bottom fade) ──── */
.aw-atmosphere {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 30% 90%,
    var(--color-accent-subtle) 0%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 1;
}

/* ── Vignette pseudo-element ──────────────────── */
.s-aw::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 0%,
    transparent 40%,
    rgba(13, 11, 9, 0.04) 100%
  );
  pointer-events: none;
  z-index: 2;
}

/* ──────────────────────────────────────────────────
   MAIN GRID — 55% image | 45% text
────────────────────────────────────────────────── */
.aw-main {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  align-items: center;
  padding: var(--space-12) var(--space-section-x) var(--space-8);
  gap: var(--space-12);
  position: relative;
  z-index: var(--z-base);
}

/* ──────────────────────────────────────────────────
   IMAGE COLUMN
────────────────────────────────────────────────── */
.aw-image-col {
  position: relative;
}

/* Image container with border + rounded corners */
.aw-image-wrap {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 4 / 5;
  border: 1px solid var(--color-line-invert);
  /* Subtle layered shadow */
  box-shadow:
    0 2px 8px rgba(13, 11, 9, 0.04),
    0 16px 48px rgba(13, 11, 9, 0.08);
}

.aw-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.8s var(--ease-out);
}
.aw-image-wrap:hover .aw-image { transform: scale(1.04); }

/* Warm gradient overlay on image bottom */
.aw-image-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 60%,
    rgba(196, 132, 62, 0.12) 100%
  );
  pointer-events: none;
  border-radius: var(--radius-lg);
}

/* ── Label tag — rotated above image, top-right ── */
.aw-label-tag {
  position: absolute;
  top: -14px;
  right: var(--space-8);
  background: var(--color-canvas-invert);
  border: 1px solid var(--color-line-invert);
  padding: 6px 12px;
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-invert);
  opacity: 0.6;
  transform: rotate(2deg);
  z-index: var(--z-raised);
  white-space: nowrap;
}

/* ── ORIGIN STAMP — signature element ──────────── */
.aw-stamp {
  position: absolute;
  bottom: var(--space-8);
  left: -20px;
  width: 110px;
  height: 110px;
  transform: rotate(-12deg);
  z-index: calc(var(--z-raised) + 1);
}

.aw-stamp-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1.5px solid var(--color-text-invert);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-canvas-invert);
}

/* Inner ring */
.aw-stamp-ring::before {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  border: 1px solid var(--color-text-invert);
  opacity: 0.35;
}

/* Decorative dots inside inner ring */
.aw-stamp-ring::after {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 50%;
  border: 1px dashed rgba(13, 11, 9, 0.15);
}

.aw-stamp-year {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text-invert);
  position: relative;
  z-index: 1;
}

.aw-stamp-top {
  position: absolute;
  width: 100%;
  text-align: center;
  top: 10px;
  font-family: var(--font-mono);
  font-size: 7px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-text-invert);
}

.aw-stamp-bottom {
  position: absolute;
  width: 100%;
  text-align: center;
  bottom: 12px;
  font-family: var(--font-mono);
  font-size: 7px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-text-invert);
}

/* ──────────────────────────────────────────────────
   TEXT COLUMN
────────────────────────────────────────────────── */
.aw-text-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-16) 0 var(--space-8);
}

.aw-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-accent);
}

.aw-headline {
  font-family: var(--font-serif);
  font-size: var(--text-hero);
  font-weight: 300;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text-invert);
  white-space: pre-line;
  margin: 0;
}

.aw-headline-line {
  display: block;
  overflow: hidden;
  clip-path: inset(0 0 0 0);
}

.aw-headline-inner {
  display: block;
}

.aw-subline {
  font-family: var(--font-serif);
  font-size: var(--text-heading);
  font-weight: 300;
  font-style: italic;
  letter-spacing: var(--tracking-tight);
  color: var(--color-accent);
  margin-top: calc(-1 * var(--space-4));
}

/* ── Decorative rule with botanical mark ──────── */
.aw-rule {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  color: var(--color-text-invert);
  opacity: 0.25;
  max-width: 320px;
}

.aw-rule-line {
  flex: 1;
  height: 1px;
  background: currentColor;
}

.aw-rule-mark {
  font-family: var(--font-serif);
  font-size: 18px;
  line-height: 1;
  color: var(--color-accent);
  opacity: 1;
}

.aw-description {
  font-family: var(--font-serif);
  font-size: clamp(16px, 1.2vw, 20px);
  font-weight: 400;
  line-height: var(--leading-relaxed);
  color: rgba(13, 11, 9, 0.65);
  max-width: 340px;
  font-style: italic;
}

/* ──────────────────────────────────────────────────
   CTA GROUP
────────────────────────────────────────────────── */
.aw-cta-group {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  flex-wrap: wrap;
  padding-top: var(--space-4);
}

.aw-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: var(--color-text-invert);
  color: var(--color-canvas-invert);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border: none;
  min-height: 44px;
  transition: background 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
}
.aw-cta:hover {
  background: var(--color-accent);
  color: var(--color-canvas-invert);
  box-shadow:
    0 4px 12px rgba(196, 132, 62, 0.2),
    0 12px 36px rgba(196, 132, 62, 0.15);
}
.aw-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.aw-cta-arrow {
  transition: transform 0.3s var(--ease-out);
}
.aw-cta:hover .aw-cta-arrow { transform: translateX(3px) translateY(-2px); }

.aw-cta-link {
  font-family: var(--font-serif);
  font-size: var(--text-body-sm);
  font-style: italic;
  color: rgba(13, 11, 9, 0.6);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid rgba(13, 11, 9, 0.2);
  padding-bottom: 2px;
  min-height: 44px;
  transition: border-color 0.3s var(--ease-out), color 0.3s var(--ease-out);
}
.aw-cta-link:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
.aw-cta-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

/* ──────────────────────────────────────────────────
   FOOTER STRIP
────────────────────────────────────────────────── */
.aw-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: 0 var(--space-section-x);
  height: 52px;
  border-top: 1px solid var(--color-line-invert);
  font-family: var(--font-mono);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: rgba(13, 11, 9, 0.4);
}

.aw-footer-sep {
  opacity: 0.5;
}

/* ──────────────────────────────────────────────────
   RESPONSIVE — TABLET (768px–1279px)
────────────────────────────────────────────────── */
@media (max-width: 1279px) and (min-width: 768px) {
  .aw-main {
    grid-template-columns: 50fr 50fr;
    gap: var(--space-8);
    padding: var(--space-8) var(--space-section-x);
  }

  .aw-text-col {
    padding: var(--space-8) 0;
  }

  .aw-stamp {
    width: 90px;
    height: 90px;
    left: -12px;
  }

  .aw-stamp-year { font-size: 16px; }
}

/* ──────────────────────────────────────────────────
   RESPONSIVE — MOBILE (< 768px)
────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .s-aw {
    height: auto;
    min-height: 100vh;
    min-height: 100svh;
  }

  .aw-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    padding: var(--space-8) var(--space-section-x);
    gap: var(--space-8);
  }

  .aw-image-col { order: -1; }

  .aw-image-wrap {
    aspect-ratio: 16 / 9;
  }

  .aw-stamp {
    width: 80px;
    height: 80px;
    bottom: var(--space-4);
    left: var(--space-4);
  }
  .aw-stamp-year { font-size: 14px; }
  .aw-stamp-top,
  .aw-stamp-bottom { font-size: 6px; }

  .aw-headline {
    font-size: clamp(48px, 12vw, 96px);
  }

  .aw-subline {
    font-size: clamp(22px, 6vw, 36px);
  }

  .aw-text-col {
    padding: 0;
    gap: var(--space-4);
  }

  .aw-label-tag {
    top: -10px;
    right: var(--space-4);
    font-size: 9px;
    padding: 4px 8px;
  }

  .aw-footer {
    flex-wrap: wrap;
    height: auto;
    padding: var(--space-4) var(--space-section-x);
    gap: 8px;
    justify-content: center;
  }

  .aw-cta-group {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ──────────────────────────────────────────────────
   DESKTOP FINE-TUNING (1280px+)
────────────────────────────────────────────────── */
@media (min-width: 1280px) {
  .aw-stamp {
    width: 120px;
    height: 120px;
    left: -28px;
    bottom: var(--space-12);
  }
  .aw-stamp-year { font-size: 22px; }
  .aw-stamp-top { top: 12px; font-size: 7.5px; }
  .aw-stamp-bottom { bottom: 14px; font-size: 7.5px; }
}

/* ──────────────────────────────────────────────────
   LARGE SCREENS (1440px+)
────────────────────────────────────────────────── */
@media (min-width: 1440px) {
  .aw-main {
    gap: var(--space-16);
  }

  .aw-text-col {
    padding: var(--space-20) 0 var(--space-12);
  }
}
</style>
