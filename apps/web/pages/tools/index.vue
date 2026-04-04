<script setup lang="ts">
    import { TOOL_CATEGORIES, TOOLS } from "@tiny-tools/shared";

    const siteUrl = useRuntimeConfig().public.siteUrl as string;

    useHead({
        title: "Free Developer Tools | Pickbox",
        meta: [
            {
                name: "description",
                content:
                    "Free, fast developer tools that run entirely in your browser. JSON formatter, JSON diff, JWT decoder, image compressor and more.",
            },
            { property: "og:title", content: "Free Developer Tools | Pickbox" },
            {
                property: "og:description",
                content: "Free, fast developer tools that run entirely in your browser.",
            },
            { property: "og:url", content: `${siteUrl}/tools` },
        ],
        link: [{ rel: "canonical", href: `${siteUrl}/tools` }],
    });

    const toolsByCategory = computed(() => {
        const map = new Map<string, typeof TOOLS>();
        for (const cat of TOOL_CATEGORIES) {
            map.set(
                cat,
                TOOLS.filter((t) => t.category === cat),
            );
        }
        return map;
    });
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
    <div class="text-center mb-12">
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-content mb-4">
        Developer Tools
      </h1>
      <p class="text-lg text-content-tertiary max-w-2xl mx-auto">
        Free, fast tools that run entirely in your browser. Your data never leaves your device.
      </p>
    </div>

    <div v-for="[category, tools] in toolsByCategory" :key="category" class="mb-12 last:mb-0">
      <h2 class="text-xl font-semibold text-content mb-4">{{ category }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiToolCard v-for="tool in tools" :key="tool.slug" :tool="tool" />
      </div>
    </div>
  </div>
</template>
