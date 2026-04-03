<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import { generateJsonLd } from '~/utils/seo';
import { ExternalLink, ChevronRight, BookOpen, Code, ArrowRight, Regex, Fingerprint } from 'lucide-vue-next';

const appStore = useAppStore();
const tool = TOOLS.find((t) => t.slug === 'unix-timestamp')!;
const siteUrl = 'https://pickbox.dev';
const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;

const faqItems = [
  {
    question: 'What is a Unix timestamp?',
    answer: 'A Unix timestamp (also called Epoch time or POSIX time) is the number of seconds that have elapsed since January 1, 1970 00:00:00 UTC — a moment known as the Unix Epoch. It provides a single, timezone-independent number that uniquely identifies a point in time, making it ideal for storing and comparing dates across systems.',
  },
  {
    question: 'What is the difference between seconds and milliseconds?',
    answer: 'A Unix timestamp in seconds is a 10-digit number (e.g. 1712188800). JavaScript, Java, and many APIs use milliseconds — a 13-digit number (e.g. 1712188800000) that is simply the seconds value multiplied by 1000. Our tool detects and converts both formats.',
  },
  {
    question: 'What is the Year 2038 problem?',
    answer: 'Many older systems store Unix timestamps as a signed 32-bit integer, which overflows on January 19, 2038 at 03:14:07 UTC. After that moment, the timestamp wraps to a negative number, potentially breaking date calculations. 64-bit systems and modern languages (JavaScript uses 64-bit floats) are not affected. Most critical infrastructure has been or is being migrated to 64-bit timestamps.',
  },
  {
    question: 'Why do APIs use Unix timestamps instead of date strings?',
    answer: 'Unix timestamps are timezone-neutral, language-agnostic, compact (a single integer), and trivially sortable and comparable. Date strings require parsing, timezone handling, and format negotiation between systems. Timestamps eliminate an entire class of internationalization and parsing bugs.',
  },
  {
    question: 'How does this converter handle timezones?',
    answer: 'Unix timestamps are always in UTC by definition. When converting to a human-readable date, our tool shows both UTC and your local timezone (detected from your browser). When converting a date string to a timestamp, the string is parsed by your browser\'s Date engine, which applies local timezone if no timezone is specified in the input.',
  },
];

useHead({
  title: 'Unix Timestamp Converter — Free Epoch Time Converter | Pickbox',
  meta: [
    { name: 'description', content: 'Convert between Unix timestamps and human-readable dates instantly. Supports seconds and milliseconds, shows UTC and local time, relative time, and more.' },
    { name: 'keywords', content: tool.keywords.join(', ') },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Unix Timestamp Converter — Free Epoch Time Converter | Pickbox' },
    { property: 'og:description', content: 'Convert between Unix timestamps and human-readable dates. Supports seconds and milliseconds.' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'Pickbox' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Unix Timestamp Converter — Free Epoch Time Converter | Pickbox' },
    { name: 'twitter:description', content: 'Convert between Unix timestamps and human-readable dates. Supports seconds and milliseconds.' },
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
        { name: 'Unix Timestamp Converter', url: canonicalUrl },
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
    <ToolsUnixTimestamp />

    <template #seo-content>
      <article class="max-w-4xl mx-auto">
        <!-- Quick links -->
        <nav class="mb-6 flex flex-wrap gap-2">
          <a
            v-for="link in [
              { id: 'what-is-unix', label: 'What is Unix Time' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'common-timestamps', label: 'Notable Timestamps' },
              { id: 'languages', label: 'By Language' },
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
          <!-- What is Unix Timestamp -->
          <section id="what-is-unix" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              What is a Unix Timestamp?
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                A Unix timestamp is the number of seconds elapsed since the <strong class="text-gray-900 dark:text-gray-100">Unix Epoch</strong> —
                midnight UTC on January 1, 1970. This single integer provides a universal, timezone-independent way to
                represent any moment in time.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Unix timestamps are used everywhere: database columns, API responses, log files, JWT tokens, cron jobs,
                and file system metadata. Their simplicity — a single number — makes them trivially sortable, comparable,
                and storable across any programming language or database.
              </p>
            </div>
          </section>

          <!-- How It Works -->
          <section id="how-it-works" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              Seconds vs Milliseconds
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-gray-900 dark:text-gray-100">Seconds (10 digits)</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-surface-dark-secondary dark:text-gray-400">POSIX standard</span>
                </div>
                <code class="block text-sm font-mono text-brand-600 dark:text-brand-400">1712188800</code>
                <p class="text-xs text-gray-500 dark:text-gray-400">Used by: C, Python, PHP, Ruby, Unix shell, PostgreSQL, MySQL</p>
              </div>
              <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-gray-900 dark:text-gray-100">Milliseconds (13 digits)</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-surface-dark-secondary dark:text-gray-400">JS / Java</span>
                </div>
                <code class="block text-sm font-mono text-brand-600 dark:text-brand-400">1712188800000</code>
                <p class="text-xs text-gray-500 dark:text-gray-400">Used by: JavaScript, Java, Dart, Elasticsearch, MongoDB</p>
              </div>
            </div>
          </section>

          <!-- Notable Timestamps -->
          <section id="common-timestamps" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              Notable Timestamps
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="ts in [
                  { label: 'Unix Epoch', value: '0', date: 'Jan 1, 1970 00:00:00 UTC' },
                  { label: 'Year 2000 (Y2K)', value: '946684800', date: 'Jan 1, 2000 00:00:00 UTC' },
                  { label: '1 Billion', value: '1000000000', date: 'Sep 9, 2001 01:46:40 UTC' },
                  { label: 'Max 32-bit', value: '2147483647', date: 'Jan 19, 2038 03:14:07 UTC' },
                  { label: '2 Billion', value: '2000000000', date: 'May 18, 2033 03:33:20 UTC' },
                  { label: 'Year 2100', value: '4102444800', date: 'Jan 1, 2100 00:00:00 UTC' },
                ]"
                :key="ts.label"
                class="flex items-center gap-3 rounded-lg border border-surface-border dark:border-surface-dark-border p-3"
              >
                <code class="text-sm font-mono font-bold text-brand-600 dark:text-brand-400 shrink-0 w-28 text-right">{{ ts.value }}</code>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ ts.label }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ ts.date }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- By Language -->
          <section id="languages" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              Get Current Timestamp by Language
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="lang in [
                  { name: 'JavaScript', code: 'Math.floor(Date.now() / 1000)', unit: 'seconds' },
                  { name: 'Python', code: 'import time; int(time.time())', unit: 'seconds' },
                  { name: 'PHP', code: 'time()', unit: 'seconds' },
                  { name: 'Go', code: 'time.Now().Unix()', unit: 'seconds' },
                  { name: 'Java', code: 'System.currentTimeMillis()', unit: 'ms' },
                  { name: 'Ruby', code: 'Time.now.to_i', unit: 'seconds' },
                  { name: 'C#', code: 'DateTimeOffset.UtcNow.ToUnixTimeSeconds()', unit: 'seconds' },
                  { name: 'Rust', code: 'SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs()', unit: 'seconds' },
                  { name: 'Bash', code: 'date +%s', unit: 'seconds' },
                  { name: 'SQL (PostgreSQL)', code: 'SELECT EXTRACT(EPOCH FROM NOW())', unit: 'seconds' },
                ]"
                :key="lang.name"
                class="rounded-lg border border-surface-border dark:border-surface-dark-border p-3"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-semibold text-brand-600 dark:text-brand-400">{{ lang.name }}</span>
                  <span class="text-[10px] text-gray-400 dark:text-gray-600">{{ lang.unit }}</span>
                </div>
                <code class="block text-xs font-mono text-gray-700 dark:text-gray-300 break-all">{{ lang.code }}</code>
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
              This tool uses JavaScript's native Date API — no external date libraries needed.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">MDN Date</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">JavaScript Date reference</div>
                </div>
              </a>
              <a
                href="https://en.wikipedia.org/wiki/Unix_time"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">Wikipedia: Unix time</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">History and specification</div>
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
                to="/tools/uuid-generator"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0">
                  <Fingerprint :size="18" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">UUID Generator</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">UUID v7 uses Unix timestamps</div>
                </div>
                <ArrowRight :size="16" class="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 ml-auto shrink-0 transition-colors" />
              </NuxtLink>
              <NuxtLink
                to="/tools/regex-tester"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0">
                  <Regex :size="18" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Regex Tester</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Parse timestamps from logs with regex</div>
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
