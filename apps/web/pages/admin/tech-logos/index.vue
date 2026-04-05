<script setup lang="ts">
    import type { ITechLogo } from "@tiny-tools/shared";
    import { Check, Download, Eye, Pencil, Plus, Trash2, X } from "lucide-vue-next";

    definePageMeta({ layout: "admin", middleware: ["admin"] });

    const cms = useCms();
    const toast = useToast();

    const loading = ref(true);
    const error = ref("");
    const logos = ref<ITechLogo[]>([]);
    const deleteConfirmId = ref<string | null>(null);
    const editingId = ref<string | null>(null);
    const showAddForm = ref(false);
    const importing = ref(false);
    const importSlug = ref("");
    const previewLogo = ref<ITechLogo | null>(null);
    const previewBg = ref("#1e3a5f");

    const newForm = reactive({
        name: "",
        slug: "",
        paths: "",
        color: "#000000",
        bgColor: "",
        viewBox: "0 0 24 24",
        fillRule: "evenodd" as "evenodd" | "nonzero",
        source: "manual" as "manual" | "simple-icons",
    });

    const editForm = reactive({
        name: "",
        slug: "",
        paths: "",
        color: "#000000",
        bgColor: "",
        viewBox: "0 0 24 24",
        fillRule: "evenodd" as "evenodd" | "nonzero",
    });

    function parsePaths(raw: string): string[] {
        return raw
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
    }

    function fixPath(d: string): string {
        return /^[Mm]/.test(d.trim()) ? d : `M${d}`;
    }

    function renderSvg(logo: { paths: string | string[]; color: string; viewBox?: string; fillRule?: string }, size = 32): string {
        const paths = Array.isArray(logo.paths) ? logo.paths : parsePaths(logo.paths);
        const rule = logo.fillRule || "evenodd";
        const vb = logo.viewBox || "0 0 24 24";
        const pathEls = paths.map((p) => `<path fill-rule="${rule}" d="${fixPath(p)}"/>`).join("");
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${size}" height="${size}" fill="${logo.color}">${pathEls}</svg>`;
    }

    // Pre-render SVG thumbnails to avoid reactivity loops from v-html
    const logoSvgCache = computed(() => {
        const cache = new Map<string, string>();
        for (const logo of logos.value) {
            cache.set(logo._id, renderSvg(logo, 24));
        }
        return cache;
    });

    async function loadLogos() {
        loading.value = true;
        error.value = "";
        try {
            logos.value = await cms.techLogos.list();
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : "Failed to load logos.";
        } finally {
            loading.value = false;
        }
    }

    async function importFromSimpleIcons() {
        if (!importSlug.value.trim()) return;
        importing.value = true;

        try {
            const slug = importSlug.value.trim().toLowerCase().replace(/[\s.]/g, "");
            const svgUrl = `https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/${slug}.svg`;
            const res = await $fetch<string>(svgUrl, { responseType: "text" });

            // Extract path(s)
            const pathMatches = [...res.matchAll(/d="([^"]+)"/g)];
            if (!pathMatches.length) throw new Error("No paths found in SVG");

            // Extract title
            const titleMatch = res.match(/<title>([^<]+)<\/title>/);

            // Fetch color from _data/simple-icons.json via CDN
            let color = "#000000";
            try {
                const dataUrl = `https://raw.githubusercontent.com/simple-icons/simple-icons/develop/slugs.md`;
                // Try the simpleicons.org API for color
                const iconData = await $fetch<{ hex: string }>(`https://data.simpleicons.org/v4/${slug}`, {
                    responseType: "json",
                }).catch(() => null);
                if (iconData?.hex) {
                    color = `#${iconData.hex}`;
                }
            } catch {
                /* fallback to black */
            }

            newForm.name = titleMatch?.[1] || slug;
            newForm.slug = slug;
            newForm.paths = pathMatches.map((m) => m[1]).join("\n");
            newForm.color = color;
            newForm.viewBox = "0 0 24 24";
            newForm.source = "simple-icons";
            showAddForm.value = true;
            importSlug.value = "";
            toast.success(`Imported "${newForm.name}" from Simple Icons`);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Import failed. Check the slug.");
        } finally {
            importing.value = false;
        }
    }

    async function createLogo() {
        if (!newForm.name || !newForm.paths) return;
        try {
            await cms.techLogos.create({
                name: newForm.name,
                slug: newForm.slug || undefined,
                paths: parsePaths(newForm.paths),
                color: newForm.color,
                bgColor: newForm.bgColor || undefined,
                viewBox: newForm.viewBox || "0 0 24 24",
                fillRule: newForm.fillRule,
                source: newForm.source,
            });
            newForm.name = "";
            newForm.slug = "";
            newForm.paths = "";
            newForm.color = "#000000";
            newForm.bgColor = "";
            newForm.viewBox = "0 0 24 24";
            newForm.fillRule = "evenodd";
            newForm.source = "manual";
            showAddForm.value = false;
            toast.success("Logo created");
            await loadLogos();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to create logo.");
        }
    }

    function startEdit(logo: ITechLogo) {
        editingId.value = logo._id;
        editForm.name = logo.name;
        editForm.slug = logo.slug;
        editForm.paths = logo.paths.join("\n");
        editForm.color = logo.color;
        editForm.bgColor = logo.bgColor || "";
        editForm.viewBox = logo.viewBox || "0 0 24 24";
        editForm.fillRule = (logo.fillRule as "evenodd" | "nonzero") || "evenodd";
    }

    async function saveEdit(id: string) {
        try {
            await cms.techLogos.update(id, {
                name: editForm.name,
                slug: editForm.slug,
                paths: parsePaths(editForm.paths),
                color: editForm.color,
                bgColor: editForm.bgColor || undefined,
                viewBox: editForm.viewBox,
                fillRule: editForm.fillRule,
            });
            editingId.value = null;
            toast.success("Logo updated");
            await loadLogos();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to update logo.");
        }
    }

    async function deleteLogo(id: string) {
        try {
            await cms.techLogos.delete(id);
            deleteConfirmId.value = null;
            toast.success("Logo deleted");
            await loadLogos();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Failed to delete logo.");
        }
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

    onMounted(() => { nextTick(loadLogos); });
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-content">Tech Logos</h1>
      <div class="flex items-center gap-2">
        <!-- Import from Simple Icons -->
        <form class="flex items-center gap-1.5" @submit.prevent="importFromSimpleIcons">
          <input
            v-model="importSlug"
            type="text"
            class="w-40 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            placeholder="e.g. vuedotjs"
          />
          <button
            type="submit"
            :disabled="importing || !importSlug.trim()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-brand-500 text-brand-500 hover:bg-brand-50 transition-colors disabled:opacity-50"
          >
            <Download :size="16" />
            {{ importing ? 'Importing...' : 'Import' }}
          </button>
        </form>
        <button
          v-if="!showAddForm"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors"
          @click="showAddForm = true"
        >
          <Plus :size="16" />
          Add Logo
        </button>
      </div>
    </div>

    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
      {{ error }}
    </div>

    <div class="bg-surface border border-surface-border rounded-xl overflow-hidden">
      <!-- Add form -->
      <div v-if="showAddForm" class="px-4 py-4 bg-surface-secondary border-b border-surface-border">
        <form class="space-y-3" @submit.prevent="createLogo">
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-content-muted mb-1">Name</label>
              <input
                v-model="newForm.name"
                type="text"
                required
                class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                placeholder="Vue.js"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-content-muted mb-1">Slug</label>
              <input
                v-model="newForm.slug"
                type="text"
                class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                placeholder="auto-generated"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-content-muted mb-1">ViewBox</label>
              <input
                v-model="newForm.viewBox"
                type="text"
                class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
          </div>
          <div class="grid grid-cols-4 gap-3">
            <div>
              <label class="block text-xs font-medium text-content-muted mb-1">Color</label>
              <div class="flex items-center gap-2">
                <input v-model="newForm.color" type="color" class="w-8 h-8 rounded border border-gray-300 cursor-pointer" />
                <input v-model="newForm.color" type="text" class="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-content-muted mb-1">BG Color (optional)</label>
              <div class="flex items-center gap-2">
                <input v-model="newForm.bgColor" type="color" class="w-8 h-8 rounded border border-gray-300 cursor-pointer" />
                <input v-model="newForm.bgColor" type="text" class="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-content-muted mb-1">Fill Rule</label>
              <select v-model="newForm.fillRule" class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm outline-none">
                <option value="evenodd">evenodd</option>
                <option value="nonzero">nonzero</option>
              </select>
            </div>
            <div class="flex items-end">
              <div class="p-2 rounded-lg border border-surface-border bg-gray-800 flex items-center justify-center" v-html="renderSvg(newForm, 40)" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-content-muted mb-1">SVG Paths (one per line)</label>
            <textarea
              v-model="newForm.paths"
              required
              rows="4"
              class="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="M12 0C5.373..."
            />
          </div>
          <div class="flex items-center gap-2">
            <button type="submit" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors">
              <Check :size="16" /> Save
            </button>
            <button type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-divider text-content-tertiary hover:bg-surface-secondary transition-colors" @click="showAddForm = false">
              <X :size="16" /> Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- List -->
      <div v-if="loading" class="p-8 text-center text-sm text-content-muted">Loading...</div>
      <div v-else-if="logos.length === 0 && !showAddForm" class="p-8 text-center text-sm text-content-muted">No logos yet. Add one or import from Simple Icons.</div>
      <table v-else-if="logos.length > 0" class="w-full text-sm">
        <thead>
          <tr class="border-b border-surface-border text-left">
            <th class="px-4 py-3 font-medium text-content-muted w-16">Preview</th>
            <th class="px-4 py-3 font-medium text-content-muted">Name</th>
            <th class="px-4 py-3 font-medium text-content-muted">Slug</th>
            <th class="px-4 py-3 font-medium text-content-muted w-20">Color</th>
            <th class="px-4 py-3 font-medium text-content-muted w-16">Source</th>
            <th class="px-4 py-3 font-medium text-content-muted w-24">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-border">
          <tr v-for="logo in logos" :key="logo._id">
            <template v-if="editingId !== logo._id">
              <td class="px-4 py-3">
                <div class="w-8 h-8 rounded bg-gray-800 flex items-center justify-center" v-html="logoSvgCache.get(logo._id)" />
              </td>
              <td class="px-4 py-3 font-medium text-content">{{ logo.name }}</td>
              <td class="px-4 py-3 text-content-muted font-mono text-xs">{{ logo.slug }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded-full border border-gray-300" :style="{ background: logo.color }" />
                  <span class="text-xs text-content-muted">{{ logo.color }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-xs text-content-muted">{{ logo.source || '—' }}</td>
              <td class="px-4 py-3">
                <div v-if="deleteConfirmId !== logo._id" class="flex items-center gap-1">
                  <button class="p-1 text-gray-500 hover:text-blue-500 transition-colors" title="Preview" @click="previewLogo = logo; previewBg = logo.bgColor || '#1e3a5f'">
                    <Eye :size="14" />
                  </button>
                  <button class="p-1 text-gray-500 hover:text-brand-500 transition-colors" title="Edit" @click="startEdit(logo)">
                    <Pencil :size="14" />
                  </button>
                  <button class="p-1 text-gray-500 hover:text-red-500 transition-colors" title="Delete" @click="deleteConfirmId = logo._id">
                    <Trash2 :size="14" />
                  </button>
                </div>
                <div v-else class="flex items-center gap-1">
                  <button class="px-2 py-0.5 text-xs rounded bg-red-500 text-white hover:bg-red-600" @click="deleteLogo(logo._id)">Delete</button>
                  <button class="px-2 py-0.5 text-xs rounded border border-divider text-content-tertiary hover:bg-surface-secondary" @click="deleteConfirmId = null">Cancel</button>
                </div>
              </td>
            </template>

            <!-- Edit mode -->
            <template v-else>
              <td class="px-4 py-2">
                <div class="w-8 h-8 rounded bg-gray-800 flex items-center justify-center" v-html="renderSvg(editForm, 24)" />
              </td>
              <td class="px-4 py-2" colspan="4">
                <div class="space-y-2">
                  <div class="grid grid-cols-3 gap-2">
                    <input v-model="editForm.name" type="text" class="px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-sm outline-none" placeholder="Name" />
                    <input v-model="editForm.slug" type="text" class="px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-sm font-mono outline-none" placeholder="Slug" />
                    <input v-model="editForm.viewBox" type="text" class="px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-sm outline-none" placeholder="ViewBox" />
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="flex items-center gap-1">
                      <input v-model="editForm.color" type="color" class="w-6 h-6 rounded border border-gray-300 cursor-pointer" />
                      <input v-model="editForm.color" type="text" class="flex-1 px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-xs outline-none" />
                    </div>
                    <div class="flex items-center gap-1">
                      <input v-model="editForm.bgColor" type="color" class="w-6 h-6 rounded border border-gray-300 cursor-pointer" />
                      <input v-model="editForm.bgColor" type="text" class="flex-1 px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-xs outline-none" placeholder="BG color" />
                    </div>
                    <select v-model="editForm.fillRule" class="px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-sm outline-none">
                      <option value="evenodd">evenodd</option>
                      <option value="nonzero">nonzero</option>
                    </select>
                  </div>
                  <textarea v-model="editForm.paths" rows="3" class="w-full px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-xs font-mono outline-none" />
                </div>
              </td>
              <td class="px-4 py-2">
                <div class="flex items-center gap-1">
                  <button class="p-1 text-green-600 hover:text-green-700 transition-colors" title="Save" @click="saveEdit(logo._id)">
                    <Check :size="16" />
                  </button>
                  <button class="p-1 text-gray-500 hover:text-gray-600 transition-colors" title="Cancel" @click="editingId = null">
                    <X :size="16" />
                  </button>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Preview Modal -->
    <div
      v-if="previewLogo"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="previewLogo = null"
        >
          <div class="absolute inset-0 bg-black/50" />
          <div class="relative bg-surface border border-surface-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-surface-border">
              <h3 class="text-lg font-semibold text-content">{{ previewLogo.name }}</h3>
              <button class="p-1 text-content-muted hover:text-content transition-colors" @click="previewLogo = null">
                <X :size="20" />
              </button>
            </div>

            <div class="p-6 space-y-6">
              <!-- OG Image style preview -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-medium text-content-muted">OG Image Preview</span>
                  <div class="flex items-center gap-2">
                    <label class="text-xs text-content-muted">Background:</label>
                    <input v-model="previewBg" type="color" class="w-6 h-6 rounded border border-gray-300 cursor-pointer" />
                    <input v-model="previewBg" type="text" class="w-20 px-2 py-1 rounded border border-gray-300 bg-white text-gray-900 text-xs outline-none" />
                  </div>
                </div>
                <div
                  class="rounded-xl overflow-hidden aspect-video flex items-end p-8 relative"
                  :style="{ background: `linear-gradient(135deg, ${previewBg} 0%, ${adjustColor(previewBg, -20)} 100%)` }"
                >
                  <!-- Watermark logo -->
                  <div
                    class="absolute right-8 bottom-8 opacity-15"
                    v-html="renderSvg(previewLogo!, 120)"
                  />
                  <!-- Small logo + title -->
                  <div class="flex items-center gap-4 relative z-10">
                    <div v-html="renderSvg(previewLogo!, 48)" />
                    <div class="text-white text-2xl font-bold">Sample Blog Title</div>
                  </div>
                </div>
              </div>

              <!-- Card Image style preview -->
              <div>
                <span class="text-xs font-medium text-content-muted mb-2 block">Card Thumbnail Preview</span>
                <div class="flex gap-4">
                  <div
                    class="rounded-xl overflow-hidden w-48 aspect-video flex items-center justify-center relative"
                    :style="{ background: `linear-gradient(135deg, ${previewBg} 0%, ${adjustColor(previewBg, -20)} 100%)` }"
                  >
                    <div v-html="renderSvg(previewLogo!, 56)" />
                    <UiLogoIcon :size="16" class="absolute bottom-12 left-12 text-white/40" />
                  </div>
                  <!-- Size variants -->
                  <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-3">
                      <div class="p-3 rounded-lg bg-gray-900" v-html="renderSvg(previewLogo!, 40)" />
                      <div class="p-3 rounded-lg bg-white border border-gray-200" v-html="renderSvg(previewLogo!, 40)" />
                      <div class="p-3 rounded-lg" :style="{ background: previewBg }" v-html="renderSvg(previewLogo!, 40)" />
                    </div>
                    <div class="text-xs text-content-muted">
                      <span class="font-medium">Slug:</span> <code class="bg-surface-secondary px-1 rounded">{{ previewLogo!.slug }}</code>
                      &middot; <span class="font-medium">Color:</span> <span class="inline-block w-3 h-3 rounded-full align-middle" :style="{ background: previewLogo!.color }" /> {{ previewLogo!.color }}
                      &middot; <span class="font-medium">Fill rule:</span> {{ previewLogo!.fillRule || 'evenodd' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  </div>
</template>
