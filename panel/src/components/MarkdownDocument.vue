<script setup>
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown.js'

const props = defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    required: true,
  },
})

const html = computed(() => renderMarkdown(props.content))
</script>

<template>
  <article class="surface-card markdown-card">
    <header v-if="eyebrow || title" class="surface-header">
      <p v-if="eyebrow" class="surface-eyebrow">{{ eyebrow }}</p>
      <h2 v-if="title" class="surface-title">{{ title }}</h2>
    </header>
    <div class="markdown-body" v-html="html"></div>
  </article>
</template>

<style scoped>
.markdown-card {
  gap: 18px;
}
</style>
