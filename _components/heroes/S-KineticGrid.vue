<script setup>
/**
 * S-KineticGrid  |  Editorial Multi-Cell Grid Hero
 * ─────────────────────────────────────────────────
 * 4 columns × 4 rows. 6 content cells, each with its own
 * animation personality. Some cells intentionally empty.
 *
 *  Col 1 [ 96px  ] — index panel (narrow tension)
 *  Col 2 [ 1fr   ] — headline + desc (dominant)
 *  Col 3 [ 200px ] — accent / services (detail)
 *  Col 4 [ ~36vw ] — full-height image (cinematic)
 *
 *  Cells:
 *    A [c1, r2-3] — index number + vertical eyebrow
 *    B [c2, r2 ] — giant serif headline
 *    C [c3, r2 ] — services list + negative space
 *    D [c4, r2-3] — editorial image (no clip-path)
 *    E [c2, r3 ] — description + CTA
 *    F [c3, r3 ] — metric / stat
 */

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

defineOptions({ name: 'SKineticGrid' })

const props = defineProps({
  logoText:     { type: String, default: 'Pegasuz' },
  navLogoHref:  { type: String, default: '#top' },
  navCtaLabel:  { type: String, default: 'Start a project' },
  navCtaHref:   { type: String, default: '#contact' },
  eyebrow:     { type: String, default: 'EST. 2019  —  DIGITAL STUDIO' },
  headline:    { type: String, default: 'Crafting digital products with precision.' },
  description: { type: String, default: 'Strategy-led design and engineering for ambitious digital products.' },
  ctaLabel:    { type: String, default: 'See our work →' },
  ctaHref:     { type: String, default: '#work' },
  imageSrc:    { type: String, required: true },
  imageAlt:    { type: String, default: 'Hero image' },
  stat1:       { type: String, default: '48 projects' },
  stat2:       { type: String, default: '12 countries' },
  stat3:       { type: String, default: '$2B+ raised' },
  metric:      { type: String, default: '$2B+' },
  metricLabel: { type: String, default: 'raised by clients' },
  index:       { type: String, default: '01' },
  services: {
    type: Array,
    default: () => ['Strategy', 'Design', 'Engineering', 'Launch'],
  },
  navLinks: {
    type: Array,
    default: () => ([
      { href: '#work', label: 'Work' },
      { href: '#services', label: 'Services' },
      { href: '#contact', label: 'Contact' },
    ]),
  },
})

const emit = defineEmits(['cta-click'])
const sectionRef = ref(null)
let mm = null

onMounted(() => {
  const el = sectionRef.value
  if (!el) return

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // ── Initial states ────────────────────────────────────────
    gsap.set(el.querySelector('.kg-index-num'),             { autoAlpha: 0, y: 28  })
    gsap.set(el.querySelector('.kg-eyebrow'),               { autoAlpha: 0         })
    gsap.set(el.querySelector('.kg-heading'),               { yPercent: 108        })
    gsap.set(el.querySelectorAll('.kg-service-item'),       { autoAlpha: 0, x: -10 })
    gsap.set(el.querySelector('.kg-accent-arrow'),          { autoAlpha: 0         })
    gsap.set(el.querySelector('.kg-image'),                 { scale: 1.08, autoAlpha: 0 })
    gsap.set(el.querySelector('.kg-description'),           { autoAlpha: 0, y: 18  })
    gsap.set(el.querySelector('.kg-cta'),                   { autoAlpha: 0, y: 12  })
    gsap.set(el.querySelector('.kg-metric-num'),            { autoAlpha: 0, y: 22  })
    gsap.set(el.querySelector('.kg-metric-label'),          { autoAlpha: 0         })
    gsap.set(el.querySelectorAll('.kg-stat,.kg-stat-sep'),  { autoAlpha: 0, x: 12  })

    // ── Timeline — each cell its own personality ──────────────
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl
      // Cell D — image first (cinematic, slow, sets the atmosphere)
      .to(el.querySelector('.kg-image'),             { scale: 1, autoAlpha: 1, duration: 2.0, ease: 'power2.out' }, 0)

      // Cell A — index drops in from above
      .to(el.querySelector('.kg-index-num'),         { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power4.out' }, 0.22)
      .to(el.querySelector('.kg-eyebrow'),           { autoAlpha: 1, duration: 0.9 }, 0.44)

      // Cell B — heading reveals from bottom mask (most dramatic)
      .to(el.querySelector('.kg-heading'),           { yPercent: 0, duration: 1.7, ease: 'power4.out' }, 0.32)

      // Cell C — services stagger in from left
      .to(el.querySelectorAll('.kg-service-item'),   { autoAlpha: 1, x: 0, duration: 0.55, stagger: 0.10 }, 0.72)
      .to(el.querySelector('.kg-accent-arrow'),      { autoAlpha: 1, duration: 0.5 }, 0.88)

      // Cell E — desc + cta
      .to(el.querySelector('.kg-description'),       { autoAlpha: 1, y: 0, duration: 1.0 }, 0.92)
      .to(el.querySelector('.kg-cta'),               { autoAlpha: 1, y: 0, duration: 0.7 }, 1.08)

      // Cell F — metric
      .to(el.querySelector('.kg-metric-num'),        { autoAlpha: 1, y: 0, duration: 0.9 }, 0.98)
      .to(el.querySelector('.kg-metric-label'),      { autoAlpha: 1, duration: 0.6 }, 1.15)

      // Footer stats
      .to(el.querySelectorAll('.kg-stat,.kg-stat-sep'), { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.05 }, 1.2)

    // ── Scroll parallax ───────────────────────────────────────
    gsap.to(el.querySelector('.kg-image'), {
      yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.5 },
    })
    gsap.to(el.querySelector('.kg-index-num'), {
      y: 64, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.5 },
    })

    return () => {}
  })
})

onBeforeUnmount(() => mm?.revert())
</script>

<template>
  <section ref="sectionRef" class="s-kg" aria-label="Hero">

    <!-- Navigation — spans full width -->
    <nav class="kg-nav" aria-label="Primary navigation">
      <a :href="navLogoHref" class="kg-logo">{{ logoText }}</a>
      <ul class="kg-nav-links" role="list">
        <li v-for="link in navLinks" :key="link.href">
          <a :href="link.href" class="kg-nav-link">{{ link.label }}</a>
        </li>
      </ul>
      <a :href="navCtaHref" class="kg-nav-cta">{{ navCtaLabel }}</a>
    </nav>

    <!-- CELL A: Index panel (narrow, spans both content rows) -->
    <div class="kg-cell kg-cell--index">
      <span class="kg-index-num" aria-label="Index {{ index }}">{{ index }}</span>
      <p class="kg-eyebrow">{{ eyebrow }}</p>
    </div>

    <!-- CELL B: Headline (dominant, upper row) -->
    <div class="kg-cell kg-cell--head">
      <div class="kg-heading-mask">
        <h1 class="kg-heading">{{ headline }}</h1>
      </div>
    </div>

    <!-- CELL C: Accent — services list + intentional negative space -->
    <div class="kg-cell kg-cell--accent" aria-hidden="true">
      <span class="kg-accent-arrow">↗</span>
      <ul class="kg-services">
        <li v-for="s in services" :key="s" class="kg-service-item">{{ s }}</li>
      </ul>
    </div>

    <!-- CELL D: Image (tall, spans both content rows) -->
    <div class="kg-cell kg-cell--image">
      <img
        :src="imageSrc"
        :alt="imageAlt"
        class="kg-image"
        width="520"
        height="900"
        loading="eager"
        draggable="false"
      />
    </div>

    <!-- CELL E: Description + CTA (lower row) -->
    <div class="kg-cell kg-cell--desc">
      <p class="kg-description">{{ description }}</p>
      <a :href="ctaHref" class="kg-cta" @click.prevent="emit('cta-click', ctaHref)">
        {{ ctaLabel }}
      </a>
    </div>

    <!-- CELL F: Single metric (lower row, accent column) -->
    <div class="kg-cell kg-cell--metric">
      <span class="kg-metric-num">{{ metric }}</span>
      <span class="kg-metric-label">{{ metricLabel }}</span>
    </div>

    <!-- Footer: stats bar -->
    <footer class="kg-footer">
      <div class="kg-stats" aria-label="Key metrics">
        <span class="kg-stat">{{ stat1 }}</span>
        <span class="kg-stat-sep" aria-hidden="true">·</span>
        <span class="kg-stat">{{ stat2 }}</span>
        <span class="kg-stat-sep" aria-hidden="true">·</span>
        <span class="kg-stat">{{ stat3 }}</span>
      </div>
    </footer>

  </section>
</template>

<style scoped>
/* ──────────────────────────────────────────────
   S-KineticGrid  |  Editorial Multi-Cell Grid
   4 columns × 4 rows — asymmetric by design
────────────────────────────────────────────── */

.s-kg {
  --kg-c1:   96px;
  --kg-c3:   200px;
  --kg-c4:   clamp(280px, 36vw, 520px);
  --kg-r1:   68px;
  --kg-r3:   clamp(140px, 18vh, 196px);
  --kg-r4:   52px;
  --kg-line: color-mix(in srgb, var(--color-accent) 18%, transparent);

  background: var(--color-canvas);
  color: var(--color-text);
  min-height: 100vh;
  display: grid;
  grid-template-columns: var(--kg-c1) 1fr var(--kg-c3) var(--kg-c4);
  grid-template-rows: var(--kg-r1) 1fr var(--kg-r3) var(--kg-r4);
}

/* ── Grid placement ─────────────────────────── */

.kg-nav          { grid-column: 1 / -1; grid-row: 1; }
.kg-cell--index  { grid-column: 1;      grid-row: 2 / 4; }
.kg-cell--head   { grid-column: 2;      grid-row: 2;     }
.kg-cell--accent { grid-column: 3;      grid-row: 2;     }
.kg-cell--image  { grid-column: 4;      grid-row: 2 / 4; }
.kg-cell--desc   { grid-column: 2;      grid-row: 3;     }
.kg-cell--metric { grid-column: 3;      grid-row: 3;     }
.kg-footer       { grid-column: 1 / -1; grid-row: 4;     }

/* ── Shared cell treatment ──────────────────── */

.kg-cell {
  /* Hairline inset border creates the grid lines */
  box-shadow: inset 0 0 0 0.5px var(--kg-line);
  position: relative;
  overflow: hidden;
}

/* ── Navigation ─────────────────────────────── */

.kg-nav {
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: inset 0 0 0 0.5px var(--kg-line);
  position: relative;
  z-index: var(--z-nav, 900);
}

/* Logo aligns to index column — grid coherence */
.kg-logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--kg-c1);
  height: 100%;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text);
  text-decoration: none;
  transition: opacity var(--duration-fast) var(--ease-out);
}
.kg-logo:hover         { opacity: 0.6; }
.kg-logo:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }

.kg-nav-links {
  display: flex;
  gap: 32px;
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  justify-content: center;
}

.kg-nav-link {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
}
.kg-nav-link:hover         { color: var(--color-text); }
.kg-nav-link:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }

.kg-nav-cta {
  flex-shrink: 0;
  margin-right: 20px;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--color-text);
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.26);
  padding: 8px 20px;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background   var(--duration-fast) var(--ease-out);
}
.kg-nav-cta:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-subtle);
}
.kg-nav-cta:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }

/* ── CELL A: Index panel ────────────────────── */

.kg-cell--index {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 28px 0;
}

.kg-index-num {
  font-family: var(--font-display);
  font-size: clamp(32px, 3.2vw, 52px);
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.06em;
  line-height: 1;
}

.kg-eyebrow {
  font-family: var(--font-body);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  margin: 0;
}

/* ── CELL B: Headline ───────────────────────── */

.kg-cell--head {
  display: flex;
  align-items: center;
  padding: clamp(28px, 3.5vw, 52px) clamp(28px, 4vw, 56px);
}

.kg-heading-mask {
  overflow: hidden;
  padding-bottom: 0.06em;
  width: 100%;
}

.kg-heading {
  margin: 0;
  font-family: var(--font-serif, Georgia, serif);
  font-size: clamp(44px, 5.4vw, 88px);
  font-weight: 300;
  line-height: 1.07;
  letter-spacing: -0.035em;
  color: var(--color-text);
  display: block;
}

/* ── CELL C: Accent ─────────────────────────── */

.kg-cell--accent {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px 22px 22px;
  /* Dot grid — marks this cell as intentional negative space */
  background-image: radial-gradient(
    circle,
    color-mix(in srgb, var(--color-accent) 12%, transparent) 1px,
    transparent 1px
  );
  background-size: 22px 22px;
  background-position: 11px 11px;
}

.kg-accent-arrow {
  align-self: flex-end;
  font-size: 14px;
  color: color-mix(in srgb, var(--color-accent) 55%, transparent);
  line-height: 1;
}

.kg-services {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.kg-service-item {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  line-height: 1;
}
.kg-service-item::before {
  content: '— ';
  color: var(--color-accent);
  opacity: 0.5;
}

/* ── CELL D: Image ──────────────────────────── */

.kg-cell--image {
  overflow: hidden;
}

.kg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transform-origin: center;
}

/* ── CELL E: Desc + CTA ─────────────────────── */

.kg-cell--desc {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  padding: 20px clamp(24px, 4vw, 56px);
}

.kg-description {
  font-family: var(--font-body);
  font-size: 13px;
  line-height: 1.75;
  color: var(--color-text-muted);
  max-width: 380px;
  margin: 0;
}

.kg-cta {
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 0 20px;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--color-text);
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  align-self: flex-start;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background   var(--duration-fast) var(--ease-out);
}
.kg-cta:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-subtle);
}
.kg-cta:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 4px; }

/* ── CELL F: Metric ─────────────────────────── */

.kg-cell--metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding: 20px 22px;
  gap: 5px;
}

.kg-metric-num {
  font-family: var(--font-serif, Georgia, serif);
  font-size: clamp(26px, 3vw, 46px);
  font-weight: 300;
  letter-spacing: -0.04em;
  color: var(--color-text);
  line-height: 1;
}

.kg-metric-label {
  font-family: var(--font-body);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  text-align: right;
}

/* ── Footer ─────────────────────────────────── */

.kg-footer {
  box-shadow: inset 0 0 0 0.5px var(--kg-line);
  display: flex;
  align-items: center;
  padding: 0 24px 0 0;
}

.kg-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: var(--kg-c1);
}

.kg-stat {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.kg-stat-sep {
  font-size: 10px;
  color: var(--color-text-subtle);
  opacity: 0.4;
}

/* ── Responsive ─────────────────────────────── */

@media (max-width: 960px) {
  .s-kg {
    --kg-c1: 72px;
    --kg-c3: 160px;
    --kg-c4: clamp(220px, 32vw, 380px);
  }
}

@media (max-width: 768px) {
  .s-kg {
    grid-template-columns: 1fr;
    grid-template-rows: var(--kg-r1) 52vw auto auto var(--kg-r4);
    min-height: auto;
  }
  .kg-nav          { padding-left: 20px; }
  .kg-cell--index  { display: none; }
  .kg-cell--head   { grid-column: 1; grid-row: 3; padding: 36px 24px 20px; }
  .kg-cell--accent { display: none; }
  .kg-cell--image  { grid-column: 1; grid-row: 2; }
  .kg-cell--desc   { grid-column: 1; grid-row: 4; padding: 20px 24px; }
  .kg-cell--metric { display: none; }
  .kg-footer       { grid-column: 1; grid-row: 5; }
  .kg-nav-links    { display: none; }
  .kg-heading      { font-size: clamp(36px, 9vw, 58px); }
  .kg-stats        { padding-left: 20px; }
}
</style>
