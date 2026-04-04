<script setup lang="ts">
    import { TOOLS } from "@tiny-tools/shared";
    import { generateJsonLd } from "~/utils/seo";

    const appStore = useAppStore();
    const tool = TOOLS.find((t) => t.slug === "image-compressor");
    if (!tool) throw new Error("Tool not found: image-compressor");
    const siteUrl = "https://pickbox.dev";
    const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;

    const faqItems = [
        {
            question: "How does browser-based image compression work?",
            answer: "Our tool uses the Canvas API and modern browser codecs to re-encode your images at a lower quality setting or in a more efficient format. The image is drawn onto an HTML canvas element, and then exported using the toBlob() method with the target format and quality parameter. The entire process runs in your browser — no files are uploaded to a server.",
        },
        {
            question: "What is the difference between lossy and lossless compression?",
            answer: "Lossy compression reduces file size by permanently discarding some image data that is less perceptible to the human eye. JPEG and WebP lossy are examples. Lossless compression reduces file size without losing any data by finding more efficient ways to encode the same information. PNG and WebP lossless are examples. Lossy compression achieves much smaller files but introduces slight quality degradation.",
        },
        {
            question: "Will compressing my images reduce their quality?",
            answer: "It depends on the compression type and settings. With lossy compression (JPEG, WebP lossy), there is always some quality loss, but at quality settings of 70-85%, the difference is imperceptible for most use cases. With lossless compression (PNG optimization), the output is pixel-identical to the input. Our tool lets you preview the result and compare quality before downloading.",
        },
        {
            question: "What image formats does this tool support?",
            answer: "You can upload JPEG, PNG, WebP, GIF, and BMP images. The tool can output JPEG, PNG, and WebP formats depending on your browser support. We recommend WebP for most web use cases as it typically produces the smallest files at equivalent quality levels.",
        },
        {
            question: "Can I compress multiple images at once?",
            answer: "Yes. Our bulk compression feature lets you drag and drop or select multiple images simultaneously. Each image is processed independently with the same quality settings, and you can download all compressed images at once as a ZIP archive or individually.",
        },
    ];

    const navLinks = [
        { id: "lossy-vs-lossless", label: "Lossy vs Lossless" },
        { id: "format-comparison", label: "WebP vs PNG vs JPEG" },
        { id: "when-to-use", label: "When to Use Each" },
        { id: "faq", label: "FAQ" },
        { id: "built-with", label: "Built With" },
        { id: "related-tools", label: "Related Tools" },
    ];

    useHead({
        title: "Image Compressor — Free Online Bulk Image Compression Tool | Pickbox",
        meta: [
            {
                name: "description",
                content:
                    "Compress JPEG, PNG, and WebP images in your browser with zero uploads. Free bulk image compressor with quality preview and format conversion.",
            },
            { name: "keywords", content: tool.keywords.join(", ") },
            { property: "og:type", content: "website" },
            {
                property: "og:title",
                content: "Image Compressor — Free Online Bulk Image Compression Tool | Pickbox",
            },
            {
                property: "og:description",
                content:
                    "Compress JPEG, PNG, and WebP images in your browser with zero uploads. Free bulk compressor with quality preview.",
            },
            { property: "og:url", content: canonicalUrl },
            { property: "og:site_name", content: "Pickbox" },
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content: "Image Compressor — Free Online Bulk Image Compression Tool | Pickbox",
            },
            {
                name: "twitter:description",
                content:
                    "Compress JPEG, PNG, and WebP images in your browser with zero uploads. Free bulk compressor with quality preview.",
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
                        { name: "Image Compressor", url: canonicalUrl },
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
    <ToolsImageCompressor />

    <template #seo-content>
      <article class="max-w-4xl mx-auto">
        <SeoNav :links="navLinks" />

        <div class="space-y-6">
          <SeoSection id="lossy-vs-lossless" title="Lossy vs Lossless Compression">
            <div class="space-y-4">
              <p class="text-content-tertiary leading-relaxed">
                Image compression falls into two broad categories, each with distinct trade-offs. Understanding the
                difference is essential for choosing the right approach for your use case.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                <strong class="text-content">Lossy compression</strong> analyzes the image and permanently removes data that contributes least
                to perceived visual quality. It exploits the limitations of human vision — for example, our eyes are more
                sensitive to changes in brightness than in color, so a lossy encoder can discard more chrominance data.
                JPEG has used this approach since 1992 and remains the most widely supported lossy format. WebP lossy,
                developed by Google, applies similar techniques with more modern algorithms, typically achieving 25-35%
                smaller files than JPEG at equivalent quality.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                <strong class="text-content">Lossless compression</strong> reduces file size without discarding any image data. It works by
                finding patterns and redundancies in the pixel data and encoding them more efficiently. When decompressed,
                the output is bit-for-bit identical to the original. PNG is the standard lossless format for the web,
                using DEFLATE compression with predictive filtering. WebP lossless offers a more modern alternative,
                producing files that are typically 20-25% smaller than PNG.
              </p>
              <p class="text-content-tertiary leading-relaxed">
                For photographs and complex images with gradients, lossy compression at 75-85% quality usually delivers
                the best size-to-quality ratio. For screenshots, diagrams, logos, and images with text or sharp edges,
                lossless compression (or lossy at very high quality) preserves the crisp details that matter.
              </p>
            </div>
          </SeoSection>

          <SeoSection id="format-comparison" title="WebP vs PNG vs JPEG" icon="code">
            <p class="text-content-tertiary leading-relaxed mb-4">
              Choosing the right image format has a significant impact on page load times and user experience. Here is
              how the three most common web formats compare:
            </p>
            <ul class="space-y-3">
              <SeoBullet>
                <strong class="text-content">JPEG:</strong> Best for photographs and images with complex color gradients. Supports lossy
                compression only. Does not support transparency. Universal browser support. Typical use: hero images,
                product photos, backgrounds.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">PNG:</strong> Best for images requiring transparency or pixel-perfect reproduction. Supports
                lossless compression and an alpha channel for transparency. Files are larger than JPEG for photographic
                content. Typical use: logos, icons, screenshots, UI elements.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">WebP:</strong> A modern format that supports both lossy and lossless compression, plus
                transparency and animation. Produces significantly smaller files than both JPEG and PNG at comparable
                quality. Supported by all modern browsers (Chrome, Firefox, Safari, Edge). Typical use: any web image
                where you want the best compression with broad compatibility.
              </SeoBullet>
            </ul>
            <p class="text-content-tertiary leading-relaxed mt-4">
              For new projects, WebP is generally the recommended default. It combines the best qualities of JPEG and
              PNG — lossy efficiency for photos, lossless option for graphics, and transparency support — in a single
              format. Use the <code class="code-inline">&lt;picture&gt;</code> element with a JPEG or PNG fallback if you need to support
              legacy browsers.
            </p>
          </SeoSection>

          <SeoSection id="when-to-use" title="When to Use Each Format">
            <p class="text-content-tertiary leading-relaxed mb-4">
              Making the right format decision comes down to understanding your content and audience:
            </p>
            <ul class="space-y-3">
              <SeoBullet>
                <strong class="text-content">Photographs and complex imagery:</strong> Use WebP lossy (preferred) or JPEG. Target quality
                75-85% for a good balance. Avoid PNG for photos — file sizes will be unnecessarily large.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Screenshots and UI mockups:</strong> Use WebP lossless or PNG. These images contain sharp text
                and UI elements that degrade visibly with lossy compression.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Logos and icons:</strong> Use SVG when possible (infinitely scalable, tiny file size). For
                raster logos, use WebP lossless or PNG with transparency.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Animated content:</strong> Use WebP animated or, for short clips, consider a muted video
                element with MP4/WebM. Avoid animated GIF — it produces large files with limited color depth.
              </SeoBullet>
              <SeoBullet>
                <strong class="text-content">Thumbnails and social media previews:</strong> Use WebP lossy or JPEG at moderate quality
                (60-75%). Small display sizes are forgiving of compression artifacts, so you can optimize aggressively.
              </SeoBullet>
            </ul>
            <p class="text-content-tertiary leading-relaxed mt-4">
              Our compressor tool lets you experiment with different formats and quality levels side by side, so you can
              find the optimal setting for each image before downloading.
            </p>
          </SeoSection>

          <SeoSection id="faq" title="Frequently Asked Questions">
            <SeoFaq :items="faqItems" />
          </SeoSection>

          <SeoSection id="built-with" title="Built With" icon="code">
            <p class="text-content-tertiary leading-relaxed mb-4">
              This tool leverages modern browser APIs and one open-source library for ZIP packaging.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <SeoExternalLink
                href="https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API"
                title="Canvas API"
                description="MDN - Image drawing and export"
              />
              <SeoExternalLink
                href="https://github.com/Stuk/jszip"
                title="JSZip"
                description="GitHub - ZIP file creation"
              />
              <SeoExternalLink
                href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API"
                title="Web Workers"
                description="MDN - Background processing"
              />
            </div>
          </SeoSection>

          <SeoSection id="related-tools" title="Related Tools">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <SeoRelatedTool
                to="/tools/json-formatter"
                icon="Braces"
                title="JSON Formatter"
                description="Format, validate, and beautify JSON instantly"
              />
              <SeoRelatedTool
                to="/tools/json-diff"
                icon="GitCompare"
                title="JSON Diff"
                description="Compare and find differences between JSON objects"
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
