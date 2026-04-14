---
name: polisher
description: "Motion engineer + visual QA auditor. Reads .brain/context/motion.md, implements composables, preloader, transitions. Validates with screenshots at 4 breakpoints."
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
---

Canonical agent definition: `.eros/agents/polisher.md`

This wrapper exists so Claude's `Task(subagent_type="polisher")` tool can find the agent while the canonical prose lives in the AI-neutral `.eros/agents/` directory. The frontmatter above is required by Claude's agent system.
