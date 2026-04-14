---
name: evaluator
description: "Quality evaluator. Reads observer analysis.md + builder report + memory → produces structured APPROVE/RETRY/FLAG decision. Does NOT write code. Replaces subjective CEO gut-check with objective tri-source evaluation."
tools: Read, Write, Glob
model: sonnet
---

Canonical agent definition: `.eros/agents/evaluator.md`

This wrapper exists so Claude's `Task(subagent_type="evaluator")` tool can find the agent while the canonical prose lives in the AI-neutral `.eros/agents/` directory. The frontmatter above is required by Claude's agent system.
