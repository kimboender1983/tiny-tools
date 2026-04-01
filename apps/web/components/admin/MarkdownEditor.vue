<script setup lang="ts">
import { MdEditor, NormalToolbar, type ExposeParam } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { Image as ImageIcon, X, Upload, Check, Loader2 } from 'lucide-vue-next';
import type { IMedia } from '@tiny-tools/shared';

const model = defineModel<string>({ required: true });

defineProps<{
  placeholder?: string;
}>();

const colorMode = useColorMode();
const theme = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'));
const cms = useCms();
const editorRef = ref<ExposeParam>();

// Media gallery state
const galleryOpen = ref(false);
const galleryLoading = ref(false);
const galleryUploading = ref(false);
const mediaItems = ref<IMedia[]>([]);
const selectedMedia = ref<IMedia | null>(null);
const insertAlt = ref('');
const insertCaption = ref('');

async function loadMedia() {
  galleryLoading.value = true;
  try {
    const res = await cms.media.list({ page: 1, pageSize: 50 });
    mediaItems.value = (res as any).items || [];
  } catch {
    mediaItems.value = [];
  } finally {
    galleryLoading.value = false;
  }
}

function openGallery() {
  selectedMedia.value = null;
  insertAlt.value = '';
  insertCaption.value = '';
  galleryOpen.value = true;
  loadMedia();
}

function selectMedia(item: IMedia) {
  selectedMedia.value = item;
  insertAlt.value = item.alt || '';
  insertCaption.value = item.caption || '';
}

function insertImage() {
  if (!selectedMedia.value) return;

  const url = selectedMedia.value.url;
  const alt = insertAlt.value.trim();
  const caption = insertCaption.value.trim();

  let markdown: string;
  if (caption) {
    markdown = `\n<figure>\n  <img src="${url}" alt="${alt}" />\n  <figcaption>${caption}</figcaption>\n</figure>\n`;
  } else {
    markdown = `\n![${alt}](${url})\n`;
  }

  galleryOpen.value = false;

  // Insert at cursor position using the editor's API
  nextTick(() => {
    editorRef.value?.insert(() => ({
      targetValue: markdown,
      select: '',
      deselect: '',
    }));
  });
}

async function uploadInGallery(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  galleryUploading.value = true;
  try {
    const media = await cms.media.upload(file);
    mediaItems.value.unshift(media);
    selectMedia(media);
  } catch {
    // Upload failed
  } finally {
    galleryUploading.value = false;
    input.value = '';
  }
}

// Handle drag-and-drop / paste image uploads in the editor
async function onUploadImg(files: File[], callback: (urls: string[]) => void) {
  const urls: string[] = [];
  for (const file of files) {
    try {
      const media = await cms.media.upload(file);
      urls.push(media.url);
    } catch {
      // Skip failed uploads
    }
  }
  callback(urls);
}
</script>

<template>
  <div>
    <MdEditor
      ref="editorRef"
      v-model="model"
      language="en-US"
      :theme="theme"
      :placeholder="placeholder"
      :preview="false"
      :style="{ height: '460px' }"
      :toolbars="[
        'bold', 'underline', 'italic', 'strikeThrough',
        '-',
        'title', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', 'task',
        '-',
        'codeRow', 'code', 'link', 0, 'table',
        '-',
        'revoke', 'next',
        '=',
        'preview', 'fullscreen',
      ]"
      @on-upload-img="onUploadImg"
    >
      <template #defToolbars>
        <NormalToolbar title="Insert image from gallery" @click="openGallery">
          <template #trigger>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          </template>
        </NormalToolbar>
      </template>
    </MdEditor>

    <!-- Media Gallery Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="galleryOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          @click.self="galleryOpen = false"
        >
          <div class="bg-surface dark:bg-surface-dark border border-surface-border dark:border-surface-dark-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-3 border-b border-surface-border dark:border-surface-dark-border">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Insert Image</h3>
              <button
                type="button"
                class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                @click="galleryOpen = false"
              >
                <X :size="18" />
              </button>
            </div>

            <!-- Upload bar -->
            <div class="px-5 py-3 border-b border-surface-border dark:border-surface-dark-border">
              <label class="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 cursor-pointer transition-colors">
                <Upload v-if="!galleryUploading" :size="14" />
                <Loader2 v-else :size="14" class="animate-spin" />
                {{ galleryUploading ? 'Uploading...' : 'Upload new' }}
                <input type="file" accept="image/*" class="hidden" :disabled="galleryUploading" @change="uploadInGallery" />
              </label>
            </div>

            <!-- Content: gallery + details side by side -->
            <div class="flex-1 overflow-hidden flex min-h-0">
              <!-- Image grid -->
              <div class="flex-1 overflow-auto p-4">
                <div v-if="galleryLoading" class="flex items-center justify-center py-12">
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
                    :class="selectedMedia?._id === item._id
                      ? 'border-brand-500'
                      : 'border-transparent hover:border-brand-300 dark:hover:border-brand-700'"
                    @click="selectMedia(item)"
                  >
                    <img
                      :src="item.url"
                      :alt="item.alt || item.filename"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-if="selectedMedia?._id === item._id"
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

              <!-- Details panel (shown when image selected) -->
              <div
                v-if="selectedMedia"
                class="w-64 border-l border-surface-border dark:border-surface-dark-border p-4 space-y-4 overflow-auto shrink-0"
              >
                <img
                  :src="selectedMedia.url"
                  :alt="selectedMedia.alt || selectedMedia.filename"
                  class="w-full aspect-video object-cover rounded-lg"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ selectedMedia.filename }}</p>

                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Alt text</label>
                  <input
                    v-model="insertAlt"
                    type="text"
                    placeholder="Describe the image..."
                    class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none dark:bg-surface-dark-secondary dark:border-surface-dark-border dark:text-gray-100"
                  />
                </div>

                <div>
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Caption <span class="font-normal text-gray-400">(optional)</span></label>
                  <input
                    v-model="insertCaption"
                    type="text"
                    placeholder="Image caption..."
                    class="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none dark:bg-surface-dark-secondary dark:border-surface-dark-border dark:text-gray-100"
                  />
                </div>

                <button
                  type="button"
                  class="w-full px-3 py-2 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!insertAlt.trim()"
                  @click="insertImage"
                >
                  Insert Image
                </button>
                <p v-if="!insertAlt.trim()" class="text-[11px] text-amber-600 dark:text-amber-400">Alt text is required for accessibility</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
