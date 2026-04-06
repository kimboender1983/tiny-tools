<script setup lang="ts">
    import type { IFooterSection } from "@tiny-tools/shared";
    import { TOOLS } from "@tiny-tools/shared";
    import { Cookie } from "lucide-vue-next";

    const { data: nav } = useNavigation();
    const { openSettings: openCookieSettings } = useCookieConsent();

    const fallbackSections: IFooterSection[] = [
        {
            title: "Tools",
            order: 1,
            items: TOOLS.map((t) => ({ title: t.name, slug: t.slug, path: `/tools/${t.slug}` })),
        },
        { title: "Resources", order: 2, items: [{ title: "Blog", slug: "blog", path: "/blog" }] },
        {
            title: "Legal",
            order: 3,
            items: [
                { title: "Privacy Policy", slug: "privacy", path: "/privacy" },
                { title: "Terms of Use", slug: "terms", path: "/terms" },
            ],
        },
    ];

    const footerSections = computed(() =>
        nav.value.footer.length > 0 ? nav.value.footer : fallbackSections,
    );
</script>

<template>
  <footer class="border-t border-surface-border bg-surface">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8" :class="`lg:grid-cols-${footerSections.length + 1}`">
        <div>
          <div class="mb-3 text-content">
            <UiLogo :height="24" />
          </div>
          <p class="text-sm text-content-tertiary">
            Tutorials, opinions, and tools for modern web development. Written by a developer, for developers.
          </p>
        </div>

        <div v-for="section in footerSections" :key="section.title">
          <h3 class="text-sm font-semibold text-content mb-3">{{ section.title }}</h3>
          <ul class="space-y-2">
            <li v-for="item in section.items" :key="item.slug">
              <NuxtLink
                :to="item.path"
                class="text-sm text-content-muted hover:text-brand-500 transition-colors"
              >
                {{ item.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-content-muted">
        <span>&copy; {{ new Date().getFullYear() }} Pickbox. All rights reserved.</span>
        <button
          class="inline-flex items-center gap-1.5 text-sm text-content-faint transition-colors hover:text-content-secondary"
          @click="openCookieSettings"
        >
          <Cookie :size="14" />
          Cookie Settings
        </button>
      </div>
    </div>
  </footer>
</template>
