<script setup>
import { computed } from 'vue'
import { store } from '../store.js'

const pendingPins = computed(() => store.feedback.filter((f) => !f.drainedAt).length)
const openAdjust = computed(() => store.critiques.filter((c) => c.verdict === 'adjust' && !c.resolved).length)
const lastActivity = computed(() => store.activity[0] || null)
</script>

<template>
  <div class="bar mono">
    <span class="link" :title="store.connected ? 'server de Studio conectado' : 'server caído — Eros está sordo'">
      <span class="dot" :class="{ on: store.connected }" />
      {{ store.connected ? 'studio' : 'sin server' }}
    </span>

    <span v-if="pendingPins" class="item">
      <b>{{ pendingPins }}</b> pin{{ pendingPins > 1 ? 's' : '' }} sin drenar
    </span>

    <span v-if="openAdjust" class="item blocker">
      <b>{{ openAdjust }}</b> adjust abierta{{ openAdjust > 1 ? 's' : '' }} — bloquean cierre de fase
    </span>

    <span v-if="lastActivity" class="last dim">
      <span class="last-kind">{{ lastActivity.kind }}</span> {{ lastActivity.text }}
    </span>
  </div>
</template>

<style scoped>
.bar {
  display: flex; align-items: center; gap: 22px;
  padding: 7px 16px; font-size: 10px; background: var(--bg-panel);
  color: var(--text-dim);
}
.link { display: flex; align-items: center; gap: 7px; }
.item b { color: var(--text); font-weight: 500; }
.item.blocker { color: var(--warn); }
.item.blocker b { color: var(--warn); }
.last {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  flex: 1; text-align: right;
}
.last-kind {
  color: var(--text-faint); text-transform: uppercase;
  letter-spacing: 0.12em; font-size: 8.5px; margin-right: 6px;
}
</style>
