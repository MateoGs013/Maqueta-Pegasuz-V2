<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import { useChat } from '@/composables/useChat.js'

const { messages } = useChat()
const input = ref('')
const sending = ref(false)
const elapsed = ref(0)
const chatBody = ref(null)
const inputEl = ref(null)
let timer = null

const formatText = (text) => {
  return (text || '')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/— /g, '<span class="dash">— </span>')
}

const scrollBottom = () => {
  nextTick(() => { if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight })
}

const autoResize = () => {
  if (!inputEl.value) return
  inputEl.value.style.height = 'auto'
  inputEl.value.style.height = Math.min(inputEl.value.scrollHeight, 120) + 'px'
}

const send = async () => {
  const msg = input.value.trim()
  if (!msg || sending.value) return

  messages.value.push({ from: 'user', text: msg })
  input.value = ''
  sending.value = true
  elapsed.value = 0
  scrollBottom()

  // Start elapsed timer
  timer = setInterval(() => { elapsed.value++ }, 1000)

  // Timeout controller
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120000) // 2 min max

  try {
    const res = await fetch('/__eros/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
      signal: controller.signal,
    })

    let data
    try {
      const text = await res.text()
      data = JSON.parse(text)
    } catch {
      data = { response: 'Respuesta no válida del servidor.', mood: 'confused' }
    }

    messages.value.push({
      from: 'eros',
      text: data.response || 'Sin respuesta.',
      mood: data.mood || 'neutral',
    })
  } catch (err) {
    const isTimeout = err.name === 'AbortError'
    messages.value.push({
      from: 'eros',
      text: isTimeout ? 'Me tomé demasiado tiempo pensando. Probá con algo más corto.' : `Error: ${err.message}`,
      mood: 'confused',
    })
  } finally {
    clearTimeout(timeout)
    clearInterval(timer)
    timer = null
    sending.value = false
    elapsed.value = 0
    scrollBottom()
    nextTick(() => { if (inputEl.value) { inputEl.value.style.height = 'auto'; inputEl.value.focus() } })
  }
}

const handleKey = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
}

const quickQuestions = [
  '¿Quién sos?',
  '¿Cómo estás?',
  '¿Cuáles son tus debilidades?',
  '¿Qué aprendiste?',
  '¿Cuál es tu filosofía?',
  '¿Qué pensás de parallax?',
]

const askQuick = (q) => { input.value = q; send() }

watch(input, () => nextTick(autoResize))
onMounted(() => scrollBottom())
</script>

<template>
  <div class="chat">
    <div class="chat-body" ref="chatBody">
      <div
        v-for="(msg, i) in messages" :key="i"
        class="msg" :class="`msg-${msg.from}`"
      >
        <div class="msg-header" v-if="msg.from === 'eros'">
          <span class="msg-name">Eros</span>
          <span class="msg-mood" v-if="msg.mood && msg.mood !== 'neutral'">{{ msg.mood }}</span>
        </div>
        <div class="msg-text" v-html="formatText(msg.text)"></div>
      </div>

      <!-- Thinking indicator -->
      <div v-if="sending" class="msg msg-eros thinking">
        <div class="msg-header">
          <span class="msg-name">Eros</span>
          <span class="msg-mood">pensando{{ elapsed > 3 ? ` ${elapsed}s` : '' }}</span>
        </div>
        <div class="typing"><span></span><span></span><span></span></div>
      </div>

      <!-- Quick questions -->
      <div v-if="messages.length <= 1 && !sending" class="quick-section">
        <p class="quick-label">Preguntale algo:</p>
        <div class="quick-grid">
          <button v-for="q in quickQuestions" :key="q" class="quick-btn" @click="askQuick(q)">{{ q }}</button>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="chat-input-wrap">
      <textarea
        ref="inputEl"
        v-model="input"
        @keydown="handleKey"
        @input="autoResize"
        placeholder="Hablar con Eros..."
        rows="1"
        class="chat-input"
        :disabled="sending"
      />
      <button class="chat-send" @click="send" :disabled="sending || !input.trim()">
        <span v-if="!sending">→</span>
        <span v-else class="send-spinner"></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat {
  display: flex; flex-direction: column; height: 100%;
  background: var(--bg); overflow: hidden;
}

.chat-body {
  flex: 1; overflow-y: auto; padding: 24px 32px;
  display: flex; flex-direction: column; gap: 16px;
}

/* Messages */
.msg { max-width: 80%; animation: msg-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.msg-user {
  align-self: flex-end;
  background: var(--accent-ember);
  border: 1px solid var(--line-accent);
  padding: 10px 16px;
}
.msg-eros {
  align-self: flex-start;
  padding: 12px 0;
}

.msg-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
}
.msg-name {
  font: 700 11px var(--font-display); color: var(--accent);
  letter-spacing: -0.02em;
}
.msg-mood {
  font: 400 8px var(--font-mono); color: var(--text-dim);
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 1px 5px; border: 1px solid var(--line);
}

.msg-text {
  font: 400 13px/1.7 var(--font-body); color: var(--text-muted);
}
.msg-eros .msg-text { color: var(--text); }
.msg-text :deep(strong) { color: var(--accent); font-weight: 600; }
.msg-text :deep(code) { padding: 1px 4px; background: var(--surface); color: var(--accent-hot); font: 500 11px var(--font-mono); }
.msg-text :deep(.dash) { color: var(--accent); }

/* Thinking */
.thinking { opacity: 0.7; }
.typing { display: flex; gap: 4px; padding: 4px 0; }
.typing span {
  width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
  animation: dot-pulse 1.4s infinite both;
}
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot-pulse { 0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }

/* Quick questions */
.quick-section { padding: 16px 0; }
.quick-label { font: 500 9px var(--font-mono); color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
.quick-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.quick-btn {
  padding: 8px 14px; border: 1px solid var(--line-strong);
  background: transparent; color: var(--text-muted);
  font: 400 12px var(--font-body); cursor: pointer;
  transition: all 150ms;
}
.quick-btn:hover { color: var(--accent); border-color: var(--line-accent); background: var(--accent-ember); }

/* Input */
.chat-input-wrap {
  display: flex; align-items: flex-end; gap: 1px; background: var(--line);
  border-top: 1px solid var(--line); flex-shrink: 0;
}
.chat-input {
  flex: 1; padding: 14px 20px; border: 0;
  background: var(--bg); color: var(--text);
  font: 400 13px/1.5 var(--font-body);
  resize: none; outline: none;
  max-height: 120px;
}
.chat-input::placeholder { color: var(--text-dim); }
.chat-input:disabled { opacity: 0.5; }

.chat-send {
  width: 56px; min-height: 48px; border: 0; background: var(--accent);
  color: var(--bg); font: 700 18px var(--font-display);
  cursor: pointer; transition: background 150ms;
  display: flex; align-items: center; justify-content: center;
}
.chat-send:hover { background: var(--accent-hot); }
.chat-send:disabled { opacity: 0.3; cursor: not-allowed; }

.send-spinner {
  width: 16px; height: 16px; border: 2px solid var(--bg);
  border-top-color: transparent; border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .chat-body { padding: 16px; }
  .msg { max-width: 95%; }
}
</style>
