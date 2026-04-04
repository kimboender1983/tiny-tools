import { defineStore, skipHydrate } from "pinia";

const MAX_RECENT_TOOLS = 5;
const RECENT_TOOLS_KEY = "pickbox:recent-tools";

export const useAppStore = defineStore("app", () => {
    // ── Theme ────────────────────────────────────────────────────────
    // useColorMode() is kept outside Pinia's hydration — it manages its
    // own SSR state via the color-mode module.
    const colorMode = useColorMode();
    const theme = computed({
        get: () =>
            colorMode.preference as "light" | "dark" | "vibrant" | "party" | "grayscale" | "system",
        set: (value: "light" | "dark" | "vibrant" | "party" | "grayscale" | "system") => {
            colorMode.preference = value;
        },
    });

    // ── Recent Tools ─────────────────────────────────────────────────
    const recentTools = ref<string[]>([]);

    function loadRecentTools(): string[] {
        if (import.meta.server) return [];
        try {
            const stored = localStorage.getItem(RECENT_TOOLS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    function persistRecentTools() {
        if (import.meta.server) return;
        try {
            localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(recentTools.value));
        } catch {
            // localStorage unavailable — ignore
        }
    }

    function addRecentTool(slug: string) {
        const filtered = recentTools.value.filter((s) => s !== slug);
        filtered.unshift(slug);
        recentTools.value = filtered.slice(0, MAX_RECENT_TOOLS);
        persistRecentTools();
    }

    function clearRecentTools() {
        recentTools.value = [];
        persistRecentTools();
    }

    // ── Command Palette ──────────────────────────────────────────────
    const commandPaletteOpen = ref(false);

    function toggleCommandPalette() {
        commandPaletteOpen.value = !commandPaletteOpen.value;
    }

    // Hydrate recent tools on client
    if (!import.meta.server) {
        recentTools.value = loadRecentTools();
    }

    return {
        theme: skipHydrate(theme),
        recentTools,
        addRecentTool,
        clearRecentTools,
        commandPaletteOpen,
        toggleCommandPalette,
    };
});
