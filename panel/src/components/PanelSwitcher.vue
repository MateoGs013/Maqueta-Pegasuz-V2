<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const current = computed(() => route.path.startsWith('/workshop') ? 'workshop' : 'eros')
</script>

<template>
  <nav class="switcher" aria-label="Panel switcher">
    <RouterLink to="/eros" class="sw-btn" :class="{ active: current === 'eros' }">Eros</RouterLink>
    <RouterLink to="/workshop" class="sw-btn" :class="{ active: current === 'workshop' }">Workshop</RouterLink>
  </nav>
</template>

<style scoped>
.switcher {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 9000;
  display: flex;
  gap: 0;
  border: 1px solid var(--line-strong);
  background: var(--bg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

.sw-btn {
  padding: 5px 14px;
  font: 600 9px var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--text-dim);
  transition: color 120ms, background 120ms;
  cursor: pointer;
}
.sw-btn:hover { color: var(--text-muted); }
.sw-btn.active { color: var(--accent); background: var(--accent-ember); }
.sw-btn.active[href*="workshop"] { color: var(--info); background: var(--info-soft); }
</style>
