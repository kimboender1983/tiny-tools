<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';
import * as icons from 'lucide-vue-next';

const props = defineProps<{
  to: string;
  icon: string;
  title: string;
  description: string;
}>();

const iconComponent = computed(() => {
  const icon = (icons as Record<string, unknown>)[props.icon];
  return icon ?? null;
});
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-3 p-4 rounded-lg border border-surface-border bg-surface-secondary hover:border-brand-300 hover:bg-brand-50 transition-colors group"
  >
    <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-accent shrink-0">
      <component :is="iconComponent" v-if="iconComponent" :size="18" />
    </div>
    <div class="min-w-0">
      <div class="text-sm font-semibold text-content group-hover:text-brand-accent transition-colors">{{ title }}</div>
      <div class="text-xs text-content-muted">{{ description }}</div>
    </div>
    <ArrowRight :size="16" class="text-content-faint group-hover:text-brand-500 ml-auto shrink-0 transition-colors" />
  </NuxtLink>
</template>
