export type Base64Mode = "encode" | "decode";

export interface Base64Error {
    message: string;
}

const STORAGE_KEY = "base64-state";

export function useBase64() {
    const input = ref("");
    const output = ref("");
    const mode = ref<Base64Mode>("encode");
    const error = ref<Base64Error | null>(null);
    const urlSafe = ref(false);

    const imagePreview = ref<string | null>(null);
    const sourceImagePreview = ref<string | null>(null);
    const sourceFileName = ref<string | null>(null);
    const dataUri = ref(false);

    // Stats
    const inputBytes = computed(() => new TextEncoder().encode(input.value).length);
    const outputBytes = computed(() => new TextEncoder().encode(output.value).length);

    // --- Session storage ---
    function saveState() {
        if (import.meta.server) return;
        try {
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    input: input.value,
                    mode: mode.value,
                    urlSafe: urlSafe.value,
                }),
            );
        } catch {
            // Ignore quota errors
        }
    }

    function restoreState() {
        if (import.meta.server) return;
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (saved.input) input.value = saved.input;
                if (saved.mode) mode.value = saved.mode;
                if (saved.urlSafe != null) urlSafe.value = saved.urlSafe;
            }
        } catch {
            // Ignore
        }
    }

    // --- Image detection ---
    function detectImageType(bytes: Uint8Array): string | null {
        if (bytes.length < 4) return null;
        // PNG: 89 50 4E 47
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
            return "image/png";
        // JPEG: FF D8 FF
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
        // GIF: 47 49 46 38
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38)
            return "image/gif";
        // WebP: 52 49 46 46 ... 57 45 42 50
        if (
            bytes[0] === 0x52 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x46 &&
            bytes[3] === 0x46 &&
            bytes.length > 11 &&
            bytes[8] === 0x57 &&
            bytes[9] === 0x45 &&
            bytes[10] === 0x42 &&
            bytes[11] === 0x50
        )
            return "image/webp";
        // SVG: starts with < (text-based, check for <svg)
        if (bytes[0] === 0x3c) {
            const head = new TextDecoder().decode(bytes.slice(0, 256)).toLowerCase();
            if (head.includes("<svg")) return "image/svg+xml";
        }
        // BMP: 42 4D
        if (bytes[0] === 0x42 && bytes[1] === 0x4d) return "image/bmp";
        // ICO: 00 00 01 00
        if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00)
            return "image/x-icon";
        return null;
    }

    function tryBuildImagePreview(b64Input: string): boolean {
        // Strip data URI prefix if present
        const dataUriMatch = b64Input.match(/^data:(image\/[^;]+);base64,(.+)$/s);
        let pureBase64: string;
        let knownMime: string | null = null;

        if (dataUriMatch) {
            knownMime = dataUriMatch[1];
            pureBase64 = dataUriMatch[2];
        } else {
            pureBase64 = b64Input;
        }

        // Normalize for atob
        let normalized = pureBase64.trim().replace(/-/g, "+").replace(/_/g, "/");
        const pad = normalized.length % 4;
        if (pad) normalized += "=".repeat(4 - pad);

        try {
            const binary = atob(normalized);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            const mime = knownMime || detectImageType(bytes);
            if (mime) {
                imagePreview.value = `data:${mime};base64,${normalized}`;
                return true;
            }
        } catch {
            // not valid base64
        }
        return false;
    }

    // --- Core processing ---
    function process() {
        const raw = input.value;
        if (!raw) {
            output.value = "";
            error.value = null;
            imagePreview.value = null;
            saveState();
            return;
        }

        imagePreview.value = null;

        try {
            if (mode.value === "encode") {
                // Text → Base64
                const bytes = new TextEncoder().encode(raw);
                let binary = "";
                for (const byte of bytes) {
                    binary += String.fromCharCode(byte);
                }
                let result = btoa(binary);
                if (urlSafe.value) {
                    result = result.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
                }
                output.value = result;
                error.value = null;
            } else {
                // Base64 → Text
                // Try image detection first
                if (tryBuildImagePreview(raw.trim())) {
                    output.value = "[Binary image data — see preview below]";
                    error.value = null;
                    saveState();
                    return;
                }

                let b64 = raw.trim();
                // Strip data URI prefix for text decoding too
                const dataUriTextMatch = b64.match(/^data:[^;]+;base64,(.+)$/s);
                if (dataUriTextMatch) b64 = dataUriTextMatch[1];

                if (urlSafe.value) {
                    b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
                    const pad = b64.length % 4;
                    if (pad) b64 += "=".repeat(4 - pad);
                }
                const binary = atob(b64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                output.value = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
                error.value = null;
            }
        } catch (e) {
            output.value = "";
            if (mode.value === "decode") {
                error.value = {
                    message: "Invalid Base64 string. Check for incorrect characters or padding.",
                };
            } else {
                error.value = {
                    message: `Encoding failed: ${e instanceof Error ? e.message : "Unknown error"}`,
                };
            }
        }

        saveState();
    }

    // Debounced watcher
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    watch([input, mode, urlSafe], () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(process, 100);
    });

    function clear() {
        input.value = "";
        output.value = "";
        error.value = null;
        imagePreview.value = null;
        sourceImagePreview.value = null;
        sourceFileName.value = null;
        _lastImageB64 = null;
        _lastImageMime = null;
        saveState();
    }

    function swap() {
        const currentOutput = output.value;
        if (!currentOutput || error.value) return;
        mode.value = mode.value === "encode" ? "decode" : "encode";
        input.value = currentOutput;
    }

    function loadSample(text: string) {
        input.value = text;
    }

    // File handling
    function handleFile(file: File) {
        const isImage = file.type.startsWith("image/");

        // Auto-switch to encode mode for any file upload
        if (isImage) {
            mode.value = "encode";
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (mode.value === "encode") {
                const arrayBuffer = reader.result as ArrayBuffer;
                const bytes = new Uint8Array(arrayBuffer);
                let binary = "";
                for (const byte of bytes) {
                    binary += String.fromCharCode(byte);
                }
                let b64 = btoa(binary);
                if (urlSafe.value) {
                    b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
                }

                input.value = `[File: ${file.name}]`;
                sourceFileName.value = file.name;

                if (isImage) {
                    // Show source image preview
                    sourceImagePreview.value = URL.createObjectURL(file);
                    // Output as data URI or raw base64
                    output.value = dataUri.value ? `data:${file.type};base64,${b64}` : b64;
                    // Store the raw base64 and mime for toggling
                    _lastImageB64 = b64;
                    _lastImageMime = file.type;
                } else {
                    sourceImagePreview.value = null;
                    output.value = b64;
                    _lastImageB64 = null;
                    _lastImageMime = null;
                }

                error.value = null;
                imagePreview.value = null;
                saveState();
            } else {
                // Read file as text (expecting base64 content)
                input.value = reader.result as string;
            }
        };
        reader.onerror = () => {
            error.value = { message: `Failed to read file: ${file.name}` };
        };
        if (mode.value === "encode" || isImage) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    }

    // Track last encoded image for data URI toggle
    let _lastImageB64: string | null = null;
    let _lastImageMime: string | null = null;

    watch(dataUri, () => {
        if (_lastImageB64 && _lastImageMime) {
            output.value = dataUri.value
                ? `data:${_lastImageMime};base64,${_lastImageB64}`
                : _lastImageB64;
        }
    });

    // Restore on mount
    onMounted(() => {
        restoreState();
        if (input.value.trim()) process();
    });

    onUnmounted(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
    });

    return {
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
    };
}
