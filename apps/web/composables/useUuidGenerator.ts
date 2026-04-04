export type UuidVersion = "v4" | "v7";

export interface UuidEntry {
    id: string;
    value: string;
    timestamp: number;
}

function generateV4(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    // Set version 4 (0100) in byte 6
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Set variant 1 (10xx) in byte 8
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return formatUuid(bytes);
}

function generateV7(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    // Unix timestamp in ms — 48 bits in bytes 0-5
    const now = Date.now();
    bytes[0] = (now / 2 ** 40) & 0xff;
    bytes[1] = (now / 2 ** 32) & 0xff;
    bytes[2] = (now / 2 ** 24) & 0xff;
    bytes[3] = (now / 2 ** 16) & 0xff;
    bytes[4] = (now / 2 ** 8) & 0xff;
    bytes[5] = now & 0xff;
    // Set version 7 (0111) in byte 6
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    // Set variant 1 (10xx) in byte 8
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return formatUuid(bytes);
}

function formatUuid(bytes: Uint8Array): string {
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function useUuidGenerator() {
    const version = ref<UuidVersion>("v4");
    const count = ref(1);
    const uppercase = ref(false);
    const uuids = ref<UuidEntry[]>([]);
    const history = ref<UuidEntry[]>([]);

    function formatOutput(uuid: string): string {
        let result = uuid;
        if (uppercase.value) result = result.toUpperCase();
        return result;
    }

    const formattedUuids = computed(() =>
        uuids.value.map((e) => ({ ...e, value: formatOutput(e.value) })),
    );

    const outputText = computed(() => formattedUuids.value.map((e) => e.value).join("\n"));

    function generate() {
        const fn = version.value === "v7" ? generateV7 : generateV4;
        const qty = Math.min(Math.max(1, count.value), 1000);
        const now = Date.now();
        const entries: UuidEntry[] = [];
        for (let i = 0; i < qty; i++) {
            const value = fn();
            entries.push({ id: `${now}-${i}`, value, timestamp: now });
        }
        uuids.value = entries;
        // Prepend to history (cap at 100)
        history.value = [...entries, ...history.value].slice(0, 100);
    }

    function clear() {
        uuids.value = [];
        history.value = [];
    }

    // Generate initial batch on mount
    onMounted(() => {
        generate();
    });

    return {
        version,
        count,
        uppercase,
        uuids,
        formattedUuids,
        outputText,
        history,
        generate,
        formatOutput,
        clear,
    };
}
