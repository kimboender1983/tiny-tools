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

// Share cache with og-image route via module-level Map
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

function adjustBrightness(hex: string, amount: number): string {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const logoSlug = ((query.logo as string) || "").toLowerCase();
    const colorOverride = (query.color as string) || "";
    const bgOverride = (query.bg as string) || "";
    const bgToOverride = (query.bgTo as string) || "";
    const pickboxColor = (query.pickboxColor as string) || "rgba(255,255,255,0.6)";

    const logo = logoSlug ? await fetchLogo(logoSlug) : null;

    const bgFrom = bgOverride || logo?.bgColor || "";
    const bgTo = bgToOverride || (bgFrom ? adjustBrightness(bgFrom, -20) : "");
    const background = bgFrom
        ? `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`
        : "linear-gradient(135deg, #1e3a5f 0%, #295e6a 40%, #1a4a52 100%)";

    const children: any[] = [
        // Decorative circle
        {
            type: "div",
            props: {
                style: { position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", borderRadius: "100px", background: "rgba(255,255,255,0.05)" },
            },
        },
    ];

    if (logo) {
        // Tech logo — centered, prominent
        const techSvg = makeTechLogoSvg(logo, 100, colorOverride || undefined);
        children.push({
            type: "div",
            props: {
                style: { flex: "1", display: "flex", alignItems: "center", justifyContent: "center" },
                children: [{
                    type: "img",
                    props: {
                        src: `data:image/svg+xml,${encodeURIComponent(techSvg)}`,
                        width: 100,
                        height: 100,
                    },
                }],
            },
        });
    } else {
        // No tech logo — just show Pickbox logo bigger
        children.push({
            type: "div",
            props: {
                style: { flex: "1", display: "flex", alignItems: "center", justifyContent: "center" },
                children: [{
                    type: "img",
                    props: {
                        src: `data:image/svg+xml,${encodeURIComponent(makePickboxSvg(80, pickboxColor.startsWith("rgba") ? pickboxColor : `${pickboxColor}cc`))}`,
                        width: 80,
                        height: 80,
                    },
                }],
            },
        });
    }

    // Pickbox logo — small, bottom-left as watermark
    children.push({
        type: "img",
        props: {
            src: `data:image/svg+xml,${encodeURIComponent(makePickboxSvg(36, pickboxColor))}`,
            width: 36,
            height: 36,
            style: { position: "absolute", bottom: "36px", left: "60px", opacity: 0.5 },
        },
    });

    const svg = await satori(
        {
            type: "div",
            props: {
                style: {
                    width: "600px",
                    height: "315px",
                    display: "flex",
                    flexDirection: "column",
                    background,
                    position: "relative",
                    overflow: "hidden",
                },
                children,
            },
        },
        { width: 600, height: 315, fonts: [] },
    );

    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 600 } });
    const png = resvg.render().asPng();

    setHeaders(event, {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    });

    return png;
});
