<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
</script>

<template>
  <footer class="border-t border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div class="font-bold text-lg mb-3">
            <span class="text-brand-500">Tiny</span><span>Tools</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Free, fast developer tools that run entirely in your browser. Your data never leaves your device.
          </p>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Tools</h3>
          <ul class="space-y-2">
            <li v-for="tool in TOOLS" :key="tool.slug">
              <NuxtLink
                :to="`/${tool.slug}`"
                class="text-sm text-gray-500 hover:text-brand-500 transition-colors dark:text-gray-400"
              >
                {{ tool.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Resources</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/blog" class="text-sm text-gray-500 hover:text-brand-500 transition-colors dark:text-gray-400">
                Blog
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Legal</h3>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/privacy" class="text-sm text-gray-500 hover:text-brand-500 transition-colors dark:text-gray-400">
                Privacy Policy
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/terms" class="text-sm text-gray-500 hover:text-brand-500 transition-colors dark:text-gray-400">
                Terms of Use
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-surface-border dark:border-surface-dark-border text-center text-sm text-gray-500 dark:text-gray-500">
        &copy; {{ new Date().getFullYear() }} TinyTools. All rights reserved.
      </div>
    </div>
  </footer>
</template>
