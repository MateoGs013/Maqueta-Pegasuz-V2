<script setup>
import MarkdownDocument from '@/components/MarkdownDocument.vue'
import {
  frontBrainSnapshot,
  rules,
  selectedBlueprints,
  thresholds,
} from '@/data/frontBrain.js'
import {
  extractMarkdownTitle,
  splitMarkdownSections,
} from '@/utils/markdown.js'

const documentTitle = extractMarkdownTitle(frontBrainSnapshot.designMarkdown)
const sections = splitMarkdownSections(frontBrainSnapshot.designMarkdown)
</script>

<template>
  <div class="panel-page">
    <header class="page-header">
      <p class="page-eyebrow">Design DNA</p>
      <h1 class="page-title">{{ documentTitle }}</h1>
      <p class="page-copy">
        `DESIGN.md` is now the canonical design contract for every generated project. This view
        shows the actual narrative artifact plus the active rule layer that approval logic reads.
      </p>
    </header>

    <section class="page-grid page-grid--two">
      <article class="surface-card">
        <header class="surface-header">
          <div>
            <p class="surface-eyebrow">Active seed pair</p>
            <h2 class="surface-title">{{ selectedBlueprints.hero.label }} + {{ selectedBlueprints.nav.label }}</h2>
          </div>
        </header>
        <div class="pill-row">
          <span class="pill pill--accent">{{ selectedBlueprints.hero.compositionFamily }}</span>
          <span class="pill pill--medium">{{ selectedBlueprints.hero.motionFamily }}</span>
          <span class="pill pill--accent">{{ selectedBlueprints.nav.compositionFamily }}</span>
          <span class="pill pill--medium">{{ selectedBlueprints.nav.motionFamily }}</span>
        </div>
        <div class="surface-subsection">
          <p class="surface-kicker">Seed contract</p>
          <ul class="text-list">
            <li><span>Problem:</span> <span>{{ selectedBlueprints.hero.problemSolved }}</span></li>
            <li><span>Non-generic signal:</span> <span>{{ selectedBlueprints.hero.distinctiveLeverage }}</span></li>
            <li><span>Locked zones:</span> <span>{{ selectedBlueprints.hero.lockedZones.join(', ') }}</span></li>
            <li><span>Mutable zones:</span> <span>{{ selectedBlueprints.hero.mutableZones.join(', ') }}</span></li>
          </ul>
        </div>
      </article>

      <article class="surface-card">
        <header class="surface-header">
          <div>
            <p class="surface-eyebrow">Approval contract</p>
            <h2 class="surface-title">Rules that shape the run</h2>
          </div>
        </header>
        <div class="pill-row">
          <span v-for="threshold in thresholds" :key="threshold.label" class="pill pill--accent">
            {{ threshold.label }}: {{ threshold.value }}
          </span>
        </div>
        <ul class="text-list">
          <li v-for="rule in rules" :key="rule.id">
            <span class="pill" :class="`pill--${rule.tone}`">{{ rule.type }}</span>
            <span>{{ rule.text }}</span>
          </li>
        </ul>
      </article>
    </section>

    <section class="page-grid page-grid--masonry">
      <MarkdownDocument
        v-for="section in sections"
        :key="section.title"
        eyebrow="DESIGN.md"
        :title="section.title"
        :content="section.content"
      />
    </section>
  </div>
</template>

<style scoped>
.page-grid--masonry {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
}

@media (max-width: 980px) {
  .page-grid--masonry {
    grid-template-columns: 1fr;
  }
}
</style>
