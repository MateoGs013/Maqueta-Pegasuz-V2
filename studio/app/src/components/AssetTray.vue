<script setup>
import { computed, ref } from 'vue'
import { store } from '../store.js'

/**
 * Asset Tray: Eros's asset requests land here as prompt packs. Mateo copies the
 * prompt, generates in the indicated (free) tool, saves the file with the given
 * name into the inbox folder — Studio treats and registers it automatically.
 */

const open = computed(() => store.assetRequests.filter((r) => r.status === 'open' || r.status === 'received'))
const done = computed(() => store.assetRequests.filter((r) => r.status === 'treated').slice(0, 8))
const failed = computed(() => store.assetRequests.filter((r) => r.status === 'failed'))

const copied = ref('')
async function copy(text, tag) {
  await navigator.clipboard.writeText(text)
  copied.value = tag
  setTimeout(() => { if (copied.value === tag) copied.value = '' }, 1500)
}

const statusLabel = { open: 'esperando tu generación', received: 'recibido — tratando…', failed: 'falló el tratamiento' }
</script>

<template>
  <div class="tray" v-if="store.assetRequests.length || store.inboxDir">
    <div class="tray-head">
      <span class="k-label">assets</span>
      <button v-if="store.inboxDir" class="mono inbox-btn"
              @click="copy(store.inboxDir, 'inbox')"
              :title="store.inboxDir">
        {{ copied === 'inbox' ? '✓ copiado' : '📁 copiar ruta del inbox' }}
      </button>
    </div>

    <div v-for="req in open" :key="req.id" class="asset-card" :class="req.status">
      <div class="asset-top">
        <span class="slot mono">{{ req.slot }}</span>
        <span class="mono dim">{{ req.kind }}</span>
        <span class="badge mono" :class="req.status">{{ statusLabel[req.status] }}</span>
      </div>

      <p class="prompt">{{ req.prompt }}</p>
      <p v-if="req.negative" class="mono dim neg">negative: {{ req.negative }}</p>

      <div class="asset-meta mono">
        <a v-if="req.toolUrl" :href="req.toolUrl" target="_blank" rel="noopener">↗ {{ req.tool }}</a>
        <span v-else>{{ req.tool }}</span>
        <span v-if="req.settings" class="dim">{{ req.settings }}</span>
      </div>

      <div class="asset-actions">
        <button @click="copy(req.prompt, req.id)">{{ copied === req.id ? '✓ copiado' : 'copiar prompt' }}</button>
        <span class="mono dim">guardar como <b>{{ req.filename }}</b> en el inbox</span>
      </div>
    </div>

    <div v-for="req in failed" :key="req.id" class="asset-card failed">
      <span class="slot mono">{{ req.slot }}</span>
      <span class="mono" style="color: var(--danger)">{{ req.error }}</span>
    </div>

    <div v-if="done.length" class="done-row">
      <div v-for="req in done" :key="req.id" class="done-thumb" :title="`${req.slot} — tratado`">
        <img v-if="req.preview" :src="`/captures/${req.preview}`" loading="lazy" />
        <span class="mono">{{ req.slot }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tray { display: flex; flex-direction: column; gap: 10px; }
.tray-head { display: flex; justify-content: space-between; align-items: center; }
.inbox-btn { font-size: 10px; padding: 3px 8px; }

.asset-card {
  border: 1px solid var(--line); border-radius: var(--r);
  padding: 10px 12px; display: flex; flex-direction: column; gap: 7px;
  background: var(--bg-raise);
}
.asset-card.received { border-color: var(--warn); }
.asset-card.failed { border-color: var(--danger); flex-direction: row; gap: 10px; align-items: center; }

.asset-top { display: flex; align-items: center; gap: 10px; }
.slot { color: var(--accent); font-size: 11px; }
.badge { margin-left: auto; font-size: 9px; padding: 2px 6px; border: 1px solid var(--line); border-radius: var(--r); }
.badge.received { border-color: var(--warn); color: var(--warn); }

.prompt { font-size: 12px; line-height: 1.5; white-space: pre-wrap; }
.neg { font-size: 10px; }

.asset-meta { display: flex; gap: 12px; font-size: 10.5px; }
.asset-meta a { color: var(--accent); text-decoration: none; }
.asset-meta a:hover { text-decoration: underline; }

.asset-actions { display: flex; align-items: center; gap: 10px; }
.asset-actions button { font-size: 11px; padding: 4px 10px; }

.done-row { display: flex; gap: 8px; overflow-x: auto; }
.done-thumb { display: flex; flex-direction: column; gap: 3px; width: 84px; flex-shrink: 0; }
.done-thumb img { width: 84px; height: 52px; object-fit: cover; border: 1px solid var(--ok); border-radius: var(--r); }
.done-thumb span { font-size: 8.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
