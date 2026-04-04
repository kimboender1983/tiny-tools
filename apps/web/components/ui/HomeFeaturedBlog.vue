<script setup lang="ts">
    import type { IBlogPost, ICategory } from "@tiny-tools/shared";
    import { ArrowRight, Calendar, Clock } from "lucide-vue-next";

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

    function formatDate(date: Date | string | undefined): string {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    }

    const api = useApi();

    const { data: postsData } = await useAsyncData("homepage-featured-blog", () =>
        api.get<PaginatedBlogResponse>("/content/blog", {
            params: { featuredHomepage: "true", limit: 4 },
        }),
    );

    const posts = computed(() => {
        const items = postsData.value?.items ?? [];
        // Sort hero post first, then by publishedAt
        return [...items].sort((a, b) => {
            if (a.homepageHero && !b.homepageHero) return -1;
            if (!a.homepageHero && b.homepageHero) return 1;
            return 0;
        });
    });
    const heroPost = computed(() => posts.value[0]);
    const sidePosts = computed(() => posts.value.slice(1, 4));
</script>

<template>
  <section v-if="posts.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
    <!-- Section header -->
    <div class="flex items-end justify-between mb-6">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wider text-brand-accent mb-1">From the blog</p>
        <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-content">
          Latest Insights
        </h2>
      </div>
      <NuxtLink
        to="/blog"
        class="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-accent hover:text-brand-600 transition-colors group"
      >
        View all posts
        <ArrowRight :size="14" class="transition-transform group-hover:translate-x-0.5" />
      </NuxtLink>
    </div>

    <!-- Magazine layout: hero left + stacked right -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <!-- Hero post (takes 3 of 5 cols) -->
      <NuxtLink
        v-if="heroPost"
        :to="blogPostUrl(heroPost)"
        class="lg:col-span-3 group relative flex flex-col rounded-2xl overflow-hidden bg-surface border border-surface-border transition-all duration-300 hover:shadow-xl hover:border-brand-300/50"
      >
        <div class="aspect-[16/9] lg:aspect-[16/10] overflow-hidden">
          <img
            v-if="heroPost.coverImage"
            :src="heroPost.coverImage"
            :alt="heroPost.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-brand-400 via-brand-500 to-indigo-600 flex items-center justify-center"
          >
            <span class="text-white/30 text-7xl font-black select-none">P</span>
          </div>
        </div>

        <!-- Overlay gradient at bottom of image -->
        <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none lg:block hidden" />

        <!-- Content over image on desktop, below on mobile -->
        <div class="relative lg:absolute lg:bottom-0 lg:inset-x-0 p-5 lg:p-6">
          <span
            v-if="heroPost.category"
            class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/90 text-white mb-3"
          >
            {{ getCategoryName(heroPost.category) }}
          </span>
          <h3 class="text-xl lg:text-2xl font-bold text-content lg:text-white leading-tight line-clamp-2 group-hover:text-brand-accent lg:group-hover:text-brand-200 transition-colors">
            {{ heroPost.title }}
          </h3>
          <p class="mt-2 text-sm text-content-tertiary lg:text-white/70 line-clamp-2">
            {{ heroPost.excerpt }}
          </p>
          <div class="mt-3 flex items-center gap-4 text-xs text-content-muted lg:text-white/50">
            <span v-if="heroPost.author && typeof heroPost.author === 'object'" class="inline-flex items-center gap-1.5">
              <img
                v-if="heroPost.author.avatar"
                :src="heroPost.author.avatar"
                :alt="heroPost.author.name"
                class="w-5 h-5 rounded-full object-cover ring-1 ring-white/20"
              />
              {{ heroPost.author.name }}
            </span>
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

      <!-- Side posts (takes 2 of 5 cols) -->
      <div v-if="sidePosts.length > 0" class="lg:col-span-2 flex flex-col gap-4">
        <NuxtLink
          v-for="post in sidePosts"
          :key="post._id"
          :to="blogPostUrl(post)"
          class="group flex gap-4 p-3 rounded-xl bg-surface border border-surface-border transition-all duration-200 hover:shadow-md hover:border-brand-300/50 flex-1"
        >
          <!-- Thumbnail -->
          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0">
            <img
              v-if="post.coverImage"
              :src="post.coverImage"
              :alt="post.title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800 flex items-center justify-center"
            >
              <span class="text-brand-accent/30 text-2xl font-black select-none">P</span>
            </div>
          </div>

          <!-- Text -->
          <div class="flex flex-col justify-center min-w-0 flex-1">
            <span
              v-if="post.category"
              class="text-[11px] font-semibold uppercase tracking-wider text-brand-accent mb-1"
            >
              {{ getCategoryName(post.category) }}
            </span>
            <h3 class="text-sm font-semibold text-content group-hover:text-brand-accent transition-colors line-clamp-2 leading-snug">
              {{ post.title }}
            </h3>
            <div class="mt-1.5 flex items-center gap-3 text-[11px] text-content-muted">
              <span v-if="post.author && typeof post.author === 'object'" class="inline-flex items-center gap-1.5">
                <img
                  v-if="post.author.avatar"
                  :src="post.author.avatar"
                  :alt="post.author.name"
                  class="w-4 h-4 rounded-full object-cover"
                />
                {{ post.author.name }}
              </span>
              <span v-if="post.publishedAt" class="inline-flex items-center gap-1">
                <Calendar :size="10" />
                {{ formatDate(post.publishedAt) }}
              </span>
              <span v-if="post.readingTime" class="inline-flex items-center gap-1">
                <Clock :size="10" />
                {{ post.readingTime }} min
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Mobile "View all" link -->
    <div class="mt-4 sm:hidden text-center">
      <NuxtLink
        to="/blog"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-accent hover:text-brand-600 transition-colors group"
      >
        View all posts
        <ArrowRight :size="14" class="transition-transform group-hover:translate-x-0.5" />
      </NuxtLink>
    </div>
  </section>
</template>
