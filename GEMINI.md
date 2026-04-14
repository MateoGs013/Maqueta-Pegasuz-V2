# GEMINI.md — Gemini Adapter for Eros

<!-- Imports below are processed by Gemini CLI as file includes (pulls full content into context). -->
@EROS.md
@AGENTS.md

## Gemini-Specific Quirks

- **Language default with Mateo:** Spanish
- **Hierarchical context:** Gemini CLI auto-loads this file from project root, parent dirs, and `~/.gemini/GEMINI.md` (global). Run `/memory show` to see the merged context, `/memory reload` to refresh.
- **Import syntax:** `@filename.md` inline above pulls in EROS + AGENTS with zero duplication.
- **Sub-context:** place a `GEMINI.md` in any subdirectory to add component-specific instructions that only load when Gemini accesses that directory.

## Gemini Tool Mapping

| Concept (from AGENTS.md) | Gemini equivalent |
|---|---|
| Spawn agent | Run agent as sub-invocation via CLI or explicit context loading |
| Invoke workflow | `Read .eros/workflows/<name>.md` directly |
| File ops | Native file tools (read/write/list) |
| Shell | Native shell tool |

## Gemini Config

See `.gemini/settings.json` for `context.fileName` overrides, tool whitelists, and model selection.

## References

- Settings: `.gemini/settings.json`
- Canonical workflows: `.eros/workflows/`
- Canonical agents: `.eros/agents/`
