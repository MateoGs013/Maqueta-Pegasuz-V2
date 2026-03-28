<script setup>
/**
 * HomeView — Landing page placeholder
 *
 * Replace this with the real homepage sections
 * following docs/page-plans.md
 */
</script>

<template>
  <div class="home">
    <section class="hero container" aria-labelledby="hero-heading">
      <h1 id="hero-heading">Welcome</h1>
      <p>This is the scaffold homepage. Replace with real content from <code>docs/content-brief.md</code>.</p>
    </section>
  </div>
</template>

<style scoped>
.hero {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-lg);
}

.hero h1 {
  font-family: var(--font-display);
  font-size: var(--text-hero);
  font-weight: var(--weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.hero p {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  max-width: 60ch;
}
</style>
