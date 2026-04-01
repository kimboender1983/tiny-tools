<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import type { IFooterSection } from '@tiny-tools/shared';

const { data: nav } = useNavigation();

const fallbackSections: IFooterSection[] = [
  { title: 'Tools', order: 1, items: TOOLS.map(t => ({ title: t.name, slug: t.slug, path: `/tools/${t.slug}` })) },
  { title: 'Resources', order: 2, items: [{ title: 'Blog', slug: 'blog', path: '/blog' }] },
  { title: 'Legal', order: 3, items: [{ title: 'Privacy Policy', slug: 'privacy', path: '/privacy' }, { title: 'Terms of Use', slug: 'terms', path: '/terms' }] },
];

const footerSections = computed(() =>
  nav.value.footer.length > 0 ? nav.value.footer : fallbackSections
);
</script>

<template>
  <footer class="border-t border-surface-border dark:border-surface-dark-border bg-surface dark:bg-surface-dark">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8" :class="`lg:grid-cols-${footerSections.length + 1}`">
        <div>
          <div class="font-bold text-lg mb-3">
            <span class="text-brand-500">Tiny</span><span>Tools</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Free, fast developer tools that run entirely in your browser. Your data never leaves your device.
          </p>
        </div>

        <div v-for="section in footerSections" :key="section.title">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{{ section.title }}</h3>
          <ul class="space-y-2">
            <li v-for="item in section.items" :key="item.slug">
              <NuxtLink
                :to="item.path"
                class="text-sm text-gray-500 hover:text-brand-500 transition-colors dark:text-gray-400"
              >
                {{ item.title }}
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
