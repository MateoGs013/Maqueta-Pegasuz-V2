<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'NSplitCorners' })

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
  cta: { type: String, default: 'Start a project' },
  location: { type: String, default: 'Buenos Aires, AR' },
  timezone: { type: String, default: 'America/Argentina/Buenos_Aires' }
})

const emit = defineEmits(['link-click', 'cta-click'])

/* ── Refs ── */
const cornerTL = ref(null)
const cornerTR = ref(null)
const cornerBR = ref(null)
const cornerBL = ref(null)
const ctaRef = ref(null)
const logoLineRef = ref(null)
const linkRefs = ref([])
const hamburgerRef = ref(null)
const mobileOverlayRef = ref(null)

const mobileOpen = ref(false)
const activeLink = ref('')
const time = ref('')
const currentSection = ref('Home')

let mm = null
let clockInterval = null
let ctaQuickX = null
let ctaQuickY = null
let lastScrollY = 0
let scrollTicking = false
let scrollDirection = 'none'

/* ── Numbered links (reversed for bottom-right stacking) ── */
const numberedLinks = computed(() =>
  props.links.map((link, i) => ({
    ...link,
    number: String(i + 1).padStart(2, '0')
  }))
)

/* ── Clock ── */
function updateTime() {
  const now = new Date()
  time.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: props.timezone
  })
}

/* ── Link ref setter ── */
function setLinkRef(el, i) {
  if (el) linkRefs.value[i] = el
}

/* ── Link click ── */
function handleLinkClick(link, e) {
  emit('link-click', link, e)
  activeLink.value = link.href
  if (mobileOpen.value) closeMobileMenu()
}

/* ── CTA click ── */
function handleCtaClick(e) {
  emit('cta-click', e)
}

/* ── Magnetic CTA ── */
function handleCtaMousemove(e) {
  const el = ctaRef.value
  if (!el) return
  if (!ctaQuickX) {
    ctaQuickX = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power2.out' })
    ctaQuickY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power2.out' })
  }
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) * 0.3
  const y = (e.clientY - rect.top - rect.height / 2) * 0.3
  ctaQuickX(x)
  ctaQuickY(y)
}

function handleCtaMouseleave() {
  if (ctaQuickX) {
    ctaQuickX(0)
    ctaQuickY(0)
  }
}

/* ── Scroll fade ── */
function handleScroll() {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const currentY = window.scrollY
      const newDirection = currentY > lastScrollY ? 'down' : 'up'
      const delta = Math.abs(currentY - lastScrollY)

      if (delta > 4) {
        if (newDirection === 'down' && scrollDirection !== 'down') {
          scrollDirection = 'down'
          const corners = [cornerTL.value, cornerTR.value, cornerBR.value, cornerBL.value].filter(Boolean)
          gsap.to(corners, { autoAlpha: 0.7, duration: 0.5, ease: 'power2.out' })
        } else if (newDirection === 'up' && scrollDirection !== 'up') {
          scrollDirection = 'up'
          const corners = [cornerTL.value, cornerTR.value, cornerBR.value, cornerBL.value].filter(Boolean)
          gsap.to(corners, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' })
        }
      }

      if (currentY < 20 && scrollDirection !== 'none') {
        scrollDirection = 'none'
        const corners = [cornerTL.value, cornerTR.value, cornerBR.value, cornerBL.value].filter(Boolean)
        gsap.to(corners, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' })
      }

      lastScrollY = currentY
      scrollTicking = false
    })
    scrollTicking = true
  }
}

/* ── Mobile menu ── */
function toggleMobileMenu() {
  mobileOpen.value = !mobileOpen.value
}

function closeMobileMenu() {
  if (!mobileOpen.value) return
  const overlay = mobileOverlayRef.value
  if (overlay) {
    const items = overlay.querySelectorAll('.n-split-corners__mobile-item')
    gsap.to(items, {
      autoAlpha: 0,
      y: 12,
      stagger: 0.03,
      duration: 0.25,
      ease: 'power2.in'
    })
    gsap.to(overlay, {
      autoAlpha: 0,
      duration: 0.35,
      ease: 'power3.in',
      delay: 0.1,
      onComplete: () => { mobileOpen.value = false }
    })
  } else {
    mobileOpen.value = false
  }
}

function handleOverlayClick(e) {
  if (e.target === mobileOverlayRef.value) closeMobileMenu()
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
      const overlay = mobileOverlayRef.value
      if (overlay) {
        gsap.fromTo(overlay,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.45, ease: 'power3.out' }
        )
        const items = overlay.querySelectorAll('.n-split-corners__mobile-item')
        if (items.length) {
          gsap.fromTo(items,
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.5, ease: 'power3.out', delay: 0.15 }
          )
        }
      }
    })
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
  }
})

/* ── Lifecycle ── */
onMounted(() => {
  updateTime()
  clockInterval = setInterval(updateTime, 60000)

  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 769px)',
    isMobile: '(max-width: 768px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { reduceMotion, isDesktop } = context.conditions

    if (reduceMotion) {
      ;[cornerTL.value, cornerTR.value, cornerBR.value, cornerBL.value]
        .filter(Boolean)
        .forEach(el => gsap.set(el, { autoAlpha: 1 }))
      return
    }

    /* ── Entrance — staggered from corners ── */
    if (cornerTL.value) {
      gsap.fromTo(cornerTL.value,
        { y: -20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: 0.3 }
      )
    }

    if (cornerTR.value) {
      gsap.fromTo(cornerTR.value,
        { x: 20, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: 0.4 }
      )
    }

    if (cornerBR.value) {
      gsap.fromTo(cornerBR.value,
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: 0.5 }
      )
    }

    if (cornerBL.value) {
      gsap.fromTo(cornerBL.value,
        { x: -20, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: 0.45 }
      )
    }

    /* ── Logo line draw-in ── */
    if (logoLineRef.value) {
      gsap.fromTo(logoLineRef.value,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.7, ease: 'power3.inOut', delay: 0.7 }
      )
    }

    /* ── Nav link numbers stagger (desktop only) ── */
    if (isDesktop && linkRefs.value.length) {
      const nums = linkRefs.value.map(el => el?.querySelector('.n-split-corners__link-number')).filter(Boolean)
      gsap.fromTo(nums,
        { autoAlpha: 0, x: 8 },
        { autoAlpha: 1, x: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out', delay: 0.7 }
      )
    }

    /* ── Scroll-linked subtle parallax on corner brackets ── */
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress
        if (cornerTL.value) {
          const bracket = cornerTL.value.querySelector('.n-split-corners__bracket')
          if (bracket) gsap.set(bracket, { rotation: p * -3 })
        }
        if (cornerBR.value) {
          const bracket = cornerBR.value.querySelector('.n-split-corners__bracket')
          if (bracket) gsap.set(bracket, { rotation: p * 3 })
        }
      }
    })
  })

  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  mm?.revert()
  if (clockInterval) clearInterval(clockInterval)
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
  ctaQuickX = null
  ctaQuickY = null
})
</script>

<template>
  <!-- Top-Left: Logo -->
  <div
    ref="cornerTL"
    class="n-split-corners__corner n-split-corners__corner--tl"
    style="visibility: hidden"
  >
    <div class="n-split-corners__bracket n-split-corners__bracket--tl" aria-hidden="true"></div>
    <a href="/" class="n-split-corners__logo" aria-label="Home">
      <span class="n-split-corners__logo-text">{{ logo }}</span>
      <span
        ref="logoLineRef"
        class="n-split-corners__logo-line"
        aria-hidden="true"
      ></span>
    </a>
  </div>

  <!-- Top-Right: CTA + Status -->
  <div
    ref="cornerTR"
    class="n-split-corners__corner n-split-corners__corner--tr"
    style="visibility: hidden"
  >
    <div class="n-split-corners__bracket n-split-corners__bracket--tr" aria-hidden="true"></div>
    <a
      ref="ctaRef"
      href="#contact"
      class="n-split-corners__cta"
      data-magnetic
      @mousemove="handleCtaMousemove"
      @mouseleave="handleCtaMouseleave"
      @click="handleCtaClick"
    >
      {{ cta }}
    </a>
    <div class="n-split-corners__status">
      <span class="n-split-corners__status-dot" aria-hidden="true"></span>
      <span class="n-split-corners__status-text">Available</span>
    </div>
  </div>

  <!-- Bottom-Right: Nav Links -->
  <nav
    ref="cornerBR"
    class="n-split-corners__corner n-split-corners__corner--br"
    role="navigation"
    aria-label="Main navigation"
    style="visibility: hidden"
  >
    <div class="n-split-corners__bracket n-split-corners__bracket--br" aria-hidden="true"></div>
    <div class="n-split-corners__links">
      <a
        v-for="(link, i) in numberedLinks"
        :key="link.href"
        :ref="(el) => setLinkRef(el, i)"
        :href="link.href"
        class="n-split-corners__link"
        :class="{ 'is-active': activeLink === link.href }"
        :aria-current="activeLink === link.href ? 'page' : undefined"
        @click="handleLinkClick(link, $event)"
      >
        <span class="n-split-corners__link-number">{{ link.number }}</span>
        <span class="n-split-corners__link-label">{{ link.label }}</span>
      </a>
    </div>
  </nav>

  <!-- Bottom-Left: Contextual Info -->
  <div
    ref="cornerBL"
    class="n-split-corners__corner n-split-corners__corner--bl"
    style="visibility: hidden"
  >
    <div class="n-split-corners__bracket n-split-corners__bracket--bl" aria-hidden="true"></div>
    <div class="n-split-corners__info">
      <span class="n-split-corners__info-line">{{ time }}</span>
      <span class="n-split-corners__info-line">{{ location }}</span>
      <span class="n-split-corners__info-line n-split-corners__info-section">{{ currentSection }}</span>
    </div>
  </div>

  <!-- Mobile: Only logo (TL) + hamburger (TR) visible, rest collapsed -->
  <button
    ref="hamburgerRef"
    class="n-split-corners__hamburger"
    :aria-expanded="mobileOpen"
    aria-controls="split-corners-overlay"
    aria-label="Toggle menu"
    @click.stop="toggleMobileMenu"
  >
    <span class="n-split-corners__hamburger-line" :class="{ 'is-open': mobileOpen }"></span>
    <span class="n-split-corners__hamburger-line" :class="{ 'is-open': mobileOpen }"></span>
  </button>

  <!-- Mobile overlay -->
  <Teleport to="body">
    <div
      v-if="mobileOpen"
      id="split-corners-overlay"
      ref="mobileOverlayRef"
      class="n-split-corners__overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      style="visibility: hidden"
      @click="handleOverlayClick"
    >
      <div class="n-split-corners__overlay-content">
        <!-- Mobile logo -->
        <div class="n-split-corners__mobile-item n-split-corners__overlay-logo">
          <span class="n-split-corners__logo-text">{{ logo }}</span>
        </div>

        <!-- Mobile links -->
        <div class="n-split-corners__overlay-links">
          <a
            v-for="(link, i) in numberedLinks"
            :key="'m-' + link.href"
            :href="link.href"
            class="n-split-corners__mobile-item n-split-corners__overlay-link"
            :class="{ 'is-active': activeLink === link.href }"
            :aria-current="activeLink === link.href ? 'page' : undefined"
            @click="handleLinkClick(link, $event)"
          >
            <span class="n-split-corners__overlay-link-number">{{ link.number }}</span>
            <span class="n-split-corners__overlay-link-label">{{ link.label }}</span>
          </a>
        </div>

        <!-- Mobile CTA -->
        <a
          href="#contact"
          class="n-split-corners__mobile-item n-split-corners__overlay-cta"
          @click="handleCtaClick"
        >
          {{ cta }}
        </a>

        <!-- Mobile info -->
        <div class="n-split-corners__mobile-item n-split-corners__overlay-info">
          <span>{{ time }}</span>
          <span class="n-split-corners__overlay-info-sep" aria-hidden="true">/</span>
          <span>{{ location }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Reset ── */
.n-split-corners__corner *,
.n-split-corners__corner *::before,
.n-split-corners__corner *::after,
.n-split-corners__hamburger,
.n-split-corners__overlay *,
.n-split-corners__overlay *::before,
.n-split-corners__overlay *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ═══════════════════════════════════
   CORNERS — fixed viewport positions
   ═══════════════════════════════════ */

.n-split-corners__corner {
  position: fixed;
  z-index: var(--z-nav, 900);
}

/* ── Top-Left ── */
.n-split-corners__corner--tl {
  top: var(--space-8, 32px);
  left: 40px;
}

/* ── Top-Right ── */
.n-split-corners__corner--tr {
  top: var(--space-8, 32px);
  right: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-3, 12px);
}

/* ── Bottom-Right ── */
.n-split-corners__corner--br {
  bottom: var(--space-8, 32px);
  right: 40px;
}

/* ── Bottom-Left ── */
.n-split-corners__corner--bl {
  bottom: var(--space-8, 32px);
  left: 40px;
}

/* ═══════════════════════════
   BRACKET DECORATIONS
   ═══════════════════════════ */

.n-split-corners__bracket {
  position: absolute;
  width: 12px;
  height: 12px;
  pointer-events: none;
}

.n-split-corners__bracket--tl {
  top: -10px;
  left: -12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.n-split-corners__bracket--tr {
  top: -10px;
  right: -12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.n-split-corners__bracket--br {
  bottom: -10px;
  right: -12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.n-split-corners__bracket--bl {
  bottom: -10px;
  left: -12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

/* ═══════════════════════════
   TOP-LEFT: LOGO
   ═══════════════════════════ */

.n-split-corners__logo {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  gap: 8px;
}

.n-split-corners__logo:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: 2px;
}

.n-split-corners__logo-text {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: 0.2em;
  text-transform: uppercase;
  line-height: 1;
  transition: color 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-split-corners__logo:hover .n-split-corners__logo-text {
  color: var(--color-text, #f5f0e8);
}

.n-split-corners__logo-line {
  display: block;
  width: 24px;
  height: 1px;
  background: var(--color-accent, #c4843e);
  transition: width 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: left center;
}

.n-split-corners__logo:hover .n-split-corners__logo-line {
  width: 48px;
}

/* ═══════════════════════════
   TOP-RIGHT: CTA + STATUS
   ═══════════════════════════ */

.n-split-corners__cta {
  display: inline-block;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text, #f5f0e8);
  text-decoration: none;
  padding: 9px 22px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  letter-spacing: 0.02em;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-split-corners__cta:hover {
  border-color: var(--color-accent, #c4843e);
  color: var(--color-accent, #c4843e);
  background: var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
}

.n-split-corners__cta:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: 2px;
}

.n-split-corners__status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.n-split-corners__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent, #c4843e);
  position: relative;
  flex-shrink: 0;
}

.n-split-corners__status-dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1px solid var(--color-accent-muted, rgba(196, 132, 62, 0.55));
  animation: status-pulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

@keyframes status-pulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(1.5); opacity: 0; }
}

.n-split-corners__status-text {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: 0.05em;
  line-height: 1;
}

/* ═══════════════════════════
   BOTTOM-RIGHT: NAV LINKS
   ═══════════════════════════ */

.n-split-corners__links {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
}

.n-split-corners__link {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  text-decoration: none;
  padding: 6px 0;
  text-align: right;
  position: relative;
}

.n-split-corners__link:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: 2px;
}

.n-split-corners__link-number {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: 0.05em;
  line-height: 1;
  transition: color 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.n-split-corners__link-label {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  line-height: 1;
  transition:
    color 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-block;
}

/* Hover: number → accent, label shifts left, color → text */
.n-split-corners__link:hover .n-split-corners__link-number,
.n-split-corners__link.is-active .n-split-corners__link-number {
  color: var(--color-accent, #c4843e);
}

.n-split-corners__link:hover .n-split-corners__link-label {
  color: var(--color-text, #f5f0e8);
  transform: translateX(-4px);
}

.n-split-corners__link.is-active .n-split-corners__link-label {
  color: var(--color-text, #f5f0e8);
}

/* Active link: subtle underline */
.n-split-corners__link.is-active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  right: 0;
  width: 100%;
  height: 1px;
  background: var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
}

/* ═══════════════════════════
   BOTTOM-LEFT: CONTEXTUAL INFO
   ═══════════════════════════ */

.n-split-corners__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.n-split-corners__info-line {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: 0.05em;
  line-height: 1.4;
}

.n-split-corners__info-section {
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  margin-top: 4px;
}

/* ═══════════════════════════
   HAMBURGER (mobile only)
   ═══════════════════════════ */

.n-split-corners__hamburger {
  display: none;
  position: fixed;
  top: var(--space-6, 24px);
  right: var(--space-6, 24px);
  z-index: calc(var(--z-nav, 900) + 2);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  padding: 0;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  cursor: pointer;
}

.n-split-corners__hamburger:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 2px;
}

.n-split-corners__hamburger-line {
  display: block;
  width: 18px;
  height: 1px;
  background: var(--color-text, #f5f0e8);
  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center;
}

.n-split-corners__hamburger-line.is-open:first-child {
  transform: translateY(3px) rotate(45deg);
}

.n-split-corners__hamburger-line.is-open:last-child {
  transform: translateY(-3px) rotate(-45deg);
}

/* ═══════════════════════════
   MOBILE OVERLAY
   ═══════════════════════════ */

.n-split-corners__overlay {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-nav, 900) + 1);
  background: rgba(13, 11, 9, 0.96);
  backdrop-filter: blur(32px) saturate(120%);
  -webkit-backdrop-filter: blur(32px) saturate(120%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.n-split-corners__overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8, 32px);
  padding: var(--space-8, 32px);
}

.n-split-corners__overlay-logo {
  margin-bottom: var(--space-4, 16px);
}

.n-split-corners__overlay-logo .n-split-corners__logo-text {
  font-size: 14px;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
}

.n-split-corners__overlay-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4, 16px);
}

.n-split-corners__overlay-link {
  display: flex;
  align-items: center;
  gap: var(--space-4, 16px);
  text-decoration: none;
  padding: var(--space-3, 12px) var(--space-6, 24px);
}

.n-split-corners__overlay-link:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: 2px;
}

.n-split-corners__overlay-link-number {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: 0.05em;
}

.n-split-corners__overlay-link-label {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 22px;
  font-weight: 300;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  letter-spacing: 0.02em;
  transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-split-corners__overlay-link:hover .n-split-corners__overlay-link-label,
.n-split-corners__overlay-link.is-active .n-split-corners__overlay-link-label {
  color: var(--color-text, #f5f0e8);
}

.n-split-corners__overlay-link:hover .n-split-corners__overlay-link-number,
.n-split-corners__overlay-link.is-active .n-split-corners__overlay-link-number {
  color: var(--color-accent, #c4843e);
}

.n-split-corners__overlay-cta {
  display: inline-block;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 14px;
  font-weight: 400;
  color: var(--color-accent, #c4843e);
  text-decoration: none;
  padding: 12px 28px;
  border: 1px solid var(--color-accent-muted, rgba(196, 132, 62, 0.55));
  border-radius: 2px;
  margin-top: var(--space-4, 16px);
  transition:
    background-color 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-split-corners__overlay-cta:hover {
  background: var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
  border-color: var(--color-accent, #c4843e);
}

.n-split-corners__overlay-cta:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: 2px;
}

.n-split-corners__overlay-info {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: 0.05em;
  margin-top: var(--space-6, 24px);
}

.n-split-corners__overlay-info-sep {
  color: rgba(255, 255, 255, 0.08);
}

/* ═══════════════════════════
   RESPONSIVE
   ═══════════════════════════ */

@media (max-width: 768px) {
  /* Hide desktop corners except top-left logo */
  .n-split-corners__corner--tr,
  .n-split-corners__corner--br,
  .n-split-corners__corner--bl {
    display: none;
  }

  .n-split-corners__corner--tl {
    top: var(--space-6, 24px);
    left: var(--space-6, 24px);
  }

  .n-split-corners__hamburger {
    display: flex;
  }
}

@media (min-width: 769px) {
  .n-split-corners__hamburger {
    display: none;
  }

  .n-split-corners__overlay {
    display: none !important;
  }
}

@media (min-width: 1440px) {
  .n-split-corners__corner--tl {
    left: 56px;
  }
  .n-split-corners__corner--tr {
    right: 56px;
  }
  .n-split-corners__corner--br {
    right: 56px;
  }
  .n-split-corners__corner--bl {
    left: 56px;
  }
}
</style>
