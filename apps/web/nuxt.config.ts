export default defineNuxtConfig({
  compatibilityDate: '2025-03-01',

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  runtimeConfig: {
    public: {
      siteUrl: 'https://tinytools.dev',
      apiUrl: 'http://localhost:3001',
      adsenseId: '',
    },
  },

  routeRules: {
    '/admin/**': { ssr: false, robots: 'noindex, nofollow', headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    // Legacy redirects from root-level tool URLs
    '/json-formatter': { redirect: { to: '/tools/json-formatter', statusCode: 301 } },
    '/json-diff': { redirect: { to: '/tools/json-diff', statusCode: 301 } },
    '/jwt-decoder': { redirect: { to: '/tools/jwt-decoder', statusCode: 301 } },
    '/image-compressor': { redirect: { to: '/tools/image-compressor', statusCode: 301 } },
  },

  typescript: {
    strict: true,
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },
});
