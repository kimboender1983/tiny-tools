<script setup lang="ts">
    import {
        AlertTriangle,
        ArrowLeftRight,
        ChevronDown,
        ChevronUp,
        Eraser,
        FileJson,
        FileText,
        Minus,
        Plus,
    } from "lucide-vue-next";
    import type { DiffLine } from "~/composables/useJsonDiff";

    const {
        leftInput,
        rightInput,
        mode,
        ignoreWhitespace,
        diffResult,
        jsonError,
        stats,
        currentDiffIndex,
        totalDiffs,
        currentDiffRow,
        goToNextDiff,
        goToPrevDiff,
        swap,
        clear,
        generateDiffText,
    } = useJsonDiff();

    const showDiff = computed(() => diffResult.value.left.length > 0);

    // --- File drop ---
    const isDraggingLeft = ref(false);
    const isDraggingRight = ref(false);
    let dragCounterLeft = 0;
    let dragCounterRight = 0;

    function onDragEnterLeft(e: DragEvent) {
        e.preventDefault();
        dragCounterLeft++;
        isDraggingLeft.value = true;
    }
    function onDragLeaveLeft(e: DragEvent) {
        e.preventDefault();
        dragCounterLeft--;
        if (dragCounterLeft === 0) isDraggingLeft.value = false;
    }
    function onDragEnterRight(e: DragEvent) {
        e.preventDefault();
        dragCounterRight++;
        isDraggingRight.value = true;
    }
    function onDragLeaveRight(e: DragEvent) {
        e.preventDefault();
        dragCounterRight--;
        if (dragCounterRight === 0) isDraggingRight.value = false;
    }
    function onDragOver(e: DragEvent) {
        e.preventDefault();
    }

    function onDropLeft(e: DragEvent) {
        e.preventDefault();
        dragCounterLeft = 0;
        isDraggingLeft.value = false;
        readDroppedFile(e, "left");
    }
    function onDropRight(e: DragEvent) {
        e.preventDefault();
        dragCounterRight = 0;
        isDraggingRight.value = false;
        readDroppedFile(e, "right");
    }

    function readDroppedFile(e: DragEvent, side: "left" | "right") {
        const files = e.dataTransfer?.files;
        if (!files?.length) return;
        const file = files[0];
        const validExts = [
            ".json",
            ".txt",
            ".xml",
            ".csv",
            ".yml",
            ".yaml",
            ".toml",
            ".cfg",
            ".log",
        ];
        const isValid =
            validExts.some((ext) => file.name.endsWith(ext)) ||
            file.type.startsWith("text/") ||
            file.type === "application/json";
        if (!isValid) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                if (side === "left") leftInput.value = reader.result;
                else rightInput.value = reader.result;
            }
        };
        reader.readAsText(file);
    }

    // --- Synchronized diff scrolling ---
    const leftDiffPane = ref<HTMLElement | null>(null);
    const rightDiffPane = ref<HTMLElement | null>(null);
    let scrollingSource: "left" | "right" | null = null;

    function onLeftScroll() {
        if (scrollingSource === "right") return;
        scrollingSource = "left";
        if (leftDiffPane.value && rightDiffPane.value) {
            rightDiffPane.value.scrollTop = leftDiffPane.value.scrollTop;
            rightDiffPane.value.scrollLeft = leftDiffPane.value.scrollLeft;
        }
        requestAnimationFrame(() => {
            scrollingSource = null;
        });
    }

    function onRightScroll() {
        if (scrollingSource === "left") return;
        scrollingSource = "right";
        if (leftDiffPane.value && rightDiffPane.value) {
            leftDiffPane.value.scrollTop = rightDiffPane.value.scrollTop;
            leftDiffPane.value.scrollLeft = rightDiffPane.value.scrollLeft;
        }
        requestAnimationFrame(() => {
            scrollingSource = null;
        });
    }

    watch(currentDiffRow, (row) => {
        if (row < 0) return;
        nextTick(() => {
            const lineHeight = 26;
            const scrollTo = row * lineHeight - 100;
            if (leftDiffPane.value) leftDiffPane.value.scrollTop = Math.max(0, scrollTo);
            if (rightDiffPane.value) rightDiffPane.value.scrollTop = Math.max(0, scrollTo);
        });
    });

    // --- Diff line rendering ---
    function lineClass(line: DiffLine): string {
        if (!line.content && (line.type === "added" || line.type === "removed"))
            return "diff-line-empty-placeholder";
        switch (line.type) {
            case "added":
                return "diff-line-added";
            case "removed":
                return "diff-line-removed";
            case "modified":
                return "diff-line-modified";
            default:
                return "";
        }
    }

    function getOppositeContent(idx: number, side: "left" | "right"): string {
        const opposite = side === "left" ? diffResult.value.right : diffResult.value.left;
        return opposite[idx]?.content ?? "";
    }

    function lineIcon(line: DiffLine, side: "left" | "right"): "plus" | "minus" | null {
        switch (line.type) {
            case "added":
                return side === "right" ? "plus" : null;
            case "removed":
                return side === "left" ? "minus" : null;
            case "modified":
                return side === "left" ? "minus" : "plus";
            default:
                return null;
        }
    }

    // --- Syntax highlighting ---
    function escapeHtml(str: string): string {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function highlightLine(str: string): string {
        let html = escapeHtml(str);
        if (mode.value !== "json") return html;
        html = html.replace(
            /(&quot;(?:[^&]|&(?!quot;))*&quot;)\s*:/g,
            '<span class="json-key">$1</span>:',
        );
        html = html.replace(/:\s*(&quot;(?:[^&]|&(?!quot;))*&quot;)/g, (match, s) =>
            match.replace(s, `<span class="json-string">${s}</span>`),
        );
        html = html.replace(
            /(?<!<span[^>]*>)(&quot;(?:[^&]|&(?!quot;))*&quot;)(?![^<]*<\/span>)/g,
            '<span class="json-string">$1</span>',
        );
        html = html.replace(
            /(?<=:\s*|[[,]\s*)(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g,
            '<span class="json-number">$1</span>',
        );
        html = html.replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>');
        html = html.replace(/\bnull\b/g, '<span class="json-null">null</span>');
        return html;
    }

    // --- Input highlighting ---
    const leftHighlight = ref<HTMLElement | null>(null);
    const rightHighlight = ref<HTMLElement | null>(null);
    const leftTextarea = ref<HTMLTextAreaElement | null>(null);
    const rightTextarea = ref<HTMLTextAreaElement | null>(null);

    function highlightFullInput(text: string): string {
        if (mode.value !== "json" || !text) return escapeHtml(text);
        return text
            .split("\n")
            .map((line) => highlightLine(line))
            .join("\n");
    }

    const highlightedLeftInput = computed(() => highlightFullInput(leftInput.value));
    const highlightedRightInput = computed(() => highlightFullInput(rightInput.value));

    function syncLeftHighlight() {
        if (!leftTextarea.value || !leftHighlight.value) return;
        leftHighlight.value.scrollTop = leftTextarea.value.scrollTop;
        leftHighlight.value.scrollLeft = leftTextarea.value.scrollLeft;
    }

    function syncRightHighlight() {
        if (!rightTextarea.value || !rightHighlight.value) return;
        rightHighlight.value.scrollTop = rightTextarea.value.scrollTop;
        rightHighlight.value.scrollLeft = rightTextarea.value.scrollLeft;
    }

    // --- Stats ---
    function formatSize(str: string): string {
        const bytes = new Blob([str]).size;
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    const leftStats = computed(() => {
        if (!leftInput.value) return null;
        return { lines: leftInput.value.split("\n").length, size: formatSize(leftInput.value) };
    });

    const rightStats = computed(() => {
        if (!rightInput.value) return null;
        return { lines: rightInput.value.split("\n").length, size: formatSize(rightInput.value) };
    });
</script>

<template>
  <div class="flex flex-col gap-0 h-[calc(100vh-12rem)]">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-2 px-3 py-2 bg-surface border border-surface-border rounded-t-xl">
      <!-- Mode toggles -->
      <div class="flex items-center rounded-lg border border-surface-border overflow-hidden">
        <button type="button" class="toolbar-mode-btn" :class="mode === 'json' ? 'toolbar-mode-btn-active' : ''" @click="mode = 'json'">
          <FileJson :size="15" />
          <span class="hidden sm:inline">JSON</span>
        </button>
        <button type="button" class="toolbar-mode-btn" :class="mode === 'text' ? 'toolbar-mode-btn-active' : ''" @click="mode = 'text'">
          <FileText :size="15" />
          <span class="hidden sm:inline">Text</span>
        </button>
      </div>

      <label class="flex items-center gap-1.5 text-sm text-content-tertiary cursor-pointer select-none">
        <input v-model="ignoreWhitespace" type="checkbox" class="w-3.5 h-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20" />
        <span class="hidden sm:inline">Ignore whitespace</span>
        <span class="sm:hidden">WS</span>
      </label>

      <div class="w-px h-5 bg-surface-border" />

      <button type="button" class="toolbar-btn" title="Swap left and right" @click="swap">
        <ArrowLeftRight :size="15" />
        <span class="hidden sm:inline">Swap</span>
      </button>

      <!-- Diff navigation -->
      <template v-if="showDiff">
        <div class="w-px h-5 bg-surface-border" />
        <div class="flex items-center gap-1">
          <button type="button" class="toolbar-btn" title="Previous diff" @click="goToPrevDiff" :disabled="totalDiffs === 0">
            <ChevronUp :size="15" />
          </button>
          <button type="button" class="toolbar-btn" title="Next diff" @click="goToNextDiff" :disabled="totalDiffs === 0">
            <ChevronDown :size="15" />
          </button>
          <span v-if="totalDiffs > 0" class="text-xs font-medium text-content-muted tabular-nums min-w-[4rem] text-center">
            {{ currentDiffIndex + 1 }}/{{ totalDiffs }}
          </span>
        </div>

        <div class="w-px h-5 bg-surface-border" />
        <UiCopyButton :text="generateDiffText()" label="Copy diff" />
      </template>

      <button type="button" class="toolbar-btn" title="Clear all" @click="clear">
        <Eraser :size="15" />
        <span class="hidden sm:inline">Clear</span>
      </button>

      <!-- Stats -->
      <div v-if="showDiff" class="ml-auto flex items-center gap-2">
        <span v-if="stats.additions > 0" class="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">+{{ stats.additions }}</span>
        <span v-if="stats.deletions > 0" class="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">-{{ stats.deletions }}</span>
        <span v-if="stats.modifications > 0" class="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">~{{ stats.modifications }}</span>
      </div>
    </div>

    <!-- JSON error panel -->
    <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-24" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100 max-h-24" leave-to-class="opacity-0 max-h-0">
      <div v-if="jsonError" class="flex items-center gap-3 px-4 py-2.5 bg-yellow-50 border-x border-yellow-200 text-sm dark:bg-yellow-900/10 dark:border-yellow-900/30">
        <AlertTriangle :size="16" class="text-yellow-500 shrink-0" />
        <p class="text-yellow-700 dark:text-yellow-400 flex-1">{{ jsonError.message }} — falling back to text diff</p>
      </div>
    </Transition>

    <!-- Main content -->
    <div class="flex-1 min-h-0 flex flex-col border border-t-0 border-surface-border rounded-b-xl overflow-hidden" :class="{ 'border-t border-t-surface-border': !jsonError }">

      <!-- Input panes -->
      <div :class="showDiff ? 'h-2/5 shrink-0' : 'flex-1 min-h-0'" class="flex border-b border-surface-border">
        <!-- Left input (A) -->
        <div
          class="relative flex-1 min-w-0 border-r border-surface-border"
          :class="isDraggingLeft ? 'ring-2 ring-inset ring-brand-500/50' : ''"
          @dragenter="onDragEnterLeft" @dragleave="onDragLeaveLeft" @dragover="onDragOver" @drop="onDropLeft"
        >
          <div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-1 bg-surface-secondary/90 backdrop-blur-sm border-b border-surface-border">
            <span class="text-xs font-semibold text-content-secondary">A</span>
            <UiCopyButton :text="leftInput" />
          </div>
          <pre ref="leftHighlight" class="absolute inset-0 pt-8 pb-3 px-3 font-mono text-sm leading-[1.625rem] whitespace-pre overflow-hidden pointer-events-none m-0" aria-hidden="true"><code v-html="highlightedLeftInput" /></pre>
          <textarea
            ref="leftTextarea"
            v-model="leftInput"
            class="relative w-full h-full pt-8 pb-3 px-3 font-mono text-sm leading-[1.625rem] bg-transparent resize-none focus:outline-none placeholder-placeholder"
            :class="mode === 'json' && leftInput ? 'text-transparent caret-caret' : 'text-content'"
            :placeholder="mode === 'json' ? 'Paste JSON here or drop a file...' : 'Paste text here or drop a file...'"
            spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" wrap="off"
            @scroll="syncLeftHighlight"
          />
          <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
            <div v-if="isDraggingLeft" class="absolute inset-0 flex items-center justify-center bg-brand-50/80 backdrop-blur-sm pointer-events-none">
              <div class="flex flex-col items-center gap-2 text-brand-accent">
                <FileText :size="28" />
                <span class="text-sm font-medium">Drop file here</span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Right input (B) -->
        <div
          class="relative flex-1 min-w-0"
          :class="isDraggingRight ? 'ring-2 ring-inset ring-brand-500/50' : ''"
          @dragenter="onDragEnterRight" @dragleave="onDragLeaveRight" @dragover="onDragOver" @drop="onDropRight"
        >
          <div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-1 bg-surface-secondary/90 backdrop-blur-sm border-b border-surface-border">
            <span class="text-xs font-semibold text-content-secondary">B</span>
            <UiCopyButton :text="rightInput" />
          </div>
          <pre ref="rightHighlight" class="absolute inset-0 pt-8 pb-3 px-3 font-mono text-sm leading-[1.625rem] whitespace-pre overflow-hidden pointer-events-none m-0" aria-hidden="true"><code v-html="highlightedRightInput" /></pre>
          <textarea
            ref="rightTextarea"
            v-model="rightInput"
            class="relative w-full h-full pt-8 pb-3 px-3 font-mono text-sm leading-[1.625rem] bg-transparent resize-none focus:outline-none placeholder-placeholder"
            :class="mode === 'json' && rightInput ? 'text-transparent caret-caret' : 'text-content'"
            :placeholder="mode === 'json' ? 'Paste JSON here or drop a file...' : 'Paste text here or drop a file...'"
            spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" wrap="off"
            @scroll="syncRightHighlight"
          />
          <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
            <div v-if="isDraggingRight" class="absolute inset-0 flex items-center justify-center bg-brand-50/80 backdrop-blur-sm pointer-events-none">
              <div class="flex flex-col items-center gap-2 text-brand-accent">
                <FileText :size="28" />
                <span class="text-sm font-medium">Drop file here</span>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Diff output -->
      <div v-if="showDiff" class="flex-1 min-h-0 flex">
        <!-- Left diff -->
        <div ref="leftDiffPane" class="flex-1 min-w-0 overflow-auto font-mono text-sm leading-[1.625rem] border-r border-surface-border" @scroll="onLeftScroll">
          <div class="min-w-fit">
            <div v-for="(line, idx) in diffResult.left" :key="idx" class="flex h-[1.625rem] whitespace-pre" :class="[lineClass(line), idx === currentDiffRow ? 'diff-line-current' : '']">
              <span class="shrink-0 w-10 pr-2 text-right text-xs leading-[1.625rem] text-gray-500 select-none bg-surface-secondary/50">{{ line.lineNumber ?? '' }}</span>
              <span class="shrink-0 w-5 flex items-center justify-center text-xs select-none" aria-hidden="true">
                <Minus v-if="lineIcon(line, 'left') === 'minus'" :size="12" class="text-red-600" />
              </span>
              <span v-if="line.content" class="flex-1 px-1" v-html="highlightLine(line.content)" />
              <span v-else class="flex-1 px-1 text-content-faint italic line-through" v-html="highlightLine(getOppositeContent(idx, 'left'))" />
            </div>
          </div>
        </div>
        <!-- Right diff -->
        <div ref="rightDiffPane" class="flex-1 min-w-0 overflow-auto font-mono text-sm leading-[1.625rem]" @scroll="onRightScroll">
          <div class="min-w-fit">
            <div v-for="(line, idx) in diffResult.right" :key="idx" class="flex h-[1.625rem] whitespace-pre" :class="[lineClass(line), idx === currentDiffRow ? 'diff-line-current' : '']">
              <span class="shrink-0 w-10 pr-2 text-right text-xs leading-[1.625rem] text-gray-500 select-none bg-surface-secondary/50">{{ line.lineNumber ?? '' }}</span>
              <span class="shrink-0 w-5 flex items-center justify-center text-xs select-none" aria-hidden="true">
                <Plus v-if="lineIcon(line, 'right') === 'plus'" :size="12" class="text-green-600" />
              </span>
              <span v-if="line.content" class="flex-1 px-1" v-html="highlightLine(line.content)" />
              <span v-else class="flex-1 px-1 text-content-faint italic line-through" v-html="highlightLine(getOppositeContent(idx, 'right'))" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status bar -->
    <div class="flex items-center justify-between px-3 py-1 text-[11px] font-mono text-content-muted bg-surface-secondary border border-t-0 border-surface-border rounded-b-xl">
      <span v-if="leftStats">A: {{ leftStats.lines }} lines &middot; {{ leftStats.size }}</span>
      <span v-else class="text-content-faint">A: empty</span>
      <span v-if="rightStats">B: {{ rightStats.lines }} lines &middot; {{ rightStats.size }}</span>
      <span v-else class="text-content-faint">B: empty</span>
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

.toolbar-mode-btn {
  @apply inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium
         text-content-tertiary hover:bg-surface-secondary hover:text-content
         transition-colors duration-150;
}

.toolbar-mode-btn-active {
  @apply bg-brand-50 text-brand-accent hover:bg-brand-100;
}

.diff-line-added { @apply bg-green-100 dark:bg-green-900/25; }
.diff-line-removed { @apply bg-red-100 dark:bg-red-900/25; }
.diff-line-modified { @apply bg-amber-100 dark:bg-amber-900/25; }
.diff-line-current { @apply ring-2 ring-inset ring-brand-400/60 dark:ring-brand-500/50; }
.diff-line-empty-placeholder { @apply bg-red-50/60 dark:bg-red-950/20; }
</style>
