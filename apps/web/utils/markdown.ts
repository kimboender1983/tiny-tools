import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked with syntax highlighting
const renderer = new marked.Renderer();
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : undefined;
  const highlighted = language
    ? hljs.highlight(text, { language }).value
    : hljs.highlightAuto(text).value;
  const langClass = language ? `hljs language-${language}` : 'hljs';
  return `<pre><code class="${langClass}">${highlighted}</code></pre>`;
};
renderer.link = function ({ href, text }: { href: string; text: string }) {
  const isExternal = href.startsWith('http://') || href.startsWith('https://');
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
export function processAffiliateLinks(
  html: string,
  affiliatesMap: Map<string, string>,
): string {
  return html.replace(
    /\{\{aff:([a-z0-9-]+)(?:\|([^}]+))?\}\}/gi,
    (_match, slug: string, customText?: string) => {
      const name = customText || affiliatesMap.get(slug) || slug;
      return `<a href="/go/${slug}" class="affiliate-link" target="_blank" rel="sponsored noopener">${name}</a>`;
    },
  );
}
