<script setup lang="ts">
import { Plus, Pencil, Trash2, Check, X } from 'lucide-vue-next';
import type { IAuthor } from '@tiny-tools/shared';

definePageMeta({ layout: 'admin', middleware: ['admin'] });

const cms = useCms();

const loading = ref(true);
const error = ref('');
const authors = ref<IAuthor[]>([]);
const deleteConfirmId = ref<string | null>(null);
const editingId = ref<string | null>(null);

// New author form
const newForm = reactive({
  name: '',
  bio: '',
  avatar: '',
});

// Edit form
const editForm = reactive({
  name: '',
  bio: '',
  avatar: '',
});

const showAddForm = ref(false);

async function loadAuthors() {
  loading.value = true;
  error.value = '';

  try {
    authors.value = await cms.authors.list();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load authors.';
  } finally {
    loading.value = false;
  }
}

async function createAuthor() {
  if (!newForm.name) return;
  error.value = '';

  try {
    await cms.authors.create({
      name: newForm.name,
      bio: newForm.bio || undefined,
      avatar: newForm.avatar || undefined,
    });
    newForm.name = '';
    newForm.bio = '';
    newForm.avatar = '';
    showAddForm.value = false;
    await loadAuthors();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to create author.';
  }
}

function startEdit(author: IAuthor) {
  editingId.value = author._id;
  editForm.name = author.name;
  editForm.bio = author.bio || '';
  editForm.avatar = author.avatar || '';
}

function cancelEdit() {
  editingId.value = null;
}

async function saveEdit(id: string) {
  error.value = '';

  try {
    await cms.authors.update(id, {
      name: editForm.name,
      bio: editForm.bio || undefined,
      avatar: editForm.avatar || undefined,
    });
    editingId.value = null;
    await loadAuthors();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to update author.';
  }
}

async function deleteAuthor(id: string) {
  error.value = '';

  try {
    await cms.authors.delete(id);
    deleteConfirmId.value = null;
    await loadAuthors();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to delete author.';
  }
}

function truncate(text: string | undefined, length: number): string {
  if (!text) return '—';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

onMounted(loadAuthors);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-content">Authors</h1>
      <button
        v-if="!showAddForm"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
        @click="showAddForm = true"
      >
        <Plus :size="16" />
        Add Author
      </button>
    </div>

    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {{ error }}
    </div>

    <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <!-- Add new form -->
      <div v-if="showAddForm" class="px-4 py-3 bg-surface-secondary border-b border-surface-border">
        <form class="flex items-end gap-3" @submit.prevent="createAuthor">
          <div class="flex-1">
            <label class="block text-xs font-medium text-content-muted mb-1">Name</label>
            <input
              v-model="newForm.name"
              type="text"
              required
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Author name"
            />
          </div>
          <div class="flex-1">
            <label class="block text-xs font-medium text-content-muted mb-1">Bio</label>
            <input
              v-model="newForm.bio"
              type="text"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Short bio"
            />
          </div>
          <div class="w-48">
            <AdminMediaPicker v-model="newForm.avatar" label="Avatar" />
          </div>
          <div class="flex gap-1">
            <button
              type="submit"
              class="p-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
            >
              <Check :size="16" />
            </button>
            <button
              type="button"
              class="p-1.5 rounded-lg border border-divider text-content-tertiary hover:bg-surface-secondary transition-colors"
              @click="showAddForm = false"
            >
              <X :size="16" />
            </button>
          </div>
        </form>
      </div>

      <!-- Table -->
      <div v-if="loading" class="p-8 text-center text-sm text-content-muted">Loading...</div>
      <div v-else-if="authors.length === 0 && !showAddForm" class="p-8 text-center text-sm text-content-muted">No authors yet.</div>
      <table v-else-if="authors.length > 0" class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-border text-left">
            <th class="px-4 py-3 font-medium text-content-muted w-12">Avatar</th>
            <th class="px-4 py-3 font-medium text-content-muted">Name</th>
            <th class="px-4 py-3 font-medium text-content-muted">Bio</th>
            <th class="px-4 py-3 font-medium text-content-muted w-24">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border">
          <tr v-for="author in authors" :key="author._id">
            <!-- Display mode -->
            <template v-if="editingId !== author._id">
              <td class="px-4 py-3">
                <img
                  v-if="author.avatar"
                  :src="author.avatar"
                  :alt="author.name"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <div v-else class="w-8 h-8 rounded-full bg-[var(--color-switch-off)] flex items-center justify-center text-xs text-content-muted">
                  {{ author.name.charAt(0).toUpperCase() }}
                </div>
              </td>
              <td class="px-4 py-3 font-medium text-content">{{ author.name }}</td>
              <td class="px-4 py-3 text-content-muted">{{ truncate(author.bio, 80) }}</td>
              <td class="px-4 py-3">
                <div v-if="deleteConfirmId !== author._id" class="flex items-center gap-1">
                  <button
                    class="p-1 text-gray-500 hover:text-brand-500 transition-colors"
                    title="Edit"
                    @click="startEdit(author)"
                  >
                    <Pencil :size="14" />
                  </button>
                  <button
                    class="p-1 text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete"
                    @click="deleteConfirmId = author._id"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
                <div v-else class="flex items-center gap-1">
                  <button
                    class="px-2 py-0.5 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                    @click="deleteAuthor(author._id)"
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
            </template>

            <!-- Edit mode -->
            <template v-else>
              <td class="px-4 py-2">
                <AdminMediaPicker v-model="editForm.avatar" label="" />
              </td>
              <td class="px-4 py-2">
                <input
                  v-model="editForm.name"
                  type="text"
                  class="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </td>
              <td class="px-4 py-2">
                <input
                  v-model="editForm.bio"
                  type="text"
                  class="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </td>
              <td class="px-4 py-2">
                <div class="flex items-center gap-1">
                  <button
                    class="p-1 text-green-600 hover:text-green-700 transition-colors"
                    title="Save"
                    @click="saveEdit(author._id)"
                  >
                    <Check :size="16" />
                  </button>
                  <button
                    class="p-1 text-gray-500 hover:text-gray-600 transition-colors"
                    title="Cancel"
                    @click="cancelEdit"
                  >
                    <X :size="16" />
                  </button>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
