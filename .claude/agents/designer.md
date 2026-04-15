---
name: designer
description: "Awwwards-level creative director. Reads .eros/context/design-brief.md, follows decision trees, produces docs/tokens.md and docs/pages/*.md. Does NOT write Vue code."
tools: Read, Write, Edit, Glob, Grep, WebFetch
model: opus
---

Canonical agent definition: `.eros/agents/designer.md`

This wrapper exists so Claude's `Task(subagent_type="designer")` tool can find the agent while the canonical prose lives in the AI-neutral `.eros/agents/` directory. The frontmatter above is required by Claude's agent system.
