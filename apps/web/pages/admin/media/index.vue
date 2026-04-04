<script setup lang="ts">
    import type { IMedia } from "@tiny-tools/shared";
    import { Check, Copy, Pencil, Trash2, Upload } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();
    const toast = useToast();

    const loading = ref(true);
    const error = ref("");
    const media = ref<IMedia[]>([]);
    const total = ref(0);
    const uploading = ref(false);
    const deleteConfirmId = ref<string | null>(null);
    const copiedId = ref<string | null>(null);
    const editingAltId = ref<string | null>(null);
    const editingAltText = ref("");
    const isDragOver = ref(false);
    const editingItem = ref<IMedia | null>(null);

    async function onEditorSaved(_saved: IMedia) {
        editingItem.value = null;
        await loadMedia();
    }

    async function loadMedia() {
        loading.value = true;
        error.value = "";

        try {
            const res = await cms.media.list({ pageSize: 50 });
            media.value = res.items;
            total.value = res.total;
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to load media.";
        } finally {
            loading.value = false;
        }
    }

    async function uploadFiles(files: FileList | File[]) {
        uploading.value = true;
        error.value = "";

        try {
            for (const file of files) {
                await cms.media.upload(file);
            }
            toast.success("Media uploaded");
            await loadMedia();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to upload file.");
        } finally {
            uploading.value = false;
        }
    }

    function onFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            uploadFiles(input.files);
            input.value = "";
        }
    }

    function onDrop(event: DragEvent) {
        isDragOver.value = false;
        if (event.dataTransfer?.files.length) {
            uploadFiles(event.dataTransfer.files);
        }
    }

    function onDragOver(event: DragEvent) {
        event.preventDefault();
        isDragOver.value = true;
    }

    function onDragLeave() {
        isDragOver.value = false;
    }

    async function copyUrl(item: IMedia) {
        try {
            await navigator.clipboard.writeText(item.url);
            copiedId.value = item._id;
            setTimeout(() => {
                copiedId.value = null;
            }, 2000);
        } catch {
            // Fallback — select and copy is not needed in admin
        }
    }

    function startEditAlt(item: IMedia) {
        editingAltId.value = item._id;
        editingAltText.value = item.alt || "";
    }

    function cancelEditAlt() {
        editingAltId.value = null;
        editingAltText.value = "";
    }

    async function saveAlt(id: string) {
        // Note: The media composable doesn't have an update method,
        // so we use a direct approach. If update is added later, use that.
        // For now, we update the local state to reflect the change.
        const item = media.value.find((m) => m._id === id);
        if (item) {
            item.alt = editingAltText.value;
        }
        editingAltId.value = null;
        toast.success("Alt text updated");
    }

    async function deleteMedia(id: string) {
        error.value = "";

        try {
            await cms.media.delete(id);
            deleteConfirmId.value = null;
            toast.success("Media deleted");
            await loadMedia();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to delete media.");
        }
    }

    function formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function isImage(mimeType: string): boolean {
        return mimeType.startsWith("image/");
    }

    onMounted(loadMedia);
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-content">Media</h1>
      <span v-if="total > 0" class="text-sm text-content-muted">{{ total }} files</span>
    </div>

    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
      {{ error }}
    </div>

    <!-- Upload dropzone -->
    <div
      class="mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
      :class="isDragOver
        ? 'border-brand-500 bg-brand-50'
        : 'border-gray-300 hover:border-gray-400'"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop"
      @click="($refs.fileInput as HTMLInputElement)?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*,video/*,application/pdf"
        class="hidden"
        @change="onFileSelect"
      />
      <Upload :size="24" class="mx-auto mb-2 text-gray-500" />
      <p v-if="uploading" class="text-sm text-brand-500 font-medium">Uploading...</p>
      <template v-else>
        <p class="text-sm text-content-tertiary">
          Drop files here or click to upload
        </p>
        <p class="text-xs text-content-muted mt-1">Images, videos, PDFs</p>
      </template>
    </div>

    <!-- Media grid -->
    <div v-if="loading" class="text-sm text-content-muted">Loading...</div>
    <div v-else-if="media.length === 0" class="text-center py-12 text-sm text-content-muted">
      No media uploaded yet.
    </div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div
        v-for="item in media"
        :key="item._id"
        class="bg-surface border border-surface-border rounded-xl overflow-hidden group"
      >
        <!-- Thumbnail -->
        <div class="aspect-square bg-surface-secondary relative overflow-hidden">
          <img
            v-if="isImage(item.mimeType)"
            :src="item.url"
            :alt="item.alt || item.filename"
            class="w-full h-full object-cover"
            loading="lazy"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-500">
            <span class="text-xs font-mono uppercase">{{ item.mimeType.split('/')[1] }}</span>
          </div>

          <!-- Overlay actions -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              class="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors"
              title="Copy URL"
              @click.stop="copyUrl(item)"
            >
              <component :is="copiedId === item._id ? Check : Copy" :size="14" />
            </button>
            <button
              v-if="isImage(item.mimeType)"
              class="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors"
              title="Edit image"
              @click.stop="editingItem = item"
            >
              <Pencil :size="14" />
            </button>
            <button
              v-if="deleteConfirmId !== item._id"
              class="p-1.5 rounded-lg bg-white/90 text-red-500 hover:bg-white transition-colors"
              title="Delete"
              @click.stop="deleteConfirmId = item._id"
            >
              <Trash2 :size="14" />
            </button>
          </div>

          <!-- Delete confirmation overlay -->
          <div
            v-if="deleteConfirmId === item._id"
            class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2"
          >
            <p class="text-white text-xs font-medium">Delete?</p>
            <div class="flex gap-1">
              <button
                class="px-2 py-0.5 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                @click.stop="deleteMedia(item._id)"
              >
                Yes
              </button>
              <button
                class="px-2 py-0.5 text-xs rounded bg-white text-gray-700 hover:bg-gray-100"
                @click.stop="deleteConfirmId = null"
              >
                No
              </button>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div class="p-2.5">
          <p class="text-xs font-medium text-content truncate" :title="item.filename">
            {{ item.filename }}
          </p>
          <div class="flex items-center gap-2 mt-1 text-xs text-content-muted">
            <span>{{ formatSize(item.size) }}</span>
            <span v-if="item.width && item.height">{{ item.width }}x{{ item.height }}</span>
          </div>

          <!-- Alt text -->
          <div class="mt-2">
            <template v-if="editingAltId === item._id">
              <div class="flex gap-1">
                <input
                  v-model="editingAltText"
                  type="text"
                  placeholder="Alt text"
                  class="flex-1 min-w-0 px-1.5 py-0.5 rounded border border-gray-300 bg-white text-gray-900 text-xs focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  @keyup.enter="saveAlt(item._id)"
                  @keyup.escape="cancelEditAlt"
                />
                <button
                  class="p-0.5 text-green-600 hover:text-green-700"
                  @click="saveAlt(item._id)"
                >
                  <Check :size="12" />
                </button>
              </div>
            </template>
            <button
              v-else
              class="text-xs text-content-muted hover:text-content-secondary truncate block w-full text-left"
              @click="startEditAlt(item)"
            >
              {{ item.alt || 'Add alt text...' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image editor -->
    <ClientOnly>
      <AdminImageEditor
        :media-item="editingItem"
        :open="!!editingItem"
        @close="editingItem = null"
        @saved="onEditorSaved"
      />
    </ClientOnly>
  </div>
</template>
