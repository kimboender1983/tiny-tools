<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';
import * as icons from 'lucide-vue-next';
import type { IToolMeta } from '@tiny-tools/shared';

const props = defineProps<{
  tool: IToolMeta;
}>();

const iconComponent = computed(() => {
  const icon = (icons as Record<string, unknown>)[props.tool.icon];
  return icon ?? null;
});
</script>

<template>
  <NuxtLink
    :to="`/${tool.slug}`"
    class="tool-card group flex flex-col p-5 h-full"
  >
    <div class="flex items-start gap-3.5 mb-3">
      <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0 transition-colors group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30">
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

    <div class="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      Use tool
      <ArrowRight :size="14" class="transition-transform group-hover:translate-x-0.5" />
    </div>
  </NuxtLink>
</template>
