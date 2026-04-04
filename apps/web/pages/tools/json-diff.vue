<script setup lang="ts">
    import { TOOLS } from "@tiny-tools/shared";
    import { generateJsonLd } from "~/utils/seo";

    const appStore = useAppStore();
    const tool = TOOLS.find((t) => t.slug === "json-diff");
    if (!tool) throw new Error("Tool not found: json-diff");
    const siteUrl = "https://pickbox.dev";
    const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;

    const faqItems = [
        {
            question: "How does the JSON diff comparison work?",
            answer: "Our JSON diff tool parses both inputs into structured objects and performs a deep recursive comparison. It detects added keys, removed keys, and changed values at every nesting level. The results are displayed in a side-by-side view with color-coded highlighting so you can instantly see what changed.",
        },
        {
            question: "Can I compare minified JSON with formatted JSON?",
            answer: "Yes. The tool parses both inputs into their object representations before comparing, so whitespace, indentation, and formatting differences are completely ignored. Only structural and value differences are reported.",
        },
        {
            question: "Does key order matter when comparing JSON?",
            answer: "No. According to the JSON specification, objects are unordered collections of key-value pairs. Our diff tool compares by key name regardless of the order they appear in. Two objects with the same keys and values in different orders are considered identical.",
        },
        {
            question: "Is my data safe when using this comparison tool?",
            answer: "Absolutely. The entire comparison runs in your browser using JavaScript. No data is transmitted to any server. Your API responses, configuration files, and database exports stay entirely on your device throughout the process.",
        },
    ];

    const navLinks = [
        { id: "why-compare", label: "Why Compare" },
        { id: "how-it-works", label: "How It Works" },
        { id: "use-cases", label: "Use Cases" },
        { id: "faq", label: "FAQ" },
        { id: "built-with", label: "Built With" },
        { id: "related-tools", label: "Related Tools" },
    ];

    useHead({
        title: "JSON Diff — Free Online JSON & Text Comparison Tool | Pickbox",
        meta: [
            {
                name: "description",
                content:
                    "Compare two JSON objects side by side and instantly spot differences. Free online JSON diff tool with deep comparison, color-coded output, and zero uploads.",
            },
            { name: "keywords", content: tool.keywords.join(", ") },
            { property: "og:type", content: "website" },
            {
                property: "og:title",
                content: "JSON Diff — Free Online JSON & Text Comparison Tool | Pickbox",
            },
            {
                property: "og:description",
                content:
                    "Compare two JSON objects side by side and instantly spot differences. Free diff tool with color-coded output.",
            },
            { property: "og:url", content: canonicalUrl },
            { property: "og:site_name", content: "Pickbox" },
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content: "JSON Diff — Free Online JSON & Text Comparison Tool | Pickbox",
            },
            {
                name: "twitter:description",
                content:
                    "Compare two JSON objects side by side and instantly spot differences. Free diff tool with color-coded output.",
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
                        { name: "JSON Diff", url: canonicalUrl },
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
    <ToolsJsonDiff />

    <template #seo-content>
      <article class="max-w-4xl mx-auto">
        <SeoNav :links="navLinks" />

        <div class="space-y-6">
          <SeoSection id="why-compare" title="Why Compare JSON Files?">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                Comparing JSON data is one of the most common tasks in modern software development. Whether you are debugging
                an API that returns unexpected responses, reviewing configuration changes before deployment, or verifying
                that a data migration preserved all records, a reliable diff tool saves significant time and reduces the risk
                of overlooking subtle changes.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                Unlike plain text diffs, a proper JSON comparison understands the structure of the data. It knows that
                reordering keys in an object does not change its meaning, and it can distinguish between a missing key and a
                key with a <code class="code-inline">null</code> value. This structural awareness produces far more accurate and useful results
                than line-by-line text comparison.
              </p>
            </div>
          </SeoSection>

          <SeoSection id="how-it-works" title="How Deep JSON Comparison Works" icon="code">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                A deep comparison algorithm recursively walks both JSON trees simultaneously. At each level, it categorizes
                every key into one of three buckets: keys present only in the left document (deletions), keys present only in
                the right document (additions), and keys present in both (potential modifications).
              </p>
              <p class="text-content-tertiary leading-relaxed">
                For keys present in both documents, the algorithm compares their values. If both values are objects, it
                recurses deeper. If both are arrays, it compares element by element. For primitive values (strings, numbers,
                booleans, null), it performs a strict equality check. This approach ensures that even deeply nested changes
                in complex JSON structures are detected and reported with their full path.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                The result is a structured diff that shows the exact location, old value, and new value for every change —
                far more informative than a generic text diff that simply highlights different lines.
              </p>
            </div>
          </SeoSection>

          <SeoSection id="use-cases" title="Common Use Cases for JSON Diff">
            <p class="text-content-tertiary leading-relaxed mb-4">
              Developers and teams rely on JSON comparison in a wide range of scenarios:
            </p>
            <ul class="space-y-3">
              <SeoBullet>
                <strong class="text-content">API debugging:</strong> Compare expected versus actual API responses to pinpoint discrepancies
                in field values, missing properties, or unexpected type changes.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Configuration auditing:</strong> Review changes to JSON configuration files (Terraform state,
                <code class="code-inline">tsconfig.json</code>, ESLint configs) before merging pull requests.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Data migration verification:</strong> Confirm that records exported from one system match those
                imported into another, catching any transformation errors.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Schema evolution:</strong> Track how API response shapes change between versions to maintain
                backward compatibility and update client code accordingly.
              </SeoBullet>
            </ul>
          </SeoSection>

          <SeoSection id="faq" title="Frequently Asked Questions">
            <SeoFaq :items="faqItems" />
          </SeoSection>

          <SeoSection id="built-with" title="Built With" icon="code">
            <p class="text-content-tertiary leading-relaxed mb-4">
              This tool uses the <code class="code-inline">diff</code> package for accurate line-level comparison — the same engine used by Jest, Mocha, and thousands of other projects.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SeoExternalLink
                href="https://github.com/kpdecker/jsdiff"
                title="jsdiff on GitHub"
                description="kpdecker/jsdiff — JavaScript text diff library"
              />
              <SeoExternalLink
                href="https://www.npmjs.com/package/diff"
                title="diff on npm"
                description="~50M weekly downloads"
              />
            </div>
          </SeoSection>

          <SeoSection id="related-tools" title="Related Tools">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SeoRelatedTool
                to="/tools/json-formatter"
                icon="Braces"
                title="JSON Formatter"
                description="Format, validate, and beautify JSON instantly"
              />
              <SeoRelatedTool
                to="/tools/jwt-decoder"
                icon="KeyRound"
                title="JWT Decoder"
                description="Decode and inspect JWT tokens instantly"
              />
            </div>
          </SeoSection>
        </div>
      </article>
    </template>
  </UiToolPageLayout>
</template>
