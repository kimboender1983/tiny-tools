<script setup lang="ts">
    import type { IApiKey } from "@tiny-tools/shared";
    import { Check, Copy, Eye, EyeOff, Key, Plus, Power, Trash2 } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();
    const toast = useToast();
    const config = useRuntimeConfig();

    const loading = ref(true);
    const apiKeys = ref<IApiKey[]>([]);
    const deleteConfirmId = ref<string | null>(null);
    const showAddForm = ref(false);
    const newKeyName = ref("");
    const revealedKeys = ref<Set<string>>(new Set());
    const copiedId = ref<string | null>(null);

    async function loadKeys() {
        loading.value = true;
        try {
            apiKeys.value = await cms.apiKeys.list();
        } catch {
            toast.error("Failed to load API keys");
        } finally {
            loading.value = false;
        }
    }

    async function createKey() {
        if (!newKeyName.value.trim()) return;
        try {
            const key = await cms.apiKeys.create(newKeyName.value.trim());
            revealedKeys.value.add(key._id);
            newKeyName.value = "";
            showAddForm.value = false;
            toast.success("API key created. Copy it now — it won't be shown in full again.");
            await loadKeys();
        } catch {
            toast.error("Failed to create API key");
        }
    }

    async function toggleKey(id: string) {
        try {
            await cms.apiKeys.toggle(id);
            toast.success("API key toggled");
            await loadKeys();
        } catch {
            toast.error("Failed to toggle API key");
        }
    }

    async function deleteKey(id: string) {
        try {
            await cms.apiKeys.delete(id);
            deleteConfirmId.value = null;
            toast.success("API key deleted");
            await loadKeys();
        } catch {
            toast.error("Failed to delete API key");
        }
    }

    function maskKey(key: string): string {
        return `${key.slice(0, 7)}${"•".repeat(20)}${key.slice(-4)}`;
    }

    async function copyKey(key: string, id: string) {
        await navigator.clipboard.writeText(key);
        copiedId.value = id;
        toast.success("Copied to clipboard");
        setTimeout(() => { copiedId.value = null; }, 2000);
    }

    function toggleReveal(id: string) {
        if (revealedKeys.value.has(id)) {
            revealedKeys.value.delete(id);
        } else {
            revealedKeys.value.add(id);
        }
    }

    function formatDate(d: string | Date | undefined): string {
        if (!d) return "Never";
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    onMounted(loadKeys);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-content">API Keys</h1>
        <p class="text-sm text-content-muted mt-1">Manage API keys for external integrations (e.g. Claude scheduled tasks)</p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin/api-keys/docs"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-brand-500 text-brand-500 hover:bg-brand-50 transition-colors"
        >
          API Docs
        </NuxtLink>
        <button
          v-if="!showAddForm"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
          @click="showAddForm = true"
        >
          <Plus :size="16" />
          Create Key
        </button>
      </div>
    </div>

    <!-- Endpoint docs -->
    <div class="mb-6 p-4 rounded-xl border border-surface-border bg-surface">
      <h3 class="text-sm font-semibold text-content mb-2">Blog Post API</h3>
      <div class="space-y-2 text-xs text-content-muted font-mono">
        <p><span class="text-green-600 font-semibold">POST</span> {{ config.public.apiUrl }}/api/v1/blog</p>
        <p><span class="text-green-600 font-semibold">POST</span> {{ config.public.apiUrl }}/api/v1/blog/model <span class="text-content-faint font-sans">— returns accepted fields</span></p>
        <p class="font-sans">Header: <code class="bg-surface-secondary px-1.5 py-0.5 rounded">Authorization: Bearer pb_xxxx...</code></p>
      </div>
      <div class="mt-3 text-xs text-content-muted">
        <p class="font-semibold text-content-secondary mb-1">Required fields:</p>
        <p><code class="text-brand-500">title</code> (string), <code class="text-brand-500">content</code> (markdown string), <code class="text-brand-500">excerpt</code> (string)</p>
        <p class="font-semibold text-content-secondary mt-2 mb-1">Optional fields:</p>
        <p>slug, coverImage, category (ID), tags (string[]), status ("draft"|"published"), author (ID), techLogo (ID), techLogoColor, techLogoBgColor, techLogoBgColorTo, techLogoPickboxColor, techLogoTitleColor, seo (object), faq (array), publishedAt (ISO date)</p>
      </div>
    </div>

    <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <!-- Add form -->
      <div v-if="showAddForm" class="px-4 py-3 bg-surface-secondary border-b border-surface-border">
        <form class="flex items-end gap-3" @submit.prevent="createKey">
          <div class="flex-1">
            <label class="block text-xs font-medium text-content-muted mb-1">Key Name</label>
            <input
              v-model="newKeyName"
              type="text"
              required
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="e.g. Claude Blog Writer"
            />
          </div>
          <div class="flex gap-1">
            <button type="submit" class="p-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors">
              <Check :size="16" />
            </button>
            <button type="button" class="p-1.5 rounded-lg border border-divider text-content-tertiary hover:bg-surface-secondary transition-colors" @click="showAddForm = false">
              <span class="text-xs px-1">Cancel</span>
            </button>
          </div>
        </form>
      </div>

      <!-- List -->
      <div v-if="loading" class="p-8 text-center text-sm text-content-muted">Loading...</div>
      <div v-else-if="apiKeys.length === 0 && !showAddForm" class="p-8 text-center text-sm text-content-muted">
        <Key :size="24" class="mx-auto mb-2 text-content-faint" />
        No API keys yet. Create one to enable external blog post creation.
      </div>
      <table v-else-if="apiKeys.length > 0" class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-border text-left">
            <th class="px-4 py-3 font-medium text-content-muted">Name</th>
            <th class="px-4 py-3 font-medium text-content-muted">Key</th>
            <th class="px-4 py-3 font-medium text-content-muted w-20">Status</th>
            <th class="px-4 py-3 font-medium text-content-muted w-32">Last Used</th>
            <th class="px-4 py-3 font-medium text-content-muted w-28">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border">
          <tr v-for="key in apiKeys" :key="key._id">
            <td class="px-4 py-3 font-medium text-content">{{ key.name }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1.5">
                <code class="text-xs text-content-muted bg-surface-secondary px-2 py-0.5 rounded font-mono">
                  {{ revealedKeys.has(key._id) ? key.key : maskKey(key.key) }}
                </code>
                <button class="p-0.5 text-gray-400 hover:text-gray-600" @click="toggleReveal(key._id)" :title="revealedKeys.has(key._id) ? 'Hide' : 'Reveal'">
                  <EyeOff v-if="revealedKeys.has(key._id)" :size="12" />
                  <Eye v-else :size="12" />
                </button>
                <button class="p-0.5 text-gray-400 hover:text-brand-500" @click="copyKey(key.key, key._id)" title="Copy">
                  <Check v-if="copiedId === key._id" :size="12" class="text-green-500" />
                  <Copy v-else :size="12" />
                </button>
              </div>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="key.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ key.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-4 py-3 text-xs text-content-muted">{{ formatDate(key.lastUsedAt) }}</td>
            <td class="px-4 py-3">
              <div v-if="deleteConfirmId !== key._id" class="flex items-center gap-1">
                <button class="p-1 text-gray-500 hover:text-amber-500 transition-colors" title="Toggle active" @click="toggleKey(key._id)">
                  <Power :size="14" />
                </button>
                <button class="p-1 text-gray-500 hover:text-red-500 transition-colors" title="Delete" @click="deleteConfirmId = key._id">
                  <Trash2 :size="14" />
                </button>
              </div>
              <div v-else class="flex items-center gap-1">
                <button class="px-2 py-0.5 text-xs rounded bg-red-500 text-white hover:bg-red-600" @click="deleteKey(key._id)">Delete</button>
                <button class="px-2 py-0.5 text-xs rounded border border-divider text-content-tertiary hover:bg-surface-secondary" @click="deleteConfirmId = null">Cancel</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
