<script setup lang="ts">
    import type { IPage } from "@tiny-tools/shared";
    import { processAffiliateLinks, renderMarkdown } from "~/utils/markdown";

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
        if (!page.value) return "Page not found | Pickbox";
        return page.value.seo?.metaTitle || `${page.value.title} | Pickbox`;
    });

    const pageDescription = computed(() => {
        return page.value?.seo?.metaDescription || page.value?.excerpt || "";
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
                { name: "description", content: pageDescription },
                ...(page.value.seo?.noIndex
                    ? [{ name: "robots", content: "noindex, nofollow" }]
                    : []),
                { property: "og:type", content: "website" },
                { property: "og:title", content: page.value.seo?.ogTitle || pageTitle.value },
                {
                    property: "og:description",
                    content: page.value.seo?.ogDescription || pageDescription.value,
                },
                { property: "og:url", content: canonicalUrl },
                { property: "og:site_name", content: "Pickbox" },
                ...(ogImage.value ? [{ property: "og:image", content: ogImage.value }] : []),
                { name: "twitter:card", content: page.value.seo?.twitterCard || "summary" },
                { name: "twitter:title", content: page.value.seo?.ogTitle || pageTitle.value },
                {
                    name: "twitter:description",
                    content: page.value.seo?.ogDescription || pageDescription.value,
                },
                ...(ogImage.value ? [{ name: "twitter:image", content: ogImage.value }] : []),
            ],
            link: [{ rel: "canonical", href: canonicalUrl }],
            script: [
                {
                    type: "application/ld+json",
                    innerHTML: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: page.value.title,
                        description: pageDescription.value,
                        url: canonicalUrl.value,
                        publisher: {
                            "@type": "Organization",
                            name: "Pickbox",
                            url: siteUrl,
                        },
                    }),
                },
            ],
        });
    }

    // Fetch active affiliates for shortcode resolution
    const { data: affiliatesData } = await useAsyncData("affiliates-map", () =>
        api.get<{ slug: string; name: string }[]>("/content/affiliates").catch(() => []),
    );

    const affiliatesMap = computed(() => {
        const map = new Map<string, string>();
        for (const a of affiliatesData.value ?? []) {
            map.set(a.slug, a.name);
        }
        return map;
    });

    const staticLegalContent: Record<string, string> = {
        privacy: `
## What Data We Collect

Pickbox is designed with privacy at its core. **All tools run entirely in your browser** — no data you paste, upload, or process is ever sent to our servers.

### Analytics

We may use privacy-respecting analytics (such as server-side page-view counts) to understand which tools are most useful. These analytics do not track individual users, set cookies for tracking purposes, or collect personally identifiable information.

### AdSense

If advertisements are displayed on Pickbox, they are served by Google AdSense. Google may use cookies to serve ads based on your prior visits to this or other websites. You can opt out of personalised advertising by visiting [Google's Ads Settings](https://www.google.com/settings/ads).

### Cookies

Pickbox uses only essential cookies required for site functionality (e.g., colour-mode preference, authentication tokens for admin users). We do not use tracking cookies.

### Local Storage & Session Storage

Some tools persist your preferences (e.g., last-used settings) in your browser's local or session storage. This data never leaves your device and can be cleared at any time through your browser settings.

## Third-Party Services

- **Google Fonts** — We load the Inter and JetBrains Mono typefaces from Google Fonts. Google's [privacy policy](https://policies.google.com/privacy) applies to these requests.
- **Google AdSense** — If enabled, Google AdSense may set cookies. See [Google's privacy policy](https://policies.google.com/privacy).

## Data Retention

Since we do not collect personal data through our tools, there is nothing to retain or delete. Admin account data (email and hashed password) is stored in our database and can be deleted upon request.

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected on this page with an updated revision date.

## Contact

If you have questions about this privacy policy, please open an issue on our [GitHub repository](https://github.com).

*Last updated: April 2026*
`,
        terms: `
## Acceptance of Terms

By accessing and using Pickbox ("the Service"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service.

## Description of Service

Pickbox provides free, browser-based developer tools including but not limited to JSON formatting, text diffing, JWT decoding, image compression, and other utilities. All processing happens client-side in your browser.

## Use of the Service

You agree to use Pickbox only for lawful purposes and in accordance with these terms. You may not:

- Use the Service in any way that violates applicable laws or regulations
- Attempt to interfere with or disrupt the Service or its infrastructure
- Attempt to gain unauthorised access to any part of the Service
- Use automated tools to scrape or overload the Service

## Intellectual Property

The Pickbox name, logo, and original source code are the property of their respective owners. The tools provided are offered for free use but the underlying code and design remain protected.

## Disclaimer of Warranties

Pickbox is provided **"as is"** and **"as available"** without warranties of any kind, either express or implied. We do not guarantee that:

- The Service will be uninterrupted or error-free
- The results obtained from using the tools will be accurate or reliable
- Any defects in the Service will be corrected

## Limitation of Liability

To the fullest extent permitted by law, Pickbox and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.

## Data and Privacy

Your use of Pickbox is also governed by our [Privacy Policy](/privacy). All tool processing occurs in your browser — we do not collect, store, or transmit any data you process using our tools.

## Changes to Terms

We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.

## Governing Law

These terms shall be governed by and construed in accordance with applicable law, without regard to conflict of law principles.

## Contact

If you have questions about these terms, please open an issue on our [GitHub repository](https://github.com).

*Last updated: April 2026*
`,
    };

    const renderedContent = computed(() => {
        const content = page.value?.content || staticLegalContent[slug] || "";
        if (!content) return "";
        const html = renderMarkdown(content);
        return processAffiliateLinks(html, affiliatesMap.value);
    });
</script>

<template>
  <div v-if="notFound" class="min-h-screen flex items-center justify-center bg-page px-4">
    <div class="text-center">
      <p class="text-6xl font-bold text-brand-500 mb-4">404</p>
      <h1 class="text-2xl font-bold text-content mb-2">Page not found</h1>
      <p class="text-content-muted mb-8">The page you're looking for doesn't exist.</p>
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
      class="text-3xl sm:text-4xl font-bold tracking-tight text-content mb-8"
    >
      {{ page!.title }}
    </h1>

    <div
      class="prose prose-lg dark:prose-invert prose-a:text-brand-500 hover:prose-a:text-brand-600 max-w-none"
      v-html="renderedContent"
    />
  </div>
</template>
