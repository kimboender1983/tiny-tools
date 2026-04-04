<script setup lang="ts">
    import { BookOpen, Code } from "lucide-vue-next";

    defineProps<{
        id: string;
        title: string;
        icon?: "book" | "code";
    }>();
</script>

<template>
  <section :id="id" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8">
    <h2 class="text-xl font-bold text-content mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
      <Code v-if="icon === 'code'" :size="20" class="text-brand-500" />
      <BookOpen v-else :size="20" class="text-brand-500" />

      {{ title }}
    </h2>
    <slot />
  </section>
</template>
