<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'NHiddenReveal' })

const props = defineProps({
  logo: { type: String, default: 'Studio' },
  links: {
    type: Array,
    default: () => [
      { label: 'Work', href: '#work' },
      { label: 'About', href: '#about' },
      { label: 'Lab', href: '#lab' },
      { label: 'Contact', href: '#contact' }
    ]
  },
  showProgress: { type: Boolean, default: true },
  available: { type: Boolean, default: true }
})

const emit = defineEmits(['link-click'])

/* ── Refs ── */
const navRef = ref(null)
const navBarRef = ref(null)
const logoRef = ref(null)
const diamondRef = ref(null)
const linksContainerRef = ref(null)
const linkRefs = ref([])
const availabilityRef = ref(null)
const dotRef = ref(null)
const tooltipRef = ref(null)
const progressRef = ref(null)
const bottomGlowRef = ref(null)
const hamburgerRef = ref(null)
const mobileMenuRef = ref(null)

const mobileOpen = ref(false)
const activeLink = ref('')

let mm = null
let currentTween = null
let lastScrollY = 0
let ticking = false
let navState = 'top' // 'top' | 'scrolled' | 'hidden'
let dotPulseTween = null

function setLinkRef(el, i) {
  if (el) linkRefs.value[i] = el
}

function handleLinkClick(link, e) {
  emit('link-click', link, e)
  if (mobileOpen.value) closeMobileMenu()
}

/* ── Mobile menu ── */
function toggleMobileMenu() {
  mobileOpen.value = !mobileOpen.value
}

function closeMobileMenu() {
  if (!mobileOpen.value) return
  const menu = mobileMenuRef.value
  if (menu) {
    gsap.to(menu, {
      y: -16,
      autoAlpha: 0,
      duration: 0.35,
      ease: 'power3.in',
      onComplete: () => { mobileOpen.value = false }
    })
  } else {
    mobileOpen.value = false
  }
}

function handleOutsideClick(e) {
  if (!navRef.value) return
  if (!navRef.value.contains(e.target)) closeMobileMenu()
}

function handleEscape(e) {
  if (e.key === 'Escape' && mobileOpen.value) {
    closeMobileMenu()
    hamburgerRef.value?.focus()
  }
}

watch(mobileOpen, (open) => {
  if (open) {
    nextTick(() => {
      const menu = mobileMenuRef.value
      if (menu) {
        gsap.fromTo(menu,
          { y: -16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' }
        )
        // Stagger mobile links
        const mobileLinks = menu.querySelectorAll('.n-hidden-reveal__mobile-link')
        if (mobileLinks.length) {
          gsap.fromTo(mobileLinks,
            { autoAlpha: 0, x: -12 },
            { autoAlpha: 1, x: 0, stagger: 0.06, duration: 0.4, ease: 'power3.out', delay: 0.1 }
          )
        }
      }
    })
    document.addEventListener('click', handleOutsideClick, true)
    document.addEventListener('keydown', handleEscape)
  } else {
    document.removeEventListener('click', handleOutsideClick, true)
    document.removeEventListener('keydown', handleEscape)
  }
})

/* ── Scroll hide/reveal logic ── */
function showNav(mode) {
  if (navState === mode) return
  navState = mode
  const bar = navBarRef.value
  if (!bar) return

  currentTween?.kill()

  if (mode === 'top') {
    currentTween = gsap.to(bar, {
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      onStart: () => {
        bar.classList.remove('is-scrolled')
      }
    })
  } else if (mode === 'scrolled') {
    const wasHidden = bar.classList.contains('is-hidden')
    currentTween = gsap.to(bar, {
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
      onStart: () => {
        bar.classList.add('is-scrolled')
        bar.classList.remove('is-hidden')
      }
    })
    // Bottom glow flash on re-appear
    if (wasHidden && bottomGlowRef.value) {
      gsap.fromTo(bottomGlowRef.value,
        { autoAlpha: 0.8 },
        { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }
      )
    }
  }
}

function hideNav() {
  if (navState === 'hidden') return
  navState = 'hidden'
  const bar = navBarRef.value
  if (!bar) return

  currentTween?.kill()
  currentTween = gsap.to(bar, {
    y: '-100%',
    duration: 0.4,
    ease: 'power3.in',
    onComplete: () => {
      bar.classList.add('is-hidden')
    }
  })

  // Close mobile menu if open
  if (mobileOpen.value) closeMobileMenu()
}

function handleScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      const currentY = window.scrollY
      const direction = currentY > lastScrollY ? 'down' : 'up'
      const delta = Math.abs(currentY - lastScrollY)

      if (currentY < 80) {
        showNav('top')
      } else if (direction === 'down' && delta > 8) {
        hideNav()
      } else if (direction === 'up' && delta > 4) {
        showNav('scrolled')
      }

      lastScrollY = currentY
      ticking = false
    })
    ticking = true
  }
}

/* ── Hover effects ── */
function handleDiamondEnter() {
  if (diamondRef.value) {
    gsap.to(diamondRef.value, { scale: 1.3, duration: 0.3, ease: 'back.out(2)' })
  }
}
function handleDiamondLeave() {
  if (diamondRef.value) {
    gsap.to(diamondRef.value, { scale: 1, duration: 0.4, ease: 'power2.out' })
  }
}

/* ── Availability tooltip ── */
let tooltipQuickX = null
let tooltipQuickY = null
let tooltipVisible = false

function handleAvailabilityEnter() {
  if (!tooltipRef.value) return
  tooltipVisible = true
  gsap.to(tooltipRef.value, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' })
}

function handleAvailabilityMove(e) {
  if (!tooltipRef.value || !tooltipVisible) return
  if (!tooltipQuickX) {
    tooltipQuickX = gsap.quickTo(tooltipRef.value, 'x', { duration: 0.4, ease: 'power2.out' })
    tooltipQuickY = gsap.quickTo(tooltipRef.value, 'y', { duration: 0.4, ease: 'power2.out' })
  }
  const rect = availabilityRef.value.getBoundingClientRect()
  const offsetX = (e.clientX - rect.left - rect.width / 2) * 0.15
  tooltipQuickX(offsetX)
}

function handleAvailabilityLeave() {
  if (!tooltipRef.value) return
  tooltipVisible = false
  gsap.to(tooltipRef.value, { autoAlpha: 0, y: 4, duration: 0.25, ease: 'power2.in' })
  if (tooltipQuickX) {
    tooltipQuickX(0)
  }
}

/* ── Magnetic logo ── */
function handleLogoMousemove(e) {
  const el = logoRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) * 0.2
  const y = (e.clientY - rect.top - rect.height / 2) * 0.2
  gsap.to(el, { x, y, duration: 0.3, ease: 'power2.out' })
}

function handleLogoMouseleave() {
  if (!logoRef.value) return
  gsap.to(logoRef.value, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
}

/* ── Lifecycle ── */
onMounted(() => {
  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 769px)',
    isMobile: '(max-width: 768px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { reduceMotion, isDesktop } = context.conditions

    if (reduceMotion) {
      gsap.set(navBarRef.value, { autoAlpha: 1 })
      gsap.set(logoRef.value, { autoAlpha: 1 })
      if (diamondRef.value) gsap.set(diamondRef.value, { autoAlpha: 1, rotation: 45 })
      if (linksContainerRef.value) {
        gsap.set(linksContainerRef.value.querySelectorAll('.n-hidden-reveal__link'), { autoAlpha: 1 })
      }
      if (availabilityRef.value) gsap.set(availabilityRef.value, { autoAlpha: 1 })
      if (progressRef.value) gsap.set(progressRef.value, { autoAlpha: 1 })
      return
    }

    /* ── Entrance animation ── */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Nav bar slides down
    tl.fromTo(navBarRef.value,
      { y: -64, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1, delay: 0.3 }
    )

    // Logo
    tl.fromTo(logoRef.value,
      { autoAlpha: 0, x: -8 },
      { autoAlpha: 1, x: 0, duration: 0.7 },
      0.5
    )

    // Diamond
    if (diamondRef.value) {
      tl.fromTo(diamondRef.value,
        { autoAlpha: 0, scale: 0, rotation: 0 },
        { autoAlpha: 1, scale: 1, rotation: 45, duration: 0.6, ease: 'back.out(2.5)' },
        0.6
      )
    }

    // Nav links stagger
    if (isDesktop && linkRefs.value.length) {
      tl.fromTo(linkRefs.value,
        { autoAlpha: 0, y: -4 },
        { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.5 },
        0.6
      )
    }

    // Availability indicator
    if (availabilityRef.value) {
      tl.fromTo(availabilityRef.value,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5 },
        0.8
      )
    }

    // Progress bar
    if (progressRef.value) {
      tl.fromTo(progressRef.value,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5 },
        0.9
      )
    }

    /* ── Availability dot pulse ── */
    if (dotRef.value && props.available) {
      dotPulseTween = gsap.to(dotRef.value, {
        scale: 1.6,
        autoAlpha: 0.3,
        duration: 1,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      })
    }

    /* ── Scroll-linked progress via ScrollTrigger (scrub) ── */
    if (props.showProgress && progressRef.value) {
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          gsap.set(progressRef.value, { scaleX: self.progress })
        }
      })
    }
  }, navRef.value)

  // Scroll listener (separate from matchMedia — always active but animations respect reduce)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  mm?.revert()
  dotPulseTween?.kill()
  currentTween?.kill()
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleOutsideClick, true)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <nav
    ref="navRef"
    class="n-hidden-reveal"
    aria-label="Main navigation"
  >
    <!-- Progress bar -->
    <div
      v-if="showProgress"
      ref="progressRef"
      class="n-hidden-reveal__progress"
      aria-hidden="true"
    ></div>

    <!-- Nav bar -->
    <div ref="navBarRef" class="n-hidden-reveal__bar">
      <!-- Grain texture -->
      <div class="n-hidden-reveal__grain" aria-hidden="true"></div>

      <!-- Bottom glow (flash on re-appear) -->
      <div ref="bottomGlowRef" class="n-hidden-reveal__bottom-glow" aria-hidden="true"></div>

      <!-- Left: Logo -->
      <a
        ref="logoRef"
        href="/"
        class="n-hidden-reveal__logo"
        data-magnetic
        aria-label="Home"
        @mouseenter="handleDiamondEnter"
        @mouseleave="handleDiamondLeave(); handleLogoMouseleave()"
        @mousemove="handleLogoMousemove"
      >
        <span
          ref="diamondRef"
          class="n-hidden-reveal__diamond"
          aria-hidden="true"
        ></span>
        <span class="n-hidden-reveal__logo-text">{{ logo }}</span>
      </a>

      <!-- Center: Nav links (desktop) -->
      <div ref="linksContainerRef" class="n-hidden-reveal__links">
        <a
          v-for="(link, i) in links"
          :key="link.href"
          :ref="(el) => setLinkRef(el, i)"
          :href="link.href"
          class="n-hidden-reveal__link"
          :class="{ 'is-active': activeLink === link.href }"
          :aria-current="activeLink === link.href ? 'page' : undefined"
          @click="handleLinkClick(link, $event)"
        >
          <span class="n-hidden-reveal__link-text">{{ link.label }}</span>
          <span class="n-hidden-reveal__link-underline" aria-hidden="true"></span>
        </a>
      </div>

      <!-- Right: Availability indicator (desktop) -->
      <div
        v-if="available"
        ref="availabilityRef"
        class="n-hidden-reveal__availability"
        @mouseenter="handleAvailabilityEnter"
        @mousemove="handleAvailabilityMove"
        @mouseleave="handleAvailabilityLeave"
      >
        <span class="n-hidden-reveal__dot-wrap">
          <span ref="dotRef" class="n-hidden-reveal__dot" aria-hidden="true"></span>
          <span class="n-hidden-reveal__dot-base" aria-hidden="true"></span>
        </span>
        <span class="n-hidden-reveal__availability-text">Available</span>

        <!-- Tooltip -->
        <div
          ref="tooltipRef"
          class="n-hidden-reveal__tooltip"
          aria-hidden="true"
        >
          Open to new projects
        </div>
      </div>

      <!-- Mobile hamburger -->
      <button
        ref="hamburgerRef"
        class="n-hidden-reveal__hamburger"
        :aria-expanded="mobileOpen"
        aria-controls="hidden-reveal-menu"
        aria-label="Toggle menu"
        @click.stop="toggleMobileMenu"
      >
        <span class="n-hidden-reveal__hamburger-line" :class="{ 'is-open': mobileOpen }"></span>
        <span class="n-hidden-reveal__hamburger-line" :class="{ 'is-open': mobileOpen }"></span>
      </button>
    </div>

    <!-- Mobile dropdown -->
    <Transition name="mobile-slide">
      <div
        v-if="mobileOpen"
        id="hidden-reveal-menu"
        ref="mobileMenuRef"
        class="n-hidden-reveal__mobile-menu"
        role="menu"
      >
        <a
          v-for="link in links"
          :key="'m-' + link.href"
          :href="link.href"
          class="n-hidden-reveal__mobile-link"
          :class="{ 'is-active': activeLink === link.href }"
          :aria-current="activeLink === link.href ? 'page' : undefined"
          role="menuitem"
          @click="handleLinkClick(link, $event)"
        >
          {{ link.label }}
        </a>
        <div class="n-hidden-reveal__mobile-divider" aria-hidden="true"></div>
        <div v-if="available" class="n-hidden-reveal__mobile-availability">
          <span class="n-hidden-reveal__dot-base" aria-hidden="true" style="position: relative;"></span>
          <span>Open to new projects</span>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
/* ── Reset ── */
.n-hidden-reveal *,
.n-hidden-reveal *::before,
.n-hidden-reveal *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Progress bar ── */
.n-hidden-reveal__progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-accent, #c4843e);
  z-index: calc(var(--z-nav, 900) + 1);
  transform-origin: left center;
  transform: scaleX(0);
  pointer-events: none;
  visibility: hidden;
}

/* ── Nav bar ── */
.n-hidden-reveal__bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: var(--z-nav, 900);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  background: transparent;
  transition:
    background-color 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    backdrop-filter 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  border-bottom: 1px solid transparent;
  visibility: hidden;
}

.n-hidden-reveal__bar.is-scrolled {
  background: rgba(13, 11, 9, 0.82);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-bottom-color: rgba(255, 255, 255, 0.07);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

/* ── Grain on bar ── */
.n-hidden-reveal__grain {
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-repeat: repeat;
  opacity: 0;
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-hidden-reveal__bar.is-scrolled .n-hidden-reveal__grain {
  opacity: 0.03;
}

/* ── Bottom glow ── */
.n-hidden-reveal__bottom-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-accent, #c4843e);
  filter: blur(2px);
  pointer-events: none;
  z-index: 2;
  visibility: hidden;
  opacity: 0;
}

/* ── Logo ── */
.n-hidden-reveal__logo {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  text-decoration: none;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.n-hidden-reveal__logo:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: var(--radius-xs, 4px);
}

.n-hidden-reveal__diamond {
  width: 8px;
  height: 8px;
  background: var(--color-accent, #c4843e);
  transform: rotate(45deg); /* GSAP overrides on entrance; fallback for reduced-motion */
  flex-shrink: 0;
  display: block;
}

.n-hidden-reveal__logo-text {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text, #f5f0e8);
  letter-spacing: var(--tracking-wide, 0.1em);
  text-transform: uppercase;
  line-height: 1;
}

/* ── Center links ── */
.n-hidden-reveal__links {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-1, 4px);
  z-index: 1;
}

.n-hidden-reveal__link {
  position: relative;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: var(--nav-link-size, 13px);
  font-weight: 400;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  text-decoration: none;
  padding: var(--space-2, 8px) var(--space-4, 16px);
  white-space: nowrap;
  transition: color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  visibility: hidden;
}

.n-hidden-reveal__link:hover {
  color: var(--color-text, #f5f0e8);
}

.n-hidden-reveal__link.is-active {
  color: var(--color-text, #f5f0e8);
}

.n-hidden-reveal__link:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 2px;
  border-radius: var(--radius-xs, 4px);
}

.n-hidden-reveal__link-text {
  position: relative;
  z-index: 1;
}

/* Underline — wipes from center */
.n-hidden-reveal__link-underline {
  position: absolute;
  bottom: 4px;
  left: var(--space-4, 16px);
  right: var(--space-4, 16px);
  height: 1px;
  background: var(--color-accent, #c4843e);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-hidden-reveal__link:hover .n-hidden-reveal__link-underline,
.n-hidden-reveal__link.is-active .n-hidden-reveal__link-underline {
  transform: scaleX(1);
}

/* ── Availability indicator ── */
.n-hidden-reveal__availability {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  cursor: default;
  visibility: hidden;
}

.n-hidden-reveal__dot-wrap {
  position: relative;
  width: 6px;
  height: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.n-hidden-reveal__dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent, #c4843e);
}

.n-hidden-reveal__dot-base {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent, #c4843e);
  flex-shrink: 0;
}

.n-hidden-reveal__availability-text {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: var(--tracking-wide, 0.1em);
  text-transform: uppercase;
  line-height: 1;
}

/* ── Tooltip ── */
.n-hidden-reveal__tooltip {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  padding: var(--space-2, 8px) var(--space-3, 12px);
  background: rgba(13, 11, 9, 0.88);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm, 8px);
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  visibility: hidden;
  opacity: 0;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* ── Hamburger (mobile only) ── */
.n-hidden-reveal__hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--nav-hamburger-gap, 6px);
  width: 44px;
  height: 44px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm, 8px);
  cursor: pointer;
  position: relative;
  z-index: 2;
  margin-left: auto;
}

.n-hidden-reveal__hamburger:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 2px;
}

.n-hidden-reveal__hamburger-line {
  display: block;
  width: var(--nav-hamburger-width, 22px);
  height: var(--nav-hamburger-thick, 2px);
  background: var(--color-text, #f5f0e8);
  border-radius: 2px;
  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center;
}

.n-hidden-reveal__hamburger-line.is-open:first-child {
  transform: translateY(calc(var(--nav-hamburger-gap, 6px) / 2 + var(--nav-hamburger-thick, 2px) / 2)) rotate(45deg);
}

.n-hidden-reveal__hamburger-line.is-open:last-child {
  transform: translateY(calc(-1 * (var(--nav-hamburger-gap, 6px) / 2 + var(--nav-hamburger-thick, 2px) / 2))) rotate(-45deg);
}

/* ── Mobile menu ── */
.n-hidden-reveal__mobile-menu {
  position: fixed;
  top: 72px;
  left: var(--space-4, 16px);
  right: var(--space-4, 16px);
  background: rgba(13, 11, 9, 0.92);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--radius-lg, 20px);
  padding: var(--space-4, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
  z-index: calc(var(--z-nav, 900) - 1);
  visibility: hidden;
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.n-hidden-reveal__mobile-link {
  display: block;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  text-decoration: none;
  padding: var(--space-3, 12px) var(--space-4, 16px);
  border-radius: var(--radius-md, 12px);
  transition:
    background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  visibility: hidden;
}

.n-hidden-reveal__mobile-link:hover,
.n-hidden-reveal__mobile-link.is-active {
  background: var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
  color: var(--color-text, #f5f0e8);
}

.n-hidden-reveal__mobile-link:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: -2px;
  border-radius: var(--radius-md, 12px);
}

.n-hidden-reveal__mobile-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: var(--space-2, 8px) var(--space-4, 16px);
}

.n-hidden-reveal__mobile-availability {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  padding: var(--space-3, 12px) var(--space-4, 16px);
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 12px;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: var(--tracking-wide, 0.1em);
  text-transform: uppercase;
}

/* ── Mobile transition fallback ── */
.mobile-slide-enter-active,
.mobile-slide-leave-active {
  transition:
    opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-slide-enter-from,
.mobile-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.mobile-slide-enter-to,
.mobile-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .n-hidden-reveal__bar {
    padding: 0 var(--space-4, 16px);
    height: 56px;
  }

  .n-hidden-reveal__links {
    display: none;
  }

  .n-hidden-reveal__availability {
    display: none;
  }

  .n-hidden-reveal__hamburger {
    display: flex;
  }
}

@media (min-width: 769px) {
  .n-hidden-reveal__mobile-menu {
    display: none !important;
  }

  .n-hidden-reveal__hamburger {
    display: none;
  }
}

@media (min-width: 1440px) {
  .n-hidden-reveal__bar {
    padding: 0 56px;
  }
}
</style>
