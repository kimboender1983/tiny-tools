export type ImageStatus = 'pending' | 'compressing' | 'done' | 'error';
export type OutputFormat = 'original' | 'webp' | 'jpeg' | 'png';

export interface ImageSettings {
  quality: number;
  outputFormat: OutputFormat;
  maxWidth?: number;
  maxHeight?: number;
  scale?: number;
}

export interface CompressImage {
  id: string;
  originalFile: File;
  originalSize: number;
  compressedBlob: Blob | null;
  compressedSize: number;
  progress: number;
  status: ImageStatus;
  previewUrl: string;
  compressedPreviewUrl: string;
  settings: ImageSettings | null; // null = use global settings
  errorMessage: string;
}

function generateId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMimeType(file: File, format: OutputFormat): string {
  if (format === 'original') return file.type || 'image/png';
  const map: Record<string, string> = {
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };
  return map[format] ?? file.type;
}

function getOutputExtension(format: OutputFormat, originalName: string): string {
  if (format === 'original') return '';
  const extMap: Record<string, string> = { webp: '.webp', jpeg: '.jpg', png: '.png' };
  return extMap[format] ?? '';
}

function getOutputFilename(originalName: string, format: OutputFormat): string {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const newExt = getOutputExtension(format, originalName);
  if (newExt) return `${baseName}${newExt}`;
  // Keep original extension
  return originalName;
}

export function useImageCompressor() {
  const images = ref<CompressImage[]>([]);
  const isCompressing = ref(false);

  // Global settings
  const globalSettings = reactive<ImageSettings>({
    quality: 80,
    outputFormat: 'original' as OutputFormat,
    maxWidth: undefined,
    maxHeight: undefined,
    scale: undefined,
  });

  // When global settings change, mark all 'done' images as 'pending' so they can be re-compressed
  watch(
    () => ({ ...globalSettings }),
    () => {
      for (const img of images.value) {
        if (img.status === 'done' && !img.settings) {
          img.status = 'pending';
          img.progress = 0;
        }
      }
    },
  );

  // --- Computed ---
  const totalOriginalSize = computed(() =>
    images.value.reduce((sum, img) => sum + img.originalSize, 0),
  );

  const totalCompressedSize = computed(() =>
    images.value
      .filter((img) => img.status === 'done')
      .reduce((sum, img) => sum + img.compressedSize, 0),
  );

  const totalSavingsPercent = computed(() => {
    const doneImages = images.value.filter((img) => img.status === 'done');
    if (doneImages.length === 0) return 0;
    const origTotal = doneImages.reduce((s, i) => s + i.originalSize, 0);
    if (origTotal === 0) return 0;
    const compTotal = doneImages.reduce((s, i) => s + i.compressedSize, 0);
    return Math.round(((origTotal - compTotal) / origTotal) * 100);
  });

  const hasCompressedImages = computed(() =>
    images.value.some((img) => img.status === 'done'),
  );

  const hasPendingImages = computed(() =>
    images.value.some((img) => img.status === 'pending'),
  );

  // --- Add images ---
  function addFiles(files: File[]) {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;

      const img: CompressImage = {
        id: generateId(),
        originalFile: file,
        originalSize: file.size,
        compressedBlob: null,
        compressedSize: 0,
        progress: 0,
        status: 'pending',
        previewUrl: URL.createObjectURL(file),
        compressedPreviewUrl: '',
        settings: null,
        errorMessage: '',
      };

      images.value.push(img);
    }
  }

  // --- Compress single image on main thread using Canvas ---
  function compressOnMainThread(img: CompressImage, settings: ImageSettings): Promise<void> {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        try {
          let targetWidth = image.naturalWidth;
          let targetHeight = image.naturalHeight;

          // Apply scale (only if explicitly set and valid)
          if (typeof settings.scale === 'number' && settings.scale > 0 && settings.scale !== 100) {
            const factor = settings.scale / 100;
            targetWidth = Math.round(targetWidth * factor);
            targetHeight = Math.round(targetHeight * factor);
          }

          // Apply max dimensions (only if explicitly set and valid)
          if (typeof settings.maxWidth === 'number' && settings.maxWidth > 0 && targetWidth > settings.maxWidth) {
            const ratio = settings.maxWidth / targetWidth;
            targetWidth = settings.maxWidth;
            targetHeight = Math.round(targetHeight * ratio);
          }
          if (typeof settings.maxHeight === 'number' && settings.maxHeight > 0 && targetHeight > settings.maxHeight) {
            const ratio = settings.maxHeight / targetHeight;
            targetHeight = settings.maxHeight;
            targetWidth = Math.round(targetWidth * ratio);
          }

          // Safety: ensure dimensions are at least 1px
          targetWidth = Math.max(1, targetWidth);
          targetHeight = Math.max(1, targetHeight);

          img.progress = 40;

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            img.status = 'error';
            img.errorMessage = 'Could not create canvas context';
            resolve();
            return;
          }

          ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
          img.progress = 60;

          const outputMime = getMimeType(img.originalFile, settings.outputFormat);
          const quality = outputMime === 'image/png' ? undefined : settings.quality / 100;

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                img.status = 'error';
                img.errorMessage = 'Compression failed';
                resolve();
                return;
              }

              img.progress = 100;
              img.compressedBlob = blob;
              img.compressedSize = blob.size;
              if (img.compressedPreviewUrl) URL.revokeObjectURL(img.compressedPreviewUrl);
              img.compressedPreviewUrl = URL.createObjectURL(blob);
              img.status = 'done';
              resolve();
            },
            outputMime,
            quality,
          );
        } catch (err) {
          img.status = 'error';
          img.errorMessage = err instanceof Error ? err.message : 'Unknown error';
          resolve();
        }
      };

      image.onerror = () => {
        img.status = 'error';
        img.errorMessage = 'Failed to load image';
        resolve();
      };

      img.progress = 10;
      image.src = img.previewUrl;
    });
  }

  // --- Compress single image using Web Worker ---
  function compressWithWorker(img: CompressImage, settings: ImageSettings): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const worker = new Worker(
          new URL('~/workers/imageCompressor.worker.ts', import.meta.url),
          { type: 'module' },
        );

        const timeout = setTimeout(() => {
          worker.terminate();
          resolve(false); // Fall back to main thread
        }, 30_000);

        worker.onmessage = (event) => {
          const data = event.data;
          if (data.id !== img.id) return;

          if (data.type === 'progress') {
            img.progress = data.progress;
          } else if (data.type === 'result') {
            clearTimeout(timeout);
            const blob = new Blob([data.compressedData], { type: data.compressedMimeType });
            img.compressedBlob = blob;
            img.compressedSize = blob.size;
            if (img.compressedPreviewUrl) URL.revokeObjectURL(img.compressedPreviewUrl);
            img.compressedPreviewUrl = URL.createObjectURL(blob);
            img.progress = 100;
            img.status = 'done';
            worker.terminate();
            resolve(true);
          } else if (data.type === 'error') {
            clearTimeout(timeout);
            worker.terminate();
            if (data.error === 'FALLBACK_TO_MAIN') {
              resolve(false); // Signal to use main thread
            } else {
              img.status = 'error';
              img.errorMessage = data.error;
              resolve(true);
            }
          }
        };

        worker.onerror = () => {
          clearTimeout(timeout);
          worker.terminate();
          resolve(false); // Fall back to main thread
        };

        // Read file and send to worker
        img.originalFile.arrayBuffer().then((buffer) => {
          worker.postMessage(
            {
              type: 'compress',
              id: img.id,
              imageData: buffer,
              mimeType: img.originalFile.type,
              settings: {
                quality: settings.quality,
                outputFormat: settings.outputFormat,
                maxWidth: settings.maxWidth,
                maxHeight: settings.maxHeight,
                scale: settings.scale,
              },
            },
            [buffer],
          );
        }).catch(() => {
          clearTimeout(timeout);
          worker.terminate();
          resolve(false);
        });
      } catch {
        resolve(false); // Workers not supported, fall back
      }
    });
  }

  // --- Compress single image (tries worker, falls back to main thread) ---
  async function compressSingle(img: CompressImage) {
    const settings = img.settings ?? globalSettings;
    img.status = 'compressing';
    img.progress = 0;
    img.errorMessage = '';

    // Try Web Worker first
    const workerHandled = await compressWithWorker(img, settings);
    if (!workerHandled && img.status !== 'done' && img.status !== 'error') {
      // Fallback to main thread
      await compressOnMainThread(img, settings);
    }
  }

  // --- Compress all (sequentially) ---
  async function compressAll() {
    if (isCompressing.value) return;
    isCompressing.value = true;

    for (const img of images.value) {
      if (img.status === 'pending' || img.status === 'error') {
        await compressSingle(img);
      }
    }

    isCompressing.value = false;
  }

  // --- Download single ---
  function downloadSingle(img: CompressImage) {
    if (!img.compressedBlob) return;
    const settings = img.settings ?? globalSettings;
    const filename = getOutputFilename(img.originalFile.name, settings.outputFormat);
    const url = URL.createObjectURL(img.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Download all as ZIP ---
  async function downloadAllAsZip() {
    const doneImages = images.value.filter((img) => img.status === 'done' && img.compressedBlob);
    if (doneImages.length === 0) return;

    const { default: JSZip } = await import('jszip');
    const zip = new JSZip();

    const usedNames = new Set<string>();
    for (const img of doneImages) {
      const settings = img.settings ?? globalSettings;
      let filename = getOutputFilename(img.originalFile.name, settings.outputFormat);

      // Deduplicate filenames
      let counter = 1;
      const baseName = filename.replace(/\.[^.]+$/, '');
      const ext = filename.slice(baseName.length);
      while (usedNames.has(filename)) {
        filename = `${baseName}_${counter}${ext}`;
        counter++;
      }
      usedNames.add(filename);

      zip.file(filename, img.compressedBlob!);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compressed-images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Remove single ---
  function removeImage(id: string) {
    const idx = images.value.findIndex((img) => img.id === id);
    if (idx === -1) return;
    const img = images.value[idx];
    URL.revokeObjectURL(img.previewUrl);
    if (img.compressedPreviewUrl) URL.revokeObjectURL(img.compressedPreviewUrl);
    images.value.splice(idx, 1);
  }

  // --- Clear all ---
  function clearAll() {
    for (const img of images.value) {
      URL.revokeObjectURL(img.previewUrl);
      if (img.compressedPreviewUrl) URL.revokeObjectURL(img.compressedPreviewUrl);
    }
    images.value = [];
  }

  // --- Per-image savings ---
  function getSavings(img: CompressImage): { text: string; percent: number } {
    if (img.status !== 'done' || !img.compressedBlob) {
      return { text: '', percent: 0 };
    }
    const saved = img.originalSize - img.compressedSize;
    const percent = Math.round((saved / img.originalSize) * 100);
    const bigger = percent < 0;
    return {
      text: `${formatBytes(img.originalSize)} → ${formatBytes(img.compressedSize)} (${bigger ? Math.abs(percent) + '% larger' : percent + '% smaller'})`,
      percent,
    };
  }

  // Cleanup on unmount
  onUnmounted(() => {
    clearAll();
  });

  return {
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
  };
}
