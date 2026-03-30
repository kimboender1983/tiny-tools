export interface CompressMessage {
  type: 'compress';
  id: string;
  imageData: ArrayBuffer;
  mimeType: string;
  settings: {
    quality: number;
    outputFormat: 'original' | 'webp' | 'jpeg' | 'png';
    maxWidth?: number;
    maxHeight?: number;
    scale?: number;
  };
}

export interface ProgressMessage {
  type: 'progress';
  id: string;
  progress: number;
}

export interface ResultMessage {
  type: 'result';
  id: string;
  compressedData: ArrayBuffer;
  compressedMimeType: string;
  width: number;
  height: number;
}

export interface ErrorMessage {
  type: 'error';
  id: string;
  error: string;
}

export type WorkerOutMessage = ProgressMessage | ResultMessage | ErrorMessage;

function getOutputMimeType(original: string, format: CompressMessage['settings']['outputFormat']): string {
  switch (format) {
    case 'webp': return 'image/webp';
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    default: return original;
  }
}

function getQualityForMime(mime: string, quality: number): number | undefined {
  // PNG is lossless, quality doesn't apply
  if (mime === 'image/png') return undefined;
  return quality / 100;
}

async function compressWithOffscreenCanvas(msg: CompressMessage): Promise<void> {
  const { id, imageData, mimeType, settings } = msg;

  try {
    self.postMessage({ type: 'progress', id, progress: 10 } satisfies ProgressMessage);

    const blob = new Blob([imageData], { type: mimeType });
    const bitmap = await createImageBitmap(blob);

    self.postMessage({ type: 'progress', id, progress: 30 } satisfies ProgressMessage);

    let targetWidth = bitmap.width;
    let targetHeight = bitmap.height;

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

    const outputMime = getOutputMimeType(mimeType, settings.outputFormat);

    // Use OffscreenCanvas if available
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(targetWidth, targetHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get 2D context from OffscreenCanvas');

      ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
      bitmap.close();

      self.postMessage({ type: 'progress', id, progress: 60 } satisfies ProgressMessage);

      const qualityVal = getQualityForMime(outputMime, settings.quality);
      const resultBlob = await canvas.convertToBlob({
        type: outputMime,
        quality: qualityVal,
      });

      self.postMessage({ type: 'progress', id, progress: 90 } satisfies ProgressMessage);

      const buffer = await resultBlob.arrayBuffer();

      self.postMessage(
        {
          type: 'result',
          id,
          compressedData: buffer,
          compressedMimeType: outputMime,
          width: targetWidth,
          height: targetHeight,
        } satisfies ResultMessage,
        [buffer] as unknown as Transferable[],
      );
    } else {
      // Fallback: send dimensions back so main thread can use regular Canvas
      self.postMessage({
        type: 'error',
        id,
        error: 'FALLBACK_TO_MAIN',
      } satisfies ErrorMessage);
      bitmap.close();
    }
  } catch (err) {
    self.postMessage({
      type: 'error',
      id,
      error: err instanceof Error ? err.message : String(err),
    } satisfies ErrorMessage);
  }
}

self.addEventListener('message', (event: MessageEvent<CompressMessage>) => {
  if (event.data.type === 'compress') {
    compressWithOffscreenCanvas(event.data);
  }
});
