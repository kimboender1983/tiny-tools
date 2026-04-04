<script setup lang="ts">
    import type { IMedia } from "@tiny-tools/shared";
    import {
        Contrast,
        CopyPlus,
        Crop,
        Download,
        Droplets,
        FlipHorizontal,
        FlipVertical,
        Loader2,
        RotateCcw,
        RotateCw,
        Save,
        Sun,
        Undo2,
        X,
    } from "lucide-vue-next";

    const props = defineProps<{
        mediaItem: IMedia | null;
        open: boolean;
    }>();

    const emit = defineEmits<{
        close: [];
        saved: [media: IMedia];
    }>();

    const cms = useCms();

    // State
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const saving = ref(false);
    const showSaveOptions = ref(false);
    const activeTab = ref<"crop" | "adjust" | "filters">("crop");
    const loading = ref(false);

    // Image data
    let originalImage: HTMLImageElement | null = null;
    let currentImageData: ImageData | null = null;

    // Transform state
    const rotation = ref(0);
    const flipH = ref(false);
    const flipV = ref(false);

    // Adjust state
    const brightness = ref(0);
    const contrast = ref(0);
    const saturation = ref(0);

    // Crop state
    const isCropping = ref(false);
    const cropRect = reactive({ x: 0, y: 0, w: 0, h: 0 });
    let cropDragging = false;
    let cropHandle = "";
    let cropStartX = 0;
    let cropStartY = 0;
    let cropStartRect = { x: 0, y: 0, w: 0, h: 0 };

    // History
    const history = ref<ImageData[]>([]);
    const historyIndex = ref(-1);

    function resetState() {
        rotation.value = 0;
        flipH.value = false;
        flipV.value = false;
        brightness.value = 0;
        contrast.value = 0;
        saturation.value = 0;
        isCropping.value = false;
        history.value = [];
        historyIndex.value = -1;
        showSaveOptions.value = false;
        activeTab.value = "crop";
    }

    function getCanvas(): HTMLCanvasElement {
        const canvas = canvasRef.value;
        if (!canvas) throw new Error("Canvas not available");
        return canvas;
    }

    function getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get 2d context");
        return ctx;
    }

    function pushHistory() {
        const canvas = canvasRef.value;
        if (!canvas) return;
        const ctx = getContext(canvas);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // Discard redo states
        history.value = history.value.slice(0, historyIndex.value + 1);
        history.value.push(data);
        historyIndex.value = history.value.length - 1;
    }

    function undo() {
        if (historyIndex.value <= 0) return;
        historyIndex.value--;
        const data = history.value[historyIndex.value];
        const canvas = getCanvas();
        canvas.width = data.width;
        canvas.height = data.height;
        const ctx = getContext(canvas);
        ctx.putImageData(data, 0, 0);
        // Reset adjustments since we restored a snapshot
        brightness.value = 0;
        contrast.value = 0;
        saturation.value = 0;
        rotation.value = 0;
        flipH.value = false;
        flipV.value = false;
    }

    async function waitForCanvas(): Promise<HTMLCanvasElement> {
        // The Transition wrapper may delay DOM rendering, so poll for the ref
        for (let i = 0; i < 20; i++) {
            if (canvasRef.value) return canvasRef.value;
            await new Promise((r) => setTimeout(r, 50));
        }
        throw new Error("Canvas not available");
    }

    async function loadImage() {
        if (!props.mediaItem) return;
        loading.value = true;

        try {
            const canvas = await waitForCanvas();

            // Fetch via API proxy to avoid CORS issues with cross-origin R2 images
            const config = useRuntimeConfig();
            const apiUrl = config.public.apiUrl as string;
            const token = useCookie("auth_token").value;
            const response = await fetch(`${apiUrl}/cms/media/${props.mediaItem._id}/raw`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            const img = new Image();
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error("Failed to load image"));
                img.src = objectUrl;
            });

            originalImage = img;
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = getContext(canvas);
            ctx.drawImage(img, 0, 0);
            currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            URL.revokeObjectURL(objectUrl);
            pushHistory();
        } catch (e) {
            console.error("Failed to load image in editor:", e);
        } finally {
            loading.value = false;
        }
    }

    // --- Drawing ---
    function redrawCanvas() {
        const canvas = canvasRef.value;
        if (!canvas || !currentImageData) return;
        canvas.width = currentImageData.width;
        canvas.height = currentImageData.height;
        const ctx = getContext(canvas);
        ctx.putImageData(currentImageData, 0, 0);
    }

    // --- Transforms ---
    function rotate(deg: number) {
        const canvas = getCanvas();
        const ctx = getContext(canvas);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Create temp canvas with current image
        const tmp = document.createElement("canvas");
        tmp.width = canvas.width;
        tmp.height = canvas.height;
        tmp.getContext("2d")?.putImageData(imgData, 0, 0);

        // Swap dimensions for 90/270
        if (Math.abs(deg) === 90) {
            canvas.width = imgData.height;
            canvas.height = imgData.width;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((deg * Math.PI) / 180);
        ctx.drawImage(tmp, -tmp.width / 2, -tmp.height / 2);
        ctx.restore();

        currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        pushHistory();
    }

    function flip(direction: "h" | "v") {
        const canvas = getCanvas();
        const ctx = getContext(canvas);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const tmp = document.createElement("canvas");
        tmp.width = canvas.width;
        tmp.height = canvas.height;
        tmp.getContext("2d")?.putImageData(imgData, 0, 0);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        if (direction === "h") {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
        }
        ctx.drawImage(tmp, 0, 0);
        ctx.restore();

        currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        pushHistory();
    }

    // --- Adjustments ---
    function applyAdjustments() {
        if (!currentImageData) return;
        const canvas = getCanvas();
        const ctx = getContext(canvas);

        // Start from the current base (last history entry before adjustments)
        const baseData = history.value[historyIndex.value];
        if (!baseData) return;

        const src = baseData.data;
        const result = ctx.createImageData(baseData.width, baseData.height);
        const dst = result.data;

        const br = brightness.value / 100;
        const co = (contrast.value + 100) / 100;
        const sa = saturation.value / 100;

        for (let i = 0; i < src.length; i += 4) {
            let r = src[i];
            let g = src[i + 1];
            let b = src[i + 2];

            // Brightness
            r += 255 * br;
            g += 255 * br;
            b += 255 * br;

            // Contrast
            r = ((r / 255 - 0.5) * co + 0.5) * 255;
            g = ((g / 255 - 0.5) * co + 0.5) * 255;
            b = ((b / 255 - 0.5) * co + 0.5) * 255;

            // Saturation
            const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            r = gray + (r - gray) * (1 + sa);
            g = gray + (g - gray) * (1 + sa);
            b = gray + (b - gray) * (1 + sa);

            dst[i] = Math.max(0, Math.min(255, r));
            dst[i + 1] = Math.max(0, Math.min(255, g));
            dst[i + 2] = Math.max(0, Math.min(255, b));
            dst[i + 3] = src[i + 3];
        }

        canvas.width = baseData.width;
        canvas.height = baseData.height;
        ctx.putImageData(result, 0, 0);
    }

    // Watch adjustments for live preview
    watch([brightness, contrast, saturation], () => {
        applyAdjustments();
    });

    function commitAdjustments() {
        if (brightness.value === 0 && contrast.value === 0 && saturation.value === 0) return;
        const canvas = getCanvas();
        const ctx = getContext(canvas);
        currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        pushHistory();
        brightness.value = 0;
        contrast.value = 0;
        saturation.value = 0;
    }

    // --- Filters ---
    type FilterName = "grayscale" | "sepia" | "warm" | "cool" | "vintage" | "dramatic";

    const filters: { name: FilterName; label: string }[] = [
        { name: "grayscale", label: "Grayscale" },
        { name: "sepia", label: "Sepia" },
        { name: "warm", label: "Warm" },
        { name: "cool", label: "Cool" },
        { name: "vintage", label: "Vintage" },
        { name: "dramatic", label: "Dramatic" },
    ];

    function applyFilter(name: FilterName) {
        const canvas = getCanvas();
        const ctx = getContext(canvas);

        // Start from current state
        const baseData = history.value[historyIndex.value];
        if (!baseData) return;

        const result = ctx.createImageData(baseData.width, baseData.height);
        const src = baseData.data;
        const dst = result.data;

        for (let i = 0; i < src.length; i += 4) {
            let r = src[i],
                g = src[i + 1],
                b = src[i + 2];

            switch (name) {
                case "grayscale": {
                    const avg = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    r = g = b = avg;
                    break;
                }
                case "sepia": {
                    const tr = 0.393 * r + 0.769 * g + 0.189 * b;
                    const tg = 0.349 * r + 0.686 * g + 0.168 * b;
                    const tb = 0.272 * r + 0.534 * g + 0.131 * b;
                    r = tr;
                    g = tg;
                    b = tb;
                    break;
                }
                case "warm":
                    r = Math.min(255, r + 20);
                    g = Math.min(255, g + 10);
                    b = Math.max(0, b - 10);
                    break;
                case "cool":
                    r = Math.max(0, r - 10);
                    g = Math.min(255, g + 5);
                    b = Math.min(255, b + 20);
                    break;
                case "vintage": {
                    const avg = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    r = avg * 0.6 + r * 0.4 + 20;
                    g = avg * 0.6 + g * 0.4 + 10;
                    b = avg * 0.6 + b * 0.4 - 10;
                    break;
                }
                case "dramatic": {
                    const c = 1.4;
                    r = ((r / 255 - 0.5) * c + 0.5) * 255;
                    g = ((g / 255 - 0.5) * c + 0.5) * 255;
                    b = ((b / 255 - 0.5) * c + 0.5) * 255;
                    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    r = gray + (r - gray) * 1.2;
                    g = gray + (g - gray) * 1.2;
                    b = gray + (b - gray) * 1.2;
                    break;
                }
            }

            dst[i] = Math.max(0, Math.min(255, r));
            dst[i + 1] = Math.max(0, Math.min(255, g));
            dst[i + 2] = Math.max(0, Math.min(255, b));
            dst[i + 3] = src[i + 3];
        }

        canvas.width = baseData.width;
        canvas.height = baseData.height;
        ctx.putImageData(result, 0, 0);
        currentImageData = result;
        pushHistory();
    }

    // --- Crop ---
    function startCrop() {
        const canvas = getCanvas();
        isCropping.value = true;
        // Use display dimensions for the crop rect (CSS pixels, not canvas pixels)
        const displayRect = canvas.getBoundingClientRect();
        const margin = 0.1;
        cropRect.x = Math.round(displayRect.width * margin);
        cropRect.y = Math.round(displayRect.height * margin);
        cropRect.w = Math.round(displayRect.width * (1 - 2 * margin));
        cropRect.h = Math.round(displayRect.height * (1 - 2 * margin));
    }

    function applyCrop() {
        const canvas = getCanvas();
        const ctx = getContext(canvas);

        // Get the display-to-canvas ratio
        const displayRect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / displayRect.width;
        const scaleY = canvas.height / displayRect.height;

        const sx = Math.round(cropRect.x * scaleX);
        const sy = Math.round(cropRect.y * scaleY);
        const sw = Math.round(cropRect.w * scaleX);
        const sh = Math.round(cropRect.h * scaleY);

        const cropped = ctx.getImageData(sx, sy, Math.max(1, sw), Math.max(1, sh));

        canvas.width = cropped.width;
        canvas.height = cropped.height;
        ctx.putImageData(cropped, 0, 0);
        currentImageData = cropped;
        isCropping.value = false;
        pushHistory();
    }

    function cancelCrop() {
        isCropping.value = false;
    }

    // Crop interaction
    function getCropHandle(ex: number, ey: number): string {
        const r = cropRect;
        const threshold = 10;

        const nearLeft = Math.abs(ex - r.x) < threshold;
        const nearRight = Math.abs(ex - (r.x + r.w)) < threshold;
        const nearTop = Math.abs(ey - r.y) < threshold;
        const nearBottom = Math.abs(ey - (r.y + r.h)) < threshold;

        if (nearTop && nearLeft) return "tl";
        if (nearTop && nearRight) return "tr";
        if (nearBottom && nearLeft) return "bl";
        if (nearBottom && nearRight) return "br";
        if (nearTop) return "t";
        if (nearBottom) return "b";
        if (nearLeft) return "l";
        if (nearRight) return "r";
        if (ex > r.x && ex < r.x + r.w && ey > r.y && ey < r.y + r.h) return "move";
        return "";
    }

    function onCropMouseDown(e: MouseEvent) {
        if (!isCropping.value) return;
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const ex = e.clientX - rect.left;
        const ey = e.clientY - rect.top;
        cropHandle = getCropHandle(ex, ey);
        if (!cropHandle) return;
        cropDragging = true;
        cropStartX = ex;
        cropStartY = ey;
        cropStartRect = { ...cropRect };
        e.preventDefault();
    }

    function onCropMouseMove(e: MouseEvent) {
        if (!cropDragging || !isCropping.value) return;
        const canvas = getCanvas();
        const rect = canvas.parentElement?.getBoundingClientRect();
        const ex = e.clientX - rect.left;
        const ey = e.clientY - rect.top;
        const dx = ex - cropStartX;
        const dy = ey - cropStartY;
        const maxW = rect.width;
        const maxH = rect.height;

        if (cropHandle === "move") {
            cropRect.x = Math.max(0, Math.min(maxW - cropRect.w, cropStartRect.x + dx));
            cropRect.y = Math.max(0, Math.min(maxH - cropRect.h, cropStartRect.y + dy));
        } else {
            if (cropHandle.includes("l")) {
                const newX = Math.max(0, cropStartRect.x + dx);
                cropRect.w = cropStartRect.w + (cropStartRect.x - newX);
                cropRect.x = newX;
            }
            if (cropHandle.includes("r")) {
                cropRect.w = Math.min(maxW - cropRect.x, Math.max(20, cropStartRect.w + dx));
            }
            if (cropHandle.includes("t")) {
                const newY = Math.max(0, cropStartRect.y + dy);
                cropRect.h = cropStartRect.h + (cropStartRect.y - newY);
                cropRect.y = newY;
            }
            if (cropHandle.includes("b")) {
                cropRect.h = Math.min(maxH - cropRect.y, Math.max(20, cropStartRect.h + dy));
            }
        }
    }

    function onCropMouseUp() {
        cropDragging = false;
        cropHandle = "";
    }

    // --- Save ---
    function base64ToBlob(base64: string, mimeType: string): Blob {
        const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
        const byteChars = atob(base64Data);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
        }
        return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
    }

    function getEditedDataUrl(): string {
        return canvasRef.value?.toDataURL("image/png");
    }

    async function saveAsOriginal() {
        if (!props.mediaItem) return;
        saving.value = true;
        try {
            const dataUrl = getEditedDataUrl();
            const blob = base64ToBlob(dataUrl, "image/png");
            const updated = await cms.media.replace(
                props.mediaItem._id,
                blob,
                props.mediaItem.filename,
            );
            showSaveOptions.value = false;
            emit("saved", updated);
        } catch {
            /* */
        } finally {
            saving.value = false;
        }
    }

    async function saveAsCopy() {
        if (!props.mediaItem) return;
        saving.value = true;
        try {
            const dataUrl = getEditedDataUrl();
            const blob = base64ToBlob(dataUrl, "image/png");
            const origName = props.mediaItem.filename;
            const dotIndex = origName.lastIndexOf(".");
            const nameWithoutExt = dotIndex > 0 ? origName.slice(0, dotIndex) : origName;
            const file = new File([blob], `${nameWithoutExt}-edited.png`, { type: "image/png" });
            const newMedia = await cms.media.upload(file);
            showSaveOptions.value = false;
            emit("saved", newMedia);
        } catch {
            /* */
        } finally {
            saving.value = false;
        }
    }

    function handleClose() {
        resetState();
        emit("close");
    }

    watch(
        () => props.open,
        async (isOpen) => {
            if (isOpen && props.mediaItem) {
                resetState();
                await nextTick();
                await loadImage();
            }
        },
    );

    onMounted(() => {
        window.addEventListener("mousemove", onCropMouseMove);
        window.addEventListener("mouseup", onCropMouseUp);
    });

    onBeforeUnmount(() => {
        window.removeEventListener("mousemove", onCropMouseMove);
        window.removeEventListener("mouseup", onCropMouseUp);
    });
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex flex-col bg-gray-900"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-semibold text-gray-100">
              Edit: {{ mediaItem?.filename }}
            </h3>
            <button
              :disabled="historyIndex <= 0"
              class="p-1.5 rounded text-gray-400 hover:text-gray-200 disabled:opacity-30 transition-colors"
              title="Undo"
              @click="undo"
            >
              <Undo2 :size="16" />
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
              @click="showSaveOptions = true"
            >
              <Save :size="14" />
              Save
            </button>
            <button
              class="p-1.5 text-gray-400 hover:text-gray-200 transition-colors"
              @click="handleClose"
            >
              <X :size="18" />
            </button>
          </div>
        </div>

        <div class="flex flex-1 min-h-0">
          <!-- Sidebar -->
          <div class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col shrink-0 overflow-auto">
            <!-- Tabs -->
            <div class="flex border-b border-gray-700">
              <button
                v-for="tab in (['crop', 'adjust', 'filters'] as const)"
                :key="tab"
                class="flex-1 px-2 py-2.5 text-xs font-medium transition-colors capitalize"
                :class="activeTab === tab
                  ? 'text-brand-400 border-b-2 border-brand-400'
                  : 'text-gray-400 hover:text-gray-200'"
                @click="activeTab = tab"
              >
                {{ tab }}
              </button>
            </div>

            <div class="p-3 space-y-3">
              <!-- Crop tab -->
              <template v-if="activeTab === 'crop'">
                <!-- Transform buttons -->
                <div>
                  <p class="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Transform</p>
                  <div class="grid grid-cols-2 gap-1.5">
                    <button class="editor-btn" @click="rotate(-90)">
                      <RotateCcw :size="14" />
                      <span>Rotate L</span>
                    </button>
                    <button class="editor-btn" @click="rotate(90)">
                      <RotateCw :size="14" />
                      <span>Rotate R</span>
                    </button>
                    <button class="editor-btn" @click="flip('h')">
                      <FlipHorizontal :size="14" />
                      <span>Flip H</span>
                    </button>
                    <button class="editor-btn" @click="flip('v')">
                      <FlipVertical :size="14" />
                      <span>Flip V</span>
                    </button>
                  </div>
                </div>

                <div>
                  <p class="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-2">Crop</p>
                  <template v-if="!isCropping">
                    <button class="editor-btn w-full justify-center" @click="startCrop">
                      <Crop :size="14" />
                      <span>Start crop</span>
                    </button>
                  </template>
                  <template v-else>
                    <div class="flex gap-1.5">
                      <button
                        class="flex-1 px-2 py-1.5 text-xs font-medium rounded bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                        @click="applyCrop"
                      >
                        Apply
                      </button>
                      <button
                        class="flex-1 px-2 py-1.5 text-xs font-medium rounded bg-gray-600 text-gray-200 hover:bg-gray-500 transition-colors"
                        @click="cancelCrop"
                      >
                        Cancel
                      </button>
                    </div>
                    <p class="text-[10px] text-gray-500 mt-1.5">Drag corners or edges to resize. Drag inside to move.</p>
                  </template>
                </div>
              </template>

              <!-- Adjust tab -->
              <template v-if="activeTab === 'adjust'">
                <div>
                  <label class="flex items-center gap-1.5 text-xs text-gray-300 mb-1.5">
                    <Sun :size="12" />
                    Brightness
                    <span class="ml-auto text-gray-500">{{ brightness }}</span>
                  </label>
                  <input
                    v-model.number="brightness"
                    type="range"
                    min="-100"
                    max="100"
                    class="editor-slider"
                  />
                </div>
                <div>
                  <label class="flex items-center gap-1.5 text-xs text-gray-300 mb-1.5">
                    <Contrast :size="12" />
                    Contrast
                    <span class="ml-auto text-gray-500">{{ contrast }}</span>
                  </label>
                  <input
                    v-model.number="contrast"
                    type="range"
                    min="-100"
                    max="100"
                    class="editor-slider"
                  />
                </div>
                <div>
                  <label class="flex items-center gap-1.5 text-xs text-gray-300 mb-1.5">
                    <Droplets :size="12" />
                    Saturation
                    <span class="ml-auto text-gray-500">{{ saturation }}</span>
                  </label>
                  <input
                    v-model.number="saturation"
                    type="range"
                    min="-100"
                    max="100"
                    class="editor-slider"
                  />
                </div>
                <button
                  :disabled="brightness === 0 && contrast === 0 && saturation === 0"
                  class="w-full px-2 py-1.5 text-xs font-medium rounded bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-30 transition-colors"
                  @click="commitAdjustments"
                >
                  Apply adjustments
                </button>
              </template>

              <!-- Filters tab -->
              <template v-if="activeTab === 'filters'">
                <div class="grid grid-cols-2 gap-1.5">
                  <button
                    v-for="f in filters"
                    :key="f.name"
                    class="editor-btn justify-center"
                    @click="applyFilter(f.name)"
                  >
                    {{ f.label }}
                  </button>
                </div>
              </template>
            </div>
          </div>

          <!-- Canvas area -->
          <div class="flex-1 flex items-center justify-center bg-gray-950 p-6 relative overflow-hidden">
            <div v-if="loading" class="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 :size="32" class="animate-spin text-gray-500" />
            </div>
            <div class="relative inline-block max-w-full max-h-full" :class="{ 'opacity-0': loading }">
              <canvas
                ref="canvasRef"
                class="max-w-full max-h-[calc(100vh-8rem)] object-contain rounded shadow-lg"
                :class="{ 'cursor-crosshair': isCropping }"
              />
              <!-- Crop overlay -->
              <div
                v-if="isCropping"
                class="absolute inset-0"
                @mousedown="onCropMouseDown"
              >
                <!-- Dim outside crop area -->
                <div
                  class="absolute inset-0 bg-black/50 pointer-events-none"
                  :style="{
                    clipPath: `polygon(0% 0%, 0% 100%, ${cropRect.x}px 100%, ${cropRect.x}px ${cropRect.y}px, ${cropRect.x + cropRect.w}px ${cropRect.y}px, ${cropRect.x + cropRect.w}px ${cropRect.y + cropRect.h}px, ${cropRect.x}px ${cropRect.y + cropRect.h}px, ${cropRect.x}px 100%, 100% 100%, 100% 0%)`
                  }"
                />
                <!-- Crop border -->
                <div
                  class="absolute border-2 border-white/80 pointer-events-none"
                  :style="{
                    left: `${cropRect.x}px`,
                    top: `${cropRect.y}px`,
                    width: `${cropRect.w}px`,
                    height: `${cropRect.h}px`,
                  }"
                >
                  <!-- Rule of thirds grid -->
                  <div class="absolute inset-0">
                    <div class="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                    <div class="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                    <div class="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                    <div class="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                  </div>
                  <!-- Corner handles -->
                  <div class="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-sm cursor-nw-resize" />
                  <div class="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-sm cursor-ne-resize" />
                  <div class="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-sm cursor-sw-resize" />
                  <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-sm cursor-se-resize" />
                  <!-- Edge handles -->
                  <div class="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-white rounded-full cursor-n-resize" />
                  <div class="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-white rounded-full cursor-s-resize" />
                  <div class="absolute top-1/2 -left-0.5 -translate-y-1/2 w-1.5 h-6 bg-white rounded-full cursor-w-resize" />
                  <div class="absolute top-1/2 -right-0.5 -translate-y-1/2 w-1.5 h-6 bg-white rounded-full cursor-e-resize" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Save options overlay -->
        <Transition
          enter-active-class="transition-opacity duration-150"
          enter-from-class="opacity-0"
          leave-active-class="transition-opacity duration-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showSaveOptions"
            class="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div class="bg-surface border border-surface-border rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 space-y-4">
              <h4 class="text-base font-semibold text-content">
                Save edited image
              </h4>
              <p class="text-sm text-content-muted">
                How would you like to save this image?
              </p>
              <div class="space-y-2">
                <button
                  :disabled="saving"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-surface-border hover:bg-surface-secondary transition-colors text-left disabled:opacity-50"
                  @click="saveAsOriginal"
                >
                  <Save :size="18" class="text-brand-500 shrink-0" />
                  <div>
                    <p class="text-sm font-medium text-content">Replace original</p>
                    <p class="text-xs text-content-muted">Overwrite the existing image</p>
                  </div>
                  <Loader2 v-if="saving" :size="16" class="ml-auto animate-spin text-gray-400" />
                </button>
                <button
                  :disabled="saving"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-surface-border hover:bg-surface-secondary transition-colors text-left disabled:opacity-50"
                  @click="saveAsCopy"
                >
                  <CopyPlus :size="18" class="text-brand-500 shrink-0" />
                  <div>
                    <p class="text-sm font-medium text-content">Save as copy</p>
                    <p class="text-xs text-content-muted">Keep original, create a new file</p>
                  </div>
                  <Loader2 v-if="saving" :size="16" class="ml-auto animate-spin text-gray-400" />
                </button>
              </div>
              <button
                :disabled="saving"
                class="w-full px-4 py-2 text-sm text-content-muted hover:text-content-secondary transition-colors"
                @click="showSaveOptions = false"
              >
                Cancel
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.editor-btn {
  @apply inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded
         text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors;
}

.editor-slider {
  @apply w-full h-1.5 rounded-full appearance-none cursor-pointer;
  background: linear-gradient(to right, #374151, #6b7280, #374151);
}

.editor-slider::-webkit-slider-thumb {
  @apply appearance-none w-3.5 h-3.5 rounded-full bg-white border-2 border-brand-500 cursor-pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.editor-slider::-moz-range-thumb {
  @apply w-3.5 h-3.5 rounded-full bg-white border-2 border-brand-500 cursor-pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
</style>
