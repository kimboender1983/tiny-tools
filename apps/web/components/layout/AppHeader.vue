<script setup lang="ts">
    import { TOOLS } from "@tiny-tools/shared";
    import {
        Check,
        ChevronDown,
        Circle,
        Menu,
        Moon,
        Palette,
        PartyPopper,
        Sun,
        X,
    } from "lucide-vue-next";

    const colorMode = useColorMode();
    const mobileMenuOpen = ref(false);
    const themeMenuOpen = ref(false);
    const { data: nav } = useNavigation();
    const headerItems = computed(() =>
        nav.value.header.length > 0
            ? nav.value.header
            : TOOLS.map((t) => ({ title: t.name, slug: t.slug, path: `/tools/${t.slug}` })),
    );

    const MAIN_MODES = ["light", "dark", "grayscale"] as const;

    const ALL_THEMES = [
        { id: "light", label: "Light", icon: Sun },
        { id: "dark", label: "Dark", icon: Moon },
        { id: "grayscale", label: "Grayscale", icon: Circle },
        { id: "vibrant", label: "Vibrant", icon: Palette },
        { id: "party", label: "Party", icon: PartyPopper },
    ] as const;

    function toggleTheme() {
        const idx = MAIN_MODES.indexOf(colorMode.value as (typeof MAIN_MODES)[number]);
        if (idx >= 0) {
            colorMode.preference = MAIN_MODES[(idx + 1) % MAIN_MODES.length];
        } else {
            colorMode.preference = "light";
        }
    }

    function selectTheme(id: string) {
        colorMode.preference = id;
        themeMenuOpen.value = false;
    }

    const themeIcon = computed(() => {
        return ALL_THEMES.find((t) => t.id === colorMode.value)?.icon ?? Sun;
    });

    const themeLabel = computed(() => {
        const current = ALL_THEMES.find((t) => t.id === colorMode.value);
        return current ? `Current: ${current.label}` : "Switch theme";
    });

    function onClickOutside(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-theme-menu]")) {
            themeMenuOpen.value = false;
        }
    }

    watch(themeMenuOpen, (open) => {
        if (open) {
            document.addEventListener("click", onClickOutside, { capture: true });
        } else {
            document.removeEventListener("click", onClickOutside, { capture: true });
        }
    });

    watch(
        () => useRoute().path,
        () => {
            mobileMenuOpen.value = false;
            themeMenuOpen.value = false;
        },
    );
</script>

<template>
  <header class="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-surface-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center text-content hover:text-brand-500 transition-colors">
        <UiLogo :height="28" />
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
          <div class="relative" data-theme-menu>
            <div class="flex items-center">
              <button
                @click="toggleTheme"
                class="p-2 rounded-l-lg text-content-secondary hover:bg-surface-secondary hover:text-content transition-colors"
                :aria-label="themeLabel"
                :title="themeLabel"
              >
                <component :is="themeIcon" :size="18" />
              </button>
              <button
                @click.stop="themeMenuOpen = !themeMenuOpen"
                class="p-2 -ml-1 rounded-r-lg text-content-faint hover:bg-surface-secondary hover:text-content transition-colors"
                aria-label="All themes"
                title="All themes"
              >
                <ChevronDown :size="12" class="transition-transform duration-150" :class="themeMenuOpen ? 'rotate-180' : ''" />
              </button>
            </div>

            <Transition
              enter-active-class="transition-all duration-150 ease-out"
              enter-from-class="opacity-0 scale-95 -translate-y-1"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-100 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 -translate-y-1"
            >
              <div
                v-if="themeMenuOpen"
                class="absolute right-0 top-full mt-2 w-44 rounded-xl border border-surface-border bg-surface shadow-lg overflow-hidden z-50"
              >
                <div class="py-1">
                  <button
                    v-for="theme in ALL_THEMES"
                    :key="theme.id"
                    @click="selectTheme(theme.id)"
                    class="w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors"
                    :class="colorMode.value === theme.id
                      ? 'bg-brand-50 text-brand-accent font-medium'
                      : 'text-content-secondary hover:bg-surface-secondary hover:text-content'"
                  >
                    <component :is="theme.icon" :size="16" />
                    <span class="flex-1 text-left">{{ theme.label }}</span>
                    <Check v-if="colorMode.value === theme.id" :size="14" class="text-brand-500" />
                  </button>
                </div>
              </div>
            </Transition>
          </div>
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
