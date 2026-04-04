<script setup lang="ts">
    import {
        AlertCircle,
        Archive,
        Download,
        ImageDown,
        ImageIcon,
        Loader2,
        Play,
        RefreshCw,
        Settings2,
        Trash2,
        TrendingDown,
        X,
    } from "lucide-vue-next";

    const {
        images,
        globalSettings,
        isCompressing,
        totalOriginalSize,
        totalCompressedSize,
        totalSavingsPercent,
        hasCompressedImages,
        hasPendingImages,
        addFiles,
        compressAll,
        compressSingle,
        downloadSingle,
        downloadAllAsZip,
        removeImage,
        clearAll,
        getSavings,
        formatBytes,
    } = useImageCompressor();

    const isDownloadingZip = ref(false);

    // Warn when quality slider won't help (PNG output)
    const pngQualityWarning = computed(() => {
        if (globalSettings.outputFormat === "png") return true;
        if (globalSettings.outputFormat === "original" && images.value.length > 0) {
            return images.value.every((img) => img.originalFile.type === "image/png");
        }
        return false;
    });

    function onFilesReceived(files: File[]) {
        addFiles(files);
    }

    async function handleDownloadZip() {
        isDownloadingZip.value = true;
        try {
            await downloadAllAsZip();
        } finally {
            isDownloadingZip.value = false;
        }
    }
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- File drop zone -->
    <UiFileDropzone
      accept=".png,.jpg,.jpeg,.webp,.gif"
      :multiple="true"
      @files="onFilesReceived"
    />

    <!-- Total savings banner -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="hasCompressedImages"
        class="flex items-center gap-3 px-4 py-3 rounded-xl border"
        :class="totalSavingsPercent >= 0
          ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30'
          : 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30'"
      >
        <TrendingDown
          :size="20"
          :class="totalSavingsPercent >= 0
            ? 'text-green-600 dark:text-green-400'
            : 'text-amber-600 dark:text-amber-400'"
        />
        <div class="flex-1 min-w-0">
          <p
            class="text-sm font-medium"
            :class="totalSavingsPercent >= 0
              ? 'text-green-800 dark:text-green-300'
              : 'text-amber-800 dark:text-amber-300'"
          >
            Total: {{ formatBytes(totalOriginalSize) }} &rarr; {{ formatBytes(totalCompressedSize) }}
            <span class="font-bold">
              ({{ totalSavingsPercent >= 0 ? totalSavingsPercent + '% saved' : Math.abs(totalSavingsPercent) + '% larger' }})
            </span>
          </p>
        </div>
      </div>
    </Transition>

    <!-- Global controls bar -->
    <div
      v-if="images.length > 0"
      class="flex flex-col gap-3 px-4 py-3 bg-surface border border-surface-border rounded-xl"
    >
      <!-- Settings row -->
      <div class="flex flex-col sm:flex-row sm:items-end gap-3">
        <!-- Quality slider -->
        <div class="flex flex-col gap-1.5 flex-1 min-w-[140px]">
          <label class="text-xs font-medium text-content-muted flex items-center gap-1">
            <Settings2 :size="12" />
            Quality
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model.number="globalSettings.quality"
              type="range"
              min="1"
              max="100"
              step="1"
              class="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--color-switch-off)] accent-brand-500"
            />
            <span class="text-sm font-mono font-medium text-content-secondary w-9 text-right tabular-nums">
              {{ globalSettings.quality }}
            </span>
          </div>
          <p v-if="pngQualityWarning" class="text-[11px] text-amber-600 dark:text-amber-400 leading-snug">
            PNG is lossless — quality slider has no effect. Convert to WebP or JPEG to reduce file size.
          </p>
        </div>

        <!-- Output format -->
        <div class="flex flex-col gap-1.5">
          <label for="output-format" class="text-xs font-medium text-content-muted">Format</label>
          <select
            id="output-format"
            v-model="globalSettings.outputFormat"
            class="text-sm bg-surface-secondary border border-surface-border rounded-lg px-2.5 py-1.5 text-content-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="original">Original</option>
            <option value="webp">WebP</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
          </select>
        </div>

        <!-- Max Width -->
        <div class="flex flex-col gap-1.5">
          <label for="max-width" class="text-xs font-medium text-content-muted">Max width</label>
          <input
            id="max-width"
            :value="globalSettings.maxWidth ?? ''"
            type="number"
            min="1"
            placeholder="Auto"
            @input="globalSettings.maxWidth = ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined"
            class="text-sm w-24 bg-surface-secondary border border-surface-border rounded-lg px-2.5 py-1.5 text-content-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder-placeholder"
          />
        </div>

        <!-- Max Height -->
        <div class="flex flex-col gap-1.5">
          <label for="max-height" class="text-xs font-medium text-content-muted">Max height</label>
          <input
            id="max-height"
            :value="globalSettings.maxHeight ?? ''"
            type="number"
            min="1"
            placeholder="Auto"
            @input="globalSettings.maxHeight = ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined"
            class="text-sm w-24 bg-surface-secondary border border-surface-border rounded-lg px-2.5 py-1.5 text-content-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder-placeholder"
          />
        </div>

        <!-- Scale -->
        <div class="flex flex-col gap-1.5">
          <label for="scale-pct" class="text-xs font-medium text-content-muted">Scale %</label>
          <input
            id="scale-pct"
            :value="globalSettings.scale ?? ''"
            type="number"
            min="1"
            max="200"
            placeholder="100"
            @input="globalSettings.scale = ($event.target as HTMLInputElement).value ? Number(($event.target as HTMLInputElement).value) : undefined"
            class="text-sm w-20 bg-surface-secondary border border-surface-border rounded-lg px-2.5 py-1.5 text-content-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder-placeholder"
          />
        </div>
      </div>

      <!-- Action buttons row -->
      <div class="flex flex-wrap items-center gap-2 pt-1 border-t border-surface-border">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="isCompressing || images.length === 0 || (!hasPendingImages && !images.some(i => i.status === 'error'))"
          @click="compressAll"
        >
          <Loader2 v-if="isCompressing" :size="15" class="animate-spin" />
          <Play v-else :size="15" />
          {{ isCompressing ? 'Compressing...' : hasCompressedImages && hasPendingImages ? 'Re-compress All' : 'Compress All' }}
        </button>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-content-tertiary hover:bg-surface-secondary hover:text-content disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          :disabled="!hasCompressedImages || isDownloadingZip"
          @click="handleDownloadZip"
        >
          <Loader2 v-if="isDownloadingZip" :size="15" class="animate-spin" />
          <Archive v-else :size="15" />
          Download ZIP
        </button>

        <div class="flex-1" />

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors"
          :disabled="isCompressing"
          @click="clearAll"
        >
          <Trash2 :size="15" />
          Clear All
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="images.length === 0"
      class="flex flex-col items-center justify-center gap-3 py-16 text-content-faint"
    >
      <div class="flex items-center justify-center w-16 h-16 rounded-full bg-surface-secondary">
        <ImageDown :size="28" />
      </div>
      <p class="text-sm font-medium">No images uploaded</p>
      <p class="text-xs">Drop images above or click to browse</p>
    </div>

    <!-- Image grid -->
    <div v-if="images.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="img in images"
        :key="img.id"
        class="relative flex flex-col border border-surface-border rounded-xl overflow-hidden bg-surface"
      >
        <!-- Remove button -->
        <button
          type="button"
          class="absolute top-2 right-2 z-10 p-1 rounded-full bg-gray-900/60 text-white hover:bg-gray-900/80 transition-colors"
          title="Remove"
          :disabled="img.status === 'compressing'"
          @click="removeImage(img.id)"
        >
          <X :size="14" />
        </button>

        <!-- Before / After comparison -->
        <div class="flex border-b border-surface-border">
          <!-- Original -->
          <div class="flex-1 flex flex-col items-center p-3 border-r border-surface-border">
            <span class="text-[10px] uppercase tracking-wider font-semibold text-content-muted mb-1.5">Original</span>
            <div class="w-full aspect-square rounded-lg overflow-hidden bg-surface-secondary flex items-center justify-center">
              <img
                :src="img.previewUrl"
                :alt="img.originalFile.name"
                class="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          <!-- Compressed -->
          <div class="flex-1 flex flex-col items-center p-3">
            <span class="text-[10px] uppercase tracking-wider font-semibold text-content-muted mb-1.5">Compressed</span>
            <div class="w-full aspect-square rounded-lg overflow-hidden bg-surface-secondary flex items-center justify-center">
              <img
                v-if="img.compressedPreviewUrl"
                :src="img.compressedPreviewUrl"
                :alt="`Compressed ${img.originalFile.name}`"
                class="max-w-full max-h-full object-contain"
              />
              <div v-else-if="img.status === 'compressing'" class="flex flex-col items-center gap-2 text-content-muted">
                <Loader2 :size="24" class="animate-spin" />
              </div>
              <div v-else class="text-content-faint">
                <ImageIcon :size="32" />
              </div>
            </div>
          </div>
        </div>

        <!-- Info & controls -->
        <div class="px-3 py-2.5 flex flex-col gap-2">
          <!-- Filename -->
          <p class="text-sm font-medium text-content truncate" :title="img.originalFile.name">
            {{ img.originalFile.name }}
          </p>

          <!-- Progress bar -->
          <div
            v-if="img.status === 'compressing'"
            class="w-full h-1.5 rounded-full bg-[var(--color-switch-off)] overflow-hidden"
          >
            <div
              class="h-full rounded-full bg-brand-500 transition-all duration-300 ease-out"
              :style="{ width: `${img.progress}%` }"
            />
          </div>

          <!-- Size info -->
          <div class="flex items-center gap-2 text-xs">
            <span class="text-content-muted">{{ formatBytes(img.originalSize) }}</span>

            <template v-if="img.status === 'done'">
              <span class="text-content-muted">&rarr;</span>
              <span class="font-medium text-content-secondary">{{ formatBytes(img.compressedSize) }}</span>
              <span
                class="font-semibold px-1.5 py-0.5 rounded-full text-[10px]"
                :class="getSavings(img).percent >= 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'"
              >
                {{ getSavings(img).percent >= 0 ? getSavings(img).percent + '% smaller' : Math.abs(getSavings(img).percent) + '% larger' }}
              </span>
            </template>

            <template v-else-if="img.status === 'compressing'">
              <span class="text-brand-500 dark:text-brand-400">Compressing... {{ img.progress }}%</span>
            </template>

            <template v-else-if="img.status === 'error'">
              <span class="flex items-center gap-1 text-red-500 dark:text-red-400">
                <AlertCircle :size="12" />
                {{ img.errorMessage || 'Error' }}
              </span>
            </template>

            <template v-else>
              <span class="text-content-muted">Pending</span>
            </template>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-1.5 pt-1">
            <button
              v-if="img.status === 'pending' || img.status === 'error'"
              type="button"
              class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-300 dark:hover:bg-brand-900/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="isCompressing"
              @click="compressSingle(img)"
            >
              <Play :size="12" />
              Compress
            </button>

            <button
              v-if="img.status === 'done'"
              type="button"
              class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-content-tertiary hover:bg-surface-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="isCompressing"
              @click="img.status = 'pending'; img.progress = 0; compressSingle(img)"
            >
              <RefreshCw :size="12" />
              Re-compress
            </button>

            <button
              v-if="img.status === 'done'"
              type="button"
              class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30 transition-colors"
              @click="downloadSingle(img)"
            >
              <Download :size="12" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
