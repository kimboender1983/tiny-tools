<script setup lang="ts">
    import { TOOLS } from "@tiny-tools/shared";
    import { Sparkles } from "lucide-vue-next";

    useHead({
        title: "Pickbox — Free Online Developer Tools",
        meta: [
            {
                name: "description",
                content:
                    "Free, fast developer tools that run entirely in your browser. JSON formatter, diff checker, JWT decoder, image compressor, and more. Your data never leaves your device.",
            },
            { property: "og:title", content: "Pickbox — Free Online Developer Tools" },
            {
                property: "og:description",
                content:
                    "Free, fast developer tools that run entirely in your browser. Your data never leaves your device.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
    });
</script>

<template>
  <div>
    <!-- Hero with animated background -->
    <div class="relative overflow-hidden">
      <UiHeroBackground />

      <section class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 sm:pb-10 text-center">
        <div class="hero-enter hero-enter-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-accent text-sm font-medium mb-4">
          <Sparkles :size="14" />
          100% client-side — your data never leaves your browser
        </div>

        <h1 class="hero-enter hero-enter-2 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-content">
          Free Developer Tools,
          <br class="hidden sm:block" />
          <span class="bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 bg-clip-text text-transparent">Instantly Ready</span>
        </h1>

        <p class="hero-enter hero-enter-3 mt-4 text-lg sm:text-xl text-content-tertiary max-w-2xl mx-auto">
          A growing collection of small, fast, free developer tools. No sign-up required. No data uploaded. Just paste and go.
        </p>
      </section>
    </div>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <UiToolCard
          v-for="(tool, index) in TOOLS"
          :key="tool.slug"
          :tool="tool"
          :index="index"
        />
      </div>
    </section>

    <!-- Featured blog posts -->
    <UiHomeFeaturedBlog />
  </div>
</template>

<style scoped>
@keyframes hero-fade-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-enter {
  animation: hero-fade-up 0.6s ease-out both;
}
.hero-enter-1 { animation-delay: 0s; }
.hero-enter-2 { animation-delay: 0.1s; }
.hero-enter-3 { animation-delay: 0.2s; }
</style>
