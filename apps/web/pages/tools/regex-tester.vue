<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import { generateJsonLd } from '~/utils/seo';

const appStore = useAppStore();
const tool = TOOLS.find((t) => t.slug === 'regex-tester')!;
const siteUrl = 'https://pickbox.dev';
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

const navLinks = [
  { id: 'what-is-regex', label: 'What is Regex' },
  { id: 'syntax-guide', label: 'Syntax Guide' },
  { id: 'common-patterns', label: 'Common Patterns' },
  { id: 'faq', label: 'FAQ' },
  { id: 'built-with', label: 'Built With' },
  { id: 'related-tools', label: 'Related Tools' },
];

useHead({
  title: 'Regex Tester — Free Online Regular Expression Tester | Pickbox',
  meta: [
    { name: 'description', content: 'Test and debug regular expressions with live matching, capture group highlighting, and replacement preview. Free regex tester running entirely in your browser.' },
    { name: 'keywords', content: tool.keywords.join(', ') },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Regex Tester — Free Online Regular Expression Tester | Pickbox' },
    { property: 'og:description', content: 'Test regex patterns with live matching, capture groups, and replacement preview. Free, browser-based.' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'Pickbox' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Regex Tester — Free Online Regular Expression Tester | Pickbox' },
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
        <SeoNav :links="navLinks" />

        <div class="space-y-6">
          <SeoSection id="what-is-regex" title="What is a Regular Expression?">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                A regular expression (regex or regexp) is a pattern that describes a set of strings. Originally developed
                by mathematician Stephen Kleene in the 1950s, regular expressions are now a fundamental tool in
                programming, text processing, and data validation.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                In JavaScript, regular expressions are created with the
                <code class="code-inline">RegExp</code> constructor or
                literal syntax <code class="code-inline">/pattern/flags</code>.
                They power methods like <code class="code-inline">.match()</code>,
                <code class="code-inline">.replace()</code>,
                <code class="code-inline">.test()</code>, and
                <code class="code-inline">.split()</code>.
              </p>
            </div>
          </SeoSection>

          <SeoSection id="syntax-guide" title="Regex Syntax Guide" icon="code">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                Regular expressions are built from literal characters and metacharacters. Here are the key building blocks:
              </p>
              <ul class="space-y-3">
                <SeoBullet>
                  <strong class="text-content">Character classes</strong> like
                  <code class="code-inline">\d</code> (digit),
                  <code class="code-inline">\w</code> (word character), and
                  <code class="code-inline">[a-z]</code> (ranges) match categories of characters.
                </SeoBullet>
                <SeoBullet>
                  <strong class="text-content">Quantifiers</strong> like
                  <code class="code-inline">*</code>,
                  <code class="code-inline">+</code>,
                  <code class="code-inline">?</code>, and
                  <code class="code-inline">{n,m}</code> control how many times a pattern repeats.
                  Append <code class="code-inline">?</code> for lazy (non-greedy) matching.
                </SeoBullet>
                <SeoBullet>
                  <strong class="text-content">Groups and backreferences</strong> use
                  <code class="code-inline">(pattern)</code> to capture submatches and
                  <code class="code-inline">\1</code> or
                  <code class="code-inline">$1</code> to reference them in replacements.
                </SeoBullet>
                <SeoBullet>
                  <strong class="text-content">Lookahead and lookbehind</strong> —
                  <code class="code-inline">(?=...)</code> and
                  <code class="code-inline">(?&lt;=...)</code> — assert that what follows or precedes
                  the current position matches a pattern, without including it in the match.
                </SeoBullet>
              </ul>
            </div>
          </SeoSection>

          <SeoSection id="common-patterns" title="Common Regex Patterns" icon="code">
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
                class="rounded-lg border border-surface-border p-4"
              >
                <span class="text-sm font-medium text-content">{{ p.label }}</span>
                <code class="block mt-1.5 text-xs font-mono text-brand-accent break-all">{{ p.pattern }}</code>
              </div>
            </div>
          </SeoSection>

          <SeoSection id="faq" title="Frequently Asked Questions">
            <SeoFaq :items="faqItems" />
          </SeoSection>

          <SeoSection id="built-with" title="Built With" icon="code">
            <p class="text-content-tertiary leading-relaxed mb-4">
              This tester uses JavaScript's native RegExp engine — the same engine your code runs against.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <SeoExternalLink
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp"
                title="MDN RegExp"
                description="Complete JS regex reference"
              />
              <SeoExternalLink
                href="https://262.ecma-international.org/15.0/#sec-regexp-regular-expression-objects"
                title="ECMAScript Spec"
                description="RegExp specification"
              />
            </div>
          </SeoSection>

          <SeoSection id="related-tools" title="Related Tools">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SeoRelatedTool
                to="/tools/json-formatter"
                icon="Braces"
                title="JSON Formatter"
                description="Format, validate, and beautify JSON"
              />
              <SeoRelatedTool
                to="/tools/uuid-generator"
                icon="Fingerprint"
                title="UUID Generator"
                description="Generate UUID v4 and v7 identifiers"
              />
            </div>
          </SeoSection>
        </div>
      </article>
    </template>
  </UiToolPageLayout>
</template>
