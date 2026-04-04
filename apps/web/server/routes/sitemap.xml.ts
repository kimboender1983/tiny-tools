interface SitemapEntry {
    slug: string;
    categorySlug?: string;
    updatedAt?: string;
    publishedAt?: string;
}

interface SitemapData {
    pages: SitemapEntry[];
    blogPosts: SitemapEntry[];
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const siteUrl = (config.public.siteUrl as string) || "https://pickbox.dev";
    const apiUrl = (config.public.apiUrl as string) || "http://localhost:3001";
    const now = new Date().toISOString();

    // Static entries
    const staticUrls: Array<{
        loc: string;
        lastmod: string;
        priority: string;
        changefreq: string;
    }> = [
        {
            loc: siteUrl,
            lastmod: now,
            priority: "1.0",
            changefreq: "daily",
        },
        {
            loc: `${siteUrl}/blog`,
            lastmod: now,
            priority: "0.8",
            changefreq: "daily",
        },
    ];

    // Tool pages are now included via dynamic CMS pages with categorySlug

    // Dynamic entries from API
    const dynamicUrls: Array<{
        loc: string;
        lastmod: string;
        priority: string;
        changefreq: string;
    }> = [];

    try {
        const data = await $fetch<SitemapData>("/content/sitemap", {
            baseURL: apiUrl,
        });

        if (data?.pages) {
            for (const page of data.pages) {
                const path = page.categorySlug
                    ? `/${page.categorySlug}/${page.slug}`
                    : `/${page.slug}`;
                dynamicUrls.push({
                    loc: `${siteUrl}${path}`,
                    lastmod: page.updatedAt || now,
                    priority: page.categorySlug ? "0.9" : "0.6",
                    changefreq: page.categorySlug ? "weekly" : "monthly",
                });
            }
        }

        if (data?.blogPosts) {
            for (const post of data.blogPosts) {
                const catSlug = post.categorySlug || "uncategorized";
                dynamicUrls.push({
                    loc: `${siteUrl}/blog/${catSlug}/${post.slug}`,
                    lastmod: post.updatedAt || post.publishedAt || now,
                    priority: "0.7",
                    changefreq: "weekly",
                });
            }
        }
    } catch {
        // API may be unavailable; continue with static entries only
    }

    const allUrls = [...staticUrls, ...dynamicUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
    .map(
        (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
    )
    .join("\n")}
</urlset>`;

    setResponseHeader(event, "content-type", "application/xml");
    return xml;
});

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
