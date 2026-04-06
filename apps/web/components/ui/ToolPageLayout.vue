<script setup lang="ts">
    import type { IBlogPost, ICategory } from "@tiny-tools/shared";
    import { ArrowRight, Calendar, ChevronRight, Clock, Home } from "lucide-vue-next";

    interface PaginatedBlogResponse {
        items: IBlogPost[];
        total: number;
    }

    const props = defineProps<{
        title: string;
        description: string;
        category: string;
        fullWidth?: boolean;
    }>();

    const { isEnabled: adsEnabled } = useAds();

    function getCategorySlug(cat: string | ICategory | undefined): string {
        if (!cat) return "uncategorized";
        return typeof cat === "object" ? cat.slug : cat;
    }

    function getCategoryName(cat: string | ICategory | undefined): string {
        if (!cat) return "";
        return typeof cat === "object" ? cat.name : cat;
    }

    function blogPostUrl(post: IBlogPost): string {
        return `/blog/${getCategorySlug(post.category)}/${post.slug}`;
    }

    function getCardImageUrl(post: IBlogPost): string {
        const logoSlug = post.techLogo && typeof post.techLogo === "object" ? post.techLogo.slug : "";
        const params = new URLSearchParams();
        if (logoSlug) params.set("logo", logoSlug);
        if (post.techLogoBgColor) params.set("bg", post.techLogoBgColor);
        return `/card-image.png${params.toString() ? `?${params}` : ""}`;
    }

    function formatDate(date: Date | string | undefined): string {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    // Fetch recent blog posts to show as related content on tool pages
    const api = useApi();

    const { data: relatedData } = await useAsyncData(
        `tool-related-${props.title}`,
        () => api.get<PaginatedBlogResponse>("/content/blog", {
            params: { limit: 3, sortBy: "publishedAt", sortOrder: "desc" },
        }).catch(() => ({ items: [], total: 0 })),
    );

    const relatedPosts = computed(() => relatedData.value?.items ?? []);
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

    <!-- Related blog posts -->
    <div v-if="relatedPosts.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div class="border-t border-surface-border pt-10">
        <div class="flex items-end justify-between mb-6">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wider text-brand-accent mb-1">From the blog</p>
            <h2 class="text-xl font-bold text-content">Related Articles</h2>
          </div>
          <NuxtLink
            to="/blog"
            class="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-accent hover:text-brand-600 transition-colors group"
          >
            More articles <ArrowRight :size="14" class="transition-transform group-hover:translate-x-0.5" />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <NuxtLink
            v-for="post in relatedPosts"
            :key="post._id"
            :to="blogPostUrl(post)"
            class="group flex flex-col rounded-xl border border-surface-border bg-surface overflow-hidden transition-shadow hover:shadow-lg"
          >
            <div class="aspect-video overflow-hidden">
              <img
                :src="post.coverImage || getCardImageUrl(post)"
                :alt="post.title"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div class="p-4 flex-1 flex flex-col">
              <span v-if="post.category" class="text-[11px] font-semibold uppercase tracking-wider text-brand-accent mb-1">
                {{ getCategoryName(post.category) }}
              </span>
              <h3 class="text-sm font-semibold text-content group-hover:text-brand-accent transition-colors line-clamp-2 leading-snug">
                {{ post.title }}
              </h3>
              <div class="mt-auto pt-3 flex items-center gap-3 text-[11px] text-content-muted">
                <span v-if="post.publishedAt" class="inline-flex items-center gap-1">
                  <Calendar :size="10" /> {{ formatDate(post.publishedAt) }}
                </span>
                <span v-if="post.readingTime" class="inline-flex items-center gap-1">
                  <Clock :size="10" /> {{ post.readingTime }} min
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
