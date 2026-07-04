# Raw research — Eros brain as Obsidian vault

> Agente de investigación Fable, 2026-07-04. Fuentes web + inspección del JSON actual. Insumo para `docs/research/2026-07-04-fable-evolution.md`.

## Key findings

**1. Architecture pattern.** The "AI agent memory as Obsidian vault" space matured in 2025–26. Reference projects ([obsidian-mind](https://github.com/breferrari/obsidian-mind), [claude-obsidian](https://github.com/AgriciDaniel/claude-obsidian), Karpathy's LLM Wiki pattern) converge: **type-based folders + MOC hub notes + typed YAML frontmatter** — not pure Zettelkasten, not PARA, not flat-with-tags.
- Zettelkasten timestamped IDs are hostile to human browsing; add nothing when IDs live in frontmatter.
- PARA organizes by actionability — wrong axis for a corpus of rules/techniques/palettes.
- Flat-with-tags breaks the machine side: an agent needs a **deterministic filing rule** ("a rule note goes in `rules/`").
- Mantra: **"Folders group by purpose. Links group by meaning."** One home folder per note, many wikilinks out.
- Tiered loading is standard: ~2K-token session-start injection, then on-demand reads (hot → index → domain sub-index → note).

**2. Querying: Bases won.** Mid-2026: [Obsidian Bases](https://obsidian.md/help/bases) (native database core plugin) is the default — native, fast, table/cards views, formulas, `![[file.base]]` embeds, no plugin dependency. [Dataview effectively unmaintained](https://medium.com/@lennart.dde/obsidian-dataview-is-dead-long-live-bases-9750e8a92877); consensus: ["Bases covers ~80% of dashboard needs"](https://obsidian.rocks/dataview-vs-datacore-vs-obsidian-bases/). For Eros, Bases covers 100%. **The machine needs no plugin**: Claude Code queries frontmatter with Grep. Bases is purely the human's lens.

**3. Failure modes to design around** ([critique](https://limitededitionjonathan.substack.com/p/stop-calling-it-memory-the-problem)): no schema enforcement, inconsistent formatting across sessions, concurrent-write corruption, context flooding. Fixes: **templates as schema, PostToolUse hook validating frontmatter after every .md write, one-writer discipline, small atomic notes, append-only logs.** Keep *operational state* (training status, activity feed) as JSON — only *knowledge* becomes notes.

**4. Git.** Commit notes + templates + .base + curated `.obsidian/` subset; ignore `workspace.json` and caches ([forum consensus](https://forum.obsidian.md/t/what-should-i-gitignore-for-my-vaults-github-repository/101077), [kristoffer.dev](https://kristoffer.dev/blog/obsidian-gitignore/)).

**5. Graph.** MOCs are the lever ([obsidian.rocks](https://obsidian.rocks/maps-of-content-effortless-organization-for-notes/)); every note links to ≥1 hub (orphan = validation error); hub >~6 ungrouped links → add headers. Cross-type links (rule↔technique↔project) make the graph mean something.

## (a) Recommended vault structure

Vault root: `C:\Users\mateo\Desktop\Eros\brain\` (replaces `.eros/memory/design-intelligence/` as knowledge store; visible folder so Obsidian opens naturally).

```
brain/
├── Home.md                     # Human dashboard — embeds .base views
├── START.md                    # Machine entry point — ≤2K tokens, regenerated
├── self/
│   ├── eros.md                 # Identity + personality (evolving self-note)
│   ├── aesthetic.md            # Weighted preferences
│   └── growth-log.md           # Append-only milestones/resets
├── maps/                       # MOC hubs
│   ├── rules-map.md
│   ├── techniques-map.md
│   ├── projects-map.md
│   ├── style-map.md            # palettes + typography + signatures
│   └── lessons-map.md
├── rules/                      # one note per anti-AI rule
├── techniques/                 # one note per technique
├── patterns/                   # one note per section pattern
├── signatures/                 # one note per approved/rejected signature
├── palettes/                   # one note per palette outcome
├── typography/                 # one note per font pairing
├── lessons/                    # one note per pipeline lesson
├── revisions/                  # one note per revision event
├── projects/                   # one note per project
├── references/                 # one note per analyzed reference site
├── assets/                     # captured files + one note per notable asset
├── bases/                      # .base query files
├── templates/                  # one template per note type (schema source of truth)
└── .obsidian/                  # partially committed
```

**Naming:** kebab-case descriptive slugs; no timestamps except event-like notes (`revisions/2026-04-01-forge-studio-hero-v1.md`). `RULE-001` vive en frontmatter + alias, así `[[RULE-001]]` resuelve.

**Knowledge vs state split:** `activity-feed.json`, `auto-train-status.json`, `training-config.json`, `training-calibration.json`, `puchos.json` = operational state → stay JSON in `.eros/state/`.

## (b) Frontmatter schemas (per note type)

Conventions: `type` (drives Bases filters), `id` (stable machine key), `created`/`updated` ISO, wikilinks in frontmatter quoted (`"[[forge-studio]]"`), numbers as bare YAML, `aliases` for alternate link targets.

```yaml
# rule
type: rule
id: RULE-001
aliases: [RULE-001]
status: PROMOTED          # CANDIDATE | PROMOTED | RETIRED
validations: 5
source: seed/Research (V5.5)
seeded: true
promoted-to: CLAUDE.md
promoted-at: 2026-04-03
projects: ["[[forge-studio]]"]
tags: [rule, anti-ai]

# technique
type: technique
id: TECH-clip-path-image-reveal
avg-score: 8.3
times-used: 5
confidence: high
best-with: [hero, portfolio]
scores: [8.2, 8.2, 8.2, 8.5, 8.5]
related-rules: ["[[no-purple-gradients]]"]
tags: [technique, motion]

# project
type: project
id: forge-studio
status: killed             # active | delivered | killed | archived
mood: dark cinematic editorial
palette: "[[forge-studio-copper-amber]]"
typography: "[[cormorant-dm-sans]]"
score: 7.2
tags: [project]

# lesson
type: lesson
id: LES-2026-04-01-hero
severity: critical
phase: build
project: "[[forge-studio]]"
prevention-adopted: true
tags: [lesson, pipeline]

# palette / font-pairing / signature / asset / self — ver informe completo
```

Body de cada nota: prosa + `## Evidence log` + `<!-- eros:append-below -->`; la máquina solo inserta debajo del marker. Arriba del marker = territorio humano.

## (c) Entry points

- **Human — `Home.md`**: prosa de estado (transclusión `![[eros#Current state]]`) + `![[bases/rules.base]]` etc. + links a los 5 maps. `graph.json` commiteado con color groups por type.
- **Machine — `START.md`**: budget ≤2,000 tokens, **regenerado** (`<!-- generated: do not hand-edit -->`): identidad 3 líneas, counts, reglas PROMOTED inline, top-5 técnicas, últimas 3 lecciones, pointers al resto.
- **Read protocol**: SessionStart hook inyecta START.md → Grep en frontmatter como query engine (`Grep "^status: CANDIDATE" brain/rules/ -l`) → Read solo esos archivos. Nunca bulk-read.
- **Write protocol**: nota nueva desde template; updates solo (1) edit de línea frontmatter exacta, (2) append bajo marker. `growth-log.md`/`revisions/`: append-only. PostToolUse hook valida frontmatter por type + ≥1 wikilink (orphan = error). Un solo writer por vez; git como árbitro. Al final de sesión, regenerar START.md.

## (d) Query examples

`bases/rules.base` — "rules with ≥3 validations not yet promoted":
```yaml
filters:
  and:
    - file.inFolder("rules")
    - type == "rule"
views:
  - type: table
    name: Ready to promote
    filters:
      and:
        - validations >= 3
        - status != "PROMOTED"
    sort: [{property: validations, direction: DESC}]
  - type: table
    name: All rules
    order: [file.name, status, validations, promoted-to]
```

`bases/techniques.base` — leaderboard con formula `reliability: 'if(times-used >= 3, confidence, "insufficient-data")'`; vista "Needs more evidence" con `times-used < 3`. Machine-side: Grep frontmatter o un `eros-query.mjs` de ~20 líneas con gray-matter.

## (e) Git strategy

```gitignore
brain/.obsidian/*
!brain/.obsidian/app.json
!brain/.obsidian/appearance.json
!brain/.obsidian/core-plugins.json
!brain/.obsidian/community-plugins.json
!brain/.obsidian/graph.json
!brain/.obsidian/hotkeys.json
brain/.trash/
```

Commit: .md, templates/, bases/*.base, curated .obsidian. Ignore: workspace.json, caches, .trash. No Obsidian-Git auto-commit simultáneo con sesiones — un committer (fin de sesión). Multi-máquina: pull-before-session, push-after-session.

## (f) Migration mapping from current JSON

| Current file | → Vault target | Notes |
|---|---|---|
| `personality.json .identity` | `self/eros.md` | counts → frontmatter; essence/state → body |
| `personality.json .aesthetic` | `self/aesthetic.md` | top picks frontmatter; matriz completa como tabla |
| `personality.json` growth | `self/growth-log.md` | append-only dated bullets |
| `rules.json` (18) | `rules/<slug>.md` ×18 | 1:1; RULE-### → alias; body = texto + evidence log |
| `technique-scores.json` (13) | `techniques/<slug>.md` | scores array en frontmatter |
| `section-patterns.json` (43) | `patterns/<section>-<project>.md` | keyTechnique → wikilink |
| `signatures.json` (8+2) | `signatures/<slug>.md` | verdict field |
| `revision-patterns.json` | `revisions/YYYY-MM-DD-<project>-<phase>.md` | pattern generalizable → append a regla/lección linkeada |
| `pipeline-lessons.json` | `lessons/<slug>.md` | issue/resolution/prevention → H2 |
| `color-palettes.json` | `palettes/<project>-<slug>.md` | hex → frontmatter |
| `font-pairings.json` | `typography/<display>-<body>.md` | caution → wikilink a regla |
| `project-registry.json` | `projects/<slug>.md` | registry → frontmatter |
| `discovered-references.json` + captures | `references/<domain>.md` + `assets/` | |
| `diary.md`, `.md` twins | fold into growth-log / notas | las twins mueren; las notas SON el rendering |
| `activity-feed.json`, `auto-train-*.json`, `training-*.json`, `puchos.json` | **stay JSON** → `.eros/state/` | estado operacional, no conocimiento |

**Mechanics:** un `migrate-to-vault.mjs`: lee cada JSON, emite notas desde `templates/` (valida templates día uno), auto-inserta wikilinks cruzando nombres de proyectos/técnicas, genera los 5 maps + START.md, congela JSON viejo en `.eros/memory/_archive/` un release antes de borrar. Toda nota generada con ≥2 links — grafo nace denso, cero huérfanos.

Sources: [obsidian-mind](https://github.com/breferrari/obsidian-mind) · [claude-obsidian](https://github.com/AgriciDaniel/claude-obsidian) · [Obsidian+Claude second brain](https://pasqualepillitteri.it/en/news/962/obsidian-claude-code-second-brain-persistent-memory) · [Dataview vs Datacore vs Bases](https://obsidian.rocks/dataview-vs-datacore-vs-obsidian-bases/) · [Bases (official)](https://help.obsidian.md/bases/syntax) · [Stop calling it memory](https://limitededitionjonathan.substack.com/p/stop-calling-it-memory-the-problem) · [Obsidian gitignore](https://kristoffer.dev/blog/obsidian-gitignore/) · [MOCs](https://obsidian.rocks/maps-of-content-effortless-organization-for-notes/)
