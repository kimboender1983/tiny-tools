<script setup lang="ts">
import { X, Upload, Check, Image as ImageIcon, Loader2 } from 'lucide-vue-next';
import type { IMedia } from '@tiny-tools/shared';

const props = defineProps<{
  modelValue: string;
  label?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const cms = useCms();
const open = ref(false);
const loading = ref(false);
const uploading = ref(false);
const mediaItems = ref<IMedia[]>([]);

async function loadMedia() {
  loading.value = true;
  try {
    const res = await cms.media.list({ page: 1, pageSize: 50 });
    mediaItems.value = (res as any).items || [];
  } catch {
    mediaItems.value = [];
  } finally {
    loading.value = false;
  }
}

function openPicker() {
  open.value = true;
  loadMedia();
}

function selectImage(url: string) {
  emit('update:modelValue', url);
  open.value = false;
}

function clearImage() {
  emit('update:modelValue', '');
}

async function uploadFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  uploading.value = true;
  try {
    const media = await cms.media.upload(file);
    mediaItems.value.unshift(media);
    selectImage(media.url);
  } catch {
    // Upload failed
  } finally {
    uploading.value = false;
    input.value = '';
  }
}
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {{ label }}
    </label>

    <!-- Preview / select button -->
    <div v-if="modelValue" class="relative group">
      <img
        :src="modelValue"
        :alt="label || 'Selected image'"
        class="w-full h-32 object-cover rounded-lg border border-surface-border dark:border-surface-dark-border"
      />
      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          @click="openPicker"
        >
          Change
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          @click="clearImage"
        >
          Remove
        </button>
      </div>
    </div>

    <button
      v-else
      type="button"
      class="w-full h-24 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-surface-border dark:border-surface-dark-border text-gray-500 dark:text-gray-400 hover:border-brand-300 hover:text-brand-500 dark:hover:border-brand-700 dark:hover:text-brand-400 transition-colors"
      @click="openPicker"
    >
      <ImageIcon :size="20" />
      <span class="text-xs font-medium">Select image</span>
    </button>

    <!-- Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="open"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          @click.self="open = false"
        >
          <div class="bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-surface-border dark:border-surface-dark-border">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Select Image</h3>
              <button
                type="button"
                class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                @click="open = false"
              >
                <X :size="18" />
              </button>
            </div>

            <!-- Upload -->
            <div class="px-4 py-3 border-b border-surface-border dark:border-surface-dark-border">
              <label class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 cursor-pointer transition-colors">
                <Upload v-if="!uploading" :size="14" />
                <Loader2 v-else :size="14" class="animate-spin" />
                {{ uploading ? 'Uploading...' : 'Upload new' }}
                <input type="file" accept="image/*" class="hidden" :disabled="uploading" @change="uploadFile" />
              </label>
            </div>

            <!-- Grid -->
            <div class="flex-1 overflow-auto p-4">
              <div v-if="loading" class="flex items-center justify-center py-12">
                <Loader2 :size="24" class="animate-spin text-gray-400" />
              </div>

              <div v-else-if="mediaItems.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                <ImageIcon :size="32" />
                <p class="text-sm mt-2">No images yet. Upload one above.</p>
              </div>

              <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                <button
                  v-for="item in mediaItems"
                  :key="item._id"
                  type="button"
                  class="relative group aspect-square rounded-lg overflow-hidden border-2 transition-colors"
                  :class="modelValue === item.url
                    ? 'border-brand-500'
                    : 'border-transparent hover:border-brand-300 dark:hover:border-brand-700'"
                  @click="selectImage(item.url)"
                >
                  <img
                    :src="item.url"
                    :alt="item.alt || item.filename"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-if="modelValue === item.url"
                    class="absolute inset-0 bg-brand-500/20 flex items-center justify-center"
                  >
                    <Check :size="24" class="text-brand-500" />
                  </div>
                  <div class="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-black/50 text-[10px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ item.filename }}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
