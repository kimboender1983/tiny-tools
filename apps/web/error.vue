<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; statusMessage?: string } }>();

const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-page-light dark:bg-page-dark px-4">
    <div class="text-center">
      <p class="text-6xl font-bold text-brand-500 mb-4">{{ props.error.statusCode }}</p>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
        {{ props.error.statusCode === 404 ? 'Page not found' : 'Something went wrong' }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mb-8">
        {{ props.error.statusCode === 404 ? 'The page you\'re looking for doesn\'t exist.' : (props.error.statusMessage || 'An unexpected error occurred.') }}
      </p>
      <button
        @click="handleError"
        class="px-6 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
      >
        Back to home
      </button>
    </div>
  </div>
</template>
