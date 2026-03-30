<script setup lang="ts">
import { FileText, BookOpen, FolderOpen, Image, Plus } from 'lucide-vue-next';
import type { IPage, IBlogPost } from '@tiny-tools/shared';

definePageMeta({ layout: 'admin', middleware: ['admin'] });

const cms = useCms();

const loading = ref(true);
const error = ref('');

const stats = reactive({
  pages: 0,
  blogPosts: 0,
  categories: 0,
  media: 0,
});

const recentItems = ref<Array<{ type: 'page' | 'post'; title: string; id: string; updatedAt: Date }>>([]);

async function loadDashboard() {
  loading.value = true;
  error.value = '';

  try {
    const [pagesRes, postsRes, catsRes, mediaRes] = await Promise.all([
      cms.pages.list({ pageSize: 5 }),
      cms.blogPosts.list({ pageSize: 5 }),
      cms.categories.list({ pageSize: 1 }),
      cms.media.list({ pageSize: 1 }),
    ]);

    stats.pages = pagesRes.total;
    stats.blogPosts = postsRes.total;
    stats.categories = catsRes.total;
    stats.media = mediaRes.total;

    const pageItems = pagesRes.items.map((p: IPage) => ({
      type: 'page' as const,
      title: p.title,
      id: p._id,
      updatedAt: new Date(p.updatedAt),
    }));

    const postItems = postsRes.items.map((p: IBlogPost) => ({
      type: 'post' as const,
      title: p.title,
      id: p._id,
      updatedAt: new Date(p.updatedAt),
    }));

    recentItems.value = [...pageItems, ...postItems]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load dashboard data.';
  } finally {
    loading.value = false;
  }
}

const statCards = computed(() => [
  { label: 'Pages', value: stats.pages, icon: FileText, to: '/admin/pages' },
  { label: 'Blog Posts', value: stats.blogPosts, icon: BookOpen, to: '/admin/blog' },
  { label: 'Categories', value: stats.categories, icon: FolderOpen, to: '/admin/categories' },
  { label: 'Media', value: stats.media, icon: Image, to: '/admin/media' },
]);

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

onMounted(loadDashboard);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-50">Dashboard</h1>
      <div class="flex gap-2">
        <NuxtLink
          to="/admin/pages/new"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
        >
          <Plus :size="16" />
          New Page
        </NuxtLink>
        <NuxtLink
          to="/admin/blog/new"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors dark:border-surface-dark-border dark:text-gray-300 dark:hover:bg-surface-dark-secondary"
        >
          <Plus :size="16" />
          New Post
        </NuxtLink>
      </div>
    </div>

    <div v-if="error" class="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {{ error }}
    </div>

    <div v-if="loading" class="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <NuxtLink
          v-for="card in statCards"
          :key="card.label"
          :to="card.to"
          class="bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-xl p-5 hover:shadow-sm transition-shadow"
        >
          <div class="flex items-center justify-between mb-3">
            <component :is="card.icon" :size="20" class="text-gray-500" />
          </div>
          <p class="text-2xl font-bold text-gray-900 dark:text-gray-50">{{ card.value }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ card.label }}</p>
        </NuxtLink>
      </div>

      <div class="bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-xl">
        <div class="px-5 py-4 border-b border-surface-border dark:border-surface-dark-border">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-50">Recent Edits</h2>
        </div>
        <div v-if="recentItems.length === 0" class="p-5 text-sm text-gray-500 dark:text-gray-400">
          No content yet. Create your first page or blog post.
        </div>
        <ul v-else class="divide-y divide-surface-border dark:divide-surface-dark-border">
          <li v-for="item in recentItems" :key="item.id">
            <NuxtLink
              :to="item.type === 'page' ? `/admin/pages/${item.id}` : `/admin/blog/${item.id}`"
              class="flex items-center justify-between px-5 py-3 hover:bg-gray-100 dark:hover:bg-surface-dark-secondary transition-colors"
            >
              <div class="flex items-center gap-3">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  :class="item.type === 'page'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'"
                >
                  {{ item.type === 'page' ? 'Page' : 'Post' }}
                </span>
                <span class="text-sm text-gray-900 dark:text-gray-100">{{ item.title }}</span>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(item.updatedAt) }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
