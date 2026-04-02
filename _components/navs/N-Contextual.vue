<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'NContextual' })

const props = defineProps({
  logo: { type: String, default: 'Studio' },
  links: {
    type: Array,
    default: () => [
      { label: 'Work', href: '#work', sectionId: 'work' },
      { label: 'About', href: '#about', sectionId: 'about' },
      { label: 'Process', href: '#process', sectionId: null },
      { label: 'Contact', href: '#contact', sectionId: 'contact' }
    ]
  },
  sections: {
    type: Array,
    default: () => [
      { id: 'hero', theme: 'dark' },
      { id: 'about', theme: 'light' },
      { id: 'work', theme: 'dark' },
      { id: 'contact', theme: 'accent' }
    ]
  },
  cta: { type: String, default: "Let's talk" }
})

const emit = defineEmits(['link-click', 'cta-click'])

/* ---- Theme maps ---- */
const themes = {
  dark: {
    logo: 'rgba(245,240,232,0.6)',
    logoHover: 'rgba(245,240,232,0.9)',
    link: 'rgba(245,240,232,0.5)',
    linkHover: 'rgba(245,240,232,1)',
    ctaBorder: 'rgba(245,240,232,0.2)',
    ctaColor: 'rgba(245,240,232,0.8)',
    ctaHoverBorder: 'rgba(245,240,232,0.4)',
    ctaHoverColor: 'rgba(245,240,232,1)',
    dot: '#c4843e',
    underline: '#c4843e',
    sectionLabel: 'rgba(245,240,232,0.3)',
    diamond: 'rgba(196,132,62,0.6)',
    diamondHover: 'rgba(196,132,62,1)',
    hamburger: 'rgba(245,240,232,0.6)',
    mobileBg: 'rgba(13,11,9,0.95)',
    mobileLink: 'rgba(245,240,232,0.6)',
    mobileLinkHover: 'rgba(245,240,232,1)'
  },
  light: {
    logo: 'rgba(13,11,9,0.55)',
    logoHover: 'rgba(13,11,9,0.9)',
    link: 'rgba(13,11,9,0.45)',
    linkHover: 'rgba(13,11,9,0.85)',
    ctaBorder: 'rgba(13,11,9,0.2)',
    ctaColor: 'rgba(13,11,9,0.7)',
    ctaHoverBorder: 'rgba(13,11,9,0.4)',
    ctaHoverColor: 'rgba(13,11,9,0.95)',
    dot: '#0d0b09',
    underline: '#0d0b09',
    sectionLabel: 'rgba(13,11,9,0.3)',
    diamond: 'rgba(13,11,9,0.4)',
    diamondHover: 'rgba(13,11,9,0.8)',
    hamburger: 'rgba(13,11,9,0.6)',
    mobileBg: 'rgba(250,250,247,0.96)',
    mobileLink: 'rgba(13,11,9,0.5)',
    mobileLinkHover: 'rgba(13,11,9,0.9)'
  },
  accent: {
    logo: 'rgba(13,11,9,0.7)',
    logoHover: 'rgba(13,11,9,1)',
    link: 'rgba(13,11,9,0.5)',
    linkHover: 'rgba(13,11,9,0.9)',
    ctaBorder: 'rgba(13,11,9,0.25)',
    ctaColor: 'rgba(13,11,9,0.8)',
    ctaHoverBorder: 'rgba(13,11,9,0.45)',
    ctaHoverColor: 'rgba(13,11,9,1)',
    dot: 'rgba(13,11,9,0.6)',
    underline: 'rgba(13,11,9,0.6)',
    sectionLabel: 'rgba(13,11,9,0.35)',
    diamond: 'rgba(13,11,9,0.45)',
    diamondHover: 'rgba(13,11,9,0.8)',
    hamburger: 'rgba(13,11,9,0.7)',
    mobileBg: 'rgba(196,132,62,0.96)',
    mobileLink: 'rgba(13,11,9,0.5)',
    mobileLinkHover: 'rgba(13,11,9,0.9)'
  }
}

/* ---- Refs ---- */
const navRef = ref(null)
const logoRef = ref(null)
const diamondRef = ref(null)
const linksContainerRef = ref(null)
const ctaRef = ref(null)
const ctaArrowRef = ref(null)
const sectionLabelRef = ref(null)
const hamburgerRef = ref(null)
const mobileOverlayRef = ref(null)
const linkRefs = ref([])
const dotRefs = ref([])

/* ---- State ---- */
const sectionTheme = ref('dark')
const activeSection = ref('hero')
const sectionLabel = ref('Hero')
const mobileOpen = ref(false)

let mm = null
let observer = null
let ctaQuickX = null
let ctaQuickY = null
let scrollTicking = false

/* ---- Ref setters ---- */
function setLinkRef(el, i) {
  if (el) linkRefs.value[i] = el
}
function setDotRef(el, i) {
  if (el) dotRefs.value[i] = el
}

/* ---- Theme application ---- */
function applyTheme(theme, immediate = false) {
  const colors = themes[theme]
  if (!colors) return

  const dur = immediate ? 0 : 0.4
  const ease = 'power2.out'

  /* Logo text */
  if (logoRef.value) {
    gsap.to(logoRef.value, { color: colors.logo, duration: dur, ease })
  }

  /* Diamond mark */
  if (diamondRef.value) {
    gsap.to(diamondRef.value, { backgroundColor: colors.diamond, duration: dur, ease })
  }

  /* Links */
  const linkEls = linkRefs.value.filter(Boolean)
  if (linkEls.length) {
    gsap.to(linkEls, { color: colors.link, duration: dur, ease, stagger: 0.04 })
  }

  /* Dots */
  const dotEls = dotRefs.value.filter(Boolean)
  if (dotEls.length) {
    gsap.to(dotEls, { backgroundColor: colors.dot, duration: dur, ease })
  }

  /* CTA */
  if (ctaRef.value) {
    gsap.to(ctaRef.value, { color: colors.ctaColor, borderColor: colors.ctaBorder, duration: dur, ease })
  }

  /* Section label */
  if (sectionLabelRef.value) {
    gsap.to(sectionLabelRef.value, { color: colors.sectionLabel, duration: dur, ease })
  }

  /* Hamburger lines */
  if (hamburgerRef.value) {
    const lines = hamburgerRef.value.querySelectorAll('.n-ctx__hamburger-line')
    gsap.to(lines, { backgroundColor: colors.hamburger, duration: dur, ease })
  }
}

/* ---- Section observation ---- */
function setupObserver() {
  if (observer) observer.disconnect()

  const sectionEls = props.sections.map(s => document.getElementById(s.id)).filter(Boolean)
  if (!sectionEls.length) return

  observer = new IntersectionObserver((entries) => {
    /* Find the entry with the highest intersection ratio */
    let best = null
    let bestRatio = 0

    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
        best = entry
        bestRatio = entry.intersectionRatio
      }
    })

    if (best) {
      const sectionId = best.target.id
      const sectionConfig = props.sections.find(s => s.id === sectionId)
      if (sectionConfig && sectionConfig.theme !== sectionTheme.value) {
        sectionTheme.value = sectionConfig.theme
        activeSection.value = sectionId
        updateSectionLabel(sectionId)
        applyTheme(sectionConfig.theme)
      } else if (sectionConfig && sectionId !== activeSection.value) {
        activeSection.value = sectionId
        updateSectionLabel(sectionId)
      }
    }
  }, {
    threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
    rootMargin: '-30% 0px -30% 0px'
  })

  sectionEls.forEach(el => observer.observe(el))
}

/* ---- Section label animation ---- */
function updateSectionLabel(id) {
  const el = sectionLabelRef.value
  if (!el) return

  /* Animate old label out, swap text, animate new in */
  gsap.to(el, {
    autoAlpha: 0,
    y: -8,
    duration: 0.25,
    ease: 'power2.in',
    onComplete() {
      /* Capitalize id */
      sectionLabel.value = id.charAt(0).toUpperCase() + id.slice(1)
      gsap.fromTo(el,
        { autoAlpha: 0, y: 4 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' }
      )
    }
  })
}

/* ---- Active dot management ---- */
function updateActiveDot(sectionId) {
  dotRefs.value.forEach((dot, i) => {
    if (!dot) return
    const link = props.links[i]
    const isActive = link && link.sectionId === sectionId
    gsap.to(dot, {
      autoAlpha: isActive ? 1 : 0,
      scale: isActive ? 1 : 0.4,
      duration: 0.35,
      ease: 'power3.out'
    })
  })
}

watch(activeSection, (id) => {
  updateActiveDot(id)
})

/* ---- CTA magnetic ---- */
function handleCtaMousemove(e) {
  const el = ctaRef.value
  if (!el) return
  if (!ctaQuickX) {
    ctaQuickX = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power2.out' })
    ctaQuickY = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power2.out' })
  }
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) * 0.25
  const y = (e.clientY - rect.top - rect.height / 2) * 0.25
  ctaQuickX(x)
  ctaQuickY(y)
}

function handleCtaMouseleave() {
  if (ctaQuickX) {
    ctaQuickX(0)
    ctaQuickY(0)
  }
  /* Reset arrow */
  if (ctaArrowRef.value) {
    gsap.to(ctaArrowRef.value, { x: 0, duration: 0.4, ease: 'power3.out' })
  }
}

function handleCtaMouseenter() {
  const colors = themes[sectionTheme.value]
  if (ctaRef.value) {
    gsap.to(ctaRef.value, {
      borderColor: colors.ctaHoverBorder,
      color: colors.ctaHoverColor,
      duration: 0.3,
      ease: 'power2.out'
    })
  }
  if (ctaArrowRef.value) {
    gsap.to(ctaArrowRef.value, { x: 4, duration: 0.3, ease: 'power2.out' })
  }
}

function handleCtaFocusout() {
  const colors = themes[sectionTheme.value]
  if (ctaRef.value) {
    gsap.to(ctaRef.value, {
      borderColor: colors.ctaBorder,
      color: colors.ctaColor,
      duration: 0.3,
      ease: 'power2.out'
    })
  }
}

/* ---- Link hovers ---- */
function handleLinkEnter(e, i) {
  const colors = themes[sectionTheme.value]
  gsap.to(e.currentTarget, { color: colors.linkHover, duration: 0.25, ease: 'power2.out' })
  /* Underline reveal */
  const underline = e.currentTarget.querySelector('.n-ctx__link-underline')
  if (underline) {
    gsap.to(underline, {
      scaleX: 1,
      backgroundColor: colors.underline,
      duration: 0.35,
      ease: 'expo.out'
    })
  }
}

function handleLinkLeave(e, i) {
  const colors = themes[sectionTheme.value]
  gsap.to(e.currentTarget, { color: colors.link, duration: 0.25, ease: 'power2.out' })
  const underline = e.currentTarget.querySelector('.n-ctx__link-underline')
  if (underline) {
    gsap.to(underline, { scaleX: 0, duration: 0.3, ease: 'power2.out' })
  }
}

/* ---- Logo hover ---- */
function handleLogoEnter() {
  const colors = themes[sectionTheme.value]
  if (logoRef.value) {
    gsap.to(logoRef.value, { color: colors.logoHover, duration: 0.3, ease: 'power2.out' })
  }
  if (diamondRef.value) {
    gsap.to(diamondRef.value, {
      backgroundColor: colors.diamondHover,
      rotation: 135,
      scale: 1.15,
      duration: 0.4,
      ease: 'power3.out'
    })
  }
}

function handleLogoLeave() {
  const colors = themes[sectionTheme.value]
  if (logoRef.value) {
    gsap.to(logoRef.value, { color: colors.logo, duration: 0.3, ease: 'power2.out' })
  }
  if (diamondRef.value) {
    gsap.to(diamondRef.value, {
      backgroundColor: colors.diamond,
      rotation: 45,
      scale: 1,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    })
  }
}

/* ---- Scroll opacity ---- */
function handleScroll() {
  if (scrollTicking) return
  scrollTicking = true
  requestAnimationFrame(() => {
    const nav = navRef.value
    if (!nav) { scrollTicking = false; return }
    const y = window.scrollY
    gsap.to(nav, {
      autoAlpha: y < 20 ? 0.8 : 1,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto'
    })
    scrollTicking = false
  })
}

/* ---- Mobile ---- */
function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}

function closeMobile() {
  if (!mobileOpen.value) return
  const overlay = mobileOverlayRef.value
  if (overlay) {
    const items = overlay.querySelectorAll('.n-ctx__mobile-link')
    gsap.to(items, {
      autoAlpha: 0, y: 12, stagger: 0.03, duration: 0.2, ease: 'power2.in'
    })
    gsap.to(overlay, {
      autoAlpha: 0, duration: 0.3, ease: 'power3.in',
      delay: 0.12,
      onComplete: () => { mobileOpen.value = false }
    })
  } else {
    mobileOpen.value = false
  }
}

watch(mobileOpen, async (open) => {
  await nextTick()
  if (!open) return
  const overlay = mobileOverlayRef.value
  if (!overlay) return

  const colors = themes[sectionTheme.value]
  overlay.style.backgroundColor = colors.mobileBg

  gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power3.out' })

  const items = overlay.querySelectorAll('.n-ctx__mobile-link')
  gsap.fromTo(items,
    { autoAlpha: 0, y: 16 },
    { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power3.out', delay: 0.1 }
  )
})

/* ---- Hamburger animation ---- */
watch(mobileOpen, (open) => {
  if (!hamburgerRef.value) return
  const lines = hamburgerRef.value.querySelectorAll('.n-ctx__hamburger-line')
  if (lines.length < 2) return

  if (open) {
    gsap.to(lines[0], { y: 4, rotation: 45, duration: 0.3, ease: 'power3.out' })
    gsap.to(lines[1], { y: -4, rotation: -45, duration: 0.3, ease: 'power3.out' })
  } else {
    gsap.to(lines[0], { y: 0, rotation: 0, duration: 0.3, ease: 'power3.out' })
    gsap.to(lines[1], { y: 0, rotation: 0, duration: 0.3, ease: 'power3.out' })
  }
})

/* ---- Link click ---- */
function handleLinkClick(link, e) {
  emit('link-click', link, e)
  if (mobileOpen.value) closeMobile()
}

/* ---- Mounted ---- */
onMounted(() => {
  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 769px)',
    isMobile: '(max-width: 768px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { reduceMotion } = context.conditions

    /* Apply initial theme immediately */
    applyTheme(sectionTheme.value, true)

    if (reduceMotion) {
      /* Make everything visible */
      gsap.set([logoRef.value, linksContainerRef.value, ctaRef.value, sectionLabelRef.value].filter(Boolean), { autoAlpha: 1 })
      const linkEls = linkRefs.value.filter(Boolean)
      gsap.set(linkEls, { autoAlpha: 1 })
    } else {
      /* Entrance animation */
      /* Logo */
      gsap.fromTo(logoRef.value,
        { autoAlpha: 0, y: -10 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.3 }
      )

      /* Diamond */
      gsap.fromTo(diamondRef.value,
        { autoAlpha: 0, scale: 0, rotation: 0 },
        { autoAlpha: 1, scale: 1, rotation: 45, duration: 0.7, ease: 'back.out(1.7)', delay: 0.45 }
      )

      /* Links stagger */
      const linkEls = linkRefs.value.filter(Boolean)
      gsap.fromTo(linkEls,
        { autoAlpha: 0, y: -4 },
        { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.6, ease: 'power3.out', delay: 0.5 }
      )

      /* CTA */
      gsap.fromTo(ctaRef.value,
        { autoAlpha: 0, x: 10 },
        { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.out', delay: 0.75 }
      )

      /* Section label */
      gsap.fromTo(sectionLabelRef.value,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, ease: 'power2.out', delay: 1.0 }
      )

      /* Scroll-linked subtle y parallax on nav */
      gsap.to(navRef.value, {
        yPercent: -2,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: '+=600',
          scrub: 0.5
        }
      })
    }

    /* Scroll listener for opacity */
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, navRef.value)

  /* Dots: hide all initially */
  dotRefs.value.forEach(dot => {
    if (dot) gsap.set(dot, { autoAlpha: 0, scale: 0.4 })
  })

  /* Setup observer after a tick so DOM sections are ready */
  nextTick(() => {
    setupObserver()
    /* Activate the initial dot */
    updateActiveDot(activeSection.value)
  })
})

onBeforeUnmount(() => {
  mm?.revert()
  if (observer) observer.disconnect()
  ctaQuickX = null
  ctaQuickY = null
})
</script>

<template>
  <nav
    ref="navRef"
    class="n-ctx"
    aria-label="Main navigation"
  >
    <!-- Logo (left) -->
    <a
      ref="logoRef"
      class="n-ctx__logo"
      href="#"
      @mouseenter="handleLogoEnter"
      @mouseleave="handleLogoLeave"
      @click.prevent
    >
      <span
        ref="diamondRef"
        class="n-ctx__diamond"
        aria-hidden="true"
      />
      <span class="n-ctx__logo-text">{{ logo }}</span>
    </a>

    <!-- Center links (desktop) -->
    <div ref="linksContainerRef" class="n-ctx__links">
      <a
        v-for="(link, i) in links"
        :key="link.label"
        :ref="(el) => setLinkRef(el, i)"
        :href="link.href"
        class="n-ctx__link"
        :aria-current="link.sectionId === activeSection ? 'true' : undefined"
        @mouseenter="handleLinkEnter($event, i)"
        @mouseleave="handleLinkLeave($event, i)"
        @click.prevent="handleLinkClick(link, $event)"
      >
        {{ link.label }}
        <span class="n-ctx__link-underline" aria-hidden="true" />
        <span
          :ref="(el) => setDotRef(el, i)"
          class="n-ctx__link-dot"
          aria-hidden="true"
        />
      </a>
    </div>

    <!-- Section label (center bottom) -->
    <span
      ref="sectionLabelRef"
      class="n-ctx__section-label"
      aria-live="polite"
    >
      {{ sectionLabel }}
    </span>

    <!-- CTA (right, desktop) -->
    <a
      ref="ctaRef"
      class="n-ctx__cta"
      href="#contact"
      data-magnetic
      @mouseenter="handleCtaMouseenter"
      @mouseleave="handleCtaMouseleave"
      @mousemove="handleCtaMousemove"
      @focusout="handleCtaFocusout"
      @click.prevent="emit('cta-click', $event)"
    >
      <span class="n-ctx__cta-text">{{ cta }}</span>
      <span ref="ctaArrowRef" class="n-ctx__cta-arrow" aria-hidden="true">&rarr;</span>
    </a>

    <!-- Hamburger (mobile) -->
    <button
      ref="hamburgerRef"
      class="n-ctx__hamburger"
      :aria-expanded="mobileOpen"
      aria-controls="n-ctx-mobile-overlay"
      aria-label="Toggle menu"
      @click="toggleMobile"
    >
      <span class="n-ctx__hamburger-line" />
      <span class="n-ctx__hamburger-line" />
    </button>

    <!-- Mobile overlay -->
    <div
      v-if="mobileOpen"
      id="n-ctx-mobile-overlay"
      ref="mobileOverlayRef"
      class="n-ctx__mobile-overlay"
    >
      <a
        v-for="link in links"
        :key="'m-' + link.label"
        :href="link.href"
        class="n-ctx__mobile-link"
        @click.prevent="handleLinkClick(link, $event)"
      >
        {{ link.label }}
      </a>
      <a
        href="#contact"
        class="n-ctx__mobile-link n-ctx__mobile-link--cta"
        @click.prevent="emit('cta-click', $event); closeMobile()"
      >
        {{ cta }} &rarr;
      </a>
    </div>
  </nav>
</template>

<style scoped>
/* ═══════════════════════════════════════
   N-Contextual — Adaptive Theme Nav
   ═══════════════════════════════════════ */

.n-ctx {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: var(--z-nav, 900);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(20px, 4vw, 48px);
  background: transparent;
  pointer-events: none;
  /* Allow children to receive pointer events */
}

.n-ctx > * {
  pointer-events: auto;
}

/* ── Logo ── */
.n-ctx__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: rgba(245, 240, 232, 0.6);
  transition: none; /* GSAP handles transitions */
  position: relative;
  z-index: 2;
}

.n-ctx__logo:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: 2px;
}

.n-ctx__diamond {
  width: 9px;
  height: 9px;
  background-color: rgba(196, 132, 62, 0.6);
  transform: rotate(45deg);
  flex-shrink: 0;
}

.n-ctx__logo-text {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  line-height: 1;
}

/* ── Center links ── */
.n-ctx__links {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
}

.n-ctx__link {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-decoration: none;
  color: rgba(245, 240, 232, 0.5);
  padding: 8px 16px;
  position: relative;
  transition: none; /* GSAP handles */
}

.n-ctx__link:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Hover underline */
.n-ctx__link-underline {
  position: absolute;
  bottom: 4px;
  left: 16px;
  right: 16px;
  height: 1px;
  background-color: var(--color-accent, #c4843e);
  transform: scaleX(0);
  transform-origin: left center;
}

/* Active dot */
.n-ctx__link-dot {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: var(--color-accent, #c4843e);
}

/* ── Section label ── */
.n-ctx__section-label {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(245, 240, 232, 0.3);
  white-space: nowrap;
  pointer-events: none;
}

/* ── CTA ── */
.n-ctx__cta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-decoration: none;
  color: rgba(245, 240, 232, 0.8);
  border: 1px solid rgba(245, 240, 232, 0.2);
  border-radius: 2px;
  padding: 8px 20px;
  position: relative;
  z-index: 2;
  transition: none; /* GSAP handles */
}

.n-ctx__cta:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: 2px;
}

.n-ctx__cta-arrow {
  display: inline-block;
  font-size: 14px;
  line-height: 1;
}

/* ── Hamburger ── */
.n-ctx__hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 3;
  padding: 0;
}

.n-ctx__hamburger:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 2px;
  border-radius: 2px;
}

.n-ctx__hamburger-line {
  display: block;
  width: 24px;
  height: 2px;
  background-color: rgba(245, 240, 232, 0.6);
  transform-origin: center center;
}

/* ── Mobile overlay ── */
.n-ctx__mobile-overlay {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: calc(var(--z-nav, 900) - 1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 48px clamp(20px, 4vw, 48px) 32px;
  gap: 8px;
  background-color: rgba(13, 11, 9, 0.95);
}

.n-ctx__mobile-link {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(28px, 6vw, 42px);
  font-weight: 500;
  letter-spacing: -0.02em;
  text-decoration: none;
  color: rgba(245, 240, 232, 0.6);
  padding: 12px 0;
  line-height: 1.2;
  width: 100%;
  border-bottom: 1px solid rgba(245, 240, 232, 0.06);
}

.n-ctx__mobile-link:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
}

.n-ctx__mobile-link--cta {
  margin-top: 24px;
  font-size: 16px;
  font-weight: 400;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 1px solid rgba(245, 240, 232, 0.15);
  border-radius: 2px;
  padding: 14px 24px;
  text-align: center;
  width: auto;
}

/* ═══════════════════
   Responsive
   ═══════════════════ */

/* Mobile: <=768 */
@media (max-width: 768px) {
  .n-ctx__links {
    display: none;
  }

  .n-ctx__cta {
    display: none;
  }

  .n-ctx__section-label {
    /* Move to the left of hamburger */
    left: auto;
    right: 56px;
    bottom: auto;
    top: 50%;
    transform: translateY(-50%);
    font-size: 9px;
    letter-spacing: 0.12em;
  }

  .n-ctx__hamburger {
    display: flex;
  }
}

/* Tablet: 769-1279 */
@media (min-width: 769px) and (max-width: 1279px) {
  .n-ctx__link {
    padding: 8px 12px;
    font-size: 12px;
  }

  .n-ctx__cta {
    padding: 7px 16px;
    font-size: 12px;
  }
}

/* Large desktop: 1440+ */
@media (min-width: 1440px) {
  .n-ctx {
    padding: 0 64px;
  }
}
</style>
