<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import { generateJsonLd } from '~/utils/seo';
import { ExternalLink, ChevronRight, BookOpen, Code, ArrowRight, KeyRound, Braces, Binary } from 'lucide-vue-next';

const appStore = useAppStore();
const tool = TOOLS.find((t) => t.slug === 'base64-encode-decode')!;
const siteUrl = 'https://tinytools.dev';
const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;

const faqItems = [
  {
    question: 'What is Base64 encoding?',
    answer: 'Base64 is a binary-to-text encoding scheme that represents binary data using 64 printable ASCII characters (A-Z, a-z, 0-9, +, and /). It is commonly used to embed binary data — such as images, files, or cryptographic keys — into text-based formats like JSON, XML, HTML, email, and URLs.',
  },
  {
    question: 'Is Base64 encoding the same as encryption?',
    answer: 'No. Base64 is an encoding scheme, not encryption. It transforms data into a different representation but does not provide any security. Anyone can decode a Base64 string back to its original form without a key. If you need to protect data, use proper encryption (e.g., AES or RSA) before encoding it as Base64.',
  },
  {
    question: 'Why does Base64 make data larger?',
    answer: 'Base64 encodes every 3 bytes of input into 4 ASCII characters, resulting in roughly a 33% size increase. This overhead is the trade-off for representing arbitrary binary data using only printable text characters, which is required by many text-based protocols.',
  },
  {
    question: 'What is URL-safe Base64?',
    answer: 'Standard Base64 uses + and / characters, which have special meaning in URLs. URL-safe Base64 (also called base64url, defined in RFC 4648) replaces + with - and / with _, and optionally removes trailing = padding. This variant is used in JWTs, data URIs in URLs, and other web contexts.',
  },
  {
    question: 'Is it safe to decode Base64 in the browser?',
    answer: 'Yes. Our Base64 tool runs entirely in your browser using JavaScript\'s built-in btoa() and atob() functions combined with the TextEncoder/TextDecoder APIs for proper UTF-8 support. No data is ever sent to a server.',
  },
];

useHead({
  title: 'Base64 Encoder/Decoder — Free Online Base64 Tool | TinyTools',
  meta: [
    { name: 'description', content: 'Encode and decode Base64 strings instantly in your browser. Supports text, files, and URL-safe Base64. Free tool with zero data uploads.' },
    { name: 'keywords', content: tool.keywords.join(', ') },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Base64 Encoder/Decoder — Free Online Base64 Tool | TinyTools' },
    { property: 'og:description', content: 'Encode and decode Base64 strings instantly in your browser. Supports text, files, and URL-safe Base64.' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'TinyTools' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Base64 Encoder/Decoder — Free Online Base64 Tool | TinyTools' },
    { name: 'twitter:description', content: 'Encode and decode Base64 strings instantly in your browser. Supports text, files, and URL-safe Base64.' },
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
        { name: 'Base64 Encoder/Decoder', url: canonicalUrl },
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
    <ToolsBase64 />

    <template #seo-content>
      <article class="max-w-4xl mx-auto">
        <!-- Quick links -->
        <nav class="mb-6 flex flex-wrap gap-2">
          <a
            v-for="link in [
              { id: 'what-is-base64', label: 'What is Base64' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'common-uses', label: 'Common Uses' },
              { id: 'url-safe', label: 'URL-Safe Base64' },
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
          <!-- What is Base64 -->
          <section id="what-is-base64" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              What is Base64 Encoding?
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Base64 is a group of binary-to-text encoding schemes that represent binary data as a string of printable
                ASCII characters. It was originally designed for transmitting binary data over channels that only support
                text, such as email (MIME) and early HTTP.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                The name "Base64" comes from the 64 characters used in the encoding alphabet:
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">A-Z</code>,
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">a-z</code>,
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">0-9</code>,
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">+</code>, and
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">/</code>,
                plus <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">=</code> for padding.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Today, Base64 is used everywhere in web development — from data URIs in CSS and HTML, to encoding
                authentication tokens, API payloads, and file uploads in JSON requests.
              </p>
            </div>
          </section>

          <!-- How It Works -->
          <section id="how-it-works" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              How Base64 Encoding Works
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                The encoding process converts every 3 bytes (24 bits) of input into 4 Base64 characters (6 bits each):
              </p>
              <ol class="space-y-3">
                <li class="flex items-start gap-3">
                  <span class="flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 text-xs font-bold shrink-0 mt-0.5">1</span>
                  <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Take 3 bytes of input data (24 bits total)
                  </span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 text-xs font-bold shrink-0 mt-0.5">2</span>
                  <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Split into four groups of 6 bits
                  </span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 text-xs font-bold shrink-0 mt-0.5">3</span>
                  <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Map each 6-bit value (0-63) to a character in the Base64 alphabet
                  </span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 text-xs font-bold shrink-0 mt-0.5">4</span>
                  <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                    If the input length isn't divisible by 3, pad the output with <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">=</code> characters
                  </span>
                </li>
              </ol>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                For example, the text <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">Hi</code> (2 bytes: 0x48, 0x69) becomes
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">SGk=</code>. The <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">=</code> indicates one byte of padding was needed.
              </p>
            </div>
          </section>

          <!-- Common Uses -->
          <section id="common-uses" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              Common Uses of Base64
            </h2>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Data URIs:</strong> Embed images, fonts, and other assets directly in CSS or HTML using
                  <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">data:image/png;base64,...</code> syntax, eliminating extra HTTP requests.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">API Payloads:</strong> Send binary files (images, PDFs, documents) as JSON string fields in REST APIs, since JSON doesn't support raw binary data.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Authentication:</strong> HTTP Basic authentication encodes
                  <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">username:password</code> as Base64 in the
                  <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">Authorization</code> header. JWT tokens also use Base64url encoding for their header and payload segments.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Email (MIME):</strong> Email protocols were designed for ASCII text. MIME uses Base64 to encode binary attachments so they can be transmitted over SMTP.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Cryptographic Keys:</strong> SSH keys, SSL certificates, and PGP keys are commonly stored in PEM format, which is Base64-encoded DER data wrapped with header/footer lines.
                </span>
              </li>
            </ul>
          </section>

          <!-- URL-Safe Base64 -->
          <section id="url-safe" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              URL-Safe Base64 (base64url)
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Standard Base64 uses <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">+</code> and <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">/</code> characters that have special meaning in URLs and filenames. RFC 4648 defines an alternative "URL and Filename Safe" alphabet:
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 text-center">
                  <div class="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">+</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">becomes</div>
                  <div class="text-lg font-mono font-bold text-brand-600 dark:text-brand-400">-</div>
                </div>
                <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 text-center">
                  <div class="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">/</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">becomes</div>
                  <div class="text-lg font-mono font-bold text-brand-600 dark:text-brand-400">_</div>
                </div>
                <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 text-center">
                  <div class="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">=</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">padding</div>
                  <div class="text-lg font-mono font-bold text-brand-600 dark:text-brand-400">removed</div>
                </div>
              </div>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                This variant is used extensively in JWTs, OAuth tokens, and anywhere Base64 data appears in URLs or query parameters. Toggle the <strong class="text-gray-900 dark:text-gray-100">URL-safe</strong> switch in our tool to use this encoding.
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
              This tool uses native browser APIs — no external encoding libraries needed.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/API/btoa"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">btoa() / atob()</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">Native Base64 encode/decode</div>
                </div>
              </a>
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">TextEncoder / TextDecoder</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">UTF-8 text handling</div>
                </div>
              </a>
              <a
                href="https://datatracker.ietf.org/doc/html/rfc4648"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">RFC 4648</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">Base Encodings specification</div>
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
                  <div class="text-xs text-gray-500 dark:text-gray-400">Decode and inspect JWT tokens (uses Base64url)</div>
                </div>
                <ArrowRight :size="16" class="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 ml-auto shrink-0 transition-colors" />
              </NuxtLink>
              <NuxtLink
                to="/tools/json-formatter"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0">
                  <Braces :size="18" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">JSON Formatter</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Format and validate JSON data</div>
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
