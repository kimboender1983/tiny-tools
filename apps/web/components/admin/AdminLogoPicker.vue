<script setup lang="ts">
    import type { ITechLogo } from "@tiny-tools/shared";
    import { ChevronDown, X } from "lucide-vue-next";

    const model = defineModel<string>({ default: "" });
    defineProps<{ label?: string }>();

    const cms = useCms();
    const open = ref(false);
    const search = ref("");
    const logos = ref<ITechLogo[]>([]);
    const loaded = ref(false);

    const selected = computed(() => logos.value.find((l) => l._id === model.value));

    const filtered = computed(() => {
        if (!search.value) return logos.value;
        const q = search.value.toLowerCase();
        return logos.value.filter(
            (l) => l.name.toLowerCase().includes(q) || l.slug.toLowerCase().includes(q),
        );
    });

    function fixPath(d: string): string {
        return /^[Mm]/.test(d.trim()) ? d : `M${d}`;
    }

    function renderSvg(logo: ITechLogo, size = 20): string {
        const rule = logo.fillRule || "evenodd";
        const vb = logo.viewBox || "0 0 24 24";
        const pathEls = logo.paths.map((p) => `<path fill-rule="${rule}" d="${fixPath(p)}"/>`).join("");
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${size}" height="${size}" fill="${logo.color}">${pathEls}</svg>`;
    }

    function select(logo: ITechLogo) {
        model.value = logo._id;
        open.value = false;
        search.value = "";
    }

    function clear() {
        model.value = "";
    }

    async function loadLogos() {
        if (loaded.value) return;
        try {
            logos.value = await cms.techLogos.list();
            loaded.value = true;
        } catch {
            /* silent */
        }
    }

    watch(open, (v) => {
        if (v) loadLogos();
    });

    function onClickOutside(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-logo-picker]")) {
            open.value = false;
        }
    }

    watch(open, (v) => {
        if (v) {
            document.addEventListener("click", onClickOutside, { capture: true });
        } else {
            document.removeEventListener("click", onClickOutside, { capture: true });
        }
    });
</script>

<template>
  <div data-logo-picker>
    <label v-if="label" class="block text-sm font-medium text-content-secondary mb-1">{{ label }}</label>
    <div class="relative">
      <button
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm text-left hover:border-brand-500 transition-colors"
        @click.stop="open = !open"
      >
        <template v-if="selected">
          <span class="flex-shrink-0" v-html="renderSvg(selected, 18)" />
          <span class="flex-1 truncate">{{ selected.name }}</span>
          <button type="button" class="p-0.5 text-gray-400 hover:text-gray-600" @click.stop="clear">
            <X :size="14" />
          </button>
        </template>
        <template v-else>
          <span class="flex-1 text-gray-400">Select logo...</span>
          <ChevronDown :size="14" class="text-gray-400" />
        </template>
      </button>

      <div
        v-if="open"
        class="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden"
      >
        <div class="p-2 border-b border-gray-100">
          <input
            v-model="search"
            type="text"
            class="w-full px-2 py-1.5 rounded border border-gray-200 text-sm outline-none focus:border-brand-500"
            placeholder="Search logos..."
            @click.stop
          />
        </div>
        <div class="overflow-y-auto max-h-48">
          <button
            v-for="logo in filtered"
            :key="logo._id"
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            :class="logo._id === model ? 'bg-brand-50 text-brand-600' : 'text-gray-700'"
            @click.stop="select(logo)"
          >
            <span class="flex-shrink-0" v-html="renderSvg(logo, 18)" />
            <span class="truncate">{{ logo.name }}</span>
            <span class="ml-auto text-xs text-gray-400 font-mono">{{ logo.slug }}</span>
          </button>
          <div v-if="filtered.length === 0" class="px-3 py-4 text-center text-sm text-gray-400">
            No logos found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
