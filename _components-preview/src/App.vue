<script setup>
import NContextual from '@components/navs/N-Contextual.vue'
</script>
<template>
  <NContextual />
  <!-- Multiple sections to trigger context changes -->
  <section id="hero" style="height: 100vh; background: #0d0b09; display: flex; align-items: center; padding: 0 80px;">
    <p style="font: 300 clamp(40px,6vw,90px)/1.1 'Cormorant Garamond', serif; color: rgba(245,240,232,0.1); max-width: 800px;">Hero — dark section</p>
  </section>
  <section id="about" style="height: 100vh; background: #fafaf7; display: flex; align-items: center; padding: 0 80px;">
    <p style="font: 700 clamp(40px,6vw,90px)/1.1 'Space Grotesk', sans-serif; color: rgba(13,11,9,0.15); max-width: 800px;">About — light section</p>
  </section>
  <section id="work" style="height: 100vh; background: #0d0b09; display: flex; align-items: center; padding: 0 80px;">
    <p style="font: 300 clamp(40px,6vw,90px)/1.1 'Cormorant Garamond', serif; color: rgba(245,240,232,0.1); max-width: 800px;">Work — dark section again</p>
  </section>
  <section id="contact" style="height: 80vh; background: #c4843e; display: flex; align-items: center; padding: 0 80px;">
    <p style="font: 700 clamp(40px,6vw,90px)/1.1 'Space Grotesk', sans-serif; color: rgba(13,11,9,0.2); max-width: 800px;">Contact — accent section</p>
  </section>
</template>
