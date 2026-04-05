<script setup lang="ts">
    import type { ITechLogo } from "@tiny-tools/shared";
    import { RefreshCw } from "lucide-vue-next";

    const props = defineProps<{
        title: string;
        category: string;
        techLogo: string;
        logoColor: string;
        bgColor: string;
        bgColorTo: string;
        pickboxColor: string;
    }>();

    const emit = defineEmits<{
        "update:techLogo": [value: string];
        "update:logoColor": [value: string];
        "update:bgColor": [value: string];
        "update:bgColorTo": [value: string];
        "update:pickboxColor": [value: string];
    }>();

    const cms = useCms();
    const logos = ref<ITechLogo[]>([]);
    const loaded = ref(false);

    const selectedLogo = computed(() => logos.value.find((l) => l._id === props.techLogo));

    async function loadLogos() {
        if (loaded.value) return;
        try {
            logos.value = await cms.techLogos.list();
            loaded.value = true;
        } catch { /* silent */ }
    }

    onMounted(loadLogos);

    // Resolved colors with defaults
    const resolvedLogoColor = computed(() => props.logoColor || selectedLogo.value?.color || "#ffffff");
    const resolvedBgFrom = computed(() => props.bgColor || selectedLogo.value?.bgColor || "#1e3a5f");
    const resolvedBgTo = computed(() => props.bgColorTo || adjustColor(resolvedBgFrom.value, -20));
    const resolvedPickbox = computed(() => props.pickboxColor || "#ffffff");

    function fixPath(d: string): string {
        return /^[Mm]/.test(d.trim()) ? d : `M${d}`;
    }

    function renderTechLogo(size: number, color?: string): string {
        const logo = selectedLogo.value;
        if (!logo) return "";
        const rule = logo.fillRule || "evenodd";
        const vb = logo.viewBox || "0 0 24 24";
        const c = color || resolvedLogoColor.value;
        const pathEls = logo.paths.map((p: string) => `<path fill-rule="${rule}" d="${fixPath(p)}"/>`).join("");
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${size}" height="${size}" fill="${c}">${pathEls}</svg>`;
    }

    function adjustColor(hex: string, amount: number): string {
        const clean = hex.replace("#", "");
        const num = parseInt(clean, 16);
        if (isNaN(num)) return hex;
        const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
        const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
        const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
    }

    const gradientBg = computed(() =>
        `linear-gradient(135deg, ${resolvedBgFrom.value} 0%, ${resolvedBgTo.value} 100%)`
    );

    function resetColors() {
        emit("update:logoColor", "");
        emit("update:bgColor", "");
        emit("update:bgColorTo", "");
        emit("update:pickboxColor", "");
    }
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-content-secondary">Cover Preview</label>
      <button
        type="button"
        class="text-xs text-content-faint hover:text-content-muted flex items-center gap-1"
        title="Reset to defaults"
        @click="resetColors"
      >
        <RefreshCw :size="12" />
        Reset
      </button>
    </div>

    <!-- Logo picker -->
    <AdminLogoPicker :model-value="props.techLogo" label="Tech Logo" @update:model-value="emit('update:techLogo', $event)" />

    <!-- Color controls -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="block text-xs text-content-muted mb-1">Logo Color</label>
        <div class="flex items-center gap-1">
          <input :value="resolvedLogoColor" type="color" class="w-6 h-6 rounded border border-gray-300 cursor-pointer" @input="emit('update:logoColor', ($event.target as HTMLInputElement).value)" />
          <input
            :value="props.logoColor"
            type="text"
            class="flex-1 w-0 px-1.5 py-1 rounded border border-gray-300 bg-white text-gray-900 text-xs outline-none"
            :placeholder="selectedLogo?.color || 'auto'"
            @input="emit('update:logoColor', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
      <div>
        <label class="block text-xs text-content-muted mb-1">Pickbox Color</label>
        <div class="flex items-center gap-1">
          <input :value="resolvedPickbox" type="color" class="w-6 h-6 rounded border border-gray-300 cursor-pointer" @input="emit('update:pickboxColor', ($event.target as HTMLInputElement).value)" />
          <input
            :value="props.pickboxColor"
            type="text"
            class="flex-1 w-0 px-1.5 py-1 rounded border border-gray-300 bg-white text-gray-900 text-xs outline-none"
            placeholder="#ffffff"
            @input="emit('update:pickboxColor', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
      <div>
        <label class="block text-xs text-content-muted mb-1">BG From</label>
        <div class="flex items-center gap-1">
          <input :value="resolvedBgFrom" type="color" class="w-6 h-6 rounded border border-gray-300 cursor-pointer" @input="emit('update:bgColor', ($event.target as HTMLInputElement).value)" />
          <input
            :value="props.bgColor"
            type="text"
            class="flex-1 w-0 px-1.5 py-1 rounded border border-gray-300 bg-white text-gray-900 text-xs outline-none"
            placeholder="#1e3a5f"
            @input="emit('update:bgColor', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
      <div>
        <label class="block text-xs text-content-muted mb-1">BG To</label>
        <div class="flex items-center gap-1">
          <input :value="resolvedBgTo" type="color" class="w-6 h-6 rounded border border-gray-300 cursor-pointer" @input="emit('update:bgColorTo', ($event.target as HTMLInputElement).value)" />
          <input
            :value="props.bgColorTo"
            type="text"
            class="flex-1 w-0 px-1.5 py-1 rounded border border-gray-300 bg-white text-gray-900 text-xs outline-none"
            placeholder="auto"
            @input="emit('update:bgColorTo', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>

    <!-- OG Image Preview -->
    <div>
      <span class="text-xs text-content-faint mb-1 block">OG / Cover Image</span>
      <div
        class="rounded-lg overflow-hidden aspect-video relative p-4 flex flex-col"
        :style="{ background: gradientBg }"
      >
        <!-- Decorative circle -->
        <div class="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5" />
        <div class="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/[0.03]" />

        <!-- Pickbox logo + name -->
        <div class="flex items-center gap-2 relative z-10">
          <UiLogoIcon :size="20" :style="{ color: resolvedPickbox }" />
          <span class="text-xs font-bold" :style="{ color: resolvedPickbox, opacity: 0.9 }">pickbox</span>
        </div>

        <div class="flex-1" />

        <!-- Watermark tech logo -->
        <div
          v-if="selectedLogo"
          class="absolute right-4 bottom-4 opacity-15"
          v-html="renderTechLogo(80)"
        />

        <!-- Title row -->
        <div class="flex items-center gap-2 relative z-10">
          <div v-if="selectedLogo" v-html="renderTechLogo(24)" />
          <span class="text-white font-bold text-sm leading-tight line-clamp-2" style="max-width: 85%">
            {{ title || 'Blog Post Title' }}
          </span>
        </div>

        <!-- Category badge -->
        <div v-if="category" class="mt-2 relative z-10">
          <span class="text-xs text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
            {{ category }}
          </span>
        </div>
      </div>
    </div>

    <!-- Card Image Preview -->
    <div>
      <span class="text-xs text-content-faint mb-1 block">Card Thumbnail</span>
      <div class="flex gap-3">
        <div
          class="rounded-lg overflow-hidden w-32 aspect-video flex items-center justify-center relative"
          :style="{ background: gradientBg }"
        >
          <div v-if="selectedLogo" v-html="renderTechLogo(36)" />
          <UiLogoIcon v-else :size="28" :style="{ color: resolvedPickbox, opacity: 0.8 }" />
          <UiLogoIcon :size="10" class="absolute bottom-1.5 left-2" :style="{ color: resolvedPickbox, opacity: 0.5 }" />
        </div>
        <div
          class="rounded-lg overflow-hidden w-32 aspect-video flex items-center justify-center relative bg-gray-900"
        >
          <div v-if="selectedLogo" v-html="renderTechLogo(36)" />
          <UiLogoIcon v-else :size="28" class="text-white/80" />
        </div>
      </div>
    </div>
  </div>
</template>
