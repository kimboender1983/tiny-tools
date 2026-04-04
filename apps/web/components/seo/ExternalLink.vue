<script setup lang="ts">
    import { ExternalLink } from "lucide-vue-next";

    defineProps<{
        href: string;
        title: string;
        description: string;
    }>();
</script>

<template>
  <a
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-center gap-3 p-4 rounded-lg border border-surface-border bg-surface-secondary hover:border-brand-300 hover:bg-brand-50 transition-colors group"
  >
    <ExternalLink :size="16" class="text-content-faint group-hover:text-brand-500 shrink-0" />
    <div>
      <div class="text-sm font-medium text-content group-hover:text-brand-accent">{{ title }}</div>
      <div class="text-xs text-content-muted">{{ description }}</div>
    </div>
  </a>
</template>
