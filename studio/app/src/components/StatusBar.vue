<script setup>
import { computed } from 'vue'
import { store } from '../store.js'

const statusLabel = computed(() => ({
  idle: 'inactivo',
  starting: 'arrancando…',
  working: 'trabajando',
  'waiting-decision': 'esperando tu decisión',
  error: 'error',
}[store.sessionStatus] || store.sessionStatus))

const pendingPins = computed(() => store.feedback.filter((f) => !f.drainedAt).length)
const openAdjust = computed(() => store.critiques.filter((c) => c.verdict === 'adjust' && !c.resolved).length)
const lastActivity = computed(() => store.activity[0] || null)
</script>

<template>
  <div class="bar mono">
    <span class="dot" :class="{ on: store.connected }" :title="store.connected ? 'server conectado' : 'server caído — Eros está sordo'" />
    <span>sesión: <b :class="{ pulse: store.sessionStatus === 'waiting-decision' }">{{ statusLabel }}</b></span>
    <span v-if="pendingPins">📌 {{ pendingPins }} pins sin drenar</span>
    <span v-if="openAdjust" style="color: var(--warn)">⚠ {{ openAdjust }} adjust abiertas (bloquean cierre de fase)</span>
    <span v-if="lastActivity" class="dim last">{{ lastActivity.kind }}: {{ lastActivity.text }}</span>
  </div>
</template>

<style scoped>
.bar {
  display: flex; align-items: center; gap: 18px;
  padding: 6px 14px; font-size: 11px; background: var(--bg-panel);
}
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--danger); }
.dot.on { background: var(--ok); }
.pulse { color: var(--accent); animation: pulse 1.2s infinite; }
@keyframes pulse { 50% { opacity: 0.45; } }
.last { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; text-align: right; }
</style>
