<script setup>
import { ref, onMounted } from 'vue'
import { useWorkshopStaging } from '@/composables/useWorkshopStaging.js'
import { parseTokens } from '@/composables/useTokenParser.js'

const { dirtyCount, dirtyFiles, history, applyAll, discardAll } = useWorkshopStaging()
const stats = ref({ components: 0, heroes: 0, navs: 0, tokenGroups: 0, tokenColors: 0, tokenTotal: 0 })

onMounted(async () => {
  try {
    const [listRes, tokensRes] = await Promise.all([
      fetch('/__workshop/list'),
      fetch('/__workshop/read?path=tokens.css'),
    ])
    if (listRes.ok) {
      const list = await listRes.json()
      stats.value.components = list.length
      stats.value.heroes = list.filter((c) => c.category === 'heroes').length
      stats.value.navs = list.filter((c) => c.category === 'navs').length
    }
    if (tokensRes.ok) {
      const { content } = await tokensRes.json()
      const groups = parseTokens(content)
      stats.value.tokenGroups = groups.length
      stats.value.tokenTotal = groups.reduce((s, g) => s + g.tokens.length, 0)
      stats.value.tokenColors = groups.reduce((s, g) => s + g.tokens.filter((t) => t.type === 'color').length, 0)
    }
  } catch { /* ignore */ }
})

function timeAgo(ts) {
  const diff = Date.now() - ts
  if (diff < 60000) return 'ahora'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return `${Math.floor(diff / 86400000)}d`
}

const actionLabel = { apply: 'Aplicado', discard: 'Descartado', restore: 'Restaurado', refresh: 'Refrescado', error: 'Error' }
const actionTone = { apply: 'pill--strong', discard: 'pill--medium', restore: 'pill--cool', refresh: 'pill--medium', error: 'pill--weak' }
</script>

<template>
  <div class="panel-page">
    <div class="cell hero-cell">
      <p class="label">Workshop</p>
      <h1 class="title">Editor local</h1>
      <p class="body">Editá tokens, componentes y previsualizá cambios en tiempo real. Los cambios se guardan en staging hasta que decidas aplicarlos.</p>
    </div>

    <!-- Stats -->
    <div class="grid-row grid-row--4">
      <div class="cell stat-cell">
        <p class="label">Componentes</p>
        <p class="value-sm">{{ stats.components }}</p>
        <p class="body-sm">{{ stats.heroes }} heroes · {{ stats.navs }} navs</p>
      </div>
      <div class="cell stat-cell">
        <p class="label">Tokens</p>
        <p class="value-sm">{{ stats.tokenTotal }}</p>
        <p class="body-sm">{{ stats.tokenGroups }} grupos · {{ stats.tokenColors }} colores</p>
      </div>
      <div class="cell stat-cell">
        <p class="label">Staging</p>
        <p class="value-sm" :class="dirtyCount ? 'c-warn' : ''">{{ dirtyCount }}</p>
        <p class="body-sm">{{ dirtyCount ? 'cambios pendientes' : 'limpio' }}</p>
      </div>
      <div class="cell stat-cell">
        <p class="label">Sesion</p>
        <p class="value-sm">{{ history.length }}</p>
        <p class="body-sm">acciones registradas</p>
      </div>
    </div>

    <!-- Quick links + staging -->
    <div class="grid-row grid-row--2">
      <div class="cell">
        <p class="label" style="margin-bottom:12px">Acciones rapidas</p>
        <div class="quick-links">
          <RouterLink to="/workshop/tokens" class="quick-card">
            <span class="quick-icon" style="background: var(--accent-ember); color: var(--accent)">T</span>
            <div>
              <p class="title-sm">Token editor</p>
              <p class="body-sm">Paleta, tipografia, spacing, motion</p>
            </div>
          </RouterLink>
          <RouterLink to="/workshop/components" class="quick-card">
            <span class="quick-icon" style="background: var(--info-soft); color: var(--info)">C</span>
            <div>
              <p class="title-sm">Component editor</p>
              <p class="body-sm">Props, preview, crear, duplicar, eliminar</p>
            </div>
          </RouterLink>
        </div>
      </div>

      <div class="cell">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <p class="label" style="margin-bottom:0">Staging</p>
          <div v-if="dirtyCount" class="staging-btns">
            <button class="staging-btn staging-btn--apply" @click="applyAll">Aplicar</button>
            <button class="staging-btn" @click="discardAll">Descartar</button>
          </div>
        </div>
        <div v-if="dirtyFiles.length" class="dirty-list">
          <div v-for="f in dirtyFiles" :key="f.path" class="dirty-row">
            <span class="pill pill--accent">{{ f.type }}</span>
            <span class="body-sm">{{ f.path }}</span>
          </div>
        </div>
        <p v-else class="body-sm dim">Sin cambios pendientes. Editá tokens o componentes para empezar.</p>
      </div>
    </div>

    <!-- History -->
    <div v-if="history.length" class="cell">
      <p class="label" style="margin-bottom:8px">Actividad reciente</p>
      <div class="history-list">
        <div v-for="(h, i) in history.slice(0, 15)" :key="i" class="history-row">
          <span class="history-time">{{ timeAgo(h.ts) }}</span>
          <span class="pill" :class="actionTone[h.action] || 'pill--medium'">{{ actionLabel[h.action] || h.action }}</span>
          <span class="body-sm">{{ h.filePath }}</span>
          <span v-if="h.detail" class="body-sm dim">{{ h.detail }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-cell { display: grid; gap: 12px; }
.stat-cell { display: grid; gap: 4px; align-content: end; min-height: 120px; }
.c-warn { color: var(--warn); }

.quick-links { display: grid; gap: 1px; background: var(--line); }
.quick-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px; background: var(--bg);
  text-decoration: none; color: inherit;
  transition: background 150ms;
}
.quick-card:hover { background: var(--surface); }
.quick-icon {
  width: 40px; height: 40px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font: 700 16px var(--font-display);
}

.staging-btns { display: flex; gap: 4px; }
.staging-btn {
  padding: 4px 10px; border: 1px solid var(--line-strong); background: transparent;
  color: var(--text-muted); font: 600 9px var(--font-mono); letter-spacing: 0.06em;
  text-transform: uppercase; cursor: pointer; transition: color 120ms;
}
.staging-btn:hover { color: var(--text); }
.staging-btn--apply { color: var(--success); border-color: rgba(62, 232, 181, 0.3); }
.staging-btn--apply:hover { background: var(--success-soft); }

.dirty-list { display: grid; gap: 0; }
.dirty-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid var(--line);
}
.dirty-row:last-child { border-bottom: 0; }

.history-list { display: grid; gap: 0; }
.history-row {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 0; border-bottom: 1px solid var(--line);
}
.history-row:last-child { border-bottom: 0; }
.history-time {
  font: 400 10px var(--font-mono); color: var(--text-dim);
  min-width: 32px; flex-shrink: 0;
}

.dim { color: var(--text-dim); }
</style>
