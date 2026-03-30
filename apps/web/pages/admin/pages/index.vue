<script setup lang="ts">
import { Plus, Trash2, Search } from 'lucide-vue-next';
import type { IPage } from '@tiny-tools/shared';

definePageMeta({ layout: 'admin', middleware: ['admin'] });

const cms = useCms();

const loading = ref(true);
const error = ref('');
const pages = ref<IPage[]>([]);
const total = ref(0);
const currentPage = ref(1);
const search = ref('');
const statusFilter = ref<string>('');
const deleteConfirmId = ref<string | null>(null);

const tabs = [
  { label: 'All', value: '' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

async function loadPages() {
  loading.value = true;
  error.value = '';

  try {
    const res = await cms.pages.list({
      page: currentPage.value,
      pageSize: 20,
      status: statusFilter.value || undefined,
      search: search.value || undefined,
    });
    pages.value = res.items;
    total.value = res.total;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load pages.';
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
    error.value = e instanceof Error ? e.message : 'Failed to delete page.';
  }
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusClasses: Record<string, string> = {
  published: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  draft: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

onMounted(loadPages);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-50">Pages</h1>
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
      <div class="flex gap-1 border border-surface-border dark:border-surface-dark-border rounded-lg p-0.5">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="px-3 py-1 text-sm rounded-md transition-colors"
          :class="statusFilter === tab.value
            ? 'bg-brand-500 text-white'
            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'"
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
          class="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none dark:bg-surface-dark-secondary dark:border-surface-dark-border dark:text-gray-100"
          @input="onSearch"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-xl overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading...</div>
      <div v-else-if="pages.length === 0" class="p-8 text-center text-sm text-gray-500 dark:text-gray-400">No pages found.</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-border dark:border-surface-dark-border text-left">
            <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Title</th>
            <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Slug</th>
            <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
            <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Category</th>
            <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Updated</th>
            <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-12"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border dark:divide-surface-dark-border">
          <tr
            v-for="page in pages"
            :key="page._id"
            class="hover:bg-gray-100 dark:hover:bg-surface-dark-secondary transition-colors cursor-pointer"
            @click="navigateTo(`/admin/pages/${page._id}`)"
          >
            <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{{ page.title }}</td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{{ page.slug }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium" :class="statusClasses[page.status]">
                {{ page.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ page.category || '—' }}</td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ formatDate(page.updatedAt) }}</td>
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
                  class="px-2 py-0.5 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-surface-dark-border dark:text-gray-400"
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

    <div v-if="total > 20" class="mt-4 text-sm text-gray-500 dark:text-gray-400">
      Showing {{ pages.length }} of {{ total }} pages
    </div>
  </div>
</template>
