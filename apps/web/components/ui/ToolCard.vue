<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';
import * as icons from 'lucide-vue-next';
import type { IToolMeta } from '@tiny-tools/shared';

const props = defineProps<{
  tool: IToolMeta;
  index?: number;
}>();

const iconComponent = computed(() => {
  const icon = (icons as Record<string, unknown>)[props.tool.icon];
  return icon ?? null;
});

const entranceDelay = computed(() =>
  props.index != null ? `${props.index * 60}ms` : '0ms',
);
</script>

<template>
  <NuxtLink
    :to="`/tools/${tool.slug}`"
    class="tool-card group relative flex flex-col p-5 h-full card-enter"
    :style="{ animationDelay: entranceDelay }"
  >
    <!-- Gradient border overlay -->
    <div class="gradient-border" />

    <div class="flex items-start gap-3.5 mb-3">
      <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0 transition-all duration-300 group-hover:bg-brand-100 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] dark:group-hover:bg-brand-900/30 dark:group-hover:shadow-[0_0_20px_rgba(96,165,250,0.15)]">
        <component :is="iconComponent" v-if="iconComponent" :size="20" />
      </div>
      <div class="min-w-0">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
          {{ tool.name }}
        </h3>
        <span class="inline-block mt-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-100 text-gray-500 dark:bg-surface-dark-secondary dark:text-gray-400">
          {{ tool.category }}
        </span>
      </div>
    </div>

    <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
      {{ tool.description }}
    </p>

    <div class="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400">
      Use tool
      <ArrowRight :size="14" class="transition-transform group-hover:translate-x-0.5" />
    </div>
  </NuxtLink>
</template>

<style scoped>
/* Gradient border that fades in on hover */
.gradient-border {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, #60A5FA, #2563EB, #1D4ED8);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  opacity: 0;
  transition: opacity 0.25s ease-out;
  pointer-events: none;
}

.tool-card:hover .gradient-border {
  opacity: 1;
}

/* Staggered card entrance */
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-enter {
  animation: card-enter 0.45s ease-out both;
}
</style>
