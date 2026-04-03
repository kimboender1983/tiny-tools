<script setup lang="ts">
import {
  Braces,
  Download,
  Eraser,
  Minimize2,
  AlertTriangle,
  WrapText,
  TreePine,
  Wrench,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowDownAZ,
  Link,
  Unlink,
} from 'lucide-vue-next';
import type { TreeNode } from '~/composables/useJsonFormatter';

const {
  input,
  indentStyle,
  minifyMode,
  showTreeView,
  formattedOutput,
  error,
  isValid,
  treeData,
  format,
  minify,
  clear,
  tryFix,
  sortKeys,
} = useJsonFormatter();

// --- Stats ---
function formatSize(str: string): string {
  const bytes = new Blob([str]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const inputStats = computed(() => {
  if (!input.value) return null;
  const lines = input.value.split('\n').length;
  return { lines, size: formatSize(input.value) };
});

const outputStats = computed(() => {
  if (!formattedOutput.value) return null;
  const lines = formattedOutput.value.split('\n').length;
  return { lines, size: formatSize(formattedOutput.value) };
});

// --- Line numbers ---
const inputLines = computed(() => {
  const text = input.value || '';
  return Math.max(text.split('\n').length, 1);
});

const outputLines = computed(() => {
  const text = formattedOutput.value || '';
  return Math.max(text.split('\n').length, 1);
});

// --- Syntax highlighting ---
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightJson(json: string): string {
  if (!json) return '';

  // Process line by line, token by token — escape HTML inside tokens, then wrap with spans
  // This avoids the problem of regexes breaking on HTML entities inside strings
  const result: string[] = [];

  // Match JSON tokens: strings, numbers, booleans, null, and everything else
  const tokenRegex = /("(?:[^"\\]|\\.)*")|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|\b(true|false)\b|\b(null)\b|([^"tfn\d-]+)/g;

  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = tokenRegex.exec(json)) !== null) {
    const [full, str, num, bool, nul] = match;

    if (str) {
      // Check if this string is a key (followed by colon)
      const after = json.slice(match.index + full.length);
      const isKey = /^\s*:/.test(after);
      const cls = isKey ? 'json-key' : 'json-string';
      result.push(`<span class="${cls}">${escapeHtml(str)}</span>`);
    } else if (num) {
      result.push(`<span class="json-number">${escapeHtml(num)}</span>`);
    } else if (bool) {
      result.push(`<span class="json-boolean">${escapeHtml(bool)}</span>`);
    } else if (nul) {
      result.push(`<span class="json-null">${escapeHtml(nul)}</span>`);
    } else {
      // Structural chars: { } [ ] : , whitespace
      result.push(escapeHtml(full));
    }

    lastIndex = match.index + full.length;
  }

  // Append any remaining text
  if (lastIndex < json.length) {
    result.push(escapeHtml(json.slice(lastIndex)));
  }

  return result.join('');
}

const highlightedOutput = computed(() => highlightJson(formattedOutput.value));

// --- File drop ---
const isDragging = ref(false);
let dragCounter = 0;

function onDragEnter(e: DragEvent) {
  e.preventDefault();
  dragCounter++;
  isDragging.value = true;
}

function onDragLeave(e: DragEvent) {
  e.preventDefault();
  dragCounter--;
  if (dragCounter === 0) isDragging.value = false;
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  dragCounter = 0;
  isDragging.value = false;
  const files = e.dataTransfer?.files;
  if (!files?.length) return;
  const file = files[0];
  if (!file.name.endsWith('.json') && file.type !== 'application/json') return;
  readFile(file);
}

function readFile(file: File) {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      input.value = reader.result;
    }
  };
  reader.readAsText(file);
}

// --- Download ---
function downloadOutput() {
  if (!formattedOutput.value) return;
  const blob = new Blob([formattedOutput.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = minifyMode.value ? 'output.min.json' : 'output.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Keyboard shortcut ---
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
    e.preventDefault();
    if (formattedOutput.value) {
      navigator.clipboard.writeText(formattedOutput.value);
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});

// --- Textarea sync scroll ---
const inputTextarea = ref<HTMLTextAreaElement | null>(null);
const inputGutter = ref<HTMLElement | null>(null);
const inputHighlight = ref<HTMLElement | null>(null);
const outputPre = ref<HTMLElement | null>(null);
const outputGutter = ref<HTMLElement | null>(null);
const treeContainer = ref<HTMLElement | null>(null);

// Get whichever output element is currently scrollable
const activeOutputEl = computed(() => treeContainer.value ?? outputPre.value);

// Highlighted version of the input for the backdrop
const highlightedInput = computed(() => highlightJson(input.value));

const scrollLock = ref(false);
let scrollSyncSource: 'input' | 'output' | null = null;

function syncScrollTo(target: HTMLElement | null, gutter: HTMLElement | null, scrollTop: number) {
  if (target) target.scrollTop = scrollTop;
  if (gutter) gutter.scrollTop = scrollTop;
}

function syncInputScroll() {
  if (!inputTextarea.value) return;
  const st = inputTextarea.value.scrollTop;

  // Always sync gutter and highlight backdrop
  if (inputGutter.value) inputGutter.value.scrollTop = st;
  if (inputHighlight.value) {
    inputHighlight.value.scrollTop = st;
    inputHighlight.value.scrollLeft = inputTextarea.value.scrollLeft;
  }

  // Scroll lock: sync output to match input
  const outEl = activeOutputEl.value;
  if (scrollLock.value && scrollSyncSource !== 'output' && outEl) {
    scrollSyncSource = 'input';
    const inputMax = inputTextarea.value.scrollHeight - inputTextarea.value.clientHeight;
    const pct = inputMax > 0 ? st / inputMax : 0;
    const outputMax = outEl.scrollHeight - outEl.clientHeight;
    outEl.scrollTop = pct * outputMax;
    if (outputGutter.value) outputGutter.value.scrollTop = outEl.scrollTop;
    requestAnimationFrame(() => { scrollSyncSource = null; });
  }
}

function syncOutputScroll() {
  const outEl = activeOutputEl.value;
  if (!outEl) return;
  const st = outEl.scrollTop;

  // Always sync gutter (only relevant for pre view, not tree)
  if (outputGutter.value) outputGutter.value.scrollTop = st;

  // Scroll lock: sync input to match output
  if (scrollLock.value && scrollSyncSource !== 'input' && inputTextarea.value) {
    scrollSyncSource = 'output';
    const outputMax = outEl.scrollHeight - outEl.clientHeight;
    const pct = outputMax > 0 ? st / outputMax : 0;
    const inputMax = inputTextarea.value.scrollHeight - inputTextarea.value.clientHeight;
    const inputSt = pct * inputMax;
    inputTextarea.value.scrollTop = inputSt;
    if (inputGutter.value) inputGutter.value.scrollTop = inputSt;
    if (inputHighlight.value) inputHighlight.value.scrollTop = inputSt;
    requestAnimationFrame(() => { scrollSyncSource = null; });
  }
}

// --- Tree view toggle ---
function toggleNode(node: TreeNode) {
  node.expanded = !node.expanded;
}

function setAllExpanded(node: TreeNode | null, expanded: boolean) {
  if (!node) return;
  node.expanded = expanded;
  node.children?.forEach(c => setAllExpanded(c, expanded));
}

// --- Scroll to top/bottom ---
function scrollInputToTop() {
  if (inputTextarea.value) {
    inputTextarea.value.scrollTop = 0;
    syncInputScroll();
  }
}

function scrollInputToBottom() {
  if (inputTextarea.value) {
    inputTextarea.value.scrollTop = inputTextarea.value.scrollHeight;
    syncInputScroll();
  }
}

function scrollOutputToTop() {
  const outEl = activeOutputEl.value;
  if (outEl) {
    outEl.scrollTop = 0;
    syncOutputScroll();
  }
}

function scrollOutputToBottom() {
  const outEl = activeOutputEl.value;
  if (outEl) {
    outEl.scrollTop = outEl.scrollHeight;
    syncOutputScroll();
  }
}

// Track scroll position for showing scroll buttons
const inputScrollTop = ref(0);
const outputScrollTop = ref(0);
const inputAtBottom = ref(false);
const outputAtBottom = ref(false);

function onInputScroll() {
  if (!inputTextarea.value) return;
  inputScrollTop.value = inputTextarea.value.scrollTop;
  inputAtBottom.value = inputTextarea.value.scrollTop + inputTextarea.value.clientHeight >= inputTextarea.value.scrollHeight - 10;
  syncInputScroll();
}

function onOutputScroll() {
  if (!outputPre.value) return;
  outputScrollTop.value = outputPre.value.scrollTop;
  outputAtBottom.value = outputPre.value.scrollTop + outputPre.value.clientHeight >= outputPre.value.scrollHeight - 10;
  syncOutputScroll();
}

</script>

<template>
  <div class="flex flex-col gap-0 h-[calc(100vh-12rem)]">
    <!-- Toolbar -->
    <div
      class="flex flex-wrap items-center gap-2 px-3 py-2 bg-surface border border-surface-border rounded-t-xl"
    >
      <!-- Indent selector -->
      <div class="flex items-center gap-1.5">
        <label for="indent-select" class="text-xs font-medium text-content-muted">Indent</label>
        <select
          id="indent-select"
          v-model="indentStyle"
          class="text-sm bg-surface-secondary border border-surface-border rounded-md px-2 py-1 text-content-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        >
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="tab">Tab</option>
        </select>
      </div>

      <div class="w-px h-5 bg-surface-border" />

      <!-- Action buttons -->
      <button type="button" class="toolbar-btn" title="Format (pretty-print)" @click="format">
        <WrapText :size="15" />
        <span class="hidden sm:inline">Format</span>
      </button>

      <button type="button" class="toolbar-btn" title="Minify" @click="minify">
        <Minimize2 :size="15" />
        <span class="hidden sm:inline">Minify</span>
      </button>

      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'toolbar-btn-active': showTreeView }"
        title="Toggle tree view"
        @click="showTreeView = !showTreeView"
      >
        <TreePine :size="15" />
        <span class="hidden sm:inline">Tree</span>
      </button>

      <button type="button" class="toolbar-btn" title="Sort keys alphabetically" :disabled="!isValid" @click="sortKeys">
        <ArrowDownAZ :size="15" />
        <span class="hidden sm:inline">Sort Keys</span>
      </button>

      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'toolbar-btn-active': scrollLock }"
        :title="scrollLock ? 'Unlock synchronized scrolling' : 'Lock synchronized scrolling'"
        @click="scrollLock = !scrollLock"
      >
        <Link v-if="scrollLock" :size="15" />
        <Unlink v-else :size="15" />
        <span class="hidden sm:inline">Scroll Lock</span>
      </button>

      <div class="w-px h-5 bg-surface-border" />

      <CopyButton :text="formattedOutput" label="Copy" />

      <button type="button" class="toolbar-btn" title="Download output" :disabled="!formattedOutput" @click="downloadOutput">
        <Download :size="15" />
        <span class="hidden sm:inline">Download</span>
      </button>

      <button type="button" class="toolbar-btn" title="Clear all" @click="clear">
        <Eraser :size="15" />
        <span class="hidden sm:inline">Clear</span>
      </button>

      <!-- Validity indicator -->
      <div class="ml-auto flex items-center gap-1.5">
        <template v-if="input.trim()">
          <span
            class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
            :class="isValid
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'"
          >
            <Braces :size="12" />
            {{ isValid ? 'Valid' : 'Invalid' }}
          </span>
        </template>
      </div>
    </div>

    <!-- Error panel -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1 max-h-0"
      enter-to-class="opacity-100 translate-y-0 max-h-24"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 max-h-24"
      leave-to-class="opacity-0 -translate-y-1 max-h-0"
    >
      <div
        v-if="error"
        class="flex items-center gap-3 px-4 py-2.5 bg-red-50 border-x border-red-200 text-sm dark:bg-red-900/10 dark:border-red-900/30"
      >
        <AlertTriangle :size="16" class="text-red-500 shrink-0" />
        <p class="text-red-700 dark:text-red-400 flex-1 min-w-0">
          <span v-if="error.line" class="font-mono font-medium">Line {{ error.line }}: </span>
          {{ error.message }}
        </p>
        <button
          type="button"
          class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors shrink-0"
          @click="tryFix"
        >
          <Wrench :size="12" />
          Try to fix
        </button>
      </div>
    </Transition>

    <!-- Split pane content -->
    <div
      class="flex-1 min-h-0 border border-t-0 border-surface-border rounded-b-xl overflow-hidden"
      :class="{ 'border-t border-t-surface-border': !error }"
    >
      <UiSplitPane>
        <template #left>
          <!-- Input editor -->
          <div
            class="relative h-full flex"
            :class="isDragging ? 'ring-2 ring-inset ring-brand-500/50 bg-brand-50/30' : ''"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @dragover="onDragOver"
            @drop="onDrop"
          >
            <!-- Line numbers gutter -->
            <div
              ref="inputGutter"
              class="shrink-0 w-12 py-3 pr-2 text-right text-xs font-mono leading-[1.625rem] text-content-faint select-none overflow-hidden bg-surface-secondary border-r border-surface-border"
              aria-hidden="true"
            >
              <div v-for="n in inputLines" :key="n">{{ n }}</div>
            </div>

            <!-- Highlight backdrop + textarea overlay -->
            <div class="relative flex-1 h-full overflow-hidden">
              <pre
                ref="inputHighlight"
                class="absolute inset-0 py-3 px-3 font-mono text-sm leading-[1.625rem] whitespace-pre overflow-hidden pointer-events-none m-0"
                aria-hidden="true"
              ><code v-html="highlightedInput" /></pre>
              <textarea
                ref="inputTextarea"
                v-model="input"
                class="relative w-full h-full py-3 px-3 font-mono text-sm leading-[1.625rem] bg-transparent text-transparent caret-caret resize-none focus:outline-none placeholder-placeholder"
                placeholder="Paste JSON here or drop a .json file"
                spellcheck="false"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                wrap="off"
                @scroll="onInputScroll"
              />
            </div>

            <!-- Scroll buttons (input) -->
            <div class="absolute bottom-2 right-2 flex flex-col gap-1 z-10">
              <button
                v-if="inputScrollTop > 100"
                type="button"
                class="scroll-btn"
                title="Scroll to top"
                @click="scrollInputToTop"
              >
                <ArrowUpToLine :size="14" />
              </button>
              <button
                v-if="input && !inputAtBottom"
                type="button"
                class="scroll-btn"
                title="Scroll to bottom"
                @click="scrollInputToBottom"
              >
                <ArrowDownToLine :size="14" />
              </button>
            </div>

            <!-- Drop overlay -->
            <Transition
              enter-active-class="transition-opacity duration-150"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-100"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-if="isDragging"
                class="absolute inset-0 flex items-center justify-center bg-brand-50/80 backdrop-blur-sm pointer-events-none"
              >
                <div class="flex flex-col items-center gap-2 text-brand-accent">
                  <Download :size="28" />
                  <span class="text-sm font-medium">Drop .json file</span>
                </div>
              </div>
            </Transition>
          </div>
        </template>

        <template #right>
          <!-- Output / tree view -->
          <div class="relative h-full flex overflow-hidden">
            <template v-if="showTreeView && treeData">
              <!-- Tree view controls -->
              <div class="absolute top-0 right-0 z-10 flex gap-1 p-1.5">
                <button type="button" class="scroll-btn text-[10px] !rounded-md !px-1.5" @click="setAllExpanded(treeData, true)">
                  Expand all
                </button>
                <button type="button" class="scroll-btn text-[10px] !rounded-md !px-1.5" @click="setAllExpanded(treeData, false)">
                  Collapse all
                </button>
              </div>
              <!-- Tree view -->
              <div
                ref="treeContainer"
                class="flex-1 h-full overflow-auto p-3 font-mono text-sm bg-surface-secondary"
                @scroll="onOutputScroll"
              >
                <ToolsJsonTreeNode :node="treeData" :is-root="true" @toggle="toggleNode" />
              </div>
            </template>

            <template v-else>
              <!-- Formatted output with syntax highlighting -->
              <div
                ref="outputGutter"
                class="shrink-0 w-12 py-3 pr-2 text-right text-xs font-mono leading-[1.625rem] text-content-faint select-none overflow-hidden bg-surface-secondary border-r border-surface-border"
                aria-hidden="true"
              >
                <template v-if="formattedOutput">
                  <div v-for="n in outputLines" :key="n">{{ n }}</div>
                </template>
              </div>

              <pre
                ref="outputPre"
                class="flex-1 h-full overflow-auto py-3 px-3 font-mono text-sm leading-[1.625rem] whitespace-pre bg-transparent text-content"
                @scroll="onOutputScroll"
              ><code v-if="formattedOutput" v-html="highlightedOutput" /><span v-else class="text-content-faint italic">Formatted output will appear here</span></pre>

              <!-- Scroll buttons (output) -->
              <div class="absolute bottom-2 right-2 flex flex-col gap-1 z-10">
                <button
                  v-if="outputScrollTop > 100"
                  type="button"
                  class="scroll-btn"
                  title="Scroll to top"
                  @click="scrollOutputToTop"
                >
                  <ArrowUpToLine :size="14" />
                </button>
                <button
                  v-if="formattedOutput && !outputAtBottom"
                  type="button"
                  class="scroll-btn"
                  title="Scroll to bottom"
                  @click="scrollOutputToBottom"
                >
                  <ArrowDownToLine :size="14" />
                </button>
              </div>
            </template>
          </div>
        </template>
      </UiSplitPane>
    </div>

    <!-- Status bar -->
    <div class="flex items-center justify-between px-3 py-1 text-[11px] font-mono text-content-muted bg-surface-secondary border border-t-0 border-surface-border rounded-b-xl">
      <span v-if="inputStats">
        Input: {{ inputStats.lines }} lines &middot; {{ inputStats.size }}
      </span>
      <span v-else class="text-content-faint">No input</span>
      <span v-if="outputStats">
        Output: {{ outputStats.lines }} lines &middot; {{ outputStats.size }}
      </span>
      <span v-else />
    </div>
  </div>
</template>


<style scoped>
.toolbar-btn {
  @apply inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg
         text-content-tertiary hover:bg-surface-secondary hover:text-content
         transition-colors duration-150
         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent;
}

.toolbar-btn-active {
  @apply bg-brand-50 text-brand-accent hover:bg-brand-100;
}

.scroll-btn {
  @apply p-1.5 rounded-full bg-surface/90 border border-surface-border shadow-sm
         text-content-muted hover:text-content hover:bg-surface-secondary
         backdrop-blur-sm transition-colors duration-150 cursor-pointer;
}
</style>
