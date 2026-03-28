---
name: vue-composable
description: Create Vue 3 composables (use* functions) that adapt to the current project's patterns. Use when the user asks for reusable logic, shared state, reactive utilities, or any "use" function. Triggers on "composable", "useX", "shared logic", "reactive hook", "reusable function", "composable reutilizable".
---

# Vue 3 Composable Creator — Adaptive

Create composables that match the current project's conventions.
n## Prerequisites

- Project must have `package.json` with Vue 3 installed
- If the project has Pinia stores, understand the boundary: composables handle UI logic, Pinia stores handle app state
- No foundation docs required for utility composables

## Relevant docs/ files

- `docs/design-brief.md` -- if composable involves animation, read the motion choreography section
- `docs/motion-spec.md` -- if composable involves GSAP, read for brand easing and timing values
- Existing composables in `src/composables/` -- always read 2-3 before creating a new one

## Phase 1: Discover project context

1. **Existing composables**: Glob for `src/composables/use*.{js,ts}`, `composables/**/*.{js,ts}`, `hooks/use*.{js,ts}`. Read 2-3 to learn patterns.
2. **Language**: Check for `.ts` files → TypeScript. `.js` → plain JS.
3. **State management**: Check for Pinia (`stores/`), Vuex, or composable-based state (module-scope refs).
4. **Style patterns**: Determine if the project uses:
   - Singleton state (module-scope refs shared across instances)
   - Per-instance state (refs inside the function)
   - Store pattern (Pinia/Vuex)
5. **Side effects**: Check what cleanup patterns exist (GSAP contexts, event listeners, observers).
6. **Return style**: Readonly refs? Destructured objects? Full reactive objects?

## Phase 2: Generate the composable

### Base template (adapt to project)

```js
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export function use$ARGUMENTS(options = {}) {
  const state = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const derived = computed(() => /* transform state */)

  async function execute() {
    loading.value = true
    error.value = null
    try {
      // core logic
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  onMounted(() => { /* setup */ })
  onBeforeUnmount(() => { /* cleanup */ })

  return { state, loading, error, derived, execute }
}
```

### Adapt to discovered conventions

| Discovery | Action |
|-----------|--------|
| TypeScript | Add full type annotations, generics, interface for options/return |
| Singleton state exists | Use module-scope refs for shared state |
| Pinia in project | Consider if a store is more appropriate |
| GSAP/animation libs | Create and revert contexts in lifecycle |
| Return readonly refs | Wrap with `readonly()` for consumer safety |
| JSDoc in project | Add JSDoc instead of TypeScript types |

### Universal rules (apply always)

- File: `use<Name>.{js,ts}` — camelCase, prefixed with `use`.
- Named export only: `export function use<Name>`.
- **Always clean up**: revert GSAP contexts, disconnect observers, remove listeners, clear intervals in `onBeforeUnmount`.
- **Single responsibility**: one composable = one concern.
- **Defensive**: handle null/undefined inputs, provide defaults.
- **No DOM mutation**: use template refs and reactive bindings.
- **Document**: params, return value, and usage example.

### Common composable categories

| Type | Pattern | Example |
|------|---------|---------|
| **UI state** | toggle, modal, drawer visibility | `useModal`, `useToggle` |
| **DOM interaction** | resize observer, intersection, scroll | `useResize`, `useScroll` |
| **Animation** | GSAP context, scroll-triggered reveals | `useReveal`, `useParallax` |
| **Form** | validation, dirty tracking, submission | `useForm`, `useValidation` |
| **Media** | breakpoint detection, dark mode | `useBreakpoint`, `useColorScheme` |
| **Storage** | localStorage/sessionStorage sync | `useStorage`, `useLocalState` |

## Phase 3: Validate

1. Matches project's existing composable patterns?
2. Cleans up all side effects?
3. Return type is clear and consistent with project?
4. Could this be a Pinia store instead? (if Pinia exists — composable for UI logic, store for app state)
