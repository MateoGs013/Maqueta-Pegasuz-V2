<script setup>
defineOptions({ name: 'NFullscreenOverlay' })

import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = defineProps({
  logo: { type: String, default: 'Studio' },
  links: {
    type: Array,
    default: () => [
      { label: 'Work', href: '#work' },
      { label: 'About', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Lab', href: '#lab' },
      { label: 'Contact', href: '#contact' }
    ]
  },
  email: { type: String, default: 'hello@studio.com' },
  social: {
    type: Array,
    default: () => [
      { label: 'Instagram', href: '#' },
      { label: 'Twitter / X', href: '#' },
      { label: 'LinkedIn', href: '#' }
    ]
  }
})

const isOpen = ref(false)
const isScrolled = ref(false)
const hoveredIndex = ref(-1)

/* Template refs */
const navBarRef = ref(null)
const logoRef = ref(null)
const hamburgerRef = ref(null)
const barTopRef = ref(null)
const barBotRef = ref(null)
const centerDotRef = ref(null)
const overlayRef = ref(null)
const panelLeftRef = ref(null)
const panelRightRef = ref(null)
const menuItemRefs = ref([])
const rightContentRef = ref(null)
const watermarkRef = ref(null)

let mm = null
let openTimeline = null
let scrollTriggerInstance = null
let focusTrapCleanup = null
let previousFocus = null

/* --- SCROLL DETECTION --- */
function handleScroll() {
  isScrolled.value = window.scrollY > 40
}

/* --- OVERLAY TOGGLE --- */
function toggleOverlay() {
  isOpen.value = !isOpen.value
}

function closeOverlay() {
  if (isOpen.value) isOpen.value = false
}

/* --- KEYBOARD --- */
function handleKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) {
    closeOverlay()
    hamburgerRef.value?.focus()
  }
}

/* --- FOCUS TRAP --- */
function setupFocusTrap() {
  const overlay = overlayRef.value
  if (!overlay) return

  const focusableSelector = 'a[href], button, [tabindex]:not([tabindex="-1"])'
  const focusables = overlay.querySelectorAll(focusableSelector)
  if (!focusables.length) return

  const first = focusables[0]
  const last = focusables[focusables.length - 1]

  function trapHandler(e) {
    if (e.key !== 'Tab') return
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  overlay.addEventListener('keydown', trapHandler)
  focusTrapCleanup = () => overlay.removeEventListener('keydown', trapHandler)
}

function teardownFocusTrap() {
  if (focusTrapCleanup) {
    focusTrapCleanup()
    focusTrapCleanup = null
  }
}

/* --- MAGNETIC HAMBURGER --- */
function handleHamburgerMove(e) {
  if (!hamburgerRef.value) return
  const rect = hamburgerRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) * 0.3
  const y = (e.clientY - rect.top - rect.height / 2) * 0.3
  gsap.to(hamburgerRef.value, { x, y, duration: 0.3, ease: 'power2.out' })
}

function handleHamburgerLeave() {
  if (!hamburgerRef.value) return
  gsap.to(hamburgerRef.value, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
}

/* --- MENU ITEM HOVER --- */
function handleItemEnter(idx, e) {
  hoveredIndex.value = idx
  const item = menuItemRefs.value[idx]
  if (!item) return
  const arrow = item.querySelector('.menu-item__arrow')
  const number = item.querySelector('.menu-item__number')
  gsap.to(item, { x: 8, duration: 0.4, ease: 'power3.out' })
  if (arrow) gsap.to(arrow, { x: 0, autoAlpha: 1, duration: 0.35, ease: 'power3.out' })
  if (number) gsap.to(number, { color: 'var(--color-accent)', duration: 0.3 })
}

function handleItemLeave(idx) {
  hoveredIndex.value = -1
  const item = menuItemRefs.value[idx]
  if (!item) return
  const arrow = item.querySelector('.menu-item__arrow')
  const number = item.querySelector('.menu-item__number')
  gsap.to(item, { x: 0, duration: 0.4, ease: 'power3.out' })
  if (arrow) gsap.to(arrow, { x: -20, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
  if (number) gsap.to(number, { color: 'var(--color-accent-muted)', duration: 0.3 })
}

/* --- EMAIL HOVER --- */
function handleEmailEnter(e) {
  const wipe = e.currentTarget.querySelector('.email-wipe')
  if (wipe) gsap.to(wipe, { scaleX: 1, transformOrigin: 'left center', duration: 0.4, ease: 'power3.out' })
}
function handleEmailLeave(e) {
  const wipe = e.currentTarget.querySelector('.email-wipe')
  if (wipe) gsap.to(wipe, { scaleX: 0, transformOrigin: 'right center', duration: 0.35, ease: 'power3.in' })
}

/* --- OPEN / CLOSE WATCHER --- */
watch(isOpen, (open) => {
  if (open) {
    previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    animateOpen()
    nextTick(() => {
      setupFocusTrap()
      /* focus first link after animation start */
      setTimeout(() => {
        const firstLink = overlayRef.value?.querySelector('.menu-item__link')
        firstLink?.focus()
      }, 600)
    })
  } else {
    document.body.style.overflow = ''
    animateClose()
    teardownFocusTrap()
    if (previousFocus) {
      previousFocus.focus()
      previousFocus = null
    }
  }
})

/* --- GSAP ANIMATIONS --- */
function animateOpen() {
  if (openTimeline) openTimeline.kill()

  openTimeline = gsap.timeline({
    defaults: { ease: 'power4.inOut' }
  })

  /* Make overlay visible */
  openTimeline.set(overlayRef.value, { visibility: 'visible', pointerEvents: 'auto' })

  /* Panels slide in */
  openTimeline.fromTo(panelLeftRef.value,
    { xPercent: -100 },
    { xPercent: 0, duration: 0.6, ease: 'power4.inOut' },
    0
  )
  openTimeline.fromTo(panelRightRef.value,
    { xPercent: 100 },
    { xPercent: 0, duration: 0.6, ease: 'power4.inOut' },
    0.05
  )

  /* Watermark */
  openTimeline.fromTo(watermarkRef.value,
    { autoAlpha: 0, scale: 0.9 },
    { autoAlpha: 0.02, scale: 1, duration: 0.8, ease: 'power2.out' },
    0.3
  )

  /* Menu items reveal — overflow hidden wrappers */
  const menuInners = menuItemRefs.value.map(el => el?.querySelector('.menu-item__inner')).filter(Boolean)
  openTimeline.fromTo(menuInners,
    { yPercent: 110 },
    { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 },
    0.4
  )

  /* Menu item numbers — appear slightly before labels */
  const menuNumbers = menuItemRefs.value.map(el => el?.querySelector('.menu-item__number')).filter(Boolean)
  openTimeline.fromTo(menuNumbers,
    { autoAlpha: 0, x: -8 },
    { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 },
    0.35
  )

  /* Menu item lines */
  const menuLines = menuItemRefs.value.map(el => el?.querySelector('.menu-item__line')).filter(Boolean)
  openTimeline.fromTo(menuLines,
    { scaleX: 0, transformOrigin: 'left center' },
    { scaleX: 1, duration: 0.6, ease: 'power3.inOut', stagger: 0.06 },
    0.5
  )

  /* Right side content */
  openTimeline.fromTo(
    rightContentRef.value?.querySelectorAll('.right-reveal') || [],
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.06 },
    0.7
  )

  /* Hamburger morph to X */
  openTimeline.to(barTopRef.value, {
    y: 5, rotation: 45, duration: 0.35, ease: 'power3.inOut'
  }, 0)
  openTimeline.to(barBotRef.value, {
    y: -5, rotation: -45, duration: 0.35, ease: 'power3.inOut'
  }, 0)
  openTimeline.fromTo(centerDotRef.value,
    { scale: 0 },
    { scale: 1, duration: 0.3, ease: 'back.out(2)' },
    0.15
  )
}

function animateClose() {
  if (openTimeline) openTimeline.kill()

  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => {
      gsap.set(overlayRef.value, { visibility: 'hidden', pointerEvents: 'none' })
    }
  })

  /* Menu items hide upward */
  const menuInners = menuItemRefs.value.map(el => el?.querySelector('.menu-item__inner')).filter(Boolean)
  tl.to(menuInners, {
    yPercent: -110, duration: 0.45, ease: 'power3.in', stagger: { each: 0.04, from: 'end' }
  }, 0)

  /* Right side fades out */
  tl.to(
    rightContentRef.value?.querySelectorAll('.right-reveal') || [],
    { autoAlpha: 0, y: -8, duration: 0.3, ease: 'power2.in', stagger: 0.03 },
    0
  )

  /* Watermark */
  tl.to(watermarkRef.value, { autoAlpha: 0, duration: 0.3 }, 0)

  /* Lines */
  const menuLines = menuItemRefs.value.map(el => el?.querySelector('.menu-item__line')).filter(Boolean)
  tl.to(menuLines, { scaleX: 0, transformOrigin: 'right center', duration: 0.3, stagger: 0.03 }, 0)

  /* Numbers */
  const menuNumbers = menuItemRefs.value.map(el => el?.querySelector('.menu-item__number')).filter(Boolean)
  tl.to(menuNumbers, { autoAlpha: 0, duration: 0.2 }, 0)

  /* Panels slide out */
  tl.to(panelLeftRef.value, { xPercent: -100, duration: 0.55, ease: 'power4.inOut' }, 0.2)
  tl.to(panelRightRef.value, { xPercent: 100, duration: 0.55, ease: 'power4.inOut' }, 0.22)

  /* Hamburger morph back */
  tl.to(barTopRef.value, { y: 0, rotation: 0, duration: 0.35, ease: 'power3.inOut' }, 0)
  tl.to(barBotRef.value, { y: 0, rotation: 0, duration: 0.35, ease: 'power3.inOut' }, 0)
  tl.to(centerDotRef.value, { scale: 0, duration: 0.2, ease: 'power2.in' }, 0)

  openTimeline = tl
}

/* --- LIFECYCLE --- */
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)

  mm = gsap.matchMedia()
  mm.add({
    isDesktop: '(min-width: 1280px)',
    isTablet: '(min-width: 768px) and (max-width: 1279px)',
    isMobile: '(max-width: 767px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { reduceMotion } = context.conditions
    if (reduceMotion) return

    /* Top bar entrance */
    gsap.from(logoRef.value, {
      autoAlpha: 0, x: -10, duration: 0.8, ease: 'power2.out', delay: 0.3
    })
    gsap.from(hamburgerRef.value, {
      autoAlpha: 0, x: 10, duration: 0.8, ease: 'power2.out', delay: 0.4
    })

    /* Scroll-linked top bar background transition */
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: document.body,
      start: 'top -40',
      end: 'top -41',
      onEnter: () => { isScrolled.value = true },
      onLeaveBack: () => { isScrolled.value = false }
    })
  }, navBarRef.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  teardownFocusTrap()
  if (openTimeline) openTimeline.kill()
  if (mm) mm.revert()
  document.body.style.overflow = ''
})

/* Pad index number */
function padIndex(i) {
  return String(i + 1).padStart(2, '0')
}
</script>

<template>
  <!-- TOP BAR -->
  <header
    ref="navBarRef"
    class="n-topbar"
    :class="{ 'is-scrolled': isScrolled, 'is-open': isOpen }"
  >
    <div class="n-topbar__inner">
      <!-- Logo -->
      <a ref="logoRef" href="/" class="n-topbar__logo" aria-label="Home">
        {{ logo }}
      </a>

      <!-- Hamburger -->
      <button
        ref="hamburgerRef"
        class="n-topbar__hamburger"
        :aria-expanded="isOpen"
        aria-controls="nav-overlay"
        :aria-label="isOpen ? 'Close navigation' : 'Open navigation'"
        data-magnetic
        @click="toggleOverlay"
        @mousemove="handleHamburgerMove"
        @mouseleave="handleHamburgerLeave"
      >
        <span class="hamburger-bars">
          <span ref="barTopRef" class="hamburger-bar hamburger-bar--top" />
          <span ref="centerDotRef" class="hamburger-dot" />
          <span ref="barBotRef" class="hamburger-bar hamburger-bar--bot" />
        </span>
      </button>
    </div>
  </header>

  <!-- OVERLAY -->
  <div
    id="nav-overlay"
    ref="overlayRef"
    class="n-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Navigation menu"
  >
    <!-- Split panels -->
    <div ref="panelLeftRef" class="n-overlay__panel n-overlay__panel--left" />
    <div ref="panelRightRef" class="n-overlay__panel n-overlay__panel--right" />

    <!-- Grain texture -->
    <div class="n-overlay__grain" aria-hidden="true" />

    <!-- Watermark -->
    <div ref="watermarkRef" class="n-overlay__watermark" aria-hidden="true">
      Menu
    </div>

    <!-- Content layer -->
    <div class="n-overlay__content">
      <!-- Left: Menu items -->
      <nav class="n-overlay__left" aria-label="Main navigation">
        <ul class="menu-list">
          <li
            v-for="(link, i) in links"
            :key="link.label"
            :ref="el => { if (el) menuItemRefs[i] = el }"
            class="menu-item"
            :class="{
              'is-dimmed': hoveredIndex !== -1 && hoveredIndex !== i
            }"
            @mouseenter="handleItemEnter(i, $event)"
            @mouseleave="handleItemLeave(i)"
          >
            <span class="menu-item__number">{{ padIndex(i) }}</span>
            <div class="menu-item__label-wrap">
              <a
                :href="link.href"
                class="menu-item__link"
                @click.prevent="closeOverlay"
              >
                <span class="menu-item__inner" :class="i % 2 === 0 ? 'is-serif' : 'is-display'">
                  {{ link.label }}
                </span>
              </a>
            </div>
            <span class="menu-item__arrow" aria-hidden="true">&rarr;</span>
            <span class="menu-item__line" aria-hidden="true" />
          </li>
        </ul>
      </nav>

      <!-- Right: Contact + Social -->
      <aside ref="rightContentRef" class="n-overlay__right">
        <div class="right-section right-reveal">
          <span class="right-label">Let's talk</span>
          <a
            :href="'mailto:' + email"
            class="right-email"
            @mouseenter="handleEmailEnter"
            @mouseleave="handleEmailLeave"
          >
            <span class="right-email__text">{{ email }}</span>
            <span class="email-wipe" aria-hidden="true" />
          </a>
        </div>

        <div class="right-divider right-reveal" aria-hidden="true" />

        <div class="right-section right-section--social right-reveal">
          <a
            v-for="s in social"
            :key="s.label"
            :href="s.href"
            class="right-social-link"
          >
            {{ s.label }}
          </a>
        </div>

        <div class="right-copyright right-reveal">
          <span>&copy; {{ new Date().getFullYear() }} {{ logo }}</span>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════
   TOP BAR
   ═══════════════════════════════════════════ */

.n-topbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  z-index: var(--z-nav, 900);
  transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1),
              backdrop-filter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  background: transparent;
}

.n-topbar.is-scrolled {
  background: rgba(13, 11, 9, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.n-topbar.is-open {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.n-topbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 var(--space-8, 32px);
}

/* Logo */
.n-topbar__logo {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.2em;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  text-decoration: none;
  text-transform: uppercase;
  position: relative;
  z-index: calc(var(--z-nav, 900) + 2);
  transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-topbar__logo:hover {
  color: var(--color-text, #f5f0e8);
}

.n-topbar__logo:focus-visible {
  outline: 1px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
}

/* Hamburger */
.n-topbar__hamburger {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: calc(var(--z-nav, 900) + 2);
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.n-topbar__hamburger:focus-visible {
  outline: 1px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: 2px;
}

.hamburger-bars {
  width: 24px;
  height: 14px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.hamburger-bar {
  display: block;
  width: 24px;
  height: 1.5px;
  background: var(--color-text, #f5f0e8);
  transform-origin: center center;
}

.hamburger-dot {
  display: block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-accent, #c4843e);
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -1.5px;
  margin-left: -1.5px;
  transform: scale(0);
}


/* ═══════════════════════════════════════════
   OVERLAY
   ═══════════════════════════════════════════ */

.n-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: calc(var(--z-nav, 900) - 1);
  visibility: hidden;
  pointer-events: none;
  overflow: hidden;
}

/* Split panels */
.n-overlay__panel {
  position: absolute;
  top: 0;
  height: 100%;
}

.n-overlay__panel--left {
  left: 0;
  width: 55%;
  background: var(--color-canvas, #0d0b09);
  transform: translateX(-100%);
}

.n-overlay__panel--right {
  right: 0;
  width: 45%;
  background: var(--color-canvas-alt, #141210);
  transform: translateX(100%);
  border-left: 1px solid rgba(255, 255, 255, 0.04);
}

/* Grain */
.n-overlay__grain {
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-repeat: repeat;
  opacity: 0.04;
  pointer-events: none;
  z-index: 2;
  animation: grain 0.5s steps(6) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5%, -5%); }
  50% { transform: translate(5%, 0); }
  75% { transform: translate(0, 5%); }
}

/* Watermark */
.n-overlay__watermark {
  position: absolute;
  top: 50%;
  left: 27.5%;
  transform: translate(-50%, -50%);
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(80px, 12vw, 200px);
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--color-text, #f5f0e8);
  opacity: 0;
  pointer-events: none;
  z-index: 1;
  text-transform: uppercase;
  user-select: none;
}

/* Content */
.n-overlay__content {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  z-index: 3;
}

/* Left panel content */
.n-overlay__left {
  width: 55%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 96px 64px 64px;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Menu item */
.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-6, 24px);
  padding: var(--space-4, 16px) 0;
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-item.is-dimmed {
  opacity: 0.35;
}

.menu-item__number {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: var(--text-label, 11px);
  letter-spacing: 0.1em;
  color: var(--color-accent-muted, rgba(196, 132, 62, 0.55));
  min-width: 28px;
  flex-shrink: 0;
  opacity: 0;
}

.menu-item__label-wrap {
  overflow: hidden;
  flex: 1;
}

.menu-item__link {
  display: block;
  text-decoration: none;
  color: var(--color-text, #f5f0e8);
}

.menu-item__link:focus-visible {
  outline: 1px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
}

.menu-item__inner {
  display: block;
  font-size: clamp(40px, 6vw, 88px);
  line-height: 1.06;
  letter-spacing: -0.03em;
  transform: translateY(110%);
}

.menu-item__inner.is-serif {
  font-family: var(--font-serif, 'Cormorant Garamond', serif);
  font-weight: 300;
  font-style: italic;
}

.menu-item__inner.is-display {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
}

.menu-item__arrow {
  font-size: clamp(18px, 2vw, 28px);
  color: var(--color-accent, #c4843e);
  opacity: 0;
  transform: translateX(-20px);
  flex-shrink: 0;
}

.menu-item__line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  transform: scaleX(0);
  transform-origin: left center;
}


/* ═══════════════════════════════════════════
   RIGHT PANEL
   ═══════════════════════════════════════════ */

.n-overlay__right {
  width: 45%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 96px 48px 64px;
  gap: var(--space-8, 32px);
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.right-label {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: var(--text-body, 14px);
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  letter-spacing: 0.06em;
}

.right-email {
  position: relative;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: clamp(18px, 2vw, 28px);
  color: var(--color-text, #f5f0e8);
  text-decoration: none;
  display: inline-block;
  padding-bottom: 4px;
  width: fit-content;
}

.right-email:focus-visible {
  outline: 1px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
}

.right-email__text {
  position: relative;
  z-index: 1;
}

.email-wipe {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1.5px;
  background: var(--color-accent, #c4843e);
  transform: scaleX(0);
  transform-origin: left center;
}

.right-divider {
  width: 48px;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.right-section--social {
  gap: var(--space-3, 12px);
}

.right-social-link {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 13px;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  text-decoration: none;
  transition: color 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-block;
  width: fit-content;
}

.right-social-link:hover {
  color: var(--color-text, #f5f0e8);
  transform: translateX(6px);
}

.right-social-link:focus-visible {
  outline: 1px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
}

.right-copyright {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: var(--text-label, 11px);
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: 0.05em;
  margin-top: auto;
  padding-top: var(--space-8, 32px);
}


/* ═══════════════════════════════════════════
   ATMOSPHERIC PSEUDO-ELEMENTS
   ═══════════════════════════════════════════ */

/* Subtle radial glow on left panel */
.n-overlay__panel--left::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60%;
  background: radial-gradient(
    ellipse at 20% 80%,
    rgba(196, 132, 62, 0.04) 0%,
    transparent 70%
  );
  pointer-events: none;
}

/* Subtle vertical gradient on right panel */
.n-overlay__panel--right::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(245, 240, 232, 0.015) 0%,
    transparent 40%
  );
  pointer-events: none;
}

/* Top bar subtle line */
.n-topbar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--space-8, 32px);
  right: var(--space-8, 32px);
  height: 1px;
  background: rgba(255, 255, 255, 0.04);
  opacity: 0;
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-topbar.is-scrolled::after {
  opacity: 1;
}


/* ═══════════════════════════════════════════
   RESPONSIVE — TABLET
   ═══════════════════════════════════════════ */

@media (max-width: 1279px) {
  .n-overlay__left {
    width: 55%;
    padding: 80px 40px 48px;
  }

  .n-overlay__right {
    width: 45%;
    padding: 80px 32px 48px;
  }

  .n-overlay__panel--left {
    width: 55%;
  }

  .n-overlay__panel--right {
    width: 45%;
  }
}


/* ═══════════════════════════════════════════
   RESPONSIVE — MOBILE
   ═══════════════════════════════════════════ */

@media (max-width: 767px) {
  .n-topbar__inner {
    padding: 0 var(--space-4, 16px);
  }

  .n-overlay__content {
    flex-direction: column;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .n-overlay__panel--left {
    width: 100%;
    height: 100%;
  }

  .n-overlay__panel--right {
    display: none;
  }

  .n-overlay__left {
    width: 100%;
    padding: 96px var(--space-6, 24px) 32px;
    flex: 0 0 auto;
  }

  .n-overlay__right {
    width: 100%;
    padding: var(--space-6, 24px) var(--space-6, 24px) 48px;
    justify-content: flex-start;
    gap: var(--space-6, 24px);
    flex: 0 0 auto;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }

  .menu-item__inner {
    font-size: clamp(32px, 10vw, 56px);
  }

  .menu-item__arrow {
    display: none;
  }

  .menu-item__number {
    min-width: 22px;
  }

  .right-copyright {
    margin-top: var(--space-8, 32px);
    padding-top: 0;
  }

  .n-overlay__watermark {
    left: 50%;
    font-size: clamp(60px, 20vw, 120px);
  }
}
</style>
