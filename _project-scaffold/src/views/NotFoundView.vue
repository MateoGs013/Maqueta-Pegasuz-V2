<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="not-found container" aria-labelledby="not-found-heading">
    <h1 id="not-found-heading">404</h1>
    <p>The page you are looking for does not exist.</p>
    <button class="btn-back" @click="goHome">Back to Home</button>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: var(--space-lg);
}

.not-found h1 {
  font-family: var(--font-display);
  font-size: var(--text-hero);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  color: var(--color-accent-primary);
}

.not-found p {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
}

.btn-back {
  padding: var(--space-sm) var(--space-xl);
  background: var(--color-accent-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md, 8px);
  font-weight: var(--weight-medium);
  transition: var(--transition-base);
}

.btn-back:hover {
  background: var(--color-accent-hover);
}

.btn-back:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
</style>
