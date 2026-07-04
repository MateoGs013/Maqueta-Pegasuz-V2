<script setup>
import { computed, ref } from 'vue'
import { store } from '../store.js'

/**
 * Asset Tray: Eros's asset requests land here as prompt packs. Mateo copies the
 * prompt, generates in the indicated (free) tool, saves the file with the given
 * name into the inbox folder — Studio treats and registers it automatically.
 */

const open = computed(() => store.assetRequests.filter((r) => r.status === 'open' || r.status === 'received'))
const done = computed(() => store.assetRequests.filter((r) => r.status === 'treated').slice(0, 10))
const failed = computed(() => store.assetRequests.filter((r) => r.status === 'failed'))

const copied = ref('')
const expanded = ref(null)

async function copy(text, tag) {
  await navigator.clipboard.writeText(text)
  copied.value = tag
  setTimeout(() => { if (copied.value === tag) copied.value = '' }, 1600)
}

const statusLabel = { open: 'esperando generación', received: 'tratando…' }
</script>

<template>
  <section class="tray" v-if="store.assetRequests.length">
    <div class="zone-head">
      <span class="k-label">assets</span>
      <span v-if="done.length" class="mono tally">{{ done.length }} listos</span>
      <button v-if="store.inboxDir" class="ghost mono inbox-btn"
              @click="copy(store.inboxDir, 'inbox')" :title="store.inboxDir">
        {{ copied === 'inbox' ? '✓ ruta copiada' : 'copiar ruta del inbox' }}
      </button>
    </div>

    <div class="cards">
      <div v-for="req in open" :key="req.id" class="asset-card" :class="req.status">
        <div class="asset-top" @click="expanded = expanded === req.id ? null : req.id">
          <span class="slot mono">{{ req.slot }}</span>
          <span class="mono kind">{{ req.kind }}</span>
          <span class="badge mono" :class="req.status">
            <span v-if="req.status === 'received'" class="dot pulse" style="background: var(--warn)" />
            {{ statusLabel[req.status] }}
          </span>
        </div>

        <p class="prompt" :class="{ clamp: expanded !== req.id }" @click="expanded = expanded === req.id ? null : req.id">{{ req.prompt }}</p>
        <p v-if="req.negative && expanded === req.id" class="mono dim neg">negative: {{ req.negative }}</p>

        <div class="asset-meta mono">
          <a v-if="req.toolUrl" :href="req.toolUrl" target="_blank" rel="noopener">↗ {{ req.tool }}</a>
          <span v-else>{{ req.tool }}</span>
          <span v-if="req.settings" class="dim">· {{ req.settings }}</span>
        </div>

        <div class="asset-actions">
          <button @click="copy(req.prompt, req.id)">{{ copied === req.id ? '✓ copiado' : 'copiar prompt' }}</button>
          <span class="mono save-as">guardar como <b>{{ req.filename }}</b></span>
        </div>
      </div>

      <div v-for="req in failed" :key="req.id" class="asset-card failedrow">
        <span class="slot mono">{{ req.slot }}</span>
        <span class="mono err-text">{{ req.error }}</span>
      </div>
    </div>

    <div v-if="done.length" class="done-row">
      <div v-for="req in done" :key="req.id" class="done-thumb" :title="`${req.slot} — tratado con el grade del proyecto`">
        <img v-if="req.preview" :src="`/captures/${req.preview}`" loading="lazy" />
        <span class="mono">{{ req.slot }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tray { display: flex; flex-direction: column; }
.zone-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.zone-head .k-label { flex: 1; }
.tally { font-size: 9px; color: var(--ok); }
.inbox-btn { font-size: 9px; padding: 3px 9px; }

.cards { display: flex; flex-direction: column; gap: 10px; }

.asset-card {
  border: 1px solid var(--line); border-radius: var(--r);
  padding: 11px 13px; display: flex; flex-direction: column; gap: 8px;
  background: var(--bg-well);
  animation: arrive 380ms var(--ease);
  transition: border-color 300ms var(--ease);
}
.asset-card.received { border-color: var(--warn); }
.asset-card.failedrow { border-color: var(--danger); flex-direction: row; gap: 10px; align-items: baseline; }
.err-text { color: var(--danger); font-size: 10px; line-height: 1.4; }

.asset-top { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.slot { color: var(--accent); font-size: 11px; }
.kind { font-size: 9px; color: var(--text-faint); }
.badge {
  margin-left: auto; font-size: 8.5px; letter-spacing: 0.08em;
  display: flex; align-items: center; gap: 6px;
  padding: 2px 8px; border: 1px solid var(--line); border-radius: 999px;
  color: var(--text-dim);
}
.badge.received { border-color: var(--warn); color: var(--warn); }
.badge .dot { width: 5px; height: 5px; }

.prompt { font-size: 12px; line-height: 1.5; white-space: pre-wrap; cursor: pointer; }
.prompt.clamp {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.neg { font-size: 10px; }

.asset-meta { display: flex; gap: 8px; font-size: 10.5px; flex-wrap: wrap; }
.asset-meta a { color: var(--accent); text-decoration: none; }
.asset-meta a:hover { text-decoration: underline; }

.asset-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.asset-actions button { font-size: 11px; padding: 4px 11px; }
.save-as { font-size: 9.5px; color: var(--text-faint); }
.save-as b { color: var(--text-dim); }

.done-row { display: flex; gap: 9px; overflow-x: auto; padding-top: 12px; }
.done-thumb { display: flex; flex-direction: column; gap: 4px; width: 88px; flex-shrink: 0; }
.done-thumb img {
  width: 88px; height: 54px; object-fit: cover;
  border: 1px solid var(--ok); border-radius: var(--r);
  transition: transform 260ms var(--ease);
}
.done-thumb img:hover { transform: scale(1.06); }
.done-thumb span { font-size: 8.5px; color: var(--text-faint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
