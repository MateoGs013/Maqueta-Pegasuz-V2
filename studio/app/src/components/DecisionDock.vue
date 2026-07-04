<script setup>
import { computed, ref } from 'vue'
import { store, api } from '../store.js'
import AssetTray from './AssetTray.vue'

/**
 * The decision dock: Eros's proactive questions arrive as structured cards
 * (propose_decision MCP tool). One blocking card at a time; the rest queue.
 * Below the cards: the asset tray, then a quiet feed of what Eros is
 * saying/doing — presence without chat.
 */

const openCards = computed(() => store.decisions.filter((d) => d.status === 'open'))
const recentAnswered = computed(() => store.decisions.filter((d) => d.status !== 'open').slice(0, 5))
const notes = ref('')
const freeText = ref('')
const sending = ref(false)

function parseSwatches(preview) {
  if (!preview) return []
  return (preview.match(/#[0-9a-fA-F]{3,8}/g) || []).slice(0, 6)
}

function timeOf(ts) {
  return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

async function answer(card, option) {
  await api('decision/answer', { id: card.id, answer: option.label, notes: notes.value })
  notes.value = ''
}

async function sendFree() {
  if (!freeText.value.trim() || sending.value) return
  sending.value = true
  try {
    await api('session/message', { text: freeText.value.trim() })
    freeText.value = ''
  } finally { sending.value = false }
}
</script>

<template>
  <div class="dock">
    <div class="dock-body">
      <!-- Decisions zone -->
      <section>
        <div class="zone-head">
          <span class="k-label">decisiones</span>
          <span class="mono queue-n" v-if="openCards.length > 1">+{{ openCards.length - 1 }} en cola</span>
        </div>

        <div v-if="openCards.length" class="card active">
          <p class="q">{{ openCards[0].question }}</p>
          <p class="ctx dim">{{ openCards[0].context }}</p>

          <div class="options">
            <button v-for="opt in openCards[0].options" :key="opt.label"
                    class="opt" :class="{ rec: openCards[0].recommendation?.startsWith(opt.label) }"
                    @click="answer(openCards[0], opt)">
              <span class="opt-label">
                {{ opt.label }}
                <span v-if="openCards[0].recommendation?.startsWith(opt.label)" class="rec-tag mono">recomendada</span>
              </span>
              <span class="opt-detail dim">{{ opt.detail }}</span>
              <span v-if="parseSwatches(opt.preview).length" class="swatches">
                <i v-for="hex in parseSwatches(opt.preview)" :key="hex" :style="{ background: hex }" :title="hex" />
              </span>
            </button>
          </div>

          <p v-if="openCards[0].recommendation" class="rec-why mono dim">{{ openCards[0].recommendation }}</p>
          <input v-model="notes" placeholder="nota opcional con tu elección…" @keyup.enter="openCards[0].options[0] && null" />
        </div>

        <div v-else class="idle-state">
          <template v-if="store.sessionStatus === 'working'">
            <span class="dot on pulse" />
            <span class="dim">Eros está trabajando — las preguntas aparecen acá.</span>
          </template>
          <template v-else-if="store.sessionStatus === 'waiting-decision'">
            <span class="dim">Hay una decisión esperando… llegando.</span>
          </template>
          <template v-else-if="store.sessionStatus === 'idle'">
            <span class="dim">Sin sesión activa.</span>
          </template>
          <template v-else>
            <span class="dot pulse" style="background: var(--warn)" />
            <span class="dim">{{ store.sessionStatus }}…</span>
          </template>
        </div>
      </section>

      <!-- Asset handoff tray -->
      <AssetTray />

      <!-- Assistant presence feed -->
      <section v-if="store.assistantFeed.length">
        <div class="zone-head"><span class="k-label">eros dice</span></div>
        <div class="feed">
          <div v-for="(m, i) in store.assistantFeed.slice(0, 30)" :key="m.ts + '-' + i"
               class="feed-item" :class="{ err: m.error }">
            <span class="feed-time mono">{{ timeOf(m.ts) }}</span>
            <span class="feed-text">{{ m.text }}</span>
          </div>
        </div>
      </section>

      <!-- Answered history -->
      <section v-if="recentAnswered.length">
        <div class="zone-head"><span class="k-label">resueltas</span></div>
        <div class="history">
          <div v-for="d in recentAnswered" :key="d.id" class="hist-item">
            <span class="dim">{{ d.question }}</span>
            <span class="hist-answer mono">→ {{ d.answer }}</span>
          </div>
        </div>
      </section>
    </div>

    <div class="free">
      <input v-model="freeText" placeholder="dale dirección a Eros…"
             @keyup.enter="sendFree" :disabled="store.sessionStatus === 'idle'" />
      <button class="ghost send" :disabled="!freeText.trim() || store.sessionStatus === 'idle'" @click="sendFree">↵</button>
    </div>
  </div>
</template>

<style scoped>
.dock {
  display: flex; flex-direction: column; height: 100%; min-height: 0;
  overflow: hidden; background: var(--bg-panel);
}
.dock-body {
  flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain;
  padding: 18px 16px 24px;
  display: flex; flex-direction: column; gap: 28px;
}

.zone-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.zone-head .k-label { flex: 1; }
.queue-n { font-size: 9px; color: var(--accent); border: 1px solid var(--accent-dim); border-radius: 999px; padding: 1px 8px; }

/* ------------------------------------------------------------ active card */
.card.active {
  border: 1px solid var(--accent-dim);
  border-radius: var(--r);
  padding: 16px 15px 14px;
  background: linear-gradient(160deg, var(--bg-raise), var(--bg-panel) 80%);
  animation: arrive 420ms var(--ease);
}
.q { font-size: 15.5px; font-weight: 680; line-height: 1.32; letter-spacing: -0.01em; margin-bottom: 7px; }
.ctx { font-size: 12.5px; line-height: 1.5; margin-bottom: 14px; }

.options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.opt {
  display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
  text-align: left; padding: 11px 13px;
  background: var(--bg-well);
  border-color: var(--line);
}
.opt:hover { border-color: var(--accent); background: var(--accent-wash); transform: translateX(2px); }
.opt.rec { border-color: var(--accent-dim); }
.opt-label { font-weight: 650; font-size: 13px; display: flex; align-items: center; gap: 8px; }
.rec-tag {
  font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--accent); border: 1px solid var(--accent-dim); border-radius: 999px; padding: 1px 7px;
}
.opt-detail { font-size: 12px; line-height: 1.45; }
.swatches { display: flex; gap: 5px; margin-top: 6px; }
.swatches i {
  width: 26px; height: 16px; border-radius: var(--r);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: transform 220ms var(--ease);
}
.swatches i:hover { transform: scale(1.3); }
.rec-why { font-size: 10.5px; line-height: 1.5; margin: 2px 0 12px; padding-left: 10px; border-left: 2px solid var(--accent-dim); }

.idle-state {
  display: flex; align-items: center; gap: 10px;
  padding: 18px 14px; font-size: 12.5px;
  border: 1px dashed var(--line); border-radius: var(--r);
}

/* ------------------------------------------------------------ feed */
.feed { display: flex; flex-direction: column; gap: 12px; }
.feed-item {
  display: flex; flex-direction: column; gap: 3px;
  border-left: 2px solid var(--line); padding-left: 12px;
  animation: fade-in 400ms var(--ease);
}
.feed-item.err { border-left-color: var(--danger); }
.feed-item.err .feed-text { color: var(--danger); }
.feed-time { font-size: 8.5px; color: var(--text-faint); }
.feed-text {
  font-size: 12.5px; line-height: 1.55; color: var(--text-dim);
  white-space: pre-wrap; word-break: break-word;
}
.feed-item:first-child .feed-text { color: var(--text); }
.feed-item:first-child { border-left-color: var(--accent-dim); }

/* ------------------------------------------------------------ history */
.history { display: flex; flex-direction: column; gap: 9px; }
.hist-item { display: flex; flex-direction: column; gap: 1px; font-size: 11.5px; line-height: 1.45; }
.hist-answer { color: var(--accent); font-size: 10.5px; }

/* ------------------------------------------------------------ free input */
.free {
  display: flex; gap: 8px; padding: 12px 16px;
  border-top: 1px solid var(--line);
  background: var(--bg-panel);
  flex-shrink: 0;
}
.send { padding: 6px 12px; font-size: 14px; }
</style>
