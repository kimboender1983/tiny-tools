<script setup lang="ts">
    import type { ICategory, IPage } from "@tiny-tools/shared";
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
    const categories = ref<ICategory[]>([]);
    const selected = ref<Set<string>>(new Set());

    const allSelected = computed(() => pages.value.length > 0 && selected.value.size === pages.value.length);
    const someSelected = computed(() => selected.value.size > 0 && !allSelected.value);

    function toggleAll() {
        if (allSelected.value) selected.value = new Set();
        else selected.value = new Set(pages.value.map((p) => p._id));
    }

    function toggleOne(id: string) {
        const s = new Set(selected.value);
        if (s.has(id)) s.delete(id);
        else s.add(id);
        selected.value = s;
    }

    async function batchStatus(status: string) {
        if (selected.value.size === 0) return;
        try {
            const result = await cms.pages.batchUpdateStatus([...selected.value], status);
            toast.success(`${result.modifiedCount} page(s) updated to ${status}`);
            selected.value = new Set();
            await loadPages();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Batch update failed");
        }
    }

    const categoryMap = computed(() => {
        const map = new Map<string, string>();
        for (const cat of categories.value) {
            map.set(cat._id, cat.name);
        }
        return map;
    });

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
            const [res, catsRes] = await Promise.all([
                cms.pages.list({
                    page: currentPage.value,
                    pageSize: 20,
                    status: statusFilter.value || undefined,
                    search: search.value || undefined,
                }),
                categories.value.length === 0 ? cms.categories.list({ pageSize: 100 }) : null,
            ]);
            pages.value = res.items;
            total.value = res.total;
            if (catsRes) categories.value = catsRes.items;
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to load pages.";
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
            await loadPages();
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to delete page.";
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
      <h1 class="text-2xl font-bold text-content">Pages</h1>
      <NuxtLink
        to="/admin/pages/new"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
      >
        <Plus :size="16" />
        New Page
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
          placeholder="Search pages..."
          class="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          @input="onSearch"
        />
      </div>
    </div>

    <!-- Batch actions -->
    <div v-if="selected.size > 0" class="mb-3 flex items-center gap-2 p-2 rounded-lg bg-brand-50 border border-brand-200 text-sm">
      <span class="text-brand-700 font-medium">{{ selected.size }} selected</span>
      <div class="flex-1" />
      <button class="px-3 py-1 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700" @click="batchStatus('published')">Publish</button>
      <button class="px-3 py-1 rounded-md bg-yellow-500 text-white text-xs font-medium hover:bg-yellow-600" @click="batchStatus('draft')">Draft</button>
      <button class="px-3 py-1 rounded-md bg-gray-500 text-white text-xs font-medium hover:bg-gray-600" @click="batchStatus('archived')">Archive</button>
      <button class="px-3 py-1 rounded-md border border-divider text-content-tertiary text-xs hover:bg-surface-secondary" @click="selected = new Set()">Clear</button>
    </div>

    <!-- Table -->
    <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm text-content-muted">Loading...</div>
      <div v-else-if="pages.length === 0" class="p-8 text-center text-sm text-content-muted">No pages found.</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-border text-left">
            <th class="px-2 py-3 w-10" @click.stop>
              <input type="checkbox" :checked="allSelected" :indeterminate="someSelected" class="rounded border-gray-300 cursor-pointer" @change="toggleAll" />
            </th>
            <th class="px-4 py-3 font-medium text-content-muted">Title</th>
            <th class="px-4 py-3 font-medium text-content-muted">Slug</th>
            <th class="px-4 py-3 font-medium text-content-muted">Status</th>
            <th class="px-4 py-3 font-medium text-content-muted">Category</th>
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
            <td class="px-2 py-3" @click.stop>
              <input type="checkbox" :checked="selected.has(page._id)" class="rounded border-gray-300 cursor-pointer" @change="toggleOne(page._id)" />
            </td>
            <td class="px-4 py-3 font-medium text-content">{{ page.title }}</td>
            <td class="px-4 py-3 text-content-muted font-mono text-xs">{{ page.slug }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium" :class="statusClasses[page.status]">
                {{ page.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-content-muted">{{ page.category ? (categoryMap.get(page.category) || page.category) : '—' }}</td>
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
      Showing {{ pages.length }} of {{ total }} pages
    </div>
  </div>
</template>
