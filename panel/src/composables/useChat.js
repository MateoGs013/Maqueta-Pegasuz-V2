import { ref } from 'vue'

// Singleton state — survives component unmount/remount
const messages = ref([
  {
    from: 'eros',
    text: 'Soy Eros. Preguntame lo que quieras — sobre mis técnicas, debilidades, filosofía, proyectos, o lo que se te ocurra.',
    mood: 'open',
  },
])

export function useChat() {
  return { messages }
}
