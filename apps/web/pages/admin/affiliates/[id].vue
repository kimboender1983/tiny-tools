<script setup lang="ts">
import type { IAffiliate } from '@tiny-tools/shared';

definePageMeta({ layout: 'admin', middleware: ['admin'] });

const cms = useCms();
const route = useRoute();
const id = route.params.id as string;

const loading = ref(true);
const saving = ref(false);
const error = ref('');

const form = reactive({
  name: '',
  slug: '',
  url: '',
  logo: '',
  description: '',
  programInfo: '',
  status: 'active' as 'active' | 'inactive',
});

async function loadAffiliate() {
  loading.value = true;
  error.value = '';

  try {
    const aff = await cms.affiliates.get(id);
    form.name = aff.name;
    form.slug = aff.slug;
    form.url = aff.url;
    form.logo = aff.logo || '';
    form.description = aff.description || '';
    form.programInfo = aff.programInfo || '';
    form.status = aff.status;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load affiliate.';
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (!form.name.trim() || !form.url.trim()) {
    error.value = 'Name and URL are required.';
    return;
  }

  saving.value = true;
  error.value = '';

  try {
    await cms.affiliates.update(id, {
      name: form.name,
      slug: form.slug,
      url: form.url,
      logo: form.logo || undefined,
      description: form.description || undefined,
      programInfo: form.programInfo || undefined,
      status: form.status,
    });
    error.value = '';
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to update affiliate.';
  } finally {
    saving.value = false;
  }
}

onMounted(loadAffiliate);
</script>

<template>
  <div>
    <div v-if="loading" class="text-sm text-content-muted">Loading affiliate...</div>

    <template v-else>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-content">Edit Affiliate</h1>
        <button
          :disabled="saving || !form.name || !form.url"
          class="px-4 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="save"
        >
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
      </div>

      <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
        {{ error }}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div class="lg:col-span-7 space-y-4">
          <div class="bg-surface border border-surface-border rounded-xl p-5 space-y-4">
            <div>
              <label class="block text-sm font-medium text-content-secondary mb-1">Company Name</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-content-secondary mb-1">Affiliate URL</label>
              <input
                v-model="form.url"
                type="url"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-content-secondary mb-1">Description</label>
              <textarea
                v-model="form.description"
                rows="2"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-y"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-content-secondary mb-1">Program Info (Markdown)</label>
              <AdminMarkdownEditor v-model="form.programInfo" placeholder="Commission rates, cookie duration, payment terms..." />
            </div>
          </div>
        </div>

        <div class="lg:col-span-3 space-y-4">
          <div class="bg-surface border border-surface-border rounded-xl p-5 space-y-4">
            <div>
              <label class="block text-sm font-medium text-content-secondary mb-1">Status</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-content-secondary mb-1">Slug</label>
              <input
                v-model="form.slug"
                type="text"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
              <p class="mt-1 text-xs text-content-muted">
                Use in posts: <code class="px-1 py-0.5 bg-surface-secondary rounded font-mono" v-text="`{{aff:${form.slug}}}`" />
              </p>
            </div>

            <div>
              <AdminMediaPicker v-model="form.logo" label="Logo" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
