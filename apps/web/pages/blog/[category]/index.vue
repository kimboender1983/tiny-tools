<script setup lang="ts">
    import type { IBlogPost, ICategory } from "@tiny-tools/shared";
    import * as lucideIcons from "lucide-vue-next";
    import { ArrowLeft, BookOpen, Calendar, Clock, Tag, X } from "lucide-vue-next";

    interface PaginatedBlogResponse {
        items: IBlogPost[];
        total: number;
        page: number;
        pageSize: number;
    }

    function getCategoryName(cat: string | ICategory | undefined): string {
        if (!cat) return "";
        return typeof cat === "object" ? cat.name : cat;
    }

    function getCategorySlug(cat: string | ICategory | undefined): string {
        if (!cat) return "uncategorized";
        return typeof cat === "object" ? cat.slug : cat;
    }

    function getCategoryIcon(cat: string | ICategory | undefined) {
        if (!cat || typeof cat !== "object" || !cat.icon) return null;
        return (lucideIcons as Record<string, unknown>)[cat.icon] ?? null;
    }

    function blogPostUrl(post: IBlogPost): string {
        return `/blog/${getCategorySlug(post.category)}/${post.slug}`;
    }

    function getCardImageUrl(post: IBlogPost): string {
        const logoSlug =
            post.techLogo && typeof post.techLogo === "object" ? post.techLogo.slug : "";
        const params = new URLSearchParams();
        if (logoSlug) params.set("logo", logoSlug);
        if (post.techLogoColor) params.set("color", post.techLogoColor);
        if (post.techLogoBgColor) params.set("bg", post.techLogoBgColor);
        if (post.techLogoBgColorTo) params.set("bgTo", post.techLogoBgColorTo);
        if (post.techLogoPickboxColor) params.set("pickboxColor", post.techLogoPickboxColor);
        const qs = params.toString();
        return `/card-image.png${qs ? `?${qs}` : ""}`;
    }

    const route = useRoute();
    const config = useRuntimeConfig();
    const api = useApi();
    const siteUrl = config.public.siteUrl as string;
    const categorySlug = route.params.category as string;

    const activeTag = computed(() => (route.query.tag as string) || "");

    // Fetch category info
    const { data: categories } = await useAsyncData("categories", () =>
        api.get<ICategory[]>("/content/categories"),
    );

    const category = computed(() => categories.value?.find((c) => c.slug === categorySlug));

    const categoryIconComponent = computed(() => {
        if (!category.value?.icon) return null;
        return (lucideIcons as Record<string, unknown>)[category.value.icon] ?? null;
    });

    // Fetch posts in this category
    const currentPage = computed(() => {
        const p = Number(route.query.page);
        return p > 0 ? p : 1;
    });

    const pageSize = 12;

    const { data, error } = await useAsyncData(
        () => `blog-category-${categorySlug}-${currentPage.value}-${activeTag.value}`,
        () =>
            api.get<PaginatedBlogResponse>("/content/blog", {
                params: {
                    page: currentPage.value,
                    limit: pageSize,
                    category: category.value?._id,
                    ...(activeTag.value ? { tag: activeTag.value } : {}),
                },
            }),
        { watch: [currentPage, activeTag] },
    );

    const posts = computed(() => data.value?.items ?? []);
    const totalPages = computed(() => (data.value ? Math.ceil(data.value.total / pageSize) : 1));

    function formatDate(date: Date | string | undefined): string {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    const title = computed(() =>
        category.value
            ? `${category.value.name} — Blog | Pickbox`
            : `${categorySlug} — Blog | Pickbox`,
    );

    useHead({
        title,
        meta: [
            { property: "og:title", content: title },
            { property: "og:url", content: `${siteUrl}/blog/${categorySlug}` },
        ],
        link: [{ rel: "canonical", href: `${siteUrl}/blog/${categorySlug}` }],
    });
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
    <!-- Back link -->
    <NuxtLink
      to="/blog"
      class="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-brand-500 transition-colors mb-8"
    >
      <ArrowLeft :size="16" />
      All posts
    </NuxtLink>

    <!-- Header -->
    <div class="mb-12">
      <div class="flex items-center gap-3">
        <div
          v-if="categoryIconComponent"
          class="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 text-brand-accent"
        >
          <component :is="categoryIconComponent" :size="24" />
        </div>
        <div>
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-content">
            {{ category?.name || categorySlug }}
          </h1>
          <p v-if="category?.description" class="mt-1 text-content-tertiary">
            {{ category.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Active tag filter -->
    <div v-if="activeTag" class="mb-8 flex items-center gap-2">
      <Tag :size="14" class="text-brand-accent" />
      <span class="text-sm text-content-secondary">Filtered by</span>
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-accent">
        {{ activeTag }}
        <NuxtLink :to="{ path: `/blog/${categorySlug}`, query: {} }" class="hover:text-red-500 transition-colors">
          <X :size="12" />
        </NuxtLink>
      </span>
    </div>

    <!-- Error state -->
    <div v-if="error" class="text-center py-16 text-content-muted">
      <BookOpen :size="48" class="mx-auto mb-4 text-content-faint" />
      <p>Unable to load posts. Please try again later.</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="posts.length === 0" class="text-center py-16 text-content-muted">
      <BookOpen :size="48" class="mx-auto mb-4 text-content-faint" />
      <p>No posts in this category yet.</p>
    </div>

    <!-- Post grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      <NuxtLink
        v-for="post in posts"
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

        <div class="flex flex-col flex-1 p-5">
          <h2 class="text-lg font-semibold text-content group-hover:text-brand-500 transition-colors line-clamp-2">
            {{ post.title }}
          </h2>
          <p class="mt-2 text-sm text-content-tertiary line-clamp-3 flex-1">
            {{ post.excerpt }}
          </p>
          <div class="mt-4 @container">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-content-muted @[320px]:flex-nowrap">
              <span v-if="post.author && typeof post.author === 'object'" class="inline-flex items-center gap-1.5 basis-full @[320px]:basis-auto">
                <img
                  v-if="post.author.avatar"
                  :src="post.author.avatar"
                  :alt="post.author.name"
                  class="w-4 h-4 rounded-full object-cover"
                />
                {{ post.author.name }}
              </span>
              <span v-if="post.publishedAt" class="inline-flex items-center gap-1">
                <Calendar :size="12" />
                {{ formatDate(post.publishedAt) }}
              </span>
              <span v-if="post.readingTime" class="inline-flex items-center gap-1">
                <Clock :size="12" />
                {{ post.readingTime }} min read
              </span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Pagination -->
    <nav
      v-if="totalPages > 1"
      class="mt-12 flex justify-center items-center gap-2"
    >
      <NuxtLink
        v-for="page in totalPages"
        :key="page"
        :to="{ path: `/blog/${categorySlug}`, query: page > 1 ? { page } : undefined }"
        :class="[
          'inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-colors',
          page === currentPage
            ? 'bg-brand-500 text-white'
            : 'bg-surface-secondary text-content-tertiary hover:bg-surface-secondary',
        ]"
      >
        {{ page }}
      </NuxtLink>
    </nav>
  </div>
</template>
