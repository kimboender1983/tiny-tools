<script setup lang="ts">
    import { TOOLS } from "@tiny-tools/shared";
    import { generateJsonLd } from "~/utils/seo";

    const appStore = useAppStore();
    const tool = TOOLS.find((t) => t.slug === "unix-timestamp");
    if (!tool) throw new Error("Tool not found: unix-timestamp");
    const siteUrl = "https://pickbox.dev";
    const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;

    const faqItems = [
        {
            question: "What is a Unix timestamp?",
            answer: "A Unix timestamp (also called Epoch time or POSIX time) is the number of seconds that have elapsed since January 1, 1970 00:00:00 UTC, a moment known as the Unix Epoch. It provides a single, timezone-independent number that uniquely identifies a point in time, making it ideal for storing and comparing dates across systems.",
        },
        {
            question: "What is the difference between seconds and milliseconds?",
            answer: "A Unix timestamp in seconds is a 10-digit number (e.g. 1712188800). JavaScript, Java, and many APIs use milliseconds, a 13-digit number (e.g. 1712188800000) that is simply the seconds value multiplied by 1000. Our tool detects and converts both formats.",
        },
        {
            question: "What is the Year 2038 problem?",
            answer: "Many older systems store Unix timestamps as a signed 32-bit integer, which overflows on January 19, 2038 at 03:14:07 UTC. After that moment, the timestamp wraps to a negative number, potentially breaking date calculations. 64-bit systems and modern languages (JavaScript uses 64-bit floats) are not affected. Most critical infrastructure has been or is being migrated to 64-bit timestamps.",
        },
        {
            question: "Why do APIs use Unix timestamps instead of date strings?",
            answer: "Unix timestamps are timezone-neutral, language-agnostic, compact (a single integer), and trivially sortable and comparable. Date strings require parsing, timezone handling, and format negotiation between systems. Timestamps eliminate an entire class of internationalization and parsing bugs.",
        },
        {
            question: "How does this converter handle timezones?",
            answer: "Unix timestamps are always in UTC by definition. When converting to a human-readable date, our tool shows both UTC and your local timezone (detected from your browser). When converting a date string to a timestamp, the string is parsed by your browser's Date engine, which applies local timezone if no timezone is specified in the input.",
        },
    ];

    const navLinks = [
        { id: "what-is-unix", label: "What is Unix Time" },
        { id: "how-it-works", label: "How It Works" },
        { id: "common-timestamps", label: "Notable Timestamps" },
        { id: "languages", label: "By Language" },
        { id: "faq", label: "FAQ" },
        { id: "built-with", label: "Built With" },
        { id: "related-tools", label: "Related Tools" },
    ];

    useHead({
        title: "Unix Timestamp Converter - Free Epoch Time Converter | Pickbox",
        meta: [
            {
                name: "description",
                content:
                    "Convert between Unix timestamps and human-readable dates instantly. Supports seconds and milliseconds, shows UTC and local time, relative time, and more.",
            },
            { name: "keywords", content: tool.keywords.join(", ") },
            { property: "og:type", content: "website" },
            {
                property: "og:title",
                content: "Unix Timestamp Converter - Free Epoch Time Converter | Pickbox",
            },
            {
                property: "og:description",
                content:
                    "Convert between Unix timestamps and human-readable dates. Supports seconds and milliseconds.",
            },
            { property: "og:url", content: canonicalUrl },
            { property: "og:site_name", content: "Pickbox" },
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content: "Unix Timestamp Converter - Free Epoch Time Converter | Pickbox",
            },
            {
                name: "twitter:description",
                content:
                    "Convert between Unix timestamps and human-readable dates. Supports seconds and milliseconds.",
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
                        { name: "Unix Timestamp Converter", url: canonicalUrl },
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
  >
    <ToolsUnixTimestamp />

    <template #seo-content>
      <article class="max-w-4xl mx-auto">
        <SeoNav :links="navLinks" />

        <div class="space-y-6">
          <SeoSection id="what-is-unix" title="What is a Unix Timestamp?">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                A Unix timestamp is the number of seconds elapsed since the <strong class="text-content">Unix Epoch</strong>,
                midnight UTC on January 1, 1970. This single integer provides a universal, timezone-independent way to
                represent any moment in time.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                Unix timestamps are used everywhere: database columns, API responses, log files, JWT tokens, cron jobs,
                and file system metadata. Their simplicity as a single number makes them trivially sortable, comparable,
                and storable across any programming language or database.
              </p>
            </div>
          </SeoSection>

          <SeoSection id="how-it-works" title="Seconds vs Milliseconds" icon="code">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="rounded-lg border border-surface-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-content">Seconds (10 digits)</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-secondary text-content-tertiary">POSIX standard</span>
                </div>
                <code class="block text-sm font-mono text-brand-accent">1712188800</code>
                <p class="text-xs text-content-muted">Used by: C, Python, PHP, Ruby, Unix shell, PostgreSQL, MySQL</p>
              </div>
              <div class="rounded-lg border border-surface-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-content">Milliseconds (13 digits)</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-secondary text-content-tertiary">JS / Java</span>
                </div>
                <code class="block text-sm font-mono text-brand-accent">1712188800000</code>
                <p class="text-xs text-content-muted">Used by: JavaScript, Java, Dart, Elasticsearch, MongoDB</p>
              </div>
            </div>
          </SeoSection>

          <SeoSection id="common-timestamps" title="Notable Timestamps">
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
                class="flex items-center gap-3 rounded-lg border border-surface-border p-3"
              >
                <code class="text-sm font-mono font-bold text-brand-accent shrink-0 w-28 text-right">{{ ts.value }}</code>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-content">{{ ts.label }}</p>
                  <p class="text-xs text-content-muted">{{ ts.date }}</p>
                </div>
              </div>
            </div>
          </SeoSection>

          <SeoSection id="languages" title="Get Current Timestamp by Language" icon="code">
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
                class="rounded-lg border border-surface-border p-3"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-semibold text-brand-accent">{{ lang.name }}</span>
                  <span class="text-[10px] text-content-faint">{{ lang.unit }}</span>
                </div>
                <code class="block text-xs font-mono text-content-secondary break-all">{{ lang.code }}</code>
              </div>
            </div>
          </SeoSection>

          <SeoSection id="faq" title="Frequently Asked Questions">
            <SeoFaq :items="faqItems" />
          </SeoSection>

          <SeoSection id="built-with" title="Built With" icon="code">
            <p class="text-content-tertiary leading-relaxed mb-4">
              This tool uses JavaScript's native Date API, no external date libraries needed.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SeoExternalLink
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date"
                title="MDN Date"
                description="JavaScript Date reference"
              />
              <SeoExternalLink
                href="https://en.wikipedia.org/wiki/Unix_time"
                title="Wikipedia: Unix time"
                description="History and specification"
              />
            </div>
          </SeoSection>

          <SeoSection id="related-tools" title="Related Tools">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SeoRelatedTool
                to="/tools/uuid-generator"
                icon="Fingerprint"
                title="UUID Generator"
                description="UUID v7 uses Unix timestamps"
              />
              <SeoRelatedTool
                to="/tools/regex-tester"
                icon="Regex"
                title="Regex Tester"
                description="Parse timestamps from logs with regex"
              />
            </div>
          </SeoSection>
        </div>
      </article>
    </template>
  </UiToolPageLayout>
</template>
