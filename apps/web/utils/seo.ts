import type { IToolMeta } from "@tiny-tools/shared";

interface HeadMeta {
    title: string;
    meta: Array<{ name?: string; property?: string; content: string }>;
    link?: Array<{ rel: string; href: string }>;
    script?: Array<{ type: string; children: string }>;
}

interface BreadcrumbItem {
    name: string;
    url: string;
}

// ── Tool Meta ──────────────────────────────────────────────────────

export function generateToolMeta(
    tool: IToolMeta,
    siteUrl: string = "https://pickbox.dev",
): HeadMeta {
    const title = `${tool.name} - Free Online Tool | Pickbox`;
    const description = tool.description;
    const url = `${siteUrl}/${tool.slug}`;

    return {
        title,
        meta: [
            { name: "description", content: description },
            { name: "keywords", content: tool.keywords.join(", ") },

            // Open Graph
            { property: "og:type", content: "website" },
            { property: "og:title", content: title },
            { property: "og:description", content: description },
            { property: "og:url", content: url },
            { property: "og:site_name", content: "Pickbox" },

            // Twitter Card
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: title },
            { name: "twitter:description", content: description },
        ],
        link: [{ rel: "canonical", href: url }],
        script: [
            {
                type: "application/ld+json",
                children: JSON.stringify(
                    generateJsonLd("SoftwareApplication", {
                        name: tool.name,
                        description: tool.description,
                        url,
                        category: tool.category,
                    }),
                ),
            },
        ],
    };
}

// ── JSON-LD Generators ─────────────────────────────────────────────

type JsonLdType = "SoftwareApplication" | "FAQPage" | "BreadcrumbList" | "Article";

interface SoftwareApplicationData {
    name: string;
    description: string;
    url: string;
    category: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

interface ArticleData {
    title: string;
    description: string;
    url: string;
    image?: string;
    datePublished: string;
    dateModified?: string;
    authorName: string;
    authorImage?: string;
    authorUrl?: string;
    section?: string;
}

export function generateJsonLd(
    type: "SoftwareApplication",
    data: SoftwareApplicationData,
): Record<string, unknown>;
export function generateJsonLd(type: "FAQPage", data: FaqItem[]): Record<string, unknown>;
export function generateJsonLd(
    type: "BreadcrumbList",
    data: BreadcrumbItem[],
): Record<string, unknown>;
export function generateJsonLd(type: "Article", data: ArticleData): Record<string, unknown>;
export function generateJsonLd(
    type: JsonLdType,
    data: SoftwareApplicationData | FaqItem[] | BreadcrumbItem[] | ArticleData,
): Record<string, unknown> {
    switch (type) {
        case "SoftwareApplication": {
            const d = data as SoftwareApplicationData;
            return {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: d.name,
                description: d.description,
                url: d.url,
                applicationCategory: d.category,
                operatingSystem: "Any",
                offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                },
            };
        }

        case "FAQPage": {
            const items = data as FaqItem[];
            return {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: items.map((item) => ({
                    "@type": "Question",
                    name: item.question,
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: item.answer,
                    },
                })),
            };
        }

        case "BreadcrumbList": {
            return generateBreadcrumbs(data as BreadcrumbItem[]);
        }

        case "Article": {
            const d = data as ArticleData;
            const author: Record<string, unknown> = {
                "@type": "Person",
                name: d.authorName,
            };
            if (d.authorImage) author.image = d.authorImage;
            if (d.authorUrl) author.url = d.authorUrl;

            return {
                "@context": "https://schema.org",
                "@type": "Article",
                headline: d.title,
                description: d.description,
                url: d.url,
                ...(d.image && { image: d.image }),
                ...(d.section && { articleSection: d.section }),
                datePublished: d.datePublished,
                dateModified: d.dateModified ?? d.datePublished,
                author,
                publisher: {
                    "@type": "Organization",
                    name: "Pickbox",
                    url: "https://pickbox.dev",
                },
            };
        }
    }
}

// ── Breadcrumbs ────────────────────────────────────────────────────

export function generateBreadcrumbs(items: BreadcrumbItem[]): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}
