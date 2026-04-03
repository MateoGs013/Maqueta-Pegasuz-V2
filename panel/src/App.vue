<script setup>
import { defineAsyncComponent, ref, onMounted, onUnmounted } from 'vue'
import PanelSwitcher from '@/components/PanelSwitcher.vue'

// Check for ?preview=ComponentName in the URL.
// This lets the panel's own Vite server render a component in isolation
// inside an iframe without needing a separate dev server.
const params = new URLSearchParams(window.location.search)
const previewName = params.get('preview')
const isPreview = Boolean(previewName)
const isNav = previewName?.startsWith('N-')

// In preview mode: remove overflow:hidden so the component can scroll
// (panel.css sets overflow:hidden on html/body for the shell layout)
if (isPreview) {
  document.documentElement.classList.add('preview-mode')
}

// Dynamically load the requested component.
// Vite statically analyzes both branches and bundles all matching files.
const PreviewComp = isPreview
  ? defineAsyncComponent(() =>
      isNav
        ? import(`@components/navs/${previewName}.vue`)
        : import(`@components/heroes/${previewName}.vue`)
    )
  : null

// ── Workshop prop overrides via postMessage ──
const propOverrides = ref({})

function onMessage(e) {
  if (e.data?.type === 'prop-override') {
    propOverrides.value = { ...e.data.props }
  }
}

if (isPreview) {
  onMounted(() => window.addEventListener('message', onMessage))
  onUnmounted(() => window.removeEventListener('message', onMessage))
}
</script>

<template>
  <!-- ── Preview mode: render component fullscreen ── -->
  <template v-if="isPreview">
    <Suspense>
      <component :is="PreviewComp" v-bind="propOverrides" />
      <template #fallback>
        <div class="preview-loading">Loading {{ previewName }}…</div>
      </template>
    </Suspense>

    <!-- Demo content behind navs / scroll space for heroes -->
    <template v-if="isNav">
      <section id="hero"    style="height:100vh;background:#0d0b09;display:flex;align-items:center;padding:0 80px"><p style="font:300 clamp(36px,6vw,80px)/1.1 'Cormorant Garamond',serif;color:rgba(245,240,232,.07)">Dark section</p></section>
      <section id="about"   style="height:100vh;background:#fafaf7;display:flex;align-items:center;padding:0 80px"><p style="font:700 clamp(36px,6vw,80px)/1.1 'Space Grotesk',sans-serif;color:rgba(13,11,9,.08)">Light section</p></section>
      <section id="work"    style="height:100vh;background:#0d0b09;display:flex;align-items:center;padding:0 80px"><p style="font:300 clamp(36px,6vw,80px)/1.1 'Cormorant Garamond',serif;color:rgba(245,240,232,.07)">Dark section</p></section>
      <section id="contact" style="height:80vh;background:#c4843e;display:flex;align-items:center;padding:0 80px"><p style="font:700 clamp(36px,6vw,80px)/1.1 'Space Grotesk',sans-serif;color:rgba(13,11,9,.12)">Accent section</p></section>
    </template>
    <template v-else>
      <div style="height:200vh;background:#0d0b09" />
    </template>
  </template>

  <!-- ── Panel mode: router handles shell selection ── -->
  <template v-else>
    <RouterView />
    <PanelSwitcher />
  </template>
</template>

<style scoped>
.preview-loading {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 400 11px 'DM Mono', monospace;
  color: rgba(245,240,232,0.25);
  letter-spacing: 0.15em;
  background: #0d0b09;
}
</style>
