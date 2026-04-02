<script setup lang="ts">
import {
  AlertTriangle,
  Eraser,
  Clock,
  ArrowRightLeft,
  Zap,
  Calendar,
  Globe,
  Timer,
  Copy,
  Check,
} from 'lucide-vue-next';

const {
  input,
  direction,
  unit,
  error,
  parsed,
  nowSeconds,
  nowMilliseconds,
  timezoneResults,
  useNow,
  clear,
} = useUnixTimestamp();

// Copy with feedback
const copiedField = ref<string | null>(null);
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

async function copyValue(field: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    copiedField.value = field;
    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => { copiedField.value = null; }, 1500);
  } catch { /* */ }
}

const examples = [
  { label: 'Now', action: () => useNow() },
  { label: 'Y2K', action: () => { direction.value = 'toDate'; unit.value = 'seconds'; input.value = '946684800'; } },
  { label: 'Unix Epoch', action: () => { direction.value = 'toDate'; unit.value = 'seconds'; input.value = '0'; } },
  { label: 'Date string', action: () => { direction.value = 'toTimestamp'; input.value = '2030-01-01T00:00:00Z'; } },
];

interface ResultField {
  key: string;
  label: string;
  value: string;
  mono?: boolean;
}

const resultFields = computed<ResultField[]>(() => {
  if (!parsed.value) return [];
  const p = parsed.value;
  return [
    { key: 'unix-s', label: 'Unix (seconds)', value: String(p.unixSeconds), mono: true },
    { key: 'unix-ms', label: 'Unix (milliseconds)', value: String(p.unixMilliseconds), mono: true },
    { key: 'iso', label: 'ISO 8601', value: p.iso, mono: true },
    { key: 'local', label: 'Local time', value: p.local },
    { key: 'utc', label: 'UTC', value: p.utc },
    { key: 'relative', label: 'Relative', value: p.relative },
    { key: 'day', label: 'Day of week', value: p.dayOfWeek },
    { key: 'doy', label: 'Day of year', value: String(p.dayOfYear) },
    { key: 'week', label: 'Week number', value: String(p.weekNumber) },
    { key: 'leap', label: 'Leap year', value: p.isLeapYear ? 'Yes' : 'No' },
  ];
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Live clock -->
    <div class="flex items-center gap-4 px-4 py-3 rounded-xl bg-surface-secondary dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border">
      <Timer :size="16" class="text-brand-500 shrink-0" />
      <div class="flex-1 flex flex-wrap items-center gap-x-6 gap-y-1">
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 dark:text-gray-400">Seconds</span>
          <code class="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{{ nowSeconds }}</code>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 dark:text-gray-400">Milliseconds</span>
          <code class="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{{ nowMilliseconds }}</code>
        </div>
      </div>
      <button
        type="button"
        class="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
        @click="useNow"
      >
        Use now
      </button>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Direction toggle -->
      <div class="inline-flex items-center rounded-lg border border-surface-border dark:border-surface-dark-border overflow-hidden">
        <button
          type="button"
          class="px-3 py-1.5 text-sm font-medium transition-colors"
          :class="direction === 'toDate'
            ? 'bg-brand-500 text-white'
            : 'bg-surface text-gray-600 hover:bg-gray-100 dark:bg-surface-dark dark:text-gray-400 dark:hover:bg-surface-dark-secondary'"
          @click="direction = 'toDate'"
        >
          <Clock :size="14" class="inline -mt-0.5 mr-1" />
          Timestamp → Date
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-sm font-medium transition-colors"
          :class="direction === 'toTimestamp'
            ? 'bg-brand-500 text-white'
            : 'bg-surface text-gray-600 hover:bg-gray-100 dark:bg-surface-dark dark:text-gray-400 dark:hover:bg-surface-dark-secondary'"
          @click="direction = 'toTimestamp'"
        >
          <Calendar :size="14" class="inline -mt-0.5 mr-1" />
          Date → Timestamp
        </button>
      </div>

      <!-- Unit toggle (only for timestamp → date) -->
      <template v-if="direction === 'toDate'">
        <div class="w-px h-5 bg-surface-border dark:bg-surface-dark-border" />
        <div class="inline-flex items-center rounded-lg border border-surface-border dark:border-surface-dark-border overflow-hidden">
          <button
            type="button"
            class="px-3 py-1.5 text-sm font-medium transition-colors"
            :class="unit === 'seconds'
              ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
              : 'bg-surface text-gray-600 hover:bg-gray-100 dark:bg-surface-dark dark:text-gray-400 dark:hover:bg-surface-dark-secondary'"
            @click="unit = 'seconds'"
          >
            Seconds
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-sm font-medium transition-colors"
            :class="unit === 'milliseconds'
              ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
              : 'bg-surface text-gray-600 hover:bg-gray-100 dark:bg-surface-dark dark:text-gray-400 dark:hover:bg-surface-dark-secondary'"
            @click="unit = 'milliseconds'"
          >
            Milliseconds
          </button>
        </div>
      </template>

      <div class="w-px h-5 bg-surface-border dark:bg-surface-dark-border" />

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200 transition-colors"
        @click="clear"
      >
        <Eraser :size="15" />
        <span class="hidden sm:inline">Clear</span>
      </button>
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
        <p class="text-red-700 dark:text-red-400">{{ error.message }}</p>
      </div>
    </Transition>

    <!-- Input -->
    <div class="rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-colors">
      <input
        v-model="input"
        type="text"
        class="w-full px-4 py-3 font-mono text-sm bg-transparent focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
        :placeholder="direction === 'toDate'
          ? (unit === 'seconds' ? 'Enter Unix timestamp (e.g. 1712188800)...' : 'Enter timestamp in ms (e.g. 1712188800000)...')
          : 'Enter date (e.g. 2026-04-03, Apr 3 2026 14:30, ISO 8601)...'"
        spellcheck="false"
        autocomplete="off"
      />
    </div>

    <!-- Results -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="parsed" class="rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark">
        <div class="px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border bg-surface-secondary dark:bg-surface-dark-secondary">
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Result</span>
        </div>
        <div class="divide-y divide-surface-border/50 dark:divide-surface-dark-border/50">
          <div
            v-for="field in resultFields"
            :key="field.key"
            class="group flex items-center gap-4 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-surface-dark-secondary/50 transition-colors"
          >
            <span class="text-xs font-medium text-gray-500 dark:text-gray-500 w-32 shrink-0">{{ field.label }}</span>
            <span
              class="flex-1 text-sm text-gray-900 dark:text-gray-100 min-w-0 truncate"
              :class="field.mono ? 'font-mono' : ''"
            >
              {{ field.value }}
            </span>
            <button
              type="button"
              class="shrink-0 text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-surface-dark-secondary"
              :class="copiedField === field.key ? '!opacity-100 !text-green-500' : ''"
              @click="copyValue(field.key, field.value)"
            >
              <component :is="copiedField === field.key ? Check : Copy" :size="13" />
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- World Clock -->
    <div v-if="timezoneResults.length" class="rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark">
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border bg-surface-secondary dark:bg-surface-dark-secondary">
        <Globe :size="14" class="text-brand-500" />
        <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">World Clock</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-surface-border/50 dark:divide-surface-dark-border/50">
        <div
          v-for="tz in timezoneResults"
          :key="tz.id"
          class="flex items-center gap-3 px-4 py-3 sm:border-b sm:border-r border-surface-border/50 dark:border-surface-dark-border/50"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ tz.city }}</span>
              <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 dark:bg-surface-dark-secondary dark:text-gray-500">{{ tz.offset }}</span>
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-sm font-mono tabular-nums text-gray-700 dark:text-gray-300">{{ tz.time }}</span>
              <span class="text-xs text-gray-400 dark:text-gray-600">{{ tz.date }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Examples -->
    <div v-if="!input.trim()" class="flex flex-col gap-3">
      <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Try an example:</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          v-for="ex in examples"
          :key="ex.label"
          type="button"
          class="flex flex-col items-start gap-1 p-4 rounded-xl border border-surface-border bg-surface hover:border-brand-300 hover:bg-brand-50/50 dark:bg-surface-dark dark:border-surface-dark-border dark:hover:border-brand-700 dark:hover:bg-brand-900/10 transition-colors text-left group"
          @click="ex.action()"
        >
          <div class="flex items-center gap-2">
            <Zap :size="14" class="text-brand-500" />
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">{{ ex.label }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
