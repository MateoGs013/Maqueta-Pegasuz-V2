---
name: find-code
description: Find code patterns, components, functions, styles, routes, and any element in any frontend codebase. Use when the user asks to find something, locate code, search for a pattern, discover where something is defined, trace a feature, or understand code flow. Triggers on "find", "where is", "locate", "search for", "which file", "where does", "trace", "look for", "buscar", "donde esta", "encontrar".
---

# Find Code — Universal Frontend Navigator

Quickly locate any code, pattern, component, or definition in the current project.

## Phase 1: Discover project structure

On first use, build a mental map:

1. **Framework**: Check `package.json` → Vue, React, Svelte, Astro, Angular, etc.
2. **Source root**: Usually `src/`, but could be `app/`, `lib/`, or root.
3. **Key directories**: Glob for common patterns:
   - Components: `**/components/`, `**/ui/`
   - Pages/Views: `**/pages/`, `**/views/`, `**/app/`
   - Composables/Hooks: `**/composables/`, `**/hooks/`
   - Stores: `**/stores/`, `**/store/`
   - Config: `**/config/`, `**/constants/`
   - Styles: `**/styles/`, `**/css/`, `**/theme/`
   - Router: `**/router/`, `**/routes/`
   - Utils: `**/utils/`, `**/helpers/`
   - Tests: `**/tests/`, `**/__tests__/`, `**/*.test.*`, `**/*.spec.*`
4. **Docs**: `docs/`, `*.md` files with project knowledge.

## Phase 2: Search strategy by query type

### Component or UI element
```
Glob: **/*.vue, **/*.tsx, **/*.jsx, **/*.svelte matching the name
Then: Read to show structure and props
```

### Function, method, or variable
```
Grep: identifier name across source directory
Focus: composables/hooks, services, utils first
```

### CSS class, style, or design token
```
Grep: class name in *.vue, *.tsx, *.css, *.scss, *.module.css
Check: tailwind.config.*, theme files, CSS custom properties
```

### Route or page
```
Check: router config files, pages/ directory, sitemap config
Grep: path string if specific URL is searched
```

### Configuration or environment
```
Check: config/, *.config.*, .env files
Grep: config key name
```

### Type or interface (TypeScript)
```
Grep: "interface Name" or "type Name" in *.ts, *.d.ts
Check: types/, *.types.ts files
```

### Test
```
Glob: **/*.test.*, **/*.spec.*, **/__tests__/**
Grep: describe/it/test block matching the query
```

## Search tools

- **Glob** — find files by name pattern
- **Grep** — find content inside files
- **Read** — inspect specific files in detail

## Output format

For each result:
```
[TYPE] path/to/file.ext:line
  Context: what's defined here
  Code: relevant snippet (3-5 lines)
```

Group results by category (components, services, styles, config, etc.).
Show the most relevant results first.
If many results, summarize and ask user to narrow down.
