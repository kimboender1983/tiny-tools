<script setup lang="ts">
    import { Check, Copy, Download, Eraser, Minus, Plus, RefreshCw } from "lucide-vue-next";

    const { version, count, uppercase, formattedUuids, outputText, generate, clear } =
        useUuidGenerator();

    // Copy individual UUID
    const copiedId = ref<string | null>(null);
    let copyTimeout: ReturnType<typeof setTimeout> | null = null;

    async function copyUuid(entry: { id: string; value: string }) {
        try {
            await navigator.clipboard.writeText(entry.value);
            copiedId.value = entry.id;
            if (copyTimeout) clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => {
                copiedId.value = null;
            }, 1500);
        } catch {
            // fallback
        }
    }

    // Copy all
    const copiedAll = ref(false);
    async function copyAll() {
        try {
            await navigator.clipboard.writeText(outputText.value);
            copiedAll.value = true;
            setTimeout(() => {
                copiedAll.value = false;
            }, 1500);
        } catch {
            // fallback
        }
    }

    function downloadUuids() {
        const blob = new Blob([outputText.value], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `uuids-${version.value}-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function adjustCount(delta: number) {
        count.value = Math.min(1000, Math.max(1, count.value + delta));
    }
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Version toggle -->
      <div class="inline-flex items-center rounded-lg border border-surface-border overflow-hidden">
        <button
          type="button"
          class="px-3 py-1.5 text-sm font-medium transition-colors"
          :class="version === 'v4'
            ? 'bg-brand-500 text-white'
            : 'bg-surface text-content-tertiary hover:bg-surface-secondary'"
          @click="version = 'v4'"
        >
          v4
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-sm font-medium transition-colors"
          :class="version === 'v7'
            ? 'bg-brand-500 text-white'
            : 'bg-surface text-content-tertiary hover:bg-surface-secondary'"
          @click="version = 'v7'"
        >
          v7
        </button>
      </div>

      <div class="w-px h-5 bg-surface-border" />

      <!-- Count -->
      <div class="inline-flex items-center gap-1">
        <button
          type="button"
          class="p-1 rounded text-gray-500 hover:bg-surface-secondary transition-colors"
          @click="adjustCount(-1)"
          :disabled="count <= 1"
        >
          <Minus :size="14" />
        </button>
        <input
          v-model.number="count"
          type="number"
          min="1"
          max="1000"
          class="w-14 text-center text-sm font-mono py-1 rounded-lg border border-surface-border bg-surface text-content focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
        <button
          type="button"
          class="p-1 rounded text-gray-500 hover:bg-surface-secondary transition-colors"
          @click="adjustCount(1)"
          :disabled="count >= 1000"
        >
          <Plus :size="14" />
        </button>
      </div>

      <div class="w-px h-5 bg-surface-border" />

      <!-- Uppercase toggle -->
      <label class="inline-flex items-center gap-2 cursor-pointer select-none">
        <button
          type="button"
          role="switch"
          :aria-checked="uppercase"
          class="relative flex h-5 w-9 items-center rounded-full px-0.5 transition-colors duration-200"
          :class="uppercase ? 'bg-brand-500' : 'bg-[var(--color-switch-off)]'"
          @click="uppercase = !uppercase"
        >
          <div
            class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
            :class="uppercase ? 'translate-x-4' : 'translate-x-0'"
          />
        </button>
        <span class="text-sm text-content-tertiary">UPPER</span>
      </label>

      <div class="w-px h-5 bg-surface-border" />

      <!-- Actions -->
      <button
        type="button"
        class="btn-primary text-sm !px-4 !py-1.5"
        @click="generate"
      >
        <RefreshCw :size="14" class="mr-1.5 inline -mt-0.5" />
        Generate
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg text-content-tertiary hover:bg-surface-secondary hover:text-content transition-colors"
        @click="copyAll"
      >
        <component :is="copiedAll ? Check : Copy" :size="15" />
        <span class="hidden sm:inline">{{ copiedAll ? 'Copied!' : 'Copy all' }}</span>
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg text-content-tertiary hover:bg-surface-secondary hover:text-content transition-colors"
        @click="downloadUuids"
      >
        <Download :size="15" />
        <span class="hidden sm:inline">Download</span>
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg text-content-tertiary hover:bg-surface-secondary hover:text-content transition-colors"
        @click="clear"
      >
        <Eraser :size="15" />
        <span class="hidden sm:inline">Clear</span>
      </button>
    </div>

    <!-- UUID Output -->
    <div class="rounded-xl border border-surface-border overflow-hidden bg-surface">
      <div class="flex items-center justify-between px-4 py-2.5 border-b border-surface-border bg-surface-secondary">
        <span class="text-sm font-semibold text-content">
          {{ formattedUuids.length }} UUID{{ formattedUuids.length !== 1 ? 's' : '' }}
          <span class="font-normal text-content-muted">· {{ version.toUpperCase() }}</span>
        </span>
      </div>
      <div class="divide-y divide-surface-border/50 max-h-[460px] overflow-y-auto">
        <div
          v-for="entry in formattedUuids"
          :key="entry.id"
          class="group flex items-center gap-3 px-4 py-2.5 hover:bg-surface-secondary/50 transition-colors cursor-pointer"
          @click="copyUuid(entry)"
        >
          <code class="flex-1 text-sm font-mono text-content select-all">{{ entry.value }}</code>
          <span
            class="shrink-0 text-xs text-content-faint opacity-0 group-hover:opacity-100 transition-opacity"
            :class="copiedId === entry.id ? '!opacity-100 !text-green-500 dark:!text-green-400' : ''"
          >
            <component :is="copiedId === entry.id ? Check : Copy" :size="14" />
          </span>
        </div>
      </div>
    </div>

    <!-- Version info -->
    <div class="flex gap-4">
      <div
        class="flex-1 rounded-xl border p-4 transition-colors"
        :class="version === 'v4'
          ? 'border-brand-200 bg-brand-50/50 dark:border-brand-800/50 dark:bg-brand-900/10'
          : 'border-surface-border bg-surface'"
      >
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-sm font-semibold text-content">UUID v4</span>
          <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-secondary text-content-tertiary">Random</span>
        </div>
        <p class="text-xs text-content-muted leading-relaxed">
          122 random bits. No ordering or timestamp. Best for general-purpose unique identifiers.
        </p>
      </div>
      <div
        class="flex-1 rounded-xl border p-4 transition-colors"
        :class="version === 'v7'
          ? 'border-brand-200 bg-brand-50/50 dark:border-brand-800/50 dark:bg-brand-900/10'
          : 'border-surface-border bg-surface'"
      >
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-sm font-semibold text-content">UUID v7</span>
          <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-secondary text-content-tertiary">Time-sorted</span>
        </div>
        <p class="text-xs text-content-muted leading-relaxed">
          48-bit Unix timestamp + random. Sortable by creation time. Ideal for database primary keys.
        </p>
      </div>
    </div>

  </div>
</template>
