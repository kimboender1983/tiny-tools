<script setup lang="ts">
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Eraser,
  Info,
  Key,
  FileCode,
  Lock,
  ExternalLink,
  Zap,
} from 'lucide-vue-next';

const {
  token,
  decoded,
  error,
  securityWarnings,
  timestamps,
  expiryStatus,
  clear,
  isTimestampClaim,
  getClaimDescription,
  isStandardClaim,
} = useJwtDecoder();

// --- Example tokens ---
const examples = [
  {
    label: 'HS256',
    description: 'HMAC with SHA-256 — symmetric key',
    // jwt.io example token
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    wiki: 'https://en.wikipedia.org/wiki/HMAC',
  },
  {
    label: 'RS256',
    description: 'RSA with SHA-256 — asymmetric key pair',
    token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.POstGetfAytaZS82wHcjoTyoqhMyxXiWdR7Nn7A29DNSl0EiXLdwJ6xC6AfgZWF1bOsS_TuYI3OG85AmiExREkrS6tDfTQ2B3WXlrr-wp5AokiRbz3_oB4OxG-W9KcEEbDRcZc0nH3L7LzYptiy1PtAylQGxHTWZXtGz4ht0bAecBgmpdgXMguEIcoqPJ1n3pIWk_dUZegpqx0Lka21H6XxUTxiy8OcaarA8zdnPUnV6AmNP3ecFawIFYdvJB_cm-GvpCSbr8G8y_Mllj8f4x9nBH8pQux89_6gUY618iYv7tuPWBFfEbLxtF2pZS6YC1aSfLQxaOoaBSTPoiHnw',
    wiki: 'https://en.wikipedia.org/wiki/RSA_(cryptosystem)',
  },
  {
    label: 'ES256',
    description: 'ECDSA with P-256 and SHA-256 — elliptic curve',
    token: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIFNtaXRoIiwicm9sZSI6ImVuZ2luZWVyIiwiaWF0IjoxNTE2MjM5MDIyfQ.FBRIFaGMUmwJcrCdMQDkJgJhjbcfy2lMaVhaKPYXVN7dJ1k3yY0YfcfCTMxnPbvoS3WPjANjnV3VGfI6VcYpYA',
    wiki: 'https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm',
  },
];

function loadExample(ex: typeof examples[0]) {
  token.value = ex.token;
}

// --- Algorithm info ---
const algoInfo = computed(() => {
  if (!decoded.value?.header.alg) return null;
  const alg = decoded.value.header.alg as string;
  const info: Record<string, { name: string; type: string; wiki: string }> = {
    HS256: { name: 'HMAC-SHA256', type: 'Symmetric', wiki: 'https://en.wikipedia.org/wiki/HMAC' },
    HS384: { name: 'HMAC-SHA384', type: 'Symmetric', wiki: 'https://en.wikipedia.org/wiki/HMAC' },
    HS512: { name: 'HMAC-SHA512', type: 'Symmetric', wiki: 'https://en.wikipedia.org/wiki/HMAC' },
    RS256: { name: 'RSA-SHA256', type: 'Asymmetric', wiki: 'https://en.wikipedia.org/wiki/RSA_(cryptosystem)' },
    RS384: { name: 'RSA-SHA384', type: 'Asymmetric', wiki: 'https://en.wikipedia.org/wiki/RSA_(cryptosystem)' },
    RS512: { name: 'RSA-SHA512', type: 'Asymmetric', wiki: 'https://en.wikipedia.org/wiki/RSA_(cryptosystem)' },
    ES256: { name: 'ECDSA P-256', type: 'Asymmetric', wiki: 'https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm' },
    ES384: { name: 'ECDSA P-384', type: 'Asymmetric', wiki: 'https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm' },
    ES512: { name: 'ECDSA P-521', type: 'Asymmetric', wiki: 'https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm' },
    PS256: { name: 'RSA-PSS SHA-256', type: 'Asymmetric', wiki: 'https://en.wikipedia.org/wiki/Probabilistic_signature_scheme' },
    PS384: { name: 'RSA-PSS SHA-384', type: 'Asymmetric', wiki: 'https://en.wikipedia.org/wiki/Probabilistic_signature_scheme' },
    PS512: { name: 'RSA-PSS SHA-512', type: 'Asymmetric', wiki: 'https://en.wikipedia.org/wiki/Probabilistic_signature_scheme' },
    EdDSA: { name: 'EdDSA (Ed25519)', type: 'Asymmetric', wiki: 'https://en.wikipedia.org/wiki/EdDSA' },
    none: { name: 'No signature', type: 'Insecure', wiki: 'https://datatracker.ietf.org/doc/html/rfc7518#section-3.6' },
  };
  return info[alg] || null;
});

// --- Color-coded token parts ---
const tokenParts = computed(() => {
  const raw = token.value.trim();
  if (!raw) return null;
  const dotIndices: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '.') dotIndices.push(i);
  }
  if (dotIndices.length !== 2) return null;
  return {
    header: raw.slice(0, dotIndices[0]),
    dot1: '.',
    payload: raw.slice(dotIndices[0] + 1, dotIndices[1]),
    dot2: '.',
    signature: raw.slice(dotIndices[1] + 1),
  };
});

// --- JSON syntax highlighting ---
function highlightJson(obj: Record<string, unknown>): string {
  const json = JSON.stringify(obj, null, 2);
  let html = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span class="jwt-json-key">$1</span>:');
  html = html.replace(/:\s*("(?:[^"\\]|\\.)*")/g, (match, str) => match.replace(str, `<span class="jwt-json-string">${str}</span>`));
  html = html.replace(/(?<=:\s*)(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)(?=[,\s\n\]}])/g, '<span class="jwt-json-number">$1</span>');
  html = html.replace(/\b(true|false)\b/g, '<span class="jwt-json-boolean">$1</span>');
  html = html.replace(/\bnull\b/g, '<span class="jwt-json-null">null</span>');
  return html;
}

const highlightedHeader = computed(() => decoded.value ? highlightJson(decoded.value.header) : '');
const highlightedPayload = computed(() => decoded.value ? highlightJson(decoded.value.payload as Record<string, unknown>) : '');

// --- Payload claim entries ---
interface ClaimEntry {
  key: string;
  value: unknown;
  description?: string;
  isTimestamp: boolean;
  timestampInfo?: { humanReadable: string; relative: string };
}

const payloadClaims = computed<ClaimEntry[]>(() => {
  if (!decoded.value) return [];
  return Object.entries(decoded.value.payload).map(([key, value]) => {
    const entry: ClaimEntry = {
      key,
      value,
      description: getClaimDescription(key),
      isTimestamp: isTimestampClaim(key) && typeof value === 'number',
    };
    if (entry.isTimestamp && timestamps.value[key]) {
      entry.timestampInfo = {
        humanReadable: timestamps.value[key].humanReadable,
        relative: timestamps.value[key].relative,
      };
    }
    return entry;
  });
});

const activeTooltip = ref<string | null>(null);

function toggleTooltip(key: string) {
  activeTooltip.value = activeTooltip.value === key ? null : key;
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const overlayRef = ref<HTMLPreElement | null>(null);

function syncScroll() {
  if (textareaRef.value && overlayRef.value) {
    overlayRef.value.scrollTop = textareaRef.value.scrollTop;
    overlayRef.value.scrollLeft = textareaRef.value.scrollLeft;
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Token Input -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label for="jwt-input" class="text-sm font-medium text-gray-700 dark:text-gray-300">
          JWT Token
        </label>
        <div class="flex items-center gap-2">
          <span
            v-if="expiryStatus"
            class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
            :class="expiryStatus.expired
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'"
          >
            <Clock :size="12" />
            {{ expiryStatus.label }}
          </span>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200 transition-colors"
            @click="clear"
          >
            <Eraser :size="15" />
            <span class="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      <div class="relative rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-colors">
        <!-- Colored overlay -->
        <pre
          v-if="tokenParts"
          ref="overlayRef"
          class="absolute inset-0 py-3 px-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-all pointer-events-none overflow-hidden m-0"
          aria-hidden="true"
        ><span class="text-red-500 dark:text-red-400">{{ tokenParts.header }}</span><span class="text-red-400 dark:text-red-500">{{ tokenParts.dot1 }}</span><span class="text-purple-500 dark:text-purple-400">{{ tokenParts.payload }}</span><span class="text-purple-400 dark:text-purple-500">{{ tokenParts.dot2 }}</span><span class="text-blue-500 dark:text-blue-400">{{ tokenParts.signature }}</span></pre>

        <textarea
          id="jwt-input"
          ref="textareaRef"
          v-model="token"
          class="relative w-full min-h-[120px] py-3 px-4 font-mono text-sm leading-relaxed bg-transparent resize-y focus:outline-none placeholder-gray-500 dark:placeholder-gray-600"
          :class="tokenParts ? 'text-transparent caret-gray-900 dark:caret-gray-100' : 'text-gray-900 dark:text-gray-100'"
          placeholder="Paste your JWT token here (e.g. eyJhbGciOiJIUzI1NiIs...)"
          spellcheck="false"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          @scroll="syncScroll"
        />
      </div>

      <!-- Legend + Copy -->
      <div class="flex items-center justify-between">
        <div v-if="tokenParts" class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-red-500" />
            Header
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-500" />
            Payload
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Signature
          </span>
        </div>
        <div v-if="token.trim()">
          <UiCopyButton :text="token" />
        </div>
      </div>
    </div>

    <!-- Example tokens -->
    <div v-if="!decoded && !error" class="flex flex-col gap-3">
      <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Try an example:</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          v-for="ex in examples"
          :key="ex.label"
          type="button"
          class="flex flex-col items-start gap-1 p-4 rounded-xl border border-surface-border bg-surface hover:border-brand-300 hover:bg-brand-50/50 dark:bg-surface-dark dark:border-surface-dark-border dark:hover:border-brand-700 dark:hover:bg-brand-900/10 transition-colors text-left group"
          @click="loadExample(ex)"
        >
          <div class="flex items-center gap-2">
            <Zap :size="14" class="text-brand-500" />
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">{{ ex.label }}</span>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ ex.description }}</span>
        </button>
      </div>
    </div>

    <!-- Error panel -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="error"
        class="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm dark:bg-red-900/10 dark:border-red-900/30"
      >
        <AlertTriangle :size="16" class="text-red-500 shrink-0" />
        <p class="text-red-700 dark:text-red-400">{{ error.message }}</p>
      </div>
    </Transition>

    <!-- Security warnings -->
    <TransitionGroup
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-for="warning in securityWarnings"
        :key="warning.title"
        class="flex items-start gap-3 px-4 py-3 rounded-xl border text-sm"
        :class="warning.severity === 'critical'
          ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'
          : 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30'"
      >
        <ShieldAlert
          :size="16"
          class="shrink-0 mt-0.5"
          :class="warning.severity === 'critical' ? 'text-red-500' : 'text-amber-500'"
        />
        <div>
          <p class="font-medium" :class="warning.severity === 'critical' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'">
            {{ warning.title }}
          </p>
          <p class="mt-0.5" :class="warning.severity === 'critical' ? 'text-red-600 dark:text-red-400/80' : 'text-amber-600 dark:text-amber-400/80'">
            {{ warning.description }}
          </p>
        </div>
      </div>
    </TransitionGroup>

    <!-- Decoded panels -->
    <div v-if="decoded" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Header Panel -->
      <div class="flex flex-col rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border border-t-2 border-t-red-500">
          <div class="flex items-center gap-2">
            <FileCode :size="15" class="text-red-500" />
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Header</span>
          </div>
          <UiCopyButton :text="JSON.stringify(decoded.header, null, 2)" />
        </div>
        <div class="p-4 overflow-auto">
          <!-- Algorithm badge + info -->
          <div v-if="decoded.header.alg" class="mb-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Algorithm</span>
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-semibold"
                :class="decoded.header.alg === 'none'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-surface-dark-secondary dark:text-gray-300'"
              >
                <ShieldCheck v-if="decoded.header.alg !== 'none'" :size="12" />
                <ShieldAlert v-else :size="12" />
                {{ decoded.header.alg }}
              </span>
              <template v-if="algoInfo">
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ algoInfo.name }}</span>
                <span class="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-surface-dark-secondary text-gray-600 dark:text-gray-400">{{ algoInfo.type }}</span>
                <a
                  :href="algoInfo.wiki"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Learn more
                  <ExternalLink :size="10" />
                </a>
              </template>
            </div>
          </div>

          <pre class="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100" v-html="highlightedHeader" />
        </div>
      </div>

      <!-- Payload Panel -->
      <div class="flex flex-col rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border border-t-2 border-t-purple-500">
          <div class="flex items-center gap-2">
            <Key :size="15" class="text-purple-500" />
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Payload</span>
            <span class="text-xs text-gray-500 dark:text-gray-500">{{ Object.keys(decoded.payload).length }} claims</span>
          </div>
          <UiCopyButton :text="JSON.stringify(decoded.payload, null, 2)" />
        </div>
        <div class="p-4 overflow-auto">
          <div class="flex flex-col gap-2.5">
            <div v-for="claim in payloadClaims" :key="claim.key" class="group">
              <div class="flex items-start gap-2">
                <div class="flex items-center gap-1 shrink-0">
                  <code class="text-sm font-mono font-semibold text-purple-700 dark:text-purple-300">{{ claim.key }}</code>
                  <button
                    v-if="claim.description"
                    type="button"
                    class="relative text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    @click="toggleTooltip(claim.key)"
                    @mouseenter="activeTooltip = claim.key"
                    @mouseleave="activeTooltip = null"
                  >
                    <Info :size="12" />
                    <Transition
                      enter-active-class="transition-all duration-150 ease-out"
                      enter-from-class="opacity-0 translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition-all duration-100 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 translate-y-1"
                    >
                      <span
                        v-if="activeTooltip === claim.key"
                        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 text-xs font-normal text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg shadow-lg whitespace-nowrap z-10 pointer-events-none"
                      >
                        {{ claim.description }}
                      </span>
                    </Transition>
                  </button>
                </div>
                <div class="flex-1 min-w-0">
                  <code class="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">{{ formatValue(claim.value) }}</code>
                  <div v-if="claim.isTimestamp && claim.timestampInfo" class="mt-1 flex flex-wrap items-center gap-2">
                    <span class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock :size="11" />
                      {{ claim.timestampInfo.humanReadable }}
                    </span>
                    <span
                      v-if="claim.key === 'exp' && expiryStatus"
                      class="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md"
                      :class="expiryStatus.expired
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'"
                    >
                      {{ expiryStatus.label }}
                    </span>
                    <span v-else class="text-xs text-gray-500 dark:text-gray-500">({{ claim.timestampInfo.relative }})</span>
                  </div>
                </div>
              </div>
              <div class="mt-2.5 border-b border-surface-border/50 dark:border-surface-dark-border/50 last:border-0" />
            </div>
          </div>
        </div>
      </div>

      <!-- Signature Panel -->
      <div class="flex flex-col rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border border-t-2 border-t-blue-500">
          <div class="flex items-center gap-2">
            <Lock :size="15" class="text-blue-500" />
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Signature</span>
          </div>
          <UiCopyButton :text="decoded.signature" />
        </div>
        <div class="p-4 space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Signed with</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              {{ decoded.header.alg || 'Unknown' }}
            </span>
          </div>
          <div>
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">Raw (base64url)</span>
            <code class="block text-sm font-mono text-gray-700 dark:text-gray-300 break-all bg-surface-secondary dark:bg-surface-dark-secondary p-3 rounded-lg leading-relaxed">{{ decoded.signature }}</code>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
            Signature verification requires the secret key or public key and is not performed client-side.
          </p>
        </div>
      </div>
    </div>

    <!-- Placeholder state (when no token and no examples visible) -->
    <div
      v-if="!decoded && !error && token.trim()"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-surface-dark-secondary flex items-center justify-center mb-4">
        <Key :size="24" class="text-gray-500" />
      </div>
      <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Decoding...</p>
    </div>
  </div>
</template>

<style>
.jwt-json-key { @apply text-purple-700 dark:text-purple-300; }
.jwt-json-string { @apply text-green-600 dark:text-green-400; }
.jwt-json-number { @apply text-blue-600 dark:text-blue-400; }
.jwt-json-boolean { @apply text-amber-600 dark:text-amber-400; }
.jwt-json-null { @apply text-gray-500 dark:text-gray-500 italic; }
</style>
