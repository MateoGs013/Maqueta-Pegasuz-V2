<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'NGlassBlur' })

const props = defineProps({
  logo: { type: String, default: 'Studio' },
  links: {
    type: Array,
    default: () => [
      { label: 'Work', href: '#work' },
      { label: 'About', href: '#about' },
      { label: 'Services', href: '#services', dropdown: [
        { label: 'Brand', href: '#brand' },
        { label: 'Web', href: '#web' },
        { label: 'Motion', href: '#motion' },
        { label: 'Strategy', href: '#strategy' }
      ]},
      { label: 'Journal', href: '#journal' },
      { label: 'Lab', href: '#lab' }
    ]
  },
  cta: { type: String, default: 'Get in touch' },
  activeLink: { type: String, default: '' }
})

const emit = defineEmits(['link-click'])

const navRef = ref(null)
const innerRef = ref(null)
const logoRef = ref(null)
const logoMarkRef = ref(null)
const linksRef = ref([])
const ctaRef = ref(null)
const dotRef = ref(null)
const mobileMenuRef = ref(null)
const hamburgerRef = ref(null)

const mobileOpen = ref(false)
const isScrolled = ref(false)
const activeDropdown = ref(null)

let mm = null
let quickToX = null
let quickToY = null
let dropdownTimeout = null

function setLinkRef(el, i) {
  if (el) linksRef.value[i] = el
}

function handleLinkClick(link, e) {
  emit('link-click', link, e)
  if (mobileOpen.value) closeMobileMenu()
  activeDropdown.value = null
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
    activeDropdown.value = null
  }
}

function handleEscape(e) {
  if (e.key === 'Escape') {
    if (activeDropdown.value !== null) {
      activeDropdown.value = null
      return
    }
    if (mobileOpen.value) {
      closeMobileMenu()
      hamburgerRef.value?.focus()
    }
  }
}

/* Dropdown logic */
function openDropdown(index) {
  clearTimeout(dropdownTimeout)
  activeDropdown.value = index
}

function closeDropdown(index) {
  dropdownTimeout = setTimeout(() => {
    if (activeDropdown.value === index) {
      activeDropdown.value = null
    }
  }, 150)
}

function keepDropdownOpen(index) {
  clearTimeout(dropdownTimeout)
  activeDropdown.value = index
}

function handleLinkKeydown(e, link, index) {
  if (link.dropdown && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
    e.preventDefault()
    activeDropdown.value = activeDropdown.value === index ? null : index
  }
}

/* Logo hover */
function handleLogoEnter() {
  const mark = logoMarkRef.value
  if (mark) {
    gsap.to(mark, { scale: 1.2, duration: 0.35, ease: 'back.out(1.7)' })
  }
}

function handleLogoLeave() {
  const mark = logoMarkRef.value
  if (mark) {
    gsap.to(mark, { scale: 1, duration: 0.4, ease: 'power2.out' })
  }
}

/* Magnetic CTA via quickTo */
function handleCtaMousemove(e) {
  const btn = ctaRef.value
  if (!btn || !quickToX || !quickToY) return
  const rect = btn.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) * 0.25
  const y = (e.clientY - rect.top - rect.height / 2) * 0.25
  quickToX(x)
  quickToY(y)
}

function handleCtaMouseleave() {
  if (!quickToX || !quickToY) return
  quickToX(0)
  quickToY(0)
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

        /* Stagger mobile links */
        const mobileLinks = menu.querySelectorAll('.n-glass-blur__mobile-link, .n-glass-blur__mobile-cta')
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

/* Watch dropdown for GSAP entrance */
watch(activeDropdown, (val, oldVal) => {
  if (val !== null) {
    nextTick(() => {
      const panel = navRef.value?.querySelector('.n-glass-blur__dropdown')
      if (panel) {
        gsap.fromTo(panel,
          { y: -8, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out' }
        )
        const items = panel.querySelectorAll('.n-glass-blur__dropdown-item')
        gsap.fromTo(items,
          { autoAlpha: 0, y: -4 },
          { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.25, ease: 'power2.out', delay: 0.08 }
        )
      }
    })
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
      if (ctaRef.value) gsap.set(ctaRef.value, { autoAlpha: 1 })
      if (dotRef.value) gsap.set(dotRef.value, { autoAlpha: 1 })
      return
    }

    /* ── Entrance animation ── */
    gsap.fromTo(navRef.value,
      { autoAlpha: 0, y: -8 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.2 }
    )

    gsap.fromTo(logoRef.value,
      { autoAlpha: 0, x: -10 },
      { autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 }
    )

    gsap.fromTo(linksRef.value,
      { autoAlpha: 0, y: -4 },
      { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.6, ease: 'power2.out', delay: 0.5 }
    )

    if (ctaRef.value) {
      gsap.fromTo(ctaRef.value,
        { autoAlpha: 0, x: 10 },
        { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out', delay: 0.7 }
      )
    }

    if (dotRef.value) {
      gsap.fromTo(dotRef.value,
        { autoAlpha: 0, scale: 0 },
        { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', delay: 0.65 }
      )

      /* Dot pulse */
      gsap.to(dotRef.value, {
        scale: 1.4,
        opacity: 0.5,
        duration: 1.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 1.2
      })
    }

    /* ── Scroll threshold ── */
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: '60px top',
      onEnter: () => {
        isScrolled.value = true
        gsap.to(navRef.value, {
          '--nav-bg-opacity': 1,
          '--nav-border-opacity': 1,
          '--nav-glow-opacity': 0.6,
          duration: 0.4,
          ease: 'power2.out'
        })
      },
      onLeaveBack: () => {
        isScrolled.value = false
        gsap.to(navRef.value, {
          '--nav-bg-opacity': 0,
          '--nav-border-opacity': 0,
          '--nav-glow-opacity': 0,
          duration: 0.4,
          ease: 'power2.out'
        })
      }
    })

    /* ── Magnetic CTA with quickTo ── */
    if (ctaRef.value && isDesktop) {
      quickToX = gsap.quickTo(ctaRef.value, 'x', { duration: 0.4, ease: 'power2.out' })
      quickToY = gsap.quickTo(ctaRef.value, 'y', { duration: 0.4, ease: 'power2.out' })
    }
  }, navRef.value)
})

onBeforeUnmount(() => {
  mm?.revert()
  clearTimeout(dropdownTimeout)
  document.removeEventListener('click', handleOutsideClick, true)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <nav
    ref="navRef"
    class="n-glass-blur"
    aria-label="Main navigation"
    style="--nav-bg-opacity: 0; --nav-border-opacity: 0; --nav-glow-opacity: 0;"
  >
    <!-- Inner highlight (scrolled state) -->
    <div class="n-glass-blur__highlight" aria-hidden="true"></div>

    <!-- Bottom border gradient (amber glow) -->
    <div class="n-glass-blur__glow" aria-hidden="true"></div>

    <div class="n-glass-blur__inner" ref="innerRef">
      <!-- Logo -->
      <a
        ref="logoRef"
        href="/"
        class="n-glass-blur__logo"
        aria-label="Home"
        @mouseenter="handleLogoEnter"
        @mouseleave="handleLogoLeave"
      >
        <span ref="logoMarkRef" class="n-glass-blur__logo-mark" aria-hidden="true"></span>
        <span class="n-glass-blur__logo-text">{{ logo }}</span>
      </a>

      <!-- Center links (desktop) -->
      <div class="n-glass-blur__links" role="menubar">
        <div
          v-for="(link, i) in links"
          :key="link.href"
          class="n-glass-blur__link-wrapper"
          @mouseenter="link.dropdown ? openDropdown(i) : null"
          @mouseleave="link.dropdown ? closeDropdown(i) : null"
        >
          <a
            :ref="(el) => setLinkRef(el, i)"
            :href="link.href"
            class="n-glass-blur__link"
            :class="{
              'is-active': activeLink === link.href || activeLink === link.label,
              'has-dropdown': !!link.dropdown
            }"
            :aria-current="(activeLink === link.href || activeLink === link.label) ? 'page' : undefined"
            :aria-expanded="link.dropdown ? (activeDropdown === i) : undefined"
            :aria-haspopup="link.dropdown ? 'true' : undefined"
            role="menuitem"
            @click="handleLinkClick(link, $event)"
            @keydown="handleLinkKeydown($event, link, i)"
            @focus="link.dropdown ? openDropdown(i) : null"
          >
            {{ link.label }}
          </a>

          <!-- Dropdown panel -->
          <div
            v-if="link.dropdown && activeDropdown === i"
            class="n-glass-blur__dropdown"
            role="menu"
            :aria-label="link.label + ' submenu'"
            @mouseenter="keepDropdownOpen(i)"
            @mouseleave="closeDropdown(i)"
          >
            <a
              v-for="sub in link.dropdown"
              :key="sub.href"
              :href="sub.href"
              class="n-glass-blur__dropdown-item"
              role="menuitem"
              @click="handleLinkClick(sub, $event)"
            >
              {{ sub.label }}
            </a>
          </div>
        </div>
      </div>

      <!-- Right side -->
      <div class="n-glass-blur__right">
        <!-- Status dot -->
        <span ref="dotRef" class="n-glass-blur__dot" aria-hidden="true"></span>

        <!-- CTA -->
        <a
          ref="ctaRef"
          href="#contact"
          class="n-glass-blur__cta"
          data-magnetic
          @mousemove="handleCtaMousemove"
          @mouseleave="handleCtaMouseleave"
          @click="$emit('link-click', { label: cta, href: '#contact' }, $event)"
        >
          {{ cta }}
        </a>

        <!-- Hamburger (mobile) -->
        <button
          ref="hamburgerRef"
          class="n-glass-blur__hamburger"
          :aria-expanded="mobileOpen"
          aria-controls="glass-blur-mobile-menu"
          aria-label="Toggle menu"
          @click.stop="toggleMobileMenu"
        >
          <span class="n-glass-blur__hamburger-line" :class="{ 'is-open': mobileOpen }"></span>
          <span class="n-glass-blur__hamburger-line" :class="{ 'is-open': mobileOpen }"></span>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="glass-mobile">
      <div
        v-if="mobileOpen"
        id="glass-blur-mobile-menu"
        ref="mobileMenuRef"
        class="n-glass-blur__mobile"
        role="menu"
      >
        <a
          v-for="link in links"
          :key="'m-' + link.href"
          :href="link.href"
          class="n-glass-blur__mobile-link"
          :class="{ 'is-active': activeLink === link.href || activeLink === link.label }"
          :aria-current="(activeLink === link.href || activeLink === link.label) ? 'page' : undefined"
          role="menuitem"
          @click="handleLinkClick(link, $event)"
        >
          {{ link.label }}
          <span v-if="link.dropdown" class="n-glass-blur__mobile-arrow" aria-hidden="true">&rsaquo;</span>
        </a>

        <!-- Mobile sub-links for Services -->
        <template v-for="link in links" :key="'ms-' + link.href">
          <template v-if="link.dropdown">
            <a
              v-for="sub in link.dropdown"
              :key="'ms-' + sub.href"
              :href="sub.href"
              class="n-glass-blur__mobile-link n-glass-blur__mobile-link--sub"
              role="menuitem"
              @click="handleLinkClick(sub, $event)"
            >
              {{ sub.label }}
            </a>
          </template>
        </template>

        <div class="n-glass-blur__mobile-divider" aria-hidden="true"></div>

        <a
          href="#contact"
          class="n-glass-blur__mobile-cta"
          role="menuitem"
          @click="handleLinkClick({ label: cta, href: '#contact' }, $event)"
        >
          {{ cta }}
        </a>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
/* ── Reset ── */
.n-glass-blur *,
.n-glass-blur *::before,
.n-glass-blur *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Nav bar ── */
.n-glass-blur {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 68px;
  z-index: var(--z-nav, 900);
  display: flex;
  align-items: center;
  visibility: hidden;

  /* Driven by GSAP via --nav-bg-opacity */
  background: rgba(13, 11, 9, calc(0.75 * var(--nav-bg-opacity, 0)));
  backdrop-filter: blur(calc(20px * var(--nav-bg-opacity, 0))) saturate(calc(100% + 60% * var(--nav-bg-opacity, 0)));
  -webkit-backdrop-filter: blur(calc(20px * var(--nav-bg-opacity, 0))) saturate(calc(100% + 60% * var(--nav-bg-opacity, 0)));

  /* Border driven by opacity var */
  border-bottom: 1px solid rgba(255, 255, 255, calc(0.07 * var(--nav-border-opacity, 0)));
  box-shadow:
    0 1px 0 rgba(255, 255, 255, calc(0.04 * var(--nav-border-opacity, 0))),
    0 4px 32px rgba(0, 0, 0, calc(0.4 * var(--nav-border-opacity, 0)));

  transition: none; /* GSAP drives it */
}

/* Inner highlight — top edge glow (scrolled) */
.n-glass-blur__highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent);
  opacity: var(--nav-border-opacity, 0);
  pointer-events: none;
  z-index: 2;
}

/* Bottom gradient glow — cinematic amber line */
.n-glass-blur__glow {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-accent, #c4843e) 30%,
    rgba(196, 132, 62, 0.4) 60%,
    transparent 100%
  );
  opacity: var(--nav-glow-opacity, 0);
  pointer-events: none;
  z-index: 3;
}

/* ── Inner container ── */
.n-glass-blur__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 40px;
  height: 100%;
  position: relative;
  z-index: 1;
}

/* ── Logo ── */
.n-glass-blur__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
  visibility: hidden;
}

.n-glass-blur__logo:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: 4px;
}

.n-glass-blur__logo-mark {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: var(--color-accent, #c4843e);
  transform: rotate(45deg);
  flex-shrink: 0;
}

.n-glass-blur__logo-text {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text, #f5f0e8);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1;
}

/* ── Center links ── */
.n-glass-blur__links {
  display: flex;
  align-items: center;
  gap: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.n-glass-blur__link-wrapper {
  position: relative;
}

.n-glass-blur__link {
  display: inline-block;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  text-decoration: none;
  padding: 8px 14px;
  white-space: nowrap;
  position: relative;
  transition: color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  visibility: hidden;
}

.n-glass-blur__link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 14px;
  right: 14px;
  height: 1px;
  background: var(--color-accent, #c4843e);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.n-glass-blur__link:hover {
  color: var(--color-text, #f5f0e8);
}

.n-glass-blur__link:hover::after {
  transform: scaleX(1);
}

.n-glass-blur__link.is-active {
  color: var(--color-text, #f5f0e8);
}

.n-glass-blur__link.is-active::after {
  transform: scaleX(1);
}

.n-glass-blur__link:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 2px;
  border-radius: 4px;
}

/* ── Dropdown ── */
.n-glass-blur__dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 200px;
  background: rgba(13, 11, 9, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 8px;
  margin-top: 8px;
  z-index: 10;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  visibility: hidden; /* GSAP autoAlpha controls this */
}

.n-glass-blur__dropdown-item {
  display: block;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 4px;
  transition:
    background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  visibility: hidden; /* GSAP autoAlpha controls this */
}

.n-glass-blur__dropdown-item:hover {
  background: var(--color-surface, rgba(255, 255, 255, 0.04));
  color: var(--color-text, #f5f0e8);
}

.n-glass-blur__dropdown-item:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: -2px;
  border-radius: 4px;
}

/* ── Right side ── */
.n-glass-blur__right {
  display: flex;
  align-items: center;
  gap: var(--space-4, 16px);
  flex-shrink: 0;
}

/* Status dot */
.n-glass-blur__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent, #c4843e);
  box-shadow: 0 0 8px var(--color-accent-muted, rgba(196, 132, 62, 0.55));
  flex-shrink: 0;
  visibility: hidden;
}

/* CTA button */
.n-glass-blur__cta {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text, #f5f0e8);
  text-decoration: none;
  padding: 8px 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  white-space: nowrap;
  transition:
    border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.25s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  visibility: hidden;
}

.n-glass-blur__cta:hover {
  border-color: var(--color-accent, #c4843e);
  color: var(--color-accent, #c4843e);
  background: var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
}

.n-glass-blur__cta:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 3px;
  border-radius: 4px;
}

/* ── Hamburger (mobile) ── */
.n-glass-blur__hamburger {
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
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

.n-glass-blur__hamburger:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 2px;
}

.n-glass-blur__hamburger-line {
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

.n-glass-blur__hamburger-line.is-open:first-child {
  transform: translateY(calc(6px / 2 + 1.5px / 2)) rotate(45deg);
}

.n-glass-blur__hamburger-line.is-open:last-child {
  transform: translateY(calc(-1 * (6px / 2 + 1.5px / 2))) rotate(-45deg);
}

/* ── Mobile menu ── */
.n-glass-blur__mobile {
  position: absolute;
  top: 68px;
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
  visibility: hidden;
}

.n-glass-blur__mobile-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  visibility: hidden;
}

.n-glass-blur__mobile-link--sub {
  padding-left: 44px;
  font-size: 13px;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
}

.n-glass-blur__mobile-link:hover,
.n-glass-blur__mobile-link.is-active {
  background: var(--color-surface, rgba(255, 255, 255, 0.04));
  color: var(--color-text, #f5f0e8);
}

.n-glass-blur__mobile-link:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: -2px;
}

.n-glass-blur__mobile-arrow {
  font-size: 18px;
  line-height: 1;
  opacity: 0.4;
}

.n-glass-blur__mobile-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: var(--space-3, 12px) var(--space-6, 24px);
}

.n-glass-blur__mobile-cta {
  display: block;
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
  visibility: hidden;
}

.n-glass-blur__mobile-cta:hover {
  background: var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
  color: var(--color-text, #f5f0e8);
}

.n-glass-blur__mobile-cta:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: -2px;
}

/* ── Mobile transition ── */
.glass-mobile-enter-active,
.glass-mobile-leave-active {
  transition:
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-mobile-enter-from,
.glass-mobile-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.glass-mobile-enter-to,
.glass-mobile-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .n-glass-blur__inner {
    padding: 0 var(--space-4, 16px);
  }

  .n-glass-blur__links {
    display: none;
  }

  .n-glass-blur__dot {
    display: none;
  }

  .n-glass-blur__cta {
    display: none;
  }

  .n-glass-blur__hamburger {
    display: flex;
  }
}

@media (min-width: 769px) {
  .n-glass-blur__mobile {
    display: none !important;
  }

  .n-glass-blur__hamburger {
    display: none;
  }
}

@media (min-width: 1440px) {
  .n-glass-blur__inner {
    padding: 0 56px;
  }
}
</style>
