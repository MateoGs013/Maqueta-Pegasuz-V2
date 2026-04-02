<script setup>
import MarkdownDocument from '@/components/MarkdownDocument.vue'
import { frontBrainSnapshot, retryInstructions, selectedBlueprints } from '@/data/frontBrain.js'
import { extractMarkdownTitle, splitMarkdownSections } from '@/utils/markdown.js'

const decisionsTitle = extractMarkdownTitle(frontBrainSnapshot.decisionsMarkdown)
const decisionSections = splitMarkdownSections(frontBrainSnapshot.decisionsMarkdown)
</script>

<template>
  <div class="panel-page">
    <header class="page-header">
      <p class="page-eyebrow">Decisions and review</p>
      <h1 class="page-title">Decision log for {{ selectedBlueprints.hero.label }} + {{ selectedBlueprints.nav.label }}</h1>
      <p class="page-copy">
        Narrative rationale stays in Markdown, but it now sits beside the structured state that
        triggered those decisions. This is the compatibility layer between operator readability
        and machine-consumable run logic.
      </p>
    </header>

    <section class="page-grid page-grid--two decisions-grid">
      <div class="decision-stack">
        <MarkdownDocument
          v-for="section in decisionSections"
          :key="section.title"
          :eyebrow="decisionsTitle"
          :title="section.title"
          :content="section.content"
        />
      </div>

      <div class="decision-stack">
        <MarkdownDocument
          eyebrow="Review"
          title="Review summary"
          :content="frontBrainSnapshot.reviewMarkdown"
        />

        <article class="surface-card">
          <header class="surface-header">
            <div>
              <p class="surface-eyebrow">Pending follow-up</p>
              <h2 class="surface-title">Retry instructions</h2>
            </div>
          </header>
          <ul class="text-list">
            <li v-for="instruction in retryInstructions" :key="instruction">{{ instruction }}</li>
          </ul>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.decisions-grid {
  align-items: start;
}

.decision-stack {
  display: grid;
  gap: 18px;
}
</style>
