<script setup lang="ts">
import {
  AlertTriangle,
  ArrowRightLeft,
  Eraser,
  Upload,
  Download,
  Zap,
  Lock,
  Unlock,
  Image as ImageIcon,
} from 'lucide-vue-next';

const {
  input,
  output,
  mode,
  error,
  urlSafe,
  imagePreview,
  sourceImagePreview,
  sourceFileName,
  dataUri,
  inputBytes,
  outputBytes,
  clear,
  swap,
  loadSample,
  handleFile,
} = useBase64();

// File drop
const isDragging = ref(false);
let dragCounter = 0;

function onDragEnter(e: DragEvent) {
  e.preventDefault();
  dragCounter++;
  isDragging.value = true;
}

function onDragLeave() {
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    isDragging.value = false;
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault();
  dragCounter = 0;
  isDragging.value = false;
  const file = e.dataTransfer?.files[0];
  if (file) handleFile(file);
}

function onFileInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) handleFile(file);
  target.value = '';
}

function downloadOutput() {
  if (!output.value) return;
  const blob = new Blob([output.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = mode.value === 'encode' ? 'encoded.b64' : 'decoded.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const examples = [
  { label: 'Hello World', text: 'Hello, World!' },
  { label: 'JSON Object', text: '{"user":"alice","role":"admin","active":true}' },
  { label: 'HTML Snippet', text: '<h1>Hello</h1><p>This is <strong>HTML</strong> encoded in Base64.</p>' },
  { label: 'Encoded String', decode: 'SGVsbG8sIFdvcmxkIQ==' },
];

const fileInputRef = ref<HTMLInputElement | null>(null);
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Mode toggle -->
      <div class="inline-flex items-center rounded-lg border border-surface-border dark:border-surface-dark-border overflow-hidden">
        <button
          type="button"
          class="px-3 py-1.5 text-sm font-medium transition-colors"
          :class="mode === 'encode'
            ? 'bg-brand-500 text-white'
            : 'bg-surface text-gray-600 hover:bg-gray-100 dark:bg-surface-dark dark:text-gray-400 dark:hover:bg-surface-dark-secondary'"
          @click="mode = 'encode'"
        >
          <Lock :size="14" class="inline -mt-0.5 mr-1" />
          Encode
        </button>
        <button
          type="button"
          class="px-3 py-1.5 text-sm font-medium transition-colors"
          :class="mode === 'decode'
            ? 'bg-brand-500 text-white'
            : 'bg-surface text-gray-600 hover:bg-gray-100 dark:bg-surface-dark dark:text-gray-400 dark:hover:bg-surface-dark-secondary'"
          @click="mode = 'decode'"
        >
          <Unlock :size="14" class="inline -mt-0.5 mr-1" />
          Decode
        </button>
      </div>

      <div class="w-px h-5 bg-surface-border dark:bg-surface-dark-border" />

      <!-- URL-safe toggle -->
      <label class="inline-flex items-center gap-2 cursor-pointer select-none">
        <button
          type="button"
          role="switch"
          :aria-checked="urlSafe"
          class="relative flex h-5 w-9 items-center rounded-full px-0.5 transition-colors duration-200"
          :class="urlSafe ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'"
          @click="urlSafe = !urlSafe"
        >
          <div
            class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
            :class="urlSafe ? 'translate-x-4' : 'translate-x-0'"
          />
        </button>
        <span class="text-sm text-gray-600 dark:text-gray-400">URL-safe</span>
      </label>

      <!-- Data URI toggle -->
      <label class="inline-flex items-center gap-2 cursor-pointer select-none">
        <button
          type="button"
          role="switch"
          :aria-checked="dataUri"
          class="relative flex h-5 w-9 items-center rounded-full px-0.5 transition-colors duration-200"
          :class="dataUri ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'"
          @click="dataUri = !dataUri"
        >
          <div
            class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
            :class="dataUri ? 'translate-x-4' : 'translate-x-0'"
          />
        </button>
        <span class="text-sm text-gray-600 dark:text-gray-400">Data URI</span>
      </label>

      <div class="w-px h-5 bg-surface-border dark:bg-surface-dark-border" />

      <!-- Actions -->
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!output || !!error"
        @click="swap"
        title="Swap input ↔ output"
      >
        <ArrowRightLeft :size="15" />
        <span class="hidden sm:inline">Swap</span>
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200 transition-colors"
        @click="fileInputRef?.click()"
      >
        <Upload :size="15" />
        <span class="hidden sm:inline">File</span>
      </button>
      <input ref="fileInputRef" type="file" class="hidden" accept="image/*,*/*" @change="onFileInput" />

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!output"
        @click="downloadOutput"
      >
        <Download :size="15" />
        <span class="hidden sm:inline">Download</span>
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-surface-dark-secondary dark:hover:text-gray-200 transition-colors"
        @click="clear"
      >
        <Eraser :size="15" />
        <span class="hidden sm:inline">Clear</span>
      </button>
    </div>

    <!-- Error panel -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="error"
        class="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm dark:bg-red-900/10 dark:border-red-900/30"
      >
        <AlertTriangle :size="16" class="text-red-500 shrink-0" />
        <p class="text-red-700 dark:text-red-400">{{ error.message }}</p>
      </div>
    </Transition>

    <!-- Input / Output panes -->
    <div
      class="grid grid-cols-1 lg:grid-cols-2 gap-4"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @dragover.prevent
      @drop="onDrop"
    >
      <!-- Input -->
      <div class="flex flex-col rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark" :class="isDragging ? 'ring-2 ring-brand-500/40' : ''">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border bg-surface-secondary dark:bg-surface-dark-secondary">
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ sourceImagePreview ? 'Source Image' : mode === 'encode' ? 'Text' : 'Base64' }}
          </span>
          <div class="flex items-center gap-2">
            <span v-if="sourceFileName" class="text-xs text-gray-500 dark:text-gray-500 truncate max-w-[120px]">{{ sourceFileName }}</span>
            <span v-else class="text-xs text-gray-500 dark:text-gray-500">{{ formatBytes(inputBytes) }}</span>
            <UiCopyButton v-if="input && !sourceImagePreview" :text="input" />
          </div>
        </div>
        <!-- Image source preview when an image file was uploaded -->
        <div
          v-if="sourceImagePreview"
          class="min-h-[240px] lg:min-h-[360px] p-4 flex flex-col items-center justify-center gap-3 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] dark:bg-[repeating-conic-gradient(#1f2937_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]"
        >
          <img
            :src="sourceImagePreview"
            :alt="sourceFileName || 'Source image'"
            class="max-w-full max-h-[300px] rounded-lg shadow-md object-contain"
          />
          <button
            type="button"
            class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors underline"
            @click="clear"
          >
            Remove image
          </button>
        </div>
        <!-- Text input -->
        <textarea
          v-else
          v-model="input"
          class="w-full min-h-[240px] lg:min-h-[360px] p-4 font-mono text-sm leading-relaxed bg-transparent resize-y focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-600"
          :placeholder="mode === 'encode'
            ? 'Type or paste text to encode, or drop an image...'
            : 'Paste Base64 string to decode...'"
          spellcheck="false"
          autocomplete="off"
        />
      </div>

      <!-- Output -->
      <div class="flex flex-col rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border bg-surface-secondary dark:bg-surface-dark-secondary">
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ mode === 'encode' ? 'Base64' : 'Text' }}
          </span>
          <div class="flex items-center gap-2">
            <span v-if="output" class="text-xs text-gray-500 dark:text-gray-500">{{ formatBytes(outputBytes) }}</span>
            <UiCopyButton v-if="output" :text="output" />
          </div>
        </div>
        <pre
          class="w-full min-h-[240px] lg:min-h-[360px] p-4 font-mono text-sm leading-relaxed overflow-auto whitespace-pre-wrap break-all m-0"
          :class="output ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'"
        >{{ output || (mode === 'encode' ? 'Encoded output will appear here...' : 'Decoded output will appear here...') }}</pre>
      </div>
    </div>

    <!-- Image preview -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="imagePreview"
        class="rounded-xl border border-surface-border dark:border-surface-dark-border overflow-hidden bg-surface dark:bg-surface-dark"
      >
        <div class="flex items-center gap-2 px-4 py-2.5 border-b border-surface-border dark:border-surface-dark-border bg-surface-secondary dark:bg-surface-dark-secondary">
          <ImageIcon :size="15" class="text-brand-500" />
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">Image Preview</span>
        </div>
        <div class="p-4 flex items-center justify-center bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] dark:bg-[repeating-conic-gradient(#1f2937_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
          <img
            :src="imagePreview"
            alt="Decoded image preview"
            class="max-w-full max-h-[400px] rounded-lg shadow-md object-contain"
          />
        </div>
      </div>
    </Transition>

    <!-- Examples -->
    <div v-if="!input.trim()" class="flex flex-col gap-3">
      <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Try an example:</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          v-for="ex in examples"
          :key="ex.label"
          type="button"
          class="flex flex-col items-start gap-1 p-4 rounded-xl border border-surface-border bg-surface hover:border-brand-300 hover:bg-brand-50/50 dark:bg-surface-dark dark:border-surface-dark-border dark:hover:border-brand-700 dark:hover:bg-brand-900/10 transition-colors text-left group"
          @click="ex.decode ? (mode = 'decode', loadSample(ex.decode)) : (mode = 'encode', loadSample(ex.text!))"
        >
          <div class="flex items-center gap-2">
            <Zap :size="14" class="text-brand-500" />
            <span class="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">{{ ex.label }}</span>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400 truncate w-full">
            {{ ex.decode ? 'Decode →' : 'Encode →' }}
            <code class="font-mono">{{ (ex.text || ex.decode || '').slice(0, 28) }}{{ (ex.text || ex.decode || '').length > 28 ? '…' : '' }}</code>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
