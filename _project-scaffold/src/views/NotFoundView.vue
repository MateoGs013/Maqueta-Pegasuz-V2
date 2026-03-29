<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <main class="not-found">
    <h1>404</h1>
    <p>Page not found</p>
    <button @click="router.push('/')">Back to home</button>
  </main>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: var(--space-4);
  text-align: center;
}

.not-found h1 {
  font-family: var(--font-display);
  font-size: var(--text-6xl);
  color: var(--accent-primary);
}

.not-found p {
  font-size: var(--text-lg);
  color: var(--text-muted);
}

.not-found button {
  padding: var(--space-3) var(--space-6);
  background: var(--accent-primary);
  color: var(--canvas);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  cursor: pointer;
  transition: opacity var(--duration-fast) var(--ease-brand);
}

.not-found button:hover {
  opacity: 0.85;
}
</style>
