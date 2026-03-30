<script setup lang="ts">
import { Upload, FileWarning } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  accept: string;
  multiple: boolean;
  maxSize?: number;
}>(), {
  multiple: false,
});

const emit = defineEmits<{
  files: [files: File[]];
}>();

const isDragging = ref(false);
const error = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
let dragCounter = 0;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateAndEmit(fileList: FileList | null) {
  if (!fileList || fileList.length === 0) return;

  error.value = '';
  const files = Array.from(fileList);

  if (props.maxSize) {
    const oversized = files.filter((f) => f.size > props.maxSize!);
    if (oversized.length > 0) {
      error.value = `File${oversized.length > 1 ? 's' : ''} exceed${oversized.length === 1 ? 's' : ''} max size of ${formatSize(props.maxSize)}`;
      return;
    }
  }

  emit('files', props.multiple ? files : [files[0]]);
}

function onDragEnter(e: DragEvent) {
  e.preventDefault();
  dragCounter++;
  isDragging.value = true;
}

function onDragLeave(e: DragEvent) {
  e.preventDefault();
  dragCounter--;
  if (dragCounter === 0) {
    isDragging.value = false;
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  dragCounter = 0;
  isDragging.value = false;
  validateAndEmit(e.dataTransfer?.files ?? null);
}

function onClick() {
  inputRef.value?.click();
}

function onInputChange(e: Event) {
  const target = e.target as HTMLInputElement;
  validateAndEmit(target.files);
  target.value = '';
}

const acceptLabel = computed(() => {
  return props.accept
    .split(',')
    .map((s) => s.trim())
    .map((s) => {
      if (s.startsWith('.')) return s.toUpperCase().slice(1);
      if (s.includes('/')) return s.split('/')[1]?.toUpperCase() ?? s;
      return s;
    })
    .join(', ');
});
</script>

<template>
  <div>
    <div
      role="button"
      tabindex="0"
      class="relative flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      :class="[
        isDragging
          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 scale-[1.01]'
          : 'border-surface-border hover:border-brand-300 dark:border-surface-dark-border dark:hover:border-brand-700 bg-surface-secondary dark:bg-surface-dark-secondary',
      ]"
      @click="onClick"
      @keydown.enter="onClick"
      @keydown.space.prevent="onClick"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @dragover="onDragOver"
      @drop="onDrop"
    >
      <div
        class="flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200"
        :class="isDragging ? 'bg-brand-100 dark:bg-brand-900/30' : 'bg-gray-100 dark:bg-surface-dark'"
      >
        <Upload
          :size="24"
          class="transition-colors duration-200"
          :class="isDragging ? 'text-brand-500' : 'text-gray-500 dark:text-gray-500'"
        />
      </div>

      <div class="text-center">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
          <span v-if="isDragging" class="text-brand-600 dark:text-brand-400">Drop files here</span>
          <template v-else>
            <span class="text-brand-600 dark:text-brand-400">Click to browse</span>
            or drag and drop
          </template>
        </p>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {{ acceptLabel }}
          <template v-if="maxSize"> &middot; Max {{ formatSize(maxSize) }}</template>
          <template v-if="multiple"> &middot; Multiple files</template>
        </p>
      </div>

      <input
        ref="inputRef"
        type="file"
        class="sr-only"
        :accept="accept"
        :multiple="multiple"
        @change="onInputChange"
      />
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <p v-if="error" class="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
        <FileWarning :size="14" />
        {{ error }}
      </p>
    </Transition>
  </div>
</template>
