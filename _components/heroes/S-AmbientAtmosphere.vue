<script setup>
defineOptions({ name: 'SAmbientAtmosphere' })

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const sectionRef = ref(null)
const canvasRef = ref(null)
const headlineGroupRef = ref(null)
const eyebrowRef = ref(null)
const line1InnerRef = ref(null)
const line2InnerRef = ref(null)
const sublineRef = ref(null)
const ctaGroupRef = ref(null)
const navRef = ref(null)
const scrollIndicatorRef = ref(null)
const primaryCtaRef = ref(null)

let mm = null
let animFrameId = null
let cleanupResizeFn = null
let particles = []
let mousePos = { x: -9999, y: -9999 }
let isMouseInSection = false

// Particle config — responsive
const getParticleCount = () => {
  if (typeof window === 'undefined') return 120
  if (window.innerWidth < 768) return 60
  if (window.innerWidth < 1280) return 90
  return 120
}

// Colors for particles (from palette)
const PARTICLE_COLORS = [
  { r: 245, g: 240, b: 232, a: 0.3 },  // warm cream
  { r: 245, g: 240, b: 232, a: 0.25 },  // warm cream lighter
  { r: 196, g: 132, b: 62, a: 0.4 },    // accent amber
  { r: 196, g: 132, b: 62, a: 0.3 },    // accent amber lighter
  { r: 220, g: 190, b: 150, a: 0.2 },   // warm midtone
]

const CONNECTION_DIST = 120
const MOUSE_RADIUS = 150

function initParticles(canvas) {
  const count = getParticleCount()
  particles = []
  for (let i = 0; i < count; i++) {
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, // -0.2 to 0.2 base
      vy: (Math.random() - 0.5) * 0.4,
      baseVx: 0,
      baseVy: 0,
      radius: 1 + Math.random() * 2,
      color,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.012, // unique sine speed
    })
    particles[i].baseVx = particles[i].vx
    particles[i].baseVy = particles[i].vy
  }
}

function drawParticles(ctx, canvas, time) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const w = canvas.width
  const h = canvas.height

  // Update and draw particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]

    // Mouse repulsion
    if (isMouseInSection) {
      const dx = p.x - mousePos.x
      const dy = p.y - mousePos.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (1 - dist / MOUSE_RADIUS) * 0.5
        p.x += (dx / dist) * force
        p.y += (dy / dist) * force
      }
    }

    // Drift
    p.x += p.baseVx
    p.y += p.baseVy

    // Wrap edges
    if (p.x < 0) p.x = w
    if (p.x > w) p.x = 0
    if (p.y < 0) p.y = h
    if (p.y > h) p.y = 0

    // Opacity oscillation
    const alpha = 0.1 + 0.5 * (0.5 + 0.5 * Math.sin(time * p.pulseSpeed + p.phase))
    const finalAlpha = alpha * p.color.a

    // Draw particle
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${finalAlpha})`
    ctx.fill()
  }

  // Draw connections
  ctx.lineWidth = 0.5
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < CONNECTION_DIST) {
        const lineAlpha = 0.04 * (1 - dist / CONNECTION_DIST)
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `rgba(196,132,62,${lineAlpha})`
        ctx.stroke()
      }
    }
  }
}

function startParticleLoop() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  function handleResize() {
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * (window.devicePixelRatio || 1)
    canvas.height = rect.height * (window.devicePixelRatio || 1)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)
    initParticles({ width: rect.width, height: rect.height })
  }

  handleResize()
  window.addEventListener('resize', handleResize)

  function loop(now) {
    const rect = canvas.getBoundingClientRect()
    drawParticles(ctx, { width: rect.width, height: rect.height }, now)
    animFrameId = requestAnimationFrame(loop)
  }

  animFrameId = requestAnimationFrame(loop)

  return () => {
    window.removeEventListener('resize', handleResize)
  }
}

// Mouse tracking for canvas
function handleMouseMove(e) {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  mousePos.x = e.clientX - rect.left
  mousePos.y = e.clientY - rect.top
  isMouseInSection = true
}

function handleMouseLeave() {
  isMouseInSection = false
  mousePos.x = -9999
  mousePos.y = -9999
}

// Magnetic CTA
let quickToX = null
let quickToY = null

function handleCtaMouse(e) {
  if (!primaryCtaRef.value) return
  const rect = primaryCtaRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) * 0.3
  const y = (e.clientY - rect.top - rect.height / 2) * 0.3
  if (quickToX && quickToY) {
    quickToX(x)
    quickToY(y)
  }
}

function handleCtaLeave() {
  if (quickToX && quickToY) {
    quickToX(0)
    quickToY(0)
  }
}

onMounted(() => {
  // Start particle system
  cleanupResizeFn = startParticleLoop()

  // Mouse events for canvas interaction
  sectionRef.value?.addEventListener('mousemove', handleMouseMove)
  sectionRef.value?.addEventListener('mouseleave', handleMouseLeave)

  // Magnetic CTA
  if (primaryCtaRef.value) {
    quickToX = gsap.quickTo(primaryCtaRef.value, 'x', { duration: 0.3, ease: 'power2.out' })
    quickToY = gsap.quickTo(primaryCtaRef.value, 'y', { duration: 0.3, ease: 'power2.out' })
    primaryCtaRef.value.addEventListener('mousemove', handleCtaMouse)
    primaryCtaRef.value.addEventListener('mouseleave', handleCtaLeave)
  }

  // GSAP matchMedia
  mm = gsap.matchMedia()
  mm.add({
    isDesktop: '(min-width: 1280px)',
    isTablet: '(min-width: 768px) and (max-width: 1279px)',
    isMobile: '(max-width: 767px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { isDesktop, isTablet, isMobile, reduceMotion } = context.conditions

    if (reduceMotion) {
      // Immediately show everything, no animation
      gsap.set([eyebrowRef.value, line1InnerRef.value, line2InnerRef.value, sublineRef.value], { autoAlpha: 1, y: 0, yPercent: 0 })
      if (ctaGroupRef.value) {
        gsap.set(ctaGroupRef.value.querySelectorAll('.cta-btn'), { autoAlpha: 1, y: 0 })
      }
      if (navRef.value) {
        gsap.set(navRef.value.querySelectorAll('.nav-item'), { autoAlpha: 1, y: 0 })
      }
      gsap.set(scrollIndicatorRef.value, { autoAlpha: 1 })
      return
    }

    // ——— Atmospheric glow breathing (infinite, CSS-supplemented) ———
    const glow1 = sectionRef.value?.querySelector('.glow-1')
    const glow2 = sectionRef.value?.querySelector('.glow-2')
    const glow3 = sectionRef.value?.querySelector('.glow-3')

    if (glow1) {
      gsap.to(glow1, {
        x: '10vw', y: '10vh',
        duration: 18, yoyo: true, repeat: -1, ease: 'sine.inOut'
      })
    }
    if (glow2) {
      gsap.to(glow2, {
        x: '-8vw', y: '-6vh',
        duration: 22, yoyo: true, repeat: -1, ease: 'sine.inOut'
      })
    }
    if (glow3) {
      gsap.to(glow3, {
        scale: 1.15,
        duration: 12, yoyo: true, repeat: -1, ease: 'sine.inOut'
      })
    }

    // ——— Nav entrance ———
    if (navRef.value) {
      gsap.from(navRef.value.querySelectorAll('.nav-item'), {
        autoAlpha: 0, y: -10,
        stagger: 0.05, duration: 0.8, ease: 'power2.out', delay: 0.3
      })
    }

    // ——— Eyebrow ———
    gsap.from(eyebrowRef.value, {
      autoAlpha: 0, yPercent: -20,
      duration: 1.2, ease: 'power2.out', delay: 0.8
    })

    // ——— Headlines reveal ———
    gsap.from(line1InnerRef.value, {
      yPercent: 108,
      duration: 1.4, ease: 'power3.out', delay: 1.0
    })
    gsap.from(line2InnerRef.value, {
      yPercent: 108,
      duration: 1.4, ease: 'power3.out', delay: 1.15
    })

    // ——— Subline ———
    gsap.from(sublineRef.value, {
      autoAlpha: 0, y: 20,
      duration: 1, ease: 'power2.out', delay: 1.5
    })

    // ——— CTAs ———
    if (ctaGroupRef.value) {
      gsap.from(ctaGroupRef.value.querySelectorAll('.cta-btn'), {
        autoAlpha: 0, y: 16,
        stagger: 0.1, duration: 0.9, ease: 'power2.out', delay: 1.7
      })
    }

    // ——— Scroll indicator ———
    gsap.from(scrollIndicatorRef.value, {
      autoAlpha: 0,
      duration: 1.2, ease: 'power2.out', delay: 2.2
    })

    // ——— Headline group breathing ———
    gsap.to(headlineGroupRef.value, {
      scale: 1.002,
      duration: 8, yoyo: true, repeat: -1, ease: 'sine.inOut'
    })

    // ——— Scroll parallax ———
    gsap.to(headlineGroupRef.value, {
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    })

    gsap.to(eyebrowRef.value, {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    })

    // ——— Canvas parallax (subtle) ———
    gsap.to(canvasRef.value, {
      y: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
      }
    })

  }, sectionRef.value)
})

onBeforeUnmount(() => {
  mm?.revert()
  if (animFrameId) cancelAnimationFrame(animFrameId)
  cleanupResizeFn?.()
  sectionRef.value?.removeEventListener('mousemove', handleMouseMove)
  sectionRef.value?.removeEventListener('mouseleave', handleMouseLeave)
  if (primaryCtaRef.value) {
    primaryCtaRef.value.removeEventListener('mousemove', handleCtaMouse)
    primaryCtaRef.value.removeEventListener('mouseleave', handleCtaLeave)
  }
})
</script>

<template>
  <section ref="sectionRef" class="s-ambient" aria-label="Studio hero with ambient particle atmosphere">

    <!-- Canvas particle field -->
    <canvas ref="canvasRef" class="particle-canvas" aria-hidden="true"></canvas>

    <!-- Atmospheric glows -->
    <div class="glow glow-1" aria-hidden="true"></div>
    <div class="glow glow-2" aria-hidden="true"></div>
    <div class="glow glow-3" aria-hidden="true"></div>

    <!-- Nav bar (absolute, transparent) -->
    <nav ref="navRef" class="ambient-nav" aria-label="Site navigation">
      <span class="nav-item nav-logo">Studio</span>
      <div class="nav-links">
        <a href="#work" class="nav-item nav-link">Work</a>
        <a href="#about" class="nav-item nav-link">About</a>
        <a href="#contact" class="nav-item nav-link">Contact</a>
      </div>
    </nav>

    <!-- Content layer -->
    <div class="ambient-content">
      <!-- Eyebrow -->
      <p ref="eyebrowRef" class="eyebrow">Est. 2015 &middot; Buenos Aires</p>

      <!-- Headline group -->
      <div ref="headlineGroupRef" class="headline-group">
        <h1 class="headline">
          <span class="headline-line line-1">
            <span ref="line1InnerRef" class="headline-inner">Where ideas</span>
          </span>
          <span class="headline-line line-2">
            <span ref="line2InnerRef" class="headline-inner">find <em class="accent-word">form</em></span>
          </span>
        </h1>

        <!-- Subline -->
        <p ref="sublineRef" class="subline">
          A creative studio shaping digital products with intent, precision, and a love for the craft.
        </p>
      </div>

      <!-- CTAs -->
      <div ref="ctaGroupRef" class="cta-group">
        <a
          ref="primaryCtaRef"
          href="#work"
          class="cta-btn cta-primary"
          data-magnetic
        >
          <span class="cta-label">View Work</span>
        </a>
        <a href="#contact" class="cta-btn cta-secondary">
          <span class="cta-label">Get in touch</span>
        </a>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div ref="scrollIndicatorRef" class="scroll-indicator" aria-hidden="true">
      <span class="scroll-rule"></span>
      <span class="scroll-text">Scroll</span>
    </div>

  </section>
</template>

<style scoped>
/* ═══════════════════════════════════════
   S-AmbientAtmosphere — The Breathing Canvas
   ═══════════════════════════════════════ */

.s-ambient {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-canvas);
  overflow: hidden;
  padding-top: clamp(100px, 14vh, 180px);
  padding-bottom: clamp(60px, 8vh, 100px);
}

/* Grain overlay */
.s-ambient::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-repeat: repeat;
  opacity: 0.04;
  pointer-events: none;
  z-index: 5;
  animation: grain 0.5s steps(6) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5%, -5%); }
  50% { transform: translate(5%, 0); }
  75% { transform: translate(0, 5%); }
}

/* ——— Subtle vignette pseudo-element ——— */
.s-ambient::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 70% at 50% 50%,
    transparent 40%,
    rgba(13, 11, 9, 0.5) 100%
  );
  pointer-events: none;
  z-index: 3;
}

/* ——— Canvas ——— */
.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

/* ——— Atmospheric Glows ——— */
.glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 2;
}

.glow-1 {
  width: 40vw;
  height: 40vw;
  top: 20%;
  left: 15%;
  background: radial-gradient(circle, rgba(196, 132, 62, 0.06), transparent 70%);
}

.glow-2 {
  width: 35vw;
  height: 35vw;
  bottom: 15%;
  right: 10%;
  background: radial-gradient(circle, rgba(120, 160, 140, 0.04), transparent 70%);
}

.glow-3 {
  width: 50vw;
  height: 50vw;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(196, 132, 62, 0.03), transparent 65%);
}

/* ——— Nav ——— */
.ambient-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) clamp(var(--space-6), 5vw, var(--space-16));
  z-index: var(--z-nav);
}

.nav-logo {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-subtle);
  letter-spacing: 0.04em;
  text-transform: none;
}

.nav-links {
  display: flex;
  gap: var(--space-8);
}

.nav-link {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  text-decoration: none;
  letter-spacing: 0.02em;
  transition: color 0.4s var(--ease-out);
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-accent);
  transition: width 0.5s var(--ease-out);
}

.nav-link:hover {
  color: var(--color-text);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link:focus-visible {
  outline: 1px solid var(--color-accent);
  outline-offset: 4px;
}

/* ——— Content ——— */
.ambient-content {
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0;
  max-width: 1200px;
  width: 100%;
  padding: 0 var(--space-6);
}

/* ——— Eyebrow ——— */
.eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  color: var(--color-text-subtle);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: clamp(var(--space-6), 3vh, var(--space-12));
}

/* ——— Headlines ——— */
.headline-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: center center;
}

.headline {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  margin: 0;
}

.headline-line {
  display: block;
  overflow: hidden;
  position: relative;
}

.headline-inner {
  display: block;
}

.line-1 .headline-inner {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(64px, 10vw, 140px);
  color: var(--color-text);
  line-height: 0.9;
}

.line-2 .headline-inner {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(72px, 11vw, 160px);
  color: var(--color-text);
  letter-spacing: -0.03em;
  line-height: 0.95;
}

.accent-word {
  color: var(--color-accent);
  font-style: normal;
}

/* ——— Subline ——— */
.subline {
  font-family: var(--font-body);
  font-size: var(--text-body);
  color: var(--color-text-muted);
  max-width: 380px;
  text-align: center;
  line-height: var(--leading-relaxed);
  margin-top: clamp(var(--space-6), 3vh, var(--space-8));
}

/* ——— CTAs ——— */
.cta-group {
  display: flex;
  gap: var(--space-4);
  margin-top: clamp(48px, 5vh, 60px);
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-8);
  font-family: var(--font-body);
  font-size: 13px;
  letter-spacing: 0.06em;
  text-decoration: none;
  border-radius: 2px;
  transition: border-color 0.4s var(--ease-out), color 0.4s var(--ease-out), background 0.4s var(--ease-out);
  min-height: 44px;
  min-width: 44px;
  cursor: pointer;
  position: relative;
}

.cta-btn:focus-visible {
  outline: 1px solid var(--color-accent);
  outline-offset: 3px;
}

.cta-primary {
  border: 1px solid var(--color-text-subtle);
  color: var(--color-text);
  background: transparent;
  overflow: hidden;
}

.cta-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-accent-subtle);
  clip-path: inset(0 100% 0 0);
  transition: clip-path 0.5s var(--ease-out);
  z-index: 0;
}

.cta-primary:hover::before {
  clip-path: inset(0 0% 0 0);
}

.cta-primary:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.cta-secondary {
  border: 1px solid rgba(245, 240, 232, 0.1);
  color: var(--color-text-muted);
  background: transparent;
}

.cta-secondary:hover {
  border-color: var(--color-text-subtle);
  color: var(--color-text);
}

.cta-label {
  position: relative;
  z-index: 1;
}

/* ——— Scroll indicator ——— */
.scroll-indicator {
  position: absolute;
  bottom: clamp(var(--space-8), 5vh, var(--space-16));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  z-index: 4;
}

.scroll-rule {
  display: block;
  width: 1px;
  height: 40px;
  background: var(--color-text-subtle);
  opacity: 0.4;
}

.scroll-text {
  font-family: var(--font-mono);
  font-size: var(--text-label-sm);
  color: var(--color-text-subtle);
  writing-mode: vertical-rl;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

/* ═══════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════ */

/* Mobile */
@media (max-width: 767px) {
  .s-ambient {
    padding-top: clamp(80px, 12vh, 120px);
    padding-bottom: clamp(50px, 7vh, 80px);
  }

  .nav-links {
    gap: var(--space-6);
  }

  .ambient-nav {
    padding: var(--space-4) var(--space-4);
  }

  .glow-1 {
    width: 60vw;
    height: 60vw;
  }

  .glow-2 {
    width: 50vw;
    height: 50vw;
  }

  .glow-3 {
    width: 70vw;
    height: 70vw;
  }

  .cta-group {
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
  }

  .cta-btn {
    width: 100%;
    max-width: 260px;
    justify-content: center;
  }

  .subline {
    max-width: 300px;
  }

  .scroll-indicator {
    bottom: var(--space-6);
  }

  .scroll-rule {
    height: 28px;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1279px) {
  .glow-1 {
    width: 45vw;
    height: 45vw;
  }

  .glow-2 {
    width: 40vw;
    height: 40vw;
  }
}

/* Desktop */
@media (min-width: 1280px) {
  .ambient-nav {
    padding: var(--space-8) clamp(var(--space-8), 5vw, 80px);
  }
}
</style>
