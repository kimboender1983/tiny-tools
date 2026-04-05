<script setup lang="ts">
    import { ArrowLeft, Check, Copy, ExternalLink, RefreshCw } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const config = useRuntimeConfig();
    const api = useApi();
    const apiUrl = config.public.apiUrl;
    const copiedBlock = ref<string | null>(null);
    const schema = ref<Record<string, unknown> | null>(null);
    const schemaLoading = ref(false);
    const schemaError = ref("");
    const apiKeys = ref<Array<{ key: string }>>([]);

    async function loadApiKeys() {
        try {
            const cms = useCms();
            const keys = await cms.apiKeys.list();
            apiKeys.value = keys.filter((k) => k.active);
        } catch { /* silent */ }
    }

    async function loadSchema() {
        schemaLoading.value = true;
        schemaError.value = "";
        try {
            // Use an active API key to fetch the schema
            if (apiKeys.value.length === 0) {
                schemaError.value = "No active API keys. Create one first to fetch the live schema.";
                return;
            }
            const key = apiKeys.value[0].key;
            const data = await $fetch<Record<string, unknown>>(`${apiUrl}/api/v1/blog/schema`, {
                headers: { Authorization: `Bearer ${key}` },
            });
            schema.value = data;
        } catch (e: unknown) {
            schemaError.value = e instanceof Error ? e.message : "Failed to fetch schema";
        } finally {
            schemaLoading.value = false;
        }
    }

    async function copyCode(code: string, id: string) {
        await navigator.clipboard.writeText(code);
        copiedBlock.value = id;
        setTimeout(() => { copiedBlock.value = null; }, 2000);
    }

    function isRequired(key: string): boolean {
        const req = (schema.value as any)?.required;
        return Array.isArray(req) && req.includes(key);
    }

    onMounted(async () => {
        await loadApiKeys();
        await loadSchema();
    });

    const curlExample = computed(() => {
        const key = apiKeys.value[0]?.key || "pb_your_key_here";
        return `curl -X POST ${apiUrl}/api/v1/blog \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Getting Started with Vue 3",
    "content": "# Introduction\\n\\nVue 3 introduces...",
    "excerpt": "Learn Vue 3 Composition API.",
    "tags": ["vue", "javascript"],
    "status": "draft"
  }'`;
    });

    const curlSchema = computed(() => {
        const key = apiKeys.value[0]?.key || "pb_your_key_here";
        return `curl ${apiUrl}/api/v1/blog/schema \\
  -H "Authorization: Bearer ${key}"`;
    });
</script>

<template>
  <div class="max-w-3xl">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/api-keys" class="p-1.5 rounded-lg text-content-muted hover:bg-surface-secondary transition-colors">
        <ArrowLeft :size="18" />
      </NuxtLink>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-content">API Documentation</h1>
        <p class="text-sm text-content-muted">Blog Post Creation API — schema auto-generated from server DTOs</p>
      </div>
      <a
        :href="`${apiUrl}/docs`"
        target="_blank"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-surface-border text-content-secondary hover:bg-surface-secondary transition-colors"
      >
        Swagger UI <ExternalLink :size="14" />
      </a>
    </div>

    <!-- Auth -->
    <div class="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm">
      <p class="font-semibold text-amber-800 mb-1">Authentication</p>
      <p class="text-amber-700">All API endpoints require a Bearer token:</p>
      <code class="block mt-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-900 text-xs font-mono">Authorization: Bearer pb_your_key_here</code>
    </div>

    <!-- Endpoints overview -->
    <div class="mb-6 p-4 rounded-xl border border-surface-border bg-surface space-y-2 text-sm font-mono">
      <p><span class="text-green-600 font-bold">POST</span> <span class="text-content">/api/v1/blog</span> <span class="text-content-faint font-sans text-xs ml-2">Create blog post</span></p>
      <p><span class="text-blue-600 font-bold">GET&nbsp;</span> <span class="text-content">/api/v1/blog/schema</span> <span class="text-content-faint font-sans text-xs ml-2">Get live schema (this page fetches it)</span></p>
      <p><span class="text-blue-600 font-bold">GET&nbsp;</span> <span class="text-content">/content/categories</span> <span class="text-content-faint font-sans text-xs ml-2">List categories (public, for IDs)</span></p>
      <p><span class="text-blue-600 font-bold">GET&nbsp;</span> <span class="text-content">/content/tech-logos</span> <span class="text-content-faint font-sans text-xs ml-2">List tech logos (public, for IDs)</span></p>
      <p><span class="text-blue-600 font-bold">GET&nbsp;</span> <span class="text-content">/docs</span> <span class="text-content-faint font-sans text-xs ml-2">Swagger UI</span></p>
      <p><span class="text-blue-600 font-bold">GET&nbsp;</span> <span class="text-content">/docs-json</span> <span class="text-content-faint font-sans text-xs ml-2">OpenAPI JSON spec</span></p>
    </div>

    <!-- Live Schema -->
    <div class="mb-6 rounded-xl border border-surface-border bg-surface overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <h3 class="text-sm font-semibold text-content">Blog Post Schema <span class="text-xs font-normal text-content-faint">(live from server)</span></h3>
        <button class="text-xs text-content-faint hover:text-content-muted flex items-center gap-1" @click="loadSchema" :disabled="schemaLoading">
          <RefreshCw :size="12" :class="schemaLoading ? 'animate-spin' : ''" />
          Refresh
        </button>
      </div>

      <div v-if="schemaLoading" class="p-6 text-center text-sm text-content-muted">Loading schema from server...</div>
      <div v-else-if="schemaError" class="p-4 text-sm text-red-600">{{ schemaError }}</div>
      <div v-else-if="schema?.properties" class="divide-y divide-surface-border">
        <div
          v-for="(prop, key) in (schema.properties as Record<string, any>)"
          :key="key"
          class="px-4 py-2.5 flex items-start gap-3 text-xs"
        >
          <div class="w-40 flex-shrink-0">
            <code class="font-mono" :class="isRequired(key as string) ? 'text-brand-500 font-semibold' : 'text-content-tertiary'">{{ key }}</code>
            <span v-if="isRequired(key as string)" class="ml-1 text-red-400">*</span>
          </div>
          <div class="w-16 flex-shrink-0 text-content-faint">{{ prop.type || 'string' }}</div>
          <div class="flex-1 text-content-secondary">
            {{ prop.description }}
            <span v-if="prop.example !== undefined" class="block mt-0.5 text-content-faint">
              Example: <code class="bg-surface-secondary px-1 rounded">{{ typeof prop.example === 'object' ? JSON.stringify(prop.example) : prop.example }}</code>
            </span>
            <span v-if="prop.enum" class="block mt-0.5 text-content-faint">
              Values: <code v-for="v in prop.enum" :key="v" class="bg-surface-secondary px-1 rounded mr-1">{{ v }}</code>
            </span>
            <span v-if="prop.default !== undefined" class="block mt-0.5 text-content-faint">
              Default: <code class="bg-surface-secondary px-1 rounded">{{ prop.default }}</code>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Example request -->
    <div class="mb-6 rounded-xl border border-surface-border bg-surface overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <h3 class="text-sm font-semibold text-content">Example: Create Blog Post</h3>
        <button class="text-xs text-content-faint hover:text-content-muted flex items-center gap-1" @click="copyCode(curlExample, 'curl')">
          <Check v-if="copiedBlock === 'curl'" :size="12" class="text-green-500" />
          <Copy v-else :size="12" />
          Copy
        </button>
      </div>
      <pre class="p-4 bg-gray-900 text-gray-100 text-xs font-mono overflow-x-auto whitespace-pre">{{ curlExample }}</pre>
    </div>

    <!-- Schema fetch example -->
    <div class="mb-6 rounded-xl border border-surface-border bg-surface overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <h3 class="text-sm font-semibold text-content">Example: Fetch Schema (for Claude)</h3>
        <button class="text-xs text-content-faint hover:text-content-muted flex items-center gap-1" @click="copyCode(curlSchema, 'curl-schema')">
          <Check v-if="copiedBlock === 'curl-schema'" :size="12" class="text-green-500" />
          <Copy v-else :size="12" />
          Copy
        </button>
      </div>
      <pre class="p-4 bg-gray-900 text-gray-100 text-xs font-mono overflow-x-auto whitespace-pre">{{ curlSchema }}</pre>
    </div>

    <!-- Claude tip -->
    <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
      <p class="font-semibold mb-1">Workflow for Claude</p>
      <ol class="list-decimal list-inside space-y-1 text-xs">
        <li>Call <code class="bg-blue-100 px-1 rounded">GET /api/v1/blog/schema</code> to discover all accepted fields and their types</li>
        <li>Call <code class="bg-blue-100 px-1 rounded">GET /content/categories</code> and <code class="bg-blue-100 px-1 rounded">GET /content/tech-logos</code> to get valid IDs</li>
        <li>Call <code class="bg-blue-100 px-1 rounded">POST /api/v1/blog</code> with the blog post data</li>
        <li>When the schema changes (new fields added), step 1 will automatically reflect them</li>
      </ol>
    </div>
  </div>
</template>
