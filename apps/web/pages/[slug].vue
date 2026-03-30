<script setup lang="ts">
import type { IPage } from '@tiny-tools/shared';
import { marked } from 'marked';
import hljs from 'highlight.js';

const renderer = new marked.Renderer();
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : undefined;
  const highlighted = language
    ? hljs.highlight(text, { language }).value
    : hljs.highlightAuto(text).value;
  const langClass = language ? `hljs language-${language}` : 'hljs';
  return `<pre><code class="${langClass}">${highlighted}</code></pre>`;
};
marked.use({ renderer });

const route = useRoute();
const config = useRuntimeConfig();
const api = useApi();
const siteUrl = config.public.siteUrl as string;
const slug = route.params.slug as string;

const { data: page, error } = await useAsyncData(`page-${slug}`, () =>
  api.get<IPage>(`/content/pages/${slug}`),
);

if (error.value || !page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' });
}

const p = page.value!;
const pageTitle = p.seo?.metaTitle || `${p.title} | TinyTools`;
const pageDescription = p.seo?.metaDescription || p.excerpt || '';
const canonicalUrl = p.seo?.canonicalUrl || `${siteUrl}/${p.slug}`;
const ogImage = p.seo?.ogImage;

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageDescription },
    ...(p.seo?.noIndex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: p.seo?.ogTitle || pageTitle },
    {
      property: 'og:description',
      content: p.seo?.ogDescription || pageDescription,
    },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'TinyTools' },
    ...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
    { name: 'twitter:card', content: p.seo?.twitterCard || 'summary' },
    { name: 'twitter:title', content: p.seo?.ogTitle || pageTitle },
    {
      name: 'twitter:description',
      content: p.seo?.ogDescription || pageDescription,
    },
    ...(ogImage ? [{ name: 'twitter:image', content: ogImage }] : []),
  ],
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: p.title,
        description: pageDescription,
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

const renderedContent = computed(() => {
  if (!page.value?.content) return '';
  return marked.parse(page.value.content, { async: false }) as string;
});
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
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
