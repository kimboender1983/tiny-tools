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
const title = 'Developer Blog — Web Development Tips & Tutorials | TinyTools';
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
    { property: 'og:site_name', content: 'TinyTools' },
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
          name: 'TinyTools',
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
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
        Developer Blog
      </h1>
      <p class="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Tips, tutorials, and guides for modern web development.
      </p>
    </div>

    <!-- Categories -->
    <section v-if="categories && categories.length > 0" class="mb-16">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-5">Browse by Category</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <NuxtLink
          v-for="cat in categories"
          :key="cat._id"
          :to="`/blog/${cat.slug}`"
          class="group flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all"
        >
          <div
            class="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0 transition-colors group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30"
          >
            <component :is="getIconByName(cat.icon)" v-if="getIconByName(cat.icon)" :size="20" />
            <BookOpen v-else :size="20" />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
              {{ cat.name }}
            </p>
            <p v-if="cat.description" class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ cat.description }}
            </p>
          </div>
          <ChevronRight :size="16" class="shrink-0 text-gray-400 group-hover:text-brand-500 transition-colors ml-auto" />
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Posts -->
    <section v-if="featuredPosts.length > 0">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-5">Featured</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <NuxtLink
          v-for="post in featuredPosts"
          :key="post._id"
          :to="blogPostUrl(post)"
          class="group flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden transition-shadow hover:shadow-lg"
        >
          <div class="aspect-video overflow-hidden">
            <img
              v-if="post.coverImage"
              :src="post.coverImage"
              :alt="post.title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-blue-50 to-indigo-100 dark:from-brand-900/30 dark:via-blue-900/20 dark:to-indigo-900/30">
              <div class="w-14 h-14 rounded-2xl bg-white/80 dark:bg-gray-800/60 flex items-center justify-center shadow-sm mb-2">
                <component :is="getCategoryIcon(post.category)" v-if="getCategoryIcon(post.category)" :size="24" class="text-brand-500 dark:text-brand-400" />
                <BookOpen v-else :size="24" class="text-brand-500 dark:text-brand-400" />
              </div>
              <span class="text-xs font-medium text-brand-600/60 dark:text-brand-400/50">{{ getCategoryName(post.category) || 'Article' }}</span>
            </div>
          </div>

          <div class="flex flex-col flex-1 p-5">
            <div v-if="post.category" class="mb-2">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                <component :is="getCategoryIcon(post.category)" v-if="getCategoryIcon(post.category)" :size="11" />
                {{ getCategoryName(post.category) }}
              </span>
            </div>

            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-50 group-hover:text-brand-500 transition-colors line-clamp-2">
              {{ post.title }}
            </h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3 flex-1">
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
      class="text-center py-16 text-gray-500 dark:text-gray-400"
    >
      <BookOpen :size="48" class="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
      <p>No blog posts yet. Check back soon!</p>
    </div>
  </div>
</template>
