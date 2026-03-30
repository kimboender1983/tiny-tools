import { diffLines, type Change } from 'diff';

export type DiffLineType = 'added' | 'removed' | 'unchanged' | 'modified';

export interface DiffLine {
  type: DiffLineType;
  lineNumber: number | null;
  content: string;
}

export interface DiffResult {
  left: DiffLine[];
  right: DiffLine[];
}

export interface DiffStats {
  additions: number;
  deletions: number;
  modifications: number;
  unchanged: number;
}

type DiffMode = 'json' | 'text';

const STORAGE_KEY = 'json-diff-state';

function tryFormatJson(input: string): string | null {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return null;
  }
}

/**
 * Convert diff package output (Change[]) into aligned left/right DiffLines
 * for side-by-side display.
 */
function buildAlignedDiff(changes: Change[]): DiffResult {
  const left: DiffLine[] = [];
  const right: DiffLine[] = [];

  let leftLineNum = 1;
  let rightLineNum = 1;

  let i = 0;
  while (i < changes.length) {
    const change = changes[i];

    if (!change.added && !change.removed) {
      // Unchanged block
      const lines = splitLines(change.value);
      for (const line of lines) {
        left.push({ type: 'unchanged', lineNumber: leftLineNum++, content: line });
        right.push({ type: 'unchanged', lineNumber: rightLineNum++, content: line });
      }
      i++;
      continue;
    }

    // Collect consecutive removed + added blocks to pair them as modifications
    const removedLines: string[] = [];
    const addedLines: string[] = [];

    while (i < changes.length && changes[i].removed) {
      removedLines.push(...splitLines(changes[i].value));
      i++;
    }
    while (i < changes.length && changes[i].added) {
      addedLines.push(...splitLines(changes[i].value));
      i++;
    }

    // Pair up as modifications where possible
    const paired = Math.min(removedLines.length, addedLines.length);

    for (let p = 0; p < paired; p++) {
      left.push({ type: 'modified', lineNumber: leftLineNum++, content: removedLines[p] });
      right.push({ type: 'modified', lineNumber: rightLineNum++, content: addedLines[p] });
    }

    // Remaining removes
    for (let p = paired; p < removedLines.length; p++) {
      left.push({ type: 'removed', lineNumber: leftLineNum++, content: removedLines[p] });
      right.push({ type: 'removed', lineNumber: null, content: '' });
    }

    // Remaining adds
    for (let p = paired; p < addedLines.length; p++) {
      left.push({ type: 'added', lineNumber: null, content: '' });
      right.push({ type: 'added', lineNumber: rightLineNum++, content: addedLines[p] });
    }
  }

  return { left, right };
}

function splitLines(text: string): string[] {
  // Remove trailing newline to avoid empty last element
  const trimmed = text.endsWith('\n') ? text.slice(0, -1) : text;
  return trimmed.length === 0 ? [] : trimmed.split('\n');
}

export function useJsonDiff() {
  const leftInput = ref('');
  const rightInput = ref('');
  const mode = ref<DiffMode>('json');
  const ignoreWhitespace = ref(false);

  const diffResult = ref<DiffResult>({ left: [], right: [] });
  const jsonError = ref<{ side: 'left' | 'right' | 'both'; message: string } | null>(null);

  const currentDiffIndex = ref(0);
  const diffIndices = ref<number[]>([]);

  // --- Session storage ---
  function saveState() {
    if (import.meta.server) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        leftInput: leftInput.value,
        rightInput: rightInput.value,
        mode: mode.value,
        ignoreWhitespace: ignoreWhitespace.value,
      }));
    } catch { /* ignore */ }
  }

  function restoreState() {
    if (import.meta.server) return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      if (state.leftInput) leftInput.value = state.leftInput;
      if (state.rightInput) rightInput.value = state.rightInput;
      if (state.mode) mode.value = state.mode;
      if (typeof state.ignoreWhitespace === 'boolean') ignoreWhitespace.value = state.ignoreWhitespace;
    } catch { /* ignore */ }
  }

  // --- Compute diff using the diff package ---
  function computeDiff() {
    jsonError.value = null;

    const leftRaw = leftInput.value;
    const rightRaw = rightInput.value;

    if (!leftRaw.trim() && !rightRaw.trim()) {
      diffResult.value = { left: [], right: [] };
      diffIndices.value = [];
      currentDiffIndex.value = 0;
      saveState();
      return;
    }

    let leftText = leftRaw;
    let rightText = rightRaw;

    // JSON mode: parse and pretty-print both sides
    if (mode.value === 'json') {
      const leftFormatted = tryFormatJson(leftRaw);
      const rightFormatted = tryFormatJson(rightRaw);

      if (!leftFormatted && leftRaw.trim()) {
        jsonError.value = {
          side: !rightFormatted && rightRaw.trim() ? 'both' : 'left',
          message: !rightFormatted && rightRaw.trim()
            ? 'Both inputs contain invalid JSON'
            : 'Input A contains invalid JSON',
        };
      } else if (!rightFormatted && rightRaw.trim()) {
        jsonError.value = { side: 'right', message: 'Input B contains invalid JSON' };
      } else {
        leftText = leftFormatted || '';
        rightText = rightFormatted || '';
      }
    }

    // Use the diff package for line-level diffing
    const changes = diffLines(leftText, rightText, {
      ignoreWhitespace: ignoreWhitespace.value,
    });

    const result = buildAlignedDiff(changes);
    diffResult.value = result;

    // Build diff index list
    const indices: number[] = [];
    for (let idx = 0; idx < result.left.length; idx++) {
      if (result.left[idx].type !== 'unchanged') {
        indices.push(idx);
      }
    }
    diffIndices.value = indices;
    currentDiffIndex.value = 0;

    saveState();
  }

  // --- Stats ---
  const stats = computed<DiffStats>(() => {
    let additions = 0;
    let deletions = 0;
    let modifications = 0;
    let unchanged = 0;

    for (const line of diffResult.value.left) {
      switch (line.type) {
        case 'added': additions++; break;
        case 'removed': deletions++; break;
        case 'modified': modifications++; break;
        case 'unchanged': unchanged++; break;
      }
    }

    return { additions, deletions, modifications, unchanged };
  });

  // --- Navigation ---
  const totalDiffs = computed(() => diffIndices.value.length);

  function goToNextDiff() {
    if (totalDiffs.value === 0) return;
    currentDiffIndex.value = (currentDiffIndex.value + 1) % totalDiffs.value;
  }

  function goToPrevDiff() {
    if (totalDiffs.value === 0) return;
    currentDiffIndex.value = (currentDiffIndex.value - 1 + totalDiffs.value) % totalDiffs.value;
  }

  const currentDiffRow = computed(() => {
    if (totalDiffs.value === 0) return -1;
    return diffIndices.value[currentDiffIndex.value];
  });

  // --- Actions ---
  function swap() {
    const temp = leftInput.value;
    leftInput.value = rightInput.value;
    rightInput.value = temp;
    computeDiff();
  }

  function clear() {
    leftInput.value = '';
    rightInput.value = '';
    diffResult.value = { left: [], right: [] };
    diffIndices.value = [];
    currentDiffIndex.value = 0;
    jsonError.value = null;
    saveState();
  }

  function generateDiffText(): string {
    const lines: string[] = [];
    const left = diffResult.value.left;
    const right = diffResult.value.right;

    for (let i = 0; i < left.length; i++) {
      const l = left[i];
      const r = right[i];

      switch (l.type) {
        case 'unchanged':
          lines.push(`  ${l.content}`);
          break;
        case 'removed':
          lines.push(`- ${l.content}`);
          break;
        case 'added':
          lines.push(`+ ${r.content}`);
          break;
        case 'modified':
          lines.push(`- ${l.content}`);
          lines.push(`+ ${r.content}`);
          break;
      }
    }

    return lines.join('\n');
  }

  // Auto-compare on input changes
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watch([leftInput, rightInput, mode, ignoreWhitespace], () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(computeDiff, 300);
  });

  onMounted(() => {
    restoreState();
    if (leftInput.value.trim() || rightInput.value.trim()) {
      computeDiff();
    }
  });

  onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
  });

  return {
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
    compare: computeDiff,
    swap,
    clear,
    generateDiffText,
  };
}
