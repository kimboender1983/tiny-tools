<script setup lang="ts">
    import type { IAffiliate } from "@tiny-tools/shared";
    import { BarChart3, ExternalLink, Plus, Trash2 } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();

    const loading = ref(true);
    const error = ref("");
    const affiliates = ref<IAffiliate[]>([]);
    const deleteConfirmId = ref<string | null>(null);

    async function loadAffiliates() {
        loading.value = true;
        error.value = "";

        try {
            const res = await cms.affiliates.list({ pageSize: 100 });
            affiliates.value = res.items;
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to load affiliates.";
        } finally {
            loading.value = false;
        }
    }

    async function deleteAffiliate(id: string) {
        try {
            await cms.affiliates.delete(id);
            deleteConfirmId.value = null;
            await loadAffiliates();
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to delete affiliate.";
        }
    }

    const statusClasses: Record<string, string> = {
        active: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
        inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    };

    onMounted(loadAffiliates);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-content">Affiliates</h1>
      <div class="flex gap-2">
        <NuxtLink
          to="/admin/affiliates/analytics"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-divider text-content-secondary hover:bg-surface-secondary transition-colors"
        >
          <BarChart3 :size="16" />
          Analytics
        </NuxtLink>
        <NuxtLink
          to="/admin/affiliates/new"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
        >
          <Plus :size="16" />
          Add Affiliate
        </NuxtLink>
      </div>
    </div>

    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {{ error }}
    </div>

    <div class="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
      Use <code class="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 font-mono text-xs" v-text="'{{aff:slug}}'" /> or
      <code class="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 font-mono text-xs" v-text="'{{aff:slug|custom text}}'" />
      in blog posts and pages to insert tracked affiliate links.
    </div>

    <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm text-content-muted">Loading...</div>
      <div v-else-if="affiliates.length === 0" class="p-8 text-center text-sm text-content-muted">No affiliates yet.</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-border text-left">
            <th class="px-4 py-3 font-medium text-content-muted">Name</th>
            <th class="px-4 py-3 font-medium text-content-muted">Slug</th>
            <th class="px-4 py-3 font-medium text-content-muted">URL</th>
            <th class="px-4 py-3 font-medium text-content-muted">Status</th>
            <th class="px-4 py-3 font-medium text-content-muted w-24"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border">
          <tr
            v-for="aff in affiliates"
            :key="aff._id"
            class="hover:bg-surface-secondary transition-colors cursor-pointer"
            @click="navigateTo(`/admin/affiliates/${aff._id}`)"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <img v-if="aff.logo" :src="aff.logo" :alt="aff.name" class="w-6 h-6 rounded object-contain" />
                <span class="font-medium text-content">{{ aff.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-content-muted font-mono text-xs">{{ aff.slug }}</td>
            <td class="px-4 py-3 text-content-muted text-xs max-w-xs truncate">
              <a :href="aff.url" target="_blank" rel="noopener" class="hover:text-brand-500 inline-flex items-center gap-1" @click.stop>
                {{ aff.url }}
                <ExternalLink :size="10" />
              </a>
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium" :class="statusClasses[aff.status]">
                {{ aff.status }}
              </span>
            </td>
            <td class="px-4 py-3" @click.stop>
              <button
                v-if="deleteConfirmId !== aff._id"
                class="p-1 text-gray-500 hover:text-red-500 transition-colors"
                title="Delete"
                @click="deleteConfirmId = aff._id"
              >
                <Trash2 :size="16" />
              </button>
              <div v-else class="flex items-center gap-1">
                <button
                  class="px-2 py-0.5 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                  @click="deleteAffiliate(aff._id)"
                >
                  Delete
                </button>
                <button
                  class="px-2 py-0.5 text-xs rounded border border-divider text-content-tertiary hover:bg-surface-secondary"
                  @click="deleteConfirmId = null"
                >
                  Cancel
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
