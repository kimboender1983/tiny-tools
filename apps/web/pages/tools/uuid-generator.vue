<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import { generateJsonLd } from '~/utils/seo';
import { ExternalLink, ChevronRight, BookOpen, Code, ArrowRight, Binary, KeyRound } from 'lucide-vue-next';

const appStore = useAppStore();
const tool = TOOLS.find((t) => t.slug === 'uuid-generator')!;
const siteUrl = 'https://tinytools.dev';
const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;

const faqItems = [
  {
    question: 'What is a UUID?',
    answer: 'A UUID (Universally Unique Identifier) is a 128-bit identifier standardized by RFC 9562 (formerly RFC 4122). UUIDs are designed to be unique across space and time without requiring a central authority. They are represented as 32 hexadecimal digits grouped in a 8-4-4-4-12 pattern separated by hyphens, such as 550e8400-e29b-41d4-a716-446655440000.',
  },
  {
    question: 'What is the difference between UUID v4 and v7?',
    answer: 'UUID v4 generates 122 random bits, making collisions astronomically unlikely but providing no ordering. UUID v7, introduced in RFC 9562, embeds a 48-bit Unix millisecond timestamp in the first 48 bits followed by random data. This means v7 UUIDs are time-sortable — they naturally sort by creation time, which dramatically improves database index performance when used as primary keys.',
  },
  {
    question: 'Can UUIDs collide?',
    answer: 'While theoretically possible, a UUID v4 collision is extraordinarily unlikely. With 122 random bits, you would need to generate approximately 2.71 × 10^18 UUIDs to have a 50% probability of a single collision. For practical purposes, UUID collisions are considered impossible in real-world applications.',
  },
  {
    question: 'Should I use UUID v4 or v7 for database primary keys?',
    answer: 'UUID v7 is strongly recommended for database primary keys. Because v7 UUIDs are time-sorted, they insert into B-tree indexes sequentially, avoiding random page splits that fragment the index. This can improve write performance by 2-10x compared to random v4 UUIDs in databases like PostgreSQL, MySQL, and MongoDB.',
  },
  {
    question: 'What is the difference between UUID and GUID?',
    answer: 'UUID and GUID (Globally Unique Identifier) are essentially the same thing. GUID is the term used by Microsoft (used in Windows, .NET, SQL Server), while UUID is the standard term used by the IETF RFC and most other platforms. They use the same format and are interchangeable.',
  },
];

useHead({
  title: 'UUID Generator — Free Online UUID v4 & v7 Generator | TinyTools',
  meta: [
    { name: 'description', content: 'Generate UUID v4 and v7 identifiers instantly. Bulk generate up to 500 UUIDs, copy with one click. Free tool running entirely in your browser.' },
    { name: 'keywords', content: tool.keywords.join(', ') },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'UUID Generator — Free Online UUID v4 & v7 Generator | TinyTools' },
    { property: 'og:description', content: 'Generate UUID v4 and v7 identifiers instantly. Bulk generate up to 500, copy with one click.' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'TinyTools' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'UUID Generator — Free Online UUID v4 & v7 Generator | TinyTools' },
    { name: 'twitter:description', content: 'Generate UUID v4 and v7 identifiers instantly. Bulk generate up to 500, copy with one click.' },
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
        { name: 'UUID Generator', url: canonicalUrl },
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
    <ToolsUuidGenerator />

    <template #seo-content>
      <article class="max-w-4xl mx-auto">
        <!-- Quick links -->
        <nav class="mb-6 flex flex-wrap gap-2">
          <a
            v-for="link in [
              { id: 'what-is-uuid', label: 'What is a UUID' },
              { id: 'uuid-versions', label: 'UUID Versions' },
              { id: 'v4-vs-v7', label: 'v4 vs v7' },
              { id: 'database-keys', label: 'Database Keys' },
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
          <!-- What is a UUID -->
          <section id="what-is-uuid" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              What is a UUID?
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                A UUID (Universally Unique Identifier) is a 128-bit label used to uniquely identify information in
                computer systems. Unlike sequential integer IDs, UUIDs can be generated independently on any machine
                without coordination — and the probability of duplicates is negligible.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                UUIDs are represented as 32 hexadecimal digits, displayed in five groups separated by hyphens in the
                form <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx</code>,
                where <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">M</code> indicates
                the version and <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">N</code> indicates the variant.
              </p>
            </div>
          </section>

          <!-- UUID Versions -->
          <section id="uuid-versions" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              UUID Versions Explained
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">v1</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">Timestamp + MAC</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Based on timestamp and MAC address. Leaks hardware identity. Largely superseded by v7.
                </p>
              </div>
              <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">v4</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">Random</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  122 random bits. Most widely used version. No ordering, no information leakage.
                </p>
              </div>
              <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">v5</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">Name-based (SHA-1)</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Deterministic — same input always produces the same UUID. Useful for generating IDs from known data.
                </p>
              </div>
              <div class="rounded-lg border border-brand-200 dark:border-brand-800/50 bg-brand-50/50 dark:bg-brand-900/10 p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-brand-700 dark:text-brand-300">v7</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">Time-sorted</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  48-bit ms timestamp + random. Sortable, index-friendly. Recommended for new projects.
                </p>
              </div>
              <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">Nil</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Special</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  All zeros: <code class="text-[10px]">00000000-0000-0000-0000-000000000000</code>. Used as a sentinel/default value.
                </p>
              </div>
              <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">Max</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Special</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  All ones: <code class="text-[10px]">ffffffff-ffff-ffff-ffff-ffffffffffff</code>. Used as an upper bound sentinel.
                </p>
              </div>
            </div>
          </section>

          <!-- v4 vs v7 -->
          <section id="v4-vs-v7" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              UUID v4 vs v7: When to Use Which
            </h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-surface-border dark:border-surface-dark-border">
                    <th class="text-left py-3 pr-4 font-semibold text-gray-900 dark:text-gray-100"></th>
                    <th class="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">v4 (Random)</th>
                    <th class="text-left py-3 pl-4 font-semibold text-brand-600 dark:text-brand-400">v7 (Time-sorted)</th>
                  </tr>
                </thead>
                <tbody class="text-gray-600 dark:text-gray-400">
                  <tr class="border-b border-surface-border/50 dark:border-surface-dark-border/50">
                    <td class="py-2.5 pr-4 font-medium text-gray-900 dark:text-gray-100">Sortable</td>
                    <td class="py-2.5 px-4">No</td>
                    <td class="py-2.5 pl-4">Yes — by creation time</td>
                  </tr>
                  <tr class="border-b border-surface-border/50 dark:border-surface-dark-border/50">
                    <td class="py-2.5 pr-4 font-medium text-gray-900 dark:text-gray-100">DB index performance</td>
                    <td class="py-2.5 px-4">Poor (random inserts)</td>
                    <td class="py-2.5 pl-4">Excellent (sequential)</td>
                  </tr>
                  <tr class="border-b border-surface-border/50 dark:border-surface-dark-border/50">
                    <td class="py-2.5 pr-4 font-medium text-gray-900 dark:text-gray-100">Timestamp embedded</td>
                    <td class="py-2.5 px-4">No</td>
                    <td class="py-2.5 pl-4">Yes (ms precision)</td>
                  </tr>
                  <tr class="border-b border-surface-border/50 dark:border-surface-dark-border/50">
                    <td class="py-2.5 pr-4 font-medium text-gray-900 dark:text-gray-100">Random bits</td>
                    <td class="py-2.5 px-4">122</td>
                    <td class="py-2.5 pl-4">74</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 pr-4 font-medium text-gray-900 dark:text-gray-100">Best for</td>
                    <td class="py-2.5 px-4">Tokens, session IDs, correlation IDs</td>
                    <td class="py-2.5 pl-4">Primary keys, event IDs, logs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Database Keys -->
          <section id="database-keys" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              UUIDs as Database Primary Keys
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Using UUIDs as primary keys allows generating IDs client-side without a database round-trip, simplifies
                data merging across systems, and prevents ID enumeration attacks. However, random v4 UUIDs cause poor
                B-tree index performance because inserts are scattered randomly across the index pages.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong class="text-gray-900 dark:text-gray-100">UUID v7 solves this.</strong> Because the first 48 bits are a
                millisecond timestamp, new UUIDs are always greater than previous ones. This means they insert at the end
                of the index — just like auto-increment integers — while retaining all the benefits of distributed ID generation.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                For PostgreSQL, store UUIDs as the native <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">uuid</code> type
                (16 bytes) rather than <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">varchar(36)</code> (37 bytes).
                For MySQL 8+, use <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">BINARY(16)</code> with
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">UUID_TO_BIN()</code> for optimal storage.
              </p>
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
              This generator uses the Web Crypto API for cryptographically secure random bytes — no external UUID libraries.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">crypto.getRandomValues()</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">CSPRNG for random bytes</div>
                </div>
              </a>
              <a
                href="https://www.rfc-editor.org/rfc/rfc9562"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">RFC 9562</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">UUID specification (2024)</div>
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
                to="/tools/jwt-decoder"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0">
                  <KeyRound :size="18" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">JWT Decoder</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Decode and inspect JWT tokens</div>
                </div>
                <ArrowRight :size="16" class="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 ml-auto shrink-0 transition-colors" />
              </NuxtLink>
              <NuxtLink
                to="/tools/base64-encode-decode"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0">
                  <Binary :size="18" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Base64 Encoder/Decoder</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Encode and decode Base64 strings</div>
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
