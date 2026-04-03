<script setup lang="ts">
import type { IBlogPost, ICategory } from '@tiny-tools/shared';
import { Calendar, Clock, BookOpen, ChevronRight } from 'lucide-vue-next';
import * as lucideIcons from 'lucide-vue-next';

interface PaginatedBlogResponse {
  items: IBlogPost[];
  total: number;
  page: number;
  pageSize: number;
}

function getCategoryName(cat: string | ICategory | undefined): string {
  if (!cat) return '';
  return typeof cat === 'object' ? cat.name : cat;
}

function getCategorySlug(cat: string | ICategory | undefined): string {
  if (!cat) return 'uncategorized';
  return typeof cat === 'object' ? cat.slug : cat;
}

function getCategoryIcon(cat: string | ICategory | undefined) {
  if (!cat || typeof cat !== 'object' || !cat.icon) return null;
  return (lucideIcons as Record<string, unknown>)[cat.icon] ?? null;
}

function getIconByName(name: string | undefined) {
  if (!name) return null;
  return (lucideIcons as Record<string, unknown>)[name] ?? null;
}

function blogPostUrl(post: IBlogPost): string {
  return `/blog/${getCategorySlug(post.category)}/${post.slug}`;
}

const config = useRuntimeConfig();
const api = useApi();
const siteUrl = config.public.siteUrl as string;

// Fetch featured posts + categories in parallel
const [{ data: featuredData }, { data: categories }] = await Promise.all([
  useAsyncData('blog-featured', () =>
    api.get<PaginatedBlogResponse>('/content/blog', {
      params: { featured: 'true', limit: 6 },
    }),
  ),
  useAsyncData('blog-categories', () =>
    api.get<ICategory[]>('/content/categories'),
  ),
]);

const featuredPosts = computed(() => featuredData.value?.items ?? []);

function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// SEO
const title = 'Developer Blog — Web Development Tips & Tutorials | Pickbox';
const description =
  'Practical web development tips, tutorials, and guides. Learn about JavaScript, TypeScript, developer tools, and modern web technologies.';
const canonicalUrl = `${siteUrl}/blog`;

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'Pickbox' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ],
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: canonicalUrl,
        publisher: {
          '@type': 'Organization',
          name: 'Pickbox',
          url: siteUrl,
        },
      }),
    },
  ],
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-content">
        Developer Blog
      </h1>
      <p class="mt-4 text-lg text-content-tertiary max-w-2xl mx-auto">
        Tips, tutorials, and guides for modern web development.
      </p>
    </div>

    <!-- Categories -->
    <section v-if="categories && categories.length > 0" class="mb-16">
      <h2 class="text-lg font-semibold text-content mb-5">Browse by Category</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <NuxtLink
          v-for="cat in categories"
          :key="cat._id"
          :to="`/blog/${cat.slug}`"
          class="group flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-border bg-surface hover:border-brand-300 hover:shadow-md transition-all"
        >
          <div
            class="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 text-brand-accent shrink-0 transition-colors group-hover:bg-brand-100"
          >
            <component :is="getIconByName(cat.icon)" v-if="getIconByName(cat.icon)" :size="20" />
            <BookOpen v-else :size="20" />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-content group-hover:text-brand-accent transition-colors truncate">
              {{ cat.name }}
            </p>
            <p v-if="cat.description" class="text-xs text-content-muted truncate">
              {{ cat.description }}
            </p>
          </div>
          <ChevronRight :size="16" class="shrink-0 text-gray-400 group-hover:text-brand-500 transition-colors ml-auto" />
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Posts -->
    <section v-if="featuredPosts.length > 0">
      <h2 class="text-lg font-semibold text-content mb-5">Featured</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <NuxtLink
          v-for="post in featuredPosts"
          :key="post._id"
          :to="blogPostUrl(post)"
          class="group flex flex-col rounded-xl border border-surface-border bg-surface overflow-hidden transition-shadow hover:shadow-lg"
        >
          <div class="aspect-video overflow-hidden">
            <img
              v-if="post.coverImage"
              :src="post.coverImage"
              :alt="post.title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-blue-50 to-indigo-100">
              <div class="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm mb-2">
                <component :is="getCategoryIcon(post.category)" v-if="getCategoryIcon(post.category)" :size="24" class="text-brand-accent" />
                <BookOpen v-else :size="24" class="text-brand-accent" />
              </div>
              <span class="text-xs font-medium text-brand-accent/60">{{ getCategoryName(post.category) || 'Article' }}</span>
            </div>
          </div>

          <div class="flex flex-col flex-1 p-5">
            <div v-if="post.category" class="mb-2">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-accent">
                <component :is="getCategoryIcon(post.category)" v-if="getCategoryIcon(post.category)" :size="11" />
                {{ getCategoryName(post.category) }}
              </span>
            </div>

            <h3 class="text-lg font-semibold text-content group-hover:text-brand-500 transition-colors line-clamp-2">
              {{ post.title }}
            </h3>
            <p class="mt-2 text-sm text-content-tertiary line-clamp-3 flex-1">
              {{ post.excerpt }}
            </p>
            <div class="mt-4 @container">
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 @[320px]:flex-nowrap">
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
    </section>

    <!-- Empty state -->
    <div
      v-if="featuredPosts.length === 0 && (!categories || categories.length === 0)"
      class="text-center py-16 text-content-muted"
    >
      <BookOpen :size="48" class="mx-auto mb-4 text-content-faint" />
      <p>No blog posts yet. Check back soon!</p>
    </div>
  </div>
</template>
