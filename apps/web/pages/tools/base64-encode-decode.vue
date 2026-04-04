<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import { generateJsonLd } from '~/utils/seo';

const appStore = useAppStore();
const tool = TOOLS.find((t) => t.slug === 'base64-encode-decode')!;
const siteUrl = 'https://pickbox.dev';
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

const navLinks = [
  { id: 'what-is-base64', label: 'What is Base64' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'common-uses', label: 'Common Uses' },
  { id: 'url-safe', label: 'URL-Safe Base64' },
  { id: 'faq', label: 'FAQ' },
  { id: 'built-with', label: 'Built With' },
  { id: 'related-tools', label: 'Related Tools' },
];

useHead({
  title: 'Base64 Encoder/Decoder — Free Online Base64 Tool | Pickbox',
  meta: [
    { name: 'description', content: 'Encode and decode Base64 strings instantly in your browser. Supports text, files, and URL-safe Base64. Free tool with zero data uploads.' },
    { name: 'keywords', content: tool.keywords.join(', ') },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Base64 Encoder/Decoder — Free Online Base64 Tool | Pickbox' },
    { property: 'og:description', content: 'Encode and decode Base64 strings instantly in your browser. Supports text, files, and URL-safe Base64.' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'Pickbox' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Base64 Encoder/Decoder — Free Online Base64 Tool | Pickbox' },
    { name: 'twitter:description', content: 'Encode and decode Base64 strings instantly in your browser. Supports text, files, and URL-safe Base64.' },
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
        <SeoNav :links="navLinks" />

        <div class="space-y-6">
          <SeoSection id="what-is-base64" title="What is Base64 Encoding?">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                Base64 is a group of binary-to-text encoding schemes that represent binary data as a string of printable
                ASCII characters. It was originally designed for transmitting binary data over channels that only support
                text, such as email (MIME) and early HTTP.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                The name "Base64" comes from the 64 characters used in the encoding alphabet:
                <code class="code-inline">A-Z</code>,
                <code class="code-inline">a-z</code>,
                <code class="code-inline">0-9</code>,
                <code class="code-inline">+</code>, and
                <code class="code-inline">/</code>,
                plus <code class="code-inline">=</code> for padding.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                Today, Base64 is used everywhere in web development — from data URIs in CSS and HTML, to encoding
                authentication tokens, API payloads, and file uploads in JSON requests.
              </p>
            </div>
          </SeoSection>

          <SeoSection id="how-it-works" title="How Base64 Encoding Works" icon="code">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                The encoding process converts every 3 bytes (24 bits) of input into 4 Base64 characters (6 bits each):
              </p>
              <ol class="space-y-3">
                <li class="flex items-start gap-3">
                  <span class="flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-accent text-xs font-bold shrink-0 mt-0.5">1</span>
                  <span class="text-content-tertiary leading-relaxed">
                    Take 3 bytes of input data (24 bits total)
                  </span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-accent text-xs font-bold shrink-0 mt-0.5">2</span>
                  <span class="text-content-tertiary leading-relaxed">
                    Split into four groups of 6 bits
                  </span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-accent text-xs font-bold shrink-0 mt-0.5">3</span>
                  <span class="text-content-tertiary leading-relaxed">
                    Map each 6-bit value (0-63) to a character in the Base64 alphabet
                  </span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex items-center justify-center w-6 h-6 rounded-full bg-brand-50 text-brand-accent text-xs font-bold shrink-0 mt-0.5">4</span>
                  <span class="text-content-tertiary leading-relaxed">
                    If the input length isn't divisible by 3, pad the output with <code class="code-inline">=</code> characters
                  </span>
                </li>
              </ol>
              <p class="text-content-tertiary leading-relaxed">
                For example, the text <code class="code-inline">Hi</code> (2 bytes: 0x48, 0x69) becomes
                <code class="code-inline">SGk=</code>. The <code class="code-inline">=</code> indicates one byte of padding was needed.
              </p>
            </div>
          </SeoSection>

          <SeoSection id="common-uses" title="Common Uses of Base64">
            <ul class="space-y-3">
              <SeoBullet>
                <strong class="text-content">Data URIs:</strong> Embed images, fonts, and other assets directly in CSS or HTML using
                <code class="code-inline">data:image/png;base64,...</code> syntax, eliminating extra HTTP requests.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">API Payloads:</strong> Send binary files (images, PDFs, documents) as JSON string fields in REST APIs, since JSON doesn't support raw binary data.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Authentication:</strong> HTTP Basic authentication encodes
                <code class="code-inline">username:password</code> as Base64 in the
                <code class="code-inline">Authorization</code> header. JWT tokens also use Base64url encoding for their header and payload segments.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Email (MIME):</strong> Email protocols were designed for ASCII text. MIME uses Base64 to encode binary attachments so they can be transmitted over SMTP.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Cryptographic Keys:</strong> SSH keys, SSL certificates, and PGP keys are commonly stored in PEM format, which is Base64-encoded DER data wrapped with header/footer lines.
              </SeoBullet>
            </ul>
          </SeoSection>

          <SeoSection id="url-safe" title="URL-Safe Base64 (base64url)" icon="code">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                Standard Base64 uses <code class="code-inline">+</code> and <code class="code-inline">/</code> characters that have special meaning in URLs and filenames. RFC 4648 defines an alternative "URL and Filename Safe" alphabet:
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="rounded-lg border border-surface-border p-4 text-center">
                  <div class="text-lg font-mono font-bold text-content">+</div>
                  <div class="text-xs text-content-muted mt-1">becomes</div>
                  <div class="text-lg font-mono font-bold text-brand-accent">-</div>
                </div>
                <div class="rounded-lg border border-surface-border p-4 text-center">
                  <div class="text-lg font-mono font-bold text-content">/</div>
                  <div class="text-xs text-content-muted mt-1">becomes</div>
                  <div class="text-lg font-mono font-bold text-brand-accent">_</div>
                </div>
                <div class="rounded-lg border border-surface-border p-4 text-center">
                  <div class="text-lg font-mono font-bold text-content">=</div>
                  <div class="text-xs text-content-muted mt-1">padding</div>
                  <div class="text-lg font-mono font-bold text-brand-accent">removed</div>
                </div>
              </div>
              <p class="text-content-tertiary leading-relaxed">
                This variant is used extensively in JWTs, OAuth tokens, and anywhere Base64 data appears in URLs or query parameters. Toggle the <strong class="text-content">URL-safe</strong> switch in our tool to use this encoding.
              </p>
            </div>
          </SeoSection>

          <SeoSection id="faq" title="Frequently Asked Questions">
            <SeoFaq :items="faqItems" />
          </SeoSection>

          <SeoSection id="built-with" title="Built With" icon="code">
            <p class="text-content-tertiary leading-relaxed mb-4">
              This tool uses native browser APIs — no external encoding libraries needed.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <SeoExternalLink
                href="https://developer.mozilla.org/en-US/docs/Web/API/btoa"
                title="btoa() / atob()"
                description="Native Base64 encode/decode"
              />
              <SeoExternalLink
                href="https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder"
                title="TextEncoder / TextDecoder"
                description="UTF-8 text handling"
              />
              <SeoExternalLink
                href="https://datatracker.ietf.org/doc/html/rfc4648"
                title="RFC 4648"
                description="Base Encodings specification"
              />
            </div>
          </SeoSection>

          <SeoSection id="related-tools" title="Related Tools">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SeoRelatedTool
                to="/tools/jwt-decoder"
                icon="KeyRound"
                title="JWT Decoder"
                description="Decode and inspect JWT tokens (uses Base64url)"
              />
              <SeoRelatedTool
                to="/tools/json-formatter"
                icon="Braces"
                title="JSON Formatter"
                description="Format and validate JSON data"
              />
            </div>
          </SeoSection>
        </div>
      </article>
    </template>
  </UiToolPageLayout>
</template>
