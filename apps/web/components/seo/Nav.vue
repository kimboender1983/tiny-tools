<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';

defineProps<{
  links: { id: string; label: string }[];
}>();
</script>

<template>
  <nav class="mb-6 flex flex-wrap gap-2">
    <a
      v-for="link in links"
      :key="link.id"
      :href="`#${link.id}`"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-surface-secondary text-content-secondary hover:bg-brand-50 hover:text-brand-accent transition-colors scroll-smooth"
    >
      <ChevronRight :size="14" />
      {{ link.label }}
    </a>
  </nav>
</template>
