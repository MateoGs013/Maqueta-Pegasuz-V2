<script setup>
defineOptions({ name: 'NMinimalHamburger' })

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
  location: { type: String, default: 'Buenos Aires, AR' },
  available: { type: Boolean, default: true }
})

const isOpen = ref(false)
const hoveredIndex = ref(-1)

/* Template refs */
const navBarRef = ref(null)
const logoRef = ref(null)
const hamburgerRef = ref(null)
const line1Ref = ref(null)
const line2Ref = ref(null)
const line3Ref = ref(null)
const overlayRef = ref(null)
const panelRef = ref(null)
const ruleRef = ref(null)
const menuItemRefs = ref([])
const footerRef = ref(null)
const statusRef = ref(null)
const contactRef = ref(null)
const socialRef = ref(null)
const copyrightRef = ref(null)

let mm = null
let hamburgerTl = null
let panelOpenTl = null
let focusTrapCleanup = null
let previousFocus = null

/* --- OVERLAY TOGGLE --- */
function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  if (isOpen.value) isOpen.value = false
}

/* --- KEYBOARD --- */
function handleKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) {
    closeMenu()
    hamburgerRef.value?.focus()
  }
}

/* --- FOCUS TRAP --- */
function setupFocusTrap() {
  const panel = panelRef.value
  if (!panel) return

  const focusableSelector = 'a[href], button, [tabindex]:not([tabindex="-1"])'
  const focusables = panel.querySelectorAll(focusableSelector)
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

  panel.addEventListener('keydown', trapHandler)
  focusTrapCleanup = () => panel.removeEventListener('keydown', trapHandler)
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
function handleItemEnter(idx) {
  hoveredIndex.value = idx
  const item = menuItemRefs.value[idx]
  if (!item) return
  const label = item.querySelector('.panel-item__label')
  const number = item.querySelector('.panel-item__number')
  const divider = item.querySelector('.panel-item__divider')
  if (label) gsap.to(label, { x: 8, duration: 0.35, ease: 'power3.out' })
  if (number) gsap.to(number, { x: -4, color: 'var(--color-accent, #c4843e)', duration: 0.3, ease: 'power2.out' })
  if (divider) gsap.to(divider, { boxShadow: '0 1px 0 var(--color-accent-muted, rgba(196,132,62,0.55))', duration: 0.3 })
}

function handleItemLeave(idx) {
  hoveredIndex.value = -1
  const item = menuItemRefs.value[idx]
  if (!item) return
  const label = item.querySelector('.panel-item__label')
  const number = item.querySelector('.panel-item__number')
  const divider = item.querySelector('.panel-item__divider')
  if (label) gsap.to(label, { x: 0, duration: 0.35, ease: 'power3.out' })
  if (number) gsap.to(number, { x: 0, color: 'var(--color-text-subtle, rgba(245,240,232,0.22))', duration: 0.3, ease: 'power2.out' })
  if (divider) gsap.to(divider, { boxShadow: '0 1px 0 transparent', duration: 0.3 })
}

/* --- OPEN / CLOSE WATCHER --- */
watch(isOpen, (open) => {
  if (open) {
    previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    animateOpen()
    nextTick(() => {
      setupFocusTrap()
      setTimeout(() => {
        const firstLink = panelRef.value?.querySelector('.panel-item__link')
        firstLink?.focus()
      }, 500)
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

/* --- HAMBURGER MORPH TIMELINE --- */
function buildHamburgerTimeline() {
  hamburgerTl = gsap.timeline({ paused: true })
  hamburgerTl
    .to(line2Ref.value, {
      autoAlpha: 0,
      x: 10,
      duration: 0.2,
      ease: 'power2.in'
    }, 0)
    .to(line1Ref.value, {
      y: 6.5,
      rotation: 45,
      width: 24,
      duration: 0.35,
      ease: 'power3.inOut'
    }, 0.05)
    .to(line3Ref.value, {
      y: -6.5,
      rotation: -45,
      width: 24,
      duration: 0.35,
      ease: 'power3.inOut'
    }, 0.05)
}

/* --- PANEL ANIMATIONS --- */
function animateOpen() {
  if (panelOpenTl) panelOpenTl.kill()

  /* Play hamburger morph */
  hamburgerTl?.play()

  panelOpenTl = gsap.timeline({
    defaults: { ease: 'power3.out' }
  })

  /* Show overlay */
  panelOpenTl.set(overlayRef.value, { visibility: 'visible', pointerEvents: 'auto' })

  /* Overlay fade */
  panelOpenTl.fromTo(overlayRef.value, {
    autoAlpha: 0
  }, {
    autoAlpha: 1,
    duration: 0.4,
    ease: 'power2.out'
  }, 0)

  /* Panel slide in */
  panelOpenTl.fromTo(panelRef.value, {
    x: '100%'
  }, {
    x: '0%',
    duration: 0.6,
    ease: 'power4.inOut'
  }, 0)

  /* Accent rule */
  panelOpenTl.fromTo(ruleRef.value, {
    scaleX: 0,
    transformOrigin: 'left center'
  }, {
    scaleX: 1,
    duration: 0.4,
    ease: 'power2.out'
  }, 0.3)

  /* Menu items stagger */
  const items = menuItemRefs.value.filter(Boolean)
  panelOpenTl.fromTo(items, {
    x: 24,
    autoAlpha: 0
  }, {
    x: 0,
    autoAlpha: 1,
    stagger: 0.07,
    duration: 0.5,
    ease: 'power3.out'
  }, 0.25)

  /* Footer elements */
  const footerEls = [statusRef.value, contactRef.value, socialRef.value, copyrightRef.value].filter(Boolean)
  panelOpenTl.fromTo(footerEls, {
    autoAlpha: 0,
    y: 10
  }, {
    autoAlpha: 1,
    y: 0,
    duration: 0.4,
    ease: 'power2.out',
    stagger: 0.06
  }, 0.6)
}

function animateClose() {
  if (panelOpenTl) panelOpenTl.kill()

  /* Reverse hamburger morph */
  hamburgerTl?.reverse()

  const tl = gsap.timeline({
    defaults: { ease: 'power3.in' },
    onComplete: () => {
      gsap.set(overlayRef.value, { visibility: 'hidden', pointerEvents: 'none' })
    }
  })

  /* Footer out */
  const footerEls = [copyrightRef.value, socialRef.value, contactRef.value, statusRef.value].filter(Boolean)
  tl.to(footerEls, {
    autoAlpha: 0,
    y: -6,
    duration: 0.25,
    ease: 'power2.in',
    stagger: 0.03
  }, 0)

  /* Menu items out (reverse stagger) */
  const items = menuItemRefs.value.filter(Boolean)
  tl.to(items, {
    x: 20,
    autoAlpha: 0,
    duration: 0.35,
    ease: 'power3.in',
    stagger: { each: 0.04, from: 'end' }
  }, 0.05)

  /* Rule collapse */
  tl.to(ruleRef.value, {
    scaleX: 0,
    transformOrigin: 'right center',
    duration: 0.3,
    ease: 'power2.in'
  }, 0.1)

  /* Panel slide out */
  tl.to(panelRef.value, {
    x: '100%',
    duration: 0.5,
    ease: 'power4.inOut'
  }, 0.15)

  /* Overlay fade */
  tl.to(overlayRef.value, {
    autoAlpha: 0,
    duration: 0.3,
    ease: 'power2.in'
  }, 0.2)

  panelOpenTl = tl
}

/* --- LIFECYCLE --- */
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)

  buildHamburgerTimeline()

  mm = gsap.matchMedia()
  mm.add({
    isDesktop: '(min-width: 1280px)',
    isMobile: '(max-width: 767px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { reduceMotion } = context.conditions
    if (reduceMotion) return

    /* Top bar entrance */
    gsap.from(logoRef.value, {
      autoAlpha: 0, y: -10, duration: 0.8, ease: 'power2.out', delay: 0.3
    })
    gsap.from(hamburgerRef.value, {
      autoAlpha: 0, x: 10, duration: 0.8, ease: 'power2.out', delay: 0.4
    })
  }, navBarRef.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  teardownFocusTrap()
  if (hamburgerTl) hamburgerTl.kill()
  if (panelOpenTl) panelOpenTl.kill()
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
    class="n-minimal"
    :class="{ 'is-open': isOpen }"
  >
    <div class="n-minimal__inner">
      <!-- Logo -->
      <a ref="logoRef" href="/" class="n-minimal__logo" aria-label="Home">
        {{ logo }}
      </a>

      <!-- Hamburger -->
      <button
        ref="hamburgerRef"
        class="n-minimal__hamburger"
        :aria-expanded="isOpen"
        aria-controls="minimal-panel"
        :aria-label="isOpen ? 'Close navigation' : 'Open navigation'"
        data-magnetic
        @click="toggleMenu"
        @mousemove="handleHamburgerMove"
        @mouseleave="handleHamburgerLeave"
      >
        <span class="hamburger-lines">
          <span ref="line1Ref" class="hamburger-line hamburger-line--1" />
          <span ref="line2Ref" class="hamburger-line hamburger-line--2" />
          <span ref="line3Ref" class="hamburger-line hamburger-line--3" />
        </span>
      </button>
    </div>
  </header>

  <!-- OVERLAY (backdrop, closes on click) -->
  <div
    class="n-minimal-overlay"
    ref="overlayRef"
    @click="closeMenu"
    aria-hidden="true"
  />

  <!-- SLIDE-IN PANEL -->
  <aside
    id="minimal-panel"
    ref="panelRef"
    class="n-panel"
    role="dialog"
    aria-modal="true"
    aria-label="Navigation menu"
  >
    <!-- Grain -->
    <div class="n-panel__grain" aria-hidden="true" />

    <!-- Atmospheric glow -->
    <div class="n-panel__glow" aria-hidden="true" />

    <!-- Close button (top-right) -->
    <button
      class="n-panel__close"
      @click="closeMenu"
      aria-label="Close navigation"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <line x1="1" y1="1" x2="17" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <line x1="17" y1="1" x2="1" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>

    <!-- Accent rule -->
    <div ref="ruleRef" class="n-panel__rule" aria-hidden="true" />

    <!-- Nav links -->
    <nav class="n-panel__nav" aria-label="Main navigation">
      <ul class="panel-list">
        <li
          v-for="(link, i) in links"
          :key="link.label"
          :ref="el => { if (el) menuItemRefs[i] = el }"
          class="panel-item"
          :class="{
            'is-dimmed': hoveredIndex !== -1 && hoveredIndex !== i
          }"
          @mouseenter="handleItemEnter(i)"
          @mouseleave="handleItemLeave(i)"
        >
          <a
            :href="link.href"
            class="panel-item__link"
            @click.prevent="closeMenu"
          >
            <span class="panel-item__label">{{ link.label }}</span>
            <span class="panel-item__number">{{ padIndex(i) }}</span>
          </a>
          <span class="panel-item__divider" aria-hidden="true" />
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <footer class="n-panel__footer">
      <!-- Status -->
      <div ref="statusRef" class="panel-status" v-if="available">
        <span class="panel-status__dot" aria-hidden="true" />
        <span class="panel-status__text">Available for work</span>
      </div>

      <!-- Contact info -->
      <div ref="contactRef" class="panel-contact">
        <a :href="'mailto:' + email" class="panel-contact__email">{{ email }}</a>
        <span class="panel-contact__location">{{ location }}</span>
      </div>

      <!-- Social -->
      <div ref="socialRef" class="panel-social">
        <a href="#" class="panel-social__link">IG</a>
        <span class="panel-social__sep" aria-hidden="true">&middot;</span>
        <a href="#" class="panel-social__link">TW</a>
        <span class="panel-social__sep" aria-hidden="true">&middot;</span>
        <a href="#" class="panel-social__link">LI</a>
      </div>

      <!-- Copyright -->
      <div ref="copyrightRef" class="panel-copyright">
        &copy; {{ new Date().getFullYear() }} {{ logo }}
      </div>
    </footer>
  </aside>
</template>

<style scoped>
/* =============================================
   TOP BAR — radical minimalism
   ============================================= */

.n-minimal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: var(--z-nav, 900);
  background: transparent;
  pointer-events: none;
}

.n-minimal__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 var(--space-8, 32px);
  pointer-events: auto;
}

/* Logo */
.n-minimal__logo {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.25em;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  text-decoration: none;
  text-transform: uppercase;
  position: relative;
  z-index: calc(var(--z-nav, 900) + 2);
  transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              letter-spacing 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-minimal__logo:hover {
  color: var(--color-text, #f5f0e8);
  letter-spacing: 0.3em;
}

.n-minimal__logo:focus-visible {
  outline: 1px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
}

/* Hamburger */
.n-minimal__hamburger {
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

.n-minimal__hamburger:focus-visible {
  outline: 1px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: 2px;
}

.hamburger-lines {
  width: 24px;
  height: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}

.hamburger-line {
  display: block;
  height: 1.5px;
  background: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  border-radius: 1px;
  transform-origin: center center;
  transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              background-color 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.hamburger-line--1 {
  width: 24px;
}

.hamburger-line--2 {
  width: 16px;
}

.hamburger-line--3 {
  width: 20px;
}

/* Hover: all lines → 24px, color brighter */
.n-minimal__hamburger:hover .hamburger-line {
  width: 24px;
  background: var(--color-text, #f5f0e8);
}


/* =============================================
   OVERLAY (backdrop)
   ============================================= */

.n-minimal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: calc(var(--z-nav, 900) - 1);
  visibility: hidden;
  pointer-events: none;
  opacity: 0;
}


/* =============================================
   SLIDE-IN PANEL
   ============================================= */

.n-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  height: 100dvh;
  width: min(480px, 100vw);
  background: rgba(13, 11, 9, 0.96);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  z-index: var(--z-nav, 900);
  transform: translateX(100%);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Grain overlay */
.n-panel__grain {
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: 1;
  animation: grain 0.5s steps(6) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-5%, -5%); }
  50% { transform: translate(5%, 0); }
  75% { transform: translate(0, 5%); }
}

/* Atmospheric glow */
.n-panel__glow {
  position: absolute;
  top: 30%;
  left: -20%;
  width: 70%;
  height: 40%;
  background: radial-gradient(
    ellipse at center,
    rgba(196, 132, 62, 0.04) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
  filter: blur(40px);
}

/* Close button */
.n-panel__close {
  position: absolute;
  top: var(--space-4, 16px);
  right: var(--space-6, 24px);
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  z-index: 3;
  transition: color 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.n-panel__close:hover {
  color: var(--color-text, #f5f0e8);
  transform: rotate(90deg);
}

.n-panel__close:focus-visible {
  outline: 1px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: 2px;
}

/* Accent rule */
.n-panel__rule {
  width: 40px;
  height: 1px;
  background: var(--color-accent, #c4843e);
  margin: 80px var(--space-8, 32px) var(--space-6, 24px);
  transform-origin: left center;
  flex-shrink: 0;
}


/* =============================================
   NAV LINKS
   ============================================= */

.n-panel__nav {
  flex: 1;
  display: flex;
  align-items: flex-start;
  padding: 0 var(--space-8, 32px);
  position: relative;
  z-index: 2;
}

.panel-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.panel-item {
  position: relative;
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-item.is-dimmed {
  opacity: 0.35;
}

.panel-item__link {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  text-decoration: none;
  padding: var(--space-4, 16px) 0;
  gap: var(--space-4, 16px);
}

.panel-item__link:focus-visible {
  outline: 1px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
}

.panel-item__label {
  font-family: var(--font-serif, 'Cormorant Garamond', Georgia, serif);
  font-size: clamp(32px, 4vw, 56px);
  font-style: italic;
  font-weight: 300;
  line-height: 1.15;
  color: var(--color-text, #f5f0e8);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-item__number {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.05em;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-item__divider {
  display: block;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  transition: box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}


/* =============================================
   FOOTER
   ============================================= */

.n-panel__footer {
  padding: var(--space-8, 32px);
  padding-top: var(--space-6, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 16px);
  position: relative;
  z-index: 2;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  flex-shrink: 0;
}

/* Status indicator */
.panel-status {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
}

.panel-status__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.4);
  animation: pulse-dot 2.5s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(74, 222, 128, 0.4); }
  50% { opacity: 0.6; box-shadow: 0 0 16px rgba(74, 222, 128, 0.2); }
}

.panel-status__text {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  letter-spacing: 0.02em;
}

/* Contact */
.panel-contact {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.panel-contact__email {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 13px;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  text-decoration: none;
  transition: color 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-block;
  width: fit-content;
  position: relative;
}

.panel-contact__email::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--color-accent, #c4843e);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-contact__email:hover {
  color: var(--color-text, #f5f0e8);
}

.panel-contact__email:hover::after {
  transform: scaleX(1);
}

.panel-contact__email:focus-visible {
  outline: 1px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
}

.panel-contact__location {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 12px;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: 0.03em;
}

/* Social */
.panel-social {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding-top: var(--space-3, 12px);
}

.panel-social__link {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-social__link:hover {
  color: var(--color-text, #f5f0e8);
}

.panel-social__link:focus-visible {
  outline: 1px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
}

.panel-social__sep {
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  font-size: 14px;
  line-height: 1;
  user-select: none;
}

/* Copyright */
.panel-copyright {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: 0.05em;
  padding-top: var(--space-3, 12px);
}


/* =============================================
   RESPONSIVE — MOBILE
   ============================================= */

@media (max-width: 767px) {
  .n-minimal__inner {
    padding: 0 var(--space-4, 16px);
  }

  .n-panel {
    width: 100vw;
  }

  .n-panel__rule {
    margin-left: var(--space-6, 24px);
    margin-right: var(--space-6, 24px);
  }

  .n-panel__nav {
    padding: 0 var(--space-6, 24px);
  }

  .n-panel__footer {
    padding: var(--space-6, 24px);
  }

  .panel-item__label {
    font-size: clamp(28px, 8vw, 44px);
  }
}


/* =============================================
   RESPONSIVE — LARGE SCREENS
   ============================================= */

@media (min-width: 1280px) {
  .n-minimal__inner {
    padding: 0 var(--space-8, 32px) 0 48px;
  }

  .panel-item__link {
    padding: var(--space-6, 24px) 0;
  }
}
</style>
