<script setup lang="ts">
import { Menu, X, Sun, Moon, Palette, PartyPopper, Circle } from 'lucide-vue-next';
import { TOOLS } from '@tiny-tools/shared';

const colorMode = useColorMode();
const mobileMenuOpen = ref(false);
const { data: nav } = useNavigation();
const headerItems = computed(() =>
  nav.value.header.length > 0
    ? nav.value.header
    : TOOLS.map(t => ({ title: t.name, slug: t.slug, path: `/tools/${t.slug}` }))
);

const MODES = ['light', 'dark', 'vibrant', 'party', 'grayscale'] as const;

function toggleTheme() {
  const current = MODES.indexOf(colorMode.value as typeof MODES[number]);
  colorMode.preference = MODES[(current + 1) % MODES.length];
}

const themeIcon = computed(() => {
  switch (colorMode.value) {
    case 'dark': return Moon;
    case 'vibrant': return Palette;
    case 'party': return PartyPopper;
    case 'grayscale': return Circle;
    default: return Sun;
  }
});

const themeLabel = computed(() => {
  switch (colorMode.value) {
    case 'dark': return 'Switch to vibrant mode';
    case 'vibrant': return 'Switch to party mode';
    case 'party': return 'Switch to grayscale mode';
    case 'grayscale': return 'Switch to light mode';
    default: return 'Switch to dark mode';
  }
});

watch(() => useRoute().path, () => {
  mobileMenuOpen.value = false;
});
</script>

<template>
  <header class="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-surface-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center font-bold text-lg">
        <span class="text-brand-500">Pick</span><span>box</span>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink
          v-for="item in headerItems"
          :key="item.slug"
          :to="item.path"
          class="px-3 py-1.5 text-sm font-medium text-content-tertiary rounded-lg hover:bg-surface-secondary hover:text-content transition-colors"
          active-class="!bg-brand-50 !text-brand-accent"
        >
          {{ item.title }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <ClientOnly>
          <button
            @click="toggleTheme"
            class="p-2 rounded-lg text-content-secondary hover:bg-surface-secondary hover:text-content transition-colors"
            :aria-label="themeLabel"
          >
            <component :is="themeIcon" :size="18" />
          </button>
          <template #fallback>
            <div class="p-2 w-[34px] h-[34px]" />
          </template>
        </ClientOnly>

        <button
          class="md:hidden p-2 rounded-lg text-content-muted hover:bg-surface-secondary transition-colors"
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
        class="md:hidden border-t border-surface-border bg-surface"
      >
        <nav class="p-4 space-y-1">
          <NuxtLink
            v-for="item in headerItems"
            :key="item.slug"
            :to="item.path"
            class="block px-3 py-2.5 text-sm font-medium text-content-tertiary rounded-lg hover:bg-surface-secondary hover:text-content transition-colors"
            active-class="!bg-brand-50 !text-brand-accent"
          >
            {{ item.title }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>
