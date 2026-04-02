<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'NFloatingPill' })

const props = defineProps({
  logo: { type: String, default: 'Studio' },
  links: {
    type: Array,
    default: () => [
      { label: 'Work', href: '#work' },
      { label: 'About', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Lab', href: '#lab' }
    ]
  },
  cta: { type: String, default: 'Get in touch' },
  activeLink: { type: String, default: '' }
})

const emit = defineEmits(['link-click'])

const navRef = ref(null)
const logoRef = ref(null)
const pillRef = ref(null)
const linksRef = ref([])
const ctaRef = ref(null)
const mobileMenuRef = ref(null)
const hamburgerRef = ref(null)

const mobileOpen = ref(false)
const isScrolled = ref(false)
let mm = null

function setLinkRef(el, i) {
  if (el) linksRef.value[i] = el
}

function handleLinkClick(link, e) {
  emit('link-click', link, e)
  if (mobileOpen.value) {
    closeMobileMenu()
  }
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
      onComplete: () => {
        mobileOpen.value = false
      }
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

watch(mobileOpen, (open) => {
  if (open) {
    nextTick(() => {
      const menu = mobileMenuRef.value
      if (menu) {
        gsap.fromTo(menu,
          { y: -12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' }
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

/* Magnetic CTA effect */
function handleCtaMousemove(e) {
  const btn = ctaRef.value
  if (!btn) return
  const rect = btn.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) * 0.3
  const y = (e.clientY - rect.top - rect.height / 2) * 0.3
  gsap.to(btn, { x, y, duration: 0.3, ease: 'power2.out' })
}

function handleCtaMouseleave() {
  const btn = ctaRef.value
  if (!btn) return
  gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
}

onMounted(() => {
  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 769px)',
    isMobile: '(max-width: 768px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { reduceMotion } = context.conditions

    if (reduceMotion) {
      /* Show everything instantly */
      gsap.set([logoRef.value, pillRef.value], { autoAlpha: 1 })
      gsap.set(linksRef.value, { autoAlpha: 1 })
      if (ctaRef.value) gsap.set(ctaRef.value, { autoAlpha: 1 })
      return
    }

    /* ── Entrance animation ── */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo(logoRef.value,
      { y: -20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.8, delay: 0.2 }
    )

    tl.fromTo(pillRef.value,
      { y: -20, autoAlpha: 0, scaleX: 0.8 },
      { y: 0, autoAlpha: 1, scaleX: 1, duration: 0.9, ease: 'back.out(1.4)' },
      0.3
    )

    tl.fromTo(linksRef.value,
      { autoAlpha: 0 },
      { autoAlpha: 1, stagger: 0.06, duration: 0.5 },
      0.6
    )

    if (ctaRef.value) {
      tl.fromTo(ctaRef.value,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5 },
        0.8
      )
    }

    /* ── Scroll behavior — threshold-based, class toggle ── */
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: '80px top',
      onEnter: () => { isScrolled.value = true },
      onLeaveBack: () => { isScrolled.value = false }
    })
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
    class="n-floating-pill"
    aria-label="Main navigation"
  >
    <!-- Logo — sits outside the pill -->
    <a
      ref="logoRef"
      class="n-floating-pill__logo"
      href="/"
      aria-label="Home"
    >
      {{ logo }}
    </a>

    <!-- Pill container -->
    <div ref="pillRef" class="n-floating-pill__pill" :class="{ 'is-scrolled': isScrolled }">
      <!-- Inner highlight -->
      <!-- Grain texture -->
      <div class="n-floating-pill__grain" aria-hidden="true"></div>

      <!-- Desktop: links + CTA -->
      <div class="n-floating-pill__links">
        <a
          v-for="(link, i) in links"
          :key="link.href"
          :ref="(el) => setLinkRef(el, i)"
          :href="link.href"
          class="n-floating-pill__link"
          :class="{ 'is-active': activeLink === link.href || activeLink === link.label }"
          :aria-current="(activeLink === link.href || activeLink === link.label) ? 'page' : undefined"
          @click="handleLinkClick(link, $event)"
        >
          {{ link.label }}
        </a>
      </div>

      <!-- CTA button -->
      <a
        ref="ctaRef"
        href="#contact"
        class="n-floating-pill__cta"
        data-magnetic
        @mousemove="handleCtaMousemove"
        @mouseleave="handleCtaMouseleave"
        @click="$emit('link-click', { label: cta, href: '#contact' }, $event)"
      >
        <span class="n-floating-pill__cta-text">{{ cta }}</span>
        <span class="n-floating-pill__cta-arrow" aria-hidden="true">&rarr;</span>
      </a>

      <!-- Mobile hamburger -->
      <button
        ref="hamburgerRef"
        class="n-floating-pill__hamburger"
        :aria-expanded="mobileOpen"
        aria-controls="mobile-menu"
        aria-label="Toggle menu"
        @click.stop="toggleMobileMenu"
      >
        <span class="n-floating-pill__hamburger-line" :class="{ 'is-open': mobileOpen }"></span>
        <span class="n-floating-pill__hamburger-line" :class="{ 'is-open': mobileOpen }"></span>
      </button>
    </div>

    <!-- Mobile dropdown -->
    <Transition name="mobile-menu">
      <div
        v-if="mobileOpen"
        id="mobile-menu"
        ref="mobileMenuRef"
        class="n-floating-pill__dropdown"
        role="menu"
      >
        <a
          v-for="link in links"
          :key="'m-' + link.href"
          :href="link.href"
          class="n-floating-pill__dropdown-link"
          :class="{ 'is-active': activeLink === link.href || activeLink === link.label }"
          :aria-current="(activeLink === link.href || activeLink === link.label) ? 'page' : undefined"
          role="menuitem"
          @click="handleLinkClick(link, $event)"
        >
          {{ link.label }}
        </a>
        <div class="n-floating-pill__dropdown-divider" aria-hidden="true"></div>
        <a
          href="#contact"
          class="n-floating-pill__dropdown-cta"
          role="menuitem"
          @click="handleLinkClick({ label: cta, href: '#contact' }, $event)"
        >
          <span>{{ cta }}</span>
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
/* ── Reset ── */
.n-floating-pill *,
.n-floating-pill *::before,
.n-floating-pill *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Nav wrapper ── */
.n-floating-pill {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-nav, 900);
  pointer-events: none;
}

/* ── Logo ── */
.n-floating-pill__logo {
  position: fixed;
  top: var(--space-6, 24px);
  left: 40px;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  text-decoration: none;
  letter-spacing: var(--tracking-wide, 0.1em);
  text-transform: uppercase;
  pointer-events: auto;
  visibility: hidden;
  transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: calc(var(--z-nav, 900) + 1);
}

.n-floating-pill__logo:hover {
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
}

.n-floating-pill__logo:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: var(--radius-xs, 4px);
}

/* ── Pill container ── */
.n-floating-pill__pill {
  position: fixed;
  top: var(--space-6, 24px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-1, 4px);
  padding: 10px 10px 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-pill, 9999px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  pointer-events: auto;
  visibility: hidden;
  transition:
    padding 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-floating-pill__pill.is-scrolled {
  padding: 8px 8px 8px 16px;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

/* Inner highlight — top edge glow */
.n-floating-pill__pill::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* Grain overlay on pill */
.n-floating-pill__grain {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: url('/noise.png');
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
}

/* ── Nav links ── */
.n-floating-pill__links {
  display: flex;
  align-items: center;
  gap: var(--space-1, 4px);
  position: relative;
  z-index: 1;
}

.n-floating-pill__link {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  text-decoration: none;
  padding: 8px var(--space-4, 16px);
  border-radius: var(--radius-pill, 9999px);
  white-space: nowrap;
  transition:
    background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 1;
}

.n-floating-pill__link:hover,
.n-floating-pill__link.is-active {
  background-color: var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
  color: var(--color-text, #f5f0e8);
}

.n-floating-pill__link:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 2px;
}

/* ── CTA button ── */
.n-floating-pill__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-accent, #c4843e);
  color: var(--color-canvas, #0d0b09);
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 13px;
  font-weight: 500;
  padding: 9px 20px;
  border-radius: var(--radius-pill, 9999px);
  text-decoration: none;
  white-space: nowrap;
  margin-left: var(--space-2, 8px);
  transition:
    background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 1;
  visibility: hidden;
}

.n-floating-pill__cta:hover {
  background: #d4944e;
  transform: scale(1.03);
}

.n-floating-pill__cta:hover .n-floating-pill__cta-arrow {
  transform: translateX(4px);
}

.n-floating-pill__cta-arrow {
  display: inline-block;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  font-size: 14px;
  line-height: 1;
}

.n-floating-pill__cta:focus-visible {
  outline: 2px solid var(--color-text, #f5f0e8);
  outline-offset: 3px;
}

/* ── Hamburger (mobile only) ── */
.n-floating-pill__hamburger {
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
  border-radius: var(--radius-pill, 9999px);
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  z-index: 2;
  margin-left: auto;
}

.n-floating-pill__hamburger:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 2px;
}

.n-floating-pill__hamburger-line {
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

.n-floating-pill__hamburger-line.is-open:first-child {
  transform: translateY(calc(var(--nav-hamburger-gap, 6px) / 2 + var(--nav-hamburger-thick, 2px) / 2)) rotate(45deg);
}

.n-floating-pill__hamburger-line.is-open:last-child {
  transform: translateY(calc(-1 * (var(--nav-hamburger-gap, 6px) / 2 + var(--nav-hamburger-thick, 2px) / 2))) rotate(-45deg);
}

/* ── Mobile dropdown ── */
.n-floating-pill__dropdown {
  position: fixed;
  top: calc(var(--space-6, 24px) + 56px);
  left: 50%;
  transform: translateX(-50%);
  width: calc(100vw - 32px);
  max-width: 420px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg, 20px);
  padding: var(--space-3, 12px);
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
  pointer-events: auto;
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  visibility: hidden;
  z-index: calc(var(--z-nav, 900) - 1);
}

.n-floating-pill__dropdown-link {
  display: block;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 15px;
  font-weight: 400;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  text-decoration: none;
  padding: var(--space-3, 12px) var(--space-4, 16px);
  border-radius: var(--radius-md, 12px);
  transition:
    background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-floating-pill__dropdown-link:hover,
.n-floating-pill__dropdown-link.is-active {
  background: var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
  color: var(--color-text, #f5f0e8);
}

.n-floating-pill__dropdown-link:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: -2px;
  border-radius: var(--radius-md, 12px);
}

.n-floating-pill__dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: var(--space-2, 8px) var(--space-4, 16px);
}

.n-floating-pill__dropdown-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 15px;
  font-weight: 500;
  color: var(--color-accent, #c4843e);
  text-decoration: none;
  padding: var(--space-3, 12px) var(--space-4, 16px);
  border-radius: var(--radius-md, 12px);
  transition:
    background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-floating-pill__dropdown-cta:hover {
  background: var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
  color: var(--color-text, #f5f0e8);
}

.n-floating-pill__dropdown-cta:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: -2px;
  border-radius: var(--radius-md, 12px);
}

/* ── Mobile transition ── */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition:
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}

.mobile-menu-enter-to,
.mobile-menu-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .n-floating-pill__logo {
    left: var(--space-4, 16px);
    top: 28px;
  }

  .n-floating-pill__pill {
    top: var(--space-4, 16px);
    right: var(--space-4, 16px);
    left: auto;
    transform: none;
    padding: var(--space-2, 8px);
  }

  .n-floating-pill__links {
    display: none;
  }

  .n-floating-pill__cta {
    display: none;
  }

  .n-floating-pill__hamburger {
    display: flex;
  }
}

@media (min-width: 769px) {
  .n-floating-pill__dropdown {
    display: none !important;
  }

  .n-floating-pill__hamburger {
    display: none;
  }
}

/* ── Large desktop ── */
@media (min-width: 1440px) {
  .n-floating-pill__logo {
    left: 56px;
  }
}
</style>
