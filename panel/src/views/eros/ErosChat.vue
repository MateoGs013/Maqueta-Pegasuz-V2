<script setup>
import { ref, nextTick, onMounted } from 'vue'

const messages = ref([])
const input = ref('')
const sending = ref(false)
const chatBody = ref(null)

const WELCOME = {
  from: 'eros',
  text: 'Soy Eros. Preguntame lo que quieras — sobre mis técnicas, debilidades, filosofía, proyectos, o lo que se te ocurra.',
  mood: 'open',
}

const send = async () => {
  const msg = input.value.trim()
  if (!msg || sending.value) return

  messages.value.push({ from: 'user', text: msg })
  input.value = ''
  sending.value = true
  scrollBottom()

  try {
    const res = await fetch('/__eros/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    })
    const data = await res.json()
    messages.value.push({
      from: 'eros',
      text: data.response || 'Sin respuesta.',
      mood: data.mood || 'neutral',
    })
  } catch {
    messages.value.push({ from: 'eros', text: 'Error al procesar tu mensaje.', mood: 'confused' })
  }
  sending.value = false
  scrollBottom()
}

const scrollBottom = () => {
  nextTick(() => { if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight })
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
  '¿Qué pensás de SplitText?',
]

const askQuick = (q) => { input.value = q; send() }

onMounted(() => { messages.value.push(WELCOME) })
</script>

<template>
  <div class="chat">
    <!-- Messages -->
    <div class="chat-body" ref="chatBody">
      <div
        v-for="(msg, i) in messages" :key="i"
        class="msg" :class="[`msg-${msg.from}`, msg.mood ? `mood-${msg.mood}` : '']"
      >
        <div class="msg-header" v-if="msg.from === 'eros'">
          <span class="msg-name">Eros</span>
          <span class="msg-mood" v-if="msg.mood">{{ msg.mood }}</span>
        </div>
        <div class="msg-text" v-html="formatText(msg.text)"></div>
      </div>

      <!-- Typing indicator -->
      <div v-if="sending" class="msg msg-eros">
        <div class="msg-header"><span class="msg-name">Eros</span></div>
        <div class="typing"><span></span><span></span><span></span></div>
      </div>

      <!-- Quick questions (show only at start) -->
      <div v-if="messages.length <= 1" class="quick-section">
        <p class="quick-label">Preguntale algo:</p>
        <div class="quick-grid">
          <button v-for="q in quickQuestions" :key="q" class="quick-btn" @click="askQuick(q)">{{ q }}</button>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="chat-input-wrap">
      <textarea
        v-model="input"
        @keydown="handleKey"
        placeholder="Hablar con Eros..."
        rows="1"
        class="chat-input"
        :disabled="sending"
      />
      <button class="chat-send" @click="send" :disabled="sending || !input.trim()">→</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    formatText(text) {
      return (text || '')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/— /g, '<span class="dash">— </span>')
    }
  }
}
</script>

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
.msg { max-width: 85%; }
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
.msg-text :deep(br) + :deep(br) { display: block; content: ''; margin-top: 8px; }

/* Typing indicator */
.typing { display: flex; gap: 4px; padding: 4px 0; }
.typing span {
  width: 6px; height: 6px; border-radius: 50%; background: var(--text-dim);
  animation: blink 1.4s infinite both;
}
.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }

/* Quick questions */
.quick-section { padding: 16px 0; }
.quick-label { font: 500 9px var(--font-mono); color: var(--text-dim); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
.quick-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.quick-btn {
  padding: 6px 12px; border: 1px solid var(--line-strong);
  background: transparent; color: var(--text-muted);
  font: 400 11px var(--font-body); cursor: pointer;
  transition: all 150ms;
}
.quick-btn:hover { color: var(--accent); border-color: var(--line-accent); background: var(--accent-ember); }

/* Input */
.chat-input-wrap {
  display: flex; gap: 1px; background: var(--line);
  border-top: 1px solid var(--line); flex-shrink: 0;
}
.chat-input {
  flex: 1; padding: 14px 20px; border: 0;
  background: var(--bg); color: var(--text);
  font: 400 13px/1.5 var(--font-body);
  resize: none; outline: none;
}
.chat-input::placeholder { color: var(--text-dim); }
.chat-input:disabled { opacity: 0.5; }

.chat-send {
  width: 56px; border: 0; background: var(--accent);
  color: var(--bg); font: 700 18px var(--font-display);
  cursor: pointer; transition: background 150ms;
}
.chat-send:hover { background: var(--accent-hot); }
.chat-send:disabled { opacity: 0.3; cursor: not-allowed; }

@media (max-width: 768px) {
  .chat-body { padding: 16px; }
  .msg { max-width: 95%; }
}
</style>
