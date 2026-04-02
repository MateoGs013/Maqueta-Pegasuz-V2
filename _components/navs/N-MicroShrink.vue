<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'NMicroShrink' })

const props = defineProps({
  logo: { type: String, default: 'Studio' },
  tagline: { type: String, default: 'Creative Agency' },
  links: {
    type: Array,
    default: () => [
      { label: 'Work', href: '#work' },
      { label: 'About', href: '#about' },
      { label: 'Process', href: '#process' },
      { label: 'Contact', href: '#contact' }
    ]
  },
  cta: { type: String, default: 'Start a project' },
  ctaShort: { type: String, default: 'Start' },
  activeLink: { type: String, default: '' }
})

const emit = defineEmits(['link-click'])

/* ── Refs ── */
const navRef = ref(null)
const innerRef = ref(null)
const logoRef = ref(null)
const logoMarkRef = ref(null)
const logoTextRef = ref(null)
const taglineRef = ref(null)
const separatorRef = ref(null)
const linksRef = ref([])
const ctaRef = ref(null)
const ctaTextFullRef = ref(null)
const ctaTextShortRef = ref(null)
const ctaArrowRef = ref(null)
const borderRef = ref(null)
const hamburgerRef = ref(null)
const mobileMenuRef = ref(null)

const isScrolled = ref(false)
const mobileOpen = ref(false)

let mm = null
let quickToX = null
let quickToY = null

function setLinkRef(el, i) {
  if (el) linksRef.value[i] = el
}

function handleLinkClick(link, e) {
  emit('link-click', link, e)
  if (mobileOpen.value) closeMobileMenu()
}

function toggleMobileMenu() {
  mobileOpen.value = !mobileOpen.value
}

function closeMobileMenu() {
  if (!mobileOpen.value) return
  const menu = mobileMenuRef.value
  if (menu) {
    gsap.to(menu, {
      y: -12,
      autoAlpha: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => { mobileOpen.value = false }
    })
  } else {
    mobileOpen.value = false
  }
}

function handleOutsideClick(e) {
  if (!navRef.value) return
  if (!navRef.value.contains(e.target)) {
    closeMobileMenu()
  }
}

function handleEscape(e) {
  if (e.key === 'Escape' && mobileOpen.value) {
    closeMobileMenu()
    hamburgerRef.value?.focus()
  }
}

/* ── Logo hover ── */
function handleLogoEnter() {
  const mark = logoMarkRef.value
  if (mark) {
    gsap.to(mark, { scale: 1.2, rotation: 135, duration: 0.4, ease: 'back.out(1.7)' })
  }
}

function handleLogoLeave() {
  const mark = logoMarkRef.value
  if (mark) {
    gsap.to(mark, { scale: 1, rotation: 45, duration: 0.5, ease: 'power2.out' })
  }
}

/* ── Magnetic CTA via quickTo ── */
function handleCtaMousemove(e) {
  const btn = ctaRef.value
  if (!btn || !quickToX || !quickToY) return
  const rect = btn.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) * 0.3
  const y = (e.clientY - rect.top - rect.height / 2) * 0.3
  quickToX(x)
  quickToY(y)
}

function handleCtaMouseleave() {
  if (!quickToX || !quickToY) return
  quickToX(0)
  quickToY(0)
}

/* ── CTA text swap animation ── */
function animateCtaText(shrunk) {
  const fullEl = ctaTextFullRef.value
  const shortEl = ctaTextShortRef.value
  if (!fullEl || !shortEl) return

  if (shrunk) {
    gsap.to(fullEl, { autoAlpha: 0, x: -8, duration: 0.2, ease: 'power2.in' })
    gsap.to(shortEl, { autoAlpha: 1, x: 0, duration: 0.2, ease: 'power3.out', delay: 0.15 })
  } else {
    gsap.to(shortEl, { autoAlpha: 0, x: 8, duration: 0.2, ease: 'power2.in' })
    gsap.to(fullEl, { autoAlpha: 1, x: 0, duration: 0.2, ease: 'power3.out', delay: 0.15 })
  }
}

watch(isScrolled, (val) => {
  animateCtaText(val)
})

/* ── Mobile menu animation ── */
watch(mobileOpen, (open) => {
  if (open) {
    nextTick(() => {
      const menu = mobileMenuRef.value
      if (menu) {
        gsap.fromTo(menu,
          { y: -12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' }
        )
        const mobileLinks = menu.querySelectorAll('.n-micro-shrink__mobile-link, .n-micro-shrink__mobile-cta')
        gsap.fromTo(mobileLinks,
          { autoAlpha: 0, x: -8 },
          { autoAlpha: 1, x: 0, stagger: 0.05, duration: 0.35, ease: 'power2.out', delay: 0.1 }
        )
      }
    })
    document.addEventListener('click', handleOutsideClick, true)
    document.addEventListener('keydown', handleEscape)
  } else {
    document.removeEventListener('click', handleOutsideClick, true)
    document.removeEventListener('keydown', handleEscape)
  }
})

onMounted(() => {
  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 769px)',
    isMobile: '(max-width: 768px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { reduceMotion, isDesktop } = context.conditions

    if (reduceMotion) {
      gsap.set(navRef.value, { autoAlpha: 1 })
      gsap.set(logoRef.value, { autoAlpha: 1 })
      gsap.set(linksRef.value, { autoAlpha: 1 })
      if (taglineRef.value) gsap.set(taglineRef.value, { autoAlpha: 1 })
      if (separatorRef.value) gsap.set(separatorRef.value, { autoAlpha: 1 })
      if (ctaRef.value) gsap.set(ctaRef.value, { autoAlpha: 1 })
      if (ctaTextFullRef.value) gsap.set(ctaTextFullRef.value, { autoAlpha: 1 })
      return
    }

    /* ── Entrance animation ── */
    gsap.fromTo(navRef.value,
      { y: -80, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
    )

    gsap.fromTo(logoRef.value,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: 0.4 }
    )

    if (taglineRef.value && isDesktop) {
      gsap.fromTo(taglineRef.value,
        { x: 10, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: 0.7 }
      )
      gsap.fromTo(separatorRef.value,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, ease: 'power2.out', delay: 0.6 }
      )
    }

    gsap.fromTo(linksRef.value,
      { autoAlpha: 0, y: -6 },
      { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.6, ease: 'power2.out', delay: 0.5 }
    )

    if (ctaRef.value) {
      gsap.fromTo(ctaRef.value,
        { autoAlpha: 0, x: 10 },
        { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out', delay: 0.8 }
      )
    }

    /* ── Shrink timeline driven by scroll scrub ── */
    const shrinkTl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: '80px top',
        scrub: 0.4,
        onUpdate: (self) => {
          const prog = self.progress
          const newState = prog > 0.5
          if (newState !== isScrolled.value) {
            isScrolled.value = newState
          }
        }
      }
    })

    /* Nav bar height and background */
    shrinkTl.to(navRef.value, {
      '--nav-h': '56px',
      '--nav-bg': 0.85,
      '--nav-blur': 20,
      '--nav-border-vis': 1,
      duration: 1,
      ease: 'none'
    }, 0)

    /* Inner container padding */
    shrinkTl.to(innerRef.value, {
      paddingTop: 0,
      paddingBottom: 0,
      duration: 1,
      ease: 'none'
    }, 0)

    /* Logo mark scale — preserve the 45deg base rotation */
    if (logoMarkRef.value) {
      gsap.set(logoMarkRef.value, { rotation: 45 })
      shrinkTl.to(logoMarkRef.value, {
        scale: 0.85,
        duration: 1,
        ease: 'none'
      }, 0)
    }

    /* Logo text size */
    if (logoTextRef.value) {
      shrinkTl.to(logoTextRef.value, {
        fontSize: '12px',
        duration: 1,
        ease: 'none'
      }, 0)
    }

    /* Tagline + separator fade */
    if (taglineRef.value && isDesktop) {
      shrinkTl.to(taglineRef.value, {
        autoAlpha: 0,
        x: -4,
        duration: 0.6,
        ease: 'none'
      }, 0)
      shrinkTl.to(separatorRef.value, {
        autoAlpha: 0,
        duration: 0.4,
        ease: 'none'
      }, 0)
    }

    /* Nav links shrink */
    shrinkTl.to(linksRef.value, {
      fontSize: '12px',
      padding: '8px 14px',
      duration: 1,
      ease: 'none'
    }, 0)

    /* CTA shrink */
    if (ctaRef.value) {
      shrinkTl.to(ctaRef.value, {
        padding: '8px 20px',
        duration: 1,
        ease: 'none'
      }, 0)
    }

    /* Bottom border reveal */
    if (borderRef.value) {
      shrinkTl.to(borderRef.value, {
        autoAlpha: 1,
        duration: 1,
        ease: 'none'
      }, 0)
    }

    /* ── Magnetic CTA with quickTo ── */
    if (ctaRef.value && isDesktop) {
      quickToX = gsap.quickTo(ctaRef.value, 'x', { duration: 0.4, ease: 'power2.out' })
      quickToY = gsap.quickTo(ctaRef.value, 'y', { duration: 0.4, ease: 'power2.out' })
    }
  }, navRef.value)
})

onBeforeUnmount(() => {
  mm?.revert()
  document.removeEventListener('click', handleOutsideClick, true)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <nav
    ref="navRef"
    class="n-micro-shrink"
    aria-label="Main navigation"
    style="--nav-h: 80px; --nav-bg: 0; --nav-blur: 0; --nav-border-vis: 0;"
  >
    <!-- Background layer (GSAP drives opacity via CSS vars) -->
    <div class="n-micro-shrink__bg" aria-hidden="true"></div>

    <!-- Bottom border (fades in on scroll) -->
    <div ref="borderRef" class="n-micro-shrink__border" aria-hidden="true"></div>

    <div ref="innerRef" class="n-micro-shrink__inner">
      <!-- Logo group -->
      <a
        ref="logoRef"
        href="/"
        class="n-micro-shrink__logo"
        aria-label="Home"
        @mouseenter="handleLogoEnter"
        @mouseleave="handleLogoLeave"
      >
        <span
          ref="logoMarkRef"
          class="n-micro-shrink__logo-mark"
          aria-hidden="true"
        ></span>
        <span ref="logoTextRef" class="n-micro-shrink__logo-text">{{ logo }}</span>
        <span ref="separatorRef" class="n-micro-shrink__separator" aria-hidden="true">&middot;</span>
        <span ref="taglineRef" class="n-micro-shrink__tagline">{{ tagline }}</span>
      </a>

      <!-- Center links (desktop) -->
      <div class="n-micro-shrink__links" role="menubar">
        <a
          v-for="(link, i) in links"
          :key="link.href"
          :ref="(el) => setLinkRef(el, i)"
          :href="link.href"
          class="n-micro-shrink__link"
          :class="{ 'is-active': activeLink === link.href || activeLink === link.label }"
          :aria-current="(activeLink === link.href || activeLink === link.label) ? 'page' : undefined"
          role="menuitem"
          @click="handleLinkClick(link, $event)"
        >
          {{ link.label }}
        </a>
      </div>

      <!-- Right side -->
      <div class="n-micro-shrink__right">
        <!-- CTA button -->
        <a
          ref="ctaRef"
          href="#contact"
          class="n-micro-shrink__cta"
          data-magnetic
          @mousemove="handleCtaMousemove"
          @mouseleave="handleCtaMouseleave"
          @click="$emit('link-click', { label: cta, href: '#contact' }, $event)"
        >
          <span class="n-micro-shrink__cta-inner">
            <span ref="ctaTextFullRef" class="n-micro-shrink__cta-text n-micro-shrink__cta-text--full">{{ cta }}</span>
            <span ref="ctaTextShortRef" class="n-micro-shrink__cta-text n-micro-shrink__cta-text--short">{{ ctaShort }}</span>
          </span>
          <span ref="ctaArrowRef" class="n-micro-shrink__cta-arrow" aria-hidden="true">&rarr;</span>
        </a>

        <!-- Hamburger (mobile) -->
        <button
          ref="hamburgerRef"
          class="n-micro-shrink__hamburger"
          :aria-expanded="mobileOpen"
          aria-controls="micro-shrink-mobile-menu"
          aria-label="Toggle menu"
          @click.stop="toggleMobileMenu"
        >
          <span class="n-micro-shrink__hamburger-line" :class="{ 'is-open': mobileOpen }"></span>
          <span class="n-micro-shrink__hamburger-line" :class="{ 'is-open': mobileOpen }"></span>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="micro-mobile">
      <div
        v-if="mobileOpen"
        id="micro-shrink-mobile-menu"
        ref="mobileMenuRef"
        class="n-micro-shrink__mobile"
        role="menu"
      >
        <a
          v-for="link in links"
          :key="'m-' + link.href"
          :href="link.href"
          class="n-micro-shrink__mobile-link"
          :class="{ 'is-active': activeLink === link.href || activeLink === link.label }"
          :aria-current="(activeLink === link.href || activeLink === link.label) ? 'page' : undefined"
          role="menuitem"
          @click="handleLinkClick(link, $event)"
        >
          {{ link.label }}
        </a>

        <div class="n-micro-shrink__mobile-divider" aria-hidden="true"></div>

        <a
          href="#contact"
          class="n-micro-shrink__mobile-cta"
          role="menuitem"
          @click="handleLinkClick({ label: cta, href: '#contact' }, $event)"
        >
          {{ cta }} <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
/* ── Reset ── */
.n-micro-shrink *,
.n-micro-shrink *::before,
.n-micro-shrink *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Nav bar ── */
.n-micro-shrink {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-h, 80px);
  z-index: var(--z-nav, 900);
  display: flex;
  align-items: center;
  visibility: hidden; /* GSAP autoAlpha controls this */
}

/* ── Background layer (driven by CSS vars from GSAP) ── */
.n-micro-shrink__bg {
  position: absolute;
  inset: 0;
  background: rgba(13, 11, 9, var(--nav-bg, 0));
  backdrop-filter: blur(calc(var(--nav-blur, 0) * 1px)) saturate(calc(100% + 60% * var(--nav-bg, 0)));
  -webkit-backdrop-filter: blur(calc(var(--nav-blur, 0) * 1px)) saturate(calc(100% + 60% * var(--nav-bg, 0)));
  pointer-events: none;
  z-index: 0;
}

/* ── Bottom border (scrubs from invisible to visible) ── */
.n-micro-shrink__border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  visibility: hidden; /* GSAP autoAlpha */
  pointer-events: none;
  z-index: 2;
}

/* ── Inner container ── */
.n-micro-shrink__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-8, 32px);
  height: 100%;
  position: relative;
  z-index: 1;
}

/* ── Logo group ── */
.n-micro-shrink__logo {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  text-decoration: none;
  flex-shrink: 0;
  visibility: hidden; /* GSAP autoAlpha */
}

.n-micro-shrink__logo:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: var(--radius-xs, 4px);
}

.n-micro-shrink__logo-mark {
  display: inline-block;
  width: 12px;
  height: 12px;
  background: var(--color-accent, #c4843e);
  transform: rotate(45deg);
  flex-shrink: 0;
  border-radius: 2px;
}

.n-micro-shrink__logo-text {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text, #f5f0e8);
  letter-spacing: var(--tracking-wide, 0.1em);
  text-transform: uppercase;
  line-height: 1;
  white-space: nowrap;
}

.n-micro-shrink__separator {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 14px;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  line-height: 1;
  user-select: none;
}

.n-micro-shrink__tagline {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: var(--tracking-normal, 0);
  line-height: 1;
  white-space: nowrap;
}

/* ── Center links ── */
.n-micro-shrink__links {
  display: flex;
  align-items: center;
  gap: 0;
}

.n-micro-shrink__link {
  display: inline-block;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  text-decoration: none;
  padding: 10px 18px;
  white-space: nowrap;
  position: relative;
  transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  visibility: hidden; /* GSAP autoAlpha */
}

.n-micro-shrink__link::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 18px;
  right: 18px;
  height: 1px;
  background: var(--color-accent, #c4843e);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-micro-shrink__link:hover {
  color: var(--color-text, #f5f0e8);
}

.n-micro-shrink__link:hover::after {
  transform: scaleX(1);
}

.n-micro-shrink__link.is-active {
  color: var(--color-text, #f5f0e8);
}

.n-micro-shrink__link.is-active::after {
  transform: scaleX(1);
}

.n-micro-shrink__link:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 2px;
  border-radius: var(--radius-xs, 4px);
}

/* ── Right side ── */
.n-micro-shrink__right {
  display: flex;
  align-items: center;
  gap: var(--space-4, 16px);
  flex-shrink: 0;
}

/* ── CTA button ── */
.n-micro-shrink__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2, 8px);
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text, #f5f0e8);
  text-decoration: none;
  padding: 11px 28px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-pill, 9999px);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  visibility: hidden; /* GSAP autoAlpha */
}

.n-micro-shrink__cta:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.25);
}

.n-micro-shrink__cta:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 3px;
  border-radius: var(--radius-pill, 9999px);
}

.n-micro-shrink__cta-inner {
  position: relative;
  display: inline-block;
}

.n-micro-shrink__cta-text {
  white-space: nowrap;
}

.n-micro-shrink__cta-text--full {
  /* Visible by default */
}

.n-micro-shrink__cta-text--short {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  visibility: hidden; /* GSAP autoAlpha */
}

.n-micro-shrink__cta-arrow {
  font-size: 14px;
  line-height: 1;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-micro-shrink__cta:hover .n-micro-shrink__cta-arrow {
  transform: translateX(2px);
}

/* ── Hamburger (mobile) ── */
.n-micro-shrink__hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  width: 44px;
  height: 44px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-xs, 4px);
  cursor: pointer;
  position: relative;
  z-index: 2;
}

.n-micro-shrink__hamburger:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 2px;
}

.n-micro-shrink__hamburger-line {
  display: block;
  width: 24px;
  height: 1.5px;
  background: var(--color-text, #f5f0e8);
  border-radius: 2px;
  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center;
}

.n-micro-shrink__hamburger-line.is-open:first-child {
  transform: translateY(calc(6px / 2 + 1.5px / 2)) rotate(45deg);
}

.n-micro-shrink__hamburger-line.is-open:last-child {
  transform: translateY(calc(-1 * (6px / 2 + 1.5px / 2))) rotate(-45deg);
}

/* ── Mobile menu ── */
.n-micro-shrink__mobile {
  position: absolute;
  top: var(--nav-h, 80px);
  left: 0;
  right: 0;
  background: rgba(13, 11, 9, 0.92);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  padding: var(--space-3, 12px) 0;
  display: flex;
  flex-direction: column;
  z-index: 5;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  visibility: hidden; /* GSAP autoAlpha */
}

.n-micro-shrink__mobile-link {
  display: flex;
  align-items: center;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 15px;
  font-weight: 400;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  text-decoration: none;
  padding: 16px var(--space-6, 24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition:
    background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 44px;
  visibility: hidden; /* GSAP autoAlpha */
}

.n-micro-shrink__mobile-link:hover,
.n-micro-shrink__mobile-link.is-active {
  background: var(--color-surface, rgba(255, 255, 255, 0.04));
  color: var(--color-text, #f5f0e8);
}

.n-micro-shrink__mobile-link:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: -2px;
}

.n-micro-shrink__mobile-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: var(--space-3, 12px) var(--space-6, 24px);
}

.n-micro-shrink__mobile-cta {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-accent, #c4843e);
  text-decoration: none;
  padding: 16px var(--space-6, 24px);
  transition:
    background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 44px;
  visibility: hidden; /* GSAP autoAlpha */
}

.n-micro-shrink__mobile-cta:hover {
  background: var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
  color: var(--color-text, #f5f0e8);
}

.n-micro-shrink__mobile-cta:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: -2px;
}

/* ── Mobile transition ── */
.micro-mobile-enter-active,
.micro-mobile-leave-active {
  transition:
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.micro-mobile-enter-from,
.micro-mobile-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.micro-mobile-enter-to,
.micro-mobile-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .n-micro-shrink__inner {
    padding: 0 var(--space-4, 16px);
  }

  .n-micro-shrink__links {
    display: none;
  }

  .n-micro-shrink__cta {
    display: none;
  }

  .n-micro-shrink__separator {
    display: none;
  }

  .n-micro-shrink__tagline {
    display: none;
  }

  .n-micro-shrink__hamburger {
    display: flex;
  }
}

@media (min-width: 769px) {
  .n-micro-shrink__mobile {
    display: none !important;
  }

  .n-micro-shrink__hamburger {
    display: none;
  }
}

@media (min-width: 1440px) {
  .n-micro-shrink__inner {
    padding: 0 56px;
  }
}
</style>
