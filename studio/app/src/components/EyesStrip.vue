<script setup>
import { computed } from 'vue'
import { store, api } from '../store.js'

/**
 * Eyes strip: the filmstrip of captures (each pinned to a git ref) + Eros's
 * latest critique verdict. Click a frame to inspect/annotate it in pin mode.
 */

const latestCritique = computed(() => store.critiques[0] || null)

function select(cap) {
  store.selectedCaptureId = cap.id
  store.pinMode = true
}

async function resolveCritique(id) {
  await api('critique/resolve', { id })
}

const verdictColor = { ship: 'var(--ok)', adjust: 'var(--warn)', rethink: 'var(--danger)' }
</script>

<template>
  <div class="strip">
    <div class="strip-left">
      <span class="k-label">ojos</span>
      <div v-if="latestCritique" class="verdict" :style="{ borderColor: verdictColor[latestCritique.verdict] }">
        <span class="mono" :style="{ color: verdictColor[latestCritique.verdict] }">{{ latestCritique.verdict.toUpperCase() }}</span>
        <span class="verdict-text dim">{{ latestCritique.summary }}</span>
        <button v-if="latestCritique.verdict === 'adjust' && !latestCritique.resolved"
                @click="resolveCritique(latestCritique.id)" title="Marcar resuelta a mano">resolver</button>
      </div>
      <span v-else class="dim" style="font-size: 12px">Sin críticas todavía — Eros critica cada captura significativa.</span>
    </div>

    <div class="film">
      <button v-for="cap in store.captures.slice(0, 20)" :key="cap.id"
              class="framebtn" :class="{ sel: cap.id === store.selectedCaptureId }"
              @click="select(cap)"
              :title="`${cap.breakpoint} · diff ${(cap.diffRatio * 100).toFixed(1)}% · ${cap.gitRef || 'no-ref'} · ${cap.ts}`">
        <img :src="`/captures/${cap.file}`" loading="lazy" />
        <span class="mono frame-meta">{{ cap.breakpoint[0] }}·{{ (cap.diffRatio * 100).toFixed(0) }}%</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.strip { display: flex; align-items: stretch; gap: 18px; padding: 10px 14px; background: var(--bg-panel); height: 118px; }
.strip-left { display: flex; flex-direction: column; gap: 8px; width: 340px; flex-shrink: 0; }

.verdict {
  display: flex; flex-direction: column; gap: 4px;
  border-left: 2px solid; padding-left: 10px; overflow: hidden;
}
.verdict-text { font-size: 11.5px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.verdict button { align-self: flex-start; padding: 2px 8px; font-size: 11px; }

.film { display: flex; gap: 8px; overflow-x: auto; flex: 1; }
.framebtn {
  position: relative; flex-shrink: 0; padding: 0; border: 1px solid var(--line);
  background: none; height: 100%; aspect-ratio: 3/2; overflow: hidden;
}
.framebtn.sel { border-color: var(--accent); }
.framebtn img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.frame-meta {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(6,7,8,0.82); padding: 1px 4px; font-size: 9px; text-align: left;
}
</style>
