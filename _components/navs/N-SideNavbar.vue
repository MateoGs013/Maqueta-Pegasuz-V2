<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'NSideNavbar' })

const props = defineProps({
  logo: { type: String, default: 'S' },
  links: {
    type: Array,
    default: () => [
      { label: 'Work', href: '#work', icon: 'grid' },
      { label: 'About', href: '#about', icon: 'circle' },
      { label: 'Services', href: '#services', icon: 'lines' },
      { label: 'Lab', href: '#lab', icon: 'flask' }
    ]
  },
  socials: {
    type: Array,
    default: () => [
      { label: 'IG', href: '#', ariaLabel: 'Instagram' },
      { label: 'TW', href: '#', ariaLabel: 'Twitter' },
      { label: 'LI', href: '#', ariaLabel: 'LinkedIn' }
    ]
  },
  defaultExpanded: { type: Boolean, default: false }
})

/* ── State ── */
const sidebarRef = ref(null)
const isExpanded = ref(props.defaultExpanded)
const activeIndex = ref(0)
const isMobile = ref(false)
const mobileOpen = ref(false)
const hoveredIndex = ref(-1)
const scrolled = ref(false)

/* ── Refs for animation targets ── */
const navItemsRef = ref([])
const socialItemsRef = ref([])
const logoTextRef = ref(null)
const accentBarRef = ref(null)
const toggleArrowRef = ref(null)
const sidebarInnerRef = ref(null)
const labelRefs = ref([])
const mobileButtonRef = ref(null)
const overlayRef = ref(null)
const activeIndicatorRef = ref(null)

/* ── GSAP context ── */
let mm = null
let expandTl = null
let quickX = null
let quickY = null
let sectionObserver = null

/* ── Methods ── */
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}

function closeMobile() {
  mobileOpen.value = false
}

function setActive(index) {
  activeIndex.value = index
}

function handleNavClick(e, index) {
  setActive(index)
  if (isMobile.value) {
    closeMobile()
  }
}

/* ── Magnetic effect for toggle button ── */
function handleMagneticMove(e, el) {
  if (!el || isMobile.value) return
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) * 0.3
  const y = (e.clientY - rect.top - rect.height / 2) * 0.3
  if (quickX && quickY) {
    quickX(x)
    quickY(y)
  }
}

function handleMagneticLeave(el) {
  if (!el) return
  gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
}

/* ── Expand/Collapse animation ── */
function animateExpand(expanded) {
  if (!sidebarInnerRef.value || isMobile.value) return

  if (expandTl) expandTl.kill()
  expandTl = gsap.timeline()

  expandTl.to(sidebarInnerRef.value, {
    width: expanded ? 240 : 72,
    duration: 0.5,
    ease: 'power3.out'
  })

  /* Labels */
  const labels = sidebarInnerRef.value.querySelectorAll('.nav-link__label')
  if (expanded) {
    expandTl.fromTo(labels,
      { x: -10, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, stagger: 0.05, duration: 0.35, ease: 'power3.out' },
      0.15
    )
    /* Logo text */
    if (logoTextRef.value) {
      expandTl.fromTo(logoTextRef.value,
        { x: -8, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.35, ease: 'power3.out' },
        0.2
      )
    }
  } else {
    expandTl.to(labels,
      { x: -10, autoAlpha: 0, stagger: 0.03, duration: 0.2, ease: 'power2.in' },
      0
    )
    if (logoTextRef.value) {
      expandTl.to(logoTextRef.value,
        { x: -8, autoAlpha: 0, duration: 0.2, ease: 'power2.in' },
        0
      )
    }
  }

  /* Arrow rotation */
  if (toggleArrowRef.value) {
    expandTl.to(toggleArrowRef.value, {
      rotate: expanded ? 180 : 0,
      duration: 0.4,
      ease: 'power3.out'
    }, 0)
  }
}

/* ── Active indicator position ── */
function updateActiveIndicator() {
  if (!activeIndicatorRef.value || !navItemsRef.value.length) return
  const activeEl = navItemsRef.value[activeIndex.value]
  if (!activeEl) return
  const sidebar = sidebarInnerRef.value
  if (!sidebar) return

  const sidebarRect = sidebar.getBoundingClientRect()
  const itemRect = activeEl.getBoundingClientRect()
  const targetY = itemRect.top - sidebarRect.top + (itemRect.height / 2) - 10

  gsap.to(activeIndicatorRef.value, {
    y: targetY,
    duration: 0.4,
    ease: 'power3.out'
  })
}

/* ── Watchers ── */
watch(isExpanded, (val) => {
  animateExpand(val)
})

watch(activeIndex, () => {
  nextTick(updateActiveIndicator)
})

watch(mobileOpen, (val) => {
  if (!sidebarInnerRef.value) return
  if (val) {
    gsap.to(sidebarInnerRef.value, {
      x: 0,
      duration: 0.5,
      ease: 'power3.out'
    })
    if (overlayRef.value) {
      gsap.to(overlayRef.value, {
        autoAlpha: 1,
        duration: 0.35,
        ease: 'power2.out'
      })
    }
    /* Stagger mobile items */
    const items = sidebarInnerRef.value.querySelectorAll('.nav-link, .social-link')
    gsap.fromTo(items,
      { x: -20, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, stagger: 0.05, duration: 0.4, ease: 'power3.out', delay: 0.15 }
    )
  } else {
    gsap.to(sidebarInnerRef.value, {
      x: '-100%',
      duration: 0.4,
      ease: 'power2.in'
    })
    if (overlayRef.value) {
      gsap.to(overlayRef.value, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.in'
      })
    }
  }
})

/* ── Lifecycle ── */
onMounted(() => {
  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 769px)',
    isMobile: '(max-width: 768px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { isDesktop, isMobile: mobile, reduceMotion } = context.conditions

    isMobile.value = mobile

    if (reduceMotion) {
      /* Show everything immediately, no animation */
      if (sidebarInnerRef.value) {
        gsap.set(sidebarInnerRef.value, { x: 0, autoAlpha: 1 })
      }
      return
    }

    if (isDesktop) {
      /* ── Entrance animation ── */
      const tl = gsap.timeline({ delay: 0.2 })

      gsap.set(sidebarInnerRef.value, { x: -72, width: 72 })

      tl.to(sidebarInnerRef.value, {
        x: 0,
        duration: 0.9,
        ease: 'power3.out'
      })

      /* Items stagger in */
      const allItems = sidebarInnerRef.value.querySelectorAll('.nav-link, .social-link, .sidebar__logo, .sidebar__toggle')
      gsap.set(allItems, { autoAlpha: 0 })
      tl.to(allItems, {
        autoAlpha: 1,
        stagger: 0.06,
        duration: 0.5,
        ease: 'power2.out'
      }, 0.5)

      /* ── Scroll-linked background opacity ── */
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: '200px top',
        scrub: 0.5,
        onUpdate: (self) => {
          scrolled.value = self.progress > 0.1
          if (sidebarInnerRef.value) {
            const bg = `rgba(13, 11, 9, ${0.88 + self.progress * 0.07})`
            sidebarInnerRef.value.style.backgroundColor = bg
          }
        }
      })

      /* ── Active indicator initial ── */
      nextTick(updateActiveIndicator)

      /* ── Labels hidden by default in collapsed state ── */
      const labels = sidebarInnerRef.value.querySelectorAll('.nav-link__label')
      gsap.set(labels, { autoAlpha: 0, x: -10 })
      if (logoTextRef.value) {
        gsap.set(logoTextRef.value, { autoAlpha: 0, x: -8 })
      }

      /* If defaultExpanded, animate on load */
      if (props.defaultExpanded) {
        animateExpand(true)
      }
    }

    if (mobile) {
      /* Mobile: sidebar off-screen, overlay hidden */
      if (sidebarInnerRef.value) {
        gsap.set(sidebarInnerRef.value, {
          x: '-100%',
          width: '80vw'
        })
      }
      if (overlayRef.value) {
        gsap.set(overlayRef.value, { autoAlpha: 0 })
      }

      /* Hamburger entrance */
      if (mobileButtonRef.value) {
        gsap.fromTo(mobileButtonRef.value,
          { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 0.4 }
        )
      }
    }
  }, sidebarRef.value)

  /* Magnetic quickTo for toggle button */
  const toggleEl = sidebarRef.value?.querySelector('.sidebar__toggle')
  if (toggleEl) {
    quickX = gsap.quickTo(toggleEl, 'x', { duration: 0.3, ease: 'power2.out' })
    quickY = gsap.quickTo(toggleEl, 'y', { duration: 0.3, ease: 'power2.out' })
  }

  /* ── Intersection Observer for active section tracking ── */
  const sectionIds = props.links
    .map(l => l.href)
    .filter(h => h.startsWith('#'))
    .map(h => h.slice(1))

  if (sectionIds.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = sectionIds.indexOf(entry.target.id)
          if (idx !== -1) {
            activeIndex.value = idx
          }
        }
      })
    }, { threshold: 0.3 })

    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    sectionObserver = observer
  }
})

onBeforeUnmount(() => {
  mm?.revert()
  if (expandTl) expandTl.kill()
  if (sectionObserver) sectionObserver.disconnect()
})
</script>

<template>
  <div ref="sidebarRef" class="n-side-navbar">
    <!-- Mobile overlay -->
    <div
      ref="overlayRef"
      class="sidebar__overlay"
      :class="{ 'is-visible': mobileOpen }"
      @click="closeMobile"
      aria-hidden="true"
    />

    <!-- Mobile hamburger -->
    <button
      ref="mobileButtonRef"
      class="sidebar__hamburger"
      :class="{ 'is-open': mobileOpen }"
      @click="toggleMobile"
      :aria-expanded="mobileOpen"
      aria-label="Toggle navigation menu"
    >
      <span class="hamburger__line hamburger__line--top" />
      <span class="hamburger__line hamburger__line--mid" />
      <span class="hamburger__line hamburger__line--bot" />
    </button>

    <!-- Sidebar -->
    <nav
      ref="sidebarInnerRef"
      class="sidebar"
      :class="{
        'is-expanded': isExpanded,
        'is-mobile-open': mobileOpen
      }"
      role="navigation"
      aria-label="Side navigation"
    >
      <!-- Accent line -->
      <div class="sidebar__accent-line" aria-hidden="true" />

      <!-- Active indicator bar -->
      <div ref="activeIndicatorRef" class="sidebar__active-indicator" aria-hidden="true" />

      <!-- Logo -->
      <div class="sidebar__logo">
        <div class="logo__diamond" aria-hidden="true" />
        <span ref="logoTextRef" class="logo__text">Studio</span>
      </div>

      <!-- Separator -->
      <div class="sidebar__sep" aria-hidden="true" />

      <!-- Nav links -->
      <ul class="sidebar__links" role="list">
        <li
          v-for="(link, i) in links"
          :key="link.label"
          :ref="el => { if (el) navItemsRef[i] = el }"
          class="nav-link"
          :class="{ 'is-active': activeIndex === i }"
          @mouseenter="hoveredIndex = i"
          @mouseleave="hoveredIndex = -1"
        >
          <a
            :href="link.href"
            class="nav-link__anchor"
            :aria-current="activeIndex === i ? 'page' : undefined"
            @click.prevent="handleNavClick($event, i)"
          >
            <!-- Icon -->
            <span class="nav-link__icon" aria-hidden="true">
              <!-- Grid icon -->
              <svg v-if="link.icon === 'grid'" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5" />
                <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5" />
                <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5" />
                <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5" />
              </svg>
              <!-- Circle icon -->
              <svg v-else-if="link.icon === 'circle'" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.5" />
                <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5" />
              </svg>
              <!-- Lines icon -->
              <svg v-else-if="link.icon === 'lines'" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line x1="3" y1="5.5" x2="17" y2="5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <line x1="3" y1="10" x2="14" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <line x1="3" y1="14.5" x2="11" y2="14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
              <!-- Flask icon -->
              <svg v-else-if="link.icon === 'flask'" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 2.5h5M8.5 2.5v5.5L4 16a1 1 0 001 1.5h10a1 1 0 001-1.5l-4.5-8V2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M6 13h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </span>

            <!-- Label -->
            <span class="nav-link__label">{{ link.label }}</span>
          </a>

          <!-- Tooltip (collapsed state only) -->
          <Transition name="tooltip">
            <span
              v-if="hoveredIndex === i && !isExpanded && !isMobile"
              class="nav-link__tooltip"
              role="tooltip"
            >
              {{ link.label }}
            </span>
          </Transition>
        </li>
      </ul>

      <!-- Spacer -->
      <div class="sidebar__spacer" />

      <!-- Separator -->
      <div class="sidebar__sep" aria-hidden="true" />

      <!-- Social links -->
      <ul class="sidebar__socials" role="list">
        <li
          v-for="(social, i) in socials"
          :key="social.label"
          :ref="el => { if (el) socialItemsRef[i] = el }"
          class="social-link"
        >
          <a
            :href="social.href"
            class="social-link__anchor"
            :aria-label="social.ariaLabel"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="social-link__text">{{ social.label }}</span>
          </a>
        </li>
      </ul>

      <!-- Separator -->
      <div class="sidebar__sep" aria-hidden="true" />

      <!-- Toggle button -->
      <button
        class="sidebar__toggle"
        data-magnetic
        @click="toggleExpanded"
        @mousemove="handleMagneticMove($event, $event.currentTarget)"
        @mouseleave="handleMagneticLeave($event.currentTarget)"
        :aria-expanded="isExpanded"
        aria-label="Toggle sidebar"
      >
        <svg
          ref="toggleArrowRef"
          class="toggle__arrow"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
        >
          <path
            d="M7 4l5 5-5 5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </nav>
  </div>
</template>

<style scoped>
/* ─────────────────────────────────────────
   BASE / RESET
───────────────────────────────────────── */
.n-side-navbar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  height: 100dvh;
  z-index: var(--z-nav, 900);
  font-family: var(--font-body, 'DM Sans', sans-serif);
  pointer-events: none;
}

.n-side-navbar * {
  box-sizing: border-box;
}

/* ─────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────── */
.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 72px;
  height: 100%;
  background-color: rgba(13, 11, 9, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: var(--space-6, 24px) 0 var(--space-4, 16px);
  pointer-events: all;
  overflow: hidden;
  transition: none; /* GSAP handles width */
}

/* ─────────────────────────────────────────
   ACCENT LINE
───────────────────────────────────────── */
.sidebar__accent-line {
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: 100%;
  background: linear-gradient(
    180deg,
    transparent 5%,
    var(--color-accent, #c4843e) 35%,
    var(--color-accent, #c4843e) 65%,
    transparent 95%
  );
  opacity: 0.35;
  z-index: 2;
}

/* ─────────────────────────────────────────
   ACTIVE INDICATOR
───────────────────────────────────────── */
.sidebar__active-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 20px;
  background: var(--color-accent, #c4843e);
  border-radius: 0 var(--radius-xs, 4px) var(--radius-xs, 4px) 0;
  z-index: 3;
  box-shadow: 0 0 12px var(--color-accent-muted, rgba(196, 132, 62, 0.55));
}

/* ─────────────────────────────────────────
   LOGO
───────────────────────────────────────── */
.sidebar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: 0 var(--space-6, 24px);
  height: 48px;
  flex-shrink: 0;
}

.logo__diamond {
  width: 16px;
  height: 16px;
  min-width: 16px;
  background: var(--color-accent, #c4843e);
  transform: rotate(45deg);
  border-radius: 2px;
  box-shadow: 0 0 16px var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
}

.logo__text {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
}

/* ─────────────────────────────────────────
   SEPARATORS
───────────────────────────────────────── */
.sidebar__sep {
  height: 1px;
  margin: var(--space-3, 12px) var(--space-4, 16px);
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

/* ─────────────────────────────────────────
   NAV LINKS
───────────────────────────────────────── */
.sidebar__links {
  list-style: none;
  padding: var(--space-2, 8px) 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
  flex-shrink: 0;
}

.nav-link {
  position: relative;
}

.nav-link__anchor {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: 10px var(--space-6, 24px);
  text-decoration: none;
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
  border-radius: 0;
  transition: color 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 44px;
  position: relative;
}

.nav-link__anchor:hover {
  color: var(--color-text, #f5f0e8);
  background-color: var(--color-surface, rgba(255, 255, 255, 0.04));
}

.nav-link__anchor:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: -2px;
  border-radius: var(--radius-xs, 4px);
}

/* Hover translate effect */
.sidebar.is-expanded .nav-link__anchor:hover {
  transform: translateX(4px);
}

.nav-link.is-active .nav-link__anchor {
  color: var(--color-text, #f5f0e8);
}

.nav-link__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  min-width: 20px;
  color: inherit;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link__anchor:hover .nav-link__icon {
  transform: scale(1.1);
}

.nav-link.is-active .nav-link__icon {
  color: var(--color-accent, #c4843e);
}

.nav-link__label {
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.02em;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
}

/* ─────────────────────────────────────────
   TOOLTIPS (collapsed state)
───────────────────────────────────────── */
.nav-link__tooltip {
  position: absolute;
  left: 76px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-canvas-alt, #141210);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 4px 12px;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text, #f5f0e8);
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

/* Tooltip arrow */
.nav-link__tooltip::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: var(--color-canvas-alt, #141210);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* Tooltip transition */
.tooltip-enter-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.tooltip-leave-active {
  transition: opacity 0.15s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.tooltip-enter-from {
  opacity: 0;
  transform: translateY(-50%) translateX(-6px);
}
.tooltip-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-4px);
}

/* ─────────────────────────────────────────
   SPACER
───────────────────────────────────────── */
.sidebar__spacer {
  flex: 1;
}

/* ─────────────────────────────────────────
   SOCIAL LINKS
───────────────────────────────────────── */
.sidebar__socials {
  list-style: none;
  padding: var(--space-2, 8px) 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-shrink: 0;
}

.social-link__anchor {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px var(--space-6, 24px);
  text-decoration: none;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  min-height: 36px;
  position: relative;
  transition: color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.social-link__anchor:hover {
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
}

.social-link__anchor:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: -2px;
  border-radius: var(--radius-xs, 4px);
}

/* Underline hover effect */
.social-link__anchor::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  width: 0;
  height: 1px;
  background: var(--color-accent-muted, rgba(196, 132, 62, 0.55));
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.social-link__anchor:hover::after {
  width: 16px;
  left: calc(50% - 8px);
}

.social-link__text {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: var(--text-label, 11px);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ─────────────────────────────────────────
   TOGGLE BUTTON
───────────────────────────────────────── */
.sidebar__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 44px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  transition: color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.sidebar__toggle:hover {
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
}

.sidebar__toggle:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: -2px;
  border-radius: var(--radius-xs, 4px);
}

/* Glow on hover */
.sidebar__toggle::before {
  content: '';
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.sidebar__toggle:hover::before {
  opacity: 1;
}

.toggle__arrow {
  transition: none; /* GSAP handles rotation */
}

/* ─────────────────────────────────────────
   MOBILE OVERLAY
───────────────────────────────────────── */
.sidebar__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: -1;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
}

.sidebar__overlay.is-visible {
  pointer-events: all;
}

/* ─────────────────────────────────────────
   MOBILE HAMBURGER
───────────────────────────────────────── */
.sidebar__hamburger {
  display: none;
  position: fixed;
  bottom: var(--space-6, 24px);
  right: var(--space-6, 24px);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-accent, #c4843e);
  border: none;
  cursor: pointer;
  z-index: calc(var(--z-nav, 900) + 1);
  pointer-events: all;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  box-shadow: 0 4px 20px rgba(196, 132, 62, 0.35),
              0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.sidebar__hamburger:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(196, 132, 62, 0.45),
              0 3px 12px rgba(0, 0, 0, 0.35);
}

.sidebar__hamburger:focus-visible {
  outline: 2px solid var(--color-text, #f5f0e8);
  outline-offset: 3px;
}

.sidebar__hamburger:active {
  transform: scale(0.95);
}

.hamburger__line {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--color-canvas, #0d0b09);
  border-radius: var(--radius-pill, 9999px);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center;
}

.hamburger__line--mid {
  width: 14px;
}

.hamburger__line--bot {
  width: 10px;
}

/* Hamburger to X morph */
.sidebar__hamburger.is-open .hamburger__line--top {
  transform: translateY(7px) rotate(45deg);
  width: 20px;
}

.sidebar__hamburger.is-open .hamburger__line--mid {
  opacity: 0;
  transform: scaleX(0);
}

.sidebar__hamburger.is-open .hamburger__line--bot {
  transform: translateY(-7px) rotate(-45deg);
  width: 20px;
}

/* ─────────────────────────────────────────
   GRAIN OVERLAY
───────────────────────────────────────── */
.sidebar::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/noise.png');
  background-repeat: repeat;
  opacity: 0.025;
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

/* ─────────────────────────────────────────
   MOBILE RESPONSIVE
───────────────────────────────────────── */
@media (max-width: 768px) {
  .sidebar__hamburger {
    display: flex;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 80vw;
    max-width: 320px;
    height: 100vh;
    height: 100dvh;
    transform: translateX(-100%);
    z-index: var(--z-nav, 900);
    padding: var(--space-8, 32px) 0 var(--space-6, 24px);
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    background-color: rgba(13, 11, 9, 0.96);
  }

  /* Show labels always on mobile */
  .sidebar .nav-link__label {
    opacity: 1 !important;
    visibility: visible !important;
  }

  .sidebar .logo__text {
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* No tooltips on mobile */
  .nav-link__tooltip {
    display: none;
  }

  /* Toggle hidden on mobile */
  .sidebar__toggle {
    display: none;
  }

  /* Adjust anchor padding */
  .nav-link__anchor {
    padding: 12px var(--space-8, 32px);
  }

  .social-link__anchor {
    padding: 10px var(--space-8, 32px);
    justify-content: flex-start;
  }

  .sidebar__logo {
    padding: 0 var(--space-8, 32px);
    margin-bottom: var(--space-3, 12px);
  }

  .sidebar__sep {
    margin-left: var(--space-6, 24px);
    margin-right: var(--space-6, 24px);
  }
}

/* ─────────────────────────────────────────
   DESKTOP HOVER EFFECTS
───────────────────────────────────────── */
@media (min-width: 769px) {
  .sidebar__hamburger {
    display: none;
  }

  .sidebar__overlay {
    display: none;
  }

  /* Subtle hover glow on nav items */
  .nav-link__anchor::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      var(--color-accent-subtle, rgba(196, 132, 62, 0.12)) 0%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }

  .nav-link.is-active .nav-link__anchor::before {
    opacity: 0.5;
  }

  .nav-link__anchor:hover::before {
    opacity: 1;
  }
}

/* ─────────────────────────────────────────
   REDUCED MOTION
───────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .sidebar *,
  .sidebar__hamburger,
  .hamburger__line {
    transition: none !important;
    animation: none !important;
  }

  .sidebar::after {
    animation: none;
  }
}
</style>
