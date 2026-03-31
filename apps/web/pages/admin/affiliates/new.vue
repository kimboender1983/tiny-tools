<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['admin'] });

const cms = useCms();
const router = useRouter();

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

const slugManuallyEdited = ref(false);

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function onNameInput() {
  if (!slugManuallyEdited.value) {
    form.slug = generateSlug(form.name);
  }
}

function onSlugInput() {
  slugManuallyEdited.value = true;
}

async function save() {
  if (!form.name.trim() || !form.url.trim()) {
    error.value = 'Name and URL are required.';
    return;
  }

  saving.value = true;
  error.value = '';

  try {
    const created = await cms.affiliates.create({
      name: form.name,
      slug: form.slug || undefined,
      url: form.url,
      logo: form.logo || undefined,
      description: form.description || undefined,
      programInfo: form.programInfo || undefined,
      status: form.status,
    });
    await router.push(`/admin/affiliates/${created._id}`);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to create affiliate.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-50">New Affiliate</h1>
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
        <div class="bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-xl p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none dark:bg-surface-dark-secondary dark:border-surface-dark-border dark:text-gray-100"
              placeholder="e.g. Vercel"
              @input="onNameInput"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Affiliate URL</label>
            <input
              v-model="form.url"
              type="url"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none dark:bg-surface-dark-secondary dark:border-surface-dark-border dark:text-gray-100"
              placeholder="https://vercel.com/?ref=tinytools"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-y dark:bg-surface-dark-secondary dark:border-surface-dark-border dark:text-gray-100"
              placeholder="Short description of the company..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Info (Markdown)</label>
            <AdminMarkdownEditor v-model="form.programInfo" placeholder="Commission rates, cookie duration, payment terms..." />
          </div>
        </div>
      </div>

      <div class="lg:col-span-3 space-y-4">
        <div class="bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-xl p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              v-model="form.status"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none dark:bg-surface-dark-secondary dark:border-surface-dark-border dark:text-gray-100"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
            <input
              v-model="form.slug"
              type="text"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none dark:bg-surface-dark-secondary dark:border-surface-dark-border dark:text-gray-100"
              @input="onSlugInput"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use in posts: <code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono" v-text="`{{aff:${form.slug || '...'}}}`" />
            </p>
          </div>

          <div>
            <AdminMediaPicker v-model="form.logo" label="Logo" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
