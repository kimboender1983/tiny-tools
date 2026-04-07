<script setup lang="ts">
    import type { IBlogPost, ICategory } from "@tiny-tools/shared";
    import { TOOLS } from "@tiny-tools/shared";
    import * as lucideIcons from "lucide-vue-next";
    import { ArrowLeft, BookOpen, Calendar, ChevronRight, Clock, List } from "lucide-vue-next";
    import { generateJsonLd } from "~/utils/seo";

    interface PaginatedBlogResponse {
        items: IBlogPost[];
        total: number;
        page: number;
        pageSize: number;
    }

    function getCategoryName(cat: string | ICategory | undefined): string {
        if (!cat) return "";
        return typeof cat === "object" ? cat.name : cat;
    }

    function getCategorySlug(cat: string | ICategory | undefined): string {
        if (!cat) return "uncategorized";
        return typeof cat === "object" ? cat.slug : cat;
    }

    function getCategoryIcon(cat: string | ICategory | undefined) {
        if (!cat || typeof cat !== "object" || !cat.icon) return null;
        return (lucideIcons as Record<string, unknown>)[cat.icon] ?? null;
    }

    function blogPostUrl(post: IBlogPost): string {
        return `/blog/${getCategorySlug(post.category)}/${post.slug}`;
    }

    function getCardImageUrl(post: IBlogPost): string {
        const logoSlug =
            post.techLogo && typeof post.techLogo === "object" ? post.techLogo.slug : "";
        const params = new URLSearchParams();
        if (logoSlug) params.set("logo", logoSlug);
        if (post.techLogoColor) params.set("color", post.techLogoColor);
        if (post.techLogoBgColor) params.set("bg", post.techLogoBgColor);
        if (post.techLogoBgColorTo) params.set("bgTo", post.techLogoBgColorTo);
        if (post.techLogoPickboxColor) params.set("pickboxColor", post.techLogoPickboxColor);
        const qs = params.toString();
        return `/card-image.png${qs ? `?${qs}` : ""}`;
    }

    const route = useRoute();
    const config = useRuntimeConfig();
    const api = useApi();
    const siteUrl = config.public.siteUrl as string;
    const slug = route.params.slug as string;

    // Fetch the blog post
    const { data: post, error } = await useAsyncData(`blog-post-${slug}`, () =>
        api.get<IBlogPost>(`/content/blog/${slug}`),
    );

    if (error.value || !post.value) {
        throw createError({ statusCode: 404, statusMessage: "Post not found" });
    }

    // Fetch related posts
    const { data: relatedData } = await useAsyncData(
        `blog-related-${slug}`,
        () =>
            api.get<PaginatedBlogResponse>("/content/blog", {
                params: { pageSize: 3, category: post.value?.category },
            }),
        { default: () => ({ items: [], total: 0, page: 1, pageSize: 3 }) },
    );

    const relatedPosts = computed(() =>
        (relatedData.value?.items ?? []).filter((p) => p.slug !== slug).slice(0, 3),
    );

    // --- Markdown rendering with syntax highlighting + affiliate links ---
    import {
        processAffiliateLinks,
        processPlaygroundEmbeds,
        renderMarkdown,
    } from "~/utils/markdown";

    // Fetch active affiliates for shortcode resolution
    const { data: affiliatesData } = await useAsyncData("affiliates-map", () =>
        api.get<{ slug: string; name: string }[]>("/content/affiliates"),
    );

    const affiliatesMap = computed(() => {
        const map = new Map<string, string>();
        for (const a of affiliatesData.value ?? []) {
            map.set(a.slug, a.name);
        }
        return map;
    });

    function slugify(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }

    // Render markdown to HTML
    const renderedHtml = computed(() => {
        if (!post.value?.content) return "";
        let html = renderMarkdown(post.value.content);
        html = processAffiliateLinks(html, affiliatesMap.value);
        html = processPlaygroundEmbeds(html);
        return html;
    });

    // Extract headings from rendered HTML for table of contents
    interface TocItem {
        id: string;
        text: string;
        level: number;
    }

    const tableOfContents = computed<TocItem[]>(() => {
        if (!renderedHtml.value) return [];
        const headingRegex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
        const items: TocItem[] = [];
        let match: RegExpExecArray | null = headingRegex.exec(renderedHtml.value);

        while (match !== null) {
            const level = parseInt(match[1], 10);
            const text = match[2].replace(/<[^>]+>/g, "");
            items.push({ id: slugify(text), text, level });
            match = headingRegex.exec(renderedHtml.value);
        }

        return items;
    });

    // Inject IDs into headings for anchor links
    const processedContent = computed(() => {
        if (!renderedHtml.value) return "";
        let html = renderedHtml.value;

        // Add IDs to h2/h3 headings
        html = html.replace(/<h([23])([^>]*)>(.*?)<\/h[23]>/gi, (_match, level, attrs, inner) => {
            const text = inner.replace(/<[^>]+>/g, "");
            const id = slugify(text);
            if (attrs.includes('id="')) return _match;
            return `<h${level} id="${id}"${attrs}>${inner}</h${level}>`;
        });

        return html;
    });

    // Pick a relevant tool for CTA
    const suggestedTool = computed(() => {
        if (!post.value) return TOOLS[0];
        const content =
            `${post.value.title} ${post.value.content} ${post.value.category ?? ""}`.toLowerCase();
        return (
            TOOLS.find((t) => t.keywords.some((kw) => content.includes(kw.toLowerCase()))) ??
            TOOLS[0]
        );
    });

    // Add copy buttons to code blocks after render
    onMounted(() => {
        nextTick(() => {
            document.querySelectorAll(".prose pre").forEach((pre) => {
                if (pre.querySelector(".code-copy-btn")) return;
                const btn = document.createElement("button");
                btn.className = "code-copy-btn";
                btn.textContent = "Copy";
                btn.addEventListener("click", async () => {
                    const code = pre.querySelector("code");
                    if (!code) return;
                    try {
                        await navigator.clipboard.writeText(code.textContent || "");
                        btn.textContent = "Copied!";
                        btn.classList.add("copied");
                        setTimeout(() => {
                            btn.textContent = "Copy";
                            btn.classList.remove("copied");
                        }, 1500);
                    } catch {
                        /* ignore */
                    }
                });
                pre.style.position = "relative";
                pre.appendChild(btn);
            });

            // Image lightbox — click to zoom
            initImageLightbox();

            // Initialize Chart.js charts
            initCharts();
        });
    });

    // Chart.js — theme-reactive rendering
    type ChartInstance = { destroy(): void };
    let chartInstances: ChartInstance[] = [];
    let ChartCtor: typeof import("chart.js/auto")["default"] | null = null;

    function initCharts() {
        const chartEls = document.querySelectorAll<HTMLCanvasElement>("canvas[data-chart]");
        if (chartEls.length === 0) return;

        const render = (Chart: typeof ChartCtor) => {
            if (!Chart) return;
            // Destroy previous instances
            for (const c of chartInstances) c.destroy();
            chartInstances = [];

            // Read theme colors from CSS custom properties
            const st = getComputedStyle(document.documentElement);
            const cssRgb = (v: string) => {
                const r = st.getPropertyValue(v).trim();
                return r ? `rgb(${r})` : "";
            };
            const cssRgba = (v: string, a: number) => {
                const r = st.getPropertyValue(v).trim();
                return r ? `rgba(${r}, ${a})` : "";
            };

            const textColor = cssRgb("--color-text") || "#334155";
            const textMuted = cssRgb("--color-text-muted") || "#6b7280";
            const gridColor = cssRgba("--color-surface-border", 0.5) || "rgba(148,163,184,0.2)";
            const surfaceColor = cssRgb("--color-surface") || "#ffffff";

            const themePalette = [
                cssRgb("--color-brand-500") || "#3b82f6",
                cssRgb("--color-brand-300") || "#8b5cf6",
                cssRgb("--color-brand-400") || "#06b6d4",
                cssRgb("--color-brand-600") || "#10b981",
                cssRgb("--color-brand-700") || "#f59e0b",
            ];
            const accentColors = [
                "#8b5cf6",
                "#06b6d4",
                "#10b981",
                "#f59e0b",
                "#ef4444",
                "#ec4899",
                "#14b8a6",
                "#f97316",
            ];
            const brandColors = [
                ...themePalette,
                ...accentColors.filter((c) => !themePalette.includes(c)),
            ].slice(0, 10);

            Chart.defaults.font.family = "Inter, system-ui, sans-serif";
            Chart.defaults.color = textMuted;

            chartEls.forEach((canvas) => {
                try {
                    const raw = canvas.dataset.chart || "{}";
                    const decoded = raw
                        .replace(/&amp;/g, "&")
                        .replace(/&#39;/g, "'")
                        .replace(/&lt;/g, "<")
                        .replace(/&gt;/g, ">");
                    const config = JSON.parse(decoded);

                    if (!config.options) config.options = {};
                    config.options.responsive = true;
                    config.options.maintainAspectRatio = true;
                    if (!config.options.plugins) config.options.plugins = {};
                    config.options.animation = { duration: 400 };

                    if (!config.options.plugins.legend) {
                        config.options.plugins.legend = {
                            display: (config.data?.datasets?.length ?? 0) > 1,
                            labels: {
                                color: textMuted,
                                usePointStyle: true,
                                padding: 16,
                                font: { size: 13 },
                            },
                        };
                    }
                    if (config.options.plugins.title) {
                        config.options.plugins.title.color =
                            config.options.plugins.title.color || textColor;
                        config.options.plugins.title.font = config.options.plugins.title.font || {
                            size: 15,
                            weight: "600",
                        };
                        config.options.plugins.title.padding = config.options.plugins.title
                            .padding || {
                            bottom: 16,
                        };
                    }

                    const nonCartesian = ["pie", "doughnut", "radar", "polarArea"];
                    if (!nonCartesian.includes(config.type)) {
                        if (!config.options.scales) config.options.scales = {};
                        for (const axis of ["x", "y"]) {
                            if (!config.options.scales[axis]) config.options.scales[axis] = {};
                            const ax = config.options.scales[axis];
                            if (!ax.ticks) ax.ticks = {};
                            if (!ax.grid) ax.grid = {};
                            if (!ax.border) ax.border = {};
                            ax.ticks.color = ax.ticks.color || textMuted;
                            ax.ticks.font = ax.ticks.font || { size: 12 };
                            ax.grid.color = ax.grid.color || gridColor;
                            ax.border.color = ax.border.color || gridColor;
                        }
                    }

                    if (config.data?.datasets) {
                        config.data.datasets.forEach((ds: Record<string, unknown>, i: number) => {
                            const color = brandColors[i % brandColors.length];
                            const labelCount = (config.data?.labels?.length || 1) as number;

                            if (config.type === "bar") {
                                ds.backgroundColor =
                                    labelCount > 1 && config.data.datasets.length === 1
                                        ? brandColors
                                              .slice(0, labelCount)
                                              .map((c: string) => `${c}cc`)
                                        : `${color}cc`;
                                ds.borderColor =
                                    labelCount > 1 && config.data.datasets.length === 1
                                        ? brandColors.slice(0, labelCount)
                                        : color;
                                if (ds.borderRadius === undefined) ds.borderRadius = 6;
                                if (ds.borderWidth === undefined) ds.borderWidth = 2;
                                if (ds.borderSkipped === undefined) ds.borderSkipped = false;
                            } else if (config.type === "line" || config.type === "radar") {
                                ds.backgroundColor = `${color}18`;
                                ds.borderColor = color;
                                if (ds.borderWidth === undefined) ds.borderWidth = 2.5;
                                if (ds.tension === undefined) ds.tension = 0.35;
                                if (ds.fill === undefined) ds.fill = true;
                                if (ds.pointRadius === undefined) ds.pointRadius = 4;
                                ds.pointBackgroundColor = surfaceColor;
                                ds.pointBorderColor = color;
                                if (ds.pointBorderWidth === undefined) ds.pointBorderWidth = 2;
                            } else if (config.type === "pie" || config.type === "doughnut") {
                                ds.backgroundColor = brandColors
                                    .slice(0, labelCount)
                                    .map((c: string) => `${c}cc`);
                                ds.borderColor = surfaceColor;
                                if (ds.borderWidth === undefined) ds.borderWidth = 2;
                            }
                        });
                    }

                    chartInstances.push(new Chart(canvas, config));
                } catch {
                    if (canvas.parentElement) {
                        canvas.parentElement.innerHTML =
                            '<p style="text-align:center;padding:2rem;opacity:0.6;">Failed to render chart — check the JSON config.</p>';
                    }
                }
            });
        };

        if (ChartCtor) {
            render(ChartCtor);
        } else {
            import("chart.js/auto").then(({ default: Chart }) => {
                ChartCtor = Chart;
                render(Chart);
            });
        }
    }

    // Re-render charts when theme changes
    const colorMode = useColorMode();
    watch(
        () => colorMode.value,
        () => {
            nextTick(() => initCharts());
        },
    );

    onUnmounted(() => {
        for (const c of chartInstances) c.destroy();
        chartInstances = [];
    });

    function initImageLightbox() {
        const proseEl = document.querySelector(".prose");
        if (!proseEl) return;

        proseEl.querySelectorAll("img").forEach((img) => {
            // Skip tiny images (icons, badges)
            if (img.naturalWidth > 0 && img.naturalWidth < 80) return;

            img.addEventListener("click", () => openLightbox(img));
        });
    }

    let activeLightboxSource: HTMLImageElement | null = null;

    function openLightbox(img: HTMLImageElement) {
        activeLightboxSource = img;
        const rect = img.getBoundingClientRect();

        const overlay = document.createElement("div");
        overlay.className = "image-lightbox";

        const clone = document.createElement("img");
        clone.src = img.src;
        clone.alt = img.alt;

        // Position the clone exactly over the source image
        clone.style.position = "fixed";
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.borderRadius = "0.75rem";
        clone.style.objectFit = "cover";
        clone.style.transition = "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
        clone.style.transformOrigin = "center center";
        clone.style.zIndex = "101";

        overlay.appendChild(clone);

        // Hide the source image while lightbox is open
        img.style.visibility = "hidden";

        // Show caption from figcaption if inside a <figure>
        const figure = img.closest("figure");
        const figcaption = figure?.querySelector("figcaption");
        let captionEl: HTMLElement | null = null;
        if (figcaption?.textContent) {
            captionEl = document.createElement("figcaption");
            captionEl.textContent = figcaption.textContent;
            captionEl.style.opacity = "0";
            captionEl.style.transition = "opacity 0.3s ease 0.15s";
            overlay.appendChild(captionEl);
        }

        // Close on click or Escape
        const close = () => closeLightbox(overlay, img, clone);
        overlay.addEventListener("click", close);
        const onKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                close();
                document.removeEventListener("keydown", onKeydown);
            }
        };
        document.addEventListener("keydown", onKeydown);

        document.body.appendChild(overlay);

        // Animate: overlay fades in, image flies to center
        requestAnimationFrame(() => {
            overlay.classList.add("is-visible");

            // Calculate the centered destination
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const padding = 40;
            const maxW = vw - padding * 2;
            const maxH = vh - padding * 2;

            // Use natural dimensions to get aspect ratio
            const natW = img.naturalWidth || rect.width;
            const natH = img.naturalHeight || rect.height;
            const scale = Math.min(maxW / natW, maxH / natH, 1);
            const destW = natW * scale;
            const destH = natH * scale;
            const destLeft = (vw - destW) / 2;
            const destTop = (vh - destH) / 2;

            clone.style.left = `${destLeft}px`;
            clone.style.top = `${destTop}px`;
            clone.style.width = `${destW}px`;
            clone.style.height = `${destH}px`;
            clone.style.objectFit = "contain";

            if (captionEl) captionEl.style.opacity = "1";
        });
    }

    function closeLightbox(
        overlay: HTMLElement,
        sourceImg: HTMLImageElement,
        clone: HTMLImageElement,
    ) {
        // Animate back to original position
        const rect = sourceImg.getBoundingClientRect();

        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.objectFit = "cover";

        overlay.classList.remove("is-visible");

        // Hide caption immediately
        const captionEl = overlay.querySelector("figcaption") as HTMLElement | null;
        if (captionEl) {
            captionEl.style.transition = "opacity 0.15s ease";
            captionEl.style.opacity = "0";
        }

        clone.addEventListener(
            "transitionend",
            () => {
                sourceImg.style.visibility = "";
                overlay.remove();
                activeLightboxSource = null;
            },
            { once: true },
        );
    }

    function formatDate(date: Date | string | undefined): string {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    // SEO
    const p = post.value;
    if (!p) throw new Error("Post not found");
    const pageTitle = p.seo?.metaTitle || `${p.title} | Pickbox Blog`;
    const pageDescription = p.seo?.metaDescription || p.excerpt;
    const canonicalUrl =
        p.seo?.canonicalUrl || `${siteUrl}/blog/${getCategorySlug(p.category)}/${p.slug}`;
    const techLogoSlug = p.techLogo && typeof p.techLogo === "object" ? p.techLogo.slug : "";
    const logoParam = techLogoSlug ? `&logo=${encodeURIComponent(techLogoSlug)}` : "";
    const colorParam = p.techLogoColor ? `&color=${encodeURIComponent(p.techLogoColor)}` : "";
    const bgParam = p.techLogoBgColor ? `&bg=${encodeURIComponent(p.techLogoBgColor)}` : "";
    const bgToParam = p.techLogoBgColorTo ? `&bgTo=${encodeURIComponent(p.techLogoBgColorTo)}` : "";
    const pickboxParam = p.techLogoPickboxColor
        ? `&pickboxColor=${encodeURIComponent(p.techLogoPickboxColor)}`
        : "";
    const titleColorParam = p.techLogoTitleColor
        ? `&titleColor=${encodeURIComponent(p.techLogoTitleColor)}`
        : "";
    const ogImageFallback = `${siteUrl}/og-image.png?title=${encodeURIComponent(p.title)}&category=${encodeURIComponent(getCategoryName(p.category))}${logoParam}${colorParam}${bgParam}${bgToParam}${pickboxParam}${titleColorParam}`;
    const ogImage = p.seo?.ogImage || p.coverImage || ogImageFallback;
    const coverImage = p.coverImage || ogImageFallback;

    useHead({
        title: pageTitle,
        meta: [
            { name: "description", content: pageDescription },
            { property: "og:type", content: "article" },
            { property: "og:title", content: p.seo?.ogTitle || pageTitle },
            {
                property: "og:description",
                content: p.seo?.ogDescription || pageDescription,
            },
            { property: "og:url", content: canonicalUrl },
            { property: "og:site_name", content: "Pickbox" },
            ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
            { name: "twitter:card", content: p.seo?.twitterCard || "summary_large_image" },
            { name: "twitter:title", content: p.seo?.ogTitle || pageTitle },
            { name: "twitter:description", content: p.seo?.ogDescription || pageDescription },
            ...(ogImage ? [{ name: "twitter:image", content: ogImage }] : []),
            ...(p.publishedAt
                ? [
                      {
                          property: "article:published_time",
                          content: new Date(p.publishedAt).toISOString(),
                      },
                  ]
                : []),
            ...(p.updatedAt
                ? [
                      {
                          property: "article:modified_time",
                          content: new Date(p.updatedAt).toISOString(),
                      },
                  ]
                : []),
            ...(typeof p.author === "object" && p.author?.name
                ? [{ property: "article:author", content: p.author.name }]
                : []),
            ...(getCategoryName(p.category)
                ? [{ property: "article:section", content: getCategoryName(p.category) }]
                : []),
        ],
        link: [{ rel: "canonical", href: canonicalUrl }],
        script: [
            {
                type: "application/ld+json",
                innerHTML: JSON.stringify(
                    generateJsonLd("Article", {
                        title: p.title,
                        description: p.excerpt,
                        url: canonicalUrl,
                        image: ogImage,
                        datePublished: p.publishedAt
                            ? new Date(p.publishedAt).toISOString()
                            : new Date(p.createdAt).toISOString(),
                        dateModified: new Date(p.updatedAt).toISOString(),
                        authorName:
                            typeof p.author === "object" ? p.author?.name || "Pickbox" : "Pickbox",
                        authorImage: typeof p.author === "object" ? p.author?.avatar : undefined,
                        section: getCategoryName(p.category) || undefined,
                    }),
                ),
            },
        ],
    });
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <!-- Back link -->
    <NuxtLink
      to="/blog"
      class="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-brand-500 transition-colors mb-8"
    >
      <ArrowLeft :size="16" />
      Back to blog
    </NuxtLink>

    <div class="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
      <!-- Main content -->
      <article>
        <!-- Header -->
        <header class="mb-8">
          <!-- Category badge -->
          <div v-if="post!.category" class="mb-3">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-accent"
            >
              <component :is="getCategoryIcon(post!.category)" v-if="getCategoryIcon(post!.category)" :size="12" />
              {{ getCategoryName(post!.category) }}
            </span>
          </div>

          <h1
            class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-content"
          >
            {{ post!.title }}
          </h1>

          <!-- Author & meta -->
          <div
            class="mt-6 flex flex-wrap items-center gap-4 text-sm text-content-muted"
          >
            <!-- Author -->
            <div class="flex items-center gap-2">
              <img
                v-if="post!.author?.avatar"
                :src="post!.author.avatar"
                :alt="post!.author.name"
                class="w-8 h-8 rounded-full object-cover"
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-accent font-medium text-sm"
              >
                {{ (post!.author?.name || 'T')[0].toUpperCase() }}
              </div>
              <span class="font-medium text-content-secondary">
                {{ post!.author?.name || 'Pickbox' }}
              </span>
            </div>

            <span
              v-if="post!.publishedAt"
              class="inline-flex items-center gap-1"
            >
              <Calendar :size="14" />
              {{ formatDate(post!.publishedAt) }}
            </span>

            <span
              v-if="post!.readingTime"
              class="inline-flex items-center gap-1"
            >
              <Clock :size="14" />
              {{ post!.readingTime }} min read
            </span>
          </div>
        </header>

        <!-- Cover image -->
        <div class="mb-10 rounded-xl overflow-hidden">
          <img
            :src="coverImage"
            :alt="post!.title"
            class="w-full aspect-video object-cover"
          />
        </div>

        <!-- Article body -->
        <div
          class="prose prose-lg dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-brand-500 hover:prose-a:text-brand-600 max-w-none"
          v-html="processedContent"
        />

        <!-- FAQ Section -->
        <div v-if="post.faq && post.faq.length > 0" class="mt-12">
          <h2 class="text-2xl font-bold text-content mb-6">Frequently Asked Questions</h2>
          <div class="space-y-3">
            <details
              v-for="(item, idx) in post.faq"
              :key="idx"
              class="group rounded-xl border border-surface-border bg-surface overflow-hidden"
            >
              <summary class="flex items-center justify-between px-5 py-4 cursor-pointer select-none text-content font-medium hover:bg-surface-secondary transition-colors [&::-webkit-details-marker]:hidden list-none">
                {{ item.question }}
                <span class="shrink-0 ml-3 text-gray-400 transition-transform duration-200 group-open:rotate-45 text-xl leading-none">+</span>
              </summary>
              <div class="px-5 pb-4 text-content-tertiary leading-relaxed border-t border-surface-border pt-3">
                {{ item.answer }}
              </div>
            </details>
          </div>
        </div>

        <!-- Tool CTA -->
        <div
          class="mt-12 p-6 rounded-xl border border-brand-200 bg-brand-50/50"
        >
          <p
            class="text-sm font-medium text-brand-accent mb-1"
          >
            Try it yourself
          </p>
          <h3
            class="text-lg font-semibold text-content mb-2"
          >
            {{ suggestedTool.name }}
          </h3>
          <p class="text-sm text-content-tertiary mb-4">
            {{ suggestedTool.description }}
          </p>
          <NuxtLink
            :to="`/${suggestedTool.slug}`"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            Open {{ suggestedTool.name }}
            <ChevronRight :size="14" />
          </NuxtLink>
        </div>
      </article>

      <!-- Sidebar: Table of Contents -->
      <aside class="hidden lg:block">
        <div class="sticky top-24">
          <div
            v-if="tableOfContents.length > 0"
            class="rounded-xl border border-surface-border bg-surface p-5"
          >
            <h2
              class="flex items-center gap-2 text-sm font-semibold text-content mb-4"
            >
              <List :size="16" />
              Table of Contents
            </h2>
            <nav aria-label="Table of contents">
              <ul class="space-y-2">
                <li
                  v-for="item in tableOfContents"
                  :key="item.id"
                  :class="item.level === 3 ? 'ml-4' : ''"
                >
                  <a
                    :href="`#${item.id}`"
                    class="block text-sm text-content-muted hover:text-brand-accent transition-colors leading-snug"
                  >
                    {{ item.text }}
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </aside>
    </div>

    <!-- Affiliate CTA -->
    <div
      v-if="post!.affiliateCta?.affiliate && post!.affiliateCta?.headline"
      class="mt-12 relative rounded-2xl overflow-hidden border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-blue-50 dark:from-brand-900/20 dark:via-surface dark:to-blue-900/10 dark:border-brand-800/40"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-transparent" />
      <div class="relative p-8 sm:p-10">
        <h3 class="text-xl sm:text-2xl font-bold text-content mb-3">
          {{ post!.affiliateCta.headline }}
        </h3>
        <div
          v-if="post!.affiliateCta.body"
          class="prose prose-sm dark:prose-invert mb-6 text-content-secondary max-w-none"
          v-html="renderMarkdown(post!.affiliateCta.body)"
        />
        <a
          :href="`/go/${post!.affiliateCta.affiliate}`"
          target="_blank"
          rel="noopener sponsored"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm sm:text-base hover:bg-brand-600 transition-all hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5"
        >
          {{ post!.affiliateCta.buttonText || 'Learn More' }}
        </a>
        <p
          v-if="post!.affiliateCta.disclaimer"
          class="mt-4 text-xs text-content-faint"
        >
          {{ post!.affiliateCta.disclaimer }}
        </p>
      </div>
    </div>

    <!-- Related posts -->
    <section v-if="relatedPosts.length > 0" class="mt-16 pt-12 border-t border-surface-border">
      <h2
        class="text-2xl font-bold text-content mb-8"
      >
        Related Posts
      </h2>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <NuxtLink
          v-for="related in relatedPosts"
          :key="related._id"
          :to="blogPostUrl(related)"
          class="group flex flex-col rounded-xl border border-surface-border bg-surface overflow-hidden transition-shadow hover:shadow-lg"
        >
          <div
            class="aspect-video bg-surface-secondary overflow-hidden"
          >
            <img
              :src="related.coverImage || getCardImageUrl(related)"
              :alt="related.title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div class="p-4">
            <h3
              class="font-semibold text-content group-hover:text-brand-500 transition-colors line-clamp-2"
            >
              {{ related.title }}
            </h3>
            <p
              class="mt-1.5 text-sm text-content-tertiary line-clamp-2"
            >
              {{ related.excerpt }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
:deep(.code-copy-btn) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: all 150ms;
  z-index: 10;
}

:deep(.code-copy-btn:hover) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

:deep(.code-copy-btn.copied) {
  background: #10b981;
  color: white;
  border-color: #10b981;
}
</style>
