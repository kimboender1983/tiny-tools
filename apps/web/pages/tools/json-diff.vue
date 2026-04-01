<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import { generateJsonLd } from '~/utils/seo';
import { ExternalLink, ChevronRight, BookOpen, Code, Braces, KeyRound, ArrowRight } from 'lucide-vue-next';

const appStore = useAppStore();
const tool = TOOLS.find((t) => t.slug === 'json-diff')!;
const siteUrl = 'https://tinytools.dev';
const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;

const faqItems = [
  {
    question: 'How does the JSON diff comparison work?',
    answer: 'Our JSON diff tool parses both inputs into structured objects and performs a deep recursive comparison. It detects added keys, removed keys, and changed values at every nesting level. The results are displayed in a side-by-side view with color-coded highlighting so you can instantly see what changed.',
  },
  {
    question: 'Can I compare minified JSON with formatted JSON?',
    answer: 'Yes. The tool parses both inputs into their object representations before comparing, so whitespace, indentation, and formatting differences are completely ignored. Only structural and value differences are reported.',
  },
  {
    question: 'Does key order matter when comparing JSON?',
    answer: 'No. According to the JSON specification, objects are unordered collections of key-value pairs. Our diff tool compares by key name regardless of the order they appear in. Two objects with the same keys and values in different orders are considered identical.',
  },
  {
    question: 'Is my data safe when using this comparison tool?',
    answer: 'Absolutely. The entire comparison runs in your browser using JavaScript. No data is transmitted to any server. Your API responses, configuration files, and database exports stay entirely on your device throughout the process.',
  },
];

useHead({
  title: 'JSON Diff — Free Online JSON & Text Comparison Tool | TinyTools',
  meta: [
    { name: 'description', content: 'Compare two JSON objects side by side and instantly spot differences. Free online JSON diff tool with deep comparison, color-coded output, and zero uploads.' },
    { name: 'keywords', content: tool.keywords.join(', ') },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'JSON Diff — Free Online JSON & Text Comparison Tool | TinyTools' },
    { property: 'og:description', content: 'Compare two JSON objects side by side and instantly spot differences. Free diff tool with color-coded output.' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'TinyTools' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'JSON Diff — Free Online JSON & Text Comparison Tool | TinyTools' },
    { name: 'twitter:description', content: 'Compare two JSON objects side by side and instantly spot differences. Free diff tool with color-coded output.' },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(generateJsonLd('SoftwareApplication', {
        name: tool.name,
        description: tool.description,
        url: canonicalUrl,
        category: tool.category,
      })),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(generateJsonLd('FAQPage', faqItems)),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(generateJsonLd('BreadcrumbList', [
        { name: 'Home', url: siteUrl },
        { name: 'JSON Diff', url: canonicalUrl },
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
    full-width
  >
    <ToolsJsonDiff />

    <template #seo-content>
      <article class="max-w-4xl mx-auto">
        <!-- Quick links -->
        <nav class="mb-6 flex flex-wrap gap-2">
          <a
            v-for="link in [
              { id: 'why-compare', label: 'Why Compare' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'use-cases', label: 'Use Cases' },
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
          <!-- Why Compare JSON Files -->
          <section id="why-compare" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              Why Compare JSON Files?
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Comparing JSON data is one of the most common tasks in modern software development. Whether you are debugging
                an API that returns unexpected responses, reviewing configuration changes before deployment, or verifying
                that a data migration preserved all records, a reliable diff tool saves significant time and reduces the risk
                of overlooking subtle changes.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Unlike plain text diffs, a proper JSON comparison understands the structure of the data. It knows that
                reordering keys in an object does not change its meaning, and it can distinguish between a missing key and a
                key with a <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">null</code> value. This structural awareness produces far more accurate and useful results
                than line-by-line text comparison.
              </p>
            </div>
          </section>

          <!-- How Deep JSON Comparison Works -->
          <section id="how-it-works" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              How Deep JSON Comparison Works
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                A deep comparison algorithm recursively walks both JSON trees simultaneously. At each level, it categorizes
                every key into one of three buckets: keys present only in the left document (deletions), keys present only in
                the right document (additions), and keys present in both (potential modifications).
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                For keys present in both documents, the algorithm compares their values. If both values are objects, it
                recurses deeper. If both are arrays, it compares element by element. For primitive values (strings, numbers,
                booleans, null), it performs a strict equality check. This approach ensures that even deeply nested changes
                in complex JSON structures are detected and reported with their full path.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                The result is a structured diff that shows the exact location, old value, and new value for every change —
                far more informative than a generic text diff that simply highlights different lines.
              </p>
            </div>
          </section>

          <!-- Common Use Cases -->
          <section id="use-cases" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              Common Use Cases for JSON Diff
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Developers and teams rely on JSON comparison in a wide range of scenarios:
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">API debugging:</strong> Compare expected versus actual API responses to pinpoint discrepancies
                  in field values, missing properties, or unexpected type changes.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Configuration auditing:</strong> Review changes to JSON configuration files (Terraform state,
                  <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">tsconfig.json</code>, ESLint configs) before merging pull requests.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Data migration verification:</strong> Confirm that records exported from one system match those
                  imported into another, catching any transformation errors.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Schema evolution:</strong> Track how API response shapes change between versions to maintain
                  backward compatibility and update client code accordingly.
                </span>
              </li>
            </ul>
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
              This tool uses the <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">diff</code> package for accurate line-level comparison — the same engine used by Jest, Mocha, and thousands of other projects.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://github.com/kpdecker/jsdiff"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">jsdiff on GitHub</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">kpdecker/jsdiff — JavaScript text diff library</div>
                </div>
              </a>
              <a
                href="https://www.npmjs.com/package/diff"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">diff on npm</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">~50M weekly downloads</div>
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
