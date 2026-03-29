<script setup>
// AtmosphereCanvas and AppPreloader are added by the pipeline
// Do not add them manually before Step 2 and Step 4 complete
</script>

<template>
  <div id="app-root">
    <!-- AtmosphereCanvas goes here (Step 2) -->
    <!-- AppPreloader goes here (Step 4) -->
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
/* Base reset — design tokens in tokens.css */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: var(--font-body);
  color: var(--text);
  background-color: var(--canvas);
  line-height: 1.6;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

/* Page transition (customized by Choreographer in Step 4) */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
