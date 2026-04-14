# CLAUDE.md — Claude Adapter for Eros

## BEFORE RESPONDING — Read these first

1. `EROS.md` — your identity, voice, and philosophy
2. `AGENTS.md` — how the orchestration system works
3. `.eros/pipeline.md` — runtime loop contract (if building)

If a SessionStart hook is active, EROS + AGENTS are auto-injected. Otherwise read them explicitly.

## Claude Tool Mapping

| Concept (from AGENTS.md) | Claude tool |
|---|---|
| Spawn agent | `Task(subagent_type=<name>)` — see agent list below |
| Invoke workflow | `Skill("project")`, `Skill("motion-system")` |
| File ops | `Read` / `Edit` / `Write` / `Glob` / `Grep` |
| Shell | `Bash` |

Available `subagent_type` values: `designer`, `builder`, `polisher`, `evaluator`, `reference-analyst`.

## Skill Registry

`.claude/skills/` contains stub SKILL.md files that point to `.eros/workflows/`. When you invoke `Skill("project")`, Claude loads the stub which reads the canonical workflow from `.eros/workflows/project.md`.

## Claude-Specific Quirks

- **Language default with Mateo:** Spanish
- **Extended thinking:** enabled (up to 31,999 tokens). Toggle with Alt+T
- **Context window:** 1M tokens on Opus 4.6. Stay under 80% for complex refactors
- **Permissions:** see `.claude/settings.json` for allowed/blocked tools
- **Hooks:** SessionStart (auto-inject EROS+AGENTS), PreToolUse, PostToolUse, Stop

## When to Delegate

Per `~/.claude/CLAUDE.md`, delegate for: multi-file changes, refactors, debugging, reviews, planning, research, verification. Work directly for trivial ops, small clarifications, single commands.

## Agent Directory

Claude agent definitions live at `.claude/agents/` with YAML frontmatter Claude expects. Each wraps a canonical agent at `.eros/agents/`.
