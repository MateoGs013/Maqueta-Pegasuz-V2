<script setup>
import { computed, ref } from 'vue'
import { store, api } from '../store.js'

/**
 * The decision dock: Eros's proactive questions arrive as structured cards
 * (propose_decision MCP tool). One blocking card at a time; the rest queue.
 * Below the cards, a quiet feed of what Eros is saying/doing — presence
 * without chat.
 */

const openCards = computed(() => store.decisions.filter((d) => d.status === 'open'))
const recentAnswered = computed(() => store.decisions.filter((d) => d.status !== 'open').slice(0, 5))
const notes = ref('')
const freeText = ref('')

function parseSwatches(preview) {
  if (!preview) return []
  return (preview.match(/#[0-9a-fA-F]{3,8}/g) || []).slice(0, 6)
}

async function answer(card, option) {
  await api('decision/answer', { id: card.id, answer: option.label, notes: notes.value })
  notes.value = ''
}

async function sendFree() {
  if (!freeText.value.trim()) return
  await api('session/message', { text: freeText.value.trim() })
  freeText.value = ''
}
</script>

<template>
  <div class="dock">
    <div class="dock-head">
      <span class="k-label">decisiones</span>
      <span class="mono dim" v-if="openCards.length > 1">{{ openCards.length - 1 }} en cola</span>
    </div>

    <div class="dock-body">
      <!-- Active card -->
      <div v-if="openCards.length" class="card active">
        <p class="q">{{ openCards[0].question }}</p>
        <p class="ctx dim">{{ openCards[0].context }}</p>
        <div class="options">
          <button v-for="opt in openCards[0].options" :key="opt.label"
                  class="opt" :class="{ rec: openCards[0].recommendation?.startsWith(opt.label) }"
                  @click="answer(openCards[0], opt)">
            <span class="opt-label">{{ opt.label }}
              <span v-if="openCards[0].recommendation?.startsWith(opt.label)" class="rec-tag">← Eros recomienda</span>
            </span>
            <span class="opt-detail dim">{{ opt.detail }}</span>
            <span v-if="parseSwatches(opt.preview).length" class="swatches">
              <i v-for="hex in parseSwatches(opt.preview)" :key="hex" :style="{ background: hex }" :title="hex" />
            </span>
          </button>
        </div>
        <p v-if="openCards[0].recommendation" class="mono dim rec-why">{{ openCards[0].recommendation }}</p>
        <input v-model="notes" placeholder="Nota opcional con tu elección…" />
      </div>

      <div v-else class="card idle dim">
        <template v-if="store.sessionStatus === 'working'">Eros está trabajando. Las preguntas van a aparecer acá.</template>
        <template v-else-if="store.sessionStatus === 'idle'">Sin sesión activa.</template>
        <template v-else>{{ store.sessionStatus }}…</template>
      </div>

      <!-- Assistant presence feed -->
      <div class="feed">
        <span class="k-label">eros dice</span>
        <div v-for="(m, i) in store.assistantFeed.slice(0, 8)" :key="m.ts + '-' + i"
             class="feed-item" :class="{ err: m.error }">{{ m.text }}</div>
      </div>

      <!-- Answered history -->
      <div v-if="recentAnswered.length" class="history">
        <span class="k-label">resueltas</span>
        <div v-for="d in recentAnswered" :key="d.id" class="hist-item mono dim">
          {{ d.question }} → <b>{{ d.answer }}</b>
        </div>
      </div>
    </div>

    <div class="free">
      <input v-model="freeText" placeholder="Decile algo a Eros… (no es chat: es dirección)"
             @keyup.enter="sendFree" :disabled="store.sessionStatus === 'idle'" />
    </div>
  </div>
</template>

<style scoped>
.dock { display: flex; flex-direction: column; height: 100%; background: var(--bg-panel); }
.dock-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 14px; border-bottom: 1px solid var(--line);
}
.dock-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 22px; }

.card.active {
  border: 1px solid var(--accent);
  border-radius: var(--r);
  padding: 14px;
  background: var(--bg-raise);
  animation: arrive 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes arrive { from { opacity: 0; transform: translateY(8px); } }

.q { font-size: 15px; font-weight: 650; line-height: 1.35; margin-bottom: 6px; }
.ctx { font-size: 12.5px; line-height: 1.45; margin-bottom: 12px; }

.options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.opt {
  display: flex; flex-direction: column; align-items: flex-start; gap: 3px;
  text-align: left; padding: 10px 12px;
}
.opt.rec { border-color: var(--accent); }
.opt-label { font-weight: 600; font-size: 13px; }
.rec-tag { color: var(--accent); font-size: 11px; font-weight: 400; margin-left: 6px; }
.opt-detail { font-size: 12px; line-height: 1.4; }
.swatches { display: flex; gap: 4px; margin-top: 5px; }
.swatches i { width: 22px; height: 14px; border-radius: var(--r); border: 1px solid rgba(255,255,255,0.15); }
.rec-why { margin: 4px 0 10px; }

.card.idle { padding: 24px 14px; text-align: center; font-size: 13px; }

.feed { display: flex; flex-direction: column; gap: 8px; }
.feed-item {
  font-size: 12.5px; line-height: 1.5; color: var(--text-dim);
  border-left: 2px solid var(--line); padding-left: 10px;
  white-space: pre-wrap; word-break: break-word;
}
.feed-item.err { border-left-color: var(--danger); color: var(--danger); }

.history { display: flex; flex-direction: column; gap: 6px; }
.hist-item { line-height: 1.5; }

.free { padding: 10px 14px; border-top: 1px solid var(--line); }
</style>
