import { reactive, computed, watch } from 'vue'

// ── Module-level state (shared across all components that import this) ──

const staged = reactive(new Map())
const STORAGE_KEY = 'workshop-staging'

// ── localStorage persistence ──

function saveDrafts() {
  const data = {}
  for (const [filePath, entry] of staged.entries()) {
    if (entry.originalContent !== entry.draftContent) {
      data[filePath] = { type: entry.type, draft: entry.draftContent, ts: entry.timestamp }
    }
  }
  try {
    if (Object.keys(data).length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch { /* quota exceeded — ignore */ }
}

function loadSavedDrafts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

// ── Helpers ──

function lineDiff(original, draft) {
  const a = original.split('\n')
  const b = draft.split('\n')
  const changes = []
  const maxLen = Math.max(a.length, b.length)

  for (let i = 0; i < maxLen; i++) {
    const lineA = a[i]
    const lineB = b[i]
    if (lineA === lineB) {
      changes.push({ type: 'same', line: i + 1, text: lineA })
    } else if (lineA == null) {
      changes.push({ type: 'add', line: i + 1, text: lineB })
    } else if (lineB == null) {
      changes.push({ type: 'remove', line: i + 1, text: lineA })
    } else {
      changes.push({ type: 'remove', line: i + 1, text: lineA })
      changes.push({ type: 'add', line: i + 1, text: lineB })
    }
  }

  return changes
}

// ── History log ──

const history = reactive([])
const MAX_HISTORY = 30

function logAction(action, filePath, detail = '') {
  history.unshift({ action, filePath, detail, ts: Date.now() })
  if (history.length > MAX_HISTORY) history.pop()
}

// ── Composable ──

export function useWorkshopStaging() {

  const dirtyCount = computed(() => {
    let count = 0
    for (const entry of staged.values()) {
      if (entry.originalContent !== entry.draftContent) count++
    }
    return count
  })

  const dirtyFiles = computed(() => {
    const files = []
    for (const [filePath, entry] of staged.entries()) {
      if (entry.originalContent !== entry.draftContent) {
        files.push({ path: filePath, type: entry.type, timestamp: entry.timestamp })
      }
    }
    return files
  })

  // Load a file into the staging layer
  async function stageFile(filePath, type = 'tokens') {
    // If already staged, return existing entry
    if (staged.has(filePath)) return staged.get(filePath)

    const res = await fetch(`/__workshop/read?path=${encodeURIComponent(filePath)}`)
    if (!res.ok) throw new Error(`Failed to read ${filePath}`)
    const { content } = await res.json()

    // Check if we have a saved draft from a previous session
    const saved = loadSavedDrafts()
    const savedDraft = saved?.[filePath]

    const entry = reactive({
      filePath,
      type,
      originalContent: content,
      draftContent: savedDraft ? savedDraft.draft : content,
      timestamp: savedDraft ? savedDraft.ts : Date.now(),
    })

    staged.set(filePath, entry)

    if (savedDraft) {
      logAction('restore', filePath, 'Restored from previous session')
    }

    return entry
  }

  // Update in-memory draft (does NOT write to disk)
  function updateDraft(filePath, newContent) {
    const entry = staged.get(filePath)
    if (!entry) return
    entry.draftContent = newContent
    entry.timestamp = Date.now()
    saveDrafts()
  }

  // Check if a file has unsaved changes
  function isDirty(filePath) {
    const entry = staged.get(filePath)
    if (!entry) return false
    return entry.originalContent !== entry.draftContent
  }

  // Get diff for a staged file
  function getDiff(filePath) {
    const entry = staged.get(filePath)
    if (!entry) return []
    return lineDiff(entry.originalContent, entry.draftContent)
  }

  // Get a summary of changes (only changed lines)
  function getDiffSummary(filePath) {
    return getDiff(filePath).filter((c) => c.type !== 'same')
  }

  // Apply staged changes to disk for selected files
  async function applyChanges(filePaths) {
    const results = []
    for (const filePath of filePaths) {
      const entry = staged.get(filePath)
      if (!entry || entry.originalContent === entry.draftContent) continue

      const res = await fetch('/__workshop/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content: entry.draftContent }),
      })

      if (res.ok) {
        entry.originalContent = entry.draftContent
        entry.timestamp = Date.now()
        results.push({ path: filePath, ok: true })
        logAction('apply', filePath)
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        results.push({ path: filePath, ok: false, error: err.error })
        logAction('error', filePath, err.error)
      }
    }
    saveDrafts()
    return results
  }

  // Apply all dirty changes
  async function applyAll() {
    return applyChanges(dirtyFiles.value.map((f) => f.path))
  }

  // Discard changes for selected files (revert draft to original)
  function discardChanges(filePaths) {
    for (const filePath of filePaths) {
      const entry = staged.get(filePath)
      if (entry) {
        entry.draftContent = entry.originalContent
        entry.timestamp = Date.now()
        logAction('discard', filePath)
      }
    }
    saveDrafts()
  }

  // Discard all changes
  function discardAll() {
    for (const [filePath, entry] of staged.entries()) {
      if (entry.originalContent !== entry.draftContent) {
        logAction('discard', filePath)
      }
      entry.draftContent = entry.originalContent
    }
    saveDrafts()
  }

  // Re-read a file from disk (refresh original)
  async function refreshFile(filePath) {
    const entry = staged.get(filePath)
    if (!entry) return

    const res = await fetch(`/__workshop/read?path=${encodeURIComponent(filePath)}`)
    if (!res.ok) return
    const { content } = await res.json()
    entry.originalContent = content
    if (!isDirty(filePath)) entry.draftContent = content
    logAction('refresh', filePath)
  }

  // Get staged entry for a file
  function getStaged(filePath) {
    return staged.get(filePath) ?? null
  }

  return {
    staged,
    history,
    dirtyCount,
    dirtyFiles,
    stageFile,
    updateDraft,
    isDirty,
    getDiff,
    getDiffSummary,
    applyChanges,
    applyAll,
    discardChanges,
    discardAll,
    refreshFile,
    getStaged,
  }
}
