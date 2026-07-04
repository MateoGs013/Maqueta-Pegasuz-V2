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

function ago(ts) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m`
  return `${Math.floor(s / 3600)}h`
}

const verdictColor = { ship: 'var(--ok)', adjust: 'var(--warn)', rethink: 'var(--danger)' }
const verdictLabel = { ship: 'SHIP', adjust: 'ADJUST', rethink: 'RETHINK' }
</script>

<template>
  <div class="strip">
    <div class="strip-left">
      <span class="k-label bare">ojos</span>

      <div v-if="latestCritique" class="verdict" :style="{ '--vc': verdictColor[latestCritique.verdict] }">
        <div class="verdict-head">
          <span class="verdict-tag mono">{{ verdictLabel[latestCritique.verdict] }}</span>
          <span class="mono pins-n" v-if="latestCritique.pins?.length">{{ latestCritique.pins.length }} pins</span>
          <button v-if="latestCritique.verdict === 'adjust' && !latestCritique.resolved"
                  class="ghost resolve-btn" @click="resolveCritique(latestCritique.id)"
                  title="Marcar resuelta a mano">resolver</button>
        </div>
        <p class="verdict-text dim">{{ latestCritique.summary }}</p>
      </div>

      <p v-else class="empty-hint dim">
        Sin críticas todavía — Eros juzga cada captura significativa y su veredicto aparece acá.
      </p>
    </div>

    <div class="film" v-if="store.captures.length">
      <button v-for="cap in store.captures.slice(0, 24)" :key="cap.id"
              class="framebtn" :class="{ sel: cap.id === store.selectedCaptureId }"
              @click="select(cap)"
              :title="`${cap.breakpoint} · diff ${(cap.diffRatio * 100).toFixed(1)}% · ${cap.gitRef || 'sin ref'} · hace ${ago(cap.ts)}`">
        <img :src="`/captures/${cap.file}`" loading="lazy" />
        <span class="frame-meta mono">
          <b>{{ cap.breakpoint[0].toUpperCase() }}</b>
          <span>{{ (cap.diffRatio * 100).toFixed(0) }}%</span>
          <span class="frame-ago">{{ ago(cap.ts) }}</span>
        </span>
        <span v-if="cap.consoleErrors?.length" class="frame-err mono" :title="cap.consoleErrors.join('\n')">⚠</span>
      </button>
    </div>
    <div class="film empty-film" v-else>
      <span class="mono dim">el filmstrip se llena solo cuando Eros toca src/ — cada frame queda atado a su commit</span>
    </div>
  </div>
</template>

<style scoped>
.strip {
  display: flex; align-items: stretch; gap: 20px;
  padding: 12px 16px; background: var(--bg-panel); height: 132px;
}
.strip-left { display: flex; flex-direction: column; gap: 9px; width: 350px; flex-shrink: 0; }

.verdict { display: flex; flex-direction: column; gap: 5px; border-left: 2px solid var(--vc); padding-left: 12px; overflow: hidden; }
.verdict-head { display: flex; align-items: center; gap: 10px; }
.verdict-tag {
  font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
  color: var(--vc);
}
.pins-n { font-size: 9px; color: var(--text-faint); }
.resolve-btn { margin-left: auto; padding: 2px 9px; font-size: 10px; }
.verdict-text {
  font-size: 11.5px; line-height: 1.45;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.empty-hint { font-size: 11.5px; line-height: 1.5; max-width: 300px; }

.film { display: flex; gap: 9px; overflow-x: auto; flex: 1; align-items: stretch; }
.empty-film { align-items: center; justify-content: center; }
.empty-film span { font-size: 10px; }

.framebtn {
  position: relative; flex-shrink: 0; padding: 0;
  border: 1px solid var(--line); border-radius: var(--r);
  background: none; height: 100%; aspect-ratio: 3/2; overflow: hidden;
  transition: border-color 220ms var(--ease), transform 220ms var(--ease);
}
.framebtn:hover { border-color: var(--text-faint); transform: translateY(-2px); }
.framebtn.sel { border-color: var(--accent); }
.framebtn img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }

.frame-meta {
  position: absolute; bottom: 0; left: 0; right: 0;
  display: flex; gap: 6px; align-items: baseline;
  background: linear-gradient(transparent, rgba(8, 7, 6, 0.94) 40%);
  padding: 8px 6px 3px; font-size: 8.5px; color: var(--text-dim);
}
.frame-meta b { color: var(--accent); font-size: 9px; }
.frame-ago { margin-left: auto; color: var(--text-faint); }
.frame-err {
  position: absolute; top: 3px; right: 4px;
  color: var(--warn); font-size: 10px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
}
</style>
