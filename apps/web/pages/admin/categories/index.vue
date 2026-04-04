<script setup lang="ts">
    import type { ICategory } from "@tiny-tools/shared";
    import * as icons from "lucide-vue-next";
    import { Check, Pencil, Plus, Trash2, X } from "lucide-vue-next";

    function getIcon(name: string | undefined) {
        if (!name) return null;
        return (icons as Record<string, unknown>)[name] ?? null;
    }

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();
    const toast = useToast();

    const loading = ref(true);
    const error = ref("");
    const categories = ref<ICategory[]>([]);
    const deleteConfirmId = ref<string | null>(null);
    const editingId = ref<string | null>(null);

    // New category form
    const newForm = reactive({
        name: "",
        slug: "",
        icon: "",
        order: 0,
    });

    // Edit form
    const editForm = reactive({
        name: "",
        slug: "",
        icon: "",
        order: 0,
    });

    const showAddForm = ref(false);

    function generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }

    async function loadCategories() {
        loading.value = true;
        error.value = "";

        try {
            const res = await cms.categories.list({ pageSize: 100 });
            categories.value = res.items;
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to load categories.";
        } finally {
            loading.value = false;
        }
    }

    async function createCategory() {
        if (!newForm.name) return;
        error.value = "";

        try {
            await cms.categories.create({
                name: newForm.name,
                slug: newForm.slug || generateSlug(newForm.name),
                icon: newForm.icon || undefined,
                order: newForm.order,
                seo: { metaTitle: newForm.name, metaDescription: "" },
            });
            newForm.name = "";
            newForm.slug = "";
            newForm.icon = "";
            newForm.order = 0;
            showAddForm.value = false;
            toast.success("Category created");
            await loadCategories();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to create category.");
        }
    }

    function startEdit(cat: ICategory) {
        editingId.value = cat._id;
        editForm.name = cat.name;
        editForm.slug = cat.slug;
        editForm.icon = cat.icon || "";
        editForm.order = cat.order;
    }

    function cancelEdit() {
        editingId.value = null;
    }

    async function saveEdit(id: string) {
        error.value = "";

        try {
            await cms.categories.update(id, {
                name: editForm.name,
                slug: editForm.slug,
                icon: editForm.icon || undefined,
                order: editForm.order,
            });
            editingId.value = null;
            toast.success("Category updated");
            await loadCategories();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to update category.");
        }
    }

    async function deleteCategory(id: string) {
        error.value = "";

        try {
            await cms.categories.delete(id);
            deleteConfirmId.value = null;
            toast.success("Category deleted");
            await loadCategories();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to delete category.");
        }
    }

    onMounted(loadCategories);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-content">Categories</h1>
      <button
        v-if="!showAddForm"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
        @click="showAddForm = true"
      >
        <Plus :size="16" />
        Add Category
      </button>
    </div>

    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {{ error }}
    </div>

    <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <!-- Add new form -->
      <div v-if="showAddForm" class="px-4 py-3 bg-surface-secondary border-b border-surface-border">
        <form class="flex items-end gap-3" @submit.prevent="createCategory">
          <div class="flex-1">
            <label class="block text-xs font-medium text-content-muted mb-1">Name</label>
            <input
              v-model="newForm.name"
              type="text"
              required
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="Category name"
              @input="newForm.slug = generateSlug(newForm.name)"
            />
          </div>
          <div class="flex-1">
            <label class="block text-xs font-medium text-content-muted mb-1">Slug</label>
            <input
              v-model="newForm.slug"
              type="text"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>
          <div class="w-48">
            <AdminIconPicker v-model="newForm.icon" label="Icon" />
          </div>
          <div class="w-20">
            <label class="block text-xs font-medium text-content-muted mb-1">Order</label>
            <input
              v-model.number="newForm.order"
              type="number"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
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
      <div v-else-if="categories.length === 0 && !showAddForm" class="p-8 text-center text-sm text-content-muted">No categories yet.</div>
      <table v-else-if="categories.length > 0" class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-border text-left">
            <th class="px-4 py-3 font-medium text-content-muted">Name</th>
            <th class="px-4 py-3 font-medium text-content-muted">Slug</th>
            <th class="px-4 py-3 font-medium text-content-muted w-24">Icon</th>
            <th class="px-4 py-3 font-medium text-content-muted w-20">Order</th>
            <th class="px-4 py-3 font-medium text-content-muted w-24">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border">
          <tr v-for="cat in categories" :key="cat._id">
            <!-- Display mode -->
            <template v-if="editingId !== cat._id">
              <td class="px-4 py-3 font-medium text-content">{{ cat.name }}</td>
              <td class="px-4 py-3 text-content-muted font-mono text-xs">{{ cat.slug }}</td>
              <td class="px-4 py-3">
                <component :is="getIcon(cat.icon)" v-if="cat.icon && getIcon(cat.icon)" :size="18" class="text-content-tertiary" />
                <span v-else class="text-content-muted">—</span>
              </td>
              <td class="px-4 py-3 text-content-muted">{{ cat.order }}</td>
              <td class="px-4 py-3">
                <div v-if="deleteConfirmId !== cat._id" class="flex items-center gap-1">
                  <button
                    class="p-1 text-gray-500 hover:text-brand-500 transition-colors"
                    title="Edit"
                    @click="startEdit(cat)"
                  >
                    <Pencil :size="14" />
                  </button>
                  <button
                    class="p-1 text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete"
                    @click="deleteConfirmId = cat._id"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
                <div v-else class="flex items-center gap-1">
                  <button
                    class="px-2 py-0.5 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                    @click="deleteCategory(cat._id)"
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
                <input
                  v-model="editForm.name"
                  type="text"
                  class="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </td>
              <td class="px-4 py-2">
                <input
                  v-model="editForm.slug"
                  type="text"
                  class="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </td>
              <td class="px-4 py-2">
                <AdminIconPicker v-model="editForm.icon" />
              </td>
              <td class="px-4 py-2">
                <input
                  v-model.number="editForm.order"
                  type="number"
                  class="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </td>
              <td class="px-4 py-2">
                <div class="flex items-center gap-1">
                  <button
                    class="p-1 text-green-600 hover:text-green-700 transition-colors"
                    title="Save"
                    @click="saveEdit(cat._id)"
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
