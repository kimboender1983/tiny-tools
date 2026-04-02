<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import { generateJsonLd } from '~/utils/seo';
import { ExternalLink, ChevronRight, BookOpen, Code, ArrowRight, Braces, Fingerprint } from 'lucide-vue-next';

const appStore = useAppStore();
const tool = TOOLS.find((t) => t.slug === 'regex-tester')!;
const siteUrl = 'https://tinytools.dev';
const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;

const faqItems = [
  {
    question: 'What is a regular expression (regex)?',
    answer: 'A regular expression is a sequence of characters that defines a search pattern. It is used for pattern matching within strings — finding, extracting, validating, or replacing text. Regular expressions are supported in virtually every programming language and many text editors.',
  },
  {
    question: 'What do the flags g, i, m, s, and u mean?',
    answer: 'g (global) finds all matches instead of stopping at the first. i (case-insensitive) ignores letter casing. m (multiline) makes ^ and $ match the start/end of each line, not just the entire string. s (dotall) makes . match newline characters. u (unicode) enables full Unicode matching, including surrogate pairs and Unicode property escapes.',
  },
  {
    question: 'What is a capture group?',
    answer: 'A capture group is a portion of the regex enclosed in parentheses ( ). It captures the matched text so you can reference it later — in replacement strings as $1, $2, etc., or in code via the match array. Named groups use the syntax (?<name>...) and can be referenced as $<name> in replacements.',
  },
  {
    question: 'Is this regex tester safe to use with sensitive data?',
    answer: 'Yes. This tool runs entirely in your browser using JavaScript\'s native RegExp engine. No data is sent to any server. Your patterns and test strings are processed locally and optionally saved to sessionStorage for convenience.',
  },
  {
    question: 'Why does my regex work differently in different languages?',
    answer: 'Regex flavors vary between languages. JavaScript\'s regex engine does not support lookbehind in older browsers, possessive quantifiers, or atomic groups. Features like \\b word boundaries, Unicode categories (\\p{L}), and backreferences may behave differently. This tester uses JavaScript\'s native RegExp, so results match what you\'d get in Node.js or browser JavaScript.',
  },
];

useHead({
  title: 'Regex Tester — Free Online Regular Expression Tester | TinyTools',
  meta: [
    { name: 'description', content: 'Test and debug regular expressions with live matching, capture group highlighting, and replacement preview. Free regex tester running entirely in your browser.' },
    { name: 'keywords', content: tool.keywords.join(', ') },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Regex Tester — Free Online Regular Expression Tester | TinyTools' },
    { property: 'og:description', content: 'Test regex patterns with live matching, capture groups, and replacement preview. Free, browser-based.' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'TinyTools' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Regex Tester — Free Online Regular Expression Tester | TinyTools' },
    { name: 'twitter:description', content: 'Test regex patterns with live matching, capture groups, and replacement preview. Free, browser-based.' },
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
        { name: 'Regex Tester', url: canonicalUrl },
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
    <ToolsRegexTester />

    <template #seo-content>
      <article class="max-w-4xl mx-auto">
        <!-- Quick links -->
        <nav class="mb-6 flex flex-wrap gap-2">
          <a
            v-for="link in [
              { id: 'what-is-regex', label: 'What is Regex' },
              { id: 'syntax-guide', label: 'Syntax Guide' },
              { id: 'common-patterns', label: 'Common Patterns' },
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
          <!-- What is Regex -->
          <section id="what-is-regex" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              What is a Regular Expression?
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                A regular expression (regex or regexp) is a pattern that describes a set of strings. Originally developed
                by mathematician Stephen Kleene in the 1950s, regular expressions are now a fundamental tool in
                programming, text processing, and data validation.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                In JavaScript, regular expressions are created with the
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">RegExp</code> constructor or
                literal syntax <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">/pattern/flags</code>.
                They power methods like <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">.match()</code>,
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">.replace()</code>,
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">.test()</code>, and
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">.split()</code>.
              </p>
            </div>
          </section>

          <!-- Syntax Guide -->
          <section id="syntax-guide" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              Regex Syntax Guide
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Regular expressions are built from literal characters and metacharacters. Here are the key building blocks:
              </p>
              <ul class="space-y-3">
                <li class="flex items-start gap-3">
                  <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                  <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                    <strong class="text-gray-900 dark:text-gray-100">Character classes</strong> like
                    <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">\d</code> (digit),
                    <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">\w</code> (word character), and
                    <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">[a-z]</code> (ranges) match categories of characters.
                  </span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                  <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                    <strong class="text-gray-900 dark:text-gray-100">Quantifiers</strong> like
                    <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">*</code>,
                    <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">+</code>,
                    <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">?</code>, and
                    <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">{n,m}</code> control how many times a pattern repeats.
                    Append <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">?</code> for lazy (non-greedy) matching.
                  </span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                  <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                    <strong class="text-gray-900 dark:text-gray-100">Groups and backreferences</strong> use
                    <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">(pattern)</code> to capture submatches and
                    <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">\1</code> or
                    <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code> to reference them in replacements.
                  </span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                  <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                    <strong class="text-gray-900 dark:text-gray-100">Lookahead and lookbehind</strong> —
                    <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">(?=...)</code> and
                    <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">(?&lt;=...)</code> — assert that what follows or precedes
                    the current position matches a pattern, without including it in the match.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <!-- Common Patterns -->
          <section id="common-patterns" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              Common Regex Patterns
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="p in [
                  { label: 'Email address', pattern: '[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}' },
                  { label: 'URL', pattern: 'https?:\\/\\/[\\w.-]+(?:\\.[a-zA-Z]{2,})(?:\\/[^\\s]*)?' },
                  { label: 'IPv4 address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b' },
                  { label: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])' },
                  { label: 'Hex colour', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b' },
                  { label: 'UUID', pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' },
                  { label: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}' },
                  { label: 'HTML tag', pattern: '<\\/?[a-zA-Z][\\w-]*(?:\\s[^>]*)?\\/?>'}
                ]"
                :key="p.label"
                class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4"
              >
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ p.label }}</span>
                <code class="block mt-1.5 text-xs font-mono text-brand-600 dark:text-brand-400 break-all">{{ p.pattern }}</code>
              </div>
            </div>
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
              This tester uses JavaScript's native RegExp engine — the same engine your code runs against.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">MDN RegExp</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">Complete JS regex reference</div>
                </div>
              </a>
              <a
                href="https://262.ecma-international.org/15.0/#sec-regexp-regular-expression-objects"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">ECMAScript Spec</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">RegExp specification</div>
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
                  <div class="text-xs text-gray-500 dark:text-gray-400">Format, validate, and beautify JSON</div>
                </div>
                <ArrowRight :size="16" class="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 ml-auto shrink-0 transition-colors" />
              </NuxtLink>
              <NuxtLink
                to="/tools/uuid-generator"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0">
                  <Fingerprint :size="18" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">UUID Generator</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Generate UUID v4 and v7 identifiers</div>
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
