export type IndentStyle = '2' | '4' | 'tab';

export interface TreeNode {
  key: string;
  value: unknown;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  children?: TreeNode[];
  expanded: boolean;
  depth: number;
}

export interface JsonError {
  message: string;
  line: number | null;
}

const STORAGE_KEY = 'json-formatter-state';

function getIndentString(style: IndentStyle): string | number {
  if (style === 'tab') return '\t';
  return Number(style);
}

function buildTreeNodes(value: unknown, key: string, depth: number): TreeNode {
  if (value === null) {
    return { key, value, type: 'null', depth, expanded: false };
  }
  if (Array.isArray(value)) {
    return {
      key,
      value,
      type: 'array',
      depth,
      expanded: depth < 2,
      children: value.map((item, i) => buildTreeNodes(item, String(i), depth + 1)),
    };
  }
  if (typeof value === 'object') {
    return {
      key,
      value,
      type: 'object',
      depth,
      expanded: depth < 2,
      children: Object.entries(value as Record<string, unknown>).map(([k, v]) =>
        buildTreeNodes(v, k, depth + 1),
      ),
    };
  }
  const type = typeof value === 'string'
    ? 'string'
    : typeof value === 'number'
      ? 'number'
      : typeof value === 'boolean'
        ? 'boolean'
        : 'null';

  return { key, value, type, depth, expanded: false };
}

function estimateErrorLine(input: string, errorMessage: string): number | null {
  // Many JSON.parse errors include "position N"
  const posMatch = errorMessage.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = Number(posMatch[1]);
    const upToPos = input.slice(0, pos);
    return upToPos.split('\n').length;
  }
  return null;
}

function humanizeJsonError(raw: string): string {
  // Strip the "JSON.parse: " or "SyntaxError: " prefix
  let msg = raw.replace(/^(SyntaxError:\s*)?/i, '');

  // Common rewrites
  if (/unexpected token\s*}/i.test(msg)) return 'Unexpected closing brace — possible trailing comma or missing value';
  if (/unexpected token\s*]/i.test(msg)) return 'Unexpected closing bracket — possible trailing comma or missing value';
  if (/unexpected token\s*'/i.test(msg)) return "Single quotes are not valid JSON — use double quotes instead";
  if (/unexpected end of/i.test(msg)) return 'Unexpected end of input — the JSON is incomplete or has unmatched brackets';
  if (/unexpected token.*in json at position 0/i.test(msg)) return 'Input does not start with valid JSON — expected { or [';

  // Capitalize first letter
  return msg.charAt(0).toUpperCase() + msg.slice(1);
}

function deepSortKeys(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepSortKeys);
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>).sort()) {
    sorted[key] = deepSortKeys((value as Record<string, unknown>)[key]);
  }
  return sorted;
}

function tryAutoFix(input: string): string {
  let fixed = input;

  // Replace single-quoted strings with double-quoted strings
  fixed = fixed.replace(
    /(?<=[\[{,:\s])(\s*)'((?:[^'\\]|\\.)*)'/g,
    (_match, ws, content) => `${ws}"${content}"`,
  );

  // Quote unquoted keys: { foo: -> { "foo":
  fixed = fixed.replace(
    /(?<=[{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
    '"$1":',
  );

  // Remove trailing commas before } or ]
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

  // Remove double/multiple commas: ,, -> ,
  fixed = fixed.replace(/,(\s*,)+/g, ',');

  // Remove leading commas after [ or {
  fixed = fixed.replace(/([\[{])\s*,/g, '$1');

  // Add missing commas between values/objects on separate lines
  // e.g. "foo": "bar"\n  "baz" -> "foo": "bar",\n  "baz"
  fixed = fixed.replace(
    /(["}\]\d])\s*\n(\s*")/g,
    '$1,\n$2',
  );

  // Remove comments (// line comments)
  fixed = fixed.replace(/\/\/[^\n]*/g, '');

  // Remove block comments /* ... */
  fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');

  // Attempt to parse — if it still fails, try wrapping bare values
  try {
    JSON.parse(fixed);
  } catch {
    // If it doesn't start with { or [, try wrapping in object
    const trimmed = fixed.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      try {
        JSON.parse(`{${trimmed}}`);
        fixed = `{${trimmed}}`;
      } catch {
        // Give up, return what we have
      }
    }
  }

  return fixed;
}

export function useJsonFormatter() {
  const input = ref('');
  const indentStyle = ref<IndentStyle>('2');
  const minifyMode = ref(false);
  const showTreeView = ref(false);

  const formattedOutput = ref('');
  const error = ref<JsonError | null>(null);
  const isValid = ref(false);
  const parsedValue = ref<unknown>(null);
  const treeData = ref<TreeNode | null>(null);

  // --- Session storage ---
  function saveState() {
    if (import.meta.server) return;
    try {
      const state = {
        input: input.value,
        indentStyle: indentStyle.value,
        minifyMode: minifyMode.value,
        showTreeView: showTreeView.value,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }

  function restoreState() {
    if (import.meta.server) return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      if (state.input) input.value = state.input;
      if (state.indentStyle) indentStyle.value = state.indentStyle;
      if (typeof state.minifyMode === 'boolean') minifyMode.value = state.minifyMode;
      if (typeof state.showTreeView === 'boolean') showTreeView.value = state.showTreeView;
    } catch {
      // Ignore corrupt data
    }
  }

  // --- Core formatting ---
  function process() {
    const raw = input.value.trim();
    if (!raw) {
      formattedOutput.value = '';
      error.value = null;
      isValid.value = false;
      parsedValue.value = null;
      treeData.value = null;
      saveState();
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      parsedValue.value = parsed;
      isValid.value = true;
      error.value = null;

      if (minifyMode.value) {
        formattedOutput.value = JSON.stringify(parsed);
      } else {
        formattedOutput.value = JSON.stringify(parsed, null, getIndentString(indentStyle.value));
      }

      // Build tree data (cap at ~50k chars to avoid freezing on huge files)
      if (raw.length < 50_000) {
        treeData.value = buildTreeNodes(parsed, 'root', 0);
      } else {
        treeData.value = buildTreeNodes(parsed, 'root (large file — tree truncated)', 0);
        // Only expand top level for large files
        if (treeData.value.children) {
          treeData.value.children.forEach((c) => { c.expanded = false; });
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      isValid.value = false;
      parsedValue.value = null;
      treeData.value = null;
      formattedOutput.value = '';
      error.value = {
        message: humanizeJsonError(msg),
        line: estimateErrorLine(raw, msg),
      };
    }

    saveState();
  }

  // Debounced watcher
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watch([input, indentStyle, minifyMode], () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(process, 150);
  });

  // Immediate re-format when indent or minify changes (no debounce needed if already parsed)
  watch([indentStyle, minifyMode], () => {
    if (parsedValue.value !== null && isValid.value) {
      if (minifyMode.value) {
        formattedOutput.value = JSON.stringify(parsedValue.value);
      } else {
        formattedOutput.value = JSON.stringify(parsedValue.value, null, getIndentString(indentStyle.value));
      }
      saveState();
    }
  });

  function format() {
    minifyMode.value = false;
    process();
    // Also replace input with formatted version
    if (formattedOutput.value) {
      input.value = formattedOutput.value;
    }
  }

  function minify() {
    minifyMode.value = true;
    process();
    // Also replace input with minified version
    if (formattedOutput.value) {
      input.value = formattedOutput.value;
    }
  }

  function clear() {
    input.value = '';
    formattedOutput.value = '';
    error.value = null;
    isValid.value = false;
    parsedValue.value = null;
    treeData.value = null;
    saveState();
  }

  function tryFix() {
    input.value = tryAutoFix(input.value);
    process();
  }

  function sortKeys() {
    if (!parsedValue.value || !isValid.value) return;
    const sorted = deepSortKeys(parsedValue.value);
    parsedValue.value = sorted;
    if (minifyMode.value) {
      formattedOutput.value = JSON.stringify(sorted);
    } else {
      formattedOutput.value = JSON.stringify(sorted, null, getIndentString(indentStyle.value));
    }
    input.value = formattedOutput.value;
    if (formattedOutput.value.length < 50_000) {
      treeData.value = buildTreeNodes(sorted, 'root', 0);
    }
    saveState();
  }

  // Restore on mount
  onMounted(() => {
    restoreState();
    if (input.value.trim()) {
      process();
    }
  });

  onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
  });

  return {
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
  };
}
