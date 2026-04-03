<script setup>
import { ref, computed } from 'vue'
import { useWorkshopStaging } from '@/composables/useWorkshopStaging.js'

const emit = defineEmits(['close', 'applied'])

const staging = useWorkshopStaging()
const selected = ref(new Set(staging.dirtyFiles.value.map((f) => f.path)))
const applying = ref(false)

const files = computed(() =>
  staging.dirtyFiles.value.map((f) => ({
    ...f,
    diff: staging.getDiff(f.path),
    summary: staging.getDiffSummary(f.path),
  }))
)

const selectedCount = computed(() => selected.value.size)

function toggle(path) {
  const s = new Set(selected.value)
  s.has(path) ? s.delete(path) : s.add(path)
  selected.value = s
}

function selectAll() {
  selected.value = new Set(files.value.map((f) => f.path))
}

function selectNone() {
  selected.value = new Set()
}

async function apply() {
  if (!selectedCount.value) return
  applying.value = true
  const paths = [...selected.value]
  const results = await staging.applyChanges(paths)
  applying.value = false
  const failed = results.filter((r) => !r.ok)
  if (failed.length) {
    console.error('DiffViewer: failed to apply:', failed)
  }
  emit('applied', results)
  // Close if nothing left
  if (!staging.dirtyCount.value) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="diff-backdrop" @click.self="emit('close')">
      <div class="diff-modal">
        <!-- Header -->
        <div class="diff-header">
          <div class="diff-header-left">
            <h2 class="diff-title">Revisar cambios</h2>
            <span class="diff-count">{{ files.length }} archivo{{ files.length !== 1 ? 's' : '' }}</span>
          </div>
          <div class="diff-header-right">
            <button class="diff-link" @click="selectAll">Todos</button>
            <button class="diff-link" @click="selectNone">Ninguno</button>
            <button class="diff-close" @click="emit('close')">&#10005;</button>
          </div>
        </div>

        <!-- File diffs -->
        <div class="diff-scroll">
          <div v-for="file in files" :key="file.path" class="diff-file">
            <div class="diff-file-head">
              <label class="diff-check-label">
                <input
                  type="checkbox"
                  :checked="selected.has(file.path)"
                  class="diff-check"
                  @change="toggle(file.path)"
                />
                <span class="diff-file-path">{{ file.path }}</span>
              </label>
              <span class="diff-file-stats">
                <span class="diff-stat diff-stat--add">+{{ file.summary.filter(c => c.type === 'add').length }}</span>
                <span class="diff-stat diff-stat--rm">-{{ file.summary.filter(c => c.type === 'remove').length }}</span>
              </span>
            </div>
            <div class="diff-lines">
              <template v-for="(line, i) in file.diff" :key="i">
                <div
                  v-if="line.type !== 'same'"
                  class="diff-line"
                  :class="`diff-line--${line.type}`"
                >
                  <span class="diff-ln">{{ line.line }}</span>
                  <span class="diff-prefix">{{ line.type === 'add' ? '+' : '-' }}</span>
                  <span class="diff-text">{{ line.text }}</span>
                </div>
                <!-- Show context around changes: 1 line before/after -->
                <div
                  v-else-if="
                    file.diff[i - 1]?.type !== 'same' ||
                    file.diff[i + 1]?.type !== 'same'
                  "
                  class="diff-line diff-line--ctx"
                >
                  <span class="diff-ln">{{ line.line }}</span>
                  <span class="diff-prefix">&nbsp;</span>
                  <span class="diff-text">{{ line.text }}</span>
                </div>
                <!-- Separator between non-adjacent hunks -->
                <div
                  v-else-if="
                    i > 0 &&
                    file.diff[i - 1]?.type === 'same' &&
                    file.diff[i - 2]?.type !== 'same' &&
                    file.diff[i + 1]?.type === 'same' &&
                    file.diff[i + 2]?.type !== 'same'
                  "
                  class="diff-sep"
                >···</div>
              </template>
            </div>
          </div>

          <p v-if="!files.length" class="diff-empty">No hay cambios pendientes.</p>
        </div>

        <!-- Footer -->
        <div class="diff-footer">
          <button class="diff-btn diff-btn--discard" @click="staging.discardAll(); emit('close')">Descartar todo</button>
          <div class="diff-footer-right">
            <span class="diff-sel-count">{{ selectedCount }} seleccionado{{ selectedCount !== 1 ? 's' : '' }}</span>
            <button
              class="diff-btn diff-btn--apply"
              :disabled="!selectedCount || applying"
              @click="apply"
            >{{ applying ? 'Aplicando...' : 'Aplicar seleccionados' }}</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.diff-backdrop {
  position: fixed; inset: 0; z-index: 9500;
  background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
}

.diff-modal {
  width: 100%; max-width: 800px; max-height: 80vh;
  background: var(--bg); border: 1px solid var(--line-strong);
  display: flex; flex-direction: column;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
}

/* ── Header ── */
.diff-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--line); flex-shrink: 0;
}
.diff-header-left { display: flex; align-items: center; gap: 12px; }
.diff-header-right { display: flex; align-items: center; gap: 10px; }
.diff-title { font: 600 14px var(--font-display); color: var(--text); letter-spacing: -0.02em; }
.diff-count { font: 400 10px var(--font-mono); color: var(--text-muted); }
.diff-link {
  padding: 0; border: 0; background: transparent;
  color: var(--text-dim); font: 500 10px var(--font-mono); cursor: pointer;
  letter-spacing: 0.04em; text-transform: uppercase;
}
.diff-link:hover { color: var(--info); }
.diff-close {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--line); background: transparent;
  color: var(--text-dim); cursor: pointer; font-size: 14px;
}
.diff-close:hover { color: var(--text); border-color: var(--line-strong); }

/* ── Scroll area ── */
.diff-scroll { flex: 1; overflow-y: auto; min-height: 0; }

.diff-file { border-bottom: 1px solid var(--line); }

.diff-file-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px; background: var(--surface); position: sticky; top: 0; z-index: 1;
}
.diff-check-label { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.diff-check { accent-color: var(--info); width: 14px; height: 14px; cursor: pointer; }
.diff-file-path { font: 500 11px var(--font-mono); color: var(--text); }
.diff-file-stats { display: flex; gap: 8px; }
.diff-stat { font: 600 10px var(--font-mono); }
.diff-stat--add { color: var(--success); }
.diff-stat--rm { color: var(--error); }

/* ── Diff lines ── */
.diff-lines { font: 400 11px/1.6 var(--font-mono); }

.diff-line {
  display: flex; gap: 0; padding: 0 20px;
  white-space: pre-wrap; word-break: break-all;
}
.diff-line--add { background: rgba(62, 232, 181, 0.08); color: var(--success); }
.diff-line--remove { background: rgba(255, 64, 64, 0.08); color: var(--error); }
.diff-line--ctx { color: var(--text-dim); }

.diff-ln {
  width: 40px; flex-shrink: 0; text-align: right; padding-right: 8px;
  color: var(--text-dim); user-select: none;
}
.diff-prefix { width: 16px; flex-shrink: 0; text-align: center; user-select: none; }
.diff-text { flex: 1; min-width: 0; }

.diff-sep {
  padding: 4px 20px; color: var(--text-dim); font: 400 10px var(--font-mono);
  text-align: center; background: var(--surface); user-select: none;
}

.diff-empty {
  padding: 60px 20px; text-align: center;
  color: var(--text-dim); font: 400 11px var(--font-mono);
}

/* ── Footer ── */
.diff-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border-top: 1px solid var(--line); flex-shrink: 0;
}
.diff-footer-right { display: flex; align-items: center; gap: 12px; }
.diff-sel-count { font: 400 10px var(--font-mono); color: var(--text-dim); }

.diff-btn {
  padding: 7px 16px; border: 1px solid var(--line-strong); background: transparent;
  font: 600 10px var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; transition: color 120ms, border-color 120ms, background 120ms;
}
.diff-btn--discard { color: var(--text-dim); }
.diff-btn--discard:hover { color: var(--error); border-color: rgba(255, 64, 64, 0.3); }
.diff-btn--apply { color: var(--success); border-color: rgba(62, 232, 181, 0.3); }
.diff-btn--apply:hover { background: var(--success-soft); }
.diff-btn--apply:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 768px) {
  .diff-backdrop { padding: 16px; }
  .diff-modal { max-height: 90vh; }
}
</style>
