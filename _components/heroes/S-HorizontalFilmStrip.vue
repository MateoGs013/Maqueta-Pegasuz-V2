<script setup>
/**
 * S-HorizontalFilmStrip  |  Cinematic Film Strip Hero
 * ────────────────────────────────────────────────────
 * A hero built around a physical 35mm film strip metaphor.
 * The viewport is occupied by a draggable/auto-scrolling horizontal
 * strip with perforations, frame dividers, and 5 distinct content frames.
 *
 * Layers (bottom to top):
 *   1. .fs-section bg       -- warm near-black canvas
 *   2. .fs-strip-wrapper    -- the film strip with warm color grade
 *   3. .fs-perfs-top/bottom -- perforation rows with staggered holes
 *   4. .fs-frames-track     -- 5 content frames, horizontally scrollable
 *   5. .fs-playhead         -- accent sweep line ("Frame Advance" signature)
 *   6. .fs-meta-top         -- "Portfolio 2024-25" text above perforations
 *   7. ::after              -- grain overlay at 5%
 *
 * Signature: "Frame Advance" -- an accent-colored 2px playhead line
 * slowly sweeps left-to-right across the visible area, mimicking a
 * projector gate scanning the film.
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SHorizontalFilmStrip' })

const sectionRef = ref(null)
const trackRef = ref(null)
const playheadRef = ref(null)
const ctaRef = ref(null)

let mm = null
let autoScrollRAF = null
let playheadRAF = null
let autoScrollPos = 0
let isDragging = false
let dragStartX = 0
let dragScrollLeft = 0
let mouseXRatio = 0.5

// Perforation count for visual density
const perfCount = 28

onMounted(() => {
  const el = sectionRef.value
  const track = trackRef.value
  if (!el || !track) return

  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 1280px)',
    isTablet: '(min-width: 768px) and (max-width: 1279px)',
    isMobile: '(max-width: 767px)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  }, (context) => {
    const { reduceMotion, isMobile, isTablet } = context.conditions
    if (reduceMotion) return

    // ── Element refs ────────────────────────────
    const perfHolesTop = el.querySelectorAll('.fs-perf-top .fs-perf-hole')
    const perfHolesBottom = el.querySelectorAll('.fs-perf-bottom .fs-perf-hole')
    const frames = el.querySelectorAll('.fs-frame')
    const metaTop = el.querySelector('.fs-meta-top')
    const playhead = playheadRef.value
    const stripWrapper = el.querySelector('.fs-strip-wrapper')

    // ── Initial states ──────────────────────────
    gsap.set(perfHolesTop, { autoAlpha: 0, scale: 0.3 })
    gsap.set(perfHolesBottom, { autoAlpha: 0, scale: 0.3 })
    gsap.set(frames, { autoAlpha: 0 })
    gsap.set(stripWrapper, { x: 200, autoAlpha: 0 })
    gsap.set(metaTop, { autoAlpha: 0, y: -10 })
    gsap.set(playhead, { autoAlpha: 0, scaleY: 0 })

    // ── Entrance timeline ───────────────────────
    const entranceTL = gsap.timeline({ defaults: { ease: 'power3.out' } })

    entranceTL
      // Strip slides in from right
      .to(stripWrapper, {
        x: 0, autoAlpha: 1, duration: 1.2, ease: 'power3.out',
      }, 0)
      // Meta top fades in
      .to(metaTop, {
        autoAlpha: 1, y: 0, duration: 0.7, ease: 'power4.out',
      }, 0.3)
      // Perforation holes materialize left-to-right (top row)
      .to(perfHolesTop, {
        autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)',
        stagger: 0.04,
      }, 0.4)
      // Bottom row slightly delayed
      .to(perfHolesBottom, {
        autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)',
        stagger: 0.04,
      }, 0.5)
      // Frames fade in with stagger
      .to(frames, {
        autoAlpha: 1, duration: 0.8, ease: 'power2.out',
        stagger: 0.12,
      }, 0.6)
      // Playhead appears
      .to(playhead, {
        autoAlpha: 0.8, scaleY: 1, duration: 0.6, ease: 'power4.out',
        transformOrigin: 'center top',
      }, 1.0)

    // ── Frame-internal animations ───────────────
    // Frame 1 headline
    const f1Lines = el.querySelectorAll('.fs-f1-line')
    const f1Circle = el.querySelector('.fs-f1-circle')
    if (f1Lines.length) {
      gsap.set(f1Lines, { yPercent: 120, autoAlpha: 0 })
      gsap.to(f1Lines, {
        yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'power4.out',
        stagger: 0.12, delay: 1.0,
      })
    }
    if (f1Circle) {
      gsap.set(f1Circle, { scale: 0.6, autoAlpha: 0 })
      gsap.to(f1Circle, {
        scale: 1, autoAlpha: 0.6, duration: 1.4, ease: 'power3.out', delay: 0.8,
      })
    }

    // Frame 2 stat numbers
    const f2Stats = el.querySelectorAll('.fs-f2-stat-num')
    if (f2Stats.length) {
      gsap.set(f2Stats, { autoAlpha: 0, y: 20 })
      gsap.to(f2Stats, {
        autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out',
        stagger: 0.1, delay: 1.2,
      })
    }

    // Frame 5 CTA
    const f5Cta = el.querySelector('.fs-f5-cta')
    if (f5Cta) {
      gsap.set(f5Cta, { autoAlpha: 0, scale: 0.92 })
      gsap.to(f5Cta, {
        autoAlpha: 1, scale: 1, duration: 0.8, ease: 'back.out(1.4)', delay: 1.4,
      })
    }

    // ── Scroll-linked: strip parallax on vertical scroll ──
    gsap.to(stripWrapper, {
      x: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    // ── Drag behavior ───────────────────────────
    const onMouseDown = (e) => {
      isDragging = true
      dragStartX = e.pageX || e.touches?.[0]?.pageX || 0
      dragScrollLeft = track.scrollLeft
      track.style.cursor = 'grabbing'
      track.style.userSelect = 'none'
    }

    const onMouseMove = (e) => {
      // Track mouse X for parallax
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0
      mouseXRatio = clientX / window.innerWidth

      if (!isDragging) return
      e.preventDefault()
      const pageX = e.pageX || e.touches?.[0]?.pageX || 0
      const walk = (pageX - dragStartX) * 1.5
      track.scrollLeft = dragScrollLeft - walk
    }

    const onMouseUp = () => {
      isDragging = false
      track.style.cursor = 'grab'
      track.style.userSelect = ''
    }

    track.addEventListener('mousedown', onMouseDown)
    track.addEventListener('touchstart', onMouseDown, { passive: true })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onMouseMove, { passive: false })
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchend', onMouseUp)

    // ── Mouse parallax on strip ─────────────────
    if (!isMobile) {
      const parallaxAmount = 80
      const tick = () => {
        if (!isDragging) {
          const offset = (mouseXRatio - 0.5) * parallaxAmount
          gsap.to(track, { x: -offset, duration: 0.8, ease: 'power2.out', overwrite: 'auto' })
        }
      }
      // Throttle to 60fps
      let lastParallax = 0
      const parallaxMove = (e) => {
        const now = Date.now()
        if (now - lastParallax < 16) return
        lastParallax = now
        mouseXRatio = e.clientX / window.innerWidth
        tick()
      }
      el.addEventListener('mousemove', parallaxMove)
    }

    // ── Auto-scroll ─────────────────────────────
    const autoScrollSpeed = 0.3
    let isVisible = true

    const observer = new IntersectionObserver(
      (entries) => { isVisible = entries[0]?.isIntersecting ?? true },
      { threshold: 0.1 }
    )
    observer.observe(el)

    const autoScroll = () => {
      if (isVisible && !isDragging) {
        autoScrollPos += autoScrollSpeed
        track.scrollLeft = autoScrollPos
        // Sync position when user drags
        if (Math.abs(track.scrollLeft - autoScrollPos) > 2) {
          autoScrollPos = track.scrollLeft
        }
      }
      autoScrollRAF = requestAnimationFrame(autoScroll)
    }
    autoScrollRAF = requestAnimationFrame(autoScroll)

    // ── Playhead sweep (signature) ──────────────
    let playheadProgress = 0
    const playheadSweep = () => {
      playheadProgress += 0.0008
      if (playheadProgress > 1) playheadProgress = 0
      const playheadX = playheadProgress * 100
      if (playhead) {
        playhead.style.left = `${playheadX}%`
      }
      playheadRAF = requestAnimationFrame(playheadSweep)
    }
    playheadRAF = requestAnimationFrame(playheadSweep)

    // ── Magnetic CTA ────────────────────────────
    const cta = ctaRef.value
    if (!isMobile && cta) {
      const xTo = gsap.quickTo(cta, 'x', { duration: 0.6, ease: 'power3.out' })
      const yTo = gsap.quickTo(cta, 'y', { duration: 0.6, ease: 'power3.out' })

      const onCtaMove = (e) => {
        const r = cta.getBoundingClientRect()
        xTo((e.clientX - r.left - r.width / 2) * 0.3)
        yTo((e.clientY - r.top - r.height / 2) * 0.3)
      }
      const onCtaLeave = () => { xTo(0); yTo(0) }

      cta.addEventListener('mousemove', onCtaMove)
      cta.addEventListener('mouseleave', onCtaLeave)
    }

    // ── Cleanup ─────────────────────────────────
    return () => {
      observer.disconnect()
      track.removeEventListener('mousedown', onMouseDown)
      track.removeEventListener('touchstart', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchend', onMouseUp)
    }
  }, el)
})

onBeforeUnmount(() => {
  mm?.revert()
  if (autoScrollRAF) cancelAnimationFrame(autoScrollRAF)
  if (playheadRAF) cancelAnimationFrame(playheadRAF)
})
</script>

<template>
  <section ref="sectionRef" class="s-fs" aria-label="Film strip hero">

    <!-- Meta text above strip -->
    <div class="fs-meta-top" aria-hidden="true">
      <span class="fs-meta-label">Portfolio 2024&#x2013;25</span>
      <span class="fs-meta-dot"></span>
      <span class="fs-meta-label">35mm</span>
    </div>

    <!-- Film strip wrapper (color graded) -->
    <div class="fs-strip-wrapper">

      <!-- Top perforations -->
      <div class="fs-perf-row fs-perf-top" aria-hidden="true">
        <div
          v-for="n in perfCount"
          :key="'pt-' + n"
          class="fs-perf-hole"
        ></div>
      </div>

      <!-- Frames track (draggable horizontal scroll) -->
      <div ref="trackRef" class="fs-frames-track" role="list">

        <!-- Frame 1: Establishing Shot -->
        <article class="fs-frame fs-frame--1" role="listitem">
          <div class="fs-f1-circle" aria-hidden="true"></div>
          <div class="fs-frame-content fs-f1-content">
            <div class="fs-f1-headline">
              <span class="fs-f1-line-wrap"><span class="fs-f1-line">Making</span></span>
              <span class="fs-f1-line-wrap"><span class="fs-f1-line">Ideas</span></span>
              <span class="fs-f1-line-wrap"><span class="fs-f1-line">Real</span></span>
            </div>
          </div>
          <span class="fs-frame-number">35mm / F-01</span>
        </article>

        <!-- Frame divider -->
        <div class="fs-frame-divider" aria-hidden="true"></div>

        <!-- Frame 2: Character Introduction -->
        <article class="fs-frame fs-frame--2" role="listitem">
          <div class="fs-f2-split">
            <div class="fs-f2-left">
              <span class="fs-f2-rotated">SINCE 2010</span>
            </div>
            <div class="fs-f2-right">
              <div class="fs-f2-rule" aria-hidden="true"></div>
              <div class="fs-f2-stats">
                <div class="fs-f2-stat">
                  <span class="fs-f2-stat-num">47</span>
                  <span class="fs-f2-stat-label">Projects</span>
                </div>
                <div class="fs-f2-stat">
                  <span class="fs-f2-stat-num">12</span>
                  <span class="fs-f2-stat-label">Awards</span>
                </div>
                <div class="fs-f2-stat">
                  <span class="fs-f2-stat-num">8</span>
                  <span class="fs-f2-stat-label">Countries</span>
                </div>
                <div class="fs-f2-stat">
                  <span class="fs-f2-stat-num">3</span>
                  <span class="fs-f2-stat-label">Studios</span>
                </div>
              </div>
            </div>
          </div>
          <span class="fs-frame-number">35mm / F-02</span>
        </article>

        <!-- Frame divider -->
        <div class="fs-frame-divider" aria-hidden="true"></div>

        <!-- Frame 3: The Process -->
        <article class="fs-frame fs-frame--3" role="listitem">
          <div class="fs-frame-content fs-f3-content">
            <div class="fs-f3-list">
              <div class="fs-f3-item">
                <span class="fs-f3-idx">[01]</span>
                <div class="fs-f3-text">
                  <span class="fs-f3-title">Discovery</span>
                  <span class="fs-f3-desc">Immerse in your world, find the signal</span>
                </div>
              </div>
              <div class="fs-f3-item">
                <span class="fs-f3-idx">[02]</span>
                <div class="fs-f3-text">
                  <span class="fs-f3-title">Strategy</span>
                  <span class="fs-f3-desc">Architect the narrative and experience</span>
                </div>
              </div>
              <div class="fs-f3-item">
                <span class="fs-f3-idx">[03]</span>
                <div class="fs-f3-text">
                  <span class="fs-f3-title">Craft</span>
                  <span class="fs-f3-desc">Pixel-level execution, no compromises</span>
                </div>
              </div>
              <div class="fs-f3-item">
                <span class="fs-f3-idx">[04]</span>
                <div class="fs-f3-text">
                  <span class="fs-f3-title">Launch</span>
                  <span class="fs-f3-desc">Ship with confidence, measure impact</span>
                </div>
              </div>
            </div>
          </div>
          <span class="fs-f3-watermark" aria-hidden="true">Process</span>
          <span class="fs-frame-number">35mm / F-03</span>
        </article>

        <!-- Frame divider -->
        <div class="fs-frame-divider" aria-hidden="true"></div>

        <!-- Frame 4: Climax / Work -->
        <article class="fs-frame fs-frame--4" role="listitem">
          <span class="fs-f4-watermark" aria-hidden="true">Selected Works</span>
          <div class="fs-frame-content fs-f4-content">
            <a href="#" class="fs-f4-project">
              <span class="fs-f4-project-name">Meridian Capital</span>
              <span class="fs-f4-project-year">2024</span>
            </a>
            <a href="#" class="fs-f4-project">
              <span class="fs-f4-project-name">Volta Energy</span>
              <span class="fs-f4-project-year">2024</span>
            </a>
            <a href="#" class="fs-f4-project">
              <span class="fs-f4-project-name">Noctis Gallery</span>
              <span class="fs-f4-project-year">2023</span>
            </a>
          </div>
          <span class="fs-frame-number">35mm / F-04</span>
        </article>

        <!-- Frame divider -->
        <div class="fs-frame-divider" aria-hidden="true"></div>

        <!-- Frame 5: The Call to Action -->
        <article class="fs-frame fs-frame--5" role="listitem">
          <div class="fs-frame-content fs-f5-content">
            <div class="fs-f5-headline">
              <span class="fs-f5-serif">Let's</span>
              <span class="fs-f5-display">Create</span>
            </div>
            <a ref="ctaRef" href="#contact" class="fs-f5-cta" data-magnetic>
              Start a project
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
            <div class="fs-f5-meta">
              <span>Buenos Aires, AR</span>
              <span>hello@studio.com</span>
            </div>
          </div>
          <span class="fs-frame-number">35mm / F-05</span>
        </article>

      </div>

      <!-- Bottom perforations -->
      <div class="fs-perf-row fs-perf-bottom" aria-hidden="true">
        <div
          v-for="n in perfCount"
          :key="'pb-' + n"
          class="fs-perf-hole"
        ></div>
      </div>

      <!-- Playhead (signature) -->
      <div ref="playheadRef" class="fs-playhead" aria-hidden="true"></div>

    </div>

  </section>
</template>

<style scoped>
/* ────────────────────────────────────────────────
   S-HorizontalFilmStrip  |  base (375px)
──────────────────────────────────────────────── */
.s-fs {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  min-height: 560px;
  overflow: hidden;
  background: var(--color-canvas);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-top: 48px;
  padding-bottom: 0;
}

/* ── Atmosphere: warm amber vignette ─────────── */
.s-fs::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      ellipse 80% 60% at 30% 40%,
      rgba(196, 132, 62, 0.06) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse 60% 80% at 80% 70%,
      rgba(196, 132, 62, 0.04) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at center,
      transparent 40%,
      rgba(0, 0, 0, 0.35) 100%
    );
  z-index: 0;
  pointer-events: none;
}

/* ── Grain overlay ───────────────────────────── */
.s-fs::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 100px 100px;
  background-repeat: repeat;
  opacity: 0.05;
  pointer-events: none;
  z-index: 50;
  animation: fs-grain 0.5s steps(6) infinite;
}

@keyframes fs-grain {
  0%, 100% { transform: translate(0, 0); }
  25%  { transform: translate(-5%, -5%); }
  50%  { transform: translate(5%, 0); }
  75%  { transform: translate(0, 5%); }
}


/* ────────────────────────────────────────────────
   META TEXT (above strip)
──────────────────────────────────────────────── */
.fs-meta-top {
  position: absolute;
  top: var(--space-6);
  left: var(--space-section-x);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  z-index: 20;
}

.fs-meta-label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.fs-meta-dot {
  width: 3px;
  height: 3px;
  border-radius: var(--radius-pill);
  background: var(--color-accent-muted);
}


/* ────────────────────────────────────────────────
   FILM STRIP WRAPPER
──────────────────────────────────────────────── */
.fs-strip-wrapper {
  position: relative;
  width: calc(100% + 40px);
  margin-left: -20px;
  height: calc(100vh - 48px);
  height: calc(100svh - 48px);
  display: flex;
  flex-direction: column;
  filter: sepia(0.08) contrast(1.05);
  z-index: 1;
}

/* Grain on strip wrapper specifically */
.fs-strip-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-size: 80px 80px;
  background-repeat: repeat;
  opacity: 0.04;
  pointer-events: none;
  z-index: 30;
  mix-blend-mode: overlay;
}


/* ────────────────────────────────────────────────
   PERFORATION ROWS
──────────────────────────────────────────────── */
.fs-perf-row {
  flex-shrink: 0;
  height: 36px;
  background: #1a1510;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 var(--space-4);
  position: relative;
  z-index: 5;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.fs-perf-top {
  box-shadow:
    inset 0 -1px 0 rgba(255, 255, 255, 0.03),
    0 2px 8px rgba(0, 0, 0, 0.3);
}

.fs-perf-bottom {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 -2px 8px rgba(0, 0, 0, 0.3);
}

.fs-perf-hole {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: var(--color-canvas);
  flex-shrink: 0;
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.5),
    0 1px 0 rgba(255, 255, 255, 0.05);
}


/* ────────────────────────────────────────────────
   FRAMES TRACK (horizontal scrolling)
──────────────────────────────────────────────── */
.fs-frames-track {
  flex: 1;
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  overflow-y: hidden;
  cursor: grab;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: auto;
}

.fs-frames-track::-webkit-scrollbar {
  display: none;
}


/* ────────────────────────────────────────────────
   INDIVIDUAL FRAMES
──────────────────────────────────────────────── */
.fs-frame {
  flex-shrink: 0;
  width: clamp(280px, 38vw, 520px);
  height: 100%;
  position: relative;
  background-color: #100e0c;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Warm amber wash on each frame */
.fs-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(196, 132, 62, 0.04);
  pointer-events: none;
  z-index: 1;
}

.fs-frame-content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-8);
}

.fs-frame-number {
  position: absolute;
  bottom: var(--space-3);
  left: var(--space-4);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-subtle);
  z-index: 3;
}


/* ── Frame dividers (splice marks) ───────────── */
.fs-frame-divider {
  flex-shrink: 0;
  width: 4px;
  background: var(--color-canvas);
  position: relative;
}

.fs-frame-divider::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.3) 30%,
    rgba(0, 0, 0, 0.3) 70%,
    rgba(0, 0, 0, 0.8) 100%
  );
}


/* ────────────────────────────────────────────────
   FRAME 1 — Establishing Shot
──────────────────────────────────────────────── */
.fs-f1-content {
  justify-content: flex-end;
  padding-bottom: calc(33% + var(--space-4));
}

.fs-f1-circle {
  position: absolute;
  top: 12%;
  right: 10%;
  width: clamp(100px, 18vw, 200px);
  height: clamp(100px, 18vw, 200px);
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    var(--color-accent) 0%,
    rgba(196, 132, 62, 0.3) 60%,
    transparent 80%
  );
  opacity: 0.6;
  z-index: 1;
  filter: blur(1px);
}

.fs-f1-headline {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(42px, 6vw, 72px);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
  position: relative;
  z-index: 2;
}

.fs-f1-line-wrap {
  display: block;
  overflow: hidden;
}

.fs-f1-line {
  display: block;
}


/* ────────────────────────────────────────────────
   FRAME 2 — Character Introduction
──────────────────────────────────────────────── */
.fs-frame--2 {
  background: none;
}

.fs-f2-split {
  display: flex;
  height: 100%;
  width: 100%;
}

.fs-f2-left {
  width: 40%;
  background: #1e1810;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.fs-f2-rotated {
  font-family: var(--font-display);
  font-size: clamp(18px, 2.5vw, 28px);
  font-weight: 700;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text);
  transform: rotate(-90deg);
  white-space: nowrap;
}

.fs-f2-right {
  width: 60%;
  background: #0c0a08;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-6);
  position: relative;
}

.fs-f2-rule {
  width: 100%;
  height: 1px;
  background: var(--color-line);
  margin-bottom: var(--space-6);
}

.fs-f2-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.fs-f2-stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.fs-f2-stat-num {
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 700;
  line-height: var(--leading-none);
  color: var(--color-accent);
  letter-spacing: var(--tracking-tight);
}

.fs-f2-stat-label {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  font-weight: 400;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-muted);
}


/* ────────────────────────────────────────────────
   FRAME 3 — The Process
──────────────────────────────────────────────── */
.fs-frame--3 {
  background:
    radial-gradient(
      ellipse at 80% 20%,
      rgba(196, 132, 62, 0.08) 0%,
      transparent 60%
    ),
    #100e0c;
}

.fs-f3-content {
  justify-content: center;
  padding: var(--space-8) var(--space-6);
}

.fs-f3-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.fs-f3-item {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  position: relative;
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-line);
  transition: transform 0.3s var(--ease-out);
}

.fs-f3-item:hover {
  transform: translateX(4px);
}

.fs-f3-item:last-child {
  border-bottom: none;
}

.fs-f3-idx {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  font-weight: 400;
  letter-spacing: var(--tracking-wide);
  color: var(--color-accent);
  flex-shrink: 0;
  margin-top: 2px;
}

.fs-f3-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fs-f3-title {
  font-family: var(--font-display);
  font-size: clamp(14px, 1.5vw, 18px);
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: 0.01em;
}

.fs-f3-desc {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.fs-f3-watermark {
  position: absolute;
  bottom: var(--space-4);
  right: var(--space-3);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(64px, 10vw, 120px);
  font-weight: 300;
  color: var(--color-text);
  opacity: 0.04;
  line-height: 1;
  letter-spacing: var(--tracking-tight);
  z-index: 1;
  pointer-events: none;
  user-select: none;
}


/* ────────────────────────────────────────────────
   FRAME 4 — Climax / Work
──────────────────────────────────────────────── */
.fs-f4-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(36px, 6vw, 72px);
  font-weight: 300;
  color: var(--color-text);
  opacity: 0.04;
  white-space: nowrap;
  z-index: 1;
  pointer-events: none;
  user-select: none;
}

.fs-f4-content {
  justify-content: center;
  gap: 0;
}

.fs-f4-project {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6) 0;
  border-bottom: 1px solid var(--color-line);
  text-decoration: none;
  color: var(--color-text);
  position: relative;
  transition:
    padding-left 0.4s var(--ease-out),
    color 0.3s var(--ease-out);
  cursor: pointer;
  min-height: 44px;
}

.fs-f4-project::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 0%;
  height: 1px;
  background: var(--color-accent);
  transition: width 0.5s var(--ease-out);
}

.fs-f4-project:hover {
  padding-left: var(--space-3);
  color: var(--color-accent);
}

.fs-f4-project:hover::before {
  width: 100%;
}

.fs-f4-project:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 2px;
}

.fs-f4-project:first-child {
  border-top: 1px solid var(--color-line);
}

.fs-f4-project-name {
  font-family: var(--font-display);
  font-size: clamp(14px, 1.6vw, 20px);
  font-weight: 500;
  letter-spacing: 0.01em;
}

.fs-f4-project-year {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  font-weight: 400;
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-muted);
}


/* ────────────────────────────────────────────────
   FRAME 5 — Call to Action
──────────────────────────────────────────────── */
.fs-f5-content {
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: var(--space-8);
  backdrop-filter: blur(2px);
}

.fs-f5-headline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.fs-f5-serif {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 300;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.fs-f5-display {
  font-family: var(--font-display);
  font-size: clamp(48px, 7vw, 84px);
  font-weight: 700;
  line-height: var(--leading-none);
  letter-spacing: var(--tracking-tight);
  text-transform: uppercase;
  color: var(--color-accent);
}

/* ── CTA button — pill with magnetic ────────── */
.fs-f5-cta {
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
  position: relative;
  z-index: 5;
  transition:
    background 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out),
    transform 0.3s var(--ease-out);
}

.fs-f5-cta:hover {
  background: var(--color-text);
  box-shadow:
    0 4px 16px rgba(196, 132, 62, 0.25),
    0 12px 40px rgba(196, 132, 62, 0.15);
}

.fs-f5-cta:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.fs-f5-cta svg {
  transition: transform 0.3s var(--ease-out);
}

.fs-f5-cta:hover svg {
  transform: translateX(4px);
}

.fs-f5-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-subtle);
  text-transform: uppercase;
}


/* ────────────────────────────────────────────────
   PLAYHEAD (Signature: "Frame Advance")
──────────────────────────────────────────────── */
.fs-playhead {
  position: absolute;
  top: 36px;
  bottom: 36px;
  left: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--color-accent) 15%,
    var(--color-accent) 85%,
    transparent 100%
  );
  z-index: 20;
  pointer-events: none;
  box-shadow:
    0 0 8px rgba(196, 132, 62, 0.4),
    0 0 24px rgba(196, 132, 62, 0.15);
  mix-blend-mode: screen;
}


/* ────────────────────────────────────────────────
   HOVER EFFECTS — Frame-level
──────────────────────────────────────────────── */
.fs-frame {
  transition: filter 0.4s var(--ease-out);
}

.fs-frame:hover {
  filter: brightness(1.08);
}

/* Frame 3 items slide on hover */
.fs-f3-item:hover .fs-f3-idx {
  color: var(--color-text);
  transition: color 0.3s var(--ease-out);
}

/* Clip-path reveal on frame 1 circle */
.fs-f1-circle {
  clip-path: circle(50% at 50% 50%);
  transition: clip-path 0.6s var(--ease-out);
}

.fs-frame--1:hover .fs-f1-circle {
  clip-path: circle(55% at 50% 50%);
}


/* ────────────────────────────────────────────────
   RESPONSIVE: Mobile (375px base)
──────────────────────────────────────────────── */
@media (max-width: 767px) {
  .fs-frame {
    width: calc(100vw - 48px);
  }

  .fs-strip-wrapper {
    height: calc(100svh - 32px);
  }

  .fs-perf-row {
    height: 28px;
  }

  .fs-perf-hole {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .fs-playhead {
    top: 28px;
    bottom: 28px;
  }

  .fs-f1-headline {
    font-size: clamp(36px, 10vw, 52px);
  }

  .fs-f2-stats {
    gap: var(--space-4);
  }

  .fs-f2-stat-num {
    font-size: clamp(24px, 7vw, 36px);
  }

  .fs-f5-serif {
    font-size: clamp(32px, 9vw, 48px);
  }

  .fs-f5-display {
    font-size: clamp(38px, 11vw, 56px);
  }

  .fs-meta-top {
    top: var(--space-3);
    left: var(--space-4);
  }

  .fs-f3-watermark {
    font-size: clamp(48px, 15vw, 80px);
  }

  .fs-frame-content {
    padding: var(--space-6);
  }
}


/* ────────────────────────────────────────────────
   RESPONSIVE: Tablet (768px+)
──────────────────────────────────────────────── */
@media (min-width: 768px) and (max-width: 1279px) {
  .fs-frame {
    width: clamp(300px, 42vw, 440px);
  }
}


/* ────────────────────────────────────────────────
   RESPONSIVE: Desktop (1280px+)
──────────────────────────────────────────────── */
@media (min-width: 1280px) {
  .fs-perf-row {
    height: 40px;
  }

  .fs-perf-hole {
    width: 16px;
    height: 16px;
  }

  .fs-playhead {
    top: 40px;
    bottom: 40px;
  }

  .fs-frame-content {
    padding: var(--space-12) var(--space-8);
  }

  .fs-f2-right {
    padding: var(--space-8);
  }

  .fs-f3-content {
    padding: var(--space-12) var(--space-8);
  }
}
</style>
