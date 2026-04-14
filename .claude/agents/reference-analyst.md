---
name: reference-analyst
description: Analyzes captured reference screenshots frame by frame — receives screenshot paths and manifest from CEO. Produces docs/reference-analysis.md with palette insights, typography patterns, layout patterns, motion patterns, borrow/avoid lists. DO NOT invoke without screenshots at _ref-captures/{domain}/. DO NOT pass the project brief — analyst sees only what it observes, no bias.
tools: Read, Glob, Grep, WebFetch, Write
model: sonnet
---

Canonical agent definition: `.eros/agents/reference-analyst.md`

This wrapper exists so Claude's `Task(subagent_type="reference-analyst")` tool can find the agent while the canonical prose lives in the AI-neutral `.eros/agents/` directory. The frontmatter above is required by Claude's agent system.
