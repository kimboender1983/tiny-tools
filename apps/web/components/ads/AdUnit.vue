<script setup lang="ts">
defineProps<{
  slot: string;
  format: 'leaderboard' | 'rectangle' | 'mobile-banner';
}>();

const { isEnabled } = useAds();
</script>

<template>
  <ClientOnly v-if="isEnabled">
    <div
      :data-ad-slot="slot"
      :data-ad-format="format"
    >
      <!-- Leaderboard: short banner on desktop, hidden on mobile (mobile-banner takes over) -->
      <div
        v-if="format === 'leaderboard'"
        class="hidden sm:flex w-full h-20 lg:h-24 items-center justify-center rounded-xl bg-surface border border-surface-border text-xs text-gray-400 dark:bg-surface-dark dark:border-surface-dark-border dark:text-gray-600"
      >
        Ad
      </div>

      <!-- Rectangle: medium block, responsive height -->
      <div
        v-else-if="format === 'rectangle'"
        class="w-full h-48 sm:h-56 lg:h-64 flex items-center justify-center rounded-xl bg-surface border border-surface-border text-xs text-gray-400 dark:bg-surface-dark dark:border-surface-dark-border dark:text-gray-600"
      >
        Ad
      </div>

      <!-- Mobile banner: thin strip, only on mobile -->
      <div
        v-else-if="format === 'mobile-banner'"
        class="sm:hidden w-full h-14 flex items-center justify-center rounded-xl bg-surface border border-surface-border text-xs text-gray-400 dark:bg-surface-dark dark:border-surface-dark-border dark:text-gray-600"
      >
        Ad
      </div>
    </div>

    <template #fallback>
      <div>
        <div v-if="format === 'leaderboard'" class="hidden sm:block w-full h-20 lg:h-24 rounded-xl bg-surface border border-surface-border dark:bg-surface-dark dark:border-surface-dark-border" />
        <div v-else-if="format === 'rectangle'" class="w-full h-48 sm:h-56 lg:h-64 rounded-xl bg-surface border border-surface-border dark:bg-surface-dark dark:border-surface-dark-border" />
        <div v-else-if="format === 'mobile-banner'" class="sm:hidden w-full h-14 rounded-xl bg-surface border border-surface-border dark:bg-surface-dark dark:border-surface-dark-border" />
      </div>
    </template>
  </ClientOnly>
</template>
