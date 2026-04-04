<script setup lang="ts">
    import { ChevronRight, Home } from "lucide-vue-next";

    defineProps<{
        title: string;
        description: string;
        category: string;
        /** When true, the tool gets full viewport width (no sidebar, no max-w constraint). Use for code-heavy tools like JSON formatter/diff. */
        fullWidth?: boolean;
    }>();

    const { isEnabled: adsEnabled } = useAds();
</script>

<template>
  <div class="min-h-[calc(100vh-3.5rem)]">
    <!-- Breadcrumb -->
    <div class="mx-auto px-4 sm:px-6 pt-4" :class="fullWidth ? 'max-w-full' : 'max-w-7xl'">
      <nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm text-content-muted">
        <NuxtLink
          to="/"
          class="flex items-center gap-1 hover:text-content-secondary transition-colors"
        >
          <Home :size="14" />
          <span>Home</span>
        </NuxtLink>
        <ChevronRight :size="14" class="text-content-faint" />
        <span class="text-content font-medium">{{ title }}</span>
      </nav>
    </div>

    <!-- Header -->
    <div class="mx-auto px-4 sm:px-6 pt-3 pb-4" :class="fullWidth ? 'max-w-full' : 'max-w-7xl'">
      <div class="flex items-center gap-3 mb-1">
        <h1 class="text-xl sm:text-2xl font-bold text-content">
          {{ title }}
        </h1>
        <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-brand-50 text-brand-accent">
          {{ category }}
        </span>
      </div>
      <p class="text-sm text-content-tertiary max-w-2xl">
        {{ description }}
      </p>
    </div>

    <!-- Leaderboard ad above tool -->
    <div class="mx-auto px-4 sm:px-6 mb-4" :class="fullWidth ? 'max-w-4xl' : 'max-w-7xl'">
      <AdsAdUnit slot="leaderboard-top" format="leaderboard" />
    </div>

    <!-- Tool content: full-width mode -->
    <template v-if="fullWidth">
      <div class="px-4 sm:px-6">
        <slot />
      </div>
    </template>

    <!-- Tool content: standard mode with optional sidebar -->
    <template v-else>
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex flex-col lg:flex-row gap-6">
          <div class="flex-1 min-w-0">
            <slot />
          </div>
          <aside v-if="adsEnabled" class="hidden lg:block w-[300px] shrink-0">
            <div class="sticky top-20">
              <AdsAdUnit slot="sidebar" format="rectangle" />
            </div>
          </aside>
        </div>
      </div>
    </template>

    <!-- In-content ad between tool and SEO content -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 my-8">
      <AdsAdUnit slot="in-content" format="leaderboard" />
    </div>

    <!-- SEO content -->
    <div v-if="$slots['seo-content']" class="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <slot name="seo-content" />
    </div>
  </div>
</template>
