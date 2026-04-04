<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import { generateJsonLd } from '~/utils/seo';

const appStore = useAppStore();
const tool = TOOLS.find((t) => t.slug === 'uuid-generator')!;
const siteUrl = 'https://pickbox.dev';
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

const navLinks = [
  { id: 'what-is-uuid', label: 'What is a UUID' },
  { id: 'uuid-versions', label: 'UUID Versions' },
  { id: 'v4-vs-v7', label: 'v4 vs v7' },
  { id: 'database-keys', label: 'Database Keys' },
  { id: 'faq', label: 'FAQ' },
  { id: 'built-with', label: 'Built With' },
  { id: 'related-tools', label: 'Related Tools' },
];

useHead({
  title: 'UUID Generator — Free Online UUID v4 & v7 Generator | Pickbox',
  meta: [
    { name: 'description', content: 'Generate UUID v4 and v7 identifiers instantly. Bulk generate up to 500 UUIDs, copy with one click. Free tool running entirely in your browser.' },
    { name: 'keywords', content: tool.keywords.join(', ') },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'UUID Generator — Free Online UUID v4 & v7 Generator | Pickbox' },
    { property: 'og:description', content: 'Generate UUID v4 and v7 identifiers instantly. Bulk generate up to 500, copy with one click.' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'Pickbox' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'UUID Generator — Free Online UUID v4 & v7 Generator | Pickbox' },
    { name: 'twitter:description', content: 'Generate UUID v4 and v7 identifiers instantly. Bulk generate up to 500, copy with one click.' },
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
        <SeoNav :links="navLinks" />

        <div class="space-y-6">
          <SeoSection id="what-is-uuid" title="What is a UUID?">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                A UUID (Universally Unique Identifier) is a 128-bit label used to uniquely identify information in
                computer systems. Unlike sequential integer IDs, UUIDs can be generated independently on any machine
                without coordination — and the probability of duplicates is negligible.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                UUIDs are represented as 32 hexadecimal digits, displayed in five groups separated by hyphens in the
                form <code class="code-inline">xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx</code>,
                where <code class="code-inline">M</code> indicates
                the version and <code class="code-inline">N</code> indicates the variant.
              </p>
            </div>
          </SeoSection>

          <SeoSection id="uuid-versions" title="UUID Versions Explained" icon="code">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="rounded-lg border border-surface-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-content">v1</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">Timestamp + MAC</span>
                </div>
                <p class="text-xs text-content-tertiary leading-relaxed">
                  Based on timestamp and MAC address. Leaks hardware identity. Largely superseded by v7.
                </p>
              </div>
              <div class="rounded-lg border border-surface-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-content">v4</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">Random</span>
                </div>
                <p class="text-xs text-content-tertiary leading-relaxed">
                  122 random bits. Most widely used version. No ordering, no information leakage.
                </p>
              </div>
              <div class="rounded-lg border border-surface-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-content">v5</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">Name-based (SHA-1)</span>
                </div>
                <p class="text-xs text-content-tertiary leading-relaxed">
                  Deterministic — same input always produces the same UUID. Useful for generating IDs from known data.
                </p>
              </div>
              <div class="rounded-lg border border-brand-200 bg-brand-50/50 p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-brand-accent">v7</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-brand-100 text-brand-accent">Time-sorted</span>
                </div>
                <p class="text-xs text-content-tertiary leading-relaxed">
                  48-bit ms timestamp + random. Sortable, index-friendly. Recommended for new projects.
                </p>
              </div>
              <div class="rounded-lg border border-surface-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-content">Nil</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Special</span>
                </div>
                <p class="text-xs text-content-tertiary leading-relaxed">
                  All zeros: <code class="text-[10px]">00000000-0000-0000-0000-000000000000</code>. Used as a sentinel/default value.
                </p>
              </div>
              <div class="rounded-lg border border-surface-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-content">Max</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Special</span>
                </div>
                <p class="text-xs text-content-tertiary leading-relaxed">
                  All ones: <code class="text-[10px]">ffffffff-ffff-ffff-ffff-ffffffffffff</code>. Used as an upper bound sentinel.
                </p>
              </div>
            </div>
          </SeoSection>

          <SeoSection id="v4-vs-v7" title="UUID v4 vs v7: When to Use Which" icon="code">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-surface-border">
                    <th class="text-left py-3 pr-4 font-semibold text-content"></th>
                    <th class="text-left py-3 px-4 font-semibold text-content">v4 (Random)</th>
                    <th class="text-left py-3 pl-4 font-semibold text-brand-accent">v7 (Time-sorted)</th>
                  </tr>
                </thead>
                <tbody class="text-content-tertiary">
                  <tr class="border-b border-surface-border/50">
                    <td class="py-2.5 pr-4 font-medium text-content">Sortable</td>
                    <td class="py-2.5 px-4">No</td>
                    <td class="py-2.5 pl-4">Yes — by creation time</td>
                  </tr>
                  <tr class="border-b border-surface-border/50">
                    <td class="py-2.5 pr-4 font-medium text-content">DB index performance</td>
                    <td class="py-2.5 px-4">Poor (random inserts)</td>
                    <td class="py-2.5 pl-4">Excellent (sequential)</td>
                  </tr>
                  <tr class="border-b border-surface-border/50">
                    <td class="py-2.5 pr-4 font-medium text-content">Timestamp embedded</td>
                    <td class="py-2.5 px-4">No</td>
                    <td class="py-2.5 pl-4">Yes (ms precision)</td>
                  </tr>
                  <tr class="border-b border-surface-border/50">
                    <td class="py-2.5 pr-4 font-medium text-content">Random bits</td>
                    <td class="py-2.5 px-4">122</td>
                    <td class="py-2.5 pl-4">74</td>
                  </tr>
                  <tr>
                    <td class="py-2.5 pr-4 font-medium text-content">Best for</td>
                    <td class="py-2.5 px-4">Tokens, session IDs, correlation IDs</td>
                    <td class="py-2.5 pl-4">Primary keys, event IDs, logs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SeoSection>

          <SeoSection id="database-keys" title="UUIDs as Database Primary Keys">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                Using UUIDs as primary keys allows generating IDs client-side without a database round-trip, simplifies
                data merging across systems, and prevents ID enumeration attacks. However, random v4 UUIDs cause poor
                B-tree index performance because inserts are scattered randomly across the index pages.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                <strong class="text-content">UUID v7 solves this.</strong> Because the first 48 bits are a
                millisecond timestamp, new UUIDs are always greater than previous ones. This means they insert at the end
                of the index — just like auto-increment integers — while retaining all the benefits of distributed ID generation.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                For PostgreSQL, store UUIDs as the native <code class="code-inline">uuid</code> type
                (16 bytes) rather than <code class="code-inline">varchar(36)</code> (37 bytes).
                For MySQL 8+, use <code class="code-inline">BINARY(16)</code> with
                <code class="code-inline">UUID_TO_BIN()</code> for optimal storage.
              </p>
            </div>
          </SeoSection>

          <SeoSection id="faq" title="Frequently Asked Questions">
            <SeoFaq :items="faqItems" />
          </SeoSection>

          <SeoSection id="built-with" title="Built With" icon="code">
            <p class="text-content-tertiary leading-relaxed mb-4">
              This generator uses the Web Crypto API for cryptographically secure random bytes — no external UUID libraries.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <SeoExternalLink
                href="https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues"
                title="crypto.getRandomValues()"
                description="CSPRNG for random bytes"
              />
              <SeoExternalLink
                href="https://www.rfc-editor.org/rfc/rfc9562"
                title="RFC 9562"
                description="UUID specification (2024)"
              />
            </div>
          </SeoSection>

          <SeoSection id="related-tools" title="Related Tools">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SeoRelatedTool
                to="/tools/jwt-decoder"
                icon="KeyRound"
                title="JWT Decoder"
                description="Decode and inspect JWT tokens"
              />
              <SeoRelatedTool
                to="/tools/base64-encode-decode"
                icon="Binary"
                title="Base64 Encoder/Decoder"
                description="Encode and decode Base64 strings"
              />
            </div>
          </SeoSection>
        </div>
      </article>
    </template>
  </UiToolPageLayout>
</template>
