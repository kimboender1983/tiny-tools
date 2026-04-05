import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

interface LogoData {
    name: string;
    slug: string;
    paths: string[];
    color: string;
    bgColor?: string;
    viewBox?: string;
    fillRule?: string;
}

// In-memory cache for logo data (5 min TTL)
const logoCache = new Map<string, { data: LogoData | null; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

async function fetchLogo(slug: string): Promise<LogoData | null> {
    const cached = logoCache.get(slug);
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

    const apiUrl = process.env.NUXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
        const logo = await $fetch<LogoData>(`${apiUrl}/content/tech-logos/${slug}`);
        logoCache.set(slug, { data: logo, ts: Date.now() });
        return logo;
    } catch {
        logoCache.set(slug, { data: null, ts: Date.now() });
        return null;
    }
}

// Cache font data in memory after first load
let fontDataCache: ArrayBuffer | null = null;
let fontBoldDataCache: ArrayBuffer | null = null;

async function loadFont(weight: number): Promise<ArrayBuffer> {
    const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
    const cssRes = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
    });
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\(([^)]+)\)/);
    if (!match) throw new Error(`Could not extract font URL for weight ${weight}`);
    const fontRes = await fetch(match[1]);
    return fontRes.arrayBuffer();
}

async function getFonts() {
    if (!fontDataCache) fontDataCache = await loadFont(500);
    if (!fontBoldDataCache) fontBoldDataCache = await loadFont(700);
    return [
        { name: "Inter", data: fontDataCache, weight: 500 as const, style: "normal" as const },
        { name: "Inter", data: fontBoldDataCache, weight: 700 as const, style: "normal" as const },
    ];
}

const LOGO_PATH = "M48,3.05c-24.824,0-44.951,20.126-44.951,44.951S23.176,92.95,48,92.95c24.826,0,44.951-20.124,44.951-44.949S72.826,3.05,48,3.05z M63.924,80.312v-29.15c3.885-1.21,6.705-4.835,6.705-9.117c0-5.273-4.273-9.548-9.547-9.548s-9.547,4.274-9.547,9.548c0,4.282,2.82,7.907,6.705,9.117v31.374c-3.246,0.963-6.684,1.48-10.24,1.48c-19.891,0-36.014-16.125-36.014-36.015c0-14.174,8.188-26.434,20.092-32.311v29.15c-3.885,1.209-6.707,4.833-6.707,9.117c0,5.271,4.275,9.547,9.549,9.547c5.271,0,9.547-4.275,9.547-9.547c0-4.284-2.822-7.908-6.707-9.117V13.465c3.246-0.961,6.684-1.479,10.24-1.479c19.891,0,36.014,16.124,36.014,36.016C84.014,62.175,75.826,74.434,63.924,80.312z";

function makePickboxSvg(size: number, color: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="${size}" height="${size}" fill="${color}"><path d="${LOGO_PATH}"/></svg>`;
}

function fixPath(d: string): string {
    return /^[Mm]/.test(d.trim()) ? d : `M${d}`;
}

function makeTechLogoSvg(logo: LogoData, size: number, colorOverride?: string): string {
    const rule = logo.fillRule || "evenodd";
    const vb = logo.viewBox || "0 0 24 24";
    const color = colorOverride || logo.color;
    const pathEls = logo.paths.map((p) => `<path fill-rule="${rule}" d="${fixPath(p)}"/>`).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${size}" height="${size}" fill="${color}">${pathEls}</svg>`;
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const title = (query.title as string) || "Pickbox";
    const category = (query.category as string) || "";
    const logoSlug = ((query.logo as string) || "").toLowerCase();
    const colorOverride = (query.color as string) || "";
    const bgOverride = (query.bg as string) || "";
    const bgToOverride = (query.bgTo as string) || "";
    const pickboxColor = (query.pickboxColor as string) || "white";
    const titleColor = (query.titleColor as string) || "#ffffff";

    const logo = logoSlug ? await fetchLogo(logoSlug) : null;
    const fonts = await getFonts();

    const bgFrom = bgOverride || logo?.bgColor || "";
    const bgTo = bgToOverride || (bgFrom ? adjustBrightness(bgFrom, -20) : "");
    const background = bgFrom
        ? `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`
        : "linear-gradient(135deg, #1e3a5f 0%, #295e6a 40%, #1a4a52 100%)";

    const techLogoSvg = logo ? makeTechLogoSvg(logo, 200, colorOverride || undefined) : "";
    const smallLogoSvg = logo ? makeTechLogoSvg(logo, 64, colorOverride || undefined) : "";

    const children: any[] = [
        // Decorative circles
        {
            type: "div",
            props: {
                style: { position: "absolute", top: "-120px", right: "-120px", width: "400px", height: "400px", borderRadius: "200px", background: "rgba(255,255,255,0.05)" },
            },
        },
        {
            type: "div",
            props: {
                style: { position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "150px", background: "rgba(255,255,255,0.03)" },
            },
        },
        // Pickbox logo + name
        {
            type: "div",
            props: {
                style: { display: "flex", alignItems: "center", gap: "16px" },
                children: [
                    { type: "img", props: { src: `data:image/svg+xml,${encodeURIComponent(makePickboxSvg(56, pickboxColor))}`, width: 56, height: 56 } },
                    { type: "div", props: { style: { fontSize: "28px", fontWeight: 700, color: pickboxColor, opacity: 0.9, letterSpacing: "-0.02em" }, children: "pickbox" } },
                ],
            },
        },
        // Spacer
        { type: "div", props: { style: { flex: "1" } } },
    ];

    // Large watermark logo bottom-right
    if (logo && techLogoSvg) {
        children.push({
            type: "img",
            props: {
                src: `data:image/svg+xml,${encodeURIComponent(techLogoSvg)}`,
                width: 200,
                height: 200,
                style: { position: "absolute", right: "60px", bottom: "60px", opacity: 0.15 },
            },
        });
    }

    // Title row with small logo
    children.push({
        type: "div",
        props: {
            style: { display: "flex", alignItems: "center", gap: "24px", maxWidth: logo ? "850px" : "900px" },
            children: [
                ...(logo && smallLogoSvg
                    ? [{ type: "img", props: { src: `data:image/svg+xml,${encodeURIComponent(smallLogoSvg)}`, width: 64, height: 64 } }]
                    : []),
                {
                    type: "div",
                    props: {
                        style: {
                            fontSize: title.length > 60 ? "42px" : title.length > 40 ? "52px" : "60px",
                            fontWeight: 700,
                            color: titleColor,
                            lineHeight: 1.2,
                            letterSpacing: "-0.03em",
                        },
                        children: title,
                    },
                },
            ],
        },
    });

    // Category badge
    if (category) {
        children.push({
            type: "div",
            props: {
                style: { display: "flex", marginTop: "24px" },
                children: [{
                    type: "div",
                    props: {
                        style: { fontSize: "18px", fontWeight: 500, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)", padding: "8px 20px", borderRadius: "99px" },
                        children: category,
                    },
                }],
            },
        });
    }

    const svg = await satori(
        {
            type: "div",
            props: {
                style: {
                    width: "1200px",
                    height: "630px",
                    display: "flex",
                    flexDirection: "column",
                    background,
                    fontFamily: "Inter",
                    padding: "60px",
                    position: "relative",
                    overflow: "hidden",
                },
                children,
            },
        },
        { width: 1200, height: 630, fonts },
    );

    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
    const png = resvg.render().asPng();

    setHeaders(event, {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    });

    return png;
});

function adjustBrightness(hex: string, amount: number): string {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
