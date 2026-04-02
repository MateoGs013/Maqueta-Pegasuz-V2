<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'NBottomFixedPill' })

const props = defineProps({
  logo: { type: String, default: 'Studio' },
  links: {
    type: Array,
    default: () => [
      { label: 'Work', href: '#work', icon: 'grid' },
      { label: 'About', href: '#about', icon: 'circle' },
      { label: 'Services', href: '#services', icon: 'lines' },
      { label: 'Lab', href: '#lab', icon: 'triangle' },
      { label: 'Contact', href: '#contact', icon: 'envelope' }
    ]
  },
  activeLink: { type: String, default: 'Work' },
  showCta: { type: Boolean, default: true }
})

const emit = defineEmits(['link-click', 'cta-click'])

/* ── Refs ── */
const navRef = ref(null)
const logoRef = ref(null)
const pillRef = ref(null)
const blobRef = ref(null)
const progressArcRef = ref(null)
const itemRefs = ref([])
const iconRefs = ref([])
const ctaRef = ref(null)
const ctaArrowRef = ref(null)

/* ── State ── */
const currentActive = ref(props.activeLink)
const pillVisible = ref(false)
let mm = null
let scrollY = 0
let lastScrollY = 0
let scrollDelta = 0
let ticking = false
let pillShowTween = null
let pillHideTween = null
let entranceComplete = false

/* Mobile links: 4 items */
const mobileLinks = computed(() => {
  const keep = ['Work', 'About', 'Lab', 'Contact']
  return props.links.filter(l => keep.includes(l.label))
})

function setItemRef(el, i) {
  if (el) itemRefs.value[i] = el
}

function setIconRef(el, i) {
  if (el) iconRefs.value[i] = el
}

/* ── Active blob positioning ── */
function updateBlobPosition(animate = true) {
  const blob = blobRef.value
  if (!blob) return
  const activeIdx = props.links.findIndex(l => l.label === currentActive.value)
  if (activeIdx < 0) return
  const item = itemRefs.value[activeIdx]
  if (!item) return

  const pill = pillRef.value
  if (!pill) return
  const pillRect = pill.getBoundingClientRect()
  const itemRect = item.getBoundingClientRect()

  const x = itemRect.left - pillRect.left
  const w = itemRect.width
  const h = itemRect.height

  if (animate) {
    gsap.to(blob, {
      x,
      width: w,
      height: h,
      duration: 0.4,
      ease: 'power3.out'
    })
  } else {
    gsap.set(blob, { x, width: w, height: h })
  }
}

/* ── Handle item click ── */
function handleItemClick(link, e) {
  const prevActive = currentActive.value
  currentActive.value = link.label
  emit('link-click', link, e)

  /* Haptic-like pulse on icon */
  const idx = props.links.findIndex(l => l.label === link.label)
  const icon = iconRefs.value[idx]
  if (icon && prevActive !== link.label) {
    gsap.fromTo(icon, { scale: 1.2 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' })
  }

  nextTick(() => updateBlobPosition(true))
}

/* ── CTA magnetic ── */
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

/* ── Scroll progress for bar ── */
function updateScrollProgress() {
  const bar = progressArcRef.value
  if (!bar) return
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0
  bar.style.transform = `scaleX(${progress})`
}

/* ── Scroll handler ── */
function onScroll() {
  scrollY = window.scrollY || window.pageYOffset
  if (!ticking) {
    requestAnimationFrame(() => {
      scrollDelta = scrollY - lastScrollY

      /* Don't fight the entrance animation */
      if (entranceComplete) {
        /* Show/hide pill based on position and direction */
        if (scrollY < 40) {
          /* At very top — hide pill */
          hidePill()
        } else if (scrollDelta > 60) {
          /* Scrolling DOWN fast — hide */
          hidePill()
        } else if (scrollDelta < -5) {
          /* Scrolling UP — show */
          showPill()
        } else if (!pillVisible.value && scrollY >= 40) {
          /* Past threshold, not hidden by scroll-down, show */
          showPill()
        }
      }

      updateScrollProgress()
      lastScrollY = scrollY
      ticking = false
    })
    ticking = true
  }
}

function showPill() {
  if (pillVisible.value) return
  pillVisible.value = true
  pillHideTween?.kill()
  pillShowTween = gsap.to(pillRef.value, {
    y: 0,
    autoAlpha: 1,
    duration: 0.5,
    ease: 'back.out(1.2)'
  })
}

function hidePill() {
  if (!pillVisible.value) return
  pillVisible.value = false
  pillShowTween?.kill()
  pillHideTween = gsap.to(pillRef.value, {
    y: 100,
    autoAlpha: 0,
    duration: 0.3,
    ease: 'power3.in'
  })
}

/* ── Lifecycle ── */
onMounted(() => {
  mm = gsap.matchMedia()

  mm.add({
    isDesktop: '(min-width: 769px)',
    isMobile: '(max-width: 768px)',
    reduceMotion: '(prefers-reduced-motion: reduce)'
  }, (context) => {
    const { reduceMotion } = context.conditions

    if (reduceMotion) {
      gsap.set(logoRef.value, { autoAlpha: 1 })
      gsap.set(pillRef.value, { autoAlpha: 1, y: 0 })
      gsap.set(itemRefs.value, { autoAlpha: 1 })
      if (ctaRef.value) gsap.set(ctaRef.value, { autoAlpha: 1 })
      pillVisible.value = true
      entranceComplete = true
      nextTick(() => updateBlobPosition(false))
      return
    }

    /* ── Entrance: top logo ── */
    gsap.fromTo(logoRef.value,
      { autoAlpha: 0, y: -10 },
      { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' }
    )

    /* ── Entrance: bottom pill ── */
    gsap.set(pillRef.value, { y: 40, autoAlpha: 0 })
    gsap.to(pillRef.value, {
      y: 0,
      autoAlpha: 1,
      duration: 1,
      ease: 'back.out(1.6)',
      delay: 0.8,
      onComplete: () => {
        pillVisible.value = true
        entranceComplete = true
        nextTick(() => updateBlobPosition(false))
      }
    })

    /* ── Entrance: items stagger ── */
    gsap.fromTo(itemRefs.value,
      { autoAlpha: 0, y: 8 },
      {
        autoAlpha: 1,
        y: 0,
        stagger: 0.06,
        delay: 1.0,
        duration: 0.5,
        ease: 'power3.out'
      }
    )

    /* ── CTA entrance ── */
    if (ctaRef.value) {
      gsap.fromTo(ctaRef.value,
        { autoAlpha: 0, x: 10 },
        { autoAlpha: 1, x: 0, duration: 0.6, delay: 1.3, ease: 'power3.out' }
      )
    }

    /* ── Scroll progress bar (scrub-linked) ── */
    if (progressArcRef.value) {
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
          if (progressArcRef.value) {
            progressArcRef.value.style.transform = `scaleX(${self.progress})`
          }
        }
      })
    }
  }, navRef.value)

  /* Scroll listener for show/hide */
  window.addEventListener('scroll', onScroll, { passive: true })

  /* Initial position — pill hidden at top */
  nextTick(() => {
    if (window.scrollY < 40) {
      gsap.set(pillRef.value, { y: 40, autoAlpha: 0 })
    }
  })
})

onBeforeUnmount(() => {
  mm?.revert()
  window.removeEventListener('scroll', onScroll)
  pillShowTween?.kill()
  pillHideTween?.kill()
})

watch(currentActive, () => {
  nextTick(() => updateBlobPosition(true))
})
</script>

<template>
  <nav
    ref="navRef"
    class="n-bottom-pill"
    aria-label="Bottom navigation"
  >
    <!-- ── Top logo (minimal, always visible) ── -->
    <a
      ref="logoRef"
      class="n-bottom-pill__logo"
      href="/"
      aria-label="Home"
    >
      {{ logo }}
    </a>

    <!-- ── Bottom pill wrapper (centering) ── -->
    <div class="n-bottom-pill__anchor">
    <div ref="pillRef" class="n-bottom-pill__pill">
      <!-- Inner highlight -->
      <!-- Grain texture -->
      <div class="n-bottom-pill__grain" aria-hidden="true"></div>

      <!-- Scroll progress line (bottom edge of pill) -->
      <div class="n-bottom-pill__progress-track" aria-hidden="true">
        <div ref="progressArcRef" class="n-bottom-pill__progress-bar"></div>
      </div>

      <!-- Active blob (slides between items) -->
      <div ref="blobRef" class="n-bottom-pill__blob" aria-hidden="true"></div>

      <!-- Nav items (desktop: 5, mobile: 4 icons-only) -->
      <div class="n-bottom-pill__items">
        <button
          v-for="(link, i) in links"
          :key="link.href"
          :ref="(el) => setItemRef(el, i)"
          class="n-bottom-pill__item"
          :class="{
            'is-active': currentActive === link.label,
            'is-mobile-hidden': !mobileLinks.some(ml => ml.label === link.label)
          }"
          :aria-current="currentActive === link.label ? 'page' : undefined"
          @click="handleItemClick(link, $event)"
        >
          <!-- Icons -->
          <svg
            :ref="(el) => setIconRef(el, i)"
            class="n-bottom-pill__icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <!-- grid: 2x2 squares -->
            <template v-if="link.icon === 'grid'">
              <rect x="3" y="3" width="6" height="6" rx="1.5" fill="currentColor" />
              <rect x="11" y="3" width="6" height="6" rx="1.5" fill="currentColor" />
              <rect x="3" y="11" width="6" height="6" rx="1.5" fill="currentColor" />
              <rect x="11" y="11" width="6" height="6" rx="1.5" fill="currentColor" />
            </template>
            <!-- circle: outer ring + inner dot -->
            <template v-if="link.icon === 'circle'">
              <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5" fill="none" />
              <circle cx="10" cy="10" r="2.5" fill="currentColor" />
            </template>
            <!-- lines: 3 stacked, decreasing width -->
            <template v-if="link.icon === 'lines'">
              <rect x="2" y="5" width="16" height="1.5" rx="0.75" fill="currentColor" />
              <rect x="2" y="9.5" width="12" height="1.5" rx="0.75" fill="currentColor" />
              <rect x="2" y="14" width="8" height="1.5" rx="0.75" fill="currentColor" />
            </template>
            <!-- triangle -->
            <template v-if="link.icon === 'triangle'">
              <path d="M10 3L17.5 16H2.5L10 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none" />
            </template>
            <!-- envelope -->
            <template v-if="link.icon === 'envelope'">
              <rect x="2.5" y="5" width="15" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none" />
              <path d="M3 6L10 11L17 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            </template>
          </svg>
          <span class="n-bottom-pill__label">{{ link.label }}</span>
        </button>
      </div>

      <!-- Desktop CTA separator + button -->
      <div v-if="showCta" class="n-bottom-pill__cta-area">
        <div class="n-bottom-pill__separator" aria-hidden="true"></div>
        <a
          ref="ctaRef"
          href="#hire"
          class="n-bottom-pill__cta"
          data-magnetic
          @mousemove="handleCtaMousemove"
          @mouseleave="handleCtaMouseleave"
          @click.prevent="emit('cta-click', $event)"
        >
          <span ref="ctaArrowRef" class="n-bottom-pill__cta-arrow" aria-hidden="true">&rarr;</span>
          <span class="n-bottom-pill__cta-text">Hire us</span>
        </a>
      </div>
    </div>
    </div>
  </nav>
</template>

<style scoped>
/* ── Reset ── */
.n-bottom-pill *,
.n-bottom-pill *::before,
.n-bottom-pill *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── Nav wrapper ── */
.n-bottom-pill {
  position: fixed;
  inset: 0;
  z-index: var(--z-nav, 900);
  pointer-events: none;
}

/* ── Top logo ── */
.n-bottom-pill__logo {
  position: fixed;
  top: var(--space-6, 24px);
  left: 40px;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: var(--text-label, 11px);
  font-weight: 400;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  text-decoration: none;
  letter-spacing: var(--tracking-wider, 0.2em);
  text-transform: uppercase;
  pointer-events: auto;
  visibility: hidden;
  transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: calc(var(--z-nav, 900) + 1);
}

.n-bottom-pill__logo:hover {
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
}

.n-bottom-pill__logo:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 4px;
  border-radius: var(--radius-xs, 4px);
}

/* ── Pill anchor (centering wrapper) ── */
.n-bottom-pill__anchor {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: var(--z-nav, 900);
}

/* ── Bottom pill container ── */
.n-bottom-pill__pill {
  display: flex;
  align-items: center;
  padding: var(--space-2, 8px);
  background: rgba(20, 18, 16, 0.88);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: var(--radius-pill, 9999px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 1px 0 rgba(255, 255, 255, 0.05) inset,
    0 0 0 1px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  visibility: hidden;
  position: relative;
}

/* Inner highlight — top edge glow */
.n-bottom-pill__pill::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.07) 0%,
    rgba(255, 255, 255, 0.02) 30%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 0;
}

/* Ambient glow behind the pill */
.n-bottom-pill__pill::after {
  content: '';
  position: absolute;
  inset: -12px;
  border-radius: inherit;
  background: radial-gradient(
    ellipse at center,
    rgba(196, 132, 62, 0.06) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: -1;
  filter: blur(16px);
}

/* Grain overlay */
.n-bottom-pill__grain {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: url('/noise.png');
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
}

/* ── Scroll progress bar ── */
.n-bottom-pill__progress-track {
  position: absolute;
  bottom: 0;
  left: var(--space-4, 16px);
  right: var(--space-4, 16px);
  height: 2px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 1px;
  overflow: hidden;
  pointer-events: none;
  z-index: 3;
}

.n-bottom-pill__progress-bar {
  width: 100%;
  height: 100%;
  background: var(--color-accent, #c4843e);
  border-radius: 1px;
  transform: scaleX(0);
  transform-origin: left center;
  opacity: 0.5;
}

/* ── Active blob ── */
.n-bottom-pill__blob {
  position: absolute;
  top: var(--space-2, 8px);
  left: 0;
  height: 0;
  width: 0;
  background: var(--color-accent-subtle, rgba(196, 132, 62, 0.12));
  border-radius: var(--radius-pill, 9999px);
  pointer-events: none;
  z-index: 1;
}

/* ── Nav items row ── */
.n-bottom-pill__items {
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
  z-index: 2;
}

/* ── Single nav item ── */
.n-bottom-pill__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: var(--space-2, 8px) var(--space-4, 16px);
  border-radius: var(--radius-pill, 9999px);
  cursor: pointer;
  border: none;
  background: transparent;
  position: relative;
  z-index: 2;
  visibility: hidden;
  transition:
    background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  -webkit-tap-highlight-color: transparent;
}

.n-bottom-pill__item:hover:not(.is-active) {
  background: var(--color-surface, rgba(255, 255, 255, 0.04));
}

.n-bottom-pill__item:hover:not(.is-active) .n-bottom-pill__icon {
  color: var(--color-text-muted, rgba(245, 240, 232, 0.52));
}

.n-bottom-pill__item.is-active {
  background: rgba(196, 132, 62, 0.15);
  transform: scale(1.02);
}

.n-bottom-pill__item.is-active .n-bottom-pill__icon {
  color: var(--color-accent, #c4843e);
}

.n-bottom-pill__item.is-active .n-bottom-pill__label {
  color: var(--color-text, #f5f0e8);
}

.n-bottom-pill__item:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 2px;
}

/* ── Icon ── */
.n-bottom-pill__icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

/* ── Label ── */
.n-bottom-pill__label {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: var(--text-label-sm, 10px);
  font-weight: 400;
  color: var(--color-text-subtle, rgba(245, 240, 232, 0.22));
  letter-spacing: var(--tracking-wide, 0.1em);
  text-transform: uppercase;
  white-space: nowrap;
  transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  line-height: var(--leading-none, 1);
}

/* ── Desktop CTA area ── */
.n-bottom-pill__cta-area {
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
  z-index: 2;
  margin-left: var(--space-1, 4px);
}

.n-bottom-pill__separator {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.09);
  margin-right: var(--space-3, 12px);
  flex-shrink: 0;
}

.n-bottom-pill__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: var(--text-label, 11px);
  font-weight: 400;
  color: var(--color-accent, #c4843e);
  text-decoration: none;
  padding: 0 var(--space-3, 12px) 0 var(--space-4, 16px);
  white-space: nowrap;
  letter-spacing: var(--tracking-wide, 0.1em);
  pointer-events: auto;
  visibility: hidden;
  transition: color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 44px;
}

.n-bottom-pill__cta:hover {
  color: var(--color-text, #f5f0e8);
}

.n-bottom-pill__cta:hover .n-bottom-pill__cta-arrow {
  transform: translateX(3px);
}

.n-bottom-pill__cta-arrow {
  display: inline-block;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  font-size: 14px;
  line-height: 1;
}

.n-bottom-pill__cta-text {
  line-height: 1;
}

.n-bottom-pill__cta:focus-visible {
  outline: 2px solid var(--color-accent, #c4843e);
  outline-offset: 3px;
  border-radius: var(--radius-xs, 4px);
}

/* ══════════════════════════════════════════
   MOBILE
   ══════════════════════════════════════════ */
@media (max-width: 480px) {
  .n-bottom-pill__logo {
    left: var(--space-4, 16px);
    top: var(--space-4, 16px);
  }

  .n-bottom-pill__anchor {
    bottom: 20px;
  }

  .n-bottom-pill__pill {
    padding: 10px var(--space-3, 12px);
  }

  /* Hide labels on mobile */
  .n-bottom-pill__label {
    display: none;
  }

  /* Larger icons */
  .n-bottom-pill__icon {
    width: 22px;
    height: 22px;
  }

  .n-bottom-pill__item {
    padding: var(--space-3, 12px);
  }

  /* Hide Services on mobile */
  .n-bottom-pill__item.is-mobile-hidden {
    display: none;
  }

  /* Hide CTA area on mobile */
  .n-bottom-pill__cta-area {
    display: none;
  }

  /* Hide progress track on mobile */
  .n-bottom-pill__progress-track {
    display: none;
  }
}

/* ══════════════════════════════════════════
   TABLET
   ══════════════════════════════════════════ */
@media (min-width: 481px) and (max-width: 768px) {
  .n-bottom-pill__logo {
    left: var(--space-6, 24px);
  }

  .n-bottom-pill__anchor {
    bottom: 24px;
  }

  /* Slightly smaller labels */
  .n-bottom-pill__label {
    font-size: 9px;
  }

  .n-bottom-pill__item {
    padding: var(--space-2, 8px) var(--space-3, 12px);
  }
}

/* ══════════════════════════════════════════
   LARGE DESKTOP
   ══════════════════════════════════════════ */
@media (min-width: 1440px) {
  .n-bottom-pill__logo {
    left: 56px;
  }
}
</style>
