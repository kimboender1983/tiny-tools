import hljs from "highlight.js";
import { marked } from "marked";

// Configure marked with syntax highlighting + mermaid support
const renderer = new marked.Renderer();
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
    // Chart.js — render as canvas with JSON config, initialized client-side
    if (lang === "chart") {
        const escaped = text
            .replace(/&/g, "&amp;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        return `<div class="chartjs-wrapper"><canvas data-chart='${escaped}'></canvas></div>`;
    }

    const language = lang && hljs.getLanguage(lang) ? lang : undefined;
    const highlighted = language
        ? hljs.highlight(text, { language }).value
        : hljs.highlightAuto(text).value;
    const langClass = language ? `hljs language-${language}` : "hljs";
    return `<pre><code class="${langClass}">${highlighted}</code></pre>`;
};
const parser = new marked.Parser();
renderer.table = (token: {
    header: { tokens: marked.Token[]; align: string | null }[];
    rows: { tokens: marked.Token[]; align: string | null }[][];
}) => {
    const hdr = token.header
        .map((cell) => {
            const align = cell.align ? ` style="text-align:${cell.align}"` : "";
            return `<th${align}>${parser.parseInline(cell.tokens)}</th>`;
        })
        .join("");
    const body = token.rows
        .map((row) => {
            const cells = row
                .map((cell) => {
                    const align = cell.align ? ` style="text-align:${cell.align}"` : "";
                    return `<td${align}>${parser.parseInline(cell.tokens)}</td>`;
                })
                .join("");
            return `<tr>${cells}</tr>`;
        })
        .join("");
    return `<div class="table-wrapper"><table class="m-0"><thead><tr>${hdr}</tr></thead><tbody>${body}</tbody></table></div>`;
};
renderer.link = ({ href, text }: { href: string; text: string }) => {
    const isExternal = href.startsWith("http://") || href.startsWith("https://");
    if (isExternal) {
        return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
    }
    return `<a href="${href}">${text}</a>`;
};
marked.use({ renderer });

export function renderMarkdown(content: string): string {
    return marked.parse(content, { async: false }) as string;
}

/**
 * Replace affiliate shortcodes in rendered HTML.
 *
 * Syntax:
 *   {{aff:slug}}           → renders as affiliate name
 *   {{aff:slug|custom text}} → renders with custom text
 *
 * Produces:
 *   <a href="/go/slug" class="affiliate-link" target="_blank" rel="sponsored noopener">Text</a>
 */
/**
 * Process code playground embed shortcodes.
 *
 * Syntax:
 *   <!-- stackblitz:project-id -->
 *   <!-- codesandbox:sandbox-id -->
 *
 * Produces responsive iframe embeds.
 */
export function processPlaygroundEmbeds(html: string): string {
    return html
        .replace(
            /<!--\s*stackblitz:([a-z0-9-/]+)\s*-->/gi,
            (_match, id: string) =>
                `<div class="playground-embed"><iframe src="https://stackblitz.com/edit/${id}?embed=1&file=src/App.tsx" loading="lazy" allow="cross-origin-isolated"></iframe></div>`,
        )
        .replace(
            /<!--\s*codesandbox:([a-z0-9-]+)\s*-->/gi,
            (_match, id: string) =>
                `<div class="playground-embed"><iframe src="https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&theme=dark" loading="lazy" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"></iframe></div>`,
        );
}

export function processAffiliateLinks(html: string, affiliatesMap: Map<string, string>): string {
    return html.replace(
        /\{\{aff:([a-z0-9-]+)(?:\|([^}]+))?\}\}/gi,
        (_match, slug: string, customText?: string) => {
            const name = customText || affiliatesMap.get(slug) || slug;
            return `<a href="/go/${slug}" class="affiliate-link" target="_blank" rel="sponsored noopener">${name}</a>`;
        },
    );
}
