<script setup lang="ts">
import {
  AlertTriangle,
  Eraser,
  Zap,
  Replace,
} from 'lucide-vue-next';

const {
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
} = useRegexTester();

const showReplace = ref(false);

// Build highlighted HTML from test string + matches
const highlightedHtml = computed(() => {
  if (!testString.value || !matches.value.length) {
    return escapeHtml(testString.value);
  }

  const text = testString.value;
  const sorted = [...matches.value].sort((a, b) => a.index - b.index);

  let result = '';
  let lastEnd = 0;
  const colors = [
    'bg-yellow-200/70 dark:bg-yellow-500/30',
    'bg-blue-200/70 dark:bg-blue-500/30',
    'bg-green-200/70 dark:bg-green-500/30',
    'bg-pink-200/70 dark:bg-pink-500/30',
    'bg-purple-200/70 dark:bg-purple-500/30',
    'bg-orange-200/70 dark:bg-orange-500/30',
  ];

  for (let i = 0; i < sorted.length; i++) {
    const m = sorted[i];
    const end = m.index + m.value.length;

    // Text before match
    if (m.index > lastEnd) {
      result += escapeHtml(text.slice(lastEnd, m.index));
    }

    const color = colors[i % colors.length];
    result += `<mark class="rounded px-0.5 ${color} text-inherit">${escapeHtml(m.value)}</mark>`;
    lastEnd = end;
  }

  // Remaining text
  if (lastEnd < text.length) {
    result += escapeHtml(text.slice(lastEnd));
  }

  return result;
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const examples = [
  {
    label: 'Email',
    pattern: '[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}',
    flags: 'gi',
    testString: 'Contact us at hello@example.com or support@tinytools.dev for help.',
  },
  {
    label: 'URL',
    pattern: 'https?:\\/\\/[\\w.-]+(?:\\.[a-zA-Z]{2,})(?:\\/[^\\s]*)?',
    flags: 'gi',
    testString: 'Visit https://tinytools.dev or http://example.com/path?q=1 for more info.',
  },
  {
    label: 'Date (YYYY-MM-DD)',
    pattern: '(?<year>\\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\\d|3[01])',
    flags: 'g',
    testString: 'Events on 2026-04-03, 2026-12-25, and 2025-01-15 are confirmed.',
  },
  {
    label: 'Replace digits',
    pattern: '\\d+',
    flags: 'g',
    testString: 'Order #12345 has 3 items totaling $99.95',
    replacement: '[NUM]',
  },
];

const FLAG_INFO: { flag: string; label: string; description: string }[] = [
  { flag: 'g', label: 'g', description: 'Global — find all matches' },
  { flag: 'i', label: 'i', description: 'Case-insensitive' },
  { flag: 'm', label: 'm', description: 'Multiline — ^ and $ match line boundaries' },
  { flag: 's', label: 's', description: 'Dotall — . matches newlines' },
  { flag: 'u', label: 'u', description: 'Unicode — full Unicode support' },
];

// Quick reference
const CHEATSHEET = [
  { cat: 'Characters', items: [
    { token: '.', desc: 'Any character (except newline)' },
    { token: '\\d', desc: 'Digit [0-9]' },
    { token: '\\w', desc: 'Word char [a-zA-Z0-9_]' },
    { token: '\\s', desc: 'Whitespace' },
    { token: '\\b', desc: 'Word boundary' },
  ]},
  { cat: 'Quantifiers', items: [
    { token: '*', desc: '0 or more' },
    { token: '+', desc: '1 or more' },
    { token: '?', desc: '0 or 1' },
    { token: '{n}', desc: 'Exactly n' },
    { token: '{n,m}', desc: 'Between n and m' },
  ]},
  { cat: 'Groups & Lookaround', items: [
    { token: '(abc)', desc: 'Capture group' },
    { token: '(?:abc)', desc: 'Non-capturing group' },
    { token: '(?<name>abc)', desc: 'Named group' },
    { token: '(?=abc)', desc: 'Lookahead' },
    { token: '(?!abc)', desc: 'Negative lookahead' },
  ]},
  { cat: 'Anchors & Alternation', items: [
    { token: '^', desc: 'Start of string/line' },
    { token: '$', desc: 'End of string/line' },
    { token: 'a|b', desc: 'Alternation (a or b)' },
    { token: '[abc]', desc: 'Character class' },
    { token: '[^abc]', desc: 'Negated class' },
  ]},
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Pattern input -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <div class="flex-1 flex items-center rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-colors">
          <span class="pl-4 pr-2 text-gray-400 dark:text-gray-600 font-mono text-sm select-none">/</span>
          <input
            v-model="pattern"
            type="text"
            class="flex-1 py-2.5 font-mono text-sm bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
            placeholder="Enter regex pattern..."
            spellcheck="false"
            autocomplete="off"
          />
          <span class="pr-2 text-gray-400 dark:text-gray-600 font-mono text-sm select-none">/</span>
          <div class="flex items-center border-l border-surface-border dark:border-surface-dark-border">
            <button
              v-for="f in FLAG_INFO"
              :key="f.flag"
              type="button"
              class="px-2 py-2.5 text-sm font-mono font-bold transition-colors"
              :class="hasFlag(f.flag)
                ? 'text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-900/20'
                : 'text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400'"
              :title="f.description"
              @click="toggleFlag(f.flag)"
            >
              {{ f.label }}
            </button>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-2.5 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200 transition-colors"
          @click="showReplace = !showReplace"
          :class="showReplace ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' : ''"
          title="Toggle replace"
        >
          <Replace :size="16" />
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-2.5 py-2.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200 transition-colors"
          @click="clear"
        >
          <Eraser :size="16" />
        </button>
      </div>

      <!-- Replace input -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1 max-h-0"
        enter-to-class="opacity-100 translate-y-0 max-h-20"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 max-h-20"
        leave-to-class="opacity-0 -translate-y-1 max-h-0"
      >
        <div v-if="showReplace" class="overflow-hidden">
          <div class="flex items-center rounded-xl border border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-colors">
            <span class="pl-4 pr-2 text-xs text-gray-400 dark:text-gray-600 select-none uppercase tracking-wide">Replace</span>
            <input
              v-model="replacement"
              type="text"
              class="flex-1 py-2.5 pr-4 font-mono text-sm bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
              placeholder="Replacement string (use $1, $2 for groups)..."
              spellcheck="false"
            />
          </div>
        </div>
      </Transition>
    </div>

    <!-- Error panel -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="error"
        class="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm dark:bg-red-900/10 dark:border-red-900/30"
      >
        <AlertTriangle :size="16" class="text-red-500 shrink-0" />
        <p class="text-red-700 dark:text-red-400 font-mono text-xs">{{ error.message }}</p>
      </div>
    </Transition>

    <!-- Match stats -->
    <div v-if="pattern && !error" class="flex items-center gap-4 text-sm">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium" :class="matchCount > 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-surface-dark-secondary dark:text-gray-400'">
        {{ matchCount }} match{{ matchCount !== 1 ? 'es' : '' }}
      </span>
      <span v-if="groupCount > 0" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium">
        {{ groupCount }} group{{ groupCount !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Test string with highlights -->
    <div class="rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark">
      <div class="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border bg-surface-secondary dark:bg-surface-dark-secondary">
        <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Test String</span>
        <UiCopyButton v-if="testString" :text="testString" />
      </div>
      <div class="relative">
        <!-- Highlighted overlay -->
        <pre
          v-if="matches.length"
          class="absolute inset-0 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none m-0 text-gray-900 dark:text-gray-100 overflow-hidden"
          aria-hidden="true"
          v-html="highlightedHtml"
        />
        <textarea
          v-model="testString"
          class="relative w-full min-h-[180px] p-4 font-mono text-sm leading-relaxed bg-transparent resize-y focus:outline-none placeholder-gray-400 dark:placeholder-gray-600"
          :class="matches.length ? 'text-transparent caret-gray-900 dark:caret-gray-100' : 'text-gray-900 dark:text-gray-100'"
          placeholder="Type or paste your test string here..."
          spellcheck="false"
        />
      </div>
    </div>

    <!-- Replace output -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="showReplace && replacedOutput" class="rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border bg-surface-secondary dark:bg-surface-dark-secondary">
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Replace Result</span>
          <UiCopyButton :text="replacedOutput" />
        </div>
        <pre class="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100 m-0">{{ replacedOutput }}</pre>
      </div>
    </Transition>

    <!-- Match details -->
    <div v-if="matches.length" class="rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark">
      <div class="px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border bg-surface-secondary dark:bg-surface-dark-secondary">
        <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Match Details</span>
      </div>
      <div class="divide-y divide-surface-border/50 dark:divide-surface-dark-border/50 max-h-[320px] overflow-y-auto">
        <div
          v-for="(m, i) in matches"
          :key="i"
          class="px-4 py-3"
        >
          <div class="flex items-center gap-3 mb-1">
            <span class="text-xs font-semibold text-gray-500 dark:text-gray-500">Match {{ i + 1 }}</span>
            <code class="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 bg-yellow-100 dark:bg-yellow-500/20 px-1.5 py-0.5 rounded">{{ m.value }}</code>
            <span class="text-xs text-gray-400 dark:text-gray-600">index {{ m.index }}</span>
          </div>
          <div v-if="m.groups.length" class="mt-2 flex flex-wrap gap-2">
            <div
              v-for="g in m.groups"
              :key="g.index"
              class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/15 text-xs"
            >
              <span class="font-semibold text-blue-600 dark:text-blue-400">{{ g.name ? `${g.name}` : `$${g.index}` }}</span>
              <code class="font-mono text-gray-700 dark:text-gray-300">{{ g.value || '(empty)' }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Examples -->
    <div v-if="!pattern" class="flex flex-col gap-3">
      <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Try an example:</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          v-for="ex in examples"
          :key="ex.label"
          type="button"
          class="flex flex-col items-start gap-1 p-4 rounded-xl border border-surface-border bg-surface hover:border-brand-300 hover:bg-brand-50/50 dark:bg-surface-dark dark:border-surface-dark-border dark:hover:border-brand-700 dark:hover:bg-brand-900/10 transition-colors text-left group"
          @click="() => { loadExample(ex); if (ex.replacement) showReplace = true; }"
        >
          <div class="flex items-center gap-2">
            <Zap :size="14" class="text-brand-500" />
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">{{ ex.label }}</span>
          </div>
          <code class="text-xs font-mono text-gray-500 dark:text-gray-400 truncate w-full">/{{ ex.pattern }}/{{ ex.flags }}</code>
        </button>
      </div>
    </div>

    <!-- Cheatsheet -->
    <div class="rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark">
      <div class="px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border bg-surface-secondary dark:bg-surface-dark-secondary">
        <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Quick Reference</span>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-surface-border/50 dark:divide-surface-dark-border/50">
        <div v-for="cat in CHEATSHEET" :key="cat.cat" class="p-3">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wide">{{ cat.cat }}</p>
          <div class="space-y-1">
            <div v-for="item in cat.items" :key="item.token" class="flex items-center gap-2">
              <code class="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 w-14 shrink-0">{{ item.token }}</code>
              <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
