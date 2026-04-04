<script setup lang="ts">
    import type { IPage } from "@tiny-tools/shared";
    import { Plus, Search, Trash2 } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();
    const toast = useToast();

    const loading = ref(true);
    const error = ref("");
    const pages = ref<IPage[]>([]);
    const total = ref(0);
    const currentPage = ref(1);
    const search = ref("");
    const statusFilter = ref<string>("");
    const deleteConfirmId = ref<string | null>(null);

    const tabs = [
        { label: "All", value: "" },
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
        { label: "Archived", value: "archived" },
    ];

    async function loadPages() {
        loading.value = true;
        error.value = "";

        try {
            const res = await cms.pages.list({
                page: currentPage.value,
                pageSize: 20,
                status: statusFilter.value || undefined,
                search: search.value || undefined,
                template: "tool",
            });
            pages.value = res.items;
            total.value = res.total;
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to load tools.";
        } finally {
            loading.value = false;
        }
    }

    function setFilter(value: string) {
        statusFilter.value = value;
        currentPage.value = 1;
        loadPages();
    }

    let searchTimeout: ReturnType<typeof setTimeout>;
    function onSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentPage.value = 1;
            loadPages();
        }, 300);
    }

    async function deletePage(id: string) {
        try {
            await cms.pages.delete(id);
            deleteConfirmId.value = null;
            toast.success("Tool page deleted");
            await loadPages();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to delete tool page.");
        }
    }

    function formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    const statusClasses: Record<string, string> = {
        published: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
        draft: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
        archived: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    };

    onMounted(loadPages);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-content">Tools</h1>
      <NuxtLink
        to="/admin/pages/new?template=tool"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
      >
        <Plus :size="16" />
        New Tool
      </NuxtLink>
    </div>

    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {{ error }}
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      <div class="flex gap-1 border border-surface-border rounded-lg p-0.5">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="px-3 py-1 text-sm rounded-md transition-colors"
          :class="statusFilter === tab.value
            ? 'bg-brand-500 text-white'
            : 'text-content-tertiary hover:text-content'"
          @click="setFilter(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="relative flex-1 max-w-xs">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          v-model="search"
          type="text"
          placeholder="Search tools..."
          class="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          @input="onSearch"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm text-content-muted">Loading...</div>
      <div v-else-if="pages.length === 0" class="p-8 text-center text-sm text-content-muted">No tool pages found.</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-border text-left">
            <th class="px-4 py-3 font-medium text-content-muted">Title</th>
            <th class="px-4 py-3 font-medium text-content-muted">Slug</th>
            <th class="px-4 py-3 font-medium text-content-muted">Nav</th>
            <th class="px-4 py-3 font-medium text-content-muted">Status</th>
            <th class="px-4 py-3 font-medium text-content-muted">Updated</th>
            <th class="px-4 py-3 font-medium text-content-muted w-12"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border">
          <tr
            v-for="page in pages"
            :key="page._id"
            class="hover:bg-surface-secondary transition-colors cursor-pointer"
            @click="navigateTo(`/admin/pages/${page._id}`)"
          >
            <td class="px-4 py-3 font-medium text-content">{{ page.title }}</td>
            <td class="px-4 py-3 text-content-muted font-mono text-xs">/tools/{{ page.slug }}</td>
            <td class="px-4 py-3 text-content-muted text-xs capitalize">{{ page.navPlacement || '—' }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium" :class="statusClasses[page.status]">
                {{ page.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-content-muted">{{ formatDate(page.updatedAt) }}</td>
            <td class="px-4 py-3" @click.stop>
              <button
                v-if="deleteConfirmId !== page._id"
                class="p-1 text-gray-500 hover:text-red-500 transition-colors"
                title="Delete"
                @click="deleteConfirmId = page._id"
              >
                <Trash2 :size="16" />
              </button>
              <div v-else class="flex items-center gap-1">
                <button
                  class="px-2 py-0.5 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                  @click="deletePage(page._id)"
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

    <div v-if="total > 20" class="mt-4 text-sm text-content-muted">
      Showing {{ pages.length }} of {{ total }} tools
    </div>
  </div>
</template>
