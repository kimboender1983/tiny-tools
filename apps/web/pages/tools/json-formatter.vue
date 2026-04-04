<script setup lang="ts">
    import { TOOLS } from "@tiny-tools/shared";
    import { generateJsonLd } from "~/utils/seo";

    const appStore = useAppStore();
    const tool = TOOLS.find((t) => t.slug === "json-formatter");
    if (!tool) throw new Error("Tool not found: json-formatter");
    const siteUrl = "https://pickbox.dev";
    const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;

    const faqItems = [
        {
            question: "What does a JSON formatter do?",
            answer: "A JSON formatter takes raw or minified JSON data and restructures it with consistent indentation, line breaks, and spacing. This makes the data far easier to read, debug, and understand. Most formatters also validate the JSON and highlight syntax errors.",
        },
        {
            question: "Is it safe to paste sensitive JSON data into an online formatter?",
            answer: "With Pickbox, yes. Our JSON formatter runs entirely in your browser using JavaScript. Your data is never sent to a server, stored, or logged. Everything is processed client-side, so your API responses, configuration files, and tokens stay on your device.",
        },
        {
            question: "What is the difference between JSON.stringify and a JSON formatter?",
            answer: "JSON.stringify() is a JavaScript method that converts a JavaScript object into a JSON string. A JSON formatter takes an existing JSON string and reformats it for readability. Under the hood, most formatters use JSON.parse() followed by JSON.stringify(value, null, 2) to produce indented output.",
        },
        {
            question: "Why is my JSON invalid?",
            answer: "Common reasons include trailing commas after the last property, single quotes instead of double quotes, unquoted property names, missing commas between items, and comments (JSON does not support comments). Our formatter highlights the exact line and position of the error to help you fix it quickly.",
        },
        {
            question: "Can I convert JSON to YAML or other formats?",
            answer: "Our JSON formatter focuses on formatting and validating JSON. For converting between JSON, YAML, TOML, and other serialization formats, we plan to add dedicated converter tools in the future. In the meantime, you can validate your JSON here before converting it elsewhere.",
        },
    ];

    const navLinks = [
        { id: "what-is-json", label: "What is JSON" },
        { id: "common-errors", label: "Syntax Errors" },
        { id: "json-vs-yaml", label: "JSON vs YAML" },
        { id: "faq", label: "FAQ" },
        { id: "built-with", label: "Built With" },
        { id: "related-tools", label: "Related Tools" },
    ];

    useHead({
        title: "JSON Formatter — Free Online JSON Beautifier & Validator | Pickbox",
        meta: [
            {
                name: "description",
                content:
                    "Format, beautify, and validate JSON instantly in your browser. Free JSON formatter with syntax highlighting, error detection, and zero data uploads.",
            },
            { name: "keywords", content: tool.keywords.join(", ") },
            { property: "og:type", content: "website" },
            {
                property: "og:title",
                content: "JSON Formatter — Free Online JSON Beautifier & Validator | Pickbox",
            },
            {
                property: "og:description",
                content:
                    "Format, beautify, and validate JSON instantly in your browser. Free tool with syntax highlighting and error detection.",
            },
            { property: "og:url", content: canonicalUrl },
            { property: "og:site_name", content: "Pickbox" },
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content: "JSON Formatter — Free Online JSON Beautifier & Validator | Pickbox",
            },
            {
                name: "twitter:description",
                content:
                    "Format, beautify, and validate JSON instantly in your browser. Free tool with syntax highlighting and error detection.",
            },
        ],
        link: [{ rel: "canonical", href: canonicalUrl }],
        script: [
            {
                type: "application/ld+json",
                innerHTML: JSON.stringify(
                    generateJsonLd("SoftwareApplication", {
                        name: tool.name,
                        description: tool.description,
                        url: canonicalUrl,
                        category: tool.category,
                    }),
                ),
            },
            {
                type: "application/ld+json",
                innerHTML: JSON.stringify(generateJsonLd("FAQPage", faqItems)),
            },
            {
                type: "application/ld+json",
                innerHTML: JSON.stringify(
                    generateJsonLd("BreadcrumbList", [
                        { name: "Home", url: siteUrl },
                        { name: "JSON Formatter", url: canonicalUrl },
                    ]),
                ),
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
        <SeoNav :links="navLinks" />

        <div class="space-y-6">
          <SeoSection id="what-is-json" title="What is JSON?">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                JSON (JavaScript Object Notation) is a lightweight, text-based data interchange format that has become the
                de facto standard for web APIs, configuration files, and data storage. Originally derived from JavaScript,
                JSON is now language-independent and supported by virtually every modern programming language through
                built-in libraries or third-party parsers.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                A JSON document consists of two fundamental structures: objects (unordered collections of key-value pairs
                wrapped in curly braces) and arrays (ordered lists of values wrapped in square brackets). Values can be
                strings, numbers, booleans (<code class="code-inline">true</code> or <code class="code-inline">false</code>), <code class="code-inline">null</code>, or nested objects
                and arrays. This simplicity is what makes JSON so widely adopted — it is human-readable yet easy for machines
                to parse and generate.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                Developers encounter JSON daily when working with REST APIs, GraphQL responses, package manifests like
                <code class="code-inline">package.json</code>, infrastructure-as-code templates, and NoSQL databases such as MongoDB and
                CouchDB. Understanding JSON structure is a foundational skill for modern software development.
              </p>
            </div>
          </SeoSection>

          <SeoSection id="common-errors" title="Common JSON Syntax Errors" icon="code">
            <p class="text-content-tertiary leading-relaxed mb-4">
              Despite its simplicity, JSON has strict syntax rules that trip up even experienced developers. The most
              frequent mistakes include:
            </p>
            <ul class="space-y-3">
              <SeoBullet>
                <strong class="text-content">Trailing commas:</strong> Unlike JavaScript objects, JSON does not allow a comma after the last
                element in an object or array. <code class="code-inline">{"a": 1, "b": 2,}</code> is invalid.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Single quotes:</strong> JSON requires double quotes for all strings and property names. Using
                single quotes like <code class="code-inline">{'name': 'value'}</code> will fail parsing.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Unquoted keys:</strong> Every key in a JSON object must be a double-quoted string.
                <code class="code-inline">{name: "value"}</code> is valid JavaScript but invalid JSON.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Comments:</strong> JSON does not support comments of any kind — no <code class="code-inline">//</code> line comments
                and no <code class="code-inline">/* */</code> block comments. If you need comments, consider JSONC or JSON5.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Special number formats:</strong> Hexadecimal (<code class="code-inline">0xFF</code>), leading zeros (<code class="code-inline">07</code>),
                and positive sign prefixes (<code class="code-inline">+1</code>) are all invalid in JSON. Only standard decimal notation and
                scientific notation (e.g., <code class="code-inline">1.5e10</code>) are allowed.
              </SeoBullet>
            </ul>
            <p class="text-content-tertiary leading-relaxed mt-4">
              Our JSON formatter catches all of these errors and reports the exact line and character position, so you can
              fix problems in seconds instead of hunting through hundreds of lines of data.
            </p>
          </SeoSection>

          <SeoSection id="json-vs-yaml" title="JSON vs YAML">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                JSON and YAML are both popular serialization formats, but they serve somewhat different use cases. JSON is
                stricter and more predictable — its rigid syntax means fewer ambiguities and faster parsing. YAML, on the
                other hand, prioritizes human readability with indentation-based nesting, support for comments, and more
                flexible value types.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                In practice, JSON dominates in API communication and programmatic data exchange where parsing speed and
                unambiguous structure matter. YAML is preferred for configuration files (Kubernetes manifests, CI/CD
                pipelines, Ansible playbooks) where humans frequently read and edit the files by hand.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                One key advantage of JSON is its round-trip safety: parsing and re-serializing JSON always produces the same
                output. YAML's flexibility can introduce subtle bugs — for instance, the string <code class="code-inline">no</code> may be
                interpreted as a boolean <code class="code-inline">false</code>, and <code class="code-inline">3.10</code> may be parsed as the number
                <code class="code-inline">3.1</code>. These gotchas make JSON the safer choice for machine-to-machine communication.
              </p>
            </div>
          </SeoSection>

          <SeoSection id="faq" title="Frequently Asked Questions">
            <SeoFaq :items="faqItems" />
          </SeoSection>

          <SeoSection id="built-with" title="Built With" icon="code">
            <p class="text-content-tertiary leading-relaxed mb-4">
              This tool uses no external packages — just built-in browser APIs.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SeoExternalLink
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON"
                title="MDN JSON Reference"
                description="JSON.parse / JSON.stringify docs"
              />
            </div>
          </SeoSection>

          <SeoSection id="related-tools" title="Related Tools">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SeoRelatedTool
                to="/tools/json-diff"
                icon="GitCompare"
                title="JSON Diff"
                description="Compare and find differences between JSON objects"
              />
            </div>
          </SeoSection>
        </div>
      </article>
    </template>
  </UiToolPageLayout>
</template>
