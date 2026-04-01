<script setup lang="ts">
import type { IPage } from '@tiny-tools/shared';
import { renderMarkdown, processAffiliateLinks } from '~/utils/markdown';

const route = useRoute();
const config = useRuntimeConfig();
const api = useApi();
const siteUrl = config.public.siteUrl as string;
const slug = route.params.slug as string;

const { data: page } = await useAsyncData(`page-${slug}`, () =>
  api.get<IPage>(`/content/pages/${slug}`).catch(() => null),
);

const notFound = computed(() => !page.value);

// Set 404 status on SSR without throwing
if (import.meta.server && !page.value) {
  const event = useRequestEvent();
  if (event) {
    event.node.res.statusCode = 404;
  }
}

const pageTitle = computed(() => {
  if (!page.value) return 'Page not found | TinyTools';
  return page.value.seo?.metaTitle || `${page.value.title} | TinyTools`;
});

const pageDescription = computed(() => {
  return page.value?.seo?.metaDescription || page.value?.excerpt || '';
});

const canonicalUrl = computed(() => {
  return page.value?.seo?.canonicalUrl || `${siteUrl}/${page.value?.slug}`;
});

const ogImage = computed(() => page.value?.seo?.ogImage);

useHead({
  title: pageTitle,
});

if (page.value) {
  useHead({
    meta: [
      { name: 'description', content: pageDescription },
      ...(page.value.seo?.noIndex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: page.value.seo?.ogTitle || pageTitle.value },
      { property: 'og:description', content: page.value.seo?.ogDescription || pageDescription.value },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:site_name', content: 'TinyTools' },
      ...(ogImage.value ? [{ property: 'og:image', content: ogImage.value }] : []),
      { name: 'twitter:card', content: page.value.seo?.twitterCard || 'summary' },
      { name: 'twitter:title', content: page.value.seo?.ogTitle || pageTitle.value },
      { name: 'twitter:description', content: page.value.seo?.ogDescription || pageDescription.value },
      ...(ogImage.value ? [{ name: 'twitter:image', content: ogImage.value }] : []),
    ],
    link: [{ rel: 'canonical', href: canonicalUrl }],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: page.value.title,
          description: pageDescription.value,
          url: canonicalUrl.value,
          publisher: {
            '@type': 'Organization',
            name: 'TinyTools',
            url: siteUrl,
          },
        }),
      },
    ],
  });
}

// Fetch active affiliates for shortcode resolution
const { data: affiliatesData } = await useAsyncData('affiliates-map', () =>
  api.get<{ slug: string; name: string }[]>('/content/affiliates').catch(() => []),
);

const affiliatesMap = computed(() => {
  const map = new Map<string, string>();
  for (const a of affiliatesData.value ?? []) {
    map.set(a.slug, a.name);
  }
  return map;
});

const renderedContent = computed(() => {
  if (!page.value?.content) return '';
  const html = renderMarkdown(page.value.content);
  return processAffiliateLinks(html, affiliatesMap.value);
});
</script>

<template>
  <div v-if="notFound" class="min-h-screen flex items-center justify-center bg-page-light dark:bg-page-dark px-4">
    <div class="text-center">
      <p class="text-6xl font-bold text-brand-500 mb-4">404</p>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">Page not found</h1>
      <p class="text-gray-500 dark:text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
      <NuxtLink
        to="/"
        class="px-6 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
      >
        Back to home
      </NuxtLink>
    </div>
  </div>

  <div v-else class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
    <h1
      class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-8"
    >
      {{ page!.title }}
    </h1>

    <div
      class="prose prose-lg dark:prose-invert prose-a:text-brand-500 hover:prose-a:text-brand-600 max-w-none"
      v-html="renderedContent"
    />
  </div>
</template>
