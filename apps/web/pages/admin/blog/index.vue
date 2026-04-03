<script setup lang="ts">
import { Plus, Trash2, Search, Star } from 'lucide-vue-next';
import type { IBlogPost, ICategory } from '@tiny-tools/shared';

definePageMeta({ layout: 'admin', middleware: ['admin'] });

const cms = useCms();

const loading = ref(true);
const error = ref('');
const posts = ref<IBlogPost[]>([]);
const categories = ref<ICategory[]>([]);
const total = ref(0);
const currentPage = ref(1);
const search = ref('');
const statusFilter = ref<string>('');
const categoryFilter = ref<string>('');
const deleteConfirmId = ref<string | null>(null);

const categoryMap = computed(() => {
  const map = new Map<string, ICategory>();
  for (const cat of categories.value) {
    map.set(cat._id, cat);
  }
  return map;
});

function getCategoryName(post: IBlogPost): string {
  const cat = post.category;
  if (!cat) return '';
  if (typeof cat === 'object') return cat.name;
  return categoryMap.value.get(cat)?.name ?? '';
}

const tabs = [
  { label: 'All', value: '' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

async function loadPosts() {
  loading.value = true;
  error.value = '';

  try {
    const res = await cms.blogPosts.list({
      page: currentPage.value,
      pageSize: 20,
      status: statusFilter.value || undefined,
      category: categoryFilter.value || undefined,
      search: search.value || undefined,
    });
    posts.value = res.items;
    total.value = res.total;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load blog posts.';
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  try {
    const res = await cms.categories.list({ pageSize: 100 });
    categories.value = res.items;
  } catch { /* non-critical */ }
}

function setFilter(value: string) {
  statusFilter.value = value;
  currentPage.value = 1;
  loadPosts();
}

function setCategoryFilter(value: string) {
  categoryFilter.value = value;
  currentPage.value = 1;
  loadPosts();
}

let searchTimeout: ReturnType<typeof setTimeout>;
function onSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadPosts();
  }, 300);
}

async function deletePost(id: string) {
  try {
    await cms.blogPosts.delete(id);
    deleteConfirmId.value = null;
    await loadPosts();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to delete post.';
  }
}

async function toggleFeatured(id: string) {
  try {
    await cms.blogPosts.toggleFeatured(id);
    const post = posts.value.find((p) => p._id === id);
    if (post) post.featured = !post.featured;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to toggle featured.';
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

onMounted(() => {
  loadCategories();
  loadPosts();
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-content">Blog Posts</h1>
      <NuxtLink
        to="/admin/blog/new"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
      >
        <Plus :size="16" />
        New Post
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
      <select
        v-model="categoryFilter"
        class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        @change="setCategoryFilter(categoryFilter)"
      >
        <option value="">All categories</option>
        <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
      </select>
      <div class="relative flex-1 max-w-xs">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          v-model="search"
          type="text"
          placeholder="Search posts..."
          class="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          @input="onSearch"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm text-content-muted">Loading...</div>
      <div v-else-if="posts.length === 0" class="p-8 text-center text-sm text-content-muted">No blog posts found.</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-border text-left">
            <th class="px-4 py-3 font-medium text-content-muted">Title</th>
            <th class="px-4 py-3 font-medium text-content-muted">Slug</th>
            <th class="px-4 py-3 font-medium text-content-muted">Category</th>
            <th class="px-4 py-3 font-medium text-content-muted">Status</th>
            <th class="px-4 py-3 font-medium text-content-muted">Updated</th>
            <th class="px-4 py-3 font-medium text-content-muted w-12"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border">
          <tr
            v-for="post in posts"
            :key="post._id"
            class="hover:bg-surface-secondary transition-colors cursor-pointer"
            @click="navigateTo(`/admin/blog/${post._id}`)"
          >
            <td class="px-4 py-3 font-medium text-content">{{ post.title }}</td>
            <td class="px-4 py-3 text-content-muted font-mono text-xs">{{ post.slug }}</td>
            <td class="px-4 py-3 text-content-muted text-xs">
              {{ getCategoryName(post) || '—' }}
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex px-2 py-0.5 rounded text-xs font-medium" :class="statusClasses[post.status]">
                {{ post.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-content-muted">{{ formatDate(post.updatedAt) }}</td>
            <td class="px-4 py-3" @click.stop>
              <div v-if="deleteConfirmId !== post._id" class="flex items-center gap-1">
                <button
                  class="p-1 transition-colors"
                  :class="post.featured ? 'text-amber-500 hover:text-amber-600' : 'text-gray-400 hover:text-amber-500'"
                  :title="post.featured ? 'Remove from featured' : 'Mark as featured'"
                  @click="toggleFeatured(post._id)"
                >
                  <Star :size="16" :fill="post.featured ? 'currentColor' : 'none'" />
                </button>
                <button
                  class="p-1 text-gray-500 hover:text-red-500 transition-colors"
                  title="Delete"
                  @click="deleteConfirmId = post._id"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
              <div v-else class="flex items-center gap-1">
                <button
                  class="px-2 py-0.5 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                  @click="deletePost(post._id)"
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
      Showing {{ posts.length }} of {{ total }} posts
    </div>
  </div>
</template>
