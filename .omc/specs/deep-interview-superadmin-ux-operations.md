# Deep Interview Spec: SuperAdmin Operations UX Upgrade

## Metadata
- Interview ID: superadmin-ux-operations-2026-04-10
- Rounds: 6
- Final Ambiguity Score: 18%
- Type: brownfield
- Generated: 2026-04-10
- Threshold: 20%
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.90 | 0.35 | 0.315 |
| Constraint Clarity | 0.75 | 0.25 | 0.188 |
| Success Criteria | 0.75 | 0.25 | 0.188 |
| Context Clarity | 0.85 | 0.15 | 0.128 |
| **Total Clarity** | | | **0.818** |
| **Ambiguity** | | | **18%** |

## Goal

Upgrade the UX of the two most complex operations views in the Pegasuz SuperAdmin panel — **SystemPanelView** (13+ sections) and **BrainView** (25+ sections) — so that an operator can assess system health, navigate to any section, and identify problems **without scrolling or searching manually**.

The upgrade targets three pillars:
1. **HUD (Health at a Glance)** — A summary dashboard visible at the top without scrolling, showing system health status ("all OK" or "2 problems in X")
2. **Navigation (1-click access)** — A persistent section index or command palette (Cmd+K) that navigates directly to any section
3. **Proactive Alerts** — Problems surface automatically — sections with issues are highlighted, critical alerts are prominent, the operator doesn't have to check 13+ sections to find the red one

## Constraints

- **Full frontend scope**: Can modify templates, CSS, add new components, refactor stores, add composables
- **No API changes**: Backend endpoints remain unchanged. No server-side pagination, no new REST/WS endpoints
- **Scoped to operations views only**: SystemPanelView and BrainView. Dashboard, ClientsView, Login, and global infrastructure (breadcrumbs, toast system) are explicitly deferred to a second iteration
- **Eros aesthetic must be preserved**: All new UI must follow the Eros design system — angular (0 radius), warm near-blacks, DM Sans/Mono, hot orange accent, no shadows/gradients
- **No logic regression**: Existing functionality (WebSocket updates, polling, store behavior) must remain intact

## Non-Goals

- Global navigation improvements (breadcrumbs, toast system, WS indicator in topbar)
- ClientsView modal restructuring
- Mobile responsiveness for operations views (already low-priority for operator tools)
- Accessibility improvements beyond what's already present
- New API endpoints or backend changes
- Modifications to login, dashboard, logs, env manager, or local command views

## Acceptance Criteria

- [ ] **HUD**: SystemPanelView shows a health summary at the top (above the fold) with aggregated status of all subsystems. Operator can see "all green" or "2 warnings, 1 critical" without scrolling.
- [ ] **HUD**: BrainView shows coherence score, anomaly count, and active mode prominently at the top without scrolling.
- [ ] **Nav**: SystemPanelView has a persistent section index (sidebar TOC or sticky mini-nav) that scrolls to any of the 13+ sections in 1 click.
- [ ] **Nav**: BrainView has a section navigator or command palette (keyboard shortcut) that reaches any of the 25+ sections without manual scrolling.
- [ ] **Alerts**: Sections with health issues (amber/red) are visually promoted — sorted to top, highlighted border, or pinned alert card.
- [ ] **Alerts**: Critical alerts in SystemPanelView are visible without scrolling, not buried in a section.
- [ ] **Craft**: All new components follow Eros aesthetic (0 radius, no shadow, warm colors, mono labels, accent orange).
- [ ] **Craft**: Empty states, loading states, and error states are present and styled consistently.
- [ ] **No regression**: Existing WebSocket updates, polling, store behavior, and route navigation work as before.

## Assumptions Exposed & Resolved

| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| "Quiero mejorar todo" | Contrarian: forced to pick ONE view if limited | Real pain is SystemPanel/Brain operations |
| "Necesito flujo + info + craft" | Simplifier: MVP vs complete | SystemPanel/Brain solo es suficiente para v1. Global infra puede esperar. |
| "Full stack changes needed" | Direct question | Full frontend only, no API changes |
| "UX = aesthetics" | Implicit | Aesthetics already done (Eros reskin). This is about interaction design. |

## Technical Context

### SystemPanelView (`src/views/system/SystemPanelView.vue`)
- 13+ child components: DatabaseHealthSection, PerformanceSection, InfrastructureSection, SecuritySection, StorageSection, MaintenanceSection, HistorySection, IntegritySection, MigrationsSection, EventStream, IncidentTimeline, CorrelationStrip, AlertStrip, StatusCommandBar, TenantGrid
- WebSocket-driven state via `socket.js` store
- Multiple Pinia stores polled at different intervals (30s, 60s, 120s)
- StatusCommandBar at top with popover-based controls

### BrainView (`src/views/system/BrainView.vue`)
- 25+ BrainSection components wrapped in BrainSectionWrap
- Collapsible section architecture
- Custom composables: useBrainCoherence, useBrainAnomalies
- Two modes: "ops" (raw data) and curated
- Existing command palette (keyboard shortcut infrastructure exists)
- brain.js store with 30+ data properties

### Existing Patterns to Leverage
- BrainView already has a command palette concept (can extend for section navigation)
- AlertStrip component exists (can promote to top-level HUD)
- StatusCommandBar exists (can extend with health summary)
- BrainSectionWrap has health prop (green/amber/red) — can use for sorting/highlighting

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| SystemPanelView | core view | 13+ sections, WebSocket, popovers | Contains all system sections |
| BrainView | core view | 25+ sections, 2 modes, command palette | Contains all brain sections |
| HUD | new component | health summary, status indicators, problem count | Sits at top of both views |
| Section Navigator | new component | TOC, jump links, keyboard shortcut | Navigates within views |
| Alert System | enhanced component | priority sorting, prominence, auto-surface | Cross-cutting in both views |
| BrainSectionWrap | existing component | health prop, collapse state | Wraps each brain section |
| StatusCommandBar | existing component | popovers, controls | Top of SystemPanel |
| AlertStrip | existing component | critical alerts, actions | Top of SystemPanel |
| Pinia Stores | infrastructure | polling, WebSocket, state | Data source for all views |
| Eros Design System | constraint | tokens, patterns, aesthetic rules | All new UI must follow |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 6 | 6 | - | - | N/A |
| 2 | 7 | 1 | 0 | 6 | 86% |
| 3 | 9 | 2 | 0 | 7 | 78% |
| 4 | 10 | 1 | 0 | 9 | 90% |
| 5 | 13 | 3 | 0 | 10 | 77% |
| 6 | 13 | 0 | 0 | 13 | 100% |

## Interview Transcript

<details>
<summary>Full Q&A (6 rounds)</summary>

### Round 1
**Q:** El audit encontro problemas en muchas areas. Cual es tu dolor principal como usuario del panel?
**A:** Todo — quiero un upgrade completo
**Ambiguity:** 74% (Goal: 0.30, Constraints: 0.10, Criteria: 0.10, Context: 0.70)

### Round 2
**Q:** El reskin fue CSS-only. Para un upgrade UX completo, hasta donde puedo llegar?
**A:** Full frontend (sin API changes)
**Ambiguity:** 57% (Goal: 0.35, Constraints: 0.65, Criteria: 0.15, Context: 0.75)

### Round 3
**Q:** Que te haria decir "si, esto es lo que queria"?
**A:** Las tres: flujo + informacion + craft
**Ambiguity:** 47% (Goal: 0.45, Constraints: 0.65, Criteria: 0.40, Context: 0.75)

### Round 4 (CONTRARIAN)
**Q:** Si SOLO pudieras mejorar UNA vista, cual elegirias?
**A:** SystemPanel / Brain (operaciones)
**Ambiguity:** 38% (Goal: 0.65, Constraints: 0.65, Criteria: 0.45, Context: 0.80)

### Round 5
**Q:** Que tendrias que poder hacer en menos de 5 segundos que hoy no podes?
**A:** Todo lo anterior (HUD + nav 1-click + alertas proactivas)
**Ambiguity:** 29% (Goal: 0.75, Constraints: 0.65, Criteria: 0.65, Context: 0.80)

### Round 6 (SIMPLIFIER)
**Q:** Es suficiente con solo SystemPanel/Brain, o necesitas infraestructura global como prerequisito?
**A:** Solo SystemPanel/Brain es suficiente
**Ambiguity:** 18% (Goal: 0.90, Constraints: 0.75, Criteria: 0.75, Context: 0.85)

</details>
