<script setup lang="ts">
const splitRatio = ref(50);
const isDragging = ref(false);
const containerRef = ref<HTMLElement | null>(null);

function onPointerDown(e: PointerEvent) {
  e.preventDefault();
  isDragging.value = true;
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value || !containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percent = (x / rect.width) * 100;
  splitRatio.value = Math.min(Math.max(percent, 15), 85);
}

function onPointerUp() {
  isDragging.value = false;
}
</script>

<template>
  <!-- Mobile: stacked -->
  <div class="flex flex-col gap-4 md:hidden">
    <div class="min-h-0">
      <slot name="left" />
    </div>
    <div class="min-h-0">
      <slot name="right" />
    </div>
  </div>

  <!-- Desktop: resizable horizontal split -->
  <div
    ref="containerRef"
    class="hidden md:flex h-full relative"
    :class="{ 'select-none': isDragging }"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
  >
    <div class="min-w-0 overflow-hidden" :style="{ width: `${splitRatio}%` }">
      <slot name="left" />
    </div>

    <!-- Draggable divider -->
    <div
      class="relative z-10 flex items-center justify-center w-3 -mx-1.5 cursor-col-resize group"
      @pointerdown="onPointerDown"
    >
      <div
        class="w-px h-full transition-colors duration-150"
        :class="isDragging ? 'bg-brand-500' : 'bg-surface-border dark:bg-surface-dark-border group-hover:bg-brand-400'"
      />
      <div
        class="absolute top-1/2 -translate-y-1/2 w-3 h-8 rounded-full border transition-colors duration-150 flex items-center justify-center"
        :class="isDragging ? 'bg-brand-500 border-brand-500' : 'bg-surface border-surface-border dark:bg-surface-dark dark:border-surface-dark-border group-hover:border-brand-400'"
      >
        <div class="flex gap-px">
          <div
            class="w-0.5 h-3 rounded-full"
            :class="isDragging ? 'bg-white' : 'bg-gray-300 dark:bg-gray-600'"
          />
          <div
            class="w-0.5 h-3 rounded-full"
            :class="isDragging ? 'bg-white' : 'bg-gray-300 dark:bg-gray-600'"
          />
        </div>
      </div>
    </div>

    <div class="min-w-0 overflow-hidden" :style="{ width: `${100 - splitRatio}%` }">
      <slot name="right" />
    </div>
  </div>
</template>
