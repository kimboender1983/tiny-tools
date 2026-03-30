<script setup lang="ts">
import { Menu, X, Sun, Moon, Github } from 'lucide-vue-next';
import { TOOLS } from '@tiny-tools/shared';

const colorMode = useColorMode();
const mobileMenuOpen = ref(false);

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
}

watch(() => useRoute().path, () => {
  mobileMenuOpen.value = false;
});
</script>

<template>
  <header class="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-surface-border dark:bg-surface-dark/80 dark:border-surface-dark-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg">
        <span class="text-brand-500">Tiny</span><span>Tools</span>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink
          v-for="tool in TOOLS"
          :key="tool.slug"
          :to="`/${tool.slug}`"
          class="px-3 py-1.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200"
          active-class="!bg-brand-50 !text-brand-600 dark:!bg-brand-900/20 dark:!text-brand-400"
        >
          {{ tool.name }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <button
          @click="toggleTheme"
          class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200"
          :aria-label="colorMode.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <Sun v-if="colorMode.value === 'dark'" :size="18" />
          <Moon v-else :size="18" />
        </button>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener"
          class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200"
          aria-label="GitHub"
        >
          <Github :size="18" />
        </a>

        <button
          class="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-surface-dark-secondary"
          @click="mobileMenuOpen = !mobileMenuOpen"
          :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
        >
          <X v-if="mobileMenuOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileMenuOpen"
        class="md:hidden border-t border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark"
      >
        <nav class="p-4 space-y-1">
          <NuxtLink
            v-for="tool in TOOLS"
            :key="tool.slug"
            :to="`/${tool.slug}`"
            class="block px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200"
            active-class="!bg-brand-50 !text-brand-600 dark:!bg-brand-900/20 dark:!text-brand-400"
          >
            {{ tool.name }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>
