export interface RegexMatch {
  index: number;
  value: string;
  groups: RegexGroup[];
}

export interface RegexGroup {
  name: string | null;
  index: number;
  value: string;
}

export interface RegexError {
  message: string;
}

const STORAGE_KEY = 'regex-tester-state';

export function useRegexTester() {
  const pattern = ref('');
  const flags = ref('g');
  const testString = ref('');
  const replacement = ref('');
  const error = ref<RegexError | null>(null);
  const matches = ref<RegexMatch[]>([]);
  const replacedOutput = ref('');

  // Computed regex
  const regex = computed<RegExp | null>(() => {
    if (!pattern.value) return null;
    try {
      const r = new RegExp(pattern.value, flags.value);
      error.value = null;
      return r;
    } catch (e) {
      error.value = { message: e instanceof Error ? e.message.replace(/^Invalid regular expression: /, '') : 'Invalid regex' };
      return null;
    }
  });

  const matchCount = computed(() => matches.value.length);
  const groupCount = computed(() => {
    if (!matches.value.length) return 0;
    return matches.value[0].groups.length;
  });

  // --- Session storage ---
  function saveState() {
    if (import.meta.server) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        pattern: pattern.value,
        flags: flags.value,
        testString: testString.value,
        replacement: replacement.value,
      }));
    } catch { /* ignore */ }
  }

  function restoreState() {
    if (import.meta.server) return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.pattern != null) pattern.value = s.pattern;
        if (s.flags != null) flags.value = s.flags;
        if (s.testString != null) testString.value = s.testString;
        if (s.replacement != null) replacement.value = s.replacement;
      }
    } catch { /* ignore */ }
  }

  // --- Processing ---
  function process() {
    const r = regex.value;
    if (!r || !testString.value) {
      matches.value = [];
      replacedOutput.value = '';
      saveState();
      return;
    }

    const results: RegexMatch[] = [];
    const text = testString.value;

    if (flags.value.includes('g')) {
      let match: RegExpExecArray | null;
      // Reset lastIndex
      r.lastIndex = 0;
      let safety = 0;
      while ((match = r.exec(text)) !== null && safety < 10000) {
        safety++;
        const groups: RegexGroup[] = [];
        for (let i = 1; i < match.length; i++) {
          const name = match.groups
            ? Object.entries(match.groups).find(([, v]) => v === match![i])?.[0] ?? null
            : null;
          groups.push({
            name,
            index: i,
            value: match[i] ?? '',
          });
        }
        results.push({
          index: match.index,
          value: match[0],
          groups,
        });
        // Prevent infinite loops on zero-length matches
        if (match[0].length === 0) r.lastIndex++;
      }
    } else {
      const match = r.exec(text);
      if (match) {
        const groups: RegexGroup[] = [];
        for (let i = 1; i < match.length; i++) {
          const name = match.groups
            ? Object.entries(match.groups).find(([, v]) => v === match![i])?.[0] ?? null
            : null;
          groups.push({
            name,
            index: i,
            value: match[i] ?? '',
          });
        }
        results.push({
          index: match.index,
          value: match[0],
          groups,
        });
      }
    }

    matches.value = results;

    // Replacement
    if (replacement.value) {
      try {
        replacedOutput.value = text.replace(r, replacement.value);
      } catch {
        replacedOutput.value = '';
      }
    } else {
      replacedOutput.value = '';
    }

    saveState();
  }

  // Debounced watcher
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  watch([pattern, flags, testString, replacement], () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(process, 100);
  });

  function toggleFlag(flag: string) {
    if (flags.value.includes(flag)) {
      flags.value = flags.value.replace(flag, '');
    } else {
      flags.value += flag;
    }
  }

  function hasFlag(flag: string): boolean {
    return flags.value.includes(flag);
  }

  function clear() {
    pattern.value = '';
    flags.value = 'g';
    testString.value = '';
    replacement.value = '';
    error.value = null;
    matches.value = [];
    replacedOutput.value = '';
    saveState();
  }

  function loadExample(ex: { pattern: string; flags: string; testString: string; replacement?: string }) {
    pattern.value = ex.pattern;
    flags.value = ex.flags;
    testString.value = ex.testString;
    replacement.value = ex.replacement ?? '';
  }

  onMounted(() => {
    restoreState();
    if (pattern.value) process();
  });

  onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
  });

  return {
    pattern,
    flags,
    testString,
    replacement,
    error,
    matches,
    matchCount,
    groupCount,
    replacedOutput,
    toggleFlag,
    hasFlag,
    clear,
    loadExample,
  };
}
