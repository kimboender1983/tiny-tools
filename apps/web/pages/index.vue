<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import { Sparkles } from 'lucide-vue-next';

useHead({
  title: 'TinyTools — Free Online Developer Tools',
  meta: [
    { name: 'description', content: 'Free, fast developer tools that run entirely in your browser. JSON formatter, diff checker, JWT decoder, image compressor, and more. Your data never leaves your device.' },
    { property: 'og:title', content: 'TinyTools — Free Online Developer Tools' },
    { property: 'og:description', content: 'Free, fast developer tools that run entirely in your browser. Your data never leaves your device.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
});
</script>

<template>
  <div>
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-sm font-medium mb-6 dark:bg-brand-900/20 dark:text-brand-400">
        <Sparkles :size="14" />
        100% client-side — your data never leaves your browser
      </div>

      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
        Free Developer Tools,
        <br class="hidden sm:block" />
        <span class="text-brand-500">Instantly Ready</span>
      </h1>

      <p class="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        A growing collection of small, fast, free developer tools. No sign-up required. No data uploaded. Just paste and go.
      </p>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <UiToolCard
          v-for="tool in TOOLS"
          :key="tool.slug"
          :tool="tool"
        />
      </div>
    </section>
  </div>
</template>
