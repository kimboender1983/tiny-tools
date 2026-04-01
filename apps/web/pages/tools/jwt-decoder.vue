<script setup lang="ts">
import { TOOLS } from '@tiny-tools/shared';
import { generateJsonLd } from '~/utils/seo';
import { ExternalLink, ChevronRight, BookOpen, Code, Braces, ArrowRight } from 'lucide-vue-next';

const appStore = useAppStore();
const tool = TOOLS.find((t) => t.slug === 'jwt-decoder')!;
const siteUrl = 'https://tinytools.dev';
const canonicalUrl = `${siteUrl}/tools/${tool.slug}`;

const faqItems = [
  {
    question: 'What is a JWT token?',
    answer: 'A JSON Web Token (JWT) is a compact, URL-safe token format defined by RFC 7519. It is used to securely transmit claims between two parties — typically a client and a server. JWTs are widely used for authentication, authorization, and information exchange in web applications and APIs.',
  },
  {
    question: 'Is it safe to decode a JWT in the browser?',
    answer: 'Decoding a JWT simply means base64-decoding its header and payload — it does not require a secret key. This is safe because the payload of a JWT is not encrypted; it is only signed. Our decoder runs entirely in your browser and never transmits your token to any server. However, you should never share your JWTs publicly, as they may contain sensitive claims.',
  },
  {
    question: 'What is the difference between decoding and verifying a JWT?',
    answer: 'Decoding a JWT extracts the header and payload by base64-decoding the token segments. This reveals the claims but does not confirm authenticity. Verifying a JWT checks the cryptographic signature against a secret key (HMAC) or public key (RSA/ECDSA) to confirm that the token was issued by a trusted party and has not been tampered with. Our tool decodes tokens for inspection; signature verification requires server-side code with access to the signing key.',
  },
  {
    question: 'Why does my JWT have three parts separated by dots?',
    answer: 'A JWT consists of three base64url-encoded segments separated by periods: the header (specifying the algorithm and token type), the payload (containing claims like user ID, roles, and expiration), and the signature (a cryptographic hash that ensures the token has not been modified). Each part serves a distinct purpose in the token lifecycle.',
  },
  {
    question: 'How do I check if a JWT has expired?',
    answer: 'The payload of a JWT typically contains an "exp" (expiration) claim, which is a Unix timestamp indicating when the token becomes invalid. Our decoder automatically detects and highlights the expiration time, converting it to a human-readable date so you can instantly see whether the token is still valid or has expired.',
  },
];

useHead({
  title: 'JWT Decoder — Free Online JWT Token Decoder & Inspector | TinyTools',
  meta: [
    { name: 'description', content: 'Decode and inspect JWT tokens instantly in your browser. View header, payload, claims, and expiration. Free JWT decoder with zero data uploads.' },
    { name: 'keywords', content: tool.keywords.join(', ') },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'JWT Decoder — Free Online JWT Token Decoder & Inspector | TinyTools' },
    { property: 'og:description', content: 'Decode and inspect JWT tokens instantly in your browser. View header, payload, claims, and expiration.' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: 'TinyTools' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'JWT Decoder — Free Online JWT Token Decoder & Inspector | TinyTools' },
    { name: 'twitter:description', content: 'Decode and inspect JWT tokens instantly in your browser. View header, payload, claims, and expiration.' },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(generateJsonLd('SoftwareApplication', {
        name: tool.name,
        description: tool.description,
        url: canonicalUrl,
        category: tool.category,
      })),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(generateJsonLd('FAQPage', faqItems)),
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(generateJsonLd('BreadcrumbList', [
        { name: 'Home', url: siteUrl },
        { name: 'JWT Decoder', url: canonicalUrl },
      ])),
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
    <ToolsJwtDecoder />

    <template #seo-content>
      <article class="max-w-4xl mx-auto">
        <!-- Quick links -->
        <nav class="mb-6 flex flex-wrap gap-2">
          <a
            v-for="link in [
              { id: 'how-jwt-works', label: 'How JWTs Work' },
              { id: 'parts-of-jwt', label: 'Parts of a JWT' },
              { id: 'algorithms', label: 'Algorithms' },
              { id: 'security-practices', label: 'Security Practices' },
              { id: 'faq', label: 'FAQ' },
              { id: 'built-with', label: 'Built With' },
              { id: 'jwt-libraries', label: 'Libraries' },
              { id: 'related-tools', label: 'Related Tools' },
            ]"
            :key="link.id"
            :href="`#${link.id}`"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-600 dark:bg-surface-dark-secondary dark:text-gray-300 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-colors scroll-smooth"
          >
            <ChevronRight :size="14" />
            {{ link.label }}
          </a>
        </nav>

        <div class="space-y-6">
          <!-- How JWT Tokens Work -->
          <section id="how-jwt-works" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              How JWT Tokens Work
            </h2>
            <div class="space-y-4">
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                JSON Web Tokens (JWTs) are an open standard for securely transmitting information between parties as a
                compact, self-contained JSON object. Unlike traditional session-based authentication where the server stores
                session state, JWTs carry all necessary information within the token itself, making them ideal for stateless
                architectures, microservices, and single-page applications.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                The authentication flow typically works as follows: a user submits credentials to the server, which validates
                them and returns a signed JWT. The client stores this token (usually in memory or an HTTP-only cookie) and
                includes it in the <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">Authorization</code> header of subsequent API requests. The server verifies the
                token's signature and extracts the claims without needing to query a database or session store.
              </p>
              <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                JWTs are signed using either a symmetric algorithm (HMAC with SHA-256, where both parties share a secret) or
                an asymmetric algorithm (RSA or ECDSA, where the server signs with a private key and clients verify with the
                corresponding public key). The choice depends on your architecture — symmetric is simpler for monolithic
                apps, while asymmetric is preferred when multiple services need to verify tokens independently.
              </p>
            </div>
          </section>

          <!-- Parts of a JWT -->
          <section id="parts-of-jwt" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              Parts of a JWT
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Every JWT consists of three base64url-encoded segments separated by dots:
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Header:</strong> A JSON object that declares the token type (<code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">"typ": "JWT"</code>) and the
                  signing algorithm (<code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">"alg": "HS256"</code>, <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">"RS256"</code>, etc.). The header tells the
                  receiving party how to verify the signature.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Payload:</strong> A JSON object containing claims — statements about the user and additional
                  metadata. Standard registered claims include <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">iss</code> (issuer), <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">sub</code> (subject),
                  <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">aud</code> (audience), <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">exp</code> (expiration), <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">iat</code> (issued at), and
                  <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">nbf</code> (not before). You can also include custom claims like user roles, permissions, or
                  tenant IDs.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Signature:</strong> Created by encoding the header and payload, concatenating them with a dot,
                  and signing the result with the specified algorithm and a secret or private key. The signature ensures
                  data integrity — if anyone modifies the header or payload, the signature becomes invalid.
                </span>
              </li>
            </ul>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              Our decoder splits the token at the dots, base64url-decodes each segment, and presents the header and
              payload as formatted JSON. Timestamps like <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">exp</code> and <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">iat</code> are automatically
              converted to human-readable dates for quick inspection.
            </p>
          </section>

          <!-- JWT Signing Algorithms -->
          <section id="algorithms" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              JWT Signing Algorithms Explained
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
              The <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">alg</code> field in the JWT header specifies which cryptographic algorithm was used to sign the token. Choosing the right algorithm depends on your architecture and security requirements.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- HS256 -->
              <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">HS256</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">Symmetric</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  HMAC using SHA-256. Both parties share the same secret key. Simple and fast, but the secret must be distributed securely. Best for server-to-server communication where both sides are trusted.
                </p>
                <a href="https://en.wikipedia.org/wiki/HMAC" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 transition-colors">
                  Wikipedia <ExternalLink :size="10" />
                </a>
              </div>

              <!-- RS256 -->
              <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">RS256</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">Asymmetric</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  RSA Signature with SHA-256. Uses a private key to sign and a public key to verify. The public key can be freely shared. Used by most OAuth 2.0 and OpenID Connect providers (Google, Auth0, Okta).
                </p>
                <a href="https://en.wikipedia.org/wiki/RSA_(cryptosystem)" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 transition-colors">
                  Wikipedia <ExternalLink :size="10" />
                </a>
              </div>

              <!-- ES256 -->
              <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">ES256</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">Asymmetric</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  ECDSA using P-256 curve and SHA-256. Smaller keys and signatures than RSA with equivalent security. Gaining popularity for modern applications. Used by Apple Sign-In and WebAuthn.
                </p>
                <a href="https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 transition-colors">
                  Wikipedia <ExternalLink :size="10" />
                </a>
              </div>

              <!-- PS256 -->
              <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">PS256</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">Asymmetric</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  RSA-PSS with SHA-256. A probabilistic variant of RSA that provides stronger security guarantees than PKCS#1 v1.5 (RS256). Recommended when RSA is required and forward-looking security matters.
                </p>
                <a href="https://en.wikipedia.org/wiki/Probabilistic_signature_scheme" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 transition-colors">
                  Wikipedia <ExternalLink :size="10" />
                </a>
              </div>

              <!-- EdDSA -->
              <div class="rounded-lg border border-surface-border dark:border-surface-dark-border p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">EdDSA</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">Asymmetric</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Edwards-curve Digital Signature Algorithm (Ed25519 or Ed448). Fastest of all asymmetric algorithms with excellent security. Increasingly used in modern protocols and recommended for new implementations.
                </p>
                <a href="https://en.wikipedia.org/wiki/EdDSA" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 transition-colors">
                  Wikipedia <ExternalLink :size="10" />
                </a>
              </div>

              <!-- none -->
              <div class="rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 p-4 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-red-700 dark:text-red-400">none</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">Insecure</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Unsecured JWT — no signature at all. Should <strong>never</strong> be accepted in production. A common attack vector where an attacker modifies the payload and sets <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1 py-0.5 rounded text-xs font-mono">alg: "none"</code> to bypass verification.
                </p>
                <a href="https://datatracker.ietf.org/doc/html/rfc7518#section-3.6" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 transition-colors">
                  RFC 7518 <ExternalLink :size="10" />
                </a>
              </div>
            </div>
          </section>

          <!-- JWT Security Best Practices -->
          <section id="security-practices" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              JWT Security Best Practices
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              While JWTs are powerful, improper use can introduce security vulnerabilities. Follow these best practices
              to keep your implementation secure:
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Always verify signatures server-side.</strong> Never trust a JWT without validating its signature.
                  Client-side decoding is useful for inspection, but authorization decisions must happen on the server.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Set short expiration times.</strong> Use the <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">exp</code> claim to limit token lifetime.
                  Short-lived access tokens (5-15 minutes) combined with longer-lived refresh tokens reduce the damage
                  window if a token is compromised.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Avoid storing sensitive data in the payload.</strong> JWT payloads are encoded, not encrypted.
                  Anyone with the token can decode and read the claims. Never include passwords, credit card numbers, or
                  other secrets in a JWT.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Use strong signing keys.</strong> For HMAC algorithms, use a cryptographically random secret of
                  at least 256 bits. For RSA, use a minimum key size of 2048 bits. Rotate keys periodically.
                </span>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0"></span>
                <span class="text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong class="text-gray-900 dark:text-gray-100">Validate all claims.</strong> Beyond the signature, verify the <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">iss</code>,
                  <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">aud</code>, and <code class="bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 px-1.5 py-0.5 rounded text-sm font-mono">exp</code> claims to ensure the token was issued by a trusted source, is
                  intended for your application, and has not expired.
                </span>
              </li>
            </ul>
          </section>

          <!-- FAQ -->
          <section id="faq" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              Frequently Asked Questions
            </h2>
            <div class="space-y-3">
              <details
                v-for="(faq, index) in faqItems"
                :key="index"
                class="group rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary overflow-hidden"
              >
                <summary class="cursor-pointer flex items-center justify-between gap-2 p-4 font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors select-none [&::-webkit-details-marker]:hidden list-none">
                  <span>{{ faq.question }}</span>
                  <span class="shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-45 text-xl leading-none font-light">+</span>
                </summary>
                <p class="px-4 pb-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {{ faq.answer }}
                </p>
              </details>
            </div>
          </section>

          <!-- Built with -->
          <section id="built-with" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <Code :size="20" class="text-brand-500" />
              Built With
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              This tool uses no external JWT libraries — just pure JavaScript base64url decoding.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <a
                href="https://datatracker.ietf.org/doc/html/rfc7518"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">RFC 7518</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">JSON Web Algorithms (JWA)</div>
                </div>
              </a>
              <a
                href="https://datatracker.ietf.org/doc/html/rfc7519"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <ExternalLink :size="16" class="text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">RFC 7519</div>
                  <div class="text-xs text-gray-500 dark:text-gray-500">JSON Web Token specification</div>
                </div>
              </a>
            </div>
          </section>

          <!-- JWT Libraries by Language -->
          <section id="jwt-libraries" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              Best JWT Libraries by Language
            </h2>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
              The recommended JWT library for each major language and framework. All support HS256, RS256, and ES256 at minimum.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="lib in [
                  { lang: 'Node.js', name: 'jose', url: 'https://github.com/panva/jose', docs: 'https://github.com/panva/jose/blob/main/docs/README.md', note: 'Zero dependencies, Web Crypto API' },
                  { lang: 'Python', name: 'PyJWT', url: 'https://github.com/jpadilla/pyjwt', docs: 'https://pyjwt.readthedocs.io/', note: 'Used by Django REST, Flask-JWT' },
                  { lang: 'Go', name: 'golang-jwt', url: 'https://github.com/golang-jwt/jwt', docs: 'https://pkg.go.dev/github.com/golang-jwt/jwt/v5', note: 'Community fork of dgrijalva/jwt-go' },
                  { lang: 'Java', name: 'jjwt', url: 'https://github.com/jwtk/jjwt', docs: 'https://github.com/jwtk/jjwt#overview', note: 'Used by Spring Security' },
                  { lang: 'C# / .NET', name: 'Microsoft.Identity', url: 'https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet', docs: 'https://learn.microsoft.com/en-us/dotnet/api/microsoft.identitymodel.tokens', note: 'Official Microsoft library' },
                  { lang: 'Ruby', name: 'ruby-jwt', url: 'https://github.com/jwt/ruby-jwt', docs: 'https://rubydoc.info/gems/jwt', note: 'Used by Devise, OmniAuth' },
                  { lang: 'PHP', name: 'php-jwt', url: 'https://github.com/firebase/php-jwt', docs: 'https://github.com/firebase/php-jwt#usage', note: 'Firebase / Google maintained' },
                  { lang: 'Rust', name: 'jsonwebtoken', url: 'https://github.com/Keats/jsonwebtoken', docs: 'https://docs.rs/jsonwebtoken/', note: 'Most popular Rust JWT crate' },
                  { lang: 'Swift', name: 'vapor/jwt', url: 'https://github.com/vapor/jwt', docs: 'https://docs.vapor.codes/security/jwt/', note: 'Part of the Vapor framework' },
                ]"
                :key="lib.name"
                class="flex flex-col gap-1.5 p-4 rounded-lg border border-surface-border dark:border-surface-dark-border bg-surface-secondary dark:bg-surface-dark-secondary"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-brand-600 dark:text-brand-400">{{ lib.lang }}</span>
                </div>
                <div class="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">
                  {{ lib.name }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ lib.note }}</div>
                <div class="flex items-center gap-3 mt-1">
                  <a :href="lib.url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    GitHub <ExternalLink :size="10" />
                  </a>
                  <a :href="lib.docs" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    Docs <ExternalLink :size="10" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <!-- Related Tools -->
          <section id="related-tools" class="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 dark:bg-surface-dark dark:border-surface-dark-border">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-l-4 border-brand-500 pl-4 flex items-center gap-2">
              <BookOpen :size="20" class="text-brand-500" />
              Related Tools
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NuxtLink
                to="/tools/json-formatter"
                class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-surface-dark-border bg-gray-50 dark:bg-surface-dark-secondary hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group"
              >
                <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 shrink-0">
                  <Braces :size="18" />
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">JSON Formatter</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Format, validate, and beautify JSON instantly</div>
                </div>
                <ArrowRight :size="16" class="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 ml-auto shrink-0 transition-colors" />
              </NuxtLink>
            </div>
          </section>
        </div>
      </article>
    </template>
  </UiToolPageLayout>
</template>
