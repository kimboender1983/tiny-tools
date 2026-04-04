<script setup lang="ts">
defineProps<{
  items: { question: string; answer: string }[];
}>();
</script>

<template>
  <div class="space-y-3">
    <details
      v-for="(faq, index) in items"
      :key="index"
      class="group rounded-lg border border-surface-border bg-surface-secondary overflow-hidden"
    >
      <summary class="cursor-pointer flex items-center justify-between gap-2 p-4 font-medium text-content hover:bg-surface-secondary transition-colors select-none [&::-webkit-details-marker]:hidden list-none">
        <span>{{ faq.question }}</span>
        <span class="shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-45 text-xl leading-none font-light">+</span>
      </summary>
      <p class="px-4 pb-4 text-content-tertiary leading-relaxed">
        {{ faq.answer }}
      </p>
    </details>
  </div>
</template>
