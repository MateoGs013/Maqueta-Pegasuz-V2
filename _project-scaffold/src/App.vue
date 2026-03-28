<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

// Lenis smooth scroll (optional - remove if not needed)
let lenis = null

onMounted(async () => {
  const { default: Lenis } = await import('lenis')
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true })

  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
})

onBeforeUnmount(() => {
  lenis?.destroy()
})
</script>

<template>
  <!-- Skip to content (a11y) -->
  <a href="#main-content" class="skip-link">Skip to content</a>

  <!-- Header component goes here -->
  <!-- <AppHeader /> -->

  <main id="main-content">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>

  <!-- Footer component goes here -->
  <!-- <AppFooter /> -->
</template>

<style>
/* Page transition */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Skip link (a11y) */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: var(--color-accent-primary, #000);
  color: var(--color-text-inverse, #fff);
  padding: 8px 16px;
  z-index: 9999;
  text-decoration: none;
}
.skip-link:focus {
  top: 0;
}
</style>
