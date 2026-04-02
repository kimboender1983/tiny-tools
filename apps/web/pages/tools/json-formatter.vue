<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import { generateJsonLd } from '~/utils/seo';
import { ExternalLink, ChevronRight, BookOpen, Code, GitCompare, ArrowRight } from 'lucide-vue-next';

const appStore = useAppStore();
const tool = TOOLS.find((t) => t.slug === 'json-formatter')!;
const siteUrl = 'https://tinytools.dev';
const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;

const faqItems = [
  {
    question: 'What does a JSON formatter do?',
    answer: 'A JSON formatter takes raw or minified JSON data and restructures it with consistent indentation, line breaks, and spacing. This makes the data far easier to read, debug, and understand. Most formatters also validate the JSON and highlight syntax errors.',
  },
  {
    question: 'Is it safe to paste sensitive JSON data into an online formatter?',
    answer: 'With TinyTools, yes. Our JSON formatter runs entirely in your browser using JavaScript. Your data is never sent to a server, stored, or logged. Everything is processed client-side, so your API responses, configuration files, and tokens stay on your device.',
  },
  {
    question: 'What is the difference between JSON.stringify and a JSON formatter?',
    answer: 'JSON.stringify() is a JavaScript method that converts a JavaScript object into a JSON string. A JSON formatter takes an existing JSON string and reformats it for readability. Under the hood, most formatters use JSON.parse() followed by JSON.stringify(value, null, 2) to produce indented output.',
  },
  {
    question: 'Why is my JSON invalid?',
    answer: 'Common reasons include trailing commas after the last property, single quotes instead of double quotes, unquoted property names, missing commas between items, and comments (JSON does not support comments). Our formatter highlights the exact line and position of the error to help you fix it quickly.',
  },
  {
    question: 'Can I convert JSON to YAML or other formats?',
    answer: 'Our JSON formatter focuses on formatting and validating JSON. For converting between JSON, YAML, TOML, and other serialization formats, we plan to add dedicated converter tools in the future. In the meantime, you can validate your JSON here before converting it elsewhere.',
  },
];

useHead({
  title: 'JSON Formatter — Free Online JSON Beautifier & Validator | TinyTools',
  meta: [
    { name: 'description', content: 'Format, beautify, and validate JSON instantly in your browser. Free JSON formatter with syntax highlighting, error detection, and zero data uploads.' },
    { name: 'keywords', content: tool.keywords.join(', ') },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'JSON Formatter — Free Online JSON Beautifier & Validator | TinyTools' },
    { property: 'og:description', content: 'Format, beautify, and validate JSON instantly in your browser. Free tool with syntax highlighting and error detection.' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'TinyTools' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'JSON Formatter — Free Online JSON Beautifier & Validator | TinyTools' },
    { name: 'twitter:description', content: 'Format, beautify, and validate JSON instantly in your browser. Free tool with syntax highlighting and error detection.' },
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
        { name: 'JSON Formatter', url: canonicalUrl },
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
    <ToolsJsonFormatter />

    <template #seo-content>
      <article class="max-w-4xl mx-auto">
        <!-- Quick links -->
        <nav class="mb-6 flex flex-wrap gap-2">
          <a
            v-for="link in [
              { id: 'what-is-json', label: 'What is JSON' },
              { id: 'common-errors', label: 'Syntax Errors' },
              { id: 'json-vs-yaml', label: 'JSON vs YAML' },
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
          <!-- What is JSON -->
          <section id="what-is-json" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              What is JSON?
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                JSON (JavaScript Object Notation) is a lightweight, text-based data interchange format that has become the
                de facto standard for web APIs, configuration files, and data storage. Originally derived from JavaScript,
                JSON is now language-independent and supported by virtually every modern programming language through
                built-in libraries or third-party parsers.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                A JSON document consists of two fundamental structures: objects (unordered collections of key-value pairs
                wrapped in curly braces) and arrays (ordered lists of values wrapped in square brackets). Values can be
                strings, numbers, booleans (<code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">true</code> or <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">false</code>), <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">null</code>, or nested objects
                and arrays. This simplicity is what makes JSON so widely adopted — it is human-readable yet easy for machines
                to parse and generate.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                Developers encounter JSON daily when working with REST APIs, GraphQL responses, package manifests like
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">package.json</code>, infrastructure-as-code templates, and NoSQL databases such as MongoDB and
                CouchDB. Understanding JSON structure is a foundational skill for modern software development.
              </p>
            </div>
          </section>

          <!-- Common JSON Syntax Errors -->
          <section id="common-errors" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              Common JSON Syntax Errors
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Despite its simplicity, JSON has strict syntax rules that trip up even experienced developers. The most
              frequent mistakes include:
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Trailing commas:</strong> Unlike JavaScript objects, JSON does not allow a comma after the last
                  element in an object or array. <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">{"a": 1, "b": 2,}</code> is invalid.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Single quotes:</strong> JSON requires double quotes for all strings and property names. Using
                  single quotes like <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">{'name': 'value'}</code> will fail parsing.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Unquoted keys:</strong> Every key in a JSON object must be a double-quoted string.
                  <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">{name: "value"}</code> is valid JavaScript but invalid JSON.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Comments:</strong> JSON does not support comments of any kind — no <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">//</code> line comments
                  and no <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">/* */</code> block comments. If you need comments, consider JSONC or JSON5.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Special number formats:</strong> Hexadecimal (<code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">0xFF</code>), leading zeros (<code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">07</code>),
                  and positive sign prefixes (<code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">+1</code>) are all invalid in JSON. Only standard decimal notation and
                  scientific notation (e.g., <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">1.5e10</code>) are allowed.
                </span>
              </li>
            </ul>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              Our JSON formatter catches all of these errors and reports the exact line and character position, so you can
              fix problems in seconds instead of hunting through hundreds of lines of data.
            </p>
          </section>

          <!-- JSON vs YAML -->
          <section id="json-vs-yaml" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              JSON vs YAML
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                JSON and YAML are both popular serialization formats, but they serve somewhat different use cases. JSON is
                stricter and more predictable — its rigid syntax means fewer ambiguities and faster parsing. YAML, on the
                other hand, prioritizes human readability with indentation-based nesting, support for comments, and more
                flexible value types.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                In practice, JSON dominates in API communication and programmatic data exchange where parsing speed and
                unambiguous structure matter. YAML is preferred for configuration files (Kubernetes manifests, CI/CD
                pipelines, Ansible playbooks) where humans frequently read and edit the files by hand.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                One key advantage of JSON is its round-trip safety: parsing and re-serializing JSON always produces the same
                output. YAML's flexibility can introduce subtle bugs — for instance, the string <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">no</code> may be
                interpreted as a boolean <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">false</code>, and <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">3.10</code> may be parsed as the number
                <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">3.1</code>. These gotchas make JSON the safer choice for machine-to-machine communication.
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
              This tool uses no external packages — just built-in browser APIs.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">MDN JSON Reference</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">JSON.parse / JSON.stringify docs</div>
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
            </div>
          </section>
        </div>
      </article>
    </template>
  </UiToolPageLayout>
</template>
