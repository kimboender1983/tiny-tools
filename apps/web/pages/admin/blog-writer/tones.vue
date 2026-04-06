<script setup lang="ts">
    import type { IWritingTone } from "@tiny-tools/shared";
    import { ArrowLeft, Check, Pencil, Plus, Star, Trash2, X } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();
    const toast = useToast();

    const loading = ref(true);
    const tones = ref<IWritingTone[]>([]);
    const editingId = ref<string | null>(null);
    const showAddForm = ref(false);
    const deleteConfirmId = ref<string | null>(null);

    const newForm = reactive({ name: "", content: "", isDefault: false });
    const editForm = reactive({ name: "", content: "", isDefault: false });

    async function loadTones() {
        loading.value = true;
        try {
            tones.value = await cms.blogWriter.tones.list();
        } catch {
            toast.error("Failed to load tones");
        } finally {
            loading.value = false;
        }
    }

    async function createTone() {
        if (!newForm.name || !newForm.content) return;
        try {
            await cms.blogWriter.tones.create(newForm);
            newForm.name = "";
            newForm.content = "";
            newForm.isDefault = false;
            showAddForm.value = false;
            toast.success("Tone created");
            await loadTones();
        } catch {
            toast.error("Failed to create tone");
        }
    }

    function startEdit(tone: IWritingTone) {
        editingId.value = tone._id;
        editForm.name = tone.name;
        editForm.content = tone.content;
        editForm.isDefault = tone.isDefault;
    }

    async function saveEdit(id: string) {
        try {
            await cms.blogWriter.tones.update(id, editForm);
            editingId.value = null;
            toast.success("Tone updated");
            await loadTones();
        } catch {
            toast.error("Failed to update tone");
        }
    }

    async function deleteTone(id: string) {
        try {
            await cms.blogWriter.tones.delete(id);
            deleteConfirmId.value = null;
            toast.success("Tone deleted");
            await loadTones();
        } catch {
            toast.error("Failed to delete tone");
        }
    }

    onMounted(loadTones);
</script>

<template>
  <div class="max-w-3xl">
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/blog-writer" class="p-1.5 rounded-lg text-content-muted hover:bg-surface-secondary transition-colors">
        <ArrowLeft :size="18" />
      </NuxtLink>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-content">Writing Tones</h1>
        <p class="text-sm text-content-muted">Define voice & style profiles for blog generation</p>
      </div>
      <button
        v-if="!showAddForm"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600"
        @click="showAddForm = true"
      >
        <Plus :size="16" /> New Tone
      </button>
    </div>

    <!-- Add form -->
    <div v-if="showAddForm" class="mb-6 p-4 rounded-xl border border-surface-border bg-surface space-y-3">
      <div>
        <label class="block text-sm font-medium text-content-secondary mb-1">Name</label>
        <input v-model="newForm.name" type="text" class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none" placeholder="e.g. Kim's Dev Voice" />
      </div>
      <div>
        <label class="block text-sm font-medium text-content-secondary mb-1">Style Instructions</label>
        <textarea v-model="newForm.content" rows="12" class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm font-mono outline-none" placeholder="Professional casual tone. Write like a senior dev..." />
      </div>
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 text-sm text-content">
          <input v-model="newForm.isDefault" type="checkbox" class="rounded border-gray-300" />
          Set as default tone
        </label>
        <div class="flex-1" />
        <button class="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-brand-500 text-white hover:bg-brand-600" @click="createTone"><Check :size="14" /> Save</button>
        <button class="px-3 py-1.5 text-sm rounded-lg border border-divider text-content-tertiary" @click="showAddForm = false">Cancel</button>
      </div>
    </div>

    <!-- List -->
    <div v-if="loading" class="p-8 text-center text-sm text-content-muted">Loading...</div>
    <div v-else-if="tones.length === 0 && !showAddForm" class="p-8 text-center text-sm text-content-muted">No tones yet. Create one to define your writing style.</div>
    <div v-else class="space-y-3">
      <div v-for="tone in tones" :key="tone._id" class="rounded-xl border border-surface-border bg-surface overflow-hidden">
        <template v-if="editingId !== tone._id">
          <div class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-2">
              <h3 class="font-medium text-content">{{ tone.name }}</h3>
              <Star v-if="tone.isDefault" :size="14" class="text-amber-500 fill-amber-500" />
            </div>
            <div class="flex items-center gap-1">
              <button class="p-1 text-gray-500 hover:text-brand-500" @click="startEdit(tone)"><Pencil :size="14" /></button>
              <template v-if="deleteConfirmId !== tone._id">
                <button class="p-1 text-gray-500 hover:text-red-500" @click="deleteConfirmId = tone._id"><Trash2 :size="14" /></button>
              </template>
              <template v-else>
                <button class="px-2 py-0.5 text-xs rounded bg-red-500 text-white" @click="deleteTone(tone._id)">Delete</button>
                <button class="px-2 py-0.5 text-xs rounded border border-divider text-content-tertiary" @click="deleteConfirmId = null">Cancel</button>
              </template>
            </div>
          </div>
          <pre class="px-4 pb-3 text-xs text-content-muted font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">{{ tone.content.slice(0, 300) }}{{ tone.content.length > 300 ? '...' : '' }}</pre>
        </template>

        <!-- Edit mode -->
        <div v-else class="p-4 space-y-3">
          <input v-model="editForm.name" type="text" class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none" />
          <textarea v-model="editForm.content" rows="12" class="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm font-mono outline-none" />
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm text-content">
              <input v-model="editForm.isDefault" type="checkbox" class="rounded border-gray-300" />
              Default
            </label>
            <div class="flex-1" />
            <button class="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-brand-500 text-white hover:bg-brand-600" @click="saveEdit(tone._id)"><Check :size="14" /> Save</button>
            <button class="px-3 py-1.5 text-sm rounded-lg border border-divider text-content-tertiary" @click="editingId = null">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
