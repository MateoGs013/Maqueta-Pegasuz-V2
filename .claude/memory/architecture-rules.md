---
name: Architecture Rules
description: Locked architectural patterns for Pegasuz multi-tenant and standalone Vue 3 projects
type: feedback
---

Frontend chain is locked: View -> Store -> Service -> api.js. No shortcuts.

**Why:** Tenant isolation and maintainability require strict layer separation. Previous projects had bugs from views calling API directly.

**How to apply:**
- Never import axios outside src/config/api.js
- Never call services from views (always through stores)
- Never parse JSON in .vue files (do it in store or service)
- Always use VITE_CLIENT_SLUG (never hardcode slugs)
- Always use resolveImageUrl() for images
- CMS content (contentStore.get) is separate from feature data (feature stores)
- Every store has loading + error states
