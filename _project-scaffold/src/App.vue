<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from '@/composables/useLenis'
import AppCursor from '@/components/AppCursor.vue'
import AppPreloader from '@/components/AppPreloader.vue'
// import AppHeader from '@/components/AppHeader.vue'
// import AppFooter from '@/components/AppFooter.vue'
// import AtmosphereCanvas from '@/components/AtmosphereCanvas.vue'

gsap.registerPlugin(ScrollTrigger)

const { init: initLenis, destroy: destroyLenis } = useLenis()
const transitionOverlay = ref(null)
const isLoaded = ref(false)

onMounted(() => {
  initLenis()
})

onBeforeUnmount(() => {
  destroyLenis()
})

// Page transition handlers (GSAP-powered, not CSS)
function onLeave(el, done) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    done()
    return
  }

  const tl = gsap.timeline({ onComplete: done })

  tl.to(el, {
    opacity: 0,
    y: -20,
    duration: 0.4,
    ease: 'var(--ease-out)' // Brand easing from tokens
  })

  tl.to(transitionOverlay.value, {
    scaleY: 1,
    transformOrigin: 'bottom',
    duration: 0.5,
    ease: 'power4.inOut'
  }, '-=0.2')
}

function onEnter(el, done) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    done()
    return
  }

  const tl = gsap.timeline({ onComplete: done })

  tl.to(transitionOverlay.value, {
    scaleY: 0,
    transformOrigin: 'top',
    duration: 0.5,
    ease: 'power4.inOut'
  })

  tl.from(el, {
    opacity: 0,
    y: 20,
    duration: 0.5,
    ease: 'var(--ease-out)'
  }, '-=0.3')

  window.scrollTo(0, 0)
}

function onPreloaderComplete() {
  isLoaded.value = true
}
</script>

<template>
  <!-- Preloader (brand-themed, mandatory) -->
  <AppPreloader
    v-if="!isLoaded"
    :brand-name="'Loading'"
    @complete="onPreloaderComplete"
  />

  <!-- Skip to content (a11y) -->
  <a href="#main-content" class="skip-link">Skip to content</a>

  <!-- Atmospheric canvas (persistent, mandatory) -->
  <!-- <AtmosphereCanvas /> -->

  <!-- Custom cursor (mandatory on desktop) -->
  <AppCursor />

  <!-- Page transition overlay -->
  <div ref="transitionOverlay" class="page-transition" aria-hidden="true"></div>

  <!-- Header -->
  <!-- <AppHeader /> -->

  <main id="main-content">
    <router-view v-slot="{ Component, route }">
      <transition
        :css="false"
        mode="out-in"
        @leave="onLeave"
        @enter="onEnter"
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </main>

  <!-- Footer -->
  <!-- <AppFooter /> -->
</template>

<style>
/* Page transition overlay */
.page-transition {
  position: fixed;
  inset: 0;
  background: var(--color-signal, #333);
  z-index: var(--z-overlay, 500);
  transform: scaleY(0);
  transform-origin: bottom;
  pointer-events: none;
}

/* Skip link (a11y) */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: var(--color-signal, #000);
  color: var(--color-canvas, #fff);
  padding: 8px 16px;
  z-index: 10000;
  text-decoration: none;
}
.skip-link:focus {
  top: 0;
}
</style>
