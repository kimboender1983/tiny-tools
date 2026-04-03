<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import { generateJsonLd } from '~/utils/seo';
import { ExternalLink, ChevronRight, BookOpen, Code, Braces, GitCompare, KeyRound, ArrowRight } from 'lucide-vue-next';

const appStore = useAppStore();
const tool = TOOLS.find((t) => t.slug === 'image-compressor')!;
const siteUrl = 'https://pickbox.dev';
const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;

const faqItems = [
  {
    question: 'How does browser-based image compression work?',
    answer: 'Our tool uses the Canvas API and modern browser codecs to re-encode your images at a lower quality setting or in a more efficient format. The image is drawn onto an HTML canvas element, and then exported using the toBlob() method with the target format and quality parameter. The entire process runs in your browser — no files are uploaded to a server.',
  },
  {
    question: 'What is the difference between lossy and lossless compression?',
    answer: 'Lossy compression reduces file size by permanently discarding some image data that is less perceptible to the human eye. JPEG and WebP lossy are examples. Lossless compression reduces file size without losing any data by finding more efficient ways to encode the same information. PNG and WebP lossless are examples. Lossy compression achieves much smaller files but introduces slight quality degradation.',
  },
  {
    question: 'Will compressing my images reduce their quality?',
    answer: 'It depends on the compression type and settings. With lossy compression (JPEG, WebP lossy), there is always some quality loss, but at quality settings of 70-85%, the difference is imperceptible for most use cases. With lossless compression (PNG optimization), the output is pixel-identical to the input. Our tool lets you preview the result and compare quality before downloading.',
  },
  {
    question: 'What image formats does this tool support?',
    answer: 'You can upload JPEG, PNG, WebP, GIF, and BMP images. The tool can output JPEG, PNG, and WebP formats depending on your browser support. We recommend WebP for most web use cases as it typically produces the smallest files at equivalent quality levels.',
  },
  {
    question: 'Can I compress multiple images at once?',
    answer: 'Yes. Our bulk compression feature lets you drag and drop or select multiple images simultaneously. Each image is processed independently with the same quality settings, and you can download all compressed images at once as a ZIP archive or individually.',
  },
];

useHead({
  title: 'Image Compressor — Free Online Bulk Image Compression Tool | Pickbox',
  meta: [
    { name: 'description', content: 'Compress JPEG, PNG, and WebP images in your browser with zero uploads. Free bulk image compressor with quality preview and format conversion.' },
    { name: 'keywords', content: tool.keywords.join(', ') },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Image Compressor — Free Online Bulk Image Compression Tool | Pickbox' },
    { property: 'og:description', content: 'Compress JPEG, PNG, and WebP images in your browser with zero uploads. Free bulk compressor with quality preview.' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'Pickbox' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Image Compressor — Free Online Bulk Image Compression Tool | Pickbox' },
    { name: 'twitter:description', content: 'Compress JPEG, PNG, and WebP images in your browser with zero uploads. Free bulk compressor with quality preview.' },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(generateJsonLd('SoftwareApplication', {
        name: tool.name,
        description: tool.description,
        url: canonicalUrl,
        category: tool.category,
      })),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(generateJsonLd('FAQPage', faqItems)),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(generateJsonLd('BreadcrumbList', [
        { name: 'Home', url: siteUrl },
        { name: 'Image Compressor', url: canonicalUrl },
      ])),
    },
  ],
});

onMounted(() => {
  appStore.addRecentTool(tool.slug);
});
</script>

<template>
  <UiToolPageLayout
    :title="tool.name"
    :description="tool.description"
    :category="tool.category"
  >
    <ToolsImageCompressor />

    <template #seo-content>
      <article class="max-w-4xl mx-auto">
        <!-- Quick links -->
        <nav class="mb-6 flex flex-wrap gap-2">
          <a
            v-for="link in [
              { id: 'lossy-vs-lossless', label: 'Lossy vs Lossless' },
              { id: 'format-comparison', label: 'WebP vs PNG vs JPEG' },
              { id: 'when-to-use', label: 'When to Use Each' },
              { id: 'faq', label: 'FAQ' },
              { id: 'built-with', label: 'Built With' },
              { id: 'related-tools', label: 'Related Tools' },
            ]"
            :key="link.id"
            :href="`#${link.id}`"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-600 dark:bg-surface-dark-secondary dark:text-gray-300 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-colors scroll-smooth"
          >
            <ChevronRight :size="14" />
            {{ link.label }}
          </a>
        </nav>

        <div class="space-y-6">
          <!-- Lossy vs Lossless Compression -->
          <section id="lossy-vs-lossless" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              Lossy vs Lossless Compression
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Image compression falls into two broad categories, each with distinct trade-offs. Understanding the
                difference is essential for choosing the right approach for your use case.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong class="text-gray-900 dark:text-gray-100">Lossy compression</strong> analyzes the image and permanently removes data that contributes least
                to perceived visual quality. It exploits the limitations of human vision — for example, our eyes are more
                sensitive to changes in brightness than in color, so a lossy encoder can discard more chrominance data.
                JPEG has used this approach since 1992 and remains the most widely supported lossy format. WebP lossy,
                developed by Google, applies similar techniques with more modern algorithms, typically achieving 25-35%
                smaller files than JPEG at equivalent quality.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong class="text-gray-900 dark:text-gray-100">Lossless compression</strong> reduces file size without discarding any image data. It works by
                finding patterns and redundancies in the pixel data and encoding them more efficiently. When decompressed,
                the output is bit-for-bit identical to the original. PNG is the standard lossless format for the web,
                using DEFLATE compression with predictive filtering. WebP lossless offers a more modern alternative,
                producing files that are typically 20-25% smaller than PNG.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                For photographs and complex images with gradients, lossy compression at 75-85% quality usually delivers
                the best size-to-quality ratio. For screenshots, diagrams, logos, and images with text or sharp edges,
                lossless compression (or lossy at very high quality) preserves the crisp details that matter.
              </p>
            </div>
          </section>

          <!-- WebP vs PNG vs JPEG -->
          <section id="format-comparison" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              WebP vs PNG vs JPEG
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Choosing the right image format has a significant impact on page load times and user experience. Here is
              how the three most common web formats compare:
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">JPEG:</strong> Best for photographs and images with complex color gradients. Supports lossy
                  compression only. Does not support transparency. Universal browser support. Typical use: hero images,
                  product photos, backgrounds.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">PNG:</strong> Best for images requiring transparency or pixel-perfect reproduction. Supports
                  lossless compression and an alpha channel for transparency. Files are larger than JPEG for photographic
                  content. Typical use: logos, icons, screenshots, UI elements.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">WebP:</strong> A modern format that supports both lossy and lossless compression, plus
                  transparency and animation. Produces significantly smaller files than both JPEG and PNG at comparable
                  quality. Supported by all modern browsers (Chrome, Firefox, Safari, Edge). Typical use: any web image
                  where you want the best compression with broad compatibility.
                </span>
              </li>
            </ul>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              For new projects, WebP is generally the recommended default. It combines the best qualities of JPEG and
              PNG — lossy efficiency for photos, lossless option for graphics, and transparency support — in a single
              format. Use the <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">&lt;picture&gt;</code> element with a JPEG or PNG fallback if you need to support
              legacy browsers.
            </p>
          </section>

          <!-- When to Use Each Format -->
          <section id="when-to-use" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              When to Use Each Format
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Making the right format decision comes down to understanding your content and audience:
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Photographs and complex imagery:</strong> Use WebP lossy (preferred) or JPEG. Target quality
                  75-85% for a good balance. Avoid PNG for photos — file sizes will be unnecessarily large.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Screenshots and UI mockups:</strong> Use WebP lossless or PNG. These images contain sharp text
                  and UI elements that degrade visibly with lossy compression.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Logos and icons:</strong> Use SVG when possible (infinitely scalable, tiny file size). For
                  raster logos, use WebP lossless or PNG with transparency.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Animated content:</strong> Use WebP animated or, for short clips, consider a muted video
                  element with MP4/WebM. Avoid animated GIF — it produces large files with limited color depth.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Thumbnails and social media previews:</strong> Use WebP lossy or JPEG at moderate quality
                  (60-75%). Small display sizes are forgiving of compression artifacts, so you can optimize aggressively.
                </span>
              </li>
            </ul>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              Our compressor tool lets you experiment with different formats and quality levels side by side, so you can
              find the optimal setting for each image before downloading.
            </p>
          </section>

          <!-- FAQ -->
          <section id="faq" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              Frequently Asked Questions
            </h2>
            <div class="space-y-3">
              <details
                v-for="(faq, index) in faqItems"
                :key="index"
                class="group rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary overflow-hidden"
              >
                <summary class="cursor-pointer flex items-center justify-between gap-2 p-4 font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors select-none [&::-webkit-details-marker]:hidden list-none">
                  <span>{{ faq.question }}</span>
                  <span class="shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-45 text-xl leading-none font-light">+</span>
                </summary>
                <p class="px-4 pb-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {{ faq.answer }}
                </p>
              </details>
            </div>
          </section>

          <!-- Built with -->
          <section id="built-with" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              Built With
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              This tool leverages modern browser APIs and one open-source library for ZIP packaging.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">Canvas API</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">MDN - Image drawing and export</div>
                </div>
              </a>
              <a
                href="https://github.com/Stuk/jszip"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">JSZip</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">GitHub - ZIP file creation</div>
                </div>
              </a>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">Web Workers</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">MDN - Background processing</div>
                </div>
              </a>
            </div>
          </section>

          <!-- Related Tools -->
          <section id="related-tools" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              Related Tools
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <NuxtLink
                to="/tools/json-formatter"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0">
                  <Braces :size="18" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">JSON Formatter</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Format, validate, and beautify JSON instantly</div>
                </div>
                <ArrowRight :size="16" class="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 ml-auto shrink-0 transition-colors" />
              </NuxtLink>
              <NuxtLink
                to="/tools/json-diff"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0">
                  <GitCompare :size="18" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">JSON Diff</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Compare and find differences between JSON objects</div>
                </div>
                <ArrowRight :size="16" class="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 ml-auto shrink-0 transition-colors" />
              </NuxtLink>
              <NuxtLink
                to="/tools/jwt-decoder"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0">
                  <KeyRound :size="18" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">JWT Decoder</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Decode and inspect JWT tokens instantly</div>
                </div>
                <ArrowRight :size="16" class="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 ml-auto shrink-0 transition-colors" />
              </NuxtLink>
            </div>
          </section>
        </div>
      </article>
    </template>
  </UiToolPageLayout>
</template>
