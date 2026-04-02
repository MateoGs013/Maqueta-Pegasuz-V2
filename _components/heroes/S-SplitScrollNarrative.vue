<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SSplitScrollNarrative' })

const sectionRef = ref(null)
const leftPanelRef = ref(null)
const progressLineRef = ref(null)
const progressDotRef = ref(null)
const glowBlobRef = ref(null)
const dividerRef = ref(null)

// Left panel text state refs
const state1Ref = ref(null)
const state2Ref = ref(null)
const state3Ref = ref(null)

// Right panel section refs
const rightSection1Ref = ref(null)
const rightSection2Ref = ref(null)
const rightSection3Ref = ref(null)

// Magnetic CTA
const ctaRef = ref(null)
let xTo = null
let yTo = null

let mm = null

function updateLeft(progress) {
  if (!state1Ref.value || !state2Ref.value || !state3Ref.value) return
  if (!glowBlobRef.value || !progressDotRef.value) return

  // State crossfade logic
  let s1 = 0, s2 = 0, s3 = 0

  if (progress < 0.25) {
    s1 = 1
  } else if (progress < 0.33) {
    const t = (progress - 0.25) / 0.08
    s1 = 1 - t
    s2 = t
  } else if (progress < 0.58) {
    s2 = 1
  } else if (progress < 0.66) {
    const t = (progress - 0.58) / 0.08
    s2 = 1 - t
    s3 = t
  } else {
    s3 = 1
  }

  gsap.set(state1Ref.value, { autoAlpha: s1 })
  gsap.set(state2Ref.value, { autoAlpha: s2 })
  gsap.set(state3Ref.value, { autoAlpha: s3 })

  // Progress dot moves top to bottom
  gsap.set(progressDotRef.value, { yPercent: progress * 100 * 3.6 })

  // Glow blob drifts: bottom-left -> center -> top-right (transform-based)
  const glowXPercent = gsap.utils.interpolate(-40, 50, progress)
  const glowYPercent = gsap.utils.interpolate(30, -70, progress)
  gsap.set(glowBlobRef.value, {
    xPercent: glowXPercent,
    yPercent: glowYPercent
  })

  // Grain opacity pulse: 0.03 -> 0.05 at transitions
  const grainEl = sectionRef.value?.querySelector('.s-split__grain')
  if (grainEl) {
    const dist1 = Math.abs(progress - 0.33)
    const dist2 = Math.abs(progress - 0.66)
    const minDist = Math.min(dist1, dist2)
    const grainOpacity = 0.03 + (1 - Math.min(minDist / 0.08, 1)) * 0.02
    gsap.set(grainEl, { opacity: grainOpacity })
  }
}

onMounted(() => {
  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 1280px)',
    isTablet: '(min-width: 768px) and (max-width: 1279px)',
    isMobile: '(max-width: 767px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { isDesktop, isTablet, isMobile, reduceMotion } = context.conditions

    // Set initial left panel state
    gsap.set(state1Ref.value, { autoAlpha: 1 })
    gsap.set(state2Ref.value, { autoAlpha: 0 })
    gsap.set(state3Ref.value, { autoAlpha: 0 })

    if (reduceMotion) return

    // --- ENTRANCE ANIMATIONS ---

    // Left panel headline reveal (state 1 words)
    const state1Words = state1Ref.value?.querySelectorAll('.s-split__word')
    if (state1Words?.length) {
      gsap.from(state1Words, {
        yPercent: 110,
        autoAlpha: 0,
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.2
      })
    }

    // Progress line draws in
    if (progressLineRef.value && !isMobile) {
      gsap.from(progressLineRef.value, {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 1.4,
        ease: 'power4.out',
        delay: 0.5
      })
    }

    // Progress dot fades in
    if (progressDotRef.value && !isMobile) {
      gsap.from(progressDotRef.value, {
        autoAlpha: 0,
        scale: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
        delay: 1.0
      })
    }

    // Divider line
    if (dividerRef.value && !isMobile) {
      gsap.from(dividerRef.value, {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: 1.6,
        ease: 'power3.inOut',
        delay: 0.3
      })
    }

    // Glow blob entrance
    if (glowBlobRef.value) {
      gsap.from(glowBlobRef.value, {
        autoAlpha: 0,
        scale: 0.5,
        duration: 2,
        ease: 'power2.out',
        delay: 0.4
      })
    }

    // Right panel section 1 items stagger
    const s1Items = rightSection1Ref.value?.querySelectorAll('.s-split__r-item')
    if (s1Items?.length) {
      gsap.from(s1Items, {
        y: 30,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.6
      })
    }

    // Right panel section 2 entrance
    const s2Items = rightSection2Ref.value?.querySelectorAll('.s-split__r-item')
    if (s2Items?.length) {
      gsap.from(s2Items, {
        y: 40,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: rightSection2Ref.value,
          start: 'top 80%',
          once: true
        }
      })
    }

    // Right panel section 3 entrance
    const s3Items = rightSection3Ref.value?.querySelectorAll('.s-split__r-item')
    if (s3Items?.length) {
      gsap.from(s3Items, {
        y: 40,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: rightSection3Ref.value,
          start: 'top 80%',
          once: true
        }
      })
    }

    // --- SCROLL-LINKED ANIMATIONS ---

    // Main scroll driver for left panel
    if (!isMobile) {
      ScrollTrigger.create({
        trigger: sectionRef.value,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          updateLeft(self.progress)
        }
      })
    }

    // Parallax on glow blob (additional depth)
    if (!isMobile) {
      gsap.to(glowBlobRef.value, {
        scale: 1.3,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5
        }
      })
    }

    // Divider glow intensifies on scroll
    if (dividerRef.value && !isMobile) {
      gsap.to(dividerRef.value, {
        boxShadow: '0 0 20px rgba(196, 132, 62, 0.15), 0 0 60px rgba(196, 132, 62, 0.05)',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5
        }
      })
    }

    // Service tags clip-path reveal
    const tags = sectionRef.value?.querySelectorAll('.s-split__tag')
    if (tags?.length) {
      gsap.from(tags, {
        clipPath: 'inset(0 100% 0 0)',
        duration: 0.8,
        ease: 'power3.inOut',
        stagger: 0.08,
        scrollTrigger: {
          trigger: tags[0],
          start: 'top 85%',
          once: true
        }
      })
    }

    // Magnetic CTA
    if (ctaRef.value && isDesktop) {
      xTo = gsap.quickTo(ctaRef.value, 'x', { duration: 0.4, ease: 'power3.out' })
      yTo = gsap.quickTo(ctaRef.value, 'y', { duration: 0.4, ease: 'power3.out' })

      const handleMove = (e) => {
        const rect = ctaRef.value.getBoundingClientRect()
        const dx = (e.clientX - rect.left - rect.width / 2) * 0.3
        const dy = (e.clientY - rect.top - rect.height / 2) * 0.3
        xTo(dx)
        yTo(dy)
      }
      const handleLeave = () => {
        gsap.to(ctaRef.value, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
      }
      ctaRef.value.addEventListener('mousemove', handleMove)
      ctaRef.value.addEventListener('mouseleave', handleLeave)

      // Cleanup for event listeners when matchMedia reverts
      context.cleanupListeners = () => {
        ctaRef.value?.removeEventListener('mousemove', handleMove)
        ctaRef.value?.removeEventListener('mouseleave', handleLeave)
      }
    }

    // Wavy SVG line drawing (section 2)
    const wavyLine = sectionRef.value?.querySelector('.s-split__wavy-path')
    if (wavyLine) {
      const length = wavyLine.getTotalLength()
      gsap.set(wavyLine, { strokeDasharray: length, strokeDashoffset: length })
      gsap.to(wavyLine, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: rightSection2Ref.value,
          start: 'top 75%',
          once: true
        }
      })
    }

    // Return cleanup function
    return () => {
      context.cleanupListeners?.()
    }
  }, sectionRef.value)
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section ref="sectionRef" class="s-split" aria-label="Split scroll narrative hero">
    <!-- Grain overlay -->
    <div class="s-split__grain" aria-hidden="true"></div>

    <!-- ==================== LEFT PANEL ==================== -->
    <div ref="leftPanelRef" class="s-split__left">
      <!-- Ambient glow blob -->
      <div ref="glowBlobRef" class="s-split__glow" aria-hidden="true"></div>

      <!-- Left panel atmospheric pseudo-element handled in CSS -->

      <!-- State 1: "We craft digital experiences" -->
      <div ref="state1Ref" class="s-split__state s-split__state--1">
        <p class="s-split__serif-line">
          <span class="s-split__word-wrap"><span class="s-split__word">We craft</span></span>
        </p>
        <p class="s-split__serif-line s-split__serif-line--indent">
          <span class="s-split__word-wrap"><span class="s-split__word">digital</span></span>
        </p>
        <p class="s-split__serif-line">
          <span class="s-split__word-wrap"><span class="s-split__word">experiences</span></span>
        </p>
      </div>

      <!-- State 2: "Built for humans" -->
      <div ref="state2Ref" class="s-split__state s-split__state--2">
        <p class="s-split__display-line">Built for</p>
        <p class="s-split__display-line s-split__display-line--accent">humans</p>
      </div>

      <!-- State 3: "Let's begin" -->
      <div ref="state3Ref" class="s-split__state s-split__state--3">
        <p class="s-split__mixed-line s-split__mixed-line--serif">Let's</p>
        <p class="s-split__mixed-line s-split__mixed-line--display">begin</p>
      </div>

      <!-- Progress indicator -->
      <div class="s-split__progress" aria-hidden="true">
        <div ref="progressLineRef" class="s-split__progress-line"></div>
        <div ref="progressDotRef" class="s-split__progress-dot"></div>
      </div>
    </div>

    <!-- ==================== DIVIDER ==================== -->
    <div ref="dividerRef" class="s-split__divider" aria-hidden="true"></div>

    <!-- ==================== RIGHT PANEL ==================== -->
    <div class="s-split__right">
      <!-- Section 1: Strategy & Direction -->
      <div ref="rightSection1Ref" class="s-split__r-section s-split__r-section--1">
        <div class="s-split__r-inner">
          <div class="s-split__r-cols">
            <span class="s-split__r-number s-split__r-item">01</span>
            <div class="s-split__r-content s-split__r-item">
              <h2 class="s-split__r-title">Strategy & Direction</h2>
              <p class="s-split__r-desc">
                We distill complex ambitions into sharp creative direction.
                Every pixel serves a purpose, every interaction tells your story.
              </p>
            </div>
          </div>
          <div class="s-split__r-tags s-split__r-item">
            <span class="s-split__tag">Brand Strategy</span>
            <span class="s-split__tag">Creative Direction</span>
            <span class="s-split__tag">User Research</span>
          </div>
          <div class="s-split__r-rule s-split__r-item" aria-hidden="true"></div>
        </div>
      </div>

      <!-- Section 2: Design & Build -->
      <div ref="rightSection2Ref" class="s-split__r-section s-split__r-section--2">
        <div class="s-split__r-inner">
          <div class="s-split__r-cols s-split__r-cols--reverse">
            <div class="s-split__r-thumbnails s-split__r-item">
              <div class="s-split__thumb s-split__thumb--1">
                <span class="s-split__thumb-label">Project Aurora</span>
              </div>
              <div class="s-split__thumb s-split__thumb--2">
                <span class="s-split__thumb-label">Case Study</span>
              </div>
              <!-- Wavy SVG connector -->
              <svg class="s-split__wavy-svg" viewBox="0 0 120 200" fill="none" aria-hidden="true">
                <path
                  class="s-split__wavy-path"
                  d="M60 0 C20 50, 100 80, 60 120 C20 160, 100 180, 60 200"
                  stroke="var(--color-accent-muted)"
                  stroke-width="1.5"
                  fill="none"
                />
              </svg>
            </div>
            <div class="s-split__r-content s-split__r-item">
              <span class="s-split__r-number s-split__r-number--inline">02</span>
              <h2 class="s-split__r-title">Design & Build</h2>
              <p class="s-split__r-desc">
                From wireframe to production, we obsess over craft.
                Custom code, fluid motion, responsive precision.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 3: Let's Connect -->
      <div ref="rightSection3Ref" class="s-split__r-section s-split__r-section--3">
        <div class="s-split__r-inner s-split__r-inner--centered">
          <span class="s-split__r-number s-split__r-item">03</span>
          <h2 class="s-split__r-headline s-split__r-item">Ready to create<br>something remarkable?</h2>
          <a
            ref="ctaRef"
            href="#contact"
            class="s-split__cta s-split__r-item"
            data-magnetic
          >
            <span class="s-split__cta-text">Start a project</span>
            <span class="s-split__cta-arrow" aria-hidden="true">&rarr;</span>
          </a>
          <a href="mailto:hello@studio.com" class="s-split__r-email s-split__r-item">hello@studio.com</a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════════
   S-SplitScrollNarrative
   Split-screen hero: sticky left + scrolling right
   ═══════════════════════════════════════════ */

.s-split {
  position: relative;
  display: flex;
  height: 300vh;
  background-color: var(--color-canvas);
  overflow: hidden;
}

/* ── Grain overlay ── */
.s-split__grain {
  position: fixed;
  inset: 0;
  background-image: url('/noise.png');
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: 20;
  animation: grain 0.5s steps(6) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5%, -5%); }
  50% { transform: translate(5%, 0); }
  75% { transform: translate(0, 5%); }
}

/* ═══════════ LEFT PANEL ═══════════ */

.s-split__left {
  position: sticky;
  top: 0;
  width: 45vw;
  height: 100vh;
  flex-shrink: 0;
  background-color: var(--color-canvas);
  overflow: hidden;
  z-index: 2;
}

/* Atmospheric vignette on left panel */
.s-split__left::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 30% 70%,
    var(--color-accent-subtle) 0%,
    transparent 60%
  );
  z-index: 0;
  pointer-events: none;
}

/* Subtle top-edge light leak */
.s-split__left::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-accent-muted) 50%,
    transparent 100%
  );
  opacity: 0.4;
  z-index: 3;
  pointer-events: none;
}

/* Ambient glow blob */
.s-split__glow {
  position: absolute;
  width: clamp(200px, 30vw, 400px);
  height: clamp(200px, 30vw, 400px);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(196, 132, 62, 0.08) 0%,
    rgba(196, 132, 62, 0.03) 40%,
    transparent 70%
  );
  filter: blur(60px);
  left: 20%;
  top: 60%;
  z-index: 0;
  pointer-events: none;
}

/* ── Left Panel States ── */

.s-split__state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(32px, 5vw, 80px);
  padding-right: clamp(48px, 4vw, 64px);
  z-index: 1;
}

/* State 1 — top-left bias */
.s-split__state--1 {
  justify-content: flex-start;
  padding-top: clamp(80px, 15vh, 180px);
  text-align: left;
}

.s-split__serif-line {
  font-family: var(--font-serif);
  font-size: clamp(36px, 4.5vw, 72px);
  font-weight: 300;
  font-style: italic;
  color: var(--color-text);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-2);
}

.s-split__serif-line--indent {
  padding-left: clamp(32px, 5vw, 80px);
  color: var(--color-accent);
}

.s-split__word-wrap {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
}

.s-split__word {
  display: inline-block;
}

/* State 2 — centered */
.s-split__state--2 {
  justify-content: center;
  align-items: center;
  text-align: center;
}

.s-split__display-line {
  font-family: var(--font-display);
  font-size: clamp(40px, 5vw, 80px);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.05;
  letter-spacing: var(--tracking-tight);
}

.s-split__display-line--accent {
  color: var(--color-accent);
  font-size: clamp(48px, 6vw, 96px);
}

/* State 3 — bottom-right bias */
.s-split__state--3 {
  justify-content: flex-end;
  align-items: flex-end;
  text-align: right;
  padding-bottom: clamp(80px, 15vh, 180px);
}

.s-split__mixed-line--serif {
  font-family: var(--font-serif);
  font-size: clamp(36px, 4vw, 64px);
  font-weight: 300;
  font-style: italic;
  color: var(--color-text-muted);
  line-height: 1.1;
}

.s-split__mixed-line--display {
  font-family: var(--font-display);
  font-size: clamp(56px, 7vw, 112px);
  font-weight: 700;
  color: var(--color-text);
  line-height: 0.95;
  letter-spacing: var(--tracking-tight);
}

/* ── Progress Indicator ── */

.s-split__progress {
  position: absolute;
  right: clamp(16px, 2vw, 32px);
  top: 20%;
  bottom: 20%;
  width: 2px;
  z-index: 5;
}

.s-split__progress-line {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    var(--color-accent-muted) 0%,
    var(--color-accent-subtle) 100%
  );
  border-radius: var(--radius-pill);
}

.s-split__progress-dot {
  position: absolute;
  top: 0;
  left: 50%;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  margin-top: -5px;
  border-radius: 50%;
  background-color: var(--color-accent);
  box-shadow:
    0 0 8px rgba(196, 132, 62, 0.5),
    0 0 24px rgba(196, 132, 62, 0.2);
}

/* ═══════════ DIVIDER ═══════════ */

.s-split__divider {
  position: fixed;
  left: 45vw;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--color-text-subtle);
  box-shadow: 0 0 8px rgba(196, 132, 62, 0.06);
  z-index: 5;
}

/* ═══════════ RIGHT PANEL ═══════════ */

.s-split__right {
  width: 55vw;
  flex-shrink: 0;
  scrollbar-width: none;
}

.s-split__right::-webkit-scrollbar {
  display: none;
}

/* ── Right Panel Sections ── */

.s-split__r-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.s-split__r-section--1 {
  background-color: var(--color-canvas);
}

.s-split__r-section--2 {
  background-color: var(--color-canvas-alt);
  position: relative;
}

/* Directional glow on section 2 */
.s-split__r-section--2::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background: radial-gradient(
    ellipse at 100% 50%,
    var(--color-accent-subtle) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

.s-split__r-section--3 {
  background-color: #1e1a14;
  position: relative;
  overflow: hidden;
}

/* Watermark "03" behind section 3 content */
.s-split__r-section--3::before {
  content: '03';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-mono);
  font-size: clamp(200px, 25vw, 400px);
  font-weight: 500;
  color: var(--color-text);
  opacity: 0.03;
  line-height: 1;
  pointer-events: none;
  z-index: 0;
}

.s-split__r-inner {
  width: 100%;
  padding: clamp(32px, 5vw, 80px);
  padding-top: clamp(60px, 10vh, 120px);
  padding-bottom: clamp(48px, 8vh, 96px);
  position: relative;
  z-index: 1;
}

.s-split__r-inner--centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-6);
  position: relative;
  z-index: 1;
}

/* ── Right Columns (section 1 & 2) ── */

.s-split__r-cols {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: clamp(24px, 3vw, 48px);
  align-items: start;
  margin-bottom: var(--space-8);
}

.s-split__r-cols--reverse {
  grid-template-columns: 1.4fr 1fr;
}

/* ── Number ── */

.s-split__r-number {
  font-family: var(--font-mono);
  font-size: clamp(48px, 5vw, 80px);
  font-weight: 400;
  color: var(--color-accent);
  line-height: 1;
  letter-spacing: -0.04em;
  opacity: 0.7;
}

.s-split__r-number--inline {
  display: block;
  font-family: var(--font-mono);
  font-size: clamp(36px, 4vw, 64px);
  font-weight: 400;
  color: var(--color-accent);
  line-height: 1;
  letter-spacing: -0.04em;
  opacity: 0.7;
  margin-bottom: var(--space-4);
}

/* ── Content ── */

.s-split__r-title {
  font-family: var(--font-display);
  font-size: clamp(24px, 2.5vw, 40px);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.15;
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--space-4);
}

.s-split__r-desc {
  font-family: var(--font-body);
  font-size: var(--text-body);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
  max-width: 36ch;
}

/* ── Tags ── */

.s-split__r-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}

.s-split__tag {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  color: var(--color-text-muted);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-text-subtle);
  border-radius: var(--radius-pill);
  transition: color 0.3s var(--ease-out), border-color 0.3s var(--ease-out),
              background-color 0.3s var(--ease-out);
  cursor: default;
}

.s-split__tag:hover {
  color: var(--color-accent);
  border-color: var(--color-accent-muted);
  background-color: var(--color-accent-subtle);
}

/* ── Rule ── */

.s-split__r-rule {
  height: 1px;
  background: linear-gradient(90deg, var(--color-text-subtle) 0%, transparent 100%);
  margin-left: clamp(-80px, -5vw, -32px);
  width: calc(100% + clamp(32px, 5vw, 80px) + 32px);
}

/* ── Thumbnails (section 2) ── */

.s-split__r-thumbnails {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.s-split__thumb {
  width: 100%;
  aspect-ratio: 16 / 10;
  background-color: var(--color-surface);
  border: 1px solid var(--color-text-subtle);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: flex-end;
  padding: var(--space-3);
  transition: transform 0.4s var(--ease-out), border-color 0.4s var(--ease-out);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.s-split__thumb::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    transparent 40%,
    rgba(13, 11, 9, 0.6) 100%
  );
  z-index: 0;
  pointer-events: none;
}

.s-split__thumb--1 {
  transform: rotate(-2deg);
}

.s-split__thumb--2 {
  transform: rotate(1.5deg) translateY(-8px);
}

.s-split__thumb:hover {
  transform: rotate(0deg) scale(1.03);
  border-color: var(--color-accent-muted);
}

.s-split__thumb:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.s-split__thumb-label {
  position: relative;
  z-index: 1;
  font-family: var(--font-body);
  font-size: var(--text-label);
  color: var(--color-text-muted);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

/* Wavy SVG */
.s-split__wavy-svg {
  position: absolute;
  left: 50%;
  top: 10%;
  height: 80%;
  width: 60px;
  transform: translateX(-50%);
  z-index: 2;
  pointer-events: none;
}

/* ── Section 3 CTA ── */

.s-split__r-headline {
  font-family: var(--font-display);
  font-size: clamp(28px, 3vw, 48px);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.15;
  letter-spacing: var(--tracking-tight);
  max-width: 16ch;
}

.s-split__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-display);
  font-size: clamp(14px, 1.2vw, 18px);
  font-weight: 500;
  color: var(--color-text-invert);
  background-color: var(--color-accent);
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-pill);
  text-decoration: none;
  min-height: 48px;
  min-width: 48px;
  position: relative;
  overflow: hidden;
  transition: background-color 0.3s var(--ease-out);
  cursor: pointer;
}

.s-split__cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.3s var(--ease-out);
  pointer-events: none;
}

.s-split__cta:hover::before {
  opacity: 1;
}

.s-split__cta:hover {
  background-color: #d49348;
}

.s-split__cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
}

.s-split__cta-arrow {
  display: inline-block;
  transition: transform 0.3s var(--ease-out);
}

.s-split__cta:hover .s-split__cta-arrow {
  transform: translateX(4px);
}

.s-split__r-email {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  color: var(--color-text-muted);
  letter-spacing: var(--tracking-wide);
  text-decoration: none;
  position: relative;
  display: inline-block;
  transition: color 0.3s var(--ease-out);
}

.s-split__r-email::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--color-accent-muted);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.3s var(--ease-out);
}

.s-split__r-email:hover::after {
  transform: scaleX(1);
}

.s-split__r-email:hover {
  color: var(--color-text);
}

.s-split__r-email:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
}

/* ═══════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════ */

/* ── Tablet (768px-1279px) ── */
@media (min-width: 768px) and (max-width: 1279px) {
  .s-split__left {
    width: 40vw;
  }

  .s-split__divider {
    left: 40vw;
  }

  .s-split__right {
    width: 60vw;
  }

  .s-split__serif-line {
    font-size: clamp(28px, 4vw, 48px);
  }

  .s-split__display-line {
    font-size: clamp(32px, 5vw, 56px);
  }

  .s-split__display-line--accent {
    font-size: clamp(40px, 6vw, 68px);
  }

  .s-split__r-cols--reverse {
    grid-template-columns: 1fr;
  }
}

/* ── Mobile (< 768px) ── */
@media (max-width: 767px) {
  .s-split {
    flex-direction: column;
    height: auto;
  }

  .s-split__left {
    position: relative;
    width: 100%;
    height: auto;
    min-height: 80vh;
    padding: var(--space-8);
  }

  .s-split__state {
    position: relative;
    padding: var(--space-6);
  }

  .s-split__state--1 {
    padding-top: clamp(60px, 12vh, 120px);
  }

  .s-split__state--2,
  .s-split__state--3 {
    display: none;
  }

  .s-split__divider {
    display: none;
  }

  .s-split__progress {
    display: none;
  }

  .s-split__right {
    width: 100%;
  }

  .s-split__r-section {
    min-height: auto;
    padding: var(--space-8) 0;
  }

  .s-split__r-cols {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .s-split__r-cols--reverse {
    grid-template-columns: 1fr;
  }

  .s-split__r-number {
    font-size: 48px;
  }

  .s-split__r-thumbnails {
    order: 2;
  }

  .s-split__wavy-svg {
    display: none;
  }

  .s-split__grain {
    position: absolute;
  }

  .s-split__glow {
    width: 200px;
    height: 200px;
  }

  .s-split__serif-line {
    font-size: clamp(32px, 8vw, 48px);
  }

  .s-split__mixed-line--display {
    font-size: clamp(40px, 10vw, 64px);
  }
}
</style>
