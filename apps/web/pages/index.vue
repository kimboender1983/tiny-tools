<script setup lang="ts">
    import type { IBlogPost, ICategory } from "@tiny-tools/shared";
    import { TOOLS } from "@tiny-tools/shared";
    import * as lucideIcons from "lucide-vue-next";
    import { ArrowRight, Calendar, ChevronRight, Clock, Sparkles } from "lucide-vue-next";

    function getToolIcon(iconName: string) {
        return (lucideIcons as Record<string, unknown>)[iconName] ?? null;
    }

    interface PaginatedBlogResponse {
        items: IBlogPost[];
        total: number;
        page: number;
        pageSize: number;
    }

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
        if (post.techLogoColor) params.set("color", post.techLogoColor);
        if (post.techLogoBgColor) params.set("bg", post.techLogoBgColor);
        if (post.techLogoBgColorTo) params.set("bgTo", post.techLogoBgColorTo);
        if (post.techLogoPickboxColor) params.set("pickboxColor", post.techLogoPickboxColor);
        const qs = params.toString();
        return `/card-image.png${qs ? `?${qs}` : ""}`;
    }

    function formatDate(date: Date | string | undefined): string {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    const api = useApi();
    const config = useRuntimeConfig();
    const siteUrl = config.public.siteUrl as string;

    // Fetch hero + featured + recent + categories in parallel
    const [{ data: heroData }, { data: featuredData }, { data: recentData }, { data: categoriesData }] = await Promise.all([
        useAsyncData("home-hero", () =>
            api.get<PaginatedBlogResponse>("/content/blog", {
                params: { homepageHero: "true", limit: 1 },
            }).then((res) => {
                // Fallback to featuredHomepage if no hero post
                if (res.items.length > 0) return res;
                return api.get<PaginatedBlogResponse>("/content/blog", {
                    params: { featuredHomepage: "true", limit: 1 },
                });
            }),
        ),
        useAsyncData("home-featured", () =>
            api.get<PaginatedBlogResponse>("/content/blog", {
                params: { featured: "true", limit: 6 },
            }),
        ),
        useAsyncData("home-recent", () =>
            api.get<PaginatedBlogResponse>("/content/blog", {
                params: { limit: 6, sortBy: "publishedAt", sortOrder: "desc" },
            }),
        ),
        useAsyncData("home-categories", () => api.get<ICategory[]>("/content/categories")),
    ]);

    const heroPost = computed(() => {
        const items = heroData.value?.items ?? [];
        return items[0] || null;
    });

    const featuredPosts = computed(() => {
        const items = featuredData.value?.items ?? [];
        const heroId = heroPost.value?._id;
        return items.filter((p) => p._id !== heroId).slice(0, 3);
    });

    const recentPosts = computed(() => {
        const items = recentData.value?.items ?? [];
        const heroId = heroPost.value?._id;
        const featuredIds = new Set(featuredPosts.value.map((p) => p._id));
        return items.filter((p) => p._id !== heroId && !featuredIds.has(p._id)).slice(0, 6);
    });

    const categories = computed(() => categoriesData.value ?? []);

    const compactTools = computed(() => TOOLS.slice(0, 8));

    useHead({
        title: "Pickbox — Tutorials, Opinions & Dev Tools",
        meta: [
            { name: "description", content: "Honest takes on modern web development. Tutorials, tool reviews, and opinions from a freelance full-stack developer. Plus free browser-based dev tools." },
            { property: "og:title", content: "Pickbox — Tutorials, Opinions & Dev Tools" },
            { property: "og:description", content: "Honest takes on modern web development. Tutorials, tool reviews, and opinions." },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
    });
</script>

<template>
  <div>
    <!-- Hero: Tagline + Hero Blog Post -->
    <section class="relative overflow-hidden">
      <UiHeroBackground />
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10 sm:pb-14">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <!-- Left: Blog-first tagline -->
          <div class="lg:col-span-2">
            <div class="hero-enter hero-enter-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-accent text-sm font-medium mb-4">
              <Sparkles :size="14" />
              Written by a developer, for developers
            </div>
            <h1 class="hero-enter hero-enter-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-content leading-tight">
              Honest Takes on
              <span class="bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 bg-clip-text text-transparent">Modern Web Dev</span>
            </h1>
            <p class="hero-enter hero-enter-3 mt-4 text-lg text-content-tertiary">
              Tutorials, opinions, and tool deep-dives from the trenches of full-stack JavaScript development.
            </p>
            <div class="hero-enter hero-enter-3 mt-6 flex items-center gap-3">
              <NuxtLink
                to="/blog"
                class="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                Read the Blog <ArrowRight :size="14" />
              </NuxtLink>
              <NuxtLink
                to="/tools"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-content-muted text-sm hover:text-content-secondary transition-colors"
              >
                Free Dev Tools <ChevronRight :size="14" />
              </NuxtLink>
            </div>
          </div>

          <!-- Right: Hero Blog Post -->
          <div class="lg:col-span-3">
            <NuxtLink
              v-if="heroPost"
              :to="blogPostUrl(heroPost)"
              class="hero-enter hero-enter-2 group block relative rounded-2xl overflow-hidden bg-surface border border-surface-border transition-all duration-300 hover:shadow-xl hover:border-brand-300/50"
            >
              <div class="aspect-[16/9] overflow-hidden">
                <img
                  :src="heroPost.coverImage || getCardImageUrl(heroPost)"
                  :alt="heroPost.title"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div class="absolute bottom-0 inset-x-0 p-5 sm:p-6">
                <span
                  v-if="heroPost.category"
                  class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/90 text-white mb-2"
                >
                  {{ getCategoryName(heroPost.category) }}
                </span>
                <h2 class="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight line-clamp-2 group-hover:text-brand-200 transition-colors">
                  {{ heroPost.title }}
                </h2>
                <p class="mt-1.5 text-sm text-white/70 line-clamp-2 hidden sm:block">
                  {{ heroPost.excerpt }}
                </p>
                <div class="mt-2 flex items-center gap-3 text-xs text-white/50">
                  <span v-if="heroPost.publishedAt" class="inline-flex items-center gap-1">
                    <Calendar :size="12" />
                    {{ formatDate(heroPost.publishedAt) }}
                  </span>
                  <span v-if="heroPost.readingTime" class="inline-flex items-center gap-1">
                    <Clock :size="12" />
                    {{ heroPost.readingTime }} min
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Category nav + Search -->
    <section v-if="categories.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex flex-wrap gap-2 flex-1">
          <NuxtLink
            to="/blog"
            class="inline-flex items-center px-3 py-1.5 rounded-full border border-surface-border bg-surface text-xs font-medium text-content-secondary hover:bg-brand-50 hover:border-brand-300 hover:text-brand-accent transition-colors"
          >
            All Posts
          </NuxtLink>
          <NuxtLink
            v-for="cat in categories"
            :key="cat._id"
            :to="`/blog/${cat.slug}`"
            class="inline-flex items-center px-3 py-1.5 rounded-full border border-surface-border bg-surface text-xs font-medium text-content-secondary hover:bg-brand-50 hover:border-brand-300 hover:text-brand-accent transition-colors"
          >
            {{ cat.name }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Recent Posts — mixed layout -->
    <section v-if="recentPosts.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <div class="flex items-end justify-between mb-6">
        <h2 class="text-xl sm:text-2xl font-bold text-content">Recent Posts</h2>
        <NuxtLink to="/blog" class="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-accent hover:text-brand-600 transition-colors group">
          View all <ArrowRight :size="14" class="transition-transform group-hover:translate-x-0.5" />
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <!-- First post — large -->
        <NuxtLink
          v-if="recentPosts[0]"
          :to="blogPostUrl(recentPosts[0])"
          class="lg:col-span-3 group flex flex-col rounded-xl border border-surface-border bg-surface overflow-hidden transition-shadow hover:shadow-lg"
        >
          <div class="aspect-video overflow-hidden">
            <img
              :src="recentPosts[0].coverImage || getCardImageUrl(recentPosts[0])"
              :alt="recentPosts[0].title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <span v-if="recentPosts[0].category" class="text-xs font-semibold uppercase tracking-wider text-brand-accent mb-1.5">
              {{ getCategoryName(recentPosts[0].category) }}
            </span>
            <h3 class="text-lg font-bold text-content group-hover:text-brand-accent transition-colors line-clamp-2">
              {{ recentPosts[0].title }}
            </h3>
            <p class="mt-2 text-sm text-content-muted line-clamp-2">{{ recentPosts[0].excerpt }}</p>
            <div class="mt-auto pt-3 flex items-center gap-3 text-xs text-content-muted">
              <span v-if="recentPosts[0].publishedAt" class="inline-flex items-center gap-1">
                <Calendar :size="12" /> {{ formatDate(recentPosts[0].publishedAt) }}
              </span>
              <span v-if="recentPosts[0].readingTime" class="inline-flex items-center gap-1">
                <Clock :size="12" /> {{ recentPosts[0].readingTime }} min read
              </span>
            </div>
          </div>
        </NuxtLink>

        <!-- Remaining posts — stacked list on the right -->
        <div v-if="recentPosts.length > 1" class="lg:col-span-2 flex flex-col gap-3">
          <NuxtLink
            v-for="post in recentPosts.slice(1)"
            :key="post._id"
            :to="blogPostUrl(post)"
            class="group flex gap-3 p-3 rounded-xl border border-surface-border bg-surface transition-all hover:shadow-md hover:border-brand-300/50 flex-1"
          >
            <div class="w-20 h-20 rounded-lg overflow-hidden shrink-0">
              <img
                :src="post.coverImage || getCardImageUrl(post)"
                :alt="post.title"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            <div class="flex flex-col justify-center min-w-0 flex-1">
              <span v-if="post.category" class="text-[11px] font-semibold uppercase tracking-wider text-brand-accent mb-0.5">
                {{ getCategoryName(post.category) }}
              </span>
              <h3 class="text-sm font-semibold text-content group-hover:text-brand-accent transition-colors line-clamp-2 leading-snug">
                {{ post.title }}
              </h3>
              <div class="mt-1 flex items-center gap-2 text-[11px] text-content-muted">
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
    </section>


    <!-- Featured Posts -->
    <section v-if="featuredPosts.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <div class="flex items-end justify-between mb-6">
        <h2 class="text-xl sm:text-2xl font-bold text-content">Featured</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <NuxtLink
          v-for="post in featuredPosts"
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
            <p class="mt-1.5 text-xs text-content-muted line-clamp-2">{{ post.excerpt }}</p>
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
    </section>

    <!-- Compact Tools Row -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div class="flex items-end justify-between mb-4">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wider text-brand-accent mb-1">Free & open</p>
          <h2 class="text-xl sm:text-2xl font-bold text-content">Developer Tools</h2>
        </div>
        <NuxtLink to="/tools" class="inline-flex items-center gap-1 text-sm font-medium text-brand-accent hover:text-brand-600 transition-colors group">
          See all tools <ArrowRight :size="14" class="transition-transform group-hover:translate-x-0.5" />
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <NuxtLink
          v-for="tool in compactTools"
          :key="tool.slug"
          :to="`/tools/${tool.slug}`"
          class="group flex items-center gap-3 p-3 rounded-xl border border-surface-border bg-surface hover:bg-surface-secondary hover:border-brand-300/50 transition-all"
        >
          <div class="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
            <component :is="getToolIcon(tool.icon)" v-if="getToolIcon(tool.icon)" :size="18" class="text-brand-accent" />
            <span v-else class="text-brand-accent text-sm font-bold">{{ tool.name.charAt(0) }}</span>
          </div>
          <span class="text-sm font-medium text-content group-hover:text-brand-accent transition-colors truncate">{{ tool.name }}</span>
        </NuxtLink>
      </div>
    </section>
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
