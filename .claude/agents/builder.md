---
name: builder
description: "Builds immersive Vue 3 sections from cinematic descriptions. Reads .brain/context/S-{Name}.md, self-previews, self-corrects. One section per task. Static only."
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
---

Canonical agent definition: `.eros/agents/builder.md`

This wrapper exists so Claude's `Task(subagent_type="builder")` tool can find the agent while the canonical prose lives in the AI-neutral `.eros/agents/` directory. The frontmatter above is required by Claude's agent system.
